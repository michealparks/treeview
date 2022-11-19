/* eslint-disable no-underscore-dangle */
import type { Container } from './container'
import type { EventHandle } from './event-handle'
import { Events } from './events'

/**
 * @event
 * @name Element#enable
 * @description Fired when the Element gets enabled
 */

/**
 * @event
 * @name Element#disable
 * @description Fired when the Element gets disabled
 */

/**
 * @event
 * @name Element#hide
 * @description Fired when the Element gets hidden
 */

/**
 * @event
 * @name Element#hideToRoot
 * @description Fired when the Element or any of its parent get hidden
 */

/**
 * @event
 * @name Element#show
 * @description Fired when the Element stops being hidden
 */

/**
 * @event
 * @name Element#showToRoot
 * @description Fired when the Element and all of its parents become visible
 */

/**
 * @event
 * @name Element#readOnly
 * @param {boolean} readOnly - Whether the Element is now read only
 * @description Fired when the readOnly property of an Element changes
 */

/**
 * @event
 * @name Element#parent
 * @description Fired when the Element's parent gets set
 * @param {Element} parent - The new parent
 */

/**
 * @event
 * @name Element#click
 * @description Fired when the mouse is clicked on the Element but only if the Element is enabled.
 * @param {Event} evt - The native mouse event.
 */

/**
 * @event
 * @name Element#hover
 * @description Fired when the mouse starts hovering on the Element
 * @param {Event} evt - The native mouse event.
 */

/**
 * @event
 * @name Element#hoverend
 * @description Fired when the mouse stops hovering on the Element
 * @param {Event} evt - The native mouse event.
 */

/**
 * @event
 * @name Element#destroy
 * @description Fired after the element has been destroyed.
 * @param {HTMLElement} dom - The DOM element
 * @param {Element} element - The element
 */

/**
 * @event
 * @name Element#hoverend
 * @description Fired when the mouse stops hovering on the Element
 * @param {Event} evt - The native mouse event.
 */

interface Args {
  dom?: HTMLElement
  enabled?: boolean
  isRoot?: boolean
  hidden?: boolean
}

/**
 * @name Element
 * @class
 * @classdesc The base class for all UI elements.
 * @augments Events

 * @property {number} [width=null] Gets / sets the width of the Element in pixels. Can also be an empty string to remove it.
 * @property {number} [height=null] Gets / sets the height of the Element in pixels. Can also be an empty string to remove it.
 * @property {boolean} error Gets / sets whether the Element is in an error state.
 */
export class Element extends Events {
  destroyed = false
  #enabled = true
  #ignoreParent = false
  // eslint-disable-next-line no-use-before-define
  #parent: Element | null = null
  #flashTimeout = -1
  #hiddenParents = false
  #hidden = false
  #readOnly = false
  #eventsParent: EventHandle[] = []

  /**
   * The root DOM node for this Element.
   */
  dom: HTMLElement

  /**
   * Creates a new Element.
   *
   * @param {object} args - The arguments. All settable properties can also be set through the constructor.
   * @param {object} [args.dom] - The DOM element that this Element wraps.
   * @param {boolean} [args.isRoot] - If true then this is the root element. Set this to true for the topmost Element in your page.
   */
  constructor (args: Args = {}) {
    super()

    this.dom = args.dom ?? document.createElement('div')
    this.#hiddenParents = !args.isRoot
    this.enabled = args.enabled ?? true
    this.hidden = args.hidden ?? false
  }

  /**
   * @name Element#flash
   * @description Triggers a flash animation on the Element.
   */
  flash () {
    if (this.#flashTimeout > -1) {
      return
    }

    this.dom.classList.add('flash')
    this.#flashTimeout = setTimeout(() => {
      this.#flashTimeout = -1
      this.dom.classList.remove('flash')
    }, 200)
  }

  #onHiddenToRootChange (hiddenToRoot: boolean) {
    if (hiddenToRoot) {
      this.emit('hideToRoot')
    } else {
      this.emit('showToRoot')
    }
  }

  #onEnabledChange (enabled: boolean) {
    this.dom.classList.toggle('disabled', !enabled)
    this.emit(enabled ? 'enable' : 'disable')
  }

  #onParentDestroy = () => {
    this.destroy()
  }

  #onParentDisable = () => {
    if (this.#ignoreParent) {
      return
    }

    if (this.#enabled) {
      this.#onEnabledChange(false)
    }
  }

  #onParentEnable = () => {
    if (this.#ignoreParent) {
      return
    }

    if (this.#enabled) {
      this.#onEnabledChange(true)
    }
  }

  #onParentShowToRoot = () => {
    const oldHiddenToRoot = this.hiddenToRoot
    this.#hiddenParents = false
    if (oldHiddenToRoot !== this.hiddenToRoot) {
      this.#onHiddenToRootChange(this.hiddenToRoot)
    }
  }

  #onParentHideToRoot = () => {
    const oldHiddenToRoot = this.hiddenToRoot
    this.#hiddenParents = true
    if (oldHiddenToRoot !== this.hiddenToRoot) {
      this.#onHiddenToRootChange(this.hiddenToRoot)
    }
  }

  #onReadOnlyChange (readOnly: boolean) {
    this.dom.classList.toggle('readonly', readOnly)
    this.emit('readOnly', readOnly)
  }

  #onParentReadOnlyChange = (readOnly: boolean) => {
    if (this.#ignoreParent) {
      return
    }

    if (readOnly) {
      if (!this.#readOnly) {
        this.#onReadOnlyChange(true)
      }
    } else if (!this.#readOnly) {
      this.#onReadOnlyChange(false)
    }
  }

  /**
   * Destroys the Element and its events.
   */
  destroy () {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    if (this.parent) {
      const parent = this.parent

      for (let i = 0, l = this.#eventsParent.length; i < l; i += 1) {
        this.#eventsParent[i].unbind()
      }
      this.#eventsParent.slice(0, this.#eventsParent.length)

      /*
       * Remove element from parent
       * Check if parent has been destroyed already
       * Because we do not want to be emitting events
       * On a destroyed parent after it's been destroyed
       * As it is easy to lead to null exceptions
       */
      const container = parent as Container
      if ('remove' in container && !parent.destroyed) {
        container.remove(this)
      }

      /*
       * Set parent to null and remove from
       * parent dom just in case parent.remove above
       * didn't work because of an override or other condition
       */
      this.#parent = null

      /*
       * Do not manually call removeChild for elements whose parent has already been destroyed.
       * For example when we destroy a TreeViewItem that has many child nodes,
       * that will trigger every child Element to call dom.parentElement.removeChild(dom).
       * But we don't need to remove all these DOM elements from their parents since the root DOM element is destroyed anyway.
       * This has a big impact on destroy speed in certain cases.
       */
      if (!parent.destroyed && this.dom?.parentElement) {
        this.dom.parentElement.removeChild(this.dom)
      }
    }

    // @ts-expect-error Destroy!
    this.dom = null

    if (this.#flashTimeout > -1) {
      clearTimeout(this.#flashTimeout)
    }

    this.emit('destroy', this.dom, this)

    this.unbind()
  }

  /**
   * Whether the Element or its parent chain is enabled or not.
   * @default true
   */
  set enabled (value: boolean) {
    if (this.#enabled === value) {
      return
    }

    // Remember if enabled in hierarchy
    const { enabled } = this

    this.#enabled = value

    // Only fire event if hierarchy state changed
    if (enabled !== value) {
      this.#onEnabledChange(value)
    }
  }

  get enabled (): boolean {
    if (this.#ignoreParent) {
      return this.#enabled
    }
  
    return this.#enabled && (!this.#parent || this.#parent.enabled)
  }

  /**
   * Gets / sets whether the Element will ignore parent events & variable states.
   */
  set ignoreParent (value) {
    this.#ignoreParent = value
    this.#onEnabledChange(this.enabled)
    this.#onReadOnlyChange(this.readOnly)
  }

  get ignoreParent () {
    return this.#ignoreParent
  }

  /**
   * The parent Element.
   */
  set parent (value) {
    if (value === this.#parent) {
      return
    }

    const oldEnabled = this.enabled
    const oldReadonly = this.readOnly
    const oldHiddenToRoot = this.hiddenToRoot

    if (this.#parent) {
      for (let i = 0, l = this.#eventsParent.length; i < l; i += 1) {
        this.#eventsParent[i].unbind()
      }
      this.#eventsParent.length = 0
    }

    this.#parent = value

    if (this.#parent) {
      this.#eventsParent.push(this.#parent.once('destroy', this.#onParentDestroy))
      this.#eventsParent.push(this.#parent.on('disable', this.#onParentDisable))
      this.#eventsParent.push(this.#parent.on('enable', this.#onParentEnable))
      this.#eventsParent.push(this.#parent.on('readOnly', this.#onParentReadOnlyChange))
      this.#eventsParent.push(this.#parent.on('showToRoot', this.#onParentShowToRoot))
      this.#eventsParent.push(this.#parent.on('hideToRoot', this.#onParentHideToRoot))

      this.#hiddenParents = this.#parent.hiddenToRoot
    } else {
      this.#hiddenParents = true
    }

    this.emit('parent', this.#parent)

    const newEnabled = this.enabled
    if (newEnabled !== oldEnabled) {
      this.#onEnabledChange(newEnabled)
    }

    const newReadonly = this.readOnly
    if (newReadonly !== oldReadonly) {
      this.#onReadOnlyChange(newReadonly)
    }

    const hiddenToRoot = this.hiddenToRoot
    if (hiddenToRoot !== oldHiddenToRoot) {
      this.#onHiddenToRootChange(hiddenToRoot)
    }
  }

  get parent () {
    return this.#parent
  }

  /**
   * Gets / sets whether the Element is hidden.
   */
  set hidden (value: boolean) {
    if (value === this.#hidden) {
      return
    }

    const oldHiddenToRoot = this.hiddenToRoot

    this.#hidden = value

    this.dom.classList.toggle('hidden', value)

    this.emit(value ? 'hide' : 'show')

    if (this.hiddenToRoot !== oldHiddenToRoot) {
      this.#onHiddenToRootChange(this.hiddenToRoot)
    }
  }

  get hidden (): boolean {
    return this.#hidden
  }

  /**
   * Gets whether the Element is hidden all the way up to the root.
   * If the Element itself or any of its parents are hidden then this is true.
   */
  get hiddenToRoot (): boolean {
    return this.#hidden || this.#hiddenParents
  }

  /**
   * Whether the Element is read only.
   */
  set readOnly (value: boolean) {
    if (this.#readOnly === value) {
      return
    }
    this.#readOnly = value

    this.#onReadOnlyChange(value)
  }

  get readOnly (): boolean {
    if (this.#ignoreParent) {
      return this.#readOnly
    }
    return this.#readOnly || Boolean(this.#parent && this.#parent.readOnly)
  }

  #hasError = false

  set error (value: boolean) {
    if (this.#hasError === value) {
      return
    }
    this.#hasError = value
    this.dom.classList.toggle('error', value)
  }

  get error (): boolean {
    return this.#hasError
  }

  set width (value: number) {
    this.dom.style.width = `${value}px`
  }

  get width (): number {
    return this.dom.clientWidth
  }

  set height (value: number) {
    this.dom.style.height = `${value}px`
  }

  get height (): number {
    return this.dom.clientHeight
  }
}
