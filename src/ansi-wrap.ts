// TODO remove external dependency

import wrapAnsi from 'wrap-ansi'

/**
 * Wrap an ANSI-formatted string.
 */
export function ansiWrap(string: string, columns: number) {
	return wrapAnsi(string, columns, {
		hard: true,
		trim: true,
		wordWrap: false,
	}).split('\n')
}
