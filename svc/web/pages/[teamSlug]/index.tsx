import { Layout } from "../../components/app/layout/nav";
import { useUser } from "@clerk/nextjs";

import React from "react";
import { useRouter } from "next/router";

export default function Teampage() {
    const { user } = useUser();

    const breadcrumbs = user?.username ? [] : [];
    const router = useRouter()

    router.push(router.asPath + "/endpoints")

    return (
        <Layout breadcrumbs={breadcrumbs}>
            Hello, please go to Endpoints
        </Layout>
    );
}
