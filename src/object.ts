export function objectCheck(v: any): v is object {
	return v !== null && typeof v === 'object'
}

export function objectPlainCheck(v: any): v is object {
	if (!objectCheck(v)) return false
	const prototype = Reflect.getPrototypeOf(v)
	return !prototype || !Reflect.getPrototypeOf(prototype)
}
