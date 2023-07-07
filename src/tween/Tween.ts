import type { TickerType, TweenOptions, TweenEmitCallback, SmoothPathOptions, PathType, TimelineOptions, Easing } from '../types.js'
import { Emit } from '../core/Emit.js'
import { TimelineTween } from './TimelineTween.js'
import { DynamicTween } from './DynamicTween.js'
import { CheckpointSmoothPath } from '../path/CheckpointSmoothPath.js'
import { ErodeSmoothPath } from '../path/ErodeSmoothPath.js'
import { Timeline } from '../timer/Timeline.js'
import { cubicBezier } from '../easing/cubicBezier.js'
import { multiEasing } from '../easing/multiEasing.js'

type ValueOf<T> = T[keyof T]
type Obj = Record<string, number>
type SimpleEase = [number, number, number, number] | Easing | Parameters<typeof multiEasing>
type AutoTweenOptions = Omit<TweenOptions, 'ease'> & { path?: SmoothPathOptions & { checkpoint?: boolean } } & { isDynamic?: boolean } & { timeline?: TimelineOptions } & { ease?: SimpleEase }
type CleanAutoTweenOptions = Omit<AutoTweenOptions, 'ease'> & { ease: Easing }
const enum ValueEnum {
  ObjectNumber,
  ArrayNumber,
  ArrayPath,
  ObjectPath
}

/**
 * Get value enum type
 */
function getValueEnum<ValueType extends (Obj | number[])> (reference: ValueType, value: ValueType[] | ValueType) {
  // Base value is Array
  if (Array.isArray(reference)) {
    if (__DEV__ && !Array.isArray(value)) {
      console.warn(`"to" need to be Array because "reference" is an Array ; your "reference" is ${typeof reference}: (${JSON.stringify(reference)}) and "to" is ${typeof value}: ${JSON.stringify(value)}`)
    }

    // Array of Number type
    if (!isNaN((value as number[])[0])) {
      return ValueEnum.ArrayNumber
    }

    if (__DEV__ && !Array.isArray((value as number[])[0])) {
      console.warn(`If your "reference" is an Array, your "to" need to be an Array of Number or an Array of Array of Number (to crate a path), you can not have Array of other type: ${typeof (value as number[])[0]} for your "to" ${JSON.stringify(value)}`)
    }

    // Array of Path type
    return ValueEnum.ArrayPath

    // // Array of number type
    // if (!isNaN(value[0])) {
    //   return ValueEnum.ArrayNumber
  }

  // Base value is Object
  if (__DEV__ && !(reference instanceof Object)) {
    console.warn(`reference need to be Array of number or Object of numbers ; your reference is ${typeof reference}: (${JSON.stringify(reference)})`)
  }

  // If Array of Object
  if (Array.isArray(value)) {
    if (__DEV__) {
      if (!(value[0] instanceof Object)) {
        console.warn(`If your "reference" is an Object, your "to" need to be an Object of Number or an Array of Object of Number (to create a path), you can not have other type: ${typeof value[0]} for your "to" ${JSON.stringify(value)}`)
      }

      const objValues = Object.values(value[0])
      if (isNaN(objValues[0])) {
        console.warn(`If your "reference" is an Object, your "to" need to be an Object of Number or an Array of Object of Number (to create a path), you can not have other type: ${typeof objValues[0]} for your "to" ${JSON.stringify(value)}`)
      }
    }

    return ValueEnum.ObjectPath
  }

  if (__DEV__) {
    const objValues = Object.values(value)
    if (isNaN(objValues[0])) {
      console.warn(`If your "reference" is an Object, your "to" need to be an Object of Number or an Array of Object of Number (to create a path), you can not have other type: ${typeof objValues[0]} for your "to" ${JSON.stringify(value)}`)
    }
  }

  return ValueEnum.ObjectNumber

  // if (Array.isArray(value)) {

  //   // Array of number type
  //   if (!isNaN(value[0])) {
  //     return ValueEnum.ArrayNumber

  //   // Array of path type
  //   } else if (Array.isArray(value[0])) {

  //     if (__DEV__ && typeof !isNaN(value[0][0])) {
  //       console.warn(`to argument need to be Number, Array of Number, Object or Array of Object, you can not have Array of other type like ${ typeof value[0][0] } to your object (${ JSON.stringify(value) })`)
  //     }

  //     return ValueEnum.ArrayPath

  //   // Array of Object type
  //   } else {

  //     if (__DEV__ && typeof !isNaN(value[0][0])) {
  //       console.warn(`to argument need to be Number, Array of Number, Object or Array of Object, you can not have Array of other type like ${ typeof value[0][0] } to your object (${ JSON.stringify(value) })`)
  //     }

  //   }
  // }

  // // Object type
  // if (!Array.isArray(value)) {
  //   return ValueEnum.ObjectNumber

  // // Array type
  // } else if (typeof value[0] === 'number') {
  //   return ValueEnum.ArrayNumber

  // // Path of array type
  // } else if (Array.isArray(value[0])) {
  //   return ValueEnum.ArrayPath
  // }

  // // Path of object type
  // return ValueEnum.ObjectPath
}

/**
 * Format ease input to Easing type
 */
const formatEase = (ease: SimpleEase) => {
  if (Array.isArray(ease)) {
    // If array of number create a cubic bezier
    if (!isNaN(ease[0] as number)) {
      return cubicBezier(...(ease as [number, number, number, number]))
    }

    return multiEasing(...(ease as Parameters<typeof multiEasing>)
      .map((data): Easing | Parameters<typeof multiEasing>[0] => {
        if (data instanceof Function) {
          return formatEase(data)
        }
        return {
          duration: data.duration,
          value: data.value,
          ease: formatEase(data.ease)
        }
      }))
  }

  if (__DEV__ && !(ease instanceof Function)) {
    console.warn(`"ease" need to be an Easing function, an array of Easing function, an array of 4 Number to create a Cubic Bezier or an array of multi easing options, example: "[{ ease: EaseInExpo, duration: 3, value: 2 }, { ease: [ 0.25, 0, 0.3, 1 ], duration: 2 }, { ease: EaseOutExpo, value: 4 }]", and not a ${typeof ease}: ${JSON.stringify(ease)}`)
  }

  return ease
}

export class Tween<ValueType extends (Obj | number[])> extends Emit<TweenEmitCallback<ValueType>> {
  private readonly _play = this.emit.bind(this, 'play')
  private readonly _pause = this.emit.bind(this, 'pause')
  private readonly _start = this.emit.bind(this, 'start')
  private readonly _end = this.emit.bind(this, 'end')

  private readonly _valueType: ValueEnum
  private readonly _keys: Array<keyof ValueType>
  private readonly _tween: TimelineTween<number[]> | DynamicTween<number[]>

  reference: ValueType

  constructor (
    reference: ValueType,
    to: ValueType | ValueType[],
    options: AutoTweenOptions = {}
  ) {
    super()

    this._update = this._update.bind(this)

    this.reference = reference
    this._valueType = getValueEnum(reference, to)

    switch (this._valueType) {
      case ValueEnum.ObjectNumber :
        this._keys = Object.keys(to as Obj) as Array<keyof ValueType>
        break
      case ValueEnum.ArrayNumber :
        this._keys = [...(to as number[]).keys()] as Array<keyof ValueType>
        break
      case ValueEnum.ArrayPath :
        this._keys = [...(to as number[][])[0].keys()] as Array<keyof ValueType>
        break
      case ValueEnum.ObjectPath :
        this._keys = Object.keys((to as Obj[])[0]) as Array<keyof ValueType>
        break
    }

    if (options.timer === null || options.timer === undefined) {
      options.timer = new Timeline(options.timeline)
    }

    if (options.ease !== undefined) {
      options.ease = formatEase(options.ease)
    }

    if (options.isDynamic === true && (this._valueType === ValueEnum.ArrayPath || this._valueType === ValueEnum.ObjectPath)) {
      throw new Error('Can not use path for dynamic tween')
    }

    if (options.isDynamic === true) {
      this._tween = new DynamicTween(
        this._keys.map((key) =>
          reference[key] as number
        ),
        options as CleanAutoTweenOptions
      )

      this._tween.to(this._refToArray(to, options.path) as number[])
    } else if (this._valueType === ValueEnum.ArrayNumber || this._valueType === ValueEnum.ObjectNumber) {
      this._tween = new TimelineTween(
        [
          this._valueToArray(reference),
          this._refToArray(to, options.path) as number[]
        ],
        options as CleanAutoTweenOptions
      )
    } else {
      this._tween = new TimelineTween(
        this._refToArray([reference, ...(to as ValueType[])], options.path) as PathType,
        options as CleanAutoTweenOptions
      )
    }

    this._tween.on('update', this._update)
    this._tween.on('play', this._play)
    this._tween.on('pause', this._pause)
    this._tween.on('start', this._start)
    this._tween.on('end', this._end)
  }

  _valueToArray (value: ValueType) {
    return this._keys.map(key => (value)[key] as number)
  }

  _refToArray (ref: ValueType | ValueType[], options: AutoTweenOptions['path'] = {}) {
    const enumType = this._valueType

    // Is not path
    if (enumType === ValueEnum.ArrayNumber || enumType === ValueEnum.ObjectNumber) {
      return this._valueToArray(ref as ValueType)
    }

    // Is path
    if (options?.checkpoint === true) {
      return CheckpointSmoothPath((ref as ValueType[]).map(this._valueToArray.bind(this)), options)
    } else {
      return ErodeSmoothPath((ref as any).map(this._valueToArray.bind(this)), options)
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
    this._tween.to(this._valueToArray(value), options as CleanAutoTweenOptions)
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
    if (this._valueType === ValueEnum.ObjectNumber || this._valueType === ValueEnum.ObjectPath) {
      return this._keys.reduce<Obj>((obj, key, index) => ({ ...obj, [key]: value[index] }), {}) as ValueType
    }

    return this._keys.reduce<number[]>((array, key, index) => {
      array[key as number] = value[index]
      return array
    }, []) as ValueType
  }
}
