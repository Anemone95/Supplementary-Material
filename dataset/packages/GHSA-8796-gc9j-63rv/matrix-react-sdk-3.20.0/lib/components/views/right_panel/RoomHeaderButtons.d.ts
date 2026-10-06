/// <reference types="react" />
import HeaderButtons from './HeaderButtons';
import { ActionPayload } from "../../../dispatcher/payloads";
export default class RoomHeaderButtons extends HeaderButtons {
    constructor(props: any);
    protected onAction(payload: ActionPayload): void;
    private onRoomSummaryClicked;
    private onNotificationsClicked;
    renderButtons(): JSX.Element[];
}
