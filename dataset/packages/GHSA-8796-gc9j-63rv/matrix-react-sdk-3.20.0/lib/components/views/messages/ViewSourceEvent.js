"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let ViewSourceEvent = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.ViewSourceEvent"), _dec(_class = (_temp = _class2 = class ViewSourceEvent extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onToggle", ev => {
      ev.preventDefault();
      const {
        expanded
      } = this.state;
      this.setState({
        expanded: !expanded
      });
    });
    this.state = {
      expanded: false
    };
  }

  componentDidMount() {
    const {
      mxEvent
    } = this.props;

    if (mxEvent.isBeingDecrypted()) {
      mxEvent.once("Event.decrypted", () => this.forceUpdate());
    }
  }

  render() {
    const {
      mxEvent
    } = this.props;
    const {
      expanded
    } = this.state;
    let content;

    if (expanded) {
      content = /*#__PURE__*/_react.default.createElement("pre", null, JSON.stringify(mxEvent, null, 4));
    } else {
      content = /*#__PURE__*/_react.default.createElement("code", null, `{ "type": ${mxEvent.getType()} }`);
    }

    const classes = (0, _classnames.default)("mx_ViewSourceEvent mx_EventTile_content", {
      mx_ViewSourceEvent_expanded: expanded
    });
    return /*#__PURE__*/_react.default.createElement("span", {
      className: classes
    }, content, /*#__PURE__*/_react.default.createElement("a", {
      className: "mx_ViewSourceEvent_toggle",
      href: "#",
      onClick: this.onToggle
    }));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired
}), _temp)) || _class);
exports.default = ViewSourceEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1ZpZXdTb3VyY2VFdmVudC5qcyJdLCJuYW1lcyI6WyJWaWV3U291cmNlRXZlbnQiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsImV4cGFuZGVkIiwic3RhdGUiLCJzZXRTdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwibXhFdmVudCIsImlzQmVpbmdEZWNyeXB0ZWQiLCJvbmNlIiwiZm9yY2VVcGRhdGUiLCJyZW5kZXIiLCJjb250ZW50IiwiSlNPTiIsInN0cmluZ2lmeSIsImdldFR5cGUiLCJjbGFzc2VzIiwibXhfVmlld1NvdXJjZUV2ZW50X2V4cGFuZGVkIiwib25Ub2dnbGUiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsZSxXQURwQixnREFBcUIsZ0NBQXJCLEMsbUNBQUQsTUFDcUJBLGVBRHJCLFNBQzZDQyxlQUFNQyxhQURuRCxDQUNpRTtBQU03REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsb0RBZVBDLEVBQUQsSUFBUTtBQUNmQSxNQUFBQSxFQUFFLENBQUNDLGNBQUg7QUFDQSxZQUFNO0FBQUVDLFFBQUFBO0FBQUYsVUFBZSxLQUFLQyxLQUExQjtBQUNBLFdBQUtDLFFBQUwsQ0FBYztBQUNWRixRQUFBQSxRQUFRLEVBQUUsQ0FBQ0E7QUFERCxPQUFkO0FBR0gsS0FyQmtCO0FBR2YsU0FBS0MsS0FBTCxHQUFhO0FBQ1RELE1BQUFBLFFBQVEsRUFBRTtBQURELEtBQWI7QUFHSDs7QUFFREcsRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEIsVUFBTTtBQUFDQyxNQUFBQTtBQUFELFFBQVksS0FBS1AsS0FBdkI7O0FBQ0EsUUFBSU8sT0FBTyxDQUFDQyxnQkFBUixFQUFKLEVBQWdDO0FBQzVCRCxNQUFBQSxPQUFPLENBQUNFLElBQVIsQ0FBYSxpQkFBYixFQUFnQyxNQUFNLEtBQUtDLFdBQUwsRUFBdEM7QUFDSDtBQUNKOztBQVVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNO0FBQUVKLE1BQUFBO0FBQUYsUUFBYyxLQUFLUCxLQUF6QjtBQUNBLFVBQU07QUFBRUcsTUFBQUE7QUFBRixRQUFlLEtBQUtDLEtBQTFCO0FBRUEsUUFBSVEsT0FBSjs7QUFDQSxRQUFJVCxRQUFKLEVBQWM7QUFDVlMsTUFBQUEsT0FBTyxnQkFBRywwQ0FBTUMsSUFBSSxDQUFDQyxTQUFMLENBQWVQLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsQ0FBOUIsQ0FBTixDQUFWO0FBQ0gsS0FGRCxNQUVPO0FBQ0hLLE1BQUFBLE9BQU8sZ0JBQUcsMkNBQVEsYUFBWUwsT0FBTyxDQUFDUSxPQUFSLEVBQWtCLElBQXRDLENBQVY7QUFDSDs7QUFFRCxVQUFNQyxPQUFPLEdBQUcseUJBQVcseUNBQVgsRUFBc0Q7QUFDbEVDLE1BQUFBLDJCQUEyQixFQUFFZDtBQURxQyxLQUF0RCxDQUFoQjtBQUlBLHdCQUFPO0FBQU0sTUFBQSxTQUFTLEVBQUVhO0FBQWpCLE9BQ0ZKLE9BREUsZUFFSDtBQUNJLE1BQUEsU0FBUyxFQUFDLDJCQURkO0FBRUksTUFBQSxJQUFJLEVBQUMsR0FGVDtBQUdJLE1BQUEsT0FBTyxFQUFFLEtBQUtNO0FBSGxCLE1BRkcsQ0FBUDtBQVFIOztBQXBENEQsQyxzREFDMUM7QUFDZjtBQUNBWCxFQUFBQSxPQUFPLEVBQUVZLG1CQUFVQyxNQUFWLENBQWlCQztBQUZYLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLm1lc3NhZ2VzLlZpZXdTb3VyY2VFdmVudFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlld1NvdXJjZUV2ZW50IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyogdGhlIE1hdHJpeEV2ZW50IHRvIHNob3cgKi9cbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3Qge214RXZlbnR9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKG14RXZlbnQuaXNCZWluZ0RlY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICBteEV2ZW50Lm9uY2UoXCJFdmVudC5kZWNyeXB0ZWRcIiwgKCkgPT4gdGhpcy5mb3JjZVVwZGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uVG9nZ2xlID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHsgZXhwYW5kZWQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXhwYW5kZWQ6ICFleHBhbmRlZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IG14RXZlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHsgZXhwYW5kZWQgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgICAgICAgY29udGVudCA9IDxwcmU+e0pTT04uc3RyaW5naWZ5KG14RXZlbnQsIG51bGwsIDQpfTwvcHJlPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8Y29kZT57YHsgXCJ0eXBlXCI6ICR7bXhFdmVudC5nZXRUeXBlKCl9IH1gfTwvY29kZT47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1ZpZXdTb3VyY2VFdmVudCBteF9FdmVudFRpbGVfY29udGVudFwiLCB7XG4gICAgICAgICAgICBteF9WaWV3U291cmNlRXZlbnRfZXhwYW5kZWQ6IGV4cGFuZGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9WaWV3U291cmNlRXZlbnRfdG9nZ2xlXCJcbiAgICAgICAgICAgICAgICBocmVmPVwiI1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblRvZ2dsZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxufVxuIl19