import React from 'react';
export interface IProps {
    groupId?: string;
    groupName?: string;
    groupAvatarUrl?: string;
    width?: number;
    height?: number;
    resizeMethod?: string;
    onClick?: React.MouseEventHandler;
}
export default class GroupAvatar extends React.Component<IProps> {
    static defaultProps: {
        width: number;
        height: number;
        resizeMethod: string;
    };
    getGroupAvatarUrl(): any;
    render(): JSX.Element;
}
