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

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Keyboard = require("../../../Keyboard");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let IntegrationManager = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.IntegrationManager"), _dec(_class = (_temp = _class2 = class IntegrationManager extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // false to display an error saying that we couldn't connect to the integration manager
  connected: _propTypes.default.bool.isRequired,
  // true to display a loading spinner
  loading: _propTypes.default.bool.isRequired,
  // The source URL to load
  url: _propTypes.default.string,
  // callback when the manager is dismissed
  onFinished: _propTypes.default.func.isRequired
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  connected: true,
  loading: false
}), _temp)) || _class);
exports.default = IntegrationManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0ludGVncmF0aW9uTWFuYWdlci5qcyJdLCJuYW1lcyI6WyJJbnRlZ3JhdGlvbk1hbmFnZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsImtleSIsIktleSIsIkVTQ0FQRSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwib25GaW5pc2hlZCIsInBheWxvYWQiLCJhY3Rpb24iLCJzZXRTdGF0ZSIsImVycm9yZWQiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbktleURvd24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVuZGVyIiwibG9hZGluZyIsIlNwaW5uZXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjb25uZWN0ZWQiLCJ1cmwiLCJvbkVycm9yIiwiUHJvcFR5cGVzIiwiYm9vbCIsImlzUmVxdWlyZWQiLCJzdHJpbmciLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxrQixXQURwQixnREFBcUIsbUNBQXJCLEMsbUNBQUQsTUFDcUJBLGtCQURyQixTQUNnREMsZUFBTUMsU0FEdEQsQ0FDZ0U7QUFvQjVEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSxxREFrQk5DLEVBQUQsSUFBUTtBQUNoQixVQUFJQSxFQUFFLENBQUNDLEdBQUgsS0FBV0MsY0FBSUMsTUFBbkIsRUFBMkI7QUFDdkJILFFBQUFBLEVBQUUsQ0FBQ0ksZUFBSDtBQUNBSixRQUFBQSxFQUFFLENBQUNLLGNBQUg7QUFDQSxhQUFLTixLQUFMLENBQVdPLFVBQVg7QUFDSDtBQUNKLEtBeEJrQjtBQUFBLG9EQTBCUEMsT0FBRCxJQUFhO0FBQ3BCLFVBQUlBLE9BQU8sQ0FBQ0MsTUFBUixLQUFtQixjQUF2QixFQUF1QztBQUNuQyxhQUFLVCxLQUFMLENBQVdPLFVBQVg7QUFDSDtBQUNKLEtBOUJrQjtBQUFBLG1EQWdDVCxNQUFNO0FBQ1osV0FBS0csUUFBTCxDQUFjO0FBQUVDLFFBQUFBLE9BQU8sRUFBRTtBQUFYLE9BQWQ7QUFDSCxLQWxDa0I7QUFHZixTQUFLQyxLQUFMLEdBQWE7QUFDVEQsTUFBQUEsT0FBTyxFQUFFO0FBREEsS0FBYjtBQUdIOztBQUVERSxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQixTQUFLQyxhQUFMLEdBQXFCQyxvQkFBSUMsUUFBSixDQUFhLEtBQUtDLFFBQWxCLENBQXJCO0FBQ0FDLElBQUFBLFFBQVEsQ0FBQ0MsZ0JBQVQsQ0FBMEIsU0FBMUIsRUFBcUMsS0FBS0MsU0FBMUM7QUFDSDs7QUFFREMsRUFBQUEsb0JBQW9CLEdBQUc7QUFDbkJOLHdCQUFJTyxVQUFKLENBQWUsS0FBS1IsYUFBcEI7O0FBQ0FJLElBQUFBLFFBQVEsQ0FBQ0ssbUJBQVQsQ0FBNkIsU0FBN0IsRUFBd0MsS0FBS0gsU0FBN0M7QUFDSDs7QUFvQkRJLEVBQUFBLE1BQU0sR0FBRztBQUNMLFFBQUksS0FBS3hCLEtBQUwsQ0FBV3lCLE9BQWYsRUFBd0I7QUFDcEIsWUFBTUMsT0FBTyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCO0FBQ0EsMEJBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLHlDQUFLLHlCQUFHLHNDQUFILENBQUwsQ0FESixlQUVJLDZCQUFDLE9BQUQsT0FGSixDQURKO0FBTUg7O0FBRUQsUUFBSSxDQUFDLEtBQUs1QixLQUFMLENBQVc2QixTQUFaLElBQXlCLEtBQUtqQixLQUFMLENBQVdELE9BQXhDLEVBQWlEO0FBQzdDLDBCQUNJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFDSSx5Q0FBSyx5QkFBRyx1Q0FBSCxDQUFMLENBREosZUFFSSx3Q0FBSSx5QkFBRyx3RUFBSCxDQUFKLENBRkosQ0FESjtBQU1IOztBQUVELHdCQUFPO0FBQVEsTUFBQSxHQUFHLEVBQUUsS0FBS1gsS0FBTCxDQUFXOEIsR0FBeEI7QUFBNkIsTUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFBM0MsTUFBUDtBQUNIOztBQTdFMkQsQyxzREFDekM7QUFDZjtBQUNBRixFQUFBQSxTQUFTLEVBQUVHLG1CQUFVQyxJQUFWLENBQWVDLFVBRlg7QUFJZjtBQUNBVCxFQUFBQSxPQUFPLEVBQUVPLG1CQUFVQyxJQUFWLENBQWVDLFVBTFQ7QUFPZjtBQUNBSixFQUFBQSxHQUFHLEVBQUVFLG1CQUFVRyxNQVJBO0FBVWY7QUFDQTVCLEVBQUFBLFVBQVUsRUFBRXlCLG1CQUFVSSxJQUFWLENBQWVGO0FBWFosQywwREFjRztBQUNsQkwsRUFBQUEsU0FBUyxFQUFFLElBRE87QUFFbEJKLEVBQUFBLE9BQU8sRUFBRTtBQUZTLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHtLZXl9IGZyb20gXCIuLi8uLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLkludGVncmF0aW9uTWFuYWdlclwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZWdyYXRpb25NYW5hZ2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBmYWxzZSB0byBkaXNwbGF5IGFuIGVycm9yIHNheWluZyB0aGF0IHdlIGNvdWxkbid0IGNvbm5lY3QgdG8gdGhlIGludGVncmF0aW9uIG1hbmFnZXJcbiAgICAgICAgY29ubmVjdGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8vIHRydWUgdG8gZGlzcGxheSBhIGxvYWRpbmcgc3Bpbm5lclxuICAgICAgICBsb2FkaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8vIFRoZSBzb3VyY2UgVVJMIHRvIGxvYWRcbiAgICAgICAgdXJsOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIGNhbGxiYWNrIHdoZW4gdGhlIG1hbmFnZXIgaXMgZGlzbWlzc2VkXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGNvbm5lY3RlZDogdHJ1ZSxcbiAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXJyb3JlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbktleURvd24pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLm9uS2V5RG93bik7XG4gICAgfVxuXG4gICAgb25LZXlEb3duID0gKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5rZXkgPT09IEtleS5FU0NBUEUpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnY2xvc2Vfc2NhbGFyJykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25FcnJvciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yZWQ6IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubG9hZGluZykge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSW50ZWdyYXRpb25NYW5hZ2VyX2xvYWRpbmcnPlxuICAgICAgICAgICAgICAgICAgICA8aDM+e190KFwiQ29ubmVjdGluZyB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyLi4uXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNvbm5lY3RlZCB8fCB0aGlzLnN0YXRlLmVycm9yZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0ludGVncmF0aW9uTWFuYWdlcl9lcnJvcic+XG4gICAgICAgICAgICAgICAgICAgIDxoMz57X3QoXCJDYW5ub3QgY29ubmVjdCB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxwPntfdChcIlRoZSBpbnRlZ3JhdGlvbiBtYW5hZ2VyIGlzIG9mZmxpbmUgb3IgaXQgY2Fubm90IHJlYWNoIHlvdXIgaG9tZXNlcnZlci5cIil9PC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8aWZyYW1lIHNyYz17dGhpcy5wcm9wcy51cmx9IG9uRXJyb3I9e3RoaXMub25FcnJvcn0gLz47XG4gICAgfVxufVxuIl19