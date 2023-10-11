import {dict} from './dict'
import {tygerEvent} from './tyger-event'

export let tygerMedia = (query: string) => {
	let list = ml(query)
	tygerEvent(list, 'change')
	return list.matches
}

let ml = dict('ml', (query: string) => window.matchMedia(query))
