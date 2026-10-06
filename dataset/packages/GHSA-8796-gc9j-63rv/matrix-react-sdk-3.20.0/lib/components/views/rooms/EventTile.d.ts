import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from "matrix-js-sdk/src/models/relations";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { Layout } from "../../../settings/Layout";
import { EditorStateTransfer } from "../../../utils/EditorStateTransfer";
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
export declare function getHandlerTile(ev: any): any;
interface IReadReceiptProps {
    userId: string;
    roomMember: RoomMember;
    ts: number;
}
interface IProps {
    mxEvent: MatrixEvent;
    isRedacted?: boolean;
    continuation?: boolean;
    last?: boolean;
    lastInSection?: boolean;
    lastSuccessful?: boolean;
    contextual?: boolean;
    highlights?: string[];
    highlightLink?: string;
    showUrlPreview?: boolean;
    isSelectedEvent?: boolean;
    onHeightChanged?: () => void;
    readReceipts?: IReadReceiptProps[];
    readReceiptMap?: any;
    checkUnmounting?: () => boolean;
    eventSendStatus?: string;
    tileShape?: 'notif' | 'file_grid' | 'reply' | 'reply_preview';
    isTwelveHour?: boolean;
    getRelationsForEvent?: (eventId: string, relationType: string, eventType: string) => Relations;
    showReactions?: boolean;
    layout: Layout;
    enableFlair?: boolean;
    showReadReceipts?: boolean;
    editState?: EditorStateTransfer;
    replacingEventId?: string;
    permalinkCreator?: RoomPermalinkCreator;
}
interface IState {
    actionBarFocused: boolean;
    allReadAvatars: boolean;
    verified: string;
    previouslyRequestedKeys: boolean;
    reactions: Relations;
}
export default class EventTile extends React.Component<IProps, IState> {
    private suppressReadReceiptAnimation;
    private isListeningForReceipts;
    private tile;
    private replyThread;
    static defaultProps: {
        onHeightChanged: () => void;
    };
    static contextType: React.Context<any>;
    constructor(props: any, context: any);
    /**
     * When true, the tile qualifies for some sort of special read receipt. This could be a 'sending'
     * or 'sent' receipt, for example.
     * @returns {boolean}
     */
    private get isEligibleForSpecialReceipt();
    private get shouldShowSentReceipt();
    private get shouldShowSendingReceipt();
    UNSAFE_componentWillMount(): void;
    componentDidMount(): void;
    UNSAFE_componentWillReceiveProps(nextProps: any): void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
    private onRoomReceipt;
    /** called when the event is decrypted after we show it.
     */
    private onDecrypted;
    private onDeviceVerificationChanged;
    private onUserVerificationChanged;
    private verifyEvent;
    private propsEqual;
    shouldHighlight(): any;
    toggleAllReadAvatars: () => void;
    getReadAvatars(): JSX.Element;
    onSenderProfileClick: (event: any) => void;
    onRequestKeysClick: () => void;
    onPermalinkClicked: (e: any) => void;
    private renderE2EPadlock;
    onActionBarFocusChange: (focused: any) => void;
    getTile: () => unknown;
    getReplyThread: () => unknown;
    getReactions: () => any;
    private onReactionsCreated;
    render(): JSX.Element;
}
export declare function haveTileForEvent(e: any): boolean;
export {};
