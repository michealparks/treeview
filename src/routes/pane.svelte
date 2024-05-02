<script lang="ts">
	import { Binding, Folder, Pane } from 'svelte-tweakpane-ui'

	let layout = {
		'--treeview-list-gap': '0.25rem',
		'--treeview-toggle-button-size': '1.25rem',
		'--treeview-icon-size': '0.75rem',
		'--treeview-toggle-icon-size': '1rem',
		'--treeview-button-border-radius': '2px',
	} as const

	let color = {
		'--treeview-icon-bg-color': 'rgba(0,0,0,0.1)',
		'--treeview-icon-color': '#555',
		'--treeview-node-bg-color': '#eee',
		'--treeview-node-hovered-bg-color': '#666',
		'--treeview-node-active-bg-color': '#222',
		'--treeview-toggle-button-bg-color': '#eee',
	} as const

	$: style = Object.entries({ ...layout, ...color })
		.map(([key, value]) => {
			return `${key}:${value}`
		})
		.join(';')
	$: console.log(style)
</script>

<Pane title="CSS variables">
	<Folder title="Numeric">
		{#each Object.keys(layout) as key}
			<Binding bind:object={layout} {key} label={key} />
		{/each}
	</Folder>
	<Folder title="Colors">
		{#each Object.keys(color) as key}
			<Binding bind:object={color} {key} label={key} />
		{/each}
	</Folder>
</Pane>

<slot {style} />
