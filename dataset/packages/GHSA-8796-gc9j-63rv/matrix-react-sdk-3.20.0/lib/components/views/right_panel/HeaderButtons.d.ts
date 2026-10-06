import React from 'react';
import { RightPanelPhases } from "../../../stores/RightPanelStorePhases";
import { SetRightPanelPhaseRefireParams } from '../../../dispatcher/payloads/SetRightPanelPhasePayload';
export declare enum HeaderKind {
    Room = "room",
    Group = "group"
}
interface IState {
    headerKind: HeaderKind;
    phase: RightPanelPhases;
}
interface IProps {
}
export default abstract class HeaderButtons extends React.Component<IProps, IState> {
    private storeToken;
    private dispatcherRef;
    constructor(props: IProps, kind: HeaderKind);
    componentDidMount(): void;
    componentWillUnmount(): void;
    protected abstract onAction(payload: any): any;
    setPhase(phase: RightPanelPhases, extras?: Partial<SetRightPanelPhaseRefireParams>): void;
    isPhase(phases: string | string[]): boolean;
    private onRightPanelUpdate;
    abstract renderButtons(): JSX.Element[];
    render(): JSX.Element;
}
export {};
