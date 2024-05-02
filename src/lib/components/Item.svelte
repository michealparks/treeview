<script lang="ts">
	import { onMount } from 'svelte'
	import type { TreeNodeInternal } from '../internal/node'
	import ItemName from './ItemName.svelte'
	import ToggleButton from './ToggleButton.svelte'
	import Icon from './Icon.svelte'
	import { getTreeContext } from '../internal/context'

	export let node: TreeNodeInternal
	export let expanded = false
	export let active = false
	export let onToggle: () => void

	const { dragMap } = getTreeContext()

	let ref: HTMLElement

	onMount(() => {
		dragMap.set(ref, { node })
		return () => dragMap.delete(ref)
	})
</script>

<li
	bind:this={ref}
	role="treeitem"
	aria-selected={active}
>
	<div>
		<ToggleButton
			enabled={node.children.length > 0}
			{expanded}
			{onToggle}
		/>

		{#if node.icon !== undefined}
			<Icon icon={node.icon} />
		{/if}

		<ItemName
			{node}
			{active}
		/>
	</div>
</li>

<style>
	div {
		position: relative;
		display: flex;
		align-items: center;
		column-gap: var(--treeview-node-gap, 0.25rem);
	}
</style>
