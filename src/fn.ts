/**
 * Typed callable function. Yes, not all functions are callable - there are ES6 classes.
 */
export type Fn<
	Host = any,
	Args extends any[] = any[],
	Result = any
> = (this: Host, ...args: Args) => Result

/**
 * Checks if value is a callable function.
 */
export function fnCheck(v: any): v is Fn {
	// https://stackoverflow.com/a/56035104
	return typeof v === 'function' && ( !('prototype' in v) || !Object.getOwnPropertyNames(v).includes('arguments') )
}

/**
 * Change a function's name.
 */
export function fnName<F extends Function>(f: F, name: string) {
	Reflect.defineProperty(f, 'name', {value: name})
	return f
}

/**
 * Does nothing.
 */
export function fnNoop() {
}

/**
 * Returns the passed value.
 */
export function fnId<T>(v: T) {
	return v
}
