// TODO add more sequences
// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
// https://www.npmjs.com/package/ansi-escapes?activeTab=readme

import {AnsiEsc} from './ansi'

export namespace ansiControl {
	/**
	 * Set absolute cursor position.
	 */
	export function moveTo(x: number, y?: number | null) {
		if (y == null) return AnsiEsc + (x + 1) + 'G'
		return AnsiEsc + (y + 1) + ';' + (x + 1) + 'H'
	}

	/**
	 * Move cursor relatively.
	 */
	export function moveBy(x?: number | null, y?: number | null) {
		let result = ''

		if (x! < 0) result += AnsiEsc + -x! + 'D'
		if (x! > 0) result += AnsiEsc + x + 'C'

		if (y! < 0) result += AnsiEsc + -y! + 'A'
		if (y! > 0) result += AnsiEsc + y + 'B'

		return result
	}

	export const cursorHide = AnsiEsc + '?25l'

	export const cursorShow = AnsiEsc + '?25h'

	export const eraseScreen = AnsiEsc + '2J'

	/**
	 * Erase from the current cursor position up the specified amount of rows (defaults to 1).
	 */
	export function erase(count = 1) {
		if (count === 1) return AnsiEsc + '2K'

		let result = ''

		for (let i = 0; i < count; i++) {
			result += erase()
			if (i !== count - 1) result += cursorUp
		}

		if (count) result += cursorLeft

		return result
	}

	export const cursorLeft = AnsiEsc + 'G'

	export function cursorUp(count = 1) {
		return AnsiEsc + count + 'A'
	}

	export function cursorDown(count = 1) {
		return AnsiEsc + count + 'B'
	}
}
