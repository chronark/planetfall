import { Size } from "components/types";
import cn from "classnames";
import React from "react";
export interface LoadingProps {
  size?: Size;
  /**
   * Display a skeleton in this color during loading
   */
  bg?: string;

  /**
   * Override
   */
  color?: string;
}

export const Loading: React.FC<LoadingProps> = (
  { size = "md", bg, color },
): JSX.Element => {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-full animate-pulse",
        bg,
        {
          rounded: bg,
        },
        color,
      )}
    >
      <svg
        width="105"
        height="105"
        viewBox="0 0 105 105"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(" fill-current", {
          "w-3 h-3": size === "xs",
          "w-4 h-4": size === "sm",
          "w-5 h-5": size === "md",
          "w-6 h-6": size === "lg",
          "w-8 h-8": size === "xl",
          "w-16 h-16": size === "2xl",
        })}
      >
        <circle cx="12.5" cy="12.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="0s"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="12.5" cy="52.5" r="12.5" fill-opacity=".5">
          <animate
            attributeName="fill-opacity"
            begin="100ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="52.5" cy="12.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="300ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="52.5" cy="52.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="600ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="92.5" cy="12.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="800ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="92.5" cy="52.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="400ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="12.5" cy="92.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="700ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="52.5" cy="92.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="500ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="92.5" cy="92.5" r="12.5">
          <animate
            attributeName="fill-opacity"
            begin="200ms"
            dur="1s"
            values="1;.2;1"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};
