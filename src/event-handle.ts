import type { Events } from './events'

export class EventHandle {
  owner: Events | null
  name: string | null
  fn: any

  /**
   * @param {Events} owner - Owner
   * @param {string} name - Name
   * @param {HandleEvent} fn - Callback function
   */
  constructor (owner: Events, name: string, fn: any) {
    this.owner = owner
    this.name = name
    this.fn = fn
  }

  /**
   */
  unbind () {
    if (!this.owner) {
      return
    }

    this.owner.unbind(this.name ?? undefined, this.fn)

    this.owner = null
    this.name = null
    this.fn = null
  }

  /**
   */
  call (...args: any[]) {
    if (!this.fn) {
      return
    }

    this.fn.call(this.owner, ...args)
  }

  /**
   * @param {string} name - Name
   * @param {HandleEvent} fn - Callback function
   * @returns {EventHandle} - EventHandle
   */
  on (name: string, fn: any) {
    return this.owner?.on(name, fn)
  }
}
