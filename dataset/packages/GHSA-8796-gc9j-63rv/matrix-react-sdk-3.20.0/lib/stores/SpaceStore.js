"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SpaceStoreClass = exports.UPDATE_SELECTED_SPACE = exports.UPDATE_INVITED_SPACES = exports.UPDATE_TOP_LEVEL_SPACES = exports.SUGGESTED_ROOMS = exports.HOME_SPACE = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _event = require("matrix-js-sdk/src/@types/event");

var _AsyncStoreWithClient = require("./AsyncStoreWithClient");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _RoomListStore = _interopRequireDefault(require("./room-list/RoomListStore"));

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _DMRoomMap = _interopRequireDefault(require("../utils/DMRoomMap"));

var _SpaceNotificationState = require("./notifications/SpaceNotificationState");

var _RoomNotificationStateStore = require("./notifications/RoomNotificationStateStore");

var _models = require("./room-list/models");

var _maps = require("../utils/maps");

var _sets = require("../utils/sets");

var _objects = require("../utils/objects");

var _arrays = require("../utils/arrays");

var _RoomViewStore = _interopRequireDefault(require("./RoomViewStore"));

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const ACTIVE_SPACE_LS_KEY = "mx_active_space";
const HOME_SPACE = Symbol("home-space");
exports.HOME_SPACE = HOME_SPACE;
const SUGGESTED_ROOMS = Symbol("suggested-rooms");
exports.SUGGESTED_ROOMS = SUGGESTED_ROOMS;
const UPDATE_TOP_LEVEL_SPACES = Symbol("top-level-spaces");
exports.UPDATE_TOP_LEVEL_SPACES = UPDATE_TOP_LEVEL_SPACES;
const UPDATE_INVITED_SPACES = Symbol("invited-spaces");
exports.UPDATE_INVITED_SPACES = UPDATE_INVITED_SPACES;
const UPDATE_SELECTED_SPACE = Symbol("selected-space"); // Space Room ID/HOME_SPACE will be emitted when a Space's children change

exports.UPDATE_SELECTED_SPACE = UPDATE_SELECTED_SPACE;
const MAX_SUGGESTED_ROOMS = 20;

const getSpaceContextKey = (space
/*: Room*/
) => `mx_space_context_${space?.roomId || "home_space"}`;

const partitionSpacesAndRooms = (arr
/*: Room[]*/
) =>
/*: [Room[], Room[]]*/
{
  // [spaces, rooms]
  return arr.reduce((result, room
  /*: Room*/
  ) => {
    result[room.isSpaceRoom() ? 0 : 1].push(room);
    return result;
  }, [[], []]);
};

const getOrder = (ev
/*: MatrixEvent*/
) =>
/*: string | null*/
{
  const content = ev.getContent();

  if (typeof content.order === "string" && Array.from(content.order).every((c
  /*: string*/
  ) => {
    const charCode = c.charCodeAt(0);
    return charCode >= 0x20 && charCode <= 0x7F;
  })) {
    return content.order;
  }

  return null;
};

const getRoomFn
/*: FetchRoomFn*/
= (room
/*: Room*/
) => {
  return _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(room);
};

class SpaceStoreClass extends _AsyncStoreWithClient.AsyncStoreWithClient
/*:: <IState>*/
{
  constructor() {
    super(_dispatcher.default, {});
    (0, _defineProperty2.default)(this, "rootSpaces", []);
    (0, _defineProperty2.default)(this, "orphanedRooms", new Set());
    (0, _defineProperty2.default)(this, "parentMap", new _maps.EnhancedMap());
    (0, _defineProperty2.default)(this, "notificationStateMap", new Map());
    (0, _defineProperty2.default)(this, "spaceFilteredRooms", new Map());
    (0, _defineProperty2.default)(this, "_activeSpace", null);
    (0, _defineProperty2.default)(this, "_suggestedRooms", []);
    (0, _defineProperty2.default)(this, "_invitedSpaces", new Set());
    (0, _defineProperty2.default)(this, "fetchSuggestedRooms", async (space
    /*: Room*/
    , limit = MAX_SUGGESTED_ROOMS) => {
      try {
        const data
        /*: {
                        rooms: ISpaceSummaryRoom[];
                        events: ISpaceSummaryEvent[];
                    }*/
        = await this.matrixClient.getSpaceSummary(space.roomId, 0, true, false, limit);
        return data;
      } catch (e) {
        console.error(e);
      }

      return {
        rooms: [],
        events: []
      };
    });
    (0, _defineProperty2.default)(this, "getSpaceFilteredRoomIds", (space
    /*: Room | null*/
    ) =>
    /*: Set<string>*/
    {
      return this.spaceFilteredRooms.get(space?.roomId || HOME_SPACE) || new Set();
    });
    (0, _defineProperty2.default)(this, "rebuild", (0, _lodash.throttle)(() => {
      const [visibleSpaces, visibleRooms] = partitionSpacesAndRooms(this.matrixClient.getVisibleRooms());
      const [joinedSpaces, invitedSpaces] = visibleSpaces.reduce((arr, s) => {
        if (s.getMyMembership() === "join") {
          arr[0].push(s);
        } else if (s.getMyMembership() === "invite") {
          arr[1].push(s);
        }

        return arr;
      }, [[], []]); // exclude invited spaces from unseenChildren as they will be forcibly shown at the top level of the treeview

      const unseenChildren = new Set([...visibleRooms, ...joinedSpaces]);
      const backrefs = new _maps.EnhancedMap(); // Sort spaces by room ID to force the cycle breaking to be deterministic

      const spaces = (0, _lodash.sortBy)(joinedSpaces, space => space.roomId); // TODO handle cleaning up links when a Space is removed

      spaces.forEach(space => {
        const children = this.getChildren(space.roomId);
        children.forEach(child => {
          unseenChildren.delete(child);
          backrefs.getOrCreate(child.roomId, new Set()).add(space.roomId);
        });
      });
      const [rootSpaces, orphanedRooms] = partitionSpacesAndRooms(Array.from(unseenChildren)); // somewhat algorithm to handle full-cycles

      const detachedNodes = new Set(spaces);

      const markTreeChildren = (rootSpace
      /*: Room*/
      , unseen
      /*: Set<Room>*/
      ) => {
        const stack = [rootSpace];

        while (stack.length) {
          const op = stack.pop();
          unseen.delete(op);
          this.getChildSpaces(op.roomId).forEach(space => {
            if (unseen.has(space)) {
              stack.push(space);
            }
          });
        }
      };

      rootSpaces.forEach(rootSpace => {
        markTreeChildren(rootSpace, detachedNodes);
      }); // Handle spaces forming fully cyclical relationships.
      // In order, assume each detachedNode is a root unless it has already
      // been claimed as the child of prior detached node.
      // Work from a copy of the detachedNodes set as it will be mutated as part of this operation.

      Array.from(detachedNodes).forEach(detachedNode => {
        if (!detachedNodes.has(detachedNode)) return; // declare this detached node a new root, find its children, without ever looping back to it

        detachedNodes.delete(detachedNode);
        rootSpaces.push(detachedNode);
        markTreeChildren(detachedNode, detachedNodes); // TODO only consider a detached node a root space if it has no *parents other than the ones forming cycles
      }); // TODO neither of these handle an A->B->C->A with an additional C->D
      // detachedNodes.forEach(space => {
      //     rootSpaces.push(space);
      // });

      this.orphanedRooms = new Set(orphanedRooms);
      this.rootSpaces = rootSpaces;
      this.parentMap = backrefs; // if the currently selected space no longer exists, remove its selection

      if (this._activeSpace && detachedNodes.has(this._activeSpace)) {
        this.setActiveSpace(null);
      }

      this.onRoomsUpdate(); // TODO only do this if a change has happened

      this.emit(UPDATE_TOP_LEVEL_SPACES, this.spacePanelSpaces); // build initial state of invited spaces as we would have missed the emitted events about the room at launch

      this._invitedSpaces = new Set(invitedSpaces);
      this.emit(UPDATE_INVITED_SPACES, this.invitedSpaces);
    }, 100, {
      trailing: true,
      leading: true
    }));
    (0, _defineProperty2.default)(this, "onSpaceUpdate", () => {
      this.rebuild();
    });
    (0, _defineProperty2.default)(this, "showInHomeSpace", (room
    /*: Room*/
    ) => {
      if (room.isSpaceRoom()) return false;
      return !this.parentMap.get(room.roomId)?.size // put all orphaned rooms in the Home Space
      || _DMRoomMap.default.shared().getUserIdForRoomId(room.roomId) // put all DMs in the Home Space
      || _RoomListStore.default.instance.getTagsForRoom(room).includes(_models.DefaultTagID.Favourite); // show all favourites
    });
    (0, _defineProperty2.default)(this, "onRoomUpdate", (room
    /*: Room*/
    ) => {
      if (this.showInHomeSpace(room)) {
        this.spaceFilteredRooms.get(HOME_SPACE)?.add(room.roomId);
        this.emit(HOME_SPACE);
      } else if (!this.orphanedRooms.has(room.roomId)) {
        this.spaceFilteredRooms.get(HOME_SPACE)?.delete(room.roomId);
        this.emit(HOME_SPACE);
      }
    });
    (0, _defineProperty2.default)(this, "onSpaceMembersChange", (ev
    /*: MatrixEvent*/
    ) => {
      // skip this update if we do not have a DM with this user
      if (_DMRoomMap.default.shared().getDMRoomsForUserId(ev.getStateKey()).length < 1) return;
      this.onRoomsUpdate();
    });
    (0, _defineProperty2.default)(this, "onRoomsUpdate", (0, _lodash.throttle)(() => {
      // TODO resolve some updates as deltas
      const visibleRooms = this.matrixClient.getVisibleRooms();
      const oldFilteredRooms = this.spaceFilteredRooms;
      this.spaceFilteredRooms = new Map(); // put all room invites in the Home Space

      const invites = visibleRooms.filter(r => !r.isSpaceRoom() && r.getMyMembership() === "invite");
      this.spaceFilteredRooms.set(HOME_SPACE, new Set(invites.map(room => room.roomId)));
      visibleRooms.forEach(room => {
        if (this.showInHomeSpace(room)) {
          this.spaceFilteredRooms.get(HOME_SPACE).add(room.roomId);
        }
      });
      this.rootSpaces.forEach(s => {
        // traverse each space tree in DFS to build up the supersets as you go up,
        // reusing results from like subtrees.
        const fn = (spaceId
        /*: string*/
        , parentPath
        /*: Set<string>*/
        ) =>
        /*: Set<string>*/
        {
          if (parentPath.has(spaceId)) return; // prevent cycles
          // reuse existing results if multiple similar branches exist

          if (this.spaceFilteredRooms.has(spaceId)) {
            return this.spaceFilteredRooms.get(spaceId);
          }

          const [childSpaces, childRooms] = partitionSpacesAndRooms(this.getChildren(spaceId));
          const roomIds = new Set(childRooms.map(r => r.roomId));
          const space = this.matrixClient?.getRoom(spaceId); // Add relevant DMs

          space?.getJoinedMembers().forEach(member => {
            _DMRoomMap.default.shared().getDMRoomsForUserId(member.userId).forEach(roomId => {
              roomIds.add(roomId);
            });
          });
          const newPath = new Set(parentPath).add(spaceId);
          childSpaces.forEach(childSpace => {
            fn(childSpace.roomId, newPath)?.forEach(roomId => {
              roomIds.add(roomId);
            });
          });
          this.spaceFilteredRooms.set(spaceId, roomIds);
          return roomIds;
        };

        fn(s.roomId, new Set());
      });
      const diff = (0, _maps.mapDiff)(oldFilteredRooms, this.spaceFilteredRooms); // filter out keys which changed by reference only by checking whether the sets differ

      const changed = diff.changed.filter(k => (0, _sets.setHasDiff)(oldFilteredRooms.get(k), this.spaceFilteredRooms.get(k)));
      [...diff.added, ...diff.removed, ...changed].forEach(k => {
        this.emit(k);
      });
      this.spaceFilteredRooms.forEach((roomIds, s) => {
        // Update NotificationStates
        this.getNotificationState(s)?.setRooms(visibleRooms.filter(room => roomIds.has(room.roomId)));
      });
    }, 100, {
      trailing: true,
      leading: true
    }));
    (0, _defineProperty2.default)(this, "onRoom", (room
    /*: Room*/
    , newMembership
    /*: string*/
    , oldMembership
    /*: string*/
    ) => {
      const membership = newMembership || room.getMyMembership();

      if (!room.isSpaceRoom()) {
        // this.onRoomUpdate(room);
        this.onRoomsUpdate();

        if (membership === "join") {
          // the user just joined a room, remove it from the suggested list if it was there
          const numSuggestedRooms = this._suggestedRooms.length;
          this._suggestedRooms = this._suggestedRooms.filter(r => r.room_id !== room.roomId);

          if (numSuggestedRooms !== this._suggestedRooms.length) {
            this.emit(SUGGESTED_ROOMS, this._suggestedRooms);
          }
        }

        return;
      } // Space


      if (membership === "invite") {
        this._invitedSpaces.add(room);

        this.emit(UPDATE_INVITED_SPACES, this.invitedSpaces);
      } else if (oldMembership === "invite" && membership !== "join") {
        this._invitedSpaces.delete(room);

        this.emit(UPDATE_INVITED_SPACES, this.invitedSpaces);
      } else {
        this.onSpaceUpdate();
        this.emit(room.roomId);
      }

      if (membership === "join" && room.roomId === _RoomViewStore.default.getRoomId()) {
        // if the user was looking at the space and then joined: select that space
        this.setActiveSpace(room);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomState", (ev
    /*: MatrixEvent*/
    ) => {
      const room = this.matrixClient.getRoom(ev.getRoomId());
      if (!room) return;

      switch (ev.getType()) {
        case _event.EventType.SpaceChild:
          if (room.isSpaceRoom()) {
            this.onSpaceUpdate();
            this.emit(room.roomId);
          }

          break;

        case _event.EventType.SpaceParent:
          // TODO rebuild the space parent and not the room - check permissions?
          // TODO confirm this after implementing parenting behaviour
          if (room.isSpaceRoom()) {
            this.onSpaceUpdate();
          } else {
            this.onRoomUpdate(room);
          }

          this.emit(room.roomId);
          break;

        case _event.EventType.RoomMember:
          if (room.isSpaceRoom()) {
            this.onSpaceMembersChange(ev);
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "onRoomAccountData", (ev
    /*: MatrixEvent*/
    , room
    /*: Room*/
    , lastEvent
    /*: MatrixEvent*/
    ) => {
      if (ev.getType() === _event.EventType.Tag && !room.isSpaceRoom()) {
        // If the room was in favourites and now isn't or the opposite then update its position in the trees
        const oldTags = lastEvent?.getContent()?.tags || {};
        const newTags = ev.getContent()?.tags || {};

        if (!!oldTags[_models.DefaultTagID.Favourite] !== !!newTags[_models.DefaultTagID.Favourite]) {
          this.onRoomUpdate(room);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onAccountData", (ev
    /*: MatrixEvent*/
    , lastEvent
    /*: MatrixEvent*/
    ) => {
      if (ev.getType() === _event.EventType.Direct) {
        const lastContent = lastEvent.getContent();
        const content = ev.getContent();
        const diff = (0, _objects.objectDiff)(lastContent, content); // filter out keys which changed by reference only by checking whether the sets differ

        const changed = diff.changed.filter(k => (0, _arrays.arrayHasDiff)(lastContent[k], content[k])); // DM tag changes, refresh relevant rooms

        new Set([...diff.added, ...diff.removed, ...changed]).forEach(roomId => {
          const room = this.matrixClient?.getRoom(roomId);

          if (room) {
            this.onRoomUpdate(room);
          }
        });
      }
    });
  } // The spaces representing the roots of the various tree-like hierarchies


  get invitedSpaces()
  /*: Room[]*/
  {
    return Array.from(this._invitedSpaces);
  }

  get spacePanelSpaces()
  /*: Room[]*/
  {
    return this.rootSpaces;
  }

  get activeSpace()
  /*: Room | null*/
  {
    return this._activeSpace || null;
  }

  get suggestedRooms()
  /*: ISpaceSummaryRoom[]*/
  {
    return this._suggestedRooms;
  }

  async setActiveSpace(space
  /*: Room | null*/
  , contextSwitch = true) {
    if (space === this.activeSpace || space && !space?.isSpaceRoom()) return;
    this._activeSpace = space;
    this.emit(UPDATE_SELECTED_SPACE, this.activeSpace);
    this.emit(SUGGESTED_ROOMS, this._suggestedRooms = []);

    if (contextSwitch) {
      // view last selected room from space
      const roomId = window.localStorage.getItem(getSpaceContextKey(this.activeSpace)); // if the space being selected is an invite then always view that invite
      // else if the last viewed room in this space is joined then view that
      // else view space home or home depending on what is being clicked on

      if (space?.getMyMembership !== "invite" && this.matrixClient?.getRoom(roomId)?.getMyMembership() === "join") {
        _dispatcher.default.dispatch({
          action: "view_room",
          room_id: roomId,
          context_switch: true
        });
      } else if (space) {
        _dispatcher.default.dispatch({
          action: "view_room",
          room_id: space.roomId,
          context_switch: true
        });
      } else {
        _dispatcher.default.dispatch({
          action: "view_home_page"
        });
      }
    } // persist space selected


    if (space) {
      window.localStorage.setItem(ACTIVE_SPACE_LS_KEY, space.roomId);
    } else {
      window.localStorage.removeItem(ACTIVE_SPACE_LS_KEY);
    }

    if (space) {
      const data = await this.fetchSuggestedRooms(space);

      if (this._activeSpace === space) {
        this._suggestedRooms = data.rooms.filter(roomInfo => {
          return roomInfo.room_type !== _event.RoomType.Space && this.matrixClient.getRoom(roomInfo.room_id)?.getMyMembership() !== "join";
        });
        this.emit(SUGGESTED_ROOMS, this._suggestedRooms);
      }
    }
  }

  addRoomToSpace(space
  /*: Room*/
  , roomId
  /*: string*/
  , via
  /*: string[]*/
  , suggested = false, autoJoin = false) {
    return this.matrixClient.sendStateEvent(space.roomId, _event.EventType.SpaceChild, {
      via,
      suggested,
      auto_join: autoJoin
    }, roomId);
  }

  getChildren(spaceId
  /*: string*/
  )
  /*: Room[]*/
  {
    const room = this.matrixClient?.getRoom(spaceId);
    const childEvents = room?.currentState.getStateEvents(_event.EventType.SpaceChild).filter(ev => ev.getContent()?.via);
    return (0, _lodash.sortBy)(childEvents, getOrder).map(ev => this.matrixClient.getRoom(ev.getStateKey())).filter(room => room?.getMyMembership() === "join" || room?.getMyMembership() === "invite") || [];
  }

  getChildRooms(spaceId
  /*: string*/
  )
  /*: Room[]*/
  {
    return this.getChildren(spaceId).filter(r => !r.isSpaceRoom());
  }

  getChildSpaces(spaceId
  /*: string*/
  )
  /*: Room[]*/
  {
    // don't show invited subspaces as they surface at the top level for better visibility
    return this.getChildren(spaceId).filter(r => r.isSpaceRoom() && r.getMyMembership() === "join");
  }

  getParents(roomId
  /*: string*/
  , canonicalOnly = false)
  /*: Room[]*/
  {
    const room = this.matrixClient?.getRoom(roomId);
    return room?.currentState.getStateEvents(_event.EventType.SpaceParent).filter(ev => {
      const content = ev.getContent();
      if (!content?.via) return false; // TODO apply permissions check to verify that the parent mapping is valid

      if (canonicalOnly && !content?.canonical) return false;
      return true;
    }).map(ev => this.matrixClient.getRoom(ev.getStateKey())).filter(Boolean) || [];
  }

  getCanonicalParent(roomId
  /*: string*/
  )
  /*: Room | null*/
  {
    const parents = this.getParents(roomId, true);
    return (0, _lodash.sortBy)(parents, r => r.roomId)?.[0] || null;
  }

  async reset() {
    this.rootSpaces = [];
    this.orphanedRooms = new Set();
    this.parentMap = new _maps.EnhancedMap();
    this.notificationStateMap = new Map();
    this.spaceFilteredRooms = new Map();
    this._activeSpace = null;
    this._suggestedRooms = [];
    this._invitedSpaces = new Set();
  }

  async onNotReady() {
    if (!_SettingsStore.default.getValue("feature_spaces")) return;

    if (this.matrixClient) {
      this.matrixClient.removeListener("Room", this.onRoom);
      this.matrixClient.removeListener("Room.myMembership", this.onRoom);
      this.matrixClient.removeListener("RoomState.events", this.onRoomState);
      this.matrixClient.removeListener("Room.accountData", this.onRoomAccountData);
      this.matrixClient.removeListener("accountData", this.onAccountData);
    }

    await this.reset();
  }

  async onReady() {
    if (!_SettingsStore.default.getValue("feature_spaces")) return;
    this.matrixClient.on("Room", this.onRoom);
    this.matrixClient.on("Room.myMembership", this.onRoom);
    this.matrixClient.on("RoomState.events", this.onRoomState);
    this.matrixClient.on("Room.accountData", this.onRoomAccountData);
    this.matrixClient.on("accountData", this.onAccountData);
    await this.onSpaceUpdate(); // trigger an initial update
    // restore selected state from last session if any and still valid

    const lastSpaceId = window.localStorage.getItem(ACTIVE_SPACE_LS_KEY);

    if (lastSpaceId) {
      const space = this.rootSpaces.find(s => s.roomId === lastSpaceId);

      if (space) {
        this.setActiveSpace(space);
      }
    }
  }

  async onAction(payload
  /*: ActionPayload*/
  ) {
    if (!_SettingsStore.default.getValue("feature_spaces")) return;

    switch (payload.action) {
      case "view_room":
        {
          const room = this.matrixClient?.getRoom(payload.room_id); // Don't auto-switch rooms when reacting to a context-switch
          // as this is not helpful and can create loops of rooms/space switching

          if (!room || payload.context_switch) break;

          if (room.isSpaceRoom()) {
            // Don't context switch when navigating to the space room
            // as it will cause you to end up in the wrong room
            this.setActiveSpace(room, false);
          } else if (!this.getSpaceFilteredRoomIds(this.activeSpace).has(room.roomId)) {
            let parent = this.getCanonicalParent(room.roomId);

            if (!parent) {
              parent = this.rootSpaces.find(s => this.spaceFilteredRooms.get(s.roomId)?.has(room.roomId));
            }

            if (!parent) {
              const parents = Array.from(this.parentMap.get(room.roomId) || []);
              parent = parents.find(p => this.matrixClient.getRoom(p));
            } // don't trigger a context switch when we are switching a space to match the chosen room


            this.setActiveSpace(parent || null, false);
          } // Persist last viewed room from a space
          // we don't await setActiveSpace above as we only care about this.activeSpace being up to date
          // synchronously for the below code - everything else can and should be async.


          window.localStorage.setItem(getSpaceContextKey(this.activeSpace), payload.room_id);
          break;
        }

      case "after_leave_room":
        if (this._activeSpace && payload.room_id === this._activeSpace.roomId) {
          this.setActiveSpace(null);
        }

        break;
    }
  }

  getNotificationState(key
  /*: SpaceKey*/
  )
  /*: SpaceNotificationState*/
  {
    if (this.notificationStateMap.has(key)) {
      return this.notificationStateMap.get(key);
    }

    const state = new _SpaceNotificationState.SpaceNotificationState(key, getRoomFn);
    this.notificationStateMap.set(key, state);
    return state;
  } // traverse space tree with DFS calling fn on each space including the given root one,
  // if includeRooms is true then fn will be called on each leaf room, if it is present in multiple sub-spaces
  // then fn will be called with it multiple times.


  traverseSpace(spaceId
  /*: string*/
  , fn
  /*: (roomId: string) => void*/
  , includeRooms = false, parentPath
  /*: Set<string>*/
  ) {
    if (parentPath && parentPath.has(spaceId)) return; // prevent cycles

    fn(spaceId);
    const newPath = new Set(parentPath).add(spaceId);
    const [childSpaces, childRooms] = partitionSpacesAndRooms(this.getChildren(spaceId));

    if (includeRooms) {
      childRooms.forEach(r => fn(r.roomId));
    }

    childSpaces.forEach(s => this.traverseSpace(s.roomId, fn, includeRooms, newPath));
  }

}

exports.SpaceStoreClass = SpaceStoreClass;

class SpaceStore {
  static get instance()
  /*: SpaceStoreClass*/
  {
    return SpaceStore.internalInstance;
  }

}

exports.default = SpaceStore;
(0, _defineProperty2.default)(SpaceStore, "internalInstance", new SpaceStoreClass());
window.mxSpaceStore = SpaceStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvU3BhY2VTdG9yZS50c3giXSwibmFtZXMiOlsiQUNUSVZFX1NQQUNFX0xTX0tFWSIsIkhPTUVfU1BBQ0UiLCJTeW1ib2wiLCJTVUdHRVNURURfUk9PTVMiLCJVUERBVEVfVE9QX0xFVkVMX1NQQUNFUyIsIlVQREFURV9JTlZJVEVEX1NQQUNFUyIsIlVQREFURV9TRUxFQ1RFRF9TUEFDRSIsIk1BWF9TVUdHRVNURURfUk9PTVMiLCJnZXRTcGFjZUNvbnRleHRLZXkiLCJzcGFjZSIsInJvb21JZCIsInBhcnRpdGlvblNwYWNlc0FuZFJvb21zIiwiYXJyIiwicmVkdWNlIiwicmVzdWx0Iiwicm9vbSIsImlzU3BhY2VSb29tIiwicHVzaCIsImdldE9yZGVyIiwiZXYiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsIm9yZGVyIiwiQXJyYXkiLCJmcm9tIiwiZXZlcnkiLCJjIiwiY2hhckNvZGUiLCJjaGFyQ29kZUF0IiwiZ2V0Um9vbUZuIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJpbnN0YW5jZSIsImdldFJvb21TdGF0ZSIsIlNwYWNlU3RvcmVDbGFzcyIsIkFzeW5jU3RvcmVXaXRoQ2xpZW50IiwiY29uc3RydWN0b3IiLCJkZWZhdWx0RGlzcGF0Y2hlciIsIlNldCIsIkVuaGFuY2VkTWFwIiwiTWFwIiwibGltaXQiLCJkYXRhIiwibWF0cml4Q2xpZW50IiwiZ2V0U3BhY2VTdW1tYXJ5IiwiZSIsImNvbnNvbGUiLCJlcnJvciIsInJvb21zIiwiZXZlbnRzIiwic3BhY2VGaWx0ZXJlZFJvb21zIiwiZ2V0IiwidmlzaWJsZVNwYWNlcyIsInZpc2libGVSb29tcyIsImdldFZpc2libGVSb29tcyIsImpvaW5lZFNwYWNlcyIsImludml0ZWRTcGFjZXMiLCJzIiwiZ2V0TXlNZW1iZXJzaGlwIiwidW5zZWVuQ2hpbGRyZW4iLCJiYWNrcmVmcyIsInNwYWNlcyIsImZvckVhY2giLCJjaGlsZHJlbiIsImdldENoaWxkcmVuIiwiY2hpbGQiLCJkZWxldGUiLCJnZXRPckNyZWF0ZSIsImFkZCIsInJvb3RTcGFjZXMiLCJvcnBoYW5lZFJvb21zIiwiZGV0YWNoZWROb2RlcyIsIm1hcmtUcmVlQ2hpbGRyZW4iLCJyb290U3BhY2UiLCJ1bnNlZW4iLCJzdGFjayIsImxlbmd0aCIsIm9wIiwicG9wIiwiZ2V0Q2hpbGRTcGFjZXMiLCJoYXMiLCJkZXRhY2hlZE5vZGUiLCJwYXJlbnRNYXAiLCJfYWN0aXZlU3BhY2UiLCJzZXRBY3RpdmVTcGFjZSIsIm9uUm9vbXNVcGRhdGUiLCJlbWl0Iiwic3BhY2VQYW5lbFNwYWNlcyIsIl9pbnZpdGVkU3BhY2VzIiwidHJhaWxpbmciLCJsZWFkaW5nIiwicmVidWlsZCIsInNpemUiLCJETVJvb21NYXAiLCJzaGFyZWQiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJSb29tTGlzdFN0b3JlIiwiZ2V0VGFnc0ZvclJvb20iLCJpbmNsdWRlcyIsIkRlZmF1bHRUYWdJRCIsIkZhdm91cml0ZSIsInNob3dJbkhvbWVTcGFjZSIsImdldERNUm9vbXNGb3JVc2VySWQiLCJnZXRTdGF0ZUtleSIsIm9sZEZpbHRlcmVkUm9vbXMiLCJpbnZpdGVzIiwiZmlsdGVyIiwiciIsInNldCIsIm1hcCIsImZuIiwic3BhY2VJZCIsInBhcmVudFBhdGgiLCJjaGlsZFNwYWNlcyIsImNoaWxkUm9vbXMiLCJyb29tSWRzIiwiZ2V0Um9vbSIsImdldEpvaW5lZE1lbWJlcnMiLCJtZW1iZXIiLCJ1c2VySWQiLCJuZXdQYXRoIiwiY2hpbGRTcGFjZSIsImRpZmYiLCJjaGFuZ2VkIiwiayIsImFkZGVkIiwicmVtb3ZlZCIsImdldE5vdGlmaWNhdGlvblN0YXRlIiwic2V0Um9vbXMiLCJuZXdNZW1iZXJzaGlwIiwib2xkTWVtYmVyc2hpcCIsIm1lbWJlcnNoaXAiLCJudW1TdWdnZXN0ZWRSb29tcyIsIl9zdWdnZXN0ZWRSb29tcyIsInJvb21faWQiLCJvblNwYWNlVXBkYXRlIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsImdldFR5cGUiLCJFdmVudFR5cGUiLCJTcGFjZUNoaWxkIiwiU3BhY2VQYXJlbnQiLCJvblJvb21VcGRhdGUiLCJSb29tTWVtYmVyIiwib25TcGFjZU1lbWJlcnNDaGFuZ2UiLCJsYXN0RXZlbnQiLCJUYWciLCJvbGRUYWdzIiwidGFncyIsIm5ld1RhZ3MiLCJEaXJlY3QiLCJsYXN0Q29udGVudCIsImFjdGl2ZVNwYWNlIiwic3VnZ2VzdGVkUm9vbXMiLCJjb250ZXh0U3dpdGNoIiwid2luZG93IiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImRpc3BhdGNoIiwiYWN0aW9uIiwiY29udGV4dF9zd2l0Y2giLCJzZXRJdGVtIiwicmVtb3ZlSXRlbSIsImZldGNoU3VnZ2VzdGVkUm9vbXMiLCJyb29tSW5mbyIsInJvb21fdHlwZSIsIlJvb21UeXBlIiwiU3BhY2UiLCJhZGRSb29tVG9TcGFjZSIsInZpYSIsInN1Z2dlc3RlZCIsImF1dG9Kb2luIiwic2VuZFN0YXRlRXZlbnQiLCJhdXRvX2pvaW4iLCJjaGlsZEV2ZW50cyIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q2hpbGRSb29tcyIsImdldFBhcmVudHMiLCJjYW5vbmljYWxPbmx5IiwiY2Fub25pY2FsIiwiQm9vbGVhbiIsImdldENhbm9uaWNhbFBhcmVudCIsInBhcmVudHMiLCJyZXNldCIsIm5vdGlmaWNhdGlvblN0YXRlTWFwIiwib25Ob3RSZWFkeSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsInJlbW92ZUxpc3RlbmVyIiwib25Sb29tIiwib25Sb29tU3RhdGUiLCJvblJvb21BY2NvdW50RGF0YSIsIm9uQWNjb3VudERhdGEiLCJvblJlYWR5Iiwib24iLCJsYXN0U3BhY2VJZCIsImZpbmQiLCJvbkFjdGlvbiIsInBheWxvYWQiLCJnZXRTcGFjZUZpbHRlcmVkUm9vbUlkcyIsInBhcmVudCIsInAiLCJrZXkiLCJzdGF0ZSIsIlNwYWNlTm90aWZpY2F0aW9uU3RhdGUiLCJ0cmF2ZXJzZVNwYWNlIiwiaW5jbHVkZVJvb21zIiwiU3Bh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QUFpQ2lHLFlBQWpDLEVBQStDdkYsT0FBL0MsQ0FBekI7QUFDSDs7QUFoaUI2RDs7OztBQW1pQm5ELE1BQU13RixVQUFOLENBQWlCO0FBRzVCLGFBQWtCaEwsUUFBbEI7QUFBQTtBQUE4QztBQUMxQyxXQUFPZ0wsVUFBVSxDQUFDQyxnQkFBbEI7QUFDSDs7QUFMMkI7Ozs4QkFBWEQsVSxzQkFDaUIsSUFBSTlLLGVBQUosRTtBQU90Q3lILE1BQU0sQ0FBQ3VELFlBQVAsR0FBc0JGLFVBQVUsQ0FBQ2hMLFFBQWpDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtzb3J0QnksIHRocm90dGxlfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge0V2ZW50VHlwZSwgUm9vbVR5cGV9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge01hdHJpeEV2ZW50fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCB7QXN5bmNTdG9yZVdpdGhDbGllbnR9IGZyb20gXCIuL0FzeW5jU3RvcmVXaXRoQ2xpZW50XCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtBY3Rpb25QYXlsb2FkfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4vcm9vbS1saXN0L1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCB7RmV0Y2hSb29tRm59IGZyb20gXCIuL25vdGlmaWNhdGlvbnMvTGlzdE5vdGlmaWNhdGlvblN0YXRlXCI7XG5pbXBvcnQge1NwYWNlTm90aWZpY2F0aW9uU3RhdGV9IGZyb20gXCIuL25vdGlmaWNhdGlvbnMvU3BhY2VOb3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IHtSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZX0gZnJvbSBcIi4vbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IHtEZWZhdWx0VGFnSUR9IGZyb20gXCIuL3Jvb20tbGlzdC9tb2RlbHNcIjtcbmltcG9ydCB7RW5oYW5jZWRNYXAsIG1hcERpZmZ9IGZyb20gXCIuLi91dGlscy9tYXBzXCI7XG5pbXBvcnQge3NldEhhc0RpZmZ9IGZyb20gXCIuLi91dGlscy9zZXRzXCI7XG5pbXBvcnQge29iamVjdERpZmZ9IGZyb20gXCIuLi91dGlscy9vYmplY3RzXCI7XG5pbXBvcnQge2FycmF5SGFzRGlmZn0gZnJvbSBcIi4uL3V0aWxzL2FycmF5c1wiO1xuaW1wb3J0IHtJU3BhY2VTdW1tYXJ5RXZlbnQsIElTcGFjZVN1bW1hcnlSb29tfSBmcm9tIFwiLi4vY29tcG9uZW50cy9zdHJ1Y3R1cmVzL1NwYWNlUm9vbURpcmVjdG9yeVwiO1xuaW1wb3J0IFJvb21WaWV3U3RvcmUgZnJvbSBcIi4vUm9vbVZpZXdTdG9yZVwiO1xuXG50eXBlIFNwYWNlS2V5ID0gc3RyaW5nIHwgc3ltYm9sO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHt9XG5cbmNvbnN0IEFDVElWRV9TUEFDRV9MU19LRVkgPSBcIm14X2FjdGl2ZV9zcGFjZVwiO1xuXG5leHBvcnQgY29uc3QgSE9NRV9TUEFDRSA9IFN5bWJvbChcImhvbWUtc3BhY2VcIik7XG5leHBvcnQgY29uc3QgU1VHR0VTVEVEX1JPT01TID0gU3ltYm9sKFwic3VnZ2VzdGVkLXJvb21zXCIpO1xuXG5leHBvcnQgY29uc3QgVVBEQVRFX1RPUF9MRVZFTF9TUEFDRVMgPSBTeW1ib2woXCJ0b3AtbGV2ZWwtc3BhY2VzXCIpO1xuZXhwb3J0IGNvbnN0IFVQREFURV9JTlZJVEVEX1NQQUNFUyA9IFN5bWJvbChcImludml0ZWQtc3BhY2VzXCIpO1xuZXhwb3J0IGNvbnN0IFVQREFURV9TRUxFQ1RFRF9TUEFDRSA9IFN5bWJvbChcInNlbGVjdGVkLXNwYWNlXCIpO1xuLy8gU3BhY2UgUm9vbSBJRC9IT01FX1NQQUNFIHdpbGwgYmUgZW1pdHRlZCB3aGVuIGEgU3BhY2UncyBjaGlsZHJlbiBjaGFuZ2VcblxuY29uc3QgTUFYX1NVR0dFU1RFRF9ST09NUyA9IDIwO1xuXG5jb25zdCBnZXRTcGFjZUNvbnRleHRLZXkgPSAoc3BhY2U/OiBSb29tKSA9PiBgbXhfc3BhY2VfY29udGV4dF8ke3NwYWNlPy5yb29tSWQgfHwgXCJob21lX3NwYWNlXCJ9YDtcblxuY29uc3QgcGFydGl0aW9uU3BhY2VzQW5kUm9vbXMgPSAoYXJyOiBSb29tW10pOiBbUm9vbVtdLCBSb29tW11dID0+IHsgLy8gW3NwYWNlcywgcm9vbXNdXG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoKHJlc3VsdCwgcm9vbTogUm9vbSkgPT4ge1xuICAgICAgICByZXN1bHRbcm9vbS5pc1NwYWNlUm9vbSgpID8gMCA6IDFdLnB1c2gocm9vbSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW1tdLCBbXV0pO1xufTtcblxuY29uc3QgZ2V0T3JkZXIgPSAoZXY6IE1hdHJpeEV2ZW50KTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgY29uc3QgY29udGVudCA9IGV2LmdldENvbnRlbnQoKTtcbiAgICBpZiAodHlwZW9mIGNvbnRlbnQub3JkZXIgPT09IFwic3RyaW5nXCIgJiYgQXJyYXkuZnJvbShjb250ZW50Lm9yZGVyKS5ldmVyeSgoYzogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoYXJDb2RlID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICByZXR1cm4gY2hhckNvZGUgPj0gMHgyMCAmJiBjaGFyQ29kZSA8PSAweDdGO1xuICAgIH0pKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50Lm9yZGVyO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgZ2V0Um9vbUZuOiBGZXRjaFJvb21GbiA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgcmV0dXJuIFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldFJvb21TdGF0ZShyb29tKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBTcGFjZVN0b3JlQ2xhc3MgZXh0ZW5kcyBBc3luY1N0b3JlV2l0aENsaWVudDxJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoZGVmYXVsdERpc3BhdGNoZXIsIHt9KTtcbiAgICB9XG5cbiAgICAvLyBUaGUgc3BhY2VzIHJlcHJlc2VudGluZyB0aGUgcm9vdHMgb2YgdGhlIHZhcmlvdXMgdHJlZS1saWtlIGhpZXJhcmNoaWVzXG4gICAgcHJpdmF0ZSByb290U3BhY2VzOiBSb29tW10gPSBbXTtcbiAgICAvLyBUaGUgbGlzdCBvZiByb29tcyBub3QgcHJlc2VudCBpbiBhbnkgY3VycmVudGx5IGpvaW5lZCBzcGFjZXNcbiAgICBwcml2YXRlIG9ycGhhbmVkUm9vbXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAvLyBNYXAgZnJvbSByb29tIElEIHRvIHNldCBvZiBzcGFjZXMgd2hpY2ggbGlzdCBpdCBhcyBhIGNoaWxkXG4gICAgcHJpdmF0ZSBwYXJlbnRNYXAgPSBuZXcgRW5oYW5jZWRNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4oKTtcbiAgICAvLyBNYXAgZnJvbSBzcGFjZSBrZXkgdG8gU3BhY2VOb3RpZmljYXRpb25TdGF0ZSBpbnN0YW5jZSByZXByZXNlbnRpbmcgdGhhdCBzcGFjZVxuICAgIHByaXZhdGUgbm90aWZpY2F0aW9uU3RhdGVNYXAgPSBuZXcgTWFwPFNwYWNlS2V5LCBTcGFjZU5vdGlmaWNhdGlvblN0YXRlPigpO1xuICAgIC8vIE1hcCBmcm9tIHNwYWNlIGtleSB0byBTZXQgb2Ygcm9vbSBJRHMgdGhhdCBzaG91bGQgYmUgc2hvd24gYXMgcGFydCBvZiB0aGF0IHNwYWNlJ3MgZmlsdGVyXG4gICAgcHJpdmF0ZSBzcGFjZUZpbHRlcmVkUm9vbXMgPSBuZXcgTWFwPHN0cmluZyB8IHN5bWJvbCwgU2V0PHN0cmluZz4+KCk7XG4gICAgLy8gVGhlIHNwYWNlIGN1cnJlbnRseSBzZWxlY3RlZCBpbiB0aGUgU3BhY2UgUGFuZWwgLSBpZiBudWxsIHRoZW4gYEhvbWVgIGlzIHNlbGVjdGVkXG4gICAgcHJpdmF0ZSBfYWN0aXZlU3BhY2U/OiBSb29tID0gbnVsbDtcbiAgICBwcml2YXRlIF9zdWdnZXN0ZWRSb29tczogSVNwYWNlU3VtbWFyeVJvb21bXSA9IFtdO1xuICAgIHByaXZhdGUgX2ludml0ZWRTcGFjZXMgPSBuZXcgU2V0PFJvb20+KCk7XG5cbiAgICBwdWJsaWMgZ2V0IGludml0ZWRTcGFjZXMoKTogUm9vbVtdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5faW52aXRlZFNwYWNlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzcGFjZVBhbmVsU3BhY2VzKCk6IFJvb21bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb3RTcGFjZXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBhY3RpdmVTcGFjZSgpOiBSb29tIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmVTcGFjZSB8fCBudWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc3VnZ2VzdGVkUm9vbXMoKTogSVNwYWNlU3VtbWFyeVJvb21bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdWdnZXN0ZWRSb29tcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2V0QWN0aXZlU3BhY2Uoc3BhY2U6IFJvb20gfCBudWxsLCBjb250ZXh0U3dpdGNoID0gdHJ1ZSkge1xuICAgICAgICBpZiAoc3BhY2UgPT09IHRoaXMuYWN0aXZlU3BhY2UgfHwgKHNwYWNlICYmICFzcGFjZT8uaXNTcGFjZVJvb20oKSkpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9hY3RpdmVTcGFjZSA9IHNwYWNlO1xuICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX1NFTEVDVEVEX1NQQUNFLCB0aGlzLmFjdGl2ZVNwYWNlKTtcbiAgICAgICAgdGhpcy5lbWl0KFNVR0dFU1RFRF9ST09NUywgdGhpcy5fc3VnZ2VzdGVkUm9vbXMgPSBbXSk7XG5cbiAgICAgICAgaWYgKGNvbnRleHRTd2l0Y2gpIHtcbiAgICAgICAgICAgIC8vIHZpZXcgbGFzdCBzZWxlY3RlZCByb29tIGZyb20gc3BhY2VcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShnZXRTcGFjZUNvbnRleHRLZXkodGhpcy5hY3RpdmVTcGFjZSkpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgc3BhY2UgYmVpbmcgc2VsZWN0ZWQgaXMgYW4gaW52aXRlIHRoZW4gYWx3YXlzIHZpZXcgdGhhdCBpbnZpdGVcbiAgICAgICAgICAgIC8vIGVsc2UgaWYgdGhlIGxhc3Qgdmlld2VkIHJvb20gaW4gdGhpcyBzcGFjZSBpcyBqb2luZWQgdGhlbiB2aWV3IHRoYXRcbiAgICAgICAgICAgIC8vIGVsc2UgdmlldyBzcGFjZSBob21lIG9yIGhvbWUgZGVwZW5kaW5nIG9uIHdoYXQgaXMgYmVpbmcgY2xpY2tlZCBvblxuICAgICAgICAgICAgaWYgKHNwYWNlPy5nZXRNeU1lbWJlcnNoaXAgIT09IFwiaW52aXRlXCIgJiZcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudD8uZ2V0Um9vbShyb29tSWQpPy5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRfc3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzcGFjZSkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBzcGFjZS5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRfc3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X2hvbWVfcGFnZVwiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGVyc2lzdCBzcGFjZSBzZWxlY3RlZFxuICAgICAgICBpZiAoc3BhY2UpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShBQ1RJVkVfU1BBQ0VfTFNfS0VZLCBzcGFjZS5yb29tSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEFDVElWRV9TUEFDRV9MU19LRVkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNwYWNlKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaFN1Z2dlc3RlZFJvb21zKHNwYWNlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVTcGFjZSA9PT0gc3BhY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdWdnZXN0ZWRSb29tcyA9IGRhdGEucm9vbXMuZmlsdGVyKHJvb21JbmZvID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb21JbmZvLnJvb21fdHlwZSAhPT0gUm9vbVR5cGUuU3BhY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUluZm8ucm9vbV9pZCk/LmdldE15TWVtYmVyc2hpcCgpICE9PSBcImpvaW5cIjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoU1VHR0VTVEVEX1JPT01TLCB0aGlzLl9zdWdnZXN0ZWRSb29tcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZmV0Y2hTdWdnZXN0ZWRSb29tcyA9IGFzeW5jIChzcGFjZTogUm9vbSwgbGltaXQgPSBNQVhfU1VHR0VTVEVEX1JPT01TKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhOiB7XG4gICAgICAgICAgICAgICAgcm9vbXM6IElTcGFjZVN1bW1hcnlSb29tW107XG4gICAgICAgICAgICAgICAgZXZlbnRzOiBJU3BhY2VTdW1tYXJ5RXZlbnRbXTtcbiAgICAgICAgICAgIH0gPSBhd2FpdCB0aGlzLm1hdHJpeENsaWVudC5nZXRTcGFjZVN1bW1hcnkoc3BhY2Uucm9vbUlkLCAwLCB0cnVlLCBmYWxzZSwgbGltaXQpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJvb21zOiBbXSxcbiAgICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIHB1YmxpYyBhZGRSb29tVG9TcGFjZShzcGFjZTogUm9vbSwgcm9vbUlkOiBzdHJpbmcsIHZpYTogc3RyaW5nW10sIHN1Z2dlc3RlZCA9IGZhbHNlLCBhdXRvSm9pbiA9IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdHJpeENsaWVudC5zZW5kU3RhdGVFdmVudChzcGFjZS5yb29tSWQsIEV2ZW50VHlwZS5TcGFjZUNoaWxkLCB7XG4gICAgICAgICAgICB2aWEsXG4gICAgICAgICAgICBzdWdnZXN0ZWQsXG4gICAgICAgICAgICBhdXRvX2pvaW46IGF1dG9Kb2luLFxuICAgICAgICB9LCByb29tSWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRyZW4oc3BhY2VJZDogc3RyaW5nKTogUm9vbVtdIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50Py5nZXRSb29tKHNwYWNlSWQpO1xuICAgICAgICBjb25zdCBjaGlsZEV2ZW50cyA9IHJvb20/LmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuU3BhY2VDaGlsZCkuZmlsdGVyKGV2ID0+IGV2LmdldENvbnRlbnQoKT8udmlhKTtcbiAgICAgICAgcmV0dXJuIHNvcnRCeShjaGlsZEV2ZW50cywgZ2V0T3JkZXIpXG4gICAgICAgICAgICAubWFwKGV2ID0+IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20oZXYuZ2V0U3RhdGVLZXkoKSkpXG4gICAgICAgICAgICAuZmlsdGVyKHJvb20gPT4gcm9vbT8uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiIHx8IHJvb20/LmdldE15TWVtYmVyc2hpcCgpID09PSBcImludml0ZVwiKSB8fCBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q2hpbGRSb29tcyhzcGFjZUlkOiBzdHJpbmcpOiBSb29tW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDaGlsZHJlbihzcGFjZUlkKS5maWx0ZXIociA9PiAhci5pc1NwYWNlUm9vbSgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q2hpbGRTcGFjZXMoc3BhY2VJZDogc3RyaW5nKTogUm9vbVtdIHtcbiAgICAgICAgLy8gZG9uJ3Qgc2hvdyBpbnZpdGVkIHN1YnNwYWNlcyBhcyB0aGV5IHN1cmZhY2UgYXQgdGhlIHRvcCBsZXZlbCBmb3IgYmV0dGVyIHZpc2liaWxpdHlcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRyZW4oc3BhY2VJZCkuZmlsdGVyKHIgPT4gci5pc1NwYWNlUm9vbSgpICYmIHIuZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGFyZW50cyhyb29tSWQ6IHN0cmluZywgY2Fub25pY2FsT25seSA9IGZhbHNlKTogUm9vbVtdIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50Py5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIHJldHVybiByb29tPy5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlNwYWNlUGFyZW50KVxuICAgICAgICAgICAgLmZpbHRlcihldiA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGV2LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbnRlbnQ/LnZpYSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gYXBwbHkgcGVybWlzc2lvbnMgY2hlY2sgdG8gdmVyaWZ5IHRoYXQgdGhlIHBhcmVudCBtYXBwaW5nIGlzIHZhbGlkXG4gICAgICAgICAgICAgICAgaWYgKGNhbm9uaWNhbE9ubHkgJiYgIWNvbnRlbnQ/LmNhbm9uaWNhbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5tYXAoZXYgPT4gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShldi5nZXRTdGF0ZUtleSgpKSlcbiAgICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbikgfHwgW107XG4gICAgfVxuXG4gICAgcHVibGljIGdldENhbm9uaWNhbFBhcmVudChyb29tSWQ6IHN0cmluZyk6IFJvb20gfCBudWxsIHtcbiAgICAgICAgY29uc3QgcGFyZW50cyA9IHRoaXMuZ2V0UGFyZW50cyhyb29tSWQsIHRydWUpO1xuICAgICAgICByZXR1cm4gc29ydEJ5KHBhcmVudHMsIHIgPT4gci5yb29tSWQpPy5bMF0gfHwgbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U3BhY2VGaWx0ZXJlZFJvb21JZHMgPSAoc3BhY2U6IFJvb20gfCBudWxsKTogU2V0PHN0cmluZz4gPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXMuZ2V0KHNwYWNlPy5yb29tSWQgfHwgSE9NRV9TUEFDRSkgfHwgbmV3IFNldCgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlYnVpbGQgPSB0aHJvdHRsZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IFt2aXNpYmxlU3BhY2VzLCB2aXNpYmxlUm9vbXNdID0gcGFydGl0aW9uU3BhY2VzQW5kUm9vbXModGhpcy5tYXRyaXhDbGllbnQuZ2V0VmlzaWJsZVJvb21zKCkpO1xuICAgICAgICBjb25zdCBbam9pbmVkU3BhY2VzLCBpbnZpdGVkU3BhY2VzXSA9IHZpc2libGVTcGFjZXMucmVkdWNlKChhcnIsIHMpID0+IHtcbiAgICAgICAgICAgIGlmIChzLmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgICAgIGFyclswXS5wdXNoKHMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzLmdldE15TWVtYmVyc2hpcCgpID09PSBcImludml0ZVwiKSB7XG4gICAgICAgICAgICAgICAgYXJyWzFdLnB1c2gocyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgICB9LCBbW10sIFtdXSk7XG5cbiAgICAgICAgLy8gZXhjbHVkZSBpbnZpdGVkIHNwYWNlcyBmcm9tIHVuc2VlbkNoaWxkcmVuIGFzIHRoZXkgd2lsbCBiZSBmb3JjaWJseSBzaG93biBhdCB0aGUgdG9wIGxldmVsIG9mIHRoZSB0cmVldmlld1xuICAgICAgICBjb25zdCB1bnNlZW5DaGlsZHJlbiA9IG5ldyBTZXQ8Um9vbT4oWy4uLnZpc2libGVSb29tcywgLi4uam9pbmVkU3BhY2VzXSk7XG4gICAgICAgIGNvbnN0IGJhY2tyZWZzID0gbmV3IEVuaGFuY2VkTWFwPHN0cmluZywgU2V0PHN0cmluZz4+KCk7XG5cbiAgICAgICAgLy8gU29ydCBzcGFjZXMgYnkgcm9vbSBJRCB0byBmb3JjZSB0aGUgY3ljbGUgYnJlYWtpbmcgdG8gYmUgZGV0ZXJtaW5pc3RpY1xuICAgICAgICBjb25zdCBzcGFjZXMgPSBzb3J0Qnkoam9pbmVkU3BhY2VzLCBzcGFjZSA9PiBzcGFjZS5yb29tSWQpO1xuXG4gICAgICAgIC8vIFRPRE8gaGFuZGxlIGNsZWFuaW5nIHVwIGxpbmtzIHdoZW4gYSBTcGFjZSBpcyByZW1vdmVkXG4gICAgICAgIHNwYWNlcy5mb3JFYWNoKHNwYWNlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5nZXRDaGlsZHJlbihzcGFjZS5yb29tSWQpO1xuICAgICAgICAgICAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgICAgICAgdW5zZWVuQ2hpbGRyZW4uZGVsZXRlKGNoaWxkKTtcblxuICAgICAgICAgICAgICAgIGJhY2tyZWZzLmdldE9yQ3JlYXRlKGNoaWxkLnJvb21JZCwgbmV3IFNldCgpKS5hZGQoc3BhY2Uucm9vbUlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBbcm9vdFNwYWNlcywgb3JwaGFuZWRSb29tc10gPSBwYXJ0aXRpb25TcGFjZXNBbmRSb29tcyhBcnJheS5mcm9tKHVuc2VlbkNoaWxkcmVuKSk7XG5cbiAgICAgICAgLy8gc29tZXdoYXQgYWxnb3JpdGhtIHRvIGhhbmRsZSBmdWxsLWN5Y2xlc1xuICAgICAgICBjb25zdCBkZXRhY2hlZE5vZGVzID0gbmV3IFNldDxSb29tPihzcGFjZXMpO1xuXG4gICAgICAgIGNvbnN0IG1hcmtUcmVlQ2hpbGRyZW4gPSAocm9vdFNwYWNlOiBSb29tLCB1bnNlZW46IFNldDxSb29tPikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhY2sgPSBbcm9vdFNwYWNlXTtcbiAgICAgICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvcCA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIHVuc2Vlbi5kZWxldGUob3ApO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q2hpbGRTcGFjZXMob3Aucm9vbUlkKS5mb3JFYWNoKHNwYWNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVuc2Vlbi5oYXMoc3BhY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJvb3RTcGFjZXMuZm9yRWFjaChyb290U3BhY2UgPT4ge1xuICAgICAgICAgICAgbWFya1RyZWVDaGlsZHJlbihyb290U3BhY2UsIGRldGFjaGVkTm9kZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBIYW5kbGUgc3BhY2VzIGZvcm1pbmcgZnVsbHkgY3ljbGljYWwgcmVsYXRpb25zaGlwcy5cbiAgICAgICAgLy8gSW4gb3JkZXIsIGFzc3VtZSBlYWNoIGRldGFjaGVkTm9kZSBpcyBhIHJvb3QgdW5sZXNzIGl0IGhhcyBhbHJlYWR5XG4gICAgICAgIC8vIGJlZW4gY2xhaW1lZCBhcyB0aGUgY2hpbGQgb2YgcHJpb3IgZGV0YWNoZWQgbm9kZS5cbiAgICAgICAgLy8gV29yayBmcm9tIGEgY29weSBvZiB0aGUgZGV0YWNoZWROb2RlcyBzZXQgYXMgaXQgd2lsbCBiZSBtdXRhdGVkIGFzIHBhcnQgb2YgdGhpcyBvcGVyYXRpb24uXG4gICAgICAgIEFycmF5LmZyb20oZGV0YWNoZWROb2RlcykuZm9yRWFjaChkZXRhY2hlZE5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFkZXRhY2hlZE5vZGVzLmhhcyhkZXRhY2hlZE5vZGUpKSByZXR1cm47XG4gICAgICAgICAgICAvLyBkZWNsYXJlIHRoaXMgZGV0YWNoZWQgbm9kZSBhIG5ldyByb290LCBmaW5kIGl0cyBjaGlsZHJlbiwgd2l0aG91dCBldmVyIGxvb3BpbmcgYmFjayB0byBpdFxuICAgICAgICAgICAgZGV0YWNoZWROb2Rlcy5kZWxldGUoZGV0YWNoZWROb2RlKTtcbiAgICAgICAgICAgIHJvb3RTcGFjZXMucHVzaChkZXRhY2hlZE5vZGUpO1xuICAgICAgICAgICAgbWFya1RyZWVDaGlsZHJlbihkZXRhY2hlZE5vZGUsIGRldGFjaGVkTm9kZXMpO1xuXG4gICAgICAgICAgICAvLyBUT0RPIG9ubHkgY29uc2lkZXIgYSBkZXRhY2hlZCBub2RlIGEgcm9vdCBzcGFjZSBpZiBpdCBoYXMgbm8gKnBhcmVudHMgb3RoZXIgdGhhbiB0aGUgb25lcyBmb3JtaW5nIGN5Y2xlc1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUT0RPIG5laXRoZXIgb2YgdGhlc2UgaGFuZGxlIGFuIEEtPkItPkMtPkEgd2l0aCBhbiBhZGRpdGlvbmFsIEMtPkRcbiAgICAgICAgLy8gZGV0YWNoZWROb2Rlcy5mb3JFYWNoKHNwYWNlID0+IHtcbiAgICAgICAgLy8gICAgIHJvb3RTcGFjZXMucHVzaChzcGFjZSk7XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIHRoaXMub3JwaGFuZWRSb29tcyA9IG5ldyBTZXQob3JwaGFuZWRSb29tcyk7XG4gICAgICAgIHRoaXMucm9vdFNwYWNlcyA9IHJvb3RTcGFjZXM7XG4gICAgICAgIHRoaXMucGFyZW50TWFwID0gYmFja3JlZnM7XG5cbiAgICAgICAgLy8gaWYgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzcGFjZSBubyBsb25nZXIgZXhpc3RzLCByZW1vdmUgaXRzIHNlbGVjdGlvblxuICAgICAgICBpZiAodGhpcy5fYWN0aXZlU3BhY2UgJiYgZGV0YWNoZWROb2Rlcy5oYXModGhpcy5fYWN0aXZlU3BhY2UpKSB7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVNwYWNlKG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vblJvb21zVXBkYXRlKCk7IC8vIFRPRE8gb25seSBkbyB0aGlzIGlmIGEgY2hhbmdlIGhhcyBoYXBwZW5lZFxuICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX1RPUF9MRVZFTF9TUEFDRVMsIHRoaXMuc3BhY2VQYW5lbFNwYWNlcyk7XG5cbiAgICAgICAgLy8gYnVpbGQgaW5pdGlhbCBzdGF0ZSBvZiBpbnZpdGVkIHNwYWNlcyBhcyB3ZSB3b3VsZCBoYXZlIG1pc3NlZCB0aGUgZW1pdHRlZCBldmVudHMgYWJvdXQgdGhlIHJvb20gYXQgbGF1bmNoXG4gICAgICAgIHRoaXMuX2ludml0ZWRTcGFjZXMgPSBuZXcgU2V0KGludml0ZWRTcGFjZXMpO1xuICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX0lOVklURURfU1BBQ0VTLCB0aGlzLmludml0ZWRTcGFjZXMpO1xuICAgIH0sIDEwMCwge3RyYWlsaW5nOiB0cnVlLCBsZWFkaW5nOiB0cnVlfSk7XG5cbiAgICBvblNwYWNlVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnJlYnVpbGQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dJbkhvbWVTcGFjZSA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmIChyb29tLmlzU3BhY2VSb29tKCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuICF0aGlzLnBhcmVudE1hcC5nZXQocm9vbS5yb29tSWQpPy5zaXplIC8vIHB1dCBhbGwgb3JwaGFuZWQgcm9vbXMgaW4gdGhlIEhvbWUgU3BhY2VcbiAgICAgICAgICAgIHx8IERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbS5yb29tSWQpIC8vIHB1dCBhbGwgRE1zIGluIHRoZSBIb21lIFNwYWNlXG4gICAgICAgICAgICB8fCBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldFRhZ3NGb3JSb29tKHJvb20pLmluY2x1ZGVzKERlZmF1bHRUYWdJRC5GYXZvdXJpdGUpIC8vIHNob3cgYWxsIGZhdm91cml0ZXNcbiAgICB9O1xuXG4gICAgLy8gVXBkYXRlIGEgZ2l2ZW4gcm9vbSBkdWUgdG8gaXRzIHRhZyBjaGFuZ2luZyAoZS5nIERNLW5lc3Mgb3IgRmF2LW5lc3MpXG4gICAgLy8gVGhpcyBjYW4gb25seSBjaGFuZ2Ugd2hldGhlciBpdCBzaG93cyB1cCBpbiB0aGUgSE9NRV9TUEFDRSBvciBub3RcbiAgICBwcml2YXRlIG9uUm9vbVVwZGF0ZSA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnNob3dJbkhvbWVTcGFjZShyb29tKSkge1xuICAgICAgICAgICAgdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXMuZ2V0KEhPTUVfU1BBQ0UpPy5hZGQocm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KEhPTUVfU1BBQ0UpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9ycGhhbmVkUm9vbXMuaGFzKHJvb20ucm9vbUlkKSkge1xuICAgICAgICAgICAgdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXMuZ2V0KEhPTUVfU1BBQ0UpPy5kZWxldGUocm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KEhPTUVfU1BBQ0UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TcGFjZU1lbWJlcnNDaGFuZ2UgPSAoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIC8vIHNraXAgdGhpcyB1cGRhdGUgaWYgd2UgZG8gbm90IGhhdmUgYSBETSB3aXRoIHRoaXMgdXNlclxuICAgICAgICBpZiAoRE1Sb29tTWFwLnNoYXJlZCgpLmdldERNUm9vbXNGb3JVc2VySWQoZXYuZ2V0U3RhdGVLZXkoKSkubGVuZ3RoIDwgMSkgcmV0dXJuO1xuICAgICAgICB0aGlzLm9uUm9vbXNVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21zVXBkYXRlID0gdGhyb3R0bGUoKCkgPT4ge1xuICAgICAgICAvLyBUT0RPIHJlc29sdmUgc29tZSB1cGRhdGVzIGFzIGRlbHRhc1xuICAgICAgICBjb25zdCB2aXNpYmxlUm9vbXMgPSB0aGlzLm1hdHJpeENsaWVudC5nZXRWaXNpYmxlUm9vbXMoKTtcblxuICAgICAgICBjb25zdCBvbGRGaWx0ZXJlZFJvb21zID0gdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXM7XG4gICAgICAgIHRoaXMuc3BhY2VGaWx0ZXJlZFJvb21zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIC8vIHB1dCBhbGwgcm9vbSBpbnZpdGVzIGluIHRoZSBIb21lIFNwYWNlXG4gICAgICAgIGNvbnN0IGludml0ZXMgPSB2aXNpYmxlUm9vbXMuZmlsdGVyKHIgPT4gIXIuaXNTcGFjZVJvb20oKSAmJiByLmdldE15TWVtYmVyc2hpcCgpID09PSBcImludml0ZVwiKTtcbiAgICAgICAgdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXMuc2V0KEhPTUVfU1BBQ0UsIG5ldyBTZXQ8c3RyaW5nPihpbnZpdGVzLm1hcChyb29tID0+IHJvb20ucm9vbUlkKSkpO1xuXG4gICAgICAgIHZpc2libGVSb29tcy5mb3JFYWNoKHJvb20gPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd0luSG9tZVNwYWNlKHJvb20pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXMuZ2V0KEhPTUVfU1BBQ0UpLmFkZChyb29tLnJvb21JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucm9vdFNwYWNlcy5mb3JFYWNoKHMgPT4ge1xuICAgICAgICAgICAgLy8gdHJhdmVyc2UgZWFjaCBzcGFjZSB0cmVlIGluIERGUyB0byBidWlsZCB1cCB0aGUgc3VwZXJzZXRzIGFzIHlvdSBnbyB1cCxcbiAgICAgICAgICAgIC8vIHJldXNpbmcgcmVzdWx0cyBmcm9tIGxpa2Ugc3VidHJlZXMuXG4gICAgICAgICAgICBjb25zdCBmbiA9IChzcGFjZUlkOiBzdHJpbmcsIHBhcmVudFBhdGg6IFNldDxzdHJpbmc+KTogU2V0PHN0cmluZz4gPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRQYXRoLmhhcyhzcGFjZUlkKSkgcmV0dXJuOyAvLyBwcmV2ZW50IGN5Y2xlc1xuXG4gICAgICAgICAgICAgICAgLy8gcmV1c2UgZXhpc3RpbmcgcmVzdWx0cyBpZiBtdWx0aXBsZSBzaW1pbGFyIGJyYW5jaGVzIGV4aXN0XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3BhY2VGaWx0ZXJlZFJvb21zLmhhcyhzcGFjZUlkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXMuZ2V0KHNwYWNlSWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IFtjaGlsZFNwYWNlcywgY2hpbGRSb29tc10gPSBwYXJ0aXRpb25TcGFjZXNBbmRSb29tcyh0aGlzLmdldENoaWxkcmVuKHNwYWNlSWQpKTtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tSWRzID0gbmV3IFNldChjaGlsZFJvb21zLm1hcChyID0+IHIucm9vbUlkKSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BhY2UgPSB0aGlzLm1hdHJpeENsaWVudD8uZ2V0Um9vbShzcGFjZUlkKTtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCByZWxldmFudCBETXNcbiAgICAgICAgICAgICAgICBzcGFjZT8uZ2V0Sm9pbmVkTWVtYmVycygpLmZvckVhY2gobWVtYmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgRE1Sb29tTWFwLnNoYXJlZCgpLmdldERNUm9vbXNGb3JVc2VySWQobWVtYmVyLnVzZXJJZCkuZm9yRWFjaChyb29tSWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkcy5hZGQocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRoID0gbmV3IFNldChwYXJlbnRQYXRoKS5hZGQoc3BhY2VJZCk7XG4gICAgICAgICAgICAgICAgY2hpbGRTcGFjZXMuZm9yRWFjaChjaGlsZFNwYWNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZm4oY2hpbGRTcGFjZS5yb29tSWQsIG5ld1BhdGgpPy5mb3JFYWNoKHJvb21JZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tSWRzLmFkZChyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwYWNlRmlsdGVyZWRSb29tcy5zZXQoc3BhY2VJZCwgcm9vbUlkcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvb21JZHM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmbihzLnJvb21JZCwgbmV3IFNldCgpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZGlmZiA9IG1hcERpZmYob2xkRmlsdGVyZWRSb29tcywgdGhpcy5zcGFjZUZpbHRlcmVkUm9vbXMpO1xuICAgICAgICAvLyBmaWx0ZXIgb3V0IGtleXMgd2hpY2ggY2hhbmdlZCBieSByZWZlcmVuY2Ugb25seSBieSBjaGVja2luZyB3aGV0aGVyIHRoZSBzZXRzIGRpZmZlclxuICAgICAgICBjb25zdCBjaGFuZ2VkID0gZGlmZi5jaGFuZ2VkLmZpbHRlcihrID0+IHNldEhhc0RpZmYob2xkRmlsdGVyZWRSb29tcy5nZXQoayksIHRoaXMuc3BhY2VGaWx0ZXJlZFJvb21zLmdldChrKSkpO1xuICAgICAgICBbLi4uZGlmZi5hZGRlZCwgLi4uZGlmZi5yZW1vdmVkLCAuLi5jaGFuZ2VkXS5mb3JFYWNoKGsgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KGspO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwYWNlRmlsdGVyZWRSb29tcy5mb3JFYWNoKChyb29tSWRzLCBzKSA9PiB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgTm90aWZpY2F0aW9uU3RhdGVzXG4gICAgICAgICAgICB0aGlzLmdldE5vdGlmaWNhdGlvblN0YXRlKHMpPy5zZXRSb29tcyh2aXNpYmxlUm9vbXMuZmlsdGVyKHJvb20gPT4gcm9vbUlkcy5oYXMocm9vbS5yb29tSWQpKSk7XG4gICAgICAgIH0pO1xuICAgIH0sIDEwMCwge3RyYWlsaW5nOiB0cnVlLCBsZWFkaW5nOiB0cnVlfSk7XG5cbiAgICBwcml2YXRlIG9uUm9vbSA9IChyb29tOiBSb29tLCBuZXdNZW1iZXJzaGlwPzogc3RyaW5nLCBvbGRNZW1iZXJzaGlwPzogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSBuZXdNZW1iZXJzaGlwIHx8IHJvb20uZ2V0TXlNZW1iZXJzaGlwKCk7XG5cbiAgICAgICAgaWYgKCFyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgIC8vIHRoaXMub25Sb29tVXBkYXRlKHJvb20pO1xuICAgICAgICAgICAgdGhpcy5vblJvb21zVXBkYXRlKCk7XG5cbiAgICAgICAgICAgIGlmIChtZW1iZXJzaGlwID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgICAgIC8vIHRoZSB1c2VyIGp1c3Qgam9pbmVkIGEgcm9vbSwgcmVtb3ZlIGl0IGZyb20gdGhlIHN1Z2dlc3RlZCBsaXN0IGlmIGl0IHdhcyB0aGVyZVxuICAgICAgICAgICAgICAgIGNvbnN0IG51bVN1Z2dlc3RlZFJvb21zID0gdGhpcy5fc3VnZ2VzdGVkUm9vbXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1Z2dlc3RlZFJvb21zID0gdGhpcy5fc3VnZ2VzdGVkUm9vbXMuZmlsdGVyKHIgPT4gci5yb29tX2lkICE9PSByb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKG51bVN1Z2dlc3RlZFJvb21zICE9PSB0aGlzLl9zdWdnZXN0ZWRSb29tcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KFNVR0dFU1RFRF9ST09NUywgdGhpcy5fc3VnZ2VzdGVkUm9vbXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwYWNlXG4gICAgICAgIGlmIChtZW1iZXJzaGlwID09PSBcImludml0ZVwiKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnZpdGVkU3BhY2VzLmFkZChyb29tKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdChVUERBVEVfSU5WSVRFRF9TUEFDRVMsIHRoaXMuaW52aXRlZFNwYWNlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAob2xkTWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiAmJiBtZW1iZXJzaGlwICE9PSBcImpvaW5cIikge1xuICAgICAgICAgICAgdGhpcy5faW52aXRlZFNwYWNlcy5kZWxldGUocm9vbSk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX0lOVklURURfU1BBQ0VTLCB0aGlzLmludml0ZWRTcGFjZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vblNwYWNlVXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmVtaXQocm9vbS5yb29tSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lbWJlcnNoaXAgPT09IFwiam9pblwiICYmIHJvb20ucm9vbUlkID09PSBSb29tVmlld1N0b3JlLmdldFJvb21JZCgpKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgdXNlciB3YXMgbG9va2luZyBhdCB0aGUgc3BhY2UgYW5kIHRoZW4gam9pbmVkOiBzZWxlY3QgdGhhdCBzcGFjZVxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVTcGFjZShyb29tKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlID0gKGV2OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShldi5nZXRSb29tSWQoKSk7XG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoZXYuZ2V0VHlwZSgpKSB7XG4gICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5TcGFjZUNoaWxkOlxuICAgICAgICAgICAgICAgIGlmIChyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNwYWNlVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChyb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5TcGFjZVBhcmVudDpcbiAgICAgICAgICAgICAgICAvLyBUT0RPIHJlYnVpbGQgdGhlIHNwYWNlIHBhcmVudCBhbmQgbm90IHRoZSByb29tIC0gY2hlY2sgcGVybWlzc2lvbnM/XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBjb25maXJtIHRoaXMgYWZ0ZXIgaW1wbGVtZW50aW5nIHBhcmVudGluZyBiZWhhdmlvdXJcbiAgICAgICAgICAgICAgICBpZiAocm9vbS5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TcGFjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Sb29tVXBkYXRlKHJvb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQocm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5Sb29tTWVtYmVyOlxuICAgICAgICAgICAgICAgIGlmIChyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNwYWNlTWVtYmVyc0NoYW5nZShldik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tQWNjb3VudERhdGEgPSAoZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tLCBsYXN0RXZlbnQ/OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuVGFnICYmICFyb29tLmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSByb29tIHdhcyBpbiBmYXZvdXJpdGVzIGFuZCBub3cgaXNuJ3Qgb3IgdGhlIG9wcG9zaXRlIHRoZW4gdXBkYXRlIGl0cyBwb3NpdGlvbiBpbiB0aGUgdHJlZXNcbiAgICAgICAgICAgIGNvbnN0IG9sZFRhZ3MgPSBsYXN0RXZlbnQ/LmdldENvbnRlbnQoKT8udGFncyB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhZ3MgPSBldi5nZXRDb250ZW50KCk/LnRhZ3MgfHwge307XG4gICAgICAgICAgICBpZiAoISFvbGRUYWdzW0RlZmF1bHRUYWdJRC5GYXZvdXJpdGVdICE9PSAhIW5ld1RhZ3NbRGVmYXVsdFRhZ0lELkZhdm91cml0ZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUm9vbVVwZGF0ZShyb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25BY2NvdW50RGF0YSA9IChldjogTWF0cml4RXZlbnQsIGxhc3RFdmVudDogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLkRpcmVjdCkge1xuICAgICAgICAgICAgY29uc3QgbGFzdENvbnRlbnQgPSBsYXN0RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGV2LmdldENvbnRlbnQoKTtcblxuICAgICAgICAgICAgY29uc3QgZGlmZiA9IG9iamVjdERpZmY8UmVjb3JkPHN0cmluZywgc3RyaW5nW10+PihsYXN0Q29udGVudCwgY29udGVudCk7XG4gICAgICAgICAgICAvLyBmaWx0ZXIgb3V0IGtleXMgd2hpY2ggY2hhbmdlZCBieSByZWZlcmVuY2Ugb25seSBieSBjaGVja2luZyB3aGV0aGVyIHRoZSBzZXRzIGRpZmZlclxuICAgICAgICAgICAgY29uc3QgY2hhbmdlZCA9IGRpZmYuY2hhbmdlZC5maWx0ZXIoayA9PiBhcnJheUhhc0RpZmYobGFzdENvbnRlbnRba10sIGNvbnRlbnRba10pKTtcbiAgICAgICAgICAgIC8vIERNIHRhZyBjaGFuZ2VzLCByZWZyZXNoIHJlbGV2YW50IHJvb21zXG4gICAgICAgICAgICBuZXcgU2V0KFsuLi5kaWZmLmFkZGVkLCAuLi5kaWZmLnJlbW92ZWQsIC4uLmNoYW5nZWRdKS5mb3JFYWNoKHJvb21JZCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50Py5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJvb21VcGRhdGUocm9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJvdGVjdGVkIGFzeW5jIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnJvb3RTcGFjZXMgPSBbXTtcbiAgICAgICAgdGhpcy5vcnBoYW5lZFJvb21zID0gbmV3IFNldCgpO1xuICAgICAgICB0aGlzLnBhcmVudE1hcCA9IG5ldyBFbmhhbmNlZE1hcCgpO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvblN0YXRlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnNwYWNlRmlsdGVyZWRSb29tcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlU3BhY2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9zdWdnZXN0ZWRSb29tcyA9IFtdO1xuICAgICAgICB0aGlzLl9pbnZpdGVkU3BhY2VzID0gbmV3IFNldCgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbk5vdFJlYWR5KCkge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3NwYWNlc1wiKSkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5tYXRyaXhDbGllbnQpIHtcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbVwiLCB0aGlzLm9uUm9vbSk7XG4gICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihcIlJvb20ubXlNZW1iZXJzaGlwXCIsIHRoaXMub25Sb29tKTtcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLm9uUm9vbVN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiUm9vbS5hY2NvdW50RGF0YVwiLCB0aGlzLm9uUm9vbUFjY291bnREYXRhKTtcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFwiYWNjb3VudERhdGFcIiwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLnJlc2V0KCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uUmVhZHkoKSB7XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfc3BhY2VzXCIpKSByZXR1cm47XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50Lm9uKFwiUm9vbVwiLCB0aGlzLm9uUm9vbSk7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50Lm9uKFwiUm9vbS5teU1lbWJlcnNoaXBcIiwgdGhpcy5vblJvb20pO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vbihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblJvb21TdGF0ZSk7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50Lm9uKFwiUm9vbS5hY2NvdW50RGF0YVwiLCB0aGlzLm9uUm9vbUFjY291bnREYXRhKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oXCJhY2NvdW50RGF0YVwiLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMub25TcGFjZVVwZGF0ZSgpOyAvLyB0cmlnZ2VyIGFuIGluaXRpYWwgdXBkYXRlXG5cbiAgICAgICAgLy8gcmVzdG9yZSBzZWxlY3RlZCBzdGF0ZSBmcm9tIGxhc3Qgc2Vzc2lvbiBpZiBhbnkgYW5kIHN0aWxsIHZhbGlkXG4gICAgICAgIGNvbnN0IGxhc3RTcGFjZUlkID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKEFDVElWRV9TUEFDRV9MU19LRVkpO1xuICAgICAgICBpZiAobGFzdFNwYWNlSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNwYWNlID0gdGhpcy5yb290U3BhY2VzLmZpbmQocyA9PiBzLnJvb21JZCA9PT0gbGFzdFNwYWNlSWQpO1xuICAgICAgICAgICAgaWYgKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVTcGFjZShzcGFjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25BY3Rpb24ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3NwYWNlc1wiKSkgcmV0dXJuO1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFwidmlld19yb29tXCI6IHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQ/LmdldFJvb20ocGF5bG9hZC5yb29tX2lkKTtcblxuICAgICAgICAgICAgICAgIC8vIERvbid0IGF1dG8tc3dpdGNoIHJvb21zIHdoZW4gcmVhY3RpbmcgdG8gYSBjb250ZXh0LXN3aXRjaFxuICAgICAgICAgICAgICAgIC8vIGFzIHRoaXMgaXMgbm90IGhlbHBmdWwgYW5kIGNhbiBjcmVhdGUgbG9vcHMgb2Ygcm9vbXMvc3BhY2Ugc3dpdGNoaW5nXG4gICAgICAgICAgICAgICAgaWYgKCFyb29tIHx8IHBheWxvYWQuY29udGV4dF9zd2l0Y2gpIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBjb250ZXh0IHN3aXRjaCB3aGVuIG5hdmlnYXRpbmcgdG8gdGhlIHNwYWNlIHJvb21cbiAgICAgICAgICAgICAgICAgICAgLy8gYXMgaXQgd2lsbCBjYXVzZSB5b3UgdG8gZW5kIHVwIGluIHRoZSB3cm9uZyByb29tXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlU3BhY2Uocm9vbSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuZ2V0U3BhY2VGaWx0ZXJlZFJvb21JZHModGhpcy5hY3RpdmVTcGFjZSkuaGFzKHJvb20ucm9vbUlkKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5nZXRDYW5vbmljYWxQYXJlbnQocm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5yb290U3BhY2VzLmZpbmQocyA9PiB0aGlzLnNwYWNlRmlsdGVyZWRSb29tcy5nZXQocy5yb29tSWQpPy5oYXMocm9vbS5yb29tSWQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50cyA9IEFycmF5LmZyb20odGhpcy5wYXJlbnRNYXAuZ2V0KHJvb20ucm9vbUlkKSB8fCBbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnRzLmZpbmQocCA9PiB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBkb24ndCB0cmlnZ2VyIGEgY29udGV4dCBzd2l0Y2ggd2hlbiB3ZSBhcmUgc3dpdGNoaW5nIGEgc3BhY2UgdG8gbWF0Y2ggdGhlIGNob3NlbiByb29tXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlU3BhY2UocGFyZW50IHx8IG51bGwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBQZXJzaXN0IGxhc3Qgdmlld2VkIHJvb20gZnJvbSBhIHNwYWNlXG4gICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgYXdhaXQgc2V0QWN0aXZlU3BhY2UgYWJvdmUgYXMgd2Ugb25seSBjYXJlIGFib3V0IHRoaXMuYWN0aXZlU3BhY2UgYmVpbmcgdXAgdG8gZGF0ZVxuICAgICAgICAgICAgICAgIC8vIHN5bmNocm9ub3VzbHkgZm9yIHRoZSBiZWxvdyBjb2RlIC0gZXZlcnl0aGluZyBlbHNlIGNhbiBhbmQgc2hvdWxkIGJlIGFzeW5jLlxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShnZXRTcGFjZUNvbnRleHRLZXkodGhpcy5hY3RpdmVTcGFjZSksIHBheWxvYWQucm9vbV9pZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiYWZ0ZXJfbGVhdmVfcm9vbVwiOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVTcGFjZSAmJiBwYXlsb2FkLnJvb21faWQgPT09IHRoaXMuX2FjdGl2ZVNwYWNlLnJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVNwYWNlKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXROb3RpZmljYXRpb25TdGF0ZShrZXk6IFNwYWNlS2V5KTogU3BhY2VOb3RpZmljYXRpb25TdGF0ZSB7XG4gICAgICAgIGlmICh0aGlzLm5vdGlmaWNhdGlvblN0YXRlTWFwLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub3RpZmljYXRpb25TdGF0ZU1hcC5nZXQoa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0YXRlID0gbmV3IFNwYWNlTm90aWZpY2F0aW9uU3RhdGUoa2V5LCBnZXRSb29tRm4pO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvblN0YXRlTWFwLnNldChrZXksIHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIC8vIHRyYXZlcnNlIHNwYWNlIHRyZWUgd2l0aCBERlMgY2FsbGluZyBmbiBvbiBlYWNoIHNwYWNlIGluY2x1ZGluZyB0aGUgZ2l2ZW4gcm9vdCBvbmUsXG4gICAgLy8gaWYgaW5jbHVkZVJvb21zIGlzIHRydWUgdGhlbiBmbiB3aWxsIGJlIGNhbGxlZCBvbiBlYWNoIGxlYWYgcm9vbSwgaWYgaXQgaXMgcHJlc2VudCBpbiBtdWx0aXBsZSBzdWItc3BhY2VzXG4gICAgLy8gdGhlbiBmbiB3aWxsIGJlIGNhbGxlZCB3aXRoIGl0IG11bHRpcGxlIHRpbWVzLlxuICAgIHB1YmxpYyB0cmF2ZXJzZVNwYWNlKFxuICAgICAgICBzcGFjZUlkOiBzdHJpbmcsXG4gICAgICAgIGZuOiAocm9vbUlkOiBzdHJpbmcpID0+IHZvaWQsXG4gICAgICAgIGluY2x1ZGVSb29tcyA9IGZhbHNlLFxuICAgICAgICBwYXJlbnRQYXRoPzogU2V0PHN0cmluZz4sXG4gICAgKSB7XG4gICAgICAgIGlmIChwYXJlbnRQYXRoICYmIHBhcmVudFBhdGguaGFzKHNwYWNlSWQpKSByZXR1cm47IC8vIHByZXZlbnQgY3ljbGVzXG5cbiAgICAgICAgZm4oc3BhY2VJZCk7XG5cbiAgICAgICAgY29uc3QgbmV3UGF0aCA9IG5ldyBTZXQocGFyZW50UGF0aCkuYWRkKHNwYWNlSWQpO1xuICAgICAgICBjb25zdCBbY2hpbGRTcGFjZXMsIGNoaWxkUm9vbXNdID0gcGFydGl0aW9uU3BhY2VzQW5kUm9vbXModGhpcy5nZXRDaGlsZHJlbihzcGFjZUlkKSk7XG5cbiAgICAgICAgaWYgKGluY2x1ZGVSb29tcykge1xuICAgICAgICAgICAgY2hpbGRSb29tcy5mb3JFYWNoKHIgPT4gZm4oci5yb29tSWQpKTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZFNwYWNlcy5mb3JFYWNoKHMgPT4gdGhpcy50cmF2ZXJzZVNwYWNlKHMucm9vbUlkLCBmbiwgaW5jbHVkZVJvb21zLCBuZXdQYXRoKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGFjZVN0b3JlIHtcbiAgICBwcml2YXRlIHN0YXRpYyBpbnRlcm5hbEluc3RhbmNlID0gbmV3IFNwYWNlU3RvcmVDbGFzcygpO1xuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKTogU3BhY2VTdG9yZUNsYXNzIHtcbiAgICAgICAgcmV0dXJuIFNwYWNlU3RvcmUuaW50ZXJuYWxJbnN0YW5jZTtcbiAgICB9XG59XG5cbndpbmRvdy5teFNwYWNlU3RvcmUgPSBTcGFjZVN0b3JlLmluc3RhbmNlO1xuIl19