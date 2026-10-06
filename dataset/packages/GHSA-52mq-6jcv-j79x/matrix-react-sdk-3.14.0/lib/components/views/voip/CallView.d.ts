import React from 'react';
import { CallState, MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
interface IProps {
    call: MatrixCall;
    secondaryCall?: MatrixCall;
    maxVideoHeight?: number;
    onResize?: any;
    pipMode?: boolean;
}
interface IState {
    isLocalOnHold: boolean;
    isRemoteOnHold: boolean;
    micMuted: boolean;
    vidMuted: boolean;
    callState: CallState;
    controlsVisible: boolean;
    showMoreMenu: boolean;
    showDialpad: boolean;
}
export default class CallView extends React.Component<IProps, IState> {
    private dispatcherRef;
    private contentRef;
    private controlsHideTimer;
    private dialpadButton;
    private contextMenuButton;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: any): void;
    private onAction;
    private updateCallListeners;
    private onCallState;
    private onCallLocalHoldUnhold;
    private onCallRemoteHoldUnhold;
    private onFullscreenClick;
    private onExpandClick;
    private onControlsHideTimer;
    private onMouseMove;
    private showControls;
    private onDialpadClick;
    private onMicMuteClick;
    private onVidMuteClick;
    private onMoreClick;
    private closeDialpad;
    private closeContextMenu;
    private onNativeKeyDown;
    private onRoomAvatarClick;
    private onSecondaryRoomAvatarClick;
    private onCallResumeClick;
    render(): JSX.Element;
}
export {};
