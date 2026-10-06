import React, { ReactNode } from "react";
import { RecordingState, VoiceRecording } from "../../../voice/VoiceRecording";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps {
    room: Room;
}
interface IState {
    recorder?: VoiceRecording;
    recordingPhase?: RecordingState;
}
/**
 * Container tile for rendering the voice message recorder in the composer.
 */
export default class VoiceRecordComposerTile extends React.PureComponent<IProps, IState> {
    constructor(props: any);
    componentWillUnmount(): Promise<void>;
    send(): Promise<void>;
    private disposeRecording;
    private onCancel;
    private onRecordStartEndClick;
    private renderWaveformArea;
    render(): ReactNode;
}
export {};
