import React from "react";
import "tailwindcss/tailwind.css";

import { Cta } from "./cta";
import { Features } from "./features";
import { Hero } from "./hero";
import { Pricing } from "./pricing";
import { Stats } from "./stats";
// import { Companies } from "./companies";

// export const config = {
//   runtime: "edge",
// };

export const revalidate = 3600;

export default async function LandingPage() {
  return (
    <div className="bg-white">
      <Hero />

      {/* <Companies /> */}
      <Stats />
      <Features />
      {/* <Testimonials /> */}
      <Cta />

      <Pricing />
    </div>
  );
}
