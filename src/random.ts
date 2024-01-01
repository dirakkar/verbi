export function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFloat(min: number, max: number) {
	return min + (Math.random() * (max - min))
}

export function randomItem<T>(array: readonly T[]) {
	return array[randomInt(0, array.length - 1)]
}

export function randomId() {
	return randomInt(1, Number.MAX_SAFE_INTEGER).toString(36)
}
