import { type TickerType, type TweenType, type DynamicTweenOptions, type TweenEmitCallback } from '../types.js'
import { Interpolate } from './Interpolate.js'
import { globalTicker } from '../timer/Ticker.js'
import { Emit } from '../core/Emit.js'

function distance (from: number[], to: number[]): number {
  return Math.sqrt(from.reduce((total, value, index) => total + (value - to[index]) ** 2, 0))
}

interface Frozen {
  time: number
  value: number[]
}

export class DynamicTween<ValueType extends (number | number[])> extends Emit<TweenEmitCallback<ValueType>> implements TweenType<ValueType> {
  isStarted = false
  isEnded = false

  private _timer: TickerType | null = null

  private _startTime: number = 0 // Started time of the dynamic tween in the timer
  private readonly _options: DynamicTweenOptions<ValueType>

  private readonly _frozenList: Frozen[]
  private readonly _isArray: boolean

  private readonly interpolates: Interpolate<number[]>[] = []

  constructor (from: ValueType, options: DynamicTweenOptions<ValueType> = {}) {
    super()

    this._options = {
      ...options,
      // msPerUnit: options.msPerUnit ?? 20
    } as DynamicTweenOptions<ValueType>

    this._isArray = Array.isArray(from)

    this._update = this._update.bind(this)

    this.on('start', this._options.onStart)
    this.on('update', this._options.onUpdate)
    this.on('end', this._options.onEnd)

    this.timer = (options.timer === undefined) ? (globalTicker) : options.timer

    // Init frozen list
    this._frozenList = [{ time: this.timer?.time ?? 0, value: this._isArray ? [...(from as number[])] : [from as number] }]
  }

  private _getFrozen (time: number): Frozen {
    const nextIndex = this._frozenList.findIndex(val => val.time > time)
    const index = nextIndex < 0 ? this._frozenList.length - 1 : (nextIndex - 1)
    return this._frozenList[index]
  }

  private _addFrozen (time: number, delta: number[]): void {
    const value = this._getFrozen(time).value
    const newFrozen = {
      time,
      value: value.map((val, i) => val + delta[i])
    }
    this._frozenList
      .filter(frozen => frozen.time > time)
      .forEach(frozen => {
        frozen.value = frozen.value.map((val, i) => val + delta[i])
      })

    this._frozenList.push(newFrozen)
    this._frozenList.sort((a, b) => a.time - b.time)
  }

  private _getEndFrozen (): Frozen {
    return this._frozenList[this._frozenList.length - 1]
  }

  private _addInterpolate (to: ValueType, options: DynamicTweenOptions<ValueType>): this {
    const cleanTo = (this._isArray ? to : [to]) as number[]
    const oldEndValue = this._getEndFrozen().value
    const deltaValue = cleanTo.map((val, index) => val - oldEndValue[index])
    const msPerUnit = options.msPerUnit ?? this._options.msPerUnit
    const duration = msPerUnit !== undefined ? distance(oldEndValue, cleanTo) * msPerUnit : (options.duration ?? this._options.duration)
    const interpolate = new Interpolate<number[]>(
      [cleanTo.map(() => 0), deltaValue],
      {
        ...options,
        duration,
        delay: (options.delay ?? 0)
      }
    )

    this.interpolates.push(interpolate)
    this._addFrozen(interpolate.delay + interpolate.duration, deltaValue)

    return this
  }

  to (to: ValueType, options: DynamicTweenOptions<ValueType> = {}): this {
    return this._addInterpolate(to, { ...options, delay: (options.delay ?? 0) + (this.timer?.time ?? 0) })
  }

  chain (to: ValueType, options: DynamicTweenOptions<ValueType> = {}): this {
    const oldEnd = this._getEndFrozen()
    return this._addInterpolate(to, { ...options, delay: (options.delay ?? 0) + oldEnd.time })
  }

  get timer (): TickerType | null {
    return this._timer
  }

  set timer (timer: TickerType | null) {
    let oldTime = 0
    if (this._timer !== null) {
      oldTime = this._timer.time
      this._timer.off('update', this._update)
      this._timer.off('play', this._options.onPlay)
      this._timer.off('pause', this._options.onPause)
    }

    this._timer = timer

    if (this._timer !== null) {
      this._timer.on('update', this._update)
      this._timer.on('play', this._options.onPlay)
      this._timer.on('pause', this._options.onPause)

      this._startTime += (this.timer?.time ?? 0) - oldTime
    }
  }

  dispose (): void {
    this.off('start', this._options.onStart)
    this.off('update', this._options.onUpdate)
    this.off('end', this._options.onEnd)
    this.timer = null
  }

  private _autoDispose (currentTime: number): void {
    let intToDestroy = this.interpolates.findIndex(int => currentTime > int.delay + int.duration)
    while (intToDestroy > -1) {
      this.interpolates.splice(intToDestroy, 1)
      intToDestroy = this.interpolates.findIndex(int => currentTime > int.delay + int.duration)
    }

    const currentFrozen = this._getFrozen(currentTime)
    let frozenToDestroy = this._frozenList.findIndex(frozen => frozen.time < currentFrozen.time)
    while (frozenToDestroy > -1) {
      this._frozenList.splice(frozenToDestroy, 1)
      frozenToDestroy = this._frozenList.findIndex(frozen => frozen.time < currentFrozen.time)
    }
  }

  private _getValues (time: number): number[] {
    const frozen = this._getFrozen(time).value

    if (this.timer?.autoDispose) {
      this._autoDispose(time)
    }

    return this.interpolates
      .filter(int => time > int.delay && time < int.delay + int.duration)
      .reduce((values, interpolate) => {
        const newValues = interpolate.getValue(time)
        return values.map((value, i) => value + newValues[i])
      }, frozen)
  }

  getValue (time: number): ValueType {
    const values = this._getValues(time)
    return (this._isArray ? values : values[0]) as ValueType
  }

  private _update (time: number): void {
    const values = this._getValues(time)

    if (!this.isStarted && time > this._startTime) {
      this.isStarted = true
      this.emit('start', (this._isArray ? values : values[0]) as ValueType)
    }

    this.emit('update', (this._isArray ? values : values[0]) as ValueType)
  }
}
