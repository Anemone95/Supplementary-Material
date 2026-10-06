"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _Keyboard = require("../../../Keyboard");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let Search = (_dec = (0, _replaceableComponent.replaceableComponent)("views.emojipicker.Search"), _dec(_class = (_temp = class Search extends _react.default.PureComponent
/*:: <IProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "inputRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      if (ev.key === _Keyboard.Key.ENTER) {
        this.props.onEnter();
        ev.stopPropagation();
        ev.preventDefault();
      }
    });
  }

  componentDidMount() {
    // For some reason, neither the autoFocus nor just calling focus() here worked, so here's a setTimeout
    setTimeout(() => this.inputRef.current.focus(), 0);
  }

  render() {
    let rightButton;

    if (this.props.query) {
      rightButton = /*#__PURE__*/_react.default.createElement("button", {
        onClick: () => this.props.onChange(""),
        className: "mx_EmojiPicker_search_icon mx_EmojiPicker_search_clear",
        title: (0, _languageHandler._t)("Cancel search")
      });
    } else {
      rightButton = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_EmojiPicker_search_icon"
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmojiPicker_search"
    }, /*#__PURE__*/_react.default.createElement("input", {
      autoFocus: true,
      type: "text",
      placeholder: "Search",
      value: this.props.query,
      onChange: ev => this.props.onChange(ev.target.value),
      onKeyDown: this.onKeyDown,
      ref: this.inputRef
    }), rightButton);
  }

}, _temp)) || _class);
var _default = Search;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2Vtb2ppcGlja2VyL1NlYXJjaC50c3giXSwibmFtZXMiOlsiU2VhcmNoIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY3JlYXRlUmVmIiwiZXYiLCJrZXkiLCJLZXkiLCJFTlRFUiIsInByb3BzIiwib25FbnRlciIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiY29tcG9uZW50RGlkTW91bnQiLCJzZXRUaW1lb3V0IiwiaW5wdXRSZWYiLCJjdXJyZW50IiwiZm9jdXMiLCJyZW5kZXIiLCJyaWdodEJ1dHRvbiIsInF1ZXJ5Iiwib25DaGFuZ2UiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uS2V5RG93biJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7SUFTTUEsTSxXQURMLGdEQUFxQiwwQkFBckIsQyx5QkFBRCxNQUNNQSxNQUROLFNBQ3FCQyxlQUFNQztBQUQzQjtBQUNpRDtBQUFBO0FBQUE7QUFBQSxpRUFDMUJELGVBQU1FLFNBQU4sRUFEMEI7QUFBQSxxREFRekIsQ0FBQ0M7QUFBRDtBQUFBLFNBQTZCO0FBQzdDLFVBQUlBLEVBQUUsQ0FBQ0MsR0FBSCxLQUFXQyxjQUFJQyxLQUFuQixFQUEwQjtBQUN0QixhQUFLQyxLQUFMLENBQVdDLE9BQVg7QUFDQUwsUUFBQUEsRUFBRSxDQUFDTSxlQUFIO0FBQ0FOLFFBQUFBLEVBQUUsQ0FBQ08sY0FBSDtBQUNIO0FBQ0osS0FkNEM7QUFBQTs7QUFHN0NDLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCO0FBQ0FDLElBQUFBLFVBQVUsQ0FBQyxNQUFNLEtBQUtDLFFBQUwsQ0FBY0MsT0FBZCxDQUFzQkMsS0FBdEIsRUFBUCxFQUFzQyxDQUF0QyxDQUFWO0FBQ0g7O0FBVURDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFFBQUlDLFdBQUo7O0FBQ0EsUUFBSSxLQUFLVixLQUFMLENBQVdXLEtBQWYsRUFBc0I7QUFDbEJELE1BQUFBLFdBQVcsZ0JBQ1A7QUFDSSxRQUFBLE9BQU8sRUFBRSxNQUFNLEtBQUtWLEtBQUwsQ0FBV1ksUUFBWCxDQUFvQixFQUFwQixDQURuQjtBQUVJLFFBQUEsU0FBUyxFQUFDLHdEQUZkO0FBR0ksUUFBQSxLQUFLLEVBQUUseUJBQUcsZUFBSDtBQUhYLFFBREo7QUFPSCxLQVJELE1BUU87QUFDSEYsTUFBQUEsV0FBVyxnQkFBRztBQUFNLFFBQUEsU0FBUyxFQUFDO0FBQWhCLFFBQWQ7QUFDSDs7QUFFRCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFDSSxNQUFBLFNBQVMsTUFEYjtBQUVJLE1BQUEsSUFBSSxFQUFDLE1BRlQ7QUFHSSxNQUFBLFdBQVcsRUFBQyxRQUhoQjtBQUlJLE1BQUEsS0FBSyxFQUFFLEtBQUtWLEtBQUwsQ0FBV1csS0FKdEI7QUFLSSxNQUFBLFFBQVEsRUFBRWYsRUFBRSxJQUFJLEtBQUtJLEtBQUwsQ0FBV1ksUUFBWCxDQUFvQmhCLEVBQUUsQ0FBQ2lCLE1BQUgsQ0FBVUMsS0FBOUIsQ0FMcEI7QUFNSSxNQUFBLFNBQVMsRUFBRSxLQUFLQyxTQU5wQjtBQU9JLE1BQUEsR0FBRyxFQUFFLEtBQUtUO0FBUGQsTUFESixFQVVLSSxXQVZMLENBREo7QUFjSDs7QUE1QzRDLEM7ZUErQ2xDbEIsTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUdWxpciBBc29rYW4gPHR1bGlyQG1hdW5pdW0ubmV0PlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcXVlcnk6IHN0cmluZztcbiAgICBvbkNoYW5nZSh2YWx1ZTogc3RyaW5nKTogdm9pZDtcbiAgICBvbkVudGVyKCk6IHZvaWQ7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmVtb2ppcGlja2VyLlNlYXJjaFwiKVxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIGlucHV0UmVmID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gRm9yIHNvbWUgcmVhc29uLCBuZWl0aGVyIHRoZSBhdXRvRm9jdXMgbm9yIGp1c3QgY2FsbGluZyBmb2N1cygpIGhlcmUgd29ya2VkLCBzbyBoZXJlJ3MgYSBzZXRUaW1lb3V0XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5pbnB1dFJlZi5jdXJyZW50LmZvY3VzKCksIDApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldi5rZXkgPT09IEtleS5FTlRFUikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkVudGVyKCk7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgcmlnaHRCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnF1ZXJ5KSB7XG4gICAgICAgICAgICByaWdodEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25DaGFuZ2UoXCJcIil9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyX3NlYXJjaF9pY29uIG14X0Vtb2ppUGlja2VyX3NlYXJjaF9jbGVhclwiXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkNhbmNlbCBzZWFyY2hcIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByaWdodEJ1dHRvbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0Vtb2ppUGlja2VyX3NlYXJjaF9pY29uXCIgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FbW9qaVBpY2tlcl9zZWFyY2hcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2hcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5xdWVyeX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHRoaXMucHJvcHMub25DaGFuZ2UoZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmlucHV0UmVmfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAge3JpZ2h0QnV0dG9ufVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2g7XG4iXX0=