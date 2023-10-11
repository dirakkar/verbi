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
	let module = await import(message.url)
	let constructor = module[message.constructor]
	let instance = constructor.create(message.input)
	let method = message.method

	try {
		var result = await toAsync(instance)[method](...message.args)
	} catch (err) {
		result = err
	}

	worker_threads.parentPort!.postMessage(result)
})

export let viterWorkerUrl = import.meta.url
