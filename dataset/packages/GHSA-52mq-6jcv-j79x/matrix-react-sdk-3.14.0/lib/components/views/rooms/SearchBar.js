"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _Keyboard = require("../../../Keyboard");

var _DesktopBuildsNotice = _interopRequireWildcard(require("../elements/DesktopBuildsNotice"));

/*
Copyright 2015, 2016 OpenMarket Ltd
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
class SearchBar extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onThisRoomClick", () => {
      this.setState({
        scope: 'Room'
      }, () => this._searchIfQuery());
    });
    (0, _defineProperty2.default)(this, "onAllRoomsClick", () => {
      this.setState({
        scope: 'All'
      }, () => this._searchIfQuery());
    });
    (0, _defineProperty2.default)(this, "onSearchChange", e => {
      switch (e.key) {
        case _Keyboard.Key.ENTER:
          this.onSearch();
          break;

        case _Keyboard.Key.ESCAPE:
          this.props.onCancelClick();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onSearch", () => {
      this.props.onSearch(this._search_term.current.value, this.state.scope);
    });
    this._search_term = /*#__PURE__*/(0, _react.createRef)();
    this.state = {
      scope: 'Room'
    };
  }

  _searchIfQuery() {
    if (this._search_term.current.value) {
      this.onSearch();
    }
  }

  render() {
    const searchButtonClasses = (0, _classnames.default)("mx_SearchBar_searchButton", {
      mx_SearchBar_searching: this.props.searchInProgress
    });
    const thisRoomClasses = (0, _classnames.default)("mx_SearchBar_button", {
      mx_SearchBar_unselected: this.state.scope !== 'Room'
    });
    const allRoomsClasses = (0, _classnames.default)("mx_SearchBar_button", {
      mx_SearchBar_unselected: this.state.scope !== 'All'
    });
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SearchBar"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SearchBar_buttons",
      role: "radiogroup"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: thisRoomClasses,
      onClick: this.onThisRoomClick,
      "aria-checked": this.state.scope === 'Room',
      role: "radio"
    }, (0, _languageHandler._t)("This Room")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: allRoomsClasses,
      onClick: this.onAllRoomsClick,
      "aria-checked": this.state.scope === 'All',
      role: "radio"
    }, (0, _languageHandler._t)("All Rooms"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SearchBar_input mx_textinput"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this._search_term,
      type: "text",
      autoFocus: true,
      placeholder: (0, _languageHandler._t)("Search…"),
      onKeyDown: this.onSearchChange
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: searchButtonClasses,
      onClick: this.onSearch
    })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_SearchBar_cancel",
      onClick: this.props.onCancelClick
    })), /*#__PURE__*/_react.default.createElement(_DesktopBuildsNotice.default, {
      isRoomEncrypted: this.props.isRoomEncrypted,
      kind: _DesktopBuildsNotice.WarningKind.Search
    }));
  }

}

exports.default = SearchBar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1NlYXJjaEJhci5qcyJdLCJuYW1lcyI6WyJTZWFyY2hCYXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZXRTdGF0ZSIsInNjb3BlIiwiX3NlYXJjaElmUXVlcnkiLCJlIiwia2V5IiwiS2V5IiwiRU5URVIiLCJvblNlYXJjaCIsIkVTQ0FQRSIsIm9uQ2FuY2VsQ2xpY2siLCJfc2VhcmNoX3Rlcm0iLCJjdXJyZW50IiwidmFsdWUiLCJzdGF0ZSIsInJlbmRlciIsInNlYXJjaEJ1dHRvbkNsYXNzZXMiLCJteF9TZWFyY2hCYXJfc2VhcmNoaW5nIiwic2VhcmNoSW5Qcm9ncmVzcyIsInRoaXNSb29tQ2xhc3NlcyIsIm14X1NlYXJjaEJhcl91bnNlbGVjdGVkIiwiYWxsUm9vbXNDbGFzc2VzIiwib25UaGlzUm9vbUNsaWNrIiwib25BbGxSb29tc0NsaWNrIiwib25TZWFyY2hDaGFuZ2UiLCJpc1Jvb21FbmNyeXB0ZWQiLCJXYXJuaW5nS2luZCIsIlNlYXJjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFTZSxNQUFNQSxTQUFOLFNBQXdCQyxlQUFNQyxTQUE5QixDQUF3QztBQUNuREMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsMkRBVUQsTUFBTTtBQUNwQixXQUFLQyxRQUFMLENBQWM7QUFBRUMsUUFBQUEsS0FBSyxFQUFFO0FBQVQsT0FBZCxFQUFpQyxNQUFNLEtBQUtDLGNBQUwsRUFBdkM7QUFDSCxLQVprQjtBQUFBLDJEQWNELE1BQU07QUFDcEIsV0FBS0YsUUFBTCxDQUFjO0FBQUVDLFFB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LGVBQWpEO0FBQWtFLE1BQUEsSUFBSSxFQUFFQyxpQ0FBWUM7QUFBcEYsTUFoQkosQ0FESjtBQW9CSDs7QUF2RWtEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQgRGVza3RvcEJ1aWxkc05vdGljZSwge1dhcm5pbmdLaW5kfSBmcm9tIFwiLi4vZWxlbWVudHMvRGVza3RvcEJ1aWxkc05vdGljZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWFyY2hCYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl9zZWFyY2hfdGVybSA9IGNyZWF0ZVJlZigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzY29wZTogJ1Jvb20nLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uVGhpc1Jvb21DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNjb3BlOiAnUm9vbScgfSwgKCkgPT4gdGhpcy5fc2VhcmNoSWZRdWVyeSgpKTtcbiAgICB9O1xuXG4gICAgb25BbGxSb29tc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2NvcGU6ICdBbGwnIH0sICgpID0+IHRoaXMuX3NlYXJjaElmUXVlcnkoKSk7XG4gICAgfTtcblxuICAgIG9uU2VhcmNoQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICAgICAgY2FzZSBLZXkuRU5URVI6XG4gICAgICAgICAgICAgICAgdGhpcy5vblNlYXJjaCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuRVNDQVBFOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DYW5jZWxDbGljaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWFyY2hJZlF1ZXJ5KCkge1xuICAgICAgICBpZiAodGhpcy5fc2VhcmNoX3Rlcm0uY3VycmVudC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5vblNlYXJjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TZWFyY2ggPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25TZWFyY2godGhpcy5fc2VhcmNoX3Rlcm0uY3VycmVudC52YWx1ZSwgdGhpcy5zdGF0ZS5zY29wZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoQnV0dG9uQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9TZWFyY2hCYXJfc2VhcmNoQnV0dG9uXCIsIHtcbiAgICAgICAgICAgIG14X1NlYXJjaEJhcl9zZWFyY2hpbmc6IHRoaXMucHJvcHMuc2VhcmNoSW5Qcm9ncmVzcyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHRoaXNSb29tQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9TZWFyY2hCYXJfYnV0dG9uXCIsIHtcbiAgICAgICAgICAgIG14X1NlYXJjaEJhcl91bnNlbGVjdGVkOiB0aGlzLnN0YXRlLnNjb3BlICE9PSAnUm9vbScsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBhbGxSb29tc0NsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfU2VhcmNoQmFyX2J1dHRvblwiLCB7XG4gICAgICAgICAgICBteF9TZWFyY2hCYXJfdW5zZWxlY3RlZDogdGhpcy5zdGF0ZS5zY29wZSAhPT0gJ0FsbCcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VhcmNoQmFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VhcmNoQmFyX2J1dHRvbnNcIiByb2xlPVwicmFkaW9ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPXsgdGhpc1Jvb21DbGFzc2VzIH0gb25DbGljaz17dGhpcy5vblRoaXNSb29tQ2xpY2t9IGFyaWEtY2hlY2tlZD17dGhpcy5zdGF0ZS5zY29wZSA9PT0gJ1Jvb20nfSByb2xlPVwicmFkaW9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJUaGlzIFJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9eyBhbGxSb29tc0NsYXNzZXMgfSBvbkNsaWNrPXt0aGlzLm9uQWxsUm9vbXNDbGlja30gYXJpYS1jaGVja2VkPXt0aGlzLnN0YXRlLnNjb3BlID09PSAnQWxsJ30gcm9sZT1cInJhZGlvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQWxsIFJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZWFyY2hCYXJfaW5wdXQgbXhfdGV4dGlucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcmVmPXt0aGlzLl9zZWFyY2hfdGVybX0gdHlwZT1cInRleHRcIiBhdXRvRm9jdXM9e3RydWV9IHBsYWNlaG9sZGVyPXtfdChcIlNlYXJjaOKAplwiKX0gb25LZXlEb3duPXt0aGlzLm9uU2VhcmNoQ2hhbmdlfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPXsgc2VhcmNoQnV0dG9uQ2xhc3NlcyB9IG9uQ2xpY2s9e3RoaXMub25TZWFyY2h9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9TZWFyY2hCYXJfY2FuY2VsXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNhbmNlbENsaWNrfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxEZXNrdG9wQnVpbGRzTm90aWNlIGlzUm9vbUVuY3J5cHRlZD17dGhpcy5wcm9wcy5pc1Jvb21FbmNyeXB0ZWR9IGtpbmQ9e1dhcm5pbmdLaW5kLlNlYXJjaH0gLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==