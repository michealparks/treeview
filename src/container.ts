/* eslint-disable no-underscore-dangle */
import { Element } from './element'

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
 * A container is the basic building block for Elements that are grouped together.
 * A container can contain any other element including other containers.
 * @augments Element
 */
export class Container extends Element {
  children: Element[] = []

  #scrollable = true

  /**
   * @name Container#append
   * @description Appends an element to the container.
   * @param {Element} element - The element to append.
   * @fires 'append'
   */
  append (element: Element) {
    this.dom.append(element.dom)
    this.children.push(element)
    this._onAppendChild(element)
  }

  /**
   * @name Container#appendBefore
   * @description Appends an element to the container before the specified reference element.
   * @param element - The element to append.
   * @param referenceElement - The element before which the element will be appended.
   * @fires 'append'
   */
  appendBefore (element: Element, referenceElement: Element) {
    const referenceDom = referenceElement?.dom as Node

    this.dom.insertBefore(element.dom, referenceDom)
    this.children.splice(this.children.indexOf(referenceElement), 0, element)

    this._onAppendChild(element)
  }

  /**
   * @name Container#appendAfter
   * @description Appends an element to the container just after the specified reference element.
   * @param element - The element to append.
   * @param referenceElement - The element after which the element will be appended.
   * @fires 'append'
   */
  appendAfter (element: Element, referenceElement: Element) {
    const referenceDom = referenceElement?.dom

    const elementBefore = referenceDom ? referenceDom.nextSibling : null
    if (elementBefore) {
      this.dom.insertBefore(element.dom, elementBefore)
      this.children.splice(this.children.indexOf(referenceElement) + 1, 0, element)
    } else {
      this.dom.append(element.dom)
      this.children.push(element)
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
    this.children.unshift(element)
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
    this.children.splice(this.children.indexOf(element), 1)

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
   * @name Container#clear
   * @description Clears all children from the container.
   * @fires 'remove' for each child element.
   */
  clear () {
    const { children } = this
    let i = children.length - 1

    while (i > -1) {
      const element = children[i]

      if (element !== this) {
        element.destroy()
      }

      i -= 1
    }

    this.dom.innerHTML = ''
  }

  _onAppendChild (element: Element) {
    element.parent = this
    this.emit('append', element)
  }

  _onRemoveChild (element: Element) {
    element.parent = null
    this.emit('remove', element)
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
}
