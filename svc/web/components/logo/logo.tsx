import React from "react";

export interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }): JSX.Element => {
  return (
    <svg
      className={className}
      width="256"
      height="256"
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M126 27.1547C127.238 26.4402 128.762 26.4402 130 27.1547L214.335 75.8453C215.572 76.5598 216.335 77.8803 216.335 79.3094V176.691C216.335 178.12 215.572 179.44 214.335 180.155L130 228.845C128.762 229.56 127.238 229.56 126 228.845L41.6654 180.155C40.4278 179.44 39.6654 178.12 39.6654 176.691V79.3094C39.6654 77.8803 40.4278 76.5598 41.6654 75.8453L126 27.1547Z"
        fill="url(#paint0_linear_1_12)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1_12"
          x1="128"
          y1="26"
          x2="128"
          y2="230"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1939B7" />
          <stop offset={1} stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  );
};
