import { type TickerType, type TweenOptions, type TweenEmitCallback, type SmoothPathOptions, type PathType, type TimelineOptions } from '../types.js'
import { Emit } from '../core/Emit.js'
import { TimelineTween } from './TimelineTween.js'
import { DynamicTween } from './DynamicTween.js'
import { CheckpointSmoothPath } from '../path/CheckpointSmoothPath.js';
import { ErodeSmoothPath } from '../path/ErodeSmoothPath.js';
import { Timeline } from "../timer/Timeline.js";
import { cubicBezier } from '../easing/cubicBezier.js';

type ValueOf<T> = T[keyof T];
type Obj = { [key: string]: number }
type AutoTweenOptions = TweenOptions & { path?: SmoothPathOptions & { checkpoint?: boolean } } & { isDynamic?: boolean } & { timeline?: TimelineOptions } & { cubicBezier?: [number, number, number, number] }
const enum ValueEnum { 
  Object,
  Array,
  ArrayPath,
  ObjectPath
}

/**
 * Get value enum type
 */
function getValueEnum<ValueType extends (Obj | number[])>(value: ValueType[] | ValueType) {
  // Object type
  if (!Array.isArray(value)) {
    return ValueEnum.Object

  // Array type
  } else if (typeof value[0] === 'number') {
    return ValueEnum.Array

  // Path of array type
  } else if (Array.isArray(value[0])) {
    return ValueEnum.ArrayPath
  }

  // Path of object type
  return ValueEnum.ObjectPath
}

export class Tween<ValueType extends (Obj | number[])> extends Emit<TweenEmitCallback<ValueType>> {
  private _play = this.emit.bind(this, 'play')
  private _pause = this.emit.bind(this, 'pause')
  private _start = this.emit.bind(this, 'start')
  private _end = this.emit.bind(this, 'end')

  private _valueType: ValueEnum
  private _keys: (keyof ValueType)[]
  private _tween: TimelineTween<number[]> | DynamicTween<number[]>

  reference: ValueType

  constructor (
    reference: ValueType,
    to: ValueType | ValueType[],
    options: AutoTweenOptions = {}
  ) {
    super()

    this._update = this._update.bind(this)

    this.reference = reference
    this._valueType = getValueEnum(to)

    switch (this._valueType) {
      case ValueEnum.Object :
        this._keys = Object.keys(to as Obj) as (keyof ValueType)[]
        break;
      case ValueEnum.Array :
        this._keys = [...(to as number[]).keys()]
        break;
      case ValueEnum.ArrayPath :
        this._keys = [...(to as number[][])[0].keys()]
        break;
      case ValueEnum.ObjectPath :
        this._keys = Object.keys((to as Obj[])[0]) as (keyof ValueType)[]
        break;
    }

    if (!options.timer) {
      options.timer = new Timeline(options.timeline)
    }

    if (Array.isArray(options.cubicBezier)) {
      options.ease = cubicBezier(...options.cubicBezier)
    }

    if (options.isDynamic && (this._valueType === ValueEnum.ArrayPath || this._valueType === ValueEnum.ObjectPath)) {
      throw new Error("Can not use path for dynamic tween")
    }

    if (options.isDynamic) {
      this._tween = new DynamicTween(
        this._keys.map((key) => 
          reference[key as (keyof ValueType)] as number
        ),
        options
      )

      this._tween.to(this._refToArray(to, options.path) as number[])
    } else if (this._valueType === ValueEnum.Array || this._valueType === ValueEnum.Object) {
      this._tween = new TimelineTween(
        [
          this._valueToArray(reference) as number[],
          this._refToArray(to, options.path) as number[],
        ],
        options
      )
    } else {

      this._tween = new TimelineTween(
        this._refToArray([reference, ...(to as ValueType[])], options.path) as PathType,
        options
      )
    }

    this._tween.on('update', this._update)
    this._tween.on('play', this._play)
    this._tween.on('pause', this._pause)
    this._tween.on('start', this._start)
    this._tween.on('end', this._end)
  }

  _valueToArray(value: ValueType) {
    return this._keys.map(key => (value as ValueType)[key] as number)
  }

  _refToArray (ref: ValueType | ValueType[], options: AutoTweenOptions["path"] = {}) {
    const enumType = getValueEnum(ref)

    // Is not path
    if (enumType === ValueEnum.Array || enumType === ValueEnum.Object) {
      return this._valueToArray(ref as ValueType)
    }
    
    // Is path
    if (options?.checkpoint) {
      return CheckpointSmoothPath((ref as ValueType[]).map(this._valueToArray.bind(this)), options)
    } else {
      return ErodeSmoothPath((ref as ValueType[]).map(this._valueToArray.bind(this)), options)
    }
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

  to (value: ValueType, options: AutoTweenOptions = {}) {
    this._tween.to(this._valueToArray(value), options)
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
    if (this._valueType === ValueEnum.Object || this._valueType === ValueEnum.ObjectPath) {
      return this._keys.reduce((obj, key, index) => ({ ...obj, [key]: value[index] }), {} as Obj) as ValueType
    }
    
    return this._keys.reduce((array, key, index) => {
      array[key as number] = value[index] as number
      return array
    }, [] as number[]) as ValueType
  }
}
