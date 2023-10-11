import {Formula} from './formula'

export interface Decorator<Store> {
	<F extends Formula>(name: string, formula: F): F & {get store(): Store | undefined}
	(host: object, key: string, descr?: TypedPropertyDescriptor<Formula>): TypedPropertyDescriptor<Formula>
}

export let decorator = <Store>(
	name: string,
	wrap: (formula: Formula, store: WeakMap<any, Store>) => Formula,
) => Decorator<Store>
