/**
 * Typed callable function. Yes, not all functions are callable - there are ES6 classes.
 */
export type Formula<
	Host = any,
	Args extends any[] = any[],
	Result = any
> = (this: Host, ...args: Args) => Result

/**
 * Checks if `val` is a `Formula`.
 */
export function formulaIs(val: unknown): val is Formula {
	return (
		typeof val === 'function' &&
		(
			!('prototype' in val) ||
			// https://stackoverflow.com/a/56035104
			!Object.getOwnPropertyNames(val).includes('arguments')
		)
	)
}

/**
 * Change a function's name.
 */
export let formulaName = <F extends Function>(f: F, next: string) => (
	Reflect.defineProperty(f, 'name', {value: next}),
	f
)
