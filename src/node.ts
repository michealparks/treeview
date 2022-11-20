interface Args {
  tagName?: string
  hidden?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventListener<Type = any> = (...args: Type[]) => void

export class Node {
  #events: Record<string, EventListener[] | undefined> = {}
  #hidden = false

  parent: Node | null = null
  children: Node[] = []
  dom: HTMLElement

  constructor (args: Args = {}) {
    this.dom = document.createElement(args.tagName ?? 'div')
    this.hidden = args.hidden ?? false
  }

  destroy () {
    this.parent?.remove(this)
    this.dom.remove()
    this.#events = {}
  }

  on <Type> (name: string, fn: EventListener<Type>): this {
    const events = this.#events[name]

    if (events === undefined) {
      this.#events[name] = [fn]
    } else if (events.indexOf(fn) === -1) {
      events.push(fn)
    }

    return this
  }

  off (name?: string, fn?: EventListener): this {
    if (name === undefined) {
      this.#events = {}
      return this
    }

    if (fn === undefined) {
      delete this.#events[name]
      return this
    }

    const events = this.#events[name]
    events?.splice(events.indexOf(fn), 1)

    return this
  }

  once (name: string, fn: EventListener): this {
    this.on(name, (...args) => {
      fn(...args)
      this.off('name', fn)
    })

    return this
  }

  emit (name: string, ...args: unknown[]): this {
    const events = [...this.#events[name] ?? []]

    for (let i = 0, l = events.length; i < l; i += 1) {
      events[i](...args)
    }

    return this
  }

  /**
   * Appends a node to the container.
   * @param node - The node to append.
   */
  append (node: Node) {
    this.dom.append(node.dom)
    this.children.push(node)
    this.onAppend(node)
  }

  /**
   * Appends a node to this node before the specified reference node.
   * @param node - The node to append.
   * @param referenceNode - The node before which the node will be appended.
   */
  appendBefore (node: Node, referenceNode: Node) {
    this.dom.insertBefore(node.dom, referenceNode.dom)
    this.children.splice(this.children.indexOf(referenceNode), 0, node)
    this.onAppend(node)
  }

  /**
   * Appends a node just after the specified reference node.
   * @param node - The node to append.
   * @param referenceNode - The node after which the node will be appended.
   */
  appendAfter (node: Node, referenceNode: Node) {
    this.dom.insertBefore(node.dom, referenceNode.dom)
    this.children.splice(this.children.indexOf(referenceNode) + 1, 0, node)
    this.onAppend(node)
  }

  /**
   * Inserts a node at the beginning index.
   * @param node - The node to prepend.
   */
  prepend (node: Node) {
    this.dom.prepend(node.dom)
    this.children.unshift(node)
    this.onAppend(node)
  }

  /**
   * Removes the specified child node from the container.
   * @param node - The node to remove.
   */
  remove (node: Node) {
    node.dom.parentNode?.removeChild(node.dom)
    this.children.splice(this.children.indexOf(node), 1)
    node.parent = null
  }

  /**
   * Moves the specified child at the specified index.
   * @param element - The element to move.
   * @param index - The index
   */
  move (element: Node, index: number) {
    let idx = -1
    for (let i = 0, l = this.dom.childNodes.length; i < l; i += 1) {
      if (this.children[i] === element) {
        idx = i
        break
      }
    }

    if (idx === -1) {
      this.appendBefore(element, this.children[index])
    } else if (index !== idx) {
      this.remove(element)
      if (index < idx) {
        this.appendBefore(element, this.children[index])
      } else {
        this.appendAfter(element, this.children[index - 1])
      }
    }
  }

  /**
   * @description Clears all children from the node.
   */
  clear () {
    const { children } = this
    let i = children.length - 1

    while (i > -1) {
      const element = children[i]
      element.destroy()
      i -= 1
    }

    this.dom.innerHTML = ''
  }

  onAppend (node: Node) {
    node.parent = this
  }

  set hidden (value: boolean) {
    this.#hidden = value
    this.dom.classList.toggle('hidden', value)
  }

  get hidden (): boolean {
    return this.#hidden
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
