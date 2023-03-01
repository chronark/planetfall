import React, { PropsWithChildren } from "react";

type Props = {
  id: string;
  tag?: string;
  title?: string;
  description?: string;
};
export const Section: React.FC<PropsWithChildren<Props>> = ({
  children,
  tag,
  title,
  description,
  id,
}) => (
  <section id={id} className="py-8 sm:py-16 scroll-mt-20">
    <div className="px-6 mx-auto max-w-7xl lg:px-8">
      <div className="mx-auto text-center max-w-7xl">
        <h2 className="text-lg font-semibold tracking-tight text-transparent leading-8 bg-gradient-to-tr bg-clip-text from-primary-600 to-primary-400">
          {tag}
        </h2>
        <p className="py-2 text-4xl font-bold tracking-tight text-center text-zinc-900">{title}</p>
        <p className="leading-8 mt- text-zinc-500">{description}</p>
      </div>
    </div>
    <div className="relative pt-16 overflow-hidden">{children}</div>
  </section>
);
