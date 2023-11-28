<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { writable } from 'svelte/store'
	import {
		type TreeNodeInternal,
		type TreeNode,
		type TreeNodeIcon,
		createNodes,
	} from '../internal/node'
	import { createTreeContext, getTreeContext } from '../internal/context'
	import { prevSibling, nextSibling, traverseInternal } from '../internal/traversal'
	import TreeNodeComponent from './TreeNode.svelte'

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

	const { selected, toggled, dragging, dragMap } = getTreeContext()

	let lastSelected: TreeNodeInternal | undefined

	const handleKey = (event: KeyboardEvent) => {
		switch (event.key.toLowerCase()) {
			case 'arrowleft': {
				if ($selected !== undefined) {
					let s = $selected
					traverseInternal($nodesInternal, (node) => $selected === node && (node.expanded = false))
					nodesInternal.set($nodesInternal)
					$selected = s
				}
				break
			}

			case 'arrowright': {
				if ($selected !== undefined) {
					let s = $selected
					traverseInternal($nodesInternal, (node) => $selected === node && (node.expanded = true))
					nodesInternal.set($nodesInternal)
					$selected = s
				}
				break
			}

			case 'arrowup': {
				$selected ??= $nodesInternal[0]
				const prevNode = prevSibling($selected)
				if (prevNode !== undefined) {
					event.preventDefault()
					$selected = prevNode
				}
				break
			}

			case 'arrowdown': {
				$selected ??= $nodesInternal[0]
				const nextNode = nextSibling($selected)
				if (nextNode !== undefined) {
					event.preventDefault()
					$selected = nextNode
				}
				break
			}
		}
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

<div
	role="tree"
	tabindex="0"
	on:keydown={handleKey}
	on:pointermove={$dragging ? handleDrag : undefined}
	on:pointerup={handleDragEnd}
	{...$$restProps}
>
	{#each $nodesInternal as node (node.id)}
		<TreeNodeComponent {node} on:toggle />
	{/each}
</div>
