/**
 * Directed acyclic graph.
 */
export class Dag<Node, Edge> {
	nodes = new Set<Node>
	edgesIn = new Map<Node, Map<Node, Edge>>
	edgesOut = new Map<Node, Map<Node, Edge>>

	link(from: Node, to: Node, edge: Edge) {
		this.nodes.add(from)
		this.nodes.add(to)

		let pairOut = this.edgesOut.get(from)
		if (!pairOut) {
			this.edgesOut.set(from, pairOut = new Map)
		}
		pairOut.set(from, edge)

		let pairIn = this.edgesIn.get(to)
		if (!pairIn) {
			this.edgesIn.set(to, pairIn = new Map)
		}
		pairIn.set(to, edge)
	}

	unlink(from: Node, to: Node) {
		this.edgesIn.get(to)?.delete(from)
		this.edgesOut.get(from)?.delete(to)
	}

	edgeIn(to: Node, from: Node) {
		return this.edgesIn.get(to)?.get(from)
	}

	edgeOut(from: Node, to: Node) {
		return this.edgesOut.get(from)?.get(to)
	}

	uncycle(edgeWeight: (edge: Edge) => number) {
		let checked: Node[] = []

		for (let node of this.nodes) {
			let path: Node[] = []

			let visit = (from: Node): number => {
				if (checked.includes(node)) return Number.MAX_SAFE_INTEGER

				let index = path.lastIndexOf(from)
				if (index > -1) {
					let cycle = path.slice(index)
					return cycle.reduce((weight, node, i) => {
						let edge = this.edgeOut(node, cycle[(i + 1) % cycle.length])!
						return Math.min(weight, edgeWeight(edge))
					}, Number.MAX_SAFE_INTEGER)
				}

				path.push(from)

				let deps = this.edgesOut.get(from)
				if (deps) {
					for (let [to, edge] of deps) {
						if (to === from) {
							this.unlink(from, to)
							continue
						}

						let weightOut = edgeWeight(edge)
						let min = visit(to)
						if (weightOut > min) return min
						if (weightOut === min) {
							this.unlink(from, to)
							if (path.length) {
								this.link(path.at(-2)!, to, edge)
							}
						}
					}
					path.pop()
				}

				checked.push(from)

				return Number.MAX_SAFE_INTEGER
			}

			visit(node)
		}
	}

	sorted() {
		let sorted = new Set<Node>

		let visit = (node: Node) => {
			if (sorted.has(node)) return
			let deps = this.edgesOut.get(node)
			if (deps) {
				for (let dep of deps.keys()) visit(dep)
			}
			sorted.add(node)
		}

		for (let node of this.nodes) visit(node)
	}
}
