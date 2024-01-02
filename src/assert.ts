import {Typeofs, typeof_} from './typeof'
import {compare} from './compare'

export namespace assert {
	function isTrue(value: boolean, config: AssertionConfig) {
		if (value !== true) {
			throw new Assertion(config)
		}
	}

	export function is<T>(
		got: T,
		expected: T,
		message = 'Values must be equal'
	) {
		return isTrue(Object.is(got, expected), {expected, got, message})
	}

	export function isnt<T>(
		got: T,
		forbidden: T,
		message = 'Values must not be equal',
	) {
		isTrue(!Object.is(got, forbidden), {got, message})
	}

	export function like<T>(
		got: T,
		expected: T,
		message = 'Values must be structurally equal',
	) {
		isTrue(compare(got, expected), {got, expected, message})
	}

	export function notLike<T>(
		got: T,
		forbidden: T,
		message = 'Values must not be structurally equal',
	) {
		isTrue(!compare(got, forbidden), {got, message})
	}

	export interface ThrowsConfig {
		message?: string
		valid?: Function | RegExp
	}

	export function isInstance<T>(
		value: unknown,
		constructor: Function & {prototype: T},
		message = `Value must be an instance of "${constructor.name}"`,
	): asserts value is T {
		return isTrue(value instanceof constructor, {
			message,
			expected: constructor.name,
			got: value?.constructor.name,
		})
	}

	export function throws(
		block: () => Promise<any>,
		valid: Function | RegExp,
		message?: string,
	): Promise<void>
	export function throws(
		block: () => void,
		valid: Function | RegExp,
		message?: string,
	): void
	export function throws(
		block: () => Promise<void> | void,
		valid: Function | RegExp,
		message?: string,
	): Promise<void> | void {
		let error: any
		let caught = false

		try {
			let result = block()
			if (result instanceof Promise) {
				result = result.catch(_error => {
					caught = true
					_error
				})
				result = result.finally(() => {
					throwsCheck(valid, message, caught, error)
				})
				return result
			}
		} catch (_error) {
			caught = true
			error = _error
		}

		throwsCheck(valid, message, caught, error)
	}

	function throwsCheck(valid: Function | RegExp, message: string | undefined, caught: boolean, error: unknown) {
		isTrue(caught, {message: message ?? 'Function must throw'})

		if (valid instanceof RegExp) {
			matches(String(error), valid, message ?? `String representation of an error must match "${valid}"`)
		} else if (valid) {
			isInstance(error, valid, message ?? `Thrown error must be an instance of "${valid.name}"`)
		}
	}

	export function matches(
		string: string,
		pattern: RegExp,
		message = `String must match pattern "${pattern}"`
	) {
		return isTrue(pattern.test(string), {
			message,
			expected: pattern,
			got: string,
		})
	}


	export function type<T extends keyof Typeofs>(
		value: unknown,
		type: T,
		message = `Value must have type "${type}"`
	): asserts value is Typeofs[T] {
		let got = typeof_(value)

		isTrue(got === type, {
			message,
			expected: type,
			got,
		})
	}

	export function notType<T extends keyof Typeofs>(
		value: unknown,
		type: T,
		message = `Value must not have type "${type}"`
	): asserts value is Typeofs[Exclude<keyof Typeofs, T>] {
		let got = typeof_(value)

		isTrue(got !== type, {
			message,
			got,
		})
	}
}

export type AssertionConfig = {
	message: string
	expected?: unknown
	got?: unknown
}

export class Assertion extends Error {
	constructor(public config: AssertionConfig) {
		super(config.message)
	}
}
