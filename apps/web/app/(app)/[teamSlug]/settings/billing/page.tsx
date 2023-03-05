import { db } from "@planetfall/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardHeaderTitle } from "@/components/card";
import { BillingButton } from "./button";

export default async function PlanPage(props: { params: { teamSlug: string } }) {
  const { session } = await getSession();
  if (!session) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
  });
  if (!team) {
    return redirect("/home");
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardHeaderTitle
            title="Billing"
            subtitle="Manage your billing information and past invoices."
          />
        </CardHeader>
        <CardContent>
          <BillingButton teamId={team.id} />
        </CardContent>
      </Card>
    </div>
  );
}
