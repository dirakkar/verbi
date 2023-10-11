/**
 * Creates a promise with attached `resolve` and `reject` methods identical to arguments passed to a native Promise's `executor`.
 */
export let promiseMake = <T = void>(dispose?: () => void) => {
	let resolve!: (value: T | PromiseLike<T>) => void
	let reject!: (reason?: any) => void

	return Object.assign(new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	}), {resolve, reject, dispose})
}


/**
 * Checks whether `val` looks like a thenable object.
 */
export function promiseLike(val: any): val is PromiseLike<any> {
	return val && typeof val.then === 'function'
}
