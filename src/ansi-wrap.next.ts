// https://github.com/chalk/wrap-ansi/blob/main/index.js

let Escapes = ['\u001B', '\u009B']

let End = 39
let AnsiEscapeBell = '\u0007'
let AnsiCsi = '['
let AnsiOsc = ']'
let AnsiSgrTerminator = 'm'
let AnsiEscapeLink = `${AnsiOsc}8;;`

/**
 * Wrap an ANSI-formatted string.
 */
export let ansiWrap = (string: string, columns: number) => {
	return string
		.normalize()
		.replaceAll('\r\n', '\n')
		.split('\n')
		.flatMap(row => ansiWrapRow(row, columns))
}

let ansiWrapRow = (row: string, columns: number) => {}

let wrapCode = (code: string) => {
	return Escapes[0] + AnsiCsi + code + AnsiSgrTerminator
}

let wrapHyperlink = (uri: string) => {
	return Escapes[0] + AnsiEscapeLink + uri + AnsiEscapeBell
}
