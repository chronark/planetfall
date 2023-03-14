const withMarkdoc = require("@markdoc/next.js")();
const { withAxiom } = require("next-axiom");
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "mdx", "md"],
  images: {
    domains: ["www.gravatar.com", "avatars.githubusercontent.com", "images.clerk.dev"],
  },
  transpilePackages: ["@planetfall/emails"],
  experimental: {
    appDir: true,
    esmExternals: "loose",
    // typedRoutes: true,
    serverComponentsExternalPackages: ["@planetfall/db", "@prisma/client", "@tremor/react"],
  },
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true;
    return config;
  },
};

module.exports = withAxiom(withMarkdoc(nextConfig));
