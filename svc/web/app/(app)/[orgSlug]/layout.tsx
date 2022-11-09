import { clerkClient } from "@clerk/clerk-sdk-node"
import { currentUser } from "@clerk/nextjs/app-beta"
import { db } from "@planetfall/db"
import { notFound, redirect } from "next/navigation"
import { DesktopNavbar } from "../navbar-desktop"


export default async function AppLayout(props: { children: React.ReactNode, params?: { orgSlug?: string } }) {
    const breadCrumbs: { label: string, href: string }[] = []


    const user = await currentUser()
    if (!user) {
        redirect("/auth/sign-in")
        return
    }
    if (props.params?.orgSlug) {
        

        const org = await clerkClient.organizations.getOrganization({ slug: props.params.orgSlug }).catch(err=>{
            console.warn(err)
            return null
        })


        if (!org) {
            notFound()
            return
        }
       

        breadCrumbs.push({ label: org.name, href: `/${org.slug}` })

    }



    return <div className="bg-white min-h-screen">
        <DesktopNavbar orgSlug={props.params?.orgSlug} breadCrumbs={breadCrumbs} />

        <main>
            {props.children}
        </main>
    </div>
}