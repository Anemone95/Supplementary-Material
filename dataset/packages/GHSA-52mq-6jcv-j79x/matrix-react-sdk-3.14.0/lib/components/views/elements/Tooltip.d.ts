import React from 'react';
interface IProps {
    className?: string;
    tooltipClassName?: string;
    visible?: boolean;
    label: React.ReactNode;
    forceOnRight?: boolean;
    yOffset?: number;
}
export default class Tooltip extends React.Component<IProps> {
    private tooltipContainer;
    private tooltip;
    private parent;
    static readonly defaultProps: {
        visible: boolean;
        yOffset: number;
    };
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private updatePosition;
    private renderTooltip;
    render(): JSX.Element;
}
export {};
