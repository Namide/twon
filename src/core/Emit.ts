import type { EmitCallback } from '../types.js'

export class Emit<Callback extends EmitCallback<string, any>> {
  protected list: Array<{ event: Callback['event'], callback: Callback['callback'] }> = []

  on (event: Callback['event'], callback?: Callback['callback']): this {
    if (callback != null) {
      this.list.push({ event, callback })
    }
    return this
  }

  off (event: Callback['event'], callback?: Callback['callback']): this {
    const index = this.list.findIndex((cb) => cb.event === event && cb.callback === callback)
    if (index > -1) {
      this.list.splice(index, 1)
    }
    return this
  }

  dispose (): this {
    this.list = []
    return this
  }

  protected emit (event: Callback['event'], ...args: Parameters<Callback['callback']>): void {
    this.list
      .filter(cb => cb.event === event)
      .forEach(({ callback }) => {
        callback.apply(null, args)
      })
  }
}
