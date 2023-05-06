"use client"
import React, { Fragment, PropsWithChildren } from "react";
import Link from "next/link";
import { DEFAULT_QUOTA } from "../../plans";
import ms from "ms";
import classNames from "classnames";
import { Check, Minus } from "lucide-react";
import { Section } from "./section";
const format = {
  dollar: new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format,
  number: new Intl.NumberFormat(undefined, { notation: "compact" }).format
}

type Tier = "Hobby" | "Pro" | "Enterprise";

type Tag = "New" | "Planned" | "Beta" | "In Development";

const tiers: {
  name: Tier;
  href: string;
  price:
  | {
    unit: string;
    cost: string;
  }
  | string;
  description: string;
  cta: string;
}[] = [
    {
      name: "Hobby",
      href: "/auth/sign-up",
      price: {
        unit: "10.000 Checks",
        cost: "$1",
      },
      description: "No credit card required",
      cta: "Start for free",
    },
    {
      name: "Pro",
      href: "/auth/sign-up",
      price: {
        unit: "month",
        cost: "$500",
      },
      description: "Pay as you go",
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      href: "mailto:support@planetfall.io",
      price: {
        unit: "month",
        cost: "$1500",
      },
      description: "For enterprises with custom needs",
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
          name: "Included Checks",
          tiers: {
            Hobby: format.number(DEFAULT_QUOTA.FREE.maxMonthlyRequests),

            Pro: format.number(DEFAULT_QUOTA.PRO.maxMonthlyRequests),
            Enterprise: "∞",
          },
        },
        {
          name: "Additional Checks",
          tiers: {
            Hobby: "$0.0001 per check",
            Pro: "$0.0001 per check",
            Enterprise: "No additional cost",
          },
        },
        {
          name: "Status Pages",
          tiers: {
            Hobby: DEFAULT_QUOTA.FREE.maxStatusPages.toString(),
            Pro: DEFAULT_QUOTA.PRO.maxStatusPages.toString(),
            Enterprise: "∞",
          },
          tag: "New",
        },
        {
          name: "Teams",
          tiers: { Hobby: false, Pro: true, Enterprise: true },
        },
      ],
    },
    {
      name: "Regions",
      features: [
        {
          name: "18 Vercel Edge Regions",
          tiers: {
            Hobby: true,
            Pro: true,
            Enterprise: true,
          },
        },
        {
          name: "26 Fly.io Regions",
          tiers: {
            Hobby: false,
            Pro: true,
            Enterprise: true,
          },
        },
        {
          name: "22 AWS Regions",
          tiers: {
            Hobby: false,
            Pro: true,
            Enterprise: true,
          },
        },
      ],
    },
    {
      name: "Retention",
      features: [
        {
          name: "Individual Check History",
          tiers: {
            Hobby: ms(1000 * 60 * 60 * 24 * 7, { long: true }),
            Pro: ms(1000 * 60 * 60 * 24 * 90, { long: true }),
            Enterprise: ms(1000 * 60 * 60 * 24 * 365, { long: true }),
          },
        },
        {
          name: "Aggregated Metrics",
          tiers: {
            Hobby: ms(1000 * 60 * 60 * 24 * 7, { long: true }),
            Pro: ms(1000 * 60 * 60 * 24 * 90, { long: true }),
            Enterprise: ms(1000 * 60 * 60 * 24 * 365, { long: true }),
          },
        },
        {
          name: "Audit Logs",
          tiers: {
            Hobby: false,

            Pro: true,
            Enterprise: true,
          },
          tag: "Planned",
        },
      ],
    },
    {
      name: "Alerts",
      features: [
        {
          name: "Email",
          tiers: {
            Hobby: true,

            Pro: true,
            Enterprise: true,
          },
        },
        {
          name: "Webhooks",
          tiers: {
            Hobby: true,
            Pro: true,
            Enterprise: true,
          },
          tag: "Planned",
        },
        {
          name: "Slack",
          tiers: {
            Hobby: false,
            Pro: true,
            Enterprise: true,
          },
          tag: "New",
        },
        {
          name: "Opsgenie",
          tiers: {
            Hobby: false,
            Pro: true,
            Enterprise: true,
          },
          tag: "Planned",
        },
      ],
    },
    {
      name: "Integrations",
      features: [
        {
          name: "Grafana",
          tiers: {
            Hobby: false,

            Pro: false,
            Enterprise: true,
          },
          tag: "Planned",
        },
        {
          name: "Prometheus",
          tiers: {
            Hobby: false,
            Pro: true,
            Enterprise: true,
          },
          tag: "Planned",
        },
        {
          name: "Slack",
          tiers: {
            Hobby: false,
            Pro: true,
            Enterprise: true,
          },
          tag: "New",
        },
        {
          name: "Atlassian StatusPage",
          tiers: {
            Hobby: false,
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
    <Section  id="pricing" title="Pricing" description="Start for free, scale as you grow.">
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
                    {tier.price.cost}
                  </span>
                  <span className="text-base font-medium text-zinc-900">/{tier.price.unit}</span>
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
        <div className="-mx-8 ">
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
                  <th key={tier.name} scope="col" className="sticky px-6 pt-6 xl:px-8 xl:pt-8">
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
                            {tier.price.cost}
                          </span>
                          <span className="text-base font-medium text-zinc-900">
                            /{tier.price.unit}
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
