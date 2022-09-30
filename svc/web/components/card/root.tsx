import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface RootProps {}

export const Root: React.FC<PropsWithChildren<RootProps>> = (
  { children },
): JSX.Element => {
  return (
    <div className="w-full space-y-4 sm:space-y-8 bg-white border border-slate-300 rounded">
      {children}
    </div>
  );
};
