import {formulaIs} from './formula'

/** Either an unary function or an unary constructor */
export type PipeFn<I, O> =
	| ((i: I) => O)
	| (new (i: I) => O)

/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, O>(input: I1, f1: PipeFn<I1, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, I6, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, I6>, f6: PipeFn<I6, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, I6, I7, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, I6>, f6: PipeFn<I6, I7>, f7: PipeFn<I7, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, I6, I7, I8, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, I6>, f6: PipeFn<I6, I7>, f7: PipeFn<I7, I8>, f8: PipeFn<I8, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, I6, I7, I8, I9, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, I6>, f6: PipeFn<I6, I7>, f7: PipeFn<I7, I8>, f8: PipeFn<I8, I9>, f9: PipeFn<I9, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, I6, I7, I8, I9, I10, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, I6>, f6: PipeFn<I6, I7>, f7: PipeFn<I7, I8>, f8: PipeFn<I8, I9>, f9: PipeFn<I9, I10>, f10: PipeFn<I10, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, I6, I7, I8, I9, I10, I11, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, I6>, f6: PipeFn<I6, I7>, f7: PipeFn<I7, I8>, f8: PipeFn<I8, I9>, f9: PipeFn<I9, I10>, f10: PipeFn<I10, I11>, f11: PipeFn<I11, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe<I1, I2, I3, I4, I5, I6, I7, I8, I9, I10, I11, I12, O>(input: I1, f1: PipeFn<I1, I2>, f2: PipeFn<I2, I3>, f3: PipeFn<I3, I4>, f4: PipeFn<I4, I5>, f5: PipeFn<I5, I6>, f6: PipeFn<I6, I7>, f7: PipeFn<I7, I8>, f8: PipeFn<I8, I9>, f9: PipeFn<I9, I10>, f10: PipeFn<I10, I11>, f11: PipeFn<I11, I12>, f12: PipeFn<I12, O>): O
/** Passes `input` through all provided functions or constructors (see `PipeFn`) */
export function pipe(input: any, ...fns: any[]): any {
	return fns.reduce((val, fn) => {
		if (formulaIs(fn)) return fn(val)
		else return new fn(val)
	}, input)
}
