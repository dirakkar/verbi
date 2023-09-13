import {toSync} from './to'

export const importSync = toSync((spec: string, options?: ImportCallOptions) => {
	return import(spec, options)
}, 'importSync')
