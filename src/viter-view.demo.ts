import {Atom} from './atom'
import {cell} from './cell'
import {tygerInterval} from './tyger-interval'
import {viterView} from './viter-view'
import {ViterViewRenderer} from './viter-view-renderer'

class App {
	@cell count(): number {
		tygerInterval(1000)
		const prev = Atom.peek(() => this.count()) ?? 0
		return prev + 1
	}

	@cell node() {
		return viterView.pad([
			`The count is: ${this.count()}`,
		])
	}

	@cell renderer() {
		return ViterViewRenderer.make({
			node: () => this.node(),
		})
	}

	render() {
		return this.renderer().writeLoop()
	}
}

new App().render()
