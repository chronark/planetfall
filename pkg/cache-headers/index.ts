export type CacheControlDirective = {
  name: string;
  value?: number;
  explanation?: string;
};

export function parseCacheControlHeaders(cacheControl: string) {
  const directives: CacheControlDirective[] = [];

  for (const directive of cacheControl.split(",")) {
    const [name, value] = directive.trim().split("=");
    let explanation = "";

    switch (name.trim()) {
      case "public":
        explanation =
          "Indicates that the response may be cached by any cache, even if it would normally be non-cacheable or cacheable only within a non- shared cache.";
        break;
      case "private":
        explanation =
          "Indicates that all or part of the response message is intended for a single user and must not be cached by a shared cache.";
        break;
      case "no-cache":
        explanation =
          "Indicates that the response can be cached, but must be revalidated by the origin server before it can be served from cache.";
        break;
      case "no-store":
        explanation =
          "Indicates that a cache must not store any part of either the request or the response.";
        break;
      case "must-revalidate":
        explanation =
          "Indicates that once a response becomes stale, a cache must not use the response without revalidating it with the origin server.";
        break;
      case "max-age":
        if (!isNaN(Number(value))) {
          explanation = `Indicates that the response is fresh for the specified number of seconds (${value}).`;
        }
        break;
      case "s-maxage":
        if (!isNaN(Number(value))) {
          explanation = `Overrides the max-age directive for shared caches, indicating that the response is fresh for the specified number of seconds (${value}).`;
        }
        break;
      case "immutable":
        explanation =
          "Indicates that the response body will not change over time, making it suitable for caching even by a browser or intermediate cache that doesn't honor other caching directives.";
        break;
      case "no-transform":
        explanation =
          "Indicates that an intermediary cache or proxy must not change the content-coding or media type of the response entity-body.";
        break;
    }

    directives.push({
      name: name.trim(),
      value: !isNaN(Number(value)) ? Number(value) : undefined,
      explanation: explanation,
    });
    return directives;
  }
}
