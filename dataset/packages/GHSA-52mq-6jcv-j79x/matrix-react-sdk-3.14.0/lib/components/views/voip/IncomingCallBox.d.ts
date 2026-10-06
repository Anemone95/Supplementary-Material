import React from 'react';
interface IProps {
}
interface IState {
    incomingCall: any;
}
export default class IncomingCallBox extends React.Component<IProps, IState> {
    private dispatcherRef;
    constructor(props: IProps);
    componentWillUnmount(): void;
    private onAction;
    private onAnswerClick;
    private onRejectClick;
    render(): JSX.Element;
}
export {};
