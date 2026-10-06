import { Action } from "./types";
interface IEncodedActions {
    notify: boolean;
    sound?: string;
    highlight?: boolean;
}
export declare class NotificationUtils {
    static encodeActions(action: IEncodedActions): Action[];
    static decodeActions(actions: Action[]): IEncodedActions;
}
export {};
