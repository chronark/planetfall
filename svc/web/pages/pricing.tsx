import React from "react";

import { Footer, Header, Pricing } from "components/landing";
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
        <Header />

        <main className="grow">
          <Pricing />
        </main>

        {/*  Site footer */}
        <Footer />
      </div>
    </>
  );
}

export default Home;
