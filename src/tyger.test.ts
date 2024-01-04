import {suite} from './suite'
import {action} from './action'
import {arrayMake} from './array'
import {assert} from './assert'
import {tyger, tygerPeek, tygerReap, tygerUnstable} from './tyger'
import {mock} from './mock'
import {toSync, toAsync} from './to'
import {Fn, fnName, fnNoop} from './fn'

function atom<F extends Fn>(name: string, formula: F) {
	const Atom = tyger.Atom.for(fnName(formula, name))
	return new Atom()
}

suite('atom', {
	dependency_tracking() {
		const a = atom('a', () => 0)
		const bFormula = mock(() => tyger.pull(a))
		const b = atom('b', bFormula)

		assert.is(a.t, -1)
		assert.is(b.t, -1)

		tyger.pull(b)

		assert.is(a.t, -3)
		assert.is(b.t, -3)

		assert.like(b.d, [a, 0])
		assert.like(a.d, [b, 0])

		tyger.pull(b)

		assert.is(bFormula.calls.length, 1)

		tyger.set(a, 1)

		assert.is(a.t, -3)
		assert.is(b.t, -1)
	},

	deep_propagation() {
		const a = atom('a', () => 0)
		const b = atom('b', () => tyger.pull(a))
		const c = atom('c', () => tyger.pull(b))
		const d = atom('d', () => tyger.pull(c))

		tyger.pull(d)
		tyger.set(a, 1)
		assert.like(
			[a.t, b.t, c.t, d.t],
			[-3, -1, -2, -2]
		)

		tyger.pull(b)

		assert.like(
			[a.t, b.t, c.t, d.t],
			[-3, -3, -1, -2]
		)

		tyger.pull(d)

		assert.like(
			[a.t, b.t, c.t, d.t],
			[-3, -3, -3, -3]
		)
	},

	dynamic_subscriptions() {
		const a = atom('a', () => true)
		const b = atom('b', () => false)
		const path = atom('path', () => 'a' as 'a' | 'b')
		const result = atom('result', () => tyger.pull(path) === 'a' ? tyger.pull(a) : tyger.pull(b))

		assert.like(tyger.pull(result), true)
		assert.like(result.d, [path, 0, a, 0])

		tyger.set(path, 'b')

		assert.like(tyger.pull(result), false)
		assert.like(result.d, [path, 0, b, 0])
	},

	circular_subscriptions() {
		const a = atom('a', (): any => tyger.pull(b))
		const b = atom('b', () => tyger.pull(c))
		const c = atom('c', () => tyger.pull(a))

		assert.throws(() => tyger.pull(a), /Circular subscription detected/)
	},

	reducer_atom() {
		const history = atom('history', (next?: number): number[] => {
			const prev = tygerPeek(() => tyger.pull(history)) ?? []
			if (next === undefined) return prev
			return [...prev, next]
		})

		assert.like(tyger.pull(history), [])

		tyger.push(history, [1])
		assert.like(tyger.pull(history), [1])
		tyger.push(history, [1])
		assert.like(tyger.pull(history), [1, 1])
		tyger.push(history, [2])
		assert.like(tyger.pull(history), [1, 1, 2])
	},

	mol_bench() {
		const fib = (n: number): number => {
			if (n < 2) return 1
			return fib(n - 1) + fib(n - 2)
		}

		const hard = (n: number, _log?: string) => {
			return n + fib(16)
		}

		const numbers = arrayMake(5, i => i)

		const res: number[] = []

		const a = atom('a', () => 0)
		const b = atom('b', () => 0)
		const c = atom('c', () => (tyger.pull(a) % 2) + (tyger.pull(b) % 2))
		const d = atom('d', () => numbers.map(i => ({x: i + (tyger.pull(a) % 2) - (tyger.pull(b) % 2)})))
		const e = atom('e', () => hard(tyger.pull(c) + tyger.pull(a) + tyger.pull(d)[0].x, 'e'))
		const f = atom('f', () => hard(tyger.pull(d)[2].x || tyger.pull(b), 'f'))
		const g = atom('g', () => tyger.pull(c) + (tyger.pull(c) || tyger.pull(e) % 2) + tyger.pull(d)[4].x + tyger.pull(f))

		const h = atom('h', () => res.push(hard(tyger.pull(g), 'h')))
		const i = atom('i', () => res.push(tyger.pull(g)))
		const j = atom('j', () => res.push(hard(tyger.pull(f), 'j')))

		const tick = () => {
			tyger.pull(h)
			tyger.pull(i)
			tyger.pull(j)
		}
		tick()

		const idx = 10

		res.length = 0
		tyger.set(b, 1)
		tyger.set(a, 1 + idx * 2)
		tick()

		tyger.set(a, 2 + idx * 2)
		tyger.set(b, 2)
		tick()

		assert.like(res, [3204, 1607, 3201, 1604])
	},

	async async() {
		const num = toSync(async (n: number) => n)

		const sum = action('sum', (a: number, b: number) => {
			return num(a) + num(b)
		})

		assert.throws(() => sum(1, 2), Promise)

		assert.is(await toAsync(sum)(1, 2), 3)

		const multiply = action('mult', (number: number, by: number) => {
			let result = 0
			while (by--) {
				result = sum(result, number)
			}
			return result
		})

		assert.is(await toAsync(multiply)(5, 3), 15)

	},

	async idempotency_checks() {
		let i = 0

		const effect = toSync(async (i: number) => {}, 'effect')

		const stable = action('stable', () => {
			effect(i++)
			effect(i++)
			effect(i++)
		})

		await assert.throws(toAsync(stable), /Non-idempotency detected/)

		// TODO better case
		const unstable = action('unstable', () => {
			if (i > 10) {
				throw new RangeError(`We're out of memory. You should not have done this.`)
			}

			tygerUnstable()
			effect(i++)
			effect(i++)
			effect(i++)
		})

		await assert.throws(toAsync(unstable), RangeError)
	},

	reaping() {
		const stateDisposer = mock()
		const state = atom('state', () => ({[Symbol.dispose]: stateDisposer}))

		const enabled = atom('enabled', () => true)

		const root = atom('root', () => {
			if (tyger.pull(enabled)) tyger.pull(state)
		})

		tyger.pull(root)
		assert.isInstance(state.c, Object)

		tyger.set(enabled, false)
		tyger.pull(root)
		// still pending
		assert.is(stateDisposer.calls.length, 0)

		tygerReap()
		assert.is(stateDisposer.calls.length, 1)
	},
})
