import { Breadcrumbs } from "../breadcrumbs";
import { NavLink } from "../navlink";
import { UserButton } from "../user-button";
import { Chat } from "./chat";
import { Card, CardContent } from "@/components/card";
import { currentUser } from "@clerk/nextjs/app-beta";
import { Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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

      <div className="container flex flex-col justify-between mx-auto mt-16 space-y-16 md:flex-row md:space-y-0 md:space-x-16">
        <div className="w-full mx-4 md:mx-0 md:w-1/3">
          <h2 className="text-3xl font-bold tracking-tight text-zink-900">Get in touch</h2>

          <dl className="mt-10 space-y-2 text-base leading-7 md:space-y-4 text-zink-400">
            <div className="flex gap-x-4">
              <dt className="flex-none">
                <span className="sr-only">Twitter</span>
                <Twitter className="w-6 h-7 text-zink-400" aria-hidden="true" />
              </dt>
              <Link
                target="_blank"
                className="hover:text-zink-900"
                href="https://twitter.com/chronark_"
              >
                @chronark_
              </Link>
            </div>
            <div className="flex gap-x-4">
              <dt className="flex-none">
                <span className="sr-only">Email</span>
                <Mail className="w-6 h-7 text-zink-400" aria-hidden="true" />
              </dt>
              <dd>
                <Link className="hover:text-zink-900" href="mailto:support@planetfall.io">
                  support@planetfall.io
                </Link>
              </dd>
            </div>
            <div className="flex gap-x-4">
              <dt className="flex-none">
                <span className="sr-only">Discord</span>
                <Discord className="w-6 h-7 text-zink-400" />
              </dt>
              <dd>
                <Link
                  target="_blank"
                  className="hover:text-zink-900"
                  href="https://discord.gg/438dArF6pJ"
                >
                  discord.gg/438dArF6pJ
                </Link>
              </dd>
            </div>
          </dl>
        </div>

        {/* On mobile I don't like the look of a card */}
        <div className="w-full md:hidden ">
          <Chat />
        </div>
        {/* Use a card on larger screens */}
        <div className="hidden w-2/3 md:block">
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

const Discord = ({ className }: { className: string }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36">
      <g id="图层_2" data-name="图层 2">
        <g id="Discord_Logos" data-name="Discord Logos">
          <g id="Discord_Logo_-_Large_-_White" data-name="Discord Logo - Large - White">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </g>
        </g>
      </g>
    </svg>
  );
};
