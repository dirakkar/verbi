import path from 'node:path'
import fs from 'node:fs'

const root = process.cwd()

export function workspaceModules() {
	const srcFiles = fs.readdirSync(path.join(root, 'src'))
	const srcFileModules = srcFiles.map(file => file.slice(0, file.indexOf('.')))
	return [...new Set(srcFileModules)]
}

export function workspaceModuleFiles(name: string) {
	const file = (ext: string) => {
		const filepath = path.join(root, 'src', `${name}.${ext}`)
		if (!fs.existsSync(filepath)) return null
		return filepath
	}

	return {
		readme: file('md'),
		ts: file('ts'),
		js: file('js'),
		dts: file('d.ts'),
		testTs: file('test.ts'),
		testJs: file('test.js'),
	}
}

export function workspaceModuleImpl(name: string) {
	const {ts, js} = workspaceModuleFiles(name)

	if (ts && js) {
		throw new Error(`Module "${name}" has both TypeScript and JavaScript implementations`)
	}

	return ts || js
}

export function workspaceModuleTypes(name: string) {
	const {ts, dts} = workspaceModuleFiles(name)
	return ts || dts
}

export function workspaceModuleTest(name: string) {
	const {testTs, testJs} = workspaceModuleFiles(name)

	if (testTs && testJs) {
		throw new Error(`Module "${name}" has both TypeScript and JavaScript test files`)
	}

	return testTs || testJs
}
