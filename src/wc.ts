import { TreeView, type TreeViewArgs } from './treeview';

export class TreeViewWebComponent extends TreeView {
  wc = document.createElement('tree-view')
  shadowRoot = this.wc.attachShadow({ mode: 'open' })

  constructor (args: Readonly<TreeViewArgs> = {}) {
    super(args)
    this.shadowRoot.append(this.dom)
  }
}
