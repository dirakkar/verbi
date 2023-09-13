export type ListenerTarget = {
	addEventListener(event: string, listener: (...payload: any) => void): void
	removeEventListener(event: string, listener: (...payload: any) => void): void
} | {
	on(event: string, listener: (...payload: any) => void): void
	off(event: string, listener: (...payload: any) => void): void
}

export type ListenerPayload<
	Target extends ListenerTarget,
	Type extends string,
> =
	& Target extends Record<`on${Type}`, infer Listener>
	// @ts-expect-error
	? Parameters<Listener>
	: Target extends Record<'addEventListener', (type: Type, listener: infer Listener) => void>
	// @ts-expect-error
	? Parameters<Listener>
	: Target extends Record<'on', (type: Type, listener: infer Listener) => void>
	// @ts-expect-error
	? Parameters<Listener>
	: never

export class Listener<
	Target extends ListenerTarget,
	Event extends string
> {
	constructor(
		public target: Target,
		public event: Event,
		public listener: (...payload: ListenerPayload<Target, Event>) => void
	) {
		if ('on' in this.target) this.target.on(this.event, this.listener)
		else this.target.removeEventListener(this.event, this.listener)
	}

	dispose() {
		if ('on' in this.target) this.target.off(this.event, this.listener)
		else this.target.removeEventListener(this.event, this.listener)
	}
}
