export type Dict<Value> = Partial<Record<string, Value>>

export type DictEmpty = Dict<never>

/**
 * A TypeScript trick to make a mapped type's representation in the diagnostic messages more readable.
 */
export type DictSimplify<Dict> = {[Key in keyof Dict]: Dict[Key] & {}}

export type DictEntries<Value> = readonly (readonly [key: string, value: Value])[]
