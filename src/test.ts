export interface TestReport {
	total: number
	skipped: string[]
	failed: TestFailure[]
}

export interface TestFailure {
	id: string
	message: string | null
	expected: string | null
	got: string | null
	location: string | null
}

export let testHandler = (report: TestReport): void => {
	throw new Error('Test report handler not connected')
}

export function testConnect(next: typeof testHandler) {
	testHandler = next
}

testConnect(report => console.dir(report, {depth: Infinity}))