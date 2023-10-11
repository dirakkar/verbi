import {Model} from './model'
import {ViterViewNode} from './viter-view'

export type ViterCommand = Model & {
	view(): ViterViewNode
	run(): void
}
