import {tygerEvent} from './tyger-event'

export function tygerDocumentVisible() {
	tygerEvent(document, 'visibilitychange')
	return !document.hidden
}
