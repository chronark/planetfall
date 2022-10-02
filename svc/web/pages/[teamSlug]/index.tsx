import { Layout } from "../../components/app/layout/nav";

import React from "react";
import { useRouter } from "next/router";

export default function Teampage() {
  // const router = useRouter();

  // router.push(router.asPath + "/endpoints");

  return (
    <Layout breadcrumbs={[]}>
      Hello, please go to Endpoints
    </Layout>
  );
}
