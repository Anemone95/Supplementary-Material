"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let InviteReason = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.InviteReason"), _dec(_class = (_temp = class InviteReason extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onViewClick", () => {
      this.setState({
        hidden: false
      });
    });
    this.state = {
      // We hide the reason for invitation by default, since it can be a
      // vector for spam/harassment.
      hidden: true
    };
  }

  render() {
    const classes = (0, _classnames.default)({
      "mx_InviteReason": true,
      "mx_InviteReason_hidden": this.state.hidden
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteReason_reason"
    }, this.props.reason), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InviteReason_view",
      onClick: this.onViewClick
    }, (0, _languageHandler._t)("View message")));
  }

}, _temp)) || _class);
exports.default = InviteReason;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0ludml0ZVJlYXNvbi50c3giXSwibmFtZXMiOlsiSW52aXRlUmVhc29uIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwiaGlkZGVuIiwic3RhdGUiLCJyZW5kZXIiLCJjbGFzc2VzIiwicmVhc29uIiwib25WaWV3Q2xpY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBV3FCQSxZLFdBRHBCLGdEQUFxQiw2QkFBckIsQyx5QkFBRCxNQUNxQkEsWUFEckIsU0FDMENDLGVBQU1DO0FBRGhEO0FBQzhFO0FBQzFFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSx1REFTTCxNQUFNO0FBQ2hCLFdBQUtDLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxNQUFNLEVBQUU7QUFERSxPQUFkO0FBR0gsS0Fia0I7QUFFZixTQUFLQyxLQUFMLEdBQWE7QUFDVDtBQUNBO0FBQ0FELE1BQUFBLE1BQU0sRUFBRTtBQUhDLEtBQWI7QUFLSDs7QUFRREUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsT0FBTyxHQUFHLHlCQUFXO0FBQ3ZCLHlCQUFtQixJQURJO0FBRXZCLGdDQUEwQixLQUFLRixLQUFMLENBQVdEO0FBRmQsS0FBWCxDQUFoQjtBQUtBLHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUVHO0FBQWhCLG9CQUNIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUF5QyxLQUFLTCxLQUFMLENBQVdNLE1BQXBELENBREcsZUFFSDtBQUFLLE1BQUEsU0FBUyxFQUFDLHNCQUFmO0FBQ0ksTUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFEbEIsT0FHSyx5QkFBRyxjQUFILENBSEwsQ0FGRyxDQUFQO0FBUUg7O0FBOUJ5RSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgcmVwbGFjZWFibGVDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcmVhc29uOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGhpZGRlbjogYm9vbGVhbjtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuSW52aXRlUmVhc29uXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnZpdGVSZWFzb24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gV2UgaGlkZSB0aGUgcmVhc29uIGZvciBpbnZpdGF0aW9uIGJ5IGRlZmF1bHQsIHNpbmNlIGl0IGNhbiBiZSBhXG4gICAgICAgICAgICAvLyB2ZWN0b3IgZm9yIHNwYW0vaGFyYXNzbWVudC5cbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvblZpZXdDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBoaWRkZW46IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfSW52aXRlUmVhc29uXCI6IHRydWUsXG4gICAgICAgICAgICBcIm14X0ludml0ZVJlYXNvbl9oaWRkZW5cIjogdGhpcy5zdGF0ZS5oaWRkZW4sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludml0ZVJlYXNvbl9yZWFzb25cIj57dGhpcy5wcm9wcy5yZWFzb259PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludml0ZVJlYXNvbl92aWV3XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uVmlld0NsaWNrfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtfdChcIlZpZXcgbWVzc2FnZVwiKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl19