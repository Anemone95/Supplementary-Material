"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _BasePlatform = require("../../../BasePlatform");

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _useDispatcher = require("../../../hooks/useDispatcher");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _languageHandler = require("../../../languageHandler");

var _InlineSpinner = _interopRequireDefault(require("../../../components/views/elements/InlineSpinner"));

var _AccessibleButton = _interopRequireDefault(require("../../../components/views/elements/AccessibleButton"));

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
function installUpdate() {
  _PlatformPeg.default.get().installUpdate();
}

function getStatusText(status
/*: UpdateCheckStatus*/
, errorDetail
/*: string*/
) {
  switch (status) {
    case _BasePlatform.UpdateCheckStatus.Error:
      return (0, _languageHandler._t)('Error encountered (%(errorDetail)s).', {
        errorDetail
      });

    case _BasePlatform.UpdateCheckStatus.Checking:
      return (0, _languageHandler._t)('Checking for an update...');

    case _BasePlatform.UpdateCheckStatus.NotAvailable:
      return (0, _languageHandler._t)('No update available.');

    case _BasePlatform.UpdateCheckStatus.Downloading:
      return (0, _languageHandler._t)('Downloading update...');

    case _BasePlatform.UpdateCheckStatus.Ready:
      return (0, _languageHandler._t)("New version available. <a>Update now.</a>", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link",
          onClick: installUpdate
        }, sub)
      });
  }
}

const doneStatuses = [_BasePlatform.UpdateCheckStatus.Ready, _BasePlatform.UpdateCheckStatus.Error, _BasePlatform.UpdateCheckStatus.NotAvailable];

const UpdateCheckButton = () => {
  const [state, setState] = (0, _react.useState)(null);

  const onCheckForUpdateClick = () => {
    setState(null);

    _PlatformPeg.default.get().startUpdateCheck();
  };

  (0, _useDispatcher.useDispatcher)(_dispatcher.default, (_ref) => {
    let {
      action
    } = _ref,
        params = (0, _objectWithoutProperties2.default)(_ref, ["action"]);

    if (action === _actions.Action.CheckUpdates) {
      setState(params);
    }
  });
  const busy = state && !doneStatuses.includes(state.status);
  let suffix;

  if (state) {
    suffix = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_UpdateCheckButton_summary"
    }, getStatusText(state.status, state.detail), busy && /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null));
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onCheckForUpdateClick,
    kind: "primary",
    disabled: busy
  }, (0, _languageHandler._t)("Check for update")), suffix);
};

var _default = UpdateCheckButton;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL1VwZGF0ZUNoZWNrQnV0dG9uLnRzeCJdLCJuYW1lcyI6WyJpbnN0YWxsVXBkYXRlIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJnZXRTdGF0dXNUZXh0Iiwic3RhdHVzIiwiZXJyb3JEZXRhaWwiLCJVcGRhdGVDaGVja1N0YXR1cyIsIkVycm9yIiwiQ2hlY2tpbmciLCJOb3RBdmFpbGFibGUiLCJEb3dubG9hZGluZyIsIlJlYWR5IiwiYSIsInN1YiIsImRvbmVTdGF0dXNlcyIsIlVwZGF0ZUNoZWNrQnV0dG9uIiwic3RhdGUiLCJzZXRTdGF0ZSIsIm9uQ2hlY2tGb3JVcGRhdGVDbGljayIsInN0YXJ0VXBkYXRlQ2hlY2siLCJkaXMiLCJhY3Rpb24iLCJwYXJhbXMiLCJBY3Rpb24iLCJDaGVja1VwZGF0ZXMiLCJidXN5IiwiaW5jbHVkZXMiLCJzdWZmaXgiLCJkZXRhaWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWNBLFNBQVNBLGFBQVQsR0FBeUI7QUFDckJDLHVCQUFZQyxHQUFaLEdBQWtCRixhQUFsQjtBQUNIOztBQUVELFNBQVNHLGFBQVQsQ0FBdUJDO0FBQXZCO0FBQUEsRUFBa0RDO0FBQWxEO0FBQUEsRUFBd0U7QUFDcEUsVUFBUUQsTUFBUjtBQUNJLFNBQUtFLGdDQUFrQkMsS0FBdkI7QUFDSSxhQUFPLHlCQUFHLHNDQUFILEVBQTJDO0FBQUVGLFFBQUFBO0FBQUYsT0FBM0MsQ0FBUDs7QUFDSixTQUFLQyxnQ0FBa0JFLFFBQXZCO0FBQ0ksYUFBTyx5QkFBRywyQkFBSCxDQUFQOztBQUNKLFNBQUtGLGdDQUFrQkcsWUFBdkI7QUFDSSxhQUFPLHlCQUFHLHNCQUFILENBQVA7O0FBQ0osU0FBS0gsZ0NBQWtCSSxXQUF2QjtBQUNJLGFBQU8seUJBQUcsdUJBQUgsQ0FBUDs7QUFDSixTQUFLSixnQ0FBa0JLLEtBQXZCO0FBQ0ksYUFBTyx5QkFBRywyQ0FBSCxFQUFnRCxFQUFoRCxFQUFvRDtBQUN2REMsUUFBQUEsQ0FBQyxFQUFFQyxHQUFHLGlCQUFJLDZCQUFDLHlCQUFEO0FBQWtCLFVBQUEsSUFBSSxFQUFDLE1BQXZCO0FBQThCLFVBQUEsT0FBTyxFQUFFYjtBQUF2QyxXQUF1RGEsR0FBdkQ7QUFENkMsT0FBcEQsQ0FBUDtBQVZSO0FBY0g7O0FBRUQsTUFBTUMsWUFBWSxHQUFHLENBQ2pCUixnQ0FBa0JLLEtBREQsRUFFakJMLGdDQUFrQkMsS0FGRCxFQUdqQkQsZ0NBQWtCRyxZQUhELENBQXJCOztBQU1BLE1BQU1NLGlCQUFpQixHQUFHLE1BQU07QUFDNUIsUUFBTSxDQUFDQyxLQUFELEVBQVFDLFFBQVIsSUFBb0IscUJBQThCLElBQTlCLENBQTFCOztBQUVBLFFBQU1DLHFCQUFxQixHQUFHLE1BQU07QUFDaENELElBQUFBLFFBQVEsQ0FBQyxJQUFELENBQVI7O0FBQ0FoQix5QkFBWUMsR0FBWixHQUFrQmlCLGdCQUFsQjtBQUNILEdBSEQ7O0FBS0Esb0NBQWNDLG1CQUFkLEVBQW1CLFVBQXlCO0FBQUEsUUFBeEI7QUFBQ0MsTUFBQUE7QUFBRCxLQUF3QjtBQUFBLFFBQVpDLE1BQVk7O0FBQ3hDLFFBQUlELE1BQU0sS0FBS0UsZ0JBQU9DLFlBQXRCLEVBQW9DO0FBQ2hDUCxNQUFBQSxRQUFRLENBQUNLLE1BQUQsQ0FBUjtBQUNIO0FBQ0osR0FKRDtBQU1BLFFBQU1HLElBQUksR0FBR1QsS0FBSyxJQUFJLENBQUNGLFlBQVksQ0FBQ1ksUUFBYixDQUFzQlYsS0FBSyxDQUFDWixNQUE1QixDQUF2QjtBQUVBLE1BQUl1QixNQUFKOztBQUNBLE1BQUlYLEtBQUosRUFBVztBQUNQVyxJQUFBQSxNQUFNLGdCQUFHO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FDSnhCLGFBQWEsQ0FBQ2EsS0FBSyxDQUFDWixNQUFQLEVBQWVZLEtBQUssQ0FBQ1ksTUFBckIsQ0FEVCxFQUVKSCxJQUFJLGlCQUFJLDZCQUFDLHNCQUFELE9BRkosQ0FBVDtBQUlIOztBQUVELHNCQUFPLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUNILDZCQUFDLHlCQUFEO0FBQWtCLElBQUEsT0FBTyxFQUFFUCxxQkFBM0I7QUFBa0QsSUFBQSxJQUFJLEVBQUMsU0FBdkQ7QUFBaUUsSUFBQSxRQUFRLEVBQUVPO0FBQTNFLEtBQ0sseUJBQUcsa0JBQUgsQ0FETCxDQURHLEVBSURFLE1BSkMsQ0FBUDtBQU1ILENBOUJEOztlQWdDZVosaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VTdGF0ZX0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7VXBkYXRlQ2hlY2tTdGF0dXN9IGZyb20gXCIuLi8uLi8uLi9CYXNlUGxhdGZvcm1cIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi4vLi4vLi4vUGxhdGZvcm1QZWdcIjtcbmltcG9ydCB7dXNlRGlzcGF0Y2hlcn0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZURpc3BhdGNoZXJcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBJbmxpbmVTcGlubmVyIGZyb20gXCIuLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0lubGluZVNwaW5uZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7Q2hlY2tVcGRhdGVzUGF5bG9hZH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvQ2hlY2tVcGRhdGVzUGF5bG9hZFwiO1xuXG5mdW5jdGlvbiBpbnN0YWxsVXBkYXRlKCkge1xuICAgIFBsYXRmb3JtUGVnLmdldCgpLmluc3RhbGxVcGRhdGUoKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhdHVzVGV4dChzdGF0dXM6IFVwZGF0ZUNoZWNrU3RhdHVzLCBlcnJvckRldGFpbD86IHN0cmluZykge1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgVXBkYXRlQ2hlY2tTdGF0dXMuRXJyb3I6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ0Vycm9yIGVuY291bnRlcmVkICglKGVycm9yRGV0YWlsKXMpLicsIHsgZXJyb3JEZXRhaWwgfSk7XG4gICAgICAgIGNhc2UgVXBkYXRlQ2hlY2tTdGF0dXMuQ2hlY2tpbmc6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ0NoZWNraW5nIGZvciBhbiB1cGRhdGUuLi4nKTtcbiAgICAgICAgY2FzZSBVcGRhdGVDaGVja1N0YXR1cy5Ob3RBdmFpbGFibGU6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ05vIHVwZGF0ZSBhdmFpbGFibGUuJyk7XG4gICAgICAgIGNhc2UgVXBkYXRlQ2hlY2tTdGF0dXMuRG93bmxvYWRpbmc6XG4gICAgICAgICAgICByZXR1cm4gX3QoJ0Rvd25sb2FkaW5nIHVwZGF0ZS4uLicpO1xuICAgICAgICBjYXNlIFVwZGF0ZUNoZWNrU3RhdHVzLlJlYWR5OlxuICAgICAgICAgICAgcmV0dXJuIF90KFwiTmV3IHZlcnNpb24gYXZhaWxhYmxlLiA8YT5VcGRhdGUgbm93LjwvYT5cIiwge30sIHtcbiAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXtpbnN0YWxsVXBkYXRlfT57c3VifTwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNvbnN0IGRvbmVTdGF0dXNlcyA9IFtcbiAgICBVcGRhdGVDaGVja1N0YXR1cy5SZWFkeSxcbiAgICBVcGRhdGVDaGVja1N0YXR1cy5FcnJvcixcbiAgICBVcGRhdGVDaGVja1N0YXR1cy5Ob3RBdmFpbGFibGUsXG5dO1xuXG5jb25zdCBVcGRhdGVDaGVja0J1dHRvbiA9ICgpID0+IHtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlPENoZWNrVXBkYXRlc1BheWxvYWQ+KG51bGwpO1xuXG4gICAgY29uc3Qgb25DaGVja0ZvclVwZGF0ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBzZXRTdGF0ZShudWxsKTtcbiAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkuc3RhcnRVcGRhdGVDaGVjaygpO1xuICAgIH07XG5cbiAgICB1c2VEaXNwYXRjaGVyKGRpcywgKHthY3Rpb24sIC4uLnBhcmFtc30pID0+IHtcbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gQWN0aW9uLkNoZWNrVXBkYXRlcykge1xuICAgICAgICAgICAgc2V0U3RhdGUocGFyYW1zIGFzIENoZWNrVXBkYXRlc1BheWxvYWQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBidXN5ID0gc3RhdGUgJiYgIWRvbmVTdGF0dXNlcy5pbmNsdWRlcyhzdGF0ZS5zdGF0dXMpO1xuXG4gICAgbGV0IHN1ZmZpeDtcbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgc3VmZml4ID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfVXBkYXRlQ2hlY2tCdXR0b25fc3VtbWFyeVwiPlxuICAgICAgICAgICAge2dldFN0YXR1c1RleHQoc3RhdGUuc3RhdHVzLCBzdGF0ZS5kZXRhaWwpfVxuICAgICAgICAgICAge2J1c3kgJiYgPElubGluZVNwaW5uZXIgLz59XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25DaGVja0ZvclVwZGF0ZUNsaWNrfSBraW5kPVwicHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fT5cbiAgICAgICAgICAgIHtfdChcIkNoZWNrIGZvciB1cGRhdGVcIil9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgeyBzdWZmaXggfVxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVXBkYXRlQ2hlY2tCdXR0b247XG4iXX0=