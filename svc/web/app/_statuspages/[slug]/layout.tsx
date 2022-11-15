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
						<div className="shrink-0 mr-4">
							<Link href="/" aria-label="Planetfall">
								<div className="flex items-center gap-2 group ">
									<Logo className="w-10 h-10 group-hover:text-black text-slate-900 duration-500" />
									<span className="font-semibold text-2xl group-hover:text-black text-slate-900 duration-500">
										Planetfall
									</span>
								</div>
							</Link>
						</div>
						<nav className="flex grow items-center">
							<ul className="flex grow justify-end flex-wrap items-center gap-8">
								{session ? (
									<li key="home" className="hidden md:block">
										<Link
											className="font-medium text-gray-600 hover:text-gray-200 px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out"
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
			<footer className="border-t bottom-0 inset-x-0 py-16">
				<p className="text-center text-slate-400">
					Powered by{" "}
					<Link
						className="text-primary-400 font-medium hover:text-slate-600"
						href="https://planetfall.io"
					>
						planetfall.io
					</Link>
				</p>
			</footer>
		</div>
	);
}
