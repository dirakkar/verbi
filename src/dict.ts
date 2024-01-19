export type Dict<Value> = Partial<Record<string, Value>>

export type DictEmpty = Dict<never>

/**
 * A TypeScript trick to make a mapped type's representation in the diagnostic messages more readable.
 */
export type DictSimplify<Dict> = {[Key in keyof Dict]: Dict[Key] & {}}

export type DictEntries<Value> = readonly (readonly [key: string, value: Value])[]

export function dictCheck(v: any): v is Dict<unknown> {
	if (v === null || typeof v !== 'object') return false
	const prototype = Reflect.getPrototypeOf(v)
	return !prototype || !Reflect.getPrototypeOf(prototype)
}
