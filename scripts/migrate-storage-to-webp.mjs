/**
 * Convert existing Supabase Storage images to WebP (q=85, max 1600px)
 * and rewrite database URLs that point at the old files.
 *
 * Usage:
 *   node scripts/migrate-storage-to-webp.mjs              # dry-run (default)
 *   node scripts/migrate-storage-to-webp.mjs --apply       # convert + rewrite DB
 *   node scripts/migrate-storage-to-webp.mjs --apply --delete-old
 *
 * Requires .env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

config({ path: path.join(root, '.env.local') });
config({ path: path.join(root, '.env') });

const BUCKET = 'product-images';
const MAX_WIDTH = 1600;
const QUALITY = 85;
const SKIP_WEBP_UNDER_BYTES = 250 * 1024; // already-small WebP: leave alone

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov']);

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const DELETE_OLD = args.has('--delete-old');

function log(...parts) {
  console.log(...parts);
}

function extOf(name = '') {
  return String(name).split('.').pop()?.toLowerCase() || '';
}

function toWebpPath(objectPath) {
  const i = objectPath.lastIndexOf('.');
  if (i <= 0) return `${objectPath}.webp`;
  return `${objectPath.slice(0, i)}.webp`;
}

function publicUrl(supabase, objectPath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return data?.publicUrl || null;
}

function mimeFromExt(ext) {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

async function listAllFiles(supabase, prefix = '') {
  const out = [];
  const queue = [prefix];

  while (queue.length) {
    const folder = queue.shift();
    let offset = 0;
    const limit = 100;

    for (;;) {
      const { data, error } = await supabase.storage.from(BUCKET).list(folder || undefined, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });
      if (error) throw new Error(`list ${folder || '/'}: ${error.message}`);
      if (!data?.length) break;

      for (const entry of data) {
        const fullPath = folder ? `${folder}/${entry.name}` : entry.name;
        // Folders have id null and no metadata size in some API versions
        const isFolder = entry.id == null && !entry.metadata;
        if (isFolder || (entry.metadata == null && !IMAGE_EXT.has(extOf(entry.name)) && !VIDEO_EXT.has(extOf(entry.name)))) {
          // Heuristic: if no metadata and not a known file ext, treat as folder
          if (!IMAGE_EXT.has(extOf(entry.name)) && !VIDEO_EXT.has(extOf(entry.name))) {
            queue.push(fullPath);
            continue;
          }
        }

        const size = Number(entry.metadata?.size) || 0;
        out.push({ path: fullPath, name: entry.name, size });
      }

      if (data.length < limit) break;
      offset += limit;
    }
  }

  return out;
}

async function optimizeToWebp(buffer, inputMime) {
  const mime = String(inputMime || 'image/jpeg').toLowerCase();

  if (mime === 'image/gif') {
    const meta = await sharp(buffer, { animated: true }).metadata();
    if (meta.pages && meta.pages > 1) {
      return {
        skip: true,
        reason: 'animated gif kept as-is',
      };
    }
  }

  const out = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  return { buffer: out, mime: 'image/webp', skip: false };
}

function replaceAllUrls(value, urlMap) {
  if (value == null) return { value, changed: false };
  if (typeof value === 'string') {
    let next = value;
    let changed = false;
    for (const [from, to] of urlMap) {
      if (next.includes(from)) {
        next = next.split(from).join(to);
        changed = true;
      }
    }
    return { value: next, changed };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const r = replaceAllUrls(item, urlMap);
      if (r.changed) changed = true;
      return r.value;
    });
    return { value: next, changed };
  }
  if (typeof value === 'object') {
    let changed = false;
    const next = {};
    for (const [k, v] of Object.entries(value)) {
      const r = replaceAllUrls(v, urlMap);
      if (r.changed) changed = true;
      next[k] = r.value;
    }
    return { value: next, changed };
  }
  return { value, changed: false };
}

async function rewriteDatabase(prisma, urlMap) {
  if (!urlMap.length) {
    log('DB: no URL rewrites needed');
    return { products: 0, categories: 0, siteContent: 0, orderItems: 0 };
  }

  let products = 0;
  let categories = 0;
  let siteContent = 0;
  let orderItems = 0;

  const allProducts = await prisma.product.findMany({
    select: { id: true, imageUrl: true, images: true },
  });
  for (const row of allProducts) {
    const imageUrl = replaceAllUrls(row.imageUrl, urlMap);
    const images = replaceAllUrls(row.images || [], urlMap);
    if (!imageUrl.changed && !images.changed) continue;
    products += 1;
    if (APPLY) {
      await prisma.product.update({
        where: { id: row.id },
        data: {
          imageUrl: imageUrl.value,
          images: images.value,
        },
      });
    }
  }

  const allCategories = await prisma.category.findMany({
    select: { id: true, imageUrl: true, heroImageUrl: true },
  });
  for (const row of allCategories) {
    const imageUrl = replaceAllUrls(row.imageUrl, urlMap);
    const heroImageUrl = replaceAllUrls(row.heroImageUrl, urlMap);
    if (!imageUrl.changed && !heroImageUrl.changed) continue;
    categories += 1;
    if (APPLY) {
      await prisma.category.update({
        where: { id: row.id },
        data: {
          imageUrl: imageUrl.value,
          heroImageUrl: heroImageUrl.value,
        },
      });
    }
  }

  const allContent = await prisma.siteContent.findMany({
    select: { id: true, imageUrl: true, metadata: true },
  });
  for (const row of allContent) {
    const imageUrl = replaceAllUrls(row.imageUrl, urlMap);
    const metadata = replaceAllUrls(row.metadata, urlMap);
    if (!imageUrl.changed && !metadata.changed) continue;
    siteContent += 1;
    if (APPLY) {
      await prisma.siteContent.update({
        where: { id: row.id },
        data: {
          imageUrl: imageUrl.value,
          metadata: metadata.value,
        },
      });
    }
  }

  const allOrderItems = await prisma.orderItem.findMany({
    select: { id: true, imageUrl: true },
  });
  for (const row of allOrderItems) {
    const imageUrl = replaceAllUrls(row.imageUrl, urlMap);
    if (!imageUrl.changed) continue;
    orderItems += 1;
    if (APPLY) {
      await prisma.orderItem.update({
        where: { id: row.id },
        data: { imageUrl: imageUrl.value },
      });
    }
  }

  return { products, categories, siteContent, orderItems };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!url || !key || key === 'your_supabase_service_role_key') {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL');
  }

  log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}${DELETE_OLD && APPLY ? ' + delete old files' : ''}`);
  log(`Bucket: ${BUCKET}`);
  log(`Target: WebP q=${QUALITY}, max width ${MAX_WIDTH}px\n`);

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 3,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const files = await listAllFiles(supabase);
    const candidates = files.filter((f) => {
      const ext = extOf(f.name);
      if (VIDEO_EXT.has(ext)) return false;
      if (!IMAGE_EXT.has(ext)) return false;
      if (ext === 'webp' && f.size > 0 && f.size < SKIP_WEBP_UNDER_BYTES) return false;
      return true;
    });

    log(`Found ${files.length} storage objects, ${candidates.length} image candidates\n`);

    const urlMap = [];
    let converted = 0;
    let skipped = 0;
    let failed = 0;
    let bytesIn = 0;
    let bytesOut = 0;
    const oldPathsToDelete = [];

    for (const file of candidates) {
      const ext = extOf(file.path);
      const oldUrl = publicUrl(supabase, file.path);
      const nextPath = ext === 'webp' ? file.path : toWebpPath(file.path);

      try {
        const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(file.path);
        if (dlErr || !blob) {
          throw new Error(dlErr?.message || 'download failed');
        }

        const input = Buffer.from(await blob.arrayBuffer());
        bytesIn += input.length;

        const result = await optimizeToWebp(input, mimeFromExt(ext));
        if (result.skip) {
          skipped += 1;
          log(`SKIP  ${file.path} (${result.reason})`);
          continue;
        }

        const saved = result.buffer.length;
        const ratio = input.length ? ((1 - saved / input.length) * 100).toFixed(1) : '0';
        bytesOut += saved;

        if (!APPLY) {
          converted += 1;
          log(
            `PLAN  ${file.path} → ${nextPath}  ${formatBytes(input.length)} → ${formatBytes(saved)} (−${ratio}%)`,
          );
          if (oldUrl) {
            const newUrl = publicUrl(supabase, nextPath);
            if (newUrl && oldUrl !== newUrl) urlMap.push([oldUrl, newUrl]);
          }
          continue;
        }

        const { error: upErr } = await supabase.storage.from(BUCKET).upload(nextPath, result.buffer, {
          contentType: 'image/webp',
          upsert: true,
          cacheControl: '31536000',
        });
        if (upErr) throw new Error(upErr.message);

        const newUrl = publicUrl(supabase, nextPath);
        if (oldUrl && newUrl && oldUrl !== newUrl) {
          urlMap.push([oldUrl, newUrl]);
        }

        if (DELETE_OLD && nextPath !== file.path) {
          oldPathsToDelete.push(file.path);
        }

        converted += 1;
        log(
          `OK    ${file.path} → ${nextPath}  ${formatBytes(input.length)} → ${formatBytes(saved)} (−${ratio}%)`,
        );
      } catch (err) {
        failed += 1;
        log(`FAIL  ${file.path}: ${err.message || err}`);
      }
    }

    log('\n--- Database URL rewrite ---');
    const dbStats = await rewriteDatabase(prisma, urlMap);
    log(
      `Products: ${dbStats.products}, Categories: ${dbStats.categories}, Site content: ${dbStats.siteContent}, Order items: ${dbStats.orderItems}`,
    );

    if (APPLY && DELETE_OLD && oldPathsToDelete.length) {
      log(`\nDeleting ${oldPathsToDelete.length} old objects…`);
      // Supabase remove accepts batches
      for (let i = 0; i < oldPathsToDelete.length; i += 50) {
        const chunk = oldPathsToDelete.slice(i, i + 50);
        const { error } = await supabase.storage.from(BUCKET).remove(chunk);
        if (error) log(`Delete warning: ${error.message}`);
      }
    }

    log('\n--- Summary ---');
    log(`Converted: ${converted}`);
    log(`Skipped:   ${skipped}`);
    log(`Failed:    ${failed}`);
    log(`Input:     ${formatBytes(bytesIn)}`);
    log(`Output:    ${formatBytes(bytesOut)}`);
    if (bytesIn > 0) {
      log(`Saved:     ${formatBytes(bytesIn - bytesOut)} (${(((bytesIn - bytesOut) / bytesIn) * 100).toFixed(1)}%)`);
    }

    if (!APPLY) {
      log('\nDry-run only. Re-run with --apply to write WebP files and update the database.');
      log('Add --delete-old with --apply to remove original JPG/PNG after conversion.');
    } else {
      log('\nDone. Also update any hardcoded Supabase JPG URLs in lib/data.js / lib/site-content-defaults.js if those files are still referenced.');
    }
  } finally {
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
