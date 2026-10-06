"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ElementWidgetActions = void 0;

/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let ElementWidgetActions;
/**
 * @deprecated Use MSC2931 instead
 */

exports.ElementWidgetActions = ElementWidgetActions;

(function (ElementWidgetActions) {
  ElementWidgetActions["ClientReady"] = "im.vector.ready";
  ElementWidgetActions["HangupCall"] = "im.vector.hangup";
  ElementWidgetActions["OpenIntegrationManager"] = "integration_manager_open";
  ElementWidgetActions["ViewRoom"] = "io.element.view_room";
})(ElementWidgetActions || (exports.ElementWidgetActions = ElementWidgetActions = {}));
/*:: export interface IViewRoomApiRequest extends IWidgetApiRequest {
    data: {
        room_id: string; // eslint-disable-line camelcase
    };
}*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvd2lkZ2V0cy9FbGVtZW50V2lkZ2V0QWN0aW9ucy50cyJdLCJuYW1lcyI6WyJFbGVtZW50V2lkZ2V0QWN0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUlZQSxvQjtBQVdaO0FBQ0E7QUFDQTs7OztXQWJZQSxvQjtBQUFBQSxFQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtBQUFBQSxFQUFBQSxvQjtHQUFBQSxvQixvQ0FBQUEsb0I7O0FBbEJaO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBJV2lkZ2V0QXBpUmVxdWVzdCB9IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuXG5leHBvcnQgZW51bSBFbGVtZW50V2lkZ2V0QWN0aW9ucyB7XG4gICAgQ2xpZW50UmVhZHkgPSBcImltLnZlY3Rvci5yZWFkeVwiLFxuICAgIEhhbmd1cENhbGwgPSBcImltLnZlY3Rvci5oYW5ndXBcIixcbiAgICBPcGVuSW50ZWdyYXRpb25NYW5hZ2VyID0gXCJpbnRlZ3JhdGlvbl9tYW5hZ2VyX29wZW5cIixcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBNU0MyOTMxIGluc3RlYWRcbiAgICAgKi9cbiAgICBWaWV3Um9vbSA9IFwiaW8uZWxlbWVudC52aWV3X3Jvb21cIixcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBVc2UgTVNDMjkzMSBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSVZpZXdSb29tQXBpUmVxdWVzdCBleHRlbmRzIElXaWRnZXRBcGlSZXF1ZXN0IHtcbiAgICBkYXRhOiB7XG4gICAgICAgIHJvb21faWQ6IHN0cmluZzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICB9O1xufVxuIl19