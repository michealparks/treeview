/* eslint-disable no-underscore-dangle */
import { Container } from './container'

const RESIZE_HANDLE_SIZE = 4

/**
 * @event
 * @name Container#resize
 * @description Fired when the container gets resized using the resize handle.
 */

interface Args {
  dom?: HTMLElement
  side?: 'top' | 'right' | 'bottom' | 'left'
  resizeMin?: number
  resizeMax?: number
}

/**
 * A container is the basic building block for Elements that are grouped together.
 * A container can contain any other element including other containers.
 * @augments Element
 */
export class Resizable extends Container {
  resizeMin = 100
  resizeMax = 300
  #resizable: 'top' | 'right' | 'bottom' | 'left' = 'top'
  #resizeHorizontally = false
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
  constructor (args: Args) {
    super(args)
    this.resizable = args.side ?? 'top'
  }

  /**
   * @name Container#clear
   * @description Clears all children from the container.
   * @fires 'remove' for each child element.
   */
  override clear () {
    super.clear()

    if (this.#domResizeHandle !== null) {
      this.#domResizeHandle.removeEventListener('mousedown', this.#onResizeStart)
      this.#domResizeHandle = null
    }

    this.#createResizeHandle()
    this.dom.appendChild(this.#domResizeHandle!)
  }

  #createResizeHandle () {
    const handle = document.createElement('div')
    handle.className = 'resizable-handle absolute z-[1000] opacity-50 hover:opacity-100'

    handle.addEventListener('mousedown', this.#onResizeStart)

    this.#domResizeHandle = handle
  }

  #onResizeStart = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    window.addEventListener('mousemove', this.#onResizeMove)
    window.addEventListener('mouseup', this.#onResizeEnd)

    this.#resizeStart()
  }

  #onResizeMove = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    this.#resizeMove(evt.clientX, evt.clientY)
  }

  #onResizeEnd = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    window.removeEventListener('mousemove', this.#onResizeMove)
    window.removeEventListener('mouseup', this.#onResizeEnd)

    this.#resizeEnd()
  }

  #resizeStart () {
    this.dom.classList.add('opacity-100')
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
    this.dom.classList.remove('opacity-100')
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

  override destroy () {
    if (this.destroyed) {
      return
    }

    if (this.#domResizeHandle !== null) {
      this.#domResizeHandle.removeEventListener('mousedown', this.#onResizeStart)
      window.removeEventListener('mousemove', this.#onResizeMove)
      window.removeEventListener('mouseup', this.#onResizeEnd)
    }

    this.#domResizeHandle = null

    super.destroy()
  }

  set resizable (value: 'top' | 'right' | 'bottom' | 'left') {
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
        this.#createResizeHandle()
      }
      this.dom.append(this.#domResizeHandle!)
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
