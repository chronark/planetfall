import React from "react";
import "tailwindcss/tailwind.css"

import {
  Cta,
  Features,
  Header,
  Hero,
  Pricing,
  Stats,
  // Companies,
  StatsProps,
} from "../../components/landing";
import { db } from "@planetfall/db";



export const revalidate = 60 * 60 // revalidate every hour

async function getData() {


  // const [teams, endpoints,checks] = await Promise.all([
  //   db.team.count(),
  //   db.endpoint.count(),
  //   await db.check.count({ where: { time: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }) / 24 / 60 / 60
  // ])


  return {
    teams: 0, endpoints: 0, checks: 0
  }
}



export default async function LandingPage() {
  const { teams, endpoints, checks } = await getData()


  return (
    <>

      


        {/*  Page content */}
        <main className="grow">
          {/*  Page sections */}
      

          <Hero />
          {/* <Companies /> */}
          <Stats teams={teams} endpoints={endpoints} checks={checks} />
          <Features />
          <Cta/>
          <Pricing />
          {/* <Testimonials /> */}
        </main>

        {/*  Site footer */}
    
    </>
  );
};

