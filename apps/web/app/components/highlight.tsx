"use client";
import { H } from "highlight.run";
import { ErrorBoundary } from "@highlight-run/react";
import { PropsWithChildren } from "react";
import { useUser } from "@clerk/nextjs";

export const Highlight: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useUser();
  H.init("jd4z39e5", {
    tracingOrigins: true,
    networkRecording: {
      enabled: true,
      recordHeadersAndBody: true,
      urlBlocklist: [
        // insert urls you don't want to record here
      ],
    },
  });
  if (user) {
    H.identify(user.id, {
      // @ts-ignore
      name: user.username ?? undefined,
    });
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
