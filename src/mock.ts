import {Formula, formulaName} from './formula'

export interface MockCall<F extends Formula> {
	i: Parameters<F>
	o: ReturnType<F>
}

/**
 * Wrap a function to intercept and store each calls inputs and outputs in the `calls` property
 */
export let mock = <F extends Formula>(f: F) => {
	function mocked(this: ThisParameterType<F>, ...i: Parameters<F>) {
		try {
			var o: any = f.apply(this, i)
			return o as ReturnType<F>
		} catch (err) {
			o = err
			throw err
		} finally {
			mocked.calls.push({i, o})
		}
	}

	formulaName(mocked, f.name + '_mock')

	mocked.calls = [] as MockCall<F>[]

	/**
	 * Returns argument at specified index from the latest call's input list
	 */
	mocked.arg =
		<Index extends Extract<keyof Parameters<F>, number>>
		(index: Index) => mocked.calls.at(-1)!.i[index]

	return mocked
}
