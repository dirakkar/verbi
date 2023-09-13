export type JsonValue = JsonObject | JsonArray | JsonPrimitive

export type JsonObject = Readonly<{[Key in string]: JsonValue}>

export type JsonArray = readonly JsonValue[]

export type JsonPrimitive = null | boolean | number | string
