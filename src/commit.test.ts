import assert from 'node:assert/strict'
import {commitMessageFromString} from './commit'

void function parse_all_components() {
	const commit = commitMessageFromString('+ scope: title\n\nBody')
	assert.equal(commit.level, 'minor')
	assert.equal(commit.scope, 'scope')
	assert.equal(commit.title, 'title')
	assert.equal(commit.body, 'Body')
}()

void function parse_title_only() {
	const commit = commitMessageFromString('title')
	assert.equal(commit.level, 'patch')
	assert.equal(commit.scope, null)
	assert.equal(commit.title, 'title')
	assert.equal(commit.body, null)
}()

void function parse_title_only() {
	const commit = commitMessageFromString('title')
	assert.equal(commit.level, 'patch')
	assert.equal(commit.scope, null)
	assert.equal(commit.title, 'title')
	assert.equal(commit.body, null)
}()

void function parse_title_and_level() {
	const commit = commitMessageFromString('- garbage')
	assert.equal(commit.level, 'major')
	assert.equal(commit.scope, null)
	assert.equal(commit.title, 'garbage')
	assert.equal(commit.body, null)
}()

void function parse_invalid_level() {
	assert.throws(() => {
		commitMessageFromString('+- wtf???')
	})
}()

void function parse_invalid_body() {
	assert.throws(() => {
		commitMessageFromString('title\nbody')
	})
}()
