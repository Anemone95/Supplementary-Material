import { NotificationColor } from "./NotificationColor";
import { NotificationState } from "./NotificationState";
export declare class StaticNotificationState extends NotificationState {
    constructor(symbol: string, count: number, color: NotificationColor);
    static forCount(count: number, color: NotificationColor): StaticNotificationState;
    static forSymbol(symbol: string, color: NotificationColor): StaticNotificationState;
}
