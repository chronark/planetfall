import Image from "next/image";
import slugify from "slugify";

type Log = {
  id?: string;
  title: string;
  body: React.ReactNode;
  date: Date;
};

export default function Example() {
  return (
    <div className="py-24 bg-white sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Changelog</h2>
          {/* <p className="mt-2 text-lg leading-8 text-zinc-600">
            We&apos;re constantly improving Planetfall. Here&apos;s what&apos;s new.
          </p> */}
          <div className="pt-10 mt-10 space-y-16 border-t border-zinc-200 sm:mt-16 sm:pt-16">
            {changelogs.map((log) => (
              <article
                id={log.id ?? slugify(log.title, { lower: true })}
                key={log.title}
                className="flex flex-col items-start justify-between"
              >
                <div className="flex items-center w-full text-xs gap-x-4">
                  <time dateTime={log.date.toISOString()} className="text-zinc-500">
                    {log.date.toDateString()}
                  </time>
                </div>
                <div className="w-full">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-zinc-900 group-hover:text-zinc-600">
                    {log.title}
                  </h3>
                  <div className="mt-5 prose sm:prose-sm md:prose-md lg:prose-lg">{log.body}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const changelogs: Log[] = [
  {
    id: "slack-alerts",
    title: "Slack Alerts",
    date: new Date("2023-04-21"),
    body: (
      <div>
        <p>
          Slack integration for real-time alerts: You can now receive alerts about endpoint issues
          on Slack channels in addition to emails!
        </p>
        <Image src="/changelog/slack-alerts.png" alt="Slack Alerts" width={1164} height={950} />
        <p>
          With this new feature, you can choose the Slack channels you want to receive alerts on.
          Receive critical alerts directly in slack and act immediately.
        </p>
      </div>
    ),
  },
  {
    id: "cache-control",
    title: "Cache-Control Explanation",
    date: new Date("2023-03-18"),
    body: (
      <div>
        <p>
          Understanding the Cache-Control header can be difficult. We&apos;ve added a helper to
          explain what each directive means.
        </p>
        <Image
          src="/changelog/cache-control-explanation.png"
          alt="Cache-Control Explanation"
          width={1164}
          height={950}
        />
        <p>
          You can find this explanation by clicking the <strong>Cache-Control</strong> button on the{" "}
          <strong>Play</strong> results page or on individual checks from your endpoints.
        </p>
      </div>
    ),
  },
  {
    title: "Notifications",
    date: new Date("2023-03-11"),
    body: (
      <div>
        <p>
          Notifications are now available for all users. You can now receive email alerts when an
          endpoint is down or an assertion fails. You can add one or more emails to your account and
          receive notifications for all endpoints or for specific endpoints.
        </p>
      </div>
    ),
  },
  // More posts...
];
