import classNames from "classnames";
import React, { PropsWithChildren } from "react";

type Props = {
  variant?: "alert";
};

export const Banner: React.FC<PropsWithChildren<Props>> = ({ children, variant }) => {
  return (
    <div
      className={classNames(" flex items-center justify-center  py-1 px-6 sm:px-3.5", {
        "bg-zinc-900 text-white": !variant,
        "bg-red-600 text-red-50": variant === "alert",
      })}
    >
      <p className="text-xs ">{children}</p>
    </div>
  );
};
