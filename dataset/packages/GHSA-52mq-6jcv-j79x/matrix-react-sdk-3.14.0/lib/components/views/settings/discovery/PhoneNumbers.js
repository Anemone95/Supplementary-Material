"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PhoneNumber = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../index"));

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _AddThreepid = _interopRequireDefault(require("../../../../AddThreepid"));

/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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

/*
TODO: Improve the UX for everything in here.
This is a copy/paste of EmailAddresses, mostly.
 */
// TODO: Combine EmailAddresses and PhoneNumbers to be 3pid agnostic
class PhoneNumber extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onRevokeClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: false,
        label: "revoke",
        errorTitle: (0, _languageHandler._t)("Unable to revoke sharing for phone number")
      });
    });
    (0, _defineProperty2.default)(this, "onShareClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: true,
        label: "share",
        errorTitle: (0, _languageHandler._t)("Unable to share phone number")
      });
    });
    (0, _defineProperty2.default)(this, "onVerificationCodeChange", e => {
      this.setState({
        verificationCode: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onContinueClick", async e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        continueDisabled: true
      });
      const token = this.state.verificationCode;

      try {
        await this.state.addTask.haveMsisdnToken(token);
        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false,
          verifyError: null,
          verificationCode: ""
        });
      } catch (err) {
        this.setState({
          continueDisabled: false
        });

        if (err.errcode !== 'M_THREEPID_AUTH_FAILED') {
          const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
          console.error("Unable to verify phone number: " + err);

          _Modal.default.createTrackedDialog('Unable to verify phone number', '', ErrorDialog, {
            title: (0, _languageHandler._t)("Unable to verify phone number."),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        } else {
          this.setState({
            verifyError: (0, _languageHandler._t)("Incorrect verification code")
          });
        }
      }
    });
    const {
      bound
    } = props.msisdn;
    this.state = {
      verifying: false,
      verificationCode: "",
      addTask: null,
      continueDisabled: false,
      bound
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event


  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line camelcase
    const {
      bound
    } = nextProps.msisdn;
    this.setState({
      bound
    });
  }

  async changeBinding({
    bind,
    label,
    errorTitle
  }) {
    if (!(await _MatrixClientPeg.MatrixClientPeg.get().doesServerSupportSeparateAddAndBind())) {
      return this.changeBindingTangledAddBind({
        bind,
        label,
        errorTitle
      });
    }

    const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
    const {
      medium,
      address
    } = this.props.msisdn;

    try {
      if (bind) {
        const task = new _AddThreepid.default();
        this.setState({
          verifying: true,
          continueDisabled: true,
          addTask: task
        }); // XXX: Sydent will accept a number without country code if you add
        // a leading plus sign to a number in E.164 format (which the 3PID
        // address is), but this goes against the spec.
        // See https://github.com/matrix-org/matrix-doc/issues/2222

        await task.bindMsisdn(null, `+${address}`);
        this.setState({
          continueDisabled: false
        });
      } else {
        await _MatrixClientPeg.MatrixClientPeg.get().unbindThreePid(medium, address);
      }

      this.setState({
        bound: bind
      });
    } catch (err) {
      console.error(`Unable to ${label} phone number ${address} ${err}`);
      this.setState({
        verifying: false,
        continueDisabled: false,
        addTask: null
      });

      _Modal.default.createTrackedDialog(`Unable to ${label} phone number`, '', ErrorDialog, {
        title: errorTitle,
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    }
  }

  async changeBindingTangledAddBind({
    bind,
    label,
    errorTitle
  }) {
    const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
    const {
      medium,
      address
    } = this.props.msisdn;
    const task = new _AddThreepid.default();
    this.setState({
      verifying: true,
      continueDisabled: true,
      addTask: task
    });

    try {
      await _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(medium, address); // XXX: Sydent will accept a number without country code if you add
      // a leading plus sign to a number in E.164 format (which the 3PID
      // address is), but this goes against the spec.
      // See https://github.com/matrix-org/matrix-doc/issues/2222

      if (bind) {
        await task.bindMsisdn(null, `+${address}`);
      } else {
        await task.addMsisdn(null, `+${address}`);
      }

      this.setState({
        continueDisabled: false,
        bound: bind
      });
    } catch (err) {
      console.error(`Unable to ${label} phone number ${address} ${err}`);
      this.setState({
        verifying: false,
        continueDisabled: false,
        addTask: null
      });

      _Modal.default.createTrackedDialog(`Unable to ${label} phone number`, '', ErrorDialog, {
        title: errorTitle,
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    }
  }

  render() {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    const Field = sdk.getComponent('elements.Field');
    const {
      address
    } = this.props.msisdn;
    const {
      verifying,
      bound
    } = this.state;
    let status;

    if (verifying) {
      status = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_ExistingPhoneNumber_verification"
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Please enter verification code sent via text."), /*#__PURE__*/_react.default.createElement("br", null), this.state.verifyError), /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this.onContinueClick,
        autoComplete: "off",
        noValidate: true
      }, /*#__PURE__*/_react.default.createElement(Field, {
        type: "text",
        label: (0, _languageHandler._t)("Verification code"),
        autoComplete: "off",
        disabled: this.state.continueDisabled,
        value: this.state.verificationCode,
        onChange: this.onVerificationCodeChange
      })));
    } else if (bound) {
      status = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_ExistingPhoneNumber_confirmBtn",
        kind: "danger_sm",
        onClick: this.onRevokeClick
      }, (0, _languageHandler._t)("Revoke"));
    } else {
      status = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_ExistingPhoneNumber_confirmBtn",
        kind: "primary_sm",
        onClick: this.onShareClick
      }, (0, _languageHandler._t)("Share"));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingPhoneNumber"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingPhoneNumber_address"
    }, "+", address), status);
  }

}

exports.PhoneNumber = PhoneNumber;
(0, _defineProperty2.default)(PhoneNumber, "propTypes", {
  msisdn: _propTypes.default.object.isRequired
});

class PhoneNumbers extends _react.default.Component {
  render() {
    let content;

    if (this.props.msisdns.length > 0) {
      content = this.props.msisdns.map(e => {
        return /*#__PURE__*/_react.default.createElement(PhoneNumber, {
          msisdn: e,
          key: e.address
        });
      });
    } else {
      content = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Discovery options will appear once you have added a phone number above."));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PhoneNumbers"
    }, content);
  }

}

exports.default = PhoneNumbers;
(0, _defineProperty2.default)(PhoneNumbers, "propTypes", {
  msisdns: _propTypes.default.array.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2Rpc2NvdmVyeS9QaG9uZU51bWJlcnMuanMiXSwibmFtZXMiOlsiUGhvbmVOdW1iZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJjaGFuZ2VCaW5kaW5nIiwiYmluZCIsImxhYmVsIiwiZXJyb3JUaXRsZSIsInNldFN0YXRlIiwidmVyaWZpY2F0aW9uQ29kZSIsInRhcmdldCIsInZhbHVlIiwiY29udGludWVEaXNhYmxlZCIsInRva2VuIiwic3RhdGUiLCJhZGRUYXNrIiwiaGF2ZU1zaXNkblRva2VuIiwidmVyaWZ5aW5nIiwidmVyaWZ5RXJyb3IiLCJlcnIiLCJlcnJjb2RlIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsImJvdW5kIiwibXNpc2RuIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCIsImNoYW5nZUJpbmRpbmdUYW5nbGVkQWRkQmluZCIsIm1lZGl1bSIsImFkZHJlc3MiLCJ0YXNrIiwiQWRkVGhyZWVwaWQiLCJiaW5kTXNpc2RuIiwidW5iaW5kVGhyZWVQaWQiLCJkZWxldGVUaHJlZVBpZCIsImFkZE1zaXNkbiIsInJlbmRlciIsIkFjY2Vzc2libGVCdXR0b24iLCJGaWVsZCIsInN0YXR1cyIsIm9uQ29udGludWVDbGljayIsIm9uVmVyaWZpY2F0aW9uQ29kZUNoYW5nZSIsIm9uUmV2b2tlQ2xpY2siLCJvblNoYXJlQ2xpY2siLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiUGhvbmVOdW1iZXJzIiwiY29udGVudCIsIm1zaXNkbnMiLCJsZW5ndGgiLCJtYXAiLCJhcnJheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVPLE1BQU1BLFdBQU4sU0FBMEJDLGVBQU1DLFNBQWhDLENBQTBDO0FBSzdDQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSx5REFzR0ZDLENBQUQsSUFBTztBQUNuQkEsTUFBQUEsQ0FBQyxDQUFDQyxlQUFGO0FBQ0FELE1BQUFBLENBQUMsQ0FBQ0UsY0FBRjtBQUNBLFdBQUtDLGFBQUwsQ0FBbUI7QUFDZkMsUUFBQUEsSUFBSSxFQUFFLEtBRFM7QUFFZkMsUUFBQUEsS0FBSyxFQUFFLFFBRlE7QUFHZkMsUUFBQUEsVUFBVSxFQUFFLHlCQUFHLDJDQUFIO0FBSEcsT0FBbkI7QUFLSCxLQTlHa0I7QUFBQSx3REFnSEhOLENBQUQsSUFBTztBQUNsQkEsTUFBQUEsQ0FBQyxDQUFDQyxlQUFGO0FBQ0FELE1BQUFBLENBQUMsQ0FBQ0UsY0FBRjtBQUNBLFdBQUtDLGFBQUwsQ0FBbUI7QUFDZkMsUUFBQUEsSUFBSSxFQUFFLElBRFM7QUFFZkMsUUFBQUEsS0FBSyxFQUFFLE9BRlE7QUFHZkMsUUFBQUEsVUFBVSxFQUFFLHlCQUFHLDhCQUFIO0FBSEcsT0FBbkI7QUFLSCxLQXhIa0I7QUFBQSxvRUEwSFNOLENBQUQsSUFBTztBQUM5QixXQUFLTyxRQUFMLENBQWM7QUFDVkMsUUFBQUEsZ0JBQWdCLEVBQUVSLENBQUMsQ0FBQ1MsTUFBRixDQUFTQztBQURqQixPQUFkO0FBR0gsS0E5SGtCO0FBQUEsMkRBZ0lE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QSxHQUFHLEVBQUVBLENBQUMsQ0FBQ3VDO0FBQS9CLFVBQVA7QUFDSCxPQUZTLENBQVY7QUFHSCxLQUpELE1BSU87QUFDSG1CLE1BQUFBLE9BQU8sZ0JBQUc7QUFBTSxRQUFBLFNBQVMsRUFBQztBQUFoQixTQUNMLHlCQUFHLHlFQUFILENBREssQ0FBVjtBQUdIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLQSxPQURMLENBREo7QUFLSDs7QUF0QnFEOzs7OEJBQXJDRCxZLGVBQ0U7QUFDZkUsRUFBQUEsT0FBTyxFQUFFTCxtQkFBVVEsS0FBVixDQUFnQk47QUFEVixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBBZGRUaHJlZXBpZCBmcm9tICcuLi8uLi8uLi8uLi9BZGRUaHJlZXBpZCc7XG5cbi8qXG5UT0RPOiBJbXByb3ZlIHRoZSBVWCBmb3IgZXZlcnl0aGluZyBpbiBoZXJlLlxuVGhpcyBpcyBhIGNvcHkvcGFzdGUgb2YgRW1haWxBZGRyZXNzZXMsIG1vc3RseS5cbiAqL1xuXG4vLyBUT0RPOiBDb21iaW5lIEVtYWlsQWRkcmVzc2VzIGFuZCBQaG9uZU51bWJlcnMgdG8gYmUgM3BpZCBhZ25vc3RpY1xuXG5leHBvcnQgY2xhc3MgUGhvbmVOdW1iZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1zaXNkbjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgeyBib3VuZCB9ID0gcHJvcHMubXNpc2RuO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgdmVyaWZpY2F0aW9uQ29kZTogXCJcIixcbiAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGJvdW5kLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGNvbnN0IHsgYm91bmQgfSA9IG5leHRQcm9wcy5tc2lzZG47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBib3VuZCB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBjaGFuZ2VCaW5kaW5nKHsgYmluZCwgbGFiZWwsIGVycm9yVGl0bGUgfSkge1xuICAgICAgICBpZiAoIWF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IHsgbWVkaXVtLCBhZGRyZXNzIH0gPSB0aGlzLnByb3BzLm1zaXNkbjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGJpbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmeWluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgYWRkVGFzazogdGFzayxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBYWFg6IFN5ZGVudCB3aWxsIGFjY2VwdCBhIG51bWJlciB3aXRob3V0IGNvdW50cnkgY29kZSBpZiB5b3UgYWRkXG4gICAgICAgICAgICAgICAgLy8gYSBsZWFkaW5nIHBsdXMgc2lnbiB0byBhIG51bWJlciBpbiBFLjE2NCBmb3JtYXQgKHdoaWNoIHRoZSAzUElEXG4gICAgICAgICAgICAgICAgLy8gYWRkcmVzcyBpcyksIGJ1dCB0aGlzIGdvZXMgYWdhaW5zdCB0aGUgc3BlYy5cbiAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LWRvYy9pc3N1ZXMvMjIyMlxuICAgICAgICAgICAgICAgIGF3YWl0IHRhc2suYmluZE1zaXNkbihudWxsLCBgKyR7YWRkcmVzc31gKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS51bmJpbmRUaHJlZVBpZChtZWRpdW0sIGFkZHJlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJvdW5kOiBiaW5kIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byAke2xhYmVsfSBwaG9uZSBudW1iZXIgJHthZGRyZXNzfSAke2Vycn1gKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhgVW5hYmxlIHRvICR7bGFiZWx9IHBob25lIG51bWJlcmAsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBlcnJvclRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGNoYW5nZUJpbmRpbmdUYW5nbGVkQWRkQmluZCh7IGJpbmQsIGxhYmVsLCBlcnJvclRpdGxlIH0pIHtcbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3QgeyBtZWRpdW0sIGFkZHJlc3MgfSA9IHRoaXMucHJvcHMubXNpc2RuO1xuXG4gICAgICAgIGNvbnN0IHRhc2sgPSBuZXcgQWRkVGhyZWVwaWQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2ZXJpZnlpbmc6IHRydWUsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiB0cnVlLFxuICAgICAgICAgICAgYWRkVGFzazogdGFzayxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWxldGVUaHJlZVBpZChtZWRpdW0sIGFkZHJlc3MpO1xuICAgICAgICAgICAgLy8gWFhYOiBTeWRlbnQgd2lsbCBhY2NlcHQgYSBudW1iZXIgd2l0aG91dCBjb3VudHJ5IGNvZGUgaWYgeW91IGFkZFxuICAgICAgICAgICAgLy8gYSBsZWFkaW5nIHBsdXMgc2lnbiB0byBhIG51bWJlciBpbiBFLjE2NCBmb3JtYXQgKHdoaWNoIHRoZSAzUElEXG4gICAgICAgICAgICAvLyBhZGRyZXNzIGlzKSwgYnV0IHRoaXMgZ29lcyBhZ2FpbnN0IHRoZSBzcGVjLlxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzIyMjJcbiAgICAgICAgICAgIGlmIChiaW5kKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGFzay5iaW5kTXNpc2RuKG51bGwsIGArJHthZGRyZXNzfWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXNrLmFkZE1zaXNkbihudWxsLCBgKyR7YWRkcmVzc31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvdW5kOiBiaW5kLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVW5hYmxlIHRvICR7bGFiZWx9IHBob25lIG51bWJlciAke2FkZHJlc3N9ICR7ZXJyfWApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKGBVbmFibGUgdG8gJHtsYWJlbH0gcGhvbmUgbnVtYmVyYCwgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGVycm9yVGl0bGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXZva2VDbGljayA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VCaW5kaW5nKHtcbiAgICAgICAgICAgIGJpbmQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IFwicmV2b2tlXCIsXG4gICAgICAgICAgICBlcnJvclRpdGxlOiBfdChcIlVuYWJsZSB0byByZXZva2Ugc2hhcmluZyBmb3IgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblNoYXJlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2hhbmdlQmluZGluZyh7XG4gICAgICAgICAgICBiaW5kOiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IFwic2hhcmVcIixcbiAgICAgICAgICAgIGVycm9yVGl0bGU6IF90KFwiVW5hYmxlIHRvIHNoYXJlIHBob25lIG51bWJlclwiKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25WZXJpZmljYXRpb25Db2RlQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2ZXJpZmljYXRpb25Db2RlOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Db250aW51ZUNsaWNrID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRoaXMuc3RhdGUudmVyaWZpY2F0aW9uQ29kZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RhdGUuYWRkVGFzay5oYXZlTXNpc2RuVG9rZW4odG9rZW4pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcmlmeUVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvbkNvZGU6IFwiXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGludWVEaXNhYmxlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgIT09ICdNX1RIUkVFUElEX0FVVEhfRkFJTEVEJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVuYWJsZSB0byB2ZXJpZnkgcGhvbmUgbnVtYmVyOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXInLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXIuXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlFcnJvcjogX3QoXCJJbmNvcnJlY3QgdmVyaWZpY2F0aW9uIGNvZGVcIil9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5GaWVsZCcpO1xuICAgICAgICBjb25zdCB7IGFkZHJlc3MgfSA9IHRoaXMucHJvcHMubXNpc2RuO1xuICAgICAgICBjb25zdCB7IHZlcmlmeWluZywgYm91bmQgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IHN0YXR1cztcbiAgICAgICAgaWYgKHZlcmlmeWluZykge1xuICAgICAgICAgICAgc3RhdHVzID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl92ZXJpZmljYXRpb25cIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiUGxlYXNlIGVudGVyIHZlcmlmaWNhdGlvbiBjb2RlIHNlbnQgdmlhIHRleHQuXCIpfVxuICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUudmVyaWZ5RXJyb3J9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uQ29udGludWVDbGlja30gYXV0b0NvbXBsZXRlPVwib2ZmXCIgbm9WYWxpZGF0ZT17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVmVyaWZpY2F0aW9uIGNvZGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuY29udGludWVEaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZlcmlmaWNhdGlvbkNvZGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblZlcmlmaWNhdGlvbkNvZGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfSBlbHNlIGlmIChib3VuZCkge1xuICAgICAgICAgICAgc3RhdHVzID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZXZva2VDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7X3QoXCJSZXZva2VcIil9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hhcmVDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7X3QoXCJTaGFyZVwiKX1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9hZGRyZXNzXCI+K3thZGRyZXNzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQaG9uZU51bWJlcnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1zaXNkbnM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1zaXNkbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29udGVudCA9IHRoaXMucHJvcHMubXNpc2Rucy5tYXAoKGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPFBob25lTnVtYmVyIG1zaXNkbj17ZX0ga2V5PXtlLmFkZHJlc3N9IC8+O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICB7X3QoXCJEaXNjb3Zlcnkgb3B0aW9ucyB3aWxsIGFwcGVhciBvbmNlIHlvdSBoYXZlIGFkZGVkIGEgcGhvbmUgbnVtYmVyIGFib3ZlLlwiKX1cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaG9uZU51bWJlcnNcIj5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==