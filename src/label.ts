import { Element } from './element'

interface Args {
  /**
   * If true then the label can be clicked to select text.
   */
  allowTextSelection?: boolean
  dom?: HTMLElement
  text?: string
  renderChanges?: boolean
}

/**
 * The Label is a simple span element that displays some text.
 */
export class Label extends Element {
  /**
   * If true then the Label will flash when its text changes.
   */
  renderChanges = false

  #text = ''

  /**
   * Creates a new Label.
   */
  constructor (args: Args = {}) {
    super(args)

    this.dom.classList.add(
      'inline-block',
      'align-middle',
      'whitespace-nowrap',
      'label',
      'm-1.5',
      'overflow-hidden',
      'text-ellipsis',
      'select-none'
    )

    this.text = args.text ?? ''
    this.renderChanges = args.renderChanges ?? false

    if (args.allowTextSelection) {
      this.dom.classList.add('default-mousedown')
    }

    this.on('change', () => {
      if (this.renderChanges) {
        this.flash()
      }
    })
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
