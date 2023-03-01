import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export const Cta: React.FC = (): JSX.Element => {
  return (
    <section className="py-16 text-center bg-white sm:py-24 lg:py-32">
      <div className="max-w-6xl px-4 mx-auto bg-white sm:px-6">
        <h2 className="text-4xl font-bold tracking-tight text-black">
          Get started with Planetfall
        </h2>
        <p className="max-w-xl mx-auto mt-6 text-lg leading-8 text-zinc-600">
          The first 100k checks per month are free! No credit card required.
        </p>

        <Link
          href="/auth/sign-in"
          className=" mt-4 md:mt-8 text-center max-w-xs   w-full inline-block transition-all rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7 text-zinc-100   bg-zinc-900 ring-1 ring-zinc-900 hover:text-zinc-900   hover:bg-zinc-100 duration-150"
        >
          Create your first API check
        </Link>
      </div>
    </section>
  );
};
