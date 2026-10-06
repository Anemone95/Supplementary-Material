"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let GroupUserSettings = (_dec = (0, _replaceableComponent.replaceableComponent)("views.groups.GroupUserSettings"), _dec(_class = (_temp = _class2 = class GroupUserSettings extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      error: null,
      groups: null
    });
  }

  componentDidMount() {
    this.context.getJoinedGroups().then(result => {
      this.setState({
        groups: result.groups || [],
        error: null
      });
    }, err => {
      console.error(err);
      this.setState({
        groups: null,
        error: err
      });
    });
  }

  render() {
    let text = "";
    let groupPublicityToggles = null;
    const groups = this.state.groups;

    if (this.state.error) {
      text = (0, _languageHandler._t)('Something went wrong when trying to get your communities.');
    } else if (groups === null) {
      text = (0, _languageHandler._t)('Loading...');
    } else if (groups.length > 0) {
      const GroupPublicityToggle = sdk.getComponent('groups.GroupPublicityToggle');
      groupPublicityToggles = groups.map((groupId, index) => {
        return /*#__PURE__*/_react.default.createElement(GroupPublicityToggle, {
          key: index,
          groupId: groupId
        });
      });
      text = (0, _languageHandler._t)('Display your community flair in rooms configured to show it.');
    } else {
      text = (0, _languageHandler._t)("You're not currently a member of any communities.");
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_SettingsTab_subsectionText"
    }, text), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, groupPublicityToggles));
  }

}, (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = GroupUserSettings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2dyb3Vwcy9Hcm91cFVzZXJTZXR0aW5ncy5qcyJdLCJuYW1lcyI6WyJHcm91cFVzZXJTZXR0aW5ncyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZXJyb3IiLCJncm91cHMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbnRleHQiLCJnZXRKb2luZWRHcm91cHMiLCJ0aGVuIiwicmVzdWx0Iiwic2V0U3RhdGUiLCJlcnIiLCJjb25zb2xlIiwicmVuZGVyIiwidGV4dCIsImdyb3VwUHVibGljaXR5VG9nZ2xlcyIsInN0YXRlIiwibGVuZ3RoIiwiR3JvdXBQdWJsaWNpdHlUb2dnbGUiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJtYXAiLCJncm91cElkIiwiaW5kZXgiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxpQixXQURwQixnREFBcUIsZ0NBQXJCLEMsbUNBQUQsTUFDcUJBLGlCQURyQixTQUMrQ0MsZUFBTUMsU0FEckQsQ0FDK0Q7QUFBQTtBQUFBO0FBQUEsaURBR25EO0FBQ0pDLE1BQUFBLEtBQUssRUFBRSxJQURIO0FBRUpDLE1BQUFBLE1BQU0sRUFBRTtBQUZKLEtBSG1EO0FBQUE7O0FBUTNEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQixTQUFLQyxPQUFMLENBQWFDLGVBQWIsR0FBK0JDLElBQS9CLENBQXFDQyxNQUFELElBQVk7QUFDNUMsV0FBS0MsUUFBTCxDQUFjO0FBQUNOLFFBQUFBLE1BQU0sRUFBRUssTUFBTSxDQUFDTCxNQUFQLElBQWlCLEVBQTFCO0FBQThCRCxRQUFBQSxLQUFLLEVBQUU7QUFBckMsT0FBZDtBQUNILEtBRkQsRUFFSVEsR0FBRCxJQUFTO0FBQ1JDLE1BQUFBLE9BQU8sQ0FBQ1QsS0FBUixDQUFjUSxHQUFkO0FBQ0EsV0FBS0QsUUFBTCxDQUFjO0FBQUNOLFFBQUFBLE1BQU0sRUFBRSxJQUFUO0FBQWVELFFBQUFBLEtBQUssRUFBRVE7QUFBdEIsT0FBZDtBQUNILEtBTEQ7QUFNSDs7QUFFREUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSUMsSUFBSSxHQUFHLEVBQVg7QUFDQSxRQUFJQyxxQkFBcUIsR0FBRyxJQUE1QjtBQUNBLFVBQU1YLE1BQU0sR0FBRyxLQUFLWSxLQUFMLENBQVdaLE1BQTFCOztBQUVBLFFBQUksS0FBS1ksS0FBTCxDQUFXYixLQUFmLEVBQXNCO0FBQ2xCVyxNQUFBQSxJQUFJLEdBQUcseUJBQUcsMkRBQUgsQ0FBUDtBQUNILEtBRkQsTUFFTyxJQUFJVixNQUFNLEtBQUssSUFBZixFQUFxQjtBQUN4QlUsTUFBQUEsSUFBSSxHQUFHLHlCQUFHLFlBQUgsQ0FBUDtBQUNILEtBRk0sTUFFQSxJQUFJVixNQUFNLENBQUNhLE1BQVAsR0FBZ0IsQ0FBcEIsRUFBdUI7QUFDMUIsWUFBTUMsb0JBQW9CLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiw2QkFBakIsQ0FBN0I7QUFDQUwsTUFBQUEscUJBQXFCLEdBQUdYLE1BQU0sQ0FBQ2lCLEdBQVAsQ0FBVyxDQUFDQyxPQUFELEVBQVVDLEtBQVYsS0FBb0I7QUFDbkQsNEJBQU8sNkJBQUMsb0JBQUQ7QUFBc0IsVUFBQSxHQUFHLEVBQUVBLEtBQTNCO0FBQWtDLFVBQUEsT0FBTyxFQUFFRDtBQUEzQyxVQUFQO0FBQ0gsT0FGdUIsQ0FBeEI7QUFHQVIsTUFBQUEsSUFBSSxHQUFHLHlCQUFHLDhEQUFILENBQVA7QUFDSCxLQU5NLE1BTUE7QUFDSEEsTUFBQUEsSUFBSSxHQUFHLHlCQUFHLG1EQUFILENBQVA7QUFDSDs7QUFFRCx3QkFDSSx1REFDSTtBQUFHLE1BQUEsU0FBUyxFQUFDO0FBQWIsT0FBK0NBLElBQS9DLENBREosZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTUMscUJBRE4sQ0FGSixDQURKO0FBUUg7O0FBNUMwRCxDLHdEQUN0Q1MsNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZ3JvdXBzLkdyb3VwVXNlclNldHRpbmdzXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cFVzZXJTZXR0aW5ncyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgZ3JvdXBzOiBudWxsLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmdldEpvaW5lZEdyb3VwcygpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3JvdXBzOiByZXN1bHQuZ3JvdXBzIHx8IFtdLCBlcnJvcjogbnVsbH0pO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtncm91cHM6IG51bGwsIGVycm9yOiBlcnJ9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdGV4dCA9IFwiXCI7XG4gICAgICAgIGxldCBncm91cFB1YmxpY2l0eVRvZ2dsZXMgPSBudWxsO1xuICAgICAgICBjb25zdCBncm91cHMgPSB0aGlzLnN0YXRlLmdyb3VwcztcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgdGV4dCA9IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGVuIHRyeWluZyB0byBnZXQgeW91ciBjb21tdW5pdGllcy4nKTtcbiAgICAgICAgfSBlbHNlIGlmIChncm91cHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRleHQgPSBfdCgnTG9hZGluZy4uLicpO1xuICAgICAgICB9IGVsc2UgaWYgKGdyb3Vwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBHcm91cFB1YmxpY2l0eVRvZ2dsZSA9IHNkay5nZXRDb21wb25lbnQoJ2dyb3Vwcy5Hcm91cFB1YmxpY2l0eVRvZ2dsZScpO1xuICAgICAgICAgICAgZ3JvdXBQdWJsaWNpdHlUb2dnbGVzID0gZ3JvdXBzLm1hcCgoZ3JvdXBJZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPEdyb3VwUHVibGljaXR5VG9nZ2xlIGtleT17aW5kZXh9IGdyb3VwSWQ9e2dyb3VwSWR9IC8+O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoJ0Rpc3BsYXkgeW91ciBjb21tdW5pdHkgZmxhaXIgaW4gcm9vbXMgY29uZmlndXJlZCB0byBzaG93IGl0LicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiWW91J3JlIG5vdCBjdXJyZW50bHkgYSBtZW1iZXIgb2YgYW55IGNvbW11bml0aWVzLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+eyB0ZXh0IH08L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgeyBncm91cFB1YmxpY2l0eVRvZ2dsZXMgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19