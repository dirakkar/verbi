import {AnsiFormat, ansi, ansiFormatIs} from './ansi'

export interface AnsiTemplateChunk {
	formats?: AnsiFormat[]
	text: string
}

export function ansiTemplate(template: string) {
	return ansiTemplateParse(template).map(chunk => {
		return chunk.formats
			? ansi(chunk.text, ...chunk.formats)
			: chunk.text
	}).join('')
}

export function ansiTemplateParse(template: string) {
	const chunks: AnsiTemplateChunk[] = []

	const formatRgx = /(\[([^\]]+)\]\([^)]+\))|([^[]+)/g
	let execArr: RegExpExecArray | null
	while ((execArr = formatRgx.exec(template)) !== null) {
		if (execArr[2] !== undefined) {
			const formattedChunk = execArr[0]
			const matchArr = formattedChunk.match(/\[(.+)\]\((.+)\)/)
			const text = matchArr![1]
			const formats = matchArr![2].split(',')

			for (const format of formats) {
				if (!ansiFormatIs(format)) throw new Error(`Unknown format "${format}"`)
			}

			chunks.push({text, formats: formats as AnsiFormat[]})
		} else if (execArr[3] !== undefined) {
			const rawChunk = execArr[3]
			chunks.push({text: rawChunk})
		}
	}

	return chunks
}
