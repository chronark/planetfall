// const withTM = require("next-transpile-modules")(
//   [
//     "@planetfall/db",
//     "@planetfall/id",
//     "@planetfall/permissions",
//   ],
// );

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    newNextLinkBehavior: true,
    scrollRestoration: true,
  },
  images: {
    domains: [
      "www.gravatar.com",
      "avatars.githubusercontent.com",
      "ui-avatars.com",
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  rewrites: async () => [
    {
      /**
       * the docs currently use nextjs zones to run in a different app
       * It was too hard to make it work in a single app, because it didn't pick up the md files properly
       */
      source: "/docs/:path*",
      destination: `${
        process.env.DOCS_URL ?? "http://localhost:3001"
      }/docs/:path*`,
    },
  ],
};

module.exports = nextConfig;
