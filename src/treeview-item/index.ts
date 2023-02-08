/* eslint-disable no-underscore-dangle */
import * as tvClass from '../class'
import { Container, ContainerArgs } from '../container'
import type { Element } from '../element'
import { Label } from '../label'
import { TextInput } from '../textinput'

const CLASS_SELECTED = 'tv-treeview-item-selected'
const CLASS_OPEN = 'tv-treeview-item-open'
const CLASS_CONTENTS = 'tv-treeview-item-contents'
const CLASS_EMPTY = 'tv-treeview-item-empty'
const CLASS_RENAME = 'tv-treeview-item-rename'

/**
 * The arguments for the {@link TreeViewItem} constructor.
 */
export interface TreeViewItemArgs extends ContainerArgs {
  /**
   * Whether the item is selected.
   */
  selected?: boolean
  /**
   * Whether the item can be selected. Defaults to `true`.
   */
  allowSelect?: boolean
  /**
   * Whether the item is open meaning showing its children.
   */
  open?: boolean
  /**
   * Whether this {@link TreeViewItem} can be dragged. Only considered if the parent {@link TreeView}
   * has `allowDrag` set to `true`. Defaults to `true`.
   */
  allowDrag?: boolean
  /**
   * Whether dropping is allowed on the {@link TreeViewItem}. Defaults to `true`.
   */
  allowDrop?: boolean
  /**
   * The text shown by the {@link TreeViewItem}.
   */
  text?: string
  /**
   * The icon shown before the text in the {@link TreeViewItem}. Defaults to 'E360'.
   */
  icon?: string
  /**
   * Method to be called when the {@link TreeViewItem} is selected.
   */
  onSelect?: (deselect: () => void) => void
  /**
   * Method to be called when the {@link TreeViewItem} is deselected.
   */
  onDeselect?: () => void
}

/**
 * A TreeViewItem is a single node in a hierarchical {@link TreeView} control.
 */
export class TreeViewItem extends Container {
  /**
   * Fired when user selects the TreeViewItem.
   *
   * @event
   * @example
   * ```ts
   * treeViewItem.on('select', (item: TreeViewItem) => {
   *     console.log('TreeViewItem selected', item);
   * });
   * ```
   */
  public static readonly EVENT_SELECT = 'select'

  /**
   * Fired when user deselects the TreeViewItem.
   *
   * @event
   * @example
   * ```ts
   * treeViewItem.on('deselect', (item: TreeViewItem) => {
   *     console.log('TreeViewItem deselected', item);
   * });
   * ```
   */
  public static readonly EVENT_DESELECT = 'deselect'

  /**
   * Fired when user opens the TreeViewItem.
   *
   * @event
   * @example
   * ```ts
   * treeViewItem.on('open', (item: TreeViewItem) => {
   *     console.log('TreeViewItem opened', item);
   * });
   * ```
   */
  public static readonly EVENT_OPEN = 'open'

  /**
   * Fired when user closes the TreeViewItem.
   *
   * @event
   * @example
   * ```ts
   * treeViewItem.on('close', (item: TreeViewItem) => {
   *     console.log('TreeViewItem closed', item);
   * });
   * ```
   */
  public static readonly EVENT_CLOSE = 'close'

  protected _containerContents: Container
  protected _labelIcon: Label
  protected _labelText: Label
  protected _numChildren = 0
  protected _treeView: any
  protected _allowDrag = true
  protected _allowDrop = true
  protected _allowSelect = true
  protected _icon: string | undefined

  /**
   * Creates a new TreeViewItem.
   *
   * @param args - The arguments.
   */
  constructor (args: Readonly<TreeViewItemArgs> = {}) {
    super(args)

    this.class.add('tv-treeview-item', CLASS_EMPTY)

    this._containerContents = new Container({
      class: CLASS_CONTENTS,
      flex: true,
      flexDirection: 'row',
      tabIndex: 0,
    })
    this.append(this._containerContents)
    this._containerContents.dom.innerHTML +=
      '<svg class="icon-minus" viewBox="0 0 32 32"><path fill="#fff" d="M8 14.656h16v2.688h-16v-2.688z"></path></svg>'
    this._containerContents.dom.innerHTML +=
      // eslint-disable-next-line max-len
      '<svg class="icon-plus" viewBox="0 0 768 768"><path fill="#fff" d="M607.5 415.5h-192v192h-63v-192h-192v-63h192v-192h63v192h192v63z"></path></svg>'

    this._containerContents.dom.draggable = true

    this._labelIcon = new Label({
      class: 'tv-treeview-item-icon',
    })
    this._containerContents.append(this._labelIcon)

    this.icon = args.icon

    this._labelText = new Label({
      class: 'tv-treeview-item-text',
    })
    this._containerContents.append(this._labelText)

    this.allowSelect = args.allowSelect ?? true
    this.allowDrop = args.allowDrop ?? true
    this.allowDrag = args.allowDrag ?? true

    if (args.text) {
      this.text = args.text
    }

    if (args.selected) {
      this.selected = args.selected
    }

    const dom = this._containerContents.dom
    dom.addEventListener('focus', this._onContentFocus)
    dom.addEventListener('blur', this._onContentBlur)
    dom.addEventListener('keydown', this._onContentKeyDown)
    dom.addEventListener('dragstart', this._onContentDragStart)
    dom.addEventListener('mousedown', this._onContentMouseDown)
    dom.addEventListener('mouseover', this._onContentMouseOver)
    dom.addEventListener('click', this._onContentClick)
    dom.addEventListener('dblclick', this._onContentDblClick)
    dom.addEventListener('contextmenu', this._onContentContextMenu)
  }

  override destroy () {
    if (this._destroyed) {
      return
    }

    const { dom } = this._containerContents
    dom.removeEventListener('focus', this._onContentFocus)
    dom.removeEventListener('blur', this._onContentBlur)
    dom.removeEventListener('keydown', this._onContentKeyDown)
    dom.removeEventListener('dragstart', this._onContentDragStart)
    dom.removeEventListener('mousedown', this._onContentMouseDown)
    dom.removeEventListener('mouseover', this._onContentMouseOver)
    dom.removeEventListener('click', this._onContentClick)
    dom.removeEventListener('dblclick', this._onContentDblClick)
    dom.removeEventListener('contextmenu', this._onContentContextMenu)

    window.removeEventListener('mouseup', this._onContentMouseUp)

    super.destroy()
  }

  protected override _onAppendChild (element: Element) {
    super._onAppendChild(element)

    if (element instanceof TreeViewItem) {
      this._numChildren += 1
      if (this._parent !== this._treeView) {
        this.class.remove(CLASS_EMPTY)
      }

      if (this._treeView) {
        this._treeView._onAppendTreeViewItem(element)
      }
    }
  }

  protected override _onRemoveChild (element: Element) {
    if (element instanceof TreeViewItem) {
      this._numChildren -= 1
      if (this._numChildren === 0) {
        this.class.add(CLASS_EMPTY)
      }

      if (this._treeView) {
        this._treeView._onRemoveTreeViewItem(element)
      }
    }

    super._onRemoveChild(element)
  }

  protected _onContentKeyDown = (evt: KeyboardEvent) => {
    const element = evt.target as HTMLElement
    if (element.tagName === 'INPUT') {
      return
    }

    if (!this.allowSelect) {
      return
    }

    if (this._treeView) {
      this._treeView._onChildKeyDown(evt, this)
    }
  }

  protected _onContentMouseDown = (evt: MouseEvent) => {
    if (!this._treeView?.allowDrag || !this._allowDrag) {
      return
    }

    this._treeView._updateModifierKeys(evt)
    evt.stopPropagation()
  }

  protected _onContentMouseUp = (evt: MouseEvent) => {
    evt.stopPropagation()
    evt.preventDefault()

    window.removeEventListener('mouseup', this._onContentMouseUp)
    if (this._treeView) {
      this._treeView._onChildDragEnd(evt, this)
    }
  }

  protected _onContentMouseOver = (evt: MouseEvent) => {
    evt.stopPropagation()

    if (this._treeView) {
      this._treeView._onChildDragOver(evt, this)
    }

    this.emit('hover', evt)
  }

  protected _onContentDragStart = (evt: DragEvent) => {
    evt.stopPropagation()
    evt.preventDefault()

    if (!this._treeView?.allowDrag) {
      return
    }

    if (this.class.contains(CLASS_RENAME)) {
      return
    }

    this._treeView._onChildDragStart(evt, this)

    window.addEventListener('mouseup', this._onContentMouseUp)
  }

  protected _onContentClick = (evt: MouseEvent) => {
    if (!this.allowSelect || evt.button !== 0) {
      return
    }

    const element = evt.target as HTMLElement
    if (element.tagName === 'INPUT') {
      return
    }

    evt.stopPropagation()

    console.log(evt.currentTarget, evt.target)

    const rect = this._containerContents.dom.getBoundingClientRect()
    if (this._numChildren > 0 && evt.clientX - rect.left < 0) {
      this.open = !this.open
      if (evt.altKey) {
        // Apply to all children as well
        this._dfs((item: TreeViewItem) => {
          item.open = this.open
        })
      }
      this.focus()
    } else if (this._treeView) {
      this._treeView._onChildClick(evt, this)
    }
  }

  protected _dfs (fn: (item: TreeViewItem) => void) {
    fn(this)
    let child = this.firstChild
    while (child) {
      child._dfs(fn)
      child = child.nextSibling
    }
  }

  protected _onContentDblClick = (evt: MouseEvent) => {
    if (!this._treeView?.allowRenaming || evt.button !== 0) {
      return
    }

    const element = evt.target as HTMLElement
    if (element.tagName === 'INPUT') {
      return
    }

    evt.stopPropagation()
    const rect = this._containerContents.dom.getBoundingClientRect()
    if (this.numChildren && evt.clientX - rect.left < 0) {
      return
    }

    if (this.allowSelect) {
      this._treeView.deselect()
      this._treeView._onChildClick(evt, this)
    }

    this.rename()
  }

  protected _onContentContextMenu = (evt: MouseEvent) => {
    this._treeView?._onContextMenu?.(evt, this)
  }

  protected _onContentFocus = (_evt: FocusEvent) => {
    this.emit('focus')
  }

  protected _onContentBlur = (_evt: FocusEvent) => {
    this.emit('blur')
  }

  rename () {
    this.class.add(CLASS_RENAME)

    // Show text input to enter new text
    const textInput = new TextInput({
      class: tvClass.FONT_REGULAR,
      renderChanges: false,
      value: this.text,
    })

    textInput.on('blur', () => {
      textInput.destroy()
    })

    textInput.on('destroy', () => {
      this.class.remove(CLASS_RENAME)
      this.focus()
    })

    textInput.on('change', (value: string) => {
      const v = value.trim()
      if (v) {
        this.text = v
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

    this._containerContents.append(textInput)

    textInput.focus(true)
  }

  focus () {
    this._containerContents.dom.focus()
  }

  blur () {
    this._containerContents.dom.blur()
  }

  /**
   * Whether the item is selected.
   */
  set selected (value) {
    if (value === this.selected) {
      if (value) {
        this.focus()
      }

      return
    }

    if (value) {
      this._containerContents.class.add(CLASS_SELECTED)
      this.emit('select', this)
      if (this._treeView) {
        this._treeView._onChildSelected(this)
      }

      this.focus()
    } else {
      this._containerContents.class.remove(CLASS_SELECTED)
      this.blur()
      this.emit('deselect', this)
      if (this._treeView) {
        this._treeView._onChildDeselected(this)
      }
    }
  }

  get selected () {
    return this._containerContents.class.contains(CLASS_SELECTED)
  }

  /**
   * The text shown by the TreeViewItem.
   */
  set text (value) {
    if (this._labelText.value !== value) {
      this._labelText.value = value
      if (this._treeView) {
        this._treeView._onChildRename(this, value)
      }
    }
  }

  get text () {
    return this._labelText.value
  }

  /**
   * Gets the internal label that shows the text.
   */
  get textLabel () {
    return this._labelText
  }

  /**
   * Gets the internal label that shows the icon.
   */
  get iconLabel () {
    return this._labelIcon
  }

  /**
   * Whether the item is open meaning showing its children.
   */
  set open (value) {
    if (this.open === value) {
      return
    }
    if (value) {
      if (!this.numChildren) {
        return
      }

      this.class.add(CLASS_OPEN)
      this.emit('open', this)
    } else {
      this.class.remove(CLASS_OPEN)
      this.emit('close', this)
    }
  }

  get open () {
    return this.class.contains(CLASS_OPEN) || this.parent === this._treeView
  }

  /**
   * Whether the parents of the item are open or closed.
   */
  set parentsOpen (value) {
    let parent = this.parent
    while (parent && parent instanceof TreeViewItem) {
      parent.open = value
      parent = parent.parent
    }
  }

  get parentsOpen () {
    let parent = this.parent
    while (parent && parent instanceof TreeViewItem) {
      if (!parent.open) {
        return false
      }
      parent = parent.parent
    }

    return true
  }

  /**
   * Whether dropping is allowed on the tree item.
   */
  set allowDrop (value) {
    this._allowDrop = value
  }

  get allowDrop () {
    return this._allowDrop
  }

  /**
   * Whether this tree item can be dragged. Only considered if the parent treeview has allowDrag true.
   */
  set allowDrag (value) {
    this._allowDrag = value
  }

  get allowDrag () {
    return this._allowDrag
  }

  /**
   * Whether the item can be selected.
   */
  set allowSelect (value) {
    this._allowSelect = value
  }

  get allowSelect () {
    return this._allowSelect
  }

  /**
   * Gets / sets the parent TreeView.
   */
  set treeView (value) {
    this._treeView = value
  }

  get treeView () {
    return this._treeView
  }

  /**
   * The number of direct children.
   */
  get numChildren () {
    return this._numChildren
  }

  /**
   * Gets the first child item.
   */
  get firstChild (): null | TreeViewItem {
    if (this._numChildren) {
      for (let i = 0; i < this.dom.childNodes.length; i += 1) {
        if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
          return this.dom.childNodes[i].ui as TreeViewItem
        }
      }
    }

    return null
  }

  /**
   * Gets the last child item.
   */
  get lastChild (): null | TreeViewItem {
    if (this._numChildren) {
      for (let i = this.dom.childNodes.length - 1; i >= 0; i -= 1) {
        if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
          return this.dom.childNodes[i].ui as TreeViewItem
        }
      }
    }

    return null
  }

  /**
   * Gets the first sibling item.
   */
  get nextSibling () {
    let sibling = this.dom.nextSibling
    while (sibling && !(sibling.ui instanceof TreeViewItem)) {
      sibling = sibling.nextSibling
    }

    return sibling && sibling.ui as TreeViewItem
  }

  /**
   * Gets the last sibling item.
   */
  get previousSibling () {
    let sibling = this.dom.previousSibling
    while (sibling && !(sibling.ui instanceof TreeViewItem)) {
      sibling = sibling.previousSibling
    }

    return sibling && sibling.ui as TreeViewItem
  }

  /**
   * The icon shown before the text in the TreeViewItem.
   */
  set icon (value) {
    if (this._icon === value) {
      return
    }

    this._icon = value

    if (value) {
      // Set data-icon attribute but first convert the value to a code point
      this._labelIcon.dom.setAttribute('data-icon', String.fromCodePoint(Number.parseInt(value, 16)))
    } else {
      this._labelIcon.dom.style.display = 'none'
      this._labelIcon.dom.removeAttribute('data-icon')
    }
  }

  get icon () {
    return this._icon
  }
}
