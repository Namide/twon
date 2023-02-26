import { type InterpolateOptions, type Easing } from '../types.js'
import { easeInOutSine } from '../easing/easing.js'

export class Interpolate<ValueType extends (number | number[])> {
  from: number[]
  to: number[]
  duration: number
  delay: number

  ease: Easing

  private readonly _isArray: boolean

  constructor ({ from, to, duration = 1000, ease = easeInOutSine, delay = 0 }: InterpolateOptions<ValueType>) {
    this.from = Array.isArray(from) ? from : [from]
    this.to = Array.isArray(to) ? to : [to]
    this.duration = duration
    this.delay = delay

    this.ease = ease

    this._isArray = Array.isArray(from)
  }

  getValue (time: number): ValueType {
    const progress = (time - this.delay) / this.duration

    if (progress <= 0) {
      return (this._isArray ? this.from : this.from[0]) as ValueType
    }

    if (progress >= 1) {
      return (this._isArray ? this.to : this.to[0]) as ValueType
    }

    const val = this.from.map((from, index) => this.ease(progress) * (this.to[index] - from) + from)
    return (this._isArray ? val : val[0]) as ValueType
  }
}
