<script lang="ts">
	import type { TreeNodeInternal } from '../internal/node'
	import { getTreeContext } from '../internal/context'
	import Item from './Item.svelte'

	export let node: TreeNodeInternal

	$: expanded = node.expanded ?? false

	const { selectedNode, toggledNode } = getTreeContext()

	const toggle = () => {
		expanded = !expanded
		node.expanded = expanded
		toggledNode.set(node)
	}

	$: active = $selectedNode === node
</script>

<Item {node} {expanded} {active} onToggle={toggle} />

{#if node.children.length > 0 && expanded}
	<ul>
		{#each node.children as child (child.id)}
			<svelte:self node={child} />
		{/each}
	</ul>
{/if}

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: var(--treeview-list-gap, 0.25rem);
		list-style-type: none;
		padding: 0;
		margin: 0;
		outline: 2px solid transparent;
		outline-offset: 2px;
	}
</style>
