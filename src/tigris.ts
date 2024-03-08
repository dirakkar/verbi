import {compare} from './compare'
import {DisposeAble, dispose, disposeAble} from './dispose'
import {Fn, fnNoop} from './fn'
import {mapItem} from './map'
import {promiseLike} from './promise'

export const enum TigrisStatus {
	obsoletum = -1,
	incertum = -2,
	integrum = -3,
	mortuum = -4,
}

export type TigrisCella<F extends Fn> =
	| ReturnType<F>
	| Error
	| Promise<ReturnType<F> | Error>

// whether to disable `tigrisVoca` idempotency checks
let laxum = false
// whether `tigrisVelle` should just return corpus cella without refreshing it
let speculor = false

// corpora to be destroyed by `tigrisMete`
let moribunda = new Set as Set<TigrisCorpus> | null

const promises = new WeakSet<PromiseLike<any>>

// `tigrisPro` cache
const corporaGenera = new WeakMap<Fn, typeof TigrisCorpus>

/**
 * A corpus the formula of which is currently running.
 */
export let tigrisActivum: TigrisCorpus | undefined

/**
 * Maps objects to corpora that control their lifecycle.
 */
export const tigrisDomini = new WeakMap<DisposeAble, TigrisCorpus>

/**
 * Temporarily disables effectus voca idempotency checks. Use sparingly!
 */
export function tigrisRelaxa() {
	laxum ||= !!tigrisActivum
}

/**
 * Prevents corpus activum from being destroyed when it's no longer needed.
 */
export function tigrisServa() {
	if(tigrisActivum) tigrisActivum.mete = fnNoop
}

export function tigrisSpecula<Result>(fn: () => Result) {
	const s = speculor
	speculor = true
	try {
		return fn()
	} finally {
		speculor = s
	}
}

export function tigrisMete() {
	const m = moribunda
	if(!m) return
	moribunda = null
	for(const x of m) tigrisDele(x)
	;(moribunda = m).clear()
}

export class TigrisCorpus<F extends Fn = Fn> {
	static f: Fn

	c?: TigrisCella<F>
	/**
	 * Index of the first corpus superius affīne.
	 */
	s: number
	/**
	 * Index of the first corpus inferius affīne.
	 */
	i: number
	t: TigrisStatus | (number & {}) = TigrisStatus.obsoletum

	constructor(
		public h?: object,
		public d = [] as unknown[],
	) {
		this.s = this.i = this.d.length
	}

	f() {
		return (this.constructor as typeof TigrisCorpus).f
	}

	mete() {
		// `messe` is set to null when `tigrisMete` is running
		if(moribunda != null) moribunda.add(this)
		else tigrisDele(this)
	}

	dele() {
	}
}

export class TigrisEffectus<F extends Fn = Fn> extends TigrisCorpus<F> {
}

export function tigrisVelle<Result>(x: TigrisCorpus<() => Result>): Result {
	if(speculor) {
		return errLike(x.c) ? undefined : x.c as any
	}

	if(x.t >= 0) {
		throw new Error('Circular subscription detected')
	}

	const a = tigrisActivum
	link: if(a) {
		if(a.t < a.i) {
			const last = a.d[a.t] as TigrisCorpus | undefined

			if(last === x) {
				a.t += 2
				break link
			}

			if(last) {
				if(a.i < a.d.length) {
					move(a, a.i, a.d.length)
				}
				move(a, a.t, (a.i += 2) - 2)
			}
		} else {
			if(a.i < a.d.length) {
				move(a, a.s, a.d.length)
			}
			a.i += 2
		}

		a.d[a.t] = x
		a.d[a.t + 1] = x.d.push(a, a.t) - 2
		a.t += 2
	}

	tigrisIntegra(x)

	if(errLike(x.c)) throw x.c
	return x.c as any
}

export function tigrisIntegra(x: TigrisCorpus) {
	clarify: if(x.t === TigrisStatus.incertum) {
		for(let i = x.s; i < x.i; i += 2) {
			const superius = x.d[i] as TigrisCorpus
			if(superius) tigrisIntegra(superius)
			if(x.t !== -2) break clarify
		}
		x.t = -3
	}

	if(x.t <= TigrisStatus.integrum) return

	// remember activum and laxus states to return them to their previous
	// values after ending the routine
	const a = tigrisActivum
	const l = laxum

	// make the status field point to the index of the last publisher of this
	// corpus. it is used by the wiring algorithm implemented in `tigrisVelle`
	x.t = x.s
	tigrisActivum = x

	// value to write in corpus cella
	let next: any
	// remains undefined ifuser code yielded a non-promise value, set to
	// `null` ifuser code has returned a promise which is already handled, or
	// set to the returned promise if we need to handle it.
	let promise: Promise<any> & DisposeAble | null | undefined

	try {
		if(x.s === 0) next = x.f().call(x.h)
		if(x.s === 1) next = x.f().call(x.h, x.d[0])
		if(x.s > 1) next = x.f().apply(x.h, x.d.slice(0, x.s))

		if(next instanceof Promise) {
			const pone = (res: any) => {
				if(x.c === next) tigrisPone(x, res)
				return res
			}
			// if we're still storing that promise, put the value it has
			// settled with to the corpus state
			promise = next.then(pone, pone)
		}
	} catch (err) {
		if( ((next = err) instanceof Promise) ) {
			promise = promises.has(next) ? null : next.finally(() => {
				if(x.c === next) inveni(x)
			})
		}
	}

	// if user code yielded a promise which was not handled earlier, attempt to
	// copy disposers from the original promise to the wrapped one.
	// if the returned value is not a promise at all, do `seca`
	if(promise) {
		if(Symbol.dispose in next) promise[Symbol.dispose] = next[Symbol.dispose]
		if(Symbol.asyncDispose in next) promise[Symbol.asyncDispose] = next[Symbol.asyncDispose]
		promises.add((next = promise))
	} else if(promise !== null) seca(x)

	tigrisActivum = a
	laxum = l

	for(let i = x.s; i < x.t; i += 2) {
		tigrisIntegra(x.d[i] as TigrisCorpus)
	}

	x.t = -3

	tigrisPone(x, next)
}

export function tigrisPone<F extends Fn>(x: TigrisCorpus<F>, next: TigrisCella<F>) {
	const promise = promiseLike(next)
	const prev = x.c

	if(x instanceof TigrisEffectus) {
		// effectus don't attempt to own the set cella, but instead become integer
		// when waiting for a promise and are destroyed when completed
		x.c = next
		x.t = promise ? TigrisStatus.integrum : TigrisStatus.mortuum
		if(!promise && x.i === x.d.length) tigrisDele(x)
		else if(next !== prev) propaga(x)
	} else {
		if(!compare(prev, next)) {
			if(disposeAble(prev) && tigrisDomini.get(prev) === x) {
				dispose(prev)
			}

			if(disposeAble(next) && !tigrisDomini.has(next)) {
				tigrisDomini.set(next, x)
			}

			propaga(x)
		}

		// if neither this corpus nor any of corpora superiora are suspended,
		// destroy all effectus it created
		complete: if(!promise) {
			for(var end = x.t < 0 ? x.i : x.t, i = x.s; i < end; i += 2) {
				if( promiseLike( (x.d[i] as TigrisCorpus)?.c ) ) {
					break complete
				}
			}
			for(let i = x.s; i < end; i += 2) {
				if(x.d[i] instanceof TigrisEffectus) {
					tigrisDele(x.d[i] as TigrisCorpus)
				}
			}
		}
	}

	x.c = next
	x.t = -3

	return next
}

export function tigrisPro<Genus extends typeof TigrisCorpus>(genus: Genus, f: Fn) {
	return corporaGenera.get(f) ??
		mapItem(corporaGenera, f, class extends (genus as any) { static f = f }) as Genus
}

export function tigrisVoca(genus: typeof TigrisCorpus, args: any[], host?: object) {
	const a = tigrisActivum
	const s = a && a.t < a.i && (a.d[a.t] as TigrisCorpus)

	if(s) {
		if(
			s.h === host &&
			s.f === genus.f &&
			compare(s.d.slice(0, s.s), args)
		) {
			return s
		}

		if(!laxum && a instanceof TigrisEffectus) {
			throw new Error('Non-idempotency detected')
		}
	}

	return new genus(host, args)
}


export const TigrisVelleSemel = tigrisPro(TigrisEffectus, tigrisVelle)

export function tigrisPelle<Args extends any[]>(...args: [
	corpus: TigrisCorpus<(...args: Args) => any>,
	args: Args,
]) {
	return tigrisVelle(tigrisVoca(TigrisPelle, args))
}

const TigrisPelle = tigrisPro(TigrisEffectus, (x: TigrisCorpus, args: any[]) => {
	tigrisPone(x, x.f().apply(x.h, args))
})

export function tigrisDele(x: TigrisCorpus) {
	for(let i = x.d.length - 2; i >= x.i; i -= 2) {
		const inferius = x.d[i] as TigrisCorpus
		const idem = x.d[i + 1] as number

		inferius.d[idem] = inferius.d[idem + 1] = undefined

		x.d.length -= 2
	}

	x.t = x.s
	seca(x)

	x.t = -4 // 🕯️

	if(tigrisDomini.get(x.c) === x) {
		dispose(x.c)
	}

	x.dele()
}

/**
 * Propagate corpus updates to corpora inferiora obliqua.
 */
function propaga(x: TigrisCorpus, t = TigrisStatus.obsoletum) {
	for(let i = x.i; i < x.d.length; i += 2) {
		inveni(x.d[i] as TigrisCorpus, t)
	}
}

/**
 * Update corpus status and propagate the change to corpora īnferiōra obliqua.
 */
function inveni(x: TigrisCorpus, t = TigrisStatus.obsoletum) {
	if(x.t === TigrisStatus.mortuum || x.t >= t) return
	x.t = t
	propaga(x, TigrisStatus.incertum)
}

/**
 * Copies a corpus affine at position `a` to `b`
 */
function move(x: TigrisCorpus, a: number, b: number) {
	const affine = x.d[a] as TigrisCorpus
	const idem = x.d[a + 1] as number

	x.d[b] = affine
	x.d[b + 1] = idem

	affine.d[idem + 1] = b
}

/**
 * Called after a corpus has finished its execution, {@link seca} replaces
 * corpora superiora slots which could have remained unused with
 * corpora inferiora taken from the end of the list.
 */
function seca(x: TigrisCorpus) {
	let tail = 0

	for(let i = x.t; i < x.i; i += 2) {
		const superius = x.d[i] as TigrisCorpus

		if(superius) {
			const idem = x.d[i + 1] as number
			const end = superius.d.length - 2

			if(idem !== end) move(superius, end, idem)
			superius.d.length -= 2

			if(superius.d.length === superius.i) superius.mete()

			if(x.i < x.d.length) {
				move(x, x.d.length - 2, i)
				x.d.length -= 2
			} else tail++
		}
	}

	while(tail--) {
		x.d.length -= 2
	}

	x.i = x.t
}

function errLike(v: any) {
	return v instanceof Promise || v instanceof Error
}
