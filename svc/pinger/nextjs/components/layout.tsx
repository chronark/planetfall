import { Popover, Transition } from "@headlessui/react";
import { BookOpenIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { CloudflareLogo, FlyLogo, VercelLogo } from "./logos";

const navItems: {
  label: string;
  href: string;
  description: string;
  icon: JSX.Element;
}[] = [
  {
    label: "Vercel Serverless",
    href: "/results/vercel-serverless/read/1kb",
    description:
      "Measured between Vercel serverless functions and Upstash global Redis",
    icon: <VercelLogo />,
  },
  {
    label: "Vercel Edge",
    href: "/results/vercel-edge/read/1kb",
    description:
      "Measured between Vercel edge functions and Upstash global Redis",
    icon: <VercelLogo />,
  },
  {
    label: "Cloudflare",
    href: "/results/cloudflare/read/1kb",
    description: "Measured between Cloudflare Workers and Upstash global Redis",
    icon: <CloudflareLogo />,
  },
  {
    label: "fly.io",
    href: "/results/fly.io/read/1kb",
    description:
      "Measured between a VM and a managed Redis database on fly.io. The database is replicated to all available regions.",
    icon: <FlyLogo />,
  },
];

export type LayoutProps = {
  content?: React.ReactNode;
};
export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = (
  { children, content },
): JSX.Element => {
  let [isScrolled, setIsScrolled] = useState(false);

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
    <div className="min-h-full">
      <nav
        className={clsx(
          "sticky top-0 z-50 flex flex-wrap items-center justify-between bg-white px-4 py-5 shadow-md shadow-slate-900/5 transition duration-500 sm:px-6 lg:px-8",
          isScrolled
            ? "bg-white/95 backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-white/75"
            : "bg-transparent",
        )}
      >
        <div className="mr-6 flex lg:hidden">
          {/* <MobileNavigation navigation={navigation} /> */}
        </div>
        <div className="relative flex flex-grow basis-0 items-center">
          <Link href="/" aria-label="Home page">
            <img
              src="https://upstash.com/static/logo/logo-light.svg"
              className="h-9 w-auto fill-slate-700 block"
            />
          </Link>
        </div>

        <div className="-my-5 mr-6 sm:mr-8 md:mr-0 flex items-center justify-between space-x-4 md:space-x-8 lg:space-x-16">
          <Popover.Group as="nav" className="hidden space-x-10 md:flex">
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={clsx(
                      open ? "text-slate-900" : "text-slate-500",
                      "group inline-flex items-center rounded text-base font-medium hover:text-slate-900 focus:outline-none",
                    )}
                  >
                    <span>Platforms</span>
                    <ChevronDownIcon
                      className={clsx(
                        open ? "text-slate-600" : "text-slate-400",
                        "ml-2 h-5 w-5 group-hover:text-slate-500",
                      )}
                      aria-hidden="true"
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute z-10 -ml-4 mt-3 w-screen max-w-md lg:max-w-lg transform px-2 sm:px-0 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2">
                      <div className="overflow-hidden rounded shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                          {navItems.map((item) => (
                            <a
                              key={item.label}
                              href={item.href}
                              className="-m-3 flex items-start rounded p-3 hover:bg-slate-50"
                            >
                              <div className="flex items-center h-full">
                                <span className="w-8 h-8">
                                  {item.icon}
                                </span>
                              </div>
                              <div className="ml-4">
                                <p className="text-base font-medium text-slate-900">
                                  {item.label}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </Popover.Group>
          <div>{content}</div>
        </div>
        <div className="relative flex basis-0 justify-end gap-6 sm:gap-8 md:flex-grow items-center">
          <Link
            href="https://github.com/upstash/latency#readme"
            target="_blank"
            aria-label="GitHub"
          >
            <BookOpenIcon className="w-6 h-6 fill-current text-slate-900 hover:text-slate-600 duration-150 hover:cursor-pointer" />
          </Link>
          <Link
            href="https://github.com/upstash/latency"
            target="_blank"
            aria-label="GitHub"
          >
            <svg
              className="w-6 h-6 fill-current text-slate-900 hover:text-slate-600 duration-150 hover:cursor-pointer"
              aria-hidden="true"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
            </svg>
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
};
