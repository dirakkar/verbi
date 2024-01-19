import assert from 'node:assert/strict'
import {compare} from './compare'

void function primitives() {
	assert(compare(true, true))
	assert(compare(null, null))
	assert(!compare(10, 10n))
	assert(compare(NaN, NaN))
}()

void function structures() {
	assert(compare({}, {}))
	assert(!compare({x: 1}, {x: 2}))
	assert(!compare({x: undefined}, {}))
	assert(compare(Object.create(null), Object.create(null)))
	assert(compare({x: {y: {z: true}}}, {x: {y: {z: true}}}))
	assert(!compare({x: {y: {z: true}}}, {x: {y: {z: false}}}))
}()

void function arrays() {
	assert(compare([], []))
	assert(compare([1, [2]], [1, [2]]))
	assert(!compare([1, 2, ], [1, 2, undefined]))
}()

void function class_instances() {
	class Model extends Object {}
	assert(!compare(new Model, new Model))

	class Serializable extends Object {
		constructor(public id: number) {
			super()
		}

		[Symbol.toPrimitive]() {
			return this.id
		}
	}

	assert(compare(new Serializable(1), new Serializable(1)))
	assert(!compare(new Serializable(1), new Serializable(2)))
}()

void function recursive_structures() {
	let a = {x: {y: null as any}}
	a.x.y = a

	let b = {x: {y: null as any}}
	b.x.y = b

	assert(compare(a, b))
}()

void function dates() {
	assert(compare(new Date(1), new Date(1)))
	assert(!compare(new Date(1), new Date(2)))
}()

void function maps() {
	assert(compare(new Map, new Map))
	assert(compare(
		new Map().set(0, 0),
		new Map().set(0, 0),
	))
	assert(!compare(
		new Map().set(0, 0),
		new Map().set(1, 0),
	))
	assert(!compare(
		new Map().set(0, 0),
		new Map().set(0, 1),
	))
	assert(!compare(
		new Map,
		new Map().set(0, undefined),
	))
}()

void function sets() {
	assert(compare(new Set, new Set))
	assert(compare(new Set([0]), new Set([0])))
	assert(!compare(new Set([0]), new Set))
	assert(!compare(new Set([0]), new Set([1])))
	assert(!compare(new Set, new Set([undefined])))
}()
