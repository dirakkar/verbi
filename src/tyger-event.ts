import {dict} from './dict'
import {Listener, ListenerPayload, ListenerTargetLike} from './listener'
import {tygerNowPrecise} from './tyger-now'

export type TygerEventReturn<T> = {
	/**
	 * High-precision timestamp.
	*/
	at: number
	payload: T
}

export function tygerEvent<
	Target extends ListenerTargetLike,
	Event extends string,
>(
	target: Target,
	event: Event,
) {
	return events({target, event}) as TygerEventReturn<ListenerPayload<Target, Event>> | undefined
}

type EventConfig = {
	target: ListenerTargetLike
	event: string
}

const events = dict('', (config: EventConfig, next?: TygerEventReturn<any>) => {
	listen(config)
	return next
})

const listen = dict('', (config: EventConfig) => {
	return new Listener(
		config.target,
		config.event,
		(...payload) => events(config, {
			at: tygerNowPrecise(),
			payload,
		}),
	)
})
