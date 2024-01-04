import {dict} from './dict'

export function tygerInterval(ms: number) {
	return intervals(ms).time
}

export const intervals = dict('', (ms: number, hit?: true) => {
	const handle = setTimeout(() => intervals(ms, true), ms)

	return {
		time: Date.now(),
		[Symbol.dispose]: () => clearTimeout(handle),
	}
})
