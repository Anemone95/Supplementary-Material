"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hideToast = exports.showToast = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _Analytics = _interopRequireDefault(require("../Analytics"));

var _AccessibleButton = _interopRequireDefault(require("../components/views/elements/AccessibleButton"));

var _GenericToast = _interopRequireDefault(require("../components/views/toasts/GenericToast"));

var _ToastStore = _interopRequireDefault(require("../stores/ToastStore"));

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
const onAccept = () => {
  _dispatcher.default.dispatch({
    action: 'accept_cookies'
  });
};

const onReject = () => {
  _dispatcher.default.dispatch({
    action: "reject_cookies"
  });
};

const onUsageDataClicked = () => {
  _Analytics.default.showDetailsModal();
};

const TOAST_KEY = "analytics";

const showToast = (policyUrl
/*: string*/
) => {
  const brand = _SdkConfig.default.get().brand;

  _ToastStore.default.sharedInstance().addOrReplaceToast({
    key: TOAST_KEY,
    title: (0, _languageHandler._t)("Help us improve %(brand)s", {
      brand
    }),
    props: {
      description: (0, _languageHandler._t)("Send <UsageDataLink>anonymous usage data</UsageDataLink> which helps us improve %(brand)s. " + "This will use a <PolicyLink>cookie</PolicyLink>.", {
        brand
      }, {
        "UsageDataLink": sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link",
          onClick: onUsageDataClicked
        }, sub),
        // XXX: We need to link to the page that explains our cookies
        "PolicyLink": sub => policyUrl ? /*#__PURE__*/_react.default.createElement("a", {
          target: "_blank",
          href: policyUrl
        }, sub) : sub
      }),
      acceptLabel: (0, _languageHandler._t)("Yes"),
      onAccept,
      rejectLabel: (0, _languageHandler._t)("No"),
      onReject
    },
    component: _GenericToast.default,
    className: "mx_AnalyticsToast",
    priority: 10
  });
};

exports.showToast = showToast;

const hideToast = () => {
  _ToastStore.default.sharedInstance().dismissToast(TOAST_KEY);
};

exports.hideToast = hideToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90b2FzdHMvQW5hbHl0aWNzVG9hc3QudHN4Il0sIm5hbWVzIjpbIm9uQWNjZXB0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJvblJlamVjdCIsIm9uVXNhZ2VEYXRhQ2xpY2tlZCIsIkFuYWx5dGljcyIsInNob3dEZXRhaWxzTW9kYWwiLCJUT0FTVF9LRVkiLCJzaG93VG9hc3QiLCJwb2xpY3lVcmwiLCJicmFuZCIsIlNka0NvbmZpZyIsImdldCIsIlRvYXN0U3RvcmUiLCJzaGFyZWRJbnN0YW5jZSIsImFkZE9yUmVwbGFjZVRvYXN0Iiwia2V5IiwidGl0bGUiLCJwcm9wcyIsImRlc2NyaXB0aW9uIiwic3ViIiwiYWNjZXB0TGFiZWwiLCJyZWplY3RMYWJlbCIsImNvbXBvbmVudCIsIkdlbmVyaWNUb2FzdCIsImNsYXNzTmFtZSIsInByaW9yaXR5IiwiaGlkZVRvYXN0IiwiZGlzbWlzc1RvYXN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVlBLE1BQU1BLFFBQVEsR0FBRyxNQUFNO0FBQ25CQyxzQkFBSUMsUUFBSixDQUFhO0FBQ1RDLElBQUFBLE1BQU0sRUFBRTtBQURDLEdBQWI7QUFHSCxDQUpEOztBQU1BLE1BQU1DLFFBQVEsR0FBRyxNQUFNO0FBQ25CSCxzQkFBSUMsUUFBSixDQUFhO0FBQ1RDLElBQUFBLE1BQU0sRUFBRTtBQURDLEdBQWI7QUFHSCxDQUpEOztBQU1BLE1BQU1FLGtCQUFrQixHQUFHLE1BQU07QUFDN0JDLHFCQUFVQyxnQkFBVjtBQUNILENBRkQ7O0FBSUEsTUFBTUMsU0FBUyxHQUFHLFdBQWxCOztBQUVPLE1BQU1DLFNBQVMsR0FBRyxDQUFDQztBQUFEO0FBQUEsS0FBd0I7QUFDN0MsUUFBTUMsS0FBSyxHQUFHQyxtQkFBVUMsR0FBVixHQUFnQkYsS0FBOUI7O0FBQ0FHLHNCQUFXQyxjQUFYLEdBQTRCQyxpQkFBNUIsQ0FBOEM7QUFDMUNDLElBQUFBLEdBQUcsRUFBRVQsU0FEcUM7QUFFMUNVLElBQUFBLEtBQUssRUFBRSx5QkFBRywyQkFBSCxFQUFnQztBQUFFUCxNQUFBQTtBQUFGLEtBQWhDLENBRm1DO0FBRzFDUSxJQUFBQSxLQUFLLEVBQUU7QUFDSEMsTUFBQUEsV0FBVyxFQUFFLHlCQUNULGdHQUNBLGtEQUZTLEVBR1Q7QUFDSVQsUUFBQUE7QUFESixPQUhTLEVBTVQ7QUFDSSx5QkFBa0JVLEdBQUQsaUJBQ2IsNkJBQUMseUJBQUQ7QUFBa0IsVUFBQSxJQUFJLEVBQUMsTUFBdkI7QUFBOEIsVUFBQSxPQUFPLEVBQUVoQjtBQUF2QyxXQUE2RGdCLEdBQTdELENBRlI7QUFJSTtBQUNBLHNCQUFlQSxHQUFELElBQVNYLFNBQVMsZ0JBQzVCO0FBQUcsVUFBQSxNQUFNLEVBQUMsUUFBVjtBQUFtQixVQUFBLElBQUksRUFBRUE7QUFBekIsV0FBc0NXLEdBQXRDLENBRDRCLEdBRTVCQTtBQVBSLE9BTlMsQ0FEVjtBQWlCSEMsTUFBQUEsV0FBVyxFQUFFLHlCQUFHLEtBQUgsQ0FqQlY7QUFrQkh0QixNQUFBQSxRQWxCRztBQW1CSHVCLE1BQUFBLFdBQVcsRUFBRSx5QkFBRyxJQUFILENBbkJWO0FBb0JIbkIsTUFBQUE7QUFwQkcsS0FIbUM7QUF5QjFDb0IsSUFBQUEsU0FBUyxFQUFFQyxxQkF6QitCO0FBMEIxQ0MsSUFBQUEsU0FBUyxFQUFFLG1CQTFCK0I7QUEyQjFDQyxJQUFBQSxRQUFRLEVBQUU7QUEzQmdDLEdBQTlDO0FBNkJILENBL0JNOzs7O0FBaUNBLE1BQU1DLFNBQVMsR0FBRyxNQUFNO0FBQzNCZCxzQkFBV0MsY0FBWCxHQUE0QmMsWUFBNUIsQ0FBeUNyQixTQUF6QztBQUNILENBRk0iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi9TZGtDb25maWdcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tIFwiLi4vQW5hbHl0aWNzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgR2VuZXJpY1RvYXN0IGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL3RvYXN0cy9HZW5lcmljVG9hc3RcIjtcbmltcG9ydCBUb2FzdFN0b3JlIGZyb20gXCIuLi9zdG9yZXMvVG9hc3RTdG9yZVwiO1xuXG5jb25zdCBvbkFjY2VwdCA9ICgpID0+IHtcbiAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246ICdhY2NlcHRfY29va2llcycsXG4gICAgfSk7XG59O1xuXG5jb25zdCBvblJlamVjdCA9ICgpID0+IHtcbiAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb246IFwicmVqZWN0X2Nvb2tpZXNcIixcbiAgICB9KTtcbn07XG5cbmNvbnN0IG9uVXNhZ2VEYXRhQ2xpY2tlZCA9ICgpID0+IHtcbiAgICBBbmFseXRpY3Muc2hvd0RldGFpbHNNb2RhbCgpO1xufTtcblxuY29uc3QgVE9BU1RfS0VZID0gXCJhbmFseXRpY3NcIjtcblxuZXhwb3J0IGNvbnN0IHNob3dUb2FzdCA9IChwb2xpY3lVcmw/OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkuYWRkT3JSZXBsYWNlVG9hc3Qoe1xuICAgICAgICBrZXk6IFRPQVNUX0tFWSxcbiAgICAgICAgdGl0bGU6IF90KFwiSGVscCB1cyBpbXByb3ZlICUoYnJhbmQpc1wiLCB7IGJyYW5kIH0pLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgIFwiU2VuZCA8VXNhZ2VEYXRhTGluaz5hbm9ueW1vdXMgdXNhZ2UgZGF0YTwvVXNhZ2VEYXRhTGluaz4gd2hpY2ggaGVscHMgdXMgaW1wcm92ZSAlKGJyYW5kKXMuIFwiICtcbiAgICAgICAgICAgICAgICBcIlRoaXMgd2lsbCB1c2UgYSA8UG9saWN5TGluaz5jb29raWU8L1BvbGljeUxpbms+LlwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYnJhbmQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwiVXNhZ2VEYXRhTGlua1wiOiAoc3ViKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9e29uVXNhZ2VEYXRhQ2xpY2tlZH0+eyBzdWIgfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgLy8gWFhYOiBXZSBuZWVkIHRvIGxpbmsgdG8gdGhlIHBhZ2UgdGhhdCBleHBsYWlucyBvdXIgY29va2llc1xuICAgICAgICAgICAgICAgICAgICBcIlBvbGljeUxpbmtcIjogKHN1YikgPT4gcG9saWN5VXJsID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj17cG9saWN5VXJsfT57IHN1YiB9PC9hPlxuICAgICAgICAgICAgICAgICAgICApIDogc3ViLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYWNjZXB0TGFiZWw6IF90KFwiWWVzXCIpLFxuICAgICAgICAgICAgb25BY2NlcHQsXG4gICAgICAgICAgICByZWplY3RMYWJlbDogX3QoXCJOb1wiKSxcbiAgICAgICAgICAgIG9uUmVqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnQ6IEdlbmVyaWNUb2FzdCxcbiAgICAgICAgY2xhc3NOYW1lOiBcIm14X0FuYWx5dGljc1RvYXN0XCIsXG4gICAgICAgIHByaW9yaXR5OiAxMCxcbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBoaWRlVG9hc3QgPSAoKSA9PiB7XG4gICAgVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLmRpc21pc3NUb2FzdChUT0FTVF9LRVkpO1xufTtcbiJdfQ==