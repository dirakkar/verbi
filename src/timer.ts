/**
 * A disposable wrapper around native timers.
 */
export class Timer {
	handle: any

	constructor(ms: number, task: () => void, public repeated = false) {
		this.handle = (repeated ? setInterval : setTimeout)(task, ms)
	}

	[Symbol.dispose]() {
		(this.repeated ? clearTimeout : clearInterval)(this.handle)
	}
}
