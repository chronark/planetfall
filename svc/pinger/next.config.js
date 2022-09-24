/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  redirects: () => [{
    source: "/",
    destination: "/results/vercel-serverless/read/1kb",
    permanent: false,
  }],
};

module.exports = nextConfig;
