import {start} from './src/start.js'
import {release} from './src/release.js'
import { ansiTemplate } from './src/ansi-template.js'

const Commands = {
	start,
	release,
}

const [commandName, ...args] = process.argv.slice(2)

const command = Commands[commandName]
if (!command) {
	panic(`Unknown command "${commandName || ''}"`)
}

try {
	await command(...args)
} catch (error) {
	panic('stack' in error ? error.stack : String(error))
}

export function panic(text) {
	for (const line of text.split('\n')) {
		console.error(ansiTemplate(`[fatal:](bold) ${line}`))
	}
	process.exit(1)
}
