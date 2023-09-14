import {ansi} from './ansi'
import {ansiTemplate} from './ansi-template'
import {ansiWrap} from './ansi-wrap'
import {ansiStrip} from './ansi-strip'
import {arrayMake} from './array'
import {Base} from './base'
import {cell} from './cell'
import {RecEntries} from './rec'
import {Timer} from './timer'
import {ViterViewNode} from './viter-view'
import {tygerEvent} from './tyger-event'
import {toAsync, toSync} from './to'
import {ansiControl} from './ansi-control'
import {Atom} from './atom'

const stdoutWrite = toSync((text: string) => {
    return new Promise(res => {
        process.stdout.write(text, res)
    })
}, 'stdoutWrite')

export class ViterViewRenderer extends Base {
    node() {
        return null! as ViterViewNode
    }

    @cell writeLoop() {
        process.on('exit', () => this.stop())

        return new Timer(16, () => toAsync(this).write(), true)
    }

    @cell write(): number {
        tygerEvent(process.stdout, 'resize')
        tygerEvent(process.stdin, 'data')

        const columns = process.stdout.columns ?? 80
		const columnsPrev = Atom.peek(() => this.write()) ?? columns
		const resized = columnsPrev !== columns

		const rows = this.render(columns, this.node())

        stdoutWrite(ansiControl({
            erase: resized ? 'entire' : 'down',
            cursorAbsolute: [0, resized ? 0 : null],
			cursorRelative: [0, resized ? 0 : -(rows.length - 1)],
            cursorVisible: false,
        }) + rows.join('\n'))

		return columns
    }

    stop() {
        process.stdout.write(ansiControl({
            cursorVisible: true,
        }))
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
        return ['', ...items.flatMap(node => {
            if (!node) return []

			return this.render(c - 4, node)
				.map(row => '  ' + row + '  ')
				.concat('')
        })]
    }

    renderList(c: number, ordered: boolean, items: readonly ViterViewNode[]) {
        items = items.filter(Boolean)

        const markers = items.map((node, i) => {
			let marker: string

            if ((node as any).type === 'list') marker = ' '
			else if (ordered) marker = marker = `${i + 1}.`
			else marker = '•'

			return marker
		})

		const markerColumns = Math.max(...markers.map(x => x.length))

		return items.flatMap((node, i) => {
			const marker = markers[i].padStart(markerColumns, ' ') + ' '
			const rows = this.render(c - marker.length - 1, node)
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
        const keys = items.map(([key]) => ansiWrap(key, 30))
		const keyLongest = Math.max(...keys.flat().map(x => ansiStrip(x).length))

		const valueColumns = c - keyLongest - 1
		const values = items.map(([, value]) => this.render(valueColumns, value))

		return arrayMake(items.length, i => {
			const keyRows = keys[i]
			const valueRows = values[i]

			return arrayMake(Math.max(keyRows.length, valueRows.length), i => {
				const key = ansiTemplate(keyRows[i])
				const value = valueRows[i]

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
			...this.render(c - 2, content)
				.map(row => '  ' + row),
		]
	}
}

