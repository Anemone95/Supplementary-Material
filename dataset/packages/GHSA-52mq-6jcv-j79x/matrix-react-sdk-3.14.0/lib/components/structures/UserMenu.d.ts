import React from "react";
interface IProps {
    isMinimized: boolean;
}
declare type PartialDOMRect = Pick<DOMRect, "width" | "left" | "top" | "height">;
interface IState {
    contextMenuPosition: PartialDOMRect;
    isDarkTheme: boolean;
}
export default class UserMenu extends React.Component<IProps, IState> {
    private dispatcherRef;
    private themeWatcherRef;
    private buttonRef;
    private tagStoreRef;
    constructor(props: IProps);
    private get hasHomePage();
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onTagStoreUpdate;
    private isUserOnDarkTheme;
    private onProfileUpdate;
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
    private renderContextMenu;
    render(): JSX.Element;
}
export {};
