const withTM = require("next-transpile-modules")(
  [],
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,

  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
};

module.exports = withTM(nextConfig);
