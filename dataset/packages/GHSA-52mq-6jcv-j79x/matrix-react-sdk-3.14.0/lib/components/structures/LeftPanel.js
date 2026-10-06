"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _GroupFilterPanel = _interopRequireDefault(require("./GroupFilterPanel"));

var _CustomRoomTagPanel = _interopRequireDefault(require("./CustomRoomTagPanel"));

var _classnames = _interopRequireDefault(require("classnames"));

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

var _Keyboard = require("../../Keyboard");

var _IndicatorScrollbar = _interopRequireDefault(require("../structures/IndicatorScrollbar"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../views/elements/AccessibleTooltipButton"));

var _OwnProfileStore = require("../../stores/OwnProfileStore");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _RoomListNumResults = _interopRequireDefault(require("../views/rooms/RoomListNumResults"));

var _LeftPanelWidget = _interopRequireDefault(require("./LeftPanelWidget"));

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
// List of CSS classes which should be included in keyboard navigation within the room list
const cssClasses = ["mx_RoomSearch_input", "mx_RoomSearch_minimizedHandle", // minimized <RoomSearch />
"mx_RoomSublist_headerText", "mx_RoomTile", "mx_RoomSublist_showNButton"];

class LeftPanel extends React.Component
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
        avatarUrl = _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(settingBgMxc, avatarSize, avatarSize);
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

      switch (ev.key) {
        case _Keyboard.Key.ARROW_UP:
        case _Keyboard.Key.ARROW_DOWN:
          ev.stopPropagation();
          ev.preventDefault();
          this.onMoveFocus(ev.key === _Keyboard.Key.ARROW_UP);
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onEnter", () => {
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
      } while (element && !cssClasses.some(c => classes.contains(c)));

      if (element) {
        element.focus();
        this.focusedElement = element;
      }
    });
    this.state = {
      showBreadcrumbs: _BreadcrumbsStore.BreadcrumbsStore.instance.visible,
      showGroupFilterPanel: _SettingsStore.default.getValue('TagPanel.enableTagPanel')
    };

    _BreadcrumbsStore.BreadcrumbsStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.onBreadcrumbsUpdate);

    _OwnProfileStore.OwnProfileStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onBackgroundImageUpdate);

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
    const sublists = list.querySelectorAll(".mx_RoomSublist");
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
      onVerticalArrow: this.onKeyDown,
      onEnter: this.onEnter
    }), /*#__PURE__*/React.createElement(_AccessibleTooltipButton.default, {
      className: "mx_LeftPanel_exploreButton",
      onClick: this.onExplore,
      title: (0, _languageHandler._t)("Explore rooms")
    }));
  }

  render()
  /*: React.ReactNode*/
  {
    const groupFilterPanel = !this.state.showGroupFilterPanel ? null : /*#__PURE__*/React.createElement("div", {
      className: "mx_LeftPanel_GroupFilterPanelContainer"
    }, /*#__PURE__*/React.createElement(_GroupFilterPanel.default, null), _SettingsStore.default.getValue("feature_custom_tags") ? /*#__PURE__*/React.createElement(_CustomRoomTagPanel.default, null) : null);
    const roomList = /*#__PURE__*/React.createElement(_RoomList.default, {
      onKeyDown: this.onKeyDown,
      resizeNotifier: null,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      isMinimized: this.props.isMinimized,
      onResize: this.onResize
    });
    const containerClasses = (0, _classnames.default)({
      "mx_LeftPanel": true,
      "mx_LeftPanel_hasGroupFilterPanel": !!groupFilterPanel,
      "mx_LeftPanel_minimized": this.props.isMinimized
    });
    const roomListClasses = (0, _classnames.default)("mx_LeftPanel_actualRoomListContainer", "mx_AutoHideScrollbar");
    return /*#__PURE__*/React.createElement("div", {
      className: containerClasses
    }, groupFilterPanel, /*#__PURE__*/React.createElement("aside", {
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

}

exports.default = LeftPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTGVmdFBhbmVsLnRzeCJdLCJuYW1lcyI6WyJjc3NDbGFzc2VzIiwiTGVmdFBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZGlzIiwiZmlyZSIsIkFjdGlvbiIsIlZpZXdSb29tRGlyZWN0b3J5IiwibmV3VmFsIiwiQnJlYWRjcnVtYnNTdG9yZSIsImluc3RhbmNlIiwidmlzaWJsZSIsInN0YXRlIiwic2hvd0JyZWFkY3J1bWJzIiwic2V0U3RhdGUiLCJsaXN0Q29udGFpbmVyUmVmIiwiY3VycmVudCIsImhhbmRsZVN0aWNreUhlYWRlcnMiLCJhdmF0YXJTaXplIiwiYXZhdGFyVXJsIiwiT3duUHJvZmlsZVN0b3JlIiwiZ2V0SHR0cEF2YXRhclVybCIsInNldHRpbmdCZ014YyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm14Y1VybFRvSHR0cCIsImF2YXRhclVybFByb3AiLCJkb2N1bWVudCIsImJvZHkiLCJzdHlsZSIsInJlbW92ZVByb3BlcnR5IiwiZ2V0UHJvcGVydHlWYWx1ZSIsInNldFByb3BlcnR5IiwiZXYiLCJsaXN0IiwidGFyZ2V0IiwiZm9jdXNlZEVsZW1lbnQiLCJrZXkiLCJLZXkiLCJBUlJPV19VUCIsIkFSUk9XX0RPV04iLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIm9uTW92ZUZvY3VzIiwiZmlyc3RSb29tIiwicXVlcnlTZWxlY3RvciIsImNsaWNrIiwidXAiLCJlbGVtZW50IiwiZGVzY2VuZGluZyIsImNsYXNzZXMiLCJjaGlsZCIsImxhc3RFbGVtZW50Q2hpbGQiLCJmaXJzdEVsZW1lbnRDaGlsZCIsInNpYmxpbmciLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwicGFyZW50RWxlbWVudCIsImNsYXNzTGlzdCIsInNvbWUiLCJjIiwiY29udGFpbnMiLCJmb2N1cyIsInNob3dHcm91cEZpbHRlclBhbmVsIiwib24iLCJVUERBVEVfRVZFTlQiLCJvbkJyZWFkY3J1bWJzVXBkYXRlIiwiUm9vbUxpc3RTdG9yZSIsIkxJU1RTX1VQREFURV9FVkVOVCIsIm9uQmFja2dyb3VuZEltYWdlVXBkYXRlIiwiYmdJbWFnZVdhdGNoZXJSZWYiLCJ3YXRjaFNldHRpbmciLCJncm91cEZpbHRlclBhbmVsV2F0Y2hlclJlZiIsInJlc2l6ZU5vdGlmaWVyIiwib25SZXNpemUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVud2F0Y2hTZXR0aW5nIiwib2ZmIiwiaXNEb2luZ1N0aWNreUhlYWRlcnMiLCJ3aW5kb3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJkb1N0aWNreUhlYWRlcnMiLCJ0b3BFZGdlIiwic2Nyb2xsVG9wIiwiYm90dG9tRWRnZSIsIm9mZnNldEhlaWdodCIsInN1Ymxpc3RzIiwicXVlcnlTZWxlY3RvckFsbCIsImhlYWRlclJpZ2h0TWFyZ2luIiwiaGVhZGVyU3RpY2t5V2lkdGgiLCJjbGllbnRXaWR0aCIsInRhcmdldFN0eWxlcyIsIk1hcCIsImxhc3RUb3BIZWFkZXIiLCJmaXJzdEJvdHRvbUhlYWRlciIsInN1Ymxpc3QiLCJoZWFkZXIiLCJvZmZTY3JlZW5GYWN0b3IiLCJpc09mZlRvcCIsIm9mZnNldFRvcCIsIkhFQURFUl9IRUlHSFQiLCJpc09mZkJvdHRvbSIsInNldCIsInN0aWNreVRvcCIsImRpc3BsYXkiLCJtYWtlSW52aXNpYmxlIiwic3RpY2t5Qm90dG9tIiwia2V5cyIsImFkZCIsIm5ld1RvcCIsInRvcCIsInJlbW92ZSIsIm9mZnNldCIsImlubmVySGVpZ2h0IiwibmV3Qm90dG9tIiwiYm90dG9tIiwibmV3V2lkdGgiLCJ3aWR0aCIsImxpc3RXcmFwcGVyIiwicmVuZGVySGVhZGVyIiwiaXNNaW5pbWl6ZWQiLCJyZW5kZXJCcmVhZGNydW1icyIsInJlbmRlclNlYXJjaEV4cGxvcmUiLCJvbkZvY3VzIiwib25CbHVyIiwib25LZXlEb3duIiwib25FbnRlciIsIm9uRXhwbG9yZSIsInJlbmRlciIsImdyb3VwRmlsdGVyUGFuZWwiLCJyb29tTGlzdCIsImNvbnRhaW5lckNsYXNzZXMiLCJyb29tTGlzdENsYXNzZXMiLCJvblNjcm9sbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBc0NBO0FBQ0EsTUFBTUEsVUFBVSxHQUFHLENBQ2YscUJBRGUsRUFFZiwrQkFGZSxFQUVrQjtBQUNqQywyQkFIZSxFQUlmLGFBSmUsRUFLZiw0QkFMZSxDQUFuQjs7QUFRZSxNQUFNQyxTQUFOLFNBQXdCQyxLQUFLLENBQUNDO0FBQTlCO0FBQXdEO0FBT25FQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFnQjtBQUN2QixVQUFNQSxLQUFOO0FBRHVCLHlFQU5pQyxzQkFNakM7QUFBQTtBQUFBO0FBQUEsMERBSEYsSUFHRTtBQUFBLGdFQUZJLEtBRUo7QUFBQSxxREErQlAsTUFBTTtBQUN0QkMsMEJBQUlDLElBQUosQ0FBU0MsZ0JBQU9DLGlCQUFoQjtBQUNILEtBakMwQjtBQUFBLCtEQW1DRyxNQUFNO0FBQ2hDLFlBQU1DLE1BQU0sR0FBR0MsbUNBQWlCQyxRQUFqQixDQUEwQkMsT0FBekM7O0FBQ0EsVUFBSUgsTUFBTSxLQUFLLEtBQUtJLEtBQUwsQ0FBV0MsZUFBMUIsRUFBMkM7QUFDdkMsYUFBS0MsUUFBTCxDQUFjO0FBQUNELFVBQUFBLGVBQWUsRUFBRUw7QUFBbEIsU0FBZCxFQUR1QyxDQUd2Qzs7QUFDQSxZQUFJLENBQUMsS0FBS08sZ0JBQUwsQ0FBc0JDLE9BQTNCLEVBQW9DLE9BSkcsQ0FJSzs7QUFDNUMsYUFBS0MsbUJBQUwsQ0FBeUIsS0FBS0YsZ0JBQUwsQ0FBc0JDLE9BQS9DO0FBQ0g7QUFDSixLQTVDMEI7QUFBQSxtRUE4Q08sTUFBTTtBQUNwQztBQUNBLFlBQU1FLFVBQVUsR0FBRyxFQUFuQixDQUZvQyxDQUViOztBQUN2QixVQUFJQyxTQUFTLEdBQUdDLGlDQUFnQlYsUUFBaEIsQ0FBeUJXLGdCQUF6QixDQUEwQ0gsVUFBMUMsQ0FBaEI7O0FBQ0EsWUFBTUksWUFBWSxHQUFHQyx1QkFBY0MsUUFBZCxDQUF1QiwwQkFBdkIsQ0FBckI7O0FBQ0EsVUFBSUYsWUFBSixFQUFrQjtBQUNkSCxRQUFBQSxTQUFTLEdBQUdNLGlDQUFnQkMsR0FBaEIsR0FBc0JDLFlBQXRCLENBQW1DTCxZQUFuQyxFQUFpREosVUFBakQsRUFBNkRBLFVBQTdELENBQVo7QUFDSDs7QUFFRCxZQUFNVSxhQUFhLEdBQUksT0FBTVQsU0FBVSxHQUF2Qzs7QUFDQSxVQUFJLENBQUNBLFNBQUwsRUFBZ0I7QUFDWlUsUUFBQUEsUUFBUSxDQUFDQyxJQUFULENBQWNDLEtBQWQsQ0FBb0JDLGNBQXBCLENBQW1DLGNBQW5DO0FBQ0gsT0FGRCxNQUVPLElBQUlILFFBQVEsQ0FBQ0MsSUFBVCxDQUFjQyxLQUFkLENBQW9CRSxnQkFBcEIsQ0FBcUMsY0FBckMsTUFBeURMLGFBQTdELEVBQTRFO0FBQy9FQyxRQUFBQSxRQUFRLENBQUNDLElBQVQsQ0FBY0MsS0FBZCxDQUFvQkcsV0FBcEIsQ0FBZ0MsY0FBaEMsRUFBZ0ROLGFBQWhEO0FBQ0g7QUFDSixLQTdEMEI7QUFBQSxvREFxTVIsQ0FBQ087QUFBRDtBQUFBLFNBQTBDO0FBQ3pELFlBQU1DLElBQUksR0FBR0QsRUFBRSxDQUFDRSxNQUFoQjtBQUNBLFdBQUtwQixtQkFBTCxDQUF5Qm1CLElBQXpCO0FBQ0gsS0F4TTBCO0FBQUEsb0RBME1SLE1BQU07QUFDckIsVUFBSSxDQUFDLEtBQUtyQixnQkFBTCxDQUFzQkMsT0FBM0IsRUFBb0MsT0FEZixDQUN1Qjs7QUFDNUMsV0FBS0MsbUJBQUwsQ0FBeUIsS0FBS0YsZ0JBQUwsQ0FBc0JDLE9BQS9DO0FBQ0gsS0E3TTBCO0FBQUEsbURBK01ULENBQUNtQjtBQUFEO0FBQUEsU0FBMEI7QUFDeEMsV0FBS0csY0FBTCxHQUFzQkgsRUFBRSxDQUFDRSxNQUF6QjtBQUNILEtBak4wQjtBQUFBLGtEQW1OVixNQUFNO0FBQ25CLFdBQUtDLGNBQUwsR0FBc0IsSUFBdEI7QUFDSCxLQXJOMEI7QUFBQSxxREF1TlAsQ0FBQ0g7QUFBRDtBQUFBLFNBQTZCO0FBQzdDLFVBQUksQ0FBQyxLQUFLRyxjQUFWLEVBQTBCOztBQUUxQixjQUFRSCxFQUFFLENBQUNJLEdBQVg7QUFDSSxhQUFLQyxjQUFJQyxRQUFUO0FBQ0EsYUFBS0QsY0FBSUUsVUFBVDtBQUNJUCxVQUFBQSxFQUFFLENBQUNRLGVBQUg7QUFDQVIsVUFBQUEsRUFBRSxDQUFDUyxjQUFIO0FBQ0EsZUFBS0MsV0FBTCxDQUFpQlYsRUFBRSxDQUFDSSxHQUFILEtBQVdDLGNBQUlDLFFBQWhDO0FBQ0E7QUFOUjtBQVFILEtBbE8wQjtBQUFBLG1EQW9PVCxNQUFNO0FBQ3BCLFlBQU1LLFNBQVMsR0FBRyxLQUFLL0IsZ0JBQUwsQ0FBc0JDLE9BQXRCLENBQThCK0IsYUFBOUIsQ0FBNEQsY0FBNUQsQ0FBbEI7O0FBQ0EsVUFBSUQsU0FBSixFQUFlO0FBQ1hBLFFBQUFBLFNBQVMsQ0FBQ0UsS0FBVjtBQUNBLGVBQU8sSUFBUCxDQUZXLENBRUU7QUFDaEI7QUFDSixLQTFPMEI7QUFBQSx1REE0T0wsQ0FBQ0M7QUFBRDtBQUFBLFNBQWlCO0FBQ25DLFVBQUlDLE9BQU8sR0FBRyxLQUFLWixjQUFuQjtBQUVBLFVBQUlhLFVBQVUsR0FBRyxLQUFqQixDQUhtQyxDQUdYOztBQUN4QixVQUFJQztBQUFxQjtBQUF6Qjs7QUFFQSxTQUFHO0FBQ0MsY0FBTUMsS0FBSyxHQUFHSixFQUFFLEdBQUdDLE9BQU8sQ0FBQ0ksZ0JBQVgsR0FBOEJKLE9BQU8sQ0FBQ0ssaUJBQXREO0FBQ0EsY0FBTUMsT0FBTyxHQUFHUCxFQUFFLEdBQUdDLE9BQU8sQ0FBQ08sc0JBQVgsR0FBb0NQLE9BQU8sQ0FBQ1Esa0JBQTlEOztBQUVBLFlBQUlQLFVBQUosRUFBZ0I7QUFDWixjQUFJRSxLQUFKLEVBQVc7QUFDUEgsWUFBQUEsT0FBTyxHQUFHRyxLQUFWO0FBQ0gsV0FGRCxNQUVPLElBQUlHLE9BQUosRUFBYTtBQUNoQk4sWUFBQUEsT0FBTyxHQUFHTSxPQUFWO0FBQ0gsV0FGTSxNQUVBO0FBQ0hMLFlBQUFBLFVBQVUsR0FBRyxLQUFiO0FBQ0FELFlBQUFBLE9BQU8sR0FBR0EsT0FBTyxDQUFDUyxhQUFsQjtBQUNIO0FBQ0osU0FURCxNQVNPO0FBQ0gsY0FBSUgsT0FBSixFQUFhO0FBQ1ROLFlBQUFBLE9BQU8sR0FBR00sT0FBVjtBQUNBTCxZQUFBQSxVQUFVLEdBQUcsSUFBYjtBQUNILFdBSEQsTUFHTztBQUNIRCxZQUFBQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQ1MsYUFBbEI7QUFDSDtBQUNKOztBQUVELFlBQUlULE9BQUosRUFBYTtBQUNURSxVQUFBQSxPQUFPLEdBQUdGLE9BQU8sQ0FBQ1UsU0FBbEI7QUFDSDtBQUNKLE9BekJELFFBeUJTVixPQUFPLElBQUksQ0FBQ3BELFVBQVUsQ0FBQytELElBQVgsQ0FBZ0JDLENBQUMsSUFBSVYsT0FBTyxDQUFDVyxRQUFSLENBQWlCRCxDQUFqQixDQUFyQixDQXpCckI7O0FBMkJBLFVBQUlaLE9BQUosRUFBYTtBQUNUQSxRQUFBQSxPQUFPLENBQUNjLEtBQVI7QUFDQSxhQUFLMUIsY0FBTCxHQUFzQlksT0FBdEI7QUFDSDtBQUNKLEtBalIwQjtBQUd2QixTQUFLdEMsS0FBTCxHQUFhO0FBQ1RDLE1BQUFBLGVBQWUsRUFBRUosbUNBQWlCQyxRQUFqQixDQUEwQkMsT0FEbEM7QUFFVHNELE1BQUFBLG9CQUFvQixFQUFFMUMsdUJBQWNDLFFBQWQsQ0FBdUIseUJBQXZCO0FBRmIsS0FBYjs7QUFLQWYsdUNBQWlCQyxRQUFqQixDQUEwQndELEVBQTFCLENBQTZCQyx3QkFBN0IsRUFBMkMsS0FBS0MsbUJBQWhEOztBQUNBQywyQkFBYzNELFFBQWQsQ0FBdUJ3RCxFQUF2QixDQUEwQkksaUNBQTFCLEVBQThDLEtBQUtGLG1CQUFuRDs7QUFDQWhELHFDQUFnQlYsUUFBaEIsQ0FBeUJ3RCxFQUF6QixDQUE0QkMsd0JBQTVCLEVBQTBDLEtBQUtJLHVCQUEvQzs7QUFDQSxTQUFLQyxpQkFBTCxHQUF5QmpELHVCQUFja0QsWUFBZCxDQUNyQiwwQkFEcUIsRUFDTyxJQURQLEVBQ2EsS0FBS0YsdUJBRGxCLENBQXpCO0FBRUEsU0FBS0csMEJBQUwsR0FBa0NuRCx1QkFBY2tELFlBQWQsQ0FBMkIseUJBQTNCLEVBQXNELElBQXRELEVBQTRELE1BQU07QUFDaEcsV0FBSzNELFFBQUwsQ0FBYztBQUFDbUQsUUFBQUEsb0JBQW9CLEVBQUUxQyx1QkFBY0MsUUFBZCxDQUF1Qix5QkFBdkI7QUFBdkIsT0FBZDtBQUNILEtBRmlDLENBQWxDLENBYnVCLENBaUJ2QjtBQUNBOztBQUNBLFNBQUtyQixLQUFMLENBQVd3RSxjQUFYLENBQTBCVCxFQUExQixDQUE2Qix5QkFBN0IsRUFBd0QsS0FBS1UsUUFBN0Q7QUFDSDs7QUFFTUMsRUFBQUEsb0JBQVAsR0FBOEI7QUFDMUJ0RCwyQkFBY3VELGNBQWQsQ0FBNkIsS0FBS0osMEJBQWxDOztBQUNBbkQsMkJBQWN1RCxjQUFkLENBQTZCLEtBQUtOLGlCQUFsQzs7QUFDQS9ELHVDQUFpQkMsUUFBakIsQ0FBMEJxRSxHQUExQixDQUE4Qlosd0JBQTlCLEVBQTRDLEtBQUtDLG1CQUFqRDs7QUFDQUMsMkJBQWMzRCxRQUFkLENBQXVCcUUsR0FBdkIsQ0FBMkJULGlDQUEzQixFQUErQyxLQUFLRixtQkFBcEQ7O0FBQ0FoRCxxQ0FBZ0JWLFFBQWhCLENBQXlCcUUsR0FBekIsQ0FBNkJaLHdCQUE3QixFQUEyQyxLQUFLSSx1QkFBaEQ7O0FBQ0EsU0FBS3BFLEtBQUwsQ0FBV3dFLGNBQVgsQ0FBMEJJLEdBQTFCLENBQThCLHlCQUE5QixFQUF5RCxLQUFLSCxRQUE5RDtBQUNIOztBQWtDTzNELEVBQUFBLG1CQUFSLENBQTRCbUI7QUFBNUI7QUFBQSxJQUFrRDtBQUM5QyxRQUFJLEtBQUs0QyxvQkFBVCxFQUErQjtBQUMvQixTQUFLQSxvQkFBTCxHQUE0QixJQUE1QjtBQUNBQyxJQUFBQSxNQUFNLENBQUNDLHFCQUFQLENBQTZCLE1BQU07QUFDL0IsV0FBS0MsZUFBTCxDQUFxQi9DLElBQXJCO0FBQ0EsV0FBSzRDLG9CQUFMLEdBQTRCLEtBQTVCO0FBQ0gsS0FIRDtBQUlIOztBQUVPRyxFQUFBQSxlQUFSLENBQXdCL0M7QUFBeEI7QUFBQSxJQUE4QztBQUMxQyxVQUFNZ0QsT0FBTyxHQUFHaEQsSUFBSSxDQUFDaUQsU0FBckI7QUFDQSxVQUFNQyxVQUFVLEdBQUdsRCxJQUFJLENBQUNtRCxZQUFMLEdBQW9CbkQsSUFBSSxDQUFDaUQsU0FBNUM7QUFDQSxVQUFNRyxRQUFRLEdBQUdwRCxJQUFJLENBQUNxRCxnQkFBTCxDQUFzQyxpQkFBdEMsQ0FBakI7QUFFQSxVQUFNQyxpQkFBaUIsR0FBRyxFQUExQixDQUwwQyxDQUtaOztBQUM5QixVQUFNQyxpQkFBaUIsR0FBR3ZELElBQUksQ0FBQ3dELFdBQUwsR0FBbUJGLGlCQUE3QyxDQU4wQyxDQVExQztBQUNBOztBQUNBLFVBQU1HLFlBQVksR0FBRyxJQUFJQyxHQUFKLEVBQXJCO0FBTUEsUUFBSUMsYUFBSjtBQUNBLFFBQUlDLGlCQUFKOztBQUNBLFNBQUssTUFBTUMsT0FBWCxJQUFzQlQsUUFBdEIsRUFBZ0M7QUFDNUIsWUFBTVUsTUFBTSxHQUFHRCxPQUFPLENBQUNsRCxhQUFSLENBQXNDLDJCQUF0QyxDQUFmO0FBQ0FtRCxNQUFBQSxNQUFNLENBQUNuRSxLQUFQLENBQWFDLGNBQWIsQ0FBNEIsU0FBNUIsRUFGNEIsQ0FFWTtBQUV4Qzs7QUFDQSxZQUFNbUUsZUFBZSxHQUFHLEdBQXhCO0FBQ0EsWUFBTUMsUUFBUSxHQUFJSCxPQUFPLENBQUNJLFNBQVIsR0FBcUJGLGVBQWUsR0FBR0csMEJBQXhDLElBQTJEbEIsT0FBNUU7QUFDQSxZQUFNbUIsV0FBVyxHQUFJTixPQUFPLENBQUNJLFNBQVIsR0FBcUJGLGVBQWUsR0FBR0csMEJBQXhDLElBQTJEaEIsVUFBL0U7O0FBRUEsVUFBSWMsUUFBUSxJQUFJSCxPQUFPLEtBQUtULFFBQVEsQ0FBQyxDQUFELENBQXBDLEVBQXlDO0FBQ3JDSyxRQUFBQSxZQUFZLENBQUNXLEdBQWIsQ0FBaUJOLE1BQWpCLEVBQXlCO0FBQUVPLFVBQUFBLFNBQVMsRUFBRTtBQUFiLFNBQXpCOztBQUNBLFlBQUlWLGFBQUosRUFBbUI7QUFDZkEsVUFBQUEsYUFBYSxDQUFDaEUsS0FBZCxDQUFvQjJFLE9BQXBCLEdBQThCLE1BQTlCO0FBQ0FiLFVBQUFBLFlBQVksQ0FBQ1csR0FBYixDQUFpQlQsYUFBakIsRUFBZ0M7QUFBRVksWUFBQUEsYUFBYSxFQUFFO0FBQWpCLFdBQWhDO0FBQ0g7O0FBQ0RaLFFBQUFBLGFBQWEsR0FBR0csTUFBaEI7QUFDSCxPQVBELE1BT08sSUFBSUssV0FBVyxJQUFJLENBQUNQLGlCQUFwQixFQUF1QztBQUMxQ0gsUUFBQUEsWUFBWSxDQUFDVyxHQUFiLENBQWlCTixNQUFqQixFQUF5QjtBQUFFVSxVQUFBQSxZQUFZLEVBQUU7QUFBaEIsU0FBekI7QUFDQVosUUFBQUEsaUJBQWlCLEdBQUdFLE1BQXBCO0FBQ0gsT0FITSxNQUdBO0FBQ0hMLFFBQUFBLFlBQVksQ0FBQ1csR0FBYixDQUFpQk4sTUFBakIsRUFBeUIsRUFBekIsRUFERyxDQUMyQjtBQUNqQztBQUNKLEtBeEN5QyxDQTBDMUM7QUFDQTtBQUNBOzs7QUFDQSxTQUFLLE1BQU1BLE1BQVgsSUFBcUJMLFlBQVksQ0FBQ2dCLElBQWIsRUFBckIsRUFBMEM7QUFDdEMsWUFBTTlFLEtBQUssR0FBRzhELFlBQVksQ0FBQ25FLEdBQWIsQ0FBaUJ3RSxNQUFqQixDQUFkOztBQUVBLFVBQUluRSxLQUFLLENBQUM0RSxhQUFWLEVBQXlCO0FBQ3JCO0FBQ0FULFFBQUFBLE1BQU0sQ0FBQ25FLEtBQVAsQ0FBYTJFLE9BQWIsR0FBdUIsTUFBdkI7QUFDQSxpQkFIcUIsQ0FHWDtBQUNiOztBQUVELFVBQUkzRSxLQUFLLENBQUMwRSxTQUFWLEVBQXFCO0FBQ2pCLFlBQUksQ0FBQ1AsTUFBTSxDQUFDdEMsU0FBUCxDQUFpQkcsUUFBakIsQ0FBMEIsMENBQTFCLENBQUwsRUFBNEU7QUFDeEVtQyxVQUFBQSxNQUFNLENBQUN0QyxTQUFQLENBQWlCa0QsR0FBakIsQ0FBcUIsMENBQXJCO0FBQ0g7O0FBRUQsY0FBTUMsTUFBTSxHQUFJLEdBQUUzRSxJQUFJLENBQUN1QixhQUFMLENBQW1CMEMsU0FBVSxJQUEvQzs7QUFDQSxZQUFJSCxNQUFNLENBQUNuRSxLQUFQLENBQWFpRixHQUFiLEtBQXFCRCxNQUF6QixFQUFpQztBQUM3QmIsVUFBQUEsTUFBTSxDQUFDbkUsS0FBUCxDQUFhaUYsR0FBYixHQUFtQkQsTUFBbkI7QUFDSDtBQUNKLE9BVEQsTUFTTztBQUNILFlBQUliLE1BQU0sQ0FBQ3RDLFNBQVAsQ0FBaUJHLFFBQWpCLENBQTBCLDBDQUExQixDQUFKLEVBQTJFO0FBQ3ZFbUMsVUFBQUEsTUFBTSxDQUFDdEMsU0FBUCxDQUFpQnFELE1BQWpCLENBQXdCLDBDQUF4QjtBQUNIOztBQUNELFlBQUlmLE1BQU0sQ0FBQ25FLEtBQVAsQ0FBYWlGLEdBQWpCLEVBQXNCO0FBQ2xCZCxVQUFBQSxNQUFNLENBQUNuRSxLQUFQLENBQWFDLGNBQWIsQ0FBNEIsS0FBNUI7QUFDSDtBQUNKOztBQUVELFVBQUlELEtBQUssQ0FBQzZFLFlBQVYsRUFBd0I7QUFDcEIsWUFBSSxDQUFDVixNQUFNLENBQUN0QyxTQUFQLENBQWlCRyxRQUFqQixDQUEwQiw2Q0FBMUIsQ0FBTCxFQUErRTtBQUMzRW1DLFVBQUFBLE1BQU0sQ0FBQ3RDLFNBQVAsQ0FBaUJrRCxHQUFqQixDQUFxQiw2Q0FBckI7QUFDSDs7QUFFRCxjQUFNSSxNQUFNLEdBQUdqQyxNQUFNLENBQUNrQyxXQUFQLElBQXNCL0UsSUFBSSxDQUFDdUIsYUFBTCxDQUFtQjBDLFNBQW5CLEdBQStCakUsSUFBSSxDQUFDdUIsYUFBTCxDQUFtQjRCLFlBQXhFLENBQWY7QUFDQSxjQUFNNkIsU0FBUyxHQUFJLEdBQUVGLE1BQU8sSUFBNUI7O0FBQ0EsWUFBSWhCLE1BQU0sQ0FBQ25FLEtBQVAsQ0FBYXNGLE1BQWIsS0FBd0JELFNBQTVCLEVBQXVDO0FBQ25DbEIsVUFBQUEsTUFBTSxDQUFDbkUsS0FBUCxDQUFhc0YsTUFBYixHQUFzQkQsU0FBdEI7QUFDSDtBQUNKLE9BVkQsTUFVTztBQUNILFlBQUlsQixNQUFNLENBQUN0QyxTQUFQLENBQWlCRyxRQUFqQixDQUEwQiw2Q0FBMUIsQ0FBSixFQUE4RTtBQUMxRW1DLFVBQUFBLE1BQU0sQ0FBQ3RDLFNBQVAsQ0FBaUJxRCxNQUFqQixDQUF3Qiw2Q0FBeEI7QUFDSDs7QUFDRCxZQUFJZixNQUFNLENBQUNuRSxLQUFQLENBQWFzRixNQUFqQixFQUF5QjtBQUNyQm5CLFVBQUFBLE1BQU0sQ0FBQ25FLEtBQVAsQ0FBYUMsY0FBYixDQUE0QixRQUE1QjtBQUNIO0FBQ0o7O0FBRUQsVUFBSUQsS0FBSyxDQUFDMEUsU0FBTixJQUFtQjFFLEtBQUssQ0FBQzZFLFlBQTdCLEVBQTJDO0FBQ3ZDLFlBQUksQ0FBQ1YsTUFBTSxDQUFDdEMsU0FBUCxDQUFpQkcsUUFBakIsQ0FBMEIsdUNBQTFCLENBQUwsRUFBeUU7QUFDckVtQyxVQUFBQSxNQUFNLENBQUN0QyxTQUFQLENBQWlCa0QsR0FBakIsQ0FBcUIsdUNBQXJCO0FBQ0g7O0FBRUQsY0FBTVEsUUFBUSxHQUFJLEdBQUUzQixpQkFBa0IsSUFBdEM7O0FBQ0EsWUFBSU8sTUFBTSxDQUFDbkUsS0FBUCxDQUFhd0YsS0FBYixLQUF1QkQsUUFBM0IsRUFBcUM7QUFDakNwQixVQUFBQSxNQUFNLENBQUNuRSxLQUFQLENBQWF3RixLQUFiLEdBQXFCRCxRQUFyQjtBQUNIO0FBQ0osT0FURCxNQVNPLElBQUksQ0FBQ3ZGLEtBQUssQ0FBQzBFLFNBQVAsSUFBb0IsQ0FBQzFFLEtBQUssQ0FBQzZFLFlBQS9CLEVBQTZDO0FBQ2hELFlBQUlWLE1BQU0sQ0FBQ3RDLFNBQVAsQ0FBaUJHLFFBQWpCLENBQTBCLHVDQUExQixDQUFKLEVBQXdFO0FBQ3BFbUMsVUFBQUEsTUFBTSxDQUFDdEMsU0FBUCxDQUFpQnFELE1BQWpCLENBQXdCLHVDQUF4QjtBQUNIOztBQUNELFlBQUlmLE1BQU0sQ0FBQ25FLEtBQVAsQ0FBYXdGLEtBQWpCLEVBQXdCO0FBQ3BCckIsVUFBQUEsTUFBTSxDQUFDbkUsS0FBUCxDQUFhQyxjQUFiLENBQTRCLE9BQTVCO0FBQ0g7QUFDSjtBQUNKLEtBNUd5QyxDQThHMUM7QUFDQTs7O0FBQ0EsVUFBTXdGLFdBQVcsR0FBR3BGLElBQUksQ0FBQ3VCLGFBQXpCLENBaEgwQyxDQWdIRjs7QUFDeEMsUUFBSW9DLGFBQUosRUFBbUI7QUFDZnlCLE1BQUFBLFdBQVcsQ0FBQzVELFNBQVosQ0FBc0JrRCxHQUF0QixDQUEwQix3Q0FBMUI7QUFDSCxLQUZELE1BRU87QUFDSFUsTUFBQUEsV0FBVyxDQUFDNUQsU0FBWixDQUFzQnFELE1BQXRCLENBQTZCLHdDQUE3QjtBQUNIOztBQUNELFFBQUlqQixpQkFBSixFQUF1QjtBQUNuQndCLE1BQUFBLFdBQVcsQ0FBQzVELFNBQVosQ0FBc0JrRCxHQUF0QixDQUEwQiwyQ0FBMUI7QUFDSCxLQUZELE1BRU87QUFDSFUsTUFBQUEsV0FBVyxDQUFDNUQsU0FBWixDQUFzQnFELE1BQXRCLENBQTZCLDJDQUE3QjtBQUNIO0FBQ0o7O0FBZ0ZPUSxFQUFBQSxZQUFSO0FBQUE7QUFBd0M7QUFDcEMsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLG9CQUFDLGlCQUFEO0FBQVUsTUFBQSxXQUFXLEVBQUUsS0FBS3RILEtBQUwsQ0FBV3VIO0FBQWxDLE1BREosQ0FESjtBQUtIOztBQUVPQyxFQUFBQSxpQkFBUjtBQUFBO0FBQTZDO0FBQ3pDLFFBQUksS0FBSy9HLEtBQUwsQ0FBV0MsZUFBWCxJQUE4QixDQUFDLEtBQUtWLEtBQUwsQ0FBV3VILFdBQTlDLEVBQTJEO0FBQ3ZELDBCQUNJLG9CQUFDLDJCQUFEO0FBQ0ksUUFBQSxTQUFTLEVBQUMsd0RBRGQ7QUFFSSxRQUFBLDJCQUEyQixFQUFFLElBRmpDLENBR0k7QUFDQTtBQUpKO0FBS0ksUUFBQSxRQUFRLEVBQUUsQ0FBQztBQUxmLHNCQU9JLG9CQUFDLHdCQUFELE9BUEosQ0FESjtBQVdIO0FBQ0o7O0FBRU9FLEVBQUFBLG1CQUFSO0FBQUE7QUFBK0M7QUFDM0Msd0JBQ0k7QUFDSSxNQUFBLFNBQVMsRUFBQyw4QkFEZDtBQUVJLE1BQUEsT0FBTyxFQUFFLEtBQUtDLE9BRmxCO0FBR0ksTUFBQSxNQUFNLEVBQUUsS0FBS0MsTUFIakI7QUFJSSxNQUFBLFNBQVMsRUFBRSxLQUFLQztBQUpwQixvQkFNSSxvQkFBQyxtQkFBRDtBQUNJLE1BQUEsV0FBVyxFQUFFLEtBQUs1SCxLQUFMLENBQVd1SCxXQUQ1QjtBQUVJLE1BQUEsZUFBZSxFQUFFLEtBQUtLLFNBRjFCO0FBR0ksTUFBQSxPQUFPLEVBQUUsS0FBS0M7QUFIbEIsTUFOSixlQVdJLG9CQUFDLGdDQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUMsNEJBRGQ7QUFFSSxNQUFBLE9BQU8sRUFBRSxLQUFLQyxTQUZsQjtBQUdJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGVBQUg7QUFIWCxNQVhKLENBREo7QUFtQkg7O0FBRU1DLEVBQUFBLE1BQVA7QUFBQTtBQUFpQztBQUM3QixVQUFNQyxnQkFBZ0IsR0FBRyxDQUFDLEtBQUt2SCxLQUFMLENBQVdxRCxvQkFBWixHQUFtQyxJQUFuQyxnQkFDckI7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLG9CQUFDLHlCQUFELE9BREosRUFFSzFDLHVCQUFjQyxRQUFkLENBQXVCLHFCQUF2QixpQkFBZ0Qsb0JBQUMsMkJBQUQsT0FBaEQsR0FBeUUsSUFGOUUsQ0FESjtBQU9BLFVBQU00RyxRQUFRLGdCQUFHLG9CQUFDLGlCQUFEO0FBQ2IsTUFBQSxTQUFTLEVBQUUsS0FBS0wsU0FESDtBQUViLE1BQUEsY0FBYyxFQUFFLElBRkg7QUFHYixNQUFBLE9BQU8sRUFBRSxLQUFLRixPQUhEO0FBSWIsTUFBQSxNQUFNLEVBQUUsS0FBS0MsTUFKQTtBQUtiLE1BQUEsV0FBVyxFQUFFLEtBQUszSCxLQUFMLENBQVd1SCxXQUxYO0FBTWIsTUFBQSxRQUFRLEVBQUUsS0FBSzlDO0FBTkYsTUFBakI7QUFTQSxVQUFNeUQsZ0JBQWdCLEdBQUcseUJBQVc7QUFDaEMsc0JBQWdCLElBRGdCO0FBRWhDLDBDQUFvQyxDQUFDLENBQUNGLGdCQUZOO0FBR2hDLGdDQUEwQixLQUFLaEksS0FBTCxDQUFXdUg7QUFITCxLQUFYLENBQXpCO0FBTUEsVUFBTVksZUFBZSxHQUFHLHlCQUNwQixzQ0FEb0IsRUFFcEIsc0JBRm9CLENBQXhCO0FBS0Esd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBRUQ7QUFBaEIsT0FDS0YsZ0JBREwsZUFFSTtBQUFPLE1BQUEsU0FBUyxFQUFDO0FBQWpCLE9BQ0ssS0FBS1YsWUFBTCxFQURMLEVBRUssS0FBS0csbUJBQUwsRUFGTCxFQUdLLEtBQUtELGlCQUFMLEVBSEwsZUFJSSxvQkFBQywyQkFBRCxPQUpKLGVBS0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQ0ksTUFBQSxTQUFTLEVBQUVXLGVBRGY7QUFFSSxNQUFBLFFBQVEsRUFBRSxLQUFLQyxRQUZuQjtBQUdJLE1BQUEsR0FBRyxFQUFFLEtBQUt4SCxnQkFIZCxDQUlJO0FBQ0E7QUFMSjtBQU1JLE1BQUEsUUFBUSxFQUFFLENBQUM7QUFOZixPQVFLcUgsUUFSTCxDQURKLENBTEosRUFpQk0sQ0FBQyxLQUFLakksS0FBTCxDQUFXdUgsV0FBWixpQkFBMkIsb0JBQUMsd0JBQUQ7QUFBaUIsTUFBQSxRQUFRLEVBQUUsS0FBSzlDO0FBQWhDLE1BakJqQyxDQUZKLENBREo7QUF3Qkg7O0FBNVhrRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgY3JlYXRlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgR3JvdXBGaWx0ZXJQYW5lbCBmcm9tIFwiLi9Hcm91cEZpbHRlclBhbmVsXCI7XG5pbXBvcnQgQ3VzdG9tUm9vbVRhZ1BhbmVsIGZyb20gXCIuL0N1c3RvbVJvb21UYWdQYW5lbFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUm9vbUxpc3QgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21MaXN0XCI7XG5pbXBvcnQgeyBIRUFERVJfSEVJR0hUIH0gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21TdWJsaXN0XCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgVXNlck1lbnUgZnJvbSBcIi4vVXNlck1lbnVcIjtcbmltcG9ydCBSb29tU2VhcmNoIGZyb20gXCIuL1Jvb21TZWFyY2hcIjtcbmltcG9ydCBSb29tQnJlYWRjcnVtYnMgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Jvb21CcmVhZGNydW1ic1wiO1xuaW1wb3J0IHsgQnJlYWRjcnVtYnNTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQnJlYWRjcnVtYnNTdG9yZVwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUsIHsgTElTVFNfVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHtLZXl9IGZyb20gXCIuLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IEluZGljYXRvclNjcm9sbGJhciBmcm9tIFwiLi4vc3RydWN0dXJlcy9JbmRpY2F0b3JTY3JvbGxiYXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7IE93blByb2ZpbGVTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvT3duUHJvZmlsZVN0b3JlXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgUm9vbUxpc3ROdW1SZXN1bHRzIGZyb20gXCIuLi92aWV3cy9yb29tcy9Sb29tTGlzdE51bVJlc3VsdHNcIjtcbmltcG9ydCBMZWZ0UGFuZWxXaWRnZXQgZnJvbSBcIi4vTGVmdFBhbmVsV2lkZ2V0XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGlzTWluaW1pemVkOiBib29sZWFuO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc2hvd0JyZWFkY3J1bWJzOiBib29sZWFuO1xuICAgIHNob3dHcm91cEZpbHRlclBhbmVsOiBib29sZWFuO1xufVxuXG4vLyBMaXN0IG9mIENTUyBjbGFzc2VzIHdoaWNoIHNob3VsZCBiZSBpbmNsdWRlZCBpbiBrZXlib2FyZCBuYXZpZ2F0aW9uIHdpdGhpbiB0aGUgcm9vbSBsaXN0XG5jb25zdCBjc3NDbGFzc2VzID0gW1xuICAgIFwibXhfUm9vbVNlYXJjaF9pbnB1dFwiLFxuICAgIFwibXhfUm9vbVNlYXJjaF9taW5pbWl6ZWRIYW5kbGVcIiwgLy8gbWluaW1pemVkIDxSb29tU2VhcmNoIC8+XG4gICAgXCJteF9Sb29tU3VibGlzdF9oZWFkZXJUZXh0XCIsXG4gICAgXCJteF9Sb29tVGlsZVwiLFxuICAgIFwibXhfUm9vbVN1Ymxpc3Rfc2hvd05CdXR0b25cIixcbl07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlZnRQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgbGlzdENvbnRhaW5lclJlZjogUmVhY3QuUmVmT2JqZWN0PEhUTUxEaXZFbGVtZW50PiA9IGNyZWF0ZVJlZigpO1xuICAgIHByaXZhdGUgZ3JvdXBGaWx0ZXJQYW5lbFdhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIGJnSW1hZ2VXYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBmb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgcHJpdmF0ZSBpc0RvaW5nU3RpY2t5SGVhZGVycyA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNob3dCcmVhZGNydW1iczogQnJlYWRjcnVtYnNTdG9yZS5pbnN0YW5jZS52aXNpYmxlLFxuICAgICAgICAgICAgc2hvd0dyb3VwRmlsdGVyUGFuZWw6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ1RhZ1BhbmVsLmVuYWJsZVRhZ1BhbmVsJyksXG4gICAgICAgIH07XG5cbiAgICAgICAgQnJlYWRjcnVtYnNTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMub25CcmVhZGNydW1ic1VwZGF0ZSk7XG4gICAgICAgIFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub24oTElTVFNfVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgICAgICBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uQmFja2dyb3VuZEltYWdlVXBkYXRlKTtcbiAgICAgICAgdGhpcy5iZ0ltYWdlV2F0Y2hlclJlZiA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFxuICAgICAgICAgICAgXCJSb29tTGlzdC5iYWNrZ3JvdW5kSW1hZ2VcIiwgbnVsbCwgdGhpcy5vbkJhY2tncm91bmRJbWFnZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuZ3JvdXBGaWx0ZXJQYW5lbFdhdGNoZXJSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcIlRhZ1BhbmVsLmVuYWJsZVRhZ1BhbmVsXCIsIG51bGwsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dHcm91cEZpbHRlclBhbmVsOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiVGFnUGFuZWwuZW5hYmxlVGFnUGFuZWxcIil9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gV2Ugd2F0Y2ggdGhlIG1pZGRsZSBwYW5lbCBiZWNhdXNlIHdlIGRvbid0IGFjdHVhbGx5IGdldCByZXNpemVkLCB0aGUgbWlkZGxlIHBhbmVsIGRvZXMuXG4gICAgICAgIC8vIFdlIGxpc3RlbiB0byB0aGUgbm9pc3kgY2hhbm5lbCB0byBhdm9pZCBjaG9wcHkgcmVhY3Rpb24gdGltZXMuXG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub24oXCJtaWRkbGVQYW5lbFJlc2l6ZWROb2lzeVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5ncm91cEZpbHRlclBhbmVsV2F0Y2hlclJlZik7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5iZ0ltYWdlV2F0Y2hlclJlZik7XG4gICAgICAgIEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbkJyZWFkY3J1bWJzVXBkYXRlKTtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vZmYoTElTVFNfVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgICAgICBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbkJhY2tncm91bmRJbWFnZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub2ZmKFwibWlkZGxlUGFuZWxSZXNpemVkTm9pc3lcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkV4cGxvcmUgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3Um9vbURpcmVjdG9yeSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CcmVhZGNydW1ic1VwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3VmFsID0gQnJlYWRjcnVtYnNTdG9yZS5pbnN0YW5jZS52aXNpYmxlO1xuICAgICAgICBpZiAobmV3VmFsICE9PSB0aGlzLnN0YXRlLnNob3dCcmVhZGNydW1icykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd0JyZWFkY3J1bWJzOiBuZXdWYWx9KTtcblxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBzdGlja3kgaGVhZGVycyB0b28gYXMgdGhlIGJyZWFkY3J1bWJzIHdpbGwgYmUgcG9wcGluZyBpbiBvciBvdXQuXG4gICAgICAgICAgICBpZiAoIXRoaXMubGlzdENvbnRhaW5lclJlZi5jdXJyZW50KSByZXR1cm47IC8vIGlnbm9yZTogbm8gaGVhZGVycyB0byBzdGlja3lcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU3RpY2t5SGVhZGVycyh0aGlzLmxpc3RDb250YWluZXJSZWYuY3VycmVudCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkJhY2tncm91bmRJbWFnZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgLy8gTm90ZTogd2UgZG8gdGhpcyBpbiB0aGUgTGVmdFBhbmVsIGFzIGl0IHVzZXMgdGhpcyB2YXJpYWJsZSBtb3N0IHByb21pbmVudGx5LlxuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gMzI7IC8vIGFyYml0cmFyeVxuICAgICAgICBsZXQgYXZhdGFyVXJsID0gT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmdldEh0dHBBdmF0YXJVcmwoYXZhdGFyU2l6ZSk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdCZ014YyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJSb29tTGlzdC5iYWNrZ3JvdW5kSW1hZ2VcIik7XG4gICAgICAgIGlmIChzZXR0aW5nQmdNeGMpIHtcbiAgICAgICAgICAgIGF2YXRhclVybCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5teGNVcmxUb0h0dHAoc2V0dGluZ0JnTXhjLCBhdmF0YXJTaXplLCBhdmF0YXJTaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF2YXRhclVybFByb3AgPSBgdXJsKCR7YXZhdGFyVXJsfSlgO1xuICAgICAgICBpZiAoIWF2YXRhclVybCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShcIi0tYXZhdGFyLXVybFwiKTtcbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5ib2R5LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoXCItLWF2YXRhci11cmxcIikgIT09IGF2YXRhclVybFByb3ApIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoXCItLWF2YXRhci11cmxcIiwgYXZhdGFyVXJsUHJvcCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBoYW5kbGVTdGlja3lIZWFkZXJzKGxpc3Q6IEhUTUxEaXZFbGVtZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzRG9pbmdTdGlja3lIZWFkZXJzKSByZXR1cm47XG4gICAgICAgIHRoaXMuaXNEb2luZ1N0aWNreUhlYWRlcnMgPSB0cnVlO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZG9TdGlja3lIZWFkZXJzKGxpc3QpO1xuICAgICAgICAgICAgdGhpcy5pc0RvaW5nU3RpY2t5SGVhZGVycyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRvU3RpY2t5SGVhZGVycyhsaXN0OiBIVE1MRGl2RWxlbWVudCkge1xuICAgICAgICBjb25zdCB0b3BFZGdlID0gbGlzdC5zY3JvbGxUb3A7XG4gICAgICAgIGNvbnN0IGJvdHRvbUVkZ2UgPSBsaXN0Lm9mZnNldEhlaWdodCArIGxpc3Quc2Nyb2xsVG9wO1xuICAgICAgICBjb25zdCBzdWJsaXN0cyA9IGxpc3QucXVlcnlTZWxlY3RvckFsbDxIVE1MRGl2RWxlbWVudD4oXCIubXhfUm9vbVN1Ymxpc3RcIik7XG5cbiAgICAgICAgY29uc3QgaGVhZGVyUmlnaHRNYXJnaW4gPSAxNTsgLy8gY2FsY3VsYXRlZCBmcm9tIG1hcmdpbnMgYW5kIHdpZHRocyB0byBhbGlnbiB3aXRoIG5vbi1zdGlja3kgdGlsZXNcbiAgICAgICAgY29uc3QgaGVhZGVyU3RpY2t5V2lkdGggPSBsaXN0LmNsaWVudFdpZHRoIC0gaGVhZGVyUmlnaHRNYXJnaW47XG5cbiAgICAgICAgLy8gV2UgdHJhY2sgd2hpY2ggc3R5bGVzIHdlIHdhbnQgb24gYSB0YXJnZXQgYmVmb3JlIG1ha2luZyB0aGUgY2hhbmdlcyB0byBhdm9pZFxuICAgICAgICAvLyBleGNlc3NpdmUgbGF5b3V0IHVwZGF0ZXMuXG4gICAgICAgIGNvbnN0IHRhcmdldFN0eWxlcyA9IG5ldyBNYXA8SFRNTERpdkVsZW1lbnQsIHtcbiAgICAgICAgICAgIHN0aWNreVRvcD86IGJvb2xlYW47XG4gICAgICAgICAgICBzdGlja3lCb3R0b20/OiBib29sZWFuO1xuICAgICAgICAgICAgbWFrZUludmlzaWJsZT86IGJvb2xlYW47XG4gICAgICAgIH0+KCk7XG5cbiAgICAgICAgbGV0IGxhc3RUb3BIZWFkZXI7XG4gICAgICAgIGxldCBmaXJzdEJvdHRvbUhlYWRlcjtcbiAgICAgICAgZm9yIChjb25zdCBzdWJsaXN0IG9mIHN1Ymxpc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBzdWJsaXN0LnF1ZXJ5U2VsZWN0b3I8SFRNTERpdkVsZW1lbnQ+KFwiLm14X1Jvb21TdWJsaXN0X3N0aWNrYWJsZVwiKTtcbiAgICAgICAgICAgIGhlYWRlci5zdHlsZS5yZW1vdmVQcm9wZXJ0eShcImRpc3BsYXlcIik7IC8vIGFsd2F5cyBjbGVhciBkaXNwbGF5Om5vbmUgZmlyc3RcblxuICAgICAgICAgICAgLy8gV2hlbiBhbiBlbGVtZW50IGlzIDw9NDAlIG9mZiBzY3JlZW4sIG1ha2UgaXQgdGFrZSBvdmVyXG4gICAgICAgICAgICBjb25zdCBvZmZTY3JlZW5GYWN0b3IgPSAwLjQ7XG4gICAgICAgICAgICBjb25zdCBpc09mZlRvcCA9IChzdWJsaXN0Lm9mZnNldFRvcCArIChvZmZTY3JlZW5GYWN0b3IgKiBIRUFERVJfSEVJR0hUKSkgPD0gdG9wRWRnZTtcbiAgICAgICAgICAgIGNvbnN0IGlzT2ZmQm90dG9tID0gKHN1Ymxpc3Qub2Zmc2V0VG9wICsgKG9mZlNjcmVlbkZhY3RvciAqIEhFQURFUl9IRUlHSFQpKSA+PSBib3R0b21FZGdlO1xuXG4gICAgICAgICAgICBpZiAoaXNPZmZUb3AgfHwgc3VibGlzdCA9PT0gc3VibGlzdHNbMF0pIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTdHlsZXMuc2V0KGhlYWRlciwgeyBzdGlja3lUb3A6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RUb3BIZWFkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFRvcEhlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFN0eWxlcy5zZXQobGFzdFRvcEhlYWRlciwgeyBtYWtlSW52aXNpYmxlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsYXN0VG9wSGVhZGVyID0gaGVhZGVyO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc09mZkJvdHRvbSAmJiAhZmlyc3RCb3R0b21IZWFkZXIpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTdHlsZXMuc2V0KGhlYWRlciwgeyBzdGlja3lCb3R0b206IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgZmlyc3RCb3R0b21IZWFkZXIgPSBoZWFkZXI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFN0eWxlcy5zZXQoaGVhZGVyLCB7fSk7IC8vIG5vdGhpbmcgPT0gY2xlYXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJ1biBvdmVyIHRoZSBzdHlsZSBjaGFuZ2VzIGFuZCBtYWtlIHRoZW0gcmVhbGl0eS4gV2UgY2hlY2sgdG8gc2VlIGlmIHdlJ3JlIGFib3V0IHRvXG4gICAgICAgIC8vIGNhdXNlIGEgbm8tb3AgdXBkYXRlLCBhcyBhZGRpbmcvcmVtb3ZpbmcgcHJvcGVydGllcyB0aGF0IGFyZS9hcmVuJ3QgdGhlcmUgY2F1c2VcbiAgICAgICAgLy8gbGF5b3V0IHVwZGF0ZXMuXG4gICAgICAgIGZvciAoY29uc3QgaGVhZGVyIG9mIHRhcmdldFN0eWxlcy5rZXlzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlID0gdGFyZ2V0U3R5bGVzLmdldChoZWFkZXIpO1xuXG4gICAgICAgICAgICBpZiAoc3R5bGUubWFrZUludmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIC8vIHdlIHdpbGwgaGF2ZSBhbHJlYWR5IHJlbW92ZWQgdGhlICdkaXNwbGF5OiBub25lJywgc28gYWRkIGl0IGJhY2suXG4gICAgICAgICAgICAgICAgaGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICBjb250aW51ZTsgLy8gbm90aGluZyBlbHNlIHRvIGRvLCBldmVuIGlmIHN0aWNreSBzb21laG93XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdHlsZS5zdGlja3lUb3ApIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhlYWRlci5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5VG9wXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVRvcFwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdUb3AgPSBgJHtsaXN0LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wfXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLnRvcCAhPT0gbmV3VG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5zdHlsZS50b3AgPSBuZXdUb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lUb3BcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5VG9wXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLnRvcCkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ3RvcCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0eWxlLnN0aWNreUJvdHRvbSkge1xuICAgICAgICAgICAgICAgIGlmICghaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lCb3R0b21cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5Qm90dG9tXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIChsaXN0LnBhcmVudEVsZW1lbnQub2Zmc2V0VG9wICsgbGlzdC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Qm90dG9tID0gYCR7b2Zmc2V0fXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLmJvdHRvbSAhPT0gbmV3Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5zdHlsZS5ib3R0b20gPSBuZXdCb3R0b207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLmNsYXNzTGlzdC5jb250YWlucyhcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lCb3R0b21cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5Qm90dG9tXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLmJvdHRvbSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUucmVtb3ZlUHJvcGVydHkoJ2JvdHRvbScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0eWxlLnN0aWNreVRvcCB8fCBzdHlsZS5zdGlja3lCb3R0b20pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhlYWRlci5jbGFzc0xpc3QuY29udGFpbnMoXCJteF9Sb29tU3VibGlzdF9oZWFkZXJDb250YWluZXJfc3RpY2t5XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IGAke2hlYWRlclN0aWNreVdpZHRofXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnN0eWxlLndpZHRoICE9PSBuZXdXaWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuc3R5bGUud2lkdGggPSBuZXdXaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdHlsZS5zdGlja3lUb3AgJiYgIXN0eWxlLnN0aWNreUJvdHRvbSkge1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZShcIm14X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcl9zdGlja3lcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIuc3R5bGUud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyLnN0eWxlLnJlbW92ZVByb3BlcnR5KCd3aWR0aCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCBhcHByb3ByaWF0ZSBzdGlja3kgY2xhc3NlcyB0byB3cmFwcGVyIHNvIGl0IGhhc1xuICAgICAgICAvLyB0aGUgbmVjZXNzYXJ5IHRvcC9ib3R0b20gcGFkZGluZyB0byBwdXQgdGhlIHN0aWNreSBoZWFkZXIgaW5cbiAgICAgICAgY29uc3QgbGlzdFdyYXBwZXIgPSBsaXN0LnBhcmVudEVsZW1lbnQ7IC8vIC5teF9MZWZ0UGFuZWxfcm9vbUxpc3RXcmFwcGVyXG4gICAgICAgIGlmIChsYXN0VG9wSGVhZGVyKSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lUb3BcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lUb3BcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpcnN0Qm90dG9tSGVhZGVyKSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QuYWRkKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lCb3R0b21cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaXN0V3JhcHBlci5jbGFzc0xpc3QucmVtb3ZlKFwibXhfTGVmdFBhbmVsX3Jvb21MaXN0V3JhcHBlcl9zdGlja3lCb3R0b21cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2Nyb2xsID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PikgPT4ge1xuICAgICAgICBjb25zdCBsaXN0ID0gZXYudGFyZ2V0IGFzIEhUTUxEaXZFbGVtZW50O1xuICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnMobGlzdCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpIHJldHVybjsgLy8gaWdub3JlOiBubyBoZWFkZXJzIHRvIHN0aWNreVxuICAgICAgICB0aGlzLmhhbmRsZVN0aWNreUhlYWRlcnModGhpcy5saXN0Q29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9jdXMgPSAoZXY6IFJlYWN0LkZvY3VzRXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c2VkRWxlbWVudCA9IGV2LnRhcmdldDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkJsdXIgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9jdXNlZEVsZW1lbnQgPSBudWxsO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZm9jdXNlZEVsZW1lbnQpIHJldHVybjtcblxuICAgICAgICBzd2l0Y2ggKGV2LmtleSkge1xuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfVVA6XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19ET1dOOlxuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vdmVGb2N1cyhldi5rZXkgPT09IEtleS5BUlJPV19VUCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVudGVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBmaXJzdFJvb20gPSB0aGlzLmxpc3RDb250YWluZXJSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yPEhUTUxEaXZFbGVtZW50PihcIi5teF9Sb29tVGlsZVwiKTtcbiAgICAgICAgaWYgKGZpcnN0Um9vbSkge1xuICAgICAgICAgICAgZmlyc3RSb29tLmNsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gdG8gZ2V0IHRoZSBmaWVsZCB0byBjbGVhclxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Nb3ZlRm9jdXMgPSAodXA6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmZvY3VzZWRFbGVtZW50O1xuXG4gICAgICAgIGxldCBkZXNjZW5kaW5nID0gZmFsc2U7IC8vIGFyZSB3ZSBjdXJyZW50bHkgZGVzY2VuZGluZyBvciBhc2NlbmRpbmcgdGhyb3VnaCB0aGUgRE9NIHRyZWU/XG4gICAgICAgIGxldCBjbGFzc2VzOiBET01Ub2tlbkxpc3Q7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSB1cCA/IGVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZCA6IGVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgICAgICBjb25zdCBzaWJsaW5nID0gdXAgPyBlbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcgOiBlbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcblxuICAgICAgICAgICAgaWYgKGRlc2NlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGNoaWxkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2libGluZykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gc2libGluZztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZXNjZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc2libGluZykge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gc2libGluZztcbiAgICAgICAgICAgICAgICAgICAgZGVzY2VuZGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NMaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChlbGVtZW50ICYmICFjc3NDbGFzc2VzLnNvbWUoYyA9PiBjbGFzc2VzLmNvbnRhaW5zKGMpKSk7XG5cbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVySGVhZGVyKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF91c2VySGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPFVzZXJNZW51IGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJCcmVhZGNydW1icygpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93QnJlYWRjcnVtYnMgJiYgIXRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPEluZGljYXRvclNjcm9sbGJhclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfYnJlYWRjcnVtYnNDb250YWluZXIgbXhfQXV0b0hpZGVTY3JvbGxiYXJcIlxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbFNjcm9sbHNIb3Jpem9udGFsbHk9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggc29tZXRpbWVzIG1ha2VzIHRoaXMgZWxlbWVudCBmb2N1c2FibGUgZHVlIHRvXG4gICAgICAgICAgICAgICAgICAgIC8vIG92ZXJmbG93OnNjcm9sbDssIHNvIGZvcmNlIGl0IG91dCBvZiB0YWIgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgIHRhYkluZGV4PXstMX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxSb29tQnJlYWRjcnVtYnMgLz5cbiAgICAgICAgICAgICAgICA8L0luZGljYXRvclNjcm9sbGJhcj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclNlYXJjaEV4cGxvcmUoKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfZmlsdGVyQ29udGFpbmVyXCJcbiAgICAgICAgICAgICAgICBvbkZvY3VzPXt0aGlzLm9uRm9jdXN9XG4gICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQmx1cn1cbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxSb29tU2VhcmNoXG4gICAgICAgICAgICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgICAgICAgICBvblZlcnRpY2FsQXJyb3c9e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgICAgICBvbkVudGVyPXt0aGlzLm9uRW50ZXJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTGVmdFBhbmVsX2V4cGxvcmVCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRXhwbG9yZX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiRXhwbG9yZSByb29tc1wiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICBjb25zdCBncm91cEZpbHRlclBhbmVsID0gIXRoaXMuc3RhdGUuc2hvd0dyb3VwRmlsdGVyUGFuZWwgPyBudWxsIDogKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfR3JvdXBGaWx0ZXJQYW5lbENvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxHcm91cEZpbHRlclBhbmVsIC8+XG4gICAgICAgICAgICAgICAge1NldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2N1c3RvbV90YWdzXCIpID8gPEN1c3RvbVJvb21UYWdQYW5lbCAvPiA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCByb29tTGlzdCA9IDxSb29tTGlzdFxuICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXtudWxsfVxuICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vbkZvY3VzfVxuICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQmx1cn1cbiAgICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgb25SZXNpemU9e3RoaXMub25SZXNpemV9XG4gICAgICAgIC8+O1xuXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfTGVmdFBhbmVsXCI6IHRydWUsXG4gICAgICAgICAgICBcIm14X0xlZnRQYW5lbF9oYXNHcm91cEZpbHRlclBhbmVsXCI6ICEhZ3JvdXBGaWx0ZXJQYW5lbCxcbiAgICAgICAgICAgIFwibXhfTGVmdFBhbmVsX21pbmltaXplZFwiOiB0aGlzLnByb3BzLmlzTWluaW1pemVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByb29tTGlzdENsYXNzZXMgPSBjbGFzc05hbWVzKFxuICAgICAgICAgICAgXCJteF9MZWZ0UGFuZWxfYWN0dWFsUm9vbUxpc3RDb250YWluZXJcIixcbiAgICAgICAgICAgIFwibXhfQXV0b0hpZGVTY3JvbGxiYXJcIixcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzZXN9PlxuICAgICAgICAgICAgICAgIHtncm91cEZpbHRlclBhbmVsfVxuICAgICAgICAgICAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfcm9vbUxpc3RDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVySGVhZGVyKCl9XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlclNlYXJjaEV4cGxvcmUoKX1cbiAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyQnJlYWRjcnVtYnMoKX1cbiAgICAgICAgICAgICAgICAgICAgPFJvb21MaXN0TnVtUmVzdWx0cyAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZnRQYW5lbF9yb29tTGlzdFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3Jvb21MaXN0Q2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNjcm9sbD17dGhpcy5vblNjcm9sbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMubGlzdENvbnRhaW5lclJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IHNvbWV0aW1lcyBtYWtlcyB0aGlzIGVsZW1lbnQgZm9jdXNhYmxlIGR1ZSB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG92ZXJmbG93OnNjcm9sbDssIHNvIGZvcmNlIGl0IG91dCBvZiB0YWIgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb29tTGlzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyAhdGhpcy5wcm9wcy5pc01pbmltaXplZCAmJiA8TGVmdFBhbmVsV2lkZ2V0IG9uUmVzaXplPXt0aGlzLm9uUmVzaXplfSAvPiB9XG4gICAgICAgICAgICAgICAgPC9hc2lkZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==