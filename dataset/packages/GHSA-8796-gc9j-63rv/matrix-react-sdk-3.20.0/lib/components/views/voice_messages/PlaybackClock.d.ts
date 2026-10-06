import React from "react";
import { Playback, PlaybackState } from "../../../voice/Playback";
interface IProps {
    playback: Playback;
}
interface IState {
    seconds: number;
    durationSeconds: number;
    playbackPhase: PlaybackState;
}
/**
 * A clock for a playback of a recording.
 */
export default class PlaybackClock extends React.PureComponent<IProps, IState> {
    constructor(props: any);
    private onPlaybackUpdate;
    private onTimeUpdate;
    render(): JSX.Element;
}
export {};
