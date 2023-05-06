import { withAxiom } from "next-axiom";

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "mdx", "md"],
  images: {
    domains: ["www.gravatar.com", "avatars.githubusercontent.com", "images.clerk.dev"],
  },
  rewrites: () => [
    {
      source: "/docs",
      destination: "https://planetfall-docs.vercel.app/docs",
    },
    {
      source: "/docs/:match*",
      destination: "https://planetfall-docs.vercel.app/docs/:match*",
    },
  ],
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

export default withAxiom(nextConfig);
