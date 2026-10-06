import { VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { RightPanelPhases } from "../../stores/RightPanelStorePhases";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface SetRightPanelPhasePayload extends ActionPayload {
    action: Action.SetRightPanelPhase;
    phase: RightPanelPhases;
    refireParams?: SetRightPanelPhaseRefireParams;
}
export interface SetRightPanelPhaseRefireParams {
    member?: RoomMember;
    verificationRequest?: VerificationRequest;
    groupId?: string;
    groupRoomId?: string;
    event?: any;
    widgetId?: string;
    space?: Room;
}
