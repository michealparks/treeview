<script lang="ts">
	import type { TreeNodeInternal } from '../internal/node'
	import { getTreeContext } from '../internal/context'
	import Item from './Item.svelte'

	export let node: TreeNodeInternal

	$: expanded = node.expanded ?? false

	const { selected, toggled } = getTreeContext()

	const toggle = () => {
		expanded = !expanded
		node.expanded = expanded
		toggled.set(node)
	}

	$: active = $selected === node
</script>

<Item {node} {expanded} {active} onToggle={toggle} />

{#if node.children.length > 0 && expanded}
	<ul class="flex flex-col gap-1 pl-4 list-none m-[var(--treeview-list-margin,0)]">
		{#each node.children as child (child.id)}
			<svelte:self node={child} />
		{/each}
	</ul>
{/if}
