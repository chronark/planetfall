import React, { Fragment, PropsWithChildren } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@planetfall/svc/web/lib/hooks/trpc";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useAuth } from "components/auth";

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}

const Divider: React.FC = () => {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-slate-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
    </svg>
  );
};

export type LayoutProps = {
  teamSelector?: boolean;
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
};

export const Layout: React.FC<PropsWithChildren<LayoutProps>> = (
  { children, breadcrumbs = [], teamSelector = true },
): JSX.Element => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const activeTeamSlug = router.query.teamSlug as string;

  const teams = trpc.team.list.useQuery();

  const userNavigation: any[] = [];

  const navigation = [
    { name: "Endpoints", href: `/${activeTeamSlug}/endpoints` },
    { name: "Pages", href: `/${activeTeamSlug}/pages` },
  ];
  const invalidteam = teams.data &&
    !teams.data.find((t) => t.team.slug === activeTeamSlug);
  return (
    <>
      <Disclosure as="header" className="bg-white shadow border-b">
        {({ open }) => (
          <>
            <div className="mx-auto container">
              <div className="relative flex h-16 justify-between">
                <div className="relative z-10 flex px-2 lg:px-0">
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol role="list" className="flex items-center space-x-4">
                      <li>
                        <Link
                          href="/"
                          className="text-slate-900 font-bold hover:text-slate-800"
                        >
                          Planetfall
                        </Link>
                      </li>
                      {teamSelector && !invalidteam
                        ? (
                          <>
                            <Divider />
                            <li>
                              <Dropdown.Root>
                                <Dropdown.Trigger className="flex items-center px-2 py-1 gap-2 text-slate-500 hover:text-slate-700">
                                  <span className="text-sm font-medium">
                                    {activeTeamSlug}
                                  </span>
                                  <ChevronUpDownIcon className="w-4 h-4" />
                                </Dropdown.Trigger>

                                <Dropdown.Portal>
                                  <Dropdown.Content
                                    onCloseAutoFocus={(e) => {
                                      e.preventDefault();
                                    }}
                                    className={classNames(
                                      " radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down",
                                      "w-48 rounded px-1.5 py-1 shadow-md md:w-56",
                                      "bg-white dark:bg-slate-800",
                                    )}
                                  >
                                    {teams.data?.map((team) => (
                                      <Dropdown.Item
                                        key={team.teamId}
                                        className={classNames(
                                          "flex cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none",
                                          "text-slate-400 focus:bg-slate-50 dark:text-slate-500 dark:focus:bg-slate-900",
                                        )}
                                      >
                                        <Link
                                          href={`/${team.team.slug}`}
                                          className="flex-grow text-slate-700 dark:text-slate-300"
                                        >
                                          {team.team.name}
                                        </Link>
                                      </Dropdown.Item>
                                    ))}
                                  </Dropdown.Content>
                                </Dropdown.Portal>
                              </Dropdown.Root>
                            </li>
                          </>
                        )
                        : null}
                      {breadcrumbs.map((c, i) => (
                        <li key={c.label}>
                          <div className="flex items-center">
                            <svg
                              className="h-5 w-5 flex-shrink-0 text-slate-300"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                            <Link
                              href={c.href}
                              className="ml-4 text-sm font-medium text-slate-500 hover:text-slate-700"
                              aria-current={i - 1 === breadcrumbs.length
                                ? "page"
                                : undefined}
                            >
                              {c.label}
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </div>

                <div className="relative z-10 flex items-center lg:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none">
                    <span className="sr-only">Open menu</span>
                    {open
                      ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )
                      : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                  </Disclosure.Button>
                </div>
                <div className="hidden lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
                  <button
                    type="button"
                    className="flex-shrink-0 rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none "
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-4 flex-shrink-0">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white focus:outline-none ">
                        <span className="sr-only">Open user menu</span>
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={user?.image ??
                            `https://ui-avatars.com/api/?size=32&name=${user?.name}`}
                          alt=""
                          width={32}
                          height={32}
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg  focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? "bg-slate-100" : "",
                                  "block py-2 px-4 text-sm text-slate-700",
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={classNames(
                                active ? "bg-slate-100" : "",
                                "block py-2 px-4 text-sm text-slate-700 w-full text-left",
                              )}
                            >
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <nav
                className="hidden lg:flex lg:space-x-8 lg:pt-2"
                aria-label="Global"
              >
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      router.asPath.includes(item.href)
                        ? "border-slate-900 text-slate-900"
                        : "text-slate-700 border-transparent hover:border-slate-500 hover:text-slate-900 ",
                      "border-b  py-2 px-3 inline-flex duration-150 transition-all items-center text-sm font-medium",
                    )}
                    aria-current={item.href === router.asPath
                      ? "page"
                      : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

            <Disclosure.Panel
              as="nav"
              className="lg:hidden"
              aria-label="Global"
            >
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.href === router.asPath
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-900 hover:bg-slate-50 hover:text-slate-900",
                      "block rounded-md py-2 px-3 text-base font-medium",
                    )}
                    aria-current={item.href === router.asPath
                      ? "page"
                      : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={user?.image ??
                        `https://ui-avatars.com/api/?size=32&name=${user?.name}`}
                      alt=""
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-slate-800">
                      {user?.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block rounded-md py-2 px-3 text-base font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut()}
                    className="block rounded-md py-2 px-3 text-base font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Sign Out
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main className="mx-auto container mt-8 lg:mt-16">
        {invalidteam
          ? (
            <div className="flex min-h-full flex-col bg-white pt-16 pb-12">
              <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className="py-16">
                  <div className="text-center">
                    <p className="text-base font-semibold text-red-600">404</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      Team not found.
                    </h1>
                    <div className="mt-6">
                      <Link
                        href="/home"
                        className="text-base font-medium text-red-600 hover:text-red-500"
                      >
                        Go back home
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          )
          : children}
      </main>

      <footer>
        <div className=" border-t mt-16 pt-16">
          <p className="mx-auto container mb-16 text-base text-center text-slate-400">
            &copy; {new Date().getUTCFullYear()}{" "}
            planetfall.io - All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};
