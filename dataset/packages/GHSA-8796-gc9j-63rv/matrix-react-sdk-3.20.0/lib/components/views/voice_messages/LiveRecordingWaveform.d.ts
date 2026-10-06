import React from "react";
import { VoiceRecording } from "../../../voice/VoiceRecording";
interface IProps {
    recorder: VoiceRecording;
}
interface IState {
    heights: number[];
}
/**
 * A waveform which shows the waveform of a live recording
 */
export default class LiveRecordingWaveform extends React.PureComponent<IProps, IState> {
    constructor(props: any);
    private onRecordingUpdate;
    render(): JSX.Element;
}
export {};
