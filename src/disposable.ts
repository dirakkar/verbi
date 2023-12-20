export type Disposable = {
	[Symbol.dispose](): void
}

(Symbol.dispose as any) ??= Symbol('Symbol.dispose')

export function disposableIs(v: unknown): v is Disposable {
	return !!v && typeof (v as any)[Symbol.dispose] === 'function'
}
