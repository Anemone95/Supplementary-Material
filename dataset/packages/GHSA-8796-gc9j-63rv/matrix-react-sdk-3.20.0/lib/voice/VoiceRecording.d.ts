/// <reference types="node" />
import { MatrixClient } from "matrix-js-sdk/src/client";
import { SimpleObservable } from "matrix-widget-api";
import EventEmitter from "events";
import { IDestroyable } from "../utils/IDestroyable";
import { Playback } from "./Playback";
export interface IRecordingUpdate {
    waveform: number[];
    timeSeconds: number;
}
export declare enum RecordingState {
    Started = "started",
    EndingSoon = "ending_soon",
    Ended = "ended",
    Uploading = "uploading",
    Uploaded = "uploaded"
}
export declare class VoiceRecording extends EventEmitter implements IDestroyable {
    private client;
    private recorder;
    private recorderContext;
    private recorderSource;
    private recorderStream;
    private recorderFFT;
    private recorderWorklet;
    private buffer;
    private mxc;
    private recording;
    private observable;
    private amplitudes;
    private playback;
    constructor(client: MatrixClient);
    get contentType(): string;
    get contentLength(): number;
    get durationSeconds(): number;
    get isRecording(): boolean;
    emit(event: string, ...args: any[]): boolean;
    private makeRecorder;
    private get audioBuffer();
    get liveData(): SimpleObservable<IRecordingUpdate>;
    get isSupported(): boolean;
    get hasRecording(): boolean;
    get mxcUri(): string;
    private processAudioUpdate;
    start(): Promise<void>;
    stop(): Promise<Uint8Array>;
    /**
     * Gets a playback instance for this voice recording. Note that the playback will not
     * have been prepared fully, meaning the `prepare()` function needs to be called on it.
     *
     * The same playback instance is returned each time.
     *
     * @returns {Playback} The playback instance.
     */
    getPlayback(): Playback;
    destroy(): void;
    upload(): Promise<string>;
}
