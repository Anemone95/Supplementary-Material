"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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
        onClick: this.onContinueClick,
        disabled: this.state.continueDisabled
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
let EmailAddresses = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.discovery.EmailAddresses"), _dec(_class = (_temp = _class2 = class EmailAddresses extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  emails: _propTypes.default.array.isRequired
}), _temp)) || _class);
exports.default = EmailAddresses;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL2Rpc2NvdmVyeS9FbWFpbEFkZHJlc3Nlcy5qcyJdLCJuYW1lcyI6WyJFbWFpbEFkZHJlc3MiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJjaGFuZ2VCaW5kaW5nIiwiYmluZCIsImxhYmVsIiwiZXJyb3JUaXRsZSIsInNldFN0YXRlIiwiY29udGludWVEaXNhYmxlZCIsInN0YXRlIiwiYWRkVGFzayIsImNoZWNrRW1haWxMaW5rQ2xpY2tlZCIsInZlcmlmeWluZyIsImVyciIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZXJyY29kZSIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJjb25zb2xlIiwiZXJyb3IiLCJtZXNzYWdlIiwiYm91bmQiLCJlbWFpbCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZG9lc1NlcnZlclN1cHBvcnRTZXBhcmF0ZUFkZEFuZEJpbmQiLCJjaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQiLCJtZWRpdW0iLCJhZGRyZXNzIiwidGFzayIsIkFkZFRocmVlcGlkIiwiYmluZEVtYWlsQWRkcmVzcyIsInVuYmluZFRocmVlUGlkIiwiZGVsZXRlVGhyZWVQaWQiLCJhZGRFbWFpbEFkZHJlc3MiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic3RhdHVzIiwib25Db250aW51ZUNsaWNrIiwib25SZXZva2VDbGljayIsIm9uU2hhcmVDbGljayIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJFbWFpbEFkZHJlc3NlcyIsImNvbnRlbnQiLCJlbWFpbHMiLCJsZW5ndGgiLCJtYXAi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RCxDQUM0RDtBQUt4RDRDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFFBQUlVLE9BQUo7O0FBQ0EsUUFBSSxLQUFLcEQsS0FBTCxDQUFXcUQsTUFBWCxDQUFrQkMsTUFBbEIsR0FBMkIsQ0FBL0IsRUFBa0M7QUFDOUJGLE1BQUFBLE9BQU8sR0FBRyxLQUFLcEQsS0FBTCxDQUFXcUQsTUFBWCxDQUFrQkUsR0FBbEIsQ0FBdUJ0RCxDQUFELElBQU87QUFDbkMsNEJBQU8sNkJBQUMsWUFBRDtBQUFjLFVBQUEsS0FBSyxFQUFFQSxDQUFyQjtBQUF3QixVQUFBLEdBQUcsRUFBRUEsQ0FBQyxDQUFDa0M7QUFBL0IsVUFBUDtBQUNILE9BRlMsQ0FBVjtBQUdILEtBSkQsTUFJTztBQUNIaUIsTUFBQUEsT0FBTyxnQkFBRztBQUFNLFFBQUEsU0FBUyxFQUFDO0FBQWhCLFNBQ0wseUJBQUcsbUVBQUgsQ0FESyxDQUFWO0FBR0g7O0FBRUQsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tBLE9BREwsQ0FESjtBQUtIOztBQXRCdUQsQyxzREFDckM7QUFDZkMsRUFBQUEsTUFBTSxFQUFFTCxtQkFBVVEsS0FBVixDQUFnQk47QUFEVCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBBZGRUaHJlZXBpZCBmcm9tICcuLi8uLi8uLi8uLi9BZGRUaHJlZXBpZCc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLypcblRPRE86IEltcHJvdmUgdGhlIFVYIGZvciBldmVyeXRoaW5nIGluIGhlcmUuXG5JdCdzIHZlcnkgbXVjaCBwbGFjZWhvbGRlciwgYnV0IGl0IGdldHMgdGhlIGpvYiBkb25lLiBUaGUgb2xkIHdheSBvZiBoYW5kbGluZ1xuZW1haWwgYWRkcmVzc2VzIGluIHVzZXIgc2V0dGluZ3Mgd2FzIHRvIHVzZSBkaWFsb2dzIHRvIGNvbW11bmljYXRlIHN0YXRlLCBob3dldmVyXG5kdWUgdG8gb3VyIGRpYWxvZyBzeXN0ZW0gb3ZlcnJpZGluZyBkaWFsb2dzIChjYXVzaW5nIHVubW91bnRzKSB0aGlzIGNyZWF0ZXMgcHJvYmxlbXNcbmZvciBhIHNhbmUgVVguIEZvciBpbnN0YW5jZSwgdGhlIHVzZXIgY291bGQgZWFzaWx5IGVuZCB1cCBlbnRlcmluZyBhbiBlbWFpbCBhZGRyZXNzXG5hbmQgcmVjZWl2ZSBhIGRpYWxvZyB0byB2ZXJpZnkgdGhlIGFkZHJlc3MsIHdoaWNoIHRoZW4gY2F1c2VzIHRoZSBjb21wb25lbnQgaGVyZVxudG8gZm9yZ2V0IHdoYXQgaXQgd2FzIGRvaW5nIGFuZCB1bHRpbWF0ZWx5IGZhaWwuIERpYWxvZ3MgYXJlIHN0aWxsIHVzZWQgaW4gc29tZVxucGxhY2VzIHRvIGNvbW11bmljYXRlIGVycm9ycyAtIHRoZXNlIHNob3VsZCBiZSByZXBsYWNlZCB3aXRoIGlubGluZSB2YWxpZGF0aW9uIHdoZW5cbnRoYXQgaXMgYXZhaWxhYmxlLlxuKi9cblxuLypcblRPRE86IFJlZHVjZSBhbGwgdGhlIGNvcHlpbmcgYmV0d2VlbiBhY2NvdW50IHZzLiBkaXNjb3ZlcnkgY29tcG9uZW50cy5cbiovXG5cbmV4cG9ydCBjbGFzcyBFbWFpbEFkZHJlc3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGVtYWlsOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBjb25zdCB7IGJvdW5kIH0gPSBwcm9wcy5lbWFpbDtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGJvdW5kLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGNvbnN0IHsgYm91bmQgfSA9IG5leHRQcm9wcy5lbWFpbDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJvdW5kIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGNoYW5nZUJpbmRpbmcoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KSB7XG4gICAgICAgIGlmICghYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRvZXNTZXJ2ZXJTdXBwb3J0U2VwYXJhdGVBZGRBbmRCaW5kKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoYW5nZUJpbmRpbmdUYW5nbGVkQWRkQmluZCh7IGJpbmQsIGxhYmVsLCBlcnJvclRpdGxlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgY29uc3QgeyBtZWRpdW0sIGFkZHJlc3MgfSA9IHRoaXMucHJvcHMuZW1haWw7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChiaW5kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFzayA9IG5ldyBBZGRUaHJlZXBpZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGFkZFRhc2s6IHRhc2ssXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGFzay5iaW5kRW1haWxBZGRyZXNzKGFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnVuYmluZFRocmVlUGlkKG1lZGl1bSwgYWRkcmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgYm91bmQ6IGJpbmQgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVW5hYmxlIHRvICR7bGFiZWx9IGVtYWlsIGFkZHJlc3MgJHthZGRyZXNzfSAke2Vycn1gKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhgVW5hYmxlIHRvICR7bGFiZWx9IGVtYWlsIGFkZHJlc3NgLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogZXJyb3JUaXRsZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBjaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KSB7XG4gICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IHsgbWVkaXVtLCBhZGRyZXNzIH0gPSB0aGlzLnByb3BzLmVtYWlsO1xuXG4gICAgICAgIGNvbnN0IHRhc2sgPSBuZXcgQWRkVGhyZWVwaWQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2ZXJpZnlpbmc6IHRydWUsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiB0cnVlLFxuICAgICAgICAgICAgYWRkVGFzazogdGFzayxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWxldGVUaHJlZVBpZChtZWRpdW0sIGFkZHJlc3MpO1xuICAgICAgICAgICAgaWYgKGJpbmQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXNrLmJpbmRFbWFpbEFkZHJlc3MoYWRkcmVzcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRhc2suYWRkRW1haWxBZGRyZXNzKGFkZHJlc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYm91bmQ6IGJpbmQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBVbmFibGUgdG8gJHtsYWJlbH0gZW1haWwgYWRkcmVzcyAke2FkZHJlc3N9ICR7ZXJyfWApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKGBVbmFibGUgdG8gJHtsYWJlbH0gZW1haWwgYWRkcmVzc2AsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBlcnJvclRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmV2b2tlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2hhbmdlQmluZGluZyh7XG4gICAgICAgICAgICBiaW5kOiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBcInJldm9rZVwiLFxuICAgICAgICAgICAgZXJyb3JUaXRsZTogX3QoXCJVbmFibGUgdG8gcmV2b2tlIHNoYXJpbmcgZm9yIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uU2hhcmVDbGljayA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VCaW5kaW5nKHtcbiAgICAgICAgICAgIGJpbmQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogXCJzaGFyZVwiLFxuICAgICAgICAgICAgZXJyb3JUaXRsZTogX3QoXCJVbmFibGUgdG8gc2hhcmUgZW1haWwgYWRkcmVzc1wiKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Db250aW51ZUNsaWNrID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiB0cnVlIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdGF0ZS5hZGRUYXNrLmNoZWNrRW1haWxMaW5rQ2xpY2tlZCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gJ01fVEhSRUVQSURfQVVUSF9GQUlMRUQnKSB7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIkUtbWFpbCBoYXNuJ3QgYmVlbiB2ZXJpZmllZCB5ZXRcIiwgXCJcIiwgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiWW91ciBlbWFpbCBhZGRyZXNzIGhhc24ndCBiZWVuIHZlcmlmaWVkIHlldFwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiQ2xpY2sgdGhlIGxpbmsgaW4gdGhlIGVtYWlsIHlvdSByZWNlaXZlZCB0byB2ZXJpZnkgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhbmQgdGhlbiBjbGljayBjb250aW51ZSBhZ2Fpbi5cIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3M6IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdVbmFibGUgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29uc3QgeyBhZGRyZXNzIH0gPSB0aGlzLnByb3BzLmVtYWlsO1xuICAgICAgICBjb25zdCB7IHZlcmlmeWluZywgYm91bmQgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IHN0YXR1cztcbiAgICAgICAgaWYgKHZlcmlmeWluZykge1xuICAgICAgICAgICAgc3RhdHVzID0gPHNwYW4+XG4gICAgICAgICAgICAgICAge190KFwiVmVyaWZ5IHRoZSBsaW5rIGluIHlvdXIgaW5ib3hcIil9XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNvbnRpbnVlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmNvbnRpbnVlRGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJDb21wbGV0ZVwiKX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICB9IGVsc2UgaWYgKGJvdW5kKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZXZva2VDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7X3QoXCJSZXZva2VcIil9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ0VtYWlsQWRkcmVzc19jb25maXJtQnRuXCJcbiAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9zbVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNoYXJlQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge190KFwiU2hhcmVcIil9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ0VtYWlsQWRkcmVzc19lbWFpbFwiPnthZGRyZXNzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5kaXNjb3ZlcnkuRW1haWxBZGRyZXNzZXNcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVtYWlsQWRkcmVzc2VzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBlbWFpbHM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVtYWlscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gdGhpcy5wcm9wcy5lbWFpbHMubWFwKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxFbWFpbEFkZHJlc3MgZW1haWw9e2V9IGtleT17ZS5hZGRyZXNzfSAvPjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+XG4gICAgICAgICAgICAgICAge190KFwiRGlzY292ZXJ5IG9wdGlvbnMgd2lsbCBhcHBlYXIgb25jZSB5b3UgaGF2ZSBhZGRlZCBhbiBlbWFpbCBhYm92ZS5cIil9XG4gICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRW1haWxBZGRyZXNzZXNcIj5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==