import { type InterpolateOptions, type Easing, type InterpolateType, type PathType, type TweenPathInput } from '../types.js'
import { easeInOutSine } from '../easing/easing.js'
import { FromToPath } from '../path/FromToPath.js'

export class Interpolate<ValueType extends number | number[]> implements InterpolateType<ValueType> {
  duration: number
  delay: number
  ease: Easing
  path: PathType

  constructor (rawPath: TweenPathInput<ValueType>, { duration = 1000, ease = easeInOutSine, delay = 0 }: InterpolateOptions) {
    this.duration = duration
    this.delay = delay
    this.ease = ease
    this.path = Array.isArray(rawPath) ? FromToPath(rawPath as unknown as ([number, number] | [number[], number[]])) : rawPath 
  }

  getValue (time: number): ValueType {
    const t = (time - this.delay) / this.duration
    const progress = t > 0 ? (t < 1 ? this.ease(t) : 1) : 0
    return this.getValueByProgress(progress)
  }

  getValueByProgress (progress: number) {
    return (this.path.wasNumberList === true ? this.path(progress)[0] : this.path(progress)) as ValueType
  }
}
