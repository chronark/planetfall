import React, { PropsWithChildren } from "react";

export const CardFooterStatus: React.FC<PropsWithChildren> = (
  { children },
): JSX.Element => {
  return <div className="flex items-center space-x-2">{children}</div>;
};
