import React from "react";
import "tailwindcss/tailwind.css";

import { Features } from "./features";
import { Cta } from "./cta";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import Script from "next/script";
// import { Stats } from "./stats";
// import { Companies } from "./companies";

export const dynamic = "force-static";
export const revalidate = 3600;

const crispyScript = `window.$crisp=[];window.CRISP_WEBSITE_ID="36468086-4e2e-4499-8b8d-32238bb2831c";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`;

export default async function LandingPage() {
	return (
		<div className="bg-white">
			<Script
				id="crispy-script"
				dangerouslySetInnerHTML={{ __html: crispyScript }}
				strategy="lazyOnload"
			/>
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
