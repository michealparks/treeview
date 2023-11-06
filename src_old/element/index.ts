/* eslint-disable no-underscore-dangle */
import * as tvClass from '../class'
import type { EventHandle } from '../event-handle'
import { Events } from '../events'

/*
 * These are properties that are
 * available as Element properties and
 * can also be set through the Element constructor
 */
const SIMPLE_CSS_PROPERTIES = [
  'flexDirection',
  'flexGrow',
  'flexBasis',
  'flexShrink',
  'flexWrap',
  'alignItems',
  'alignSelf',
  'justifyContent',
  'justifySelf',
]

export interface IBindable {
  /**
   * Gets / sets the value of the Element.
   */
  set value(values: any)
  get value(): any

  /**
   * Gets / sets multiple values to the Element. It is up to the Element to determine how to display them.
   */
  set values(values: any[])
  get values(): any[]

  /**
   * Gets / sets whether the input should flash on changes.
   */
  renderChanges: boolean
}

export interface IBindableArgs {
  /**
   * Sets the value of the Element.
   */
  value?: any
  /**
   * Sets multiple values to the Element. It is up to the Element to determine how to display them.
   */
  values?: any[]
  /**
   * If `true` each input will flash on changes.
   */
  renderChanges?: boolean
}

export interface IPlaceholder {
  /**
   * Gets / sets the placeholder text of the input.
   */
  set placeholder(value: string)
  get placeholder(): string
}

export interface IPlaceholderArgs {
  /**
   * Sets the placeholder label that appears on the right of the input.
   */
  placeholder?: string
}

export interface IFocusable {
  /**
   * Focus on the element. If the input contains text and select is provided, the text will be selected on focus.
   */
  focus(select?: boolean): void

  /**
   * Unfocus the element
   */
  blur(): void
}

export interface IParentArgs {
  /**
   * The children of the current component.
   */
  children?: any
}

export interface IFlexArgs {
  /**
   * Sets whether the Element supports flex layout.
   */
  flex?: boolean
  /**
   * Sets whether the Element supports the flex shrink property.
   */
  flexShrink?: number
  /**
   * Sets whether the Element supports the flex grow property.
   */
  flexGrow?: number
  /**
   * Sets the Elements flex direction property.
   */
  flexDirection?: string
}

/**
 * The arguments for the {@link Element} constructor.
 */
export interface ElementArgs {
  /**
   * The HTMLElement to create this {@link Element} with. If not provided this Element will create one.
   */
  dom?: HTMLElement | string
  /**
   * If provided and the {@link Element} is clickable, this function will be called each time the element is clicked.
   */
  onClick?: () => void
  /**
   * If provided and the {@link Element} is changeable, this function will be called each time the element value is changed.
   */
  onChange?: (value: any) => void
  /**
   * If provided and the {@link Element} is removable, this function will be called each time the element is removed.
   */
  onRemove?: () => void
  /**
   * Sets the parent {@link Element}.
   */
  parent?: Element
  /**
   * The id attribute of this {@link Element}'s HTMLElement.
   */
  id?: string
  /**
   * The class attribute of this {@link Element}'s HTMLElement.
   */
  class?: string | string[]
  /**
   * Sets whether this {@link Element} is at the root of the hierarchy.
   */
  isRoot?: boolean
  /**
   * Sets whether it is possible to interact with this {@link Element} and its children.
   */
  enabled?: boolean
  /**
   * Sets whether this {@link Element} is hidden. Defaults to `false`.
   */
  hidden?: boolean
  /**
   * If `true`, this {@link Element} will ignore its parent's enabled value when
   * determining whether this element is enabled. Defaults to `false`.
   */
  ignoreParent?: boolean,
  /**
   * Sets the initial width of the {@link Element}.
   */
  width?: number,
  /**
   * Sets the initial height of the {@link Element}.
   */
  height?: number,
  /**
   * Sets the tabIndex of the {@link Element}.
   */
  tabIndex?: number,
  /**
   * Sets whether the {@link Element} is in an error state.
   */
  error?: boolean,
  /**
   * Sets an initial value for Element.dom.style.
   */
  style?: string,
  /**
   * Whether this {@link Element} is read only or not. Defaults to `false`.
   */
  readOnly?: boolean
}

/**
 * The base class for all UI elements.
 */
export class Element extends Events {
  /**
   * Fired when the Element gets enabled.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element()
   * element.on('enable', () => {
   *     console.log('Element enabled');
   * });
   * ```
   */
  public static readonly EVENT_ENABLE = 'enable'

  /**
   * Fired when the Element gets disabled.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('disable', () => {
   *     console.log('Element disabled');
   * });
   * ```
   */
  public static readonly EVENT_DISABLE = 'disable'

  /**
   * Fired when the Element gets hidden.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('hide', () => {
   *     console.log('Element hidden');
   * });
   * ```
   */
  public static readonly EVENT_HIDE = 'hide'

  /**
   * Fired when the Element or any of its parent get hidden.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('hideToRoot', () => {
   *     console.log('Element or one of its parents hidden');
   * });
   * ```
   */
  public static readonly EVENT_HIDE_TO_ROOT = 'hideToRoot'

  /**
   * Fired when the Element stops being hidden.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('show', () => {
   *     console.log('Element shown');
   * });
   * ```
   */
  public static readonly EVENT_SHOW = 'show'

  /**
   * Fired when the Element and all of its parents become visible.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('showToRoot', () => {
   *     console.log('Element and all of its parents shown');
   * });
   * ```
   */
  public static readonly EVENT_SHOW_TO_ROOT = 'showToRoot'

  /**
   * Fired when the readOnly property of an Element changes.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('readOnly', (readOnly: boolean) => {
   *     console.log(`Element is now ${readOnly ? 'read only' : 'editable'}`);
   * });
   * ```
   */
  public static readonly EVENT_READ_ONLY = 'readOnly'

  /**
   * Fired when the Element's parent gets set.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('parent', (parent: Element) => {
   *     console.log(`Element's parent is now ${parent}`);
   * });
   * ```
   */
  public static readonly EVENT_PARENT = 'parent'

  /**
   * Fired when the mouse is clicked on the Element but only if the Element is enabled. The
   * native DOM MouseEvent is passed as a parameter to the event handler.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('click', (evt: MouseEvent) => {
   *     console.log('Element clicked');
   * });
   * ```
   */
  public static readonly EVENT_CLICK = 'click'

  /**
   * Fired when the mouse starts hovering on the Element. The native DOM MouseEvent is passed as a
   * parameter to the event handler.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('hover', (evt: MouseEvent) => {
   *     console.log('Element hovered');
   * });
   * ```
   */
  public static readonly EVENT_HOVER = 'hover'

  /**
   * Fired when the mouse stops hovering on the Element. The native DOM MouseEvent is passed as a
   * parameter to the event handler.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('hoverend', (evt: MouseEvent) => {
   *     console.log('Element hover ended');
   * });
   * ```
   */
  public static readonly EVENT_HOVER_END = 'hoverend'

  /**
   * Fired after the element has been destroyed. Both the DOM element and the owner Element
   * instance are passed as parameters to the event handler.
   *
   * @event
   * @example
   * ```ts
   * const element = new Element();
   * element.on('destroy', (dom: HTMLElement, element: Element) => {
   *     console.log('Element destroyed');
   * });
   * ```
   */
  public static readonly EVENT_DESTROY = 'destroy'

  protected _destroyed = false
  protected _parent: Element | null = null
  protected _eventsParent: EventHandle[] = []
  protected _dom: HTMLElement
  protected _hiddenParents: boolean
  protected _flashTimeout: number | null = null
  protected _suppressChange = false
  protected _ignoreParent = false
  protected _enabled = true
  protected _readOnly = false
  protected _hidden = false
  protected _hasError = false
  protected _domContent: HTMLElement | null = null

  constructor (args: Readonly<ElementArgs> = {}) {
    super()

    if (typeof args.dom === 'string') {
      this._dom = document.createElement(args.dom)
    } else if (args.dom instanceof Node) {
      this._dom = args.dom
    } else {
      this._dom = document.createElement('div')
    }

    if (args.id !== undefined) {
      this._dom.id = args.id
    }

    // Add ui reference
    this._dom.ui = this

    // Add event listeners
    this._dom.addEventListener('mouseover', this._onMouseOver)
    this._dom.addEventListener('mouseout', this._onMouseOut)

    // Add css classes
    this._dom.classList.add('tv-element', tvClass.FONT_REGULAR)

    // Add user classes
    if (args.class) {
      const classes = Array.isArray(args.class) ? args.class : [args.class]
      for (const cls of classes) {
        this._dom.classList.add(cls)
      }
    }

    this.enabled = args.enabled ?? true
    this._hiddenParents = !args.isRoot
    this.hidden = args.hidden ?? false
    this.readOnly = args.readOnly ?? false
    this.ignoreParent = args.ignoreParent ?? false

    if (args.width !== undefined) {
      this.width = args.width
    }
    if (args.height !== undefined) {
      this.height = args.height
    }
    if (args.tabIndex !== undefined) {
      this.tabIndex = args.tabIndex
    }

    // Copy CSS properties from args
    for (const key in args) {
      // @ts-expect-error todo
      if (args[key] === undefined) {
        continue
      }
      if (SIMPLE_CSS_PROPERTIES.indexOf(key) !== -1) {
        // @ts-expect-error todo
        this[key] = args[key]
      }
    }
  }

  /**
   * Destroys the Element and its events.
   */
  destroy () {
    if (this._destroyed) {
      return
    }

    this._destroyed = true

    if (this.parent) {
      const parent = this.parent

      for (const event of this._eventsParent) {
        event.unbind()
      }

      this._eventsParent.length = 0

      /*
       * Remove element from parent
       * Check if parent has been destroyed already
       * Because we do not want to be emitting events
       * On a destroyed parent after it's been destroyed
       * As it is easy to lead to null exceptions
       * @ts-ignore
       */
      if ('remove' in parent && !parent._destroyed) {
        // @ts-expect-error todo
        parent.remove(this)
      }

      /*
       * Set parent to null and remove from
       * parent dom just in case parent.remove above
       * didn't work because of an override or other condition
       */
      this._parent = null

      /*
       * Do not manually call removeChild for elements whose parent has already been destroyed.
       * For example when we destroy a TreeViewItem that has many child nodes,
       * that will trigger every child Element to call dom.parentElement.removeChild(dom).
       * But we don't need to remove all these DOM elements from their parents since the root DOM element is destroyed anyway.
       * This has a big impact on destroy speed in certain cases.
       */
      if (!parent._destroyed && this._dom && this._dom.parentElement) {
        this._dom.parentElement.removeChild(this._dom)
      }
    }

    const dom = this._dom
    if (dom) {
      // Remove event listeners
      dom.removeEventListener('mouseover', this._onMouseOver)
      dom.removeEventListener('mouseout', this._onMouseOut)

      // Remove ui reference

      // @ts-expect-error todo
      delete dom.ui

      // @ts-expect-error todo
      this._dom = null
    }

    if (this._flashTimeout) {
      window.clearTimeout(this._flashTimeout)
    }

    this.emit('destroy', dom, this)

    this.unbind()
  }

  /**
   * Triggers a flash animation on the Element.
   */
  flash () {
    if (this._flashTimeout) {
      return
    }

    this.class.add(tvClass.FLASH)
    this._flashTimeout = window.setTimeout(() => {
      this._flashTimeout = null
      this.class.remove(tvClass.FLASH)
    }, 200)
  }

  protected _onClick (evt: Event) {
    if (this.enabled) {
      this.emit('click', evt)
    }
  }

  protected _onMouseOver = (evt: MouseEvent) => {
    this.emit('hover', evt)
  }

  protected _onMouseOut = (evt: MouseEvent) => {
    this.emit('hoverend', evt)
  }

  protected _onHiddenToRootChange (hiddenToRoot: boolean) {
    this.emit(hiddenToRoot ? 'hideToRoot' : 'showToRoot')
  }

  protected _onEnabledChange (enabled: boolean) {
    if (enabled) {
      this.class.remove(tvClass.DISABLED)
    } else {
      this.class.add(tvClass.DISABLED)
    }

    this.emit(enabled ? 'enable' : 'disable')
  }

  protected _onParentDestroy () {
    this.destroy()
  }

  protected _onParentDisable () {
    if (this._ignoreParent) {
      return
    }
    if (this._enabled) {
      this._onEnabledChange(false)
    }
  }

  protected _onParentEnable () {
    if (this._ignoreParent) {
      return
    }
    if (this._enabled) {
      this._onEnabledChange(true)
    }
  }

  protected _onParentShowToRoot () {
    const oldHiddenToRoot = this.hiddenToRoot
    this._hiddenParents = false
    if (oldHiddenToRoot !== this.hiddenToRoot) {
      this._onHiddenToRootChange(this.hiddenToRoot)
    }
  }

  protected _onParentHideToRoot () {
    const oldHiddenToRoot = this.hiddenToRoot
    this._hiddenParents = true
    if (oldHiddenToRoot !== this.hiddenToRoot) {
      this._onHiddenToRootChange(this.hiddenToRoot)
    }
  }

  protected _onReadOnlyChange (readOnly: boolean) {
    if (readOnly) {
      this.class.add(tvClass.READONLY)
    } else {
      this.class.remove(tvClass.READONLY)
    }

    this.emit('readOnly', readOnly)
  }

  protected _onParentReadOnlyChange (readOnly: boolean) {
    if (this._ignoreParent) {
      return
    }
    if (readOnly) {
      if (!this._readOnly) {
        this._onReadOnlyChange(true)
      }
    } else if (!this._readOnly) {
      this._onReadOnlyChange(false)
    }
  }

  /**
   * Gets / sets whether the Element or its parent chain is enabled or not. Defaults to `true`.
   */
  set enabled (value: boolean) {
    if (this._enabled === value) {
      return
    }

    // Remember if enabled in hierarchy
    const enabled = this.enabled

    this._enabled = value

    // Only fire event if hierarchy state changed
    if (enabled !== value) {
      this._onEnabledChange(value)
    }
  }

  get enabled (): boolean {
    if (this._ignoreParent) {
      return this._enabled
    }
    return this._enabled && (!this._parent || this._parent.enabled)
  }

  /**
   * Gets / sets whether the Element will ignore parent events & variable states.
   */
  set ignoreParent (value) {
    this._ignoreParent = value
    this._onEnabledChange(this.enabled)
    this._onReadOnlyChange(this.readOnly)
  }

  get ignoreParent () {
    return this._ignoreParent
  }

  /**
   * Gets the root DOM node for this Element.
   */
  get dom (): HTMLElement {
    return this._dom
  }

  /**
   * Gets / sets the parent Element.
   */
  set parent (value: Element | null) {
    if (value === this._parent) {
      return
    }

    const oldEnabled = this.enabled
    const oldReadonly = this.readOnly
    const oldHiddenToRoot = this.hiddenToRoot

    if (this._parent) {
      for (let i = 0; i < this._eventsParent.length; i += 1) {
        this._eventsParent[i].unbind()
      }
      this._eventsParent.length = 0
    }

    this._parent = value

    if (this._parent) {
      this._eventsParent.push(this._parent.once('destroy', this._onParentDestroy.bind(this)))
      this._eventsParent.push(this._parent.on('disable', this._onParentDisable.bind(this)))
      this._eventsParent.push(this._parent.on('enable', this._onParentEnable.bind(this)))
      this._eventsParent.push(this._parent.on('readOnly', this._onParentReadOnlyChange.bind(this)))
      this._eventsParent.push(this._parent.on('showToRoot', this._onParentShowToRoot.bind(this)))
      this._eventsParent.push(this._parent.on('hideToRoot', this._onParentHideToRoot.bind(this)))

      this._hiddenParents = this._parent.hiddenToRoot
    } else {
      this._hiddenParents = true
    }

    this.emit('parent', this._parent)

    const newEnabled = this.enabled
    if (newEnabled !== oldEnabled) {
      this._onEnabledChange(newEnabled)
    }

    const newReadonly = this.readOnly
    if (newReadonly !== oldReadonly) {
      this._onReadOnlyChange(newReadonly)
    }

    const hiddenToRoot = this.hiddenToRoot
    if (hiddenToRoot !== oldHiddenToRoot) {
      this._onHiddenToRootChange(hiddenToRoot)
    }
  }

  get parent (): Element | null {
    return this._parent
  }

  /**
   * Gets / sets whether the Element is hidden.
   */
  set hidden (value: boolean) {
    if (value === this._hidden) {
      return
    }

    const oldHiddenToRoot = this.hiddenToRoot

    this._hidden = value

    if (value) {
      this.class.add(tvClass.HIDDEN)
    } else {
      this.class.remove(tvClass.HIDDEN)
    }

    this.emit(value ? 'hide' : 'show')

    if (this.hiddenToRoot !== oldHiddenToRoot) {
      this._onHiddenToRootChange(this.hiddenToRoot)
    }
  }

  get hidden (): boolean {
    return this._hidden
  }


  /**
   * Gets whether the Element is hidden all the way up to the root.
   * If the Element itself or any of its parents are hidden then this is true.
   */
  get hiddenToRoot (): boolean {
    return this._hidden || this._hiddenParents
  }


  /**
   * Gets / sets whether the Element is read only.
   */
  set readOnly (value: boolean) {
    if (this._readOnly === value) {
      return
    }
    this._readOnly = value

    this._onReadOnlyChange(value)
  }

  get readOnly (): boolean {
    if (this._ignoreParent) {
      return this._readOnly
    }
    return this._readOnly || Boolean(this._parent?.readOnly)
  }


  /**
   * Gets / sets whether the Element is in an error state.
   */
  set error (value: boolean) {
    if (this._hasError === value) {
      return
    }
    this._hasError = value
    if (value) {
      this.class.add(tvClass.ERROR)
    } else {
      this.class.remove(tvClass.ERROR)
    }
  }

  get error (): boolean {
    return this._hasError
  }

  /**
   * Shortcut to Element.dom.style.
   */
  get style (): CSSStyleDeclaration {
    return this._dom.style
  }

  /**
   * Get the `DOMTokenList` of the underlying DOM element. This is essentially a shortcut to
   * `element.dom.classList`.
   */
  get class (): DOMTokenList {
    return this._dom.classList
  }

  /**
   * Gets / sets the width of the Element in pixels. Can also be an empty string to remove it.
   */
  set width (value: number | string) {
    this.style.width = typeof value === 'number'
      ? `${String(value)}px`
      : value
  }

  get width (): number {
    return this._dom.clientWidth
  }

  /**
   * Gets / sets the height of the Element in pixels. Can also be an empty string to remove it.
   */
  set height (value: number | string) {
    this.style.height = typeof value === 'number'
      ? `${String(value)}px`
      : value
  }

  get height (): number {
    return this._dom.clientHeight
  }

  /**
   * Gets / sets the tabIndex of the Element.
   */
  set tabIndex (value: number) {
    this._dom.tabIndex = value
  }

  get tabIndex (): number {
    return this._dom.tabIndex
  }

  get destroyed (): boolean {
    return this._destroyed
  }

  // CSS proxy accessors

  /**
   * Gets / sets the flex-direction CSS property.
   */
  set flexDirection (value) {
    this.style.flexDirection = value
  }

  get flexDirection () {
    return this.style.flexDirection
  }

  /**
   * Gets / sets the flex-grow CSS property.
   */
  set flexGrow (value) {
    this.style.flexGrow = value
  }

  get flexGrow () {
    return this.style.flexGrow
  }

  /**
   * Gets / sets the flex-basis CSS property.
   */
  set flexBasis (value) {
    this.style.flexBasis = value
  }

  get flexBasis () {
    return this.style.flexBasis
  }

  /**
   * Gets / sets the flex-shrink CSS property.
   */
  set flexShrink (value) {
    this.style.flexShrink = value
  }

  get flexShrink () {
    return this.style.flexShrink
  }

  /**
   * Gets / sets the flex-wrap CSS property.
   */
  set flexWrap (value) {
    this.style.flexWrap = value
  }

  get flexWrap () {
    return this.style.flexWrap
  }

  /**
   * Gets / sets the align-items CSS property.
   */
  set alignItems (value) {
    this.style.alignItems = value
  }

  get alignItems () {
    return this.style.alignItems
  }

  /**
   * Gets / sets the align-self CSS property.
   */
  set alignSelf (value) {
    this.style.alignSelf = value
  }

  get alignSelf () {
    return this.style.alignSelf
  }

  /**
   * Gets / sets the justify-content CSS property.
   */
  set justifyContent (value) {
    this.style.justifyContent = value
  }

  get justifyContent () {
    return this.style.justifyContent
  }

  /**
   * Gets / sets the justify-self CSS property.
   */
  set justifySelf (value) {
    this.style.justifySelf = value
  }

  get justifySelf () {
    return this.style.justifySelf
  }

  /*  Backwards Compatibility */
  // We should remove those after we migrate

  /** @ignore */
  set disabled (value: boolean) {
    this.enabled = !value
  }

  /** @ignore */
  get disabled (): boolean {
    return !this.enabled
  }

  /** @ignore */
  set element (value: HTMLElement) {
    this._dom = value
  }

  /** @ignore */
  get element (): HTMLElement {
    return this.dom
  }

  /** @ignore */
  set innerElement (value: HTMLElement | null) {
    this._domContent = value
  }

  /** @ignore */
  get innerElement (): HTMLElement | null {
    return this._domContent
  }
}

// Declare an additional property on the base Node interface that references the owner Element
declare global {
  interface Node { // eslint-disable-line no-unused-vars
      ui: Element;
  }
}