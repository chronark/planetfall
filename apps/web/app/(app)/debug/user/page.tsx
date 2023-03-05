import { Button } from "@/components/button";
import { getSession } from "@/lib/auth";
import { db } from "@planetfall/db";
import { Link } from "lucide-react";
import { Email } from "@planetfall/emails";

export default async function DebugUserPage() {
  const { session } = await getSession();
  if (!session) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen">
        <Link href="/auth/sign-in">
          <Button variant="primary" size="lg">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      teams: true,
    },
  });

  const email = new Email();
  // not awaited
  email
    .sendDebugEvent({
      time: Date.now(),
      data: { session, user },
    })
    .catch((e) => console.error(e));

  return (
    <div className="flex items-center justify-center w-screen min-h-screen">
      <pre className="p-8 m-16 border rounded lg:p-16 bg-zinc-50 border-zinc-300">
        {JSON.stringify({ session, user }, null, 2)}
      </pre>
    </div>
  );
}
