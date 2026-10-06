import React from 'react';
interface IProps {
    mxEvent: any;
    onHeightChanged: () => void;
}
interface IState {
    decryptedUrl: string | null;
    decryptedThumbnailUrl: string | null;
    decryptedBlob: Blob | null;
    error: any | null;
    fetchingData: boolean;
}
export default class MVideoBody extends React.PureComponent<IProps, IState> {
    private videoRef;
    constructor(props: any);
    thumbScale(fullWidth: number, fullHeight: number, thumbWidth: number, thumbHeight: number): number;
    private getContentUrl;
    private hasContentUrl;
    private getThumbUrl;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    private videoOnPlay;
    render(): JSX.Element;
}
export {};
