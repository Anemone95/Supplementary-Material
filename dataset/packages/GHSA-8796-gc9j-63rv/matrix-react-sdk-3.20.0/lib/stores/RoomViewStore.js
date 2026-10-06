"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _utils = require("flux/utils");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../index"));

var _Modal = _interopRequireDefault(require("../Modal"));

var _languageHandler = require("../languageHandler");

var _RoomAliasCache = require("../RoomAliasCache");

var _promise = require("../utils/promise");

var _CountlyAnalytics = _interopRequireDefault(require("../CountlyAnalytics"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const NUM_JOIN_RETRY = 5;
const INITIAL_STATE = {
  // Whether we're joining the currently viewed room (see isJoining())
  joining: false,
  // Any error that has occurred during joining
  joinError: null,
  // The room ID of the room currently being viewed
  roomId: null,
  // The event to scroll to when the room is first viewed
  initialEventId: null,
  initialEventPixelOffset: null,
  // Whether to highlight the initial event
  isInitialEventHighlighted: false,
  // The room alias of the room (or null if not originally specified in view_room)
  roomAlias: null,
  // Whether the current room is loading
  roomLoading: false,
  // Any error that has occurred during loading
  roomLoadError: null,
  forwardingEvent: null,
  quotingEvent: null,
  replyingToEvent: null,
  shouldPeek: false,
  viaServers: [],
  wasContextSwitch: false
};
/**
 * A class for storing application state for RoomView. This is the RoomView's interface
*  with a subset of the js-sdk.
 *  ```
 */

class RoomViewStore extends _utils.Store
/*:: <ActionPayload>*/
{
  // initialize state
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "state", INITIAL_STATE);
  }

  setState(newState
  /*: Partial<typeof INITIAL_STATE>*/
  ) {
    // If values haven't changed, there's nothing to do.
    // This only tries a shallow comparison, so unchanged objects will slip
    // through, but that's probably okay for now.
    let stateChanged = false;

    for (const key of Object.keys(newState)) {
      if (this.state[key] !== newState[key]) {
        stateChanged = true;
        break;
      }
    }

    if (!stateChanged) {
      return;
    }

    this.state = Object.assign(this.state, newState);

    this.__emitChange();
  }

  __onDispatch(payload) {
    switch (payload.action) {
      // view_room:
      //      - room_alias:   '#somealias:matrix.org'
      //      - room_id:      '!roomid123:matrix.org'
      //      - event_id:     '$213456782:matrix.org'
      //      - event_offset: 100
      //      - highlighted:  true
      case 'view_room':
        this.viewRoom(payload);
        break;
      // for these events blank out the roomId as we are no longer in the RoomView

      case 'view_create_group':
      case 'view_welcome_page':
      case 'view_home_page':
      case 'view_my_groups':
      case 'view_group':
        this.setState({
          roomId: null,
          roomAlias: null,
          viaServers: [],
          wasContextSwitch: false
        });
        break;

      case 'view_room_error':
        this.viewRoomError(payload);
        break;

      case 'will_join':
        this.setState({
          joining: true
        });
        break;

      case 'cancel_join':
        this.setState({
          joining: false
        });
        break;
      // join_room:
      //      - opts: options for joinRoom

      case 'join_room':
        this.joinRoom(payload);
        break;

      case 'join_room_error':
        this.joinRoomError(payload);
        break;

      case 'join_room_ready':
        this.setState({
          shouldPeek: false
        });
        break;

      case 'on_client_not_viable':
      case 'on_logged_out':
        this.reset();
        break;

      case 'forward_event':
        this.setState({
          forwardingEvent: payload.event
        });
        break;

      case 'reply_to_event':
        // If currently viewed room does not match the room in which we wish to reply then change rooms
        // this can happen when performing a search across all rooms
        if (payload.event && payload.event.getRoomId() !== this.state.roomId) {
          _dispatcher.default.dispatch({
            action: 'view_room',
            room_id: payload.event.getRoomId(),
            replyingToEvent: payload.event
          });
        } else {
          this.setState({
            replyingToEvent: payload.event
          });
        }

        break;

      case 'open_room_settings':
        {
          const RoomSettingsDialog = sdk.getComponent("dialogs.RoomSettingsDialog");

          _Modal.default.createTrackedDialog('Room settings', '', RoomSettingsDialog, {
            roomId: payload.room_id || this.state.roomId
          },
          /*className=*/
          null,
          /*isPriority=*/
          false,
          /*isStatic=*/
          true);

          break;
        }
    }
  }

  async viewRoom(payload
  /*: ActionPayload*/
  ) {
    if (payload.room_id) {
      const newState = {
        roomId: payload.room_id,
        roomAlias: payload.room_alias,
        initialEventId: payload.event_id,
        isInitialEventHighlighted: payload.highlighted,
        forwardingEvent: null,
        roomLoading: false,
        roomLoadError: null,
        // should peek by default
        shouldPeek: payload.should_peek === undefined ? true : payload.should_peek,
        // have we sent a join request for this room and are waiting for a response?
        joining: payload.joining || false,
        // Reset replyingToEvent because we don't want cross-room because bad UX
        replyingToEvent: null,
        // pull the user out of Room Settings
        isEditingSettings: false,
        viaServers: payload.via_servers,
        wasContextSwitch: payload.context_switch
      }; // Allow being given an event to be replied to when switching rooms but sanity check its for this room

      if (payload.replyingToEvent && payload.replyingToEvent.getRoomId() === payload.room_id) {
        newState.replyingToEvent = payload.replyingToEvent;
      }

      if (this.state.forwardingEvent) {
        _dispatcher.default.dispatch({
          action: 'send_event',
          room_id: newState.roomId,
          event: this.state.forwardingEvent
        });
      }

      this.setState(newState);

      if (payload.auto_join) {
        this.joinRoom(payload);
      }
    } else if (payload.room_alias) {
      // Try the room alias to room ID navigation cache first to avoid
      // blocking room navigation on the homeserver.
      let roomId = (0, _RoomAliasCache.getCachedRoomIDForAlias)(payload.room_alias);

      if (!roomId) {
        // Room alias cache miss, so let's ask the homeserver. Resolve the alias
        // and then do a second dispatch with the room ID acquired.
        this.setState({
          roomId: null,
          initialEventId: null,
          initialEventPixelOffset: null,
          isInitialEventHighlighted: null,
          roomAlias: payload.room_alias,
          roomLoading: true,
          roomLoadError: null,
          viaServers: payload.via_servers,
          wasContextSwitch: payload.context_switch
        });

        try {
          const result = await _MatrixClientPeg.MatrixClientPeg.get().getRoomIdForAlias(payload.room_alias);
          (0, _RoomAliasCache.storeRoomAliasInCache)(payload.room_alias, result.room_id);
          roomId = result.room_id;
        } catch (err) {
          console.error("RVS failed to get room id for alias: ", err);

          _dispatcher.default.dispatch({
            action: 'view_room_error',
            room_id: null,
            room_alias: payload.room_alias,
            err
          });

          return;
        }
      }

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: roomId,
        event_id: payload.event_id,
        highlighted: payload.highlighted,
        room_alias: payload.room_alias,
        auto_join: payload.auto_join,
        oob_data: payload.oob_data,
        viaServers: payload.via_servers,
        wasContextSwitch: payload.context_switch
      });
    }
  }

  viewRoomError(payload
  /*: ActionPayload*/
  ) {
    this.setState({
      roomId: payload.room_id,
      roomAlias: payload.room_alias,
      roomLoading: false,
      roomLoadError: payload.err
    });
  }

  async joinRoom(payload
  /*: ActionPayload*/
  ) {
    const startTime = _CountlyAnalytics.default.getTimestamp();

    this.setState({
      joining: true
    });

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const address = this.state.roomAlias || this.state.roomId;
    const viaServers = this.state.viaServers || [];

    try {
      await (0, _promise.retry)(() => cli.joinRoom(address, _objectSpread({
        viaServers
      }, payload.opts)), NUM_JOIN_RETRY, err => {
        // if we received a Gateway timeout then retry
        return err.httpStatus === 504;
      });

      _CountlyAnalytics.default.instance.trackRoomJoin(startTime, this.state.roomId, payload._type); // We do *not* clear the 'joining' flag because the Room object and/or our 'joined' member event may not
      // have come down the sync stream yet, and that's the point at which we'd consider the user joined to the
      // room.


      _dispatcher.default.dispatch({
        action: 'join_room_ready'
      });
    } catch (err) {
      _dispatcher.default.dispatch({
        action: 'join_room_error',
        err: err
      });

      let msg = err.message ? err.message : JSON.stringify(err);
      console.log("Failed to join room:", msg);

      if (err.name === "ConnectionError") {
        msg = (0, _languageHandler._t)("There was an error joining the room");
      } else if (err.errcode === 'M_INCOMPATIBLE_ROOM_VERSION') {
        msg = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Sorry, your homeserver is too old to participate in this room."), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Please contact your homeserver administrator."));
      } else if (err.httpStatus === 404) {
        const invitingUserId = this.getInvitingUserId(this.state.roomId); // only provide a better error message for invites

        if (invitingUserId) {
          // if the inviting user is on the same HS, there can only be one cause: they left.
          if (invitingUserId.endsWith(`:${_MatrixClientPeg.MatrixClientPeg.get().getDomain()}`)) {
            msg = (0, _languageHandler._t)("The person who invited you already left the room.");
          } else {
            msg = (0, _languageHandler._t)("The person who invited you already left the room, or their server is offline.");
          }
        }
      }

      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

      _Modal.default.createTrackedDialog('Failed to join room', '', ErrorDialog, {
        title: (0, _languageHandler._t)("Failed to join room"),
        description: msg
      });
    }
  }

  getInvitingUserId(roomId
  /*: string*/
  )
  /*: string*/
  {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(roomId);

    if (room && room.getMyMembership() === "invite") {
      const myMember = room.getMember(cli.getUserId());
      const inviteEvent = myMember ? myMember.events.member : null;
      return inviteEvent && inviteEvent.getSender();
    }
  }

  joinRoomError(payload
  /*: ActionPayload*/
  ) {
    this.setState({
      joining: false,
      joinError: payload.err
    });
  }

  reset() {
    this.state = Object.assign({}, INITIAL_STATE);
  } // The room ID of the room currently being viewed


  getRoomId() {
    return this.state.roomId;
  } // The event to scroll to when the room is first viewed


  getInitialEventId() {
    return this.state.initialEventId;
  } // Whether to highlight the initial event


  isInitialEventHighlighted() {
    return this.state.isInitialEventHighlighted;
  } // The room alias of the room (or null if not originally specified in view_room)


  getRoomAlias() {
    return this.state.roomAlias;
  } // Whether the current room is loading (true whilst resolving an alias)


  isRoomLoading() {
    return this.state.roomLoading;
  } // Any error that has occurred during loading


  getRoomLoadError() {
    return this.state.roomLoadError;
  } // True if we're expecting the user to be joined to the room currently being
  // viewed. Note that this is left true after the join request has finished,
  // since we should still consider a join to be in progress until the room
  // & member events come down the sync.
  //
  // This flag remains true after the room has been sucessfully joined,
  // (this store doesn't listen for the appropriate member events)
  // so you should always observe the joined state from the member event
  // if a room object is present.
  // ie. The correct logic is:
  // if (room) {
  //     if (myMember.membership == 'joined') {
  //         // user is joined to the room
  //     } else {
  //         // Not joined
  //     }
  // } else {
  //     if (RoomViewStore.isJoining()) {
  //         // show spinner
  //     } else {
  //         // show join prompt
  //     }
  // }


  isJoining() {
    return this.state.joining;
  } // Any error that has occurred during joining


  getJoinError() {
    return this.state.joinError;
  } // The mxEvent if one is about to be forwarded


  getForwardingEvent() {
    return this.state.forwardingEvent;
  } // The mxEvent if one is currently being replied to/quoted


  getQuotingEvent() {
    return this.state.replyingToEvent;
  }

  shouldPeek() {
    return this.state.shouldPeek;
  }

  getWasContextSwitch() {
    return this.state.wasContextSwitch;
  }

}

let singletonRoomViewStore = null;

if (!singletonRoomViewStore) {
  singletonRoomViewStore = new RoomViewStore();
}

var _default = singletonRoomViewStore;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvUm9vbVZpZXdTdG9yZS50c3giXSwibmFtZXMiOlsiTlVNX0pPSU5fUkVUUlkiLCJJTklUSUFMX1NUQVRFIiwiam9pbmluZyIsImpvaW5FcnJvciIsInJvb21JZCIsImluaXRpYWxFdmVudElkIiwiaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQiLCJpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkIiwicm9vbUFsaWFzIiwicm9vbUxvYWRpbmciLCJyb29tTG9hZEVycm9yIiwiZm9yd2FyZGluZ0V2ZW50IiwicXVvdGluZ0V2ZW50IiwicmVwbHlpbmdUb0V2ZW50Iiwic2hvdWxkUGVlayIsInZpYVNlcnZlcnMiLCJ3YXNDb250ZXh0U3dpdGNoIiwiUm9vbVZpZXdTdG9yZSIsIlN0b3JlIiwiY29uc3RydWN0b3IiLCJkaXMiLCJzZXRTdGF0ZSIsIm5ld1N0YXRlIiwic3RhdGVDaGFuZ2VkIiwia2V5IiwiT2JqZWN0Iiwia2V5cyIsInN0YXRlIiwiYXNzaWduIiwiX19lbWl0Q2hhbmdlIiwiX19vbkRpc3BhdGNoIiwicGF5bG9hZCIsImFjdGlvbiIsInZpZXdSb29tIiwidmlld1Jvb21FcnJvciIsImpvaW5Sb29tIiwiam9pblJvb21FcnJvciIsInJlc2V0IiwiZXZlbnQiLCJnZXRSb29tSWQiLCJkaXNwYXRjaCIsInJvb21faWQiLCJSb29tU2V0dGluZ3NEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJyb29tX2FsaWFzIiwiZXZlbnRfaWQiLCJoaWdobGlnaHRlZCIsInNob3VsZF9wZWVrIiwidW5kZWZpbmVkIiwiaXNFZGl0aW5nU2V0dGluZ3MiLCJ2aWFfc2VydmVycyIsImNvbnRleHRfc3dpdGNoIiwiYXV0b19qb2luIiwicmVzdWx0IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0Um9vbUlkRm9yQWxpYXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJvb2JfZGF0YSIsInN0YXJ0VGltZSIsIkNvdW50bHlBbmFseXRpY3MiLCJnZXRUaW1lc3RhbXAiLCJjbGkiLCJhZGRyZXNzIiwib3B0cyIsImh0dHBTdGF0dXMiLCJpbnN0YW5jZSIsInRyYWNrUm9vbUpvaW4iLCJfdHlwZSIsIm1zZyIsIm1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwibG9nIiwibmFtZSIsImVycmNvZGUiLCJpbnZpdGluZ1VzZXJJZCIsImdldEludml0aW5nVXNlcklkIiwiZW5kc1dpdGgiLCJnZXREb21haW4iLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJyb29tIiwiZ2V0Um9vbSIsImdldE15TWVtYmVyc2hpcCIsIm15TWVtYmVyIiwiZ2V0TWVtYmVyIiwiZ2V0VXNlcklkIiwiaW52aXRlRXZlbnQiLCJldmVudHMiLCJtZW1iZXIiLCJnZXRTZW5kZXIiLCJnZXRJbml0aWFsRXZlbnRJZCIsImdldFJvb21BbGlhcyIsImlzUm9vbUxvYWRpbmciLCJnZXRSb29tTG9hZEVycm9yIiwiaXNKb2luaW5nIiwiZ2V0Sm9pbkVycm9yIiwiZ2V0Rm9yd2FyZGluZ0V2ZW50IiwiZ2V0UXVvdGluZ0V2ZW50IiwiZ2V0V2FzQ29udGV4dFN3aXRjaCIsInNpbmdsZXRvblJvb21WaWV3U3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLGNBQWMsR0FBRyxDQUF2QjtBQUVBLE1BQU1DLGFBQWEsR0FBRztBQUNsQjtBQUNBQyxFQUFBQSxPQUFPLEVBQUUsS0FGUztBQUdsQjtBQUNBQyxFQUFBQSxTQUFTLEVBQUUsSUFKTztBQUtsQjtBQUNBQyxFQUFBQSxNQUFNLEVBQUUsSUFOVTtBQVFsQjtBQUNBQyxFQUFBQSxjQUFjLEVBQUUsSUFURTtBQVVsQkMsRUFBQUEsdUJBQXVCLEVBQUUsSUFWUDtBQVdsQjtBQUNBQyxFQUFBQSx5QkFBeUIsRUFB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OztBQUNPNEYsRUFBQUEsU0FBUCxHQUFtQjtBQUNmLFdBQU8sS0FBSzNFLEtBQUwsQ0FBV3pCLE9BQWxCO0FBQ0gsR0FyVjRDLENBdVY3Qzs7O0FBQ09xRyxFQUFBQSxZQUFQLEdBQXNCO0FBQ2xCLFdBQU8sS0FBSzVFLEtBQUwsQ0FBV3hCLFNBQWxCO0FBQ0gsR0ExVjRDLENBNFY3Qzs7O0FBQ09xRyxFQUFBQSxrQkFBUCxHQUE0QjtBQUN4QixXQUFPLEtBQUs3RSxLQUFMLENBQVdoQixlQUFsQjtBQUNILEdBL1Y0QyxDQWlXN0M7OztBQUNPOEYsRUFBQUEsZUFBUCxHQUF5QjtBQUNyQixXQUFPLEtBQUs5RSxLQUFMLENBQVdkLGVBQWxCO0FBQ0g7O0FBRU1DLEVBQUFBLFVBQVAsR0FBb0I7QUFDaEIsV0FBTyxLQUFLYSxLQUFMLENBQVdiLFVBQWxCO0FBQ0g7O0FBRU00RixFQUFBQSxtQkFBUCxHQUE2QjtBQUN6QixXQUFPLEtBQUsvRSxLQUFMLENBQVdYLGdCQUFsQjtBQUNIOztBQTVXNEM7O0FBK1dqRCxJQUFJMkYsc0JBQXNCLEdBQUcsSUFBN0I7O0FBQ0EsSUFBSSxDQUFDQSxzQkFBTCxFQUE2QjtBQUN6QkEsRUFBQUEsc0JBQXNCLEdBQUcsSUFBSTFGLGFBQUosRUFBekI7QUFDSDs7ZUFDYzBGLHNCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1N0b3JlfSBmcm9tICdmbHV4L3V0aWxzJztcbmltcG9ydCB7TWF0cml4RXJyb3J9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9odHRwLWFwaVwiO1xuXG5pbXBvcnQgZGlzIGZyb20gJy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZ2V0Q2FjaGVkUm9vbUlERm9yQWxpYXMsIHN0b3JlUm9vbUFsaWFzSW5DYWNoZSB9IGZyb20gJy4uL1Jvb21BbGlhc0NhY2hlJztcbmltcG9ydCB7QWN0aW9uUGF5bG9hZH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7cmV0cnl9IGZyb20gXCIuLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vQ291bnRseUFuYWx5dGljc1wiO1xuXG5jb25zdCBOVU1fSk9JTl9SRVRSWSA9IDU7XG5cbmNvbnN0IElOSVRJQUxfU1RBVEUgPSB7XG4gICAgLy8gV2hldGhlciB3ZSdyZSBqb2luaW5nIHRoZSBjdXJyZW50bHkgdmlld2VkIHJvb20gKHNlZSBpc0pvaW5pbmcoKSlcbiAgICBqb2luaW5nOiBmYWxzZSxcbiAgICAvLyBBbnkgZXJyb3IgdGhhdCBoYXMgb2NjdXJyZWQgZHVyaW5nIGpvaW5pbmdcbiAgICBqb2luRXJyb3I6IG51bGwsXG4gICAgLy8gVGhlIHJvb20gSUQgb2YgdGhlIHJvb20gY3VycmVudGx5IGJlaW5nIHZpZXdlZFxuICAgIHJvb21JZDogbnVsbCxcblxuICAgIC8vIFRoZSBldmVudCB0byBzY3JvbGwgdG8gd2hlbiB0aGUgcm9vbSBpcyBmaXJzdCB2aWV3ZWRcbiAgICBpbml0aWFsRXZlbnRJZDogbnVsbCxcbiAgICBpbml0aWFsRXZlbnRQaXhlbE9mZnNldDogbnVsbCxcbiAgICAvLyBXaGV0aGVyIHRvIGhpZ2hsaWdodCB0aGUgaW5pdGlhbCBldmVudFxuICAgIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ6IGZhbHNlLFxuXG4gICAgLy8gVGhlIHJvb20gYWxpYXMgb2YgdGhlIHJvb20gKG9yIG51bGwgaWYgbm90IG9yaWdpbmFsbHkgc3BlY2lmaWVkIGluIHZpZXdfcm9vbSlcbiAgICByb29tQWxpYXM6IG51bGwsXG4gICAgLy8gV2hldGhlciB0aGUgY3VycmVudCByb29tIGlzIGxvYWRpbmdcbiAgICByb29tTG9hZGluZzogZmFsc2UsXG4gICAgLy8gQW55IGVycm9yIHRoYXQgaGFzIG9jY3VycmVkIGR1cmluZyBsb2FkaW5nXG4gICAgcm9vbUxvYWRFcnJvcjogbnVsbCxcblxuICAgIGZvcndhcmRpbmdFdmVudDogbnVsbCxcblxuICAgIHF1b3RpbmdFdmVudDogbnVsbCxcblxuICAgIHJlcGx5aW5nVG9FdmVudDogbnVsbCxcblxuICAgIHNob3VsZFBlZWs6IGZhbHNlLFxuXG4gICAgdmlhU2VydmVyczogW10sXG5cbiAgICB3YXNDb250ZXh0U3dpdGNoOiBmYWxzZSxcbn07XG5cbi8qKlxuICogQSBjbGFzcyBmb3Igc3RvcmluZyBhcHBsaWNhdGlvbiBzdGF0ZSBmb3IgUm9vbVZpZXcuIFRoaXMgaXMgdGhlIFJvb21WaWV3J3MgaW50ZXJmYWNlXG4qICB3aXRoIGEgc3Vic2V0IG9mIHRoZSBqcy1zZGsuXG4gKiAgYGBgXG4gKi9cbmNsYXNzIFJvb21WaWV3U3RvcmUgZXh0ZW5kcyBTdG9yZTxBY3Rpb25QYXlsb2FkPiB7XG4gICAgcHJpdmF0ZSBzdGF0ZSA9IElOSVRJQUxfU1RBVEU7IC8vIGluaXRpYWxpemUgc3RhdGVcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcihkaXMpO1xuICAgIH1cblxuICAgIHNldFN0YXRlKG5ld1N0YXRlOiBQYXJ0aWFsPHR5cGVvZiBJTklUSUFMX1NUQVRFPikge1xuICAgICAgICAvLyBJZiB2YWx1ZXMgaGF2ZW4ndCBjaGFuZ2VkLCB0aGVyZSdzIG5vdGhpbmcgdG8gZG8uXG4gICAgICAgIC8vIFRoaXMgb25seSB0cmllcyBhIHNoYWxsb3cgY29tcGFyaXNvbiwgc28gdW5jaGFuZ2VkIG9iamVjdHMgd2lsbCBzbGlwXG4gICAgICAgIC8vIHRocm91Z2gsIGJ1dCB0aGF0J3MgcHJvYmFibHkgb2theSBmb3Igbm93LlxuICAgICAgICBsZXQgc3RhdGVDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG5ld1N0YXRlKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGVba2V5XSAhPT0gbmV3U3RhdGVba2V5XSkge1xuICAgICAgICAgICAgICAgIHN0YXRlQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzdGF0ZUNoYW5nZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKTtcbiAgICAgICAgdGhpcy5fX2VtaXRDaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBfX29uRGlzcGF0Y2gocGF5bG9hZCkge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICAvLyB2aWV3X3Jvb206XG4gICAgICAgICAgICAvLyAgICAgIC0gcm9vbV9hbGlhczogICAnI3NvbWVhbGlhczptYXRyaXgub3JnJ1xuICAgICAgICAgICAgLy8gICAgICAtIHJvb21faWQ6ICAgICAgJyFyb29taWQxMjM6bWF0cml4Lm9yZydcbiAgICAgICAgICAgIC8vICAgICAgLSBldmVudF9pZDogICAgICckMjEzNDU2NzgyOm1hdHJpeC5vcmcnXG4gICAgICAgICAgICAvLyAgICAgIC0gZXZlbnRfb2Zmc2V0OiAxMDBcbiAgICAgICAgICAgIC8vICAgICAgLSBoaWdobGlnaHRlZDogIHRydWVcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfcm9vbSc6XG4gICAgICAgICAgICAgICAgdGhpcy52aWV3Um9vbShwYXlsb2FkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIGZvciB0aGVzZSBldmVudHMgYmxhbmsgb3V0IHRoZSByb29tSWQgYXMgd2UgYXJlIG5vIGxvbmdlciBpbiB0aGUgUm9vbVZpZXdcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfY3JlYXRlX2dyb3VwJzpcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfd2VsY29tZV9wYWdlJzpcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfaG9tZV9wYWdlJzpcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfbXlfZ3JvdXBzJzpcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXdfZ3JvdXAnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHJvb21BbGlhczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdmlhU2VydmVyczogW10sXG4gICAgICAgICAgICAgICAgICAgIHdhc0NvbnRleHRTd2l0Y2g6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19yb29tX2Vycm9yJzpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdSb29tRXJyb3IocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd3aWxsX2pvaW4nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBqb2luaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2FuY2VsX2pvaW4nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBqb2luaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIGpvaW5fcm9vbTpcbiAgICAgICAgICAgIC8vICAgICAgLSBvcHRzOiBvcHRpb25zIGZvciBqb2luUm9vbVxuICAgICAgICAgICAgY2FzZSAnam9pbl9yb29tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmpvaW5Sb29tKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnam9pbl9yb29tX2Vycm9yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmpvaW5Sb29tRXJyb3IocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdqb2luX3Jvb21fcmVhZHknOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG91bGRQZWVrOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ29uX2NsaWVudF9ub3RfdmlhYmxlJzpcbiAgICAgICAgICAgIGNhc2UgJ29uX2xvZ2dlZF9vdXQnOlxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2ZvcndhcmRfZXZlbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBmb3J3YXJkaW5nRXZlbnQ6IHBheWxvYWQuZXZlbnQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZXBseV90b19ldmVudCc6XG4gICAgICAgICAgICAgICAgLy8gSWYgY3VycmVudGx5IHZpZXdlZCByb29tIGRvZXMgbm90IG1hdGNoIHRoZSByb29tIGluIHdoaWNoIHdlIHdpc2ggdG8gcmVwbHkgdGhlbiBjaGFuZ2Ugcm9vbXNcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGNhbiBoYXBwZW4gd2hlbiBwZXJmb3JtaW5nIGEgc2VhcmNoIGFjcm9zcyBhbGwgcm9vbXNcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5ldmVudCAmJiBwYXlsb2FkLmV2ZW50LmdldFJvb21JZCgpICE9PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHBheWxvYWQuZXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseWluZ1RvRXZlbnQ6IHBheWxvYWQuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlpbmdUb0V2ZW50OiBwYXlsb2FkLmV2ZW50LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvcGVuX3Jvb21fc2V0dGluZ3MnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgUm9vbVNldHRpbmdzRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUm9vbVNldHRpbmdzRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Jvb20gc2V0dGluZ3MnLCAnJywgUm9vbVNldHRpbmdzRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogcGF5bG9hZC5yb29tX2lkIHx8IHRoaXMuc3RhdGUucm9vbUlkLFxuICAgICAgICAgICAgICAgIH0sIC8qY2xhc3NOYW1lPSovbnVsbCwgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdmlld1Jvb20ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkge1xuICAgICAgICBpZiAocGF5bG9hZC5yb29tX2lkKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgICAgICAgICAgICByb29tSWQ6IHBheWxvYWQucm9vbV9pZCxcbiAgICAgICAgICAgICAgICByb29tQWxpYXM6IHBheWxvYWQucm9vbV9hbGlhcyxcbiAgICAgICAgICAgICAgICBpbml0aWFsRXZlbnRJZDogcGF5bG9hZC5ldmVudF9pZCxcbiAgICAgICAgICAgICAgICBpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkOiBwYXlsb2FkLmhpZ2hsaWdodGVkLFxuICAgICAgICAgICAgICAgIGZvcndhcmRpbmdFdmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICByb29tTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcm9vbUxvYWRFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgcGVlayBieSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgc2hvdWxkUGVlazogcGF5bG9hZC5zaG91bGRfcGVlayA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHBheWxvYWQuc2hvdWxkX3BlZWssXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSB3ZSBzZW50IGEgam9pbiByZXF1ZXN0IGZvciB0aGlzIHJvb20gYW5kIGFyZSB3YWl0aW5nIGZvciBhIHJlc3BvbnNlP1xuICAgICAgICAgICAgICAgIGpvaW5pbmc6IHBheWxvYWQuam9pbmluZyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAvLyBSZXNldCByZXBseWluZ1RvRXZlbnQgYmVjYXVzZSB3ZSBkb24ndCB3YW50IGNyb3NzLXJvb20gYmVjYXVzZSBiYWQgVVhcbiAgICAgICAgICAgICAgICByZXBseWluZ1RvRXZlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gcHVsbCB0aGUgdXNlciBvdXQgb2YgUm9vbSBTZXR0aW5nc1xuICAgICAgICAgICAgICAgIGlzRWRpdGluZ1NldHRpbmdzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2aWFTZXJ2ZXJzOiBwYXlsb2FkLnZpYV9zZXJ2ZXJzLFxuICAgICAgICAgICAgICAgIHdhc0NvbnRleHRTd2l0Y2g6IHBheWxvYWQuY29udGV4dF9zd2l0Y2gsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBBbGxvdyBiZWluZyBnaXZlbiBhbiBldmVudCB0byBiZSByZXBsaWVkIHRvIHdoZW4gc3dpdGNoaW5nIHJvb21zIGJ1dCBzYW5pdHkgY2hlY2sgaXRzIGZvciB0aGlzIHJvb21cbiAgICAgICAgICAgIGlmIChwYXlsb2FkLnJlcGx5aW5nVG9FdmVudCAmJiBwYXlsb2FkLnJlcGx5aW5nVG9FdmVudC5nZXRSb29tSWQoKSA9PT0gcGF5bG9hZC5yb29tX2lkKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGUucmVwbHlpbmdUb0V2ZW50ID0gcGF5bG9hZC5yZXBseWluZ1RvRXZlbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmZvcndhcmRpbmdFdmVudCkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3NlbmRfZXZlbnQnLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBuZXdTdGF0ZS5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiB0aGlzLnN0YXRlLmZvcndhcmRpbmdFdmVudCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cbiAgICAgICAgICAgIGlmIChwYXlsb2FkLmF1dG9fam9pbikge1xuICAgICAgICAgICAgICAgIHRoaXMuam9pblJvb20ocGF5bG9hZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5yb29tX2FsaWFzKSB7XG4gICAgICAgICAgICAvLyBUcnkgdGhlIHJvb20gYWxpYXMgdG8gcm9vbSBJRCBuYXZpZ2F0aW9uIGNhY2hlIGZpcnN0IHRvIGF2b2lkXG4gICAgICAgICAgICAvLyBibG9ja2luZyByb29tIG5hdmlnYXRpb24gb24gdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICAgICAgICBsZXQgcm9vbUlkID0gZ2V0Q2FjaGVkUm9vbUlERm9yQWxpYXMocGF5bG9hZC5yb29tX2FsaWFzKTtcbiAgICAgICAgICAgIGlmICghcm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgLy8gUm9vbSBhbGlhcyBjYWNoZSBtaXNzLCBzbyBsZXQncyBhc2sgdGhlIGhvbWVzZXJ2ZXIuIFJlc29sdmUgdGhlIGFsaWFzXG4gICAgICAgICAgICAgICAgLy8gYW5kIHRoZW4gZG8gYSBzZWNvbmQgZGlzcGF0Y2ggd2l0aCB0aGUgcm9vbSBJRCBhY3F1aXJlZC5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsRXZlbnRJZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHJvb21BbGlhczogcGF5bG9hZC5yb29tX2FsaWFzLFxuICAgICAgICAgICAgICAgICAgICByb29tTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbUxvYWRFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdmlhU2VydmVyczogcGF5bG9hZC52aWFfc2VydmVycyxcbiAgICAgICAgICAgICAgICAgICAgd2FzQ29udGV4dFN3aXRjaDogcGF5bG9hZC5jb250ZXh0X3N3aXRjaCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbUlkRm9yQWxpYXMocGF5bG9hZC5yb29tX2FsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVSb29tQWxpYXNJbkNhY2hlKHBheWxvYWQucm9vbV9hbGlhcywgcmVzdWx0LnJvb21faWQpO1xuICAgICAgICAgICAgICAgICAgICByb29tSWQgPSByZXN1bHQucm9vbV9pZDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlJWUyBmYWlsZWQgdG8gZ2V0IHJvb20gaWQgZm9yIGFsaWFzOiBcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbV9lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9hbGlhczogcGF5bG9hZC5yb29tX2FsaWFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICBldmVudF9pZDogcGF5bG9hZC5ldmVudF9pZCxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHRlZDogcGF5bG9hZC5oaWdobGlnaHRlZCxcbiAgICAgICAgICAgICAgICByb29tX2FsaWFzOiBwYXlsb2FkLnJvb21fYWxpYXMsXG4gICAgICAgICAgICAgICAgYXV0b19qb2luOiBwYXlsb2FkLmF1dG9fam9pbixcbiAgICAgICAgICAgICAgICBvb2JfZGF0YTogcGF5bG9hZC5vb2JfZGF0YSxcbiAgICAgICAgICAgICAgICB2aWFTZXJ2ZXJzOiBwYXlsb2FkLnZpYV9zZXJ2ZXJzLFxuICAgICAgICAgICAgICAgIHdhc0NvbnRleHRTd2l0Y2g6IHBheWxvYWQuY29udGV4dF9zd2l0Y2gsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlld1Jvb21FcnJvcihwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcm9vbUlkOiBwYXlsb2FkLnJvb21faWQsXG4gICAgICAgICAgICByb29tQWxpYXM6IHBheWxvYWQucm9vbV9hbGlhcyxcbiAgICAgICAgICAgIHJvb21Mb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHJvb21Mb2FkRXJyb3I6IHBheWxvYWQuZXJyLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGpvaW5Sb29tKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBqb2luaW5nOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSB0aGlzLnN0YXRlLnJvb21BbGlhcyB8fCB0aGlzLnN0YXRlLnJvb21JZDtcbiAgICAgICAgY29uc3QgdmlhU2VydmVycyA9IHRoaXMuc3RhdGUudmlhU2VydmVycyB8fCBbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHJldHJ5PHZvaWQsIE1hdHJpeEVycm9yPigoKSA9PiBjbGkuam9pblJvb20oYWRkcmVzcywge1xuICAgICAgICAgICAgICAgIHZpYVNlcnZlcnMsXG4gICAgICAgICAgICAgICAgLi4ucGF5bG9hZC5vcHRzLFxuICAgICAgICAgICAgfSksIE5VTV9KT0lOX1JFVFJZLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgcmVjZWl2ZWQgYSBHYXRld2F5IHRpbWVvdXQgdGhlbiByZXRyeVxuICAgICAgICAgICAgICAgIHJldHVybiBlcnIuaHR0cFN0YXR1cyA9PT0gNTA0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrUm9vbUpvaW4oc3RhcnRUaW1lLCB0aGlzLnN0YXRlLnJvb21JZCwgcGF5bG9hZC5fdHlwZSk7XG5cbiAgICAgICAgICAgIC8vIFdlIGRvICpub3QqIGNsZWFyIHRoZSAnam9pbmluZycgZmxhZyBiZWNhdXNlIHRoZSBSb29tIG9iamVjdCBhbmQvb3Igb3VyICdqb2luZWQnIG1lbWJlciBldmVudCBtYXkgbm90XG4gICAgICAgICAgICAvLyBoYXZlIGNvbWUgZG93biB0aGUgc3luYyBzdHJlYW0geWV0LCBhbmQgdGhhdCdzIHRoZSBwb2ludCBhdCB3aGljaCB3ZSdkIGNvbnNpZGVyIHRoZSB1c2VyIGpvaW5lZCB0byB0aGVcbiAgICAgICAgICAgIC8vIHJvb20uXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdqb2luX3Jvb21fcmVhZHknIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnam9pbl9yb29tX2Vycm9yJyxcbiAgICAgICAgICAgICAgICBlcnI6IGVycixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbXNnID0gZXJyLm1lc3NhZ2UgPyBlcnIubWVzc2FnZSA6IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBqb2luIHJvb206XCIsIG1zZyk7XG5cbiAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gXCJDb25uZWN0aW9uRXJyb3JcIikge1xuICAgICAgICAgICAgICAgIG1zZyA9IF90KFwiVGhlcmUgd2FzIGFuIGVycm9yIGpvaW5pbmcgdGhlIHJvb21cIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5lcnJjb2RlID09PSAnTV9JTkNPTVBBVElCTEVfUk9PTV9WRVJTSU9OJykge1xuICAgICAgICAgICAgICAgIG1zZyA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlNvcnJ5LCB5b3VyIGhvbWVzZXJ2ZXIgaXMgdG9vIG9sZCB0byBwYXJ0aWNpcGF0ZSBpbiB0aGlzIHJvb20uXCIpfTxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJQbGVhc2UgY29udGFjdCB5b3VyIGhvbWVzZXJ2ZXIgYWRtaW5pc3RyYXRvci5cIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIuaHR0cFN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52aXRpbmdVc2VySWQgPSB0aGlzLmdldEludml0aW5nVXNlcklkKHRoaXMuc3RhdGUucm9vbUlkKTtcbiAgICAgICAgICAgICAgICAvLyBvbmx5IHByb3ZpZGUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSBmb3IgaW52aXRlc1xuICAgICAgICAgICAgICAgIGlmIChpbnZpdGluZ1VzZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgaW52aXRpbmcgdXNlciBpcyBvbiB0aGUgc2FtZSBIUywgdGhlcmUgY2FuIG9ubHkgYmUgb25lIGNhdXNlOiB0aGV5IGxlZnQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnZpdGluZ1VzZXJJZC5lbmRzV2l0aChgOiR7TWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERvbWFpbigpfWApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBfdChcIlRoZSBwZXJzb24gd2hvIGludml0ZWQgeW91IGFscmVhZHkgbGVmdCB0aGUgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBfdChcIlRoZSBwZXJzb24gd2hvIGludml0ZWQgeW91IGFscmVhZHkgbGVmdCB0aGUgcm9vbSwgb3IgdGhlaXIgc2VydmVyIGlzIG9mZmxpbmUuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGpvaW4gcm9vbScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byBqb2luIHJvb21cIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbnZpdGluZ1VzZXJJZChyb29tSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGlmIChyb29tICYmIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiaW52aXRlXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IG15TWVtYmVyID0gcm9vbS5nZXRNZW1iZXIoY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIGNvbnN0IGludml0ZUV2ZW50ID0gbXlNZW1iZXIgPyBteU1lbWJlci5ldmVudHMubWVtYmVyIDogbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBpbnZpdGVFdmVudCAmJiBpbnZpdGVFdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgam9pblJvb21FcnJvcihwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgam9pbmluZzogZmFsc2UsXG4gICAgICAgICAgICBqb2luRXJyb3I6IHBheWxvYWQuZXJyLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBJTklUSUFMX1NUQVRFKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcm9vbSBJRCBvZiB0aGUgcm9vbSBjdXJyZW50bHkgYmVpbmcgdmlld2VkXG4gICAgcHVibGljIGdldFJvb21JZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucm9vbUlkO1xuICAgIH1cblxuICAgIC8vIFRoZSBldmVudCB0byBzY3JvbGwgdG8gd2hlbiB0aGUgcm9vbSBpcyBmaXJzdCB2aWV3ZWRcbiAgICBwdWJsaWMgZ2V0SW5pdGlhbEV2ZW50SWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmluaXRpYWxFdmVudElkO1xuICAgIH1cblxuICAgIC8vIFdoZXRoZXIgdG8gaGlnaGxpZ2h0IHRoZSBpbml0aWFsIGV2ZW50XG4gICAgcHVibGljIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ7XG4gICAgfVxuXG4gICAgLy8gVGhlIHJvb20gYWxpYXMgb2YgdGhlIHJvb20gKG9yIG51bGwgaWYgbm90IG9yaWdpbmFsbHkgc3BlY2lmaWVkIGluIHZpZXdfcm9vbSlcbiAgICBwdWJsaWMgZ2V0Um9vbUFsaWFzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb29tQWxpYXM7XG4gICAgfVxuXG4gICAgLy8gV2hldGhlciB0aGUgY3VycmVudCByb29tIGlzIGxvYWRpbmcgKHRydWUgd2hpbHN0IHJlc29sdmluZyBhbiBhbGlhcylcbiAgICBwdWJsaWMgaXNSb29tTG9hZGluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucm9vbUxvYWRpbmc7XG4gICAgfVxuXG4gICAgLy8gQW55IGVycm9yIHRoYXQgaGFzIG9jY3VycmVkIGR1cmluZyBsb2FkaW5nXG4gICAgcHVibGljIGdldFJvb21Mb2FkRXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJvb21Mb2FkRXJyb3I7XG4gICAgfVxuXG4gICAgLy8gVHJ1ZSBpZiB3ZSdyZSBleHBlY3RpbmcgdGhlIHVzZXIgdG8gYmUgam9pbmVkIHRvIHRoZSByb29tIGN1cnJlbnRseSBiZWluZ1xuICAgIC8vIHZpZXdlZC4gTm90ZSB0aGF0IHRoaXMgaXMgbGVmdCB0cnVlIGFmdGVyIHRoZSBqb2luIHJlcXVlc3QgaGFzIGZpbmlzaGVkLFxuICAgIC8vIHNpbmNlIHdlIHNob3VsZCBzdGlsbCBjb25zaWRlciBhIGpvaW4gdG8gYmUgaW4gcHJvZ3Jlc3MgdW50aWwgdGhlIHJvb21cbiAgICAvLyAmIG1lbWJlciBldmVudHMgY29tZSBkb3duIHRoZSBzeW5jLlxuICAgIC8vXG4gICAgLy8gVGhpcyBmbGFnIHJlbWFpbnMgdHJ1ZSBhZnRlciB0aGUgcm9vbSBoYXMgYmVlbiBzdWNlc3NmdWxseSBqb2luZWQsXG4gICAgLy8gKHRoaXMgc3RvcmUgZG9lc24ndCBsaXN0ZW4gZm9yIHRoZSBhcHByb3ByaWF0ZSBtZW1iZXIgZXZlbnRzKVxuICAgIC8vIHNvIHlvdSBzaG91bGQgYWx3YXlzIG9ic2VydmUgdGhlIGpvaW5lZCBzdGF0ZSBmcm9tIHRoZSBtZW1iZXIgZXZlbnRcbiAgICAvLyBpZiBhIHJvb20gb2JqZWN0IGlzIHByZXNlbnQuXG4gICAgLy8gaWUuIFRoZSBjb3JyZWN0IGxvZ2ljIGlzOlxuICAgIC8vIGlmIChyb29tKSB7XG4gICAgLy8gICAgIGlmIChteU1lbWJlci5tZW1iZXJzaGlwID09ICdqb2luZWQnKSB7XG4gICAgLy8gICAgICAgICAvLyB1c2VyIGlzIGpvaW5lZCB0byB0aGUgcm9vbVxuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgLy8gTm90IGpvaW5lZFxuICAgIC8vICAgICB9XG4gICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgICAgaWYgKFJvb21WaWV3U3RvcmUuaXNKb2luaW5nKCkpIHtcbiAgICAvLyAgICAgICAgIC8vIHNob3cgc3Bpbm5lclxuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgLy8gc2hvdyBqb2luIHByb21wdFxuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIHB1YmxpYyBpc0pvaW5pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmpvaW5pbmc7XG4gICAgfVxuXG4gICAgLy8gQW55IGVycm9yIHRoYXQgaGFzIG9jY3VycmVkIGR1cmluZyBqb2luaW5nXG4gICAgcHVibGljIGdldEpvaW5FcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuam9pbkVycm9yO1xuICAgIH1cblxuICAgIC8vIFRoZSBteEV2ZW50IGlmIG9uZSBpcyBhYm91dCB0byBiZSBmb3J3YXJkZWRcbiAgICBwdWJsaWMgZ2V0Rm9yd2FyZGluZ0V2ZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5mb3J3YXJkaW5nRXZlbnQ7XG4gICAgfVxuXG4gICAgLy8gVGhlIG14RXZlbnQgaWYgb25lIGlzIGN1cnJlbnRseSBiZWluZyByZXBsaWVkIHRvL3F1b3RlZFxuICAgIHB1YmxpYyBnZXRRdW90aW5nRXZlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJlcGx5aW5nVG9FdmVudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvdWxkUGVlaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc2hvdWxkUGVlaztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0V2FzQ29udGV4dFN3aXRjaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUud2FzQ29udGV4dFN3aXRjaDtcbiAgICB9XG59XG5cbmxldCBzaW5nbGV0b25Sb29tVmlld1N0b3JlID0gbnVsbDtcbmlmICghc2luZ2xldG9uUm9vbVZpZXdTdG9yZSkge1xuICAgIHNpbmdsZXRvblJvb21WaWV3U3RvcmUgPSBuZXcgUm9vbVZpZXdTdG9yZSgpO1xufVxuZXhwb3J0IGRlZmF1bHQgc2luZ2xldG9uUm9vbVZpZXdTdG9yZTtcbiJdfQ==