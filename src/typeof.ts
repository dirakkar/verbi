export interface Typeofs {
	null: null
	undefined: undefined
	boolean: boolean
	number: number
	bigint: bigint
	symbol: symbol
	string: string
	object: object
	function: Function
}

export function typeof_(x: unknown): keyof Typeofs {
	return x === null ? 'null' : typeof x
}

export function typeofIs<T extends keyof Typeofs>(
	type: T,
	x: unknown
): x is Typeofs[T] {
	return typeof_(x) === type
}
