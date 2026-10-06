import { Capability, IOpenIDUpdate, ISendEventDetails, SimpleObservable, Widget, WidgetDriver, WidgetKind } from "matrix-widget-api";
export declare class StopGapWidgetDriver extends WidgetDriver {
    private forWidget;
    private forWidgetKind;
    private inRoomId?;
    private allowedCapabilities;
    constructor(allowedCapabilities: Capability[], forWidget: Widget, forWidgetKind: WidgetKind, inRoomId?: string);
    validateCapabilities(requested: Set<Capability>): Promise<Set<Capability>>;
    sendEvent(eventType: string, content: any, stateKey?: string): Promise<ISendEventDetails>;
    askOpenID(observer: SimpleObservable<IOpenIDUpdate>): Promise<void>;
    navigate(uri: string): Promise<void>;
}
