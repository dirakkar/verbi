import {TigrisCorpus} from './tigris'

export type TigrisGraphRelation =
	| 'idem'
	| 'superius-affine'
	| 'superius-remotum'
	| 'inferius-affine'
	| 'inferius-remotum'
	| 'alienum'

/**
 * Tells how corpus `b` is related to `a`.
 */
export function tigrisGraphRelate(a: TigrisCorpus, b: TigrisCorpus): TigrisGraphRelation {
	if(a === b) return 'idem'

	return 'alienum'
}

/**
 * Returns corpora superiora affinia of a corpus.
 */
export function tigrisGraphSuperiora(corpus: TigrisCorpus) {
	const result = [] as TigrisCorpus[]

	for (let i = corpus.s; i < corpus.i; i += 2) {
		const superius = corpus.d[i] as TigrisCorpus | undefined
		if(!superius) continue
		result.push(superius)
	}

	return result
}

/**
 * Returns corpora inferiora affinia of a corpus.
 */
export function tigrisGraphInferiora(corpus: TigrisCorpus) {
	const result = [] as TigrisCorpus[]

	for (let i = corpus.i; i < corpus.d.length; i += 2) {
		const inferius = corpus.d[i] as TigrisCorpus
		result.push(inferius)
	}

	return result

}
