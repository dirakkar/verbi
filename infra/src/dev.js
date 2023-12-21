export const DevActions = {
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

async function test(args) {
	const modules = moduleNamesFrom(args)
	throw new Error('Not implemented')
}

async function measure(args) {
	const modules = moduleNamesFrom(args)
	throw new Error('Not implemented')
}

function moduleNamesFrom(args) {
	throw new Error('Not implemented')
}
