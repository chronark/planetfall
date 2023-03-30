import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export type CardContentProps = {};

export const CardContent: React.FC<PropsWithChildren<CardContentProps>> = ({
  children,
}): JSX.Element => {
  return <div className="w-full p-4 lg:px-6">{children}</div>;
};
