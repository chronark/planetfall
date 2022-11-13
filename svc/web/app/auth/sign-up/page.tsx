import { redirect } from "next/navigation";
import { currentUser, SignUp } from "@clerk/nextjs/app-beta";
import slugify from "slugify";

export default async function SignUpPage() {
  const user = await currentUser();
  if (user) {
    redirect(`/${slugify(user.username!)}`);
  }

  return (
    <div className="flex items-center justify-center">
      <SignUp />
    </div>
  );
}
