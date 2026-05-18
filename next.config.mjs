/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
      globalNotFound: true,
   },
   eslint: {
      ignoreDuringBuilds: true,
   },
   images: {
      remotePatterns: [new URL("https://res.cloudinary.com/debemjvza/image/upload/**")],
   },
};

export default nextConfig;
