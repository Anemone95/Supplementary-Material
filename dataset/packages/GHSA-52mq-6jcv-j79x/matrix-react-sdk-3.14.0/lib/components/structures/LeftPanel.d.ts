import * as React from "react";
import ResizeNotifier from "../../utils/ResizeNotifier";
interface IProps {
    isMinimized: boolean;
    resizeNotifier: ResizeNotifier;
}
interface IState {
    showBreadcrumbs: boolean;
    showGroupFilterPanel: boolean;
}
export default class LeftPanel extends React.Component<IProps, IState> {
    private listContainerRef;
    private groupFilterPanelWatcherRef;
    private bgImageWatcherRef;
    private focusedElement;
    private isDoingStickyHeaders;
    constructor(props: IProps);
    componentWillUnmount(): void;
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
    private onEnter;
    private onMoveFocus;
    private renderHeader;
    private renderBreadcrumbs;
    private renderSearchExplore;
    render(): React.ReactNode;
}
export {};
