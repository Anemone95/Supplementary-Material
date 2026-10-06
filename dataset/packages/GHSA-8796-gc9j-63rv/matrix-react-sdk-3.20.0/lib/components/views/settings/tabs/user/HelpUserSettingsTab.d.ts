import React from 'react';
interface IProps {
    closeSettingsFn: () => {};
}
interface IState {
    appVersion: string;
    canUpdate: boolean;
}
export default class HelpUserSettingsTab extends React.Component<IProps, IState> {
    constructor(props: any);
    componentDidMount(): void;
    private onClearCacheAndReload;
    private onBugReport;
    private onStartBotChat;
    private showSpoiler;
    private renderLegal;
    private renderCredits;
    render(): JSX.Element;
}
export {};
