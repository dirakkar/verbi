import {TygerFile} from './tyger-file'
import {ViterModule} from './viter-module'
import {ViterProject} from './viter-project'

export type ViterSpec =
	| {type: 'script', file: TygerFile}
	| {type: 'project', project: ViterProject}
	| {type: 'module', module: ViterModule}

export function viterSpecParse(spec: string): ViterSpec {
	const file = TygerFile.from(spec)

	if (file.exists()) {
		if (file.extname() === '.ts') return {type: 'script', file}
		return {type: 'project', project: ViterProject.from(file)}
	}

	const parts = spec.split(':')
	if (parts.length === 2) {
		const [projectPath, moduleName] = parts
		const project = ViterProject.from(TygerFile.from(projectPath))
		const module = project.module(moduleName)
		return {type: 'module', module}
	}

	throw new Error(`Invalid specifier "${spec}"`)
}
