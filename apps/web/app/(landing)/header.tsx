"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "../components/logo";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import { asyncComponent } from "lib/api/component";
import { Session } from "next-auth";
import { useScroll } from "framer-motion";
import classNames from "classnames";

type Props = {
	session: Session | null;
};
export const Header: React.FC<Props> = (props: Props) => {
	const isSignedIn = !!props.session;
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
			className={classNames(
				"fixed top-0 z-30 w-full backdrop-blur duration-1000 ",
				{
					"bg-zinc-900/50": isScrolled,
					"bg-zinc-900/0": !isScrolled,
				},
			)}
		>
			<div className="container mx-auto">
				<div className="flex items-center justify-between h-16 md:h-20">
					{/* Site branding */}
					<div className="mr-4 shrink-0">
						{/* Logo */}
						<Link href="/" aria-label="Planetfall">
							<div className="flex items-center gap-2 ">
								<Logo className="w-10 h-10 text-zinc-100" />
								<span className="text-2xl font-semibold text-zinc-100">
									Planetfall
								</span>
							</div>
						</Link>
					</div>
					{/* Desktop navigation */}
					<nav className="items-center hidden grow md:flex">
						<ul className="flex flex-wrap items-center justify-end gap-8 grow">
							<li className="hidden md:block">
								<Link
									className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-400 hover:text-zinc-200 lg:px-5"
									href="/play"
								>
									Play
								</Link>
							</li>
							<li className="hidden md:block">
								<Link
									className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-400 hover:text-zinc-200 lg:px-5"
									href="/docs"
								>
									Docs
								</Link>
							</li>
							<li className="hidden md:block">
								<Link
									className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-400 hover:text-zinc-200 lg:px-5"
									href="/pricing"
								>
									Pricing
								</Link>
							</li>

							<li>
								<Link href={isSignedIn ? "/home" : "/auth/sign-in"}>
									<div className="inline-flex items-center justify-center gap-1 font-medium leading-snug transition-none duration-500 ease-in-out shadow-sm text-zinc-200 hover:text-zinc-100 hover:cursor-pointer whitespace-nowrap">
										{isSignedIn ? "Dashboard" : "Sign in"}
										<ArrowLongRightIcon className="hidden w-6 h-6 md:block " />
									</div>
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</div>
			{/* Fancy fading bottom border */}
			<div
				className={classNames(
					"absolute w-full transition-all duration-1000  h-px -bottom-px from-zinc-400/0 via-zinc-400/70 to-zinc-400/0 bg-gradient-to-l",
					{
						"opacity-0": !isScrolled,
						"opacity-100": isScrolled,
					},
				)}
			/>
		</header>
	);
};
