/* eslint-disable no-underscore-dangle */
import { Container } from './container'
import { Label } from './label'
import { TextInput } from './textinput'
import type { TreeView } from './main'

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
export class TreeViewItem extends Container {
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

  // Used the the parent Treeview
  treeOrder = -1
  treeView: TreeView | undefined

  containerContents: Container
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

    this.containerContents = new Container()
    this.containerContents.dom.className = 'tv-item-contents relative flex flex-row items-center h-6'
    this.containerContents.dom.tabIndex = 0
    this.append(this.containerContents)

    this.containerContents.dom.draggable = true

    this.#labelIcon = new Label()
    this.#labelIcon.dom.classList.add('tv-item-icon')
    this.containerContents.append(this.#labelIcon)

    this.icon = args.icon ?? ''

    this.#labelText = new Label()
    this.#labelText.dom.classList.add('tv-item-text', 'relative', 'z-1', 'shrink-0', 'm-0')
    this.containerContents.append(this.#labelText)

    this.text = args.text
    this.selected = args.selected ?? false

    this.containerContents.dom.addEventListener('focus', this.#onContentFocus)
    this.containerContents.dom.addEventListener('blur', this.#onContentBlur)
    this.containerContents.dom.addEventListener('keydown', this.#onContentKeyDown)
    this.containerContents.dom.addEventListener('dragstart', this.#onContentDragStart)
    this.containerContents.dom.addEventListener('mousedown', this.#onContentMouseDown)
    this.containerContents.dom.addEventListener('mouseover', this.#onContentMouseOver)
    this.containerContents.dom.addEventListener('click', this.#onContentClick)
    this.containerContents.dom.addEventListener('dblclick', this.#onContentDblClick)
    this.containerContents.dom.addEventListener('contextmenu', this.#onContentContextMenu)
  }

  override _onAppendChild (element: TreeViewItem) {
    super._onAppendChild(element)

    if (!(element instanceof TreeViewItem)) {
      return
    }

    this.items.push(element)

    if (this.parent !== this.treeView) {
      this.dom.classList.remove('tv-item-empty')
    }

    this.treeView?._onAppendTreeViewItem(element)
  }

  override _onRemoveChild (element: TreeViewItem) {
    if (element instanceof TreeViewItem) {
      this.items.splice(this.items.indexOf(element), 1)
      this.treeView?._onRemoveTreeViewItem(element)

      if (this.items.length === 0) {
        this.dom.classList.add('tv-item-empty')
      }
    }

    super._onRemoveChild(element)
  }

  #onContentKeyDown = (event: KeyboardEvent) => {
    if (
      (event.target as HTMLElement).tagName.toLowerCase() === 'input' ||
      !this.allowSelect
    ) {
      return
    }

    this.treeView?._onChildKeyDown(event, this)
  }

  #onContentMouseDown = (event: MouseEvent) => {
    if (this.treeView === undefined || !this.treeView.allowDrag || !this.allowDrag) {
      return
    }

    this.treeView._updateModifierKeys(event)
    event.stopPropagation()
  }

  #onContentMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    window.removeEventListener('mouseup', this.#onContentMouseUp)

    this.treeView?._onChildDragEnd(event, this)
  }

  #onContentMouseOver = (event: MouseEvent) => {
    event.stopPropagation()
    this.treeView?._onChildDragOver(event, this)
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

    this.treeView._onChildDragStart(event, this)

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

    const rect = this.containerContents.dom.getBoundingClientRect()

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
      this.treeView._onChildClick(event, this)
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
    if (!this.treeView || !this.treeView.allowRenaming || evt.button !== 0) {
      return
    }

    const target = evt.target as HTMLElement

    if (target.tagName.toLowerCase() === 'input') {
      return
    }

    evt.stopPropagation()
    const rect = this.containerContents.dom.getBoundingClientRect()
    if (this.children.length > 0 && evt.clientX - rect.left < 0) {
      return
    }

    if (this.allowSelect) {
      this.treeView.deselect()
      this.treeView._onChildClick(evt, this)
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
      textInput.destroy()
      this.dom.classList.remove('tv-item-rename')
      this.focus()
    }

    textInput.dom.addEventListener('blur', destroy)

    textInput.on('change', (value: string) => {
      const normalized = value.trim()
      if (normalized !== '') {
        this.text = normalized
        destroy()
      }
    })

    textInput.on('disable', () => {
      /*
       * Make sure text input is editable even if this
       * tree item is disabled
       */
      textInput.dom.removeAttribute('readonly')
    })

    this.containerContents.append(textInput)

    textInput.focus(true)
  }

  focus () {
    this.containerContents.dom.focus()
  }

  blur () {
    this.containerContents.dom.blur()
  }

  override destroy () {
    if (this.destroyed) {
      return
    }

    this.containerContents.dom.removeEventListener('focus', this.#onContentFocus)
    this.containerContents.dom.removeEventListener('blur', this.#onContentBlur)
    this.containerContents.dom.removeEventListener('keydown', this.#onContentKeyDown)
    this.containerContents.dom.removeEventListener('mousedown', this.#onContentMouseDown)
    this.containerContents.dom.removeEventListener('dragstart', this.#onContentDragStart)
    this.containerContents.dom.removeEventListener('mouseover', this.#onContentMouseOver)
    this.containerContents.dom.removeEventListener('click', this.#onContentClick)
    this.containerContents.dom.removeEventListener('dblclick', this.#onContentDblClick)
    this.containerContents.dom.removeEventListener('contextmenu', this.#onContentContextMenu)

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

    this.containerContents.dom.classList.toggle('tv-item-selected', value)

    if (value) {
      this.emit('select', this)
      this.treeView?._onChildSelected(this)
      this.focus()
    } else {
      this.blur()
      this.emit('deselect', this)
      this.treeView?._onChildDeselected(this)
    }
  }

  get selected (): boolean {
    return this.containerContents.dom.classList.contains('tv-item-selected')
  }

  /**
   * The text shown by the TreeViewItem.
   */
  set text (value: string) {
    if (this.#labelText.text !== value) {
      this.#labelText.text = value
      this.treeView?._onChildRename(this, value)
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
    const { children } = this.parent as Container

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
    const { children } = this.parent as Container

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
