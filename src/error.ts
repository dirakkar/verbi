let caught = new WeakSet<any>

type ErrorHandleResult = [display: string | null, rethrow: Error]

/**
 * Returns a tuple of type `[display, rethrow]` where `display` is serialized representation of an error and `rethrow` is what you should rethrow (identical to passed value unless it's not an Error object).
 * It uses a global WeakSet of handled errors, so `display` is set to null if passed error was already handled.
 */
export function errorHandle(error: unknown): ErrorHandleResult {
	if (caught.has(error)) {
		return [null, error as Error]
	}

	if (error instanceof Error === false) {
		// wrap it with Error so outer scopes won't display the same thing
		const str = String(error)
		const rethrow = new Error(str, {cause: error})
		caught.add(rethrow)
		return [str, rethrow]
	}

	caught.add(error)
	return [errorFormat(error), error as Error]
}

export function errorFormat(error: unknown) {
	let result = String(error)

	const stack = errorStack(error, '  ')
	if (stack) {
		result += '\n' + stack
	}

	return result
}

const ErrorStackLineIgnore = ['node:internal']

const homedir = process.env.HOME

export function errorStack(error: any, prefix = '') {
	if (!(error instanceof Error)) {
		return null
	}

	return error.stack!
		.split('\n')
		.slice(1)
		.filter(line => {
			return !ErrorStackLineIgnore.some(substr => line.includes(substr))
		})
		.map(line => {
			line = prefix + line
			line = line.replace('file://', '')
			if (homedir) line = line.replace(homedir, '~')
			return line
		})
		.join('\n')
}
