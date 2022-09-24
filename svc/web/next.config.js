const withTM = require("next-transpile-modules")(
  [
    "@planetfall/db",
  ],
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    newNextLinkBehavior: true,
    scrollRestoration: true,
    images: {
      allowFutureImage: true,
    },
  },
};

module.exports = withTM(nextConfig);
