import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export const Cta: React.FC = (): JSX.Element => {
	return (
		<section className="py-16 text-center bg-white sm:py-24 lg:py-32">
			<div className="max-w-6xl px-4 mx-auto bg-white sm:px-6">
				<h2 className="text-4xl font-bold tracking-tight text-black">
					Get started with Planetfall
				</h2>
				<p className="max-w-xl mx-auto mt-6 text-lg leading-8 text-zinc-600">
					Create your first API check in seconds! No credit card required.
				</p>
				<div className="flex items-center justify-center mt-10 gap-x-6">
					<a
						href="#"
						className="rounded-md bg-zinc-900 px-3.5 py-1.5 text-base font-semibold leading-7 text-zinc-100 shadow-sm hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
					>
						Get started
					</a>
					<a
						href="#"
						className="text-base font-semibold leading-7 text-zinc-900"
					>
						Learn more <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</section>
	);
};
