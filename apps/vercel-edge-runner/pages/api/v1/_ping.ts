export type PingRequest = {
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
  //Timeout in milliseconds
  timeout: number;
  followRedirects?: boolean;

  prewarm?: boolean;
  runs?: number;
};

type CheckRequest = {
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
  //Timeout in milliseconds
  timeout: number;
  followRedirects?: boolean;
};

export type PingResponse = {
  status?: number;
  latency?: number;
  body?: string;
  headers?: Record<string, string>;
  time: number;
  error?: string;
  tags?: string[];
};

export async function ping(req: PingRequest): Promise<PingResponse[]> {
  const checkRequest: CheckRequest = {
    url: req.url,
    method: req.method,
    body: req.body,
    headers: {
      "User-Agent": "planetfall/1.0",
      ...req.headers,
    },
    timeout: req.timeout,
    followRedirects: req.followRedirects,
  };
  if (req.prewarm) {
    console.log("Prewarming", req.url);
    console.time(`warming up: ${req.url}`);
    await check(checkRequest);
    console.timeEnd(`warming up: ${req.url}`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  const runs = req.runs ?? 1;
  const responses: PingResponse[] = [];

  for (let i = 0; i < runs; i++) {
    try {
      // 1 retry if the request fails
      console.time(`${req.url} run ${i}`);
      const res = await check(checkRequest).catch((err) => {
        console.error(`Request failed, but we'll retry once: ${err}`);
        return check(checkRequest);
      });
      console.timeEnd(`${req.url} run ${i}`);

      responses.push(res);
    } catch (e) {
      const err = e as Error;

      console.error(err);
      responses.push({
        error: err.message,
        time: Date.now(),
      });
    }
  }

  return responses;
}

async function check(req: CheckRequest): Promise<PingResponse> {
  const now = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error(`Request timeout reached after ${req.timeout} ms`)),
    req.timeout,
  );
  const res = await fetch(req.url, {
    keepalive: true,
    method: req.method,
    body: req.body,
    headers: req.headers,
    signal: controller.signal,
    redirect: req.followRedirects ? "follow" : "manual",
    cache: "no-store",
    next: {
      revalidate: 0
    }
  });
  const latency = Date.now() - now;
  clearTimeout(timeout);

  const headers: Record<string, string> = {};
  for (const [key, value] of res.headers) {
    headers[key] = value;
  }
  const body = (await res.text()).slice(0, 500); // 1kb

  return {
    status: res.status,
    latency,
    body: base64Encode(body),
    headers,
    time: now,
  };
}

const base64abc = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/",
];

/**
 * CREDIT: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
 * Encodes a given Uint8Array, ArrayBuffer or string into RFC4648 base64 representation
 * @param data
 */
export function base64Encode(data: string): string {
  const uint8 = new TextEncoder().encode(data);

  let result = "";
  let i;
  const l = uint8.length;
  for (i = 2; i < l; i += 3) {
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
    result += base64abc[((uint8[i - 1] & 0x0f) << 2) | (uint8[i] >> 6)];
    result += base64abc[uint8[i] & 0x3f];
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[(uint8[i - 2] & 0x03) << 4];
    result += "==";
  }
  if (i === l) {
    // 2 octets yet to write
    result += base64abc[uint8[i - 2] >> 2];
    result += base64abc[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
    result += base64abc[(uint8[i - 1] & 0x0f) << 2];
    result += "=";
  }
  return result;
}
