/* eslint-disable max-classes-per-file */
import css from './resize.css?inline'

type Sides = 'top' | 'right' | 'bottom' | 'left'

const RESIZE_HANDLE_SIZE = 3

interface Options {
  css?: string
}

export class Element {
  dom = document.createElement('div')
  shadow = this.dom.attachShadow({ mode: 'open' })
  root = document.createElement('div')

  constructor (opts: Options = {}) {
    if (opts.css !== undefined) {
      const style = document.createElement('style')
      style.textContent = opts.css
      this.shadow.append(style)
    }

    this.root.innerHTML = '<slot></slot>'

    this.shadow.append(this.root)
  }

  append (node: HTMLElement): void {
    node.setAttribute('slot', '')
    this.dom.append(node)
  }

  set width (value: number) {
    this.root.style.width = `${value}px`
  }

  get width (): number {
    return this.root.clientWidth
  }

  set height (value: number) {
    this.root.style.height = `${value}px`
  }

  get height (): number {
    return this.root.clientHeight
  }
}

export class Resize extends Element {
  resizeMin = 100
  resizeMax = 300
  #resizable: Sides | null = null
  #resizeHorizontally = false
  #x = 0
  #y = 0
  #width = 0
  #height = 0
  #handle = document.createElement('div')

  constructor () {
    super({ css })
    this.root.classList.add('resize')
    this.#handle.className = 'handle'
    this.#handle.addEventListener('mousedown', this.#onResizeStart)
    this.root.append(this.#handle)
  }

  #onResizeMove = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (this.#resizeHorizontally) {
      let offsetX = this.#x - event.clientX

      if (this.#resizable === 'right') {
        offsetX = -offsetX
      }

      this.width = RESIZE_HANDLE_SIZE + Math.max(this.resizeMin, Math.min(this.resizeMax, (this.#width + offsetX)))
    } else {
      let offsetY = this.#y - event.clientY

      if (this.#resizable === 'bottom') {
        offsetY = -offsetY
      }

      this.height = Math.max(this.resizeMin, Math.min(this.resizeMax, (this.#height + offsetY)))
    }
  }

  #onResizeStart = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    this.#x = event.clientX
    this.#y = event.clientY
    this.#width = this.dom.clientWidth
    this.#height = this.dom.clientHeight

    window.addEventListener('mousemove', this.#onResizeMove)
    window.addEventListener('mouseup', this.#onResizeEnd)

    this.dom.classList.add('opacity-100')
  }

  #onResizeEnd = (evt: MouseEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    window.removeEventListener('mousemove', this.#onResizeMove)
    window.removeEventListener('mouseup', this.#onResizeEnd)

    this.dom.classList.remove('opacity-100')
  }

  set resizable (value: Sides | null) {
    if (value === this.#resizable) {
      return
    }

    if (this.#resizable !== null) {
      this.#handle.classList.remove(this.#resizable)
    }

    this.#resizable = value
    this.#resizeHorizontally = (value === 'right' || value === 'left')

    // Add resize class and create / append resize handle
    if (value !== null) {
      this.#handle.classList.add(value)
    }
  }

  get resizable () {
    return this.#resizable
  }
}
