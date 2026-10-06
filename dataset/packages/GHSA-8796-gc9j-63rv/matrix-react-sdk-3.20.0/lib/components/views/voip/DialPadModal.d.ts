import * as React from "react";
interface IProps {
    onFinished: (boolean: any) => void;
}
interface IState {
    value: string;
}
export default class DialpadModal extends React.PureComponent<IProps, IState> {
    constructor(props: any);
    onCancelClick: () => void;
    onChange: (ev: any) => void;
    onFormSubmit: (ev: any) => void;
    onDigitPress: (digit: any) => void;
    onDeletePress: () => void;
    onDialPress: () => Promise<void>;
    render(): JSX.Element;
}
export {};
