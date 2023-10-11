// here we use function declaration syntax for assertion functions because of this issue:
// https://github.com/microsoft/TypeScript/issues/34523

import {Typeofs, typeof_} from './typeof'
import {compare} from './compare'

export namespace assert {
	let isTrue = (
		value: boolean,
		config: AssertionConfig,
	) => {
		if (value !== true) {
			throw new Assertion(config)
		}
	}

	export let is = <T>(
		got: T,
		expected: T,
		message = 'Values must be equal',
	) => isTrue(Object.is(got, expected), {expected, got, message})

	export let isnt = <T>(
		got: T,
		forbidden: T,
		message = 'Values must not be equal',
	) => isTrue(!Object.is(got, forbidden), {got, message})

	export let like = <T>(
		got: T,
		expected: T,
		message = 'Values must be structurally equal',
	) => isTrue(compare(got, expected), {got, expected, message})

	export let notLike = <T>(
		got: T,
		forbidden: T,
		message = 'Values must not be structurally equal',
	) => isTrue(!compare(got, forbidden), {got, message})

	export type ThrowsConfig = {
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

	export let throws = (
		block: () => void,
		{message, valid}: ThrowsConfig = {}
	) => {
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

	export let throwsAsync = async (
		block: () => void,
		{message, valid}: ThrowsConfig = {}
	) => {
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

	export let matches = (
		string: string,
		pattern: RegExp,
		message = `String must match pattern "${pattern}"`
	) => isTrue(pattern.test(string), {
		message,
		expected: pattern,
		got: string,
	})


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
