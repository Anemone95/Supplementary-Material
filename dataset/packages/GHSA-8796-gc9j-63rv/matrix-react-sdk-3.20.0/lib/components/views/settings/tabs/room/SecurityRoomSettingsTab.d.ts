import React from 'react';
declare enum JoinRule {
    Public = "public",
    Knock = "knock",
    Invite = "invite",
    Private = "private"
}
declare enum GuestAccess {
    CanJoin = "can_join",
    Forbidden = "forbidden"
}
declare enum HistoryVisibility {
    Invited = "invited",
    Joined = "joined",
    Shared = "shared",
    WorldReadable = "world_readable"
}
interface IProps {
    roomId: string;
}
interface IState {
    joinRule: JoinRule;
    guestAccess: GuestAccess;
    history: HistoryVisibility;
    hasAliases: boolean;
    encrypted: boolean;
}
export default class SecurityRoomSettingsTab extends React.Component<IProps, IState> {
    constructor(props: any);
    UNSAFE_componentWillMount(): Promise<void>;
    private pullContentPropertyFromEvent;
    componentWillUnmount(): void;
    private onStateEvent;
    private onEncryptionChange;
    private fixGuestAccess;
    private onRoomAccessRadioToggle;
    private onHistoryRadioToggle;
    private updateBlacklistDevicesFlag;
    private hasAliases;
    private renderRoomAccess;
    private renderHistory;
    render(): JSX.Element;
}
export {};
