"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../utils/replaceableComponent");

var _ContextMenuButton = require("../../accessibility/context_menu/ContextMenuButton");

var _ContextMenuTooltipButton = require("../../accessibility/context_menu/ContextMenuTooltipButton");

var _MenuGroup = require("../../accessibility/context_menu/MenuGroup");

var _MenuItem = require("../../accessibility/context_menu/MenuItem");

var _MenuItemCheckbox = require("../../accessibility/context_menu/MenuItemCheckbox");

var _MenuItemRadio = require("../../accessibility/context_menu/MenuItemRadio");

var _StyledMenuItemCheckbox = require("../../accessibility/context_menu/StyledMenuItemCheckbox");

var _StyledMenuItemRadio = require("../../accessibility/context_menu/StyledMenuItemRadio");

var _dec, _class, _class2, _temp, _dec2, _class3;

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
    wrapperClassName?: string;

    // Function to be called on menu close
    onFinished();
    // on resize callback
    windowResize?();
}*/


// Generic ContextMenu Portal wrapper
// all options inside the menu should be of role=menuitem/menuitemcheckbox/menuitemradiobutton and have tabIndex={-1}
// this will allow the ContextMenu to manage its own focus using arrow keys as per the ARIA guidelines.
let ContextMenu = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.ContextMenu"), _dec(_class = (_temp = _class2 = class ContextMenu extends _react.default.PureComponent
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
        adjusted = Math.min(position.top, document.body.clientHeight - contextMenuRect.height - padding);
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
      className: (0, _classnames.default)("mx_ContextualMenu_wrapper", this.props.wrapperClassName),
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

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  hasBackground: true,
  managed: true
}), _temp)) || _class); // Placement method for <ContextMenu /> to position context menu to right of elementRect with chevronOffset

exports.ContextMenu = ContextMenu;

const toRightOf = (elementRect
/*: Pick<DOMRect, "right" | "top" | "height">*/
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
let LegacyContextMenu = (_dec2 = (0, _replaceableComponent.replaceableComponent)("structures.LegacyContextMenu"), _dec2(_class3 = class LegacyContextMenu extends ContextMenu {
  render() {
    return this.renderMenu(false);
  }

}) || _class3);
exports.default = LegacyContextMenu;

// XXX: Deprecated, used only for dynamic Tooltips. Avoid using at all costs.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvQ29udGV4dE1lbnUudHN4Il0sIm5hbWVzIjpbIkNvbnRleHR1YWxNZW51Q29udGFpbmVySWQiLCJnZXRPckNyZWF0ZUNvbnRhaW5lciIsImNvbnRhaW5lciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjcmVhdGVFbGVtZW50IiwiaWQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJBUklBX01FTlVfSVRFTV9ST0xFUyIsIlNldCIsIkNoZXZyb25GYWNlIiwiQ29udGV4dE1lbnUiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImVsZW1lbnQiLCJmaXJzdCIsInF1ZXJ5U2VsZWN0b3IiLCJmb2N1cyIsInNldFN0YXRlIiwiY29udGV4dE1lbnVFbGVtIiwiZSIsIm9uRmluaXNoZWQiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIngiLCJjbGllbnRYIiwieSIsImNsaWVudFkiLCJzZXRJbW1lZGlhdGUiLCJjbGlja0V2ZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0TW91c2VFdmVudCIsIndpbmRvdyIsImVsZW1lbnRGcm9tUG9pbnQiLCJkaXNwYXRjaEV2ZW50IiwiZXYiLCJ1cCIsImRlc2NlbmRpbmciLCJjaGlsZCIsImxhc3RFbGVtZW50Q2hpbGQiLCJmaXJzdEVsZW1lbnRDaGlsZCIsInNpYmxpbmciLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwicGFyZW50RWxlbWVudCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaGFzIiwiZ2V0QXR0cmlidXRlIiwicmVzdWx0cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsZW5ndGgiLCJtYW5hZ2VkIiwia2V5IiwiS2V5IiwiRVNDQVBFIiwiaGFuZGxlZCIsIlRBQiIsIkFSUk9XX0xFRlQiLCJBUlJPV19SSUdIVCIsIkFSUk9XX1VQIiwib25Nb3ZlRm9jdXMiLCJ0YXJnZXQiLCJBUlJPV19ET1dOIiwiSE9NRSIsIm9uTW92ZUZvY3VzSG9tZUVuZCIsInN0YXRlIiwiRU5EIiwiaW5pdGlhbEZvY3VzIiwiYWN0aXZlRWxlbWVudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVuZGVyTWVudSIsImhhc0JhY2tncm91bmQiLCJwb3NpdGlvbiIsInRvcCIsImJvdHRvbSIsImNoZXZyb25GYWNlIiwibGVmdCIsIkxlZnQiLCJyaWdodCIsIlJpZ2h0IiwiY29udGV4dE1lbnVSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2hldnJvbk9mZnNldCIsImhhc0NoZXZyb24iLCJOb25lIiwiVG9wIiwiQm90dG9tIiwidW5kZWZpbmVkIiwiYWRqdXN0ZWQiLCJwYWRkaW5nIiwiTWF0aCIsIm1pbiIsImNsaWVudEhlaWdodCIsImhlaWdodCIsIm1heCIsImNoZXZyb24iLCJtZW51Q2xhc3NlcyIsIm1lbnVTdHlsZSIsIm1lbnVXaWR0aCIsIndpZHRoIiwibWVudUhlaWdodCIsImlzTmFOIiwiTnVtYmVyIiwibWVudVBhZGRpbmdUb3AiLCJtZW51UGFkZGluZ0xlZnQiLCJtZW51UGFkZGluZ0JvdHRvbSIsIm1lbnVQYWRkaW5nUmlnaHQiLCJ3cmFwcGVyU3R5bGUiLCJ6SW5kZXgiLCJiYWNrZ3JvdW5kIiwib25Db250ZXh0TWVudSIsIndyYXBwZXJDbGFzc05hbWUiLCJvbktleURvd24iLCJvbkNvbnRleHRNZW51UHJldmVudEJ1YmJsaW5nIiwiY29sbGVjdENvbnRleHRNZW51UmVjdCIsImNoaWxkcmVuIiwicmVuZGVyIiwiUmVhY3RET00iLCJjcmVhdGVQb3J0YWwiLCJ0b1JpZ2h0T2YiLCJlbGVtZW50UmVjdCIsInBhZ2VYT2Zmc2V0IiwicGFnZVlPZmZzZXQiLCJhYm92ZUxlZnRPZiIsInZQYWRkaW5nIiwibWVudU9wdGlvbnMiLCJidXR0b25SaWdodCIsImJ1dHRvbkJvdHRvbSIsImJ1dHRvblRvcCIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImFsd2F5c0Fib3ZlTGVmdE9mIiwiYWx3YXlzQWJvdmVSaWdodE9mIiwiYnV0dG9uTGVmdCIsInVzZUNvbnRleHRNZW51IiwiYnV0dG9uIiwiaXNPcGVuIiwic2V0SXNPcGVuIiwib3BlbiIsImNsb3NlIiwiTGVnYWN5Q29udGV4dE1lbnUiLCJjcmVhdGVNZW51IiwiRWxlbWVudENsYXNzIiwiYXJncyIsInVubW91bnRDb21wb25lbnRBdE5vZGUiLCJhcHBseSIsIm1lbnUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBOGRBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQW5lQTtBQUNBO0FBQ0E7QUFFQSxNQUFNQSx5QkFBeUIsR0FBRyw2QkFBbEM7O0FBRUEsU0FBU0Msb0JBQVQ7QUFBQTtBQUFnRDtBQUM1QyxNQUFJQyxTQUFTLEdBQUdDLFFBQVEsQ0FBQ0MsY0FBVCxDQUF3QkoseUJBQXhCLENBQWhCOztBQUVBLE1BQUksQ0FBQ0UsU0FBTCxFQUFnQjtBQUNaQSxJQUFBQSxTQUFTLEdBQUdDLFFBQVEsQ0FBQ0UsYUFBVCxDQUF1QixLQUF2QixDQUFaO0FBQ0FILElBQUFBLFNBQVMsQ0FBQ0ksRUFBVixHQUFlTix5QkFBZjtBQUNBRyxJQUFBQSxRQUFRLENBQUNJLElBQVQsQ0FBY0MsV0FBZCxDQUEwQk4sU0FBMUI7QUFDSDs7QUFFRCxTQUFPQSxTQUFQO0FBQ0g7O0FBRUQsTUFBTU8sb0JBQW9CLEdBQUcsSUFBSUMsR0FBSixDQUFRLENBQUMsVUFBRCxFQUFhLGtCQUFiLEVBQWlDLGVBQWpDLENBQVIsQ0FBN0I7SUFTWUMsVzs7O1dBQUFBLFc7QUFBQUEsRUFBQUEsVztBQUFBQSxFQUFBQSxXO0FBQUFBLEVBQUFBLFc7QUFBQUEsRUFBQUEsVztBQUFBQSxFQUFBQSxXO0dBQUFBLFcsMkJBQUFB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QVUsR0FBRyxVQUFTLEdBQUcySCxJQUFaLEVBQWtCO0FBQ2pDMUIsc0JBQVMyQixzQkFBVCxDQUFnQ3BKLG9CQUFvQixFQUFwRDs7QUFFQSxRQUFJZSxLQUFLLElBQUlBLEtBQUssQ0FBQ1MsVUFBbkIsRUFBK0I7QUFDM0JULE1BQUFBLEtBQUssQ0FBQ1MsVUFBTixDQUFpQjZILEtBQWpCLENBQXVCLElBQXZCLEVBQTZCRixJQUE3QjtBQUNIO0FBQ0osR0FORDs7QUFRQSxRQUFNRyxJQUFJLGdCQUFHLDZCQUFDLGlCQUFELDZCQUNMdkksS0FESztBQUVULElBQUEsVUFBVSxFQUFFUyxVQUZILENBRWU7QUFGZjtBQUdULElBQUEsWUFBWSxFQUFFQSxVQUhMLENBR2lCOztBQUhqQixtQkFLVCw2QkFBQyxZQUFELDZCQUFrQlQsS0FBbEI7QUFBeUIsSUFBQSxVQUFVLEVBQUVTO0FBQXJDLEtBTFMsQ0FBYjs7QUFRQWlHLG9CQUFTRCxNQUFULENBQWdCOEIsSUFBaEIsRUFBc0J0SixvQkFBb0IsRUFBMUM7O0FBRUEsU0FBTztBQUFDK0ksSUFBQUEsS0FBSyxFQUFFdkg7QUFBUixHQUFQO0FBQ0gsQyxDQUVEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtDU1NQcm9wZXJ0aWVzLCBSZWZPYmplY3QsIHVzZVJlZiwgdXNlU3RhdGV9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gXCJyZWFjdC1kb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7V3JpdGVhYmxlfSBmcm9tIFwiLi4vLi4vQHR5cGVzL2NvbW1vblwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8vIFNoYW1lbGVzc2x5IHJpcHBlZCBvZmYgTW9kYWwuanMuICBUaGVyZSdzIHByb2JhYmx5IGEgYmV0dGVyIHdheVxuLy8gb2YgZG9pbmcgcmV1c2FibGUgd2lkZ2V0cyBsaWtlIGRpYWxvZyBib3hlcyAmIG1lbnVzIHdoZXJlIHdlIGdvIGFuZFxuLy8gcGFzcyBpbiBhIGN1c3RvbSBjb250cm9sIGFzIHRoZSBhY3R1YWwgYm9keS5cblxuY29uc3QgQ29udGV4dHVhbE1lbnVDb250YWluZXJJZCA9IFwibXhfQ29udGV4dHVhbE1lbnVfQ29udGFpbmVyXCI7XG5cbmZ1bmN0aW9uIGdldE9yQ3JlYXRlQ29udGFpbmVyKCk6IEhUTUxEaXZFbGVtZW50IHtcbiAgICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoQ29udGV4dHVhbE1lbnVDb250YWluZXJJZCkgYXMgSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb250YWluZXIuaWQgPSBDb250ZXh0dWFsTWVudUNvbnRhaW5lcklkO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbn1cblxuY29uc3QgQVJJQV9NRU5VX0lURU1fUk9MRVMgPSBuZXcgU2V0KFtcIm1lbnVpdGVtXCIsIFwibWVudWl0ZW1jaGVja2JveFwiLCBcIm1lbnVpdGVtcmFkaW9cIl0pO1xuXG5pbnRlcmZhY2UgSVBvc2l0aW9uIHtcbiAgICB0b3A/OiBudW1iZXI7XG4gICAgYm90dG9tPzogbnVtYmVyO1xuICAgIGxlZnQ/OiBudW1iZXI7XG4gICAgcmlnaHQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBlbnVtIENoZXZyb25GYWNlIHtcbiAgICBUb3AgPSBcInRvcFwiLFxuICAgIEJvdHRvbSA9IFwiYm90dG9tXCIsXG4gICAgTGVmdCA9IFwibGVmdFwiLFxuICAgIFJpZ2h0ID0gXCJyaWdodFwiLFxuICAgIE5vbmUgPSBcIm5vbmVcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJUG9zaXRpb24ge1xuICAgIG1lbnVXaWR0aD86IG51bWJlcjtcbiAgICBtZW51SGVpZ2h0PzogbnVtYmVyO1xuXG4gICAgY2hldnJvbk9mZnNldD86IG51bWJlcjtcbiAgICBjaGV2cm9uRmFjZT86IENoZXZyb25GYWNlO1xuXG4gICAgbWVudVBhZGRpbmdUb3A/OiBudW1iZXI7XG4gICAgbWVudVBhZGRpbmdCb3R0b20/OiBudW1iZXI7XG4gICAgbWVudVBhZGRpbmdMZWZ0PzogbnVtYmVyO1xuICAgIG1lbnVQYWRkaW5nUmlnaHQ/OiBudW1iZXI7XG5cbiAgICB6SW5kZXg/OiBudW1iZXI7XG5cbiAgICAvLyBJZiB0cnVlLCBpbnNlcnQgYW4gaW52aXNpYmxlIHNjcmVlbi1zaXplZCBlbGVtZW50IGJlaGluZCB0aGUgbWVudSB0aGF0IHdoZW4gY2xpY2tlZCB3aWxsIGNsb3NlIGl0LlxuICAgIGhhc0JhY2tncm91bmQ/OiBib29sZWFuO1xuICAgIC8vIHdoZXRoZXIgdGhpcyBjb250ZXh0IG1lbnUgc2hvdWxkIGJlIGZvY3VzIG1hbmFnZWQuIElmIGZhbHNlIGl0IG11c3QgaGFuZGxlIGl0c2VsZlxuICAgIG1hbmFnZWQ/OiBib29sZWFuO1xuICAgIHdyYXBwZXJDbGFzc05hbWU/OiBzdHJpbmc7XG5cbiAgICAvLyBGdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gbWVudSBjbG9zZVxuICAgIG9uRmluaXNoZWQoKTtcbiAgICAvLyBvbiByZXNpemUgY2FsbGJhY2tcbiAgICB3aW5kb3dSZXNpemU/KCk7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbnRleHRNZW51RWxlbTogSFRNTERpdkVsZW1lbnQ7XG59XG5cbi8vIEdlbmVyaWMgQ29udGV4dE1lbnUgUG9ydGFsIHdyYXBwZXJcbi8vIGFsbCBvcHRpb25zIGluc2lkZSB0aGUgbWVudSBzaG91bGQgYmUgb2Ygcm9sZT1tZW51aXRlbS9tZW51aXRlbWNoZWNrYm94L21lbnVpdGVtcmFkaW9idXR0b24gYW5kIGhhdmUgdGFiSW5kZXg9ey0xfVxuLy8gdGhpcyB3aWxsIGFsbG93IHRoZSBDb250ZXh0TWVudSB0byBtYW5hZ2UgaXRzIG93biBmb2N1cyB1c2luZyBhcnJvdyBrZXlzIGFzIHBlciB0aGUgQVJJQSBndWlkZWxpbmVzLlxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5Db250ZXh0TWVudVwiKVxuZXhwb3J0IGNsYXNzIENvbnRleHRNZW51IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgaW5pdGlhbEZvY3VzOiBIVE1MRWxlbWVudDtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGhhc0JhY2tncm91bmQ6IHRydWUsXG4gICAgICAgIG1hbmFnZWQ6IHRydWUsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51RWxlbTogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBwZXJzaXN0IHdoYXQgaGFkIGZvY3VzIHdoZW4gd2UgZ290IGluaXRpYWxpemVkIHNvIHdlIGNhbiByZXR1cm4gaXQgYWZ0ZXJcbiAgICAgICAgdGhpcy5pbml0aWFsRm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyByZXR1cm4gZm9jdXMgdG8gdGhlIHRoaW5nIHdoaWNoIGhhZCBpdCBiZWZvcmUgdXNcbiAgICAgICAgdGhpcy5pbml0aWFsRm9jdXMuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbGxlY3RDb250ZXh0TWVudVJlY3QgPSAoZWxlbWVudCkgPT4ge1xuICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIHdoZW4gdW5tb3VudGluZywgc28gaWdub3JlXG4gICAgICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBmaXJzdCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignW3JvbGVePVwibWVudWl0ZW1cIl0nKTtcbiAgICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICAgICAgZmlyc3QgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1t0YWItaW5kZXhdJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICBmaXJzdC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZXh0TWVudUVsZW06IGVsZW1lbnQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnUgPSAoZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaGVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLmNsaWVudFg7XG4gICAgICAgICAgICBjb25zdCB5ID0gZS5jbGllbnRZO1xuXG4gICAgICAgICAgICAvLyBYWFg6IFRoaXMgaXNuJ3QgcHJldHR5IGJ1dCB0aGUgb25seSB3YXkgdG8gYWxsb3cgb3BlbmluZyBhIGRpZmZlcmVudCBjb250ZXh0IG1lbnUgb24gcmlnaHQgY2xpY2sgd2hpbHN0XG4gICAgICAgICAgICAvLyBhIGNvbnRleHQgbWVudSBhbmQgaXRzIGNsaWNrLWd1YXJkIGFyZSB1cCB3aXRob3V0IGNvbXBsZXRlbHkgcmV3cml0aW5nIGhvdyB0aGUgY29udGV4dCBtZW51cyB3b3JrLlxuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG4gICAgICAgICAgICAgICAgY2xpY2tFdmVudC5pbml0TW91c2VFdmVudChcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRleHRtZW51JywgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAwLFxuICAgICAgICAgICAgICAgICAgICAwLCAwLCB4LCB5LCBmYWxzZSwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSkuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250ZXh0TWVudVByZXZlbnRCdWJibGluZyA9IChlKSA9PiB7XG4gICAgICAgIC8vIHN0b3AgcHJvcGFnYXRpb24gc28gdGhhdCBhbnkgY29udGV4dCBtZW51IGhhbmRsZXJzIGRvbid0IGxlYWsgb3V0IG9mIHRoaXMgY29udGV4dCBtZW51XG4gICAgICAgIC8vIGJ1dCBkbyBub3QgaW5oaWJpdCB0aGUgZGVmYXVsdCBicm93c2VyIG1lbnVcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9O1xuXG4gICAgLy8gUHJldmVudCBjbGlja3Mgb24gdGhlIGJhY2tncm91bmQgZnJvbSBnb2luZyB0aHJvdWdoIHRvIHRoZSBjb21wb25lbnQgd2hpY2ggb3BlbmVkIHRoZSBtZW51LlxuICAgIHByaXZhdGUgb25GaW5pc2hlZCA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25GaW5pc2hlZCkgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Nb3ZlRm9jdXMgPSAoZWxlbWVudDogRWxlbWVudCwgdXA6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgbGV0IGRlc2NlbmRpbmcgPSBmYWxzZTsgLy8gYXJlIHdlIGN1cnJlbnRseSBkZXNjZW5kaW5nIG9yIGFzY2VuZGluZyB0aHJvdWdoIHRoZSBET00gdHJlZT9cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZCA9IHVwID8gZWxlbWVudC5sYXN0RWxlbWVudENoaWxkIDogZWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgICAgIGNvbnN0IHNpYmxpbmcgPSB1cCA/IGVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZyA6IGVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nO1xuXG4gICAgICAgICAgICBpZiAoZGVzY2VuZGluZykge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBzaWJsaW5nO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzaWJsaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBzaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICBkZXNjZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9Db250ZXh0dWFsTWVudVwiKSkgeyAvLyB3ZSBoaXQgdGhlIHRvcFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gdXAgPyBlbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQgOiBlbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICAgICAgICAgICAgICBkZXNjZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKGVsZW1lbnQgJiYgIUFSSUFfTUVOVV9JVEVNX1JPTEVTLmhhcyhlbGVtZW50LmdldEF0dHJpYnV0ZShcInJvbGVcIikpKTtcblxuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgKGVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1vdmVGb2N1c0hvbWVFbmQgPSAoZWxlbWVudDogRWxlbWVudCwgdXA6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlXj1cIm1lbnVpdGVtXCJdJyk7XG4gICAgICAgIGlmICghcmVzdWx0cykge1xuICAgICAgICAgICAgcmVzdWx0cyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW3RhYi1pbmRleF0nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHVwKSB7XG4gICAgICAgICAgICAgICAgKHJlc3VsdHNbMF0gYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIChyZXN1bHRzW3Jlc3VsdHMubGVuZ3RoIC0gMV0gYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1hbmFnZWQpIHtcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09IEtleS5FU0NBUEUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhhbmRsZWQgPSB0cnVlO1xuXG4gICAgICAgIHN3aXRjaCAoZXYua2V5KSB7XG4gICAgICAgICAgICBjYXNlIEtleS5UQUI6XG4gICAgICAgICAgICBjYXNlIEtleS5FU0NBUEU6XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19MRUZUOiAvLyBjbG9zZSBvbiBsZWZ0IGFuZCByaWdodCBhcnJvd3MgdG9vIGZvciB3aGVuIGl0IGlzIGEgY29udGV4dCBtZW51IG9uIGEgPFRvb2xiYXIgLz5cbiAgICAgICAgICAgIGNhc2UgS2V5LkFSUk9XX1JJR0hUOlxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfVVA6XG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vdmVGb2N1cyhldi50YXJnZXQgYXMgRWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19ET1dOOlxuICAgICAgICAgICAgICAgIHRoaXMub25Nb3ZlRm9jdXMoZXYudGFyZ2V0IGFzIEVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5LkhPTUU6XG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vdmVGb2N1c0hvbWVFbmQodGhpcy5zdGF0ZS5jb250ZXh0TWVudUVsZW0sIHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuRU5EOlxuICAgICAgICAgICAgICAgIHRoaXMub25Nb3ZlRm9jdXNIb21lRW5kKHRoaXMuc3RhdGUuY29udGV4dE1lbnVFbGVtLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICAvLyBjb25zdW1lIGFsbCBvdGhlciBrZXlzIGluIGNvbnRleHQgbWVudVxuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb3RlY3RlZCByZW5kZXJNZW51KGhhc0JhY2tncm91bmQgPSB0aGlzLnByb3BzLmhhc0JhY2tncm91bmQpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb246IFBhcnRpYWw8V3JpdGVhYmxlPERPTVJlY3Q+PiA9IHt9O1xuICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgaWYgKHByb3BzLnRvcCkge1xuICAgICAgICAgICAgcG9zaXRpb24udG9wID0gcHJvcHMudG9wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24uYm90dG9tID0gcHJvcHMuYm90dG9tO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNoZXZyb25GYWNlOiBDaGV2cm9uRmFjZTtcbiAgICAgICAgaWYgKHByb3BzLmxlZnQpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uLmxlZnQgPSBwcm9wcy5sZWZ0O1xuICAgICAgICAgICAgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5MZWZ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9zaXRpb24ucmlnaHQgPSBwcm9wcy5yaWdodDtcbiAgICAgICAgICAgIGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuUmlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb250ZXh0TWVudVJlY3QgPSB0aGlzLnN0YXRlLmNvbnRleHRNZW51RWxlbSA/IHRoaXMuc3RhdGUuY29udGV4dE1lbnVFbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIDogbnVsbDtcblxuICAgICAgICBjb25zdCBjaGV2cm9uT2Zmc2V0OiBDU1NQcm9wZXJ0aWVzID0ge307XG4gICAgICAgIGlmIChwcm9wcy5jaGV2cm9uRmFjZSkge1xuICAgICAgICAgICAgY2hldnJvbkZhY2UgPSBwcm9wcy5jaGV2cm9uRmFjZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYXNDaGV2cm9uID0gY2hldnJvbkZhY2UgJiYgY2hldnJvbkZhY2UgIT09IENoZXZyb25GYWNlLk5vbmU7XG5cbiAgICAgICAgaWYgKGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5Ub3AgfHwgY2hldnJvbkZhY2UgPT09IENoZXZyb25GYWNlLkJvdHRvbSkge1xuICAgICAgICAgICAgY2hldnJvbk9mZnNldC5sZWZ0ID0gcHJvcHMuY2hldnJvbk9mZnNldDtcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbi50b3AgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gcG9zaXRpb24udG9wO1xuXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBubyBhZGp1c3RtZW50IGlzIG1hZGVcbiAgICAgICAgICAgIGxldCBhZGp1c3RlZCA9IHRhcmdldDtcblxuICAgICAgICAgICAgLy8gSWYgd2Uga25vdyB0aGUgZGltZW5zaW9ucyBvZiB0aGUgY29udGV4dCBtZW51LCBhZGp1c3QgaXRzIHBvc2l0aW9uXG4gICAgICAgICAgICAvLyBzdWNoIHRoYXQgaXQgZG9lcyBub3QgbGVhdmUgdGhlIChwYWRkZWQpIHdpbmRvdy5cbiAgICAgICAgICAgIGlmIChjb250ZXh0TWVudVJlY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYWRkaW5nID0gMTA7XG4gICAgICAgICAgICAgICAgYWRqdXN0ZWQgPSBNYXRoLm1pbihwb3NpdGlvbi50b3AsIGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC0gY29udGV4dE1lbnVSZWN0LmhlaWdodCAtIHBhZGRpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NpdGlvbi50b3AgPSBhZGp1c3RlZDtcbiAgICAgICAgICAgIGNoZXZyb25PZmZzZXQudG9wID0gTWF0aC5tYXgocHJvcHMuY2hldnJvbk9mZnNldCwgcHJvcHMuY2hldnJvbk9mZnNldCArIHRhcmdldCAtIGFkanVzdGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjaGV2cm9uO1xuICAgICAgICBpZiAoaGFzQ2hldnJvbikge1xuICAgICAgICAgICAgY2hldnJvbiA9IDxkaXYgc3R5bGU9e2NoZXZyb25PZmZzZXR9IGNsYXNzTmFtZT17XCJteF9Db250ZXh0dWFsTWVudV9jaGV2cm9uX1wiICsgY2hldnJvbkZhY2V9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWVudUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudSc6IHRydWUsXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfbGVmdCc6ICFoYXNDaGV2cm9uICYmIHBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfcmlnaHQnOiAhaGFzQ2hldnJvbiAmJiBwb3NpdGlvbi5yaWdodCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV90b3AnOiAhaGFzQ2hldnJvbiAmJiBwb3NpdGlvbi50b3AsXG4gICAgICAgICAgICAnbXhfQ29udGV4dHVhbE1lbnVfYm90dG9tJzogIWhhc0NoZXZyb24gJiYgcG9zaXRpb24uYm90dG9tLFxuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51X3dpdGhDaGV2cm9uX2xlZnQnOiBjaGV2cm9uRmFjZSA9PT0gQ2hldnJvbkZhY2UuTGVmdCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV93aXRoQ2hldnJvbl9yaWdodCc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5SaWdodCxcbiAgICAgICAgICAgICdteF9Db250ZXh0dWFsTWVudV93aXRoQ2hldnJvbl90b3AnOiBjaGV2cm9uRmFjZSA9PT0gQ2hldnJvbkZhY2UuVG9wLFxuICAgICAgICAgICAgJ214X0NvbnRleHR1YWxNZW51X3dpdGhDaGV2cm9uX2JvdHRvbSc6IGNoZXZyb25GYWNlID09PSBDaGV2cm9uRmFjZS5Cb3R0b20sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG1lbnVTdHlsZTogQ1NTUHJvcGVydGllcyA9IHt9O1xuICAgICAgICBpZiAocHJvcHMubWVudVdpZHRoKSB7XG4gICAgICAgICAgICBtZW51U3R5bGUud2lkdGggPSBwcm9wcy5tZW51V2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvcHMubWVudUhlaWdodCkge1xuICAgICAgICAgICAgbWVudVN0eWxlLmhlaWdodCA9IHByb3BzLm1lbnVIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzTmFOKE51bWJlcihwcm9wcy5tZW51UGFkZGluZ1RvcCkpKSB7XG4gICAgICAgICAgICBtZW51U3R5bGVbXCJwYWRkaW5nVG9wXCJdID0gcHJvcHMubWVudVBhZGRpbmdUb3A7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc05hTihOdW1iZXIocHJvcHMubWVudVBhZGRpbmdMZWZ0KSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInBhZGRpbmdMZWZ0XCJdID0gcHJvcHMubWVudVBhZGRpbmdMZWZ0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNOYU4oTnVtYmVyKHByb3BzLm1lbnVQYWRkaW5nQm90dG9tKSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInBhZGRpbmdCb3R0b21cIl0gPSBwcm9wcy5tZW51UGFkZGluZ0JvdHRvbTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTmFOKE51bWJlcihwcm9wcy5tZW51UGFkZGluZ1JpZ2h0KSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInBhZGRpbmdSaWdodFwiXSA9IHByb3BzLm1lbnVQYWRkaW5nUmlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3cmFwcGVyU3R5bGUgPSB7fTtcbiAgICAgICAgaWYgKCFpc05hTihOdW1iZXIocHJvcHMuekluZGV4KSkpIHtcbiAgICAgICAgICAgIG1lbnVTdHlsZVtcInpJbmRleFwiXSA9IHByb3BzLnpJbmRleCArIDE7XG4gICAgICAgICAgICB3cmFwcGVyU3R5bGVbXCJ6SW5kZXhcIl0gPSBwcm9wcy56SW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYmFja2dyb3VuZDtcbiAgICAgICAgaWYgKGhhc0JhY2tncm91bmQpIHtcbiAgICAgICAgICAgIGJhY2tncm91bmQgPSAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Db250ZXh0dWFsTWVudV9iYWNrZ3JvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3dyYXBwZXJTdHlsZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0NvbnRleHR1YWxNZW51X3dyYXBwZXJcIiwgdGhpcy5wcm9wcy53cmFwcGVyQ2xhc3NOYW1lKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17ey4uLnBvc2l0aW9uLCAuLi53cmFwcGVyU3R5bGV9fVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51UHJldmVudEJ1YmJsaW5nfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttZW51Q2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e21lbnVTdHlsZX1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmNvbGxlY3RDb250ZXh0TWVudVJlY3R9XG4gICAgICAgICAgICAgICAgICAgIHJvbGU9e3RoaXMucHJvcHMubWFuYWdlZCA/IFwibWVudVwiIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBjaGV2cm9uIH1cbiAgICAgICAgICAgICAgICAgICAgeyBwcm9wcy5jaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBiYWNrZ3JvdW5kIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlcigpOiBSZWFjdC5SZWFjdENoaWxkIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0RE9NLmNyZWF0ZVBvcnRhbCh0aGlzLnJlbmRlck1lbnUoKSwgZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG4gICAgfVxufVxuXG4vLyBQbGFjZW1lbnQgbWV0aG9kIGZvciA8Q29udGV4dE1lbnUgLz4gdG8gcG9zaXRpb24gY29udGV4dCBtZW51IHRvIHJpZ2h0IG9mIGVsZW1lbnRSZWN0IHdpdGggY2hldnJvbk9mZnNldFxuZXhwb3J0IGNvbnN0IHRvUmlnaHRPZiA9IChlbGVtZW50UmVjdDogUGljazxET01SZWN0LCBcInJpZ2h0XCIgfCBcInRvcFwiIHwgXCJoZWlnaHRcIj4sIGNoZXZyb25PZmZzZXQgPSAxMikgPT4ge1xuICAgIGNvbnN0IGxlZnQgPSBlbGVtZW50UmVjdC5yaWdodCArIHdpbmRvdy5wYWdlWE9mZnNldCArIDM7XG4gICAgbGV0IHRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIChlbGVtZW50UmVjdC5oZWlnaHQgLyAyKSArIHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICB0b3AgLT0gY2hldnJvbk9mZnNldCArIDg7IC8vIHdoZXJlIDggaXMgaGFsZiB0aGUgaGVpZ2h0IG9mIHRoZSBjaGV2cm9uXG4gICAgcmV0dXJuIHtsZWZ0LCB0b3AsIGNoZXZyb25PZmZzZXR9O1xufTtcblxuLy8gUGxhY2VtZW50IG1ldGhvZCBmb3IgPENvbnRleHRNZW51IC8+IHRvIHBvc2l0aW9uIGNvbnRleHQgbWVudSByaWdodC1hbGlnbmVkIGFuZCBmbG93aW5nIHRvIHRoZSBsZWZ0IG9mIGVsZW1lbnRSZWN0LFxuLy8gYW5kIGVpdGhlciBhYm92ZSBvciBiZWxvdzogd2hlcmV2ZXIgdGhlcmUgaXMgbW9yZSBzcGFjZSAobWF5YmUgdGhpcyBzaG91bGQgYmUgYWJvdmVPckJlbG93TGVmdE9mPylcbmV4cG9ydCBjb25zdCBhYm92ZUxlZnRPZiA9IChlbGVtZW50UmVjdDogRE9NUmVjdCwgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5Ob25lLCB2UGFkZGluZyA9IDApID0+IHtcbiAgICBjb25zdCBtZW51T3B0aW9uczogSVBvc2l0aW9uICYgeyBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2UgfSA9IHsgY2hldnJvbkZhY2UgfTtcblxuICAgIGNvbnN0IGJ1dHRvblJpZ2h0ID0gZWxlbWVudFJlY3QucmlnaHQgKyB3aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgY29uc3QgYnV0dG9uQm90dG9tID0gZWxlbWVudFJlY3QuYm90dG9tICsgd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IGJ1dHRvblRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICAvLyBBbGlnbiB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgbWVudSB0byB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgYnV0dG9uXG4gICAgbWVudU9wdGlvbnMucmlnaHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGJ1dHRvblJpZ2h0O1xuICAgIC8vIEFsaWduIHRoZSBtZW51IHZlcnRpY2FsbHkgb24gd2hpY2hldmVyIHNpZGUgb2YgdGhlIGJ1dHRvbiBoYXMgbW9yZSBzcGFjZSBhdmFpbGFibGUuXG4gICAgaWYgKGJ1dHRvbkJvdHRvbSA8IHdpbmRvdy5pbm5lckhlaWdodCAvIDIpIHtcbiAgICAgICAgbWVudU9wdGlvbnMudG9wID0gYnV0dG9uQm90dG9tICsgdlBhZGRpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWVudU9wdGlvbnMuYm90dG9tID0gKHdpbmRvdy5pbm5lckhlaWdodCAtIGJ1dHRvblRvcCkgKyB2UGFkZGluZztcbiAgICB9XG5cbiAgICByZXR1cm4gbWVudU9wdGlvbnM7XG59O1xuXG4vLyBQbGFjZW1lbnQgbWV0aG9kIGZvciA8Q29udGV4dE1lbnUgLz4gdG8gcG9zaXRpb24gY29udGV4dCBtZW51IHJpZ2h0LWFsaWduZWQgYW5kIGZsb3dpbmcgdG8gdGhlIGxlZnQgb2YgZWxlbWVudFJlY3Rcbi8vIGFuZCBhbHdheXMgYWJvdmUgZWxlbWVudFJlY3RcbmV4cG9ydCBjb25zdCBhbHdheXNBYm92ZUxlZnRPZiA9IChlbGVtZW50UmVjdDogRE9NUmVjdCwgY2hldnJvbkZhY2UgPSBDaGV2cm9uRmFjZS5Ob25lLCB2UGFkZGluZyA9IDApID0+IHtcbiAgICBjb25zdCBtZW51T3B0aW9uczogSVBvc2l0aW9uICYgeyBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2UgfSA9IHsgY2hldnJvbkZhY2UgfTtcblxuICAgIGNvbnN0IGJ1dHRvblJpZ2h0ID0gZWxlbWVudFJlY3QucmlnaHQgKyB3aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgY29uc3QgYnV0dG9uQm90dG9tID0gZWxlbWVudFJlY3QuYm90dG9tICsgd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IGJ1dHRvblRvcCA9IGVsZW1lbnRSZWN0LnRvcCArIHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICAvLyBBbGlnbiB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgbWVudSB0byB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgYnV0dG9uXG4gICAgbWVudU9wdGlvbnMucmlnaHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGJ1dHRvblJpZ2h0O1xuICAgIC8vIEFsaWduIHRoZSBtZW51IHZlcnRpY2FsbHkgb24gd2hpY2hldmVyIHNpZGUgb2YgdGhlIGJ1dHRvbiBoYXMgbW9yZSBzcGFjZSBhdmFpbGFibGUuXG4gICAgaWYgKGJ1dHRvbkJvdHRvbSA8IHdpbmRvdy5pbm5lckhlaWdodCAvIDIpIHtcbiAgICAgICAgbWVudU9wdGlvbnMudG9wID0gYnV0dG9uQm90dG9tICsgdlBhZGRpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWVudU9wdGlvbnMuYm90dG9tID0gKHdpbmRvdy5pbm5lckhlaWdodCAtIGJ1dHRvblRvcCkgKyB2UGFkZGluZztcbiAgICB9XG5cbiAgICByZXR1cm4gbWVudU9wdGlvbnM7XG59O1xuXG4vLyBQbGFjZW1lbnQgbWV0aG9kIGZvciA8Q29udGV4dE1lbnUgLz4gdG8gcG9zaXRpb24gY29udGV4dCBtZW51IHJpZ2h0LWFsaWduZWQgYW5kIGZsb3dpbmcgdG8gdGhlIHJpZ2h0IG9mIGVsZW1lbnRSZWN0XG4vLyBhbmQgYWx3YXlzIGFib3ZlIGVsZW1lbnRSZWN0XG5leHBvcnQgY29uc3QgYWx3YXlzQWJvdmVSaWdodE9mID0gKGVsZW1lbnRSZWN0OiBET01SZWN0LCBjaGV2cm9uRmFjZSA9IENoZXZyb25GYWNlLk5vbmUsIHZQYWRkaW5nID0gMCkgPT4ge1xuICAgIGNvbnN0IG1lbnVPcHRpb25zOiBJUG9zaXRpb24gJiB7IGNoZXZyb25GYWNlOiBDaGV2cm9uRmFjZSB9ID0geyBjaGV2cm9uRmFjZSB9O1xuXG4gICAgY29uc3QgYnV0dG9uTGVmdCA9IGVsZW1lbnRSZWN0LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgY29uc3QgYnV0dG9uVG9wID0gZWxlbWVudFJlY3QudG9wICsgd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIC8vIEFsaWduIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIG1lbnUgdG8gdGhlIGxlZnQgZWRnZSBvZiB0aGUgYnV0dG9uXG4gICAgbWVudU9wdGlvbnMubGVmdCA9IGJ1dHRvbkxlZnQ7XG4gICAgLy8gQWxpZ24gdGhlIG1lbnUgdmVydGljYWxseSBhYm92ZSB0aGUgbWVudVxuICAgIG1lbnVPcHRpb25zLmJvdHRvbSA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgLSBidXR0b25Ub3ApICsgdlBhZGRpbmc7XG5cbiAgICByZXR1cm4gbWVudU9wdGlvbnM7XG59O1xuXG50eXBlIENvbnRleHRNZW51VHVwbGU8VD4gPSBbYm9vbGVhbiwgUmVmT2JqZWN0PFQ+LCAoKSA9PiB2b2lkLCAoKSA9PiB2b2lkLCAodmFsOiBib29sZWFuKSA9PiB2b2lkXTtcbmV4cG9ydCBjb25zdCB1c2VDb250ZXh0TWVudSA9IDxUIGV4dGVuZHMgYW55ID0gSFRNTEVsZW1lbnQ+KCk6IENvbnRleHRNZW51VHVwbGU8VD4gPT4ge1xuICAgIGNvbnN0IGJ1dHRvbiA9IHVzZVJlZjxUPihudWxsKTtcbiAgICBjb25zdCBbaXNPcGVuLCBzZXRJc09wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IG9wZW4gPSAoKSA9PiB7XG4gICAgICAgIHNldElzT3Blbih0cnVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICBzZXRJc09wZW4oZmFsc2UpO1xuICAgIH07XG5cbiAgICByZXR1cm4gW2lzT3BlbiwgYnV0dG9uLCBvcGVuLCBjbG9zZSwgc2V0SXNPcGVuXTtcbn07XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInN0cnVjdHVyZXMuTGVnYWN5Q29udGV4dE1lbnVcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlZ2FjeUNvbnRleHRNZW51IGV4dGVuZHMgQ29udGV4dE1lbnUge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWVudShmYWxzZSk7XG4gICAgfVxufVxuXG4vLyBYWFg6IERlcHJlY2F0ZWQsIHVzZWQgb25seSBmb3IgZHluYW1pYyBUb29sdGlwcy4gQXZvaWQgdXNpbmcgYXQgYWxsIGNvc3RzLlxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lbnUoRWxlbWVudENsYXNzLCBwcm9wcykge1xuICAgIGNvbnN0IG9uRmluaXNoZWQgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoZ2V0T3JDcmVhdGVDb250YWluZXIoKSk7XG5cbiAgICAgICAgaWYgKHByb3BzICYmIHByb3BzLm9uRmluaXNoZWQpIHtcbiAgICAgICAgICAgIHByb3BzLm9uRmluaXNoZWQuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgbWVudSA9IDxMZWdhY3lDb250ZXh0TWVudVxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgIG9uRmluaXNoZWQ9e29uRmluaXNoZWR9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QvanN4LW5vLWJpbmRcbiAgICAgICAgd2luZG93UmVzaXplPXtvbkZpbmlzaGVkfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0L2pzeC1uby1iaW5kXG4gICAgPlxuICAgICAgICA8RWxlbWVudENsYXNzIHsuLi5wcm9wc30gb25GaW5pc2hlZD17b25GaW5pc2hlZH0gLz5cbiAgICA8L0xlZ2FjeUNvbnRleHRNZW51PjtcblxuICAgIFJlYWN0RE9NLnJlbmRlcihtZW51LCBnZXRPckNyZWF0ZUNvbnRhaW5lcigpKTtcblxuICAgIHJldHVybiB7Y2xvc2U6IG9uRmluaXNoZWR9O1xufVxuXG4vLyByZS1leHBvcnQgdGhlIHNlbWFudGljIGhlbHBlciBjb21wb25lbnRzIGZvciBzaW1wbGljaXR5XG5leHBvcnQge0NvbnRleHRNZW51QnV0dG9ufSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvQ29udGV4dE1lbnVCdXR0b25cIjtcbmV4cG9ydCB7Q29udGV4dE1lbnVUb29sdGlwQnV0dG9ufSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uXCI7XG5leHBvcnQge01lbnVHcm91cH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L01lbnVHcm91cFwiO1xuZXhwb3J0IHtNZW51SXRlbX0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L01lbnVJdGVtXCI7XG5leHBvcnQge01lbnVJdGVtQ2hlY2tib3h9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbUNoZWNrYm94XCI7XG5leHBvcnQge01lbnVJdGVtUmFkaW99IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9NZW51SXRlbVJhZGlvXCI7XG5leHBvcnQge1N0eWxlZE1lbnVJdGVtQ2hlY2tib3h9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9TdHlsZWRNZW51SXRlbUNoZWNrYm94XCI7XG5leHBvcnQge1N0eWxlZE1lbnVJdGVtUmFkaW99IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9TdHlsZWRNZW51SXRlbVJhZGlvXCI7XG4iXX0=