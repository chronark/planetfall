
import React from "react";



type Feature = {
  title: string
  image?: string
  description: string
  bullets: { title: string, description: string }[]
}
const features: Feature[] = [
  {
    title: "Gain Insights into the Performance of your API",
    description: "Synthetic API monitoring for your APIs. Monitor the latency of your APIs from around the planet.",
    bullets: [{
      title: "22 Regions",
      description: "Check your API from around the globe. More regions coming soon."
    }, {
      title: "Custom timeouts",
      description: "Consider requests failed if your API does not respond in time"
    },
    {
      title: "Detect Problems early",
      description: "Define thresholds to get notified early in case your API performance degrades"
    },
    {
      title: "High Frequency",
      description: "Run checks every second"
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
      { title: "Webhook", description: "" },
      { title: "Email", description: "" },
      { title: "Slack", description: "" },
      { title: "Discord", description: "" },
      { title: "Opsgenie", description: "" }
    ]
  },
  {
    title: "API",
    description: "Manage all your endpoints and pages via REST API",
    bullets: [
      { title: "API",description: "Integrate Planetfall into your dashboard" },

    ]
  }

]



 const Feature: React.FC<{ feature: Feature }> = ({ feature }) => {

  return (
    <div
      className="min-h-screen mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
      {/* <h2 className="text-lg font-semibold text-primary-600"></h2> */}
      <div className="w-full max-w-md h-6 mx-auto drop-shadow-radiant"></div>

      <h3 className="mt-2 text-4xl font-bold text-transparent bg-clip-text py-2 bg-gradient-to-t from-primary-100 to-white md:text-6xl">
        {feature.title}
      </h3>
      <div className="mx-auto w-3/4 mt-4 md:mt-8 lg:mt-16 border rounded border-slate-700" style={{ height: "50vh" }}>

      </div>
      <p className="mx-auto mt-4 md:mt-8 lg:mt-16 max-w-prose  text-slate-200 text-xl">
        {feature.description}
      </p>
      <div className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {feature.bullets.map((b, i) => (


            <div key={b.title} className=" bg-gradient-feature from-primary-600/50  to-transparent drop-shadow-feature ">
              <div className="p-4 bg-gradient-feature-inner from-primary-400/20 to-transparent">

              <dt className="font-medium text-slate-100">{b.title}</dt>
              <dd className="mt-2 text-sm text-slate-400">{b.description}</dd>
            </div>
</div>

          ))}
        </div>
      </div>
    </div>
  )
}

export  function Features(): JSX.Element {
  return (
    <section id="features">
      <div className="relative py-16 sm:py-24 lg:py-32 space-y-8 md:space-y-16 lg:space-y-32">
        {features.map(f => (
          <Feature key={f.title} feature={f} />


        ))}

      </div>
    </section>
  );
};
