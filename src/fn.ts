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
export let fnIs = (v: unknown): v is Fn => (
	typeof v === 'function' &&
	(
		!('prototype' in v) ||
		// https://stackoverflow.com/a/56035104
		!Object.getOwnPropertyNames(v).includes('arguments')
	)
)

/**
 * Change a function's name.
 */
export let fnName = <F extends Function>(f: F, next: string) =>
	(Reflect.defineProperty(f, 'name', {value: next}), f)
