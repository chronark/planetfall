"use client";
import { H } from "highlight.run";

H.init("jd4z39e5", {
  // This messes with clerk cors
  tracingOrigins: false,
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
    urlBlocklist: [],
  },
});
export const Highlight: React.FC = () => {
  return null;
};
