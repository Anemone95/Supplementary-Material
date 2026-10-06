import React, { ReactNode } from "react";
import { Playback, PlaybackState } from "../../../voice/Playback";
interface IProps {
    playback: Playback;
    playbackPhase: PlaybackState;
}
/**
 * Displays a play/pause button (activating the play/pause function of the recorder)
 * to be displayed in reference to a recording.
 */
export default class PlayPauseButton extends React.PureComponent<IProps> {
    constructor(props: any);
    private onClick;
    render(): ReactNode;
}
export {};
