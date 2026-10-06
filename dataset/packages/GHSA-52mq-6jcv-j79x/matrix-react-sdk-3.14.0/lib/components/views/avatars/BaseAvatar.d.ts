import React from 'react';
interface IProps {
    name: string;
    idName?: string;
    title?: string;
    url?: string;
    urls?: string[];
    width?: number;
    height?: number;
    resizeMethod?: string;
    defaultToInitialLetter?: boolean;
    onClick?: React.MouseEventHandler;
    inputRef?: React.RefObject<HTMLImageElement & HTMLSpanElement>;
    className?: string;
}
declare const BaseAvatar: (props: IProps) => JSX.Element;
export default BaseAvatar;
export declare type BaseAvatarType = React.FC<IProps>;
