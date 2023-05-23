/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: () => [
    {
      source: "/api",
      destination: "/",
    },
    {
      source: "/:match*",
      destination: "/api/:match*",
    },
  ],
};

module.exports = nextConfig;
