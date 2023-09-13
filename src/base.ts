export class Base {
	static make<T extends Base>(this: new () => T, config: Partial<T> = {}) {
		return Object.assign(new this, config) as T
	}

	dispose() {
	}

	toString() {
		return Symbol.toStringTag in this
			? this[Symbol.toStringTag]
			: `[Unnamed ${this.constructor.name}]`
	}
}

