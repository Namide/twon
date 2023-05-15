import { Emit } from '../core/Emit.js'
import { type EmitCallback, type TickerEvent, type TickerType } from '../types.js'

type EmitCb = EmitCallback<'update', number> | EmitCallback<TickerEvent, void>

export class Ticker extends Emit<EmitCb> implements TickerType {
  private _id: number = -1
  private _last: number

  time: number

  private _isEnabled = false
  autoDispose = true

  constructor () {
    super()
    this._last = Date.now()
    this.time = 0
  }

  private enable (): this {
    this._isEnabled = true
    cancelAnimationFrame(this._id)
    this._id = requestAnimationFrame(() => this.tick())
    return this
  }

  private disable (): this {
    this._isEnabled = false
    cancelAnimationFrame(this._id)
    return this
  }

  on (event: EmitCb['event'], callback?: EmitCb['callback']): this {
    if (!this._isEnabled) {
      this.enable()
    }
    return super.on(event, callback)
  }

  off (event: EmitCb['event'], callback?: EmitCb['callback']): this {
    super.off(event, callback)
    if (this.list.length < 1 && this._isEnabled) {
      this.disable()
    }
    return this
  }

  tick (): this {
    if (this._isEnabled) { // disable() don't working...
      const now = Date.now()
      this.time += now - this._last
      this._last = now

      this.emit('update', this.time)

      cancelAnimationFrame(this._id)
      this._id = requestAnimationFrame(() => this.tick())
    }
    return this
  }
}
