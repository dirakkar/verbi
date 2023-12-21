import {ansiFormatIs, ansi} from './ansi.js'

export function ansiTemplate(template) {
	return ansiTemplateParse(template).map(chunk => {
		return chunk.formats
			? ansi(chunk.text, ...chunk.formats)
			: chunk.text
	}).join('')
}

export function ansiTemplateParse(template) {
	const chunks = []

	const formatRgx = /(\[([^\]]+)\]\([^)]+\))|([^[]+)/g
	let execArr
	while ((execArr = formatRgx.exec(template)) !== null) {
		if (execArr[2] !== undefined) {
			const formattedChunk = execArr[0]
			const matchArr = formattedChunk.match(/\[(.+)\]\((.+)\)/)
			const text = matchArr[1]
			const formats = matchArr[2].split(',')

			for (let format of formats) {
				if (!ansiFormatIs(format)) {
					throw new Error(`Unknown format "${format}"`)
				}
			}

			chunks.push({ text, formats })
		} else if (execArr[3] !== undefined) {
			const rawChunk = execArr[3]
			chunks.push({ text: rawChunk })
		}
	}

	return chunks
}
