/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import { Events } from './events'
// @ts-expect-error todo
import type { History } from './history'
import type { IBindable } from './element'
// @ts-expect-error todo
import type { Observer } from './observer'

export interface BindingBaseArgs {
  /**
   * The IBindable element.
   */
  element?: IBindable
  /**
   * The history object which will be used to record undo / redo actions.
   * If none is provided then no history will be recorded.
   */
  history?: History
  /**
   * A prefix that will be used for the name of every history action.
   */
  historyPrefix?: string
  /**
   * A postfix that will be used for the name of every history action.
   */
  historyPostfix?: string
  /**
   * The name of each history action.
   */
  historyName?: string
  /**
   * Whether to combine history actions.
   */
  historyCombine?: boolean
}

/**
 * Base class for data binding between {@link IBindable} {@link Element}s and Observers.
 */
export class BindingBase extends Events {
  protected _observers: Observer[] = []
  protected _paths: string[] = []
  protected _applyingChange = false
  protected _element?: IBindable
  protected _history?: History
  protected _historyPrefix?: string
  protected _historyPostfix?: string
  protected _historyName?: string
  protected _historyCombine: boolean
  protected _linked = false

  /**
   * Creates a new binding.
   *
   * @param args - The arguments.
   */
  constructor (args: Readonly<BindingBaseArgs>) {
    super()

    this._element = args.element

    this._history = args.history
    this._historyPrefix = args.historyPrefix
    this._historyPostfix = args.historyPostfix
    this._historyName = args.historyName
    this._historyCombine = args.historyCombine ?? false
  }

  /**
   * Links the specified observers to the specified paths.
   *
   * @param observers - The observer(s).
   * @param paths - The path(s). The behavior of the binding depends on how many paths are passed.
   * If an equal amount of paths and observers are passed then the binding will map each path to each observer at each index.
   * If more observers than paths are passed then the path at index 0 will be used for all observers.
   * If one observer and multiple paths are passed then all of the paths will be used for the observer (e.g. for curves).
   */
  link (observers: Observer|Observer[], paths: string|string[]) {
    this.unlink()
    this._observers = Array.isArray(observers) ? observers : [observers]
    this._paths = Array.isArray(paths) ? paths : [paths]

    this._linked = true
  }

  /**
   * Unlinks the observers and paths.
   */
  unlink () {
    this._observers = []
    this._paths = []
    this._linked = false
  }

  /**
   * Sets a value to the linked observers at the linked paths.
   *
   * @param _value - The value
   */
  setValue (_value: unknown) {}

  /**
   * Sets an array of values to the linked observers at the linked paths.
   *
   * @param _values - The values.
   */
  setValues (_values: unknown[]) {}

  /**
   * Adds (inserts) a value to the linked observers at the linked paths.
   *
   * @param _value - The value.
   */
  addValue (_value: unknown) {
  }

  /**
   * Adds (inserts) multiple values to the linked observers at the linked paths.
   *
   * @param _values - The values.
   */
  addValues (_values: unknown[]) {
  }

  /**
   * Removes a value from the linked observers at the linked paths.
   *
   * @param _value - The value.
   */
  removeValue (_value: unknown) {
  }

  /**
   * Removes multiple values from the linked observers from the linked paths.
   *
   * @param _values - The values.
   */
  removeValues (_values: unknown[]) {
  }

  /**
   * The element
   */
  set element (value: IBindable | undefined) {
    this._element = value
  }

  get element (): IBindable | undefined {
    return this._element
  }

  /**
   * Whether the binding is currently applying a change either to the observers or the element.
   */
  set applyingChange (value) {
    if (this._applyingChange === value) {
      return
    }

    this._applyingChange = value
    this.emit('applyingChange', value)
  }

  get applyingChange () {
    return this._applyingChange
  }

  /**
   * Whether the binding is linked to observers.
   */
  get linked () {
    return this._linked
  }

  /**
   * If a history module is used whether to combine history actions when applying changes to observers.
   */
  set historyCombine (value) {
    this._historyCombine = value
  }

  get historyCombine () {
    return this._historyCombine
  }

  /**
   * The name of the history action when applying changes to observers.
   */
  set historyName (value) {
    this._historyName = value
  }

  get historyName () {
    return this._historyName
  }

  /**
   * A string to prefix the historyName with.
   */
  set historyPrefix (value) {
    this._historyPrefix = value
  }

  get historyPrefix () {
    return this._historyPrefix
  }

  /**
   * A string to postfix the historyName with.
   */
  set historyPostfix (value) {
    this._historyPostfix = value
  }

  get historyPostfix () {
    return this._historyPostfix
  }

  /**
   * Whether history is enabled for the binding. A valid history object must have been provided first.
   */
  set historyEnabled (value) {
    if (this._history) {
      this._history.enabled = value
    }
  }

  get historyEnabled () {
    return this._history?.enabled
  }

  /**
   * The linked observers.
   */
  get observers () {
    return this._observers
  }

  /**
   * The linked paths.
   */
  get paths () {
    return this._paths
  }
}
