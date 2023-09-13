import {Typeofs, typeof_} from './typeof'
import {compare} from './compare'

export namespace assert {
	function isTrue(
		value: boolean,
		config: AssertionConfig
	): asserts value is true {
		if (value !== true) {
			throw new Assertion(config)
		}
	}

	export function is<T>(
		got: T,
		expected: T,
		message = 'Values must be equal'
	) {
		isTrue(Object.is(got, expected), {expected, got, message})
	}

	export function isnt<T>(
		got: T,
		forbidden: T,
		message = 'Values must not be equal'
	) {
		isTrue(!Object.is(got, forbidden), {got, message})
	}

	export function like<T>(
		got: T,
		expected: T,
		message = 'Values must be structurally equal'
	) {
		isTrue(compare(got, expected), {got, expected, message})
	}

	export function notLike<T>(
		got: T,
		forbidden: T,
		message = 'Values must not be structurally equal'
	) {
		isTrue(!compare(got, forbidden), {got, message})
	}

	interface ThrowsConfig {
		message?: string
		valid?: Function | RegExp
	}

	export function throws(
		block: () => void,
		{message, valid}: ThrowsConfig = {}
	) {
		let error: any
		let caught = false

		try {
			block()
		} catch (_error) {
			caught = true
			error = _error
		}

		isTrue(caught, {message: message ?? 'Function must throw'})

		if (valid instanceof RegExp) {
			matches(String(error), valid, message ?? `String representation of an error must match "${valid}"`)
		} else if (valid) {
			isInstance(error, valid, `Thrown error must be an instance of "${valid.name}"`)
		}

		return error
	}

	export async function throwsAsync(
		block: () => void,
		{message, valid}: ThrowsConfig = {}
	) {
		let error: any
		let caught = false

		try {
			await block()
		} catch (_error) {
			caught = true
			error = _error
		}

		isTrue(caught, {message: message ?? 'Function must throw'})

		if (valid instanceof RegExp) {
			matches(String(error), valid, message ?? `String representation of an error must match "${valid}"`)
		} else if (valid) {
			isInstance(error, valid, `Thrown error must be an instance of "${valid.name}"`)
		}

		return error
	}

	export function matches(
		string: string,
		pattern: RegExp,
		message = `String must match pattern "${pattern}"`
	) {
		isTrue(pattern.test(string), {
			message,
			expected: pattern,
			got: string,
		})
	}

	export function isInstance<T>(
		value: unknown,
		ctor: Function & {prototype: T},
		message = `Value must be an instance of "${ctor.name}"`
	): asserts value is T {
		isTrue(value instanceof ctor, {
			message,
			expected: ctor.name,
			got: value?.constructor.name,
		})
	}

	export function type<T extends keyof Typeofs>(
		value: unknown,
		type: T,
		message = `Value must have type "${type}"`
	): asserts value is Typeofs[T] {
		const got = typeof_(value)

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
		const got = typeof_(value)

		isTrue(got !== type, {
			message,
			got,
		})
	}
}

export interface AssertionConfig {
	message: string
	expected?: unknown
	got?: unknown
}

export class Assertion extends Error {
	constructor(public config: AssertionConfig) {
		super(config.message)
	}
}
