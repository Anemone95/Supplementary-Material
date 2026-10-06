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

var sdk = _interopRequireWildcard(require("../../../index"));

var Email = _interopRequireWildcard(require("../../../email"));

var _AddThreepid = _interopRequireDefault(require("../../../AddThreepid"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

/*
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd

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
 * Prompt the user to set an email address.
 *
 * On success, `onFinished(true)` is called.
 */
class SetEmailDialog extends _react.default.Component {
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

}

exports.default = SetEmailDialog;
(0, _defineProperty2.default)(SetEmailDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2V0RW1haWxEaWFsb2cuanMiXSwibmFtZXMiOlsiU2V0RW1haWxEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImVtYWlsQWRkcmVzcyIsImVtYWlsQnVzeSIsInZhbHVlIiwic2V0U3RhdGUiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIlF1ZXN0aW9uRGlhbG9nIiwic3RhdGUiLCJFbWFpbCIsImxvb2tzVmFsaWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiX2FkZFRocmVlcGlkIiwiQWRkVGhyZWVwaWQiLCJhZGRFbWFpbEFkZHJlc3MiLCJ0aGVuIiwiYnV0dG9uIiwib25GaW5pc2hlZCIsIm9uRW1haWxEaWFsb2dGaW5pc2hlZCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsIm1lc3NhZ2UiLCJwcm9wcyIsIm9rIiwidmVyaWZ5RW1haWxBZGRyZXNzIiwiY2hlY2tFbWFpbExpbmtDbGlja2VkIiwiZXJyY29kZSIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJTcGlubmVyIiwiRWRpdGFibGVUZXh0IiwiZW1haWxJbnB1dCIsIm9uRW1haWxBZGRyZXNzQ2hhbmdlZCIsIm9uQ2FuY2VsbGVkIiwib25TdWJtaXQiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLGNBQU4sU0FBNkJDLGVBQU1DLFNBQW5DLENBQTZDO0FBQUE7QUFBQTtBQUFBLGlEQUtoRDtBQUNKQyxN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bUIsbUJBQVVDLElBQVYsQ0FBZUM7QUFEWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gJy4uLy4uLy4uL2VtYWlsJztcbmltcG9ydCBBZGRUaHJlZXBpZCBmcm9tICcuLi8uLi8uLi9BZGRUaHJlZXBpZCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuXG5cbi8qXG4gKiBQcm9tcHQgdGhlIHVzZXIgdG8gc2V0IGFuIGVtYWlsIGFkZHJlc3MuXG4gKlxuICogT24gc3VjY2VzcywgYG9uRmluaXNoZWQodHJ1ZSlgIGlzIGNhbGxlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0RW1haWxEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBlbWFpbEFkZHJlc3M6ICcnLFxuICAgICAgICBlbWFpbEJ1c3k6IGZhbHNlLFxuICAgIH07XG5cbiAgICBvbkVtYWlsQWRkcmVzc0NoYW5nZWQgPSB2YWx1ZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZW1haWxBZGRyZXNzOiB2YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uU3VibWl0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuXG4gICAgICAgIGNvbnN0IGVtYWlsQWRkcmVzcyA9IHRoaXMuc3RhdGUuZW1haWxBZGRyZXNzO1xuICAgICAgICBpZiAoIUVtYWlsLmxvb2tzVmFsaWQoZW1haWxBZGRyZXNzKSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnSW52YWxpZCBFbWFpbCBBZGRyZXNzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiSW52YWxpZCBFbWFpbCBBZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlRoaXMgZG9lc24ndCBhcHBlYXIgdG8gYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYWRkVGhyZWVwaWQgPSBuZXcgQWRkVGhyZWVwaWQoKTtcbiAgICAgICAgdGhpcy5fYWRkVGhyZWVwaWQuYWRkRW1haWxBZGRyZXNzKGVtYWlsQWRkcmVzcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdWZXJpZmljYXRpb24gUGVuZGluZycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlZlcmlmaWNhdGlvbiBQZW5kaW5nXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBhbmQgY2xpY2sgb24gdGhlIGxpbmsgaXQgY29udGFpbnMuIE9uY2UgdGhpcyBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiaXMgZG9uZSwgY2xpY2sgY29udGludWUuXCIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBidXR0b246IF90KCdDb250aW51ZScpLFxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IHRoaXMub25FbWFpbERpYWxvZ0ZpbmlzaGVkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2VtYWlsQnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gYWRkIGVtYWlsIGFkZHJlc3MgXCIgKyBlbWFpbEFkZHJlc3MgKyBcIiBcIiArIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdVbmFibGUgdG8gYWRkIGVtYWlsIGFkZHJlc3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmFibGUgdG8gYWRkIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZW1haWxCdXN5OiB0cnVlfSk7XG4gICAgfTtcblxuICAgIG9uQ2FuY2VsbGVkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBvbkVtYWlsRGlhbG9nRmluaXNoZWQgPSBvayA9PiB7XG4gICAgICAgIGlmIChvaykge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnlFbWFpbEFkZHJlc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2VtYWlsQnVzeTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2ZXJpZnlFbWFpbEFkZHJlc3MoKSB7XG4gICAgICAgIHRoaXMuX2FkZFRocmVlcGlkLmNoZWNrRW1haWxMaW5rQ2xpY2tlZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlbWFpbEJ1c3k6IGZhbHNlfSk7XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT0gJ01fVEhSRUVQSURfQVVUSF9GQUlMRUQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gX3QoXCJVbmFibGUgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3MuXCIpICsgXCIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBfdChcIlBsZWFzZSBjaGVjayB5b3VyIGVtYWlsIGFuZCBjbGljayBvbiB0aGUgbGluayBpdCBjb250YWlucy4gT25jZSB0aGlzIGlzIGRvbmUsIGNsaWNrIGNvbnRpbnVlLlwiKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdWZXJpZmljYXRpb24gUGVuZGluZycsICczcGlkIEF1dGggRmFpbGVkJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVmVyaWZpY2F0aW9uIFBlbmRpbmdcIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBidXR0b246IF90KCdDb250aW51ZScpLFxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiB0aGlzLm9uRW1haWxEaWFsb2dGaW5pc2hlZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzcy5cIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3Bpbm5lcicpO1xuICAgICAgICBjb25zdCBFZGl0YWJsZVRleHQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5FZGl0YWJsZVRleHQnKTtcblxuICAgICAgICBjb25zdCBlbWFpbElucHV0ID0gdGhpcy5zdGF0ZS5lbWFpbEJ1c3kgPyA8U3Bpbm5lciAvPiA6IDxFZGl0YWJsZVRleHRcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS5lbWFpbEFkZHJlc3N9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TZXRFbWFpbERpYWxvZ19lbWFpbF9pbnB1dFwiXG4gICAgICAgICAgICBhdXRvRm9jdXM9XCJ0cnVlXCJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIkVtYWlsIGFkZHJlc3NcIil9XG4gICAgICAgICAgICBwbGFjZWhvbGRlckNsYXNzTmFtZT1cIm14X1NldEVtYWlsRGlhbG9nX2VtYWlsX2lucHV0X3BsYWNlaG9sZGVyXCJcbiAgICAgICAgICAgIGJsdXJUb0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICBvblZhbHVlQ2hhbmdlZD17dGhpcy5vbkVtYWlsQWRkcmVzc0NoYW5nZWR9IC8+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9TZXRFbWFpbERpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNhbmNlbGxlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHAgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1RoaXMgd2lsbCBhbGxvdyB5b3UgdG8gcmVzZXQgeW91ciBwYXNzd29yZCBhbmQgcmVjZWl2ZSBub3RpZmljYXRpb25zLicpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICB7IGVtYWlsSW5wdXQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KFwiQ29udGludWVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KFwiU2tpcFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DYW5jZWxsZWR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19