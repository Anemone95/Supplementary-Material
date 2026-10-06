import React from 'react';
import { IProps as IContextMenuProps } from '../../structures/ContextMenu';
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
interface IProps extends IContextMenuProps {
    call: MatrixCall;
}
interface IState {
    value: string;
}
export default class DialpadContextMenu extends React.Component<IProps, IState> {
    constructor(props: any);
    onDigitPress: (digit: any) => void;
    render(): JSX.Element;
}
export {};
