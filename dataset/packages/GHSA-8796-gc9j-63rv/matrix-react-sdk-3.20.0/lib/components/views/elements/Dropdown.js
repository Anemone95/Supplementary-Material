"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

var _Keyboard = require("../../../Keyboard");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

class MenuOption extends _react.default.Component {
  constructor(props) {
    super(props);
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  _onMouseEnter() {
    this.props.onMouseEnter(this.props.dropdownKey);
  }

  _onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onClick(this.props.dropdownKey);
  }

  render() {
    const optClasses = (0, _classnames.default)({
      mx_Dropdown_option: true,
      mx_Dropdown_option_highlight: this.props.highlighted
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      id: this.props.id,
      className: optClasses,
      onClick: this._onClick,
      onMouseEnter: this._onMouseEnter,
      role: "option",
      "aria-selected": this.props.highlighted,
      ref: this.props.inputRef
    }, this.props.children);
  }

}

(0, _defineProperty2.default)(MenuOption, "defaultProps", {
  disabled: false
});
MenuOption.propTypes = {
  children: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.node), _propTypes.default.node]),
  highlighted: _propTypes.default.bool,
  dropdownKey: _propTypes.default.string,
  onClick: _propTypes.default.func.isRequired,
  onMouseEnter: _propTypes.default.func.isRequired,
  inputRef: _propTypes.default.any
};
/*
 * Reusable dropdown select control, akin to react-select,
 * but somewhat simpler as react-select is 79KB of minified
 * javascript.
 *
 * TODO: Port NetworkDropdown to use this.
 */

let Dropdown = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.Dropdown"), _dec(_class = (_temp = class Dropdown extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onInputKeyDown", e => {
      let handled = true; // These keys don't generate keypress events and so needs to be on keyup

      switch (e.key) {
        case _Keyboard.Key.ENTER:
          this.props.onOptionChange(this.state.highlightedOption);
        // fallthrough

        case _Keyboard.Key.ESCAPE:
          this._close();

          break;

        case _Keyboard.Key.ARROW_DOWN:
          this.setState({
            highlightedOption: this._nextOption(this.state.highlightedOption)
          });
          break;

        case _Keyboard.Key.ARROW_UP:
          this.setState({
            highlightedOption: this._prevOption(this.state.highlightedOption)
          });
          break;

        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    this.dropdownRootElement = null;
    this.ignoreEvent = null;
    this._onInputClick = this._onInputClick.bind(this);
    this._onRootClick = this._onRootClick.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onMenuOptionClick = this._onMenuOptionClick.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._collectRoot = this._collectRoot.bind(this);
    this._collectInputTextBox = this._collectInputTextBox.bind(this);
    this._setHighlightedOption = this._setHighlightedOption.bind(this);
    this.inputTextBox = null;

    this._reindexChildren(this.props.children);

    const firstChild = _react.default.Children.toArray(props.children)[0];

    this.state = {
      // True if the menu is dropped-down
      expanded: false,
      // The key of the highlighted option
      // (the option that would become selected if you pressed enter)
      highlightedOption: firstChild ? firstChild.key : null,
      // the current search query
      searchQuery: ''
    };
  } // TODO: [REACT-WARNING] Replace component with real class, use constructor for refs


  UNSAFE_componentWillMount() {
    // eslint-disable-line camelcase
    this._button = /*#__PURE__*/(0, _react.createRef)(); // Listen for all clicks on the document so we can close the
    // menu when the user clicks somewhere else

    document.addEventListener('click', this._onDocumentClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._onDocumentClick, false);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event


  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line camelcase
    if (!nextProps.children || nextProps.children.length === 0) {
      return;
    }

    this._reindexChildren(nextProps.children);

    const firstChild = nextProps.children[0];
    this.setState({
      highlightedOption: firstChild ? firstChild.key : null
    });
  }

  _reindexChildren(children) {
    this.childrenByKey = {};

    _react.default.Children.forEach(children, child => {
      this.childrenByKey[child.key] = child;
    });
  }

  _onDocumentClick(ev) {
    // Close the dropdown if the user clicks anywhere that isn't
    // within our root element
    if (ev !== this.ignoreEvent) {
      this.setState({
        expanded: false
      });
    }
  }

  _onRootClick(ev) {
    // This captures any clicks that happen within our elements,
    // such that we can then ignore them when they're seen by the
    // click listener on the document handler, ie. not close the
    // dropdown immediately after opening it.
    // NB. We can't just stopPropagation() because then the event
    // doesn't reach the React onClick().
    this.ignoreEvent = ev;
  }

  _onInputClick(ev) {
    if (this.props.disabled) return;

    if (!this.state.expanded) {
      this.setState({
        expanded: true
      });
      ev.preventDefault();
    }
  }

  _close() {
    this.setState({
      expanded: false
    }); // their focus was on the input, its getting unmounted, move it to the button

    if (this._button.current) {
      this._button.current.focus();
    }
  }

  _onMenuOptionClick(dropdownKey) {
    this._close();

    this.props.onOptionChange(dropdownKey);
  }

  _onInputChange(e) {
    this.setState({
      searchQuery: e.target.value
    });

    if (this.props.onSearchChange) {
      this.props.onSearchChange(e.target.value);
    }
  }

  _collectRoot(e) {
    if (this.dropdownRootElement) {
      this.dropdownRootElement.removeEventListener('click', this._onRootClick, false);
    }

    if (e) {
      e.addEventListener('click', this._onRootClick, false);
    }

    this.dropdownRootElement = e;
  }

  _collectInputTextBox(e) {
    this.inputTextBox = e;
    if (e) e.focus();
  }

  _setHighlightedOption(optionKey) {
    this.setState({
      highlightedOption: optionKey
    });
  }

  _nextOption(optionKey) {
    const keys = Object.keys(this.childrenByKey);
    const index = keys.indexOf(optionKey);
    return keys[(index + 1) % keys.length];
  }

  _prevOption(optionKey) {
    const keys = Object.keys(this.childrenByKey);
    const index = keys.indexOf(optionKey);
    return keys[(index - 1) % keys.length];
  }

  _scrollIntoView(node) {
    if (node) {
      node.scrollIntoView({
        block: "nearest",
        behavior: "auto"
      });
    }
  }

  _getMenuOptions() {
    const options = _react.default.Children.map(this.props.children, child => {
      const highlighted = this.state.highlightedOption === child.key;
      return /*#__PURE__*/_react.default.createElement(MenuOption, {
        id: `${this.props.id}__${child.key}`,
        key: child.key,
        dropdownKey: child.key,
        highlighted: highlighted,
        onMouseEnter: this._setHighlightedOption,
        onClick: this._onMenuOptionClick,
        inputRef: highlighted ? this._scrollIntoView : undefined
      }, child);
    });

    if (options.length === 0) {
      return [/*#__PURE__*/_react.default.createElement("div", {
        key: "0",
        className: "mx_Dropdown_option",
        role: "option"
      }, (0, _languageHandler._t)("No results"))];
    }

    return options;
  }

  render() {
    let currentValue;
    const menuStyle = {};
    if (this.props.menuWidth) menuStyle.width = this.props.menuWidth;
    let menu;

    if (this.state.expanded) {
      if (this.props.searchEnabled) {
        currentValue = /*#__PURE__*/_react.default.createElement("input", {
          type: "text",
          className: "mx_Dropdown_option",
          ref: this._collectInputTextBox,
          onKeyDown: this._onInputKeyDown,
          onChange: this._onInputChange,
          value: this.state.searchQuery,
          role: "combobox",
          "aria-autocomplete": "list",
          "aria-activedescendant": `${this.props.id}__${this.state.highlightedOption}`,
          "aria-owns": `${this.props.id}_listbox`,
          "aria-disabled": this.props.disabled,
          "aria-label": this.props.label
        });
      }

      menu = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dropdown_menu",
        style: menuStyle,
        role: "listbox",
        id: `${this.props.id}_listbox`
      }, this._getMenuOptions());
    }

    if (!currentValue) {
      const selectedChild = this.props.getShortOption ? this.props.getShortOption(this.props.value) : this.childrenByKey[this.props.value];
      currentValue = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dropdown_option",
        id: `${this.props.id}_value`
      }, selectedChild);
    }

    const dropdownClasses = {
      mx_Dropdown: true,
      mx_Dropdown_disabled: this.props.disabled
    };

    if (this.props.className) {
      dropdownClasses[this.props.className] = true;
    } // Note the menu sits inside the AccessibleButton div so it's anchored
    // to the input, but overflows below it. The root contains both.


    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)(dropdownClasses),
      ref: this._collectRoot
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_Dropdown_input mx_no_textinput",
      onClick: this._onInputClick,
      "aria-haspopup": "listbox",
      "aria-expanded": this.state.expanded,
      disabled: this.props.disabled,
      inputRef: this._button,
      "aria-label": this.props.label,
      "aria-describedby": `${this.props.id}_value`
    }, currentValue, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_Dropdown_arrow"
    }), menu));
  }

}, _temp)) || _class);
exports.default = Dropdown;
Dropdown.propTypes = {
  id: _propTypes.default.string.isRequired,
  // The width that the dropdown should be. If specified,
  // the dropped-down part of the menu will be set to this
  // width.
  menuWidth: _propTypes.default.number,
  // Called when the selected option changes
  onOptionChange: _propTypes.default.func.isRequired,
  // Called when the value of the search field changes
  onSearchChange: _propTypes.default.func,
  searchEnabled: _propTypes.default.bool,
  // Function that, given the key of an option, returns
  // a node representing that option to be displayed in the
  // box itself as the currently-selected option (ie. as
  // opposed to in the actual dropped-down part). If
  // unspecified, the appropriate child element is used as
  // in the dropped-down menu.
  getShortOption: _propTypes.default.func,
  value: _propTypes.default.string,
  // negative for consistency with HTML
  disabled: _propTypes.default.bool,
  // ARIA label
  label: _propTypes.default.string.isRequired
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0Ryb3Bkb3duLmpzIl0sIm5hbWVzIjpbIk1lbnVPcHRpb24iLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJfb25Nb3VzZUVudGVyIiwiYmluZCIsIl9vbkNsaWNrIiwib25Nb3VzZUVudGVyIiwiZHJvcGRvd25LZXkiLCJlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJvbkNsaWNrIiwicmVuZGVyIiwib3B0Q2xhc3NlcyIsIm14X0Ryb3Bkb3duX29wdGlvbiIsIm14X0Ryb3Bkb3duX29wdGlvbl9oaWdobGlnaHQiLCJoaWdobGlnaHRlZCIsImlkIiwiaW5wdXRSZWYiLCJjaGlsZHJlbiIsImRpc2FibGVkIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwib25lT2ZUeXBlIiwiYXJyYXlPZiIsIm5vZGUiLCJib29sIiwic3RyaW5nIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJhbnkiLCJEcm9wZG93biIsImhhbmRsZWQiLCJrZXkiLCJLZXkiLCJFTlRFUiIsIm9uT3B0aW9uQ2hhbmdlIiwic3RhdGUiLCJoaWdobGlnaHRlZE9wdGlvbiIsIkVTQ0FQRSIsIl9jbG9zZSIsIkFSUk9XX0RPV04iLCJzZXRTdGF0ZSIsIl9uZXh0T3B0aW9uIiwiQVJST1dfVVAiLCJfcHJldk9wdGlvbiIsImRyb3Bkb3duUm9vdEVsZW1lbnQiLCJpZ25vcmVFdmVudCIsIl9vbklucHV0Q2xpY2siLCJfb25Sb290Q2xpY2siLCJfb25Eb2N1bWVudENsaWNrIiwiX29uTWVudU9wdGlvbkNsaWNrIiwiX29uSW5wdXRDaGFuZ2UiLCJfY29sbGVjdFJvb3QiLCJfY29sbGVjdElucHV0VGV4dEJveCIsIl9zZXRIaWdobGlnaHRlZE9wdGlvbiIsImlucHV0VGV4dEJveCIsIl9yZWluZGV4Q2hpbGRyZW4iLCJmaXJzdENoaWxkIiwiQ2hpbGRyZW4iLCJ0b0FycmF5IiwiZXhwYW5kZWQiLCJzZWFyY2hRdWVyeSIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJfYnV0dG9uIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJsZW5ndGgiLCJjaGlsZHJlbkJ5S2V5IiwiZm9yRWFjaCIsImNoaWxkIiwiZXYiLCJjdXJyZW50IiwiZm9jdXMiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uU2VhcmNoQ2hhbmdlIiwib3B0aW9uS2V5Iiwia2V5cyIsIk9iamVjdCIsImluZGV4IiwiaW5kZXhPZiIsIl9zY3JvbGxJbnRvVmlldyIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsIl9nZXRNZW51T3B0aW9ucyIsIm9wdGlvbnMiLCJtYXAiLCJ1bmRlZmluZWQiLCJjdXJyZW50VmFsdWUiLCJtZW51U3R5bGUiLCJtZW51V2lkdGgiLCJ3aWR0aCIsIm1lbnUiLCJzZWFyY2hFbmFibGVkIiwiX29uSW5wdXRLZXlEb3duIiwibGFiZWwiLCJzZWxlY3RlZENoaWxkIiwiZ2V0U2hvcnRPcHRpb24iLCJkcm9wZG93bkNsYXNzZXMiLCJteF9Ecm9wZG93biIsIm14X0Ryb3Bkb3duX2Rpc2FibGVkIiwiY2xhc3NOYW1lIiwibnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsTUFBTUEsVUFBTixTQUF5QkMsZUFBTUMsU0FBL0IsQ0FBeUM7QUFDckNDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsS0FBS0EsYUFBTCxDQUFtQkMsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBckI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLEtBQUtBLFFBQUwsQ0FBY0Qs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bUNBRGQ7QUFFSSxNQUFBLE9BQU8sRUFBRSxLQUFLTCxhQUZsQjtBQUdJLHVCQUFjLFNBSGxCO0FBSUksdUJBQWUsS0FBS1gsS0FBTCxDQUFXd0IsUUFKOUI7QUFLSSxNQUFBLFFBQVEsRUFBRSxLQUFLM0QsS0FBTCxDQUFXa0IsUUFMekI7QUFNSSxNQUFBLFFBQVEsRUFBRSxLQUFLNEMsT0FObkI7QUFPSSxvQkFBWSxLQUFLOUQsS0FBTCxDQUFXbUcsS0FQM0I7QUFRSSwwQkFBbUIsR0FBRSxLQUFLbkcsS0FBTCxDQUFXZSxFQUFHO0FBUnZDLE9BVU02RSxZQVZOLGVBV0k7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixNQVhKLEVBWU1JLElBWk4sQ0FERyxDQUFQO0FBZ0JIOztBQS9SaUQsQzs7QUFrU3REbkUsUUFBUSxDQUFDVixTQUFULEdBQXFCO0FBQ2pCSixFQUFBQSxFQUFFLEVBQUVLLG1CQUFVSyxNQUFWLENBQWlCRSxVQURKO0FBRWpCO0FBQ0E7QUFDQTtBQUNBbUUsRUFBQUEsU0FBUyxFQUFFMUUsbUJBQVVzRixNQUxKO0FBTWpCO0FBQ0F4RSxFQUFBQSxjQUFjLEVBQUVkLG1CQUFVTSxJQUFWLENBQWVDLFVBUGQ7QUFRakI7QUFDQW1ELEVBQUFBLGNBQWMsRUFBRTFELG1CQUFVTSxJQVRUO0FBVWpCdUUsRUFBQUEsYUFBYSxFQUFFN0UsbUJBQVVJLElBVlI7QUFXakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E2RSxFQUFBQSxjQUFjLEVBQUVqRixtQkFBVU0sSUFqQlQ7QUFrQmpCbUQsRUFBQUEsS0FBSyxFQUFFekQsbUJBQVVLLE1BbEJBO0FBbUJqQjtBQUNBUCxFQUFBQSxRQUFRLEVBQUVFLG1CQUFVSSxJQXBCSDtBQXFCakI7QUFDQTJFLEVBQUFBLEtBQUssRUFBRS9FLG1CQUFVSyxNQUFWLENBQWlCRTtBQXRCUCxDQUFyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5jbGFzcyBNZW51T3B0aW9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuX29uTW91c2VFbnRlciA9IHRoaXMuX29uTW91c2VFbnRlci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgX29uTW91c2VFbnRlcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbk1vdXNlRW50ZXIodGhpcy5wcm9wcy5kcm9wZG93bktleSk7XG4gICAgfVxuXG4gICAgX29uQ2xpY2soZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLmRyb3Bkb3duS2V5KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IG9wdENsYXNzZXMgPSBjbGFzc25hbWVzKHtcbiAgICAgICAgICAgIG14X0Ryb3Bkb3duX29wdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIG14X0Ryb3Bkb3duX29wdGlvbl9oaWdobGlnaHQ6IHRoaXMucHJvcHMuaGlnaGxpZ2h0ZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8ZGl2XG4gICAgICAgICAgICBpZD17dGhpcy5wcm9wcy5pZH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17b3B0Q2xhc3Nlc31cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMuX29uTW91c2VFbnRlcn1cbiAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGhpcy5wcm9wcy5oaWdobGlnaHRlZH1cbiAgICAgICAgICAgIHJlZj17dGhpcy5wcm9wcy5pbnB1dFJlZn1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuTWVudU9wdGlvbi5wcm9wVHlwZXMgPSB7XG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm5vZGUpLFxuICAgICAgUHJvcFR5cGVzLm5vZGUsXG4gICAgXSksXG4gICAgaGlnaGxpZ2h0ZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIGRyb3Bkb3duS2V5OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25Nb3VzZUVudGVyOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGlucHV0UmVmOiBQcm9wVHlwZXMuYW55LFxufTtcblxuLypcbiAqIFJldXNhYmxlIGRyb3Bkb3duIHNlbGVjdCBjb250cm9sLCBha2luIHRvIHJlYWN0LXNlbGVjdCxcbiAqIGJ1dCBzb21ld2hhdCBzaW1wbGVyIGFzIHJlYWN0LXNlbGVjdCBpcyA3OUtCIG9mIG1pbmlmaWVkXG4gKiBqYXZhc2NyaXB0LlxuICpcbiAqIFRPRE86IFBvcnQgTmV0d29ya0Ryb3Bkb3duIHRvIHVzZSB0aGlzLlxuICovXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5Ecm9wZG93blwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHJvcGRvd24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmRyb3Bkb3duUm9vdEVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmlnbm9yZUV2ZW50ID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9vbklucHV0Q2xpY2sgPSB0aGlzLl9vbklucHV0Q2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25Sb290Q2xpY2sgPSB0aGlzLl9vblJvb3RDbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkRvY3VtZW50Q2xpY2sgPSB0aGlzLl9vbkRvY3VtZW50Q2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25NZW51T3B0aW9uQ2xpY2sgPSB0aGlzLl9vbk1lbnVPcHRpb25DbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbklucHV0Q2hhbmdlID0gdGhpcy5fb25JbnB1dENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9jb2xsZWN0Um9vdCA9IHRoaXMuX2NvbGxlY3RSb290LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX2NvbGxlY3RJbnB1dFRleHRCb3ggPSB0aGlzLl9jb2xsZWN0SW5wdXRUZXh0Qm94LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3NldEhpZ2hsaWdodGVkT3B0aW9uID0gdGhpcy5fc2V0SGlnaGxpZ2h0ZWRPcHRpb24uYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmlucHV0VGV4dEJveCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fcmVpbmRleENoaWxkcmVuKHRoaXMucHJvcHMuY2hpbGRyZW4pO1xuXG4gICAgICAgIGNvbnN0IGZpcnN0Q2hpbGQgPSBSZWFjdC5DaGlsZHJlbi50b0FycmF5KHByb3BzLmNoaWxkcmVuKVswXTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gVHJ1ZSBpZiB0aGUgbWVudSBpcyBkcm9wcGVkLWRvd25cbiAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIC8vIFRoZSBrZXkgb2YgdGhlIGhpZ2hsaWdodGVkIG9wdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBvcHRpb24gdGhhdCB3b3VsZCBiZWNvbWUgc2VsZWN0ZWQgaWYgeW91IHByZXNzZWQgZW50ZXIpXG4gICAgICAgICAgICBoaWdobGlnaHRlZE9wdGlvbjogZmlyc3RDaGlsZCA/IGZpcnN0Q2hpbGQua2V5IDogbnVsbCxcbiAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHNlYXJjaCBxdWVyeVxuICAgICAgICAgICAgc2VhcmNoUXVlcnk6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIGNvbXBvbmVudCB3aXRoIHJlYWwgY2xhc3MsIHVzZSBjb25zdHJ1Y3RvciBmb3IgcmVmc1xuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIHRoaXMuX2J1dHRvbiA9IGNyZWF0ZVJlZigpO1xuICAgICAgICAvLyBMaXN0ZW4gZm9yIGFsbCBjbGlja3Mgb24gdGhlIGRvY3VtZW50IHNvIHdlIGNhbiBjbG9zZSB0aGVcbiAgICAgICAgLy8gbWVudSB3aGVuIHRoZSB1c2VyIGNsaWNrcyBzb21ld2hlcmUgZWxzZVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uRG9jdW1lbnRDbGljaywgZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uRG9jdW1lbnRDbGljaywgZmFsc2UpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGlmICghbmV4dFByb3BzLmNoaWxkcmVuIHx8IG5leHRQcm9wcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZWluZGV4Q2hpbGRyZW4obmV4dFByb3BzLmNoaWxkcmVuKTtcbiAgICAgICAgY29uc3QgZmlyc3RDaGlsZCA9IG5leHRQcm9wcy5jaGlsZHJlblswXTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBoaWdobGlnaHRlZE9wdGlvbjogZmlyc3RDaGlsZCA/IGZpcnN0Q2hpbGQua2V5IDogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3JlaW5kZXhDaGlsZHJlbihjaGlsZHJlbikge1xuICAgICAgICB0aGlzLmNoaWxkcmVuQnlLZXkgPSB7fTtcbiAgICAgICAgUmVhY3QuQ2hpbGRyZW4uZm9yRWFjaChjaGlsZHJlbiwgKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuQnlLZXlbY2hpbGQua2V5XSA9IGNoaWxkO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25Eb2N1bWVudENsaWNrKGV2KSB7XG4gICAgICAgIC8vIENsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3MgYW55d2hlcmUgdGhhdCBpc24ndFxuICAgICAgICAvLyB3aXRoaW4gb3VyIHJvb3QgZWxlbWVudFxuICAgICAgICBpZiAoZXYgIT09IHRoaXMuaWdub3JlRXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uUm9vdENsaWNrKGV2KSB7XG4gICAgICAgIC8vIFRoaXMgY2FwdHVyZXMgYW55IGNsaWNrcyB0aGF0IGhhcHBlbiB3aXRoaW4gb3VyIGVsZW1lbnRzLFxuICAgICAgICAvLyBzdWNoIHRoYXQgd2UgY2FuIHRoZW4gaWdub3JlIHRoZW0gd2hlbiB0aGV5J3JlIHNlZW4gYnkgdGhlXG4gICAgICAgIC8vIGNsaWNrIGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudCBoYW5kbGVyLCBpZS4gbm90IGNsb3NlIHRoZVxuICAgICAgICAvLyBkcm9wZG93biBpbW1lZGlhdGVseSBhZnRlciBvcGVuaW5nIGl0LlxuICAgICAgICAvLyBOQi4gV2UgY2FuJ3QganVzdCBzdG9wUHJvcGFnYXRpb24oKSBiZWNhdXNlIHRoZW4gdGhlIGV2ZW50XG4gICAgICAgIC8vIGRvZXNuJ3QgcmVhY2ggdGhlIFJlYWN0IG9uQ2xpY2soKS5cbiAgICAgICAgdGhpcy5pZ25vcmVFdmVudCA9IGV2O1xuICAgIH1cblxuICAgIF9vbklucHV0Q2xpY2soZXYpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZXhwYW5kZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGV4cGFuZGVkOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Nsb3NlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGV4cGFuZGVkOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoZWlyIGZvY3VzIHdhcyBvbiB0aGUgaW5wdXQsIGl0cyBnZXR0aW5nIHVubW91bnRlZCwgbW92ZSBpdCB0byB0aGUgYnV0dG9uXG4gICAgICAgIGlmICh0aGlzLl9idXR0b24uY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fYnV0dG9uLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbk1lbnVPcHRpb25DbGljayhkcm9wZG93bktleSkge1xuICAgICAgICB0aGlzLl9jbG9zZSgpO1xuICAgICAgICB0aGlzLnByb3BzLm9uT3B0aW9uQ2hhbmdlKGRyb3Bkb3duS2V5KTtcbiAgICB9XG5cbiAgICBfb25JbnB1dEtleURvd24gPSAoZSkgPT4ge1xuICAgICAgICBsZXQgaGFuZGxlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gVGhlc2Uga2V5cyBkb24ndCBnZW5lcmF0ZSBrZXlwcmVzcyBldmVudHMgYW5kIHNvIG5lZWRzIHRvIGJlIG9uIGtleXVwXG4gICAgICAgIHN3aXRjaCAoZS5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgS2V5LkVOVEVSOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25PcHRpb25DaGFuZ2UodGhpcy5zdGF0ZS5oaWdobGlnaHRlZE9wdGlvbik7XG4gICAgICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgS2V5LkVTQ0FQRTpcbiAgICAgICAgICAgICAgICB0aGlzLl9jbG9zZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfRE9XTjpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWRPcHRpb246IHRoaXMuX25leHRPcHRpb24odGhpcy5zdGF0ZS5oaWdobGlnaHRlZE9wdGlvbiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19VUDpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWRPcHRpb246IHRoaXMuX3ByZXZPcHRpb24odGhpcy5zdGF0ZS5oaWdobGlnaHRlZE9wdGlvbiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uSW5wdXRDaGFuZ2UoZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlYXJjaFF1ZXJ5OiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uU2VhcmNoQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uU2VhcmNoQ2hhbmdlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jb2xsZWN0Um9vdChlKSB7XG4gICAgICAgIGlmICh0aGlzLmRyb3Bkb3duUm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZHJvcGRvd25Sb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICdjbGljaycsIHRoaXMuX29uUm9vdENsaWNrLCBmYWxzZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgIGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vblJvb3RDbGljaywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJvcGRvd25Sb290RWxlbWVudCA9IGU7XG4gICAgfVxuXG4gICAgX2NvbGxlY3RJbnB1dFRleHRCb3goZSkge1xuICAgICAgICB0aGlzLmlucHV0VGV4dEJveCA9IGU7XG4gICAgICAgIGlmIChlKSBlLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgX3NldEhpZ2hsaWdodGVkT3B0aW9uKG9wdGlvbktleSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkT3B0aW9uOiBvcHRpb25LZXksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9uZXh0T3B0aW9uKG9wdGlvbktleSkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGlsZHJlbkJ5S2V5KTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBrZXlzLmluZGV4T2Yob3B0aW9uS2V5KTtcbiAgICAgICAgcmV0dXJuIGtleXNbKGluZGV4ICsgMSkgJSBrZXlzLmxlbmd0aF07XG4gICAgfVxuXG4gICAgX3ByZXZPcHRpb24ob3B0aW9uS2V5KSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNoaWxkcmVuQnlLZXkpO1xuICAgICAgICBjb25zdCBpbmRleCA9IGtleXMuaW5kZXhPZihvcHRpb25LZXkpO1xuICAgICAgICByZXR1cm4ga2V5c1soaW5kZXggLSAxKSAlIGtleXMubGVuZ3RoXTtcbiAgICB9XG5cbiAgICBfc2Nyb2xsSW50b1ZpZXcobm9kZSkge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgbm9kZS5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IFwibmVhcmVzdFwiLFxuICAgICAgICAgICAgICAgIGJlaGF2aW9yOiBcImF1dG9cIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldE1lbnVPcHRpb25zKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gUmVhY3QuQ2hpbGRyZW4ubWFwKHRoaXMucHJvcHMuY2hpbGRyZW4sIChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0ZWQgPSB0aGlzLnN0YXRlLmhpZ2hsaWdodGVkT3B0aW9uID09PSBjaGlsZC5rZXk7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlkPXtgJHt0aGlzLnByb3BzLmlkfV9fJHtjaGlsZC5rZXl9YH1cbiAgICAgICAgICAgICAgICAgICAga2V5PXtjaGlsZC5rZXl9XG4gICAgICAgICAgICAgICAgICAgIGRyb3Bkb3duS2V5PXtjaGlsZC5rZXl9XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkPXtoaWdobGlnaHRlZH1cbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLl9zZXRIaWdobGlnaHRlZE9wdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25NZW51T3B0aW9uQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXtoaWdobGlnaHRlZCA/IHRoaXMuX3Njcm9sbEludG9WaWV3IDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBjaGlsZCB9XG4gICAgICAgICAgICAgICAgPC9NZW51T3B0aW9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFs8ZGl2IGtleT1cIjBcIiBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9vcHRpb25cIiByb2xlPVwib3B0aW9uXCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIk5vIHJlc3VsdHNcIikgfVxuICAgICAgICAgICAgPC9kaXY+XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBjdXJyZW50VmFsdWU7XG5cbiAgICAgICAgY29uc3QgbWVudVN0eWxlID0ge307XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1lbnVXaWR0aCkgbWVudVN0eWxlLndpZHRoID0gdGhpcy5wcm9wcy5tZW51V2lkdGg7XG5cbiAgICAgICAgbGV0IG1lbnU7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmV4cGFuZGVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWFyY2hFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gKFxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Ryb3Bkb3duX29wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX2NvbGxlY3RJbnB1dFRleHRCb3h9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMuX29uSW5wdXRLZXlEb3dufVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uSW5wdXRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5zZWFyY2hRdWVyeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJjb21ib2JveFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWF1dG9jb21wbGV0ZT1cImxpc3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1hY3RpdmVkZXNjZW5kYW50PXtgJHt0aGlzLnByb3BzLmlkfV9fJHt0aGlzLnN0YXRlLmhpZ2hsaWdodGVkT3B0aW9ufWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLW93bnM9e2Ake3RoaXMucHJvcHMuaWR9X2xpc3Rib3hgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1kaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lbnUgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9tZW51XCIgc3R5bGU9e21lbnVTdHlsZX0gcm9sZT1cImxpc3Rib3hcIiBpZD17YCR7dGhpcy5wcm9wcy5pZH1fbGlzdGJveGB9PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuX2dldE1lbnVPcHRpb25zKCkgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZENoaWxkID0gdGhpcy5wcm9wcy5nZXRTaG9ydE9wdGlvbiA/XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRTaG9ydE9wdGlvbih0aGlzLnByb3BzLnZhbHVlKSA6XG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbkJ5S2V5W3RoaXMucHJvcHMudmFsdWVdO1xuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gPGRpdiBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9vcHRpb25cIiBpZD17YCR7dGhpcy5wcm9wcy5pZH1fdmFsdWVgfT5cbiAgICAgICAgICAgICAgICB7IHNlbGVjdGVkQ2hpbGQgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZHJvcGRvd25DbGFzc2VzID0ge1xuICAgICAgICAgICAgbXhfRHJvcGRvd246IHRydWUsXG4gICAgICAgICAgICBteF9Ecm9wZG93bl9kaXNhYmxlZDogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBkcm9wZG93bkNsYXNzZXNbdGhpcy5wcm9wcy5jbGFzc05hbWVdID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGUgdGhlIG1lbnUgc2l0cyBpbnNpZGUgdGhlIEFjY2Vzc2libGVCdXR0b24gZGl2IHNvIGl0J3MgYW5jaG9yZWRcbiAgICAgICAgLy8gdG8gdGhlIGlucHV0LCBidXQgb3ZlcmZsb3dzIGJlbG93IGl0LiBUaGUgcm9vdCBjb250YWlucyBib3RoLlxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoZHJvcGRvd25DbGFzc2VzKX0gcmVmPXt0aGlzLl9jb2xsZWN0Um9vdH0+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Ryb3Bkb3duX2lucHV0IG14X25vX3RleHRpbnB1dFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25JbnB1dENsaWNrfVxuICAgICAgICAgICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXt0aGlzLnN0YXRlLmV4cGFuZGVkfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLl9idXR0b259XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICBhcmlhLWRlc2NyaWJlZGJ5PXtgJHt0aGlzLnByb3BzLmlkfV92YWx1ZWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBjdXJyZW50VmFsdWUgfVxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0Ryb3Bkb3duX2Fycm93XCIgLz5cbiAgICAgICAgICAgICAgICB7IG1lbnUgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5Ecm9wZG93bi5wcm9wVHlwZXMgPSB7XG4gICAgaWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAvLyBUaGUgd2lkdGggdGhhdCB0aGUgZHJvcGRvd24gc2hvdWxkIGJlLiBJZiBzcGVjaWZpZWQsXG4gICAgLy8gdGhlIGRyb3BwZWQtZG93biBwYXJ0IG9mIHRoZSBtZW51IHdpbGwgYmUgc2V0IHRvIHRoaXNcbiAgICAvLyB3aWR0aC5cbiAgICBtZW51V2lkdGg6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLy8gQ2FsbGVkIHdoZW4gdGhlIHNlbGVjdGVkIG9wdGlvbiBjaGFuZ2VzXG4gICAgb25PcHRpb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgLy8gQ2FsbGVkIHdoZW4gdGhlIHZhbHVlIG9mIHRoZSBzZWFyY2ggZmllbGQgY2hhbmdlc1xuICAgIG9uU2VhcmNoQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBzZWFyY2hFbmFibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvLyBGdW5jdGlvbiB0aGF0LCBnaXZlbiB0aGUga2V5IG9mIGFuIG9wdGlvbiwgcmV0dXJuc1xuICAgIC8vIGEgbm9kZSByZXByZXNlbnRpbmcgdGhhdCBvcHRpb24gdG8gYmUgZGlzcGxheWVkIGluIHRoZVxuICAgIC8vIGJveCBpdHNlbGYgYXMgdGhlIGN1cnJlbnRseS1zZWxlY3RlZCBvcHRpb24gKGllLiBhc1xuICAgIC8vIG9wcG9zZWQgdG8gaW4gdGhlIGFjdHVhbCBkcm9wcGVkLWRvd24gcGFydCkuIElmXG4gICAgLy8gdW5zcGVjaWZpZWQsIHRoZSBhcHByb3ByaWF0ZSBjaGlsZCBlbGVtZW50IGlzIHVzZWQgYXNcbiAgICAvLyBpbiB0aGUgZHJvcHBlZC1kb3duIG1lbnUuXG4gICAgZ2V0U2hvcnRPcHRpb246IFByb3BUeXBlcy5mdW5jLFxuICAgIHZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8vIG5lZ2F0aXZlIGZvciBjb25zaXN0ZW5jeSB3aXRoIEhUTUxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gQVJJQSBsYWJlbFxuICAgIGxhYmVsOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG59O1xuIl19