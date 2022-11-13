import React, { Fragment } from "react";
import Image from "next/image";
import Illustration from "../../public/landing/pricing-illustration.svg";
import Link from "next/link";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";
import { DEFAULT_QUOTA } from "../../plans";
import ms from "ms";

type Tier = "Free" | "Pro" | "Enterprise";

const tiers: {
  name: Tier;
  href: string;
  monthlyPrice: number;
  description: string;
  cta: string;
}[] = [
  {
    name: "Free",
    href: "/auth/sign-in",
    monthlyPrice: 0,
    description: "No credit card required",
    cta: "Start for free",
  },
  {
    name: "Pro",
    href: "/auth/sign-in",
    monthlyPrice: 0,
    description: "For everyone, no minimum commitment",
    cta: "Start for free",
  },

  {
    name: "Enterprise",
    href: "mailto:support@planetfall.io",
    monthlyPrice: -1,
    description: "For large-scale APIs",
    cta: "Contact us",
  },
];
const sections: {
  name: string;
  features: {
    name: string;
    tiers: Record<Tier, string | boolean>;
  }[];
}[] = [
  {
    name: "Features",
    features: [
      {
        name: "Included requests",
        tiers: {
          Free: `${DEFAULT_QUOTA.FREE.includedRequests / 1000}k`,
          Pro: `${DEFAULT_QUOTA.PRO.includedRequests / 1000}k`,
          Enterprise: "Custom",
        },
      },
      {
        name: "Additional requests",
        tiers: {
          Free: false,
          Pro: "$1 / 10,000",
          Enterprise: "Custom",
        },
      },
      {
        name: "Teams",
        tiers: { Free: false, Pro: true, Enterprise: true },
      },
      {
        name: "Status Pages",
        tiers: { Free: "1", Pro: "5", Enterprise: "∞" },
      },
    ],
  },
  {
    name: "Endpoints",
    features: [
      {
        name: "Number of endpoints",
        tiers: {
          Free: DEFAULT_QUOTA.FREE.maxEndpoints.toLocaleString(),
          Pro: DEFAULT_QUOTA.PRO.maxEndpoints.toLocaleString(),
          Enterprise: "∞",
        },
      },
      {
        name: "Minimum Interval",
        tiers: {
          Free: ms(DEFAULT_QUOTA.FREE.minInterval),
          Pro: ms(DEFAULT_QUOTA.PRO.minInterval),
          Enterprise: ms(DEFAULT_QUOTA.ENTERPRISE.minInterval),
        },
      },
      {
        name: "Timeout",
        tiers: {
          Free: ms(DEFAULT_QUOTA.FREE.maxTimeout),
          Pro: ms(DEFAULT_QUOTA.PRO.maxTimeout),
          Enterprise: "Custom",
        },
      },
    ],
  },
  {
    name: "Storage",
    features: [
      {
        name: "Data Retention",
        tiers: {
          Free: ms(DEFAULT_QUOTA.FREE.retention, { long: true }),
          Pro: ms(DEFAULT_QUOTA.PRO.retention, { long: true }),
          Enterprise: ms(DEFAULT_QUOTA.ENTERPRISE.retention, { long: true }),
        },
      },
      {
        name: "Audit Logs",
        tiers: {
          Free: false,

          Pro: false,
          Enterprise: true,
        },
      },
    ],
  },
  {
    name: "Alerts",
    features: [
      {
        name: "Webhooks",
        tiers: {
          Free: true,
          Pro: true,
          Enterprise: true,
        },
      },
      {
        name: "Slack",
        tiers: {
          Free: false,
          Pro: true,
          Enterprise: true,
        },
      },
      {
        name: "Email",
        tiers: {
          Free: false,

          Pro: true,
          Enterprise: true,
        },
      },
    ],
  },
];

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}
export const Pricing: React.FC = (): JSX.Element => {
  return (
    <section id="pricing">
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            Transparent pricing
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-slate-400">
            Start for free, then upgrade as you grow.
          </p>
        </div>
        <div className="mt-12">
          <div className="mx-auto max-w-7xl py-16 sm:py-24 sm:px-6 lg:px-8">
            {/* xs to lg */}
            <div className="mx-auto px-4 max-w-2xl space-y-16 lg:hidden">
              {tiers.map((tier, tierIdx) => (
                <section key={tier.name}>
                  <div className="mb-8 px-4">
                    <h2 className="text-lg font-medium leading-6 text-slate-100">
                      {tier.name}
                    </h2>
                    <p className="mt-4">
                      {tier.monthlyPrice >= 0
                        ? (
                          <>
                            <span className="text-4xl font-bold tracking-tight text-slate-100">
                              ${tier.monthlyPrice}
                            </span>
                            <span className="text-base font-medium text-slate-100">
                              /mo
                            </span>
                          </>
                        )
                        : (
                          <span className="text-4xl font-bold tracking-tight text-slate-100">
                            Contact Us
                          </span>
                        )}
                    </p>
                    <p className="mt-4 text-sm text-slate-500">
                      {tier.description}
                    </p>
                    <a
                      href={tier.href}
                      className="block w-full rounded border border-slate-100 duration-300 bg-slate-100 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-white "
                    >
                      {tier.cta}
                    </a>
                  </div>

                  {sections.map((section) => (
                    <table key={section.name} className="w-full">
                      <caption className="rounded bg-slate-50 py-3 px-4 text-left text-sm font-medium text-slate-900">
                        {section.name}
                      </caption>
                      <thead>
                        <tr>
                          <th className="sr-only" scope="col">
                            Feature
                          </th>
                          <th className="sr-only" scope="col">
                            Included
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-500">
                        {section.features.map((feature) => (
                          <tr key={feature.name}>
                            <th
                              className="py-5 px-4 text-left text-sm font-normal text-slate-500"
                              scope="row"
                            >
                              {feature.name}
                            </th>
                            <td className="py-5 pr-4">
                              {typeof feature.tiers[tier.name] === "string"
                                ? (
                                  <span className="block text-right text-sm text-slate-400">
                                    {feature.tiers[tier.name]}
                                  </span>
                                )
                                : (
                                  <>
                                    {feature.tiers[tier.name] === true
                                      ? (
                                        <CheckIcon
                                          className="ml-auto h-5 w-5 text-emerald-500"
                                          aria-hidden="true"
                                        />
                                      )
                                      : (
                                        <MinusIcon
                                          className="ml-auto h-5 w-5 text-slate-400"
                                          aria-hidden="true"
                                        />
                                      )}

                                    <span className="sr-only">
                                      {feature.tiers[tier.name] === true
                                        ? "Yes"
                                        : "No"}
                                    </span>
                                  </>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}

                  <div
                    className={classNames(
                      tierIdx < tiers.length - 1 ? "py-5 border-b" : "pt-5",
                      "border-t border-slate-700",
                    )}
                  >
                    <a
                      href={tier.href}
                      className="block w-full rounded border border-slate-100 duration-300 bg-slate-100 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-white "
                    >
                      {tier.cta}
                    </a>
                  </div>
                </section>
              ))}
            </div>

            {/* lg+ */}
            <div className="hidden lg:block">
              <table className="h-px w-full table-fixed">
                <caption className="sr-only">Pricing plan comparison</caption>
                <thead>
                  <tr>
                    <th
                      className="w-1/4 px-6 pb-4 text-left text-sm font-medium text-slate-100"
                      scope="col"
                    >
                      <span className="sr-only">Feature by</span>
                      <span>Plans</span>
                    </th>
                    {tiers.map((tier) => (
                      <th
                        key={tier.name}
                        className="lg:w-1/4 px-6 pb-4 text-left text-lg font-medium leading-6 text-slate-100"
                        scope="col"
                      >
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 border-t border-slate-800">
                  <tr>
                    <th
                      className="py-8 px-6 text-left align-top text-sm font-medium text-slate-100"
                      scope="row"
                    >
                      Pricing
                    </th>
                    {tiers.map((tier) => (
                      <td
                        key={tier.name}
                        className="h-full  py-8 px-6 align-top "
                      >
                        <div className="relative table h-full w-full">
                          <p>
                            {tier.monthlyPrice >= 0
                              ? (
                                <>
                                  <span className="text-4xl font-bold tracking-tight text-slate-100">
                                    ${tier.monthlyPrice}
                                  </span>
                                  <span className="text-base font-medium text-slate-400">
                                    /mo
                                  </span>
                                </>
                              )
                              : (
                                <span className="text-4xl font-bold tracking-tight text-slate-100">
                                  Contact Us
                                </span>
                              )}
                          </p>
                          <p className="mt-4 mb-16 text-sm text-slate-400">
                            {tier.description}
                          </p>
                          <a
                            href={tier.href}
                            className="block w-full rounded border border-slate-100 duration-300 bg-slate-100 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-white "
                          >
                            {tier.cta}
                          </a>
                        </div>
                      </td>
                    ))}
                  </tr>
                  {sections.map((section) => (
                    <Fragment key={section.name}>
                      <tr>
                        <th
                          className="bg-slate-900 py-3 pl-6 text-left text-sm font-medium text-slate-100"
                          colSpan={5}
                          scope="colgroup"
                        >
                          {section.name}
                        </th>
                      </tr>
                      {section.features.map((feature) => (
                        <tr key={feature.name}>
                          <th
                            className="py-5 px-6 text-left text-sm font-normal text-slate-400"
                            scope="row"
                          >
                            {feature.name}
                          </th>
                          {tiers.map((tier) => (
                            <td
                              key={tier.name}
                              className="py-5 px-6  text-center"
                            >
                              {typeof feature.tiers[tier.name] === "string"
                                ? (
                                  <span className="block text-sm text-slate-300">
                                    {feature.tiers[tier.name]}
                                  </span>
                                )
                                : (
                                  <div className="flex justify-center">
                                    {feature.tiers[tier.name] === true
                                      ? (
                                        <CheckIcon
                                          className="h-5 w-5 text-sky-400"
                                          aria-hidden="true"
                                        />
                                      )
                                      : (
                                        <MinusIcon
                                          className="h-5 w-5 text-slate-400"
                                          aria-hidden="true"
                                        />
                                      )}

                                    <span className="sr-only">
                                      {feature.tiers[tier.name] === true
                                        ? "Included"
                                        : "Not included"} in {tier.name}
                                    </span>
                                  </div>
                                )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th className="sr-only" scope="row">
                      Choose your plan
                    </th>
                    {tiers.map((tier) => (
                      <td key={tier.name} className="px-6 pt-5">
                        <a
                          href={tier.href}
                          className="block w-full rounded border border-slate-100 duration-300 bg-slate-100 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-white "
                        >
                          {tier.cta}
                        </a>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
