"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "../components/logo";
import classNames from "classnames";

import { useAuth } from "@clerk/nextjs";

export const Header: React.FC = () => {
  const { userId } = useAuth();
  const isSignedIn = !!userId;
  const [isScrolled, setIsScrolled] = useState(false);

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
      className={classNames("fixed top-0 z-30 w-full backdrop-blur duration-1000 ", {
        "bg-zinc-100/50": isScrolled,
        "bg-zinc-100/0": !isScrolled,
      })}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site branding */}
          <div className="mr-4 shrink-0">
            {/* Logo */}
            <Link href="/" aria-label="Planetfall">
              <div className="flex items-center gap-2 ">
                <Logo className="w-10 h-10 text-zinc-900" />
                <span className="text-2xl font-semibold text-zinc-900">Planetfall</span>
              </div>
            </Link>
          </div>
          {/* Desktop navigation */}
          <nav className="items-center hidden grow md:flex">
            <ul className="flex flex-wrap items-center justify-end gap-8 grow">
              <li className="hidden md:block">
                <Link
                  className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-600 hover:text-zinc-800 lg:px-5"
                  href="https://discord.gg/438dArF6pJ"
                  target="_blank"
                >
                  Discord
                </Link>
              </li>
              <li className="hidden md:block">
                <Link
                  className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-600 hover:text-zinc-800 lg:px-5"
                  href="/play"
                >
                  Play
                </Link>
              </li>

              <li className="hidden md:block">
                <Link
                  className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-600 hover:text-zinc-800 lg:px-5"
                  href="/pricing"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link
                  href={isSignedIn ? "/home" : "/auth/sign-in"}
                  className="font-medium leading-snug transition-none duration-500 ease-in-out shadow-sm text-zinc-800 hover:text-zinc-900 hover:cursor-pointer whitespace-nowrap"
                >
                  {isSignedIn ? "Dashboard" : "Sign in"}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Fancy fading bottom border */}
      <div
        className={classNames(
          "absolute w-full transition-all duration-1000  h-px -bottom-px from-zinc-400/0 via-zinc-600/70 to-zinc-600/0 bg-gradient-to-l",
          {
            "opacity-0": !isScrolled,
            "opacity-100": isScrolled,
          },
        )}
      />
    </header>
  );
};
