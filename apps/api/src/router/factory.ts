import type { Router } from ".";

export type RouteFactory = (router: Router) => Router["route"];
