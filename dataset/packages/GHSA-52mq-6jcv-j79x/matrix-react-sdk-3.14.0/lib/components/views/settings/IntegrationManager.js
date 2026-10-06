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

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Keyboard = require("../../../Keyboard");

/*
Copyright 2015, 2016 OpenMarket Ltd
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
class IntegrationManager extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      if (ev.key === _Keyboard.Key.ESCAPE) {
        ev.stopPropagation();
        ev.preventDefault();
        this.props.onFinished();
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === 'close_scalar') {
        this.props.onFinished();
      }
    });
    (0, _defineProperty2.default)(this, "onError", () => {
      this.setState({
        errored: true
      });
    });
    this.state = {
      errored: false
    };
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    document.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    document.removeEventListener("keydown", this.onKeyDown);
  }

  render() {
    if (this.props.loading) {
      const Spinner = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_IntegrationManager_loading"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Connecting to integration manager...")), /*#__PURE__*/_react.default.createElement(Spinner, null));
    }

    if (!this.props.connected || this.state.errored) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_IntegrationManager_error"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Cannot connect to integration manager")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("The integration manager is offline or it cannot reach your homeserver.")));
    }

    return /*#__PURE__*/_react.default.createElement("iframe", {
      src: this.props.url,
      onError: this.onError
    });
  }

}

exports.default = IntegrationManager;
(0, _defineProperty2.default)(IntegrationManager, "propTypes", {
  // false to display an error saying that we couldn't connect to the integration manager
  connected: _propTypes.default.bool.isRequired,
  // true to display a loading spinner
  loading: _propTypes.default.bool.isRequired,
  // The source URL to load
  url: _propTypes.default.string,
  // callback when the manager is dismissed
  onFinished: _propTypes.default.func.isRequired
});
(0, _defineProperty2.default)(IntegrationManager, "defaultProps", {
  connected: true,
  loading: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0ludGVncmF0aW9uTWFuYWdlci5qcyJdLCJuYW1lcyI6WyJJbnRlZ3JhdGlvbk1hbmFnZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsImtleSIsIktleSIsIkVTQ0FQRSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwib25GaW5pc2hlZCIsInBheWxvYWQiLCJhY3Rpb24iLCJzZXRTdGF0ZSIsImVycm9yZWQiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbktleURvd24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVuZGVyIiwibG9hZGluZyIsIlNwaW5uZXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb25uZWN0ZWQiLCJ1cmwiLCJvbkVycm9yIiwiUHJvcFR5cGVzIiwiYm9vbCIsImlzUmVxdWlyZWQiLCJzdHJpbmciLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNlLE1BQU1BLGtCQUFOLFNBQWlDQyxlQUFNQyxTQUF2QyxDQUFpRDtBQW9CNURDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHFEQWtCTkMsRUFBRCxJQUFRO0FBQ2hCLFVBQUlBLEVBQUUsQ0FBQ0MsR0FBSCxLQUFXQyxjQUFJQyxNQUFuQixFQUEyQjtBQUN2QkgsUUFBQUEsRUFBRSxDQUFDSSxlQUFIO0FBQ0FKLFFBQUFBLEVBQUUsQ0FBQ0ssY0FBSDtBQUNBLGFBQUtOLEtBQUwsQ0FBV08sVUFBWDtBQUNIO0FBQ0osS0F4QmtCO0FBQUEsb0RBMEJQQyxPQUFELElBQWE7QUFDcEIsVUFBSUEsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLGNBQXZCLEVBQXVDO0FBQ25DLGFBQUtULEtBQUwsQ0FBV08sVUFBWDtBQUNIO0FBQ0osS0E5QmtCO0FBQUEsbURBZ0NULE1BQU07QUFDWixXQUFLRyxRQUFMLENBQWM7QUFBRUMsUUFBQUEsT0FBTyxFQUFFO0FBQVgsT0FBZDtBQUNILEtBbENrQjtBQUdmLFNBQUtDLEtBQUwsR0FBYTtBQUNURCxNQUFBQSxPQUFPLEVBQUU7QUFEQSxLQUFiO0FBR0g7O0FBRURFLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCLFNBQUtDLGFBQUwsR0FBcUJDLG9CQUFJQyxRQUFKLENBQWEsS0FBS0MsUUFBbEIsQ0FBckI7QUFDQUMsSUFBQUEsUUFBUSxDQUFDQyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxLQUFLQyxTQUExQztBQUNIOztBQUVEQyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQk4sd0JBQUlPLFVBQUosQ0FBZSxLQUFLUixhQUFwQjs7QUFDQUksSUFBQUEsUUFBUSxDQUFDSyxtQkFBVCxDQUE2QixTQUE3QixFQUF3QyxLQUFLSCxTQUE3QztBQUNIOztBQW9CREksRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLeEIsS0FBTCxDQUFXeUIsT0FBZixFQUF3QjtBQUNwQixZQUFNQyxPQUFPLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixrQkFBakIsQ0FBaEI7QUFDQSwwQkFDSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0kseUNBQUsseUJBQUcsc0NBQUgsQ0FBTCxDQURKLGVBRUksNkJBQUMsT0FBRCxPQUZKLENBREo7QUFNSDs7QUFFRCxRQUFJLENBQUMsS0FBSzVCLEtBQUwsQ0FBVzZCLFNBQVosSUFBeUIsS0FBS2pCLEtBQUwsQ0FBV0QsT0FBeEMsRUFBaUQ7QUFDN0MsMEJBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLHlDQUFLLHlCQUFHLHVDQUFILENBQUwsQ0FESixlQUVJLHdDQUFJLHlCQUFHLHdFQUFILENBQUosQ0FGSixDQURKO0FBTUg7O0FBRUQsd0JBQU87QUFBUSxNQUFBLEdBQUcsRUFBRSxLQUFLWCxLQUFMLENBQVc4QixHQUF4QjtBQUE2QixNQUFBLE9BQU8sRUFBRSxLQUFLQztBQUEzQyxNQUFQO0FBQ0g7O0FBN0UyRDs7OzhCQUEzQ25DLGtCLGVBQ0U7QUFDZjtBQUNBaUMsRUFBQUEsU0FBUyxFQUFFRyxtQkFBVUMsSUFBVixDQUFlQyxVQUZYO0FBSWY7QUFDQVQsRUFBQUEsT0FBTyxFQUFFTyxtQkFBVUMsSUFBVixDQUFlQyxVQUxUO0FBT2Y7QUFDQUosRUFBQUEsR0FBRyxFQUFFRSxtQkFBVUcsTUFSQTtBQVVmO0FBQ0E1QixFQUFBQSxVQUFVLEVBQUV5QixtQkFBVUksSUFBVixDQUFlRjtBQVhaLEM7OEJBREZ0QyxrQixrQkFlSztBQUNsQmlDLEVBQUFBLFNBQVMsRUFBRSxJQURPO0FBRWxCSixFQUFBQSxPQUFPLEVBQUU7QUFGUyxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZWdyYXRpb25NYW5hZ2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBmYWxzZSB0byBkaXNwbGF5IGFuIGVycm9yIHNheWluZyB0aGF0IHdlIGNvdWxkbid0IGNvbm5lY3QgdG8gdGhlIGludGVncmF0aW9uIG1hbmFnZXJcbiAgICAgICAgY29ubmVjdGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8vIHRydWUgdG8gZGlzcGxheSBhIGxvYWRpbmcgc3Bpbm5lclxuICAgICAgICBsb2FkaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8vIFRoZSBzb3VyY2UgVVJMIHRvIGxvYWRcbiAgICAgICAgdXJsOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIGNhbGxiYWNrIHdoZW4gdGhlIG1hbmFnZXIgaXMgZGlzbWlzc2VkXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGNvbm5lY3RlZDogdHJ1ZSxcbiAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXJyb3JlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbktleURvd24pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLm9uS2V5RG93bik7XG4gICAgfVxuXG4gICAgb25LZXlEb3duID0gKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5rZXkgPT09IEtleS5FU0NBUEUpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnY2xvc2Vfc2NhbGFyJykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yZWQ6IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubG9hZGluZykge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW50ZWdyYXRpb25NYW5hZ2VyX2xvYWRpbmcnPlxuICAgICAgICAgICAgICAgICAgICA8aDM+e190KFwiQ29ubmVjdGluZyB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyLi4uXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNvbm5lY3RlZCB8fCB0aGlzLnN0YXRlLmVycm9yZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludGVncmF0aW9uTWFuYWdlcl9lcnJvcic+XG4gICAgICAgICAgICAgICAgICAgIDxoMz57X3QoXCJDYW5ub3QgY29ubmVjdCB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcIlRoZSBpbnRlZ3JhdGlvbiBtYW5hZ2VyIGlzIG9mZmxpbmUgb3IgaXQgY2Fubm90IHJlYWNoIHlvdXIgaG9tZXNlcnZlci5cIil9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8aWZyYW1lIHNyYz17dGhpcy5wcm9wcy51cmx9IG9uRXJyb3I9e3RoaXMub25FcnJvcn0gLz47XG4gICAgfVxufVxuIl19