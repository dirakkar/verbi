import {Rec} from './rec'

/**
 * Parse `argv` to a dictionary of named parameters and an array of unnamed parameters.
 */
export let argvParse = (argv: string[], flags: string[] = []) => {
	let named: Rec<string[]> = {}
	let unnamed: string[] = []

	let collecting: string | null = null

	for (let arg of argv) {
		if (arg[0] === '-') {
			let isFull = arg[1] === '-'
			let isShorthandList = !isFull && arg.length > 2
			let isFlag = flags.includes(arg)

			if (isShorthandList) {
				for (let shorthand of arg.slice(1)) {
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
