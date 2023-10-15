import {compare} from './compare'
import {disposableIs} from './disposable'
import {fnIs} from './fn'
import {noop} from './noop'
import {promiseLike} from './promise'
import {rethrow} from './rethrow'

let handled = new WeakSet
let reaping = new Set
let unstable = false
let peek = false

export class Atom {
	static owning = new WeakMap
	static linking

	static unstable() {
		if (Atom.linking) unstable = true
	}

	static keep() {
		if (Atom.linking) Atom.linking.reap = noop
	}

	static peek(fn) {
		let prev = peek
		peek = true
		try {
			return fn()
		} finally {
			peek = prev
		}
	}

	static reap() {
		while (reaping.size) {
			let prev = reaping
			reaping = new Set
			for (let atom of prev) atom.dispose()
		}
	}

	static task(host, fn, args) {
		let sub = Atom.linking
		let pub = sub && sub.t < sub.s && sub.d[sub.t]

		if (pub) {
			if (
				pub.h === host &&
				pub.f === fn &&
				compare(pub.d.slice(0, pub.p), args)
			) return pub

			if (
				!unstable &&
				sub instanceof AtomTask
			) throw new Error('Non-idempotency detected')
		}

		return new AtomTask(
			Atom.id(host, fn, '...'),
			fn,
			host,
			args
		)
	}

	static id(host, fn, key = '') {
		return ((host && !fnIs(host) ? (host[Symbol.toStringTag] ?? (host.letructor.name + '()') + '.') : '') + fn.name + '(' + key + ')')
	}

	static pull(x) {
		let sub = Atom.linking

		if (peek) return (promiseLike(x.c) || x.c instanceof Error)
			? undefined
			: x.c

		if (x.t >= 0) throw new Error('Circular subscription detected')

		link: if (sub) {
			if (sub.t < sub.s) {
				let last = sub.d[sub.t]

				if (last === x) {
					sub.t += 2
					break link
				}

				if (last) {
					if (sub.s < sub.d.length) {
						Atom.cp(sub, sub.s, sub.d.length)
					}

					Atom.cp(sub, sub.t, sub.s)
					sub.s += 2
				}
			} else {
				if (sub.s < sub.d.length) {
					Atom.cp(sub, sub.s, sub.d.length)
				}

				sub.s += 2
			}

			sub.d[sub.t] = x
			sub.d[sub.t + 1] = x.d.push(sub, sub.t) - 2
			sub.t += 2
		}

		Atom.refresh(x)

		if (promiseLike(x.c) || x.c instanceof Error) rethrow(x.c)
		return x.c
	}

	static snapshot = Atom.pull

	static push(x, args) {
		let result = x.f.apply(x.h, args)
		Atom.set(x, result)
		return result
	}

	static refresh(x) {
		clarify: if (x.t === -2) {
			for (let i = x.p; i < x.s; i += 2) {
				let pub = (x.d[i])
				if (pub) Atom.refresh(pub)

				if (x.t !== -2) break clarify
			}

			x.t = -3
		}

		if (x.t <= -3) return

		x.t = x.p
		let unstablePrev = unstable
		let linkingPrev = Atom.linking
		Atom.linking = x

		let result

		try {
			if (x.p === 0) result = x.f.call(x.h)
			if (x.p === 1) result = x.f.call(x.h, x.d[0])
			if (x.p > 1) result = x.f.apply(x.h, x.d.slice(0, x.p))

			if (promiseLike(result)) {
				let set = res => {
					if (x.c === result) Atom.set(x, res)
					return res
				}

				result = Object.assign(
					result.then(set, set),
					{dispose: result.dispose ?? noop},
				)
				handled.add(result)
			}
		} catch (cause) {
			result = promiseLike(cause) || cause instanceof Error
				? cause
				: new Error(cause, {cause})

			if (promiseLike(result) && !handled.has(result)) {
				result = Object.assign(
					result.finally(() => {
						if (x.c === result) Atom.absorb(x)
					}),
					{dispose: result.dispose ?? noop},
				)
				handled.add(result)
			}
		}

		if (!promiseLike(result)) Atom.cut(x)

		Atom.linking = linkingPrev
		unstable = unstablePrev
		for (let i = x.p; i < x.t; i += 2) {
			Atom.refresh(x.d[i])
		}
		x.t = -3

		Atom.set(x, result)
	}

	static set(x, next) {
		let prev = x.c

		if (x instanceof AtomTask) {
			x.c = next

			if (promiseLike(next)) {
				x.t = -3
				if (next !== prev) Atom.mark(x)
			} else {
				x.t = -4
				if (x.s === x.d.length) x.dispose()
				else if (next !== prev) Atom.mark(x)
			}
		} else {
			if (!compare(prev, next)) {
				if (disposableIs(prev) && Atom.owning.get(prev) === x) prev.dispose()

				if (disposableIs(next) && !Atom.owning.has(next)) {
					Atom.owning.set(next, x)
					try {
						next[Symbol.toStringTag] = x.i
					} catch {
						Object.defineProperty(next, Symbol.toStringTag, {value: x.i})
					}
				}

				if (x.s !== x.d.length) Atom.mark(x)
			}

			x.c = next
			x.t = -3

			if (!promiseLike(next)) {
				let to = x.t < 0 ? x.s : x.t

				for (let i = x.p; i < to; i += 2) {
					if (promiseLike(x.d[i]?.c)) return
				}

				for (let i = x.p; i < to; i += 2) {
					if (x.d[i] instanceof AtomTask) x.d[i].dispose()
				}
			}
		}
	}

	static cut(x) {
		let tail = 0

		for (let i = x.t; i < x.s; i += 2) {
			let pub = x.d[i]

			if (pub) {
				let pos = x.d[i + 1]
				let end = pub.d.length - 2

				if (pos !== end) Atom.cp(pub, end, pos)
				pub.d.pop()
				pub.d.pop()

				if (pub.d.length === pub.s) pub.reap()

				if (x.s < x.d.length) {
					Atom.cp(x, x.d.length - 2, i)
					x.d.pop()
					x.d.pop()
				} else tail++
			}
		}

		while (tail--) {
			x.d.pop()
			x.d.pop()
		}

		x.s = x.t
	}

	static mark(x) {
		for (let i = x.s; i < x.d.length; i += 2) {
			Atom.absorb(x.d[i])
		}
	}

	static absorb(x, t = -1) {
		if (x.t >= t) return

		x.t = t

		for (let i = x.s; i < x.d.length; i += 2) {
			Atom.absorb(x.d[i], -2)
		}
	}

	static cp(x, from, to) {
		let peer = x.d[from]
		let self = x.d[from + 1]

		x.d[to] = peer
		x.d[to + 1] = self

		peer.d[self + 1] = to
	}

	c
	t = -1

	constructor(i, f, h, args) {
		this.i = i
		this.f = f
		this.h = h
		this.d = args?.slice() ?? []
		this.p = this.s = this.d.length
	}

	reap() {
		reaping.add(this)
	}

	dispose() {
		for (let i = this.d.length - 2; i >= this.s; i -= 2) {
			let sub = this.d[i]
			let self = this.d[i + 1]

			sub.d[self] = sub.d[self + 1] = undefined

			this.d.pop()
			this.d.pop()
		}

		this.t = this.p
		Atom.cut(this)

		this.t = -4 // 🕯️

		if (
			!(this instanceof AtomTask) &&
			Atom.owning.get(this.c) === this
		) this.c.dispose()
	}

	toString() {
		return this.i
	}
}

export class AtomTask extends Atom {
}
