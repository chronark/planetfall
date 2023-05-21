import { Section } from "./section";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

export type Props = {
  feature: {
    hash: string;
    tag?: string;
    title: string;
    image?: React.ReactNode | string;
    description: string;
    bullets: {
      title: string;
      description: string;
      icon?: LucideIcon;
    }[];
  };
};
export const Feature: React.FC<Props> = ({ feature }) => {
  return (
    <Section
      id={feature.hash}
      tag={feature.tag}
      title={feature.title}
      description={feature.description}
    >
      <div className="relative overflow-hidden">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          {typeof feature.image === "string" ? (
            <>
              <Image
                src={feature.image}
                alt="App screenshot"
                className="mb-[-12%] rounded-lg shadow-2xl border border-zinc-500/30"
                width={1920}
                height={1080}
              />
              <div className="relative" aria-hidden="true">
                <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%]" />
              </div>
            </>
          ) : feature.image ? (
            feature.image
          ) : null}
        </div>
      </div>
      <div className="px-6 mx-auto mt-16 max-w-7xl sm:mt-20 md:mt-24 lg:px-8">
        <dl className="max-w-2xl mx-auto text-base grid grid-cols-1 leading-7 text-zinc-700 gap-x-6 gap-y-10 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {feature.bullets.map((b, i) => (
            <div key={i} className="relative pl-9">
              <dt className="inline font-semibold text-zinc-900">
                {b.icon ? (
                  <b.icon
                    className="absolute w-5 h-5 text-zinc-600 top-1 left-1"
                    aria-hidden="true"
                  />
                ) : null}
                {b.title}
              </dt>{" "}
              <dd className="inline">{b.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
};
