import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import { withAxiom } from "next-axiom";

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("@sentry/nextjs").SentryWebpackPluginOptions} */

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.

  release: process.env.VERCEL_GIT_COMMIT_SHA || "development",
};

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "mdx", "md"],
  images: {
    domains: ["www.gravatar.com", "avatars.githubusercontent.com", "images.clerk.dev"],
  },
  rewrites: () => [
    {
      source: "/docs",
      destination: "https://planetfall.mintlify.dev/docs",
    },
    {
      source: "/docs/:match*",
      destination: "https://planetfall.mintlify.dev/docs/:match*",
    },
  ],
  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,
  },
  transpilePackages: ["@planetfall/emails"],
  experimental: {
    appDir: true,
    esmExternals: "loose",
    // typedRoutes: true,
    serverActions: true,

    serverComponentsExternalPackages: ["@planetfall/db", "@prisma/client"],
  },
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true;
    config.plugins = [...config.plugins, new PrismaPlugin()];
    return config;
  },
};

export default withSentryConfig(withAxiom(nextConfig), sentryWebpackPluginOptions);
