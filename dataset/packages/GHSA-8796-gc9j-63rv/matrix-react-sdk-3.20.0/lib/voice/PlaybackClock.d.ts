import { SimpleObservable } from "matrix-widget-api";
import { IDestroyable } from "../utils/IDestroyable";
export declare class PlaybackClock implements IDestroyable {
    private context;
    private clipStart;
    private stopped;
    private lastCheck;
    private observable;
    private timerId;
    private clipDuration;
    constructor(context: AudioContext);
    get durationSeconds(): number;
    set durationSeconds(val: number);
    get timeSeconds(): number;
    get liveData(): SimpleObservable<number[]>;
    private checkTime;
    flagStart(): void;
    flagStop(): void;
    destroy(): void;
}
