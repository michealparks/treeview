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
	<ul class="tv-flex tv-flex-col tv-gap-1 tv-pl-4 tv-list-none tv-m-[var(--treeview-list-margin,0)]">
		{#each node.children as child (child.id)}
			<svelte:self node={child} />
		{/each}
	</ul>
{/if}
