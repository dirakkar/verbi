/**
 * Represents an error caused by incorrect user inputs.
 */
export class ErrorInput extends Error {
	/**
	 * Wrap exceptions thrown from a block with `ErrorInput`.
	 */
	static throws<T>(fn: () => T) {
		try {
			return fn()
		} catch (cause) {
			throw new ErrorInput(String(cause), {cause})
		}
	}
}
