import React from "react";
import "tailwindcss/tailwind.css";

import { Features } from "./features";
import { Cta } from "./cta";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import { Stats } from "./stats";

export default async function LandingPage() {
	return (
		<div className="relative grow">
			


			<Hero />
			<Stats />
			<Features />
			<Cta />
			<Pricing />
		</div>
	);
}
