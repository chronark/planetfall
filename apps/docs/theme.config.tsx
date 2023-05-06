import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Planetfall</span>,

  logoLink: "https://planetfall.io/logo.png",
  primaryHue: {
    light: 255,
    dark: 255,
  },
  gitTimestamp: true,
  docsRepositoryBase: "https://github.com/chronark/highstorm/tree/main/apps/docs/",
  footer: {
    text: "Highstorm Docs",
  },
};

export default config;
