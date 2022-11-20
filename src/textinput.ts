/* eslint-disable no-underscore-dangle */
import { Node } from './node'

interface Args {
  value?: string
}

/**
 * The TextInput is an input element of type text.
 */
export class TextInput extends Node {
  #keyChange = false
  #suspendInputChangeEvt = false
  #prevValue = ''

  /**
   * Creates a new TextInput.
   *
   * @param {object} args - Extends the Element constructor arguments. All settable properties can also be set through the constructor.
   */
  constructor (args: Args = {}) {
    super({ tagName: 'input' })

    const dom = this.dom as HTMLInputElement
    dom.className = 'text-input relative font-mono text-[11px] pl-1.5'
    dom.tabIndex = 0
    dom.autocomplete = 'off'

    dom.addEventListener('blur', this.#onBlur)
    dom.addEventListener('change', this.#onInputChange)
    dom.addEventListener('focus', this.#onInputFocus)
    dom.addEventListener('keydown', this.#onInputKeyDown)
    dom.addEventListener('contextmenu', this.#onInputCtxMenu, false)

    if (args.value !== undefined) {
      this.value = args.value
    }
  }

  #onBlur = () => {
    this.emit('blur')
  }

  #onInputChange = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()

    if (this.#suspendInputChangeEvt) {
      return
    }

    this.emit('change', this.value)
  }

  #onInputFocus = () => {
    this.#prevValue = this.value
  }

  #onInputKeyDown = (event: KeyboardEvent) => {
    const lowerKey = event.key.toLowerCase()
    const dom = this.dom as HTMLInputElement

    if (lowerKey === 'enter') {
      /*
       * Do not fire input change event on blur
       * if keyChange is true (because a change event)
       * will have already been fired before for the current
       * value
       */
      this.#suspendInputChangeEvt = this.keyChange
      dom.blur()
      this.#suspendInputChangeEvt = false
    } else if (lowerKey === 'escape') {
      this.#suspendInputChangeEvt = true
      const prev = dom.value
      dom.value = this.#prevValue
      this.#suspendInputChangeEvt = false

      // Manually fire change event
      if (this.keyChange && prev !== this.#prevValue) {
        this.#onInputChange(event)
      }

      dom.blur()
    }
  }

  #onInputKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.#onInputChange(event)
    }
  }

  #onInputCtxMenu = () => {
    (this.dom as HTMLInputElement).select()
  }

  /**
   * @name TextInput#focus
   * @description Focuses the Element.
   * @param {boolean} select - If true then this will also select the text after focusing.
   */
  focus (select: boolean) {
    const input = this.dom as HTMLInputElement
    input.focus()
    if (select) {
      input.select()
    }
  }

  /**
   * @name TextInput#blur
   * @description Blurs (unfocuses) the Element.
   */
  blur () {
    this.dom.blur()
  }

  override destroy () {
    super.destroy()
    this.dom.removeEventListener('blur', this.#onBlur)
    this.dom.removeEventListener('change', this.#onInputChange)
    this.dom.removeEventListener('focus', this.#onInputFocus)
    this.dom.removeEventListener('keydown', this.#onInputKeyDown)
    this.dom.removeEventListener('keyup', this.#onInputKeyUp)
    this.dom.removeEventListener('contextmenu', this.#onInputCtxMenu)
  }

  set value (value: string) {
    const dom = this.dom as HTMLInputElement

    if (value === this.value) {
      return
    }

    this.#suspendInputChangeEvt = true
    dom.value = value
    this.#suspendInputChangeEvt = false

    this.emit('change', value)
  }

  get value () {
    return (this.dom as HTMLInputElement).value
  }

  /**
   * Whether any key up event will cause a change event to be fired.
   */
  set keyChange (value) {
    if (this.#keyChange === value) {
      return
    }

    this.#keyChange = value
    if (value) {
      this.dom.addEventListener('keyup', this.#onInputKeyUp)
    } else {
      this.dom.removeEventListener('keyup', this.#onInputKeyUp)
    }
  }

  get keyChange () {
    return this.#keyChange
  }
}
