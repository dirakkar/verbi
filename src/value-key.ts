import {dictCheck} from './dict'

let objectId = 0
const objects = new WeakMap<object, number>

/**
 * Smarter `JSON.stringify` for generating stable string keys from objects:
 *	- regular expressions are stringified
 *	- instances of classes are replaced with unique numeric identifiers unless they implemented `toJSON`
 */
export function valueKey(v: any) {
	return JSON.stringify(v, (_, v) => {
		if (
			v === null ||
			(typeof v !== 'object' && typeof v !== 'object') ||
			Array.isArray(v)
		) return v

		if (dictCheck(v)) return v
		if ('toJSON' in v) return v
		if (v instanceof RegExp) return String(v)

		return objects.get(v) ?? (objects.set(v, ++objectId), objectId)
	})
}
