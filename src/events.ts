/* eslint-disable no-underscore-dangle */
import { EventHandle } from './event-handle.js'

/**
 * Base class for event handling.
 */
export class Events {
  _suspendEvents = false
  _additionalEmitters: any[] = []
  _events: any

  constructor () {
    Object.defineProperty(
      this,
      '_events',
      {
        configurable: false,
        enumerable: false,
        value: { },
        writable: true,
      }
    )
  }

  /**
   * If true the observer will not emit events when values are set.
   *
   * @type {boolean}
   */
  set suspendEvents (value) {
    this._suspendEvents = Boolean(value)
  }

  get suspendEvents () {
    return this._suspendEvents
  }

  /**
   * @param {string} name - Name
   * @param {HandleEvent} fn - Callback function
   * @returns {EventHandle} EventHandle
   */
  on (name: string, fn: any) {
    const events = this._events[name]
    if (events === undefined) {
      this._events[name] = [fn]
    } else if (events.indexOf(fn) === -1) {
      events.push(fn)
    }
    return new EventHandle(this, name, fn)
  }

  /**
   * @param {string} name - Name
   * @param {HandleEvent} fn - Callback function
   * @returns {EventHandle} EventHandle
   */
  once (name: string, fn: any): EventHandle {
    const evt = this.on(name, (...args: any[]) => {
      fn.call(this, ...args)
      evt.unbind()
    })
    return evt
  }

  emit (name: string, ...args: any[]): this {
    if (this._suspendEvents) {
      return this
    }

    let events = this._events[name]
    if (events?.length) {
      events = events.slice(0)

      for (let i = 0; i < events.length; i += 1) {
        if (!events[i]) {
          continue
        }

        try {
          events[i].call(this, ...args)
        } catch (ex) {
          console.info('%c%s %c(event error)', 'color: #06f', name, 'color: #f00')
          // @ts-expect-error todo
          console.log(ex.stack)
        }
      }
    }

    if (this._additionalEmitters.length) {
      const emitters = this._additionalEmitters.slice()
      emitters.forEach((emitter) => {
        emitter.emit(name, ...args)
      })
    }

    return this
  }

  unbind (name?: string, fn?: any): this {
    if (name) {
      const events = this._events[name]
      if (!events) {
        return this
      }

      if (fn) {
        const i = events.indexOf(fn)
        if (i !== -1) {
          if (events.length === 1) {
            delete this._events[name]
          } else {
            events.splice(i, 1)
          }
        }
      } else {
        delete this._events[name]
      }
    } else {
      this._events = { }
    }

    return this
  }

  /**
   * Adds another emitter. Any events fired by this instance
   * will also be fired on the additional emitter.
   *
   * @param emitter - The emitter
   */
  addEmitter (emitter: Events) {
    if (!this._additionalEmitters.includes(emitter)) {
      this._additionalEmitters.push(emitter)
    }
  }

  /**
   * Removes emitter.
   *
   * @param emitter - The emitter
   */
  removeEmitter (emitter: Events) {
    const idx = this._additionalEmitters.indexOf(emitter)
    if (idx !== -1) {
      this._additionalEmitters.splice(idx, 1)
    }
  }
}

export default Events
