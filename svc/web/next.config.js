const { withAxiom } = require("next-axiom");

const withMarkdoc = require("@markdoc/next.js")();

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["tsx", "ts", "jsx", "mdx", "md"],
	images: {
		domains: ["www.gravatar.com", "avatars.githubusercontent.com"],
	},
	experimental: {
		appDir: true,
		transpilePackages: ["@planetfall/emails"],
		serverComponentsExternalPackages: ["@planetfall/db", "@prisma/client"],
	},
};

module.exports = withAxiom(withMarkdoc(nextConfig));
