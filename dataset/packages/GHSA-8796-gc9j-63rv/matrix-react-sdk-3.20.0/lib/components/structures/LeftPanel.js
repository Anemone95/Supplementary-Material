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

var _GroupFilterPanel = _interopRequireDefault(require("./GroupFilterPanel"));

var _CustomRoomTagPanel = _interopRequireDefault(require("./CustomRoomTagPanel"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _languageHandler = require("../../languageHandler");

var _RoomList = _interopRequireDefault(require("../views/rooms/RoomList"));

var _RoomSublist = require("../views/rooms/RoomSublist");

var _actions = require("../../dispatcher/actions");

var _UserMenu = _interopRequireDefault(require("./UserMenu"));

var _RoomSearch = _interopRequireDefault(require("./RoomSearch"));

var _RoomBreadcrumbs = _interopRequireDefault(require("../views/rooms/RoomBreadcrumbs"));

var _BreadcrumbsStore = require("../../stores/BreadcrumbsStore");

var _AsyncStore = require("../../stores/AsyncStore");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _RoomListStore = _interopRequireWildcard(require("../../stores/room-list/RoomListStore"));

var _IndicatorScrollbar = _interopRequireDefault(require("../structures/IndicatorScrollbar"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../views/elements/AccessibleTooltipButton"));

var _OwnProfileStore = require("../../stores/OwnProfileStore");

var _RoomListNumResults = _interopRequireDefault(require("../views/rooms/RoomListNumResults"));

var _LeftPanelWidget = _interopRequireDefault(require("./LeftPanelWidget"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _Media = require("../../customisations/Media");

var _SpaceStore = _interopRequireWildcard(require("../../stores/SpaceStore"));

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _dec, _class, _temp;

// List of CSS classes which should be included in keyboard navigation within the room list
const cssClasses = ["mx_RoomSearch_input", "mx_RoomSearch_minimizedHandle", // minimized <RoomSearch />
"mx_RoomSublist_headerText", "mx_RoomTile", "mx_RoomSublist_showNButton"];
let LeftPanel = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.LeftPanel"), _dec(_class = (_temp = class LeftPanel extends React.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "listContainerRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "groupFilterPanelWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "bgImageWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "focusedElement", null);
    (0, _defineProperty2.default)(this, "isDoingStickyHeaders", false);
    (0, _defineProperty2.default)(this, "updateActiveSpace", (activeSpace
    /*: Room*/
    ) => {
      this.setState({
        activeSpace
      });
    });
    (0, _defineProperty2.default)(this, "onExplore", () => {
      _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
    });
    (0, _defineProperty2.default)(this, "onBreadcrumbsUpdate", () => {
      const newVal = _BreadcrumbsStore.BreadcrumbsStore.instance.visible;

      if (newVal !== this.state.showBreadcrumbs) {
        this.setState({
          showBreadcrumbs: newVal
        }); // Update the sticky headers too as the breadcrumbs will be popping in or out.

        if (!this.listContainerRef.current) return; // ignore: no headers to sticky

        this.handleStickyHeaders(this.listContainerRef.current);
      }
    });
    (0, _defineProperty2.default)(this, "onBackgroundImageUpdate", () => {
      // Note: we do this in the LeftPanel as it uses this variable most prominently.
      const avatarSize = 32; // arbitrary

      let avatarUrl = _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl(avatarSize);

      const settingBgMxc = _SettingsStore.default.getValue("RoomList.backgroundImage");

      if (settingBgMxc) {
        avatarUrl = (0, _Media.mediaFromMxc)(settingBgMxc).getSquareThumbnailHttp(avatarSize);
      }

      const avatarUrlProp = `url(${avatarUrl})`;

      if (!avatarUrl) {
        document.body.style.removeProperty("--avatar-url");
      } else if (document.body.style.getPropertyValue("--avatar-url") !== avatarUrlProp) {
        document.body.style.setProperty("--avatar-url", avatarUrlProp);
      }
    });
    (0, _defineProperty2.default)(this, "onScroll", (ev
    /*: React.MouseEvent<HTMLDivElement>*/
    ) => {
      const list = ev.target;
      this.handleStickyHeaders(list);
    });
    (0, _defineProperty2.default)(this, "onResize", () => {
      if (!this.listContainerRef.current) return; // ignore: no headers to sticky

      this.handleStickyHeaders(this.listContainerRef.current);
    });
    (0, _defineProperty2.default)(this, "onFocus", (ev
    /*: React.FocusEvent*/
    ) => {
      this.focusedElement = ev.target;
    });
    (0, _defineProperty2.default)(this, "onBlur", () => {
      this.focusedElement = null;
    });
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: React.KeyboardEvent*/
    ) => {
      if (!this.focusedElement) return;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomListAction(ev);

      switch (action) {
        case _KeyBindingsManager.RoomListAction.NextRoom:
        case _KeyBindingsManager.RoomListAction.PrevRoom:
          ev.stopPropagation();
          ev.preventDefault();
          this.onMoveFocus(action === _KeyBindingsManager.RoomListAction.PrevRoom);
          break;
      }
    });
    (0, _defineProperty2.default)(this, "selectRoom", () => {
      const firstRoom = this.listContainerRef.current.querySelector(".mx_RoomTile");

      if (firstRoom) {
        firstRoom.click();
        return true; // to get the field to clear
      }
    });
    (0, _defineProperty2.default)(this, "onMoveFocus", (up
    /*: boolean*/
    ) => {
      let element = this.focusedElement;
      let descending = false; // are we currently descending or ascending through the DOM tree?

      let classes
      /*: DOMTokenList*/
      ;

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
          classes = element.classList;
        }
      } while (element && (!cssClasses.some(c => classes.contains(c)) || element.offsetParent === null));

      if (element) {
        element.focus();
        this.focusedElement = element;
      }
    });
    this.state = {
      showBreadcrumbs: _BreadcrumbsStore.BreadcrumbsStore.instance.visible,
      showGroupFilterPanel: _SettingsStore.default.getValue('TagPanel.enableTagPanel'),
      activeSpace: _SpaceStore.default.instance.activeSpace
    };

    _BreadcrumbsStore.BreadcrumbsStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _OwnProfileStore.OwnProfileStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onBackgroundImageUpdate);

    _SpaceStore.default.instance.on(_SpaceStore.UPDATE_SELECTED_SPACE, this.updateActiveSpace);

    this.bgImageWatcherRef = _SettingsStore.default.watchSetting("RoomList.backgroundImage", null, this.onBackgroundImageUpdate);
    this.groupFilterPanelWatcherRef = _SettingsStore.default.watchSetting("TagPanel.enableTagPanel", null, () => {
      this.setState({
        showGroupFilterPanel: _SettingsStore.default.getValue("TagPanel.enableTagPanel")
      });
    }); // We watch the middle panel because we don't actually get resized, the middle panel does.
    // We listen to the noisy channel to avoid choppy reaction times.

    this.props.resizeNotifier.on("middlePanelResizedNoisy", this.onResize);
  }

  componentWillUnmount() {
    _SettingsStore.default.unwatchSetting(this.groupFilterPanelWatcherRef);

    _SettingsStore.default.unwatchSetting(this.bgImageWatcherRef);

    _BreadcrumbsStore.BreadcrumbsStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _RoomListStore.default.instance.off(_RoomListStore.LISTS_UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _OwnProfileStore.OwnProfileStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onBackgroundImageUpdate);

    _SpaceStore.default.instance.off(_SpaceStore.UPDATE_SELECTED_SPACE, this.updateActiveSpace);

    this.props.resizeNotifier.off("middlePanelResizedNoisy", this.onResize);
  }

  handleStickyHeaders(list
  /*: HTMLDivElement*/
  ) {
    if (this.isDoingStickyHeaders) return;
    this.isDoingStickyHeaders = true;
    window.requestAnimationFrame(() => {
      this.doStickyHeaders(list);
      this.isDoingStickyHeaders = false;
    });
  }

  doStickyHeaders(list
  /*: HTMLDivElement*/
  ) {
    const topEdge = list.scrollTop;
    const bottomEdge = list.offsetHeight + list.scrollTop;
    const sublists = list.querySelectorAll(".mx_RoomSublist:not(.mx_RoomSublist_hidden)");
    const headerRightMargin = 15; // calculated from margins and widths to align with non-sticky tiles

    const headerStickyWidth = list.clientWidth - headerRightMargin; // We track which styles we want on a target before making the changes to avoid
    // excessive layout updates.

    const targetStyles = new Map();
    let lastTopHeader;
    let firstBottomHeader;

    for (const sublist of sublists) {
      const header = sublist.querySelector(".mx_RoomSublist_stickable");
      header.style.removeProperty("display"); // always clear display:none first
      // When an element is <=40% off screen, make it take over

      const offScreenFactor = 0.4;
      const isOffTop = sublist.offsetTop + offScreenFactor * _RoomSublist.HEADER_HEIGHT <= topEdge;
      const isOffBottom = sublist.offsetTop + offScreenFactor * _RoomSublist.HEADER_HEIGHT >= bottomEdge;

      if (isOffTop || sublist === sublists[0]) {
        targetStyles.set(header, {
          stickyTop: true
        });

        if (lastTopHeader) {
          lastTopHeader.style.display = "none";
          targetStyles.set(lastTopHeader, {
            makeInvisible: true
          });
        }

        lastTopHeader = header;
      } else if (isOffBottom && !firstBottomHeader) {
        targetStyles.set(header, {
          stickyBottom: true
        });
        firstBottomHeader = header;
      } else {
        targetStyles.set(header, {}); // nothing == clear
      }
    } // Run over the style changes and make them reality. We check to see if we're about to
    // cause a no-op update, as adding/removing properties that are/aren't there cause
    // layout updates.


    for (const header of targetStyles.keys()) {
      const style = targetStyles.get(header);

      if (style.makeInvisible) {
        // we will have already removed the 'display: none', so add it back.
        header.style.display = "none";
        continue; // nothing else to do, even if sticky somehow
      }

      if (style.stickyTop) {
        if (!header.classList.contains("mx_RoomSublist_headerContainer_stickyTop")) {
          header.classList.add("mx_RoomSublist_headerContainer_stickyTop");
        }

        const newTop = `${list.parentElement.offsetTop}px`;

        if (header.style.top !== newTop) {
          header.style.top = newTop;
        }
      } else {
        if (header.classList.contains("mx_RoomSublist_headerContainer_stickyTop")) {
          header.classList.remove("mx_RoomSublist_headerContainer_stickyTop");
        }

        if (header.style.top) {
          header.style.removeProperty('top');
        }
      }

      if (style.stickyBottom) {
        if (!header.classList.contains("mx_RoomSublist_headerContainer_stickyBottom")) {
          header.classList.add("mx_RoomSublist_headerContainer_stickyBottom");
        }

        const offset = window.innerHeight - (list.parentElement.offsetTop + list.parentElement.offsetHeight);
        const newBottom = `${offset}px`;

        if (header.style.bottom !== newBottom) {
          header.style.bottom = newBottom;
        }
      } else {
        if (header.classList.contains("mx_RoomSublist_headerContainer_stickyBottom")) {
          header.classList.remove("mx_RoomSublist_headerContainer_stickyBottom");
        }

        if (header.style.bottom) {
          header.style.removeProperty('bottom');
        }
      }

      if (style.stickyTop || style.stickyBottom) {
        if (!header.classList.contains("mx_RoomSublist_headerContainer_sticky")) {
          header.classList.add("mx_RoomSublist_headerContainer_sticky");
        }

        const newWidth = `${headerStickyWidth}px`;

        if (header.style.width !== newWidth) {
          header.style.width = newWidth;
        }
      } else if (!style.stickyTop && !style.stickyBottom) {
        if (header.classList.contains("mx_RoomSublist_headerContainer_sticky")) {
          header.classList.remove("mx_RoomSublist_headerContainer_sticky");
        }

        if (header.style.width) {
          header.style.removeProperty('width');
        }
      }
    } // add appropriate sticky classes to wrapper so it has
    // the necessary top/bottom padding to put the sticky header in


    const listWrapper = list.parentElement; // .mx_LeftPanel_roomListWrapper

    if (lastTopHeader) {
      listWrapper.classList.add("mx_LeftPanel_roomListWrapper_stickyTop");
    } else {
      listWrapper.classList.remove("mx_LeftPanel_roomListWrapper_stickyTop");
    }

    if (firstBottomHeader) {
      listWrapper.classList.add("mx_LeftPanel_roomListWrapper_stickyBottom");
    } else {
      listWrapper.classList.remove("mx_LeftPanel_roomListWrapper_stickyBottom");
    }
  }

  renderHeader()
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_LeftPanel_userHeader"
    }, /*#__PURE__*/React.createElement(_UserMenu.default, {
      isMinimized: this.props.isMinimized
    }));
  }

  renderBreadcrumbs()
  /*: React.ReactNode*/
  {
    if (this.state.showBreadcrumbs && !this.props.isMinimized) {
      return /*#__PURE__*/React.createElement(_IndicatorScrollbar.default, {
        className: "mx_LeftPanel_breadcrumbsContainer mx_AutoHideScrollbar",
        verticalScrollsHorizontally: true // Firefox sometimes makes this element focusable due to
        // overflow:scroll;, so force it out of tab order.
        ,
        tabIndex: -1
      }, /*#__PURE__*/React.createElement(_RoomBreadcrumbs.default, null));
    }
  }

  renderSearchExplore()
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_LeftPanel_filterContainer",
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onKeyDown: this.onKeyDown
    }, /*#__PURE__*/React.createElement(_RoomSearch.default, {
      isMinimized: this.props.isMinimized,
      onKeyDown: this.onKeyDown,
      onSelectRoom: this.selectRoom
    }), /*#__PURE__*/React.createElement(_AccessibleTooltipButton.default, {
      className: (0, _classnames.default)("mx_LeftPanel_exploreButton", {
        mx_LeftPanel_exploreButton_space: !!this.state.activeSpace
      }),
      onClick: this.onExplore,
      title: (0, _languageHandler._t)("Explore rooms")
    }));
  }

  render()
  /*: React.ReactNode*/
  {
    let leftLeftPanel;

    if (this.state.showGroupFilterPanel) {
      leftLeftPanel = /*#__PURE__*/React.createElement("div", {
        className: "mx_LeftPanel_GroupFilterPanelContainer"
      }, /*#__PURE__*/React.createElement(_GroupFilterPanel.default, null), _SettingsStore.default.getValue("feature_custom_tags") ? /*#__PURE__*/React.createElement(_CustomRoomTagPanel.default, null) : null);
    }

    const roomList = /*#__PURE__*/React.createElement(_RoomList.default, {
      onKeyDown: this.onKeyDown,
      resizeNotifier: this.props.resizeNotifier,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      isMinimized: this.props.isMinimized,
      onResize: this.onResize,
      activeSpace: this.state.activeSpace
    });
    const containerClasses = (0, _classnames.default)({
      "mx_LeftPanel": true,
      "mx_LeftPanel_minimized": this.props.isMinimized
    });
    const roomListClasses = (0, _classnames.default)("mx_LeftPanel_actualRoomListContainer", "mx_AutoHideScrollbar");
    return /*#__PURE__*/React.createElement("div", {
      className: containerClasses
    }, leftLeftPanel, /*#__PURE__*/React.createElement("aside", {
      className: "mx_LeftPanel_roomListContainer"
    }, this.renderHeader(), this.renderSearchExplore(), this.renderBreadcrumbs(), /*#__PURE__*/React.createElement(_RoomListNumResults.default, null), /*#__PURE__*/React.createElement("div", {
      className: "mx_LeftPanel_roomListWrapper"
    }, /*#__PURE__*/React.createElement("div", {
      className: roomListClasses,
      onScroll: this.onScroll,
      ref: this.listContainerRef // Firefox sometimes makes this element focusable due to
      // overflow:scroll;, so force it out of tab order.
      ,
      tabIndex: -1
    }, roomList)), !this.props.isMinimized && /*#__PURE__*/React.createElement(_LeftPanelWidget.default, {
      onResize: this.onResize
    })));
  }

}, _temp)) || _class);
exports.default = LeftPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTGVmdFBhbmVsLnRzeCJdLCJuYW1lcyI6WyJjc3NDbGFzc2VzIiwiTGVmdFBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiYWN0aXZlU3BhY2UiLCJzZXRTdGF0ZSIsImRpcyIsImZpcmUiLCJBY3Rpb24iLCJWaWV3Um9vbURpcmVjdG9yeSIsIm5ld1ZhbCIsIkJyZWFkY3J1bWJzU3RvcmUiLCJpbnN0YW5jZSIsInZpc2libGUiLCJzdGF0ZSIsInNob3dCcmVhZGNydW1icyIsImxpc3RDb250YWluZXJSZWYiLCJjdXJyZW50IiwiaGFuZGxlU3RpY2t5SGVhZGVycyIsImF2YXRhclNpemUiLCJhdmF0YXJVcmwiLCJPd25Qcm9maWxlU3RvcmUiLCJnZXRIdHRwQXZhdGFyVXJsIiwic2V0dGluZ0JnTXhjIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsImF2YXRhclVybFByb3AiLCJkb2N1bWVudCIsImJvZHkiLCJzdHlsZSIsInJlbW92ZVByb3BlcnR5IiwiZ2V0UHJvcGVydHlWYWx1ZSIsInNldFByb3BlcnR5IiwiZXYiLCJsaXN0IiwidGFyZ2V0IiwiZm9jdXNlZEVsZW1lbnQiLCJhY3Rpb24iLCJnZXRSb29tTGlzdEFjdGlvbiIsIlJvb21MaXN0QWN0aW9uIiwiTmV4dFJvb20iLCJQcmV2Um9vbSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwib25Nb3ZlRm9jdXMiLCJmaXJzdFJvb20iLCJxdWVyeVNlbGVjdG9yIiwiY2xpY2siLCJ1cCIsImVsZW1lbnQiLCJkZXNjZW5kaW5nIiwiY2xhc3NlcyIsImNoaWxkIiwibGFzdEVsZW1lbnRDaGlsZCIsImZpcnN0RWxlbWVudENoaWxkIiwic2libGluZyIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciLCJuZXh0RWxlbWVudFNpYmxpbmciLCJwYXJlbnRFbGVtZW50IiwiY2xhc3NMaXN0Iiwic29tZSIsImMiLCJjb250YWlucyIsIm9mZnNldFBhcmVudCIsImZvY3VzIiwic2hvd0dyb3VwRmlsdGVyUGFuZWwiLCJTcGFjZVN0b3JlIiwib24iLCJVUERBVEVfRVZFTlQiLCJvbkJyZWFkY3J1bWJzVXBkYXRlIiwiUm9vbUxpc3RTdG9yZSIsIkxJU1RTX1VQREFURV9FVkVOVCIsIm9uQmFja2dyb3VuZEltYWdlVXBkYXRlIiwiVVBEQVRFX1NFTEVDVEVEX1NQQUNFIiwidXBkYXRlQWN0aXZlU3BhY2UiLCJiZ0ltYWdlV2F0Y2hlclJlZiIsIndhdGNoU2V0dGluZyIsImdyb3VwRmlsdGVyUGFuZWxXYXRjaGVyUmVmIiwicmVzaXplTm90aWZpZXIiLCJvblJlc2l6ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW53YXRjaFNldHRpbmciLCJvZmYiLCJpc0RvaW5nU3RpY2t5SGVhZGVycyIsIndpbmRvdyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImRvU3RpY2t5SGVhZGVycyIsInRvcEVkZ2UiLCJzY3JvbGxUb3AiLCJib3R0b21FZGdlIiwib2Zmc2V0SGVpZ2h0Iiwic3VibGlzdHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaGVhZGVyUmlnaHRNYXJnaW4iLCJoZWFkZXJTdGlja3lXaWR0aCIsImNsaWVudFdpZHRoIiwidGFyZ2V0U3R5bGVzIiwiTWFwIiwibGFzdFRvcEhlYWRlciIsImZpcnN0Qm90dG9tSGVhZGVyIiwic3VibGlzdCIsImhlYWRlciIsIm9mZlNjcmVlbkZhY3RvciIsImlzT2ZmVG9wIiwib2Zmc2V0VG9wIiwiSEVBREVSX0hFSUdIVCIsImlzT2ZmQm90dG9tIiwic2V0Iiwic3RpY2t5VG9wIiwiZGlzcGxheSIsIm1ha2VJbnZpc2libGUiLCJzdGlja3lCb3R0b20iLCJrZXlzIiwiZ2V0IiwiYWRkIiwibmV3VG9wIiwidG9wIiwicmVtb3ZlIiwib2Zmc2V0IiwiaW5uZXJIZWlnaHQiLCJuZXdCb3R0b20iLCJib3R0b20iLCJuZXdXaWR0aCIsIndpZHRoIiwibGlzdFdyYXBwZXIiLCJyZW5kZXJIZWFkZXIiLCJpc01pbmltaXplZCIsInJlbmRlckJyZWFkY3J1bWJzIiwicmVuZGVyU2VhcmNoRXhwbG9yZSIsIm9uRm9jdXMiLCJvbkJsdXIiLCJvbktleURvd24iLCJzZWxlY3RSb29tIiwibXhfTGVmdFBhbmVsX2V4cGxvcmVCdXR0b25fc3BhY2UiLCJvbkV4cGxvcmUiLCJyZW5kZXIiLCJsZWZ0TGVmdFBhbmVsIiwicm9vbUxpc3QiLCJjb250YWluZXJDbGFzc2VzIiwicm9vbUxpc3RDbGFzc2VzIiwib25TY3JvbGwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFhQTtBQUNBLE1BQU1BLFVBQVUsR0FBRyxDQUNmLHFCQURlLEVBRWYsK0JBRmUsRUFFa0I7QUFDakMsMkJBSGUsRUFJZixhQUplLEVBS2YsNEJBTGUsQ0FBbkI7SUFTcUJDLFMsV0FEcEIsZ0RBQXFCLHNCQUFyQixDLHlCQUFELE1BQ3FCQSxTQURyQixTQUN1Q0MsS0FBSyxDQUFDQztBQUQ3QztBQUN1RTtBQU9uRUMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZ0I7QUFDdkIsVUFBTUEsS0FBTjtBQUR1Qix5RUFOaUMsc0JBTWpDO0FBQUE7QUFBQTtBQUFBLDBEQUhGLElBR0U7QUFBQSxnRUFGSSxLQUVKO0FBQUEsNkRBa0NDLENBQUNDO0FBQUQ7QUFBQSxTQUF1QjtBQUMvQyxXQUFLQyxRQUFMLENBQWM7QUFBRUQsUUFBQUE7QUFBRixPQUFkO0FBQ0gsS0FwQzBCO0FBQUEscURBc0NQLE1BQU07QUFDdEJFLDBCQUFJQyxJQUFKLENBQVNDLGdCQUFPQyxpQkFBaEI7QUFDSCxLQXhDMEI7QUFBQSwrREEwQ0csTUFBTTtBQUNoQyxZQUFNQyxNQUFNLEdBQUdDLG1DQUFpQkMsUUFBakIsQ0FBMEJDLE9BQXpDOztBQUNBLFVBQUlILE1BQU0sS0FBSyxLQUFLSSxLQUFMLENBQVdDLGVBQTFCLEVBQTJDO0FBQ3ZDLGFBQUtWLFFBQUwsQ0FBYztBQUFDVSxVQUFBQSxlQUFlLEVBQUVMO0FBQWxCLFNBQWQsRUFEdUMsQ0FHdkM7O0FBQ0EsWUFBSSxDQUFDLEtBQUtNLGdCQUFMLENBQXNCQyxPQUEzQixFQUFvQyxPQUpHLENBSUs7O0FBQzVDLGFBQUtDLG1CQUFMLENBQXlCLEtBQUtGLGdCQUFMLENBQXNCQyxPQUEvQztBQUNIO0FBQ0osS0FuRDBCO0FBQUEsbUVBcURPLE1BQU07QUFDcEM7QUFDQSxZQUFNRSxVQUFVLEdBQUcsRUFBbkIsQ0FGb0MsQ0FFYjs7QUFDdkIsVUFBSUMsU0FBUyxHQUFHQyxpQ0FBZ0JULFFBQWhCLENBQXlCVSxnQkFBekIsQ0FBMENILFVBQTFDLENBQWhCOztBQUNBLFlBQU1JLFlBQVksR0FBR0MsdUJBQWNDLFFBQWQsQ0FBdUIsMEJBQXZCLENBQXJCOztBQUNBLFVBQUlGLFlBQUosRUFBa0I7QUFDZEgsUUFBQUEsU0FBUyxHQUFHLHlCQUFhRyxZQUFiLEVBQTJCRyxzQkFBM0IsQ0FBa0RQLFVBQWxELENBQVo7QUFDSDs7QUFFRCxZQUFNUSxhQUFhLEdBQUksT0FBTVAsU0FBVSxHQUF2Qzs7QUFDQSxVQUFJLENBQUNBLFNBQUwsRUFBZ0I7QUFDWlEsUUFBQUEsUUFBUSxDQUFDQyxJQUFULENBQWNDLEtBQWQsQ0FBb0JDLGNBQXBCLENBQW1DLGNBQW5DO0FBQ0gsT0FGRCxNQUVPLElBQUlILFFBQVEsQ0FBQ0MsSUFBVCxDQUFjQyxLQUFkLENBQW9CRSxnQkFBcEIsQ0FBcUMsY0FBckMsTUFBeURMLGFBQTdELEVBQTRFO0FBQy9FQyxRQUFBQSxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBZCxDQUFvQkcsV0FBcEIsQ0FBZ0MsY0FBaEMsRUFBZ0ROLGFBQWhEO0FBQ0g7QUFDSixLQXBFMEI7QUFBQSxvREE0TVIsQ0FBQ087QUFBRDtBQUFBLFNBQTBDO0FBQ3pELFlBQU1DLElBQUksR0FBR0QsRUFBRSxDQUFDRSxNQUFoQjtBQUNBLFdBQUtsQixtQkFBTCxDQUF5QmlCLElBQXpCO0FBQ0gsS0EvTTBCO0FBQUEsb0RBaU5SLE1BQU07QUFDckIsVUFBSSxDQUFDLEtBQUtuQixnQkFBTCxDQUFzQkMsT0FBM0IsRUFBb0MsT0FEZixDQUN1Qjs7QUFDNUMsV0FBS0MsbUJBQUwsQ0FBeUIsS0FBS0YsZ0JBQUwsQ0FBc0JDLE9BQS9DO0FBQ0gsS0FwTjBCO0FBQUEsbURBc05ULENBQUNpQjtBQUFEO0FBQUEsU0FBMEI7QUFDeEMsV0FBS0csY0FBTCxHQUFzQkgsRUFBRSxDQUFDRSxNQUF6QjtBQUNILEtBeE4wQjtBQUFBLGtEQTBOVixNQUFNO0FBQ25CLFdBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDSCxLQTVOMEI7QUFBQSxxREE4TlAsQ0FBQ0g7QUFBRDtBQUFBLFNBQTZCO0FBQzdDLFVBQUksQ0FBQyxLQUFLRyxjQUFWLEVBQTBCO0FBRTFCLFlBQU1DLE1BQU0sR0FBRyxpREFBd0JDLGlCQUF4QixDQUEwQ0wsRUFBMUMsQ0FBZjs7QUFDQSxjQUFRSSxNQUFSO0FBQ0ksYUFBS0UsbUNBQWVDLFFBQXBCO0FBQ0EsYUFBS0QsbUNBQWVFLFFBQXBCO0FBQ0lSLFVBQUFBLEVBQUUsQ0FBQ1MsZUFBSDtBQUNBVCxVQUFBQSxFQUFFLENBQUNVLGNBQUg7QUFDQSxlQUFLQyxXQUFMLENBQWlCUCxNQUFNLEtBQUtFLG1DQUFlRSxRQUEzQztBQUNBO0FBTlI7QUFRSCxLQTFPMEI7QUFBQSxzREE0T04sTUFBTTtBQUN2QixZQUFNSSxTQUFTLEdBQUcsS0FBSzlCLGdCQUFMLENBQXNCQyxPQUF0QixDQUE4QjhCLGFBQTlCLENBQTRELGNBQTVELENBQWxCOztBQUNBLFVBQUlELFNBQUosRUFBZTtBQUNYQSxRQUFBQSxTQUFTLENBQUNFLEtBQVY7QUFDQSxlQUFPLElBQVAsQ0FGVyxDQUVFO0FBQ2hCO0FBQ0osS0FsUDBCO0FBQUEsdURBb1BMLENBQUNDO0FBQUQ7QUFBQSxTQUFpQjtBQUNuQyxVQUFJQyxPQUFPLEdBQUcsS0FBS2IsY0FBbkI7QUFFQSxVQUFJYyxVQUFVLEdBQUcsS0FBakIsQ0FIbUMsQ0FHWDs7QUFDeEIsVUFBSUM7QUFBcUI7QUFBekI7O0FBRUEsU0FBRztBQUNDLGNBQU1DLEtBQUssR0FBR0osRUFBRSxHQUFHQyxPQUFPLENBQUNJLGdCQUFYLEdBQThCSixPQUFPLENBQUNLLGlCQUF0RDtBQUNBLGNBQU1DLE9BQU8sR0FBR1AsRUFBRSxHQUFHQyxPQUFPLENBQUNPLHNCQUFYLEdBQW9DUCxPQUFPLENBQUNRLGtCQUE5RDs7QUFFQSxZQUFJUCxVQUFKLEVBQWdCO0FBQ1osY0FBSUUsS0FBSixFQUFXO0FBQ1BILFlBQUFBLE9BQU8sR0FBR0csS0FBVjtBQUNILFdBRkQsTUFFTyxJQUFJRyxPQUFKLEVBQWE7QUFDaEJOLFlBQUFBLE9BQU8sR0FBR00sT0FBVjtBQUNILFdBRk0sTUFFQTtBQUNITCxZQUFBQSxVQUFVLEdBQUcsS0FBYjtBQUNBRCxZQUFBQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQ1MsYUFBbEI7QUFDSDtBQUNKLFNBVEQsTUFTTztBQUNILGNBQUlILE9BQUosRUFBYTtBQUNUTixZQUFBQSxPQUFPLEdBQUdNLE9BQVY7QUFDQUwsWUFBQUEsVUFBVSxHQUFHLElBQWI7QUFDSCxXQUhELE1BR087QUFDSEQsWUFBQUEsT0FBTyxHQUFHQSxPQUFPLENBQUNTLGFBQWxCO0FBQ0g7QUFDSjs7QUFFRCxZQUFJVCxPQUFKLEVBQWE7QUFDVEUsVUFBQUEsT0FBTyxHQUFHRixPQUFPLENBQUNVLFNBQWxCO0FBQ0g7QUFDSixPQXpCRCxRQXlCU1YsT0FBTyxLQUFLLENBQUNwRCxVQUFVLENBQUMrRCxJQUFYLENBQWdCQyxDQUFDLElBQUlWLE9BQU8sQ0FBQ1csUUFBUixDQUFpQkQsQ0FBakIsQ0FBckIsQ0FBRCxJQUE4Q1osT0FBTyxDQUFDYyxZQUFSLEtBQXlCLElBQTVFLENBekJoQjs7QUEyQkEsVUFBSWQsT0FBSixFQUFhO0FBQ1RBLFFBQUFBLE9BQU8sQ0FBQ2UsS0FBUjtBQUNBLGFBQUs1QixjQUFMLEdBQXNCYSxPQUF0QjtBQUNIO0FBQ0osS0F6UjBCO0FBR3ZCLFNBQUtwQyxLQUFMLEdBQWE7QUFDVEMsTUFBQUEsZUFBZSxFQUFFSixtQ0FBaUJDLFFBQWpCLENBQTBCQyxPQURsQztBQUVUcUQsTUFBQUEsb0JBQW9CLEVBQUUxQyx1QkFBY0MsUUFBZCxDQUF1Qix5QkFBdkIsQ0FGYjtBQUdUckIsTUFBQUEsV0FBVyxFQUFFK0Qsb0JBQVd2RCxRQUFYLENBQW9CUjtBQUh4QixLQUFiOztBQU1BTyx1Q0FBaUJDLFFBQWpCLENBQTBCd0QsRUFBMUIsQ0FBNkJDLHdCQUE3QixFQUEyQyxLQUFLQyxtQkFBaEQ7O0FBQ0FDLDJCQUFjM0QsUUFBZCxDQUF1QndELEVBQXZCLENBQTBCSSxpQ0FBMUIsRUFBOEMsS0FBS0YsbUJBQW5EOztBQUNBakQscUNBQWdCVCxRQUFoQixDQUF5QndELEVBQXpCLENBQTRCQyx3QkFBNUIsRUFBMEMsS0FBS0ksdUJBQS9DOztBQUNBTix3QkFBV3ZELFFBQVgsQ0FBb0J3RCxFQUFwQixDQUF1Qk0saUNBQXZCLEVBQThDLEtBQUtDLGlCQUFuRDs7QUFDQSxTQUFLQyxpQkFBTCxHQUF5QnBELHVCQUFjcUQsWUFBZCxDQUNyQiwwQkFEcUIsRUFDTyxJQURQLEVBQ2EsS0FBS0osdUJBRGxCLENBQXpCO0FBRUEsU0FBS0ssMEJBQUwsR0FBa0N0RCx1QkFBY3FELFlBQWQsQ0FBMkIseUJBQTNCLEVBQXNELElBQXRELEVBQTRELE1BQU07QUFDaEcsV0FBS3hFLFFBQUwsQ0FBYztBQUFDNkQsUUFBQUEsb0JBQW9CLEVBQUUxQyx1QkFBY0MsUUFBZCxDQUF1Qix5QkFBdkI7QUFBdkIsT0FBZDtBQUNILEtBRmlDLENBQWxDLENBZnVCLENBbUJ2QjtBQUNBOztBQUNBLFNBQUt0QixLQUFMLENBQVc0RSxjQUFYLENBQTBCWCxFQUExQixDQUE2Qix5QkFBN0IsRUFBd0QsS0FBS1ksUUFBN0Q7QUFDSDs7QUFFTUMsRUFBQUEsb0JBQVAsR0FBOEI7QUFDMUJ6RCwyQkFBYzBELGNBQWQsQ0FBNkIsS0FBS0osMEJBQWxDOztBQUNBdEQsMkJBQWMwRCxjQUFkLENBQTZCLEtBQUtOLGlCQUFsQzs7QUFDQWpFLHVDQUFpQkMsUUFBakIsQ0FBMEJ1RSxHQUExQixDQUE4QmQsd0JBQTlCLEVBQTRDLEtBQUtDLG1CQUFqRDs7QUFDQUMsMkJBQWMzRCxRQUFkLENBQXVCdUUsR0FBdkIsQ0FBMkJYLGlDQUEzQixFQUErQyxLQUFLRixtQkFBcEQ7O0FBQ0FqRCxxQ0FBZ0JULFFBQWhCLENBQXlCdUUsR0FBekIsQ0FBNkJkLHdCQUE3QixFQUEyQyxLQUFLSSx1QkFBaEQ7O0FBQ0FOLHdCQUFXdkQsUUFBWCxDQUFvQnVFLEdBQXBCLENBQXdCVCxpQ0FBeEIsRUFBK0MsS0FBS0MsaUJBQXBEOztBQUNBLFNBQUt4RSxLQUFMLENBQVc0RSxjQUFYLENBQTBCSSxHQUExQixDQUE4Qix5QkFBOUIsRUFBeUQsS0FBS0gsUUFBOUQ7QUFDSDs7QUFzQ085RCxFQUFBQSxtQkFBUixDQUE0QmlCO0FBQTVCO0FBQUEsSUFBa0Q7QUFDOUMsUUFBSSxLQUFLaUQsb0JBQVQsRUFBK0I7QUFDL0IsU0FBS0Esb0JBQUwsR0FBNEIsSUFBNUI7QUFDQUMsSUFBQUEsTUFBTSxDQUFDQyxxQkFBUCxDQUE2QixNQUFNO0FBQy9CLFdBQUtDLGVBQUwsQ0FBcUJwRCxJQUFyQjtBQUNBLFdBQUtpRCxvQkFBTCxHQUE0QixLQUE1QjtBQUNILEtBSEQ7QUFJSDs7QUFFT0csRUFBQUEsZUFBUixDQUF3QnBEO0FBQXhCO0FBQUEsSUFBOEM7QUFDMUMsVUFBTXFELE9BQU8sR0FBR3JELElBQUksQ0FBQ3NELFNBQXJCO0FBQ0EsVUFBTUMsVUFBVSxHQUFHdkQsSUFBSSxDQUFDd0QsWUFBTCxHQUFvQnhELElBQUksQ0FBQ3NELFNBQTVDO0FBQ0EsVUFBTUcsUUFBUSxHQUFHekQsSUFBSSxDQUFDMEQsZ0JBQUwsQ0FBc0MsNkNBQXRDLENBQWpCO0FBRUEsVUFBTUMsaUJBQWlCLEdBQUcsRUFBMUIsQ0FMMEMsQ0FLWjs7QUFDOUIsVUFBTUMsaUJBQWlCLEdBQUc1RCxJQUFJLENBQUM2RCxXQUFMLEdBQW1CRixpQkFBN0MsQ0FOMEMsQ0FRMUM7QUFDQTs7QUFDQSxVQUFNRyxZQUFZLEdBQUcsSUFBSUMsR0FBSixFQUFyQjtBQU1BLFFBQUlDLGFBQUo7QUFDQSxRQUFJQyxpQkFBSjs7QUFDQSxTQUFLLE1BQU1DLE9BQVgsSUFBc0JULFFBQXRCLEVBQWdDO0FBQzVCLFlBQU1VLE1BQU0sR0FBR0QsT0FBTyxDQUFDdEQsYUFBUixDQUFzQywyQkFBdEMsQ0FBZjtBQUNBdUQsTUFBQUEsTUFBTSxDQUFDeEUsS0FBUCxDQUFhQyxjQUFiLENBQTRCLFNBQTVCLEVBRjRCLENBRVk7QUFFeEM7O0FBQ0EsWUFBTXdFLGVBQWUsR0FBRyxHQUF4QjtBQUNBLFlBQU1DLFFBQVEsR0FBSUgsT0FBTyxDQUFDSSxTQUFSLEdBQXFCRixlQUFlLEdBQUdHLDBCQUF4QyxJQUEyRGxCLE9BQTVFO0FBQ0EsWUFBTW1CLFdBQVcsR0FBSU4sT0FBTyxDQUFDSSxTQUFSLEdBQXFCRixlQUFlLEdBQUdHLDBCQUF4QyxJQUEyRGhCLFVBQS9FOztBQUVBLFVBQUljLFFBQVEsSUFBSUgsT0FBTyxLQUFLVCxRQUFRLENBQUMsQ0FBRCxDQUFwQyxFQUF5QztBQUNyQ0ssUUFBQUEsWUFBWSxDQUFDVyxHQUFiLENBQWlCTixNQUFqQixFQUF5QjtBQUFFTyxVQUFBQSxTQUFTLEVBQUU7QUFBYixTQUF6Qjs7QUFDQSxZQUFJVixhQUFKLEVBQW1CO0FBQ2ZBLFVBQUFBLGFBQWEsQ0FBQ3JFLEtBQWQsQ0FBb0JnRixPQUFwQixHQUE4QixNQUE5QjtBQUNBYixVQUFBQSxZQUFZLENBQUNXLEdBQWIsQ0FBaUJULGFBQWpCLEVBQWdDO0FBQUVZLFlBQUFBLGFBQWEsRUFBRTtBQUFqQixXQUFoQztBQUNIOztBQUNEWixRQUFBQSxhQUFhLEdBQUdHLE1BQWhCO0FBQ0gsT0FQRCxNQU9PLElBQUlLLFdBQVcsSUFBSSxDQUFDUCxpQkFBcEIsRUFBdUM7QUFDMUNILFFBQUFBLFlBQVksQ0FBQ1csR0FBYixDQUFpQk4sTUFBakIsRUFBeUI7QUFBRVUsVUFBQUEsWUFBWSxFQUFFO0FBQWhCLFNBQXpCO0FBQ0FaLFFBQUFBLGlCQUFpQixHQUFHRSxNQUFwQjtBQUNILE9BSE0sTUFHQTtBQUNITCxRQUFBQSxZQUFZLENBQUNXLEdBQWIsQ0FBaUJOLE1BQWpCLEVBQXlCLEVBQXpCLEVBREcsQ0FDMkI7QUFDakM7QUFDSixLQXhDeUMsQ0EwQzFDO0FBQ0E7QUFDQTs7O0FBQ0EsU0FBSyxNQUFNQSxNQUFYLElBQXFCTCxZQUFZLENBQUNnQixJQUFiLEVBQXJCLEVBQTBDO0FBQ3RDLFlBQU1uRixLQUFLLEdBQUdtRSxZQUFZLENBQUNpQixHQUFiLENBQWlCWixNQUFqQixDQUFkOztBQUVBLFVBQUl4RSxLQUFLLENBQUNpRixhQUFWLEVBQXlCO0FBQ3JCO0FBQ0FULFFBQUFBLE1BQU0sQ0FBQ3hFLEtBQVAsQ0FBYWdGLE9BQWIsR0FBdUIsTUFBdkI7QUFDQSxpQkFIcUIsQ0FHWDtBQUNiOztBQUVELFVBQUloRixLQUFLLENBQUMrRSxTQUFWLEVBQXFCO0FBQ2pCLFlBQUksQ0FBQ1AsTUFBTSxDQUFDMUMsU0FBUCxDQUFpQkcsUUFBakIsQ0FBMEIsMENBQTFCLENBQUwsRUFBNEU7QUFDeEV1QyxVQUFBQSxNQUFNLENBQUMxQyxTQUFQLENBQWlCdUQsR0FBakIsQ0FBcUIsMENBQXJCO0FBQ0g7O0FBRUQsY0FBTUMsTUFBTSxHQUFJLEdBQUVqRixJQUFJLENBQUN3QixhQUFMLENBQW1COEMsU0FBVSxJQUEvQzs7QUFDQSxZQUFJSCxNQUFNLENBQUN4RSxLQUFQLENBQWF1RixHQUFiLEtBQXFCRCxNQUF6QixFQUFpQztBQUM3QmQsVUFBQUEsTUFBTSxDQUFDeEUsS0FBUCxDQUFhdUYsR0FBYixHQUFtQkQsTUFBbkI7QUFDSDtBQUNKLE9BVEQsTUFTTztBQUNILFlBQUlkLE1BQU0sQ0FBQzFDLFNBQVAsQ0FBaUJHLFFBQWpCLENBQTBCLDBDQUExQixDQUFKLEVBQTJFO0FBQ3ZFdUMsVUFBQUEsTUFBTSxDQUFDMUMsU0FBUCxDQUFpQjBELE1BQWpCLENBQXdCLDBDQUF4QjtBQUNIOztBQUNELFlBQUloQixNQUFNLENBQUN4RSxLQUFQLENBQWF1RixHQUFqQixFQUFzQjtBQUNsQmYsVUFBQUEsTUFBTSxDQUFDeEUsS0FBUCxDQUFhQyxjQUFiLENBQTRCLEtBQTVCO0FBQ0g7QUFDSjs7QUFFRCxVQUFJRCxLQUFLLENBQUNrRixZQUFWLEVBQXdCO0FBQ3BCLFlBQUksQ0FBQ1YsTUFBTSxDQUFDMUMsU0FBUCxDQUFpQkcsUUFBakIsQ0FBMEIsNkNBQTFCLENBQUwsRUFBK0U7QUFDM0V1QyxVQUFBQSxNQUFNLENBQUMxQyxTQUFQLENBQWlCdUQsR0FBakIsQ0FBcUIsNkNBQXJCO0FBQ0g7O0FBRUQsY0FBTUksTUFBTSxHQUFHbEMsTUFBTSxDQUFDbUMsV0FBUCxJQUFzQnJGLElBQUksQ0FBQ3dCLGFBQUwsQ0FBbUI4QyxTQUFuQixHQUErQnRFLElBQUksQ0FBQ3dCLGFBQUwsQ0FBbUJnQyxZQUF4RSxDQUFmO0FBQ0EsY0FBTThCLFNBQVMsR0FBSSxHQUFFRixNQUFPLElBQTVCOztBQUNBLFlBQUlqQixNQUFNLENBQUN4RSxLQUFQLENBQWE0RixNQUFiLEtBQXdCRCxTQUE1QixFQUF1QztBQUNuQ25CLFVBQUFBLE1BQU0sQ0FBQ3hFLEtBQVAsQ0FBYTRGLE1BQWIsR0FBc0JELFNBQXRCO0FBQ0g7QUFDSixPQVZELE1BVU87QUFDSCxZQUFJbkIsTUFBTSxDQUFDMUMsU0FBUCxDQUFpQkcsUUFBakIsQ0FBMEIsNkNBQTFCLENBQUosRUFBOEU7QUFDMUV1QyxVQUFBQSxNQUFNLENBQUMxQyxTQUFQLENBQWlCMEQsTUFBakIsQ0FBd0IsNkNBQXhCO0FBQ0g7O0FBQ0QsWUFBSWhCLE1BQU0sQ0FBQ3hFLEtBQVAsQ0FBYTRGLE1BQWpCLEVBQXlCO0FBQ3JCcEIsVUFBQUEsTUFBTSxDQUFDeEUsS0FBUCxDQUFhQyxjQUFiLENBQTRCLFFBQTVCO0FBQ0g7QUFDSjs7QUFFRCxVQUFJRCxLQUFLLENBQUMrRSxTQUFOLElBQW1CL0UsS0FBSyxDQUFDa0YsWUFBN0IsRUFBMkM7QUFDdkMsWUFBSSxDQUFDVixNQUFNLENBQUMxQyxTQUFQLENBQWlCRyxRQUFqQixDQUEwQix1Q0FBMUIsQ0FBTCxFQUF5RTtBQUNyRXVDLFVBQUFBLE1BQU0sQ0FBQzFDLFNBQVAsQ0FBaUJ1RCxHQUFqQixDQUFxQix1Q0FBckI7QUFDSDs7QUFFRCxjQUFNUSxRQUFRLEdBQUksR0FBRTVCLGlCQUFrQixJQUF0Qzs7QUFDQSxZQUFJTyxNQUFNLENBQUN4RSxLQUFQLENBQWE4RixLQUFiLEtBQXVCRCxRQUEzQixFQUFxQztBQUNqQ3JCLFVBQUFBLE1BQU0sQ0FBQ3hFLEtBQVAsQ0FBYThGLEtBQWIsR0FBcUJELFFBQXJCO0FBQ0g7QUFDSixPQVRELE1BU08sSUFBSSxDQUFDN0YsS0FBSyxDQUFDK0UsU0FBUCxJQUFvQixDQUFDL0UsS0FBSyxDQUFDa0YsWUFBL0IsRUFBNkM7QUFDaEQsWUFBSVYsTUFBTSxDQUFDMUMsU0FBUCxDQUFpQkcsUUFBakIsQ0FBMEIsdUNBQTFCLENBQUosRUFBd0U7QUFDcEV1QyxVQUFBQSxNQUFNLENBQUMxQyxTQUFQLENBQWlCMEQsTUFBakIsQ0FBd0IsdUNBQXhCO0FBQ0g7O0FBQ0QsWUFBSWhCLE1BQU0sQ0FBQ3hFLEtBQVAsQ0FBYThGLEtBQWpCLEVBQXdCO0FBQ3BCdEIsVUFBQUEsTUFBTSxDQUFDeEUsS0FBUCxDQUFhQyxjQUFiLENBQTRCLE9BQTVCO0FBQ0g7QUFDSjtBQUNKLEtBNUd5QyxDQThHMUM7QUFDQTs7O0FBQ0EsVUFBTThGLFdBQVcsR0FBRzFGLElBQUksQ0FBQ3dCLGFBQXpCLENBaEgwQyxDQWdIRjs7QUFDeEMsUUFBSXdDLGFBQUosRUFBbUI7QUFDZjBCLE1BQUFBLFdBQVcsQ0FBQ2pFLFNBQVosQ0FBc0J1RCxHQUF0QixDQUEwQix3Q0FBMUI7QUFDSCxLQUZELE1BRU87QUFDSFUsTUFBQUEsV0FBVyxDQUFDakUsU0FBWixDQUFzQjBELE1BQXRCLENBQTZCLHdDQUE3QjtBQUNIOztBQUNELFFBQUlsQixpQkFBSixFQUF1QjtBQUNuQnlCLE1BQUFBLFdBQVcsQ0FBQ2pFLFNBQVosQ0FBc0J1RCxHQUF0QixDQUEwQiwyQ0FBMUI7QUFDSCxLQUZELE1BRU87QUFDSFUsTUFBQUEsV0FBVyxDQUFDakUsU0FBWixDQUFzQjBELE1BQXRCLENBQTZCLDJDQUE3QjtBQUNIO0FBQ0o7O0FBaUZPUSxFQUFBQSxZQUFSO0FBQUE7QUFBd0M7QUFDcEMsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLG9CQUFDLGlCQUFEO0FBQVUsTUFBQSxXQUFXLEVBQUUsS0FBSzNILEtBQUwsQ0FBVzRIO0FBQWxDLE1BREosQ0FESjtBQUtIOztBQUVPQyxFQUFBQSxpQkFBUjtBQUFBO0FBQTZDO0FBQ3pDLFFBQUksS0FBS2xILEtBQUwsQ0FBV0MsZUFBWCxJQUE4QixDQUFDLEtBQUtaLEtBQUwsQ0FBVzRILFdBQTlDLEVBQTJEO0FBQ3ZELDBCQUNJLG9CQUFDLDJCQUFEO0FBQ0ksUUFBQSxTQUFTLEVBQUMsd0RBRGQ7QUFFSSxRQUFBLDJCQUEyQixFQUFFLElBRmpDLENBR0k7QUFDQTtBQUpKO0FBS0ksUUFBQSxRQUFRLEVBQUUsQ0FBQztBQUxmLHNCQU9JLG9CQUFDLHdCQUFELE9BUEosQ0FESjtBQVdIO0FBQ0o7O0FBRU9FLEVBQUFBLG1CQUFSO0FBQUE7QUFBK0M7QUFDM0Msd0JBQ0k7QUFDSSxNQUFBLFNBQVMsRUFBQyw4QkFEZDtBQUVJLE1BQUEsT0FBTyxFQUFFLEtBQUtDLE9BRmxCO0FBR0ksTUFBQSxNQUFNLEVBQUUsS0FBS0MsTUFIakI7QUFJSSxNQUFBLFNBQVMsRUFBRSxLQUFLQztBQUpwQixvQkFNSSxvQkFBQyxtQkFBRDtBQUNJLE1BQUEsV0FBVyxFQUFFLEtBQUtqSSxLQUFMLENBQVc0SCxXQUQ1QjtBQUVJLE1BQUEsU0FBUyxFQUFFLEtBQUtLLFNBRnBCO0FBR0ksTUFBQSxZQUFZLEVBQUUsS0FBS0M7QUFIdkIsTUFOSixlQVdJLG9CQUFDLGdDQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUUseUJBQVcsNEJBQVgsRUFBeUM7QUFDaERDLFFBQUFBLGdDQUFnQyxFQUFFLENBQUMsQ0FBQyxLQUFLeEgsS0FBTCxDQUFXVjtBQURDLE9BQXpDLENBRGY7QUFJSSxNQUFBLE9BQU8sRUFBRSxLQUFLbUksU0FKbEI7QUFLSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxlQUFIO0FBTFgsTUFYSixDQURKO0FBcUJIOztBQUVNQyxFQUFBQSxNQUFQO0FBQUE7QUFBaUM7QUFDN0IsUUFBSUMsYUFBSjs7QUFDQSxRQUFJLEtBQUszSCxLQUFMLENBQVdvRCxvQkFBZixFQUFxQztBQUNqQ3VFLE1BQUFBLGFBQWEsZ0JBQ1Q7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJLG9CQUFDLHlCQUFELE9BREosRUFFS2pILHVCQUFjQyxRQUFkLENBQXVCLHFCQUF2QixpQkFBZ0Qsb0JBQUMsMkJBQUQsT0FBaEQsR0FBeUUsSUFGOUUsQ0FESjtBQU1IOztBQUVELFVBQU1pSCxRQUFRLGdCQUFHLG9CQUFDLGlCQUFEO0FBQ2IsTUFBQSxTQUFTLEVBQUUsS0FBS04sU0FESDtBQUViLE1BQUEsY0FBYyxFQUFFLEtBQUtqSSxLQUFMLENBQVc0RSxjQUZkO0FBR2IsTUFBQSxPQUFPLEVBQUUsS0FBS21ELE9BSEQ7QUFJYixNQUFBLE1BQU0sRUFBRSxLQUFLQyxNQUpBO0FBS2IsTUFBQSxXQUFXLEVBQUUsS0FBS2hJLEtBQUwsQ0FBVzRILFdBTFg7QUFNYixNQUFBLFFBQVEsRUFBRSxLQUFLL0MsUUFORjtBQU9iLE1BQUEsV0FBVyxFQUFFLEtBQUtsRSxLQUFMLENBQVdWO0FBUFgsTUFBakI7QUFVQSxVQUFNdUksZ0JBQWdCLEdBQUcseUJBQVc7QUFDaEMsc0JBQWdCLElBRGdCO0FBRWhDLGdDQUEwQixLQUFLeEksS0FBTCxDQUFXNEg7QUFGTCxLQUFYLENBQXpCO0FBS0EsVUFBTWEsZUFBZSxHQUFHLHlCQUNwQixzQ0FEb0IsRUFFcEIsc0JBRm9CLENBQXhCO0FBS0Esd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBRUQ7QUFBaEIsT0FDS0YsYUFETCxlQUVJO0FBQU8sTUFBQSxTQUFTLEVBQUM7QUFBakIsT0FDSyxLQUFLWCxZQUFMLEVBREwsRUFFSyxLQUFLRyxtQkFBTCxFQUZMLEVBR0ssS0FBS0QsaUJBQUwsRUFITCxlQUlJLG9CQUFDLDJCQUFELE9BSkosZUFLSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFDSSxNQUFBLFNBQVMsRUFBRVksZUFEZjtBQUVJLE1BQUEsUUFBUSxFQUFFLEtBQUtDLFFBRm5CO0FBR0ksTUFBQSxHQUFHLEVBQUUsS0FBSzdILGdCQUhkLENBSUk7QUFDQTtBQUxKO0FBTUksTUFBQSxRQUFRLEVBQUUsQ0FBQztBQU5mLE9BUUswSCxRQVJMLENBREosQ0FMSixFQWlCTSxDQUFDLEtBQUt2SSxLQUFMLENBQVc0SCxXQUFaLGlCQUEyQixvQkFBQyx3QkFBRDtBQUFpQixNQUFBLFFBQVEsRUFBRSxLQUFLL0M7QUFBaEMsTUFqQmpDLENBRkosQ0FESjtBQXdCSDs7QUF6WWtFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGNyZWF0ZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IEdyb3VwRmlsdGVyUGFuZWwgZnJvbSBcIi4vR3JvdXBGaWx0ZXJQYW5lbFwiO1xuaW1wb3J0IEN1c3RvbVJvb21UYWdQYW5lbCBmcm9tIFwiLi9DdXN0b21Sb29tVGFnUGFuZWxcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUm9vbUxpc3QgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21MaXN0XCI7XG5pbXBvcnQgeyBIRUFERVJfSEVJR0hUIH0gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21TdWJsaXN0XCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgVXNlck1lbnUgZnJvbSBcIi4vVXNlck1lbnVcIjtcbmltcG9ydCBSb29tU2VhcmNoIGZyb20gXCIuL1Jvb21TZWFyY2hcIjtcbmltcG9ydCBSb29tQnJlYWRjcnVtYnMgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21CcmVhZGNydW1ic1wiO1xuaW1wb3J0IHsgQnJlYWRjcnVtYnNTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQnJlYWRjcnVtYnNTdG9yZVwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUsIHsgTElTVFNfVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IEluZGljYXRvclNjcm9sbGJhciBmcm9tIFwiLi4vc3RydWN0dXJlcy9JbmRpY2F0b3JTY3JvbGxiYXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7IE93blByb2ZpbGVTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvT3duUHJvZmlsZVN0b3JlXCI7XG5pbXBvcnQgUm9vbUxpc3ROdW1SZXN1bHRzIGZyb20gXCIuLi92aWV3cy9yb29tcy9Sb29tTGlzdE51bVJlc3VsdHNcIjtcbmltcG9ydCBMZWZ0UGFuZWxXaWRnZXQgZnJvbSBcIi4vTGVmdFBhbmVsV2lkZ2V0XCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcbmltcG9ydCB7bWVkaWFGcm9tTXhjfSBmcm9tIFwiLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCBTcGFjZVN0b3JlLCB7VVBEQVRFX1NFTEVDVEVEX1NQQUNFfSBmcm9tIFwiLi4vLi4vc3RvcmVzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciwgUm9vbUxpc3RBY3Rpb24gfSBmcm9tIFwiLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGlzTWluaW1pemVkOiBib29sZWFuO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc2hvd0JyZWFkY3J1bWJzOiBib29sZWFuO1xuICAgIHNob3dHcm91cEZpbHRlclBhbmVsOiBib29sZWFuO1xuICAgIGFjdGl2ZVNwYWNlPzogUm9vbTtcbn1cblxuLy8gTGlzdCBvZiBDU1MgY2xhc3NlcyB3aGljaCBzaG91bGQgYmUgaW5jbHVkZWQgaW4ga2V5Ym9hcmQgbmF2aWdhdGlvbiB3aXRoaW4gdGhlIHJvb20gbGlzdFxuY29uc3QgY3NzQ2xhc3NlcyA9IFtcbiAgICBcIm14X1Jvb21TZWFyY2hfaW5wdXRcIixcbiAgICBcIm14X1Jvb21TZWFyY2hfbWluaW1pemVkSGFuZGxlXCIsIC8vIG1pbmltaXplZCA8Um9vbVNlYXJjaCAvPlxuICAgIFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyVGV4dFwiLFxuICAgIFwibXhfUm9vbVRpbGVcIixcbiAgICBcIm14X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uXCIsXG5dO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLkxlZnRQYW5lbFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVmdFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBsaXN0Q29udGFpbmVyUmVmOiBSZWFjdC5SZWZPYmplY3Q8SFRNTERpdkVsZW1lbnQ+ID0gY3JlYXRlUmVmKCk7XG4gICAgcHJpdmF0ZSBncm91cEZpbHRlclBhbmVsV2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgYmdJbWFnZVdhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIGZvY3VzZWRFbGVtZW50ID0gbnVsbDtcbiAgICBwcml2YXRlIGlzRG9pbmdTdGlja3lIZWFkZXJzID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2hvd0JyZWFkY3J1bWJzOiBCcmVhZGNydW1ic1N0b3JlLmluc3RhbmNlLnZpc2libGUsXG4gICAgICAgICAgICBzaG93R3JvdXBGaWx0ZXJQYW5lbDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSgnVGFnUGFuZWwuZW5hYmxlVGFnUGFuZWwnKSxcbiAgICAgICAgICAgIGFjdGl2ZVNwYWNlOiBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9uKExJU1RTX1VQREFURV9FVkVOVCwgdGhpcy5vbkJyZWFkY3J1bWJzVXBkYXRlKTtcbiAgICAgICAgT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vbkJhY2tncm91bmRJbWFnZVVwZGF0ZSk7XG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX1NFTEVDVEVEX1NQQUNFLCB0aGlzLnVwZGF0ZUFjdGl2ZVNwYWNlKTtcbiAgICAgICAgdGhpcy5iZ0ltYWdlV2F0Y2hlclJlZiA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFxuICAgICAgICAgICAgXCJSb29tTGlzdC5iYWNrZ3JvdW5kSW1hZ2VcIiwgbnVsbCwgdGhpcy5vbkJhY2tncm91bmRJbWFnZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuZ3JvdXBGaWx0ZXJQYW5lbFdhdGNoZXJSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcIlRhZ1BhbmVsLmVuYWJsZVRhZ1BhbmVsXCIsIG51bGwsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dHcm91cEZpbHRlclBhbmVsOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiVGFnUGFuZWwuZW5hYmxlVGFnUGFuZWxcIil9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2Ugd2F0Y2ggdGhlIG1pZGRsZSBwYW5lbCBiZWNhdXNlIHdlIGRvbid0IGFjdHVhbGx5IGdldCByZXNpemVkLCB0aGUgbWlkZGxlIHBhbmVsIGRvZXMuXG4gICAgICAgIC8vIFdlIGxpc3RlbiB0byB0aGUgbm9pc3kgY2hhbm5lbCB0byBhdm9pZCBjaG9wcHkgcmVhY3Rpb24gdGltZXMuXG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub24oXCJtaWRkbGVQYW5lbFJlc2l6ZWROb2lzeVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5ncm91cEZpbHRlclBhbmVsV2F0Y2hlclJlZik7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5iZ0ltYWdlV2F0Y2hlclJlZik7XG4gICAgICAgIEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbkJyZWFkY3J1bWJzVXBkYXRlKTtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vZmYoTElTVFNfVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgICAgICBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbkJhY2tncm91bmRJbWFnZVVwZGF0ZSk7XG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9TRUxFQ1RFRF9TUEFDRSwgdGhpcy51cGRhdGVBY3RpdmVTcGFjZSk7XG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub2ZmKFwibWlkZGxlUGFuZWxSZXNpemVkTm9pc3lcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVBY3RpdmVTcGFjZSA9IChhY3RpdmVTcGFjZTogUm9vbSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgYWN0aXZlU3BhY2UgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FeHBsb3JlID0gKCkgPT4ge1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1Jvb21EaXJlY3RvcnkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQnJlYWRjcnVtYnNVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9IEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2UudmlzaWJsZTtcbiAgICAgICAgaWYgKG5ld1ZhbCAhPT0gdGhpcy5zdGF0ZS5zaG93QnJlYWRjcnVtYnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dCcmVhZGNydW1iczogbmV3VmFsfSk7XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgc3RpY2t5IGhlYWRlcnMgdG9vIGFzIHRoZSBicmVhZGNydW1icyB3aWxsIGJlIHBvcHBpbmcgaW4gb3Igb3V0LlxuICAgICAgICAgICAgaWYgKCF0aGlzLmxpc3RDb250YWluZXJSZWYuY3VycmVudCkgcmV0dXJuOyAvLyBpZ25vcmU6IG5vIGhlYWRlcnMgdG8gc3RpY2t5XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnModGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CYWNrZ3JvdW5kSW1hZ2VVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIC8vIE5vdGU6IHdlIGRvIHRoaXMgaW4gdGhlIExlZnRQYW5lbCBhcyBpdCB1c2VzIHRoaXMgdmFyaWFibGUgbW9zdCBwcm9taW5lbnRseS5cbiAgICAgICAgY29uc3QgYXZhdGFyU2l6ZSA9IDMyOyAvLyBhcmJpdHJhcnlcbiAgICAgICAgbGV0IGF2YXRhclVybCA9IE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5nZXRIdHRwQXZhdGFyVXJsKGF2YXRhclNpemUpO1xuICAgICAgICBjb25zdCBzZXR0aW5nQmdNeGMgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUm9vbUxpc3QuYmFja2dyb3VuZEltYWdlXCIpO1xuICAgICAgICBpZiAoc2V0dGluZ0JnTXhjKSB7XG4gICAgICAgICAgICBhdmF0YXJVcmwgPSBtZWRpYUZyb21NeGMoc2V0dGluZ0JnTXhjKS5nZXRTcXVhcmVUaHVtYm5haWxIdHRwKGF2YXRhclNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXZhdGFyVXJsUHJvcCA9IGB1cmwoJHthdmF0YXJVcmx9KWA7XG4gICAgICAgIGlmICghYXZhdGFyVXJsKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiLS1hdmF0YXItdXJsXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmJvZHkuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcIi0tYXZhdGFyLXVybFwiKSAhPT0gYXZhdGFyVXJsUHJvcCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tYXZhdGFyLXVybFwiLCBhdmF0YXJVcmxQcm9wKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGhhbmRsZVN0aWNreUhlYWRlcnMobGlzdDogSFRNTERpdkVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEb2luZ1N0aWNreUhlYWRlcnMpIHJldHVybjtcbiAgICAgICAgdGhpcy5pc0RvaW5nU3RpY2t5SGVhZGVycyA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kb1N0aWNreUhlYWRlcnMobGlzdCk7XG4gICAgICAgICAgICB0aGlzLmlzRG9pbmdTdGlja3lIZWFkZXJzID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZG9TdGlja3lIZWFkZXJzKGxpc3Q6IEhUTUxEaXZFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHRvcEVkZ2UgPSBsaXN0LnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3QgYm90dG9tRWRnZSA9IGxpc3Qub2Zmc2V0SGVpZ2h0ICsgbGlzdC5zY3JvbGxUb3A7XG4gICAgICAgIGNvbnN0IHN1Ymxpc3RzID0gbGlzdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxEaXZFbGVtZW50PihcIi5teF9Sb29tU3VibGlzdDpub3QoLm14X1Jvb21TdWJsaXN0X2hpZGRlbilcIik7XG5cbiAgICAgICAgY29uc3QgaGVhZGVyUmlnaHRNYXJnaW4gPSAxNTsgLy8gY2FsY3VsYXRlZCBmcm9tIG1hcmdpbnMgYW5kIHdpZHRocyB0byBhbGlnbiB3aXRoIG5vbi1zdGlja3kgdGlsZXNcbiAgICAgICAgY29uc3QgaGVhZGVyU3RpY2t5V2lkdGggPSBsaXN0LmNsaWVudFdpZHRoIC0gaGVhZGVyUmlnaHRNYXJnaW47XG5cbiAgICAgICAgLy8gV2UgdHJhY2sgd2hpY2ggc3R5bGVzIHdlIHdhbnQgb24gYSB0YXJnZXQgYmVmb3JlIG1ha2luZyB0aGUgY2hhbmdlcyB0byBhdm9pZFxuICAgICAgICAvLyBleGNlc3NpdmUgbGF5b3V0IHVwZGF0ZXMuXG4gICAgICAgIGNvbnN0IHRhcmdldFN0eWxlcyA9IG5ldyBNYXA8SFRNTERpdkVsZW1lbnQsIHtcbiAgICAgICAgICAgIHN0aWNreVRvcD86IGJvb2xlYW47XG4gICAgICAgICAgICBzdGlja3lCb3R0b20/OiBib29sZWFuO1xuICAgICAgICAgICAgbWFrZUludmlzaWJsZT86IGJvb2xlYW47XG4gICAgICAgIH0+KCk7XG5cbiAgICAgICAgbGV0IGxhc3RUb3BIZWFkZXI7XG4gICAgICAgIGxldCBmaXJzdEJvdHRvbUhlYWRlcjtcbiAgICAgICAgZm9yIChjb25zdCBzdWJsaXN0IG9mIHN1Ymxpc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBzdWJsaXN0LnF1ZXJ5U2VsZWN0b3I8SFRNTERpdkVsZW1lbnQ+KFwiLm14X1Jvb21TdWJsaXN0X3N0aWNrYWJsZVwiKTtcbiAgICAgICAgICAgIGhlYWRlci5zdHlsZS5yZW1vdmVQcm9wZXJ0eShcImRpc3BsYXlcIik7IC8vIGFsd2F5cyBjbGVhciBkaXNwbGF5Om5vbmUgZmlyc3RcblxuICAgICAgICAgICAgLy8gV2hlbiBhbiBlbGVtZW50IGlzIDw9NDAlIG9mZiBzY3JlZW4sIG1ha2UgaXQgdGFrZSBvdmVyXG4gICAgICAgICAgICBjb25zdCBvZmZTY3JlZW5GYWN0b3IgPSAwLjQ7XG4gICAgICAgICAgICBjb25zdCBpc09mZlRvcCA9IChzdWJsaXN0Lm9mZnNldFRvcCArIChvZmZTY3JlZW5GYWN0b3IgKiBIRUFERVJfSEVJR0hUKSkgPD0gdG9wRWRnZTtcbiAgICAgICAgICAgIGNvbnN0IGlzT2ZmQm90dG9tID0gKHN1Ymxpc3Qub2Zmc2V0VG9wICsgKG9mZlNjcmVlbkZhY3RvciAqIEhFQURFUl9IRUlHSFQpKSA+PSBib3R0b21FZGdlO1xuXG4gICAgICAgICAgICBpZiAoaXNPZmZUb3AgfHwgc3VibGlzdCA9PT0gc3VibGlzdHNbMF0pIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTdHlsZXMuc2V0KGhlYWRlciwgeyBzdGlja3lUb3A6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb3BIZWFkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRvcEhlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFN0eWxlcy5zZXQobGFzdFRvcEhlYWRlciwgeyBtYWtlSW52aXNpYmxlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXN0VG9wSGVhZGVyID0gaGVhZGVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc09mZkJvdHRvbSAmJiAhZmlyc3RCb3R0b21IZWFkZXIpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTdHlsZXMuc2V0KGhlYWRlciwgeyBzdGlja3lCb3R0b206IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgZmlyc3RCb3R0b21IZWFkZXIgPSBoZWFkZXI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFN0eWxlcy5zZXQoaGVhZGVyLCB7fSk7IC8vIG5vdGhpbmcgPT0gY2xlYXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJ1biBvdmVyIHRoZSBzdHlsZSBjaGFuZ2VzIGFuZCBtYWtlIHRoZW0gcmVhbGl0eS4gV2UgY2hlY2sgdG8gc2VlIGlmIHdlJ3JlIGFib3V0IHRvXG4gICAgICAgIC8vIGNhdXNlIGEgbm8tb3AgdXBkYXRlLCBhcyBhZGRpbmcvcmVtb3ZpbmcgcHJvcGVydGllcyB0aGF0IGFyZS9hcmVuJ3QgdGhlcmUgY2F1c2VcbiAgICAgICAgLy8gbGF5b3V0IHVwZGF0ZXMuXG4gICAgICAgIGZvciAoY29uc3QgaGVhZGVyIG9mIHRhcmdldFN0eWxlcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gdGFyZ2V0U3R5bGVzLmdldChoZWFkZXIpO1xuXG4gICAgICAgICAgICBpZiAoc3R5bGUubWFrZUludmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIC8vIHdlIHdpbGwgaGF2ZSBhbHJlYWR5IHJlbW92ZWQgdGhlICdkaXNwbGF5OiBub25lJywgc28gYWRkIGl0IGJhY2suXG4gICAgICAgICAgICAgICAgaGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gbm90aGluZyBlbHNlIHRvIGRvLCBldmVuIGlmIHN0aWNreSBzb21laG93XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdHlsZS5zdGlja3lUb3ApIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhlYWRlci5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5VG9wXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVRvcFwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdUb3AgPSBgJHtsaXN0LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wfXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLnRvcCAhPT0gbmV3VG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5zdHlsZS50b3AgPSBuZXdUb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lUb3BcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5VG9wXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLnRvcCkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RvcCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0eWxlLnN0aWNreUJvdHRvbSkge1xuICAgICAgICAgICAgICAgIGlmICghaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lCb3R0b21cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5Qm90dG9tXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIChsaXN0LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wICsgbGlzdC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Qm90dG9tID0gYCR7b2Zmc2V0fXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLmJvdHRvbSAhPT0gbmV3Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5zdHlsZS5ib3R0b20gPSBuZXdCb3R0b207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lCb3R0b21cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5Qm90dG9tXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLmJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JvdHRvbScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0eWxlLnN0aWNreVRvcCB8fCBzdHlsZS5zdGlja3lCb3R0b20pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhlYWRlci5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IGAke2hlYWRlclN0aWNreVdpZHRofXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLndpZHRoICE9PSBuZXdXaWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUud2lkdGggPSBuZXdXaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdHlsZS5zdGlja3lUb3AgJiYgIXN0eWxlLnN0aWNreUJvdHRvbSkge1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZShcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuc3R5bGUud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLnN0eWxlLnJlbW92ZVByb3BlcnR5KCd3aWR0aCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBhcHByb3ByaWF0ZSBzdGlja3kgY2xhc3NlcyB0byB3cmFwcGVyIHNvIGl0IGhhc1xuICAgICAgICAvLyB0aGUgbmVjZXNzYXJ5IHRvcC9ib3R0b20gcGFkZGluZyB0byBwdXQgdGhlIHN0aWNreSBoZWFkZXIgaW5cbiAgICAgICAgY29uc3QgbGlzdFdyYXBwZXIgPSBsaXN0LnBhcmVudEVsZW1lbnQ7IC8vIC5teF9MZWZ0UGFuZWxfcm9vbUxpc3RXcmFwcGVyXG4gICAgICAgIGlmIChsYXN0VG9wSGVhZGVyKSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lUb3BcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lUb3BcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpcnN0Qm90dG9tSGVhZGVyKSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lCb3R0b21cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lCb3R0b21cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2Nyb2xsID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PikgPT4ge1xuICAgICAgICBjb25zdCBsaXN0ID0gZXYudGFyZ2V0IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnMobGlzdCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpIHJldHVybjsgLy8gaWdub3JlOiBubyBoZWFkZXJzIHRvIHN0aWNreVxuICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnModGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9jdXMgPSAoZXY6IFJlYWN0LkZvY3VzRXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c2VkRWxlbWVudCA9IGV2LnRhcmdldDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkJsdXIgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9jdXNlZEVsZW1lbnQgPSBudWxsO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZm9jdXNlZEVsZW1lbnQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRSb29tTGlzdEFjdGlvbihldik7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFJvb21MaXN0QWN0aW9uLk5leHRSb29tOlxuICAgICAgICAgICAgY2FzZSBSb29tTGlzdEFjdGlvbi5QcmV2Um9vbTpcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMub25Nb3ZlRm9jdXMoYWN0aW9uID09PSBSb29tTGlzdEFjdGlvbi5QcmV2Um9vbSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZWxlY3RSb29tID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBmaXJzdFJvb20gPSB0aGlzLmxpc3RDb250YWluZXJSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yPEhUTUxEaXZFbGVtZW50PihcIi5teF9Sb29tVGlsZVwiKTtcbiAgICAgICAgaWYgKGZpcnN0Um9vbSkge1xuICAgICAgICAgICAgZmlyc3RSb29tLmNsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gdG8gZ2V0IHRoZSBmaWVsZCB0byBjbGVhclxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Nb3ZlRm9jdXMgPSAodXA6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmZvY3VzZWRFbGVtZW50O1xuXG4gICAgICAgIGxldCBkZXNjZW5kaW5nID0gZmFsc2U7IC8vIGFyZSB3ZSBjdXJyZW50bHkgZGVzY2VuZGluZyBvciBhc2NlbmRpbmcgdGhyb3VnaCB0aGUgRE9NIHRyZWU/XG4gICAgICAgIGxldCBjbGFzc2VzOiBET01Ub2tlbkxpc3Q7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB1cCA/IGVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZCA6IGVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgICAgICBjb25zdCBzaWJsaW5nID0gdXAgPyBlbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBlbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcblxuICAgICAgICAgICAgaWYgKGRlc2NlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGNoaWxkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2libGluZykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gc2libGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZXNjZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc2libGluZykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gc2libGluZztcbiAgICAgICAgICAgICAgICAgICAgZGVzY2VuZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NMaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChlbGVtZW50ICYmICghY3NzQ2xhc3Nlcy5zb21lKGMgPT4gY2xhc3Nlcy5jb250YWlucyhjKSkgfHwgZWxlbWVudC5vZmZzZXRQYXJlbnQgPT09IG51bGwpKTtcblxuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5mb2N1c2VkRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJIZWFkZXIoKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVmdFBhbmVsX3VzZXJIZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8VXNlck1lbnUgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckJyZWFkY3J1bWJzKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dCcmVhZGNydW1icyAmJiAhdGhpcy5wcm9wcy5pc01pbmltaXplZCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8SW5kaWNhdG9yU2Nyb2xsYmFyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF9icmVhZGNydW1ic0NvbnRhaW5lciBteF9BdXRvSGlkZVNjcm9sbGJhclwiXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsU2Nyb2xsc0hvcml6b250YWxseT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBzb21ldGltZXMgbWFrZXMgdGhpcyBlbGVtZW50IGZvY3VzYWJsZSBkdWUgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcmZsb3c6c2Nyb2xsOywgc28gZm9yY2UgaXQgb3V0IG9mIHRhYiBvcmRlci5cbiAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFJvb21CcmVhZGNydW1icyAvPlxuICAgICAgICAgICAgICAgIDwvSW5kaWNhdG9yU2Nyb2xsYmFyPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyU2VhcmNoRXhwbG9yZSgpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF9maWx0ZXJDb250YWluZXJcIlxuICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25CbHVyfVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFJvb21TZWFyY2hcbiAgICAgICAgICAgICAgICAgICAgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbktleURvd259XG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0Um9vbT17dGhpcy5zZWxlY3RSb29tfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0xlZnRQYW5lbF9leHBsb3JlQnV0dG9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG14X0xlZnRQYW5lbF9leHBsb3JlQnV0dG9uX3NwYWNlOiAhIXRoaXMuc3RhdGUuYWN0aXZlU3BhY2UsXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRXhwbG9yZX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiRXhwbG9yZSByb29tc1wiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICBsZXQgbGVmdExlZnRQYW5lbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd0dyb3VwRmlsdGVyUGFuZWwpIHtcbiAgICAgICAgICAgIGxlZnRMZWZ0UGFuZWwgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfR3JvdXBGaWx0ZXJQYW5lbENvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8R3JvdXBGaWx0ZXJQYW5lbCAvPlxuICAgICAgICAgICAgICAgICAgICB7U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfY3VzdG9tX3RhZ3NcIikgPyA8Q3VzdG9tUm9vbVRhZ1BhbmVsIC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tTGlzdCA9IDxSb29tTGlzdFxuICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vbkZvY3VzfVxuICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQmx1cn1cbiAgICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgb25SZXNpemU9e3RoaXMub25SZXNpemV9XG4gICAgICAgICAgICBhY3RpdmVTcGFjZT17dGhpcy5zdGF0ZS5hY3RpdmVTcGFjZX1cbiAgICAgICAgLz47XG5cbiAgICAgICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgXCJteF9MZWZ0UGFuZWxcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfTGVmdFBhbmVsX21pbmltaXplZFwiOiB0aGlzLnByb3BzLmlzTWluaW1pemVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByb29tTGlzdENsYXNzZXMgPSBjbGFzc05hbWVzKFxuICAgICAgICAgICAgXCJteF9MZWZ0UGFuZWxfYWN0dWFsUm9vbUxpc3RDb250YWluZXJcIixcbiAgICAgICAgICAgIFwibXhfQXV0b0hpZGVTY3JvbGxiYXJcIixcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzZXN9PlxuICAgICAgICAgICAgICAgIHtsZWZ0TGVmdFBhbmVsfVxuICAgICAgICAgICAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfcm9vbUxpc3RDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVySGVhZGVyKCl9XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlclNlYXJjaEV4cGxvcmUoKX1cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyQnJlYWRjcnVtYnMoKX1cbiAgICAgICAgICAgICAgICAgICAgPFJvb21MaXN0TnVtUmVzdWx0cyAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF9yb29tTGlzdFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3Jvb21MaXN0Q2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNjcm9sbD17dGhpcy5vblNjcm9sbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMubGlzdENvbnRhaW5lclJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IHNvbWV0aW1lcyBtYWtlcyB0aGlzIGVsZW1lbnQgZm9jdXNhYmxlIGR1ZSB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG92ZXJmbG93OnNjcm9sbDssIHNvIGZvcmNlIGl0IG91dCBvZiB0YWIgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb29tTGlzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyAhdGhpcy5wcm9wcy5pc01pbmltaXplZCAmJiA8TGVmdFBhbmVsV2lkZ2V0IG9uUmVzaXplPXt0aGlzLm9uUmVzaXplfSAvPiB9XG4gICAgICAgICAgICAgICAgPC9hc2lkZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==