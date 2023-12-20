import {Fn} from './fn'

export type Decorator<Store> = {
	<F extends Fn>(name: string, formula: F): F & {get store(): Store | undefined}
	(host: object, key: string, descr?: TypedPropertyDescriptor<Fn>): TypedPropertyDescriptor<Fn>
}

export function decorator<Store>(
	name: string,
	wrap: (formula: Fn, store: WeakMap<any, Store>) => Fn,
): Decorator<Store>
