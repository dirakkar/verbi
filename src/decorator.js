import {formulaName} from './formula'

export function decorator(kind, wrap) {
	return formulaName(
		($1, $2, $3) => {
			const store = new WeakMap

			if (typeof $1 === 'string') {
				let wrapped = wrap(formulaName($2, $1), store)	
				Reflect.defineProperty((wrapped = wrapped.bind(wrapped)), 'store', { get() {
					return store.get(wrapped)
				} })
				return wrapped
			}

			const formula = ($3 ?? Reflect.getOwnPropertyDescriptor($1, $2))?.value ?? $1[$2]

			const base = Reflect.getPrototypeOf($1)
			if ($2 in base) formulaName(formula, base[$2].name)

			Reflect.defineProperty($1, $2 + '#' + kind, { get() {
				return store.get(this)
			} })
			return {value: formulaName(wrap(formula, store))}
		},
		kind
	)
}
