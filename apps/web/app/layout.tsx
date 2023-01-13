import "./globals.css";
import "@tremor/react/dist/esm/tremor.css";
import { Analytics } from "app/components/analytics";
import { Inter } from "@next/font/google";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
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
				<meta name="description" content="Global Latency Monitoring" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/logo.svg" />
			</head>
			<body
				className={
					process.env.NODE_ENV === "development" ? "debug-screens" : undefined
				}
			>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
