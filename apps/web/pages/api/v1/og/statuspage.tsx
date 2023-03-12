import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { Client as Tinybird } from "@planetfall/tinybird";

export const config = {
  runtime: "edge",
};

const tb = new Tinybird();

export default async function handler(req: NextRequest) {
  const satoshiBlack = await fetch(
    new URL("../../../../public/fonts/Satoshi-Black.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const satoshiBold = await fetch(
    new URL("../../../../public/fonts/Satoshi-Bold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const { searchParams } = req.nextUrl;
  const endpointName = searchParams.get("endpointName");
  const endpointId = searchParams.get("endpointId");
  if (!endpointId) {
    throw new Error("Missing endpointId");
  }

  const stats = await (await tb.getEndpointStats(endpointId)).find((s) => s.regionId === "global");
  if (!stats) {
    throw new Error("No stats found");
  }

  const series = await tb.getEndpointStatsPerHour(endpointId);
  if (!series) {
    throw new Error("No stats found");
  }
  const max = series.reduce((acc, s) => Math.max(acc, s.p99), 0);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "white",
        //backgroundImage: `url(${new URL(
        //   "../../../public/_static/background.png",
        //   import.meta.url,
        // ).toString()})`,
      }}
    >
      <img
        src={new URL("../../../../public/logo.png", import.meta.url).toString()}
        style={{
          width: "80px",
          height: "80px",
          position: "absolute",
          top: "40px",
          right: "40px",
        }}
      />
      <h1
        style={{
          fontSize: "90px",
          fontFamily: "Satoshi Black",
          backgroundClip: "text",
          color: "#18181b",
          marginTop: "20px",
          lineHeight: "7rem",
        }}
      >
        {endpointName}
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "64px",
          marginTop: "20px",
        }}
      >
        <Metric name="P50" value={stats.p50.toFixed()} unit="ms" />
        <Metric name="P95" value={stats.p95.toFixed()} unit="ms" />
        <Metric name="P99" value={stats.p99.toFixed()} unit="ms" />
      </div>

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
        {series.map(({ time, p99, errors }) => (
          <div
            key={time}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "25px",
              height: `${(p99 / max) * 360}px`, // normalize clicks count to scale of 360px
              marginRight: "12px",
              backgroundColor: errors > 0 ? "#ef4444" : "#34d399",
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
}

const Metric: React.FC<{ name: string; value: string; unit: string }> = ({ name, value, unit }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "baseline",
      justifyContent: "center",
      gap: "2px",
    }}
  >
    <span tw="text-zinc-700 text-2xl">{name}</span>
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        gap: "2px",
      }}
    >
      <span tw="text-zinc-900 font-semibold text-8xl">{value}</span>
      <span tw="text-zinc-700 text-xl">{unit}</span>
    </div>
  </div>
);
