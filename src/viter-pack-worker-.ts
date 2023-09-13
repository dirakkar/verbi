import zlib from 'node:zlib'
import events from 'node:events'

import terser from '@rollup/plugin-terser'
import {TygerFile} from "./tyger-file"
import {ViterRollup} from "./viter-rollup"
import {Rec} from './rec'
import {toSync} from './to'
import {rethrowPromise} from './rethrow'

export function viterPackWorker(config: {
	name: string
	moduleOwning: Rec<string>
    exports: string[]
	bin?: string
    targetDir: string
    targetMinified?: string
}) {
	const targetDir = TygerFile.from(config.targetDir)
	const targetMinified = config.targetMinified
		? TygerFile.from(config.targetDir)
		: null
	const bin = config.bin
		? TygerFile.from(config.bin)
		: null
	const targetBin = bin
		? targetDir.join(`${bin.name()}.js`)
		: null

	function resolve(id: string) {
		if (!id.startsWith('./')) return null
		const owner = config.moduleOwning[id.slice(2)]
		if (owner === config.name) return id
		return owner
	}

    const pkgRoll = ViterRollup.make({
        entryExports: () => config.exports,
		resolve,
    })
	let binRoll: ViterRollup | undefined

    let minzippedSize = -1

    try {
        pkgRoll.write(targetDir)

        if (targetMinified) {
            const output = pkgRoll.write(targetMinified, [
                terser({
                    compress: false,
                    mangle: false,
                }),
            ])

			minzippedSize = toSync(gzipSize)(output[0].code)
        }

		if (bin) {
			binRoll = ViterRollup.make({
				resolve,
				entryVirtual: () => false,
				entry: () => bin,
			})
			binRoll.write(targetBin!)
		}
    } catch (err) {
		rethrowPromise(err)
        var error = err
    }

    pkgRoll.dispose()
	binRoll?.dispose()

    return {
       error,
       warnings: [] as string[],
       logs: pkgRoll.logs(),
       minzippedSize,
    }
}
viterPackWorker.url = import.meta.url

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
