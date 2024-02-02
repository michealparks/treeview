<script lang="ts">
	import type { TreeNodeInternal } from '../internal/node'
	import { getTreeContext } from '../internal/context'
	import { cx } from '../internal/classnames'

	export let node: TreeNodeInternal
	export let active: boolean

	let ref: HTMLButtonElement | HTMLAnchorElement | undefined

	const { selectedNode, dragNode, pointerDown } = getTreeContext()

	$: if (active) ref?.focus()
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={node.href ? 'a' : 'button'}
	bind:this={ref}
	href={node.href}
	style='font-size:inherit;'
	class={cx(
		'tv-h-5 tv-m-0 tv-py-0 tv-px-2 tv-border-0 tv-rounded-[var(--treeview-button-border-radius,2px)]',
		'tv-text-inherit tv-no-underline',
		'tv-whitespace-nowrap tv-outline-none tv-bg-[var(--treeview-node-bg-color,#eee)]',
		'tv-hover:text-[var(--treeview-node-hovered-text-color,#fff)] tv-hover:bg-[var(--treeview-node-hovered-bg-color,#666)]',
		'tv-focus-within:text-[var(--treeview-node-hovered-text-color,#fff)] tv-focus-within:bg-[var(--treeview-node-hovered-bg-color,#666)]',
		{
			'!tv-text-[var(--treeview-node-active-text-color,#fff)] !tv-bg-[var(--treeview-node-active-bg-color,#222)]': active,
		}
	)}
	on:click={() => selectedNode.set(node)}
	on:pointerdown={(event) => {
		dragNode.set(node)
		pointerDown.set({ x: event.clientX, y: event.clientY })
	}}
>
	{node.name}
</svelte:element>
