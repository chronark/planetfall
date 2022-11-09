import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { asyncComponent } from "lib/api/component";
import classNames from "classnames";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { UserButton } from "./user-button"
import { auth, currentUser } from "@clerk/nextjs/app-beta";
import { redirect, usePathname } from "next/navigation";
import { NavLink } from "./navlink";


const userNavigation = [
  { name: "Settings", href: "/settings" },
  { name: "Sign out", href: "/auth/sign-out" },
];

export type NavbarProps = {
  orgSlug?: string;
  breadCrumbs: { label: string, href: string }[]
};

export const DesktopNavbar = asyncComponent(async ({ orgSlug, breadCrumbs }: NavbarProps) => {
  const navigation: { name: string, href: string }[] = []
  if (orgSlug) {
    navigation.push(
      { name: "Endpoints", href: `/${orgSlug}/endpoints` },
      { name: "Pages", href: `/${orgSlug}/pages` },
      { name: "Settings", href: `/${orgSlug}/settings` },
    )
  }


  const user = await currentUser()
  if (!user) {
    redirect("/auth/sign-in")
    return <div></div>
  }


  return (

    <nav className="  border-b border-slate-300">
      <div className="container mx-auto">

        <div className="flex justify-between items-center">

          <ul role="list" className="flex items-center space-x-4">
            <li key="home">
              <Link
                href="/"
                className="text-slate-900 font-bold hover:text-slate-800"
              >
                <Logo className="w-8 h-8" />
              </Link>
            </li>


            {breadCrumbs.map((c, i) => (
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
                    aria-current={i - 1 === breadCrumbs.length
                      ? "page"
                      : undefined}
                  >
                    {c.label}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <UserButton user={{ email: user.emailAddresses[0].emailAddress, name: user.username ?? "", image: user.profileImageUrl }} />
        </div>
        <div>
          {navigation.map((item) => (
            <NavLink key={item.name} href={item.href} label={item.name} />
          ))}

        </div>
      </div>

    </nav>


  );
})