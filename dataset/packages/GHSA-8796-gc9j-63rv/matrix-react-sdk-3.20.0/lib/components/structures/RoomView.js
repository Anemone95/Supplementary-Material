"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _shouldHideEvent = _interopRequireDefault(require("../../shouldHideEvent"));

var _languageHandler = require("../../languageHandler");

var _Permalinks = require("../../utils/permalinks/Permalinks");

var _ContentMessages = _interopRequireDefault(require("../../ContentMessages"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var sdk = _interopRequireWildcard(require("../../index"));

var _CallHandler = _interopRequireDefault(require("../../CallHandler"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _Tinter = _interopRequireDefault(require("../../Tinter"));

var _ratelimitedfunc = _interopRequireDefault(require("../../ratelimitedfunc"));

var Rooms = _interopRequireWildcard(require("../../Rooms"));

var _Searching = _interopRequireWildcard(require("../../Searching"));

var _MainSplit = _interopRequireDefault(require("./MainSplit"));

var _RightPanel = _interopRequireDefault(require("./RightPanel"));

var _RoomViewStore = _interopRequireDefault(require("../../stores/RoomViewStore"));

var _RoomScrollStateStore = _interopRequireDefault(require("../../stores/RoomScrollStateStore"));

var _WidgetEchoStore = _interopRequireDefault(require("../../stores/WidgetEchoStore"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _Layout = require("../../settings/Layout");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _RightPanelStore = _interopRequireDefault(require("../../stores/RightPanelStore"));

var _EventTile = require("../views/rooms/EventTile");

var _RoomContext = _interopRequireDefault(require("../../contexts/RoomContext"));

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _ShieldUtils = require("../../utils/ShieldUtils");

var _actions = require("../../dispatcher/actions");

var _SettingLevel = require("../../settings/SettingLevel");

var _ScrollPanel = _interopRequireDefault(require("./ScrollPanel"));

var _TimelinePanel = _interopRequireDefault(require("./TimelinePanel"));

var _ErrorBoundary = _interopRequireDefault(require("../views/elements/ErrorBoundary"));

var _RoomPreviewBar = _interopRequireDefault(require("../views/rooms/RoomPreviewBar"));

var _ForwardMessage = _interopRequireDefault(require("../views/rooms/ForwardMessage"));

var _SearchBar = _interopRequireDefault(require("../views/rooms/SearchBar"));

var _RoomUpgradeWarningBar = _interopRequireDefault(require("../views/rooms/RoomUpgradeWarningBar"));

var _PinnedEventsPanel = _interopRequireDefault(require("../views/rooms/PinnedEventsPanel"));

var _AuxPanel = _interopRequireDefault(require("../views/rooms/AuxPanel"));

var _RoomHeader = _interopRequireDefault(require("../views/rooms/RoomHeader"));

var _EffectsOverlay = _interopRequireDefault(require("../views/elements/EffectsOverlay"));

var _utils = require("../../effects/utils");

var _effects = require("../../effects");

var _WidgetStore = _interopRequireDefault(require("../../stores/WidgetStore"));

var _AsyncStore = require("../../stores/AsyncStore");

var _Notifier = _interopRequireDefault(require("../../Notifier"));

var _DesktopNotificationsToast = require("../../toasts/DesktopNotificationsToast");

var _RoomNotificationStateStore = require("../../stores/notifications/RoomNotificationStateStore");

var _WidgetLayoutStore = require("../../stores/widgets/WidgetLayoutStore");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _objects = require("../../utils/objects");

var _SpaceRoomView = _interopRequireDefault(require("./SpaceRoomView"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

const DEBUG = false;

let debuglog = function (msg
/*: string*/
) {};

const BROWSER_SUPPORTS_SANDBOX = ('sandbox' in document.createElement('iframe'));

if (DEBUG) {
  // using bind means that we get to keep useful line numbers in the console
  debuglog = console.log.bind(console);
}
/*:: export interface IState {
    room?: Room;
    roomId?: string;
    roomAlias?: string;
    roomLoading: boolean;
    peekLoading: boolean;
    shouldPeek: boolean;
    // used to trigger a rerender in TimelinePanel once the members are loaded,
    // so RR are rendered again (now with the members available), ...
    membersLoaded: boolean;
    // The event to be scrolled to initially
    initialEventId?: string;
    // The offset in pixels from the event with which to scroll vertically
    initialEventPixelOffset?: number;
    // Whether to highlight the event scrolled to
    isInitialEventHighlighted?: boolean;
    replyToEvent?: MatrixEvent;
    forwardingEvent?: MatrixEvent;
    numUnreadMessages: number;
    draggingFile: boolean;
    searching: boolean;
    searchTerm?: string;
    searchScope?: "All" | "Room";
    searchResults?: XOR<{}, {
        count: number;
        highlights: string[];
        results: MatrixEvent[];
        next_batch: string; // eslint-disable-line camelcase
    }>;
    searchHighlights?: string[];
    searchInProgress?: boolean;
    callState?: CallState;
    guestsCanJoin: boolean;
    canPeek: boolean;
    showApps: boolean;
    isPeeking: boolean;
    showingPinned: boolean;
    showReadReceipts: boolean;
    showRightPanel: boolean;
    // error object, as from the matrix client/server API
    // If we failed to load information about the room,
    // store the error here.
    roomLoadError?: Error;
    // Have we sent a request to join the room that we're waiting to complete?
    joining: boolean;
    // this is true if we are fully scrolled-down, and are looking at
    // the end of the live timeline. It has the effect of hiding the
    // 'scroll to bottom' knob, among a couple of other things.
    atEndOfLiveTimeline: boolean;
    // used by componentDidUpdate to avoid unnecessary checks
    atEndOfLiveTimelineInit: boolean;
    showTopUnreadMessagesBar: boolean;
    auxPanelMaxHeight?: number;
    statusBarVisible: boolean;
    // We load this later by asking the js-sdk to suggest a version for us.
    // This object is the result of Room#getRecommendedVersion()
    upgradeRecommendation?: {
        version: string;
        needsUpgrade: boolean;
        urgent: boolean;
    };
    canReact: boolean;
    canReply: boolean;
    layout: Layout;
    matrixClientIsReady: boolean;
    showUrlPreview?: boolean;
    e2eStatus?: E2EStatus;
    rejecting?: boolean;
    rejectError?: Error;
    hasPinnedWidgets?: boolean;
    dragCounter: number;
    // whether or not a spaces context switch brought us here,
    // if it did we don't want the room to be marked as read as soon as it is loaded.
    wasContextSwitch?: boolean;
}*/


let RoomView = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.RoomView"), _dec(_class = (_temp = _class2 = class RoomView extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "roomStoreToken", void 0);
    (0, _defineProperty2.default)(this, "rightPanelStoreToken", void 0);
    (0, _defineProperty2.default)(this, "showReadReceiptsWatchRef", void 0);
    (0, _defineProperty2.default)(this, "layoutWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "permalinkCreators", {});
    (0, _defineProperty2.default)(this, "searchId", void 0);
    (0, _defineProperty2.default)(this, "roomView", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "searchResultsPanel", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "messagePanel", void 0);
    (0, _defineProperty2.default)(this, "onWidgetStoreUpdate", () => {
      if (this.state.room) {
        this.checkWidgets(this.state.room);
      }
    });
    (0, _defineProperty2.default)(this, "checkWidgets", room => {
      this.setState({
        hasPinnedWidgets: _WidgetLayoutStore.WidgetLayoutStore.instance.getContainerWidgets(room, _WidgetLayoutStore.Container.Top).length > 0,
        showApps: this.shouldShowApps(room)
      });
    });
    (0, _defineProperty2.default)(this, "onReadReceiptsChange", () => {
      this.setState({
        showReadReceipts: _SettingsStore.default.getValue("showReadReceipts", this.state.roomId)
      });
    });
    (0, _defineProperty2.default)(this, "onRoomViewStoreUpdate", (initial
    /*: boolean*/
    ) => {
      if (this.unmounted) {
        return;
      }

      if (!initial && this.state.roomId !== _RoomViewStore.default.getRoomId()) {
        // RoomView explicitly does not support changing what room
        // is being viewed: instead it should just be re-mounted when
        // switching rooms. Therefore, if the room ID changes, we
        // ignore this. We either need to do this or add code to handle
        // saving the scroll position (otherwise we end up saving the
        // scroll position against the wrong room).
        // Given that doing the setState here would cause a bunch of
        // unnecessary work, we just ignore the change since we know
        // that if the current room ID has changed from what we thought
        // it was, it means we're about to be unmounted.
        return;
      }

      const roomId = _RoomViewStore.default.getRoomId();

      const newState
      /*: Pick<IState, any>*/
      = {
        roomId,
        roomAlias: _RoomViewStore.default.getRoomAlias(),
        roomLoading: _RoomViewStore.default.isRoomLoading(),
        roomLoadError: _RoomViewStore.default.getRoomLoadError(),
        joining: _RoomViewStore.default.isJoining(),
        initialEventId: _RoomViewStore.default.getInitialEventId(),
        isInitialEventHighlighted: _RoomViewStore.default.isInitialEventHighlighted(),
        replyToEvent: _RoomViewStore.default.getQuotingEvent(),
        forwardingEvent: _RoomViewStore.default.getForwardingEvent(),
        // we should only peek once we have a ready client
        shouldPeek: this.state.matrixClientIsReady && _RoomViewStore.default.shouldPeek(),
        showingPinned: _SettingsStore.default.getValue("PinnedEvents.isOpen", roomId),
        showReadReceipts: _SettingsStore.default.getValue("showReadReceipts", roomId),
        wasContextSwitch: _RoomViewStore.default.getWasContextSwitch()
      };

      if (!initial && this.state.shouldPeek && !newState.shouldPeek) {
        // Stop peeking because we have joined this room now
        this.context.stopPeeking();
      } // Temporary logging to diagnose https://github.com/vector-im/element-web/issues/4307


      console.log('RVS update:', newState.roomId, newState.roomAlias, 'loading?', newState.roomLoading, 'joining?', newState.joining, 'initial?', initial, 'shouldPeek?', newState.shouldPeek); // NB: This does assume that the roomID will not change for the lifetime of
      // the RoomView instance

      if (initial) {
        newState.room = this.context.getRoom(newState.roomId);

        if (newState.room) {
          newState.showApps = this.shouldShowApps(newState.room);
          this.onRoomLoaded(newState.room);
        }
      }

      if (this.state.roomId === null && newState.roomId !== null) {
        // Get the scroll state for the new room
        // If an event ID wasn't specified, default to the one saved for this room
        // in the scroll state store. Assume initialEventPixelOffset should be set.
        if (!newState.initialEventId) {
          const roomScrollState = _RoomScrollStateStore.default.getScrollState(newState.roomId);

          if (roomScrollState) {
            newState.initialEventId = roomScrollState.focussedEvent;
            newState.initialEventPixelOffset = roomScrollState.pixelOffset;
          }
        }
      } // Clear the search results when clicking a search result (which changes the
      // currently scrolled to event, this.state.initialEventId).


      if (this.state.initialEventId !== newState.initialEventId) {
        newState.searchResults = null;
      }

      this.setState(newState); // At this point, newState.roomId could be null (e.g. the alias might not
      // have been resolved yet) so anything called here must handle this case.
      // We pass the new state into this function for it to read: it needs to
      // observe the new state but we don't want to put it in the setState
      // callback because this would prevent the setStates from being batched,
      // ie. cause it to render RoomView twice rather than the once that is necessary.

      if (initial) {
        this.setupRoom(newState.room, newState.roomId, newState.joining, newState.shouldPeek);
      }
    });
    (0, _defineProperty2.default)(this, "getRoomId", () => {
      // According to `onRoomViewStoreUpdate`, `state.roomId` can be null
      // if we have a room alias we haven't resolved yet. To work around this,
      // first we'll try the room object if it's there, and then fallback to
      // the bare room ID. (We may want to update `state.roomId` after
      // resolving aliases, so we could always trust it.)
      return this.state.room ? this.state.room.roomId : this.state.roomId;
    });
    (0, _defineProperty2.default)(this, "onWidgetEchoStoreUpdate", () => {
      if (!this.state.room) return;
      this.setState({
        hasPinnedWidgets: _WidgetLayoutStore.WidgetLayoutStore.instance.getContainerWidgets(this.state.room, _WidgetLayoutStore.Container.Top).length > 0,
        showApps: this.shouldShowApps(this.state.room)
      });
    });
    (0, _defineProperty2.default)(this, "onWidgetLayoutChange", () => {
      this.onWidgetEchoStoreUpdate(); // we cheat here by calling the thing that matters
    });
    (0, _defineProperty2.default)(this, "onLayoutChange", () => {
      this.setState({
        layout: _SettingsStore.default.getValue("layout")
      });
    });
    (0, _defineProperty2.default)(this, "onRightPanelStoreUpdate", () => {
      this.setState({
        showRightPanel: _RightPanelStore.default.getSharedInstance().isOpenForRoom
      });
    });
    (0, _defineProperty2.default)(this, "onPageUnload", event => {
      if (_ContentMessages.default.sharedInstance().getCurrentUploads().length > 0) {
        return event.returnValue = (0, _languageHandler._t)("You seem to be uploading files, are you sure you want to quit?");
      } else if (this.getCallForRoom() && this.state.callState !== 'ended') {
        return event.returnValue = (0, _languageHandler._t)("You seem to be in a call, are you sure you want to quit?");
      }
    });
    (0, _defineProperty2.default)(this, "onReactKeyDown", ev => {
      let handled = false;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      switch (action) {
        case _KeyBindingsManager.RoomAction.DismissReadMarker:
          this.messagePanel.forgetReadMarker();
          this.jumpToLiveTimeline();
          handled = true;
          break;

        case _KeyBindingsManager.RoomAction.JumpToOldestUnread:
          this.jumpToReadMarker();
          handled = true;
          break;

        case _KeyBindingsManager.RoomAction.UploadFile:
          _dispatcher.default.dispatch({
            action: "upload_file"
          }, true);

          handled = true;
          break;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'message_sent':
          this.checkDesktopNotifications();
          break;

        case 'post_sticker_message':
          this.injectSticker(payload.data.content.url, payload.data.content.info, payload.data.description || payload.data.name);
          break;

        case 'picture_snapshot':
          _ContentMessages.default.sharedInstance().sendContentListToRoom([payload.file], this.state.room.roomId, this.context);

          break;

        case 'notifier_enabled':
        case _actions.Action.UploadStarted:
        case _actions.Action.UploadFinished:
        case _actions.Action.UploadCanceled:
          this.forceUpdate();
          break;

        case 'call_state':
          {
            // don't filter out payloads for room IDs other than props.room because
            // we may be interested in the conf 1:1 room
            if (!payload.room_id) {
              return;
            }

            const call = this.getCallForRoom();
            this.setState({
              callState: call ? call.state : null
            });
            break;
          }

        case 'appsDrawer':
          this.setState({
            showApps: payload.show
          });
          break;

        case 'reply_to_event':
          if (this.state.searchResults && payload.event.getRoomId() === this.state.roomId && !this.unmounted) {
            this.onCancelSearchClick();
          }

          break;

        case 'quote':
          if (this.state.searchResults) {
            const roomId = payload.event.getRoomId();

            if (roomId === this.state.roomId) {
              this.onCancelSearchClick();
            }

            setImmediate(() => {
              _dispatcher.default.dispatch({
                action: 'view_room',
                room_id: roomId,
                deferred_action: payload
              });
            });
          }

          break;

        case 'sync_state':
          if (!this.state.matrixClientIsReady) {
            this.setState({
              matrixClientIsReady: this.context && this.context.isInitialSyncComplete()
            }, () => {
              // send another "initial" RVS update to trigger peeking if needed
              this.onRoomViewStoreUpdate(true);
            });
          }

          break;

        case 'focus_search':
          this.onSearchClick();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onRoomTimeline", (ev
    /*: MatrixEvent*/
    , room
    /*: Room*/
    , toStartOfTimeline
    /*: boolean*/
    , removed, data) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (!room) return;
      if (!this.state.room || room.roomId != this.state.room.roomId) return; // ignore events from filtered timelines

      if (data.timeline.getTimelineSet() !== room.getUnfilteredTimelineSet()) return;

      if (ev.getType() === "org.matrix.room.preview_urls") {
        this.updatePreviewUrlVisibility(room);
      }

      if (ev.getType() === "m.room.encryption") {
        this.updateE2EStatus(room);
      } // ignore anything but real-time updates at the end of the room:
      // updates from pagination will happen when the paginate completes.


      if (toStartOfTimeline || !data || !data.liveEvent) return; // no point handling anything while we're waiting for the join to finish:
      // we'll only be showing a spinner.

      if (this.state.joining) return;

      if (ev.getSender() !== this.context.credentials.userId) {
        // update unread count when scrolled up
        if (!this.state.searchResults && this.state.atEndOfLiveTimeline) {// no change
        } else if (!(0, _shouldHideEvent.default)(ev)) {
          this.setState((state, props) => {
            return {
              numUnreadMessages: state.numUnreadMessages + 1
            };
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", ev => {
      if (ev.isDecryptionFailure()) return;
      this.handleEffects(ev);
    });
    (0, _defineProperty2.default)(this, "onEvent", ev => {
      if (ev.isBeingDecrypted() || ev.isDecryptionFailure()) return;
      this.handleEffects(ev);
    });
    (0, _defineProperty2.default)(this, "handleEffects", ev => {
      if (!this.state.room || !this.state.matrixClientIsReady) return; // not ready at all

      if (ev.getRoomId() !== this.state.room.roomId) return; // not for us

      const notifState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(this.state.room);

      if (!notifState.isUnread) return;

      _effects.CHAT_EFFECTS.forEach(effect => {
        if ((0, _utils.containsEmoji)(ev.getContent(), effect.emojis) || ev.getContent().msgtype === effect.msgType) {
          _dispatcher.default.dispatch({
            action: `effects.${effect.command}`
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "onRoomName", (room
    /*: Room*/
    ) => {
      if (this.state.room && room.roomId == this.state.room.roomId) {
        this.forceUpdate();
      }
    });
    (0, _defineProperty2.default)(this, "onKeyBackupStatus", () => {
      // Key backup status changes affect whether the in-room recovery
      // reminder is displayed.
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "canResetTimeline", () => {
      if (!this.messagePanel) {
        return true;
      }

      return this.messagePanel.canResetTimeline();
    });
    (0, _defineProperty2.default)(this, "onRoomLoaded", (room
    /*: Room*/
    ) => {
      // Attach a widget store listener only when we get a room
      _WidgetLayoutStore.WidgetLayoutStore.instance.on(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(room), this.onWidgetLayoutChange);

      this.onWidgetLayoutChange(); // provoke an update

      this.calculatePeekRules(room);
      this.updatePreviewUrlVisibility(room);
      this.loadMembersIfJoined(room);
      this.calculateRecommendedVersion(room);
      this.updateE2EStatus(room);
      this.updatePermissions(room);
      this.checkWidgets(room);
    });
    (0, _defineProperty2.default)(this, "onRoom", (room
    /*: Room*/
    ) => {
      if (!room || room.roomId !== this.state.roomId) {
        return;
      } // Detach the listener if the room is changing for some reason


      if (this.state.room) {
        _WidgetLayoutStore.WidgetLayoutStore.instance.off(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(this.state.room), this.onWidgetLayoutChange);
      }

      this.setState({
        room: room
      }, () => {
        this.onRoomLoaded(room);
      });
    });
    (0, _defineProperty2.default)(this, "onDeviceVerificationChanged", (userId
    /*: string*/
    , device
    /*: object*/
    ) => {
      const room = this.state.room;

      if (!room.currentState.getMember(userId)) {
        return;
      }

      this.updateE2EStatus(room);
    });
    (0, _defineProperty2.default)(this, "onUserVerificationChanged", (userId
    /*: string*/
    , trustStatus
    /*: object*/
    ) => {
      const room = this.state.room;

      if (!room || !room.currentState.getMember(userId)) {
        return;
      }

      this.updateE2EStatus(room);
    });
    (0, _defineProperty2.default)(this, "onCrossSigningKeysChanged", () => {
      const room = this.state.room;

      if (room) {
        this.updateE2EStatus(room);
      }
    });
    (0, _defineProperty2.default)(this, "onAccountData", (event
    /*: MatrixEvent*/
    ) => {
      const type = event.getType();

      if ((type === "org.matrix.preview_urls" || type === "im.vector.web.settings") && this.state.room) {
        // non-e2ee url previews are stored in legacy event type `org.matrix.room.preview_urls`
        this.updatePreviewUrlVisibility(this.state.room);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomAccountData", (event
    /*: MatrixEvent*/
    , room
    /*: Room*/
    ) => {
      if (room.roomId == this.state.roomId) {
        const type = event.getType();

        if (type === "org.matrix.room.color_scheme") {
          const colorScheme = event.getContent(); // XXX: we should validate the event

          console.log("Tinter.tint from onRoomAccountData");

          _Tinter.default.tint(colorScheme.primary_color, colorScheme.secondary_color);
        } else if (type === "org.matrix.room.preview_urls" || type === "im.vector.web.settings") {
          // non-e2ee url previews are stored in legacy event type `org.matrix.room.preview_urls`
          this.updatePreviewUrlVisibility(room);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvents", (ev
    /*: MatrixEvent*/
    , state) => {
      // ignore if we don't have a room yet
      if (!this.state.room || this.state.room.roomId !== state.roomId) {
        return;
      }

      this.updatePermissions(this.state.room);
    });
    (0, _defineProperty2.default)(this, "onRoomStateMember", (ev
    /*: MatrixEvent*/
    , state, member) => {
      // ignore if we don't have a room yet
      if (!this.state.room) {
        return;
      } // ignore members in other rooms


      if (member.roomId !== this.state.room.roomId) {
        return;
      }

      this.updateRoomMembers(member);
    });
    (0, _defineProperty2.default)(this, "onMyMembership", (room
    /*: Room*/
    , membership
    /*: string*/
    , oldMembership
    /*: string*/
    ) => {
      if (room.roomId === this.state.roomId) {
        this.forceUpdate();
        this.loadMembersIfJoined(room);
        this.updatePermissions(room);
      }
    });
    (0, _defineProperty2.default)(this, "updateRoomMembers", (0, _ratelimitedfunc.default)(() => {
      this.updateDMState();
      this.updateE2EStatus(this.state.room);
    }, 500));
    (0, _defineProperty2.default)(this, "onSearchResultsFillRequest", (backwards
    /*: boolean*/
    ) => {
      if (!backwards) {
        return Promise.resolve(false);
      }

      if (this.state.searchResults.next_batch) {
        debuglog("requesting more search results");
        const searchPromise = (0, _Searching.searchPagination)(this.state.searchResults);
        return this.handleSearchResult(searchPromise);
      } else {
        debuglog("no more search results");
        return Promise.resolve(false);
      }
    });
    (0, _defineProperty2.default)(this, "onInviteButtonClick", () => {
      // call AddressPickerDialog
      _dispatcher.default.dispatch({
        action: 'view_invite',
        roomId: this.state.room.roomId
      });
    });
    (0, _defineProperty2.default)(this, "onJoinButtonClicked", () => {
      // If the user is a ROU, allow them to transition to a PWLU
      if (this.context && this.context.isGuest()) {
        // Join this room once the user has registered and logged in
        // (If we failed to peek, we may not have a valid room object.)
        _dispatcher.default.dispatch({
          action: 'do_after_sync_prepared',
          deferred_action: {
            action: 'view_room',
            room_id: this.getRoomId()
          }
        });

        _dispatcher.default.dispatch({
          action: 'require_registration'
        });
      } else {
        Promise.resolve().then(() => {
          const signUrl = this.props.threepidInvite?.signUrl;

          _dispatcher.default.dispatch({
            action: 'join_room',
            opts: {
              inviteSignUrl: signUrl
            },
            _type: "unknown" // TODO: instrumentation

          });

          return Promise.resolve();
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMessageListScroll", ev => {
      if (this.messagePanel.isAtEndOfLiveTimeline()) {
        this.setState({
          numUnreadMessages: 0,
          atEndOfLiveTimeline: true
        });
      } else {
        this.setState({
          atEndOfLiveTimeline: false
        });
      }

      this.updateTopUnreadMessagesBar();
    });
    (0, _defineProperty2.default)(this, "onDragEnter", ev => {
      ev.stopPropagation();
      ev.preventDefault(); // We always increment the counter no matter the types, because dragging is
      // still happening. If we didn't, the drag counter would get out of sync.

      this.setState({
        dragCounter: this.state.dragCounter + 1
      }); // See:
      // https://docs.w3cub.com/dom/datatransfer/types
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file

      if (ev.dataTransfer.types.includes("Files") || ev.dataTransfer.types.includes("application/x-moz-file")) {
        this.setState({
          draggingFile: true
        });
      }
    });
    (0, _defineProperty2.default)(this, "onDragLeave", ev => {
      ev.stopPropagation();
      ev.preventDefault();
      this.setState({
        dragCounter: this.state.dragCounter - 1
      });

      if (this.state.dragCounter === 0) {
        this.setState({
          draggingFile: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "onDragOver", ev => {
      ev.stopPropagation();
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'none'; // See:
      // https://docs.w3cub.com/dom/datatransfer/types
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file

      if (ev.dataTransfer.types.includes("Files") || ev.dataTransfer.types.includes("application/x-moz-file")) {
        ev.dataTransfer.dropEffect = 'copy';
      }
    });
    (0, _defineProperty2.default)(this, "onDrop", ev => {
      ev.stopPropagation();
      ev.preventDefault();

      _ContentMessages.default.sharedInstance().sendContentListToRoom(ev.dataTransfer.files, this.state.room.roomId, this.context);

      _dispatcher.default.fire(_actions.Action.FocusComposer);

      this.setState({
        draggingFile: false,
        dragCounter: this.state.dragCounter - 1
      });
    });
    (0, _defineProperty2.default)(this, "onSearch", (term
    /*: string*/
    , scope) => {
      this.setState({
        searchTerm: term,
        searchScope: scope,
        searchResults: {},
        searchHighlights: []
      }); // if we already have a search panel, we need to tell it to forget
      // about its scroll state.

      if (this.searchResultsPanel.current) {
        this.searchResultsPanel.current.resetScrollState();
      } // make sure that we don't end up showing results from
      // an aborted search by keeping a unique id.
      //
      // todo: should cancel any previous search requests.


      this.searchId = new Date().getTime();
      let roomId;
      if (scope === "Room") roomId = this.state.room.roomId;
      debuglog("sending search request");
      const searchPromise = (0, _Searching.default)(term, roomId);
      this.handleSearchResult(searchPromise);
    });
    (0, _defineProperty2.default)(this, "onPinnedClick", () => {
      const nowShowingPinned = !this.state.showingPinned;
      const roomId = this.state.room.roomId;
      this.setState({
        showingPinned: nowShowingPinned,
        searching: false
      });

      _SettingsStore.default.setValue("PinnedEvents.isOpen", roomId, _SettingLevel.SettingLevel.ROOM_DEVICE, nowShowingPinned);
    });
    (0, _defineProperty2.default)(this, "onCallPlaced", (type
    /*: PlaceCallType*/
    ) => {
      _dispatcher.default.dispatch({
        action: 'place_call',
        type: type,
        room_id: this.state.room.roomId
      });
    });
    (0, _defineProperty2.default)(this, "onSettingsClick", () => {
      _dispatcher.default.dispatch({
        action: "open_room_settings"
      });
    });
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      console.log("updateTint from onCancelClick");
      this.updateTint();

      if (this.state.forwardingEvent) {
        _dispatcher.default.dispatch({
          action: 'forward_event',
          event: null
        });
      }

      _dispatcher.default.fire(_actions.Action.FocusComposer);
    });
    (0, _defineProperty2.default)(this, "onAppsClick", () => {
      _dispatcher.default.dispatch({
        action: "appsDrawer",
        show: !this.state.showApps
      });
    });
    (0, _defineProperty2.default)(this, "onLeaveClick", () => {
      _dispatcher.default.dispatch({
        action: 'leave_room',
        room_id: this.state.room.roomId
      });
    });
    (0, _defineProperty2.default)(this, "onForgetClick", () => {
      _dispatcher.default.dispatch({
        action: 'forget_room',
        room_id: this.state.room.roomId
      });
    });
    (0, _defineProperty2.default)(this, "onRejectButtonClicked", () => {
      this.setState({
        rejecting: true
      });
      this.context.leave(this.state.roomId).then(() => {
        _dispatcher.default.dispatch({
          action: 'view_home_page'
        });

        this.setState({
          rejecting: false
        });
      }, error => {
        console.error("Failed to reject invite: %s", error);
        const msg = error.message ? error.message : JSON.stringify(error);
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to reject invite', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Failed to reject invite"),
          description: msg
        });

        this.setState({
          rejecting: false,
          rejectError: error
        });
      });
    });
    (0, _defineProperty2.default)(this, "onRejectAndIgnoreClick", async () => {
      this.setState({
        rejecting: true
      });

      try {
        const myMember = this.state.room.getMember(this.context.getUserId());
        const inviteEvent = myMember.events.member;
        const ignoredUsers = this.context.getIgnoredUsers();
        ignoredUsers.push(inviteEvent.getSender()); // de-duped internally in the js-sdk

        await this.context.setIgnoredUsers(ignoredUsers);
        await this.context.leave(this.state.roomId);

        _dispatcher.default.dispatch({
          action: 'view_home_page'
        });

        this.setState({
          rejecting: false
        });
      } catch (error) {
        console.error("Failed to reject invite: %s", error);
        const msg = error.message ? error.message : JSON.stringify(error);
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to reject invite', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Failed to reject invite"),
          description: msg
        });

        this.setState({
          rejecting: false,
          rejectError: error
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRejectThreepidInviteButtonClicked", () => {
      // We can reject 3pid invites in the same way that we accept them,
      // using /leave rather than /join. In the short term though, we
      // just ignore them.
      // https://github.com/vector-im/vector-web/issues/1134
      _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
    });
    (0, _defineProperty2.default)(this, "onSearchClick", () => {
      this.setState({
        searching: !this.state.searching,
        showingPinned: false
      });
    });
    (0, _defineProperty2.default)(this, "onCancelSearchClick", () => {
      this.setState({
        searching: false,
        searchResults: null
      });
    });
    (0, _defineProperty2.default)(this, "jumpToLiveTimeline", () => {
      this.messagePanel.jumpToLiveTimeline();

      _dispatcher.default.fire(_actions.Action.FocusComposer);
    });
    (0, _defineProperty2.default)(this, "jumpToReadMarker", () => {
      this.messagePanel.jumpToReadMarker();
    });
    (0, _defineProperty2.default)(this, "forgetReadMarker", ev => {
      ev.stopPropagation();
      this.messagePanel.forgetReadMarker();
    });
    (0, _defineProperty2.default)(this, "updateTopUnreadMessagesBar", () => {
      if (!this.messagePanel) {
        return;
      }

      const showBar = this.messagePanel.canJumpToReadMarker();

      if (this.state.showTopUnreadMessagesBar != showBar) {
        this.setState({
          showTopUnreadMessagesBar: showBar
        });
      }
    });
    (0, _defineProperty2.default)(this, "onResize", () => {
      // It seems flexbox doesn't give us a way to constrain the auxPanel height to have
      // a minimum of the height of the video element, whilst also capping it from pushing out the page
      // so we have to do it via JS instead.  In this implementation we cap the height by putting
      // a maxHeight on the underlying remote video tag.
      // header + footer + status + give us at least 120px of scrollback at all times.
      let auxPanelMaxHeight = window.innerHeight - (54 + // height of RoomHeader
      36 + // height of the status area
      51 + // minimum height of the message compmoser
      120); // amount of desired scrollback
      // XXX: this is a bit of a hack and might possibly cause the video to push out the page anyway
      // but it's better than the video going missing entirely

      if (auxPanelMaxHeight < 50) auxPanelMaxHeight = 50;
      this.setState({
        auxPanelMaxHeight: auxPanelMaxHeight
      });
    });
    (0, _defineProperty2.default)(this, "onFullscreenClick", () => {
      _dispatcher.default.dispatch({
        action: 'video_fullscreen',
        fullscreen: true
      }, true);
    });
    (0, _defineProperty2.default)(this, "onMuteAudioClick", () => {
      const call = this.getCallForRoom();

      if (!call) {
        return;
      }

      const newState = !call.isMicrophoneMuted();
      call.setMicrophoneMuted(newState);
      this.forceUpdate(); // TODO: just update the voip buttons
    });
    (0, _defineProperty2.default)(this, "onMuteVideoClick", () => {
      const call = this.getCallForRoom();

      if (!call) {
        return;
      }

      const newState = !call.isLocalVideoMuted();
      call.setLocalVideoMuted(newState);
      this.forceUpdate(); // TODO: just update the voip buttons
    });
    (0, _defineProperty2.default)(this, "onStatusBarVisible", () => {
      if (this.unmounted) return;
      this.setState({
        statusBarVisible: true
      });
    });
    (0, _defineProperty2.default)(this, "onStatusBarHidden", () => {
      // This is currently not desired as it is annoying if it keeps expanding and collapsing
      if (this.unmounted) return;
      this.setState({
        statusBarVisible: false
      });
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      let panel;

      if (this.searchResultsPanel.current) {
        panel = this.searchResultsPanel.current;
      } else if (this.messagePanel) {
        panel = this.messagePanel;
      }

      if (panel) {
        panel.handleScrollKey(ev);
      }
    });
    (0, _defineProperty2.default)(this, "gatherTimelinePanelRef", r => {
      this.messagePanel = r;

      if (r) {
        console.log("updateTint from RoomView.gatherTimelinePanelRef");
        this.updateTint();
      }
    });
    (0, _defineProperty2.default)(this, "onHiddenHighlightsClick", () => {
      const oldRoom = this.getOldRoom();
      if (!oldRoom) return;

      _dispatcher.default.dispatch({
        action: "view_room",
        room_id: oldRoom.roomId
      });
    });
    const llMembers = this.context.hasLazyLoadMembersEnabled();
    this.state = {
      roomId: null,
      roomLoading: true,
      peekLoading: false,
      shouldPeek: true,
      membersLoaded: !llMembers,
      numUnreadMessages: 0,
      draggingFile: false,
      searching: false,
      searchResults: null,
      callState: null,
      guestsCanJoin: false,
      canPeek: false,
      showApps: false,
      isPeeking: false,
      showingPinned: false,
      showReadReceipts: true,
      showRightPanel: _RightPanelStore.default.getSharedInstance().isOpenForRoom,
      joining: false,
      atEndOfLiveTimeline: true,
      atEndOfLiveTimelineInit: false,
      showTopUnreadMessagesBar: false,
      statusBarVisible: false,
      canReact: false,
      canReply: false,
      layout: _SettingsStore.default.getValue("layout"),
      matrixClientIsReady: this.context && this.context.isInitialSyncComplete(),
      dragCounter: 0
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.context.on("Room", this.onRoom);
    this.context.on("Room.timeline", this.onRoomTimeline);
    this.context.on("Room.name", this.onRoomName);
    this.context.on("Room.accountData", this.onRoomAccountData);
    this.context.on("RoomState.events", this.onRoomStateEvents);
    this.context.on("RoomState.members", this.onRoomStateMember);
    this.context.on("Room.myMembership", this.onMyMembership);
    this.context.on("accountData", this.onAccountData);
    this.context.on("crypto.keyBackupStatus", this.onKeyBackupStatus);
    this.context.on("deviceVerificationChanged", this.onDeviceVerificationChanged);
    this.context.on("userTrustStatusChanged", this.onUserVerificationChanged);
    this.context.on("crossSigning.keysChanged", this.onCrossSigningKeysChanged);
    this.context.on("Event.decrypted", this.onEventDecrypted);
    this.context.on("event", this.onEvent); // Start listening for RoomViewStore updates

    this.roomStoreToken = _RoomViewStore.default.addListener(this.onRoomViewStoreUpdate);
    this.rightPanelStoreToken = _RightPanelStore.default.getSharedInstance().addListener(this.onRightPanelStoreUpdate);

    _WidgetEchoStore.default.on(_AsyncStore.UPDATE_EVENT, this.onWidgetEchoStoreUpdate);

    _WidgetStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onWidgetStoreUpdate);

    this.showReadReceiptsWatchRef = _SettingsStore.default.watchSetting("showReadReceipts", null, this.onReadReceiptsChange);
    this.layoutWatcherRef = _SettingsStore.default.watchSetting("layout", null, this.onLayoutChange);
  }

  getPermalinkCreatorForRoom(room
  /*: Room*/
  ) {
    if (this.permalinkCreators[room.roomId]) return this.permalinkCreators[room.roomId];
    this.permalinkCreators[room.roomId] = new _Permalinks.RoomPermalinkCreator(room);

    if (this.state.room && room.roomId === this.state.room.roomId) {
      // We want to watch for changes in the creator for the primary room in the view, but
      // don't need to do so for search results.
      this.permalinkCreators[room.roomId].start();
    } else {
      this.permalinkCreators[room.roomId].load();
    }

    return this.permalinkCreators[room.roomId];
  }

  stopAllPermalinkCreators() {
    if (!this.permalinkCreators) return;

    for (const roomId of Object.keys(this.permalinkCreators)) {
      this.permalinkCreators[roomId].stop();
    }
  }

  setupRoom(room
  /*: Room*/
  , roomId
  /*: string*/
  , joining
  /*: boolean*/
  , shouldPeek
  /*: boolean*/
  ) {
    // if this is an unknown room then we're in one of three states:
    // - This is a room we can peek into (search engine) (we can /peek)
    // - This is a room we can publicly join or were invited to. (we can /join)
    // - This is a room we cannot join at all. (no action can help us)
    // We can't try to /join because this may implicitly accept invites (!)
    // We can /peek though. If it fails then we present the join UI. If it
    // succeeds then great, show the preview (but we still may be able to /join!).
    // Note that peeking works by room ID and room ID only, as opposed to joining
    // which must be by alias or invite wherever possible (peeking currently does
    // not work over federation).
    // NB. We peek if we have never seen the room before (i.e. js-sdk does not know
    // about it). We don't peek in the historical case where we were joined but are
    // now not joined because the js-sdk peeking API will clobber our historical room,
    // making it impossible to indicate a newly joined room.
    if (!joining && roomId) {
      if (!room && shouldPeek) {
        console.info("Attempting to peek into room %s", roomId);
        this.setState({
          peekLoading: true,
          isPeeking: true // this will change to false if peeking fails

        });
        this.context.peekInRoom(roomId).then(room => {
          if (this.unmounted) {
            return;
          }

          this.setState({
            room: room,
            peekLoading: false
          });
          this.onRoomLoaded(room);
        }).catch(err => {
          if (this.unmounted) {
            return;
          } // Stop peeking if anything went wrong


          this.setState({
            isPeeking: false
          }); // This won't necessarily be a MatrixError, but we duck-type
          // here and say if it's got an 'errcode' key with the right value,
          // it means we can't peek.

          if (err.errcode === "M_GUEST_ACCESS_FORBIDDEN" || err.errcode === 'M_FORBIDDEN') {
            // This is fine: the room just isn't peekable (we assume).
            this.setState({
              peekLoading: false
            });
          } else {
            throw err;
          }
        });
      } else if (room) {
        // Stop peeking because we have joined this room previously
        this.context.stopPeeking();
        this.setState({
          isPeeking: false
        });
      }
    }
  }

  shouldShowApps(room
  /*: Room*/
  ) {
    if (!BROWSER_SUPPORTS_SANDBOX || !room) return false; // Check if user has previously chosen to hide the app drawer for this
    // room. If so, do not show apps

    const hideWidgetDrawer = localStorage.getItem(room.roomId + "_hide_widget_drawer"); // This is confusing, but it means to say that we default to the tray being
    // hidden unless the user clicked to open it.

    const isManuallyShown = hideWidgetDrawer === "false";

    const widgets = _WidgetLayoutStore.WidgetLayoutStore.instance.getContainerWidgets(room, _WidgetLayoutStore.Container.Top);

    return widgets.length > 0 || isManuallyShown;
  }

  componentDidMount() {
    this.onRoomViewStoreUpdate(true);
    const call = this.getCallForRoom();
    const callState = call ? call.state : null;
    this.setState({
      callState: callState
    });
    window.addEventListener('beforeunload', this.onPageUnload);

    if (this.props.resizeNotifier) {
      this.props.resizeNotifier.on("middlePanelResized", this.onResize);
    }

    this.onResize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (0, _objects.objectHasDiff)(this.props, nextProps) || (0, _objects.objectHasDiff)(this.state, nextState);
  }

  componentDidUpdate() {
    if (this.roomView.current) {
      const roomView = this.roomView.current;

      if (!roomView.ondrop) {
        roomView.addEventListener('drop', this.onDrop);
        roomView.addEventListener('dragover', this.onDragOver);
        roomView.addEventListener('dragenter', this.onDragEnter);
        roomView.addEventListener('dragleave', this.onDragLeave);
      }
    } // Note: We check the ref here with a flag because componentDidMount, despite
    // documentation, does not define our messagePanel ref. It looks like our spinner
    // in render() prevents the ref from being set on first mount, so we try and
    // catch the messagePanel when it does mount. Because we only want the ref once,
    // we use a boolean flag to avoid duplicate work.


    if (this.messagePanel && !this.state.atEndOfLiveTimelineInit) {
      this.setState({
        atEndOfLiveTimelineInit: true,
        atEndOfLiveTimeline: this.messagePanel.isAtEndOfLiveTimeline()
      });
    }
  }

  componentWillUnmount() {
    // set a boolean to say we've been unmounted, which any pending
    // promises can use to throw away their results.
    //
    // (We could use isMounted, but facebook have deprecated that.)
    this.unmounted = true; // update the scroll map before we get unmounted

    if (this.state.roomId) {
      _RoomScrollStateStore.default.setScrollState(this.state.roomId, this.getScrollState());
    }

    if (this.state.shouldPeek) {
      this.context.stopPeeking();
    } // stop tracking room changes to format permalinks


    this.stopAllPermalinkCreators();

    if (this.roomView.current) {
      // disconnect the D&D event listeners from the room view. This
      // is really just for hygiene - we're going to be
      // deleted anyway, so it doesn't matter if the event listeners
      // don't get cleaned up.
      const roomView = this.roomView.current;
      roomView.removeEventListener('drop', this.onDrop);
      roomView.removeEventListener('dragover', this.onDragOver);
      roomView.removeEventListener('dragenter', this.onDragEnter);
      roomView.removeEventListener('dragleave', this.onDragLeave);
    }

    _dispatcher.default.unregister(this.dispatcherRef);

    if (this.context) {
      this.context.removeListener("Room", this.onRoom);
      this.context.removeListener("Room.timeline", this.onRoomTimeline);
      this.context.removeListener("Room.name", this.onRoomName);
      this.context.removeListener("Room.accountData", this.onRoomAccountData);
      this.context.removeListener("RoomState.events", this.onRoomStateEvents);
      this.context.removeListener("Room.myMembership", this.onMyMembership);
      this.context.removeListener("RoomState.members", this.onRoomStateMember);
      this.context.removeListener("accountData", this.onAccountData);
      this.context.removeListener("crypto.keyBackupStatus", this.onKeyBackupStatus);
      this.context.removeListener("deviceVerificationChanged", this.onDeviceVerificationChanged);
      this.context.removeListener("userTrustStatusChanged", this.onUserVerificationChanged);
      this.context.removeListener("crossSigning.keysChanged", this.onCrossSigningKeysChanged);
      this.context.removeListener("Event.decrypted", this.onEventDecrypted);
      this.context.removeListener("event", this.onEvent);
    }

    window.removeEventListener('beforeunload', this.onPageUnload);

    if (this.props.resizeNotifier) {
      this.props.resizeNotifier.removeListener("middlePanelResized", this.onResize);
    } // Remove RoomStore listener


    if (this.roomStoreToken) {
      this.roomStoreToken.remove();
    } // Remove RightPanelStore listener


    if (this.rightPanelStoreToken) {
      this.rightPanelStoreToken.remove();
    }

    _WidgetEchoStore.default.removeListener(_AsyncStore.UPDATE_EVENT, this.onWidgetEchoStoreUpdate);

    _WidgetStore.default.instance.removeListener(_AsyncStore.UPDATE_EVENT, this.onWidgetStoreUpdate);

    if (this.state.room) {
      _WidgetLayoutStore.WidgetLayoutStore.instance.off(_WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(this.state.room), this.onWidgetLayoutChange);
    }

    if (this.showReadReceiptsWatchRef) {
      _SettingsStore.default.unwatchSetting(this.showReadReceiptsWatchRef);
    } // cancel any pending calls to the rate_limited_funcs


    this.updateRoomMembers.cancelPendingCall(); // no need to do this as Dir & Settings are now overlays. It just burnt CPU.
    // console.log("Tinter.tint from RoomView.unmount");
    // Tinter.tint(); // reset colourscheme

    _SettingsStore.default.unwatchSetting(this.layoutWatcherRef);
  }

  async calculateRecommendedVersion(room
  /*: Room*/
  ) {
    this.setState({
      upgradeRecommendation: await room.getRecommendedVersion()
    });
  }

  async loadMembersIfJoined(room
  /*: Room*/
  ) {
    // lazy load members if enabled
    if (this.context.hasLazyLoadMembersEnabled()) {
      if (room && room.getMyMembership() === 'join') {
        try {
          await room.loadMembersIfNeeded();

          if (!this.unmounted) {
            this.setState({
              membersLoaded: true
            });
          }
        } catch (err) {
          const errorMessage = `Fetching room members for ${room.roomId} failed.` + " Room members will appear incomplete.";
          console.error(errorMessage);
          console.error(err);
        }
      }
    }
  }

  calculatePeekRules(room
  /*: Room*/
  ) {
    const guestAccessEvent = room.currentState.getStateEvents("m.room.guest_access", "");

    if (guestAccessEvent && guestAccessEvent.getContent().guest_access === "can_join") {
      this.setState({
        guestsCanJoin: true
      });
    }

    const historyVisibility = room.currentState.getStateEvents("m.room.history_visibility", "");

    if (historyVisibility && historyVisibility.getContent().history_visibility === "world_readable") {
      this.setState({
        canPeek: true
      });
    }
  }

  updatePreviewUrlVisibility({
    roomId
  }
  /*: Room*/
  ) {
    // URL Previews in E2EE rooms can be a privacy leak so use a different setting which is per-room explicit
    const key = this.context.isRoomEncrypted(roomId) ? 'urlPreviewsEnabled_e2ee' : 'urlPreviewsEnabled';
    this.setState({
      showUrlPreview: _SettingsStore.default.getValue(key, roomId)
    });
  }

  async updateE2EStatus(room
  /*: Room*/
  ) {
    if (!this.context.isRoomEncrypted(room.roomId)) {
      return;
    }

    if (!this.context.isCryptoEnabled()) {
      // If crypto is not currently enabled, we aren't tracking devices at all,
      // so we don't know what the answer is. Let's error on the safe side and show
      // a warning for this case.
      this.setState({
        e2eStatus: _ShieldUtils.E2EStatus.Warning
      });
      return;
    }
    /* At this point, the user has encryption on and cross-signing on */


    this.setState({
      e2eStatus: await (0, _ShieldUtils.shieldStatusForRoom)(this.context, room)
    });
  }

  updateTint() {
    const room = this.state.room;
    if (!room) return;
    console.log("Tinter.tint from updateTint");

    const colorScheme = _SettingsStore.default.getValue("roomColor", room.roomId);

    _Tinter.default.tint(colorScheme.primary_color, colorScheme.secondary_color);
  }

  updatePermissions(room
  /*: Room*/
  ) {
    if (room) {
      const me = this.context.getUserId();
      const canReact = room.getMyMembership() === "join" && room.currentState.maySendEvent("m.reaction", me);
      const canReply = room.maySendMessage();
      this.setState({
        canReact,
        canReply
      });
    }
  } // rate limited because a power level change will emit an event for every member in the room.


  checkDesktopNotifications() {
    const memberCount = this.state.room.getJoinedMemberCount() + this.state.room.getInvitedMemberCount(); // if they are not alone prompt the user about notifications so they don't miss replies

    if (memberCount > 1 && _Notifier.default.shouldShowPrompt()) {
      (0, _DesktopNotificationsToast.showToast)(true);
    }
  }

  updateDMState() {
    const room = this.state.room;

    if (room.getMyMembership() != "join") {
      return;
    }

    const dmInviter = room.getDMInviter();

    if (dmInviter) {
      Rooms.setDMRoom(room.roomId, dmInviter);
    }
  }

  injectSticker(url, info, text) {
    if (this.context.isGuest()) {
      _dispatcher.default.dispatch({
        action: 'require_registration'
      });

      return;
    }

    _ContentMessages.default.sharedInstance().sendStickerContentToRoom(url, this.state.room.roomId, info, text, this.context).then(undefined, error => {
      if (error.name === "UnknownDeviceError") {
        // Let the staus bar handle this
        return;
      }
    });
  }

  handleSearchResult(searchPromise
  /*: Promise<any>*/
  ) {
    // keep a record of the current search id, so that if the search terms
    // change before we get a response, we can ignore the results.
    const localSearchId = this.searchId;
    this.setState({
      searchInProgress: true
    });
    return searchPromise.then(results => {
      debuglog("search complete");

      if (this.unmounted || !this.state.searching || this.searchId != localSearchId) {
        console.error("Discarding stale search results");
        return;
      } // postgres on synapse returns us precise details of the strings
      // which actually got matched for highlighting.
      //
      // In either case, we want to highlight the literal search term
      // whether it was used by the search engine or not.


      let highlights = results.highlights;

      if (highlights.indexOf(this.state.searchTerm) < 0) {
        highlights = highlights.concat(this.state.searchTerm);
      } // For overlapping highlights,
      // favour longer (more specific) terms first


      highlights = highlights.sort(function (a, b) {
        return b.length - a.length;
      });
      this.setState({
        searchHighlights: highlights,
        searchResults: results
      });
    }, error => {
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      console.error("Search failed", error);

      _Modal.default.createTrackedDialog('Search failed', '', ErrorDialog, {
        title: (0, _languageHandler._t)("Search failed"),
        description: error && error.message ? error.message : (0, _languageHandler._t)("Server may be unavailable, overloaded, or search timed out :(")
      });
    }).finally(() => {
      this.setState({
        searchInProgress: false
      });
    });
  }

  getSearchResultTiles() {
    const SearchResultTile = sdk.getComponent('rooms.SearchResultTile');
    const Spinner = sdk.getComponent("elements.Spinner"); // XXX: todo: merge overlapping results somehow?
    // XXX: why doesn't searching on name work?

    const ret = [];

    if (this.state.searchInProgress) {
      ret.push( /*#__PURE__*/_react.default.createElement("li", {
        key: "search-spinner"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null)));
    }

    if (!this.state.searchResults.next_batch) {
      if (!this.state.searchResults?.results?.length) {
        ret.push( /*#__PURE__*/_react.default.createElement("li", {
          key: "search-top-marker"
        }, /*#__PURE__*/_react.default.createElement("h2", {
          className: "mx_RoomView_topMarker"
        }, (0, _languageHandler._t)("No results"))));
      } else {
        ret.push( /*#__PURE__*/_react.default.createElement("li", {
          key: "search-top-marker"
        }, /*#__PURE__*/_react.default.createElement("h2", {
          className: "mx_RoomView_topMarker"
        }, (0, _languageHandler._t)("No more results"))));
      }
    } // once dynamic content in the search results load, make the scrollPanel check
    // the scroll offsets.


    const onHeightChanged = () => {
      const scrollPanel = this.searchResultsPanel.current;

      if (scrollPanel) {
        scrollPanel.checkScroll();
      }
    };

    let lastRoomId;

    for (let i = (this.state.searchResults?.results?.length || 0) - 1; i >= 0; i--) {
      const result = this.state.searchResults.results[i];
      const mxEv = result.context.getEvent();
      const roomId = mxEv.getRoomId();
      const room = this.context.getRoom(roomId);

      if (!room) {
        // if we do not have the room in js-sdk stores then hide it as we cannot easily show it
        // As per the spec, an all rooms search can create this condition,
        // it happens with Seshat but not Synapse.
        // It will make the result count not match the displayed count.
        console.log("Hiding search result from an unknown room", roomId);
        continue;
      }

      if (!(0, _EventTile.haveTileForEvent)(mxEv)) {
        // XXX: can this ever happen? It will make the result count
        // not match the displayed count.
        continue;
      }

      if (this.state.searchScope === 'All') {
        if (roomId !== lastRoomId) {
          ret.push( /*#__PURE__*/_react.default.createElement("li", {
            key: mxEv.getId() + "-room"
          }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Room"), ": ", room.name)));
          lastRoomId = roomId;
        }
      }

      const resultLink = "#/room/" + roomId + "/" + mxEv.getId();
      ret.push( /*#__PURE__*/_react.default.createElement(SearchResultTile, {
        key: mxEv.getId(),
        searchResult: result,
        searchHighlights: this.state.searchHighlights,
        resultLink: resultLink,
        permalinkCreator: this.getPermalinkCreatorForRoom(room),
        onHeightChanged: onHeightChanged
      }));
    }

    return ret;
  }

  // get the current scroll position of the room, so that it can be
  // restored when we switch back to it.
  //
  getScrollState() {
    const messagePanel = this.messagePanel;
    if (!messagePanel) return null; // if we're following the live timeline, we want to return null; that
    // means that, if we switch back, we will jump to the read-up-to mark.
    //
    // That should be more intuitive than slavishly preserving the current
    // scroll state, in the case where the room advances in the meantime
    // (particularly in the case that the user reads some stuff on another
    // device).
    //

    if (this.state.atEndOfLiveTimeline) {
      return null;
    }

    const scrollState = messagePanel.getScrollState(); // getScrollState on TimelinePanel *may* return null, so guard against that

    if (!scrollState || scrollState.stuckAtBottom) {
      // we don't really expect to be in this state, but it will
      // occasionally happen when no scroll state has been set on the
      // messagePanel (ie, we didn't have an initial event (so it's
      // probably a new room), there has been no user-initiated scroll, and
      // no read-receipts have arrived to update the scroll position).
      //
      // Return null, which will cause us to scroll to last unread on
      // reload.
      return null;
    }

    return {
      focussedEvent: scrollState.trackedScrollToken,
      pixelOffset: scrollState.pixelOffset
    };
  }

  /**
   * get any current call for this room
   */
  getCallForRoom()
  /*: MatrixCall*/
  {
    if (!this.state.room) {
      return null;
    }

    return _CallHandler.default.sharedInstance().getCallForRoom(this.state.room.roomId);
  } // this has to be a proper method rather than an unnamed function,
  // otherwise react calls it with null on each update.


  getOldRoom() {
    const createEvent = this.state.room.currentState.getStateEvents("m.room.create", "");
    if (!createEvent || !createEvent.getContent()['predecessor']) return null;
    return this.context.getRoom(createEvent.getContent()['predecessor']['room_id']);
  }

  getHiddenHighlightCount() {
    const oldRoom = this.getOldRoom();
    if (!oldRoom) return 0;
    return oldRoom.getUnreadNotificationCount('highlight');
  }

  render() {
    if (!this.state.room) {
      const loading = !this.state.matrixClientIsReady || this.state.roomLoading || this.state.peekLoading;

      if (loading) {
        // Assume preview loading if we don't have a ready client or a room ID (still resolving the alias)
        const previewLoading = !this.state.matrixClientIsReady || !this.state.roomId || this.state.peekLoading;
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          canPreview: false,
          previewLoading: previewLoading && !this.state.roomLoadError,
          error: this.state.roomLoadError,
          loading: loading,
          joining: this.state.joining,
          oobData: this.props.oobData
        })));
      } else {
        let inviterName = undefined;

        if (this.props.oobData) {
          inviterName = this.props.oobData.inviterName;
        }

        const invitedEmail = this.props.threepidInvite?.toEmail; // We have no room object for this room, only the ID.
        // We've got to this room by following a link, possibly a third party invite.

        const roomAlias = this.state.roomAlias;
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          onJoinClick: this.onJoinButtonClicked,
          onForgetClick: this.onForgetClick,
          onRejectClick: this.onRejectThreepidInviteButtonClicked,
          canPreview: false,
          error: this.state.roomLoadError,
          roomAlias: roomAlias,
          joining: this.state.joining,
          inviterName: inviterName,
          invitedEmail: invitedEmail,
          oobData: this.props.oobData,
          signUrl: this.props.threepidInvite?.signUrl,
          room: this.state.room
        })));
      }
    }

    const myMembership = this.state.room.getMyMembership();

    if (myMembership === "invite" && !this.state.room.isSpaceRoom()) {
      // SpaceRoomView handles invites itself
      if (this.state.joining || this.state.rejecting) {
        return /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          canPreview: false,
          error: this.state.roomLoadError,
          joining: this.state.joining,
          rejecting: this.state.rejecting
        }));
      } else {
        const myUserId = this.context.credentials.userId;
        const myMember = this.state.room.getMember(myUserId);
        const inviteEvent = myMember ? myMember.events.member : null;
        let inviterName = (0, _languageHandler._t)("Unknown");

        if (inviteEvent) {
          inviterName = inviteEvent.sender ? inviteEvent.sender.name : inviteEvent.getSender();
        } // We deliberately don't try to peek into invites, even if we have permission to peek
        // as they could be a spam vector.
        // XXX: in future we could give the option of a 'Preview' button which lets them view anyway.
        // We have a regular invite for this room.


        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
          onJoinClick: this.onJoinButtonClicked,
          onForgetClick: this.onForgetClick,
          onRejectClick: this.onRejectButtonClicked,
          onRejectAndIgnoreClick: this.onRejectAndIgnoreClick,
          inviterName: inviterName,
          canPreview: false,
          joining: this.state.joining,
          room: this.state.room
        })));
      }
    }

    let fileDropTarget = null;

    if (this.state.draggingFile) {
      fileDropTarget = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_fileDropTarget"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../res/img/upload-big.svg"),
        className: "mx_RoomView_fileDropTarget_image"
      }), (0, _languageHandler._t)("Drop file here to upload"));
    } // We have successfully loaded this room, and are not previewing.
    // Display the "normal" room view.


    let activeCall = null;
    {
      // New block because this variable doesn't need to hang around for the rest of the function
      const call = this.getCallForRoom();

      if (call && this.state.callState !== 'ended' && this.state.callState !== 'ringing') {
        activeCall = call;
      }
    }
    const scrollheaderClasses = (0, _classnames.default)({
      mx_RoomView_scrollheader: true
    });
    let statusBar;
    let isStatusAreaExpanded = true;

    if (_ContentMessages.default.sharedInstance().getCurrentUploads().length > 0) {
      const UploadBar = sdk.getComponent('structures.UploadBar');
      statusBar = /*#__PURE__*/_react.default.createElement(UploadBar, {
        room: this.state.room
      });
    } else if (!this.state.searchResults) {
      const RoomStatusBar = sdk.getComponent('structures.RoomStatusBar');
      isStatusAreaExpanded = this.state.statusBarVisible;
      statusBar = /*#__PURE__*/_react.default.createElement(RoomStatusBar, {
        room: this.state.room,
        isPeeking: myMembership !== "join",
        onInviteClick: this.onInviteButtonClick,
        onVisible: this.onStatusBarVisible,
        onHidden: this.onStatusBarHidden
      });
    }

    const roomVersionRecommendation = this.state.upgradeRecommendation;
    const showRoomUpgradeBar = roomVersionRecommendation && roomVersionRecommendation.needsUpgrade && this.state.room.userMayUpgradeRoom(this.context.credentials.userId);
    const hiddenHighlightCount = this.getHiddenHighlightCount();
    let aux = null;
    let previewBar;
    let hideCancel = false;

    if (this.state.forwardingEvent) {
      aux = /*#__PURE__*/_react.default.createElement(_ForwardMessage.default, {
        onCancelClick: this.onCancelClick
      });
    } else if (this.state.searching) {
      hideCancel = true; // has own cancel

      aux = /*#__PURE__*/_react.default.createElement(_SearchBar.default, {
        searchInProgress: this.state.searchInProgress,
        onCancelClick: this.onCancelSearchClick,
        onSearch: this.onSearch,
        isRoomEncrypted: this.context.isRoomEncrypted(this.state.room.roomId)
      });
    } else if (showRoomUpgradeBar) {
      aux = /*#__PURE__*/_react.default.createElement(_RoomUpgradeWarningBar.default, {
        room: this.state.room,
        recommendation: roomVersionRecommendation
      });
      hideCancel = true;
    } else if (this.state.showingPinned) {
      hideCancel = true; // has own cancel

      aux = /*#__PURE__*/_react.default.createElement(_PinnedEventsPanel.default, {
        room: this.state.room,
        onCancelClick: this.onPinnedClick
      });
    } else if (myMembership !== "join") {
      // We do have a room object for this room, but we're not currently in it.
      // We may have a 3rd party invite to it.
      let inviterName = undefined;

      if (this.props.oobData) {
        inviterName = this.props.oobData.inviterName;
      }

      const invitedEmail = this.props.threepidInvite?.toEmail;
      hideCancel = true;
      previewBar = /*#__PURE__*/_react.default.createElement(_RoomPreviewBar.default, {
        onJoinClick: this.onJoinButtonClicked,
        onForgetClick: this.onForgetClick,
        onRejectClick: this.onRejectThreepidInviteButtonClicked,
        joining: this.state.joining,
        inviterName: inviterName,
        invitedEmail: invitedEmail,
        oobData: this.props.oobData,
        canPreview: this.state.canPeek,
        room: this.state.room
      });

      if (!this.state.canPeek && !this.state.room?.isSpaceRoom()) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView"
        }, previewBar);
      }
    } else if (hiddenHighlightCount > 0) {
      aux = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        element: "div",
        className: "mx_RoomView_auxPanel_hiddenHighlights",
        onClick: this.onHiddenHighlightsClick
      }, (0, _languageHandler._t)("You have %(count)s unread notifications in a prior version of this room.", {
        count: hiddenHighlightCount
      }));
    }

    if (_SettingsStore.default.getValue("feature_spaces") && this.state.room?.isSpaceRoom()) {
      return /*#__PURE__*/_react.default.createElement(_SpaceRoomView.default, {
        space: this.state.room,
        justCreatedOpts: this.props.justCreatedOpts,
        resizeNotifier: this.props.resizeNotifier,
        onJoinButtonClicked: this.onJoinButtonClicked,
        onRejectButtonClicked: this.props.threepidInvite ? this.onRejectThreepidInviteButtonClicked : this.onRejectButtonClicked
      });
    }

    const auxPanel = /*#__PURE__*/_react.default.createElement(_AuxPanel.default, {
      room: this.state.room,
      fullHeight: false,
      userId: this.context.credentials.userId,
      maxHeight: this.state.auxPanelMaxHeight,
      showApps: this.state.showApps,
      onResize: this.onResize,
      resizeNotifier: this.props.resizeNotifier
    }, aux);

    let messageComposer;
    let searchInfo;
    const canSpeak = // joined and not showing search results
    myMembership === 'join' && !this.state.searchResults;

    if (canSpeak) {
      const MessageComposer = sdk.getComponent('rooms.MessageComposer');
      messageComposer = /*#__PURE__*/_react.default.createElement(MessageComposer, {
        room: this.state.room,
        callState: this.state.callState,
        showApps: this.state.showApps,
        e2eStatus: this.state.e2eStatus,
        resizeNotifier: this.props.resizeNotifier,
        replyToEvent: this.state.replyToEvent,
        permalinkCreator: this.getPermalinkCreatorForRoom(this.state.room)
      });
    } // TODO: Why aren't we storing the term/scope/count in this format
    // in this.state if this is what RoomHeader desires?


    if (this.state.searchResults) {
      searchInfo = {
        searchTerm: this.state.searchTerm,
        searchScope: this.state.searchScope,
        searchCount: this.state.searchResults.count
      };
    } // if we have search results, we keep the messagepanel (so that it preserves its
    // scroll state), but hide it.


    let searchResultsPanel;
    let hideMessagePanel = false;

    if (this.state.searchResults) {
      // show searching spinner
      if (this.state.searchResults.count === undefined) {
        searchResultsPanel = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RoomView_messagePanel mx_RoomView_messagePanelSearchSpinner"
        });
      } else {
        searchResultsPanel = /*#__PURE__*/_react.default.createElement(_ScrollPanel.default, {
          ref: this.searchResultsPanel,
          className: "mx_RoomView_messagePanel mx_RoomView_searchResultsPanel mx_GroupLayout",
          onFillRequest: this.onSearchResultsFillRequest,
          resizeNotifier: this.props.resizeNotifier
        }, /*#__PURE__*/_react.default.createElement("li", {
          className: scrollheaderClasses
        }), this.getSearchResultTiles());
      }

      hideMessagePanel = true;
    }

    const shouldHighlight = this.state.isInitialEventHighlighted;
    let highlightedEventId = null;

    if (this.state.forwardingEvent) {
      highlightedEventId = this.state.forwardingEvent.getId();
    } else if (shouldHighlight) {
      highlightedEventId = this.state.initialEventId;
    }

    const messagePanelClassNames = (0, _classnames.default)("mx_RoomView_messagePanel", {
      "mx_IRCLayout": this.state.layout == _Layout.Layout.IRC,
      "mx_GroupLayout": this.state.layout == _Layout.Layout.Group
    }); // console.info("ShowUrlPreview for %s is %s", this.state.room.roomId, this.state.showUrlPreview);

    const messagePanel = /*#__PURE__*/_react.default.createElement(_TimelinePanel.default, {
      ref: this.gatherTimelinePanelRef,
      timelineSet: this.state.room.getUnfilteredTimelineSet(),
      showReadReceipts: this.state.showReadReceipts,
      manageReadReceipts: !this.state.isPeeking,
      sendReadReceiptOnLoad: !this.state.wasContextSwitch,
      manageReadMarkers: !this.state.isPeeking,
      hidden: hideMessagePanel,
      highlightedEventId: highlightedEventId,
      eventId: this.state.initialEventId,
      eventPixelOffset: this.state.initialEventPixelOffset,
      onScroll: this.onMessageListScroll,
      onReadMarkerUpdated: this.updateTopUnreadMessagesBar,
      showUrlPreview: this.state.showUrlPreview,
      className: messagePanelClassNames,
      membersLoaded: this.state.membersLoaded,
      permalinkCreator: this.getPermalinkCreatorForRoom(this.state.room),
      resizeNotifier: this.props.resizeNotifier,
      showReactions: true,
      layout: this.state.layout
    });

    let topUnreadMessagesBar = null; // Do not show TopUnreadMessagesBar if we have search results showing, it makes no sense

    if (this.state.showTopUnreadMessagesBar && !this.state.searchResults) {
      const TopUnreadMessagesBar = sdk.getComponent('rooms.TopUnreadMessagesBar');
      topUnreadMessagesBar = /*#__PURE__*/_react.default.createElement(TopUnreadMessagesBar, {
        onScrollUpClick: this.jumpToReadMarker,
        onCloseClick: this.forgetReadMarker
      });
    }

    let jumpToBottom; // Do not show JumpToBottomButton if we have search results showing, it makes no sense

    if (!this.state.atEndOfLiveTimeline && !this.state.searchResults) {
      const JumpToBottomButton = sdk.getComponent('rooms.JumpToBottomButton');
      jumpToBottom = /*#__PURE__*/_react.default.createElement(JumpToBottomButton, {
        highlight: this.state.room.getUnreadNotificationCount('highlight') > 0,
        numUnreadMessages: this.state.numUnreadMessages,
        onScrollToBottomClick: this.jumpToLiveTimeline
      });
    }

    const statusBarAreaClass = (0, _classnames.default)("mx_RoomView_statusArea", {
      "mx_RoomView_statusArea_expanded": isStatusAreaExpanded
    });
    const showRightPanel = this.state.room && this.state.showRightPanel;
    const rightPanel = showRightPanel ? /*#__PURE__*/_react.default.createElement(_RightPanel.default, {
      room: this.state.room,
      resizeNotifier: this.props.resizeNotifier
    }) : null;
    const timelineClasses = (0, _classnames.default)("mx_RoomView_timeline", {
      mx_RoomView_timeline_rr_enabled: this.state.showReadReceipts
    });
    const mainClasses = (0, _classnames.default)("mx_RoomView", {
      mx_RoomView_inCall: Boolean(activeCall)
    });

    const showChatEffects = _SettingsStore.default.getValue('showChatEffects');

    return /*#__PURE__*/_react.default.createElement(_RoomContext.default.Provider, {
      value: this.state
    }, /*#__PURE__*/_react.default.createElement("main", {
      className: mainClasses,
      ref: this.roomView,
      onKeyDown: this.onReactKeyDown
    }, showChatEffects && this.roomView.current && /*#__PURE__*/_react.default.createElement(_EffectsOverlay.default, {
      roomWidth: this.roomView.current.offsetWidth
    }), /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_RoomHeader.default, {
      room: this.state.room,
      searchInfo: searchInfo,
      oobData: this.props.oobData,
      inRoom: myMembership === 'join',
      onSearchClick: this.onSearchClick,
      onSettingsClick: this.onSettingsClick,
      onPinnedClick: this.onPinnedClick,
      onCancelClick: aux && !hideCancel ? this.onCancelClick : null,
      onForgetClick: myMembership === "leave" ? this.onForgetClick : null,
      onLeaveClick: myMembership === "join" ? this.onLeaveClick : null,
      e2eStatus: this.state.e2eStatus,
      onAppsClick: this.state.hasPinnedWidgets ? this.onAppsClick : null,
      appsShown: this.state.showApps,
      onCallPlaced: this.onCallPlaced
    }), /*#__PURE__*/_react.default.createElement(_MainSplit.default, {
      panel: rightPanel,
      resizeNotifier: this.props.resizeNotifier
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_body"
    }, auxPanel, /*#__PURE__*/_react.default.createElement("div", {
      className: timelineClasses
    }, fileDropTarget, topUnreadMessagesBar, jumpToBottom, messagePanel, searchResultsPanel), /*#__PURE__*/_react.default.createElement("div", {
      className: statusBarAreaClass
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_statusAreaBox"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_statusAreaBox_line"
    }), statusBar)), previewBar, messageComposer)))));
  }

}, (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = RoomView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUm9vbVZpZXcudHN4Il0sIm5hbWVzIjpbIkRFQlVHIiwiZGVidWdsb2ciLCJtc2ciLCJCUk9XU0VSX1NVUFBPUlRTX1NBTkRCT1giLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjb25zb2xlIiwibG9nIiwiYmluZCIsIlJvb21WaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInN0YXRlIiwicm9vbSIsImNoZWNrV2lkZ2V0cyIsInNldFN0YXRlIiwiaGFzUGlubmVkV2lkZ2V0cyIsIldpZGdldExheW91dFN0b3JlIiwiaW5zdGFuY2UiLCJnZXRDb250YWluZXJXaWRnZXRzIiwiQ29udGFpbmVyIiwiVG9wIiwibGVuZ3RoIiwic2hvd0FwcHMiLCJzaG91bGRTaG93QXBwcyIsInNob3dSZWFkUmVjZWlwdHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyb29tSWQiLCJpbml0aWFsIiwidW5tb3VudGVkIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsIm5ld1N0YXRlIiwicm9vbUFsaWFzIiwiZ2V0Um9vbUFsaWFzIiwicm9vbUxvYWRpbmciLCJpc1Jvb21Mb2FkaW5nIiwicm9vbUxvYWRFcnJvciIsImdldFJvb21Mb2FkRXJyb3IiLCJqb2luaW5nIiwiaXNKb2luaW5nIiwiaW5pdGlhbEV2ZW50SWQiLCJnZXRJbml0aWFsRXZlbnRJZCIsImlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQiLCJyZXBseVRvRXZlbnQiLCJnZXRRdW90aW5nRXZlbnQiLCJmb3J3YXJkaW5nRXZlbnQiLCJnZXRGb3J3YXJkaW5nRXZlbnQiLCJzaG91bGRQZWVrIiwibWF0cml4Q2xpZW50SXNSZWFkeSIsInNob3dpbmdQaW5uZWQiLCJ3YXNDb250ZXh0U3dpdGNoIiwiZ2V0V2FzQ29udGV4dFN3aXRjaCIsInN0b3BQZWVraW5nIiwiZ2V0Um9vbSIsIm9uUm9vbUxvYWRlZCIsInJvb21TY3JvbGxTdGF0ZSIsIlJvb21TY3JvbGxTdGF0ZVN0b3JlIiwiZ2V0U2Nyb2xsU3RhdGUiLCJmb2N1c3NlZEV2ZW50IiwiaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQiLCJwaXhlbE9mZnNldCIsInNlYXJjaFJlc3VsdHMiLCJzZXR1cFJvb20iLCJvbldpZGdldEVjaG9TdG9yZVVwZGF0ZSIsImxheW91dCIsInNob3dSaWdodFBhbmVsIiwiUmlnaHRQYW5lbFN0b3JlIiwiZ2V0U2hhcmVkSW5zdGFuY2UiLCJpc09wZW5Gb3JSb29tIiwiZXZlbnQiLCJDb250ZW50TWVzc2FnZXMiLCJzaGFyZWRJbnN0YW5jZSIsImdldEN1cnJlbnRVcGxvYWRzIiwicmV0dXJuVmFsdWUiLCJnZXRDYWxsRm9yUm9vbSIsImNhbGxTdGF0ZSIsImV2IiwiaGFuZGxlZCIsImFjdGlvbiIsImdldFJvb21BY3Rpb24iLCJSb29tQWN0aW9uIiwiRGlzbWlzc1JlYWRNYXJrZXIiLCJtZXNzYWdlUGFuZWwiLCJmb3JnZXRSZWFkTWFya2VyIiwianVtcFRvTGl2ZVRpbWVsaW5lIiwiSnVtcFRvT2xkZXN0VW5yZWFkIiwianVtcFRvUmVhZE1hcmtlciIsIlVwbG9hZEZpbGUiLCJkaXMiLCJkaXNwYXRjaCIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwicGF5bG9hZCIsImNoZWNrRGVza3RvcE5vdGlmaWNhdGlvbnMiLCJpbmplY3RTdGlja2VyIiwiZGF0YSIsImNvbnRlbnQiLCJ1cmwiLCJpbmZvIiwiZGVzY3JpcHRpb24iLCJuYW1lIiwic2VuZENvbnRlbnRMaXN0VG9Sb29tIiwiZmlsZSIsIkFjdGlvbiIsIlVwbG9hZFN0YXJ0ZWQiLCJVcGxvYWRGaW5pc2hlZCIsIlVwbG9hZENhbmNlbGVkIiwiZm9yY2VVcGRhdGUiLCJyb29tX2lkIiwiY2FsbCIsInNob3ciLCJvbkNhbmNlbFNlYXJjaENsaWNrIiwic2V0SW1tZWRpYXRlIiwiZGVmZXJyZWRfYWN0aW9uIiwiaXNJbml0aWFsU3luY0NvbXBsZXRlIiwib25Sb29tVmlld1N0b3JlVXBkYXRlIiwib25TZWFyY2hDbGljayIsInRvU3RhcnRPZlRpbWVsaW5lIiwicmVtb3ZlZCIsInRpbWVsaW5lIiwiZ2V0VGltZWxpbmVTZXQiLCJnZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQiLCJnZXRUeXBlIiwidXBkYXRlUHJldmlld1VybFZpc2liaWxpdHkiLCJ1cGRhdGVFMkVTdGF0dXMiLCJsaXZlRXZlbnQiLCJnZXRTZW5kZXIiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsImF0RW5kT2ZMaXZlVGltZWxpbmUiLCJudW1VbnJlYWRNZXNzYWdlcyIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJoYW5kbGVFZmZlY3RzIiwiaXNCZWluZ0RlY3J5cHRlZCIsIm5vdGlmU3RhdGUiLCJSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSIsImdldFJvb21TdGF0ZSIsImlzVW5yZWFkIiwiQ0hBVF9FRkZFQ1RTIiwiZm9yRWFjaCIsImVmZmVjdCIsImdldENvbnRlbnQiLCJlbW9qaXMiLCJtc2d0eXBlIiwibXNnVHlwZSIsImNvbW1hbmQiLCJjYW5SZXNldFRpbWVsaW5lIiwib24iLCJlbWlzc2lvbkZvclJvb20iLCJvbldpZGdldExheW91dENoYW5nZSIsImNhbGN1bGF0ZVBlZWtSdWxlcyIsImxvYWRNZW1iZXJzSWZKb2luZWQiLCJjYWxjdWxhdGVSZWNvbW1lbmRlZFZlcnNpb24iLCJ1cGRhdGVQZXJtaXNzaW9ucyIsIm9mZiIsImRldmljZSIsImN1cnJlbnRTdGF0ZSIsImdldE1lbWJlciIsInRydXN0U3RhdHVzIiwidHlwZSIsImNvbG9yU2NoZW1lIiwiVGludGVyIiwidGludCIsInByaW1hcnlfY29sb3IiLCJzZWNvbmRhcnlfY29sb3IiLCJtZW1iZXIiLCJ1cGRhdGVSb29tTWVtYmVycyIsIm1lbWJlcnNoaXAiLCJvbGRNZW1iZXJzaGlwIiwidXBkYXRlRE1TdGF0ZSIsImJhY2t3YXJkcyIsIlByb21pc2UiLCJyZXNvbHZlIiwibmV4dF9iYXRjaCIsInNlYXJjaFByb21pc2UiLCJoYW5kbGVTZWFyY2hSZXN1bHQiLCJpc0d1ZXN0IiwidGhlbiIsInNpZ25VcmwiLCJ0aHJlZXBpZEludml0ZSIsIm9wdHMiLCJpbnZpdGVTaWduVXJsIiwiX3R5cGUiLCJpc0F0RW5kT2ZMaXZlVGltZWxpbmUiLCJ1cGRhdGVUb3BVbnJlYWRNZXNzYWdlc0JhciIsImRyYWdDb3VudGVyIiwiZGF0YVRyYW5zZmVyIiwidHlwZXMiLCJpbmNsdWRlcyIsImRyYWdnaW5nRmlsZSIsImRyb3BFZmZlY3QiLCJmaWxlcyIsImZpcmUiLCJGb2N1c0NvbXBvc2VyIiwidGVybSIsInNjb3BlIiwic2VhcmNoVGVybSIsInNlYXJjaFNjb3BlIiwic2VhcmNoSGlnaGxpZ2h0cyIsInNlYXJjaFJlc3VsdHNQYW5lbCIsImN1cnJlbnQiLCJyZXNldFNjcm9sbFN0YXRlIiwic2VhcmNoSWQiLCJEYXRlIiwiZ2V0VGltZSIsIm5vd1Nob3dpbmdQaW5uZWQiLCJzZWFyY2hpbmciLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIlJPT01fREVWSUNFIiwidXBkYXRlVGludCIsInJlamVjdGluZyIsImxlYXZlIiwiZXJyb3IiLCJtZXNzYWdlIiwiSlNPTiIsInN0cmluZ2lmeSIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJyZWplY3RFcnJvciIsIm15TWVtYmVyIiwiZ2V0VXNlcklkIiwiaW52aXRlRXZlbnQiLCJldmVudHMiLCJpZ25vcmVkVXNlcnMiLCJnZXRJZ25vcmVkVXNlcnMiLCJwdXNoIiwic2V0SWdub3JlZFVzZXJzIiwiVmlld1Jvb21EaXJlY3RvcnkiLCJzaG93QmFyIiwiY2FuSnVtcFRvUmVhZE1hcmtlciIsInNob3dUb3BVbnJlYWRNZXNzYWdlc0JhciIsImF1eFBhbmVsTWF4SGVpZ2h0Iiwid2luZG93IiwiaW5uZXJIZWlnaHQiLCJmdWxsc2NyZWVuIiwiaXNNaWNyb3Bob25lTXV0ZWQiLCJzZXRNaWNyb3Bob25lTXV0ZWQiLCJpc0xvY2FsVmlkZW9NdXRlZCIsInNldExvY2FsVmlkZW9NdXRlZCIsInN0YXR1c0JhclZpc2libGUiLCJwYW5lbCIsImhhbmRsZVNjcm9sbEtleSIsInIiLCJvbGRSb29tIiwiZ2V0T2xkUm9vbSIsImxsTWVtYmVycyIsImhhc0xhenlMb2FkTWVtYmVyc0VuYWJsZWQiLCJwZWVrTG9hZGluZyIsIm1lbWJlcnNMb2FkZWQiLCJndWVzdHNDYW5Kb2luIiwiY2FuUGVlayIsImlzUGVla2luZyIsImF0RW5kT2ZMaXZlVGltZWxpbmVJbml0IiwiY2FuUmVhY3QiLCJjYW5SZXBseSIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwib25Sb29tIiwib25Sb29tVGltZWxpbmUiLCJvblJvb21OYW1lIiwib25Sb29tQWNjb3VudERhdGEiLCJvblJvb21TdGF0ZUV2ZW50cyIsIm9uUm9vbVN0YXRlTWVtYmVyIiwib25NeU1lbWJlcnNoaXAiLCJvbkFjY291bnREYXRhIiwib25LZXlCYWNrdXBTdGF0dXMiLCJvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQiLCJvblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkIiwib25Dcm9zc1NpZ25pbmdLZXlzQ2hhbmdlZCIsIm9uRXZlbnREZWNyeXB0ZWQiLCJvbkV2ZW50Iiwicm9vbVN0b3JlVG9rZW4iLCJhZGRMaXN0ZW5lciIsInJpZ2h0UGFuZWxTdG9yZVRva2VuIiwib25SaWdodFBhbmVsU3RvcmVVcGRhdGUiLCJXaWRnZXRFY2hvU3RvcmUiLCJVUERBVEVfRVZFTlQiLCJXaWRnZXRTdG9yZSIsIm9uV2lkZ2V0U3RvcmVVcGRhdGUiLCJzaG93UmVhZFJlY2VpcHRzV2F0Y2hSZWYiLCJ3YXRjaFNldHRpbmciLCJvblJlYWRSZWNlaXB0c0NoYW5nZSIsImxheW91dFdhdGNoZXJSZWYiLCJvbkxheW91dENoYW5nZSIsImdldFBlcm1hbGlua0NyZWF0b3JGb3JSb29tIiwicGVybWFsaW5rQ3JlYXRvcnMiLCJSb29tUGVybWFsaW5rQ3JlYXRvciIsInN0YXJ0IiwibG9hZCIsInN0b3BBbGxQZXJtYWxpbmtDcmVhdG9ycyIsIk9iamVjdCIsImtleXMiLCJzdG9wIiwicGVla0luUm9vbSIsImNhdGNoIiwiZXJyIiwiZXJyY29kZSIsImhpZGVXaWRnZXREcmF3ZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiaXNNYW51YWxseVNob3duIiwid2lkZ2V0cyIsImNvbXBvbmVudERpZE1vdW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uUGFnZVVubG9hZCIsInJlc2l6ZU5vdGlmaWVyIiwib25SZXNpemUiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJjb21wb25lbnREaWRVcGRhdGUiLCJyb29tVmlldyIsIm9uZHJvcCIsIm9uRHJvcCIsIm9uRHJhZ092ZXIiLCJvbkRyYWdFbnRlciIsIm9uRHJhZ0xlYXZlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJzZXRTY3JvbGxTdGF0ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmUiLCJ1bndhdGNoU2V0dGluZyIsImNhbmNlbFBlbmRpbmdDYWxsIiwidXBncmFkZVJlY29tbWVuZGF0aW9uIiwiZ2V0UmVjb21tZW5kZWRWZXJzaW9uIiwiZ2V0TXlNZW1iZXJzaGlwIiwibG9hZE1lbWJlcnNJZk5lZWRlZCIsImVycm9yTWVzc2FnZSIsImd1ZXN0QWNjZXNzRXZlbnQiLCJnZXRTdGF0ZUV2ZW50cyIsImd1ZXN0X2FjY2VzcyIsImhpc3RvcnlWaXNpYmlsaXR5IiwiaGlzdG9yeV92aXNpYmlsaXR5Iiwia2V5IiwiaXNSb29tRW5jcnlwdGVkIiwic2hvd1VybFByZXZpZXciLCJpc0NyeXB0b0VuYWJsZWQiLCJlMmVTdGF0dXMiLCJFMkVTdGF0dXMiLCJXYXJuaW5nIiwibWUiLCJtYXlTZW5kRXZlbnQiLCJtYXlTZW5kTWVzc2FnZSIsIm1lbWJlckNvdW50IiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJnZXRJbnZpdGVkTWVtYmVyQ291bnQiLCJOb3RpZmllciIsInNob3VsZFNob3dQcm9tcHQiLCJkbUludml0ZXIiLCJnZXRETUludml0ZXIiLCJSb29tcyIsInNldERNUm9vbSIsInRleHQiLCJzZW5kU3RpY2tlckNvbnRlbnRUb1Jvb20iLCJ1bmRlZmluZWQiLCJsb2NhbFNlYXJjaElkIiwic2VhcmNoSW5Qcm9ncmVzcyIsInJlc3VsdHMiLCJoaWdobGlnaHRzIiwiaW5kZXhPZiIsImNvbmNhdCIsInNvcnQiLCJhIiwiYiIsImZpbmFsbHkiLCJnZXRTZWFyY2hSZXN1bHRUaWxlcyIsIlNlYXJjaFJlc3VsdFRpbGUiLCJTcGlubmVyIiwicmV0Iiwib25IZWlnaHRDaGFuZ2VkIiwic2Nyb2xsUGFuZWwiLCJjaGVja1Njcm9sbCIsImxhc3RSb29tSWQiLCJpIiwicmVzdWx0IiwibXhFdiIsImdldEV2ZW50IiwiZ2V0SWQiLCJyZXN1bHRMaW5rIiwic2Nyb2xsU3RhdGUiLCJzdHVja0F0Qm90dG9tIiwidHJhY2tlZFNjcm9sbFRva2VuIiwiQ2FsbEhhbmRsZXIiLCJjcmVhdGVFdmVudCIsImdldEhpZGRlbkhpZ2hsaWdodENvdW50IiwiZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQiLCJyZW5kZXIiLCJsb2FkaW5nIiwicHJldmlld0xvYWRpbmciLCJvb2JEYXRhIiwiaW52aXRlck5hbWUiLCJpbnZpdGVkRW1haWwiLCJ0b0VtYWlsIiwib25Kb2luQnV0dG9uQ2xpY2tlZCIsIm9uRm9yZ2V0Q2xpY2siLCJvblJlamVjdFRocmVlcGlkSW52aXRlQnV0dG9uQ2xpY2tlZCIsIm15TWVtYmVyc2hpcCIsImlzU3BhY2VSb29tIiwibXlVc2VySWQiLCJzZW5kZXIiLCJvblJlamVjdEJ1dHRvbkNsaWNrZWQiLCJvblJlamVjdEFuZElnbm9yZUNsaWNrIiwiZmlsZURyb3BUYXJnZXQiLCJyZXF1aXJlIiwiYWN0aXZlQ2FsbCIsInNjcm9sbGhlYWRlckNsYXNzZXMiLCJteF9Sb29tVmlld19zY3JvbGxoZWFkZXIiLCJzdGF0dXNCYXIiLCJpc1N0YXR1c0FyZWFFeHBhbmRlZCIsIlVwbG9hZEJhciIsIlJvb21TdGF0dXNCYXIiLCJvbkludml0ZUJ1dHRvbkNsaWNrIiwib25TdGF0dXNCYXJWaXNpYmxlIiwib25TdGF0dXNCYXJIaWRkZW4iLCJyb29tVmVyc2lvblJlY29tbWVuZGF0aW9uIiwic2hvd1Jvb21VcGdyYWRlQmFyIiwibmVlZHNVcGdyYWRlIiwidXNlck1heVVwZ3JhZGVSb29tIiwiaGlkZGVuSGlnaGxpZ2h0Q291bnQiLCJhdXgiLCJwcmV2aWV3QmFyIiwiaGlkZUNhbmNlbCIsIm9uQ2FuY2VsQ2xpY2siLCJvblNlYXJjaCIsIm9uUGlubmVkQ2xpY2siLCJvbkhpZGRlbkhpZ2hsaWdodHNDbGljayIsImNvdW50IiwianVzdENyZWF0ZWRPcHRzIiwiYXV4UGFuZWwiLCJtZXNzYWdlQ29tcG9zZXIiLCJzZWFyY2hJbmZvIiwiY2FuU3BlYWsiLCJNZXNzYWdlQ29tcG9zZXIiLCJzZWFyY2hDb3VudCIsImhpZGVNZXNzYWdlUGFuZWwiLCJvblNlYXJjaFJlc3VsdHNGaWxsUmVxdWVzdCIsInNob3VsZEhpZ2hsaWdodCIsImhpZ2hsaWdodGVkRXZlbnRJZCIsIm1lc3NhZ2VQYW5lbENsYXNzTmFtZXMiLCJMYXlvdXQiLCJJUkMiLCJHcm91cCIsImdhdGhlclRpbWVsaW5lUGFuZWxSZWYiLCJvbk1lc3NhZ2VMaXN0U2Nyb2xsIiwidG9wVW5yZWFkTWVzc2FnZXNCYXIiLCJUb3BVbnJlYWRNZXNzYWdlc0JhciIsImp1bXBUb0JvdHRvbSIsIkp1bXBUb0JvdHRvbUJ1dHRvbiIsInN0YXR1c0JhckFyZWFDbGFzcyIsInJpZ2h0UGFuZWwiLCJ0aW1lbGluZUNsYXNzZXMiLCJteF9Sb29tVmlld190aW1lbGluZV9ycl9lbmFibGVkIiwibWFpbkNsYXNzZXMiLCJteF9Sb29tVmlld19pbkNhbGwiLCJCb29sZWFuIiwic2hvd0NoYXRFZmZlY3RzIiwib25SZWFjdEtleURvd24iLCJvZmZzZXRXaWR0aCIsIm9uU2V0dGluZ3NDbGljayIsIm9uTGVhdmVDbGljayIsIm9uQXBwc0NsaWNrIiwib25DYWxsUGxhY2VkIiwiTWF0cml4Q2xpZW50Q29udGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQXVCQTs7QUFDQTs7QUFLQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7OztBQUVBLE1BQU1BLEtBQUssR0FBRyxLQUFkOztBQUNBLElBQUlDLFFBQVEsR0FBRyxVQUFTQztBQUFUO0FBQUEsRUFBc0IsQ0FBRSxDQUF2Qzs7QUFFQSxNQUFNQyx3QkFBd0IsSUFBRyxhQUFhQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBaEIsQ0FBOUI7O0FBRUEsSUFBSUwsS0FBSixFQUFXO0FBQ1A7QUFDQUMsRUFBQUEsUUFBUSxHQUFHSyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsSUFBWixDQUFpQkYsT0FBakIsQ0FBWDtBQUNIOztBQTlGRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QWYsTUFESixFQUVLekMsU0FGTCxDQURKLENBVEosRUFlS2EsVUFmTCxFQWdCS1MsZUFoQkwsQ0FESixDQWpCSixDQUpKLENBREosQ0FESjtBQStDSDs7QUFwNERpRSxDLHdEQWU3Q2lDLDRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gVE9ETzogVGhpcyBjb21wb25lbnQgaXMgZW5vcm1vdXMhIFRoZXJlJ3Mgc2V2ZXJhbCB0aGluZ3Mgd2hpY2ggY291bGQgc3RhbmQtYWxvbmU6XG4vLyAgLSBTZWFyY2ggcmVzdWx0cyBjb21wb25lbnRcbi8vICAtIERyYWcgYW5kIGRyb3BcblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBFdmVudFN1YnNjcmlwdGlvbiB9IGZyb20gXCJmYmVtaXR0ZXJcIjtcblxuaW1wb3J0IHNob3VsZEhpZGVFdmVudCBmcm9tICcuLi8uLi9zaG91bGRIaWRlRXZlbnQnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgUm9vbVBlcm1hbGlua0NyZWF0b3IgfSBmcm9tICcuLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3MnO1xuaW1wb3J0IFJlc2l6ZU5vdGlmaWVyIGZyb20gJy4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyJztcbmltcG9ydCBDb250ZW50TWVzc2FnZXMgZnJvbSAnLi4vLi4vQ29udGVudE1lc3NhZ2VzJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi9Nb2RhbCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vaW5kZXgnO1xuaW1wb3J0IENhbGxIYW5kbGVyLCB7IFBsYWNlQ2FsbFR5cGUgfSBmcm9tICcuLi8uLi9DYWxsSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgVGludGVyIGZyb20gJy4uLy4uL1RpbnRlcic7XG5pbXBvcnQgcmF0ZUxpbWl0ZWRGdW5jIGZyb20gJy4uLy4uL3JhdGVsaW1pdGVkZnVuYyc7XG5pbXBvcnQgKiBhcyBSb29tcyBmcm9tICcuLi8uLi9Sb29tcyc7XG5pbXBvcnQgZXZlbnRTZWFyY2gsIHsgc2VhcmNoUGFnaW5hdGlvbiB9IGZyb20gJy4uLy4uL1NlYXJjaGluZyc7XG5pbXBvcnQgTWFpblNwbGl0IGZyb20gJy4vTWFpblNwbGl0JztcbmltcG9ydCBSaWdodFBhbmVsIGZyb20gJy4vUmlnaHRQYW5lbCc7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tICcuLi8uLi9zdG9yZXMvUm9vbVZpZXdTdG9yZSc7XG5pbXBvcnQgUm9vbVNjcm9sbFN0YXRlU3RvcmUgZnJvbSAnLi4vLi4vc3RvcmVzL1Jvb21TY3JvbGxTdGF0ZVN0b3JlJztcbmltcG9ydCBXaWRnZXRFY2hvU3RvcmUgZnJvbSAnLi4vLi4vc3RvcmVzL1dpZGdldEVjaG9TdG9yZSc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtMYXlvdXR9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9MYXlvdXRcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlXCI7XG5pbXBvcnQgeyBoYXZlVGlsZUZvckV2ZW50IH0gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL0V2ZW50VGlsZVwiO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gXCIuLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IEUyRVN0YXR1cywgc2hpZWxkU3RhdHVzRm9yUm9vbSB9IGZyb20gJy4uLy4uL3V0aWxzL1NoaWVsZFV0aWxzJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7IElNYXRyaXhDbGllbnRDcmVkcyB9IGZyb20gXCIuLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBTY3JvbGxQYW5lbCBmcm9tIFwiLi9TY3JvbGxQYW5lbFwiO1xuaW1wb3J0IFRpbWVsaW5lUGFuZWwgZnJvbSBcIi4vVGltZWxpbmVQYW5lbFwiO1xuaW1wb3J0IEVycm9yQm91bmRhcnkgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0Vycm9yQm91bmRhcnlcIjtcbmltcG9ydCBSb29tUHJldmlld0JhciBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbVByZXZpZXdCYXJcIjtcbmltcG9ydCBGb3J3YXJkTWVzc2FnZSBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvRm9yd2FyZE1lc3NhZ2VcIjtcbmltcG9ydCBTZWFyY2hCYXIgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1NlYXJjaEJhclwiO1xuaW1wb3J0IFJvb21VcGdyYWRlV2FybmluZ0JhciBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbVVwZ3JhZGVXYXJuaW5nQmFyXCI7XG5pbXBvcnQgUGlubmVkRXZlbnRzUGFuZWwgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL1Bpbm5lZEV2ZW50c1BhbmVsXCI7XG5pbXBvcnQgQXV4UGFuZWwgZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL0F1eFBhbmVsXCI7XG5pbXBvcnQgUm9vbUhlYWRlciBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUm9vbUhlYWRlclwiO1xuaW1wb3J0IHsgWE9SIH0gZnJvbSBcIi4uLy4uL0B0eXBlcy9jb21tb25cIjtcbmltcG9ydCB7IElUaHJlZXBpZEludml0ZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZVwiO1xuaW1wb3J0IEVmZmVjdHNPdmVybGF5IGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9FZmZlY3RzT3ZlcmxheVwiO1xuaW1wb3J0IHsgY29udGFpbnNFbW9qaSB9IGZyb20gJy4uLy4uL2VmZmVjdHMvdXRpbHMnO1xuaW1wb3J0IHsgQ0hBVF9FRkZFQ1RTIH0gZnJvbSAnLi4vLi4vZWZmZWN0cyc7XG5pbXBvcnQgeyBDYWxsU3RhdGUsIE1hdHJpeENhbGwgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGxcIjtcbmltcG9ydCBXaWRnZXRTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcbmltcG9ydCBOb3RpZmllciBmcm9tIFwiLi4vLi4vTm90aWZpZXJcIjtcbmltcG9ydCB7IHNob3dUb2FzdCBhcyBzaG93Tm90aWZpY2F0aW9uc1RvYXN0IH0gZnJvbSBcIi4uLy4uL3RvYXN0cy9EZXNrdG9wTm90aWZpY2F0aW9uc1RvYXN0XCI7XG5pbXBvcnQgeyBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IHsgQ29udGFpbmVyLCBXaWRnZXRMYXlvdXRTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRMYXlvdXRTdG9yZVwiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyLCBSb29tQWN0aW9uIH0gZnJvbSAnLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyJztcbmltcG9ydCB7IG9iamVjdEhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vdXRpbHMvb2JqZWN0c1wiO1xuaW1wb3J0IFNwYWNlUm9vbVZpZXcgZnJvbSBcIi4vU3BhY2VSb29tVmlld1wiO1xuaW1wb3J0IHsgSU9wdHMgfSBmcm9tIFwiLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmNvbnN0IERFQlVHID0gZmFsc2U7XG5sZXQgZGVidWdsb2cgPSBmdW5jdGlvbihtc2c6IHN0cmluZykge307XG5cbmNvbnN0IEJST1dTRVJfU1VQUE9SVFNfU0FOREJPWCA9ICdzYW5kYm94JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblxuaWYgKERFQlVHKSB7XG4gICAgLy8gdXNpbmcgYmluZCBtZWFucyB0aGF0IHdlIGdldCB0byBrZWVwIHVzZWZ1bCBsaW5lIG51bWJlcnMgaW4gdGhlIGNvbnNvbGVcbiAgICBkZWJ1Z2xvZyA9IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHRocmVlcGlkSW52aXRlOiBJVGhyZWVwaWRJbnZpdGUsXG5cbiAgICAvLyBBbnkgZGF0YSBhYm91dCB0aGUgcm9vbSB0aGF0IHdvdWxkIG5vcm1hbGx5IGNvbWUgZnJvbSB0aGUgaG9tZXNlcnZlclxuICAgIC8vIGJ1dCBoYXMgYmVlbiBwYXNzZWQgb3V0LW9mLWJhbmQsIGVnLiB0aGUgcm9vbSBuYW1lIGFuZCBhdmF0YXIgVVJMXG4gICAgLy8gZnJvbSBhbiBlbWFpbCBpbnZpdGUgKGEgd29ya2Fyb3VuZCBmb3IgdGhlIGZhY3QgdGhhdCB3ZSBjYW4ndFxuICAgIC8vIGdldCB0aGlzIGluZm9ybWF0aW9uIGZyb20gdGhlIEhTIHVzaW5nIGFuIGVtYWlsIGludml0ZSkuXG4gICAgLy8gRmllbGRzOlxuICAgIC8vICAqIG5hbWUgKHN0cmluZykgVGhlIHJvb20ncyBuYW1lXG4gICAgLy8gICogYXZhdGFyVXJsIChzdHJpbmcpIFRoZSBteGM6Ly8gYXZhdGFyIFVSTCBmb3IgdGhlIHJvb21cbiAgICAvLyAgKiBpbnZpdGVyTmFtZSAoc3RyaW5nKSBUaGUgZGlzcGxheSBuYW1lIG9mIHRoZSBwZXJzb24gd2hvXG4gICAgLy8gICogICAgICAgICAgICAgICAgICAgICAgaW52aXRlZCB1cyB0byB0aGUgcm9vbVxuICAgIG9vYkRhdGE/OiB7XG4gICAgICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICAgICAgaW52aXRlck5hbWU/OiBzdHJpbmc7XG4gICAgfTtcblxuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICBqdXN0Q3JlYXRlZE9wdHM/OiBJT3B0cztcblxuICAgIC8vIENhbGxlZCB3aXRoIHRoZSBjcmVkZW50aWFscyBvZiBhIHJlZ2lzdGVyZWQgdXNlciAoaWYgdGhleSB3ZXJlIGEgUk9VIHRoYXQgdHJhbnNpdGlvbmVkIHRvIFBXTFUpXG4gICAgb25SZWdpc3RlcmVkPyhjcmVkZW50aWFsczogSU1hdHJpeENsaWVudENyZWRzKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RhdGUge1xuICAgIHJvb20/OiBSb29tO1xuICAgIHJvb21JZD86IHN0cmluZztcbiAgICByb29tQWxpYXM/OiBzdHJpbmc7XG4gICAgcm9vbUxvYWRpbmc6IGJvb2xlYW47XG4gICAgcGVla0xvYWRpbmc6IGJvb2xlYW47XG4gICAgc2hvdWxkUGVlazogYm9vbGVhbjtcbiAgICAvLyB1c2VkIHRvIHRyaWdnZXIgYSByZXJlbmRlciBpbiBUaW1lbGluZVBhbmVsIG9uY2UgdGhlIG1lbWJlcnMgYXJlIGxvYWRlZCxcbiAgICAvLyBzbyBSUiBhcmUgcmVuZGVyZWQgYWdhaW4gKG5vdyB3aXRoIHRoZSBtZW1iZXJzIGF2YWlsYWJsZSksIC4uLlxuICAgIG1lbWJlcnNMb2FkZWQ6IGJvb2xlYW47XG4gICAgLy8gVGhlIGV2ZW50IHRvIGJlIHNjcm9sbGVkIHRvIGluaXRpYWxseVxuICAgIGluaXRpYWxFdmVudElkPzogc3RyaW5nO1xuICAgIC8vIFRoZSBvZmZzZXQgaW4gcGl4ZWxzIGZyb20gdGhlIGV2ZW50IHdpdGggd2hpY2ggdG8gc2Nyb2xsIHZlcnRpY2FsbHlcbiAgICBpbml0aWFsRXZlbnRQaXhlbE9mZnNldD86IG51bWJlcjtcbiAgICAvLyBXaGV0aGVyIHRvIGhpZ2hsaWdodCB0aGUgZXZlbnQgc2Nyb2xsZWQgdG9cbiAgICBpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkPzogYm9vbGVhbjtcbiAgICByZXBseVRvRXZlbnQ/OiBNYXRyaXhFdmVudDtcbiAgICBmb3J3YXJkaW5nRXZlbnQ/OiBNYXRyaXhFdmVudDtcbiAgICBudW1VbnJlYWRNZXNzYWdlczogbnVtYmVyO1xuICAgIGRyYWdnaW5nRmlsZTogYm9vbGVhbjtcbiAgICBzZWFyY2hpbmc6IGJvb2xlYW47XG4gICAgc2VhcmNoVGVybT86IHN0cmluZztcbiAgICBzZWFyY2hTY29wZT86IFwiQWxsXCIgfCBcIlJvb21cIjtcbiAgICBzZWFyY2hSZXN1bHRzPzogWE9SPHt9LCB7XG4gICAgICAgIGNvdW50OiBudW1iZXI7XG4gICAgICAgIGhpZ2hsaWdodHM6IHN0cmluZ1tdO1xuICAgICAgICByZXN1bHRzOiBNYXRyaXhFdmVudFtdO1xuICAgICAgICBuZXh0X2JhdGNoOiBzdHJpbmc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgfT47XG4gICAgc2VhcmNoSGlnaGxpZ2h0cz86IHN0cmluZ1tdO1xuICAgIHNlYXJjaEluUHJvZ3Jlc3M/OiBib29sZWFuO1xuICAgIGNhbGxTdGF0ZT86IENhbGxTdGF0ZTtcbiAgICBndWVzdHNDYW5Kb2luOiBib29sZWFuO1xuICAgIGNhblBlZWs6IGJvb2xlYW47XG4gICAgc2hvd0FwcHM6IGJvb2xlYW47XG4gICAgaXNQZWVraW5nOiBib29sZWFuO1xuICAgIHNob3dpbmdQaW5uZWQ6IGJvb2xlYW47XG4gICAgc2hvd1JlYWRSZWNlaXB0czogYm9vbGVhbjtcbiAgICBzaG93UmlnaHRQYW5lbDogYm9vbGVhbjtcbiAgICAvLyBlcnJvciBvYmplY3QsIGFzIGZyb20gdGhlIG1hdHJpeCBjbGllbnQvc2VydmVyIEFQSVxuICAgIC8vIElmIHdlIGZhaWxlZCB0byBsb2FkIGluZm9ybWF0aW9uIGFib3V0IHRoZSByb29tLFxuICAgIC8vIHN0b3JlIHRoZSBlcnJvciBoZXJlLlxuICAgIHJvb21Mb2FkRXJyb3I/OiBFcnJvcjtcbiAgICAvLyBIYXZlIHdlIHNlbnQgYSByZXF1ZXN0IHRvIGpvaW4gdGhlIHJvb20gdGhhdCB3ZSdyZSB3YWl0aW5nIHRvIGNvbXBsZXRlP1xuICAgIGpvaW5pbmc6IGJvb2xlYW47XG4gICAgLy8gdGhpcyBpcyB0cnVlIGlmIHdlIGFyZSBmdWxseSBzY3JvbGxlZC1kb3duLCBhbmQgYXJlIGxvb2tpbmcgYXRcbiAgICAvLyB0aGUgZW5kIG9mIHRoZSBsaXZlIHRpbWVsaW5lLiBJdCBoYXMgdGhlIGVmZmVjdCBvZiBoaWRpbmcgdGhlXG4gICAgLy8gJ3Njcm9sbCB0byBib3R0b20nIGtub2IsIGFtb25nIGEgY291cGxlIG9mIG90aGVyIHRoaW5ncy5cbiAgICBhdEVuZE9mTGl2ZVRpbWVsaW5lOiBib29sZWFuO1xuICAgIC8vIHVzZWQgYnkgY29tcG9uZW50RGlkVXBkYXRlIHRvIGF2b2lkIHVubmVjZXNzYXJ5IGNoZWNrc1xuICAgIGF0RW5kT2ZMaXZlVGltZWxpbmVJbml0OiBib29sZWFuO1xuICAgIHNob3dUb3BVbnJlYWRNZXNzYWdlc0JhcjogYm9vbGVhbjtcbiAgICBhdXhQYW5lbE1heEhlaWdodD86IG51bWJlcjtcbiAgICBzdGF0dXNCYXJWaXNpYmxlOiBib29sZWFuO1xuICAgIC8vIFdlIGxvYWQgdGhpcyBsYXRlciBieSBhc2tpbmcgdGhlIGpzLXNkayB0byBzdWdnZXN0IGEgdmVyc2lvbiBmb3IgdXMuXG4gICAgLy8gVGhpcyBvYmplY3QgaXMgdGhlIHJlc3VsdCBvZiBSb29tI2dldFJlY29tbWVuZGVkVmVyc2lvbigpXG4gICAgdXBncmFkZVJlY29tbWVuZGF0aW9uPzoge1xuICAgICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICAgIG5lZWRzVXBncmFkZTogYm9vbGVhbjtcbiAgICAgICAgdXJnZW50OiBib29sZWFuO1xuICAgIH07XG4gICAgY2FuUmVhY3Q6IGJvb2xlYW47XG4gICAgY2FuUmVwbHk6IGJvb2xlYW47XG4gICAgbGF5b3V0OiBMYXlvdXQ7XG4gICAgbWF0cml4Q2xpZW50SXNSZWFkeTogYm9vbGVhbjtcbiAgICBzaG93VXJsUHJldmlldz86IGJvb2xlYW47XG4gICAgZTJlU3RhdHVzPzogRTJFU3RhdHVzO1xuICAgIHJlamVjdGluZz86IGJvb2xlYW47XG4gICAgcmVqZWN0RXJyb3I/OiBFcnJvcjtcbiAgICBoYXNQaW5uZWRXaWRnZXRzPzogYm9vbGVhbjtcbiAgICBkcmFnQ291bnRlcjogbnVtYmVyO1xuICAgIC8vIHdoZXRoZXIgb3Igbm90IGEgc3BhY2VzIGNvbnRleHQgc3dpdGNoIGJyb3VnaHQgdXMgaGVyZSxcbiAgICAvLyBpZiBpdCBkaWQgd2UgZG9uJ3Qgd2FudCB0aGUgcm9vbSB0byBiZSBtYXJrZWQgYXMgcmVhZCBhcyBzb29uIGFzIGl0IGlzIGxvYWRlZC5cbiAgICB3YXNDb250ZXh0U3dpdGNoPzogYm9vbGVhbjtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5Sb29tVmlld1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJvb21TdG9yZVRva2VuOiBFdmVudFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJpZ2h0UGFuZWxTdG9yZVRva2VuOiBFdmVudFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNob3dSZWFkUmVjZWlwdHNXYXRjaFJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbGF5b3V0V2F0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSB1bm1vdW50ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHBlcm1hbGlua0NyZWF0b3JzOiBSZWNvcmQ8c3RyaW5nLCBSb29tUGVybWFsaW5rQ3JlYXRvcj4gPSB7fTtcbiAgICBwcml2YXRlIHNlYXJjaElkOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIHJvb21WaWV3ID0gY3JlYXRlUmVmPEhUTUxFbGVtZW50PigpO1xuICAgIHByaXZhdGUgc2VhcmNoUmVzdWx0c1BhbmVsID0gY3JlYXRlUmVmPFNjcm9sbFBhbmVsPigpO1xuICAgIHByaXZhdGUgbWVzc2FnZVBhbmVsOiBUaW1lbGluZVBhbmVsO1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICBjb25zdCBsbE1lbWJlcnMgPSB0aGlzLmNvbnRleHQuaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcm9vbUlkOiBudWxsLFxuICAgICAgICAgICAgcm9vbUxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBwZWVrTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBzaG91bGRQZWVrOiB0cnVlLFxuICAgICAgICAgICAgbWVtYmVyc0xvYWRlZDogIWxsTWVtYmVycyxcbiAgICAgICAgICAgIG51bVVucmVhZE1lc3NhZ2VzOiAwLFxuICAgICAgICAgICAgZHJhZ2dpbmdGaWxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlYXJjaGluZzogZmFsc2UsXG4gICAgICAgICAgICBzZWFyY2hSZXN1bHRzOiBudWxsLFxuICAgICAgICAgICAgY2FsbFN0YXRlOiBudWxsLFxuICAgICAgICAgICAgZ3Vlc3RzQ2FuSm9pbjogZmFsc2UsXG4gICAgICAgICAgICBjYW5QZWVrOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dBcHBzOiBmYWxzZSxcbiAgICAgICAgICAgIGlzUGVla2luZzogZmFsc2UsXG4gICAgICAgICAgICBzaG93aW5nUGlubmVkOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dSZWFkUmVjZWlwdHM6IHRydWUsXG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCkuaXNPcGVuRm9yUm9vbSxcbiAgICAgICAgICAgIGpvaW5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgYXRFbmRPZkxpdmVUaW1lbGluZTogdHJ1ZSxcbiAgICAgICAgICAgIGF0RW5kT2ZMaXZlVGltZWxpbmVJbml0OiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dUb3BVbnJlYWRNZXNzYWdlc0JhcjogZmFsc2UsXG4gICAgICAgICAgICBzdGF0dXNCYXJWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNhblJlYWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhblJlcGx5OiBmYWxzZSxcbiAgICAgICAgICAgIGxheW91dDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxheW91dFwiKSxcbiAgICAgICAgICAgIG1hdHJpeENsaWVudElzUmVhZHk6IHRoaXMuY29udGV4dCAmJiB0aGlzLmNvbnRleHQuaXNJbml0aWFsU3luY0NvbXBsZXRlKCksXG4gICAgICAgICAgICBkcmFnQ291bnRlcjogMCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIlJvb21cIiwgdGhpcy5vblJvb20pO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJSb29tLnRpbWVsaW5lXCIsIHRoaXMub25Sb29tVGltZWxpbmUpO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJSb29tLm5hbWVcIiwgdGhpcy5vblJvb21OYW1lKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiUm9vbS5hY2NvdW50RGF0YVwiLCB0aGlzLm9uUm9vbUFjY291bnREYXRhKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdGhpcy5vblJvb21TdGF0ZU1lbWJlcik7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIlJvb20ubXlNZW1iZXJzaGlwXCIsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJhY2NvdW50RGF0YVwiLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJjcnlwdG8ua2V5QmFja3VwU3RhdHVzXCIsIHRoaXMub25LZXlCYWNrdXBTdGF0dXMpO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJkZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkXCIsIHRoaXMub25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwidXNlclRydXN0U3RhdHVzQ2hhbmdlZFwiLCB0aGlzLm9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQpO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJjcm9zc1NpZ25pbmcua2V5c0NoYW5nZWRcIiwgdGhpcy5vbkNyb3NzU2lnbmluZ0tleXNDaGFuZ2VkKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiRXZlbnQuZGVjcnlwdGVkXCIsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcImV2ZW50XCIsIHRoaXMub25FdmVudCk7XG4gICAgICAgIC8vIFN0YXJ0IGxpc3RlbmluZyBmb3IgUm9vbVZpZXdTdG9yZSB1cGRhdGVzXG4gICAgICAgIHRoaXMucm9vbVN0b3JlVG9rZW4gPSBSb29tVmlld1N0b3JlLmFkZExpc3RlbmVyKHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKTtcbiAgICAgICAgdGhpcy5yaWdodFBhbmVsU3RvcmVUb2tlbiA9IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLmFkZExpc3RlbmVyKHRoaXMub25SaWdodFBhbmVsU3RvcmVVcGRhdGUpO1xuXG4gICAgICAgIFdpZGdldEVjaG9TdG9yZS5vbihVUERBVEVfRVZFTlQsIHRoaXMub25XaWRnZXRFY2hvU3RvcmVVcGRhdGUpO1xuICAgICAgICBXaWRnZXRTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMub25XaWRnZXRTdG9yZVVwZGF0ZSk7XG5cbiAgICAgICAgdGhpcy5zaG93UmVhZFJlY2VpcHRzV2F0Y2hSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcInNob3dSZWFkUmVjZWlwdHNcIiwgbnVsbCxcbiAgICAgICAgICAgIHRoaXMub25SZWFkUmVjZWlwdHNDaGFuZ2UpO1xuICAgICAgICB0aGlzLmxheW91dFdhdGNoZXJSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcImxheW91dFwiLCBudWxsLCB0aGlzLm9uTGF5b3V0Q2hhbmdlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV2lkZ2V0U3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tXaWRnZXRzKHRoaXMuc3RhdGUucm9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrV2lkZ2V0cyA9IChyb29tKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGFzUGlubmVkV2lkZ2V0czogV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2UuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBDb250YWluZXIuVG9wKS5sZW5ndGggPiAwLFxuICAgICAgICAgICAgc2hvd0FwcHM6IHRoaXMuc2hvdWxkU2hvd0FwcHMocm9vbSksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVhZFJlY2VpcHRzQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3dSZWFkUmVjZWlwdHM6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93UmVhZFJlY2VpcHRzXCIsIHRoaXMuc3RhdGUucm9vbUlkKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tVmlld1N0b3JlVXBkYXRlID0gKGluaXRpYWw/OiBib29sZWFuKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpbml0aWFsICYmIHRoaXMuc3RhdGUucm9vbUlkICE9PSBSb29tVmlld1N0b3JlLmdldFJvb21JZCgpKSB7XG4gICAgICAgICAgICAvLyBSb29tVmlldyBleHBsaWNpdGx5IGRvZXMgbm90IHN1cHBvcnQgY2hhbmdpbmcgd2hhdCByb29tXG4gICAgICAgICAgICAvLyBpcyBiZWluZyB2aWV3ZWQ6IGluc3RlYWQgaXQgc2hvdWxkIGp1c3QgYmUgcmUtbW91bnRlZCB3aGVuXG4gICAgICAgICAgICAvLyBzd2l0Y2hpbmcgcm9vbXMuIFRoZXJlZm9yZSwgaWYgdGhlIHJvb20gSUQgY2hhbmdlcywgd2VcbiAgICAgICAgICAgIC8vIGlnbm9yZSB0aGlzLiBXZSBlaXRoZXIgbmVlZCB0byBkbyB0aGlzIG9yIGFkZCBjb2RlIHRvIGhhbmRsZVxuICAgICAgICAgICAgLy8gc2F2aW5nIHRoZSBzY3JvbGwgcG9zaXRpb24gKG90aGVyd2lzZSB3ZSBlbmQgdXAgc2F2aW5nIHRoZVxuICAgICAgICAgICAgLy8gc2Nyb2xsIHBvc2l0aW9uIGFnYWluc3QgdGhlIHdyb25nIHJvb20pLlxuXG4gICAgICAgICAgICAvLyBHaXZlbiB0aGF0IGRvaW5nIHRoZSBzZXRTdGF0ZSBoZXJlIHdvdWxkIGNhdXNlIGEgYnVuY2ggb2ZcbiAgICAgICAgICAgIC8vIHVubmVjZXNzYXJ5IHdvcmssIHdlIGp1c3QgaWdub3JlIHRoZSBjaGFuZ2Ugc2luY2Ugd2Uga25vd1xuICAgICAgICAgICAgLy8gdGhhdCBpZiB0aGUgY3VycmVudCByb29tIElEIGhhcyBjaGFuZ2VkIGZyb20gd2hhdCB3ZSB0aG91Z2h0XG4gICAgICAgICAgICAvLyBpdCB3YXMsIGl0IG1lYW5zIHdlJ3JlIGFib3V0IHRvIGJlIHVubW91bnRlZC5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb21JZCA9IFJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCk7XG5cbiAgICAgICAgY29uc3QgbmV3U3RhdGU6IFBpY2s8SVN0YXRlLCBhbnk+ID0ge1xuICAgICAgICAgICAgcm9vbUlkLFxuICAgICAgICAgICAgcm9vbUFsaWFzOiBSb29tVmlld1N0b3JlLmdldFJvb21BbGlhcygpLFxuICAgICAgICAgICAgcm9vbUxvYWRpbmc6IFJvb21WaWV3U3RvcmUuaXNSb29tTG9hZGluZygpLFxuICAgICAgICAgICAgcm9vbUxvYWRFcnJvcjogUm9vbVZpZXdTdG9yZS5nZXRSb29tTG9hZEVycm9yKCksXG4gICAgICAgICAgICBqb2luaW5nOiBSb29tVmlld1N0b3JlLmlzSm9pbmluZygpLFxuICAgICAgICAgICAgaW5pdGlhbEV2ZW50SWQ6IFJvb21WaWV3U3RvcmUuZ2V0SW5pdGlhbEV2ZW50SWQoKSxcbiAgICAgICAgICAgIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ6IFJvb21WaWV3U3RvcmUuaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZCgpLFxuICAgICAgICAgICAgcmVwbHlUb0V2ZW50OiBSb29tVmlld1N0b3JlLmdldFF1b3RpbmdFdmVudCgpLFxuICAgICAgICAgICAgZm9yd2FyZGluZ0V2ZW50OiBSb29tVmlld1N0b3JlLmdldEZvcndhcmRpbmdFdmVudCgpLFxuICAgICAgICAgICAgLy8gd2Ugc2hvdWxkIG9ubHkgcGVlayBvbmNlIHdlIGhhdmUgYSByZWFkeSBjbGllbnRcbiAgICAgICAgICAgIHNob3VsZFBlZWs6IHRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSAmJiBSb29tVmlld1N0b3JlLnNob3VsZFBlZWsoKSxcbiAgICAgICAgICAgIHNob3dpbmdQaW5uZWQ6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJQaW5uZWRFdmVudHMuaXNPcGVuXCIsIHJvb21JZCksXG4gICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1JlYWRSZWNlaXB0c1wiLCByb29tSWQpLFxuICAgICAgICAgICAgd2FzQ29udGV4dFN3aXRjaDogUm9vbVZpZXdTdG9yZS5nZXRXYXNDb250ZXh0U3dpdGNoKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFpbml0aWFsICYmIHRoaXMuc3RhdGUuc2hvdWxkUGVlayAmJiAhbmV3U3RhdGUuc2hvdWxkUGVlaykge1xuICAgICAgICAgICAgLy8gU3RvcCBwZWVraW5nIGJlY2F1c2Ugd2UgaGF2ZSBqb2luZWQgdGhpcyByb29tIG5vd1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0b3BQZWVraW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZW1wb3JhcnkgbG9nZ2luZyB0byBkaWFnbm9zZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy80MzA3XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgJ1JWUyB1cGRhdGU6JyxcbiAgICAgICAgICAgIG5ld1N0YXRlLnJvb21JZCxcbiAgICAgICAgICAgIG5ld1N0YXRlLnJvb21BbGlhcyxcbiAgICAgICAgICAgICdsb2FkaW5nPycsIG5ld1N0YXRlLnJvb21Mb2FkaW5nLFxuICAgICAgICAgICAgJ2pvaW5pbmc/JywgbmV3U3RhdGUuam9pbmluZyxcbiAgICAgICAgICAgICdpbml0aWFsPycsIGluaXRpYWwsXG4gICAgICAgICAgICAnc2hvdWxkUGVlaz8nLCBuZXdTdGF0ZS5zaG91bGRQZWVrLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIE5COiBUaGlzIGRvZXMgYXNzdW1lIHRoYXQgdGhlIHJvb21JRCB3aWxsIG5vdCBjaGFuZ2UgZm9yIHRoZSBsaWZldGltZSBvZlxuICAgICAgICAvLyB0aGUgUm9vbVZpZXcgaW5zdGFuY2VcbiAgICAgICAgaWYgKGluaXRpYWwpIHtcbiAgICAgICAgICAgIG5ld1N0YXRlLnJvb20gPSB0aGlzLmNvbnRleHQuZ2V0Um9vbShuZXdTdGF0ZS5yb29tSWQpO1xuICAgICAgICAgICAgaWYgKG5ld1N0YXRlLnJvb20pIHtcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZS5zaG93QXBwcyA9IHRoaXMuc2hvdWxkU2hvd0FwcHMobmV3U3RhdGUucm9vbSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vblJvb21Mb2FkZWQobmV3U3RhdGUucm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tSWQgPT09IG51bGwgJiYgbmV3U3RhdGUucm9vbUlkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIHNjcm9sbCBzdGF0ZSBmb3IgdGhlIG5ldyByb29tXG5cbiAgICAgICAgICAgIC8vIElmIGFuIGV2ZW50IElEIHdhc24ndCBzcGVjaWZpZWQsIGRlZmF1bHQgdG8gdGhlIG9uZSBzYXZlZCBmb3IgdGhpcyByb29tXG4gICAgICAgICAgICAvLyBpbiB0aGUgc2Nyb2xsIHN0YXRlIHN0b3JlLiBBc3N1bWUgaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQgc2hvdWxkIGJlIHNldC5cbiAgICAgICAgICAgIGlmICghbmV3U3RhdGUuaW5pdGlhbEV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tU2Nyb2xsU3RhdGUgPSBSb29tU2Nyb2xsU3RhdGVTdG9yZS5nZXRTY3JvbGxTdGF0ZShuZXdTdGF0ZS5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmIChyb29tU2Nyb2xsU3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGUuaW5pdGlhbEV2ZW50SWQgPSByb29tU2Nyb2xsU3RhdGUuZm9jdXNzZWRFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGUuaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQgPSByb29tU2Nyb2xsU3RhdGUucGl4ZWxPZmZzZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYXIgdGhlIHNlYXJjaCByZXN1bHRzIHdoZW4gY2xpY2tpbmcgYSBzZWFyY2ggcmVzdWx0ICh3aGljaCBjaGFuZ2VzIHRoZVxuICAgICAgICAvLyBjdXJyZW50bHkgc2Nyb2xsZWQgdG8gZXZlbnQsIHRoaXMuc3RhdGUuaW5pdGlhbEV2ZW50SWQpLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRJZCAhPT0gbmV3U3RhdGUuaW5pdGlhbEV2ZW50SWQpIHtcbiAgICAgICAgICAgIG5ld1N0YXRlLnNlYXJjaFJlc3VsdHMgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIG5ld1N0YXRlLnJvb21JZCBjb3VsZCBiZSBudWxsIChlLmcuIHRoZSBhbGlhcyBtaWdodCBub3RcbiAgICAgICAgLy8gaGF2ZSBiZWVuIHJlc29sdmVkIHlldCkgc28gYW55dGhpbmcgY2FsbGVkIGhlcmUgbXVzdCBoYW5kbGUgdGhpcyBjYXNlLlxuXG4gICAgICAgIC8vIFdlIHBhc3MgdGhlIG5ldyBzdGF0ZSBpbnRvIHRoaXMgZnVuY3Rpb24gZm9yIGl0IHRvIHJlYWQ6IGl0IG5lZWRzIHRvXG4gICAgICAgIC8vIG9ic2VydmUgdGhlIG5ldyBzdGF0ZSBidXQgd2UgZG9uJ3Qgd2FudCB0byBwdXQgaXQgaW4gdGhlIHNldFN0YXRlXG4gICAgICAgIC8vIGNhbGxiYWNrIGJlY2F1c2UgdGhpcyB3b3VsZCBwcmV2ZW50IHRoZSBzZXRTdGF0ZXMgZnJvbSBiZWluZyBiYXRjaGVkLFxuICAgICAgICAvLyBpZS4gY2F1c2UgaXQgdG8gcmVuZGVyIFJvb21WaWV3IHR3aWNlIHJhdGhlciB0aGFuIHRoZSBvbmNlIHRoYXQgaXMgbmVjZXNzYXJ5LlxuICAgICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICAgICAgdGhpcy5zZXR1cFJvb20obmV3U3RhdGUucm9vbSwgbmV3U3RhdGUucm9vbUlkLCBuZXdTdGF0ZS5qb2luaW5nLCBuZXdTdGF0ZS5zaG91bGRQZWVrKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFJvb21JZCA9ICgpID0+IHtcbiAgICAgICAgLy8gQWNjb3JkaW5nIHRvIGBvblJvb21WaWV3U3RvcmVVcGRhdGVgLCBgc3RhdGUucm9vbUlkYCBjYW4gYmUgbnVsbFxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgcm9vbSBhbGlhcyB3ZSBoYXZlbid0IHJlc29sdmVkIHlldC4gVG8gd29yayBhcm91bmQgdGhpcyxcbiAgICAgICAgLy8gZmlyc3Qgd2UnbGwgdHJ5IHRoZSByb29tIG9iamVjdCBpZiBpdCdzIHRoZXJlLCBhbmQgdGhlbiBmYWxsYmFjayB0b1xuICAgICAgICAvLyB0aGUgYmFyZSByb29tIElELiAoV2UgbWF5IHdhbnQgdG8gdXBkYXRlIGBzdGF0ZS5yb29tSWRgIGFmdGVyXG4gICAgICAgIC8vIHJlc29sdmluZyBhbGlhc2VzLCBzbyB3ZSBjb3VsZCBhbHdheXMgdHJ1c3QgaXQuKVxuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb29tID8gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCA6IHRoaXMuc3RhdGUucm9vbUlkO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFBlcm1hbGlua0NyZWF0b3JGb3JSb29tKHJvb206IFJvb20pIHtcbiAgICAgICAgaWYgKHRoaXMucGVybWFsaW5rQ3JlYXRvcnNbcm9vbS5yb29tSWRdKSByZXR1cm4gdGhpcy5wZXJtYWxpbmtDcmVhdG9yc1tyb29tLnJvb21JZF07XG5cbiAgICAgICAgdGhpcy5wZXJtYWxpbmtDcmVhdG9yc1tyb29tLnJvb21JZF0gPSBuZXcgUm9vbVBlcm1hbGlua0NyZWF0b3Iocm9vbSk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb20gJiYgcm9vbS5yb29tSWQgPT09IHRoaXMuc3RhdGUucm9vbS5yb29tSWQpIHtcbiAgICAgICAgICAgIC8vIFdlIHdhbnQgdG8gd2F0Y2ggZm9yIGNoYW5nZXMgaW4gdGhlIGNyZWF0b3IgZm9yIHRoZSBwcmltYXJ5IHJvb20gaW4gdGhlIHZpZXcsIGJ1dFxuICAgICAgICAgICAgLy8gZG9uJ3QgbmVlZCB0byBkbyBzbyBmb3Igc2VhcmNoIHJlc3VsdHMuXG4gICAgICAgICAgICB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXS5zdGFydCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wZXJtYWxpbmtDcmVhdG9yc1tyb29tLnJvb21JZF0ubG9hZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0b3BBbGxQZXJtYWxpbmtDcmVhdG9ycygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBlcm1hbGlua0NyZWF0b3JzKSByZXR1cm47XG4gICAgICAgIGZvciAoY29uc3Qgcm9vbUlkIG9mIE9iamVjdC5rZXlzKHRoaXMucGVybWFsaW5rQ3JlYXRvcnMpKSB7XG4gICAgICAgICAgICB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb21JZF0uc3RvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldpZGdldEVjaG9TdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20pIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBoYXNQaW5uZWRXaWRnZXRzOiBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5nZXRDb250YWluZXJXaWRnZXRzKHRoaXMuc3RhdGUucm9vbSwgQ29udGFpbmVyLlRvcCkubGVuZ3RoID4gMCxcbiAgICAgICAgICAgIHNob3dBcHBzOiB0aGlzLnNob3VsZFNob3dBcHBzKHRoaXMuc3RhdGUucm9vbSksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uV2lkZ2V0TGF5b3V0Q2hhbmdlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLm9uV2lkZ2V0RWNob1N0b3JlVXBkYXRlKCk7IC8vIHdlIGNoZWF0IGhlcmUgYnkgY2FsbGluZyB0aGUgdGhpbmcgdGhhdCBtYXR0ZXJzXG4gICAgfTtcblxuICAgIHByaXZhdGUgc2V0dXBSb29tKHJvb206IFJvb20sIHJvb21JZDogc3RyaW5nLCBqb2luaW5nOiBib29sZWFuLCBzaG91bGRQZWVrOiBib29sZWFuKSB7XG4gICAgICAgIC8vIGlmIHRoaXMgaXMgYW4gdW5rbm93biByb29tIHRoZW4gd2UncmUgaW4gb25lIG9mIHRocmVlIHN0YXRlczpcbiAgICAgICAgLy8gLSBUaGlzIGlzIGEgcm9vbSB3ZSBjYW4gcGVlayBpbnRvIChzZWFyY2ggZW5naW5lKSAod2UgY2FuIC9wZWVrKVxuICAgICAgICAvLyAtIFRoaXMgaXMgYSByb29tIHdlIGNhbiBwdWJsaWNseSBqb2luIG9yIHdlcmUgaW52aXRlZCB0by4gKHdlIGNhbiAvam9pbilcbiAgICAgICAgLy8gLSBUaGlzIGlzIGEgcm9vbSB3ZSBjYW5ub3Qgam9pbiBhdCBhbGwuIChubyBhY3Rpb24gY2FuIGhlbHAgdXMpXG4gICAgICAgIC8vIFdlIGNhbid0IHRyeSB0byAvam9pbiBiZWNhdXNlIHRoaXMgbWF5IGltcGxpY2l0bHkgYWNjZXB0IGludml0ZXMgKCEpXG4gICAgICAgIC8vIFdlIGNhbiAvcGVlayB0aG91Z2guIElmIGl0IGZhaWxzIHRoZW4gd2UgcHJlc2VudCB0aGUgam9pbiBVSS4gSWYgaXRcbiAgICAgICAgLy8gc3VjY2VlZHMgdGhlbiBncmVhdCwgc2hvdyB0aGUgcHJldmlldyAoYnV0IHdlIHN0aWxsIG1heSBiZSBhYmxlIHRvIC9qb2luISkuXG4gICAgICAgIC8vIE5vdGUgdGhhdCBwZWVraW5nIHdvcmtzIGJ5IHJvb20gSUQgYW5kIHJvb20gSUQgb25seSwgYXMgb3Bwb3NlZCB0byBqb2luaW5nXG4gICAgICAgIC8vIHdoaWNoIG11c3QgYmUgYnkgYWxpYXMgb3IgaW52aXRlIHdoZXJldmVyIHBvc3NpYmxlIChwZWVraW5nIGN1cnJlbnRseSBkb2VzXG4gICAgICAgIC8vIG5vdCB3b3JrIG92ZXIgZmVkZXJhdGlvbikuXG5cbiAgICAgICAgLy8gTkIuIFdlIHBlZWsgaWYgd2UgaGF2ZSBuZXZlciBzZWVuIHRoZSByb29tIGJlZm9yZSAoaS5lLiBqcy1zZGsgZG9lcyBub3Qga25vd1xuICAgICAgICAvLyBhYm91dCBpdCkuIFdlIGRvbid0IHBlZWsgaW4gdGhlIGhpc3RvcmljYWwgY2FzZSB3aGVyZSB3ZSB3ZXJlIGpvaW5lZCBidXQgYXJlXG4gICAgICAgIC8vIG5vdyBub3Qgam9pbmVkIGJlY2F1c2UgdGhlIGpzLXNkayBwZWVraW5nIEFQSSB3aWxsIGNsb2JiZXIgb3VyIGhpc3RvcmljYWwgcm9vbSxcbiAgICAgICAgLy8gbWFraW5nIGl0IGltcG9zc2libGUgdG8gaW5kaWNhdGUgYSBuZXdseSBqb2luZWQgcm9vbS5cbiAgICAgICAgaWYgKCFqb2luaW5nICYmIHJvb21JZCkge1xuICAgICAgICAgICAgaWYgKCFyb29tICYmIHNob3VsZFBlZWspIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJBdHRlbXB0aW5nIHRvIHBlZWsgaW50byByb29tICVzXCIsIHJvb21JZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHBlZWtMb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpc1BlZWtpbmc6IHRydWUsIC8vIHRoaXMgd2lsbCBjaGFuZ2UgdG8gZmFsc2UgaWYgcGVla2luZyBmYWlsc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wZWVrSW5Sb29tKHJvb21JZCkudGhlbigocm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb206IHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICBwZWVrTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUm9vbUxvYWRlZChyb29tKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3RvcCBwZWVraW5nIGlmIGFueXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1BlZWtpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHdvbid0IG5lY2Vzc2FyaWx5IGJlIGEgTWF0cml4RXJyb3IsIGJ1dCB3ZSBkdWNrLXR5cGVcbiAgICAgICAgICAgICAgICAgICAgLy8gaGVyZSBhbmQgc2F5IGlmIGl0J3MgZ290IGFuICdlcnJjb2RlJyBrZXkgd2l0aCB0aGUgcmlnaHQgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIC8vIGl0IG1lYW5zIHdlIGNhbid0IHBlZWsuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gXCJNX0dVRVNUX0FDQ0VTU19GT1JCSURERU5cIiB8fCBlcnIuZXJyY29kZSA9PT0gJ01fRk9SQklEREVOJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBmaW5lOiB0aGUgcm9vbSBqdXN0IGlzbid0IHBlZWthYmxlICh3ZSBhc3N1bWUpLlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVla0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocm9vbSkge1xuICAgICAgICAgICAgICAgIC8vIFN0b3AgcGVla2luZyBiZWNhdXNlIHdlIGhhdmUgam9pbmVkIHRoaXMgcm9vbSBwcmV2aW91c2x5XG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0b3BQZWVraW5nKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNQZWVraW5nOiBmYWxzZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG91bGRTaG93QXBwcyhyb29tOiBSb29tKSB7XG4gICAgICAgIGlmICghQlJPV1NFUl9TVVBQT1JUU19TQU5EQk9YIHx8ICFyb29tKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdXNlciBoYXMgcHJldmlvdXNseSBjaG9zZW4gdG8gaGlkZSB0aGUgYXBwIGRyYXdlciBmb3IgdGhpc1xuICAgICAgICAvLyByb29tLiBJZiBzbywgZG8gbm90IHNob3cgYXBwc1xuICAgICAgICBjb25zdCBoaWRlV2lkZ2V0RHJhd2VyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXG4gICAgICAgICAgICByb29tLnJvb21JZCArIFwiX2hpZGVfd2lkZ2V0X2RyYXdlclwiKTtcblxuICAgICAgICAvLyBUaGlzIGlzIGNvbmZ1c2luZywgYnV0IGl0IG1lYW5zIHRvIHNheSB0aGF0IHdlIGRlZmF1bHQgdG8gdGhlIHRyYXkgYmVpbmdcbiAgICAgICAgLy8gaGlkZGVuIHVubGVzcyB0aGUgdXNlciBjbGlja2VkIHRvIG9wZW4gaXQuXG4gICAgICAgIGNvbnN0IGlzTWFudWFsbHlTaG93biA9IGhpZGVXaWRnZXREcmF3ZXIgPT09IFwiZmFsc2VcIjtcblxuICAgICAgICBjb25zdCB3aWRnZXRzID0gV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2UuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBDb250YWluZXIuVG9wKTtcbiAgICAgICAgcmV0dXJuIHdpZGdldHMubGVuZ3RoID4gMCB8fCBpc01hbnVhbGx5U2hvd247XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKHRydWUpO1xuXG4gICAgICAgIGNvbnN0IGNhbGwgPSB0aGlzLmdldENhbGxGb3JSb29tKCk7XG4gICAgICAgIGNvbnN0IGNhbGxTdGF0ZSA9IGNhbGwgPyBjYWxsLnN0YXRlIDogbnVsbDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjYWxsU3RhdGU6IGNhbGxTdGF0ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHRoaXMub25QYWdlVW5sb2FkKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub24oXCJtaWRkbGVQYW5lbFJlc2l6ZWRcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xuICAgIH1cblxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICByZXR1cm4gKG9iamVjdEhhc0RpZmYodGhpcy5wcm9wcywgbmV4dFByb3BzKSB8fCBvYmplY3RIYXNEaWZmKHRoaXMuc3RhdGUsIG5leHRTdGF0ZSkpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vbVZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbVZpZXcgPSB0aGlzLnJvb21WaWV3LmN1cnJlbnQ7XG4gICAgICAgICAgICBpZiAoIXJvb21WaWV3Lm9uZHJvcCkge1xuICAgICAgICAgICAgICAgIHJvb21WaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLm9uRHJvcCk7XG4gICAgICAgICAgICAgICAgcm9vbVZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLm9uRHJhZ092ZXIpO1xuICAgICAgICAgICAgICAgIHJvb21WaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIHRoaXMub25EcmFnRW50ZXIpO1xuICAgICAgICAgICAgICAgIHJvb21WaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMub25EcmFnTGVhdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90ZTogV2UgY2hlY2sgdGhlIHJlZiBoZXJlIHdpdGggYSBmbGFnIGJlY2F1c2UgY29tcG9uZW50RGlkTW91bnQsIGRlc3BpdGVcbiAgICAgICAgLy8gZG9jdW1lbnRhdGlvbiwgZG9lcyBub3QgZGVmaW5lIG91ciBtZXNzYWdlUGFuZWwgcmVmLiBJdCBsb29rcyBsaWtlIG91ciBzcGlubmVyXG4gICAgICAgIC8vIGluIHJlbmRlcigpIHByZXZlbnRzIHRoZSByZWYgZnJvbSBiZWluZyBzZXQgb24gZmlyc3QgbW91bnQsIHNvIHdlIHRyeSBhbmRcbiAgICAgICAgLy8gY2F0Y2ggdGhlIG1lc3NhZ2VQYW5lbCB3aGVuIGl0IGRvZXMgbW91bnQuIEJlY2F1c2Ugd2Ugb25seSB3YW50IHRoZSByZWYgb25jZSxcbiAgICAgICAgLy8gd2UgdXNlIGEgYm9vbGVhbiBmbGFnIHRvIGF2b2lkIGR1cGxpY2F0ZSB3b3JrLlxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlUGFuZWwgJiYgIXRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZUluaXQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGF0RW5kT2ZMaXZlVGltZWxpbmVJbml0OiB0cnVlLFxuICAgICAgICAgICAgICAgIGF0RW5kT2ZMaXZlVGltZWxpbmU6IHRoaXMubWVzc2FnZVBhbmVsLmlzQXRFbmRPZkxpdmVUaW1lbGluZSgpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gc2V0IGEgYm9vbGVhbiB0byBzYXkgd2UndmUgYmVlbiB1bm1vdW50ZWQsIHdoaWNoIGFueSBwZW5kaW5nXG4gICAgICAgIC8vIHByb21pc2VzIGNhbiB1c2UgdG8gdGhyb3cgYXdheSB0aGVpciByZXN1bHRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyAoV2UgY291bGQgdXNlIGlzTW91bnRlZCwgYnV0IGZhY2Vib29rIGhhdmUgZGVwcmVjYXRlZCB0aGF0LilcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgc2Nyb2xsIG1hcCBiZWZvcmUgd2UgZ2V0IHVubW91bnRlZFxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tSWQpIHtcbiAgICAgICAgICAgIFJvb21TY3JvbGxTdGF0ZVN0b3JlLnNldFNjcm9sbFN0YXRlKHRoaXMuc3RhdGUucm9vbUlkLCB0aGlzLmdldFNjcm9sbFN0YXRlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvdWxkUGVlaykge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnN0b3BQZWVraW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9wIHRyYWNraW5nIHJvb20gY2hhbmdlcyB0byBmb3JtYXQgcGVybWFsaW5rc1xuICAgICAgICB0aGlzLnN0b3BBbGxQZXJtYWxpbmtDcmVhdG9ycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnJvb21WaWV3LmN1cnJlbnQpIHtcbiAgICAgICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIEQmRCBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGUgcm9vbSB2aWV3LiBUaGlzXG4gICAgICAgICAgICAvLyBpcyByZWFsbHkganVzdCBmb3IgaHlnaWVuZSAtIHdlJ3JlIGdvaW5nIHRvIGJlXG4gICAgICAgICAgICAvLyBkZWxldGVkIGFueXdheSwgc28gaXQgZG9lc24ndCBtYXR0ZXIgaWYgdGhlIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICAgICAgLy8gZG9uJ3QgZ2V0IGNsZWFuZWQgdXAuXG4gICAgICAgICAgICBjb25zdCByb29tVmlldyA9IHRoaXMucm9vbVZpZXcuY3VycmVudDtcbiAgICAgICAgICAgIHJvb21WaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLm9uRHJvcCk7XG4gICAgICAgICAgICByb29tVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMub25EcmFnT3Zlcik7XG4gICAgICAgICAgICByb29tVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLm9uRHJhZ0VudGVyKTtcbiAgICAgICAgICAgIHJvb21WaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMub25EcmFnTGVhdmUpO1xuICAgICAgICB9XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIlJvb21cIiwgdGhpcy5vblJvb20pO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS50aW1lbGluZVwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIlJvb20ubmFtZVwiLCB0aGlzLm9uUm9vbU5hbWUpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5hY2NvdW50RGF0YVwiLCB0aGlzLm9uUm9vbUFjY291bnREYXRhKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblJvb21TdGF0ZUV2ZW50cyk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLm15TWVtYmVyc2hpcFwiLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMub25Sb29tU3RhdGVNZW1iZXIpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiYWNjb3VudERhdGFcIiwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcImNyeXB0by5rZXlCYWNrdXBTdGF0dXNcIiwgdGhpcy5vbktleUJhY2t1cFN0YXR1cyk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJkZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkXCIsIHRoaXMub25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcInVzZXJUcnVzdFN0YXR1c0NoYW5nZWRcIiwgdGhpcy5vblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcImNyb3NzU2lnbmluZy5rZXlzQ2hhbmdlZFwiLCB0aGlzLm9uQ3Jvc3NTaWduaW5nS2V5c0NoYW5nZWQpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiRXZlbnQuZGVjcnlwdGVkXCIsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJldmVudFwiLCB0aGlzLm9uRXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHRoaXMub25QYWdlVW5sb2FkKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIucmVtb3ZlTGlzdGVuZXIoXCJtaWRkbGVQYW5lbFJlc2l6ZWRcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgUm9vbVN0b3JlIGxpc3RlbmVyXG4gICAgICAgIGlmICh0aGlzLnJvb21TdG9yZVRva2VuKSB7XG4gICAgICAgICAgICB0aGlzLnJvb21TdG9yZVRva2VuLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlbW92ZSBSaWdodFBhbmVsU3RvcmUgbGlzdGVuZXJcbiAgICAgICAgaWYgKHRoaXMucmlnaHRQYW5lbFN0b3JlVG9rZW4pIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHRQYW5lbFN0b3JlVG9rZW4ucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBXaWRnZXRFY2hvU3RvcmUucmVtb3ZlTGlzdGVuZXIoVVBEQVRFX0VWRU5ULCB0aGlzLm9uV2lkZ2V0RWNob1N0b3JlVXBkYXRlKTtcbiAgICAgICAgV2lkZ2V0U3RvcmUuaW5zdGFuY2UucmVtb3ZlTGlzdGVuZXIoVVBEQVRFX0VWRU5ULCB0aGlzLm9uV2lkZ2V0U3RvcmVVcGRhdGUpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm9mZihcbiAgICAgICAgICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5lbWlzc2lvbkZvclJvb20odGhpcy5zdGF0ZS5yb29tKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9uV2lkZ2V0TGF5b3V0Q2hhbmdlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNob3dSZWFkUmVjZWlwdHNXYXRjaFJlZikge1xuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnNob3dSZWFkUmVjZWlwdHNXYXRjaFJlZik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYW5jZWwgYW55IHBlbmRpbmcgY2FsbHMgdG8gdGhlIHJhdGVfbGltaXRlZF9mdW5jc1xuICAgICAgICB0aGlzLnVwZGF0ZVJvb21NZW1iZXJzLmNhbmNlbFBlbmRpbmdDYWxsKCk7XG5cbiAgICAgICAgLy8gbm8gbmVlZCB0byBkbyB0aGlzIGFzIERpciAmIFNldHRpbmdzIGFyZSBub3cgb3ZlcmxheXMuIEl0IGp1c3QgYnVybnQgQ1BVLlxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlRpbnRlci50aW50IGZyb20gUm9vbVZpZXcudW5tb3VudFwiKTtcbiAgICAgICAgLy8gVGludGVyLnRpbnQoKTsgLy8gcmVzZXQgY29sb3Vyc2NoZW1lXG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLmxheW91dFdhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25MYXlvdXRDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbGF5b3V0OiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibGF5b3V0XCIpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCkuaXNPcGVuRm9yUm9vbSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYWdlVW5sb2FkID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAoQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuZ2V0Q3VycmVudFVwbG9hZHMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZXZlbnQucmV0dXJuVmFsdWUgPVxuICAgICAgICAgICAgICAgIF90KFwiWW91IHNlZW0gdG8gYmUgdXBsb2FkaW5nIGZpbGVzLCBhcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcXVpdD9cIik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5nZXRDYWxsRm9yUm9vbSgpICYmIHRoaXMuc3RhdGUuY2FsbFN0YXRlICE9PSAnZW5kZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXZlbnQucmV0dXJuVmFsdWUgPVxuICAgICAgICAgICAgICAgIF90KFwiWW91IHNlZW0gdG8gYmUgaW4gYSBjYWxsLCBhcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcXVpdD9cIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlYWN0S2V5RG93biA9IGV2ID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRSb29tQWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgUm9vbUFjdGlvbi5EaXNtaXNzUmVhZE1hcmtlcjpcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbC5mb3JnZXRSZWFkTWFya2VyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1wVG9MaXZlVGltZWxpbmUoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUm9vbUFjdGlvbi5KdW1wVG9PbGRlc3RVbnJlYWQ6XG4gICAgICAgICAgICAgICAgdGhpcy5qdW1wVG9SZWFkTWFya2VyKCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFJvb21BY3Rpb24uVXBsb2FkRmlsZTpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IFwidXBsb2FkX2ZpbGVcIiB9LCB0cnVlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IHBheWxvYWQgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdtZXNzYWdlX3NlbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tEZXNrdG9wTm90aWZpY2F0aW9ucygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncG9zdF9zdGlja2VyX21lc3NhZ2UnOlxuICAgICAgICAgICAgICAgIHRoaXMuaW5qZWN0U3RpY2tlcihcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5kYXRhLmNvbnRlbnQudXJsLFxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmRhdGEuY29udGVudC5pbmZvLFxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmRhdGEuZGVzY3JpcHRpb24gfHwgcGF5bG9hZC5kYXRhLm5hbWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGljdHVyZV9zbmFwc2hvdCc6XG4gICAgICAgICAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgICAgICAgICBbcGF5bG9hZC5maWxlXSwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vdGlmaWVyX2VuYWJsZWQnOlxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVXBsb2FkU3RhcnRlZDpcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlVwbG9hZEZpbmlzaGVkOlxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVXBsb2FkQ2FuY2VsZWQ6XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2FsbF9zdGF0ZSc6IHtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBmaWx0ZXIgb3V0IHBheWxvYWRzIGZvciByb29tIElEcyBvdGhlciB0aGFuIHByb3BzLnJvb20gYmVjYXVzZVxuICAgICAgICAgICAgICAgIC8vIHdlIG1heSBiZSBpbnRlcmVzdGVkIGluIHRoZSBjb25mIDE6MSByb29tXG5cbiAgICAgICAgICAgICAgICBpZiAoIXBheWxvYWQucm9vbV9pZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuZ2V0Q2FsbEZvclJvb20oKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjYWxsU3RhdGU6IGNhbGwgPyBjYWxsLnN0YXRlIDogbnVsbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2FwcHNEcmF3ZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzaG93QXBwczogcGF5bG9hZC5zaG93LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVwbHlfdG9fZXZlbnQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMgJiYgcGF5bG9hZC5ldmVudC5nZXRSb29tSWQoKSA9PT0gdGhpcy5zdGF0ZS5yb29tSWQgJiYgIXRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25DYW5jZWxTZWFyY2hDbGljaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3F1b3RlJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHBheWxvYWQuZXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb29tSWQgPT09IHRoaXMuc3RhdGUucm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2FuY2VsU2VhcmNoQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjogcGF5bG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzeW5jX3N0YXRlJzpcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudElzUmVhZHk6IHRoaXMuY29udGV4dCAmJiB0aGlzLmNvbnRleHQuaXNJbml0aWFsU3luY0NvbXBsZXRlKCksXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgYW5vdGhlciBcImluaXRpYWxcIiBSVlMgdXBkYXRlIHRvIHRyaWdnZXIgcGVla2luZyBpZiBuZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmb2N1c19zZWFyY2gnOlxuICAgICAgICAgICAgICAgIHRoaXMub25TZWFyY2hDbGljaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tVGltZWxpbmUgPSAoZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tLCB0b1N0YXJ0T2ZUaW1lbGluZTogYm9vbGVhbiwgcmVtb3ZlZCwgZGF0YSkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tc1xuICAgICAgICBpZiAoIXJvb20pIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgcm9vbS5yb29tSWQgIT0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZnJvbSBmaWx0ZXJlZCB0aW1lbGluZXNcbiAgICAgICAgaWYgKGRhdGEudGltZWxpbmUuZ2V0VGltZWxpbmVTZXQoKSAhPT0gcm9vbS5nZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwib3JnLm1hdHJpeC5yb29tLnByZXZpZXdfdXJsc1wiKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5KHJvb20pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20uZW5jcnlwdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlnbm9yZSBhbnl0aGluZyBidXQgcmVhbC10aW1lIHVwZGF0ZXMgYXQgdGhlIGVuZCBvZiB0aGUgcm9vbTpcbiAgICAgICAgLy8gdXBkYXRlcyBmcm9tIHBhZ2luYXRpb24gd2lsbCBoYXBwZW4gd2hlbiB0aGUgcGFnaW5hdGUgY29tcGxldGVzLlxuICAgICAgICBpZiAodG9TdGFydE9mVGltZWxpbmUgfHwgIWRhdGEgfHwgIWRhdGEubGl2ZUV2ZW50KSByZXR1cm47XG5cbiAgICAgICAgLy8gbm8gcG9pbnQgaGFuZGxpbmcgYW55dGhpbmcgd2hpbGUgd2UncmUgd2FpdGluZyBmb3IgdGhlIGpvaW4gdG8gZmluaXNoOlxuICAgICAgICAvLyB3ZSdsbCBvbmx5IGJlIHNob3dpbmcgYSBzcGlubmVyLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5qb2luaW5nKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGV2LmdldFNlbmRlcigpICE9PSB0aGlzLmNvbnRleHQuY3JlZGVudGlhbHMudXNlcklkKSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdW5yZWFkIGNvdW50IHdoZW4gc2Nyb2xsZWQgdXBcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzICYmIHRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZSkge1xuICAgICAgICAgICAgICAgIC8vIG5vIGNoYW5nZVxuICAgICAgICAgICAgfSBlbHNlIGlmICghc2hvdWxkSGlkZUV2ZW50KGV2KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlLCBwcm9wcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge251bVVucmVhZE1lc3NhZ2VzOiBzdGF0ZS5udW1VbnJlYWRNZXNzYWdlcyArIDF9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FdmVudERlY3J5cHRlZCA9IChldikgPT4ge1xuICAgICAgICBpZiAoZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFuZGxlRWZmZWN0cyhldik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FdmVudCA9IChldikgPT4ge1xuICAgICAgICBpZiAoZXYuaXNCZWluZ0RlY3J5cHRlZCgpIHx8IGV2LmlzRGVjcnlwdGlvbkZhaWx1cmUoKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhbmRsZUVmZmVjdHMoZXYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGhhbmRsZUVmZmVjdHMgPSAoZXYpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSkgcmV0dXJuOyAvLyBub3QgcmVhZHkgYXQgYWxsXG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSAhPT0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCkgcmV0dXJuOyAvLyBub3QgZm9yIHVzXG5cbiAgICAgICAgY29uc3Qgbm90aWZTdGF0ZSA9IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldFJvb21TdGF0ZSh0aGlzLnN0YXRlLnJvb20pO1xuICAgICAgICBpZiAoIW5vdGlmU3RhdGUuaXNVbnJlYWQpIHJldHVybjtcblxuICAgICAgICBDSEFUX0VGRkVDVFMuZm9yRWFjaChlZmZlY3QgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5zRW1vamkoZXYuZ2V0Q29udGVudCgpLCBlZmZlY3QuZW1vamlzKSB8fCBldi5nZXRDb250ZW50KCkubXNndHlwZSA9PT0gZWZmZWN0Lm1zZ1R5cGUpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogYGVmZmVjdHMuJHtlZmZlY3QuY29tbWFuZH1gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbU5hbWUgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tICYmIHJvb20ucm9vbUlkID09IHRoaXMuc3RhdGUucm9vbS5yb29tSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5QmFja3VwU3RhdHVzID0gKCkgPT4ge1xuICAgICAgICAvLyBLZXkgYmFja3VwIHN0YXR1cyBjaGFuZ2VzIGFmZmVjdCB3aGV0aGVyIHRoZSBpbi1yb29tIHJlY292ZXJ5XG4gICAgICAgIC8vIHJlbWluZGVyIGlzIGRpc3BsYXllZC5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgY2FuUmVzZXRUaW1lbGluZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2VQYW5lbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVBhbmVsLmNhblJlc2V0VGltZWxpbmUoKTtcbiAgICB9O1xuXG4gICAgLy8gY2FsbGVkIHdoZW4gc3RhdGUucm9vbSBpcyBmaXJzdCBpbml0aWFsaXNlZCAoZWl0aGVyIGF0IGluaXRpYWwgbG9hZCxcbiAgICAvLyBhZnRlciBhIHN1Y2Nlc3NmdWwgcGVlaywgb3IgYWZ0ZXIgd2Ugam9pbiB0aGUgcm9vbSkuXG4gICAgcHJpdmF0ZSBvblJvb21Mb2FkZWQgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAvLyBBdHRhY2ggYSB3aWRnZXQgc3RvcmUgbGlzdGVuZXIgb25seSB3aGVuIHdlIGdldCBhIHJvb21cbiAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uub24oV2lkZ2V0TGF5b3V0U3RvcmUuZW1pc3Npb25Gb3JSb29tKHJvb20pLCB0aGlzLm9uV2lkZ2V0TGF5b3V0Q2hhbmdlKTtcbiAgICAgICAgdGhpcy5vbldpZGdldExheW91dENoYW5nZSgpOyAvLyBwcm92b2tlIGFuIHVwZGF0ZVxuXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUGVla1J1bGVzKHJvb20pO1xuICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5KHJvb20pO1xuICAgICAgICB0aGlzLmxvYWRNZW1iZXJzSWZKb2luZWQocm9vbSk7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUmVjb21tZW5kZWRWZXJzaW9uKHJvb20pO1xuICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICAgICAgdGhpcy51cGRhdGVQZXJtaXNzaW9ucyhyb29tKTtcbiAgICAgICAgdGhpcy5jaGVja1dpZGdldHMocm9vbSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgY2FsY3VsYXRlUmVjb21tZW5kZWRWZXJzaW9uKHJvb206IFJvb20pIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1cGdyYWRlUmVjb21tZW5kYXRpb246IGF3YWl0IHJvb20uZ2V0UmVjb21tZW5kZWRWZXJzaW9uKCksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgbG9hZE1lbWJlcnNJZkpvaW5lZChyb29tOiBSb29tKSB7XG4gICAgICAgIC8vIGxhenkgbG9hZCBtZW1iZXJzIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dC5oYXNMYXp5TG9hZE1lbWJlcnNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGlmIChyb29tICYmIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09ICdqb2luJykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHJvb20ubG9hZE1lbWJlcnNJZk5lZWRlZCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZW1iZXJzTG9hZGVkOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZldGNoaW5nIHJvb20gbWVtYmVycyBmb3IgJHtyb29tLnJvb21JZH0gZmFpbGVkLmAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIgUm9vbSBtZW1iZXJzIHdpbGwgYXBwZWFyIGluY29tcGxldGUuXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlUGVla1J1bGVzKHJvb206IFJvb20pIHtcbiAgICAgICAgY29uc3QgZ3Vlc3RBY2Nlc3NFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLmd1ZXN0X2FjY2Vzc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKGd1ZXN0QWNjZXNzRXZlbnQgJiYgZ3Vlc3RBY2Nlc3NFdmVudC5nZXRDb250ZW50KCkuZ3Vlc3RfYWNjZXNzID09PSBcImNhbl9qb2luXCIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGd1ZXN0c0NhbkpvaW46IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhpc3RvcnlWaXNpYmlsaXR5ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uaGlzdG9yeV92aXNpYmlsaXR5XCIsIFwiXCIpO1xuICAgICAgICBpZiAoaGlzdG9yeVZpc2liaWxpdHkgJiYgaGlzdG9yeVZpc2liaWxpdHkuZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eSA9PT0gXCJ3b3JsZF9yZWFkYWJsZVwiKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjYW5QZWVrOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5KHtyb29tSWR9OiBSb29tKSB7XG4gICAgICAgIC8vIFVSTCBQcmV2aWV3cyBpbiBFMkVFIHJvb21zIGNhbiBiZSBhIHByaXZhY3kgbGVhayBzbyB1c2UgYSBkaWZmZXJlbnQgc2V0dGluZyB3aGljaCBpcyBwZXItcm9vbSBleHBsaWNpdFxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmNvbnRleHQuaXNSb29tRW5jcnlwdGVkKHJvb21JZCkgPyAndXJsUHJldmlld3NFbmFibGVkX2UyZWUnIDogJ3VybFByZXZpZXdzRW5hYmxlZCc7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1VybFByZXZpZXc6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoa2V5LCByb29tSWQpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbSA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmICghcm9vbSB8fCByb29tLnJvb21JZCAhPT0gdGhpcy5zdGF0ZS5yb29tSWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGFjaCB0aGUgbGlzdGVuZXIgaWYgdGhlIHJvb20gaXMgY2hhbmdpbmcgZm9yIHNvbWUgcmVhc29uXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm9mZihcbiAgICAgICAgICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5lbWlzc2lvbkZvclJvb20odGhpcy5zdGF0ZS5yb29tKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9uV2lkZ2V0TGF5b3V0Q2hhbmdlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblJvb21Mb2FkZWQocm9vbSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCA9ICh1c2VySWQ6IHN0cmluZywgZGV2aWNlOiBvYmplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuc3RhdGUucm9vbTtcbiAgICAgICAgaWYgKCFyb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIodXNlcklkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRTJFU3RhdHVzKHJvb20pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQgPSAodXNlcklkOiBzdHJpbmcsIHRydXN0U3RhdHVzOiBvYmplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuc3RhdGUucm9vbTtcbiAgICAgICAgaWYgKCFyb29tIHx8ICFyb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIodXNlcklkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRTJFU3RhdHVzKHJvb20pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ3Jvc3NTaWduaW5nS2V5c0NoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnN0YXRlLnJvb207XG4gICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZUUyRVN0YXR1cyhyb29tOiBSb29tKSB7XG4gICAgICAgIGlmICghdGhpcy5jb250ZXh0LmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuY29udGV4dC5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgLy8gSWYgY3J5cHRvIGlzIG5vdCBjdXJyZW50bHkgZW5hYmxlZCwgd2UgYXJlbid0IHRyYWNraW5nIGRldmljZXMgYXQgYWxsLFxuICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3Qga25vdyB3aGF0IHRoZSBhbnN3ZXIgaXMuIExldCdzIGVycm9yIG9uIHRoZSBzYWZlIHNpZGUgYW5kIHNob3dcbiAgICAgICAgICAgIC8vIGEgd2FybmluZyBmb3IgdGhpcyBjYXNlLlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZTJlU3RhdHVzOiBFMkVTdGF0dXMuV2FybmluZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQXQgdGhpcyBwb2ludCwgdGhlIHVzZXIgaGFzIGVuY3J5cHRpb24gb24gYW5kIGNyb3NzLXNpZ25pbmcgb24gKi9cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlMmVTdGF0dXM6IGF3YWl0IHNoaWVsZFN0YXR1c0ZvclJvb20odGhpcy5jb250ZXh0LCByb29tKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVUaW50KCkge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5zdGF0ZS5yb29tO1xuICAgICAgICBpZiAoIXJvb20pIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIlRpbnRlci50aW50IGZyb20gdXBkYXRlVGludFwiKTtcbiAgICAgICAgY29uc3QgY29sb3JTY2hlbWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwicm9vbUNvbG9yXCIsIHJvb20ucm9vbUlkKTtcbiAgICAgICAgVGludGVyLnRpbnQoY29sb3JTY2hlbWUucHJpbWFyeV9jb2xvciwgY29sb3JTY2hlbWUuc2Vjb25kYXJ5X2NvbG9yKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudERhdGEgPSAoZXZlbnQ6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBldmVudC5nZXRUeXBlKCk7XG4gICAgICAgIGlmICgodHlwZSA9PT0gXCJvcmcubWF0cml4LnByZXZpZXdfdXJsc1wiIHx8IHR5cGUgPT09IFwiaW0udmVjdG9yLndlYi5zZXR0aW5nc1wiKSAmJiB0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIC8vIG5vbi1lMmVlIHVybCBwcmV2aWV3cyBhcmUgc3RvcmVkIGluIGxlZ2FjeSBldmVudCB0eXBlIGBvcmcubWF0cml4LnJvb20ucHJldmlld191cmxzYFxuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3VXJsVmlzaWJpbGl0eSh0aGlzLnN0YXRlLnJvb20pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tQWNjb3VudERhdGEgPSAoZXZlbnQ6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmIChyb29tLnJvb21JZCA9PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGV2ZW50LmdldFR5cGUoKTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBcIm9yZy5tYXRyaXgucm9vbS5jb2xvcl9zY2hlbWVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yU2NoZW1lID0gZXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgICAgIC8vIFhYWDogd2Ugc2hvdWxkIHZhbGlkYXRlIHRoZSBldmVudFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGludGVyLnRpbnQgZnJvbSBvblJvb21BY2NvdW50RGF0YVwiKTtcbiAgICAgICAgICAgICAgICBUaW50ZXIudGludChjb2xvclNjaGVtZS5wcmltYXJ5X2NvbG9yLCBjb2xvclNjaGVtZS5zZWNvbmRhcnlfY29sb3IpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm9yZy5tYXRyaXgucm9vbS5wcmV2aWV3X3VybHNcIiB8fCB0eXBlID09PSBcImltLnZlY3Rvci53ZWIuc2V0dGluZ3NcIikge1xuICAgICAgICAgICAgICAgIC8vIG5vbi1lMmVlIHVybCBwcmV2aWV3cyBhcmUgc3RvcmVkIGluIGxlZ2FjeSBldmVudCB0eXBlIGBvcmcubWF0cml4LnJvb20ucHJldmlld191cmxzYFxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlld1VybFZpc2liaWxpdHkocm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21TdGF0ZUV2ZW50cyA9IChldjogTWF0cml4RXZlbnQsIHN0YXRlKSA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBpZiB3ZSBkb24ndCBoYXZlIGEgcm9vbSB5ZXRcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCAhPT0gc3RhdGUucm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVBlcm1pc3Npb25zKHRoaXMuc3RhdGUucm9vbSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVNZW1iZXIgPSAoZXY6IE1hdHJpeEV2ZW50LCBzdGF0ZSwgbWVtYmVyKSA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBpZiB3ZSBkb24ndCBoYXZlIGEgcm9vbSB5ZXRcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlnbm9yZSBtZW1iZXJzIGluIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChtZW1iZXIucm9vbUlkICE9PSB0aGlzLnN0YXRlLnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVJvb21NZW1iZXJzKG1lbWJlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NeU1lbWJlcnNoaXAgPSAocm9vbTogUm9vbSwgbWVtYmVyc2hpcDogc3RyaW5nLCBvbGRNZW1iZXJzaGlwOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHJvb20ucm9vbUlkID09PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5sb2FkTWVtYmVyc0lmSm9pbmVkKHJvb20pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQZXJtaXNzaW9ucyhyb29tKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZVBlcm1pc3Npb25zKHJvb206IFJvb20pIHtcbiAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcy5jb250ZXh0LmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgY29uc3QgY2FuUmVhY3QgPSByb29tLmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIiAmJiByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kRXZlbnQoXCJtLnJlYWN0aW9uXCIsIG1lKTtcbiAgICAgICAgICAgIGNvbnN0IGNhblJlcGx5ID0gcm9vbS5tYXlTZW5kTWVzc2FnZSgpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjYW5SZWFjdCwgY2FuUmVwbHl9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJhdGUgbGltaXRlZCBiZWNhdXNlIGEgcG93ZXIgbGV2ZWwgY2hhbmdlIHdpbGwgZW1pdCBhbiBldmVudCBmb3IgZXZlcnkgbWVtYmVyIGluIHRoZSByb29tLlxuICAgIHByaXZhdGUgdXBkYXRlUm9vbU1lbWJlcnMgPSByYXRlTGltaXRlZEZ1bmMoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZURNU3RhdGUoKTtcbiAgICAgICAgdGhpcy51cGRhdGVFMkVTdGF0dXModGhpcy5zdGF0ZS5yb29tKTtcbiAgICB9LCA1MDApO1xuXG4gICAgcHJpdmF0ZSBjaGVja0Rlc2t0b3BOb3RpZmljYXRpb25zKCkge1xuICAgICAgICBjb25zdCBtZW1iZXJDb3VudCA9IHRoaXMuc3RhdGUucm9vbS5nZXRKb2luZWRNZW1iZXJDb3VudCgpICsgdGhpcy5zdGF0ZS5yb29tLmdldEludml0ZWRNZW1iZXJDb3VudCgpO1xuICAgICAgICAvLyBpZiB0aGV5IGFyZSBub3QgYWxvbmUgcHJvbXB0IHRoZSB1c2VyIGFib3V0IG5vdGlmaWNhdGlvbnMgc28gdGhleSBkb24ndCBtaXNzIHJlcGxpZXNcbiAgICAgICAgaWYgKG1lbWJlckNvdW50ID4gMSAmJiBOb3RpZmllci5zaG91bGRTaG93UHJvbXB0KCkpIHtcbiAgICAgICAgICAgIHNob3dOb3RpZmljYXRpb25zVG9hc3QodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZURNU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnN0YXRlLnJvb207XG4gICAgICAgIGlmIChyb29tLmdldE15TWVtYmVyc2hpcCgpICE9IFwiam9pblwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZG1JbnZpdGVyID0gcm9vbS5nZXRETUludml0ZXIoKTtcbiAgICAgICAgaWYgKGRtSW52aXRlcikge1xuICAgICAgICAgICAgUm9vbXMuc2V0RE1Sb29tKHJvb20ucm9vbUlkLCBkbUludml0ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlYXJjaFJlc3VsdHNGaWxsUmVxdWVzdCA9IChiYWNrd2FyZHM6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgaWYgKCFiYWNrd2FyZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5uZXh0X2JhdGNoKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInJlcXVlc3RpbmcgbW9yZSBzZWFyY2ggcmVzdWx0c1wiKTtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFByb21pc2UgPSBzZWFyY2hQYWdpbmF0aW9uKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZWFyY2hSZXN1bHQoc2VhcmNoUHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIm5vIG1vcmUgc2VhcmNoIHJlc3VsdHNcIik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSW52aXRlQnV0dG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIGNhbGwgQWRkcmVzc1BpY2tlckRpYWxvZ1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19pbnZpdGUnLFxuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkpvaW5CdXR0b25DbGlja2VkID0gKCkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgdXNlciBpcyBhIFJPVSwgYWxsb3cgdGhlbSB0byB0cmFuc2l0aW9uIHRvIGEgUFdMVVxuICAgICAgICBpZiAodGhpcy5jb250ZXh0ICYmIHRoaXMuY29udGV4dC5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIC8vIEpvaW4gdGhpcyByb29tIG9uY2UgdGhlIHVzZXIgaGFzIHJlZ2lzdGVyZWQgYW5kIGxvZ2dlZCBpblxuICAgICAgICAgICAgLy8gKElmIHdlIGZhaWxlZCB0byBwZWVrLCB3ZSBtYXkgbm90IGhhdmUgYSB2YWxpZCByb29tIG9iamVjdC4pXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2RvX2FmdGVyX3N5bmNfcHJlcGFyZWQnLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiB0aGlzLmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWduVXJsID0gdGhpcy5wcm9wcy50aHJlZXBpZEludml0ZT8uc2lnblVybDtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdqb2luX3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICBvcHRzOiB7IGludml0ZVNpZ25Vcmw6IHNpZ25VcmwgfSxcbiAgICAgICAgICAgICAgICAgICAgX3R5cGU6IFwidW5rbm93blwiLCAvLyBUT0RPOiBpbnN0cnVtZW50YXRpb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTWVzc2FnZUxpc3RTY3JvbGwgPSBldiA9PiB7XG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VQYW5lbC5pc0F0RW5kT2ZMaXZlVGltZWxpbmUoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbnVtVW5yZWFkTWVzc2FnZXM6IDAsXG4gICAgICAgICAgICAgICAgYXRFbmRPZkxpdmVUaW1lbGluZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYXRFbmRPZkxpdmVUaW1lbGluZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZVRvcFVucmVhZE1lc3NhZ2VzQmFyKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25EcmFnRW50ZXIgPSBldiA9PiB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIFdlIGFsd2F5cyBpbmNyZW1lbnQgdGhlIGNvdW50ZXIgbm8gbWF0dGVyIHRoZSB0eXBlcywgYmVjYXVzZSBkcmFnZ2luZyBpc1xuICAgICAgICAvLyBzdGlsbCBoYXBwZW5pbmcuIElmIHdlIGRpZG4ndCwgdGhlIGRyYWcgY291bnRlciB3b3VsZCBnZXQgb3V0IG9mIHN5bmMuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RyYWdDb3VudGVyOiB0aGlzLnN0YXRlLmRyYWdDb3VudGVyICsgMX0pO1xuXG4gICAgICAgIC8vIFNlZTpcbiAgICAgICAgLy8gaHR0cHM6Ly9kb2NzLnczY3ViLmNvbS9kb20vZGF0YXRyYW5zZmVyL3R5cGVzXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IVE1MX0RyYWdfYW5kX0Ryb3BfQVBJL1JlY29tbWVuZGVkX2RyYWdfdHlwZXMjZmlsZVxuICAgICAgICBpZiAoZXYuZGF0YVRyYW5zZmVyLnR5cGVzLmluY2x1ZGVzKFwiRmlsZXNcIikgfHwgZXYuZGF0YVRyYW5zZmVyLnR5cGVzLmluY2x1ZGVzKFwiYXBwbGljYXRpb24veC1tb3otZmlsZVwiKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZHJhZ2dpbmdGaWxlOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRyYWdMZWF2ZSA9IGV2ID0+IHtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBkcmFnQ291bnRlcjogdGhpcy5zdGF0ZS5kcmFnQ291bnRlciAtIDEsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRyYWdDb3VudGVyID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBkcmFnZ2luZ0ZpbGU6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRyYWdPdmVyID0gZXYgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJztcblxuICAgICAgICAvLyBTZWU6XG4gICAgICAgIC8vIGh0dHBzOi8vZG9jcy53M2N1Yi5jb20vZG9tL2RhdGF0cmFuc2Zlci90eXBlc1xuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSFRNTF9EcmFnX2FuZF9Ecm9wX0FQSS9SZWNvbW1lbmRlZF9kcmFnX3R5cGVzI2ZpbGVcbiAgICAgICAgaWYgKGV2LmRhdGFUcmFuc2Zlci50eXBlcy5pbmNsdWRlcyhcIkZpbGVzXCIpIHx8IGV2LmRhdGFUcmFuc2Zlci50eXBlcy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL3gtbW96LWZpbGVcIikpIHtcbiAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ecm9wID0gZXYgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmZpbGVzLCB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLCB0aGlzLmNvbnRleHQsXG4gICAgICAgICk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRyYWdnaW5nRmlsZTogZmFsc2UsXG4gICAgICAgICAgICBkcmFnQ291bnRlcjogdGhpcy5zdGF0ZS5kcmFnQ291bnRlciAtIDEsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGluamVjdFN0aWNrZXIodXJsLCBpbmZvLCB0ZXh0KSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJ30pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZFN0aWNrZXJDb250ZW50VG9Sb29tKHVybCwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCwgaW5mbywgdGV4dCwgdGhpcy5jb250ZXh0KVxuICAgICAgICAgICAgLnRoZW4odW5kZWZpbmVkLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IubmFtZSA9PT0gXCJVbmtub3duRGV2aWNlRXJyb3JcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZXQgdGhlIHN0YXVzIGJhciBoYW5kbGUgdGhpc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlYXJjaCA9ICh0ZXJtOiBzdHJpbmcsIHNjb3BlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoVGVybTogdGVybSxcbiAgICAgICAgICAgIHNlYXJjaFNjb3BlOiBzY29wZSxcbiAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IHt9LFxuICAgICAgICAgICAgc2VhcmNoSGlnaGxpZ2h0czogW10sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSBhIHNlYXJjaCBwYW5lbCwgd2UgbmVlZCB0byB0ZWxsIGl0IHRvIGZvcmdldFxuICAgICAgICAvLyBhYm91dCBpdHMgc2Nyb2xsIHN0YXRlLlxuICAgICAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudC5yZXNldFNjcm9sbFN0YXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB3ZSBkb24ndCBlbmQgdXAgc2hvd2luZyByZXN1bHRzIGZyb21cbiAgICAgICAgLy8gYW4gYWJvcnRlZCBzZWFyY2ggYnkga2VlcGluZyBhIHVuaXF1ZSBpZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gdG9kbzogc2hvdWxkIGNhbmNlbCBhbnkgcHJldmlvdXMgc2VhcmNoIHJlcXVlc3RzLlxuICAgICAgICB0aGlzLnNlYXJjaElkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgbGV0IHJvb21JZDtcbiAgICAgICAgaWYgKHNjb3BlID09PSBcIlJvb21cIikgcm9vbUlkID0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZDtcblxuICAgICAgICBkZWJ1Z2xvZyhcInNlbmRpbmcgc2VhcmNoIHJlcXVlc3RcIik7XG4gICAgICAgIGNvbnN0IHNlYXJjaFByb21pc2UgPSBldmVudFNlYXJjaCh0ZXJtLCByb29tSWQpO1xuICAgICAgICB0aGlzLmhhbmRsZVNlYXJjaFJlc3VsdChzZWFyY2hQcm9taXNlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBoYW5kbGVTZWFyY2hSZXN1bHQoc2VhcmNoUHJvbWlzZTogUHJvbWlzZTxhbnk+KSB7XG4gICAgICAgIC8vIGtlZXAgYSByZWNvcmQgb2YgdGhlIGN1cnJlbnQgc2VhcmNoIGlkLCBzbyB0aGF0IGlmIHRoZSBzZWFyY2ggdGVybXNcbiAgICAgICAgLy8gY2hhbmdlIGJlZm9yZSB3ZSBnZXQgYSByZXNwb25zZSwgd2UgY2FuIGlnbm9yZSB0aGUgcmVzdWx0cy5cbiAgICAgICAgY29uc3QgbG9jYWxTZWFyY2hJZCA9IHRoaXMuc2VhcmNoSWQ7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hJblByb2dyZXNzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VhcmNoUHJvbWlzZS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInNlYXJjaCBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCB8fCAhdGhpcy5zdGF0ZS5zZWFyY2hpbmcgfHwgdGhpcy5zZWFyY2hJZCAhPSBsb2NhbFNlYXJjaElkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkRpc2NhcmRpbmcgc3RhbGUgc2VhcmNoIHJlc3VsdHNcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwb3N0Z3JlcyBvbiBzeW5hcHNlIHJldHVybnMgdXMgcHJlY2lzZSBkZXRhaWxzIG9mIHRoZSBzdHJpbmdzXG4gICAgICAgICAgICAvLyB3aGljaCBhY3R1YWxseSBnb3QgbWF0Y2hlZCBmb3IgaGlnaGxpZ2h0aW5nLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEluIGVpdGhlciBjYXNlLCB3ZSB3YW50IHRvIGhpZ2hsaWdodCB0aGUgbGl0ZXJhbCBzZWFyY2ggdGVybVxuICAgICAgICAgICAgLy8gd2hldGhlciBpdCB3YXMgdXNlZCBieSB0aGUgc2VhcmNoIGVuZ2luZSBvciBub3QuXG5cbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRzID0gcmVzdWx0cy5oaWdobGlnaHRzO1xuICAgICAgICAgICAgaWYgKGhpZ2hsaWdodHMuaW5kZXhPZih0aGlzLnN0YXRlLnNlYXJjaFRlcm0pIDwgMCkge1xuICAgICAgICAgICAgICAgIGhpZ2hsaWdodHMgPSBoaWdobGlnaHRzLmNvbmNhdCh0aGlzLnN0YXRlLnNlYXJjaFRlcm0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3Igb3ZlcmxhcHBpbmcgaGlnaGxpZ2h0cyxcbiAgICAgICAgICAgIC8vIGZhdm91ciBsb25nZXIgKG1vcmUgc3BlY2lmaWMpIHRlcm1zIGZpcnN0XG4gICAgICAgICAgICBoaWdobGlnaHRzID0gaGlnaGxpZ2h0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYi5sZW5ndGggLSBhLmxlbmd0aDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWFyY2hIaWdobGlnaHRzOiBoaWdobGlnaHRzLFxuICAgICAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IHJlc3VsdHMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlNlYXJjaCBmYWlsZWRcIiwgZXJyb3IpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2VhcmNoIGZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlNlYXJjaCBmYWlsZWRcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgPyBlcnJvci5tZXNzYWdlIDpcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJTZXJ2ZXIgbWF5IGJlIHVuYXZhaWxhYmxlLCBvdmVybG9hZGVkLCBvciBzZWFyY2ggdGltZWQgb3V0IDooXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlYXJjaEluUHJvZ3Jlc3M6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2VhcmNoUmVzdWx0VGlsZXMoKSB7XG4gICAgICAgIGNvbnN0IFNlYXJjaFJlc3VsdFRpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5TZWFyY2hSZXN1bHRUaWxlJyk7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcblxuICAgICAgICAvLyBYWFg6IHRvZG86IG1lcmdlIG92ZXJsYXBwaW5nIHJlc3VsdHMgc29tZWhvdz9cbiAgICAgICAgLy8gWFhYOiB3aHkgZG9lc24ndCBzZWFyY2hpbmcgb24gbmFtZSB3b3JrP1xuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaEluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKDxsaSBrZXk9XCJzZWFyY2gtc3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2xpPik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5uZXh0X2JhdGNoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cz8ucmVzdWx0cz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goPGxpIGtleT1cInNlYXJjaC10b3AtbWFya2VyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJteF9Sb29tVmlld190b3BNYXJrZXJcIj57IF90KFwiTm8gcmVzdWx0c1wiKSB9PC9oMj5cbiAgICAgICAgICAgICAgICA8L2xpPixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaCg8bGkga2V5PVwic2VhcmNoLXRvcC1tYXJrZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X3RvcE1hcmtlclwiPnsgX3QoXCJObyBtb3JlIHJlc3VsdHNcIikgfTwvaDI+XG4gICAgICAgICAgICAgICAgPC9saT4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9uY2UgZHluYW1pYyBjb250ZW50IGluIHRoZSBzZWFyY2ggcmVzdWx0cyBsb2FkLCBtYWtlIHRoZSBzY3JvbGxQYW5lbCBjaGVja1xuICAgICAgICAvLyB0aGUgc2Nyb2xsIG9mZnNldHMuXG4gICAgICAgIGNvbnN0IG9uSGVpZ2h0Q2hhbmdlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFBhbmVsID0gdGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudDtcbiAgICAgICAgICAgIGlmIChzY3JvbGxQYW5lbCkge1xuICAgICAgICAgICAgICAgIHNjcm9sbFBhbmVsLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGxhc3RSb29tSWQ7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9ICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHM/LnJlc3VsdHM/Lmxlbmd0aCB8fCAwKSAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMucmVzdWx0c1tpXTtcblxuICAgICAgICAgICAgY29uc3QgbXhFdiA9IHJlc3VsdC5jb250ZXh0LmdldEV2ZW50KCk7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBteEV2LmdldFJvb21JZCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBkbyBub3QgaGF2ZSB0aGUgcm9vbSBpbiBqcy1zZGsgc3RvcmVzIHRoZW4gaGlkZSBpdCBhcyB3ZSBjYW5ub3QgZWFzaWx5IHNob3cgaXRcbiAgICAgICAgICAgICAgICAvLyBBcyBwZXIgdGhlIHNwZWMsIGFuIGFsbCByb29tcyBzZWFyY2ggY2FuIGNyZWF0ZSB0aGlzIGNvbmRpdGlvbixcbiAgICAgICAgICAgICAgICAvLyBpdCBoYXBwZW5zIHdpdGggU2VzaGF0IGJ1dCBub3QgU3luYXBzZS5cbiAgICAgICAgICAgICAgICAvLyBJdCB3aWxsIG1ha2UgdGhlIHJlc3VsdCBjb3VudCBub3QgbWF0Y2ggdGhlIGRpc3BsYXllZCBjb3VudC5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhpZGluZyBzZWFyY2ggcmVzdWx0IGZyb20gYW4gdW5rbm93biByb29tXCIsIHJvb21JZCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaGF2ZVRpbGVGb3JFdmVudChteEV2KSkge1xuICAgICAgICAgICAgICAgIC8vIFhYWDogY2FuIHRoaXMgZXZlciBoYXBwZW4/IEl0IHdpbGwgbWFrZSB0aGUgcmVzdWx0IGNvdW50XG4gICAgICAgICAgICAgICAgLy8gbm90IG1hdGNoIHRoZSBkaXNwbGF5ZWQgY291bnQuXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFNjb3BlID09PSAnQWxsJykge1xuICAgICAgICAgICAgICAgIGlmIChyb29tSWQgIT09IGxhc3RSb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goPGxpIGtleT17bXhFdi5nZXRJZCgpICsgXCItcm9vbVwifT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMj57IF90KFwiUm9vbVwiKSB9OiB7IHJvb20ubmFtZSB9PC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPC9saT4pO1xuICAgICAgICAgICAgICAgICAgICBsYXN0Um9vbUlkID0gcm9vbUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0TGluayA9IFwiIy9yb29tL1wiK3Jvb21JZCtcIi9cIitteEV2LmdldElkKCk7XG5cbiAgICAgICAgICAgIHJldC5wdXNoKDxTZWFyY2hSZXN1bHRUaWxlXG4gICAgICAgICAgICAgICAga2V5PXtteEV2LmdldElkKCl9XG4gICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0PXtyZXN1bHR9XG4gICAgICAgICAgICAgICAgc2VhcmNoSGlnaGxpZ2h0cz17dGhpcy5zdGF0ZS5zZWFyY2hIaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgIHJlc3VsdExpbms9e3Jlc3VsdExpbmt9XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5nZXRQZXJtYWxpbmtDcmVhdG9yRm9yUm9vbShyb29tKX1cbiAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e29uSGVpZ2h0Q2hhbmdlZH1cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25QaW5uZWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgbm93U2hvd2luZ1Bpbm5lZCA9ICF0aGlzLnN0YXRlLnNob3dpbmdQaW5uZWQ7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMuc3RhdGUucm9vbS5yb29tSWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dpbmdQaW5uZWQ6IG5vd1Nob3dpbmdQaW5uZWQsIHNlYXJjaGluZzogZmFsc2V9KTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcIlBpbm5lZEV2ZW50cy5pc09wZW5cIiwgcm9vbUlkLCBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsIG5vd1Nob3dpbmdQaW5uZWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2FsbFBsYWNlZCA9ICh0eXBlOiBQbGFjZUNhbGxUeXBlKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdwbGFjZV9jYWxsJyxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNldHRpbmdzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJvcGVuX3Jvb21fc2V0dGluZ3NcIiB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVRpbnQgZnJvbSBvbkNhbmNlbENsaWNrXCIpO1xuICAgICAgICB0aGlzLnVwZGF0ZVRpbnQoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZm9yd2FyZGluZ0V2ZW50KSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2ZvcndhcmRfZXZlbnQnLFxuICAgICAgICAgICAgICAgIGV2ZW50OiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLkZvY3VzQ29tcG9zZXIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQXBwc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcImFwcHNEcmF3ZXJcIixcbiAgICAgICAgICAgIHNob3c6ICF0aGlzLnN0YXRlLnNob3dBcHBzLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkxlYXZlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdsZWF2ZV9yb29tJyxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMuc3RhdGUucm9vbS5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9yZ2V0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdmb3JnZXRfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlamVjdEJ1dHRvbkNsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVqZWN0aW5nOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxlYXZlKHRoaXMuc3RhdGUucm9vbUlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3ZpZXdfaG9tZV9wYWdlJyB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlamVjdGluZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHJlamVjdCBpbnZpdGU6ICVzXCIsIGVycm9yKTtcblxuICAgICAgICAgICAgY29uc3QgbXNnID0gZXJyb3IubWVzc2FnZSA/IGVycm9yLm1lc3NhZ2UgOiBKU09OLnN0cmluZ2lmeShlcnJvcik7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHJlamVjdCBpbnZpdGUnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gcmVqZWN0IGludml0ZVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbXNnLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlamVjdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVqZWN0RXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVqZWN0QW5kSWdub3JlQ2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVqZWN0aW5nOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbXlNZW1iZXIgPSB0aGlzLnN0YXRlLnJvb20uZ2V0TWVtYmVyKHRoaXMuY29udGV4dC5nZXRVc2VySWQoKSk7XG4gICAgICAgICAgICBjb25zdCBpbnZpdGVFdmVudCA9IG15TWVtYmVyLmV2ZW50cy5tZW1iZXI7XG4gICAgICAgICAgICBjb25zdCBpZ25vcmVkVXNlcnMgPSB0aGlzLmNvbnRleHQuZ2V0SWdub3JlZFVzZXJzKCk7XG4gICAgICAgICAgICBpZ25vcmVkVXNlcnMucHVzaChpbnZpdGVFdmVudC5nZXRTZW5kZXIoKSk7IC8vIGRlLWR1cGVkIGludGVybmFsbHkgaW4gdGhlIGpzLXNka1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb250ZXh0LnNldElnbm9yZWRVc2VycyhpZ25vcmVkVXNlcnMpO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRleHQubGVhdmUodGhpcy5zdGF0ZS5yb29tSWQpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAndmlld19ob21lX3BhZ2UnIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVqZWN0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byByZWplY3QgaW52aXRlOiAlc1wiLCBlcnJvcik7XG5cbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGVycm9yLm1lc3NhZ2UgPyBlcnJvci5tZXNzYWdlIDogSlNPTi5zdHJpbmdpZnkoZXJyb3IpO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byByZWplY3QgaW52aXRlJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIHJlamVjdCBpbnZpdGVcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1zZyxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWplY3Rpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlamVjdEVycm9yOiBlcnJvcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWplY3RUaHJlZXBpZEludml0ZUJ1dHRvbkNsaWNrZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFdlIGNhbiByZWplY3QgM3BpZCBpbnZpdGVzIGluIHRoZSBzYW1lIHdheSB0aGF0IHdlIGFjY2VwdCB0aGVtLFxuICAgICAgICAvLyB1c2luZyAvbGVhdmUgcmF0aGVyIHRoYW4gL2pvaW4uIEluIHRoZSBzaG9ydCB0ZXJtIHRob3VnaCwgd2VcbiAgICAgICAgLy8ganVzdCBpZ25vcmUgdGhlbS5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS92ZWN0b3Itd2ViL2lzc3Vlcy8xMTM0XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5WaWV3Um9vbURpcmVjdG9yeSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZWFyY2hDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hpbmc6ICF0aGlzLnN0YXRlLnNlYXJjaGluZyxcbiAgICAgICAgICAgIHNob3dpbmdQaW5uZWQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbFNlYXJjaENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlYXJjaGluZzogZmFsc2UsXG4gICAgICAgICAgICBzZWFyY2hSZXN1bHRzOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8ganVtcCBkb3duIHRvIHRoZSBib3R0b20gb2YgdGhpcyByb29tLCB3aGVyZSBuZXcgZXZlbnRzIGFyZSBhcnJpdmluZ1xuICAgIHByaXZhdGUganVtcFRvTGl2ZVRpbWVsaW5lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbC5qdW1wVG9MaXZlVGltZWxpbmUoKTtcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLkZvY3VzQ29tcG9zZXIpO1xuICAgIH07XG5cbiAgICAvLyBqdW1wIHVwIHRvIHdoZXJldmVyIG91ciByZWFkIG1hcmtlciBpc1xuICAgIHByaXZhdGUganVtcFRvUmVhZE1hcmtlciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwuanVtcFRvUmVhZE1hcmtlcigpO1xuICAgIH07XG5cbiAgICAvLyB1cGRhdGUgdGhlIHJlYWQgbWFya2VyIHRvIG1hdGNoIHRoZSByZWFkLXJlY2VpcHRcbiAgICBwcml2YXRlIGZvcmdldFJlYWRNYXJrZXIgPSBldiA9PiB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbC5mb3JnZXRSZWFkTWFya2VyKCk7XG4gICAgfTtcblxuICAgIC8vIGRlY2lkZSB3aGV0aGVyIG9yIG5vdCB0aGUgdG9wICd1bnJlYWQgbWVzc2FnZXMnIGJhciBzaG91bGQgYmUgc2hvd25cbiAgICBwcml2YXRlIHVwZGF0ZVRvcFVucmVhZE1lc3NhZ2VzQmFyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMubWVzc2FnZVBhbmVsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaG93QmFyID0gdGhpcy5tZXNzYWdlUGFuZWwuY2FuSnVtcFRvUmVhZE1hcmtlcigpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93VG9wVW5yZWFkTWVzc2FnZXNCYXIgIT0gc2hvd0Jhcikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd1RvcFVucmVhZE1lc3NhZ2VzQmFyOiBzaG93QmFyfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gZ2V0IHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgcm9vbSwgc28gdGhhdCBpdCBjYW4gYmVcbiAgICAvLyByZXN0b3JlZCB3aGVuIHdlIHN3aXRjaCBiYWNrIHRvIGl0LlxuICAgIC8vXG4gICAgcHJpdmF0ZSBnZXRTY3JvbGxTdGF0ZSgpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZVBhbmVsID0gdGhpcy5tZXNzYWdlUGFuZWw7XG4gICAgICAgIGlmICghbWVzc2FnZVBhbmVsKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyBpZiB3ZSdyZSBmb2xsb3dpbmcgdGhlIGxpdmUgdGltZWxpbmUsIHdlIHdhbnQgdG8gcmV0dXJuIG51bGw7IHRoYXRcbiAgICAgICAgLy8gbWVhbnMgdGhhdCwgaWYgd2Ugc3dpdGNoIGJhY2ssIHdlIHdpbGwganVtcCB0byB0aGUgcmVhZC11cC10byBtYXJrLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGF0IHNob3VsZCBiZSBtb3JlIGludHVpdGl2ZSB0aGFuIHNsYXZpc2hseSBwcmVzZXJ2aW5nIHRoZSBjdXJyZW50XG4gICAgICAgIC8vIHNjcm9sbCBzdGF0ZSwgaW4gdGhlIGNhc2Ugd2hlcmUgdGhlIHJvb20gYWR2YW5jZXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIC8vIChwYXJ0aWN1bGFybHkgaW4gdGhlIGNhc2UgdGhhdCB0aGUgdXNlciByZWFkcyBzb21lIHN0dWZmIG9uIGFub3RoZXJcbiAgICAgICAgLy8gZGV2aWNlKS5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IG1lc3NhZ2VQYW5lbC5nZXRTY3JvbGxTdGF0ZSgpO1xuXG4gICAgICAgIC8vIGdldFNjcm9sbFN0YXRlIG9uIFRpbWVsaW5lUGFuZWwgKm1heSogcmV0dXJuIG51bGwsIHNvIGd1YXJkIGFnYWluc3QgdGhhdFxuICAgICAgICBpZiAoIXNjcm9sbFN0YXRlIHx8IHNjcm9sbFN0YXRlLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHJlYWxseSBleHBlY3QgdG8gYmUgaW4gdGhpcyBzdGF0ZSwgYnV0IGl0IHdpbGxcbiAgICAgICAgICAgIC8vIG9jY2FzaW9uYWxseSBoYXBwZW4gd2hlbiBubyBzY3JvbGwgc3RhdGUgaGFzIGJlZW4gc2V0IG9uIHRoZVxuICAgICAgICAgICAgLy8gbWVzc2FnZVBhbmVsIChpZSwgd2UgZGlkbid0IGhhdmUgYW4gaW5pdGlhbCBldmVudCAoc28gaXQnc1xuICAgICAgICAgICAgLy8gcHJvYmFibHkgYSBuZXcgcm9vbSksIHRoZXJlIGhhcyBiZWVuIG5vIHVzZXItaW5pdGlhdGVkIHNjcm9sbCwgYW5kXG4gICAgICAgICAgICAvLyBubyByZWFkLXJlY2VpcHRzIGhhdmUgYXJyaXZlZCB0byB1cGRhdGUgdGhlIHNjcm9sbCBwb3NpdGlvbikuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gUmV0dXJuIG51bGwsIHdoaWNoIHdpbGwgY2F1c2UgdXMgdG8gc2Nyb2xsIHRvIGxhc3QgdW5yZWFkIG9uXG4gICAgICAgICAgICAvLyByZWxvYWQuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb2N1c3NlZEV2ZW50OiBzY3JvbGxTdGF0ZS50cmFja2VkU2Nyb2xsVG9rZW4sXG4gICAgICAgICAgICBwaXhlbE9mZnNldDogc2Nyb2xsU3RhdGUucGl4ZWxPZmZzZXQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgLy8gSXQgc2VlbXMgZmxleGJveCBkb2Vzbid0IGdpdmUgdXMgYSB3YXkgdG8gY29uc3RyYWluIHRoZSBhdXhQYW5lbCBoZWlnaHQgdG8gaGF2ZVxuICAgICAgICAvLyBhIG1pbmltdW0gb2YgdGhlIGhlaWdodCBvZiB0aGUgdmlkZW8gZWxlbWVudCwgd2hpbHN0IGFsc28gY2FwcGluZyBpdCBmcm9tIHB1c2hpbmcgb3V0IHRoZSBwYWdlXG4gICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gZG8gaXQgdmlhIEpTIGluc3RlYWQuICBJbiB0aGlzIGltcGxlbWVudGF0aW9uIHdlIGNhcCB0aGUgaGVpZ2h0IGJ5IHB1dHRpbmdcbiAgICAgICAgLy8gYSBtYXhIZWlnaHQgb24gdGhlIHVuZGVybHlpbmcgcmVtb3RlIHZpZGVvIHRhZy5cblxuICAgICAgICAvLyBoZWFkZXIgKyBmb290ZXIgKyBzdGF0dXMgKyBnaXZlIHVzIGF0IGxlYXN0IDEyMHB4IG9mIHNjcm9sbGJhY2sgYXQgYWxsIHRpbWVzLlxuICAgICAgICBsZXQgYXV4UGFuZWxNYXhIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLVxuICAgICAgICAgICAgICAgICg1NCArIC8vIGhlaWdodCBvZiBSb29tSGVhZGVyXG4gICAgICAgICAgICAgICAgIDM2ICsgLy8gaGVpZ2h0IG9mIHRoZSBzdGF0dXMgYXJlYVxuICAgICAgICAgICAgICAgICA1MSArIC8vIG1pbmltdW0gaGVpZ2h0IG9mIHRoZSBtZXNzYWdlIGNvbXBtb3NlclxuICAgICAgICAgICAgICAgICAxMjApOyAvLyBhbW91bnQgb2YgZGVzaXJlZCBzY3JvbGxiYWNrXG5cbiAgICAgICAgLy8gWFhYOiB0aGlzIGlzIGEgYml0IG9mIGEgaGFjayBhbmQgbWlnaHQgcG9zc2libHkgY2F1c2UgdGhlIHZpZGVvIHRvIHB1c2ggb3V0IHRoZSBwYWdlIGFueXdheVxuICAgICAgICAvLyBidXQgaXQncyBiZXR0ZXIgdGhhbiB0aGUgdmlkZW8gZ29pbmcgbWlzc2luZyBlbnRpcmVseVxuICAgICAgICBpZiAoYXV4UGFuZWxNYXhIZWlnaHQgPCA1MCkgYXV4UGFuZWxNYXhIZWlnaHQgPSA1MDtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHthdXhQYW5lbE1heEhlaWdodDogYXV4UGFuZWxNYXhIZWlnaHR9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZ1bGxzY3JlZW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZGVvX2Z1bGxzY3JlZW4nLFxuICAgICAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZSxcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NdXRlQXVkaW9DbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuZ2V0Q2FsbEZvclJvb20oKTtcbiAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSAhY2FsbC5pc01pY3JvcGhvbmVNdXRlZCgpO1xuICAgICAgICBjYWxsLnNldE1pY3JvcGhvbmVNdXRlZChuZXdTdGF0ZSk7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gVE9ETzoganVzdCB1cGRhdGUgdGhlIHZvaXAgYnV0dG9uc1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTXV0ZVZpZGVvQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhbGwgPSB0aGlzLmdldENhbGxGb3JSb29tKCk7XG4gICAgICAgIGlmICghY2FsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlID0gIWNhbGwuaXNMb2NhbFZpZGVvTXV0ZWQoKTtcbiAgICAgICAgY2FsbC5zZXRMb2NhbFZpZGVvTXV0ZWQobmV3U3RhdGUpO1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIFRPRE86IGp1c3QgdXBkYXRlIHRoZSB2b2lwIGJ1dHRvbnNcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN0YXR1c0JhclZpc2libGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHN0YXR1c0JhclZpc2libGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3RhdHVzQmFySGlkZGVuID0gKCkgPT4ge1xuICAgICAgICAvLyBUaGlzIGlzIGN1cnJlbnRseSBub3QgZGVzaXJlZCBhcyBpdCBpcyBhbm5veWluZyBpZiBpdCBrZWVwcyBleHBhbmRpbmcgYW5kIGNvbGxhcHNpbmdcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc3RhdHVzQmFyVmlzaWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBjYWxsZWQgYnkgdGhlIHBhcmVudCBjb21wb25lbnQgd2hlbiBQYWdlVXAvRG93bi9ldGMgaXMgcHJlc3NlZC5cbiAgICAgKlxuICAgICAqIFdlIHBhc3MgaXQgZG93biB0byB0aGUgc2Nyb2xsIHBhbmVsLlxuICAgICAqL1xuICAgIHByaXZhdGUgaGFuZGxlU2Nyb2xsS2V5ID0gZXYgPT4ge1xuICAgICAgICBsZXQgcGFuZWw7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHNQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICBwYW5lbCA9IHRoaXMuc2VhcmNoUmVzdWx0c1BhbmVsLmN1cnJlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tZXNzYWdlUGFuZWwpIHtcbiAgICAgICAgICAgIHBhbmVsID0gdGhpcy5tZXNzYWdlUGFuZWw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFuZWwpIHtcbiAgICAgICAgICAgIHBhbmVsLmhhbmRsZVNjcm9sbEtleShldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogZ2V0IGFueSBjdXJyZW50IGNhbGwgZm9yIHRoaXMgcm9vbVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0Q2FsbEZvclJvb20oKTogTWF0cml4Q2FsbCB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yb29tKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRDYWxsRm9yUm9vbSh0aGlzLnN0YXRlLnJvb20ucm9vbUlkKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIGhhcyB0byBiZSBhIHByb3BlciBtZXRob2QgcmF0aGVyIHRoYW4gYW4gdW5uYW1lZCBmdW5jdGlvbixcbiAgICAvLyBvdGhlcndpc2UgcmVhY3QgY2FsbHMgaXQgd2l0aCBudWxsIG9uIGVhY2ggdXBkYXRlLlxuICAgIHByaXZhdGUgZ2F0aGVyVGltZWxpbmVQYW5lbFJlZiA9IHIgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbCA9IHI7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZVRpbnQgZnJvbSBSb29tVmlldy5nYXRoZXJUaW1lbGluZVBhbmVsUmVmXCIpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUaW50KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRPbGRSb29tKCkge1xuICAgICAgICBjb25zdCBjcmVhdGVFdmVudCA9IHRoaXMuc3RhdGUucm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uY3JlYXRlXCIsIFwiXCIpO1xuICAgICAgICBpZiAoIWNyZWF0ZUV2ZW50IHx8ICFjcmVhdGVFdmVudC5nZXRDb250ZW50KClbJ3ByZWRlY2Vzc29yJ10pIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuZ2V0Um9vbShjcmVhdGVFdmVudC5nZXRDb250ZW50KClbJ3ByZWRlY2Vzc29yJ11bJ3Jvb21faWQnXSk7XG4gICAgfVxuXG4gICAgZ2V0SGlkZGVuSGlnaGxpZ2h0Q291bnQoKSB7XG4gICAgICAgIGNvbnN0IG9sZFJvb20gPSB0aGlzLmdldE9sZFJvb20oKTtcbiAgICAgICAgaWYgKCFvbGRSb29tKSByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIG9sZFJvb20uZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQoJ2hpZ2hsaWdodCcpO1xuICAgIH1cblxuICAgIG9uSGlkZGVuSGlnaGxpZ2h0c0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBvbGRSb29tID0gdGhpcy5nZXRPbGRSb29tKCk7XG4gICAgICAgIGlmICghb2xkUm9vbSkgcmV0dXJuO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJ2aWV3X3Jvb21cIiwgcm9vbV9pZDogb2xkUm9vbS5yb29tSWR9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucm9vbSkge1xuICAgICAgICAgICAgY29uc3QgbG9hZGluZyA9ICF0aGlzLnN0YXRlLm1hdHJpeENsaWVudElzUmVhZHkgfHwgdGhpcy5zdGF0ZS5yb29tTG9hZGluZyB8fCB0aGlzLnN0YXRlLnBlZWtMb2FkaW5nO1xuICAgICAgICAgICAgaWYgKGxvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICAvLyBBc3N1bWUgcHJldmlldyBsb2FkaW5nIGlmIHdlIGRvbid0IGhhdmUgYSByZWFkeSBjbGllbnQgb3IgYSByb29tIElEIChzdGlsbCByZXNvbHZpbmcgdGhlIGFsaWFzKVxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpZXdMb2FkaW5nID0gIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSB8fCAhdGhpcy5zdGF0ZS5yb29tSWQgfHwgdGhpcy5zdGF0ZS5wZWVrTG9hZGluZztcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Um9vbVByZXZpZXdCYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuUHJldmlldz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpZXdMb2FkaW5nPXtwcmV2aWV3TG9hZGluZyAmJiAhdGhpcy5zdGF0ZS5yb29tTG9hZEVycm9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcj17dGhpcy5zdGF0ZS5yb29tTG9hZEVycm9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkaW5nPXtsb2FkaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqb2luaW5nPXt0aGlzLnN0YXRlLmpvaW5pbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9vYkRhdGE9e3RoaXMucHJvcHMub29iRGF0YX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgaW52aXRlck5hbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub29iRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZSA9IHRoaXMucHJvcHMub29iRGF0YS5pbnZpdGVyTmFtZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgaW52aXRlZEVtYWlsID0gdGhpcy5wcm9wcy50aHJlZXBpZEludml0ZT8udG9FbWFpbDtcblxuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgbm8gcm9vbSBvYmplY3QgZm9yIHRoaXMgcm9vbSwgb25seSB0aGUgSUQuXG4gICAgICAgICAgICAgICAgLy8gV2UndmUgZ290IHRvIHRoaXMgcm9vbSBieSBmb2xsb3dpbmcgYSBsaW5rLCBwb3NzaWJseSBhIHRoaXJkIHBhcnR5IGludml0ZS5cbiAgICAgICAgICAgICAgICBjb25zdCByb29tQWxpYXMgPSB0aGlzLnN0YXRlLnJvb21BbGlhcztcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Um9vbVByZXZpZXdCYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Kb2luQ2xpY2s9e3RoaXMub25Kb2luQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Gb3JnZXRDbGljaz17dGhpcy5vbkZvcmdldENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblJlamVjdENsaWNrPXt0aGlzLm9uUmVqZWN0VGhyZWVwaWRJbnZpdGVCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5QcmV2aWV3PXtmYWxzZX0gZXJyb3I9e3RoaXMuc3RhdGUucm9vbUxvYWRFcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUFsaWFzPXtyb29tQWxpYXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpvaW5pbmc9e3RoaXMuc3RhdGUuam9pbmluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52aXRlck5hbWU9e2ludml0ZXJOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZpdGVkRW1haWw9e2ludml0ZWRFbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29iRGF0YT17dGhpcy5wcm9wcy5vb2JEYXRhfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWduVXJsPXt0aGlzLnByb3BzLnRocmVlcGlkSW52aXRlPy5zaWduVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG15TWVtYmVyc2hpcCA9IHRoaXMuc3RhdGUucm9vbS5nZXRNeU1lbWJlcnNoaXAoKTtcbiAgICAgICAgaWYgKG15TWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiAmJiAhdGhpcy5zdGF0ZS5yb29tLmlzU3BhY2VSb29tKCkpIHsgLy8gU3BhY2VSb29tVmlldyBoYW5kbGVzIGludml0ZXMgaXRzZWxmXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5qb2luaW5nIHx8IHRoaXMuc3RhdGUucmVqZWN0aW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbVByZXZpZXdCYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5QcmV2aWV3PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcj17dGhpcy5zdGF0ZS5yb29tTG9hZEVycm9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpvaW5pbmc9e3RoaXMuc3RhdGUuam9pbmluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3Rpbmc9e3RoaXMuc3RhdGUucmVqZWN0aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG15VXNlcklkID0gdGhpcy5jb250ZXh0LmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgICAgICAgICBjb25zdCBteU1lbWJlciA9IHRoaXMuc3RhdGUucm9vbS5nZXRNZW1iZXIobXlVc2VySWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZUV2ZW50ID0gbXlNZW1iZXIgPyBteU1lbWJlci5ldmVudHMubWVtYmVyIDogbnVsbDtcbiAgICAgICAgICAgICAgICBsZXQgaW52aXRlck5hbWUgPSBfdChcIlVua25vd25cIik7XG4gICAgICAgICAgICAgICAgaWYgKGludml0ZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGludml0ZXJOYW1lID0gaW52aXRlRXZlbnQuc2VuZGVyID8gaW52aXRlRXZlbnQuc2VuZGVyLm5hbWUgOiBpbnZpdGVFdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBkZWxpYmVyYXRlbHkgZG9uJ3QgdHJ5IHRvIHBlZWsgaW50byBpbnZpdGVzLCBldmVuIGlmIHdlIGhhdmUgcGVybWlzc2lvbiB0byBwZWVrXG4gICAgICAgICAgICAgICAgLy8gYXMgdGhleSBjb3VsZCBiZSBhIHNwYW0gdmVjdG9yLlxuICAgICAgICAgICAgICAgIC8vIFhYWDogaW4gZnV0dXJlIHdlIGNvdWxkIGdpdmUgdGhlIG9wdGlvbiBvZiBhICdQcmV2aWV3JyBidXR0b24gd2hpY2ggbGV0cyB0aGVtIHZpZXcgYW55d2F5LlxuXG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHJlZ3VsYXIgaW52aXRlIGZvciB0aGlzIHJvb20uXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21QcmV2aWV3QmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSm9pbkNsaWNrPXt0aGlzLm9uSm9pbkJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2s9e3RoaXMub25Gb3JnZXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25SZWplY3RDbGljaz17dGhpcy5vblJlamVjdEJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0QW5kSWdub3JlQ2xpY2s9e3RoaXMub25SZWplY3RBbmRJZ25vcmVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52aXRlck5hbWU9e2ludml0ZXJOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5QcmV2aWV3PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgam9pbmluZz17dGhpcy5zdGF0ZS5qb2luaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmaWxlRHJvcFRhcmdldCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRyYWdnaW5nRmlsZSkge1xuICAgICAgICAgICAgZmlsZURyb3BUYXJnZXQgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld19maWxlRHJvcFRhcmdldFwiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL3VwbG9hZC1iaWcuc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfZmlsZURyb3BUYXJnZXRfaW1hZ2VcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRHJvcCBmaWxlIGhlcmUgdG8gdXBsb2FkXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBoYXZlIHN1Y2Nlc3NmdWxseSBsb2FkZWQgdGhpcyByb29tLCBhbmQgYXJlIG5vdCBwcmV2aWV3aW5nLlxuICAgICAgICAvLyBEaXNwbGF5IHRoZSBcIm5vcm1hbFwiIHJvb20gdmlldy5cblxuICAgICAgICBsZXQgYWN0aXZlQ2FsbCA9IG51bGw7XG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIE5ldyBibG9jayBiZWNhdXNlIHRoaXMgdmFyaWFibGUgZG9lc24ndCBuZWVkIHRvIGhhbmcgYXJvdW5kIGZvciB0aGUgcmVzdCBvZiB0aGUgZnVuY3Rpb25cbiAgICAgICAgICAgIGNvbnN0IGNhbGwgPSB0aGlzLmdldENhbGxGb3JSb29tKCk7XG4gICAgICAgICAgICBpZiAoY2FsbCAmJiAodGhpcy5zdGF0ZS5jYWxsU3RhdGUgIT09ICdlbmRlZCcgJiYgdGhpcy5zdGF0ZS5jYWxsU3RhdGUgIT09ICdyaW5naW5nJykpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVDYWxsID0gY2FsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNjcm9sbGhlYWRlckNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIG14X1Jvb21WaWV3X3Njcm9sbGhlYWRlcjogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHN0YXR1c0JhcjtcbiAgICAgICAgbGV0IGlzU3RhdHVzQXJlYUV4cGFuZGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuZ2V0Q3VycmVudFVwbG9hZHMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBVcGxvYWRCYXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLlVwbG9hZEJhcicpO1xuICAgICAgICAgICAgc3RhdHVzQmFyID0gPFVwbG9hZEJhciByb29tPXt0aGlzLnN0YXRlLnJvb219IC8+O1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IFJvb21TdGF0dXNCYXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLlJvb21TdGF0dXNCYXInKTtcbiAgICAgICAgICAgIGlzU3RhdHVzQXJlYUV4cGFuZGVkID0gdGhpcy5zdGF0ZS5zdGF0dXNCYXJWaXNpYmxlO1xuICAgICAgICAgICAgc3RhdHVzQmFyID0gPFJvb21TdGF0dXNCYXJcbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgaXNQZWVraW5nPXtteU1lbWJlcnNoaXAgIT09IFwiam9pblwifVxuICAgICAgICAgICAgICAgIG9uSW52aXRlQ2xpY2s9e3RoaXMub25JbnZpdGVCdXR0b25DbGlja31cbiAgICAgICAgICAgICAgICBvblZpc2libGU9e3RoaXMub25TdGF0dXNCYXJWaXNpYmxlfVxuICAgICAgICAgICAgICAgIG9uSGlkZGVuPXt0aGlzLm9uU3RhdHVzQmFySGlkZGVufVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tVmVyc2lvblJlY29tbWVuZGF0aW9uID0gdGhpcy5zdGF0ZS51cGdyYWRlUmVjb21tZW5kYXRpb247XG4gICAgICAgIGNvbnN0IHNob3dSb29tVXBncmFkZUJhciA9IChcbiAgICAgICAgICAgIHJvb21WZXJzaW9uUmVjb21tZW5kYXRpb24gJiZcbiAgICAgICAgICAgIHJvb21WZXJzaW9uUmVjb21tZW5kYXRpb24ubmVlZHNVcGdyYWRlICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnJvb20udXNlck1heVVwZ3JhZGVSb29tKHRoaXMuY29udGV4dC5jcmVkZW50aWFscy51c2VySWQpXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgaGlkZGVuSGlnaGxpZ2h0Q291bnQgPSB0aGlzLmdldEhpZGRlbkhpZ2hsaWdodENvdW50KCk7XG5cbiAgICAgICAgbGV0IGF1eCA9IG51bGw7XG4gICAgICAgIGxldCBwcmV2aWV3QmFyO1xuICAgICAgICBsZXQgaGlkZUNhbmNlbCA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mb3J3YXJkaW5nRXZlbnQpIHtcbiAgICAgICAgICAgIGF1eCA9IDxGb3J3YXJkTWVzc2FnZSBvbkNhbmNlbENsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9IC8+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc2VhcmNoaW5nKSB7XG4gICAgICAgICAgICBoaWRlQ2FuY2VsID0gdHJ1ZTsgLy8gaGFzIG93biBjYW5jZWxcbiAgICAgICAgICAgIGF1eCA9IDxTZWFyY2hCYXJcbiAgICAgICAgICAgICAgICBzZWFyY2hJblByb2dyZXNzPXt0aGlzLnN0YXRlLnNlYXJjaEluUHJvZ3Jlc3N9XG4gICAgICAgICAgICAgICAgb25DYW5jZWxDbGljaz17dGhpcy5vbkNhbmNlbFNlYXJjaENsaWNrfVxuICAgICAgICAgICAgICAgIG9uU2VhcmNoPXt0aGlzLm9uU2VhcmNofVxuICAgICAgICAgICAgICAgIGlzUm9vbUVuY3J5cHRlZD17dGhpcy5jb250ZXh0LmlzUm9vbUVuY3J5cHRlZCh0aGlzLnN0YXRlLnJvb20ucm9vbUlkKX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9IGVsc2UgaWYgKHNob3dSb29tVXBncmFkZUJhcikge1xuICAgICAgICAgICAgYXV4ID0gPFJvb21VcGdyYWRlV2FybmluZ0JhciByb29tPXt0aGlzLnN0YXRlLnJvb219IHJlY29tbWVuZGF0aW9uPXtyb29tVmVyc2lvblJlY29tbWVuZGF0aW9ufSAvPjtcbiAgICAgICAgICAgIGhpZGVDYW5jZWwgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc2hvd2luZ1Bpbm5lZCkge1xuICAgICAgICAgICAgaGlkZUNhbmNlbCA9IHRydWU7IC8vIGhhcyBvd24gY2FuY2VsXG4gICAgICAgICAgICBhdXggPSA8UGlubmVkRXZlbnRzUGFuZWwgcm9vbT17dGhpcy5zdGF0ZS5yb29tfSBvbkNhbmNlbENsaWNrPXt0aGlzLm9uUGlubmVkQ2xpY2t9IC8+O1xuICAgICAgICB9IGVsc2UgaWYgKG15TWVtYmVyc2hpcCAhPT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvIGhhdmUgYSByb29tIG9iamVjdCBmb3IgdGhpcyByb29tLCBidXQgd2UncmUgbm90IGN1cnJlbnRseSBpbiBpdC5cbiAgICAgICAgICAgIC8vIFdlIG1heSBoYXZlIGEgM3JkIHBhcnR5IGludml0ZSB0byBpdC5cbiAgICAgICAgICAgIGxldCBpbnZpdGVyTmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9vYkRhdGEpIHtcbiAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZSA9IHRoaXMucHJvcHMub29iRGF0YS5pbnZpdGVyTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGludml0ZWRFbWFpbCA9IHRoaXMucHJvcHMudGhyZWVwaWRJbnZpdGU/LnRvRW1haWw7XG4gICAgICAgICAgICBoaWRlQ2FuY2VsID0gdHJ1ZTtcbiAgICAgICAgICAgIHByZXZpZXdCYXIgPSAoXG4gICAgICAgICAgICAgICAgPFJvb21QcmV2aWV3QmFyXG4gICAgICAgICAgICAgICAgICAgIG9uSm9pbkNsaWNrPXt0aGlzLm9uSm9pbkJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2s9e3RoaXMub25Gb3JnZXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgb25SZWplY3RDbGljaz17dGhpcy5vblJlamVjdFRocmVlcGlkSW52aXRlQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgam9pbmluZz17dGhpcy5zdGF0ZS5qb2luaW5nfVxuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZT17aW52aXRlck5hbWV9XG4gICAgICAgICAgICAgICAgICAgIGludml0ZWRFbWFpbD17aW52aXRlZEVtYWlsfVxuICAgICAgICAgICAgICAgICAgICBvb2JEYXRhPXt0aGlzLnByb3BzLm9vYkRhdGF9XG4gICAgICAgICAgICAgICAgICAgIGNhblByZXZpZXc9e3RoaXMuc3RhdGUuY2FuUGVla31cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNhblBlZWsgJiYgIXRoaXMuc3RhdGUucm9vbT8uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcHJldmlld0JhciB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaGlkZGVuSGlnaGxpZ2h0Q291bnQgPiAwKSB7XG4gICAgICAgICAgICBhdXggPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cImRpdlwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X2F1eFBhbmVsX2hpZGRlbkhpZ2hsaWdodHNcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSGlkZGVuSGlnaGxpZ2h0c0NsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJZb3UgaGF2ZSAlKGNvdW50KXMgdW5yZWFkIG5vdGlmaWNhdGlvbnMgaW4gYSBwcmlvciB2ZXJzaW9uIG9mIHRoaXMgcm9vbS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb3VudDogaGlkZGVuSGlnaGxpZ2h0Q291bnR9LFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfc3BhY2VzXCIpICYmIHRoaXMuc3RhdGUucm9vbT8uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgcmV0dXJuIDxTcGFjZVJvb21WaWV3XG4gICAgICAgICAgICAgICAgc3BhY2U9e3RoaXMuc3RhdGUucm9vbX1cbiAgICAgICAgICAgICAgICBqdXN0Q3JlYXRlZE9wdHM9e3RoaXMucHJvcHMuanVzdENyZWF0ZWRPcHRzfVxuICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQ9e3RoaXMub25Kb2luQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICBvblJlamVjdEJ1dHRvbkNsaWNrZWQ9e3RoaXMucHJvcHMudGhyZWVwaWRJbnZpdGVcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9uUmVqZWN0VGhyZWVwaWRJbnZpdGVCdXR0b25DbGlja2VkXG4gICAgICAgICAgICAgICAgICAgIDogdGhpcy5vblJlamVjdEJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF1eFBhbmVsID0gKFxuICAgICAgICAgICAgPEF1eFBhbmVsXG4gICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgIGZ1bGxIZWlnaHQ9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIHVzZXJJZD17dGhpcy5jb250ZXh0LmNyZWRlbnRpYWxzLnVzZXJJZH1cbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ9e3RoaXMuc3RhdGUuYXV4UGFuZWxNYXhIZWlnaHR9XG4gICAgICAgICAgICAgICAgc2hvd0FwcHM9e3RoaXMuc3RhdGUuc2hvd0FwcHN9XG4gICAgICAgICAgICAgICAgb25SZXNpemU9e3RoaXMub25SZXNpemV9XG4gICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBhdXggfVxuICAgICAgICAgICAgPC9BdXhQYW5lbD5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgbWVzc2FnZUNvbXBvc2VyOyBsZXQgc2VhcmNoSW5mbztcbiAgICAgICAgY29uc3QgY2FuU3BlYWsgPSAoXG4gICAgICAgICAgICAvLyBqb2luZWQgYW5kIG5vdCBzaG93aW5nIHNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICBteU1lbWJlcnNoaXAgPT09ICdqb2luJyAmJiAhdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzXG4gICAgICAgICk7XG4gICAgICAgIGlmIChjYW5TcGVhaykge1xuICAgICAgICAgICAgY29uc3QgTWVzc2FnZUNvbXBvc2VyID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuTWVzc2FnZUNvbXBvc2VyJyk7XG4gICAgICAgICAgICBtZXNzYWdlQ29tcG9zZXIgPVxuICAgICAgICAgICAgICAgIDxNZXNzYWdlQ29tcG9zZXJcbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgICAgICBjYWxsU3RhdGU9e3RoaXMuc3RhdGUuY2FsbFN0YXRlfVxuICAgICAgICAgICAgICAgICAgICBzaG93QXBwcz17dGhpcy5zdGF0ZS5zaG93QXBwc31cbiAgICAgICAgICAgICAgICAgICAgZTJlU3RhdHVzPXt0aGlzLnN0YXRlLmUyZVN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5zdGF0ZS5yZXBseVRvRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMuZ2V0UGVybWFsaW5rQ3JlYXRvckZvclJvb20odGhpcy5zdGF0ZS5yb29tKX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IFdoeSBhcmVuJ3Qgd2Ugc3RvcmluZyB0aGUgdGVybS9zY29wZS9jb3VudCBpbiB0aGlzIGZvcm1hdFxuICAgICAgICAvLyBpbiB0aGlzLnN0YXRlIGlmIHRoaXMgaXMgd2hhdCBSb29tSGVhZGVyIGRlc2lyZXM/XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMpIHtcbiAgICAgICAgICAgIHNlYXJjaEluZm8gPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoVGVybTogdGhpcy5zdGF0ZS5zZWFyY2hUZXJtLFxuICAgICAgICAgICAgICAgIHNlYXJjaFNjb3BlOiB0aGlzLnN0YXRlLnNlYXJjaFNjb3BlLFxuICAgICAgICAgICAgICAgIHNlYXJjaENvdW50OiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMuY291bnQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBzZWFyY2ggcmVzdWx0cywgd2Uga2VlcCB0aGUgbWVzc2FnZXBhbmVsIChzbyB0aGF0IGl0IHByZXNlcnZlcyBpdHNcbiAgICAgICAgLy8gc2Nyb2xsIHN0YXRlKSwgYnV0IGhpZGUgaXQuXG4gICAgICAgIGxldCBzZWFyY2hSZXN1bHRzUGFuZWw7XG4gICAgICAgIGxldCBoaWRlTWVzc2FnZVBhbmVsID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cykge1xuICAgICAgICAgICAgLy8gc2hvdyBzZWFyY2hpbmcgc3Bpbm5lclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5jb3VudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0c1BhbmVsID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbCBteF9Sb29tVmlld19tZXNzYWdlUGFuZWxTZWFyY2hTcGlubmVyXCIgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRzUGFuZWwgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxTY3JvbGxQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnNlYXJjaFJlc3VsdHNQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbCBteF9Sb29tVmlld19zZWFyY2hSZXN1bHRzUGFuZWwgbXhfR3JvdXBMYXlvdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25GaWxsUmVxdWVzdD17dGhpcy5vblNlYXJjaFJlc3VsdHNGaWxsUmVxdWVzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtzY3JvbGxoZWFkZXJDbGFzc2VzfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmdldFNlYXJjaFJlc3VsdFRpbGVzKCkgfVxuICAgICAgICAgICAgICAgICAgICA8L1Njcm9sbFBhbmVsPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoaWRlTWVzc2FnZVBhbmVsID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNob3VsZEhpZ2hsaWdodCA9IHRoaXMuc3RhdGUuaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZDtcbiAgICAgICAgbGV0IGhpZ2hsaWdodGVkRXZlbnRJZCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZvcndhcmRpbmdFdmVudCkge1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRFdmVudElkID0gdGhpcy5zdGF0ZS5mb3J3YXJkaW5nRXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChzaG91bGRIaWdobGlnaHQpIHtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZCA9IHRoaXMuc3RhdGUuaW5pdGlhbEV2ZW50SWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZXNzYWdlUGFuZWxDbGFzc05hbWVzID0gY2xhc3NOYW1lcyhcbiAgICAgICAgICAgIFwibXhfUm9vbVZpZXdfbWVzc2FnZVBhbmVsXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJteF9JUkNMYXlvdXRcIjogdGhpcy5zdGF0ZS5sYXlvdXQgPT0gTGF5b3V0LklSQyxcbiAgICAgICAgICAgICAgICBcIm14X0dyb3VwTGF5b3V0XCI6IHRoaXMuc3RhdGUubGF5b3V0ID09IExheW91dC5Hcm91cCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNvbnNvbGUuaW5mbyhcIlNob3dVcmxQcmV2aWV3IGZvciAlcyBpcyAlc1wiLCB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLCB0aGlzLnN0YXRlLnNob3dVcmxQcmV2aWV3KTtcbiAgICAgICAgY29uc3QgbWVzc2FnZVBhbmVsID0gKFxuICAgICAgICAgICAgPFRpbWVsaW5lUGFuZWxcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuZ2F0aGVyVGltZWxpbmVQYW5lbFJlZn1cbiAgICAgICAgICAgICAgICB0aW1lbGluZVNldD17dGhpcy5zdGF0ZS5yb29tLmdldFVuZmlsdGVyZWRUaW1lbGluZVNldCgpfVxuICAgICAgICAgICAgICAgIHNob3dSZWFkUmVjZWlwdHM9e3RoaXMuc3RhdGUuc2hvd1JlYWRSZWNlaXB0c31cbiAgICAgICAgICAgICAgICBtYW5hZ2VSZWFkUmVjZWlwdHM9eyF0aGlzLnN0YXRlLmlzUGVla2luZ31cbiAgICAgICAgICAgICAgICBzZW5kUmVhZFJlY2VpcHRPbkxvYWQ9eyF0aGlzLnN0YXRlLndhc0NvbnRleHRTd2l0Y2h9XG4gICAgICAgICAgICAgICAgbWFuYWdlUmVhZE1hcmtlcnM9eyF0aGlzLnN0YXRlLmlzUGVla2luZ31cbiAgICAgICAgICAgICAgICBoaWRkZW49e2hpZGVNZXNzYWdlUGFuZWx9XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWRFdmVudElkPXtoaWdobGlnaHRlZEV2ZW50SWR9XG4gICAgICAgICAgICAgICAgZXZlbnRJZD17dGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRJZH1cbiAgICAgICAgICAgICAgICBldmVudFBpeGVsT2Zmc2V0PXt0aGlzLnN0YXRlLmluaXRpYWxFdmVudFBpeGVsT2Zmc2V0fVxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uTWVzc2FnZUxpc3RTY3JvbGx9XG4gICAgICAgICAgICAgICAgb25SZWFkTWFya2VyVXBkYXRlZD17dGhpcy51cGRhdGVUb3BVbnJlYWRNZXNzYWdlc0Jhcn1cbiAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldyA9IHt0aGlzLnN0YXRlLnNob3dVcmxQcmV2aWV3fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWVzc2FnZVBhbmVsQ2xhc3NOYW1lc31cbiAgICAgICAgICAgICAgICBtZW1iZXJzTG9hZGVkPXt0aGlzLnN0YXRlLm1lbWJlcnNMb2FkZWR9XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5nZXRQZXJtYWxpbmtDcmVhdG9yRm9yUm9vbSh0aGlzLnN0YXRlLnJvb20pfVxuICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgIHNob3dSZWFjdGlvbnM9e3RydWV9XG4gICAgICAgICAgICAgICAgbGF5b3V0PXt0aGlzLnN0YXRlLmxheW91dH1cbiAgICAgICAgICAgIC8+KTtcblxuICAgICAgICBsZXQgdG9wVW5yZWFkTWVzc2FnZXNCYXIgPSBudWxsO1xuICAgICAgICAvLyBEbyBub3Qgc2hvdyBUb3BVbnJlYWRNZXNzYWdlc0JhciBpZiB3ZSBoYXZlIHNlYXJjaCByZXN1bHRzIHNob3dpbmcsIGl0IG1ha2VzIG5vIHNlbnNlXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dUb3BVbnJlYWRNZXNzYWdlc0JhciAmJiAhdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzKSB7XG4gICAgICAgICAgICBjb25zdCBUb3BVbnJlYWRNZXNzYWdlc0JhciA9IHNkay5nZXRDb21wb25lbnQoJ3Jvb21zLlRvcFVucmVhZE1lc3NhZ2VzQmFyJyk7XG4gICAgICAgICAgICB0b3BVbnJlYWRNZXNzYWdlc0JhciA9IChcbiAgICAgICAgICAgICAgICA8VG9wVW5yZWFkTWVzc2FnZXNCYXIgb25TY3JvbGxVcENsaWNrPXt0aGlzLmp1bXBUb1JlYWRNYXJrZXJ9IG9uQ2xvc2VDbGljaz17dGhpcy5mb3JnZXRSZWFkTWFya2VyfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQganVtcFRvQm90dG9tO1xuICAgICAgICAvLyBEbyBub3Qgc2hvdyBKdW1wVG9Cb3R0b21CdXR0b24gaWYgd2UgaGF2ZSBzZWFyY2ggcmVzdWx0cyBzaG93aW5nLCBpdCBtYWtlcyBubyBzZW5zZVxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZSAmJiAhdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzKSB7XG4gICAgICAgICAgICBjb25zdCBKdW1wVG9Cb3R0b21CdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5KdW1wVG9Cb3R0b21CdXR0b24nKTtcbiAgICAgICAgICAgIGp1bXBUb0JvdHRvbSA9ICg8SnVtcFRvQm90dG9tQnV0dG9uXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0PXt0aGlzLnN0YXRlLnJvb20uZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQoJ2hpZ2hsaWdodCcpID4gMH1cbiAgICAgICAgICAgICAgICBudW1VbnJlYWRNZXNzYWdlcz17dGhpcy5zdGF0ZS5udW1VbnJlYWRNZXNzYWdlc31cbiAgICAgICAgICAgICAgICBvblNjcm9sbFRvQm90dG9tQ2xpY2s9e3RoaXMuanVtcFRvTGl2ZVRpbWVsaW5lfVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdHVzQmFyQXJlYUNsYXNzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21WaWV3X3N0YXR1c0FyZWFcIiwge1xuICAgICAgICAgICAgXCJteF9Sb29tVmlld19zdGF0dXNBcmVhX2V4cGFuZGVkXCI6IGlzU3RhdHVzQXJlYUV4cGFuZGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzaG93UmlnaHRQYW5lbCA9IHRoaXMuc3RhdGUucm9vbSAmJiB0aGlzLnN0YXRlLnNob3dSaWdodFBhbmVsO1xuICAgICAgICBjb25zdCByaWdodFBhbmVsID0gc2hvd1JpZ2h0UGFuZWxcbiAgICAgICAgICAgID8gPFJpZ2h0UGFuZWwgcm9vbT17dGhpcy5zdGF0ZS5yb29tfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0gLz5cbiAgICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICBjb25zdCB0aW1lbGluZUNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfUm9vbVZpZXdfdGltZWxpbmVcIiwge1xuICAgICAgICAgICAgbXhfUm9vbVZpZXdfdGltZWxpbmVfcnJfZW5hYmxlZDogdGhpcy5zdGF0ZS5zaG93UmVhZFJlY2VpcHRzLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBtYWluQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9Sb29tVmlld1wiLCB7XG4gICAgICAgICAgICBteF9Sb29tVmlld19pbkNhbGw6IEJvb2xlYW4oYWN0aXZlQ2FsbCksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNob3dDaGF0RWZmZWN0cyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3Nob3dDaGF0RWZmZWN0cycpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Um9vbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3RoaXMuc3RhdGV9PlxuICAgICAgICAgICAgICAgIDxtYWluIGNsYXNzTmFtZT17bWFpbkNsYXNzZXN9IHJlZj17dGhpcy5yb29tVmlld30gb25LZXlEb3duPXt0aGlzLm9uUmVhY3RLZXlEb3dufT5cbiAgICAgICAgICAgICAgICAgICAge3Nob3dDaGF0RWZmZWN0cyAmJiB0aGlzLnJvb21WaWV3LmN1cnJlbnQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIDxFZmZlY3RzT3ZlcmxheSByb29tV2lkdGg9e3RoaXMucm9vbVZpZXcuY3VycmVudC5vZmZzZXRXaWR0aH0gLz5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tSGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEluZm89e3NlYXJjaEluZm99XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb29iRGF0YT17dGhpcy5wcm9wcy5vb2JEYXRhfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUm9vbT17bXlNZW1iZXJzaGlwID09PSAnam9pbid9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TZWFyY2hDbGljaz17dGhpcy5vblNlYXJjaENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2V0dGluZ3NDbGljaz17dGhpcy5vblNldHRpbmdzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25QaW5uZWRDbGljaz17dGhpcy5vblBpbm5lZENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsQ2xpY2s9eyhhdXggJiYgIWhpZGVDYW5jZWwpID8gdGhpcy5vbkNhbmNlbENsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvcmdldENsaWNrPXsobXlNZW1iZXJzaGlwID09PSBcImxlYXZlXCIpID8gdGhpcy5vbkZvcmdldENsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkxlYXZlQ2xpY2s9eyhteU1lbWJlcnNoaXAgPT09IFwiam9pblwiKSA/IHRoaXMub25MZWF2ZUNsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlMmVTdGF0dXM9e3RoaXMuc3RhdGUuZTJlU3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQXBwc0NsaWNrPXt0aGlzLnN0YXRlLmhhc1Bpbm5lZFdpZGdldHMgPyB0aGlzLm9uQXBwc0NsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBzU2hvd249e3RoaXMuc3RhdGUuc2hvd0FwcHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DYWxsUGxhY2VkPXt0aGlzLm9uQ2FsbFBsYWNlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TWFpblNwbGl0IHBhbmVsPXtyaWdodFBhbmVsfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld19ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthdXhQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RpbWVsaW5lQ2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmlsZURyb3BUYXJnZXR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dG9wVW5yZWFkTWVzc2FnZXNCYXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7anVtcFRvQm90dG9tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge21lc3NhZ2VQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzZWFyY2hSZXN1bHRzUGFuZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17c3RhdHVzQmFyQXJlYUNsYXNzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfc3RhdHVzQXJlYUJveFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfc3RhdHVzQXJlYUJveF9saW5lXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzQmFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cHJldmlld0Jhcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge21lc3NhZ2VDb21wb3Nlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvTWFpblNwbGl0PlxuICAgICAgICAgICAgICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgPC9tYWluPlxuICAgICAgICAgICAgPC9Sb29tQ29udGV4dC5Qcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=