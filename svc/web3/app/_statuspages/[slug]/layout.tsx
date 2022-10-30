
import { cookies } from 'next/headers';
import { unsealData } from "iron-session";
import Link from 'next/link';
import { Logo } from "../../components/logo";
import { NextPage } from 'next';
import { PropsWithChildren } from 'react';





// export const revalidate = 3600; // revalidate every hour

async function getSession() {

    const sessionCookie = cookies().get(
        process.env.VERCEL ? "planetfall_auth" : "planetfall_auth_local",
    );
    if (!sessionCookie) {
        return { session: null }
    }
    const session = await unsealData<
        { user: { id: string; token: string; expires: number } }
    >(sessionCookie, { password: process.env.IRON_SESSION_SECRET! });
    if (session.user.expires <= Date.now()) {
        return { session: null };
    }
    return {
        session
    }
}

export default async  function ({ children }: { children: React.ReactNode }) {
    const { session } = await getSession()
    console.log({session})
    return (
        <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-tr from-black to-[#060823]">

            <header
                className="fixed top-0  w-full z-50  transition-shadow duration-500 bg-black/95 backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-black/50"
            >
                <div className="container mx-auto">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <div className="shrink-0 mr-4">

                            <Link
                                href="/"
                                aria-label="Planetfall"
                            >
                                <div className="flex items-center gap-2 group ">
                                    <Logo className="w-10 h-10 group-hover:text-white text-primary-100 duration-500" />
                                    <span className="font-semibold text-2xl group-hover:text-white text-primary-100 duration-500">
                                        Planetfall
                                    </span>
                                </div>
                            </Link>
                        </div>
                        <nav className="flex grow items-center">
                            <ul className="flex grow justify-end flex-wrap items-center gap-8">
                                {
                                    session ?
                                        <li key="home" className="hidden md:block">
                                            <Link
                                                className="font-medium text-gray-400 hover:text-gray-200 px-3 lg:px-5 py-2 flex items-center transition duration-150 ease-in-out"
                                                href="/home"
                                            >
                                                Dashboard
                                            </Link>
                                        </li>

                                       :<div></div> }

                            </ul>
                        </nav>
                    </div>
                </div>
            </header>
            <main>

                {children}
            </main>
            <footer>
                Hello
            </footer>
        </div>
    )
}

