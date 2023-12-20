import {promiseLike} from './promise'
import {rethrow} from './rethrow'

type Tasks = (() => any)[]

export type TygerConcurrent<T extends Tasks> = {
	[I in keyof T]: I extends number
		? ReturnType<T[I]>
		: T[I]
}

/**
 * Execute multiple suspending tasks concurrently.
 */
export function tygerConcurrent<T extends Tasks>(tasks: T, max = Infinity) {
	let results = tasks.map(task => {
		if (!max) return

		try {
			return task()
		} catch (error) {
			if (promiseLike(error)) max--
			return error
		}
	})

	const promises = results.filter(promiseLike)
	if (promises.length) rethrow(Promise.race(promises))

	const error = results.find(r => r instanceof Error)
	if (error) rethrow(error)

	return results as TygerConcurrent<T>
}
