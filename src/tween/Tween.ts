import { type TickerType, type TweenOptions, type TweenEmitCallback } from '../types.js'
import { Emit } from '../core/Emit.js'
import { TimelineTween } from './TimelineTween.js'
import { DynamicTween } from './DynamicTween.js'

type ValueOf<T> = T[keyof T];
type Obj = { [key: string]: number }

export class Tween<ValueType extends (Obj | number[])> extends Emit<TweenEmitCallback<ValueType>> {
  private _play = this.emit.bind(this, 'play')
  private _pause = this.emit.bind(this, 'pause')
  private _start = this.emit.bind(this, 'start')
  private _end = this.emit.bind(this, 'end')

  private _isObject: boolean
  private _keys: (keyof ValueType)[]
  private _tween: TimelineTween<number[]> | DynamicTween<number[]>

  reference: ValueType

  constructor (
    reference: ValueType & (number[] | Obj),
    to: ValueType,
    options: TweenOptions & { isDynamic?: boolean } = {}
  ) {
    super()

    this._update = this._update.bind(this)

    this.reference = reference

    if (Array.isArray(to) ) {
      this._isObject = false
      this._keys = [...to.keys()]
    } else {
      this._isObject = true
      this._keys = Object.keys(to) as (keyof ValueType)[]
    }

    if (options.isDynamic) {
      this._tween = new DynamicTween(
        this._keys.map((key) => 
          reference[key as (keyof ValueType)] as number
        ),
        options
      )
      this._tween.to(this._refToArray(to))
    } else {
      this._tween = new TimelineTween(
        [
          this._refToArray(reference),
          this._refToArray(to),
        ],
        options
      )
    }

    this._tween.on('update', this._update)
    this._tween.on('play', this._play)
    this._tween.on('pause', this._pause)
    this._tween.on('start', this._start)
    this._tween.on('end', this._end)
  }

  _refToArray (ref: ValueType) {
    return this._keys.map(key => ref[key] as number)
  }

  get isStarted () {
    return this._tween.isStarted
  }

  get isEnded () {
    return this._tween.isEnded
  }

  get timer (): TickerType | null {
    return this._tween.timer
  }

  set timer (timer: TickerType | null) {
    this._tween.timer = timer
  }

  to (value: ValueType, options: TweenOptions = {}) {
    this._tween.to(this._refToArray(value), options)
    return this
  }

  // chain (rawPath: TweenPathInput<ValueType>, options: TweenOptions = {}) {
  //   return new SimpleTween(
  //     rawPath,
  //     {
  //       ...options,
  //       delay: (options.delay ?? 0) + this.interpolate.delay + this.interpolate.duration
  //     }
  //   )
  // }

  getTime (): number {
    return this._tween.getTime()
  }

  getValue (time: number = this.getTime()): ValueType {
    return this._convertValue(this._tween.getValue(time))
  }

  dispose (): this {
    super.dispose()
    this._tween.dispose()
    return this
  }

  _update (values: number[]) {
    
    // Update data to references
    this._keys.forEach((key: keyof ValueType, index) => {
      this.reference[key] = values[index] as ValueOf<ValueType>
    })

    this.emit('update', this._convertValue(values))
  }

  /**
   * Create new value like reference from tween value array
   */
  _convertValue (value: number[]): ValueType {
    if (this._isObject) {
      return this._keys.reduce((obj, key, index) => ({ ...obj, [key]: value[index] }), {} as Obj) as ValueType
    }

    return this._keys.reduce((array, key, index) => {
      array[key as number] = value[index] as number
      return array
    }, [] as number[]) as ValueType
  }
}
