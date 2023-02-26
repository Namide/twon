export type Easing = (progress: number) => number

export interface TweenOptions<ValueType> {
  duration?: number
  delay?: number
  ease?: Easing
  from: ValueType & (number | number[])
  to: ValueType & (number | number[])
}

export interface DynamicTweenOptions<ValueType> extends TweenOptions<ValueType>, InterpolateOptions<ValueType> { }

export type TweenEvent = 'play' | 'pause' | 'end' | 'start' | 'update'

export interface TweenType<ValueType> {
  // onStart?: () => void
  // onUpdate?: (value: TweenClass['from']) => void
  // onEnd?: (value: TweenClass['from']) => void
  // onPause?: () => void
  // onPlay?: () => void

  isStarted: boolean
  timer: TickerType | null

  getValue: (time: number) => ValueType

  // play: () => this
  // pause: () => this

  dispose: () => void
}

export interface InterpolateOptions<ValueType> {
  onStart?: () => void
  onUpdate?: (value: ValueType) => void
  onEnd?: (value: ValueType) => void
  onPause?: () => void
  onPlay?: () => void

  timer?: TickerType
}

export type TickerEvent = 'play' | 'pause' | 'disable' | 'enable' | 'update' | 'start' | 'end'

export interface EmitType<Event extends string> {
  on: (event: Event, callback?: (...arg: any) => void) => any
  off: (event: Event, callback?: (...arg: any) => void) => any
}

export interface TickerType extends EmitType<TickerEvent> {
  time: number
  autoDispose: boolean
  tick: () => any
  setDuration?: (time: number) => any
}

export interface EmitCallback<Event extends string, Arg> { event: Event, callback: (arg: Arg) => void }
