import {dict} from './dict'
import {tygerEvent} from './tyger-event'

export function tygerMedia(query: string) {
	const list = ml(query)
	tygerEvent(list, 'change')
	return list.matches
}

const ml = dict('ml', (query: string) => window.matchMedia(query))
