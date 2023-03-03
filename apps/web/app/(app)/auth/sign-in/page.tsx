import { auth } from "@clerk/nextjs/app-beta";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs/app-beta";
export default function SignInpage() {
  const { userId } = auth();
  if (userId) {
    return redirect("/home");
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-zinc-100 to-white">
      <SignIn signUpUrl="/auth/sign-up" />
    </div>
  );
}
