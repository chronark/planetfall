import { SignUp } from "@clerk/nextjs/app-beta";

export default function SignInPage() {
  return <SignUp signInUrl="/auth/sign-in" />;
}
