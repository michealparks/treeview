/**
 * Returns a unique string ID.
 *
 * An implementation of nanoid: https://github.com/ai/nanoid
 *
 * @param size ID size
 * @returns A unique ID
 */
export const nanoid = (size = 21): string => {
	const values = crypto.getRandomValues(new Uint8Array(size))

	let id = ''

	for (let index = 0, l = values.length; index < l; index += 1) {
		const byte = values[index] & 63

		if (byte < 36) {
			id = `${id}${byte.toString(36)}`
		} else if (byte < 62) {
			id = `${id}${(byte - 26).toString(36).toUpperCase()}`
		} else if (byte > 62) {
			id = `${id}-`
		} else {
			id = `${id}_`
		}
	}

	return id
}
