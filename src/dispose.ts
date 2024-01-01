export type DisposeAble =
	| {[Symbol.dispose](): void}
	| {[Symbol.asyncDispose](): void}


// @ts-ignore
Symbol.dispose ??= Symbol()
// @ts-ignore
Symbol.asyncDispose ??= Symbol()

export function disposeAble(v: unknown): v is DisposeAble {
	return !!v && typeof v === 'object' && (Symbol.dispose in v || Symbol.asyncDispose in v)
}
