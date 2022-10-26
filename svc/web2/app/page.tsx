import React from "react";
import "tailwindcss/tailwind.css"

import {
  Features,
  Footer,
  Header,
  Hero,
  Pricing,
  Stats,
  // Companies,
  StatsProps,
} from "components/landing";
// import { PrismaClient } from "@prisma/client";
import { GetStaticProps, NextPage } from "next";


import { cookies } from 'next/headers';
import { unsealData } from "iron-session";





export const revalidate = 3600; // revalidate every hour

// async function getData(){

//   const db = new PrismaClient();

//   const props = {
//     teams: await db.team.count(),
//     endpoints: await db.endpoint.count(),
//     checks: await db.check.count({
//       where: { time: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
//     }) / 60 / 60,
//   };

//   await db.$disconnect();
//   return props;
// };






async function getSession() {

  const sessionCookie = cookies().get(
    process.env.VERCEL ? "planetfall_auth" : "planetfall_auth_local",
  );
  if (!sessionCookie) {
    return { session: null }
  }
  const session = await unsealData<
    { user: { id: string; tolen: string; expires: number } }
  >(sessionCookie, { password: process.env.IRON_SESSION_SECRET! });
  if (session.user.expires <= Date.now()) {
    return { session: null };
  }
  return {
    session
  }
}


export default async function LandingPage() {
  // const {teams,endpoints,checks} = await getData()
  const {session} = await getSession()
  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/*  Site header */}
        {/* <Header session={session} /> */}
        <div>

HELLO WORLD
        </div>
        {/*  Page content */}
        <main className="grow">
          {/*  Page sections */}

          <Hero />
          {/* <Companies /> */}
          <Stats teams={0} endpoints={0} checks={0} />
          <Features />
          <Pricing />
          {/* <Testimonials /> */}
        </main>

        {/*  Site footer */}
        <Footer />
      </div>
    </>
  );
};

