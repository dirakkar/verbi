export interface Disposable {
	dispose(): void
}

export function disposableIs(val: unknown): val is Disposable {
	return !!val && typeof (val as any).dispose === 'function'
}
