import { getContext, setContext } from 'svelte'
import { writable, type Writable } from 'svelte/store'
import type { TreeNodeInternal } from './node'

interface Context {
  selected: Writable<TreeNodeInternal | undefined>
  toggled: Writable<TreeNodeInternal | undefined>
  focused: Writable<TreeNodeInternal | undefined>
}

const key = Symbol('treeview-context')

export const createTreeContext = () => {
  setContext<Context>(key, {
    selected: writable(),
    toggled: writable(),
    focused: writable(),
  })
}

export const getTreeContext = (): Context => {
  return getContext(key)
}
