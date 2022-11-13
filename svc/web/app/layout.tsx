import "./globals.css";
import "public/fonts/css/pangea.css";
import "@tremor/react/dist/esm/tremor.css";

import { ClerkProvider } from "@clerk/nextjs/app-beta";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="font-display">
        <head>
          <title>Planetfall</title>
          <meta
            name="description"
            content="Track, measure and share your API's performance"
          />
          <link rel="icon" href="/logo.svg" />
        </head>

        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
