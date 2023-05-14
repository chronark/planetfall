import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Planetfall",
    template: "%s | Planetfall",
  },
  description: "Global Latency Monitoring",
  openGraph: {
    title: "Planetfall",
    description: "Global Latency Monitoring",
    url: "https://planetfall.io",
    siteName: "planetfall.io",
    images: [
      {
        url: "https://planetfall.io/img/og.png",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Planetfall",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/logo.png",
  },
};

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
        <script
          src="https://beamanalytics.b-cdn.net/beam.min.js"
          data-token="e08d63f1-631b-4eeb-89b3-7799fedde74f"
          async
        />
      </head>
      <body className={process.env.NODE_ENV === "development" ? "debug-screens" : undefined}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
