"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Keyboard = require("../../../Keyboard");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd

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
class EditableText extends _react.default.Component {
  constructor(props) {
    super(props); // we track value as an JS object field rather than in React state
    // as React doesn't play nice with contentEditable.

    (0, _defineProperty2.default)(this, "state", {
      phase: EditableText.Phases.Display
    });
    (0, _defineProperty2.default)(this, "showPlaceholder", show => {
      if (show) {
        this._editable_div.current.textContent = this.props.placeholder;

        this._editable_div.current.setAttribute("class", this.props.className + " " + this.props.placeholderClassName);

        this.placeholder = true;
        this.value = '';
      } else {
        this._editable_div.current.textContent = this.value;

        this._editable_div.current.setAttribute("class", this.props.className);

        this.placeholder = false;
      }
    });
    (0, _defineProperty2.default)(this, "getValue", () => this.value);
    (0, _defineProperty2.default)(this, "setValue", value => {
      this.value = value;
      this.showPlaceholder(!this.value);
    });
    (0, _defineProperty2.default)(this, "edit", () => {
      this.setState({
        phase: EditableText.Phases.Edit
      });
    });
    (0, _defineProperty2.default)(this, "cancelEdit", () => {
      this.setState({
        phase: EditableText.Phases.Display
      });
      this.value = this.props.initialValue;
      this.showPlaceholder(!this.value);
      this.onValueChanged(false);

      this._editable_div.current.blur();
    });
    (0, _defineProperty2.default)(this, "onValueChanged", shouldSubmit => {
      this.props.onValueChanged(this.value, shouldSubmit);
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      // console.log("keyDown: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);
      if (this.placeholder) {
        this.showPlaceholder(false);
      }

      if (ev.key === _Keyboard.Key.ENTER) {
        ev.stopPropagation();
        ev.preventDefault();
      } // console.log("keyDown: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);

    });
    (0, _defineProperty2.default)(this, "onKeyUp", ev => {
      // console.log("keyUp: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);
      if (!ev.target.textContent) {
        this.showPlaceholder(true);
      } else if (!this.placeholder) {
        this.value = ev.target.textContent;
      }

      if (ev.key === _Keyboard.Key.ENTER) {
        this.onFinish(ev);
      } else if (ev.key === _Keyboard.Key.ESCAPE) {
        this.cancelEdit();
      } // console.log("keyUp: textContent=" + ev.target.textContent + ", value=" + this.value + ", placeholder=" + this.placeholder);

    });
    (0, _defineProperty2.default)(this, "onClickDiv", ev => {
      if (!this.props.editable) return;
      this.setState({
        phase: EditableText.Phases.Edit
      });
    });
    (0, _defineProperty2.default)(this, "onFocus", ev => {
      //ev.target.setSelectionRange(0, ev.target.textContent.length);
      const node = ev.target.childNodes[0];

      if (node) {
        const range = document.createRange();
        range.setStart(node, 0);
        range.setEnd(node, node.length);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
    (0, _defineProperty2.default)(this, "onFinish", (ev, shouldSubmit) => {
      const self = this;
      const submit = ev.key === _Keyboard.Key.ENTER || shouldSubmit;
      this.setState({
        phase: EditableText.Phases.Display
      }, () => {
        if (this.value !== this.props.initialValue) {
          self.onValueChanged(submit);
        }
      });
    });
    (0, _defineProperty2.default)(this, "onBlur", ev => {
      const sel = window.getSelection();
      sel.removeAllRanges();

      if (this.props.blurToCancel) {
        this.cancelEdit();
      } else {
        this.onFinish(ev, this.props.blurToSubmit);
      }

      this.showPlaceholder(!this.value);
    });
    this.value = '';
    this.placeholder = false;
    this._editable_div = /*#__PURE__*/(0, _react.createRef)();
  }

  // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.initialValue !== this.props.initialValue) {
      this.value = nextProps.initialValue;

      if (this._editable_div.current) {
        this.showPlaceholder(!this.value);
      }
    }
  }

  componentDidMount() {
    this.value = this.props.initialValue;

    if (this._editable_div.current) {
      this.showPlaceholder(!this.value);
    }
  }

  render() {
    const {
      className,
      editable,
      initialValue,
      label,
      labelClassName
    } = this.props;
    let editableEl;

    if (!editable || this.state.phase === EditableText.Phases.Display && (label || labelClassName) && !this.value) {
      // show the label
      editableEl = /*#__PURE__*/_react.default.createElement("div", {
        className: className + " " + labelClassName,
        onClick: this.onClickDiv
      }, label || initialValue);
    } else {
      // show the content editable div, but manually manage its contents as react and contentEditable don't play nice together
      editableEl = /*#__PURE__*/_react.default.createElement("div", {
        ref: this._editable_div,
        contentEditable: true,
        className: className,
        onKeyDown: this.onKeyDown,
        onKeyUp: this.onKeyUp,
        onFocus: this.onFocus,
        onBlur: this.onBlur
      });
    }

    return editableEl;
  }

}

exports.default = EditableText;
(0, _defineProperty2.default)(EditableText, "propTypes", {
  onValueChanged: _propTypes.default.func,
  initialValue: _propTypes.default.string,
  label: _propTypes.default.string,
  placeholder: _propTypes.default.string,
  className: _propTypes.default.string,
  labelClassName: _propTypes.default.string,
  placeholderClassName: _propTypes.default.string,
  // Overrides blurToSubmit if true
  blurToCancel: _propTypes.default.bool,
  // Will cause onValueChanged(value, true) to fire on blur
  blurToSubmit: _propTypes.default.bool,
  editable: _propTypes.default.bool
});
(0, _defineProperty2.default)(EditableText, "Phases", {
  Display: "display",
  Edit: "edit"
});
(0, _defineProperty2.default)(EditableText, "defaultProps", {
  onValueChanged() {},

  initialValue: '',
  label: '',
  placeholder: '',
  editable: true,
  className: "mx_EditableText",
  placeholderClassName: "mx_EditableText_placeholder",
  blurToSubmit: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0VkaXRhYmxlVGV4dC5qcyJdLCJuYW1lcyI6WyJFZGl0YWJsZVRleHQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwaGFzZSIsIlBoYXNlcyIsIkRpc3BsYXkiLCJzaG93IiwiX2VkaXRhYmxlX2RpdiIsImN1cnJlbnQiLCJ0ZXh0Q29udGVudCIsInBsYWNlaG9sZGVyIiwic2V0QXR0cmlidXRlIiwiY2xhc3NOYW1lIiwicGxhY2Vob2xkZXJDbGFzc05hbWUiLCJ2YWx1ZSIsInNob3dQbGFjZWhvbGRlciIsInNldFN0YXRlIiwiRWRpdCIsImluaXRpYWxWYWx1ZSIsIm9uVmFsdWVDaGFuZ2VkIiwiYmx1ciIsInNob3VsZFN1Ym1pdCIsImV2Iiwia2V5IiwiS2V5IiwiRU5URVIiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInRhcmdldCIsIm9uRmluaXNoIiwiRVNDQVBFIiwiY2FuY2VsRWRpdCIsImVkaXRhYmxlIiwibm9kZSIsImNoaWxkTm9kZXMiLCJyYW5nZSIsImRvY3VtZW50IiwiY3JlYXRlUmFuZ2UiLCJzZXRTdGFydCIsInNldEVuZCIsImxlbmd0aCIsInNlbCIsIndpbmRvdyIsImdldFNlbGVjdGlvbiIsInJlbW92ZUFsbFJhbmdlcyIsImFkZFJhbmdlIiwic2VsZiIsInN1Ym1pdCIsImJsdXJUb0NhbmNlbCIsImJsdXJUb1N1Ym1pdCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwiY29tcG9uZW50RGlkTW91bnQiLCJyZW5kZXIiLCJsYWJlbCIsImxhYmVsQ2xhc3NOYW1lIiwiZWRpdGFibGVFbCIsInN0YXRlIiwib25DbGlja0RpdiIsIm9uS2V5RG93biIsIm9uS2V5VXAiLCJvbkZvY3VzIiwib25CbHVyIiwiUHJvcFR5cGVzIiwiZnVuYyIsInN0cmluZyIsImJvb2wiXSwi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QUFFNEMsbUJBQVVDLElBRFg7QUFFZjlDLEVBQUFBLFlBQVksRUFBRTZDLG1CQUFVRSxNQUZUO0FBR2ZYLEVBQUFBLEtBQUssRUFBRVMsbUJBQVVFLE1BSEY7QUFJZnZELEVBQUFBLFdBQVcsRUFBRXFELG1CQUFVRSxNQUpSO0FBS2ZyRCxFQUFBQSxTQUFTLEVBQUVtRCxtQkFBVUUsTUFMTjtBQU1mVixFQUFBQSxjQUFjLEVBQUVRLG1CQUFVRSxNQU5YO0FBT2ZwRCxFQUFBQSxvQkFBb0IsRUFBRWtELG1CQUFVRSxNQVBqQjtBQVFmO0FBQ0FqQixFQUFBQSxZQUFZLEVBQUVlLG1CQUFVRyxJQVRUO0FBVWY7QUFDQWpCLEVBQUFBLFlBQVksRUFBRWMsbUJBQVVHLElBWFQ7QUFZZmxDLEVBQUFBLFFBQVEsRUFBRStCLG1CQUFVRztBQVpMLEM7OEJBREZwRSxZLFlBZ0JEO0FBQ1pPLEVBQUFBLE9BQU8sRUFBRSxTQURHO0FBRVpZLEVBQUFBLElBQUksRUFBRTtBQUZNLEM7OEJBaEJDbkIsWSxrQkFxQks7QUFDbEJxQixFQUFBQSxjQUFjLEdBQUcsQ0FBRSxDQUREOztBQUVsQkQsRUFBQUEsWUFBWSxFQUFFLEVBRkk7QUFHbEJvQyxFQUFBQSxLQUFLLEVBQUUsRUFIVztBQUlsQjVDLEVBQUFBLFdBQVcsRUFBRSxFQUpLO0FBS2xCc0IsRUFBQUEsUUFBUSxFQUFFLElBTFE7QUFNbEJwQixFQUFBQSxTQUFTLEVBQUUsaUJBTk87QUFPbEJDLEVBQUFBLG9CQUFvQixFQUFFLDZCQVBKO0FBUWxCb0MsRUFBQUEsWUFBWSxFQUFFO0FBUkksQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVkaXRhYmxlVGV4dCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25WYWx1ZUNoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpbml0aWFsVmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBwbGFjZWhvbGRlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBsYWJlbENsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgcGxhY2Vob2xkZXJDbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIC8vIE92ZXJyaWRlcyBibHVyVG9TdWJtaXQgaWYgdHJ1ZVxuICAgICAgICBibHVyVG9DYW5jZWw6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICAvLyBXaWxsIGNhdXNlIG9uVmFsdWVDaGFuZ2VkKHZhbHVlLCB0cnVlKSB0byBmaXJlIG9uIGJsdXJcbiAgICAgICAgYmx1clRvU3VibWl0OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgZWRpdGFibGU6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0aWMgUGhhc2VzID0ge1xuICAgICAgICBEaXNwbGF5OiBcImRpc3BsYXlcIixcbiAgICAgICAgRWRpdDogXCJlZGl0XCIsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIG9uVmFsdWVDaGFuZ2VkKCkge30sXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgICAgIGxhYmVsOiAnJyxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICcnLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBcIm14X0VkaXRhYmxlVGV4dFwiLFxuICAgICAgICBwbGFjZWhvbGRlckNsYXNzTmFtZTogXCJteF9FZGl0YWJsZVRleHRfcGxhY2Vob2xkZXJcIixcbiAgICAgICAgYmx1clRvU3VibWl0OiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIHdlIHRyYWNrIHZhbHVlIGFzIGFuIEpTIG9iamVjdCBmaWVsZCByYXRoZXIgdGhhbiBpbiBSZWFjdCBzdGF0ZVxuICAgICAgICAvLyBhcyBSZWFjdCBkb2Vzbid0IHBsYXkgbmljZSB3aXRoIGNvbnRlbnRFZGl0YWJsZS5cbiAgICAgICAgdGhpcy52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLnBsYWNlaG9sZGVyID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fZWRpdGFibGVfZGl2ID0gY3JlYXRlUmVmKCk7XG4gICAgfVxuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHBoYXNlOiBFZGl0YWJsZVRleHQuUGhhc2VzLkRpc3BsYXksXG4gICAgfTtcblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmluaXRpYWxWYWx1ZSAhPT0gdGhpcy5wcm9wcy5pbml0aWFsVmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBuZXh0UHJvcHMuaW5pdGlhbFZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2VkaXRhYmxlX2Rpdi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93UGxhY2Vob2xkZXIoIXRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuX2VkaXRhYmxlX2Rpdi5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNob3dQbGFjZWhvbGRlcighdGhpcy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93UGxhY2Vob2xkZXIgPSBzaG93ID0+IHtcbiAgICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRhYmxlX2Rpdi5jdXJyZW50LnRleHRDb250ZW50ID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlcjtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRhYmxlX2Rpdi5jdXJyZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgKyBcIiBcIiArIHRoaXMucHJvcHMucGxhY2Vob2xkZXJDbGFzc05hbWUpO1xuICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlciA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0YWJsZV9kaXYuY3VycmVudC50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9lZGl0YWJsZV9kaXYuY3VycmVudC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLnByb3BzLmNsYXNzTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnBsYWNlaG9sZGVyID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZ2V0VmFsdWUgPSAoKSA9PiB0aGlzLnZhbHVlO1xuXG4gICAgc2V0VmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zaG93UGxhY2Vob2xkZXIoIXRoaXMudmFsdWUpO1xuICAgIH07XG5cbiAgICBlZGl0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBFZGl0YWJsZVRleHQuUGhhc2VzLkVkaXQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjYW5jZWxFZGl0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBFZGl0YWJsZVRleHQuUGhhc2VzLkRpc3BsYXksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5wcm9wcy5pbml0aWFsVmFsdWU7XG4gICAgICAgIHRoaXMuc2hvd1BsYWNlaG9sZGVyKCF0aGlzLnZhbHVlKTtcbiAgICAgICAgdGhpcy5vblZhbHVlQ2hhbmdlZChmYWxzZSk7XG4gICAgICAgIHRoaXMuX2VkaXRhYmxlX2Rpdi5jdXJyZW50LmJsdXIoKTtcbiAgICB9O1xuXG4gICAgb25WYWx1ZUNoYW5nZWQgPSBzaG91bGRTdWJtaXQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uVmFsdWVDaGFuZ2VkKHRoaXMudmFsdWUsIHNob3VsZFN1Ym1pdCk7XG4gICAgfTtcblxuICAgIG9uS2V5RG93biA9IGV2ID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJrZXlEb3duOiB0ZXh0Q29udGVudD1cIiArIGV2LnRhcmdldC50ZXh0Q29udGVudCArIFwiLCB2YWx1ZT1cIiArIHRoaXMudmFsdWUgKyBcIiwgcGxhY2Vob2xkZXI9XCIgKyB0aGlzLnBsYWNlaG9sZGVyKTtcblxuICAgICAgICBpZiAodGhpcy5wbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgdGhpcy5zaG93UGxhY2Vob2xkZXIoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2LmtleSA9PT0gS2V5LkVOVEVSKSB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImtleURvd246IHRleHRDb250ZW50PVwiICsgZXYudGFyZ2V0LnRleHRDb250ZW50ICsgXCIsIHZhbHVlPVwiICsgdGhpcy52YWx1ZSArIFwiLCBwbGFjZWhvbGRlcj1cIiArIHRoaXMucGxhY2Vob2xkZXIpO1xuICAgIH07XG5cbiAgICBvbktleVVwID0gZXYgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImtleVVwOiB0ZXh0Q29udGVudD1cIiArIGV2LnRhcmdldC50ZXh0Q29udGVudCArIFwiLCB2YWx1ZT1cIiArIHRoaXMudmFsdWUgKyBcIiwgcGxhY2Vob2xkZXI9XCIgKyB0aGlzLnBsYWNlaG9sZGVyKTtcblxuICAgICAgICBpZiAoIWV2LnRhcmdldC50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgdGhpcy5zaG93UGxhY2Vob2xkZXIodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMucGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBldi50YXJnZXQudGV4dENvbnRlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXYua2V5ID09PSBLZXkuRU5URVIpIHtcbiAgICAgICAgICAgIHRoaXMub25GaW5pc2goZXYpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2LmtleSA9PT0gS2V5LkVTQ0FQRSkge1xuICAgICAgICAgICAgdGhpcy5jYW5jZWxFZGl0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImtleVVwOiB0ZXh0Q29udGVudD1cIiArIGV2LnRhcmdldC50ZXh0Q29udGVudCArIFwiLCB2YWx1ZT1cIiArIHRoaXMudmFsdWUgKyBcIiwgcGxhY2Vob2xkZXI9XCIgKyB0aGlzLnBsYWNlaG9sZGVyKTtcbiAgICB9O1xuXG4gICAgb25DbGlja0RpdiA9IGV2ID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmVkaXRhYmxlKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogRWRpdGFibGVUZXh0LlBoYXNlcy5FZGl0LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25Gb2N1cyA9IGV2ID0+IHtcbiAgICAgICAgLy9ldi50YXJnZXQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgZXYudGFyZ2V0LnRleHRDb250ZW50Lmxlbmd0aCk7XG5cbiAgICAgICAgY29uc3Qgbm9kZSA9IGV2LnRhcmdldC5jaGlsZE5vZGVzWzBdO1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgcmFuZ2Uuc2V0U3RhcnQobm9kZSwgMCk7XG4gICAgICAgICAgICByYW5nZS5zZXRFbmQobm9kZSwgbm9kZS5sZW5ndGgpO1xuXG4gICAgICAgICAgICBjb25zdCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uRmluaXNoID0gKGV2LCBzaG91bGRTdWJtaXQpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHN1Ym1pdCA9IChldi5rZXkgPT09IEtleS5FTlRFUikgfHwgc2hvdWxkU3VibWl0O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBFZGl0YWJsZVRleHQuUGhhc2VzLkRpc3BsYXksXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHNlbGYub25WYWx1ZUNoYW5nZWQoc3VibWl0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uQmx1ciA9IGV2ID0+IHtcbiAgICAgICAgY29uc3Qgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuYmx1clRvQ2FuY2VsKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbEVkaXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25GaW5pc2goZXYsIHRoaXMucHJvcHMuYmx1clRvU3VibWl0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd1BsYWNlaG9sZGVyKCF0aGlzLnZhbHVlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7Y2xhc3NOYW1lLCBlZGl0YWJsZSwgaW5pdGlhbFZhbHVlLCBsYWJlbCwgbGFiZWxDbGFzc05hbWV9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgbGV0IGVkaXRhYmxlRWw7XG5cbiAgICAgICAgaWYgKCFlZGl0YWJsZSB8fCAodGhpcy5zdGF0ZS5waGFzZSA9PT0gRWRpdGFibGVUZXh0LlBoYXNlcy5EaXNwbGF5ICYmXG4gICAgICAgICAgICAobGFiZWwgfHwgbGFiZWxDbGFzc05hbWUpICYmICF0aGlzLnZhbHVlKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIHNob3cgdGhlIGxhYmVsXG4gICAgICAgICAgICBlZGl0YWJsZUVsID0gPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZSArIFwiIFwiICsgbGFiZWxDbGFzc05hbWV9IG9uQ2xpY2s9e3RoaXMub25DbGlja0Rpdn0+XG4gICAgICAgICAgICAgICAgeyBsYWJlbCB8fCBpbml0aWFsVmFsdWUgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2hvdyB0aGUgY29udGVudCBlZGl0YWJsZSBkaXYsIGJ1dCBtYW51YWxseSBtYW5hZ2UgaXRzIGNvbnRlbnRzIGFzIHJlYWN0IGFuZCBjb250ZW50RWRpdGFibGUgZG9uJ3QgcGxheSBuaWNlIHRvZ2V0aGVyXG4gICAgICAgICAgICBlZGl0YWJsZUVsID0gPGRpdiByZWY9e3RoaXMuX2VkaXRhYmxlX2Rpdn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRFZGl0YWJsZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uS2V5VXA9e3RoaXMub25LZXlVcH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vbkJsdXJ9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVkaXRhYmxlRWw7XG4gICAgfVxufVxuIl19