import {ErrorInput} from '../src/error-input'
import {Rec} from '../src/rec'
import {workspaceModules} from './workspace'

export interface DevAction {
	args: string
	description: string
	run(args: string[]): Promise<void>
}

export const DevActions: Rec<DevAction> = {
	t: {
		args: '[space-separated modules]',
		description: 'run tests for modules',
		run: test,
	},
	m: {
		args: '[space-separated modules]',
		description: 'measure module bundle sizes',
		run: measure,
	},
}

async function test(args: string[]) {
	const modules = moduleNamesFrom(args)
	throw new Error('Not implemented')
}

async function measure(args: string[]) {
	const modules = moduleNamesFrom(args)
	throw new Error('Not implemented')
}

function moduleNamesFrom(args: string[]) {
	const modules = ErrorInput.throws(() => workspaceModules())

	if (args.length === 0) {
		return modules
	}

	const result = [] as string[]
	for (const arg of args) {
		if (modules.includes(arg)) {
			result.push(arg)
			continue
		}

		const matching = modules.filter(m => m.startsWith(arg))
		if (matching.length === 0) {
			throw new ErrorInput(`Unknown module "${arg}"`)
		}
		if (matching.length > 1) {
			const variantsStr = matching.map(m => `"${m}"`).join(', ')
			throw new ErrorInput(`Ambiguous shorcut "${arg}": ${variantsStr}`)
		}
		result.push(matching[0])
	}

	return result
}
