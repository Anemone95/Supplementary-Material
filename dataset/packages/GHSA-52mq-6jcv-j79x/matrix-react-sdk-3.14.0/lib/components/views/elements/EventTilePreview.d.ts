import React from 'react';
interface IProps {
    /**
     * The text to be displayed in the message preview
     */
    message: string;
    /**
     * Whether to use the irc layout or not
     */
    useIRCLayout: boolean;
    /**
     * classnames to apply to the wrapper of the preview
     */
    className: string;
}
interface IState {
    userId: string;
    displayname: string;
    avatar_url: string;
}
export default class EventTilePreview extends React.Component<IProps, IState> {
    constructor(props: IProps);
    componentDidMount(): Promise<void>;
    private fakeEvent;
    render(): JSX.Element;
}
export {};
