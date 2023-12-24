import {promiseMake} from './promise'
import {toSync} from './to'

export const tygerSleep = toSync((ms: number) => {
	const promise = promiseMake()
	const handle = setTimeout(promise.resolve, ms)
	return Object.assign(promise, { [Symbol.dispose]() {
		clearTimeout(handle)
	} })
}, 'tygerSleep')
