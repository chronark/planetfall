"use client";
import Link from "next/link";
import React, { useId } from "react";

const Rings: React.FC = (): JSX.Element => {
  const id = useId();

  return (
    <div className="absolute left-1/2  h-2/3 scale-150  stroke-zinc-700/70 [mask-image:linear-gradient(to_top,white_20%,transparent_75%)] -translate-x-1/2">
      {/* Outer ring */}

      <svg
        viewBox="0 0 1026 1026"
        fill="none"
        aria-hidden="true"
        className="inset-0 w-full h-full animate-spin-forward-slow"
      >
        <path
          d="M1025 513c0 282.77-229.23 512-512 512S1 795.77 1 513 230.23 1 513 1s512 229.23 512 512Z"
          stroke="#d4d4d8"
          strokeOpacity="0.7"
        />
        <path
          d="M513 1025C230.23 1025 1 795.77 1 513"
          stroke={`url(#${id}-gradient-1)`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id={`${id}-gradient-1`}
            x1="1"
            y1="513"
            x2="1"
            y2="1025"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0000aa" />
            <stop offset={1} stopColor="#121212" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      {/* Inner ring */}
      <svg
        viewBox="0 0 1026 1026"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full animate-spin-reverse-slower"
      >
        <path
          d="M913 513c0 220.914-179.086 400-400 400S113 733.914 113 513s179.086-400 400-400 400 179.086 400 400Z"
          stroke="#d4d4d8"
          strokeOpacity="0.7"
        />
        <path
          d="M913 513c0 220.914-179.086 400-400 400"
          stroke={`url(#${id}-gradient-2)`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id={`${id}-gradient-2`}
            x1="913"
            y1="513"
            x2="913"
            y2="913"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0000aa" />
            <stop offset={1} stopColor="#121212" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const Hero: React.FC = (): JSX.Element => {
  return (
    <section
      className="relative w-screen bg-white lg:h-screen bg-gradient-radial from-zinc-100 to-transparent"
      style={{ minHeight: "50vh" }}
    >
      <Rings />

      <div className="relative h-full max-w-6xl px-4 mx-auto sm:px-6 ">
        <div className="h-full pt-32 md:pt-40">
          <div className="flex flex-col items-center justify-center text-center h-2/3">
            <h1 className="container text-center font-extrabold tracking-[-0.02em] py-4  text-6xl lg:text-8xl   text-transparent bg-clip-text bg-gradient-to-tr from-zinc-900 to-zinc-900/90">
              Global Latency Monitoring
            </h1>
            <p className="container mt-6 text-lg font-light text-zinc-700">
              Understand the true performance of your API by monitoring it from around the world.
            </p>
            <div className="flex flex-col justify-center w-full mx-auto mt-8 gap-4 sm:flex-row sm:max-w-lg ">
              <Link
                href="/play"
                className="sm:w-1/2 sm:text-center inline-block space-x-2 rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7 text-zinc-900  ring-1 ring-zinc-600 backdrop-blur hover:bg-white hover:text-zinc-900 duration-150 "
              >
                Playground
              </Link>
              <Link
                href="/auth/sign-in"
                className="sm:w-1/2 sm:text-center inline-block transition-all space-x-2  rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7 text-zinc-100   bg-zinc-900 ring-1 ring-zinc-900 hover:text-zinc-900   hover:bg-zinc-100 duration-150"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
