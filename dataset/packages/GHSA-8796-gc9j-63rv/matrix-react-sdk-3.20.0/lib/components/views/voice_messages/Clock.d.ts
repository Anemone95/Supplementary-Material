import React from "react";
interface IProps {
    seconds: number;
}
interface IState {
}
/**
 * Simply converts seconds into minutes and seconds. Note that hours will not be
 * displayed, making it possible to see "82:29".
 */
export default class Clock extends React.Component<IProps, IState> {
    constructor(props: any);
    shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean;
    render(): JSX.Element;
}
export {};
