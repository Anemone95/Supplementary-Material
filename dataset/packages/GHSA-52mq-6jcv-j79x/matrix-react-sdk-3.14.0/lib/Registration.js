"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startAnyRegistrationFlow = startAnyRegistrationFlow;
exports.SAFE_LOCALPART_REGEX = void 0;

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var sdk = _interopRequireWildcard(require("./index"));

var _Modal = _interopRequireDefault(require("./Modal"));

var _languageHandler = require("./languageHandler");

/*
Copyright 2018 New Vector Ltd

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

/**
 * Utility code for registering with a homeserver
 * Note that this is currently *not* used by the actual
 * registration code.
 */
// Regex for what a "safe" or "Matrix-looking" localpart would be.
// TODO: Update as needed for https://github.com/matrix-org/matrix-doc/issues/1514
const SAFE_LOCALPART_REGEX = /^[a-z0-9=_\-./]+$/;
/**
 * Starts either the ILAG or full registration flow, depending
 * on what the HS supports
 *
 * @param {object} options
 * @param {bool} options.go_home_on_cancel
 *     If true, goes to the home page if the user cancels the action
 * @param {bool} options.go_welcome_on_cancel
 *     If true, goes to the welcome page if the user cancels the action
 * @param {bool} options.screen_after
 *     If present the screen to redirect to after a successful login or register.
 */

exports.SAFE_LOCALPART_REGEX = SAFE_LOCALPART_REGEX;

async function startAnyRegistrationFlow(options) {
  if (options === undefined) options = {};
  const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

  const modal = _Modal.default.createTrackedDialog('Registration required', '', QuestionDialog, {
    hasCancelButton: true,
    quitOnly: true,
    title: (0, _languageHandler._t)("Sign In or Create Account"),
    description: (0, _languageHandler._t)("Use your account or create a new one to continue."),
    button: (0, _languageHandler._t)("Create Account"),
    extraButtons: [/*#__PURE__*/React.createElement("button", {
      key: "start_login",
      onClick: () => {
        modal.close();

        _dispatcher.default.dispatch({
          action: 'start_login',
          screenAfterLogin: options.screen_after
        });
      }
    }, (0, _languageHandler._t)('Sign In'))],
    onFinished: proceed => {
      if (proceed) {
        _dispatcher.default.dispatch({
          action: 'start_registration',
          screenAfterLogin: options.screen_after
        });
      } else if (options.go_home_on_cancel) {
        _dispatcher.default.dispatch({
          action: 'view_home_page'
        });
      } else if (options.go_welcome_on_cancel) {
        _dispatcher.default.dispatch({
          action: 'view_welcome_page'
        });
      }
    }
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9SZWdpc3RyYXRpb24uanMiXSwibmFtZXMiOlsiU0FGRV9MT0NBTFBBUlRfUkVHRVgiLCJzdGFydEFueVJlZ2lzdHJhdGlvbkZsb3ciLCJvcHRpb25zIiwidW5kZWZpbmVkIiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJtb2RhbCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsImhhc0NhbmNlbEJ1dHRvbiIsInF1aXRPbmx5IiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsImV4dHJhQnV0dG9ucyIsImNsb3NlIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJzY3JlZW5BZnRlckxvZ2luIiwic2NyZWVuX2FmdGVyIiwib25GaW5pc2hlZCIsInByb2NlZWQiLCJnb19ob21lX29uX2NhbmNlbCIsImdvX3dlbGNvbWVfb25fY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFzQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBT0E7QUFDQTtBQUNPLE1BQU1BLG9CQUFvQixHQUFHLG1CQUE3QjtBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUNPLGVBQWVDLHdCQUFmLENBQXdDQyxPQUF4QyxFQUFpRDtBQUNwRCxNQUFJQSxPQUFPLEtBQUtDLFNBQWhCLEVBQTJCRCxPQUFPLEdBQUcsRUFBVjtBQUMzQixRQUFNRSxjQUFjLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix3QkFBakIsQ0FBdkI7O0FBQ0EsUUFBTUMsS0FBSyxHQUFHQyxlQUFNQyxtQkFBTixDQUEwQix1QkFBMUIsRUFBbUQsRUFBbkQsRUFBdURMLGNBQXZELEVBQXVFO0FBQ2pGTSxJQUFBQSxlQUFlLEVBQUUsSUFEZ0U7QUFFakZDLElBQUFBLFFBQVEsRUFBRSxJQUZ1RTtBQUdqRkMsSUFBQUEsS0FBSyxFQUFFLHlCQUFHLDJCQUFILENBSDBFO0FBSWpGQyxJQUFBQSxXQUFXLEVBQUUseUJBQUcsbURBQUgsQ0FKb0U7QUFLakZDLElBQUFBLE1BQU0sRUFBRSx5QkFBRyxnQkFBSCxDQUx5RTtBQU1qRkMsSUFBQUEsWUFBWSxFQUFFLGNBQ1Y7QUFBUSxNQUFBLEdBQUcsRUFBQyxhQUFaO0FBQTBCLE1BQUEsT0FBTyxFQUFFLE1BQU07QUFDckNSLFFBQUFBLEtBQUssQ0FBQ1MsS0FBTjs7QUFDQUMsNEJBQUlDLFFBQUosQ0FBYTtBQUFDQyxVQUFBQSxNQUFNLEVBQUUsYUFBVDtBQUF3QkMsVUFBQUEsZ0JBQWdCLEVBQUVsQixPQUFPLENBQUNtQjtBQUFsRCxTQUFiO0FBQ0g7QUFIRCxPQUdLLHlCQUFHLFNBQUgsQ0FITCxDQURVLENBTm1FO0FBWWpGQyxJQUFBQSxVQUFVLEVBQUdDLE9BQUQsSUFBYTtBQUNyQixVQUFJQSxPQUFKLEVBQWE7QUFDVE4sNEJBQUlDLFFBQUosQ0FBYTtBQUFDQyxVQUFBQSxNQUFNLEVBQUUsb0JBQVQ7QUFBK0JDLFVBQUFBLGdCQUFnQixFQUFFbEIsT0FBTyxDQUFDbUI7QUFBekQsU0FBYjtBQUNILE9BRkQsTUFFTyxJQUFJbkIsT0FBTyxDQUFDc0IsaUJBQVosRUFBK0I7QUFDbENQLDRCQUFJQyxRQUFKLENBQWE7QUFBQ0MsVUFBQUEsTUFBTSxFQUFFO0FBQVQsU0FBYjtBQUNILE9BRk0sTUFFQSxJQUFJakIsT0FBTyxDQUFDdUIsb0JBQVosRUFBa0M7QUFDckNSLDRCQUFJQyxRQUFKLENBQWE7QUFBQ0MsVUFBQUEsTUFBTSxFQUFFO0FBQVQsU0FBYjtBQUNIO0FBQ0o7QUFwQmdGLEdBQXZFLENBQWQ7QUFzQkgiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbiAqIFV0aWxpdHkgY29kZSBmb3IgcmVnaXN0ZXJpbmcgd2l0aCBhIGhvbWVzZXJ2ZXJcbiAqIE5vdGUgdGhhdCB0aGlzIGlzIGN1cnJlbnRseSAqbm90KiB1c2VkIGJ5IHRoZSBhY3R1YWxcbiAqIHJlZ2lzdHJhdGlvbiBjb2RlLlxuICovXG5cbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5cbi8vIFJlZ2V4IGZvciB3aGF0IGEgXCJzYWZlXCIgb3IgXCJNYXRyaXgtbG9va2luZ1wiIGxvY2FscGFydCB3b3VsZCBiZS5cbi8vIFRPRE86IFVwZGF0ZSBhcyBuZWVkZWQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzE1MTRcbmV4cG9ydCBjb25zdCBTQUZFX0xPQ0FMUEFSVF9SRUdFWCA9IC9eW2EtejAtOT1fXFwtLi9dKyQvO1xuXG4vKipcbiAqIFN0YXJ0cyBlaXRoZXIgdGhlIElMQUcgb3IgZnVsbCByZWdpc3RyYXRpb24gZmxvdywgZGVwZW5kaW5nXG4gKiBvbiB3aGF0IHRoZSBIUyBzdXBwb3J0c1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge2Jvb2x9IG9wdGlvbnMuZ29faG9tZV9vbl9jYW5jZWxcbiAqICAgICBJZiB0cnVlLCBnb2VzIHRvIHRoZSBob21lIHBhZ2UgaWYgdGhlIHVzZXIgY2FuY2VscyB0aGUgYWN0aW9uXG4gKiBAcGFyYW0ge2Jvb2x9IG9wdGlvbnMuZ29fd2VsY29tZV9vbl9jYW5jZWxcbiAqICAgICBJZiB0cnVlLCBnb2VzIHRvIHRoZSB3ZWxjb21lIHBhZ2UgaWYgdGhlIHVzZXIgY2FuY2VscyB0aGUgYWN0aW9uXG4gKiBAcGFyYW0ge2Jvb2x9IG9wdGlvbnMuc2NyZWVuX2FmdGVyXG4gKiAgICAgSWYgcHJlc2VudCB0aGUgc2NyZWVuIHRvIHJlZGlyZWN0IHRvIGFmdGVyIGEgc3VjY2Vzc2Z1bCBsb2dpbiBvciByZWdpc3Rlci5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0QW55UmVnaXN0cmF0aW9uRmxvdyhvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkgb3B0aW9ucyA9IHt9O1xuICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSZWdpc3RyYXRpb24gcmVxdWlyZWQnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgaGFzQ2FuY2VsQnV0dG9uOiB0cnVlLFxuICAgICAgICBxdWl0T25seTogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IF90KFwiU2lnbiBJbiBvciBDcmVhdGUgQWNjb3VudFwiKSxcbiAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVXNlIHlvdXIgYWNjb3VudCBvciBjcmVhdGUgYSBuZXcgb25lIHRvIGNvbnRpbnVlLlwiKSxcbiAgICAgICAgYnV0dG9uOiBfdChcIkNyZWF0ZSBBY2NvdW50XCIpLFxuICAgICAgICBleHRyYUJ1dHRvbnM6IFtcbiAgICAgICAgICAgIDxidXR0b24ga2V5PVwic3RhcnRfbG9naW5cIiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3N0YXJ0X2xvZ2luJywgc2NyZWVuQWZ0ZXJMb2dpbjogb3B0aW9ucy5zY3JlZW5fYWZ0ZXJ9KTtcbiAgICAgICAgICAgIH19PnsgX3QoJ1NpZ24gSW4nKSB9PC9idXR0b24+LFxuICAgICAgICBdLFxuICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb2NlZWQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3N0YXJ0X3JlZ2lzdHJhdGlvbicsIHNjcmVlbkFmdGVyTG9naW46IG9wdGlvbnMuc2NyZWVuX2FmdGVyfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZ29faG9tZV9vbl9jYW5jZWwpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJ30pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmdvX3dlbGNvbWVfb25fY2FuY2VsKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd2aWV3X3dlbGNvbWVfcGFnZSd9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcbn1cbiJdfQ==