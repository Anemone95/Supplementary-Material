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

/*
Copyright 2017 Travis Ralston
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
class PinnedEventsPanel extends _react.default.Component {
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

}

exports.default = PinnedEventsPanel;
(0, _defineProperty2.default)(PinnedEventsPanel, "propTypes", {
  // The Room from the js-sdk we're going to show pinned events for
  room: _propTypes.default.object.isRequired,
  onCancelClick: _propTypes.default.func
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Bpbm5lZEV2ZW50c1BhbmVsLmpzIl0sIm5hbWVzIjpbIlBpbm5lZEV2ZW50c1BhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJsb2FkaW5nIiwiZXYiLCJnZXRSb29tSWQiLCJwcm9wcyIsInJvb20iLCJyb29tSWQiLCJnZXRUeXBlIiwiX3VwZGF0ZVBpbm5lZE1lc3NhZ2VzIiwicGlubmVkRXZlbnRzIiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJnZXRDb250ZW50IiwicGlubmVkIiwic2V0U3RhdGUiLCJwcm9taXNlcyIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm1hcCIsImV2ZW50SWQiLCJwdXNoIiwiZ2V0RXZlbnRUaW1lbGluZSIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsInRoZW4iLCJ0aW1lbGluZSIsImV2ZW50IiwiZ2V0RXZlbnRzIiwiZmluZCIsImUiLCJnZXRJZCIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwiUHJvbWlzZSIsImFsbCIsImNvbnRleHRzIiwiZmlsdGVyIiwiY29udGV4dCIsIlBpbm5pbmdVdGlscyIsImlzUGlubmFibGUiLCJfdXBkYXRlUmVhZFN0YXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIl9vblN0YXRlRXZlbnQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwicmVhZFN0YXRlRXZlbnRzIiwicmVhZFBpbnNFdmVudCIsImdldEFjY291bnREYXRhIiwiZXZlbnRfaWRzIiwiaW5jbHVkZXMiLCJyZXZlcnNlIiwic3BsaWNlIiwic2V0Um9vbUFjY291bnREYXRhIiwiX2dldFBpbm5lZFRpbGVzIiwic3RhdGUiLCJsZW5ndGgiLCJyZW5kZXIiLCJ0aWxlcyIsIm9uQ2FuY2VsQ2xpY2siLCJyZXF1aXJlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIs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QUFBLEtBQUssRUFBQyxJQUExRjtBQUErRixNQUFBLE1BQU0sRUFBQztBQUF0RyxNQURKLENBREosZUFJSTtBQUFJLE1BQUEsU0FBUyxFQUFDO0FBQWQsT0FBOEMseUJBQUcsaUJBQUgsQ0FBOUMsQ0FKSixFQUtNRixLQUxOLENBREosQ0FESjtBQVdIOztBQWhIMEQ7Ozs4QkFBMUM5RCxpQixlQUNFO0FBQ2Y7QUFDQU8sRUFBQUEsSUFBSSxFQUFFMEQsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRlI7QUFJZkosRUFBQUEsYUFBYSxFQUFFRSxtQkFBVUc7QUFKVixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFRyYXZpcyBSYWxzdG9uXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBQaW5uZWRFdmVudFRpbGUgZnJvbSBcIi4vUGlubmVkRXZlbnRUaWxlXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgUGlubmluZ1V0aWxzIGZyb20gXCIuLi8uLi8uLi91dGlscy9QaW5uaW5nVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGlubmVkRXZlbnRzUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8vIFRoZSBSb29tIGZyb20gdGhlIGpzLXNkayB3ZSdyZSBnb2luZyB0byBzaG93IHBpbm5lZCBldmVudHMgZm9yXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICBvbkNhbmNlbENsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl91cGRhdGVQaW5uZWRNZXNzYWdlcygpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMuX29uU3RhdGVFdmVudCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5fb25TdGF0ZUV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblN0YXRlRXZlbnQgPSBldiA9PiB7XG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSA9PT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCAmJiBldi5nZXRUeXBlKCkgPT09IFwibS5yb29tLnBpbm5lZF9ldmVudHNcIikge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlUGlubmVkTWVzc2FnZXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfdXBkYXRlUGlubmVkTWVzc2FnZXMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpbm5lZEV2ZW50cyA9IHRoaXMucHJvcHMucm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20ucGlubmVkX2V2ZW50c1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKCFwaW5uZWRFdmVudHMgfHwgIXBpbm5lZEV2ZW50cy5nZXRDb250ZW50KCkucGlubmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UsIHBpbm5lZDogW10gfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgICAgICBwaW5uZWRFdmVudHMuZ2V0Q29udGVudCgpLnBpbm5lZC5tYXAoKGV2ZW50SWQpID0+IHtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKGNsaS5nZXRFdmVudFRpbWVsaW5lKHRoaXMucHJvcHMucm9vbS5nZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQoKSwgZXZlbnRJZCwgMCkudGhlbihcbiAgICAgICAgICAgICAgICAodGltZWxpbmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSB0aW1lbGluZS5nZXRFdmVudHMoKS5maW5kKChlKSA9PiBlLmdldElkKCkgPT09IGV2ZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge2V2ZW50SWQsIHRpbWVsaW5lLCBldmVudH07XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9va2luZyB1cCBwaW5uZWQgZXZlbnQgXCIgKyBldmVudElkICsgXCIgaW4gcm9vbSBcIiArIHRoaXMucHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyByZXR1cm4gbGFjayBvZiBjb250ZXh0IHRvIGF2b2lkIHVuaGFuZGxlZCBlcnJvcnNcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKGNvbnRleHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgbWVzc2FnZXMgYmVmb3JlIHdlIHRyeSB0byByZW5kZXIgdGhlbVxuICAgICAgICAgICAgICAgIGNvbnN0IHBpbm5lZCA9IGNvbnRleHRzLmZpbHRlcigoY29udGV4dCkgPT4gUGlubmluZ1V0aWxzLmlzUGlubmFibGUoY29udGV4dC5ldmVudCkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlLCBwaW5uZWQgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJlYWRTdGF0ZSgpO1xuICAgIH07XG5cbiAgICBfdXBkYXRlUmVhZFN0YXRlKCkge1xuICAgICAgICBjb25zdCBwaW5uZWRFdmVudHMgPSB0aGlzLnByb3BzLnJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBpbm5lZF9ldmVudHNcIiwgXCJcIik7XG4gICAgICAgIGlmICghcGlubmVkRXZlbnRzKSByZXR1cm47IC8vIG5vdGhpbmcgdG8gcmVhZFxuXG4gICAgICAgIGxldCByZWFkU3RhdGVFdmVudHMgPSBbXTtcbiAgICAgICAgY29uc3QgcmVhZFBpbnNFdmVudCA9IHRoaXMucHJvcHMucm9vbS5nZXRBY2NvdW50RGF0YShcImltLnZlY3Rvci5yb29tLnJlYWRfcGluc1wiKTtcbiAgICAgICAgaWYgKHJlYWRQaW5zRXZlbnQgJiYgcmVhZFBpbnNFdmVudC5nZXRDb250ZW50KCkpIHtcbiAgICAgICAgICAgIHJlYWRTdGF0ZUV2ZW50cyA9IHJlYWRQaW5zRXZlbnQuZ2V0Q29udGVudCgpLmV2ZW50X2lkcyB8fCBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVhZFN0YXRlRXZlbnRzLmluY2x1ZGVzKHBpbm5lZEV2ZW50cy5nZXRJZCgpKSkge1xuICAgICAgICAgICAgcmVhZFN0YXRlRXZlbnRzLnB1c2gocGlubmVkRXZlbnRzLmdldElkKCkpO1xuXG4gICAgICAgICAgICAvLyBPbmx5IGtlZXAgdGhlIGxhc3QgMTAgZXZlbnQgSURzIHRvIGF2b2lkIGluZmluaXRlIGdyb3d0aFxuICAgICAgICAgICAgcmVhZFN0YXRlRXZlbnRzID0gcmVhZFN0YXRlRXZlbnRzLnJldmVyc2UoKS5zcGxpY2UoMCwgMTApLnJldmVyc2UoKTtcblxuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldFJvb21BY2NvdW50RGF0YSh0aGlzLnByb3BzLnJvb20ucm9vbUlkLCBcImltLnZlY3Rvci5yb29tLnJlYWRfcGluc1wiLCB7XG4gICAgICAgICAgICAgICAgZXZlbnRfaWRzOiByZWFkU3RhdGVFdmVudHMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRQaW5uZWRUaWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGlubmVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuICg8ZGl2PnsgX3QoXCJObyBwaW5uZWQgbWVzc2FnZXMuXCIpIH08L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucGlubmVkLm1hcCgoY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICg8UGlubmVkRXZlbnRUaWxlIGtleT17Y29udGV4dC5ldmVudC5nZXRJZCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14Um9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e2NvbnRleHQuZXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VbnBpbm5lZD17dGhpcy5fdXBkYXRlUGlubmVkTWVzc2FnZXN9IC8+KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdGlsZXMgPSA8ZGl2PnsgX3QoXCJMb2FkaW5nLi4uXCIpIH08L2Rpdj47XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmICF0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgICAgIHRpbGVzID0gdGhpcy5fZ2V0UGlubmVkVGlsZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50c1BhbmVsXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QaW5uZWRFdmVudHNQYW5lbF9ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1Bpbm5lZEV2ZW50c1BhbmVsX2NhbmNlbFwiIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DYW5jZWxDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cIm14X2ZpbHRlckZsaXBDb2xvclwiIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLnN2Z1wiKX0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwibXhfUGlubmVkRXZlbnRzUGFuZWxfaGVhZGVyXCI+eyBfdChcIlBpbm5lZCBNZXNzYWdlc1wiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgeyB0aWxlcyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=