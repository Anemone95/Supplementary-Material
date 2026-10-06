import React from "react";
import { VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
interface IProps {
    member: RoomMember;
    onClose: () => void;
    verificationRequest: VerificationRequest;
    verificationRequestPromise: Promise<VerificationRequest>;
    layout: string;
    inDialog: boolean;
    isRoomEncrypted: boolean;
}
declare const EncryptionPanel: React.FC<IProps>;
export default EncryptionPanel;
