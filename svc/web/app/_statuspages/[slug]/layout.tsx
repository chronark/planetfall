import { getSession } from "lib/auth";
import Link from "next/link";
import { Logo } from "../../components/logo";

// export const revalidate = 3600; // revalidate every hour

export default async function ({ children }: { children: React.ReactNode }) {
	const session = await getSession();
	return (
		<div className="flex flex-col min-h-screen overflow-hidden ">
			<header className="fixed top-0  w-full z-50  transition-shadow duration-500  backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-white/50">
				<div className="container mx-auto">
					<div className="flex items-center justify-between h-16 md:h-20">
						<div className="mr-4 shrink-0">
							<Link href="/" aria-label="Planetfall">
								<div className="flex items-center gap-2 group ">
									<Logo className="w-10 h-10 group-hover:text-black text-zinc-900 duration-500" />
									<span className="text-2xl font-semibold group-hover:text-black text-zinc-900 duration-500">
										Planetfall
									</span>
								</div>
							</Link>
						</div>
						<nav className="flex items-center grow">
							<ul className="flex flex-wrap items-center justify-end grow gap-8">
								{session ? (
									<li key="home" className="hidden md:block">
										<Link
											className="flex items-center px-3 py-2 font-medium text-gray-600 hover:text-gray-200 lg:px-5 transition duration-150 ease-in-out"
											href="/home"
										>
											Dashboard
										</Link>
									</li>
								) : (
									<div />
								)}
							</ul>
						</nav>
					</div>
				</div>
			</header>
			<main>{children}</main>
			<footer className="inset-x-0 bottom-0 py-16 border-t">
				<p className="text-center text-zinc-400">
					Powered by{" "}
					<Link
						className="font-medium text-primary-400 hover:text-zinc-600"
						href="https://planetfall.io"
					>
						planetfall.io
					</Link>
				</p>
			</footer>
		</div>
	);
}
