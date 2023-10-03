import worker_threads from 'node:worker_threads'
import {toAsync} from './to'

export interface ViterWorkerCall {
	url: string
	constructor: string
	input: unknown
	method: string
	args: any[]
}

worker_threads.parentPort?.on('message', async (message: ViterWorkerCall) => {
	const module = await import(message.url)
	const constructor = module[message.constructor]
	const instance = constructor.create(message.input)
	const method = message.method

	try {
		var result = await toAsync(instance)[method](...message.args)
	} catch (err) {
		result = err
	}

	worker_threads.parentPort!.postMessage(result)
})

export const viterWorkerUrl = import.meta.url
