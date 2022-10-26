/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    "serverComponentsExternalPackages":["@prisma/client"],
    transpilePackages: []
    },
}

module.exports = nextConfig
