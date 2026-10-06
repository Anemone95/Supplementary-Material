import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
import ResizeNotifier from "../../../utils/ResizeNotifier";
import { E2EStatus } from '../../../utils/ShieldUtils';
interface IProps {
    room: Room;
    resizeNotifier: ResizeNotifier;
    permalinkCreator: RoomPermalinkCreator;
    replyToEvent?: MatrixEvent;
    e2eStatus?: E2EStatus;
}
interface IState {
    tombstone: MatrixEvent;
    canSendMessages: boolean;
    isComposerEmpty: boolean;
    haveRecording: boolean;
    recordingTimeLeftSeconds?: number;
    me?: RoomMember;
}
export default class MessageComposer extends React.Component<IProps, IState> {
    private dispatcherRef;
    private messageComposerInput;
    private voiceRecordingButton;
    constructor(props: any);
    componentDidMount(): void;
    private onAction;
    private waitForOwnMember;
    componentWillUnmount(): void;
    private onRoomStateEvents;
    private getRoomTombstone;
    private onTombstoneClick;
    private renderPlaceholderText;
    addEmoji(emoji: any): void;
    sendMessage: () => Promise<void>;
    onChange: (model: any) => void;
    private onVoiceStoreUpdate;
    render(): JSX.Element;
}
export {};
