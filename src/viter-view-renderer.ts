import {ansi} from './ansi'
import {ansiTemplate} from './ansi-template'
import {ansiWrap} from './ansi-wrap'
import {ansiStrip} from './ansi-strip'
import {arrayMake} from './array'
import {Model} from './model'
import {cell} from './cell'
import {RecEntries} from './rec'
import {Timer} from './timer'
import {ViterViewNode} from './viter-view'
import {tygerEvent} from './tyger-event'
import {toAsync, toSync} from './to'
import {ansiControl} from './ansi-control'
import {Atom} from './atom'
import {compare} from './compare'

let stdoutWrite = toSync((text: string) => {
	return new Promise(res => {
		process.stdout.write(text, res)
	})
}, 'stdoutWrite')

export class ViterViewRenderer extends Model {
	node() {
		return null! as ViterViewNode
	}

	@cell writeLoop() {
		process.on('exit', () => this.stop())

		return new Timer(16, () => toAsync(this).write(), true)
	}

	@cell write() {
		tygerEvent(process.stdout, 'resize')
		tygerEvent(process.stdin, 'data')

		let columns = process.stdout.columns ?? 80
		let rows = this.render(columns, this.node())

		let result = {columns, rows: rows.length}
		let resultPrev = Atom.peek(() => this.write()) ?? result
		let changed = !compare(result, resultPrev)

		stdoutWrite(ansiControl.cursorHide + ansiControl.moveTo(0))

		if (changed) {
			stdoutWrite(ansiControl.eraseScreen + ansiControl)
		} else {
			// FIXME
			// stdoutWrite(ansiControl.erase(rows.length + 2) + ansiControl.cursorUp(rows.length + 1))
		}

		stdoutWrite(rows.join('\n') + '\n')

		return result
	}

	stop() {
		process.stdout.write(ansiControl.cursorShow)
	}

	dispose() {
		this.writeLoop().dispose()
		this.stop()
	}

	render(c: number, node: ViterViewNode): string[] {
		if (!node) return []
		if (typeof node === 'number') node = node.toString()
		if (typeof node === 'string') return this.renderString(c, node)
		if (node.type === 'raw') return this.renderRaw(c, node.text)
		if (node.type === 'vertical') return this.renderVertical(c, node.items)
		if (node.type === 'pad') return this.renderPad(c, node.items)
		if (node.type === 'list') return this.renderList(c, node.ordered, node.items)
		if (node.type === 'dict') return this.renderDict(c, node.items)
		if (node.type === 'section') return this.renderSection(c, node.title, node.content)

		throw new Error('Unreachable!')
	}

	renderString(c: number, string: string) {
		return this.renderRaw(c, ansiTemplate(string))
	}

	renderRaw(c: number, string: string) {
		return ansiWrap(string, c)
	}

	renderVertical(c: number, items: readonly ViterViewNode[]) {
		return items.flatMap(item => {
			if (!item) return []
			return this.render(c, item)
		})
	}

	renderPad(c: number, items: readonly ViterViewNode[]) {
		return [
			'',
			...items.flatMap(node => {
				if (!node) return []

				return this.render(c - 4, node)
					.map(row => '  ' + row + '  ')
					.concat('')
			}),
		]
	}

	renderList(c: number, ordered: boolean, items: readonly ViterViewNode[]) {
		items = items.filter(Boolean)

		let markers = items.map((node, i) => {
			let marker: string

			if ((node as any).type === 'list') marker = ' '
			else if (ordered) marker = marker = `${i + 1}.`
			else marker = '•'

			return marker
		})

		let markerColumns = Math.max(...markers.map(x => x.length))

		return items.flatMap((node, i) => {
			let marker = markers[i].padStart(markerColumns, ' ') + ' '
			let rows = this.render(c - marker.length - 1, node)
			return rows.flatMap((row, i) => {
				let prefix: string

				if (i === 0) {
					prefix = ansi.bold(marker)
				} else {
					prefix = ' '.repeat(marker.length)
				}

				return prefix + row
			})
		})
	}

	renderDict(c: number, items: RecEntries<ViterViewNode>) {
		let keys = items.map(([key]) => ansiWrap(key, 30))
		let keyLongest = Math.max(...keys.flat().map(x => ansiStrip(x).length))

		let valueColumns = c - keyLongest - 1
		let values = items.map(([, value]) => this.render(valueColumns, value))

		return arrayMake(items.length, i => {
			let keyRows = keys[i]
			let valueRows = values[i]

			return arrayMake(Math.max(keyRows.length, valueRows.length), i => {
				let key = ansiTemplate(keyRows[i])
				let value = valueRows[i]

				if (key && value) return ansi.bold(key.padStart(keyLongest, ' ')) + ' ' + value
				if (key) return ansi.bold(key)
				return ' '.repeat(keyLongest + 1) + value
			})
		}).flat(2)
	}

	renderSection(c: number, title: string, content: ViterViewNode) {
		if (!content) return []

		return [
			...this.renderString(c, ansi.bold(title)),
			...this.render(c - 2, content).map(row => '  ' + row),
		]
	}
}
