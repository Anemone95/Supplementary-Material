"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _RightPanelStorePhases = require("../../../stores/RightPanelStorePhases");

var _KeyVerificationStateObserver = require("../../../utils/KeyVerificationStateObserver");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _ToastStore = _interopRequireDefault(require("../../../stores/ToastStore"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _GenericToast = _interopRequireDefault(require("./GenericToast"));

var _actions = require("../../../dispatcher/actions");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let VerificationRequestToast = (_dec = (0, _replaceableComponent.replaceableComponent)("views.toasts.VerificationRequestToast"), _dec(_class = (_temp = class VerificationRequestToast extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "intervalHandle", void 0);
    (0, _defineProperty2.default)(this, "_checkRequestIsPending", () => {
      const {
        request
      } = this.props;

      if (!request.canAccept) {
        _ToastStore.default.sharedInstance().dismissToast(this.props.toastKey);
      }
    });
    (0, _defineProperty2.default)(this, "cancel", () => {
      _ToastStore.default.sharedInstance().dismissToast(this.props.toastKey);

      try {
        this.props.request.cancel();
      } catch (err) {
        console.error("Error while cancelling verification request", err);
      }
    });
    (0, _defineProperty2.default)(this, "accept", async () => {
      _ToastStore.default.sharedInstance().dismissToast(this.props.toastKey);

      const {
        request
      } = this.props; // no room id for to_device requests

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        if (request.channel.roomId) {
          _dispatcher.default.dispatch({
            action: 'view_room',
            room_id: request.channel.roomId,
            should_peek: false
          });

          _dispatcher.default.dispatch({
            action: _actions.Action.SetRightPanelPhase,
            phase: _RightPanelStorePhases.RightPanelPhases.EncryptionPanel,
            refireParams: {
              verificationRequest: request,
              member: cli.getUser(request.otherUserId)
            }
          });
        } else {
          const VerificationRequestDialog = sdk.getComponent("views.dialogs.VerificationRequestDialog");

          _Modal.default.createTrackedDialog('Incoming Verification', '', VerificationRequestDialog, {
            verificationRequest: request,
            onFinished: () => {
              request.cancel();
            }
          }, null,
          /* priority = */
          false,
          /* static = */
          true);
        }

        await request.accept();
      } catch (err) {
        console.error(err.message);
      }
    });
    this.state = {
      counter: Math.ceil(props.request.timeout / 1000)
    };
  }

  async componentDidMount() {
    const {
      request
    } = this.props;

    if (request.timeout && request.timeout > 0) {
      this.intervalHandle = setInterval(() => {
        let {
          counter
        } = this.state;
        counter = Math.max(0, counter - 1);
        this.setState({
          counter
        });
      }, 1000);
    }

    request.on("change", this._checkRequestIsPending); // We should probably have a separate class managing the active verification toasts,
    // rather than monitoring this in the toast component itself, since we'll get problems
    // like the toasdt not going away when the verification is cancelled unless it's the
    // one on the top (ie. the one that's mounted).
    // As a quick & dirty fix, check the toast is still relevant when it mounts (this prevents
    // a toast hanging around after logging in if you did a verification as part of login).

    this._checkRequestIsPending();

    if (request.isSelfVerification) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const device = await cli.getDevice(request.channel.deviceId);
      const ip = device.last_seen_ip;
      this.setState({
        device: cli.getStoredDevice(cli.getUserId(), request.channel.deviceId),
        ip
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalHandle);
    const {
      request
    } = this.props;
    request.off("change", this._checkRequestIsPending);
  }

  render() {
    const {
      request
    } = this.props;
    let description;
    let detail;

    if (request.isSelfVerification) {
      if (this.state.device) {
        description = this.state.device.getDisplayName();
        detail = (0, _languageHandler._t)("%(deviceId)s from %(ip)s", {
          deviceId: this.state.device.deviceId,
          ip: this.state.ip
        });
      }
    } else {
      const userId = request.otherUserId;
      const roomId = request.channel.roomId;
      description = roomId ? (0, _KeyVerificationStateObserver.userLabelForEventRoom)(userId, roomId) : userId; // for legacy to_device verification requests

      if (description === userId) {
        const client = _MatrixClientPeg.MatrixClientPeg.get();

        const user = client.getUser(userId);

        if (user && user.displayName) {
          description = (0, _languageHandler._t)("%(name)s (%(userId)s)", {
            name: user.displayName,
            userId
          });
        }
      }
    }

    const declineLabel = this.state.counter === 0 ? (0, _languageHandler._t)("Decline") : (0, _languageHandler._t)("Decline (%(counter)s)", {
      counter: this.state.counter
    });
    return /*#__PURE__*/_react.default.createElement(_GenericToast.default, {
      description: description,
      detail: detail,
      acceptLabel: (0, _languageHandler._t)("Accept"),
      onAccept: this.accept,
      rejectLabel: declineLabel,
      onReject: this.cancel
    });
  }

}, _temp)) || _class);
exports.default = VerificationRequestToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3RvYXN0cy9WZXJpZmljYXRpb25SZXF1ZXN0VG9hc3QudHN4Il0sIm5hbWVzIjpbIlZlcmlmaWNhdGlvblJlcXVlc3RUb2FzdCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJyZXF1ZXN0IiwiY2FuQWNjZXB0IiwiVG9hc3RTdG9yZSIsInNoYXJlZEluc3RhbmNlIiwiZGlzbWlzc1RvYXN0IiwidG9hc3RLZXkiLCJjYW5jZWwiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjaGFubmVsIiwicm9vbUlkIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyb29tX2lkIiwic2hvdWxkX3BlZWsiLCJBY3Rpb24iLCJTZXRSaWdodFBhbmVsUGhhc2UiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJFbmNyeXB0aW9uUGFuZWwiLCJyZWZpcmVQYXJhbXMiLCJ2ZXJpZmljYXRpb25SZXF1ZXN0IiwibWVtYmVyIiwiZ2V0VXNlciIsIm90aGVyVXNlcklkIiwiVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIm9uRmluaXNoZWQiLCJhY2NlcHQiLCJtZXNzYWdlIiwic3RhdGUiLCJjb3VudGVyIiwiTWF0aCIsImNlaWwiLCJ0aW1lb3V0IiwiY29tcG9uZW50RGlkTW91bnQiLCJpbnRlcnZhbEhhbmRsZSIsInNldEludGVydmFsIiwibWF4Iiwic2V0U3RhdGUiLCJvbiIsIl9jaGVja1JlcXVlc3RJc1BlbmRpbmciLCJpc1NlbGZWZXJpZmljYXRpb24iLCJkZXZpY2UiLCJnZXREZXZpY2UiLCJkZXZpY2VJZCIsImlwIiwibGFzdF9zZWVuX2lwIiwiZ2V0U3RvcmVkRGV2aWNlIiwiZ2V0VXNlcklkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjbGVhckludGVydmFsIiwib2ZmIiwicmVuZGVyIiwiZGVzY3JpcHRpb24iLCJkZXRhaWwiLCJnZXREaXNwbGF5TmFtZSIsInVzZXJJZCIsImNsaWVudCIsInVzZXIiLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJkZWNsaW5lTGFiZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7Ozs7SUFjcUJBLHdCLFdBRHBCLGdEQUFxQix1Q0FBckIsQyx5QkFBRCxNQUNxQkEsd0JBRHJCLFNBQ3NEQyxlQUFNQztBQUQ1RDtBQUMwRjtBQUd0RkMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGU7QUFBQSxrRUF5Q00sTUFBTTtBQUMzQixZQUFNO0FBQUNDLFFBQUFBO0FBQUQsVUFBWSxLQUFLRCxLQUF2Qjs7QUFDQSxVQUFJLENBQUNDLE9BQU8sQ0FBQ0MsU0FBYixFQUF3QjtBQUNwQkMsNEJBQVdDLGNBQVgsR0FBNEJDLFlBQTVCLENBQXlDLEtBQUtMLEtBQUwsQ0FBV00sUUFBcEQ7QUFDSDtBQUNKLEtBOUNrQjtBQUFBLGtEQWdEVixNQUFNO0FBQ1hILDBCQUFXQyxjQUFYLEdBQTRCQyxZQUE1QixDQUF5QyxLQUFLTCxLQUFMLENBQVdNLFFBQXBEOztBQUNBLFVBQUk7QUFDQSxhQUFLTixLQUFMLENBQVdDLE9BQVgsQ0FBbUJNLE1BQW5CO0FBQ0gsT0FGRCxDQUVFLE9BQU9DLEdBQVAsRUFBWTtBQUNWQyxRQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FBYyw2Q0FBZCxFQUE2REYsR0FBN0Q7QUFDSDtBQUNKLEtBdkRrQjtBQUFBLGtEQXlEVixZQUFZO0FBQ2pCTCwwQkFBV0MsY0FBWCxHQUE0QkMsWUFBNUIsQ0FBeUMsS0FBS0wsS0FBTCxDQUFXTSxRQUFwRDs7QUFDQSxZQUFNO0FBQUNMLFFBQUFBO0FBQUQsVUFBWSxLQUFLRCxL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QUlILFdBQVcsS0FBS0csTUFBcEIsRUFBNEI7QUFDeEIsY0FBTUMsTUFBTSxHQUFHdkQsaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLGNBQU11RCxJQUFJLEdBQUdELE1BQU0sQ0FBQ3RDLE9BQVAsQ0FBZXFDLE1BQWYsQ0FBYjs7QUFDQSxZQUFJRSxJQUFJLElBQUlBLElBQUksQ0FBQ0MsV0FBakIsRUFBOEI7QUFDMUJOLFVBQUFBLFdBQVcsR0FBRyx5QkFBRyx1QkFBSCxFQUE0QjtBQUFDTyxZQUFBQSxJQUFJLEVBQUVGLElBQUksQ0FBQ0MsV0FBWjtBQUF5QkgsWUFBQUE7QUFBekIsV0FBNUIsQ0FBZDtBQUNIO0FBQ0o7QUFDSjs7QUFDRCxVQUFNSyxZQUFZLEdBQUcsS0FBS2hDLEtBQUwsQ0FBV0MsT0FBWCxLQUF1QixDQUF2QixHQUNqQix5QkFBRyxTQUFILENBRGlCLEdBRWpCLHlCQUFHLHVCQUFILEVBQTRCO0FBQUNBLE1BQUFBLE9BQU8sRUFBRSxLQUFLRCxLQUFMLENBQVdDO0FBQXJCLEtBQTVCLENBRko7QUFJQSx3QkFBTyw2QkFBQyxxQkFBRDtBQUNILE1BQUEsV0FBVyxFQUFFdUIsV0FEVjtBQUVILE1BQUEsTUFBTSxFQUFFQyxNQUZMO0FBR0gsTUFBQSxXQUFXLEVBQUUseUJBQUcsUUFBSCxDQUhWO0FBSUgsTUFBQSxRQUFRLEVBQUUsS0FBSzNCLE1BSlo7QUFLSCxNQUFBLFdBQVcsRUFBRWtDLFlBTFY7QUFNSCxNQUFBLFFBQVEsRUFBRSxLQUFLaEU7QUFOWixNQUFQO0FBUUg7O0FBcElxRixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge1JpZ2h0UGFuZWxQaGFzZXN9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlUGhhc2VzXCI7XG5pbXBvcnQge1NldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWR9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1NldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWRcIlxuaW1wb3J0IHt1c2VyTGFiZWxGb3JFdmVudFJvb219IGZyb20gXCIuLi8uLi8uLi91dGlscy9LZXlWZXJpZmljYXRpb25TdGF0ZU9ic2VydmVyXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBUb2FzdFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVG9hc3RTdG9yZVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEdlbmVyaWNUb2FzdCBmcm9tIFwiLi9HZW5lcmljVG9hc3RcIjtcbmltcG9ydCB7VmVyaWZpY2F0aW9uUmVxdWVzdH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vcmVxdWVzdC9WZXJpZmljYXRpb25SZXF1ZXN0XCI7XG5pbXBvcnQge0RldmljZUluZm99IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vZGV2aWNlaW5mb1wiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICB0b2FzdEtleTogc3RyaW5nO1xuICAgIHJlcXVlc3Q6IFZlcmlmaWNhdGlvblJlcXVlc3Q7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvdW50ZXI6IG51bWJlcjtcbiAgICBkZXZpY2U/OiBEZXZpY2VJbmZvO1xuICAgIGlwPzogc3RyaW5nO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy50b2FzdHMuVmVyaWZpY2F0aW9uUmVxdWVzdFRvYXN0XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJpZmljYXRpb25SZXF1ZXN0VG9hc3QgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBpbnRlcnZhbEhhbmRsZTogTm9kZUpTLlRpbWVvdXQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7Y291bnRlcjogTWF0aC5jZWlsKHByb3BzLnJlcXVlc3QudGltZW91dCAvIDEwMDApfTtcbiAgICB9XG5cbiAgICBhc3luYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3Qge3JlcXVlc3R9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKHJlcXVlc3QudGltZW91dCAmJiByZXF1ZXN0LnRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsSGFuZGxlID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB7Y291bnRlcn0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgPSBNYXRoLm1heCgwLCBjb3VudGVyIC0gMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y291bnRlcn0pO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdC5vbihcImNoYW5nZVwiLCB0aGlzLl9jaGVja1JlcXVlc3RJc1BlbmRpbmcpO1xuICAgICAgICAvLyBXZSBzaG91bGQgcHJvYmFibHkgaGF2ZSBhIHNlcGFyYXRlIGNsYXNzIG1hbmFnaW5nIHRoZSBhY3RpdmUgdmVyaWZpY2F0aW9uIHRvYXN0cyxcbiAgICAgICAgLy8gcmF0aGVyIHRoYW4gbW9uaXRvcmluZyB0aGlzIGluIHRoZSB0b2FzdCBjb21wb25lbnQgaXRzZWxmLCBzaW5jZSB3ZSdsbCBnZXQgcHJvYmxlbXNcbiAgICAgICAgLy8gbGlrZSB0aGUgdG9hc2R0IG5vdCBnb2luZyBhd2F5IHdoZW4gdGhlIHZlcmlmaWNhdGlvbiBpcyBjYW5jZWxsZWQgdW5sZXNzIGl0J3MgdGhlXG4gICAgICAgIC8vIG9uZSBvbiB0aGUgdG9wIChpZS4gdGhlIG9uZSB0aGF0J3MgbW91bnRlZCkuXG4gICAgICAgIC8vIEFzIGEgcXVpY2sgJiBkaXJ0eSBmaXgsIGNoZWNrIHRoZSB0b2FzdCBpcyBzdGlsbCByZWxldmFudCB3aGVuIGl0IG1vdW50cyAodGhpcyBwcmV2ZW50c1xuICAgICAgICAvLyBhIHRvYXN0IGhhbmdpbmcgYXJvdW5kIGFmdGVyIGxvZ2dpbmcgaW4gaWYgeW91IGRpZCBhIHZlcmlmaWNhdGlvbiBhcyBwYXJ0IG9mIGxvZ2luKS5cbiAgICAgICAgdGhpcy5fY2hlY2tSZXF1ZXN0SXNQZW5kaW5nKCk7XG5cblxuICAgICAgICBpZiAocmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IGF3YWl0IGNsaS5nZXREZXZpY2UocmVxdWVzdC5jaGFubmVsLmRldmljZUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGlwID0gZGV2aWNlLmxhc3Rfc2Vlbl9pcDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGRldmljZTogY2xpLmdldFN0b3JlZERldmljZShjbGkuZ2V0VXNlcklkKCksIHJlcXVlc3QuY2hhbm5lbC5kZXZpY2VJZCksXG4gICAgICAgICAgICAgICAgaXAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxIYW5kbGUpO1xuICAgICAgICBjb25zdCB7cmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICByZXF1ZXN0Lm9mZihcImNoYW5nZVwiLCB0aGlzLl9jaGVja1JlcXVlc3RJc1BlbmRpbmcpO1xuICAgIH1cblxuICAgIF9jaGVja1JlcXVlc3RJc1BlbmRpbmcgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtyZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmICghcmVxdWVzdC5jYW5BY2NlcHQpIHtcbiAgICAgICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5kaXNtaXNzVG9hc3QodGhpcy5wcm9wcy50b2FzdEtleSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY2FuY2VsID0gKCkgPT4ge1xuICAgICAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkuZGlzbWlzc1RvYXN0KHRoaXMucHJvcHMudG9hc3RLZXkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXF1ZXN0LmNhbmNlbCgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB3aGlsZSBjYW5jZWxsaW5nIHZlcmlmaWNhdGlvbiByZXF1ZXN0XCIsIGVycik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYWNjZXB0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkuZGlzbWlzc1RvYXN0KHRoaXMucHJvcHMudG9hc3RLZXkpO1xuICAgICAgICBjb25zdCB7cmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAvLyBubyByb29tIGlkIGZvciB0b19kZXZpY2UgcmVxdWVzdHNcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHJlcXVlc3QuY2hhbm5lbC5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByZXF1ZXN0LmNoYW5uZWwucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICBzaG91bGRfcGVlazogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFNldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uU2V0UmlnaHRQYW5lbFBoYXNlLFxuICAgICAgICAgICAgICAgICAgICBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWwsXG4gICAgICAgICAgICAgICAgICAgIHJlZmlyZVBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uUmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcjogY2xpLmdldFVzZXIocmVxdWVzdC5vdGhlclVzZXJJZCksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IFZlcmlmaWNhdGlvblJlcXVlc3REaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5WZXJpZmljYXRpb25SZXF1ZXN0RGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0luY29taW5nIFZlcmlmaWNhdGlvbicsICcnLCBWZXJpZmljYXRpb25SZXF1ZXN0RGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvblJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCByZXF1ZXN0LmFjY2VwdCgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3Qge3JlcXVlc3R9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uO1xuICAgICAgICBsZXQgZGV0YWlsO1xuICAgICAgICBpZiAocmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmRldmljZSkge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gdGhpcy5zdGF0ZS5kZXZpY2UuZ2V0RGlzcGxheU5hbWUoKTtcbiAgICAgICAgICAgICAgICBkZXRhaWwgPSBfdChcIiUoZGV2aWNlSWQpcyBmcm9tICUoaXApc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldmljZUlkOiB0aGlzLnN0YXRlLmRldmljZS5kZXZpY2VJZCxcbiAgICAgICAgICAgICAgICAgICAgaXA6IHRoaXMuc3RhdGUuaXAsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB1c2VySWQgPSByZXF1ZXN0Lm90aGVyVXNlcklkO1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gcmVxdWVzdC5jaGFubmVsLnJvb21JZDtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gcm9vbUlkID8gdXNlckxhYmVsRm9yRXZlbnRSb29tKHVzZXJJZCwgcm9vbUlkKSA6IHVzZXJJZDtcbiAgICAgICAgICAgIC8vIGZvciBsZWdhY3kgdG9fZGV2aWNlIHZlcmlmaWNhdGlvbiByZXF1ZXN0c1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0aW9uID09PSB1c2VySWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlciA9IGNsaWVudC5nZXRVc2VyKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXIgJiYgdXNlci5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiJShuYW1lKXMgKCUodXNlcklkKXMpXCIsIHtuYW1lOiB1c2VyLmRpc3BsYXlOYW1lLCB1c2VySWR9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVjbGluZUxhYmVsID0gdGhpcy5zdGF0ZS5jb3VudGVyID09PSAwID9cbiAgICAgICAgICAgIF90KFwiRGVjbGluZVwiKSA6XG4gICAgICAgICAgICBfdChcIkRlY2xpbmUgKCUoY291bnRlcilzKVwiLCB7Y291bnRlcjogdGhpcy5zdGF0ZS5jb3VudGVyfSk7XG5cbiAgICAgICAgcmV0dXJuIDxHZW5lcmljVG9hc3RcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtkZXNjcmlwdGlvbn1cbiAgICAgICAgICAgIGRldGFpbD17ZGV0YWlsfVxuICAgICAgICAgICAgYWNjZXB0TGFiZWw9e190KFwiQWNjZXB0XCIpfVxuICAgICAgICAgICAgb25BY2NlcHQ9e3RoaXMuYWNjZXB0fVxuICAgICAgICAgICAgcmVqZWN0TGFiZWw9e2RlY2xpbmVMYWJlbH1cbiAgICAgICAgICAgIG9uUmVqZWN0PXt0aGlzLmNhbmNlbH1cbiAgICAgICAgLz47XG4gICAgfVxufVxuIl19