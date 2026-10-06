import { Playback, PlaybackState } from "../../../voice/Playback";
import React, { ReactNode } from "react";
interface IProps {
    playback: Playback;
}
interface IState {
    playbackPhase: PlaybackState;
}
export default class RecordingPlayback extends React.PureComponent<IProps, IState> {
    constructor(props: IProps);
    private onPlaybackUpdate;
    render(): ReactNode;
}
export {};
