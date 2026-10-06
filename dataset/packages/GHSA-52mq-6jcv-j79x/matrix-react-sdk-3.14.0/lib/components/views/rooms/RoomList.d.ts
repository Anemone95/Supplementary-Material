import * as React from "react";
import { ResizeNotifier } from "../../../utils/ResizeNotifier";
import { ITagMap } from "../../../stores/room-list/algorithms/models";
interface IProps {
    onKeyDown: (ev: React.KeyboardEvent) => void;
    onFocus: (ev: React.FocusEvent) => void;
    onBlur: (ev: React.FocusEvent) => void;
    onResize: () => void;
    resizeNotifier: ResizeNotifier;
    isMinimized: boolean;
}
interface IState {
    sublists: ITagMap;
    isNameFiltering: boolean;
}
export default class RoomList extends React.PureComponent<IProps, IState> {
    private dispatcherRef;
    private customTagStoreRef;
    private tagAesthetics;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private updateDmAddRoomAction;
    private onAction;
    private getRoomDelta;
    private updateLists;
    private onStartChat;
    private onExplore;
    private renderCommunityInvites;
    private renderSublists;
    render(): JSX.Element;
}
export {};
