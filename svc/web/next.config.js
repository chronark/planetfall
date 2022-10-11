const withTM = require("next-transpile-modules")(
  [
    "@planetfall/db",
    "@planetfall/id",
    "@planetfall/permissions",
  ],
);

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
};

module.exports = withTM(nextConfig);
