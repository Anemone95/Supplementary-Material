import React from "react";
import { VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { ReciprocateQRCode } from "matrix-js-sdk/src/crypto/verification/QRCode";
import { SAS } from "matrix-js-sdk/src/crypto/verification/SAS";
declare enum VerificationPhase {
    PHASE_UNSENT = 0,
    PHASE_REQUESTED = 1,
    PHASE_READY = 2,
    PHASE_DONE = 3,
    PHASE_STARTED = 4,
    PHASE_CANCELLED = 5
}
interface IProps {
    layout: string;
    request: VerificationRequest;
    member: RoomMember;
    phase: VerificationPhase;
    onClose: () => void;
    isRoomEncrypted: boolean;
    inDialog: boolean;
    key: number;
}
interface IState {
    sasEvent?: SAS;
    emojiButtonClicked?: boolean;
    reciprocateButtonClicked?: boolean;
    reciprocateQREvent?: ReciprocateQRCode;
}
export default class VerificationPanel extends React.PureComponent<IProps, IState> {
    private hasVerifier;
    constructor(props: IProps);
    private renderQRPhase;
    private onReciprocateYesClick;
    private onReciprocateNoClick;
    private getDevice;
    private renderQRReciprocatePhase;
    private renderVerifiedPhase;
    private renderCancelledPhase;
    render(): JSX.Element;
    private startSAS;
    private onSasMatchesClick;
    private onSasMismatchesClick;
    private updateVerifierState;
    private onRequestChange;
    componentDidMount(): void;
    componentWillUnmount(): void;
}
export {};
