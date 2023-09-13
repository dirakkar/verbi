const cache = new WeakMap

export function compare(a, b) {
	if (Object.is(a, b)) return true

	if (
		a === null ||
		b === null ||
		typeof a !== 'object' ||
		typeof b !== 'object'
	) return false

	const ap = Reflect.getPrototypeOf(a)
	if (ap !== Reflect.getPrototypeOf(b)) return false

	if (a instanceof Error) return Object.is(a.valueOf(), b.valueOf())
	if (a instanceof Date) return a.valueOf() === b.valueOf()
	if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags

	let ac = cache.get(a)
	if (ac) {
		const res = ac.get(b)
		if (res !== undefined) return res
	} else {
		cache.set(a, (ac = new WeakMap().set(b, true)))
	}

	let result = false

	compound: {
		if (!ap || !Reflect.getPrototypeOf(ap)) {
			const keys = Object.getOwnPropertyNames(a)
			if (!cmpArr(keys, Object.getOwnPropertyNames(b))) break compound
			for (const key of keys) {
				if (!compare(a[key], b[key])) break compound
			}

			const syms = Object.getOwnPropertySymbols(a)
			if (!cmpArr(syms, Object.getOwnPropertySymbols(b))) break compound
			else for (const key of syms) {
				if (!compare(a[key], b[key])) break compound
			}

			result = true
		} else if (Array.isArray(a)) result = cmpArr(a, b)
		else if (a instanceof Map) {
			if (a.size !== b.size) break compound
			result = (
				cmpIter(a.keys(), b.keys()) &&
				cmpIter(a.values(), b.values())
			)
		} else if (a instanceof Set) {
			if (a.size !== b.size) break compound
			result = cmpIter(a.values(), b.values())
		} else if (Symbol.iterator in a) result = cmpIter(a[Symbol.iterator](), b[Symbol.iterator]())
		else if (Symbol.toPrimitive in a) {
			try {
				result = Object.is(
					a[Symbol.toPrimitive]('default'),
					b[Symbol.toPrimitive]('default'),
				)
			} catch (error) {
				console.error(error)
			}
		}
	}

	ac.set(b, result)

	return result
}

function cmpArr(a, b) {
	let i = a.length
	if (i !== b.length) return false

	while (i--) {
		if (!compare(a[i], b[i])) return false
	}

	return true
}

function cmpIter(a, b) {
	for (;;) {
		const an = a.next()
		const bn = b.next()

		if (an.done || bn.done) return an.done === bn.done

		if (!compare(an.value, bn.value)) return false
	}
}
