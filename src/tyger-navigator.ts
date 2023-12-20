import {tygerEvent} from './tyger-event'

export function tygerNavigatorLanguages() {
	tygerEvent(window, 'languagechange')
	return navigator.languages
}

export function tygerNavigatorOnline() {
	tygerEvent(window, 'online')
	tygerEvent(window, 'offline')
	return navigator.onLine
}
