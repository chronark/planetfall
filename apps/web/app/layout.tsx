import "./globals.css";
import { Analytics } from "app/components/analytics";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Metadata } from "next";

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
    title: "Plantfall",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/favicon.ico",
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const crispyScript = `window.$crisp=[];window.CRISP_WEBSITE_ID="36468086-4e2e-4499-8b8d-32238bb2831c";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`;

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
        <Script
          id="crispy-script"
          dangerouslySetInnerHTML={{ __html: crispyScript }}
          strategy="lazyOnload"
        />
      </head>
      <body className={process.env.NODE_ENV === "development" ? "debug-screens" : undefined}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
