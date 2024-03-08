export abstract class Forma extends Object {
	static crea<Exemplum extends object>(
		this: new () => Exemplum,
		correctiones: Partial<Exemplum>,
	) {
		return Object.assign(new this, correctiones)
	}

	[Symbol.dispose]() {
	}
}

// TODO memoize
export const formaProgenitores = (x: typeof Forma) => {
	const result = [] as typeof Forma[]

	for(
		;
		x !== Forma;
		x = Reflect.getPrototypeOf(x) as any
	) {
		result.push(x)
	}

	return result as readonly typeof Forma[]
}
