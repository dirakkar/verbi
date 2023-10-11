import {AnsiFormat, ansi, ansiFormatIs} from './ansi'

export type AnsiTemplateChunk = {
	formats?: AnsiFormat[]
	text: string
}

export let ansiTemplate = (template: string) => {
	return ansiTemplateParse(template).map(chunk => {
		return chunk.formats
			? ansi(chunk.text, ...chunk.formats)
			: chunk.text
	}).join('')
}

export let ansiTemplateParse = (template: string) => {
	let chunks: AnsiTemplateChunk[] = []

	let formatRgx = /(\[([^\]]+)\]\([^)]+\))|([^[]+)/g
	let execArr: RegExpExecArray | null
	while ((execArr = formatRgx.exec(template)) !== null) {
		if (execArr[2] !== undefined) {
			let formattedChunk = execArr[0]
			let matchArr = formattedChunk.match(/\[(.+)\]\((.+)\)/)
			let text = matchArr![1]
			let formats = matchArr![2].split(',')

			for (let format of formats) {
				if (!ansiFormatIs(format)) throw new Error(`Unknown format "${format}"`)
			}

			chunks.push({text, formats: formats as AnsiFormat[]})
		} else if (execArr[3] !== undefined) {
			let rawChunk = execArr[3]
			chunks.push({text: rawChunk})
		}
	}

	return chunks
}
