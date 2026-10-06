"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ExistingPhoneNumber = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _AddThreepid = _interopRequireDefault(require("../../../../AddThreepid"));

var _CountryDropdown = _interopRequireDefault(require("../../auth/CountryDropdown"));

var sdk = _interopRequireWildcard(require("../../../../index"));

var _Modal = _interopRequireDefault(require("../../../../Modal"));

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
class ExistingPhoneNumber extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: true
      });
    });
    (0, _defineProperty2.default)(this, "_onDontRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: false
      });
    });
    (0, _defineProperty2.default)(this, "_onActuallyRemove", e => {
      e.stopPropagation();
      e.preventDefault();

      _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(this.props.msisdn.medium, this.props.msisdn.address).then(() => {
        return this.props.onRemoved(this.props.msisdn);
      }).catch(err => {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        console.error("Unable to remove contact information: " + err);

        _Modal.default.createTrackedDialog('Remove 3pid failed', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Unable to remove contact information"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      });
    });
    this.state = {
      verifyRemove: false
    };
  }

  render() {
    if (this.state.verifyRemove) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ExistingPhoneNumber"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_ExistingPhoneNumber_promptText"
      }, (0, _languageHandler._t)("Remove %(phone)s?", {
        phone: this.props.msisdn.address
      })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onActuallyRemove,
        kind: "danger_sm",
        className: "mx_ExistingPhoneNumber_confirmBtn"
      }, (0, _languageHandler._t)("Remove")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onDontRemove,
        kind: "link_sm",
        className: "mx_ExistingPhoneNumber_confirmBtn"
      }, (0, _languageHandler._t)("Cancel")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingPhoneNumber"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingPhoneNumber_address"
    }, "+", this.props.msisdn.address), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onRemove,
      kind: "danger_sm"
    }, (0, _languageHandler._t)("Remove")));
  }

}

exports.ExistingPhoneNumber = ExistingPhoneNumber;
(0, _defineProperty2.default)(ExistingPhoneNumber, "propTypes", {
  msisdn: _propTypes.default.object.isRequired,
  onRemoved: _propTypes.default.func.isRequired
});

class PhoneNumbers extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onRemoved", address => {
      const msisdns = this.props.msisdns.filter(e => e !== address);
      this.props.onMsisdnsChange(msisdns);
    });
    (0, _defineProperty2.default)(this, "_onChangeNewPhoneNumber", e => {
      this.setState({
        newPhoneNumber: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onChangeNewPhoneNumberCode", e => {
      this.setState({
        newPhoneNumberCode: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onAddClick", e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.state.newPhoneNumber) return;
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      const phoneNumber = this.state.newPhoneNumber;
      const phoneCountry = this.state.phoneCountry;
      const task = new _AddThreepid.default();
      this.setState({
        verifying: true,
        continueDisabled: true,
        addTask: task
      });
      task.addMsisdn(phoneCountry, phoneNumber).then(response => {
        this.setState({
          continueDisabled: false,
          verifyMsisdn: response.msisdn
        });
      }).catch(err => {
        console.error("Unable to add phone number " + phoneNumber + " " + err);
        this.setState({
          verifying: false,
          continueDisabled: false,
          addTask: null
        });

        _Modal.default.createTrackedDialog('Add Phone Number Error', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Error"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onContinueClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        continueDisabled: true
      });
      const token = this.state.newPhoneNumberCode;
      const address = this.state.verifyMsisdn;
      this.state.addTask.haveMsisdnToken(token).then(() => {
        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false,
          verifyMsisdn: "",
          verifyError: null,
          newPhoneNumber: "",
          newPhoneNumberCode: ""
        });
        const msisdns = [...this.props.msisdns, {
          address,
          medium: "msisdn"
        }];
        this.props.onMsisdnsChange(msisdns);
      }).catch(err => {
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
      });
    });
    (0, _defineProperty2.default)(this, "_onCountryChanged", e => {
      this.setState({
        phoneCountry: e.iso2
      });
    });
    this.state = {
      verifying: false,
      verifyError: false,
      verifyMsisdn: "",
      addTask: null,
      continueDisabled: false,
      phoneCountry: "",
      newPhoneNumber: "",
      newPhoneNumberCode: ""
    };
  }

  render() {
    const existingPhoneElements = this.props.msisdns.map(p => {
      return /*#__PURE__*/_react.default.createElement(ExistingPhoneNumber, {
        msisdn: p,
        onRemoved: this._onRemoved,
        key: p.address
      });
    });

    let addVerifySection = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onAddClick,
      kind: "primary"
    }, (0, _languageHandler._t)("Add"));

    if (this.state.verifying) {
      const msisdn = this.state.verifyMsisdn;
      addVerifySection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("A text message has been sent to +%(msisdn)s. " + "Please enter the verification code it contains.", {
        msisdn: msisdn
      }), /*#__PURE__*/_react.default.createElement("br", null), this.state.verifyError), /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this._onContinueClick,
        autoComplete: "off",
        noValidate: true
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "text",
        label: (0, _languageHandler._t)("Verification code"),
        autoComplete: "off",
        disabled: this.state.continueDisabled,
        value: this.state.newPhoneNumberCode,
        onChange: this._onChangeNewPhoneNumberCode
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onContinueClick,
        kind: "primary",
        disabled: this.state.continueDisabled
      }, (0, _languageHandler._t)("Continue"))));
    }

    const phoneCountry = /*#__PURE__*/_react.default.createElement(_CountryDropdown.default, {
      onOptionChange: this._onCountryChanged,
      className: "mx_PhoneNumbers_country",
      value: this.state.phoneCountry,
      disabled: this.state.verifying,
      isSmall: true,
      showPrefix: true
    });

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PhoneNumbers"
    }, existingPhoneElements, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onAddClick,
      autoComplete: "off",
      noValidate: true,
      className: "mx_PhoneNumbers_new"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PhoneNumbers_input"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      label: (0, _languageHandler._t)("Phone Number"),
      autoComplete: "off",
      disabled: this.state.verifying,
      prefixComponent: phoneCountry,
      value: this.state.newPhoneNumber,
      onChange: this._onChangeNewPhoneNumber
    }))), addVerifySection);
  }

}

exports.default = PhoneNumbers;
(0, _defineProperty2.default)(PhoneNumbers, "propTypes", {
  msisdns: _propTypes.default.array.isRequired,
  onMsisdnsChange: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2FjY291bnQvUGhvbmVOdW1iZXJzLmpzIl0sIm5hbWVzIjpbIkV4aXN0aW5nUGhvbmVOdW1iZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic2V0U3RhdGUiLCJ2ZXJpZnlSZW1vdmUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkZWxldGVUaHJlZVBpZCIsInByb3BzIiwibXNpc2RuIiwibWVkaXVtIiwiYWRkcmVzcyIsInRoZW4iLCJvblJlbW92ZWQiLCJjYXRjaCIsImVyciIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiY29uc29sZSIsImVycm9yIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2UiLCJzdGF0ZSIsInJlbmRlciIsInBob25lIiwiX29uQWN0dWFsbHlSZW1vdmUiLCJfb25Eb250UmVtb3ZlIiwiX29uUmVtb3ZlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImZ1bmMiLCJQaG9uZU51bWJlcnMiLCJtc2lzZG5zIiwiZmlsdGVyIiwib25Nc2lzZG5zQ2hhbmdlIiwibmV3UGhvbmVOdW1iZXIiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm5ld1Bob25lTnVtYmVyQ29kZSIsInBob25lTnVtYmVyIiwicGhvbmVDb3VudHJ5IiwidGFzayIsIkFkZFRocmVlcGlkIiwidmVyaWZ5aW5nIiwiY29udGludWVEaXNhYmxlZCIsImFkZFRhc2siLCJhZGRNc2lzZG4iLCJyZXNwb25zZSIsInZlcmlmeU1zaXNkbiIsInRva2VuIiwiaGF2ZU1zaXNkblRva2VuIiwidmVyaWZ5RXJyb3IiLCJlcnJjb2RlIiwiaXNvMiIsImV4aXN0aW5nUGhvbmVFbGVtZW50cyIsIm1hcCIsInAiLCJfb25SZW1vdmVkIiwiYWRkVmVyaWZ5U2VjdGlvbiIsIl9vbkFkZENsaWNrIiwiX29uQ29udGludWVDbGljayIsIl9vbkNoYW5nZU5ld1Bob25lTnVtYmVyQ29kZSIsIl9vbkNvdW50cnlDaGFuZ2VkIiwiX29uQ2hhbmdlTmV3UGhvbmVOdW1iZXIiLCJhcnJheSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVPLE1BQU1BLG1CQUFOLFNBQWtDQyxlQUFNQyxTQUF4QyxDQUFrRDtBQU1yREMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSxxREFRREMsQ0FBRCxJQUFPO0FBQ2ZBLE1BQUFBLENBQUMsQ0FBQ0MsZUFBRjtBQUNBRCxNQUFBQSxDQUFDLENBQUNFLGNBQUY7QUFFQSxXQUFLQyxRQUFMLENBQWM7QUFBQ0MsUUFBQUEsWUFBWSxFQUFFO0FBQWYsT0FBZDtBQUNILEtBYmE7QUFBQSx5REFlR0osQ0FBRCxJQUFPO0FBQ25CQSxNQUFBQSxDQUFDLENBQUNDLGVBQUY7QUFDQUQsTUFBQUEsQ0FBQyxDQUFDRSxjQUFGO0FBRUEsV0FBS0MsUUFBTCxDQUFjO0FBQUNDLFFBQUFBLFlBQVksRUFBRTtBQUFmLE9BQWQ7QUFDSCxLQXBCYTtBQUFBLDZEQXNCT0osQ0FBRCxJQUFPO0FBQ3ZCQSxNQUFBQSxDQUFDLENBQUNDLGVBQUY7QUFDQUQsTUFBQUEsQ0FBQyxDQUFDRSxjQUFGOztBQUVBRyx1Q0FBZ0JDLEdBQWhCLEdBQXNCQyxjQUF0QixDQUFxQyxLQUFLQyxLQUFMLENBQVdDLE1BQVgsQ0FBa0JDLE1BQXZELEVBQStELEtBQUtGLEtBQUwsQ0FBV0MsTUFBWCxDQUFrQkUsT0FBakYsRUFBMEZDLElBQTFGLENB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QUssRUFBRSxLQUFLbkIsS0FBTCxDQUFXYyxjQU50QjtBQU9JLE1BQUEsUUFBUSxFQUFFLEtBQUs0QjtBQVBuQixNQURKLENBREosQ0FGSixFQWVLTCxnQkFmTCxDQURKO0FBbUJIOztBQXpLcUQ7Ozs4QkFBckMzQixZLGVBQ0U7QUFDZkMsRUFBQUEsT0FBTyxFQUFFTCxtQkFBVXFDLEtBQVYsQ0FBZ0JuQyxVQURWO0FBRWZLLEVBQUFBLGVBQWUsRUFBRVAsbUJBQVVHLElBQVYsQ0FBZUQ7QUFGakIsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEFkZFRocmVlcGlkIGZyb20gXCIuLi8uLi8uLi8uLi9BZGRUaHJlZXBpZFwiO1xuaW1wb3J0IENvdW50cnlEcm9wZG93biBmcm9tIFwiLi4vLi4vYXV0aC9Db3VudHJ5RHJvcGRvd25cIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vLi4vTW9kYWwnO1xuXG4vKlxuVE9ETzogSW1wcm92ZSB0aGUgVVggZm9yIGV2ZXJ5dGhpbmcgaW4gaGVyZS5cblRoaXMgaXMgYSBjb3B5L3Bhc3RlIG9mIEVtYWlsQWRkcmVzc2VzLCBtb3N0bHkuXG4gKi9cblxuLy8gVE9ETzogQ29tYmluZSBFbWFpbEFkZHJlc3NlcyBhbmQgUGhvbmVOdW1iZXJzIHRvIGJlIDNwaWQgYWdub3N0aWNcblxuZXhwb3J0IGNsYXNzIEV4aXN0aW5nUGhvbmVOdW1iZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1zaXNkbjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBvblJlbW92ZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJpZnlSZW1vdmU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9vblJlbW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlSZW1vdmU6IHRydWV9KTtcbiAgICB9O1xuXG4gICAgX29uRG9udFJlbW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlSZW1vdmU6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIF9vbkFjdHVhbGx5UmVtb3ZlID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWxldGVUaHJlZVBpZCh0aGlzLnByb3BzLm1zaXNkbi5tZWRpdW0sIHRoaXMucHJvcHMubXNpc2RuLmFkZHJlc3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25SZW1vdmVkKHRoaXMucHJvcHMubXNpc2RuKTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gcmVtb3ZlIGNvbnRhY3QgaW5mb3JtYXRpb246IFwiICsgZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1JlbW92ZSAzcGlkIGZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byByZW1vdmUgY29udGFjdCBpbmZvcm1hdGlvblwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmeVJlbW92ZSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9wcm9tcHRUZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZW1vdmUgJShwaG9uZSlzP1wiLCB7cGhvbmU6IHRoaXMucHJvcHMubXNpc2RuLmFkZHJlc3N9KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkFjdHVhbGx5UmVtb3ZlfSBraW5kPVwiZGFuZ2VyX3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9jb25maXJtQnRuXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZW1vdmVcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25Eb250UmVtb3ZlfSBraW5kPVwibGlua19zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJfY29uZmlybUJ0blwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ2FuY2VsXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlclwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJfYWRkcmVzc1wiPit7dGhpcy5wcm9wcy5tc2lzZG4uYWRkcmVzc308L3NwYW4+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25SZW1vdmV9IGtpbmQ9XCJkYW5nZXJfc21cIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiUmVtb3ZlXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGhvbmVOdW1iZXJzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBtc2lzZG5zOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Nc2lzZG5zQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHZlcmlmeUVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIHZlcmlmeU1zaXNkbjogXCJcIixcbiAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBob25lQ291bnRyeTogXCJcIixcbiAgICAgICAgICAgIG5ld1Bob25lTnVtYmVyOiBcIlwiLFxuICAgICAgICAgICAgbmV3UGhvbmVOdW1iZXJDb2RlOiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9vblJlbW92ZWQgPSAoYWRkcmVzcykgPT4ge1xuICAgICAgICBjb25zdCBtc2lzZG5zID0gdGhpcy5wcm9wcy5tc2lzZG5zLmZpbHRlcigoZSkgPT4gZSAhPT0gYWRkcmVzcyk7XG4gICAgICAgIHRoaXMucHJvcHMub25Nc2lzZG5zQ2hhbmdlKG1zaXNkbnMpO1xuICAgIH07XG5cbiAgICBfb25DaGFuZ2VOZXdQaG9uZU51bWJlciA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbmV3UGhvbmVOdW1iZXI6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQ2hhbmdlTmV3UGhvbmVOdW1iZXJDb2RlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBuZXdQaG9uZU51bWJlckNvZGU6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQWRkQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3QgcGhvbmVOdW1iZXIgPSB0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyO1xuICAgICAgICBjb25zdCBwaG9uZUNvdW50cnkgPSB0aGlzLnN0YXRlLnBob25lQ291bnRyeTtcblxuICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZlcmlmeWluZzogdHJ1ZSwgY29udGludWVEaXNhYmxlZDogdHJ1ZSwgYWRkVGFzazogdGFza30pO1xuXG4gICAgICAgIHRhc2suYWRkTXNpc2RuKHBob25lQ291bnRyeSwgcGhvbmVOdW1iZXIpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250aW51ZURpc2FibGVkOiBmYWxzZSwgdmVyaWZ5TXNpc2RuOiByZXNwb25zZS5tc2lzZG59KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVuYWJsZSB0byBhZGQgcGhvbmUgbnVtYmVyIFwiICsgcGhvbmVOdW1iZXIgKyBcIiBcIiArIGVycik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlpbmc6IGZhbHNlLCBjb250aW51ZURpc2FibGVkOiBmYWxzZSwgYWRkVGFzazogbnVsbH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQWRkIFBob25lIE51bWJlciBFcnJvcicsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkNvbnRpbnVlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGludWVEaXNhYmxlZDogdHJ1ZX0pO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRoaXMuc3RhdGUubmV3UGhvbmVOdW1iZXJDb2RlO1xuICAgICAgICBjb25zdCBhZGRyZXNzID0gdGhpcy5zdGF0ZS52ZXJpZnlNc2lzZG47XG4gICAgICAgIHRoaXMuc3RhdGUuYWRkVGFzay5oYXZlTXNpc2RuVG9rZW4odG9rZW4pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcmlmeU1zaXNkbjogXCJcIixcbiAgICAgICAgICAgICAgICB2ZXJpZnlFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBuZXdQaG9uZU51bWJlcjogXCJcIixcbiAgICAgICAgICAgICAgICBuZXdQaG9uZU51bWJlckNvZGU6IFwiXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IG1zaXNkbnMgPSBbXG4gICAgICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5tc2lzZG5zLFxuICAgICAgICAgICAgICAgIHsgYWRkcmVzcywgbWVkaXVtOiBcIm1zaXNkblwiIH0sXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbk1zaXNkbnNDaGFuZ2UobXNpc2Rucyk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlfSk7XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgIT09ICdNX1RIUkVFUElEX0FVVEhfRkFJTEVEJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVuYWJsZSB0byB2ZXJpZnkgcGhvbmUgbnVtYmVyOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXInLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXIuXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlFcnJvcjogX3QoXCJJbmNvcnJlY3QgdmVyaWZpY2F0aW9uIGNvZGVcIil9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkNvdW50cnlDaGFuZ2VkID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGhvbmVDb3VudHJ5OiBlLmlzbzJ9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBleGlzdGluZ1Bob25lRWxlbWVudHMgPSB0aGlzLnByb3BzLm1zaXNkbnMubWFwKChwKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPEV4aXN0aW5nUGhvbmVOdW1iZXIgbXNpc2RuPXtwfSBvblJlbW92ZWQ9e3RoaXMuX29uUmVtb3ZlZH0ga2V5PXtwLmFkZHJlc3N9IC8+O1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgYWRkVmVyaWZ5U2VjdGlvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uQWRkQ2xpY2t9IGtpbmQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAge190KFwiQWRkXCIpfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52ZXJpZnlpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zaXNkbiA9IHRoaXMuc3RhdGUudmVyaWZ5TXNpc2RuO1xuICAgICAgICAgICAgYWRkVmVyaWZ5U2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQSB0ZXh0IG1lc3NhZ2UgaGFzIGJlZW4gc2VudCB0byArJShtc2lzZG4pcy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiUGxlYXNlIGVudGVyIHRoZSB2ZXJpZmljYXRpb24gY29kZSBpdCBjb250YWlucy5cIiwgeyBtc2lzZG46IG1zaXNkbiB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUudmVyaWZ5RXJyb3J9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5fb25Db250aW51ZUNsaWNrfSBhdXRvQ29tcGxldGU9XCJvZmZcIiBub1ZhbGlkYXRlPXt0cnVlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJWZXJpZmljYXRpb24gY29kZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmNvbnRpbnVlRGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3UGhvbmVOdW1iZXJDb2RlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZU5ld1Bob25lTnVtYmVyQ29kZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkNvbnRpbnVlQ2xpY2t9IGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmNvbnRpbnVlRGlzYWJsZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGhvbmVDb3VudHJ5ID0gPENvdW50cnlEcm9wZG93biBvbk9wdGlvbkNoYW5nZT17dGhpcy5fb25Db3VudHJ5Q2hhbmdlZH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Bob25lTnVtYmVyc19jb3VudHJ5XCJcbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBob25lQ291bnRyeX1cbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnZlcmlmeWluZ31cbiAgICAgICAgICAgIGlzU21hbGw9e3RydWV9XG4gICAgICAgICAgICBzaG93UHJlZml4PXt0cnVlfVxuICAgICAgICAvPjtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaG9uZU51bWJlcnNcIj5cbiAgICAgICAgICAgICAgICB7ZXhpc3RpbmdQaG9uZUVsZW1lbnRzfVxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLl9vbkFkZENsaWNrfSBhdXRvQ29tcGxldGU9XCJvZmZcIiBub1ZhbGlkYXRlPXt0cnVlfSBjbGFzc05hbWU9XCJteF9QaG9uZU51bWJlcnNfbmV3XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUGhvbmVOdW1iZXJzX2lucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiUGhvbmUgTnVtYmVyXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudmVyaWZ5aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeENvbXBvbmVudD17cGhvbmVDb3VudHJ5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZU5ld1Bob25lTnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgIHthZGRWZXJpZnlTZWN0aW9ufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19