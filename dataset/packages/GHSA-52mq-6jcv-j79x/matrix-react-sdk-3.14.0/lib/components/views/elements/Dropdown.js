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

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

var _Keyboard = require("../../../Keyboard");

/*
Copyright 2017 Vector Creations Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019 The Matrix.org Foundation C.I.C.

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

class Dropdown extends _react.default.Component {
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

}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0Ryb3Bkb3duLmpzIl0sIm5hbWVzIjpbIk1lbnVPcHRpb24iLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJfb25Nb3VzZUVudGVyIiwiYmluZCIsIl9vbkNsaWNrIiwib25Nb3VzZUVudGVyIiwiZHJvcGRvd25LZXkiLCJlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJvbkNsaWNrIiwicmVuZGVyIiwib3B0Q2xhc3NlcyIsIm14X0Ryb3Bkb3duX29wdGlvbiIsIm14X0Ryb3Bkb3duX29wdGlvbl9oaWdobGlnaHQiLCJoaWdobGlnaHRlZCIsImlkIiwiaW5wdXRSZWYiLCJjaGlsZHJlbiIsImRpc2FibGVkIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwib25lT2ZUeXBlIiwiYXJyYXlPZiIsIm5vZGUiLCJib29sIiwic3RyaW5nIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJhbnkiLCJEcm9wZG93biIsImhhbmRsZWQiLCJrZXkiLCJLZXkiLCJFTlRFUiIsIm9uT3B0aW9uQ2hhbmdlIiwic3RhdGUiLCJoaWdobGlnaHRlZE9wdGlvbiIsIkVTQ0FQRSIsIl9jbG9zZSIsIkFSUk9XX0RPV04iLCJzZXRTdGF0ZSIsIl9uZXh0T3B0aW9uIiwiQVJST1dfVVAiLCJfcHJldk9wdGlvbiIsImRyb3Bkb3duUm9vdEVsZW1lbnQiLCJpZ25vcmVFdmVudCIsIl9vbklucHV0Q2xpY2siLCJfb25Sb290Q2xpY2siLCJfb25Eb2N1bWVudENsaWNrIiwiX29uTWVudU9wdGlvbkNsaWNrIiwiX29uSW5wdXRDaGFuZ2UiLCJfY29sbGVjdFJvb3QiLCJfY29sbGVjdElucHV0VGV4dEJveCIsIl9zZXRIaWdobGlnaHRlZE9wdGlvbiIsImlucHV0VGV4dEJveCIsIl9yZWluZGV4Q2hpbGRyZW4iLCJmaXJzdENoaWxkIiwiQ2hpbGRyZW4iLCJ0b0FycmF5IiwiZXhwYW5kZWQiLCJzZWFyY2hRdWVyeSIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJfYnV0dG9uIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXh0UHJvcHMiLCJsZW5ndGgiLCJjaGlsZHJlbkJ5S2V5IiwiZm9yRWFjaCIsImNoaWxkIiwiZXYiLCJjdXJyZW50IiwiZm9jdXMiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uU2VhcmNoQ2hhbmdlIiwib3B0aW9uS2V5Iiwia2V5cyIsIk9iamVjdCIsImluZGV4IiwiaW5kZXhPZiIsIl9zY3JvbGxJbnRvVmlldyIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsIl9nZXRNZW51T3B0aW9ucyIsIm9wdGlvbnMiLCJtYXAiLCJ1bmRlZmluZWQiLCJjdXJyZW50VmFsdWUiLCJtZW51U3R5bGUiLCJtZW51V2lkdGgiLCJ3aWR0aCIsIm1lbnUiLCJzZWFyY2hFbmFibGVkIiwiX29uSW5wdXRLZXlEb3duIiwibGFiZWwiLCJzZWxlY3RlZENoaWxkIiwiZ2V0U2hvcnRPcHRpb24iLCJkcm9wZG93bkNsYXNzZXMiLCJteF9Ecm9wZG93biIsIm14X0Ryb3Bkb3duX2Rpc2FibGVkIiwiY2xhc3NOYW1lIiwibnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU0EsTUFBTUEsVUFBTixTQUF5QkMsZUFBTUMsU0FBL0IsQ0FBeUM7QUFDckNDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsS0FB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VmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5cbmNsYXNzIE1lbnVPcHRpb24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5fb25Nb3VzZUVudGVyID0gdGhpcy5fb25Nb3VzZUVudGVyLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIH07XG5cbiAgICBfb25Nb3VzZUVudGVyKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uTW91c2VFbnRlcih0aGlzLnByb3BzLmRyb3Bkb3duS2V5KTtcbiAgICB9XG5cbiAgICBfb25DbGljayhlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMuZHJvcGRvd25LZXkpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3Qgb3B0Q2xhc3NlcyA9IGNsYXNzbmFtZXMoe1xuICAgICAgICAgICAgbXhfRHJvcGRvd25fb3B0aW9uOiB0cnVlLFxuICAgICAgICAgICAgbXhfRHJvcGRvd25fb3B0aW9uX2hpZ2hsaWdodDogdGhpcy5wcm9wcy5oaWdobGlnaHRlZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIDxkaXZcbiAgICAgICAgICAgIGlkPXt0aGlzLnByb3BzLmlkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtvcHRDbGFzc2VzfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5fb25Nb3VzZUVudGVyfVxuICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0aGlzLnByb3BzLmhpZ2hsaWdodGVkfVxuICAgICAgICAgICAgcmVmPXt0aGlzLnByb3BzLmlucHV0UmVmfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IHRoaXMucHJvcHMuY2hpbGRyZW4gfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG5NZW51T3B0aW9uLnByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubm9kZSksXG4gICAgICBQcm9wVHlwZXMubm9kZSxcbiAgICBdKSxcbiAgICBoaWdobGlnaHRlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgZHJvcGRvd25LZXk6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbk1vdXNlRW50ZXI6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgaW5wdXRSZWY6IFByb3BUeXBlcy5hbnksXG59O1xuXG4vKlxuICogUmV1c2FibGUgZHJvcGRvd24gc2VsZWN0IGNvbnRyb2wsIGFraW4gdG8gcmVhY3Qtc2VsZWN0LFxuICogYnV0IHNvbWV3aGF0IHNpbXBsZXIgYXMgcmVhY3Qtc2VsZWN0IGlzIDc5S0Igb2YgbWluaWZpZWRcbiAqIGphdmFzY3JpcHQuXG4gKlxuICogVE9ETzogUG9ydCBOZXR3b3JrRHJvcGRvd24gdG8gdXNlIHRoaXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyb3Bkb3duIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5kcm9wZG93blJvb3RFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5pZ25vcmVFdmVudCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fb25JbnB1dENsaWNrID0gdGhpcy5fb25JbnB1dENsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uUm9vdENsaWNrID0gdGhpcy5fb25Sb290Q2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25Eb2N1bWVudENsaWNrID0gdGhpcy5fb25Eb2N1bWVudENsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uTWVudU9wdGlvbkNsaWNrID0gdGhpcy5fb25NZW51T3B0aW9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25JbnB1dENoYW5nZSA9IHRoaXMuX29uSW5wdXRDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fY29sbGVjdFJvb3QgPSB0aGlzLl9jb2xsZWN0Um9vdC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9jb2xsZWN0SW5wdXRUZXh0Qm94ID0gdGhpcy5fY29sbGVjdElucHV0VGV4dEJveC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9zZXRIaWdobGlnaHRlZE9wdGlvbiA9IHRoaXMuX3NldEhpZ2hsaWdodGVkT3B0aW9uLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5pbnB1dFRleHRCb3ggPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX3JlaW5kZXhDaGlsZHJlbih0aGlzLnByb3BzLmNoaWxkcmVuKTtcblxuICAgICAgICBjb25zdCBmaXJzdENoaWxkID0gUmVhY3QuQ2hpbGRyZW4udG9BcnJheShwcm9wcy5jaGlsZHJlbilbMF07XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIFRydWUgaWYgdGhlIG1lbnUgaXMgZHJvcHBlZC1kb3duXG4gICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgICAvLyBUaGUga2V5IG9mIHRoZSBoaWdobGlnaHRlZCBvcHRpb25cbiAgICAgICAgICAgIC8vICh0aGUgb3B0aW9uIHRoYXQgd291bGQgYmVjb21lIHNlbGVjdGVkIGlmIHlvdSBwcmVzc2VkIGVudGVyKVxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRPcHRpb246IGZpcnN0Q2hpbGQgPyBmaXJzdENoaWxkLmtleSA6IG51bGwsXG4gICAgICAgICAgICAvLyB0aGUgY3VycmVudCBzZWFyY2ggcXVlcnlcbiAgICAgICAgICAgIHNlYXJjaFF1ZXJ5OiAnJyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSBjb21wb25lbnQgd2l0aCByZWFsIGNsYXNzLCB1c2UgY29uc3RydWN0b3IgZm9yIHJlZnNcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICB0aGlzLl9idXR0b24gPSBjcmVhdGVSZWYoKTtcbiAgICAgICAgLy8gTGlzdGVuIGZvciBhbGwgY2xpY2tzIG9uIHRoZSBkb2N1bWVudCBzbyB3ZSBjYW4gY2xvc2UgdGhlXG4gICAgICAgIC8vIG1lbnUgd2hlbiB0aGUgdXNlciBjbGlja3Mgc29tZXdoZXJlIGVsc2VcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkRvY3VtZW50Q2xpY2ssIGZhbHNlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkRvY3VtZW50Q2xpY2ssIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICBpZiAoIW5leHRQcm9wcy5jaGlsZHJlbiB8fCBuZXh0UHJvcHMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVpbmRleENoaWxkcmVuKG5leHRQcm9wcy5jaGlsZHJlbik7XG4gICAgICAgIGNvbnN0IGZpcnN0Q2hpbGQgPSBuZXh0UHJvcHMuY2hpbGRyZW5bMF07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRPcHRpb246IGZpcnN0Q2hpbGQgPyBmaXJzdENoaWxkLmtleSA6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9yZWluZGV4Q2hpbGRyZW4oY2hpbGRyZW4pIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbkJ5S2V5ID0ge307XG4gICAgICAgIFJlYWN0LkNoaWxkcmVuLmZvckVhY2goY2hpbGRyZW4sIChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbkJ5S2V5W2NoaWxkLmtleV0gPSBjaGlsZDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uRG9jdW1lbnRDbGljayhldikge1xuICAgICAgICAvLyBDbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzIGFueXdoZXJlIHRoYXQgaXNuJ3RcbiAgICAgICAgLy8gd2l0aGluIG91ciByb290IGVsZW1lbnRcbiAgICAgICAgaWYgKGV2ICE9PSB0aGlzLmlnbm9yZUV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblJvb3RDbGljayhldikge1xuICAgICAgICAvLyBUaGlzIGNhcHR1cmVzIGFueSBjbGlja3MgdGhhdCBoYXBwZW4gd2l0aGluIG91ciBlbGVtZW50cyxcbiAgICAgICAgLy8gc3VjaCB0aGF0IHdlIGNhbiB0aGVuIGlnbm9yZSB0aGVtIHdoZW4gdGhleSdyZSBzZWVuIGJ5IHRoZVxuICAgICAgICAvLyBjbGljayBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQgaGFuZGxlciwgaWUuIG5vdCBjbG9zZSB0aGVcbiAgICAgICAgLy8gZHJvcGRvd24gaW1tZWRpYXRlbHkgYWZ0ZXIgb3BlbmluZyBpdC5cbiAgICAgICAgLy8gTkIuIFdlIGNhbid0IGp1c3Qgc3RvcFByb3BhZ2F0aW9uKCkgYmVjYXVzZSB0aGVuIHRoZSBldmVudFxuICAgICAgICAvLyBkb2Vzbid0IHJlYWNoIHRoZSBSZWFjdCBvbkNsaWNrKCkuXG4gICAgICAgIHRoaXMuaWdub3JlRXZlbnQgPSBldjtcbiAgICB9XG5cbiAgICBfb25JbnB1dENsaWNrKGV2KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmV4cGFuZGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jbG9zZSgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBleHBhbmRlZDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0aGVpciBmb2N1cyB3YXMgb24gdGhlIGlucHV0LCBpdHMgZ2V0dGluZyB1bm1vdW50ZWQsIG1vdmUgaXQgdG8gdGhlIGJ1dHRvblxuICAgICAgICBpZiAodGhpcy5fYnV0dG9uLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2J1dHRvbi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25NZW51T3B0aW9uQ2xpY2soZHJvcGRvd25LZXkpIHtcbiAgICAgICAgdGhpcy5fY2xvc2UoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbk9wdGlvbkNoYW5nZShkcm9wZG93bktleSk7XG4gICAgfVxuXG4gICAgX29uSW5wdXRLZXlEb3duID0gKGUpID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFRoZXNlIGtleXMgZG9uJ3QgZ2VuZXJhdGUga2V5cHJlc3MgZXZlbnRzIGFuZCBzbyBuZWVkcyB0byBiZSBvbiBrZXl1cFxuICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgICAgICBjYXNlIEtleS5FTlRFUjpcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uT3B0aW9uQ2hhbmdlKHRoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb24pO1xuICAgICAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlIEtleS5FU0NBUEU6XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5LkFSUk9XX0RPV046XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkT3B0aW9uOiB0aGlzLl9uZXh0T3B0aW9uKHRoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb24pLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfVVA6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkT3B0aW9uOiB0aGlzLl9wcmV2T3B0aW9uKHRoaXMuc3RhdGUuaGlnaGxpZ2h0ZWRPcHRpb24pLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbklucHV0Q2hhbmdlKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hRdWVyeTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblNlYXJjaENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblNlYXJjaENoYW5nZShlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY29sbGVjdFJvb3QoZSkge1xuICAgICAgICBpZiAodGhpcy5kcm9wZG93blJvb3RFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmRyb3Bkb3duUm9vdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAnY2xpY2snLCB0aGlzLl9vblJvb3RDbGljaywgZmFsc2UsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICBlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25Sb290Q2xpY2ssIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyb3Bkb3duUm9vdEVsZW1lbnQgPSBlO1xuICAgIH1cblxuICAgIF9jb2xsZWN0SW5wdXRUZXh0Qm94KGUpIHtcbiAgICAgICAgdGhpcy5pbnB1dFRleHRCb3ggPSBlO1xuICAgICAgICBpZiAoZSkgZS5mb2N1cygpO1xuICAgIH1cblxuICAgIF9zZXRIaWdobGlnaHRlZE9wdGlvbihvcHRpb25LZXkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBoaWdobGlnaHRlZE9wdGlvbjogb3B0aW9uS2V5LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfbmV4dE9wdGlvbihvcHRpb25LZXkpIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hpbGRyZW5CeUtleSk7XG4gICAgICAgIGNvbnN0IGluZGV4ID0ga2V5cy5pbmRleE9mKG9wdGlvbktleSk7XG4gICAgICAgIHJldHVybiBrZXlzWyhpbmRleCArIDEpICUga2V5cy5sZW5ndGhdO1xuICAgIH1cblxuICAgIF9wcmV2T3B0aW9uKG9wdGlvbktleSkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGlsZHJlbkJ5S2V5KTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBrZXlzLmluZGV4T2Yob3B0aW9uS2V5KTtcbiAgICAgICAgcmV0dXJuIGtleXNbKGluZGV4IC0gMSkgJSBrZXlzLmxlbmd0aF07XG4gICAgfVxuXG4gICAgX3Njcm9sbEludG9WaWV3KG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgIG5vZGUuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgICAgICAgIGJsb2NrOiBcIm5lYXJlc3RcIixcbiAgICAgICAgICAgICAgICBiZWhhdmlvcjogXCJhdXRvXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRNZW51T3B0aW9ucygpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IFJlYWN0LkNoaWxkcmVuLm1hcCh0aGlzLnByb3BzLmNoaWxkcmVuLCAoY2hpbGQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkID0gdGhpcy5zdGF0ZS5oaWdobGlnaHRlZE9wdGlvbiA9PT0gY2hpbGQua2V5O1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpZD17YCR7dGhpcy5wcm9wcy5pZH1fXyR7Y2hpbGQua2V5fWB9XG4gICAgICAgICAgICAgICAgICAgIGtleT17Y2hpbGQua2V5fVxuICAgICAgICAgICAgICAgICAgICBkcm9wZG93bktleT17Y2hpbGQua2V5fVxuICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRlZD17aGlnaGxpZ2h0ZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5fc2V0SGlnaGxpZ2h0ZWRPcHRpb259XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uTWVudU9wdGlvbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBpbnB1dFJlZj17aGlnaGxpZ2h0ZWQgPyB0aGlzLl9zY3JvbGxJbnRvVmlldyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgY2hpbGQgfVxuICAgICAgICAgICAgICAgIDwvTWVudU9wdGlvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbPGRpdiBrZXk9XCIwXCIgY2xhc3NOYW1lPVwibXhfRHJvcGRvd25fb3B0aW9uXCIgcm9sZT1cIm9wdGlvblwiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJObyByZXN1bHRzXCIpIH1cbiAgICAgICAgICAgIDwvZGl2Pl07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY3VycmVudFZhbHVlO1xuXG4gICAgICAgIGNvbnN0IG1lbnVTdHlsZSA9IHt9O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tZW51V2lkdGgpIG1lbnVTdHlsZS53aWR0aCA9IHRoaXMucHJvcHMubWVudVdpZHRoO1xuXG4gICAgICAgIGxldCBtZW51O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5leHBhbmRlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VhcmNoRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IChcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9vcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9jb2xsZWN0SW5wdXRUZXh0Qm94fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLl9vbklucHV0S2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbklucHV0Q2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuc2VhcmNoUXVlcnl9XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwiY29tYm9ib3hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1hdXRvY29tcGxldGU9XCJsaXN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtYWN0aXZlZGVzY2VuZGFudD17YCR7dGhpcy5wcm9wcy5pZH1fXyR7dGhpcy5zdGF0ZS5oaWdobGlnaHRlZE9wdGlvbn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1vd25zPXtgJHt0aGlzLnByb3BzLmlkfV9saXN0Ym94YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZW51ID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRHJvcGRvd25fbWVudVwiIHN0eWxlPXttZW51U3R5bGV9IHJvbGU9XCJsaXN0Ym94XCIgaWQ9e2Ake3RoaXMucHJvcHMuaWR9X2xpc3Rib3hgfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLl9nZXRNZW51T3B0aW9ucygpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRDaGlsZCA9IHRoaXMucHJvcHMuZ2V0U2hvcnRPcHRpb24gP1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0U2hvcnRPcHRpb24odGhpcy5wcm9wcy52YWx1ZSkgOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW5CeUtleVt0aGlzLnByb3BzLnZhbHVlXTtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfRHJvcGRvd25fb3B0aW9uXCIgaWQ9e2Ake3RoaXMucHJvcHMuaWR9X3ZhbHVlYH0+XG4gICAgICAgICAgICAgICAgeyBzZWxlY3RlZENoaWxkIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRyb3Bkb3duQ2xhc3NlcyA9IHtcbiAgICAgICAgICAgIG14X0Ryb3Bkb3duOiB0cnVlLFxuICAgICAgICAgICAgbXhfRHJvcGRvd25fZGlzYWJsZWQ6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgZHJvcGRvd25DbGFzc2VzW3RoaXMucHJvcHMuY2xhc3NOYW1lXSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlIHRoZSBtZW51IHNpdHMgaW5zaWRlIHRoZSBBY2Nlc3NpYmxlQnV0dG9uIGRpdiBzbyBpdCdzIGFuY2hvcmVkXG4gICAgICAgIC8vIHRvIHRoZSBpbnB1dCwgYnV0IG92ZXJmbG93cyBiZWxvdyBpdC4gVGhlIHJvb3QgY29udGFpbnMgYm90aC5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjbGFzc25hbWVzKGRyb3Bkb3duQ2xhc3Nlcyl9IHJlZj17dGhpcy5fY29sbGVjdFJvb3R9PlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9pbnB1dCBteF9ub190ZXh0aW5wdXRcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uSW5wdXRDbGlja31cbiAgICAgICAgICAgICAgICBhcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17dGhpcy5zdGF0ZS5leHBhbmRlZH1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICAgICAgICBpbnB1dFJlZj17dGhpcy5fYnV0dG9ufVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgICAgICAgICAgYXJpYS1kZXNjcmliZWRieT17YCR7dGhpcy5wcm9wcy5pZH1fdmFsdWVgfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgY3VycmVudFZhbHVlIH1cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Ecm9wZG93bl9hcnJvd1wiIC8+XG4gICAgICAgICAgICAgICAgeyBtZW51IH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuRHJvcGRvd24ucHJvcFR5cGVzID0ge1xuICAgIGlkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgLy8gVGhlIHdpZHRoIHRoYXQgdGhlIGRyb3Bkb3duIHNob3VsZCBiZS4gSWYgc3BlY2lmaWVkLFxuICAgIC8vIHRoZSBkcm9wcGVkLWRvd24gcGFydCBvZiB0aGUgbWVudSB3aWxsIGJlIHNldCB0byB0aGlzXG4gICAgLy8gd2lkdGguXG4gICAgbWVudVdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIC8vIENhbGxlZCB3aGVuIHRoZSBzZWxlY3RlZCBvcHRpb24gY2hhbmdlc1xuICAgIG9uT3B0aW9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8vIENhbGxlZCB3aGVuIHRoZSB2YWx1ZSBvZiB0aGUgc2VhcmNoIGZpZWxkIGNoYW5nZXNcbiAgICBvblNlYXJjaENoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgc2VhcmNoRW5hYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gRnVuY3Rpb24gdGhhdCwgZ2l2ZW4gdGhlIGtleSBvZiBhbiBvcHRpb24sIHJldHVybnNcbiAgICAvLyBhIG5vZGUgcmVwcmVzZW50aW5nIHRoYXQgb3B0aW9uIHRvIGJlIGRpc3BsYXllZCBpbiB0aGVcbiAgICAvLyBib3ggaXRzZWxmIGFzIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgb3B0aW9uIChpZS4gYXNcbiAgICAvLyBvcHBvc2VkIHRvIGluIHRoZSBhY3R1YWwgZHJvcHBlZC1kb3duIHBhcnQpLiBJZlxuICAgIC8vIHVuc3BlY2lmaWVkLCB0aGUgYXBwcm9wcmlhdGUgY2hpbGQgZWxlbWVudCBpcyB1c2VkIGFzXG4gICAgLy8gaW4gdGhlIGRyb3BwZWQtZG93biBtZW51LlxuICAgIGdldFNob3J0T3B0aW9uOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvLyBuZWdhdGl2ZSBmb3IgY29uc2lzdGVuY3kgd2l0aCBIVE1MXG4gICAgZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIC8vIEFSSUEgbGFiZWxcbiAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxufTtcbiJdfQ==