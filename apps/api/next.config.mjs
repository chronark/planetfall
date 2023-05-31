/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/:slug*",
        destination: "/api/v1/:slug*", // Matched parameters can be used in the destination
      },
    ];
  },
};

export default nextConfig;
