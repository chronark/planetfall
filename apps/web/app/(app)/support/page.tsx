import { Card, CardContent } from "@/components/card";
import { auth, currentUser } from "@clerk/nextjs/app-beta";
import { Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "../breadcrumbs";
import { NavLink } from "../navlink";
import { UserButton } from "../user-button";
import { Chat } from "./chat";

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

export default async function AppLayout() {
  const user = await currentUser();
  if (!user) {
    return redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen pb-8 bg-zinc-50 lg:pb-16">
      <nav className="bg-white border-b border-zinc-300">
        <div className="container px-4 pt-2 mx-auto sm:px-0">
          <div className="flex items-center justify-between">
            <Breadcrumbs withWordMark={true} prefix={["support"]} />

            <UserButton
              user={{
                email: user.emailAddresses[0]?.emailAddress,
                name: user.username ?? "",
                image: user.profileImageUrl,
              }}
            />
          </div>
          <div className="mt-2 lg:mt-4">
            {navigation.map((item) => (
              <NavLink key={item.name} href={item.href} label={item.name} />
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-16 container mx-auto flex flex-col md:flex-row justify-between space-y-16 md:space-y-0 md:space-x-16">
        <div className=" w-full md:w-1/3">
          <h2 className="text-3xl font-bold tracking-tight text-zink-900">Get in touch</h2>

          <dl className="mt-10 space-y-4 text-base leading-7 text-zink-400">
            <div className="flex gap-x-4">
              <dt className="flex-none">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-7 w-6 text-zink-400" aria-hidden="true" />
              </dt>
              <Link className="hover:text-zink-900" href="https://twitter.com/chronark_">
                @chronark_
              </Link>
            </div>
            <div className="flex gap-x-4">
              <dt className="flex-none">
                <span className="sr-only">Email</span>
                <Mail className="h-7 w-6 text-zink-400" aria-hidden="true" />
              </dt>
              <dd>
                <Link className="hover:text-zink-900" href="mailto:support@planetfall.io">
                  support@planetfall.io
                </Link>
              </dd>
            </div>
          </dl>
        </div>

        <div className="w-full md:w-2/3">
          <Card>
            <CardContent>
              <Chat />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
