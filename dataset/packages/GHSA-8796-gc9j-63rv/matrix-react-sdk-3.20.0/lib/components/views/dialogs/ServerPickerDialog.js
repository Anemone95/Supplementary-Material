"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let ServerPickerDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.ServerPickerDialog"), _dec(_class = (_temp = class ServerPickerDialog extends _react.default.PureComponent
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

          if (stateForError.serverErrorIsFatal) {
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

    let defaultServerName
    /*: React.ReactNode*/
    = this.defaultServer.hsName;

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

}, _temp)) || _class);
exports.default = ServerPickerDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2VydmVyUGlja2VyRGlhbG9nLnRzeCJdLCJuYW1lcyI6WyJTZXJ2ZXJQaWNrZXJEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2V0U3RhdGUiLCJkZWZhdWx0Q2hvc2VuIiwiZXYiLCJvdGhlckhvbWVzZXJ2ZXIiLCJ0YXJnZXQiLCJ2YWx1ZSIsImRlcml2ZURhdGEiLCJoc1VybCIsInRyaW0iLCJpbmNsdWRlcyIsImRpc2NvdmVyeVJlc3VsdCIsIkF1dG9EaXNjb3ZlcnkiLCJmaW5kQ2xpZW50Q29uZmlnIiwidmFsaWRhdGVkQ29uZiIsIkF1dG9EaXNjb3ZlcnlVdGlscyIsImJ1aWxkVmFsaWRhdGVkQ29uZmlnRnJvbURpc2NvdmVyeSIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJ2YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzIiwic3RhdGVGb3JFcnJvciIsImF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yIiwic2VydmVyRXJyb3JJc0ZhdGFsIiwidHJhbnNsYXRlZE1lc3NhZ2UiLCJydWxlcyIsImtleSIsInRlc3QiLCJhbGxvd0VtcHR5IiwiaW52YWxpZCIsImZpZWxkU3RhdGUiLCJ2YWxpZGF0ZSIsInByZXZlbnREZWZhdWx0IiwidmFsaWQiLCJmaWVsZFJlZiIsImN1cnJlbnQiLCJzdGF0ZSIsImZvY3VzIiwiZm9jdXNlZCIsIm9uRmluaXNoZWQiLCJkZWZhdWx0U2VydmVyIiwiY29uZmlnIiwiU2RrQ29uZmlnIiwiZ2V0Iiwic2VydmVyQ29uZmlnIiwiaXNEZWZhdWx0IiwiaXNOYW1lUmVzb2x2YWJsZSIsImhzTmFtZSIsInJlbmRlciIsInRleHQiLCJkZWZhdWx0U2VydmVyTmFtZSIsImhzTmFtZUlzRGlmZmVyZW50IiwidGl0bGUiLCJvblN1Ym1pdCIsIm9uRGVmYXVsdENob3NlbiIsIm9uT3RoZXJDaG9z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SUFBSSxFQUFDLE1BRFQ7QUFFSSxNQUFBLFNBQVMsRUFBQyx1Q0FGZDtBQUdJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGtCQUFILENBSFg7QUFJSSxNQUFBLFFBQVEsRUFBRSxLQUFLQyxrQkFKbkI7QUFLSSxNQUFBLE9BQU8sRUFBRSxLQUFLRCxhQUxsQjtBQU1JLE1BQUEsR0FBRyxFQUFFLEtBQUtyQixRQU5kO0FBT0ksTUFBQSxVQUFVLEVBQUUsS0FBS3VCLG9CQVByQjtBQVFJLE1BQUEsS0FBSyxFQUFFLEtBQUtyQixLQUFMLENBQVdoQyxlQVJ0QjtBQVNJLE1BQUEsZ0JBQWdCLEVBQUUsS0FUdEI7QUFVSSxNQUFBLGVBQWUsRUFBRTtBQVZyQixNQVBKLENBZEosZUFrQ0ksd0NBQ0sseUJBQUcseUVBQUgsQ0FETCxDQWxDSixlQXNDSSw2QkFBQyx5QkFBRDtBQUFrQixNQUFBLFNBQVMsRUFBQyxnQ0FBNUI7QUFBNkQsTUFBQSxJQUFJLEVBQUMsU0FBbEU7QUFBNEUsTUFBQSxPQUFPLEVBQUUsS0FBS2lEO0FBQTFGLE9BQ0sseUJBQUcsVUFBSCxDQURMLENBdENKLGVBMENJLHlDQUFLLHlCQUFHLFlBQUgsQ0FBTCxDQTFDSixlQTJDSTtBQUFHLE1BQUEsSUFBSSxFQUFDLGlEQUFSO0FBQTBELE1BQUEsTUFBTSxFQUFDLFFBQWpFO0FBQTBFLE1BQUEsR0FBRyxFQUFDO0FBQTlFLE9BQ0sseUJBQUcsbUJBQUgsQ0FETCxDQTNDSixDQVJHLENBQVA7QUF3REg7O0FBak0rRSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtBdXRvRGlzY292ZXJ5fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvYXV0b2Rpc2NvdmVyeVwiO1xuXG5pbXBvcnQgQXV0b0Rpc2NvdmVyeVV0aWxzLCB7VmFsaWRhdGVkU2VydmVyQ29uZmlnfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tICcuL0Jhc2VEaWFsb2cnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IFN0eWxlZFJhZGlvQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRSYWRpb0J1dHRvblwiO1xuaW1wb3J0IFRleHRXaXRoVG9vbHRpcCBmcm9tIFwiLi4vZWxlbWVudHMvVGV4dFdpdGhUb29sdGlwXCI7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24sIHtJRmllbGRTdGF0ZX0gZnJvbSBcIi4uL2VsZW1lbnRzL1ZhbGlkYXRpb25cIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICB0aXRsZT86IHN0cmluZztcbiAgICBzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICBvbkZpbmlzaGVkKGNvbmZpZz86IFZhbGlkYXRlZFNlcnZlckNvbmZpZyk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGRlZmF1bHRDaG9zZW46IGJvb2xlYW47XG4gICAgb3RoZXJIb21lc2VydmVyOiBzdHJpbmc7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuU2VydmVyUGlja2VyRGlhbG9nXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXJQaWNrZXJEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBkZWZhdWx0U2VydmVyOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBmaWVsZFJlZiA9IGNyZWF0ZVJlZjxGaWVsZD4oKTtcbiAgICBwcml2YXRlIHZhbGlkYXRlZENvbmY6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSBTZGtDb25maWcuZ2V0KCk7XG4gICAgICAgIHRoaXMuZGVmYXVsdFNlcnZlciA9IGNvbmZpZ1tcInZhbGlkYXRlZF9zZXJ2ZXJfY29uZmlnXCJdIGFzIFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICAgICAgY29uc3QgeyBzZXJ2ZXJDb25maWcgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgbGV0IG90aGVySG9tZXNlcnZlciA9IFwiXCI7XG4gICAgICAgIGlmICghc2VydmVyQ29uZmlnLmlzRGVmYXVsdCkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckNvbmZpZy5pc05hbWVSZXNvbHZhYmxlICYmIHNlcnZlckNvbmZpZy5oc05hbWUpIHtcbiAgICAgICAgICAgICAgICBvdGhlckhvbWVzZXJ2ZXIgPSBzZXJ2ZXJDb25maWcuaHNOYW1lO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdGhlckhvbWVzZXJ2ZXIgPSBzZXJ2ZXJDb25maWcuaHNVcmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGVmYXVsdENob3Nlbjogc2VydmVyQ29uZmlnLmlzRGVmYXVsdCxcbiAgICAgICAgICAgIG90aGVySG9tZXNlcnZlcixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGVmYXVsdENob3NlbiA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlZmF1bHRDaG9zZW46IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25PdGhlckNob3NlbiA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRlZmF1bHRDaG9zZW46IGZhbHNlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSG9tZXNlcnZlckNoYW5nZSA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgb3RoZXJIb21lc2VydmVyOiBldi50YXJnZXQudmFsdWUgfSk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IERvIHdlIHdhbnQgdG8gc3VwcG9ydCAud2VsbC1rbm93biBsb29rdXBzIGhlcmU/XG4gICAgLy8gSWYgZm9yIHNvbWUgcmVhc29uIHNvbWVvbmUgZW50ZXJzIFwibWF0cml4Lm9yZ1wiIGZvciBhIFVSTCwgd2UgY291bGQgZG8gYSBsb29rdXAgdG9cbiAgICAvLyBmaW5kIHRoZWlyIGhvbWVzZXJ2ZXIgd2l0aG91dCBkZW1hbmRpbmcgdGhleSB1c2UgXCJodHRwczovL21hdHJpeC5vcmdcIlxuICAgIHByaXZhdGUgdmFsaWRhdGUgPSB3aXRoVmFsaWRhdGlvbjx0aGlzLCB7IGVycm9yPzogc3RyaW5nIH0+KHtcbiAgICAgICAgZGVyaXZlRGF0YTogYXN5bmMgKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgICAgICAgbGV0IGhzVXJsID0gdmFsdWUudHJpbSgpOyAvLyB0cmltIHRvIGFjY291bnQgZm9yIHJhbmRvbSB3aGl0ZXNwYWNlXG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSBVUkwgaGFzIG5vIHByb3RvY29sLCB0cnkgdmFsaWRhdGUgaXQgYXMgYSBzZXJ2ZXJOYW1lIHZpYSB3ZWxsLWtub3duXG4gICAgICAgICAgICBpZiAoIWhzVXJsLmluY2x1ZGVzKFwiOi8vXCIpKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UmVzdWx0ID0gYXdhaXQgQXV0b0Rpc2NvdmVyeS5maW5kQ2xpZW50Q29uZmlnKGhzVXJsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZWRDb25mID0gQXV0b0Rpc2NvdmVyeVV0aWxzLmJ1aWxkVmFsaWRhdGVkQ29uZmlnRnJvbURpc2NvdmVyeShoc1VybCwgZGlzY292ZXJ5UmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt9OyAvLyB3ZSBoYXZlIGEgdmFsaWRhdGVkIGNvbmZpZywgd2UgZG9uJ3QgbmVlZCB0byB0cnkgdGhlIG90aGVyIHBhdGhzXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBdHRlbXB0ZWQgJHtoc1VybH0gYXMgYSBzZXJ2ZXJfbmFtZSBidXQgaXQgZmFpbGVkYCwgZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiB3ZSBnb3QgdG8gdGhpcyBzdGFnZSB0aGVuIGVpdGhlciB0aGUgd2VsbC1rbm93biBmYWlsZWQgb3IgdGhlIFVSTCBoYWQgYSBwcm90b2NvbCBzcGVjaWZpZWQsXG4gICAgICAgICAgICAvLyBzbyB2YWxpZGF0ZSBzdGF0aWNhbGx5IG9ubHkuIElmIHRoZSBVUkwgaGFzIG5vIHByb3RvY29sLCBkZWZhdWx0IHRvIGh0dHBzLlxuICAgICAgICAgICAgaWYgKCFoc1VybC5pbmNsdWRlcyhcIjovL1wiKSkge1xuICAgICAgICAgICAgICAgIGhzVXJsID0gXCJodHRwczovL1wiICsgaHNVcmw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0ZWRDb25mID0gYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMoaHNVcmwpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVGb3JFcnJvciA9IEF1dG9EaXNjb3ZlcnlVdGlscy5hdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvcihlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVGb3JFcnJvci5zZXJ2ZXJFcnJvcklzRmF0YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVycm9yID0gX3QoXCJVbmFibGUgdG8gdmFsaWRhdGUgaG9tZXNlcnZlclwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudHJhbnNsYXRlZE1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yID0gZS50cmFuc2xhdGVkTWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBlcnJvciB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHRyeSB0byBjYXJyeSBvbiBhbnl3YXlcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlZENvbmYgPSBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyhoc1VybCwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBfdChcIkludmFsaWQgVVJMXCIpIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlNwZWNpZnkgYSBob21lc2VydmVyXCIpLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jIGZ1bmN0aW9uKHsgdmFsdWUgfSwgeyBlcnJvciB9KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWVycm9yO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogZnVuY3Rpb24oeyBlcnJvciB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25Ib21lc2VydmVyVmFsaWRhdGUgPSAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpID0+IHRoaXMudmFsaWRhdGUoZmllbGRTdGF0ZSk7XG5cbiAgICBwcml2YXRlIG9uU3VibWl0ID0gYXN5bmMgKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgdmFsaWQgPSBhd2FpdCB0aGlzLmZpZWxkUmVmLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcblxuICAgICAgICBpZiAoIXZhbGlkICYmICF0aGlzLnN0YXRlLmRlZmF1bHRDaG9zZW4pIHtcbiAgICAgICAgICAgIHRoaXMuZmllbGRSZWYuY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5maWVsZFJlZi5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodGhpcy5zdGF0ZS5kZWZhdWx0Q2hvc2VuID8gdGhpcy5kZWZhdWx0U2VydmVyIDogdGhpcy52YWxpZGF0ZWRDb25mKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHRleHQ7XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRTZXJ2ZXIuaHNOYW1lID09PSBcIm1hdHJpeC5vcmdcIikge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiTWF0cml4Lm9yZyBpcyB0aGUgYmlnZ2VzdCBwdWJsaWMgaG9tZXNlcnZlciBpbiB0aGUgd29ybGQsIHNvIGl04oCZcyBhIGdvb2QgcGxhY2UgZm9yIG1hbnkuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRlZmF1bHRTZXJ2ZXJOYW1lOiBSZWFjdC5SZWFjdE5vZGUgPSB0aGlzLmRlZmF1bHRTZXJ2ZXIuaHNOYW1lO1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0U2VydmVyLmhzTmFtZUlzRGlmZmVyZW50KSB7XG4gICAgICAgICAgICBkZWZhdWx0U2VydmVyTmFtZSA9IChcbiAgICAgICAgICAgICAgICA8VGV4dFdpdGhUb29sdGlwIGNsYXNzPVwibXhfTG9naW5fdW5kZXJsaW5lZFNlcnZlck5hbWVcIiB0b29sdGlwPXt0aGlzLmRlZmF1bHRTZXJ2ZXIuaHNVcmx9PlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5kZWZhdWx0U2VydmVyLmhzTmFtZX1cbiAgICAgICAgICAgICAgICA8L1RleHRXaXRoVG9vbHRpcD5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPEJhc2VEaWFsb2dcbiAgICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLnRpdGxlIHx8IF90KFwiU2lnbiBpbnRvIHlvdXIgaG9tZXNlcnZlclwiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NlcnZlclBpY2tlckRpYWxvZ1wiXG4gICAgICAgICAgICBjb250ZW50SWQ9XCJteF9TZXJ2ZXJQaWNrZXJEaWFsb2dcIlxuICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgZml4ZWRXaWR0aD17ZmFsc2V9XG4gICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCIgaWQ9XCJteF9TZXJ2ZXJQaWNrZXJEaWFsb2dcIiBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIldlIGNhbGwgdGhlIHBsYWNlcyB3aGVyZSB5b3UgY2FuIGhvc3QgeW91ciBhY2NvdW50IOKAmGhvbWVzZXJ2ZXJz4oCZLlwiKX0ge3RleHR9XG4gICAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJkZWZhdWx0Q2hvc2VuXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5kZWZhdWx0Q2hvc2VufVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkRlZmF1bHRDaG9zZW59XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7ZGVmYXVsdFNlcnZlck5hbWV9XG4gICAgICAgICAgICAgICAgPC9TdHlsZWRSYWRpb0J1dHRvbj5cblxuICAgICAgICAgICAgICAgIDxTdHlsZWRSYWRpb0J1dHRvblxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwiZGVmYXVsdENob3NlblwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TZXJ2ZXJQaWNrZXJEaWFsb2dfb3RoZXJIb21lc2VydmVyUmFkaW9cIlxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXshdGhpcy5zdGF0ZS5kZWZhdWx0Q2hvc2VufVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbk90aGVyQ2hvc2VufVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TZXJ2ZXJQaWNrZXJEaWFsb2dfb3RoZXJIb21lc2VydmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk90aGVyIGhvbWVzZXJ2ZXJcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkhvbWVzZXJ2ZXJDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uT3RoZXJDaG9zZW59XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuZmllbGRSZWZ9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uSG9tZXNlcnZlclZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUub3RoZXJIb21lc2VydmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGVPbkNoYW5nZT17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZU9uRm9jdXM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlVzZSB5b3VyIHByZWZlcnJlZCBNYXRyaXggaG9tZXNlcnZlciBpZiB5b3UgaGF2ZSBvbmUsIG9yIGhvc3QgeW91ciBvd24uXCIpfVxuICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1NlcnZlclBpY2tlckRpYWxvZ19jb250aW51ZVwiIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cblxuICAgICAgICAgICAgICAgIDxoND57X3QoXCJMZWFybiBtb3JlXCIpfTwvaDQ+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vbWF0cml4Lm9yZy9mYXEvI3doYXQtaXMtYS1ob21lc2VydmVyJTNGXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJBYm91dCBob21lc2VydmVyc1wiKX1cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDwvQmFzZURpYWxvZz47XG4gICAgfVxufVxuIl19