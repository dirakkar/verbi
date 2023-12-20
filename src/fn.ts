/**
 * Typed callable function. Yes, not all functions are callable - there are ES6 classes.
 */
export type Fn<
	Host = any,
	Args extends any[] = any[],
	Result = any
> = (this: Host, ...args: Args) => Result

/**
 * Checks if `val` is a `Formula`.
 */
export function fnIs(v: unknown): v is Fn {
	// https://stackoverflow.com/a/56035104
	return typeof v === 'function' && (!('prototype' in v) || !Object.getOwnPropertyNames(v).includes('arguments'))
}

/**
 * Change a function's name.
 */
export function fnName<F extends Function>(f: F, next: string) {
	Reflect.defineProperty(f, 'name', {value: next})
	return f
}

/**
 * Does nothing.
 */
export function fnNop() {}
