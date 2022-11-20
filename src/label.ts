import { Node } from './node'

interface Args {
  /**
   * If true then the label can be clicked to select text.
   */
  allowTextSelection?: boolean
  text?: string
}

/**
 * The Label is a simple span element that displays some text.
 */
export class Label extends Node {
  #text = ''

  /**
   * Creates a new Label.
   */
  constructor (args: Args = {}) {
    super()

    this.dom.className = 'inline-block align-middle whitespace-nowrap label m-1.5 overflow-hidden text-ellipsis select-none'
    this.text = args.text ?? ''

    if (args.allowTextSelection) {
      this.dom.classList.add('default-mousedown')
    }
  }

  /**
   * The text of the Label.
   */
  set text (value: string) {
    if (this.#text === value) {
      return
    }

    this.#text = value
    this.dom.textContent = value
    this.emit('change', value)
  }

  get text (): string {
    return this.#text
  }
}
