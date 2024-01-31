import { getTreeContext } from './context'

interface TreeNodeIconUrl {
	url: string
}

interface TreeNodeIconPath {
	path: string
	viewBox: string
}

interface TreeNodeIconFont {
	class: string
}

export type TreeNodeIcon = TreeNodeIconUrl | TreeNodeIconPath | TreeNodeIconFont | string

export interface TreeNodeInternal {
	id: string
	name: string
	parent: TreeNodeInternal | null
	children: TreeNodeInternal[]
	href?: string
	expanded?: boolean
	selected?: boolean
	icon?: TreeNodeIcon
}

export type TreeNode = {
	id: string
	name: string
	href?: string
	children?: TreeNode[]
	expanded?: boolean
	selected?: boolean
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

export const createNodes = (
	nodesExternal: TreeNode[],
	parent: TreeNodeInternal | null = null,
): TreeNodeInternal[] => {
	const { selectedNode } = getTreeContext()
	return nodesExternal.map((node) => {
		const internalNode = createTreeNode(node, parent)
		if (internalNode.selected) {
			selectedNode.set(internalNode)
		}
		return internalNode
	})
}
