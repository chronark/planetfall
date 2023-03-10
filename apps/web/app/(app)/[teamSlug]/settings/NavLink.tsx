"use client";

import classNames from "classnames";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

type Props = {
  slug: string | null;
  href: string;
  label: string;
};

export const NavLink: React.FC<Props> = ({ slug, href, label }) => {
  const segment = useSelectedLayoutSegment();
  const isActive = slug === segment;

  return (
    <Link
      href={href}
      className={classNames("text-zinc-700 duration-150 hover:text-zinc-900", {
        "font-semibold": isActive,
      })}
    >
      {label}
    </Link>
  );
};
