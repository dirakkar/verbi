import {dict} from './dict'

export const tygerInterval = dict('tygerInterval', (ms: number, _hit?: true) => {
	const handle = setTimeout(() => tygerInterval(ms, true), ms)

	return {
		now: Date.now(),
		dispose: () => clearTimeout(handle)
	}
})
