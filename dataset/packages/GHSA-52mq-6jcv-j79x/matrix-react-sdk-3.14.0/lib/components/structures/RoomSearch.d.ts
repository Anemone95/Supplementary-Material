import * as React from "react";
interface IProps {
    isMinimized: boolean;
    onVerticalArrow(ev: React.KeyboardEvent): void;
    onEnter(ev: React.KeyboardEvent): boolean;
}
interface IState {
    query: string;
    focused: boolean;
}
export default class RoomSearch extends React.PureComponent<IProps, IState> {
    private dispatcherRef;
    private inputRef;
    private searchFilter;
    constructor(props: IProps);
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void;
    componentWillUnmount(): void;
    private onAction;
    private clearInput;
    private openSearch;
    private onChange;
    private onFocus;
    private onBlur;
    private onKeyDown;
    render(): React.ReactNode;
}
export {};
