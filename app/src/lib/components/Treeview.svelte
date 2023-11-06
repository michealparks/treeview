<script lang='ts'>
  import { createEventDispatcher } from 'svelte'
  import { writable } from 'svelte/store'
	import { type TreeNodeInternal, type TreeNode, type TreeNodeIcon, createNodes } from '../internal/node'
  import { createTreeContext, getTreeContext } from '../internal/context'
  import { prevSibling, nextSibling, traverseInternal } from '../internal/traversal'
  import TreeNodeComponent from './TreeNode.svelte'

  export let nodes: TreeNode[]
  export let expandIcon: TreeNodeIcon | undefined = undefined
  export let collapseIcon: TreeNodeIcon | undefined = undefined

  interface Events {
    toggle: TreeNodeInternal
    select: TreeNodeInternal
    deselect: TreeNodeInternal
  }

  const dispatch = createEventDispatcher<Events>()

  const nodesInternal = writable<TreeNodeInternal[]>()

  $: nodesInternal.set(createNodes(nodes))

  createTreeContext()

  const { selected, toggled } = getTreeContext()

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
  on:pointerdown={() => {}}
  on:keydown={handleKey}
  {...$$restProps}
>
  {#each $nodesInternal as node (node.id)}
    <TreeNodeComponent
      {node}
      on:toggle
    />
  {/each}
</div>
