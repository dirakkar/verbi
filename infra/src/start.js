import events from 'node:events'
import {ansiTemplate} from './ansi-template.js'
import {DevActions} from './dev.js'
import {ansi} from './ansi.js'

export async function start() {
	writeUsage()

	writePrefix()
	for await (const chunk of events.on(process.stdin, 'data')) {
		const str = chunk.toString().trim()
		const [actionName, ...args] = str.split(/\s+/g)

		if (actionName in DevActions) {
			const action = DevActions[actionName]
			await action.run(args)
		} else if (str) {
			console.log(ansiTemplate(`[unknown action:](bold) ${actionName}`))
		}

		writePrefix()
	}
}

function writeUsage() {
	for (const [shortcut, action] of Object.entries(DevActions)) {
		console.log(ansi.bold(`${shortcut} ${action.args}`).trim() + ansi.dim(' - ') + action.description)
	}
}

async function writePrefix() {
	await write('> ')
}


function write(data) {
	return new Promise((resolve, reject) => {
		return process.stdout.write(data, (err) => {
			if (err) reject(err)
			else resolve()
		})
	})
}
