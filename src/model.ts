import {RecKeysMatching, RecSimplify} from './rec'

export type ModelRequired<T> = T & {__required?: true}

export type ModelMakeConfig<T> = RecSimplify<
	& ModelRequiredUnwrap<Pick<T, RecKeysMatching<T, (...args: unknown[]) => ModelRequired<unknown>>>>
	& Partial<Omit<T, RecKeysMatching<T, (...args: unknown[]) => ModelRequired<unknown>>>>
>

export type ModelRequiredUnwrap<T> = {
	[K in keyof T]: T[K] extends (...args: infer Args) => ModelRequired<infer Result>
		? (...args: Args) => Result
		: never
}

export class Model {
	static required<T extends {}>(): ModelRequired<T> {
		throw new Error('Missing required property implementation')
	}

	static make<T extends Model>(
		this: new () => T,
		config: ModelMakeConfig<T>,
	): T {
		return Object.assign(new this, config)
	}

	dispose() {
	}

	toString() {
		return Symbol.toStringTag in this
			? this[Symbol.toStringTag] as string
			: `[Unnamed ${this.constructor.name}]`
	}
}
