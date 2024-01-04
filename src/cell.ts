import {tyger} from './tyger'
import {decorator} from './decorator'

export const cell = decorator<CellAtom>('cell', (formula, store) => {
	const Atom = CellAtom.for(formula) as typeof CellAtom
	return function (...args) {
		let atom = store.get(this)
		if (!atom) {
			store.set(this, (atom = new Atom(formula, this)))
			atom.store = store
		}

		if (!args.length || args[0] === undefined) {
			return tyger.once(atom)
		}
		return tyger.push(atom, args)
	}
})

export class CellAtom extends tyger.Atom {
	store!: WeakMap<object, CellAtom>

	die() {
		this.store.delete(this.h!)
	}
}
