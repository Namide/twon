import { PathType, type Easing, type InterpolatePathOptions } from '../types.js'
import { easeInOutSine } from '../easing/easing.js'

export class Interpolate<ValueType extends (number | number[])> {
  duration: number
  delay: number
  path: PathType<ValueType>
  ease: Easing

  constructor (path: PathType<ValueType>, { duration = 1000, ease = easeInOutSine, delay = 0 }: InterpolatePathOptions) {
    this.duration = duration
    this.delay = delay
    this.path = path
    this.ease = ease
  }

  getValue (time: number): ValueType {
    const progress = (time - this.delay) / this.duration
    return this.path(time)
  }
}
