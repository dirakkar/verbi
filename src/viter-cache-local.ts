import {Base} from './base'
import {TygerFile} from './tyger-file'
import {ViterCacheStore} from './viter-cache'

export class ViterCacheLocal extends Base implements ViterCacheStore {
	root() {
		return TygerFile.from('.viter/cache')
	}

	entryFind(task: string) {
		return this.root().kids().find(kid => kid.name().startsWith(task))
	}

	upload(task: string, version: string, dir: string) {
		const existent = this.entryFind(task)
		const name = `${task}@${version}`

		if (existent?.name() === name) {
			return
		}

		existent?.exists(false)
		const next = this.root().join(name)
		next.exists(true)
		TygerFile.absolute(dir).copy(next)
	}

	download(task: string, version: string, dir: string) {
		const existent = this.entryFind(task)

		if (existent?.name() !== `${task}@${version}`) {
			existent?.exists(false)
			return false
		}

		existent.copy(dir)
		return true
	}

	drop(task: string) {
		const prev = this.entryFind(task)?.exists() ?? false
		this.entryFind(task)?.exists(false)
		return prev
	}

	purge() {
		this.root().purge()
	}
}
