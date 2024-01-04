export type DisposeAble =
	| {[Symbol.dispose](): void}
	| {[Symbol.asyncDispose](): Promise<void>}


// @ts-ignore
Symbol.dispose ??= Symbol()
// @ts-ignore
Symbol.asyncDispose ??= Symbol()

export function disposeAble(v: unknown): v is DisposeAble {
	return !!v && typeof v === 'object' && (Symbol.dispose in v || Symbol.asyncDispose in v)
}

export function dispose(v: DisposeAble) {
	return Symbol.dispose in v
		? v[Symbol.dispose]()
		: v[Symbol.asyncDispose]().catch(console.error)
}
