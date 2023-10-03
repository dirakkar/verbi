import path from 'node:path'
import fs from 'node:fs'
import chokidar from 'chokidar'
import {Base} from './base'
import {dict} from './dict'
import {cell} from './cell'
import {decorator} from './decorator'
import {action} from './action'

export class TygerFileError extends Error {
	constructor(public path: string, cause?: any) {
		super(cause, {cause})
	}
}

const withFs = decorator('withFs', formula => function (this: TygerFile, ...args) {
	try {
		return formula.apply(this, args)
	} catch (err: any) {
		throw new TygerFileError(this.path, err)
	}
})

export type TygerFileType = 'file' | 'dir' | 'link'

export interface TygerFileStat {
	type: TygerFileType
	size: number | bigint
	atime: Date
	ctime: Date
	mtime: Date
}

function statFrom(path: string, native: fs.Stats | fs.BigIntStats): TygerFileStat {
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

export class TygerFile extends Base {
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

		const stat = fs.statSync(this.path, {throwIfNoEntry: false})
		if (!stat) return null
		return statFrom(this.path, stat)
	}

	/**
	 * Pull to check whether the path exists.
	 * Pushing `true` to a non-existent file creates a directory.
	 * Pushing `false` to an existing file removes it.
	 */
	@cell @withFs exists(next?: boolean) {
		const prev = !!this.stat()
		if (next === undefined) return prev
		if (next === prev) return prev

		if (next) {
			this.dir().exists(true)
			fs.mkdirSync(this.path)
		} else {
			fs.rmSync(this.path, {recursive: true})
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
			.on('all', (event, filepath) => {
				const file = TygerFile.from(filepath)

				file.stat(null)

				if (event === 'change') this.stat(null)
				else file.dir().stat(null)
			})
			.on('error', console.error)

		return { dispose() {
			watcher.close()
		} }
	}

	@cell @withFs text(next?: string, virtual?: 'virtual') {
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

		if (next === undefined) {
			return fs.readFileSync(this.path, 'utf-8')
		} else {
			fs.writeFileSync(this.path, next)
			return next
		}
	}

	@cell @withFs buffer(next?: Uint8Array, virtual?: 'virtual') {
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

		if (next === undefined) {
			return fs.readFileSync(this.path)
		} else {
			fs.writeFileSync(this.path, next)
			return next
		}
	}

	@withFs @action append(data: Uint8Array | string) {
		fs.appendFileSync(this.path, data)
	}

	@cell kids() {
		if (this.stat()?.type !== 'dir') return []
		return fs.readdirSync(this.path).map(kid => this.join(kid))
	}

	@withFs copy(to: string | TygerFile) {
		if (to instanceof TygerFile) to = to.path
		fs.cpSync(this.path, to)
		return TygerFile.from(to)
	}

	@withFs move(to: string | TygerFile) {
		if (to instanceof TygerFile) to = to.path
		fs.renameSync(this.path, to)
		return TygerFile.from(to)
	}

	/**
	 * Unlinks all nested files.
	 */
	@withFs purge() {
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
