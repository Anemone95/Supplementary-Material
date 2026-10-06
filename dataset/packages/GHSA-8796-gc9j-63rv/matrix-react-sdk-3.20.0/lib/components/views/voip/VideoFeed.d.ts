import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import React from 'react';
export declare enum VideoFeedType {
    Local = 0,
    Remote = 1
}
interface IProps {
    call: MatrixCall;
    type: VideoFeedType;
    onResize?: (e: Event) => void;
}
export default class VideoFeed extends React.Component<IProps> {
    private vid;
    componentDidMount(): void;
    componentDidUpdate(prevProps: any): void;
    componentWillUnmount(): void;
    private setVideoElement;
    onResize: (e: any) => void;
    render(): JSX.Element;
}
export {};
