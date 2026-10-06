import React from 'react';
interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
    outlined?: boolean;
}
interface IState {
}
export default class StyledRadioButton extends React.PureComponent<IProps, IState> {
    static readonly defaultProps: {
        className: string;
    };
    render(): JSX.Element;
}
export {};
