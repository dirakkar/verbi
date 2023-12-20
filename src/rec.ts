export type Rec<Value> = Partial<Record<string, Value>>

export type RecEntries<Value> = readonly RecEntry<string, Value>[]

export type RecEntry<Key extends string, Value> = readonly [key: Key, value: Value]

export type RecEmpty = Rec<never>

/**
 * A TypeScript trick to make a mapped type's representation in the diagnostic messages more readable.
 */
export type RecSimplify<Rec> = {[K in keyof Rec]: Rec[K]} & {}

export type RecKeysMatching<Rec, Condition> = NonNullable<{
	[K in keyof Rec]: Rec[K] extends Condition ? K : never
}[keyof Rec]>

/**
 * Transforms an object's key-value entries
 */
export function recMapEntries<
	Rec extends {},
	OutKey extends string,
	OutValue,
>(
	rec: Rec,
	fn: (key: keyof Rec, value: Rec[keyof Rec]) => RecEntry<OutKey, OutValue>
) {
	return Object.fromEntries(recMap(rec, fn)) as RecSimplify<Record<OutKey, OutValue>>
}

/**
 * Transforms an object's values
 */
export function recMapValues<
	Rec extends {},
	Value,
>(
	rec: Rec,
	fn: (value: Rec[keyof Rec], key: keyof Rec) => Value
) {
	return Object.fromEntries(Object.entries(rec).map(([key, value]) => {
		return [key, fn(value as any, key as any)]
	})) as RecSimplify<Record<keyof Rec, Value>>
}

export function recMap<I extends object, O>(
	rec: I,
	fn: (key: keyof I, value: I[keyof I]) => O,
) {
	return Object.entries(rec).map(([key, value]) => {
		return fn(key as any, value as any)
	}) as O[]
}

/**
 * Checks whether a value is a plain object (not an instance of a class).
 */
export function recIs(val: any): val is Rec<unknown> {
	if (typeof val !== 'object' || !val) return false
	const proto = Reflect.getPrototypeOf(val)
	if (!proto) return true
	return !Reflect.getPrototypeOf(proto)
}

export function recPick<
	Rec extends object,
	Key extends keyof Rec
>(
	rec: Rec,
	pick: Key[] | ((key: keyof Rec, value: Rec[Key]) => key is Key)
) {
	const result = {} as RecSimplify<Pick<Rec, Key>>
	let keys = pick as Key[]
	if (typeof pick === 'function') {
		keys = Object.keys(rec).filter(key => {
			return pick(key as any, (rec as any)[key])
		}) as Key[]
	}
	for (const key of keys) {
		result[key] = rec[key]
	}
	return result
}
