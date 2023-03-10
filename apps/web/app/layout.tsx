import "./globals.css";
import { Analytics } from "app/components/analytics";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs/app-beta";
import Script from "next/script";

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
    shortcut: "/logo.png",
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plainScript = `
window.$plain = window.$plain || [];
typeof plain === 'undefined' && (plain = function () { $plain.push(arguments); });
plain("init", {appKey: "appKey_uk_01GTMCKHYR6PD0WKNB61TQ0WS0"});


fetch('/api/v1/auth/user').then(res => res.json()).then(res=>{

  if (res.userId) {
    plain('set-customer', {
      type: 'logged-in',
      getCustomerJwt: async () => {
        const jwt= await fetch('/api/v1/auth/user/jwt', {method: 'POST'})
        .then(res => res.json())
        .then(res => res.token);
        console.log({jwt})
        return jwt
      }
    });
    
  }
})
`;
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
        <Script id="chat" async src="https://customer-chat.cdn-plain.com/latest/customerChat.js" />

        <Script id="setup-plain" dangerouslySetInnerHTML={{ __html: plainScript }} />
      </head>
      <ClerkProvider>
        <body className={process.env.NODE_ENV === "development" ? "debug-screens" : undefined}>
          <Providers>{children}</Providers>
          <Analytics />
        </body>
      </ClerkProvider>
    </html>
  );
}
