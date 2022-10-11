import React from "react";

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
import { PrismaClient } from "@planetfall/db";
import { GetStaticProps, NextPage } from "next";

const Landing: NextPage<StatsProps> = ({ teams, endpoints, checks }) => {
  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/*  Site header */}
        <Header />

        {/*  Page content */}
        <main className="grow">
          {/*  Page sections */}

          <Hero />
          {/* <Companies /> */}
          <Stats teams={teams} endpoints={endpoints} checks={checks} />
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

export default Landing;

export const getStaticProps: GetStaticProps<StatsProps> = async () => {
  const db = new PrismaClient();

  const props = {
    teams: await db.team.count(),
    endpoints: await db.endpoint.count(),
    checks: await db.check.count({
      where: { time: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    }) / 60 / 60,
  };

  await db.$disconnect();
  return {
    props,
    revalidate: 60,
  };
};
