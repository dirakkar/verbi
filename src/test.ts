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
	console.warn('Test report handler not connected')
	console.dir(report, {depth: Infinity})
}

export let testConnect = (next: typeof testHandler) => {
	testHandler = next
}
