/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@planetfall/db", "@prisma/client"]
  },
}

module.exports = nextConfig
