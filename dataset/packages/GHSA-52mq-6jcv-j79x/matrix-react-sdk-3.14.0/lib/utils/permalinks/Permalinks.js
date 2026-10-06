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
exports.RoomPermalinkCreator = void 0;

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _isIp = _interopRequireDefault(require("is-ip"));

var utils = _interopRequireWildcard(require("matrix-js-sdk/src/utils"));

var _SpecPermalinkConstructor = _interopRequireWildcard(require("./SpecPermalinkConstructor"));

var _PermalinkConstructor = _interopRequireWildcard(require("./PermalinkConstructor"));

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
  constructor(room, roomId = null) {
    this._room = room;
    this._roomId = room ? room.roomId : roomId;
    this._highestPlUserId = null;
    this._populationMap = null;
    this._bannedHostsRegexps = null;
    this._allowedHostsRegexps = null;
    this._serverCandidates = null;
    this._started = false;

    if (!this._roomId) {
      throw new Error("Failed to resolve a roomId for the permalink creator to use");
    }

    this.onMembership = this.onMembership.bind(this);
    this.onRoomState = this.onRoomState.bind(this);
  }

  load() {
    if (!this._room || !this._room.currentState) {
      // Under rare and unknown circumstances it is possible to have a room with no
      // currentState, at least potentially at the early stages of joining a room.
      // To avoid breaking everything, we'll just warn rather than throw as well as
      // not bother updating the various aspects of the share link.
      console.warn("Tried to load a permalink creator with no room state");
      return;
    }

    this._updateAllowedServers();

    this._updateHighestPlUser();

    this._updatePopulationMap();

    this._updateServerCandidates();
  }

  start() {
    this.load();

    this._room.on("RoomMember.membership", this.onMembership);

    this._room.on("RoomState.events", this.onRoomState);

    this._started = true;
  }

  stop() {
    this._room.removeListener("RoomMember.membership", this.onMembership);

    this._room.removeListener("RoomState.events", this.onRoomState);

    this._started = false;
  }

  isStarted() {
    return this._started;
  }

  forEvent(eventId) {
    return getPermalinkConstructor().forEvent(this._roomId, eventId, this._serverCandidates);
  }

  forShareableRoom() {
    if (this._room) {
      // Prefer to use canonical alias for permalink if possible
      const alias = this._room.getCanonicalAlias();

      if (alias) {
        return getPermalinkConstructor().forRoom(alias, this._serverCandidates);
      }
    }

    return getPermalinkConstructor().forRoom(this._roomId, this._serverCandidates);
  }

  forRoom() {
    return getPermalinkConstructor().forRoom(this._roomId, this._serverCandidates);
  }

  onRoomState(event) {
    switch (event.getType()) {
      case "m.room.server_acl":
        this._updateAllowedServers();

        this._updateHighestPlUser();

        this._updatePopulationMap();

        this._updateServerCandidates();

        return;

      case "m.room.power_levels":
        this._updateHighestPlUser();

        this._updateServerCandidates();

        return;
    }
  }

  onMembership(evt, member, oldMembership) {
    const userId = member.userId;
    const membership = member.membership;
    const serverName = getServerName(userId);
    const hasJoined = oldMembership !== "join" && membership === "join";
    const hasLeft = oldMembership === "join" && membership !== "join";

    if (hasLeft) {
      this._populationMap[serverName]--;
    } else if (hasJoined) {
      this._populationMap[serverName]++;
    }

    this._updateHighestPlUser();

    this._updateServerCandidates();
  }

  _updateHighestPlUser() {
    const plEvent = this._room.currentState.getStateEvents("m.room.power_levels", "");

    if (plEvent) {
      const content = plEvent.getContent();

      if (content) {
        const users = content.users;

        if (users) {
          const entries = Object.entries(users);
          const allowedEntries = entries.filter(([userId]) => {
            const member = this._room.getMember(userId);

            if (!member || member.membership !== "join") {
              return false;
            }

            const serverName = getServerName(userId);
            return !isHostnameIpAddress(serverName) && !isHostInRegex(serverName, this._bannedHostsRegexps) && isHostInRegex(serverName, this._allowedHostsRegexps);
          });
          const maxEntry = allowedEntries.reduce((max, entry) => {
            return entry[1] > max[1] ? entry : max;
          }, [null, 0]);
          const [userId, powerLevel] = maxEntry; // object wasn't empty, and max entry wasn't a demotion from the default

          if (userId !== null && powerLevel >= 50) {
            this._highestPlUserId = userId;
            return;
          }
        }
      }
    }

    this._highestPlUserId = null;
  }

  _updateAllowedServers() {
    const bannedHostsRegexps = [];
    let allowedHostsRegexps = [new RegExp(".*")]; // default allow everyone

    if (this._room.currentState) {
      const aclEvent = this._room.currentState.getStateEvents("m.room.server_acl", "");

      if (aclEvent && aclEvent.getContent()) {
        const getRegex = hostname => new RegExp("^" + utils.globToRegexp(hostname, false) + "$");

        const denied = aclEvent.getContent().deny || [];
        denied.forEach(h => bannedHostsRegexps.push(getRegex(h)));
        const allowed = aclEvent.getContent().allow || [];
        allowedHostsRegexps = []; // we don't want to use the default rule here

        allowed.forEach(h => allowedHostsRegexps.push(getRegex(h)));
      }
    }

    this._bannedHostsRegexps = bannedHostsRegexps;
    this._allowedHostsRegexps = allowedHostsRegexps;
  }

  _updatePopulationMap() {
    const populationMap
    /*: { [server: string]: number }*/
    = {};

    for (const member of this._room.getJoinedMembers()) {
      const serverName = getServerName(member.userId);

      if (!populationMap[serverName]) {
        populationMap[serverName] = 0;
      }

      populationMap[serverName]++;
    }

    this._populationMap = populationMap;
  }

  _updateServerCandidates() {
    let candidates = [];

    if (this._highestPlUserId) {
      candidates.push(getServerName(this._highestPlUserId));
    }

    const serversByPopulation = Object.keys(this._populationMap).sort((a, b) => this._populationMap[b] - this._populationMap[a]).filter(a => {
      return !candidates.includes(a) && !isHostnameIpAddress(a) && !isHostInRegex(a, this._bannedHostsRegexps) && isHostInRegex(a, this._allowedHostsRegexps);
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

function makeUserPermalink(userId) {
  return getPermalinkConstructor().forUser(userId);
}

function makeRoomPermalink(roomId) {
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

function makeGroupPermalink(groupId) {
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

  const m = permalink.match(_linkifyMatrix.default.ELEMENT_URL_PATTERN);

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

  if (fullUrl.startsWith(_SpecPermalinkConstructor.baseUrl)) {
    return new _SpecPermalinkConstructor.default().parsePermalink(fullUrl);
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

function getServerName(userId) {
  return userId.split(":").splice(1).join(":");
}

function getHostnameFromMatrixDomain(domain) {
  if (!domain) return null;
  return new URL(`https://${domain}`).hostname;
}

function isHostInRegex(hostname, regexps) {
  hostname = getHostnameFromMatrixDomain(hostname);
  if (!hostname) return true; // assumed

  if (regexps.length > 0 && !regexps[0].test) throw new Error(regexps[0]);
  return regexps.filter(h => h.test(hostname)).length > 0;
}

function isHostnameIpAddress(hostname) {
  hostname = getHostnameFromMatrixDomain(hostname);
  if (!hostname) return false; // is-ip doesn't want IPv6 addresses surrounded by brackets, so
  // take them off.

  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.substring(1, hostname.length - 1);
  }

  return (0, _isIp.default)(hostname);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3MuanMiXSwibmFtZXMiOlsiTUFYX1NFUlZFUl9DQU5ESURBVEVTIiwiUm9vbVBlcm1hbGlua0NyZWF0b3IiLCJjb25zdHJ1Y3RvciIsInJvb20iLCJyb29tSWQiLCJfcm9vbSIsIl9yb29tSWQiLCJfaGlnaGVzdFBsVXNlcklkIiwiX3BvcHVsYXRpb25NYXAiLCJfYmFubmVkSG9zdHNSZWdleHBzIiwiX2FsbG93ZWRIb3N0c1JlZ2V4cHMiLCJfc2VydmVyQ2FuZGlkYXRlcyIsIl9zdGFydGVkIiwiRXJyb3IiLCJvbk1lbWJlcnNoaXAiLCJiaW5kIiwib25Sb29tU3RhdGUiLCJsb2FkIiwiY3VycmVudFN0YXRlIiwiY29uc29sZSIsIndhcm4iLCJfdXBkYXRlQWxsb3dlZFNlcnZlcnMiLCJfdXBkYXRlSGlnaGVzdFBsVXNlciIsIl91cGRhdGVQb3B1bGF0aW9uTWFwIiwiX3VwZGF0ZVNlcnZlckNhbmRpZGF0ZXMiLCJzdGFydCIsIm9uIiwic3RvcCIsInJlbW92ZUxpc3RlbmVyIiwiaXNTdGFydGVkIiwiZm9yRXZlbnQiLCJldmVudElkIiwiZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IiLCJmb3JTaGFyZWFibGVSb29tIiwiYWxpYXMiLCJnZXRDYW5vbmljYWxBbGlhcyIsImZvclJvb20iLCJldmVudCIsImdldFR5cGUiLCJldnQiLCJtZW1iZXIiLCJvbGRNZW1iZXJzaGlwIiwidXNlcklkIiwibWVtYmVyc2hpcCIsInNlcnZlck5hbWUiLCJnZXRTZXJ2ZXJOYW1lIiwiaGFzSm9pbmVkIiwiaGFzTGVmdCIsInBsRXZlbnQiLCJnZXRTdGF0ZUV2ZW50cyIsImNvbnRlbnQiLCJnZXRDb250ZW50IiwidXNlcnMiLCJlbnRyaWVzIiwiT2JqZWN0IiwiYWxsb3dlZEVudHJpZXMiLCJmaWx0ZXIiLCJnZXRNZW1iZXIiLCJpc0hvc3RuYW1lSXBBZGRyZXNzIiwiaXNIb3N0SW5SZWdleCIsIm1heEVudHJ5IiwicmVkdWNlIiwibWF4IiwiZW50cnkiLCJwb3dlckxldmVsIiwiYmFubmVkSG9zdHNSZWdleHBzIiwiYWxsb3dlZEhvc3RzUmVnZXhwcyIsIlJlZ0V4cCIsImFjbEV2ZW50IiwiZ2V0UmVnZXgiLCJob3N0bmFtZSIsInV0aWxzIiwiZ2xvYlRvUmVnZXhwIiwiZGVuaWVkIiwiZGVueSIsImZvckVhY2giLCJoIiwicHVzaCIsImFsbG93ZWQiLCJhbGxvdyIsInBvcHVsYXRpb25NYXAiLCJnZXRKb2luZWRNZW1iZXJzIiwiY2FuZGlkYXRlcyIsInNlcnZlcnNCeVBvcHVsYXRpb24iLCJrZXlzIiwic29ydCIsImEiLCJiIiwiaW5jbHVkZXMiLCJyZW1haW5pbmdTZXJ2ZXJzIiwic2xpY2UiLCJsZW5ndGgiLCJjb25jYXQiLCJtYWtlR2VuZXJpY1Blcm1hbGluayIsImVudGl0eUlkIiwiZm9yRW50aXR5IiwibWFrZVVzZXJQZXJtYWxpbmsiLCJmb3JVc2VyIiwibWFrZVJvb21QZXJtYWxpbmsiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwicGVybWFsaW5rQ3JlYXRvciIsIm1ha2VHcm91cFBlcm1hbGluayIsImdyb3VwSWQiLCJmb3JHcm91cCIsImlzUGVybWFsaW5rSG9zdCIsImhvc3QiLCJTcGVjUGVybWFsaW5rQ29uc3RydWN0b3IiLCJ0cnlUcmFuc2Zvcm1FbnRpdHlUb1Blcm1hbGluayIsImVudGl0eSIsInRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmIiwicGVybWFsaW5rIiwic3RhcnRzV2l0aCIsIm0iLCJtYXRjaCIsIm1hdHJpeExpbmtpZnkiLCJFTEVNRU5UX1VSTF9QQVRURVJOIiwicGVybWFsaW5rUGFydHMiLCJwYXJzZVBlcm1hbGluayIsInJvb21JZE9yQWxpYXMiLCJldmVudElkUGFydCIsInZpYVNlcnZlcnMiLCJlbmNvZGVTZXJ2ZXJDYW5kaWRhdGVzIiwiZSIsImdldFByaW1hcnlQZXJtYWxpbmtFbnRpdHkiLCJoYW5kbGVyIiwiRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yIiwiZW50aXR5SW5mbyIsInNwbGl0Iiwiam9pbiIsImVsZW1lbnRQcmVmaXgiLCJTZGtDb25maWciLCJtYXRyaXh0b0Jhc2VVcmwiLCJmdWxsVXJsIiwicGFyc2VBcHBMb2NhbExpbmsiLCJsb2NhbExpbmsiLCJzZWdtZW50cyIsInJlcGxhY2UiLCJwYXJzZUFwcFJvdXRlIiwic3BsaWNlIiwiZ2V0SG9zdG5hbWVGcm9tTWF0cml4RG9tYWluIiwiZG9tYWluIiwiVVJMIiwicmVnZXhwcyIsInRlc3QiLCJlbmRzV2l0aCIsInN1YnN0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXQTtBQUNBO0FBQ0EsTUFBTUEscUJBQXFCLEdBQUcsQ0FBOUIsQyxDQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxNQUFNQyxvQkFBTixDQUEyQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQUMsRUFBQUEsV0FBVyxDQUFDQyxJQUFELEVBQU9DLE1BQU0sR0FBRyxJQUFoQixFQUFzQjtBQUM3QixTQUFLQyxLQUFMLEdBQWFGLElBQWI7QUFDQSxTQUFLRyxPQUFMLEdBQWVILElBQUksR0FBR0EsSUFBSSxDQUFDQyxNQUFSLEdBQWlCQSxNQUFwQztBQUNBLFNBQUtHLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0EsU0FBS0MsY0FB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USxHQUFHd0UsMkJBQTJCLENBQUN4RSxRQUFELENBQXRDO0FBQ0EsTUFBSSxDQUFDQSxRQUFMLEVBQWUsT0FBTyxJQUFQLENBRnVCLENBRVY7O0FBQzVCLE1BQUkyRSxPQUFPLENBQUN0RCxNQUFSLEdBQWlCLENBQWpCLElBQXNCLENBQUNzRCxPQUFPLENBQUMsQ0FBRCxDQUFQLENBQVdDLElBQXRDLEVBQTRDLE1BQU0sSUFBSXJJLEtBQUosQ0FBVW9JLE9BQU8sQ0FBQyxDQUFELENBQWpCLENBQU47QUFFNUMsU0FBT0EsT0FBTyxDQUFDekYsTUFBUixDQUFlb0IsQ0FBQyxJQUFJQSxDQUFDLENBQUNzRSxJQUFGLENBQU81RSxRQUFQLENBQXBCLEVBQXNDcUIsTUFBdEMsR0FBK0MsQ0FBdEQ7QUFDSDs7QUFFRCxTQUFTakMsbUJBQVQsQ0FBNkJZLFFBQTdCLEVBQXVDO0FBQ25DQSxFQUFBQSxRQUFRLEdBQUd3RSwyQkFBMkIsQ0FBQ3hFLFFBQUQsQ0FBdEM7QUFDQSxNQUFJLENBQUNBLFFBQUwsRUFBZSxPQUFPLEtBQVAsQ0FGb0IsQ0FJbkM7QUFDQTs7QUFDQSxNQUFJQSxRQUFRLENBQUM0QyxVQUFULENBQW9CLEdBQXBCLEtBQTRCNUMsUUFBUSxDQUFDNkUsUUFBVCxDQUFrQixHQUFsQixDQUFoQyxFQUF3RDtBQUNwRDdFLElBQUFBLFFBQVEsR0FBR0EsUUFBUSxDQUFDOEUsU0FBVCxDQUFtQixDQUFuQixFQUFzQjlFLFFBQVEsQ0FBQ3FCLE1BQVQsR0FBa0IsQ0FBeEMsQ0FBWDtBQUNIOztBQUVELFNBQU8sbUJBQUtyQixRQUFMLENBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgaXNJcCBmcm9tIFwiaXMtaXBcIjtcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3V0aWxzJztcbmltcG9ydCBTcGVjUGVybWFsaW5rQ29uc3RydWN0b3IsIHtiYXNlVXJsIGFzIG1hdHJpeHRvQmFzZVVybH0gZnJvbSBcIi4vU3BlY1Blcm1hbGlua0NvbnN0cnVjdG9yXCI7XG5pbXBvcnQgUGVybWFsaW5rQ29uc3RydWN0b3IsIHtQZXJtYWxpbmtQYXJ0c30gZnJvbSBcIi4vUGVybWFsaW5rQ29uc3RydWN0b3JcIjtcbmltcG9ydCBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IgZnJvbSBcIi4vRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yXCI7XG5pbXBvcnQgbWF0cml4TGlua2lmeSBmcm9tIFwiLi4vLi4vbGlua2lmeS1tYXRyaXhcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uL1Nka0NvbmZpZ1wiO1xuXG4vLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2VydmVycyB0byBwaWNrIHdoZW4gd29ya2luZyBvdXQgd2hpY2ggc2VydmVyc1xuLy8gdG8gYWRkIHRvIHBlcm1hbGlua3MuIFRoZSBzZXJ2ZXJzIGFyZSBhcHBlbmRlZCBhcyA/dmlhPWV4YW1wbGUub3JnXG5jb25zdCBNQVhfU0VSVkVSX0NBTkRJREFURVMgPSAzO1xuXG5cbi8vIFBlcm1hbGlua3MgY2FuIGhhdmUgc2VydmVycyBhcHBlbmRlZCB0byB0aGVtIHNvIHRoYXQgdGhlIHVzZXJcbi8vIHJlY2VpdmluZyB0aGVtIGNhbiBoYXZlIGEgZmlnaHRpbmcgY2hhbmNlIGF0IGpvaW5pbmcgdGhlIHJvb20uXG4vLyBUaGVzZSBzZXJ2ZXJzIGFyZSBjYWxsZWQgXCJjYW5kaWRhdGVzXCIgYXQgdGhpcyBwb2ludCBiZWNhdXNlXG4vLyBpdCBpcyB1bmNsZWFyIHdoZXRoZXIgdGhleSBhcmUgZ29pbmcgdG8gYmUgdXNlZnVsIHRvIGFjdHVhbGx5XG4vLyBqb2luIGluIHRoZSBmdXR1cmUuXG4vL1xuLy8gV2UgcGljayAzIHNlcnZlcnMgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBjcml0ZXJpYTpcbi8vXG4vLyAgIFNlcnZlciAxOiBUaGUgaGlnaGVzdCBwb3dlciBsZXZlbCB1c2VyIGluIHRoZSByb29tLCBwcm92aWRlZFxuLy8gICB0aGV5IGFyZSBhdCBsZWFzdCBQTCA1MC4gV2UgZG9uJ3QgY2FsY3VsYXRlIFwid2hhdCBpcyBhIG1vZGVyYXRvclwiXG4vLyAgIGhlcmUgYmVjYXVzZSBpdCBpcyBsZXNzIHJlbGV2YW50IGZvciB0aGUgdmFzdCBtYWpvcml0eSBvZiByb29tcy5cbi8vICAgV2UgYWxzbyB3YW50IHRvIGVuc3VyZSB0aGF0IHdlIGdldCBhbiBhZG1pbiBvciBoaWdoLXJhbmtpbmcgbW9kXG4vLyAgIGFzIHRoZXkgYXJlIGxlc3MgbGlrZWx5IHRvIGxlYXZlIHRoZSByb29tLiBJZiBubyB1c2VyIGhhcHBlbnNcbi8vICAgdG8gbWVldCB0aGlzIGNyaXRlcmlhLCB3ZSdsbCBwaWNrIHRoZSBtb3N0IHBvcHVsYXIgc2VydmVyIGluIHRoZVxuLy8gICByb29tLlxuLy9cbi8vICAgU2VydmVyIDI6IFRoZSBuZXh0IG1vc3QgcG9wdWxhciBzZXJ2ZXIgaW4gdGhlIHJvb20gKGluIHVzZXJcbi8vICAgZGlzdHJpYnV0aW9uKS4gVGhpcyBjYW5ub3QgYmUgdGhlIHNhbWUgYXMgU2VydmVyIDEuIElmIG5vIG90aGVyXG4vLyAgIHNlcnZlcnMgYXJlIGF2YWlsYWJsZSB0aGVuIHdlJ2xsIG9ubHkgcmV0dXJuIFNlcnZlciAxLlxuLy9cbi8vICAgU2VydmVyIDM6IFRoZSBuZXh0IG1vc3QgcG9wdWxhciBzZXJ2ZXIgYnkgdXNlciBkaXN0cmlidXRpb24uIFRoaXNcbi8vICAgaGFzIHRoZSBzYW1lIHJ1bGVzIGFzIFNlcnZlciAyLCB3aXRoIHRoZSBhZGRlZCBleGNlcHRpb24gdGhhdCBpdFxuLy8gICBtdXN0IGJlIHVuaXF1ZSBmcm9tIFNlcnZlciAxIGFuZCAyLlxuXG4vLyBSYXRpb25hbGUgZm9yIHBvcHVsYXIgc2VydmVyczogSXQncyBoYXJkIHRvIGdldCByaWQgb2YgcGVvcGxlIHdoZW5cbi8vIHRoZXkga2VlcCBmbG9ja2luZyBpbiBmcm9tIGEgcGFydGljdWxhciBzZXJ2ZXIuIFN1cmUsIHRoZSBzZXJ2ZXIgY291bGRcbi8vIGJlIEFDTCdkIGluIHRoZSBmdXR1cmUgb3IgZm9yIHNvbWUgcmVhc29uIGJlIGV2aWN0ZWQgZnJvbSB0aGUgcm9vbVxuLy8gaG93ZXZlciBhbiBldmVudCBsaWtlIHRoYXQgaXMgdW5saWtlbHkgdGhlIGxhcmdlciB0aGUgcm9vbSBnZXRzLiBJZlxuLy8gdGhlIHNlcnZlciBpcyBBQ0wnZCBhdCB0aGUgdGltZSBvZiBnZW5lcmF0aW5nIHRoZSBsaW5rIGhvd2V2ZXIsIHdlXG4vLyBzaG91bGRuJ3QgcGljayB0aGVtLiBXZSBhbHNvIGRvbid0IHBpY2sgSVAgYWRkcmVzc2VzLlxuXG4vLyBOb3RlOiB3ZSBkb24ndCBwaWNrIHRoZSBzZXJ2ZXIgdGhlIHJvb20gd2FzIGNyZWF0ZWQgb24gYmVjYXVzZSB0aGVcbi8vIGhvbWVzZXJ2ZXIgc2hvdWxkIGFscmVhZHkgYmUgdXNpbmcgdGhhdCBzZXJ2ZXIgYXMgYSBsYXN0IGRpdGNoIGF0dGVtcHRcbi8vIGFuZCB0aGVyZSdzIGxlc3Mgb2YgYSBndWFyYW50ZWUgdGhhdCB0aGUgc2VydmVyIGlzIGEgcmVzaWRlbnQgc2VydmVyLlxuLy8gSW5zdGVhZCwgd2UgYWN0aXZlbHkgZmlndXJlIG91dCB3aGljaCBzZXJ2ZXJzIGFyZSBsaWtlbHkgdG8gYmUgcmVzaWRlbnRzXG4vLyBpbiB0aGUgZnV0dXJlIGFuZCB0cnkgdG8gdXNlIHRob3NlLlxuXG4vLyBOb3RlOiBVc2VycyByZWNlaXZpbmcgcGVybWFsaW5rcyB0aGF0IGhhcHBlbiB0byBoYXZlIGFsbCAzIHBvdGVudGlhbFxuLy8gc2VydmVycyBmYWlsIHRoZW0gKGluIHRlcm1zIG9mIGpvaW5pbmcpIGFyZSBzb21ld2hhdCBleHBlY3RlZCB0byBodW50XG4vLyBkb3duIHRoZSBwZXJzb24gd2hvIGdhdmUgdGhlbSB0aGUgbGluayB0byBhc2sgZm9yIGEgcGFydGljaXBhdGluZyBzZXJ2ZXIuXG4vLyBUaGUgcmVjZWl2aW5nIHVzZXIgY2FuIHRoZW4gbWFudWFsbHkgYXBwZW5kIHRoZSBrbm93bi1nb29kIHNlcnZlciB0b1xuLy8gdGhlIGxpc3QgYW5kIG1hZ2ljYWxseSBoYXZlIHRoZSBsaW5rIHdvcmsuXG5cbmV4cG9ydCBjbGFzcyBSb29tUGVybWFsaW5rQ3JlYXRvciB7XG4gICAgLy8gV2Ugc3VwcG9ydCBiZWluZyBnaXZlbiBhIHJvb21JZCBhcyBhIGZhbGxiYWNrIGluIHRoZSBldmVudCB0aGUgYHJvb21gIG9iamVjdFxuICAgIC8vIGRvZXNuJ3QgZXhpc3Qgb3IgaXMgbm90IGhlYWx0aHkgZm9yIHVzIHRvIHJlbHkgb24uIEZvciBleGFtcGxlLCBsb2FkaW5nIGFcbiAgICAvLyBwZXJtYWxpbmsgdG8gYSByb29tIHdoaWNoIHRoZSBNYXRyaXhDbGllbnQgZG9lc24ndCBrbm93IGFib3V0LlxuICAgIGNvbnN0cnVjdG9yKHJvb20sIHJvb21JZCA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcm9vbSA9IHJvb207XG4gICAgICAgIHRoaXMuX3Jvb21JZCA9IHJvb20gPyByb29tLnJvb21JZCA6IHJvb21JZDtcbiAgICAgICAgdGhpcy5faGlnaGVzdFBsVXNlcklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcG9wdWxhdGlvbk1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2Jhbm5lZEhvc3RzUmVnZXhwcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2FsbG93ZWRIb3N0c1JlZ2V4cHMgPSBudWxsO1xuICAgICAgICB0aGlzLl9zZXJ2ZXJDYW5kaWRhdGVzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghdGhpcy5fcm9vbUlkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gcmVzb2x2ZSBhIHJvb21JZCBmb3IgdGhlIHBlcm1hbGluayBjcmVhdG9yIHRvIHVzZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub25NZW1iZXJzaGlwID0gdGhpcy5vbk1lbWJlcnNoaXAuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vblJvb21TdGF0ZSA9IHRoaXMub25Sb29tU3RhdGUuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBsb2FkKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3Jvb20gfHwgIXRoaXMuX3Jvb20uY3VycmVudFN0YXRlKSB7XG4gICAgICAgICAgICAvLyBVbmRlciByYXJlIGFuZCB1bmtub3duIGNpcmN1bXN0YW5jZXMgaXQgaXMgcG9zc2libGUgdG8gaGF2ZSBhIHJvb20gd2l0aCBub1xuICAgICAgICAgICAgLy8gY3VycmVudFN0YXRlLCBhdCBsZWFzdCBwb3RlbnRpYWxseSBhdCB0aGUgZWFybHkgc3RhZ2VzIG9mIGpvaW5pbmcgYSByb29tLlxuICAgICAgICAgICAgLy8gVG8gYXZvaWQgYnJlYWtpbmcgZXZlcnl0aGluZywgd2UnbGwganVzdCB3YXJuIHJhdGhlciB0aGFuIHRocm93IGFzIHdlbGwgYXNcbiAgICAgICAgICAgIC8vIG5vdCBib3RoZXIgdXBkYXRpbmcgdGhlIHZhcmlvdXMgYXNwZWN0cyBvZiB0aGUgc2hhcmUgbGluay5cbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGxvYWQgYSBwZXJtYWxpbmsgY3JlYXRvciB3aXRoIG5vIHJvb20gc3RhdGVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXBkYXRlQWxsb3dlZFNlcnZlcnMoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlSGlnaGVzdFBsVXNlcigpO1xuICAgICAgICB0aGlzLl91cGRhdGVQb3B1bGF0aW9uTWFwKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlckNhbmRpZGF0ZXMoKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIHRoaXMuX3Jvb20ub24oXCJSb29tTWVtYmVyLm1lbWJlcnNoaXBcIiwgdGhpcy5vbk1lbWJlcnNoaXApO1xuICAgICAgICB0aGlzLl9yb29tLm9uKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLm9uUm9vbVN0YXRlKTtcbiAgICAgICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgc3RvcCgpIHtcbiAgICAgICAgdGhpcy5fcm9vbS5yZW1vdmVMaXN0ZW5lcihcIlJvb21NZW1iZXIubWVtYmVyc2hpcFwiLCB0aGlzLm9uTWVtYmVyc2hpcCk7XG4gICAgICAgIHRoaXMuX3Jvb20ucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMub25Sb29tU3RhdGUpO1xuICAgICAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaXNTdGFydGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RhcnRlZDtcbiAgICB9XG5cbiAgICBmb3JFdmVudChldmVudElkKSB7XG4gICAgICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvckV2ZW50KHRoaXMuX3Jvb21JZCwgZXZlbnRJZCwgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyk7XG4gICAgfVxuXG4gICAgZm9yU2hhcmVhYmxlUm9vbSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jvb20pIHtcbiAgICAgICAgICAgIC8vIFByZWZlciB0byB1c2UgY2Fub25pY2FsIGFsaWFzIGZvciBwZXJtYWxpbmsgaWYgcG9zc2libGVcbiAgICAgICAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5fcm9vbS5nZXRDYW5vbmljYWxBbGlhcygpO1xuICAgICAgICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yUm9vbShhbGlhcywgdGhpcy5fc2VydmVyQ2FuZGlkYXRlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yUm9vbSh0aGlzLl9yb29tSWQsIHRoaXMuX3NlcnZlckNhbmRpZGF0ZXMpO1xuICAgIH1cblxuICAgIGZvclJvb20oKSB7XG4gICAgICAgIHJldHVybiBnZXRQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmZvclJvb20odGhpcy5fcm9vbUlkLCB0aGlzLl9zZXJ2ZXJDYW5kaWRhdGVzKTtcbiAgICB9XG5cbiAgICBvblJvb21TdGF0ZShldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LmdldFR5cGUoKSkge1xuICAgICAgICAgICAgY2FzZSBcIm0ucm9vbS5zZXJ2ZXJfYWNsXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlQWxsb3dlZFNlcnZlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVIaWdoZXN0UGxVc2VyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlUG9wdWxhdGlvbk1hcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlckNhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlIFwibS5yb29tLnBvd2VyX2xldmVsc1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUhpZ2hlc3RQbFVzZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25NZW1iZXJzaGlwKGV2dCwgbWVtYmVyLCBvbGRNZW1iZXJzaGlwKSB7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IG1lbWJlci51c2VySWQ7XG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSBtZW1iZXIubWVtYmVyc2hpcDtcbiAgICAgICAgY29uc3Qgc2VydmVyTmFtZSA9IGdldFNlcnZlck5hbWUodXNlcklkKTtcbiAgICAgICAgY29uc3QgaGFzSm9pbmVkID0gb2xkTWVtYmVyc2hpcCAhPT0gXCJqb2luXCIgJiYgbWVtYmVyc2hpcCA9PT0gXCJqb2luXCI7XG4gICAgICAgIGNvbnN0IGhhc0xlZnQgPSBvbGRNZW1iZXJzaGlwID09PSBcImpvaW5cIiAmJiBtZW1iZXJzaGlwICE9PSBcImpvaW5cIjtcblxuICAgICAgICBpZiAoaGFzTGVmdCkge1xuICAgICAgICAgICAgdGhpcy5fcG9wdWxhdGlvbk1hcFtzZXJ2ZXJOYW1lXS0tO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc0pvaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fcG9wdWxhdGlvbk1hcFtzZXJ2ZXJOYW1lXSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlSGlnaGVzdFBsVXNlcigpO1xuICAgICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJDYW5kaWRhdGVzKCk7XG4gICAgfVxuXG4gICAgX3VwZGF0ZUhpZ2hlc3RQbFVzZXIoKSB7XG4gICAgICAgIGNvbnN0IHBsRXZlbnQgPSB0aGlzLl9yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIik7XG4gICAgICAgIGlmIChwbEV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcGxFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJzID0gY29udGVudC51c2VycztcbiAgICAgICAgICAgICAgICBpZiAodXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHVzZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxsb3dlZEVudHJpZXMgPSBlbnRyaWVzLmZpbHRlcigoW3VzZXJJZF0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHRoaXMuX3Jvb20uZ2V0TWVtYmVyKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlciB8fCBtZW1iZXIubWVtYmVyc2hpcCAhPT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJOYW1lID0gZ2V0U2VydmVyTmFtZSh1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFpc0hvc3RuYW1lSXBBZGRyZXNzKHNlcnZlck5hbWUpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWlzSG9zdEluUmVnZXgoc2VydmVyTmFtZSwgdGhpcy5fYmFubmVkSG9zdHNSZWdleHBzKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzSG9zdEluUmVnZXgoc2VydmVyTmFtZSwgdGhpcy5fYWxsb3dlZEhvc3RzUmVnZXhwcyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXhFbnRyeSA9IGFsbG93ZWRFbnRyaWVzLnJlZHVjZSgobWF4LCBlbnRyeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChlbnRyeVsxXSA+IG1heFsxXSkgPyBlbnRyeSA6IG1heDtcbiAgICAgICAgICAgICAgICAgICAgfSwgW251bGwsIDBdKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3VzZXJJZCwgcG93ZXJMZXZlbF0gPSBtYXhFbnRyeTtcbiAgICAgICAgICAgICAgICAgICAgLy8gb2JqZWN0IHdhc24ndCBlbXB0eSwgYW5kIG1heCBlbnRyeSB3YXNuJ3QgYSBkZW1vdGlvbiBmcm9tIHRoZSBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VySWQgIT09IG51bGwgJiYgcG93ZXJMZXZlbCA+PSA1MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlnaGVzdFBsVXNlcklkID0gdXNlcklkO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hpZ2hlc3RQbFVzZXJJZCA9IG51bGw7XG4gICAgfVxuXG4gICAgX3VwZGF0ZUFsbG93ZWRTZXJ2ZXJzKCkge1xuICAgICAgICBjb25zdCBiYW5uZWRIb3N0c1JlZ2V4cHMgPSBbXTtcbiAgICAgICAgbGV0IGFsbG93ZWRIb3N0c1JlZ2V4cHMgPSBbbmV3IFJlZ0V4cChcIi4qXCIpXTsgLy8gZGVmYXVsdCBhbGxvdyBldmVyeW9uZVxuICAgICAgICBpZiAodGhpcy5fcm9vbS5jdXJyZW50U3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjbEV2ZW50ID0gdGhpcy5fcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uc2VydmVyX2FjbFwiLCBcIlwiKTtcbiAgICAgICAgICAgIGlmIChhY2xFdmVudCAmJiBhY2xFdmVudC5nZXRDb250ZW50KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnZXRSZWdleCA9IChob3N0bmFtZSkgPT4gbmV3IFJlZ0V4cChcIl5cIiArIHV0aWxzLmdsb2JUb1JlZ2V4cChob3N0bmFtZSwgZmFsc2UpICsgXCIkXCIpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGVuaWVkID0gYWNsRXZlbnQuZ2V0Q29udGVudCgpLmRlbnkgfHwgW107XG4gICAgICAgICAgICAgICAgZGVuaWVkLmZvckVhY2goaCA9PiBiYW5uZWRIb3N0c1JlZ2V4cHMucHVzaChnZXRSZWdleChoKSkpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYWxsb3dlZCA9IGFjbEV2ZW50LmdldENvbnRlbnQoKS5hbGxvdyB8fCBbXTtcbiAgICAgICAgICAgICAgICBhbGxvd2VkSG9zdHNSZWdleHBzID0gW107IC8vIHdlIGRvbid0IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0IHJ1bGUgaGVyZVxuICAgICAgICAgICAgICAgIGFsbG93ZWQuZm9yRWFjaChoID0+IGFsbG93ZWRIb3N0c1JlZ2V4cHMucHVzaChnZXRSZWdleChoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Jhbm5lZEhvc3RzUmVnZXhwcyA9IGJhbm5lZEhvc3RzUmVnZXhwcztcbiAgICAgICAgdGhpcy5fYWxsb3dlZEhvc3RzUmVnZXhwcyA9IGFsbG93ZWRIb3N0c1JlZ2V4cHM7XG4gICAgfVxuXG4gICAgX3VwZGF0ZVBvcHVsYXRpb25NYXAoKSB7XG4gICAgICAgIGNvbnN0IHBvcHVsYXRpb25NYXA6IHsgW3NlcnZlcjogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgdGhpcy5fcm9vbS5nZXRKb2luZWRNZW1iZXJzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlck5hbWUgPSBnZXRTZXJ2ZXJOYW1lKG1lbWJlci51c2VySWQpO1xuICAgICAgICAgICAgaWYgKCFwb3B1bGF0aW9uTWFwW3NlcnZlck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgcG9wdWxhdGlvbk1hcFtzZXJ2ZXJOYW1lXSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwb3B1bGF0aW9uTWFwW3NlcnZlck5hbWVdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcG9wdWxhdGlvbk1hcCA9IHBvcHVsYXRpb25NYXA7XG4gICAgfVxuXG4gICAgX3VwZGF0ZVNlcnZlckNhbmRpZGF0ZXMoKSB7XG4gICAgICAgIGxldCBjYW5kaWRhdGVzID0gW107XG4gICAgICAgIGlmICh0aGlzLl9oaWdoZXN0UGxVc2VySWQpIHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaChnZXRTZXJ2ZXJOYW1lKHRoaXMuX2hpZ2hlc3RQbFVzZXJJZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VydmVyc0J5UG9wdWxhdGlvbiA9IE9iamVjdC5rZXlzKHRoaXMuX3BvcHVsYXRpb25NYXApXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gdGhpcy5fcG9wdWxhdGlvbk1hcFtiXSAtIHRoaXMuX3BvcHVsYXRpb25NYXBbYV0pXG4gICAgICAgICAgICAuZmlsdGVyKGEgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAhY2FuZGlkYXRlcy5pbmNsdWRlcyhhKSAmJlxuICAgICAgICAgICAgICAgICAgICAhaXNIb3N0bmFtZUlwQWRkcmVzcyhhKSAmJlxuICAgICAgICAgICAgICAgICAgICAhaXNIb3N0SW5SZWdleChhLCB0aGlzLl9iYW5uZWRIb3N0c1JlZ2V4cHMpICYmXG4gICAgICAgICAgICAgICAgICAgIGlzSG9zdEluUmVnZXgoYSwgdGhpcy5fYWxsb3dlZEhvc3RzUmVnZXhwcyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCByZW1haW5pbmdTZXJ2ZXJzID0gc2VydmVyc0J5UG9wdWxhdGlvbi5zbGljZSgwLCBNQVhfU0VSVkVSX0NBTkRJREFURVMgLSBjYW5kaWRhdGVzLmxlbmd0aCk7XG4gICAgICAgIGNhbmRpZGF0ZXMgPSBjYW5kaWRhdGVzLmNvbmNhdChyZW1haW5pbmdTZXJ2ZXJzKTtcblxuICAgICAgICB0aGlzLl9zZXJ2ZXJDYW5kaWRhdGVzID0gY2FuZGlkYXRlcztcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlR2VuZXJpY1Blcm1hbGluayhlbnRpdHlJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JFbnRpdHkoZW50aXR5SWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVVzZXJQZXJtYWxpbmsodXNlcklkKSB7XG4gICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yVXNlcih1c2VySWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJvb21QZXJtYWxpbmsocm9vbUlkKSB7XG4gICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FuJ3QgcGVybWFsaW5rIGEgZmFsc2V5IHJvb21JZFwiKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcm9vbUlkIGlzbid0IGFjdHVhbGx5IGEgcm9vbSBJRCwgZG9uJ3QgdHJ5IHRvIGxpc3QgdGhlIHNlcnZlcnMuXG4gICAgLy8gQWxpYXNlcyBhcmUgYWxyZWFkeSByb3V0YWJsZSwgYW5kIGRvbid0IG5lZWQgZXh0cmEgaW5mb3JtYXRpb24uXG4gICAgaWYgKHJvb21JZFswXSAhPT0gJyEnKSByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JSb29tKHJvb21JZCwgW10pO1xuXG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgIGlmICghcm9vbSkge1xuICAgICAgICByZXR1cm4gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKS5mb3JSb29tKHJvb21JZCwgW10pO1xuICAgIH1cbiAgICBjb25zdCBwZXJtYWxpbmtDcmVhdG9yID0gbmV3IFJvb21QZXJtYWxpbmtDcmVhdG9yKHJvb20pO1xuICAgIHBlcm1hbGlua0NyZWF0b3IubG9hZCgpO1xuICAgIHJldHVybiBwZXJtYWxpbmtDcmVhdG9yLmZvclJvb20oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VHcm91cFBlcm1hbGluayhncm91cElkKSB7XG4gICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuZm9yR3JvdXAoZ3JvdXBJZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Blcm1hbGlua0hvc3QoaG9zdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gQWx3YXlzIGNoZWNrIGlmIHRoZSBwZXJtYWxpbmsgaXMgYSBzcGVjIHBlcm1hbGluayAoY2FsbGVycyBhcmUgbGlrZWx5IHRvIGNhbGxcbiAgICAvLyBwYXJzZVBlcm1hbGluayBhZnRlciB0aGlzIGZ1bmN0aW9uKS5cbiAgICBpZiAobmV3IFNwZWNQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmlzUGVybWFsaW5rSG9zdChob3N0KSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGdldFBlcm1hbGlua0NvbnN0cnVjdG9yKCkuaXNQZXJtYWxpbmtIb3N0KGhvc3QpO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgYW4gZW50aXR5IChwZXJtYWxpbmssIHJvb20gYWxpYXMsIHVzZXIgSUQsIGV0YykgaW50byBhIGxvY2FsIFVSTFxuICogaWYgcG9zc2libGUuIElmIHRoZSBnaXZlbiBlbnRpdHkgaXMgbm90IGZvdW5kIHRvIGJlIHZhbGlkIGVub3VnaCB0byBiZSBjb252ZXJ0ZWRcbiAqIHRoZW4gYSBudWxsIHZhbHVlIHdpbGwgYmUgcmV0dXJuZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gZW50aXR5IFRoZSBlbnRpdHkgdG8gdHJhbnNmb3JtLlxuICogQHJldHVybnMge3N0cmluZ3xudWxsfSBUaGUgdHJhbnNmb3JtZWQgcGVybWFsaW5rIG9yIG51bGwgaWYgdW5hYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5VHJhbnNmb3JtRW50aXR5VG9QZXJtYWxpbmsoZW50aXR5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghZW50aXR5KSByZXR1cm4gbnVsbDtcblxuICAgIC8vIENoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIGJhcmUgZW50aXR5IGZvciBzdGFydGVyc1xuICAgIGlmIChlbnRpdHlbMF0gPT09ICcjJyB8fCBlbnRpdHlbMF0gPT09ICchJykgcmV0dXJuIG1ha2VSb29tUGVybWFsaW5rKGVudGl0eSk7XG4gICAgaWYgKGVudGl0eVswXSA9PT0gJ0AnKSByZXR1cm4gbWFrZVVzZXJQZXJtYWxpbmsoZW50aXR5KTtcbiAgICBpZiAoZW50aXR5WzBdID09PSAnKycpIHJldHVybiBtYWtlR3JvdXBQZXJtYWxpbmsoZW50aXR5KTtcblxuICAgIC8vIFRoZW4gdHJ5IGFuZCBtZXJnZSBpdCBpbnRvIGEgcGVybWFsaW5rXG4gICAgcmV0dXJuIHRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmKGVudGl0eSk7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIHBlcm1hbGluayAob3IgcG9zc2libGUgcGVybWFsaW5rKSBpbnRvIGEgbG9jYWwgVVJMIGlmIHBvc3NpYmxlLiBJZlxuICogdGhlIGdpdmVuIHBlcm1hbGluayBpcyBmb3VuZCB0byBub3QgYmUgYSBwZXJtYWxpbmssIGl0J2xsIGJlIHJldHVybmVkIHVuYWx0ZXJlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwZXJtYWxpbmsgVGhlIHBlcm1hbGluayB0byB0cnkgYW5kIHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSB0cmFuc2Zvcm1lZCBwZXJtYWxpbmsgb3Igb3JpZ2luYWwgVVJMIGlmIHVuYWJsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmKHBlcm1hbGluazogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXBlcm1hbGluay5zdGFydHNXaXRoKFwiaHR0cDpcIikgJiYgIXBlcm1hbGluay5zdGFydHNXaXRoKFwiaHR0cHM6XCIpKSB7XG4gICAgICAgIHJldHVybiBwZXJtYWxpbms7XG4gICAgfVxuXG4gICAgY29uc3QgbSA9IHBlcm1hbGluay5tYXRjaChtYXRyaXhMaW5raWZ5LkVMRU1FTlRfVVJMX1BBVFRFUk4pO1xuICAgIGlmIChtKSB7XG4gICAgICAgIHJldHVybiBtWzFdO1xuICAgIH1cblxuICAgIC8vIEEgYml0IG9mIGEgaGFjayB0byBjb252ZXJ0IHBlcm1hbGlua3Mgb2YgdW5rbm93biBvcmlnaW4gdG8gRWxlbWVudCBsaW5rc1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBlcm1hbGlua1BhcnRzID0gcGFyc2VQZXJtYWxpbmsocGVybWFsaW5rKTtcbiAgICAgICAgaWYgKHBlcm1hbGlua1BhcnRzKSB7XG4gICAgICAgICAgICBpZiAocGVybWFsaW5rUGFydHMucm9vbUlkT3JBbGlhcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50SWRQYXJ0ID0gcGVybWFsaW5rUGFydHMuZXZlbnRJZCA/IGAvJHtwZXJtYWxpbmtQYXJ0cy5ldmVudElkfWAgOiAnJztcbiAgICAgICAgICAgICAgICBwZXJtYWxpbmsgPSBgIy9yb29tLyR7cGVybWFsaW5rUGFydHMucm9vbUlkT3JBbGlhc30ke2V2ZW50SWRQYXJ0fWA7XG4gICAgICAgICAgICAgICAgaWYgKHBlcm1hbGlua1BhcnRzLnZpYVNlcnZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmsgKz0gbmV3IFNwZWNQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLmVuY29kZVNlcnZlckNhbmRpZGF0ZXMocGVybWFsaW5rUGFydHMudmlhU2VydmVycyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwZXJtYWxpbmtQYXJ0cy5ncm91cElkKSB7XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rID0gYCMvZ3JvdXAvJHtwZXJtYWxpbmtQYXJ0cy5ncm91cElkfWA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBlcm1hbGlua1BhcnRzLnVzZXJJZCkge1xuICAgICAgICAgICAgICAgIHBlcm1hbGluayA9IGAjL3VzZXIvJHtwZXJtYWxpbmtQYXJ0cy51c2VySWR9YDtcbiAgICAgICAgICAgIH0gLy8gZWxzZSBub3QgYSB2YWxpZCBwZXJtYWxpbmsgZm9yIG91ciBwdXJwb3NlcyAtIGRvIG5vdCBoYW5kbGVcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gTm90IGFuIGhyZWYgd2UgbmVlZCB0byBjYXJlIGFib3V0XG4gICAgfVxuXG4gICAgcmV0dXJuIHBlcm1hbGluaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByaW1hcnlQZXJtYWxpbmtFbnRpdHkocGVybWFsaW5rOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBwZXJtYWxpbmtQYXJ0cyA9IHBhcnNlUGVybWFsaW5rKHBlcm1hbGluayk7XG5cbiAgICAgICAgLy8gSWYgbm90IGEgcGVybWFsaW5rLCB0cnkgdGhlIHZlY3RvciBwYXR0ZXJucy5cbiAgICAgICAgaWYgKCFwZXJtYWxpbmtQYXJ0cykge1xuICAgICAgICAgICAgY29uc3QgbSA9IHBlcm1hbGluay5tYXRjaChtYXRyaXhMaW5raWZ5LkVMRU1FTlRfVVJMX1BBVFRFUk4pO1xuICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgICAvLyBBIGJpdCBvZiBhIGhhY2ssIGJ1dCBpdCBnZXRzIHRoZSBqb2IgZG9uZVxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgRWxlbWVudFBlcm1hbGlua0NvbnN0cnVjdG9yKFwiaHR0cDovL2xvY2FsaG9zdFwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbnRpdHlJbmZvID0gbVsxXS5zcGxpdCgnIycpLnNsaWNlKDEpLmpvaW4oJyMnKTtcbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtQYXJ0cyA9IGhhbmRsZXIucGFyc2VQZXJtYWxpbmsoYGh0dHA6Ly9sb2NhbGhvc3QvIyR7ZW50aXR5SW5mb31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGVybWFsaW5rUGFydHMpIHJldHVybiBudWxsOyAvLyBub3QgcHJvY2Vzc2FibGVcbiAgICAgICAgaWYgKHBlcm1hbGlua1BhcnRzLnVzZXJJZCkgcmV0dXJuIHBlcm1hbGlua1BhcnRzLnVzZXJJZDtcbiAgICAgICAgaWYgKHBlcm1hbGlua1BhcnRzLmdyb3VwSWQpIHJldHVybiBwZXJtYWxpbmtQYXJ0cy5ncm91cElkO1xuICAgICAgICBpZiAocGVybWFsaW5rUGFydHMucm9vbUlkT3JBbGlhcykgcmV0dXJuIHBlcm1hbGlua1BhcnRzLnJvb21JZE9yQWxpYXM7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBubyBlbnRpdHkgLSBub3QgYSBwZXJtYWxpbmtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0UGVybWFsaW5rQ29uc3RydWN0b3IoKTogUGVybWFsaW5rQ29uc3RydWN0b3Ige1xuICAgIGNvbnN0IGVsZW1lbnRQcmVmaXggPSBTZGtDb25maWcuZ2V0KClbJ3Blcm1hbGlua1ByZWZpeCddO1xuICAgIGlmIChlbGVtZW50UHJlZml4ICYmIGVsZW1lbnRQcmVmaXggIT09IG1hdHJpeHRvQmFzZVVybCkge1xuICAgICAgICByZXR1cm4gbmV3IEVsZW1lbnRQZXJtYWxpbmtDb25zdHJ1Y3RvcihlbGVtZW50UHJlZml4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNwZWNQZXJtYWxpbmtDb25zdHJ1Y3RvcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQZXJtYWxpbmsoZnVsbFVybDogc3RyaW5nKTogUGVybWFsaW5rUGFydHMge1xuICAgIGNvbnN0IGVsZW1lbnRQcmVmaXggPSBTZGtDb25maWcuZ2V0KClbJ3Blcm1hbGlua1ByZWZpeCddO1xuICAgIGlmIChmdWxsVXJsLnN0YXJ0c1dpdGgobWF0cml4dG9CYXNlVXJsKSkge1xuICAgICAgICByZXR1cm4gbmV3IFNwZWNQZXJtYWxpbmtDb25zdHJ1Y3RvcigpLnBhcnNlUGVybWFsaW5rKGZ1bGxVcmwpO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudFByZWZpeCAmJiBmdWxsVXJsLnN0YXJ0c1dpdGgoZWxlbWVudFByZWZpeCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IoZWxlbWVudFByZWZpeCkucGFyc2VQZXJtYWxpbmsoZnVsbFVybCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7IC8vIG5vdCBhIHBlcm1hbGluayB3ZSBjYW4gaGFuZGxlXG59XG5cbi8qKlxuICogUGFyc2VzIGFuIGFwcCBsb2NhbCBsaW5rIChgIy8odXNlcnxyb29tfGdyb3VwKS9pZGVudGlmZXJgKSB0byBhIE1hdHJpeCBlbnRpdHlcbiAqIChyb29tLCB1c2VyLCBncm91cCkuIFN1Y2ggbGlua3MgYXJlIHByb2R1Y2VkIGJ5IGBIdG1sVXRpbHNgIHdoZW4gZW5jb3VudGVyaW5nXG4gKiBsaW5rcywgd2hpY2ggY2FsbHMgYHRyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmYCBpbiB0aGlzIG1vZHVsZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhbExpbmsgVGhlIGFwcCBsb2NhbCBsaW5rXG4gKiBAcmV0dXJucyB7UGVybWFsaW5rUGFydHN9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFwcExvY2FsTGluayhsb2NhbExpbms6IHN0cmluZyk6IFBlcm1hbGlua1BhcnRzIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzZWdtZW50cyA9IGxvY2FsTGluay5yZXBsYWNlKFwiIy9cIiwgXCJcIik7XG4gICAgICAgIHJldHVybiBFbGVtZW50UGVybWFsaW5rQ29uc3RydWN0b3IucGFyc2VBcHBSb3V0ZShzZWdtZW50cyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBJZ25vcmUgZmFpbHVyZXNcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldFNlcnZlck5hbWUodXNlcklkKSB7XG4gICAgcmV0dXJuIHVzZXJJZC5zcGxpdChcIjpcIikuc3BsaWNlKDEpLmpvaW4oXCI6XCIpO1xufVxuXG5mdW5jdGlvbiBnZXRIb3N0bmFtZUZyb21NYXRyaXhEb21haW4oZG9tYWluKSB7XG4gICAgaWYgKCFkb21haW4pIHJldHVybiBudWxsO1xuICAgIHJldHVybiBuZXcgVVJMKGBodHRwczovLyR7ZG9tYWlufWApLmhvc3RuYW1lO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RJblJlZ2V4KGhvc3RuYW1lLCByZWdleHBzKSB7XG4gICAgaG9zdG5hbWUgPSBnZXRIb3N0bmFtZUZyb21NYXRyaXhEb21haW4oaG9zdG5hbWUpO1xuICAgIGlmICghaG9zdG5hbWUpIHJldHVybiB0cnVlOyAvLyBhc3N1bWVkXG4gICAgaWYgKHJlZ2V4cHMubGVuZ3RoID4gMCAmJiAhcmVnZXhwc1swXS50ZXN0KSB0aHJvdyBuZXcgRXJyb3IocmVnZXhwc1swXSk7XG5cbiAgICByZXR1cm4gcmVnZXhwcy5maWx0ZXIoaCA9PiBoLnRlc3QoaG9zdG5hbWUpKS5sZW5ndGggPiAwO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RuYW1lSXBBZGRyZXNzKGhvc3RuYW1lKSB7XG4gICAgaG9zdG5hbWUgPSBnZXRIb3N0bmFtZUZyb21NYXRyaXhEb21haW4oaG9zdG5hbWUpO1xuICAgIGlmICghaG9zdG5hbWUpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGlzLWlwIGRvZXNuJ3Qgd2FudCBJUHY2IGFkZHJlc3NlcyBzdXJyb3VuZGVkIGJ5IGJyYWNrZXRzLCBzb1xuICAgIC8vIHRha2UgdGhlbSBvZmYuXG4gICAgaWYgKGhvc3RuYW1lLnN0YXJ0c1dpdGgoXCJbXCIpICYmIGhvc3RuYW1lLmVuZHNXaXRoKFwiXVwiKSkge1xuICAgICAgICBob3N0bmFtZSA9IGhvc3RuYW1lLnN1YnN0cmluZygxLCBob3N0bmFtZS5sZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXNJcChob3N0bmFtZSk7XG59XG4iXX0=