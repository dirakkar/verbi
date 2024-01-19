import {objectCheck} from './object'

export type DisposeAble =
	| {[Symbol.dispose](): void}
	| {[Symbol.asyncDispose](): Promise<void>}

// TODO remove when dispose symbols are added to browsers
// @ts-ignore
Symbol.dispose ??= Symbol()
// @ts-ignore
Symbol.asyncDispose ??= Symbol()

export function disposeAble(v: any): v is DisposeAble {
	return objectCheck(v) && (Symbol.dispose in v || Symbol.asyncDispose in v)
}

export function dispose(v: DisposeAble) {
	return Symbol.dispose in v
		? v[Symbol.dispose]()
		: v[Symbol.asyncDispose]().catch(console.error)
}
