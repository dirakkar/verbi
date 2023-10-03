import fs from 'node:fs'
import {Murmur} from './murmur'
import {ViterCacheLocal} from './viter-cache-local'
import {Base} from './base'
import {cell} from './cell'
import {toSync} from './to'
import {TygerFile} from './tyger-file'
import {valKey} from './val'

export interface ViterCacheStore {
	download(task: string, version: string, dir: string): boolean
	upload(task: string, version: string, dir: string): void
	drop(task: string): boolean
	purge(): void
}

export class ViterCache extends Base {
	@cell store(): ViterCacheStore {
		return ViterCacheLocal.make()
	}

	@cell inputFiles(next?: string[]) {
		return next ?? []
	}

	@cell inputKeys(next?: string[]) {
		return next ?? []
	}

	useFile(file: string | TygerFile) {
		if (file instanceof TygerFile) file = file.path
		this.inputFiles([...this.inputFiles(), file])
		return this
	}

	useKey(val: any) {
		const key = valKey(val)
		this.inputKeys([...this.inputKeys(), key])
		return this
	}

	task() {
		return 'unknown'
	}

	download(dir: string | TygerFile) {
		if (dir instanceof TygerFile) dir = dir.path
		return this.store().download(this.task(), this.version(), dir)
	}

	upload(dir: string | TygerFile) {
		if (dir instanceof TygerFile) dir = dir.path
		return this.store().upload(this.task(), this.version(), dir)
	}

	drop() {
		return this.store().drop(this.task())
	}

	@cell version() {
		const files = this.inputFiles()

		for (const file of files) {
			TygerFile.from(file).watch()
		}

		return toSync(this).versionHash()
	}

	async versionHash() {
		const murmur = new Murmur

		for (const key of this.inputKeys()) {
			murmur.add(Buffer.from(key))
		}

		for (const file of this.inputFiles()) {
			for await (const chunk of fs.createReadStream(file)) {
				murmur.add(chunk)
			}
		}

		return murmur.result().toString(36)
	}
}
