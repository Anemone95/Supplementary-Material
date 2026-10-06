import React from "react";
import { VoiceRecording } from "../../../voice/VoiceRecording";
interface IProps {
    recorder: VoiceRecording;
}
interface IState {
    seconds: number;
}
/**
 * A clock for a live recording.
 */
export default class LiveRecordingClock extends React.PureComponent<IProps, IState> {
    constructor(props: any);
    private onRecordingUpdate;
    render(): JSX.Element;
}
export {};
