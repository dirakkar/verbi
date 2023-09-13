import {Base} from './base'
import {ViterViewNode} from './viter-view'

export interface ViterCommand extends Base {
	view(): ViterViewNode
	run(): void
}
