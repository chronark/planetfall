import { Button } from "@/components/button";
import { auth } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { Email } from "@planetfall/emails";
import { Link } from "lucide-react";

export default async function DebugUserPage() {
  const { userId, session } = auth();
  if (!userId) {
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

  const user =await db.user.findUnique({
    where: { id: userId },
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
