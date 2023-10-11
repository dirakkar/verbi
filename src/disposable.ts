export type Disposable = {
	dispose(): void
}

export let disposableIs = (v: unknown): v is Disposable =>
	!!v && typeof (v as any).dispose === 'function'
