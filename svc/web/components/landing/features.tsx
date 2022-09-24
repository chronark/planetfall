import {
  ChartBarIcon,
  CodeBracketIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FlagIcon,
  GlobeEuropeAfricaIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";
import React from "react";

const features = [
  {
    title: "22 Regions",
    description: "Run latency checks from anywhere on the planet.",
    icon: GlobeEuropeAfricaIcon,
  },
  {
    title: "Performance Monitoring",
    description: "Define your own performance thresholds per endpoint.",
    icon: ChartBarIcon,
  },
  {
    title: "Public Statuspage",
    description:
      "Offer the same insights to your customers by embedding a public statuspage.",
    icon: ComputerDesktopIcon,
  },
  {
    title: "Custom Domains",
    description:
      "Use a white label xxx.planetfall.io or a custom domain of your choice.",
    icon: RocketLaunchIcon,
  },
  {
    title: "Alerts",
    description:
      "Send automatic alerts via email, Slack, Discord, Opsgenie, Pagerduty, and more.",
    icon: EyeIcon,
  },
  {
    title: "Pay As you Go",
    description:
      "Predictable and usage based pricing with a free tier. No credit card required.",
    icon: CurrencyDollarIcon,
  },
];

export const Features: React.FC = (): JSX.Element => {
  return (
    <section id="features">
      <div className="relative bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          {/* <h2 className="text-lg font-semibold text-primary-600"></h2> */}
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Gain insights into how your APIs perform
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-gray-500">
            Automated API monitoring and alerting for your APIs. Monitor the
            latency of your APIs from around the planet.
          </p>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="pt-6">
                  <div className="flow-root rounded bg-slate-50 px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center rounded-md bg-gradient-to-t from-primary-500 to-info-500 p-3 shadow-lg">
                          <feature.icon
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
