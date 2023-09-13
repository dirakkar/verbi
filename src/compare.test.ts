import {assert} from './assert'
import {suite} from './suite'

suite('compare', {
	primitives() {
		assert.like(true, true)
		assert.like(null, null)
		assert.notLike(10, 10n as any)
		assert.like(NaN, NaN)
	},

	structures() {
		assert.like({}, {})
		assert.notLike({x: 1}, {x: 2})
		assert.notLike({x: undefined}, {})
		assert.like(Object.create(null), Object.create(null))
		assert.like({x: {y: {z: true}}}, {x: {y: {z: true}}})
		assert.notLike({x: {y: {z: true}}}, {x: {y: {z: false}}})

		const key = Symbol()
		assert.like({[key]: true}, {[key]: true})
		assert.notLike({[Symbol()]: true}, {[Symbol()]: true})
	},

	arrays() {
		assert.like([], [])
		assert.like([1, [2]], [1, [2]])
		assert.notLike([1, 2, ], [1, 2, undefined])
	},

	class_instances() {
		class Model extends Object {}
		assert.notLike(new Model, new Model)

		class Serializable extends Object {
			constructor(public id: number) {
				super()
			}

			[Symbol.toPrimitive]() {
				return this.id
			}
		}

		assert.like(new Serializable(1), new Serializable(1))
		assert.notLike(new Serializable(1), new Serializable(2))
	},

	recursive_structures() {
		const a = {x: {y: null as any}}
		a.x.y = a

		const b = {x: {y: null as any}}
		b.x.y = b

		assert.like(a, b)
	},

	dates() {
		assert.like(new Date(1), new Date(1))
		assert.notLike(new Date(1), new Date(2))
	},

	maps() {
		assert.like(new Map, new Map)
		assert.like(
			new Map().set(0, 0),
			new Map().set(0, 0)
		)
		assert.notLike(
			new Map().set(0, 0),
			new Map().set(1, 0)
		)
		assert.notLike(
			new Map().set(0, 0),
			new Map().set(0, 1)
		)
		assert.notLike(
			new Map,
			new Map().set(0, undefined)
		)
	},

	sets() {
		assert.like(new Set, new Set)
		assert.like(new Set([0]), new Set([0]))
		assert.notLike(new Set([0]), new Set)
		assert.notLike(new Set([0]), new Set([1]))
		assert.notLike(new Set, new Set([undefined]))
	},
})
