export let randomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1) + min)

export let randomFloat = (min: number, max: number) =>
	min + (Math.random() * (max - min))

export let randomItem = <T>(array: readonly T[]) =>
	array[randomInt(0, array.length - 1)]

export let randomId = () =>
	randomInt(1, Number.MAX_SAFE_INTEGER).toString(36)
