import React, { PropsWithChildren } from "react";

export const Banner: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex items-center justify-center bg-zinc-900 py-1 px-6 sm:px-3.5">
      <p className="text-xs text-white">{children}</p>
    </div>
  );
};
