export type Series = {
  data: { ts: number; latency: number }[];
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
};
