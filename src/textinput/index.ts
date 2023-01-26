/* eslint-disable no-underscore-dangle */
import * as tvClass from '../class'
import type { IBindableArgs, IPlaceholderArgs } from '../element'
import { InputElement, InputElementArgs } from '../input'

/**
 * The arguments for the {@link TextInput} constructor.
 */
export interface TextInputArgs extends InputElementArgs, IBindableArgs, IPlaceholderArgs {
  /**
   * A function that validates the value that is entered into the input and returns `true` if it
   * is valid or `false` otherwise. If `false` then the input will be set in an error state and
   * the value will not propagate to the binding.
   */
  onValidate?: (value: string) => boolean,
}

/**
 * The TextInput is an input element of type text.
 */
export class TextInput extends InputElement {
  protected _onValidate: ((value: string) => boolean) | undefined

  constructor (args: Readonly<TextInputArgs> = {}) {
    super(args)

    this.class.add('tv-text-input')

    if (args.onValidate) {
      this.onValidate = args.onValidate
    }
  }

  protected override _onInputChange () {
    if (this._suspendInputChangeEvt) {
      return
    }

    if (this._onValidate) {
      const error = !this._onValidate(this.value)
      this.error = error
      if (error) {
        return
      }
    } else {
      this.error = false
    }

    this.emit('change', this.value)
  }

  protected _updateValue (value: string | string[] | null) {
    this.class.remove(tvClass.MULTIPLE_VALUES)

    if (value && typeof (value) === 'object') {
      if (Array.isArray(value)) {
        let isObject = false
        for (let i = 0; i < value.length; i += 1) {
          if (value[i] && typeof value[i] === 'object') {
            isObject = true
            break
          }
        }

        value = isObject
          ? '[Not available]'
          : value.map((val) => {
            return val === null ? 'null' : val
          }).join(',')
      } else {
        value = '[Not available]'
      }
    }

    if (value === this.value) {
      return false
    }

    this._suspendInputChangeEvt = true
    this._domInput.value = (value === null || value === undefined)
      ? ''
      : String(value)
    this._suspendInputChangeEvt = false

    this.emit('change', value)

    return true
  }

  set value (value: string | string[]) {
    const changed = this._updateValue(value)

    if (changed) {
      // Reset error
      this.error = false
    }
  }

  get value (): string {
    return this._domInput.value
  }

  /* eslint accessor-pairs: 0 */
  set values (values: string[]) {
    const different = values.some((v) => v !== values[0])

    if (different) {
      this._updateValue(null)
      this.class.add(tvClass.MULTIPLE_VALUES)
    } else {
      this._updateValue(values[0])
    }
  }

  /**
   * Gets / sets the validate method for the input.
   */
  set onValidate (value) {
    this._onValidate = value
  }

  get onValidate () {
    return this._onValidate
  }
}
