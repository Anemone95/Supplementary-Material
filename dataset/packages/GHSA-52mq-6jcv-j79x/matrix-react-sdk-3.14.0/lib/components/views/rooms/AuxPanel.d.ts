import React from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import { ResizeNotifier } from "../../../utils/ResizeNotifier";
interface IProps {
    room: Room;
    userId: string;
    showApps: boolean;
    draggingFile: boolean;
    maxHeight: number;
    onResize: () => void;
    fullHeight: boolean;
    resizeNotifier: ResizeNotifier;
}
interface Counter {
    title: string;
    value: number;
    link: string;
    severity: string;
    stateKey: string;
}
interface IState {
    counters: Counter[];
}
export default class AuxPanel extends React.Component<IProps, IState> {
    static defaultProps: {
        showApps: boolean;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    componentDidUpdate(prevProps: any, prevState: any): void;
    onConferenceNotificationClick: (ev: any, type: any) => void;
    _rateLimitedUpdate: any;
    _computeCounters(): any[];
    render(): JSX.Element;
}
export {};
