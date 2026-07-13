import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Parent folder also has a package-lock.json; pin Turbopack to this app.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
