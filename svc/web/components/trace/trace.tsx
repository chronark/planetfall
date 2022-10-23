export type Timings = {
  dnsStart: number;
  dnsDone: number;
  connectStart: number;
  connectDone: number;
  tlsHandshakeStart: number;
  tlsHandshakeDone: number;
  firstByteStart: number;
  firstByteDone: number;
  transferStart: number;
  transferDone: number;
};

export type TraceProps = {
  timings: Timings;
};

export const Trace: React.FC<TraceProps> = ({ timings }): JSX.Element => {
  const min = Math.min(...Object.values(timings).filter((t) => t > 0));
  const max = Math.max(...Object.values(timings).filter((t) => t > 0));

  function width(start: number, done: number): string {
    const percentage = (
      done - start
    ) / (max - min) * 100;
    console.log({ percentage });
    if (percentage > 0) {
      return `${percentage}%`;
    }
    return "1%";
  }
  return (
    <div className="w-full flex flex-col gap-4 md:gap-0">
      <div className="flex flex-col md:flex-row w-full md:gap-4 md:items-center py-1 duration-500 hover:bg-slate-100 rounded">
        <div className="w-1/2 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
          <span>DNS</span>
          <span>
            {(timings.dnsDone - timings.dnsStart).toLocaleString()} ms
          </span>
        </div>
        <div className="w-full flex">
          <div
            style={{
              width: width(timings.dnsStart, timings.dnsDone),
            }}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full md:gap-4 md:items-center py-1 duration-500 hover:bg-slate-100 rounded">
        <div className="w-1/2 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
          <span>Connection</span>
          <span>
            {(timings.connectDone - timings.connectStart).toLocaleString()} ms
          </span>
        </div>
        <div className="w-full flex">
          <div
            style={{
              width: width(min, timings.connectStart),
            }}
          >
          </div>
          <div
            style={{
              width: width(timings.connectStart, timings.connectDone),
            }}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full md:gap-4 md:items-center py-1 duration-500 hover:bg-slate-100 rounded">
        <div className="w-1/2 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
          <span>TLS</span>
          <span>
            {(timings.tlsHandshakeDone - timings.tlsHandshakeStart)
              .toLocaleString()} ms
          </span>
        </div>
        <div className="w-full flex">
          <div
            style={{
              width: width(min, timings.tlsHandshakeStart),
            }}
          >
          </div>
          <div
            style={{
              width: width(timings.tlsHandshakeStart, timings.tlsHandshakeDone),
            }}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full md:gap-4 md:items-center py-1 duration-500 hover:bg-slate-100 rounded">
        <div className="w-1/2 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
          <span>TTFB</span>
          <span>
            {(timings.firstByteDone - timings.firstByteStart)
              .toLocaleString()} ms
          </span>
        </div>
        <div className="w-full flex">
          <div
            style={{
              width: width(min, timings.firstByteStart),
            }}
          >
          </div>
          <div
            style={{
              width: width(timings.firstByteStart, timings.firstByteDone),
            }}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full md:gap-4 md:items-center py-1 duration-500 hover:bg-slate-100 rounded">
        <div className="w-1/2 flex text-sm text-slate-500 justify-between whitespace-nowrap ">
          <span>Transfer</span>
          <span>
            {(timings.transferDone - timings.transferStart)
              .toLocaleString()} ms
          </span>
        </div>
        <div className="w-full flex">
          <div
            style={{
              width: width(min, timings.transferStart),
            }}
          >
          </div>
          <div
            style={{
              width: width(timings.transferStart, timings.transferDone),
            }}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary-700 to-primary-500 rounded-sm">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
