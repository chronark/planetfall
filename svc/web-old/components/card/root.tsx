import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface RootProps {}

export const Root: React.FC<PropsWithChildren<RootProps>> = (
  { children },
): JSX.Element => {
  return (
    <div className="w-full bg-white border border-slate-300 rounded">
      {children}
    </div>
  );
};
