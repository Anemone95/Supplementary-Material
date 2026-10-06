"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let MessageEditHistoryDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.MessageEditHistoryDialog"), _dec(_class = (_temp = _class2 = class MessageEditHistoryDialog extends _react.default.PureComponent {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  mxEvent: _propTypes.default.object.isRequired
}), _temp)) || _class);
exports.default = MessageEditHistoryDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nLmpzIl0sIm5hbWVzIjpbIk1lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJiYWNrd2FyZHMiLCJzdGF0ZSIsIm5leHRCYXRjaCIsImlzTG9hZGluZyIsIm9wdHMiLCJmcm9tIiwicm9vbUlkIiwibXhFdmVudCIsImdldFJvb21JZCIsImV2ZW50SWQiLCJnZXRJZCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInJlc3VsdCIsInJlc29sdmUiLCJyZWplY3QiLCJwcm9taXNlIiwiUHJvbWlzZSIsIl9yZXNvbHZlIiwiX3JlamVjdCIsInJlbGF0aW9ucyIsImVycm9yIiwiZXJyY29kZSIsImNvbnNvbGUiLCJzZXRTdGF0ZSIsIm5ld0V2ZW50cyIsImV2ZW50cyIsIl9sb2NhbGx5UmVkYWN0RXZlbnRzSWZOZWVkZWQiLCJvcmlnaW5hbEV2ZW50IiwiY29uY2F0IiwiaGFzTW9yZVJlc3VsdHMiLCJpc1R3ZWx2ZUhvdXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyb29tIiwiZ2V0Um9vbSIsInBlbmRpbmdFdmVudHMiLCJnZXRQZW5kaW5nRXZlbnRzIiwiZSIsInBlbmRpbmdSZWRhY3Rpb24iLCJmaW5kIiwicGUiLCJnZXRUeXBlIiwiZ2V0QXNzb2NpYXRlZElkIiwibWFya0xvY2FsbHlSZWRhY3RlZCIsImNvbXBvbmVudERpZE1vdW50IiwibG9hZE1vcmVFZGl0cyIsIl9yZW5kZXJFZGl0cyIsIkVkaXRIaXN0b3J5TWVzc2FnZSIsInNkayIsImdldENvbXBvbmVudCIsIkRhdGVTZXBhcmF0b3IiLCJub2RlcyIsImxhc3RFdmVudCIsImFsbEV2ZW50cyIsImJhc2VFdmVudElkIiwiZm9yRWFjaCIsImkiLCJnZXREYXRlIiwicHVzaCIsImdldFRzIiwiaXNCYXNlRXZlbnQiLCJyZW5kZXIiLCJjb250ZW50IiwiU3Bpbm5lciIsIlNjcm9sbFBhbmVsIiwiQmFzZURpYWxvZyIsIm9uRmluaXNoZWQiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSx3QixXQURwQixnREFBcUIsd0NBQXJCLEMsbUNBQUQsTUFDcUJBLHdCQURyQixTQUNzREMsZUFBTUMsYUFENUQsQ0FDMEU7QUFLdEVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHlEQVlILE1BQU9DLFNBQVAsSUFBcUI7QUFDakMsVUFBSUEsU0FBUyxJQUFLLENBQUMsS0FBS0MsS0FBTCxDQUFXQyxTQUFaLElBQXlCLENBQUMsS0FBS0QsS0FBTCxDQUFXRSxTQUF2RCxFQUFtRTtBQUMvRDtBQUNBLGVBQU8sS0FBUDtBQUNIOztBQUNELFlBQU1DLElBQUksR0FBRztBQUFDQyxRQUFBQSxJQUFJLEVBQUUsS0FBS0osS0FBTCxDQUFXQztBQUFsQixPQUFiO0FBQ0EsWUFBTUksTUFBTSxHQUFHLEtBQUtQLEtBQUwsQ0FBV1EsT0FBWCxDQUFtQkMsU0FBbkIsRUFBZjtBQUNBLFlBQU1DLE9BQU8sR0FBRyxLQUFLVixLQUFMLENBQVdRLE9BQVgsQ0FBbUJHLEtBQW5CLEVBQWhCOztBQUNBLFlBQU1DLE1BQU0sR0FBR0MsaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLFVBQUlDLE1BQUo7QUFDQSxVQUFJQyxPQUFKO0FBQ0EsVUFBSUMsTUFBSjtBQUNBLFlBQU1DLE9BQU8sR0FBRyxJQUFJQyxPQUFKLENBQVksQ0FBQ0MsUUFBRCxFQUFXQyxPQUFYLEtBQXVCO0FBQUNMLFFBQUFBLE9BQU8sR0FBR0ksUUFBVjtBQUFvQkgsUUFBQUEsTUFBTSxHQUFHSSxPQUFUO0FBQWtCLE9BQTFFLENBQWhCOztBQUNB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LFFBQUEsWUFBWSxFQUFFLEtBSFA7QUFJUCxRQUFBLGFBQWEsRUFBRTtBQUpSLHNCQU1QO0FBQUksUUFBQSxTQUFTLEVBQUM7QUFBZCxTQUF3RixLQUFLQyxZQUFMLEVBQXhGLENBTk8sQ0FBWDtBQVFIOztBQUNELFVBQU1tQixVQUFVLEdBQUdqQixHQUFHLENBQUNDLFlBQUosQ0FBaUIsMEJBQWpCLENBQW5CO0FBQ0Esd0JBQ0ksNkJBQUMsVUFBRDtBQUNJLE1BQUEsU0FBUyxFQUFDLDZCQURkO0FBRUksTUFBQSxTQUFTLEVBQUUsSUFGZjtBQUdJLE1BQUEsVUFBVSxFQUFFLEtBQUtwRCxLQUFMLENBQVdxRSxVQUgzQjtBQUlJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGVBQUg7QUFKWCxPQU1LSixPQU5MLENBREo7QUFVSDs7QUFySnFFLEMsc0RBQ25EO0FBQ2Z6RCxFQUFBQSxPQUFPLEVBQUU4RCxtQkFBVUMsTUFBVixDQUFpQkM7QUFEWCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHt3YW50c0RhdGVTZXBhcmF0b3J9IGZyb20gJy4uLy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLk1lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZ1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBudWxsLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICAgICAgbmV4dEJhdGNoOiBudWxsLFxuICAgICAgICAgICAgaXNMb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgaXNUd2VsdmVIb3VyOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGxvYWRNb3JlRWRpdHMgPSBhc3luYyAoYmFja3dhcmRzKSA9PiB7XG4gICAgICAgIGlmIChiYWNrd2FyZHMgfHwgKCF0aGlzLnN0YXRlLm5leHRCYXRjaCAmJiAhdGhpcy5zdGF0ZS5pc0xvYWRpbmcpKSB7XG4gICAgICAgICAgICAvLyBiYWlsIG91dCBvbiBiYWNrd2FyZHMgYXMgd2Ugb25seSBwYWdpbmF0ZSBpbiBvbmUgZGlyZWN0aW9uXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0cyA9IHtmcm9tOiB0aGlzLnN0YXRlLm5leHRCYXRjaH07XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKTtcbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIGxldCByZXNvbHZlO1xuICAgICAgICBsZXQgcmVqZWN0O1xuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKF9yZXNvbHZlLCBfcmVqZWN0KSA9PiB7cmVzb2x2ZSA9IF9yZXNvbHZlOyByZWplY3QgPSBfcmVqZWN0O30pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnJlbGF0aW9ucyhcbiAgICAgICAgICAgICAgICByb29tSWQsIGV2ZW50SWQsIFwibS5yZXBsYWNlXCIsIFwibS5yb29tLm1lc3NhZ2VcIiwgb3B0cyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBsb2cgaWYgdGhlIHNlcnZlciByZXR1cm5lZCBhbiBlcnJvclxuICAgICAgICAgICAgaWYgKGVycm9yLmVycmNvZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZmV0Y2hpbmcgL3JlbGF0aW9ucyBmYWlsZWQgd2l0aCBlcnJvclwiLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnJvcn0sICgpID0+IHJlamVjdChlcnJvcikpO1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdFdmVudHMgPSByZXN1bHQuZXZlbnRzO1xuICAgICAgICB0aGlzLl9sb2NhbGx5UmVkYWN0RXZlbnRzSWZOZWVkZWQobmV3RXZlbnRzKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiB0aGlzLnN0YXRlLm9yaWdpbmFsRXZlbnQgfHwgcmVzdWx0Lm9yaWdpbmFsRXZlbnQsXG4gICAgICAgICAgICBldmVudHM6IHRoaXMuc3RhdGUuZXZlbnRzLmNvbmNhdChuZXdFdmVudHMpLFxuICAgICAgICAgICAgbmV4dEJhdGNoOiByZXN1bHQubmV4dEJhdGNoLFxuICAgICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGFzTW9yZVJlc3VsdHMgPSAhIXRoaXMuc3RhdGUubmV4dEJhdGNoO1xuICAgICAgICAgICAgcmVzb2x2ZShoYXNNb3JlUmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBfbG9jYWxseVJlZGFjdEV2ZW50c0lmTmVlZGVkKG5ld0V2ZW50cykge1xuICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdFdmVudHMgPSByb29tLmdldFBlbmRpbmdFdmVudHMoKTtcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIG5ld0V2ZW50cykge1xuICAgICAgICAgICAgY29uc3QgcGVuZGluZ1JlZGFjdGlvbiA9IHBlbmRpbmdFdmVudHMuZmluZChwZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBlLmdldFR5cGUoKSA9PT0gXCJtLnJvb20ucmVkYWN0aW9uXCIgJiYgcGUuZ2V0QXNzb2NpYXRlZElkKCkgPT09IGUuZ2V0SWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdSZWRhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBlLm1hcmtMb2NhbGx5UmVkYWN0ZWQocGVuZGluZ1JlZGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5sb2FkTW9yZUVkaXRzKCk7XG4gICAgfVxuXG4gICAgX3JlbmRlckVkaXRzKCkge1xuICAgICAgICBjb25zdCBFZGl0SGlzdG9yeU1lc3NhZ2UgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5FZGl0SGlzdG9yeU1lc3NhZ2UnKTtcbiAgICAgICAgY29uc3QgRGF0ZVNlcGFyYXRvciA9IHNkay5nZXRDb21wb25lbnQoJ21lc3NhZ2VzLkRhdGVTZXBhcmF0b3InKTtcbiAgICAgICAgY29uc3Qgbm9kZXMgPSBbXTtcbiAgICAgICAgbGV0IGxhc3RFdmVudDtcbiAgICAgICAgbGV0IGFsbEV2ZW50cyA9IHRoaXMuc3RhdGUuZXZlbnRzO1xuICAgICAgICAvLyBhcHBlbmQgb3JpZ2luYWwgZXZlbnQgd2hlbiB3ZSd2ZSBkb25lIGxhc3QgcGFnaW5hdGlvblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5vcmlnaW5hbEV2ZW50ICYmICF0aGlzLnN0YXRlLm5leHRCYXRjaCkge1xuICAgICAgICAgICAgYWxsRXZlbnRzID0gYWxsRXZlbnRzLmNvbmNhdCh0aGlzLnN0YXRlLm9yaWdpbmFsRXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJhc2VFdmVudElkID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCk7XG4gICAgICAgIGFsbEV2ZW50cy5mb3JFYWNoKChlLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWxhc3RFdmVudCB8fCB3YW50c0RhdGVTZXBhcmF0b3IobGFzdEV2ZW50LmdldERhdGUoKSwgZS5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaCg8bGkga2V5PXtlLmdldFRzKCkgKyBcIn5cIn0+PERhdGVTZXBhcmF0b3IgdHM9e2UuZ2V0VHMoKX0gLz48L2xpPik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpc0Jhc2VFdmVudCA9IGUuZ2V0SWQoKSA9PT0gYmFzZUV2ZW50SWQ7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKChcbiAgICAgICAgICAgICAgICA8RWRpdEhpc3RvcnlNZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgIGtleT17ZS5nZXRJZCgpfVxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0VkaXQ9eyFpc0Jhc2VFdmVudCA/IGFsbEV2ZW50c1tpICsgMV0gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICBpc0Jhc2VFdmVudD17aXNCYXNlRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e2V9XG4gICAgICAgICAgICAgICAgICAgIGlzVHdlbHZlSG91cj17dGhpcy5zdGF0ZS5pc1R3ZWx2ZUhvdXJ9XG4gICAgICAgICAgICAgICAgLz4pKTtcbiAgICAgICAgICAgIGxhc3RFdmVudCA9IGU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHtlcnJvcn0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKGVycm9yLmVycmNvZGUgPT09IFwiTV9VTlJFQ09HTklaRURcIikge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSAoPHAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIllvdXIgaG9tZXNlcnZlciBkb2Vzbid0IHNlZW0gdG8gc3VwcG9ydCB0aGlzIGZlYXR1cmUuXCIpfVxuICAgICAgICAgICAgICAgIDwvcD4pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5lcnJjb2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gc29tZSBraW5kIG9mIGVycm9yIGZyb20gdGhlIGhvbWVzZXJ2ZXJcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gKDxwIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZ19lcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyFcIil9XG4gICAgICAgICAgICAgICAgPC9wPik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSAoPHAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkNhbm5vdCByZWFjaCBob21lc2VydmVyXCIpfVxuICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAge190KFwiRW5zdXJlIHlvdSBoYXZlIGEgc3RhYmxlIGludGVybmV0IGNvbm5lY3Rpb24sIG9yIGdldCBpbiB0b3VjaCB3aXRoIHRoZSBzZXJ2ZXIgYWRtaW5cIil9XG4gICAgICAgICAgICAgICAgPC9wPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFNjcm9sbFBhbmVsID0gc2RrLmdldENvbXBvbmVudChcInN0cnVjdHVyZXMuU2Nyb2xsUGFuZWxcIik7XG4gICAgICAgICAgICBjb250ZW50ID0gKDxTY3JvbGxQYW5lbFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZ19zY3JvbGxQYW5lbFwiXG4gICAgICAgICAgICAgICAgb25GaWxsUmVxdWVzdD17IHRoaXMubG9hZE1vcmVFZGl0cyB9XG4gICAgICAgICAgICAgICAgc3RpY2t5Qm90dG9tPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBzdGFydEF0Qm90dG9tPXtmYWxzZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nX2VkaXRzIG14X01lc3NhZ2VQYW5lbF9hbHdheXNTaG93VGltZXN0YW1wc1wiPnt0aGlzLl9yZW5kZXJFZGl0cygpfTwvdWw+XG4gICAgICAgICAgICA8L1Njcm9sbFBhbmVsPik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X01lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZydcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIk1lc3NhZ2UgZWRpdHNcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19