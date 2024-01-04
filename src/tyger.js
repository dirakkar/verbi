// the heart of the Tyger reactive runtime!

import {compare} from './compare'
import {disposeAble, dispose} from './dispose'
import {fnNoop} from './fn'
import {promiseLike} from './promise'
import {rethrow} from './rethrow'
import {tygerMetaSubs} from './tyger-meta'

let unstable = false
let reap = new Set
let peek = false

/**
 * Promises that "fresh" routine has already handled
 */
const promises = new WeakSet
let pullTask
let pushTask

const owners = new WeakMap

export function tygerUnstable() {
	// only enable unstable mode if there's an active subscriber indicating
	// that we are currently in the `fresh` routine which will reset `unstable`
	// to the previous value when finished
	unstable = !!tyger.sub
}

export function tygerKeep() {
	// patch the active subscriber's "reap" method with noop to prevent it from
	// adding itself to the "reap" list when it becomes unused
	if (tyger.sub) tyger.sub.reap = fnNoop
}

export function tygerReap() {
	const prev = reap
	reap = null
	for (const atom of prev) kill(atom)
	;(reap = prev).clear()
}

export function tygerPeek(fn) {
	let peek_ = peek
	peek = true
	try {
		return fn()
	} finally {
		peek = peek_
	}
}

class Atom {
	static f = fnNoop

	static for(f) {
		return class extends this {
			static f = f
		}
	}

	c
	t = -1

	constructor(h, args) {
		this.h = h
		this.d = args?.slice() ?? []
		this.p = this.s = this.d.length
	}

	absorb() {
	}

	reap() {
		// add itself to the reap list or commit suicide if we're currently
		// in the "reap" routine (the list is unavailable in it)
		reap?.add(this) || kill(this)
	}

	die() {
	}

	toString() {
		return this.constructor.f.name
	}
}

class Task extends Atom {
	static get(args, host) {
		const {sub} = tyger
		const pub = sub && sub.t < sub.s && sub.d[sub.t]

		if (pub) {
			if (
				pub.h === host &&
				pub.constructor.f === this.f &&
				compare(pub.d.slice(0, pub.p), args)
			) {
				return pub
			}

			if (!unstable && sub instanceof Task) {
				throw new Error('Non-idempotency detected')
			}
		}

		return new this(host, args)
	}
}

export const tyger = {
	Atom,
	Task,
	sub: null,
	owners,
	pull,
	once(...args) {
		return pull(tyger.sub instanceof Task ? (pullTask ??= Task.for(pull)).get(args) : args[0])
	},
	fresh,
	set,
	push(...args) {
		pull((pushTask ??= Task.for(push)).get(args))
	},
	kill,
}


function pull(atom) {
	// if we're currently inside of the "peek" routine, just return the cached value
	if (peek) {
		return errLike(atom.c) ? void 0 : atom.c
	}

	// non-negative status of the atom we are trying to pull means that it is
	// already refreshing
	if (atom.t >= 0) {
		throw new Error('Circular subscription detected')
	}



	// this block is where atoms are wired
	// TODO explain it
	const {sub} = tyger
	link: if (sub) {
		if (sub.t < sub.s) {
			const last = sub.d[sub.t]

			if (last === atom) {
				sub.t += 2
				break link
			}

			if (last) {
				if (sub.s < sub.d.length) {
					cp(sub, sub.s, sub.d.length)
				}
				cp(sub, sub.t, (sub.s += 2) - 2)
			}
		} else {
			if (sub.s < sub.d.length) {
				cp(sub, sub.s, sub.d.length)
			}
			sub.s += 2
		}

		sub.d[sub.t] = atom
		sub.d[sub.t + 1] = atom.d.push(sub, sub.t) - 2
		sub.t += 2
	}

	fresh(atom)

	if (errLike(atom.c)) rethrow(atom.c)
	return atom.c
}

/**
 * Ensures that the state and upstream of the atom are fresh.
 */
function fresh(atom) {
	// -2 status means that some upstreams atoms are invalidated, but we need
	// to refresh direct publishers to figure out whether they're still in this
	// atom's upstream
	clarify: if (atom.t === -2) {
		for (let i = atom.p; i < atom.s; i += 2) {
			const pub = atom.d[i]
			if (pub) fresh(pub)
			if (atom.t !== -2) break clarify
		}
		atom.t = -3
	}

	// -3 status means that the atom is already fresh and -4 means "dead". don't touch the dead
	if (atom.t <= -3) return

	// remember "unstable" and "sub" states to return them to their previous
	// values after ending the refresh routine
	const unstable_ = unstable
	const {sub} = tyger

	// make the status field points to the index of the last publisher of this
	// atom. it is used by the wiring algorithm implemented in "pull"
	atom.t = atom.p
	// publishers will now connect to this atom when pulled
	tyger.sub = atom

	// now we are ready to refresh the atom...

	/**
	 * Value to put in the atom state.
	 */
	let next
	/**
	 * Remains undefined if user code has returned a non-promise value, set to
	 * null if user code has returned an already handled promise, or set to
	 * the returned promise we need to handle otherwise.
	 */
	let promise

	try {
		if (atom.p === 0) next = atom.constructor.f.call(atom.h)
		if (atom.p === 1) next = atom.constructor.f.call(atom.h, atom.d[0])
		if (atom.p > 1) next = atom.constructor.f.apply(atom.h, atom.d.slice(0, atom.p))

		if (promiseLike(next)) {
			const set_ = res => {
				if (atom.c === next) set(atom, res)
				return res
			}
			// if we're still storing that promise, put the value it has
			// settled with to the atom state
			promise = next.then(set_, set_)
		}
	} catch (err) {
		if (promiseLike(next = err)) {
			// once the returned promise is settled, invalidate the atom if
			// we're still interested in that promise's value
			promise = promises.has(next) ? null : next.finally(() => {
				if (atom.c === next) absorb(atom)
			})
		}
	}

	// if the promise is not handled, attempt to copy disposers from the
	// original promise to the wrapped one. if "next" is not a promise at all,
	// we have to call "cut" to clean the dependency list
	if (promise) {
		if (Symbol.dispose in next) promise[Symbol.dispose] = next[Symbol.dispose]
		if (Symbol.asyncDispose in next) promise[Symbol.asyncDispose] = next[Symbol.asyncDispose]
		promises.add(next = promise)
	} else if (promise !== null) cut(atom)

	tyger.sub = sub
	unstable = unstable_

	// now let's refresh every publisher we have subscribed to
	for (let i = atom.p; i < atom.t; i += 2) {
		fresh(atom.d[i])
	}

	// atom is fresh
	atom.t = -3

	set(atom, next)
}

function set(atom, next) {
	const promise = promiseLike(next)
	const prev = atom.c

	if (atom instanceof Task) {
		// tasks don't attempt to own the set state, but instead become actual
		// when waiting for a promise and die when completed
		atom.c = next
		atom.t = promise ? -3 : -4
		if (!promise && atom.s === atom.d.length) kill(atom)
		else if (next !== prev) emit(atom)
	} else {
		if (!compare(prev, next)) {
			if (owners.get(prev) === atom) dispose(prev)

			if (disposeAble(next) && !owners.has(next)) {
				owners.set(next, atom)
			}

			emit(atom)
		}

		// if neither this atom nor any of its publishers are suspended, kill
		// all the tasks it created
		complete: if (!promise) {
			for (var end = atom.t < 0 ? atom.s : atom.t, i = atom.p; i < end; i += 2) {
				if (promiseLike(atom.d[i]?.c)) break complete
			}
			for (let i = atom.p; i < end; i += 2) {
				if (atom.d[i] instanceof Task) kill(atom.d[i])
			}
		}
	}

	atom.c = next
	atom.t = -3
}

// a decorated version of this function is exported
function push(atom, args) {
	set(atom, atom.constructor.f.apply(atom.h, args))
}

function kill(atom) {
	for (let i = atom.d.length - 2; i >= atom.s; i -= 2) {
		const sub = atom.d[i]
		const self = atom.d[i + 1]

		sub.d[self] = sub.d[self + 1] = undefined

		atom.d.length -= 2
	}

	atom.t = atom.p
	cut(atom)

	atom.t = -4 // 🕯️

	// dispose the state if atom owns it
	if (owners.get(atom.c) === atom) {
		dispose(atom.c)
	}

	atom.die()
}

function emit(atom, t = -1) {
	for (let i = atom.s; i < atom.d.length; i += 2) {
		absorb(atom.d[i], t)
	}
}

function absorb(atom, t = -1) {
	if (atom.t === -4 || atom.t >= t) return

	atom.t = t
	atom.absorb()
	emit(atom, -2)
}

/**
 * Copies a peer of an atom at position `a` to `b`
 */
function cp(atom, a, b) {
	const peer = atom.d[a]
	const self = atom.d[a + 1]

	atom.d[b] = peer
	atom.d[b + 1] = self

	peer.d[self + 1] = b
}

/**
 * Unsubscribes from all publishers located after the value of an atom's `t`
 * and moves latest subscribers to the freed slots if possible.
 */
function cut(atom) {
	let tail = 0

	for (let i = atom.t; i < atom.s; i += 2) {
		let pub = atom.d[i]

		if (pub) {
			let pos = atom.d[i + 1]
			let end = pub.d.length - 2

			if (pos !== end) cp(pub, end, pos)
			pub.d.length -= 2

			if (pub.d.length === pub.s) pub.reap()

			if (atom.s < atom.d.length) {
				cp(atom, atom.d.length - 2, i)
				atom.d.length -= 2
			} else tail++
		}
	}

	while (tail--) atom.d.length -= 2

	atom.s = atom.t
}

function errLike(v) {
	return promiseLike(v) || v instanceof Error
}
