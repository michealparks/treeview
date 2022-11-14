/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { Container } from './container'
import type { Element } from './element'
import { Label } from './label'

const CLASS_ContextMenu_active = 'contextmenu-active'
const CLASS_ContextMenu_parent = 'contextmenu-parent'
const CLASS_ContextMenu_child = 'contextmenu-child'
const CLASS_ContextMenu_parent_active = 'contextmenu-parent-active'

interface Item {
  text: string,
  onClick?: (event: MouseEvent) => void
  items?: Item[]
}

interface Args {
  triggerElement?: HTMLElement
  dom?: HTMLElement
  items: Item[]
}

/**
 * Represents a context menu.
 */
export class ContextMenu {
  #menu: Container

  /**
   * Creates a new ContextMenu.
   * @param {object[]} [args.items] - The array of items used to populate the array.
   * @param {object} [args.dom] - The dom element to attach this context menu to.
   * @param {object} [args.triggerElement] - Will trigger the context menu to open when right clicked. If undefined args.dom will be used.
   */
  constructor (args: Args) {
    this.#menu = new Container(args)

    // @ts-expect-error @TODO fix
    this.#menu.contextMenu = this
    this.#menu.dom.classList.add('contextmenu')
    const menu = this.#menu

    const triggerElement = args.triggerElement ?? args.dom?.parentElement

    if (triggerElement) {
      triggerElement.addEventListener('contextmenu', (event) => {
        event.preventDefault()
        event.stopPropagation()

        menu.dom.classList.add(CLASS_ContextMenu_active)
        const maxMenuHeight = args.items.length * 27.0
        const maxMenuWidth = 150.0

        let { clientX, clientY } = event
        if ((maxMenuHeight + clientY) > window.innerHeight) {
          const topDiff = (maxMenuHeight + clientY) - window.innerHeight
          clientY -= topDiff
        }
        if ((maxMenuWidth + clientX) > window.innerWidth) {
          const leftDiff = (maxMenuWidth + clientX) - window.innerWidth
          clientX -= leftDiff
        }
        menu.dom.setAttribute('style', `left: ${clientX}px; top: ${clientY}px`)
        document.addEventListener('click', this.removeMenu)
      })

      let mouseLeaveTimeout = -1
      menu.dom.addEventListener('mouseleave', () => {
        mouseLeaveTimeout = setTimeout(this.removeMenu, 500)
      })
      menu.dom.addEventListener('mouseenter', () => {
        if (mouseLeaveTimeout > -1) {
          clearTimeout(mouseLeaveTimeout)
          mouseLeaveTimeout = -1
        }
      })
    }

    for (let i = 0, l = args.items.length; i < l; i += 1) {
      this.addItem(args.items[i], i)
    }
  }

  removeMenu = () => {
    this.#menu.dom.classList.remove(CLASS_ContextMenu_active)
    document.removeEventListener('click', this.removeMenu)
  }

  addItem (menuItem: Item, index: number) {
    const menuItemElement = new Container()
    menuItemElement.dom.setAttribute('style', `top: ${index * 27.0}px`)
    if (menuItem.onClick) {
      menuItemElement.on('click', (event: MouseEvent) => {
        event.stopPropagation()
        this.removeMenu()
        menuItem.onClick?.(event)
      })
    }

    const menuItemLabel = new Label({ text: menuItem.text })
    menuItemElement.append(menuItemLabel)
    this.#menu.dom.append(menuItemElement.dom)
    if (menuItem.items) {
      menuItem.items.forEach((childItem, j) => {
        const childMenuItemElement = new Container()
        childMenuItemElement.dom.classList.add(CLASS_ContextMenu_child)
        childMenuItemElement.dom.setAttribute('style', `top: ${j * 27.0}px; left: 150px;`)
        childMenuItemElement.on('click', (event: MouseEvent) => {
          event.stopPropagation()
          this.removeMenu()
          childItem.onClick?.(event)
        })
        const childMenuItemLabel = new Label({ text: childItem.text })
        childMenuItemElement.append(childMenuItemLabel)
        menuItemElement.append(childMenuItemElement)
      })
      menuItemElement.dom.classList.add(CLASS_ContextMenu_parent)
    }
    menuItemElement.dom.addEventListener('mouseover', (event: MouseEvent) => {
      // If (!e.fromElement.classList.contains('contextmenu-parent')) return;
      this.#menu.children.forEach((node: Element) => {
        node.dom.classList.remove(CLASS_ContextMenu_parent_active)
      })
      menuItemElement.dom.classList.add(CLASS_ContextMenu_parent_active)

      const maxMenuHeight = menuItem.items ? menuItem.items.length * 27.0 : 0.0
      const maxMenuWidth = 150.0
      const left = event.clientX + maxMenuWidth > window.innerWidth ? -maxMenuWidth + 2.0 : maxMenuWidth
      let top = 0
      if (event.clientY + maxMenuHeight > window.innerHeight) {
        top = -maxMenuHeight + 27.0
      }

      menuItemElement.children.forEach((node: Element, j: number) => {
        if (j === 0) {
          return
        }

        // eslint-disable-next-line no-mixed-operators
        node.dom.setAttribute('style', `top: ${top + (j - 1) * 27.0}px; left: ${left}px;`)
      })
    })
  }
}
