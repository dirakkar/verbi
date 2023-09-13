import {errorStack} from './error'
import {Assertion} from './assert'
import {TestFailure, testHandler} from './test'
import {valSerialize} from './val'

interface Case {
	id: string
	run: () => void
}

const queue: Case[] = []
const skipped: string[] = []

let scheduled = false

export type SuiteCases = Record<string, () => void | Promise<void>>

export function suite(suiteName: string, cases: SuiteCases) {
	for (const key in cases) {
		queue.push({
			id: `${suiteName}/${key.replaceAll('_', '-')}`,
			run: cases[key],
		})
	}

	if (!scheduled) {
		scheduled = true
		queueMicrotask(runAll)
	}
}

suite.skip = (name: string, tests?: SuiteCases) => {
	skipped.push(name)
}

async function runAll() {
	const failed: TestFailure[] = []

	await Promise.all(queue.map(async kase => {
		try {
			await kase.run()
		} catch (err: any) {
			const failure: TestFailure = {
				id: kase.id,
				message: err.message ?? String(err),
				location: errorStack(err),
				expected: null,
				got: null,
			}

			throw err

			if (err instanceof Assertion) {
				failure.location = failure.location!
					.split('\n')
					.slice(2)
					.join('\n')

				if ('expected' in err.config) {
					failure.expected = valSerialize(err.config.expected)
				}
				if ('got' in err.config) {
					failure.got = valSerialize(err.config.got)
				}
			}

			failed.push(failure)
		}
	}))

	testHandler({
		total: queue.length,
		skipped,
		failed,
	})
}