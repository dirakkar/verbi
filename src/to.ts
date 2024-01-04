import {tyger} from './tyger'
import {Fn, fnName, fnIs, fnNoop} from './fn'
import {promiseLike} from './promise'
import {rethrow} from './rethrow'

export type ToSync<T> = T extends Fn ? ToSyncMethod<T> : {
	[K in keyof T]: T[K] extends Fn ? ToSyncMethod<T[K]> : T[K]
}

export type ToSyncMethod<T extends Fn> = T extends Fn<any, infer Args, Promise<infer Result>>
	? (...args: Args) => Result
	: T

export const toSync = to('toSync', formula => {
	const Task = tyger.Task.for(formula)
	return function (...args) {
		return tyger.pull(Task.get(args, this))
	}
}) as <T extends object>(val: T, name?: string) => ToSync<T>

export type ToAsync<T> = T extends Fn ? ToAsyncMethod<T> : {
	[K in keyof T]: T[K] extends Fn ? ToAsyncMethod<T[K]> : T[K]
}

export type ToAsyncMethod<T extends Fn> = T extends Fn<any, infer Args, infer Result>
	? (...args: Args) => Promise<Result>
	: T

export const toAsync = to('toAsync', formula => {
	const Task = tyger.Task.for(formula)
	let task: tyger.Task | undefined

	return async function (...args) {
		if (task) tyger.kill(task)
		task = Task.get(args, this)

		for (;;) {
			tyger.fresh(task)

			if (task.c instanceof Error) rethrow(task.c)
			if (!promiseLike(task.c)) return task.c

			await task.c

			if (task.t === -4) await new Promise(fnNoop)
		}
	}
}) as <T extends object>(val: T, name?: string) => ToAsync<T>

function to(name: string, wrap: (formula: Fn) => Fn) {
	return fnName((val: object, name?: string) => {
		if (fnIs(val)) {
			return name ? fnName(wrap(val), name) : wrap(val)
		}

		return new Proxy(val, {
			get(_, key) {
				const method = val[key as never]
				// TODO make it more performant?
				if (fnIs(method)) return wrap(method).bind(val)
				return method
			}
		})
	}, name)
}
