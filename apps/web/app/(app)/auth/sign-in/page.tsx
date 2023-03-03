import { SignIn } from "@clerk/nextjs/app-beta";
export default function SignInpage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-zinc-100 to-white">
      <SignIn signUpUrl="/auth/sign-up" redirectUrl="/home" />
    </div>
  );
}
