import {Atom} from './atom'
import {Dag} from './dag'
import {rethrowPromise} from './rethrow'

export let atomDag = (root: Atom) => {
	let dag = new Dag<Atom, number>

	let visit = (pub: Atom) => {
		Atom.refresh(pub)
		rethrowPromise(pub.c)

		let edge = 0
		for (let i = pub.p; i <= pub.s; i += 2) {
			let sub = pub.d[i] as Atom
			dag.link(sub, pub, edge++)
		}
	}
	visit(root)

	return dag
}
