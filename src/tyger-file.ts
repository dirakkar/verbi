import path from 'node:path'
import fs from 'node:fs'
import chokidar from 'chokidar'
import {Model} from './model'
import {dict} from './dict'
import {cell} from './cell'
import {action} from './action'

export type TygerFileContent = Uint8Array | string

export type TygerFileType = 'file' | 'dir' | 'link'

export interface TygerFileStat {
	type: TygerFileType
	size: number | bigint
	atime: Date
	ctime: Date
	mtime: Date
}

export class TygerFile extends Model {
	static from(filepath: string) {
		return TygerFile.absolute(path.resolve(filepath))
	}

	@dict static absolute(filepath: string) {
		return new TygerFile(filepath)
	}

	constructor(public path: string) {
		super()
	}

	dir() {
		return this.join('..')
	}

	join(...paths: string[]) {
		return TygerFile.absolute(path.join(this.path, ...paths))
	}

	basename() {
		return path.basename(this.path)
	}

	extname() {
		return path.extname(this.path)
	}

	/**
	 * Basename without extension.
	 */
	name() {
		return this.basename().slice(0, -this.extname().length)
	}

	/**
	 * Metadata of the file. Push null to revalidate. Returns null if the file does not exist.
	 */
	@cell stat(next?: TygerFileStat | null) {
		this.dir().watch()

		if (next) return next!

		try {
			var stat = fs.statSync(this.path, {throwIfNoEntry: false})
		} catch (cause) {
			throw new TygerFileError(this.path, cause)
		}

		if (!stat) return null
		return tygerFileStatFrom(this.path, stat)
	}

	/**
	 * Pull to check whether the path exists.
	 * Pushing `true` to a non-existent file creates a directory.
	 * Pushing `false` to an existing file removes it.
	 */
	@cell exists(next?: boolean) {
		const prev = !!this.stat()
		if (next === undefined) return prev
		if (next === prev) return prev

		try {
			if (next) {
				this.dir().exists(true)
				fs.mkdirSync(this.path)
			} else {
				fs.rmSync(this.path, {recursive: true})
			}
		} catch (cause) {
			throw new TygerFileError(this.path, cause)
		}

		this.stat(null)

		return next
	}

	type() {
		return this.stat()?.type
	}

	@cell watch() {
		const watcher = chokidar.watch(this.path, {
			persistent: true,
			depth: 0,
			ignoreInitial: true,
			awaitWriteFinish: {
				stabilityThreshold: 100,
			},
		})
		watcher.on('all', (event, p) => {
			const file = TygerFile.from(p)

			file.stat(null)

			if (event === 'change') this.stat(null)
			else file.dir().stat(null)
		})
		watcher.on('error', console.error)

		return { [Symbol.dispose]() {
			watcher.close()
		} }
	}

	@cell text(next?: string, virtual?: 'virtual') {
		return this.content('utf8', next, virtual)
	}

	@cell buffer(next?: Uint8Array, virtual?: 'virtual') {
		return this.content('binary', next, virtual)
	}

	private content(encoding: 'binary', next?: Uint8Array, virtual?: 'virtual'): Uint8Array
	private content(encoding: 'utf8', next?: string, virtual?: 'virtual'): string
	private content(encoding: 'binary' | 'utf8', next?: TygerFileContent, virtual?: 'virtual'): string | Uint8Array {
		if (virtual) {
			const now = new Date
			this.stat({
				type: 'file',
				size: 0,
				ctime: now,
				mtime: now,
				atime: now,
			})
			return next!
		}

		try {
			if (next === undefined) {
				return fs.readFileSync(this.path, encoding)
			} else {
				fs.writeFileSync(this.path, next)
				return next
			}
		} catch (cause) {
			throw new TygerFileError(this.path, cause)
		}
	}

	@action append(data: Uint8Array | string) {
		try {
			fs.appendFileSync(this.path, data)
		} catch (cause) {
			throw new TygerFileError(this.path, cause)
		}
	}

	@cell kids() {
		if (this.stat()?.type !== 'dir') return []
		try {
			return fs.readdirSync(this.path).map(kid => this.join(kid))
		} catch (cause) {
			throw new TygerFileError(this.path, cause)
		}
	}

	copy(to: string | TygerFile) {
		if (to instanceof TygerFile) to = to.path

		try {
			fs.cpSync(this.path, to)
		} catch (cause) {
			throw new TygerFileError(this.path, cause)
		}

		return TygerFile.from(to)
	}

	move(to: string | TygerFile) {
		if (to instanceof TygerFile) to = to.path

		try {
			fs.renameSync(this.path, to)
		} catch (cause) {
			throw new TygerFileError(this.path, cause)
		}

		return TygerFile.from(to)
	}

	/**
	 * Unlinks all nested files.
	 */
	purge() {
		for (const kid of this.kids()) {
			kid.exists(false)
		}
	}

	find(include?: RegExp, exclude?: RegExp) {
		const result: TygerFile[] = []

		for (const kid of this.kids()) {
			if (exclude?.test(kid.path)) continue
			if (!include || include.test(kid.path)) result.push(kid)
			if (kid.type() === 'dir') result.push(...kid.find(include, exclude))
		}

		return result
	}
}

function tygerFileStatFrom(path: string, native: fs.Stats | fs.BigIntStats): TygerFileStat {
	let type: TygerFileType | undefined

	if (native.isFile()) type = 'file'
	if (native.isDirectory()) type = 'dir'
	if (native.isSymbolicLink()) type = 'link'

	if (!type) throw new TygerFileError(path, 'Unsupported file type')

	return {
		type,
		size: native.size,
		atime: native.atime,
		mtime: native.mtime,
		ctime: native.ctime,
	}
}

export class TygerFileError extends Error {
	constructor(public path: string, cause?: any) {
		super(cause, {cause})
	}
}
