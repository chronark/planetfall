// fucking stupid hack to make "server components" actually work with components
// https://www.youtube.com/watch?v=h_9Vx6kio2s
export function asyncComponent<T, R>(
	fn: (arg: T) => Promise<R>,
): (arg: T) => R {
	return fn as (arg: T) => R;
}
