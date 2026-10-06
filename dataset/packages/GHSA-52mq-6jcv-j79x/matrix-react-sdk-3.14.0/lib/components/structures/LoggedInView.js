"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var PropTypes = _interopRequireWildcard(require("prop-types"));

var _client = require("matrix-js-sdk/src/client");

var _reactBeautifulDnd = require("react-beautiful-dnd");

var _Keyboard = require("../../Keyboard");

var _PageTypes = _interopRequireDefault(require("../../PageTypes"));

var _CallMediaHandler = _interopRequireDefault(require("../../CallMediaHandler"));

var _FontManager = require("../../utils/FontManager");

var sdk = _interopRequireWildcard(require("../../index"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _TagOrderActions = _interopRequireDefault(require("../../actions/TagOrderActions"));

var _RoomListActions = _interopRequireDefault(require("../../actions/RoomListActions"));

var _ResizeHandle = _interopRequireDefault(require("../views/elements/ResizeHandle"));

var _resizer = require("../../resizer");

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var KeyboardShortcuts = _interopRequireWildcard(require("../../accessibility/KeyboardShortcuts"));

var _HomePage = _interopRequireDefault(require("./HomePage"));

var _PlatformPeg = _interopRequireDefault(require("../../PlatformPeg"));

var _models = require("../../stores/room-list/models");

var _ServerLimitToast = require("../../toasts/ServerLimitToast");

var _actions = require("../../dispatcher/actions");

var _LeftPanel = _interopRequireDefault(require("./LeftPanel"));

var _CallContainer = _interopRequireDefault(require("../views/voip/CallContainer"));

var _RoomListStore = _interopRequireDefault(require("../../stores/room-list/RoomListStore"));

var _NonUrgentToastContainer = _interopRequireDefault(require("./NonUrgentToastContainer"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _HostSignupContainer = _interopRequireDefault(require("../views/host_signup/HostSignupContainer"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2017, 2018, 2020 New Vector Ltd

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
// We need to fetch each pinned message individually (if we don't already have it)
// so each pinned message may trigger a request. Limit the number per room for sanity.
// NB. this is just for server notices rather than pinned messages in general.
const MAX_PINNED_NOTICES_PER_ROOM = 2;

function canElementReceiveInput(el) {
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || !!el.getAttribute("contenteditable");
}

/**
 * This is what our MatrixChat shows when we are logged in. The precise view is
 * determined by the page_type property.
 *
 * Currently it's very tightly coupled with MatrixChat. We should try to do
 * something about that.
 *
 * Components mounted below us can access the matrix client via the react context.
 */
class LoggedInView extends React.Component
/*:: <IProps, IState>*/
{
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "_matrixClient", void 0);
    (0, _defineProperty2.default)(this, "_roomView", void 0);
    (0, _defineProperty2.default)(this, "_resizeContainer", void 0);
    (0, _defineProperty2.default)(this, "compactLayoutWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "resizer", void 0);
    (0, _defineProperty2.default)(this, "canResetTimelineInRoom", roomId => {
      if (!this._roomView.current) {
        return true;
      }

      return this._roomView.current.canResetTimeline();
    });
    (0, _defineProperty2.default)(this, "onAccountData", event => {
      if (event.getType() === "m.ignored_user_list") {
        _dispatcher.default.dispatch({
          action: "ignore_state_changed"
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCompactLayoutChanged", (setting, roomId, level, valueAtLevel, newValue) => {
      this.setState({
        useCompactLayout: valueAtLevel
      });
    });
    (0, _defineProperty2.default)(this, "onSync", (syncState, oldSyncState, data) => {
      const oldErrCode = this.state.syncErrorData && this.state.syncErrorData.error && this.state.syncErrorData.error.errcode;
      const newErrCode = data && data.error && data.error.errcode;
      if (syncState === oldSyncState && oldErrCode === newErrCode) return;

      if (syncState === 'ERROR') {
        this.setState({
          syncErrorData: data
        });
      } else {
        this.setState({
          syncErrorData: null
        });
      }

      if (oldSyncState === 'PREPARED' && syncState === 'SYNCING') {
        this._updateServerNoticeEvents();
      } else {
        this._calculateServerLimitToast(this.state.syncErrorData, this.state.usageLimitEventContent);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvents", (ev, state) => {
      const serverNoticeList = _RoomListStore.default.instance.orderedLists[_models.DefaultTagID.ServerNotice];

      if (serverNoticeList && serverNoticeList.some(r => r.roomId === ev.getRoomId())) {
        this._updateServerNoticeEvents();
      }
    });
    (0, _defineProperty2.default)(this, "_updateServerNoticeEvents", async () => {
      const serverNoticeList = _RoomListStore.default.instance.orderedLists[_models.DefaultTagID.ServerNotice];
      if (!serverNoticeList) return [];
      const events = [];

      for (const room of serverNoticeList) {
        const pinStateEvent = room.currentState.getStateEvents("m.room.pinned_events", "");
        if (!pinStateEvent || !pinStateEvent.getContent().pinned) continue;
        const pinnedEventIds = pinStateEvent.getContent().pinned.slice(0, MAX_PINNED_NOTICES_PER_ROOM);

        for (const eventId of pinnedEventIds) {
          const timeline = await this._matrixClient.getEventTimeline(room.getUnfilteredTimelineSet(), eventId, 0);
          const event = timeline.getEvents().find(ev => ev.getId() === eventId);
          if (event) events.push(event);
        }
      }

      const usageLimitEvent = events.find(e => {
        return e && e.getType() === 'm.room.message' && e.getContent()['server_notice_type'] === 'm.server_notice.usage_limit_reached';
      });
      const usageLimitEventContent = usageLimitEvent && usageLimitEvent.getContent();

      this._calculateServerLimitToast(this.state.syncErrorData, usageLimitEventContent);

      this.setState({
        usageLimitEventContent
      });
    });
    (0, _defineProperty2.default)(this, "_onPaste", ev => {
      let canReceiveInput = false;
      let element = ev.target; // test for all parents because the target can be a child of a contenteditable element

      while (!canReceiveInput && element) {
        canReceiveInput = canElementReceiveInput(element);
        element = element.parentElement;
      }

      if (!canReceiveInput) {
        // refocusing during a paste event will make the
        // paste end up in the newly focused element,
        // so dispatch synchronously before paste happens
        _dispatcher.default.fire(_actions.Action.FocusComposer, true);
      }
    });
    (0, _defineProperty2.default)(this, "_onReactKeyDown", ev => {
      // events caught while bubbling up on the root element
      // of this component, so something must be focused.
      this._onKeyDown(ev);
    });
    (0, _defineProperty2.default)(this, "_onNativeKeyDown", ev => {
      // only pass this if there is no focused element.
      // if there is, _onKeyDown will be called by the
      // react keydown handler that respects the react bubbling order.
      if (ev.target === document.body) {
        this._onKeyDown(ev);
      }
    });
    (0, _defineProperty2.default)(this, "_onKeyDown", ev => {
      let handled = false;
      const ctrlCmdOnly = (0, _Keyboard.isOnlyCtrlOrCmdKeyEvent)(ev);
      const hasModifier = ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey;
      const isModifier = ev.key === _Keyboard.Key.ALT || ev.key === _Keyboard.Key.CONTROL || ev.key === _Keyboard.Key.META || ev.key === _Keyboard.Key.SHIFT;
      const modKey = _Keyboard.isMac ? ev.metaKey : ev.ctrlKey;

      switch (ev.key) {
        case _Keyboard.Key.PAGE_UP:
        case _Keyboard.Key.PAGE_DOWN:
          if (!hasModifier && !isModifier) {
            this._onScrollKeyPressed(ev);

            handled = true;
          }

          break;

        case _Keyboard.Key.HOME:
        case _Keyboard.Key.END:
          if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
            this._onScrollKeyPressed(ev);

            handled = true;
          }

          break;

        case _Keyboard.Key.K:
          if (ctrlCmdOnly) {
            _dispatcher.default.dispatch({
              action: 'focus_room_filter'
            });

            handled = true;
          }

          break;

        case _Keyboard.Key.F:
          if (ctrlCmdOnly && _SettingsStore.default.getValue("ctrlFForSearch")) {
            _dispatcher.default.dispatch({
              action: 'focus_search'
            });

            handled = true;
          }

          break;

        case _Keyboard.Key.BACKTICK:
          // Ideally this would be CTRL+P for "Profile", but that's
          // taken by the print dialog. CTRL+I for "Information"
          // was previously chosen but conflicted with italics in
          // composer, so CTRL+` it is
          if (ctrlCmdOnly) {
            _dispatcher.default.fire(_actions.Action.ToggleUserMenu);

            handled = true;
          }

          break;

        case _Keyboard.Key.SLASH:
          if ((0, _Keyboard.isOnlyCtrlOrCmdIgnoreShiftKeyEvent)(ev)) {
            KeyboardShortcuts.toggleDialog();
            handled = true;
          }

          break;

        case _Keyboard.Key.H:
          if (ev.altKey && modKey) {
            _dispatcher.default.dispatch({
              action: 'view_home_page'
            });

            _Modal.default.closeCurrentModal("homeKeyboardShortcut");

            handled = true;
          }

          break;

        case _Keyboard.Key.ARROW_UP:
        case _Keyboard.Key.ARROW_DOWN:
          if (ev.altKey && !ev.ctrlKey && !ev.metaKey) {
            _dispatcher.default.dispatch({
              action: _actions.Action.ViewRoomDelta,
              delta: ev.key === _Keyboard.Key.ARROW_UP ? -1 : 1,
              unread: ev.shiftKey
            });

            handled = true;
          }

          break;

        case _Keyboard.Key.PERIOD:
          if (ctrlCmdOnly && (this.props.page_type === "room_view" || this.props.page_type === "group_view")) {
            _dispatcher.default.dispatch({
              action: _actions.Action.ToggleRightPanel,
              type: this.props.page_type === "room_view" ? "room" : "group"
            });

            handled = true;
          }

          break;

        default:
          // if we do not have a handler for it, pass it to the platform which might
          handled = _PlatformPeg.default.get().onKeyDown(ev);
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
      } else if (!isModifier && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
        // The above condition is crafted to _allow_ characters with Shift
        // already pressed (but not the Shift key down itself).
        const isClickShortcut = ev.target !== document.body && (ev.key === _Keyboard.Key.SPACE || ev.key === _Keyboard.Key.ENTER); // Do not capture the context menu key to improve keyboard accessibility

        if (ev.key === _Keyboard.Key.CONTEXT_MENU) {
          return;
        }

        if (!isClickShortcut && ev.key !== _Keyboard.Key.TAB && !canElementReceiveInput(ev.target)) {
          // synchronous dispatch so we focus before key generates input
          _dispatcher.default.fire(_actions.Action.FocusComposer, true);

          ev.stopPropagation(); // we should *not* preventDefault() here as
          // that would prevent typing in the now-focussed composer
        }
      }
    });
    (0, _defineProperty2.default)(this, "_onScrollKeyPressed", ev => {
      if (this._roomView.current) {
        this._roomView.current.handleScrollKey(ev);
      }
    });
    (0, _defineProperty2.default)(this, "_onDragEnd", result => {
      // Dragged to an invalid destination, not onto a droppable
      if (!result.destination) {
        return;
      }

      const dest = result.destination.droppableId;

      if (dest === 'tag-panel-droppable') {
        // Could be "GroupTile +groupId:domain"
        const draggableId = result.draggableId.split(' ').pop(); // Dispatch synchronously so that the GroupFilterPanel receives an
        // optimistic update from GroupFilterOrderStore before the previous
        // state is shown.

        _dispatcher.default.dispatch(_TagOrderActions.default.moveTag(this._matrixClient, draggableId, result.destination.index), true);
      } else if (dest.startsWith('room-sub-list-droppable_')) {
        this._onRoomTileEndDrag(result);
      }
    });
    (0, _defineProperty2.default)(this, "_onRoomTileEndDrag", result => {
      let newTag = result.destination.droppableId.split('_')[1];
      let prevTag = result.source.droppableId.split('_')[1];
      if (newTag === 'undefined') newTag = undefined;
      if (prevTag === 'undefined') prevTag = undefined;
      const roomId = result.draggableId.split('_')[1];
      const oldIndex = result.source.index;
      const newIndex = result.destination.index;

      _dispatcher.default.dispatch(_RoomListActions.default.tagRoom(this._matrixClient, this._matrixClient.getRoom(roomId), prevTag, newTag, oldIndex, newIndex), true);
    });
    this.state = {
      syncErrorData: undefined,
      // use compact timeline view
      useCompactLayout: _SettingsStore.default.getValue('useCompactLayout')
    }; // stash the MatrixClient in case we log out before we are unmounted

    this._matrixClient = this.props.matrixClient;

    _CallMediaHandler.default.loadDevices();

    (0, _FontManager.fixupColorFonts)();
    this._roomView = /*#__PURE__*/React.createRef();
    this._resizeContainer = /*#__PURE__*/React.createRef();
  }

  componentDidMount() {
    document.addEventListener('keydown', this._onNativeKeyDown, false);

    this._updateServerNoticeEvents();

    this._matrixClient.on("accountData", this.onAccountData);

    this._matrixClient.on("sync", this.onSync); // Call `onSync` with the current state as well


    this.onSync(this._matrixClient.getSyncState(), null, this._matrixClient.getSyncStateData());

    this._matrixClient.on("RoomState.events", this.onRoomStateEvents);

    this.compactLayoutWatcherRef = _SettingsStore.default.watchSetting("useCompactLayout", null, this.onCompactLayoutChanged);
    this.resizer = this._createResizer();
    this.resizer.attach();

    this._loadResizerPreferences();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onNativeKeyDown, false);

    this._matrixClient.removeListener("accountData", this.onAccountData);

    this._matrixClient.removeListener("sync", this.onSync);

    this._matrixClient.removeListener("RoomState.events", this.onRoomStateEvents);

    _SettingsStore.default.unwatchSetting(this.compactLayoutWatcherRef);

    this.resizer.detach();
  } // Child components assume that the client peg will not be null, so give them some
  // sort of assurance here by only allowing a re-render if the client is truthy.
  //
  // This is required because `LoggedInView` maintains its own state and if this state
  // updates after the client peg has been made null (during logout), then it will
  // attempt to re-render and the children will throw errors.


  shouldComponentUpdate() {
    return Boolean(_MatrixClientPeg.MatrixClientPeg.get());
  }

  _createResizer() {
    let size;
    let collapsed;
    const collapseConfig
    /*: ICollapseConfig*/
    = {
      toggleSize: 260 - 50,
      onCollapsed: _collapsed => {
        collapsed = _collapsed;

        if (_collapsed) {
          _dispatcher.default.dispatch({
            action: "hide_left_panel"
          }, true);

          window.localStorage.setItem("mx_lhs_size", '0');
        } else {
          _dispatcher.default.dispatch({
            action: "show_left_panel"
          }, true);
        }
      },
      onResized: _size => {
        size = _size;
        this.props.resizeNotifier.notifyLeftHandleResized();
      },
      onResizeStart: () => {
        this.props.resizeNotifier.startResizing();
      },
      onResizeStop: () => {
        if (!collapsed) window.localStorage.setItem("mx_lhs_size", '' + size);
        this.props.resizeNotifier.stopResizing();
      }
    };
    const resizer = new _resizer.Resizer(this._resizeContainer.current, _resizer.CollapseDistributor, collapseConfig);
    resizer.setClassNames({
      handle: "mx_ResizeHandle",
      vertical: "mx_ResizeHandle_vertical",
      reverse: "mx_ResizeHandle_reverse"
    });
    return resizer;
  }

  _loadResizerPreferences() {
    let lhsSize = parseInt(window.localStorage.getItem("mx_lhs_size"), 10);

    if (isNaN(lhsSize)) {
      lhsSize = 350;
    }

    this.resizer.forHandleAt(0).resize(lhsSize);
  }

  _calculateServerLimitToast(syncError
  /*: IState["syncErrorData"]*/
  , usageLimitEventContent
  /*: IUsageLimit*/
  ) {
    const error = syncError && syncError.error && syncError.error.errcode === "M_RESOURCE_LIMIT_EXCEEDED";

    if (error) {
      usageLimitEventContent = syncError.error.data;
    }

    if (usageLimitEventContent) {
      (0, _ServerLimitToast.showToast)(usageLimitEventContent.limit_type, usageLimitEventContent.admin_contact, error);
    } else {
      (0, _ServerLimitToast.hideToast)();
    }
  }

  render() {
    const RoomView = sdk.getComponent('structures.RoomView');
    const UserView = sdk.getComponent('structures.UserView');
    const GroupView = sdk.getComponent('structures.GroupView');
    const MyGroups = sdk.getComponent('structures.MyGroups');
    const ToastContainer = sdk.getComponent('structures.ToastContainer');
    let pageElement;

    switch (this.props.page_type) {
      case _PageTypes.default.RoomView:
        pageElement = /*#__PURE__*/React.createElement(RoomView, {
          ref: this._roomView,
          autoJoin: this.props.autoJoin,
          onRegistered: this.props.onRegistered,
          threepidInvite: this.props.threepidInvite,
          oobData: this.props.roomOobData,
          viaServers: this.props.viaServers,
          key: this.props.currentRoomId || 'roomview',
          resizeNotifier: this.props.resizeNotifier
        });
        break;

      case _PageTypes.default.MyGroups:
        pageElement = /*#__PURE__*/React.createElement(MyGroups, null);
        break;

      case _PageTypes.default.RoomDirectory:
        // handled by MatrixChat for now
        break;

      case _PageTypes.default.HomePage:
        pageElement = /*#__PURE__*/React.createElement(_HomePage.default, {
          justRegistered: this.props.justRegistered
        });
        break;

      case _PageTypes.default.UserView:
        pageElement = /*#__PURE__*/React.createElement(UserView, {
          userId: this.props.currentUserId,
          resizeNotifier: this.props.resizeNotifier
        });
        break;

      case _PageTypes.default.GroupView:
        pageElement = /*#__PURE__*/React.createElement(GroupView, {
          groupId: this.props.currentGroupId,
          isNew: this.props.currentGroupIsNew,
          resizeNotifier: this.props.resizeNotifier
        });
        break;
    }

    let bodyClasses = 'mx_MatrixChat';

    if (this.state.useCompactLayout) {
      bodyClasses += ' mx_MatrixChat_useCompactLayout';
    }

    const leftPanel = /*#__PURE__*/React.createElement(_LeftPanel.default, {
      isMinimized: this.props.collapseLhs || false,
      resizeNotifier: this.props.resizeNotifier
    });
    return /*#__PURE__*/React.createElement(_MatrixClientContext.default.Provider, {
      value: this._matrixClient
    }, /*#__PURE__*/React.createElement("div", {
      onPaste: this._onPaste,
      onKeyDown: this._onReactKeyDown,
      className: "mx_MatrixChat_wrapper",
      "aria-hidden": this.props.hideToSRUsers
    }, /*#__PURE__*/React.createElement(ToastContainer, null), /*#__PURE__*/React.createElement(_reactBeautifulDnd.DragDropContext, {
      onDragEnd: this._onDragEnd
    }, /*#__PURE__*/React.createElement("div", {
      ref: this._resizeContainer,
      className: bodyClasses
    }, leftPanel, /*#__PURE__*/React.createElement(_ResizeHandle.default, null), pageElement))), /*#__PURE__*/React.createElement(_CallContainer.default, null), /*#__PURE__*/React.createElement(_NonUrgentToastContainer.default, null), /*#__PURE__*/React.createElement(_HostSignupContainer.default, null));
  }

}

(0, _defineProperty2.default)(LoggedInView, "displayName", 'LoggedInView');
(0, _defineProperty2.default)(LoggedInView, "propTypes", {
  matrixClient: PropTypes.instanceOf(_client.MatrixClient).isRequired,
  page_type: PropTypes.string.isRequired,
  onRoomCreated: PropTypes.func,
  // Called with the credentials of a registered user (if they were a ROU that
  // transitioned to PWLU)
  onRegistered: PropTypes.func,
  // Used by the RoomView to handle joining rooms
  viaServers: PropTypes.arrayOf(PropTypes.string) // and lots and lots of other stuff.

});
var _default = LoggedInView;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTG9nZ2VkSW5WaWV3LnRzeCJdLCJuYW1lcyI6WyJNQVhfUElOTkVEX05PVElDRVNfUEVSX1JPT00iLCJjYW5FbGVtZW50UmVjZWl2ZUlucHV0IiwiZWwiLCJ0YWdOYW1lIiwiZ2V0QXR0cmlidXRlIiwiTG9nZ2VkSW5WaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInJvb21JZCIsIl9yb29tVmlldyIsImN1cnJlbnQiLCJjYW5SZXNldFRpbWVsaW5lIiwiZXZlbnQiLCJnZXRUeXBlIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJzZXR0aW5nIiwibGV2ZWwiLCJ2YWx1ZUF0TGV2ZWwiLCJuZXdWYWx1ZSIsInNldFN0YXRlIiwidXNlQ29tcGFjdExheW91dCIsInN5bmNTdGF0ZSIsIm9sZFN5bmNTdGF0ZSIsImRhdGEiLCJvbGRFcnJDb2RlIiwic3RhdGUiLCJzeW5jRXJyb3JEYXRhIiwiZXJyb3IiLCJlcnJjb2RlIiwibmV3RXJyQ29kZSIsIl91cGRhdGVTZXJ2ZXJOb3RpY2VFdmVudHMiLCJfY2FsY3VsYXRlU2VydmVyTGltaXRUb2FzdCIsInVzYWdlTGltaXRFdmVudENvbnRlbnQiLCJldiIsInNlcnZlck5vdGljZUxpc3QiLCJSb29tTGlzdFN0b3JlIiwiaW5zdGFuY2UiLCJvcmRlcmVkTGlzdHMiLCJEZWZhdWx0VGFnSUQiLCJTZXJ2ZXJOb3RpY2UiLCJzb21lIiwiciIsImdldFJvb21JZCIsImV2ZW50cyIsInJvb20iLCJwaW5TdGF0ZUV2ZW50IiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJnZXRDb250ZW50IiwicGlubmVkIiwicGlubmVkRXZlbnRJZHMiLCJzbGljZSIsImV2ZW50SWQiLCJ0aW1lbGluZSIsIl9tYXRyaXhDbGllbnQiLCJnZXRFdmVudFRpbWVsaW5lIiwiZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0IiwiZ2V0RXZlbnRzIiwiZmluZCIsImdldElkIiwicHVzaCIsInVzYWdlTGltaXRFdmVudCIsImUiLCJjYW5SZWNlaXZlSW5wdXQiLCJlbGVtZW50IiwidGFyZ2V0IiwicGFyZW50RWxlbWVudCIsImZpcmUiLCJBY3Rpb24iLCJGb2N1c0NvbXBvc2VyIiwiX29uS2V5RG93biIsImRvY3VtZW50IiwiYm9keSIsImhhbmRsZWQiLCJjdHJsQ21kT25seSIsImhhc01vZGlmaWVyIiwiYWx0S2V5IiwiY3RybEtleSIsIm1ldGFLZXkiLCJzaGlmdEtleSIsImlzTW9kaWZpZXIiLCJrZXkiLCJLZXkiLCJBTFQiLCJDT05UUk9MIiwiTUVUQSIsIlNISUZUIiwibW9kS2V5IiwiaXNNYWMiLCJQQUdFX1VQIiwiUEFHRV9ET1dOIiwiX29uU2Nyb2xsS2V5UHJlc3NlZCIsIkhPTUUiLCJFTkQiLCJLIiwiRiIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIkJBQ0tUSUNLIiwiVG9nZ2xlVXNlck1lbnUiLCJTTEFTSCIsIktleWJvYXJkU2hvcnRjdXRzIiwidG9nZ2xlRGlhbG9nIiwiSCIsIk1vZGFsIiwiY2xvc2VDdXJyZW50TW9kYWwiLCJBUlJPV19VUCIsIkFSUk9XX0RPV04iLCJWaWV3Um9vbURlbHRhIiwiZGVsdGEiLCJ1bnJlYWQiLCJQRVJJT0QiLCJwYWdlX3R5cGUiLCJUb2dnbGVSaWdodFBhbmVsIiwidHlwZSIsIlBsYXRmb3JtUGVnIiwiZ2V0Iiwib25LZXlEb3duIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJpc0NsaWNrU2hvcnRjdXQiLCJTUEFDRSIsIkVOVEVSIiwiQ09OVEVYVF9NRU5VIiwiVEFCIiwiaGFuZGxlU2Nyb2xsS2V5IiwicmVzdWx0IiwiZGVzdGluYXRpb24iLCJkZXN0IiwiZHJvcHBhYmxlSWQiLCJkcmFnZ2FibGVJZCIsInNwbGl0IiwicG9wIiwiVGFnT3JkZXJBY3Rpb25zIiwibW92ZVRhZyIsImluZGV4Iiwic3RhcnRzV2l0aCIsIl9vblJvb21UaWxlRW5kRHJhZyIsIm5ld1RhZyIsInByZXZUYWciLCJzb3VyY2UiLCJ1bmRlZmluZWQiLCJvbGRJbmRleCIsIm5ld0luZGV4IiwiUm9vbUxpc3RBY3Rpb25zIiwidGFnUm9vbSIsImdldFJvb20iLCJtYXRyaXhDbGllbnQiLCJDYWxsTWVkaWFIYW5kbGVyIiwibG9hZERldmljZXMiLCJjcmVhdGVSZWYiLCJfcmVzaXplQ29udGFpbmVyIiwiY29tcG9uZW50RGlkTW91bnQiLCJhZGRFdmVudExpc3RlbmVyIiwiX29uTmF0aXZlS2V5RG93biIsIm9uIiwib25BY2NvdW50RGF0YSIsIm9uU3luYyIsImdldFN5bmNTdGF0ZSIsImdldFN5bmNTdGF0ZURhdGEiLCJvblJvb21TdGF0ZUV2ZW50cyIsImNvbXBhY3RMYXlvdXRXYXRjaGVyUmVmIiwid2F0Y2hTZXR0aW5nIiwib25Db21wYWN0TGF5b3V0Q2hhbmdlZCIsInJlc2l6ZXIiLCJfY3JlYXRlUmVzaXplciIsImF0dGFjaCIsIl9sb2FkUmVzaXplclByZWZlcmVuY2VzIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJ1bndhdGNoU2V0dGluZyIsImRldGFjaCIsInNob3VsZENvbXBvbmVudFVwZGF0ZSIsIkJvb2xlYW4iLCJNYXRyaXhDbGllbnRQZWciLCJzaXplIiwiY29sbGFwc2VkIiwiY29sbGFwc2VDb25maWciLCJ0b2dnbGVTaXplIiwib25Db2xsYXBzZWQiLCJfY29sbGFwc2VkIiwid2luZG93IiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsIm9uUmVzaXplZCIsIl9zaXplIiwicmVzaXplTm90aWZpZXIiLCJub3RpZnlMZWZ0SGFuZGxlUmVzaXplZCIsIm9uUmVzaXplU3RhcnQiLCJzdGFydFJlc2l6aW5nIiwib25SZXNpemVTdG9wIiwic3RvcFJlc2l6aW5nIiwiUmVzaXplciIsIkNvbGxhcHNlRGlzdHJpYnV0b3IiLCJzZXRDbGFzc05hbWVzIiwiaGFuZGxlIiwidmVydGljYWwiLCJyZXZlcnNlIiwibGhzU2l6ZSIsInBhcnNlSW50IiwiZ2V0SXRlbSIsImlzTmFOIiwiZm9ySGFuZGxlQXQiLCJyZXNpemUiLCJzeW5jRXJyb3IiLCJsaW1pdF90eXBlIiwiYWRtaW5fY29udGFjdCIsInJlbmRlciIsIlJvb21WaWV3Iiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiVXNlclZpZXciLCJHcm91cFZpZXciLCJNeUdyb3VwcyIsIlRvYXN0Q29udGFpbmVyIiwicGFnZUVsZW1lbnQiLCJQYWdlVHlwZXMiLCJhdXRvSm9pbiIsIm9uUmVnaXN0ZXJlZCIsInRocmVlcGlkSW52aXRlIiwicm9vbU9vYkRhdGEiLCJ2aWFTZXJ2ZXJzIiwiY3VycmVudFJvb21JZCIsIlJvb21EaXJlY3RvcnkiLCJIb21lUGFnZSIsImp1c3RSZWdpc3RlcmVkIiwiY3VycmVudFVzZXJJZCIsImN1cnJlbnRHcm91cElkIiwiY3VycmVudEdyb3VwSXNOZXciLCJib2R5Q2xhc3NlcyIsImxlZnRQYW5lbCIsImNvbGxhcHNlTGhzIiwiX29uUGFzdGUiLCJfb25SZWFjdEtleURvd24iLCJoaWRlVG9TUlVzZXJzIiwiX29uRHJhZ0VuZCIsIlByb3BUeXBlcyIsImluc3RhbmNlT2YiLCJNYXRyaXhDbGllbnQiLCJpc1JlcXVpcmVkIiwic3RyaW5nIiwib25Sb29tQ3JlYXRlZCIsImZ1bmMiLCJhcnJheU9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUlBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUdBOztBQUVBOztBQXhEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBMENBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLDJCQUEyQixHQUFHLENBQXBDOztBQUVBLFNBQVNDLHNCQUFULENBQWdDQyxFQUFoQyxFQUFvQztBQUNoQyxTQUFPQSxFQUFFLENBQUNDLE9BQUgsS0FBZSxPQUFmLElBQ0hELEVBQUUsQ0FBQ0MsT0FBSCxLQUFlLFVBRFosSUFFSEQsRUFBRSxDQUFDQyxPQUFILEtBQWUsUUFGWixJQUdILENBQUMsQ0FBQ0QsRUFBRSxDQUFDRSxZQUFILENBQWdCLGlCQUFoQixDQUhOO0FBSUg7O0FBNkNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLFlBQU4sU0FBMkJDLEtBQUssQ0FBQ0M7QUFBakM7QUFBMkQ7QUF3QnZEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUUMsT0FBUixFQUFpQjtBQUN4QixVQUFNRCxLQUFOLEVBQWFDLE9BQWI7QUFEd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtFQStERkMsTUFBRCxJQUFZO0FBQ2pDLFVBQUksQ0FBQyxLQUFLQyxTQUFMLENBQWVDLE9BQXBCLEVBQTZCO0FBQ3pCLGVBQU8sSUFBUDtBQUNIOztBQUNELGFBQU8sS0FBS0QsU0FBTCxDQUFlQyxPQUFmLENBQXVCQyxnQkFBdkIsRUFBUDtBQUNILEtBcEUyQjtBQUFBLHlEQWlIWEMsS0FBRCxJQUFXO0FBQ3ZCLFVBQUlBLEtBQUssQ0FBQ0MsT0FBTixPQUFvQixxQkFBeEIsRUFBK0M7QUFDM0NDLDRCQUFJQyxRQUFKLENBQWE7QUFBQ0MsVUFBQUEsTUFBTSxFQUFFO0FBQVQsU0FBYjtBQUNIO0FBQ0osS0FySDJCO0FBQUEsa0VBdUhILENBQUNDLE9BQUQsRUFBVVQsTUFBVixFQUFrQlUsS0FBbEIsRUFBeUJDLFlBQXpCLEVBQXVDQyxRQUF2QyxLQUFvRDtBQUN6RSxXQUFLQyxRQUFMLENBQWM7QUFDVkMsUUFBQUEsZ0JBQWdCLEVBQUVIO0FBRFIsT0FBZDtBQUdILEtBM0gyQjtBQUFBLGtEQTZIbkIsQ0FBQ0ksU0FBRCxFQUFZQyxZQUFaLEVBQTBCQyxJQUExQixLQUFtQztBQUN4QyxZQUFNQyxVQUFVLEdBQ1osS0FBS0MsS0FBTCxDQUFXQyxhQUFYLElBQ0EsS0FBS0QsS0FBTCxDQUFXQyxhQUFYLENBQXlCQyxLQUR6QixJQUVBLEtBQUtGLEtBQUwsQ0FBV0MsYUFBWCxDQUF5QkMsS0FBekIsQ0FBK0JDLE9BSG5DO0FBS0EsWUFBTUMsVUFBVSxHQUFHTixJQUFJLElBQUlBLElBQUksQ0FBQ0ksS0FBYixJQUFzQkosSUFBSSxDQUFDSSxLQUFMLENBQVdDLE9BQXBEO0FBQ0EsVUFBSVAsU0FBUyxLQUFLQyxZQUFkLElBQThCRSxVQUFVLEtBQUtLLFVBQWpELEVBQTZEOztBQUU3RCxVQUFJUixTQUFTLEtBQUssT0FBbEIsRUFBMkI7QUFDdkIsYUFBS0YsUUFBTCxDQUFjO0FBQ1ZPLFVBQUFBLGFBQWEsRUFBRUg7QUFETCxTQUFkO0FBR0gsT0FKRCxNQUlPO0FBQ0gsYUFBS0osUUFBTCxDQUFjO0FBQ1ZPLFVBQUFBLGFBQWEsRUFBRTtBQURMLFNBQWQ7QUFHSDs7QUFFRCxVQUFJSixZQUFZLEtBQUssVUFBakIsSUFBK0JELFNBQVMsS0FBSyxTQUFqRCxFQUE0RDtBQUN4RCxhQUFLUyx5QkFBTDtBQUNILE9BRkQsTUFFTztBQUNILGFBQUtDLDBCQUFMLENBQWdDLEtBQUtOLEtBQUwsQ0FBV0MsYUFBM0MsRUFBMEQsS0FBS0QsS0FBTCxDQUFXTyxzQkFBckU7QUFDSDtBQUNKLEtBckoyQjtBQUFBLDZEQXVKUixDQUFDQyxFQUFELEVBQUtSLEtBQUwsS0FBZTtBQUMvQixZQUFNUyxnQkFBZ0IsR0FBR0MsdUJBQWNDLFFBQWQsQ0FBdUJDLFlBQXZCLENBQW9DQyxxQkFBYUMsWUFBakQsQ0FBekI7O0FBQ0EsVUFBSUwsZ0JBQWdCLElBQUlBLGdCQUFnQixDQUFDTSxJQUFqQixDQUFzQkMsQ0FBQyxJQUFJQSxDQUFDLENBQUNuQyxNQUFGLEtBQWEyQixFQUFFLENBQUNTLFNBQUgsRUFBeEMsQ0FBeEIsRUFBaUY7QUFDN0UsYUFBS1oseUJBQUw7QUFDSDtBQUNKLEtBNUoyQjtBQUFBLHFFQTJLQSxZQUFZO0FBQ3BDLFlBQU1JLGdCQUFnQixHQUFHQyx1QkFBY0MsUUFBZCxDQUF1QkMsWUFBdkIsQ0FBb0NDLHFCQUFhQyxZQUFqRCxDQUF6QjtBQUNBLFVBQUksQ0FBQ0wsZ0JBQUwsRUFBdUIsT0FBTyxFQUFQO0FBRXZCLFlBQU1TLE1BQU0sR0FBRyxFQUFmOztBQUNBLFdBQUssTUFBTUMsSUFBWCxJQUFtQlYsZ0JBQW5CLEVBQXFDO0FBQ2pDLGNBQU1XLGFBQWEsR0FBR0QsSUFBSSxDQUFDRSxZQUFMLENBQWtCQyxjQUFsQixDQUFpQyxzQkFBakMsRUFBeUQsRUFBekQsQ0FBdEI7QUFFQSxZQUFJLENBQUNGLGFBQUQsSUFBa0IsQ0FBQ0EsYUFBYSxDQUFDRyxVQUFkLEdBQTJCQyxNQUFsRCxFQUEwRDtBQUUxRCxjQUFNQyxjQUFjLEdBQUdMLGFBQWEsQ0FBQ0csVUFBZCxHQUEyQkMsTUFBM0IsQ0FBa0NFLEtBQWxDLENBQXdDLENBQXhDLEVBQTJDeEQsMkJBQTNDLENBQXZCOztBQUNBLGFBQUssTUFBTXlELE9BQVgsSUFBc0JGLGNBQXRCLEVBQXNDO0FBQ2xDLGdCQUFNRyxRQUFRLEdBQUcsTUFBTSxLQUFLQyxhQUFMLENBQW1CQyxnQkFBbkIsQ0FBb0NYLElBQUksQ0FBQ1ksd0JBQUwsRUFBcEMsRUFBcUVKLE9BQXJFLEVBQThFLENBQTlFLENBQXZCO0FBQ0EsZ0JBQU0xQyxLQUFLLEdBQUcyQyxRQUFRLENBQUNJLFNBQVQsR0FBcUJDLElBQXJCLENBQTBCekIsRUFBRSxJQUFJQSxFQUFFLENBQUMwQixLQUFILE9BQWVQLE9BQS9DLENBQWQ7QUFDQSxjQUFJMUMsS0FBSixFQUFXaUMsTUFBTSxDQUFDaUIsSUFBUCxDQUFZbEQsS0FBWjtBQUNkO0FBQ0o7O0FBRUQsWUFBTW1ELGVBQWUsR0FBR2xCLE1BQU0sQ0FBQ2UsSUFBUCxDQUFhSSxDQUFELElBQU87QUFDdkMsZUFDSUEsQ0FBQyxJQUFJQSxDQUFDLENBQUNuRCxPQUFGLE9BQWdCLGdCQUFyQixJQUNBbUQsQ0FBQyxDQUFDZCxVQUFGLEdBQWUsb0JBQWYsTUFBeUMscUNBRjdDO0FBSUgsT0FMdUIsQ0FBeEI7QUFNQSxZQUFNaEIsc0JBQXNCLEdBQUc2QixlQUFlLElBQUlBLGVBQWUsQ0FBQ2IsVUFBaEIsRUFBbEQ7O0FBQ0EsV0FBS2pCLDBCQUFMLENBQWdDLEtBQUtOLEtBQUwsQ0FBV0MsYUFBM0MsRUFBMERNLHNCQUExRDs7QUFDQSxXQUFLYixRQUFMLENBQWM7QUFBRWEsUUFBQUE7QUFBRixPQUFkO0FBQ0gsS0F0TTJCO0FBQUEsb0RBd01oQkMsRUFBRCxJQUFRO0FBQ2YsVUFBSThCLGVBQWUsR0FBRyxLQUF0QjtBQUNBLFVBQUlDLE9BQU8sR0FBRy9CLEVBQUUsQ0FBQ2dDLE1BQWpCLENBRmUsQ0FHZjs7QUFDQSxhQUFPLENBQUNGLGVBQUQsSUFBb0JDLE9BQTNCLEVBQW9DO0FBQ2hDRCxRQUFBQSxlQUFlLEdBQUduRSxzQkFBc0IsQ0FBQ29FLE9BQUQsQ0FBeEM7QUFDQUEsUUFBQUEsT0FBTyxHQUFHQSxPQUFPLENBQUNFLGFBQWxCO0FBQ0g7O0FBQ0QsVUFBSSxDQUFDSCxlQUFMLEVBQXNCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBbkQsNEJBQUl1RCxJQUFKLENBQVNDLGdCQUFPQyxhQUFoQixFQUErQixJQUEvQjtBQUNIO0FBQ0osS0F0TjJCO0FBQUEsMkRBOE9UcEMsRUFBRCxJQUFRO0FBQ3RCO0FBQ0E7QUFDQSxXQUFLcUMsVUFBTCxDQUFnQnJDLEVBQWhCO0FBQ0gsS0FsUDJCO0FBQUEsNERBb1BSQSxFQUFELElBQVE7QUFDdkI7QUFDQTtBQUNBO0FBQ0EsVUFBSUEsRUFBRSxDQUFDZ0MsTUFBSCxLQUFjTSxRQUFRLENBQUNDLElBQTNCLEVBQWlDO0FBQzdCLGFBQUtGLFVBQUwsQ0FBZ0JyQyxFQUFoQjtBQUNIO0FBQ0osS0EzUDJCO0FBQUEsc0RBNlBkQSxFQUFELElBQVE7QUFDakIsVUFBSXdDLE9BQU8sR0FBRyxLQUFkO0FBQ0EsWUFBTUMsV0FBVyxHQUFHLHVDQUF3QnpDLEVBQXhCLENBQXBCO0FBQ0EsWUFBTTBDLFdBQVcsR0FBRzFDLEVBQUUsQ0FBQzJDLE1BQUgsSUFBYTNDLEVBQUUsQ0FBQzRDLE9BQWhCLElBQTJCNUMsRUFBRSxDQUFDNkMsT0FBOUIsSUFBeUM3QyxFQUFFLENBQUM4QyxRQUFoRTtBQUNBLFlBQU1DLFVBQVUsR0FBRy9DLEVBQUUsQ0FBQ2dELEdBQUgsS0FBV0MsY0FBSUMsR0FBZixJQUFzQmxELEVBQUUsQ0FBQ2dELEdBQUgsS0FBV0MsY0FBSUUsT0FBckMsSUFBZ0RuRCxFQUFFLENBQUNnRCxHQUFILEtBQVdDLGNBQUlHLElBQS9ELElBQXVFcEQsRUFBRSxDQUFDZ0QsR0FBSCxLQUFXQyxjQUFJSSxLQUF6RztBQUNBLFlBQU1DLE1BQU0sR0FBR0Msa0JBQVF2RCxFQUFFLENBQUM2QyxPQUFYLEdBQXFCN0MsRUFBRSxDQUFDNEMsT0FBdkM7O0FBRUEsY0FBUTVDLEVBQUUsQ0FBQ2dELEdBQVg7QUFDSSxhQUFLQyxjQUFJTyxPQUFUO0FBQ0EsYUFBS1AsY0FBSVEsU0FBVDtBQUNJLGNBQUksQ0FBQ2YsV0FBRCxJQUFnQixDQUFDSyxVQUFyQixFQUFpQztBQUM3QixpQkFBS1csbUJBQUwsQ0FBeUIxRCxFQUF6Qjs7QUFDQXdDLFlBQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0g7O0FBQ0Q7O0FBRUosYUFBS1MsY0FBSVUsSUFBVDtBQUNBLGFBQUtWLGNBQUlXLEdBQVQ7QUFDSSxjQUFJNUQsRUFBRSxDQUFDNEMsT0FBSCxJQUFjLENBQUM1QyxFQUFFLENBQUM4QyxRQUFsQixJQUE4QixDQUFDOUMsRUFBRSxDQUFDMkMsTUFBbEMsSUFBNEMsQ0FBQzNDLEVBQUUsQ0FBQzZDLE9BQXBELEVBQTZEO0FBQ3pELGlCQUFLYSxtQkFBTCxDQUF5QjFELEVBQXpCOztBQUNBd0MsWUFBQUEsT0FBTyxHQUFHLElBQVY7QUFDSDs7QUFDRDs7QUFDSixhQUFLUyxjQUFJWSxDQUFUO0FBQ0ksY0FBSXBCLFdBQUosRUFBaUI7QUFDYjlELGdDQUFJQyxRQUFKLENBQWE7QUFDVEMsY0FBQUEsTUFBTSxFQUFFO0FBREMsYUFBYjs7QUFHQTJELFlBQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0g7O0FBQ0Q7O0FBQ0osYUFBS1MsY0FBSWEsQ0FBVDtBQUNJLGNBQUlyQixXQUFXLElBQUlzQix1QkFBY0MsUUFBZCxDQUF1QixnQkFBdkIsQ0FBbkIsRUFBNkQ7QUFDekRyRixnQ0FBSUMsUUFBSixDQUFhO0FBQ1RDLGNBQUFBLE1BQU0sRUFBRTtBQURDLGFBQWI7O0FBR0EyRCxZQUFBQSxPQUFPLEdBQUcsSUFBVjtBQUNIOztBQUNEOztBQUNKLGFBQUtTLGNBQUlnQixRQUFUO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFFQSxjQUFJeEIsV0FBSixFQUFpQjtBQUNiOUQsZ0NBQUl1RCxJQUFKLENBQVNDLGdCQUFPK0IsY0FBaEI7O0FBQ0ExQixZQUFBQSxPQUFPLEdBQUcsSUFBVjtBQUNIOztBQUNEOztBQUVKLGFBQUtTLGNBQUlrQixLQUFUO0FBQ0ksY0FBSSxrREFBbUNuRSxFQUFuQyxDQUFKLEVBQTRDO0FBQ3hDb0UsWUFBQUEsaUJBQWlCLENBQUNDLFlBQWxCO0FBQ0E3QixZQUFBQSxPQUFPLEdBQUcsSUFBVjtBQUNIOztBQUNEOztBQUVKLGFBQUtTLGNBQUlxQixDQUFUO0FBQ0ksY0FBSXRFLEVBQUUsQ0FBQzJDLE1BQUgsSUFBYVcsTUFBakIsRUFBeUI7QUFDckIzRSxnQ0FBSUMsUUFBSixDQUFhO0FBQ1RDLGNBQUFBLE1BQU0sRUFBRTtBQURDLGFBQWI7O0FBR0EwRiwyQkFBTUMsaUJBQU4sQ0FBd0Isc0JBQXhCOztBQUNBaEMsWUFBQUEsT0FBTyxHQUFHLElBQVY7QUFDSDs7QUFDRDs7QUFFSixhQUFLUyxjQUFJd0IsUUFBVDtBQUNBLGFBQUt4QixjQUFJeUIsVUFBVDtBQUNJLGNBQUkxRSxFQUFFLENBQUMyQyxNQUFILElBQWEsQ0FBQzNDLEVBQUUsQ0FBQzRDLE9BQWpCLElBQTRCLENBQUM1QyxFQUFFLENBQUM2QyxPQUFwQyxFQUE2QztBQUN6Q2xFLGdDQUFJQyxRQUFKLENBQW1DO0FBQy9CQyxjQUFBQSxNQUFNLEVBQUVzRCxnQkFBT3dDLGFBRGdCO0FBRS9CQyxjQUFBQSxLQUFLLEVBQUU1RSxFQUFFLENBQUNnRCxHQUFILEtBQVdDLGNBQUl3QixRQUFmLEdBQTBCLENBQUMsQ0FBM0IsR0FBK0IsQ0FGUDtBQUcvQkksY0FBQUEsTUFBTSxFQUFFN0UsRUFBRSxDQUFDOEM7QUFIb0IsYUFBbkM7O0FBS0FOLFlBQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0g7O0FBQ0Q7O0FBRUosYUFBS1MsY0FBSTZCLE1BQVQ7QUFDSSxjQUFJckMsV0FBVyxLQUFLLEtBQUt0RSxLQUFMLENBQVc0RyxTQUFYLEtBQXlCLFdBQXpCLElBQXdDLEtBQUs1RyxLQUFMLENBQVc0RyxTQUFYLEtBQXlCLFlBQXRFLENBQWYsRUFBb0c7QUFDaEdwRyxnQ0FBSUMsUUFBSixDQUFzQztBQUNsQ0MsY0FBQUEsTUFBTSxFQUFFc0QsZ0JBQU82QyxnQkFEbUI7QUFFbENDLGNBQUFBLElBQUksRUFBRSxLQUFLOUcsS0FBTCxDQUFXNEcsU0FBWCxLQUF5QixXQUF6QixHQUF1QyxNQUF2QyxHQUFnRDtBQUZwQixhQUF0Qzs7QUFJQXZDLFlBQUFBLE9BQU8sR0FBRyxJQUFWO0FBQ0g7O0FBQ0Q7O0FBRUo7QUFDSTtBQUNBQSxVQUFBQSxPQUFPLEdBQUcwQyxxQkFBWUMsR0FBWixHQUFrQkMsU0FBbEIsQ0FBNEJwRixFQUE1QixDQUFWO0FBckZSOztBQXdGQSxVQUFJd0MsT0FBSixFQUFhO0FBQ1R4QyxRQUFBQSxFQUFFLENBQUNxRixlQUFIO0FBQ0FyRixRQUFBQSxFQUFFLENBQUNzRixjQUFIO0FBQ0gsT0FIRCxNQUdPLElBQUksQ0FBQ3ZDLFVBQUQsSUFBZSxDQUFDL0MsRUFBRSxDQUFDMkMsTUFBbkIsSUFBNkIsQ0FBQzNDLEVBQUUsQ0FBQzRDLE9BQWpDLElBQTRDLENBQUM1QyxFQUFFLENBQUM2QyxPQUFwRCxFQUE2RDtBQUNoRTtBQUNBO0FBRUEsY0FBTTBDLGVBQWUsR0FBR3ZGLEVBQUUsQ0FBQ2dDLE1BQUgsS0FBY00sUUFBUSxDQUFDQyxJQUF2QixLQUNuQnZDLEVBQUUsQ0FBQ2dELEdBQUgsS0FBV0MsY0FBSXVDLEtBQWYsSUFBd0J4RixFQUFFLENBQUNnRCxHQUFILEtBQVdDLGNBQUl3QyxLQURwQixDQUF4QixDQUpnRSxDQU9oRTs7QUFDQSxZQUFJekYsRUFBRSxDQUFDZ0QsR0FBSCxLQUFXQyxjQUFJeUMsWUFBbkIsRUFBaUM7QUFDN0I7QUFDSDs7QUFFRCxZQUFJLENBQUNILGVBQUQsSUFBb0J2RixFQUFFLENBQUNnRCxHQUFILEtBQVdDLGNBQUkwQyxHQUFuQyxJQUEwQyxDQUFDaEksc0JBQXNCLENBQUNxQyxFQUFFLENBQUNnQyxNQUFKLENBQXJFLEVBQWtGO0FBQzlFO0FBQ0FyRCw4QkFBSXVELElBQUosQ0FBU0MsZ0JBQU9DLGFBQWhCLEVBQStCLElBQS9COztBQUNBcEMsVUFBQUEsRUFBRSxDQUFDcUYsZUFBSCxHQUg4RSxDQUk5RTtBQUNBO0FBQ0g7QUFDSjtBQUNKLEtBblgyQjtBQUFBLCtEQXlYTHJGLEVBQUQsSUFBUTtBQUMxQixVQUFJLEtBQUsxQixTQUFMLENBQWVDLE9BQW5CLEVBQTRCO0FBQ3hCLGFBQUtELFNBQUwsQ0FBZUMsT0FBZixDQUF1QnFILGVBQXZCLENBQXVDNUYsRUFBdkM7QUFDSDtBQUNKLEtBN1gyQjtBQUFBLHNEQStYZDZGLE1BQUQsSUFBWTtBQUNyQjtBQUNBLFVBQUksQ0FBQ0EsTUFBTSxDQUFDQyxXQUFaLEVBQXlCO0FBQ3JCO0FBQ0g7O0FBRUQsWUFBTUMsSUFBSSxHQUFHRixNQUFNLENBQUNDLFdBQVAsQ0FBbUJFLFdBQWhDOztBQUVBLFVBQUlELElBQUksS0FBSyxxQkFBYixFQUFvQztBQUNoQztBQUNBLGNBQU1FLFdBQVcsR0FBR0osTUFBTSxDQUFDSSxXQUFQLENBQW1CQyxLQUFuQixDQUF5QixHQUF6QixFQUE4QkMsR0FBOUIsRUFBcEIsQ0FGZ0MsQ0FJaEM7QUFDQTtBQUNBOztBQUNBeEgsNEJBQUlDLFFBQUosQ0FBYXdILHlCQUFnQkMsT0FBaEIsQ0FDVCxLQUFLaEYsYUFESSxFQUVUNEUsV0FGUyxFQUdUSixNQUFNLENBQUNDLFdBQVAsQ0FBbUJRLEtBSFYsQ0FBYixFQUlHLElBSkg7QUFLSCxPQVpELE1BWU8sSUFBSVAsSUFBSSxDQUFDUSxVQUFMLENBQWdCLDBCQUFoQixDQUFKLEVBQWlEO0FBQ3BELGFBQUtDLGtCQUFMLENBQXdCWCxNQUF4QjtBQUNIO0FBQ0osS0F0WjJCO0FBQUEsOERBd1pOQSxNQUFELElBQVk7QUFDN0IsVUFBSVksTUFBTSxHQUFHWixNQUFNLENBQUNDLFdBQVAsQ0FBbUJFLFdBQW5CLENBQStCRSxLQUEvQixDQUFxQyxHQUFyQyxFQUEwQyxDQUExQyxDQUFiO0FBQ0EsVUFBSVEsT0FBTyxHQUFHYixNQUFNLENBQUNjLE1BQVAsQ0FBY1gsV0FBZCxDQUEwQkUsS0FBMUIsQ0FBZ0MsR0FBaEMsRUFBcUMsQ0FBckMsQ0FBZDtBQUNBLFVBQUlPLE1BQU0sS0FBSyxXQUFmLEVBQTRCQSxNQUFNLEdBQUdHLFNBQVQ7QUFDNUIsVUFBSUYsT0FBTyxLQUFLLFdBQWhCLEVBQTZCQSxPQUFPLEdBQUdFLFNBQVY7QUFFN0IsWUFBTXZJLE1BQU0sR0FBR3dILE1BQU0sQ0FBQ0ksV0FBUCxDQUFtQkMsS0FBbkIsQ0FBeUIsR0FBekIsRUFBOEIsQ0FBOUIsQ0FBZjtBQUVBLFlBQU1XLFFBQVEsR0FBR2hCLE1BQU0sQ0FBQ2MsTUFBUCxDQUFjTCxLQUEvQjtBQUNBLFlBQU1RLFFBQVEsR0FBR2pCLE1BQU0sQ0FBQ0MsV0FBUCxDQUFtQlEsS0FBcEM7O0FBRUEzSCwwQkFBSUMsUUFBSixDQUFhbUkseUJBQWdCQyxPQUFoQixDQUNULEtBQUszRixhQURJLEVBRVQsS0FBS0EsYUFBTCxDQUFtQjRGLE9BQW5CLENBQTJCNUksTUFBM0IsQ0FGUyxFQUdUcUksT0FIUyxFQUdBRCxNQUhBLEVBSVRJLFFBSlMsRUFJQ0MsUUFKRCxDQUFiLEVBS0csSUFMSDtBQU1ILEtBemEyQjtBQUd4QixTQUFLdEgsS0FBTCxHQUFhO0FBQ1RDLE1BQUFBLGFBQWEsRUFBRW1ILFNBRE47QUFFVDtBQUNBekgsTUFBQUEsZ0JBQWdCLEVBQUU0RSx1QkFBY0MsUUFBZCxDQUF1QixrQkFBdkI7QUFIVCxLQUFiLENBSHdCLENBU3hCOztBQUNBLFNBQUszQyxhQUFMLEdBQXFCLEtBQUtsRCxLQUFMLENBQVcrSSxZQUFoQzs7QUFFQUMsOEJBQWlCQyxXQUFqQjs7QUFFQTtBQUVBLFNBQUs5SSxTQUFMLGdCQUFpQk4sS0FBSyxDQUFDcUosU0FBTixFQUFqQjtBQUNBLFNBQUtDLGdCQUFMLGdCQUF3QnRKLEtBQUssQ0FBQ3FKLFNBQU4sRUFBeEI7QUFDSDs7QUFFREUsRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEJqRixJQUFBQSxRQUFRLENBQUNrRixnQkFBVCxDQUEwQixTQUExQixFQUFxQyxLQUFLQyxnQkFBMUMsRUFBNEQsS0FBNUQ7O0FBRUEsU0FBSzVILHlCQUFMOztBQUVBLFNBQUt3QixhQUFMLENBQW1CcUcsRUFBbkIsQ0FBc0IsYUFBdEIsRUFBcUMsS0FBS0MsYUFBMUM7O0FBQ0EsU0FBS3RHLGFBQUwsQ0FBbUJxRyxFQUFuQixDQUFzQixNQUF0QixFQUE4QixLQUFLRSxNQUFuQyxFQU5nQixDQU9oQjs7O0FBQ0EsU0FBS0EsTUFBTCxDQUNJLEtBQUt2RyxhQUFMLENBQW1Cd0csWUFBbkIsRUFESixFQUVJLElBRkosRUFHSSxLQUFLeEcsYUFBTCxDQUFtQnlHLGdCQUFuQixFQUhKOztBQUtBLFNBQUt6RyxhQUFMLENBQW1CcUcsRUFBbkIsQ0FBc0Isa0JBQXRCLEVBQTBDLEtBQUtLLGlCQUEvQzs7QUFFQSxTQUFLQyx1QkFBTCxHQUErQmpFLHVCQUFja0UsWUFBZCxDQUMzQixrQkFEMkIsRUFDUCxJQURPLEVBQ0QsS0FBS0Msc0JBREosQ0FBL0I7QUFJQSxTQUFLQyxPQUFMLEdBQWUsS0FBS0MsY0FBTCxFQUFmO0FBQ0EsU0FBS0QsT0FBTCxDQUFhRSxNQUFiOztBQUNBLFNBQUtDLHVCQUFMO0FBQ0g7O0FBRURDLEVBQUFBLG9CQUFvQixHQUFHO0FBQ25CakcsSUFBQUEsUUFBUSxDQUFDa0csbUJBQVQsQ0FBNkIsU0FBN0IsRUFBd0MsS0FBS2YsZ0JBQTdDLEVBQStELEtBQS9EOztBQUNBLFNBQUtwRyxhQUFMLENBQW1Cb0gsY0FBbkIsQ0FBa0MsYUFBbEMsRUFBaUQsS0FBS2QsYUFBdEQ7O0FBQ0EsU0FBS3RHLGFBQUwsQ0FBbUJvSCxjQUFuQixDQUFrQyxNQUFsQyxFQUEwQyxLQUFLYixNQUEvQzs7QUFDQSxTQUFLdkcsYUFBTCxDQUFtQm9ILGNBQW5CLENBQWtDLGtCQUFsQyxFQUFzRCxLQUFLVixpQkFBM0Q7O0FBQ0FoRSwyQkFBYzJFLGNBQWQsQ0FBNkIsS0FBS1YsdUJBQWxDOztBQUNBLFNBQUtHLE9BQUwsQ0FBYVEsTUFBYjtBQUNILEdBM0VzRCxDQTZFdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQUMsRUFBQUEscUJBQXFCLEdBQUc7QUFDcEIsV0FBT0MsT0FBTyxDQUFDQyxpQ0FBZ0IzRCxHQUFoQixFQUFELENBQWQ7QUFDSDs7QUFTRGlELEVBQUFBLGNBQWMsR0FBRztBQUNiLFFBQUlXLElBQUo7QUFDQSxRQUFJQyxTQUFKO0FBQ0EsVUFBTUM7QUFBK0I7QUFBQSxNQUFHO0FBQ3BDQyxNQUFBQSxVQUFVLEVBQUUsTUFBTSxFQURrQjtBQUVwQ0MsTUFBQUEsV0FBVyxFQUFHQyxVQUFELElBQWdCO0FBQ3pCSixRQUFBQSxTQUFTLEdBQUdJLFVBQVo7O0FBQ0EsWUFBSUEsVUFBSixFQUFnQjtBQUNaekssOEJBQUlDLFFBQUosQ0FBYTtBQUFDQyxZQUFBQSxNQUFNLEVBQUU7QUFBVCxXQUFiLEVBQTBDLElBQTFDOztBQUNBd0ssVUFBQUEsTUFBTSxDQUFDQyxZQUFQLENBQW9CQyxPQUFwQixDQUE0QixhQUE1QixFQUEyQyxHQUEzQztBQUNILFNBSEQsTUFHTztBQUNINUssOEJBQUlDLFFBQUosQ0FBYTtBQUFDQyxZQUFBQSxNQUFNLEVBQUU7QUFBVCxXQUFiLEVBQTBDLElBQTFDO0FBQ0g7QUFDSixPQVZtQztBQVdwQzJLLE1BQUFBLFNBQVMsRUFBR0MsS0FBRCxJQUFXO0FBQ2xCVixRQUFBQSxJQUFJLEdBQUdVLEtBQVA7QUFDQSxhQUFLdEwsS0FBTCxDQUFXdUwsY0FBWCxDQUEwQkMsdUJBQTFCO0FBQ0gsT0FkbUM7QUFlcENDLE1BQUFBLGFBQWEsRUFBRSxNQUFNO0FBQ2pCLGFBQUt6TCxLQUFMLENBQVd1TCxjQUFYLENBQTBCRyxhQUExQjtBQUNILE9BakJtQztBQWtCcENDLE1BQUFBLFlBQVksRUFBRSxNQUFNO0FBQ2hCLFlBQUksQ0FBQ2QsU0FBTCxFQUFnQkssTUFBTSxDQUFDQyxZQUFQLENBQW9CQyxPQUFwQixDQUE0QixhQUE1QixFQUEyQyxLQUFLUixJQUFoRDtBQUNoQixhQUFLNUssS0FBTCxDQUFXdUwsY0FBWCxDQUEwQkssWUFBMUI7QUFDSDtBQXJCbUMsS0FBeEM7QUF1QkEsVUFBTTVCLE9BQU8sR0FBRyxJQUFJNkIsZ0JBQUosQ0FBWSxLQUFLMUMsZ0JBQUwsQ0FBc0IvSSxPQUFsQyxFQUEyQzBMLDRCQUEzQyxFQUFnRWhCLGNBQWhFLENBQWhCO0FBQ0FkLElBQUFBLE9BQU8sQ0FBQytCLGFBQVIsQ0FBc0I7QUFDbEJDLE1BQUFBLE1BQU0sRUFBRSxpQkFEVTtBQUVsQkMsTUFBQUEsUUFBUSxFQUFFLDBCQUZRO0FBR2xCQyxNQUFBQSxPQUFPLEVBQUU7QUFIUyxLQUF0QjtBQUtBLFdBQU9sQyxPQUFQO0FBQ0g7O0FBRURHLEVBQUFBLHVCQUF1QixHQUFHO0FBQ3RCLFFBQUlnQyxPQUFPLEdBQUdDLFFBQVEsQ0FBQ2xCLE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQmtCLE9BQXBCLENBQTRCLGFBQTVCLENBQUQsRUFBNkMsRUFBN0MsQ0FBdEI7O0FBQ0EsUUFBSUMsS0FBSyxDQUFDSCxPQUFELENBQVQsRUFBb0I7QUFDaEJBLE1BQUFBLE9BQU8sR0FBRyxHQUFWO0FBQ0g7O0FBQ0QsU0FBS25DLE9BQUwsQ0FBYXVDLFdBQWIsQ0FBeUIsQ0FBekIsRUFBNEJDLE1BQTVCLENBQW1DTCxPQUFuQztBQUNIOztBQStDRHhLLEVBQUFBLDBCQUEwQixDQUFDOEs7QUFBRDtBQUFBLElBQXFDN0s7QUFBckM7QUFBQSxJQUEyRTtBQUNqRyxVQUFNTCxLQUFLLEdBQUdrTCxTQUFTLElBQUlBLFNBQVMsQ0FBQ2xMLEtBQXZCLElBQWdDa0wsU0FBUyxDQUFDbEwsS0FBVixDQUFnQkMsT0FBaEIsS0FBNEIsMkJBQTFFOztBQUNBLFFBQUlELEtBQUosRUFBVztBQUNQSyxNQUFBQSxzQkFBc0IsR0FBRzZLLFNBQVMsQ0FBQ2xMLEtBQVYsQ0FBZ0JKLElBQXpDO0FBQ0g7O0FBRUQsUUFBSVMsc0JBQUosRUFBNEI7QUFDeEIsdUNBQXFCQSxzQkFBc0IsQ0FBQzhLLFVBQTVDLEVBQXdEOUssc0JBQXNCLENBQUMrSyxhQUEvRSxFQUE4RnBMLEtBQTlGO0FBQ0gsS0FGRCxNQUVPO0FBQ0g7QUFDSDtBQUNKOztBQWtRRHFMLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFFBQVEsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFqQjtBQUNBLFVBQU1DLFFBQVEsR0FBR0YsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFqQjtBQUNBLFVBQU1FLFNBQVMsR0FBR0gsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHNCQUFqQixDQUFsQjtBQUNBLFVBQU1HLFFBQVEsR0FBR0osR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFqQjtBQUNBLFVBQU1JLGNBQWMsR0FBR0wsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDJCQUFqQixDQUF2QjtBQUVBLFFBQUlLLFdBQUo7O0FBRUEsWUFBUSxLQUFLcE4sS0FBTCxDQUFXNEcsU0FBbkI7QUFDSSxXQUFLeUcsbUJBQVVSLFFBQWY7QUFDSU8sUUFBQUEsV0FBVyxnQkFBRyxvQkFBQyxRQUFEO0FBQ1YsVUFBQSxHQUFHLEVBQUUsS0FBS2pOLFNBREE7QUFFVixVQUFBLFFBQVEsRUFBRSxLQUFLSCxLQUFMLENBQVdzTixRQUZYO0FBR1YsVUFBQSxZQUFZLEVBQUUsS0FBS3ROLEtBQUwsQ0FBV3VOLFlBSGY7QUFJVixVQUFBLGNBQWMsRUFBRSxLQUFLdk4sS0FBTCxDQUFXd04sY0FKakI7QUFLVixVQUFBLE9BQU8sRUFBRSxLQUFLeE4sS0FBTCxDQUFXeU4sV0FMVjtBQU1WLFVBQUEsVUFBVSxFQUFFLEtBQUt6TixLQUFMLENBQVcwTixVQU5iO0FBT1YsVUFBQSxHQUFHLEVBQUUsS0FBSzFOLEtBQUwsQ0FBVzJOLGFBQVgsSUFBNEIsVUFQdkI7QUFRVixVQUFBLGNBQWMsRUFBRSxLQUFLM04sS0FBTCxDQUFXdUw7QUFSakIsVUFBZDtBQVVBOztBQUVKLFdBQUs4QixtQkFBVUgsUUFBZjtBQUNJRSxRQUFBQSxXQUFXLGdCQUFHLG9CQUFDLFFBQUQsT0FBZDtBQUNBOztBQUVKLFdBQUtDLG1CQUFVTyxhQUFmO0FBQ0k7QUFDQTs7QUFFSixXQUFLUCxtQkFBVVEsUUFBZjtBQUNJVCxRQUFBQSxXQUFXLGdCQUFHLG9CQUFDLGlCQUFEO0FBQVUsVUFBQSxjQUFjLEVBQUUsS0FBS3BOLEtBQUwsQ0FBVzhOO0FBQXJDLFVBQWQ7QUFDQTs7QUFFSixXQUFLVCxtQkFBVUwsUUFBZjtBQUNJSSxRQUFBQSxXQUFXLGdCQUFHLG9CQUFDLFFBQUQ7QUFBVSxVQUFBLE1BQU0sRUFBRSxLQUFLcE4sS0FBTCxDQUFXK04sYUFBN0I7QUFBNEMsVUFBQSxjQUFjLEVBQUUsS0FBSy9OLEtBQUwsQ0FBV3VMO0FBQXZFLFVBQWQ7QUFDQTs7QUFDSixXQUFLOEIsbUJBQVVKLFNBQWY7QUFDSUcsUUFBQUEsV0FBVyxnQkFBRyxvQkFBQyxTQUFEO0FBQ1YsVUFBQSxPQUFPLEVBQUUsS0FBS3BOLEtBQUwsQ0FBV2dPLGNBRFY7QUFFVixVQUFBLEtBQUssRUFBRSxLQUFLaE8sS0FBTCxDQUFXaU8saUJBRlI7QUFHVixVQUFBLGNBQWMsRUFBRSxLQUFLak8sS0FBTCxDQUFXdUw7QUFIakIsVUFBZDtBQUtBO0FBbkNSOztBQXNDQSxRQUFJMkMsV0FBVyxHQUFHLGVBQWxCOztBQUNBLFFBQUksS0FBSzdNLEtBQUwsQ0FBV0wsZ0JBQWYsRUFBaUM7QUFDN0JrTixNQUFBQSxXQUFXLElBQUksaUNBQWY7QUFDSDs7QUFFRCxVQUFNQyxTQUFTLGdCQUNYLG9CQUFDLGtCQUFEO0FBQ0ksTUFBQSxXQUFXLEVBQUUsS0FBS25PLEtBQUwsQ0FBV29PLFdBQVgsSUFBMEIsS0FEM0M7QUFFSSxNQUFBLGNBQWMsRUFBRSxLQUFLcE8sS0FBTCxDQUFXdUw7QUFGL0IsTUFESjtBQU9BLHdCQUNJLG9CQUFDLDRCQUFELENBQXFCLFFBQXJCO0FBQThCLE1BQUEsS0FBSyxFQUFFLEtBQUtySTtBQUExQyxvQkFDSTtBQUNJLE1BQUEsT0FBTyxFQUFFLEtBQUttTCxRQURsQjtBQUVJLE1BQUEsU0FBUyxFQUFFLEtBQUtDLGVBRnBCO0FBR0ksTUFBQSxTQUFTLEVBQUMsdUJBSGQ7QUFJSSxxQkFBYSxLQUFLdE8sS0FBTCxDQUFXdU87QUFKNUIsb0JBTUksb0JBQUMsY0FBRCxPQU5KLGVBT0ksb0JBQUMsa0NBQUQ7QUFBaUIsTUFBQSxTQUFTLEVBQUUsS0FBS0M7QUFBakMsb0JBQ0k7QUFBSyxNQUFBLEdBQUcsRUFBRSxLQUFLckYsZ0JBQWY7QUFBaUMsTUFBQSxTQUFTLEVBQUUrRTtBQUE1QyxPQUNNQyxTQUROLGVBRUksb0JBQUMscUJBQUQsT0FGSixFQUdNZixXQUhOLENBREosQ0FQSixDQURKLGVBZ0JJLG9CQUFDLHNCQUFELE9BaEJKLGVBaUJJLG9CQUFDLGdDQUFELE9BakJKLGVBa0JJLG9CQUFDLDRCQUFELE9BbEJKLENBREo7QUFzQkg7O0FBcGhCc0Q7OzhCQUFyRHhOLFksaUJBQ21CLGM7OEJBRG5CQSxZLGVBR2lCO0FBQ2ZtSixFQUFBQSxZQUFZLEVBQUUwRixTQUFTLENBQUNDLFVBQVYsQ0FBcUJDLG9CQUFyQixFQUFtQ0MsVUFEbEM7QUFFZmhJLEVBQUFBLFNBQVMsRUFBRTZILFNBQVMsQ0FBQ0ksTUFBVixDQUFpQkQsVUFGYjtBQUdmRSxFQUFBQSxhQUFhLEVBQUVMLFNBQVMsQ0FBQ00sSUFIVjtBQUtmO0FBQ0E7QUFDQXhCLEVBQUFBLFlBQVksRUFBRWtCLFNBQVMsQ0FBQ00sSUFQVDtBQVNmO0FBQ0FyQixFQUFBQSxVQUFVLEVBQUVlLFNBQVMsQ0FBQ08sT0FBVixDQUFrQlAsU0FBUyxDQUFDSSxNQUE1QixDQVZHLENBWWY7O0FBWmUsQztlQW9oQlJqUCxZIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTgsIDIwMjAgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgRHJhZ0Ryb3BDb250ZXh0IH0gZnJvbSAncmVhY3QtYmVhdXRpZnVsLWRuZCc7XG5cbmltcG9ydCB7S2V5LCBpc09ubHlDdHJsT3JDbWRLZXlFdmVudCwgaXNPbmx5Q3RybE9yQ21kSWdub3JlU2hpZnRLZXlFdmVudCwgaXNNYWN9IGZyb20gJy4uLy4uL0tleWJvYXJkJztcbmltcG9ydCBQYWdlVHlwZXMgZnJvbSAnLi4vLi4vUGFnZVR5cGVzJztcbmltcG9ydCBDYWxsTWVkaWFIYW5kbGVyIGZyb20gJy4uLy4uL0NhbGxNZWRpYUhhbmRsZXInO1xuaW1wb3J0IHsgZml4dXBDb2xvckZvbnRzIH0gZnJvbSAnLi4vLi4vdXRpbHMvRm9udE1hbmFnZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uL2luZGV4JztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnLCBJTWF0cml4Q2xpZW50Q3JlZHN9IGZyb20gJy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuXG5pbXBvcnQgVGFnT3JkZXJBY3Rpb25zIGZyb20gJy4uLy4uL2FjdGlvbnMvVGFnT3JkZXJBY3Rpb25zJztcbmltcG9ydCBSb29tTGlzdEFjdGlvbnMgZnJvbSAnLi4vLi4vYWN0aW9ucy9Sb29tTGlzdEFjdGlvbnMnO1xuaW1wb3J0IFJlc2l6ZUhhbmRsZSBmcm9tICcuLi92aWV3cy9lbGVtZW50cy9SZXNpemVIYW5kbGUnO1xuaW1wb3J0IHtSZXNpemVyLCBDb2xsYXBzZURpc3RyaWJ1dG9yfSBmcm9tICcuLi8uLi9yZXNpemVyJztcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgKiBhcyBLZXlib2FyZFNob3J0Y3V0cyBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IEhvbWVQYWdlIGZyb20gXCIuL0hvbWVQYWdlXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9tb2RlbHNcIjtcbmltcG9ydCB7XG4gICAgc2hvd1RvYXN0IGFzIHNob3dTZXJ2ZXJMaW1pdFRvYXN0LFxuICAgIGhpZGVUb2FzdCBhcyBoaWRlU2VydmVyTGltaXRUb2FzdCxcbn0gZnJvbSBcIi4uLy4uL3RvYXN0cy9TZXJ2ZXJMaW1pdFRvYXN0XCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgTGVmdFBhbmVsIGZyb20gXCIuL0xlZnRQYW5lbFwiO1xuaW1wb3J0IENhbGxDb250YWluZXIgZnJvbSAnLi4vdmlld3Mvdm9pcC9DYWxsQ29udGFpbmVyJztcbmltcG9ydCB7IFZpZXdSb29tRGVsdGFQYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21EZWx0YVBheWxvYWRcIjtcbmltcG9ydCBSb29tTGlzdFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCBOb25VcmdlbnRUb2FzdENvbnRhaW5lciBmcm9tIFwiLi9Ob25VcmdlbnRUb2FzdENvbnRhaW5lclwiO1xuaW1wb3J0IHsgVG9nZ2xlUmlnaHRQYW5lbFBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Ub2dnbGVSaWdodFBhbmVsUGF5bG9hZFwiO1xuaW1wb3J0IHsgSVRocmVlcGlkSW52aXRlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9UaHJlZXBpZEludml0ZVN0b3JlXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uL01vZGFsXCI7XG5pbXBvcnQgeyBJQ29sbGFwc2VDb25maWcgfSBmcm9tIFwiLi4vLi4vcmVzaXplci9kaXN0cmlidXRvcnMvY29sbGFwc2VcIjtcbmltcG9ydCBIb3N0U2lnbnVwQ29udGFpbmVyIGZyb20gJy4uL3ZpZXdzL2hvc3Rfc2lnbnVwL0hvc3RTaWdudXBDb250YWluZXInO1xuXG4vLyBXZSBuZWVkIHRvIGZldGNoIGVhY2ggcGlubmVkIG1lc3NhZ2UgaW5kaXZpZHVhbGx5IChpZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgaXQpXG4vLyBzbyBlYWNoIHBpbm5lZCBtZXNzYWdlIG1heSB0cmlnZ2VyIGEgcmVxdWVzdC4gTGltaXQgdGhlIG51bWJlciBwZXIgcm9vbSBmb3Igc2FuaXR5LlxuLy8gTkIuIHRoaXMgaXMganVzdCBmb3Igc2VydmVyIG5vdGljZXMgcmF0aGVyIHRoYW4gcGlubmVkIG1lc3NhZ2VzIGluIGdlbmVyYWwuXG5jb25zdCBNQVhfUElOTkVEX05PVElDRVNfUEVSX1JPT00gPSAyO1xuXG5mdW5jdGlvbiBjYW5FbGVtZW50UmVjZWl2ZUlucHV0KGVsKSB7XG4gICAgcmV0dXJuIGVsLnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fFxuICAgICAgICBlbC50YWdOYW1lID09PSBcIlRFWFRBUkVBXCIgfHxcbiAgICAgICAgZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIiB8fFxuICAgICAgICAhIWVsLmdldEF0dHJpYnV0ZShcImNvbnRlbnRlZGl0YWJsZVwiKTtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgb25SZWdpc3RlcmVkOiAoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcykgPT4gUHJvbWlzZTxNYXRyaXhDbGllbnQ+O1xuICAgIHZpYVNlcnZlcnM/OiBzdHJpbmdbXTtcbiAgICBoaWRlVG9TUlVzZXJzOiBib29sZWFuO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgcGFnZV90eXBlOiBzdHJpbmc7XG4gICAgYXV0b0pvaW46IGJvb2xlYW47XG4gICAgdGhyZWVwaWRJbnZpdGU/OiBJVGhyZWVwaWRJbnZpdGU7XG4gICAgcm9vbU9vYkRhdGE/OiBvYmplY3Q7XG4gICAgY3VycmVudFJvb21JZDogc3RyaW5nO1xuICAgIGNvbGxhcHNlTGhzOiBib29sZWFuO1xuICAgIGNvbmZpZzoge1xuICAgICAgICBwaXdpazoge1xuICAgICAgICAgICAgcG9saWN5VXJsOiBzdHJpbmc7XG4gICAgICAgIH0sXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueSxcbiAgICB9O1xuICAgIGN1cnJlbnRVc2VySWQ/OiBzdHJpbmc7XG4gICAgY3VycmVudEdyb3VwSWQ/OiBzdHJpbmc7XG4gICAgY3VycmVudEdyb3VwSXNOZXc/OiBib29sZWFuO1xuICAgIGp1c3RSZWdpc3RlcmVkPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElVc2FnZUxpbWl0IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgbGltaXRfdHlwZTogXCJtb250aGx5X2FjdGl2ZV91c2VyXCIgfCBzdHJpbmc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIGFkbWluX2NvbnRhY3Q/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHN5bmNFcnJvckRhdGE/OiB7XG4gICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICBkYXRhOiBJVXNhZ2VMaW1pdDtcbiAgICAgICAgICAgIGVycmNvZGU6IHN0cmluZztcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHVzYWdlTGltaXRFdmVudENvbnRlbnQ/OiBJVXNhZ2VMaW1pdDtcbiAgICB1c2VDb21wYWN0TGF5b3V0OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgd2hhdCBvdXIgTWF0cml4Q2hhdCBzaG93cyB3aGVuIHdlIGFyZSBsb2dnZWQgaW4uIFRoZSBwcmVjaXNlIHZpZXcgaXNcbiAqIGRldGVybWluZWQgYnkgdGhlIHBhZ2VfdHlwZSBwcm9wZXJ0eS5cbiAqXG4gKiBDdXJyZW50bHkgaXQncyB2ZXJ5IHRpZ2h0bHkgY291cGxlZCB3aXRoIE1hdHJpeENoYXQuIFdlIHNob3VsZCB0cnkgdG8gZG9cbiAqIHNvbWV0aGluZyBhYm91dCB0aGF0LlxuICpcbiAqIENvbXBvbmVudHMgbW91bnRlZCBiZWxvdyB1cyBjYW4gYWNjZXNzIHRoZSBtYXRyaXggY2xpZW50IHZpYSB0aGUgcmVhY3QgY29udGV4dC5cbiAqL1xuY2xhc3MgTG9nZ2VkSW5WaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ0xvZ2dlZEluVmlldyc7XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBtYXRyaXhDbGllbnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKE1hdHJpeENsaWVudCkuaXNSZXF1aXJlZCxcbiAgICAgICAgcGFnZV90eXBlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uUm9vbUNyZWF0ZWQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8vIENhbGxlZCB3aXRoIHRoZSBjcmVkZW50aWFscyBvZiBhIHJlZ2lzdGVyZWQgdXNlciAoaWYgdGhleSB3ZXJlIGEgUk9VIHRoYXRcbiAgICAgICAgLy8gdHJhbnNpdGlvbmVkIHRvIFBXTFUpXG4gICAgICAgIG9uUmVnaXN0ZXJlZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLy8gVXNlZCBieSB0aGUgUm9vbVZpZXcgdG8gaGFuZGxlIGpvaW5pbmcgcm9vbXNcbiAgICAgICAgdmlhU2VydmVyczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG5cbiAgICAgICAgLy8gYW5kIGxvdHMgYW5kIGxvdHMgb2Ygb3RoZXIgc3R1ZmYuXG4gICAgfTtcblxuICAgIHByb3RlY3RlZCByZWFkb25seSBfbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9yb29tVmlldzogUmVhY3QuUmVmT2JqZWN0PGFueT47XG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9yZXNpemVDb250YWluZXI6IFJlYWN0LlJlZk9iamVjdDxSZXNpemVIYW5kbGU+O1xuICAgIHByb3RlY3RlZCBjb21wYWN0TGF5b3V0V2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByb3RlY3RlZCByZXNpemVyOiBSZXNpemVyO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzeW5jRXJyb3JEYXRhOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyB1c2UgY29tcGFjdCB0aW1lbGluZSB2aWV3XG4gICAgICAgICAgICB1c2VDb21wYWN0TGF5b3V0OiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKCd1c2VDb21wYWN0TGF5b3V0JyksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc3Rhc2ggdGhlIE1hdHJpeENsaWVudCBpbiBjYXNlIHdlIGxvZyBvdXQgYmVmb3JlIHdlIGFyZSB1bm1vdW50ZWRcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50ID0gdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQ7XG5cbiAgICAgICAgQ2FsbE1lZGlhSGFuZGxlci5sb2FkRGV2aWNlcygpO1xuXG4gICAgICAgIGZpeHVwQ29sb3JGb250cygpO1xuXG4gICAgICAgIHRoaXMuX3Jvb21WaWV3ID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZUNvbnRhaW5lciA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25OYXRpdmVLZXlEb3duLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlU2VydmVyTm90aWNlRXZlbnRzKCk7XG5cbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50Lm9uKFwiYWNjb3VudERhdGFcIiwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50Lm9uKFwic3luY1wiLCB0aGlzLm9uU3luYyk7XG4gICAgICAgIC8vIENhbGwgYG9uU3luY2Agd2l0aCB0aGUgY3VycmVudCBzdGF0ZSBhcyB3ZWxsXG4gICAgICAgIHRoaXMub25TeW5jKFxuICAgICAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LmdldFN5bmNTdGF0ZSgpLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5nZXRTeW5jU3RhdGVEYXRhKCksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5vbihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblJvb21TdGF0ZUV2ZW50cyk7XG5cbiAgICAgICAgdGhpcy5jb21wYWN0TGF5b3V0V2F0Y2hlclJlZiA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFxuICAgICAgICAgICAgXCJ1c2VDb21wYWN0TGF5b3V0XCIsIG51bGwsIHRoaXMub25Db21wYWN0TGF5b3V0Q2hhbmdlZCxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnJlc2l6ZXIgPSB0aGlzLl9jcmVhdGVSZXNpemVyKCk7XG4gICAgICAgIHRoaXMucmVzaXplci5hdHRhY2goKTtcbiAgICAgICAgdGhpcy5fbG9hZFJlc2l6ZXJQcmVmZXJlbmNlcygpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fb25OYXRpdmVLZXlEb3duLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihcImFjY291bnREYXRhXCIsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihcInN5bmNcIiwgdGhpcy5vblN5bmMpO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMub25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMuY29tcGFjdExheW91dFdhdGNoZXJSZWYpO1xuICAgICAgICB0aGlzLnJlc2l6ZXIuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hpbGQgY29tcG9uZW50cyBhc3N1bWUgdGhhdCB0aGUgY2xpZW50IHBlZyB3aWxsIG5vdCBiZSBudWxsLCBzbyBnaXZlIHRoZW0gc29tZVxuICAgIC8vIHNvcnQgb2YgYXNzdXJhbmNlIGhlcmUgYnkgb25seSBhbGxvd2luZyBhIHJlLXJlbmRlciBpZiB0aGUgY2xpZW50IGlzIHRydXRoeS5cbiAgICAvL1xuICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgYmVjYXVzZSBgTG9nZ2VkSW5WaWV3YCBtYWludGFpbnMgaXRzIG93biBzdGF0ZSBhbmQgaWYgdGhpcyBzdGF0ZVxuICAgIC8vIHVwZGF0ZXMgYWZ0ZXIgdGhlIGNsaWVudCBwZWcgaGFzIGJlZW4gbWFkZSBudWxsIChkdXJpbmcgbG9nb3V0KSwgdGhlbiBpdCB3aWxsXG4gICAgLy8gYXR0ZW1wdCB0byByZS1yZW5kZXIgYW5kIHRoZSBjaGlsZHJlbiB3aWxsIHRocm93IGVycm9ycy5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUoKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKE1hdHJpeENsaWVudFBlZy5nZXQoKSk7XG4gICAgfVxuXG4gICAgY2FuUmVzZXRUaW1lbGluZUluUm9vbSA9IChyb29tSWQpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9yb29tVmlldy5jdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcm9vbVZpZXcuY3VycmVudC5jYW5SZXNldFRpbWVsaW5lKCk7XG4gICAgfTtcblxuICAgIF9jcmVhdGVSZXNpemVyKCkge1xuICAgICAgICBsZXQgc2l6ZTtcbiAgICAgICAgbGV0IGNvbGxhcHNlZDtcbiAgICAgICAgY29uc3QgY29sbGFwc2VDb25maWc6IElDb2xsYXBzZUNvbmZpZyA9IHtcbiAgICAgICAgICAgIHRvZ2dsZVNpemU6IDI2MCAtIDUwLFxuICAgICAgICAgICAgb25Db2xsYXBzZWQ6IChfY29sbGFwc2VkKSA9PiB7XG4gICAgICAgICAgICAgICAgY29sbGFwc2VkID0gX2NvbGxhcHNlZDtcbiAgICAgICAgICAgICAgICBpZiAoX2NvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJoaWRlX2xlZnRfcGFuZWxcIn0sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9saHNfc2l6ZVwiLCAnMCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBcInNob3dfbGVmdF9wYW5lbFwifSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVzaXplZDogKF9zaXplKSA9PiB7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IF9zaXplO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIubm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlc2l6ZVN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5zdGFydFJlc2l6aW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZXNpemVTdG9wOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb2xsYXBzZWQpIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2xoc19zaXplXCIsICcnICsgc2l6ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5zdG9wUmVzaXppbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc2l6ZXIgPSBuZXcgUmVzaXplcih0aGlzLl9yZXNpemVDb250YWluZXIuY3VycmVudCwgQ29sbGFwc2VEaXN0cmlidXRvciwgY29sbGFwc2VDb25maWcpO1xuICAgICAgICByZXNpemVyLnNldENsYXNzTmFtZXMoe1xuICAgICAgICAgICAgaGFuZGxlOiBcIm14X1Jlc2l6ZUhhbmRsZVwiLFxuICAgICAgICAgICAgdmVydGljYWw6IFwibXhfUmVzaXplSGFuZGxlX3ZlcnRpY2FsXCIsXG4gICAgICAgICAgICByZXZlcnNlOiBcIm14X1Jlc2l6ZUhhbmRsZV9yZXZlcnNlXCIsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzaXplcjtcbiAgICB9XG5cbiAgICBfbG9hZFJlc2l6ZXJQcmVmZXJlbmNlcygpIHtcbiAgICAgICAgbGV0IGxoc1NpemUgPSBwYXJzZUludCh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9saHNfc2l6ZVwiKSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4obGhzU2l6ZSkpIHtcbiAgICAgICAgICAgIGxoc1NpemUgPSAzNTA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNpemVyLmZvckhhbmRsZUF0KDApLnJlc2l6ZShsaHNTaXplKTtcbiAgICB9XG5cbiAgICBvbkFjY291bnREYXRhID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5nZXRUeXBlKCkgPT09IFwibS5pZ25vcmVkX3VzZXJfbGlzdFwiKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJpZ25vcmVfc3RhdGVfY2hhbmdlZFwifSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25Db21wYWN0TGF5b3V0Q2hhbmdlZCA9IChzZXR0aW5nLCByb29tSWQsIGxldmVsLCB2YWx1ZUF0TGV2ZWwsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXNlQ29tcGFjdExheW91dDogdmFsdWVBdExldmVsLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25TeW5jID0gKHN5bmNTdGF0ZSwgb2xkU3luY1N0YXRlLCBkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IG9sZEVyckNvZGUgPSAoXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN5bmNFcnJvckRhdGEgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc3luY0Vycm9yRGF0YS5lcnJvciAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zeW5jRXJyb3JEYXRhLmVycm9yLmVycmNvZGVcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbmV3RXJyQ29kZSA9IGRhdGEgJiYgZGF0YS5lcnJvciAmJiBkYXRhLmVycm9yLmVycmNvZGU7XG4gICAgICAgIGlmIChzeW5jU3RhdGUgPT09IG9sZFN5bmNTdGF0ZSAmJiBvbGRFcnJDb2RlID09PSBuZXdFcnJDb2RlKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHN5bmNTdGF0ZSA9PT0gJ0VSUk9SJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc3luY0Vycm9yRGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc3luY0Vycm9yRGF0YTogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9sZFN5bmNTdGF0ZSA9PT0gJ1BSRVBBUkVEJyAmJiBzeW5jU3RhdGUgPT09ICdTWU5DSU5HJykge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2VydmVyTm90aWNlRXZlbnRzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9jYWxjdWxhdGVTZXJ2ZXJMaW1pdFRvYXN0KHRoaXMuc3RhdGUuc3luY0Vycm9yRGF0YSwgdGhpcy5zdGF0ZS51c2FnZUxpbWl0RXZlbnRDb250ZW50KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblJvb21TdGF0ZUV2ZW50cyA9IChldiwgc3RhdGUpID0+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyTm90aWNlTGlzdCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzW0RlZmF1bHRUYWdJRC5TZXJ2ZXJOb3RpY2VdO1xuICAgICAgICBpZiAoc2VydmVyTm90aWNlTGlzdCAmJiBzZXJ2ZXJOb3RpY2VMaXN0LnNvbWUociA9PiByLnJvb21JZCA9PT0gZXYuZ2V0Um9vbUlkKCkpKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJOb3RpY2VFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfY2FsY3VsYXRlU2VydmVyTGltaXRUb2FzdChzeW5jRXJyb3I6IElTdGF0ZVtcInN5bmNFcnJvckRhdGFcIl0sIHVzYWdlTGltaXRFdmVudENvbnRlbnQ/OiBJVXNhZ2VMaW1pdCkge1xuICAgICAgICBjb25zdCBlcnJvciA9IHN5bmNFcnJvciAmJiBzeW5jRXJyb3IuZXJyb3IgJiYgc3luY0Vycm9yLmVycm9yLmVycmNvZGUgPT09IFwiTV9SRVNPVVJDRV9MSU1JVF9FWENFRURFRFwiO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHVzYWdlTGltaXRFdmVudENvbnRlbnQgPSBzeW5jRXJyb3IuZXJyb3IuZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1c2FnZUxpbWl0RXZlbnRDb250ZW50KSB7XG4gICAgICAgICAgICBzaG93U2VydmVyTGltaXRUb2FzdCh1c2FnZUxpbWl0RXZlbnRDb250ZW50LmxpbWl0X3R5cGUsIHVzYWdlTGltaXRFdmVudENvbnRlbnQuYWRtaW5fY29udGFjdCwgZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGlkZVNlcnZlckxpbWl0VG9hc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF91cGRhdGVTZXJ2ZXJOb3RpY2VFdmVudHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlcnZlck5vdGljZUxpc3QgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuU2VydmVyTm90aWNlXTtcbiAgICAgICAgaWYgKCFzZXJ2ZXJOb3RpY2VMaXN0KSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3QgZXZlbnRzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiBzZXJ2ZXJOb3RpY2VMaXN0KSB7XG4gICAgICAgICAgICBjb25zdCBwaW5TdGF0ZUV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20ucGlubmVkX2V2ZW50c1wiLCBcIlwiKTtcblxuICAgICAgICAgICAgaWYgKCFwaW5TdGF0ZUV2ZW50IHx8ICFwaW5TdGF0ZUV2ZW50LmdldENvbnRlbnQoKS5waW5uZWQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBwaW5uZWRFdmVudElkcyA9IHBpblN0YXRlRXZlbnQuZ2V0Q29udGVudCgpLnBpbm5lZC5zbGljZSgwLCBNQVhfUElOTkVEX05PVElDRVNfUEVSX1JPT00pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBldmVudElkIG9mIHBpbm5lZEV2ZW50SWRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZWxpbmUgPSBhd2FpdCB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0RXZlbnRUaW1lbGluZShyb29tLmdldFVuZmlsdGVyZWRUaW1lbGluZVNldCgpLCBldmVudElkLCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHRpbWVsaW5lLmdldEV2ZW50cygpLmZpbmQoZXYgPT4gZXYuZ2V0SWQoKSA9PT0gZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50KSBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1c2FnZUxpbWl0RXZlbnQgPSBldmVudHMuZmluZCgoZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBlICYmIGUuZ2V0VHlwZSgpID09PSAnbS5yb29tLm1lc3NhZ2UnICYmXG4gICAgICAgICAgICAgICAgZS5nZXRDb250ZW50KClbJ3NlcnZlcl9ub3RpY2VfdHlwZSddID09PSAnbS5zZXJ2ZXJfbm90aWNlLnVzYWdlX2xpbWl0X3JlYWNoZWQnXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdXNhZ2VMaW1pdEV2ZW50Q29udGVudCA9IHVzYWdlTGltaXRFdmVudCAmJiB1c2FnZUxpbWl0RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICB0aGlzLl9jYWxjdWxhdGVTZXJ2ZXJMaW1pdFRvYXN0KHRoaXMuc3RhdGUuc3luY0Vycm9yRGF0YSwgdXNhZ2VMaW1pdEV2ZW50Q29udGVudCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2FnZUxpbWl0RXZlbnRDb250ZW50IH0pO1xuICAgIH07XG5cbiAgICBfb25QYXN0ZSA9IChldikgPT4ge1xuICAgICAgICBsZXQgY2FuUmVjZWl2ZUlucHV0ID0gZmFsc2U7XG4gICAgICAgIGxldCBlbGVtZW50ID0gZXYudGFyZ2V0O1xuICAgICAgICAvLyB0ZXN0IGZvciBhbGwgcGFyZW50cyBiZWNhdXNlIHRoZSB0YXJnZXQgY2FuIGJlIGEgY2hpbGQgb2YgYSBjb250ZW50ZWRpdGFibGUgZWxlbWVudFxuICAgICAgICB3aGlsZSAoIWNhblJlY2VpdmVJbnB1dCAmJiBlbGVtZW50KSB7XG4gICAgICAgICAgICBjYW5SZWNlaXZlSW5wdXQgPSBjYW5FbGVtZW50UmVjZWl2ZUlucHV0KGVsZW1lbnQpO1xuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNhblJlY2VpdmVJbnB1dCkge1xuICAgICAgICAgICAgLy8gcmVmb2N1c2luZyBkdXJpbmcgYSBwYXN0ZSBldmVudCB3aWxsIG1ha2UgdGhlXG4gICAgICAgICAgICAvLyBwYXN0ZSBlbmQgdXAgaW4gdGhlIG5ld2x5IGZvY3VzZWQgZWxlbWVudCxcbiAgICAgICAgICAgIC8vIHNvIGRpc3BhdGNoIHN5bmNocm9ub3VzbHkgYmVmb3JlIHBhc3RlIGhhcHBlbnNcbiAgICAgICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgIFNPTUUgSEFDS0VSWSBCRUxPVzpcbiAgICBSZWFjdCBvcHRpbWl6ZXMgZXZlbnQgaGFuZGxlcnMsIGJ5IGFsd2F5cyBhdHRhY2hpbmcgb25seSAxIGhhbmRsZXIgdG8gdGhlIGRvY3VtZW50IGZvciBhIGdpdmVuIHR5cGUuXG4gICAgSXQgdGhlbiBpbnRlcm5hbGx5IGRldGVybWluZXMgdGhlIG9yZGVyIGluIHdoaWNoIFJlYWN0IGV2ZW50IGhhbmRsZXJzIHNob3VsZCBiZSBjYWxsZWQsXG4gICAgZW11bGF0aW5nIHRoZSBjYXB0dXJlIGFuZCBidWJibGluZyBwaGFzZXMgdGhlIERPTSBhbHNvIGhhcy5cblxuICAgIEJ1dCwgYXMgdGhlIG5hdGl2ZSBoYW5kbGVyIGZvciBSZWFjdCBpcyBhbHdheXMgYXR0YWNoZWQgb24gdGhlIGRvY3VtZW50LFxuICAgIGl0IHdpbGwgYWx3YXlzIHJ1biBsYXN0IGZvciBidWJibGluZyAoZmlyc3QgZm9yIGNhcHR1cmluZykgaGFuZGxlcnMsXG4gICAgYW5kIHRodXMgUmVhY3QgYmFzaWNhbGx5IGhhcyBpdHMgb3duIGV2ZW50IHBoYXNlcywgYW5kIHdpbGwgYWx3YXlzIHJ1blxuICAgIGFmdGVyIChiZWZvcmUgZm9yIGNhcHR1cmluZykgYW55IG5hdGl2ZSBvdGhlciBldmVudCBoYW5kbGVycyAoYXMgdGhleSB0ZW5kIHRvIGJlIGF0dGFjaGVkIGxhc3QpLlxuXG4gICAgU28gaWRlYWxseSBvbmUgd291bGRuJ3QgbWl4IFJlYWN0IGFuZCBuYXRpdmUgZXZlbnQgaGFuZGxlcnMgdG8gaGF2ZSBidWJibGluZyB3b3JraW5nIGFzIGV4cGVjdGVkLFxuICAgIGJ1dCB3ZSBkbyBuZWVkIGEgbmF0aXZlIGV2ZW50IGhhbmRsZXIgaGVyZSBvbiB0aGUgZG9jdW1lbnQsXG4gICAgdG8gZ2V0IGtleWRvd24gZXZlbnRzIHdoZW4gdGhlcmUgaXMgbm8gZm9jdXNlZCBlbGVtZW50ICh0YXJnZXQ9Ym9keSkuXG5cbiAgICBXZSBhbHNvIGRvIG5lZWQgYnViYmxpbmcgaGVyZSB0byBnaXZlIGNoaWxkIGNvbXBvbmVudHMgYSBjaGFuY2UgdG8gY2FsbCBgc3RvcFByb3BhZ2F0aW9uKClgLFxuICAgIGZvciBrZXlkb3duIGV2ZW50cyBpdCBjYW4gaGFuZGxlIGl0c2VsZiwgYW5kIHNob3VsZG4ndCBiZSByZWRpcmVjdGVkIHRvIHRoZSBjb21wb3Nlci5cblxuICAgIFNvIHdlIGxpc3RlbiB3aXRoIFJlYWN0IG9uIHRoaXMgY29tcG9uZW50IHRvIGdldCBhbnkgZXZlbnRzIG9uIGZvY3VzZWQgZWxlbWVudHMsIGFuZCBnZXQgYnViYmxpbmcgd29ya2luZyBhcyBleHBlY3RlZC5cbiAgICBXZSBhbHNvIGxpc3RlbiB3aXRoIGEgbmF0aXZlIGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudCB0byBnZXQga2V5ZG93biBldmVudHMgd2hlbiBubyBlbGVtZW50IGlzIGZvY3VzZWQuXG4gICAgQnViYmxpbmcgaXMgaXJyZWxldmFudCBoZXJlIGFzIHRoZSB0YXJnZXQgaXMgdGhlIGJvZHkgZWxlbWVudC5cbiAgICAqL1xuICAgIF9vblJlYWN0S2V5RG93biA9IChldikgPT4ge1xuICAgICAgICAvLyBldmVudHMgY2F1Z2h0IHdoaWxlIGJ1YmJsaW5nIHVwIG9uIHRoZSByb290IGVsZW1lbnRcbiAgICAgICAgLy8gb2YgdGhpcyBjb21wb25lbnQsIHNvIHNvbWV0aGluZyBtdXN0IGJlIGZvY3VzZWQuXG4gICAgICAgIHRoaXMuX29uS2V5RG93bihldik7XG4gICAgfTtcblxuICAgIF9vbk5hdGl2ZUtleURvd24gPSAoZXYpID0+IHtcbiAgICAgICAgLy8gb25seSBwYXNzIHRoaXMgaWYgdGhlcmUgaXMgbm8gZm9jdXNlZCBlbGVtZW50LlxuICAgICAgICAvLyBpZiB0aGVyZSBpcywgX29uS2V5RG93biB3aWxsIGJlIGNhbGxlZCBieSB0aGVcbiAgICAgICAgLy8gcmVhY3Qga2V5ZG93biBoYW5kbGVyIHRoYXQgcmVzcGVjdHMgdGhlIHJlYWN0IGJ1YmJsaW5nIG9yZGVyLlxuICAgICAgICBpZiAoZXYudGFyZ2V0ID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICB0aGlzLl9vbktleURvd24oZXYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vbktleURvd24gPSAoZXYpID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgY3RybENtZE9ubHkgPSBpc09ubHlDdHJsT3JDbWRLZXlFdmVudChldik7XG4gICAgICAgIGNvbnN0IGhhc01vZGlmaWVyID0gZXYuYWx0S2V5IHx8IGV2LmN0cmxLZXkgfHwgZXYubWV0YUtleSB8fCBldi5zaGlmdEtleTtcbiAgICAgICAgY29uc3QgaXNNb2RpZmllciA9IGV2LmtleSA9PT0gS2V5LkFMVCB8fCBldi5rZXkgPT09IEtleS5DT05UUk9MIHx8IGV2LmtleSA9PT0gS2V5Lk1FVEEgfHwgZXYua2V5ID09PSBLZXkuU0hJRlQ7XG4gICAgICAgIGNvbnN0IG1vZEtleSA9IGlzTWFjID8gZXYubWV0YUtleSA6IGV2LmN0cmxLZXk7XG5cbiAgICAgICAgc3dpdGNoIChldi5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgS2V5LlBBR0VfVVA6XG4gICAgICAgICAgICBjYXNlIEtleS5QQUdFX0RPV046XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNNb2RpZmllciAmJiAhaXNNb2RpZmllcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vblNjcm9sbEtleVByZXNzZWQoZXYpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgS2V5LkhPTUU6XG4gICAgICAgICAgICBjYXNlIEtleS5FTkQ6XG4gICAgICAgICAgICAgICAgaWYgKGV2LmN0cmxLZXkgJiYgIWV2LnNoaWZ0S2V5ICYmICFldi5hbHRLZXkgJiYgIWV2Lm1ldGFLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25TY3JvbGxLZXlQcmVzc2VkKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXkuSzpcbiAgICAgICAgICAgICAgICBpZiAoY3RybENtZE9ubHkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2ZvY3VzX3Jvb21fZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5LkY6XG4gICAgICAgICAgICAgICAgaWYgKGN0cmxDbWRPbmx5ICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJjdHJsRkZvclNlYXJjaFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnZm9jdXNfc2VhcmNoJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5LkJBQ0tUSUNLOlxuICAgICAgICAgICAgICAgIC8vIElkZWFsbHkgdGhpcyB3b3VsZCBiZSBDVFJMK1AgZm9yIFwiUHJvZmlsZVwiLCBidXQgdGhhdCdzXG4gICAgICAgICAgICAgICAgLy8gdGFrZW4gYnkgdGhlIHByaW50IGRpYWxvZy4gQ1RSTCtJIGZvciBcIkluZm9ybWF0aW9uXCJcbiAgICAgICAgICAgICAgICAvLyB3YXMgcHJldmlvdXNseSBjaG9zZW4gYnV0IGNvbmZsaWN0ZWQgd2l0aCBpdGFsaWNzIGluXG4gICAgICAgICAgICAgICAgLy8gY29tcG9zZXIsIHNvIENUUkwrYCBpdCBpc1xuXG4gICAgICAgICAgICAgICAgaWYgKGN0cmxDbWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5maXJlKEFjdGlvbi5Ub2dnbGVVc2VyTWVudSk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBLZXkuU0xBU0g6XG4gICAgICAgICAgICAgICAgaWYgKGlzT25seUN0cmxPckNtZElnbm9yZVNoaWZ0S2V5RXZlbnQoZXYpKSB7XG4gICAgICAgICAgICAgICAgICAgIEtleWJvYXJkU2hvcnRjdXRzLnRvZ2dsZURpYWxvZygpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgS2V5Lkg6XG4gICAgICAgICAgICAgICAgaWYgKGV2LmFsdEtleSAmJiBtb2RLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNsb3NlQ3VycmVudE1vZGFsKFwiaG9tZUtleWJvYXJkU2hvcnRjdXRcIik7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBLZXkuQVJST1dfVVA6XG4gICAgICAgICAgICBjYXNlIEtleS5BUlJPV19ET1dOOlxuICAgICAgICAgICAgICAgIGlmIChldi5hbHRLZXkgJiYgIWV2LmN0cmxLZXkgJiYgIWV2Lm1ldGFLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tRGVsdGFQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbURlbHRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGE6IGV2LmtleSA9PT0gS2V5LkFSUk9XX1VQID8gLTEgOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5yZWFkOiBldi5zaGlmdEtleSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBLZXkuUEVSSU9EOlxuICAgICAgICAgICAgICAgIGlmIChjdHJsQ21kT25seSAmJiAodGhpcy5wcm9wcy5wYWdlX3R5cGUgPT09IFwicm9vbV92aWV3XCIgfHwgdGhpcy5wcm9wcy5wYWdlX3R5cGUgPT09IFwiZ3JvdXBfdmlld1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8VG9nZ2xlUmlnaHRQYW5lbFBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlRvZ2dsZVJpZ2h0UGFuZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLnByb3BzLnBhZ2VfdHlwZSA9PT0gXCJyb29tX3ZpZXdcIiA/IFwicm9vbVwiIDogXCJncm91cFwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGRvIG5vdCBoYXZlIGEgaGFuZGxlciBmb3IgaXQsIHBhc3MgaXQgdG8gdGhlIHBsYXRmb3JtIHdoaWNoIG1pZ2h0XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IFBsYXRmb3JtUGVnLmdldCgpLm9uS2V5RG93bihldik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCFpc01vZGlmaWVyICYmICFldi5hbHRLZXkgJiYgIWV2LmN0cmxLZXkgJiYgIWV2Lm1ldGFLZXkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBhYm92ZSBjb25kaXRpb24gaXMgY3JhZnRlZCB0byBfYWxsb3dfIGNoYXJhY3RlcnMgd2l0aCBTaGlmdFxuICAgICAgICAgICAgLy8gYWxyZWFkeSBwcmVzc2VkIChidXQgbm90IHRoZSBTaGlmdCBrZXkgZG93biBpdHNlbGYpLlxuXG4gICAgICAgICAgICBjb25zdCBpc0NsaWNrU2hvcnRjdXQgPSBldi50YXJnZXQgIT09IGRvY3VtZW50LmJvZHkgJiZcbiAgICAgICAgICAgICAgICAoZXYua2V5ID09PSBLZXkuU1BBQ0UgfHwgZXYua2V5ID09PSBLZXkuRU5URVIpO1xuXG4gICAgICAgICAgICAvLyBEbyBub3QgY2FwdHVyZSB0aGUgY29udGV4dCBtZW51IGtleSB0byBpbXByb3ZlIGtleWJvYXJkIGFjY2Vzc2liaWxpdHlcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09IEtleS5DT05URVhUX01FTlUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaXNDbGlja1Nob3J0Y3V0ICYmIGV2LmtleSAhPT0gS2V5LlRBQiAmJiAhY2FuRWxlbWVudFJlY2VpdmVJbnB1dChldi50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgLy8gc3luY2hyb25vdXMgZGlzcGF0Y2ggc28gd2UgZm9jdXMgYmVmb3JlIGtleSBnZW5lcmF0ZXMgaW5wdXRcbiAgICAgICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3NlciwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgLy8gd2Ugc2hvdWxkICpub3QqIHByZXZlbnREZWZhdWx0KCkgaGVyZSBhc1xuICAgICAgICAgICAgICAgIC8vIHRoYXQgd291bGQgcHJldmVudCB0eXBpbmcgaW4gdGhlIG5vdy1mb2N1c3NlZCBjb21wb3NlclxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGRpc3BhdGNoIGEgcGFnZS11cC9wYWdlLWRvd24vZXRjIHRvIHRoZSBhcHByb3ByaWF0ZSBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXYgVGhlIGtleSBldmVudFxuICAgICAqL1xuICAgIF9vblNjcm9sbEtleVByZXNzZWQgPSAoZXYpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvb21WaWV3LmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb21WaWV3LmN1cnJlbnQuaGFuZGxlU2Nyb2xsS2V5KGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25EcmFnRW5kID0gKHJlc3VsdCkgPT4ge1xuICAgICAgICAvLyBEcmFnZ2VkIHRvIGFuIGludmFsaWQgZGVzdGluYXRpb24sIG5vdCBvbnRvIGEgZHJvcHBhYmxlXG4gICAgICAgIGlmICghcmVzdWx0LmRlc3RpbmF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZXN0ID0gcmVzdWx0LmRlc3RpbmF0aW9uLmRyb3BwYWJsZUlkO1xuXG4gICAgICAgIGlmIChkZXN0ID09PSAndGFnLXBhbmVsLWRyb3BwYWJsZScpIHtcbiAgICAgICAgICAgIC8vIENvdWxkIGJlIFwiR3JvdXBUaWxlICtncm91cElkOmRvbWFpblwiXG4gICAgICAgICAgICBjb25zdCBkcmFnZ2FibGVJZCA9IHJlc3VsdC5kcmFnZ2FibGVJZC5zcGxpdCgnICcpLnBvcCgpO1xuXG4gICAgICAgICAgICAvLyBEaXNwYXRjaCBzeW5jaHJvbm91c2x5IHNvIHRoYXQgdGhlIEdyb3VwRmlsdGVyUGFuZWwgcmVjZWl2ZXMgYW5cbiAgICAgICAgICAgIC8vIG9wdGltaXN0aWMgdXBkYXRlIGZyb20gR3JvdXBGaWx0ZXJPcmRlclN0b3JlIGJlZm9yZSB0aGUgcHJldmlvdXNcbiAgICAgICAgICAgIC8vIHN0YXRlIGlzIHNob3duLlxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKFRhZ09yZGVyQWN0aW9ucy5tb3ZlVGFnKFxuICAgICAgICAgICAgICAgIHRoaXMuX21hdHJpeENsaWVudCxcbiAgICAgICAgICAgICAgICBkcmFnZ2FibGVJZCxcbiAgICAgICAgICAgICAgICByZXN1bHQuZGVzdGluYXRpb24uaW5kZXgsXG4gICAgICAgICAgICApLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChkZXN0LnN0YXJ0c1dpdGgoJ3Jvb20tc3ViLWxpc3QtZHJvcHBhYmxlXycpKSB7XG4gICAgICAgICAgICB0aGlzLl9vblJvb21UaWxlRW5kRHJhZyhyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vblJvb21UaWxlRW5kRHJhZyA9IChyZXN1bHQpID0+IHtcbiAgICAgICAgbGV0IG5ld1RhZyA9IHJlc3VsdC5kZXN0aW5hdGlvbi5kcm9wcGFibGVJZC5zcGxpdCgnXycpWzFdO1xuICAgICAgICBsZXQgcHJldlRhZyA9IHJlc3VsdC5zb3VyY2UuZHJvcHBhYmxlSWQuc3BsaXQoJ18nKVsxXTtcbiAgICAgICAgaWYgKG5ld1RhZyA9PT0gJ3VuZGVmaW5lZCcpIG5ld1RhZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHByZXZUYWcgPT09ICd1bmRlZmluZWQnKSBwcmV2VGFnID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHJlc3VsdC5kcmFnZ2FibGVJZC5zcGxpdCgnXycpWzFdO1xuXG4gICAgICAgIGNvbnN0IG9sZEluZGV4ID0gcmVzdWx0LnNvdXJjZS5pbmRleDtcbiAgICAgICAgY29uc3QgbmV3SW5kZXggPSByZXN1bHQuZGVzdGluYXRpb24uaW5kZXg7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKFJvb21MaXN0QWN0aW9ucy50YWdSb29tKFxuICAgICAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LFxuICAgICAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKSxcbiAgICAgICAgICAgIHByZXZUYWcsIG5ld1RhZyxcbiAgICAgICAgICAgIG9sZEluZGV4LCBuZXdJbmRleCxcbiAgICAgICAgKSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgUm9vbVZpZXcgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLlJvb21WaWV3Jyk7XG4gICAgICAgIGNvbnN0IFVzZXJWaWV3ID0gc2RrLmdldENvbXBvbmVudCgnc3RydWN0dXJlcy5Vc2VyVmlldycpO1xuICAgICAgICBjb25zdCBHcm91cFZpZXcgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLkdyb3VwVmlldycpO1xuICAgICAgICBjb25zdCBNeUdyb3VwcyA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuTXlHcm91cHMnKTtcbiAgICAgICAgY29uc3QgVG9hc3RDb250YWluZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLlRvYXN0Q29udGFpbmVyJyk7XG5cbiAgICAgICAgbGV0IHBhZ2VFbGVtZW50O1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5wcm9wcy5wYWdlX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGFnZVR5cGVzLlJvb21WaWV3OlxuICAgICAgICAgICAgICAgIHBhZ2VFbGVtZW50ID0gPFJvb21WaWV3XG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5fcm9vbVZpZXd9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Kb2luPXt0aGlzLnByb3BzLmF1dG9Kb2lufVxuICAgICAgICAgICAgICAgICAgICBvblJlZ2lzdGVyZWQ9e3RoaXMucHJvcHMub25SZWdpc3RlcmVkfVxuICAgICAgICAgICAgICAgICAgICB0aHJlZXBpZEludml0ZT17dGhpcy5wcm9wcy50aHJlZXBpZEludml0ZX1cbiAgICAgICAgICAgICAgICAgICAgb29iRGF0YT17dGhpcy5wcm9wcy5yb29tT29iRGF0YX1cbiAgICAgICAgICAgICAgICAgICAgdmlhU2VydmVycz17dGhpcy5wcm9wcy52aWFTZXJ2ZXJzfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e3RoaXMucHJvcHMuY3VycmVudFJvb21JZCB8fCAncm9vbXZpZXcnfVxuICAgICAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuTXlHcm91cHM6XG4gICAgICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSA8TXlHcm91cHMgLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUGFnZVR5cGVzLlJvb21EaXJlY3Rvcnk6XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlZCBieSBNYXRyaXhDaGF0IGZvciBub3dcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuSG9tZVBhZ2U6XG4gICAgICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSA8SG9tZVBhZ2UganVzdFJlZ2lzdGVyZWQ9e3RoaXMucHJvcHMuanVzdFJlZ2lzdGVyZWR9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFBhZ2VUeXBlcy5Vc2VyVmlldzpcbiAgICAgICAgICAgICAgICBwYWdlRWxlbWVudCA9IDxVc2VyVmlldyB1c2VySWQ9e3RoaXMucHJvcHMuY3VycmVudFVzZXJJZH0gcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuR3JvdXBWaWV3OlxuICAgICAgICAgICAgICAgIHBhZ2VFbGVtZW50ID0gPEdyb3VwVmlld1xuICAgICAgICAgICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmN1cnJlbnRHcm91cElkfVxuICAgICAgICAgICAgICAgICAgICBpc05ldz17dGhpcy5wcm9wcy5jdXJyZW50R3JvdXBJc05ld31cbiAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYm9keUNsYXNzZXMgPSAnbXhfTWF0cml4Q2hhdCc7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnVzZUNvbXBhY3RMYXlvdXQpIHtcbiAgICAgICAgICAgIGJvZHlDbGFzc2VzICs9ICcgbXhfTWF0cml4Q2hhdF91c2VDb21wYWN0TGF5b3V0JztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxlZnRQYW5lbCA9IChcbiAgICAgICAgICAgIDxMZWZ0UGFuZWxcbiAgICAgICAgICAgICAgICBpc01pbmltaXplZD17dGhpcy5wcm9wcy5jb2xsYXBzZUxocyB8fCBmYWxzZX1cbiAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxNYXRyaXhDbGllbnRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt0aGlzLl9tYXRyaXhDbGllbnR9PlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgb25QYXN0ZT17dGhpcy5fb25QYXN0ZX1cbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLl9vblJlYWN0S2V5RG93bn1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9NYXRyaXhDaGF0X3dyYXBwZXInXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPXt0aGlzLnByb3BzLmhpZGVUb1NSVXNlcnN9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8VG9hc3RDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICAgICAgPERyYWdEcm9wQ29udGV4dCBvbkRyYWdFbmQ9e3RoaXMuX29uRHJhZ0VuZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHJlZj17dGhpcy5fcmVzaXplQ29udGFpbmVyfSBjbGFzc05hbWU9e2JvZHlDbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGxlZnRQYW5lbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJlc2l6ZUhhbmRsZSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcGFnZUVsZW1lbnQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvRHJhZ0Ryb3BDb250ZXh0PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxDYWxsQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPE5vblVyZ2VudFRvYXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEhvc3RTaWdudXBDb250YWluZXIgLz5cbiAgICAgICAgICAgIDwvTWF0cml4Q2xpZW50Q29udGV4dC5Qcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvZ2dlZEluVmlldztcbiJdfQ==