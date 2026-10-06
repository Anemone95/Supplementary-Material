"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMenu = createMenu;
Object.defineProperty(exports, "ContextMenuButton", {
  enumerable: true,
  get: function () {
    return _ContextMenuButton.ContextMenuButton;
  }
});
Object.defineProperty(exports, "ContextMenuTooltipButton", {
  enumerable: true,
  get: function () {
    return _ContextMenuTooltipButton.ContextMenuTooltipButton;
  }
});
Object.defineProperty(exports, "MenuGroup", {
  enumerable: true,
  get: function () {
    return _MenuGroup.MenuGroup;
  }
});
Object.defineProperty(exports, "MenuItem", {
  enumerable: true,
  get: function () {
    return _MenuItem.MenuItem;
  }
});
Object.defineProperty(exports, "MenuItemCheckbox", {
  enumerable: true,
  get: function () {
    return _MenuItemCheckbox.MenuItemCheckbox;
  }
});
Object.defineProperty(exports, "MenuItemRadio", {
  enumerable: true,
  get: function () {
    return _MenuItemRadio.MenuItemRadio;
  }
});
Object.defineProperty(exports, "StyledMenuItemCheckbox", {
  enumerable: true,
  get: function () {
    return _StyledMenuItemCheckbox.StyledMenuItemCheckbox;
  }
});
Object.defineProperty(exports, "StyledMenuItemRadio", {
  enumerable: true,
  get: function () {
    return _StyledMenuItemRadio.StyledMenuItemRadio;
  }
});
exports.default = exports.useContextMenu = exports.alwaysAboveRightOf = exports.alwaysAboveLeftOf = exports.aboveLeftOf = exports.toRightOf = exports.ContextMenu = exports.ChevronFace = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _classnames = _interopRequireDefault(require("classnames"));

var _Keyboard = require("../../Keyboard");

var _ContextMenuButton = require("../../accessibility/context_menu/ContextMenuButton");

var _ContextMenuTooltipButton = require("../../accessibility/context_menu/ContextMenuTooltipButton");

var _MenuGroup = require("../../accessibility/context_menu/MenuGroup");

var _MenuItem = require("../../accessibility/context_menu/MenuItem");

var _MenuItemCheckbox = require("../../accessibility/context_menu/MenuItemCheckbox");

var _MenuItemRadio = require("../../accessibility/context_menu/MenuItemRadio");

var _StyledMenuItemCheckbox = require("../../accessibility/context_menu/StyledMenuItemCheckbox");

var _StyledMenuItemRadio = require("../../accessibility/context_menu/StyledMenuItemRadio");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Shamelessly ripped off Modal.js.  There's probably a better way
// of doing reusable widgets like dialog boxes & menus where we go and
// pass in a custom control as the actual body.
const ContextualMenuContainerId = "mx_ContextualMenu_Container";

function getOrCreateContainer()
/*: HTMLDivElement*/
{
  let container = document.getElementById(ContextualMenuContainerId);

  if (!container) {
    container = document.createElement("div");
    container.id = ContextualMenuContainerId;
    document.body.appendChild(container);
  }

  return container;
}

const ARIA_MENU_ITEM_ROLES = new Set(["menuitem", "menuitemcheckbox", "menuitemradio"]);
let ChevronFace;
exports.ChevronFace = ChevronFace;

(function (ChevronFace) {
  ChevronFace["Top"] = "top";
  ChevronFace["Bottom"] = "bottom";
  ChevronFace["Left"] = "left";
  ChevronFace["Right"] = "right";
  ChevronFace["None"] = "none";
})(ChevronFace || (exports.ChevronFace = ChevronFace = {}));
/*:: export interface IProps extends IPosition {
    menuWidth?: number;
    menuHeight?: number;

    chevronOffset?: number;
    chevronFace?: ChevronFace;

    menuPaddingTop?: number;
    menuPaddingBottom?: number;
    menuPaddingLeft?: number;
    menuPaddingRight?: number;

    zIndex?: number;

    // If true, insert an invisible screen-sized element behind the menu that when clicked will close it.
    hasBackground?: boolean;
    // whether this context menu should be focus managed. If false it must handle itself
    managed?: boolean;

    // Function to be called on menu close
    onFinished();
    // on resize callback
    windowResize?();
}*/


// Generic ContextMenu Portal wrapper
// all options inside the menu should be of role=menuitem/menuitemcheckbox/menuitemradiobutton and have tabIndex={-1}
// this will allow the ContextMenu to manage its own focus using arrow keys as per the ARIA guidelines.
class ContextMenu extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "initialFocus", void 0);
    (0, _defineProperty2.default)(this, "collectContextMenuRect", element => {
      // We don't need to clean up when unmounting, so ignore
      if (!element) return;
      let first = element.querySelector('[role^="menuitem"]');

      if (!first) {
        first = element.querySelector('[tab-index]');
      }

      if (first) {
        first.focus();
      }

      this.setState({
        contextMenuElem: element
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", e => {
      if (this.props.onFinished) {
        this.props.onFinished();
        e.preventDefault();
        e.stopPropagation();
        const x = e.clientX;
        const y = e.clientY; // XXX: This isn't pretty but the only way to allow opening a different context menu on right click whilst
        // a context menu and its click-guard are up without completely rewriting how the context menus work.

        setImmediate(() => {
          const clickEvent = document.createEvent('MouseEvents');
          clickEvent.initMouseEvent('contextmenu', true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, null);
          document.elementFromPoint(x, y).dispatchEvent(clickEvent);
        });
      }
    });
    (0, _defineProperty2.default)(this, "onContextMenuPreventBubbling", e => {
      // stop propagation so that any context menu handlers don't leak out of this context menu
      // but do not inhibit the default browser menu
      e.stopPropagation();
    });
    (0, _defineProperty2.default)(this, "onFinished", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.stopPropagation();
      ev.preventDefault();
      if (this.props.onFinished) this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onMoveFocus", (element
    /*: Element*/
    , up
    /*: boolean*/
    ) => {
      let descending = false; // are we currently descending or ascending through the DOM tree?

      do {
        const child = up ? element.lastElementChild : element.firstElementChild;
        const sibling = up ? element.previousElementSibling : element.nextElementSibling;

        if (descending) {
          if (child) {
            element = child;
          } else if (sibling) {
            element = sibling;
          } else {
            descending = false;
            element = element.parentElement;
          }
        } else {
          if (sibling) {
            element = sibling;
            descending = true;
          } else {
            element = element.parentElement;
          }
        }

        if (element) {
          if (element.classList.contains("mx_ContextualMenu")) {
            // we hit the top
            element = up ? element.lastElementChild : element.firstElementChild;
            descending = true;
          }
        }
      } while (element && !ARIA_MENU_ITEM_ROLES.has(element.getAttribute("role")));

      if (element) {
        element.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onMoveFocusHomeEnd", (element
    /*: Element*/
    , up
    /*: boolean*/
    ) => {
      let results = element.querySelectorAll('[role^="menuitem"]');

      if (!results) {
        results = element.querySelectorAll('[tab-index]');
      }

      if (results && results.length) {
        if (up) {
          results[0].focus();
        } else {
          results[results.length - 1].focus();
        }
      }
    });
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      if (!this.props.managed) {
        if (ev.key === _Keyboard.Key.ESCAPE) {
          this.props.onFinished();
          ev.stopPropagation();
          ev.preventDefault();
        }

        return;
      }

      let handled = true;

      switch (ev.key) {
        case _Keyboard.Key.TAB:
        case _Keyboard.Key.ESCAPE:
        case _Keyboard.Key.ARROW_LEFT: // close on left and right arrows too for when it is a context menu on a <Toolbar />

        case _Keyboard.Key.ARROW_RIGHT:
          this.props.onFinished();
          break;

        case _Keyboard.Key.ARROW_UP:
          this.onMoveFocus(ev.target, true);
          break;

        case _Keyboard.Key.ARROW_DOWN:
          this.onMoveFocus(ev.target, false);
          break;

        case _Keyboard.Key.HOME:
          this.onMoveFocusHomeEnd(this.state.contextMenuElem, true);
          break;

        case _Keyboard.Key.END:
          this.onMoveFocusHomeEnd(this.state.contextMenuElem, false);
          break;

        default:
          handled = false;
      }

      if (handled) {
        // consume all other keys in context menu
        ev.stopPropagation();
        ev.preventDefault();
      }
    });
    this.state = {
      contextMenuElem: null
    }; // persist what had focus when we got initialized so we can return it after

    this.initialFocus = document.activeElement;
  }

  componentWillUnmount() {
    // return focus to the thing which had it before us
    this.initialFocus.focus();
  }

  renderMenu(hasBackground = this.props.hasBackground) {
    const position
    /*: Partial<Writeable<DOMRect>>*/
    = {};
    const props = this.props;

    if (props.top) {
      position.top = props.top;
    } else {
      position.bottom = props.bottom;
    }

    let chevronFace
    /*: ChevronFace*/
    ;

    if (props.left) {
      position.left = props.left;
      chevronFace = ChevronFace.Left;
    } else {
      position.right = props.right;
      chevronFace = ChevronFace.Right;
    }

    const contextMenuRect = this.state.contextMenuElem ? this.state.contextMenuElem.getBoundingClientRect() : null;
    const chevronOffset
    /*: CSSProperties*/
    = {};

    if (props.chevronFace) {
      chevronFace = props.chevronFace;
    }

    const hasChevron = chevronFace && chevronFace !== ChevronFace.None;

    if (chevronFace === ChevronFace.Top || chevronFace === ChevronFace.Bottom) {
      chevronOffset.left = props.chevronOffset;
    } else if (position.top !== undefined) {
      const target = position.top; // By default, no adjustment is made

      let adjusted = target; // If we know the dimensions of the context menu, adjust its position
      // such that it does not leave the (padded) window.

      if (contextMenuRect) {
        const padding = 10;
        adjusted = Math.min(position.top, document.body.clientHeight - contextMenuRect.height + padding);
      }

      position.top = adjusted;
      chevronOffset.top = Math.max(props.chevronOffset, props.chevronOffset + target - adjusted);
    }

    let chevron;

    if (hasChevron) {
      chevron = /*#__PURE__*/_react.default.createElement("div", {
        style: chevronOffset,
        className: "mx_ContextualMenu_chevron_" + chevronFace
      });
    }

    const menuClasses = (0, _classnames.default)({
      'mx_ContextualMenu': true,
      'mx_ContextualMenu_left': !hasChevron && position.left,
      'mx_ContextualMenu_right': !hasChevron && position.right,
      'mx_ContextualMenu_top': !hasChevron && position.top,
      'mx_ContextualMenu_bottom': !hasChevron && position.bottom,
      'mx_ContextualMenu_withChevron_left': chevronFace === ChevronFace.Left,
      'mx_ContextualMenu_withChevron_right': chevronFace === ChevronFace.Right,
      'mx_ContextualMenu_withChevron_top': chevronFace === ChevronFace.Top,
      'mx_ContextualMenu_withChevron_bottom': chevronFace === ChevronFace.Bottom
    });
    const menuStyle
    /*: CSSProperties*/
    = {};

    if (props.menuWidth) {
      menuStyle.width = props.menuWidth;
    }

    if (props.menuHeight) {
      menuStyle.height = props.menuHeight;
    }

    if (!isNaN(Number(props.menuPaddingTop))) {
      menuStyle["paddingTop"] = props.menuPaddingTop;
    }

    if (!isNaN(Number(props.menuPaddingLeft))) {
      menuStyle["paddingLeft"] = props.menuPaddingLeft;
    }

    if (!isNaN(Number(props.menuPaddingBottom))) {
      menuStyle["paddingBottom"] = props.menuPaddingBottom;
    }

    if (!isNaN(Number(props.menuPaddingRight))) {
      menuStyle["paddingRight"] = props.menuPaddingRight;
    }

    const wrapperStyle = {};

    if (!isNaN(Number(props.zIndex))) {
      menuStyle["zIndex"] = props.zIndex + 1;
      wrapperStyle["zIndex"] = props.zIndex;
    }

    let background;

    if (hasBackground) {
      background = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ContextualMenu_background",
        style: wrapperStyle,
        onClick: this.onFinished,
        onContextMenu: this.onContextMenu
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ContextualMenu_wrapper",
      style: _objectSpread(_objectSpread({}, position), wrapperStyle),
      onKeyDown: this.onKeyDown,
      onContextMenu: this.onContextMenuPreventBubbling
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: menuClasses,
      style: menuStyle,
      ref: this.collectContextMenuRect,
      role: this.props.managed ? "menu" : undefined
    }, chevron, props.children), background);
  }

  render()
  /*: React.ReactChild*/
  {
    return /*#__PURE__*/_reactDom.default.createPortal(this.renderMenu(), getOrCreateContainer());
  }

} // Placement method for <ContextMenu /> to position context menu to right of elementRect with chevronOffset


exports.ContextMenu = ContextMenu;
(0, _defineProperty2.default)(ContextMenu, "defaultProps", {
  hasBackground: true,
  managed: true
});

const toRightOf = (elementRect
/*: DOMRect*/
, chevronOffset = 12) => {
  const left = elementRect.right + window.pageXOffset + 3;
  let top = elementRect.top + elementRect.height / 2 + window.pageYOffset;
  top -= chevronOffset + 8; // where 8 is half the height of the chevron

  return {
    left,
    top,
    chevronOffset
  };
}; // Placement method for <ContextMenu /> to position context menu right-aligned and flowing to the left of elementRect,
// and either above or below: wherever there is more space (maybe this should be aboveOrBelowLeftOf?)


exports.toRightOf = toRightOf;

const aboveLeftOf = (elementRect
/*: DOMRect*/
, chevronFace = ChevronFace.None, vPadding = 0) => {
  const menuOptions
  /*: IPosition & { chevronFace: ChevronFace }*/
  = {
    chevronFace
  };
  const buttonRight = elementRect.right + window.pageXOffset;
  const buttonBottom = elementRect.bottom + window.pageYOffset;
  const buttonTop = elementRect.top + window.pageYOffset; // Align the right edge of the menu to the right edge of the button

  menuOptions.right = window.innerWidth - buttonRight; // Align the menu vertically on whichever side of the button has more space available.

  if (buttonBottom < window.innerHeight / 2) {
    menuOptions.top = buttonBottom + vPadding;
  } else {
    menuOptions.bottom = window.innerHeight - buttonTop + vPadding;
  }

  return menuOptions;
}; // Placement method for <ContextMenu /> to position context menu right-aligned and flowing to the left of elementRect
// and always above elementRect


exports.aboveLeftOf = aboveLeftOf;

const alwaysAboveLeftOf = (elementRect
/*: DOMRect*/
, chevronFace = ChevronFace.None, vPadding = 0) => {
  const menuOptions
  /*: IPosition & { chevronFace: ChevronFace }*/
  = {
    chevronFace
  };
  const buttonRight = elementRect.right + window.pageXOffset;
  const buttonBottom = elementRect.bottom + window.pageYOffset;
  const buttonTop = elementRect.top + window.pageYOffset; // Align the right edge of the menu to the right edge of the button

  menuOptions.right = window.innerWidth - buttonRight; // Align the menu vertically on whichever side of the button has more space available.

  if (buttonBottom < window.innerHeight / 2) {
    menuOptions.top = buttonBottom + vPadding;
  } else {
    menuOptions.bottom = window.innerHeight - buttonTop + vPadding;
  }

  return menuOptions;
}; // Placement method for <ContextMenu /> to position context menu right-aligned and flowing to the right of elementRect
// and always above elementRect


exports.alwaysAboveLeftOf = alwaysAboveLeftOf;

const alwaysAboveRightOf = (elementRect
/*: DOMRect*/
, chevronFace = ChevronFace.None, vPadding = 0) => {
  const menuOptions
  /*: IPosition & { chevronFace: ChevronFace }*/
  = {
    chevronFace
  };
  const buttonLeft = elementRect.left + window.pageXOffset;
  const buttonTop = elementRect.top + window.pageYOffset; // Align the left edge of the menu to the left edge of the button

  menuOptions.left = buttonLeft; // Align the menu vertically above the menu

  menuOptions.bottom = window.innerHeight - buttonTop + vPadding;
  return menuOptions;
};

exports.alwaysAboveRightOf = alwaysAboveRightOf;

const useContextMenu = () =>
/*: ContextMenuTuple<T>*/
{
  const button = (0, _react.useRef)(null);
  const [isOpen, setIsOpen] = (0, _react.useState)(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return [isOpen, button, open, close, setIsOpen];
};

exports.useContextMenu = useContextMenu;

class LegacyContextMenu extends ContextMenu {
  render() {
    return this.renderMenu(false);
  }

} // XXX: Deprecated, used only for dynamic Tooltips. Avoid using at all costs.


exports.default = LegacyContextMenu;

function createMenu(ElementClass, props) {
  const onFinished = function (...args) {
    _reactDom.default.unmountComponentAtNode(getOrCreateContainer());

    if (props && props.onFinished) {
      props.onFinished.apply(null, args);
    }
  };

  const menu = /*#__PURE__*/_react.default.createElement(LegacyContextMenu, (0, _extends2.default)({}, props, {
    onFinished: onFinished // eslint-disable-line react/jsx-no-bind
    ,
    windowResize: onFinished // eslint-disable-line react/jsx-no-bind

  }), /*#__PURE__*/_react.default.createElement(ElementClass, (0, _extends2.default)({}, props, {
    onFinished: onFinished
  })));

  _reactDom.default.render(menu, getOrCreateContainer());

  return {
    close: onFinished
  };
} // re-export the semantic helper components for simplicity
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvQ29udGV4dE1lbnUudHN4Il0sIm5hbWVzIjpbIkNvbnRleHR1YWxNZW51Q29udGFpbmVySWQiLCJnZXRPckNyZWF0ZUNvbnRhaW5lciIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJBUklBX01FTlVfSVRFTV9ST0xFUyIsIlNldCIsIkNoZXZyb25GYWNlIiwiQ29udGV4dE1lbnUiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImVsZW1lbnQiLCJmaXJzdCIsInF1ZXJ5U2VsZWN0b3IiLCJmb2N1cyIsInNldFN0YXRlIiwiY29udGV4dE1lbnVFbGVtIiwiZSIsIm9uRmluaXNoZWQiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIngiLCJjbGllbnRYIiwieSIsImNsaWVudFkiLCJzZXRJbW1lZGlhdGUiLCJjbGlja0V2ZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0TW91c2VFdmVudCIsIndpbmRvdyIsImVsZW1lbnRGcm9tUG9pbnQiLCJkaXNwYXRjaEV2ZW50IiwiZXYiLCJ1cCIsImRlc2NlbmRpbmciLCJjaGlsZCIsImxhc3RFbGVtZW50Q2hpbGQiLCJmaXJzdEVsZW1lbnRDaGlsZCIsInNpYmxpbmciLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwicGFyZW50RWxlbWVudCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaGFzIiwiZ2V0QXR0cmlidXRlIiwicmVzdWx0cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsZW5ndGgiLCJtYW5hZ2VkIiwia2V5IiwiS2V5IiwiRVNDQVBFIiwiaGFuZGxlZCIsIlRBQiIsIkFSUk9XX0xFRlQiLCJBUlJPV19SSUdIVCIsIkFSUk9XX1VQIiwib25Nb3ZlRm9jdXMiLCJ0YXJnZXQiLCJBUlJPV19ET1dOIiwiSE9NRSIsIm9uTW92ZUZvY3VzSG9tZUVuZCIsInN0YXRlIiwiRU5EIiwiaW5pdGlhbEZvY3VzIiwiYWN0aXZlRWxlbWVudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVuZGVyTWVudSIsImhhc0JhY2tncm91bmQiLCJwb3NpdGlvbiIsInRvcCIsImJvdHRvbSIsImNoZXZyb25GYWNlIiwibGVmdCIsIkxlZnQiLCJyaWdodCIsIlJpZ2h0IiwiY29udGV4dE1lbnVSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2hldnJvbk9mZnNldCIsImhhc0NoZXZyb24iLCJOb25lIiwiVG9wIiwiQm90dG9tIiwidW5kZWZpbmVkIiwiYWRqdXN0ZWQiLCJwYWRkaW5nIiwiTWF0aCIsIm1pbiIsImNsaWVudEhlaWdodCIsImhlaWdodCIsIm1heCIsImNoZXZyb24iLCJtZW51Q2xhc3NlcyIsIm1lbnVTdHlsZSIsIm1lbnVXaWR0aCIsIndpZHRoIiwibWVudUhlaWdodCIsImlzTmFOIiwiTnVtYmVyIiwibWVudVBhZGRpbmdUb3AiLCJtZW51UGFkZGluZ0xlZnQiLCJtZW51UGFkZGluZ0JvdHRvbSIsIm1lbnVQYWRkaW5nUmlnaHQiLCJ3cmFwcGVyU3R5bGUiLCJ6SW5kZXgiLCJiYWNrZ3JvdW5kIiwib25Db250ZXh0TWVudSIsIm9uS2V5RG93biIsIm9uQ29udGV4dE1lbnVQcmV2ZW50QnViYmxpbmciLCJjb2xsZWN0Q29udGV4dE1lbnVSZWN0IiwiY2hpbGRyZW4iLCJyZW5kZXIiLCJSZWFjdERPTSIsImNyZWF0ZVBvcnRhbCIsInRvUmlnaHRPZiIsImVsZW1lbnRSZWN0IiwicGFnZVhPZmZzZXQiLCJwYWdlWU9mZnNldCIsImFib3ZlTGVmdE9mIiwidlBhZGRpbmciLCJtZW51T3B0aW9ucyIsImJ1dHRvblJpZ2h0IiwiYnV0dG9uQm90dG9tIiwiYnV0dG9uVG9wIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiYWx3YXlzQWJvdmVMZWZ0T2YiLCJhbHdheXNBYm92ZVJpZ2h0T2YiLCJidXR0b25MZWZ0IiwidXNlQ29udGV4dE1lbnUiLCJidXR0b24iLCJpc09wZW4iLCJzZXRJc09wZW4iLCJvcGVuIiwiY2xvc2UiLCJMZWdhY3lDb250ZXh0TWVudSIsImNyZWF0ZU1lbnUiLCJFbGVtZW50Q2xhc3MiLCJhcmdzIiwidW5tb3VudENvbXBvbmVudEF0Tm9kZSIsImFwcGx5IiwibWVudSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUE0ZEE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWhlQTtBQUNBO0FBQ0E7QUFFQSxNQUFNQSx5QkFBeUIsR0FBRyw2QkFBbEM7O0FBRUEsU0FBU0Msb0JBQVQ7QUFBQTtBQUFnRDtBQUM1QyxNQUFJQyxTQUFTLEdBQUdDLFFBQVEsQ0FBQ0MsY0FBVCxDQUF3QkoseUJBQXhCLENBQWhCOztBQUVBLE1BQUksQ0FBQ0UsU0FBTCxFQUFnQjtBQUNaQSxJQUFBQSxTQUFTLEdBQUdDLFFBQVEsQ0FBQ0UsYUFBVCxDQUF1QixLQUF2QixDQUFaO0FBQ0FILElBQUFBLFNBQVMsQ0FBQ0ksRUFBVixHQUFlTix5QkFBZjtBQUNBRyxJQUFBQSxRQUFRLENBQUNJLElBQVQsQ0FBY0MsV0FBZCxDQUEwQk4sU0FBMUI7QUFDSDs7QUFFRCxTQUFPQSxTQUFQO0FBQ0g7O0FBRUQsTUFBTU8sb0JBQW9CLEdBQUcsSUFBSUMsR0FBSixDQUFRLENBQUMsVUFBRCxFQUFhLGtCQUFiLEVBQWlDLGVBQWpDLENBQVIsQ0FBN0I7SUFTWUMsVzs7O1dBQUFBLFc7QUFBQUEsRUFBQUEsVztBQUFBQSxFQUFBQSxXO0FBQUFBLEVBQUFBLFc7QUFBQUEsRUFBQUEsVztBQUFBQSxFQUFBQSxXO0dBQUFBLFcsMkJBQUFBLFc7O0FBcERaO0FBQ0E7QUFDQTtBQUNBO0FB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VCxNQUFBQSxLQUFLLENBQUNTLFVBQU4sQ0FBaUI0SCxLQUFqQixDQUF1QixJQUF2QixFQUE2QkYsSUFBN0I7QUFDSDtBQUNKLEdBTkQ7O0FBUUEsUUFBTUcsSUFBSSxnQkFBRyw2QkFBQyxpQkFBRCw2QkFDTHRJLEtBREs7QUFFVCxJQUFBLFVBQVUsRUFBRVMsVUFGSCxDQUVlO0FBRmY7QUFHVCxJQUFBLFlBQVksRUFBRUEsVUFITCxDQUdpQjs7QUFIakIsbUJBS1QsNkJBQUMsWUFBRCw2QkFBa0JULEtBQWxCO0FBQXlCLElBQUEsVUFBVSxFQUFFUztBQUFyQyxLQUxTLENBQWI7O0FBUUFnRyxvQkFBU0QsTUFBVCxDQUFnQjhCLElBQWhCLEVBQXNCckosb0JBQW9CLEVBQTFDOztBQUVBLFNBQU87QUFBQzhJLElBQUFBLEtBQUssRUFBRXRIO0FBQVIsR0FBUDtBQUNILEMsQ0FFRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Q1NTUHJvcGVydGllcywgUmVmT2JqZWN0LCB1c2VSZWYsIHVzZVN0YXRlfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQge1dyaXRlYWJsZX0gZnJvbSBcIi4uLy4uL0B0eXBlcy9jb21tb25cIjtcblxuLy8gU2hhbWVsZXNzbHkgcmlwcGVkIG9mZiBNb2RhbC5qcy4gIFRoZXJlJ3MgcHJvYmFibHkgYSBiZXR0ZXIgd2F5XG4vLyBvZiBkb2luZyByZXVzYWJsZSB3aWRnZXRzIGxpa2UgZGlhbG9nIGJveGVzICYgbWVudXMgd2hlcmUgd2UgZ28gYW5kXG4vLyBwYXNzIGluIGEgY3VzdG9tIGNvbnRyb2wgYXMgdGhlIGFjdHVhbCBib2R5LlxuXG5jb25zdCBDb250ZXh0dWFsTWVudUNvbnRhaW5lcklkID0gXCJteF9Db250ZXh0dWFsTWVudV9Db250YWluZXJcIjtcblxuZnVuY3Rpb24gZ2V0T3JDcmVhdGVDb250YWluZXIoKTogSFRNTERpdkVsZW1lbnQge1xuICAgIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChDb250ZXh0dWFsTWVudUNvbnRhaW5lcklkKSBhcyBIVE1MRGl2RWxlbWVudDtcblxuICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvbnRhaW5lci5pZCA9IENvbnRleHR1YWxNZW51Q29udGFpbmVySWQ7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xufVxuXG5jb25zdCBBUklBX01FTlVfSVRFTV9ST0xFUyA9IG5ldyBTZXQoW1wibWVudWl0ZW1cIiwgXCJtZW51aXRlbWNoZWNrYm94XCIsIFwibWVudWl0ZW1yYWRpb1wiXSk7XG5cbmludGVyZmFjZSBJUG9zaXRpb24ge1xuICAgIHRvcD86IG51bWJlcjtcbiAgICBib3R0b20/OiBudW1iZXI7XG4gICAgbGVmdD86IG51bWJlcjtcbiAgICByaWdodD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGVudW0gQ2hldnJvbkZhY2Uge1xuICAgIFRvcCA9IFwidG9wXCIsXG4gICAgQm90dG9tID0gXCJib3R0b21cIixcbiAgICBMZWZ0ID0gXCJsZWZ0XCIsXG4gICAgUmlnaHQgPSBcInJpZ2h0XCIsXG4gICAgTm9uZSA9IFwibm9uZVwiLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElQb3NpdGlvbiB7XG4gICAgbWVudVdpZHRoPzogbnVtYmVyO1xuICAgIG1lbnVIZWlnaHQ/OiBudW1iZXI7XG5cbiAgICBjaGV2cm9uT2Zmc2V0PzogbnVtYmVyO1xuICAgIGNoZXZyb25GYWNlPzogQ2hldnJvbkZhY2U7XG5cbiAgICBtZW51UGFkZGluZ1RvcD86IG51bWJlcjtcbiAgICBtZW51UGFkZGluZ0JvdHRvbT86IG51bWJlcjtcbiAgICBtZW51UGFkZGluZ0xlZnQ/OiBudW1iZXI7XG4gICAgbWVudVBhZGRpbmdSaWdodD86IG51bWJlcjtcblxuICAgIHpJbmRleD86IG51bWJlcjtcblxuICAgIC8vIElmIHRydWUsIGluc2VydCBhbiBpbnZpc2libGUgc2NyZWVuLXNpemVkIGVsZW1lbnQgYmVoaW5kIHRoZSBtZW51IHRoYXQgd2hlbiBjbGlja2VkIHdpbGwgY2xvc2UgaXQuXG4gICAgaGFzQmFja2dyb3VuZD86IGJvb2xlYW47XG4gICAgLy8gd2hldGhlciB0aGlzIGNvbnRleHQgbWVudSBzaG91bGQgYmUgZm9jdXMgbWFuYWdlZC4gSWYgZmFsc2UgaXQgbXVzdCBoYW5kbGUgaXRzZWxmXG4gICAgbWFuYWdlZD86IGJvb2xlYW47XG5cbiAgICAvLyBGdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gbWVudSBjbG9zZVxuICAgIG9uRmluaXNoZWQoKTtcbiAgICAvLyBvbiByZXNpemUgY2FsbGJhY2tcbiAgICB3aW5kb3dSZXNpemU/KCk7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbnRleHRNZW51RWxlbTogSFRNTERpdkVsZW1lbnQ7XG59XG5cbi8vIEdlbmVyaWMgQ29udGV4dE1lbnUgUG9ydGFsIHdyYXBwZXJcbi8vIGFsbCBvcHRpb25zIGluc2lkZSB0aGUgbWVudSBzaG91bGQgYmUgb2Ygcm9sZT1tZW51aXRlbS9tZW51aXRlbWNoZWNrYm94L21lbnVpdGVtcmFkaW9idXR0b24gYW5kIGhhdmUgdGFiSW5kZXg9ey0xfVxuLy8gdGhpcyB3aWxsIGFsbG93IHRoZSBDb250ZXh0TWVudSB0byBtYW5hZ2UgaXRzIG93biBmb2N1cyB1c2luZyBhcnJvdyBrZXlzIGFzIHBlciB0aGUgQVJJQSBndWlkZWxpbmVzLlxuZXhwb3J0IGNsYXNzIENvbnRleHRNZW51IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgaW5pdGlhbEZvY3VzOiBIVE1MRWxlbWVudDtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGhhc0JhY2tncm91bmQ6IHRydWUsXG4gICAgICAgIG1hbmFnZWQ6IHRydWUsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51RWxlbTogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBwZXJzaXN0IHdoYXQgaGFkIGZvY3VzIHdoZW4gd2UgZ290IGluaXRpYWxpemVkIHNvIHdlIGNhbiByZXR1cm4gaXQgYWZ0ZXJcbiAgICAgICAgdGhpcy5pbml0aWFsRm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyByZXR1cm4gZm9jdXMgdG8gdGhlIHRoaW5nIHdoaWNoIGhhZCBpdCBiZWZvcmUgdXNcbiAgICAgICAgdGhpcy5pbml0aWFsRm9jdXMuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbGxlY3RDb250ZXh0TWVudVJlY3QgPSAoZWxlbWVudCkgPT4ge1xuICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIHdoZW4gdW5tb3VudGluZywgc28gaWdub3JlXG4gICAgICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBmaXJzdCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignW3JvbGVePVwibWVudWl0ZW1cIl0nKTtcbiAgICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICAgICAgZmlyc3QgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1t0YWItaW5kZXhdJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICBmaXJzdC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZXh0TWVudUVsZW06IGVsZW1lbnQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaGVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLmNsaWVudFg7XG4gICAgICAgICAgICBjb25zdCB5ID0gZS5jbGllbnRZO1xuXG4gICAgICAgICAgICAvLyBYWFg6IFRoaXMgaXNuJ3QgcHJldHR5IGJ1dCB0aGUgb25seSB3YXkgdG8gYWxsb3cgb3BlbmluZyBhIGRpZmZlcmVudCBjb250ZXh0IG1lbnUgb24gcmlnaHQgY2xpY2sgd2hpbHN0XG4gICAgICAgICAgICAvLyBhIGNvbnRleHQgbWVudSBhbmQgaXRzIGNsaWNrLWd1YXJkIGFyZSB1cCB3aXRob3V0IGNvbXBsZXRlbHkgcmV3cml0aW5nIGhvdyB0aGUgY29udGV4dCBtZW51cyB3b3JrLlxuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG4gICAgICAgICAgICAgICAgY2xpY2tFdmVudC5pbml0TW91c2VFdmVudChcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRleHRtZW51JywgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAwLFxuICAgICAgICAgICAgICAgICAgICAwLCAwLCB4LCB5LCBmYWxzZSwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSkuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250ZXh0TWVudVByZXZlbnRCdWJibGluZyA9IChlKSA9PiB7XG4gICAgICAgIC8vIHN0b3AgcHJvcGFnYXRpb24gc28gdGhhdCBhbnkgY29udGV4dCBtZW51IGhhbmRsZXJzIGRvbid0IGxlYWsgb3V0IG9mIHRoaXMgY29udGV4dCBtZW51XG4gICAgICAgIC8vIGJ1dCBkbyBub3QgaW5oaWJpdCB0aGUgZGVmYXVsdCBicm93c2VyIG1lbnVcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9O1xuXG4gICAgLy8gUHJldmVudCBjbGlja3Mgb24gdGhlIGJhY2tncm91bmQgZnJvbSBnb2luZyB0aHJvdWdoIHRvIHRoZSBjb21wb25lbnQgd2hpY2ggb3BlbmVkIHRoZSBtZW51LlxuICAgIHByaXZhdGUgb25GaW5pc2hlZCA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25GaW5pc2hlZCkgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Nb3ZlRm9jdXMgPSAoZWxlbWVudDogRWxlbWVudCwgdXA6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgbGV0IGRlc2NlbmRpbmcgPSBmYWxzZTsgLy8gYXJlIHdlIGN1cnJlbnRseSBkZXNjZW5kaW5nIG9yIGFzY2VuZGluZyB0aHJvdWdoIHRoZSBET00gdHJlZT9cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IHVwID8gZWxlbWVudC5sYXN0RWxlbWVudENoaWxkIDogZWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgICAgIGNvbnN0IHNpYmxpbmcgPSB1cCA/IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZyA6IGVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuXG4gICAgICAgICAgICBpZiAoZGVzY2VuZGluZykge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBzaWJsaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBzaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICBkZXNjZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9Db250ZXh0dWFsTWVudVwiKSkgeyAvLyB3ZSBoaXQgdGhlIHRvcFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gdXAgPyBlbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQgOiBlbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICAgICAgICAgICAgICBkZXNjZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKGVsZW1lbnQgJiYgIUFSSUFfTUVOVV9JVEVNX1JPTEVTLmhhcyhlbGVtZW50LmdldEF0dHJpYnV0ZShcInJvbGVcIikpKTtcblxuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgKGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1vdmVGb2N1c0hvbWVFbmQgPSAoZWxlbWVudDogRWxlbWVudCwgdXA6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlXj1cIm1lbnVpdGVtXCJdJyk7XG4gICAgICAgIGlmICghcmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW3RhYi1pbmRleF0nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHVwKSB7XG4gICAgICAgICAgICAgICAgKHJlc3VsdHNbMF0gYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIChyZXN1bHRzW3Jlc3VsdHMubGVuZ3RoIC0gMV0gYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1hbmFnZWQpIHtcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09IEtleS5FU0NBUEUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhhbmRsZWQgPSB0cnVlO1xuXG4gICAgICAgIHN3aXRjaCAoZXYua2V5KSB7XG4gICAgICAgICAgICBjYXNlIEtleS5UQUI6XG4gICAgICAgICAgICBjYXNlIEtleS5FU0NBUEU6XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19MRUZUOiAvLyBjbG9zZSBvbiBsZWZ0IGFuZCByaWdodCBhcnJvd3MgdG9vIGZvciB3aGVuIGl0IGlzIGEgY29udGV4dCBtZW51IG9uIGEgPFRvb2xiYXIgLz5cbiAgICAgICAgICAgIGNhc2UgS2V5LkFSUk9XX1JJR0hUOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfVVA6XG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vdmVGb2N1cyhldi50YXJnZXQgYXMgRWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19ET1dOOlxuICAgICAgICAgICAgICAgIHRoaXMub25Nb3ZlRm9jdXMoZXYudGFyZ2V0IGFzIEVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5LkhPTUU6XG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vdmVGb2N1c0hvbWVFbmQodGhpcy5zdGF0ZS5jb250ZXh0TWVudUVsZW0sIHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuRU5EOlxuICAgICAgICAgICAgICAgIHRoaXMub25Nb3ZlRm9jdXNIb21lRW5kKHRoaXMuc3RhdGUuY29udGV4dE1lbnVFbGVtLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICAvLyBjb25zdW1lIGFsbCBvdGhlciBrZXlzIGluIGNvbnRleHQgbWVudVxuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb3RlY3RlZCByZW5kZXJNZW51KGhhc0JhY2tncm91bmQgPSB0aGlzLnByb3BzLmhhc0JhY2tncm91bmQpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb246IFBhcnRpYWw8V3JpdGVhYmxlPERPTVJlY3Q+PiA9IHt9O1xuICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgaWYgKHByb3BzLnRvcCkge1xuICAgICAgICAgICAgcG9zaXRpb24udG9wID0gcHJvcHMudG9wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24uYm90dG9tID0gcHJvcHMuYm90dG9tO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNoZXZyb25GYWNlOiBDaGV2cm9uRmFjZTtcbiAgICAgICAgaWYgKHByb3BzLmxlZnQpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uLmxlZnQgPSBwcm9wcy5sZWZ0O1xuICAgICAgICAgICAgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5MZWZ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24ucmlnaHQgPSBwcm9wcy5yaWdodDtcbiAgICAgICAgICAgIGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuUmlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb250ZXh0TWVudVJlY3QgPSB0aGlzLnN0YXRlLmNvbnRleHRNZW51RWxlbSA/IHRoaXMuc3RhdGUuY29udGV4dE1lbnVFbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIDogbnVsbDtcblxuICAgICAgICBjb25zdCBjaGV2cm9uT2Zmc2V0OiBDU1NQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmIChwcm9wcy5jaGV2cm9uRmFjZSkge1xuICAgICAgICAgICAgY2hldnJvbkZhY2UgPSBwcm9wcy5jaGV2cm9uRmFjZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYXNDaGV2cm9uID0gY2hldnJvbkZhY2UgJiYgY2hldnJvbkZhY2UgIT09IENoZXZyb25GYWNlLk5vbmU7XG5cbiAgICAgICAgaWYgKGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5Ub3AgfHwgY2hldnJvbkZhY2UgPT09IENoZXZyb25GYWNlLkJvdHRvbSkge1xuICAgICAgICAgICAgY2hldnJvbk9mZnNldC5sZWZ0ID0gcHJvcHMuY2hldnJvbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbi50b3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gcG9zaXRpb24udG9wO1xuXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBubyBhZGp1c3RtZW50IGlzIG1hZGVcbiAgICAgICAgICAgIGxldCBhZGp1c3RlZCA9IHRhcmdldDtcblxuICAgICAgICAgICAgLy8gSWYgd2Uga25vdyB0aGUgZGltZW5zaW9ucyBvZiB0aGUgY29udGV4dCBtZW51LCBhZGp1c3QgaXRzIHBvc2l0aW9uXG4gICAgICAgICAgICAvLyBzdWNoIHRoYXQgaXQgZG9lcyBub3QgbGVhdmUgdGhlIChwYWRkZWQpIHdpbmRvdy5cbiAgICAgICAgICAgIGlmIChjb250ZXh0TWVudVJlY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYWRkaW5nID0gMTA7XG4gICAgICAgICAgICAgICAgYWRqdXN0ZWQgPSBNYXRoLm1pbihwb3NpdGlvbi50b3AsIGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC0gY29udGV4dE1lbnVSZWN0LmhlaWdodCArIHBhZGRpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NpdGlvbi50b3AgPSBhZGp1c3RlZDtcbiAgICAgICAgICAgIGNoZXZyb25PZmZzZXQudG9wID0gTWF0aC5tYXgocHJvcHMuY2hldnJvbk9mZnNldCwgcHJvcHMuY2hldnJvbk9mZnNldCArIHRhcmdldCAtIGFkanVzdGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjaGV2cm9uO1xuICAgICAgICBpZiAoaGFzQ2hldnJvbikge1xuICAgICAgICAgICAgY2hldnJvbiA9IDxkaXYgc3R5bGU9e2NoZXZyb25PZmZzZXR9IGNsYXNzTmFtZT17XCJteF9Db250ZXh0dWFsTWVudV9jaGV2cm9uX1wiICsgY2hldnJvbkZhY2V9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVudUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudSc6IHRydWUsXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfbGVmdCc6ICFoYXNDaGV2cm9uICYmIHBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfcmlnaHQnOiAhaGFzQ2hldnJvbiAmJiBwb3NpdGlvbi5yaWdodCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV90b3AnOiAhaGFzQ2hldnJvbiAmJiBwb3NpdGlvbi50b3AsXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfYm90dG9tJzogIWhhc0NoZXZyb24gJiYgcG9zaXRpb24uYm90dG9tLFxuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51X3dpdGhDaGV2cm9uX2xlZnQnOiBjaGV2cm9uRmFjZSA9PT0gQ2hldnJvbkZhY2UuTGVmdCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV93aXRoQ2hldnJvbl9yaWdodCc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5SaWdodCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV93aXRoQ2hldnJvbl90b3AnOiBjaGV2cm9uRmFjZSA9PT0gQ2hldnJvbkZhY2UuVG9wLFxuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51X3dpdGhDaGV2cm9uX2JvdHRvbSc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5Cb3R0b20sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG1lbnVTdHlsZTogQ1NTUHJvcGVydGllcyA9IHt9O1xuICAgICAgICBpZiAocHJvcHMubWVudVdpZHRoKSB7XG4gICAgICAgICAgICBtZW51U3R5bGUud2lkdGggPSBwcm9wcy5tZW51V2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvcHMubWVudUhlaWdodCkge1xuICAgICAgICAgICAgbWVudVN0eWxlLmhlaWdodCA9IHByb3BzLm1lbnVIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzTmFOKE51bWJlcihwcm9wcy5tZW51UGFkZGluZ1RvcCkpKSB7XG4gICAgICAgICAgICBtZW51U3R5bGVbXCJwYWRkaW5nVG9wXCJdID0gcHJvcHMubWVudVBhZGRpbmdUb3A7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc05hTihOdW1iZXIocHJvcHMubWVudVBhZGRpbmdMZWZ0KSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInBhZGRpbmdMZWZ0XCJdID0gcHJvcHMubWVudVBhZGRpbmdMZWZ0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNOYU4oTnVtYmVyKHByb3BzLm1lbnVQYWRkaW5nQm90dG9tKSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInBhZGRpbmdCb3R0b21cIl0gPSBwcm9wcy5tZW51UGFkZGluZ0JvdHRvbTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTmFOKE51bWJlcihwcm9wcy5tZW51UGFkZGluZ1JpZ2h0KSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInBhZGRpbmdSaWdodFwiXSA9IHByb3BzLm1lbnVQYWRkaW5nUmlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3cmFwcGVyU3R5bGUgPSB7fTtcbiAgICAgICAgaWYgKCFpc05hTihOdW1iZXIocHJvcHMuekluZGV4KSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInpJbmRleFwiXSA9IHByb3BzLnpJbmRleCArIDE7XG4gICAgICAgICAgICB3cmFwcGVyU3R5bGVbXCJ6SW5kZXhcIl0gPSBwcm9wcy56SW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYmFja2dyb3VuZDtcbiAgICAgICAgaWYgKGhhc0JhY2tncm91bmQpIHtcbiAgICAgICAgICAgIGJhY2tncm91bmQgPSAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Db250ZXh0dWFsTWVudV9iYWNrZ3JvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3dyYXBwZXJTdHlsZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0NvbnRleHR1YWxNZW51X3dyYXBwZXJcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7Li4ucG9zaXRpb24sIC4uLndyYXBwZXJTdHlsZX19XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnVQcmV2ZW50QnViYmxpbmd9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21lbnVDbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17bWVudVN0eWxlfVxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuY29sbGVjdENvbnRleHRNZW51UmVjdH1cbiAgICAgICAgICAgICAgICAgICAgcm9sZT17dGhpcy5wcm9wcy5tYW5hZ2VkID8gXCJtZW51XCIgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IGNoZXZyb24gfVxuICAgICAgICAgICAgICAgICAgICB7IHByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IGJhY2tncm91bmQgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6IFJlYWN0LlJlYWN0Q2hpbGQge1xuICAgICAgICByZXR1cm4gUmVhY3RET00uY3JlYXRlUG9ydGFsKHRoaXMucmVuZGVyTWVudSgpLCBnZXRPckNyZWF0ZUNvbnRhaW5lcigpKTtcbiAgICB9XG59XG5cbi8vIFBsYWNlbWVudCBtZXRob2QgZm9yIDxDb250ZXh0TWVudSAvPiB0byBwb3NpdGlvbiBjb250ZXh0IG1lbnUgdG8gcmlnaHQgb2YgZWxlbWVudFJlY3Qgd2l0aCBjaGV2cm9uT2Zmc2V0XG5leHBvcnQgY29uc3QgdG9SaWdodE9mID0gKGVsZW1lbnRSZWN0OiBET01SZWN0LCBjaGV2cm9uT2Zmc2V0ID0gMTIpID0+IHtcbiAgICBjb25zdCBsZWZ0ID0gZWxlbWVudFJlY3QucmlnaHQgKyB3aW5kb3cucGFnZVhPZmZzZXQgKyAzO1xuICAgIGxldCB0b3AgPSBlbGVtZW50UmVjdC50b3AgKyAoZWxlbWVudFJlY3QuaGVpZ2h0IC8gMikgKyB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgdG9wIC09IGNoZXZyb25PZmZzZXQgKyA4OyAvLyB3aGVyZSA4IGlzIGhhbGYgdGhlIGhlaWdodCBvZiB0aGUgY2hldnJvblxuICAgIHJldHVybiB7bGVmdCwgdG9wLCBjaGV2cm9uT2Zmc2V0fTtcbn07XG5cbi8vIFBsYWNlbWVudCBtZXRob2QgZm9yIDxDb250ZXh0TWVudSAvPiB0byBwb3NpdGlvbiBjb250ZXh0IG1lbnUgcmlnaHQtYWxpZ25lZCBhbmQgZmxvd2luZyB0byB0aGUgbGVmdCBvZiBlbGVtZW50UmVjdCxcbi8vIGFuZCBlaXRoZXIgYWJvdmUgb3IgYmVsb3c6IHdoZXJldmVyIHRoZXJlIGlzIG1vcmUgc3BhY2UgKG1heWJlIHRoaXMgc2hvdWxkIGJlIGFib3ZlT3JCZWxvd0xlZnRPZj8pXG5leHBvcnQgY29uc3QgYWJvdmVMZWZ0T2YgPSAoZWxlbWVudFJlY3Q6IERPTVJlY3QsIGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuTm9uZSwgdlBhZGRpbmcgPSAwKSA9PiB7XG4gICAgY29uc3QgbWVudU9wdGlvbnM6IElQb3NpdGlvbiAmIHsgY2hldnJvbkZhY2U6IENoZXZyb25GYWNlIH0gPSB7IGNoZXZyb25GYWNlIH07XG5cbiAgICBjb25zdCBidXR0b25SaWdodCA9IGVsZW1lbnRSZWN0LnJpZ2h0ICsgd2luZG93LnBhZ2VYT2Zmc2V0O1xuICAgIGNvbnN0IGJ1dHRvbkJvdHRvbSA9IGVsZW1lbnRSZWN0LmJvdHRvbSArIHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBjb25zdCBidXR0b25Ub3AgPSBlbGVtZW50UmVjdC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgLy8gQWxpZ24gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIG1lbnUgdG8gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGJ1dHRvblxuICAgIG1lbnVPcHRpb25zLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLSBidXR0b25SaWdodDtcbiAgICAvLyBBbGlnbiB0aGUgbWVudSB2ZXJ0aWNhbGx5IG9uIHdoaWNoZXZlciBzaWRlIG9mIHRoZSBidXR0b24gaGFzIG1vcmUgc3BhY2UgYXZhaWxhYmxlLlxuICAgIGlmIChidXR0b25Cb3R0b20gPCB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyKSB7XG4gICAgICAgIG1lbnVPcHRpb25zLnRvcCA9IGJ1dHRvbkJvdHRvbSArIHZQYWRkaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbnVPcHRpb25zLmJvdHRvbSA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgLSBidXR0b25Ub3ApICsgdlBhZGRpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbnVPcHRpb25zO1xufTtcblxuLy8gUGxhY2VtZW50IG1ldGhvZCBmb3IgPENvbnRleHRNZW51IC8+IHRvIHBvc2l0aW9uIGNvbnRleHQgbWVudSByaWdodC1hbGlnbmVkIGFuZCBmbG93aW5nIHRvIHRoZSBsZWZ0IG9mIGVsZW1lbnRSZWN0XG4vLyBhbmQgYWx3YXlzIGFib3ZlIGVsZW1lbnRSZWN0XG5leHBvcnQgY29uc3QgYWx3YXlzQWJvdmVMZWZ0T2YgPSAoZWxlbWVudFJlY3Q6IERPTVJlY3QsIGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuTm9uZSwgdlBhZGRpbmcgPSAwKSA9PiB7XG4gICAgY29uc3QgbWVudU9wdGlvbnM6IElQb3NpdGlvbiAmIHsgY2hldnJvbkZhY2U6IENoZXZyb25GYWNlIH0gPSB7IGNoZXZyb25GYWNlIH07XG5cbiAgICBjb25zdCBidXR0b25SaWdodCA9IGVsZW1lbnRSZWN0LnJpZ2h0ICsgd2luZG93LnBhZ2VYT2Zmc2V0O1xuICAgIGNvbnN0IGJ1dHRvbkJvdHRvbSA9IGVsZW1lbnRSZWN0LmJvdHRvbSArIHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBjb25zdCBidXR0b25Ub3AgPSBlbGVtZW50UmVjdC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgLy8gQWxpZ24gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIG1lbnUgdG8gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGJ1dHRvblxuICAgIG1lbnVPcHRpb25zLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLSBidXR0b25SaWdodDtcbiAgICAvLyBBbGlnbiB0aGUgbWVudSB2ZXJ0aWNhbGx5IG9uIHdoaWNoZXZlciBzaWRlIG9mIHRoZSBidXR0b24gaGFzIG1vcmUgc3BhY2UgYXZhaWxhYmxlLlxuICAgIGlmIChidXR0b25Cb3R0b20gPCB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyKSB7XG4gICAgICAgIG1lbnVPcHRpb25zLnRvcCA9IGJ1dHRvbkJvdHRvbSArIHZQYWRkaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbnVPcHRpb25zLmJvdHRvbSA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgLSBidXR0b25Ub3ApICsgdlBhZGRpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbnVPcHRpb25zO1xufTtcblxuLy8gUGxhY2VtZW50IG1ldGhvZCBmb3IgPENvbnRleHRNZW51IC8+IHRvIHBvc2l0aW9uIGNvbnRleHQgbWVudSByaWdodC1hbGlnbmVkIGFuZCBmbG93aW5nIHRvIHRoZSByaWdodCBvZiBlbGVtZW50UmVjdFxuLy8gYW5kIGFsd2F5cyBhYm92ZSBlbGVtZW50UmVjdFxuZXhwb3J0IGNvbnN0IGFsd2F5c0Fib3ZlUmlnaHRPZiA9IChlbGVtZW50UmVjdDogRE9NUmVjdCwgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5Ob25lLCB2UGFkZGluZyA9IDApID0+IHtcbiAgICBjb25zdCBtZW51T3B0aW9uczogSVBvc2l0aW9uICYgeyBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2UgfSA9IHsgY2hldnJvbkZhY2UgfTtcblxuICAgIGNvbnN0IGJ1dHRvbkxlZnQgPSBlbGVtZW50UmVjdC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0O1xuICAgIGNvbnN0IGJ1dHRvblRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICAvLyBBbGlnbiB0aGUgbGVmdCBlZGdlIG9mIHRoZSBtZW51IHRvIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIGJ1dHRvblxuICAgIG1lbnVPcHRpb25zLmxlZnQgPSBidXR0b25MZWZ0O1xuICAgIC8vIEFsaWduIHRoZSBtZW51IHZlcnRpY2FsbHkgYWJvdmUgdGhlIG1lbnVcbiAgICBtZW51T3B0aW9ucy5ib3R0b20gPSAod2luZG93LmlubmVySGVpZ2h0IC0gYnV0dG9uVG9wKSArIHZQYWRkaW5nO1xuXG4gICAgcmV0dXJuIG1lbnVPcHRpb25zO1xufTtcblxudHlwZSBDb250ZXh0TWVudVR1cGxlPFQ+ID0gW2Jvb2xlYW4sIFJlZk9iamVjdDxUPiwgKCkgPT4gdm9pZCwgKCkgPT4gdm9pZCwgKHZhbDogYm9vbGVhbikgPT4gdm9pZF07XG5leHBvcnQgY29uc3QgdXNlQ29udGV4dE1lbnUgPSA8VCBleHRlbmRzIGFueSA9IEhUTUxFbGVtZW50PigpOiBDb250ZXh0TWVudVR1cGxlPFQ+ID0+IHtcbiAgICBjb25zdCBidXR0b24gPSB1c2VSZWY8VD4obnVsbCk7XG4gICAgY29uc3QgW2lzT3Blbiwgc2V0SXNPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBvcGVuID0gKCkgPT4ge1xuICAgICAgICBzZXRJc09wZW4odHJ1ZSk7XG4gICAgfTtcbiAgICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICAgICAgc2V0SXNPcGVuKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFtpc09wZW4sIGJ1dHRvbiwgb3BlbiwgY2xvc2UsIHNldElzT3Blbl07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZWdhY3lDb250ZXh0TWVudSBleHRlbmRzIENvbnRleHRNZW51IHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlck1lbnUoZmFsc2UpO1xuICAgIH1cbn1cblxuLy8gWFhYOiBEZXByZWNhdGVkLCB1c2VkIG9ubHkgZm9yIGR5bmFtaWMgVG9vbHRpcHMuIEF2b2lkIHVzaW5nIGF0IGFsbCBjb3N0cy5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZW51KEVsZW1lbnRDbGFzcywgcHJvcHMpIHtcbiAgICBjb25zdCBvbkZpbmlzaGVkID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGdldE9yQ3JlYXRlQ29udGFpbmVyKCkpO1xuXG4gICAgICAgIGlmIChwcm9wcyAmJiBwcm9wcy5vbkZpbmlzaGVkKSB7XG4gICAgICAgICAgICBwcm9wcy5vbkZpbmlzaGVkLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IG1lbnUgPSA8TGVnYWN5Q29udGV4dE1lbnVcbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0L2pzeC1uby1iaW5kXG4gICAgICAgIHdpbmRvd1Jlc2l6ZT17b25GaW5pc2hlZH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC9qc3gtbm8tYmluZFxuICAgID5cbiAgICAgICAgPEVsZW1lbnRDbGFzcyB7Li4ucHJvcHN9IG9uRmluaXNoZWQ9e29uRmluaXNoZWR9IC8+XG4gICAgPC9MZWdhY3lDb250ZXh0TWVudT47XG5cbiAgICBSZWFjdERPTS5yZW5kZXIobWVudSwgZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG5cbiAgICByZXR1cm4ge2Nsb3NlOiBvbkZpbmlzaGVkfTtcbn1cblxuLy8gcmUtZXhwb3J0IHRoZSBzZW1hbnRpYyBoZWxwZXIgY29tcG9uZW50cyBmb3Igc2ltcGxpY2l0eVxuZXhwb3J0IHtDb250ZXh0TWVudUJ1dHRvbn0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L0NvbnRleHRNZW51QnV0dG9uXCI7XG5leHBvcnQge0NvbnRleHRNZW51VG9vbHRpcEJ1dHRvbn0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L0NvbnRleHRNZW51VG9vbHRpcEJ1dHRvblwiO1xuZXhwb3J0IHtNZW51R3JvdXB9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51R3JvdXBcIjtcbmV4cG9ydCB7TWVudUl0ZW19IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbVwiO1xuZXhwb3J0IHtNZW51SXRlbUNoZWNrYm94fSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvTWVudUl0ZW1DaGVja2JveFwiO1xuZXhwb3J0IHtNZW51SXRlbVJhZGlvfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvTWVudUl0ZW1SYWRpb1wiO1xuZXhwb3J0IHtTdHlsZWRNZW51SXRlbUNoZWNrYm94fSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvU3R5bGVkTWVudUl0ZW1DaGVja2JveFwiO1xuZXhwb3J0IHtTdHlsZWRNZW51SXRlbVJhZGlvfSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvU3R5bGVkTWVudUl0ZW1SYWRpb1wiO1xuIl19