export type Easing = (progress: number) => number

export type MultiEasing = (...list: Array<Easing | { ease: Easing, time?: number, value?: number }>) => Easing

export interface InterpolateType<ValueType> {
  duration: number
  delay: number
  ease: Easing
  path: PathType
  getValue: (time: number) => ValueType
  getValueByProgress: (progress: number) => ValueType
}

export type TweenEvent = 'play' | 'pause' | 'end' | 'start' | 'update'

export type FromToRawPath = [number[], number[]] | [number, number]
export type RawPath = number[][] | number[]
export type TweenPathInput<ValueType extends number | number[]> = [ValueType, ValueType] | ValueType[] | FromToRawPath | RawPath | PathType

export interface InterpolateOptions {
  duration?: number
  delay?: number
  ease?: Easing
}

export interface TweenOptions extends InterpolateOptions {
  timer?: TickerType | null
}

export interface DynamicTweenOptions extends TweenOptions, InterpolateOptions {
  msPerUnit?: number
}

export interface TweenType<ValueType> {
  isStarted: boolean
  timer: TickerType | null

  getValue: (time?: number) => ValueType
  getTime: () => number
  dispose: () => void
}

export interface SmoothPathOptions { step?: number, keepStart?: boolean, keepEnd?: boolean, loop?: boolean }

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

export interface TimelineOptions { loop?: boolean, play?: boolean, speed?: number, duration?: number, autoReverse?: boolean }

export interface EmitCallback<Event extends string, Arg> { event: Event, callback: (arg: Arg) => void }

export type TweenEmitCallback<ValueType> = EmitCallback<'update', ValueType> | EmitCallback<TickerEvent, void>

export interface PathType {
  (x: number): number[]
  distance: number
  wasNumberList: boolean
}
