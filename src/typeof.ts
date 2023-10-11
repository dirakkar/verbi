export type Typeofs = {
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

export let typeof_ = (x: unknown): keyof Typeofs =>
	x === null ? 'null' : typeof x

export let typeofIs = <T extends keyof Typeofs>(
	type: T,
	x: unknown
): x is Typeofs[T] =>
	typeof_(x) === type
