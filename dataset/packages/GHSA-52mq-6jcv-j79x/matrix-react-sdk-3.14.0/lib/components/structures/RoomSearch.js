"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _languageHandler = require("../../languageHandler");

var _Keyboard = require("../../Keyboard");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _actions = require("../../dispatcher/actions");

var _RoomListStore = _interopRequireDefault(require("../../stores/room-list/RoomListStore"));

var _NameFilterCondition = require("../../stores/room-list/filters/NameFilterCondition");

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
class RoomSearch extends React.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "inputRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "searchFilter", new _NameFilterCondition.NameFilterCondition());
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action === 'view_room' && payload.clear_search) {
        this.clearInput();
      } else if (payload.action === 'focus_room_filter' && this.inputRef.current) {
        this.inputRef.current.focus();
      }
    });
    (0, _defineProperty2.default)(this, "clearInput", () => {
      if (!this.inputRef.current) return;
      this.inputRef.current.value = "";
      this.onChange();
    });
    (0, _defineProperty2.default)(this, "openSearch", () => {
      _dispatcher.default.dispatch({
        action: "show_left_panel"
      });

      _dispatcher.default.dispatch({
        action: "focus_room_filter"
      });
    });
    (0, _defineProperty2.default)(this, "onChange", () => {
      if (!this.inputRef.current) return;
      this.setState({
        query: this.inputRef.current.value
      });
    });
    (0, _defineProperty2.default)(this, "onFocus", (ev
    /*: React.FocusEvent<HTMLInputElement>*/
    ) => {
      this.setState({
        focused: true
      });
      ev.target.select();
    });
    (0, _defineProperty2.default)(this, "onBlur", (ev
    /*: React.FocusEvent<HTMLInputElement>*/
    ) => {
      this.setState({
        focused: false
      });
    });
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      if (ev.key === _Keyboard.Key.ESCAPE) {
        this.clearInput();

        _dispatcher.default.fire(_actions.Action.FocusComposer);
      } else if (ev.key === _Keyboard.Key.ARROW_UP || ev.key === _Keyboard.Key.ARROW_DOWN) {
        this.props.onVerticalArrow(ev);
      } else if (ev.key === _Keyboard.Key.ENTER) {
        const shouldClear = this.props.onEnter(ev);

        if (shouldClear) {
          // wrap in set immediate to delay it so that we don't clear the filter & then change room
          setImmediate(() => {
            this.clearInput();
          });
        }
      }
    });
    this.state = {
      query: "",
      focused: false
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentDidUpdate(prevProps
  /*: Readonly<IProps>*/
  , prevState
  /*: Readonly<IState>*/
  )
  /*: void*/
  {
    if (prevState.query !== this.state.query) {
      const hadSearch = !!this.searchFilter.search.trim();
      const haveSearch = !!this.state.query.trim();
      this.searchFilter.search = this.state.query;

      if (!hadSearch && haveSearch) {
        // started a new filter - add the condition
        _RoomListStore.default.instance.addFilter(this.searchFilter);
      } else if (hadSearch && !haveSearch) {
        // cleared a filter - remove the condition
        _RoomListStore.default.instance.removeFilter(this.searchFilter);
      } // else the filter hasn't changed enough for us to care here

    }
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  render()
  /*: React.ReactNode*/
  {
    const classes = (0, _classnames.default)({
      'mx_RoomSearch': true,
      'mx_RoomSearch_hasQuery': this.state.query,
      'mx_RoomSearch_focused': this.state.focused,
      'mx_RoomSearch_minimized': this.props.isMinimized
    });
    const inputClasses = (0, _classnames.default)({
      'mx_RoomSearch_input': true,
      'mx_RoomSearch_inputExpanded': this.state.query || this.state.focused
    });
    let icon = /*#__PURE__*/React.createElement("div", {
      className: "mx_RoomSearch_icon"
    });
    let input = /*#__PURE__*/React.createElement("input", {
      type: "text",
      ref: this.inputRef,
      className: inputClasses,
      value: this.state.query,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      placeholder: (0, _languageHandler._t)("Filter"),
      autoComplete: "off"
    });
    let clearButton = /*#__PURE__*/React.createElement(_AccessibleButton.default, {
      tabIndex: -1,
      title: (0, _languageHandler._t)("Clear filter"),
      className: "mx_RoomSearch_clearButton",
      onClick: this.clearInput
    });

    if (this.props.isMinimized) {
      icon = /*#__PURE__*/React.createElement(_AccessibleButton.default, {
        title: (0, _languageHandler._t)("Filter rooms and people"),
        className: "mx_RoomSearch_icon mx_RoomSearch_minimizedHandle",
        onClick: this.openSearch
      });
      input = null;
      clearButton = null;
    }

    return /*#__PURE__*/React.createElement("div", {
      className: classes
    }, icon, input, clearButton);
  }

}

exports.default = RoomSearch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUm9vbVNlYXJjaC50c3giXSwibmFtZXMiOlsiUm9vbVNlYXJjaCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJOYW1lRmlsdGVyQ29uZGl0aW9uIiwicGF5bG9hZCIsImFjdGlvbiIsImNsZWFyX3NlYXJjaCIsImNsZWFySW5wdXQiLCJpbnB1dFJlZiIsImN1cnJlbnQiLCJmb2N1cyIsInZhbHVlIiwib25DaGFuZ2UiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwic2V0U3RhdGUiLCJxdWVyeSIsImV2IiwiZm9jdXNlZCIsInRhcmdldCIsInNlbGVjdCIsImtleSIsIktleSIsIkVTQ0FQRSIsImZpcmUiLCJBY3Rpb24iLCJGb2N1c0NvbXBvc2VyIiwiQVJST1dfVVAiLCJBUlJPV19ET1dOIiwib25WZXJ0aWNhbEFycm93IiwiRU5URVIiLCJzaG91bGRDbGVhciIsIm9uRW50ZXIiLCJzZXRJbW1lZGlhdGUiLCJzdGF0ZSIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwiaGFkU2VhcmNoIiwic2VhcmNoRmlsdGVyIiwic2VhcmNoIiwidHJpbSIsImhhdmVTZWFyY2giLCJSb29tTGlzdFN0b3JlIiwiaW5zdGFuY2UiLCJhZGRGaWx0ZXIiLCJyZW1vdmVGaWx0ZXIiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW5kZXIiLCJjbGFzc2VzIiwiaXNNaW5pbWl6ZWQiLCJpbnB1dENsYXNzZXMiLCJpY29uIiwiaW5wdXQiLCJvbkZvY3VzIiwib25CbHVyIiwib25LZXlEb3duIiwiY2xlYXJCdXR0b24iLCJvcGVuU2VhcmNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUVB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T0FMLE1BQUFBLEtBQUssR0FBRyxJQUFSO0FBQ0FJLE1BQUFBLFdBQVcsR0FBRyxJQUFkO0FBQ0g7O0FBRUQsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBRVI7QUFBaEIsT0FDS0csSUFETCxFQUVLQyxLQUZMLEVBR0tJLFdBSEwsQ0FESjtBQU9IOztBQS9JdUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGNyZWF0ZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgS2V5IH0gZnJvbSBcIi4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHsgTmFtZUZpbHRlckNvbmRpdGlvbiB9IGZyb20gXCIuLi8uLi9zdG9yZXMvcm9vbS1saXN0L2ZpbHRlcnMvTmFtZUZpbHRlckNvbmRpdGlvblwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbiAgICBvblZlcnRpY2FsQXJyb3coZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpOiB2b2lkO1xuICAgIG9uRW50ZXIoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBxdWVyeTogc3RyaW5nO1xuICAgIGZvY3VzZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21TZWFyY2ggZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBpbnB1dFJlZjogUmVhY3QuUmVmT2JqZWN0PEhUTUxJbnB1dEVsZW1lbnQ+ID0gY3JlYXRlUmVmKCk7XG4gICAgcHJpdmF0ZSBzZWFyY2hGaWx0ZXI6IE5hbWVGaWx0ZXJDb25kaXRpb24gPSBuZXcgTmFtZUZpbHRlckNvbmRpdGlvbigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHF1ZXJ5OiBcIlwiLFxuICAgICAgICAgICAgZm9jdXNlZDogZmFsc2UsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGVmYXVsdERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFJlYWRvbmx5PElQcm9wcz4sIHByZXZTdGF0ZTogUmVhZG9ubHk8SVN0YXRlPik6IHZvaWQge1xuICAgICAgICBpZiAocHJldlN0YXRlLnF1ZXJ5ICE9PSB0aGlzLnN0YXRlLnF1ZXJ5KSB7XG4gICAgICAgICAgICBjb25zdCBoYWRTZWFyY2ggPSAhIXRoaXMuc2VhcmNoRmlsdGVyLnNlYXJjaC50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBoYXZlU2VhcmNoID0gISF0aGlzLnN0YXRlLnF1ZXJ5LnRyaW0oKTtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoRmlsdGVyLnNlYXJjaCA9IHRoaXMuc3RhdGUucXVlcnk7XG4gICAgICAgICAgICBpZiAoIWhhZFNlYXJjaCAmJiBoYXZlU2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgLy8gc3RhcnRlZCBhIG5ldyBmaWx0ZXIgLSBhZGQgdGhlIGNvbmRpdGlvblxuICAgICAgICAgICAgICAgIFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuYWRkRmlsdGVyKHRoaXMuc2VhcmNoRmlsdGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFkU2VhcmNoICYmICFoYXZlU2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgLy8gY2xlYXJlZCBhIGZpbHRlciAtIHJlbW92ZSB0aGUgY29uZGl0aW9uXG4gICAgICAgICAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5yZW1vdmVGaWx0ZXIodGhpcy5zZWFyY2hGaWx0ZXIpO1xuICAgICAgICAgICAgfSAvLyBlbHNlIHRoZSBmaWx0ZXIgaGFzbid0IGNoYW5nZWQgZW5vdWdoIGZvciB1cyB0byBjYXJlIGhlcmVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICd2aWV3X3Jvb20nICYmIHBheWxvYWQuY2xlYXJfc2VhcmNoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFySW5wdXQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ2ZvY3VzX3Jvb21fZmlsdGVyJyAmJiB0aGlzLmlucHV0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWYuY3VycmVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2xlYXJJbnB1dCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmlucHV0UmVmLmN1cnJlbnQpIHJldHVybjtcbiAgICAgICAgdGhpcy5pbnB1dFJlZi5jdXJyZW50LnZhbHVlID0gXCJcIjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9wZW5TZWFyY2ggPSAoKSA9PiB7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IFwic2hvd19sZWZ0X3BhbmVsXCJ9KTtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogXCJmb2N1c19yb29tX2ZpbHRlclwifSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5pbnB1dFJlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3F1ZXJ5OiB0aGlzLmlucHV0UmVmLmN1cnJlbnQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZvY3VzID0gKGV2OiBSZWFjdC5Gb2N1c0V2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2ZvY3VzZWQ6IHRydWV9KTtcbiAgICAgICAgZXYudGFyZ2V0LnNlbGVjdCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQmx1ciA9IChldjogUmVhY3QuRm9jdXNFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtmb2N1c2VkOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZXYua2V5ID09PSBLZXkuRVNDQVBFKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFySW5wdXQoKTtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmZpcmUoQWN0aW9uLkZvY3VzQ29tcG9zZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2LmtleSA9PT0gS2V5LkFSUk9XX1VQIHx8IGV2LmtleSA9PT0gS2V5LkFSUk9XX0RPV04pIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25WZXJ0aWNhbEFycm93KGV2KTtcbiAgICAgICAgfSBlbHNlIGlmIChldi5rZXkgPT09IEtleS5FTlRFUikge1xuICAgICAgICAgICAgY29uc3Qgc2hvdWxkQ2xlYXIgPSB0aGlzLnByb3BzLm9uRW50ZXIoZXYpO1xuICAgICAgICAgICAgaWYgKHNob3VsZENsZWFyKSB7XG4gICAgICAgICAgICAgICAgLy8gd3JhcCBpbiBzZXQgaW1tZWRpYXRlIHRvIGRlbGF5IGl0IHNvIHRoYXQgd2UgZG9uJ3QgY2xlYXIgdGhlIGZpbHRlciAmIHRoZW4gY2hhbmdlIHJvb21cbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW5wdXQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoJzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2hhc1F1ZXJ5JzogdGhpcy5zdGF0ZS5xdWVyeSxcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2ZvY3VzZWQnOiB0aGlzLnN0YXRlLmZvY3VzZWQsXG4gICAgICAgICAgICAnbXhfUm9vbVNlYXJjaF9taW5pbWl6ZWQnOiB0aGlzLnByb3BzLmlzTWluaW1pemVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2lucHV0RXhwYW5kZWQnOiB0aGlzLnN0YXRlLnF1ZXJ5IHx8IHRoaXMuc3RhdGUuZm9jdXNlZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGljb24gPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfUm9vbVNlYXJjaF9pY29uJyAvPlxuICAgICAgICApO1xuICAgICAgICBsZXQgaW5wdXQgPSAoXG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLmlucHV0UmVmfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aW5wdXRDbGFzc2VzfVxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnF1ZXJ5fVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25CbHVyfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiRmlsdGVyXCIpfVxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgICBsZXQgY2xlYXJCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIHRhYkluZGV4PXstMX1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJDbGVhciBmaWx0ZXJcIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVNlYXJjaF9jbGVhckJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5jbGVhcklucHV0fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc01pbmltaXplZCkge1xuICAgICAgICAgICAgaWNvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJGaWx0ZXIgcm9vbXMgYW5kIHBlb3BsZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVNlYXJjaF9pY29uIG14X1Jvb21TZWFyY2hfbWluaW1pemVkSGFuZGxlXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vcGVuU2VhcmNofVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaW5wdXQgPSBudWxsO1xuICAgICAgICAgICAgY2xlYXJCdXR0b24gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICB7aWNvbn1cbiAgICAgICAgICAgICAgICB7aW5wdXR9XG4gICAgICAgICAgICAgICAge2NsZWFyQnV0dG9ufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19