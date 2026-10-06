"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _Keyboard = require("../../../Keyboard");

/*
Copyright 2019 Tulir Asokan <tulir@maunium.net>
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
class Header extends _react.default.PureComponent
/*:: <IProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      let handled = true;

      switch (ev.key) {
        case _Keyboard.Key.ARROW_LEFT:
          this.changeCategoryRelative(-1);
          break;

        case _Keyboard.Key.ARROW_RIGHT:
          this.changeCategoryRelative(1);
          break;

        case _Keyboard.Key.HOME:
          this.changeCategoryAbsolute(0);
          break;

        case _Keyboard.Key.END:
          this.changeCategoryAbsolute(this.props.categories.length - 1, -1);
          break;

        default:
          handled = false;
      }

      if (handled) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
  }

  findNearestEnabled(index
  /*: number*/
  , delta
  /*: number*/
  ) {
    index += this.props.categories.length;
    const cats = [...this.props.categories, ...this.props.categories, ...this.props.categories];

    while (index < cats.length && index >= 0) {
      if (cats[index].enabled) return index % this.props.categories.length;
      index += delta > 0 ? 1 : -1;
    }
  }

  changeCategoryRelative(delta
  /*: number*/
  ) {
    const current = this.props.categories.findIndex(c => c.visible);
    this.changeCategoryAbsolute(current + delta, delta);
  }

  changeCategoryAbsolute(index
  /*: number*/
  , delta = 1) {
    const category = this.props.categories[this.findNearestEnabled(index, delta)];

    if (category) {
      this.props.onAnchorClick(category.id);
      category.ref.current.focus();
    }
  } // Implements ARIA Tabs with Automatic Activation pattern
  // https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-1/tabs.html


  render() {
    return /*#__PURE__*/_react.default.createElement("nav", {
      className: "mx_EmojiPicker_header",
      role: "tablist",
      "aria-label": (0, _languageHandler._t)("Categories"),
      onKeyDown: this.onKeyDown
    }, this.props.categories.map(category => {
      const classes = (0, _classnames.default)(`mx_EmojiPicker_anchor mx_EmojiPicker_anchor_${category.id}`, {
        mx_EmojiPicker_anchor_visible: category.visible
      }); // Properties of this button are also modified by EmojiPicker's updateVisibility in DOM.

      return /*#__PURE__*/_react.default.createElement("button", {
        disabled: !category.enabled,
        key: category.id,
        ref: category.ref,
        className: classes,
        onClick: () => this.props.onAnchorClick(category.id),
        title: category.name,
        role: "tab",
        tabIndex: category.visible ? 0 : -1 // roving
        ,
        "aria-selected": category.visible,
        "aria-controls": `mx_EmojiPicker_category_${category.id}`
      });
    }));
  }

}

var _default = Header;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2Vtb2ppcGlja2VyL0hlYWRlci50c3giXSwibmFtZXMiOlsiSGVhZGVyIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiZXYiLCJoYW5kbGVkIiwia2V5IiwiS2V5IiwiQVJST1dfTEVGVCIsImNoYW5nZUNhdGVnb3J5UmVsYXRpdmUiLCJBUlJPV19SSUdIVCIsIkhPTUUiLCJjaGFuZ2VDYXRlZ29yeUFic29sdXRlIiwiRU5EIiwicHJvcHMiLCJjYXRlZ29yaWVzIiwibGVuZ3RoIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJmaW5kTmVhcmVzdEVuYWJsZWQiLCJpbmRleCIsImRlbHRhIiwiY2F0cyIsImVuYWJsZWQiLCJjdXJyZW50IiwiZmluZEluZGV4IiwiYyIsInZpc2libGUiLCJjYXRlZ29yeSIsIm9uQW5jaG9yQ2xpY2siLCJpZCIsInJlZiIsImZvY3VzIiwicmVuZGVyIiwib25LZXlEb3duIiwibWFwIiwiY2xhc3NlcyIsIm14X0Vtb2ppUGlja2VyX2FuY2hvcl92aXNpYmxlIiwibmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY0EsTUFBTUEsTUFBTixTQUFxQkMsZUFBTUM7QUFBM0I7QUFBaUQ7QUFBQTtBQUFBO0FBQUEscURBMEJ6QixDQUFDQztBQUFEO0FBQUEsU0FBNkI7QUFDN0MsVUFBSUMsT0FBTyxHQUFHLElBQWQ7O0FBQ0EsY0FBUUQsRUFBRSxDQUFDRSxHQUFYO0FBQ0ksYUFBS0MsY0FBSUMsVUFBVDtBQUNJLGVBQUtDLHNCQUFMLENBQTRCLENBQUMsQ0FBN0I7QUFDQTs7QUFDSixhQUFLRixjQUFJRyxXQUFUO0FBQ0ksZUFBS0Qsc0JBQUwsQ0FBNEIsQ0FB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SCxRQUFBLFNBQVMsRUFBRUssT0FKUjtBQUtILFFBQUEsT0FBTyxFQUFFLE1BQU0sS0FBS3RCLEtBQUwsQ0FBV2UsYUFBWCxDQUF5QkQsUUFBUSxDQUFDRSxFQUFsQyxDQUxaO0FBTUgsUUFBQSxLQUFLLEVBQUVGLFFBQVEsQ0FBQ1UsSUFOYjtBQU9ILFFBQUEsSUFBSSxFQUFDLEtBUEY7QUFRSCxRQUFBLFFBQVEsRUFBRVYsUUFBUSxDQUFDRCxPQUFULEdBQW1CLENBQW5CLEdBQXVCLENBQUMsQ0FSL0IsQ0FRa0M7QUFSbEM7QUFTSCx5QkFBZUMsUUFBUSxDQUFDRCxPQVRyQjtBQVVILHlCQUFnQiwyQkFBMEJDLFFBQVEsQ0FBQ0UsRUFBRztBQVZuRCxRQUFQO0FBWUgsS0FqQkEsQ0FOTCxDQURKO0FBMkJIOztBQWhGNEM7O2VBbUZsQzdCLE0iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVHVsaXIgQXNva2FuIDx0dWxpckBtYXVuaXVtLm5ldD5cbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7Q2F0ZWdvcnlLZXksIElDYXRlZ29yeX0gZnJvbSBcIi4vQ2F0ZWdvcnlcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgY2F0ZWdvcmllczogSUNhdGVnb3J5W107XG4gICAgb25BbmNob3JDbGljayhpZDogQ2F0ZWdvcnlLZXkpOiB2b2lkXG59XG5cbmNsYXNzIEhlYWRlciBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHJpdmF0ZSBmaW5kTmVhcmVzdEVuYWJsZWQoaW5kZXg6IG51bWJlciwgZGVsdGE6IG51bWJlcikge1xuICAgICAgICBpbmRleCArPSB0aGlzLnByb3BzLmNhdGVnb3JpZXMubGVuZ3RoO1xuICAgICAgICBjb25zdCBjYXRzID0gWy4uLnRoaXMucHJvcHMuY2F0ZWdvcmllcywgLi4udGhpcy5wcm9wcy5jYXRlZ29yaWVzLCAuLi50aGlzLnByb3BzLmNhdGVnb3JpZXNdO1xuXG4gICAgICAgIHdoaWxlIChpbmRleCA8IGNhdHMubGVuZ3RoICYmIGluZGV4ID49IDApIHtcbiAgICAgICAgICAgIGlmIChjYXRzW2luZGV4XS5lbmFibGVkKSByZXR1cm4gaW5kZXggJSB0aGlzLnByb3BzLmNhdGVnb3JpZXMubGVuZ3RoO1xuICAgICAgICAgICAgaW5kZXggKz0gZGVsdGEgPiAwID8gMSA6IC0xO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VDYXRlZ29yeVJlbGF0aXZlKGRlbHRhOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMucHJvcHMuY2F0ZWdvcmllcy5maW5kSW5kZXgoYyA9PiBjLnZpc2libGUpO1xuICAgICAgICB0aGlzLmNoYW5nZUNhdGVnb3J5QWJzb2x1dGUoY3VycmVudCArIGRlbHRhLCBkZWx0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VDYXRlZ29yeUFic29sdXRlKGluZGV4OiBudW1iZXIsIGRlbHRhPTEpIHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSB0aGlzLnByb3BzLmNhdGVnb3JpZXNbdGhpcy5maW5kTmVhcmVzdEVuYWJsZWQoaW5kZXgsIGRlbHRhKV07XG4gICAgICAgIGlmIChjYXRlZ29yeSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkFuY2hvckNsaWNrKGNhdGVnb3J5LmlkKTtcbiAgICAgICAgICAgIGNhdGVnb3J5LnJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbXBsZW1lbnRzIEFSSUEgVGFicyB3aXRoIEF1dG9tYXRpYyBBY3RpdmF0aW9uIHBhdHRlcm5cbiAgICAvLyBodHRwczovL3d3dy53My5vcmcvVFIvd2FpLWFyaWEtcHJhY3RpY2VzL2V4YW1wbGVzL3RhYnMvdGFicy0xL3RhYnMuaHRtbFxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGxldCBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgc3dpdGNoIChldi5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgS2V5LkFSUk9XX0xFRlQ6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VDYXRlZ29yeVJlbGF0aXZlKC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5LkFSUk9XX1JJR0hUOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlQ2F0ZWdvcnlSZWxhdGl2ZSgxKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBLZXkuSE9NRTpcbiAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZUNhdGVnb3J5QWJzb2x1dGUoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleS5FTkQ6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VDYXRlZ29yeUFic29sdXRlKHRoaXMucHJvcHMuY2F0ZWdvcmllcy5sZW5ndGggLSAxLCAtMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPG5hdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyX2hlYWRlclwiXG4gICAgICAgICAgICAgICAgcm9sZT1cInRhYmxpc3RcIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiQ2F0ZWdvcmllc1wiKX1cbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNhdGVnb3JpZXMubWFwKGNhdGVnb3J5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoYG14X0Vtb2ppUGlja2VyX2FuY2hvciBteF9FbW9qaVBpY2tlcl9hbmNob3JfJHtjYXRlZ29yeS5pZH1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBteF9FbW9qaVBpY2tlcl9hbmNob3JfdmlzaWJsZTogY2F0ZWdvcnkudmlzaWJsZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgb2YgdGhpcyBidXR0b24gYXJlIGFsc28gbW9kaWZpZWQgYnkgRW1vamlQaWNrZXIncyB1cGRhdGVWaXNpYmlsaXR5IGluIERPTS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshY2F0ZWdvcnkuZW5hYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y2F0ZWdvcnkuaWR9XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e2NhdGVnb3J5LnJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25BbmNob3JDbGljayhjYXRlZ29yeS5pZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17Y2F0ZWdvcnkubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9e2NhdGVnb3J5LnZpc2libGUgPyAwIDogLTF9IC8vIHJvdmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17Y2F0ZWdvcnkudmlzaWJsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtY29udHJvbHM9e2BteF9FbW9qaVBpY2tlcl9jYXRlZ29yeV8ke2NhdGVnb3J5LmlkfWB9XG4gICAgICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9uYXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIZWFkZXI7XG4iXX0=