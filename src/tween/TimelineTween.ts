import { type TweenType, type TickerType, type TweenOptions, type TweenEmitCallback, type TweenPathInput } from '../types.js'
import { Emit } from '../core/Emit.js'
import { SimpleTween } from './SimpleTween.js'
import { Ticker } from '../timer/Ticker.js'

export class TimelineTween<ValueType extends (number | number[])> extends Emit<TweenEmitCallback<ValueType>> implements TweenType<ValueType> {

  private _tweens = [] as SimpleTween<ValueType>[]

  private _update = this.emit.bind(this, 'update')
  private _play = this.emit.bind(this, 'play')
  private _pause = this.emit.bind(this, 'pause')
  private _start = this.emit.bind(this, 'start')
  private _end = this.emit.bind(this, 'end')

  constructor (rawPath: TweenPathInput<ValueType>, options: TweenOptions = {}) {
    super()

    const timer = (options.timer === undefined) ? new Ticker() : options.timer

    const firstTween = new SimpleTween(rawPath, { ...options, timer })
    this._tweens.push(firstTween)
    firstTween.on('start', this._start)
    firstTween.on('update', this._update)
    firstTween.on('end', this._end)
  }

  get _currentTween () {
    return this._tweens.find(tween => !tween.isEnded) || this._lastTween
  }

  get isStarted (): boolean {
    return this._currentTween.isStarted
  }

  get isEnded (): boolean {
    return this._currentTween.isEnded
  }

  get timer (): TickerType | null {
    return this._currentTween.timer
  }

  get _lastTween () {
    return this._tweens[this._tweens.length - 1]
  }

  set timer (timer: TickerType | null) {

    const oldTimer = this._currentTween.timer
    if (oldTimer !== null) {
      oldTimer.off('update', this._update)
      oldTimer.off('play', this._play)
      oldTimer.off('pause', this._pause)

      this._tweens[0].off('start', this._start)
      this._tweens.forEach(tween => tween.off('update', this._update))
      this._lastTween.off('end', this._end)
    }

    if (timer !== null) {
      timer.on('update', this._update)
      timer.on('play', this._play)
      timer.on('pause', this._pause)

      this._tweens[0].on('start', this._start)
      this._tweens.forEach(tween => tween.on('update', this._update))
      this._lastTween.on('end', this._end)
    }

    this._tweens.forEach(tween => tween.timer = timer)
  }

  to (value: ValueType, options: TweenOptions = {}) {
    const lastTween = this._lastTween
    lastTween?.off('end', this._end)

    const oldValue = lastTween.interpolate.getValueByProgress(1)
    const timer = this._tweens[0].timer
    this._tweens.push(new SimpleTween(
      [ oldValue, value ],
      {
        ...options,
        timer,
        delay: (options.delay ?? 0) + lastTween.interpolate.delay + lastTween.interpolate.duration
      }
    ))

    this._lastTween.on('update', this._update)
    this._lastTween.on('end', this._end)

    return this
  }

  // chainTween (rawPath: TweenPathInput<ValueType>, options: TweenOptions = {}) {
  //   const lastTween = this._lastTween
  //   this._tweens.push(new SimpleTween(
  //     rawPath,
  //     {
  //       ...options,
  //       delay: (options.delay ?? 0) + lastTween.interpolate.delay + lastTween.interpolate.duration
  //     }
  //   ))
  // }

  getTime (): number {
    return this._currentTween.getTime()
  }

  getValue (time: number = this.getTime()): ValueType {
    return this._currentTween.getValue(time)
  }

  dispose (): this {
    super.dispose()
    this._tweens.forEach(tween => tween.dispose())
    return this
  }

  // private _update (time: number): void {
  //   // Before
  //   if (time < this._startTime + this.interpolate.delay) {
  //     return
  //   }
    
  //   const value = this.getValue(time - this._startTime)

  //   // After
  //   if (time > this._startTime + this.interpolate.delay + this.interpolate.duration) {
  //     if (!this.isEnded) {
  //       this.emit('update', value)
  //       this.emit('end', value)
  //       this.isEnded = true
  //       if (this.timer?.autoDispose) {
  //         this.dispose()
  //       }
  //     }
  //     return
  //   }


  //   // Start
  //   if (!this.isStarted) {
  //     this.isStarted = true
  //     this.emit('start', value)
  //   }

  //   // During
  //   this.emit('update', value)
  // }
}
