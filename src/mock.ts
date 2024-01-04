import {Fn, fnName} from './fn'

export type MockedFn<F extends Fn> = F & {
	calls: MockCall<F>[]
	arg<Index extends Extract<keyof Parameters<F>, number>>(index: Index): Parameters<F>[Index]
}

export interface MockCall<F extends Fn> {
	i: Parameters<F>
	o: ReturnType<F>
}

/**
 * Wrap a function to intercept and store each calls inputs and outputs in the `calls` property
 */
export function mock(): MockedFn<() => void>
export function mock<F extends Fn>(f: F): MockedFn<F>
export function mock<F extends Fn>(f?: F): MockedFn<F | (() => void)> {
	function mocked(this: ThisParameterType<F>, ...i: Parameters<F>) {
		try {
			if (!f) return undefined
			var o: any = f.apply(this, i)
			return o as ReturnType<F>
		} catch (err) {
			o = err
			throw err
		} finally {
			mocked.calls.push({i, o})
		}
	}

	fnName(mocked, f ? f.name + '_mock' : 'mock')

	mocked.calls = [] as MockCall<F>[]

	/**
	 * Returns an argument at specified index from the latest call's input list
	 */
	mocked.arg = (index: number) => mocked.calls.at(-1)!.i[index]

	return mocked
}
