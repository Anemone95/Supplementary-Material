import React from "react";
interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
}
interface IState {
}
export default class StyledCheckbox extends React.PureComponent<IProps, IState> {
    private id;
    static readonly defaultProps: {
        className: string;
    };
    constructor(props: IProps);
    render(): JSX.Element;
}
export {};
