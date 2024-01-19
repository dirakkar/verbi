
export type CommitLevel = 'patch' | 'minor' | 'major'

export const CommitLevels = {
	patch: 0,
	minor: 1,
	major: 2,
} as const

export function commitLevelCompare(a: CommitLevel, b: CommitLevel) {
	const aw = CommitLevels[a]
	const bw = CommitLevels[b]
	return Math.sign(aw - bw) as -1 | 0 | 1
}

/**
 * Represents a structured commit message in the Verbi format. Use {@link commitMessageFromString} to parse and {@link commitMessageToString} to format.
 */
export class CommitMessage {
	constructor(
		readonly level: CommitLevel,
		readonly scope: string | null,
		readonly title: string,
		readonly body: string | null,
	) {
	}

	[Symbol.toPrimitive]() {
		return commitMessageToString(this)
	}
}

/**
 * @param string A trimmed string to parse.
 */
export function commitMessageFromString(string: string) {
	const newlines = string.indexOf('\n\n')
	if (newlines === -1 && string.includes('\n')) {
		throw new Error('Head and body of a commit message must be separated with two line feed characters')
	}

	const head = newlines > -1 ? string.slice(0, newlines) : string
	const body = newlines > -1 ? string.slice(newlines).trimStart() : null

	let level: CommitLevel | undefined
	for (const char of head) {
		let setLevel: CommitLevel | undefined
		if (char === '+') setLevel = 'minor'
		if (char === '-') setLevel = 'major'
		if (setLevel && level) throw new Error('Commit message may specify level only once')
		if (setLevel) level = setLevel
		else break
	}
	level ??= 'patch'

	const start = level !== 'patch' ? 1 : 0
	const colon = head.indexOf(':')
	const scope = colon > -1 ? head.slice(start, colon).trimStart() : null
	const title = colon > -1 ? head.slice(colon + 1).trimStart() : head.slice(start).trimStart()

	if (!title.length) throw new Error('Commit message title must be non-empty')

	return new CommitMessage(level, scope, title, body)
}


export function commitMessageToString(message: CommitMessage) {
	let result = ''

	if (message.level === 'minor') result += '+'
	if (message.level === 'major') result += '-'
	if (message.scope) result += message.scope + ': '
	result += message.title
	if (message.body) result += '\n\n' + message.body

	return result
}
