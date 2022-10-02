import { Layout } from "../../components/app/layout/nav";

import React from "react";
import { useRouter } from "next/router";
import { WithAuth } from "../../components/auth/auth";

export default function Teampage() {

  // const router = useRouter();

  // router.push(router.asPath + "/endpoints");

  return (
    <WithAuth>

      <Layout breadcrumbs={[]}>
        Hello, please go to Endpoints
      </Layout>
    </WithAuth>
  );
}
