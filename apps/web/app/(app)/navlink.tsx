"use client";
import { usePathname } from "next/navigation";

import classNames from "classnames";
import Link from "next/link";
import React from "react";

export type NavLinkProps = {
  label: string;
  href: string;
};
export const NavLink: React.FC<NavLinkProps> = ({ label, href }) => {
  const path = usePathname();
  return (
    <Link
      href={href}
      className={classNames(
        path?.includes(href)
          ? "border-zinc-900 text-zinc-900 font-medium"
          : "text-zinc-600 border-transparent hover:border-zinc-500 hover:text-zinc-900 ",
        "border-b py-2 px-3 inline-flex duration-150 transition-all items-center text-sm ",
      )}
    >
      {label}
    </Link>
  );
};
