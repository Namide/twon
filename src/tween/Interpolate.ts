import { type InterpolateOptions, type Easing, type InterpolateType, type PathType, type TweenPathInput } from '../types.js'
import { easeInOutSine } from '../easing/easing.js'
import { RawToPath } from '../path/RawToPath.js'

export class Interpolate<ValueType extends number | number[]> implements InterpolateType<ValueType> {
  duration: number
  delay: number
  ease: Easing
  path: PathType

  constructor (rawPath: TweenPathInput<ValueType>, { duration = 1000, ease = easeInOutSine, delay = 0 }: InterpolateOptions) {
    this.duration = duration
    this.delay = delay
    this.ease = ease
    this.path = RawToPath(rawPath)
  }

  getValue (time: number): ValueType {
    const progress = this.ease((time - this.delay) / this.duration)
    return (this.path.wasNumberList === true ? this.path(progress)[0] : this.path(progress)) as ValueType
  }
}
