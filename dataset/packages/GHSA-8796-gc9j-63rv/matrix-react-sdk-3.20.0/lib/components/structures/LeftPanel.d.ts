import * as React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import ResizeNotifier from "../../utils/ResizeNotifier";
interface IProps {
    isMinimized: boolean;
    resizeNotifier: ResizeNotifier;
}
interface IState {
    showBreadcrumbs: boolean;
    showGroupFilterPanel: boolean;
    activeSpace?: Room;
}
export default class LeftPanel extends React.Component<IProps, IState> {
    private listContainerRef;
    private groupFilterPanelWatcherRef;
    private bgImageWatcherRef;
    private focusedElement;
    private isDoingStickyHeaders;
    constructor(props: IProps);
    componentWillUnmount(): void;
    private updateActiveSpace;
    private onExplore;
    private onBreadcrumbsUpdate;
    private onBackgroundImageUpdate;
    private handleStickyHeaders;
    private doStickyHeaders;
    private onScroll;
    private onResize;
    private onFocus;
    private onBlur;
    private onKeyDown;
    private selectRoom;
    private onMoveFocus;
    private renderHeader;
    private renderBreadcrumbs;
    private renderSearchExplore;
    render(): React.ReactNode;
}
export {};
