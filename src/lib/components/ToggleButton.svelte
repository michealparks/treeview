<script lang="ts">
	export let expanded = false
	export let onToggle: () => void
</script>

<button
	class="flex items-center justify-center rounded-sm m-0 p-0 border-0"
	class:expanded
	on:click={onToggle}
>
	<svg
		viewBox="0 0 24 24"
		class="h-[var(--treeview-toggle-icon-size,1rem)] w-[var(--treeview-toggle-icon-size,1rem)]"
	>
		{#if expanded}
			<path d="M18.9 12.9h-13.9v-1.9h13.9v1.9z" />
		{:else}
			<path d="M18.9 12.9h-6v6h-1.9v-6h-6v-1.9h6v-6h1.9v6h6v1.9z" />
		{/if}
	</svg>
</button>

<style>
	button {
		height: var(--treeview-toggle-button-size, 1.25rem);
		width: var(--treeview-toggle-button-size, 1.25rem);
		background-color: var(--treeview-toggle-button-bg-color, #eee);
	}

	button:hover,
	button:focus-within {
		outline: 2px solid transparent;
		outline-offset: 2px;
		background-color: #555;
		color: white;
		fill: white;
	}
</style>
