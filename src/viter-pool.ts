import worker_threads, {Worker} from 'node:worker_threads'
import os from 'node:os'
import {Model} from './model'
import {cell} from './cell'
import {dict} from './dict'
import {fnIs} from './fn'
import {rethrow} from './rethrow'
import {toSync} from './to'
import {tygerEventWait} from './tyger-event'
import {arrayMake} from './array'
import {ViterWorkerCall, viterWorkerUrl} from './viter-worker'
import {action} from './action'

type ViterPoolInput<T> = T extends ViterPool<infer Id> ? Id : never

export abstract class ViterPool<Input = void> extends Model {
	@dict static create<T extends ViterPool<any>>(
		this: new (input: ViterPoolInput<T>) => T,
		id: ViterPoolInput<T>
	) {
		return new this(id)
	}

	abstract url(): string

	mirror = worker_threads.isMainThread
		? new Proxy(this, {
				get: (_, key: string) => {
					let val = (this as any)[key]
					if (!fnIs(val)) return val
					return (...args: any) => this.call(key, args)
				},
		  })
		: this

	queue = [] as ((worker: Worker) => void)[]

	constructor(public input: Input) {
		super()
	}

	@action call(method: string, args: any[]) {
		let worker = this.poolCapture()

		toSync(worker).postMessage({
			url: this.url(),
			constructor: this.constructor.name,
			input: this.input,
			method,
			args,
		} satisfies ViterWorkerCall)

		let result = tygerEventWait(worker, 'message')[0]

		this.poolRelease(worker)

		if (result instanceof Error) rethrow(result)
		return result
	}

	@cell workerIds() {
		let max = os.availableParallelism()
		return arrayMake(max, i => i)
	}

	@dict worker(i: number) {
		return new Worker(new URL(viterWorkerUrl))
	}

	@dict workerTaken(i: number, next?: boolean) {
		return next ?? false
	}

	poolCapture() {
		let free = this.workerIds().find(id => !this.workerTaken(id))
		if (free === undefined) return toSync(this).poolSchedule()
		this.workerTaken(free, true)
		return this.worker(free)
	}

	poolSchedule() {
		return new Promise<Worker>(resolve => {
			this.queue.push(resolve)
		})
	}

	poolRelease(worker: Worker) {
		let id = this.workerIds().find(id => this.worker(id) === worker)
		if (id == null || !this.workerTaken(id)) {
			throw new Error('Attempted to release a worker that is not captured')
		}
		this.workerTaken(id, false)

		let queuing = this.queue.shift()
		if (queuing) queuing(worker)
	}
}
