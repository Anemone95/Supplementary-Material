import React from 'react';
interface IProps {
}
interface IThemeState {
    theme: string;
    useSystemTheme: boolean;
}
export interface CustomThemeMessage {
    isError: boolean;
    text: string;
}
interface IState extends IThemeState {
    fontSize: string;
    customThemeUrl: string;
    customThemeMessage: CustomThemeMessage;
    useCustomFontSize: boolean;
    useSystemFont: boolean;
    systemFont: string;
    showAdvanced: boolean;
    useIRCLayout: boolean;
}
export default class AppearanceUserSettingsTab extends React.Component<IProps, IState> {
    private readonly MESSAGE_PREVIEW_TEXT;
    private themeTimer;
    constructor(props: IProps);
    private calculateThemeState;
    private onThemeChange;
    private onUseSystemThemeChanged;
    private onFontSizeChanged;
    private onValidateFontSize;
    private onAddCustomTheme;
    private onCustomThemeChange;
    private onLayoutChange;
    private renderThemeSection;
    private renderFontSection;
    private renderLayoutSection;
    private renderAdvancedSection;
    render(): JSX.Element;
}
export {};
