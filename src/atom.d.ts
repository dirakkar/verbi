import {Fn} from './fn'

export type AtomStatus = -1 | -2 | -3 | -4

export type AtomCache<F extends Fn> =
	| ReturnType<F>
	| Error
	| Promise<ReturnType<F> | Error>

export class Atom<F extends Fn = Fn> {
	static linking?: Atom
	static owning: WeakMap<Atom, Disposable>

	static unstable(): void
	static keep(): void
	static peek<T>(formula: () => T): T | undefined

	static reap(): void
	static task<F extends Fn>(
		host: ThisParameterType<F>,
		formula: F,
		args: Parameters<F>
	): AtomTask<F>
	static id(host: object, formula: Fn, key: string): string

	static pull<F extends Fn>(atom: Atom<F>): ReturnType<F>
	static snapshot<F extends Fn>(atom: Atom<F>): ReturnType<F>
	static push<F extends Fn>(atom: Atom<F>, args: Parameters<F>): ReturnType<F>
	static set<F extends Fn>(atom: Atom<F>, next: AtomCache<F>): void
	static refresh(atom: Atom): void
	static cut(atom: Atom): void
	static mark(atom: Atom): void
	static absorb(atom: Atom, status?: AtomStatus): void
	static cp(atom: Atom, from: number, to: number): void

	constructor(
		id: string,
		formula: F,
		host?: ThisParameterType<F>,
		args?: Parameters<F>
	)

	i: string
	f: F
	c?: AtomCache<F>
	h?: ThisParameterType<F>
	d: unknown[]
	p: number
	s: number
	t: AtomStatus | (number & {})

	reap(): void
	dispose(): void
}

export class AtomTask<F extends Fn = Fn> extends Atom<F> {
}
