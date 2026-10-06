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

var _DateUtils = require("../../../DateUtils");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function getdaysArray() {
  return [(0, _languageHandler._t)('Sunday'), (0, _languageHandler._t)('Monday'), (0, _languageHandler._t)('Tuesday'), (0, _languageHandler._t)('Wednesday'), (0, _languageHandler._t)('Thursday'), (0, _languageHandler._t)('Friday'), (0, _languageHandler._t)('Saturday')];
}

let DateSeparator = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.DateSeparator"), _dec(_class = (_temp = _class2 = class DateSeparator extends _react.default.Component {
  getLabel() {
    const date = new Date(this.props.ts);
    const today = new Date();
    const yesterday = new Date();
    const days = getdaysArray();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return (0, _languageHandler._t)('Today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return (0, _languageHandler._t)('Yesterday');
    } else if (today.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000) {
      return days[date.getDay()];
    } else {
      return (0, _DateUtils.formatFullDateNoTime)(date);
    }
  }

  render() {
    // ARIA treats <hr/>s as separators, here we abuse them slightly so manually treat this entire thing as one
    // tab-index=-1 to allow it to be focusable but do not add tab stop for it, primarily for screen readers
    return /*#__PURE__*/_react.default.createElement("h2", {
      className: "mx_DateSeparator",
      role: "separator",
      tabIndex: -1
    }, /*#__PURE__*/_react.default.createElement("hr", {
      role: "none"
    }), /*#__PURE__*/_react.default.createElement("div", null, this.getLabel()), /*#__PURE__*/_react.default.createElement("hr", {
      role: "none"
    }));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  ts: _propTypes.default.number.isRequired
}), _temp)) || _class);
exports.default = DateSeparator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0RhdGVTZXBhcmF0b3IuanMiXSwibmFtZXMiOlsiZ2V0ZGF5c0FycmF5IiwiRGF0ZVNlcGFyYXRvciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZ2V0TGFiZWwiLCJkYXRlIiwiRGF0ZSIsInByb3BzIiwidHMiLCJ0b2RheSIsInllc3RlcmRheSIsImRheXMiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsInRvRGF0ZVN0cmluZyIsImdldFRpbWUiLCJnZXREYXkiLCJyZW5kZXIiLCJQcm9wVHlwZXMiLCJudW1iZXIiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLFNBQVNBLFlBQVQsR0FBd0I7QUFDcEIsU0FBTyxDQUNILHlCQUFHLFFBQUgsQ0FERyxFQUVILHlCQUFHLFFBQUgsQ0FGRyxFQUdILHlCQUFHLFNBQUgsQ0FIRyxFQUlILHlCQUFHLFdBQUgsQ0FKRyxFQUtILHlCQUFHLFVBQUgsQ0FMRyxFQU1ILHlCQUFHLFFBQUgsQ0FORyxFQU9ILHlCQUFHLFVBQUgsQ0FQRyxDQUFQO0FBU0g7O0lBR29CQyxhLFdBRHBCLGdEQUFxQiw4QkFBckIsQyxtQ0FBRCxNQUNxQkEsYUFEckIsU0FDMkNDLGVBQU1DLFNBRGpELENBQzJEO0FBS3ZEQyxFQUFBQSxRQUFRLEdBQUc7QUFDUCxVQUFNQyxJQUFJLEdBQUcsSUFBSUMsSUFBSixDQUFTLEtBQUtDLEtBQUwsQ0FBV0MsRUFBcEIsQ0FBYjtBQUNBLFVBQU1DLEtBQUssR0FBRyxJQUFJSCxJQUFKLEVBQWQ7QUFDQSxVQUFNSSxTQUFTLEdBQUcsSUFBSUosSUFBSixFQUFsQjtBQUNBLFVBQU1LLElBQUksR0FBR1gsWUFBWSxFQUF6QjtBQUNBVSxJQUFBQSxTQUFTLENBQUNFLE9BQVYsQ0FBa0JILEtBQUssQ0FBQ0ksT0FBTixLQUFrQixDQUFwQzs7QUFFQSxRQUFJUixJQUFJLENBQUNTLFlBQUwsT0FBd0JMLEtBQUssQ0FBQ0ssWUFBTixFQUE1QixFQUFrRDtBQUM5QyxhQUFPLHlCQUFHLE9BQUgsQ0FBUDtBQUNILEtBRkQsTUFFTyxJQUFJVCxJQUFJLENBQUNTLFlBQUwsT0FBd0JKLFNBQVMsQ0FBQ0ksWUFBVixFQUE1QixFQUFzRDtBQUN6RCxhQUFPLHlCQUFHLFdBQUgsQ0FBUDtBQUNILEtBRk0sTUFFQSxJQUFJTCxLQUFLLENBQUNNLE9BQU4sS0FBa0JWLElBQUksQ0FBQ1UsT0FBTCxFQUFsQixHQUFtQyxJQUFJLEVBQUosR0FBUyxFQUFULEdBQWMsRUFBZCxHQUFtQixJQUExRCxFQUFnRTtBQUNuRSxhQUFPSixJQUFJLENBQUNOLElBQUksQ0FBQ1csTUFBTCxFQUFELENBQVg7QUFDSCxLQUZNLE1BRUE7QUFDSCxhQUFPLHFDQUFxQlgsSUFBckIsQ0FBUDtBQUNIO0FBQ0o7O0FBRURZLEVBQUFBLE1BQU0sR0FBRztBQUNMO0FBQ0E7QUFDQSx3QkFBTztBQUFJLE1BQUEsU0FBUyxFQUFDLGtCQUFkO0FBQWlDLE1BQUEsSUFBSSxFQUFDLFdBQXRDO0FBQWtELE1BQUEsUUFBUSxFQUFFLENBQUM7QUFBN0Qsb0JBQ0g7QUFBSSxNQUFBLElBQUksRUFBQztBQUFULE1BREcsZUFFSCwwQ0FBTyxLQUFLYixRQUFMLEVBQVAsQ0FGRyxlQUdIO0FBQUksTUFBQSxJQUFJLEVBQUM7QUFBVCxNQUhHLENBQVA7QUFLSDs7QUEvQnNELEMsc0RBQ3BDO0FBQ2ZJLEVBQUFBLEVBQUUsRUFBRVUsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRE4sQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge2Zvcm1hdEZ1bGxEYXRlTm9UaW1lfSBmcm9tICcuLi8uLi8uLi9EYXRlVXRpbHMnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmZ1bmN0aW9uIGdldGRheXNBcnJheSgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBfdCgnU3VuZGF5JyksXG4gICAgICAgIF90KCdNb25kYXknKSxcbiAgICAgICAgX3QoJ1R1ZXNkYXknKSxcbiAgICAgICAgX3QoJ1dlZG5lc2RheScpLFxuICAgICAgICBfdCgnVGh1cnNkYXknKSxcbiAgICAgICAgX3QoJ0ZyaWRheScpLFxuICAgICAgICBfdCgnU2F0dXJkYXknKSxcbiAgICBdO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5tZXNzYWdlcy5EYXRlU2VwYXJhdG9yXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRlU2VwYXJhdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICB0czogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBnZXRMYWJlbCgpIHtcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRoaXMucHJvcHMudHMpO1xuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHllc3RlcmRheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IGRheXMgPSBnZXRkYXlzQXJyYXkoKTtcbiAgICAgICAgeWVzdGVyZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpIC0gMSk7XG5cbiAgICAgICAgaWYgKGRhdGUudG9EYXRlU3RyaW5nKCkgPT09IHRvZGF5LnRvRGF0ZVN0cmluZygpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJ1RvZGF5Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0ZS50b0RhdGVTdHJpbmcoKSA9PT0geWVzdGVyZGF5LnRvRGF0ZVN0cmluZygpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJ1llc3RlcmRheScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRvZGF5LmdldFRpbWUoKSAtIGRhdGUuZ2V0VGltZSgpIDwgNiAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgIHJldHVybiBkYXlzW2RhdGUuZ2V0RGF5KCldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEZ1bGxEYXRlTm9UaW1lKGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBBUklBIHRyZWF0cyA8aHIvPnMgYXMgc2VwYXJhdG9ycywgaGVyZSB3ZSBhYnVzZSB0aGVtIHNsaWdodGx5IHNvIG1hbnVhbGx5IHRyZWF0IHRoaXMgZW50aXJlIHRoaW5nIGFzIG9uZVxuICAgICAgICAvLyB0YWItaW5kZXg9LTEgdG8gYWxsb3cgaXQgdG8gYmUgZm9jdXNhYmxlIGJ1dCBkbyBub3QgYWRkIHRhYiBzdG9wIGZvciBpdCwgcHJpbWFyaWx5IGZvciBzY3JlZW4gcmVhZGVyc1xuICAgICAgICByZXR1cm4gPGgyIGNsYXNzTmFtZT1cIm14X0RhdGVTZXBhcmF0b3JcIiByb2xlPVwic2VwYXJhdG9yXCIgdGFiSW5kZXg9ey0xfT5cbiAgICAgICAgICAgIDxociByb2xlPVwibm9uZVwiIC8+XG4gICAgICAgICAgICA8ZGl2PnsgdGhpcy5nZXRMYWJlbCgpIH08L2Rpdj5cbiAgICAgICAgICAgIDxociByb2xlPVwibm9uZVwiIC8+XG4gICAgICAgIDwvaDI+O1xuICAgIH1cbn1cbiJdfQ==