import {tyger} from './tyger'
import {Dag} from './dag'
import {rethrowPromise} from './rethrow'

export function tygerMetaPubs(atom: tyger.Atom) {
	const result = [] as tyger.Atom[]
	for (let i = atom.p; i < (atom.t < 0 ? atom.s : atom.t); i += 2) {
		const peer = atom.d[i] as tyger.Atom | undefined
		if (peer) result.push(peer)
	}
	return result
}

export function tygerMetaSubs(atom: tyger.Atom) {
	const result = [] as tyger.Atom[]
	for (let i = atom.s; i < atom.d.length; i += 2) {
		const peer = atom.d[i] as tyger.Atom
		result.push(peer)
	}
	return result
}

export function tygerMetaDag(root: tyger.Atom) {
	const dag = new Dag<tyger.Atom, number>

	function visit(pub: tyger.Atom) {
		tyger.fresh(pub)
		rethrowPromise(pub.c)

		let edge = 0
		for (let i = pub.p; i <= pub.s; i += 2) {
			const sub = pub.d[i] as tyger.Atom
			dag.link(sub, pub, edge++)
		}
	}
	visit(root)

	return dag
}
