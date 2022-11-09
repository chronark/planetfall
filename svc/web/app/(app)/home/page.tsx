import { currentUser } from "@clerk/nextjs/app-beta";
import { asyncComponent } from "lib/api/component";
import { redirect } from "next/navigation";
import slugify from "slugify";

export default  asyncComponent(async ()=>{


    const user = await currentUser()
    if (user){
        redirect(`/${slugify(user.username!)}`)
    }

    return <div>Redirecting</div>
})