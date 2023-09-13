import {action} from './action'
import {Base} from './base'
import {toSync} from './to'

export const tygerFetch = toSync(function tygerFetch(
	info: RequestInfo,
	init: RequestInit = {},
	fetch = globalThis.fetch
) {
	const ctrl = new AbortController
	let abortable = true

	return Object.assign(
		fetch(info, {...init, signal: ctrl.signal})
			.then(resp => new TygerFetchResponse(resp))
			.finally(() => {
				abortable = false
			}),

		{ dispose() {
			if (abortable) {
				ctrl.abort()
				abortable = false
			}
		} },
	)
})

export class TygerFetchError extends Error {
	status!: number
}

export type TygerFetchResponseStatus = typeof TygerFetchResponseStatus[number]
export const TygerFetchResponseStatus = [
	'Unknown',
	'Informational',
	'Successful',
	'Redirection',
	'ClientError',
	'ServerError',
] as const

export class TygerFetchResponse extends Base {
	constructor(public native: Response) {
		super()
	}

	status(): TygerFetchResponseStatus {
		return TygerFetchResponseStatus[Math.floor(this.native.status / 100)] || 'Unknown'
	}

	statusText() {
		return this.native.statusText || `HTTP Error ${this.statusCode()}`
	}

	statusCode() {
		return this.native.status
	}

	/**
	 * Asserts that the response is successful.
	 */
	success() {
		if (this.status() !== 'Successful') {
			const err = new TygerFetchError(this.statusText())
			err.status = this.statusCode()
			throw err
		}
		return this
	}

	/**
	 * Return body as a readable stream.
	 */
	stream() {
		return this.success().native.body
	}

	/**
	 * Parse body as JSON.
	 */
	@action json() {
		return toSync(this.success().native).json() as unknown
	}

	/**
	 * Parse body as a UTF-8 encoded string.
	 */
	@action text() {
		return toSync(this.success().native).text()
	}

	/**
	 * Parse body as an array buffer.
	 */
	@action buffer() {
		return toSync(this.success().native).arrayBuffer()
	}

	/**
	 * Response headers.
	 */
	headers() {
		return this.native.headers
	}

	/**
	 * `Content-Type` header of the response.
	 */
	type() {
		return this.native.headers.get('content-type')
	}
}
