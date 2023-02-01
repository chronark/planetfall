import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export const Cta: React.FC = (): JSX.Element => {
	return (
		<section>
			<div className="max-w-6xl px-4 mx-auto sm:px-6">
				{/* CTA box */}
				<div className="px-10 py-8 duration-1000 border rounded text-zinc-900 bg-gradient-to-r drop-shadow-cta from-zinc-100 to-zinc-200 hover:text-zinc-900">
					<div className="flex flex-col items-center justify-between lg:flex-row">
						{/* CTA content */}
						<div className="mb-6 text-center lg:mr-16 lg:mb-0 lg:text-left">
							<h3 className="mb-2 text-4xl font-bold font-uncut-sans">
								Get started with Planetfall
							</h3>
							<p className="text-zinc-500">
								Create your first API check in seconds! No credit card required.
							</p>
						</div>
						{/* CTA button */}
						<div className="shrink-0">
							<Link
								href="/auth/sign-in"
								className="inline-flex items-center justify-center px-8 py-4 font-medium leading-snug transition-all duration-300 ease-in-out rounded hover:shadow-xl bg-zinc-900 hover:cursor-pointer whitespace-nowrap text-zinc-100 hover:bg-zinc-800 group"
							>
								<span>Sign In</span>
								<ArrowRight className="hidden w-6 h-6 ml-1 transition-transform duration-150 ease-out md:block" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
