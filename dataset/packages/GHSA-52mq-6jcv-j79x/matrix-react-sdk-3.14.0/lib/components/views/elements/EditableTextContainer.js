"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

/*
Copyright 2015, 2016 OpenMarket Ltd

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

/**
 * A component which wraps an EditableText, with a spinner while updates take
 * place.
 *
 * Parent components should supply an 'onSubmit' callback which returns a
 * promise; a spinner is shown until the promise resolves.
 *
 * The parent can also supply a 'getInitialValue' callback, which works in a
 * similarly asynchronous way. If this is not provided, the initial value is
 * taken from the 'initialValue' property.
 */
class EditableTextContainer extends _react.default.Component {
  constructor(props) {
    super(props);
    this._unmounted = false;
    this.state = {
      busy: false,
      errorString: null,
      value: props.initialValue
    };
    this._onValueChanged = this._onValueChanged.bind(this);
  }

  componentDidMount() {
    if (this.props.getInitialValue === undefined) {
      // use whatever was given in the initialValue property.
      return;
    }

    this.setState({
      busy: true
    });
    this.props.getInitialValue().then(result => {
      if (this._unmounted) {
        return;
      }

      this.setState({
        busy: false,
        value: result
      });
    }, error => {
      if (this._unmounted) {
        return;
      }

      this.setState({
        errorString: error.toString(),
        busy: false
      });
    });
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _onValueChanged(value, shouldSubmit) {
    if (!shouldSubmit) {
      return;
    }

    this.setState({
      busy: true,
      errorString: null
    });
    this.props.onSubmit(value).then(() => {
      if (this._unmounted) {
        return;
      }

      this.setState({
        busy: false,
        value: value
      });
    }, error => {
      if (this._unmounted) {
        return;
      }

      this.setState({
        errorString: error.toString(),
        busy: false
      });
    });
  }

  render() {
    if (this.state.busy) {
      const Loader = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement(Loader, null);
    } else if (this.state.errorString) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.errorString);
    } else {
      const EditableText = sdk.getComponent('elements.EditableText');
      return /*#__PURE__*/_react.default.createElement(EditableText, {
        initialValue: this.state.value,
        placeholder: this.props.placeholder,
        onValueChanged: this._onValueChanged,
        blurToSubmit: this.props.blurToSubmit
      });
    }
  }

}

exports.default = EditableTextContainer;
EditableTextContainer.propTypes = {
  /* callback to retrieve the initial value. */
  getInitialValue: _propTypes.default.func,

  /* initial value; used if getInitialValue is not given */
  initialValue: _propTypes.default.string,

  /* placeholder text to use when the value is empty (and not being
   * edited) */
  placeholder: _propTypes.default.string,

  /* callback to update the value. Called with a single argument: the new
   * value. */
  onSubmit: _propTypes.default.func,

  /* should the input submit when focus is lost? */
  blurToSubmit: _propTypes.default.bool
};
EditableTextContainer.defaultProps = {
  initialValue: "",
  placeholder: "",
  blurToSubmit: false,
  onSubmit: function (v) {
    return Promise.resolve();
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0VkaXRhYmxlVGV4dENvbnRhaW5lci5qcyJdLCJuYW1lcyI6WyJFZGl0YWJsZVRleHRDb250YWluZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJfdW5tb3VudGVkIiwic3RhdGUiLCJidXN5IiwiZXJyb3JTdHJpbmciLCJ2YWx1ZSIsImluaXRpYWxWYWx1ZSIsIl9vblZhbHVlQ2hhbmdlZCIsImJpbmQiLCJjb21wb25lbnREaWRNb3VudCIsImdldEluaXRpYWxWYWx1ZSIsInVuZGVmaW5lZCIsInNldFN0YXRlIiwidGhlbiIsInJlc3VsdCIsImVycm9yIiwidG9TdHJpbmciLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInNob3VsZFN1Ym1pdCIsIm9uU3VibWl0IiwicmVuZGVyIiwiTG9hZGVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRWRpdGFibGVUZXh0IiwicGxhY2Vob2xkZXIiLCJibHVyVG9TdWJtaXQiLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJmdW5jIiwic3RyaW5nIiwiYm9vbCIsImRlZmF1bHRQcm9wcyIsInYiLCJQcm9taXNlIiwicmVzb2x2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEscUJBQU4sU0FBb0NDLGVBQU1DLFNBQTFDLENBQW9EO0FBQy9EQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFFQSxTQUFLQyxVQUFMLEdBQWtCLEtBQWxCO0FBQ0EsU0FBS0MsS0FBTCxHQUFhO0FBQ1RDLE1BQUFB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Rm5FOUIscUJBQXFCLENBQUMrQixTQUF0QixHQUFrQztBQUM5QjtBQUNBakIsRUFBQUEsZUFBZSxFQUFFa0IsbUJBQVVDLElBRkc7O0FBSTlCO0FBQ0F2QixFQUFBQSxZQUFZLEVBQUVzQixtQkFBVUUsTUFMTTs7QUFPOUI7QUFDSjtBQUNJTCxFQUFBQSxXQUFXLEVBQUVHLG1CQUFVRSxNQVRPOztBQVc5QjtBQUNKO0FBQ0lYLEVBQUFBLFFBQVEsRUFBRVMsbUJBQVVDLElBYlU7O0FBZTlCO0FBQ0FILEVBQUFBLFlBQVksRUFBRUUsbUJBQVVHO0FBaEJNLENBQWxDO0FBb0JBbkMscUJBQXFCLENBQUNvQyxZQUF0QixHQUFxQztBQUNqQzFCLEVBQUFBLFlBQVksRUFBRSxFQURtQjtBQUVqQ21CLEVBQUFBLFdBQVcsRUFBRSxFQUZvQjtBQUdqQ0MsRUFBQUEsWUFBWSxFQUFFLEtBSG1CO0FBSWpDUCxFQUFBQSxRQUFRLEVBQUUsVUFBU2MsQ0FBVCxFQUFZO0FBQUMsV0FBT0MsT0FBTyxDQUFDQyxPQUFSLEVBQVA7QUFBMkI7QUFKakIsQ0FBckMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5cbi8qKlxuICogQSBjb21wb25lbnQgd2hpY2ggd3JhcHMgYW4gRWRpdGFibGVUZXh0LCB3aXRoIGEgc3Bpbm5lciB3aGlsZSB1cGRhdGVzIHRha2VcbiAqIHBsYWNlLlxuICpcbiAqIFBhcmVudCBjb21wb25lbnRzIHNob3VsZCBzdXBwbHkgYW4gJ29uU3VibWl0JyBjYWxsYmFjayB3aGljaCByZXR1cm5zIGFcbiAqIHByb21pc2U7IGEgc3Bpbm5lciBpcyBzaG93biB1bnRpbCB0aGUgcHJvbWlzZSByZXNvbHZlcy5cbiAqXG4gKiBUaGUgcGFyZW50IGNhbiBhbHNvIHN1cHBseSBhICdnZXRJbml0aWFsVmFsdWUnIGNhbGxiYWNrLCB3aGljaCB3b3JrcyBpbiBhXG4gKiBzaW1pbGFybHkgYXN5bmNocm9ub3VzIHdheS4gSWYgdGhpcyBpcyBub3QgcHJvdmlkZWQsIHRoZSBpbml0aWFsIHZhbHVlIGlzXG4gKiB0YWtlbiBmcm9tIHRoZSAnaW5pdGlhbFZhbHVlJyBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdGFibGVUZXh0Q29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yU3RyaW5nOiBudWxsLFxuICAgICAgICAgICAgdmFsdWU6IHByb3BzLmluaXRpYWxWYWx1ZSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fb25WYWx1ZUNoYW5nZWQgPSB0aGlzLl9vblZhbHVlQ2hhbmdlZC5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5nZXRJbml0aWFsVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gdXNlIHdoYXRldmVyIHdhcyBnaXZlbiBpbiB0aGUgaW5pdGlhbFZhbHVlIHByb3BlcnR5LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuXG4gICAgICAgIHRoaXMucHJvcHMuZ2V0SW5pdGlhbFZhbHVlKCkudGhlbihcbiAgICAgICAgICAgIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBlcnJvclN0cmluZzogZXJyb3IudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIF9vblZhbHVlQ2hhbmdlZCh2YWx1ZSwgc2hvdWxkU3VibWl0KSB7XG4gICAgICAgIGlmICghc2hvdWxkU3VibWl0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBlcnJvclN0cmluZzogbnVsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vblN1Ym1pdCh2YWx1ZSkudGhlbihcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yU3RyaW5nOiBlcnJvci50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5idXN5KSB7XG4gICAgICAgICAgICBjb25zdCBMb2FkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPExvYWRlciAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmVycm9yU3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIj57IHRoaXMuc3RhdGUuZXJyb3JTdHJpbmcgfTwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IEVkaXRhYmxlVGV4dCA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkVkaXRhYmxlVGV4dCcpO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8RWRpdGFibGVUZXh0IGluaXRpYWxWYWx1ZT17dGhpcy5zdGF0ZS52YWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uVmFsdWVDaGFuZ2VkPXt0aGlzLl9vblZhbHVlQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgYmx1clRvU3VibWl0PXt0aGlzLnByb3BzLmJsdXJUb1N1Ym1pdH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuRWRpdGFibGVUZXh0Q29udGFpbmVyLnByb3BUeXBlcyA9IHtcbiAgICAvKiBjYWxsYmFjayB0byByZXRyaWV2ZSB0aGUgaW5pdGlhbCB2YWx1ZS4gKi9cbiAgICBnZXRJbml0aWFsVmFsdWU6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgLyogaW5pdGlhbCB2YWx1ZTsgdXNlZCBpZiBnZXRJbml0aWFsVmFsdWUgaXMgbm90IGdpdmVuICovXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgLyogcGxhY2Vob2xkZXIgdGV4dCB0byB1c2Ugd2hlbiB0aGUgdmFsdWUgaXMgZW1wdHkgKGFuZCBub3QgYmVpbmdcbiAgICAgKiBlZGl0ZWQpICovXG4gICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAvKiBjYWxsYmFjayB0byB1cGRhdGUgdGhlIHZhbHVlLiBDYWxsZWQgd2l0aCBhIHNpbmdsZSBhcmd1bWVudDogdGhlIG5ld1xuICAgICAqIHZhbHVlLiAqL1xuICAgIG9uU3VibWl0OiBQcm9wVHlwZXMuZnVuYyxcblxuICAgIC8qIHNob3VsZCB0aGUgaW5wdXQgc3VibWl0IHdoZW4gZm9jdXMgaXMgbG9zdD8gKi9cbiAgICBibHVyVG9TdWJtaXQ6IFByb3BUeXBlcy5ib29sLFxufTtcblxuXG5FZGl0YWJsZVRleHRDb250YWluZXIuZGVmYXVsdFByb3BzID0ge1xuICAgIGluaXRpYWxWYWx1ZTogXCJcIixcbiAgICBwbGFjZWhvbGRlcjogXCJcIixcbiAgICBibHVyVG9TdWJtaXQ6IGZhbHNlLFxuICAgIG9uU3VibWl0OiBmdW5jdGlvbih2KSB7cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyB9LFxufTtcbiJdfQ==