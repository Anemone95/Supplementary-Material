import React from 'react';
import Room from 'matrix-js-sdk/src/models/room';
import { ResizeMethod } from "../../../Avatar";
interface IProps {
    room?: Room;
    oobData?: any;
    width?: number;
    height?: number;
    resizeMethod?: ResizeMethod;
    viewAvatarOnClick?: boolean;
    onClick?(): void;
}
interface IState {
    urls: string[];
}
export default class RoomAvatar extends React.Component<IProps, IState> {
    static defaultProps: {
        width: number;
        height: number;
        resizeMethod: string;
        oobData: {};
    };
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    static getDerivedStateFromProps(nextProps: IProps): IState;
    private onRoomStateEvents;
    private static getImageUrls;
    private static getRoomAvatarUrl;
    private onRoomAvatarClick;
    render(): JSX.Element;
}
export {};
