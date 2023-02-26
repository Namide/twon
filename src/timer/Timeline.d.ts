import { Emit } from '../core/Emit.js';
import { type EmitCallback, type TickerEvent, type TickerType } from '../types.js';
type EmitCb = EmitCallback<'update', number> | EmitCallback<TickerEvent, void>;
export declare class Timeline extends Emit<EmitCb> implements TickerType {
    private _id;
    private _last;
    time: number;
    autoDispose: boolean;
    isPlaying: boolean;
    isLooping: boolean;
    autoReverse: boolean;
    speed: number;
    duration: number;
    constructor({ loop, play, speed, duration, autoReverse }?: {
        loop?: boolean | undefined;
        play?: boolean | undefined;
        speed?: number | undefined;
        duration?: number | undefined;
        autoReverse?: boolean | undefined;
    });
    setDuration(duration: number): this;
    reverse(): this;
    seek(time: number): this;
    play(): this;
    pause(): this;
    tick(): this;
}
export {};
