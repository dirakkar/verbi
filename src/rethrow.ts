import {promiseLike} from './promise'

/**
 * Ignore errors thrown from here when debugging.
 */
export function rethrow(val: any): never {
	throw val
}

export function rethrowPromise<T>(val: T): asserts val is Exclude<T, Promise<any>> {
	if (promiseLike(val)) rethrow(val)
}
