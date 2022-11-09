import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface CardFooterProps {}

export const CardFooter: React.FC<PropsWithChildren<CardFooterProps>> = (
  { children },
): JSX.Element => {
  return (
    <div className="flex items-center justify-between p-4 border-t border-slate-200 rounded-b sm:p-8 bg-slate-50">
      {children}
    </div>
  );
};
