import {Base} from './base'
import {cell} from './cell'
import {ViterProject} from './viter-project'

export class ViterModule extends Base {
	@cell project() {
		return ViterProject.make()
	}

	name() {
		return ''
	}

	file(ext: string) {
		return this.project().src().join(`${this.name()}.${ext}`)
	}

	ts() {
		return this.file('ts')
	}

	dts() {
		return this.file('d.ts')
	}

	js() {
		return this.file('js')
	}

	test() {
		return this.file('test.ts')
	}

	package() {
		return this.file('package.js')
	}

	readme() {
		return this.file('md')
	}
}
