import React from 'react';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import { User } from 'matrix-js-sdk/src/models/user';
import { Room } from 'matrix-js-sdk/src/models/room';
import { RightPanelPhases } from "../../../stores/RightPanelStorePhases";
import EncryptionPanel from "./EncryptionPanel";
import { E2EStatus } from "../../../utils/ShieldUtils";
interface IDevice {
    deviceId: string;
    ambiguous?: boolean;
    getDisplayName(): string;
}
export declare const getE2EStatus: (cli: any, userId: string, devices: IDevice[]) => E2EStatus;
interface IPowerLevelsContent {
    events?: Record<string, number>;
    users_default?: number;
    events_default?: number;
    state_default?: number;
    ban?: number;
    kick?: number;
    redact?: number;
}
export declare const useRoomPowerLevels: (cli: any, room: any) => IPowerLevelsContent;
interface GroupMember {
    userId: string;
    displayname?: string;
    avatarUrl?: string;
}
export declare const useDevices: (userId: string) => any;
declare type Member = User | RoomMember | GroupMember;
interface IProps {
    user: Member;
    groupId?: string;
    room?: Room;
    phase: RightPanelPhases.RoomMemberInfo | RightPanelPhases.GroupMemberInfo | RightPanelPhases.SpaceMemberInfo;
    onClose(): void;
}
interface IPropsWithEncryptionPanel extends React.ComponentProps<typeof EncryptionPanel> {
    user: Member;
    groupId: void;
    room: Room;
    phase: RightPanelPhases.EncryptionPanel;
    onClose(): void;
}
declare type Props = IProps | IPropsWithEncryptionPanel;
declare const UserInfo: React.FC<Props>;
export default UserInfo;
