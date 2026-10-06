"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _languageHandler = require("../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _actions = require("../../dispatcher/actions");

var _RoomListStore = _interopRequireDefault(require("../../stores/room-list/RoomListStore"));

var _NameFilterCondition = require("../../stores/room-list/filters/NameFilterCondition");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _replaceableComponent = require("../../utils/replaceableComponent");

var _SpaceStore = _interopRequireWildcard(require("../../stores/SpaceStore"));

var _dec, _class, _temp;

let RoomSearch = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.RoomSearch"), _dec(_class = (_temp = class RoomSearch extends React.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "inputRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "searchFilter", new _NameFilterCondition.NameFilterCondition());
    (0, _defineProperty2.default)(this, "onSpaces", (spaces
    /*: Room[]*/
    ) => {
      this.setState({
        inSpaces: spaces.length > 0
      });
    });
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
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomListAction(ev);

      switch (action) {
        case _KeyBindingsManager.RoomListAction.ClearSearch:
          this.clearInput();

          _dispatcher.default.fire(_actions.Action.FocusComposer);

          break;

        case _KeyBindingsManager.RoomListAction.NextRoom:
        case _KeyBindingsManager.RoomListAction.PrevRoom:
          // we don't handle these actions here put pass the event on to the interested party (LeftPanel)
          this.props.onKeyDown(ev);
          break;

        case _KeyBindingsManager.RoomListAction.SelectRoom:
          {
            const shouldClear = this.props.onSelectRoom();

            if (shouldClear) {
              // wrap in set immediate to delay it so that we don't clear the filter & then change room
              setImmediate(() => {
                this.clearInput();
              });
            }

            break;
          }
      }
    });
    this.state = {
      query: "",
      focused: false,
      inSpaces: false
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction); // clear filter when changing spaces, in future we may wish to maintain a filter per-space

    _SpaceStore.default.instance.on(_SpaceStore.UPDATE_SELECTED_SPACE, this.clearInput);

    _SpaceStore.default.instance.on(_SpaceStore.UPDATE_TOP_LEVEL_SPACES, this.onSpaces);
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

    _SpaceStore.default.instance.off(_SpaceStore.UPDATE_SELECTED_SPACE, this.clearInput);

    _SpaceStore.default.instance.off(_SpaceStore.UPDATE_TOP_LEVEL_SPACES, this.onSpaces);
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
    let placeholder = (0, _languageHandler._t)("Filter");

    if (this.state.inSpaces) {
      placeholder = (0, _languageHandler._t)("Filter all spaces");
    }

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
      placeholder: placeholder,
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

}, _temp)) || _class);
exports.default = RoomSearch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUm9vbVNlYXJjaC50c3giXSwibmFtZXMiOlsiUm9vbVNlYXJjaCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJOYW1lRmlsdGVyQ29uZGl0aW9uIiwic3BhY2VzIiwic2V0U3RhdGUiLCJpblNwYWNlcyIsImxlbmd0aCIsInBheWxvYWQiLCJhY3Rpb24iLCJjbGVhcl9zZWFyY2giLCJjbGVhcklucHV0IiwiaW5wdXRSZWYiLCJjdXJyZW50IiwiZm9jdXMiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsInF1ZXJ5IiwiZXYiLCJmb2N1c2VkIiwidGFyZ2V0Iiwic2VsZWN0IiwiZ2V0Um9vbUxpc3RBY3Rpb24iLCJSb29tTGlzdEFjdGlvbiIsIkNsZWFyU2VhcmNoIiwiZmlyZSIsIkFjdGlvbiIsIkZvY3VzQ29tcG9zZXIiLCJOZXh0Um9vbSIsIlByZXZSb29tIiwib25LZXlEb3duIiwiU2VsZWN0Um9vbSIsInNob3VsZENsZWFyIiwib25TZWxlY3RSb29tIiwic2V0SW1tZWRpYXRlIiwic3RhdGUiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIlNwYWNlU3RvcmUiLCJpbnN0YW5jZSIsIm9uIiwiVVBEQVRFX1NFTEVDVEVEX1NQQUNFIiwiVVBEQVRFX1RPUF9MRVZFTF9TUEFDRVMiLCJvblNwYWNlcyIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsImhhZFNlYXJjaCIsInNlYXJjaEZpbHRlciIsInNlYXJjaCIsInRyaW0iLCJoYXZlU2VhcmNoIiwiUm9vbUxpc3RTdG9yZSIsImFkZEZpbHRlciIsInJlbW92ZUZpbHRlciIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsIm9mZiIsInJlbmRlciIsImNsYXNzZXMiLCJpc01pbmltaXplZCIsImlucHV0Q2xhc3NlcyIsInBsYWNlaG9sZGVyIiwiaWNvbiIsImlucHV0Iiwib25Gb2N1cyIsIm9uQmx1ciIsImNsZWFyQnV0dG9uIiwib3BlblNlYXJjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFHQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQWtCcUJBLFUsV0FEcEIsZ0RBQXFCLHVCQUFyQixDLHlCQUFELE1BQ3FCQSxVQURyQixTQUN3Q0MsS0FBSyxDQUFDQztBQUQ5QztBQUM0RTtBQUt4RUMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZ0I7QUFDdkIsVUFBTUEsS0FBTjtBQUR1QjtBQUFBLGlFQUgyQixzQkFHM0I7QUFBQSx3REFGaUIsSUFBSUMsd0NBQUosRUFFakI7QUFBQSxvREFvQ1IsQ0FBQ0M7QUFBRDtBQUFBLFNBQW9CO0FBQ25DLFdBQUtDLFFBQUwsQ0FBYztBQUNWQyxRQUFBQSxRQUFRLEVBQUVGLE1BQU0sQ0FBQ0csTUFBUCxHQUFnQjtBQURoQixPQUFkO0FBR0gsS0F4QzBCO0FBQUEsb0RBMENSLENBQUNDO0FBQUQ7QUFBQSxTQUE0QjtBQUMzQyxVQUFJQSxPQUFPLENBQUNDLE1BQVIsS0FBbUIsV0FBbkIsSUFBa0NELE9BQU8sQ0FBQ0UsWUFBOUMsRUFBNEQ7QUFDeEQsYUFBS0MsVUFBTDtBQUNILE9BRkQsTUFFTyxJQUFJSCxPQUFPLENBQUNDLE1BQVIsS0FBbUIsbUJBQW5CLElBQTBDLEtBQUtHLFFBQUwsQ0FBY0MsT0FBNUQsRUFBcUU7QUFDeEUsYUFBS0QsUUFBTCxDQUFjQyxPQUFkLENBQXNCQyxLQUF0QjtBQUNIO0FBQ0osS0FoRDBCO0FBQUEsc0RBa0ROLE1BQU07QUFDdkIsVUFBSSxDQUFDLEtBQUtGLFFBQUwsQ0FBY0MsT0FBbkIsRUFBNEI7QUFDNUIsV0FBS0QsUUFBTCxDQUFjQyxPQUFkLENBQXNCRSxLQUF0QixHQUE4QixFQUE5QjtBQUNBLFdBQUtDLFFBQUw7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QyxNQURUO0FBRUksTUFBQSxHQUFHLEVBQUUsS0FBS3ZELFFBRmQ7QUFHSSxNQUFBLFNBQVMsRUFBRW9ELFlBSGY7QUFJSSxNQUFBLEtBQUssRUFBRSxLQUFLM0IsS0FBTCxDQUFXbEIsS0FKdEI7QUFLSSxNQUFBLE9BQU8sRUFBRSxLQUFLaUQsT0FMbEI7QUFNSSxNQUFBLE1BQU0sRUFBRSxLQUFLQyxNQU5qQjtBQU9JLE1BQUEsUUFBUSxFQUFFLEtBQUtyRCxRQVBuQjtBQVFJLE1BQUEsU0FBUyxFQUFFLEtBQUtnQixTQVJwQjtBQVNJLE1BQUEsV0FBVyxFQUFFaUMsV0FUakI7QUFVSSxNQUFBLFlBQVksRUFBQztBQVZqQixNQURKO0FBY0EsUUFBSUssV0FBVyxnQkFDWCxvQkFBQyx5QkFBRDtBQUNJLE1BQUEsUUFBUSxFQUFFLENBQUMsQ0FEZjtBQUVJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGNBQUgsQ0FGWDtBQUdJLE1BQUEsU0FBUyxFQUFDLDJCQUhkO0FBSUksTUFBQSxPQUFPLEVBQUUsS0FBSzNEO0FBSmxCLE1BREo7O0FBU0EsUUFBSSxLQUFLVCxLQUFMLENBQVc2RCxXQUFmLEVBQTRCO0FBQ3hCRyxNQUFBQSxJQUFJLGdCQUNBLG9CQUFDLHlCQUFEO0FBQ0ksUUFBQSxLQUFLLEVBQUUseUJBQUcseUJBQUgsQ0FEWDtBQUVJLFFBQUEsU0FBUyxFQUFDLGtEQUZkO0FBR0ksUUFBQSxPQUFPLEVBQUUsS0FBS0s7QUFIbEIsUUFESjtBQU9BSixNQUFBQSxLQUFLLEdBQUcsSUFBUjtBQUNBRyxNQUFBQSxXQUFXLEdBQUcsSUFBZDtBQUNIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUVSO0FBQWhCLE9BQ0tJLElBREwsRUFFS0MsS0FGTCxFQUdLRyxXQUhMLENBREo7QUFPSDs7QUF4S3VFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAsIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGNyZWF0ZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHsgTmFtZUZpbHRlckNvbmRpdGlvbiB9IGZyb20gXCIuLi8uLi9zdG9yZXMvcm9vbS1saXN0L2ZpbHRlcnMvTmFtZUZpbHRlckNvbmRpdGlvblwiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyLCBSb29tTGlzdEFjdGlvbiB9IGZyb20gXCIuLi8uLi9LZXlCaW5kaW5nc01hbmFnZXJcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IFNwYWNlU3RvcmUsIHtVUERBVEVfU0VMRUNURURfU1BBQ0UsIFVQREFURV9UT1BfTEVWRUxfU1BBQ0VTfSBmcm9tIFwiLi4vLi4vc3RvcmVzL1NwYWNlU3RvcmVcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgaXNNaW5pbWl6ZWQ6IGJvb2xlYW47XG4gICAgb25LZXlEb3duKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KTogdm9pZDtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIGEgcm9vbSBoYXMgYmVlbiBzZWxlY3RlZCBhbmQgdGhlIHNlYXJjaCBmaWVsZCBzaG91bGQgYmUgY2xlYXJlZFxuICAgICAqL1xuICAgIG9uU2VsZWN0Um9vbSgpOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBxdWVyeTogc3RyaW5nO1xuICAgIGZvY3VzZWQ6IGJvb2xlYW47XG4gICAgaW5TcGFjZXM6IGJvb2xlYW47XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInN0cnVjdHVyZXMuUm9vbVNlYXJjaFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVNlYXJjaCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIGlucHV0UmVmOiBSZWFjdC5SZWZPYmplY3Q8SFRNTElucHV0RWxlbWVudD4gPSBjcmVhdGVSZWYoKTtcbiAgICBwcml2YXRlIHNlYXJjaEZpbHRlcjogTmFtZUZpbHRlckNvbmRpdGlvbiA9IG5ldyBOYW1lRmlsdGVyQ29uZGl0aW9uKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcXVlcnk6IFwiXCIsXG4gICAgICAgICAgICBmb2N1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIGluU3BhY2VzOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkZWZhdWx0RGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgLy8gY2xlYXIgZmlsdGVyIHdoZW4gY2hhbmdpbmcgc3BhY2VzLCBpbiBmdXR1cmUgd2UgbWF5IHdpc2ggdG8gbWFpbnRhaW4gYSBmaWx0ZXIgcGVyLXNwYWNlXG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX1NFTEVDVEVEX1NQQUNFLCB0aGlzLmNsZWFySW5wdXQpO1xuICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9UT1BfTEVWRUxfU1BBQ0VTLCB0aGlzLm9uU3BhY2VzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUmVhZG9ubHk8SVByb3BzPiwgcHJldlN0YXRlOiBSZWFkb25seTxJU3RhdGU+KTogdm9pZCB7XG4gICAgICAgIGlmIChwcmV2U3RhdGUucXVlcnkgIT09IHRoaXMuc3RhdGUucXVlcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhZFNlYXJjaCA9ICEhdGhpcy5zZWFyY2hGaWx0ZXIuc2VhcmNoLnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IGhhdmVTZWFyY2ggPSAhIXRoaXMuc3RhdGUucXVlcnkudHJpbSgpO1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hGaWx0ZXIuc2VhcmNoID0gdGhpcy5zdGF0ZS5xdWVyeTtcbiAgICAgICAgICAgIGlmICghaGFkU2VhcmNoICYmIGhhdmVTZWFyY2gpIHtcbiAgICAgICAgICAgICAgICAvLyBzdGFydGVkIGEgbmV3IGZpbHRlciAtIGFkZCB0aGUgY29uZGl0aW9uXG4gICAgICAgICAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5hZGRGaWx0ZXIodGhpcy5zZWFyY2hGaWx0ZXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYWRTZWFyY2ggJiYgIWhhdmVTZWFyY2gpIHtcbiAgICAgICAgICAgICAgICAvLyBjbGVhcmVkIGEgZmlsdGVyIC0gcmVtb3ZlIHRoZSBjb25kaXRpb25cbiAgICAgICAgICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLnJlbW92ZUZpbHRlcih0aGlzLnNlYXJjaEZpbHRlcik7XG4gICAgICAgICAgICB9IC8vIGVsc2UgdGhlIGZpbHRlciBoYXNuJ3QgY2hhbmdlZCBlbm91Z2ggZm9yIHVzIHRvIGNhcmUgaGVyZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9TRUxFQ1RFRF9TUEFDRSwgdGhpcy5jbGVhcklucHV0KTtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX1RPUF9MRVZFTF9TUEFDRVMsIHRoaXMub25TcGFjZXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25TcGFjZXMgPSAoc3BhY2VzOiBSb29tW10pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpblNwYWNlczogc3BhY2VzLmxlbmd0aCA+IDAsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAndmlld19yb29tJyAmJiBwYXlsb2FkLmNsZWFyX3NlYXJjaCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhcklucHV0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdmb2N1c19yb29tX2ZpbHRlcicgJiYgdGhpcy5pbnB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0UmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGNsZWFySW5wdXQgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5pbnB1dFJlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMuaW5wdXRSZWYuY3VycmVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvcGVuU2VhcmNoID0gKCkgPT4ge1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uOiBcInNob3dfbGVmdF9wYW5lbFwifSk7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IFwiZm9jdXNfcm9vbV9maWx0ZXJcIn0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaW5wdXRSZWYuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtxdWVyeTogdGhpcy5pbnB1dFJlZi5jdXJyZW50LnZhbHVlfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Gb2N1cyA9IChldjogUmVhY3QuRm9jdXNFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtmb2N1c2VkOiB0cnVlfSk7XG4gICAgICAgIGV2LnRhcmdldC5zZWxlY3QoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkJsdXIgPSAoZXY6IFJlYWN0LkZvY3VzRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Zm9jdXNlZDogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0Um9vbUxpc3RBY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBSb29tTGlzdEFjdGlvbi5DbGVhclNlYXJjaDpcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFySW5wdXQoKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUm9vbUxpc3RBY3Rpb24uTmV4dFJvb206XG4gICAgICAgICAgICBjYXNlIFJvb21MaXN0QWN0aW9uLlByZXZSb29tOlxuICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IGhhbmRsZSB0aGVzZSBhY3Rpb25zIGhlcmUgcHV0IHBhc3MgdGhlIGV2ZW50IG9uIHRvIHRoZSBpbnRlcmVzdGVkIHBhcnR5IChMZWZ0UGFuZWwpXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbktleURvd24oZXYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBSb29tTGlzdEFjdGlvbi5TZWxlY3RSb29tOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2hvdWxkQ2xlYXIgPSB0aGlzLnByb3BzLm9uU2VsZWN0Um9vbSgpO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRDbGVhcikge1xuICAgICAgICAgICAgICAgICAgICAvLyB3cmFwIGluIHNldCBpbW1lZGlhdGUgdG8gZGVsYXkgaXQgc28gdGhhdCB3ZSBkb24ndCBjbGVhciB0aGUgZmlsdGVyICYgdGhlbiBjaGFuZ2Ugcm9vbVxuICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhcklucHV0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoJzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2hhc1F1ZXJ5JzogdGhpcy5zdGF0ZS5xdWVyeSxcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2ZvY3VzZWQnOiB0aGlzLnN0YXRlLmZvY3VzZWQsXG4gICAgICAgICAgICAnbXhfUm9vbVNlYXJjaF9taW5pbWl6ZWQnOiB0aGlzLnByb3BzLmlzTWluaW1pemVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2lucHV0JzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tU2VhcmNoX2lucHV0RXhwYW5kZWQnOiB0aGlzLnN0YXRlLnF1ZXJ5IHx8IHRoaXMuc3RhdGUuZm9jdXNlZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHBsYWNlaG9sZGVyID0gX3QoXCJGaWx0ZXJcIik7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmluU3BhY2VzKSB7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9IF90KFwiRmlsdGVyIGFsbCBzcGFjZXNcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaWNvbiA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9Sb29tU2VhcmNoX2ljb24nIC8+XG4gICAgICAgICk7XG4gICAgICAgIGxldCBpbnB1dCA9IChcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuaW5wdXRSZWZ9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtpbnB1dENsYXNzZXN9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucXVlcnl9XG4gICAgICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vbkZvY3VzfVxuICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vbkJsdXJ9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17cGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgICAgIGxldCBjbGVhckJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkNsZWFyIGZpbHRlclwiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU2VhcmNoX2NsZWFyQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmNsZWFySW5wdXR9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzTWluaW1pemVkKSB7XG4gICAgICAgICAgICBpY29uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkZpbHRlciByb29tcyBhbmQgcGVvcGxlXCIpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU2VhcmNoX2ljb24gbXhfUm9vbVNlYXJjaF9taW5pbWl6ZWRIYW5kbGVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9wZW5TZWFyY2h9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpbnB1dCA9IG51bGw7XG4gICAgICAgICAgICBjbGVhckJ1dHRvbiA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgIHtpY29ufVxuICAgICAgICAgICAgICAgIHtpbnB1dH1cbiAgICAgICAgICAgICAgICB7Y2xlYXJCdXR0b259XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=