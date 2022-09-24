import React, { Fragment } from "react";
import Image from "next/image";
import Illustration from "../../public/landing/pricing-illustration.svg";
import Link from "next/link";
import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";
const freeFeatures = ["100k Requests / month", "22 Regions", "1 Status Page"];
const teamFeatures = [
  "100k free Requests / month ",
  "Then $10 per million",
  "Up tp 50 million requests per month",
  "Teams",
  "3 Status Pages per Team",
];
const enterpriseFeatures = ["Unlimited Requests", "Custom Pricing"];

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
    href: "#",
    monthlyPrice: 0,
    description: "No Credit Card required",
    cta: "Start for free",
  },
  {
    name: "Pro",
    href: "#",
    monthlyPrice: 20,
    description: "For growing APIs and teams",
    cta: "Buy Pro",
  },
  {
    name: "Enterprise",
    href: "#",
    monthlyPrice: -1,
    description: "For large-scale APIs",
    cta: "Contact us",
  },
];
const sections: {
  name: string;
  features: {
    name: string;
    tiers: Record<Tier, string | boolean | number>;
  }[];
}[] = [
  {
    name: "Features",
    features: [
      {
        name: "Included requests",
        tiers: { Free: "100k", Pro: "2 million", Enterprise: "Custom" },
      },
      {
        name: "Additional requests",
        tiers: { Free: false, Pro: "$10 / million", Enterprise: "Custom" },
      },
      {
        name: "Requests limit",
        tiers: { Free: "100k / mo", Pro: "500k / mo", Enterprise: "Unlimited" },
      },
      { name: "Teams", tiers: { Free: false, Pro: true, Enterprise: true } },
      {
        name: "Integrated Domains",
        tiers: { Free: false, Pro: true, Enterprise: true },
      },
    ],
  },
  {
    name: "Endpoints",
    features: [
      {
        name: "Minimum Frequency",
        tiers: { Free: "10s", Pro: "1s", Enterprise: "1s" },
      },
      {
        name: "Eget risus integer.",
        tiers: { Free: false, Pro: true, Enterprise: true },
      },
      {
        name: "Gravida leo urna velit.",
        tiers: { Free: false, Pro: false, Enterprise: true },
      },
      {
        name: "Elementum ut dapibus mi feugiat cras nisl.",
        tiers: { Free: false, Pro: false, Enterprise: true },
      },
    ],
  },
  {
    name: "Alerts",
    features: [
      { name: "Webhooks", tiers: { Free: true, Pro: true, Enterprise: true } },
      { name: "Slack", tiers: { Free: true, Pro: true, Enterprise: true } },
      { name: "Email", tiers: { Free: false, Pro: true, Enterprise: true } },
      {
        name: "Opsgenie",
        tiers: { Free: false, Pro: false, Enterprise: true },
      },
      { name: "Custom", tiers: { Free: false, Pro: false, Enterprise: true } },
    ],
  },
];

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}
export const Pricing: React.FC = (): JSX.Element => {
  return (
    <section id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20 border-t border-slate-100">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-extrabold">
              Find a plan that&apos;s right for you
            </h2>
            <div className="mt-4 max-w-2xl mx-auto">
              <p className="text-xl text-slate-400">
                Get started for free, no credit card required
              </p>
            </div>
          </div>
          {/* Pricing tables */}

          <div className="mx-auto max-w-7xl bg-white py-16 sm:py-24 sm:px-6 lg:px-8">
            {/* xs to lg */}
            <div className="mx-auto max-w-2xl space-y-16 lg:hidden">
              {tiers.map((tier, tierIdx) => (
                <section key={tier.name} className="lg:w-1/4">
                  <div className="mb-8 px-4">
                    <h2 className="text-lg font-medium leading-6 text-gray-900">
                      {tier.name}
                    </h2>
                    <p className="mt-4">
                      {tier.monthlyPrice >= 0
                        ? (
                          <>
                            <span className="text-4xl font-bold tracking-tight text-gray-900">
                              ${tier.monthlyPrice}
                            </span>
                            <span className="text-base font-medium text-gray-500">
                              /mo
                            </span>
                          </>
                        )
                        : (
                          <span className="text-4xl font-bold tracking-tight text-gray-900">
                            Contact Us
                          </span>
                        )}
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                      {tier.description}
                    </p>
                    <a
                      href={tier.href}
                      className="mt-6 block w-full rounded border border-gray-800 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-gray-900"
                    >
                      {tier.cta}
                    </a>
                  </div>

                  {sections.map((section) => (
                    <table key={section.name} className="w-full">
                      <caption className="border-t border-gray-200 bg-gray-50 py-3 px-4 text-left text-sm font-medium text-gray-900">
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
                      <tbody className="divide-y divide-gray-200">
                        {section.features.map((feature) => (
                          <tr
                            key={feature.name}
                            className="border-t border-gray-200"
                          >
                            <th
                              className="py-5 px-4 text-left text-sm font-normal text-gray-500"
                              scope="row"
                            >
                              {feature.name}
                            </th>
                            <td className="py-5 pr-4">
                              {typeof feature.tiers[tier.name] === "string"
                                ? (
                                  <span className="block text-right text-sm text-gray-700">
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
                                          className="ml-auto h-5 w-5 text-gray-400"
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
                      "border-t border-gray-200 px-4",
                    )}
                  >
                    <a
                      href={tier.href}
                      className="block w-full rounded border border-gray-800 duration-300 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-slate-50 hover:text-slate-900"
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
                      className="px-6 pb-4 text-left text-sm font-medium text-gray-900"
                      scope="col"
                    >
                      <span className="sr-only">Feature by</span>
                      <span>Plans</span>
                    </th>
                    {tiers.map((tier) => (
                      <th
                        key={tier.name}
                        className="lg:w-1/4 px-6 pb-4 text-left text-lg font-medium leading-6 text-gray-900"
                        scope="col"
                      >
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-t border-gray-200">
                  <tr>
                    <th
                      className="py-8 px-6 text-left align-top text-sm font-medium text-gray-900"
                      scope="row"
                    >
                      Pricing
                    </th>
                    {tiers.map((tier) => (
                      <td
                        key={tier.name}
                        className="h-full py-8 px-6 align-top "
                      >
                        <div className="relative table h-full w-full">
                          <p>
                            {tier.monthlyPrice >= 0
                              ? (
                                <>
                                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                                    ${tier.monthlyPrice}
                                  </span>
                                  <span className="text-base font-medium text-gray-500">
                                    /mo
                                  </span>
                                </>
                              )
                              : (
                                <span className="text-4xl font-bold tracking-tight text-gray-900">
                                  Contact Us
                                </span>
                              )}
                          </p>
                          <p className="mt-4 mb-16 text-sm text-gray-500">
                            {tier.description}
                          </p>
                          <a
                            href={tier.href}
                            className="block w-full rounded border border-gray-800 duration-300 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-slate-50 hover:text-slate-900"
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
                          className="bg-gray-50 py-3 pl-6 text-left text-sm font-medium text-gray-900"
                          colSpan={4}
                          scope="colgroup"
                        >
                          {section.name}
                        </th>
                      </tr>
                      {section.features.map((feature) => (
                        <tr key={feature.name}>
                          <th
                            className="py-5 px-6 text-left text-sm font-normal text-gray-500"
                            scope="row"
                          >
                            {feature.name}
                          </th>
                          {tiers.map((tier) => (
                            <td key={tier.name} className="py-5 px-6">
                              {typeof feature.tiers[tier.name] === "string"
                                ? (
                                  <span className="block text-sm text-gray-700">
                                    {feature.tiers[tier.name]}
                                  </span>
                                )
                                : (
                                  <>
                                    {feature.tiers[tier.name] === true
                                      ? (
                                        <CheckIcon
                                          className="h-5 w-5 text-emerald-500"
                                          aria-hidden="true"
                                        />
                                      )
                                      : (
                                        <MinusIcon
                                          className="h-5 w-5 text-gray-400"
                                          aria-hidden="true"
                                        />
                                      )}

                                    <span className="sr-only">
                                      {feature.tiers[tier.name] === true
                                        ? "Included"
                                        : "Not included"} in {tier.name}
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
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <th className="sr-only" scope="row">
                      Choose your plan
                    </th>
                    {tiers.map((tier) => (
                      <td key={tier.name} className="px-6 pt-5">
                        <a
                          href={tier.href}
                          className="block w-full rounded border border-gray-800 duration-300 bg-gray-800 py-2 text-center text-sm font-semibold text-white hover:bg-slate-50 hover:text-slate-900"
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
