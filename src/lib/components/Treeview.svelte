<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { writable } from 'svelte/store'
	import { type TreeNodeInternal, type TreeNode, createNodes } from '../internal/node'
	import { createTreeContext, getTreeContext } from '../internal/context'
	import { traverseInternal } from '../internal/traversal'
	import TreeNodeComponent from './TreeNode.svelte'
	import { useKeybinding } from '$lib/internal/keybinding'

	export let nodes: TreeNode[]

	interface Events {
		toggle: TreeNodeInternal
		select: TreeNodeInternal
		deselect: TreeNodeInternal
		reparent: { node: TreeNodeInternal; oldParent: TreeNodeInternal; newParent: TreeNodeInternal }
	}

	const dispatch = createEventDispatcher<Events>()

	const nodesInternal = writable<TreeNodeInternal[]>()

	$: nodesInternal.set(createNodes(nodes))

	createTreeContext()

	const handleKeyBinding = useKeybinding()

	const { selectedNode, toggledNode, dragNode, dragMap, dragging, pointerDown } = getTreeContext()

	let lastSelected: TreeNodeInternal | undefined

	const handleKey = (event: KeyboardEvent) => {
		event.preventDefault()
		const nextNodes = handleKeyBinding(event.key.toLowerCase(), $nodesInternal)
		if (nextNodes) nodesInternal.set(nextNodes)
	}

	let dragTarget:
		| {
				node: TreeNodeInternal
				before?: true | undefined
		  }
		| undefined

	const handleDrag = (event: PointerEvent) => {
		const distance = Math.hypot(event.clientX - $pointerDown.x, event.clientY - $pointerDown.y)

		if (distance < 8) return

		dragging.set(true)

		let target = event.target as HTMLElement

		if (!('spacer' in target.dataset)) {
			while (target.role !== 'treeitem' && target.parentElement) {
				target = target.parentElement
			}
		}

		dragTarget = dragMap.get(target)
	}

	const handleDragEnd = () => {
		const node = $dragNode!
		dragNode.set(undefined)

		if (!$dragging) return
		if (dragTarget === undefined) return
		if (node.parent === null) return

		const oldParent = node.parent
		const newParent = dragTarget.node

		// New parent cannot be self
		if (node === newParent) return

		// New parent cannot be a child of dragged node
		let isParentChild = false
		traverseInternal(node.children, (childNode) => {
			if (childNode.id === newParent.id) {
				isParentChild = true
			}
		})
		if (isParentChild) return

		// Remove the current parent
		oldParent.children.splice(oldParent.children.indexOf(node), 1)

		// Reparent and expand
		node.parent = newParent
		newParent.expanded = true
		newParent.children.unshift(node)

		$nodesInternal = $nodesInternal
		dispatch('reparent', { node, oldParent, newParent })

		dragTarget = undefined
		dragging.set(false)
	}

	export const select = (id: string) => {
		traverseInternal($nodesInternal, (node) => {
			if (node.id === id) $selectedNode = node
		})
	}

	$: if ($toggledNode) {
		dispatch('toggle', $toggledNode)
	}

	$: {
		if (lastSelected && lastSelected !== $selectedNode) {
			dispatch('deselect', lastSelected)
		}

		lastSelected = $selectedNode

		if ($selectedNode) {
			dispatch('select', $selectedNode)
		}
	}

	$: document.body.classList.toggle('!tv-cursor-grabbing', $dragNode !== undefined)
</script>

<svelte:window on:pointerup={handleDragEnd} />

<ul
	role="tree"
	tabindex="0"
	on:keydown={handleKey}
	on:pointermove={$dragNode ? handleDrag : undefined}
	{...$$restProps}
>
	{#each $nodesInternal as node (node.id)}
		<TreeNodeComponent {node} on:toggle />
	{/each}
</ul>

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
