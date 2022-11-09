/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    domains:["images.clerk.dev"]
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@planetfall/db", "@prisma/client"],
  },
};

module.exports = nextConfig;
