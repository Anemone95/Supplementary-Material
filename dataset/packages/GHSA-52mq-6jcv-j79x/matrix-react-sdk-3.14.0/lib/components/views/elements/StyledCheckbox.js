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

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class StyledCheckbox extends _react.default.PureComponent
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

}

exports.default = StyledCheckbox;
(0, _defineProperty2.default)(StyledCheckbox, "defaultProps", {
  className: ""
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1N0eWxlZENoZWNrYm94LnRzeCJdLCJuYW1lcyI6WyJTdHlsZWRDaGVja2JveCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJpZCIsInJlbmRlciIsImNoaWxkcmVuIiwiY2xhc3NOYW1lIiwib3RoZXJQcm9wcyIsInJlcXVpcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBV2UsTUFBTUEsY0FBTixTQUE2QkMsZUFBTUM7QUFBbkM7QUFBaUU7QUFPNUVDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQWdCO0FBQ3ZCLFVBQU1BLEtBQU4sRUFEdUIsQ0FFdkI7O0FBRnVCO0FBR3ZCLFNBQUtDLEVBQUwsR0FBVSxjQUFjLGdDQUFhLEVBQWIsQ0FBeEI7QUFDSDs7QUFFTUMsRUFBQUEsTUFBUCxHQUFnQjtBQUNaO0FBQ0Esd0JBQStDLEtBQUtGLEtBQXBEO0FBQUEsVUFBTTtBQUFFRyxNQUFBQSxRQUFGO0FBQVlDLE1BQUFBO0FBQVosS0FBTjtBQUFBLFVBQWdDQyxVQUFoQztBQUNBLHdCQUFPO0FBQU0sTUFBQSxTQUFTLEVBQUUsaUJBQWlCRDtBQUFsQyxvQkFDSDtBQUFPLE1BQUEsRUFBRSxFQUFFLEtBQUtIO0FBQWhCLE9BQXdCSSxVQUF4QjtBQUFvQyxNQUFBLElBQUksRUFBQztBQUF6QyxPQURHLGVBRUg7QUFBTyxNQUFBLE9BQU8sRUFBRSxLQUFLSjtBQUFyQixvQkFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLEdBQUcsRUFBRUssT0FBTyxDQUFDLGtEQUFEO0FBQWpCLE1BREosQ0FGSixlQUtJLDBDQUNNLEtBQUtOLEtBQUwsQ0FBV0csUUFEakIsQ0FMSixDQUZHLENBQVA7QUFZSDs7QUE1QjJFOzs7OEJBQTNEUCxjLGtCQUdxQjtBQUNsQ1EsRUFBQUEsU0FBUyxFQUFFO0FBRHVCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyByYW5kb21TdHJpbmcgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvcmFuZG9tc3RyaW5nXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBSZWFjdC5JbnB1dEhUTUxBdHRyaWJ1dGVzPEhUTUxJbnB1dEVsZW1lbnQ+IHtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0eWxlZENoZWNrYm94IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgaWQ6IHN0cmluZztcblxuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBjbGFzc05hbWU6IFwiXCIsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICAvLyA1Nl4xMCBzbyB1bmxpa2VseSBjaGFuY2Ugb2YgY29sbGlzaW9uLlxuICAgICAgICB0aGlzLmlkID0gXCJjaGVja2JveF9cIiArIHJhbmRvbVN0cmluZygxMCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgLyogZXNsaW50IEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyczogW1wiZXJyb3JcIiwgeyBcImlnbm9yZVJlc3RTaWJsaW5nc1wiOiB0cnVlIH1dICovXG4gICAgICAgIGNvbnN0IHsgY2hpbGRyZW4sIGNsYXNzTmFtZSwgLi4ub3RoZXJQcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17XCJteF9DaGVja2JveCBcIiArIGNsYXNzTmFtZX0+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9e3RoaXMuaWR9IHsuLi5vdGhlclByb3BzfSB0eXBlPVwiY2hlY2tib3hcIiAvPlxuICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9e3RoaXMuaWR9PlxuICAgICAgICAgICAgICAgIHsvKiBVc2luZyB0aGUgZGl2IHRvIGNlbnRlciB0aGUgaW1hZ2UgKi99XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DaGVja2JveF9iYWNrZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9mZWF0aGVyLWN1c3RvbWlzZWQvY2hlY2suc3ZnXCIpfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L3NwYW4+O1xuICAgIH1cbn1cbiJdfQ==