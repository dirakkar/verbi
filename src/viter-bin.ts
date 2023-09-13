import {ansiApply} from './ansi'
import {cell} from './cell'
import {errorStack} from './error'
import {promiseLike} from './promise'
import {Rec} from './rec'
import {toAsync} from './to'
import {ViterCommand} from './viter-command'
import {ViterPack} from './viter-pack'
import {ViterViewNode, viterView} from './viter-view'
import {ViterViewRender as ViterViewRenderer} from './viter-view-renderer'

const commands: Rec<() => ViterCommand> = {
	help: () => {
		throw 'та пішов ти нахуй'
	},

	pack: () => ViterPack.create({
		project: process.cwd(),
		publish: false,
	}),
}

const commandName = process.argv[2] || 'help'
const command = commands[commandName]?.()

const viewNode = cell('viewNode', (next?: () => ViterViewNode) => {
	return next ?? (() => null)
})

if (!command) {
	viewNode(() => errorNode(`Unknown command "${commandName}"`))
} else {
	viewNode(() => {
		try {
			return command.view()
		} catch (error) {
			if (promiseLike(error)) return null
			return errorNode(error)
		}
	})

	toAsync(command).run()
		.catch(error => {
			viewNode(() => errorNode(error))
		})
}

const renderer = ViterViewRenderer.make({
	node: () => viewNode()(),
})

renderer.writeLoop()

function errorNode(error: any) {
	if (error instanceof Error) {
		error =
			String(error) +
			'\n' +
			ansiApply(errorStack(error, '  ')!, {modifiers: ['faint']})
	}
	error = String(error)

	return viterView.section({
		title: '[critical error](red)',
		content: error,
	})
}
