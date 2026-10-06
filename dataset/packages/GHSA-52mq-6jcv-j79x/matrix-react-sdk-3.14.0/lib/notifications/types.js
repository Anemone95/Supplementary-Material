"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RuleIds = exports.Kind = exports.Actions = exports.NotificationSetting = void 0;

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let NotificationSetting;
exports.NotificationSetting = NotificationSetting;

(function (NotificationSetting) {
  NotificationSetting["AllMessages"] = "all_messages";
  NotificationSetting["DirectMessagesMentionsKeywords"] = "dm_mentions_keywords";
  NotificationSetting["MentionsKeywordsOnly"] = "mentions_keywords";
  NotificationSetting["Never"] = "never";
})(NotificationSetting || (exports.NotificationSetting = NotificationSetting = {}));
/*:: export interface ISoundTweak {
    // eslint-disable-next-line camelcase
    set_tweak: "sound";
    value: string;
}*/

/*:: export interface IHighlightTweak {
    // eslint-disable-next-line camelcase
    set_tweak: "highlight";
    value?: boolean;
}*/

/*:: export type Tweak = ISoundTweak | IHighlightTweak;*/


let Actions;
exports.Actions = Actions;

(function (Actions) {
  Actions["Notify"] = "notify";
  Actions["DontNotify"] = "dont_notify";
  Actions["Coalesce"] = "coalesce";
  Actions["MarkUnread"] = "mark_unread";
})(Actions || (exports.Actions = Actions = {}));
/*:: export type Action = Actions | Tweak;*/


// Push rule kinds in descending priority order
let Kind;
exports.Kind = Kind;

(function (Kind) {
  Kind["Override"] = "override";
  Kind["ContentSpecific"] = "content";
  Kind["RoomSpecific"] = "room";
  Kind["SenderSpecific"] = "sender";
  Kind["Underride"] = "underride";
})(Kind || (exports.Kind = Kind = {}));
/*:: export interface IEventMatchCondition {
    kind: "event_match";
    key: string;
    pattern: string;
}*/

/*:: export interface IContainsDisplayNameCondition {
    kind: "contains_display_name";
}*/

/*:: export interface IRoomMemberCountCondition {
    kind: "room_member_count";
    is: string;
}*/

/*:: export interface ISenderNotificationPermissionCondition {
    kind: "sender_notification_permission";
    key: string;
}*/

/*:: export type Condition =
    IEventMatchCondition |
    IContainsDisplayNameCondition |
    IRoomMemberCountCondition |
    ISenderNotificationPermissionCondition;*/


let RuleIds;
exports.RuleIds = RuleIds;

(function (RuleIds) {
  RuleIds["MasterRule"] = ".m.rule.master";
  RuleIds["MessageRule"] = ".m.rule.message";
  RuleIds["EncryptedMessageRule"] = ".m.rule.encrypted";
  RuleIds["RoomOneToOneRule"] = ".m.rule.room_one_to_one";
  RuleIds["EncryptedRoomOneToOneRule"] = ".m.rule.room_one_to_one";
})(RuleIds || (exports.RuleIds = RuleIds = {}));
/*:: export interface IPushRule {
    enabled: boolean;
    // eslint-disable-next-line camelcase
    rule_id: RuleIds | string;
    actions: Action[];
    default: boolean;
    conditions?: Condition[]; // only applicable to `underride` and `override` rules
    pattern?: string; // only applicable to `content` rules
}*/

/*:: export interface IExtendedPushRule extends IPushRule {
    kind: Kind;
}*/

/*:: export interface IPushRuleSet {
    override: IPushRule[];
    content: IPushRule[];
    room: IPushRule[];
    sender: IPushRule[];
    underride: IPushRule[];
}*/

/*:: export interface IRuleSets {
    global: IPushRuleSet;
}*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub3RpZmljYXRpb25zL3R5cGVzLnRzIl0sIm5hbWVzIjpbIk5vdGlmaWNhdGlvblNldHRpbmciLCJBY3Rpb25zIiwiS2luZCIsIlJ1bGVJZHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFFWUEsbUI7OztXQUFBQSxtQjtBQUFBQSxFQUFBQSxtQjtBQUFBQSxFQUFBQSxtQjtBQUFBQSxFQUFBQSxtQjtBQUFBQSxFQUFBQSxtQjtHQUFBQSxtQixtQ0FBQUEsbUI7O0FBaEJaO0FBQ0E7QUFDQTtBQUNBOzs7QUFIQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7SUFpQ1lDLE87OztXQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87R0FBQUEsTyx1QkFBQUEsTzs7OztBQVNaO0lBQ1lDLEk7OztXQUFBQSxJO0FBQUFBLEVBQUFBLEk7QUFBQUEsRUFBQUEsSTtBQUFBQSxFQUFBQSxJO0FBQUFBLEVBQUFBLEk7QUFBQUEsRUFBQUEsSTtHQUFBQSxJLG9CQUFBQSxJOztBQTlDWjtBQUNBO0FBQ0E7QUFDQTs7O0FBSEE7QUFDQTs7O0FBREE7QUFDQTtBQUNBOzs7QUFGQTtBQUNBO0FBQ0E7OztBQUZBO0FBQ0E7QUFDQTtBQUNBOzs7SUE2RVlDLE87OztXQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztHQUFBQSxPLHVCQUFBQSxPOztBQWhGWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFQQTtBQUNBOzs7QUFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUxBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5leHBvcnQgZW51bSBOb3RpZmljYXRpb25TZXR0aW5nIHtcbiAgICBBbGxNZXNzYWdlcyA9IFwiYWxsX21lc3NhZ2VzXCIsIC8vIC5tLnJ1bGUubWVzc2FnZSA9IG5vdGlmeVxuICAgIERpcmVjdE1lc3NhZ2VzTWVudGlvbnNLZXl3b3JkcyA9IFwiZG1fbWVudGlvbnNfa2V5d29yZHNcIiwgLy8gLm0ucnVsZS5tZXNzYWdlID0gbWFya191bnJlYWQuIFRoaXMgaXMgdGhlIG5ldyBkZWZhdWx0LlxuICAgIE1lbnRpb25zS2V5d29yZHNPbmx5ID0gXCJtZW50aW9uc19rZXl3b3Jkc1wiLCAvLyAubS5ydWxlLm1lc3NhZ2UgPSBtYXJrX3VucmVhZDsgLm0ucnVsZS5yb29tX29uZV90b19vbmUgPSBtYXJrX3VucmVhZFxuICAgIE5ldmVyID0gXCJuZXZlclwiLCAvLyAubS5ydWxlLm1hc3RlciA9IGVuYWJsZWQgKGRvbnRfbm90aWZ5KVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTb3VuZFR3ZWFrIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc2V0X3R3ZWFrOiBcInNvdW5kXCI7XG4gICAgdmFsdWU6IHN0cmluZztcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUhpZ2hsaWdodFR3ZWFrIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc2V0X3R3ZWFrOiBcImhpZ2hsaWdodFwiO1xuICAgIHZhbHVlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgVHdlYWsgPSBJU291bmRUd2VhayB8IElIaWdobGlnaHRUd2VhaztcblxuZXhwb3J0IGVudW0gQWN0aW9ucyB7XG4gICAgTm90aWZ5ID0gXCJub3RpZnlcIixcbiAgICBEb250Tm90aWZ5ID0gXCJkb250X25vdGlmeVwiLCAvLyBuby1vcFxuICAgIENvYWxlc2NlID0gXCJjb2FsZXNjZVwiLCAvLyB1bnVzZWRcbiAgICBNYXJrVW5yZWFkID0gXCJtYXJrX3VucmVhZFwiLCAvLyBuZXdcbn1cblxuZXhwb3J0IHR5cGUgQWN0aW9uID0gQWN0aW9ucyB8IFR3ZWFrO1xuXG4vLyBQdXNoIHJ1bGUga2luZHMgaW4gZGVzY2VuZGluZyBwcmlvcml0eSBvcmRlclxuZXhwb3J0IGVudW0gS2luZCB7XG4gICAgT3ZlcnJpZGUgPSBcIm92ZXJyaWRlXCIsXG4gICAgQ29udGVudFNwZWNpZmljID0gXCJjb250ZW50XCIsXG4gICAgUm9vbVNwZWNpZmljID0gXCJyb29tXCIsXG4gICAgU2VuZGVyU3BlY2lmaWMgPSBcInNlbmRlclwiLFxuICAgIFVuZGVycmlkZSA9IFwidW5kZXJyaWRlXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUV2ZW50TWF0Y2hDb25kaXRpb24ge1xuICAgIGtpbmQ6IFwiZXZlbnRfbWF0Y2hcIjtcbiAgICBrZXk6IHN0cmluZztcbiAgICBwYXR0ZXJuOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbnRhaW5zRGlzcGxheU5hbWVDb25kaXRpb24ge1xuICAgIGtpbmQ6IFwiY29udGFpbnNfZGlzcGxheV9uYW1lXCI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJvb21NZW1iZXJDb3VudENvbmRpdGlvbiB7XG4gICAga2luZDogXCJyb29tX21lbWJlcl9jb3VudFwiO1xuICAgIGlzOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlbmRlck5vdGlmaWNhdGlvblBlcm1pc3Npb25Db25kaXRpb24ge1xuICAgIGtpbmQ6IFwic2VuZGVyX25vdGlmaWNhdGlvbl9wZXJtaXNzaW9uXCI7XG4gICAga2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIENvbmRpdGlvbiA9XG4gICAgSUV2ZW50TWF0Y2hDb25kaXRpb24gfFxuICAgIElDb250YWluc0Rpc3BsYXlOYW1lQ29uZGl0aW9uIHxcbiAgICBJUm9vbU1lbWJlckNvdW50Q29uZGl0aW9uIHxcbiAgICBJU2VuZGVyTm90aWZpY2F0aW9uUGVybWlzc2lvbkNvbmRpdGlvbjtcblxuZXhwb3J0IGVudW0gUnVsZUlkcyB7XG4gICAgTWFzdGVyUnVsZSA9IFwiLm0ucnVsZS5tYXN0ZXJcIiwgLy8gVGhlIG1hc3RlciBydWxlIChhbGwgbm90aWZpY2F0aW9ucyBkaXNhYmxpbmcpXG4gICAgTWVzc2FnZVJ1bGUgPSBcIi5tLnJ1bGUubWVzc2FnZVwiLFxuICAgIEVuY3J5cHRlZE1lc3NhZ2VSdWxlID0gXCIubS5ydWxlLmVuY3J5cHRlZFwiLFxuICAgIFJvb21PbmVUb09uZVJ1bGUgPSBcIi5tLnJ1bGUucm9vbV9vbmVfdG9fb25lXCIsXG4gICAgRW5jcnlwdGVkUm9vbU9uZVRvT25lUnVsZSA9IFwiLm0ucnVsZS5yb29tX29uZV90b19vbmVcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUHVzaFJ1bGUge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHJ1bGVfaWQ6IFJ1bGVJZHMgfCBzdHJpbmc7XG4gICAgYWN0aW9uczogQWN0aW9uW107XG4gICAgZGVmYXVsdDogYm9vbGVhbjtcbiAgICBjb25kaXRpb25zPzogQ29uZGl0aW9uW107IC8vIG9ubHkgYXBwbGljYWJsZSB0byBgdW5kZXJyaWRlYCBhbmQgYG92ZXJyaWRlYCBydWxlc1xuICAgIHBhdHRlcm4/OiBzdHJpbmc7IC8vIG9ubHkgYXBwbGljYWJsZSB0byBgY29udGVudGAgcnVsZXNcbn1cblxuLy8gcHVzaCBydWxlIGV4dGVuZGVkIHdpdGgga2luZCwgdXNlZCBieSBDb250ZW50UnVsZXMgYW5kIGpzLXNkaydzIHB1c2hwcm9jZXNzb3JcbmV4cG9ydCBpbnRlcmZhY2UgSUV4dGVuZGVkUHVzaFJ1bGUgZXh0ZW5kcyBJUHVzaFJ1bGUge1xuICAgIGtpbmQ6IEtpbmQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVB1c2hSdWxlU2V0IHtcbiAgICBvdmVycmlkZTogSVB1c2hSdWxlW107XG4gICAgY29udGVudDogSVB1c2hSdWxlW107XG4gICAgcm9vbTogSVB1c2hSdWxlW107XG4gICAgc2VuZGVyOiBJUHVzaFJ1bGVbXTtcbiAgICB1bmRlcnJpZGU6IElQdXNoUnVsZVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElSdWxlU2V0cyB7XG4gICAgZ2xvYmFsOiBJUHVzaFJ1bGVTZXQ7XG59XG4iXX0=