import { Label } from './label'
import { Node } from './node'
import { TextInput } from './textinput'
import type { TreeView } from './treeview'

interface Args {
  text: string
  icon?: string
  selected?: boolean
}

/**
 * @event
 * @name TreeViewItem#select
 * @description Fired when we select the TreeViewItem.
 * @param {TreeViewItem} item - The item
 */

/**
 * @event
 * @name TreeViewItem#deselect
 * @description Fired when we deselect the TreeViewItem.
 * @param {TreeViewItem} item - The item
 */

/**
 * @event
 * @name TreeViewItem#open
 * @description Fired when we open a TreeViewItem
 * @param {TreeViewItem} item - The item
 */

/**
 * @event
 * @name TreeViewItem#close
 * @description Fired when we close the TreeViewItem.
 * @param {TreeViewItem} item - The item
 */

/**
 * @name TreeViewItem
 * @class
 * @classdesc Represents a Tree View Item to be added to a TreeView.
 * @mixes IFocusable
 * @property {Label} textLabel Gets the internal label that shows the text.
 * @property {Label} iconLabel Gets the internal label that shows the icon.
 * @property {TreeView} treeView Gets / sets the parent TreeView.
 * @property {TreeViewItem} firstChild Gets the first child item.
 * @property {TreeViewItem} lastChild Gets the last child item.
 * @property {TreeViewItem} nextSibling Gets the first sibling item.
 * @property {TreeViewItem} previousSibling Gets the last sibling item.
 */
export class TreeViewItem extends Node {
  /**
   * Whether the item can be selected.
   * @default true
   */
  allowSelect = true

  /**
   * Whether this tree item can be dragged. Only considered if the parent Treeview has allowDrag true.
   * @default true
   */
  allowDrag = true

  /**
   * Whether dropping is allowed on the tree item.
   * @default true
   */
  allowDrop = true

  allowRenaming = true

  // Used the the parent Treeview
  treeOrder = -1
  treeView: TreeView | undefined

  contents = document.createElement('div')
  #labelIcon: Label
  #labelText: Label
  #open = false
  #icon = ''

  items: TreeViewItem[] = []

  /**
   * Creates a new TreeViewItem.
   */
  constructor (args: Args) {
    super()

    this.dom.className = 'tv-item tv-item-empty relative pl-8 h-[20px]'

    this.contents.className = 'tv-item-contents relative flex flex-row items-center h-6'
    this.contents.tabIndex = 0
    this.dom.append(this.contents)

    this.contents.draggable = true

    this.#labelIcon = new Label()
    this.#labelIcon.dom.classList.add('tv-item-icon')
    this.contents.append(this.#labelIcon.dom)

    this.icon = args.icon ?? ''

    this.#labelText = new Label()
    this.#labelText.dom.classList.add('tv-item-text', 'relative', 'z-1', 'shrink-0', 'm-0')
    this.contents.append(this.#labelText.dom)

    this.text = args.text
    this.selected = args.selected ?? false

    this.contents.addEventListener('focus', this.#onContentFocus)
    this.contents.addEventListener('blur', this.#onContentBlur)
    this.contents.addEventListener('keydown', this.#onContentKeyDown)
    this.contents.addEventListener('dragstart', this.#onContentDragStart)
    this.contents.addEventListener('mousedown', this.#onContentMouseDown)
    this.contents.addEventListener('mouseover', this.#onContentMouseOver)
    this.contents.addEventListener('click', this.#onContentClick)
    this.contents.addEventListener('dblclick', this.#onContentDblClick)
    this.contents.addEventListener('contextmenu', this.#onContentContextMenu)
  }

  override onAppend (element: TreeViewItem) {
    super.onAppend(element)

    if (!(element instanceof TreeViewItem)) {
      return
    }

    this.items.push(element)

    if (this.parent !== this.treeView) {
      this.dom.classList.remove('tv-item-empty')
    }

    this.treeView?.onAppendTreeViewItem(element)
  }

  override remove (element: TreeViewItem) {
    if (element instanceof TreeViewItem) {
      this.items.splice(this.items.indexOf(element), 1)
      this.treeView?.onRemoveTreeViewItem(element)

      if (this.items.length === 0) {
        this.dom.classList.add('tv-item-empty')
      }
    }

    super.remove(element)
  }

  #onContentKeyDown = (event: KeyboardEvent) => {
    if (
      (event.target as HTMLElement).tagName.toLowerCase() === 'input' ||
      !this.allowSelect
    ) {
      return
    }

    this.treeView?.onChildKeyDown(event, this)
  }

  #onContentMouseDown = (event: MouseEvent) => {
    if (this.treeView === undefined || !this.treeView.allowDrag || !this.allowDrag) {
      return
    }

    this.treeView.updateModifierKeys(event)
    event.stopPropagation()
  }

  #onContentMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    window.removeEventListener('mouseup', this.#onContentMouseUp)

    this.treeView?.onChildDragEnd(event, this)
  }

  #onContentMouseOver = (event: MouseEvent) => {
    event.stopPropagation()
    this.treeView?.onChildDragOver(event, this)
  }

  #onContentDragStart = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (
      this.treeView === undefined ||
      !this.treeView.allowDrag ||
      this.dom.classList.contains('tv-item-rename')
    ) {
      return
    }

    this.treeView.onChildDragStart(event, this)

    window.addEventListener('mouseup', this.#onContentMouseUp)
  }

  #onContentClick = (event: MouseEvent) => {
    if (!this.allowSelect || event.button !== 0) {
      return
    }

    if ((event.target as HTMLElement).tagName.toLowerCase() === 'input') {
      return
    }

    event.stopPropagation()

    const rect = this.contents.getBoundingClientRect()

    if (this.children.length > 0 && event.clientX - rect.left < 0) {
      this.open = !this.open
      if (event.altKey) {
        // Apply to all children as well
        this.traverseDepthFirst((node: TreeViewItem) => {
          node.open = this.open
        })
      }
      this.focus()
    } else if (this.treeView) {
      this.treeView.onChildClick(event, this)
    }
  }

  traverseDepthFirst (fn: (arg: TreeViewItem) => void) {
    fn(this)
    let child = this.firstChild
    while (child) {
      child.traverseDepthFirst(fn)
      child = child.nextSibling
      if (child !== null) {
        fn(child)
      }
    }
  }

  #onContentDblClick = (evt: MouseEvent): void => {
    if (this.treeView === undefined || !this.treeView.allowRenaming) {
      return
    }

    if (!this.allowRenaming) {
      return
    }

    if (evt.button !== 0) {
      return
    }

    const target = evt.target as HTMLElement

    if (target.tagName.toLowerCase() === 'input') {
      return
    }

    evt.stopPropagation()
    const rect = this.contents.getBoundingClientRect()
    if (this.children.length > 0 && evt.clientX - rect.left < 0) {
      return
    }

    if (this.allowSelect) {
      this.treeView.deselect()
      this.treeView.onChildClick(evt, this)
    }

    this.rename()
  }

  #onContentContextMenu = (event: MouseEvent) => {
    this.treeView?.onContextMenu?.(event, this)
  }

  #onContentFocus = (event: FocusEvent) => {
    this.emit('focus', event)
  }

  #onContentBlur = (event: FocusEvent) => {
    this.emit('blur', event)
  }

  rename () {
    this.dom.classList.add('tv-item-rename')

    // Show text input to enter new text
    const textInput = new TextInput({
      value: this.text,
    })

    const destroy = () => {
      console.log('here')
      textInput.destroy()
      this.dom.classList.remove('tv-item-rename')
      this.focus()
    }

    textInput.on('blur', destroy)

    textInput.on<string>('change', (value) => {
      console.log('here2')
      const normalized = value.trim()
      if (normalized !== '') {
        this.text = normalized
        destroy()
      }
    })

    this.contents.append(textInput.dom)

    textInput.focus(true)
  }

  focus () {
    this.contents.focus()
  }

  blur () {
    this.contents.blur()
  }

  override destroy () {
    this.contents.removeEventListener('focus', this.#onContentFocus)
    this.contents.removeEventListener('blur', this.#onContentBlur)
    this.contents.removeEventListener('keydown', this.#onContentKeyDown)
    this.contents.removeEventListener('mousedown', this.#onContentMouseDown)
    this.contents.removeEventListener('dragstart', this.#onContentDragStart)
    this.contents.removeEventListener('mouseover', this.#onContentMouseOver)
    this.contents.removeEventListener('click', this.#onContentClick)
    this.contents.removeEventListener('dblclick', this.#onContentDblClick)
    this.contents.removeEventListener('contextmenu', this.#onContentContextMenu)

    window.removeEventListener('mouseup', this.#onContentMouseUp)

    super.destroy()
  }

  /**
   * Whether the item is selected.
   */
  set selected (value: boolean) {
    if (value === this.selected) {
      if (value) {
        this.focus()
      }

      return
    }

    this.contents.classList.toggle('tv-item-selected', value)

    if (value) {
      this.emit('select', this)
      this.treeView?.onChildSelected(this)
      this.focus()
    } else {
      this.blur()
      this.emit('deselect', this)
      this.treeView?.onChildDeselected(this)
    }
  }

  get selected (): boolean {
    return this.contents.classList.contains('tv-item-selected')
  }

  /**
   * The text shown by the TreeViewItem.
   */
  set text (value: string) {
    if (this.#labelText.text !== value) {
      this.#labelText.text = value
      this.treeView?.onChildRename(this, value)
    }
  }

  get text (): string {
    return this.#labelText.text
  }

  get textLabel (): Label {
    return this.#labelText
  }

  get iconLabel (): Label {
    return this.#labelIcon
  }

  /**
   * Whether the item is showing its children.
   */
  set open (value: boolean) {
    if (this.#open === value) {
      return
    }

    this.#open = value
    this.dom.classList.toggle('tv-item-open', value)
    this.emit(value ? 'open' : 'close', this)
  }

  get open (): boolean {
    return this.#open || this.parent === this.treeView
  }

  set parentsOpen (value: boolean) {
    let { parent } = this
    while (parent !== null && parent instanceof TreeViewItem) {
      parent.open = value
      parent = parent.parent
    }
  }

  get parentsOpen (): boolean {
    let { parent } = this
    while (parent !== null && parent instanceof TreeViewItem) {
      if (!parent.open) {
        return false
      }
      parent = parent.parent
    }

    return true
  }

  get firstChild (): TreeViewItem | null {
    if (this.children.length === 0) {
      return null
    }

    for (let i = 0, l = this.children.length; i < l; i += 1) {
      if (this.children[i] instanceof TreeViewItem) {
        return this.children[i] as TreeViewItem
      }
    }

    return null
  }

  get lastChild (): TreeViewItem | null {
    if (this.children.length === 0) {
      return null
    }

    for (let i = this.children.length - 1; i >= 0; i -= 1) {
      if (this.children[i] instanceof TreeViewItem) {
        return this.children[i] as TreeViewItem
      }
    }

    return null
  }

  get nextSibling (): TreeViewItem | null {
    if (this.parent === null) {
      return null
    }

    const { children } = this.parent

    for (let i = 0, l = children.length; i < l; i += 1) {
      if (children[i - 1] === this) {
        while (i < children.length) {
          if (children[i] instanceof TreeViewItem) {
            return children[i] as TreeViewItem
          }
          i += 1
        }
        return null
      }
    }

    return null
  }

  get previousSibling (): TreeViewItem | null {
    if (this.parent === null) {
      return null
    }

    const { children } = this.parent

    for (let i = children.length - 1; i > -1; i -= 1) {
      if (children[i + 1] === this) {
        while (i > -1) {
          if (children[i] instanceof TreeViewItem) {
            return children[i] as TreeViewItem
          }
          i -= 1
        }
        return null
      }
    }

    return null
  }

  /**
   * The icon shown before the text in the TreeViewItem.
   */
  set icon (value: string) {
    this.#icon = value

    if (value) {
      // Set data-icon attribute but first convert the value to a code point
      this.#labelIcon.dom.setAttribute('data-icon', value)
    } else {
      this.#labelIcon.dom.removeAttribute('data-icon')
    }
  }

  get icon (): string {
    return this.#icon
  }
}
