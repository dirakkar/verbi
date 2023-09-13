import {arrayDedupe} from './array'
import {Base} from './base'
import {cell} from './cell'
import {dict} from './dict'
import {TygerFile} from './tyger-file'
import {importSync} from './import'
import {ViterCache} from './viter-cache'
import {ViterCacheLocal} from './viter-cache-local'
import {ViterConfig} from './viter-config'
import {ViterModule} from './viter-module'
import {ViterPackageManifest} from './viter-package-manifest'

export class ViterProject extends Base {
	@dict static from(root: TygerFile) {
		const fail = (constraint: string) => {
			throw new Error(`A project must ${constraint}`)
		}

		if (root.type() !== 'dir') fail('be a directory')
		if (root.join('src').type() !== 'dir') fail('have an "src" dir')
		if (root.join('viter.js').type() !== 'file') fail('have a "viter.js" file')
		if (root.join('package.json').type() !== 'file') fail('have a "package.json" file')

		return ViterProject.make({
			root: () => root,
		})
	}

	root() {
		return TygerFile.from('.')
	}

	src() {
		return this.root().join('src')
	}

	configFile() {
		return this.root().join('viter.js')
	}

	@cell config() {
		const path = this.configFile().path
		return importSync(path).default as ViterConfig
	}

	@cell manifest() {
		const text = this.root().join('package.json').text()
		return JSON.parse(text) as ViterPackageManifest
	}

	version() {
		return this.manifest().version ?? '0.0.0'
	}

	@cell moduleNames() {
		const kidNames = this.root().kids().map(kid => kid.name())
		return arrayDedupe(kidNames)
	}

	@dict module(name: string) {
		return ViterModule.make({
			project: () => this,
			name: () => name,
		})
	}

	@dict cache(task: string) {
		return ViterCache.make({
			task: () => task,
			store: () => this.cacheStore(),
		})
	}

	@cell cacheStore() {
		return this.config().cacheStore?.() ?? ViterCacheLocal.make()
	}
}
