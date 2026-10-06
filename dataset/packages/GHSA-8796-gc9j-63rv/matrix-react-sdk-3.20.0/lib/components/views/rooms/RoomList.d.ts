import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { ResizeNotifier } from "../../../utils/ResizeNotifier";
import { ITagMap } from "../../../stores/room-list/algorithms/models";
import { ISpaceSummaryRoom } from "../../structures/SpaceRoomDirectory";
interface IProps {
    onKeyDown: (ev: React.KeyboardEvent) => void;
    onFocus: (ev: React.FocusEvent) => void;
    onBlur: (ev: React.FocusEvent) => void;
    onResize: () => void;
    resizeNotifier: ResizeNotifier;
    isMinimized: boolean;
    activeSpace: Room;
}
interface IState {
    sublists: ITagMap;
    isNameFiltering: boolean;
    currentRoomId?: string;
    suggestedRooms: ISpaceSummaryRoom[];
}
export default class RoomList extends React.PureComponent<IProps, IState> {
    private dispatcherRef;
    private customTagStoreRef;
    private tagAesthetics;
    private roomStoreToken;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onRoomViewStoreUpdate;
    private updateDmAddRoomAction;
    private onAction;
    private getRoomDelta;
    private updateSuggestedRooms;
    private updateLists;
    private onStartChat;
    private onExplore;
    private onSpaceInviteClick;
    private renderSuggestedRooms;
    private renderCommunityInvites;
    private renderSublists;
    render(): JSX.Element;
}
export {};
