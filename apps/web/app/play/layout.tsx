import { Button } from "@/components/button";
import { currentUser } from "@clerk/nextjs/app-beta";
import Link from "next/link";
import { Breadcrumbs } from "../(app)/breadcrumbs";
import { NavLink } from "../(app)/navlink";
import { UserButton } from "../(app)/user-button";

const navigation = [
  {
    name: "Dashboard",
    href: "/home",
  },
  {
    name: "Support",
    href: "/support",
  },
];

export default async function PlayLayout(props: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <div className="min-h-screen pb-8 bg-zinc-50 lg:pb-16">
      <nav className="bg-white border-b border-zinc-300">
        <div className="container px-4 pt-2 mx-auto sm:px-0">
          <div className="flex items-center justify-between">
            <Breadcrumbs withWordMark={true} prefix={["play"]} />
            {user ? (
              <UserButton
                user={{
                  email: user.emailAddresses[0]?.emailAddress,
                  name: user.username ?? "",
                  image: user.profileImageUrl,
                }}
              />
            ) : (
              <Link href="/auth/sign-in?to=/play">
                <Button variant="link">Sign In</Button>
              </Link>
            )}
          </div>
          <div className="mt-2 lg:mt-4">
            {navigation.map((item) => (
              <NavLink key={item.name} href={item.href} label={item.name} />
            ))}
          </div>
        </div>
      </nav>

      <main className="px-4 lg:px-0">{props.children}</main>
    </div>
  );
}
