// TODO

import {Fn, fnIs} from './fn'

// …

export function tygerId(host: object, fn: Fn, key = '') {
	return ((host && !fnIs(host) ? (host[Symbol.toStringTag as never] ?? (host.constructor.name + '()') + '.') : '') + fn.name + '(' + key + ')')
}
