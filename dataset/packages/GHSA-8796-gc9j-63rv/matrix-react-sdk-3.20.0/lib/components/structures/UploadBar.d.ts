import React from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import { IUpload } from "../../models/IUpload";
interface IProps {
    room: Room;
}
interface IState {
    currentUpload?: IUpload;
    uploadsHere: IUpload[];
}
export default class UploadBar extends React.Component<IProps, IState> {
    private dispatcherRef;
    private mounted;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private getUploadsInRoom;
    private onAction;
    private onCancelClick;
    render(): JSX.Element;
}
export {};
