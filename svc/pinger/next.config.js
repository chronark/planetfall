const withTM = require("next-transpile-modules")(
  ["@planetfall/ping"],
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
};

module.exports = withTM(nextConfig);
