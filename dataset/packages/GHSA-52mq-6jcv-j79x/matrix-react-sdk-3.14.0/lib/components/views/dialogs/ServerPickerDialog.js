"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _autodiscovery = require("matrix-js-sdk/src/autodiscovery");

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../../utils/AutoDiscoveryUtils"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _StyledRadioButton = _interopRequireDefault(require("../elements/StyledRadioButton"));

var _TextWithTooltip = _interopRequireDefault(require("../elements/TextWithTooltip"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

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
class ServerPickerDialog extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "defaultServer", void 0);
    (0, _defineProperty2.default)(this, "fieldRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "validatedConf", void 0);
    (0, _defineProperty2.default)(this, "onDefaultChosen", () => {
      this.setState({
        defaultChosen: true
      });
    });
    (0, _defineProperty2.default)(this, "onOtherChosen", () => {
      this.setState({
        defaultChosen: false
      });
    });
    (0, _defineProperty2.default)(this, "onHomeserverChange", ev => {
      this.setState({
        otherHomeserver: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "validate", (0, _Validation.default)({
      deriveData: async ({
        value
      }) => {
        let hsUrl = value.trim(); // trim to account for random whitespace
        // if the URL has no protocol, try validate it as a serverName via well-known

        if (!hsUrl.includes("://")) {
          try {
            const discoveryResult = await _autodiscovery.AutoDiscovery.findClientConfig(hsUrl);
            this.validatedConf = _AutoDiscoveryUtils.default.buildValidatedConfigFromDiscovery(hsUrl, discoveryResult);
            return {}; // we have a validated config, we don't need to try the other paths
          } catch (e) {
            console.error(`Attempted ${hsUrl} as a server_name but it failed`, e);
          }
        } // if we got to this stage then either the well-known failed or the URL had a protocol specified,
        // so validate statically only. If the URL has no protocol, default to https.


        if (!hsUrl.includes("://")) {
          hsUrl = "https://" + hsUrl;
        }

        try {
          this.validatedConf = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(hsUrl);
          return {};
        } catch (e) {
          console.error(e);

          const stateForError = _AutoDiscoveryUtils.default.authComponentStateForError(e);

          if (stateForError.isFatalError) {
            let error = (0, _languageHandler._t)("Unable to validate homeserver");

            if (e.translatedMessage) {
              error = e.translatedMessage;
            }

            return {
              error
            };
          } // try to carry on anyway


          try {
            this.validatedConf = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(hsUrl, null, true);
            return {};
          } catch (e) {
            console.error(e);
            return {
              error: (0, _languageHandler._t)("Invalid URL")
            };
          }
        }
      },
      rules: [{
        key: "required",
        test: ({
          value,
          allowEmpty
        }) => allowEmpty || !!value,
        invalid: () => (0, _languageHandler._t)("Specify a homeserver")
      }, {
        key: "valid",
        test: async function ({
          value
        }, {
          error
        }) {
          if (!value) return true;
          return !error;
        },
        invalid: function ({
          error
        }) {
          return error;
        }
      }]
    }));
    (0, _defineProperty2.default)(this, "onHomeserverValidate", (fieldState
    /*: IFieldState*/
    ) => this.validate(fieldState));
    (0, _defineProperty2.default)(this, "onSubmit", async ev => {
      ev.preventDefault();
      const valid = await this.fieldRef.current.validate({
        allowEmpty: false
      });

      if (!valid && !this.state.defaultChosen) {
        this.fieldRef.current.focus();
        this.fieldRef.current.validate({
          allowEmpty: false,
          focused: true
        });
        return;
      }

      this.props.onFinished(this.state.defaultChosen ? this.defaultServer : this.validatedConf);
    });

    const config = _SdkConfig.default.get();

    this.defaultServer = config["validated_server_config"];
    const {
      serverConfig
    } = this.props;
    let otherHomeserver = "";

    if (!serverConfig.isDefault) {
      if (serverConfig.isNameResolvable && serverConfig.hsName) {
        otherHomeserver = serverConfig.hsName;
      } else {
        otherHomeserver = serverConfig.hsUrl;
      }
    }

    this.state = {
      defaultChosen: serverConfig.isDefault,
      otherHomeserver
    };
  }

  render() {
    let text;

    if (this.defaultServer.hsName === "matrix.org") {
      text = (0, _languageHandler._t)("Matrix.org is the biggest public homeserver in the world, so it’s a good place for many.");
    }

    let defaultServerName = this.defaultServer.hsName;

    if (this.defaultServer.hsNameIsDifferent) {
      defaultServerName = /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
        class: "mx_Login_underlinedServerName",
        tooltip: this.defaultServer.hsUrl
      }, this.defaultServer.hsName);
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      title: this.props.title || (0, _languageHandler._t)("Sign into your homeserver"),
      className: "mx_ServerPickerDialog",
      contentId: "mx_ServerPickerDialog",
      onFinished: this.props.onFinished,
      fixedWidth: false,
      hasCancel: true
    }, /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_Dialog_content",
      id: "mx_ServerPickerDialog",
      onSubmit: this.onSubmit
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We call the places where you can host your account ‘homeservers’."), " ", text), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      name: "defaultChosen",
      value: "true",
      checked: this.state.defaultChosen,
      onChange: this.onDefaultChosen
    }, defaultServerName), /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      name: "defaultChosen",
      value: "false",
      className: "mx_ServerPickerDialog_otherHomeserverRadio",
      checked: !this.state.defaultChosen,
      onChange: this.onOtherChosen
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      className: "mx_ServerPickerDialog_otherHomeserver",
      label: (0, _languageHandler._t)("Other homeserver"),
      onChange: this.onHomeserverChange,
      onClick: this.onOtherChosen,
      ref: this.fieldRef,
      onValidate: this.onHomeserverValidate,
      value: this.state.otherHomeserver,
      validateOnChange: false,
      validateOnFocus: false
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Use your preferred Matrix homeserver if you have one, or host your own.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_ServerPickerDialog_continue",
      kind: "primary",
      onClick: this.onSubmit
    }, (0, _languageHandler._t)("Continue")), /*#__PURE__*/_react.default.createElement("h4", null, (0, _languageHandler._t)("Learn more")), /*#__PURE__*/_react.default.createElement("a", {
      href: "https://matrix.org/faq/#what-is-a-homeserver%3F",
      target: "_blank",
      rel: "noreferrer noopener"
    }, (0, _languageHandler._t)("About homeservers"))));
  }

}

exports.default = ServerPickerDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2VydmVyUGlja2VyRGlhbG9nLnRzeCJdLCJuYW1lcyI6WyJTZXJ2ZXJQaWNrZXJEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2V0U3RhdGUiLCJkZWZhdWx0Q2hvc2VuIiwiZXYiLCJvdGhlckhvbWVzZXJ2ZXIiLCJ0YXJnZXQiLCJ2YWx1ZSIsImRlcml2ZURhdGEiLCJoc1VybCIsInRyaW0iLCJpbmNsdWRlcyIsImRpc2NvdmVyeVJlc3VsdCIsIkF1dG9EaXNjb3ZlcnkiLCJmaW5kQ2xpZW50Q29uZmlnIiwidmFsaWRhdGVkQ29uZiIsIkF1dG9EaXNjb3ZlcnlVdGlscyIsImJ1aWxkVmFsaWRhdGVkQ29uZmlnRnJvbURpc2NvdmVyeSIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJ2YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzIiwic3RhdGVGb3JFcnJvciIsImF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yIiwiaXNGYXRhbEVycm9yIiwidHJhbnNsYXRlZE1lc3NhZ2UiLCJydWxlcyIsImtleSIsInRlc3QiLCJhbGxvd0VtcHR5IiwiaW52YWxpZCIsImZpZWxkU3RhdGUiLCJ2YWxpZGF0ZSIsInByZXZlbnREZWZhdWx0IiwidmFsaWQiLCJmaWVsZFJlZiIsImN1cnJlbnQiLCJzdGF0ZSIsImZvY3VzIiwiZm9jdXNlZCIsIm9uRmluaXNoZWQiLCJkZWZhdWx0U2VydmVyIiwiY29uZmlnIiwiU2RrQ29uZmlnIiwiZ2V0Iiwic2VydmVyQ29uZmlnIiwiaXNEZWZhdWx0IiwiaXNOYW1lUmVzb2x2YWJsZSIsImhzTmFtZSIsInJlbmRlciIsInRleHQiLCJkZWZhdWx0U2VydmVyTmFtZSIsImhzTmFtZUlzRGlmZmVyZW50IiwidGl0bGUiLCJvblN1Ym1pdCIsIm9uRGVmYXVsdENob3NlbiIsIm9uT3RoZXJDaG9zZW4iLCJv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SSw2QkFBQyxjQUFEO0FBQ0ksTUFBQSxJQUFJLEVBQUMsTUFEVDtBQUVJLE1BQUEsU0FBUyxFQUFDLHVDQUZkO0FBR0ksTUFBQSxLQUFLLEVBQUUseUJBQUcsa0JBQUgsQ0FIWDtBQUlJLE1BQUEsUUFBUSxFQUFFLEtBQUtDLGtCQUpuQjtBQUtJLE1BQUEsT0FBTyxFQUFFLEtBQUtELGFBTGxCO0FBTUksTUFBQSxHQUFHLEVBQUUsS0FBS3JCLFFBTmQ7QUFPSSxNQUFBLFVBQVUsRUFBRSxLQUFLdUIsb0JBUHJCO0FBUUksTUFBQSxLQUFLLEVBQUUsS0FBS3JCLEtBQUwsQ0FBV2hDLGVBUnRCO0FBU0ksTUFBQSxnQkFBZ0IsRUFBRSxLQVR0QjtBQVVJLE1BQUEsZUFBZSxFQUFFO0FBVnJCLE1BUEosQ0FkSixlQWtDSSx3Q0FDSyx5QkFBRyx5RUFBSCxDQURMLENBbENKLGVBc0NJLDZCQUFDLHlCQUFEO0FBQWtCLE1BQUEsU0FBUyxFQUFDLGdDQUE1QjtBQUE2RCxNQUFBLElBQUksRUFBQyxTQUFsRTtBQUE0RSxNQUFBLE9BQU8sRUFBRSxLQUFLaUQ7QUFBMUYsT0FDSyx5QkFBRyxVQUFILENBREwsQ0F0Q0osZUEwQ0kseUNBQUsseUJBQUcsWUFBSCxDQUFMLENBMUNKLGVBMkNJO0FBQUcsTUFBQSxJQUFJLEVBQUMsaURBQVI7QUFBMEQsTUFBQSxNQUFNLEVBQUMsUUFBakU7QUFBMEUsTUFBQSxHQUFHLEVBQUM7QUFBOUUsT0FDSyx5QkFBRyxtQkFBSCxDQURMLENBM0NKLENBUkcsQ0FBUDtBQXdESDs7QUFqTStFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7QXV0b0Rpc2NvdmVyeX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2F1dG9kaXNjb3ZlcnlcIjtcblxuaW1wb3J0IEF1dG9EaXNjb3ZlcnlVdGlscywge1ZhbGlkYXRlZFNlcnZlckNvbmZpZ30gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0F1dG9EaXNjb3ZlcnlVdGlsc1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSAnLi9CYXNlRGlhbG9nJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBTdHlsZWRSYWRpb0J1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkUmFkaW9CdXR0b25cIjtcbmltcG9ydCBUZXh0V2l0aFRvb2x0aXAgZnJvbSBcIi4uL2VsZW1lbnRzL1RleHRXaXRoVG9vbHRpcFwiO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uLCB7SUZpZWxkU3RhdGV9IGZyb20gXCIuLi9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHRpdGxlPzogc3RyaW5nO1xuICAgIHNlcnZlckNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIG9uRmluaXNoZWQoY29uZmlnPzogVmFsaWRhdGVkU2VydmVyQ29uZmlnKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZGVmYXVsdENob3NlbjogYm9vbGVhbjtcbiAgICBvdGhlckhvbWVzZXJ2ZXI6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyUGlja2VyRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVmYXVsdFNlcnZlcjogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZmllbGRSZWYgPSBjcmVhdGVSZWY8RmllbGQ+KCk7XG4gICAgcHJpdmF0ZSB2YWxpZGF0ZWRDb25mOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuICAgICAgICB0aGlzLmRlZmF1bHRTZXJ2ZXIgPSBjb25maWdbXCJ2YWxpZGF0ZWRfc2VydmVyX2NvbmZpZ1wiXSBhcyBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG4gICAgICAgIGNvbnN0IHsgc2VydmVyQ29uZmlnIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGxldCBvdGhlckhvbWVzZXJ2ZXIgPSBcIlwiO1xuICAgICAgICBpZiAoIXNlcnZlckNvbmZpZy5pc0RlZmF1bHQpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJDb25maWcuaXNOYW1lUmVzb2x2YWJsZSAmJiBzZXJ2ZXJDb25maWcuaHNOYW1lKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJIb21lc2VydmVyID0gc2VydmVyQ29uZmlnLmhzTmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3RoZXJIb21lc2VydmVyID0gc2VydmVyQ29uZmlnLmhzVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRDaG9zZW46IHNlcnZlckNvbmZpZy5pc0RlZmF1bHQsXG4gICAgICAgICAgICBvdGhlckhvbWVzZXJ2ZXIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRlZmF1bHRDaG9zZW4gPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkZWZhdWx0Q2hvc2VuOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uT3RoZXJDaG9zZW4gPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkZWZhdWx0Q2hvc2VuOiBmYWxzZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkhvbWVzZXJ2ZXJDaGFuZ2UgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG90aGVySG9tZXNlcnZlcjogZXYudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICAvLyBUT0RPOiBEbyB3ZSB3YW50IHRvIHN1cHBvcnQgLndlbGwta25vd24gbG9va3VwcyBoZXJlP1xuICAgIC8vIElmIGZvciBzb21lIHJlYXNvbiBzb21lb25lIGVudGVycyBcIm1hdHJpeC5vcmdcIiBmb3IgYSBVUkwsIHdlIGNvdWxkIGRvIGEgbG9va3VwIHRvXG4gICAgLy8gZmluZCB0aGVpciBob21lc2VydmVyIHdpdGhvdXQgZGVtYW5kaW5nIHRoZXkgdXNlIFwiaHR0cHM6Ly9tYXRyaXgub3JnXCJcbiAgICBwcml2YXRlIHZhbGlkYXRlID0gd2l0aFZhbGlkYXRpb248dGhpcywgeyBlcnJvcj86IHN0cmluZyB9Pih7XG4gICAgICAgIGRlcml2ZURhdGE6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgIGxldCBoc1VybCA9IHZhbHVlLnRyaW0oKTsgLy8gdHJpbSB0byBhY2NvdW50IGZvciByYW5kb20gd2hpdGVzcGFjZVxuXG4gICAgICAgICAgICAvLyBpZiB0aGUgVVJMIGhhcyBubyBwcm90b2NvbCwgdHJ5IHZhbGlkYXRlIGl0IGFzIGEgc2VydmVyTmFtZSB2aWEgd2VsbC1rbm93blxuICAgICAgICAgICAgaWYgKCFoc1VybC5pbmNsdWRlcyhcIjovL1wiKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc2NvdmVyeVJlc3VsdCA9IGF3YWl0IEF1dG9EaXNjb3ZlcnkuZmluZENsaWVudENvbmZpZyhoc1VybCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGVkQ29uZiA9IEF1dG9EaXNjb3ZlcnlVdGlscy5idWlsZFZhbGlkYXRlZENvbmZpZ0Zyb21EaXNjb3ZlcnkoaHNVcmwsIGRpc2NvdmVyeVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTsgLy8gd2UgaGF2ZSBhIHZhbGlkYXRlZCBjb25maWcsIHdlIGRvbid0IG5lZWQgdG8gdHJ5IHRoZSBvdGhlciBwYXRoc1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQXR0ZW1wdGVkICR7aHNVcmx9IGFzIGEgc2VydmVyX25hbWUgYnV0IGl0IGZhaWxlZGAsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgd2UgZ290IHRvIHRoaXMgc3RhZ2UgdGhlbiBlaXRoZXIgdGhlIHdlbGwta25vd24gZmFpbGVkIG9yIHRoZSBVUkwgaGFkIGEgcHJvdG9jb2wgc3BlY2lmaWVkLFxuICAgICAgICAgICAgLy8gc28gdmFsaWRhdGUgc3RhdGljYWxseSBvbmx5LiBJZiB0aGUgVVJMIGhhcyBubyBwcm90b2NvbCwgZGVmYXVsdCB0byBodHRwcy5cbiAgICAgICAgICAgIGlmICghaHNVcmwuaW5jbHVkZXMoXCI6Ly9cIikpIHtcbiAgICAgICAgICAgICAgICBoc1VybCA9IFwiaHR0cHM6Ly9cIiArIGhzVXJsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGVkQ29uZiA9IGF3YWl0IEF1dG9EaXNjb3ZlcnlVdGlscy52YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzKGhzVXJsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlRm9yRXJyb3IgPSBBdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlRm9yRXJyb3IuaXNGYXRhbEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlcnJvciA9IF90KFwiVW5hYmxlIHRvIHZhbGlkYXRlIGhvbWVzZXJ2ZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRyYW5zbGF0ZWRNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9IGUudHJhbnNsYXRlZE1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3IgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB0cnkgdG8gY2Fycnkgb24gYW55d2F5XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZWRDb25mID0gYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMoaHNVcmwsIG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBlcnJvcjogX3QoXCJJbnZhbGlkIFVSTFwiKSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSA9PiBhbGxvd0VtcHR5IHx8ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJTcGVjaWZ5IGEgaG9tZXNlcnZlclwiKSxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwidmFsaWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyBmdW5jdGlvbih7IHZhbHVlIH0sIHsgZXJyb3IgfSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFlcnJvcjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6IGZ1bmN0aW9uKHsgZXJyb3IgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBwcml2YXRlIG9uSG9tZXNlcnZlclZhbGlkYXRlID0gKGZpZWxkU3RhdGU6IElGaWVsZFN0YXRlKSA9PiB0aGlzLnZhbGlkYXRlKGZpZWxkU3RhdGUpO1xuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdCA9IGFzeW5jIChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgdGhpcy5maWVsZFJlZi5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG5cbiAgICAgICAgaWYgKCF2YWxpZCAmJiAhdGhpcy5zdGF0ZS5kZWZhdWx0Q2hvc2VuKSB7XG4gICAgICAgICAgICB0aGlzLmZpZWxkUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuZmllbGRSZWYuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRoaXMuc3RhdGUuZGVmYXVsdENob3NlbiA/IHRoaXMuZGVmYXVsdFNlcnZlciA6IHRoaXMudmFsaWRhdGVkQ29uZik7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0U2VydmVyLmhzTmFtZSA9PT0gXCJtYXRyaXgub3JnXCIpIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIk1hdHJpeC5vcmcgaXMgdGhlIGJpZ2dlc3QgcHVibGljIGhvbWVzZXJ2ZXIgaW4gdGhlIHdvcmxkLCBzbyBpdOKAmXMgYSBnb29kIHBsYWNlIGZvciBtYW55LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZWZhdWx0U2VydmVyTmFtZSA9IHRoaXMuZGVmYXVsdFNlcnZlci5oc05hbWU7XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRTZXJ2ZXIuaHNOYW1lSXNEaWZmZXJlbnQpIHtcbiAgICAgICAgICAgIGRlZmF1bHRTZXJ2ZXJOYW1lID0gKFxuICAgICAgICAgICAgICAgIDxUZXh0V2l0aFRvb2x0aXAgY2xhc3M9XCJteF9Mb2dpbl91bmRlcmxpbmVkU2VydmVyTmFtZVwiIHRvb2x0aXA9e3RoaXMuZGVmYXVsdFNlcnZlci5oc1VybH0+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLmRlZmF1bHRTZXJ2ZXIuaHNOYW1lfVxuICAgICAgICAgICAgICAgIDwvVGV4dFdpdGhUb29sdGlwPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgdGl0bGU9e3RoaXMucHJvcHMudGl0bGUgfHwgX3QoXCJTaWduIGludG8geW91ciBob21lc2VydmVyXCIpfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU2VydmVyUGlja2VyRGlhbG9nXCJcbiAgICAgICAgICAgIGNvbnRlbnRJZD1cIm14X1NlcnZlclBpY2tlckRpYWxvZ1wiXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICBmaXhlZFdpZHRoPXtmYWxzZX1cbiAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIiBpZD1cIm14X1NlcnZlclBpY2tlckRpYWxvZ1wiIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAge190KFwiV2UgY2FsbCB0aGUgcGxhY2VzIHdoZXJlIHlvdSBjYW4gaG9zdCB5b3VyIGFjY291bnQg4oCYaG9tZXNlcnZlcnPigJkuXCIpfSB7dGV4dH1cbiAgICAgICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgICAgICA8U3R5bGVkUmFkaW9CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cImRlZmF1bHRDaG9zZW5cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnN0YXRlLmRlZmF1bHRDaG9zZW59XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRGVmYXVsdENob3Nlbn1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtkZWZhdWx0U2VydmVyTmFtZX1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZFJhZGlvQnV0dG9uPlxuXG4gICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJkZWZhdWx0Q2hvc2VuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NlcnZlclBpY2tlckRpYWxvZ19vdGhlckhvbWVzZXJ2ZXJSYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9eyF0aGlzLnN0YXRlLmRlZmF1bHRDaG9zZW59XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uT3RoZXJDaG9zZW59XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NlcnZlclBpY2tlckRpYWxvZ19vdGhlckhvbWVzZXJ2ZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiT3RoZXIgaG9tZXNlcnZlclwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uSG9tZXNlcnZlckNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25PdGhlckNob3Nlbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5maWVsZFJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25Ib21lc2VydmVyVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5vdGhlckhvbWVzZXJ2ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZU9uQ2hhbmdlPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlT25Gb2N1cz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRSYWRpb0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAge190KFwiVXNlIHlvdXIgcHJlZmVycmVkIE1hdHJpeCBob21lc2VydmVyIGlmIHlvdSBoYXZlIG9uZSwgb3IgaG9zdCB5b3VyIG93bi5cIil9XG4gICAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfU2VydmVyUGlja2VyRGlhbG9nX2NvbnRpbnVlXCIga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiQ29udGludWVcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuXG4gICAgICAgICAgICAgICAgPGg0PntfdChcIkxlYXJuIG1vcmVcIil9PC9oND5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9tYXRyaXgub3JnL2ZhcS8jd2hhdC1pcy1hLWhvbWVzZXJ2ZXIlM0ZcIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkFib3V0IGhvbWVzZXJ2ZXJzXCIpfVxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9CYXNlRGlhbG9nPjtcbiAgICB9XG59XG4iXX0=