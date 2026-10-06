export declare enum NotificationSetting {
    AllMessages = "all_messages",
    DirectMessagesMentionsKeywords = "dm_mentions_keywords",
    MentionsKeywordsOnly = "mentions_keywords",
    Never = "never"
}
export interface ISoundTweak {
    set_tweak: "sound";
    value: string;
}
export interface IHighlightTweak {
    set_tweak: "highlight";
    value?: boolean;
}
export declare type Tweak = ISoundTweak | IHighlightTweak;
export declare enum Actions {
    Notify = "notify",
    DontNotify = "dont_notify",
    Coalesce = "coalesce",
    MarkUnread = "mark_unread"
}
export declare type Action = Actions | Tweak;
export declare enum Kind {
    Override = "override",
    ContentSpecific = "content",
    RoomSpecific = "room",
    SenderSpecific = "sender",
    Underride = "underride"
}
export interface IEventMatchCondition {
    kind: "event_match";
    key: string;
    pattern: string;
}
export interface IContainsDisplayNameCondition {
    kind: "contains_display_name";
}
export interface IRoomMemberCountCondition {
    kind: "room_member_count";
    is: string;
}
export interface ISenderNotificationPermissionCondition {
    kind: "sender_notification_permission";
    key: string;
}
export declare type Condition = IEventMatchCondition | IContainsDisplayNameCondition | IRoomMemberCountCondition | ISenderNotificationPermissionCondition;
export declare enum RuleIds {
    MasterRule = ".m.rule.master",
    MessageRule = ".m.rule.message",
    EncryptedMessageRule = ".m.rule.encrypted",
    RoomOneToOneRule = ".m.rule.room_one_to_one",
    EncryptedRoomOneToOneRule = ".m.rule.room_one_to_one"
}
export interface IPushRule {
    enabled: boolean;
    rule_id: RuleIds | string;
    actions: Action[];
    default: boolean;
    conditions?: Condition[];
    pattern?: string;
}
export interface IExtendedPushRule extends IPushRule {
    kind: Kind;
}
export interface IPushRuleSet {
    override: IPushRule[];
    content: IPushRule[];
    room: IPushRule[];
    sender: IPushRule[];
    underride: IPushRule[];
}
export interface IRuleSets {
    global: IPushRuleSet;
}
