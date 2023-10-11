import {Atom, AtomTask} from './atom'
import {decorator} from './decorator'
import {valKey} from './val'

export let dict = decorator<Map<string, DictAtom>>('dict', (formula, store) => function (...args) {
	let atoms = store.get(this)
	if (!atoms) {
		store.set(this, (atoms = new Map))
	}

	let id = Atom.id(this, formula, valKey(args[0]))

	let atom = atoms.get(id)
	if (!atom) {
		atoms.set(id, (atom = new DictAtom(id, formula, this, [args[0]])))
		atom.store = atoms
	}

	if (args.length <= 1 || args[1] === undefined) {
		return (
			Atom.linking instanceof AtomTask
				? Atom.snapshot
				: Atom.pull
		)(atom)
	}
	return Atom.push(atom, args)
})

export class DictAtom extends Atom {
	store!: Map<string, DictAtom>

	dispose() {
		super.dispose()
		this.store.delete(this.i)
	}
}
