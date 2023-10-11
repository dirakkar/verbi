import {Atom} from './atom'
import {Formula, formulaName, formulaIs} from './formula'
import {noop} from './noop'
import {promiseLike} from './promise'
import {rethrow} from './rethrow'

let to = (name: string, wrap: (formula: Formula) => Formula) => formulaName((val: object, name?: string) => {
	if (formulaIs(val)) {
		return name
			? formulaName(wrap(val), name)
			: wrap(val)
	}

	return new Proxy(val, {
		get(_, key) {
			let method = val[key as never]
			// TODO make it more performant?
			if (formulaIs(method)) return wrap(method).bind(val)
			return method
		}
	})
}, name)

export type ToSync<T> = T extends Formula ? ToSyncMethod<T> : {
	[K in keyof T]: T[K] extends Formula ? ToSyncMethod<T[K]> : T[K]
}

export type ToSyncMethod<T extends Formula> = T extends Formula<any, infer Args, Promise<infer Result>>
	? (...args: Args) => Result
	: T

export let toSync = to('toSync', formula => function (...args) {
	return Atom.pull(Atom.task(this, formula, args))
}) as <T extends object>(val: T, name?: string) => ToSync<T>

export type ToAsync<T> = T extends Formula ? ToAsyncMethod<T> : {
	[K in keyof T]: T[K] extends Formula ? ToAsyncMethod<T[K]> : T[K]
}

export type ToAsyncMethod<T extends Formula> = T extends Formula<any, infer Args, infer Result>
	? (...args: Args) => Promise<Result>
	: T

export let toAsync = to('toAsync', formula => {
	let task: Atom | undefined

	return async function (...args) {
		task?.dispose()
		task = Atom.task(this, formula, args)

		for (;;) {
			Atom.refresh(task)

			if (task.c instanceof Error) rethrow(task.c)
			if (!promiseLike(task.c)) return task.c

			await task.c

			if (task.t === -4) await new Promise(noop)
		}
	}
}) as <T extends object>(val: T, name?: string) => ToAsync<T>

