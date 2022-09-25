const withTM = require("next-transpile-modules")(
  [
    "@planetfall/db",
    "@planetfall/id",
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
    domains: ["images.clerk.dev", "www.gravatar.com"],
  },

  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
};

module.exports = withTM(nextConfig);
