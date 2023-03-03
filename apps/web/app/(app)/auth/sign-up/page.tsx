import { auth } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs/app-beta";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function SignUppage() {
  const { userId } = auth();
  if (userId) {
    return redirect("/home");
  }
  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-tr from-zinc-100 to-white">
      <main className="relative flex items-center justify-center h-full">
        <div>
          <div className="flex flex-col items-center justify-center px-12 py-24 space-y-3 text-center">
            <Link href="https://planetfall.io">
              <Logo className="w-10 h-10" />
            </Link>
            <h3 className="text-xl font-semibold">Sign In</h3>
            <div className="flex flex-col w-full gap-4">
              <p className="text-sm text-zinc-500">Use your GitHub account to sign in.</p>
              <SignUp signInUrl="/auth/sign-in" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
