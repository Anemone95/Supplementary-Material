import React from 'react';
interface IState {
    autoLaunch: boolean;
    autoLaunchSupported: boolean;
    warnBeforeExit: boolean;
    warnBeforeExitSupported: boolean;
    alwaysShowMenuBarSupported: boolean;
    alwaysShowMenuBar: boolean;
    minimizeToTraySupported: boolean;
    minimizeToTray: boolean;
    autocompleteDelay: string;
    readMarkerInViewThresholdMs: string;
    readMarkerOutOfViewThresholdMs: string;
}
export default class PreferencesUserSettingsTab extends React.Component<{}, IState> {
    static ROOM_LIST_SETTINGS: string[];
    static COMPOSER_SETTINGS: string[];
    static TIMELINE_SETTINGS: string[];
    static GENERAL_SETTINGS: string[];
    constructor(props: any);
    componentDidMount(): Promise<void>;
    private onAutoLaunchChange;
    private onWarnBeforeExitChange;
    private onAlwaysShowMenuBarChange;
    private onMinimizeToTrayChange;
    private onAutocompleteDelayChange;
    private onReadMarkerInViewThresholdMs;
    private onReadMarkerOutOfViewThresholdMs;
    private renderGroup;
    render(): JSX.Element;
}
export {};
