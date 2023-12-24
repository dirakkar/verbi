import {fnNoop} from './fn'

export type PromiseControlled<T> = Promise<T> & Disposable & {
	resolve(value: T): void
	reject(reason: any): void
}

/**
 * Creates a promise with attached `resolve` and `reject` methods identical to arguments passed to a native Promise's `executor`.
 */
export function promiseMake<T = void>(dispose = fnNoop) {
	const result = new Promise((resolve, reject) => {
		result.resolve = resolve
		result.reject = reject
	}) as PromiseControlled<T>
	result[Symbol.dispose] = dispose
	return result
}


/**
 * Checks whether `val` looks like a thenable object.
 */
export function promiseLike(val: any): val is PromiseLike<any> {
	return val && typeof val.then === 'function'
}
