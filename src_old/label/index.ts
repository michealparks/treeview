/* eslint-disable no-underscore-dangle */
import * as tvClass from '../class'
import { Element, ElementArgs, IBindable, IBindableArgs, IFlexArgs, IPlaceholder, IPlaceholderArgs } from '../element'

const CLASS_LABEL = 'tv-label'

/**
 * The arguments for the {@link Label} constructor.
 */
export interface LabelArgs extends ElementArgs, IBindableArgs, IPlaceholderArgs, IFlexArgs {
  /**
   * Sets the text of the Label. Defaults to ''.
   */
  text?: string,
  /**
   * If `true`, the {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML innerHTML} property will be
   * used to set the text. Otherwise, {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent textContent}
   * will be used instead. Defaults to `false`.
   */
  unsafe?: boolean,
  /**
   * If `true` then use the text of the label as the native HTML tooltip. Defaults to `false`.
   */
  nativeTooltip?: boolean,
  /**
   * If `true` then the label can be clicked to select text. Defaults to `false`.
   */
  allowTextSelection?: boolean,
  /**
   * The DOM element or its type to use for this component. Defaults to 'span'.
   */
  dom?: HTMLElement | string,
  /**
   * Sets the value of the Label. Defaults to ''.
   */
  value?: string
}

/**
 * The Label is a simple span element that displays some text.
 */
export class Label extends Element implements IPlaceholder, IBindable {
  protected _unsafe: boolean
  protected _text = ''
  renderChanges = false

  constructor (args: Readonly<LabelArgs> = {}) {
    super({ dom: 'span', ...args })

    this.class.add(CLASS_LABEL)

    this._unsafe = args.unsafe ?? false
    this.text = args.text ?? args.value ?? ''

    if (args.allowTextSelection) {
      this.class.add(tvClass.DEFAULT_MOUSEDOWN)
    }

    if (args.nativeTooltip) {
      this.dom.title = this.text
    }
    this.placeholder = args.placeholder ?? null
    this.renderChanges = args.renderChanges ?? false

    this.on('change', () => {
      if (this.renderChanges) {
        this.flash()
      }
    })
  }

  protected _updateText (value: string) {
    this.class.remove(tvClass.MULTIPLE_VALUES)

    if (this._text === value) {
      return false
    }

    this._text = value

    if (this._unsafe) {
      this._dom.innerHTML = value
    } else {
      this._dom.textContent = value
    }

    this.emit('change', value)

    return true
  }

  /**
   * Gets / sets the text of the Label.
   */
  set text (value: string | null) {
    this._updateText(value ?? '')
  }

  get text (): string {
    return this._text
  }

  set value (value: string) {
    this.text = value
  }

  get value (): string {
    return this.text
  }

  /* eslint accessor-pairs: 0 */
  set values (values: string[]) {
    const different = values.some((v) => v !== values[0])

    if (different) {
      this._updateText('')
      this.class.add(tvClass.MULTIPLE_VALUES)
    } else {
      this._updateText(values[0])
    }
  }

  set placeholder (value: string | null) {
    if (value) {
      this.dom.setAttribute('placeholder', value)
    } else {
      this.dom.removeAttribute('placeholder')
    }
  }

  get placeholder (): string {
    return this.dom.getAttribute('placeholder') ?? ''
  }
}
