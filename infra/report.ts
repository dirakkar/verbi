import {ansi} from '../src/ansi'
import {ansiWrap} from '../src/ansi-wrap'
import {errorFormat} from '../src/error'

export function report(type: string, error: any) {
	const columnsAvailable = process.stdout.columns ?? Infinity
	const columnsContent = columnsAvailable - type.length - 2

	const typeStr = ansi.bold.red(type + ': ')

	const text = error instanceof Error ? errorFormat(error) : String(error)
	let i = 0
	for (let line of ansiWrap(text, columnsContent)) {
		if (i) line = ansi.gray(line)
		console.error(typeStr + line)
		i++
	}
}
