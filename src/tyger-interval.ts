import {dict} from './dict'

export let tygerInterval = dict('tygerInterval', (ms: number, _hit?: true) => {
	let handle = setTimeout(() => tygerInterval(ms, true), ms)

	return {
		now: Date.now(),
		dispose: () => clearTimeout(handle)
	}
})
