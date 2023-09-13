// TODO add more control sequences
// https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences

export interface AnsiControlInput {
	erase?: 'up' | 'down' | 'entire'
	cursorAbsolute?: [x: number, y?: number | null]
	cursorRelative?: [x: number, y?: number | null]
	cursorVisible?: boolean
}

const Esc = '\u001B['

export function ansiControl(input: AnsiControlInput) {
	let result = ''

	if (input.cursorAbsolute) {
		const [x, y] = input.cursorAbsolute

		if (y == null) result += Esc + (x + 1) + 'G'
		else result += Esc + (y + 1) + ';' + (x + 1) + 'H'
	}

	if (input.cursorRelative) {
		const [x, y] = input.cursorRelative

		if (x < 0) result += Esc + -x + 'D'
		if (x > 0) result += Esc + x + 'C'

		if (y && y < 0) result += Esc + -y + 'A'
		if (y && y > 0) result += Esc + y + 'B'
	}

	if (input.cursorVisible !== undefined) {
		result += Esc + '?25' + (input.cursorVisible ? 'h' : 'l')
	}

	if (input.erase === 'entire') result += Esc + '2J' + Esc + '3J'
	if (input.erase === 'up') result += Esc + '1J'
	if (input.erase === 'down') result += Esc + 'J'

	return result
}
