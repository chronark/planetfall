"use client"
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { useClerk } from "@clerk/nextjs/app-beta/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SignUppage() {
  const clerk = useClerk();
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-zinc-100 to-white">
      <Button
        onClick={async () => {
          setLoading(true);
          await clerk.signOut
          router.refresh()

          setLoading(false);
        }}
      >{loading ? <Loading /> : "Sign Out"}</Button>
    </div>
  );
}
