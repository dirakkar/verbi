import {mock} from 'node:test'
import assert from 'node:assert/strict'
import {Fn} from './fn'
import {TigrisCorpus, tigrisPone, tigrisVelle} from './tigris'

function corpus<F extends Fn>(name: string, f: F) {
	const corpus = new TigrisCorpus
	corpus.f = () => f
	;(corpus as any)[Symbol.toStringTag] = name
	return corpus
}

void function dependency_tracking() {
	const a = corpus('a', () => 0)
	const bFormula = mock.fn(() => tigrisVelle(a))
	const b = corpus('b', bFormula)

	assert.equal(a.t, -1)
	assert.equal(b.t, -1)

	tigrisVelle(b)

	assert.equal(a.t, -3)
	assert.equal(a.t, -3)

	assert.deepEqual(b.d, [a, 0])

	tigrisVelle(b)

	assert.equal(bFormula.mock.callCount(), 1)

	tigrisPone(a, 1)

	assert.equal(a.t, -3)
	assert.equal(b.t, -1)
}()

void function deep_propagation() {
	const a = corpus('a', () => 0)
	const b = corpus('b', () => tigrisVelle(a))
	const c = corpus('c', () => tigrisVelle(b))
	const d = corpus('d', () => tigrisVelle(c))

	tigrisVelle(d)
	tigrisPone(a, 1)
	assert.deepEqual([a.t, b.t, c.t, d.t], [-3, -1, -2, -2])

	tigrisVelle(b)
	assert.deepEqual([a.t, b.t, c.t, d.t], [-3, -3, -1, -2])

	tigrisVelle(d)
	assert.deepEqual([a.t, b.t, c.t, d.t], [-3, -3, -3, -3])
}()

void function dynamic_subscriptions() {
	const left = corpus('left', () => 'left')
	const right = corpus('right', () => 'right')
	const path = corpus('path', () => left)
	const result = corpus('result', () => tigrisVelle(tigrisVelle(path)))

	assert.equal(tigrisVelle(result), 'left')
	assert.deepEqual(result.d, [path, 0, left, 0])

	tigrisPone(path, right)
	assert.equal(tigrisVelle(result), 'right')
	assert.deepEqual(result.d, [path, 0, right, 0])
}()

void function circular_subscriptions() {
	const a = corpus('a', (): any => tigrisVelle(b))
	const b = corpus('b', () => tigrisVelle(c))
	const c = corpus('c', () => tigrisVelle(a))

	assert.throws(() => tigrisVelle(a), /Circular subscription detected/)
}()

void function mol_bench() {
	const fib = (n: number): number => {
		if (n < 2) return 1
		return fib(n - 1) + fib(n - 2)
	}

	const hard = (n: number, _log?: string) => {
		return n + fib(16)
	}

	const numbers = [0, 1, 2, 3, 4]

	const res = [] as number[]

	const a = corpus('a', () => 0)
	const b = corpus('b', () => 0)
	const c = corpus('c', () => (tigrisVelle(a) % 2) + (tigrisVelle(b) % 2))
	const d = corpus('d', () => numbers.map(i => ({x: i + (tigrisVelle(a) % 2) - (tigrisVelle(b) % 2)})))
	const e = corpus('e', () => hard(tigrisVelle(c) + tigrisVelle(a) + tigrisVelle(d)[0].x, 'e'))
	const f = corpus('f', () => hard(tigrisVelle(d)[2].x || tigrisVelle(b), 'f'))
	const g = corpus('g', () => tigrisVelle(c) + tigrisVelle(c) || tigrisVelle(e) % 2) + tigrisVelle(d)[4].x + tigrisVelle(f)
	const h = corpus('h', () => res.push(hard(tigrisVelle(g), 'h')))
	const i = corpus('i', () => res.push(tigrisVelle(g)))
	const j = corpus('j', () => res.push(hard(tigrisVelle(f), 'j')))

	const tick = () => {
		tigrisVelle(h)
		tigrisVelle(i)
		tigrisVelle(j)
	}
	tick()

	const idx = 10

	res.length = 0
	tigrisPone(b, 1)
	tigrisPone(a, 1 + idx * 2)
	tick()

	tigrisPone(a, 2 + idx * 2)
	tigrisPone(b, 2)
	tick()

	assert.equal(res, [3204, 1607, 3201, 1604])
}()
