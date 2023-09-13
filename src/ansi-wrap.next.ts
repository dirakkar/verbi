// https://github.com/chalk/wrap-ansi/blob/main/index.js

const Escapes = ['\u001B', '\u009B']

const End = 39
const AnsiEscapeBell = '\u0007'
const AnsiCsi = '['
const AnsiOsc = ']'
const AnsiSgrTerminator = 'm'
const AnsiEscapeLink = `${AnsiOsc}8;;`

/**
 * Wrap an ANSI-formatted string.
 */
export function ansiWrap(string: string, columns: number) {
	return string
		.normalize()
		.replaceAll('\r\n', '\n')
		.split('\n')
		.flatMap(row => ansiWrapRow(row, columns))
}

function ansiWrapRow(row: string, columns: number) {}

function wrapCode(code: string) {
	return Escapes[0] + AnsiCsi + code + AnsiSgrTerminator
}

function wrapHyperlink(uri: string) {
	return Escapes[0] + AnsiEscapeLink + uri + AnsiEscapeBell
}
