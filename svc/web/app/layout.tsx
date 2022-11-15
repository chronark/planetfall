import "./globals.css";
import "public/fonts/css/pangea.css";
import "@tremor/react/dist/esm/tremor.css";
import { Inter } from "@next/font/google";

const inter = Inter({
	variable: "--font-inter",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={inter.variable}>
			<head>
				<title>Planetfall</title>
				<meta
					name="description"
					content="Track, measure and share your API's performance"
				/>
				<link rel="icon" href="/logo.svg" />
			</head>

			<body
				className={
					process.env.NODE_ENV === "development" ? "debug-screens" : undefined
				}
			>
				{children}
			</body>
		</html>
	);
}
