"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EditableItem = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("./Field"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

/*
Copyright 2017, 2019 New Vector Ltd.

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
class EditableItem extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: true
      });
    });
    (0, _defineProperty2.default)(this, "_onDontRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: false
      });
    });
    (0, _defineProperty2.default)(this, "_onActuallyRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      if (this.props.onRemove) this.props.onRemove(this.props.index);
      this.setState({
        verifyRemove: false
      });
    });
    this.state = {
      verifyRemove: false
    };
  }

  render() {
    if (this.state.verifyRemove) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EditableItem"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_EditableItem_promptText"
      }, (0, _languageHandler._t)("Are you sure?")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onActuallyRemove,
        kind: "primary_sm",
        className: "mx_EditableItem_confirmBtn"
      }, (0, _languageHandler._t)("Yes")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onDontRemove,
        kind: "danger_sm",
        className: "mx_EditableItem_confirmBtn"
      }, (0, _languageHandler._t)("No")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditableItem"
    }, /*#__PURE__*/_react.default.createElement("div", {
      onClick: this._onRemove,
      className: "mx_EditableItem_delete",
      title: (0, _languageHandler._t)("Remove"),
      role: "button"
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EditableItem_item"
    }, this.props.value));
  }

}

exports.EditableItem = EditableItem;
(0, _defineProperty2.default)(EditableItem, "propTypes", {
  index: _propTypes.default.number,
  value: _propTypes.default.string,
  onRemove: _propTypes.default.func
});

class EditableItemList extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onItemAdded", e => {
      e.stopPropagation();
      e.preventDefault();
      if (this.props.onItemAdded) this.props.onItemAdded(this.props.newItem);
    });
    (0, _defineProperty2.default)(this, "_onItemRemoved", index => {
      if (this.props.onItemRemoved) this.props.onItemRemoved(index);
    });
    (0, _defineProperty2.default)(this, "_onNewItemChanged", e => {
      if (this.props.onNewItemChanged) this.props.onNewItemChanged(e.target.value);
    });
  }

  _renderNewItemField() {
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onItemAdded,
      autoComplete: "off",
      noValidate: true,
      className: "mx_EditableItemList_newItem"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: this.props.placeholder,
      type: "text",
      autoComplete: "off",
      value: this.props.newItem || "",
      onChange: this._onNewItemChanged,
      list: this.props.suggestionsListId
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onItemAdded,
      kind: "primary",
      type: "submit",
      disabled: !this.props.newItem
    }, (0, _languageHandler._t)("Add")));
  }

  render() {
    const editableItems = this.props.items.map((item, index) => {
      if (!this.props.canRemove) {
        return /*#__PURE__*/_react.default.createElement("li", {
          key: item
        }, item);
      }

      return /*#__PURE__*/_react.default.createElement(EditableItem, {
        key: item,
        index: index,
        value: item,
        onRemove: this._onItemRemoved
      });
    });
    const editableItemsSection = this.props.canRemove ? editableItems : /*#__PURE__*/_react.default.createElement("ul", null, editableItems);
    const label = this.props.items.length > 0 ? this.props.itemsLabel : this.props.noItemsLabel;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditableItemList"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditableItemList_label"
    }, label), editableItemsSection, this.props.canEdit ? this._renderNewItemField() : /*#__PURE__*/_react.default.createElement("div", null));
  }

}

exports.default = EditableItemList;
(0, _defineProperty2.default)(EditableItemList, "propTypes", {
  id: _propTypes.default.string.isRequired,
  items: _propTypes.default.arrayOf(_propTypes.default.string).isRequired,
  itemsLabel: _propTypes.default.string,
  noItemsLabel: _propTypes.default.string,
  placeholder: _propTypes.default.string,
  newItem: _propTypes.default.string,
  onItemAdded: _propTypes.default.func,
  onItemRemoved: _propTypes.default.func,
  onNewItemChanged: _propTypes.default.func,
  canEdit: _propTypes.default.bool,
  canRemove: _propTypes.default.bool
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0VkaXRhYmxlSXRlbUxpc3QuanMiXSwibmFtZXMiOlsiRWRpdGFibGVJdGVtIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInNldFN0YXRlIiwidmVyaWZ5UmVtb3ZlIiwicHJvcHMiLCJvblJlbW92ZSIsImluZGV4Iiwic3RhdGUiLCJyZW5kZXIiLCJfb25BY3R1YWxseVJlbW92ZSIsIl9vbkRvbnRSZW1vdmUiLCJfb25SZW1vdmUiLCJ2YWx1ZSIsIlByb3BUeXBlcyIsIm51bWJlciIsInN0cmluZyIsImZ1bmMiLCJFZGl0YWJsZUl0ZW1MaXN0Iiwib25JdGVtQWRkZWQiLCJuZXdJdGVtIiwib25JdGVtUmVtb3ZlZCIsIm9uTmV3SXRlbUNoYW5nZWQiLCJ0YXJnZXQiLCJfcmVuZGVyTmV3SXRlbUZpZWxkIiwiX29uSXRlbUFkZGVkIiwicGxhY2Vob2xkZXIiLCJfb25OZXdJdGVtQ2hhbmdlZCIsInN1Z2dlc3Rpb25zTGlzdElkIiwiZWRpdGFibGVJdGVtcyIsIml0ZW1zIiwibWFwIiwiaXRlbSIsImNhblJlbW92ZSIsIl9vbkl0ZW1SZW1vdmVkIiwiZWRpdGFibGVJdGVtc1NlY3Rpb24iLCJsYWJlbCIsImxlbmd0aCIsIml0ZW1zTGFiZWwiLCJub0l0ZW1zTGFiZWwiLCJjYW5FZGl0IiwiaWQiLCJpc1JlcXVpcmVkIiwiYXJyYXlPZiIsImJvb2wiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRTyxNQUFNQSxZQUFOLFNBQTJCQyxlQUFNQyxTQUFqQyxDQUEyQztBQU85Q0MsRUFBQUEsV0FBVyxHQUFH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RVAsbUJBQVVHLElBVFY7QUFVZkssRUFBQUEsZ0JBQWdCLEVBQUVSLG1CQUFVRyxJQVZiO0FBWWZ1QixFQUFBQSxPQUFPLEVBQUUxQixtQkFBVThCLElBWko7QUFhZlgsRUFBQUEsU0FBUyxFQUFFbkIsbUJBQVU4QjtBQWJOLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcsIDIwMTkgTmV3IFZlY3RvciBMdGQuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge190fSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0YWJsZUl0ZW0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGluZGV4OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgb25SZW1vdmU6IFByb3BUeXBlcy5mdW5jLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmVyaWZ5UmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfb25SZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmVyaWZ5UmVtb3ZlOiB0cnVlfSk7XG4gICAgfTtcblxuICAgIF9vbkRvbnRSZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmVyaWZ5UmVtb3ZlOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICBfb25BY3R1YWxseVJlbW92ZSA9IChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlbW92ZSkgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmVyaWZ5UmVtb3ZlOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmeVJlbW92ZSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FZGl0YWJsZUl0ZW1fcHJvbXB0VGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQXJlIHlvdSBzdXJlP1wiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkFjdHVhbGx5UmVtb3ZlfSBraW5kPVwicHJpbWFyeV9zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0VkaXRhYmxlSXRlbV9jb25maXJtQnRuXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJZZXNcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25Eb250UmVtb3ZlfSBraW5kPVwiZGFuZ2VyX3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtX2NvbmZpcm1CdG5cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIk5vXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBvbkNsaWNrPXt0aGlzLl9vblJlbW92ZX0gY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtX2RlbGV0ZVwiIHRpdGxlPXtfdChcIlJlbW92ZVwiKX0gcm9sZT1cImJ1dHRvblwiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtX2l0ZW1cIj57dGhpcy5wcm9wcy52YWx1ZX08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVkaXRhYmxlSXRlbUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGlkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGl0ZW1zOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc3RyaW5nKS5pc1JlcXVpcmVkLFxuICAgICAgICBpdGVtc0xhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBub0l0ZW1zTGFiZWw6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIHBsYWNlaG9sZGVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBuZXdJdGVtOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIG9uSXRlbUFkZGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25JdGVtUmVtb3ZlZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uTmV3SXRlbUNoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIGNhbkVkaXQ6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBjYW5SZW1vdmU6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBfb25JdGVtQWRkZWQgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25JdGVtQWRkZWQpIHRoaXMucHJvcHMub25JdGVtQWRkZWQodGhpcy5wcm9wcy5uZXdJdGVtKTtcbiAgICB9O1xuXG4gICAgX29uSXRlbVJlbW92ZWQgPSAoaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25JdGVtUmVtb3ZlZCkgdGhpcy5wcm9wcy5vbkl0ZW1SZW1vdmVkKGluZGV4KTtcbiAgICB9O1xuXG4gICAgX29uTmV3SXRlbUNoYW5nZWQgPSAoZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbk5ld0l0ZW1DaGFuZ2VkKSB0aGlzLnByb3BzLm9uTmV3SXRlbUNoYW5nZWQoZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG5cbiAgICBfcmVuZGVyTmV3SXRlbUZpZWxkKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uSXRlbUFkZGVkfSBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgbm9WYWxpZGF0ZT17dHJ1ZX0gY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtTGlzdF9uZXdJdGVtXCI+XG4gICAgICAgICAgICAgICAgPEZpZWxkIGxhYmVsPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfSB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiIHZhbHVlPXt0aGlzLnByb3BzLm5ld0l0ZW0gfHwgXCJcIn0gb25DaGFuZ2U9e3RoaXMuX29uTmV3SXRlbUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgIGxpc3Q9e3RoaXMucHJvcHMuc3VnZ2VzdGlvbnNMaXN0SWR9IC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25JdGVtQWRkZWR9IGtpbmQ9XCJwcmltYXJ5XCIgdHlwZT1cInN1Ym1pdFwiIGRpc2FibGVkPXshdGhpcy5wcm9wcy5uZXdJdGVtfT5cbiAgICAgICAgICAgICAgICAgICAge190KFwiQWRkXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGVkaXRhYmxlSXRlbXMgPSB0aGlzLnByb3BzLml0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5jYW5SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gPGxpIGtleT17aXRlbX0+e2l0ZW19PC9saT47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8RWRpdGFibGVJdGVtXG4gICAgICAgICAgICAgICAga2V5PXtpdGVtfVxuICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICB2YWx1ZT17aXRlbX1cbiAgICAgICAgICAgICAgICBvblJlbW92ZT17dGhpcy5fb25JdGVtUmVtb3ZlZH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBlZGl0YWJsZUl0ZW1zU2VjdGlvbiA9IHRoaXMucHJvcHMuY2FuUmVtb3ZlID8gZWRpdGFibGVJdGVtcyA6IDx1bD57ZWRpdGFibGVJdGVtc308L3VsPjtcbiAgICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLnByb3BzLml0ZW1zLmxlbmd0aCA+IDAgPyB0aGlzLnByb3BzLml0ZW1zTGFiZWwgOiB0aGlzLnByb3BzLm5vSXRlbXNMYWJlbDtcblxuICAgICAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdGFibGVJdGVtTGlzdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FZGl0YWJsZUl0ZW1MaXN0X2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgeyBsYWJlbCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgZWRpdGFibGVJdGVtc1NlY3Rpb24gfVxuICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNhbkVkaXQgPyB0aGlzLl9yZW5kZXJOZXdJdGVtRmllbGQoKSA6IDxkaXYgLz4gfVxuICAgICAgICA8L2Rpdj4pO1xuICAgIH1cbn1cbiJdfQ==