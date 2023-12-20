/**
 * Matches a Node.js-style event emitter or a browser-style event target
 */
export type ListenerTargetLike = {
	addEventListener(event: string, listener: (...payload: any) => void): void
	removeEventListener(event: string, listener: (...payload: any) => void): void
} | {
	on(event: string, listener: (...payload: any) => void): void
	off(event: string, listener: (...payload: any) => void): void
}

/**
 * Attempt to infer payload type of an event emitter's event
 */
export type ListenerPayload<
	Target extends ListenerTargetLike,
	Event extends string,
> =
	& Target extends Record<`on${Event}`, infer Listener>
	// @ts-expect-error
	? Parameters<Listener>
	: Target extends Record<'addEventListener', (event: Event, listener: infer Listener) => void>
	// @ts-expect-error
	? Parameters<Listener>
	: Target extends Record<'on', (event: Event, listener: infer Listener) => void>
	// @ts-expect-error
	? Parameters<Listener>
	: never

export class Listener<
	Target extends ListenerTargetLike,
	Event extends string
> implements Disposable {
	constructor(
		public target: Target,
		public event: Event,
		public listener: (...payload: ListenerPayload<Target, Event>) => void
	) {
		if ('on' in this.target) this.target.on(this.event, this.listener)
		else this.target.removeEventListener(this.event, this.listener)
	}

	[Symbol.dispose]() {
		if ('on' in this.target) this.target.off(this.event, this.listener)
		else this.target.removeEventListener(this.event, this.listener)
	}
}
