import { type TweenType, type TickerType, type TweenOptions, type TweenEmitCallback, type InterpolateType, type TweenPathInput } from '../types.js'
import { Interpolate } from './Interpolate.js'
import { globalTicker } from '../timer/Ticker.js'
import { Emit } from '../core/Emit.js'

export class Tween<ValueType extends (number | number[])> extends Emit<TweenEmitCallback<ValueType>> implements TweenType<ValueType> {
  isStarted = false
  isEnded = false
  interpolate: InterpolateType<ValueType>

  private _timer: TickerType | null = null
  private _startTime: number = 0
  private _play = this.emit.bind(this, 'play')
  private _pause = this.emit.bind(this, 'pause')
  private readonly _options: TweenOptions<ValueType>

  constructor (rawPath: TweenPathInput<ValueType>, options: TweenOptions<ValueType> = {}) {
    super()

    this._options = { ...options }

    this._update = this._update.bind(this)

    this.interpolate = new Interpolate<ValueType>(rawPath, options)
    this.timer = (options.timer === undefined) ? globalTicker : options.timer
  }

  get timer (): TickerType | null {
    return this._timer
  }

  set timer (timer: TickerType | null) {
    let oldTime = 0
    if (this._timer !== null) {
      oldTime = this._timer.time
      this._timer.off('update', this._update)
      this._timer.off('play', this._play)
      this._timer.off('pause', this._pause)
    }

    this._timer = timer

    if (this._timer !== null) {
      this._timer.on('update', this._update)
      this._timer.on('play', this._play)
      this._timer.on('pause', this._pause)

      this._startTime += (this.timer?.time ?? 0) - oldTime
    }
  }

  to (value: ValueType, options: TweenOptions<ValueType> = {}) {
    const oldValue = this.interpolate.getValue(this._startTime + this.interpolate.duration + this.interpolate.delay)
    return new Tween([
      oldValue, value],
      {
        ...options,
        delay: (options.delay ?? 0) + this.interpolate.delay + this.interpolate.duration
      }
    )
  }

  chain (rawPath: TweenPathInput<ValueType>, options: TweenOptions<ValueType> = {}) {
    return new Tween(
      rawPath,
      {
        ...options,
        delay: (options.delay ?? 0) + this.interpolate.delay + this.interpolate.duration
      }
    )
  }

  getValue (time: number): ValueType {
    return this.interpolate.getValue(time)
  }

  dispose (): this {
    super.dispose()
    this.timer = null
    return this
  }

  private _update (time: number): void {
    // Before
    if (time < this._startTime + this.interpolate.delay) {
      return
    }

    // After
    if (time > this._startTime + this.interpolate.delay + this.interpolate.duration) {
      if (!this.isEnded) {
        const value = this.getValue(time - this._startTime)
        this.emit('update', value)
        this.emit('end', value)
        this.isEnded = true
        if (this.timer?.autoDispose) {
          this.dispose()
        }
      }
      return
    }

    // During
    const value = this.getValue(time - this._startTime)
    if (!this.isStarted) { // Start
      this.isStarted = true
      this.emit('start', value)
    }
    this.emit('update', value)
  }
}
