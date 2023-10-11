import {toSync} from './to'

export let importSync = toSync((spec: string, options?: ImportCallOptions) => {
	return import(spec, options)
}, 'importSync')
