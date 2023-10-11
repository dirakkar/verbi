import {suite} from './suite'
import {action} from './action'
import {arrayMake} from './array'
import {assert} from './assert'
import {Atom} from './atom'
import {mock} from './mock'
import {toSync, toAsync} from './to'

suite('graph', {
	dependency_tracking() {
		let a = new Atom('a', () => 0)
		let b = new Atom('b', mock(() => Atom.pull(a)))

		assert.is(a.t, -1)
		assert.is(b.t, -1)

		Atom.pull(b)

		assert.is(a.t, -3)
		assert.is(b.t, -3)

		assert.like(b.d, [a, 0])
		assert.like(a.d, [b, 0])

		Atom.pull(b)

		assert.is(b.f.calls.length, 1)

		Atom.set(a, 1)

		assert.is(a.t, -3)
		assert.is(b.t, -1)
	},

	deep_propagation() {
		let a = new Atom('a', () => 0)
		let b = new Atom('b', () => Atom.pull(a))
		let c = new Atom('c', () => Atom.pull(b))
		let d = new Atom('d', () => Atom.pull(c))

		Atom.pull(d)
		Atom.set(a, 1)

		assert.like(
			[a.t, b.t, c.t, d.t],
			[-3, -1, -2, -2]
		)

		Atom.pull(b)

		assert.like(
			[a.t, b.t, c.t, d.t],
			[-3, -3, -1, -2]
		)

		Atom.pull(d)

		assert.like(
			[a.t, b.t, c.t, d.t],
			[-3, -3, -3, -3]
		)
	},

	dynamic_subscriptions() {
		let a = new Atom('a', () => true)
		let b = new Atom('b', () => false)
		let path = new Atom('path', () => 'a' as 'a' | 'b')
		let result = new Atom('result', () => Atom.pull(path) === 'a' ? Atom.pull(a) : Atom.pull(b))

		assert.like(Atom.pull(result), true)
		assert.like(result.d, [path, 0, a, 0])

		Atom.set(path, 'b')

		assert.like(Atom.pull(result), false)
		assert.like(result.d, [path, 0, b, 0])
	},

	circular_subscriptions() {
		let a = new Atom('a', (): any => Atom.pull(b))
		let b = new Atom('b', () => Atom.pull(c))
		let c = new Atom('c', () => Atom.pull(a))

		assert.throws(() => Atom.pull(a))
	},

	reducer_atom() {
		let history = new Atom('history', (next?: number): number[] => {
			let prev = Atom.peek(() => Atom.pull(history)) ?? []
			if (next === undefined) return prev
			return [...prev, next]
		})

		assert.like(Atom.pull(history), [])

		Atom.push(history, [1])
		assert.like(Atom.pull(history), [1])
		Atom.push(history, [1])
		assert.like(Atom.pull(history), [1, 1])
		Atom.push(history, [2])
		assert.like(Atom.pull(history), [1, 1, 2])
	},

	mol_bench() {
		let fib = (n: number): number => {
			if (n < 2) return 1
			return fib(n - 1) + fib(n - 2)
		}

		let hard = (n: number, _log?: string) => {
			return n + fib(16)
		}

		let numbers = arrayMake(5, i => i)

		let res: number[] = []

		let a = new Atom('a', () => 0)
		let b = new Atom('b', () => 0)
		let c = new Atom('c', () => (Atom.pull(a) % 2) + (Atom.pull(b) % 2))
		let d = new Atom('d', () => numbers.map(i => ({x: i + (Atom.pull(a) % 2) - (Atom.pull(b) % 2)})))
		let e = new Atom('e', () => hard(Atom.pull(c) + Atom.pull(a) + Atom.pull(d)[0].x, 'e'))
		let f = new Atom('f', () => hard(Atom.pull(d)[2].x || Atom.pull(b), 'f'))
		let g = new Atom('g', () => Atom.pull(c) + (Atom.pull(c) || Atom.pull(e) % 2) + Atom.pull(d)[4].x + Atom.pull(f))

		let h = new Atom('h', () => res.push(hard(Atom.pull(g), 'h')))
		let i = new Atom('i', () => res.push(Atom.pull(g)))
		let j = new Atom('j', () => res.push(hard(Atom.pull(f), 'j')))

		let tick = () => {
			Atom.pull(h)
			Atom.pull(i)
			Atom.pull(j)
		}
		tick()

		let idx = 10

		res.length = 0
		Atom.set(b, 1)
		Atom.set(a, 1 + idx * 2)
		tick()

		Atom.set(a, 2 + idx * 2)
		Atom.set(b, 2)
		tick()

		assert.like(res, [3204, 1607, 3201, 1604])
	},

	async idempotency_checks() {
		let i = 0

		let effect = toSync(async (i: number) => {}, 'effect')

		let stable = action('stable', () => {
			effect(i++)
			effect(i++)
			effect(i++)
		})

		await assert.throwsAsync(
			toAsync(stable),
			{valid: /Non-idempotency detected/}
		)

		// TODO better case
		let unstable = action('unstable', () => {
			if (i > 10) {
				throw new RangeError(`We're out of memory. You should not have done this.`)
			}

			Atom.unstable()
			effect(i++)
			effect(i++)
			effect(i++)
		})

		await assert.throwsAsync(
			toAsync(unstable),
			{valid: RangeError},
		)
	},
})
