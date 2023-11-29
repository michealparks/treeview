<script lang="ts">
	import type { TreeNodeInternal } from '../internal/node'
	import { getTreeContext } from '../internal/context'
	import { cx } from '../internal/classnames'

	export let node: TreeNodeInternal
	export let active: boolean

	const { selected, dragging } = getTreeContext()
</script>

<button
	class={cx(
		'name h-5 m-0 py-0 px-2 rounded-sm border-0 whitespace-nowrap bg-[var(--treeview-node-bg-color,#eee)]',
		{ 'bg-[var(--treeview-node-active-bg-color,#222)] text-white fill-white': active },
    'hover:bg-[var(--treeview-node-hovered-bg-color,#666)] focus-within:bg-[var(var(--treeview-node-hovered-bg-color,#666))]'
	)}
	on:click={() => selected.set(node)}
	on:pointerdown={() => dragging.set(node)}
>
	{node.name}
</button>

<style>
	button:hover,
	button:focus-within {
		color: white;
		fill: white;
	}
</style>
