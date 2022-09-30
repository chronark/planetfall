import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  return (
    <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
      <SignIn
        redirectUrl="/home"
        path={router.pathname}
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
}
