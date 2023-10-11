import {tygerEvent} from './tyger-event'

export let tygerDocumentVisible = () => {
	tygerEvent(document, 'visibilitychange')
	return !document.hidden
}
