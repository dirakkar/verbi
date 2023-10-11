import {decorator} from './decorator'

/**
 * Wraps a function or a method so that it executes only once and then returns the result from the cache.
 */
export let once = decorator<any>('once', (formula, store) => function (this: any) {
	if (store.has(this)) {
		var result = store.get(this)
	} else {
		try {
			result = formula.apply(this)
		} catch (error) {
			result = error
		} finally {
			store.set(this, result)
		}
	}

	if (result instanceof Error) throw result
	return result
})
