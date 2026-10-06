"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let PresenceLabel = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.PresenceLabel"), _dec(_class = (_temp = _class2 = class PresenceLabel extends _react.default.Component {
  // Return duration as a string using appropriate time units
  // XXX: This would be better handled using a culture-aware library, but we don't use one yet.
  getDuration(time) {
    if (!time) return;
    const t = parseInt(time / 1000);
    const s = t % 60;
    const m = parseInt(t / 60) % 60;
    const h = parseInt(t / (60 * 60)) % 24;
    const d = parseInt(t / (60 * 60 * 24));

    if (t < 60) {
      if (t < 0) {
        return (0, _languageHandler._t)("%(duration)ss", {
          duration: 0
        });
      }

      return (0, _languageHandler._t)("%(duration)ss", {
        duration: s
      });
    }

    if (t < 60 * 60) {
      return (0, _languageHandler._t)("%(duration)sm", {
        duration: m
      });
    }

    if (t < 24 * 60 * 60) {
      return (0, _languageHandler._t)("%(duration)sh", {
        duration: h
      });
    }

    return (0, _languageHandler._t)("%(duration)sd", {
      duration: d
    });
  }

  getPrettyPresence(presence, activeAgo, currentlyActive) {
    if (!currentlyActive && activeAgo !== undefined && activeAgo > 0) {
      const duration = this.getDuration(activeAgo);
      if (presence === "online") return (0, _languageHandler._t)("Online for %(duration)s", {
        duration: duration
      });
      if (presence === "unavailable") return (0, _languageHandler._t)("Idle for %(duration)s", {
        duration: duration
      }); // XXX: is this actually right?

      if (presence === "offline") return (0, _languageHandler._t)("Offline for %(duration)s", {
        duration: duration
      });
      return (0, _languageHandler._t)("Unknown for %(duration)s", {
        duration: duration
      });
    } else {
      if (presence === "online") return (0, _languageHandler._t)("Online");
      if (presence === "unavailable") return (0, _languageHandler._t)("Idle"); // XXX: is this actually right?

      if (presence === "offline") return (0, _languageHandler._t)("Offline");
      return (0, _languageHandler._t)("Unknown");
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PresenceLabel"
    }, this.getPrettyPresence(this.props.presenceState, this.props.activeAgo, this.props.currentlyActive));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // number of milliseconds ago this user was last active.
  // zero = unknown
  activeAgo: _propTypes.default.number,
  // if true, activeAgo is an approximation and "Now" should
  // be shown instead
  currentlyActive: _propTypes.default.bool,
  // offline, online, etc
  presenceState: _propTypes.default.string
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  activeAgo: -1,
  presenceState: null
}), _temp)) || _class);
exports.default = PresenceLabel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1ByZXNlbmNlTGFiZWwuanMiXSwibmFtZXMiOlsiUHJlc2VuY2VMYWJlbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZ2V0RHVyYXRpb24iLCJ0aW1lIiwidCIsInBhcnNlSW50IiwicyIsIm0iLCJoIiwiZCIsImR1cmF0aW9uIiwiZ2V0UHJldHR5UHJlc2VuY2UiLCJwcmVzZW5jZSIsImFjdGl2ZUFnbyIsImN1cnJlbnRseUFjdGl2ZSIsInVuZGVmaW5lZCIsInJlbmRlciIsInByb3BzIiwicHJlc2VuY2VTdGF0ZSIsIlByb3BUeXBlcyIsIm51bWJlciIsImJvb2wiLCJzdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOzs7O0lBR3FCQSxhLFdBRHBCLGdEQUFxQiwyQkFBckIsQyxtQ0FBRCxNQUNxQkEsYUFEckIsU0FDMkNDLGVBQU1DLFNBRGpELENBQzJEO0FBbUJ2RDtBQUNBO0FBQ0FDLEVBQUFBLFdBQVcsQ0FBQ0MsSUFBRCxFQUFPO0FBQ2QsUUFBSSxDQUFDQSxJQUFMLEVBQVc7QUFDWCxVQUFNQyxDQUFDLEdBQUdDLFFBQVEsQ0FBQ0YsSUFBSSxHQUFHLElBQVIsQ0FBbEI7QUFDQSxVQUFNRyxDQUFDLEdBQUdGLENBQUMsR0FBRyxFQUFkO0FBQ0EsVUFBTUcsQ0FBQyxHQUFHRixRQUFRLENBQUNELENBQUMsR0FBRyxFQUFMLENBQVIsR0FBbUIsRUFBN0I7QUFDQSxVQUFNSSxDQUFDLEdBQUdILFFBQVEsQ0FBQ0QsQ0FBQyxJQUFJLEtBQUssRUFBVCxDQUFGLENBQVIsR0FBMEIsRUFBcEM7QUFDQSxVQUFNSyxDQUFDLEdBQUdKLFFBQVEsQ0FBQ0QsQ0FBQyxJQUFJLEtBQUssRUFBTCxHQUFVLEVBQWQsQ0FBRixDQUFsQjs7QUFDQSxRQUFJQSxDQUFDLEdBQUcsRUFBUixFQUFZO0FBQ1IsVUFBSUEsQ0FBQyxHQUFHLENBQVIsRUFBVztBQUNQLGVBQU8seUJBQUcsZUFBSCxFQUFvQjtBQUFDTSxVQUFBQSxRQUFRLEVBQUU7QUFBWCxTQUFwQixDQUFQO0FBQ0g7O0FBQ0QsYUFBTyx5QkFBRyxlQUFILEVBQW9CO0FBQUNBLFFBQUFBLFFBQVEsRUFBRUo7QUFBWCxPQUFwQixDQUFQO0FBQ0g7O0FBQ0QsUUFBSUYsQ0FBQyxHQUFHLEtBQUssRUFBYixFQUFpQjtBQUNiLGFBQU8seUJBQUcsZUFBSCxFQUFvQjtBQUFDTSxRQUFBQSxRQUFRLEVBQUVIO0FBQVgsT0FBcEIsQ0FBUDtBQUNIOztBQUNELFFBQUlILENBQUMsR0FBRyxLQUFLLEVBQUwsR0FBVSxFQUFsQixFQUFzQjtBQUNsQixhQUFPLHlCQUFHLGVBQUgsRUFBb0I7QUFBQ00sUUFBQUEsUUFBUSxFQUFFRjtBQUFYLE9BQXBCLENBQVA7QUFDSDs7QUFDRCxXQUFPLHlCQUFHLGVBQUgsRUFBb0I7QUFBQ0UsTUFBQUEsUUFBUSxFQUFFRDtBQUFYLEtBQXBCLENBQVA7QUFDSDs7QUFFREUsRUFBQUEsaUJBQWlCLENBQUNDLFFBQUQsRUFBV0MsU0FBWCxFQUFzQkMsZUFBdEIsRUFBdUM7QUFDcEQsUUFBSSxDQUFDQSxlQUFELElBQW9CRCxTQUFTLEtBQUtFLFNBQWxDLElBQStDRixTQUFTLEdBQUcsQ0FBL0QsRUFBa0U7QUFDOUQsWUFBTUgsUUFBUSxHQUFHLEtBQUtSLFdBQUwsQ0FBaUJXLFNBQWpCLENBQWpCO0FBQ0EsVUFBSUQsUUFBUSxLQUFLLFFBQWpCLEVBQTJCLE9BQU8seUJBQUcseUJBQUgsRUFBOEI7QUFBRUYsUUFBQUEsUUFBUSxFQUFFQTtBQUFaLE9BQTlCLENBQVA7QUFDM0IsVUFBSUUsUUFBUSxLQUFLLGFBQWpCLEVBQWdDLE9BQU8seUJBQUcsdUJBQUgsRUFBNEI7QUFBRUYsUUFBQUEsUUFBUSxFQUFFQTtBQUFaLE9BQTVCLENBQVAsQ0FIOEIsQ0FHOEI7O0FBQzVGLFVBQUlFLFFBQVEsS0FBSyxTQUFqQixFQUE0QixPQUFPLHlCQUFHLDBCQUFILEVBQStCO0FBQUVGLFFBQUFBLFFBQVEsRUFBRUE7QUFBWixPQUEvQixDQUFQO0FBQzVCLGFBQU8seUJBQUcsMEJBQUgsRUFBK0I7QUFBRUEsUUFBQUEsUUFBUSxFQUFFQTtBQUFaLE9BQS9CLENBQVA7QUFDSCxLQU5ELE1BTU87QUFDSCxVQUFJRSxRQUFRLEtBQUssUUFBakIsRUFBMkIsT0FBTyx5QkFBRyxRQUFILENBQVA7QUFDM0IsVUFBSUEsUUFBUSxLQUFLLGFBQWpCLEVBQWdDLE9BQU8seUJBQUcsTUFBSCxDQUFQLENBRjdCLENBRWdEOztBQUNuRCxVQUFJQSxRQUFRLEtBQUssU0FBakIsRUFBNEIsT0FBTyx5QkFBRyxTQUFILENBQVA7QUFDNUIsYUFBTyx5QkFBRyxTQUFILENBQVA7QUFDSDtBQUNKOztBQUVESSxFQUFBQSxNQUFNLEdBQUc7QUFDTCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTSxLQUFLTCxpQkFBTCxDQUF1QixLQUFLTSxLQUFMLENBQVdDLGFBQWxDLEVBQWlELEtBQUtELEtBQUwsQ0FBV0osU0FBNUQsRUFBdUUsS0FBS0ksS0FBTCxDQUFXSCxlQUFsRixDQUROLENBREo7QUFLSDs7QUFoRXNELEMsc0RBQ3BDO0FBQ2Y7QUFDQTtBQUNBRCxFQUFBQSxTQUFTLEVBQUVNLG1CQUFVQyxNQUhOO0FBS2Y7QUFDQTtBQUNBTixFQUFBQSxlQUFlLEVBQUVLLG1CQUFVRSxJQVBaO0FBU2Y7QUFDQUgsRUFBQUEsYUFBYSxFQUFFQyxtQkFBVUc7QUFWVixDLDBEQWFHO0FBQ2xCVCxFQUFBQSxTQUFTLEVBQUUsQ0FBQyxDQURNO0FBRWxCSyxFQUFBQSxhQUFhLEVBQUU7QUFGRyxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5QcmVzZW5jZUxhYmVsXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVzZW5jZUxhYmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGFnbyB0aGlzIHVzZXIgd2FzIGxhc3QgYWN0aXZlLlxuICAgICAgICAvLyB6ZXJvID0gdW5rbm93blxuICAgICAgICBhY3RpdmVBZ286IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgICAgICAgLy8gaWYgdHJ1ZSwgYWN0aXZlQWdvIGlzIGFuIGFwcHJveGltYXRpb24gYW5kIFwiTm93XCIgc2hvdWxkXG4gICAgICAgIC8vIGJlIHNob3duIGluc3RlYWRcbiAgICAgICAgY3VycmVudGx5QWN0aXZlOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvLyBvZmZsaW5lLCBvbmxpbmUsIGV0Y1xuICAgICAgICBwcmVzZW5jZVN0YXRlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBhY3RpdmVBZ286IC0xLFxuICAgICAgICBwcmVzZW5jZVN0YXRlOiBudWxsLFxuICAgIH07XG5cbiAgICAvLyBSZXR1cm4gZHVyYXRpb24gYXMgYSBzdHJpbmcgdXNpbmcgYXBwcm9wcmlhdGUgdGltZSB1bml0c1xuICAgIC8vIFhYWDogVGhpcyB3b3VsZCBiZSBiZXR0ZXIgaGFuZGxlZCB1c2luZyBhIGN1bHR1cmUtYXdhcmUgbGlicmFyeSwgYnV0IHdlIGRvbid0IHVzZSBvbmUgeWV0LlxuICAgIGdldER1cmF0aW9uKHRpbWUpIHtcbiAgICAgICAgaWYgKCF0aW1lKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHQgPSBwYXJzZUludCh0aW1lIC8gMTAwMCk7XG4gICAgICAgIGNvbnN0IHMgPSB0ICUgNjA7XG4gICAgICAgIGNvbnN0IG0gPSBwYXJzZUludCh0IC8gNjApICUgNjA7XG4gICAgICAgIGNvbnN0IGggPSBwYXJzZUludCh0IC8gKDYwICogNjApKSAlIDI0O1xuICAgICAgICBjb25zdCBkID0gcGFyc2VJbnQodCAvICg2MCAqIDYwICogMjQpKTtcbiAgICAgICAgaWYgKHQgPCA2MCkge1xuICAgICAgICAgICAgaWYgKHQgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShkdXJhdGlvbilzc1wiLCB7ZHVyYXRpb246IDB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfdChcIiUoZHVyYXRpb24pc3NcIiwge2R1cmF0aW9uOiBzfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPCA2MCAqIDYwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKGR1cmF0aW9uKXNtXCIsIHtkdXJhdGlvbjogbX0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0IDwgMjQgKiA2MCAqIDYwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKGR1cmF0aW9uKXNoXCIsIHtkdXJhdGlvbjogaH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdChcIiUoZHVyYXRpb24pc2RcIiwge2R1cmF0aW9uOiBkfSk7XG4gICAgfVxuXG4gICAgZ2V0UHJldHR5UHJlc2VuY2UocHJlc2VuY2UsIGFjdGl2ZUFnbywgY3VycmVudGx5QWN0aXZlKSB7XG4gICAgICAgIGlmICghY3VycmVudGx5QWN0aXZlICYmIGFjdGl2ZUFnbyAhPT0gdW5kZWZpbmVkICYmIGFjdGl2ZUFnbyA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5nZXREdXJhdGlvbihhY3RpdmVBZ28pO1xuICAgICAgICAgICAgaWYgKHByZXNlbmNlID09PSBcIm9ubGluZVwiKSByZXR1cm4gX3QoXCJPbmxpbmUgZm9yICUoZHVyYXRpb24pc1wiLCB7IGR1cmF0aW9uOiBkdXJhdGlvbiB9KTtcbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJ1bmF2YWlsYWJsZVwiKSByZXR1cm4gX3QoXCJJZGxlIGZvciAlKGR1cmF0aW9uKXNcIiwgeyBkdXJhdGlvbjogZHVyYXRpb24gfSk7IC8vIFhYWDogaXMgdGhpcyBhY3R1YWxseSByaWdodD9cbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJvZmZsaW5lXCIpIHJldHVybiBfdChcIk9mZmxpbmUgZm9yICUoZHVyYXRpb24pc1wiLCB7IGR1cmF0aW9uOiBkdXJhdGlvbiB9KTtcbiAgICAgICAgICAgIHJldHVybiBfdChcIlVua25vd24gZm9yICUoZHVyYXRpb24pc1wiLCB7IGR1cmF0aW9uOiBkdXJhdGlvbiB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJvbmxpbmVcIikgcmV0dXJuIF90KFwiT25saW5lXCIpO1xuICAgICAgICAgICAgaWYgKHByZXNlbmNlID09PSBcInVuYXZhaWxhYmxlXCIpIHJldHVybiBfdChcIklkbGVcIik7IC8vIFhYWDogaXMgdGhpcyBhY3R1YWxseSByaWdodD9cbiAgICAgICAgICAgIGlmIChwcmVzZW5jZSA9PT0gXCJvZmZsaW5lXCIpIHJldHVybiBfdChcIk9mZmxpbmVcIik7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJVbmtub3duXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9QcmVzZW5jZUxhYmVsXCI+XG4gICAgICAgICAgICAgICAgeyB0aGlzLmdldFByZXR0eVByZXNlbmNlKHRoaXMucHJvcHMucHJlc2VuY2VTdGF0ZSwgdGhpcy5wcm9wcy5hY3RpdmVBZ28sIHRoaXMucHJvcHMuY3VycmVudGx5QWN0aXZlKSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=