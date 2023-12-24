import {decorator} from './decorator'
import {valKey} from './val'

/**
 * Wraps a function or a method so that it executes only once and then returns the result from the cache.
 */
export const once = decorator<any>('once', (formula, store) => function() {
	if (store.has(this)) {
		var result = store.get(this)
	} else {
		try {
			result = formula.apply(this)
		} catch (error) {
			result = error
		}

		store.set(this, result)
	}

	if (result instanceof Error) throw result
	return result
})

/**
 * Keyed version of {@link once}.
 */
export const onceDict = decorator<Map<string, any>>('onceDict', (formula, store) => function(...args) {
	let cache = store.get(this)
	if (!cache) {
		store.set(this, (cache = new Map))
	}

	const key = valKey(args[0])

	let result: any
	if (cache.has(key)) {
		result = cache.get(key)
	} else {
		try {
			result = formula.apply(this, args)
		} catch (error) {
			result = error
		}

		cache.set(key, result)
	}

	if (result instanceof Error) throw result
	return result
})
