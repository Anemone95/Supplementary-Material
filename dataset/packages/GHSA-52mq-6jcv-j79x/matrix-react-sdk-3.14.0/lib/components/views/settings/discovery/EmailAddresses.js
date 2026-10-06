"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EmailAddress = void 0;

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
It's very much placeholder, but it gets the job done. The old way of handling
email addresses in user settings was to use dialogs to communicate state, however
due to our dialog system overriding dialogs (causing unmounts) this creates problems
for a sane UX. For instance, the user could easily end up entering an email address
and receive a dialog to verify the address, which then causes the component here
to forget what it was doing and ultimately fail. Dialogs are still used in some
places to communicate errors - these should be replaced with inline validation when
that is available.
*/

/*
TODO: Reduce all the copying between account vs. discovery components.
*/
class EmailAddress extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onRevokeClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: false,
        label: "revoke",
        errorTitle: (0, _languageHandler._t)("Unable to revoke sharing for email address")
      });
    });
    (0, _defineProperty2.default)(this, "onShareClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: true,
        label: "share",
        errorTitle: (0, _languageHandler._t)("Unable to share email address")
      });
    });
    (0, _defineProperty2.default)(this, "onContinueClick", async e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        continueDisabled: true
      });

      try {
        await this.state.addTask.checkEmailLinkClicked();
        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false
        });
      } catch (err) {
        this.setState({
          continueDisabled: false
        });
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        if (err.errcode === 'M_THREEPID_AUTH_FAILED') {
          _Modal.default.createTrackedDialog("E-mail hasn't been verified yet", "", ErrorDialog, {
            title: (0, _languageHandler._t)("Your email address hasn't been verified yet"),
            description: (0, _languageHandler._t)("Click the link in the email you received to verify " + "and then click continue again.")
          });
        } else {
          console.error("Unable to verify email address: " + err);

          _Modal.default.createTrackedDialog('Unable to verify email address', '', ErrorDialog, {
            title: (0, _languageHandler._t)("Unable to verify email address."),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        }
      }
    });
    const {
      bound
    } = props.email;
    this.state = {
      verifying: false,
      addTask: null,
      continueDisabled: false,
      bound
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event


  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line camelcase
    const {
      bound
    } = nextProps.email;
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
    } = this.props.email;

    try {
      if (bind) {
        const task = new _AddThreepid.default();
        this.setState({
          verifying: true,
          continueDisabled: true,
          addTask: task
        });
        await task.bindEmailAddress(address);
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
      console.error(`Unable to ${label} email address ${address} ${err}`);
      this.setState({
        verifying: false,
        continueDisabled: false,
        addTask: null
      });

      _Modal.default.createTrackedDialog(`Unable to ${label} email address`, '', ErrorDialog, {
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
    } = this.props.email;
    const task = new _AddThreepid.default();
    this.setState({
      verifying: true,
      continueDisabled: true,
      addTask: task
    });

    try {
      await _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(medium, address);

      if (bind) {
        await task.bindEmailAddress(address);
      } else {
        await task.addEmailAddress(address);
      }

      this.setState({
        continueDisabled: false,
        bound: bind
      });
    } catch (err) {
      console.error(`Unable to ${label} email address ${address} ${err}`);
      this.setState({
        verifying: false,
        continueDisabled: false,
        addTask: null
      });

      _Modal.default.createTrackedDialog(`Unable to ${label} email address`, '', ErrorDialog, {
        title: errorTitle,
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    }
  }

  render() {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    const {
      address
    } = this.props.email;
    const {
      verifying,
      bound
    } = this.state;
    let status;

    if (verifying) {
      status = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Verify the link in your inbox"), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_ExistingEmailAddress_confirmBtn",
        kind: "primary_sm",
        onClick: this.onContinueClick
      }, (0, _languageHandler._t)("Complete")));
    } else if (bound) {
      status = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_ExistingEmailAddress_confirmBtn",
        kind: "danger_sm",
        onClick: this.onRevokeClick
      }, (0, _languageHandler._t)("Revoke"));
    } else {
      status = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_ExistingEmailAddress_confirmBtn",
        kind: "primary_sm",
        onClick: this.onShareClick
      }, (0, _languageHandler._t)("Share"));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingEmailAddress"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingEmailAddress_email"
    }, address), status);
  }

}

exports.EmailAddress = EmailAddress;
(0, _defineProperty2.default)(EmailAddress, "propTypes", {
  email: _propTypes.default.object.isRequired
});

class EmailAddresses extends _react.default.Component {
  render() {
    let content;

    if (this.props.emails.length > 0) {
      content = this.props.emails.map(e => {
        return /*#__PURE__*/_react.default.createElement(EmailAddress, {
          email: e,
          key: e.address
        });
      });
    } else {
      content = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Discovery options will appear once you have added an email above."));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmailAddresses"
    }, content);
  }

}

exports.default = EmailAddresses;
(0, _defineProperty2.default)(EmailAddresses, "propTypes", {
  emails: _propTypes.default.array.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2Rpc2NvdmVyeS9FbWFpbEFkZHJlc3Nlcy5qcyJdLCJuYW1lcyI6WyJFbWFpbEFkZHJlc3MiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJjaGFuZ2VCaW5kaW5nIiwiYmluZCIsImxhYmVsIiwiZXJyb3JUaXRsZSIsInNldFN0YXRlIiwiY29udGludWVEaXNhYmxlZCIsInN0YXRlIiwiYWRkVGFzayIsImNoZWNrRW1haWxMaW5rQ2xpY2tlZCIsInZlcmlmeWluZyIsImVyciIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZXJyY29kZSIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJjb25zb2xlIiwiZXJyb3IiLCJtZXNzYWdlIiwiYm91bmQiLCJlbWFpbCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZG9lc1NlcnZlclN1cHBvcnRTZXBhcmF0ZUFkZEFuZEJpbmQiLCJjaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQiLCJtZWRpdW0iLCJhZGRyZXNzIiwidGFzayIsIkFkZFRocmVlcGlkIiwiYmluZEVtYWlsQWRkcmVzcyIsInVuYmluZFRocmVlUGlkIiwiZGVsZXRlVGhyZWVQaWQiLCJhZGRFbWFpbEFkZHJlc3MiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic3RhdHVzIiwib25Db250aW51ZUNsaWNrIiwib25SZXZva2VDbGljayIsIm9uU2hhcmVDbGljayIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJFbWFpbEFkZHJlc3NlcyIsImNvbnRlbnQiLCJlbWFpbHMiLCJsZW5ndGgiLCJtYXAi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Q0FBNkM7QUFLeEQ0QyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJVSxPQUFKOztBQUNBLFFBQUksS0FBS3BELEtBQUwsQ0FBV3FELE1BQVgsQ0FBa0JDLE1BQWxCLEdBQTJCLENBQS9CLEVBQWtDO0FBQzlCRixNQUFBQSxPQUFPLEdBQUcsS0FBS3BELEtBQUwsQ0FBV3FELE1BQVgsQ0FBa0JFLEdBQWxCLENBQXVCdEQsQ0FBRCxJQUFPO0FBQ25DLDRCQUFPLDZCQUFDLFlBQUQ7QUFBYyxVQUFBLEtBQUssRUFBRUEsQ0FBckI7QUFBd0IsVUFBQSxHQUFHLEVBQUVBLENBQUMsQ0FBQ2tDO0FBQS9CLFVBQVA7QUFDSCxPQUZTLENBQVY7QUFHSCxLQUpELE1BSU87QUFDSGlCLE1BQUFBLE9BQU8sZ0JBQUc7QUFBTSxRQUFBLFNBQVMsRUFBQztBQUFoQixTQUNMLHlCQUFHLG1FQUFILENBREssQ0FBVjtBQUdIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLQSxPQURMLENBREo7QUFLSDs7QUF0QnVEOzs7OEJBQXZDRCxjLGVBQ0U7QUFDZkUsRUFBQUEsTUFBTSxFQUFFTCxtQkFBVVEsS0FBVixDQUFnQk47QUFEVCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBBZGRUaHJlZXBpZCBmcm9tICcuLi8uLi8uLi8uLi9BZGRUaHJlZXBpZCc7XG5cbi8qXG5UT0RPOiBJbXByb3ZlIHRoZSBVWCBmb3IgZXZlcnl0aGluZyBpbiBoZXJlLlxuSXQncyB2ZXJ5IG11Y2ggcGxhY2Vob2xkZXIsIGJ1dCBpdCBnZXRzIHRoZSBqb2IgZG9uZS4gVGhlIG9sZCB3YXkgb2YgaGFuZGxpbmdcbmVtYWlsIGFkZHJlc3NlcyBpbiB1c2VyIHNldHRpbmdzIHdhcyB0byB1c2UgZGlhbG9ncyB0byBjb21tdW5pY2F0ZSBzdGF0ZSwgaG93ZXZlclxuZHVlIHRvIG91ciBkaWFsb2cgc3lzdGVtIG92ZXJyaWRpbmcgZGlhbG9ncyAoY2F1c2luZyB1bm1vdW50cykgdGhpcyBjcmVhdGVzIHByb2JsZW1zXG5mb3IgYSBzYW5lIFVYLiBGb3IgaW5zdGFuY2UsIHRoZSB1c2VyIGNvdWxkIGVhc2lseSBlbmQgdXAgZW50ZXJpbmcgYW4gZW1haWwgYWRkcmVzc1xuYW5kIHJlY2VpdmUgYSBkaWFsb2cgdG8gdmVyaWZ5IHRoZSBhZGRyZXNzLCB3aGljaCB0aGVuIGNhdXNlcyB0aGUgY29tcG9uZW50IGhlcmVcbnRvIGZvcmdldCB3aGF0IGl0IHdhcyBkb2luZyBhbmQgdWx0aW1hdGVseSBmYWlsLiBEaWFsb2dzIGFyZSBzdGlsbCB1c2VkIGluIHNvbWVcbnBsYWNlcyB0byBjb21tdW5pY2F0ZSBlcnJvcnMgLSB0aGVzZSBzaG91bGQgYmUgcmVwbGFjZWQgd2l0aCBpbmxpbmUgdmFsaWRhdGlvbiB3aGVuXG50aGF0IGlzIGF2YWlsYWJsZS5cbiovXG5cbi8qXG5UT0RPOiBSZWR1Y2UgYWxsIHRoZSBjb3B5aW5nIGJldHdlZW4gYWNjb3VudCB2cy4gZGlzY292ZXJ5IGNvbXBvbmVudHMuXG4qL1xuXG5leHBvcnQgY2xhc3MgRW1haWxBZGRyZXNzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBlbWFpbDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgeyBib3VuZCB9ID0gcHJvcHMuZW1haWw7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICBib3VuZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICBjb25zdCB7IGJvdW5kIH0gPSBuZXh0UHJvcHMuZW1haWw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBib3VuZCB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBjaGFuZ2VCaW5kaW5nKHsgYmluZCwgbGFiZWwsIGVycm9yVGl0bGUgfSkge1xuICAgICAgICBpZiAoIWF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IHsgbWVkaXVtLCBhZGRyZXNzIH0gPSB0aGlzLnByb3BzLmVtYWlsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoYmluZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhc2sgPSBuZXcgQWRkVGhyZWVwaWQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBhZGRUYXNrOiB0YXNrLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRhc2suYmluZEVtYWlsQWRkcmVzcyhhZGRyZXNzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS51bmJpbmRUaHJlZVBpZChtZWRpdW0sIGFkZHJlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJvdW5kOiBiaW5kIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byAke2xhYmVsfSBlbWFpbCBhZGRyZXNzICR7YWRkcmVzc30gJHtlcnJ9YCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coYFVuYWJsZSB0byAke2xhYmVsfSBlbWFpbCBhZGRyZXNzYCwgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGVycm9yVGl0bGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgY2hhbmdlQmluZGluZ1RhbmdsZWRBZGRCaW5kKHsgYmluZCwgbGFiZWwsIGVycm9yVGl0bGUgfSkge1xuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICBjb25zdCB7IG1lZGl1bSwgYWRkcmVzcyB9ID0gdGhpcy5wcm9wcy5lbWFpbDtcblxuICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmVyaWZ5aW5nOiB0cnVlLFxuICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGFkZFRhc2s6IHRhc2ssXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlVGhyZWVQaWQobWVkaXVtLCBhZGRyZXNzKTtcbiAgICAgICAgICAgIGlmIChiaW5kKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGFzay5iaW5kRW1haWxBZGRyZXNzKGFkZHJlc3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXNrLmFkZEVtYWlsQWRkcmVzcyhhZGRyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvdW5kOiBiaW5kLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVW5hYmxlIHRvICR7bGFiZWx9IGVtYWlsIGFkZHJlc3MgJHthZGRyZXNzfSAke2Vycn1gKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhgVW5hYmxlIHRvICR7bGFiZWx9IGVtYWlsIGFkZHJlc3NgLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogZXJyb3JUaXRsZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblJldm9rZUNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmNoYW5nZUJpbmRpbmcoe1xuICAgICAgICAgICAgYmluZDogZmFsc2UsXG4gICAgICAgICAgICBsYWJlbDogXCJyZXZva2VcIixcbiAgICAgICAgICAgIGVycm9yVGl0bGU6IF90KFwiVW5hYmxlIHRvIHJldm9rZSBzaGFyaW5nIGZvciBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblNoYXJlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2hhbmdlQmluZGluZyh7XG4gICAgICAgICAgICBiaW5kOiB0cnVlLFxuICAgICAgICAgICAgbGFiZWw6IFwic2hhcmVcIixcbiAgICAgICAgICAgIGVycm9yVGl0bGU6IF90KFwiVW5hYmxlIHRvIHNoYXJlIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uQ29udGludWVDbGljayA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGludWVEaXNhYmxlZDogdHJ1ZSB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc3RhdGUuYWRkVGFzay5jaGVja0VtYWlsTGlua0NsaWNrZWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT09ICdNX1RIUkVFUElEX0FVVEhfRkFJTEVEJykge1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXCJFLW1haWwgaGFzbid0IGJlZW4gdmVyaWZpZWQgeWV0XCIsIFwiXCIsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIllvdXIgZW1haWwgYWRkcmVzcyBoYXNuJ3QgYmVlbiB2ZXJpZmllZCB5ZXRcIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkNsaWNrIHRoZSBsaW5rIGluIHRoZSBlbWFpbCB5b3UgcmVjZWl2ZWQgdG8gdmVyaWZ5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYW5kIHRoZW4gY2xpY2sgY29udGludWUgYWdhaW4uXCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzcy5cIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG4gICAgICAgIGNvbnN0IHsgYWRkcmVzcyB9ID0gdGhpcy5wcm9wcy5lbWFpbDtcbiAgICAgICAgY29uc3QgeyB2ZXJpZnlpbmcsIGJvdW5kIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGxldCBzdGF0dXM7XG4gICAgICAgIGlmICh2ZXJpZnlpbmcpIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IDxzcGFuPlxuICAgICAgICAgICAgICAgIHtfdChcIlZlcmlmeSB0aGUgbGluayBpbiB5b3VyIGluYm94XCIpfVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9zbVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db250aW51ZUNsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge190KFwiQ29tcGxldGVcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfSBlbHNlIGlmIChib3VuZCkge1xuICAgICAgICAgICAgc3RhdHVzID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ0VtYWlsQWRkcmVzc19jb25maXJtQnRuXCJcbiAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyX3NtXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmV2b2tlQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge190KFwiUmV2b2tlXCIpfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlfc21cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaGFyZUNsaWNrfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtfdChcIlNoYXJlXCIpfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfZW1haWxcIj57YWRkcmVzc308L3NwYW4+XG4gICAgICAgICAgICAgICAge3N0YXR1c31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW1haWxBZGRyZXNzZXMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGVtYWlsczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZW1haWxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnByb3BzLmVtYWlscy5tYXAoKGUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPEVtYWlsQWRkcmVzcyBlbWFpbD17ZX0ga2V5PXtlLmFkZHJlc3N9IC8+O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICB7X3QoXCJEaXNjb3Zlcnkgb3B0aW9ucyB3aWxsIGFwcGVhciBvbmNlIHlvdSBoYXZlIGFkZGVkIGFuIGVtYWlsIGFib3ZlLlwiKX1cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FbWFpbEFkZHJlc3Nlc1wiPlxuICAgICAgICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19