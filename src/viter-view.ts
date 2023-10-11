// TODO colocate node definitions and renderers

import {Rec, RecEntries, recIs} from './rec'

export type ViterViewNode =
	| string
	| number
	| null
	| undefined
	| false
	| {type: 'raw'; text: string}
	| {type: 'vertical'; items: ViterViewNode[]}
	| {type: 'pad'; items: ViterViewNode[]}
	| {type: 'list'; ordered: boolean; items: readonly ViterViewNode[]}
	| {type: 'dict'; items: RecEntries<ViterViewNode>}
	| {type: 'section'; title: string; content: ViterViewNode}

export namespace viterView {
	export let raw = (text: string) => ({
		type: 'raw',
		text,
	} satisfies ViterViewNode)

	export type ListConfig =
		| ViterViewNode[]
		| {ordered: boolean; items: ViterViewNode[]}
	export let list = (config: ListConfig) => {
		if (Array.isArray(config)) {
			config = {ordered: false, items: config}
		}

		return {
			type: 'list',
			items: config.items,
			ordered: config.ordered,
		} satisfies ViterViewNode
	}

	type DictConfig =
		| RecEntries<ViterViewNode>
		| Rec<ViterViewNode>
	export let dict = (config: DictConfig) => {
		if (recIs(config)) {
			config = Object.entries(config)
		}

		return {
			type: 'dict',
			items: config,
		} satisfies ViterViewNode
	}

	export type PadConfig = ViterViewNode | ViterViewNode[]
	export let pad = (config: PadConfig) => {
		if (!Array.isArray(config)) {
			config = [config]
		}

		return {
			type: 'pad',
			items: config,
		} satisfies ViterViewNode
	}

	export let vertical = (items: ViterViewNode[]) => ({
		type: 'vertical',
		items,
	} satisfies ViterViewNode)

	export interface SectionConfig {
		title: string
		content: ViterViewNode
	}
	export let section = (config: SectionConfig) => ({
		type: 'section',
		title: config.title,
		content: config.content,
	} satisfies ViterViewNode)
}
