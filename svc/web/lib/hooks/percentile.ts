import { useMemo } from "react";

export function usePercentile(p: number, arr: number[]): number {
  return useMemo(() => {
    if (arr.length === 0) {
      return 0;
    }
    if (arr.length === 1) {
      return arr[0];
    }
    const sorted = arr.slice().sort((a, b) => a - b);
    return sorted[Math.ceil(arr.length * (p)) - 1];
  }, [p, arr]);
}
