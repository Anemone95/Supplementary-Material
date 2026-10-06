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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>

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
function getdaysArray() {
  return [(0, _languageHandler._t)('Sunday'), (0, _languageHandler._t)('Monday'), (0, _languageHandler._t)('Tuesday'), (0, _languageHandler._t)('Wednesday'), (0, _languageHandler._t)('Thursday'), (0, _languageHandler._t)('Friday'), (0, _languageHandler._t)('Saturday')];
}

class DateSeparator extends _react.default.Component {
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

}

exports.default = DateSeparator;
(0, _defineProperty2.default)(DateSeparator, "propTypes", {
  ts: _propTypes.default.number.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0RhdGVTZXBhcmF0b3IuanMiXSwibmFtZXMiOlsiZ2V0ZGF5c0FycmF5IiwiRGF0ZVNlcGFyYXRvciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZ2V0TGFiZWwiLCJkYXRlIiwiRGF0ZSIsInByb3BzIiwidHMiLCJ0b2RheSIsInllc3RlcmRheSIsImRheXMiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsInRvRGF0ZVN0cmluZyIsImdldFRpbWUiLCJnZXREYXkiLCJyZW5kZXIiLCJQcm9wVHlwZXMiLCJudW1iZXIiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQSxTQUFTQSxZQUFULEdBQXdCO0FBQ3BCLFNBQU8sQ0FDSCx5QkFBRyxRQUFILENBREcsRUFFSCx5QkFBRyxRQUFILENBRkcsRUFHSCx5QkFBRyxTQUFILENBSEcsRUFJSCx5QkFBRyxXQUFILENBSkcsRUFLSCx5QkFBRyxVQUFILENBTEcsRUFNSCx5QkFBRyxRQUFILENBTkcsRUFPSCx5QkFBRyxVQUFILENBUEcsQ0FBUDtBQVNIOztBQUVjLE1BQU1DLGFBQU4sU0FBNEJDLGVBQU1DLFNBQWxDLENBQTRDO0FBS3ZEQyxFQUFBQSxRQUFRLEdBQUc7QUFDUCxVQUFNQyxJQUFJLEdBQUcsSUFBSUMsSUFBSixDQUFTLEtBQUtDLEtBQUwsQ0FBV0MsRUFBcEIsQ0FBYjtBQUNBLFVBQU1DLEtBQUssR0FBRyxJQUFJSCxJQUFKLEVBQWQ7QUFDQSxVQUFNSSxTQUFTLEdBQUcsSUFBSUosSUFBSixFQUFsQjtBQUNBLFVBQU1LLElBQUksR0FBR1gsWUFBWSxFQUF6QjtBQUNBVSxJQUFBQSxTQUFTLENBQUNFLE9BQVYsQ0FBa0JILEtBQUssQ0FBQ0ksT0FBTixLQUFrQixDQUFwQzs7QUFFQSxRQUFJUixJQUFJLENBQUNTLFlBQUwsT0FBd0JMLEtBQUssQ0FBQ0ssWUFBTixFQUE1QixFQUFrRDtBQUM5QyxhQUFPLHlCQUFHLE9BQUgsQ0FBUDtBQUNILEtBRkQsTUFFTyxJQUFJVCxJQUFJLENBQUNTLFlBQUwsT0FBd0JKLFNBQVMsQ0FBQ0ksWUFBVixFQUE1QixFQUFzRDtBQUN6RCxhQUFPLHlCQUFHLFdBQUgsQ0FBUDtBQUNILEtBRk0sTUFFQSxJQUFJTCxLQUFLLENBQUNNLE9BQU4sS0FBa0JWLElBQUksQ0FBQ1UsT0FBTCxFQUFsQixHQUFtQyxJQUFJLEVBQUosR0FBUyxFQUFULEdBQWMsRUFBZCxHQUFtQixJQUExRCxFQUFnRTtBQUNuRSxhQUFPSixJQUFJLENBQUNOLElBQUksQ0FBQ1csTUFBTCxFQUFELENBQVg7QUFDSCxLQUZNLE1BRUE7QUFDSCxhQUFPLHFDQUFxQlgsSUFBckIsQ0FBUDtBQUNIO0FBQ0o7O0FBRURZLEVBQUFBLE1BQU0sR0FBRztBQUNMO0FBQ0E7QUFDQSx3QkFBTztBQUFJLE1BQUEsU0FBUyxFQUFDLGtCQUFkO0FBQWlDLE1BQUEsSUFBSSxFQUFDLFdBQXRDO0FBQWtELE1BQUEsUUFBUSxFQUFFLENBQUM7QUFBN0Qsb0JBQ0g7QUFBSSxNQUFBLElBQUksRUFBQztBQUFULE1BREcsZUFFSCwwQ0FBTyxLQUFLYixRQUFMLEVBQVAsQ0FGRyxlQUdIO0FBQUksTUFBQSxJQUFJLEVBQUM7QUFBVCxNQUhHLENBQVA7QUFLSDs7QUEvQnNEOzs7OEJBQXRDSCxhLGVBQ0U7QUFDZk8sRUFBQUEsRUFBRSxFQUFFVSxtQkFBVUMsTUFBVixDQUFpQkM7QUFETixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7Zm9ybWF0RnVsbERhdGVOb1RpbWV9IGZyb20gJy4uLy4uLy4uL0RhdGVVdGlscyc7XG5cbmZ1bmN0aW9uIGdldGRheXNBcnJheSgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBfdCgnU3VuZGF5JyksXG4gICAgICAgIF90KCdNb25kYXknKSxcbiAgICAgICAgX3QoJ1R1ZXNkYXknKSxcbiAgICAgICAgX3QoJ1dlZG5lc2RheScpLFxuICAgICAgICBfdCgnVGh1cnNkYXknKSxcbiAgICAgICAgX3QoJ0ZyaWRheScpLFxuICAgICAgICBfdCgnU2F0dXJkYXknKSxcbiAgICBdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRlU2VwYXJhdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICB0czogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBnZXRMYWJlbCgpIHtcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRoaXMucHJvcHMudHMpO1xuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHllc3RlcmRheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IGRheXMgPSBnZXRkYXlzQXJyYXkoKTtcbiAgICAgICAgeWVzdGVyZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpIC0gMSk7XG5cbiAgICAgICAgaWYgKGRhdGUudG9EYXRlU3RyaW5nKCkgPT09IHRvZGF5LnRvRGF0ZVN0cmluZygpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJ1RvZGF5Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0ZS50b0RhdGVTdHJpbmcoKSA9PT0geWVzdGVyZGF5LnRvRGF0ZVN0cmluZygpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJ1llc3RlcmRheScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRvZGF5LmdldFRpbWUoKSAtIGRhdGUuZ2V0VGltZSgpIDwgNiAqIDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgIHJldHVybiBkYXlzW2RhdGUuZ2V0RGF5KCldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEZ1bGxEYXRlTm9UaW1lKGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBBUklBIHRyZWF0cyA8aHIvPnMgYXMgc2VwYXJhdG9ycywgaGVyZSB3ZSBhYnVzZSB0aGVtIHNsaWdodGx5IHNvIG1hbnVhbGx5IHRyZWF0IHRoaXMgZW50aXJlIHRoaW5nIGFzIG9uZVxuICAgICAgICAvLyB0YWItaW5kZXg9LTEgdG8gYWxsb3cgaXQgdG8gYmUgZm9jdXNhYmxlIGJ1dCBkbyBub3QgYWRkIHRhYiBzdG9wIGZvciBpdCwgcHJpbWFyaWx5IGZvciBzY3JlZW4gcmVhZGVyc1xuICAgICAgICByZXR1cm4gPGgyIGNsYXNzTmFtZT1cIm14X0RhdGVTZXBhcmF0b3JcIiByb2xlPVwic2VwYXJhdG9yXCIgdGFiSW5kZXg9ey0xfT5cbiAgICAgICAgICAgIDxociByb2xlPVwibm9uZVwiIC8+XG4gICAgICAgICAgICA8ZGl2PnsgdGhpcy5nZXRMYWJlbCgpIH08L2Rpdj5cbiAgICAgICAgICAgIDxociByb2xlPVwibm9uZVwiIC8+XG4gICAgICAgIDwvaDI+O1xuICAgIH1cbn1cbiJdfQ==