import { MatrixCall } from "matrix-js-sdk/src/webrtc/call";
export declare const PROTOCOL_PSTN = "m.protocol.pstn";
export declare const PROTOCOL_PSTN_PREFIXED = "im.vector.protocol.pstn";
export declare const PROTOCOL_SIP_NATIVE = "im.vector.protocol.sip_native";
export declare const PROTOCOL_SIP_VIRTUAL = "im.vector.protocol.sip_virtual";
export declare const VIRTUAL_ROOM_EVENT_TYPE = "im.vector.is_virtual_room";
declare enum AudioID {
    Ring = "ringAudio",
    Ringback = "ringbackAudio",
    CallEnd = "callendAudio",
    Busy = "busyAudio"
}
interface ThirdpartyLookupResponseFields {
    virtual_mxid?: string;
    is_virtual?: boolean;
    native_mxid?: string;
    is_native?: boolean;
    lookup_success?: boolean;
}
interface ThirdpartyLookupResponse {
    userid: string;
    protocol: string;
    fields: ThirdpartyLookupResponseFields;
}
export declare enum PlaceCallType {
    Voice = "voice",
    Video = "video",
    ScreenSharing = "screensharing"
}
export default class CallHandler {
    private calls;
    private transferees;
    private audioPromises;
    private dispatcherRef;
    private supportsPstnProtocol;
    private pstnSupportPrefixed;
    private supportsSipNativeVirtual;
    private pstnSupportCheckTimer;
    private invitedRoomsAreVirtual;
    private invitedRoomCheckInProgress;
    private assertedIdentityNativeUsers;
    static sharedInstance(): CallHandler;
    roomIdForCall(call: MatrixCall): string;
    start(): void;
    stop(): void;
    private checkProtocols;
    getSupportsPstnProtocol(): any;
    getSupportsVirtualRooms(): any;
    pstnLookup(phoneNumber: string): Promise<ThirdpartyLookupResponse[]>;
    sipVirtualLookup(nativeMxid: string): Promise<ThirdpartyLookupResponse[]>;
    sipNativeLookup(virtualMxid: string): Promise<ThirdpartyLookupResponse[]>;
    private onCallIncoming;
    getCallForRoom(roomId: string): MatrixCall;
    getAnyActiveCall(): MatrixCall;
    getAllActiveCalls(): any[];
    getAllActiveCallsNotInRoom(notInThisRoomId: any): any[];
    getTransfereeForCallId(callId: string): MatrixCall;
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
