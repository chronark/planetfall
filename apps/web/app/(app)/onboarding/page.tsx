import { currentUser } from "@clerk/nextjs/app-beta";
import { db } from "@planetfall/db";
import { newAnimalId } from "@planetfall/id";
import { newId } from "@planetfall/id";
import { redirect } from "next/navigation";
import { DEFAULT_QUOTA } from "plans";

export default async function OnboardingPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return redirect("/auth/sign-in");
  }

  const slug = newAnimalId();
  let user = await db.user.findUnique({
    where: {
      id: clerkUser.id,
    },
    include: {
      teams: {
        include: {
          team: true,
        },
      },
    },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        id: clerkUser.id,
        name: clerkUser.username ?? slug,
        email: clerkUser.emailAddresses[0].emailAddress,
        teams: {
          create: {
            role: "OWNER",
            team: {
              create: {
                id: newId("team"),
                name: clerkUser.username ?? slug,
                slug,
                maxEndpoints: DEFAULT_QUOTA.FREE.maxEndpoints,
                maxMonthlyRequests: DEFAULT_QUOTA.FREE.maxMonthlyRequests,
                maxTimeout: DEFAULT_QUOTA.FREE.maxTimeout,
                maxPages: DEFAULT_QUOTA.FREE.maxStatusPages,
                plan: "FREE",
              },
            },
          },
        },
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  redirect(`/${user.teams[0].team.slug}`);
}
