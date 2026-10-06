import * as React from "react";
interface IProps {
    onDigitPress: (string: any) => void;
    hasDialAndDelete: boolean;
    onDeletePress?: (string: any) => void;
    onDialPress?: (string: any) => void;
}
export default class Dialpad extends React.PureComponent<IProps> {
    render(): JSX.Element;
}
export {};
