import {Atom} from './atom'
import {Dag} from './dag'
import {rethrowPromise} from './rethrow'

export function atomDag(root: Atom) {
	const dag = new Dag<Atom, number>

	const visit = (pub: Atom) => {
		Atom.refresh(pub)
		rethrowPromise(pub.c)

		let edge = 0
		for (let i = pub.p; i <= pub.s; i += 2) {
			const sub = pub.d[i] as Atom
			dag.link(sub, pub, edge++)
		}
	}
	visit(root)

	return dag
}
