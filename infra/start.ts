import events from 'node:events'
import readline from 'node:readline/promises'
import {DevActions} from './dev'
import {ansi} from '../src/ansi'
import {report} from './report'

export async function start() {
	writeUsage()
	await writePrompt()

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	for await (const line of events.on(rl, 'line')) {
		const str = (line as string).trim()
		const [actionName, ...args] = str.split(/\s+/g)

		if (actionName in DevActions) {
			const action = DevActions[actionName]!
			try {
				await action.run(args)
			} catch (error) {
				report('fail', error)
			}
		} else if (str) {
			report('unknown action', actionName)
		}

		await writePrompt()
	}
}

async function writePrompt() {
	await write('> ')
}

function writeUsage() {
	console.log(ansi.bold('USAGE INFO\n'))
	for (const [shortcut, action] of Object.entries(DevActions)) {
		console.log(ansi.bold(`${shortcut} ${action!.args}`).trim() + ansi.dim(' - ') + action!.description)
	}
	console.log('')
}

function write(data: string) {
	return new Promise<void>((resolve, reject) => {
		return process.stdout.write(data, err => {
			if (err) reject(err)
			else resolve()
		})
	})
}
