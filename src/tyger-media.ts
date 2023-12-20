import {dict} from './dict'
import {tygerEvent} from './tyger-event'

export function tygerMedia(query: string) {
	let list = ml(query)
	tygerEvent(list, 'change')
	return list.matches
}

const ml = dict('', (query: string) => window.matchMedia(query))
