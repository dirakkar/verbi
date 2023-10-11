export type Rec<T = unknown> = Partial<Record<string, T>>

export type RecEntries<T> = readonly (readonly [string, T])[]

export type RecEmpty = Rec<never>

/**
 * A TypeScript trick to make a mapped type's representation in the diagnostic messages more readable.
 */
export type RecSimplify<T> = {[K in keyof T]: T[K]} & {}

export type RecKeysMatching<T, Condition> = NonNullable<{
	[K in keyof T]: T[K] extends Condition ? K : never
}[keyof T]>

/**
 * Transforms an object's key-value entries
 */
export let recMapEntries = <I extends {}, OK extends string, OV>(
	rec: I,
	mapper: (key: keyof I, value: I[keyof I]) => [key: OK, value: OV],
) =>
	Object.fromEntries(recMap(rec, mapper)) as RecSimplify<Record<OK, OV>>

/**
 * Transforms an object's values
 */
export let recMapValues = <I extends {}, OV>(
	rec: I,
	mapper: (value: I[keyof I], key: keyof I) => OV
) =>
	Object.fromEntries(
		Object.entries(rec).map(
			([key, value]) => [key, mapper(value as any, key as any)]
		)
	) as RecSimplify<Record<keyof I, OV>>

export let recMap = <I extends {}, O>(
    rec: I,
    mapper: (key: keyof I, value: I[keyof I]) => O,
) => Object.entries(rec)
    .map(([key, value]) => mapper(key as any, value as any)) as O[]

/**
 * Checks whether a value is a plain object (not an instance of a class).
 */
export function recIs(val: any): val is Rec {
	if (typeof val !== 'object' || !val) return false
	let proto = Reflect.getPrototypeOf(val)
	if (!proto) return true
	return !Reflect.getPrototypeOf(proto)
}

export let recPick = <T extends object, Key extends keyof T>(
	rec: T,
	keys: Key[] | ((key: keyof T, value: T[Key]) => key is Key)
) => {
	let result = {} as RecSimplify<Pick<T, Key>>

	let keyList = keys as Key[]
	if (typeof keys === 'function') {
		keyList = Object.keys(rec)
			.filter(key => keys(key as any, (rec as any)[key])) as Key[]
	}

	for (let key of keyList) {
		result[key] = rec[key]
	}

	return result
}
