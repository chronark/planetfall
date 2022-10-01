import { Layout } from "../../components/app/layout/nav";
import { useUser } from "@clerk/nextjs";

import React from "react";

export default function Teampage() {
    const { user } = useUser();

    const breadcrumbs = user?.username ? [] : [];

    return (
        <Layout breadcrumbs={breadcrumbs}>
            Hello, please go to Endpoints
        </Layout>
    );
}
