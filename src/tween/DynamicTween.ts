import { type InterpolateOptions, type TickerType, type EmitCallback, type TweenOptions, type TickerEvent, type TweenType, type DynamicTweenOptions } from '../types.js'
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

type InterpolateOptionsType = TweenOptions<number[]> & InterpolateOptions<number[]>

type InterpolateType = Interpolate<InterpolateOptionsType>

export class DynamicTween<ValueType> extends Emit<EmitCallback<'update', ValueType> | EmitCallback<TickerEvent, void>> implements TweenType<ValueType> {
  isStarted = false
  isEnded = false

  private _timer: TickerType | null = null

  private _startTime: number = 0
  private readonly _options: DynamicTweenOptions<ValueType>

  private readonly _frozenList: Frozen[]
  private readonly _isArray: boolean

  private readonly interpolates: InterpolateType[]

  constructor (options: Omit<DynamicTweenOptions<ValueType>, 'to'> & { to?: ValueType } & { from: ValueType }) {
    super()

    this._options = {
      ...options,
      to: options.to ?? options.from,
      // msPerUnit: options.msPerUnit ?? 20
    } as DynamicTweenOptions<ValueType>

    this._isArray = Array.isArray(options.from)

    this._update = this._update.bind(this)

    this.on('start', this._options.onStart)
    this.on('update', this._options.onUpdate)
    this.on('end', this._options.onEnd)

    this.interpolates = []
    this.timer = options.timer ?? (globalTicker as TickerType)
    this._frozenList = [{ time: this.timer.time, value: this._isArray ? [...(options.from as number[])] : [options.from as number] }]
    if (options.to !== undefined) {
      this.change(options as DynamicTweenOptions<ValueType>)
    }
  }

  private _getFrozenValue (time: number): Frozen {
    const nextIndex = this._frozenList.findIndex(val => val.time > time - this._startTime)
    const index = nextIndex < 0 ? this._frozenList.length - 1 : (nextIndex - 1)
    return this._frozenList[index]
  }

  private _updateFrozen (time: number, delta: number[]): void {
    const value = this._getFrozenValue(time).value
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

  private _getEndValues (): number[] {
    return this._frozenList[this._frozenList.length - 1].value
  }

  change (options: Omit<DynamicTweenOptions<ValueType>, 'from'>): this {
    const to = (this._isArray ? options.to : [options.to]) as number[]
    const oldEndValue = this._getEndValues()
    const deltaValue = to.map((val, index) => val - oldEndValue[index])
    const msPerUnit = options.msPerUnit ?? this._options.msPerUnit
    const duration = msPerUnit !== undefined ? distance(oldEndValue, to) * msPerUnit : (options.duration ?? this._options.duration)
    const interpolate = new Interpolate({
      ...options,
      duration,
      from: to.map(() => 0),
      to: deltaValue,
      timer: this.timer,
      delay: (options.delay ?? 0) + this.timer.time - this._startTime
    } as DynamicTweenOptions<ValueType>) as InterpolateType

    this.interpolates.push(interpolate)
    this._updateFrozen(interpolate.delay + interpolate.duration, deltaValue)

    return this
  }

  get timer (): TickerType {
    return this._timer as TickerType
  }

  set timer (timer: TickerType | null) {
    if (this._timer !== null) {
      this._timer.off('update', this._update)
      this._timer.off('play', this._options.onPlay)
      this._timer.off('pause', this._options.onPause)
    }

    this._timer = timer

    if (this._timer !== null) {
      this._timer.on('update', this._update)
      this._timer.on('play', this._options.onPlay)
      this._timer.on('pause', this._options.onPause)

      this._startTime = this.timer.time
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

    const currentFrozen = this._getFrozenValue(currentTime)
    let frozenToDestroy = this._frozenList.findIndex(frozen => frozen.time < currentFrozen.time)
    while (frozenToDestroy > -1) {
      this._frozenList.splice(frozenToDestroy, 1)
      frozenToDestroy = this._frozenList.findIndex(frozen => frozen.time < currentFrozen.time)
    }
  }

  private _getValues (time: number): number[] {
    const currentTime = time - this._startTime
    const frozen = this._getFrozenValue(currentTime).value

    if (this.timer.autoDispose) {
      this._autoDispose(currentTime)
    }

    return this.interpolates
      .filter(int => currentTime > int.delay && currentTime < int.delay + int.duration)
      .reduce((values, interpolate) => {
        const newValues = interpolate.getValue(currentTime) as number[]
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
