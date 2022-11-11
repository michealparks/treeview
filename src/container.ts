/* eslint-disable no-underscore-dangle */
import * as pcuiClass from './class'
import { Element } from './element'

const RESIZE_HANDLE_SIZE = 4

const CLASS_DRAGGED = `container-dragged`

/**
 * @event
 * @name Container#append
 * @description Fired when a child Element gets added to the Container
 * @param {Element} element - The element that was added
 */

/**
 * @event
 * @name Container#remove
 * @description Fired when a child Element gets removed from the Container
 * @param {Element} element - The element that was removed
 */

/**
 * @event
 * @name Container#scroll
 * @description Fired when the container is scrolled.
 * @param {Event} evt - The native scroll event.
 */

/**
 * @event
 * @name Container#resize
 * @description Fired when the container gets resized using the resize handle.
 */

interface Args {
  flex?: boolean
  grid?: boolean
  resizable?: 'top' | 'right' | 'bottom' | 'left' | null
  resizeMin?: number
  resizeMax?: number

  /**
   * The DOM element to use for the container. If unspecified a new element will be created.
   */
  dom?: HTMLElement
}

/**
 * A container is the basic building block for Elements that are grouped together.
 * A container can contain any other element including other containers.
 * @augments Element
 */
export class Container extends Element {
  resizeMin = 100
  resizeMax = 300

  #scrollable = false
  #resizable: 'top' | 'right' | 'bottom' | 'left' | null = null
  #resizeHorizontally = false
  #draggedStartIndex = -1
  #domResizeHandle: HTMLElement | null = null
  #resizeData: null | {
    x: number
    y: number
    width: number
    height: number
  } = null

  /**
   * Creates a new Container.
   */
  constructor (args: Args = {}) {
    super(args)

    if (args.flex) {
      this.dom.classList.add('flex', 'flex-col')
    } else if (args.grid) {
      this.dom.classList.add('grid')
    }

    this.resizable = args.resizable ?? null
  }

  /**
   * @name Container#append
   * @description Appends an element to the container.
   * @param {Element} element - The element to append.
   * @fires 'append'
   */
  append (element: Element) {
    this.dom.append(element.dom)
    this._onAppendChild(element)
  }

  /**
   * @name Container#appendBefore
   * @description Appends an element to the container before the specified reference element.
   * @param element - The element to append.
   * @param referenceElement - The element before which the element will be appended.
   * @fires 'append'
   */
  appendBefore (element: Element, referenceElement?: Element) {
    this.dom.append(element.dom)
    const referenceDom = referenceElement?.dom as Node

    this.dom.insertBefore(element.dom, referenceDom)

    this._onAppendChild(element)
  }

  /**
   * @name Container#appendAfter
   * @description Appends an element to the container just after the specified reference element.
   * @param element - The element to append.
   * @param referenceElement - The element after which the element will be appended.
   * @fires 'append'
   */
  appendAfter (element: Element, referenceElement?: Element) {
    const referenceDom = referenceElement?.dom

    const elementBefore = referenceDom ? referenceDom.nextSibling : null
    if (elementBefore) {
      this.dom.insertBefore(element.dom, elementBefore)
    } else {
      this.dom.appendChild(element.dom)
    }

    this._onAppendChild(element)
  }

  /**
   * @name Container#prepend
   * @description Inserts an element in the beginning of the container.
   * @param {Element} element - The element to prepend.
   * @fires 'append'
   */
  prepend (element: Element) {
    this.dom.prepend(element.dom)
    this._onAppendChild(element)
  }

  /**
   * @name Container#remove
   * @description Removes the specified child element from the container.
   * @param {Element} element - The element to remove.
   * @fires 'remove'
   */
  remove (element: Element) {
    if (element.parent !== this) {
      return
    }

    this.dom.removeChild(element.dom)

    this._onRemoveChild(element)
  }

  /**
   * @name Container#move
   * @description Moves the specified child at the specified index.
   * @param {Element} element - The element to move.
   * @param {number} index - The index
   */
  move (element: Element, index: number) {
    let idx = -1
    for (let i = 0, l = this.dom.childNodes.length; i < l; i += 1) {
      // @ts-expect-error @TODO fix
      if (this.dom.childNodes[i].ui === element) {
        idx = i
        break
      }
    }

    if (idx === -1) {
      // @ts-expect-error @TODO fix
      this.appendBefore(element, this.dom.childNodes[index].ui)
    } else if (index !== idx) {
      this.remove(element)
      if (index < idx) {
        // @ts-expect-error @TODO fix
        this.appendBefore(element, this.dom.childNodes[index].ui)
      } else {
        // @ts-expect-error @TODO fix
        this.appendAfter(element, this.dom.childNodes[index - 1].ui)
      }
    }
  }

  /**
   * @name Container#clear
   * @description Clears all children from the container.
   * @fires 'remove' for each child element.
   */
  clear () {
    const { childNodes } = this.dom
    let i = childNodes.length - 1

    while (i > -1) {
      const node = this.dom.childNodes[i]

      // @ts-expect-error @TODO fix
      if (node.ui && node.ui !== this) {
        // @ts-expect-error @TODO fix
        node.ui.destroy()
      }

      i -= 1
    }

    if (this.#domResizeHandle !== null) {
      this.#domResizeHandle.removeEventListener('mousedown', this._onResizeStart)
      this.#domResizeHandle = null
    }

    this.dom.innerHTML = ''

    if (this.resizable) {
      this._createResizeHandle()
      this.dom.appendChild(this.#domResizeHandle!)
    }
  }

  _onAppendChild (element: Element) {
    element.parent = this
    this.emit('append', element)
  }

  _onRemoveChild (element: Element) {
    element.parent = null
    this.emit('remove', element)
  }

  _onScroll = (evt: Event) => {
    this.emit('scroll', evt)
  }

  _createResizeHandle () {
    const handle = document.createElement('div')
    handle.classList.add('resizable-handle')
    // @ts-expect-error @TODO fix
    handle.ui = this

    handle.addEventListener('mousedown', this._onResizeStart)

    this.#domResizeHandle = handle
  }

  _onResizeStart = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    window.addEventListener('mousemove', this._onResizeMove)
    window.addEventListener('mouseup', this._onResizeEnd)

    this.#resizeStart()
  }

  _onResizeMove = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    this.#resizeMove(evt.clientX, evt.clientY)
  }

  _onResizeEnd = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    window.removeEventListener('mousemove', this._onResizeMove)
    window.removeEventListener('mouseup', this._onResizeEnd)

    this.#resizeEnd()
  }

  #resizeStart () {
    this.dom.classList.add('resizable-resizing')
  }

  #resizeMove (x: number, y: number) {
    // If we haven't initialized resizeData do so now
    if (!this.#resizeData) {
      this.#resizeData = {
        height: this.dom.clientHeight,
        width: this.dom.clientWidth,
        x,
        y,
      }

      return
    }

    if (this.#resizeHorizontally) {
      // Horizontal resizing
      let offsetX = this.#resizeData.x - x

      if (this.#resizable === 'right') {
        offsetX = -offsetX
      }

      this.width = RESIZE_HANDLE_SIZE + Math.max(this.resizeMin, Math.min(this.resizeMax, (this.#resizeData.width + offsetX)))
    } else {
      // Vertical resizing
      let offsetY = this.#resizeData.y - y

      if (this.#resizable === 'bottom') {
        offsetY = -offsetY
      }

      this.height = Math.max(this.resizeMin, Math.min(this.resizeMax, (this.#resizeData.height + offsetY)))
    }

    this.emit('resize')
  }

  #resizeEnd () {
    this.#resizeData = null
    this.dom.classList.remove('resizable-resizing')
  }

  /**
   * Resize the container
   *
   * @param x - The amount of pixels to resize the width
   * @param y - The amount of pixels to resize the height
   */
  resize (x = 0, y = 0) {
    this.#resizeStart()
    this.#resizeMove(0, 0)
    this.#resizeMove(-x + RESIZE_HANDLE_SIZE, -y)
    this.#resizeEnd()
  }

  #getDraggedChildIndex (draggedChild: Element) {
    const { childNodes } = this.dom
    for (let i = 0, l = childNodes.length; i < l; i += 1) {
      // @ts-expect-error @TODO fix
      if (childNodes[i].ui === draggedChild) {
        return i
      }
    }

    return -1
  }

  _onChildDragStart (_evt: Event, childPanel: Element) {
    this.#draggedStartIndex = this.#getDraggedChildIndex(childPanel)

    childPanel.dom.classList.add(CLASS_DRAGGED)

    this.emit('child:dragstart', childPanel, this.#draggedStartIndex)
  }

  _onChildDragMove (evt: MouseEvent, childPanel: Element) {
    const rect = this.dom.getBoundingClientRect()

    const dragOut = (evt.clientX < rect.left || evt.clientX > rect.right || evt.clientY < rect.top || evt.clientY > rect.bottom)

    const childPanelIndex = this.#getDraggedChildIndex(childPanel)

    if (dragOut) {
      childPanel.dom.classList.remove(CLASS_DRAGGED)
      if (this.#draggedStartIndex !== childPanelIndex) {
        this.remove(childPanel)
        if (this.#draggedStartIndex < childPanelIndex) {
          // @ts-expect-error @TODO fix
          this.appendBefore(childPanel, this.dom.childNodes[this.#draggedStartIndex].ui)
        } else {
          // @ts-expect-error @TODO fix
          this.appendAfter(childPanel, this.dom.childNodes[this.#draggedStartIndex - 1].ui)
        }
      }

      return
    }

    childPanel.dom.classList.add(CLASS_DRAGGED)

    const y = evt.clientY - rect.top
    let index = -1

    // Hovered script
    const { childNodes } = this.dom
    for (let i = 0, l = childNodes.length; i < l; i += 1) {
      // @ts-expect-error @TODO fix
      const otherPanel = childNodes[i].ui
      const otherTop = otherPanel.dom.offsetTop
      if (i < childPanelIndex) {
        if (y <= otherTop + otherPanel.header.height) {
          index = i
          break
        }
      } else if (i > childPanelIndex) {
        if (y + childPanel.height >= otherTop + otherPanel.height) {
          index = i
          break
        }
      }
    }

    if (index > -1 && childPanelIndex !== index) {
      this.remove(childPanel)
      if (index < childPanelIndex) {
        // @ts-expect-error @TODO fix
        this.appendBefore(childPanel, childNodes[index].ui)
      } else {
        // @ts-expect-error @TODO fix
        this.appendAfter(childPanel, childNodes[index - 1].ui)
      }
    }
  }

  _onChildDragEnd (_evt: Event, childPanel: Element) {
    childPanel.dom.classList.remove(CLASS_DRAGGED)

    const index = this.#getDraggedChildIndex(childPanel)

    this.emit('child:dragend', childPanel, index, this.#draggedStartIndex)

    this.#draggedStartIndex = -1
  }

  forEachChild (fn: (node: Element, i: number) => boolean | void) {
    for (let i = 0, l = this.dom.childNodes.length; i < l; i += 1) {
      // @ts-expect-error @TODO fix
      const node = this.dom.childNodes[i].ui
      if (node) {
        const result = fn(node, i)
        if (result === false) {
          // Early out
          break
        }
      }
    }
  }

  override destroy () {
    if (this.destroyed) {
      return
    }

    if (this.#domResizeHandle !== null) {
      this.#domResizeHandle.removeEventListener('mousedown', this._onResizeStart)
      window.removeEventListener('mousemove', this._onResizeMove)
      window.removeEventListener('mouseup', this._onResizeEnd)
    }

    this.#domResizeHandle = null

    super.destroy()
  }

  set scrollable (value) {
    if (this.#scrollable === value) {
      return
    }

    this.#scrollable = value

    if (value) {
      this.dom.classList.add('overflow-auto')
    } else {
      this.dom.classList.remove('overflow-auto')
    }
  }

  get scrollable () {
    return this.#scrollable
  }

  set resizable (value: 'top' | 'right' | 'bottom' | 'left' | null) {
    if (value === this.#resizable) {
      return
    }

    // Remove old class
    if (this.#resizable) {
      this.dom.classList.remove(`resizable-${this.#resizable}`)
    }

    this.#resizable = value
    this.#resizeHorizontally = (value === 'right' || value === 'left')

    if (value) {
      // Add resize class and create / append resize handle
      this.dom.classList.add('resizable', `resizable-${value}`)

      if (this.#domResizeHandle === null) {
        this._createResizeHandle()
      }
      this.dom.appendChild(this.#domResizeHandle!)
    } else {
      // Remove resize class and resize handle
      this.dom.classList.remove('resizable')
      if (this.#domResizeHandle !== null) {
        this.dom.removeChild(this.#domResizeHandle)
      }
    }
  }

  get resizable () {
    return this.#resizable
  }
}
