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

  const slug = clerkUser.username
    ? slugify(clerkUser.username, { lower: true, trim: true })
    : newAnimalId();


    console.log({clerkUser})
  const user = await db.user.create({
    data: {
      id: clerkUser.id,
      name: slug,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      teams: {
        create: {
          role: "OWNER",
          team: {
            create: {
              id: newId("team"),
              name: "Personal",
              slug,
              maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
              maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
              maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
              maxPages: DEFAULT_QUOTA.FREE.maxStatusPages,
              plan: "FREE",
            }
          }
        }
      }
    },
    include: {
      teams: {
        include: {
          team: true
        }
      }
    }
  });

  return redirect(`/${user.teams[0].team.slug}`);
}
