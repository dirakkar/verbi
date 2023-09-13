import zlib from 'node:zlib'
import events from 'node:events'
import terser from '@rollup/plugin-terser'
import {action} from './action'
import {cell} from './cell'
import {dict} from './dict'
import {Rec, recPick} from './rec'
import {TygerFile} from './tyger-file'
import {ViterCommand} from './viter-command'
import {ViterModule} from './viter-module'
import {ViterPackageManifest} from './viter-package-manifest'
import {ViterPool} from './viter-pool'
import {ViterProject} from './viter-project'
import {ViterRollup} from './viter-rollup'
import {toSync} from './to'
import {Atom} from './atom'
import {rethrowPromise} from './rethrow'
import {viterView} from './viter-view'

export class ViterPack extends ViterPool<{
	project: string
	publish: boolean
}> implements ViterCommand {
	url() {
		return import.meta.url
	}

	run() {
		const pkgs = this.packageNames()

		for (const pkg of pkgs) {
			this.packageBuilt(pkg)
		}
		for (const pkg of pkgs) {
			if (this.packageBuildError(pkg)) return
		}

		for (const pkg of pkgs) {
			// this.packageTested(pkg)
		}

		if (this.input.publish) {
			throw new Error('Publishing is not supported yet')
		}
	}

	view() {
		const buildStatus = () => {
			const all = this.packageNames()
			if (all.length === 0) {
				return 'no packages to build'
			}

			const plural = all.length > 1 ? 'packages' : 'package'

			const statuses = all.map(pkg => this.packageBuildStatus(pkg))
			if (statuses.some(status => status.type === 'pending')) {
				return `building ${all.length} ${plural}`
			}

			if (statuses.some(status => status.type === 'fail')) {
				return 'failed to build some packages'
			}

			return 'all done'
		}

		const packageNameStyle = (pkg: string) => ({
			pending: 'gray',
			success: 'green',
			fail: 'red',
		})[this.packageBuildStatus(pkg).type]

		const packageMinzippedSize = (pkg: string) => {
			const size = this.packageMinzipSize(pkg)
			if (size === -1) return null
			if (size >= 1000) return `minzipped size: ${(size / 1000).toFixed(1)}kb`
			return `minzipped size: ${size}b`
		}

		return viterView.pad([
			`[${buildStatus()}](bold)`,
			viterView.dict(
				this.packageNames().map(pkg => [
					`[${pkg}](${packageNameStyle(pkg)})`,
					viterView.vertical([
						this.packageBuildStatus(pkg).text,
						packageMinzippedSize(pkg),
						viterView.section({
							title: 'cache access error',
							content: this.packageCacheError(pkg) ?? null,
						}),
						viterView.section({
							title: 'build error',
							content: this.packageBuildError(pkg) ?? null,
						}),
					]),
				]),
			),
		])
	}

	project() {
		return ViterProject.from(TygerFile.from(this.input.project))
	}

	@cell packageNames() {
		const config = this.project().config()
		return Object.keys(config.packages ?? {})
	}

	@dict packageModules(pkg: string) {
		const namesAll = this.project().moduleNames()

		const namesExported = this.packageConfig(pkg).export.flatMap(exp => {
			if (exp.endsWith('-')) {
				const base = exp.slice(0, -1)
				return namesAll.filter(mod => mod.startsWith(base))
			}
			return exp
		})

		return namesExported.map(mod => this.project().module(mod))
	}

	packagePublishName(pkg: string) {
		return this.packageManifest(pkg).name
	}

	packageBin(pkg: string) {
		const path = this.packageConfig(pkg).bin
		return path ? TygerFile.from(path) : null
	}

	packageConfig(pkg: string) {
		return this.project().config().packages![pkg]!
	}

	@dict moduleOwner(mod: ViterModule) {
		const claimants = this.packageNames().filter(pkg => {
			return this.packageModules(pkg).includes(mod)
		})

		if (claimants.length === 0) return null
		if (claimants.length > 1) {
			throw new Error(`Several packages export the same module: ${claimants.join(', ')}`)
		}

		return claimants[0]
	}

	@cell moduleOwning() {
		return Object.fromEntries(this.packageNames().flatMap(pkg => {
			const modules = this.packageModules(pkg)
			return modules.map(mod => [mod.name, pkg])
		})) as Rec<string>
	}

	packageTarget(pkg: string) {
		return TygerFile.from('.viter/packages').join(pkg)
	}

	@cell packageDepsInternal(next?: string[]) {
		return next ?? []
	}

	@cell packageDepsExternal(next?: string[]) {
		return next ?? []
	}

	@cell packageManifest(pkg: string) {
		const project = this.project()
		const config = project.config()
		const manifest = project.manifest()
		const version = manifest.version!

		const dependencies: Rec<string> = {}
		for (const dep of this.packageDepsInternal()) {
			dependencies[dep] = version
		}
		for (const dep of this.packageDepsExternal()) {
			dependencies[dep] = manifest.dependencies![dep]
		}

		return {
			type: 'module',
			main: './dist/index.js',
			types: './src/index.ts',

			name: pkg,
			version,
			dependencies,

			...recPick(project.manifest(), [
				'version',
				'bugs',
				'repository',
				'homepage',
				'funding',
				'author',
				'contributors',
				'license',
				'licenses',
			]),

			...config.manifest?.(pkg),

			...config.packages![pkg]!.manifest,
		} satisfies ViterPackageManifest
	}

	@dict packageBuildStatus(pkg: string, status?: {
		type: 'pending' | 'success' | 'fail',
		text: string,
	}) {
		return status ?? {
			type: 'pending',
			text: 'unknown',
		}
	}

	@dict packageBuildError(pkg: string, next?: any) {
		return next ? String(next) : null
	}

	@dict packageCacheError(pkg: string, next?: any) {
		return next ? String(next) : null
	}

	@dict packageMinzipSize(pkg: string, next?: number) {
		return next ?? -1
	}

	@dict packageBuilt(pkg: string) {
		const project = this.project()
		const modules = this.packageModules(pkg)
		const target = this.packageTarget(pkg)
		const cache = project.cache(`packageBuild:${pkg}`)

		this.packageBuildStatus(pkg, {
			type: 'pending',
			text: 'resolving cache',
		})

		cache.useKey(modules)

		for (const mod of modules) {
			for (const file of [
				mod.ts(),
				mod.js(),
				mod.dts()
			]) {
				if (!file.exists()) continue
				cache.useFile(file)
			}
		}

		let cacheError: any

		let cached = false
		try {
			cached = cache.download(target.path)
		} catch (error) {
			rethrowPromise(error)
			cacheError = error
		}

		if (cached) {
			this.packageBuildStatus(pkg, {
				type: 'success',
				text: 'cached',
			})
		} else {
			this.packageBuildStatus(pkg, {
				type: 'pending',
				text: 'building',
			})

			try {
				this.packageBuildProcess(pkg)

				this.packageBuildStatus(pkg, {
					type: 'success',
					text: 'built',
				})

				if (!cacheError) {
					try {
						cache.upload(target)
					} catch (error) {
						rethrowPromise(error)
						cacheError = error
					}
				}
			} catch (err: any) {
				rethrowPromise(err)

				this.packageBuildStatus(pkg, {
					type: 'fail',
					text: 'build failed',
				})
				this.packageBuildError(pkg, err)
			}
		}

		if (cacheError) {
			this.packageCacheError(pkg, cacheError)
		}
	}

	packageBuildProcess(pkg: string) {
		try {
			this.mirror.packageWrite(pkg)
			const minzipSize = this.mirror.packageWriteMinzip(pkg)
			this.packageMinzipSize(pkg, minzipSize)
			if (this.packageBin(pkg)) {
				this.mirror.packageWriteBin(pkg)
			}
		} finally {
			this.mirror.packageBuildClose(pkg)
		}
	}

	packageBuildClose(pkg: string) {
		this.packageBuildRoll(pkg).dispose()
		Atom.peek(() => this.packageBuildBinRoll(pkg))?.dispose()
	}

	@action packageWrite(pkg: string) {
		this.packageBuildRoll(pkg).write(this.packageTarget(pkg))
	}

	@action packageWriteBin(pkg: string) {
		const target = this.packageTarget(pkg).join('bin.js')

		this.packageBuildBinRoll(pkg).write(target)
	}

	@action packageWriteMinzip(pkg: string) {
		const target = this.packageTarget(pkg).join(`${pkg}.min.js`)

		this.packageBuildRoll(pkg).write(target, [
			terser({
				compress: false,
				mangle: false,
			}),
		])

		return toSync(gzipSize)(target.path)
	}

	@dict packageBuildRoll(pkg: string) {
		return ViterRollup.make({
			entryExports: () => this.packageExports(pkg),
			resolve: id => this.packageBuildResolve(pkg, id),
		})
	}

	@dict packageBuildBinRoll(pkg: string) {
		return ViterRollup.make({
			external: () => true,
			entryVirtual: () => false,
			entry: () => this.packageBin(pkg)!,
			resolve: id => this.packageBuildResolve(pkg, id),
		})
	}

	packageBuildResolve(pkg: string, id: string) {
		if (!id.startsWith('./')) return null
		const moduleName = id.slice(2)
		const module = this.project().module(moduleName)
		const owner = this.moduleOwner(module)
		if (owner === pkg) return id
		if (owner) return this.packagePublishName(owner)
		return null
	}

	packageExports(pkg: string) {
		return this.packageModules(pkg).map(mod => `./${mod.name()}`)
	}

	packageTested() {
	}
}

// TODO move build logic here
export class ViterPackBuild extends ViterPool<{
	project: string
	package: string
}> {
	url() {
		return import.meta.url
	}

	project() {
		return ViterProject.from(TygerFile.from(this.input.project))
	}
}

async function gzipSize(data: any) {
	const gzip = zlib.createGzip()

	let result = 0
	gzip.on('data', (chunk) => {
		result += chunk.length
	})

	gzip.write(data)

	await events.once(gzip, 'close')

	return result
}
