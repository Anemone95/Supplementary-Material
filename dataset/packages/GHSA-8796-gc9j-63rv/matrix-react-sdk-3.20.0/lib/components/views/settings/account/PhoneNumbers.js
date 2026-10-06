"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

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
let PhoneNumbers = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.account.PhoneNumbers"), _dec(_class = (_temp = _class2 = class PhoneNumbers extends _react.default.Component {
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
      this.state.addTask.haveMsisdnToken(token).then(([finished]) => {
        let newPhoneNumber = this.state.newPhoneNumber;

        if (finished) {
          const msisdns = [...this.props.msisdns, {
            address,
            medium: "msisdn"
          }];
          this.props.onMsisdnsChange(msisdns);
          newPhoneNumber = "";
        }

        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false,
          verifyMsisdn: "",
          verifyError: null,
          newPhoneNumber,
          newPhoneNumberCode: ""
        });
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  msisdns: _propTypes.default.array.isRequired,
  onMsisdnsChange: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = PhoneNumbers;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2FjY291bnQvUGhvbmVOdW1iZXJzLmpzIl0sIm5hbWVzIjpbIkV4aXN0aW5nUGhvbmVOdW1iZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic2V0U3RhdGUiLCJ2ZXJpZnlSZW1vdmUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkZWxldGVUaHJlZVBpZCIsInByb3BzIiwibXNpc2RuIiwibWVkaXVtIiwiYWRkcmVzcyIsInRoZW4iLCJvblJlbW92ZWQiLCJjYXRjaCIsImVyciIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiY29uc29sZSIsImVycm9yIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2UiLCJzdGF0ZSIsInJlbmRlciIsInBob25lIiwiX29uQWN0dWFsbHlSZW1vdmUiLCJfb25Eb250UmVtb3ZlIiwiX29uUmVtb3ZlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImZ1bmMiLCJQaG9uZU51bWJlcnMiLCJtc2lzZG5zIiwiZmlsdGVyIiwib25Nc2lzZG5zQ2hhbmdlIiwibmV3UGhvbmVOdW1iZXIiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm5ld1Bob25lTnVtYmVyQ29kZSIsInBob25lTnVtYmVyIiwicGhvbmVDb3VudHJ5IiwidGFzayIsIkFkZFRocmVlcGlkIiwidmVyaWZ5aW5nIiwiY29udGludWVEaXNhYmxlZCIsImFkZFRhc2siLCJhZGRNc2lzZG4iLCJyZXNwb25zZSIsInZlcmlmeU1zaXNkbiIsInRva2VuIiwiaGF2ZU1zaXNkblRva2VuIiwiZmluaXNoZWQiLCJ2ZXJpZnlFcnJvciIsImVycmNvZGUiLCJpc28yIiwiZXhpc3RpbmdQaG9uZUVsZW1lbnRzIiwibWFwIiwicCIsIl9vblJlbW92ZWQiLCJhZGRWZXJpZnlTZWN0aW9uIiwiX29uQWRkQ2xpY2siLCJfb25Db250aW51ZUNsaWNrIiwiX29uQ2hhbmdlTmV3UGhvbmVOdW1iZXJDb2RlIiwiX29uQ291bnRyeUNoYW5nZWQiLCJfb25DaGFuZ2VOZXdQaG9uZU51bWJlciIsImFycmF5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVPLE1BQU1BLG1CQUFOLFNBQWtDQyxlQUFNQyxTQUF4QyxDQUFrRDtBQU1yREMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSxxREFRREMsQ0FBRCxJQUFPO0FBQ2ZBLE1BQUFBLENBQUMsQ0FBQ0MsZUFBRjtBQUNBRCxNQUFBQSxDQUFDLENBQUNFLGNBQUY7QUFFQSxXQUFLQyxRQUFMLENBQWM7QUFBQ0MsUUFBQUEsWUFBWSxFQUFFO0FBQWYsT0FBZDtBQUNILEtBYmE7QUFBQSx5REFlR0osQ0FBRCxJQUFPO0FBQ25CQSxNQUFBQSxDQUFDLENBQUNDLGVBQUY7QUFDQUQsTUFBQUEsQ0FBQyxDQUFDRSxjQUFGO0FBRUEsV0FBS0MsUUFBTCxDQUFjO0FBQUNDLFFBQUFBLFlBQVksRUFBRTtBQUFmLE9BQWQ7QUFDSCxLQXBCYTtBQUFBLDZEQXNCT0osQ0FBRCxJQUFPO0FBQ3ZCQSxNQUFBQSxDQUFDLENBQUNDLGVBQUY7QUFDQUQsTUFBQUEsQ0FBQyxDQUFDRSxjQUFGOztBQUVBRyx1Q0FBZ0JDLEdBQWhCLEdBQXNCQyxjQUF0QixDQUFxQyxLQUFLQyxLQUFMLENBQVdDLE1BQVgsQ0FBa0JDLE1BQXZELEVBQStELEtBQUtGLEtBQUwsQ0FBV0MsTUFBWCxDQUFrQkUsT0FBakYsRUFBMEZDLElBQTFGLENBQStGLE1BQU07QUFDakcsZUFBTyxLQUFLSixLQUFMLENBQVdLLFNBQVgsQ0FBcUIsS0FBS0wsS0FBTCxDQUFX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QUFBLFFBQVEsRUFBRSxLQUFLdkMsS0FBTCxDQUFXc0IsU0FKekI7QUFLSSxNQUFBLGVBQWUsRUFBRUgsWUFMckI7QUFNSSxNQUFBLEtBQUssRUFBRSxLQUFLbkIsS0FBTCxDQUFXYyxjQU50QjtBQU9JLE1BQUEsUUFBUSxFQUFFLEtBQUs2QjtBQVBuQixNQURKLENBREosQ0FGSixFQWVLTCxnQkFmTCxDQURKO0FBbUJIOztBQWhMcUQsQyxzREFDbkM7QUFDZjNCLEVBQUFBLE9BQU8sRUFBRUwsbUJBQVVzQyxLQUFWLENBQWdCcEMsVUFEVjtBQUVmSyxFQUFBQSxlQUFlLEVBQUVQLG1CQUFVRyxJQUFWLENBQWVEO0FBRmpCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi8uLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBBZGRUaHJlZXBpZCBmcm9tIFwiLi4vLi4vLi4vLi4vQWRkVGhyZWVwaWRcIjtcbmltcG9ydCBDb3VudHJ5RHJvcGRvd24gZnJvbSBcIi4uLy4uL2F1dGgvQ291bnRyeURyb3Bkb3duXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG4vKlxuVE9ETzogSW1wcm92ZSB0aGUgVVggZm9yIGV2ZXJ5dGhpbmcgaW4gaGVyZS5cblRoaXMgaXMgYSBjb3B5L3Bhc3RlIG9mIEVtYWlsQWRkcmVzc2VzLCBtb3N0bHkuXG4gKi9cblxuLy8gVE9ETzogQ29tYmluZSBFbWFpbEFkZHJlc3NlcyBhbmQgUGhvbmVOdW1iZXJzIHRvIGJlIDNwaWQgYWdub3N0aWNcblxuZXhwb3J0IGNsYXNzIEV4aXN0aW5nUGhvbmVOdW1iZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1zaXNkbjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBvblJlbW92ZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJpZnlSZW1vdmU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9vblJlbW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlSZW1vdmU6IHRydWV9KTtcbiAgICB9O1xuXG4gICAgX29uRG9udFJlbW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlSZW1vdmU6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIF9vbkFjdHVhbGx5UmVtb3ZlID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWxldGVUaHJlZVBpZCh0aGlzLnByb3BzLm1zaXNkbi5tZWRpdW0sIHRoaXMucHJvcHMubXNpc2RuLmFkZHJlc3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25SZW1vdmVkKHRoaXMucHJvcHMubXNpc2RuKTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gcmVtb3ZlIGNvbnRhY3QgaW5mb3JtYXRpb246IFwiICsgZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1JlbW92ZSAzcGlkIGZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byByZW1vdmUgY29udGFjdCBpbmZvcm1hdGlvblwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmeVJlbW92ZSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9wcm9tcHRUZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZW1vdmUgJShwaG9uZSlzP1wiLCB7cGhvbmU6IHRoaXMucHJvcHMubXNpc2RuLmFkZHJlc3N9KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25BY3R1YWxseVJlbW92ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9jb25maXJtQnRuXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiUmVtb3ZlXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkRvbnRSZW1vdmV9XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua19zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJDYW5jZWxcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9hZGRyZXNzXCI+K3t0aGlzLnByb3BzLm1zaXNkbi5hZGRyZXNzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vblJlbW92ZX0ga2luZD1cImRhbmdlcl9zbVwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZW1vdmVcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5hY2NvdW50LlBob25lTnVtYmVyc1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGhvbmVOdW1iZXJzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBtc2lzZG5zOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Nc2lzZG5zQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHZlcmlmeUVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIHZlcmlmeU1zaXNkbjogXCJcIixcbiAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBob25lQ291bnRyeTogXCJcIixcbiAgICAgICAgICAgIG5ld1Bob25lTnVtYmVyOiBcIlwiLFxuICAgICAgICAgICAgbmV3UGhvbmVOdW1iZXJDb2RlOiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9vblJlbW92ZWQgPSAoYWRkcmVzcykgPT4ge1xuICAgICAgICBjb25zdCBtc2lzZG5zID0gdGhpcy5wcm9wcy5tc2lzZG5zLmZpbHRlcigoZSkgPT4gZSAhPT0gYWRkcmVzcyk7XG4gICAgICAgIHRoaXMucHJvcHMub25Nc2lzZG5zQ2hhbmdlKG1zaXNkbnMpO1xuICAgIH07XG5cbiAgICBfb25DaGFuZ2VOZXdQaG9uZU51bWJlciA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbmV3UGhvbmVOdW1iZXI6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQ2hhbmdlTmV3UGhvbmVOdW1iZXJDb2RlID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBuZXdQaG9uZU51bWJlckNvZGU6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQWRkQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3QgcGhvbmVOdW1iZXIgPSB0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyO1xuICAgICAgICBjb25zdCBwaG9uZUNvdW50cnkgPSB0aGlzLnN0YXRlLnBob25lQ291bnRyeTtcblxuICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZlcmlmeWluZzogdHJ1ZSwgY29udGludWVEaXNhYmxlZDogdHJ1ZSwgYWRkVGFzazogdGFza30pO1xuXG4gICAgICAgIHRhc2suYWRkTXNpc2RuKHBob25lQ291bnRyeSwgcGhvbmVOdW1iZXIpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250aW51ZURpc2FibGVkOiBmYWxzZSwgdmVyaWZ5TXNpc2RuOiByZXNwb25zZS5tc2lzZG59KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVuYWJsZSB0byBhZGQgcGhvbmUgbnVtYmVyIFwiICsgcGhvbmVOdW1iZXIgKyBcIiBcIiArIGVycik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlpbmc6IGZhbHNlLCBjb250aW51ZURpc2FibGVkOiBmYWxzZSwgYWRkVGFzazogbnVsbH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQWRkIFBob25lIE51bWJlciBFcnJvcicsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkNvbnRpbnVlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGludWVEaXNhYmxlZDogdHJ1ZX0pO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRoaXMuc3RhdGUubmV3UGhvbmVOdW1iZXJDb2RlO1xuICAgICAgICBjb25zdCBhZGRyZXNzID0gdGhpcy5zdGF0ZS52ZXJpZnlNc2lzZG47XG4gICAgICAgIHRoaXMuc3RhdGUuYWRkVGFzay5oYXZlTXNpc2RuVG9rZW4odG9rZW4pLnRoZW4oKFtmaW5pc2hlZF0pID0+IHtcbiAgICAgICAgICAgIGxldCBuZXdQaG9uZU51bWJlciA9IHRoaXMuc3RhdGUubmV3UGhvbmVOdW1iZXI7XG4gICAgICAgICAgICBpZiAoZmluaXNoZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2lzZG5zID0gW1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLnByb3BzLm1zaXNkbnMsXG4gICAgICAgICAgICAgICAgICAgIHsgYWRkcmVzcywgbWVkaXVtOiBcIm1zaXNkblwiIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uTXNpc2Ruc0NoYW5nZShtc2lzZG5zKTtcbiAgICAgICAgICAgICAgICBuZXdQaG9uZU51bWJlciA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVyaWZ5TXNpc2RuOiBcIlwiLFxuICAgICAgICAgICAgICAgIHZlcmlmeUVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIG5ld1Bob25lTnVtYmVyLFxuICAgICAgICAgICAgICAgIG5ld1Bob25lTnVtYmVyQ29kZTogXCJcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250aW51ZURpc2FibGVkOiBmYWxzZX0pO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlICE9PSAnTV9USFJFRVBJRF9BVVRIX0ZBSUxFRCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gdmVyaWZ5IHBob25lIG51bWJlcjogXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1VuYWJsZSB0byB2ZXJpZnkgcGhvbmUgbnVtYmVyJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byB2ZXJpZnkgcGhvbmUgbnVtYmVyLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmVyaWZ5RXJyb3I6IF90KFwiSW5jb3JyZWN0IHZlcmlmaWNhdGlvbiBjb2RlXCIpfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25Db3VudHJ5Q2hhbmdlZCA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Bob25lQ291bnRyeTogZS5pc28yfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdQaG9uZUVsZW1lbnRzID0gdGhpcy5wcm9wcy5tc2lzZG5zLm1hcCgocCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDxFeGlzdGluZ1Bob25lTnVtYmVyIG1zaXNkbj17cH0gb25SZW1vdmVkPXt0aGlzLl9vblJlbW92ZWR9IGtleT17cC5hZGRyZXNzfSAvPjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGFkZFZlcmlmeVNlY3Rpb24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkFkZENsaWNrfSBraW5kPVwicHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgIHtfdChcIkFkZFwiKX1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVyaWZ5aW5nKSB7XG4gICAgICAgICAgICBjb25zdCBtc2lzZG4gPSB0aGlzLnN0YXRlLnZlcmlmeU1zaXNkbjtcbiAgICAgICAgICAgIGFkZFZlcmlmeVNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkEgdGV4dCBtZXNzYWdlIGhhcyBiZWVuIHNlbnQgdG8gKyUobXNpc2RuKXMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSBlbnRlciB0aGUgdmVyaWZpY2F0aW9uIGNvZGUgaXQgY29udGFpbnMuXCIsIHsgbXNpc2RuOiBtc2lzZG4gfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLnZlcmlmeUVycm9yfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uQ29udGludWVDbGlja30gYXV0b0NvbXBsZXRlPVwib2ZmXCIgbm9WYWxpZGF0ZT17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVmVyaWZpY2F0aW9uIGNvZGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5jb250aW51ZURpc2FibGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyQ29kZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2VOZXdQaG9uZU51bWJlckNvZGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNvbnRpbnVlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmNvbnRpbnVlRGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ29udGludWVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwaG9uZUNvdW50cnkgPSA8Q291bnRyeURyb3Bkb3duIG9uT3B0aW9uQ2hhbmdlPXt0aGlzLl9vbkNvdW50cnlDaGFuZ2VkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUGhvbmVOdW1iZXJzX2NvdW50cnlcIlxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGhvbmVDb3VudHJ5fVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudmVyaWZ5aW5nfVxuICAgICAgICAgICAgaXNTbWFsbD17dHJ1ZX1cbiAgICAgICAgICAgIHNob3dQcmVmaXg9e3RydWV9XG4gICAgICAgIC8+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Bob25lTnVtYmVyc1wiPlxuICAgICAgICAgICAgICAgIHtleGlzdGluZ1Bob25lRWxlbWVudHN9XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uQWRkQ2xpY2t9IGF1dG9Db21wbGV0ZT1cIm9mZlwiIG5vVmFsaWRhdGU9e3RydWV9IGNsYXNzTmFtZT1cIm14X1Bob25lTnVtYmVyc19uZXdcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaG9uZU51bWJlcnNfaW5wdXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJQaG9uZSBOdW1iZXJcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS52ZXJpZnlpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4Q29tcG9uZW50PXtwaG9uZUNvdW50cnl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3UGhvbmVOdW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlTmV3UGhvbmVOdW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAge2FkZFZlcmlmeVNlY3Rpb259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=