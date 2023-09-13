import {Disposable} from './disposable'

/**
 * A disposable wrapper around native timers.
 */
export class Timer implements Disposable {
	handle: any

	constructor(ms: number, task: () => void, public repeated = false) {
		this.handle = (repeated ? setInterval : setTimeout)(task, ms)
	}

	dispose() {
		(this.repeated ? clearTimeout : clearInterval)(this.handle)
	}
}
