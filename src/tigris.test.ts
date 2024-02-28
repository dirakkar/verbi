import {mock} from 'node:test'
import assert from 'node:assert/strict'
import {Fn} from './fn'
import {TigrisCorpus, tigrisPone, tigrisPro, tigrisVelle} from './tigris'

function corpus<F extends Fn>(name: string, f: F) {
	const genus = tigrisPro(TigrisCorpus, f)

	const corpus = new genus<F>
	Reflect.defineProperty(
		corpus,
		Symbol.toStringTag,
		{
			enumerable: false,
			value: `${name}`,
		},
	)
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

	console.log(a.d.map(String))
	console.log(b.d.map(String))

	assert.deepEqual(b.d, [a, 0])

	tigrisVelle(b)

	assert.equal(bFormula.mock.callCount(), 1)

	tigrisPone(a, 1)

	assert.equal(a.t, -3)
	assert.equal(b.t, -1)
}()
