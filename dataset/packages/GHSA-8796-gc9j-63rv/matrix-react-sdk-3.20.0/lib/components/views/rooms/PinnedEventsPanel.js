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

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _PinnedEventTile = _interopRequireDefault(require("./PinnedEventTile"));

var _languageHandler = require("../../../languageHandler");

var _PinningUtils = _interopRequireDefault(require("../../../utils/PinningUtils"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let PinnedEventsPanel = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.PinnedEventsPanel"), _dec(_class = (_temp = _class2 = class PinnedEventsPanel extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      loading: true
    });
    (0, _defineProperty2.default)(this, "_onStateEvent", ev => {
      if (ev.getRoomId() === this.props.room.roomId && ev.getType() === "m.room.pinned_events") {
        this._updatePinnedMessages();
      }
    });
    (0, _defineProperty2.default)(this, "_updatePinnedMessages", () => {
      const pinnedEvents = this.props.room.currentState.getStateEvents("m.room.pinned_events", "");

      if (!pinnedEvents || !pinnedEvents.getContent().pinned) {
        this.setState({
          loading: false,
          pinned: []
        });
      } else {
        const promises = [];

        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        pinnedEvents.getContent().pinned.map(eventId => {
          promises.push(cli.getEventTimeline(this.props.room.getUnfilteredTimelineSet(), eventId, 0).then(timeline => {
            const event = timeline.getEvents().find(e => e.getId() === eventId);
            return {
              eventId,
              timeline,
              event
            };
          }).catch(err => {
            console.error("Error looking up pinned event " + eventId + " in room " + this.props.room.roomId);
            console.error(err);
            return null; // return lack of context to avoid unhandled errors
          }));
        });
        Promise.all(promises).then(contexts => {
          // Filter out the messages before we try to render them
          const pinned = contexts.filter(context => _PinningUtils.default.isPinnable(context.event));
          this.setState({
            loading: false,
            pinned
          });
        });
      }

      this._updateReadState();
    });
  }

  componentDidMount() {
    this._updatePinnedMessages();

    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.events", this._onStateEvent);
  }

  componentWillUnmount() {
    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener("RoomState.events", this._onStateEvent);
    }
  }

  _updateReadState() {
    const pinnedEvents = this.props.room.currentState.getStateEvents("m.room.pinned_events", "");
    if (!pinnedEvents) return; // nothing to read

    let readStateEvents = [];
    const readPinsEvent = this.props.room.getAccountData("im.vector.room.read_pins");

    if (readPinsEvent && readPinsEvent.getContent()) {
      readStateEvents = readPinsEvent.getContent().event_ids || [];
    }

    if (!readStateEvents.includes(pinnedEvents.getId())) {
      readStateEvents.push(pinnedEvents.getId()); // Only keep the last 10 event IDs to avoid infinite growth

      readStateEvents = readStateEvents.reverse().splice(0, 10).reverse();

      _MatrixClientPeg.MatrixClientPeg.get().setRoomAccountData(this.props.room.roomId, "im.vector.room.read_pins", {
        event_ids: readStateEvents
      });
    }
  }

  _getPinnedTiles() {
    if (this.state.pinned.length === 0) {
      return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("No pinned messages."));
    }

    return this.state.pinned.map(context => {
      return /*#__PURE__*/_react.default.createElement(_PinnedEventTile.default, {
        key: context.event.getId(),
        mxRoom: this.props.room,
        mxEvent: context.event,
        onUnpinned: this._updatePinnedMessages
      });
    });
  }

  render() {
    let tiles = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Loading..."));

    if (this.state && !this.state.loading) {
      tiles = this._getPinnedTiles();
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PinnedEventsPanel"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PinnedEventsPanel_body"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_PinnedEventsPanel_cancel",
      onClick: this.props.onCancelClick
    }, /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_filterFlipColor",
      src: require("../../../../res/img/cancel.svg"),
      width: "18",
      height: "18"
    })), /*#__PURE__*/_react.default.createElement("h3", {
      className: "mx_PinnedEventsPanel_header"
    }, (0, _languageHandler._t)("Pinned Messages")), tiles));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // The Room from the js-sdk we're going to show pinned events for
  room: _propTypes.default.object.isRequired,
  onCancelClick: _propTypes.default.func
}), _temp)) || _class);
exports.default = PinnedEventsPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Bpbm5lZEV2ZW50c1BhbmVsLmpzIl0sIm5hbWVzIjpbIlBpbm5lZEV2ZW50c1BhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJsb2FkaW5nIiwiZXYiLCJnZXRSb29tSWQiLCJwcm9wcyIsInJvb20iLCJyb29tSWQiLCJnZXRUeXBlIiwiX3VwZGF0ZVBpbm5lZE1lc3NhZ2VzIiwicGlubmVkRXZlbnRzIiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJnZXRDb250ZW50IiwicGlubmVkIiwic2V0U3RhdGUiLCJwcm9taXNlcyIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm1hcCIsImV2ZW50SWQiLCJwdXNoIiwiZ2V0RXZlbnRUaW1lbGluZSIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsInRoZW4iLCJ0aW1lbGluZSIsImV2ZW50IiwiZ2V0RXZlbnRzIiwiZmluZCIsImUiLCJnZXRJZCIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwiUHJvbWlzZSIsImFsbCIsImNvbnRleHRzIiwiZmlsdGVyIiwiY29udGV4dCIsIlBpbm5pbmdVdGlscyIsImlzUGlubmFibGUiLCJfdXBkYXRlUmVhZFN0YXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIl9vblN0YXRlRXZlbnQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwicmVhZFN0YXRlRXZlbnRzIiwicmVhZFBpbnNFdmVudCIsImdldEFjY291bnREYXRhIiwiZXZlbnRfaWRzIiwiaW5jbHVkZXMiLCJyZXZlcnNlIiwic3BsaWNlIiwic2V0Um9vbUFjY291bnREYXRhIiwiX2dldFBpbm5lZFRpbGVzIiwic3RhdGUiLCJsZW5ndGgiLCJyZW5kZXIiLCJ0aWxlcyIsIm9uQ2FuY2VsQ2xpY2siLCJyZXF1aXJlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIs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QUFBdEcsTUFESixDQURKLGVBSUk7QUFBSSxNQUFBLFNBQVMsRUFBQztBQUFkLE9BQThDLHlCQUFHLGlCQUFILENBQTlDLENBSkosRUFLTUYsS0FMTixDQURKLENBREo7QUFXSDs7QUFwSDBELEMsc0RBQ3hDO0FBQ2Y7QUFDQXZELEVBQUFBLElBQUksRUFBRTBELG1CQUFVQyxNQUFWLENBQWlCQyxVQUZSO0FBSWZKLEVBQUFBLGFBQWEsRUFBRUUsbUJBQVVHO0FBSlYsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgUGlubmVkRXZlbnRUaWxlIGZyb20gXCIuL1Bpbm5lZEV2ZW50VGlsZVwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFBpbm5pbmdVdGlscyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvUGlubmluZ1V0aWxzXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Mucm9vbXMuUGlubmVkRXZlbnRzUGFuZWxcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBpbm5lZEV2ZW50c1BhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBUaGUgUm9vbSBmcm9tIHRoZSBqcy1zZGsgd2UncmUgZ29pbmcgdG8gc2hvdyBwaW5uZWQgZXZlbnRzIGZvclxuICAgICAgICByb29tOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICAgICAgb25DYW5jZWxDbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgfTtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlUGlubmVkTWVzc2FnZXMoKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLl9vblN0YXRlRXZlbnQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMuX29uU3RhdGVFdmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25TdGF0ZUV2ZW50ID0gZXYgPT4ge1xuICAgICAgICBpZiAoZXYuZ2V0Um9vbUlkKCkgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQgJiYgZXYuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5waW5uZWRfZXZlbnRzXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBpbm5lZE1lc3NhZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3VwZGF0ZVBpbm5lZE1lc3NhZ2VzID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBwaW5uZWRFdmVudHMgPSB0aGlzLnByb3BzLnJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBpbm5lZF9ldmVudHNcIiwgXCJcIik7XG4gICAgICAgIGlmICghcGlubmVkRXZlbnRzIHx8ICFwaW5uZWRFdmVudHMuZ2V0Q29udGVudCgpLnBpbm5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlLCBwaW5uZWQ6IFtdIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICAgICAgcGlubmVkRXZlbnRzLmdldENvbnRlbnQoKS5waW5uZWQubWFwKChldmVudElkKSA9PiB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChjbGkuZ2V0RXZlbnRUaW1lbGluZSh0aGlzLnByb3BzLnJvb20uZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0KCksIGV2ZW50SWQsIDApLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICh0aW1lbGluZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSB0aW1lbGluZS5nZXRFdmVudHMoKS5maW5kKChlKSA9PiBlLmdldElkKCkgPT09IGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtldmVudElkLCB0aW1lbGluZSwgZXZlbnR9O1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBsb29raW5nIHVwIHBpbm5lZCBldmVudCBcIiArIGV2ZW50SWQgKyBcIiBpbiByb29tIFwiICsgdGhpcy5wcm9wcy5yb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIHJldHVybiBsYWNrIG9mIGNvbnRleHQgdG8gYXZvaWQgdW5oYW5kbGVkIGVycm9yc1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoY29udGV4dHMpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgb3V0IHRoZSBtZXNzYWdlcyBiZWZvcmUgd2UgdHJ5IHRvIHJlbmRlciB0aGVtXG4gICAgICAgICAgICAgICAgY29uc3QgcGlubmVkID0gY29udGV4dHMuZmlsdGVyKChjb250ZXh0KSA9PiBQaW5uaW5nVXRpbHMuaXNQaW5uYWJsZShjb250ZXh0LmV2ZW50KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UsIHBpbm5lZCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlUmVhZFN0YXRlKCk7XG4gICAgfTtcblxuICAgIF91cGRhdGVSZWFkU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IHBpbm5lZEV2ZW50cyA9IHRoaXMucHJvcHMucm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20ucGlubmVkX2V2ZW50c1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwaW5uZWRFdmVudHMpIHJldHVybjsgLy8gbm90aGluZyB0byByZWFkXG5cbiAgICAgICAgbGV0IHJlYWRTdGF0ZUV2ZW50cyA9IFtdO1xuICAgICAgICBjb25zdCByZWFkUGluc0V2ZW50ID0gdGhpcy5wcm9wcy5yb29tLmdldEFjY291bnREYXRhKFwiaW0udmVjdG9yLnJvb20ucmVhZF9waW5zXCIpO1xuICAgICAgICBpZiAocmVhZFBpbnNFdmVudCAmJiByZWFkUGluc0V2ZW50LmdldENvbnRlbnQoKSkge1xuICAgICAgICAgICAgcmVhZFN0YXRlRXZlbnRzID0gcmVhZFBpbnNFdmVudC5nZXRDb250ZW50KCkuZXZlbnRfaWRzIHx8IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFyZWFkU3RhdGVFdmVudHMuaW5jbHVkZXMocGlubmVkRXZlbnRzLmdldElkKCkpKSB7XG4gICAgICAgICAgICByZWFkU3RhdGVFdmVudHMucHVzaChwaW5uZWRFdmVudHMuZ2V0SWQoKSk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkga2VlcCB0aGUgbGFzdCAxMCBldmVudCBJRHMgdG8gYXZvaWQgaW5maW5pdGUgZ3Jvd3RoXG4gICAgICAgICAgICByZWFkU3RhdGVFdmVudHMgPSByZWFkU3RhdGVFdmVudHMucmV2ZXJzZSgpLnNwbGljZSgwLCAxMCkucmV2ZXJzZSgpO1xuXG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Um9vbUFjY291bnREYXRhKHRoaXMucHJvcHMucm9vbS5yb29tSWQsIFwiaW0udmVjdG9yLnJvb20ucmVhZF9waW5zXCIsIHtcbiAgICAgICAgICAgICAgICBldmVudF9pZHM6IHJlYWRTdGF0ZUV2ZW50cyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldFBpbm5lZFRpbGVzKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5waW5uZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxkaXY+eyBfdChcIk5vIHBpbm5lZCBtZXNzYWdlcy5cIikgfTwvZGl2Pik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5waW5uZWQubWFwKChjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxQaW5uZWRFdmVudFRpbGVcbiAgICAgICAgICAgICAgICAgICAga2V5PXtjb250ZXh0LmV2ZW50LmdldElkKCl9XG4gICAgICAgICAgICAgICAgICAgIG14Um9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXtjb250ZXh0LmV2ZW50fVxuICAgICAgICAgICAgICAgICAgICBvblVucGlubmVkPXt0aGlzLl91cGRhdGVQaW5uZWRNZXNzYWdlc31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdGlsZXMgPSA8ZGl2PnsgX3QoXCJMb2FkaW5nLi4uXCIpIH08L2Rpdj47XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmICF0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgICAgIHRpbGVzID0gdGhpcy5fZ2V0UGlubmVkVGlsZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50c1BhbmVsXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudHNQYW5lbF9ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50c1BhbmVsX2NhbmNlbFwiIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DYW5jZWxDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cIm14X2ZpbHRlckZsaXBDb2xvclwiIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLnN2Z1wiKX0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRzUGFuZWxfaGVhZGVyXCI+eyBfdChcIlBpbm5lZCBNZXNzYWdlc1wiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgeyB0aWxlcyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=