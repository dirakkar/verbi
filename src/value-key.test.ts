import assert from 'node:assert/strict'
import {valueKey} from './value-key'

void function simple_objects() {
	assert.equal(valueKey({}), valueKey({}))
	assert.equal(valueKey([{foo:'bar'}]), valueKey([{foo:'bar'}]))
	assert.notEqual(valueKey({count:0}), valueKey({count:1}))
}()

void function regexps() {
	assert.equal(valueKey([/foo/gm]), valueKey([/foo/gm]))
	assert.notEqual(valueKey(/foo/), valueKey(/bar/))
}()

void function class_instances() {
	class Some {}
	assert.notEqual(valueKey(new Some), valueKey(new Some))
	const instance = new Some
	assert.equal(valueKey(instance), valueKey(instance))
}()
