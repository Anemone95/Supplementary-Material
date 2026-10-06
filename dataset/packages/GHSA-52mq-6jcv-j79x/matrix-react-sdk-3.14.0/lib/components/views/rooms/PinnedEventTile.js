"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MessageEvent = _interopRequireDefault(require("../messages/MessageEvent"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _languageHandler = require("../../../languageHandler");

var _DateUtils = require("../../../DateUtils");

/*
Copyright 2017 Travis Ralston

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
class PinnedEventTile extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onTileClicked", () => {
      _dispatcher.default.dispatch({
        action: 'view_room',
        event_id: this.props.mxEvent.getId(),
        highlighted: true,
        room_id: this.props.mxEvent.getRoomId()
      });
    });
    (0, _defineProperty2.default)(this, "onUnpinClicked", () => {
      const pinnedEvents = this.props.mxRoom.currentState.getStateEvents("m.room.pinned_events", "");

      if (!pinnedEvents || !pinnedEvents.getContent().pinned) {
        // Nothing to do: already unpinned
        if (this.props.onUnpinned) this.props.onUnpinned();
      } else {
        const pinned = pinnedEvents.getContent().pinned;
        const index = pinned.indexOf(this.props.mxEvent.getId());

        if (index !== -1) {
          pinned.splice(index, 1);

          _MatrixClientPeg.MatrixClientPeg.get().sendStateEvent(this.props.mxRoom.roomId, 'm.room.pinned_events', {
            pinned
          }, '').then(() => {
            if (this.props.onUnpinned) this.props.onUnpinned();
          });
        } else if (this.props.onUnpinned) this.props.onUnpinned();
      }
    });
  }

  _canUnpin() {
    return this.props.mxRoom.currentState.mayClientSendStateEvent('m.room.pinned_events', _MatrixClientPeg.MatrixClientPeg.get());
  }

  render() {
    const sender = this.props.mxEvent.getSender(); // Get the latest sender profile rather than historical

    const senderProfile = this.props.mxRoom.getMember(sender);
    const avatarSize = 40;
    let unpinButton = null;

    if (this._canUnpin()) {
      unpinButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onUnpinClicked,
        className: "mx_PinnedEventTile_unpinButton"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../res/img/cancel-red.svg"),
        width: "8",
        height: "8",
        alt: (0, _languageHandler._t)('Unpin Message'),
        title: (0, _languageHandler._t)('Unpin Message')
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PinnedEventTile"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PinnedEventTile_actions"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_PinnedEventTile_gotoButton mx_textButton",
      onClick: this.onTileClicked
    }, (0, _languageHandler._t)("Jump to message")), unpinButton), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_PinnedEventTile_senderAvatar"
    }, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
      member: senderProfile,
      width: avatarSize,
      height: avatarSize,
      fallbackUserId: sender
    })), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_PinnedEventTile_sender"
    }, senderProfile ? senderProfile.name : sender), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_PinnedEventTile_timestamp"
    }, (0, _DateUtils.formatFullDate)(new Date(this.props.mxEvent.getTs()))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PinnedEventTile_message"
    }, /*#__PURE__*/_react.default.createElement(_MessageEvent.default, {
      mxEvent: this.props.mxEvent,
      className: "mx_PinnedEventTile_body",
      maxImageHeight: 150,
      onHeightChanged: () => {} // we need to give this, apparently

    })));
  }

}

exports.default = PinnedEventTile;
(0, _defineProperty2.default)(PinnedEventTile, "propTypes", {
  mxRoom: _propTypes.default.object.isRequired,
  mxEvent: _propTypes.default.object.isRequired,
  onUnpinned: _propTypes.default.func
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Bpbm5lZEV2ZW50VGlsZS5qcyJdLCJuYW1lcyI6WyJQaW5uZWRFdmVudFRpbGUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiZXZlbnRfaWQiLCJwcm9wcyIsIm14RXZlbnQiLCJnZXRJZCIsImhpZ2hsaWdodGVkIiwicm9vbV9pZCIsImdldFJvb21JZCIsInBpbm5lZEV2ZW50cyIsIm14Um9vbSIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsInBpbm5lZCIsIm9uVW5waW5uZWQiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzZW5kU3RhdGVFdmVudCIsInJvb21JZCIsInRoZW4iLCJfY2FuVW5waW4iLCJtYXlDbGllbnRTZW5kU3RhdGVFdmVudCIsInJlbmRlciIsInNlbmRlciIsImdldFNlbmRlciIsInNlbmRlclByb2ZpbGUiLCJnZXRNZW1iZXIiLCJhdmF0YXJTaXplIiwidW5waW5CdXR0b24iLCJvblVucGluQ2xpY2tlZCIsInJlcXVpcmUiLCJvblRpbGVDbGlja2VkIiwibmFtZSIsIkRhdGUiLCJnZXRUcyIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWWUsTUFBTUEsZUFBTixTQUE4QkMsZUFBTUMsU0FBcEMsQ0FBOEM7QUFBQTtBQUFBO0FBQUEseURBT3pDLE1BQU07QUFDbEJDLDBCQUFJQyxRQUFKLENBQWE7QUFDVEMsUUFBQUEsTUFBTSxF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QSxPQUFPLEVBQUUsS0FBS0M7QUFBeEYsT0FDTSx5QkFBRyxpQkFBSCxDQUROLENBREosRUFJTUgsV0FKTixDQURKLGVBUUk7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixvQkFDSSw2QkFBQyxxQkFBRDtBQUFjLE1BQUEsTUFBTSxFQUFFSCxhQUF0QjtBQUFxQyxNQUFBLEtBQUssRUFBRUUsVUFBNUM7QUFBd0QsTUFBQSxNQUFNLEVBQUVBLFVBQWhFO0FBQTRFLE1BQUEsY0FBYyxFQUFFSjtBQUE1RixNQURKLENBUkosZUFXSTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQ01FLGFBQWEsR0FBR0EsYUFBYSxDQUFDTyxJQUFqQixHQUF3QlQsTUFEM0MsQ0FYSixlQWNJO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FDTSwrQkFBZSxJQUFJVSxJQUFKLENBQVMsS0FBS2xDLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQmtDLEtBQW5CLEVBQVQsQ0FBZixDQUROLENBZEosZUFpQkk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLHFCQUFEO0FBQWMsTUFBQSxPQUFPLEVBQUUsS0FBS25DLEtBQUwsQ0FBV0MsT0FBbEM7QUFBMkMsTUFBQSxTQUFTLEVBQUMseUJBQXJEO0FBQStFLE1BQUEsY0FBYyxFQUFFLEdBQS9GO0FBQ2MsTUFBQSxlQUFlLEVBQUUsTUFBTSxDQUFFLENBRHZDLENBQ3lDOztBQUR6QyxNQURKLENBakJKLENBREo7QUF5Qkg7O0FBOUV3RDs7OzhCQUF4Q1IsZSxlQUNFO0FBQ2ZjLEVBQUFBLE1BQU0sRUFBRTZCLG1CQUFVQyxNQUFWLENBQWlCQyxVQURWO0FBRWZyQyxFQUFBQSxPQUFPLEVBQUVtQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFGWDtBQUdmMUIsRUFBQUEsVUFBVSxFQUFFd0IsbUJBQVVHO0FBSFAsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1lc3NhZ2VFdmVudCBmcm9tIFwiLi4vbWVzc2FnZXMvTWVzc2FnZUV2ZW50XCI7XG5pbXBvcnQgTWVtYmVyQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL01lbWJlckF2YXRhclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtmb3JtYXRGdWxsRGF0ZX0gZnJvbSAnLi4vLi4vLi4vRGF0ZVV0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGlubmVkRXZlbnRUaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBteFJvb206IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBvblVucGlubmVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9O1xuXG4gICAgb25UaWxlQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICBldmVudF9pZDogdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBoaWdobGlnaHRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uVW5waW5DbGlja2VkID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW5uZWRFdmVudHMgPSB0aGlzLnByb3BzLm14Um9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20ucGlubmVkX2V2ZW50c1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwaW5uZWRFdmVudHMgfHwgIXBpbm5lZEV2ZW50cy5nZXRDb250ZW50KCkucGlubmVkKSB7XG4gICAgICAgICAgICAvLyBOb3RoaW5nIHRvIGRvOiBhbHJlYWR5IHVucGlubmVkXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vblVucGlubmVkKSB0aGlzLnByb3BzLm9uVW5waW5uZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBpbm5lZCA9IHBpbm5lZEV2ZW50cy5nZXRDb250ZW50KCkucGlubmVkO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBwaW5uZWQuaW5kZXhPZih0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcGlubmVkLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMubXhSb29tLnJvb21JZCwgJ20ucm9vbS5waW5uZWRfZXZlbnRzJywge3Bpbm5lZH0sICcnKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25VbnBpbm5lZCkgdGhpcy5wcm9wcy5vblVucGlubmVkKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMub25VbnBpbm5lZCkgdGhpcy5wcm9wcy5vblVucGlubmVkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2NhblVucGluKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5teFJvb20uY3VycmVudFN0YXRlLm1heUNsaWVudFNlbmRTdGF0ZUV2ZW50KCdtLnJvb20ucGlubmVkX2V2ZW50cycsIE1hdHJpeENsaWVudFBlZy5nZXQoKSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBzZW5kZXIgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgICAgIC8vIEdldCB0aGUgbGF0ZXN0IHNlbmRlciBwcm9maWxlIHJhdGhlciB0aGFuIGhpc3RvcmljYWxcbiAgICAgICAgY29uc3Qgc2VuZGVyUHJvZmlsZSA9IHRoaXMucHJvcHMubXhSb29tLmdldE1lbWJlcihzZW5kZXIpO1xuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gNDA7XG5cbiAgICAgICAgbGV0IHVucGluQnV0dG9uID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX2NhblVucGluKCkpIHtcbiAgICAgICAgICAgIHVucGluQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25VbnBpbkNsaWNrZWR9IGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50VGlsZV91bnBpbkJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLXJlZC5zdmdcIil9IHdpZHRoPVwiOFwiIGhlaWdodD1cIjhcIiBhbHQ9e190KCdVbnBpbiBNZXNzYWdlJyl9IHRpdGxlPXtfdCgnVW5waW4gTWVzc2FnZScpfSAvPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50VGlsZV9hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50VGlsZV9nb3RvQnV0dG9uIG14X3RleHRCdXR0b25cIiBvbkNsaWNrPXt0aGlzLm9uVGlsZUNsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkp1bXAgdG8gbWVzc2FnZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgeyB1bnBpbkJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVfc2VuZGVyQXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxNZW1iZXJBdmF0YXIgbWVtYmVyPXtzZW5kZXJQcm9maWxlfSB3aWR0aD17YXZhdGFyU2l6ZX0gaGVpZ2h0PXthdmF0YXJTaXplfSBmYWxsYmFja1VzZXJJZD17c2VuZGVyfSAvPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVfc2VuZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgc2VuZGVyUHJvZmlsZSA/IHNlbmRlclByb2ZpbGUubmFtZSA6IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50VGlsZV90aW1lc3RhbXBcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBmb3JtYXRGdWxsRGF0ZShuZXcgRGF0ZSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0VHMoKSkpIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVfbWVzc2FnZVwiPlxuICAgICAgICAgICAgICAgICAgICA8TWVzc2FnZUV2ZW50IG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH0gY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRUaWxlX2JvZHlcIiBtYXhJbWFnZUhlaWdodD17MTUwfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17KCkgPT4ge319IC8vIHdlIG5lZWQgdG8gZ2l2ZSB0aGlzLCBhcHBhcmVudGx5XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=