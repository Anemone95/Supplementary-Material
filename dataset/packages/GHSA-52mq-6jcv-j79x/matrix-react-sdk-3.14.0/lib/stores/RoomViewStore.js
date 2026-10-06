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

/*
Copyright 2017 Vector Creations Ltd
Copyright 2017, 2018 New Vector Ltd
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
  shouldPeek: false
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
          roomAlias: null
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
        isEditingSettings: false
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
          roomLoadError: null
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
        oob_data: payload.oob_data
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

    try {
      await (0, _promise.retry)(() => cli.joinRoom(address, payload.opts), NUM_JOIN_RETRY, err => {
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

}

let singletonRoomViewStore = null;

if (!singletonRoomViewStore) {
  singletonRoomViewStore = new RoomViewStore();
}

var _default = singletonRoomViewStore;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvUm9vbVZpZXdTdG9yZS50c3giXSwibmFtZXMiOlsiTlVNX0pPSU5fUkVUUlkiLCJJTklUSUFMX1NUQVRFIiwiam9pbmluZyIsImpvaW5FcnJvciIsInJvb21JZCIsImluaXRpYWxFdmVudElkIiwiaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQiLCJpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkIiwicm9vbUFsaWFzIiwicm9vbUxvYWRpbmciLCJyb29tTG9hZEVycm9yIiwiZm9yd2FyZGluZ0V2ZW50IiwicXVvdGluZ0V2ZW50IiwicmVwbHlpbmdUb0V2ZW50Iiwic2hvdWxkUGVlayIsIlJvb21WaWV3U3RvcmUiLCJTdG9yZSIsImNvbnN0cnVjdG9yIiwiZGlzIiwic2V0U3RhdGUiLCJuZXdTdGF0ZSIsInN0YXRlQ2hhbmdlZCIsImtleSIsIk9iamVjdCIsImtleXMiLCJzdGF0ZSIsImFzc2lnbiIsIl9fZW1pdENoYW5nZSIsIl9fb25EaXNwYXRjaCIsInBheWxvYWQiLCJhY3Rpb24iLCJ2aWV3Um9vbSIsInZpZXdSb29tRXJyb3IiLCJqb2luUm9vbSIsImpvaW5Sb29tRXJyb3IiLCJyZXNldCIsImV2ZW50IiwiZ2V0Um9vbUlkIiwiZGlzcGF0Y2giLCJyb29tX2lkIiwiUm9vbVNldHRpbmdzRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwicm9vbV9hbGlhcyIsImV2ZW50X2lkIiwiaGlnaGxpZ2h0ZWQiLCJzaG91bGRfcGVlayIsInVuZGVmaW5lZCIsImlzRWRpdGluZ1NldHRpbmdzIiwiYXV0b19qb2luIiwicmVzdWx0IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0Um9vbUlkRm9yQWxpYXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJvb2JfZGF0YSIsInN0YXJ0VGltZSIsIkNvdW50bHlBbmFseXRpY3MiLCJnZXRUaW1lc3RhbXAiLCJjbGkiLCJhZGRyZXNzIiwib3B0cyIsImh0dHBTdGF0dXMiLCJpbnN0YW5jZSIsInRyYWNrUm9vbUpvaW4iLCJfdHlwZSIsIm1zZyIsIm1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwibG9nIiwibmFtZSIsImVycmNvZGUiLCJpbnZpdGluZ1VzZXJJZCIsImdldEludml0aW5nVXNlcklkIiwiZW5kc1dpdGgiLCJnZXREb21haW4iLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJyb29tIiwiZ2V0Um9vbSIsImdldE15TWVtYmVyc2hpcCIsIm15TWVtYmVyIiwiZ2V0TWVtYmVyIiwiZ2V0VXNlcklkIiwiaW52aXRlRXZlbnQiLCJldmVudHMiLCJtZW1iZXIiLCJnZXRTZW5kZXIiLCJnZXRJbml0aWFsRXZlbnRJZCIsImdldFJvb21BbGlhcyIsImlzUm9vbUxvYWRpbmciLCJnZXRSb29tTG9hZEVycm9yIiwiaXNKb2luaW5nIiwiZ2V0Sm9pbkVycm9yIiwiZ2V0Rm9yd2FyZGluZ0V2ZW50IiwiZ2V0UXVvdGluZ0V2ZW50Iiwic2luZ2xldG9uUm9vbVZpZXdTdG9yZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWdCQSxNQUFNQSxjQUFjLEdBQUcsQ0FBdkI7QUFFQSxNQUFNQyxhQUFhLEdBQUc7QUFDbEI7QUFDQUMsRUFBQUEsT0FBTyxFQUFFLEtBRlM7QUFHbEI7QUFDQUMsRUFBQUEsU0FBUyxFQUFFLElBSk87QUFLbEI7QUFDQUMsRUFBQUEsTUFBTSxFQUFFLElBTlU7QUFRbEI7QUFDQUMsRUFBQUEsY0FBYyxFQUFFLElBVEU7QUFVbEJDLEVBQUFBLHVCQUF1QixFQUFFLElBVlA7QUFXbEI7QUFDQUMsRUFBQUEseUJBQXlCLEVBQUUs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LEdBQUcsSUFBSXZGLGFBQUosRUFBekI7QUFDSDs7ZUFDY3VGLHNCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1N0b3JlfSBmcm9tICdmbHV4L3V0aWxzJztcbmltcG9ydCB7TWF0cml4RXJyb3J9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9odHRwLWFwaVwiO1xuXG5pbXBvcnQgZGlzIGZyb20gJy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZ2V0Q2FjaGVkUm9vbUlERm9yQWxpYXMsIHN0b3JlUm9vbUFsaWFzSW5DYWNoZSB9IGZyb20gJy4uL1Jvb21BbGlhc0NhY2hlJztcbmltcG9ydCB7QWN0aW9uUGF5bG9hZH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7cmV0cnl9IGZyb20gXCIuLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vQ291bnRseUFuYWx5dGljc1wiO1xuXG5jb25zdCBOVU1fSk9JTl9SRVRSWSA9IDU7XG5cbmNvbnN0IElOSVRJQUxfU1RBVEUgPSB7XG4gICAgLy8gV2hldGhlciB3ZSdyZSBqb2luaW5nIHRoZSBjdXJyZW50bHkgdmlld2VkIHJvb20gKHNlZSBpc0pvaW5pbmcoKSlcbiAgICBqb2luaW5nOiBmYWxzZSxcbiAgICAvLyBBbnkgZXJyb3IgdGhhdCBoYXMgb2NjdXJyZWQgZHVyaW5nIGpvaW5pbmdcbiAgICBqb2luRXJyb3I6IG51bGwsXG4gICAgLy8gVGhlIHJvb20gSUQgb2YgdGhlIHJvb20gY3VycmVudGx5IGJlaW5nIHZpZXdlZFxuICAgIHJvb21JZDogbnVsbCxcblxuICAgIC8vIFRoZSBldmVudCB0byBzY3JvbGwgdG8gd2hlbiB0aGUgcm9vbSBpcyBmaXJzdCB2aWV3ZWRcbiAgICBpbml0aWFsRXZlbnRJZDogbnVsbCxcbiAgICBpbml0aWFsRXZlbnRQaXhlbE9mZnNldDogbnVsbCxcbiAgICAvLyBXaGV0aGVyIHRvIGhpZ2hsaWdodCB0aGUgaW5pdGlhbCBldmVudFxuICAgIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ6IGZhbHNlLFxuXG4gICAgLy8gVGhlIHJvb20gYWxpYXMgb2YgdGhlIHJvb20gKG9yIG51bGwgaWYgbm90IG9yaWdpbmFsbHkgc3BlY2lmaWVkIGluIHZpZXdfcm9vbSlcbiAgICByb29tQWxpYXM6IG51bGwsXG4gICAgLy8gV2hldGhlciB0aGUgY3VycmVudCByb29tIGlzIGxvYWRpbmdcbiAgICByb29tTG9hZGluZzogZmFsc2UsXG4gICAgLy8gQW55IGVycm9yIHRoYXQgaGFzIG9jY3VycmVkIGR1cmluZyBsb2FkaW5nXG4gICAgcm9vbUxvYWRFcnJvcjogbnVsbCxcblxuICAgIGZvcndhcmRpbmdFdmVudDogbnVsbCxcblxuICAgIHF1b3RpbmdFdmVudDogbnVsbCxcblxuICAgIHJlcGx5aW5nVG9FdmVudDogbnVsbCxcblxuICAgIHNob3VsZFBlZWs6IGZhbHNlLFxufTtcblxuLyoqXG4gKiBBIGNsYXNzIGZvciBzdG9yaW5nIGFwcGxpY2F0aW9uIHN0YXRlIGZvciBSb29tVmlldy4gVGhpcyBpcyB0aGUgUm9vbVZpZXcncyBpbnRlcmZhY2VcbiogIHdpdGggYSBzdWJzZXQgb2YgdGhlIGpzLXNkay5cbiAqICBgYGBcbiAqL1xuY2xhc3MgUm9vbVZpZXdTdG9yZSBleHRlbmRzIFN0b3JlPEFjdGlvblBheWxvYWQ+IHtcbiAgICBwcml2YXRlIHN0YXRlID0gSU5JVElBTF9TVEFURTsgLy8gaW5pdGlhbGl6ZSBzdGF0ZVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKGRpcyk7XG4gICAgfVxuXG4gICAgc2V0U3RhdGUobmV3U3RhdGU6IFBhcnRpYWw8dHlwZW9mIElOSVRJQUxfU1RBVEU+KSB7XG4gICAgICAgIC8vIElmIHZhbHVlcyBoYXZlbid0IGNoYW5nZWQsIHRoZXJlJ3Mgbm90aGluZyB0byBkby5cbiAgICAgICAgLy8gVGhpcyBvbmx5IHRyaWVzIGEgc2hhbGxvdyBjb21wYXJpc29uLCBzbyB1bmNoYW5nZWQgb2JqZWN0cyB3aWxsIHNsaXBcbiAgICAgICAgLy8gdGhyb3VnaCwgYnV0IHRoYXQncyBwcm9iYWJseSBva2F5IGZvciBub3cuXG4gICAgICAgIGxldCBzdGF0ZUNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobmV3U3RhdGUpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZVtrZXldICE9PSBuZXdTdGF0ZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgbmV3U3RhdGUpO1xuICAgICAgICB0aGlzLl9fZW1pdENoYW5nZSgpO1xuICAgIH1cblxuICAgIF9fb25EaXNwYXRjaChwYXlsb2FkKSB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIHZpZXdfcm9vbTpcbiAgICAgICAgICAgIC8vICAgICAgLSByb29tX2FsaWFzOiAgICcjc29tZWFsaWFzOm1hdHJpeC5vcmcnXG4gICAgICAgICAgICAvLyAgICAgIC0gcm9vbV9pZDogICAgICAnIXJvb21pZDEyMzptYXRyaXgub3JnJ1xuICAgICAgICAgICAgLy8gICAgICAtIGV2ZW50X2lkOiAgICAgJyQyMTM0NTY3ODI6bWF0cml4Lm9yZydcbiAgICAgICAgICAgIC8vICAgICAgLSBldmVudF9vZmZzZXQ6IDEwMFxuICAgICAgICAgICAgLy8gICAgICAtIGhpZ2hsaWdodGVkOiAgdHJ1ZVxuICAgICAgICAgICAgY2FzZSAndmlld19yb29tJzpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdSb29tKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gZm9yIHRoZXNlIGV2ZW50cyBibGFuayBvdXQgdGhlIHJvb21JZCBhcyB3ZSBhcmUgbm8gbG9uZ2VyIGluIHRoZSBSb29tVmlld1xuICAgICAgICAgICAgY2FzZSAndmlld19jcmVhdGVfZ3JvdXAnOlxuICAgICAgICAgICAgY2FzZSAndmlld193ZWxjb21lX3BhZ2UnOlxuICAgICAgICAgICAgY2FzZSAndmlld19ob21lX3BhZ2UnOlxuICAgICAgICAgICAgY2FzZSAndmlld19teV9ncm91cHMnOlxuICAgICAgICAgICAgY2FzZSAndmlld19ncm91cCc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcm9vbUFsaWFzOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndmlld19yb29tX2Vycm9yJzpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdSb29tRXJyb3IocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd3aWxsX2pvaW4nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBqb2luaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2FuY2VsX2pvaW4nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBqb2luaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIGpvaW5fcm9vbTpcbiAgICAgICAgICAgIC8vICAgICAgLSBvcHRzOiBvcHRpb25zIGZvciBqb2luUm9vbVxuICAgICAgICAgICAgY2FzZSAnam9pbl9yb29tJzpcbiAgICAgICAgICAgICAgICB0aGlzLmpvaW5Sb29tKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnam9pbl9yb29tX2Vycm9yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmpvaW5Sb29tRXJyb3IocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdqb2luX3Jvb21fcmVhZHknOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG91bGRQZWVrOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ29uX2NsaWVudF9ub3RfdmlhYmxlJzpcbiAgICAgICAgICAgIGNhc2UgJ29uX2xvZ2dlZF9vdXQnOlxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2ZvcndhcmRfZXZlbnQnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBmb3J3YXJkaW5nRXZlbnQ6IHBheWxvYWQuZXZlbnQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZXBseV90b19ldmVudCc6XG4gICAgICAgICAgICAgICAgLy8gSWYgY3VycmVudGx5IHZpZXdlZCByb29tIGRvZXMgbm90IG1hdGNoIHRoZSByb29tIGluIHdoaWNoIHdlIHdpc2ggdG8gcmVwbHkgdGhlbiBjaGFuZ2Ugcm9vbXNcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGNhbiBoYXBwZW4gd2hlbiBwZXJmb3JtaW5nIGEgc2VhcmNoIGFjcm9zcyBhbGwgcm9vbXNcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5ldmVudCAmJiBwYXlsb2FkLmV2ZW50LmdldFJvb21JZCgpICE9PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHBheWxvYWQuZXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBseWluZ1RvRXZlbnQ6IHBheWxvYWQuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbHlpbmdUb0V2ZW50OiBwYXlsb2FkLmV2ZW50LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvcGVuX3Jvb21fc2V0dGluZ3MnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgUm9vbVNldHRpbmdzRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUm9vbVNldHRpbmdzRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Jvb20gc2V0dGluZ3MnLCAnJywgUm9vbVNldHRpbmdzRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogcGF5bG9hZC5yb29tX2lkIHx8IHRoaXMuc3RhdGUucm9vbUlkLFxuICAgICAgICAgICAgICAgIH0sIC8qY2xhc3NOYW1lPSovbnVsbCwgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdmlld1Jvb20ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkge1xuICAgICAgICBpZiAocGF5bG9hZC5yb29tX2lkKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgICAgICAgICAgICByb29tSWQ6IHBheWxvYWQucm9vbV9pZCxcbiAgICAgICAgICAgICAgICByb29tQWxpYXM6IHBheWxvYWQucm9vbV9hbGlhcyxcbiAgICAgICAgICAgICAgICBpbml0aWFsRXZlbnRJZDogcGF5bG9hZC5ldmVudF9pZCxcbiAgICAgICAgICAgICAgICBpc0luaXRpYWxFdmVudEhpZ2hsaWdodGVkOiBwYXlsb2FkLmhpZ2hsaWdodGVkLFxuICAgICAgICAgICAgICAgIGZvcndhcmRpbmdFdmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICByb29tTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcm9vbUxvYWRFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgcGVlayBieSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgc2hvdWxkUGVlazogcGF5bG9hZC5zaG91bGRfcGVlayA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHBheWxvYWQuc2hvdWxkX3BlZWssXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSB3ZSBzZW50IGEgam9pbiByZXF1ZXN0IGZvciB0aGlzIHJvb20gYW5kIGFyZSB3YWl0aW5nIGZvciBhIHJlc3BvbnNlP1xuICAgICAgICAgICAgICAgIGpvaW5pbmc6IHBheWxvYWQuam9pbmluZyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAvLyBSZXNldCByZXBseWluZ1RvRXZlbnQgYmVjYXVzZSB3ZSBkb24ndCB3YW50IGNyb3NzLXJvb20gYmVjYXVzZSBiYWQgVVhcbiAgICAgICAgICAgICAgICByZXBseWluZ1RvRXZlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gcHVsbCB0aGUgdXNlciBvdXQgb2YgUm9vbSBTZXR0aW5nc1xuICAgICAgICAgICAgICAgIGlzRWRpdGluZ1NldHRpbmdzOiBmYWxzZSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEFsbG93IGJlaW5nIGdpdmVuIGFuIGV2ZW50IHRvIGJlIHJlcGxpZWQgdG8gd2hlbiBzd2l0Y2hpbmcgcm9vbXMgYnV0IHNhbml0eSBjaGVjayBpdHMgZm9yIHRoaXMgcm9vbVxuICAgICAgICAgICAgaWYgKHBheWxvYWQucmVwbHlpbmdUb0V2ZW50ICYmIHBheWxvYWQucmVwbHlpbmdUb0V2ZW50LmdldFJvb21JZCgpID09PSBwYXlsb2FkLnJvb21faWQpIHtcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZS5yZXBseWluZ1RvRXZlbnQgPSBwYXlsb2FkLnJlcGx5aW5nVG9FdmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZm9yd2FyZGluZ0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnc2VuZF9ldmVudCcsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IG5ld1N0YXRlLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHRoaXMuc3RhdGUuZm9yd2FyZGluZ0V2ZW50LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcblxuICAgICAgICAgICAgaWYgKHBheWxvYWQuYXV0b19qb2luKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5qb2luUm9vbShwYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnJvb21fYWxpYXMpIHtcbiAgICAgICAgICAgIC8vIFRyeSB0aGUgcm9vbSBhbGlhcyB0byByb29tIElEIG5hdmlnYXRpb24gY2FjaGUgZmlyc3QgdG8gYXZvaWRcbiAgICAgICAgICAgIC8vIGJsb2NraW5nIHJvb20gbmF2aWdhdGlvbiBvbiB0aGUgaG9tZXNlcnZlci5cbiAgICAgICAgICAgIGxldCByb29tSWQgPSBnZXRDYWNoZWRSb29tSURGb3JBbGlhcyhwYXlsb2FkLnJvb21fYWxpYXMpO1xuICAgICAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgICAgICAvLyBSb29tIGFsaWFzIGNhY2hlIG1pc3MsIHNvIGxldCdzIGFzayB0aGUgaG9tZXNlcnZlci4gUmVzb2x2ZSB0aGUgYWxpYXNcbiAgICAgICAgICAgICAgICAvLyBhbmQgdGhlbiBkbyBhIHNlY29uZCBkaXNwYXRjaCB3aXRoIHRoZSByb29tIElEIGFjcXVpcmVkLlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxFdmVudElkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsRXZlbnRQaXhlbE9mZnNldDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcm9vbUFsaWFzOiBwYXlsb2FkLnJvb21fYWxpYXMsXG4gICAgICAgICAgICAgICAgICAgIHJvb21Mb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByb29tTG9hZEVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tSWRGb3JBbGlhcyhwYXlsb2FkLnJvb21fYWxpYXMpO1xuICAgICAgICAgICAgICAgICAgICBzdG9yZVJvb21BbGlhc0luQ2FjaGUocGF5bG9hZC5yb29tX2FsaWFzLCByZXN1bHQucm9vbV9pZCk7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZCA9IHJlc3VsdC5yb29tX2lkO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiUlZTIGZhaWxlZCB0byBnZXQgcm9vbSBpZCBmb3IgYWxpYXM6IFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tX2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tX2FsaWFzOiBwYXlsb2FkLnJvb21fYWxpYXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgIGV2ZW50X2lkOiBwYXlsb2FkLmV2ZW50X2lkLFxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkOiBwYXlsb2FkLmhpZ2hsaWdodGVkLFxuICAgICAgICAgICAgICAgIHJvb21fYWxpYXM6IHBheWxvYWQucm9vbV9hbGlhcyxcbiAgICAgICAgICAgICAgICBhdXRvX2pvaW46IHBheWxvYWQuYXV0b19qb2luLFxuICAgICAgICAgICAgICAgIG9vYl9kYXRhOiBwYXlsb2FkLm9vYl9kYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdSb29tRXJyb3IocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJvb21JZDogcGF5bG9hZC5yb29tX2lkLFxuICAgICAgICAgICAgcm9vbUFsaWFzOiBwYXlsb2FkLnJvb21fYWxpYXMsXG4gICAgICAgICAgICByb29tTG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICByb29tTG9hZEVycm9yOiBwYXlsb2FkLmVycixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBqb2luUm9vbShwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgam9pbmluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBhZGRyZXNzID0gdGhpcy5zdGF0ZS5yb29tQWxpYXMgfHwgdGhpcy5zdGF0ZS5yb29tSWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCByZXRyeTx2b2lkLCBNYXRyaXhFcnJvcj4oKCkgPT4gY2xpLmpvaW5Sb29tKGFkZHJlc3MsIHBheWxvYWQub3B0cyksIE5VTV9KT0lOX1JFVFJZLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgcmVjZWl2ZWQgYSBHYXRld2F5IHRpbWVvdXQgdGhlbiByZXRyeVxuICAgICAgICAgICAgICAgIHJldHVybiBlcnIuaHR0cFN0YXR1cyA9PT0gNTA0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrUm9vbUpvaW4oc3RhcnRUaW1lLCB0aGlzLnN0YXRlLnJvb21JZCwgcGF5bG9hZC5fdHlwZSk7XG5cbiAgICAgICAgICAgIC8vIFdlIGRvICpub3QqIGNsZWFyIHRoZSAnam9pbmluZycgZmxhZyBiZWNhdXNlIHRoZSBSb29tIG9iamVjdCBhbmQvb3Igb3VyICdqb2luZWQnIG1lbWJlciBldmVudCBtYXkgbm90XG4gICAgICAgICAgICAvLyBoYXZlIGNvbWUgZG93biB0aGUgc3luYyBzdHJlYW0geWV0LCBhbmQgdGhhdCdzIHRoZSBwb2ludCBhdCB3aGljaCB3ZSdkIGNvbnNpZGVyIHRoZSB1c2VyIGpvaW5lZCB0byB0aGVcbiAgICAgICAgICAgIC8vIHJvb20uXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdqb2luX3Jvb21fcmVhZHknIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnam9pbl9yb29tX2Vycm9yJyxcbiAgICAgICAgICAgICAgICBlcnI6IGVycixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbXNnID0gZXJyLm1lc3NhZ2UgPyBlcnIubWVzc2FnZSA6IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBqb2luIHJvb206XCIsIG1zZyk7XG5cbiAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gXCJDb25uZWN0aW9uRXJyb3JcIikge1xuICAgICAgICAgICAgICAgIG1zZyA9IF90KFwiVGhlcmUgd2FzIGFuIGVycm9yIGpvaW5pbmcgdGhlIHJvb21cIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVyci5lcnJjb2RlID09PSAnTV9JTkNPTVBBVElCTEVfUk9PTV9WRVJTSU9OJykge1xuICAgICAgICAgICAgICAgIG1zZyA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlNvcnJ5LCB5b3VyIGhvbWVzZXJ2ZXIgaXMgdG9vIG9sZCB0byBwYXJ0aWNpcGF0ZSBpbiB0aGlzIHJvb20uXCIpfTxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJQbGVhc2UgY29udGFjdCB5b3VyIGhvbWVzZXJ2ZXIgYWRtaW5pc3RyYXRvci5cIil9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIuaHR0cFN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52aXRpbmdVc2VySWQgPSB0aGlzLmdldEludml0aW5nVXNlcklkKHRoaXMuc3RhdGUucm9vbUlkKTtcbiAgICAgICAgICAgICAgICAvLyBvbmx5IHByb3ZpZGUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSBmb3IgaW52aXRlc1xuICAgICAgICAgICAgICAgIGlmIChpbnZpdGluZ1VzZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgaW52aXRpbmcgdXNlciBpcyBvbiB0aGUgc2FtZSBIUywgdGhlcmUgY2FuIG9ubHkgYmUgb25lIGNhdXNlOiB0aGV5IGxlZnQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnZpdGluZ1VzZXJJZC5lbmRzV2l0aChgOiR7TWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERvbWFpbigpfWApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBfdChcIlRoZSBwZXJzb24gd2hvIGludml0ZWQgeW91IGFscmVhZHkgbGVmdCB0aGUgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBfdChcIlRoZSBwZXJzb24gd2hvIGludml0ZWQgeW91IGFscmVhZHkgbGVmdCB0aGUgcm9vbSwgb3IgdGhlaXIgc2VydmVyIGlzIG9mZmxpbmUuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGpvaW4gcm9vbScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byBqb2luIHJvb21cIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbnZpdGluZ1VzZXJJZChyb29tSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGlmIChyb29tICYmIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiaW52aXRlXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IG15TWVtYmVyID0gcm9vbS5nZXRNZW1iZXIoY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIGNvbnN0IGludml0ZUV2ZW50ID0gbXlNZW1iZXIgPyBteU1lbWJlci5ldmVudHMubWVtYmVyIDogbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBpbnZpdGVFdmVudCAmJiBpbnZpdGVFdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgam9pblJvb21FcnJvcihwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgam9pbmluZzogZmFsc2UsXG4gICAgICAgICAgICBqb2luRXJyb3I6IHBheWxvYWQuZXJyLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBJTklUSUFMX1NUQVRFKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcm9vbSBJRCBvZiB0aGUgcm9vbSBjdXJyZW50bHkgYmVpbmcgdmlld2VkXG4gICAgcHVibGljIGdldFJvb21JZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucm9vbUlkO1xuICAgIH1cblxuICAgIC8vIFRoZSBldmVudCB0byBzY3JvbGwgdG8gd2hlbiB0aGUgcm9vbSBpcyBmaXJzdCB2aWV3ZWRcbiAgICBwdWJsaWMgZ2V0SW5pdGlhbEV2ZW50SWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmluaXRpYWxFdmVudElkO1xuICAgIH1cblxuICAgIC8vIFdoZXRoZXIgdG8gaGlnaGxpZ2h0IHRoZSBpbml0aWFsIGV2ZW50XG4gICAgcHVibGljIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ7XG4gICAgfVxuXG4gICAgLy8gVGhlIHJvb20gYWxpYXMgb2YgdGhlIHJvb20gKG9yIG51bGwgaWYgbm90IG9yaWdpbmFsbHkgc3BlY2lmaWVkIGluIHZpZXdfcm9vbSlcbiAgICBwdWJsaWMgZ2V0Um9vbUFsaWFzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb29tQWxpYXM7XG4gICAgfVxuXG4gICAgLy8gV2hldGhlciB0aGUgY3VycmVudCByb29tIGlzIGxvYWRpbmcgKHRydWUgd2hpbHN0IHJlc29sdmluZyBhbiBhbGlhcylcbiAgICBwdWJsaWMgaXNSb29tTG9hZGluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucm9vbUxvYWRpbmc7XG4gICAgfVxuXG4gICAgLy8gQW55IGVycm9yIHRoYXQgaGFzIG9jY3VycmVkIGR1cmluZyBsb2FkaW5nXG4gICAgcHVibGljIGdldFJvb21Mb2FkRXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJvb21Mb2FkRXJyb3I7XG4gICAgfVxuXG4gICAgLy8gVHJ1ZSBpZiB3ZSdyZSBleHBlY3RpbmcgdGhlIHVzZXIgdG8gYmUgam9pbmVkIHRvIHRoZSByb29tIGN1cnJlbnRseSBiZWluZ1xuICAgIC8vIHZpZXdlZC4gTm90ZSB0aGF0IHRoaXMgaXMgbGVmdCB0cnVlIGFmdGVyIHRoZSBqb2luIHJlcXVlc3QgaGFzIGZpbmlzaGVkLFxuICAgIC8vIHNpbmNlIHdlIHNob3VsZCBzdGlsbCBjb25zaWRlciBhIGpvaW4gdG8gYmUgaW4gcHJvZ3Jlc3MgdW50aWwgdGhlIHJvb21cbiAgICAvLyAmIG1lbWJlciBldmVudHMgY29tZSBkb3duIHRoZSBzeW5jLlxuICAgIC8vXG4gICAgLy8gVGhpcyBmbGFnIHJlbWFpbnMgdHJ1ZSBhZnRlciB0aGUgcm9vbSBoYXMgYmVlbiBzdWNlc3NmdWxseSBqb2luZWQsXG4gICAgLy8gKHRoaXMgc3RvcmUgZG9lc24ndCBsaXN0ZW4gZm9yIHRoZSBhcHByb3ByaWF0ZSBtZW1iZXIgZXZlbnRzKVxuICAgIC8vIHNvIHlvdSBzaG91bGQgYWx3YXlzIG9ic2VydmUgdGhlIGpvaW5lZCBzdGF0ZSBmcm9tIHRoZSBtZW1iZXIgZXZlbnRcbiAgICAvLyBpZiBhIHJvb20gb2JqZWN0IGlzIHByZXNlbnQuXG4gICAgLy8gaWUuIFRoZSBjb3JyZWN0IGxvZ2ljIGlzOlxuICAgIC8vIGlmIChyb29tKSB7XG4gICAgLy8gICAgIGlmIChteU1lbWJlci5tZW1iZXJzaGlwID09ICdqb2luZWQnKSB7XG4gICAgLy8gICAgICAgICAvLyB1c2VyIGlzIGpvaW5lZCB0byB0aGUgcm9vbVxuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgLy8gTm90IGpvaW5lZFxuICAgIC8vICAgICB9XG4gICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgICAgaWYgKFJvb21WaWV3U3RvcmUuaXNKb2luaW5nKCkpIHtcbiAgICAvLyAgICAgICAgIC8vIHNob3cgc3Bpbm5lclxuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgLy8gc2hvdyBqb2luIHByb21wdFxuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIHB1YmxpYyBpc0pvaW5pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmpvaW5pbmc7XG4gICAgfVxuXG4gICAgLy8gQW55IGVycm9yIHRoYXQgaGFzIG9jY3VycmVkIGR1cmluZyBqb2luaW5nXG4gICAgcHVibGljIGdldEpvaW5FcnJvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuam9pbkVycm9yO1xuICAgIH1cblxuICAgIC8vIFRoZSBteEV2ZW50IGlmIG9uZSBpcyBhYm91dCB0byBiZSBmb3J3YXJkZWRcbiAgICBwdWJsaWMgZ2V0Rm9yd2FyZGluZ0V2ZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5mb3J3YXJkaW5nRXZlbnQ7XG4gICAgfVxuXG4gICAgLy8gVGhlIG14RXZlbnQgaWYgb25lIGlzIGN1cnJlbnRseSBiZWluZyByZXBsaWVkIHRvL3F1b3RlZFxuICAgIHB1YmxpYyBnZXRRdW90aW5nRXZlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJlcGx5aW5nVG9FdmVudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvdWxkUGVlaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc2hvdWxkUGVlaztcbiAgICB9XG59XG5cbmxldCBzaW5nbGV0b25Sb29tVmlld1N0b3JlID0gbnVsbDtcbmlmICghc2luZ2xldG9uUm9vbVZpZXdTdG9yZSkge1xuICAgIHNpbmdsZXRvblJvb21WaWV3U3RvcmUgPSBuZXcgUm9vbVZpZXdTdG9yZSgpO1xufVxuZXhwb3J0IGRlZmF1bHQgc2luZ2xldG9uUm9vbVZpZXdTdG9yZTtcbiJdfQ==