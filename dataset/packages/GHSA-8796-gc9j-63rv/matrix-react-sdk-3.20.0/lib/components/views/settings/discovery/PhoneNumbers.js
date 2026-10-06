"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

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
let PhoneNumbers = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.discovery.PhoneNumbers"), _dec(_class = (_temp = _class2 = class PhoneNumbers extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  msisdns: _propTypes.default.array.isRequired
}), _temp)) || _class);
exports.default = PhoneNumbers;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2Rpc2NvdmVyeS9QaG9uZU51bWJlcnMuanMiXSwibmFtZXMiOlsiUGhvbmVOdW1iZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJjaGFuZ2VCaW5kaW5nIiwiYmluZCIsImxhYmVsIiwiZXJyb3JUaXRsZSIsInNldFN0YXRlIiwidmVyaWZpY2F0aW9uQ29kZSIsInRhcmdldCIsInZhbHVlIiwiY29udGludWVEaXNhYmxlZCIsInRva2VuIiwic3RhdGUiLCJhZGRUYXNrIiwiaGF2ZU1zaXNkblRva2VuIiwidmVyaWZ5aW5nIiwidmVyaWZ5RXJyb3IiLCJlcnIiLCJlcnJjb2RlIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsImJvdW5kIiwibXNpc2RuIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCIsImNoYW5nZUJpbmRpbmdUYW5nbGVkQWRkQmluZCIsIm1lZGl1bSIsImFkZHJlc3MiLCJ0YXNrIiwiQWRkVGhyZWVwaWQiLCJiaW5kTXNpc2RuIiwidW5iaW5kVGhyZWVQaWQiLCJkZWxldGVUaHJlZVBpZCIsImFkZE1zaXNkbiIsInJlbmRlciIsIkFjY2Vzc2libGVCdXR0b24iLCJGaWVsZCIsInN0YXR1cyIsIm9uQ29udGludWVDbGljayIsIm9uVmVyaWZpY2F0aW9uQ29kZUNoYW5nZSIsIm9uUmV2b2tlQ2xpY2siLCJvblNoYXJlQ2xpY2siLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiUGhvbmVOdW1iZXJzIiwiY29udGVudCIsIm1zaXNkbnMiLCJsZW5ndGgiLCJtYXAiLCJhcnJheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFTyxNQUFNQSxXQUFOLFNBQTBCQyxlQUFNQyxTQUFoQyxDQUEwQztBQUs3Q0MsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUseURBc0dGQyxDQUFELElBQU87QUFDbkJBLE1BQUFBLENBQUMsQ0FBQ0MsZUFBRjtBQUNBRCxNQUFBQSxDQUFDLENBQUNFLGNBQUY7QUFDQSxXQUFLQyxhQUFMLENBQW1CO0FBQ2ZDLFFBQUFBLElBQUksRUFBRSxLQURTO0FBRWZDLFFBQUFBLEtBQUssRUFBRSxRQUZRO0FBR2ZDLFFBQUFBLFVBQVUsRUFBRSx5QkFBRywyQ0FBSDtBQUhHLE9BQW5CO0FBS0gsS0E5R2tCO0FBQUEsd0RBZ0hITixDQUFELElBQU87QUFDbEJBLE1BQUFBLENBQUMsQ0FBQ0MsZUFBRjtBQUNBRCxNQUFBQSxDQUFDLENBQUNFLGNBQUY7QUFDQSxXQUFLQyxhQUFMLENBQW1CO0FBQ2ZDLFFBQUFBLElBQUksRUFBRSxJQURTO0FBRWZDLFFBQUFBLEtBQUssRUFBRSxPQUZRO0FBR2ZDLFFBQUFBLFVBQVUsRUFBRSx5QkFBRyw4QkFBSDtBQUhHLE9BQW5CO0FBS0gsS0F4SGtCO0FBQUEsb0VBMEhTTixDQUFELElBQU87QUFDOUIsV0FBS08sUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLGdCQUFnQixFQUFFUixDQUFDLENBQUNTLE1BQUYsQ0FBU0M7QUFEakIsT0FBZDtBQUdILEtBOUhrQjtBQUFBLDJEQWdJRCxNQUFPVixDQUFQLElBQWE7QUFDM0JBLE1BQUFBLENBQUMsQ0FBQ0MsZUFBRjtBQUNBRCxNQUFBQSxDQUFDLENBQUNFLGNBQUY7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QUZTLENBQVY7QUFHSCxLQUpELE1BSU87QUFDSG1CLE1BQUFBLE9BQU8sZ0JBQUc7QUFBTSxRQUFBLFNBQVMsRUFBQztBQUFoQixTQUNMLHlCQUFHLHlFQUFILENBREssQ0FBVjtBQUdIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLQSxPQURMLENBREo7QUFLSDs7QUF0QnFELEMsc0RBQ25DO0FBQ2ZDLEVBQUFBLE9BQU8sRUFBRUwsbUJBQVVRLEtBQVYsQ0FBZ0JOO0FBRFYsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgQWRkVGhyZWVwaWQgZnJvbSAnLi4vLi4vLi4vLi4vQWRkVGhyZWVwaWQnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8qXG5UT0RPOiBJbXByb3ZlIHRoZSBVWCBmb3IgZXZlcnl0aGluZyBpbiBoZXJlLlxuVGhpcyBpcyBhIGNvcHkvcGFzdGUgb2YgRW1haWxBZGRyZXNzZXMsIG1vc3RseS5cbiAqL1xuXG4vLyBUT0RPOiBDb21iaW5lIEVtYWlsQWRkcmVzc2VzIGFuZCBQaG9uZU51bWJlcnMgdG8gYmUgM3BpZCBhZ25vc3RpY1xuXG5leHBvcnQgY2xhc3MgUGhvbmVOdW1iZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1zaXNkbjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgeyBib3VuZCB9ID0gcHJvcHMubXNpc2RuO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgdmVyaWZpY2F0aW9uQ29kZTogXCJcIixcbiAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGJvdW5kLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGNvbnN0IHsgYm91bmQgfSA9IG5leHRQcm9wcy5tc2lzZG47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBib3VuZCB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBjaGFuZ2VCaW5kaW5nKHsgYmluZCwgbGFiZWwsIGVycm9yVGl0bGUgfSkge1xuICAgICAgICBpZiAoIWF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IHsgbWVkaXVtLCBhZGRyZXNzIH0gPSB0aGlzLnByb3BzLm1zaXNkbjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGJpbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmeWluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgYWRkVGFzazogdGFzayxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBYWFg6IFN5ZGVudCB3aWxsIGFjY2VwdCBhIG51bWJlciB3aXRob3V0IGNvdW50cnkgY29kZSBpZiB5b3UgYWRkXG4gICAgICAgICAgICAgICAgLy8gYSBsZWFkaW5nIHBsdXMgc2lnbiB0byBhIG51bWJlciBpbiBFLjE2NCBmb3JtYXQgKHdoaWNoIHRoZSAzUElEXG4gICAgICAgICAgICAgICAgLy8gYWRkcmVzcyBpcyksIGJ1dCB0aGlzIGdvZXMgYWdhaW5zdCB0aGUgc3BlYy5cbiAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LWRvYy9pc3N1ZXMvMjIyMlxuICAgICAgICAgICAgICAgIGF3YWl0IHRhc2suYmluZE1zaXNkbihudWxsLCBgKyR7YWRkcmVzc31gKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS51bmJpbmRUaHJlZVBpZChtZWRpdW0sIGFkZHJlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJvdW5kOiBiaW5kIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byAke2xhYmVsfSBwaG9uZSBudW1iZXIgJHthZGRyZXNzfSAke2Vycn1gKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhgVW5hYmxlIHRvICR7bGFiZWx9IHBob25lIG51bWJlcmAsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBlcnJvclRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGNoYW5nZUJpbmRpbmdUYW5nbGVkQWRkQmluZCh7IGJpbmQsIGxhYmVsLCBlcnJvclRpdGxlIH0pIHtcbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3QgeyBtZWRpdW0sIGFkZHJlc3MgfSA9IHRoaXMucHJvcHMubXNpc2RuO1xuXG4gICAgICAgIGNvbnN0IHRhc2sgPSBuZXcgQWRkVGhyZWVwaWQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2ZXJpZnlpbmc6IHRydWUsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiB0cnVlLFxuICAgICAgICAgICAgYWRkVGFzazogdGFzayxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWxldGVUaHJlZVBpZChtZWRpdW0sIGFkZHJlc3MpO1xuICAgICAgICAgICAgLy8gWFhYOiBTeWRlbnQgd2lsbCBhY2NlcHQgYSBudW1iZXIgd2l0aG91dCBjb3VudHJ5IGNvZGUgaWYgeW91IGFkZFxuICAgICAgICAgICAgLy8gYSBsZWFkaW5nIHBsdXMgc2lnbiB0byBhIG51bWJlciBpbiBFLjE2NCBmb3JtYXQgKHdoaWNoIHRoZSAzUElEXG4gICAgICAgICAgICAvLyBhZGRyZXNzIGlzKSwgYnV0IHRoaXMgZ29lcyBhZ2FpbnN0IHRoZSBzcGVjLlxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzIyMjJcbiAgICAgICAgICAgIGlmIChiaW5kKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGFzay5iaW5kTXNpc2RuKG51bGwsIGArJHthZGRyZXNzfWApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXNrLmFkZE1zaXNkbihudWxsLCBgKyR7YWRkcmVzc31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvdW5kOiBiaW5kLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVW5hYmxlIHRvICR7bGFiZWx9IHBob25lIG51bWJlciAke2FkZHJlc3N9ICR7ZXJyfWApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKGBVbmFibGUgdG8gJHtsYWJlbH0gcGhvbmUgbnVtYmVyYCwgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGVycm9yVGl0bGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXZva2VDbGljayA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VCaW5kaW5nKHtcbiAgICAgICAgICAgIGJpbmQ6IGZhbHNlLFxuICAgICAgICAgICAgbGFiZWw6IFwicmV2b2tlXCIsXG4gICAgICAgICAgICBlcnJvclRpdGxlOiBfdChcIlVuYWJsZSB0byByZXZva2Ugc2hhcmluZyBmb3IgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblNoYXJlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2hhbmdlQmluZGluZyh7XG4gICAgICAgICAgICBiaW5kOiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IFwic2hhcmVcIixcbiAgICAgICAgICAgIGVycm9yVGl0bGU6IF90KFwiVW5hYmxlIHRvIHNoYXJlIHBob25lIG51bWJlclwiKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25WZXJpZmljYXRpb25Db2RlQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2ZXJpZmljYXRpb25Db2RlOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Db250aW51ZUNsaWNrID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRoaXMuc3RhdGUudmVyaWZpY2F0aW9uQ29kZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RhdGUuYWRkVGFzay5oYXZlTXNpc2RuVG9rZW4odG9rZW4pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcmlmeUVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvbkNvZGU6IFwiXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGludWVEaXNhYmxlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgIT09ICdNX1RIUkVFUElEX0FVVEhfRkFJTEVEJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVuYWJsZSB0byB2ZXJpZnkgcGhvbmUgbnVtYmVyOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXInLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXIuXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlFcnJvcjogX3QoXCJJbmNvcnJlY3QgdmVyaWZpY2F0aW9uIGNvZGVcIil9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5GaWVsZCcpO1xuICAgICAgICBjb25zdCB7IGFkZHJlc3MgfSA9IHRoaXMucHJvcHMubXNpc2RuO1xuICAgICAgICBjb25zdCB7IHZlcmlmeWluZywgYm91bmQgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IHN0YXR1cztcbiAgICAgICAgaWYgKHZlcmlmeWluZykge1xuICAgICAgICAgICAgc3RhdHVzID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl92ZXJpZmljYXRpb25cIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiUGxlYXNlIGVudGVyIHZlcmlmaWNhdGlvbiBjb2RlIHNlbnQgdmlhIHRleHQuXCIpfVxuICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUudmVyaWZ5RXJyb3J9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uQ29udGludWVDbGlja30gYXV0b0NvbXBsZXRlPVwib2ZmXCIgbm9WYWxpZGF0ZT17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVmVyaWZpY2F0aW9uIGNvZGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuY29udGludWVEaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZlcmlmaWNhdGlvbkNvZGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblZlcmlmaWNhdGlvbkNvZGVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfSBlbHNlIGlmIChib3VuZCkge1xuICAgICAgICAgICAgc3RhdHVzID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZXZva2VDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7X3QoXCJSZXZva2VcIil9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hhcmVDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7X3QoXCJTaGFyZVwiKX1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9hZGRyZXNzXCI+K3thZGRyZXNzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5kaXNjb3ZlcnkuUGhvbmVOdW1iZXJzXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQaG9uZU51bWJlcnMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1zaXNkbnM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1zaXNkbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29udGVudCA9IHRoaXMucHJvcHMubXNpc2Rucy5tYXAoKGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPFBob25lTnVtYmVyIG1zaXNkbj17ZX0ga2V5PXtlLmFkZHJlc3N9IC8+O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICB7X3QoXCJEaXNjb3Zlcnkgb3B0aW9ucyB3aWxsIGFwcGVhciBvbmNlIHlvdSBoYXZlIGFkZGVkIGEgcGhvbmUgbnVtYmVyIGFib3ZlLlwiKX1cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaG9uZU51bWJlcnNcIj5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==