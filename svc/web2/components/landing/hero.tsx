import React, { useId } from "react";
import Link from "next/link";
import { Logo } from "../logo";
const Rings: React.FC = (): JSX.Element => {
  let id = useId();

  return (
    <div className="absolute left-1/2  h-full scale-150  stroke-slate-300/70 [mask-image:linear-gradient(to_top,white_20%,transparent_75%)] -translate-x-1/2">
      {/* Outer ring */}
      <svg
        viewBox="0 0 1026 1026"
        fill="none"
        aria-hidden="true"
        className="inset-0 h-full w-full animate-spin-forward-slow"
      >
        <path
          d="M1025 513c0 282.77-229.23 512-512 512S1 795.77 1 513 230.23 1 513 1s512 229.23 512 512Z"
          stroke="#D4D4D4"
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
            <stop stopColor="red" />
            <stop offset={1} stopColor="blue" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      {/* Inner ring */}
      <svg
        viewBox="0 0 1026 1026"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full animate-spin-reverse-slower"
      >
        <path
          d="M913 513c0 220.914-179.086 400-400 400S113 733.914 113 513s179.086-400 400-400 400 179.086 400 400Z"
          stroke="#D4D4D4"
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
            <stop stopColor="red" />
            <stop offset={1} stopColor="blue" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
export const Hero: React.FC = (): JSX.Element => {
  return (
    <section
      className="relative w-screen mt-16 -pt-16"
      style={{ minHeight: "50vh" }}
    >
      <Rings />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 md:pt-40">
          <div className="mx-auto text-center">
            <h1 className="text-6xl font-extrabold lg:whitespace-nowrap tracking-wider">
              Planet-wide Service and Latency Analysis
            </h1>
            <p className="text-xl text-slate-500 mt-6">
              Track, measure and share the latency and performance of your APIs
              from across the planet.
            </p>
            <div className="mt-10 max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div>
                <div className="text-slate-500">
                  Launching soon
                </div>
                {
                  /* <Link href="/auth/sign-in">
                  <div className="hover:cursor-pointer px-4 hover:px-6 hover:shadow-lg transition-all py-3 font-medium inline-flex items-center justify-center border border-slate-900 rounded leading-snug duration-300 ease-in-out  bg-slate-900 text-slate-50 hover:bg-slate-50 hover:text-slate-900  w-full shadow-sm group">
                    Get Started for free
                  </div>
                </Link> */
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
