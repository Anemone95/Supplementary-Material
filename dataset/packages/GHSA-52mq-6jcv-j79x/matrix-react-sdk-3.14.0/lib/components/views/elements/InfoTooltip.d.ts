import React from 'react';
interface ITooltipProps {
    tooltip?: React.ReactNode;
    tooltipClassName?: string;
}
interface IState {
    hover: boolean;
}
export default class InfoTooltip extends React.PureComponent<ITooltipProps, IState> {
    constructor(props: ITooltipProps);
    onMouseOver: () => void;
    onMouseLeave: () => void;
    render(): JSX.Element;
}
export {};
