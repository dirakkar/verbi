let cache = new WeakMap

let keyFns = [Object.getOwnPropertyNames, Object.getOwnPropertySymbols]

export let compare = (a, b) => {
	if (Object.is(a, b)) return true

	if (
		a === null ||
		b === null ||
		typeof a !== 'object' ||
		typeof b !== 'object'
	) return false

	let ap = Reflect.getPrototypeOf(a)
	if (ap !== Reflect.getPrototypeOf(b)) return false

	if (
		a instanceof Error ||
		a instanceof Date
	) return a.valueOf() === b.valueOf()
	if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags

	let ac = cache.get(a)
	if (ac) {
		let res = ac.get(b)
		if (res !== undefined) return res
	} else {
		cache.set(a, (ac = new WeakMap().set(b, true)))
	}

	let res = false

	builtin: {
		if (!ap || !Reflect.getPrototypeOf(ap)) {
			for (let fn of keyFns) {
				let keys = fn(a)
				if (!cmpArr(keys, fn(b))) break builtin
				for (let key of keys) {
					if (!compare(a[key], b[key])) break builtin
				}
			}

			res = true
		}

		else if (Array.isArray(a)) {
			res = cmpArr(a, b)
		}

		// reuse 'res' to store collection kind (true for Map, false for Set) until relevant result is evaluated
		else if (a instanceof Set || (res = a instanceof Map)) {
			res = (
				a.size === b.size &&
				(!res || cmpItr(a.keys(), b.keys())) &&
				cmpItr(a.values(), b.values())
			)
		}

		else if (a[Symbol.iterator]) {
			res = cmpItr(a[Symbol.iterator](), b[Symbol.iterator]())
		}

		else if (a[Symbol.toPrimitive]) {
			try {
				res = compare(a[Symbol.toPrimitive]('default'), b[Symbol.toPrimitive]('default'))
			} catch (error) {
				console.error(error)
			}
		}
	}

	ac.set(b, res)

	return res
}

let cmpArr = (a, b) => {
	let i = a.length
	if (i !== b.length) return false

	while (i--) {
		if (!compare(a[i], b[i])) return false
	}

	return true
}

let cmpItr = (a, b) => {
	for (;;) {
		let an = a.next()
		let bn = b.next()

		if (an.done || bn.done) return an.done === bn.done

		if (!compare(an.value, bn.value)) return false
	}
}
