import {recIs} from './rec'

let objectId = -1
let objects = new WeakMap<object, number>

/**
 * A smarter `JSON.stringify` for generating stable string keys from any objects:
 * - regular expressions are stringified
 * - instances of classes are replaced with unique numeric ids unless they define `toJSON`
 */
export let valKey = (val: unknown) => {
	return JSON.stringify(val, (_, val) => {
		if (
			!val ||
			(typeof val !== 'object' && typeof val !== 'function') ||
			Array.isArray(val)
		) return val

		if (recIs(val)) return val
		if ('toJSON' in val) return val
		if (val instanceof RegExp) return val.toString()

		return objects.get(val) ?? (objects.set(val, ++objectId), objectId)
	})
}

export {uneval as valSerialize} from 'devalue'
