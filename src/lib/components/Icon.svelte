<script lang="ts">
	import type { TreeNodeIcon } from '../internal/node'

	export let icon: TreeNodeIcon
</script>

<div class={typeof icon === 'object' && 'class' in icon ? icon.class : ''}>
	{#if typeof icon === 'string'}
		{@html icon}
	{:else if 'path' in icon}
		<svg viewBox={icon.viewBox}>
			<path
				d={icon.path}
				class="tv-fill-[var(--treeview-icon-color,#555)]"
			/>
		</svg>
	{:else if 'url' in icon}
		<img
			src={icon.url}
			alt=""
		/>
	{/if}
</div>

<style>
	div {
		display: grid;
		place-content: center;
		height: var(--treview-icon-container-size, 1.25rem);
		width: var(--treview-icon-container-size, 1.25rem);
		background-color: var(--treeview-icon-bg-color, rgba(0, 0, 0, 0.1));
		border-radius: 100%;
	}

	svg,
	img {
		height: var(--treeview-icon-size, 0.75rem);
		width: var(--treeview-icon-size, 0.75rem);
	}
</style>
