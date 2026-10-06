"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRoom;
exports.findDMForUser = findDMForUser;
exports._waitForMember = _waitForMember;
exports.canEncryptToAllUsers = canEncryptToAllUsers;
exports.ensureVirtualRoomExists = ensureVirtualRoomExists;
exports.ensureDMExists = ensureDMExists;
exports.privateShouldBeEncrypted = privateShouldBeEncrypted;
exports.Preset = void 0;

var _event2 = require("matrix-js-sdk/src/@types/event");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _Modal = _interopRequireDefault(require("./Modal"));

var sdk = _interopRequireWildcard(require("./index"));

var _languageHandler = require("./languageHandler");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var Rooms = _interopRequireWildcard(require("./Rooms"));

var _DMRoomMap = _interopRequireDefault(require("./utils/DMRoomMap"));

var _UserAddress = require("./UserAddress");

var _WellKnownUtils = require("./utils/WellKnownUtils");

var _GroupStore = _interopRequireDefault(require("./stores/GroupStore"));

var _CountlyAnalytics = _interopRequireDefault(require("./CountlyAnalytics"));

var _membership = require("./utils/membership");

var _CallHandler = require("./CallHandler");

var _SpaceStore = _interopRequireDefault(require("./stores/SpaceStore"));

var _space = require("./utils/space");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
// we define a number of interfaces which take their names from the js-sdk

/* eslint-disable camelcase */
// TODO move these interfaces over to js-sdk once it has been typescripted enough to accept them
var Visibility;

(function (Visibility) {
  Visibility["Public"] = "public";
  Visibility["Private"] = "private";
})(Visibility || (Visibility = {}));

let Preset;
exports.Preset = Preset;

(function (Preset) {
  Preset["PrivateChat"] = "private_chat";
  Preset["TrustedPrivateChat"] = "trusted_private_chat";
  Preset["PublicChat"] = "public_chat";
})(Preset || (exports.Preset = Preset = {}));
/*:: export interface IStateEvent {
    type: string;
    state_key?: string; // defaults to an empty string
    content: object;
}*/

/*:: export interface IOpts {
    dmUserId?: string;
    createOpts?: ICreateOpts;
    spinner?: boolean;
    guestAccess?: boolean;
    encryption?: boolean;
    inlineErrors?: boolean;
    andView?: boolean;
    associatedWithCommunity?: string;
    parentSpace?: Room;
}*/

/*:: export interface IInvite3PID {
    id_server: string,
    medium: 'email',
    address: string,
}*/


/**
 * Create a new room, and switch to it.
 *
 * @param {object=} opts parameters for creating the room
 * @param {string=} opts.dmUserId If specified, make this a DM room for this user and invite them
 * @param {object=} opts.createOpts set of options to pass to createRoom call.
 * @param {bool=} opts.spinner True to show a modal spinner while the room is created.
 *     Default: True
 * @param {bool=} opts.guestAccess Whether to enable guest access.
 *     Default: True
 * @param {bool=} opts.encryption Whether to enable encryption.
 *     Default: False
 * @param {bool=} opts.inlineErrors True to raise errors off the promise instead of resolving to null.
 *     Default: False
 * @param {bool=} opts.andView True to dispatch an action to view the room once it has been created.
 *
 * @returns {Promise} which resolves to the room id, or null if the
 * action was aborted or failed.
 */
function createRoom(opts
/*: IOpts*/
)
/*: Promise<string | null>*/
{
  opts = opts || {};
  if (opts.spinner === undefined) opts.spinner = true;
  if (opts.guestAccess === undefined) opts.guestAccess = true;
  if (opts.encryption === undefined) opts.encryption = false;

  const startTime = _CountlyAnalytics.default.getTimestamp();

  const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
  const Loader = sdk.getComponent("elements.Spinner");

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (client.isGuest()) {
    _dispatcher.default.dispatch({
      action: 'require_registration'
    });

    return Promise.resolve(null);
  }

  const defaultPreset = opts.dmUserId ? Preset.TrustedPrivateChat : Preset.PrivateChat; // set some defaults for the creation

  const createOpts = opts.createOpts || {};
  createOpts.preset = createOpts.preset || defaultPreset;
  createOpts.visibility = createOpts.visibility || Visibility.Private;

  if (opts.dmUserId && createOpts.invite === undefined) {
    switch ((0, _UserAddress.getAddressType)(opts.dmUserId)) {
      case 'mx-user-id':
        createOpts.invite = [opts.dmUserId];
        break;

      case 'email':
        createOpts.invite_3pid = [{
          id_server: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(true),
          medium: 'email',
          address: opts.dmUserId
        }];
    }
  }

  if (opts.dmUserId && createOpts.is_direct === undefined) {
    createOpts.is_direct = true;
  } // By default, view the room after creating it


  if (opts.andView === undefined) {
    opts.andView = true;
  }

  createOpts.initial_state = createOpts.initial_state || []; // Allow guests by default since the room is private and they'd
  // need an invite. This means clicking on a 3pid invite email can
  // actually drop you right in to a chat.

  if (opts.guestAccess) {
    createOpts.initial_state.push({
      type: 'm.room.guest_access',
      state_key: '',
      content: {
        guest_access: 'can_join'
      }
    });
  }

  if (opts.encryption) {
    createOpts.initial_state.push({
      type: 'm.room.encryption',
      state_key: '',
      content: {
        algorithm: 'm.megolm.v1.aes-sha2'
      }
    });
  }

  if (opts.parentSpace) {
    opts.createOpts.initial_state.push((0, _space.makeSpaceParentEvent)(opts.parentSpace, true));
    opts.createOpts.initial_state.push({
      type: _event2.EventType.RoomHistoryVisibility,
      content: {
        "history_visibility": opts.createOpts.preset === Preset.PublicChat ? "world_readable" : "invited"
      }
    });
  }

  let modal;
  if (opts.spinner) modal = _Modal.default.createDialog(Loader, null, 'mx_Dialog_spinner');
  let roomId;
  return client.createRoom(createOpts).finally(function () {
    if (modal) modal.close();
  }).then(function (res) {
    roomId = res.room_id;

    if (opts.dmUserId) {
      return Rooms.setDMRoom(roomId, opts.dmUserId);
    } else {
      return Promise.resolve();
    }
  }).then(() => {
    if (opts.parentSpace) {
      return _SpaceStore.default.instance.addRoomToSpace(opts.parentSpace, roomId, [client.getDomain()], true);
    }

    if (opts.associatedWithCommunity) {
      return _GroupStore.default.addRoomToGroup(opts.associatedWithCommunity, roomId, false);
    }
  }).then(function () {
    // NB createRoom doesn't block on the client seeing the echo that the
    // room has been created, so we race here with the client knowing that
    // the room exists, causing things like
    // https://github.com/vector-im/vector-web/issues/1813
    // Even if we were to block on the echo, servers tend to split the room
    // state over multiple syncs so we can't atomically know when we have the
    // entire thing.
    if (opts.andView) {
      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: roomId,
        should_peek: false,
        // Creating a room will have joined us to the room,
        // so we are expecting the room to come down the sync
        // stream, if it hasn't already.
        joining: true,
        justCreatedOpts: opts
      });
    }

    _CountlyAnalytics.default.instance.trackRoomCreate(startTime, roomId);

    return roomId;
  }, function (err) {
    // Raise the error if the caller requested that we do so.
    if (opts.inlineErrors) throw err; // We also failed to join the room (this sets joining to false in RoomViewStore)

    _dispatcher.default.dispatch({
      action: 'join_room_error'
    });

    console.error("Failed to create room " + roomId + " " + err);
    let description = (0, _languageHandler._t)("Server may be unavailable, overloaded, or you hit a bug.");

    if (err.errcode === "M_UNSUPPORTED_ROOM_VERSION") {
      // Technically not possible with the UI as of April 2019 because there's no
      // options for the user to change this. However, it's not a bad thing to report
      // the error to the user for if/when the UI is available.
      description = (0, _languageHandler._t)("The server does not support the room version specified.");
    }

    _Modal.default.createTrackedDialog('Failure to create room', '', ErrorDialog, {
      title: (0, _languageHandler._t)("Failure to create room"),
      description
    });

    return null;
  });
}

function findDMForUser(client
/*: MatrixClient*/
, userId
/*: string*/
)
/*: Room*/
{
  const roomIds = _DMRoomMap.default.shared().getDMRoomsForUserId(userId);

  const rooms = roomIds.map(id => client.getRoom(id));
  const suitableDMRooms = rooms.filter(r => {
    // Validate that we are joined and the other person is also joined. We'll also make sure
    // that the room also looks like a DM (until we have canonical DMs to tell us). For now,
    // a DM is a room of two people that contains those two people exactly. This does mean
    // that bots, assistants, etc will ruin a room's DM-ness, though this is a problem for
    // canonical DMs to solve.
    if (r && r.getMyMembership() === "join") {
      const members = r.currentState.getMembers();
      const joinedMembers = members.filter(m => (0, _membership.isJoinedOrNearlyJoined)(m.membership));
      const otherMember = joinedMembers.find(m => m.userId === userId);
      return otherMember && joinedMembers.length === 2;
    }

    return false;
  }).sort((r1, r2) => {
    return r2.getLastActiveTimestamp() - r1.getLastActiveTimestamp();
  });

  if (suitableDMRooms.length) {
    return suitableDMRooms[0];
  }
}
/*
 * Try to ensure the user is already in the megolm session before continuing
 * NOTE: this assumes you've just created the room and there's not been an opportunity
 * for other code to run, so we shouldn't miss RoomState.newMember when it comes by.
 */


async function _waitForMember(client
/*: MatrixClient*/
, roomId
/*: string*/
, userId
/*: string*/
, opts = {
  timeout: 1500
}) {
  const {
    timeout
  } = opts;
  let handler;
  return new Promise(resolve => {
    handler = function (_event, _roomstate, member) {
      if (member.userId !== userId) return;
      if (member.roomId !== roomId) return;
      resolve(true);
    };

    client.on("RoomState.newMember", handler);
    /* We don't want to hang if this goes wrong, so we proceed and hope the other
       user is already in the megolm session */

    setTimeout(resolve, timeout, false);
  }).finally(() => {
    client.removeListener("RoomState.newMember", handler);
  });
}
/*
 * Ensure that for every user in a room, there is at least one device that we
 * can encrypt to.
 */


async function canEncryptToAllUsers(client
/*: MatrixClient*/
, userIds
/*: string[]*/
) {
  try {
    const usersDeviceMap = await client.downloadKeys(userIds); // { "@user:host": { "DEVICE": {...}, ... }, ... }

    return Object.values(usersDeviceMap).every(userDevices => // { "DEVICE": {...}, ... }
    Object.keys(userDevices).length > 0);
  } catch (e) {
    console.error("Error determining if it's possible to encrypt to all users: ", e);
    return false; // assume not
  }
} // Similar to ensureDMExists but also adds creation content
// without polluting ensureDMExists with unrelated stuff (also
// they're never encrypted).


async function ensureVirtualRoomExists(client
/*: MatrixClient*/
, userId
/*: string*/
, nativeRoomId
/*: string*/
)
/*: Promise<string>*/
{
  const existingDMRoom = findDMForUser(client, userId);
  let roomId;

  if (existingDMRoom) {
    roomId = existingDMRoom.roomId;
  } else {
    roomId = await createRoom({
      dmUserId: userId,
      spinner: false,
      andView: false,
      createOpts: {
        creation_content: {
          // This allows us to recognise that the room is a virtual room
          // when it comes down our sync stream (we also put the ID of the
          // respective native room in there because why not?)
          [_CallHandler.VIRTUAL_ROOM_EVENT_TYPE]: nativeRoomId
        }
      }
    });
  }

  return roomId;
}

async function ensureDMExists(client
/*: MatrixClient*/
, userId
/*: string*/
)
/*: Promise<string>*/
{
  const existingDMRoom = findDMForUser(client, userId);
  let roomId;

  if (existingDMRoom) {
    roomId = existingDMRoom.roomId;
  } else {
    let encryption
    /*: boolean*/
    = undefined;

    if (privateShouldBeEncrypted()) {
      encryption = await canEncryptToAllUsers(client, [userId]);
    }

    roomId = await createRoom({
      encryption,
      dmUserId: userId,
      spinner: false,
      andView: false
    });
    await _waitForMember(client, roomId, userId);
  }

  return roomId;
}

function privateShouldBeEncrypted()
/*: boolean*/
{
  const e2eeWellKnown = (0, _WellKnownUtils.getE2EEWellKnown)();

  if (e2eeWellKnown) {
    const defaultDisabled = e2eeWellKnown["default"] === false;
    return !defaultDisabled;
  }

  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jcmVhdGVSb29tLnRzIl0sIm5hbWVzIjpbIlZpc2liaWxpdHkiLCJQcmVzZXQiLCJjcmVhdGVSb29tIiwib3B0cyIsInNwaW5uZXIiLCJ1bmRlZmluZWQiLCJndWVzdEFjY2VzcyIsImVuY3J5cHRpb24iLCJzdGFydFRpbWUiLCJDb3VudGx5QW5hbHl0aWNzIiwiZ2V0VGltZXN0YW1wIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJMb2FkZXIiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc0d1ZXN0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsImRlZmF1bHRQcmVzZXQiLCJkbVVzZXJJZCIsIlRydXN0ZWRQcml2YXRlQ2hhdCIsIlByaXZhdGVDaGF0IiwiY3JlYXRlT3B0cyIsInByZXNldCIsInZpc2liaWxpdHkiLCJQcml2YXRlIiwiaW52aXRlIiwiaW52aXRlXzNwaWQiLCJpZF9zZXJ2ZXIiLCJnZXRJZGVudGl0eVNlcnZlclVybCIsIm1lZGl1bSIsImFkZHJlc3MiLCJpc19kaXJlY3QiLCJhbmRWaWV3IiwiaW5pdGlhbF9zdGF0ZSIsInB1c2giLCJ0eXBlIiwic3RhdGVfa2V5IiwiY29udGVudCIsImd1ZXN0X2FjY2VzcyIsImFsZ29yaXRobSIsInBhcmVudFNwYWNlIiwiRXZlbnRUeXBlIiwiUm9vbUhpc3RvcnlWaXNpYmlsaXR5IiwiUHVibGljQ2hhdCIsIm1vZGFsIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJyb29tSWQiLCJmaW5hbGx5IiwiY2xvc2UiLCJ0aGVuIiwicmVzIiwicm9vbV9pZCIsIlJvb21zIiwic2V0RE1Sb29tIiwiU3BhY2VTdG9yZSIsImluc3RhbmNlIiwiYWRkUm9vbVRvU3BhY2UiLCJnZXREb21haW4iLCJhc3NvY2lhdGVkV2l0aENvbW11bml0eSIsIkdyb3VwU3RvcmUiLCJhZGRSb29tVG9Hcm91cCIsInNob3VsZF9wZWVrIiwiam9pbmluZyIsImp1c3RDcmVhdGVkT3B0cyIsInRyYWNrUm9vbUNyZWF0ZSIsImVyciIsImlubGluZUVycm9ycyIsImNvbnNvbGUiLCJlcnJvciIsImRlc2NyaXB0aW9uIiwiZXJyY29kZSIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImZpbmRETUZvclVzZXIiLCJ1c2VySWQiLCJyb29tSWRzIiwiRE1Sb29tTWFwIiwic2hhcmVkIiwiZ2V0RE1Sb29tc0ZvclVzZXJJZCIsInJvb21zIiwibWFwIiwiaWQiLCJnZXRSb29tIiwic3VpdGFibGVETVJvb21zIiwiZmlsdGVyIiwiciIsImdldE15TWVtYmVyc2hpcCIsIm1lbWJlcnMiLCJjdXJyZW50U3RhdGUiLCJnZXRNZW1iZXJzIiwiam9pbmVkTWVtYmVycyIsIm0iLCJtZW1iZXJzaGlwIiwib3RoZXJNZW1iZXIiLCJmaW5kIiwibGVuZ3RoIiwic29ydCIsInIxIiwicjIiLCJnZXRMYXN0QWN0aXZlVGltZXN0YW1wIiwiX3dhaXRGb3JNZW1iZXIiLCJ0aW1lb3V0IiwiaGFuZGxlciIsIl9ldmVudCIsIl9yb29tc3RhdGUiLCJtZW1iZXIiLCJvbiIsInNldFRpbWVvdXQiLCJyZW1vdmVMaXN0ZW5lciIsImNhbkVuY3J5cHRUb0FsbFVzZXJzIiwidXNlcklkcyIsInVzZXJzRGV2aWNlTWFwIiwiZG93bmxvYWRLZXlzIiwiT2JqZWN0IiwidmFsdWVzIiwiZXZlcnkiLCJ1c2VyRGV2aWNlcyIsImtleXMiLCJlIiwiZW5zdXJlVmlydHVhbFJvb21FeGlzdHMiLCJuYXRpdmVSb29tSWQiLCJleGlzdGluZ0RNUm9vbSIsImNyZWF0aW9uX2NvbnRlbnQiLCJWSVJUVUFMX1JPT01fRVZFTlRfVFlQRSIsImVuc3VyZURNRXhpc3RzIiwicHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkIiwiZTJlZVdlbGxLbm93biIsImRlZmF1bHREaXNhYmxlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztB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NSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCAqIGFzIFJvb21zIGZyb20gXCIuL1Jvb21zXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuL3V0aWxzL0RNUm9vbU1hcFwiO1xuaW1wb3J0IHsgZ2V0QWRkcmVzc1R5cGUgfSBmcm9tIFwiLi9Vc2VyQWRkcmVzc1wiO1xuaW1wb3J0IHsgZ2V0RTJFRVdlbGxLbm93biB9IGZyb20gXCIuL3V0aWxzL1dlbGxLbm93blV0aWxzXCI7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tIFwiLi9zdG9yZXMvR3JvdXBTdG9yZVwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHsgaXNKb2luZWRPck5lYXJseUpvaW5lZCB9IGZyb20gXCIuL3V0aWxzL21lbWJlcnNoaXBcIjtcbmltcG9ydCB7IFZJUlRVQUxfUk9PTV9FVkVOVF9UWVBFIH0gZnJvbSBcIi4vQ2FsbEhhbmRsZXJcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuL3N0b3Jlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQgeyBtYWtlU3BhY2VQYXJlbnRFdmVudCB9IGZyb20gXCIuL3V0aWxzL3NwYWNlXCI7XG5cbi8vIHdlIGRlZmluZSBhIG51bWJlciBvZiBpbnRlcmZhY2VzIHdoaWNoIHRha2UgdGhlaXIgbmFtZXMgZnJvbSB0aGUganMtc2RrXG4vKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cblxuLy8gVE9ETyBtb3ZlIHRoZXNlIGludGVyZmFjZXMgb3ZlciB0byBqcy1zZGsgb25jZSBpdCBoYXMgYmVlbiB0eXBlc2NyaXB0ZWQgZW5vdWdoIHRvIGFjY2VwdCB0aGVtXG5lbnVtIFZpc2liaWxpdHkge1xuICAgIFB1YmxpYyA9IFwicHVibGljXCIsXG4gICAgUHJpdmF0ZSA9IFwicHJpdmF0ZVwiLFxufVxuXG5leHBvcnQgZW51bSBQcmVzZXQge1xuICAgIFByaXZhdGVDaGF0ID0gXCJwcml2YXRlX2NoYXRcIixcbiAgICBUcnVzdGVkUHJpdmF0ZUNoYXQgPSBcInRydXN0ZWRfcHJpdmF0ZV9jaGF0XCIsXG4gICAgUHVibGljQ2hhdCA9IFwicHVibGljX2NoYXRcIixcbn1cblxuaW50ZXJmYWNlIEludml0ZTNQSUQge1xuICAgIGlkX3NlcnZlcjogc3RyaW5nO1xuICAgIGlkX2FjY2Vzc190b2tlbj86IHN0cmluZzsgLy8gdGhpcyBnZXRzIGluamVjdGVkIGJ5IHRoZSBqcy1zZGtcbiAgICBtZWRpdW06IHN0cmluZztcbiAgICBhZGRyZXNzOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVN0YXRlRXZlbnQge1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBzdGF0ZV9rZXk/OiBzdHJpbmc7IC8vIGRlZmF1bHRzIHRvIGFuIGVtcHR5IHN0cmluZ1xuICAgIGNvbnRlbnQ6IG9iamVjdDtcbn1cblxuaW50ZXJmYWNlIElDcmVhdGVPcHRzIHtcbiAgICB2aXNpYmlsaXR5PzogVmlzaWJpbGl0eTtcbiAgICByb29tX2FsaWFzX25hbWU/OiBzdHJpbmc7XG4gICAgbmFtZT86IHN0cmluZztcbiAgICB0b3BpYz86IHN0cmluZztcbiAgICBpbnZpdGU/OiBzdHJpbmdbXTtcbiAgICBpbnZpdGVfM3BpZD86IEludml0ZTNQSURbXTtcbiAgICByb29tX3ZlcnNpb24/OiBzdHJpbmc7XG4gICAgY3JlYXRpb25fY29udGVudD86IG9iamVjdDtcbiAgICBpbml0aWFsX3N0YXRlPzogSVN0YXRlRXZlbnRbXTtcbiAgICBwcmVzZXQ/OiBQcmVzZXQ7XG4gICAgaXNfZGlyZWN0PzogYm9vbGVhbjtcbiAgICBwb3dlcl9sZXZlbF9jb250ZW50X292ZXJyaWRlPzogb2JqZWN0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElPcHRzIHtcbiAgICBkbVVzZXJJZD86IHN0cmluZztcbiAgICBjcmVhdGVPcHRzPzogSUNyZWF0ZU9wdHM7XG4gICAgc3Bpbm5lcj86IGJvb2xlYW47XG4gICAgZ3Vlc3RBY2Nlc3M/OiBib29sZWFuO1xuICAgIGVuY3J5cHRpb24/OiBib29sZWFuO1xuICAgIGlubGluZUVycm9ycz86IGJvb2xlYW47XG4gICAgYW5kVmlldz86IGJvb2xlYW47XG4gICAgYXNzb2NpYXRlZFdpdGhDb21tdW5pdHk/OiBzdHJpbmc7XG4gICAgcGFyZW50U3BhY2U/OiBSb29tO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElJbnZpdGUzUElEIHtcbiAgICBpZF9zZXJ2ZXI6IHN0cmluZyxcbiAgICBtZWRpdW06ICdlbWFpbCcsXG4gICAgYWRkcmVzczogc3RyaW5nLFxufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyByb29tLCBhbmQgc3dpdGNoIHRvIGl0LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0cyBwYXJhbWV0ZXJzIGZvciBjcmVhdGluZyB0aGUgcm9vbVxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRzLmRtVXNlcklkIElmIHNwZWNpZmllZCwgbWFrZSB0aGlzIGEgRE0gcm9vbSBmb3IgdGhpcyB1c2VyIGFuZCBpbnZpdGUgdGhlbVxuICogQHBhcmFtIHtvYmplY3Q9fSBvcHRzLmNyZWF0ZU9wdHMgc2V0IG9mIG9wdGlvbnMgdG8gcGFzcyB0byBjcmVhdGVSb29tIGNhbGwuXG4gKiBAcGFyYW0ge2Jvb2w9fSBvcHRzLnNwaW5uZXIgVHJ1ZSB0byBzaG93IGEgbW9kYWwgc3Bpbm5lciB3aGlsZSB0aGUgcm9vbSBpcyBjcmVhdGVkLlxuICogICAgIERlZmF1bHQ6IFRydWVcbiAqIEBwYXJhbSB7Ym9vbD19IG9wdHMuZ3Vlc3RBY2Nlc3MgV2hldGhlciB0byBlbmFibGUgZ3Vlc3QgYWNjZXNzLlxuICogICAgIERlZmF1bHQ6IFRydWVcbiAqIEBwYXJhbSB7Ym9vbD19IG9wdHMuZW5jcnlwdGlvbiBXaGV0aGVyIHRvIGVuYWJsZSBlbmNyeXB0aW9uLlxuICogICAgIERlZmF1bHQ6IEZhbHNlXG4gKiBAcGFyYW0ge2Jvb2w9fSBvcHRzLmlubGluZUVycm9ycyBUcnVlIHRvIHJhaXNlIGVycm9ycyBvZmYgdGhlIHByb21pc2UgaW5zdGVhZCBvZiByZXNvbHZpbmcgdG8gbnVsbC5cbiAqICAgICBEZWZhdWx0OiBGYWxzZVxuICogQHBhcmFtIHtib29sPX0gb3B0cy5hbmRWaWV3IFRydWUgdG8gZGlzcGF0Y2ggYW4gYWN0aW9uIHRvIHZpZXcgdGhlIHJvb20gb25jZSBpdCBoYXMgYmVlbiBjcmVhdGVkLlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSB3aGljaCByZXNvbHZlcyB0byB0aGUgcm9vbSBpZCwgb3IgbnVsbCBpZiB0aGVcbiAqIGFjdGlvbiB3YXMgYWJvcnRlZCBvciBmYWlsZWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVJvb20ob3B0czogSU9wdHMpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICBpZiAob3B0cy5zcGlubmVyID09PSB1bmRlZmluZWQpIG9wdHMuc3Bpbm5lciA9IHRydWU7XG4gICAgaWYgKG9wdHMuZ3Vlc3RBY2Nlc3MgPT09IHVuZGVmaW5lZCkgb3B0cy5ndWVzdEFjY2VzcyA9IHRydWU7XG4gICAgaWYgKG9wdHMuZW5jcnlwdGlvbiA9PT0gdW5kZWZpbmVkKSBvcHRzLmVuY3J5cHRpb24gPSBmYWxzZTtcblxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCk7XG5cbiAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuXG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGlmIChjbGllbnQuaXNHdWVzdCgpKSB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdFByZXNldCA9IG9wdHMuZG1Vc2VySWQgPyBQcmVzZXQuVHJ1c3RlZFByaXZhdGVDaGF0IDogUHJlc2V0LlByaXZhdGVDaGF0O1xuXG4gICAgLy8gc2V0IHNvbWUgZGVmYXVsdHMgZm9yIHRoZSBjcmVhdGlvblxuICAgIGNvbnN0IGNyZWF0ZU9wdHMgPSBvcHRzLmNyZWF0ZU9wdHMgfHwge307XG4gICAgY3JlYXRlT3B0cy5wcmVzZXQgPSBjcmVhdGVPcHRzLnByZXNldCB8fCBkZWZhdWx0UHJlc2V0O1xuICAgIGNyZWF0ZU9wdHMudmlzaWJpbGl0eSA9IGNyZWF0ZU9wdHMudmlzaWJpbGl0eSB8fCBWaXNpYmlsaXR5LlByaXZhdGU7XG4gICAgaWYgKG9wdHMuZG1Vc2VySWQgJiYgY3JlYXRlT3B0cy5pbnZpdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2ggKGdldEFkZHJlc3NUeXBlKG9wdHMuZG1Vc2VySWQpKSB7XG4gICAgICAgICAgICBjYXNlICdteC11c2VyLWlkJzpcbiAgICAgICAgICAgICAgICBjcmVhdGVPcHRzLmludml0ZSA9IFtvcHRzLmRtVXNlcklkXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgICAgICAgICBjcmVhdGVPcHRzLmludml0ZV8zcGlkID0gW3tcbiAgICAgICAgICAgICAgICAgICAgaWRfc2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgIG1lZGl1bTogJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogb3B0cy5kbVVzZXJJZCxcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0cy5kbVVzZXJJZCAmJiBjcmVhdGVPcHRzLmlzX2RpcmVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNyZWF0ZU9wdHMuaXNfZGlyZWN0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBCeSBkZWZhdWx0LCB2aWV3IHRoZSByb29tIGFmdGVyIGNyZWF0aW5nIGl0XG4gICAgaWYgKG9wdHMuYW5kVmlldyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9wdHMuYW5kVmlldyA9IHRydWU7XG4gICAgfVxuXG4gICAgY3JlYXRlT3B0cy5pbml0aWFsX3N0YXRlID0gY3JlYXRlT3B0cy5pbml0aWFsX3N0YXRlIHx8IFtdO1xuXG4gICAgLy8gQWxsb3cgZ3Vlc3RzIGJ5IGRlZmF1bHQgc2luY2UgdGhlIHJvb20gaXMgcHJpdmF0ZSBhbmQgdGhleSdkXG4gICAgLy8gbmVlZCBhbiBpbnZpdGUuIFRoaXMgbWVhbnMgY2xpY2tpbmcgb24gYSAzcGlkIGludml0ZSBlbWFpbCBjYW5cbiAgICAvLyBhY3R1YWxseSBkcm9wIHlvdSByaWdodCBpbiB0byBhIGNoYXQuXG4gICAgaWYgKG9wdHMuZ3Vlc3RBY2Nlc3MpIHtcbiAgICAgICAgY3JlYXRlT3B0cy5pbml0aWFsX3N0YXRlLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ20ucm9vbS5ndWVzdF9hY2Nlc3MnLFxuICAgICAgICAgICAgc3RhdGVfa2V5OiAnJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgICBndWVzdF9hY2Nlc3M6ICdjYW5fam9pbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5lbmNyeXB0aW9uKSB7XG4gICAgICAgIGNyZWF0ZU9wdHMuaW5pdGlhbF9zdGF0ZS5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdtLnJvb20uZW5jcnlwdGlvbicsXG4gICAgICAgICAgICBzdGF0ZV9rZXk6ICcnLFxuICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgIGFsZ29yaXRobTogJ20ubWVnb2xtLnYxLmFlcy1zaGEyJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvcHRzLnBhcmVudFNwYWNlKSB7XG4gICAgICAgIG9wdHMuY3JlYXRlT3B0cy5pbml0aWFsX3N0YXRlLnB1c2gobWFrZVNwYWNlUGFyZW50RXZlbnQob3B0cy5wYXJlbnRTcGFjZSwgdHJ1ZSkpO1xuICAgICAgICBvcHRzLmNyZWF0ZU9wdHMuaW5pdGlhbF9zdGF0ZS5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHksXG4gICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgXCJoaXN0b3J5X3Zpc2liaWxpdHlcIjogb3B0cy5jcmVhdGVPcHRzLnByZXNldCA9PT0gUHJlc2V0LlB1YmxpY0NoYXQgPyBcIndvcmxkX3JlYWRhYmxlXCIgOiBcImludml0ZWRcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCBtb2RhbDtcbiAgICBpZiAob3B0cy5zcGlubmVyKSBtb2RhbCA9IE1vZGFsLmNyZWF0ZURpYWxvZyhMb2FkZXIsIG51bGwsICdteF9EaWFsb2dfc3Bpbm5lcicpO1xuXG4gICAgbGV0IHJvb21JZDtcbiAgICByZXR1cm4gY2xpZW50LmNyZWF0ZVJvb20oY3JlYXRlT3B0cykuZmluYWxseShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKG1vZGFsKSBtb2RhbC5jbG9zZSgpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHJvb21JZCA9IHJlcy5yb29tX2lkO1xuICAgICAgICBpZiAob3B0cy5kbVVzZXJJZCkge1xuICAgICAgICAgICAgcmV0dXJuIFJvb21zLnNldERNUm9vbShyb29tSWQsIG9wdHMuZG1Vc2VySWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChvcHRzLnBhcmVudFNwYWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gU3BhY2VTdG9yZS5pbnN0YW5jZS5hZGRSb29tVG9TcGFjZShvcHRzLnBhcmVudFNwYWNlLCByb29tSWQsIFtjbGllbnQuZ2V0RG9tYWluKCldLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0cy5hc3NvY2lhdGVkV2l0aENvbW11bml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIEdyb3VwU3RvcmUuYWRkUm9vbVRvR3JvdXAob3B0cy5hc3NvY2lhdGVkV2l0aENvbW11bml0eSwgcm9vbUlkLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBOQiBjcmVhdGVSb29tIGRvZXNuJ3QgYmxvY2sgb24gdGhlIGNsaWVudCBzZWVpbmcgdGhlIGVjaG8gdGhhdCB0aGVcbiAgICAgICAgLy8gcm9vbSBoYXMgYmVlbiBjcmVhdGVkLCBzbyB3ZSByYWNlIGhlcmUgd2l0aCB0aGUgY2xpZW50IGtub3dpbmcgdGhhdFxuICAgICAgICAvLyB0aGUgcm9vbSBleGlzdHMsIGNhdXNpbmcgdGhpbmdzIGxpa2VcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS92ZWN0b3Itd2ViL2lzc3Vlcy8xODEzXG4gICAgICAgIC8vIEV2ZW4gaWYgd2Ugd2VyZSB0byBibG9jayBvbiB0aGUgZWNobywgc2VydmVycyB0ZW5kIHRvIHNwbGl0IHRoZSByb29tXG4gICAgICAgIC8vIHN0YXRlIG92ZXIgbXVsdGlwbGUgc3luY3Mgc28gd2UgY2FuJ3QgYXRvbWljYWxseSBrbm93IHdoZW4gd2UgaGF2ZSB0aGVcbiAgICAgICAgLy8gZW50aXJlIHRoaW5nLlxuICAgICAgICBpZiAob3B0cy5hbmRWaWV3KSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgIHNob3VsZF9wZWVrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGluZyBhIHJvb20gd2lsbCBoYXZlIGpvaW5lZCB1cyB0byB0aGUgcm9vbSxcbiAgICAgICAgICAgICAgICAvLyBzbyB3ZSBhcmUgZXhwZWN0aW5nIHRoZSByb29tIHRvIGNvbWUgZG93biB0aGUgc3luY1xuICAgICAgICAgICAgICAgIC8vIHN0cmVhbSwgaWYgaXQgaGFzbid0IGFscmVhZHkuXG4gICAgICAgICAgICAgICAgam9pbmluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBqdXN0Q3JlYXRlZE9wdHM6IG9wdHMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrUm9vbUNyZWF0ZShzdGFydFRpbWUsIHJvb21JZCk7XG4gICAgICAgIHJldHVybiByb29tSWQ7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIC8vIFJhaXNlIHRoZSBlcnJvciBpZiB0aGUgY2FsbGVyIHJlcXVlc3RlZCB0aGF0IHdlIGRvIHNvLlxuICAgICAgICBpZiAob3B0cy5pbmxpbmVFcnJvcnMpIHRocm93IGVycjtcblxuICAgICAgICAvLyBXZSBhbHNvIGZhaWxlZCB0byBqb2luIHRoZSByb29tICh0aGlzIHNldHMgam9pbmluZyB0byBmYWxzZSBpbiBSb29tVmlld1N0b3JlKVxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnam9pbl9yb29tX2Vycm9yJyxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIHJvb20gXCIgKyByb29tSWQgKyBcIiBcIiArIGVycik7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbiA9IF90KFwiU2VydmVyIG1heSBiZSB1bmF2YWlsYWJsZSwgb3ZlcmxvYWRlZCwgb3IgeW91IGhpdCBhIGJ1Zy5cIik7XG4gICAgICAgIGlmIChlcnIuZXJyY29kZSA9PT0gXCJNX1VOU1VQUE9SVEVEX1JPT01fVkVSU0lPTlwiKSB7XG4gICAgICAgICAgICAvLyBUZWNobmljYWxseSBub3QgcG9zc2libGUgd2l0aCB0aGUgVUkgYXMgb2YgQXByaWwgMjAxOSBiZWNhdXNlIHRoZXJlJ3Mgbm9cbiAgICAgICAgICAgIC8vIG9wdGlvbnMgZm9yIHRoZSB1c2VyIHRvIGNoYW5nZSB0aGlzLiBIb3dldmVyLCBpdCdzIG5vdCBhIGJhZCB0aGluZyB0byByZXBvcnRcbiAgICAgICAgICAgIC8vIHRoZSBlcnJvciB0byB0aGUgdXNlciBmb3IgaWYvd2hlbiB0aGUgVUkgaXMgYXZhaWxhYmxlLlxuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIlRoZSBzZXJ2ZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGUgcm9vbSB2ZXJzaW9uIHNwZWNpZmllZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbHVyZSB0byBjcmVhdGUgcm9vbScsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbHVyZSB0byBjcmVhdGUgcm9vbVwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRE1Gb3JVc2VyKGNsaWVudDogTWF0cml4Q2xpZW50LCB1c2VySWQ6IHN0cmluZyk6IFJvb20ge1xuICAgIGNvbnN0IHJvb21JZHMgPSBETVJvb21NYXAuc2hhcmVkKCkuZ2V0RE1Sb29tc0ZvclVzZXJJZCh1c2VySWQpO1xuICAgIGNvbnN0IHJvb21zID0gcm9vbUlkcy5tYXAoaWQgPT4gY2xpZW50LmdldFJvb20oaWQpKTtcbiAgICBjb25zdCBzdWl0YWJsZURNUm9vbXMgPSByb29tcy5maWx0ZXIociA9PiB7XG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgd2UgYXJlIGpvaW5lZCBhbmQgdGhlIG90aGVyIHBlcnNvbiBpcyBhbHNvIGpvaW5lZC4gV2UnbGwgYWxzbyBtYWtlIHN1cmVcbiAgICAgICAgLy8gdGhhdCB0aGUgcm9vbSBhbHNvIGxvb2tzIGxpa2UgYSBETSAodW50aWwgd2UgaGF2ZSBjYW5vbmljYWwgRE1zIHRvIHRlbGwgdXMpLiBGb3Igbm93LFxuICAgICAgICAvLyBhIERNIGlzIGEgcm9vbSBvZiB0d28gcGVvcGxlIHRoYXQgY29udGFpbnMgdGhvc2UgdHdvIHBlb3BsZSBleGFjdGx5LiBUaGlzIGRvZXMgbWVhblxuICAgICAgICAvLyB0aGF0IGJvdHMsIGFzc2lzdGFudHMsIGV0YyB3aWxsIHJ1aW4gYSByb29tJ3MgRE0tbmVzcywgdGhvdWdoIHRoaXMgaXMgYSBwcm9ibGVtIGZvclxuICAgICAgICAvLyBjYW5vbmljYWwgRE1zIHRvIHNvbHZlLlxuICAgICAgICBpZiAociAmJiByLmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgY29uc3QgbWVtYmVycyA9IHIuY3VycmVudFN0YXRlLmdldE1lbWJlcnMoKTtcbiAgICAgICAgICAgIGNvbnN0IGpvaW5lZE1lbWJlcnMgPSBtZW1iZXJzLmZpbHRlcihtID0+IGlzSm9pbmVkT3JOZWFybHlKb2luZWQobS5tZW1iZXJzaGlwKSk7XG4gICAgICAgICAgICBjb25zdCBvdGhlck1lbWJlciA9IGpvaW5lZE1lbWJlcnMuZmluZChtID0+IG0udXNlcklkID09PSB1c2VySWQpO1xuICAgICAgICAgICAgcmV0dXJuIG90aGVyTWVtYmVyICYmIGpvaW5lZE1lbWJlcnMubGVuZ3RoID09PSAyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KS5zb3J0KChyMSwgcjIpID0+IHtcbiAgICAgICAgcmV0dXJuIHIyLmdldExhc3RBY3RpdmVUaW1lc3RhbXAoKSAtXG4gICAgICAgICAgICByMS5nZXRMYXN0QWN0aXZlVGltZXN0YW1wKCk7XG4gICAgfSk7XG4gICAgaWYgKHN1aXRhYmxlRE1Sb29tcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN1aXRhYmxlRE1Sb29tc1swXTtcbiAgICB9XG59XG5cbi8qXG4gKiBUcnkgdG8gZW5zdXJlIHRoZSB1c2VyIGlzIGFscmVhZHkgaW4gdGhlIG1lZ29sbSBzZXNzaW9uIGJlZm9yZSBjb250aW51aW5nXG4gKiBOT1RFOiB0aGlzIGFzc3VtZXMgeW91J3ZlIGp1c3QgY3JlYXRlZCB0aGUgcm9vbSBhbmQgdGhlcmUncyBub3QgYmVlbiBhbiBvcHBvcnR1bml0eVxuICogZm9yIG90aGVyIGNvZGUgdG8gcnVuLCBzbyB3ZSBzaG91bGRuJ3QgbWlzcyBSb29tU3RhdGUubmV3TWVtYmVyIHdoZW4gaXQgY29tZXMgYnkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfd2FpdEZvck1lbWJlcihjbGllbnQ6IE1hdHJpeENsaWVudCwgcm9vbUlkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nLCBvcHRzID0geyB0aW1lb3V0OiAxNTAwIH0pIHtcbiAgICBjb25zdCB7IHRpbWVvdXQgfSA9IG9wdHM7XG4gICAgbGV0IGhhbmRsZXI7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGhhbmRsZXIgPSBmdW5jdGlvbihfZXZlbnQsIF9yb29tc3RhdGUsIG1lbWJlcikge1xuICAgICAgICAgICAgaWYgKG1lbWJlci51c2VySWQgIT09IHVzZXJJZCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKG1lbWJlci5yb29tSWQgIT09IHJvb21JZCkgcmV0dXJuO1xuICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgY2xpZW50Lm9uKFwiUm9vbVN0YXRlLm5ld01lbWJlclwiLCBoYW5kbGVyKTtcblxuICAgICAgICAvKiBXZSBkb24ndCB3YW50IHRvIGhhbmcgaWYgdGhpcyBnb2VzIHdyb25nLCBzbyB3ZSBwcm9jZWVkIGFuZCBob3BlIHRoZSBvdGhlclxuICAgICAgICAgICB1c2VyIGlzIGFscmVhZHkgaW4gdGhlIG1lZ29sbSBzZXNzaW9uICovXG4gICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZW91dCwgZmFsc2UpO1xuICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUubmV3TWVtYmVyXCIsIGhhbmRsZXIpO1xuICAgIH0pO1xufVxuXG4vKlxuICogRW5zdXJlIHRoYXQgZm9yIGV2ZXJ5IHVzZXIgaW4gYSByb29tLCB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZGV2aWNlIHRoYXQgd2VcbiAqIGNhbiBlbmNyeXB0IHRvLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FuRW5jcnlwdFRvQWxsVXNlcnMoY2xpZW50OiBNYXRyaXhDbGllbnQsIHVzZXJJZHM6IHN0cmluZ1tdKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdXNlcnNEZXZpY2VNYXAgPSBhd2FpdCBjbGllbnQuZG93bmxvYWRLZXlzKHVzZXJJZHMpO1xuICAgICAgICAvLyB7IFwiQHVzZXI6aG9zdFwiOiB7IFwiREVWSUNFXCI6IHsuLi59LCAuLi4gfSwgLi4uIH1cbiAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXModXNlcnNEZXZpY2VNYXApLmV2ZXJ5KCh1c2VyRGV2aWNlcykgPT5cbiAgICAgICAgICAgIC8vIHsgXCJERVZJQ0VcIjogey4uLn0sIC4uLiB9XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VyRGV2aWNlcykubGVuZ3RoID4gMCxcbiAgICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkZXRlcm1pbmluZyBpZiBpdCdzIHBvc3NpYmxlIHRvIGVuY3J5cHQgdG8gYWxsIHVzZXJzOiBcIiwgZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gYXNzdW1lIG5vdFxuICAgIH1cbn1cblxuLy8gU2ltaWxhciB0byBlbnN1cmVETUV4aXN0cyBidXQgYWxzbyBhZGRzIGNyZWF0aW9uIGNvbnRlbnRcbi8vIHdpdGhvdXQgcG9sbHV0aW5nIGVuc3VyZURNRXhpc3RzIHdpdGggdW5yZWxhdGVkIHN0dWZmIChhbHNvXG4vLyB0aGV5J3JlIG5ldmVyIGVuY3J5cHRlZCkuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlVmlydHVhbFJvb21FeGlzdHMoXG4gICAgY2xpZW50OiBNYXRyaXhDbGllbnQsIHVzZXJJZDogc3RyaW5nLCBuYXRpdmVSb29tSWQ6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZXhpc3RpbmdETVJvb20gPSBmaW5kRE1Gb3JVc2VyKGNsaWVudCwgdXNlcklkKTtcbiAgICBsZXQgcm9vbUlkO1xuICAgIGlmIChleGlzdGluZ0RNUm9vbSkge1xuICAgICAgICByb29tSWQgPSBleGlzdGluZ0RNUm9vbS5yb29tSWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vbUlkID0gYXdhaXQgY3JlYXRlUm9vbSh7XG4gICAgICAgICAgICBkbVVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgc3Bpbm5lcjogZmFsc2UsXG4gICAgICAgICAgICBhbmRWaWV3OiBmYWxzZSxcbiAgICAgICAgICAgIGNyZWF0ZU9wdHM6IHtcbiAgICAgICAgICAgICAgICBjcmVhdGlvbl9jb250ZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgYWxsb3dzIHVzIHRvIHJlY29nbmlzZSB0aGF0IHRoZSByb29tIGlzIGEgdmlydHVhbCByb29tXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gaXQgY29tZXMgZG93biBvdXIgc3luYyBzdHJlYW0gKHdlIGFsc28gcHV0IHRoZSBJRCBvZiB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVzcGVjdGl2ZSBuYXRpdmUgcm9vbSBpbiB0aGVyZSBiZWNhdXNlIHdoeSBub3Q/KVxuICAgICAgICAgICAgICAgICAgICBbVklSVFVBTF9ST09NX0VWRU5UX1RZUEVdOiBuYXRpdmVSb29tSWQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcm9vbUlkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5zdXJlRE1FeGlzdHMoY2xpZW50OiBNYXRyaXhDbGllbnQsIHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBleGlzdGluZ0RNUm9vbSA9IGZpbmRETUZvclVzZXIoY2xpZW50LCB1c2VySWQpO1xuICAgIGxldCByb29tSWQ7XG4gICAgaWYgKGV4aXN0aW5nRE1Sb29tKSB7XG4gICAgICAgIHJvb21JZCA9IGV4aXN0aW5nRE1Sb29tLnJvb21JZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZW5jcnlwdGlvbjogYm9vbGVhbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHByaXZhdGVTaG91bGRCZUVuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICBlbmNyeXB0aW9uID0gYXdhaXQgY2FuRW5jcnlwdFRvQWxsVXNlcnMoY2xpZW50LCBbdXNlcklkXSk7XG4gICAgICAgIH1cblxuICAgICAgICByb29tSWQgPSBhd2FpdCBjcmVhdGVSb29tKHtlbmNyeXB0aW9uLCBkbVVzZXJJZDogdXNlcklkLCBzcGlubmVyOiBmYWxzZSwgYW5kVmlldzogZmFsc2V9KTtcbiAgICAgICAgYXdhaXQgX3dhaXRGb3JNZW1iZXIoY2xpZW50LCByb29tSWQsIHVzZXJJZCk7XG4gICAgfVxuICAgIHJldHVybiByb29tSWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZTJlZVdlbGxLbm93biA9IGdldEUyRUVXZWxsS25vd24oKTtcbiAgICBpZiAoZTJlZVdlbGxLbm93bikge1xuICAgICAgICBjb25zdCBkZWZhdWx0RGlzYWJsZWQgPSBlMmVlV2VsbEtub3duW1wiZGVmYXVsdFwiXSA9PT0gZmFsc2U7XG4gICAgICAgIHJldHVybiAhZGVmYXVsdERpc2FibGVkO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==