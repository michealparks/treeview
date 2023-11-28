export function cx(...args: (string | Record<string, unknown>)[]): string {
	const classes = []

	for (const arg of args) {
		if (typeof arg === 'string') {
			classes.push(arg)
		} else if (typeof arg === 'object') {
			for (const key in arg) {
				if (Object.hasOwn(arg, key) && arg[key]) {
					classes.push(key)
				}
			}
		}
	}

	return classes.join(' ')
}
