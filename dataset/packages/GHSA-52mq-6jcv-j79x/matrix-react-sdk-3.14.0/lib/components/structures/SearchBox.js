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

var _Keyboard = require("../../Keyboard");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _lodash = require("lodash");

var _AccessibleButton = _interopRequireDefault(require("../../components/views/elements/AccessibleButton"));

var _classnames = _interopRequireDefault(require("classnames"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
class SearchBox extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (!this.props.enableRoomSearchFocus) return;

      switch (payload.action) {
        case 'view_room':
          if (this._search.current && payload.clear_search) {
            this._clearSearch();
          }

          break;

        case 'focus_room_filter':
          if (this._search.current) {
            this._search.current.focus();
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "onChange", () => {
      if (!this._search.current) return;
      this.setState({
        searchTerm: this._search.current.value
      });
      this.onSearch();
    });
    (0, _defineProperty2.default)(this, "onSearch", (0, _lodash.throttle)(() => {
      this.props.onSearch(this._search.current.value);
    }, 200, {
      trailing: true,
      leading: true
    }));
    (0, _defineProperty2.default)(this, "_onKeyDown", ev => {
      switch (ev.key) {
        case _Keyboard.Key.ESCAPE:
          this._clearSearch("keyboard");

          break;
      }

      if (this.props.onKeyDown) this.props.onKeyDown(ev);
    });
    (0, _defineProperty2.default)(this, "_onFocus", ev => {
      this.setState({
        blurred: false
      });
      ev.target.select();

      if (this.props.onFocus) {
        this.props.onFocus(ev);
      }
    });
    (0, _defineProperty2.default)(this, "_onBlur", ev => {
      this.setState({
        blurred: true
      });

      if (this.props.onBlur) {
        this.props.onBlur(ev);
      }
    });
    this._search = /*#__PURE__*/(0, _react.createRef)();
    this.state = {
      searchTerm: "",
      blurred: true
    };
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  _clearSearch(source) {
    this._search.current.value = "";
    this.onChange();

    if (this.props.onCleared) {
      this.props.onCleared(source);
    }
  }

  render() {
    // check for collapsed here and
    // not at parent so we keep
    // searchTerm in our state
    // when collapsing and expanding
    if (this.props.collapsed) {
      return null;
    }

    const clearButton = !this.state.blurred || this.state.searchTerm ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      key: "button",
      tabIndex: -1,
      className: "mx_SearchBox_closeButton",
      onClick: () => {
        this._clearSearch("button");
      }
    }) : undefined; // show a shorter placeholder when blurred, if requested
    // this is used for the room filter field that has
    // the explore button next to it when blurred

    const placeholder = this.state.blurred ? this.props.blurredPlaceholder || this.props.placeholder : this.props.placeholder;
    const className = this.props.className || "";
    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_SearchBox", "mx_textinput", {
        "mx_SearchBox_blurred": this.state.blurred
      })
    }, /*#__PURE__*/_react.default.createElement("input", {
      key: "searchfield",
      type: "text",
      ref: this._search,
      className: "mx_textinput_icon mx_textinput_search " + className,
      value: this.state.searchTerm,
      onFocus: this._onFocus,
      onChange: this.onChange,
      onKeyDown: this._onKeyDown,
      onBlur: this._onBlur,
      placeholder: placeholder,
      autoComplete: "off"
    }), clearButton);
  }

}

exports.default = SearchBox;
(0, _defineProperty2.default)(SearchBox, "propTypes", {
  onSearch: _propTypes.default.func,
  onCleared: _propTypes.default.func,
  onKeyDown: _propTypes.default.func,
  className: _propTypes.default.string,
  placeholder: _propTypes.default.string.isRequired,
  // If true, the search box will focus and clear itself
  // on room search focus action (it would be nicer to take
  // this functionality out, but not obvious how that would work)
  enableRoomSearchFocus: _propTypes.default.bool
});
(0, _defineProperty2.default)(SearchBox, "defaultProps", {
  enableRoomSearchFocus: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvU2VhcmNoQm94LmpzIl0sIm5hbWVzIjpbIlNlYXJjaEJveCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInBheWxvYWQiLCJlbmFibGVSb29tU2VhcmNoRm9jdXMiLCJhY3Rpb24iLCJfc2VhcmNoIiwiY3VycmVudCIsImNsZWFyX3NlYXJjaCIsIl9jbGVhclNlYXJjaCIsImZvY3VzIiwic2V0U3RhdGUiLCJzZWFyY2hUZXJtIiwidmFsdWUiLCJvblNlYXJjaCIsInRyYWlsaW5nIiwibGVhZGluZyIsImV2Iiwia2V5IiwiS2V5IiwiRVNDQVBFIiwib25LZXlEb3duIiwiYmx1cnJlZCIsInRhcmdldCIsInNlbGVjdCIsIm9uRm9jdXMiLCJvbkJsdXIiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJzb3VyY2UiLCJvbkNoYW5nZSIsIm9uQ2xlYXJlZCIsInJlbmRlciIsImNvbGxhcHNlZCIsImNsZWFyQnV0dG9uIiwidW5kZWZpbmVkIiwicGxhY2Vob2xkZXIiLCJibHVycmVkUGxhY2Vob2xkZXIiLCJjbGFzc05hbWUiLCJfb25Gb2N1cyIsIl9vbktleURvd24iLCJfb25CbHVyIiwiUHJvcFR5cGVzIiwiZnVuYyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJib29sIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVlLE1BQU1BLFNBQU4sU0FBd0JDLGVBQU1DLFNBQTlCLENBQXdDO0FBa0JuREMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsb0RBbUJSQyxPQUFPLElBQUk7QUFDbEIsVUFBSSxDQUFDLEtBQUtELEtBQUwsQ0FBV0UscUJBQWhCLEVBQXVDOztBQUV2QyxjQUFRRCxPQUFPLENBQUNFLE1BQWhCO0FBQ0ksYUFBSyxXQUFMO0FBQ0ksY0FBSSxLQUFLQyxPQUFMLENBQWFDLE9BQWIsSUFBd0JKLE9BQU8sQ0FBQ0ssWUFBcEMsRUFBa0Q7QUFDOUMsaUJBQUtDLFlBQUw7QUFDSDs7QUFDRDs7QUFDSixhQUFLLG1CQUFMO0FBQ0ksY0FBSSxLQUFLSCxPQUFMLENBQWFDLE9BQWpCLEVBQTBCO0FBQ3RCLGlCQUFLRCxPQUFMLENBQWFDLE9BQWIsQ0FBcUJHLEtBQXJCO0FBQ0g7O0FBQ0Q7QUFWUjtBQVlILEtBbENrQjtBQUFBLG9EQW9DUixNQUFNO0FBQ2IsVUFBSSxDQUFDLEtBQUtKLE9BQUwsQ0FBYUMsT0FBbEIsRUFBMkI7QUFDM0IsV0FBS0ksUUFBTCxDQUFjO0FBQUVDLFFBQUFBLFVBQVUsRUFBRSxLQUFLTixPQUFMLENBQWFDLE9BQWIsQ0FBcUJNO0FBQW5DLE9BQWQ7QUFDQSxXQUFLQyxRQUFMO0FBQ0gsS0F4Q2tCO0FBQUEsb0RBMENSLHNCQUFTLE1BQU07QUFDdEIsV0FBS1osS0FBTCxDQUFXWSxRQUFYLENBQW9CLEtBQUtSLE9BQUwsQ0FBYUMsT0FBYixDQUFxQk0sS0FBekM7QUFDSCxLQUZVLEVBRVIsR0FGUSxFQUVIO0FBQUNFLE1BQUFBLFFBQVEsRUFBRSxJQUFYO0FBQWlCQyxNQUFBQSxPQUFPLEVBQUU7QUFBMUIsS0FGRyxDQTFDUTtBQUFBLHNEQThDTkMsRUFBRSxJQUFJO0FBQ2YsY0FBUUEsRUFBRSxDQUFDQyxHQUFYO0FBQ0ksYUFBS0MsY0FBSUMsTUFBVDtBQUNJLGVBQUtYLFlBQUwsQ0FBa0IsVUFBbEI7O0FBQ0E7QUFIUjs7QUFLQSxVQUFJLEtBQUtQLEtBQUwsQ0FBV21CLFNBQWYsRUFBMEIsS0FBS25CLEtBQUwsQ0FBV21CLFNBQVgsQ0FBcUJKLEVBQXJCO0FBQzdCLEtBckRrQjtBQUFBLG9EQXVEUkEsRUFBRSxJQUFJO0FBQ2IsV0FBS04sUUFBTCxDQUFjO0FBQUNXLFFBQUFBLE9BQU8sRUFBRTtBQUFWLE9BQWQ7QUFDQUwsTUFBQUEsRUFBRSxDQUFDTSxNQUFILENBQVVDLE1BQVY7O0FBQ0EsVUFBSSxLQUFLdEIsS0FBTCxDQUFXdUIsT0FBZixFQUF3QjtBQUNwQixhQUFLdkIsS0FBTCxDQUFXdUIsT0FBWCxDQUFtQlIsRUFBbkI7QUFDSDtBQUNKLEtBN0RrQjtBQUFBLG1EQStEVEEsRUFBRSxJQUFJO0FBQ1osV0FBS04sUUFBTCxDQUFjO0FBQUNXLFFBQUFBLE9BQU8sRUFBRTtBQUFWLE9BQWQ7O0FBQ0EsVUFBSSxLQUFLcEIsS0FBTCxDQUFXd0IsTUFBZixFQUF1QjtBQUNuQixhQUFLeEIsS0FBTCxDQUFXd0IsTUFBWCxDQUFrQlQsRUFBbEI7QUFDSDtBQUNKLEtBcEVrQjtBQUdmLFNBQUtYLE9BQUwsZ0JBQWUsdUJBQWY7QUFFQSxTQUFLcUIsS0FBTCxHQUFhO0FBQ1RmLE1BQUFBLFVBQVUsRUFBRSxFQURIO0FBRVRVLE1BQUFBLE9BQU8sRUFBRTtBQUZBLEtBQWI7QUFJSDs7QUFFRE0sRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEIsU0FBS0MsYUFBTCxHQUFxQkMsb0JBQUlDLFFBQUosQ0FBYSxLQUFLQyxRQUFsQixDQUFyQjtBQUNIOztBQUVEQyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQkgsd0JBQUlJLFVBQUosQ0FBZSxLQUFLTCxhQUFwQjtBQUNIOztBQXFERHBCLEVBQUFBLFlBQVksQ0FBQzBCLE1BQUQsRUFBUztBQUNqQixTQUFLN0IsT0FBTCxDQUFhQyxPQUFiLENBQXFCTSxLQUFyQixHQUE2QixFQUE3QjtBQUNBLFNBQUt1QixRQUFMOztBQUNBLFFBQUksS0FBS2xDLEtBQUwsQ0FBV21DLFNBQWYsRUFBMEI7QUFDdEIsV0FBS25DLEtBQUwsQ0FBV21DLFNBQVgsQ0FBcUJGLE1BQXJCO0FBQ0g7QUFDSjs7QUFFREcsRUFBQUEsTUFBTSxHQUFHO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFJLEtBQUtwQyxLQUFMLENBQVdxQyxTQUFmLEVBQTBCO0FBQ3RCLGFBQU8sSUFBUDtBQUNIOztBQUNELFVBQU1DLFdBQVcsR0FBSSxDQUFDLEtBQUtiLEtBQUwsQ0FBV0wsT0FBWixJQUF1QixLQUFLSyxLQUFMLENBQVdmLFVBQW5DLGdCQUNmLDZCQUFDLHlCQUFEO0FBQ0csTUFBQSxHQUFHLEVBQUMsUUFEUDtBQUVHLE1BQUEsUUFBUSxFQUFFLENBQUMsQ0FGZDtBQUdHLE1BQUEsU0FBUyxFQUFDLDBCQUhiO0FBSUcsTUFBQSxPQUFPLEVBQUcsTUFBTTtBQUFDLGFBQUtILFlBQUwsQ0FBa0IsUUFBbEI7QUFBOEI7QUFKbEQsTUFEZSxHQU1PZ0MsU0FOM0IsQ0FSSyxDQWdCTDtBQUNBO0FBQ0E7O0FBQ0EsVUFBTUMsV0FBVyxHQUFHLEtBQUtmLEtBQUwsQ0FBV0wsT0FBWCxHQUNmLEtBQUtwQixLQUFMLENBQVd5QyxrQkFBWCxJQUFpQyxLQUFLekMsS0FBTCxDQUFXd0MsV0FEN0IsR0FFaEIsS0FBS3hDLEtBQUwsQ0FBV3dDLFdBRmY7QUFHQSxVQUFNRSxTQUFTLEdBQUcsS0FBSzFDLEtBQUwsQ0FBVzBDLFNBQVgsSUFBd0IsRUFBMUM7QUFDQSx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFFLHlCQUFXLGNBQVgsRUFBMkIsY0FBM0IsRUFBMkM7QUFBQyxnQ0FBd0IsS0FBS2pCLEtBQUwsQ0FBV0w7QUFBcEMsT0FBM0M7QUFBaEIsb0JBQ0k7QUFDSSxNQUFBLEdBQUcsRUFBQyxhQURSO0FBRUksTUFBQSxJQUFJLEVBQUMsTUFGVDtBQUdJLE1BQUEsR0FBRyxFQUFFLEtBQUtoQixPQUhkO0FBSUksTUFBQSxTQUFTLEVBQUUsMkNBQTJDc0MsU0FKMUQ7QUFLSSxNQUFBLEtBQUssRUFBRyxLQUFLakIsS0FBTCxDQUFXZixVQUx2QjtBQU1JLE1BQUEsT0FBTyxFQUFHLEtBQUtpQyxRQU5uQjtBQU9JLE1BQUEsUUFBUSxFQUFHLEtBQUtULFFBUHBCO0FBUUksTUFBQSxTQUFTLEVBQUcsS0FBS1UsVUFSckI7QUFTSSxNQUFBLE1BQU0sRUFBRSxLQUFLQyxPQVRqQjtBQVVJLE1BQUEsV0FBVyxFQUFHTCxXQVZsQjtBQVdJLE1BQUEsWUFBWSxFQUFDO0FBWGpCLE1BREosRUFjTUYsV0FkTixDQURKO0FBa0JIOztBQXpJa0Q7Ozs4QkFBbEMxQyxTLGVBQ0U7QUFDZmdCLEVBQUFBLFFBQVEsRUFBRWtDLG1CQUFVQyxJQURMO0FBRWZaLEVBQUFBLFNBQVMsRUFBRVcsbUJBQVVDLElBRk47QUFHZjVCLEVBQUFBLFNBQVMsRUFBRTJCLG1CQUFVQyxJQUhOO0FBSWZMLEVBQUFBLFNBQVMsRUFBRUksbUJBQVVFLE1BSk47QUFLZlIsRUFBQUEsV0FBVyxFQUFFTSxtQkFBVUUsTUFBVixDQUFpQkMsVUFMZjtBQU9mO0FBQ0E7QUFDQTtBQUNBL0MsRUFBQUEscUJBQXFCLEVBQUU0QyxtQkFBVUk7QUFWbEIsQzs4QkFERnRELFMsa0JBY0s7QUFDbEJNLEVBQUFBLHFCQUFxQixFQUFFO0FBREwsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgS2V5IH0gZnJvbSAnLi4vLi4vS2V5Ym9hcmQnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHt0aHJvdHRsZX0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvblNlYXJjaDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uQ2xlYXJlZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uS2V5RG93bjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblxuICAgICAgICAvLyBJZiB0cnVlLCB0aGUgc2VhcmNoIGJveCB3aWxsIGZvY3VzIGFuZCBjbGVhciBpdHNlbGZcbiAgICAgICAgLy8gb24gcm9vbSBzZWFyY2ggZm9jdXMgYWN0aW9uIChpdCB3b3VsZCBiZSBuaWNlciB0byB0YWtlXG4gICAgICAgIC8vIHRoaXMgZnVuY3Rpb25hbGl0eSBvdXQsIGJ1dCBub3Qgb2J2aW91cyBob3cgdGhhdCB3b3VsZCB3b3JrKVxuICAgICAgICBlbmFibGVSb29tU2VhcmNoRm9jdXM6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBlbmFibGVSb29tU2VhcmNoRm9jdXM6IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5fc2VhcmNoID0gY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNlYXJjaFRlcm06IFwiXCIsXG4gICAgICAgICAgICBibHVycmVkOiB0cnVlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSBwYXlsb2FkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmVuYWJsZVJvb21TZWFyY2hGb2N1cykgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfcm9vbSc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NlYXJjaC5jdXJyZW50ICYmIHBheWxvYWQuY2xlYXJfc2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NsZWFyU2VhcmNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZm9jdXNfcm9vbV9maWx0ZXInOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zZWFyY2guY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWFyY2guY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9zZWFyY2guY3VycmVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VhcmNoVGVybTogdGhpcy5fc2VhcmNoLmN1cnJlbnQudmFsdWUgfSk7XG4gICAgICAgIHRoaXMub25TZWFyY2goKTtcbiAgICB9O1xuXG4gICAgb25TZWFyY2ggPSB0aHJvdHRsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25TZWFyY2godGhpcy5fc2VhcmNoLmN1cnJlbnQudmFsdWUpO1xuICAgIH0sIDIwMCwge3RyYWlsaW5nOiB0cnVlLCBsZWFkaW5nOiB0cnVlfSk7XG5cbiAgICBfb25LZXlEb3duID0gZXYgPT4ge1xuICAgICAgICBzd2l0Y2ggKGV2LmtleSkge1xuICAgICAgICAgICAgY2FzZSBLZXkuRVNDQVBFOlxuICAgICAgICAgICAgICAgIHRoaXMuX2NsZWFyU2VhcmNoKFwia2V5Ym9hcmRcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25LZXlEb3duKSB0aGlzLnByb3BzLm9uS2V5RG93bihldik7XG4gICAgfTtcblxuICAgIF9vbkZvY3VzID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtibHVycmVkOiBmYWxzZX0pO1xuICAgICAgICBldi50YXJnZXQuc2VsZWN0KCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRm9jdXMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Gb2N1cyhldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uQmx1ciA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Ymx1cnJlZDogdHJ1ZX0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkJsdXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25CbHVyKGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfY2xlYXJTZWFyY2goc291cmNlKSB7XG4gICAgICAgIHRoaXMuX3NlYXJjaC5jdXJyZW50LnZhbHVlID0gXCJcIjtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNsZWFyZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DbGVhcmVkKHNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNoZWNrIGZvciBjb2xsYXBzZWQgaGVyZSBhbmRcbiAgICAgICAgLy8gbm90IGF0IHBhcmVudCBzbyB3ZSBrZWVwXG4gICAgICAgIC8vIHNlYXJjaFRlcm0gaW4gb3VyIHN0YXRlXG4gICAgICAgIC8vIHdoZW4gY29sbGFwc2luZyBhbmQgZXhwYW5kaW5nXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNvbGxhcHNlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSAoIXRoaXMuc3RhdGUuYmx1cnJlZCB8fCB0aGlzLnN0YXRlLnNlYXJjaFRlcm0pID9cbiAgICAgICAgICAgICg8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtleT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NlYXJjaEJveF9jbG9zZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17ICgpID0+IHt0aGlzLl9jbGVhclNlYXJjaChcImJ1dHRvblwiKTsgfSB9PlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPikgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gc2hvdyBhIHNob3J0ZXIgcGxhY2Vob2xkZXIgd2hlbiBibHVycmVkLCBpZiByZXF1ZXN0ZWRcbiAgICAgICAgLy8gdGhpcyBpcyB1c2VkIGZvciB0aGUgcm9vbSBmaWx0ZXIgZmllbGQgdGhhdCBoYXNcbiAgICAgICAgLy8gdGhlIGV4cGxvcmUgYnV0dG9uIG5leHQgdG8gaXQgd2hlbiBibHVycmVkXG4gICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5zdGF0ZS5ibHVycmVkID9cbiAgICAgICAgICAgICh0aGlzLnByb3BzLmJsdXJyZWRQbGFjZWhvbGRlciB8fCB0aGlzLnByb3BzLnBsYWNlaG9sZGVyKSA6XG4gICAgICAgICAgICB0aGlzLnByb3BzLnBsYWNlaG9sZGVyO1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLnByb3BzLmNsYXNzTmFtZSB8fCBcIlwiO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9TZWFyY2hCb3hcIiwgXCJteF90ZXh0aW5wdXRcIiwge1wibXhfU2VhcmNoQm94X2JsdXJyZWRcIjogdGhpcy5zdGF0ZS5ibHVycmVkfSl9PlxuICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBrZXk9XCJzZWFyY2hmaWVsZFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9zZWFyY2h9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17XCJteF90ZXh0aW5wdXRfaWNvbiBteF90ZXh0aW5wdXRfc2VhcmNoIFwiICsgY2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17IHRoaXMuc3RhdGUuc2VhcmNoVGVybSB9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9eyB0aGlzLl9vbkZvY3VzIH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyB0aGlzLm9uQ2hhbmdlIH1cbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXsgdGhpcy5fb25LZXlEb3duIH1cbiAgICAgICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLl9vbkJsdXJ9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXsgcGxhY2Vob2xkZXIgfVxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyBjbGVhckJ1dHRvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=