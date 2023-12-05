import { getContext, setContext } from 'svelte'
import { writable, type Writable } from 'svelte/store'
import type { TreeNodeInternal } from './node'

interface Context {
	selectedNode: Writable<TreeNodeInternal | undefined>
	toggledNode: Writable<TreeNodeInternal | undefined>
	focusedNode: Writable<TreeNodeInternal | undefined>
	dragNode: Writable<TreeNodeInternal | undefined>
	dragMap: Map<HTMLElement, { node: TreeNodeInternal }>
	dragging: Writable<boolean>
	pointerDown: Writable<{ x: number; y: number }>
}

const key = Symbol('treeview-context')

export const createTreeContext = () => {
	setContext<Context>(key, {
		selectedNode: writable(),
		toggledNode: writable(),
		focusedNode: writable(),
		dragNode: writable(),
		dragMap: new Map(),
		dragging: writable(false),
		pointerDown: writable({ x: 0, y: 0 }),
	})
}

export const getTreeContext = (): Context => {
	return getContext(key)
}
