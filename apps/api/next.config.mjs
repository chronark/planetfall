/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:match*",
        has: [
          {
            type: "host",
            value: "api.planetfall.io",
          },
        ],
        destination: "/api/:match*",
      },
    ];
  },
};

export default nextConfig;
