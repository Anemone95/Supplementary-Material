import React from 'react';
export interface DesktopCapturerSource {
    id: string;
    name: string;
    thumbnailURL: any;
}
export declare enum Tabs {
    Screens = "screens",
    Windows = "windows"
}
export interface DesktopCapturerSourceIProps {
    source: DesktopCapturerSource;
    onSelect(source: DesktopCapturerSource): void;
}
export declare class ExistingSource extends React.Component<DesktopCapturerSourceIProps> {
    constructor(props: any);
    onClick: (ev: any) => void;
    render(): JSX.Element;
}
export interface DesktopCapturerSourcePickerIState {
    selectedTab: Tabs;
    sources: Array<DesktopCapturerSource>;
}
export interface DesktopCapturerSourcePickerIProps {
    onFinished(source: DesktopCapturerSource): void;
}
export default class DesktopCapturerSourcePicker extends React.Component<DesktopCapturerSourcePickerIProps, DesktopCapturerSourcePickerIState> {
    interval: any;
    constructor(props: any);
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    onSelect: (source: any) => void;
    onScreensClick: (ev: any) => void;
    onWindowsClick: (ev: any) => void;
    onCloseClick: (ev: any) => void;
    render(): JSX.Element;
}
