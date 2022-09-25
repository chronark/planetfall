import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
// export default withTRPC<Router>({
//   config: ({ ctx }) => {
//     /**
//      * If you want to use SSR, you need to use the server's full URL
//      * @link https://trpc.io/docs/ssr
//      */
//     const url = process.env.NEXT_PUBLIC_VERCEL_URL
//       ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/v1/trpc`
//       : "/api/v1/trpc";
//     return {
//       links: [
//         httpBatchLink<Router>({ url }),
//       ],
//     };
//   },
//   /**
//    * @link https://trpc.io/docs/ssr
//    */
//   ssr: true,
// })(MyApp);
