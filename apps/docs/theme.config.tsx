import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

import { useConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Planetfall</span>,

  logoLink: "https://planetfall.io/logo.png",
  primaryHue: {
    light: 255,
    dark: 122,
  },
  darkMode: false,
  gitTimestamp: true,
  feedback: {},
  docsRepositoryBase: "https://github.com/chronark/planetfall/tree/main/apps/docs/",
  footer: {
    text: "Planetfall Docs",
  },
  head: () => {
    const { asPath } = useRouter();
    const { frontMatter } = useConfig();

    return (
      <>
        <meta property="og:url" content={`https://planetfall.io${asPath}`} />
        <meta property="og:title" content={frontMatter.title || "Planetfall"} />
        <meta
          property="og:description"
          content={frontMatter.description || "Global Latency Monitoring"}
        />
        <script
          src="https://beamanalytics.b-cdn.net/beam.min.js"
          data-token="e08d63f1-631b-4eeb-89b3-7799fedde74f"
          async
        />
      </>
    );
  },
};

export default config;
