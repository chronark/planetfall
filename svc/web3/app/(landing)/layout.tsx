import { Footer, Header } from "../../components/landing"




import { cookies } from 'next/headers';
 import { unsealData } from "iron-session";





// export const revalidate = 3600; // revalidate every hour

async function getSession() {

  const sessionCookie = cookies().get(
    process.env.VERCEL ? "planetfall_auth" : "planetfall_auth_local",
  );
  if (!sessionCookie) {
    return { session: null }
  }
  const session = await unsealData<
    { user: { id: string; tolen: string; expires: number } }
  >(sessionCookie, { password: process.env.IRON_SESSION_SECRET! });
  if (session.user.expires <= Date.now()) {
    return { session: null };
  }
  return {
    session
  }
}

export default async function Landing({
  children,
}: {
  children: React.ReactNode
}) {
  const { session } = await getSession()
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-to-tr from-black to-[#060823]">

      <Header session={session} /> 
      <main>

        {children}
      </main>
      <Footer/>
    </div>
  )
}



