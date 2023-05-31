/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/:match*",
        destination: "/api/v1/:match*",
      },
    ];
  },
};

export default nextConfig;
