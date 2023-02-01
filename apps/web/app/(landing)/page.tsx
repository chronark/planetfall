import React from "react";
import "tailwindcss/tailwind.css";

import { Features } from "./features";
import { Cta } from "./cta";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import { Stats } from "./stats";
// import { Companies } from "./companies";

export const revalidate = 360; // revalidate every hour

export default async function LandingPage() {
	return (
		<div>
			<Hero />
			{/* <Companies /> */}
			{/* <Stats /> */}
			<Features />
			<Cta />
			<Pricing />
		</div>
	);
}
