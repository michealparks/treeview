import { Config } from 'tailwindcss'

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		// Removes breakpoint definitions which can conflict with apps that use tailwind.
		screens: {},
		extend: {},
	},
	plugins: [],
} satisfies Config
