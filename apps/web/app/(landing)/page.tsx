import React from "react";
import "tailwindcss/tailwind.css";

import { Features } from "./features";
import { Cta } from "./cta";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
// import { Stats } from "./stats";
// import { Companies } from "./companies";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function LandingPage() {
	return (
		<div className="bg-white">
			<Hero />

			{/* <Companies /> */}
			{/* <Stats /> */}
			<Features />
			{/* <Testimonials /> */}
			<Cta />

			<Pricing />
		</div>
	);
}
