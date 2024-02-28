import {fnNoop} from './fn'
import {objectCheck} from './object'

export interface PromiseControlled<T> extends Promise<T>, Disposable {
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
export function promiseLike(v: any): v is PromiseLike<any> {
	return objectCheck(v) && typeof (v as any).then === 'function'
}
