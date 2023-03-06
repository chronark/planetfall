import { SignIn } from "@clerk/nextjs/app-beta";

export default function SignInPage() {
  return <SignIn signUpUrl="/sign-up" />;
}
