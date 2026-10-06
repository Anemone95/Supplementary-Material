"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var Email = _interopRequireWildcard(require("../../../email"));

var _AddThreepid = _interopRequireDefault(require("../../../AddThreepid"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let SetEmailDialog = (
/*
 * Prompt the user to set an email address.
 *
 * On success, `onFinished(true)` is called.
 */
_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.SetEmailDialog"), _dec(_class = (_temp = _class2 = class SetEmailDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      emailAddress: '',
      emailBusy: false
    });
    (0, _defineProperty2.default)(this, "onEmailAddressChanged", value => {
      this.setState({
        emailAddress: value
      });
    });
    (0, _defineProperty2.default)(this, "onSubmit", () => {
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");
      const emailAddress = this.state.emailAddress;

      if (!Email.looksValid(emailAddress)) {
        _Modal.default.createTrackedDialog('Invalid Email Address', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Invalid Email Address"),
          description: (0, _languageHandler._t)("This doesn't appear to be a valid email address")
        });

        return;
      }

      this._addThreepid = new _AddThreepid.default();

      this._addThreepid.addEmailAddress(emailAddress).then(() => {
        _Modal.default.createTrackedDialog('Verification Pending', '', QuestionDialog, {
          title: (0, _languageHandler._t)("Verification Pending"),
          description: (0, _languageHandler._t)("Please check your email and click on the link it contains. Once this " + "is done, click continue."),
          button: (0, _languageHandler._t)('Continue'),
          onFinished: this.onEmailDialogFinished
        });
      }, err => {
        this.setState({
          emailBusy: false
        });
        console.error("Unable to add email address " + emailAddress + " " + err);

        _Modal.default.createTrackedDialog('Unable to add email address', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Unable to add email address"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      });

      this.setState({
        emailBusy: true
      });
    });
    (0, _defineProperty2.default)(this, "onCancelled", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onEmailDialogFinished", ok => {
      if (ok) {
        this.verifyEmailAddress();
      } else {
        this.setState({
          emailBusy: false
        });
      }
    });
  }

  verifyEmailAddress() {
    this._addThreepid.checkEmailLinkClicked().then(() => {
      this.props.onFinished(true);
    }, err => {
      this.setState({
        emailBusy: false
      });

      if (err.errcode == 'M_THREEPID_AUTH_FAILED') {
        const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");
        const message = (0, _languageHandler._t)("Unable to verify email address.") + " " + (0, _languageHandler._t)("Please check your email and click on the link it contains. Once this is done, click continue.");

        _Modal.default.createTrackedDialog('Verification Pending', '3pid Auth Failed', QuestionDialog, {
          title: (0, _languageHandler._t)("Verification Pending"),
          description: message,
          button: (0, _languageHandler._t)('Continue'),
          onFinished: this.onEmailDialogFinished
        });
      } else {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        console.error("Unable to verify email address: " + err);

        _Modal.default.createTrackedDialog('Unable to verify email address', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Unable to verify email address."),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      }
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const Spinner = sdk.getComponent('elements.Spinner');
    const EditableText = sdk.getComponent('elements.EditableText');
    const emailInput = this.state.emailBusy ? /*#__PURE__*/_react.default.createElement(Spinner, null) : /*#__PURE__*/_react.default.createElement(EditableText, {
      initialValue: this.state.emailAddress,
      className: "mx_SetEmailDialog_email_input",
      autoFocus: "true",
      placeholder: (0, _languageHandler._t)("Email address"),
      placeholderClassName: "mx_SetEmailDialog_email_input_placeholder",
      blurToCancel: false,
      onValueChanged: this.onEmailAddressChanged
    });
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_SetEmailDialog",
      onFinished: this.onCancelled,
      title: this.props.title,
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", {
      id: "mx_Dialog_content"
    }, (0, _languageHandler._t)('This will allow you to reset your password and receive notifications.')), emailInput), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Dialog_primary",
      type: "submit",
      value: (0, _languageHandler._t)("Continue"),
      onClick: this.onSubmit
    }), /*#__PURE__*/_react.default.createElement("input", {
      type: "submit",
      value: (0, _languageHandler._t)("Skip"),
      onClick: this.onCancelled
    })));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = SetEmailDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2V0RW1haWxEaWFsb2cuanMiXSwibmFtZXMiOlsiU2V0RW1haWxEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImVtYWlsQWRkcmVzcyIsImVtYWlsQnVzeSIsInZhbHVlIiwic2V0U3RhdGUiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIlF1ZXN0aW9uRGlhbG9nIiwic3RhdGUiLCJFbWFpbCIsImxvb2tzVmFsaWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiX2FkZFRocmVlcGlkIiwiQWRkVGhyZWVwaWQiLCJhZGRFbWFpbEFkZHJlc3MiLCJ0aGVuIiwiYnV0dG9uIiwib25GaW5pc2hlZCIsIm9uRW1haWxEaWFsb2dGaW5pc2hlZCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsIm1lc3NhZ2UiLCJwcm9wcyIsIm9rIiwidmVyaWZ5RW1haWxBZGRyZXNzIiwiY2hlY2tFbWFpbExpbmtDbGlja2VkIiwiZXJyY29kZSIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJTcGlubmVyIiwiRWRpdGFibGVUZXh0IiwiZW1haWxJbnB1dCIsIm9uRW1haWxBZGRyZXNzQ2hhbmdlZCIsIm9uQ2FuY2VsbGVkIiwib25TdWJtaXQiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQVNxQkEsYztBQU5yQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO09BQ0MsZ0RBQXFCLDhCQUFyQixDLG1DQUFELE1BQ3FCQSxjQURyQixTQUM0Q0MsZUFBTUMsU0FEbEQsQ0FDNEQ7QUFBQTtBQUFBO0FBQUEsaURBS2hEO0FBQ0pDLE1BQUFBLFlBQVksRUFBRSxFQURWO0FBRUpDLE1BQUFBLFNBQVMsRUFB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KlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRW1haWwgZnJvbSAnLi4vLi4vLi4vZW1haWwnO1xuaW1wb3J0IEFkZFRocmVlcGlkIGZyb20gJy4uLy4uLy4uL0FkZFRocmVlcGlkJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuXG4vKlxuICogUHJvbXB0IHRoZSB1c2VyIHRvIHNldCBhbiBlbWFpbCBhZGRyZXNzLlxuICpcbiAqIE9uIHN1Y2Nlc3MsIGBvbkZpbmlzaGVkKHRydWUpYCBpcyBjYWxsZWQuXG4gKi9cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuU2V0RW1haWxEaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNldEVtYWlsRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgZW1haWxBZGRyZXNzOiAnJyxcbiAgICAgICAgZW1haWxCdXN5OiBmYWxzZSxcbiAgICB9O1xuXG4gICAgb25FbWFpbEFkZHJlc3NDaGFuZ2VkID0gdmFsdWUgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVtYWlsQWRkcmVzczogdmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvblN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcblxuICAgICAgICBjb25zdCBlbWFpbEFkZHJlc3MgPSB0aGlzLnN0YXRlLmVtYWlsQWRkcmVzcztcbiAgICAgICAgaWYgKCFFbWFpbC5sb29rc1ZhbGlkKGVtYWlsQWRkcmVzcykpIHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ludmFsaWQgRW1haWwgQWRkcmVzcycsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkludmFsaWQgRW1haWwgQWRkcmVzc1wiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJUaGlzIGRvZXNuJ3QgYXBwZWFyIHRvIGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FkZFRocmVlcGlkID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgIHRoaXMuX2FkZFRocmVlcGlkLmFkZEVtYWlsQWRkcmVzcyhlbWFpbEFkZHJlc3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVmVyaWZpY2F0aW9uIFBlbmRpbmcnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJWZXJpZmljYXRpb24gUGVuZGluZ1wiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiUGxlYXNlIGNoZWNrIHlvdXIgZW1haWwgYW5kIGNsaWNrIG9uIHRoZSBsaW5rIGl0IGNvbnRhaW5zLiBPbmNlIHRoaXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImlzIGRvbmUsIGNsaWNrIGNvbnRpbnVlLlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdCgnQ29udGludWUnKSxcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiB0aGlzLm9uRW1haWxEaWFsb2dGaW5pc2hlZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlbWFpbEJ1c3k6IGZhbHNlfSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5hYmxlIHRvIGFkZCBlbWFpbCBhZGRyZXNzIFwiICsgZW1haWxBZGRyZXNzICsgXCIgXCIgKyBlcnIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIGFkZCBlbWFpbCBhZGRyZXNzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIGFkZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2VtYWlsQnVzeTogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBvbkNhbmNlbGxlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgb25FbWFpbERpYWxvZ0ZpbmlzaGVkID0gb2sgPT4ge1xuICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5RW1haWxBZGRyZXNzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlbWFpbEJ1c3k6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmVyaWZ5RW1haWxBZGRyZXNzKCkge1xuICAgICAgICB0aGlzLl9hZGRUaHJlZXBpZC5jaGVja0VtYWlsTGlua0NsaWNrZWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZW1haWxCdXN5OiBmYWxzZX0pO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09ICdNX1RIUkVFUElEX0FVVEhfRkFJTEVEJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzLlwiKSArIFwiIFwiICtcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBhbmQgY2xpY2sgb24gdGhlIGxpbmsgaXQgY29udGFpbnMuIE9uY2UgdGhpcyBpcyBkb25lLCBjbGljayBjb250aW51ZS5cIik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVmVyaWZpY2F0aW9uIFBlbmRpbmcnLCAnM3BpZCBBdXRoIEZhaWxlZCcsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlZlcmlmaWNhdGlvbiBQZW5kaW5nXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBfdCgnQ29udGludWUnKSxcbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZDogdGhpcy5vbkVtYWlsRGlhbG9nRmluaXNoZWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzczogXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1VuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzcycsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmFibGUgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3MuXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlNwaW5uZXInKTtcbiAgICAgICAgY29uc3QgRWRpdGFibGVUZXh0ID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuRWRpdGFibGVUZXh0Jyk7XG5cbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IHRoaXMuc3RhdGUuZW1haWxCdXN5ID8gPFNwaW5uZXIgLz4gOiA8RWRpdGFibGVUZXh0XG4gICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMuc3RhdGUuZW1haWxBZGRyZXNzfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU2V0RW1haWxEaWFsb2dfZW1haWxfaW5wdXRcIlxuICAgICAgICAgICAgYXV0b0ZvY3VzPVwidHJ1ZVwiXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJFbWFpbCBhZGRyZXNzXCIpfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXJDbGFzc05hbWU9XCJteF9TZXRFbWFpbERpYWxvZ19lbWFpbF9pbnB1dF9wbGFjZWhvbGRlclwiXG4gICAgICAgICAgICBibHVyVG9DYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgb25WYWx1ZUNoYW5nZWQ9e3RoaXMub25FbWFpbEFkZHJlc3NDaGFuZ2VkfSAvPjtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfU2V0RW1haWxEaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DYW5jZWxsZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMucHJvcHMudGl0bGV9XG4gICAgICAgICAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxwIGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdUaGlzIHdpbGwgYWxsb3cgeW91IHRvIHJlc2V0IHlvdXIgcGFzc3dvcmQgYW5kIHJlY2VpdmUgbm90aWZpY2F0aW9ucy4nKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgeyBlbWFpbElucHV0IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJteF9EaWFsb2dfcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtfdChcIlNraXBcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsbGVkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==