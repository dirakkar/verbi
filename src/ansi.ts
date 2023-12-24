import tty from 'node:tty'
import {Rec} from './rec'

export interface Ansi {
	(string: string, ...formats: AnsiFormatInput[]): string

	reset: Ansi
	bold: Ansi
	dim: Ansi
	italic: Ansi
	underline: Ansi
	overline: Ansi
	inverse: Ansi
	hidden: Ansi
	strikethrough: Ansi
	black: Ansi
	red: Ansi
	green: Ansi
	yellow: Ansi
	blue: Ansi
	magenta: Ansi
	cyan: Ansi
	white: Ansi
	gray: Ansi
	bgBlack: Ansi
	bgRed: Ansi
	bgGreen: Ansi
	bgYellow: Ansi
	bgBlue: Ansi
	bgMagenta: Ansi
	bgCyan: Ansi
	bgWhite: Ansi
	bgGray: Ansi
}


type AnsiFormatInput = AnsiFormat | null | undefined | false

export type AnsiFormat = keyof typeof AnsiFormats

export const AnsiFormats = {
	reset: [0, 0],
	bold: [1, 22],
	dim: [2, 22],
	italic: [3, 23],
	underline: [4, 24],
	overline: [53, 55],
	inverse: [7, 27],
	hidden: [8, 28],
	strikethrough: [9, 29],

	black: [30, 39],
	red: [31, 39],
	green: [32, 39],
	yellow: [33, 39],
	blue: [34, 39],
	magenta: [35, 39],
	cyan: [36, 39],
	white: [37, 39],
	gray: [90, 39],

	bgBlack: [40, 49],
	bgRed: [41, 49],
	bgGreen: [42, 49],
	bgYellow: [43, 49],
	bgBlue: [44, 49],
	bgMagenta: [45, 49],
	bgCyan: [46, 49],
	bgWhite: [47, 49],
	bgGray: [100, 49],
} as const satisfies Rec<[number, number]>

export function ansiFormatIs(v: string): v is AnsiFormat {
	return v in AnsiFormats
}

export const ansi = createAnsi([])

function createAnsi(formatsBase: AnsiFormat[]): Ansi {
	function apply(string: string, ...formats: AnsiFormatInput[]) {
		if (!hasColors) return string

		for (let format of (formatsBase as typeof formats).concat(formats)) {
			if (!format) continue
			const [open, close] = AnsiFormats[format]
			string = AnsiEsc + open + 'm' + string + AnsiEsc + close + 'm'
		}
		return string
	}

	return new Proxy(apply, { get(_, key) {
		if (key in AnsiFormats) return createAnsi(formatsBase.concat(key as AnsiFormat))
		return apply[key as never]
	} }) as Ansi
}

const AnsiEsc = '\u001B['

// TODO https://github.com/nodejs/node/pull/40240
const hasColors = tty.WriteStream.prototype.hasColors()
