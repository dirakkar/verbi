import {ansi} from './ansi'
import {cell} from './cell'
import {errorStack} from './error'
import {promiseLike} from './promise'
import {Rec} from './rec'
import {toAsync} from './to'
import {ViterCommand} from './viter-command'
import {ViterViewNode, viterView} from './viter-view'
import {ViterViewRenderer} from './viter-view-renderer'

const viewNode = cell('viewNode', (next?: () => ViterViewNode) => {
	return next ?? (() => null)
})

const renderer = ViterViewRenderer.make({
	node: () => viewNode()(),
})

const rendererLoop = renderer.writeLoop()

const commands: Rec<() => ViterCommand> = {
	// TODO
}

const commandName = process.argv[2] || 'help'
const command = commands[commandName]?.()

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

	toAsync(command)
		.run()
		.catch(error => {
			viewNode(() => errorNode(error))
		})
		.finally(() => {
			setTimeout(() => rendererLoop.dispose(), 1000)
		})
}

function errorNode(error: any) {
	if (error instanceof Error) {
		error = String(error) + '\n' + ansi.dim(errorStack(error, '  ')!)
	}
	error = String(error)

	return viterView.section({
		title: '[critical error](red)',
		content: error,
	})
}
