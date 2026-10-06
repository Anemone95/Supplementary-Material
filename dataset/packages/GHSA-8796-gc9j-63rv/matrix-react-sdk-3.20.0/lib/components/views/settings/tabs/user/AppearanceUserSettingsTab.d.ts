import React from 'react';
import { Layout } from "../../../../../settings/Layout";
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
    layout: Layout;
    userId: string;
    displayName: string;
    avatarUrl: string;
}
export default class AppearanceUserSettingsTab extends React.Component<IProps, IState> {
    private readonly MESSAGE_PREVIEW_TEXT;
    private themeTimer;
    constructor(props: IProps);
    componentDidMount(): Promise<void>;
    private calculateThemeState;
    private onThemeChange;
    private onUseSystemThemeChanged;
    private onFontSizeChanged;
    private onValidateFontSize;
    private onAddCustomTheme;
    private onCustomThemeChange;
    private onIRCLayoutChange;
    private renderThemeSection;
    private renderFontSection;
    private renderAdvancedSection;
    render(): JSX.Element;
}
export {};
