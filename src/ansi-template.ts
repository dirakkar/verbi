import {AnsiFormat, ansiApply, ansiColors, ansiModifiers} from './ansi'

export interface AnsiTemplateChunk {
	format?: AnsiFormat
	text: string
}

export function ansiTemplate(template: string) {
	return ansiTemplateParse(template).map(chunk => {
		return chunk.format
			? ansiApply(chunk.text, chunk.format)
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
			const formatString = matchArr![2]
			const format: AnsiFormat = {modifiers: []}

			for (const chunk of formatString.split(',')) {
				if (ansiColors.includes(chunk as any)) {
					format.foreground = chunk as any
				} else if (ansiModifiers.includes(chunk as any)) {
					format.modifiers.push(chunk as any)
				} else if (chunk.includes('/')) {
					const [foreground, background] = chunk.split('/')

					if (foreground) {
						if (!ansiColors.includes(foreground as any)) {
							throw new Error(`Not a valid color: "${foreground}"`)
						}
						format.foreground = foreground as any
					}
					if (background) {
						if (!ansiColors.includes(background as any)) {
							throw new Error(`Not a valid color: "${foreground}"`)
						}
						format.background = background as any
					}
				} else throw new Error(`Unknown format "${chunk}"`)
			}

			chunks.push({text, format})
		} else if (execArr[3] !== undefined) {
			const rawChunk = execArr[3]
			chunks.push({text: rawChunk})
		}
	}

	return chunks
}
