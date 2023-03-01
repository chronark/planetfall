"use client";
import React, { Fragment } from "react";
import Highlight, { defaultProps, PrismTheme } from "prism-react-renderer";
import classNames from "classnames";

const code = `curl -XPOST 'https://api.planetfall.io/v1/checks' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer api_8VgHK1VoA2wu7MLYq9dZyqx58E9XixNNY' \\
  -d '{
    "url": "https://example.com",
    "method": "GET",
    "regionIds": [
      "fly:fra",
      "fly:hkg"
    ]
  }'`;
const theme: PrismTheme = {
  plain: {
    color: "#fafafa",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "#71717a",
      },
    },
    {
      types: ["string", "number", "builtin", "variable"],
      style: {
        color: "#a1a1aa",
      },
    },
    {
      types: ["class-name", "function", "tag", "attr-name"],
      style: {
        color: "#fafafa",
      },
    },
  ],
};

export const ApiSnippet: React.FC = () => {
  return (
    <div className="relative rounded bg-zinc-900/80 ring-1 ring-white/10 backdrop-blur">
      <div className="absolute z-50 h-px -top-px left-20 right-11 bg-gradient-to-r from-zinc-300/0 via-zinc-300/70 to-red-300/0" />
      <div className="absolute h-px -bottom-px left-11 right-20 bg-gradient-to-r from-zinc-400/0 via-zinc-400 to-zinc-400/0" />
      <div className="pt-4 pl-4">
        <svg
          aria-hidden="true"
          viewBox="0 0 42 10"
          fill="none"
          className="h-2.5 w-auto stroke-zinc-500/30"
        >
          <circle cx="5" cy="5" r="4.5" />
          <circle cx="21" cy="5" r="4.5" />
          <circle cx="37" cy="5" r="4.5" />
        </svg>
        {/* <div className="flex mt-4 text-xs space-x-2">
                {tabs.map((tab) => (
                    <div
                        key={tab.name}
                        className={classNames(
                            "flex h-6 rounded-full",
                            tab.isActive
                                ? "bg-gradient-to-r from-zinc-400/30 via-zinc-400 to-zinc-400/30 p-px font-medium text-zinc-300"
                                : "text-zinc-500",
                        )}
                    >
                        <div
                            className={classNames(
                                "flex items-center rounded-full px-2.5",
                                tab.isActive && "bg-zinc-800",
                            )}
                        >
                            {tab.name}
                        </div>
                    </div>
                ))}
            </div> */}
        <div className="flex items-start px-1 mt-6 text-sm">
          <div
            aria-hidden="true"
            className="pr-4 font-mono border-r select-none border-zinc-300/5 text-zinc-700"
          >
            {Array.from({
              length: code.split("\n").length,
            }).map((_, index) => (
              <Fragment key={index}>
                {(index + 1).toString().padStart(2, "0")}
                <br />
              </Fragment>
            ))}
          </div>
          <Highlight {...defaultProps} code={code} language="bash" theme={theme}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => {
              return (
                <pre className={classNames("flex overflow-x-auto pb-6", className)} style={style}>
                  <code className="px-4 text-left">
                    {tokens.map((line, lineIndex) => (
                      <div key={lineIndex} {...getLineProps({ line })}>
                        {line.map((token, tokenIndex) => (
                          <span key={tokenIndex} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </code>
                </pre>
              );
            }}
          </Highlight>
        </div>
      </div>
    </div>
  );
};
