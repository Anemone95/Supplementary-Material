/// <reference types="node" />
import React from 'react';
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
export declare const KIND_DM = "dm";
export declare const KIND_INVITE = "invite";
export declare const KIND_CALL_TRANSFER = "call_transfer";
declare class Member {
    /**
     * The display name of this Member. For users this should be their profile's display
     * name or user ID if none set. For 3PIDs this should be the 3PID address (email).
     */
    get name(): string;
    /**
     * The ID of this Member. For users this should be their user ID. For 3PIDs this should
     * be the 3PID address (email).
     */
    get userId(): string;
    /**
     * Gets the MXC URL of this Member's avatar. For users this should be their profile's
     * avatar MXC URL or null if none set. For 3PIDs this should always be null.
     */
    getMxcAvatarUrl(): string;
}
interface IInviteDialogProps {
    onFinished: (toInvite?: string[]) => any;
    kind: string;
    roomId: string;
    call: MatrixCall;
    initialText: string;
}
interface IInviteDialogState {
    targets: RoomMember[];
    filterText: string;
    recents: {
        user: Member;
        userId: string;
    }[];
    numRecentsShown: number;
    suggestions: {
        user: Member;
        userId: string;
    }[];
    numSuggestionsShown: number;
    serverResultsMixin: {
        user: Member;
        userId: string;
    }[];
    threepidResultsMixin: {
        user: Member;
        userId: string;
    }[];
    canUseIdentityServer: boolean;
    tryingIdentityServer: boolean;
    busy: boolean;
    errorText: string;
}
export default class InviteDialog extends React.PureComponent<IInviteDialogProps, IInviteDialogState> {
    static defaultProps: {
        kind: string;
        initialText: string;
    };
    _debounceTimer: NodeJS.Timeout;
    _editorRef: any;
    constructor(props: any);
    componentDidMount(): void;
    static buildRecents(excludedTargetIds: Set<string>): {
        userId: string;
        user: RoomMember;
        lastActive: number;
    }[];
    _buildSuggestions(excludedTargetIds: Set<string>): {
        userId: string;
        user: RoomMember;
    }[];
    _shouldAbortAfterInviteError(result: any): boolean;
    _convertFilter(): Member[];
    _startDm: () => Promise<void>;
    _inviteUsers: () => void;
    _transferCall: () => Promise<void>;
    _onKeyDown: (e: any) => void;
    _updateSuggestions: (term: any) => Promise<void>;
    _updateFilter: (e: any) => void;
    _showMoreRecents: () => void;
    _showMoreSuggestions: () => void;
    _toggleMember: (member: Member) => void;
    _removeMember: (member: Member) => void;
    _onPaste: (e: any) => Promise<void>;
    _onClickInputArea: (e: any) => void;
    _onUseDefaultIdentityServerClick: (e: any) => void;
    _onManageSettingsClick: (e: any) => void;
    _onCommunityInviteClick: (e: any) => void;
    _renderSection(kind: "recents" | "suggestions"): JSX.Element;
    _renderEditor(): JSX.Element;
    _renderIdentityServerWarning(): JSX.Element;
    render(): JSX.Element;
}
export {};
