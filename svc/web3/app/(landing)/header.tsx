import React from "react";
import Link from "next/link";
import { Logo } from "../components/logo";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline"
import { asyncComponent } from "lib/api/component";
import { auth } from "@clerk/nextjs/app-beta";

export const Header = asyncComponent(async () => {

   const {sessionId} = auth()

  const isSignedIn = !!sessionId
  return (
    <header
      className="fixed top-0  w-full z-50   backdrop-blur"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site branding */}
          <div className="shrink-0 mr-4">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Planetfall"
            >
              <div className="flex items-center gap-2 group ">
                <Logo className="w-10 h-10 group-hover:text-white text-primary-100 duration-500" />
                <span className="font-semibold text-2xl group-hover:text-white text-primary-100 duration-500">
                  Planetfall
                </span>
              </div>
            </Link>
          </div>
          {/* Desktop navigation */}
          <nav className="flex grow items-center">
            <ul className="flex grow justify-end flex-wrap items-center gap-8">
              <li className="hidden md:block">
                <Link
                  className="font-medium text-gray-400 hover:text-gray-200 px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out"
                  href="/docs"
                >
                  Docs
                </Link>
              </li>
              <li className="hidden md:block">
                <Link
                  className="font-medium text-gray-400 hover:text-gray-200 px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out"
                  href="/pricing"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link href={isSignedIn ? "/home" : "/auth/sign-in"}>
                  <div className="transition-all hover:cursor-pointer whitespace-nowrap font-medium inline-flex items-center justify-center leading-snug duration-300 ease-in-out    text-gray-200  hover:text-primary-100  shadow-sm group ">
                    {isSignedIn ? "Dashboard" : "Sign in"}
                    <ArrowLongRightIcon className="hidden md:block w-6 h-6 group-hover:text-primary-800  group-hover:trangray-x-1 transition-transform duration-150 ease-out ml-1" />
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
})