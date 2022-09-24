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

const items = [
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
  console.log({ items });
  return (
    <section id="features">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="">
        </div>
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="text-center pb-12 md:pb-20">
            <h2 className="text-5xl font-extrabold">
              Get insights into your users&apos; experience
            </h2>
          </div>
          <ul className="max-w-sm mx-auto grid gap-8 md:grid-cols-3 lg:gap-16 items-start md:max-w-none">
            {items.map((item) => (
              <li
                key={item.title}
                className="animate-fade-in flex flex-col items-center group"
              >
                <div className="rounded-full p-4 bg-gradient-to-t from-primary-500 to-info-400 text-slate-100">
                  <item.icon className="h-8 w-8" />
                </div>
                <h4 className="mt-4 text-3xl font-semibold text-slate-800 text-center">
                  {item.title}
                </h4>
                <p className="mt-2 text-lg text-gray-400 text-center">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
