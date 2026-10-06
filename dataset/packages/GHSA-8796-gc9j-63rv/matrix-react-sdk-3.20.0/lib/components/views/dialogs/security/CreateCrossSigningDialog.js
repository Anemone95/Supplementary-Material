"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _InteractiveAuthEntryComponents = require("../../auth/InteractiveAuthEntryComponents");

var _DialogButtons = _interopRequireDefault(require("../../elements/DialogButtons"));

var _BaseDialog = _interopRequireDefault(require("../BaseDialog"));

var _Spinner = _interopRequireDefault(require("../../elements/Spinner"));

var _InteractiveAuthDialog = _interopRequireDefault(require("../InteractiveAuthDialog"));

var _replaceableComponent = require("../../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let CreateCrossSigningDialog = (
/*
 * Walks the user through the process of creating a cross-signing keys. In most
 * cases, only a spinner is shown, but for more complex auth like SSO, the user
 * may need to complete some steps to proceed.
 */
_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.security.CreateCrossSigningDialog"), _dec(_class = (_temp = _class2 = class CreateCrossSigningDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_doBootstrapUIAuth", async makeRequest => {
      if (this.state.canUploadKeysWithPasswordOnly && this.state.accountPassword) {
        await makeRequest({
          type: 'm.login.password',
          identifier: {
            type: 'm.id.user',
            user: _MatrixClientPeg.MatrixClientPeg.get().getUserId()
          },
          // TODO: Remove `user` once servers support proper UIA
          // See https://github.com/matrix-org/synapse/issues/5665
          user: _MatrixClientPeg.MatrixClientPeg.get().getUserId(),
          password: this.state.accountPassword
        });
      } else if (this.props.tokenLogin) {
        // We are hoping the grace period is active
        await makeRequest({});
      } else {
        const dialogAesthetics = {
          [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
            title: (0, _languageHandler._t)("Use Single Sign On to continue"),
            body: (0, _languageHandler._t)("To continue, use Single Sign On to prove your identity."),
            continueText: (0, _languageHandler._t)("Single Sign On"),
            continueKind: "primary"
          },
          [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
            title: (0, _languageHandler._t)("Confirm encryption setup"),
            body: (0, _languageHandler._t)("Click the button below to confirm setting up encryption."),
            continueText: (0, _languageHandler._t)("Confirm"),
            continueKind: "primary"
          }
        };

        const {
          finished
        } = _Modal.default.createTrackedDialog('Cross-signing keys dialog', '', _InteractiveAuthDialog.default, {
          title: (0, _languageHandler._t)("Setting up keys"),
          matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
          makeRequest,
          aestheticsForStagePhases: {
            [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: dialogAesthetics,
            [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: dialogAesthetics
          }
        });

        const [confirmed] = await finished;

        if (!confirmed) {
          throw new Error("Cross-signing key upload auth canceled");
        }
      }
    });
    (0, _defineProperty2.default)(this, "_bootstrapCrossSigning", async () => {
      this.setState({
        error: null
      });

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        await cli.bootstrapCrossSigning({
          authUploadDeviceSigningKeys: this._doBootstrapUIAuth
        });
        this.props.onFinished(true);
      } catch (e) {
        if (this.props.tokenLogin) {
          // ignore any failures, we are relying on grace period here
          this.props.onFinished();
          return;
        }

        this.setState({
          error: e
        });
        console.error("Error bootstrapping cross-signing", e);
      }
    });
    (0, _defineProperty2.default)(this, "_onCancel", () => {
      this.props.onFinished(false);
    });
    this.state = {
      error: null,
      // Does the server offer a UI auth flow with just m.login.password
      // for /keys/device_signing/upload?
      canUploadKeysWithPasswordOnly: null,
      accountPassword: props.accountPassword || ""
    };

    if (this.state.accountPassword) {
      // If we have an account password in memory, let's simplify and
      // assume it means password auth is also supported for device
      // signing key upload as well. This avoids hitting the server to
      // test auth flows, which may be slow under high load.
      this.state.canUploadKeysWithPasswordOnly = true;
    } else {
      this._queryKeyUploadAuth();
    }
  }

  componentDidMount() {
    this._bootstrapCrossSigning();
  }

  async _queryKeyUploadAuth() {
    try {
      await _MatrixClientPeg.MatrixClientPeg.get().uploadDeviceSigningKeys(null, {}); // We should never get here: the server should always require
      // UI auth to upload device signing keys. If we do, we upload
      // no keys which would be a no-op.

      console.log("uploadDeviceSigningKeys unexpectedly succeeded without UI auth!");
    } catch (error) {
      if (!error.data || !error.data.flows) {
        console.log("uploadDeviceSigningKeys advertised no flows!");
        return;
      }

      const canUploadKeysWithPasswordOnly = error.data.flows.some(f => {
        return f.stages.length === 1 && f.stages[0] === 'm.login.password';
      });
      this.setState({
        canUploadKeysWithPasswordOnly
      });
    }
  }

  render() {
    let content;

    if (this.state.error) {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to set up keys")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Retry'),
        onPrimaryButtonClick: this._bootstrapCrossSigning,
        onCancel: this._onCancel
      })));
    } else {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_CreateCrossSigningDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Setting up keys"),
      hasCancel: false,
      fixedWidth: false
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  accountPassword: _propTypes.default.string,
  tokenLogin: _propTypes.default.bool
}), _temp)) || _class);
exports.default = CreateCrossSigningDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlQ3Jvc3NTaWduaW5nRGlhbG9nLmpzIl0sIm5hbWVzIjpbIkNyZWF0ZUNyb3NzU2lnbmluZ0RpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJtYWtlUmVxdWVzdCIsInN0YXRlIiwiY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkiLCJhY2NvdW50UGFzc3dvcmQiLCJ0eXBlIiwiaWRlbnRpZmllciIsInVzZXIiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRVc2VySWQiLCJwYXNzd29yZCIsInRva2VuTG9naW4iLCJkaWFsb2dBZXN0aGV0aWNzIiwiU1NPQXV0aEVudHJ5IiwiUEhBU0VfUFJFQVVUSCIsInRpdGxlIiwiYm9keSIsImNvbnRpbnVlVGV4dCIsImNvbnRpbnVlS2luZCIsIlBIQVNFX1BPU1RBVVRIIiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJJbnRlcmFjdGl2ZUF1dGhEaWFsb2ciLCJtYXRyaXhDbGllbnQiLCJhZXN0aGV0aWNzRm9yU3RhZ2VQaGFzZXMiLCJMT0dJTl9UWVBFIiwiVU5TVEFCTEVfTE9HSU5fVFlQRSIsImNvbmZpcm1lZCIsIkVycm9yIiwic2V0U3RhdGUiLCJlcnJvciIsImNsaSIsImJvb3RzdHJhcENyb3NzU2lnbmluZyIsImF1dGhVcGxvYWREZXZpY2VTaWduaW5nS2V5cyIsIl9kb0Jvb3RzdHJhcFVJQXV0aCIsIm9uRmluaXNoZWQiLCJlIiwiY29uc29sZSIsIl9xdWVyeUtleVVwbG9hZEF1dGgiLCJjb21wb25lbnREaWRNb3VudCIsIl9ib290c3RyYXBDcm9zc1NpZ25pbmciLCJ1cGxvYWREZXZpY2VTaWduaW5nS2V5cyIsImxvZyIsImRhdGEiLCJmbG93cyIsInNvbWUiLCJmIiwic3RhZ2VzIiwibGVuZ3RoIiwicmVuZGVy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QUFTLEVBQUUsS0FIZjtBQUlJLE1BQUEsVUFBVSxFQUFFO0FBSmhCLG9CQU1JLDBDQUNLZSxPQURMLENBTkosQ0FESjtBQVlIOztBQWxLcUUsQyxzREFDbkQ7QUFDZmhELEVBQUFBLGVBQWUsRUFBRWtELG1CQUFVQyxNQURaO0FBRWYzQyxFQUFBQSxVQUFVLEVBQUUwQyxtQkFBVUU7QUFGUCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgeyBTU09BdXRoRW50cnkgfSBmcm9tICcuLi8uLi9hdXRoL0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50cyc7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tICcuLi8uLi9lbGVtZW50cy9EaWFsb2dCdXR0b25zJztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gJy4uL0Jhc2VEaWFsb2cnO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSAnLi4vLi4vZWxlbWVudHMvU3Bpbm5lcic7XG5pbXBvcnQgSW50ZXJhY3RpdmVBdXRoRGlhbG9nIGZyb20gJy4uL0ludGVyYWN0aXZlQXV0aERpYWxvZyc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLypcbiAqIFdhbGtzIHRoZSB1c2VyIHRocm91Z2ggdGhlIHByb2Nlc3Mgb2YgY3JlYXRpbmcgYSBjcm9zcy1zaWduaW5nIGtleXMuIEluIG1vc3RcbiAqIGNhc2VzLCBvbmx5IGEgc3Bpbm5lciBpcyBzaG93biwgYnV0IGZvciBtb3JlIGNvbXBsZXggYXV0aCBsaWtlIFNTTywgdGhlIHVzZXJcbiAqIG1heSBuZWVkIHRvIGNvbXBsZXRlIHNvbWUgc3RlcHMgdG8gcHJvY2VlZC5cbiAqL1xuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5zZWN1cml0eS5DcmVhdGVDcm9zc1NpZ25pbmdEaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENyZWF0ZUNyb3NzU2lnbmluZ0RpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGFjY291bnRQYXNzd29yZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgdG9rZW5Mb2dpbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAvLyBEb2VzIHRoZSBzZXJ2ZXIgb2ZmZXIgYSBVSSBhdXRoIGZsb3cgd2l0aCBqdXN0IG0ubG9naW4ucGFzc3dvcmRcbiAgICAgICAgICAgIC8vIGZvciAva2V5cy9kZXZpY2Vfc2lnbmluZy91cGxvYWQ/XG4gICAgICAgICAgICBjYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seTogbnVsbCxcbiAgICAgICAgICAgIGFjY291bnRQYXNzd29yZDogcHJvcHMuYWNjb3VudFBhc3N3b3JkIHx8IFwiXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGFjY291bnQgcGFzc3dvcmQgaW4gbWVtb3J5LCBsZXQncyBzaW1wbGlmeSBhbmRcbiAgICAgICAgICAgIC8vIGFzc3VtZSBpdCBtZWFucyBwYXNzd29yZCBhdXRoIGlzIGFsc28gc3VwcG9ydGVkIGZvciBkZXZpY2VcbiAgICAgICAgICAgIC8vIHNpZ25pbmcga2V5IHVwbG9hZCBhcyB3ZWxsLiBUaGlzIGF2b2lkcyBoaXR0aW5nIHRoZSBzZXJ2ZXIgdG9cbiAgICAgICAgICAgIC8vIHRlc3QgYXV0aCBmbG93cywgd2hpY2ggbWF5IGJlIHNsb3cgdW5kZXIgaGlnaCBsb2FkLlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9xdWVyeUtleVVwbG9hZEF1dGgoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9ib290c3RyYXBDcm9zc1NpZ25pbmcoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfcXVlcnlLZXlVcGxvYWRBdXRoKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnVwbG9hZERldmljZVNpZ25pbmdLZXlzKG51bGwsIHt9KTtcbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCBuZXZlciBnZXQgaGVyZTogdGhlIHNlcnZlciBzaG91bGQgYWx3YXlzIHJlcXVpcmVcbiAgICAgICAgICAgIC8vIFVJIGF1dGggdG8gdXBsb2FkIGRldmljZSBzaWduaW5nIGtleXMuIElmIHdlIGRvLCB3ZSB1cGxvYWRcbiAgICAgICAgICAgIC8vIG5vIGtleXMgd2hpY2ggd291bGQgYmUgYSBuby1vcC5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidXBsb2FkRGV2aWNlU2lnbmluZ0tleXMgdW5leHBlY3RlZGx5IHN1Y2NlZWRlZCB3aXRob3V0IFVJIGF1dGghXCIpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKCFlcnJvci5kYXRhIHx8ICFlcnJvci5kYXRhLmZsb3dzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ1cGxvYWREZXZpY2VTaWduaW5nS2V5cyBhZHZlcnRpc2VkIG5vIGZsb3dzIVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seSA9IGVycm9yLmRhdGEuZmxvd3Muc29tZShmID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZi5zdGFnZXMubGVuZ3RoID09PSAxICYmIGYuc3RhZ2VzWzBdID09PSAnbS5sb2dpbi5wYXNzd29yZCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZG9Cb290c3RyYXBVSUF1dGggPSBhc3luYyAobWFrZVJlcXVlc3QpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkgJiYgdGhpcy5zdGF0ZS5hY2NvdW50UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGF3YWl0IG1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbS5sb2dpbi5wYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgaWRlbnRpZmllcjoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbS5pZC51c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB1c2VyYCBvbmNlIHNlcnZlcnMgc3VwcG9ydCBwcm9wZXIgVUlBXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3N5bmFwc2UvaXNzdWVzLzU2NjVcbiAgICAgICAgICAgICAgICB1c2VyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCksXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50b2tlbkxvZ2luKSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgaG9waW5nIHRoZSBncmFjZSBwZXJpb2QgaXMgYWN0aXZlXG4gICAgICAgICAgICBhd2FpdCBtYWtlUmVxdWVzdCh7fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkaWFsb2dBZXN0aGV0aWNzID0ge1xuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSF06IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVXNlIFNpbmdsZSBTaWduIE9uIHRvIGNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBfdChcIlRvIGNvbnRpbnVlLCB1c2UgU2luZ2xlIFNpZ24gT24gdG8gcHJvdmUgeW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlVGV4dDogX3QoXCJTaW5nbGUgU2lnbiBPblwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcInByaW1hcnlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEhdOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkNvbmZpcm0gZW5jcnlwdGlvbiBzZXR1cFwiKSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogX3QoXCJDbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbmZpcm0gc2V0dGluZyB1cCBlbmNyeXB0aW9uLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIkNvbmZpcm1cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZDogXCJwcmltYXJ5XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXG4gICAgICAgICAgICAgICAgJ0Nyb3NzLXNpZ25pbmcga2V5cyBkaWFsb2cnLCAnJywgSW50ZXJhY3RpdmVBdXRoRGlhbG9nLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiU2V0dGluZyB1cCBrZXlzXCIpLFxuICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKSxcbiAgICAgICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgIGFlc3RoZXRpY3NGb3JTdGFnZVBoYXNlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5MT0dJTl9UWVBFXTogZGlhbG9nQWVzdGhldGljcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuVU5TVEFCTEVfTE9HSU5fVFlQRV06IGRpYWxvZ0Flc3RoZXRpY3MsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDcm9zcy1zaWduaW5nIGtleSB1cGxvYWQgYXV0aCBjYW5jZWxlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9ib290c3RyYXBDcm9zc1NpZ25pbmcgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2xpLmJvb3RzdHJhcENyb3NzU2lnbmluZyh7XG4gICAgICAgICAgICAgICAgYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzOiB0aGlzLl9kb0Jvb3RzdHJhcFVJQXV0aCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy50b2tlbkxvZ2luKSB7XG4gICAgICAgICAgICAgICAgLy8gaWdub3JlIGFueSBmYWlsdXJlcywgd2UgYXJlIHJlbHlpbmcgb24gZ3JhY2UgcGVyaW9kIGhlcmVcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZSB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBib290c3RyYXBwaW5nIGNyb3NzLXNpZ25pbmdcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcIlVuYWJsZSB0byBzZXQgdXAga2V5c1wiKX08L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnUmV0cnknKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9ib290c3RyYXBDcm9zc1NpZ25pbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNyb3NzU2lnbmluZ0RpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlNldHRpbmcgdXAga2V5c1wiKX1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==