import {Rec} from './rec'

/**
 * Parse `argv` to a dictionary of named parameters and an array of unnamed parameters.
 */
export function argvParse(argv: string[], flags: string[] = []) {
	const named: Rec<string[]> = {}
	const unnamed: string[] = []

	let collecting: string | null = null

	for (const arg of argv) {
		if (arg[0] === '-') {
			const isFull = arg[1] === '-'
			const isShorthandList = !isFull && arg.length > 2
			const isFlag = flags.includes(arg)

			if (isShorthandList) {
				for (const shorthand of arg.slice(1)) {
					(named['-' + shorthand] ??= []).push('')
				}
			}

			if (isFull) {
				if (isFlag) {
					(named[arg] ??= []).push('')
				} else {
					collecting = arg
				}
			}
		} else if (collecting) {
			(named[collecting] ??= []).push(arg)
			collecting = null
		} else {
			unnamed.push(arg)
		}
	}

	return {named, unnamed}
}
