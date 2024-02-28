export interface MapLike<K, V> {
	get(key: K): V | undefined
	set(key: K, value: V): void
}

/**
 * Pars-styled interface for Map-like objects.
 */
export function mapItem<K, V>(map: MapLike<K, V>, key: K): V | undefined
export function mapItem<K, V>(map: MapLike<K, V>, key: K, value: V): V
export function mapItem<K, V>(map: MapLike<K, V>, key: K, value?: V): V | undefined {
	if (value === undefined) return map.get(key)
	map.set(key, value)
	return value
}
