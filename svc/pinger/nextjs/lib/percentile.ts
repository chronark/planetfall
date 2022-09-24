export function percentile(p: number, arr: number[]): number {
  if (arr.length === 0) {
    return 0;
  }
  if (arr.length === 1) {
    return arr[0];
  }
  const sorted = arr.slice().sort((a, b) => a - b);
  return sorted[Math.ceil(arr.length * (p)) - 1];
}
