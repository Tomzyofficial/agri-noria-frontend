import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
   turbopack: {
      root: __dirname,
   },
   eslint: {
      ignoreDuringBuilds: true,
   },
   images: {
      remotePatterns: [new URL("https://res.cloudinary.com/debemjvza/image/upload/**")],
   },
};

export default nextConfig;
