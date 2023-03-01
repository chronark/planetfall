"use client";

import ms from "ms";
import React, { useEffect, useState } from "react";
type Props = {
  time: number;
};
export const RelativeTime: React.FC<Props> = ({ time }): JSX.Element => {
  const [state, setState] = useState("0s");
  useEffect(() => {
    const id = setInterval(() => {
      setState(ms(Date.now() - time));
    }, 1000);

    return () => clearInterval(id);
  }, [time]);

  return (
    <>
      <span className="font-mono">{state}</span> ago
    </>
  );
};
