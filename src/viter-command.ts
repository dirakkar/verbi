import {Model} from './model'
import {ViterViewNode} from './viter-view'

export interface ViterCommand extends Model {
	view(): ViterViewNode
	run(): void
}
