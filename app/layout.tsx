import Link from "next/link";

import { siteConfig } from "@/config/site";
import { docsConfig } from "@/config/docs";
import { MainNav } from "@/components/main-nav";
import { DocsSearch } from "@/components/docs/search";
import { SiteFooter } from "@/components/site-footer";
import { DocsSidebarNav } from "@/components/docs/sidebar-nav";

export { reportWebVitals } from "next-axiom";

interface DocsLayoutProps {
	children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="sticky top-0 z-40 w-full bg-white border-b border-b-slate-200">
				<div className="container flex items-center h-16 space-x-4 sm:justify-between sm:space-x-0">
					<MainNav items={docsConfig.mainNav}>
						<DocsSidebarNav items={docsConfig.sidebarNav} />
					</MainNav>
					<div className="flex items-center flex-1 space-x-4 sm:justify-end">
						<div className="flex-1 sm:flex-grow-0">
							<DocsSearch />
						</div>
						<nav className="flex space-x-4">
							<Link
								href={siteConfig.links.github}
								target="_blank"
								rel="noreferrer"
							>
								<div className="flex items-center justify-center rounded-full h-7 w-7 bg-slate-900 text-slate-50 hover:bg-slate-600">
									<Icons.gitHub className="w-4 h-4 fill-white" />
									<span className="sr-only">GitHub</span>
								</div>
							</Link>
						</nav>
					</div>
				</div>
			</header>
			<div className="container flex-1">{children}</div>
			<SiteFooter />
		</div>
	);
}
