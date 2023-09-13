import {Atom, AtomTask} from './atom'
import {decorator} from './decorator'

export const cell = decorator<CellAtom>('cell', (formula, store) => function (...args) {
	let atom = store.get(this)
	if (!atom) {
		store.set(this, (atom = new CellAtom(
			Atom.id(this, formula),
			formula,
			this
		)))
		atom.store = store
	}

	if (!args.length || args[0] === undefined) {
		return (
			Atom.linking instanceof AtomTask
				? Atom.snapshot
				: Atom.pull
		)(atom)
	}
	return Atom.push(atom, args)
})

export class CellAtom extends Atom {
	store!: WeakMap<object, CellAtom>

	dispose() {
		super.dispose()
		this.store.delete(this.h)
	}
}
