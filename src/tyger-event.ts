import {dict} from './dict'
import {Listener, ListenerPayload, ListenerTarget} from './listener'
import {promiseMake} from './promise'
import {toSync} from './to'
import {tygerNow} from './tyger-now'

export interface TygerEventReturn<T> {
	at: number
	payload: T
}

export let tygerEvent = <
	Target extends ListenerTarget,
	Event extends string,
>(target: Target, event: Event) => {
	return eventStore({target, event}) as TygerEventReturn<ListenerPayload<Target, Event>> | undefined
}

interface EventConfig {
	target: ListenerTarget
	event: string
}

let eventStore = dict('eventStore', (config: EventConfig, next?: TygerEventReturn<any>) => {
	eventListen(config)
	return next
})

let eventListen = dict('eventListen', (config: EventConfig) => new Listener(
	config.target,
	config.event,
	(...payload) => eventStore(config, {
		at: tygerNow(),
		payload,
	}),
))

export let tygerEventNext = toSync((target: ListenerTarget, event: string) => {
	let promise = promiseMake<any>(() => listener.dispose())
	let listener = new Listener(target, event, (...payload) => {
		promise.resolve(payload)
		listener.dispose()
	})
	return promise
}, 'tygerEventNext') as <
	Target extends ListenerTarget,
	Event extends string,
>(target: Target, event: Event) => ListenerPayload<Target, Event>
