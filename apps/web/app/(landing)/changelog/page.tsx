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
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Changelog</h2>
                    {/* <p className="mt-2 text-lg leading-8 text-zinc-600">
            We&apos;re constantly improving Planetfall. Here&apos;s what&apos;s new.
          </p> */}
                    <div className="mt-10 space-y-16 border-t border-zinc-200 pt-10 sm:mt-16 sm:pt-16">
                        {changelogs.map((log) => (
                            <article
                                id={log.id ?? slugify(log.title, { lower: true })}
                                key={log.title}
                                className="flex max-w-xl flex-col items-start justify-between"
                            >
                                <div className="flex items-center gap-x-4 text-xs">
                                    <time dateTime={log.date.toISOString()} className="text-zinc-500">
                                        {log.date.toDateString()}
                                    </time>
                                </div>
                                <div className="group relative">
                                    <h3 className="mt-3 text-lg font-semibold leading-6 text-zinc-900 group-hover:text-zinc-600">
                                        {log.title}
                                    </h3>
                                    <div className="mt-5 prose">{log.body}</div>
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
        id: "cache-control",
        title: "Cache-Control Explanation",
        date: new Date("2023-03-18"),
        body: (
            <div>
                <p>
                    Understanding the Cache-Control header can be difficult. We&apos;ve added a helper to help
                    you understand the effects of the header.
                </p>
                <Image
                    src="/changelog/cache-control-explanation.png"
                    alt="Cache-Control Explanation"
                    width={1164}
                    height={950}
                />
            </div>
        ),
    },
    {
        title: "Notifications",
        date: new Date("2023-03-11"),
        body: (
            <div>
                <p>
                    Notifications are now available for all users. You can now receive notifications when an
                    endpoint is down or an assertion fails. You can add one or more emails to your account and
                    receive notifications for all endpoints or for specific endpoints.
                </p>
            </div>
        ),
    },
    // More posts...
];
