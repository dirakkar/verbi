import {Atom} from './atom'
import {decorator} from './decorator'

export const action = decorator('action', formula => function (this: any, ...args) {
	return Atom.pull(Atom.task(this, formula, args))
})

action(Atom, 'push')
action(Atom, 'snapshot')
