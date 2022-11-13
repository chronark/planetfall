const withMarkdoc = require("@markdoc/next.js")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "md", "tsx", "jsx"],
  images: {
    domains: ["images.clerk.dev", "www.gravatar.com"],
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@planetfall/db", "@prisma/client"],
  },
};

module.exports = withMarkdoc(nextConfig);
