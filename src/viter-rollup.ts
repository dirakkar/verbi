import * as rollup from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import {Base} from './base'
import {cell} from './cell'
import {toSync} from './to'
import {TygerFile} from './tyger-file'
import {randomId} from './random'
import {Atom} from './atom'
import {Timer} from './timer'

type RollupLog = rollup.RollupLog
type RollupLogLevel = rollup.LogLevel

export class ViterRollup extends Base {
	plugins(): rollup.Plugin[] {
		return []
	}

	@cell logs(next?: ({level: RollupLogLevel, log: RollupLog})[]) {
		return next ?? []
	}

	log(level: RollupLogLevel, log: RollupLog) {
		this.logs([...this.logs(), {level, log}])
	}

	external(source: string, importer?: string) {
		return false
	}

	resolve(id: string, importer: string) {
		return null as rollup.ResolveIdResult
	}

	root() {
		return TygerFile.from('.')
	}

	entryImport() {
		return [] as string[]
	}

	entryExports() {
		return [] as string[]
	}

	output() {
		return TygerFile.from('.')
	}
	// TODO make it a virtual module when we get a manual invalidation API
	@cell entry() {
		const id = randomId()

		const entries = TygerFile.from('.viter/entries')
		entries.exists(true)

		return entries.join(id)
	}

	entryVirtual() {
		return true
	}

	@cell entrySync() {
		if (!this.entryVirtual()) return { dispose() { } }
		return new Timer(0, () => this.entry().text(this.entryText()), true)
	}

	@cell entryText() {
		return [
			...this.entryImport().map(spec => `import '${spec}'`),
			...this.entryExports().map(spec => `export * from '${spec}'`),
		].join('\n')
	}

	@cell buildConfig() {
		const resolvePlugin: rollup.Plugin = {
			name: 'ViterRollup/resolvePlugin',
			resolveId: (id, importer) => this.resolve(id, importer!),
		}

		return {
			input: this.entry().path,
			external: (source, importer) => this.external(source, importer),
			onLog: (level, log) => this.log(level, log),
			plugins: [
				resolvePlugin,
				nodeResolve(),
				typescript(),
				...this.plugins(),
			],
		} satisfies rollup.InputOptions
	}

	@cell build() {
		this.root().stat()

		const build = toSync(rollup).rollup(this.buildConfig())

		return Object.assign(build, { dispose() {
			return build.close()
		} })
	}

	writeConfig(output: TygerFile, plugins?: rollup.Plugin[]) {
		let location: rollup.OutputOptions
		if (output.type() === 'dir') location = {dir: output.path}
		else location = {file: output.path}

		return {
			...location,
			preserveModules: true,
			preserveModulesRoot: this.root().path,
			plugins,
		}
	}

	@cell write(output: TygerFile, plugins?: rollup.Plugin[]) {
		const build = this.build()
		const config = this.writeConfig(output, plugins)
		return toSync(build).write(config).output
	}

	@cell watch(output: TygerFile, plugins?: rollup.Plugin[]) {
		const watcher = rollup.watch({
			...this.buildConfig(),
			output: this.writeConfig(output, plugins),
			watch: {
				chokidar: {
					awaitWriteFinish: {
						stabilityThreshold: 100,
					},
				},
			},
		})

		this.entrySync()

		watcher.on('event', event => {
			this.watchEvent(event)
		})

		return Object.assign(watcher, { dispose() {
			return watcher.close()
		} })
	}

	@cell watchEvent(next?: rollup.RollupWatcherEvent) {
		return next
	}

	dispose() {
		Atom.peek(() => this.entry())?.exists(false)
	}
}
