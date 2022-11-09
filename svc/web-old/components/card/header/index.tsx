import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface CardHeaderProps {}

export const CardHeader: React.FC<PropsWithChildren<CardHeaderProps>> = (
  { children },
): JSX.Element => {
  return (
    <div className="border-b border-slate-200">
      {children}
    </div>
  );
};
