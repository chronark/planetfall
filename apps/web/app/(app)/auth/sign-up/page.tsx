import { SignUp } from "@clerk/nextjs/app-beta";
export default function SignUppage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-zinc-100 to-white">
      <SignUp signInUrl="/auth/sign-in" redirectUrl="/home" />
    </div>
  );
}
