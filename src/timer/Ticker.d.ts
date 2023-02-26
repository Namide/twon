import { Emit } from '../core/Emit.js';
import { type EmitCallback, type TickerEvent, type TickerType } from '../types.js';
type EmitCb = EmitCallback<'update', number> | EmitCallback<TickerEvent, void>;
export declare class Ticker extends Emit<EmitCb> implements TickerType {
    private _id;
    private _last;
    time: number;
    private _isEnabled;
    autoDispose: boolean;
    constructor();
    private enable;
    private disable;
    on(event: EmitCb['event'], callback?: EmitCb['callback']): this;
    off(event: EmitCb['event'], callback?: EmitCb['callback']): this;
    tick(): this;
}
export declare const globalTicker: Ticker;
export {};
