<script lang="ts">
	import { onMount } from 'svelte'
	import type { TreeNodeInternal } from '../internal/node'
	import ItemName from './ItemName.svelte'
	import ToggleButton from './ToggleButton.svelte'
	import { cx } from '../internal/classnames'
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

<li bind:this={ref} role="treeitem" aria-selected={active}>
	<div class="tv-relative tv-flex tv-items-center tv-gap-[var(--treeview-node-gap,0.25rem)]">
		{#if node.children.length > 0}
			<ToggleButton {expanded} {onToggle} />
		{:else}
			<div
				class="
					tv-h-[var(--treeview-toggle-button-size,1.25rem)]
					tv-w-[var(--treeview-toggle-button-size,1.25rem)]
				"
			/>
		{/if}

		{#if node.icon !== undefined}
			{@const { icon } = node}
			<div
				class={cx(
					'tv-grid tv-place-content-center tv-h-5 tv-w-5 tv-bg-[rgba(0,0,0,0.1)] tv-rounded-full',
					typeof icon === 'object' && 'class' in icon ? icon.class : '',
				)}
			>
				{#if typeof icon === 'string'}
					{@html icon}
				{:else if 'path' in icon}
					<svg
						class="tv-h-[var(--treeview-icon-size,0.75rem)] tv-w-[var(--treeview-icon-size,0.75rem)] tv-fill-[var(--treeview-icon-color,#555)]"
						viewBox={icon.viewBox}
					>
						<path d={icon.path} />
					</svg>
				{:else if 'url' in icon}
					<img
						class="tv-h-[var(--treeview-icon-size,0.75rem)] tv-w-[var(--treeview-icon-size,0.75rem)]"
						src={icon.url}
						alt=""
					/>
				{/if}
			</div>
		{/if}

		<ItemName {node} {active} />
	</div>
</li>
