export interface AnsiFormat {
	background?: AnsiColor
	foreground?: AnsiColor
	modifiers: AnsiModifier[]
}

export const ansiColors = [
	'black',
	'red',
	'green',
	'yellow',
	'blue',
	'magenta',
	'cyan',
	'white',
] as const
export type AnsiColor = typeof ansiColors[number]

export const ansiModifiers = [
	'bold',
	'faint',
	'italic',
	'underline',
	null,
	null,
	'negative',
	null,
	'strikethrough',
] as const
export type AnsiModifier = Exclude<typeof ansiModifiers[number], null>

export function ansiApply(string: string, format: AnsiFormat) {
	if (format.foreground) {
		const i = ansiColors.indexOf(format.foreground)
		string = escape(30 + i, string)
	}

	if (format.background) {
		const i = ansiColors.indexOf(format.background)
		string = escape(40 + i, string)
	}

	for (const modifier of format.modifiers) {
		const i = ansiModifiers.indexOf(modifier)
		string = escape(1 + i, string)
	}

	return string
}

function escape(code: number, string: string) {
	return '\x1b[' + code + 'm' + string + '\x1b[0m'
}
