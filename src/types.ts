export type Easing = (progress: number) => number

export interface InterpolateType<ValueType> {
  duration: number;
  delay: number;
  ease: Easing;
  path: PathType
  getValue: (time: number) => ValueType
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

export interface TweenOptions<ValueType> extends InterpolateOptions {
  timer?: TickerType | null

  onStart?: () => void
  onUpdate?: (value: ValueType) => void
  onEnd?: (value: ValueType) => void
  onPause?: () => void
  onPlay?: () => void
}

export interface DynamicTweenOptions<ValueType> extends TweenOptions<ValueType>, InterpolateOptions {
  msPerUnit?: number
}

export interface TweenType<ValueType> {
  isStarted: boolean
  timer: TickerType | null

  getValue: (time: number) => ValueType
  dispose: () => void
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

export type TweenEmitCallback<ValueType> = EmitCallback<'update', ValueType> | EmitCallback<TickerEvent, void>

export type PathType = {
  (x: number): number[];
  distance: number;
  wasNumberList: boolean
}
