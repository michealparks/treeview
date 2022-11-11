/* eslint-disable no-underscore-dangle */
import { Container } from './container'
import { Label } from './label'
import { TextInput } from './textinput'
import type { TreeView } from './main'

const CLASS_ROOT = 'treeview-item'
const CLASS_ICON = `treeview-item-icon`
const CLASS_TEXT = `treeview-item-text`
const CLASS_SELECTED = `treeview-item-selected`
const CLASS_OPEN = `treeview-item-open`
const CLASS_EMPTY = `treeview-item-empty`
const CLASS_RENAME = `treeview-item-rename`

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
 * @classdesc Represents a Tree View Item to be added to a pcui.TreeView.
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
   * Whether this tree item can be dragged. Only considered if the parent treeview has allowDrag true.
   * @default true
   */
  allowDrag = true

  /**
   * Whether dropping is allowed on the tree item.
   * @default true
   */
  allowDrop = true

  // Used the the parent treeview
  treeOrder = -1
  treeView: TreeView | undefined

  #numChildren = 0
  containerContents: Container
  #labelIcon: Label
  #labelText: Label
  #open = false
  #icon = ''

  /**
   * Creates a new TreeViewItem.
   */
  constructor (args: Args) {
    super({ flex: true, ...args })

    this.dom.classList.add(CLASS_ROOT, CLASS_EMPTY, 'relative', 'pl-8', 'h-[20px]')

    this.containerContents = new Container()
    this.containerContents.dom.classList.add(
      'treeview-item-contents',
      'relative',
      'flex',
      'flex-row',
      'items-center',
      'h-6'
    )

    this.containerContents.dom.tabIndex = 0
    this.append(this.containerContents)

    this.containerContents.dom.draggable = true

    this.#labelIcon = new Label()
    this.#labelIcon.dom.classList.add(CLASS_ICON)
    this.containerContents.append(this.#labelIcon)

    this.icon = args.icon ?? ''

    this.#labelText = new Label()
    this.#labelText.dom.classList.add(CLASS_TEXT)
    this.containerContents.append(this.#labelText)

    this.text = args.text
    this.selected = args.selected ?? false

    this.containerContents.dom.addEventListener('focus', this._onContentFocus)
    this.containerContents.dom.addEventListener('blur', this._onContentBlur)
    this.containerContents.dom.addEventListener('keydown', this._onContentKeyDown)
    this.containerContents.dom.addEventListener('dragstart', this._onContentDragStart)
    this.containerContents.dom.addEventListener('mousedown', this._onContentMouseDown)
    this.containerContents.dom.addEventListener('mouseover', this._onContentMouseOver)
    this.containerContents.dom.addEventListener('click', this._onContentClick)
    this.containerContents.dom.addEventListener('dblclick', this._onContentDblClick)
    this.containerContents.dom.addEventListener('contextmenu', this._onContentContextMenu)
  }

  override _onAppendChild (element: TreeViewItem) {
    super._onAppendChild(element)

    if (!(element instanceof TreeViewItem)) {
      return
    }

    this.#numChildren += 1
  
    if (this.parent !== this.treeView) {
      this.dom.classList.remove(CLASS_EMPTY)
    }

    this.treeView?._onAppendTreeViewItem(element)
  }

  override _onRemoveChild (element: TreeViewItem) {
    if (element instanceof TreeViewItem) {
      this.#numChildren -= 1
      if (this.#numChildren === 0) {
        this.dom.classList.add(CLASS_EMPTY)
      }

      this.treeView?._onRemoveTreeViewItem(element)
    }

    super._onRemoveChild(element)
  }

  _onContentKeyDown = (event: KeyboardEvent) => {
    if (
      (event.target as HTMLElement).tagName.toLowerCase() === 'input' ||
      !this.allowSelect
    ) {
      return
    }

    this.treeView?._onChildKeyDown(event, this)
  }

  _onContentMouseDown = (event: MouseEvent) => {
    if (this.treeView === undefined || !this.treeView.allowDrag || !this.allowDrag) {
      return
    }

    this.treeView._updateModifierKeys(event)
    event.stopPropagation()
  }

  _onContentMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    window.removeEventListener('mouseup', this._onContentMouseUp)

    this.treeView?._onChildDragEnd(event, this)
  }

  _onContentMouseOver = (event: MouseEvent) => {
    event.stopPropagation()
    this.treeView?._onChildDragOver(event, this)
  }

  _onContentDragStart = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (
      this.treeView === undefined ||
      !this.treeView.allowDrag ||
      this.dom.classList.contains(CLASS_RENAME)
    ) {
      return
    }

    this.treeView._onChildDragStart(event, this)

    window.addEventListener('mouseup', this._onContentMouseUp)
  }

  _onContentClick = (event: MouseEvent) => {
    if (!this.allowSelect || event.button !== 0) {
      return
    }

    if ((event.target as HTMLElement).tagName.toLowerCase() === 'input') {
      return
    }

    event.stopPropagation()

    const rect = this.containerContents.dom.getBoundingClientRect()

    if (this.#numChildren > 0 && event.clientX - rect.left < 0) {
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

  _onContentDblClick = (evt: MouseEvent): void => {
    if (!this.treeView || !this.treeView.allowRenaming || evt.button !== 0) {
      return
    }

    const target = evt.target as HTMLElement

    if (target.tagName.toLowerCase() === 'input') {
      return
    }

    evt.stopPropagation()
    const rect = this.containerContents.dom.getBoundingClientRect()
    if (this.numChildren && evt.clientX - rect.left < 0) {
      return
    }

    if (this.allowSelect) {
      this.treeView.deselect()
      this.treeView._onChildClick(evt, this)
    }

    this.rename()
  }

  _onContentContextMenu = (event: MouseEvent) => {
    this.treeView?.onContextMenu?.(event, this)
  }

  _onContentFocus = (event: FocusEvent) => {
    this.emit('focus', event)
  }

  _onContentBlur = (event: FocusEvent) => {
    this.emit('blur', event)
  }

  rename () {
    this.dom.classList.add(CLASS_RENAME)

    // Show text input to enter new text
    const textInput = new TextInput({
      value: this.text,
    })

    textInput.on('blur', () => {
      textInput.destroy()
    })

    textInput.on('destroy', () => {
      this.dom.classList.remove(CLASS_RENAME)
      this.focus()
    })

    textInput.on('change', (value: string) => {
      const normalized = value.trim()
      if (normalized) {
        this.text = normalized
        textInput.destroy()
      }
    })

    textInput.on('disable', () => {
      /*
       * Make sure text input is editable even if this
       * tree item is disabled
       */
      textInput.input.removeAttribute('readonly')
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

    this.containerContents.dom.removeEventListener('focus', this._onContentFocus)
    this.containerContents.dom.removeEventListener('blur', this._onContentBlur)
    this.containerContents.dom.removeEventListener('keydown', this._onContentKeyDown)
    this.containerContents.dom.removeEventListener('mousedown', this._onContentMouseDown)
    this.containerContents.dom.removeEventListener('dragstart', this._onContentDragStart)
    this.containerContents.dom.removeEventListener('mouseover', this._onContentMouseOver)
    this.containerContents.dom.removeEventListener('click', this._onContentClick)
    this.containerContents.dom.removeEventListener('dblclick', this._onContentDblClick)
    this.containerContents.dom.removeEventListener('contextmenu', this._onContentContextMenu)

    window.removeEventListener('mouseup', this._onContentMouseUp)

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

    if (value) {
      this.containerContents.dom.classList.add(CLASS_SELECTED)
      this.emit('select', this)
      if (this.treeView) {
        this.treeView._onChildSelected(this)
      }

      this.focus()
    } else {
      this.containerContents.dom.classList.remove(CLASS_SELECTED)
      this.blur()
      this.emit('deselect', this)
      if (this.treeView) {
        this.treeView._onChildDeselected(this)
      }
    }
  }

  get selected (): boolean {
    return this.containerContents.dom.classList.contains(CLASS_SELECTED)
  }

  /**
   * The text shown by the TreeViewItem.
   */
  set text (value: string) {
    if (this.#labelText.text !== value) {
      this.#labelText.text = value
      if (this.treeView) {
        this.treeView._onChildRename(this, value)
      }
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

    if (value) {
      this.dom.classList.add(CLASS_OPEN)
      this.emit('open', this)
    } else {
      this.dom.classList.remove(CLASS_OPEN)
      this.emit('close', this)
    }
  }

  get open (): boolean {
    return this.#open || this.parent === this.treeView
  }

  get numChildren (): number {
    return this.#numChildren
  }

  set parentsOpen (value: boolean) {
    let { parent } = this
    while (parent && parent instanceof TreeViewItem) {
      parent.open = value
      parent = parent.parent
    }
  }

  get parentsOpen (): boolean {
    let { parent } = this
    while (parent && parent instanceof TreeViewItem) {
      if (!parent.open) {
        return false
      }
      parent = parent.parent
    }

    return true
  }

  get firstChild (): TreeViewItem | null {
    if (this.#numChildren === 0) {
      return null
    }

    for (let i = 0, l = this.dom.childNodes.length; i < l; i += 1) {
      // @ts-expect-error @TODO Fix
      if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
        // @ts-expect-error @TODO Fix
        return this.dom.childNodes[i].ui
      }
    }

    return null
  }

  get lastChild (): TreeViewItem | null {
    if (this.#numChildren === 0) {
      return null
    }

    for (let i = this.dom.childNodes.length - 1; i >= 0; i -= 1) {
      // @ts-expect-error @TODO Fix
      if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
        // @ts-expect-error @TODO Fix
        return this.dom.childNodes[i].ui
      }
    }

    return null
  }

  get nextSibling (): TreeViewItem | null {
    let sibling = this.dom.nextSibling

    // @ts-expect-error @TODO Fix
    while (sibling && !(sibling.ui instanceof TreeViewItem)) {
      sibling = sibling.nextSibling
    }

    // @ts-expect-error @TODO Fix
    return sibling?.ui ?? null
  }

  get previousSibling (): TreeViewItem | null {
    let sibling = this.dom.previousSibling

    // @ts-expect-error @TODO Fix
    while (sibling && !(sibling.ui instanceof TreeViewItem)) {
      sibling = sibling.previousSibling
    }

    // @ts-expect-error @TODO Fix
    return sibling?.ui ?? null
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

export default TreeViewItem
