"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ExistingEmailAddress = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var Email = _interopRequireWildcard(require("../../../../email"));

var _AddThreepid = _interopRequireDefault(require("../../../../AddThreepid"));

var sdk = _interopRequireWildcard(require("../../../../index"));

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _replaceableComponent = require("../../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

/*
TODO: Improve the UX for everything in here.
It's very much placeholder, but it gets the job done. The old way of handling
email addresses in user settings was to use dialogs to communicate state, however
due to our dialog system overriding dialogs (causing unmounts) this creates problems
for a sane UX. For instance, the user could easily end up entering an email address
and receive a dialog to verify the address, which then causes the component here
to forget what it was doing and ultimately fail. Dialogs are still used in some
places to communicate errors - these should be replaced with inline validation when
that is available.
 */
class ExistingEmailAddress extends _react.default.Component {
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

      _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(this.props.email.medium, this.props.email.address).then(() => {
        return this.props.onRemoved(this.props.email);
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
        className: "mx_ExistingEmailAddress"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_ExistingEmailAddress_promptText"
      }, (0, _languageHandler._t)("Remove %(email)s?", {
        email: this.props.email.address
      })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onActuallyRemove,
        kind: "danger_sm",
        className: "mx_ExistingEmailAddress_confirmBtn"
      }, (0, _languageHandler._t)("Remove")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onDontRemove,
        kind: "link_sm",
        className: "mx_ExistingEmailAddress_confirmBtn"
      }, (0, _languageHandler._t)("Cancel")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingEmailAddress"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingEmailAddress_email"
    }, this.props.email.address), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onRemove,
      kind: "danger_sm"
    }, (0, _languageHandler._t)("Remove")));
  }

}

exports.ExistingEmailAddress = ExistingEmailAddress;
(0, _defineProperty2.default)(ExistingEmailAddress, "propTypes", {
  email: _propTypes.default.object.isRequired,
  onRemoved: _propTypes.default.func.isRequired
});
let EmailAddresses = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.account.EmailAddresses"), _dec(_class = (_temp = _class2 = class EmailAddresses extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onRemoved", address => {
      const emails = this.props.emails.filter(e => e !== address);
      this.props.onEmailsChange(emails);
    });
    (0, _defineProperty2.default)(this, "_onChangeNewEmailAddress", e => {
      this.setState({
        newEmailAddress: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onAddClick", e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.state.newEmailAddress) return;
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      const email = this.state.newEmailAddress; // TODO: Inline field validation

      if (!Email.looksValid(email)) {
        _Modal.default.createTrackedDialog('Invalid email address', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Invalid Email Address"),
          description: (0, _languageHandler._t)("This doesn't appear to be a valid email address")
        });

        return;
      }

      const task = new _AddThreepid.default();
      this.setState({
        verifying: true,
        continueDisabled: true,
        addTask: task
      });
      task.addEmailAddress(email).then(() => {
        this.setState({
          continueDisabled: false
        });
      }).catch(err => {
        console.error("Unable to add email address " + email + " " + err);
        this.setState({
          verifying: false,
          continueDisabled: false,
          addTask: null
        });

        _Modal.default.createTrackedDialog('Unable to add email address', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Unable to add email address"),
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
      this.state.addTask.checkEmailLinkClicked().then(([finished]) => {
        let newEmailAddress = this.state.newEmailAddress;

        if (finished) {
          const email = this.state.newEmailAddress;
          const emails = [...this.props.emails, {
            address: email,
            medium: "email"
          }];
          this.props.onEmailsChange(emails);
          newEmailAddress = "";
        }

        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false,
          newEmailAddress
        });
      }).catch(err => {
        this.setState({
          continueDisabled: false
        });
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        if (err.errcode === 'M_THREEPID_AUTH_FAILED') {
          _Modal.default.createTrackedDialog("Email hasn't been verified yet", "", ErrorDialog, {
            title: (0, _languageHandler._t)("Your email address hasn't been verified yet"),
            description: (0, _languageHandler._t)("Click the link in the email you received to verify " + "and then click continue again.")
          });
        } else {
          console.error("Unable to verify email address: ", err);

          _Modal.default.createTrackedDialog('Unable to verify email address', '', ErrorDialog, {
            title: (0, _languageHandler._t)("Unable to verify email address."),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        }
      });
    });
    this.state = {
      verifying: false,
      addTask: null,
      continueDisabled: false,
      newEmailAddress: ""
    };
  }

  render() {
    const existingEmailElements = this.props.emails.map(e => {
      return /*#__PURE__*/_react.default.createElement(ExistingEmailAddress, {
        email: e,
        onRemoved: this._onRemoved,
        key: e.address
      });
    });

    let addButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onAddClick,
      kind: "primary"
    }, (0, _languageHandler._t)("Add"));

    if (this.state.verifying) {
      addButton = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("We've sent you an email to verify your address. Please follow the instructions there and then click the button below.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onContinueClick,
        kind: "primary",
        disabled: this.state.continueDisabled
      }, (0, _languageHandler._t)("Continue")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmailAddresses"
    }, existingEmailElements, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onAddClick,
      autoComplete: "off",
      noValidate: true,
      className: "mx_EmailAddresses_new"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      label: (0, _languageHandler._t)("Email Address"),
      autoComplete: "off",
      disabled: this.state.verifying,
      value: this.state.newEmailAddress,
      onChange: this._onChangeNewEmailAddress
    }), addButton));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  emails: _propTypes.default.array.isRequired,
  onEmailsChange: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = EmailAddresses;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2FjY291bnQvRW1haWxBZGRyZXNzZXMuanMiXSwibmFtZXMiOlsiRXhpc3RpbmdFbWFpbEFkZHJlc3MiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic2V0U3RhdGUiLCJ2ZXJpZnlSZW1vdmUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkZWxldGVUaHJlZVBpZCIsInByb3BzIiwiZW1haWwiLCJtZWRpdW0iLCJhZGRyZXNzIiwidGhlbiIsIm9uUmVtb3ZlZCIsImNhdGNoIiwiZXJyIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb25zb2xlIiwiZXJyb3IiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsInN0YXRlIiwicmVuZGVyIiwiX29uQWN0dWFsbHlSZW1vdmUiLCJfb25Eb250UmVtb3ZlIiwiX29uUmVtb3ZlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImZ1bmMiLCJFbWFpbEFkZHJlc3NlcyIsImVtYWlscyIsImZpbHRlciIsIm9uRW1haWxzQ2hhbmdlIiwibmV3RW1haWxBZGRyZXNzIiwidGFyZ2V0IiwidmFsdWUiLCJFbWFpbCIsImxvb2tzVmFsaWQiLCJ0YXNrIiwiQWRkVGhyZWVwaWQiLCJ2ZXJpZnlpbmciLCJjb250aW51ZURpc2FibGVkIiwiYWRkVGFzayIsImFkZEVtYWlsQWRkcmVzcyIsImNoZWNrRW1haWxMaW5rQ2xpY2tlZCIsImZpbmlzaGVkIiwiZXJyY29kZSIsImV4aXN0aW5nRW1haWxFbGVtZW50cyIsIm1hcCIsIl9vblJlbW92ZWQiLCJhZGRCdXR0b24iLCJfb25BZGRDbGljayIsIl9vbkNvbnRpbnVlQ2xpY2siLCJfb25DaGFuZ2VOZXdFbWFpbEFk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VUFEVDtBQUVmSyxFQUFBQSxjQUFjLEVBQUVQLG1CQUFVRyxJQUFWLENBQWVEO0FBRmhCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi8uLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gXCIuLi8uLi8uLi8uLi9lbWFpbFwiO1xuaW1wb3J0IEFkZFRocmVlcGlkIGZyb20gXCIuLi8uLi8uLi8uLi9BZGRUaHJlZXBpZFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLypcblRPRE86IEltcHJvdmUgdGhlIFVYIGZvciBldmVyeXRoaW5nIGluIGhlcmUuXG5JdCdzIHZlcnkgbXVjaCBwbGFjZWhvbGRlciwgYnV0IGl0IGdldHMgdGhlIGpvYiBkb25lLiBUaGUgb2xkIHdheSBvZiBoYW5kbGluZ1xuZW1haWwgYWRkcmVzc2VzIGluIHVzZXIgc2V0dGluZ3Mgd2FzIHRvIHVzZSBkaWFsb2dzIHRvIGNvbW11bmljYXRlIHN0YXRlLCBob3dldmVyXG5kdWUgdG8gb3VyIGRpYWxvZyBzeXN0ZW0gb3ZlcnJpZGluZyBkaWFsb2dzIChjYXVzaW5nIHVubW91bnRzKSB0aGlzIGNyZWF0ZXMgcHJvYmxlbXNcbmZvciBhIHNhbmUgVVguIEZvciBpbnN0YW5jZSwgdGhlIHVzZXIgY291bGQgZWFzaWx5IGVuZCB1cCBlbnRlcmluZyBhbiBlbWFpbCBhZGRyZXNzXG5hbmQgcmVjZWl2ZSBhIGRpYWxvZyB0byB2ZXJpZnkgdGhlIGFkZHJlc3MsIHdoaWNoIHRoZW4gY2F1c2VzIHRoZSBjb21wb25lbnQgaGVyZVxudG8gZm9yZ2V0IHdoYXQgaXQgd2FzIGRvaW5nIGFuZCB1bHRpbWF0ZWx5IGZhaWwuIERpYWxvZ3MgYXJlIHN0aWxsIHVzZWQgaW4gc29tZVxucGxhY2VzIHRvIGNvbW11bmljYXRlIGVycm9ycyAtIHRoZXNlIHNob3VsZCBiZSByZXBsYWNlZCB3aXRoIGlubGluZSB2YWxpZGF0aW9uIHdoZW5cbnRoYXQgaXMgYXZhaWxhYmxlLlxuICovXG5cbmV4cG9ydCBjbGFzcyBFeGlzdGluZ0VtYWlsQWRkcmVzcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgZW1haWw6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgb25SZW1vdmVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmVyaWZ5UmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfb25SZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmVyaWZ5UmVtb3ZlOiB0cnVlfSk7XG4gICAgfTtcblxuICAgIF9vbkRvbnRSZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmVyaWZ5UmVtb3ZlOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICBfb25BY3R1YWxseVJlbW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlVGhyZWVQaWQodGhpcy5wcm9wcy5lbWFpbC5tZWRpdW0sIHRoaXMucHJvcHMuZW1haWwuYWRkcmVzcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5vblJlbW92ZWQodGhpcy5wcm9wcy5lbWFpbCk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5hYmxlIHRvIHJlbW92ZSBjb250YWN0IGluZm9ybWF0aW9uOiBcIiArIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSZW1vdmUgM3BpZCBmYWlsZWQnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmFibGUgdG8gcmVtb3ZlIGNvbnRhY3QgaW5mb3JtYXRpb25cIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52ZXJpZnlSZW1vdmUpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ0VtYWlsQWRkcmVzc1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ0VtYWlsQWRkcmVzc19wcm9tcHRUZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZW1vdmUgJShlbWFpbClzP1wiLCB7ZW1haWw6IHRoaXMucHJvcHMuZW1haWwuYWRkcmVzc30gKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25BY3R1YWxseVJlbW92ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlJlbW92ZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25Eb250UmVtb3ZlfVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtfc21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkNhbmNlbFwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfZW1haWxcIj57dGhpcy5wcm9wcy5lbWFpbC5hZGRyZXNzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vblJlbW92ZX0ga2luZD1cImRhbmdlcl9zbVwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZW1vdmVcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5hY2NvdW50LkVtYWlsQWRkcmVzc2VzXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbWFpbEFkZHJlc3NlcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgZW1haWxzOiBQcm9wVHlwZXMuYXJyYXkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25FbWFpbHNDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbmV3RW1haWxBZGRyZXNzOiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9vblJlbW92ZWQgPSAoYWRkcmVzcykgPT4ge1xuICAgICAgICBjb25zdCBlbWFpbHMgPSB0aGlzLnByb3BzLmVtYWlscy5maWx0ZXIoKGUpID0+IGUgIT09IGFkZHJlc3MpO1xuICAgICAgICB0aGlzLnByb3BzLm9uRW1haWxzQ2hhbmdlKGVtYWlscyk7XG4gICAgfTtcblxuICAgIF9vbkNoYW5nZU5ld0VtYWlsQWRkcmVzcyA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbmV3RW1haWxBZGRyZXNzOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkFkZENsaWNrID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5uZXdFbWFpbEFkZHJlc3MpIHJldHVybjtcblxuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCBlbWFpbCA9IHRoaXMuc3RhdGUubmV3RW1haWxBZGRyZXNzO1xuXG4gICAgICAgIC8vIFRPRE86IElubGluZSBmaWVsZCB2YWxpZGF0aW9uXG4gICAgICAgIGlmICghRW1haWwubG9va3NWYWxpZChlbWFpbCkpIHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ludmFsaWQgZW1haWwgYWRkcmVzcycsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkludmFsaWQgRW1haWwgQWRkcmVzc1wiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJUaGlzIGRvZXNuJ3QgYXBwZWFyIHRvIGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFzayA9IG5ldyBBZGRUaHJlZXBpZCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlpbmc6IHRydWUsIGNvbnRpbnVlRGlzYWJsZWQ6IHRydWUsIGFkZFRhc2s6IHRhc2t9KTtcblxuICAgICAgICB0YXNrLmFkZEVtYWlsQWRkcmVzcyhlbWFpbCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250aW51ZURpc2FibGVkOiBmYWxzZX0pO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5hYmxlIHRvIGFkZCBlbWFpbCBhZGRyZXNzIFwiICsgZW1haWwgKyBcIiBcIiArIGVycik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt2ZXJpZnlpbmc6IGZhbHNlLCBjb250aW51ZURpc2FibGVkOiBmYWxzZSwgYWRkVGFzazogbnVsbH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIGFkZCBlbWFpbCBhZGRyZXNzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIGFkZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkNvbnRpbnVlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGludWVEaXNhYmxlZDogdHJ1ZX0pO1xuICAgICAgICB0aGlzLnN0YXRlLmFkZFRhc2suY2hlY2tFbWFpbExpbmtDbGlja2VkKCkudGhlbigoW2ZpbmlzaGVkXSkgPT4ge1xuICAgICAgICAgICAgbGV0IG5ld0VtYWlsQWRkcmVzcyA9IHRoaXMuc3RhdGUubmV3RW1haWxBZGRyZXNzO1xuICAgICAgICAgICAgaWYgKGZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW1haWwgPSB0aGlzLnN0YXRlLm5ld0VtYWlsQWRkcmVzcztcbiAgICAgICAgICAgICAgICBjb25zdCBlbWFpbHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMucHJvcHMuZW1haWxzLFxuICAgICAgICAgICAgICAgICAgICB7IGFkZHJlc3M6IGVtYWlsLCBtZWRpdW06IFwiZW1haWxcIiB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkVtYWlsc0NoYW5nZShlbWFpbHMpO1xuICAgICAgICAgICAgICAgIG5ld0VtYWlsQWRkcmVzcyA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgbmV3RW1haWxBZGRyZXNzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlfSk7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09PSAnTV9USFJFRVBJRF9BVVRIX0ZBSUxFRCcpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFwiRW1haWwgaGFzbid0IGJlZW4gdmVyaWZpZWQgeWV0XCIsIFwiXCIsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIllvdXIgZW1haWwgYWRkcmVzcyBoYXNuJ3QgYmVlbiB2ZXJpZmllZCB5ZXRcIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkNsaWNrIHRoZSBsaW5rIGluIHRoZSBlbWFpbCB5b3UgcmVjZWl2ZWQgdG8gdmVyaWZ5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYW5kIHRoZW4gY2xpY2sgY29udGludWUgYWdhaW4uXCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzOiBcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdVbmFibGUgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdFbWFpbEVsZW1lbnRzID0gdGhpcy5wcm9wcy5lbWFpbHMubWFwKChlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPEV4aXN0aW5nRW1haWxBZGRyZXNzIGVtYWlsPXtlfSBvblJlbW92ZWQ9e3RoaXMuX29uUmVtb3ZlZH0ga2V5PXtlLmFkZHJlc3N9IC8+O1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgYWRkQnV0dG9uID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25BZGRDbGlja30ga2luZD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICB7X3QoXCJBZGRcIil9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmeWluZykge1xuICAgICAgICAgICAgYWRkQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+e190KFwiV2UndmUgc2VudCB5b3UgYW4gZW1haWwgdG8gdmVyaWZ5IHlvdXIgYWRkcmVzcy4gUGxlYXNlIGZvbGxvdyB0aGUgaW5zdHJ1Y3Rpb25zIHRoZXJlIGFuZCB0aGVuIGNsaWNrIHRoZSBidXR0b24gYmVsb3cuXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25Db250aW51ZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuY29udGludWVEaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ29udGludWVcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FbWFpbEFkZHJlc3Nlc1wiPlxuICAgICAgICAgICAgICAgIHtleGlzdGluZ0VtYWlsRWxlbWVudHN9XG4gICAgICAgICAgICAgICAgPGZvcm1cbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ9e3RoaXMuX29uQWRkQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgIG5vVmFsaWRhdGU9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0VtYWlsQWRkcmVzc2VzX25ld1wiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVtYWlsIEFkZHJlc3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudmVyaWZ5aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3RW1haWxBZGRyZXNzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlTmV3RW1haWxBZGRyZXNzfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7YWRkQnV0dG9ufVxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==