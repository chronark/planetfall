import {
  BuildingLibraryIcon,
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



type Feature = {
  title: string
  image?: string
  description: string
  bullets: { icon?: (props: any) => JSX.Element, description: string }[]
}
const features: Feature[] = [
  {
    title: "Gain insights into how your APIs perform",
    description: "Automated API monitoring and alerting for your APIs. Monitor the latency of your APIs from around the planet.",
    bullets: [{
      icon: GlobeEuropeAfricaIcon,
      description: "22 Regions from AWS"
    }, {
      description: "Synthetic checks, with custom timeouts."
    }]
  },
  {
    title: "Public Statuspage",
    description: "Group your APIs together and share their performance publicly with your customers",
    bullets: []
  },
  {
    title: "Alerts",
    description: "Receive instant alerts when your API goes down or experiences degraded performance",
    bullets: [
      {description: "Webhook"},
      {description: "Email"},
      {description: "Slack"},
      {description: "Discord"},
      {description: "Opsgenie"}
    ]
  },
  {
    title: "API",
    description: "Manage all your endpoints and pages via REST API",
    bullets: []
  }

]
  // {
  //   title: "Performance Monitoring",
  //   description: "Define your own performance thresholds per endpoint.",
  //   icon: ChartBarIcon,
  // },
  // {
  //   title: "Public Statuspage",
  //   description:
  //     "Offer the same insights to your customers by embedding a public statuspage.",
  //   icon: ComputerDesktopIcon,
  // },
  // {
  //   title: "Custom Domains",
  //   description:
  //     "Use a white label xxx.planetfall.io or a custom domain of your choice.",
  //   icon: RocketLaunchIcon,
  // },
  // {
  //   title: "Alerts",
  //   description:
  //     "Send automatic alerts via email, Slack, Discord, Opsgenie, Pagerduty, and more.",
  //   icon: EyeIcon,
  // },
  // {
  //   title: "Pay As you Go",
  //   description:
  //     "Predictable and usage based pricing with a free tier. No credit card required.",
  //   icon: CurrencyDollarIcon,
  // },


export const Features: React.FC = (): JSX.Element => {
  return (
    <section id="features">
      <div className="relative py-16 sm:py-24 lg:py-32 space-y-8 md:space-y-16 lg:space-y-32">
        {features.map(f => (

          <div key={f.title} className="min-h-screen mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
            {/* <h2 className="text-lg font-semibold text-primary-600"></h2> */}
            <div className="w-full max-w-md h-6 mx-auto drop-shadow-radiant"></div>

            <h3 className="mt-2 text-4xl font-bold text-transparent bg-clip-text py-2 bg-gradient-to-t from-primary-100 to-white md:text-6xl">
              {f.title}
            </h3>
            <div className="mx-auto w-3/4 mt-4 md:mt-8 lg:mt-16 border rounded border-slate-700" style={{height: "50vh"}}>

            </div>
            <p className="mx-auto mt-4 md:mt-8 lg:mt-16 max-w-prose  text-slate-200">
              {f.description}
            </p>
            <div className="mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {f.bullets.map((b, i) => (
                

                    <div key={i}  className="flex items-center gap-2 justify-center">
                      {b.icon ?
                        <b.icon
                          className="h-5 w-5 text-slate-100"
                        />
                        : null
                      }
                      <p className="text-lg font-medium tracking-tight text-slate-100">
                        {b.description}
                      </p>
                    </div>


                ))}
              </div>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
};
