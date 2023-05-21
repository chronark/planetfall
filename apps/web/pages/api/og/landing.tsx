import { db } from "@planetfall/db";
import { globalUsage } from "@planetfall/tinybird";
import { ImageResponse } from "@vercel/og";
import { unstable_cache } from "next/cache";
export const config = {
  runtime: "edge",
};

const satoshiBLack = fetch(
  new URL("../../../public/fonts/Satoshi-Black.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const satoshiBold = fetch(new URL("../../../public/fonts/Satoshi-Bold.ttf", import.meta.url)).then(
  (res) => res.arrayBuffer(),
);

export default async function () {
  const [satoshiBlackData, satoshiBoldData] = await Promise.all([satoshiBLack, satoshiBold]);

  const stats = await unstable_cache(async () => await globalUsage({}), [], {
    revalidate: 3600,
  })();

  const checks = stats.data.reduce((acc, day) => acc + day.usage, 0) / 7;
  return new ImageResponse(
    // Modified based on https://tailwindui.com/components/marketing/sections/cta-sections

    <div tw="flex relative flex-col bg-white w-screen h-screen justify-center items-center text-black">
      <div tw="absolute top-8 left-8 flex items-center ">
        <svg width="258" height="258" fill="none" xmlns="http://www.w3.org/2000/svg">
          <title tw="hidden">Planetfall</title>
          <path
            d="M128.5 219.236c-.309.178-.69.178-1 0l-78.262-45.185a1 1 0 0 1-.5-.866v-90.37a1 1 0 0 1 .5-.866L127.5 36.764a1 1 0 0 1 1 0l31.923 18.43a1 1 0 0 0 1.237-.19l9.691-10.57a1 1 0 0 0-.237-1.542L128.5 18.289a1 1 0 0 0-1 0L33.238 72.71a1 1 0 0 0-.5.866v108.845c0 .358.19.688.5.866l94.262 54.423a.998.998 0 0 0 1 0l94.263-54.423a1 1 0 0 0 .5-.866v-49.206a1 1 0 0 0-1.217-.976l-14 3.108a1.001 1.001 0 0 0-.783.976v36.861a1 1 0 0 1-.5.866L128.5 219.236Z"
            fill="#000"
          />
          <path
            d="M223.321 105.737a1 1 0 0 0-1.387-.92l-87.51 36.649c-1.125.471-.588 2.163.603 1.899l87.541-19.436a.999.999 0 0 0 .783-.978l-.03-17.214ZM118.207 114.232c-.824.899.372 2.21 1.343 1.472l75.494-57.462a1 1 0 0 0-.104-1.66l-14.892-8.634a1 1 0 0 0-1.239.19l-60.602 66.094ZM203.173 62.11a.999.999 0 0 1 1.105-.071l18.485 10.672a1 1 0 0 1 .5.866v21.345a1 1 0 0 1-.614.922l-134.623 56.38c-1.082.454-1.926-1.007-.992-1.718l116.139-88.397Z"
            fill="#000"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M88.026 152.224c-1.082.454-1.926-1.007-.992-1.718l116.139-88.397a.999.999 0 0 1 1.105-.07l18.485 10.672a1 1 0 0 1 .5.866v21.345a1 1 0 0 1-.614.922l-134.623 56.38Z"
            fill="#000"
          />
        </svg>
        <span tw="text-2xl ml-4">Planetfall</span>
      </div>
      <h1 tw="container text-center font-black tracking-[-0.02em] py-4 text-8xl  text-zinc-900">
        Global Latency Monitoring
      </h1>

      <div tw="flex items-center justify-around w-full">
        <div tw="flex flex-col items-center">
          <dt tw="text-base leading-7 text-gray-800">Average Running Checks per Day</dt>
          <dd tw="order-first text-9xl font-medium tracking-tight text-gray-900">
            {Intl.NumberFormat("en-us", { notation: "compact" }).format(checks)}{" "}
          </dd>
        </div>
      </div>
    </div>,
    {
      fonts: [
        {
          name: "Satoshi Black",
          data: satoshiBlackData,
        },
        {
          name: "Satoshi Bold",
          data: satoshiBoldData,
        },
      ],

      width: 1200,
      height: 630,
    },
  );
}
