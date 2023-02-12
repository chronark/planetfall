const withMarkdoc = require("@markdoc/next.js")();
const { withAxiom } = require("next-axiom");
/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["tsx", "ts", "jsx", "mdx", "md"],
	images: {
		domains: ["www.gravatar.com", "avatars.githubusercontent.com"],
	},
	transpilePackages: ["@planetfall/emails"],
	experimental: {
		appDir: true,
		esmExternals: "loose",
		serverComponentsExternalPackages: ["@planetfall/db", "@prisma/client"],
	},
	webpack: (config) => {
		config.experiments.asyncWebAssembly = true;
		return config;
	},
};

module.exports = withAxiom(withMarkdoc(nextConfig));
