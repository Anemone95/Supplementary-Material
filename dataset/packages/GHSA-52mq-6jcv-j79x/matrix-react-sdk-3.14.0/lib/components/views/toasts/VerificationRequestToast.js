"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
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
class VerificationRequestToast extends _react.default.PureComponent
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
            verificationRequest: request
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

      this.setState({
        device: cli.getStoredDevice(cli.getUserId(), request.channel.deviceId)
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
    let nameLabel;

    if (request.isSelfVerification) {
      if (this.state.device) {
        nameLabel = (0, _languageHandler._t)("From %(deviceName)s (%(deviceId)s)", {
          deviceName: this.state.device.getDisplayName(),
          deviceId: this.state.device.deviceId
        });
      }
    } else {
      const userId = request.otherUserId;
      const roomId = request.channel.roomId;
      nameLabel = roomId ? (0, _KeyVerificationStateObserver.userLabelForEventRoom)(userId, roomId) : userId; // for legacy to_device verification requests

      if (nameLabel === userId) {
        const client = _MatrixClientPeg.MatrixClientPeg.get();

        const user = client.getUser(userId);

        if (user && user.displayName) {
          nameLabel = (0, _languageHandler._t)("%(name)s (%(userId)s)", {
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
      description: nameLabel,
      acceptLabel: (0, _languageHandler._t)("Accept"),
      onAccept: this.accept,
      rejectLabel: declineLabel,
      onReject: this.cancel
    });
  }

}

exports.default = VerificationRequestToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3RvYXN0cy9WZXJpZmljYXRpb25SZXF1ZXN0VG9hc3QudHN4Il0sIm5hbWVzIjpbIlZlcmlmaWNhdGlvblJlcXVlc3RUb2FzdCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJyZXF1ZXN0IiwiY2FuQWNjZXB0IiwiVG9hc3RTdG9yZSIsInNoYXJlZEluc3RhbmNlIiwiZGlzbWlzc1RvYXN0IiwidG9hc3RLZXkiLCJjYW5jZWwiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjaGFubmVsIiwicm9vbUlkIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyb29tX2lkIiwic2hvdWxkX3BlZWsiLCJBY3Rpb24iLCJTZXRSaWdodFBhbmVsUGhhc2UiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJFbmNyeXB0aW9uUGFuZWwiLCJyZWZpcmVQYXJhbXMiLCJ2ZXJpZmljYXRpb25SZXF1ZXN0IiwibWVtYmVyIiwiZ2V0VXNlciIsIm90aGVyVXNlcklkIiwiVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsImFjY2VwdCIsIm1lc3NhZ2UiLCJzdGF0ZSIsImNvdW50ZXIiLCJNYXRoIiwiY2VpbCIsInRpbWVvdXQiLCJjb21wb25lbnREaWRNb3VudCIsImludGVydmFsSGFuZGxlIiwic2V0SW50ZXJ2YWwiLCJtYXgiLCJzZXRTdGF0ZSIsIm9uIiwiX2NoZWNrUmVxdWVzdElzUGVuZGluZyIsImlzU2VsZlZlcmlmaWNhdGlvbiIsImRldmljZSIsImdldFN0b3JlZERldmljZSIsImdldFVzZXJJZCIsImRldmljZUlkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJjbGVhckludGVydmFsIiwib2ZmIiwicmVuZGVyIiwibmFtZUxhYmVsIiwiZGV2aWNlTmFtZSIsImdldERpc3BsYXlOYW1lIiwidXNlcklkIiwiY2xpZW50IiwidXNlciIsImRpc3BsYXlOYW1lIiwibmFtZSIsImRlY2xpbmVMYWJlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNEJlLE1BQU1BLHdCQUFOLFNBQXVDQyxlQUFNQztBQUE3QztBQUEyRTtBQUd0RkMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGU7QUFBQSxrRUFtQ00sTUFBTTtBQUMzQixZQUFNO0FBQUNDLFFBQUFBO0FBQUQsVUFBWSxLQUFLRCxLQUF2Qjs7QUFDQSxVQUFJLENBQUNDLE9BQU8sQ0FBQ0MsU0FBYixFQUF3QjtBQUNwQkMsNEJBQVdDLGNBQVgsR0FBNEJDLFlBQTVCLENBQXlDLEtBQUtMLEtBQUwsQ0FBV00sUUFBcEQ7QUFDSDtBQUNKLEtBeENrQjtBQUFBLGtEQTBDVixNQUFNO0FBQ1hILDBCQUFXQyxjQUFYLEdBQTRCQyxZQUE1QixDQUF5QyxLQUFLTCxLQUFMLENBQVdNLFFBQXBEOztBQUNBLFVBQUk7QUFDQSxhQUFLTixLQUFMLENBQVdDLE9BQVgsQ0FBbUJNLE1BQW5CO0FBQ0gsT0FGRCxDQUVFLE9BQU9DLEdBQVAsRUFBWTtBQUNWQyxRQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FBYyw2Q0FBZCxFQUE2REYsR0FBN0Q7QUFDSDtBQUNKLEtBakRrQjtBQUFBLGtEQW1EVixZQUFZO0FBQ2pCTCwwQkFBV0MsY0FBWCxHQUE0QkMsWUFBNUIsQ0FBeUMsS0FBS0wsS0FBTCxDQUFXTSxRQUFwRDs7QUFDQSxZQUFNO0FBQUNMLFFBQUFBO0FBQUQsVUFBWSxLQUFLRCxLQUF2QixDQUZp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WjtBQUNIO0FBQ0o7QUFDSjs7QUFDRCxVQUFNSyxZQUFZLEdBQUcsS0FBSzdCLEtBQUwsQ0FBV0MsT0FBWCxLQUF1QixDQUF2QixHQUNqQix5QkFBRyxTQUFILENBRGlCLEdBRWpCLHlCQUFHLHVCQUFILEVBQTRCO0FBQUNBLE1BQUFBLE9BQU8sRUFBRSxLQUFLRCxLQUFMLENBQVdDO0FBQXJCLEtBQTVCLENBRko7QUFJQSx3QkFBTyw2QkFBQyxxQkFBRDtBQUNILE1BQUEsV0FBVyxFQUFFb0IsU0FEVjtBQUVILE1BQUEsV0FBVyxFQUFFLHlCQUFHLFFBQUgsQ0FGVjtBQUdILE1BQUEsUUFBUSxFQUFFLEtBQUt2QixNQUhaO0FBSUgsTUFBQSxXQUFXLEVBQUUrQixZQUpWO0FBS0gsTUFBQSxRQUFRLEVBQUUsS0FBSzVEO0FBTFosTUFBUDtBQU9IOztBQXhIcUYiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge1JpZ2h0UGFuZWxQaGFzZXN9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlUGhhc2VzXCI7XG5pbXBvcnQge1NldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWR9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1NldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWRcIlxuaW1wb3J0IHt1c2VyTGFiZWxGb3JFdmVudFJvb219IGZyb20gXCIuLi8uLi8uLi91dGlscy9LZXlWZXJpZmljYXRpb25TdGF0ZU9ic2VydmVyXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBUb2FzdFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVG9hc3RTdG9yZVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEdlbmVyaWNUb2FzdCBmcm9tIFwiLi9HZW5lcmljVG9hc3RcIjtcbmltcG9ydCB7VmVyaWZpY2F0aW9uUmVxdWVzdH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vcmVxdWVzdC9WZXJpZmljYXRpb25SZXF1ZXN0XCI7XG5pbXBvcnQge0RldmljZUluZm99IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vZGV2aWNlaW5mb1wiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdG9hc3RLZXk6IHN0cmluZztcbiAgICByZXF1ZXN0OiBWZXJpZmljYXRpb25SZXF1ZXN0O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBjb3VudGVyOiBudW1iZXI7XG4gICAgZGV2aWNlPzogRGV2aWNlSW5mbztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVyaWZpY2F0aW9uUmVxdWVzdFRvYXN0IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgaW50ZXJ2YWxIYW5kbGU6IE5vZGVKUy5UaW1lb3V0O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge2NvdW50ZXI6IE1hdGguY2VpbChwcm9wcy5yZXF1ZXN0LnRpbWVvdXQgLyAxMDAwKX07XG4gICAgfVxuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHtyZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmIChyZXF1ZXN0LnRpbWVvdXQgJiYgcmVxdWVzdC50aW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbEhhbmRsZSA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQge2NvdW50ZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgICAgICBjb3VudGVyID0gTWF0aC5tYXgoMCwgY291bnRlciAtIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvdW50ZXJ9KTtcbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3Qub24oXCJjaGFuZ2VcIiwgdGhpcy5fY2hlY2tSZXF1ZXN0SXNQZW5kaW5nKTtcbiAgICAgICAgLy8gV2Ugc2hvdWxkIHByb2JhYmx5IGhhdmUgYSBzZXBhcmF0ZSBjbGFzcyBtYW5hZ2luZyB0aGUgYWN0aXZlIHZlcmlmaWNhdGlvbiB0b2FzdHMsXG4gICAgICAgIC8vIHJhdGhlciB0aGFuIG1vbml0b3JpbmcgdGhpcyBpbiB0aGUgdG9hc3QgY29tcG9uZW50IGl0c2VsZiwgc2luY2Ugd2UnbGwgZ2V0IHByb2JsZW1zXG4gICAgICAgIC8vIGxpa2UgdGhlIHRvYXNkdCBub3QgZ29pbmcgYXdheSB3aGVuIHRoZSB2ZXJpZmljYXRpb24gaXMgY2FuY2VsbGVkIHVubGVzcyBpdCdzIHRoZVxuICAgICAgICAvLyBvbmUgb24gdGhlIHRvcCAoaWUuIHRoZSBvbmUgdGhhdCdzIG1vdW50ZWQpLlxuICAgICAgICAvLyBBcyBhIHF1aWNrICYgZGlydHkgZml4LCBjaGVjayB0aGUgdG9hc3QgaXMgc3RpbGwgcmVsZXZhbnQgd2hlbiBpdCBtb3VudHMgKHRoaXMgcHJldmVudHNcbiAgICAgICAgLy8gYSB0b2FzdCBoYW5naW5nIGFyb3VuZCBhZnRlciBsb2dnaW5nIGluIGlmIHlvdSBkaWQgYSB2ZXJpZmljYXRpb24gYXMgcGFydCBvZiBsb2dpbikuXG4gICAgICAgIHRoaXMuX2NoZWNrUmVxdWVzdElzUGVuZGluZygpO1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGV2aWNlOiBjbGkuZ2V0U3RvcmVkRGV2aWNlKGNsaS5nZXRVc2VySWQoKSwgcmVxdWVzdC5jaGFubmVsLmRldmljZUlkKX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbEhhbmRsZSk7XG4gICAgICAgIGNvbnN0IHtyZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJlcXVlc3Qub2ZmKFwiY2hhbmdlXCIsIHRoaXMuX2NoZWNrUmVxdWVzdElzUGVuZGluZyk7XG4gICAgfVxuXG4gICAgX2NoZWNrUmVxdWVzdElzUGVuZGluZyA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qge3JlcXVlc3R9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKCFyZXF1ZXN0LmNhbkFjY2VwdCkge1xuICAgICAgICAgICAgVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLmRpc21pc3NUb2FzdCh0aGlzLnByb3BzLnRvYXN0S2V5KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5kaXNtaXNzVG9hc3QodGhpcy5wcm9wcy50b2FzdEtleSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoaWxlIGNhbmNlbGxpbmcgdmVyaWZpY2F0aW9uIHJlcXVlc3RcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhY2NlcHQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5kaXNtaXNzVG9hc3QodGhpcy5wcm9wcy50b2FzdEtleSk7XG4gICAgICAgIGNvbnN0IHtyZXF1ZXN0fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIC8vIG5vIHJvb20gaWQgZm9yIHRvX2RldmljZSByZXF1ZXN0c1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5jaGFubmVsLnJvb21JZCkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJlcXVlc3QuY2hhbm5lbC5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZF9wZWVrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8U2V0UmlnaHRQYW5lbFBoYXNlUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICAgICAgICAgIHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgcmVmaXJlUGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25SZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyOiBjbGkuZ2V0VXNlcihyZXF1ZXN0Lm90aGVyVXNlcklkKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgVmVyaWZpY2F0aW9uUmVxdWVzdERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLlZlcmlmaWNhdGlvblJlcXVlc3REaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnSW5jb21pbmcgVmVyaWZpY2F0aW9uJywgJycsIFZlcmlmaWNhdGlvblJlcXVlc3REaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uUmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgICAgICAgICB9LCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHJlcXVlc3QuYWNjZXB0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7cmVxdWVzdH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBsZXQgbmFtZUxhYmVsO1xuICAgICAgICBpZiAocmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmRldmljZSkge1xuICAgICAgICAgICAgICAgIG5hbWVMYWJlbCA9IF90KFwiRnJvbSAlKGRldmljZU5hbWUpcyAoJShkZXZpY2VJZClzKVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldmljZU5hbWU6IHRoaXMuc3RhdGUuZGV2aWNlLmdldERpc3BsYXlOYW1lKCksXG4gICAgICAgICAgICAgICAgICAgIGRldmljZUlkOiB0aGlzLnN0YXRlLmRldmljZS5kZXZpY2VJZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHJlcXVlc3Qub3RoZXJVc2VySWQ7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSByZXF1ZXN0LmNoYW5uZWwucm9vbUlkO1xuICAgICAgICAgICAgbmFtZUxhYmVsID0gcm9vbUlkID8gdXNlckxhYmVsRm9yRXZlbnRSb29tKHVzZXJJZCwgcm9vbUlkKSA6IHVzZXJJZDtcbiAgICAgICAgICAgIC8vIGZvciBsZWdhY3kgdG9fZGV2aWNlIHZlcmlmaWNhdGlvbiByZXF1ZXN0c1xuICAgICAgICAgICAgaWYgKG5hbWVMYWJlbCA9PT0gdXNlcklkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBjbGllbnQuZ2V0VXNlcih1c2VySWQpO1xuICAgICAgICAgICAgICAgIGlmICh1c2VyICYmIHVzZXIuZGlzcGxheU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZUxhYmVsID0gX3QoXCIlKG5hbWUpcyAoJSh1c2VySWQpcylcIiwge25hbWU6IHVzZXIuZGlzcGxheU5hbWUsIHVzZXJJZH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWNsaW5lTGFiZWwgPSB0aGlzLnN0YXRlLmNvdW50ZXIgPT09IDAgP1xuICAgICAgICAgICAgX3QoXCJEZWNsaW5lXCIpIDpcbiAgICAgICAgICAgIF90KFwiRGVjbGluZSAoJShjb3VudGVyKXMpXCIsIHtjb3VudGVyOiB0aGlzLnN0YXRlLmNvdW50ZXJ9KTtcblxuICAgICAgICByZXR1cm4gPEdlbmVyaWNUb2FzdFxuICAgICAgICAgICAgZGVzY3JpcHRpb249e25hbWVMYWJlbH1cbiAgICAgICAgICAgIGFjY2VwdExhYmVsPXtfdChcIkFjY2VwdFwiKX1cbiAgICAgICAgICAgIG9uQWNjZXB0PXt0aGlzLmFjY2VwdH1cbiAgICAgICAgICAgIHJlamVjdExhYmVsPXtkZWNsaW5lTGFiZWx9XG4gICAgICAgICAgICBvblJlamVjdD17dGhpcy5jYW5jZWx9XG4gICAgICAgIC8+O1xuICAgIH1cbn1cbiJdfQ==