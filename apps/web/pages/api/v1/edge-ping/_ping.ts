export type PingRequest = {
	urls: string[];
	method: string;
	body: string;
	headers: Record<string, string>;
	//Timeout in milliseconds
	timeout: number;
};

type CheckRequest = {
	url: string;
	method: string;
	body: string;
	headers: Record<string, string>;
	//Timeout in milliseconds
	timeout: number;
};

type PingResponse = {
	status?: number;
	latency?: number;
	body?: string;
	headers?: Record<string, string>;
	time: number;
	error?: string;
	tags?: string[];
};

export async function ping(req: PingRequest): Promise<PingResponse[]> {
	console.log({ req });
	const responses: PingResponse[] = [];

	for (let i = 0; i < req.urls.length; i++) {
		try {
			const checkRequest: CheckRequest = {
				url: req.urls[i],
				method: req.method,
				body: req.body,
				headers: req.headers,
				timeout: req.timeout,
			};
			// 1 retry if the request fails
			const res = await check(checkRequest).catch(() => {
				return check(checkRequest);
			});
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
		() =>
			controller.abort(
				new Error(`Request timeout reached after ${req.timeout} ms`),
			),
		req.timeout,
	);
	const res = await fetch(req.url, {
		method: req.method,
		body: req.body,
		headers: req.headers,
		signal: controller.signal,
		redirect: "manual",
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
		body: btoa(body),
		headers,
		time: now,
	};
}
