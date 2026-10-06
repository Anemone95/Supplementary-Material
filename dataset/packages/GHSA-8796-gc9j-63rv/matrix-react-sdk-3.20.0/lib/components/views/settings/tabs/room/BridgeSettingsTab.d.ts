import React from "react";
interface IProps {
    roomId: string;
}
export default class BridgeSettingsTab extends React.Component<IProps> {
    private renderBridgeCard;
    static getBridgeStateEvents(roomId: string): unknown[];
    render(): JSX.Element;
}
export {};
