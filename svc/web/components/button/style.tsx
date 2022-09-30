import { Loading } from "components/loading";
import React from "react";

import cn from "classnames";
import { Size } from "components/types";

export type ButtonType =
  | "primary"
  | "secondary"
  | "alert";

export type ButtonStyleProps = React.PropsWithChildren<{
  size?: Size;
  type?: ButtonType;

  /**
   * Display an icon instead of text
   */
  icon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}>;

export const ButtonStyle: React.FC<ButtonStyleProps> = ({
  size = "md",
  type = "primary",
  icon,
  iconLeft,
  iconRight,
  loading,
  disabled,
  children,
}): JSX.Element => {
  return (
    <div
      className={cn(
        /**
         * Common for all variations
         */
        "flex relative justify-center rounded border transition-all duration-300 items-center text-center font-medium  whitespace-nowrap focus:outline-none",
        /**
         * Size for regular buttons
         */
        !icon && {
          "text-sm  px-2 py-1": size === "sm" || size === "xs",
          "text-md px-3 py-1": size === "md",
          "text-lg px-6 py-2": size === "lg",
        },
        /**
         * Edge case: single icon as button
         */
        icon && {
          "w-6 h-6 ": size === "sm" || size === "xs",
          "w-8 h-8 p-1": size === "md",
        },
        /**
         * type
         */
        !disabled && {
          "bg-slate-800 text-slate-50 hover:bg-slate-50 hover:text-slate-900 border-slate-700 ":
            type === "primary",
          "bg-white text-slate-900 border-slate-700 hover:bg-slate-700 hover:text-slate-50":
            type === "secondary",

          "bg-red-200 text-white border-red-500 hover:bg-white hover:text-error":
            type === "alert",
        },
        disabled && {
          "bg-slate-900 text-slate-400": type === "primary",
          "bg-white text-slate-600 border-slate-60": type === "secondary",
          "bg-red-200 text-slate-white border-red-200": type === "alert",
        },
      )}
    >
      {iconLeft
        ? (
          <span
            className={cn({
              "w-4 h-4 mr-1": size === "sm" || size === "xs",
              "w-5 h-5 mr-2": size === "md",
            })}
          >
            {iconLeft}
          </span>
        )
        : null}

      {loading
        ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loading size={size} />
          </div>
        )
        : icon
        ? (
          <span
            className={cn({
              "w-6 h-6": size === "sm" || size === "xs",
              "w-8 h-8": size === "md",
              "opacity-0": loading,
            })}
          >
            {icon}
          </span>
        )
        : (null)}
      <div className={cn({ "opacity-0": loading })}>
        {children}
      </div>
      {iconRight
        ? (
          <span
            className={cn({
              "w-4 h-4 ml-1": size === "sm" || size === "xs",
              "w-5 h-5 ml-2": size === "md",
            })}
          >
            {iconRight}
          </span>
        )
        : null}
    </div>
  );
};
