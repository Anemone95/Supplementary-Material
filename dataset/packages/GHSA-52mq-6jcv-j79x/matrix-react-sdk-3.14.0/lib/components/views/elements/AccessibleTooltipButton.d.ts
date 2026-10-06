import React from 'react';
import AccessibleButton from "./AccessibleButton";
interface ITooltipProps extends React.ComponentProps<typeof AccessibleButton> {
    title: string;
    tooltip?: React.ReactNode;
    tooltipClassName?: string;
    forceHide?: boolean;
    yOffset?: number;
}
interface IState {
    hover: boolean;
}
export default class AccessibleTooltipButton extends React.PureComponent<ITooltipProps, IState> {
    constructor(props: ITooltipProps);
    componentDidUpdate(prevProps: Readonly<ITooltipProps>): void;
    onMouseOver: () => void;
    onMouseLeave: () => void;
    render(): JSX.Element;
}
export {};
