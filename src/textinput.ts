/* eslint-disable no-underscore-dangle */
import { Element } from './element'

interface Args {
  value?: string
}

/**
 * The TextInput is an input element of type text.
 * @augments Element
 * @property {HTMLElement} input Gets the HTML input element.
 */
export class TextInput extends Element {
  /**
   * A function that validates the value that is entered into the input
   * and returns true if it is valid or false otherwise.
   */
  onValidate: null | ((value: string) => boolean) = null

  /**
   * If true then the TextInput will flash when its text changes.
   * @default false
   */
  renderChanges = false

  #keyChange = false
  #suspendInputChangeEvt = false
  #prevValue = ''

  /**
   * Creates a new TextInput.
   *
   * @param {object} args - Extends the Element constructor arguments. All settable properties can also be set through the constructor.
   */
  constructor (args: Args = {}) {
    const dom = document.createElement('input')

    super({ dom, ...args })

    dom.className = 'text-input relative font-mono text-[11px] pl-1.5'
    dom.tabIndex = 0
    dom.autocomplete = 'off'

    dom.addEventListener('change', this.#onInputChange)
    dom.addEventListener('focus', this.#onInputFocus)
    dom.addEventListener('keydown', this.#onInputKeyDown)
    dom.addEventListener('contextmenu', this.#onInputCtxMenu, false)

    if (args.value !== undefined) {
      this.value = args.value
    }

    this.on('change', () => {
      if (this.renderChanges) {
        this.flash()
      }
    })

    this.on('disable', this.#updateInputReadOnly)
    this.on('enable', this.#updateInputReadOnly)
    this.on('readOnly', this.#updateInputReadOnly)
    this.#updateInputReadOnly()
  }

  #onInputChange = (_evt: Event) => {
    if (this.#suspendInputChangeEvt) {
      return
    }

    if (this.onValidate) {
      const error = !this.onValidate(this.value)
      this.error = error
      if (error) {
        return
      }
    } else {
      this.error = false
    }

    this.emit('change', this.value)
  }

  #onInputFocus = () => {
    this.#prevValue = this.value
  }

  #onInputKeyDown = (evt: KeyboardEvent) => {
    const lowerKey = evt.key.toLowerCase()
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
        this.#onInputChange(evt)
      }

      dom.blur()
    }

    this.emit('keydown', evt)
  }

  #onInputKeyUp = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape') {
      this.#onInputChange(evt)
    }

    this.emit('keyup', evt)
  }

  #onInputCtxMenu = (_evt: Event) => {
    (this.dom as HTMLInputElement).select()
  }

  #updateInputReadOnly = () => {
    const readOnly = !this.enabled || this.readOnly
    if (readOnly) {
      this.dom.setAttribute('readonly', 'readonly')
    } else {
      this.dom.removeAttribute('readonly')
    }
  }

  #updateValue (value: string | null | undefined) {
    const dom = this.dom as HTMLInputElement

    if (value === this.value) {
      return false
    }

    this.#suspendInputChangeEvt = true
    dom.value = value ?? ''
    this.#suspendInputChangeEvt = false

    this.emit('change', value)

    return true
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
    if (this.destroyed) {
      return
    }
    this.dom.removeEventListener('change', this.#onInputChange)
    this.dom.removeEventListener('focus', this.#onInputFocus)
    this.dom.removeEventListener('keydown', this.#onInputKeyDown)
    this.dom.removeEventListener('keyup', this.#onInputKeyUp)
    this.dom.removeEventListener('contextmenu', this.#onInputCtxMenu)
    super.destroy()

    // @ts-expect-error Destroy!
    this.dom = null
  }

  set value (value: string) {
    const changed = this.#updateValue(value)

    if (changed) {
      // Reset error
      this.error = false
    }
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
