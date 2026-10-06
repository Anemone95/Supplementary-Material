"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _SpacePanel = _interopRequireDefault(require("../views/spaces/SpacePanel"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

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
let LoggedInView = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.LoggedInView"), _dec(_class = (_temp = _class2 = class LoggedInView extends React.Component
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
    (0, _defineProperty2.default)(this, "onUsageLimitDismissed", () => {
      this.setState({
        usageLimitDismissed: true
      });
    });
    (0, _defineProperty2.default)(this, "_updateServerNoticeEvents", async () => {
      const serverNoticeList = _RoomListStore.default.instance.orderedLists[_models.DefaultTagID.ServerNotice];
      if (!serverNoticeList) return [];
      const events = [];
      let pinnedEventTs = 0;

      for (const room of serverNoticeList) {
        const pinStateEvent = room.currentState.getStateEvents("m.room.pinned_events", "");
        if (!pinStateEvent || !pinStateEvent.getContent().pinned) continue;
        pinnedEventTs = pinStateEvent.getTs();
        const pinnedEventIds = pinStateEvent.getContent().pinned.slice(0, MAX_PINNED_NOTICES_PER_ROOM);

        for (const eventId of pinnedEventIds) {
          const timeline = await this._matrixClient.getEventTimeline(room.getUnfilteredTimelineSet(), eventId, 0);
          const event = timeline.getEvents().find(ev => ev.getId() === eventId);
          if (event) events.push(event);
        }
      }

      if (pinnedEventTs && this.state.usageLimitEventTs > pinnedEventTs) {
        // We've processed a newer event than this one, so ignore it.
        return;
      }

      const usageLimitEvent = events.find(e => {
        return e && e.getType() === 'm.room.message' && e.getContent()['server_notice_type'] === 'm.server_notice.usage_limit_reached';
      });
      const usageLimitEventContent = usageLimitEvent && usageLimitEvent.getContent();

      this._calculateServerLimitToast(this.state.syncErrorData, usageLimitEventContent);

      this.setState({
        usageLimitEventContent,
        usageLimitEventTs: pinnedEventTs,
        // This is a fresh toast, we can show toasts again
        usageLimitDismissed: false
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
      const roomAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      switch (roomAction) {
        case _KeyBindingsManager.RoomAction.ScrollUp:
        case _KeyBindingsManager.RoomAction.RoomScrollDown:
        case _KeyBindingsManager.RoomAction.JumpToFirstMessage:
        case _KeyBindingsManager.RoomAction.JumpToLatestMessage:
          // pass the event down to the scroll panel
          this._onScrollKeyPressed(ev);

          handled = true;
          break;

        case _KeyBindingsManager.RoomAction.FocusSearch:
          _dispatcher.default.dispatch({
            action: 'focus_search'
          });

          handled = true;
          break;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
        return;
      }

      const navAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getNavigationAction(ev);

      switch (navAction) {
        case _KeyBindingsManager.NavigationAction.FocusRoomSearch:
          _dispatcher.default.dispatch({
            action: 'focus_room_filter'
          });

          handled = true;
          break;

        case _KeyBindingsManager.NavigationAction.ToggleUserMenu:
          _dispatcher.default.fire(_actions.Action.ToggleUserMenu);

          handled = true;
          break;

        case _KeyBindingsManager.NavigationAction.ToggleShortCutDialog:
          KeyboardShortcuts.toggleDialog();
          handled = true;
          break;

        case _KeyBindingsManager.NavigationAction.GoToHome:
          _dispatcher.default.dispatch({
            action: 'view_home_page'
          });

          _Modal.default.closeCurrentModal("homeKeyboardShortcut");

          handled = true;
          break;

        case _KeyBindingsManager.NavigationAction.ToggleRoomSidePanel:
          if (this.props.page_type === "room_view" || this.props.page_type === "group_view") {
            _dispatcher.default.dispatch({
              action: _actions.Action.ToggleRightPanel,
              type: this.props.page_type === "room_view" ? "room" : "group"
            });

            handled = true;
          }

          break;

        case _KeyBindingsManager.NavigationAction.SelectPrevRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: -1,
            unread: false
          });

          handled = true;
          break;

        case _KeyBindingsManager.NavigationAction.SelectNextRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: 1,
            unread: false
          });

          handled = true;
          break;

        case _KeyBindingsManager.NavigationAction.SelectPrevUnreadRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: -1,
            unread: true
          });

          break;

        case _KeyBindingsManager.NavigationAction.SelectNextUnreadRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: 1,
            unread: true
          });

          break;

        default:
          // if we do not have a handler for it, pass it to the platform which might
          handled = _PlatformPeg.default.get().onKeyDown(ev);
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
        return;
      }

      const isModifier = ev.key === _Keyboard.Key.ALT || ev.key === _Keyboard.Key.CONTROL || ev.key === _Keyboard.Key.META || ev.key === _Keyboard.Key.SHIFT;

      if (!isModifier && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
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
      useCompactLayout: _SettingsStore.default.getValue('useCompactLayout'),
      usageLimitDismissed: false
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
      // TODO decrease this once Spaces launches as it'll no longer need to include the 56px Community Panel
      toggleSize: 206 - 50,
      onCollapsed: _collapsed => {
        collapsed = _collapsed;

        if (_collapsed) {
          _dispatcher.default.dispatch({
            action: "hide_left_panel"
          });

          window.localStorage.setItem("mx_lhs_size", '0');
        } else {
          _dispatcher.default.dispatch({
            action: "show_left_panel"
          });
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
      },
      isItemCollapsed: domNode => {
        return domNode.classList.contains("mx_LeftPanel_minimized");
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
    } // usageLimitDismissed is true when the user has explicitly hidden the toast
    // and it will be reset to false if a *new* usage alert comes in.


    if (usageLimitEventContent && this.state.usageLimitDismissed) {
      (0, _ServerLimitToast.showToast)(usageLimitEventContent.limit_type, this.onUsageLimitDismissed, usageLimitEventContent.admin_contact, error);
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
          onRegistered: this.props.onRegistered,
          threepidInvite: this.props.threepidInvite,
          oobData: this.props.roomOobData,
          key: this.props.currentRoomId || 'roomview',
          resizeNotifier: this.props.resizeNotifier,
          justCreatedOpts: this.props.roomJustCreatedOpts
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
    }, _SettingsStore.default.getValue("feature_spaces") ? /*#__PURE__*/React.createElement(_SpacePanel.default, null) : null, /*#__PURE__*/React.createElement(_LeftPanel.default, {
      isMinimized: this.props.collapseLhs || false,
      resizeNotifier: this.props.resizeNotifier
    }), /*#__PURE__*/React.createElement(_ResizeHandle.default, null), pageElement))), /*#__PURE__*/React.createElement(_CallContainer.default, null), /*#__PURE__*/React.createElement(_NonUrgentToastContainer.default, null), /*#__PURE__*/React.createElement(_HostSignupContainer.default, null));
  }

}, (0, _defineProperty2.default)(_class2, "displayName", 'LoggedInView'), (0, _defineProperty2.default)(_class2, "propTypes", {
  matrixClient: PropTypes.instanceOf(_client.MatrixClient).isRequired,
  page_type: PropTypes.string.isRequired,
  onRoomCreated: PropTypes.func,
  // Called with the credentials of a registered user (if they were a ROU that
  // transitioned to PWLU)
  onRegistered: PropTypes.func // and lots and lots of other stuff.

}), _temp)) || _class);
var _default = LoggedInView;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTG9nZ2VkSW5WaWV3LnRzeCJdLCJuYW1lcyI6WyJNQVhfUElOTkVEX05PVElDRVNfUEVSX1JPT00iLCJjYW5FbGVtZW50UmVjZWl2ZUlucHV0IiwiZWwiLCJ0YWdOYW1lIiwiZ2V0QXR0cmlidXRlIiwiTG9nZ2VkSW5WaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInJvb21JZCIsIl9yb29tVmlldyIsImN1cnJlbnQiLCJjYW5SZXNldFRpbWVsaW5lIiwiZXZlbnQiLCJnZXRUeXBlIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJzZXR0aW5nIiwibGV2ZWwiLCJ2YWx1ZUF0TGV2ZWwiLCJuZXdWYWx1ZSIsInNldFN0YXRlIiwidXNlQ29tcGFjdExheW91dCIsInN5bmNTdGF0ZSIsIm9sZFN5bmNTdGF0ZSIsImRhdGEiLCJvbGRFcnJDb2RlIiwic3RhdGUiLCJzeW5jRXJyb3JEYXRhIiwiZXJyb3IiLCJlcnJjb2RlIiwibmV3RXJyQ29kZSIsIl91cGRhdGVTZXJ2ZXJOb3RpY2VFdmVudHMiLCJfY2FsY3VsYXRlU2VydmVyTGltaXRUb2FzdCIsInVzYWdlTGltaXRFdmVudENvbnRlbnQiLCJldiIsInNlcnZlck5vdGljZUxpc3QiLCJSb29tTGlzdFN0b3JlIiwiaW5zdGFuY2UiLCJvcmRlcmVkTGlzdHMiLCJEZWZhdWx0VGFnSUQiLCJTZXJ2ZXJOb3RpY2UiLCJzb21lIiwiciIsImdldFJvb21JZCIsInVzYWdlTGltaXREaXNtaXNzZWQiLCJldmVudHMiLCJwaW5uZWRFdmVudFRzIiwicm9vbSIsInBpblN0YXRlRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJwaW5uZWQiLCJnZXRUcyIsInBpbm5lZEV2ZW50SWRzIiwic2xpY2UiLCJldmVudElkIiwidGltZWxpbmUiLCJfbWF0cml4Q2xpZW50IiwiZ2V0RXZlbnRUaW1lbGluZSIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsImdldEV2ZW50cyIsImZpbmQiLCJnZXRJZCIsInB1c2giLCJ1c2FnZUxpbWl0RXZlbnRUcyIsInVzYWdlTGltaXRFdmVudCIsImUiLCJjYW5SZWNlaXZlSW5wdXQiLCJlbGVtZW50IiwidGFyZ2V0IiwicGFyZW50RWxlbWVudCIsImZpcmUiLCJBY3Rpb24iLCJGb2N1c0NvbXBvc2VyIiwiX29uS2V5RG93biIsImRvY3VtZW50IiwiYm9keSIsImhhbmRsZWQiLCJyb29tQWN0aW9uIiwiZ2V0Um9vbUFjdGlvbiIsIlJvb21BY3Rpb24iLCJTY3JvbGxVcCIsIlJvb21TY3JvbGxEb3duIiwiSnVtcFRvRmlyc3RNZXNzYWdlIiwiSnVtcFRvTGF0ZXN0TWVzc2FnZSIsIl9vblNjcm9sbEtleVByZXNzZWQiLCJGb2N1c1NlYXJjaCIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwibmF2QWN0aW9uIiwiZ2V0TmF2aWdhdGlvbkFjdGlvbiIsIk5hdmlnYXRpb25BY3Rpb24iLCJGb2N1c1Jvb21TZWFyY2giLCJUb2dnbGVVc2VyTWVudSIsIlRvZ2dsZVNob3J0Q3V0RGlhbG9nIiwiS2V5Ym9hcmRTaG9ydGN1dHMiLCJ0b2dnbGVEaWFsb2ciLCJHb1RvSG9tZSIsIk1vZGFsIiwiY2xvc2VDdXJyZW50TW9kYWwiLCJUb2dnbGVSb29tU2lkZVBhbmVsIiwicGFnZV90eXBlIiwiVG9nZ2xlUmlnaHRQYW5lbCIsInR5cGUiLCJTZWxlY3RQcmV2Um9vbSIsIlZpZXdSb29tRGVsdGEiLCJkZWx0YSIsInVucmVhZCIsIlNlbGVjdE5leHRSb29tIiwiU2VsZWN0UHJldlVucmVhZFJvb20iLCJTZWxlY3ROZXh0VW5yZWFkUm9vbSIsIlBsYXRmb3JtUGVnIiwiZ2V0Iiwib25LZXlEb3duIiwiaXNNb2RpZmllciIsImtleSIsIktleSIsIkFMVCIsIkNPTlRST0wiLCJNRVRBIiwiU0hJRlQiLCJhbHRLZXkiLCJjdHJsS2V5IiwibWV0YUtleSIsImlzQ2xpY2tTaG9ydGN1dCIsIlNQQUNFIiwiRU5URVIiLCJDT05URVhUX01FTlUiLCJUQUIiLCJoYW5kbGVTY3JvbGxLZXkiLCJyZXN1bHQiLCJkZXN0aW5hdGlvbiIsImRlc3QiLCJkcm9wcGFibGVJZCIsImRyYWdnYWJsZUlkIiwic3BsaXQiLCJwb3AiLCJUYWdPcmRlckFjdGlvbnMiLCJtb3ZlVGFnIiwiaW5kZXgiLCJzdGFydHNXaXRoIiwiX29uUm9vbVRpbGVFbmREcmFnIiwibmV3VGFnIiwicHJldlRhZyIsInNvdXJjZSIsInVuZGVmaW5lZCIsIm9sZEluZGV4IiwibmV3SW5kZXgiLCJSb29tTGlzdEFjdGlvbnMiLCJ0YWdSb29tIiwiZ2V0Um9vbSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIm1hdHJpeENsaWVudCIsIkNhbGxNZWRpYUhhbmRsZXIiLCJsb2FkRGV2aWNlcyIsImNyZWF0ZVJlZiIsIl9yZXNpemVDb250YWluZXIiLCJjb21wb25lbnREaWRNb3VudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJfb25OYXRpdmVLZXlEb3duIiwib24iLCJvbkFjY291bnREYXRhIiwib25TeW5jIiwiZ2V0U3luY1N0YXRlIiwiZ2V0U3luY1N0YXRlRGF0YSIsIm9uUm9vbVN0YXRlRXZlbnRzIiwiY29tcGFjdExheW91dFdhdGNoZXJSZWYiLCJ3YXRjaFNldHRpbmciLCJvbkNvbXBhY3RMYXlvdXRDaGFuZ2VkIiwicmVzaXplciIsIl9jcmVhdGVSZXNpemVyIiwiYXR0YWNoIiwiX2xvYWRSZXNpemVyUHJlZmVyZW5jZXMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsInVud2F0Y2hTZXR0aW5nIiwiZGV0YWNoIiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwiQm9vbGVhbiIsIk1hdHJpeENsaWVudFBlZyIsInNpemUiLCJjb2xsYXBzZWQiLCJjb2xsYXBzZUNvbmZpZyIsInRvZ2dsZVNpemUiLCJvbkNvbGxhcHNlZCIsIl9jb2xsYXBzZWQiLCJ3aW5kb3ciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwib25SZXNpemVkIiwiX3NpemUiLCJyZXNpemVOb3RpZmllciIsIm5vdGlmeUxlZnRIYW5kbGVSZXNpemVkIiwib25SZXNpemVTdGFydCIsInN0YXJ0UmVzaXppbmciLCJvblJlc2l6ZVN0b3AiLCJzdG9wUmVzaXppbmciLCJpc0l0ZW1Db2xsYXBzZWQiLCJkb21Ob2RlIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJSZXNpemVyIiwiQ29sbGFwc2VEaXN0cmlidXRvciIsInNldENsYXNzTmFtZXMiLCJoYW5kbGUiLCJ2ZXJ0aWNhbCIsInJldmVyc2UiLCJsaHNTaXplIiwicGFyc2VJbnQiLCJnZXRJdGVtIiwiaXNOYU4iLCJmb3JIYW5kbGVBdCIsInJlc2l6ZSIsInN5bmNFcnJvciIsImxpbWl0X3R5cGUiLCJvblVzYWdlTGltaXREaXNtaXNzZWQiLCJhZG1pbl9jb250YWN0IiwicmVuZGVyIiwiUm9vbVZpZXciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJVc2VyVmlldyIsIkdyb3VwVmlldyIsIk15R3JvdXBzIiwiVG9hc3RDb250YWluZXIiLCJwYWdlRWxlbWVudCIsIlBhZ2VUeXBlcyIsIm9uUmVnaXN0ZXJlZCIsInRocmVlcGlkSW52aXRlIiwicm9vbU9vYkRhdGEiLCJjdXJyZW50Um9vbUlkIiwicm9vbUp1c3RDcmVhdGVkT3B0cyIsIlJvb21EaXJlY3RvcnkiLCJIb21lUGFnZSIsImp1c3RSZWdpc3RlcmVkIiwiY3VycmVudFVzZXJJZCIsImN1cnJlbnRHcm91cElkIiwiY3VycmVudEdyb3VwSXNOZXciLCJib2R5Q2xhc3NlcyIsIl9vblBhc3RlIiwiX29uUmVhY3RLZXlEb3duIiwiaGlkZVRvU1JVc2VycyIsIl9vbkRyYWdFbmQiLCJjb2xsYXBzZUxocyIsIlByb3BUeXBlcyIsImluc3RhbmNlT2YiLCJNYXRyaXhDbGllbnQiLCJpc1JlcXVpcmVkIiwic3RyaW5nIiwib25Sb29tQ3JlYXRlZCIsImZ1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Q016Rix1QkFBY0MsUUFBZCxDQUF1QixnQkFBdkIsaUJBQTJDLG9CQUFDLG1CQUFELE9BQTNDLEdBQTRELElBRGxFLGVBRUksb0JBQUMsa0JBQUQ7QUFDSSxNQUFBLFdBQVcsRUFBRSxLQUFLcEosS0FBTCxDQUFXaVAsV0FBWCxJQUEwQixLQUQzQztBQUVJLE1BQUEsY0FBYyxFQUFFLEtBQUtqUCxLQUFMLENBQVc2TDtBQUYvQixNQUZKLGVBTUksb0JBQUMscUJBQUQsT0FOSixFQU9Na0MsV0FQTixDQURKLENBUEosQ0FESixlQW9CSSxvQkFBQyxzQkFBRCxPQXBCSixlQXFCSSxvQkFBQyxnQ0FBRCxPQXJCSixlQXNCSSxvQkFBQyw0QkFBRCxPQXRCSixDQURKO0FBMEJIOztBQTVpQnNELEMsd0RBQ2xDLGMsdURBRUY7QUFDZjFFLEVBQUFBLFlBQVksRUFBRTZGLFNBQVMsQ0FBQ0MsVUFBVixDQUFxQkMsb0JBQXJCLEVBQW1DQyxVQURsQztBQUVmcEosRUFBQUEsU0FBUyxFQUFFaUosU0FBUyxDQUFDSSxNQUFWLENBQWlCRCxVQUZiO0FBR2ZFLEVBQUFBLGFBQWEsRUFBRUwsU0FBUyxDQUFDTSxJQUhWO0FBS2Y7QUFDQTtBQUNBdkIsRUFBQUEsWUFBWSxFQUFFaUIsU0FBUyxDQUFDTSxJQVBULENBU2Y7O0FBVGUsQztlQTRpQlI1UCxZIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTgsIDIwMjAgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgRHJhZ0Ryb3BDb250ZXh0IH0gZnJvbSAncmVhY3QtYmVhdXRpZnVsLWRuZCc7XG5cbmltcG9ydCB7S2V5fSBmcm9tICcuLi8uLi9LZXlib2FyZCc7XG5pbXBvcnQgUGFnZVR5cGVzIGZyb20gJy4uLy4uL1BhZ2VUeXBlcyc7XG5pbXBvcnQgQ2FsbE1lZGlhSGFuZGxlciBmcm9tICcuLi8uLi9DYWxsTWVkaWFIYW5kbGVyJztcbmltcG9ydCB7IGZpeHVwQ29sb3JGb250cyB9IGZyb20gJy4uLy4uL3V0aWxzL0ZvbnRNYW5hZ2VyJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi9pbmRleCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZywgSU1hdHJpeENsaWVudENyZWRzfSBmcm9tICcuLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcblxuaW1wb3J0IFRhZ09yZGVyQWN0aW9ucyBmcm9tICcuLi8uLi9hY3Rpb25zL1RhZ09yZGVyQWN0aW9ucyc7XG5pbXBvcnQgUm9vbUxpc3RBY3Rpb25zIGZyb20gJy4uLy4uL2FjdGlvbnMvUm9vbUxpc3RBY3Rpb25zJztcbmltcG9ydCBSZXNpemVIYW5kbGUgZnJvbSAnLi4vdmlld3MvZWxlbWVudHMvUmVzaXplSGFuZGxlJztcbmltcG9ydCB7UmVzaXplciwgQ29sbGFwc2VEaXN0cmlidXRvcn0gZnJvbSAnLi4vLi4vcmVzaXplcic7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0ICogYXMgS2V5Ym9hcmRTaG9ydGN1dHMgZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCBIb21lUGFnZSBmcm9tIFwiLi9Ib21lUGFnZVwiO1xuaW1wb3J0IFJlc2l6ZU5vdGlmaWVyIGZyb20gXCIuLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gXCIuLi8uLi9QbGF0Zm9ybVBlZ1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRhZ0lEIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQge1xuICAgIHNob3dUb2FzdCBhcyBzaG93U2VydmVyTGltaXRUb2FzdCxcbiAgICBoaWRlVG9hc3QgYXMgaGlkZVNlcnZlckxpbWl0VG9hc3QsXG59IGZyb20gXCIuLi8uLi90b2FzdHMvU2VydmVyTGltaXRUb2FzdFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IExlZnRQYW5lbCBmcm9tIFwiLi9MZWZ0UGFuZWxcIjtcbmltcG9ydCBDYWxsQ29udGFpbmVyIGZyb20gJy4uL3ZpZXdzL3ZvaXAvQ2FsbENvbnRhaW5lcic7XG5pbXBvcnQgeyBWaWV3Um9vbURlbHRhUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tRGVsdGFQYXlsb2FkXCI7XG5pbXBvcnQgUm9vbUxpc3RTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQgTm9uVXJnZW50VG9hc3RDb250YWluZXIgZnJvbSBcIi4vTm9uVXJnZW50VG9hc3RDb250YWluZXJcIjtcbmltcG9ydCB7IFRvZ2dsZVJpZ2h0UGFuZWxQYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVG9nZ2xlUmlnaHRQYW5lbFBheWxvYWRcIjtcbmltcG9ydCB7IElUaHJlZXBpZEludml0ZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IHsgSUNvbGxhcHNlQ29uZmlnIH0gZnJvbSBcIi4uLy4uL3Jlc2l6ZXIvZGlzdHJpYnV0b3JzL2NvbGxhcHNlXCI7XG5pbXBvcnQgSG9zdFNpZ251cENvbnRhaW5lciBmcm9tICcuLi92aWV3cy9ob3N0X3NpZ251cC9Ib3N0U2lnbnVwQ29udGFpbmVyJztcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciwgTmF2aWdhdGlvbkFjdGlvbiwgUm9vbUFjdGlvbiB9IGZyb20gJy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlcic7XG5pbXBvcnQgeyBJT3B0cyB9IGZyb20gXCIuLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQgU3BhY2VQYW5lbCBmcm9tIFwiLi4vdmlld3Mvc3BhY2VzL1NwYWNlUGFuZWxcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG4vLyBXZSBuZWVkIHRvIGZldGNoIGVhY2ggcGlubmVkIG1lc3NhZ2UgaW5kaXZpZHVhbGx5IChpZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgaXQpXG4vLyBzbyBlYWNoIHBpbm5lZCBtZXNzYWdlIG1heSB0cmlnZ2VyIGEgcmVxdWVzdC4gTGltaXQgdGhlIG51bWJlciBwZXIgcm9vbSBmb3Igc2FuaXR5LlxuLy8gTkIuIHRoaXMgaXMganVzdCBmb3Igc2VydmVyIG5vdGljZXMgcmF0aGVyIHRoYW4gcGlubmVkIG1lc3NhZ2VzIGluIGdlbmVyYWwuXG5jb25zdCBNQVhfUElOTkVEX05PVElDRVNfUEVSX1JPT00gPSAyO1xuXG5mdW5jdGlvbiBjYW5FbGVtZW50UmVjZWl2ZUlucHV0KGVsKSB7XG4gICAgcmV0dXJuIGVsLnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fFxuICAgICAgICBlbC50YWdOYW1lID09PSBcIlRFWFRBUkVBXCIgfHxcbiAgICAgICAgZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIiB8fFxuICAgICAgICAhIWVsLmdldEF0dHJpYnV0ZShcImNvbnRlbnRlZGl0YWJsZVwiKTtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgb25SZWdpc3RlcmVkOiAoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcykgPT4gUHJvbWlzZTxNYXRyaXhDbGllbnQ+O1xuICAgIGhpZGVUb1NSVXNlcnM6IGJvb2xlYW47XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBwYWdlX3R5cGU6IHN0cmluZztcbiAgICBhdXRvSm9pbjogYm9vbGVhbjtcbiAgICB0aHJlZXBpZEludml0ZT86IElUaHJlZXBpZEludml0ZTtcbiAgICByb29tT29iRGF0YT86IG9iamVjdDtcbiAgICBjdXJyZW50Um9vbUlkOiBzdHJpbmc7XG4gICAgY29sbGFwc2VMaHM6IGJvb2xlYW47XG4gICAgY29uZmlnOiB7XG4gICAgICAgIHBpd2lrOiB7XG4gICAgICAgICAgICBwb2xpY3lVcmw6IHN0cmluZztcbiAgICAgICAgfSxcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55LFxuICAgIH07XG4gICAgY3VycmVudFVzZXJJZD86IHN0cmluZztcbiAgICBjdXJyZW50R3JvdXBJZD86IHN0cmluZztcbiAgICBjdXJyZW50R3JvdXBJc05ldz86IGJvb2xlYW47XG4gICAganVzdFJlZ2lzdGVyZWQ/OiBib29sZWFuO1xuICAgIHJvb21KdXN0Q3JlYXRlZE9wdHM/OiBJT3B0cztcbn1cblxuaW50ZXJmYWNlIElVc2FnZUxpbWl0IHtcbiAgICAvLyBcImhzX2Rpc2FibGVkXCIgaXMgTk9UIGEgc3BlY2NlZCBzdHJpbmcsIGJ1dCBpcyB1c2VkIGluIFN5bmFwc2VcbiAgICAvLyBUaGlzIGlzIHRyYWNrZWQgb3ZlciBhdCBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy85MjM3XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIGxpbWl0X3R5cGU6IFwibW9udGhseV9hY3RpdmVfdXNlclwiIHwgXCJoc19kaXNhYmxlZFwiIHwgc3RyaW5nO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBhZG1pbl9jb250YWN0Pzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzeW5jRXJyb3JEYXRhPzoge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBub3Qgc3BlY2NlZCwgYnV0IHVzZWQgaW4gU3luYXBzZS4gU2VlXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy85MjM3I2lzc3VlY29tbWVudC03NjgyMzg5MjJcbiAgICAgICAgICAgIGRhdGE6IElVc2FnZUxpbWl0O1xuICAgICAgICAgICAgZXJyY29kZTogc3RyaW5nO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdXNhZ2VMaW1pdERpc21pc3NlZDogYm9vbGVhbjtcbiAgICB1c2FnZUxpbWl0RXZlbnRDb250ZW50PzogSVVzYWdlTGltaXQ7XG4gICAgdXNhZ2VMaW1pdEV2ZW50VHM/OiBudW1iZXI7XG4gICAgdXNlQ29tcGFjdExheW91dDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIHdoYXQgb3VyIE1hdHJpeENoYXQgc2hvd3Mgd2hlbiB3ZSBhcmUgbG9nZ2VkIGluLiBUaGUgcHJlY2lzZSB2aWV3IGlzXG4gKiBkZXRlcm1pbmVkIGJ5IHRoZSBwYWdlX3R5cGUgcHJvcGVydHkuXG4gKlxuICogQ3VycmVudGx5IGl0J3MgdmVyeSB0aWdodGx5IGNvdXBsZWQgd2l0aCBNYXRyaXhDaGF0LiBXZSBzaG91bGQgdHJ5IHRvIGRvXG4gKiBzb21ldGhpbmcgYWJvdXQgdGhhdC5cbiAqXG4gKiBDb21wb25lbnRzIG1vdW50ZWQgYmVsb3cgdXMgY2FuIGFjY2VzcyB0aGUgbWF0cml4IGNsaWVudCB2aWEgdGhlIHJlYWN0IGNvbnRleHQuXG4gKi9cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInN0cnVjdHVyZXMuTG9nZ2VkSW5WaWV3XCIpXG5jbGFzcyBMb2dnZWRJblZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnTG9nZ2VkSW5WaWV3JztcblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG1hdHJpeENsaWVudDogUHJvcFR5cGVzLmluc3RhbmNlT2YoTWF0cml4Q2xpZW50KS5pc1JlcXVpcmVkLFxuICAgICAgICBwYWdlX3R5cGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgb25Sb29tQ3JlYXRlZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLy8gQ2FsbGVkIHdpdGggdGhlIGNyZWRlbnRpYWxzIG9mIGEgcmVnaXN0ZXJlZCB1c2VyIChpZiB0aGV5IHdlcmUgYSBST1UgdGhhdFxuICAgICAgICAvLyB0cmFuc2l0aW9uZWQgdG8gUFdMVSlcbiAgICAgICAgb25SZWdpc3RlcmVkOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyBhbmQgbG90cyBhbmQgbG90cyBvZiBvdGhlciBzdHVmZi5cbiAgICB9O1xuXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9tYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3Jvb21WaWV3OiBSZWFjdC5SZWZPYmplY3Q8YW55PjtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3Jlc2l6ZUNvbnRhaW5lcjogUmVhY3QuUmVmT2JqZWN0PFJlc2l6ZUhhbmRsZT47XG4gICAgcHJvdGVjdGVkIGNvbXBhY3RMYXlvdXRXYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHJlc2l6ZXI6IFJlc2l6ZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHN5bmNFcnJvckRhdGE6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIHVzZSBjb21wYWN0IHRpbWVsaW5lIHZpZXdcbiAgICAgICAgICAgIHVzZUNvbXBhY3RMYXlvdXQ6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3VzZUNvbXBhY3RMYXlvdXQnKSxcbiAgICAgICAgICAgIHVzYWdlTGltaXREaXNtaXNzZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHN0YXNoIHRoZSBNYXRyaXhDbGllbnQgaW4gY2FzZSB3ZSBsb2cgb3V0IGJlZm9yZSB3ZSBhcmUgdW5tb3VudGVkXG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudCA9IHRoaXMucHJvcHMubWF0cml4Q2xpZW50O1xuXG4gICAgICAgIENhbGxNZWRpYUhhbmRsZXIubG9hZERldmljZXMoKTtcblxuICAgICAgICBmaXh1cENvbG9yRm9udHMoKTtcblxuICAgICAgICB0aGlzLl9yb29tVmlldyA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgICAgICB0aGlzLl9yZXNpemVDb250YWluZXIgPSBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uTmF0aXZlS2V5RG93biwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlck5vdGljZUV2ZW50cygpO1xuXG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5vbihcImFjY291bnREYXRhXCIsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5vbihcInN5bmNcIiwgdGhpcy5vblN5bmMpO1xuICAgICAgICAvLyBDYWxsIGBvblN5bmNgIHdpdGggdGhlIGN1cnJlbnQgc3RhdGUgYXMgd2VsbFxuICAgICAgICB0aGlzLm9uU3luYyhcbiAgICAgICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5nZXRTeW5jU3RhdGUoKSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0U3luY1N0YXRlRGF0YSgpLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQub24oXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMub25Sb29tU3RhdGVFdmVudHMpO1xuXG4gICAgICAgIHRoaXMuY29tcGFjdExheW91dFdhdGNoZXJSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcbiAgICAgICAgICAgIFwidXNlQ29tcGFjdExheW91dFwiLCBudWxsLCB0aGlzLm9uQ29tcGFjdExheW91dENoYW5nZWQsXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5yZXNpemVyID0gdGhpcy5fY3JlYXRlUmVzaXplcigpO1xuICAgICAgICB0aGlzLnJlc2l6ZXIuYXR0YWNoKCk7XG4gICAgICAgIHRoaXMuX2xvYWRSZXNpemVyUHJlZmVyZW5jZXMoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uTmF0aXZlS2V5RG93biwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJhY2NvdW50RGF0YVwiLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJzeW5jXCIsIHRoaXMub25TeW5jKTtcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLmNvbXBhY3RMYXlvdXRXYXRjaGVyUmVmKTtcbiAgICAgICAgdGhpcy5yZXNpemVyLmRldGFjaCgpO1xuICAgIH1cblxuICAgIC8vIENoaWxkIGNvbXBvbmVudHMgYXNzdW1lIHRoYXQgdGhlIGNsaWVudCBwZWcgd2lsbCBub3QgYmUgbnVsbCwgc28gZ2l2ZSB0aGVtIHNvbWVcbiAgICAvLyBzb3J0IG9mIGFzc3VyYW5jZSBoZXJlIGJ5IG9ubHkgYWxsb3dpbmcgYSByZS1yZW5kZXIgaWYgdGhlIGNsaWVudCBpcyB0cnV0aHkuXG4gICAgLy9cbiAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIGJlY2F1c2UgYExvZ2dlZEluVmlld2AgbWFpbnRhaW5zIGl0cyBvd24gc3RhdGUgYW5kIGlmIHRoaXMgc3RhdGVcbiAgICAvLyB1cGRhdGVzIGFmdGVyIHRoZSBjbGllbnQgcGVnIGhhcyBiZWVuIG1hZGUgbnVsbCAoZHVyaW5nIGxvZ291dCksIHRoZW4gaXQgd2lsbFxuICAgIC8vIGF0dGVtcHQgdG8gcmUtcmVuZGVyIGFuZCB0aGUgY2hpbGRyZW4gd2lsbCB0aHJvdyBlcnJvcnMuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKCkge1xuICAgICAgICByZXR1cm4gQm9vbGVhbihNYXRyaXhDbGllbnRQZWcuZ2V0KCkpO1xuICAgIH1cblxuICAgIGNhblJlc2V0VGltZWxpbmVJblJvb20gPSAocm9vbUlkKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fcm9vbVZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb21WaWV3LmN1cnJlbnQuY2FuUmVzZXRUaW1lbGluZSgpO1xuICAgIH07XG5cbiAgICBfY3JlYXRlUmVzaXplcigpIHtcbiAgICAgICAgbGV0IHNpemU7XG4gICAgICAgIGxldCBjb2xsYXBzZWQ7XG4gICAgICAgIGNvbnN0IGNvbGxhcHNlQ29uZmlnOiBJQ29sbGFwc2VDb25maWcgPSB7XG4gICAgICAgICAgICAvLyBUT0RPIGRlY3JlYXNlIHRoaXMgb25jZSBTcGFjZXMgbGF1bmNoZXMgYXMgaXQnbGwgbm8gbG9uZ2VyIG5lZWQgdG8gaW5jbHVkZSB0aGUgNTZweCBDb21tdW5pdHkgUGFuZWxcbiAgICAgICAgICAgIHRvZ2dsZVNpemU6IDIwNiAtIDUwLFxuICAgICAgICAgICAgb25Db2xsYXBzZWQ6IChfY29sbGFwc2VkKSA9PiB7XG4gICAgICAgICAgICAgICAgY29sbGFwc2VkID0gX2NvbGxhcHNlZDtcbiAgICAgICAgICAgICAgICBpZiAoX2NvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJoaWRlX2xlZnRfcGFuZWxcIn0pO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9saHNfc2l6ZVwiLCAnMCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBcInNob3dfbGVmdF9wYW5lbFwifSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVzaXplZDogKF9zaXplKSA9PiB7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IF9zaXplO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIubm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlc2l6ZVN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5zdGFydFJlc2l6aW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZXNpemVTdG9wOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb2xsYXBzZWQpIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2xoc19zaXplXCIsICcnICsgc2l6ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5zdG9wUmVzaXppbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc0l0ZW1Db2xsYXBzZWQ6IGRvbU5vZGUgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb21Ob2RlLmNsYXNzTGlzdC5jb250YWlucyhcIm14X0xlZnRQYW5lbF9taW5pbWl6ZWRcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXNpemVyID0gbmV3IFJlc2l6ZXIodGhpcy5fcmVzaXplQ29udGFpbmVyLmN1cnJlbnQsIENvbGxhcHNlRGlzdHJpYnV0b3IsIGNvbGxhcHNlQ29uZmlnKTtcbiAgICAgICAgcmVzaXplci5zZXRDbGFzc05hbWVzKHtcbiAgICAgICAgICAgIGhhbmRsZTogXCJteF9SZXNpemVIYW5kbGVcIixcbiAgICAgICAgICAgIHZlcnRpY2FsOiBcIm14X1Jlc2l6ZUhhbmRsZV92ZXJ0aWNhbFwiLFxuICAgICAgICAgICAgcmV2ZXJzZTogXCJteF9SZXNpemVIYW5kbGVfcmV2ZXJzZVwiLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc2l6ZXI7XG4gICAgfVxuXG4gICAgX2xvYWRSZXNpemVyUHJlZmVyZW5jZXMoKSB7XG4gICAgICAgIGxldCBsaHNTaXplID0gcGFyc2VJbnQod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfbGhzX3NpemVcIiksIDEwKTtcbiAgICAgICAgaWYgKGlzTmFOKGxoc1NpemUpKSB7XG4gICAgICAgICAgICBsaHNTaXplID0gMzUwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzaXplci5mb3JIYW5kbGVBdCgwKS5yZXNpemUobGhzU2l6ZSk7XG4gICAgfVxuXG4gICAgb25BY2NvdW50RGF0YSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZ2V0VHlwZSgpID09PSBcIm0uaWdub3JlZF91c2VyX2xpc3RcIikge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwiaWdub3JlX3N0YXRlX2NoYW5nZWRcIn0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uQ29tcGFjdExheW91dENoYW5nZWQgPSAoc2V0dGluZywgcm9vbUlkLCBsZXZlbCwgdmFsdWVBdExldmVsLCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVzZUNvbXBhY3RMYXlvdXQ6IHZhbHVlQXRMZXZlbCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uU3luYyA9IChzeW5jU3RhdGUsIG9sZFN5bmNTdGF0ZSwgZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBvbGRFcnJDb2RlID0gKFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zeW5jRXJyb3JEYXRhICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnN5bmNFcnJvckRhdGEuZXJyb3IgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuc3luY0Vycm9yRGF0YS5lcnJvci5lcnJjb2RlXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IG5ld0VyckNvZGUgPSBkYXRhICYmIGRhdGEuZXJyb3IgJiYgZGF0YS5lcnJvci5lcnJjb2RlO1xuICAgICAgICBpZiAoc3luY1N0YXRlID09PSBvbGRTeW5jU3RhdGUgJiYgb2xkRXJyQ29kZSA9PT0gbmV3RXJyQ29kZSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChzeW5jU3RhdGUgPT09ICdFUlJPUicpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHN5bmNFcnJvckRhdGE6IGRhdGEsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHN5bmNFcnJvckRhdGE6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvbGRTeW5jU3RhdGUgPT09ICdQUkVQQVJFRCcgJiYgc3luY1N0YXRlID09PSAnU1lOQ0lORycpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlck5vdGljZUV2ZW50cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY2FsY3VsYXRlU2VydmVyTGltaXRUb2FzdCh0aGlzLnN0YXRlLnN5bmNFcnJvckRhdGEsIHRoaXMuc3RhdGUudXNhZ2VMaW1pdEV2ZW50Q29udGVudCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25Sb29tU3RhdGVFdmVudHMgPSAoZXYsIHN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlcnZlck5vdGljZUxpc3QgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuU2VydmVyTm90aWNlXTtcbiAgICAgICAgaWYgKHNlcnZlck5vdGljZUxpc3QgJiYgc2VydmVyTm90aWNlTGlzdC5zb21lKHIgPT4gci5yb29tSWQgPT09IGV2LmdldFJvb21JZCgpKSkge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2VydmVyTm90aWNlRXZlbnRzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzYWdlTGltaXREaXNtaXNzZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXNhZ2VMaW1pdERpc21pc3NlZDogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2NhbGN1bGF0ZVNlcnZlckxpbWl0VG9hc3Qoc3luY0Vycm9yOiBJU3RhdGVbXCJzeW5jRXJyb3JEYXRhXCJdLCB1c2FnZUxpbWl0RXZlbnRDb250ZW50PzogSVVzYWdlTGltaXQpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBzeW5jRXJyb3IgJiYgc3luY0Vycm9yLmVycm9yICYmIHN5bmNFcnJvci5lcnJvci5lcnJjb2RlID09PSBcIk1fUkVTT1VSQ0VfTElNSVRfRVhDRUVERURcIjtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICB1c2FnZUxpbWl0RXZlbnRDb250ZW50ID0gc3luY0Vycm9yLmVycm9yLmRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1c2FnZUxpbWl0RGlzbWlzc2VkIGlzIHRydWUgd2hlbiB0aGUgdXNlciBoYXMgZXhwbGljaXRseSBoaWRkZW4gdGhlIHRvYXN0XG4gICAgICAgIC8vIGFuZCBpdCB3aWxsIGJlIHJlc2V0IHRvIGZhbHNlIGlmIGEgKm5ldyogdXNhZ2UgYWxlcnQgY29tZXMgaW4uXG4gICAgICAgIGlmICh1c2FnZUxpbWl0RXZlbnRDb250ZW50ICYmIHRoaXMuc3RhdGUudXNhZ2VMaW1pdERpc21pc3NlZCkge1xuICAgICAgICAgICAgc2hvd1NlcnZlckxpbWl0VG9hc3QoXG4gICAgICAgICAgICAgICAgdXNhZ2VMaW1pdEV2ZW50Q29udGVudC5saW1pdF90eXBlLFxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2FnZUxpbWl0RGlzbWlzc2VkLFxuICAgICAgICAgICAgICAgIHVzYWdlTGltaXRFdmVudENvbnRlbnQuYWRtaW5fY29udGFjdCxcbiAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaWRlU2VydmVyTGltaXRUb2FzdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3VwZGF0ZVNlcnZlck5vdGljZUV2ZW50cyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyTm90aWNlTGlzdCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzW0RlZmF1bHRUYWdJRC5TZXJ2ZXJOb3RpY2VdO1xuICAgICAgICBpZiAoIXNlcnZlck5vdGljZUxpc3QpIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCBldmVudHMgPSBbXTtcbiAgICAgICAgbGV0IHBpbm5lZEV2ZW50VHMgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHJvb20gb2Ygc2VydmVyTm90aWNlTGlzdCkge1xuICAgICAgICAgICAgY29uc3QgcGluU3RhdGVFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBpbm5lZF9ldmVudHNcIiwgXCJcIik7XG5cbiAgICAgICAgICAgIGlmICghcGluU3RhdGVFdmVudCB8fCAhcGluU3RhdGVFdmVudC5nZXRDb250ZW50KCkucGlubmVkKSBjb250aW51ZTtcbiAgICAgICAgICAgIHBpbm5lZEV2ZW50VHMgPSBwaW5TdGF0ZUV2ZW50LmdldFRzKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBpbm5lZEV2ZW50SWRzID0gcGluU3RhdGVFdmVudC5nZXRDb250ZW50KCkucGlubmVkLnNsaWNlKDAsIE1BWF9QSU5ORURfTk9USUNFU19QRVJfUk9PTSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV2ZW50SWQgb2YgcGlubmVkRXZlbnRJZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lbGluZSA9IGF3YWl0IHRoaXMuX21hdHJpeENsaWVudC5nZXRFdmVudFRpbWVsaW5lKHJvb20uZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0KCksIGV2ZW50SWQsIDApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gdGltZWxpbmUuZ2V0RXZlbnRzKCkuZmluZChldiA9PiBldi5nZXRJZCgpID09PSBldmVudElkKTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQpIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5uZWRFdmVudFRzICYmIHRoaXMuc3RhdGUudXNhZ2VMaW1pdEV2ZW50VHMgPiBwaW5uZWRFdmVudFRzKSB7XG4gICAgICAgICAgICAvLyBXZSd2ZSBwcm9jZXNzZWQgYSBuZXdlciBldmVudCB0aGFuIHRoaXMgb25lLCBzbyBpZ25vcmUgaXQuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1c2FnZUxpbWl0RXZlbnQgPSBldmVudHMuZmluZCgoZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBlICYmIGUuZ2V0VHlwZSgpID09PSAnbS5yb29tLm1lc3NhZ2UnICYmXG4gICAgICAgICAgICAgICAgZS5nZXRDb250ZW50KClbJ3NlcnZlcl9ub3RpY2VfdHlwZSddID09PSAnbS5zZXJ2ZXJfbm90aWNlLnVzYWdlX2xpbWl0X3JlYWNoZWQnXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdXNhZ2VMaW1pdEV2ZW50Q29udGVudCA9IHVzYWdlTGltaXRFdmVudCAmJiB1c2FnZUxpbWl0RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICB0aGlzLl9jYWxjdWxhdGVTZXJ2ZXJMaW1pdFRvYXN0KHRoaXMuc3RhdGUuc3luY0Vycm9yRGF0YSwgdXNhZ2VMaW1pdEV2ZW50Q29udGVudCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXNhZ2VMaW1pdEV2ZW50Q29udGVudCxcbiAgICAgICAgICAgIHVzYWdlTGltaXRFdmVudFRzOiBwaW5uZWRFdmVudFRzLFxuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIGZyZXNoIHRvYXN0LCB3ZSBjYW4gc2hvdyB0b2FzdHMgYWdhaW5cbiAgICAgICAgICAgIHVzYWdlTGltaXREaXNtaXNzZWQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUGFzdGUgPSAoZXYpID0+IHtcbiAgICAgICAgbGV0IGNhblJlY2VpdmVJbnB1dCA9IGZhbHNlO1xuICAgICAgICBsZXQgZWxlbWVudCA9IGV2LnRhcmdldDtcbiAgICAgICAgLy8gdGVzdCBmb3IgYWxsIHBhcmVudHMgYmVjYXVzZSB0aGUgdGFyZ2V0IGNhbiBiZSBhIGNoaWxkIG9mIGEgY29udGVudGVkaXRhYmxlIGVsZW1lbnRcbiAgICAgICAgd2hpbGUgKCFjYW5SZWNlaXZlSW5wdXQgJiYgZWxlbWVudCkge1xuICAgICAgICAgICAgY2FuUmVjZWl2ZUlucHV0ID0gY2FuRWxlbWVudFJlY2VpdmVJbnB1dChlbGVtZW50KTtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjYW5SZWNlaXZlSW5wdXQpIHtcbiAgICAgICAgICAgIC8vIHJlZm9jdXNpbmcgZHVyaW5nIGEgcGFzdGUgZXZlbnQgd2lsbCBtYWtlIHRoZVxuICAgICAgICAgICAgLy8gcGFzdGUgZW5kIHVwIGluIHRoZSBuZXdseSBmb2N1c2VkIGVsZW1lbnQsXG4gICAgICAgICAgICAvLyBzbyBkaXNwYXRjaCBzeW5jaHJvbm91c2x5IGJlZm9yZSBwYXN0ZSBoYXBwZW5zXG4gICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3NlciwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLypcbiAgICBTT01FIEhBQ0tFUlkgQkVMT1c6XG4gICAgUmVhY3Qgb3B0aW1pemVzIGV2ZW50IGhhbmRsZXJzLCBieSBhbHdheXMgYXR0YWNoaW5nIG9ubHkgMSBoYW5kbGVyIHRvIHRoZSBkb2N1bWVudCBmb3IgYSBnaXZlbiB0eXBlLlxuICAgIEl0IHRoZW4gaW50ZXJuYWxseSBkZXRlcm1pbmVzIHRoZSBvcmRlciBpbiB3aGljaCBSZWFjdCBldmVudCBoYW5kbGVycyBzaG91bGQgYmUgY2FsbGVkLFxuICAgIGVtdWxhdGluZyB0aGUgY2FwdHVyZSBhbmQgYnViYmxpbmcgcGhhc2VzIHRoZSBET00gYWxzbyBoYXMuXG5cbiAgICBCdXQsIGFzIHRoZSBuYXRpdmUgaGFuZGxlciBmb3IgUmVhY3QgaXMgYWx3YXlzIGF0dGFjaGVkIG9uIHRoZSBkb2N1bWVudCxcbiAgICBpdCB3aWxsIGFsd2F5cyBydW4gbGFzdCBmb3IgYnViYmxpbmcgKGZpcnN0IGZvciBjYXB0dXJpbmcpIGhhbmRsZXJzLFxuICAgIGFuZCB0aHVzIFJlYWN0IGJhc2ljYWxseSBoYXMgaXRzIG93biBldmVudCBwaGFzZXMsIGFuZCB3aWxsIGFsd2F5cyBydW5cbiAgICBhZnRlciAoYmVmb3JlIGZvciBjYXB0dXJpbmcpIGFueSBuYXRpdmUgb3RoZXIgZXZlbnQgaGFuZGxlcnMgKGFzIHRoZXkgdGVuZCB0byBiZSBhdHRhY2hlZCBsYXN0KS5cblxuICAgIFNvIGlkZWFsbHkgb25lIHdvdWxkbid0IG1peCBSZWFjdCBhbmQgbmF0aXZlIGV2ZW50IGhhbmRsZXJzIHRvIGhhdmUgYnViYmxpbmcgd29ya2luZyBhcyBleHBlY3RlZCxcbiAgICBidXQgd2UgZG8gbmVlZCBhIG5hdGl2ZSBldmVudCBoYW5kbGVyIGhlcmUgb24gdGhlIGRvY3VtZW50LFxuICAgIHRvIGdldCBrZXlkb3duIGV2ZW50cyB3aGVuIHRoZXJlIGlzIG5vIGZvY3VzZWQgZWxlbWVudCAodGFyZ2V0PWJvZHkpLlxuXG4gICAgV2UgYWxzbyBkbyBuZWVkIGJ1YmJsaW5nIGhlcmUgdG8gZ2l2ZSBjaGlsZCBjb21wb25lbnRzIGEgY2hhbmNlIHRvIGNhbGwgYHN0b3BQcm9wYWdhdGlvbigpYCxcbiAgICBmb3Iga2V5ZG93biBldmVudHMgaXQgY2FuIGhhbmRsZSBpdHNlbGYsIGFuZCBzaG91bGRuJ3QgYmUgcmVkaXJlY3RlZCB0byB0aGUgY29tcG9zZXIuXG5cbiAgICBTbyB3ZSBsaXN0ZW4gd2l0aCBSZWFjdCBvbiB0aGlzIGNvbXBvbmVudCB0byBnZXQgYW55IGV2ZW50cyBvbiBmb2N1c2VkIGVsZW1lbnRzLCBhbmQgZ2V0IGJ1YmJsaW5nIHdvcmtpbmcgYXMgZXhwZWN0ZWQuXG4gICAgV2UgYWxzbyBsaXN0ZW4gd2l0aCBhIG5hdGl2ZSBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQgdG8gZ2V0IGtleWRvd24gZXZlbnRzIHdoZW4gbm8gZWxlbWVudCBpcyBmb2N1c2VkLlxuICAgIEJ1YmJsaW5nIGlzIGlycmVsZXZhbnQgaGVyZSBhcyB0aGUgdGFyZ2V0IGlzIHRoZSBib2R5IGVsZW1lbnQuXG4gICAgKi9cbiAgICBfb25SZWFjdEtleURvd24gPSAoZXYpID0+IHtcbiAgICAgICAgLy8gZXZlbnRzIGNhdWdodCB3aGlsZSBidWJibGluZyB1cCBvbiB0aGUgcm9vdCBlbGVtZW50XG4gICAgICAgIC8vIG9mIHRoaXMgY29tcG9uZW50LCBzbyBzb21ldGhpbmcgbXVzdCBiZSBmb2N1c2VkLlxuICAgICAgICB0aGlzLl9vbktleURvd24oZXYpO1xuICAgIH07XG5cbiAgICBfb25OYXRpdmVLZXlEb3duID0gKGV2KSA9PiB7XG4gICAgICAgIC8vIG9ubHkgcGFzcyB0aGlzIGlmIHRoZXJlIGlzIG5vIGZvY3VzZWQgZWxlbWVudC5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMsIF9vbktleURvd24gd2lsbCBiZSBjYWxsZWQgYnkgdGhlXG4gICAgICAgIC8vIHJlYWN0IGtleWRvd24gaGFuZGxlciB0aGF0IHJlc3BlY3RzIHRoZSByZWFjdCBidWJibGluZyBvcmRlci5cbiAgICAgICAgaWYgKGV2LnRhcmdldCA9PT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgdGhpcy5fb25LZXlEb3duKGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25LZXlEb3duID0gKGV2KSA9PiB7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3Qgcm9vbUFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldFJvb21BY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKHJvb21BY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgUm9vbUFjdGlvbi5TY3JvbGxVcDpcbiAgICAgICAgICAgIGNhc2UgUm9vbUFjdGlvbi5Sb29tU2Nyb2xsRG93bjpcbiAgICAgICAgICAgIGNhc2UgUm9vbUFjdGlvbi5KdW1wVG9GaXJzdE1lc3NhZ2U6XG4gICAgICAgICAgICBjYXNlIFJvb21BY3Rpb24uSnVtcFRvTGF0ZXN0TWVzc2FnZTpcbiAgICAgICAgICAgICAgICAvLyBwYXNzIHRoZSBldmVudCBkb3duIHRvIHRoZSBzY3JvbGwgcGFuZWxcbiAgICAgICAgICAgICAgICB0aGlzLl9vblNjcm9sbEtleVByZXNzZWQoZXYpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBSb29tQWN0aW9uLkZvY3VzU2VhcmNoOlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2ZvY3VzX3NlYXJjaCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hdkFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldE5hdmlnYXRpb25BY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKG5hdkFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBOYXZpZ2F0aW9uQWN0aW9uLkZvY3VzUm9vbVNlYXJjaDpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdmb2N1c19yb29tX2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5hdmlnYXRpb25BY3Rpb24uVG9nZ2xlVXNlck1lbnU6XG4gICAgICAgICAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlRvZ2dsZVVzZXJNZW51KTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTmF2aWdhdGlvbkFjdGlvbi5Ub2dnbGVTaG9ydEN1dERpYWxvZzpcbiAgICAgICAgICAgICAgICBLZXlib2FyZFNob3J0Y3V0cy50b2dnbGVEaWFsb2coKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTmF2aWdhdGlvbkFjdGlvbi5Hb1RvSG9tZTpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X2hvbWVfcGFnZScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgTW9kYWwuY2xvc2VDdXJyZW50TW9kYWwoXCJob21lS2V5Ym9hcmRTaG9ydGN1dFwiKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTmF2aWdhdGlvbkFjdGlvbi5Ub2dnbGVSb29tU2lkZVBhbmVsOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnBhZ2VfdHlwZSA9PT0gXCJyb29tX3ZpZXdcIiB8fCB0aGlzLnByb3BzLnBhZ2VfdHlwZSA9PT0gXCJncm91cF92aWV3XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFRvZ2dsZVJpZ2h0UGFuZWxQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Ub2dnbGVSaWdodFBhbmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdGhpcy5wcm9wcy5wYWdlX3R5cGUgPT09IFwicm9vbV92aWV3XCIgPyBcInJvb21cIiA6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTmF2aWdhdGlvbkFjdGlvbi5TZWxlY3RQcmV2Um9vbTpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21EZWx0YVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb21EZWx0YSxcbiAgICAgICAgICAgICAgICAgICAgZGVsdGE6IC0xLFxuICAgICAgICAgICAgICAgICAgICB1bnJlYWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOYXZpZ2F0aW9uQWN0aW9uLlNlbGVjdE5leHRSb29tOlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbURlbHRhUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbURlbHRhLFxuICAgICAgICAgICAgICAgICAgICBkZWx0YTogMSxcbiAgICAgICAgICAgICAgICAgICAgdW5yZWFkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTmF2aWdhdGlvbkFjdGlvbi5TZWxlY3RQcmV2VW5yZWFkUm9vbTpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21EZWx0YVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb21EZWx0YSxcbiAgICAgICAgICAgICAgICAgICAgZGVsdGE6IC0xLFxuICAgICAgICAgICAgICAgICAgICB1bnJlYWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5hdmlnYXRpb25BY3Rpb24uU2VsZWN0TmV4dFVucmVhZFJvb206XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tRGVsdGFQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tRGVsdGEsXG4gICAgICAgICAgICAgICAgICAgIGRlbHRhOiAxLFxuICAgICAgICAgICAgICAgICAgICB1bnJlYWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGRvIG5vdCBoYXZlIGEgaGFuZGxlciBmb3IgaXQsIHBhc3MgaXQgdG8gdGhlIHBsYXRmb3JtIHdoaWNoIG1pZ2h0XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IFBsYXRmb3JtUGVnLmdldCgpLm9uS2V5RG93bihldik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzTW9kaWZpZXIgPSBldi5rZXkgPT09IEtleS5BTFQgfHwgZXYua2V5ID09PSBLZXkuQ09OVFJPTCB8fCBldi5rZXkgPT09IEtleS5NRVRBIHx8IGV2LmtleSA9PT0gS2V5LlNISUZUO1xuICAgICAgICBpZiAoIWlzTW9kaWZpZXIgJiYgIWV2LmFsdEtleSAmJiAhZXYuY3RybEtleSAmJiAhZXYubWV0YUtleSkge1xuICAgICAgICAgICAgLy8gVGhlIGFib3ZlIGNvbmRpdGlvbiBpcyBjcmFmdGVkIHRvIF9hbGxvd18gY2hhcmFjdGVycyB3aXRoIFNoaWZ0XG4gICAgICAgICAgICAvLyBhbHJlYWR5IHByZXNzZWQgKGJ1dCBub3QgdGhlIFNoaWZ0IGtleSBkb3duIGl0c2VsZikuXG5cbiAgICAgICAgICAgIGNvbnN0IGlzQ2xpY2tTaG9ydGN1dCA9IGV2LnRhcmdldCAhPT0gZG9jdW1lbnQuYm9keSAmJlxuICAgICAgICAgICAgICAgIChldi5rZXkgPT09IEtleS5TUEFDRSB8fCBldi5rZXkgPT09IEtleS5FTlRFUik7XG5cbiAgICAgICAgICAgIC8vIERvIG5vdCBjYXB0dXJlIHRoZSBjb250ZXh0IG1lbnUga2V5IHRvIGltcHJvdmUga2V5Ym9hcmQgYWNjZXNzaWJpbGl0eVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gS2V5LkNPTlRFWFRfTUVOVSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFpc0NsaWNrU2hvcnRjdXQgJiYgZXYua2V5ICE9PSBLZXkuVEFCICYmICFjYW5FbGVtZW50UmVjZWl2ZUlucHV0KGV2LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAvLyBzeW5jaHJvbm91cyBkaXNwYXRjaCBzbyB3ZSBmb2N1cyBiZWZvcmUga2V5IGdlbmVyYXRlcyBpbnB1dFxuICAgICAgICAgICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAvLyB3ZSBzaG91bGQgKm5vdCogcHJldmVudERlZmF1bHQoKSBoZXJlIGFzXG4gICAgICAgICAgICAgICAgLy8gdGhhdCB3b3VsZCBwcmV2ZW50IHR5cGluZyBpbiB0aGUgbm93LWZvY3Vzc2VkIGNvbXBvc2VyXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogZGlzcGF0Y2ggYSBwYWdlLXVwL3BhZ2UtZG93bi9ldGMgdG8gdGhlIGFwcHJvcHJpYXRlIGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldiBUaGUga2V5IGV2ZW50XG4gICAgICovXG4gICAgX29uU2Nyb2xsS2V5UHJlc3NlZCA9IChldikgPT4ge1xuICAgICAgICBpZiAodGhpcy5fcm9vbVZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vbVZpZXcuY3VycmVudC5oYW5kbGVTY3JvbGxLZXkoZXYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vbkRyYWdFbmQgPSAocmVzdWx0KSA9PiB7XG4gICAgICAgIC8vIERyYWdnZWQgdG8gYW4gaW52YWxpZCBkZXN0aW5hdGlvbiwgbm90IG9udG8gYSBkcm9wcGFibGVcbiAgICAgICAgaWYgKCFyZXN1bHQuZGVzdGluYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlc3QgPSByZXN1bHQuZGVzdGluYXRpb24uZHJvcHBhYmxlSWQ7XG5cbiAgICAgICAgaWYgKGRlc3QgPT09ICd0YWctcGFuZWwtZHJvcHBhYmxlJykge1xuICAgICAgICAgICAgLy8gQ291bGQgYmUgXCJHcm91cFRpbGUgK2dyb3VwSWQ6ZG9tYWluXCJcbiAgICAgICAgICAgIGNvbnN0IGRyYWdnYWJsZUlkID0gcmVzdWx0LmRyYWdnYWJsZUlkLnNwbGl0KCcgJykucG9wKCk7XG5cbiAgICAgICAgICAgIC8vIERpc3BhdGNoIHN5bmNocm9ub3VzbHkgc28gdGhhdCB0aGUgR3JvdXBGaWx0ZXJQYW5lbCByZWNlaXZlcyBhblxuICAgICAgICAgICAgLy8gb3B0aW1pc3RpYyB1cGRhdGUgZnJvbSBHcm91cEZpbHRlck9yZGVyU3RvcmUgYmVmb3JlIHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgLy8gc3RhdGUgaXMgc2hvd24uXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goVGFnT3JkZXJBY3Rpb25zLm1vdmVUYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZUlkLFxuICAgICAgICAgICAgICAgIHJlc3VsdC5kZXN0aW5hdGlvbi5pbmRleCxcbiAgICAgICAgICAgICksIHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGRlc3Quc3RhcnRzV2l0aCgncm9vbS1zdWItbGlzdC1kcm9wcGFibGVfJykpIHtcbiAgICAgICAgICAgIHRoaXMuX29uUm9vbVRpbGVFbmREcmFnKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uUm9vbVRpbGVFbmREcmFnID0gKHJlc3VsdCkgPT4ge1xuICAgICAgICBsZXQgbmV3VGFnID0gcmVzdWx0LmRlc3RpbmF0aW9uLmRyb3BwYWJsZUlkLnNwbGl0KCdfJylbMV07XG4gICAgICAgIGxldCBwcmV2VGFnID0gcmVzdWx0LnNvdXJjZS5kcm9wcGFibGVJZC5zcGxpdCgnXycpWzFdO1xuICAgICAgICBpZiAobmV3VGFnID09PSAndW5kZWZpbmVkJykgbmV3VGFnID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAocHJldlRhZyA9PT0gJ3VuZGVmaW5lZCcpIHByZXZUYWcgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3Qgcm9vbUlkID0gcmVzdWx0LmRyYWdnYWJsZUlkLnNwbGl0KCdfJylbMV07XG5cbiAgICAgICAgY29uc3Qgb2xkSW5kZXggPSByZXN1bHQuc291cmNlLmluZGV4O1xuICAgICAgICBjb25zdCBuZXdJbmRleCA9IHJlc3VsdC5kZXN0aW5hdGlvbi5pbmRleDtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goUm9vbUxpc3RBY3Rpb25zLnRhZ1Jvb20oXG4gICAgICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQsXG4gICAgICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpLFxuICAgICAgICAgICAgcHJldlRhZywgbmV3VGFnLFxuICAgICAgICAgICAgb2xkSW5kZXgsIG5ld0luZGV4LFxuICAgICAgICApLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBSb29tVmlldyA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuUm9vbVZpZXcnKTtcbiAgICAgICAgY29uc3QgVXNlclZpZXcgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLlVzZXJWaWV3Jyk7XG4gICAgICAgIGNvbnN0IEdyb3VwVmlldyA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuR3JvdXBWaWV3Jyk7XG4gICAgICAgIGNvbnN0IE15R3JvdXBzID0gc2RrLmdldENvbXBvbmVudCgnc3RydWN0dXJlcy5NeUdyb3VwcycpO1xuICAgICAgICBjb25zdCBUb2FzdENvbnRhaW5lciA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuVG9hc3RDb250YWluZXInKTtcblxuICAgICAgICBsZXQgcGFnZUVsZW1lbnQ7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnByb3BzLnBhZ2VfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuUm9vbVZpZXc6XG4gICAgICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSA8Um9vbVZpZXdcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9yb29tVmlld31cbiAgICAgICAgICAgICAgICAgICAgb25SZWdpc3RlcmVkPXt0aGlzLnByb3BzLm9uUmVnaXN0ZXJlZH1cbiAgICAgICAgICAgICAgICAgICAgdGhyZWVwaWRJbnZpdGU9e3RoaXMucHJvcHMudGhyZWVwaWRJbnZpdGV9XG4gICAgICAgICAgICAgICAgICAgIG9vYkRhdGE9e3RoaXMucHJvcHMucm9vbU9vYkRhdGF9XG4gICAgICAgICAgICAgICAgICAgIGtleT17dGhpcy5wcm9wcy5jdXJyZW50Um9vbUlkIHx8ICdyb29tdmlldyd9XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICBqdXN0Q3JlYXRlZE9wdHM9e3RoaXMucHJvcHMucm9vbUp1c3RDcmVhdGVkT3B0c31cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuTXlHcm91cHM6XG4gICAgICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSA8TXlHcm91cHMgLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUGFnZVR5cGVzLlJvb21EaXJlY3Rvcnk6XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlZCBieSBNYXRyaXhDaGF0IGZvciBub3dcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuSG9tZVBhZ2U6XG4gICAgICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSA8SG9tZVBhZ2UganVzdFJlZ2lzdGVyZWQ9e3RoaXMucHJvcHMuanVzdFJlZ2lzdGVyZWR9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFBhZ2VUeXBlcy5Vc2VyVmlldzpcbiAgICAgICAgICAgICAgICBwYWdlRWxlbWVudCA9IDxVc2VyVmlldyB1c2VySWQ9e3RoaXMucHJvcHMuY3VycmVudFVzZXJJZH0gcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuR3JvdXBWaWV3OlxuICAgICAgICAgICAgICAgIHBhZ2VFbGVtZW50ID0gPEdyb3VwVmlld1xuICAgICAgICAgICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmN1cnJlbnRHcm91cElkfVxuICAgICAgICAgICAgICAgICAgICBpc05ldz17dGhpcy5wcm9wcy5jdXJyZW50R3JvdXBJc05ld31cbiAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYm9keUNsYXNzZXMgPSAnbXhfTWF0cml4Q2hhdCc7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnVzZUNvbXBhY3RMYXlvdXQpIHtcbiAgICAgICAgICAgIGJvZHlDbGFzc2VzICs9ICcgbXhfTWF0cml4Q2hhdF91c2VDb21wYWN0TGF5b3V0JztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8TWF0cml4Q2xpZW50Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17dGhpcy5fbWF0cml4Q2xpZW50fT5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIG9uUGFzdGU9e3RoaXMuX29uUGFzdGV9XG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5fb25SZWFjdEtleURvd259XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfTWF0cml4Q2hhdF93cmFwcGVyJ1xuICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj17dGhpcy5wcm9wcy5oaWRlVG9TUlVzZXJzfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFRvYXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgICAgIDxEcmFnRHJvcENvbnRleHQgb25EcmFnRW5kPXt0aGlzLl9vbkRyYWdFbmR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiByZWY9e3RoaXMuX3Jlc2l6ZUNvbnRhaW5lcn0gY2xhc3NOYW1lPXtib2R5Q2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9zcGFjZXNcIikgPyA8U3BhY2VQYW5lbCAvPiA6IG51bGwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMZWZ0UGFuZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuY29sbGFwc2VMaHMgfHwgZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJlc2l6ZUhhbmRsZSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcGFnZUVsZW1lbnQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvRHJhZ0Ryb3BDb250ZXh0PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxDYWxsQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPE5vblVyZ2VudFRvYXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEhvc3RTaWdudXBDb250YWluZXIgLz5cbiAgICAgICAgICAgIDwvTWF0cml4Q2xpZW50Q29udGV4dC5Qcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvZ2dlZEluVmlldztcbiJdfQ==