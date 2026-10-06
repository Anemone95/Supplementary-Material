import { MatrixCall } from "matrix-js-sdk/src/webrtc/call";
declare enum AudioID {
    Ring = "ringAudio",
    Ringback = "ringbackAudio",
    CallEnd = "callendAudio",
    Busy = "busyAudio"
}
export declare enum PlaceCallType {
    Voice = "voice",
    Video = "video",
    ScreenSharing = "screensharing"
}
export default class CallHandler {
    private calls;
    private audioPromises;
    private dispatcherRef;
    private supportsPstnProtocol;
    private pstnSupportCheckTimer;
    static sharedInstance(): CallHandler;
    static roomIdForCall(call: MatrixCall): string;
    start(): void;
    stop(): void;
    private checkForPstnSupport;
    getSupportsPstnProtocol(): any;
    private onCallIncoming;
    getCallForRoom(roomId: string): MatrixCall;
    getAnyActiveCall(): MatrixCall;
    getAllActiveCalls(): any[];
    getAllActiveCallsNotInRoom(notInThisRoomId: any): any[];
    play(audioId: AudioID): void;
    pause(audioId: AudioID): void;
    private matchesCallForThisRoom;
    private setCallListeners;
    private logCallStats;
    private setCallAudioElement;
    private setCallState;
    private removeCallForRoom;
    private showICEFallbackPrompt;
    private showMediaCaptureError;
    private placeCall;
    private onAction;
    setActiveCallRoomId(activeCallRoomId: string): void;
    /**
     * @returns true if we are currently in any call where we haven't put the remote party on hold
     */
    hasAnyUnheldCall(): boolean;
    private startCallApp;
    private terminateCallApp;
    private hangupCallApp;
}
export {};
