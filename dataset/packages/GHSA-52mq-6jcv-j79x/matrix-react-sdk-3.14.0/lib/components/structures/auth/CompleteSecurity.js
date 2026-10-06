"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _SetupEncryptionStore = require("../../../stores/SetupEncryptionStore");

var _SetupEncryptionBody = _interopRequireDefault(require("./SetupEncryptionBody"));

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
class CompleteSecurity extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onStoreUpdate", () => {
      const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

      this.setState({
        phase: store.phase
      });
    });

    const _store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

    _store.on("update", this._onStoreUpdate);

    _store.start();

    this.state = {
      phase: _store.phase
    };
  }

  componentWillUnmount() {
    const store = _SetupEncryptionStore.SetupEncryptionStore.sharedInstance();

    store.off("update", this._onStoreUpdate);
    store.stop();
  }

  render() {
    const AuthPage = sdk.getComponent("auth.AuthPage");
    const CompleteSecurityBody = sdk.getComponent("auth.CompleteSecurityBody");
    const {
      phase
    } = this.state;
    let icon;
    let title;

    if (phase === _SetupEncryptionStore.PHASE_INTRO) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
      });
      title = (0, _languageHandler._t)("Verify this login");
    } else if (phase === _SetupEncryptionStore.PHASE_DONE) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_verified"
      });
      title = (0, _languageHandler._t)("Session verified");
    } else if (phase === _SetupEncryptionStore.PHASE_CONFIRM_SKIP) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
      });
      title = (0, _languageHandler._t)("Are you sure?");
    } else if (phase === _SetupEncryptionStore.PHASE_BUSY) {
      icon = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CompleteSecurity_headerIcon mx_E2EIcon_warning"
      });
      title = (0, _languageHandler._t)("Verify this login");
    } else {
      throw new Error(`Unknown phase ${phase}`);
    }

    return /*#__PURE__*/_react.default.createElement(AuthPage, null, /*#__PURE__*/_react.default.createElement(CompleteSecurityBody, null, /*#__PURE__*/_react.default.createElement("h2", {
      className: "mx_CompleteSecurity_header"
    }, icon, title), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CompleteSecurity_body"
    }, /*#__PURE__*/_react.default.createElement(_SetupEncryptionBody.default, {
      onFinished: this.props.onFinished
    }))));
  }

}

exports.default = CompleteSecurity;
(0, _defineProperty2.default)(CompleteSecurity, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9Db21wbGV0ZVNlY3VyaXR5LmpzIl0sIm5hbWVzIjpbIkNvbXBsZXRlU2VjdXJpdHkiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwic3RvcmUiLCJTZXR1cEVuY3J5cHRpb25TdG9yZSIsInNoYXJlZEluc3RhbmNlIiwic2V0U3RhdGUiLCJwaGFzZSIsIm9uIiwiX29uU3RvcmVVcGRhdGUiLCJzdGFydCIsInN0YXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvZmYiLCJzdG9wIiwicmVuZGVyIiwiQXV0aFBhZ2UiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJDb21wbGV0ZVNlY3VyaXR5Qm9keSIsImljb24iLCJ0aXRsZSIsIlBIQVNFX0lOVFJPIiwiUEhBU0VfRE9ORSIsIlBIQVNFX0NPTkZJUk1fU0tJUCIsIlBIQVNFX0JVU1kiLCJFcnJvciIsInByb3BzIiwib25GaW5pc2hlZCIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU9BOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFlZSxNQUFNQSxnQkFBTixTQUErQkMsZUFBTUMsU0FBckMsQ0FBK0M7QUFLMURDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBRFUsMERBUUcsTUFBTTtBQUNuQixZQUFNQyxLQUFLLEdBQUdDLDJDQUFxQkMsY0FBckIsRUFBZDs7QUFDQSxXQUFLQyxRQUFMLENBQWM7QUFBQ0MsUUFBQUEsS0FBSyxFQUFFSixLQUFLLENBQUNJO0FBQWQsT0FBZDtBQUNILEtBWGE7O0FBRVYsVUFBTUosTUFBSyxHQUFHQywyQ0FBcUJDLGNBQXJCLEVBQWQ7O0FBQ0FGLElBQUFBLE1BQUssQ0FBQ0ssRUFBTixDQUFTLFFBQVQsRUFBbUIsS0FBS0MsY0FBeEI7O0FBQ0FOLElBQUFBLE1BQUssQ0FBQ08sS0FBTjs7QUFDQSxTQUFLQyxLQUFMLEdBQWE7QUFBQ0osTUFBQUEsS0FBSyxFQUFFSixNQUFLLENBQUNJO0FBQWQsS0FBYjtBQUNIOztBQU9ESyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQixVQUFNVCxLQUFLLEdBQUdDLDJDQUFxQkMsY0FBckIsRUFBZDs7QUFDQUYsSUFBQUEsS0FBSyxDQUFDVSxHQUFOLENBQVUsUUFBVixFQUFvQixLQUFLSixjQUF6QjtBQUNBTixJQUFBQSxLQUFLLENBQUNXLElBQU47QUFDSDs7QUFFREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsUUFBUSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsZUFBakIsQ0FBakI7QUFDQSxVQUFNQyxvQkFBb0IsR0FBR0YsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDJCQUFqQixDQUE3QjtBQUNBLFVBQU07QUFBQ1gsTUFBQUE7QUFBRCxRQUFVLEtBQUtJLEtBQXJCO0FBQ0EsUUFBSVMsSUFBSjtBQUNBLFFBQUlDLEtBQUo7O0FBRUEsUUFBSWQsS0FBSyxLQUFLZSxpQ0FBZCxFQUEyQjtBQUN2QkYsTUFBQUEsSUFBSSxnQkFBRztBQUFNLFFBQUEsU0FBUyxFQUFDO0FBQWhCLFFBQVA7QUFDQUMsTUFBQUEsS0FBSyxHQUFHLHlCQUFHLG1CQUFILENBQVI7QUFDSCxLQUhELE1BR08sSUFBSWQsS0FBSyxLQUFLZ0IsZ0NBQWQsRUFBMEI7QUFDN0JILE1BQUFBLElBQUksZ0JBQUc7QUFBTSxRQUFBLFNBQVMsRUFBQztBQUFoQixRQUFQO0FBQ0FDLE1BQUFBLEtBQUssR0FBRyx5QkFBRyxrQkFBSCxDQUFSO0FBQ0gsS0FITSxNQUdBLElBQUlkLEtBQUssS0FBS2lCLHdDQUFkLEVBQWtDO0FBQ3JDSixNQUFBQSxJQUFJLGdCQUFHO0FBQU0sUUFBQSxTQUFTLEVBQUM7QUFBaEIsUUFBUDtBQUNBQyxNQUFBQSxLQUFLLEdBQUcseUJBQUcsZUFBSCxDQUFSO0FBQ0gsS0FITSxNQUdBLElBQUlkLEtBQUssS0FBS2tCLGdDQUFkLEVBQTBCO0FBQzdCTCxNQUFBQSxJQUFJLGdCQUFHO0FBQU0sUUFBQSxTQUFTLEVBQUM7QUFBaEIsUUFBUDtBQUNBQyxNQUFBQSxLQUFLLEdBQUcseUJBQUcsbUJBQUgsQ0FBUjtBQUNILEtBSE0sTUFHQTtBQUNILFlBQU0sSUFBSUssS0FBSixDQUFXLGlCQUFnQm5CLEtBQU0sRUFBakMsQ0FBTjtBQUNIOztBQUVELHdCQUNJLDZCQUFDLFFBQUQscUJBQ0ksNkJBQUMsb0JBQUQscUJBQ0k7QUFBSSxNQUFBLFNBQVMsRUFBQztBQUFkLE9BQ0thLElBREwsRUFFS0MsS0FGTCxDQURKLGVBS0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLDRCQUFEO0FBQXFCLE1BQUEsVUFBVSxFQUFFLEtBQUtNLEtBQUwsQ0FBV0M7QUFBNUMsTUFESixDQUxKLENBREosQ0FESjtBQWFIOztBQTVEeUQ7Ozs4QkFBekM3QixnQixlQUNFO0FBQ2Y2QixFQUFBQSxVQUFVLEVBQUVDLG1CQUFVQyxJQUFWLENBQWVDO0FBRFosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7XG4gICAgU2V0dXBFbmNyeXB0aW9uU3RvcmUsXG4gICAgUEhBU0VfSU5UUk8sXG4gICAgUEhBU0VfQlVTWSxcbiAgICBQSEFTRV9ET05FLFxuICAgIFBIQVNFX0NPTkZJUk1fU0tJUCxcbn0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL1NldHVwRW5jcnlwdGlvblN0b3JlJztcbmltcG9ydCBTZXR1cEVuY3J5cHRpb25Cb2R5IGZyb20gXCIuL1NldHVwRW5jcnlwdGlvbkJvZHlcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGxldGVTZWN1cml0eSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgc3RvcmUub24oXCJ1cGRhdGVcIiwgdGhpcy5fb25TdG9yZVVwZGF0ZSk7XG4gICAgICAgIHN0b3JlLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7cGhhc2U6IHN0b3JlLnBoYXNlfTtcbiAgICB9XG5cbiAgICBfb25TdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBTZXR1cEVuY3J5cHRpb25TdG9yZS5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtwaGFzZTogc3RvcmUucGhhc2V9KTtcbiAgICB9O1xuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gU2V0dXBFbmNyeXB0aW9uU3RvcmUuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgc3RvcmUub2ZmKFwidXBkYXRlXCIsIHRoaXMuX29uU3RvcmVVcGRhdGUpO1xuICAgICAgICBzdG9yZS5zdG9wKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBBdXRoUGFnZSA9IHNkay5nZXRDb21wb25lbnQoXCJhdXRoLkF1dGhQYWdlXCIpO1xuICAgICAgICBjb25zdCBDb21wbGV0ZVNlY3VyaXR5Qm9keSA9IHNkay5nZXRDb21wb25lbnQoXCJhdXRoLkNvbXBsZXRlU2VjdXJpdHlCb2R5XCIpO1xuICAgICAgICBjb25zdCB7cGhhc2V9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgbGV0IGljb247XG4gICAgICAgIGxldCB0aXRsZTtcblxuICAgICAgICBpZiAocGhhc2UgPT09IFBIQVNFX0lOVFJPKSB7XG4gICAgICAgICAgICBpY29uID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9oZWFkZXJJY29uIG14X0UyRUljb25fd2FybmluZ1wiIC8+O1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlZlcmlmeSB0aGlzIGxvZ2luXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHBoYXNlID09PSBQSEFTRV9ET05FKSB7XG4gICAgICAgICAgICBpY29uID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9oZWFkZXJJY29uIG14X0UyRUljb25fdmVyaWZpZWRcIiAvPjtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJTZXNzaW9uIHZlcmlmaWVkXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHBoYXNlID09PSBQSEFTRV9DT05GSVJNX1NLSVApIHtcbiAgICAgICAgICAgIGljb24gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9Db21wbGV0ZVNlY3VyaXR5X2hlYWRlckljb24gbXhfRTJFSWNvbl93YXJuaW5nXCIgLz47XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiQXJlIHlvdSBzdXJlP1wiKTtcbiAgICAgICAgfSBlbHNlIGlmIChwaGFzZSA9PT0gUEhBU0VfQlVTWSkge1xuICAgICAgICAgICAgaWNvbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0NvbXBsZXRlU2VjdXJpdHlfaGVhZGVySWNvbiBteF9FMkVJY29uX3dhcm5pbmdcIiAvPjtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJWZXJpZnkgdGhpcyBsb2dpblwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwaGFzZSAke3BoYXNlfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBdXRoUGFnZT5cbiAgICAgICAgICAgICAgICA8Q29tcGxldGVTZWN1cml0eUJvZHk+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJteF9Db21wbGV0ZVNlY3VyaXR5X2hlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2ljb259XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGl0bGV9XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ29tcGxldGVTZWN1cml0eV9ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2V0dXBFbmNyeXB0aW9uQm9keSBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvQ29tcGxldGVTZWN1cml0eUJvZHk+XG4gICAgICAgICAgICA8L0F1dGhQYWdlPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==