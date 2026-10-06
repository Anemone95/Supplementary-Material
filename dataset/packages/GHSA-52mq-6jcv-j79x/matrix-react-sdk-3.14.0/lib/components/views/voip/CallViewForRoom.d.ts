import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import React from 'react';
interface IProps {
    roomId: string;
    maxVideoHeight?: number;
    onResize?: any;
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
    render(): JSX.Element;
}
export {};
