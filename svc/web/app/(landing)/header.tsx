import React from "react";
import Link from "next/link";
import { Logo } from "../components/logo";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { asyncComponent } from "lib/api/component";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession } from "lib/auth";

export const Header = asyncComponent(async () => {
	const session = await getSession();

	const isSignedIn = !!session.session;
	return (
		<header className="fixed top-0 z-50 w-full  backdrop-blur">
			<div className="container mx-auto">
				<div className="flex items-center justify-between h-16 md:h-20">
					{/* Site branding */}
					<div className="mr-4 shrink-0">
						{/* Logo */}
						<Link href="/" aria-label="Planetfall">
							<div className="flex items-center gap-2 group ">
								<Logo className="w-10 h-10 group-hover:text-white text-zinc-100 duration-500" />
								<span className="text-2xl font-semibold group-hover:text-white text-zinc-100 duration-500">
									Planetfall
								</span>
							</div>
						</Link>
					</div>
					{/* Desktop navigation */}
					<nav className="flex items-center grow">
						<ul className="flex flex-wrap items-center justify-end grow gap-8">
							<li className="hidden md:block">
								<Link
									className="flex items-center px-3 py-2 font-medium text-gray-400 hover:text-gray-200 lg:px-5 transition duration-150 ease-in-out"
									href="/play"
								>
									Play
								</Link>
							</li>
							<li className="hidden md:block">
								<Link
									className="flex items-center px-3 py-2 font-medium text-gray-400 hover:text-gray-200 lg:px-5 transition duration-150 ease-in-out"
									href="/docs"
								>
									Docs
								</Link>
							</li>
							<li className="hidden md:block">
								<Link
									className="flex items-center px-3 py-2 font-medium text-gray-400 hover:text-gray-200 lg:px-5 transition duration-150 ease-in-out"
									href="/pricing"
								>
									Pricing
								</Link>
							</li>

							<li>
								<Link href={isSignedIn ? "/home" : "/auth/sign-in"}>
									<div className="inline-flex items-center justify-center font-medium leading-snug text-gray-200 transition-all hover:cursor-pointer whitespace-nowrap duration-300 ease-in-out  hover:text-zinc-100 shadow-sm group">
										{isSignedIn ? "Dashboard" : "Sign in"}
										<ArrowLongRightIcon className="hidden w-6 h-6 ml-1 md:block group-hover:text-zinc-100  group-hover:trangray-x-1 transition-transform duration-150 ease-out" />
									</div>
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</header>
	);
});
