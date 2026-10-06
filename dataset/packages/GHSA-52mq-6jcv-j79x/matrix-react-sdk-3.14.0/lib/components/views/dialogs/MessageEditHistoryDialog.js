"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _DateUtils = require("../../../DateUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

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
class MessageEditHistoryDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "loadMoreEdits", async backwards => {
      if (backwards || !this.state.nextBatch && !this.state.isLoading) {
        // bail out on backwards as we only paginate in one direction
        return false;
      }

      const opts = {
        from: this.state.nextBatch
      };
      const roomId = this.props.mxEvent.getRoomId();
      const eventId = this.props.mxEvent.getId();

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      let result;
      let resolve;
      let reject;
      const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });

      try {
        result = await client.relations(roomId, eventId, "m.replace", "m.room.message", opts);
      } catch (error) {
        // log if the server returned an error
        if (error.errcode) {
          console.error("fetching /relations failed with error", error);
        }

        this.setState({
          error
        }, () => reject(error));
        return promise;
      }

      const newEvents = result.events;

      this._locallyRedactEventsIfNeeded(newEvents);

      this.setState({
        originalEvent: this.state.originalEvent || result.originalEvent,
        events: this.state.events.concat(newEvents),
        nextBatch: result.nextBatch,
        isLoading: false
      }, () => {
        const hasMoreResults = !!this.state.nextBatch;
        resolve(hasMoreResults);
      });
      return promise;
    });
    this.state = {
      originalEvent: null,
      error: null,
      events: [],
      nextBatch: null,
      isLoading: true,
      isTwelveHour: _SettingsStore.default.getValue("showTwelveHourTimestamps")
    };
  }

  _locallyRedactEventsIfNeeded(newEvents) {
    const roomId = this.props.mxEvent.getRoomId();

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(roomId);
    const pendingEvents = room.getPendingEvents();

    for (const e of newEvents) {
      const pendingRedaction = pendingEvents.find(pe => {
        return pe.getType() === "m.room.redaction" && pe.getAssociatedId() === e.getId();
      });

      if (pendingRedaction) {
        e.markLocallyRedacted(pendingRedaction);
      }
    }
  }

  componentDidMount() {
    this.loadMoreEdits();
  }

  _renderEdits() {
    const EditHistoryMessage = sdk.getComponent('messages.EditHistoryMessage');
    const DateSeparator = sdk.getComponent('messages.DateSeparator');
    const nodes = [];
    let lastEvent;
    let allEvents = this.state.events; // append original event when we've done last pagination

    if (this.state.originalEvent && !this.state.nextBatch) {
      allEvents = allEvents.concat(this.state.originalEvent);
    }

    const baseEventId = this.props.mxEvent.getId();
    allEvents.forEach((e, i) => {
      if (!lastEvent || (0, _DateUtils.wantsDateSeparator)(lastEvent.getDate(), e.getDate())) {
        nodes.push( /*#__PURE__*/_react.default.createElement("li", {
          key: e.getTs() + "~"
        }, /*#__PURE__*/_react.default.createElement(DateSeparator, {
          ts: e.getTs()
        })));
      }

      const isBaseEvent = e.getId() === baseEventId;
      nodes.push( /*#__PURE__*/_react.default.createElement(EditHistoryMessage, {
        key: e.getId(),
        previousEdit: !isBaseEvent ? allEvents[i + 1] : null,
        isBaseEvent: isBaseEvent,
        mxEvent: e,
        isTwelveHour: this.state.isTwelveHour
      }));
      lastEvent = e;
    });
    return nodes;
  }

  render() {
    let content;

    if (this.state.error) {
      const {
        error
      } = this.state;

      if (error.errcode === "M_UNRECOGNIZED") {
        content = /*#__PURE__*/_react.default.createElement("p", {
          className: "mx_MessageEditHistoryDialog_error"
        }, (0, _languageHandler._t)("Your homeserver doesn't seem to support this feature."));
      } else if (error.errcode) {
        // some kind of error from the homeserver
        content = /*#__PURE__*/_react.default.createElement("p", {
          className: "mx_MessageEditHistoryDialog_error"
        }, (0, _languageHandler._t)("Something went wrong!"));
      } else {
        content = /*#__PURE__*/_react.default.createElement("p", {
          className: "mx_MessageEditHistoryDialog_error"
        }, (0, _languageHandler._t)("Cannot reach homeserver"), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Ensure you have a stable internet connection, or get in touch with the server admin"));
      }
    } else if (this.state.isLoading) {
      const Spinner = sdk.getComponent("elements.Spinner");
      content = /*#__PURE__*/_react.default.createElement(Spinner, null);
    } else {
      const ScrollPanel = sdk.getComponent("structures.ScrollPanel");
      content = /*#__PURE__*/_react.default.createElement(ScrollPanel, {
        className: "mx_MessageEditHistoryDialog_scrollPanel",
        onFillRequest: this.loadMoreEdits,
        stickyBottom: false,
        startAtBottom: false
      }, /*#__PURE__*/_react.default.createElement("ul", {
        className: "mx_MessageEditHistoryDialog_edits mx_MessagePanel_alwaysShowTimestamps"
      }, this._renderEdits()));
    }

    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_MessageEditHistoryDialog",
      hasCancel: true,
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Message edits")
    }, content);
  }

}

exports.default = MessageEditHistoryDialog;
(0, _defineProperty2.default)(MessageEditHistoryDialog, "propTypes", {
  mxEvent: _propTypes.default.object.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nLmpzIl0sIm5hbWVzIjpbIk1lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJiYWNrd2FyZHMiLCJzdGF0ZSIsIm5leHRCYXRjaCIsImlzTG9hZGluZyIsIm9wdHMiLCJmcm9tIiwicm9vbUlkIiwibXhFdmVudCIsImdldFJvb21JZCIsImV2ZW50SWQiLCJnZXRJZCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInJlc3VsdCIsInJlc29sdmUiLCJyZWplY3QiLCJwcm9taXNlIiwiUHJvbWlzZSIsIl9yZXNvbHZlIiwiX3JlamVjdCIsInJlbGF0aW9ucyIsImVycm9yIiwiZXJyY29kZSIsImNvbnNvbGUiLCJzZXRTdGF0ZSIsIm5ld0V2ZW50cyIsImV2ZW50cyIsIl9sb2NhbGx5UmVkYWN0RXZlbnRzSWZOZWVkZWQiLCJvcmlnaW5hbEV2ZW50IiwiY29uY2F0IiwiaGFzTW9yZVJlc3VsdHMiLCJpc1R3ZWx2ZUhvdXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyb29tIiwiZ2V0Um9vbSIsInBlbmRpbmdFdmVudHMiLCJnZXRQZW5kaW5nRXZlbnRzIiwiZSIsInBlbmRpbmdSZWRhY3Rpb24iLCJmaW5kIiwicGUiLCJnZXRUeXBlIiwiZ2V0QXNzb2NpYXRlZElkIiwibWFya0xvY2FsbHlSZWRhY3RlZCIsImNvbXBvbmVudERpZE1vdW50IiwibG9hZE1vcmVFZGl0cyIsIl9yZW5kZXJFZGl0cyIsIkVkaXRIaXN0b3J5TWVzc2FnZSIsInNkayIsImdldENvbXBvbmVudCIsIkRhdGVTZXBhcmF0b3IiLCJub2RlcyIsImxhc3RFdmVudCIsImFsbEV2ZW50cyIsImJhc2VFdmVudElkIiwiZm9yRWFjaCIsImkiLCJnZXREYXRlIiwicHVzaCIsImdldFRzIiwiaXNCYXNlRXZlbnQiLCJyZW5kZXIiLCJjb250ZW50IiwiU3Bpbm5lciIsIlNjcm9sbFBhbmVsIiwiQmFzZURpYWxvZyIsIm9uRmluaXNoZWQiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVZSxNQUFNQSx3QkFBTixTQUF1Q0MsZUFBTUMsYUFBN0MsQ0FBMkQ7QUFLdEVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHlEQVlILE1BQU9DLFNBQVAsSUFBcUI7QUFDakMsVUFBSUEsU0FBUyxJQUFLLENBQUMsS0FBS0MsS0FBTCxDQUFXQyxTQUFaLElBQXlCLENBQUMsS0FBS0QsS0FBTCxDQUFXRSxTQUF2RCxFQUFtRTtBQUMvRDtBQUNBLGVBQU8sS0FBUDtBQUNIOztBQUNELFlBQU1DLElBQUksR0FBRztBQUFDQyxRQUFBQSxJQUFJLEVBQUUsS0FBS0osS0FBTCxDQUFXQztBQUFsQixPQUFiO0FBQ0EsWUFBTUksTUFBTSxHQUFHLEtBQUtQLEtBQUwsQ0FBV1EsT0FBWCxDQUFtQkMsU0FBbkIsRUFBZjtBQUNBLFlBQU1DLE9BQU8sR0FBRyxLQUFLVixLQUFMLENBQVdRLE9BQVgsQ0FBbUJHLEtBQW5CLEVBQWhCOztBQUNBLFlBQU1DLE1BQU0sR0FBR0MsaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLFVBQUlDLE1BQUo7QUFDQSxVQUFJQyxPQUFKO0FBQ0EsVUFBSUMsTUFBSjtBQUNBLFlBQU1DLE9BQU8sR0FBRyxJQUFJQyxPQUFKLENBQVksQ0FBQ0MsUUFBRCxFQUFXQyxPQUFYLEtBQXVCO0FBQUNMLFFBQUFBLE9BQU8sR0FBR0ksUUFBVjtBQUFvQkgsUUFBQUEsTUFBTSxH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UCxRQUFBLGFBQWEsRUFBRyxLQUFLakIsYUFGZDtBQUdQLFFBQUEsWUFBWSxFQUFFLEtBSFA7QUFJUCxRQUFBLGFBQWEsRUFBRTtBQUpSLHNCQU1QO0FBQUksUUFBQSxTQUFTLEVBQUM7QUFBZCxTQUF3RixLQUFLQyxZQUFMLEVBQXhGLENBTk8sQ0FBWDtBQVFIOztBQUNELFVBQU1tQixVQUFVLEdBQUdqQixHQUFHLENBQUNDLFlBQUosQ0FBaUIsMEJBQWpCLENBQW5CO0FBQ0Esd0JBQ0ksNkJBQUMsVUFBRDtBQUFZLE1BQUEsU0FBUyxFQUFDLDZCQUF0QjtBQUFvRCxNQUFBLFNBQVMsRUFBRSxJQUEvRDtBQUNZLE1BQUEsVUFBVSxFQUFFLEtBQUtwRCxLQUFMLENBQVdxRSxVQURuQztBQUMrQyxNQUFBLEtBQUssRUFBRSx5QkFBRyxlQUFIO0FBRHRELE9BRUtKLE9BRkwsQ0FESjtBQU1IOztBQWpKcUU7Ozs4QkFBckRyRSx3QixlQUNFO0FBQ2ZZLEVBQUFBLE9BQU8sRUFBRThELG1CQUFVQyxNQUFWLENBQWlCQztBQURYLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQge3dhbnRzRGF0ZVNlcGFyYXRvcn0gZnJvbSAnLi4vLi4vLi4vRGF0ZVV0aWxzJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBteEV2ZW50OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IG51bGwsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgICBuZXh0QmF0Y2g6IG51bGwsXG4gICAgICAgICAgICBpc0xvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBpc1R3ZWx2ZUhvdXI6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHdlbHZlSG91clRpbWVzdGFtcHNcIiksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbG9hZE1vcmVFZGl0cyA9IGFzeW5jIChiYWNrd2FyZHMpID0+IHtcbiAgICAgICAgaWYgKGJhY2t3YXJkcyB8fCAoIXRoaXMuc3RhdGUubmV4dEJhdGNoICYmICF0aGlzLnN0YXRlLmlzTG9hZGluZykpIHtcbiAgICAgICAgICAgIC8vIGJhaWwgb3V0IG9uIGJhY2t3YXJkcyBhcyB3ZSBvbmx5IHBhZ2luYXRlIGluIG9uZSBkaXJlY3Rpb25cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcHRzID0ge2Zyb206IHRoaXMuc3RhdGUubmV4dEJhdGNofTtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpO1xuICAgICAgICBjb25zdCBldmVudElkID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgbGV0IHJlc29sdmU7XG4gICAgICAgIGxldCByZWplY3Q7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgoX3Jlc29sdmUsIF9yZWplY3QpID0+IHtyZXNvbHZlID0gX3Jlc29sdmU7IHJlamVjdCA9IF9yZWplY3Q7fSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCBjbGllbnQucmVsYXRpb25zKFxuICAgICAgICAgICAgICAgIHJvb21JZCwgZXZlbnRJZCwgXCJtLnJlcGxhY2VcIiwgXCJtLnJvb20ubWVzc2FnZVwiLCBvcHRzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIGxvZyBpZiB0aGUgc2VydmVyIHJldHVybmVkIGFuIGVycm9yXG4gICAgICAgICAgICBpZiAoZXJyb3IuZXJyY29kZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJmZXRjaGluZyAvcmVsYXRpb25zIGZhaWxlZCB3aXRoIGVycm9yXCIsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2Vycm9yfSwgKCkgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld0V2ZW50cyA9IHJlc3VsdC5ldmVudHM7XG4gICAgICAgIHRoaXMuX2xvY2FsbHlSZWRhY3RFdmVudHNJZk5lZWRlZChuZXdFdmVudHMpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IHRoaXMuc3RhdGUub3JpZ2luYWxFdmVudCB8fCByZXN1bHQub3JpZ2luYWxFdmVudCxcbiAgICAgICAgICAgIGV2ZW50czogdGhpcy5zdGF0ZS5ldmVudHMuY29uY2F0KG5ld0V2ZW50cyksXG4gICAgICAgICAgICBuZXh0QmF0Y2g6IHJlc3VsdC5uZXh0QmF0Y2gsXG4gICAgICAgICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoYXNNb3JlUmVzdWx0cyA9ICEhdGhpcy5zdGF0ZS5uZXh0QmF0Y2g7XG4gICAgICAgICAgICByZXNvbHZlKGhhc01vcmVSZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxuICAgIF9sb2NhbGx5UmVkYWN0RXZlbnRzSWZOZWVkZWQobmV3RXZlbnRzKSB7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgY29uc3QgcGVuZGluZ0V2ZW50cyA9IHJvb20uZ2V0UGVuZGluZ0V2ZW50cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgbmV3RXZlbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBwZW5kaW5nUmVkYWN0aW9uID0gcGVuZGluZ0V2ZW50cy5maW5kKHBlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGUuZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5yZWRhY3Rpb25cIiAmJiBwZS5nZXRBc3NvY2lhdGVkSWQoKSA9PT0gZS5nZXRJZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocGVuZGluZ1JlZGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGUubWFya0xvY2FsbHlSZWRhY3RlZChwZW5kaW5nUmVkYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmxvYWRNb3JlRWRpdHMoKTtcbiAgICB9XG5cbiAgICBfcmVuZGVyRWRpdHMoKSB7XG4gICAgICAgIGNvbnN0IEVkaXRIaXN0b3J5TWVzc2FnZSA9IHNkay5nZXRDb21wb25lbnQoJ21lc3NhZ2VzLkVkaXRIaXN0b3J5TWVzc2FnZScpO1xuICAgICAgICBjb25zdCBEYXRlU2VwYXJhdG9yID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuRGF0ZVNlcGFyYXRvcicpO1xuICAgICAgICBjb25zdCBub2RlcyA9IFtdO1xuICAgICAgICBsZXQgbGFzdEV2ZW50O1xuICAgICAgICBsZXQgYWxsRXZlbnRzID0gdGhpcy5zdGF0ZS5ldmVudHM7XG4gICAgICAgIC8vIGFwcGVuZCBvcmlnaW5hbCBldmVudCB3aGVuIHdlJ3ZlIGRvbmUgbGFzdCBwYWdpbmF0aW9uXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsRXZlbnQgJiYgIXRoaXMuc3RhdGUubmV4dEJhdGNoKSB7XG4gICAgICAgICAgICBhbGxFdmVudHMgPSBhbGxFdmVudHMuY29uY2F0KHRoaXMuc3RhdGUub3JpZ2luYWxFdmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFzZUV2ZW50SWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgYWxsRXZlbnRzLmZvckVhY2goKGUsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghbGFzdEV2ZW50IHx8IHdhbnRzRGF0ZVNlcGFyYXRvcihsYXN0RXZlbnQuZ2V0RGF0ZSgpLCBlLmdldERhdGUoKSkpIHtcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKDxsaSBrZXk9e2UuZ2V0VHMoKSArIFwiflwifT48RGF0ZVNlcGFyYXRvciB0cz17ZS5nZXRUcygpfSAvPjwvbGk+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGlzQmFzZUV2ZW50ID0gZS5nZXRJZCgpID09PSBiYXNlRXZlbnRJZDtcbiAgICAgICAgICAgIG5vZGVzLnB1c2goKFxuICAgICAgICAgICAgICAgIDxFZGl0SGlzdG9yeU1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAga2V5PXtlLmdldElkKCl9XG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzRWRpdD17IWlzQmFzZUV2ZW50ID8gYWxsRXZlbnRzW2kgKyAxXSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIGlzQmFzZUV2ZW50PXtpc0Jhc2VFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudD17ZX1cbiAgICAgICAgICAgICAgICAgICAgaXNUd2VsdmVIb3VyPXt0aGlzLnN0YXRlLmlzVHdlbHZlSG91cn1cbiAgICAgICAgICAgICAgICAvPikpO1xuICAgICAgICAgICAgbGFzdEV2ZW50ID0gZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29uc3Qge2Vycm9yfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBpZiAoZXJyb3IuZXJyY29kZSA9PT0gXCJNX1VOUkVDT0dOSVpFRFwiKSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9ICg8cCBjbGFzc05hbWU9XCJteF9NZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2dfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiWW91ciBob21lc2VydmVyIGRvZXNuJ3Qgc2VlbSB0byBzdXBwb3J0IHRoaXMgZmVhdHVyZS5cIil9XG4gICAgICAgICAgICAgICAgPC9wPik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLmVycmNvZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBzb21lIGtpbmQgb2YgZXJyb3IgZnJvbSB0aGUgaG9tZXNlcnZlclxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSAoPHAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlNvbWV0aGluZyB3ZW50IHdyb25nIVwiKX1cbiAgICAgICAgICAgICAgICA8L3A+KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9ICg8cCBjbGFzc05hbWU9XCJteF9NZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2dfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiQ2Fubm90IHJlYWNoIGhvbWVzZXJ2ZXJcIil9XG4gICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJFbnN1cmUgeW91IGhhdmUgYSBzdGFibGUgaW50ZXJuZXQgY29ubmVjdGlvbiwgb3IgZ2V0IGluIHRvdWNoIHdpdGggdGhlIHNlcnZlciBhZG1pblwiKX1cbiAgICAgICAgICAgICAgICA8L3A+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmlzTG9hZGluZykge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgY29udGVudCA9IDxTcGlubmVyIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgU2Nyb2xsUGFuZWwgPSBzZGsuZ2V0Q29tcG9uZW50KFwic3RydWN0dXJlcy5TY3JvbGxQYW5lbFwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSAoPFNjcm9sbFBhbmVsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nX3Njcm9sbFBhbmVsXCJcbiAgICAgICAgICAgICAgICBvbkZpbGxSZXF1ZXN0PXsgdGhpcy5sb2FkTW9yZUVkaXRzIH1cbiAgICAgICAgICAgICAgICBzdGlja3lCb3R0b209e2ZhbHNlfVxuICAgICAgICAgICAgICAgIHN0YXJ0QXRCb3R0b209e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJteF9NZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2dfZWRpdHMgbXhfTWVzc2FnZVBhbmVsX2Fsd2F5c1Nob3dUaW1lc3RhbXBzXCI+e3RoaXMuX3JlbmRlckVkaXRzKCl9PC91bD5cbiAgICAgICAgICAgIDwvU2Nyb2xsUGFuZWw+KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X01lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZycgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfSB0aXRsZT17X3QoXCJNZXNzYWdlIGVkaXRzXCIpfT5cbiAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=