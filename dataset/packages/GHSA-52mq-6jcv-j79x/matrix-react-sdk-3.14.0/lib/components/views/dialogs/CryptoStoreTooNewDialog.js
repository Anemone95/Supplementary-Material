"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

/*
Copyright 2018 New Vector Ltd
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
var _default = props => {
  const brand = _SdkConfig.default.get().brand;

  const _onLogoutClicked = () => {
    const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

    _Modal.default.createTrackedDialog('Logout e2e db too new', '', QuestionDialog, {
      title: (0, _languageHandler._t)("Sign out"),
      description: (0, _languageHandler._t)("To avoid losing your chat history, you must export your room keys " + "before logging out. You will need to go back to the newer version of " + "%(brand)s to do this", {
        brand
      }),
      button: (0, _languageHandler._t)("Sign out"),
      focus: false,
      onFinished: doLogout => {
        if (doLogout) {
          _dispatcher.default.dispatch({
            action: 'logout'
          });

          props.onFinished();
        }
      }
    });
  };

  const description = (0, _languageHandler._t)("You've previously used a newer version of %(brand)s with this session. " + "To use this version again with end to end encryption, you will " + "need to sign out and back in again.", {
    brand
  });
  const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
  const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
  return /*#__PURE__*/_react.default.createElement(BaseDialog, {
    className: "mx_CryptoStoreTooNewDialog",
    contentId: "mx_Dialog_content",
    title: (0, _languageHandler._t)("Incompatible Database"),
    hasCancel: false,
    onFinished: props.onFinished
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_content",
    id: "mx_Dialog_content"
  }, description), /*#__PURE__*/_react.default.createElement(DialogButtons, {
    primaryButton: (0, _languageHandler._t)('Continue With Encryption Disabled'),
    hasCancel: false,
    onPrimaryButtonClick: props.onFinished
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: _onLogoutClicked
  }, (0, _languageHandler._t)('Sign out'))));
};

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ3J5cHRvU3RvcmVUb29OZXdEaWFsb2cuanMiXSwibmFtZXMiOlsicHJvcHMiLCJicmFuZCIsIlNka0NvbmZpZyIsImdldCIsIl9vbkxvZ291dENsaWNrZWQiLCJRdWVzdGlvbkRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJmb2N1cyIsIm9uRmluaXNoZWQiLCJkb0xvZ291dCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQmFzZURpYWxvZyIsIkRpYWxvZ0J1dHRvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtlQVNnQkEsS0FBRCxJQUFXO0FBQ3RCLFFBQU1DLEtBQUssR0FBR0MsbUJBQVVDLEdBQVYsR0FBZ0JGLEtBQTlCOztBQUVBLFFBQU1HLGdCQUFnQixHQUFHLE1BQU07QUFDM0IsVUFBTUMsY0FBYyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsd0JBQWpCLENBQXZCOztBQUNBQyxtQkFBTUMsbUJBQU4sQ0FBMEIsdUJBQTFCLEVBQW1ELEVBQW5ELEVBQXVESixjQUF2RCxFQUF1RTtBQUNuRUssTUFBQUEsS0FBSyxFQUFFLHlCQUFHLFVBQUgsQ0FENEQ7QUFFbkVDLE1BQUFBLFdBQVcsRUFBRSx5QkFDVCx1RUFDQSx1RUFEQSxHQUVBLHNCQUhTLEVBSVQ7QUFBRVYsUUFBQUE7QUFBRixPQUpTLENBRnNEO0FBUW5FVyxNQUFBQSxNQUFNLEVBQUUseUJBQUcsVUFBSCxDQVIyRDtBQVNuRUMsTUFBQUEsS0FBSyxFQUFFLEtBVDREO0FBVW5FQyxNQUFBQSxVQUFVLEVBQUdDLFFBQUQsSUFBYztBQUN0QixZQUFJQSxRQUFKLEVBQWM7QUFDVkMsOEJBQUlDLFFBQUosQ0FBYTtBQUFDQyxZQUFBQSxNQUFNLEVBQUU7QUFBVCxXQUFiOztBQUNBbEIsVUFBQUEsS0FBSyxDQUFDYyxVQUFOO0FBQ0g7QUFDSjtBQWZrRSxLQUF2RTtBQWlCSCxHQW5CRDs7QUFxQkEsUUFBTUgsV0FBVyxHQUNiLHlCQUNJLDRFQUNBLGlFQURBLEdBRUEscUNBSEosRUFJSTtBQUFFVixJQUFBQTtBQUFGLEdBSkosQ0FESjtBQVFBLFFBQU1rQixVQUFVLEdBQUdiLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwwQkFBakIsQ0FBbkI7QUFDQSxRQUFNYSxhQUFhLEdBQUdkLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw4QkFBakIsQ0FBdEI7QUFDQSxzQkFBUSw2QkFBQyxVQUFEO0FBQVksSUFBQSxTQUFTLEVBQUMsNEJBQXRCO0FBQ0osSUFBQSxTQUFTLEVBQUMsbUJBRE47QUFFSixJQUFBLEtBQUssRUFBRSx5QkFBRyx1QkFBSCxDQUZIO0FBR0osSUFBQSxTQUFTLEVBQUUsS0FIUDtBQUlKLElBQUEsVUFBVSxFQUFFUCxLQUFLLENBQUNjO0FBSmQsa0JBTUo7QUFBSyxJQUFBLFNBQVMsRUFBQyxtQkFBZjtBQUFtQyxJQUFBLEVBQUUsRUFBQztBQUF0QyxLQUNNSCxXQUROLENBTkksZUFTSiw2QkFBQyxhQUFEO0FBQWUsSUFBQSxhQUFhLEVBQUUseUJBQUcsbUNBQUgsQ0FBOUI7QUFDSSxJQUFBLFNBQVMsRUFBRSxLQURmO0FBRUksSUFBQSxvQkFBb0IsRUFBRVgsS0FBSyxDQUFDYztBQUZoQyxrQkFJSTtBQUFRLElBQUEsT0FBTyxFQUFFVjtBQUFqQixLQUNNLHlCQUFHLFVBQUgsQ0FETixDQUpKLENBVEksQ0FBUjtBQWtCSCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcblxuZXhwb3J0IGRlZmF1bHQgKHByb3BzKSA9PiB7XG4gICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICBjb25zdCBfb25Mb2dvdXRDbGlja2VkID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdMb2dvdXQgZTJlIGRiIHRvbyBuZXcnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIlNpZ24gb3V0XCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgIFwiVG8gYXZvaWQgbG9zaW5nIHlvdXIgY2hhdCBoaXN0b3J5LCB5b3UgbXVzdCBleHBvcnQgeW91ciByb29tIGtleXMgXCIgK1xuICAgICAgICAgICAgICAgIFwiYmVmb3JlIGxvZ2dpbmcgb3V0LiBZb3Ugd2lsbCBuZWVkIHRvIGdvIGJhY2sgdG8gdGhlIG5ld2VyIHZlcnNpb24gb2YgXCIgK1xuICAgICAgICAgICAgICAgIFwiJShicmFuZClzIHRvIGRvIHRoaXNcIixcbiAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIlNpZ24gb3V0XCIpLFxuICAgICAgICAgICAgZm9jdXM6IGZhbHNlLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogKGRvTG9nb3V0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRvTG9nb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnbG9nb3V0J30pO1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGRlc2NyaXB0aW9uID1cbiAgICAgICAgX3QoXG4gICAgICAgICAgICBcIllvdSd2ZSBwcmV2aW91c2x5IHVzZWQgYSBuZXdlciB2ZXJzaW9uIG9mICUoYnJhbmQpcyB3aXRoIHRoaXMgc2Vzc2lvbi4gXCIgK1xuICAgICAgICAgICAgXCJUbyB1c2UgdGhpcyB2ZXJzaW9uIGFnYWluIHdpdGggZW5kIHRvIGVuZCBlbmNyeXB0aW9uLCB5b3Ugd2lsbCBcIiArXG4gICAgICAgICAgICBcIm5lZWQgdG8gc2lnbiBvdXQgYW5kIGJhY2sgaW4gYWdhaW4uXCIsXG4gICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICk7XG5cbiAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICByZXR1cm4gKDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0NyeXB0b1N0b3JlVG9vTmV3RGlhbG9nXCJcbiAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgdGl0bGU9e190KFwiSW5jb21wYXRpYmxlIERhdGFiYXNlXCIpfVxuICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICBvbkZpbmlzaGVkPXtwcm9wcy5vbkZpbmlzaGVkfVxuICAgID5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiIGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICB7IGRlc2NyaXB0aW9uIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdDb250aW51ZSBXaXRoIEVuY3J5cHRpb24gRGlzYWJsZWQnKX1cbiAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17cHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtfb25Mb2dvdXRDbGlja2VkfSA+XG4gICAgICAgICAgICAgICAgeyBfdCgnU2lnbiBvdXQnKSB9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9EaWFsb2dCdXR0b25zPlxuICAgIDwvQmFzZURpYWxvZz4pO1xufTtcbiJdfQ==