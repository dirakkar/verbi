import {errorStack} from './error'
import {Assertion} from './assert'
import {TestFailure, testHandler} from './test'
import {valSerialize} from './val'
import {arrayMapAsync} from './array'

export type SuiteTest = {
	id: string
	run: () => void | Promise<void>
}

export type SuiteTests = Record<string, () => void | Promise<void>>

let testQueue: SuiteTest[] = []
let skipped: string[] = []

let scheduled = false

export function suite(suiteName: string, tests: SuiteTests) {
	for (let key in tests) {
		testQueue.push({
			id: `${suiteName}/${key.replaceAll('_', '-')}`,
			run: tests[key],
		})
	}

	if (!scheduled) {
		scheduled = true
		queueMicrotask(runAll)
	}
}

suite.skip = (name: string, tests?: SuiteTests) => {
	skipped.push(name)
}

let runAll = async () => {
	let failed: TestFailure[] = []

	await arrayMapAsync(testQueue, async test => {
		try {
			await test.run()
		} catch (err: any) {
			let failure: TestFailure = {
				id: test.id,
				message: err.message ?? String(err),
				location: errorStack(err),
				expected: null,
				got: null,
			}

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
	})

	testHandler({
		total: testQueue.length,
		skipped,
		failed,
	})
}
