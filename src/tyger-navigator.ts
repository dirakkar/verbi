import {tygerEvent} from './tyger-event'

export let tygerNavigatorLanguages = () => {
	tygerEvent(window, 'languagechange')
	return navigator.languages
}

export let tygerNavigatorOnline = () => {
	tygerEvent(window, 'online')
	tygerEvent(window, 'offline')
	return navigator.onLine
}
