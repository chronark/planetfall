import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import React from "react";

export const Cta: React.FC = (): JSX.Element => {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* CTA box */}
        <div className="text-gray-900  border rounded  py-8 border-white   bg-gradient-to-tr drop-shadow-cta from-gray-100 to-gray-50 hover:bg-white px-10 hover:text-primary-900 duration-1000">

          <div className="flex flex-col lg:flex-row justify-between items-center">
            {/* CTA content */}
            <div className="mb-6 lg:mr-16 lg:mb-0 text-center lg:text-left">
              <h3 className="text-4xl font-bold font-uncut-sans mb-2">
                Get started with Planetfall
              </h3>
              <p className="text-primary-500">
                Create your first API check in seconds! No credit card required.
              </p>
            </div>
            {/* CTA button */}
            <div className="shrink-0">
              <Link href="/auth/sign-in" className="transition-all hover:shadow-xl py-4 px-8 bg-slate-900 rounded hover:cursor-pointer whitespace-nowrap font-medium inline-flex items-center justify-center leading-snug duration-300 ease-in-out    text-slate-100  hover:bg-primary-800  shadow-sm group ">
                  <span>Sign In</span>                  
                    <ArrowLongRightIcon className="hidden md:block w-6 h-6 transition-transform duration-150 ease-out ml-1" />
                
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
