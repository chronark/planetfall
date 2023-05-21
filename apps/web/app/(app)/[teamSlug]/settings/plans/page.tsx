import { ContactButton, CurrentButton, DowngradeButton, UpgradeButton } from "./cta";
import { auth } from "@clerk/nextjs/app-beta";
import { Plan, db } from "@planetfall/db";
import { Check, Minus } from "lucide-react";
import { redirect } from "next/navigation";
import { DEFAULT_QUOTA } from "plans";
import { Fragment } from "react";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
export default async function PlanPage(props: { params: { teamSlug: string } }) {
  const { userId } = auth();
  if (!userId) {
    return redirect("/auth/sign-in");
  }
  const team = await db.team.findUnique({
    where: { slug: props.params.teamSlug },
    include: { members: true },
  });
  if (!team) {
    return redirect("/home");
  }
  if (!team.members.find((m) => m.userId === userId)) {
    return redirect("/home");
  }

  const tiers: {
    plan: Plan;
    name: string;

    price:
      | {
          checks: number;
          price: number;
        }
      | string;
    description: string;
    cta: React.ReactNode;
  }[] = [
    {
      plan: "FREE",
      name: "Free",

      price: "$0",
      description: "No credit card required",
      cta:
        team.plan === "FREE" ? <CurrentButton /> : <DowngradeButton plan="FREE" teamId={team.id} />,
    },
    {
      plan: "PRO",
      name: "Pro",

      price: {
        checks: 10000,
        price: 1,
      },
      description: "Pay as you go",
      cta:
        team.plan === "FREE" ? (
          <UpgradeButton plan="PRO" teamId={team.id} />
        ) : team.plan === "PRO" ? (
          <CurrentButton />
        ) : (
          <DowngradeButton plan="PRO" teamId={team.id} />
        ),
    },
    {
      plan: "ENTERPRISE",
      name: "Enterprise",

      price: "Custom",
      description: "For large-scale APIs",
      cta:
        team.plan === "FREE" ? (
          <ContactButton />
        ) : team.plan === "PRO" ? (
          <ContactButton />
        ) : (
          <CurrentButton />
        ),
    },
  ];
  const sections: {
    name: string;
    features: {
      name: string;
      tiers: Record<string, string | boolean>;
    }[];
  }[] = [
    {
      name: "Features",
      features: [
        {
          name: "Checks",
          tiers: {
            Free: `Up to ${Intl.NumberFormat(undefined, { notation: "compact" }).format(
              DEFAULT_QUOTA.FREE.maxMonthlyRequests,
            )}`,
            Pro: `Up to ${Intl.NumberFormat(undefined, { notation: "compact" }).format(
              DEFAULT_QUOTA.PRO.maxMonthlyRequests,
            )}`,
            Enterprise: "∞",
          },
        },
        {
          name: "Status Pages",
          tiers: {
            Free: DEFAULT_QUOTA.FREE.maxStatusPages.toString(),
            Pro: DEFAULT_QUOTA.PRO.maxStatusPages.toString(),
            Enterprise: "∞",
          },
        },
        {
          name: "Teams",
          tiers: { Free: false, Pro: true, Enterprise: true },
        },
      ],
    },
    {
      name: "Regions",
      features: [
        {
          name: "18 Vercel Edge Regions",
          tiers: {
            Free: true,
            Pro: true,
            Enterprise: true,
          },
        },
        {
          name: "26 Fly.io Regions",
          tiers: {
            Free: true,
            Pro: true,
            Enterprise: true,
          },
        },
        {
          name: "22 AWS Regions",
          tiers: {
            Free: false,
            Pro: true,
            Enterprise: true,
          },
        },
      ],
    },

    {
      name: "Alerts",
      features: [
        {
          name: "Email",
          tiers: {
            Free: true,

            Pro: true,
            Enterprise: true,
          },
        },
        {
          name: "Slack",
          tiers: {
            Free: true,

            Pro: true,
            Enterprise: true,
          },
        },
      ],
    },
  ];
  return (
    <>
      <div className="max-w-md mx-auto space-y-8 md:hidden">
        {tiers.map((tier) => (
          <section key={tier.name} className="p-8">
            <h3 id={tier.name} className="text-sm font-semibold leading-6 text-zinc-900">
              {tier.name}
            </h3>
            <p className="mt-4">
              {typeof tier.price === "string" ? (
                <span className="text-4xl font-bold tracking-tight text-zinc-900">
                  {tier.price}
                </span>
              ) : (
                <>
                  <span className="text-4xl font-bold tracking-tight text-zinc-900">
                    ${tier.price.price}
                  </span>
                  <span className="text-base font-medium text-zinc-900">
                    /{tier.price.checks.toLocaleString()} Checks
                  </span>
                </>
              )}
            </p>

            {tier.cta}

            <ul role="list" className="mt-10 space-y-4 text-sm leading-6 text-zinc-900">
              {sections.map((section) => (
                <li key={section.name}>
                  <ul role="list" className="space-y-4">
                    {section.features.map((feature) =>
                      feature.tiers[tier.name] ? (
                        <li key={feature.name} className="flex w-full gap-x-3">
                          <Check
                            className="flex-none w-5 h-6 text-primary-500"
                            aria-hidden="true"
                          />
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="flex items-center gap-2">{feature.name}</span>
                            {typeof feature.tiers[tier.name] === "string" ? (
                              <span className="text-sm leading-6 text-zinc-500">
                                {feature.tiers[tier.name]}
                              </span>
                            ) : null}
                          </div>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* lg+ */}
      <div className="container hidden mx-auto isolate md:block">
        <div className="relative -mx-8">
          <table className="w-full text-left border-separate table-fixed border-spacing-x-8">
            <caption className="sr-only">Pricing plan comparison</caption>
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead>
              <tr>
                <td />
                {tiers.map((tier) => (
                  <th key={tier.name} scope="col" className="px-6 pt-6 text-center xl:px-8 xl:pt-8">
                    <div className="text-sm font-semibold leading-7 text-zinc-900">{tier.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <span className="sr-only">Price</span>
                </th>
                {tiers.map((tier) => (
                  <td key={tier.name} className="px-6 pt-2 space-y-2 text-center xl:px-8">
                    <p>
                      {typeof tier.price === "string" ? (
                        <span className="text-2xl font-bold tracking-tight text-zinc-900">
                          {tier.price}
                        </span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold tracking-tight text-zinc-900">
                            ${tier.price.price}
                          </span>
                          <span className="text-sm font-medium text-zinc-900">
                            /{tier.price.checks.toLocaleString()} Checks
                          </span>
                        </>
                      )}
                    </p>
                    <div className="flex-grow w-full">{tier.cta}</div>
                  </td>
                ))}
              </tr>
              {sections.map((section, sectionIdx) => (
                <Fragment key={section.name}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className={classNames(
                        sectionIdx === 0 ? "pt-8" : "pt-16",
                        "pb-4 text-sm font-semibold leading-6 text-zinc-900",
                      )}
                    >
                      {section.name}
                      <div className="absolute h-px mt-4 inset-x-8 bg-zinc-900/10" />
                    </th>
                  </tr>
                  {section.features.map((feature) => (
                    <tr key={feature.name}>
                      <th scope="row" className="py-4 text-sm font-normal leading-6 text-zinc-500 ">
                        <span className="flex items-center gap-2">{feature.name}</span>
                        <div className="absolute h-px mt-4 inset-x-8 bg-zinc-900/5" />
                      </th>
                      {tiers.map((tier) => (
                        <td key={tier.name} className="px-6 py-4 xl:px-8">
                          {typeof feature.tiers[tier.name] === "string" ? (
                            <div className="text-sm leading-6 text-center text-zinc-500">
                              {feature.tiers[tier.name]}
                            </div>
                          ) : (
                            <>
                              {feature.tiers[tier.name] === true ? (
                                <Check
                                  className="w-5 h-5 mx-auto text-primary-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Minus
                                  className="w-5 h-5 mx-auto text-zinc-400"
                                  aria-hidden="true"
                                />
                              )}

                              <span className="sr-only">
                                {feature.tiers[tier.name] === true ? "Included" : "Not included"} in{" "}
                                {tier.name}
                              </span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
