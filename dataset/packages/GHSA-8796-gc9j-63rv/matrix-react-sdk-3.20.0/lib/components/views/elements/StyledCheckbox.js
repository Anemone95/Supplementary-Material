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

var _randomstring = require("matrix-js-sdk/src/randomstring");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let StyledCheckbox = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.StyledCheckbox"), _dec(_class = (_temp = _class2 = class StyledCheckbox extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props); // 56^10 so unlikely chance of collision.

    (0, _defineProperty2.default)(this, "id", void 0);
    this.id = "checkbox_" + (0, _randomstring.randomString)(10);
  }

  render() {
    /* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
    const _this$props = this.props,
          {
      children,
      className
    } = _this$props,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props, ["children", "className"]);
    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_Checkbox " + className
    }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
      id: this.id
    }, otherProps, {
      type: "checkbox"
    })), /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: this.id
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Checkbox_background"
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/feather-customised/check.svg")
    })), /*#__PURE__*/_react.default.createElement("div", null, this.props.children)));
  }

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  className: ""
}), _temp)) || _class);
exports.default = StyledCheckbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1N0eWxlZENoZWNrYm94LnRzeCJdLCJuYW1lcyI6WyJTdHlsZWRDaGVja2JveCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJpZCIsInJlbmRlciIsImNoaWxkcmVuIiwiY2xhc3NOYW1lIiwib3RoZXJQcm9wcyIsInJlcXVpcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7OztJQVNxQkEsYyxXQURwQixnREFBcUIsK0JBQXJCLEMsbUNBQUQsTUFDcUJBLGNBRHJCLFNBQzRDQyxlQUFNQztBQURsRDtBQUNnRjtBQU81RUMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZ0I7QUFDdkIsVUFBTUEsS0FBTixFQUR1QixDQUV2Qjs7QUFGdUI7QUFHdkIsU0FBS0MsRUFBTCxHQUFVLGNBQWMsZ0NBQWEsRUFBYixDQUF4QjtBQUNIOztBQUVNQyxFQUFBQSxNQUFQLEdBQWdCO0FBQ1o7QUFDQSx3QkFBK0MsS0FBS0YsS0FBcEQ7QUFBQSxVQUFNO0FBQUVHLE1BQUFBLFFBQUY7QUFBWUMsTUFBQUE7QUFBWixLQUFOO0FBQUEsVUFBZ0NDLFVBQWhDO0FBQ0Esd0JBQU87QUFBTSxNQUFBLFNBQVMsRUFBRSxpQkFBaUJEO0FBQWxDLG9CQUNIO0FBQU8sTUFBQSxFQUFFLEVBQUUsS0FBS0g7QUFBaEIsT0FBd0JJLFVBQXhCO0FBQW9DLE1BQUEsSUFBSSxFQUFDO0FBQXpDLE9BREcsZUFFSDtBQUFPLE1BQUEsT0FBTyxFQUFFLEtBQUtKO0FBQXJCLG9CQUVJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsR0FBRyxFQUFFSyxPQUFPLENBQUMsa0RBQUQ7QUFBakIsTUFESixDQUZKLGVBS0ksMENBQ00sS0FBS04sS0FBTCxDQUFXRyxRQURqQixDQUxKLENBRkcsQ0FBUDtBQVlIOztBQTVCMkUsQyx5REFHdEM7QUFDbENDLEVBQUFBLFNBQVMsRUFBRTtBQUR1QixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgcmFuZG9tU3RyaW5nIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3JhbmRvbXN0cmluZ1wiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5JbnB1dEhUTUxBdHRyaWJ1dGVzPEhUTUxJbnB1dEVsZW1lbnQ+IHtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLlN0eWxlZENoZWNrYm94XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdHlsZWRDaGVja2JveCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgY2xhc3NOYW1lOiBcIlwiLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgLy8gNTZeMTAgc28gdW5saWtlbHkgY2hhbmNlIG9mIGNvbGxpc2lvbi5cbiAgICAgICAgdGhpcy5pZCA9IFwiY2hlY2tib3hfXCIgKyByYW5kb21TdHJpbmcoMTApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIC8qIGVzbGludCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnM6IFtcImVycm9yXCIsIHsgXCJpZ25vcmVSZXN0U2libGluZ3NcIjogdHJ1ZSB9XSAqL1xuICAgICAgICBjb25zdCB7IGNoaWxkcmVuLCBjbGFzc05hbWUsIC4uLm90aGVyUHJvcHMgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e1wibXhfQ2hlY2tib3ggXCIgKyBjbGFzc05hbWV9PlxuICAgICAgICAgICAgPGlucHV0IGlkPXt0aGlzLmlkfSB7Li4ub3RoZXJQcm9wc30gdHlwZT1cImNoZWNrYm94XCIgLz5cbiAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPXt0aGlzLmlkfT5cbiAgICAgICAgICAgICAgICB7LyogVXNpbmcgdGhlIGRpdiB0byBjZW50ZXIgdGhlIGltYWdlICovfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2hlY2tib3hfYmFja2dyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZmVhdGhlci1jdXN0b21pc2VkL2NoZWNrLnN2Z1wiKX0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9zcGFuPjtcbiAgICB9XG59XG4iXX0=