"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

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
class Slider extends React.Component
/*:: <IProps>*/
{
  // offset is a terrible inverse approximation.
  // if the values represents some function f(x) = y where x is the
  // index of the array and y = values[x] then offset(f, y) = x
  // s.t f(x) = y.
  // it assumes a monotonic function and interpolates linearly between
  // y values.
  // Offset is used for finding the location of a value on a
  // non linear slider.
  offset(values
  /*: number[]*/
  , value
  /*: number*/
  )
  /*: number*/
  {
    // the index of the first number greater than value.
    const closest = values.reduce((prev, curr) => {
      return value > curr ? prev + 1 : prev;
    }, 0); // Off the left

    if (closest === 0) {
      return 0;
    } // Off the right


    if (closest === values.length) {
      return 100;
    } // Now


    const closestLessValue = values[closest - 1];
    const closestGreaterValue = values[closest];
    const intervalWidth = 1 / (values.length - 1);
    const linearInterpolation = (value - closestLessValue) / (closestGreaterValue - closestLessValue);
    return 100 * (closest - 1 + linearInterpolation) * intervalWidth;
  }

  render()
  /*: React.ReactNode*/
  {
    const dots = this.props.values.map(v => /*#__PURE__*/React.createElement(Dot, {
      active: v <= this.props.value,
      label: this.props.displayFunc(v),
      onClick: this.props.disabled ? () => {} : () => this.props.onSelectionChange(v),
      key: v,
      disabled: this.props.disabled
    }));
    let selection = null;

    if (!this.props.disabled) {
      const offset = this.offset(this.props.values, this.props.value);
      selection = /*#__PURE__*/React.createElement("div", {
        className: "mx_Slider_selection"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_Slider_selectionDot",
        style: {
          left: "calc(-0.55em + " + offset + "%)"
        }
      }), /*#__PURE__*/React.createElement("hr", {
        style: {
          width: offset + "%"
        }
      }));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_bar"
    }, /*#__PURE__*/React.createElement("hr", {
      onClick: this.props.disabled ? () => {} : this.onClick.bind(this)
    }), selection), /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_dotContainer"
    }, dots)));
  }

  onClick(event
  /*: React.MouseEvent*/
  ) {
    const width = event.target.clientWidth; // nativeEvent is safe to use because https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX
    // is supported by all modern browsers

    const relativeClick = event.nativeEvent.offsetX / width;
    const nearestValue = this.props.values[Math.round(relativeClick * (this.props.values.length - 1))];
    this.props.onSelectionChange(nearestValue);
  }

}

exports.default = Slider;

class Dot extends React.PureComponent
/*:: <IDotProps>*/
{
  render()
  /*: React.ReactNode*/
  {
    let className = "mx_Slider_dot";

    if (!this.props.disabled && this.props.active) {
      className += " mx_Slider_dotActive";
    }

    return /*#__PURE__*/React.createElement("span", {
      onClick: this.props.onClick,
      className: "mx_Slider_dotValue"
    }, /*#__PURE__*/React.createElement("div", {
      className: className
    }), /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_labelContainer"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_Slider_label"
    }, this.props.label)));
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1NsaWRlci50c3giXSwibmFtZXMiOlsiU2xpZGVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJvZmZzZXQiLCJ2YWx1ZXMiLCJ2YWx1ZSIsImNsb3Nlc3QiLCJyZWR1Y2UiLCJwcmV2IiwiY3VyciIsImxlbmd0aCIsImNsb3Nlc3RMZXNzVmFsdWUiLCJjbG9zZXN0R3JlYXRlclZhbHVlIiwiaW50ZXJ2YWxXaWR0aCIsImxpbmVhckludGVycG9sYXRpb24iLCJyZW5kZXIiLCJkb3RzIiwicHJvcHMiLCJtYXAiLCJ2IiwiZGlzcGxheUZ1bmMiLCJkaXNhYmxlZCIsIm9uU2VsZWN0aW9uQ2hhbmdlIiwic2VsZWN0aW9uIiwibGVmdCIsIndpZHRoIiwib25DbGljayIsImJpbmQiLCJldmVudCIsInRhcmdldCIsImNsaWVudFdpZHRoIiwicmVsYXRpdmVDbGljayIsIm5hdGl2ZUV2ZW50Iiwib2Zmc2V0WCIsIm5lYXJlc3RWYWx1ZSIsIk1hdGgiLCJyb3VuZCIsIkRvdCIsIlB1cmVDb21wb25lbnQiLCJjbGFzc05hbWUiLCJhY3RpdmUiLCJsYWJlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFzQmUsTUFBTUEsTUFBTixTQUFxQkMsS0FBSyxDQUFDQztBQUEzQjtBQUE2QztBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ1FDLEVBQUFBLE1BQVIsQ0FBZUM7QUFBZjtBQUFBLElBQWlDQztBQUFqQztBQUFBO0FBQUE7QUFBd0Q7QUFDcEQ7QUFDQSxVQUFNQyxPQUFPLEdBQUdGLE1BQU0sQ0FBQ0csTUFBUCxDQUFjLENBQUNDLElBQUQsRUFBT0MsSUFBUCxLQUFnQjtBQUMxQyxhQUFRSixLQUFLLEdBQUdJLElBQVIs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QUFsQixHQUE0QlIsS0FBbkQ7QUFDQSxVQUFNUyxZQUFZLEdBQUcsS0FBS2pCLEtBQUwsQ0FBV2IsTUFBWCxDQUFrQitCLElBQUksQ0FBQ0MsS0FBTCxDQUFXTCxhQUFhLElBQUksS0FBS2QsS0FBTCxDQUFXYixNQUFYLENBQWtCTSxNQUFsQixHQUEyQixDQUEvQixDQUF4QixDQUFsQixDQUFyQjtBQUNBLFNBQUtPLEtBQUwsQ0FBV0ssaUJBQVgsQ0FBNkJZLFlBQTdCO0FBQ0g7O0FBM0V1RDs7OztBQTRGNUQsTUFBTUcsR0FBTixTQUFrQnBDLEtBQUssQ0FBQ3FDO0FBQXhCO0FBQWlEO0FBQzdDdkIsRUFBQUEsTUFBTTtBQUFBO0FBQW9CO0FBQ3RCLFFBQUl3QixTQUFTLEdBQUcsZUFBaEI7O0FBQ0EsUUFBSSxDQUFDLEtBQUt0QixLQUFMLENBQVdJLFFBQVosSUFBd0IsS0FBS0osS0FBTCxDQUFXdUIsTUFBdkMsRUFBK0M7QUFDM0NELE1BQUFBLFNBQVMsSUFBSSxzQkFBYjtBQUNIOztBQUVELHdCQUFPO0FBQU0sTUFBQSxPQUFPLEVBQUUsS0FBS3RCLEtBQUwsQ0FBV1MsT0FBMUI7QUFBbUMsTUFBQSxTQUFTLEVBQUM7QUFBN0Msb0JBQ0g7QUFBSyxNQUFBLFNBQVMsRUFBRWE7QUFBaEIsTUFERyxlQUVIO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDSyxLQUFLdEIsS0FBTCxDQUFXd0IsS0FEaEIsQ0FESixDQUZHLENBQVA7QUFRSDs7QUFmNEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIEEgY2FsbGJhY2sgZm9yIHRoZSBzZWxlY3RlZCB2YWx1ZVxuICAgIG9uU2VsZWN0aW9uQ2hhbmdlOiAodmFsdWU6IG51bWJlcikgPT4gdm9pZDtcblxuICAgIC8vIFRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBzbGlkZXJcbiAgICB2YWx1ZTogbnVtYmVyO1xuXG4gICAgLy8gVGhlIHJhbmdlIGFuZCB2YWx1ZXMgb2YgdGhlIHNsaWRlclxuICAgIC8vIEN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGFuIGFzY2VuZGluZywgY29uc3RhbnQgaW50ZXJ2YWwgcmFuZ2VcbiAgICB2YWx1ZXM6IG51bWJlcltdO1xuXG4gICAgLy8gQSBmdW5jdGlvbiBmb3IgZm9ybWF0dGluZyB0aGUgdGhlIHZhbHVlc1xuICAgIGRpc3BsYXlGdW5jOiAodmFsdWU6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4gICAgLy8gV2hldGhlciB0aGUgc2xpZGVyIGlzIGRpc2FibGVkXG4gICAgZGlzYWJsZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsaWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICAvLyBvZmZzZXQgaXMgYSB0ZXJyaWJsZSBpbnZlcnNlIGFwcHJveGltYXRpb24uXG4gICAgLy8gaWYgdGhlIHZhbHVlcyByZXByZXNlbnRzIHNvbWUgZnVuY3Rpb24gZih4KSA9IHkgd2hlcmUgeCBpcyB0aGVcbiAgICAvLyBpbmRleCBvZiB0aGUgYXJyYXkgYW5kIHkgPSB2YWx1ZXNbeF0gdGhlbiBvZmZzZXQoZiwgeSkgPSB4XG4gICAgLy8gcy50IGYoeCkgPSB5LlxuICAgIC8vIGl0IGFzc3VtZXMgYSBtb25vdG9uaWMgZnVuY3Rpb24gYW5kIGludGVycG9sYXRlcyBsaW5lYXJseSBiZXR3ZWVuXG4gICAgLy8geSB2YWx1ZXMuXG4gICAgLy8gT2Zmc2V0IGlzIHVzZWQgZm9yIGZpbmRpbmcgdGhlIGxvY2F0aW9uIG9mIGEgdmFsdWUgb24gYVxuICAgIC8vIG5vbiBsaW5lYXIgc2xpZGVyLlxuICAgIHByaXZhdGUgb2Zmc2V0KHZhbHVlczogbnVtYmVyW10sIHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICAvLyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IG51bWJlciBncmVhdGVyIHRoYW4gdmFsdWUuXG4gICAgICAgIGNvbnN0IGNsb3Nlc3QgPSB2YWx1ZXMucmVkdWNlKChwcmV2LCBjdXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKHZhbHVlID4gY3VyciA/IHByZXYgKyAxIDogcHJldik7XG4gICAgICAgIH0sIDApO1xuXG4gICAgICAgIC8vIE9mZiB0aGUgbGVmdFxuICAgICAgICBpZiAoY2xvc2VzdCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPZmYgdGhlIHJpZ2h0XG4gICAgICAgIGlmIChjbG9zZXN0ID09PSB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gMTAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93XG4gICAgICAgIGNvbnN0IGNsb3Nlc3RMZXNzVmFsdWUgPSB2YWx1ZXNbY2xvc2VzdCAtIDFdO1xuICAgICAgICBjb25zdCBjbG9zZXN0R3JlYXRlclZhbHVlID0gdmFsdWVzW2Nsb3Nlc3RdO1xuXG4gICAgICAgIGNvbnN0IGludGVydmFsV2lkdGggPSAxIC8gKHZhbHVlcy5sZW5ndGggLSAxKTtcblxuICAgICAgICBjb25zdCBsaW5lYXJJbnRlcnBvbGF0aW9uID0gKHZhbHVlIC0gY2xvc2VzdExlc3NWYWx1ZSkgLyAoY2xvc2VzdEdyZWF0ZXJWYWx1ZSAtIGNsb3Nlc3RMZXNzVmFsdWUpO1xuXG4gICAgICAgIHJldHVybiAxMDAgKiAoY2xvc2VzdCAtIDEgKyBsaW5lYXJJbnRlcnBvbGF0aW9uKSAqIGludGVydmFsV2lkdGg7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IGRvdHMgPSB0aGlzLnByb3BzLnZhbHVlcy5tYXAodiA9PiA8RG90XG4gICAgICAgICAgICBhY3RpdmU9e3YgPD0gdGhpcy5wcm9wcy52YWx1ZX1cbiAgICAgICAgICAgIGxhYmVsPXt0aGlzLnByb3BzLmRpc3BsYXlGdW5jKHYpfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5kaXNhYmxlZCA/ICgpID0+IHt9IDogKCkgPT4gdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZSh2KX1cbiAgICAgICAgICAgIGtleT17dn1cbiAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAvPik7XG5cbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldCh0aGlzLnByb3BzLnZhbHVlcywgdGhpcy5wcm9wcy52YWx1ZSk7XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1NsaWRlcl9zZWxlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NsaWRlcl9zZWxlY3Rpb25Eb3RcIiBzdHlsZT17e2xlZnQ6IFwiY2FsYygtMC41NWVtICsgXCIgKyBvZmZzZXQgKyBcIiUpXCJ9fSAvPlxuICAgICAgICAgICAgICAgIDxociBzdHlsZT17e3dpZHRoOiBvZmZzZXQgKyBcIiVcIn19IC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TbGlkZXJcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TbGlkZXJfYmFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxociBvbkNsaWNrPXt0aGlzLnByb3BzLmRpc2FibGVkID8gKCkgPT4ge30gOiB0aGlzLm9uQ2xpY2suYmluZCh0aGlzKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgeyBzZWxlY3Rpb24gfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2xpZGVyX2RvdENvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICB7ZG90c31cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgb25DbGljayhldmVudDogUmVhY3QuTW91c2VFdmVudCkge1xuICAgICAgICBjb25zdCB3aWR0aCA9IChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmNsaWVudFdpZHRoO1xuICAgICAgICAvLyBuYXRpdmVFdmVudCBpcyBzYWZlIHRvIHVzZSBiZWNhdXNlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50L29mZnNldFhcbiAgICAgICAgLy8gaXMgc3VwcG9ydGVkIGJ5IGFsbCBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgY29uc3QgcmVsYXRpdmVDbGljayA9IChldmVudC5uYXRpdmVFdmVudC5vZmZzZXRYIC8gd2lkdGgpO1xuICAgICAgICBjb25zdCBuZWFyZXN0VmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlc1tNYXRoLnJvdW5kKHJlbGF0aXZlQ2xpY2sgKiAodGhpcy5wcm9wcy52YWx1ZXMubGVuZ3RoIC0gMSkpXTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdGlvbkNoYW5nZShuZWFyZXN0VmFsdWUpO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElEb3RQcm9wcyB7XG4gICAgLy8gQ2FsbGJhY2sgZm9yIGJlaGF2aW9yIG9uY2xpY2tcbiAgICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xuXG4gICAgLy8gV2hldGhlciB0aGUgZG90IHNob3VsZCBhcHBlYXIgYWN0aXZlXG4gICAgYWN0aXZlOiBib29sZWFuO1xuXG4gICAgLy8gVGhlIGxhYmVsIG9uIHRoZSBkb3RcbiAgICBsYWJlbDogc3RyaW5nO1xuXG4gICAgLy8gV2hldGhlciB0aGUgc2xpZGVyIGlzIGRpc2FibGVkXG4gICAgZGlzYWJsZWQ6IGJvb2xlYW47XG59XG5cbmNsYXNzIERvdCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SURvdFByb3BzPiB7XG4gICAgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBcIm14X1NsaWRlcl9kb3RcIjtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmRpc2FibGVkICYmIHRoaXMucHJvcHMuYWN0aXZlKSB7XG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gXCIgbXhfU2xpZGVyX2RvdEFjdGl2ZVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxzcGFuIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30gY2xhc3NOYW1lPVwibXhfU2xpZGVyX2RvdFZhbHVlXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TbGlkZXJfbGFiZWxDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NsaWRlcl9sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NwYW4+O1xuICAgIH1cbn1cbiJdfQ==