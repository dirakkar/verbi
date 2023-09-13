// @ts-nocheck
import {Rec} from './rec'
import {Base} from './base'
import {cell} from './cell'
import {dict} from './dict'
import {TygerFile} from './tyger-file'
import {ViterCommand} from './viter-command'
import {ViterModule} from './viter-module'
import {ViterProject} from './viter-project'
import {viterView} from './viter-view'
import {viterPackWorker} from './viter-pack-worker-'
import {ViterPool} from './viter-pool'

export class ViterPack extends ViterPool(import.meta.url) implements ViterCommand {
	@cell project() {
		return ViterProject.make()
	}

	@cell packageNames() {
		const config = this.project().config()
		return Object.keys(config.packages ?? {})
	}

	packageName(pkg: string) {
		return this.project().config().manifest?.(pkg) ?? pkg
	}

	packageConfig(pkg: string) {
		return this.project().config().packages![pkg]!
	}

	@dict packageModulesClaimed(pkg: string) {
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

	@dict moduleOwner(mod: ViterModule) {
		const claimants = this.packageNames().filter(pkg => {
			return this.packageModulesClaimed(pkg).includes(mod)
		})

		if (claimants.length === 0) return null
		if (claimants.length > 1) {
			throw new Error(`Several packages export the same module: ${claimants.join(', ')}`)
		}

		return claimants[0]
	}

	packageModules(pkg: string) {
		return this.project().moduleNames().flatMap(mod => {
			const module = this.project().module(mod)
			const owner = this.moduleOwner(module)
			if (owner !== pkg) return []
			return module
		})
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

	@dict packageBuildStatus(pkg: string, status?: {
		type: 'pending' | 'success' | 'fail',
		text: string,
	}) {
		return status ?? {
			type: 'pending',
			text: 'unknown',
		}
	}

	@dict packageMinzippedSize(pkg: string, next?: number) {
		return next ?? -1
	}

	@dict packageBuild(pkg: string) {
		const project = this.project()
		const modules = this.packageModulesClaimed(pkg)
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

		const cached = cache.download(target.path)

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

			const pool = this.project().pool()
			const buildResult = pool.call(viterPackWorker, {
				name: this.packageName(pkg),
				moduleOwning: this.moduleOwning(),
				exports: this.packageModules(pkg).map(mod => `./${mod.name()}`),
				targetMinified: target.join(`${pkg}.min.js`).path,
				targetDir: target.path,
			})

			if (!buildResult.error) {
				this.packageBuildStatus(pkg, {
					type: 'success',
					text: 'built',
				})
				this.packageMinzippedSize(pkg, buildResult.minzippedSize)
				cache.upload(target)
			} else {
				this.packageBuildStatus(pkg, {
					type: 'fail',
					text: 'build failed',
				})
			}
		}
	}

	run() {

	}

	@cell view() {
		const packageNameStyle = (pkg: string) => ({
			pending: 'gray',
			success: 'green',
			fail: 'red',
		})[this.packageBuildStatus(pkg).type]

		const packageMinzippedSize = (pkg: string) => {
			const size = this.packageMinzippedSize(pkg)
			if (size === -1) return null
			if (size >= 1000) return `minzipped size: ${(size / 1000).toFixed(1)}kb`
			return `minzipped size: ${size}b`
		}

		return viterView.pad([
			`[${this.buildStatus()}](bold)`,
			viterView.dict(
				this.packageNames().map(pkg => [
					`[${pkg}](${packageNameStyle(pkg)})`,
					viterView.vertical([
						this.packageBuildStatus(pkg).text,
						packageMinzippedSize(pkg),
					])
				]),
			),
		])
	}

	@cell buildStatus() {

	}

	@cell build() {
	}

}
