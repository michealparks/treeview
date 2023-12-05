<script lang="ts">
	import type { TreeNodeInternal } from '../internal/node'
	import { getTreeContext } from '../internal/context'
	import { cx } from '../internal/classnames'

	export let node: TreeNodeInternal
	export let active: boolean

	let ref: HTMLButtonElement | undefined

	const { selectedNode, dragNode, pointerDown } = getTreeContext()

	$: if (active) ref?.focus()
</script>

<button
	bind:this={ref}
	class={cx({
		'!text-[var(--treeview-node-active-text-color,#fff)] !bg-[var(--treeview-node-active-bg-color,#222)]': active,
		'name h-5 m-0 py-0 px-2 rounded-[var(--treeview-button-border-radius,2px)] border-0 whitespace-nowrap outline-none bg-[var(--treeview-node-bg-color,#eee)]': true,
		'hover:text-[var(--treeview-node-hovered-text-color,#fff)] hover:bg-[var(--treeview-node-hovered-bg-color,#666)]': true,
		'focus-within:text-[var(--treeview-node-hovered-text-color,#fff)] focus-within:bg-[var(--treeview-node-hovered-bg-color,#666)]': true,
	})}
	on:click={() => selectedNode.set(node)}
	on:pointerdown={(event) => {
		dragNode.set(node)
		pointerDown.set({ x: event.clientX, y: event.clientY })
	}}
>
	{node.name}
</button>
