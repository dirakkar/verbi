const cache = new WeakMap

/**
 * Efficient structural comparison of various JavaScript values:
 *	- primitive values
 *	- plain objects
 *	- arrays
 *	- class instances
 *	- Date, Error and RegExp objects
 *	- Map and Set objects
 *	- iterables
 */
export function compare(a: any, b: any) {
	if (Object.is(a, b)) return true

	if (
		a === null ||
		b === null ||
		typeof a !== 'object' ||
		typeof b !== 'object'
	) return false

	const prototype = Reflect.getPrototypeOf(a)
	if (prototype !== Reflect.getPrototypeOf(b)) return false

	if (a instanceof Date) return a.getTime() === b.getTime()
	if (a instanceof Error) return a.stack === b.stack
	if (a instanceof RegExp) return String(a) === String(b)

	let aCache = cache.get(a)
	if (aCache) {
		var result = aCache.get(b)
		if (typeof result === 'boolean') return result
	} else {
		cache.set(a, (aCache = new WeakMap().set(b, true)))
	}

	result = false

	if (!prototype || !Reflect.getPrototypeOf(prototype)) {
		const keys = Object.getOwnPropertyNames(a)
		result = compareArrays(keys, Object.getOwnPropertyNames(b))
		if (result) {
			for (const key of keys) {
				if (!compare(a[key], b[key])) {
					result = false
					break
				}
			}
		}
	} else if (Array.isArray(a)) {
		result = compareArrays(a, b)
	} else if (a instanceof Set || (result = a instanceof Map)) {
		result = (
			a.size === b.size &&
			(!result || compareIterators(a.keys(), b.keys())) &&
			compareIterators(a.values(), b.values())
		)
	} else if (a[Symbol.iterator]) {
		result = compareIterators(a[Symbol.iterator](), b[Symbol.iterator]())
	} else if (a[Symbol.toPrimitive]) {
		try {
			result = compare(a[Symbol.toPrimitive]('default'), b[Symbol.toPrimitive]('default'))
		} catch (e) {
			console.error(e)
		}
	}

	aCache.set(b, result)

	return result
}


function compareArrays(a: any[], b: any[]) {
	let i = a.length
	if (i !== b.length) return false

	while (i--) {
		if (!compare(a[i], b[i])) return false
	}
	return true
}

function compareIterators(a: Iterator<any>, b: Iterator<any>) {
	for (;;) {
		const aNext = a.next()
		const bNext = b.next()

		if (aNext.done || bNext.done) {
			return aNext.done === bNext.done
		}

		if (!compare(aNext.value, bNext.value)) return false
	}
}

