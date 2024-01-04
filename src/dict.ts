import {tyger} from './tyger'
import {decorator} from './decorator'
import {valKey} from './val'

export const dict = decorator<Map<string, DictAtom>>('dict', (formula, store) => {
	const Atom = DictAtom.for(formula) as typeof DictAtom
	return function (...args) {
		let atoms = store.get(this)
		if (!atoms) {
			store.set(this, (atoms = new Map))
		}

		const key = valKey(args[0])

		let atom = atoms.get(key)
		if (!atom) {
			atoms.set(key, (atom = new Atom(this, [args[0]])))
			atom.store = atoms
		}

		if (args.length < 2 || args[1] === undefined) {
			return tyger.once(atom)
		}
		return tyger.push(atom, args)
	}
})

export class DictAtom extends tyger.Atom {
	store!: Map<string, DictAtom>
	key!: string

	die() {
		this.store.delete(this.key)
	}
}
