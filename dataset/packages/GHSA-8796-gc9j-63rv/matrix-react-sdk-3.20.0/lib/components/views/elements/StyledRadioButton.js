"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let StyledRadioButton = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.StyledRadioButton"), _dec(_class = (_temp = _class2 = class StyledRadioButton extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  render() {
    const _this$props = this.props,
          {
      children,
      className,
      disabled,
      outlined
    } = _this$props,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props, ["children", "className", "disabled", "outlined"]);

    const _className = (0, _classnames.default)('mx_RadioButton', className, {
      "mx_RadioButton_disabled": disabled,
      "mx_RadioButton_enabled": !disabled,
      "mx_RadioButton_checked": this.props.checked,
      "mx_RadioButton_outlined": outlined
    });

    return /*#__PURE__*/_react.default.createElement("label", {
      className: _className
    }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
      type: "radio",
      disabled: disabled
    }, otherProps)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RadioButton_content"
    }, children), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RadioButton_spacer"
    }));
  }

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  className: ''
}), _temp)) || _class);
exports.default = StyledRadioButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1N0eWxlZFJhZGlvQnV0dG9uLnRzeCJdLCJuYW1lcyI6WyJTdHlsZWRSYWRpb0J1dHRvbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsInJlbmRlciIsInByb3BzIiwiY2hpbGRyZW4iLCJjbGFzc05hbWUiLCJkaXNhYmxlZCIsIm91dGxpbmVkIiwib3RoZXJQcm9wcyIsIl9jbGFzc05hbWUiLCJjaGVja2VkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7Ozs7SUFVcUJBLGlCLFdBRHBCLGdEQUFxQixrQ0FBckIsQyxtQ0FBRCxNQUNxQkEsaUJBRHJCLFNBQytDQyxlQUFNQztBQURyRDtBQUNtRjtBQUt4RUMsRUFBQUEsTUFBUCxHQUFnQjtBQUNaLHdCQUFtRSxLQUFLQyxLQUF4RTtBQUFBLFVBQU07QUFBRUMsTUFBQUEsUUFBRjtBQUFZQyxNQUFBQSxTQUFaO0FBQXVCQyxNQUFBQSxRQUF2QjtBQUFpQ0MsTUFBQUE7QUFBakMsS0FBTjtBQUFBLFVBQW9EQyxVQUFwRDs7QUFDQSxVQUFNQyxVQUFVLEdBQUcseUJBQ2YsZ0JBRGUsRUFFZkosU0FGZSxFQUdmO0FBQ0ksaUNBQTJCQyxRQUQvQjtBQUVJLGdDQUEwQixDQUFDQSxRQUYvQjtBQUdJLGdDQUEwQixLQUFLSCxLQUFMLENBQVdPLE9BSHpDO0FBSUksaUNBQTJCSDtBQUovQixLQUhlLENBQW5COztBQVNBLHdCQUFPO0FBQU8sTUFBQSxTQUFTLEVBQUVFO0FBQWxCLG9CQUNIO0FBQU8sTUFBQSxJQUFJLEVBQUMsT0FBWjtBQUFvQixNQUFBLFFBQVEsRUFBRUg7QUFBOUIsT0FBNENFLFVBQTVDLEVBREcsZUFHSCx1REFBSyx5Q0FBTCxDQUhHLGVBSUg7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQXlDSixRQUF6QyxDQUpHLGVBS0g7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE1BTEcsQ0FBUDtBQU9IOztBQXZCOEUsQyx5REFDekM7QUFDbENDLEVBQUFBLFNBQVMsRUFBRTtBQUR1QixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5JbnB1dEhUTUxBdHRyaWJ1dGVzPEhUTUxJbnB1dEVsZW1lbnQ+IHtcbiAgICBvdXRsaW5lZD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5TdHlsZWRSYWRpb0J1dHRvblwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3R5bGVkUmFkaW9CdXR0b24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGNsYXNzTmFtZTogJycsXG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgY2hpbGRyZW4sIGNsYXNzTmFtZSwgZGlzYWJsZWQsIG91dGxpbmVkLCAuLi5vdGhlclByb3BzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBfY2xhc3NOYW1lID0gY2xhc3NuYW1lcyhcbiAgICAgICAgICAgICdteF9SYWRpb0J1dHRvbicsXG4gICAgICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJteF9SYWRpb0J1dHRvbl9kaXNhYmxlZFwiOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICBcIm14X1JhZGlvQnV0dG9uX2VuYWJsZWRcIjogIWRpc2FibGVkLFxuICAgICAgICAgICAgICAgIFwibXhfUmFkaW9CdXR0b25fY2hlY2tlZFwiOiB0aGlzLnByb3BzLmNoZWNrZWQsXG4gICAgICAgICAgICAgICAgXCJteF9SYWRpb0J1dHRvbl9vdXRsaW5lZFwiOiBvdXRsaW5lZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gPGxhYmVsIGNsYXNzTmFtZT17X2NsYXNzTmFtZX0+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT0ncmFkaW8nIGRpc2FibGVkPXtkaXNhYmxlZH0gey4uLm90aGVyUHJvcHN9IC8+XG4gICAgICAgICAgICB7LyogVXNlZCB0byByZW5kZXIgdGhlIHJhZGlvIGJ1dHRvbiBjaXJjbGUgKi99XG4gICAgICAgICAgICA8ZGl2PjxkaXYgLz48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUmFkaW9CdXR0b25fY29udGVudFwiPntjaGlsZHJlbn08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUmFkaW9CdXR0b25fc3BhY2VyXCIgLz5cbiAgICAgICAgPC9sYWJlbD47XG4gICAgfVxufVxuIl19