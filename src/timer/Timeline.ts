import { Emit } from '../core/Emit.js'
import { type EmitCallback, type TickerEvent, type TickerType } from '../types.js'

type EmitCb = EmitCallback<'update', number> | EmitCallback<TickerEvent, void>

export class Timeline extends Emit<EmitCb> implements TickerType {
  private _id: number = -1
  private _last: number

  time: number

  autoDispose = false

  isPlaying: boolean
  isLooping: boolean
  autoReverse: boolean
  speed: number
  duration: number

  constructor ({ loop = false, play = true, speed = 1, duration = 0, autoReverse = false } = {}) {
    super()

    this.isLooping = loop
    this.isPlaying = play
    this.speed = speed
    this.duration = duration
    this.autoReverse = autoReverse

    this._last = Date.now()
    this.time = 0
  }

  setDuration (duration: number): this {
    this.duration = duration
    return this
  }

  reverse (): this {
    this.speed *= -1
    return this
  }

  seek (time: number): this {
    this.time = time
    return this
  }

  play (): this {
    this.isPlaying = true
    cancelAnimationFrame(this._id)
    this._id = requestAnimationFrame(() => this.tick())
    this.emit('play')
    return this
  }

  pause (): this {
    this.isPlaying = false
    cancelAnimationFrame(this._id)
    this.emit('pause')
    return this
  }

  restart (): this {
    this.time = 0
    if (!this.isPlaying) {
      this.isPlaying = true
      this.emit('play')
    }
    cancelAnimationFrame(this._id)
    this._id = requestAnimationFrame(() => this.tick())
    return this
  }

  tick (): this {
    if (this.isPlaying) {
      const now = Date.now()
      this.time += (now - this._last) * this.speed

      if (this.time > this.duration) {
        if (this.autoReverse) {
          this.speed *= -1
          this.time = this.duration
        } else if (this.isLooping) {
          this.time = 0
        } else {
          this.time = this.duration
          this.emit('end')
        }
      }

      if (this.time < 0) {
        if (this.autoReverse) {
          this.speed *= -1
          this.time = 0
        } else if (this.isLooping) {
          this.time = this.duration
        } else {
          this.time = 0
          this.emit('end')
        }
      }

      this._last = now

      this.emit('update', this.time)

      cancelAnimationFrame(this._id)
      this._id = requestAnimationFrame(() => this.tick())
    }
    return this
  }
}
