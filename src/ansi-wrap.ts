// TODO remove external dependency

import wrapAnsi from 'wrap-ansi'

/**
 * Wrap an ANSI-formatted string.
 */
export function ansiWrap(string: string, columns: number) {
	return wrapAnsi(string, columns, {
		hard: true,
		trim: false,
		wordWrap: false,
	}).split('\n')
}
