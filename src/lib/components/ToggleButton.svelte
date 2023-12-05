<script lang="ts">
	export let expanded = false
	export let onToggle: () => void
</script>

<button
	class="flex items-center justify-center rounded-[var(--treeview-button-border-radius,2px)] m-0 p-0 border-0"
	class:expanded
	on:click={onToggle}
>
	<svg
		viewBox="0 0 24 24"
		class="h-[var(--treeview-toggle-icon-size,1rem)] w-[var(--treeview-toggle-icon-size,1rem)]"
	>
		{#if expanded}
			<path d="M7.41 8.58l4.59 4.59 4.59-4.59 1.41 1.41-6 6-6-6z" />
		{:else}
			<path d="M8.58 16.59l4.59-4.59-4.59-4.59 1.41-1.41 6 6-6 6z" />
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
