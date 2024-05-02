<script lang="ts">
	import { Treeview } from '$lib'
	import { nodes } from './nodes'
	import Pane from './pane.svelte'

	let select: (id: string) => void
</script>

<Pane let:style>
	<main>
		<Treeview
			{style}
			bind:select
			{nodes}
			on:select={(event) => console.log('select', event)}
			on:deselect={(event) => console.log('deselect', event)}
			on:reparent={(event) => console.log('reparent', event)}
			on:toggle={(event) => console.log('toggle', event)}
		/>

		<div id="dogs" />
		<div id="treadmill" />
	</main>
</Pane>

<style>
	:global(body) {
		font-family: system-ui;
		font-size: 14px;
	}

	main {
		max-width: 400px;
		background-color: #eee;
		overflow: auto;
	}
</style>
