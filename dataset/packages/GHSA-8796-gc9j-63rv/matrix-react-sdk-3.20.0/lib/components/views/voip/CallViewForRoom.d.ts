import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import React from 'react';
import ResizeNotifier from "../../../utils/ResizeNotifier";
interface IProps {
    roomId: string;
    maxVideoHeight?: number;
    resizeNotifier: ResizeNotifier;
}
interface IState {
    call: MatrixCall;
}
export default class CallViewForRoom extends React.Component<IProps, IState> {
    private dispatcherRef;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onAction;
    private getCall;
    private onResizeStart;
    private onResize;
    private onResizeStop;
    render(): JSX.Element;
}
export {};
