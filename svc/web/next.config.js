const withMarkdoc = require("@markdoc/next.js")();

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["tsx", "ts", "jsx", "mdx", "md"],
	images: {
		domains: ["www.gravatar.com", "avatars.githubusercontent.com"],
	},
	experimental: {
		appDir: true,
		serverComponentsExternalPackages: [
			"@planetfall/db",
			"@prisma/client",
			"@shopify/polaris-viz",
		],
	},
};

module.exports = withMarkdoc(nextConfig);
