import {dict} from './dict'
import {Listener, ListenerPayload, ListenerTarget} from './listener'
import {promiseMake} from './promise'
import {toSync} from './to'
import {tygerNow} from './tyger-now'

export type TygerEventReturn<T> = {
	at: number
	payload: T
}

export let tygerEvent = <
	Target extends ListenerTarget,
	Event extends string,
>(target: Target, event: Event) => {
	return eventStore({target, event}) as TygerEventReturn<ListenerPayload<Target, Event>> | undefined
}

type EventConfig = {
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

export let tygerEventWait = toSync((target: ListenerTarget, event: string) => {
	let promise = promiseMake<any>(() => listener.dispose())
	let listener = new Listener(target, event, (...payload) => {
		promise.resolve(payload)
		listener.dispose()
	})
	return promise
}, 'tygerEventWait') as <
	Target extends ListenerTarget,
	Event extends string,
>(target: Target, event: Event) => ListenerPayload<Target, Event>
