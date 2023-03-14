import React, { Fragment, PropsWithChildren } from "react";
import Link from "next/link";
import { DEFAULT_QUOTA } from "../../plans";
import ms from "ms";
import classNames from "classnames";
import { Check, Minus } from "lucide-react";
import { Section } from "./section";
import { features } from "node:process";

type Tier = "Free" | "Pro" | "Enterprise";

type Tag = "New" | "Planned" | "Beta" | "In Development";

const tiers: {
  name: Tier;
  href: string;
  price:
    | {
        checks: number;
        price: number;
      }
    | string;
  description: string;
  cta: string;
}[] = [
  {
    name: "Free",
    href: "/auth/sign-up",
    price: "$0",
    description: "No credit card required",
    cta: "Start for free",
  },
  {
    name: "Pro",
    href: "/auth/sign-up",
    price: {
      checks: 10000,
      price: 1,
    },
    description: "Pay as you go",
    cta: "Start for free",
  },
  {
    name: "Enterprise",
    href: "mailto:support@planetfall.io",
    price: "Contact us",
    description: "For large-scale APIs",
    cta: "Contact us",
  },
];
const sections: {
  name: string;
  features: {
    name: string;
    tiers: Record<Tier, string | boolean>;
    tag?: Tag;
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
        tag: "New",
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
  // {
  // 	name: "Storage",
  // 	features: [
  // 		{
  // 			name: "Data Retention",
  // 			tiers: {
  // 				Free: ms(DEFAULT_QUOTA.FREE.retention, { long: true }),
  // 				Pro: ms(DEFAULT_QUOTA.PRO.retention, { long: true }),
  // 				Enterprise: ms(DEFAULT_QUOTA.ENTERPRISE.retention, { long: true }),
  // 			},
  // 		},
  // 		{
  // 			name: "Audit Logs",
  // 			tiers: {
  // 				Free: false,

  // 				Pro: false,
  // 				Enterprise: true,
  // 			},
  // 			tag: "Planned",
  // 		},
  // 	],
  // },
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
        tag: "New",
      },
      {
        name: "Webhooks",
        tiers: {
          Free: true,
          Pro: true,
          Enterprise: true,
        },
        tag: "Planned",
      },
      {
        name: "Slack",
        tiers: {
          Free: false,
          Pro: true,
          Enterprise: true,
        },
        tag: "Planned",
      },
      {
        name: "Opsgenie",
        tiers: {
          Free: false,
          Pro: true,
          Enterprise: true,
        },
        tag: "Planned",
      },
    ],
  },
];

const _Button: React.FC<PropsWithChildren<{ href: string }>> = ({ children, href }) => {
  return (
    <Link
      href={href}
      className="block w-full py-2 text-sm font-semibold text-center duration-150 border rounded border-zinc-900 bg-zinc-900 text-zinc-50 hover:bg-white hover:text-zinc-900 hover:drop-shadow-cta focus:bg-zinc-900 focus:text-zinc-50 focus:drop-shadow-none "
    >
      {children}
    </Link>
  );
};

export const Pricing: React.FC = (): JSX.Element => {
  return (
    <Section id="pricing" title="Pricing" description="Start for free, scale as you grow.">
      {/* xs to lg */}
      <div className="max-w-md mx-auto space-y-8 lg:hidden">
        {tiers.map((tier) => (
          <section key={tier.name} className='p-8'>
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
            <a
              href={tier.href}
              aria-describedby={tier.name}
              className="block px-3 py-2 mt-8 text-sm font-semibold leading-6 text-center duration-150 rounded-md text-zinc-900 ring-1 ring-inset ring-zinc-900 hover:bg-zinc-900 hover:text-white focus:outline-none"
            >
              {tier.cta}
            </a>
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
                            <div className="flex items-center gap-2">
                              {feature.name}
                              {feature.tag ? (
                                <span
                                  className={classNames("px-1 text-xs border rounded ", {
                                    "bg-primary-200/50 border-primary-600 text-primary-800":
                                      feature.tag === "New",
                                    "border-orange-500 text-orange-500": feature.tag === "Beta",
                                    "border-zinc-400 text-zinc-400":
                                      feature.tag === "In Development",
                                    "border-zinc-500 bg-zinc-100/50 text-zinc-500":
                                      feature.tag === "Planned",
                                  })}
                                >
                                  {feature.tag}
                                </span>
                              ) : null}
                            </div>
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
      <div className="container hidden mx-auto isolate lg:block">
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
                  <th key={tier.name} scope="col" className="px-6 pt-6 xl:px-8 xl:pt-8">
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
                  <td key={tier.name} className="px-6 pt-2 xl:px-8">
                    <p>
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

                    <a
                      href={tier.href}
                      className="block px-3 py-2 mt-8 text-sm font-semibold leading-6 text-center duration-150 rounded-md text-zinc-900 ring-1 ring-inset ring-zinc-900 hover:bg-zinc-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {tier.cta}
                    </a>
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
                        <div className="flex items-center gap-2">
                          {feature.name}
                          {feature.tag ? (
                            <span
                              className={classNames("px-1 text-xs border rounded ", {
                                "bg-primary-500/10 border-primary-500 text-primary-500":
                                  feature.tag === "New",
                                "bg-orange-500/10 border-orange-500 text-orange-500":
                                  feature.tag === "Beta",
                                "bg-zinc-400/10 border-zinc-400 text-zinc-400":
                                  feature.tag === "In Development",
                                "border-zinc-500 bg-zinc-500/10 text-zinc-500":
                                  feature.tag === "Planned",
                              })}
                            >
                              {feature.tag}
                            </span>
                          ) : null}
                        </div>
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
    </Section>
  );
};
