import { currentUser } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { newAnimalId } from "@planetfall/id";
import { newId } from "@planetfall/id";
import { redirect } from "next/navigation";
import { DEFAULT_QUOTA } from "plans";
import slugify from "slugify";

export default async function OnboardingPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return redirect("/auth/sign-in");
  }



  const user = await db.user.upsert({
    where: {
      id: clerkUser.id,
    },
    update: {
      email: clerkUser.emailAddresses[0].emailAddress,
      name: slug,
    },
    create: {
      id: clerkUser.id,
      name: slug,
      email: clerkUser.emailAddresses[0].emailAddress,
    },
  });

  const slug = clerkUser.username
    ? slugify(clerkUser.username, { lower: true, trim: true })
    : newAnimalId();

  const team = await db.team.create({
    data: {
      id: newId("team"),
      name: "Personal",
      slug,
      maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
      maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
      maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
      maxPages: DEFAULT_QUOTA.FREE.maxStatusPages,
      plan: "FREE",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });
  return redirect(`/${team.slug}`);
}
