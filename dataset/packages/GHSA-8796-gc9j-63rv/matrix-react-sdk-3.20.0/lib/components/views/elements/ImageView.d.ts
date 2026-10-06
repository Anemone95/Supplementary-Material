import React from 'react';
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
interface IProps {
    src: string;
    name?: string;
    link?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    onFinished(): void;
    mxEvent: MatrixEvent;
    permalinkCreator: RoomPermalinkCreator;
}
interface IState {
    zoom: number;
    minZoom: number;
    maxZoom: number;
    rotation: number;
    translationX: number;
    translationY: number;
    moving: boolean;
    contextMenuDisplayed: boolean;
}
export default class ImageView extends React.Component<IProps, IState> {
    constructor(props: any);
    private contextMenuButton;
    private focusLock;
    private imageWrapper;
    private image;
    private initX;
    private initY;
    private lastX;
    private lastY;
    private previousX;
    private previousY;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private calculateZoom;
    private zoom;
    private onWheel;
    private onZoomInClick;
    private onZoomOutClick;
    private onKeyDown;
    private onRotateCounterClockwiseClick;
    private onRotateClockwiseClick;
    private onDownloadClick;
    private onOpenContextMenu;
    private onCloseContextMenu;
    private onPermalinkClicked;
    private onStartMoving;
    private onMoving;
    private onEndMoving;
    private renderContextMenu;
    render(): JSX.Element;
}
export {};
