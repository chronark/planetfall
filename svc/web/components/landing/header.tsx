import React, { useEffect, useState } from "react";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, useUser } from "../auth";
import { Logo } from "../logo";

export const Header: React.FC = (): JSX.Element => {
  let [isScrolled, setIsScrolled] = useState(false);
  const { session } = useSession();
  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <header
      className={`fixed top-0  w-full z-50  transition-shadow duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-white/75 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site branding */}
          <div className="shrink-0 mr-4">
            {/* Logo */}
            <Link
              className="flex items-center gap-2"
              href="/"
              aria-label="Planetfall"
            >
              <Logo className="w-10 h-10 text-slate-900" />
              <span className="text-slate-900 font-semibold text-2xl ">
                Planetfall
              </span>
            </Link>
          </div>
          {/* Desktop navigation */}
          <nav className="flex grow items-center">
            <ul className="flex grow justify-end flex-wrap items-center gap-8">
              <li className="hidden md:block">
                <Link
                  className="font-medium text-slate-500 hover:text-slate-300 px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out"
                  href="/pricing"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link href={session.signedIn ? "/home" : "/auth/sign-in"}>
                  <div className="transition-all hover:cursor-pointer whitespace-nowrap md:px-4 md:py-3 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug duration-300 ease-in-out  md:bg-slate-900 md:text-slate-50 md:hover:bg-slate-50 hover:text-slate-900  shadow-sm group ">
                    {session.signedIn ? "Dashboard" : "Sign in"}
                    <ArrowLongRightIcon className="hidden md:block w-6 h-6 group-hover:text-primary-500  group-hover:translate-x-1 transition-transform duration-150 ease-out ml-1" />
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
