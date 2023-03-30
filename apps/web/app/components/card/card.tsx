import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export type CardProps = {};

export const Card: React.FC<PropsWithChildren<CardProps>> = ({ children }): JSX.Element => {
  return (
    <div className="w-full p-2 rounded-lg ring-1 ring-inset ring-zinc-900/10 bg-zinc-900/5 ">
      <div className="bg-white rounded shadow-2xl ring-1 ring-zinc-900/10">{children}</div>
    </div>
  );
};
