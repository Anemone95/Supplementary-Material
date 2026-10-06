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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
class IncomingCallBox extends _react.default.Component
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
        room_id: _CallHandler.default.roomIdForCall(this.state.incomingCall)
      });
    });
    (0, _defineProperty2.default)(this, "onRejectClick", e => {
      e.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'reject',
        room_id: _CallHandler.default.roomIdForCall(this.state.incomingCall)
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
      room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(_CallHandler.default.roomIdForCall(this.state.incomingCall));
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

}

exports.default = IncomingCallBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvSW5jb21pbmdDYWxsQm94LnRzeCJdLCJuYW1lcyI6WyJJbmNvbWluZ0NhbGxCb3giLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwYXlsb2FkIiwiYWN0aW9uIiwiY2FsbCIsIkNhbGxIYW5kbGVyIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRDYWxsRm9yUm9vbSIsInJvb21faWQiLCJzdGF0ZSIsIkNhbGxTdGF0ZSIsIlJpbmdpbmciLCJzZXRTdGF0ZSIsImluY29taW5nQ2FsbCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJkaXMiLCJkaXNwYXRjaCIsInJvb21JZEZvckNhbGwiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsInJlbmRlciIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwiY2FsbGVyIiwibmFtZSIsImluY29taW5nQ2FsbFRleHQiLCJ0eXBlIiwib25SZWplY3RDbGljayIsIm9uQW5zd2VyQ2xpY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbUJlLE1BQU1BLGVBQU4sU0FBOEJDLGVBQU1DO0FBQXBDO0FBQThEO0FBR3pFQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFnQjtBQUN2QixVQUFNQSxLQUFOO0FBRHVCO0FBQUEsb0RBYVIsQ0FBQ0M7QUFBRDtBQUFBLFNBQTRCO0FBQzNDLGNBQVFBLE9BQU8sQ0FBQ0MsTUFBaEI7QUFDSSxhQUFLLFlBQUw7QUFBbUI7QUFDZixr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QUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLG1CQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUUsNEJBRGY7QUFFSSxNQUFBLE9BQU8sRUFBRSxLQUFLRSxhQUZsQjtBQUdJLE1BQUEsSUFBSSxFQUFDLFFBSFQ7QUFJSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxTQUFIO0FBSlgsTUFESixlQU9JO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixNQVBKLGVBUUksNkJBQUMsbUJBQUQ7QUFDSSxNQUFBLFNBQVMsRUFBRSwyQkFEZjtBQUVJLE1BQUEsT0FBTyxFQUFFLEtBQUtDLGFBRmxCO0FBR0ksTUFBQSxJQUFJLEVBQUMsU0FIVDtBQUlJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLFFBQUg7QUFKWCxNQVJKLENBWkcsQ0FBUDtBQTRCSDs7QUFwR3dFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcyc7XG5pbXBvcnQgQ2FsbEhhbmRsZXIgZnJvbSAnLi4vLi4vLi4vQ2FsbEhhbmRsZXInO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSAnLi4vYXZhdGFycy9Sb29tQXZhdGFyJztcbmltcG9ydCBGb3JtQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0Zvcm1CdXR0b24nO1xuaW1wb3J0IHsgQ2FsbFN0YXRlIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGwnO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgaW5jb21pbmdDYWxsOiBhbnk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluY29taW5nQ2FsbEJveCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaW5jb21pbmdDYWxsOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnY2FsbF9zdGF0ZSc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRDYWxsRm9yUm9vbShwYXlsb2FkLnJvb21faWQpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsICYmIGNhbGwuc3RhdGUgPT09IENhbGxTdGF0ZS5SaW5naW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5jb21pbmdDYWxsOiBjYWxsLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY29taW5nQ2FsbDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BbnN3ZXJDbGljazogUmVhY3QuTW91c2VFdmVudEhhbmRsZXIgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHJvb21faWQ6IENhbGxIYW5kbGVyLnJvb21JZEZvckNhbGwodGhpcy5zdGF0ZS5pbmNvbWluZ0NhbGwpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlamVjdENsaWNrOiBSZWFjdC5Nb3VzZUV2ZW50SGFuZGxlciA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdyZWplY3QnLFxuICAgICAgICAgICAgcm9vbV9pZDogQ2FsbEhhbmRsZXIucm9vbUlkRm9yQ2FsbCh0aGlzLnN0YXRlLmluY29taW5nQ2FsbCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaW5jb21pbmdDYWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByb29tID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaW5jb21pbmdDYWxsKSB7XG4gICAgICAgICAgICByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oQ2FsbEhhbmRsZXIucm9vbUlkRm9yQ2FsbCh0aGlzLnN0YXRlLmluY29taW5nQ2FsbCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FsbGVyID0gcm9vbSA/IHJvb20ubmFtZSA6IF90KFwiVW5rbm93biBjYWxsZXJcIik7XG5cbiAgICAgICAgbGV0IGluY29taW5nQ2FsbFRleHQgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pbmNvbWluZ0NhbGwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmluY29taW5nQ2FsbC50eXBlID09PSBcInZvaWNlXCIpIHtcbiAgICAgICAgICAgICAgICBpbmNvbWluZ0NhbGxUZXh0ID0gX3QoXCJJbmNvbWluZyB2b2ljZSBjYWxsXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmluY29taW5nQ2FsbC50eXBlID09PSBcInZpZGVvXCIpIHtcbiAgICAgICAgICAgICAgICBpbmNvbWluZ0NhbGxUZXh0ID0gX3QoXCJJbmNvbWluZyB2aWRlbyBjYWxsXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmNvbWluZ0NhbGxUZXh0ID0gX3QoXCJJbmNvbWluZyBjYWxsXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfSW5jb21pbmdDYWxsQm94XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0luY29taW5nQ2FsbEJveF9DYWxsZXJJbmZvXCI+XG4gICAgICAgICAgICAgICAgPFJvb21BdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXszMn1cbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9ezMyfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGgxPntjYWxsZXJ9PC9oMT5cbiAgICAgICAgICAgICAgICAgICAgPHA+e2luY29taW5nQ2FsbFRleHR9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0luY29taW5nQ2FsbEJveF9idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPEZvcm1CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtcIm14X0luY29taW5nQ2FsbEJveF9kZWNsaW5lXCJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZWplY3RDbGlja31cbiAgICAgICAgICAgICAgICAgICAga2luZD1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkRlY2xpbmVcIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0luY29taW5nQ2FsbEJveF9zcGFjZXJcIiAvPlxuICAgICAgICAgICAgICAgIDxGb3JtQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17XCJteF9JbmNvbWluZ0NhbGxCb3hfYWNjZXB0XCJ9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BbnN3ZXJDbGlja31cbiAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJBY2NlcHRcIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG4iXX0=