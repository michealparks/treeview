<script lang="ts">
	import type { TreeNodeInternal } from '../internal/node'
	import { getTreeContext } from '../internal/context'

	export let node: TreeNodeInternal
	export let active: boolean

	let ref: HTMLButtonElement | HTMLAnchorElement | undefined

	const { selectedNode, dragNode, pointerDown } = getTreeContext()

	$: if (active) ref?.focus()

	const handleClick = () => selectedNode.set(node)
	const handlePointerDown = (event: PointerEvent) => {
		dragNode.set(node)
		pointerDown.set({ x: event.clientX, y: event.clientY })
	}
</script>

{#if 'href' in node}
	<a
		bind:this={ref}
		href={node.href}
		class:active
		class="tv-focus-within:text-[var(--treeview-node-hovered-text-color,#fff)] tv-focus-within:bg-[var(--treeview-node-hovered-bg-color,#666)]"
		on:click={handleClick}
		on:pointerdown={handlePointerDown}
	>
		{node.name}
	</a>
{:else}
	<button
		bind:this={ref}
		class:active
		class="tv-focus-within:text-[var(--treeview-node-hovered-text-color,#fff)] tv-focus-within:bg-[var(--treeview-node-hovered-bg-color,#666)]"
		on:click={handleClick}
		on:pointerdown={handlePointerDown}
	>
		{node.name}
	</button>
{/if}

<style>
	a,
	button {
		height: var(--treeview-node-height, 1.25rem);
		padding: var(--treeview-node-horizontal-padding, 0.5rem);
		margin: 0;
		border: 0;
		border-radius: var(--treeview-button-border-radius, 2px);
		font-size: inherit;
		color: inherit;
		text-decoration-line: none;
		white-space: nowrap;
		outline: 2px solid transparent;
		outline-offset: 2px;
		background-color: var(--treeview-node-bg-color, #eee);
	}

	a:hover,
	button:hover {
		color: var(--treeview-node-hovered-text-color, #fff);
		background-color: var(--treeview-node-hovered-bg-color, #666);
	}

	a.active,
	button.active {
		color: var(--treeview-node-active-text-color, #fff);
		background: var(--treeview-node-active-bg-color, #222);
	}
</style>
