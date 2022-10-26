import "./globals.css"
import "public/fonts/css/pangea.css";





export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" className="font-display">
      <head>
        <title>Planetfall</title>
        <meta name="description" content="Track, measure and share your API's performance" />
        <link rel="icon" href="/logo.svg" />
      </head>


      <body className="bg-black" >


        {children}
      </body>
    </html>
  )
}



