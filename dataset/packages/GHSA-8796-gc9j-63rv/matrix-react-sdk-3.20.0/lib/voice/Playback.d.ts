/// <reference types="node" />
import EventEmitter from "events";
import { SimpleObservable } from "matrix-widget-api";
import { IDestroyable } from "../utils/IDestroyable";
import { PlaybackClock } from "./PlaybackClock";
export declare enum PlaybackState {
    Decoding = "decoding",
    Stopped = "stopped",
    Paused = "paused",
    Playing = "playing"
}
export declare const PLAYBACK_WAVEFORM_SAMPLES = 35;
export declare class Playback extends EventEmitter implements IDestroyable {
    private buf;
    private readonly context;
    private source;
    private state;
    private audioBuf;
    private resampledWaveform;
    private waveformObservable;
    private readonly clock;
    /**
     * Creates a new playback instance from a buffer.
     * @param {ArrayBuffer} buf The buffer containing the sound sample.
     * @param {number[]} seedWaveform Optional seed waveform to present until the proper waveform
     * can be calculated. Contains values between zero and one, inclusive.
     */
    constructor(buf: ArrayBuffer, seedWaveform?: number[]);
    get waveform(): number[];
    get waveformData(): SimpleObservable<number[]>;
    get clockInfo(): PlaybackClock;
    get currentState(): PlaybackState;
    get isPlaying(): boolean;
    emit(event: PlaybackState, ...args: any[]): boolean;
    destroy(): void;
    prepare(): Promise<void>;
    private onPlaybackEnd;
    play(): Promise<void>;
    pause(): Promise<void>;
    stop(): Promise<void>;
    toggle(): Promise<void>;
}
