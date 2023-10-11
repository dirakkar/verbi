import {Model} from './model'
import {TygerFile} from './tyger-file'
import {ViterCacheStore} from './viter-cache'

export class ViterCacheLocal extends Model implements ViterCacheStore {
	root() {
		return TygerFile.from('.viter/cache')
	}

	entryFind(task: string) {
		return this.root().kids().find(kid => kid.name().startsWith(task))
	}

	upload(task: string, version: string, dir: string) {
		let existent = this.entryFind(task)
		let name = `${task}@${version}`

		if (existent?.name() === name) {
			return
		}

		existent?.exists(false)
		let next = this.root().join(name)
		next.exists(true)
		TygerFile.absolute(dir).copy(next)
	}

	download(task: string, version: string, dir: string) {
		let existent = this.entryFind(task)

		if (existent?.name() !== `${task}@${version}`) {
			existent?.exists(false)
			return false
		}

		existent.copy(dir)
		return true
	}

	drop(task: string) {
		let prev = this.entryFind(task)?.exists() ?? false
		this.entryFind(task)?.exists(false)
		return prev
	}

	purge() {
		this.root().purge()
	}
}
