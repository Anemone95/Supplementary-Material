"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

var ObjectUtils = _interopRequireWildcard(require("../../ObjectUtils"));

var Rooms = _interopRequireWildcard(require("../../Rooms"));

var _Searching = _interopRequireWildcard(require("../../Searching"));

var _Keyboard = require("../../Keyboard");

var _MainSplit = _interopRequireDefault(require("./MainSplit"));

var _RightPanel = _interopRequireDefault(require("./RightPanel"));

var _RoomViewStore = _interopRequireDefault(require("../../stores/RoomViewStore"));

var _RoomScrollStateStore = _interopRequireDefault(require("../../stores/RoomScrollStateStore"));

var _WidgetEchoStore = _interopRequireDefault(require("../../stores/WidgetEchoStore"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

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

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2018, 2019 New Vector Ltd
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
// TODO: This component is enormous! There's several things which could stand-alone:
//  - Search results component
//  - Drag and drop
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
    useIRCLayout: boolean;
    matrixClientIsReady: boolean;
    showUrlPreview?: boolean;
    e2eStatus?: E2EStatus;
    rejecting?: boolean;
    rejectError?: Error;
    hasPinnedWidgets?: boolean;
}*/


class RoomView extends _react.default.Component
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
        showReadReceipts: _SettingsStore.default.getValue("showReadReceipts", roomId)
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
        useIRCLayout: _SettingsStore.default.getValue("useIRCLayout")
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

      switch (ev.key) {
        case _Keyboard.Key.ESCAPE:
          if (!ev.altKey && !ev.ctrlKey && !ev.shiftKey && !ev.metaKey) {
            this.messagePanel.forgetReadMarker();
            this.jumpToLiveTimeline();
            handled = true;
          }

          break;

        case _Keyboard.Key.PAGE_UP:
          if (!ev.altKey && !ev.ctrlKey && ev.shiftKey && !ev.metaKey) {
            this.jumpToReadMarker();
            handled = true;
          }

          break;

        case _Keyboard.Key.U: // Mac returns lowercase

        case _Keyboard.Key.U.toUpperCase():
          if ((0, _Keyboard.isOnlyCtrlOrCmdIgnoreShiftKeyEvent)(ev) && ev.shiftKey) {
            _dispatcher.default.dispatch({
              action: "upload_file"
            }, true);

            handled = true;
          }

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
        case 'upload_started':
        case 'upload_finished':
        case 'upload_canceled':
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
              inviteSignUrl: signUrl,
              viaServers: this.props.viaServers
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
    (0, _defineProperty2.default)(this, "onDragOver", ev => {
      ev.stopPropagation();
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'none';

      if (ev.dataTransfer.types.includes("Files") || ev.dataTransfer.types.includes("application/x-moz-file")) {
        this.setState({
          draggingFile: true
        });
        ev.dataTransfer.dropEffect = 'copy';
      }
    });
    (0, _defineProperty2.default)(this, "onDrop", ev => {
      ev.stopPropagation();
      ev.preventDefault();

      _ContentMessages.default.sharedInstance().sendContentListToRoom(ev.dataTransfer.files, this.state.room.roomId, this.context);

      this.setState({
        draggingFile: false
      });

      _dispatcher.default.fire(_actions.Action.FocusComposer);
    });
    (0, _defineProperty2.default)(this, "onDragLeaveOrEnd", ev => {
      ev.stopPropagation();
      ev.preventDefault();
      this.setState({
        draggingFile: false
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
    (0, _defineProperty2.default)(this, "onRejectButtonClicked", ev => {
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
    (0, _defineProperty2.default)(this, "onRejectThreepidInviteButtonClicked", ev => {
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
      useIRCLayout: _SettingsStore.default.getValue("useIRCLayout"),
      matrixClientIsReady: this.context && this.context.isInitialSyncComplete()
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
    this.layoutWatcherRef = _SettingsStore.default.watchSetting("useIRCLayout", null, this.onLayoutChange);
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
      if (this.props.autoJoin) {
        this.onJoinButtonClicked();
      } else if (!room && shouldPeek) {
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
    return !ObjectUtils.shallowEqual(this.props, nextProps) || !ObjectUtils.shallowEqual(this.state, nextState);
  }

  componentDidUpdate() {
    if (this.roomView.current) {
      const roomView = this.roomView.current;

      if (!roomView.ondrop) {
        roomView.addEventListener('drop', this.onDrop);
        roomView.addEventListener('dragover', this.onDragOver);
        roomView.addEventListener('dragleave', this.onDragLeaveOrEnd);
        roomView.addEventListener('dragend', this.onDragLeaveOrEnd);
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
      roomView.removeEventListener('dragleave', this.onDragLeaveOrEnd);
      roomView.removeEventListener('dragend', this.onDragLeaveOrEnd);
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

    if (myMembership == 'invite') {
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

      if (!this.state.canPeek) {
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

    const auxPanel = /*#__PURE__*/_react.default.createElement(_AuxPanel.default, {
      room: this.state.room,
      fullHeight: false,
      userId: this.context.credentials.userId,
      draggingFile: this.state.draggingFile,
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
      "mx_IRCLayout": this.state.useIRCLayout,
      "mx_GroupLayout": !this.state.useIRCLayout
    }); // console.info("ShowUrlPreview for %s is %s", this.state.room.roomId, this.state.showUrlPreview);

    const messagePanel = /*#__PURE__*/_react.default.createElement(_TimelinePanel.default, {
      ref: this.gatherTimelinePanelRef,
      timelineSet: this.state.room.getUnfilteredTimelineSet(),
      showReadReceipts: this.state.showReadReceipts,
      manageReadReceipts: !this.state.isPeeking,
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
      useIRCLayout: this.state.useIRCLayout
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
      appsShown: this.state.showApps
    }), /*#__PURE__*/_react.default.createElement(_MainSplit.default, {
      panel: rightPanel,
      resizeNotifier: this.props.resizeNotifier
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_body"
    }, auxPanel, /*#__PURE__*/_react.default.createElement("div", {
      className: timelineClasses
    }, topUnreadMessagesBar, jumpToBottom, messagePanel, searchResultsPanel), /*#__PURE__*/_react.default.createElement("div", {
      className: statusBarAreaClass
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_statusAreaBox"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_statusAreaBox_line"
    }), statusBar)), previewBar, messageComposer)))));
  }

}

exports.default = RoomView;
(0, _defineProperty2.default)(RoomView, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUm9vbVZpZXcudHN4Il0sIm5hbWVzIjpbIkRFQlVHIiwiZGVidWdsb2ciLCJtc2ciLCJCUk9XU0VSX1NVUFBPUlRTX1NBTkRCT1giLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjb25zb2xlIiwibG9nIiwiYmluZCIsIlJvb21WaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInN0YXRlIiwicm9vbSIsImNoZWNrV2lkZ2V0cyIsInNldFN0YXRlIiwiaGFzUGlubmVkV2lkZ2V0cyIsIldpZGdldExheW91dFN0b3JlIiwiaW5zdGFuY2UiLCJnZXRDb250YWluZXJXaWRnZXRzIiwiQ29udGFpbmVyIiwiVG9wIiwibGVuZ3RoIiwic2hvd0FwcHMiLCJzaG91bGRTaG93QXBwcyIsInNob3dSZWFkUmVjZWlwdHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJyb29tSWQiLCJpbml0aWFsIiwidW5tb3VudGVkIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsIm5ld1N0YXRlIiwicm9vbUFsaWFzIiwiZ2V0Um9vbUFsaWFzIiwicm9vbUxvYWRpbmciLCJpc1Jvb21Mb2FkaW5nIiwicm9vbUxvYWRFcnJvciIsImdldFJvb21Mb2FkRXJyb3IiLCJqb2luaW5nIiwiaXNKb2luaW5nIiwiaW5pdGlhbEV2ZW50SWQiLCJnZXRJbml0aWFsRXZlbnRJZCIsImlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQiLCJyZXBseVRvRXZlbnQiLCJnZXRRdW90aW5nRXZlbnQiLCJmb3J3YXJkaW5nRXZlbnQiLCJnZXRGb3J3YXJkaW5nRXZlbnQiLCJzaG91bGRQZWVrIiwibWF0cml4Q2xpZW50SXNSZWFkeSIsInNob3dpbmdQaW5uZWQiLCJzdG9wUGVla2luZyIsImdldFJvb20iLCJvblJvb21Mb2FkZWQiLCJyb29tU2Nyb2xsU3RhdGUiLCJSb29tU2Nyb2xsU3RhdGVTdG9yZSIsImdldFNjcm9sbFN0YXRlIiwiZm9jdXNzZWRFdmVudCIsImluaXRpYWxFdmVudFBpeGVsT2Zmc2V0IiwicGl4ZWxPZmZzZXQiLCJzZWFyY2hSZXN1bHRzIiwic2V0dXBSb29tIiwib25XaWRnZXRFY2hvU3RvcmVVcGRhdGUiLCJ1c2VJUkNMYXlvdXQiLCJzaG93UmlnaHRQYW5lbCIsIlJpZ2h0UGFuZWxTdG9yZSIsImdldFNoYXJlZEluc3RhbmNlIiwiaXNPcGVuRm9yUm9vbSIsImV2ZW50IiwiQ29udGVudE1lc3NhZ2VzIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRDdXJyZW50VXBsb2FkcyIsInJldHVyblZhbHVlIiwiZ2V0Q2FsbEZvclJvb20iLCJjYWxsU3RhdGUiLCJldiIsImhhbmRsZWQiLCJrZXkiLCJLZXkiLCJFU0NBUEUiLCJhbHRLZXkiLCJjdHJsS2V5Iiwic2hpZnRLZXkiLCJtZXRhS2V5IiwibWVzc2FnZVBhbmVsIiwiZm9yZ2V0UmVhZE1hcmtlciIsImp1bXBUb0xpdmVUaW1lbGluZSIsIlBBR0VfVVAiLCJqdW1wVG9SZWFkTWFya2VyIiwiVSIsInRvVXBwZXJDYXNlIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInBheWxvYWQiLCJjaGVja0Rlc2t0b3BOb3RpZmljYXRpb25zIiwiaW5qZWN0U3RpY2tlciIsImRhdGEiLCJjb250ZW50IiwidXJsIiwiaW5mbyIsImRlc2NyaXB0aW9uIiwibmFtZSIsInNlbmRDb250ZW50TGlzdFRvUm9vbSIsImZpbGUiLCJmb3JjZVVwZGF0ZSIsInJvb21faWQiLCJjYWxsIiwic2hvdyIsIm9uQ2FuY2VsU2VhcmNoQ2xpY2siLCJzZXRJbW1lZGlhdGUiLCJkZWZlcnJlZF9hY3Rpb24iLCJpc0luaXRpYWxTeW5jQ29tcGxldGUiLCJvblJvb21WaWV3U3RvcmVVcGRhdGUiLCJvblNlYXJjaENsaWNrIiwidG9TdGFydE9mVGltZWxpbmUiLCJyZW1vdmVkIiwidGltZWxpbmUiLCJnZXRUaW1lbGluZVNldCIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsImdldFR5cGUiLCJ1cGRhdGVQcmV2aWV3VXJsVmlzaWJpbGl0eSIsInVwZGF0ZUUyRVN0YXR1cyIsImxpdmVFdmVudCIsImdldFNlbmRlciIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwiYXRFbmRPZkxpdmVUaW1lbGluZSIsIm51bVVucmVhZE1lc3NhZ2VzIiwiaXNEZWNyeXB0aW9uRmFpbHVyZSIsImhhbmRsZUVmZmVjdHMiLCJpc0JlaW5nRGVjcnlwdGVkIiwibm90aWZTdGF0ZSIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiZ2V0Um9vbVN0YXRlIiwiaXNVbnJlYWQiLCJDSEFUX0VGRkVDVFMiLCJmb3JFYWNoIiwiZWZmZWN0IiwiZ2V0Q29udGVudCIsImVtb2ppcyIsIm1zZ3R5cGUiLCJtc2dUeXBlIiwiY29tbWFuZCIsImNhblJlc2V0VGltZWxpbmUiLCJvbiIsImVtaXNzaW9uRm9yUm9vbSIsIm9uV2lkZ2V0TGF5b3V0Q2hhbmdlIiwiY2FsY3VsYXRlUGVla1J1bGVzIiwibG9hZE1lbWJlcnNJZkpvaW5lZCIsImNhbGN1bGF0ZVJlY29tbWVuZGVkVmVyc2lvbiIsInVwZGF0ZVBlcm1pc3Npb25zIiwib2ZmIiwiZGV2aWNlIiwiY3VycmVudFN0YXRlIiwiZ2V0TWVtYmVyIiwidHJ1c3RTdGF0dXMiLCJ0eXBlIiwiY29sb3JTY2hlbWUiLCJUaW50ZXIiLCJ0aW50IiwicHJpbWFyeV9jb2xvciIsInNlY29uZGFyeV9jb2xvciIsIm1lbWJlciIsInVwZGF0ZVJvb21NZW1iZXJzIiwibWVtYmVyc2hpcCIsIm9sZE1lbWJlcnNoaXAiLCJ1cGRhdGVETVN0YXRlIiwiYmFja3dhcmRzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJuZXh0X2JhdGNoIiwic2VhcmNoUHJvbWlzZSIsImhhbmRsZVNlYXJjaFJlc3VsdCIsImlzR3Vlc3QiLCJ0aGVuIiwic2lnblVybCIsInRocmVlcGlkSW52aXRlIiwib3B0cyIsImludml0ZVNpZ25VcmwiLCJ2aWFTZXJ2ZXJzIiwiX3R5cGUiLCJpc0F0RW5kT2ZMaXZlVGltZWxpbmUiLCJ1cGRhdGVUb3BVbnJlYWRNZXNzYWdlc0JhciIsImRhdGFUcmFuc2ZlciIsImRyb3BFZmZlY3QiLCJ0eXBlcyIsImluY2x1ZGVzIiwiZHJhZ2dpbmdGaWxlIiwiZmlsZXMiLCJmaXJlIiwiQWN0aW9uIiwiRm9jdXNDb21wb3NlciIsInRlcm0iLCJzY29wZSIsInNlYXJjaFRlcm0iLCJzZWFyY2hTY29wZSIsInNlYXJjaEhpZ2hsaWdodHMiLCJzZWFyY2hSZXN1bHRzUGFuZWwiLCJjdXJyZW50IiwicmVzZXRTY3JvbGxTdGF0ZSIsInNlYXJjaElkIiwiRGF0ZSIsImdldFRpbWUiLCJub3dTaG93aW5nUGlubmVkIiwic2VhcmNoaW5nIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJST09NX0RFVklDRSIsInVwZGF0ZVRpbnQiLCJyZWplY3RpbmciLCJsZWF2ZSIsImVycm9yIiwibWVzc2FnZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwicmVqZWN0RXJyb3IiLCJteU1lbWJlciIsImdldFVzZXJJZCIsImludml0ZUV2ZW50IiwiZXZlbnRzIiwiaWdub3JlZFVzZXJzIiwiZ2V0SWdub3JlZFVzZXJzIiwicHVzaCIsInNldElnbm9yZWRVc2VycyIsIlZpZXdSb29tRGlyZWN0b3J5Iiwic2hvd0JhciIsImNhbkp1bXBUb1JlYWRNYXJrZXIiLCJzaG93VG9wVW5yZWFkTWVzc2FnZXNCYXIiLCJhdXhQYW5lbE1heEhlaWdodCIsIndpbmRvdyIsImlubmVySGVpZ2h0IiwiZnVsbHNjcmVlbiIsImlzTWljcm9waG9uZU11dGVkIiwic2V0TWljcm9waG9uZU11dGVkIiwiaXNMb2NhbFZpZGVvTXV0ZWQiLCJzZXRMb2NhbFZpZGVvTXV0ZWQiLCJzdGF0dXNCYXJWaXNpYmxlIiwicGFuZWwiLCJoYW5kbGVTY3JvbGxLZXkiLCJyIiwib2xkUm9vbSIsImdldE9sZFJvb20iLCJsbE1lbWJlcnMiLCJoYXNMYXp5TG9hZE1lbWJlcnNFbmFibGVkIiwicGVla0xvYWRpbmciLCJtZW1iZXJzTG9hZGVkIiwiZ3Vlc3RzQ2FuSm9pbiIsImNhblBlZWsiLCJpc1BlZWtpbmciLCJhdEVuZE9mTGl2ZVRpbWVsaW5lSW5pdCIsImNhblJlYWN0IiwiY2FuUmVwbHkiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIm9uUm9vbSIsIm9uUm9vbVRpbWVsaW5lIiwib25Sb29tTmFtZSIsIm9uUm9vbUFjY291bnREYXRhIiwib25Sb29tU3RhdGVFdmVudHMiLCJvblJvb21TdGF0ZU1lbWJlciIsIm9uTXlNZW1iZXJzaGlwIiwib25BY2NvdW50RGF0YSIsIm9uS2V5QmFja3VwU3RhdHVzIiwib25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkIiwib25Vc2VyVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIm9uQ3Jvc3NTaWduaW5nS2V5c0NoYW5nZWQiLCJvbkV2ZW50RGVjcnlwdGVkIiwib25FdmVudCIsInJvb21TdG9yZVRva2VuIiwiYWRkTGlzdGVuZXIiLCJyaWdodFBhbmVsU3RvcmVUb2tlbiIsIm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlIiwiV2lkZ2V0RWNob1N0b3JlIiwiVVBEQVRFX0VWRU5UIiwiV2lkZ2V0U3RvcmUiLCJvbldpZGdldFN0b3JlVXBkYXRlIiwic2hvd1JlYWRSZWNlaXB0c1dhdGNoUmVmIiwid2F0Y2hTZXR0aW5nIiwib25SZWFkUmVjZWlwdHNDaGFuZ2UiLCJsYXlvdXRXYXRjaGVyUmVmIiwib25MYXlvdXRDaGFuZ2UiLCJnZXRQZXJtYWxpbmtDcmVhdG9yRm9yUm9vbSIsInBlcm1hbGlua0NyZWF0b3JzIiwiUm9vbVBlcm1hbGlua0NyZWF0b3IiLCJzdGFydCIsImxvYWQiLCJzdG9wQWxsUGVybWFsaW5rQ3JlYXRvcnMiLCJPYmplY3QiLCJrZXlzIiwic3RvcCIsImF1dG9Kb2luIiwib25Kb2luQnV0dG9uQ2xpY2tlZCIsInBlZWtJblJvb20iLCJjYXRjaCIsImVyciIsImVycmNvZGUiLCJoaWRlV2lkZ2V0RHJhd2VyIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImlzTWFudWFsbHlTaG93biIsIndpZGdldHMiLCJjb21wb25lbnREaWRNb3VudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvblBhZ2VVbmxvYWQiLCJyZXNpemVOb3RpZmllciIsIm9uUmVzaXplIiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwibmV4dFByb3BzIiwibmV4dFN0YXRlIiwiT2JqZWN0VXRpbHMiLCJzaGFsbG93RXF1YWwiLCJjb21wb25lbnREaWRVcGRhdGUiLCJyb29tVmlldyIsIm9uZHJvcCIsIm9uRHJvcCIsIm9uRHJhZ092ZXIiLCJvbkRyYWdMZWF2ZU9yRW5kIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJzZXRTY3JvbGxTdGF0ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmUiLCJ1bndhdGNoU2V0dGluZyIsImNhbmNlbFBlbmRpbmdDYWxsIiwidXBncmFkZVJlY29tbWVuZGF0aW9uIiwiZ2V0UmVjb21tZW5kZWRWZXJzaW9uIiwiZ2V0TXlNZW1iZXJzaGlwIiwibG9hZE1lbWJlcnNJZk5lZWRlZCIsImVycm9yTWVzc2FnZSIsImd1ZXN0QWNjZXNzRXZlbnQiLCJnZXRTdGF0ZUV2ZW50cyIsImd1ZXN0X2FjY2VzcyIsImhpc3RvcnlWaXNpYmlsaXR5IiwiaGlzdG9yeV92aXNpYmlsaXR5IiwiaXNSb29tRW5jcnlwdGVkIiwic2hvd1VybFByZXZpZXciLCJpc0NyeXB0b0VuYWJsZWQiLCJlMmVTdGF0dXMiLCJFMkVTdGF0dXMiLCJXYXJuaW5nIiwibWUiLCJtYXlTZW5kRXZlbnQiLCJtYXlTZW5kTWVzc2FnZSIsIm1lbWJlckNvdW50IiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJnZXRJbnZpdGVkTWVtYmVyQ291bnQiLCJOb3RpZmllciIsInNob3VsZFNob3dQcm9tcHQiLCJkbUludml0ZXIiLCJnZXRETUludml0ZXIiLCJSb29tcyIsInNldERNUm9vbSIsInRleHQiLCJzZW5kU3RpY2tlckNvbnRlbnRUb1Jvb20iLCJ1bmRlZmluZWQiLCJsb2NhbFNlYXJjaElkIiwic2VhcmNoSW5Qcm9ncmVzcyIsInJlc3VsdHMiLCJoaWdobGlnaHRzIiwiaW5kZXhPZiIsImNvbmNhdCIsInNvcnQiLCJhIiwiYiIsImZpbmFsbHkiLCJnZXRTZWFyY2hSZXN1bHRUaWxlcyIsIlNlYXJjaFJlc3VsdFRpbGUiLCJTcGlubmVyIiwicmV0Iiwib25IZWlnaHRDaGFuZ2VkIiwic2Nyb2xsUGFuZWwiLCJjaGVja1Njcm9sbCIsImxhc3RSb29tSWQiLCJpIiwicmVzdWx0IiwibXhFdiIsImdldEV2ZW50IiwiZ2V0SWQiLCJyZXN1bHRMaW5rIiwic2Nyb2xsU3RhdGUiLCJzdHVja0F0Qm90dG9tIiwidHJhY2tlZFNjcm9sbFRva2VuIiwiQ2FsbEhhbmRsZXIiLCJjcmVhdGVFdmVudCIsImdldEhpZGRlbkhpZ2hsaWdodENvdW50IiwiZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQiLCJyZW5kZXIiLCJsb2FkaW5nIiwicHJldmlld0xvYWRpbmciLCJvb2JEYXRhIiwiaW52aXRlck5hbWUiLCJpbnZpdGVkRW1haWwiLCJ0b0VtYWlsIiwib25Gb3JnZXRDbGljayIsIm9uUmVqZWN0VGhyZWVwaWRJbnZpdGVCdXR0b25DbGlja2VkIiwibXlNZW1iZXJzaGlwIiwibXlVc2VySWQiLCJzZW5kZXIiLCJvblJlamVjdEJ1dHRvbkNsaWNrZWQiLCJvblJlamVjdEFuZElnbm9yZUNsaWNrIiwiYWN0aXZlQ2FsbCIsInNjcm9sbGhlYWRlckNsYXNzZXMiLCJteF9Sb29tVmlld19zY3JvbGxoZWFkZXIiLCJzdGF0dXNCYXIiLCJpc1N0YXR1c0FyZWFFeHBhbmRlZCIsIlVwbG9hZEJhciIsIlJvb21TdGF0dXNCYXIiLCJvbkludml0ZUJ1dHRvbkNsaWNrIiwib25TdGF0dXNCYXJWaXNpYmxlIiwib25TdGF0dXNCYXJIaWRkZW4iLCJyb29tVmVyc2lvblJlY29tbWVuZGF0aW9uIiwic2hvd1Jvb21VcGdyYWRlQmFyIiwibmVlZHNVcGdyYWRlIiwidXNlck1heVVwZ3JhZGVSb29tIiwiaGlkZGVuSGlnaGxpZ2h0Q291bnQiLCJhdXgiLCJwcmV2aWV3QmFyIiwiaGlkZUNhbmNlbCIsIm9uQ2FuY2VsQ2xpY2siLCJvblNlYXJjaCIsIm9uUGlubmVkQ2xpY2siLCJvbkhpZGRlbkhpZ2hsaWdodHNDbGljayIsImNvdW50IiwiYXV4UGFuZWwiLCJtZXNzYWdlQ29tcG9zZXIiLCJzZWFyY2hJbmZvIiwiY2FuU3BlYWsiLCJNZXNzYWdlQ29tcG9zZXIiLCJzZWFyY2hDb3VudCIsImhpZGVNZXNzYWdlUGFuZWwiLCJvblNlYXJjaFJlc3VsdHNGaWxsUmVxdWVzdCIsInNob3VsZEhpZ2hsaWdodCIsImhpZ2hsaWdodGVkRXZlbnRJZCIsIm1lc3NhZ2VQYW5lbENsYXNzTmFtZXMiLCJnYXRoZXJUaW1lbGluZVBhbmVsUmVmIiwib25NZXNzYWdlTGlzdFNjcm9sbCIsInRvcFVucmVhZE1lc3NhZ2VzQmFyIiwiVG9wVW5yZWFkTWVzc2FnZXNCYXIiLCJqdW1wVG9Cb3R0b20iLCJKdW1wVG9Cb3R0b21CdXR0b24iLCJzdGF0dXNCYXJBcmVhQ2xhc3MiLCJyaWdodFBhbmVsIiwidGltZWxpbmVDbGFzc2VzIiwibXhfUm9vbVZpZXdfdGltZWxpbmVfcnJfZW5hYmxlZCIsIm1haW5DbGFzc2VzIiwibXhfUm9vbVZpZXdfaW5DYWxsIiwiQm9vbGVhbiIsInNob3dDaGF0RWZmZWN0cyIsIm9uUmVhY3RLZXlEb3duIiwib2Zmc2V0V2lkdGgiLCJvblNldHRpbmdzQ2xpY2siLCJvbkxlYXZlQ2xpY2siLCJvbkFwcHNDbGljayIsIk1hdHJpeENsaWVudENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUF1QkE7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQTZEQSxNQUFNQSxLQUFLLEdBQUcsS0FBZDs7QUFDQSxJQUFJQyxRQUFRLEdBQUcsVUFBU0M7QUFBVDtBQUFBLEVBQXNCLENBQUUsQ0FBdkM7O0FBRUEsTUFBTUMsd0JBQXdCLElBQUcsYUFBYUMsUUFBUSxDQUFDQyxhQUFULENBQXVCLFFBQXZCLENBQWhCLENBQTlCOztBQUVBLElBQUlMLEtBQUosRUFBVztBQUNQO0FBQ0FDLEVBQUFBLFFBQVEsR0FBR0ssT0FBTyxDQUFDQyxHQUFSLENBQVlDLElBQVosQ0FBaUJGLE9BQWpCLENBQVg7QUFDSDs7QUExRkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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WUFBakMsR0FBZ0QsSUFWbEU7QUFXSSxNQUFBLFNBQVMsRUFBRSxLQUFLbmMsS0FBTCxDQUFXaVYsU0FYMUI7QUFZSSxNQUFBLFdBQVcsRUFBRSxLQUFLalYsS0FBTCxDQUFXSSxnQkFBWCxHQUE4QixLQUFLZ2MsV0FBbkMsR0FBaUQsSUFabEU7QUFhSSxNQUFBLFNBQVMsRUFBRSxLQUFLcGMsS0FBTCxDQUFXVztBQWIxQixNQURKLGVBZ0JJLDZCQUFDLGtCQUFEO0FBQVcsTUFBQSxLQUFLLEVBQUU4YSxVQUFsQjtBQUE4QixNQUFBLGNBQWMsRUFBRSxLQUFLM2IsS0FBTCxDQUFXaVQ7QUFBekQsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0t3SCxRQURMLGVBRUk7QUFBSyxNQUFBLFNBQVMsRUFBRW1CO0FBQWhCLE9BQ0tOLG9CQURMLEVBRUtFLFlBRkwsRUFHSzdXLFlBSEwsRUFJS29ILGtCQUpMLENBRkosZUFRSTtBQUFLLE1BQUEsU0FBUyxFQUFFMlA7QUFBaEIsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixNQURKLEVBRUtyQyxTQUZMLENBREosQ0FSSixFQWNLYSxVQWRMLEVBZUtRLGVBZkwsQ0FESixDQWhCSixDQUpKLENBREosQ0FESjtBQTZDSDs7QUF6MERpRTs7OzhCQUFqRDlhLFEsaUJBZUkyYyw0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8vIFRPRE86IFRoaXMgY29tcG9uZW50IGlzIGVub3Jtb3VzISBUaGVyZSdzIHNldmVyYWwgdGhpbmdzIHdoaWNoIGNvdWxkIHN0YW5kLWFsb25lOlxuLy8gIC0gU2VhcmNoIHJlc3VsdHMgY29tcG9uZW50XG4vLyAgLSBEcmFnIGFuZCBkcm9wXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgRXZlbnRTdWJzY3JpcHRpb24gfSBmcm9tIFwiZmJlbWl0dGVyXCI7XG5cbmltcG9ydCBzaG91bGRIaWRlRXZlbnQgZnJvbSAnLi4vLi4vc2hvdWxkSGlkZUV2ZW50JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzJztcbmltcG9ydCBSZXNpemVOb3RpZmllciBmcm9tICcuLi8uLi91dGlscy9SZXNpemVOb3RpZmllcic7XG5pbXBvcnQgQ29udGVudE1lc3NhZ2VzIGZyb20gJy4uLy4uL0NvbnRlbnRNZXNzYWdlcyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vTW9kYWwnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uL2luZGV4JztcbmltcG9ydCBDYWxsSGFuZGxlciBmcm9tICcuLi8uLi9DYWxsSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgVGludGVyIGZyb20gJy4uLy4uL1RpbnRlcic7XG5pbXBvcnQgcmF0ZUxpbWl0ZWRGdW5jIGZyb20gJy4uLy4uL3JhdGVsaW1pdGVkZnVuYyc7XG5pbXBvcnQgKiBhcyBPYmplY3RVdGlscyBmcm9tICcuLi8uLi9PYmplY3RVdGlscyc7XG5pbXBvcnQgKiBhcyBSb29tcyBmcm9tICcuLi8uLi9Sb29tcyc7XG5pbXBvcnQgZXZlbnRTZWFyY2gsIHsgc2VhcmNoUGFnaW5hdGlvbiB9IGZyb20gJy4uLy4uL1NlYXJjaGluZyc7XG5pbXBvcnQgeyBpc09ubHlDdHJsT3JDbWRJZ25vcmVTaGlmdEtleUV2ZW50LCBLZXkgfSBmcm9tICcuLi8uLi9LZXlib2FyZCc7XG5pbXBvcnQgTWFpblNwbGl0IGZyb20gJy4vTWFpblNwbGl0JztcbmltcG9ydCBSaWdodFBhbmVsIGZyb20gJy4vUmlnaHRQYW5lbCc7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tICcuLi8uLi9zdG9yZXMvUm9vbVZpZXdTdG9yZSc7XG5pbXBvcnQgUm9vbVNjcm9sbFN0YXRlU3RvcmUgZnJvbSAnLi4vLi4vc3RvcmVzL1Jvb21TY3JvbGxTdGF0ZVN0b3JlJztcbmltcG9ydCBXaWRnZXRFY2hvU3RvcmUgZnJvbSAnLi4vLi4vc3RvcmVzL1dpZGdldEVjaG9TdG9yZSc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBSaWdodFBhbmVsU3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9SaWdodFBhbmVsU3RvcmVcIjtcbmltcG9ydCB7IGhhdmVUaWxlRm9yRXZlbnQgfSBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvRXZlbnRUaWxlXCI7XG5pbXBvcnQgUm9vbUNvbnRleHQgZnJvbSBcIi4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgRTJFU3RhdHVzLCBzaGllbGRTdGF0dXNGb3JSb29tIH0gZnJvbSAnLi4vLi4vdXRpbHMvU2hpZWxkVXRpbHMnO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHsgSU1hdHJpeENsaWVudENyZWRzIH0gZnJvbSBcIi4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFNjcm9sbFBhbmVsIGZyb20gXCIuL1Njcm9sbFBhbmVsXCI7XG5pbXBvcnQgVGltZWxpbmVQYW5lbCBmcm9tIFwiLi9UaW1lbGluZVBhbmVsXCI7XG5pbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvRXJyb3JCb3VuZGFyeVwiO1xuaW1wb3J0IFJvb21QcmV2aWV3QmFyIGZyb20gXCIuLi92aWV3cy9yb29tcy9Sb29tUHJldmlld0JhclwiO1xuaW1wb3J0IEZvcndhcmRNZXNzYWdlIGZyb20gXCIuLi92aWV3cy9yb29tcy9Gb3J3YXJkTWVzc2FnZVwiO1xuaW1wb3J0IFNlYXJjaEJhciBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvU2VhcmNoQmFyXCI7XG5pbXBvcnQgUm9vbVVwZ3JhZGVXYXJuaW5nQmFyIGZyb20gXCIuLi92aWV3cy9yb29tcy9Sb29tVXBncmFkZVdhcm5pbmdCYXJcIjtcbmltcG9ydCBQaW5uZWRFdmVudHNQYW5lbCBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvUGlubmVkRXZlbnRzUGFuZWxcIjtcbmltcG9ydCBBdXhQYW5lbCBmcm9tIFwiLi4vdmlld3Mvcm9vbXMvQXV4UGFuZWxcIjtcbmltcG9ydCBSb29tSGVhZGVyIGZyb20gXCIuLi92aWV3cy9yb29tcy9Sb29tSGVhZGVyXCI7XG5pbXBvcnQgeyBYT1IgfSBmcm9tIFwiLi4vLi4vQHR5cGVzL2NvbW1vblwiO1xuaW1wb3J0IHsgSVRocmVlcGlkSW52aXRlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9UaHJlZXBpZEludml0ZVN0b3JlXCI7XG5pbXBvcnQgRWZmZWN0c092ZXJsYXkgZnJvbSBcIi4uL3ZpZXdzL2VsZW1lbnRzL0VmZmVjdHNPdmVybGF5XCI7XG5pbXBvcnQgeyBjb250YWluc0Vtb2ppIH0gZnJvbSAnLi4vLi4vZWZmZWN0cy91dGlscyc7XG5pbXBvcnQgeyBDSEFUX0VGRkVDVFMgfSBmcm9tICcuLi8uLi9lZmZlY3RzJztcbmltcG9ydCB7IENhbGxTdGF0ZSwgTWF0cml4Q2FsbCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbFwiO1xuaW1wb3J0IFdpZGdldFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IE5vdGlmaWVyIGZyb20gXCIuLi8uLi9Ob3RpZmllclwiO1xuaW1wb3J0IHsgc2hvd1RvYXN0IGFzIHNob3dOb3RpZmljYXRpb25zVG9hc3QgfSBmcm9tIFwiLi4vLi4vdG9hc3RzL0Rlc2t0b3BOb3RpZmljYXRpb25zVG9hc3RcIjtcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1Jvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlXCI7XG5pbXBvcnQgeyBDb250YWluZXIsIFdpZGdldExheW91dFN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy93aWRnZXRzL1dpZGdldExheW91dFN0b3JlXCI7XG5cbmNvbnN0IERFQlVHID0gZmFsc2U7XG5sZXQgZGVidWdsb2cgPSBmdW5jdGlvbihtc2c6IHN0cmluZykge307XG5cbmNvbnN0IEJST1dTRVJfU1VQUE9SVFNfU0FOREJPWCA9ICdzYW5kYm94JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblxuaWYgKERFQlVHKSB7XG4gICAgLy8gdXNpbmcgYmluZCBtZWFucyB0aGF0IHdlIGdldCB0byBrZWVwIHVzZWZ1bCBsaW5lIG51bWJlcnMgaW4gdGhlIGNvbnNvbGVcbiAgICBkZWJ1Z2xvZyA9IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHRocmVlcGlkSW52aXRlOiBJVGhyZWVwaWRJbnZpdGUsXG5cbiAgICAvLyBBbnkgZGF0YSBhYm91dCB0aGUgcm9vbSB0aGF0IHdvdWxkIG5vcm1hbGx5IGNvbWUgZnJvbSB0aGUgaG9tZXNlcnZlclxuICAgIC8vIGJ1dCBoYXMgYmVlbiBwYXNzZWQgb3V0LW9mLWJhbmQsIGVnLiB0aGUgcm9vbSBuYW1lIGFuZCBhdmF0YXIgVVJMXG4gICAgLy8gZnJvbSBhbiBlbWFpbCBpbnZpdGUgKGEgd29ya2Fyb3VuZCBmb3IgdGhlIGZhY3QgdGhhdCB3ZSBjYW4ndFxuICAgIC8vIGdldCB0aGlzIGluZm9ybWF0aW9uIGZyb20gdGhlIEhTIHVzaW5nIGFuIGVtYWlsIGludml0ZSkuXG4gICAgLy8gRmllbGRzOlxuICAgIC8vICAqIG5hbWUgKHN0cmluZykgVGhlIHJvb20ncyBuYW1lXG4gICAgLy8gICogYXZhdGFyVXJsIChzdHJpbmcpIFRoZSBteGM6Ly8gYXZhdGFyIFVSTCBmb3IgdGhlIHJvb21cbiAgICAvLyAgKiBpbnZpdGVyTmFtZSAoc3RyaW5nKSBUaGUgZGlzcGxheSBuYW1lIG9mIHRoZSBwZXJzb24gd2hvXG4gICAgLy8gICogICAgICAgICAgICAgICAgICAgICAgaW52aXRlZCB1cyB0byB0aGUgcm9vbVxuICAgIG9vYkRhdGE/OiB7XG4gICAgICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICAgICAgaW52aXRlck5hbWU/OiBzdHJpbmc7XG4gICAgfTtcblxuICAgIC8vIFNlcnZlcnMgdGhlIFJvb21WaWV3IGNhbiB1c2UgdG8gdHJ5IGFuZCBhc3Npc3Qgam9pbnNcbiAgICB2aWFTZXJ2ZXJzPzogc3RyaW5nW107XG5cbiAgICBhdXRvSm9pbj86IGJvb2xlYW47XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuXG4gICAgLy8gQ2FsbGVkIHdpdGggdGhlIGNyZWRlbnRpYWxzIG9mIGEgcmVnaXN0ZXJlZCB1c2VyIChpZiB0aGV5IHdlcmUgYSBST1UgdGhhdCB0cmFuc2l0aW9uZWQgdG8gUFdMVSlcbiAgICBvblJlZ2lzdGVyZWQ/KGNyZWRlbnRpYWxzOiBJTWF0cml4Q2xpZW50Q3JlZHMpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgcm9vbT86IFJvb207XG4gICAgcm9vbUlkPzogc3RyaW5nO1xuICAgIHJvb21BbGlhcz86IHN0cmluZztcbiAgICByb29tTG9hZGluZzogYm9vbGVhbjtcbiAgICBwZWVrTG9hZGluZzogYm9vbGVhbjtcbiAgICBzaG91bGRQZWVrOiBib29sZWFuO1xuICAgIC8vIHVzZWQgdG8gdHJpZ2dlciBhIHJlcmVuZGVyIGluIFRpbWVsaW5lUGFuZWwgb25jZSB0aGUgbWVtYmVycyBhcmUgbG9hZGVkLFxuICAgIC8vIHNvIFJSIGFyZSByZW5kZXJlZCBhZ2FpbiAobm93IHdpdGggdGhlIG1lbWJlcnMgYXZhaWxhYmxlKSwgLi4uXG4gICAgbWVtYmVyc0xvYWRlZDogYm9vbGVhbjtcbiAgICAvLyBUaGUgZXZlbnQgdG8gYmUgc2Nyb2xsZWQgdG8gaW5pdGlhbGx5XG4gICAgaW5pdGlhbEV2ZW50SWQ/OiBzdHJpbmc7XG4gICAgLy8gVGhlIG9mZnNldCBpbiBwaXhlbHMgZnJvbSB0aGUgZXZlbnQgd2l0aCB3aGljaCB0byBzY3JvbGwgdmVydGljYWxseVxuICAgIGluaXRpYWxFdmVudFBpeGVsT2Zmc2V0PzogbnVtYmVyO1xuICAgIC8vIFdoZXRoZXIgdG8gaGlnaGxpZ2h0IHRoZSBldmVudCBzY3JvbGxlZCB0b1xuICAgIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ/OiBib29sZWFuO1xuICAgIHJlcGx5VG9FdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIGZvcndhcmRpbmdFdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIG51bVVucmVhZE1lc3NhZ2VzOiBudW1iZXI7XG4gICAgZHJhZ2dpbmdGaWxlOiBib29sZWFuO1xuICAgIHNlYXJjaGluZzogYm9vbGVhbjtcbiAgICBzZWFyY2hUZXJtPzogc3RyaW5nO1xuICAgIHNlYXJjaFNjb3BlPzogXCJBbGxcIiB8IFwiUm9vbVwiO1xuICAgIHNlYXJjaFJlc3VsdHM/OiBYT1I8e30sIHtcbiAgICAgICAgY291bnQ6IG51bWJlcjtcbiAgICAgICAgaGlnaGxpZ2h0czogc3RyaW5nW107XG4gICAgICAgIHJlc3VsdHM6IE1hdHJpeEV2ZW50W107XG4gICAgICAgIG5leHRfYmF0Y2g6IHN0cmluZzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICB9PjtcbiAgICBzZWFyY2hIaWdobGlnaHRzPzogc3RyaW5nW107XG4gICAgc2VhcmNoSW5Qcm9ncmVzcz86IGJvb2xlYW47XG4gICAgY2FsbFN0YXRlPzogQ2FsbFN0YXRlO1xuICAgIGd1ZXN0c0NhbkpvaW46IGJvb2xlYW47XG4gICAgY2FuUGVlazogYm9vbGVhbjtcbiAgICBzaG93QXBwczogYm9vbGVhbjtcbiAgICBpc1BlZWtpbmc6IGJvb2xlYW47XG4gICAgc2hvd2luZ1Bpbm5lZDogYm9vbGVhbjtcbiAgICBzaG93UmVhZFJlY2VpcHRzOiBib29sZWFuO1xuICAgIHNob3dSaWdodFBhbmVsOiBib29sZWFuO1xuICAgIC8vIGVycm9yIG9iamVjdCwgYXMgZnJvbSB0aGUgbWF0cml4IGNsaWVudC9zZXJ2ZXIgQVBJXG4gICAgLy8gSWYgd2UgZmFpbGVkIHRvIGxvYWQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJvb20sXG4gICAgLy8gc3RvcmUgdGhlIGVycm9yIGhlcmUuXG4gICAgcm9vbUxvYWRFcnJvcj86IEVycm9yO1xuICAgIC8vIEhhdmUgd2Ugc2VudCBhIHJlcXVlc3QgdG8gam9pbiB0aGUgcm9vbSB0aGF0IHdlJ3JlIHdhaXRpbmcgdG8gY29tcGxldGU/XG4gICAgam9pbmluZzogYm9vbGVhbjtcbiAgICAvLyB0aGlzIGlzIHRydWUgaWYgd2UgYXJlIGZ1bGx5IHNjcm9sbGVkLWRvd24sIGFuZCBhcmUgbG9va2luZyBhdFxuICAgIC8vIHRoZSBlbmQgb2YgdGhlIGxpdmUgdGltZWxpbmUuIEl0IGhhcyB0aGUgZWZmZWN0IG9mIGhpZGluZyB0aGVcbiAgICAvLyAnc2Nyb2xsIHRvIGJvdHRvbScga25vYiwgYW1vbmcgYSBjb3VwbGUgb2Ygb3RoZXIgdGhpbmdzLlxuICAgIGF0RW5kT2ZMaXZlVGltZWxpbmU6IGJvb2xlYW47XG4gICAgLy8gdXNlZCBieSBjb21wb25lbnREaWRVcGRhdGUgdG8gYXZvaWQgdW5uZWNlc3NhcnkgY2hlY2tzXG4gICAgYXRFbmRPZkxpdmVUaW1lbGluZUluaXQ6IGJvb2xlYW47XG4gICAgc2hvd1RvcFVucmVhZE1lc3NhZ2VzQmFyOiBib29sZWFuO1xuICAgIGF1eFBhbmVsTWF4SGVpZ2h0PzogbnVtYmVyO1xuICAgIHN0YXR1c0JhclZpc2libGU6IGJvb2xlYW47XG4gICAgLy8gV2UgbG9hZCB0aGlzIGxhdGVyIGJ5IGFza2luZyB0aGUganMtc2RrIHRvIHN1Z2dlc3QgYSB2ZXJzaW9uIGZvciB1cy5cbiAgICAvLyBUaGlzIG9iamVjdCBpcyB0aGUgcmVzdWx0IG9mIFJvb20jZ2V0UmVjb21tZW5kZWRWZXJzaW9uKClcbiAgICB1cGdyYWRlUmVjb21tZW5kYXRpb24/OiB7XG4gICAgICAgIHZlcnNpb246IHN0cmluZztcbiAgICAgICAgbmVlZHNVcGdyYWRlOiBib29sZWFuO1xuICAgICAgICB1cmdlbnQ6IGJvb2xlYW47XG4gICAgfTtcbiAgICBjYW5SZWFjdDogYm9vbGVhbjtcbiAgICBjYW5SZXBseTogYm9vbGVhbjtcbiAgICB1c2VJUkNMYXlvdXQ6IGJvb2xlYW47XG4gICAgbWF0cml4Q2xpZW50SXNSZWFkeTogYm9vbGVhbjtcbiAgICBzaG93VXJsUHJldmlldz86IGJvb2xlYW47XG4gICAgZTJlU3RhdHVzPzogRTJFU3RhdHVzO1xuICAgIHJlamVjdGluZz86IGJvb2xlYW47XG4gICAgcmVqZWN0RXJyb3I/OiBFcnJvcjtcbiAgICBoYXNQaW5uZWRXaWRnZXRzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJvb21TdG9yZVRva2VuOiBFdmVudFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHJpZ2h0UGFuZWxTdG9yZVRva2VuOiBFdmVudFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNob3dSZWFkUmVjZWlwdHNXYXRjaFJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbGF5b3V0V2F0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSB1bm1vdW50ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIHBlcm1hbGlua0NyZWF0b3JzOiBSZWNvcmQ8c3RyaW5nLCBSb29tUGVybWFsaW5rQ3JlYXRvcj4gPSB7fTtcbiAgICBwcml2YXRlIHNlYXJjaElkOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIHJvb21WaWV3ID0gY3JlYXRlUmVmPEhUTUxFbGVtZW50PigpO1xuICAgIHByaXZhdGUgc2VhcmNoUmVzdWx0c1BhbmVsID0gY3JlYXRlUmVmPFNjcm9sbFBhbmVsPigpO1xuICAgIHByaXZhdGUgbWVzc2FnZVBhbmVsOiBUaW1lbGluZVBhbmVsO1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICBjb25zdCBsbE1lbWJlcnMgPSB0aGlzLmNvbnRleHQuaGFzTGF6eUxvYWRNZW1iZXJzRW5hYmxlZCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcm9vbUlkOiBudWxsLFxuICAgICAgICAgICAgcm9vbUxvYWRpbmc6IHRydWUsXG4gICAgICAgICAgICBwZWVrTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBzaG91bGRQZWVrOiB0cnVlLFxuICAgICAgICAgICAgbWVtYmVyc0xvYWRlZDogIWxsTWVtYmVycyxcbiAgICAgICAgICAgIG51bVVucmVhZE1lc3NhZ2VzOiAwLFxuICAgICAgICAgICAgZHJhZ2dpbmdGaWxlOiBmYWxzZSxcbiAgICAgICAgICAgIHNlYXJjaGluZzogZmFsc2UsXG4gICAgICAgICAgICBzZWFyY2hSZXN1bHRzOiBudWxsLFxuICAgICAgICAgICAgY2FsbFN0YXRlOiBudWxsLFxuICAgICAgICAgICAgZ3Vlc3RzQ2FuSm9pbjogZmFsc2UsXG4gICAgICAgICAgICBjYW5QZWVrOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dBcHBzOiBmYWxzZSxcbiAgICAgICAgICAgIGlzUGVla2luZzogZmFsc2UsXG4gICAgICAgICAgICBzaG93aW5nUGlubmVkOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dSZWFkUmVjZWlwdHM6IHRydWUsXG4gICAgICAgICAgICBzaG93UmlnaHRQYW5lbDogUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCkuaXNPcGVuRm9yUm9vbSxcbiAgICAgICAgICAgIGpvaW5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgYXRFbmRPZkxpdmVUaW1lbGluZTogdHJ1ZSxcbiAgICAgICAgICAgIGF0RW5kT2ZMaXZlVGltZWxpbmVJbml0OiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dUb3BVbnJlYWRNZXNzYWdlc0JhcjogZmFsc2UsXG4gICAgICAgICAgICBzdGF0dXNCYXJWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNhblJlYWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhblJlcGx5OiBmYWxzZSxcbiAgICAgICAgICAgIHVzZUlSQ0xheW91dDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInVzZUlSQ0xheW91dFwiKSxcbiAgICAgICAgICAgIG1hdHJpeENsaWVudElzUmVhZHk6IHRoaXMuY29udGV4dCAmJiB0aGlzLmNvbnRleHQuaXNJbml0aWFsU3luY0NvbXBsZXRlKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJSb29tXCIsIHRoaXMub25Sb29tKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiUm9vbS50aW1lbGluZVwiLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiUm9vbS5uYW1lXCIsIHRoaXMub25Sb29tTmFtZSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIlJvb20uYWNjb3VudERhdGFcIiwgdGhpcy5vblJvb21BY2NvdW50RGF0YSk7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblJvb21TdGF0ZUV2ZW50cyk7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMub25Sb29tU3RhdGVNZW1iZXIpO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJSb29tLm15TWVtYmVyc2hpcFwiLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiYWNjb3VudERhdGFcIiwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiY3J5cHRvLmtleUJhY2t1cFN0YXR1c1wiLCB0aGlzLm9uS2V5QmFja3VwU3RhdHVzKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiZGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZFwiLCB0aGlzLm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcInVzZXJUcnVzdFN0YXR1c0NoYW5nZWRcIiwgdGhpcy5vblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiY3Jvc3NTaWduaW5nLmtleXNDaGFuZ2VkXCIsIHRoaXMub25Dcm9zc1NpZ25pbmdLZXlzQ2hhbmdlZCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIkV2ZW50LmRlY3J5cHRlZFwiLCB0aGlzLm9uRXZlbnREZWNyeXB0ZWQpO1xuICAgICAgICB0aGlzLmNvbnRleHQub24oXCJldmVudFwiLCB0aGlzLm9uRXZlbnQpO1xuICAgICAgICAvLyBTdGFydCBsaXN0ZW5pbmcgZm9yIFJvb21WaWV3U3RvcmUgdXBkYXRlc1xuICAgICAgICB0aGlzLnJvb21TdG9yZVRva2VuID0gUm9vbVZpZXdTdG9yZS5hZGRMaXN0ZW5lcih0aGlzLm9uUm9vbVZpZXdTdG9yZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMucmlnaHRQYW5lbFN0b3JlVG9rZW4gPSBSaWdodFBhbmVsU3RvcmUuZ2V0U2hhcmVkSW5zdGFuY2UoKS5hZGRMaXN0ZW5lcih0aGlzLm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlKTtcblxuICAgICAgICBXaWRnZXRFY2hvU3RvcmUub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uV2lkZ2V0RWNob1N0b3JlVXBkYXRlKTtcbiAgICAgICAgV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uV2lkZ2V0U3RvcmVVcGRhdGUpO1xuXG4gICAgICAgIHRoaXMuc2hvd1JlYWRSZWNlaXB0c1dhdGNoUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJzaG93UmVhZFJlY2VpcHRzXCIsIG51bGwsXG4gICAgICAgICAgICB0aGlzLm9uUmVhZFJlY2VpcHRzQ2hhbmdlKTtcbiAgICAgICAgdGhpcy5sYXlvdXRXYXRjaGVyUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJ1c2VJUkNMYXlvdXRcIiwgbnVsbCwgdGhpcy5vbkxheW91dENoYW5nZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldpZGdldFN0b3JlVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrV2lkZ2V0cyh0aGlzLnN0YXRlLnJvb20pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGVja1dpZGdldHMgPSAocm9vbSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhhc1Bpbm5lZFdpZGdldHM6IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgQ29udGFpbmVyLlRvcCkubGVuZ3RoID4gMCxcbiAgICAgICAgICAgIHNob3dBcHBzOiB0aGlzLnNob3VsZFNob3dBcHBzKHJvb20pLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlYWRSZWNlaXB0c0NoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1JlYWRSZWNlaXB0c1wiLCB0aGlzLnN0YXRlLnJvb21JZCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbVZpZXdTdG9yZVVwZGF0ZSA9IChpbml0aWFsPzogYm9vbGVhbikgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaW5pdGlhbCAmJiB0aGlzLnN0YXRlLnJvb21JZCAhPT0gUm9vbVZpZXdTdG9yZS5nZXRSb29tSWQoKSkge1xuICAgICAgICAgICAgLy8gUm9vbVZpZXcgZXhwbGljaXRseSBkb2VzIG5vdCBzdXBwb3J0IGNoYW5naW5nIHdoYXQgcm9vbVxuICAgICAgICAgICAgLy8gaXMgYmVpbmcgdmlld2VkOiBpbnN0ZWFkIGl0IHNob3VsZCBqdXN0IGJlIHJlLW1vdW50ZWQgd2hlblxuICAgICAgICAgICAgLy8gc3dpdGNoaW5nIHJvb21zLiBUaGVyZWZvcmUsIGlmIHRoZSByb29tIElEIGNoYW5nZXMsIHdlXG4gICAgICAgICAgICAvLyBpZ25vcmUgdGhpcy4gV2UgZWl0aGVyIG5lZWQgdG8gZG8gdGhpcyBvciBhZGQgY29kZSB0byBoYW5kbGVcbiAgICAgICAgICAgIC8vIHNhdmluZyB0aGUgc2Nyb2xsIHBvc2l0aW9uIChvdGhlcndpc2Ugd2UgZW5kIHVwIHNhdmluZyB0aGVcbiAgICAgICAgICAgIC8vIHNjcm9sbCBwb3NpdGlvbiBhZ2FpbnN0IHRoZSB3cm9uZyByb29tKS5cblxuICAgICAgICAgICAgLy8gR2l2ZW4gdGhhdCBkb2luZyB0aGUgc2V0U3RhdGUgaGVyZSB3b3VsZCBjYXVzZSBhIGJ1bmNoIG9mXG4gICAgICAgICAgICAvLyB1bm5lY2Vzc2FyeSB3b3JrLCB3ZSBqdXN0IGlnbm9yZSB0aGUgY2hhbmdlIHNpbmNlIHdlIGtub3dcbiAgICAgICAgICAgIC8vIHRoYXQgaWYgdGhlIGN1cnJlbnQgcm9vbSBJRCBoYXMgY2hhbmdlZCBmcm9tIHdoYXQgd2UgdGhvdWdodFxuICAgICAgICAgICAgLy8gaXQgd2FzLCBpdCBtZWFucyB3ZSdyZSBhYm91dCB0byBiZSB1bm1vdW50ZWQuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tSWQgPSBSb29tVmlld1N0b3JlLmdldFJvb21JZCgpO1xuXG4gICAgICAgIGNvbnN0IG5ld1N0YXRlOiBQaWNrPElTdGF0ZSwgYW55PiA9IHtcbiAgICAgICAgICAgIHJvb21JZCxcbiAgICAgICAgICAgIHJvb21BbGlhczogUm9vbVZpZXdTdG9yZS5nZXRSb29tQWxpYXMoKSxcbiAgICAgICAgICAgIHJvb21Mb2FkaW5nOiBSb29tVmlld1N0b3JlLmlzUm9vbUxvYWRpbmcoKSxcbiAgICAgICAgICAgIHJvb21Mb2FkRXJyb3I6IFJvb21WaWV3U3RvcmUuZ2V0Um9vbUxvYWRFcnJvcigpLFxuICAgICAgICAgICAgam9pbmluZzogUm9vbVZpZXdTdG9yZS5pc0pvaW5pbmcoKSxcbiAgICAgICAgICAgIGluaXRpYWxFdmVudElkOiBSb29tVmlld1N0b3JlLmdldEluaXRpYWxFdmVudElkKCksXG4gICAgICAgICAgICBpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkOiBSb29tVmlld1N0b3JlLmlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQoKSxcbiAgICAgICAgICAgIHJlcGx5VG9FdmVudDogUm9vbVZpZXdTdG9yZS5nZXRRdW90aW5nRXZlbnQoKSxcbiAgICAgICAgICAgIGZvcndhcmRpbmdFdmVudDogUm9vbVZpZXdTdG9yZS5nZXRGb3J3YXJkaW5nRXZlbnQoKSxcbiAgICAgICAgICAgIC8vIHdlIHNob3VsZCBvbmx5IHBlZWsgb25jZSB3ZSBoYXZlIGEgcmVhZHkgY2xpZW50XG4gICAgICAgICAgICBzaG91bGRQZWVrOiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudElzUmVhZHkgJiYgUm9vbVZpZXdTdG9yZS5zaG91bGRQZWVrKCksXG4gICAgICAgICAgICBzaG93aW5nUGlubmVkOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUGlubmVkRXZlbnRzLmlzT3BlblwiLCByb29tSWQpLFxuICAgICAgICAgICAgc2hvd1JlYWRSZWNlaXB0czogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dSZWFkUmVjZWlwdHNcIiwgcm9vbUlkKSxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIWluaXRpYWwgJiYgdGhpcy5zdGF0ZS5zaG91bGRQZWVrICYmICFuZXdTdGF0ZS5zaG91bGRQZWVrKSB7XG4gICAgICAgICAgICAvLyBTdG9wIHBlZWtpbmcgYmVjYXVzZSB3ZSBoYXZlIGpvaW5lZCB0aGlzIHJvb20gbm93XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuc3RvcFBlZWtpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlbXBvcmFyeSBsb2dnaW5nIHRvIGRpYWdub3NlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzQzMDdcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAnUlZTIHVwZGF0ZTonLFxuICAgICAgICAgICAgbmV3U3RhdGUucm9vbUlkLFxuICAgICAgICAgICAgbmV3U3RhdGUucm9vbUFsaWFzLFxuICAgICAgICAgICAgJ2xvYWRpbmc/JywgbmV3U3RhdGUucm9vbUxvYWRpbmcsXG4gICAgICAgICAgICAnam9pbmluZz8nLCBuZXdTdGF0ZS5qb2luaW5nLFxuICAgICAgICAgICAgJ2luaXRpYWw/JywgaW5pdGlhbCxcbiAgICAgICAgICAgICdzaG91bGRQZWVrPycsIG5ld1N0YXRlLnNob3VsZFBlZWssXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gTkI6IFRoaXMgZG9lcyBhc3N1bWUgdGhhdCB0aGUgcm9vbUlEIHdpbGwgbm90IGNoYW5nZSBmb3IgdGhlIGxpZmV0aW1lIG9mXG4gICAgICAgIC8vIHRoZSBSb29tVmlldyBpbnN0YW5jZVxuICAgICAgICBpZiAoaW5pdGlhbCkge1xuICAgICAgICAgICAgbmV3U3RhdGUucm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKG5ld1N0YXRlLnJvb21JZCk7XG4gICAgICAgICAgICBpZiAobmV3U3RhdGUucm9vbSkge1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLnNob3dBcHBzID0gdGhpcy5zaG91bGRTaG93QXBwcyhuZXdTdGF0ZS5yb29tKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUm9vbUxvYWRlZChuZXdTdGF0ZS5yb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb21JZCA9PT0gbnVsbCAmJiBuZXdTdGF0ZS5yb29tSWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgc2Nyb2xsIHN0YXRlIGZvciB0aGUgbmV3IHJvb21cblxuICAgICAgICAgICAgLy8gSWYgYW4gZXZlbnQgSUQgd2Fzbid0IHNwZWNpZmllZCwgZGVmYXVsdCB0byB0aGUgb25lIHNhdmVkIGZvciB0aGlzIHJvb21cbiAgICAgICAgICAgIC8vIGluIHRoZSBzY3JvbGwgc3RhdGUgc3RvcmUuIEFzc3VtZSBpbml0aWFsRXZlbnRQaXhlbE9mZnNldCBzaG91bGQgYmUgc2V0LlxuICAgICAgICAgICAgaWYgKCFuZXdTdGF0ZS5pbml0aWFsRXZlbnRJZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21TY3JvbGxTdGF0ZSA9IFJvb21TY3JvbGxTdGF0ZVN0b3JlLmdldFNjcm9sbFN0YXRlKG5ld1N0YXRlLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb21TY3JvbGxTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZS5pbml0aWFsRXZlbnRJZCA9IHJvb21TY3JvbGxTdGF0ZS5mb2N1c3NlZEV2ZW50O1xuICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZS5pbml0aWFsRXZlbnRQaXhlbE9mZnNldCA9IHJvb21TY3JvbGxTdGF0ZS5waXhlbE9mZnNldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhciB0aGUgc2VhcmNoIHJlc3VsdHMgd2hlbiBjbGlja2luZyBhIHNlYXJjaCByZXN1bHQgKHdoaWNoIGNoYW5nZXMgdGhlXG4gICAgICAgIC8vIGN1cnJlbnRseSBzY3JvbGxlZCB0byBldmVudCwgdGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRJZCkuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmluaXRpYWxFdmVudElkICE9PSBuZXdTdGF0ZS5pbml0aWFsRXZlbnRJZCkge1xuICAgICAgICAgICAgbmV3U3RhdGUuc2VhcmNoUmVzdWx0cyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgbmV3U3RhdGUucm9vbUlkIGNvdWxkIGJlIG51bGwgKGUuZy4gdGhlIGFsaWFzIG1pZ2h0IG5vdFxuICAgICAgICAvLyBoYXZlIGJlZW4gcmVzb2x2ZWQgeWV0KSBzbyBhbnl0aGluZyBjYWxsZWQgaGVyZSBtdXN0IGhhbmRsZSB0aGlzIGNhc2UuXG5cbiAgICAgICAgLy8gV2UgcGFzcyB0aGUgbmV3IHN0YXRlIGludG8gdGhpcyBmdW5jdGlvbiBmb3IgaXQgdG8gcmVhZDogaXQgbmVlZHMgdG9cbiAgICAgICAgLy8gb2JzZXJ2ZSB0aGUgbmV3IHN0YXRlIGJ1dCB3ZSBkb24ndCB3YW50IHRvIHB1dCBpdCBpbiB0aGUgc2V0U3RhdGVcbiAgICAgICAgLy8gY2FsbGJhY2sgYmVjYXVzZSB0aGlzIHdvdWxkIHByZXZlbnQgdGhlIHNldFN0YXRlcyBmcm9tIGJlaW5nIGJhdGNoZWQsXG4gICAgICAgIC8vIGllLiBjYXVzZSBpdCB0byByZW5kZXIgUm9vbVZpZXcgdHdpY2UgcmF0aGVyIHRoYW4gdGhlIG9uY2UgdGhhdCBpcyBuZWNlc3NhcnkuXG4gICAgICAgIGlmIChpbml0aWFsKSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwUm9vbShuZXdTdGF0ZS5yb29tLCBuZXdTdGF0ZS5yb29tSWQsIG5ld1N0YXRlLmpvaW5pbmcsIG5ld1N0YXRlLnNob3VsZFBlZWspO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0Um9vbUlkID0gKCkgPT4ge1xuICAgICAgICAvLyBBY2NvcmRpbmcgdG8gYG9uUm9vbVZpZXdTdG9yZVVwZGF0ZWAsIGBzdGF0ZS5yb29tSWRgIGNhbiBiZSBudWxsXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSByb29tIGFsaWFzIHdlIGhhdmVuJ3QgcmVzb2x2ZWQgeWV0LiBUbyB3b3JrIGFyb3VuZCB0aGlzLFxuICAgICAgICAvLyBmaXJzdCB3ZSdsbCB0cnkgdGhlIHJvb20gb2JqZWN0IGlmIGl0J3MgdGhlcmUsIGFuZCB0aGVuIGZhbGxiYWNrIHRvXG4gICAgICAgIC8vIHRoZSBiYXJlIHJvb20gSUQuIChXZSBtYXkgd2FudCB0byB1cGRhdGUgYHN0YXRlLnJvb21JZGAgYWZ0ZXJcbiAgICAgICAgLy8gcmVzb2x2aW5nIGFsaWFzZXMsIHNvIHdlIGNvdWxkIGFsd2F5cyB0cnVzdCBpdC4pXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJvb20gPyB0aGlzLnN0YXRlLnJvb20ucm9vbUlkIDogdGhpcy5zdGF0ZS5yb29tSWQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0UGVybWFsaW5rQ3JlYXRvckZvclJvb20ocm9vbTogUm9vbSkge1xuICAgICAgICBpZiAodGhpcy5wZXJtYWxpbmtDcmVhdG9yc1tyb29tLnJvb21JZF0pIHJldHVybiB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXTtcblxuICAgICAgICB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXSA9IG5ldyBSb29tUGVybWFsaW5rQ3JlYXRvcihyb29tKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucm9vbSAmJiByb29tLnJvb21JZCA9PT0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCkge1xuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byB3YXRjaCBmb3IgY2hhbmdlcyBpbiB0aGUgY3JlYXRvciBmb3IgdGhlIHByaW1hcnkgcm9vbSBpbiB0aGUgdmlldywgYnV0XG4gICAgICAgICAgICAvLyBkb24ndCBuZWVkIHRvIGRvIHNvIGZvciBzZWFyY2ggcmVzdWx0cy5cbiAgICAgICAgICAgIHRoaXMucGVybWFsaW5rQ3JlYXRvcnNbcm9vbS5yb29tSWRdLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBlcm1hbGlua0NyZWF0b3JzW3Jvb20ucm9vbUlkXS5sb2FkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGVybWFsaW5rQ3JlYXRvcnNbcm9vbS5yb29tSWRdO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcEFsbFBlcm1hbGlua0NyZWF0b3JzKCkge1xuICAgICAgICBpZiAoIXRoaXMucGVybWFsaW5rQ3JlYXRvcnMpIHJldHVybjtcbiAgICAgICAgZm9yIChjb25zdCByb29tSWQgb2YgT2JqZWN0LmtleXModGhpcy5wZXJtYWxpbmtDcmVhdG9ycykpIHtcbiAgICAgICAgICAgIHRoaXMucGVybWFsaW5rQ3JlYXRvcnNbcm9vbUlkXS5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uV2lkZ2V0RWNob1N0b3JlVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucm9vbSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhhc1Bpbm5lZFdpZGdldHM6IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmdldENvbnRhaW5lcldpZGdldHModGhpcy5zdGF0ZS5yb29tLCBDb250YWluZXIuVG9wKS5sZW5ndGggPiAwLFxuICAgICAgICAgICAgc2hvd0FwcHM6IHRoaXMuc2hvdWxkU2hvd0FwcHModGhpcy5zdGF0ZS5yb29tKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25XaWRnZXRMYXlvdXRDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMub25XaWRnZXRFY2hvU3RvcmVVcGRhdGUoKTsgLy8gd2UgY2hlYXQgaGVyZSBieSBjYWxsaW5nIHRoZSB0aGluZyB0aGF0IG1hdHRlcnNcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZXR1cFJvb20ocm9vbTogUm9vbSwgcm9vbUlkOiBzdHJpbmcsIGpvaW5pbmc6IGJvb2xlYW4sIHNob3VsZFBlZWs6IGJvb2xlYW4pIHtcbiAgICAgICAgLy8gaWYgdGhpcyBpcyBhbiB1bmtub3duIHJvb20gdGhlbiB3ZSdyZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOlxuICAgICAgICAvLyAtIFRoaXMgaXMgYSByb29tIHdlIGNhbiBwZWVrIGludG8gKHNlYXJjaCBlbmdpbmUpICh3ZSBjYW4gL3BlZWspXG4gICAgICAgIC8vIC0gVGhpcyBpcyBhIHJvb20gd2UgY2FuIHB1YmxpY2x5IGpvaW4gb3Igd2VyZSBpbnZpdGVkIHRvLiAod2UgY2FuIC9qb2luKVxuICAgICAgICAvLyAtIFRoaXMgaXMgYSByb29tIHdlIGNhbm5vdCBqb2luIGF0IGFsbC4gKG5vIGFjdGlvbiBjYW4gaGVscCB1cylcbiAgICAgICAgLy8gV2UgY2FuJ3QgdHJ5IHRvIC9qb2luIGJlY2F1c2UgdGhpcyBtYXkgaW1wbGljaXRseSBhY2NlcHQgaW52aXRlcyAoISlcbiAgICAgICAgLy8gV2UgY2FuIC9wZWVrIHRob3VnaC4gSWYgaXQgZmFpbHMgdGhlbiB3ZSBwcmVzZW50IHRoZSBqb2luIFVJLiBJZiBpdFxuICAgICAgICAvLyBzdWNjZWVkcyB0aGVuIGdyZWF0LCBzaG93IHRoZSBwcmV2aWV3IChidXQgd2Ugc3RpbGwgbWF5IGJlIGFibGUgdG8gL2pvaW4hKS5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHBlZWtpbmcgd29ya3MgYnkgcm9vbSBJRCBhbmQgcm9vbSBJRCBvbmx5LCBhcyBvcHBvc2VkIHRvIGpvaW5pbmdcbiAgICAgICAgLy8gd2hpY2ggbXVzdCBiZSBieSBhbGlhcyBvciBpbnZpdGUgd2hlcmV2ZXIgcG9zc2libGUgKHBlZWtpbmcgY3VycmVudGx5IGRvZXNcbiAgICAgICAgLy8gbm90IHdvcmsgb3ZlciBmZWRlcmF0aW9uKS5cblxuICAgICAgICAvLyBOQi4gV2UgcGVlayBpZiB3ZSBoYXZlIG5ldmVyIHNlZW4gdGhlIHJvb20gYmVmb3JlIChpLmUuIGpzLXNkayBkb2VzIG5vdCBrbm93XG4gICAgICAgIC8vIGFib3V0IGl0KS4gV2UgZG9uJ3QgcGVlayBpbiB0aGUgaGlzdG9yaWNhbCBjYXNlIHdoZXJlIHdlIHdlcmUgam9pbmVkIGJ1dCBhcmVcbiAgICAgICAgLy8gbm93IG5vdCBqb2luZWQgYmVjYXVzZSB0aGUganMtc2RrIHBlZWtpbmcgQVBJIHdpbGwgY2xvYmJlciBvdXIgaGlzdG9yaWNhbCByb29tLFxuICAgICAgICAvLyBtYWtpbmcgaXQgaW1wb3NzaWJsZSB0byBpbmRpY2F0ZSBhIG5ld2x5IGpvaW5lZCByb29tLlxuICAgICAgICBpZiAoIWpvaW5pbmcgJiYgcm9vbUlkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5hdXRvSm9pbikge1xuICAgICAgICAgICAgICAgIHRoaXMub25Kb2luQnV0dG9uQ2xpY2tlZCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghcm9vbSAmJiBzaG91bGRQZWVrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiQXR0ZW1wdGluZyB0byBwZWVrIGludG8gcm9vbSAlc1wiLCByb29tSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBwZWVrTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaXNQZWVraW5nOiB0cnVlLCAvLyB0aGlzIHdpbGwgY2hhbmdlIHRvIGZhbHNlIGlmIHBlZWtpbmcgZmFpbHNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucGVla0luUm9vbShyb29tSWQpLnRoZW4oKHJvb20pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tOiByb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVla0xvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJvb21Mb2FkZWQocm9vbSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFN0b3AgcGVla2luZyBpZiBhbnl0aGluZyB3ZW50IHdyb25nXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNQZWVraW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyB3b24ndCBuZWNlc3NhcmlseSBiZSBhIE1hdHJpeEVycm9yLCBidXQgd2UgZHVjay10eXBlXG4gICAgICAgICAgICAgICAgICAgIC8vIGhlcmUgYW5kIHNheSBpZiBpdCdzIGdvdCBhbiAnZXJyY29kZScga2V5IHdpdGggdGhlIHJpZ2h0IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAvLyBpdCBtZWFucyB3ZSBjYW4ndCBwZWVrLlxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT09IFwiTV9HVUVTVF9BQ0NFU1NfRk9SQklEREVOXCIgfHwgZXJyLmVycmNvZGUgPT09ICdNX0ZPUkJJRERFTicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgZmluZTogdGhlIHJvb20ganVzdCBpc24ndCBwZWVrYWJsZSAod2UgYXNzdW1lKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlZWtMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyBTdG9wIHBlZWtpbmcgYmVjYXVzZSB3ZSBoYXZlIGpvaW5lZCB0aGlzIHJvb20gcHJldmlvdXNseVxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5zdG9wUGVla2luZygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzUGVla2luZzogZmFsc2V9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2hvdWxkU2hvd0FwcHMocm9vbTogUm9vbSkge1xuICAgICAgICBpZiAoIUJST1dTRVJfU1VQUE9SVFNfU0FOREJPWCB8fCAhcm9vbSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHVzZXIgaGFzIHByZXZpb3VzbHkgY2hvc2VuIHRvIGhpZGUgdGhlIGFwcCBkcmF3ZXIgZm9yIHRoaXNcbiAgICAgICAgLy8gcm9vbS4gSWYgc28sIGRvIG5vdCBzaG93IGFwcHNcbiAgICAgICAgY29uc3QgaGlkZVdpZGdldERyYXdlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFxuICAgICAgICAgICAgcm9vbS5yb29tSWQgKyBcIl9oaWRlX3dpZGdldF9kcmF3ZXJcIik7XG5cbiAgICAgICAgLy8gVGhpcyBpcyBjb25mdXNpbmcsIGJ1dCBpdCBtZWFucyB0byBzYXkgdGhhdCB3ZSBkZWZhdWx0IHRvIHRoZSB0cmF5IGJlaW5nXG4gICAgICAgIC8vIGhpZGRlbiB1bmxlc3MgdGhlIHVzZXIgY2xpY2tlZCB0byBvcGVuIGl0LlxuICAgICAgICBjb25zdCBpc01hbnVhbGx5U2hvd24gPSBoaWRlV2lkZ2V0RHJhd2VyID09PSBcImZhbHNlXCI7XG5cbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgQ29udGFpbmVyLlRvcCk7XG4gICAgICAgIHJldHVybiB3aWRnZXRzLmxlbmd0aCA+IDAgfHwgaXNNYW51YWxseVNob3duO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLm9uUm9vbVZpZXdTdG9yZVVwZGF0ZSh0cnVlKTtcblxuICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5nZXRDYWxsRm9yUm9vbSgpO1xuICAgICAgICBjb25zdCBjYWxsU3RhdGUgPSBjYWxsID8gY2FsbC5zdGF0ZSA6IG51bGw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY2FsbFN0YXRlOiBjYWxsU3RhdGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCB0aGlzLm9uUGFnZVVubG9hZCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLm9uKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMub25SZXNpemUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25SZXNpemUoKTtcbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgcmV0dXJuICghT2JqZWN0VXRpbHMuc2hhbGxvd0VxdWFsKHRoaXMucHJvcHMsIG5leHRQcm9wcykgfHxcbiAgICAgICAgICAgICAgICAhT2JqZWN0VXRpbHMuc2hhbGxvd0VxdWFsKHRoaXMuc3RhdGUsIG5leHRTdGF0ZSkpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucm9vbVZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbVZpZXcgPSB0aGlzLnJvb21WaWV3LmN1cnJlbnQ7XG4gICAgICAgICAgICBpZiAoIXJvb21WaWV3Lm9uZHJvcCkge1xuICAgICAgICAgICAgICAgIHJvb21WaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLm9uRHJvcCk7XG4gICAgICAgICAgICAgICAgcm9vbVZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLm9uRHJhZ092ZXIpO1xuICAgICAgICAgICAgICAgIHJvb21WaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMub25EcmFnTGVhdmVPckVuZCk7XG4gICAgICAgICAgICAgICAgcm9vbVZpZXcuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMub25EcmFnTGVhdmVPckVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlOiBXZSBjaGVjayB0aGUgcmVmIGhlcmUgd2l0aCBhIGZsYWcgYmVjYXVzZSBjb21wb25lbnREaWRNb3VudCwgZGVzcGl0ZVxuICAgICAgICAvLyBkb2N1bWVudGF0aW9uLCBkb2VzIG5vdCBkZWZpbmUgb3VyIG1lc3NhZ2VQYW5lbCByZWYuIEl0IGxvb2tzIGxpa2Ugb3VyIHNwaW5uZXJcbiAgICAgICAgLy8gaW4gcmVuZGVyKCkgcHJldmVudHMgdGhlIHJlZiBmcm9tIGJlaW5nIHNldCBvbiBmaXJzdCBtb3VudCwgc28gd2UgdHJ5IGFuZFxuICAgICAgICAvLyBjYXRjaCB0aGUgbWVzc2FnZVBhbmVsIHdoZW4gaXQgZG9lcyBtb3VudC4gQmVjYXVzZSB3ZSBvbmx5IHdhbnQgdGhlIHJlZiBvbmNlLFxuICAgICAgICAvLyB3ZSB1c2UgYSBib29sZWFuIGZsYWcgdG8gYXZvaWQgZHVwbGljYXRlIHdvcmsuXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VQYW5lbCAmJiAhdGhpcy5zdGF0ZS5hdEVuZE9mTGl2ZVRpbWVsaW5lSW5pdCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYXRFbmRPZkxpdmVUaW1lbGluZUluaXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgYXRFbmRPZkxpdmVUaW1lbGluZTogdGhpcy5tZXNzYWdlUGFuZWwuaXNBdEVuZE9mTGl2ZVRpbWVsaW5lKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyBzZXQgYSBib29sZWFuIHRvIHNheSB3ZSd2ZSBiZWVuIHVubW91bnRlZCwgd2hpY2ggYW55IHBlbmRpbmdcbiAgICAgICAgLy8gcHJvbWlzZXMgY2FuIHVzZSB0byB0aHJvdyBhd2F5IHRoZWlyIHJlc3VsdHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIChXZSBjb3VsZCB1c2UgaXNNb3VudGVkLCBidXQgZmFjZWJvb2sgaGF2ZSBkZXByZWNhdGVkIHRoYXQuKVxuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBzY3JvbGwgbWFwIGJlZm9yZSB3ZSBnZXQgdW5tb3VudGVkXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgUm9vbVNjcm9sbFN0YXRlU3RvcmUuc2V0U2Nyb2xsU3RhdGUodGhpcy5zdGF0ZS5yb29tSWQsIHRoaXMuZ2V0U2Nyb2xsU3RhdGUoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG91bGRQZWVrKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuc3RvcFBlZWtpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3AgdHJhY2tpbmcgcm9vbSBjaGFuZ2VzIHRvIGZvcm1hdCBwZXJtYWxpbmtzXG4gICAgICAgIHRoaXMuc3RvcEFsbFBlcm1hbGlua0NyZWF0b3JzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucm9vbVZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgLy8gZGlzY29ubmVjdCB0aGUgRCZEIGV2ZW50IGxpc3RlbmVycyBmcm9tIHRoZSByb29tIHZpZXcuIFRoaXNcbiAgICAgICAgICAgIC8vIGlzIHJlYWxseSBqdXN0IGZvciBoeWdpZW5lIC0gd2UncmUgZ29pbmcgdG8gYmVcbiAgICAgICAgICAgIC8vIGRlbGV0ZWQgYW55d2F5LCBzbyBpdCBkb2Vzbid0IG1hdHRlciBpZiB0aGUgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgICAgICAvLyBkb24ndCBnZXQgY2xlYW5lZCB1cC5cbiAgICAgICAgICAgIGNvbnN0IHJvb21WaWV3ID0gdGhpcy5yb29tVmlldy5jdXJyZW50O1xuICAgICAgICAgICAgcm9vbVZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMub25Ecm9wKTtcbiAgICAgICAgICAgIHJvb21WaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5vbkRyYWdPdmVyKTtcbiAgICAgICAgICAgIHJvb21WaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMub25EcmFnTGVhdmVPckVuZCk7XG4gICAgICAgICAgICByb29tVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5vbkRyYWdMZWF2ZU9yRW5kKTtcbiAgICAgICAgfVxuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJSb29tXCIsIHRoaXMub25Sb29tKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIlJvb20udGltZWxpbmVcIiwgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJSb29tLm5hbWVcIiwgdGhpcy5vblJvb21OYW1lKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIlJvb20uYWNjb3VudERhdGFcIiwgdGhpcy5vblJvb21BY2NvdW50RGF0YSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMub25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5teU1lbWJlcnNoaXBcIiwgdGhpcy5vbk15TWVtYmVyc2hpcCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUubWVtYmVyc1wiLCB0aGlzLm9uUm9vbVN0YXRlTWVtYmVyKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcImFjY291bnREYXRhXCIsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJjcnlwdG8ua2V5QmFja3VwU3RhdHVzXCIsIHRoaXMub25LZXlCYWNrdXBTdGF0dXMpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiZGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZFwiLCB0aGlzLm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJ1c2VyVHJ1c3RTdGF0dXNDaGFuZ2VkXCIsIHRoaXMub25Vc2VyVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJjcm9zc1NpZ25pbmcua2V5c0NoYW5nZWRcIiwgdGhpcy5vbkNyb3NzU2lnbmluZ0tleXNDaGFuZ2VkKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIkV2ZW50LmRlY3J5cHRlZFwiLCB0aGlzLm9uRXZlbnREZWNyeXB0ZWQpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiZXZlbnRcIiwgdGhpcy5vbkV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCB0aGlzLm9uUGFnZVVubG9hZCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLnJlbW92ZUxpc3RlbmVyKFwibWlkZGxlUGFuZWxSZXNpemVkXCIsIHRoaXMub25SZXNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIFJvb21TdG9yZSBsaXN0ZW5lclxuICAgICAgICBpZiAodGhpcy5yb29tU3RvcmVUb2tlbikge1xuICAgICAgICAgICAgdGhpcy5yb29tU3RvcmVUb2tlbi5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgUmlnaHRQYW5lbFN0b3JlIGxpc3RlbmVyXG4gICAgICAgIGlmICh0aGlzLnJpZ2h0UGFuZWxTdG9yZVRva2VuKSB7XG4gICAgICAgICAgICB0aGlzLnJpZ2h0UGFuZWxTdG9yZVRva2VuLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgV2lkZ2V0RWNob1N0b3JlLnJlbW92ZUxpc3RlbmVyKFVQREFURV9FVkVOVCwgdGhpcy5vbldpZGdldEVjaG9TdG9yZVVwZGF0ZSk7XG4gICAgICAgIFdpZGdldFN0b3JlLmluc3RhbmNlLnJlbW92ZUxpc3RlbmVyKFVQREFURV9FVkVOVCwgdGhpcy5vbldpZGdldFN0b3JlVXBkYXRlKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tKSB7XG4gICAgICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5vZmYoXG4gICAgICAgICAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuZW1pc3Npb25Gb3JSb29tKHRoaXMuc3RhdGUucm9vbSksXG4gICAgICAgICAgICAgICAgdGhpcy5vbldpZGdldExheW91dENoYW5nZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zaG93UmVhZFJlY2VpcHRzV2F0Y2hSZWYpIHtcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5zaG93UmVhZFJlY2VpcHRzV2F0Y2hSZWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FuY2VsIGFueSBwZW5kaW5nIGNhbGxzIHRvIHRoZSByYXRlX2xpbWl0ZWRfZnVuY3NcbiAgICAgICAgdGhpcy51cGRhdGVSb29tTWVtYmVycy5jYW5jZWxQZW5kaW5nQ2FsbCgpO1xuXG4gICAgICAgIC8vIG5vIG5lZWQgdG8gZG8gdGhpcyBhcyBEaXIgJiBTZXR0aW5ncyBhcmUgbm93IG92ZXJsYXlzLiBJdCBqdXN0IGJ1cm50IENQVS5cbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJUaW50ZXIudGludCBmcm9tIFJvb21WaWV3LnVubW91bnRcIik7XG4gICAgICAgIC8vIFRpbnRlci50aW50KCk7IC8vIHJlc2V0IGNvbG91cnNjaGVtZVxuXG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5sYXlvdXRXYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTGF5b3V0Q2hhbmdlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVzZUlSQ0xheW91dDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInVzZUlSQ0xheW91dFwiKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SaWdodFBhbmVsU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1JpZ2h0UGFuZWw6IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLmlzT3BlbkZvclJvb20sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFnZVVubG9hZCA9IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKENvbnRlbnRNZXNzYWdlcy5zaGFyZWRJbnN0YW5jZSgpLmdldEN1cnJlbnRVcGxvYWRzKCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGV2ZW50LnJldHVyblZhbHVlID1cbiAgICAgICAgICAgICAgICBfdChcIllvdSBzZWVtIHRvIGJlIHVwbG9hZGluZyBmaWxlcywgYXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHF1aXQ/XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0Q2FsbEZvclJvb20oKSAmJiB0aGlzLnN0YXRlLmNhbGxTdGF0ZSAhPT0gJ2VuZGVkJykge1xuICAgICAgICAgICAgcmV0dXJuIGV2ZW50LnJldHVyblZhbHVlID1cbiAgICAgICAgICAgICAgICBfdChcIllvdSBzZWVtIHRvIGJlIGluIGEgY2FsbCwgYXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHF1aXQ/XCIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWFjdEtleURvd24gPSBldiA9PiB7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG5cbiAgICAgICAgc3dpdGNoIChldi5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgS2V5LkVTQ0FQRTpcbiAgICAgICAgICAgICAgICBpZiAoIWV2LmFsdEtleSAmJiAhZXYuY3RybEtleSAmJiAhZXYuc2hpZnRLZXkgJiYgIWV2Lm1ldGFLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwuZm9yZ2V0UmVhZE1hcmtlcigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmp1bXBUb0xpdmVUaW1lbGluZSgpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleS5QQUdFX1VQOlxuICAgICAgICAgICAgICAgIGlmICghZXYuYWx0S2V5ICYmICFldi5jdHJsS2V5ICYmIGV2LnNoaWZ0S2V5ICYmICFldi5tZXRhS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuanVtcFRvUmVhZE1hcmtlcigpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleS5VOiAvLyBNYWMgcmV0dXJucyBsb3dlcmNhc2VcbiAgICAgICAgICAgIGNhc2UgS2V5LlUudG9VcHBlckNhc2UoKTpcbiAgICAgICAgICAgICAgICBpZiAoaXNPbmx5Q3RybE9yQ21kSWdub3JlU2hpZnRLZXlFdmVudChldikgJiYgZXYuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInVwbG9hZF9maWxlXCIgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IHBheWxvYWQgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdtZXNzYWdlX3NlbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tEZXNrdG9wTm90aWZpY2F0aW9ucygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncG9zdF9zdGlja2VyX21lc3NhZ2UnOlxuICAgICAgICAgICAgICAgIHRoaXMuaW5qZWN0U3RpY2tlcihcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5kYXRhLmNvbnRlbnQudXJsLFxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmRhdGEuY29udGVudC5pbmZvLFxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmRhdGEuZGVzY3JpcHRpb24gfHwgcGF5bG9hZC5kYXRhLm5hbWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGljdHVyZV9zbmFwc2hvdCc6XG4gICAgICAgICAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgICAgICAgICBbcGF5bG9hZC5maWxlXSwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vdGlmaWVyX2VuYWJsZWQnOlxuICAgICAgICAgICAgY2FzZSAndXBsb2FkX3N0YXJ0ZWQnOlxuICAgICAgICAgICAgY2FzZSAndXBsb2FkX2ZpbmlzaGVkJzpcbiAgICAgICAgICAgIGNhc2UgJ3VwbG9hZF9jYW5jZWxlZCc6XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2FsbF9zdGF0ZSc6IHtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBmaWx0ZXIgb3V0IHBheWxvYWRzIGZvciByb29tIElEcyBvdGhlciB0aGFuIHByb3BzLnJvb20gYmVjYXVzZVxuICAgICAgICAgICAgICAgIC8vIHdlIG1heSBiZSBpbnRlcmVzdGVkIGluIHRoZSBjb25mIDE6MSByb29tXG5cbiAgICAgICAgICAgICAgICBpZiAoIXBheWxvYWQucm9vbV9pZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuZ2V0Q2FsbEZvclJvb20oKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBjYWxsU3RhdGU6IGNhbGwgPyBjYWxsLnN0YXRlIDogbnVsbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2FwcHNEcmF3ZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzaG93QXBwczogcGF5bG9hZC5zaG93LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVwbHlfdG9fZXZlbnQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMgJiYgcGF5bG9hZC5ldmVudC5nZXRSb29tSWQoKSA9PT0gdGhpcy5zdGF0ZS5yb29tSWQgJiYgIXRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25DYW5jZWxTZWFyY2hDbGljaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3F1b3RlJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHBheWxvYWQuZXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb29tSWQgPT09IHRoaXMuc3RhdGUucm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2FuY2VsU2VhcmNoQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjogcGF5bG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzeW5jX3N0YXRlJzpcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudElzUmVhZHk6IHRoaXMuY29udGV4dCAmJiB0aGlzLmNvbnRleHQuaXNJbml0aWFsU3luY0NvbXBsZXRlKCksXG4gICAgICAgICAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbmQgYW5vdGhlciBcImluaXRpYWxcIiBSVlMgdXBkYXRlIHRvIHRyaWdnZXIgcGVla2luZyBpZiBuZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmb2N1c19zZWFyY2gnOlxuICAgICAgICAgICAgICAgIHRoaXMub25TZWFyY2hDbGljaygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tVGltZWxpbmUgPSAoZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tLCB0b1N0YXJ0T2ZUaW1lbGluZTogYm9vbGVhbiwgcmVtb3ZlZCwgZGF0YSkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tc1xuICAgICAgICBpZiAoIXJvb20pIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgcm9vbS5yb29tSWQgIT0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZnJvbSBmaWx0ZXJlZCB0aW1lbGluZXNcbiAgICAgICAgaWYgKGRhdGEudGltZWxpbmUuZ2V0VGltZWxpbmVTZXQoKSAhPT0gcm9vbS5nZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IFwib3JnLm1hdHJpeC5yb29tLnByZXZpZXdfdXJsc1wiKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5KHJvb20pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gXCJtLnJvb20uZW5jcnlwdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlnbm9yZSBhbnl0aGluZyBidXQgcmVhbC10aW1lIHVwZGF0ZXMgYXQgdGhlIGVuZCBvZiB0aGUgcm9vbTpcbiAgICAgICAgLy8gdXBkYXRlcyBmcm9tIHBhZ2luYXRpb24gd2lsbCBoYXBwZW4gd2hlbiB0aGUgcGFnaW5hdGUgY29tcGxldGVzLlxuICAgICAgICBpZiAodG9TdGFydE9mVGltZWxpbmUgfHwgIWRhdGEgfHwgIWRhdGEubGl2ZUV2ZW50KSByZXR1cm47XG5cbiAgICAgICAgLy8gbm8gcG9pbnQgaGFuZGxpbmcgYW55dGhpbmcgd2hpbGUgd2UncmUgd2FpdGluZyBmb3IgdGhlIGpvaW4gdG8gZmluaXNoOlxuICAgICAgICAvLyB3ZSdsbCBvbmx5IGJlIHNob3dpbmcgYSBzcGlubmVyLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5qb2luaW5nKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGV2LmdldFNlbmRlcigpICE9PSB0aGlzLmNvbnRleHQuY3JlZGVudGlhbHMudXNlcklkKSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdW5yZWFkIGNvdW50IHdoZW4gc2Nyb2xsZWQgdXBcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzICYmIHRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZSkge1xuICAgICAgICAgICAgICAgIC8vIG5vIGNoYW5nZVxuICAgICAgICAgICAgfSBlbHNlIGlmICghc2hvdWxkSGlkZUV2ZW50KGV2KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoKHN0YXRlLCBwcm9wcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge251bVVucmVhZE1lc3NhZ2VzOiBzdGF0ZS5udW1VbnJlYWRNZXNzYWdlcyArIDF9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FdmVudERlY3J5cHRlZCA9IChldikgPT4ge1xuICAgICAgICBpZiAoZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpKSByZXR1cm47XG4gICAgICAgIHRoaXMuaGFuZGxlRWZmZWN0cyhldik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FdmVudCA9IChldikgPT4ge1xuICAgICAgICBpZiAoZXYuaXNCZWluZ0RlY3J5cHRlZCgpIHx8IGV2LmlzRGVjcnlwdGlvbkZhaWx1cmUoKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmhhbmRsZUVmZmVjdHMoZXYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGhhbmRsZUVmZmVjdHMgPSAoZXYpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSkgcmV0dXJuOyAvLyBub3QgcmVhZHkgYXQgYWxsXG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSAhPT0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZCkgcmV0dXJuOyAvLyBub3QgZm9yIHVzXG5cbiAgICAgICAgY29uc3Qgbm90aWZTdGF0ZSA9IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldFJvb21TdGF0ZSh0aGlzLnN0YXRlLnJvb20pO1xuICAgICAgICBpZiAoIW5vdGlmU3RhdGUuaXNVbnJlYWQpIHJldHVybjtcblxuICAgICAgICBDSEFUX0VGRkVDVFMuZm9yRWFjaChlZmZlY3QgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5zRW1vamkoZXYuZ2V0Q29udGVudCgpLCBlZmZlY3QuZW1vamlzKSB8fCBldi5nZXRDb250ZW50KCkubXNndHlwZSA9PT0gZWZmZWN0Lm1zZ1R5cGUpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogYGVmZmVjdHMuJHtlZmZlY3QuY29tbWFuZH1gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbU5hbWUgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tICYmIHJvb20ucm9vbUlkID09IHRoaXMuc3RhdGUucm9vbS5yb29tSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5QmFja3VwU3RhdHVzID0gKCkgPT4ge1xuICAgICAgICAvLyBLZXkgYmFja3VwIHN0YXR1cyBjaGFuZ2VzIGFmZmVjdCB3aGV0aGVyIHRoZSBpbi1yb29tIHJlY292ZXJ5XG4gICAgICAgIC8vIHJlbWluZGVyIGlzIGRpc3BsYXllZC5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgY2FuUmVzZXRUaW1lbGluZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2VQYW5lbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVBhbmVsLmNhblJlc2V0VGltZWxpbmUoKTtcbiAgICB9O1xuXG4gICAgLy8gY2FsbGVkIHdoZW4gc3RhdGUucm9vbSBpcyBmaXJzdCBpbml0aWFsaXNlZCAoZWl0aGVyIGF0IGluaXRpYWwgbG9hZCxcbiAgICAvLyBhZnRlciBhIHN1Y2Nlc3NmdWwgcGVlaywgb3IgYWZ0ZXIgd2Ugam9pbiB0aGUgcm9vbSkuXG4gICAgcHJpdmF0ZSBvblJvb21Mb2FkZWQgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAvLyBBdHRhY2ggYSB3aWRnZXQgc3RvcmUgbGlzdGVuZXIgb25seSB3aGVuIHdlIGdldCBhIHJvb21cbiAgICAgICAgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2Uub24oV2lkZ2V0TGF5b3V0U3RvcmUuZW1pc3Npb25Gb3JSb29tKHJvb20pLCB0aGlzLm9uV2lkZ2V0TGF5b3V0Q2hhbmdlKTtcbiAgICAgICAgdGhpcy5vbldpZGdldExheW91dENoYW5nZSgpOyAvLyBwcm92b2tlIGFuIHVwZGF0ZVxuXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUGVla1J1bGVzKHJvb20pO1xuICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5KHJvb20pO1xuICAgICAgICB0aGlzLmxvYWRNZW1iZXJzSWZKb2luZWQocm9vbSk7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUmVjb21tZW5kZWRWZXJzaW9uKHJvb20pO1xuICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICAgICAgdGhpcy51cGRhdGVQZXJtaXNzaW9ucyhyb29tKTtcbiAgICAgICAgdGhpcy5jaGVja1dpZGdldHMocm9vbSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgY2FsY3VsYXRlUmVjb21tZW5kZWRWZXJzaW9uKHJvb206IFJvb20pIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1cGdyYWRlUmVjb21tZW5kYXRpb246IGF3YWl0IHJvb20uZ2V0UmVjb21tZW5kZWRWZXJzaW9uKCksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgbG9hZE1lbWJlcnNJZkpvaW5lZChyb29tOiBSb29tKSB7XG4gICAgICAgIC8vIGxhenkgbG9hZCBtZW1iZXJzIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dC5oYXNMYXp5TG9hZE1lbWJlcnNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGlmIChyb29tICYmIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09ICdqb2luJykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHJvb20ubG9hZE1lbWJlcnNJZk5lZWRlZCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZW1iZXJzTG9hZGVkOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZldGNoaW5nIHJvb20gbWVtYmVycyBmb3IgJHtyb29tLnJvb21JZH0gZmFpbGVkLmAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIgUm9vbSBtZW1iZXJzIHdpbGwgYXBwZWFyIGluY29tcGxldGUuXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2FsY3VsYXRlUGVla1J1bGVzKHJvb206IFJvb20pIHtcbiAgICAgICAgY29uc3QgZ3Vlc3RBY2Nlc3NFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLmd1ZXN0X2FjY2Vzc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKGd1ZXN0QWNjZXNzRXZlbnQgJiYgZ3Vlc3RBY2Nlc3NFdmVudC5nZXRDb250ZW50KCkuZ3Vlc3RfYWNjZXNzID09PSBcImNhbl9qb2luXCIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGd1ZXN0c0NhbkpvaW46IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhpc3RvcnlWaXNpYmlsaXR5ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uaGlzdG9yeV92aXNpYmlsaXR5XCIsIFwiXCIpO1xuICAgICAgICBpZiAoaGlzdG9yeVZpc2liaWxpdHkgJiYgaGlzdG9yeVZpc2liaWxpdHkuZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eSA9PT0gXCJ3b3JsZF9yZWFkYWJsZVwiKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjYW5QZWVrOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVByZXZpZXdVcmxWaXNpYmlsaXR5KHtyb29tSWR9OiBSb29tKSB7XG4gICAgICAgIC8vIFVSTCBQcmV2aWV3cyBpbiBFMkVFIHJvb21zIGNhbiBiZSBhIHByaXZhY3kgbGVhayBzbyB1c2UgYSBkaWZmZXJlbnQgc2V0dGluZyB3aGljaCBpcyBwZXItcm9vbSBleHBsaWNpdFxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmNvbnRleHQuaXNSb29tRW5jcnlwdGVkKHJvb21JZCkgPyAndXJsUHJldmlld3NFbmFibGVkX2UyZWUnIDogJ3VybFByZXZpZXdzRW5hYmxlZCc7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd1VybFByZXZpZXc6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoa2V5LCByb29tSWQpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbSA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmICghcm9vbSB8fCByb29tLnJvb21JZCAhPT0gdGhpcy5zdGF0ZS5yb29tSWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGFjaCB0aGUgbGlzdGVuZXIgaWYgdGhlIHJvb20gaXMgY2hhbmdpbmcgZm9yIHNvbWUgcmVhc29uXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm9mZihcbiAgICAgICAgICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5lbWlzc2lvbkZvclJvb20odGhpcy5zdGF0ZS5yb29tKSxcbiAgICAgICAgICAgICAgICB0aGlzLm9uV2lkZ2V0TGF5b3V0Q2hhbmdlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcm9vbTogcm9vbSxcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblJvb21Mb2FkZWQocm9vbSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCA9ICh1c2VySWQ6IHN0cmluZywgZGV2aWNlOiBvYmplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuc3RhdGUucm9vbTtcbiAgICAgICAgaWYgKCFyb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIodXNlcklkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRTJFU3RhdHVzKHJvb20pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQgPSAodXNlcklkOiBzdHJpbmcsIHRydXN0U3RhdHVzOiBvYmplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuc3RhdGUucm9vbTtcbiAgICAgICAgaWYgKCFyb29tIHx8ICFyb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIodXNlcklkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRTJFU3RhdHVzKHJvb20pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ3Jvc3NTaWduaW5nS2V5c0NoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnN0YXRlLnJvb207XG4gICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUUyRVN0YXR1cyhyb29tKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZUUyRVN0YXR1cyhyb29tOiBSb29tKSB7XG4gICAgICAgIGlmICghdGhpcy5jb250ZXh0LmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuY29udGV4dC5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgLy8gSWYgY3J5cHRvIGlzIG5vdCBjdXJyZW50bHkgZW5hYmxlZCwgd2UgYXJlbid0IHRyYWNraW5nIGRldmljZXMgYXQgYWxsLFxuICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3Qga25vdyB3aGF0IHRoZSBhbnN3ZXIgaXMuIExldCdzIGVycm9yIG9uIHRoZSBzYWZlIHNpZGUgYW5kIHNob3dcbiAgICAgICAgICAgIC8vIGEgd2FybmluZyBmb3IgdGhpcyBjYXNlLlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZTJlU3RhdHVzOiBFMkVTdGF0dXMuV2FybmluZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogQXQgdGhpcyBwb2ludCwgdGhlIHVzZXIgaGFzIGVuY3J5cHRpb24gb24gYW5kIGNyb3NzLXNpZ25pbmcgb24gKi9cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlMmVTdGF0dXM6IGF3YWl0IHNoaWVsZFN0YXR1c0ZvclJvb20odGhpcy5jb250ZXh0LCByb29tKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVUaW50KCkge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5zdGF0ZS5yb29tO1xuICAgICAgICBpZiAoIXJvb20pIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIlRpbnRlci50aW50IGZyb20gdXBkYXRlVGludFwiKTtcbiAgICAgICAgY29uc3QgY29sb3JTY2hlbWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwicm9vbUNvbG9yXCIsIHJvb20ucm9vbUlkKTtcbiAgICAgICAgVGludGVyLnRpbnQoY29sb3JTY2hlbWUucHJpbWFyeV9jb2xvciwgY29sb3JTY2hlbWUuc2Vjb25kYXJ5X2NvbG9yKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudERhdGEgPSAoZXZlbnQ6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBldmVudC5nZXRUeXBlKCk7XG4gICAgICAgIGlmICgodHlwZSA9PT0gXCJvcmcubWF0cml4LnByZXZpZXdfdXJsc1wiIHx8IHR5cGUgPT09IFwiaW0udmVjdG9yLndlYi5zZXR0aW5nc1wiKSAmJiB0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIC8vIG5vbi1lMmVlIHVybCBwcmV2aWV3cyBhcmUgc3RvcmVkIGluIGxlZ2FjeSBldmVudCB0eXBlIGBvcmcubWF0cml4LnJvb20ucHJldmlld191cmxzYFxuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3VXJsVmlzaWJpbGl0eSh0aGlzLnN0YXRlLnJvb20pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tQWNjb3VudERhdGEgPSAoZXZlbnQ6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmIChyb29tLnJvb21JZCA9PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGV2ZW50LmdldFR5cGUoKTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBcIm9yZy5tYXRyaXgucm9vbS5jb2xvcl9zY2hlbWVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yU2NoZW1lID0gZXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgICAgIC8vIFhYWDogd2Ugc2hvdWxkIHZhbGlkYXRlIHRoZSBldmVudFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGludGVyLnRpbnQgZnJvbSBvblJvb21BY2NvdW50RGF0YVwiKTtcbiAgICAgICAgICAgICAgICBUaW50ZXIudGludChjb2xvclNjaGVtZS5wcmltYXJ5X2NvbG9yLCBjb2xvclNjaGVtZS5zZWNvbmRhcnlfY29sb3IpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm9yZy5tYXRyaXgucm9vbS5wcmV2aWV3X3VybHNcIiB8fCB0eXBlID09PSBcImltLnZlY3Rvci53ZWIuc2V0dGluZ3NcIikge1xuICAgICAgICAgICAgICAgIC8vIG5vbi1lMmVlIHVybCBwcmV2aWV3cyBhcmUgc3RvcmVkIGluIGxlZ2FjeSBldmVudCB0eXBlIGBvcmcubWF0cml4LnJvb20ucHJldmlld191cmxzYFxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlld1VybFZpc2liaWxpdHkocm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21TdGF0ZUV2ZW50cyA9IChldjogTWF0cml4RXZlbnQsIHN0YXRlKSA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBpZiB3ZSBkb24ndCBoYXZlIGEgcm9vbSB5ZXRcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20gfHwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCAhPT0gc3RhdGUucm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVBlcm1pc3Npb25zKHRoaXMuc3RhdGUucm9vbSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVNZW1iZXIgPSAoZXY6IE1hdHJpeEV2ZW50LCBzdGF0ZSwgbWVtYmVyKSA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBpZiB3ZSBkb24ndCBoYXZlIGEgcm9vbSB5ZXRcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlnbm9yZSBtZW1iZXJzIGluIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChtZW1iZXIucm9vbUlkICE9PSB0aGlzLnN0YXRlLnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVJvb21NZW1iZXJzKG1lbWJlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NeU1lbWJlcnNoaXAgPSAocm9vbTogUm9vbSwgbWVtYmVyc2hpcDogc3RyaW5nLCBvbGRNZW1iZXJzaGlwOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHJvb20ucm9vbUlkID09PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5sb2FkTWVtYmVyc0lmSm9pbmVkKHJvb20pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQZXJtaXNzaW9ucyhyb29tKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZVBlcm1pc3Npb25zKHJvb206IFJvb20pIHtcbiAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcy5jb250ZXh0LmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgY29uc3QgY2FuUmVhY3QgPSByb29tLmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIiAmJiByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kRXZlbnQoXCJtLnJlYWN0aW9uXCIsIG1lKTtcbiAgICAgICAgICAgIGNvbnN0IGNhblJlcGx5ID0gcm9vbS5tYXlTZW5kTWVzc2FnZSgpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjYW5SZWFjdCwgY2FuUmVwbHl9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJhdGUgbGltaXRlZCBiZWNhdXNlIGEgcG93ZXIgbGV2ZWwgY2hhbmdlIHdpbGwgZW1pdCBhbiBldmVudCBmb3IgZXZlcnkgbWVtYmVyIGluIHRoZSByb29tLlxuICAgIHByaXZhdGUgdXBkYXRlUm9vbU1lbWJlcnMgPSByYXRlTGltaXRlZEZ1bmMoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZURNU3RhdGUoKTtcbiAgICAgICAgdGhpcy51cGRhdGVFMkVTdGF0dXModGhpcy5zdGF0ZS5yb29tKTtcbiAgICB9LCA1MDApO1xuXG4gICAgcHJpdmF0ZSBjaGVja0Rlc2t0b3BOb3RpZmljYXRpb25zKCkge1xuICAgICAgICBjb25zdCBtZW1iZXJDb3VudCA9IHRoaXMuc3RhdGUucm9vbS5nZXRKb2luZWRNZW1iZXJDb3VudCgpICsgdGhpcy5zdGF0ZS5yb29tLmdldEludml0ZWRNZW1iZXJDb3VudCgpO1xuICAgICAgICAvLyBpZiB0aGV5IGFyZSBub3QgYWxvbmUgcHJvbXB0IHRoZSB1c2VyIGFib3V0IG5vdGlmaWNhdGlvbnMgc28gdGhleSBkb24ndCBtaXNzIHJlcGxpZXNcbiAgICAgICAgaWYgKG1lbWJlckNvdW50ID4gMSAmJiBOb3RpZmllci5zaG91bGRTaG93UHJvbXB0KCkpIHtcbiAgICAgICAgICAgIHNob3dOb3RpZmljYXRpb25zVG9hc3QodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZURNU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnN0YXRlLnJvb207XG4gICAgICAgIGlmIChyb29tLmdldE15TWVtYmVyc2hpcCgpICE9IFwiam9pblwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZG1JbnZpdGVyID0gcm9vbS5nZXRETUludml0ZXIoKTtcbiAgICAgICAgaWYgKGRtSW52aXRlcikge1xuICAgICAgICAgICAgUm9vbXMuc2V0RE1Sb29tKHJvb20ucm9vbUlkLCBkbUludml0ZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlYXJjaFJlc3VsdHNGaWxsUmVxdWVzdCA9IChiYWNrd2FyZHM6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgaWYgKCFiYWNrd2FyZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5uZXh0X2JhdGNoKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInJlcXVlc3RpbmcgbW9yZSBzZWFyY2ggcmVzdWx0c1wiKTtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFByb21pc2UgPSBzZWFyY2hQYWdpbmF0aW9uKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZWFyY2hSZXN1bHQoc2VhcmNoUHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIm5vIG1vcmUgc2VhcmNoIHJlc3VsdHNcIik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSW52aXRlQnV0dG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIGNhbGwgQWRkcmVzc1BpY2tlckRpYWxvZ1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19pbnZpdGUnLFxuICAgICAgICAgICAgcm9vbUlkOiB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkpvaW5CdXR0b25DbGlja2VkID0gKCkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgdXNlciBpcyBhIFJPVSwgYWxsb3cgdGhlbSB0byB0cmFuc2l0aW9uIHRvIGEgUFdMVVxuICAgICAgICBpZiAodGhpcy5jb250ZXh0ICYmIHRoaXMuY29udGV4dC5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIC8vIEpvaW4gdGhpcyByb29tIG9uY2UgdGhlIHVzZXIgaGFzIHJlZ2lzdGVyZWQgYW5kIGxvZ2dlZCBpblxuICAgICAgICAgICAgLy8gKElmIHdlIGZhaWxlZCB0byBwZWVrLCB3ZSBtYXkgbm90IGhhdmUgYSB2YWxpZCByb29tIG9iamVjdC4pXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2RvX2FmdGVyX3N5bmNfcHJlcGFyZWQnLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiB0aGlzLmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWduVXJsID0gdGhpcy5wcm9wcy50aHJlZXBpZEludml0ZT8uc2lnblVybDtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdqb2luX3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICBvcHRzOiB7IGludml0ZVNpZ25Vcmw6IHNpZ25VcmwsIHZpYVNlcnZlcnM6IHRoaXMucHJvcHMudmlhU2VydmVycyB9LFxuICAgICAgICAgICAgICAgICAgICBfdHlwZTogXCJ1bmtub3duXCIsIC8vIFRPRE86IGluc3RydW1lbnRhdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NZXNzYWdlTGlzdFNjcm9sbCA9IGV2ID0+IHtcbiAgICAgICAgaWYgKHRoaXMubWVzc2FnZVBhbmVsLmlzQXRFbmRPZkxpdmVUaW1lbGluZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBudW1VbnJlYWRNZXNzYWdlczogMCxcbiAgICAgICAgICAgICAgICBhdEVuZE9mTGl2ZVRpbWVsaW5lOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhdEVuZE9mTGl2ZVRpbWVsaW5lOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlVG9wVW5yZWFkTWVzc2FnZXNCYXIoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRyYWdPdmVyID0gZXYgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdub25lJztcblxuICAgICAgICBpZiAoZXYuZGF0YVRyYW5zZmVyLnR5cGVzLmluY2x1ZGVzKFwiRmlsZXNcIikgfHwgZXYuZGF0YVRyYW5zZmVyLnR5cGVzLmluY2x1ZGVzKFwiYXBwbGljYXRpb24veC1tb3otZmlsZVwiKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRyYWdnaW5nRmlsZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGV2LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ecm9wID0gZXYgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgZXYuZGF0YVRyYW5zZmVyLmZpbGVzLCB0aGlzLnN0YXRlLnJvb20ucm9vbUlkLCB0aGlzLmNvbnRleHQsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkcmFnZ2luZ0ZpbGU6IGZhbHNlIH0pO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25EcmFnTGVhdmVPckVuZCA9IGV2ID0+IHtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkcmFnZ2luZ0ZpbGU6IGZhbHNlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGluamVjdFN0aWNrZXIodXJsLCBpbmZvLCB0ZXh0KSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJ30pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZFN0aWNrZXJDb250ZW50VG9Sb29tKHVybCwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCwgaW5mbywgdGV4dCwgdGhpcy5jb250ZXh0KVxuICAgICAgICAgICAgLnRoZW4odW5kZWZpbmVkLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IubmFtZSA9PT0gXCJVbmtub3duRGV2aWNlRXJyb3JcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBMZXQgdGhlIHN0YXVzIGJhciBoYW5kbGUgdGhpc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlYXJjaCA9ICh0ZXJtOiBzdHJpbmcsIHNjb3BlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoVGVybTogdGVybSxcbiAgICAgICAgICAgIHNlYXJjaFNjb3BlOiBzY29wZSxcbiAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IHt9LFxuICAgICAgICAgICAgc2VhcmNoSGlnaGxpZ2h0czogW10sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSBhIHNlYXJjaCBwYW5lbCwgd2UgbmVlZCB0byB0ZWxsIGl0IHRvIGZvcmdldFxuICAgICAgICAvLyBhYm91dCBpdHMgc2Nyb2xsIHN0YXRlLlxuICAgICAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudC5yZXNldFNjcm9sbFN0YXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB3ZSBkb24ndCBlbmQgdXAgc2hvd2luZyByZXN1bHRzIGZyb21cbiAgICAgICAgLy8gYW4gYWJvcnRlZCBzZWFyY2ggYnkga2VlcGluZyBhIHVuaXF1ZSBpZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gdG9kbzogc2hvdWxkIGNhbmNlbCBhbnkgcHJldmlvdXMgc2VhcmNoIHJlcXVlc3RzLlxuICAgICAgICB0aGlzLnNlYXJjaElkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgbGV0IHJvb21JZDtcbiAgICAgICAgaWYgKHNjb3BlID09PSBcIlJvb21cIikgcm9vbUlkID0gdGhpcy5zdGF0ZS5yb29tLnJvb21JZDtcblxuICAgICAgICBkZWJ1Z2xvZyhcInNlbmRpbmcgc2VhcmNoIHJlcXVlc3RcIik7XG4gICAgICAgIGNvbnN0IHNlYXJjaFByb21pc2UgPSBldmVudFNlYXJjaCh0ZXJtLCByb29tSWQpO1xuICAgICAgICB0aGlzLmhhbmRsZVNlYXJjaFJlc3VsdChzZWFyY2hQcm9taXNlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBoYW5kbGVTZWFyY2hSZXN1bHQoc2VhcmNoUHJvbWlzZTogUHJvbWlzZTxhbnk+KSB7XG4gICAgICAgIC8vIGtlZXAgYSByZWNvcmQgb2YgdGhlIGN1cnJlbnQgc2VhcmNoIGlkLCBzbyB0aGF0IGlmIHRoZSBzZWFyY2ggdGVybXNcbiAgICAgICAgLy8gY2hhbmdlIGJlZm9yZSB3ZSBnZXQgYSByZXNwb25zZSwgd2UgY2FuIGlnbm9yZSB0aGUgcmVzdWx0cy5cbiAgICAgICAgY29uc3QgbG9jYWxTZWFyY2hJZCA9IHRoaXMuc2VhcmNoSWQ7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWFyY2hJblByb2dyZXNzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VhcmNoUHJvbWlzZS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInNlYXJjaCBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCB8fCAhdGhpcy5zdGF0ZS5zZWFyY2hpbmcgfHwgdGhpcy5zZWFyY2hJZCAhPSBsb2NhbFNlYXJjaElkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkRpc2NhcmRpbmcgc3RhbGUgc2VhcmNoIHJlc3VsdHNcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwb3N0Z3JlcyBvbiBzeW5hcHNlIHJldHVybnMgdXMgcHJlY2lzZSBkZXRhaWxzIG9mIHRoZSBzdHJpbmdzXG4gICAgICAgICAgICAvLyB3aGljaCBhY3R1YWxseSBnb3QgbWF0Y2hlZCBmb3IgaGlnaGxpZ2h0aW5nLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEluIGVpdGhlciBjYXNlLCB3ZSB3YW50IHRvIGhpZ2hsaWdodCB0aGUgbGl0ZXJhbCBzZWFyY2ggdGVybVxuICAgICAgICAgICAgLy8gd2hldGhlciBpdCB3YXMgdXNlZCBieSB0aGUgc2VhcmNoIGVuZ2luZSBvciBub3QuXG5cbiAgICAgICAgICAgIGxldCBoaWdobGlnaHRzID0gcmVzdWx0cy5oaWdobGlnaHRzO1xuICAgICAgICAgICAgaWYgKGhpZ2hsaWdodHMuaW5kZXhPZih0aGlzLnN0YXRlLnNlYXJjaFRlcm0pIDwgMCkge1xuICAgICAgICAgICAgICAgIGhpZ2hsaWdodHMgPSBoaWdobGlnaHRzLmNvbmNhdCh0aGlzLnN0YXRlLnNlYXJjaFRlcm0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGb3Igb3ZlcmxhcHBpbmcgaGlnaGxpZ2h0cyxcbiAgICAgICAgICAgIC8vIGZhdm91ciBsb25nZXIgKG1vcmUgc3BlY2lmaWMpIHRlcm1zIGZpcnN0XG4gICAgICAgICAgICBoaWdobGlnaHRzID0gaGlnaGxpZ2h0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYi5sZW5ndGggLSBhLmxlbmd0aDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZWFyY2hIaWdobGlnaHRzOiBoaWdobGlnaHRzLFxuICAgICAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IHJlc3VsdHMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlNlYXJjaCBmYWlsZWRcIiwgZXJyb3IpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2VhcmNoIGZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlNlYXJjaCBmYWlsZWRcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgPyBlcnJvci5tZXNzYWdlIDpcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJTZXJ2ZXIgbWF5IGJlIHVuYXZhaWxhYmxlLCBvdmVybG9hZGVkLCBvciBzZWFyY2ggdGltZWQgb3V0IDooXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlYXJjaEluUHJvZ3Jlc3M6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U2VhcmNoUmVzdWx0VGlsZXMoKSB7XG4gICAgICAgIGNvbnN0IFNlYXJjaFJlc3VsdFRpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5TZWFyY2hSZXN1bHRUaWxlJyk7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcblxuICAgICAgICAvLyBYWFg6IHRvZG86IG1lcmdlIG92ZXJsYXBwaW5nIHJlc3VsdHMgc29tZWhvdz9cbiAgICAgICAgLy8gWFhYOiB3aHkgZG9lc24ndCBzZWFyY2hpbmcgb24gbmFtZSB3b3JrP1xuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaEluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKDxsaSBrZXk9XCJzZWFyY2gtc3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2xpPik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5uZXh0X2JhdGNoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cz8ucmVzdWx0cz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goPGxpIGtleT1cInNlYXJjaC10b3AtbWFya2VyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJteF9Sb29tVmlld190b3BNYXJrZXJcIj57IF90KFwiTm8gcmVzdWx0c1wiKSB9PC9oMj5cbiAgICAgICAgICAgICAgICA8L2xpPixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaCg8bGkga2V5PVwic2VhcmNoLXRvcC1tYXJrZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X3RvcE1hcmtlclwiPnsgX3QoXCJObyBtb3JlIHJlc3VsdHNcIikgfTwvaDI+XG4gICAgICAgICAgICAgICAgPC9saT4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9uY2UgZHluYW1pYyBjb250ZW50IGluIHRoZSBzZWFyY2ggcmVzdWx0cyBsb2FkLCBtYWtlIHRoZSBzY3JvbGxQYW5lbCBjaGVja1xuICAgICAgICAvLyB0aGUgc2Nyb2xsIG9mZnNldHMuXG4gICAgICAgIGNvbnN0IG9uSGVpZ2h0Q2hhbmdlZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFBhbmVsID0gdGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudDtcbiAgICAgICAgICAgIGlmIChzY3JvbGxQYW5lbCkge1xuICAgICAgICAgICAgICAgIHNjcm9sbFBhbmVsLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGxhc3RSb29tSWQ7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9ICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHM/LnJlc3VsdHM/Lmxlbmd0aCB8fCAwKSAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMucmVzdWx0c1tpXTtcblxuICAgICAgICAgICAgY29uc3QgbXhFdiA9IHJlc3VsdC5jb250ZXh0LmdldEV2ZW50KCk7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBteEV2LmdldFJvb21JZCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBkbyBub3QgaGF2ZSB0aGUgcm9vbSBpbiBqcy1zZGsgc3RvcmVzIHRoZW4gaGlkZSBpdCBhcyB3ZSBjYW5ub3QgZWFzaWx5IHNob3cgaXRcbiAgICAgICAgICAgICAgICAvLyBBcyBwZXIgdGhlIHNwZWMsIGFuIGFsbCByb29tcyBzZWFyY2ggY2FuIGNyZWF0ZSB0aGlzIGNvbmRpdGlvbixcbiAgICAgICAgICAgICAgICAvLyBpdCBoYXBwZW5zIHdpdGggU2VzaGF0IGJ1dCBub3QgU3luYXBzZS5cbiAgICAgICAgICAgICAgICAvLyBJdCB3aWxsIG1ha2UgdGhlIHJlc3VsdCBjb3VudCBub3QgbWF0Y2ggdGhlIGRpc3BsYXllZCBjb3VudC5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhpZGluZyBzZWFyY2ggcmVzdWx0IGZyb20gYW4gdW5rbm93biByb29tXCIsIHJvb21JZCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaGF2ZVRpbGVGb3JFdmVudChteEV2KSkge1xuICAgICAgICAgICAgICAgIC8vIFhYWDogY2FuIHRoaXMgZXZlciBoYXBwZW4/IEl0IHdpbGwgbWFrZSB0aGUgcmVzdWx0IGNvdW50XG4gICAgICAgICAgICAgICAgLy8gbm90IG1hdGNoIHRoZSBkaXNwbGF5ZWQgY291bnQuXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFNjb3BlID09PSAnQWxsJykge1xuICAgICAgICAgICAgICAgIGlmIChyb29tSWQgIT09IGxhc3RSb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goPGxpIGtleT17bXhFdi5nZXRJZCgpICsgXCItcm9vbVwifT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMj57IF90KFwiUm9vbVwiKSB9OiB7IHJvb20ubmFtZSB9PC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPC9saT4pO1xuICAgICAgICAgICAgICAgICAgICBsYXN0Um9vbUlkID0gcm9vbUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0TGluayA9IFwiIy9yb29tL1wiK3Jvb21JZCtcIi9cIitteEV2LmdldElkKCk7XG5cbiAgICAgICAgICAgIHJldC5wdXNoKDxTZWFyY2hSZXN1bHRUaWxlXG4gICAgICAgICAgICAgICAga2V5PXtteEV2LmdldElkKCl9XG4gICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0PXtyZXN1bHR9XG4gICAgICAgICAgICAgICAgc2VhcmNoSGlnaGxpZ2h0cz17dGhpcy5zdGF0ZS5zZWFyY2hIaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgIHJlc3VsdExpbms9e3Jlc3VsdExpbmt9XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5nZXRQZXJtYWxpbmtDcmVhdG9yRm9yUm9vbShyb29tKX1cbiAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e29uSGVpZ2h0Q2hhbmdlZH1cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25QaW5uZWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgbm93U2hvd2luZ1Bpbm5lZCA9ICF0aGlzLnN0YXRlLnNob3dpbmdQaW5uZWQ7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMuc3RhdGUucm9vbS5yb29tSWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dpbmdQaW5uZWQ6IG5vd1Nob3dpbmdQaW5uZWQsIHNlYXJjaGluZzogZmFsc2V9KTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcIlBpbm5lZEV2ZW50cy5pc09wZW5cIiwgcm9vbUlkLCBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UsIG5vd1Nob3dpbmdQaW5uZWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2V0dGluZ3NDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcIm9wZW5fcm9vbV9zZXR0aW5nc1wiIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2FuY2VsQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRlVGludCBmcm9tIG9uQ2FuY2VsQ2xpY2tcIik7XG4gICAgICAgIHRoaXMudXBkYXRlVGludCgpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mb3J3YXJkaW5nRXZlbnQpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZm9yd2FyZF9ldmVudCcsXG4gICAgICAgICAgICAgICAgZXZlbnQ6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BcHBzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFwiYXBwc0RyYXdlclwiLFxuICAgICAgICAgICAgc2hvdzogIXRoaXMuc3RhdGUuc2hvd0FwcHMsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTGVhdmVDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2xlYXZlX3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5zdGF0ZS5yb29tLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Gb3JnZXRDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2ZvcmdldF9yb29tJyxcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMuc3RhdGUucm9vbS5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZCA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByZWplY3Rpbmc6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRleHQubGVhdmUodGhpcy5zdGF0ZS5yb29tSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAndmlld19ob21lX3BhZ2UnIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVqZWN0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gcmVqZWN0IGludml0ZTogJXNcIiwgZXJyb3IpO1xuXG4gICAgICAgICAgICBjb25zdCBtc2cgPSBlcnJvci5tZXNzYWdlID8gZXJyb3IubWVzc2FnZSA6IEpTT04uc3RyaW5naWZ5KGVycm9yKTtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gcmVqZWN0IGludml0ZScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byByZWplY3QgaW52aXRlXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtc2csXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVqZWN0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZWplY3RFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZWplY3RBbmRJZ25vcmVDbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByZWplY3Rpbmc6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBteU1lbWJlciA9IHRoaXMuc3RhdGUucm9vbS5nZXRNZW1iZXIodGhpcy5jb250ZXh0LmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIGNvbnN0IGludml0ZUV2ZW50ID0gbXlNZW1iZXIuZXZlbnRzLm1lbWJlcjtcbiAgICAgICAgICAgIGNvbnN0IGlnbm9yZWRVc2VycyA9IHRoaXMuY29udGV4dC5nZXRJZ25vcmVkVXNlcnMoKTtcbiAgICAgICAgICAgIGlnbm9yZWRVc2Vycy5wdXNoKGludml0ZUV2ZW50LmdldFNlbmRlcigpKTsgLy8gZGUtZHVwZWQgaW50ZXJuYWxseSBpbiB0aGUganMtc2RrXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRleHQuc2V0SWdub3JlZFVzZXJzKGlnbm9yZWRVc2Vycyk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY29udGV4dC5sZWF2ZSh0aGlzLnN0YXRlLnJvb21JZCk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICd2aWV3X2hvbWVfcGFnZScgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWplY3Rpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHJlamVjdCBpbnZpdGU6ICVzXCIsIGVycm9yKTtcblxuICAgICAgICAgICAgY29uc3QgbXNnID0gZXJyb3IubWVzc2FnZSA/IGVycm9yLm1lc3NhZ2UgOiBKU09OLnN0cmluZ2lmeShlcnJvcik7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHJlamVjdCBpbnZpdGUnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gcmVqZWN0IGludml0ZVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbXNnLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlamVjdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVqZWN0RXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlamVjdFRocmVlcGlkSW52aXRlQnV0dG9uQ2xpY2tlZCA9IGV2ID0+IHtcbiAgICAgICAgLy8gV2UgY2FuIHJlamVjdCAzcGlkIGludml0ZXMgaW4gdGhlIHNhbWUgd2F5IHRoYXQgd2UgYWNjZXB0IHRoZW0sXG4gICAgICAgIC8vIHVzaW5nIC9sZWF2ZSByYXRoZXIgdGhhbiAvam9pbi4gSW4gdGhlIHNob3J0IHRlcm0gdGhvdWdoLCB3ZVxuICAgICAgICAvLyBqdXN0IGlnbm9yZSB0aGVtLlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL3ZlY3Rvci13ZWIvaXNzdWVzLzExMzRcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdSb29tRGlyZWN0b3J5KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNlYXJjaENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlYXJjaGluZzogIXRoaXMuc3RhdGUuc2VhcmNoaW5nLFxuICAgICAgICAgICAgc2hvd2luZ1Bpbm5lZDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2FuY2VsU2VhcmNoQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBqdW1wIGRvd24gdG8gdGhlIGJvdHRvbSBvZiB0aGlzIHJvb20sIHdoZXJlIG5ldyBldmVudHMgYXJlIGFycml2aW5nXG4gICAgcHJpdmF0ZSBqdW1wVG9MaXZlVGltZWxpbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMubWVzc2FnZVBhbmVsLmp1bXBUb0xpdmVUaW1lbGluZSgpO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgfTtcblxuICAgIC8vIGp1bXAgdXAgdG8gd2hlcmV2ZXIgb3VyIHJlYWQgbWFya2VyIGlzXG4gICAgcHJpdmF0ZSBqdW1wVG9SZWFkTWFya2VyID0gKCkgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbC5qdW1wVG9SZWFkTWFya2VyKCk7XG4gICAgfTtcblxuICAgIC8vIHVwZGF0ZSB0aGUgcmVhZCBtYXJrZXIgdG8gbWF0Y2ggdGhlIHJlYWQtcmVjZWlwdFxuICAgIHByaXZhdGUgZm9yZ2V0UmVhZE1hcmtlciA9IGV2ID0+IHtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMubWVzc2FnZVBhbmVsLmZvcmdldFJlYWRNYXJrZXIoKTtcbiAgICB9O1xuXG4gICAgLy8gZGVjaWRlIHdoZXRoZXIgb3Igbm90IHRoZSB0b3AgJ3VucmVhZCBtZXNzYWdlcycgYmFyIHNob3VsZCBiZSBzaG93blxuICAgIHByaXZhdGUgdXBkYXRlVG9wVW5yZWFkTWVzc2FnZXNCYXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5tZXNzYWdlUGFuZWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNob3dCYXIgPSB0aGlzLm1lc3NhZ2VQYW5lbC5jYW5KdW1wVG9SZWFkTWFya2VyKCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dUb3BVbnJlYWRNZXNzYWdlc0JhciAhPSBzaG93QmFyKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93VG9wVW5yZWFkTWVzc2FnZXNCYXI6IHNob3dCYXJ9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBnZXQgdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSByb29tLCBzbyB0aGF0IGl0IGNhbiBiZVxuICAgIC8vIHJlc3RvcmVkIHdoZW4gd2Ugc3dpdGNoIGJhY2sgdG8gaXQuXG4gICAgLy9cbiAgICBwcml2YXRlIGdldFNjcm9sbFN0YXRlKCkge1xuICAgICAgICBjb25zdCBtZXNzYWdlUGFuZWwgPSB0aGlzLm1lc3NhZ2VQYW5lbDtcbiAgICAgICAgaWYgKCFtZXNzYWdlUGFuZWwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIGlmIHdlJ3JlIGZvbGxvd2luZyB0aGUgbGl2ZSB0aW1lbGluZSwgd2Ugd2FudCB0byByZXR1cm4gbnVsbDsgdGhhdFxuICAgICAgICAvLyBtZWFucyB0aGF0LCBpZiB3ZSBzd2l0Y2ggYmFjaywgd2Ugd2lsbCBqdW1wIHRvIHRoZSByZWFkLXVwLXRvIG1hcmsuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoYXQgc2hvdWxkIGJlIG1vcmUgaW50dWl0aXZlIHRoYW4gc2xhdmlzaGx5IHByZXNlcnZpbmcgdGhlIGN1cnJlbnRcbiAgICAgICAgLy8gc2Nyb2xsIHN0YXRlLCBpbiB0aGUgY2FzZSB3aGVyZSB0aGUgcm9vbSBhZHZhbmNlcyBpbiB0aGUgbWVhbnRpbWVcbiAgICAgICAgLy8gKHBhcnRpY3VsYXJseSBpbiB0aGUgY2FzZSB0aGF0IHRoZSB1c2VyIHJlYWRzIHNvbWUgc3R1ZmYgb24gYW5vdGhlclxuICAgICAgICAvLyBkZXZpY2UpLlxuICAgICAgICAvL1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hdEVuZE9mTGl2ZVRpbWVsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNjcm9sbFN0YXRlID0gbWVzc2FnZVBhbmVsLmdldFNjcm9sbFN0YXRlKCk7XG5cbiAgICAgICAgLy8gZ2V0U2Nyb2xsU3RhdGUgb24gVGltZWxpbmVQYW5lbCAqbWF5KiByZXR1cm4gbnVsbCwgc28gZ3VhcmQgYWdhaW5zdCB0aGF0XG4gICAgICAgIGlmICghc2Nyb2xsU3RhdGUgfHwgc2Nyb2xsU3RhdGUuc3R1Y2tBdEJvdHRvbSkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgcmVhbGx5IGV4cGVjdCB0byBiZSBpbiB0aGlzIHN0YXRlLCBidXQgaXQgd2lsbFxuICAgICAgICAgICAgLy8gb2NjYXNpb25hbGx5IGhhcHBlbiB3aGVuIG5vIHNjcm9sbCBzdGF0ZSBoYXMgYmVlbiBzZXQgb24gdGhlXG4gICAgICAgICAgICAvLyBtZXNzYWdlUGFuZWwgKGllLCB3ZSBkaWRuJ3QgaGF2ZSBhbiBpbml0aWFsIGV2ZW50IChzbyBpdCdzXG4gICAgICAgICAgICAvLyBwcm9iYWJseSBhIG5ldyByb29tKSwgdGhlcmUgaGFzIGJlZW4gbm8gdXNlci1pbml0aWF0ZWQgc2Nyb2xsLCBhbmRcbiAgICAgICAgICAgIC8vIG5vIHJlYWQtcmVjZWlwdHMgaGF2ZSBhcnJpdmVkIHRvIHVwZGF0ZSB0aGUgc2Nyb2xsIHBvc2l0aW9uKS5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBSZXR1cm4gbnVsbCwgd2hpY2ggd2lsbCBjYXVzZSB1cyB0byBzY3JvbGwgdG8gbGFzdCB1bnJlYWQgb25cbiAgICAgICAgICAgIC8vIHJlbG9hZC5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZvY3Vzc2VkRXZlbnQ6IHNjcm9sbFN0YXRlLnRyYWNrZWRTY3JvbGxUb2tlbixcbiAgICAgICAgICAgIHBpeGVsT2Zmc2V0OiBzY3JvbGxTdGF0ZS5waXhlbE9mZnNldCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAvLyBJdCBzZWVtcyBmbGV4Ym94IGRvZXNuJ3QgZ2l2ZSB1cyBhIHdheSB0byBjb25zdHJhaW4gdGhlIGF1eFBhbmVsIGhlaWdodCB0byBoYXZlXG4gICAgICAgIC8vIGEgbWluaW11bSBvZiB0aGUgaGVpZ2h0IG9mIHRoZSB2aWRlbyBlbGVtZW50LCB3aGlsc3QgYWxzbyBjYXBwaW5nIGl0IGZyb20gcHVzaGluZyBvdXQgdGhlIHBhZ2VcbiAgICAgICAgLy8gc28gd2UgaGF2ZSB0byBkbyBpdCB2aWEgSlMgaW5zdGVhZC4gIEluIHRoaXMgaW1wbGVtZW50YXRpb24gd2UgY2FwIHRoZSBoZWlnaHQgYnkgcHV0dGluZ1xuICAgICAgICAvLyBhIG1heEhlaWdodCBvbiB0aGUgdW5kZXJseWluZyByZW1vdGUgdmlkZW8gdGFnLlxuXG4gICAgICAgIC8vIGhlYWRlciArIGZvb3RlciArIHN0YXR1cyArIGdpdmUgdXMgYXQgbGVhc3QgMTIwcHggb2Ygc2Nyb2xsYmFjayBhdCBhbGwgdGltZXMuXG4gICAgICAgIGxldCBhdXhQYW5lbE1heEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtXG4gICAgICAgICAgICAgICAgKDU0ICsgLy8gaGVpZ2h0IG9mIFJvb21IZWFkZXJcbiAgICAgICAgICAgICAgICAgMzYgKyAvLyBoZWlnaHQgb2YgdGhlIHN0YXR1cyBhcmVhXG4gICAgICAgICAgICAgICAgIDUxICsgLy8gbWluaW11bSBoZWlnaHQgb2YgdGhlIG1lc3NhZ2UgY29tcG1vc2VyXG4gICAgICAgICAgICAgICAgIDEyMCk7IC8vIGFtb3VudCBvZiBkZXNpcmVkIHNjcm9sbGJhY2tcblxuICAgICAgICAvLyBYWFg6IHRoaXMgaXMgYSBiaXQgb2YgYSBoYWNrIGFuZCBtaWdodCBwb3NzaWJseSBjYXVzZSB0aGUgdmlkZW8gdG8gcHVzaCBvdXQgdGhlIHBhZ2UgYW55d2F5XG4gICAgICAgIC8vIGJ1dCBpdCdzIGJldHRlciB0aGFuIHRoZSB2aWRlbyBnb2luZyBtaXNzaW5nIGVudGlyZWx5XG4gICAgICAgIGlmIChhdXhQYW5lbE1heEhlaWdodCA8IDUwKSBhdXhQYW5lbE1heEhlaWdodCA9IDUwO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2F1eFBhbmVsTWF4SGVpZ2h0OiBhdXhQYW5lbE1heEhlaWdodH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRnVsbHNjcmVlbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlkZW9fZnVsbHNjcmVlbicsXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiB0cnVlLFxuICAgICAgICB9LCB0cnVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk11dGVBdWRpb0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5nZXRDYWxsRm9yUm9vbSgpO1xuICAgICAgICBpZiAoIWNhbGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9ICFjYWxsLmlzTWljcm9waG9uZU11dGVkKCk7XG4gICAgICAgIGNhbGwuc2V0TWljcm9waG9uZU11dGVkKG5ld1N0YXRlKTtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyBUT0RPOiBqdXN0IHVwZGF0ZSB0aGUgdm9pcCBidXR0b25zXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NdXRlVmlkZW9DbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuZ2V0Q2FsbEZvclJvb20oKTtcbiAgICAgICAgaWYgKCFjYWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3U3RhdGUgPSAhY2FsbC5pc0xvY2FsVmlkZW9NdXRlZCgpO1xuICAgICAgICBjYWxsLnNldExvY2FsVmlkZW9NdXRlZChuZXdTdGF0ZSk7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gVE9ETzoganVzdCB1cGRhdGUgdGhlIHZvaXAgYnV0dG9uc1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3RhdHVzQmFyVmlzaWJsZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc3RhdHVzQmFyVmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TdGF0dXNCYXJIaWRkZW4gPSAoKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgaXMgY3VycmVudGx5IG5vdCBkZXNpcmVkIGFzIGl0IGlzIGFubm95aW5nIGlmIGl0IGtlZXBzIGV4cGFuZGluZyBhbmQgY29sbGFwc2luZ1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzdGF0dXNCYXJWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGNhbGxlZCBieSB0aGUgcGFyZW50IGNvbXBvbmVudCB3aGVuIFBhZ2VVcC9Eb3duL2V0YyBpcyBwcmVzc2VkLlxuICAgICAqXG4gICAgICogV2UgcGFzcyBpdCBkb3duIHRvIHRoZSBzY3JvbGwgcGFuZWwuXG4gICAgICovXG4gICAgcHJpdmF0ZSBoYW5kbGVTY3JvbGxLZXkgPSBldiA9PiB7XG4gICAgICAgIGxldCBwYW5lbDtcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoUmVzdWx0c1BhbmVsLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHBhbmVsID0gdGhpcy5zZWFyY2hSZXN1bHRzUGFuZWwuY3VycmVudDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1lc3NhZ2VQYW5lbCkge1xuICAgICAgICAgICAgcGFuZWwgPSB0aGlzLm1lc3NhZ2VQYW5lbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYW5lbCkge1xuICAgICAgICAgICAgcGFuZWwuaGFuZGxlU2Nyb2xsS2V5KGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBnZXQgYW55IGN1cnJlbnQgY2FsbCBmb3IgdGhpcyByb29tXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRDYWxsRm9yUm9vbSgpOiBNYXRyaXhDYWxsIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJvb20pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLmdldENhbGxGb3JSb29tKHRoaXMuc3RhdGUucm9vbS5yb29tSWQpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgaGFzIHRvIGJlIGEgcHJvcGVyIG1ldGhvZCByYXRoZXIgdGhhbiBhbiB1bm5hbWVkIGZ1bmN0aW9uLFxuICAgIC8vIG90aGVyd2lzZSByZWFjdCBjYWxscyBpdCB3aXRoIG51bGwgb24gZWFjaCB1cGRhdGUuXG4gICAgcHJpdmF0ZSBnYXRoZXJUaW1lbGluZVBhbmVsUmVmID0gciA9PiB7XG4gICAgICAgIHRoaXMubWVzc2FnZVBhbmVsID0gcjtcbiAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidXBkYXRlVGludCBmcm9tIFJvb21WaWV3LmdhdGhlclRpbWVsaW5lUGFuZWxSZWZcIik7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRpbnQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdldE9sZFJvb20oKSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5zdGF0ZS5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5jcmVhdGVcIiwgXCJcIik7XG4gICAgICAgIGlmICghY3JlYXRlRXZlbnQgfHwgIWNyZWF0ZUV2ZW50LmdldENvbnRlbnQoKVsncHJlZGVjZXNzb3InXSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5nZXRSb29tKGNyZWF0ZUV2ZW50LmdldENvbnRlbnQoKVsncHJlZGVjZXNzb3InXVsncm9vbV9pZCddKTtcbiAgICB9XG5cbiAgICBnZXRIaWRkZW5IaWdobGlnaHRDb3VudCgpIHtcbiAgICAgICAgY29uc3Qgb2xkUm9vbSA9IHRoaXMuZ2V0T2xkUm9vbSgpO1xuICAgICAgICBpZiAoIW9sZFJvb20pIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gb2xkUm9vbS5nZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCgnaGlnaGxpZ2h0Jyk7XG4gICAgfVxuXG4gICAgb25IaWRkZW5IaWdobGlnaHRzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG9sZFJvb20gPSB0aGlzLmdldE9sZFJvb20oKTtcbiAgICAgICAgaWYgKCFvbGRSb29tKSByZXR1cm47XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBcInZpZXdfcm9vbVwiLCByb29tX2lkOiBvbGRSb29tLnJvb21JZH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yb29tKSB7XG4gICAgICAgICAgICBjb25zdCBsb2FkaW5nID0gIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50SXNSZWFkeSB8fCB0aGlzLnN0YXRlLnJvb21Mb2FkaW5nIHx8IHRoaXMuc3RhdGUucGVla0xvYWRpbmc7XG4gICAgICAgICAgICBpZiAobG9hZGluZykge1xuICAgICAgICAgICAgICAgIC8vIEFzc3VtZSBwcmV2aWV3IGxvYWRpbmcgaWYgd2UgZG9uJ3QgaGF2ZSBhIHJlYWR5IGNsaWVudCBvciBhIHJvb20gSUQgKHN0aWxsIHJlc29sdmluZyB0aGUgYWxpYXMpXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlld0xvYWRpbmcgPSAhdGhpcy5zdGF0ZS5tYXRyaXhDbGllbnRJc1JlYWR5IHx8ICF0aGlzLnN0YXRlLnJvb21JZCB8fCB0aGlzLnN0YXRlLnBlZWtMb2FkaW5nO1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tUHJldmlld0JhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5QcmV2aWV3PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlld0xvYWRpbmc9e3ByZXZpZXdMb2FkaW5nICYmICF0aGlzLnN0YXRlLnJvb21Mb2FkRXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yPXt0aGlzLnN0YXRlLnJvb21Mb2FkRXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpvaW5pbmc9e3RoaXMuc3RhdGUuam9pbmluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29iRGF0YT17dGhpcy5wcm9wcy5vb2JEYXRhfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBpbnZpdGVyTmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vb2JEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGludml0ZXJOYW1lID0gdGhpcy5wcm9wcy5vb2JEYXRhLmludml0ZXJOYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBpbnZpdGVkRW1haWwgPSB0aGlzLnByb3BzLnRocmVlcGlkSW52aXRlPy50b0VtYWlsO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBubyByb29tIG9iamVjdCBmb3IgdGhpcyByb29tLCBvbmx5IHRoZSBJRC5cbiAgICAgICAgICAgICAgICAvLyBXZSd2ZSBnb3QgdG8gdGhpcyByb29tIGJ5IGZvbGxvd2luZyBhIGxpbmssIHBvc3NpYmx5IGEgdGhpcmQgcGFydHkgaW52aXRlLlxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21BbGlhcyA9IHRoaXMuc3RhdGUucm9vbUFsaWFzO1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tUHJldmlld0JhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkpvaW5DbGljaz17dGhpcy5vbkpvaW5CdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvcmdldENsaWNrPXt0aGlzLm9uRm9yZ2V0Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0Q2xpY2s9e3RoaXMub25SZWplY3RUaHJlZXBpZEludml0ZUJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhblByZXZpZXc9e2ZhbHNlfSBlcnJvcj17dGhpcy5zdGF0ZS5yb29tTG9hZEVycm9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tQWxpYXM9e3Jvb21BbGlhc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgam9pbmluZz17dGhpcy5zdGF0ZS5qb2luaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZpdGVyTmFtZT17aW52aXRlck5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludml0ZWRFbWFpbD17aW52aXRlZEVtYWlsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvb2JEYXRhPXt0aGlzLnByb3BzLm9vYkRhdGF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25Vcmw9e3RoaXMucHJvcHMudGhyZWVwaWRJbnZpdGU/LnNpZ25Vcmx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMuc3RhdGUucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbXlNZW1iZXJzaGlwID0gdGhpcy5zdGF0ZS5yb29tLmdldE15TWVtYmVyc2hpcCgpO1xuICAgICAgICBpZiAobXlNZW1iZXJzaGlwID09ICdpbnZpdGUnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5qb2luaW5nIHx8IHRoaXMuc3RhdGUucmVqZWN0aW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbVByZXZpZXdCYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5QcmV2aWV3PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcj17dGhpcy5zdGF0ZS5yb29tTG9hZEVycm9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpvaW5pbmc9e3RoaXMuc3RhdGUuam9pbmluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3Rpbmc9e3RoaXMuc3RhdGUucmVqZWN0aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG15VXNlcklkID0gdGhpcy5jb250ZXh0LmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgICAgICAgICBjb25zdCBteU1lbWJlciA9IHRoaXMuc3RhdGUucm9vbS5nZXRNZW1iZXIobXlVc2VySWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZUV2ZW50ID0gbXlNZW1iZXIgPyBteU1lbWJlci5ldmVudHMubWVtYmVyIDogbnVsbDtcbiAgICAgICAgICAgICAgICBsZXQgaW52aXRlck5hbWUgPSBfdChcIlVua25vd25cIik7XG4gICAgICAgICAgICAgICAgaWYgKGludml0ZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGludml0ZXJOYW1lID0gaW52aXRlRXZlbnQuc2VuZGVyID8gaW52aXRlRXZlbnQuc2VuZGVyLm5hbWUgOiBpbnZpdGVFdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBkZWxpYmVyYXRlbHkgZG9uJ3QgdHJ5IHRvIHBlZWsgaW50byBpbnZpdGVzLCBldmVuIGlmIHdlIGhhdmUgcGVybWlzc2lvbiB0byBwZWVrXG4gICAgICAgICAgICAgICAgLy8gYXMgdGhleSBjb3VsZCBiZSBhIHNwYW0gdmVjdG9yLlxuICAgICAgICAgICAgICAgIC8vIFhYWDogaW4gZnV0dXJlIHdlIGNvdWxkIGdpdmUgdGhlIG9wdGlvbiBvZiBhICdQcmV2aWV3JyBidXR0b24gd2hpY2ggbGV0cyB0aGVtIHZpZXcgYW55d2F5LlxuXG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHJlZ3VsYXIgaW52aXRlIGZvciB0aGlzIHJvb20uXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21QcmV2aWV3QmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSm9pbkNsaWNrPXt0aGlzLm9uSm9pbkJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9yZ2V0Q2xpY2s9e3RoaXMub25Gb3JnZXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25SZWplY3RDbGljaz17dGhpcy5vblJlamVjdEJ1dHRvbkNsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0QW5kSWdub3JlQ2xpY2s9e3RoaXMub25SZWplY3RBbmRJZ25vcmVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52aXRlck5hbWU9e2ludml0ZXJOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5QcmV2aWV3PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgam9pbmluZz17dGhpcy5zdGF0ZS5qb2luaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGhhdmUgc3VjY2Vzc2Z1bGx5IGxvYWRlZCB0aGlzIHJvb20sIGFuZCBhcmUgbm90IHByZXZpZXdpbmcuXG4gICAgICAgIC8vIERpc3BsYXkgdGhlIFwibm9ybWFsXCIgcm9vbSB2aWV3LlxuXG4gICAgICAgIGxldCBhY3RpdmVDYWxsID0gbnVsbDtcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gTmV3IGJsb2NrIGJlY2F1c2UgdGhpcyB2YXJpYWJsZSBkb2Vzbid0IG5lZWQgdG8gaGFuZyBhcm91bmQgZm9yIHRoZSByZXN0IG9mIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuZ2V0Q2FsbEZvclJvb20oKTtcbiAgICAgICAgICAgIGlmIChjYWxsICYmICh0aGlzLnN0YXRlLmNhbGxTdGF0ZSAhPT0gJ2VuZGVkJyAmJiB0aGlzLnN0YXRlLmNhbGxTdGF0ZSAhPT0gJ3JpbmdpbmcnKSkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUNhbGwgPSBjYWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2Nyb2xsaGVhZGVyQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfUm9vbVZpZXdfc2Nyb2xsaGVhZGVyOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgc3RhdHVzQmFyO1xuICAgICAgICBsZXQgaXNTdGF0dXNBcmVhRXhwYW5kZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChDb250ZW50TWVzc2FnZXMuc2hhcmVkSW5zdGFuY2UoKS5nZXRDdXJyZW50VXBsb2FkcygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFVwbG9hZEJhciA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuVXBsb2FkQmFyJyk7XG4gICAgICAgICAgICBzdGF0dXNCYXIgPSA8VXBsb2FkQmFyIHJvb209e3RoaXMuc3RhdGUucm9vbX0gLz47XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cykge1xuICAgICAgICAgICAgY29uc3QgUm9vbVN0YXR1c0JhciA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuUm9vbVN0YXR1c0JhcicpO1xuICAgICAgICAgICAgaXNTdGF0dXNBcmVhRXhwYW5kZWQgPSB0aGlzLnN0YXRlLnN0YXR1c0JhclZpc2libGU7XG4gICAgICAgICAgICBzdGF0dXNCYXIgPSA8Um9vbVN0YXR1c0JhclxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMuc3RhdGUucm9vbX1cbiAgICAgICAgICAgICAgICBpc1BlZWtpbmc9e215TWVtYmVyc2hpcCAhPT0gXCJqb2luXCJ9XG4gICAgICAgICAgICAgICAgb25JbnZpdGVDbGljaz17dGhpcy5vbkludml0ZUJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgIG9uVmlzaWJsZT17dGhpcy5vblN0YXR1c0JhclZpc2libGV9XG4gICAgICAgICAgICAgICAgb25IaWRkZW49e3RoaXMub25TdGF0dXNCYXJIaWRkZW59XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb21WZXJzaW9uUmVjb21tZW5kYXRpb24gPSB0aGlzLnN0YXRlLnVwZ3JhZGVSZWNvbW1lbmRhdGlvbjtcbiAgICAgICAgY29uc3Qgc2hvd1Jvb21VcGdyYWRlQmFyID0gKFxuICAgICAgICAgICAgcm9vbVZlcnNpb25SZWNvbW1lbmRhdGlvbiAmJlxuICAgICAgICAgICAgcm9vbVZlcnNpb25SZWNvbW1lbmRhdGlvbi5uZWVkc1VwZ3JhZGUgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucm9vbS51c2VyTWF5VXBncmFkZVJvb20odGhpcy5jb250ZXh0LmNyZWRlbnRpYWxzLnVzZXJJZClcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBoaWRkZW5IaWdobGlnaHRDb3VudCA9IHRoaXMuZ2V0SGlkZGVuSGlnaGxpZ2h0Q291bnQoKTtcblxuICAgICAgICBsZXQgYXV4ID0gbnVsbDtcbiAgICAgICAgbGV0IHByZXZpZXdCYXI7XG4gICAgICAgIGxldCBoaWRlQ2FuY2VsID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZvcndhcmRpbmdFdmVudCkge1xuICAgICAgICAgICAgYXV4ID0gPEZvcndhcmRNZXNzYWdlIG9uQ2FuY2VsQ2xpY2s9e3RoaXMub25DYW5jZWxDbGlja30gLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZWFyY2hpbmcpIHtcbiAgICAgICAgICAgIGhpZGVDYW5jZWwgPSB0cnVlOyAvLyBoYXMgb3duIGNhbmNlbFxuICAgICAgICAgICAgYXV4ID0gPFNlYXJjaEJhclxuICAgICAgICAgICAgICAgIHNlYXJjaEluUHJvZ3Jlc3M9e3RoaXMuc3RhdGUuc2VhcmNoSW5Qcm9ncmVzc31cbiAgICAgICAgICAgICAgICBvbkNhbmNlbENsaWNrPXt0aGlzLm9uQ2FuY2VsU2VhcmNoQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25TZWFyY2g9e3RoaXMub25TZWFyY2h9XG4gICAgICAgICAgICAgICAgaXNSb29tRW5jcnlwdGVkPXt0aGlzLmNvbnRleHQuaXNSb29tRW5jcnlwdGVkKHRoaXMuc3RhdGUucm9vbS5yb29tSWQpfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0gZWxzZSBpZiAoc2hvd1Jvb21VcGdyYWRlQmFyKSB7XG4gICAgICAgICAgICBhdXggPSA8Um9vbVVwZ3JhZGVXYXJuaW5nQmFyIHJvb209e3RoaXMuc3RhdGUucm9vbX0gcmVjb21tZW5kYXRpb249e3Jvb21WZXJzaW9uUmVjb21tZW5kYXRpb259IC8+O1xuICAgICAgICAgICAgaGlkZUNhbmNlbCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zaG93aW5nUGlubmVkKSB7XG4gICAgICAgICAgICBoaWRlQ2FuY2VsID0gdHJ1ZTsgLy8gaGFzIG93biBjYW5jZWxcbiAgICAgICAgICAgIGF1eCA9IDxQaW5uZWRFdmVudHNQYW5lbCByb29tPXt0aGlzLnN0YXRlLnJvb219IG9uQ2FuY2VsQ2xpY2s9e3RoaXMub25QaW5uZWRDbGlja30gLz47XG4gICAgICAgIH0gZWxzZSBpZiAobXlNZW1iZXJzaGlwICE9PSBcImpvaW5cIikge1xuICAgICAgICAgICAgLy8gV2UgZG8gaGF2ZSBhIHJvb20gb2JqZWN0IGZvciB0aGlzIHJvb20sIGJ1dCB3ZSdyZSBub3QgY3VycmVudGx5IGluIGl0LlxuICAgICAgICAgICAgLy8gV2UgbWF5IGhhdmUgYSAzcmQgcGFydHkgaW52aXRlIHRvIGl0LlxuICAgICAgICAgICAgbGV0IGludml0ZXJOYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub29iRGF0YSkge1xuICAgICAgICAgICAgICAgIGludml0ZXJOYW1lID0gdGhpcy5wcm9wcy5vb2JEYXRhLmludml0ZXJOYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaW52aXRlZEVtYWlsID0gdGhpcy5wcm9wcy50aHJlZXBpZEludml0ZT8udG9FbWFpbDtcbiAgICAgICAgICAgIGhpZGVDYW5jZWwgPSB0cnVlO1xuICAgICAgICAgICAgcHJldmlld0JhciA9IChcbiAgICAgICAgICAgICAgICA8Um9vbVByZXZpZXdCYXJcbiAgICAgICAgICAgICAgICAgICAgb25Kb2luQ2xpY2s9e3RoaXMub25Kb2luQnV0dG9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgb25Gb3JnZXRDbGljaz17dGhpcy5vbkZvcmdldENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvblJlamVjdENsaWNrPXt0aGlzLm9uUmVqZWN0VGhyZWVwaWRJbnZpdGVCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICAgICAgICBqb2luaW5nPXt0aGlzLnN0YXRlLmpvaW5pbmd9XG4gICAgICAgICAgICAgICAgICAgIGludml0ZXJOYW1lPXtpbnZpdGVyTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgaW52aXRlZEVtYWlsPXtpbnZpdGVkRW1haWx9XG4gICAgICAgICAgICAgICAgICAgIG9vYkRhdGE9e3RoaXMucHJvcHMub29iRGF0YX1cbiAgICAgICAgICAgICAgICAgICAgY2FuUHJldmlldz17dGhpcy5zdGF0ZS5jYW5QZWVrfVxuICAgICAgICAgICAgICAgICAgICByb29tPXt0aGlzLnN0YXRlLnJvb219XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY2FuUGVlaykge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgcHJldmlld0JhciB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaGlkZGVuSGlnaGxpZ2h0Q291bnQgPiAwKSB7XG4gICAgICAgICAgICBhdXggPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cImRpdlwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X2F1eFBhbmVsX2hpZGRlbkhpZ2hsaWdodHNcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSGlkZGVuSGlnaGxpZ2h0c0NsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJZb3UgaGF2ZSAlKGNvdW50KXMgdW5yZWFkIG5vdGlmaWNhdGlvbnMgaW4gYSBwcmlvciB2ZXJzaW9uIG9mIHRoaXMgcm9vbS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb3VudDogaGlkZGVuSGlnaGxpZ2h0Q291bnR9LFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdXhQYW5lbCA9IChcbiAgICAgICAgICAgIDxBdXhQYW5lbFxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMuc3RhdGUucm9vbX1cbiAgICAgICAgICAgICAgICBmdWxsSGVpZ2h0PXtmYWxzZX1cbiAgICAgICAgICAgICAgICB1c2VySWQ9e3RoaXMuY29udGV4dC5jcmVkZW50aWFscy51c2VySWR9XG4gICAgICAgICAgICAgICAgZHJhZ2dpbmdGaWxlPXt0aGlzLnN0YXRlLmRyYWdnaW5nRmlsZX1cbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ9e3RoaXMuc3RhdGUuYXV4UGFuZWxNYXhIZWlnaHR9XG4gICAgICAgICAgICAgICAgc2hvd0FwcHM9e3RoaXMuc3RhdGUuc2hvd0FwcHN9XG4gICAgICAgICAgICAgICAgb25SZXNpemU9e3RoaXMub25SZXNpemV9XG4gICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBhdXggfVxuICAgICAgICAgICAgPC9BdXhQYW5lbD5cbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgbWVzc2FnZUNvbXBvc2VyOyBsZXQgc2VhcmNoSW5mbztcbiAgICAgICAgY29uc3QgY2FuU3BlYWsgPSAoXG4gICAgICAgICAgICAvLyBqb2luZWQgYW5kIG5vdCBzaG93aW5nIHNlYXJjaCByZXN1bHRzXG4gICAgICAgICAgICBteU1lbWJlcnNoaXAgPT09ICdqb2luJyAmJiAhdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzXG4gICAgICAgICk7XG4gICAgICAgIGlmIChjYW5TcGVhaykge1xuICAgICAgICAgICAgY29uc3QgTWVzc2FnZUNvbXBvc2VyID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuTWVzc2FnZUNvbXBvc2VyJyk7XG4gICAgICAgICAgICBtZXNzYWdlQ29tcG9zZXIgPVxuICAgICAgICAgICAgICAgIDxNZXNzYWdlQ29tcG9zZXJcbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgICAgICBjYWxsU3RhdGU9e3RoaXMuc3RhdGUuY2FsbFN0YXRlfVxuICAgICAgICAgICAgICAgICAgICBzaG93QXBwcz17dGhpcy5zdGF0ZS5zaG93QXBwc31cbiAgICAgICAgICAgICAgICAgICAgZTJlU3RhdHVzPXt0aGlzLnN0YXRlLmUyZVN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5zdGF0ZS5yZXBseVRvRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3RoaXMuZ2V0UGVybWFsaW5rQ3JlYXRvckZvclJvb20odGhpcy5zdGF0ZS5yb29tKX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IFdoeSBhcmVuJ3Qgd2Ugc3RvcmluZyB0aGUgdGVybS9zY29wZS9jb3VudCBpbiB0aGlzIGZvcm1hdFxuICAgICAgICAvLyBpbiB0aGlzLnN0YXRlIGlmIHRoaXMgaXMgd2hhdCBSb29tSGVhZGVyIGRlc2lyZXM/XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMpIHtcbiAgICAgICAgICAgIHNlYXJjaEluZm8gPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoVGVybTogdGhpcy5zdGF0ZS5zZWFyY2hUZXJtLFxuICAgICAgICAgICAgICAgIHNlYXJjaFNjb3BlOiB0aGlzLnN0YXRlLnNlYXJjaFNjb3BlLFxuICAgICAgICAgICAgICAgIHNlYXJjaENvdW50OiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMuY291bnQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBzZWFyY2ggcmVzdWx0cywgd2Uga2VlcCB0aGUgbWVzc2FnZXBhbmVsIChzbyB0aGF0IGl0IHByZXNlcnZlcyBpdHNcbiAgICAgICAgLy8gc2Nyb2xsIHN0YXRlKSwgYnV0IGhpZGUgaXQuXG4gICAgICAgIGxldCBzZWFyY2hSZXN1bHRzUGFuZWw7XG4gICAgICAgIGxldCBoaWRlTWVzc2FnZVBhbmVsID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cykge1xuICAgICAgICAgICAgLy8gc2hvdyBzZWFyY2hpbmcgc3Bpbm5lclxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5jb3VudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0c1BhbmVsID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbCBteF9Sb29tVmlld19tZXNzYWdlUGFuZWxTZWFyY2hTcGlubmVyXCIgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRzUGFuZWwgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxTY3JvbGxQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnNlYXJjaFJlc3VsdHNQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbCBteF9Sb29tVmlld19zZWFyY2hSZXN1bHRzUGFuZWwgbXhfR3JvdXBMYXlvdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25GaWxsUmVxdWVzdD17dGhpcy5vblNlYXJjaFJlc3VsdHNGaWxsUmVxdWVzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtzY3JvbGxoZWFkZXJDbGFzc2VzfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmdldFNlYXJjaFJlc3VsdFRpbGVzKCkgfVxuICAgICAgICAgICAgICAgICAgICA8L1Njcm9sbFBhbmVsPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoaWRlTWVzc2FnZVBhbmVsID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNob3VsZEhpZ2hsaWdodCA9IHRoaXMuc3RhdGUuaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZDtcbiAgICAgICAgbGV0IGhpZ2hsaWdodGVkRXZlbnRJZCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmZvcndhcmRpbmdFdmVudCkge1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRFdmVudElkID0gdGhpcy5zdGF0ZS5mb3J3YXJkaW5nRXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChzaG91bGRIaWdobGlnaHQpIHtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZCA9IHRoaXMuc3RhdGUuaW5pdGlhbEV2ZW50SWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZXNzYWdlUGFuZWxDbGFzc05hbWVzID0gY2xhc3NOYW1lcyhcbiAgICAgICAgICAgIFwibXhfUm9vbVZpZXdfbWVzc2FnZVBhbmVsXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJteF9JUkNMYXlvdXRcIjogdGhpcy5zdGF0ZS51c2VJUkNMYXlvdXQsXG4gICAgICAgICAgICAgICAgXCJteF9Hcm91cExheW91dFwiOiAhdGhpcy5zdGF0ZS51c2VJUkNMYXlvdXQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBjb25zb2xlLmluZm8oXCJTaG93VXJsUHJldmlldyBmb3IgJXMgaXMgJXNcIiwgdGhpcy5zdGF0ZS5yb29tLnJvb21JZCwgdGhpcy5zdGF0ZS5zaG93VXJsUHJldmlldyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VQYW5lbCA9IChcbiAgICAgICAgICAgIDxUaW1lbGluZVBhbmVsXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLmdhdGhlclRpbWVsaW5lUGFuZWxSZWZ9XG4gICAgICAgICAgICAgICAgdGltZWxpbmVTZXQ9e3RoaXMuc3RhdGUucm9vbS5nZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQoKX1cbiAgICAgICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzPXt0aGlzLnN0YXRlLnNob3dSZWFkUmVjZWlwdHN9XG4gICAgICAgICAgICAgICAgbWFuYWdlUmVhZFJlY2VpcHRzPXshdGhpcy5zdGF0ZS5pc1BlZWtpbmd9XG4gICAgICAgICAgICAgICAgbWFuYWdlUmVhZE1hcmtlcnM9eyF0aGlzLnN0YXRlLmlzUGVla2luZ31cbiAgICAgICAgICAgICAgICBoaWRkZW49e2hpZGVNZXNzYWdlUGFuZWx9XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0ZWRFdmVudElkPXtoaWdobGlnaHRlZEV2ZW50SWR9XG4gICAgICAgICAgICAgICAgZXZlbnRJZD17dGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRJZH1cbiAgICAgICAgICAgICAgICBldmVudFBpeGVsT2Zmc2V0PXt0aGlzLnN0YXRlLmluaXRpYWxFdmVudFBpeGVsT2Zmc2V0fVxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uTWVzc2FnZUxpc3RTY3JvbGx9XG4gICAgICAgICAgICAgICAgb25SZWFkTWFya2VyVXBkYXRlZD17dGhpcy51cGRhdGVUb3BVbnJlYWRNZXNzYWdlc0Jhcn1cbiAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldyA9IHt0aGlzLnN0YXRlLnNob3dVcmxQcmV2aWV3fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWVzc2FnZVBhbmVsQ2xhc3NOYW1lc31cbiAgICAgICAgICAgICAgICBtZW1iZXJzTG9hZGVkPXt0aGlzLnN0YXRlLm1lbWJlcnNMb2FkZWR9XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5nZXRQZXJtYWxpbmtDcmVhdG9yRm9yUm9vbSh0aGlzLnN0YXRlLnJvb20pfVxuICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgIHNob3dSZWFjdGlvbnM9e3RydWV9XG4gICAgICAgICAgICAgICAgdXNlSVJDTGF5b3V0PXt0aGlzLnN0YXRlLnVzZUlSQ0xheW91dH1cbiAgICAgICAgICAgIC8+KTtcblxuICAgICAgICBsZXQgdG9wVW5yZWFkTWVzc2FnZXNCYXIgPSBudWxsO1xuICAgICAgICAvLyBEbyBub3Qgc2hvdyBUb3BVbnJlYWRNZXNzYWdlc0JhciBpZiB3ZSBoYXZlIHNlYXJjaCByZXN1bHRzIHNob3dpbmcsIGl0IG1ha2VzIG5vIHNlbnNlXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dUb3BVbnJlYWRNZXNzYWdlc0JhciAmJiAhdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzKSB7XG4gICAgICAgICAgICBjb25zdCBUb3BVbnJlYWRNZXNzYWdlc0JhciA9IHNkay5nZXRDb21wb25lbnQoJ3Jvb21zLlRvcFVucmVhZE1lc3NhZ2VzQmFyJyk7XG4gICAgICAgICAgICB0b3BVbnJlYWRNZXNzYWdlc0JhciA9IChcbiAgICAgICAgICAgICAgICA8VG9wVW5yZWFkTWVzc2FnZXNCYXIgb25TY3JvbGxVcENsaWNrPXt0aGlzLmp1bXBUb1JlYWRNYXJrZXJ9IG9uQ2xvc2VDbGljaz17dGhpcy5mb3JnZXRSZWFkTWFya2VyfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQganVtcFRvQm90dG9tO1xuICAgICAgICAvLyBEbyBub3Qgc2hvdyBKdW1wVG9Cb3R0b21CdXR0b24gaWYgd2UgaGF2ZSBzZWFyY2ggcmVzdWx0cyBzaG93aW5nLCBpdCBtYWtlcyBubyBzZW5zZVxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYXRFbmRPZkxpdmVUaW1lbGluZSAmJiAhdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzKSB7XG4gICAgICAgICAgICBjb25zdCBKdW1wVG9Cb3R0b21CdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5KdW1wVG9Cb3R0b21CdXR0b24nKTtcbiAgICAgICAgICAgIGp1bXBUb0JvdHRvbSA9ICg8SnVtcFRvQm90dG9tQnV0dG9uXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0PXt0aGlzLnN0YXRlLnJvb20uZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQoJ2hpZ2hsaWdodCcpID4gMH1cbiAgICAgICAgICAgICAgICBudW1VbnJlYWRNZXNzYWdlcz17dGhpcy5zdGF0ZS5udW1VbnJlYWRNZXNzYWdlc31cbiAgICAgICAgICAgICAgICBvblNjcm9sbFRvQm90dG9tQ2xpY2s9e3RoaXMuanVtcFRvTGl2ZVRpbWVsaW5lfVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdHVzQmFyQXJlYUNsYXNzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21WaWV3X3N0YXR1c0FyZWFcIiwge1xuICAgICAgICAgICAgXCJteF9Sb29tVmlld19zdGF0dXNBcmVhX2V4cGFuZGVkXCI6IGlzU3RhdHVzQXJlYUV4cGFuZGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzaG93UmlnaHRQYW5lbCA9IHRoaXMuc3RhdGUucm9vbSAmJiB0aGlzLnN0YXRlLnNob3dSaWdodFBhbmVsO1xuICAgICAgICBjb25zdCByaWdodFBhbmVsID0gc2hvd1JpZ2h0UGFuZWxcbiAgICAgICAgICAgID8gPFJpZ2h0UGFuZWwgcm9vbT17dGhpcy5zdGF0ZS5yb29tfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0gLz5cbiAgICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICBjb25zdCB0aW1lbGluZUNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfUm9vbVZpZXdfdGltZWxpbmVcIiwge1xuICAgICAgICAgICAgbXhfUm9vbVZpZXdfdGltZWxpbmVfcnJfZW5hYmxlZDogdGhpcy5zdGF0ZS5zaG93UmVhZFJlY2VpcHRzLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBtYWluQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9Sb29tVmlld1wiLCB7XG4gICAgICAgICAgICBteF9Sb29tVmlld19pbkNhbGw6IEJvb2xlYW4oYWN0aXZlQ2FsbCksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNob3dDaGF0RWZmZWN0cyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3Nob3dDaGF0RWZmZWN0cycpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Um9vbUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3RoaXMuc3RhdGV9PlxuICAgICAgICAgICAgICAgIDxtYWluIGNsYXNzTmFtZT17bWFpbkNsYXNzZXN9IHJlZj17dGhpcy5yb29tVmlld30gb25LZXlEb3duPXt0aGlzLm9uUmVhY3RLZXlEb3dufT5cbiAgICAgICAgICAgICAgICAgICAge3Nob3dDaGF0RWZmZWN0cyAmJiB0aGlzLnJvb21WaWV3LmN1cnJlbnQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIDxFZmZlY3RzT3ZlcmxheSByb29tV2lkdGg9e3RoaXMucm9vbVZpZXcuY3VycmVudC5vZmZzZXRXaWR0aH0gLz5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8RXJyb3JCb3VuZGFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tSGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5yb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEluZm89e3NlYXJjaEluZm99XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb29iRGF0YT17dGhpcy5wcm9wcy5vb2JEYXRhfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUm9vbT17bXlNZW1iZXJzaGlwID09PSAnam9pbid9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TZWFyY2hDbGljaz17dGhpcy5vblNlYXJjaENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2V0dGluZ3NDbGljaz17dGhpcy5vblNldHRpbmdzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25QaW5uZWRDbGljaz17dGhpcy5vblBpbm5lZENsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsQ2xpY2s9eyhhdXggJiYgIWhpZGVDYW5jZWwpID8gdGhpcy5vbkNhbmNlbENsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvcmdldENsaWNrPXsobXlNZW1iZXJzaGlwID09PSBcImxlYXZlXCIpID8gdGhpcy5vbkZvcmdldENsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkxlYXZlQ2xpY2s9eyhteU1lbWJlcnNoaXAgPT09IFwiam9pblwiKSA/IHRoaXMub25MZWF2ZUNsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlMmVTdGF0dXM9e3RoaXMuc3RhdGUuZTJlU3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQXBwc0NsaWNrPXt0aGlzLnN0YXRlLmhhc1Bpbm5lZFdpZGdldHMgPyB0aGlzLm9uQXBwc0NsaWNrIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBzU2hvd249e3RoaXMuc3RhdGUuc2hvd0FwcHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPE1haW5TcGxpdCBwYW5lbD17cmlnaHRQYW5lbH0gcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXV4UGFuZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXt0aW1lbGluZUNsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RvcFVucmVhZE1lc3NhZ2VzQmFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2p1bXBUb0JvdHRvbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHttZXNzYWdlUGFuZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2VhcmNoUmVzdWx0c1BhbmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0YXR1c0JhckFyZWFDbGFzc30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X3N0YXR1c0FyZWFCb3hcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X3N0YXR1c0FyZWFCb3hfbGluZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3N0YXR1c0Jhcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3ByZXZpZXdCYXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHttZXNzYWdlQ29tcG9zZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L01haW5TcGxpdD5cbiAgICAgICAgICAgICAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgICAgICAgICAgIDwvbWFpbj5cbiAgICAgICAgICAgIDwvUm9vbUNvbnRleHQuUHJvdmlkZXI+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19