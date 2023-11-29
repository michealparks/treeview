import { get } from 'svelte/store'
import { getTreeContext } from './context'
import { prevSibling, nextSibling, traverseInternal } from '../internal/traversal'
import type { TreeNodeInternal } from './node'

export const useKeybinding = () => {
  const { selected } = getTreeContext()

  return (key: string, nodes: TreeNodeInternal[]) => {
    const selectedNode = get(selected)
  
    switch (key) {
      case 'arrowleft': {
        if (selectedNode !== undefined) {
          traverseInternal(nodes, (node) => {
            if (selectedNode === node) node.expanded = false
          })
          return nodes
        }
        break
      }

      case 'arrowright': {
        if (selectedNode !== undefined) {
          traverseInternal(nodes, (node) => selectedNode === node && (node.expanded = true))
          return nodes
        }
        break
      }

      case 'arrowup': {
        if (selectedNode === undefined) {
          selected.set(nodes[0])
          return
        }

        const prevNode = prevSibling(selectedNode)
        if (prevNode !== undefined) {
          selected.set(prevNode)
        }
        break
      }

      case 'arrowdown': {
        if (selectedNode === undefined) {
          selected.set(nodes[0])
          return
        }

        const nextNode = nextSibling(selectedNode)
        if (nextNode !== undefined) {
          selected.set(nextNode)
        }
        break
      }
    }
  }
}