import type { TreeNodeInternal, TreeNode } from './node'

export const traverseInternal = (
	nodes: TreeNodeInternal[],
	callback: (node: TreeNodeInternal) => void,
) => {
	for (const node of nodes) {
		callback(node)
		if (node.children.length > 0) {
			traverseInternal(node.children, callback)
		}
	}
}

const getSibling = (node: TreeNodeInternal, direction: -1 | 1): TreeNodeInternal | undefined => {
	const parent = node.parent

	const index = parent?.children?.indexOf(node)

	if (index === undefined) return

	return parent?.children?.[index + direction]
}

export const nextSibling = (node: TreeNodeInternal): TreeNodeInternal | undefined => {
	// Next is expanded
	if (node.expanded) {
		return node.children?.[0]
	}

	// Next is an adjacent node
	let sibling = getSibling(node, 1)

	if (sibling) return sibling

	// Next is closer to the root
	let { parent } = node
	while (parent) {
		sibling = getSibling(parent, 1)

		if (sibling) return sibling

		parent = parent.parent
	}
}

export const prevSibling = (node: TreeNodeInternal): TreeNodeInternal | undefined => {
	// Prevous is expanded
	const sibling = getSibling(node, -1)

	if (sibling?.expanded && sibling.children !== undefined) {
		let child = sibling.children.at(-1)
		if (child !== undefined && child.children !== undefined) {
			while (child.children!.length > 0) {
				child = child.children!.at(-1)!
			}
		}
		return child
	}

	// Previous is adjacent node
	if (sibling) return sibling

	// Previous is a parent
	return node.parent ?? undefined
}

export const traverse = (nodes: TreeNode[], callback: (node: TreeNode) => void) => {
	for (const node of nodes) {
		callback(node)
		if (node.children !== undefined) {
			traverse(node.children, callback)
		}
	}
}
