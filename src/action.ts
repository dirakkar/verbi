import {tyger} from './tyger'
import {decorator} from './decorator'

export const action = decorator('action', formula => {
	const Task = tyger.Task.for(formula)
	return function (this: any, ...args) {
		return tyger.pull(Task.get(args, this))
	}
})
