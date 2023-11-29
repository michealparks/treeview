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

	const { selected, toggled, dragging, dragMap } = getTreeContext()

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
		let target = event.target as HTMLElement

		if (!('spacer' in target.dataset)) {
			while (target.role !== 'treeitem' && target.parentElement) {
				target = target.parentElement
			}
		}

		dragTarget = dragMap.get(target)
	}

	const handleDragEnd = () => {
		const node = $dragging!
		dragging.set(undefined)

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
	}

	export const expand = () => {
		traverseInternal($nodesInternal, (node) => {
			if (node.children.length > 0) {
				node.expanded = true
			}
		})
	}

	export const collapse = () => {
		traverseInternal($nodesInternal, (node) => {
			if (node.children.length > 0) {
				node.expanded = false
			}
		})
	}

	$: if ($toggled) {
		dispatch('toggle', $toggled)
	}

	$: {
		if (lastSelected && lastSelected !== $selected) {
			dispatch('deselect', lastSelected)
		}

		lastSelected = $selected

		if ($selected) {
			dispatch('select', $selected)
		}
	}
</script>

<ul
	role="tree"
	tabindex="0"
  class='list-none p-0 m-0 flex flex-col gap-1 '
	on:keydown={handleKey}
	on:pointermove={$dragging ? handleDrag : undefined}
	on:pointerup={handleDragEnd}
	{...$$restProps}
>
	{#each $nodesInternal as node (node.id)}
		<TreeNodeComponent {node} on:toggle />
	{/each}
</ul>
