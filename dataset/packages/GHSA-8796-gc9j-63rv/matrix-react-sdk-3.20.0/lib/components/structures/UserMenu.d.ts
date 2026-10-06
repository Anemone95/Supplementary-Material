import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps {
    isMinimized: boolean;
}
declare type PartialDOMRect = Pick<DOMRect, "width" | "left" | "top" | "height">;
interface IState {
    contextMenuPosition: PartialDOMRect;
    isDarkTheme: boolean;
    selectedSpace?: Room;
}
export default class UserMenu extends React.Component<IProps, IState> {
    private dispatcherRef;
    private themeWatcherRef;
    private dndWatcherRef;
    private buttonRef;
    private tagStoreRef;
    constructor(props: IProps);
    private get hasHomePage();
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onTagStoreUpdate;
    private isUserOnDarkTheme;
    private onProfileUpdate;
    private onSelectedSpaceUpdate;
    private onThemeChanged;
    private onAction;
    private onOpenMenuClick;
    private onContextMenu;
    private onCloseMenu;
    private onSwitchThemeClick;
    private onSettingsOpen;
    private onShowArchived;
    private onProvideFeedback;
    private onSignOutClick;
    private onSignInClick;
    private onRegisterClick;
    private onHomeClick;
    private onCommunitySettingsClick;
    private onCommunityMembersClick;
    private onCommunityInviteClick;
    private onDndToggle;
    private renderContextMenu;
    render(): JSX.Element;
}
export {};
