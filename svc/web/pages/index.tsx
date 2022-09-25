import React from "react";

import { Features, Footer, Header, Hero, Pricing } from "components/landing";
import Head from "next/head";

function Home() {
  return (
    <>
      <Head>
        <title>Planetfall - API Latency Across the Planet.</title>
        <meta
          name="description"
          content="Keep track of your API latency and performance across the globe."
        />
        <script
          defer
          data-domain="planetfall.io"
          src="https://plausible.io/js/plausible.js"
        >
        </script>
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/*  Site header */}
        <Header />

        {/*  Page content */}
        <main className="grow">
          {/*  Page sections */}

          <Hero />
          {/* <Companies /> */}
          <Features />
          {/* <Features02 /> */}
          <Pricing />
          {/* <Testimonials /> */}
          {/* <Resources /> */}
          {/* <Cta /> */}
        </main>

        {/*  Site footer */}
        <Footer />
      </div>
    </>
  );
}

export default Home;
