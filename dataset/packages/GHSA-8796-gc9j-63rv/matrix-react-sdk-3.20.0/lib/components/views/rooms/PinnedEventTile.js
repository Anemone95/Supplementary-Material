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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let PinnedEventTile = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.PinnedEventTile"), _dec(_class = (_temp = _class2 = class PinnedEventTile extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  mxRoom: _propTypes.default.object.isRequired,
  mxEvent: _propTypes.default.object.isRequired,
  onUnpinned: _propTypes.default.func
}), _temp)) || _class);
exports.default = PinnedEventTile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Bpbm5lZEV2ZW50VGlsZS5qcyJdLCJuYW1lcyI6WyJQaW5uZWRFdmVudFRpbGUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiZXZlbnRfaWQiLCJwcm9wcyIsIm14RXZlbnQiLCJnZXRJZCIsImhpZ2hsaWdodGVkIiwicm9vbV9pZCIsImdldFJvb21JZCIsInBpbm5lZEV2ZW50cyIsIm14Um9vbSIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsInBpbm5lZCIsIm9uVW5waW5uZWQiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzZW5kU3RhdGVFdmVudCIsInJvb21JZCIsInRoZW4iLCJfY2FuVW5waW4iLCJtYXlDbGllbnRTZW5kU3RhdGVFdmVudCIsInJlbmRlciIsInNlbmRlciIsImdldFNlbmRlciIsInNlbmRlclByb2ZpbGUiLCJnZXRNZW1iZXIiLCJhdmF0YXJTaXplIiwidW5waW5CdXR0b24iLCJvblVucGluQ2xpY2tlZCIsInJlcXVpcmUiLCJvblRpbGVDbGlja2VkIiwibmFtZSIsIkRhdGUiLCJnZXRUcyIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsZSxXQURwQixnREFBcUIsNkJBQXJCLEMsbUNBQUQsTUFDcUJBLGVBRHJCLFNBQzZDQyxlQUFNQyxTQURuRCxDQUM2RDtBQUFBO0FBQUE7QUFBQSx5REFPekMsTUFBTTtBQUNsQkMsMEJBQUlDLFFBQUosQ0FBYTtBQUNUQyxRQUFBQSxNQUFNLEVBQUUsV0FEQztBQUVUQyxRQUFBQSxRQUFRLEVBQUUsS0FB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LGlCQUFILENBRE4sQ0FESixFQUlNSCxXQUpOLENBREosZUFRSTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLG9CQUNJLDZCQUFDLHFCQUFEO0FBQWMsTUFBQSxNQUFNLEVBQUVILGFBQXRCO0FBQXFDLE1BQUEsS0FBSyxFQUFFRSxVQUE1QztBQUF3RCxNQUFBLE1BQU0sRUFBRUEsVUFBaEU7QUFBNEUsTUFBQSxjQUFjLEVBQUVKO0FBQTVGLE1BREosQ0FSSixlQVdJO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FDTUUsYUFBYSxHQUFHQSxhQUFhLENBQUNPLElBQWpCLEdBQXdCVCxNQUQzQyxDQVhKLGVBY0k7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUNNLCtCQUFlLElBQUlVLElBQUosQ0FBUyxLQUFLbEMsS0FBTCxDQUFXQyxPQUFYLENBQW1Ca0MsS0FBbkIsRUFBVCxDQUFmLENBRE4sQ0FkSixlQWlCSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMscUJBQUQ7QUFDSSxNQUFBLE9BQU8sRUFBRSxLQUFLbkMsS0FBTCxDQUFXQyxPQUR4QjtBQUVJLE1BQUEsU0FBUyxFQUFDLHlCQUZkO0FBR0ksTUFBQSxjQUFjLEVBQUUsR0FIcEI7QUFJSSxNQUFBLGVBQWUsRUFBRSxNQUFNLENBQUUsQ0FKN0IsQ0FJK0I7O0FBSi9CLE1BREosQ0FqQkosQ0FESjtBQTRCSDs7QUFqRndELEMsc0RBQ3RDO0FBQ2ZNLEVBQUFBLE1BQU0sRUFBRTZCLG1CQUFVQyxNQUFWLENBQWlCQyxVQURWO0FBRWZyQyxFQUFBQSxPQUFPLEVBQUVtQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFGWDtBQUdmMUIsRUFBQUEsVUFBVSxFQUFFd0IsbUJBQVVHO0FBSFAsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1lc3NhZ2VFdmVudCBmcm9tIFwiLi4vbWVzc2FnZXMvTWVzc2FnZUV2ZW50XCI7XG5pbXBvcnQgTWVtYmVyQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL01lbWJlckF2YXRhclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtmb3JtYXRGdWxsRGF0ZX0gZnJvbSAnLi4vLi4vLi4vRGF0ZVV0aWxzJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5QaW5uZWRFdmVudFRpbGVcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBpbm5lZEV2ZW50VGlsZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgbXhSb29tOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgb25VbnBpbm5lZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgfTtcblxuICAgIG9uVGlsZUNsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgZXZlbnRfaWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRydWUsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvblVucGluQ2xpY2tlZCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcGlubmVkRXZlbnRzID0gdGhpcy5wcm9wcy5teFJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBpbm5lZF9ldmVudHNcIiwgXCJcIik7XG4gICAgICAgIGlmICghcGlubmVkRXZlbnRzIHx8ICFwaW5uZWRFdmVudHMuZ2V0Q29udGVudCgpLnBpbm5lZCkge1xuICAgICAgICAgICAgLy8gTm90aGluZyB0byBkbzogYWxyZWFkeSB1bnBpbm5lZFxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25VbnBpbm5lZCkgdGhpcy5wcm9wcy5vblVucGlubmVkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwaW5uZWQgPSBwaW5uZWRFdmVudHMuZ2V0Q29udGVudCgpLnBpbm5lZDtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcGlubmVkLmluZGV4T2YodGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHBpbm5lZC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLm14Um9vbS5yb29tSWQsICdtLnJvb20ucGlubmVkX2V2ZW50cycsIHtwaW5uZWR9LCAnJylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25VbnBpbm5lZCkgdGhpcy5wcm9wcy5vblVucGlubmVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLm9uVW5waW5uZWQpIHRoaXMucHJvcHMub25VbnBpbm5lZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9jYW5VbnBpbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubXhSb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudCgnbS5yb29tLnBpbm5lZF9ldmVudHMnLCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3Qgc2VuZGVyID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFNlbmRlcigpO1xuICAgICAgICAvLyBHZXQgdGhlIGxhdGVzdCBzZW5kZXIgcHJvZmlsZSByYXRoZXIgdGhhbiBoaXN0b3JpY2FsXG4gICAgICAgIGNvbnN0IHNlbmRlclByb2ZpbGUgPSB0aGlzLnByb3BzLm14Um9vbS5nZXRNZW1iZXIoc2VuZGVyKTtcbiAgICAgICAgY29uc3QgYXZhdGFyU2l6ZSA9IDQwO1xuXG4gICAgICAgIGxldCB1bnBpbkJ1dHRvbiA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9jYW5VbnBpbigpKSB7XG4gICAgICAgICAgICB1bnBpbkJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uVW5waW5DbGlja2VkfSBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVfdW5waW5CdXR0b25cIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2NhbmNlbC1yZWQuc3ZnXCIpfSB3aWR0aD1cIjhcIiBoZWlnaHQ9XCI4XCIgYWx0PXtfdCgnVW5waW4gTWVzc2FnZScpfSB0aXRsZT17X3QoJ1VucGluIE1lc3NhZ2UnKX0gLz5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRUaWxlXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVfYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVfZ290b0J1dHRvbiBteF90ZXh0QnV0dG9uXCIgb25DbGljaz17dGhpcy5vblRpbGVDbGlja2VkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJKdW1wIHRvIG1lc3NhZ2VcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHsgdW5waW5CdXR0b24gfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRUaWxlX3NlbmRlckF2YXRhclwiPlxuICAgICAgICAgICAgICAgICAgICA8TWVtYmVyQXZhdGFyIG1lbWJlcj17c2VuZGVyUHJvZmlsZX0gd2lkdGg9e2F2YXRhclNpemV9IGhlaWdodD17YXZhdGFyU2l6ZX0gZmFsbGJhY2tVc2VySWQ9e3NlbmRlcn0gLz5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRUaWxlX3NlbmRlclwiPlxuICAgICAgICAgICAgICAgICAgICB7IHNlbmRlclByb2ZpbGUgPyBzZW5kZXJQcm9maWxlLm5hbWUgOiBzZW5kZXIgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudFRpbGVfdGltZXN0YW1wXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgZm9ybWF0RnVsbERhdGUobmV3IERhdGUodGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkpKSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRUaWxlX21lc3NhZ2VcIj5cbiAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VFdmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRUaWxlX2JvZHlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4SW1hZ2VIZWlnaHQ9ezE1MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17KCkgPT4ge319IC8vIHdlIG5lZWQgdG8gZ2l2ZSB0aGlzLCBhcHBhcmVudGx5XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=