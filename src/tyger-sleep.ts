import {promiseMake} from './promise'
import {toSync} from './to'

export let tygerSleep = toSync((ms: number) => {
	let promise = promiseMake()
	let handle = setTimeout(promise.resolve, ms)
	return Object.assign(promise, { dispose() {
		clearTimeout(handle)
	} })
}, 'sleep')
