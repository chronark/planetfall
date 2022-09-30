import { SignOutButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="absolute inset-0 w-screen h-screen flex items-center justify-center">
      <SignOutButton>Sign Out</SignOutButton>
    </div>
  );
}
