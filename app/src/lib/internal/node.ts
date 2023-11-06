interface TreeNodeIconUrl {
  url: string
}

interface TreeNodeIconPath {
  path: string
}

interface TreeNodeIconFont {
  class: string
}

export type TreeNodeIcon = TreeNodeIconUrl | TreeNodeIconPath | TreeNodeIconFont

export interface TreeNodeInternal {
  id: string
  name: string
  parent: TreeNodeInternal | null
  children: TreeNodeInternal[]
  expanded?: boolean
  icon?: TreeNodeIcon
}

export type TreeNode = {
  id: string
  name: string
  children?: TreeNode[]
  expanded?: boolean
  icon?: TreeNodeIcon
}

const createTreeNode = (node: TreeNode, parent: TreeNodeInternal | null): TreeNodeInternal => {
  const nodeInternal: TreeNodeInternal = {
    ...node,
    children: undefined!,
    parent,
  }
  nodeInternal.children = createNodes(node.children ?? [], nodeInternal)
  return nodeInternal
}

export const createNodes = (nodesExternal: TreeNode[], parent: TreeNodeInternal | null = null): TreeNodeInternal[] => {
  return nodesExternal.map((node) => createTreeNode(node, parent))
}
