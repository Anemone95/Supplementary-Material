"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeGenericPermalink = makeGenericPermalink;
exports.makeUserPermalink = makeUserPermalink;
exports.makeRoomPermalink = makeRoomPermalink;
exports.makeGroupPermalink = makeGroupPermalink;
exports.isPermalinkHost = isPermalinkHost;
exports.tryTransformEntityToPermalink = tryTransformEntityToPermalink;
exports.tryTransformPermalinkToLocalHref = tryTransformPermalinkToLocalHref;
exports.getPrimaryPermalinkEntity = getPrimaryPermalinkEntity;
exports.parsePermalink = parsePermalink;
exports.parseAppLocalLink = parseAppLocalLink;
exports.calculateRoomVia = exports.RoomPermalinkCreator = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _isIp = _interopRequireDefault(require("is-ip"));

var utils = _interopRequireWildcard(require("matrix-js-sdk/src/utils"));

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _SpecPermalinkConstructor = _interopRequireWildcard(require("./SpecPermalinkConstructor"));

var _ElementPermalinkConstructor = _interopRequireDefault(require("./ElementPermalinkConstructor"));

var _linkifyMatrix = _interopRequireDefault(require("../../linkify-matrix"));

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
// The maximum number of servers to pick when working out which servers
// to add to permalinks. The servers are appended as ?via=example.org
const MAX_SERVER_CANDIDATES = 3; // Permalinks can have servers appended to them so that the user
// receiving them can have a fighting chance at joining the room.
// These servers are called "candidates" at this point because
// it is unclear whether they are going to be useful to actually
// join in the future.
//
// We pick 3 servers based on the following criteria:
//
//   Server 1: The highest power level user in the room, provided
//   they are at least PL 50. We don't calculate "what is a moderator"
//   here because it is less relevant for the vast majority of rooms.
//   We also want to ensure that we get an admin or high-ranking mod
//   as they are less likely to leave the room. If no user happens
//   to meet this criteria, we'll pick the most popular server in the
//   room.
//
//   Server 2: The next most popular server in the room (in user
//   distribution). This cannot be the same as Server 1. If no other
//   servers are available then we'll only return Server 1.
//
//   Server 3: The next most popular server by user distribution. This
//   has the same rules as Server 2, with the added exception that it
//   must be unique from Server 1 and 2.
// Rationale for popular servers: It's hard to get rid of people when
// they keep flocking in from a particular server. Sure, the server could
// be ACL'd in the future or for some reason be evicted from the room
// however an event like that is unlikely the larger the room gets. If
// the server is ACL'd at the time of generating the link however, we
// shouldn't pick them. We also don't pick IP addresses.
// Note: we don't pick the server the room was created on because the
// homeserver should already be using that server as a last ditch attempt
// and there's less of a guarantee that the server is a resident server.
// Instead, we actively figure out which servers are likely to be residents
// in the future and try to use those.
// Note: Users receiving permalinks that happen to have all 3 potential
// servers fail them (in terms of joining) are somewhat expected to hunt
// down the person who gave them the link to ask for a participating server.
// The receiving user can then manually append the known-good server to
// the list and magically have the link work.

class RoomPermalinkCreator {
  // We support being given a roomId as a fallback in the event the `room` object
  // doesn't exist or is not healthy for us to rely on. For example, loading a
  // permalink to a room which the MatrixClient doesn't know about.
  constructor(room
  /*: Room*/
  , roomId
  /*: string*/
  = null) {
    (0, _defineProperty2.default)(this, "room", void 0);
    (0, _defineProperty2.default)(this, "roomId", void 0);
    (0, _defineProperty2.default)(this, "highestPlUserId", void 0);
    (0, _defineProperty2.default)(this, "populationMap", void 0);
    (0, _defineProperty2.default)(this, "bannedHostsRegexps", void 0);
    (0, _defineProperty2.default)(this, "allowedHostsRegexps", void 0);
    (0, _defineProperty2.default)(this, "_serverCandidates", void 0);
    (0, _defineProperty2.default)(this, "started", void 0);
    (0, _defineProperty2.default)(this, "onRoomState", (event
    /*: MatrixEvent*/
    ) => {
      switch (event.getType()) {
        case _event.EventType.RoomServerAcl:
          this.updateAllowedServers();
          this.updateHighestPlUser();
          this.updatePopulationMap();
          this.updateServerCandidates();
          return;

        case _event.EventType.RoomPowerLevels:
          this.updateHighestPlUser();
          this.updateServerCandidates();
          return;
      }
    });
    (0, _defineProperty2.default)(this, "onMembership", (evt
    /*: MatrixEvent*/
    , member
    /*: RoomMember*/
    , oldMembership
    /*: string*/
    ) => {
      const userId = member.userId;
      const membership = member.membership;
      const serverName = getServerName(userId);
      const hasJoined = oldMembership !== "join" && membership === "join";
      const hasLeft = oldMembership === "join" && membership !== "join";

      if (hasLeft) {
        this.populationMap[serverName]--;
      } else if (hasJoined) {
        this.populationMap[serverName]++;
      }

      this.updateHighestPlUser();
      this.updateServerCandidates();
    });
    this.room = room;
    this.roomId = room ? room.roomId : roomId;
    this.highestPlUserId = null;
    this.populationMap = null;
    this.bannedHostsRegexps = null;
    this.allowedHostsRegexps = null;
    this._serverCandidates = null;
    this.started = false;

    if (!this.roomId) {
      throw new Error("Failed to resolve a roomId for the permalink creator to use");
    }
  }

  load() {
    if (!this.room || !this.room.currentState) {
      // Under rare and unknown circumstances it is possible to have a room with no
      // currentState, at least potentially at the early stages of joining a room.
      // To avoid breaking everything, we'll just warn rather than throw as well as
      // not bother updating the various aspects of the share link.
      console.warn("Tried to load a permalink creator with no room state");
      return;
    }

    this.updateAllowedServers();
    this.updateHighestPlUser();
    this.updatePopulationMap();
    this.updateServerCandidates();
  }

  start() {
    this.load();
    this.room.on("RoomMember.membership", this.onMembership);
    this.room.on("RoomState.events", this.onRoomState);
    this.started = true;
  }

  stop() {
    this.room.removeListener("RoomMember.membership", this.onMembership);
    this.room.removeListener("RoomState.events", this.onRoomState);
    this.started = false;
  }

  get serverCandidates() {
    return this._serverCandidates;
  }

  isStarted() {
    return this.started;
  }

  forEvent(eventId
  /*: string*/
  )
  /*: string*/
  {
    return getPermalinkConstructor().forEvent(this.roomId, eventId, this._serverCandidates);
  }

  forShareableRoom()
  /*: string*/
  {
    if (this.room) {
      // Prefer to use canonical alias for permalink if possible
      const alias = this.room.getCanonicalAlias();

      if (alias) {
        return getPermalinkConstructor().forRoom(alias, this._serverCandidates);
      }
    }

    return getPermalinkConstructor().forRoom(this.roomId, this._serverCandidates);
  }

  forRoom()
  /*: string*/
  {
    return getPermalinkConstructor().forRoom(this.roomId, this._serverCandidates);
  }

  updateHighestPlUser() {
    const plEvent = this.room.currentState.getStateEvents("m.room.power_levels", "");

    if (plEvent) {
      const content = plEvent.getContent();

      if (content) {
        const users = content.users;

        if (users) {
          const entries = Object.entries(users);
          const allowedEntries = entries.filter(([userId]) => {
            const member = this.room.getMember(userId);

            if (!member || member.membership !== "join") {
              return false;
            }

            const serverName = getServerName(userId);
            return !isHostnameIpAddress(serverName) && !isHostInRegex(serverName, this.bannedHostsRegexps) && isHostInRegex(serverName, this.allowedHostsRegexps);
          });
          const maxEntry = allowedEntries.reduce((max, entry) => {
            return entry[1] > max[1] ? entry : max;
          }, [null, 0]);
          const [userId, powerLevel] = maxEntry; // object wasn't empty, and max entry wasn't a demotion from the default

          if (userId !== null && powerLevel >= 50) {
            this.highestPlUserId = userId;
            return;
          }
        }
      }
    }

    this.highestPlUserId = null;
  }

  updateAllowedServers() {
    const bannedHostsRegexps = [];
    let allowedHostsRegexps = [new RegExp(".*")]; // default allow everyone

    if (this.room.currentState) {
      const aclEvent = this.room.currentState.getStateEvents("m.room.server_acl", "");

      if (aclEvent && aclEvent.getContent()) {
        const getRegex = hostname => new RegExp("^" + utils.globToRegexp(hostname, false) + "$");

        const denied = aclEvent.getContent().deny || [];
        denied.forEach(h => bannedHostsRegexps.push(getRegex(h)));
        const allowed = aclEvent.getContent().allow || [];
        allowedHostsRegexps = []; // we don't want to use the default rule here

        allowed.forEach(h => allowedHostsRegexps.push(getRegex(h)));
      }
    }

    this.bannedHostsRegexps = bannedHostsRegexps;
    this.allowedHostsRegexps = allowedHostsRegexps;
  }

  updatePopulationMap() {
    const populationMap
    /*: { [server: string]: number }*/
    = {};

    for (const member of this.room.getJoinedMembers()) {
      const serverName = getServerName(member.userId);

      if (!populationMap[serverName]) {
        populationMap[serverName] = 0;
      }

      populationMap[serverName]++;
    }

    this.populationMap = populationMap;
  }

  updateServerCandidates() {
    let candidates = [];

    if (this.highestPlUserId) {
      candidates.push(getServerName(this.highestPlUserId));
    }

    const serversByPopulation = Object.keys(this.populationMap).sort((a, b) => this.populationMap[b] - this.populationMap[a]).filter(a => {
      return !candidates.includes(a) && !isHostnameIpAddress(a) && !isHostInRegex(a, this.bannedHostsRegexps) && isHostInRegex(a, this.allowedHostsRegexps);
    });
    const remainingServers = serversByPopulation.slice(0, MAX_SERVER_CANDIDATES - candidates.length);
    candidates = candidates.concat(remainingServers);
    this._serverCandidates = candidates;
  }

}

exports.RoomPermalinkCreator = RoomPermalinkCreator;

function makeGenericPermalink(entityId
/*: string*/
)
/*: string*/
{
  return getPermalinkConstructor().forEntity(entityId);
}

function makeUserPermalink(userId
/*: string*/
)
/*: string*/
{
  return getPermalinkConstructor().forUser(userId);
}

function makeRoomPermalink(roomId
/*: string*/
)
/*: string*/
{
  if (!roomId) {
    throw new Error("can't permalink a falsey roomId");
  } // If the roomId isn't actually a room ID, don't try to list the servers.
  // Aliases are already routable, and don't need extra information.


  if (roomId[0] !== '!') return getPermalinkConstructor().forRoom(roomId, []);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  const room = client.getRoom(roomId);

  if (!room) {
    return getPermalinkConstructor().forRoom(roomId, []);
  }

  const permalinkCreator = new RoomPermalinkCreator(room);
  permalinkCreator.load();
  return permalinkCreator.forRoom();
}

function makeGroupPermalink(groupId
/*: string*/
)
/*: string*/
{
  return getPermalinkConstructor().forGroup(groupId);
}

function isPermalinkHost(host
/*: string*/
)
/*: boolean*/
{
  // Always check if the permalink is a spec permalink (callers are likely to call
  // parsePermalink after this function).
  if (new _SpecPermalinkConstructor.default().isPermalinkHost(host)) return true;
  return getPermalinkConstructor().isPermalinkHost(host);
}
/**
 * Transforms an entity (permalink, room alias, user ID, etc) into a local URL
 * if possible. If the given entity is not found to be valid enough to be converted
 * then a null value will be returned.
 * @param {string} entity The entity to transform.
 * @returns {string|null} The transformed permalink or null if unable.
 */


function tryTransformEntityToPermalink(entity
/*: string*/
)
/*: string*/
{
  if (!entity) return null; // Check to see if it is a bare entity for starters

  if (entity[0] === '#' || entity[0] === '!') return makeRoomPermalink(entity);
  if (entity[0] === '@') return makeUserPermalink(entity);
  if (entity[0] === '+') return makeGroupPermalink(entity); // Then try and merge it into a permalink

  return tryTransformPermalinkToLocalHref(entity);
}
/**
 * Transforms a permalink (or possible permalink) into a local URL if possible. If
 * the given permalink is found to not be a permalink, it'll be returned unaltered.
 * @param {string} permalink The permalink to try and transform.
 * @returns {string} The transformed permalink or original URL if unable.
 */


function tryTransformPermalinkToLocalHref(permalink
/*: string*/
)
/*: string*/
{
  if (!permalink.startsWith("http:") && !permalink.startsWith("https:")) {
    return permalink;
  }

  const m = decodeURIComponent(permalink).match(_linkifyMatrix.default.ELEMENT_URL_PATTERN);

  if (m) {
    return m[1];
  } // A bit of a hack to convert permalinks of unknown origin to Element links


  try {
    const permalinkParts = parsePermalink(permalink);

    if (permalinkParts) {
      if (permalinkParts.roomIdOrAlias) {
        const eventIdPart = permalinkParts.eventId ? `/${permalinkParts.eventId}` : '';
        permalink = `#/room/${permalinkParts.roomIdOrAlias}${eventIdPart}`;

        if (permalinkParts.viaServers.length > 0) {
          permalink += new _SpecPermalinkConstructor.default().encodeServerCandidates(permalinkParts.viaServers);
        }
      } else if (permalinkParts.groupId) {
        permalink = `#/group/${permalinkParts.groupId}`;
      } else if (permalinkParts.userId) {
        permalink = `#/user/${permalinkParts.userId}`;
      } // else not a valid permalink for our purposes - do not handle

    }
  } catch (e) {// Not an href we need to care about
  }

  return permalink;
}

function getPrimaryPermalinkEntity(permalink
/*: string*/
)
/*: string*/
{
  try {
    let permalinkParts = parsePermalink(permalink); // If not a permalink, try the vector patterns.

    if (!permalinkParts) {
      const m = permalink.match(_linkifyMatrix.default.ELEMENT_URL_PATTERN);

      if (m) {
        // A bit of a hack, but it gets the job done
        const handler = new _ElementPermalinkConstructor.default("http://localhost");
        const entityInfo = m[1].split('#').slice(1).join('#');
        permalinkParts = handler.parsePermalink(`http://localhost/#${entityInfo}`);
      }
    }

    if (!permalinkParts) return null; // not processable

    if (permalinkParts.userId) return permalinkParts.userId;
    if (permalinkParts.groupId) return permalinkParts.groupId;
    if (permalinkParts.roomIdOrAlias) return permalinkParts.roomIdOrAlias;
  } catch (e) {// no entity - not a permalink
  }

  return null;
}

function getPermalinkConstructor()
/*: PermalinkConstructor*/
{
  const elementPrefix = _SdkConfig.default.get()['permalinkPrefix'];

  if (elementPrefix && elementPrefix !== _SpecPermalinkConstructor.baseUrl) {
    return new _ElementPermalinkConstructor.default(elementPrefix);
  }

  return new _SpecPermalinkConstructor.default();
}

function parsePermalink(fullUrl
/*: string*/
)
/*: PermalinkParts*/
{
  const elementPrefix = _SdkConfig.default.get()['permalinkPrefix'];

  if (decodeURIComponent(fullUrl).startsWith(_SpecPermalinkConstructor.baseUrl)) {
    return new _SpecPermalinkConstructor.default().parsePermalink(decodeURIComponent(fullUrl));
  } else if (elementPrefix && fullUrl.startsWith(elementPrefix)) {
    return new _ElementPermalinkConstructor.default(elementPrefix).parsePermalink(fullUrl);
  }

  return null; // not a permalink we can handle
}
/**
 * Parses an app local link (`#/(user|room|group)/identifer`) to a Matrix entity
 * (room, user, group). Such links are produced by `HtmlUtils` when encountering
 * links, which calls `tryTransformPermalinkToLocalHref` in this module.
 * @param {string} localLink The app local link
 * @returns {PermalinkParts}
 */


function parseAppLocalLink(localLink
/*: string*/
)
/*: PermalinkParts*/
{
  try {
    const segments = localLink.replace("#/", "");
    return _ElementPermalinkConstructor.default.parseAppRoute(segments);
  } catch (e) {// Ignore failures
  }

  return null;
}

function getServerName(userId
/*: string*/
)
/*: string*/
{
  return userId.split(":").splice(1).join(":");
}

function getHostnameFromMatrixDomain(domain
/*: string*/
)
/*: string*/
{
  if (!domain) return null;
  return new URL(`https://${domain}`).hostname;
}

function isHostInRegex(hostname
/*: string*/
, regexps
/*: RegExp[]*/
) {
  hostname = getHostnameFromMatrixDomain(hostname);
  if (!hostname) return true; // assumed

  if (regexps.length > 0 && !regexps[0].test) throw new Error(regexps[0].toString());
  return regexps.filter(h => h.test(hostname)).length > 0;
}

function isHostnameIpAddress(hostname
/*: string*/
)
/*: boolean*/
{
  hostname = getHostnameFromMatrixDomain(hostname);
  if (!hostname) return false; // is-ip doesn't want IPv6 addresses surrounded by brackets, so
  // take them off.

  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.substring(1, hostname.length - 1);
  }

  return (0, _isIp.default)(hostname);
}

const calculateRoomVia = (room
/*: Room*/
) => {
  const permalinkCreator = new RoomPermalinkCreator(room);
  permalinkCreator.load();
  return permalinkCreator.serverCandidates;
};

exports.calculateRoomVia = calculateRoomVia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3MudHMiXSwibmFtZXMiOlsiTUFYX1NFUlZFUl9DQU5ESURBVEVTIiwiUm9vbVBlcm1hbGlua0NyZWF0b3IiLCJjb25zdHJ1Y3RvciIsInJvb20iLCJyb29tSWQiLCJldmVudCIsImdldFR5cGUiLCJFdmVudFR5cGUiLCJSb29tU2VydmVyQWNsIiwidXBkYXRlQWxsb3dlZFNlcnZlcnMiLCJ1cGRhdGVIaWdoZXN0UGxVc2VyIiwidXBkYXRlUG9wdWxhdGlvbk1hcCIsInVwZGF0ZVNlcnZlckNhbmRpZGF0ZXMiLCJSb29tUG93ZXJMZXZlbHMiLCJldnQiLCJtZW1iZXIiLCJvbGRNZW1iZXJzaGlwIiwidXNlcklkIiwibWVtYmVyc2hpcCIsInNlcnZlck5hbWUiLCJnZXRTZXJ2ZXJOYW1lIiwiaGFzSm9pbmVkIiwiaGFzTGVmdCIsInBvcHVsYXRpb25NYXAiLCJoaWdoZXN0UGxVc2VySWQiLCJiYW5uZWRIb3N0c1JlZ2V4cHMiLCJhbGxvd2VkSG9zdHNSZWdleHBzIiwiX3NlcnZlckNhbmRpZGF0ZXMiLCJzdGFydGVkIiwiRXJyb3IiLCJsb2FkIiwiY3VycmVudFN0YXRlIiwiY29uc29sZSIsIndhcm4iLCJzdGFydCIsIm9uIiwib25NZW1iZXJzaGlwIiwib25Sb29tU3RhdGUiLCJzdG9wIiwicmVtb3ZlTGlzdGVuZXIiLCJzZXJ2ZXJDYW5kaWRhdGVzIiwiaXNTdGFydGVkIiwiZm9yRXZlbnQiLCJldmVudElkIiwiZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IiLCJmb3JTaGFyZWFibGVSb29tIiwiYWxpYXMiLCJnZXRDYW5vbmljYWxBbGlhcyIsImZvclJvb20iLCJwbEV2ZW50IiwiZ2V0U3RhdGVFdmVudHMiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsInVzZXJzIiwiZW50cmllcyIsIk9iamVjdCIsImFsbG93ZWRFbnRyaWVzIiwiZmlsdGVyIiwiZ2V0TWVtYmVyIiwiaXNIb3N0bmFtZUlwQWRkcmVzcyIsImlzSG9zdEluUmVnZXgiLCJtYXhFbnRyeSIsInJlZHVjZSIsIm1heCIsImVudHJ5IiwicG93ZXJMZXZlbCIsIlJlZ0V4cCIsImFjbEV2ZW50IiwiZ2V0UmVnZXgiLCJob3N0bmFtZSIsInV0aWxzIiwiZ2xvYlRvUmVnZXhwIiwiZGVuaWVkIiwiZGVueSIsImZvckVhY2giLCJoIiwicHVzaCIsImFsbG93ZWQiLCJhbGxvdyIsImdldEpvaW5lZE1lbWJlcnMiLCJjYW5kaWRhdGVzIiwic2VydmVyc0J5UG9wdWxhdGlvbiIsImtleXMiLCJzb3J0IiwiYSIsImIiLCJpbmNsdWRlcyIsInJlbWFpbmluZ1NlcnZlcnMiLCJzbGljZSIsImxlbmd0aCIsImNvbmNhdCIsIm1ha2VHZW5lcmljUGVybWFsaW5rIiwiZW50aXR5SWQiLCJmb3JFbnRpdHkiLCJtYWtlVXNlclBlcm1hbGluayIsImZvclVzZXIiLCJtYWtlUm9vbVBlcm1hbGluayIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFJvb20iLCJwZXJtYWxpbmtDcmVhdG9yIiwibWFrZUdyb3VwUGVybWFsaW5rIiwiZ3JvdXBJZCIsImZvckdyb3VwIiwiaXNQZXJtYWxpbmtIb3N0IiwiaG9zdCIsIlNwZWNQZXJtYWxpbmtDb25zdHJ1Y3RvciIsInRyeVRyYW5zZm9ybUVudGl0eVRvUGVybWFsaW5rIiwiZW50aXR5IiwidHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWYiLCJwZXJtYWxpbmsiLCJzdGFydHNXaXRoIiwibSIsImRlY29kZVVSSUNvbXBvbmVudCIsIm1hdGNoIiwibWF0cml4TGlua2lmeSIsIkVMRU1FTlRfVVJMX1BBVFRFUk4iLCJwZXJtYWxpbmtQYXJ0cyIsInBhcnNlUGVybWFsaW5rIiwicm9vbUlkT3JBbGlhcyIsImV2ZW50SWRQYXJ0IiwidmlhU2VydmVycyIsImVuY29kZVNlcnZlckNhbmRpZGF0ZXMiLCJlIiwiZ2V0UHJpbWFyeVBlcm1hbGlua0VudGl0eSIsImhhbmRsZXIiLCJFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IiLCJlbnRpdHlJbmZvIiwic3BsaXQiLCJqb2luIiwiZWxlbWVudFByZWZpeCIsIlNka0NvbmZpZyIsIm1hdHJpeHRvQmFzZVVybCIsImZ1bGxVcmwiLCJwYXJzZUFwcExvY2FsTGluayIsImxvY2FsTGluayIsInNlZ21lbnRzIiwicmVwbGFjZSIsInBhcnNlQXBwUm91dGUiLCJzcGxpY2UiLCJnZXRIb3N0bmFtZUZyb21NYXRyaXhEb21haW4iLCJkb21haW4iLCJVUkwiLCJyZWdleHBzIiwidGVzdCIsInRvU3RyaW5nIiwiZW5kc1dpdGgiLCJzdWJzdHJpbmciLCJjYWxjdWxhdGVSb29tVmlhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFJQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0JBO0FBQ0E7QUFDQSxNQUFNQSxxQkFBcUIsR0FBRyxDQUE5QixDLENBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPLE1BQU1DLG9CQUFOLENBQTJCO0FBVTlCO0FBQ0E7QUFDQTtBQUNBQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFhQztBQUFjO0FBQUEsSUFBRyxJQUE5QixFQUFvQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx1REFzRXpCLENBQUNDO0FBQUQ7QUFBQSxTQUF3QjtBQUMxQyxjQUFRQSxLQUFLLENBQUNDLE9BQU4sRUFBUjtBQUNJLGFBQUtDLGlCQUFVQyxhQUFmO0FBQ0ksZUFBS0Msb0JBQUw7QUFDQSxlQUFLQyxtQkFBTDtBQUNBLGVBQUtDLG1CQUFMO0FBQ0EsZUFBS0Msc0JBQUw7QUFDQTs7QUFDSixhQUFLTCxpQkFBVU0sZUFBZjtBQUNJLGVBQUtILG1CQUFMO0FBQ0EsZUFBS0Usc0JBQUw7QUFDQTtBQVZSO0FBWUgsS0FuRjhDO0FBQUEsd0RBcUZ4QixDQUFDRTtBQUFEO0FBQUEsTUFBbUJDO0FBQW5CO0FBQUEsTUFBdUNDO0FBQXZDO0FBQUEsU0FBaUU7QUFDcEYsWUFBTUMsTUFBTSxHQUFHRixNQUFNLENBQUNFLE1BQXRCO0FBQ0EsWUFBTUMsVUFBVSxHQUFHSCxNQUFNLENBQUNHLFVBQTFCO0FBQ0EsWUFBTUMsVUFBVSxHQUFHQyxhQUFhLENBQUNILE1BQUQsQ0FBaEM7QUFDQSxZQUFNSSxTQUFTLEdBQUdMLGFBQWEsS0FBSyxNQUFsQixJQUE0QkUsVUFBVSxLQUFLLE1BQTdEO0FBQ0EsWUFBTUksT0FBTyxHQUFHTixhQUFhLEtBQUssTUFBbEIsSUFBNEJFLFVBQVUsS0FBSyxNQUEzRDs7QUFFQSxVQUFJSSxPQUFKLEVBQWE7QUFDVCxhQUFLQyxhQUFMLENBQW1CSixVQUFuQjtBQUNILE9BRkQsTUFFTyxJQUFJRSxTQUFKLEVBQWU7QUFDbEIsYUFBS0UsYUFBTCxDQUFtQkosVUFBbkI7QUFDSDs7QUFFRCxXQUFLVCxtQkFBTDtBQUNBLFdBQUtFLHNCQUFMO0FBQ0gsS0FwRzhDO0FBQzNDLFNBQUtULElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLE1BQUwsR0FBY0QsSUFBSSxHQUFHQSxJQUFJLENBQUNDLE1BQVIsR0FBaUJBLE1BQW5DO0FBQ0EsU0FBS29CLGVBQUwsR0FBdUIsSUFBdkI7QUFDQSxTQUFLRCxhQUFMLEdBQXFCLElBQXJCO0FBQ0EsU0FBS0Usa0JBQUwsR0FBMEIsSUFBMUI7QUFDQSxTQUFLQyxtQkFBTCxHQUEyQixJQUEzQjtBQUNBLFNBQUtDLGlCQUFMLEdBQXlCLElBQXpCO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLEtBQWY7O0FBRUEsUUFBSSxDQUFDLEtBQUt4QixNQUFWLEVBQWtCO0FBQ2QsWUFBTSxJQUFJeUIsS0FBSixDQUFVLDZEQUFWLENBQU47QUFDSDtBQUNKOztBQUVEQyxFQUFBQSxJQUFJLEdBQUc7QUFDSCxRQUFJLENBQUMsS0FBSzNCLElBQU4sSUFBYyxDQUFDLEtBQUtBLElBQUwsQ0FBVTRCLFlBQTdCLEVBQTJDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0FDLE1BQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLHNEQUFiO0FBQ0E7QUFDSDs7QUFDRCxTQUFLeEIsb0JBQUw7QUFDQSxTQUFLQyxtQkFBTDtBQUNBLFNBQUtDLG1CQUFMO0FBQ0EsU0FBS0Msc0JBQUw7QUFDSDs7QUFFRHNCLEVBQUFBLEtBQUssR0FBRztBQUNKLFNBQUtKLElBQUw7QUFDQSxTQUFLM0IsSUFBTCxDQUFVZ0MsRUFBVixDQUFhLHVCQUFiLEVBQXNDLEtBQUtDLFlBQTNDO0FBQ0EsU0FBS2pDLElBQUwsQ0FBVWdDLEVBQVYsQ0FBYSxrQkFBYixFQUFpQyxLQUFLRSxXQUF0QztBQUNBLFNBQUtULE9BQUwsR0FBZSxJQUFmO0FBQ0g7O0FBRURVLEVBQUFBLElBQUksR0FBRztBQUNILFNBQUtuQyxJQUFMLENBQVVvQyxjQUFWLENBQXlCLHVCQUF6QixFQUFrRCxLQUFLSCxZQUF2RDtBQUNBLFNBQUtqQyxJQUFMLENBQVVvQyxjQUFWLENBQXlCLGtCQUF6QixFQUE2QyxLQUFLRixXQUFsRDtBQUNBLFNBQUtULE9BQUwsR0FBZSxLQUFmO0FBQ0g7O0FBRUQsTUFBSVksZ0JBQUosR0FBdUI7QUFDbkIsV0FBTyxLQUFLYixpQkFBWjtBQUNIOztBQUVEYyxFQUFBQSxTQUFTLEdBQUc7QUFDUixXQUFPLEtBQUtiLE9BQVo7QUFDSDs7QUFFRGMsRUFBQUEsUUFBUSxDQUFDQztBQUFEO0FBQUE7QUFBQTtBQUEwQjtBQUM5QixXQUFPQyx1QkFBdUIsR0FBR0YsUUFBMUIsQ0FBbUMsS0FBS3RDLE1BQXhDLEVBQWdEdUMsT0FBaEQsRUFBeUQsS0FBS2hCLGlCQUE5RCxDQUFQO0FBQ0g7O0FBRURrQixFQUFBQSxnQkFBZ0I7QUFBQTtBQUFXO0FBQ3ZCLFFBQUksS0FBSzFDLElBQVQsRUFBZTtBQUNYO0FBQ0EsWUFBTTJDLEtBQUssR0FBRyxLQUFLM0MsSUFBTCxDQUFVNEMsaUJBQVYsRUFBZDs7QUFDQSxVQUFJRCxLQUFKLEVBQVc7QUFDUCxlQUFPRix1QkFBdUIsR0FBR0ksT0FBMUIsQ0FBa0NGLEtBQWxDLEVBQXlDLEtBQUtuQixpQkFBOUMsQ0FBUDtBQUNIO0FBQ0o7O0FBQ0QsV0FBT2lCLHVCQUF1QixHQUFHSSxPQUExQixDQUFrQyxLQUFLNUMsTUFBdkMsRUFBK0MsS0FBS3VCLGlCQUFwRCxDQUFQO0FBQ0g7O0FBRURxQixFQUFBQSxPQUFPO0FBQUE7QUFBVztBQUNkLFdBQU9KLHVCQUF1QixHQUFHSSxPQUExQixDQUFrQyxLQUFLNUMsTUFBdkMsRUFBK0MsS0FBS3VCLGlCQUFwRCxDQUFQO0FBQ0g7O0FBa0NPakIsRUFBQUEsbUJBQVIsR0FBOEI7QUFDMUIsVUFBTXVDLE9BQU8sR0FBRyxLQUFLOUMsSUFBTCxDQUFVNEIsWUFBVixDQUF1Qm1CLGNBQXZCLENBQXNDLHFCQUF0QyxFQUE2RCxFQUE3RCxDQUFoQjs7QUFDQSxRQUFJRCxPQUFKLEVBQWE7QUFDVCxZQUFNRSxPQUFPLEdBQUdGLE9BQU8sQ0FBQ0csVUFBUixFQUFoQjs7QUFDQSxVQUFJRCxPQUFKLEVBQWE7QUFDVCxjQUFNRSxLQUFLLEdBQUdGLE9BQU8sQ0FBQ0UsS0FBdEI7O0FBQ0EsWUFBSUEsS0FBSixFQUFXO0FBQ1AsZ0JBQU1DLE9BQU8sR0FBR0MsTUFBTSxDQUFDRCxPQUFQLENBQWVELEtBQWYsQ0FBaEI7QUFDQSxnQkFBTUcsY0FBYyxHQUFHRixPQUFPLENBQUNHLE1BQVIsQ0FBZSxDQUFDLENBQUN4QyxNQUFELENBQUQsS0FBYztBQUNoRCxrQkFBTUYsTUFBTSxHQUFHLEtBQUtaLElBQUwsQ0FBVXVELFNBQVYsQ0FBb0J6QyxNQUFwQixDQUFmOztBQUNBLGdCQUFJLENBQUNGLE1BQUQsSUFBV0EsTUFBTSxDQUFDRyxVQUFQLEtBQXNCLE1BQXJDLEVBQTZDO0FBQ3pDLHFCQUFPLEtBQVA7QUFDSDs7QUFDRCxrQkFBTUMsVUFBVSxHQUFHQyxhQUFhLENBQUNILE1BQUQsQ0FBaEM7QUFDQSxtQkFBTyxDQUFDMEMsbUJBQW1CLENBQUN4QyxVQUFELENBQXBCLElBQ0gsQ0FBQ3lDLGFBQWEsQ0FBQ3pDLFVBQUQsRUFBYSxLQUFLTSxrQkFBbEIsQ0FEWCxJQUVIbUMsYUFBYSxDQUFDekMsVUFBRCxFQUFhLEtBQUtPLG1CQUFsQixDQUZqQjtBQUdILFdBVHNCLENBQXZCO0FBVUEsZ0JBQU1tQyxRQUFRLEdBQUdMLGNBQWMsQ0FBQ00sTUFBZixDQUFzQixDQUFDQyxHQUFELEVBQU1DLEtBQU4sS0FBZ0I7QUFDbkQsbUJBQVFBLEtBQUssQ0FBQyxDQUFELENBQUwsR0FBV0QsR0FBRyxDQUFDLENBQUQsQ0FBZixHQUFzQkMsS0FBdEIsR0FBOEJELEdBQXJDO0FBQ0gsV0FGZ0IsRUFFZCxDQUFDLElBQUQsRUFBTyxDQUFQLENBRmMsQ0FBakI7QUFHQSxnQkFBTSxDQUFDOUMsTUFBRCxFQUFTZ0QsVUFBVCxJQUF1QkosUUFBN0IsQ0FmTyxDQWdCUDs7QUFDQSxjQUFJNUMsTUFBTSxLQUFLLElBQVgsSUFBbUJnRCxVQUFVLElBQUksRUFBckMsRUFBeUM7QUFDckMsaUJBQUt6QyxlQUFMLEdBQXVCUCxNQUF2QjtBQUNBO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7O0FBQ0QsU0FBS08sZUFBTCxHQUF1QixJQUF2QjtBQUNIOztBQUVPZixFQUFBQSxvQkFBUixHQUErQjtBQUMzQixVQUFNZ0Isa0JBQWtCLEdBQUcsRUFBM0I7QUFDQSxRQUFJQyxtQkFBbUIsR0FBRyxDQUFDLElBQUl3QyxNQUFKLENBQVcsSUFBWCxDQUFELENBQTFCLENBRjJCLENBRW1COztBQUM5QyxRQUFJLEtBQUsvRCxJQUFMLENBQVU0QixZQUFkLEVBQTRCO0FBQ3hCLFlBQU1vQyxRQUFRLEdBQUcsS0FBS2hFLElBQUwsQ0FBVTRCLFlBQVYsQ0FBdUJtQixjQUF2QixDQUFzQyxtQkFBdEMsRUFBMkQsRUFBM0QsQ0FBakI7O0FBQ0EsVUFBSWlCLFFBQVEsSUFBSUEsUUFBUSxDQUFDZixVQUFULEVBQWhCLEVBQXVDO0FBQ25DLGNBQU1nQixRQUFRLEdBQUlDLFFBQUQsSUFBYyxJQUFJSCxNQUFKLENBQVcsTUFBTUksS0FBSyxDQUFDQyxZQUFOLENBQW1CRixRQUFuQixFQUE2QixLQUE3QixDQUFOLEdBQTRDLEdBQXZELENBQS9COztBQUVBLGNBQU1HLE1BQU0sR0FBR0wsUUFBUSxDQUFDZixVQUFULEdBQXNCcUIsSUFBdEIsSUFBOEIsRUFBN0M7QUFDQUQsUUFBQUEsTUFBTSxDQUFDRSxPQUFQLENBQWVDLENBQUMsSUFBSWxELGtCQUFrQixDQUFDbUQsSUFBbkIsQ0FBd0JSLFFBQVEsQ0FBQ08sQ0FBRCxDQUFoQyxDQUFwQjtBQUVBLGNBQU1FLE9BQU8sR0FBR1YsUUFBUSxDQUFDZixVQUFULEdBQXNCMEIsS0FBdEIsSUFBK0IsRUFBL0M7QUFDQXBELFFBQUFBLG1CQUFtQixHQUFHLEVBQXRCLENBUG1DLENBT1Q7O0FBQzFCbUQsUUFBQUEsT0FBTyxDQUFDSCxPQUFSLENBQWdCQyxDQUFDLElBQUlqRCxtQkFBbUIsQ0FBQ2tELElBQXBCLENBQXlCUixRQUFRLENBQUNPLENBQUQsQ0FBakMsQ0FBckI7QUFDSDtBQUNKOztBQUNELFNBQUtsRCxrQkFBTCxHQUEwQkEsa0JBQTFCO0FBQ0EsU0FBS0MsbUJBQUwsR0FBMkJBLG1CQUEzQjtBQUNIOztBQUVPZixFQUFBQSxtQkFBUixHQUE4QjtBQUMxQixVQUFNWTtBQUEyQztBQUFBLE1BQUcsRUFBcEQ7O0FBQ0EsU0FBSyxNQUFNUixNQUFYLElBQXFCLEtBQUtaLElBQUwsQ0FBVTRFLGdCQUFWLEVBQXJCLEVBQW1EO0FBQy9DLFlBQU01RCxVQUFVLEdBQUdDLGFBQWEsQ0FBQ0wsTUFBTSxDQUFDRSxNQUFSLENBQWhDOztBQUNBLFVBQUksQ0FBQ00sYUFBYSxDQUFDSixVQUFELENBQWxCLEVBQWdDO0FBQzVCSSxRQUFBQSxhQUFhLENBQUNKLFVBQUQsQ0FBYixHQUE0QixDQUE1QjtBQUNIOztBQUNESSxNQUFBQSxhQUFhLENBQUNKLFVBQUQsQ0FBYjtBQUNIOztBQUNELFNBQUtJLGFBQUwsR0FBcUJBLGFBQXJCO0FBQ0g7O0FBRU9YLEVBQUFBLHNCQUFSLEdBQWlDO0FBQzdCLFFBQUlvRSxVQUFVLEdBQUcsRUFBakI7O0FBQ0EsUUFBSSxLQUFLeEQsZUFBVCxFQUEwQjtBQUN0QndELE1BQUFBLFVBQVUsQ0FBQ0osSUFBWCxDQUFnQnhELGFBQWEsQ0FBQyxLQUFLSSxlQUFOLENBQTdCO0FBQ0g7O0FBRUQsVUFBTXlELG1CQUFtQixHQUFHMUIsTUFBTSxDQUFDMkIsSUFBUCxDQUFZLEtBQUszRCxhQUFqQixFQUN2QjRELElBRHVCLENBQ2xCLENBQUNDLENBQUQsRUFBSUMsQ0FBSixLQUFVLEtBQUs5RCxhQUFMLENBQW1COEQsQ0FBbkIsSUFBd0IsS0FBSzlELGFBQUwsQ0FBbUI2RCxDQUFuQixDQURoQixFQUV2QjNCLE1BRnVCLENBRWhCMkIsQ0FBQyxJQUFJO0FBQ1QsYUFBTyxDQUFDSixVQUFVLENBQUNNLFFBQVgsQ0FBb0JGLENBQXBCLENBQUQsSUFDSCxDQUFDekIsbUJBQW1CLENBQUN5QixDQUFELENBRGpCLElBRUgsQ0FBQ3hCLGFBQWEsQ0FBQ3dCLENBQUQsRUFBSSxLQUFLM0Qsa0JBQVQsQ0FGWCxJQUdIbUMsYUFBYSxDQUFDd0IsQ0FBRCxFQUFJLEtBQUsxRCxtQkFBVCxDQUhqQjtBQUlILEtBUHVCLENBQTVCO0FBU0EsVUFBTTZELGdCQUFnQixHQUFHTixtQkFBbUIsQ0FBQ08sS0FBcEIsQ0FBMEIsQ0FBMUIsRUFBNkJ4RixxQkFBcUIsR0FBR2dGLFVBQVUsQ0FBQ1MsTUFBaEUsQ0FBekI7QUFDQVQsSUFBQUEsVUFBVSxHQUFHQSxVQUFVLENBQUNVLE1BQVgsQ0FBa0JILGdCQUFsQixDQUFiO0FBRUEsU0FBSzVELGlCQUFMLEdBQXlCcUQsVUFBekI7QUFDSDs7QUF2TTZCOzs7O0FBME0zQixTQUFTVyxvQkFBVCxDQUE4QkM7QUFBOUI7QUFBQTtBQUFBO0FBQXdEO0FBQzNELFNBQU9oRCx1QkFBdUIsR0FBR2lELFNBQTFCLENBQW9DRCxRQUFwQyxDQUFQO0FBQ0g7O0FBRU0sU0FBU0UsaUJBQVQsQ0FBMkI3RTtBQUEzQjtBQUFBO0FBQUE7QUFBbUQ7QUFDdEQsU0FBTzJCLHVCQUF1QixHQUFHbUQsT0FBMUIsQ0FBa0M5RSxNQUFsQyxDQUFQO0FBQ0g7O0FBRU0sU0FBUytFLGlCQUFULENBQTJCNUY7QUFBM0I7QUFBQTtBQUFBO0FBQW1EO0FBQ3RELE1BQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1QsVUFBTSxJQUFJeUIsS0FBSixDQUFVLGlDQUFWLENBQU47QUFDSCxHQUhxRCxDQUt0RDtBQUNBOzs7QUFDQSxNQUFJekIsTUFBTSxDQUFDLENBQUQsQ0FBTixLQUFjLEdBQWxCLEVBQXVCLE9BQU93Qyx1QkFBdUIsR0FBR0ksT0FBMUIsQ0FBa0M1QyxNQUFsQyxFQUEwQyxFQUExQyxDQUFQOztBQUV2QixRQUFNNkYsTUFBTSxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEVBQWY7O0FBQ0EsUUFBTWhHLElBQUksR0FBRzhGLE1BQU0sQ0FBQ0csT0FBUCxDQUFlaEcsTUFBZixDQUFiOztBQUNBLE1BQUksQ0FBQ0QsSUFBTCxFQUFXO0FBQ1AsV0FBT3lDLHVCQUF1QixHQUFHSSxPQUExQixDQUFrQzVDLE1BQWxDLEVBQTBDLEVBQTFDLENBQVA7QUFDSDs7QUFDRCxRQUFNaUcsZ0JBQWdCLEdBQUcsSUFBSXBHLG9CQUFKLENBQXlCRSxJQUF6QixDQUF6QjtBQUNBa0csRUFBQUEsZ0JBQWdCLENBQUN2RSxJQUFqQjtBQUNBLFNBQU91RSxnQkFBZ0IsQ0FBQ3JELE9BQWpCLEVBQVA7QUFDSDs7QUFFTSxTQUFTc0Qsa0JBQVQsQ0FBNEJDO0FBQTVCO0FBQUE7QUFBQTtBQUFxRDtBQUN4RCxTQUFPM0QsdUJBQXVCLEdBQUc0RCxRQUExQixDQUFtQ0QsT0FBbkMsQ0FBUDtBQUNIOztBQUVNLFNBQVNFLGVBQVQsQ0FBeUJDO0FBQXpCO0FBQUE7QUFBQTtBQUFnRDtBQUNuRDtBQUNBO0FBQ0EsTUFBSSxJQUFJQyxpQ0FBSixHQUErQkYsZUFBL0IsQ0FBK0NDLElBQS9DLENBQUosRUFBMEQsT0FBTyxJQUFQO0FBQzFELFNBQU85RCx1QkFBdUIsR0FBRzZELGVBQTFCLENBQTBDQyxJQUExQyxDQUFQO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU0UsNkJBQVQsQ0FBdUNDO0FBQXZDO0FBQUE7QUFBQTtBQUErRDtBQUNsRSxNQUFJLENBQUNBLE1BQUwsRUFBYSxPQUFPLElBQVAsQ0FEcUQsQ0FHbEU7O0FBQ0EsTUFBSUEsTUFBTSxDQUFDLENBQUQsQ0FBTixLQUFjLEdBQWQsSUFBcUJBLE1BQU0sQ0FBQyxDQUFELENBQU4sS0FBYyxHQUF2QyxFQUE0QyxPQUFPYixpQkFBaUIsQ0FBQ2EsTUFBRCxDQUF4QjtBQUM1QyxNQUFJQSxNQUFNLENBQUMsQ0FBRCxDQUFOLEtBQWMsR0FBbEIsRUFBdUIsT0FBT2YsaUJBQWlCLENBQUNlLE1BQUQsQ0FBeEI7QUFDdkIsTUFBSUEsTUFBTSxDQUFDLENBQUQsQ0FBTixLQUFjLEdBQWxCLEVBQXVCLE9BQU9QLGtCQUFrQixDQUFDTyxNQUFELENBQXpCLENBTjJDLENBUWxFOztBQUNBLFNBQU9DLGdDQUFnQyxDQUFDRCxNQUFELENBQXZDO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLFNBQVNDLGdDQUFULENBQTBDQztBQUExQztBQUFBO0FBQUE7QUFBcUU7QUFDeEUsTUFBSSxDQUFDQSxTQUFTLENBQUNDLFVBQVYsQ0FBcUIsT0FBckIsQ0FBRCxJQUFrQyxDQUFDRCxTQUFTLENBQUNDLFVBQVYsQ0FBcUIsUUFBckIsQ0FBdkMsRUFBdUU7QUFDbkUsV0FBT0QsU0FBUDtBQUNIOztBQUVELFFBQU1FLENBQUMsR0FBR0Msa0JBQWtCLENBQUNILFNBQUQsQ0FBbEIsQ0FBOEJJLEtBQTlCLENBQW9DQyx1QkFBY0MsbUJBQWxELENBQVY7O0FBQ0EsTUFBSUosQ0FBSixFQUFPO0FBQ0gsV0FBT0EsQ0FBQyxDQUFDLENBQUQsQ0FBUjtBQUNILEdBUnVFLENBVXhFOzs7QUFDQSxNQUFJO0FBQ0EsVUFBTUssY0FBYyxHQUFHQyxjQUFjLENBQUNSLFNBQUQsQ0FBckM7O0FBQ0EsUUFBSU8sY0FBSixFQUFvQjtBQUNoQixVQUFJQSxjQUFjLENBQUNFLGFBQW5CLEVBQWtDO0FBQzlCLGNBQU1DLFdBQVcsR0FBR0gsY0FBYyxDQUFDM0UsT0FBZixHQUEwQixJQUFHMkUsY0FBYyxDQUFDM0UsT0FBUSxFQUFwRCxHQUF3RCxFQUE1RTtBQUNBb0UsUUFBQUEsU0FBUyxHQUFJLFVBQVNPLGNBQWMsQ0FBQ0UsYUFBYyxHQUFFQyxXQUFZLEVBQWpFOztBQUNBLFlBQUlILGNBQWMsQ0FBQ0ksVUFBZixDQUEwQmpDLE1BQTFCLEdBQW1DLENBQXZDLEVBQTBDO0FBQ3RDc0IsVUFBQUEsU0FBUyxJQUFJLElBQUlKLGlDQUFKLEdBQStCZ0Isc0JBQS9CLENBQXNETCxjQUFjLENBQUNJLFVBQXJFLENBQWI7QUFDSDtBQUNKLE9BTkQsTUFNTyxJQUFJSixjQUFjLENBQUNmLE9BQW5CLEVBQTRCO0FBQy9CUSxRQUFBQSxTQUFTLEdBQUksV0FBVU8sY0FBYyxDQUFDZixPQUFRLEVBQTlDO0FBQ0gsT0FGTSxNQUVBLElBQUllLGNBQWMsQ0FBQ3JHLE1BQW5CLEVBQTJCO0FBQzlCOEYsUUFBQUEsU0FBUyxHQUFJLFVBQVNPLGNBQWMsQ0FBQ3JHLE1BQU8sRUFBNUM7QUFDSCxPQVhlLENBV2Q7O0FBQ0w7QUFDSixHQWZELENBZUUsT0FBTzJHLENBQVAsRUFBVSxDQUNSO0FBQ0g7O0FBRUQsU0FBT2IsU0FBUDtBQUNIOztBQUVNLFNBQVNjLHlCQUFULENBQW1DZDtBQUFuQztBQUFBO0FBQUE7QUFBOEQ7QUFDakUsTUFBSTtBQUNBLFFBQUlPLGNBQWMsR0FBR0MsY0FBYyxDQUFDUixTQUFELENBQW5DLENBREEsQ0FHQTs7QUFDQSxRQUFJLENBQUNPLGNBQUwsRUFBcUI7QUFDakIsWUFBTUwsQ0FBQyxHQUFHRixTQUFTLENBQUNJLEtBQVYsQ0FBZ0JDLHVCQUFjQyxtQkFBOUIsQ0FBVjs7QUFDQSxVQUFJSixDQUFKLEVBQU87QUFDSDtBQUNBLGNBQU1hLE9BQU8sR0FBRyxJQUFJQyxvQ0FBSixDQUFnQyxrQkFBaEMsQ0FBaEI7QUFDQSxjQUFNQyxVQUFVLEdBQUdmLENBQUMsQ0FBQyxDQUFELENBQUQsQ0FBS2dCLEtBQUwsQ0FBVyxHQUFYLEVBQWdCekMsS0FBaEIsQ0FBc0IsQ0FBdEIsRUFBeUIwQyxJQUF6QixDQUE4QixHQUE5QixDQUFuQjtBQUNBWixRQUFBQSxjQUFjLEdBQUdRLE9BQU8sQ0FBQ1AsY0FBUixDQUF3QixxQkFBb0JTLFVBQVcsRUFBdkQsQ0FBakI7QUFDSDtBQUNKOztBQUVELFFBQUksQ0FBQ1YsY0FBTCxFQUFxQixPQUFPLElBQVAsQ0FkckIsQ0Fja0M7O0FBQ2xDLFFBQUlBLGNBQWMsQ0FBQ3JHLE1BQW5CLEVBQTJCLE9BQU9xRyxjQUFjLENBQUNyRyxNQUF0QjtBQUMzQixRQUFJcUcsY0FBYyxDQUFDZixPQUFuQixFQUE0QixPQUFPZSxjQUFjLENBQUNmLE9BQXRCO0FBQzVCLFFBQUllLGNBQWMsQ0FBQ0UsYUFBbkIsRUFBa0MsT0FBT0YsY0FBYyxDQUFDRSxhQUF0QjtBQUNyQyxHQWxCRCxDQWtCRSxPQUFPSSxDQUFQLEVBQVUsQ0FDUjtBQUNIOztBQUVELFNBQU8sSUFBUDtBQUNIOztBQUVELFNBQVNoRix1QkFBVDtBQUFBO0FBQXlEO0FBQ3JELFFBQU11RixhQUFhLEdBQUdDLG1CQUFVakMsR0FBVixHQUFnQixpQkFBaEIsQ0FBdEI7O0FBQ0EsTUFBSWdDLGFBQWEsSUFBSUEsYUFBYSxLQUFLRSxpQ0FBdkMsRUFBd0Q7QUFDcEQsV0FBTyxJQUFJTixvQ0FBSixDQUFnQ0ksYUFBaEMsQ0FBUDtBQUNIOztBQUVELFNBQU8sSUFBSXhCLGlDQUFKLEVBQVA7QUFDSDs7QUFFTSxTQUFTWSxjQUFULENBQXdCZTtBQUF4QjtBQUFBO0FBQUE7QUFBeUQ7QUFDNUQsUUFBTUgsYUFBYSxHQUFHQyxtQkFBVWpDLEdBQVYsR0FBZ0IsaUJBQWhCLENBQXRCOztBQUNBLE1BQUllLGtCQUFrQixDQUFDb0IsT0FBRCxDQUFsQixDQUE0QnRCLFVBQTVCLENBQXVDcUIsaUNBQXZDLENBQUosRUFBNkQ7QUFDekQsV0FBTyxJQUFJMUIsaUNBQUosR0FBK0JZLGNBQS9CLENBQThDTCxrQkFBa0IsQ0FBQ29CLE9BQUQsQ0FBaEUsQ0FBUDtBQUNILEdBRkQsTUFFTyxJQUFJSCxhQUFhLElBQUlHLE9BQU8sQ0FBQ3RCLFVBQVIsQ0FBbUJtQixhQUFuQixDQUFyQixFQUF3RDtBQUMzRCxXQUFPLElBQUlKLG9DQUFKLENBQWdDSSxhQUFoQyxFQUErQ1osY0FBL0MsQ0FBOERlLE9BQTlELENBQVA7QUFDSDs7QUFFRCxTQUFPLElBQVAsQ0FSNEQsQ0FRL0M7QUFDaEI7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU0MsaUJBQVQsQ0FBMkJDO0FBQTNCO0FBQUE7QUFBQTtBQUE4RDtBQUNqRSxNQUFJO0FBQ0EsVUFBTUMsUUFBUSxHQUFHRCxTQUFTLENBQUNFLE9BQVYsQ0FBa0IsSUFBbEIsRUFBd0IsRUFBeEIsQ0FBakI7QUFDQSxXQUFPWCxxQ0FBNEJZLGFBQTVCLENBQTBDRixRQUExQyxDQUFQO0FBQ0gsR0FIRCxDQUdFLE9BQU9iLENBQVAsRUFBVSxDQUNSO0FBQ0g7O0FBQ0QsU0FBTyxJQUFQO0FBQ0g7O0FBRUQsU0FBU3hHLGFBQVQsQ0FBdUJIO0FBQXZCO0FBQUE7QUFBQTtBQUErQztBQUMzQyxTQUFPQSxNQUFNLENBQUNnSCxLQUFQLENBQWEsR0FBYixFQUFrQlcsTUFBbEIsQ0FBeUIsQ0FBekIsRUFBNEJWLElBQTVCLENBQWlDLEdBQWpDLENBQVA7QUFDSDs7QUFFRCxTQUFTVywyQkFBVCxDQUFxQ0M7QUFBckM7QUFBQTtBQUFBO0FBQTZEO0FBQ3pELE1BQUksQ0FBQ0EsTUFBTCxFQUFhLE9BQU8sSUFBUDtBQUNiLFNBQU8sSUFBSUMsR0FBSixDQUFTLFdBQVVELE1BQU8sRUFBMUIsRUFBNkJ6RSxRQUFwQztBQUNIOztBQUVELFNBQVNULGFBQVQsQ0FBdUJTO0FBQXZCO0FBQUEsRUFBeUMyRTtBQUF6QztBQUFBLEVBQTREO0FBQ3hEM0UsRUFBQUEsUUFBUSxHQUFHd0UsMkJBQTJCLENBQUN4RSxRQUFELENBQXRDO0FBQ0EsTUFBSSxDQUFDQSxRQUFMLEVBQWUsT0FBTyxJQUFQLENBRnlDLENBRTVCOztBQUM1QixNQUFJMkUsT0FBTyxDQUFDdkQsTUFBUixHQUFpQixDQUFqQixJQUFzQixDQUFDdUQsT0FBTyxDQUFDLENBQUQsQ0FBUCxDQUFXQyxJQUF0QyxFQUE0QyxNQUFNLElBQUlwSCxLQUFKLENBQVVtSCxPQUFPLENBQUMsQ0FBRCxDQUFQLENBQVdFLFFBQVgsRUFBVixDQUFOO0FBRTVDLFNBQU9GLE9BQU8sQ0FBQ3ZGLE1BQVIsQ0FBZWtCLENBQUMsSUFBSUEsQ0FBQyxDQUFDc0UsSUFBRixDQUFPNUUsUUFBUCxDQUFwQixFQUFzQ29CLE1BQXRDLEdBQStDLENBQXREO0FBQ0g7O0FBRUQsU0FBUzlCLG1CQUFULENBQTZCVTtBQUE3QjtBQUFBO0FBQUE7QUFBd0Q7QUFDcERBLEVBQUFBLFFBQVEsR0FBR3dFLDJCQUEyQixDQUFDeEUsUUFBRCxDQUF0QztBQUNBLE1BQUksQ0FBQ0EsUUFBTCxFQUFlLE9BQU8sS0FBUCxDQUZxQyxDQUlwRDtBQUNBOztBQUNBLE1BQUlBLFFBQVEsQ0FBQzJDLFVBQVQsQ0FBb0IsR0FBcEIsS0FBNEIzQyxRQUFRLENBQUM4RSxRQUFULENBQWtCLEdBQWxCLENBQWhDLEVBQXdEO0FBQ3BEOUUsSUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUMrRSxTQUFULENBQW1CLENBQW5CLEVBQXNCL0UsUUFBUSxDQUFDb0IsTUFBVCxHQUFrQixDQUF4QyxDQUFYO0FBQ0g7O0FBRUQsU0FBTyxtQkFBS3BCLFFBQUwsQ0FBUDtBQUNIOztBQUVNLE1BQU1nRixnQkFBZ0IsR0FBRyxDQUFDbEo7QUFBRDtBQUFBLEtBQWdCO0FBQzVDLFFBQU1rRyxnQkFBZ0IsR0FBRyxJQUFJcEcsb0JBQUosQ0FBeUJFLElBQXpCLENBQXpCO0FBQ0FrRyxFQUFBQSxnQkFBZ0IsQ0FBQ3ZFLElBQWpCO0FBQ0EsU0FBT3VFLGdCQUFnQixDQUFDN0QsZ0JBQXhCO0FBQ0gsQ0FKTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBpc0lwIGZyb20gXCJpcy1pcFwiO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHtFdmVudFR5cGV9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBTcGVjUGVybWFsaW5rQ29uc3RydWN0b3IsIHtiYXNlVXJsIGFzIG1hdHJpeHRvQmFzZVVybH0gZnJvbSBcIi4vU3BlY1Blcm1hbGlua0NvbnN0cnVjdG9yXCI7XG5pbXBvcnQgUGVybWFsaW5rQ29uc3RydWN0b3IsIHtQZXJtYWxpbmtQYXJ0c30gZnJvbSBcIi4vUGVybWFsaW5rQ29uc3RydWN0b3JcIjtcbmltcG9ydCBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IgZnJvbSBcIi4vRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yXCI7XG5pbXBvcnQgbWF0cml4TGlua2lmeSBmcm9tIFwiLi4vLi4vbGlua2lmeS1tYXRyaXhcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uL1Nka0NvbmZpZ1wiO1xuXG4vLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2VydmVycyB0byBwaWNrIHdoZW4gd29ya2luZyBvdXQgd2hpY2ggc2VydmVyc1xuLy8gdG8gYWRkIHRvIHBlcm1hbGlua3MuIFRoZSBzZXJ2ZXJzIGFyZSBhcHBlbmRlZCBhcyA/dmlhPWV4YW1wbGUub3JnXG5jb25zdCBNQVhfU0VSVkVSX0NBTkRJREFURVMgPSAzO1xuXG5cbi8vIFBlcm1hbGlua3MgY2FuIGhhdmUgc2VydmVycyBhcHBlbmRlZCB0byB0aGVtIHNvIHRoYXQgdGhlIHVzZXJcbi8vIHJlY2VpdmluZyB0aGVtIGNhbiBoYXZlIGEgZmlnaHRpbmcgY2hhbmNlIGF0IGpvaW5pbmcgdGhlIHJvb20uXG4vLyBUaGVzZSBzZXJ2ZXJzIGFyZSBjYWxsZWQgXCJjYW5kaWRhdGVzXCIgYXQgdGhpcyBwb2ludCBiZWNhdXNlXG4vLyBpdCBpcyB1bmNsZWFyIHdoZXRoZXIgdGhleSBhcmUgZ29pbmcgdG8gYmUgdXNlZnVsIHRvIGFjdHVhbGx5XG4vLyBqb2luIGluIHRoZSBmdXR1cmUuXG4vL1xuLy8gV2UgcGljayAzIHNlcnZlcnMgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBjcml0ZXJpYTpcbi8vXG4vLyAgIFNlcnZlciAxOiBUaGUgaGlnaGVzdCBwb3dlciBsZXZlbCB1c2VyIGluIHRoZSByb29tLCBwcm92aWRlZFxuLy8gICB0aGV5IGFyZSBhdCBsZWFzdCBQTCA1MC4gV2UgZG9uJ3QgY2FsY3VsYXRlIFwid2hhdCBpcyBhIG1vZGVyYXRvclwiXG4vLyAgIGhlcmUgYmVjYXVzZSBpdCBpcyBsZXNzIHJlbGV2YW50IGZvciB0aGUgdmFzdCBtYWpvcml0eSBvZiByb29tcy5cbi8vICAgV2UgYWxzbyB3YW50IHRvIGVuc3VyZSB0aGF0IHdlIGdldCBhbiBhZG1pbiBvciBoaWdoLXJhbmtpbmcgbW9kXG4vLyAgIGFzIHRoZXkgYXJlIGxlc3MgbGlrZWx5IHRvIGxlYXZlIHRoZSByb29tLiBJZiBubyB1c2VyIGhhcHBlbnNcbi8vICAgdG8gbWVldCB0aGlzIGNyaXRlcmlhLCB3ZSdsbCBwaWNrIHRoZSBtb3N0IHBvcHVsYXIgc2VydmVyIGluIHRoZVxuLy8gICByb29tLlxuLy9cbi8vICAgU2VydmVyIDI6IFRoZSBuZXh0IG1vc3QgcG9wdWxhciBzZXJ2ZXIgaW4gdGhlIHJvb20gKGluIHVzZXJcbi8vICAgZGlzdHJpYnV0aW9uKS4gVGhpcyBjYW5ub3QgYmUgdGhlIHNhbWUgYXMgU2VydmVyIDEuIElmIG5vIG90aGVyXG4vLyAgIHNlcnZlcnMgYXJlIGF2YWlsYWJsZSB0aGVuIHdlJ2xsIG9ubHkgcmV0dXJuIFNlcnZlciAxLlxuLy9cbi8vICAgU2VydmVyIDM6IFRoZSBuZXh0IG1vc3QgcG9wdWxhciBzZXJ2ZXIgYnkgdXNlciBkaXN0cmlidXRpb24uIFRoaXNcbi8vICAgaGFzIHRoZSBzYW1lIHJ1bGVzIGFzIFNlcnZlciAyLCB3aXRoIHRoZSBhZGRlZCBleGNlcHRpb24gdGhhdCBpdFxuLy8gICBtdXN0IGJlIHVuaXF1ZSBmcm9tIFNlcnZlciAxIGFuZCAyLlxuXG4vLyBSYXRpb25hbGUgZm9yIHBvcHVsYXIgc2VydmVyczogSXQncyBoYXJkIHRvIGdldCByaWQgb2YgcGVvcGxlIHdoZW5cbi8vIHRoZXkga2VlcCBmbG9ja2luZyBpbiBmcm9tIGEgcGFydGljdWxhciBzZXJ2ZXIuIFN1cmUsIHRoZSBzZXJ2ZXIgY291bGRcbi8vIGJlIEFDTCdkIGluIHRoZSBmdXR1cmUgb3IgZm9yIHNvbWUgcmVhc29uIGJlIGV2aWN0ZWQgZnJvbSB0aGUgcm9vbVxuLy8gaG93ZXZlciBhbiBldmVudCBsaWtlIHRoYXQgaXMgdW5saWtlbHkgdGhlIGxhcmdlciB0aGUgcm9vbSBnZXRzLiBJZlxuLy8gdGhlIHNlcnZlciBpcyBBQ0wnZCBhdCB0aGUgdGltZSBvZiBnZW5lcmF0aW5nIHRoZSBsaW5rIGhvd2V2ZXIsIHdlXG4vLyBzaG91bGRuJ3QgcGljayB0aGVtLiBXZSBhbHNvIGRvbid0IHBpY2sgSVAgYWRkcmVzc2VzLlxuXG4vLyBOb3RlOiB3ZSBkb24ndCBwaWNrIHRoZSBzZXJ2ZXIgdGhlIHJvb20gd2FzIGNyZWF0ZWQgb24gYmVjYXVzZSB0aGVcbi8vIGhvbWVzZXJ2ZXIgc2hvdWxkIGFscmVhZHkgYmUgdXNpbmcgdGhhdCBzZXJ2ZXIgYXMgYSBsYXN0IGRpdGNoIGF0dGVtcHRcbi8vIGFuZCB0aGVyZSdzIGxlc3Mgb2YgYSBndWFyYW50ZWUgdGhhdCB0aGUgc2VydmVyIGlzIGEgcmVzaWRlbnQgc2VydmVyLlxuLy8gSW5zdGVhZCwgd2UgYWN0aXZlbHkgZmlndXJlIG91dCB3aGljaCBzZXJ2ZXJzIGFyZSBsaWtlbHkgdG8gYmUgcmVzaWRlbnRzXG4vLyBpbiB0aGUgZnV0dXJlIGFuZCB0cnkgdG8gdXNlIHRob3NlLlxuXG4vLyBOb3RlOiBVc2VycyByZWNlaXZpbmcgcGVybWFsaW5rcyB0aGF0IGhhcHBlbiB0byBoYXZlIGFsbCAzIHBvdGVudGlhbFxuLy8gc2VydmVycyBmYWlsIHRoZW0gKGluIHRlcm1zIG9mIGpvaW5pbmcpIGFyZSBzb21ld2hhdCBleHBlY3RlZCB0byBodW50XG4vLyBkb3duIHRoZSBwZXJzb24gd2hvIGdhdmUgdGhlbSB0aGUgbGluayB0byBhc2sgZm9yIGEgcGFydGljaXBhdGluZyBzZXJ2ZXIuXG4vLyBUaGUgcmVjZWl2aW5nIHVzZXIgY2FuIHRoZW4gbWFudWFsbHkgYXBwZW5kIHRoZSBrbm93bi1nb29kIHNlcnZlciB0b1xuLy8gdGhlIGxpc3QgYW5kIG1hZ2ljYWxseSBoYXZlIHRoZSBsaW5rIHdvcmsuXG5cbmV4cG9ydCBjbGFzcyBSb29tUGVybWFsaW5rQ3JlYXRvciB7XG4gICAgcHJpdmF0ZSByb29tOiBSb29tO1xuICAgIHByaXZhdGUgcm9vbUlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBoaWdoZXN0UGxVc2VySWQ6IHN0cmluZztcbiAgICBwcml2YXRlIHBvcHVsYXRpb25NYXA6IHsgW3NlcnZlck5hbWU6IHN0cmluZ106IG51bWJlciB9O1xuICAgIHByaXZhdGUgYmFubmVkSG9zdHNSZWdleHBzOiBSZWdFeHBbXTtcbiAgICBwcml2YXRlIGFsbG93ZWRIb3N0c1JlZ2V4cHM6IFJlZ0V4cFtdO1xuICAgIHByaXZhdGUgX3NlcnZlckNhbmRpZGF0ZXM6IHN0cmluZ1tdO1xuICAgIHByaXZhdGUgc3RhcnRlZDogYm9vbGVhbjtcblxuICAgIC8vIFdlIHN1cHBvcnQgYmVpbmcgZ2l2ZW4gYSByb29tSWQgYXMgYSBmYWxsYmFjayBpbiB0aGUgZXZlbnQgdGhlIGByb29tYCBvYmplY3RcbiAgICAvLyBkb2Vzbid0IGV4aXN0IG9yIGlzIG5vdCBoZWFsdGh5IGZvciB1cyB0byByZWx5IG9uLiBGb3IgZXhhbXBsZSwgbG9hZGluZyBhXG4gICAgLy8gcGVybWFsaW5rIHRvIGEgcm9vbSB3aGljaCB0aGUgTWF0cml4Q2xpZW50IGRvZXNuJ3Qga25vdyBhYm91dC5cbiAgICBjb25zdHJ1Y3Rvcihyb29tOiBSb29tLCByb29tSWQ6IHN0cmluZyA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yb29tID0gcm9vbTtcbiAgICAgICAgdGhpcy5yb29tSWQgPSByb29tID8gcm9vbS5yb29tSWQgOiByb29tSWQ7XG4gICAgICAgIHRoaXMuaGlnaGVzdFBsVXNlcklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uTWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5iYW5uZWRIb3N0c1JlZ2V4cHMgPSBudWxsO1xuICAgICAgICB0aGlzLmFsbG93ZWRIb3N0c1JlZ2V4cHMgPSBudWxsO1xuICAgICAgICB0aGlzLl9zZXJ2ZXJDYW5kaWRhdGVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJvb21JZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHJlc29sdmUgYSByb29tSWQgZm9yIHRoZSBwZXJtYWxpbmsgY3JlYXRvciB0byB1c2VcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkKCkge1xuICAgICAgICBpZiAoIXRoaXMucm9vbSB8fCAhdGhpcy5yb29tLmN1cnJlbnRTdGF0ZSkge1xuICAgICAgICAgICAgLy8gVW5kZXIgcmFyZSBhbmQgdW5rbm93biBjaXJjdW1zdGFuY2VzIGl0IGlzIHBvc3NpYmxlIHRvIGhhdmUgYSByb29tIHdpdGggbm9cbiAgICAgICAgICAgIC8vIGN1cnJlbnRTdGF0ZSwgYXQgbGVhc3QgcG90ZW50aWFsbHkgYXQgdGhlIGVhcmx5IHN0YWdlcyBvZiBqb2luaW5nIGEgcm9vbS5cbiAgICAgICAgICAgIC8vIFRvIGF2b2lkIGJyZWFraW5nIGV2ZXJ5dGhpbmcsIHdlJ2xsIGp1c3Qgd2FybiByYXRoZXIgdGhhbiB0aHJvdyBhcyB3ZWxsIGFzXG4gICAgICAgICAgICAvLyBub3QgYm90aGVyIHVwZGF0aW5nIHRoZSB2YXJpb3VzIGFzcGVjdHMgb2YgdGhlIHNoYXJlIGxpbmsuXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBsb2FkIGEgcGVybWFsaW5rIGNyZWF0b3Igd2l0aCBubyByb29tIHN0YXRlXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlQWxsb3dlZFNlcnZlcnMoKTtcbiAgICAgICAgdGhpcy51cGRhdGVIaWdoZXN0UGxVc2VyKCk7XG4gICAgICAgIHRoaXMudXBkYXRlUG9wdWxhdGlvbk1hcCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNlcnZlckNhbmRpZGF0ZXMoKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIHRoaXMucm9vbS5vbihcIlJvb21NZW1iZXIubWVtYmVyc2hpcFwiLCB0aGlzLm9uTWVtYmVyc2hpcCk7XG4gICAgICAgIHRoaXMucm9vbS5vbihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblJvb21TdGF0ZSk7XG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgc3RvcCgpIHtcbiAgICAgICAgdGhpcy5yb29tLnJlbW92ZUxpc3RlbmVyKFwiUm9vbU1lbWJlci5tZW1iZXJzaGlwXCIsIHRoaXMub25NZW1iZXJzaGlwKTtcbiAgICAgICAgdGhpcy5yb29tLnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLm9uUm9vbVN0YXRlKTtcbiAgICAgICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0IHNlcnZlckNhbmRpZGF0ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJDYW5kaWRhdGVzO1xuICAgIH1cblxuICAgIGlzU3RhcnRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRlZDtcbiAgICB9XG5cbiAgICBmb3JFdmVudChldmVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JFdmVudCh0aGlzLnJvb21JZCwgZXZlbnRJZCwgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyk7XG4gICAgfVxuXG4gICAgZm9yU2hhcmVhYmxlUm9vbSgpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5yb29tKSB7XG4gICAgICAgICAgICAvLyBQcmVmZXIgdG8gdXNlIGNhbm9uaWNhbCBhbGlhcyBmb3IgcGVybWFsaW5rIGlmIHBvc3NpYmxlXG4gICAgICAgICAgICBjb25zdCBhbGlhcyA9IHRoaXMucm9vbS5nZXRDYW5vbmljYWxBbGlhcygpO1xuICAgICAgICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yUm9vbShhbGlhcywgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yUm9vbSh0aGlzLnJvb21JZCwgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyk7XG4gICAgfVxuXG4gICAgZm9yUm9vbSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JSb29tKHRoaXMucm9vbUlkLCB0aGlzLl9zZXJ2ZXJDYW5kaWRhdGVzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlID0gKGV2ZW50OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LmdldFR5cGUoKSkge1xuICAgICAgICAgICAgY2FzZSBFdmVudFR5cGUuUm9vbVNlcnZlckFjbDpcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUFsbG93ZWRTZXJ2ZXJzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVIaWdoZXN0UGxVc2VyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQb3B1bGF0aW9uTWFwKCk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZXJ2ZXJDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSBFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzOlxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSGlnaGVzdFBsVXNlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VydmVyQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25NZW1iZXJzaGlwID0gKGV2dDogTWF0cml4RXZlbnQsIG1lbWJlcjogUm9vbU1lbWJlciwgb2xkTWVtYmVyc2hpcDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IG1lbWJlci51c2VySWQ7XG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSBtZW1iZXIubWVtYmVyc2hpcDtcbiAgICAgICAgY29uc3Qgc2VydmVyTmFtZSA9IGdldFNlcnZlck5hbWUodXNlcklkKTtcbiAgICAgICAgY29uc3QgaGFzSm9pbmVkID0gb2xkTWVtYmVyc2hpcCAhPT0gXCJqb2luXCIgJiYgbWVtYmVyc2hpcCA9PT0gXCJqb2luXCI7XG4gICAgICAgIGNvbnN0IGhhc0xlZnQgPSBvbGRNZW1iZXJzaGlwID09PSBcImpvaW5cIiAmJiBtZW1iZXJzaGlwICE9PSBcImpvaW5cIjtcblxuICAgICAgICBpZiAoaGFzTGVmdCkge1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0aW9uTWFwW3NlcnZlck5hbWVdLS07XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzSm9pbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRpb25NYXBbc2VydmVyTmFtZV0rKztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlSGlnaGVzdFBsVXNlcigpO1xuICAgICAgICB0aGlzLnVwZGF0ZVNlcnZlckNhbmRpZGF0ZXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUhpZ2hlc3RQbFVzZXIoKSB7XG4gICAgICAgIGNvbnN0IHBsRXZlbnQgPSB0aGlzLnJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLnBvd2VyX2xldmVsc1wiLCBcIlwiKTtcbiAgICAgICAgaWYgKHBsRXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBwbEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcnMgPSBjb250ZW50LnVzZXJzO1xuICAgICAgICAgICAgICAgIGlmICh1c2Vycykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXModXNlcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGxvd2VkRW50cmllcyA9IGVudHJpZXMuZmlsdGVyKChbdXNlcklkXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gdGhpcy5yb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtZW1iZXIgfHwgbWVtYmVyLm1lbWJlcnNoaXAgIT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyTmFtZSA9IGdldFNlcnZlck5hbWUodXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhaXNIb3N0bmFtZUlwQWRkcmVzcyhzZXJ2ZXJOYW1lKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFpc0hvc3RJblJlZ2V4KHNlcnZlck5hbWUsIHRoaXMuYmFubmVkSG9zdHNSZWdleHBzKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzSG9zdEluUmVnZXgoc2VydmVyTmFtZSwgdGhpcy5hbGxvd2VkSG9zdHNSZWdleHBzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1heEVudHJ5ID0gYWxsb3dlZEVudHJpZXMucmVkdWNlKChtYXgsIGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGVudHJ5WzFdID4gbWF4WzFdKSA/IGVudHJ5IDogbWF4O1xuICAgICAgICAgICAgICAgICAgICB9LCBbbnVsbCwgMF0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbdXNlcklkLCBwb3dlckxldmVsXSA9IG1heEVudHJ5O1xuICAgICAgICAgICAgICAgICAgICAvLyBvYmplY3Qgd2Fzbid0IGVtcHR5LCBhbmQgbWF4IGVudHJ5IHdhc24ndCBhIGRlbW90aW9uIGZyb20gdGhlIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXJJZCAhPT0gbnVsbCAmJiBwb3dlckxldmVsID49IDUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hlc3RQbFVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZ2hlc3RQbFVzZXJJZCA9IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVBbGxvd2VkU2VydmVycygpIHtcbiAgICAgICAgY29uc3QgYmFubmVkSG9zdHNSZWdleHBzID0gW107XG4gICAgICAgIGxldCBhbGxvd2VkSG9zdHNSZWdleHBzID0gW25ldyBSZWdFeHAoXCIuKlwiKV07IC8vIGRlZmF1bHQgYWxsb3cgZXZlcnlvbmVcbiAgICAgICAgaWYgKHRoaXMucm9vbS5jdXJyZW50U3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjbEV2ZW50ID0gdGhpcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5zZXJ2ZXJfYWNsXCIsIFwiXCIpO1xuICAgICAgICAgICAgaWYgKGFjbEV2ZW50ICYmIGFjbEV2ZW50LmdldENvbnRlbnQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdldFJlZ2V4ID0gKGhvc3RuYW1lKSA9PiBuZXcgUmVnRXhwKFwiXlwiICsgdXRpbHMuZ2xvYlRvUmVnZXhwKGhvc3RuYW1lLCBmYWxzZSkgKyBcIiRcIik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZW5pZWQgPSBhY2xFdmVudC5nZXRDb250ZW50KCkuZGVueSB8fCBbXTtcbiAgICAgICAgICAgICAgICBkZW5pZWQuZm9yRWFjaChoID0+IGJhbm5lZEhvc3RzUmVnZXhwcy5wdXNoKGdldFJlZ2V4KGgpKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhbGxvd2VkID0gYWNsRXZlbnQuZ2V0Q29udGVudCgpLmFsbG93IHx8IFtdO1xuICAgICAgICAgICAgICAgIGFsbG93ZWRIb3N0c1JlZ2V4cHMgPSBbXTsgLy8gd2UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgcnVsZSBoZXJlXG4gICAgICAgICAgICAgICAgYWxsb3dlZC5mb3JFYWNoKGggPT4gYWxsb3dlZEhvc3RzUmVnZXhwcy5wdXNoKGdldFJlZ2V4KGgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iYW5uZWRIb3N0c1JlZ2V4cHMgPSBiYW5uZWRIb3N0c1JlZ2V4cHM7XG4gICAgICAgIHRoaXMuYWxsb3dlZEhvc3RzUmVnZXhwcyA9IGFsbG93ZWRIb3N0c1JlZ2V4cHM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVQb3B1bGF0aW9uTWFwKCkge1xuICAgICAgICBjb25zdCBwb3B1bGF0aW9uTWFwOiB7IFtzZXJ2ZXI6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIHRoaXMucm9vbS5nZXRKb2luZWRNZW1iZXJzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlck5hbWUgPSBnZXRTZXJ2ZXJOYW1lKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgaWYgKCFwb3B1bGF0aW9uTWFwW3NlcnZlck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgcG9wdWxhdGlvbk1hcFtzZXJ2ZXJOYW1lXSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3B1bGF0aW9uTWFwW3NlcnZlck5hbWVdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3B1bGF0aW9uTWFwID0gcG9wdWxhdGlvbk1hcDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVNlcnZlckNhbmRpZGF0ZXMoKSB7XG4gICAgICAgIGxldCBjYW5kaWRhdGVzID0gW107XG4gICAgICAgIGlmICh0aGlzLmhpZ2hlc3RQbFVzZXJJZCkge1xuICAgICAgICAgICAgY2FuZGlkYXRlcy5wdXNoKGdldFNlcnZlck5hbWUodGhpcy5oaWdoZXN0UGxVc2VySWQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlcnZlcnNCeVBvcHVsYXRpb24gPSBPYmplY3Qua2V5cyh0aGlzLnBvcHVsYXRpb25NYXApXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gdGhpcy5wb3B1bGF0aW9uTWFwW2JdIC0gdGhpcy5wb3B1bGF0aW9uTWFwW2FdKVxuICAgICAgICAgICAgLmZpbHRlcihhID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIWNhbmRpZGF0ZXMuaW5jbHVkZXMoYSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIWlzSG9zdG5hbWVJcEFkZHJlc3MoYSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIWlzSG9zdEluUmVnZXgoYSwgdGhpcy5iYW5uZWRIb3N0c1JlZ2V4cHMpICYmXG4gICAgICAgICAgICAgICAgICAgIGlzSG9zdEluUmVnZXgoYSwgdGhpcy5hbGxvd2VkSG9zdHNSZWdleHBzKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ1NlcnZlcnMgPSBzZXJ2ZXJzQnlQb3B1bGF0aW9uLnNsaWNlKDAsIE1BWF9TRVJWRVJfQ0FORElEQVRFUyAtIGNhbmRpZGF0ZXMubGVuZ3RoKTtcbiAgICAgICAgY2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXMuY29uY2F0KHJlbWFpbmluZ1NlcnZlcnMpO1xuXG4gICAgICAgIHRoaXMuX3NlcnZlckNhbmRpZGF0ZXMgPSBjYW5kaWRhdGVzO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VHZW5lcmljUGVybWFsaW5rKGVudGl0eUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvckVudGl0eShlbnRpdHlJZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVXNlclBlcm1hbGluayh1c2VySWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yVXNlcih1c2VySWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJvb21QZXJtYWxpbmsocm9vbUlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghcm9vbUlkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbid0IHBlcm1hbGluayBhIGZhbHNleSByb29tSWRcIik7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHJvb21JZCBpc24ndCBhY3R1YWxseSBhIHJvb20gSUQsIGRvbid0IHRyeSB0byBsaXN0IHRoZSBzZXJ2ZXJzLlxuICAgIC8vIEFsaWFzZXMgYXJlIGFscmVhZHkgcm91dGFibGUsIGFuZCBkb24ndCBuZWVkIGV4dHJhIGluZm9ybWF0aW9uLlxuICAgIGlmIChyb29tSWRbMF0gIT09ICchJykgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yUm9vbShyb29tSWQsIFtdKTtcblxuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yUm9vbShyb29tSWQsIFtdKTtcbiAgICB9XG4gICAgY29uc3QgcGVybWFsaW5rQ3JlYXRvciA9IG5ldyBSb29tUGVybWFsaW5rQ3JlYXRvcihyb29tKTtcbiAgICBwZXJtYWxpbmtDcmVhdG9yLmxvYWQoKTtcbiAgICByZXR1cm4gcGVybWFsaW5rQ3JlYXRvci5mb3JSb29tKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlR3JvdXBQZXJtYWxpbmsoZ3JvdXBJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JHcm91cChncm91cElkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGVybWFsaW5rSG9zdChob3N0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBBbHdheXMgY2hlY2sgaWYgdGhlIHBlcm1hbGluayBpcyBhIHNwZWMgcGVybWFsaW5rIChjYWxsZXJzIGFyZSBsaWtlbHkgdG8gY2FsbFxuICAgIC8vIHBhcnNlUGVybWFsaW5rIGFmdGVyIHRoaXMgZnVuY3Rpb24pLlxuICAgIGlmIChuZXcgU3BlY1Blcm1hbGlua0NvbnN0cnVjdG9yKCkuaXNQZXJtYWxpbmtIb3N0KGhvc3QpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5pc1Blcm1hbGlua0hvc3QoaG9zdCk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhbiBlbnRpdHkgKHBlcm1hbGluaywgcm9vbSBhbGlhcywgdXNlciBJRCwgZXRjKSBpbnRvIGEgbG9jYWwgVVJMXG4gKiBpZiBwb3NzaWJsZS4gSWYgdGhlIGdpdmVuIGVudGl0eSBpcyBub3QgZm91bmQgdG8gYmUgdmFsaWQgZW5vdWdoIHRvIGJlIGNvbnZlcnRlZFxuICogdGhlbiBhIG51bGwgdmFsdWUgd2lsbCBiZSByZXR1cm5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBlbnRpdHkgVGhlIGVudGl0eSB0byB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IFRoZSB0cmFuc2Zvcm1lZCBwZXJtYWxpbmsgb3IgbnVsbCBpZiB1bmFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlUcmFuc2Zvcm1FbnRpdHlUb1Blcm1hbGluayhlbnRpdHk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCFlbnRpdHkpIHJldHVybiBudWxsO1xuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGl0IGlzIGEgYmFyZSBlbnRpdHkgZm9yIHN0YXJ0ZXJzXG4gICAgaWYgKGVudGl0eVswXSA9PT0gJyMnIHx8IGVudGl0eVswXSA9PT0gJyEnKSByZXR1cm4gbWFrZVJvb21QZXJtYWxpbmsoZW50aXR5KTtcbiAgICBpZiAoZW50aXR5WzBdID09PSAnQCcpIHJldHVybiBtYWtlVXNlclBlcm1hbGluayhlbnRpdHkpO1xuICAgIGlmIChlbnRpdHlbMF0gPT09ICcrJykgcmV0dXJuIG1ha2VHcm91cFBlcm1hbGluayhlbnRpdHkpO1xuXG4gICAgLy8gVGhlbiB0cnkgYW5kIG1lcmdlIGl0IGludG8gYSBwZXJtYWxpbmtcbiAgICByZXR1cm4gdHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWYoZW50aXR5KTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgcGVybWFsaW5rIChvciBwb3NzaWJsZSBwZXJtYWxpbmspIGludG8gYSBsb2NhbCBVUkwgaWYgcG9zc2libGUuIElmXG4gKiB0aGUgZ2l2ZW4gcGVybWFsaW5rIGlzIGZvdW5kIHRvIG5vdCBiZSBhIHBlcm1hbGluaywgaXQnbGwgYmUgcmV0dXJuZWQgdW5hbHRlcmVkLlxuICogQHBhcmFtIHtzdHJpbmd9IHBlcm1hbGluayBUaGUgcGVybWFsaW5rIHRvIHRyeSBhbmQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge3N0cmluZ30gVGhlIHRyYW5zZm9ybWVkIHBlcm1hbGluayBvciBvcmlnaW5hbCBVUkwgaWYgdW5hYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWYocGVybWFsaW5rOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghcGVybWFsaW5rLnN0YXJ0c1dpdGgoXCJodHRwOlwiKSAmJiAhcGVybWFsaW5rLnN0YXJ0c1dpdGgoXCJodHRwczpcIikpIHtcbiAgICAgICAgcmV0dXJuIHBlcm1hbGluaztcbiAgICB9XG5cbiAgICBjb25zdCBtID0gZGVjb2RlVVJJQ29tcG9uZW50KHBlcm1hbGluaykubWF0Y2gobWF0cml4TGlua2lmeS5FTEVNRU5UX1VSTF9QQVRURVJOKTtcbiAgICBpZiAobSkge1xuICAgICAgICByZXR1cm4gbVsxXTtcbiAgICB9XG5cbiAgICAvLyBBIGJpdCBvZiBhIGhhY2sgdG8gY29udmVydCBwZXJtYWxpbmtzIG9mIHVua25vd24gb3JpZ2luIHRvIEVsZW1lbnQgbGlua3NcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwZXJtYWxpbmtQYXJ0cyA9IHBhcnNlUGVybWFsaW5rKHBlcm1hbGluayk7XG4gICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cykge1xuICAgICAgICAgICAgaWYgKHBlcm1hbGlua1BhcnRzLnJvb21JZE9yQWxpYXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudElkUGFydCA9IHBlcm1hbGlua1BhcnRzLmV2ZW50SWQgPyBgLyR7cGVybWFsaW5rUGFydHMuZXZlbnRJZH1gIDogJyc7XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rID0gYCMvcm9vbS8ke3Blcm1hbGlua1BhcnRzLnJvb21JZE9yQWxpYXN9JHtldmVudElkUGFydH1gO1xuICAgICAgICAgICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy52aWFTZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rICs9IG5ldyBTcGVjUGVybWFsaW5rQ29uc3RydWN0b3IoKS5lbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzKHBlcm1hbGlua1BhcnRzLnZpYVNlcnZlcnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGVybWFsaW5rUGFydHMuZ3JvdXBJZCkge1xuICAgICAgICAgICAgICAgIHBlcm1hbGluayA9IGAjL2dyb3VwLyR7cGVybWFsaW5rUGFydHMuZ3JvdXBJZH1gO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJtYWxpbmtQYXJ0cy51c2VySWQpIHtcbiAgICAgICAgICAgICAgICBwZXJtYWxpbmsgPSBgIy91c2VyLyR7cGVybWFsaW5rUGFydHMudXNlcklkfWA7XG4gICAgICAgICAgICB9IC8vIGVsc2Ugbm90IGEgdmFsaWQgcGVybWFsaW5rIGZvciBvdXIgcHVycG9zZXMgLSBkbyBub3QgaGFuZGxlXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE5vdCBhbiBocmVmIHdlIG5lZWQgdG8gY2FyZSBhYm91dFxuICAgIH1cblxuICAgIHJldHVybiBwZXJtYWxpbms7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmltYXJ5UGVybWFsaW5rRW50aXR5KHBlcm1hbGluazogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgICBsZXQgcGVybWFsaW5rUGFydHMgPSBwYXJzZVBlcm1hbGluayhwZXJtYWxpbmspO1xuXG4gICAgICAgIC8vIElmIG5vdCBhIHBlcm1hbGluaywgdHJ5IHRoZSB2ZWN0b3IgcGF0dGVybnMuXG4gICAgICAgIGlmICghcGVybWFsaW5rUGFydHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG0gPSBwZXJtYWxpbmsubWF0Y2gobWF0cml4TGlua2lmeS5FTEVNRU5UX1VSTF9QQVRURVJOKTtcbiAgICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAgICAgLy8gQSBiaXQgb2YgYSBoYWNrLCBidXQgaXQgZ2V0cyB0aGUgam9iIGRvbmVcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gbmV3IEVsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3RvcihcImh0dHA6Ly9sb2NhbGhvc3RcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgZW50aXR5SW5mbyA9IG1bMV0uc3BsaXQoJyMnKS5zbGljZSgxKS5qb2luKCcjJyk7XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rUGFydHMgPSBoYW5kbGVyLnBhcnNlUGVybWFsaW5rKGBodHRwOi8vbG9jYWxob3N0LyMke2VudGl0eUluZm99YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBlcm1hbGlua1BhcnRzKSByZXR1cm4gbnVsbDsgLy8gbm90IHByb2Nlc3NhYmxlXG4gICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy51c2VySWQpIHJldHVybiBwZXJtYWxpbmtQYXJ0cy51c2VySWQ7XG4gICAgICAgIGlmIChwZXJtYWxpbmtQYXJ0cy5ncm91cElkKSByZXR1cm4gcGVybWFsaW5rUGFydHMuZ3JvdXBJZDtcbiAgICAgICAgaWYgKHBlcm1hbGlua1BhcnRzLnJvb21JZE9yQWxpYXMpIHJldHVybiBwZXJtYWxpbmtQYXJ0cy5yb29tSWRPckFsaWFzO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gbm8gZW50aXR5IC0gbm90IGEgcGVybWFsaW5rXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCk6IFBlcm1hbGlua0NvbnN0cnVjdG9yIHtcbiAgICBjb25zdCBlbGVtZW50UHJlZml4ID0gU2RrQ29uZmlnLmdldCgpWydwZXJtYWxpbmtQcmVmaXgnXTtcbiAgICBpZiAoZWxlbWVudFByZWZpeCAmJiBlbGVtZW50UHJlZml4ICE9PSBtYXRyaXh0b0Jhc2VVcmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IoZWxlbWVudFByZWZpeCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTcGVjUGVybWFsaW5rQ29uc3RydWN0b3IoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGVybWFsaW5rKGZ1bGxVcmw6IHN0cmluZyk6IFBlcm1hbGlua1BhcnRzIHtcbiAgICBjb25zdCBlbGVtZW50UHJlZml4ID0gU2RrQ29uZmlnLmdldCgpWydwZXJtYWxpbmtQcmVmaXgnXTtcbiAgICBpZiAoZGVjb2RlVVJJQ29tcG9uZW50KGZ1bGxVcmwpLnN0YXJ0c1dpdGgobWF0cml4dG9CYXNlVXJsKSkge1xuICAgICAgICByZXR1cm4gbmV3IFNwZWNQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLnBhcnNlUGVybWFsaW5rKGRlY29kZVVSSUNvbXBvbmVudChmdWxsVXJsKSk7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50UHJlZml4ICYmIGZ1bGxVcmwuc3RhcnRzV2l0aChlbGVtZW50UHJlZml4KSkge1xuICAgICAgICByZXR1cm4gbmV3IEVsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3RvcihlbGVtZW50UHJlZml4KS5wYXJzZVBlcm1hbGluayhmdWxsVXJsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDsgLy8gbm90IGEgcGVybWFsaW5rIHdlIGNhbiBoYW5kbGVcbn1cblxuLyoqXG4gKiBQYXJzZXMgYW4gYXBwIGxvY2FsIGxpbmsgKGAjLyh1c2VyfHJvb218Z3JvdXApL2lkZW50aWZlcmApIHRvIGEgTWF0cml4IGVudGl0eVxuICogKHJvb20sIHVzZXIsIGdyb3VwKS4gU3VjaCBsaW5rcyBhcmUgcHJvZHVjZWQgYnkgYEh0bWxVdGlsc2Agd2hlbiBlbmNvdW50ZXJpbmdcbiAqIGxpbmtzLCB3aGljaCBjYWxscyBgdHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWZgIGluIHRoaXMgbW9kdWxlLlxuICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsTGluayBUaGUgYXBwIGxvY2FsIGxpbmtcbiAqIEByZXR1cm5zIHtQZXJtYWxpbmtQYXJ0c31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXBwTG9jYWxMaW5rKGxvY2FsTGluazogc3RyaW5nKTogUGVybWFsaW5rUGFydHMge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0gbG9jYWxMaW5rLnJlcGxhY2UoXCIjL1wiLCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIEVsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3Rvci5wYXJzZUFwcFJvdXRlKHNlZ21lbnRzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIElnbm9yZSBmYWlsdXJlc1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0U2VydmVyTmFtZSh1c2VySWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHVzZXJJZC5zcGxpdChcIjpcIikuc3BsaWNlKDEpLmpvaW4oXCI6XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRIb3N0bmFtZUZyb21NYXRyaXhEb21haW4oZG9tYWluOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghZG9tYWluKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gbmV3IFVSTChgaHR0cHM6Ly8ke2RvbWFpbn1gKS5ob3N0bmFtZTtcbn1cblxuZnVuY3Rpb24gaXNIb3N0SW5SZWdleChob3N0bmFtZTogc3RyaW5nLCByZWdleHBzOiBSZWdFeHBbXSkge1xuICAgIGhvc3RuYW1lID0gZ2V0SG9zdG5hbWVGcm9tTWF0cml4RG9tYWluKGhvc3RuYW1lKTtcbiAgICBpZiAoIWhvc3RuYW1lKSByZXR1cm4gdHJ1ZTsgLy8gYXNzdW1lZFxuICAgIGlmIChyZWdleHBzLmxlbmd0aCA+IDAgJiYgIXJlZ2V4cHNbMF0udGVzdCkgdGhyb3cgbmV3IEVycm9yKHJlZ2V4cHNbMF0udG9TdHJpbmcoKSk7XG5cbiAgICByZXR1cm4gcmVnZXhwcy5maWx0ZXIoaCA9PiBoLnRlc3QoaG9zdG5hbWUpKS5sZW5ndGggPiAwO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RuYW1lSXBBZGRyZXNzKGhvc3RuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBob3N0bmFtZSA9IGdldEhvc3RuYW1lRnJvbU1hdHJpeERvbWFpbihob3N0bmFtZSk7XG4gICAgaWYgKCFob3N0bmFtZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gaXMtaXAgZG9lc24ndCB3YW50IElQdjYgYWRkcmVzc2VzIHN1cnJvdW5kZWQgYnkgYnJhY2tldHMsIHNvXG4gICAgLy8gdGFrZSB0aGVtIG9mZi5cbiAgICBpZiAoaG9zdG5hbWUuc3RhcnRzV2l0aChcIltcIikgJiYgaG9zdG5hbWUuZW5kc1dpdGgoXCJdXCIpKSB7XG4gICAgICAgIGhvc3RuYW1lID0gaG9zdG5hbWUuc3Vic3RyaW5nKDEsIGhvc3RuYW1lLmxlbmd0aCAtIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0lwKGhvc3RuYW1lKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNhbGN1bGF0ZVJvb21WaWEgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgIGNvbnN0IHBlcm1hbGlua0NyZWF0b3IgPSBuZXcgUm9vbVBlcm1hbGlua0NyZWF0b3Iocm9vbSk7XG4gICAgcGVybWFsaW5rQ3JlYXRvci5sb2FkKCk7XG4gICAgcmV0dXJuIHBlcm1hbGlua0NyZWF0b3Iuc2VydmVyQ2FuZGlkYXRlcztcbn07XG4iXX0=