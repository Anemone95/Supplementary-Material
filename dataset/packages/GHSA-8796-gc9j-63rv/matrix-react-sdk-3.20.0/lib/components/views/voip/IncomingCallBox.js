"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _CallHandler = _interopRequireDefault(require("../../../CallHandler"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _FormButton = _interopRequireDefault(require("../elements/FormButton"));

var _call = require("matrix-js-sdk/src/webrtc/call");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let IncomingCallBox = (_dec = (0, _replaceableComponent.replaceableComponent)("views.voip.IncomingCallBox"), _dec(_class = (_temp = class IncomingCallBox extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      switch (payload.action) {
        case 'call_state':
          {
            const call = _CallHandler.default.sharedInstance().getCallForRoom(payload.room_id);

            if (call && call.state === _call.CallState.Ringing) {
              this.setState({
                incomingCall: call
              });
            } else {
              this.setState({
                incomingCall: null
              });
            }
          }
      }
    });
    (0, _defineProperty2.default)(this, "onAnswerClick", e => {
      e.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'answer',
        room_id: _CallHandler.default.sharedInstance().roomIdForCall(this.state.incomingCall)
      });
    });
    (0, _defineProperty2.default)(this, "onRejectClick", e => {
      e.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'reject',
        room_id: _CallHandler.default.sharedInstance().roomIdForCall(this.state.incomingCall)
      });
    });
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.state = {
      incomingCall: null
    };
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  render() {
    if (!this.state.incomingCall) {
      return null;
    }

    let room = null;

    if (this.state.incomingCall) {
      room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(_CallHandler.default.sharedInstance().roomIdForCall(this.state.incomingCall));
    }

    const caller = room ? room.name : (0, _languageHandler._t)("Unknown caller");
    let incomingCallText = null;

    if (this.state.incomingCall) {
      if (this.state.incomingCall.type === "voice") {
        incomingCallText = (0, _languageHandler._t)("Incoming voice call");
      } else if (this.state.incomingCall.type === "video") {
        incomingCallText = (0, _languageHandler._t)("Incoming video call");
      } else {
        incomingCallText = (0, _languageHandler._t)("Incoming call");
      }
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_IncomingCallBox"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_IncomingCallBox_CallerInfo"
    }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      height: 32,
      width: 32
    }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, caller), /*#__PURE__*/_react.default.createElement("p", null, incomingCallText))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_IncomingCallBox_buttons"
    }, /*#__PURE__*/_react.default.createElement(_FormButton.default, {
      className: "mx_IncomingCallBox_decline",
      onClick: this.onRejectClick,
      kind: "danger",
      label: (0, _languageHandler._t)("Decline")
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_IncomingCallBox_spacer"
    }), /*#__PURE__*/_react.default.createElement(_FormButton.default, {
      className: "mx_IncomingCallBox_accept",
      onClick: this.onAnswerClick,
      kind: "primary",
      label: (0, _languageHandler._t)("Accept")
    })));
  }

}, _temp)) || _class);
exports.default = IncomingCallBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvSW5jb21pbmdDYWxsQm94LnRzeCJdLCJuYW1lcyI6WyJJbmNvbWluZ0NhbGxCb3giLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwYXlsb2FkIiwiYWN0aW9uIiwiY2FsbCIsIkNhbGxIYW5kbGVyIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRDYWxsRm9yUm9vbSIsInJvb21faWQiLCJzdGF0ZSIsIkNhbGxTdGF0ZSIsIlJpbmdpbmciLCJzZXRTdGF0ZSIsImluY29taW5nQ2FsbCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJkaXMiLCJkaXNwYXRjaCIsInJvb21JZEZvckNhbGwiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsInJlbmRlciIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwiY2FsbGVyIiwibmFtZSIsImluY29taW5nQ2FsbFRleHQiLCJ0eXBlIiwib25SZWplY3RDbGljayIsIm9uQW5zd2VyQ2xpY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBVXFCQSxlLFdBRHBCLGdEQUFxQiw0QkFBckIsQyx5QkFBRCxNQUNxQkEsZUFEckIsU0FDNkNDLGVBQU1DO0FBRG5EO0FBQzZFO0FBR3pFQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFnQjtBQUN2QixVQUFNQSxLQUFOO0FBRHVCO0FBQUEsb0RBYVIsQ0FBQ0M7QUFBRDtBQUFBLFNBQTRCO0FBQzNDLGNBQVFBLE9BQU8sQ0FBQ0MsTUFBaEI7QUFDSSxhQUFLLFlBQUw7QUFBbUI7QUFDZixrQkFBTUMsSUFBSSxHQUFHQyxxQkFBWUMsY0FBWixHQUE2QkMsY0FBN0IsQ0FBNENMLE9BQU8sQ0FBQ00sT0FBcEQsQ0FBYjs7QUFDQSxnQkFBSUosSUFBSSxJQUFJQSxJQUFJLENBQUNLLEtBQUwsS0FBZUMsZ0JBQVVDLE9BQXJDLEVBQThDO0FBQzFDLG1CQUFLQyxRQUFMLENBQWM7QUFDVkMsZ0JBQUFBLFlBQVksRUFBRVQ7QUFESixlQUFkO0FBR0gsYUFKRCxNQUlPO0FBQ0gsbUJBQUtRLFFBQUwsQ0FBYztBQUNWQyxnQkFBQUEsWUFBWSxFQUFFO0FBREosZUFBZDtBQUdIO0FBQ0o7QUFaTDtBQWNILEtBNUIwQjtBQUFBLHlEQThCdUJDLENBQUQsSUFBTztBQUNwREEsTUFBQUEsQ0FBQyxDQUFDQyxlQUFGOztBQUNBQywwQkFBSUMsUUFBSixDQUFhO0FBQ1RkLFFBQUFBLE1BQU0sRUFBRSxRQURDO0FBRVRLLFFBQUFBLE9BQU8sRUFBRUgscUJBQVlDLGNBQVosR0FBNkJZLGFBQTdCLENBQTJDLEtBQUtULEtBQUwsQ0FBV0ksWUFBdEQ7QUFGQSxPQUFiO0FBSUgsS0FwQzBCO0FBQUEseURBc0N1QkMsQ0FBRCxJQUFPO0FBQ3BEQSxNQUFBQSxDQUFDLENBQUNDLGVBQUY7O0FBQ0FDLDBCQUFJQyxRQUFKLENBQWE7QUFDVGQsUUFBQUEsTUFBTSxFQUFFLFFBREM7QUFFVEssUUFBQUEsT0FBTyxFQUFFSCxxQkFBWUMsY0FBWixHQUE2QlksYUFBN0IsQ0FBMkMsS0FBS1QsS0FBTCxDQUFXSSxZQUF0RDtBQUZBLE9BQWI7QUFJSCxLQTVDMEI7QUFHdkIsU0FBS00sYUFBTCxHQUFxQkgsb0JBQUlJLFFBQUosQ0FBYSxLQUFLQyxRQUFsQixDQUFyQjtBQUNBLFNBQUtaLEtBQUwsR0FBYTtBQUNUSSxNQUFBQSxZQUFZLEVBQUU7QUFETCxLQUFiO0FBR0g7O0FBRU1TLEVBQUFBLG9CQUFQLEdBQThCO0FBQzFCTix3QkFBSU8sVUFBSixDQUFlLEtBQUtKLGFBQXBCO0FBQ0g7O0FBbUNNSyxFQUFBQSxNQUFQLEdBQWdCO0FBQ1osUUFBSSxDQUFDLEtBQUtmLEtBQUwsQ0FBV0ksWUFBaEIsRUFBOEI7QUFDMUIsYUFBTyxJQUFQO0FBQ0g7O0FBRUQsUUFBSVksSUFBSSxHQUFHLElBQVg7O0FBQ0EsUUFBSSxLQUFLaEIsS0FBTCxDQUFXSSxZQUFmLEVBQTZCO0FBQ3pCWSxNQUFBQSxJQUFJLEdBQUdDLGlDQUFnQkMsR0FBaEIsR0FBc0JDLE9BQXRCLENBQThCdkIscUJBQVlDLGNBQVosR0FBNkJZLGFBQTdCLENBQTJDLEtBQUtULEtBQUwsQ0FBV0ksWUFBdEQsQ0FBOUIsQ0FBUDtBQUNIOztBQUVELFVBQU1nQixNQUFNLEdBQUdKLElBQUksR0FBR0EsSUFBSSxDQUFDSyxJQUFSLEdBQWUseUJBQUcsZ0JBQUgsQ0FBbEM7QUFFQSxRQUFJQyxnQkFBZ0IsR0FBRyxJQUF2Qjs7QUFDQSxRQUFJLEtBQUt0QixLQUFMLENBQVdJLFlBQWYsRUFBNkI7QUFDekIsVUFBSSxLQUFLSixLQUFMLENBQVdJLFlBQVgsQ0FBd0JtQixJQUF4QixLQUFpQyxPQUFyQyxFQUE4QztBQUMxQ0QsUUFBQUEsZ0JBQWdCLEdBQUcseUJBQUcscUJBQUgsQ0FBbkI7QUFDSCxPQUZELE1BRU8sSUFBSSxLQUFLdEIsS0FBTCxDQUFXSSxZQUFYLENBQXdCbUIsSUFBeEIsS0FBaUMsT0FBckMsRUFBOEM7QUFDakRELFFBQUFBLGdCQUFnQixHQUFHLHlCQUFHLHFCQUFILENBQW5CO0FBQ0gsT0FGTSxNQUVBO0FBQ0hBLFFBQUFBLGdCQUFnQixHQUFHLHlCQUFHLGVBQUgsQ0FBbkI7QUFDSDtBQUNKOztBQUVELHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMsbUJBQUQ7QUFDSSxNQUFBLElBQUksRUFBRU4sSUFEVjtBQUVJLE1BQUEsTUFBTSxFQUFFLEVBRlo7QUFHSSxNQUFBLEtBQUssRUFBRTtBQUhYLE1BREosZUFNSSx1REFDSSx5Q0FBS0ksTUFBTCxDQURKLGVBRUksd0NBQUlFLGdCQUFKLENBRkosQ0FOSixDQURHLGVBWUg7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLG1CQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUUsNEJBRGY7QUFFSSxNQUFBLE9BQU8sRUFBRSxLQUFLRSxhQUZsQjtBQUdJLE1BQUEsSUFBSSxFQUFDLFFBSFQ7QUFJSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxTQUFIO0FBSlgsTUFESixlQU9JO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixNQVBKLGVBUUksNkJBQUMsbUJBQUQ7QUFDSSxNQUFBLFNBQVMsRUFBRSwyQkFEZjtBQUVJLE1BQUEsT0FBTyxFQUFFLEtBQUtDLGFBRmxCO0FBR0ksTUFBQSxJQUFJLEVBQUMsU0FIVDtBQUlJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLFFBQUg7QUFKWCxNQVJKLENBWkcsQ0FBUDtBQTRCSDs7QUFwR3dFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzJztcbmltcG9ydCBDYWxsSGFuZGxlciBmcm9tICcuLi8uLi8uLi9DYWxsSGFuZGxlcic7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tICcuLi9hdmF0YXJzL1Jvb21BdmF0YXInO1xuaW1wb3J0IEZvcm1CdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvRm9ybUJ1dHRvbic7XG5pbXBvcnQgeyBDYWxsU3RhdGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGluY29taW5nQ2FsbDogYW55O1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy52b2lwLkluY29taW5nQ2FsbEJveFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5jb21pbmdDYWxsQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpbmNvbWluZ0NhbGw6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdjYWxsX3N0YXRlJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGwgPSBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLmdldENhbGxGb3JSb29tKHBheWxvYWQucm9vbV9pZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGwgJiYgY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLlJpbmdpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNvbWluZ0NhbGw6IGNhbGwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5jb21pbmdDYWxsOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFuc3dlckNsaWNrOiBSZWFjdC5Nb3VzZUV2ZW50SGFuZGxlciA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdhbnN3ZXInLFxuICAgICAgICAgICAgcm9vbV9pZDogQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5yb29tSWRGb3JDYWxsKHRoaXMuc3RhdGUuaW5jb21pbmdDYWxsKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWplY3RDbGljazogUmVhY3QuTW91c2VFdmVudEhhbmRsZXIgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAncmVqZWN0JyxcbiAgICAgICAgICAgIHJvb21faWQ6IENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkucm9vbUlkRm9yQ2FsbCh0aGlzLnN0YXRlLmluY29taW5nQ2FsbCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaW5jb21pbmdDYWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByb29tID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaW5jb21pbmdDYWxsKSB7XG4gICAgICAgICAgICByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5yb29tSWRGb3JDYWxsKHRoaXMuc3RhdGUuaW5jb21pbmdDYWxsKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjYWxsZXIgPSByb29tID8gcm9vbS5uYW1lIDogX3QoXCJVbmtub3duIGNhbGxlclwiKTtcblxuICAgICAgICBsZXQgaW5jb21pbmdDYWxsVGV4dCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmluY29taW5nQ2FsbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaW5jb21pbmdDYWxsLnR5cGUgPT09IFwidm9pY2VcIikge1xuICAgICAgICAgICAgICAgIGluY29taW5nQ2FsbFRleHQgPSBfdChcIkluY29taW5nIHZvaWNlIGNhbGxcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaW5jb21pbmdDYWxsLnR5cGUgPT09IFwidmlkZW9cIikge1xuICAgICAgICAgICAgICAgIGluY29taW5nQ2FsbFRleHQgPSBfdChcIkluY29taW5nIHZpZGVvIGNhbGxcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluY29taW5nQ2FsbFRleHQgPSBfdChcIkluY29taW5nIGNhbGxcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9JbmNvbWluZ0NhbGxCb3hcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW5jb21pbmdDYWxsQm94X0NhbGxlckluZm9cIj5cbiAgICAgICAgICAgICAgICA8Um9vbUF2YXRhclxuICAgICAgICAgICAgICAgICAgICByb29tPXtyb29tfVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezMyfVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17MzJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDE+e2NhbGxlcn08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8cD57aW5jb21pbmdDYWxsVGV4dH08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW5jb21pbmdDYWxsQm94X2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8Rm9ybUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e1wibXhfSW5jb21pbmdDYWxsQm94X2RlY2xpbmVcIn1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlamVjdENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRGVjbGluZVwiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW5jb21pbmdDYWxsQm94X3NwYWNlclwiIC8+XG4gICAgICAgICAgICAgICAgPEZvcm1CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtcIm14X0luY29taW5nQ2FsbEJveF9hY2NlcHRcIn1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkFuc3dlckNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkFjY2VwdFwiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG5cbiJdfQ==