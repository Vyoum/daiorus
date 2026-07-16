import { getMediaLibraryContent } from '../../../../lib/site-content';
import MediaLibraryEditor from './MediaLibraryEditor';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const content = await getMediaLibraryContent();
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      material: true,
      tag: true,
      description: true,
      priceInr: true,
      imageUrl: true,
      images: true,
    },
  });

  return <MediaLibraryEditor initialContent={content} products={products} />;
}
