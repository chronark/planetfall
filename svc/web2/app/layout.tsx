// import localFont from '@next/font/local';


// const pangea = localFont({ src: "../public/fonts/pangea/PangeaAfrikan-Medium.woff2" })
export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
            <head>
                <title>Planetfall</title>
                <meta name="description" content="Track, measure and share your API's performance" />
                <link rel="icon" href="/logo.svg" />
            </head>


            <body >

               
                {children}
            </body>
        </html>
    )
}



