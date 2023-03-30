import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { getEndpointStats, getEndpointStatsPerDay } from "@planetfall/tinybird";

export const config = {
  runtime: "edge",
};

export default async function endpointOg(req: NextRequest) {
  try {
    const satoshiBlack = await fetch(
      new URL("../../../../public/fonts/Satoshi-Black.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    const satoshiBold = await fetch(
      new URL("../../../../public/fonts/Satoshi-Bold.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    const { searchParams } = new URL(req.url);

    const endpointId = searchParams.get("id");
    if (!endpointId) {
      throw new Error("Missing endpointId");
    }

    const endpointName = searchParams.get("name") ?? "Untitled";

    const stats = await getEndpointStats({
      endpointId,
    });
    const series = await getEndpointStatsPerDay({
      endpointId,
      days: 30,
    });
    const max = Math.max(...series.data.map((d) => d.p75));

    if (stats.data.length === 0) {
      throw new Error("No stats found");
    }

    const metrics = [
      {
        label: "P75",
        value: stats.data[0].p75,
      },
      {
        label: "P90",
        value: stats.data[0].p90,
      },
      {
        label: "P95",
        value: stats.data[0].p95,
      },
      {
        label: "P99",
        value: stats.data[0].p99,
      },
    ];

    return new ImageResponse(
      <div
        tw="bg-zinc-900 py-24 h-full w-full"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2850&q=80&blend=111827&blend-mode=multiply&sat=-100&exp=15"
          alt=""
          tw="absolute inset-0 -z-10 h-full w-full object-cover"
        /> */}

        <div
          tw="mx-auto px-10"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 tw="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{endpointName}</h1>
          {/* <p tw="mt-6 text-lg leading-8 text-zinc-300">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste
            dolor cupiditate blanditiis ratione.
          </p> */}
        </div>
        <dl
          tw="mx-auto mt-16  sm:mt-20  divide-x"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          {metrics.map(({ label, value }, i) => (
            <div
              key={label}
              tw={`mx-8  pl-6 ${i > 0 ? "border-l border-white/10" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <dt tw="text-lg leading-6 text-zinc-200">{label}</dt>
              <div
                className="mt-8"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <dd tw="font-semibold tracking-tight text-white " style={{ fontSize: 64 }}>
                  {value}
                </dd>
                <span tw="text-lg font-semibold ml-4 text-zinc-200">ms</span>
              </div>
            </div>
          ))}
        </dl>
        <div
          style={{
            position: "absolute",
            bottom: "0px",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "center",
            marginTop: "60px",
          }}
        >
          {series.data.slice(-40).map(({ time, p75, errors }) => (
            <div
              key={time}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: `${(p75 / max) * 200}px`, // normalize clicks count to scale of 360px
                marginLeft: "8px",
                marginRight: "8px",
                background:
                  errors > 0 ? "#dc2626" : "linear-gradient(0deg, #d1d5db 50%, #fafafa 100%)",
              }}
            />
          ))}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Satoshi Black",
            data: satoshiBlack,
          },
          {
            name: "Satoshi Bold",
            data: satoshiBold,
          },
        ],
      },
    );
  } catch (e) {
    const err = e as Error;
    console.log(`${err.message}`);
    return new Response(`Failed to generate the image: ${err.message}`, {
      status: 200,
    });
  }
}
