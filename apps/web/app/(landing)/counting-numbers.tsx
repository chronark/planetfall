"use client";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function CountingNumbers({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) {
  const [n, setNumber] = useState(0);
  const increment = Math.max(1, Math.floor(value / 100));
  const interval = duration * (increment / value);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      const _timer = setInterval(() => {
        if (n < value) {
          setNumber((num) => {
            let newValue = num + increment;
            if (newValue > value) {
              newValue = value;
              if (_timer) {
                clearInterval(_timer);
              }
            }
            return newValue;
          });
        } else if (_timer) {
          clearInterval(_timer);
        }
      }, interval);
    }
  }, [isInView, increment, interval, n, value]);

  return <span ref={ref}>{Intl.NumberFormat("en-US", { notation: "compact" }).format(n)}</span>;
}
