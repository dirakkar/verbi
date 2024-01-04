import {DisposeAble} from './dispose'
import {Fn} from './fn'

export type TygerAtomStatus = -1 | -2 | -3 | -4

export type TygerAtomState<F extends Fn> = ReturnType<F> | Error | Promise<ReturnType<F> | Error>

export function tygerUnstable(): void

export function tygerKeep(): void

export function tygerPeek<T>(fn: () => T): T | undefined

export function tygerReap(): void

export namespace tyger {
	export let sub: tyger.Atom | null

	export const owners: WeakMap<DisposeAble, tyger.Atom>

	export function pull<F extends Fn>(atom: tyger.Atom<F>): ReturnType<F>

	export function once<F extends Fn>(atom: tyger.Atom<F>): ReturnType<F>

	export function fresh(atom: tyger.Atom): void

	export function set<F extends Fn>(atom: tyger.Atom<F>, next: TygerAtomState<F>): void

	export function push<F extends Fn>(atom: tyger.Atom<F>, args: Parameters<F>): void

	export function kill(atom: tyger.Atom): void

	export class Atom<F extends Fn = Fn> {
		static for(f: Fn): typeof Atom
		static get(args: readonly any[], host?: object): Atom

		static f: Fn

		c?: TygerAtomState<F>
		h?: object
		d: unknown[]
		p: number
		s: number
		t: TygerAtomStatus | (number & {})

		constructor(host?: object, args?: readonly any[])

		absorb(status: TygerAtomStatus): void
		reap(): void
		die(): void
	}

	export class Task<F extends Fn = Fn> extends Atom<F> {
	}
}
