"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textForEvent = textForEvent;

var _MatrixClientPeg = require("./MatrixClientPeg");

var _languageHandler = require("./languageHandler");

var Roles = _interopRequireWildcard(require("./Roles"));

var _RoomInvite = require("./RoomInvite");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _BanList = require("./mjolnir/BanList");

var _WidgetLayoutStore = require("./stores/widgets/WidgetLayoutStore");

/*
Copyright 2015, 2016 OpenMarket Ltd

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
function textForMemberEvent(ev) {
  // XXX: SYJS-16 "sender is sometimes null for join messages"
  const senderName = ev.sender ? ev.sender.name : ev.getSender();
  const targetName = ev.target ? ev.target.name : ev.getStateKey();
  const prevContent = ev.getPrevContent();
  const content = ev.getContent();
  const reason = content.reason ? (0, _languageHandler._t)('Reason') + ': ' + content.reason : '';

  switch (content.membership) {
    case 'invite':
      {
        const threePidContent = content.third_party_invite;

        if (threePidContent) {
          if (threePidContent.display_name) {
            return (0, _languageHandler._t)('%(targetName)s accepted the invitation for %(displayName)s.', {
              targetName,
              displayName: threePidContent.display_name
            });
          } else {
            return (0, _languageHandler._t)('%(targetName)s accepted an invitation.', {
              targetName
            });
          }
        } else {
          return (0, _languageHandler._t)('%(senderName)s invited %(targetName)s.', {
            senderName,
            targetName
          });
        }
      }

    case 'ban':
      return (0, _languageHandler._t)('%(senderName)s banned %(targetName)s.', {
        senderName,
        targetName
      }) + ' ' + reason;

    case 'join':
      if (prevContent && prevContent.membership === 'join') {
        if (prevContent.displayname && content.displayname && prevContent.displayname !== content.displayname) {
          return (0, _languageHandler._t)('%(oldDisplayName)s changed their display name to %(displayName)s.', {
            oldDisplayName: prevContent.displayname,
            displayName: content.displayname
          });
        } else if (!prevContent.displayname && content.displayname) {
          return (0, _languageHandler._t)('%(senderName)s set their display name to %(displayName)s.', {
            senderName: ev.getSender(),
            displayName: content.displayname
          });
        } else if (prevContent.displayname && !content.displayname) {
          return (0, _languageHandler._t)('%(senderName)s removed their display name (%(oldDisplayName)s).', {
            senderName,
            oldDisplayName: prevContent.displayname
          });
        } else if (prevContent.avatar_url && !content.avatar_url) {
          return (0, _languageHandler._t)('%(senderName)s removed their profile picture.', {
            senderName
          });
        } else if (prevContent.avatar_url && content.avatar_url && prevContent.avatar_url !== content.avatar_url) {
          return (0, _languageHandler._t)('%(senderName)s changed their profile picture.', {
            senderName
          });
        } else if (!prevContent.avatar_url && content.avatar_url) {
          return (0, _languageHandler._t)('%(senderName)s set a profile picture.', {
            senderName
          });
        } else if (_SettingsStore.default.getValue("showHiddenEventsInTimeline")) {
          // This is a null rejoin, it will only be visible if the Labs option is enabled
          return (0, _languageHandler._t)("%(senderName)s made no change.", {
            senderName
          });
        } else {
          return "";
        }
      } else {
        if (!ev.target) console.warn("Join message has no target! -- " + ev.getContent().state_key);
        return (0, _languageHandler._t)('%(targetName)s joined the room.', {
          targetName
        });
      }

    case 'leave':
      if (ev.getSender() === ev.getStateKey()) {
        if (prevContent.membership === "invite") {
          return (0, _languageHandler._t)('%(targetName)s rejected the invitation.', {
            targetName
          });
        } else {
          return (0, _languageHandler._t)('%(targetName)s left the room.', {
            targetName
          });
        }
      } else if (prevContent.membership === "ban") {
        return (0, _languageHandler._t)('%(senderName)s unbanned %(targetName)s.', {
          senderName,
          targetName
        });
      } else if (prevContent.membership === "invite") {
        return (0, _languageHandler._t)('%(senderName)s withdrew %(targetName)s\'s invitation.', {
          senderName,
          targetName
        }) + ' ' + reason;
      } else if (prevContent.membership === "join") {
        return (0, _languageHandler._t)('%(senderName)s kicked %(targetName)s.', {
          senderName,
          targetName
        }) + ' ' + reason;
      } else {
        return "";
      }

  }
}

function textForTopicEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  return (0, _languageHandler._t)('%(senderDisplayName)s changed the topic to "%(topic)s".', {
    senderDisplayName,
    topic: ev.getContent().topic
  });
}

function textForRoomNameEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

  if (!ev.getContent().name || ev.getContent().name.trim().length === 0) {
    return (0, _languageHandler._t)('%(senderDisplayName)s removed the room name.', {
      senderDisplayName
    });
  }

  if (ev.getPrevContent().name) {
    return (0, _languageHandler._t)('%(senderDisplayName)s changed the room name from %(oldRoomName)s to %(newRoomName)s.', {
      senderDisplayName,
      oldRoomName: ev.getPrevContent().name,
      newRoomName: ev.getContent().name
    });
  }

  return (0, _languageHandler._t)('%(senderDisplayName)s changed the room name to %(roomName)s.', {
    senderDisplayName,
    roomName: ev.getContent().name
  });
}

function textForTombstoneEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  return (0, _languageHandler._t)('%(senderDisplayName)s upgraded this room.', {
    senderDisplayName
  });
}

function textForJoinRulesEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

  switch (ev.getContent().join_rule) {
    case "public":
      return (0, _languageHandler._t)('%(senderDisplayName)s made the room public to whoever knows the link.', {
        senderDisplayName
      });

    case "invite":
      return (0, _languageHandler._t)('%(senderDisplayName)s made the room invite only.', {
        senderDisplayName
      });

    default:
      // The spec supports "knock" and "private", however nothing implements these.
      return (0, _languageHandler._t)('%(senderDisplayName)s changed the join rule to %(rule)s', {
        senderDisplayName,
        rule: ev.getContent().join_rule
      });
  }
}

function textForGuestAccessEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();

  switch (ev.getContent().guest_access) {
    case "can_join":
      return (0, _languageHandler._t)('%(senderDisplayName)s has allowed guests to join the room.', {
        senderDisplayName
      });

    case "forbidden":
      return (0, _languageHandler._t)('%(senderDisplayName)s has prevented guests from joining the room.', {
        senderDisplayName
      });

    default:
      // There's no other options we can expect, however just for safety's sake we'll do this.
      return (0, _languageHandler._t)('%(senderDisplayName)s changed guest access to %(rule)s', {
        senderDisplayName,
        rule: ev.getContent().guest_access
      });
  }
}

function textForRelatedGroupsEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  const groups = ev.getContent().groups || [];
  const prevGroups = ev.getPrevContent().groups || [];
  const added = groups.filter(g => !prevGroups.includes(g));
  const removed = prevGroups.filter(g => !groups.includes(g));

  if (added.length && !removed.length) {
    return (0, _languageHandler._t)('%(senderDisplayName)s enabled flair for %(groups)s in this room.', {
      senderDisplayName,
      groups: added.join(', ')
    });
  } else if (!added.length && removed.length) {
    return (0, _languageHandler._t)('%(senderDisplayName)s disabled flair for %(groups)s in this room.', {
      senderDisplayName,
      groups: removed.join(', ')
    });
  } else if (added.length && removed.length) {
    return (0, _languageHandler._t)('%(senderDisplayName)s enabled flair for %(newGroups)s and disabled flair for ' + '%(oldGroups)s in this room.', {
      senderDisplayName,
      newGroups: added.join(', '),
      oldGroups: removed.join(', ')
    });
  } else {
    // Don't bother rendering this change (because there were no changes)
    return '';
  }
}

function textForServerACLEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  const prevContent = ev.getPrevContent();
  const current = ev.getContent();
  const prev = {
    deny: Array.isArray(prevContent.deny) ? prevContent.deny : [],
    allow: Array.isArray(prevContent.allow) ? prevContent.allow : [],
    allow_ip_literals: !(prevContent.allow_ip_literals === false)
  };
  let text = "";

  if (prev.deny.length === 0 && prev.allow.length === 0) {
    text = (0, _languageHandler._t)("%(senderDisplayName)s set the server ACLs for this room.", {
      senderDisplayName
    });
  } else {
    text = (0, _languageHandler._t)("%(senderDisplayName)s changed the server ACLs for this room.", {
      senderDisplayName
    });
  }

  if (!Array.isArray(current.allow)) {
    current.allow = [];
  } // If we know for sure everyone is banned, mark the room as obliterated


  if (current.allow.length === 0) {
    return text + " " + (0, _languageHandler._t)("🎉 All servers are banned from participating! This room can no longer be used.");
  }

  return text;
}

function textForMessageEvent(ev) {
  const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  let message = senderDisplayName + ': ' + ev.getContent().body;

  if (ev.getContent().msgtype === "m.emote") {
    message = "* " + senderDisplayName + " " + message;
  } else if (ev.getContent().msgtype === "m.image") {
    message = (0, _languageHandler._t)('%(senderDisplayName)s sent an image.', {
      senderDisplayName
    });
  }

  return message;
}

function textForCanonicalAliasEvent(ev) {
  const senderName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
  const oldAlias = ev.getPrevContent().alias;
  const oldAltAliases = ev.getPrevContent().alt_aliases || [];
  const newAlias = ev.getContent().alias;
  const newAltAliases = ev.getContent().alt_aliases || [];
  const removedAltAliases = oldAltAliases.filter(alias => !newAltAliases.includes(alias));
  const addedAltAliases = newAltAliases.filter(alias => !oldAltAliases.includes(alias));

  if (!removedAltAliases.length && !addedAltAliases.length) {
    if (newAlias) {
      return (0, _languageHandler._t)('%(senderName)s set the main address for this room to %(address)s.', {
        senderName: senderName,
        address: ev.getContent().alias
      });
    } else if (oldAlias) {
      return (0, _languageHandler._t)('%(senderName)s removed the main address for this room.', {
        senderName: senderName
      });
    }
  } else if (newAlias === oldAlias) {
    if (addedAltAliases.length && !removedAltAliases.length) {
      return (0, _languageHandler._t)('%(senderName)s added the alternative addresses %(addresses)s for this room.', {
        senderName: senderName,
        addresses: addedAltAliases.join(", "),
        count: addedAltAliases.length
      });
    }

    if (removedAltAliases.length && !addedAltAliases.length) {
      return (0, _languageHandler._t)('%(senderName)s removed the alternative addresses %(addresses)s for this room.', {
        senderName: senderName,
        addresses: removedAltAliases.join(", "),
        count: removedAltAliases.length
      });
    }

    if (removedAltAliases.length && addedAltAliases.length) {
      return (0, _languageHandler._t)('%(senderName)s changed the alternative addresses for this room.', {
        senderName: senderName
      });
    }
  } else {
    // both alias and alt_aliases where modified
    return (0, _languageHandler._t)('%(senderName)s changed the main and alternative addresses for this room.', {
      senderName: senderName
    });
  } // in case there is no difference between the two events,
  // say something as we can't simply hide the tile from here


  return (0, _languageHandler._t)('%(senderName)s changed the addresses for this room.', {
    senderName: senderName
  });
}

function textForCallAnswerEvent(event) {
  const senderName = event.sender ? event.sender.name : (0, _languageHandler._t)('Someone');
  const supported = _MatrixClientPeg.MatrixClientPeg.get().supportsVoip() ? '' : (0, _languageHandler._t)('(not supported by this browser)');
  return (0, _languageHandler._t)('%(senderName)s answered the call.', {
    senderName
  }) + ' ' + supported;
}

function textForCallHangupEvent(event) {
  const senderName = event.sender ? event.sender.name : (0, _languageHandler._t)('Someone');
  const eventContent = event.getContent();
  let reason = "";

  if (!_MatrixClientPeg.MatrixClientPeg.get().supportsVoip()) {
    reason = (0, _languageHandler._t)('(not supported by this browser)');
  } else if (eventContent.reason) {
    if (eventContent.reason === "ice_failed") {
      // We couldn't establish a connection at all
      reason = (0, _languageHandler._t)('(could not connect media)');
    } else if (eventContent.reason === "ice_timeout") {
      // We established a connection but it died
      reason = (0, _languageHandler._t)('(connection failed)');
    } else if (eventContent.reason === "user_media_failed") {
      // The other side couldn't open capture devices
      reason = (0, _languageHandler._t)("(their device couldn't start the camera / microphone)");
    } else if (eventContent.reason === "unknown_error") {
      // An error code the other side doesn't have a way to express
      // (as opposed to an error code they gave but we don't know about,
      // in which case we show the error code)
      reason = (0, _languageHandler._t)("(an error occurred)");
    } else if (eventContent.reason === "invite_timeout") {
      reason = (0, _languageHandler._t)('(no answer)');
    } else if (eventContent.reason === "user hangup" || eventContent.reason === "user_hangup") {
      // workaround for https://github.com/vector-im/element-web/issues/5178
      // it seems Android randomly sets a reason of "user hangup" which is
      // interpreted as an error code :(
      // https://github.com/vector-im/riot-android/issues/2623
      // Also the correct hangup code as of VoIP v1 (with underscore)
      reason = '';
    } else {
      reason = (0, _languageHandler._t)('(unknown failure: %(reason)s)', {
        reason: eventContent.reason
      });
    }
  }

  return (0, _languageHandler._t)('%(senderName)s ended the call.', {
    senderName
  }) + ' ' + reason;
}

function textForCallRejectEvent(event) {
  const senderName = event.sender ? event.sender.name : (0, _languageHandler._t)('Someone');
  return (0, _languageHandler._t)('%(senderName)s declined the call.', {
    senderName
  });
}

function textForCallInviteEvent(event) {
  const senderName = event.sender ? event.sender.name : (0, _languageHandler._t)('Someone'); // FIXME: Find a better way to determine this from the event?

  let isVoice = true;

  if (event.getContent().offer && event.getContent().offer.sdp && event.getContent().offer.sdp.indexOf('m=video') !== -1) {
    isVoice = false;
  }

  const isSupported = _MatrixClientPeg.MatrixClientPeg.get().supportsVoip(); // This ladder could be reduced down to a couple string variables, however other languages
  // can have a hard time translating those strings. In an effort to make translations easier
  // and more accurate, we break out the string-based variables to a couple booleans.


  if (isVoice && isSupported) {
    return (0, _languageHandler._t)("%(senderName)s placed a voice call.", {
      senderName
    });
  } else if (isVoice && !isSupported) {
    return (0, _languageHandler._t)("%(senderName)s placed a voice call. (not supported by this browser)", {
      senderName
    });
  } else if (!isVoice && isSupported) {
    return (0, _languageHandler._t)("%(senderName)s placed a video call.", {
      senderName
    });
  } else if (!isVoice && !isSupported) {
    return (0, _languageHandler._t)("%(senderName)s placed a video call. (not supported by this browser)", {
      senderName
    });
  }
}

function textForThreePidInviteEvent(event) {
  const senderName = event.sender ? event.sender.name : event.getSender();

  if (!(0, _RoomInvite.isValid3pidInvite)(event)) {
    const targetDisplayName = event.getPrevContent().display_name || (0, _languageHandler._t)("Someone");
    return (0, _languageHandler._t)('%(senderName)s revoked the invitation for %(targetDisplayName)s to join the room.', {
      senderName,
      targetDisplayName
    });
  }

  return (0, _languageHandler._t)('%(senderName)s sent an invitation to %(targetDisplayName)s to join the room.', {
    senderName,
    targetDisplayName: event.getContent().display_name
  });
}

function textForHistoryVisibilityEvent(event) {
  const senderName = event.sender ? event.sender.name : event.getSender();

  switch (event.getContent().history_visibility) {
    case 'invited':
      return (0, _languageHandler._t)('%(senderName)s made future room history visible to all room members, ' + 'from the point they are invited.', {
        senderName
      });

    case 'joined':
      return (0, _languageHandler._t)('%(senderName)s made future room history visible to all room members, ' + 'from the point they joined.', {
        senderName
      });

    case 'shared':
      return (0, _languageHandler._t)('%(senderName)s made future room history visible to all room members.', {
        senderName
      });

    case 'world_readable':
      return (0, _languageHandler._t)('%(senderName)s made future room history visible to anyone.', {
        senderName
      });

    default:
      return (0, _languageHandler._t)('%(senderName)s made future room history visible to unknown (%(visibility)s).', {
        senderName,
        visibility: event.getContent().history_visibility
      });
  }
} // Currently will only display a change if a user's power level is changed


function textForPowerEvent(event) {
  const senderName = event.sender ? event.sender.name : event.getSender();

  if (!event.getPrevContent() || !event.getPrevContent().users || !event.getContent() || !event.getContent().users) {
    return '';
  }

  const userDefault = event.getContent().users_default || 0; // Construct set of userIds

  const users = [];
  Object.keys(event.getContent().users).forEach(userId => {
    if (users.indexOf(userId) === -1) users.push(userId);
  });
  Object.keys(event.getPrevContent().users).forEach(userId => {
    if (users.indexOf(userId) === -1) users.push(userId);
  });
  const diff = []; // XXX: This is also surely broken for i18n

  users.forEach(userId => {
    // Previous power level
    const from = event.getPrevContent().users[userId]; // Current power level

    const to = event.getContent().users[userId];

    if (to !== from) {
      diff.push((0, _languageHandler._t)('%(userId)s from %(fromPowerLevel)s to %(toPowerLevel)s', {
        userId,
        fromPowerLevel: Roles.textualPowerLevel(from, userDefault),
        toPowerLevel: Roles.textualPowerLevel(to, userDefault)
      }));
    }
  });

  if (!diff.length) {
    return '';
  }

  return (0, _languageHandler._t)('%(senderName)s changed the power level of %(powerLevelDiffText)s.', {
    senderName,
    powerLevelDiffText: diff.join(", ")
  });
}

function textForPinnedEvent(event) {
  const senderName = event.sender ? event.sender.name : event.getSender();
  return (0, _languageHandler._t)("%(senderName)s changed the pinned messages for the room.", {
    senderName
  });
}

function textForWidgetEvent(event) {
  const senderName = event.getSender();
  const {
    name: prevName,
    type: prevType,
    url: prevUrl
  } = event.getPrevContent();
  const {
    name,
    type,
    url
  } = event.getContent() || {};
  let widgetName = name || prevName || type || prevType || ''; // Apply sentence case to widget name

  if (widgetName && widgetName.length > 0) {
    widgetName = widgetName[0].toUpperCase() + widgetName.slice(1);
  } // If the widget was removed, its content should be {}, but this is sufficiently
  // equivalent to that condition.


  if (url) {
    if (prevUrl) {
      return (0, _languageHandler._t)('%(widgetName)s widget modified by %(senderName)s', {
        widgetName,
        senderName
      });
    } else {
      return (0, _languageHandler._t)('%(widgetName)s widget added by %(senderName)s', {
        widgetName,
        senderName
      });
    }
  } else {
    return (0, _languageHandler._t)('%(widgetName)s widget removed by %(senderName)s', {
      widgetName,
      senderName
    });
  }
}

function textForWidgetLayoutEvent(event) {
  const senderName = event.sender?.name || event.getSender();
  return (0, _languageHandler._t)("%(senderName)s has updated the widget layout", {
    senderName
  });
}

function textForMjolnirEvent(event) {
  const senderName = event.getSender();
  const {
    entity: prevEntity
  } = event.getPrevContent();
  const {
    entity,
    recommendation,
    reason
  } = event.getContent(); // Rule removed

  if (!entity) {
    if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s removed the rule banning users matching %(glob)s", {
        senderName,
        glob: prevEntity
      });
    } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s removed the rule banning rooms matching %(glob)s", {
        senderName,
        glob: prevEntity
      });
    } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s removed the rule banning servers matching %(glob)s", {
        senderName,
        glob: prevEntity
      });
    } // Unknown type. We'll say something, but we shouldn't end up here.


    return (0, _languageHandler._t)("%(senderName)s removed a ban rule matching %(glob)s", {
      senderName,
      glob: prevEntity
    });
  } // Invalid rule


  if (!recommendation || !reason) return (0, _languageHandler._t)(`%(senderName)s updated an invalid ban rule`, {
    senderName
  }); // Rule updated

  if (entity === prevEntity) {
    if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s updated the rule banning users matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s updated the rule banning rooms matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s updated the rule banning servers matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } // Unknown type. We'll say something but we shouldn't end up here.


    return (0, _languageHandler._t)("%(senderName)s updated a ban rule matching %(glob)s for %(reason)s", {
      senderName,
      glob: entity,
      reason
    });
  } // New rule


  if (!prevEntity) {
    if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s created a rule banning users matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s created a rule banning rooms matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
      return (0, _languageHandler._t)("%(senderName)s created a rule banning servers matching %(glob)s for %(reason)s", {
        senderName,
        glob: entity,
        reason
      });
    } // Unknown type. We'll say something but we shouldn't end up here.


    return (0, _languageHandler._t)("%(senderName)s created a ban rule matching %(glob)s for %(reason)s", {
      senderName,
      glob: entity,
      reason
    });
  } // else the entity !== prevEntity - count as a removal & add


  if (_BanList.USER_RULE_TYPES.includes(event.getType())) {
    return (0, _languageHandler._t)("%(senderName)s changed a rule that was banning users matching %(oldGlob)s to matching " + "%(newGlob)s for %(reason)s", {
      senderName,
      oldGlob: prevEntity,
      newGlob: entity,
      reason
    });
  } else if (_BanList.ROOM_RULE_TYPES.includes(event.getType())) {
    return (0, _languageHandler._t)("%(senderName)s changed a rule that was banning rooms matching %(oldGlob)s to matching " + "%(newGlob)s for %(reason)s", {
      senderName,
      oldGlob: prevEntity,
      newGlob: entity,
      reason
    });
  } else if (_BanList.SERVER_RULE_TYPES.includes(event.getType())) {
    return (0, _languageHandler._t)("%(senderName)s changed a rule that was banning servers matching %(oldGlob)s to matching " + "%(newGlob)s for %(reason)s", {
      senderName,
      oldGlob: prevEntity,
      newGlob: entity,
      reason
    });
  } // Unknown type. We'll say something but we shouldn't end up here.


  return (0, _languageHandler._t)("%(senderName)s updated a ban rule that was matching %(oldGlob)s to matching %(newGlob)s " + "for %(reason)s", {
    senderName,
    oldGlob: prevEntity,
    newGlob: entity,
    reason
  });
}

const handlers = {
  'm.room.message': textForMessageEvent,
  'm.call.invite': textForCallInviteEvent,
  'm.call.answer': textForCallAnswerEvent,
  'm.call.hangup': textForCallHangupEvent,
  'm.call.reject': textForCallRejectEvent
};
const stateHandlers = {
  'm.room.canonical_alias': textForCanonicalAliasEvent,
  'm.room.name': textForRoomNameEvent,
  'm.room.topic': textForTopicEvent,
  'm.room.member': textForMemberEvent,
  'm.room.third_party_invite': textForThreePidInviteEvent,
  'm.room.history_visibility': textForHistoryVisibilityEvent,
  'm.room.power_levels': textForPowerEvent,
  'm.room.pinned_events': textForPinnedEvent,
  'm.room.server_acl': textForServerACLEvent,
  'm.room.tombstone': textForTombstoneEvent,
  'm.room.join_rules': textForJoinRulesEvent,
  'm.room.guest_access': textForGuestAccessEvent,
  'm.room.related_groups': textForRelatedGroupsEvent,
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  'im.vector.modular.widgets': textForWidgetEvent,
  [_WidgetLayoutStore.WIDGET_LAYOUT_EVENT_TYPE]: textForWidgetLayoutEvent
}; // Add all the Mjolnir stuff to the renderer

for (const evType of _BanList.ALL_RULE_TYPES) {
  stateHandlers[evType] = textForMjolnirEvent;
}

function textForEvent(ev) {
  const handler = (ev.isState() ? stateHandlers : handlers)[ev.getType()];
  if (handler) return handler(ev);
  return '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9UZXh0Rm9yRXZlbnQuanMiXSwibmFtZXMiOlsidGV4dEZvck1lbWJlckV2ZW50IiwiZXYiLCJzZW5kZXJOYW1lIiwic2VuZGVyIiwibmFtZSIsImdldFNlbmRlciIsInRhcmdldE5hbWUiLCJ0YXJnZXQiLCJnZXRTdGF0ZUtleSIsInByZXZDb250ZW50IiwiZ2V0UHJldkNvbnRlbnQiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsInJlYXNvbiIsIm1lbWJlcnNoaXAiLCJ0aHJlZVBpZENvbnRlbnQiLCJ0aGlyZF9wYXJ0eV9pbnZpdGUiLCJkaXNwbGF5X25hbWUiLCJkaXNwbGF5TmFtZSIsImRpc3BsYXluYW1lIiwib2xkRGlzcGxheU5hbWUiLCJhdmF0YXJfdXJsIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiY29uc29sZSIsIndhcm4iLCJzdGF0ZV9rZXkiLCJ0ZXh0Rm9yVG9waWNFdmVudCIsInNlbmRlckRpc3BsYXlOYW1lIiwidG9waWMiLCJ0ZXh0Rm9yUm9vbU5hbWVFdmVudCIsInRyaW0iLCJsZW5ndGgiLCJvbGRSb29tTmFtZSIsIm5ld1Jvb21OYW1lIiwicm9vbU5hbWUiLCJ0ZXh0Rm9yVG9tYnN0b25lRXZlbnQiLCJ0ZXh0Rm9ySm9pblJ1bGVzRXZlbnQiLCJqb2luX3J1bGUiLCJydWxlIiwidGV4dEZvckd1ZXN0QWNjZXNzRXZlbnQiLCJndWVzdF9hY2Nlc3MiLCJ0ZXh0Rm9yUmVsYXRlZEdyb3Vwc0V2ZW50IiwiZ3JvdXBzIiwicHJldkdyb3VwcyIsImFkZGVkIiwiZmlsdGVyIiwiZyIsImluY2x1ZGVzIiwicmVtb3ZlZCIsImpvaW4iLCJuZXdHcm91cHMiLCJvbGRHcm91cHMiLCJ0ZXh0Rm9yU2VydmVyQUNMRXZlbnQiLCJjdXJyZW50IiwicHJldiIsImRlbnkiLCJBcnJheSIsImlzQXJyYXkiLCJhbGxvdyIsImFsbG93X2lwX2xpdGVyYWxzIiwidGV4dCIsInRleHRGb3JNZXNzYWdlRXZlbnQiLCJtZXNzYWdlIiwiYm9keSIsIm1zZ3R5cGUiLCJ0ZXh0Rm9yQ2Fub25pY2FsQWxpYXNFdmVudCIsIm9sZEFsaWFzIiwiYWxpYXMiLCJvbGRBbHRBbGlhc2VzIiwiYWx0X2FsaWFzZXMiLCJuZXdBbGlhcyIsIm5ld0FsdEFsaWFzZXMiLCJyZW1vdmVkQWx0QWxpYXNlcyIsImFkZGVkQWx0QWxpYXNlcyIsImFkZHJlc3MiLCJhZGRyZXNzZXMiLCJjb3VudCIsInRleHRGb3JDYWxsQW5zd2VyRXZlbnQiLCJldmVudCIsInN1cHBvcnRlZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInN1cHBvcnRzVm9pcCIsInRleHRGb3JDYWxsSGFuZ3VwRXZlbnQiLCJldmVudENvbnRlbnQiLCJ0ZXh0Rm9yQ2FsbFJlamVjdEV2ZW50IiwidGV4dEZvckNhbGxJbnZpdGVFdmVudCIsImlzVm9pY2UiLCJvZmZlciIsInNkcCIsImluZGV4T2YiLCJpc1N1cHBvcnRlZCIsInRleHRGb3JUaHJlZVBpZEludml0ZUV2ZW50IiwidGFyZ2V0RGlzcGxheU5hbWUiLCJ0ZXh0Rm9ySGlzdG9yeVZpc2liaWxpdHlFdmVudCIsImhpc3RvcnlfdmlzaWJpbGl0eSIsInZpc2liaWxpdHkiLCJ0ZXh0Rm9yUG93ZXJFdmVudCIsInVzZXJzIiwidXNlckRlZmF1bHQiLCJ1c2Vyc19kZWZhdWx0IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJ1c2VySWQiLCJwdXNoIiwiZGlmZiIsImZyb20iLCJ0byIsImZyb21Qb3dlckxldmVsIiwiUm9sZXMiLCJ0ZXh0dWFsUG93ZXJMZXZlbCIsInRvUG93ZXJMZXZlbCIsInBvd2VyTGV2ZWxEaWZmVGV4dCIsInRleHRGb3JQaW5uZWRFdmVudCIsInRleHRGb3JXaWRnZXRFdmVudCIsInByZXZOYW1lIiwidHlwZSIsInByZXZUeXBlIiwidXJsIiwicHJldlVybCIsIndpZGdldE5hbWUiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwidGV4dEZvcldpZGdldExheW91dEV2ZW50IiwidGV4dEZvck1qb2xuaXJFdmVudCIsImVudGl0eSIsInByZXZFbnRpdHkiLCJyZWNvbW1lbmRhdGlvbiIsIlVTRVJfUlVMRV9UWVBFUyIsImdldFR5cGUiLCJnbG9iIiwiUk9PTV9SVUxFX1RZUEVTIiwiU0VSVkVSX1JVTEVfVFlQRVMiLCJvbGRHbG9iIiwibmV3R2xvYiIsImhhbmRsZXJzIiwic3RhdGVIYW5kbGVycyIsIldJREdFVF9MQVlPVVRfRVZFTlRfVFlQRSIsImV2VHlwZSIsIkFMTF9SVUxFX1RZUEVTIiwidGV4dEZvckV2ZW50IiwiaGFuZGxlciIsImlzU3RhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBLFNBQVNBLGtCQUFULENBQTRCQyxFQUE1QixFQUFnQztBQUM1QjtBQUNBLFFBQU1DLFVBQVUsR0FBR0QsRUFBRSxDQUFDRSxNQUFILEdBQVlGLEVBQUUsQ0FBQ0UsTUFBSCxDQUFVQyxJQUF0QixHQUE2QkgsRUFBRSxDQUFDSSxTQUFILEVBQWhEO0FBQ0EsUUFBTUMsVUFBVSxHQUFHTCxFQUFFLENBQUNNLE1BQUgsR0FBWU4sRUFBRSxDQUFDTSxNQUFILENBQVVILElBQXRCLEdBQTZCSCxFQUFFLENBQUNPLFdBQUgsRUFBaEQ7QUFDQSxRQUFNQyxXQUFXLEdBQUdSLEVBQUUsQ0FBQ1MsY0FBSCxFQUFwQjtBQUNBLFFBQU1DLE9BQU8sR0FBR1YsRUFBRSxDQUFDVyxVQUFILEVBQWhCO0FBRUEsUUFBTUMsTUFBTSxHQUFHRixPQUFPLENBQUNFLE1BQVIsR0FBa0IseUJBQUcsUUFBSCxJQUFlLElBQWYsR0FBc0JGLE9BQU8sQ0FBQ0UsTUFBaEQsR0FBMEQsRUFBekU7O0FBQ0EsVUFBUUYsT0FBTyxDQUFDRyxVQUFoQjtBQUNJLFNBQUssUUFBTDtBQUFlO0FBQ1gsY0FBTUMsZUFBZSxHQUFHSixPQUFPLENBQUNLLGtC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QVpMO0FBYWxCLDJCQUF5QkUseUJBYlA7QUFlbEI7QUFDQSwrQkFBNkIwRSxrQkFoQlg7QUFpQmxCLEdBQUN1QiwyQ0FBRCxHQUE0QmQ7QUFqQlYsQ0FBdEIsQyxDQW9CQTs7QUFDQSxLQUFLLE1BQU1lLE1BQVgsSUFBcUJDLHVCQUFyQixFQUFxQztBQUNqQ0gsRUFBQUEsYUFBYSxDQUFDRSxNQUFELENBQWIsR0FBd0JkLG1CQUF4QjtBQUNIOztBQUVNLFNBQVNnQixZQUFULENBQXNCN0ksRUFBdEIsRUFBMEI7QUFDN0IsUUFBTThJLE9BQU8sR0FBRyxDQUFDOUksRUFBRSxDQUFDK0ksT0FBSCxLQUFlTixhQUFmLEdBQStCRCxRQUFoQyxFQUEwQ3hJLEVBQUUsQ0FBQ2tJLE9BQUgsRUFBMUMsQ0FBaEI7QUFDQSxNQUFJWSxPQUFKLEVBQWEsT0FBT0EsT0FBTyxDQUFDOUksRUFBRCxDQUFkO0FBQ2IsU0FBTyxFQUFQO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgUm9sZXMgZnJvbSAnLi9Sb2xlcyc7XG5pbXBvcnQge2lzVmFsaWQzcGlkSW52aXRlfSBmcm9tIFwiLi9Sb29tSW52aXRlXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge0FMTF9SVUxFX1RZUEVTLCBST09NX1JVTEVfVFlQRVMsIFNFUlZFUl9SVUxFX1RZUEVTLCBVU0VSX1JVTEVfVFlQRVN9IGZyb20gXCIuL21qb2xuaXIvQmFuTGlzdFwiO1xuaW1wb3J0IHtXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEV9IGZyb20gXCIuL3N0b3Jlcy93aWRnZXRzL1dpZGdldExheW91dFN0b3JlXCI7XG5cbmZ1bmN0aW9uIHRleHRGb3JNZW1iZXJFdmVudChldikge1xuICAgIC8vIFhYWDogU1lKUy0xNiBcInNlbmRlciBpcyBzb21ldGltZXMgbnVsbCBmb3Igam9pbiBtZXNzYWdlc1wiXG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGV2LnNlbmRlciA/IGV2LnNlbmRlci5uYW1lIDogZXYuZ2V0U2VuZGVyKCk7XG4gICAgY29uc3QgdGFyZ2V0TmFtZSA9IGV2LnRhcmdldCA/IGV2LnRhcmdldC5uYW1lIDogZXYuZ2V0U3RhdGVLZXkoKTtcbiAgICBjb25zdCBwcmV2Q29udGVudCA9IGV2LmdldFByZXZDb250ZW50KCk7XG4gICAgY29uc3QgY29udGVudCA9IGV2LmdldENvbnRlbnQoKTtcblxuICAgIGNvbnN0IHJlYXNvbiA9IGNvbnRlbnQucmVhc29uID8gKF90KCdSZWFzb24nKSArICc6ICcgKyBjb250ZW50LnJlYXNvbikgOiAnJztcbiAgICBzd2l0Y2ggKGNvbnRlbnQubWVtYmVyc2hpcCkge1xuICAgICAgICBjYXNlICdpbnZpdGUnOiB7XG4gICAgICAgICAgICBjb25zdCB0aHJlZVBpZENvbnRlbnQgPSBjb250ZW50LnRoaXJkX3BhcnR5X2ludml0ZTtcbiAgICAgICAgICAgIGlmICh0aHJlZVBpZENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhyZWVQaWRDb250ZW50LmRpc3BsYXlfbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QoJyUodGFyZ2V0TmFtZSlzIGFjY2VwdGVkIHRoZSBpbnZpdGF0aW9uIGZvciAlKGRpc3BsYXlOYW1lKXMuJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiB0aHJlZVBpZENvbnRlbnQuZGlzcGxheV9uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QoJyUodGFyZ2V0TmFtZSlzIGFjY2VwdGVkIGFuIGludml0YXRpb24uJywge3RhcmdldE5hbWV9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgaW52aXRlZCAlKHRhcmdldE5hbWUpcy4nLCB7c2VuZGVyTmFtZSwgdGFyZ2V0TmFtZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jhbic6XG4gICAgICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyTmFtZSlzIGJhbm5lZCAlKHRhcmdldE5hbWUpcy4nLCB7c2VuZGVyTmFtZSwgdGFyZ2V0TmFtZX0pICsgJyAnICsgcmVhc29uO1xuICAgICAgICBjYXNlICdqb2luJzpcbiAgICAgICAgICAgIGlmIChwcmV2Q29udGVudCAmJiBwcmV2Q29udGVudC5tZW1iZXJzaGlwID09PSAnam9pbicpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJldkNvbnRlbnQuZGlzcGxheW5hbWUgJiYgY29udGVudC5kaXNwbGF5bmFtZSAmJiBwcmV2Q29udGVudC5kaXNwbGF5bmFtZSAhPT0gY29udGVudC5kaXNwbGF5bmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QoJyUob2xkRGlzcGxheU5hbWUpcyBjaGFuZ2VkIHRoZWlyIGRpc3BsYXkgbmFtZSB0byAlKGRpc3BsYXlOYW1lKXMuJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkRGlzcGxheU5hbWU6IHByZXZDb250ZW50LmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IGNvbnRlbnQuZGlzcGxheW5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXByZXZDb250ZW50LmRpc3BsYXluYW1lICYmIGNvbnRlbnQuZGlzcGxheW5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyBzZXQgdGhlaXIgZGlzcGxheSBuYW1lIHRvICUoZGlzcGxheU5hbWUpcy4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZW5kZXJOYW1lOiBldi5nZXRTZW5kZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBjb250ZW50LmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByZXZDb250ZW50LmRpc3BsYXluYW1lICYmICFjb250ZW50LmRpc3BsYXluYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgcmVtb3ZlZCB0aGVpciBkaXNwbGF5IG5hbWUgKCUob2xkRGlzcGxheU5hbWUpcykuJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZERpc3BsYXlOYW1lOiBwcmV2Q29udGVudC5kaXNwbGF5bmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2Q29udGVudC5hdmF0YXJfdXJsICYmICFjb250ZW50LmF2YXRhcl91cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZWlyIHByb2ZpbGUgcGljdHVyZS4nLCB7c2VuZGVyTmFtZX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJldkNvbnRlbnQuYXZhdGFyX3VybCAmJiBjb250ZW50LmF2YXRhcl91cmwgJiZcbiAgICAgICAgICAgICAgICAgICAgcHJldkNvbnRlbnQuYXZhdGFyX3VybCAhPT0gY29udGVudC5hdmF0YXJfdXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgY2hhbmdlZCB0aGVpciBwcm9maWxlIHBpY3R1cmUuJywge3NlbmRlck5hbWV9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFwcmV2Q29udGVudC5hdmF0YXJfdXJsICYmIGNvbnRlbnQuYXZhdGFyX3VybCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyTmFtZSlzIHNldCBhIHByb2ZpbGUgcGljdHVyZS4nLCB7c2VuZGVyTmFtZX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dIaWRkZW5FdmVudHNJblRpbWVsaW5lXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBudWxsIHJlam9pbiwgaXQgd2lsbCBvbmx5IGJlIHZpc2libGUgaWYgdGhlIExhYnMgb3B0aW9uIGlzIGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgbWFkZSBubyBjaGFuZ2UuXCIsIHtzZW5kZXJOYW1lfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2LnRhcmdldCkgY29uc29sZS53YXJuKFwiSm9pbiBtZXNzYWdlIGhhcyBubyB0YXJnZXQhIC0tIFwiICsgZXYuZ2V0Q29udGVudCgpLnN0YXRlX2tleSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCclKHRhcmdldE5hbWUpcyBqb2luZWQgdGhlIHJvb20uJywge3RhcmdldE5hbWV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnbGVhdmUnOlxuICAgICAgICAgICAgaWYgKGV2LmdldFNlbmRlcigpID09PSBldi5nZXRTdGF0ZUtleSgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZDb250ZW50Lm1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KCclKHRhcmdldE5hbWUpcyByZWplY3RlZCB0aGUgaW52aXRhdGlvbi4nLCB7dGFyZ2V0TmFtZX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdCgnJSh0YXJnZXROYW1lKXMgbGVmdCB0aGUgcm9vbS4nLCB7dGFyZ2V0TmFtZX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJldkNvbnRlbnQubWVtYmVyc2hpcCA9PT0gXCJiYW5cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgdW5iYW5uZWQgJSh0YXJnZXROYW1lKXMuJywge3NlbmRlck5hbWUsIHRhcmdldE5hbWV9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJldkNvbnRlbnQubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgd2l0aGRyZXcgJSh0YXJnZXROYW1lKXNcXCdzIGludml0YXRpb24uJywge1xuICAgICAgICAgICAgICAgICAgICBzZW5kZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXROYW1lLFxuICAgICAgICAgICAgICAgIH0pICsgJyAnICsgcmVhc29uO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2Q29udGVudC5tZW1iZXJzaGlwID09PSBcImpvaW5cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMga2lja2VkICUodGFyZ2V0TmFtZSlzLicsIHtzZW5kZXJOYW1lLCB0YXJnZXROYW1lfSkgKyAnICcgKyByZWFzb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gdGV4dEZvclRvcGljRXZlbnQoZXYpIHtcbiAgICBjb25zdCBzZW5kZXJEaXNwbGF5TmFtZSA9IGV2LnNlbmRlciAmJiBldi5zZW5kZXIubmFtZSA/IGV2LnNlbmRlci5uYW1lIDogZXYuZ2V0U2VuZGVyKCk7XG4gICAgcmV0dXJuIF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgY2hhbmdlZCB0aGUgdG9waWMgdG8gXCIlKHRvcGljKXNcIi4nLCB7XG4gICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICB0b3BpYzogZXYuZ2V0Q29udGVudCgpLnRvcGljLFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yUm9vbU5hbWVFdmVudChldikge1xuICAgIGNvbnN0IHNlbmRlckRpc3BsYXlOYW1lID0gZXYuc2VuZGVyICYmIGV2LnNlbmRlci5uYW1lID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcblxuICAgIGlmICghZXYuZ2V0Q29udGVudCgpLm5hbWUgfHwgZXYuZ2V0Q29udGVudCgpLm5hbWUudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyByZW1vdmVkIHRoZSByb29tIG5hbWUuJywge3NlbmRlckRpc3BsYXlOYW1lfSk7XG4gICAgfVxuICAgIGlmIChldi5nZXRQcmV2Q29udGVudCgpLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgY2hhbmdlZCB0aGUgcm9vbSBuYW1lIGZyb20gJShvbGRSb29tTmFtZSlzIHRvICUobmV3Um9vbU5hbWUpcy4nLCB7XG4gICAgICAgICAgICBzZW5kZXJEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIG9sZFJvb21OYW1lOiBldi5nZXRQcmV2Q29udGVudCgpLm5hbWUsXG4gICAgICAgICAgICBuZXdSb29tTmFtZTogZXYuZ2V0Q29udGVudCgpLm5hbWUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBjaGFuZ2VkIHRoZSByb29tIG5hbWUgdG8gJShyb29tTmFtZSlzLicsIHtcbiAgICAgICAgc2VuZGVyRGlzcGxheU5hbWUsXG4gICAgICAgIHJvb21OYW1lOiBldi5nZXRDb250ZW50KCkubmFtZSxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gdGV4dEZvclRvbWJzdG9uZUV2ZW50KGV2KSB7XG4gICAgY29uc3Qgc2VuZGVyRGlzcGxheU5hbWUgPSBldi5zZW5kZXIgJiYgZXYuc2VuZGVyLm5hbWUgPyBldi5zZW5kZXIubmFtZSA6IGV2LmdldFNlbmRlcigpO1xuICAgIHJldHVybiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIHVwZ3JhZGVkIHRoaXMgcm9vbS4nLCB7c2VuZGVyRGlzcGxheU5hbWV9KTtcbn1cblxuZnVuY3Rpb24gdGV4dEZvckpvaW5SdWxlc0V2ZW50KGV2KSB7XG4gICAgY29uc3Qgc2VuZGVyRGlzcGxheU5hbWUgPSBldi5zZW5kZXIgJiYgZXYuc2VuZGVyLm5hbWUgPyBldi5zZW5kZXIubmFtZSA6IGV2LmdldFNlbmRlcigpO1xuICAgIHN3aXRjaCAoZXYuZ2V0Q29udGVudCgpLmpvaW5fcnVsZSkge1xuICAgICAgICBjYXNlIFwicHVibGljXCI6XG4gICAgICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBtYWRlIHRoZSByb29tIHB1YmxpYyB0byB3aG9ldmVyIGtub3dzIHRoZSBsaW5rLicsIHtzZW5kZXJEaXNwbGF5TmFtZX0pO1xuICAgICAgICBjYXNlIFwiaW52aXRlXCI6XG4gICAgICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBtYWRlIHRoZSByb29tIGludml0ZSBvbmx5LicsIHtzZW5kZXJEaXNwbGF5TmFtZX0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gVGhlIHNwZWMgc3VwcG9ydHMgXCJrbm9ja1wiIGFuZCBcInByaXZhdGVcIiwgaG93ZXZlciBub3RoaW5nIGltcGxlbWVudHMgdGhlc2UuXG4gICAgICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBjaGFuZ2VkIHRoZSBqb2luIHJ1bGUgdG8gJShydWxlKXMnLCB7XG4gICAgICAgICAgICAgICAgc2VuZGVyRGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgcnVsZTogZXYuZ2V0Q29udGVudCgpLmpvaW5fcnVsZSxcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGV4dEZvckd1ZXN0QWNjZXNzRXZlbnQoZXYpIHtcbiAgICBjb25zdCBzZW5kZXJEaXNwbGF5TmFtZSA9IGV2LnNlbmRlciAmJiBldi5zZW5kZXIubmFtZSA/IGV2LnNlbmRlci5uYW1lIDogZXYuZ2V0U2VuZGVyKCk7XG4gICAgc3dpdGNoIChldi5nZXRDb250ZW50KCkuZ3Vlc3RfYWNjZXNzKSB7XG4gICAgICAgIGNhc2UgXCJjYW5fam9pblwiOlxuICAgICAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgaGFzIGFsbG93ZWQgZ3Vlc3RzIHRvIGpvaW4gdGhlIHJvb20uJywge3NlbmRlckRpc3BsYXlOYW1lfSk7XG4gICAgICAgIGNhc2UgXCJmb3JiaWRkZW5cIjpcbiAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGhhcyBwcmV2ZW50ZWQgZ3Vlc3RzIGZyb20gam9pbmluZyB0aGUgcm9vbS4nLCB7c2VuZGVyRGlzcGxheU5hbWV9KTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIFRoZXJlJ3Mgbm8gb3RoZXIgb3B0aW9ucyB3ZSBjYW4gZXhwZWN0LCBob3dldmVyIGp1c3QgZm9yIHNhZmV0eSdzIHNha2Ugd2UnbGwgZG8gdGhpcy5cbiAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGNoYW5nZWQgZ3Vlc3QgYWNjZXNzIHRvICUocnVsZSlzJywge1xuICAgICAgICAgICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgIHJ1bGU6IGV2LmdldENvbnRlbnQoKS5ndWVzdF9hY2Nlc3MsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JSZWxhdGVkR3JvdXBzRXZlbnQoZXYpIHtcbiAgICBjb25zdCBzZW5kZXJEaXNwbGF5TmFtZSA9IGV2LnNlbmRlciAmJiBldi5zZW5kZXIubmFtZSA/IGV2LnNlbmRlci5uYW1lIDogZXYuZ2V0U2VuZGVyKCk7XG4gICAgY29uc3QgZ3JvdXBzID0gZXYuZ2V0Q29udGVudCgpLmdyb3VwcyB8fCBbXTtcbiAgICBjb25zdCBwcmV2R3JvdXBzID0gZXYuZ2V0UHJldkNvbnRlbnQoKS5ncm91cHMgfHwgW107XG4gICAgY29uc3QgYWRkZWQgPSBncm91cHMuZmlsdGVyKChnKSA9PiAhcHJldkdyb3Vwcy5pbmNsdWRlcyhnKSk7XG4gICAgY29uc3QgcmVtb3ZlZCA9IHByZXZHcm91cHMuZmlsdGVyKChnKSA9PiAhZ3JvdXBzLmluY2x1ZGVzKGcpKTtcblxuICAgIGlmIChhZGRlZC5sZW5ndGggJiYgIXJlbW92ZWQubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGVuYWJsZWQgZmxhaXIgZm9yICUoZ3JvdXBzKXMgaW4gdGhpcyByb29tLicsIHtcbiAgICAgICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgZ3JvdXBzOiBhZGRlZC5qb2luKCcsICcpLFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFhZGRlZC5sZW5ndGggJiYgcmVtb3ZlZC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlckRpc3BsYXlOYW1lKXMgZGlzYWJsZWQgZmxhaXIgZm9yICUoZ3JvdXBzKXMgaW4gdGhpcyByb29tLicsIHtcbiAgICAgICAgICAgIHNlbmRlckRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgZ3JvdXBzOiByZW1vdmVkLmpvaW4oJywgJyksXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoYWRkZWQubGVuZ3RoICYmIHJlbW92ZWQubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGVuYWJsZWQgZmxhaXIgZm9yICUobmV3R3JvdXBzKXMgYW5kIGRpc2FibGVkIGZsYWlyIGZvciAnICtcbiAgICAgICAgICAgICclKG9sZEdyb3VwcylzIGluIHRoaXMgcm9vbS4nLCB7XG4gICAgICAgICAgICBzZW5kZXJEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIG5ld0dyb3VwczogYWRkZWQuam9pbignLCAnKSxcbiAgICAgICAgICAgIG9sZEdyb3VwczogcmVtb3ZlZC5qb2luKCcsICcpLFxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEb24ndCBib3RoZXIgcmVuZGVyaW5nIHRoaXMgY2hhbmdlIChiZWNhdXNlIHRoZXJlIHdlcmUgbm8gY2hhbmdlcylcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGV4dEZvclNlcnZlckFDTEV2ZW50KGV2KSB7XG4gICAgY29uc3Qgc2VuZGVyRGlzcGxheU5hbWUgPSBldi5zZW5kZXIgJiYgZXYuc2VuZGVyLm5hbWUgPyBldi5zZW5kZXIubmFtZSA6IGV2LmdldFNlbmRlcigpO1xuICAgIGNvbnN0IHByZXZDb250ZW50ID0gZXYuZ2V0UHJldkNvbnRlbnQoKTtcbiAgICBjb25zdCBjdXJyZW50ID0gZXYuZ2V0Q29udGVudCgpO1xuICAgIGNvbnN0IHByZXYgPSB7XG4gICAgICAgIGRlbnk6IEFycmF5LmlzQXJyYXkocHJldkNvbnRlbnQuZGVueSkgPyBwcmV2Q29udGVudC5kZW55IDogW10sXG4gICAgICAgIGFsbG93OiBBcnJheS5pc0FycmF5KHByZXZDb250ZW50LmFsbG93KSA/IHByZXZDb250ZW50LmFsbG93IDogW10sXG4gICAgICAgIGFsbG93X2lwX2xpdGVyYWxzOiAhKHByZXZDb250ZW50LmFsbG93X2lwX2xpdGVyYWxzID09PSBmYWxzZSksXG4gICAgfTtcblxuICAgIGxldCB0ZXh0ID0gXCJcIjtcbiAgICBpZiAocHJldi5kZW55Lmxlbmd0aCA9PT0gMCAmJiBwcmV2LmFsbG93Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0ZXh0ID0gX3QoXCIlKHNlbmRlckRpc3BsYXlOYW1lKXMgc2V0IHRoZSBzZXJ2ZXIgQUNMcyBmb3IgdGhpcyByb29tLlwiLCB7c2VuZGVyRGlzcGxheU5hbWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gX3QoXCIlKHNlbmRlckRpc3BsYXlOYW1lKXMgY2hhbmdlZCB0aGUgc2VydmVyIEFDTHMgZm9yIHRoaXMgcm9vbS5cIiwge3NlbmRlckRpc3BsYXlOYW1lfSk7XG4gICAgfVxuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGN1cnJlbnQuYWxsb3cpKSB7XG4gICAgICAgIGN1cnJlbnQuYWxsb3cgPSBbXTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBrbm93IGZvciBzdXJlIGV2ZXJ5b25lIGlzIGJhbm5lZCwgbWFyayB0aGUgcm9vbSBhcyBvYmxpdGVyYXRlZFxuICAgIGlmIChjdXJyZW50LmFsbG93Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGV4dCArIFwiIFwiICsgX3QoXCLwn46JIEFsbCBzZXJ2ZXJzIGFyZSBiYW5uZWQgZnJvbSBwYXJ0aWNpcGF0aW5nISBUaGlzIHJvb20gY2FuIG5vIGxvbmdlciBiZSB1c2VkLlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGV4dDtcbn1cblxuZnVuY3Rpb24gdGV4dEZvck1lc3NhZ2VFdmVudChldikge1xuICAgIGNvbnN0IHNlbmRlckRpc3BsYXlOYW1lID0gZXYuc2VuZGVyICYmIGV2LnNlbmRlci5uYW1lID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcbiAgICBsZXQgbWVzc2FnZSA9IHNlbmRlckRpc3BsYXlOYW1lICsgJzogJyArIGV2LmdldENvbnRlbnQoKS5ib2R5O1xuICAgIGlmIChldi5nZXRDb250ZW50KCkubXNndHlwZSA9PT0gXCJtLmVtb3RlXCIpIHtcbiAgICAgICAgbWVzc2FnZSA9IFwiKiBcIiArIHNlbmRlckRpc3BsYXlOYW1lICsgXCIgXCIgKyBtZXNzYWdlO1xuICAgIH0gZWxzZSBpZiAoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUgPT09IFwibS5pbWFnZVwiKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIHNlbnQgYW4gaW1hZ2UuJywge3NlbmRlckRpc3BsYXlOYW1lfSk7XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yQ2Fub25pY2FsQWxpYXNFdmVudChldikge1xuICAgIGNvbnN0IHNlbmRlck5hbWUgPSBldi5zZW5kZXIgJiYgZXYuc2VuZGVyLm5hbWUgPyBldi5zZW5kZXIubmFtZSA6IGV2LmdldFNlbmRlcigpO1xuICAgIGNvbnN0IG9sZEFsaWFzID0gZXYuZ2V0UHJldkNvbnRlbnQoKS5hbGlhcztcbiAgICBjb25zdCBvbGRBbHRBbGlhc2VzID0gZXYuZ2V0UHJldkNvbnRlbnQoKS5hbHRfYWxpYXNlcyB8fCBbXTtcbiAgICBjb25zdCBuZXdBbGlhcyA9IGV2LmdldENvbnRlbnQoKS5hbGlhcztcbiAgICBjb25zdCBuZXdBbHRBbGlhc2VzID0gZXYuZ2V0Q29udGVudCgpLmFsdF9hbGlhc2VzIHx8IFtdO1xuICAgIGNvbnN0IHJlbW92ZWRBbHRBbGlhc2VzID0gb2xkQWx0QWxpYXNlcy5maWx0ZXIoYWxpYXMgPT4gIW5ld0FsdEFsaWFzZXMuaW5jbHVkZXMoYWxpYXMpKTtcbiAgICBjb25zdCBhZGRlZEFsdEFsaWFzZXMgPSBuZXdBbHRBbGlhc2VzLmZpbHRlcihhbGlhcyA9PiAhb2xkQWx0QWxpYXNlcy5pbmNsdWRlcyhhbGlhcykpO1xuXG4gICAgaWYgKCFyZW1vdmVkQWx0QWxpYXNlcy5sZW5ndGggJiYgIWFkZGVkQWx0QWxpYXNlcy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKG5ld0FsaWFzKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyTmFtZSlzIHNldCB0aGUgbWFpbiBhZGRyZXNzIGZvciB0aGlzIHJvb20gdG8gJShhZGRyZXNzKXMuJywge1xuICAgICAgICAgICAgICAgIHNlbmRlck5hbWU6IHNlbmRlck5hbWUsXG4gICAgICAgICAgICAgICAgYWRkcmVzczogZXYuZ2V0Q29udGVudCgpLmFsaWFzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAob2xkQWxpYXMpIHtcbiAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgcmVtb3ZlZCB0aGUgbWFpbiBhZGRyZXNzIGZvciB0aGlzIHJvb20uJywge1xuICAgICAgICAgICAgICAgIHNlbmRlck5hbWU6IHNlbmRlck5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAobmV3QWxpYXMgPT09IG9sZEFsaWFzKSB7XG4gICAgICAgIGlmIChhZGRlZEFsdEFsaWFzZXMubGVuZ3RoICYmICFyZW1vdmVkQWx0QWxpYXNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgYWRkZWQgdGhlIGFsdGVybmF0aXZlIGFkZHJlc3NlcyAlKGFkZHJlc3NlcylzIGZvciB0aGlzIHJvb20uJywge1xuICAgICAgICAgICAgICAgIHNlbmRlck5hbWU6IHNlbmRlck5hbWUsXG4gICAgICAgICAgICAgICAgYWRkcmVzc2VzOiBhZGRlZEFsdEFsaWFzZXMuam9pbihcIiwgXCIpLFxuICAgICAgICAgICAgICAgIGNvdW50OiBhZGRlZEFsdEFsaWFzZXMubGVuZ3RoLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gaWYgKHJlbW92ZWRBbHRBbGlhc2VzLmxlbmd0aCAmJiAhYWRkZWRBbHRBbGlhc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZSBhbHRlcm5hdGl2ZSBhZGRyZXNzZXMgJShhZGRyZXNzZXMpcyBmb3IgdGhpcyByb29tLicsIHtcbiAgICAgICAgICAgICAgICBzZW5kZXJOYW1lOiBzZW5kZXJOYW1lLFxuICAgICAgICAgICAgICAgIGFkZHJlc3NlczogcmVtb3ZlZEFsdEFsaWFzZXMuam9pbihcIiwgXCIpLFxuICAgICAgICAgICAgICAgIGNvdW50OiByZW1vdmVkQWx0QWxpYXNlcy5sZW5ndGgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBpZiAocmVtb3ZlZEFsdEFsaWFzZXMubGVuZ3RoICYmIGFkZGVkQWx0QWxpYXNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgY2hhbmdlZCB0aGUgYWx0ZXJuYXRpdmUgYWRkcmVzc2VzIGZvciB0aGlzIHJvb20uJywge1xuICAgICAgICAgICAgICAgIHNlbmRlck5hbWU6IHNlbmRlck5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGJvdGggYWxpYXMgYW5kIGFsdF9hbGlhc2VzIHdoZXJlIG1vZGlmaWVkXG4gICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgY2hhbmdlZCB0aGUgbWFpbiBhbmQgYWx0ZXJuYXRpdmUgYWRkcmVzc2VzIGZvciB0aGlzIHJvb20uJywge1xuICAgICAgICAgICAgc2VuZGVyTmFtZTogc2VuZGVyTmFtZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGluIGNhc2UgdGhlcmUgaXMgbm8gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSB0d28gZXZlbnRzLFxuICAgIC8vIHNheSBzb21ldGhpbmcgYXMgd2UgY2FuJ3Qgc2ltcGx5IGhpZGUgdGhlIHRpbGUgZnJvbSBoZXJlXG4gICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyBjaGFuZ2VkIHRoZSBhZGRyZXNzZXMgZm9yIHRoaXMgcm9vbS4nLCB7XG4gICAgICAgIHNlbmRlck5hbWU6IHNlbmRlck5hbWUsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JDYWxsQW5zd2VyRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXZlbnQuc2VuZGVyID8gZXZlbnQuc2VuZGVyLm5hbWUgOiBfdCgnU29tZW9uZScpO1xuICAgIGNvbnN0IHN1cHBvcnRlZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKSA/ICcnIDogX3QoJyhub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3NlciknKTtcbiAgICByZXR1cm4gX3QoJyUoc2VuZGVyTmFtZSlzIGFuc3dlcmVkIHRoZSBjYWxsLicsIHtzZW5kZXJOYW1lfSkgKyAnICcgKyBzdXBwb3J0ZWQ7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JDYWxsSGFuZ3VwRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXZlbnQuc2VuZGVyID8gZXZlbnQuc2VuZGVyLm5hbWUgOiBfdCgnU29tZW9uZScpO1xuICAgIGNvbnN0IGV2ZW50Q29udGVudCA9IGV2ZW50LmdldENvbnRlbnQoKTtcbiAgICBsZXQgcmVhc29uID0gXCJcIjtcbiAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKSkge1xuICAgICAgICByZWFzb24gPSBfdCgnKG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBicm93c2VyKScpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnRDb250ZW50LnJlYXNvbikge1xuICAgICAgICBpZiAoZXZlbnRDb250ZW50LnJlYXNvbiA9PT0gXCJpY2VfZmFpbGVkXCIpIHtcbiAgICAgICAgICAgIC8vIFdlIGNvdWxkbid0IGVzdGFibGlzaCBhIGNvbm5lY3Rpb24gYXQgYWxsXG4gICAgICAgICAgICByZWFzb24gPSBfdCgnKGNvdWxkIG5vdCBjb25uZWN0IG1lZGlhKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Q29udGVudC5yZWFzb24gPT09IFwiaWNlX3RpbWVvdXRcIikge1xuICAgICAgICAgICAgLy8gV2UgZXN0YWJsaXNoZWQgYSBjb25uZWN0aW9uIGJ1dCBpdCBkaWVkXG4gICAgICAgICAgICByZWFzb24gPSBfdCgnKGNvbm5lY3Rpb24gZmFpbGVkKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Q29udGVudC5yZWFzb24gPT09IFwidXNlcl9tZWRpYV9mYWlsZWRcIikge1xuICAgICAgICAgICAgLy8gVGhlIG90aGVyIHNpZGUgY291bGRuJ3Qgb3BlbiBjYXB0dXJlIGRldmljZXNcbiAgICAgICAgICAgIHJlYXNvbiA9IF90KFwiKHRoZWlyIGRldmljZSBjb3VsZG4ndCBzdGFydCB0aGUgY2FtZXJhIC8gbWljcm9waG9uZSlcIik7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRDb250ZW50LnJlYXNvbiA9PT0gXCJ1bmtub3duX2Vycm9yXCIpIHtcbiAgICAgICAgICAgIC8vIEFuIGVycm9yIGNvZGUgdGhlIG90aGVyIHNpZGUgZG9lc24ndCBoYXZlIGEgd2F5IHRvIGV4cHJlc3NcbiAgICAgICAgICAgIC8vIChhcyBvcHBvc2VkIHRvIGFuIGVycm9yIGNvZGUgdGhleSBnYXZlIGJ1dCB3ZSBkb24ndCBrbm93IGFib3V0LFxuICAgICAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSB3ZSBzaG93IHRoZSBlcnJvciBjb2RlKVxuICAgICAgICAgICAgcmVhc29uID0gX3QoXCIoYW4gZXJyb3Igb2NjdXJyZWQpXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Q29udGVudC5yZWFzb24gPT09IFwiaW52aXRlX3RpbWVvdXRcIikge1xuICAgICAgICAgICAgcmVhc29uID0gX3QoJyhubyBhbnN3ZXIpJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRDb250ZW50LnJlYXNvbiA9PT0gXCJ1c2VyIGhhbmd1cFwiIHx8IGV2ZW50Q29udGVudC5yZWFzb24gPT09IFwidXNlcl9oYW5ndXBcIikge1xuICAgICAgICAgICAgLy8gd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvNTE3OFxuICAgICAgICAgICAgLy8gaXQgc2VlbXMgQW5kcm9pZCByYW5kb21seSBzZXRzIGEgcmVhc29uIG9mIFwidXNlciBoYW5ndXBcIiB3aGljaCBpc1xuICAgICAgICAgICAgLy8gaW50ZXJwcmV0ZWQgYXMgYW4gZXJyb3IgY29kZSA6KFxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9yaW90LWFuZHJvaWQvaXNzdWVzLzI2MjNcbiAgICAgICAgICAgIC8vIEFsc28gdGhlIGNvcnJlY3QgaGFuZ3VwIGNvZGUgYXMgb2YgVm9JUCB2MSAod2l0aCB1bmRlcnNjb3JlKVxuICAgICAgICAgICAgcmVhc29uID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWFzb24gPSBfdCgnKHVua25vd24gZmFpbHVyZTogJShyZWFzb24pcyknLCB7cmVhc29uOiBldmVudENvbnRlbnQucmVhc29ufSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyBlbmRlZCB0aGUgY2FsbC4nLCB7c2VuZGVyTmFtZX0pICsgJyAnICsgcmVhc29uO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yQ2FsbFJlamVjdEV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGV2ZW50LnNlbmRlciA/IGV2ZW50LnNlbmRlci5uYW1lIDogX3QoJ1NvbWVvbmUnKTtcbiAgICByZXR1cm4gX3QoJyUoc2VuZGVyTmFtZSlzIGRlY2xpbmVkIHRoZSBjYWxsLicsIHtzZW5kZXJOYW1lfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JDYWxsSW52aXRlRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXZlbnQuc2VuZGVyID8gZXZlbnQuc2VuZGVyLm5hbWUgOiBfdCgnU29tZW9uZScpO1xuICAgIC8vIEZJWE1FOiBGaW5kIGEgYmV0dGVyIHdheSB0byBkZXRlcm1pbmUgdGhpcyBmcm9tIHRoZSBldmVudD9cbiAgICBsZXQgaXNWb2ljZSA9IHRydWU7XG4gICAgaWYgKGV2ZW50LmdldENvbnRlbnQoKS5vZmZlciAmJiBldmVudC5nZXRDb250ZW50KCkub2ZmZXIuc2RwICYmXG4gICAgICAgICAgICBldmVudC5nZXRDb250ZW50KCkub2ZmZXIuc2RwLmluZGV4T2YoJ209dmlkZW8nKSAhPT0gLTEpIHtcbiAgICAgICAgaXNWb2ljZSA9IGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBpc1N1cHBvcnRlZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKTtcblxuICAgIC8vIFRoaXMgbGFkZGVyIGNvdWxkIGJlIHJlZHVjZWQgZG93biB0byBhIGNvdXBsZSBzdHJpbmcgdmFyaWFibGVzLCBob3dldmVyIG90aGVyIGxhbmd1YWdlc1xuICAgIC8vIGNhbiBoYXZlIGEgaGFyZCB0aW1lIHRyYW5zbGF0aW5nIHRob3NlIHN0cmluZ3MuIEluIGFuIGVmZm9ydCB0byBtYWtlIHRyYW5zbGF0aW9ucyBlYXNpZXJcbiAgICAvLyBhbmQgbW9yZSBhY2N1cmF0ZSwgd2UgYnJlYWsgb3V0IHRoZSBzdHJpbmctYmFzZWQgdmFyaWFibGVzIHRvIGEgY291cGxlIGJvb2xlYW5zLlxuICAgIGlmIChpc1ZvaWNlICYmIGlzU3VwcG9ydGVkKSB7XG4gICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIHBsYWNlZCBhIHZvaWNlIGNhbGwuXCIsIHtzZW5kZXJOYW1lfSk7XG4gICAgfSBlbHNlIGlmIChpc1ZvaWNlICYmICFpc1N1cHBvcnRlZCkge1xuICAgICAgICByZXR1cm4gX3QoXCIlKHNlbmRlck5hbWUpcyBwbGFjZWQgYSB2b2ljZSBjYWxsLiAobm90IHN1cHBvcnRlZCBieSB0aGlzIGJyb3dzZXIpXCIsIHtzZW5kZXJOYW1lfSk7XG4gICAgfSBlbHNlIGlmICghaXNWb2ljZSAmJiBpc1N1cHBvcnRlZCkge1xuICAgICAgICByZXR1cm4gX3QoXCIlKHNlbmRlck5hbWUpcyBwbGFjZWQgYSB2aWRlbyBjYWxsLlwiLCB7c2VuZGVyTmFtZX0pO1xuICAgIH0gZWxzZSBpZiAoIWlzVm9pY2UgJiYgIWlzU3VwcG9ydGVkKSB7XG4gICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIHBsYWNlZCBhIHZpZGVvIGNhbGwuIChub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgYnJvd3NlcilcIiwge3NlbmRlck5hbWV9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JUaHJlZVBpZEludml0ZUV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGV2ZW50LnNlbmRlciA/IGV2ZW50LnNlbmRlci5uYW1lIDogZXZlbnQuZ2V0U2VuZGVyKCk7XG5cbiAgICBpZiAoIWlzVmFsaWQzcGlkSW52aXRlKGV2ZW50KSkge1xuICAgICAgICBjb25zdCB0YXJnZXREaXNwbGF5TmFtZSA9IGV2ZW50LmdldFByZXZDb250ZW50KCkuZGlzcGxheV9uYW1lIHx8IF90KFwiU29tZW9uZVwiKTtcbiAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyByZXZva2VkIHRoZSBpbnZpdGF0aW9uIGZvciAlKHRhcmdldERpc3BsYXlOYW1lKXMgdG8gam9pbiB0aGUgcm9vbS4nLCB7XG4gICAgICAgICAgICBzZW5kZXJOYW1lLFxuICAgICAgICAgICAgdGFyZ2V0RGlzcGxheU5hbWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgc2VudCBhbiBpbnZpdGF0aW9uIHRvICUodGFyZ2V0RGlzcGxheU5hbWUpcyB0byBqb2luIHRoZSByb29tLicsIHtcbiAgICAgICAgc2VuZGVyTmFtZSxcbiAgICAgICAgdGFyZ2V0RGlzcGxheU5hbWU6IGV2ZW50LmdldENvbnRlbnQoKS5kaXNwbGF5X25hbWUsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JIaXN0b3J5VmlzaWJpbGl0eUV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGV2ZW50LnNlbmRlciA/IGV2ZW50LnNlbmRlci5uYW1lIDogZXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgc3dpdGNoIChldmVudC5nZXRDb250ZW50KCkuaGlzdG9yeV92aXNpYmlsaXR5KSB7XG4gICAgICAgIGNhc2UgJ2ludml0ZWQnOlxuICAgICAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyBtYWRlIGZ1dHVyZSByb29tIGhpc3RvcnkgdmlzaWJsZSB0byBhbGwgcm9vbSBtZW1iZXJzLCAnXG4gICAgICAgICAgICAgICAgKyAnZnJvbSB0aGUgcG9pbnQgdGhleSBhcmUgaW52aXRlZC4nLCB7c2VuZGVyTmFtZX0pO1xuICAgICAgICBjYXNlICdqb2luZWQnOlxuICAgICAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyBtYWRlIGZ1dHVyZSByb29tIGhpc3RvcnkgdmlzaWJsZSB0byBhbGwgcm9vbSBtZW1iZXJzLCAnXG4gICAgICAgICAgICAgICAgKyAnZnJvbSB0aGUgcG9pbnQgdGhleSBqb2luZWQuJywge3NlbmRlck5hbWV9KTtcbiAgICAgICAgY2FzZSAnc2hhcmVkJzpcbiAgICAgICAgICAgIHJldHVybiBfdCgnJShzZW5kZXJOYW1lKXMgbWFkZSBmdXR1cmUgcm9vbSBoaXN0b3J5IHZpc2libGUgdG8gYWxsIHJvb20gbWVtYmVycy4nLCB7c2VuZGVyTmFtZX0pO1xuICAgICAgICBjYXNlICd3b3JsZF9yZWFkYWJsZSc6XG4gICAgICAgICAgICByZXR1cm4gX3QoJyUoc2VuZGVyTmFtZSlzIG1hZGUgZnV0dXJlIHJvb20gaGlzdG9yeSB2aXNpYmxlIHRvIGFueW9uZS4nLCB7c2VuZGVyTmFtZX0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIF90KCclKHNlbmRlck5hbWUpcyBtYWRlIGZ1dHVyZSByb29tIGhpc3RvcnkgdmlzaWJsZSB0byB1bmtub3duICglKHZpc2liaWxpdHkpcykuJywge1xuICAgICAgICAgICAgICAgIHNlbmRlck5hbWUsXG4gICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogZXZlbnQuZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eSxcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy8gQ3VycmVudGx5IHdpbGwgb25seSBkaXNwbGF5IGEgY2hhbmdlIGlmIGEgdXNlcidzIHBvd2VyIGxldmVsIGlzIGNoYW5nZWRcbmZ1bmN0aW9uIHRleHRGb3JQb3dlckV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3Qgc2VuZGVyTmFtZSA9IGV2ZW50LnNlbmRlciA/IGV2ZW50LnNlbmRlci5uYW1lIDogZXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgaWYgKCFldmVudC5nZXRQcmV2Q29udGVudCgpIHx8ICFldmVudC5nZXRQcmV2Q29udGVudCgpLnVzZXJzIHx8XG4gICAgICAgICFldmVudC5nZXRDb250ZW50KCkgfHwgIWV2ZW50LmdldENvbnRlbnQoKS51c2Vycykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNvbnN0IHVzZXJEZWZhdWx0ID0gZXZlbnQuZ2V0Q29udGVudCgpLnVzZXJzX2RlZmF1bHQgfHwgMDtcbiAgICAvLyBDb25zdHJ1Y3Qgc2V0IG9mIHVzZXJJZHNcbiAgICBjb25zdCB1c2VycyA9IFtdO1xuICAgIE9iamVjdC5rZXlzKGV2ZW50LmdldENvbnRlbnQoKS51c2VycykuZm9yRWFjaChcbiAgICAgICAgKHVzZXJJZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHVzZXJzLmluZGV4T2YodXNlcklkKSA9PT0gLTEpIHVzZXJzLnB1c2godXNlcklkKTtcbiAgICAgICAgfSxcbiAgICApO1xuICAgIE9iamVjdC5rZXlzKGV2ZW50LmdldFByZXZDb250ZW50KCkudXNlcnMpLmZvckVhY2goXG4gICAgICAgICh1c2VySWQpID0+IHtcbiAgICAgICAgICAgIGlmICh1c2Vycy5pbmRleE9mKHVzZXJJZCkgPT09IC0xKSB1c2Vycy5wdXNoKHVzZXJJZCk7XG4gICAgICAgIH0sXG4gICAgKTtcbiAgICBjb25zdCBkaWZmID0gW107XG4gICAgLy8gWFhYOiBUaGlzIGlzIGFsc28gc3VyZWx5IGJyb2tlbiBmb3IgaTE4blxuICAgIHVzZXJzLmZvckVhY2goKHVzZXJJZCkgPT4ge1xuICAgICAgICAvLyBQcmV2aW91cyBwb3dlciBsZXZlbFxuICAgICAgICBjb25zdCBmcm9tID0gZXZlbnQuZ2V0UHJldkNvbnRlbnQoKS51c2Vyc1t1c2VySWRdO1xuICAgICAgICAvLyBDdXJyZW50IHBvd2VyIGxldmVsXG4gICAgICAgIGNvbnN0IHRvID0gZXZlbnQuZ2V0Q29udGVudCgpLnVzZXJzW3VzZXJJZF07XG4gICAgICAgIGlmICh0byAhPT0gZnJvbSkge1xuICAgICAgICAgICAgZGlmZi5wdXNoKFxuICAgICAgICAgICAgICAgIF90KCclKHVzZXJJZClzIGZyb20gJShmcm9tUG93ZXJMZXZlbClzIHRvICUodG9Qb3dlckxldmVsKXMnLCB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZnJvbVBvd2VyTGV2ZWw6IFJvbGVzLnRleHR1YWxQb3dlckxldmVsKGZyb20sIHVzZXJEZWZhdWx0KSxcbiAgICAgICAgICAgICAgICAgICAgdG9Qb3dlckxldmVsOiBSb2xlcy50ZXh0dWFsUG93ZXJMZXZlbCh0bywgdXNlckRlZmF1bHQpLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghZGlmZi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gX3QoJyUoc2VuZGVyTmFtZSlzIGNoYW5nZWQgdGhlIHBvd2VyIGxldmVsIG9mICUocG93ZXJMZXZlbERpZmZUZXh0KXMuJywge1xuICAgICAgICBzZW5kZXJOYW1lLFxuICAgICAgICBwb3dlckxldmVsRGlmZlRleHQ6IGRpZmYuam9pbihcIiwgXCIpLFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yUGlubmVkRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXZlbnQuc2VuZGVyID8gZXZlbnQuc2VuZGVyLm5hbWUgOiBldmVudC5nZXRTZW5kZXIoKTtcbiAgICByZXR1cm4gX3QoXCIlKHNlbmRlck5hbWUpcyBjaGFuZ2VkIHRoZSBwaW5uZWQgbWVzc2FnZXMgZm9yIHRoZSByb29tLlwiLCB7c2VuZGVyTmFtZX0pO1xufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yV2lkZ2V0RXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgY29uc3Qge25hbWU6IHByZXZOYW1lLCB0eXBlOiBwcmV2VHlwZSwgdXJsOiBwcmV2VXJsfSA9IGV2ZW50LmdldFByZXZDb250ZW50KCk7XG4gICAgY29uc3Qge25hbWUsIHR5cGUsIHVybH0gPSBldmVudC5nZXRDb250ZW50KCkgfHwge307XG5cbiAgICBsZXQgd2lkZ2V0TmFtZSA9IG5hbWUgfHwgcHJldk5hbWUgfHwgdHlwZSB8fCBwcmV2VHlwZSB8fCAnJztcbiAgICAvLyBBcHBseSBzZW50ZW5jZSBjYXNlIHRvIHdpZGdldCBuYW1lXG4gICAgaWYgKHdpZGdldE5hbWUgJiYgd2lkZ2V0TmFtZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHdpZGdldE5hbWUgPSB3aWRnZXROYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyB3aWRnZXROYW1lLnNsaWNlKDEpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB3aWRnZXQgd2FzIHJlbW92ZWQsIGl0cyBjb250ZW50IHNob3VsZCBiZSB7fSwgYnV0IHRoaXMgaXMgc3VmZmljaWVudGx5XG4gICAgLy8gZXF1aXZhbGVudCB0byB0aGF0IGNvbmRpdGlvbi5cbiAgICBpZiAodXJsKSB7XG4gICAgICAgIGlmIChwcmV2VXJsKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJyUod2lkZ2V0TmFtZSlzIHdpZGdldCBtb2RpZmllZCBieSAlKHNlbmRlck5hbWUpcycsIHtcbiAgICAgICAgICAgICAgICB3aWRnZXROYW1lLCBzZW5kZXJOYW1lLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoJyUod2lkZ2V0TmFtZSlzIHdpZGdldCBhZGRlZCBieSAlKHNlbmRlck5hbWUpcycsIHtcbiAgICAgICAgICAgICAgICB3aWRnZXROYW1lLCBzZW5kZXJOYW1lLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX3QoJyUod2lkZ2V0TmFtZSlzIHdpZGdldCByZW1vdmVkIGJ5ICUoc2VuZGVyTmFtZSlzJywge1xuICAgICAgICAgICAgd2lkZ2V0TmFtZSwgc2VuZGVyTmFtZSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0ZXh0Rm9yV2lkZ2V0TGF5b3V0RXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXZlbnQuc2VuZGVyPy5uYW1lIHx8IGV2ZW50LmdldFNlbmRlcigpO1xuICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIGhhcyB1cGRhdGVkIHRoZSB3aWRnZXQgbGF5b3V0XCIsIHtzZW5kZXJOYW1lfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRGb3JNam9sbmlyRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCBzZW5kZXJOYW1lID0gZXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgY29uc3Qge2VudGl0eTogcHJldkVudGl0eX0gPSBldmVudC5nZXRQcmV2Q29udGVudCgpO1xuICAgIGNvbnN0IHtlbnRpdHksIHJlY29tbWVuZGF0aW9uLCByZWFzb259ID0gZXZlbnQuZ2V0Q29udGVudCgpO1xuXG4gICAgLy8gUnVsZSByZW1vdmVkXG4gICAgaWYgKCFlbnRpdHkpIHtcbiAgICAgICAgaWYgKFVTRVJfUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZSBydWxlIGJhbm5pbmcgdXNlcnMgbWF0Y2hpbmcgJShnbG9iKXNcIixcbiAgICAgICAgICAgICAgICB7c2VuZGVyTmFtZSwgZ2xvYjogcHJldkVudGl0eX0pO1xuICAgICAgICB9IGVsc2UgaWYgKFJPT01fUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKHNlbmRlck5hbWUpcyByZW1vdmVkIHRoZSBydWxlIGJhbm5pbmcgcm9vbXMgbWF0Y2hpbmcgJShnbG9iKXNcIixcbiAgICAgICAgICAgICAgICB7c2VuZGVyTmFtZSwgZ2xvYjogcHJldkVudGl0eX0pO1xuICAgICAgICB9IGVsc2UgaWYgKFNFUlZFUl9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIHJlbW92ZWQgdGhlIHJ1bGUgYmFubmluZyBzZXJ2ZXJzIG1hdGNoaW5nICUoZ2xvYilzXCIsXG4gICAgICAgICAgICAgICAge3NlbmRlck5hbWUsIGdsb2I6IHByZXZFbnRpdHl9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVua25vd24gdHlwZS4gV2UnbGwgc2F5IHNvbWV0aGluZywgYnV0IHdlIHNob3VsZG4ndCBlbmQgdXAgaGVyZS5cbiAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgcmVtb3ZlZCBhIGJhbiBydWxlIG1hdGNoaW5nICUoZ2xvYilzXCIsIHtzZW5kZXJOYW1lLCBnbG9iOiBwcmV2RW50aXR5fSk7XG4gICAgfVxuXG4gICAgLy8gSW52YWxpZCBydWxlXG4gICAgaWYgKCFyZWNvbW1lbmRhdGlvbiB8fCAhcmVhc29uKSByZXR1cm4gX3QoYCUoc2VuZGVyTmFtZSlzIHVwZGF0ZWQgYW4gaW52YWxpZCBiYW4gcnVsZWAsIHtzZW5kZXJOYW1lfSk7XG5cbiAgICAvLyBSdWxlIHVwZGF0ZWRcbiAgICBpZiAoZW50aXR5ID09PSBwcmV2RW50aXR5KSB7XG4gICAgICAgIGlmIChVU0VSX1JVTEVfVFlQRVMuaW5jbHVkZXMoZXZlbnQuZ2V0VHlwZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgdXBkYXRlZCB0aGUgcnVsZSBiYW5uaW5nIHVzZXJzIG1hdGNoaW5nICUoZ2xvYilzIGZvciAlKHJlYXNvbilzXCIsXG4gICAgICAgICAgICAgICAge3NlbmRlck5hbWUsIGdsb2I6IGVudGl0eSwgcmVhc29ufSk7XG4gICAgICAgIH0gZWxzZSBpZiAoUk9PTV9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIHVwZGF0ZWQgdGhlIHJ1bGUgYmFubmluZyByb29tcyBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAgICAgIHtzZW5kZXJOYW1lLCBnbG9iOiBlbnRpdHksIHJlYXNvbn0pO1xuICAgICAgICB9IGVsc2UgaWYgKFNFUlZFUl9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIHVwZGF0ZWQgdGhlIHJ1bGUgYmFubmluZyBzZXJ2ZXJzIG1hdGNoaW5nICUoZ2xvYilzIGZvciAlKHJlYXNvbilzXCIsXG4gICAgICAgICAgICAgICAge3NlbmRlck5hbWUsIGdsb2I6IGVudGl0eSwgcmVhc29ufSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVbmtub3duIHR5cGUuIFdlJ2xsIHNheSBzb21ldGhpbmcgYnV0IHdlIHNob3VsZG4ndCBlbmQgdXAgaGVyZS5cbiAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgdXBkYXRlZCBhIGJhbiBydWxlIG1hdGNoaW5nICUoZ2xvYilzIGZvciAlKHJlYXNvbilzXCIsXG4gICAgICAgICAgICB7c2VuZGVyTmFtZSwgZ2xvYjogZW50aXR5LCByZWFzb259KTtcbiAgICB9XG5cbiAgICAvLyBOZXcgcnVsZVxuICAgIGlmICghcHJldkVudGl0eSkge1xuICAgICAgICBpZiAoVVNFUl9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIGNyZWF0ZWQgYSBydWxlIGJhbm5pbmcgdXNlcnMgbWF0Y2hpbmcgJShnbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgICAgICB7c2VuZGVyTmFtZSwgZ2xvYjogZW50aXR5LCByZWFzb259KTtcbiAgICAgICAgfSBlbHNlIGlmIChST09NX1JVTEVfVFlQRVMuaW5jbHVkZXMoZXZlbnQuZ2V0VHlwZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgY3JlYXRlZCBhIHJ1bGUgYmFubmluZyByb29tcyBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAgICAgIHtzZW5kZXJOYW1lLCBnbG9iOiBlbnRpdHksIHJlYXNvbn0pO1xuICAgICAgICB9IGVsc2UgaWYgKFNFUlZFUl9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIGNyZWF0ZWQgYSBydWxlIGJhbm5pbmcgc2VydmVycyBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAgICAgIHtzZW5kZXJOYW1lLCBnbG9iOiBlbnRpdHksIHJlYXNvbn0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVW5rbm93biB0eXBlLiBXZSdsbCBzYXkgc29tZXRoaW5nIGJ1dCB3ZSBzaG91bGRuJ3QgZW5kIHVwIGhlcmUuXG4gICAgICAgIHJldHVybiBfdChcIiUoc2VuZGVyTmFtZSlzIGNyZWF0ZWQgYSBiYW4gcnVsZSBtYXRjaGluZyAlKGdsb2IpcyBmb3IgJShyZWFzb24pc1wiLFxuICAgICAgICAgICAge3NlbmRlck5hbWUsIGdsb2I6IGVudGl0eSwgcmVhc29ufSk7XG4gICAgfVxuXG4gICAgLy8gZWxzZSB0aGUgZW50aXR5ICE9PSBwcmV2RW50aXR5IC0gY291bnQgYXMgYSByZW1vdmFsICYgYWRkXG4gICAgaWYgKFVTRVJfUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgIHJldHVybiBfdChcbiAgICAgICAgICAgIFwiJShzZW5kZXJOYW1lKXMgY2hhbmdlZCBhIHJ1bGUgdGhhdCB3YXMgYmFubmluZyB1c2VycyBtYXRjaGluZyAlKG9sZEdsb2IpcyB0byBtYXRjaGluZyBcIiArXG4gICAgICAgICAgICBcIiUobmV3R2xvYilzIGZvciAlKHJlYXNvbilzXCIsXG4gICAgICAgICAgICB7c2VuZGVyTmFtZSwgb2xkR2xvYjogcHJldkVudGl0eSwgbmV3R2xvYjogZW50aXR5LCByZWFzb259LFxuICAgICAgICApO1xuICAgIH0gZWxzZSBpZiAoUk9PTV9SVUxFX1RZUEVTLmluY2x1ZGVzKGV2ZW50LmdldFR5cGUoKSkpIHtcbiAgICAgICAgcmV0dXJuIF90KFxuICAgICAgICAgICAgXCIlKHNlbmRlck5hbWUpcyBjaGFuZ2VkIGEgcnVsZSB0aGF0IHdhcyBiYW5uaW5nIHJvb21zIG1hdGNoaW5nICUob2xkR2xvYilzIHRvIG1hdGNoaW5nIFwiICtcbiAgICAgICAgICAgIFwiJShuZXdHbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgIHtzZW5kZXJOYW1lLCBvbGRHbG9iOiBwcmV2RW50aXR5LCBuZXdHbG9iOiBlbnRpdHksIHJlYXNvbn0sXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChTRVJWRVJfUlVMRV9UWVBFUy5pbmNsdWRlcyhldmVudC5nZXRUeXBlKCkpKSB7XG4gICAgICAgIHJldHVybiBfdChcbiAgICAgICAgICAgIFwiJShzZW5kZXJOYW1lKXMgY2hhbmdlZCBhIHJ1bGUgdGhhdCB3YXMgYmFubmluZyBzZXJ2ZXJzIG1hdGNoaW5nICUob2xkR2xvYilzIHRvIG1hdGNoaW5nIFwiICtcbiAgICAgICAgICAgIFwiJShuZXdHbG9iKXMgZm9yICUocmVhc29uKXNcIixcbiAgICAgICAgICAgIHtzZW5kZXJOYW1lLCBvbGRHbG9iOiBwcmV2RW50aXR5LCBuZXdHbG9iOiBlbnRpdHksIHJlYXNvbn0sXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gVW5rbm93biB0eXBlLiBXZSdsbCBzYXkgc29tZXRoaW5nIGJ1dCB3ZSBzaG91bGRuJ3QgZW5kIHVwIGhlcmUuXG4gICAgcmV0dXJuIF90KFwiJShzZW5kZXJOYW1lKXMgdXBkYXRlZCBhIGJhbiBydWxlIHRoYXQgd2FzIG1hdGNoaW5nICUob2xkR2xvYilzIHRvIG1hdGNoaW5nICUobmV3R2xvYilzIFwiICtcbiAgICAgICAgXCJmb3IgJShyZWFzb24pc1wiLCB7c2VuZGVyTmFtZSwgb2xkR2xvYjogcHJldkVudGl0eSwgbmV3R2xvYjogZW50aXR5LCByZWFzb259KTtcbn1cblxuY29uc3QgaGFuZGxlcnMgPSB7XG4gICAgJ20ucm9vbS5tZXNzYWdlJzogdGV4dEZvck1lc3NhZ2VFdmVudCxcbiAgICAnbS5jYWxsLmludml0ZSc6IHRleHRGb3JDYWxsSW52aXRlRXZlbnQsXG4gICAgJ20uY2FsbC5hbnN3ZXInOiB0ZXh0Rm9yQ2FsbEFuc3dlckV2ZW50LFxuICAgICdtLmNhbGwuaGFuZ3VwJzogdGV4dEZvckNhbGxIYW5ndXBFdmVudCxcbiAgICAnbS5jYWxsLnJlamVjdCc6IHRleHRGb3JDYWxsUmVqZWN0RXZlbnQsXG59O1xuXG5jb25zdCBzdGF0ZUhhbmRsZXJzID0ge1xuICAgICdtLnJvb20uY2Fub25pY2FsX2FsaWFzJzogdGV4dEZvckNhbm9uaWNhbEFsaWFzRXZlbnQsXG4gICAgJ20ucm9vbS5uYW1lJzogdGV4dEZvclJvb21OYW1lRXZlbnQsXG4gICAgJ20ucm9vbS50b3BpYyc6IHRleHRGb3JUb3BpY0V2ZW50LFxuICAgICdtLnJvb20ubWVtYmVyJzogdGV4dEZvck1lbWJlckV2ZW50LFxuICAgICdtLnJvb20udGhpcmRfcGFydHlfaW52aXRlJzogdGV4dEZvclRocmVlUGlkSW52aXRlRXZlbnQsXG4gICAgJ20ucm9vbS5oaXN0b3J5X3Zpc2liaWxpdHknOiB0ZXh0Rm9ySGlzdG9yeVZpc2liaWxpdHlFdmVudCxcbiAgICAnbS5yb29tLnBvd2VyX2xldmVscyc6IHRleHRGb3JQb3dlckV2ZW50LFxuICAgICdtLnJvb20ucGlubmVkX2V2ZW50cyc6IHRleHRGb3JQaW5uZWRFdmVudCxcbiAgICAnbS5yb29tLnNlcnZlcl9hY2wnOiB0ZXh0Rm9yU2VydmVyQUNMRXZlbnQsXG4gICAgJ20ucm9vbS50b21ic3RvbmUnOiB0ZXh0Rm9yVG9tYnN0b25lRXZlbnQsXG4gICAgJ20ucm9vbS5qb2luX3J1bGVzJzogdGV4dEZvckpvaW5SdWxlc0V2ZW50LFxuICAgICdtLnJvb20uZ3Vlc3RfYWNjZXNzJzogdGV4dEZvckd1ZXN0QWNjZXNzRXZlbnQsXG4gICAgJ20ucm9vbS5yZWxhdGVkX2dyb3Vwcyc6IHRleHRGb3JSZWxhdGVkR3JvdXBzRXZlbnQsXG5cbiAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnOiB0ZXh0Rm9yV2lkZ2V0RXZlbnQsXG4gICAgW1dJREdFVF9MQVlPVVRfRVZFTlRfVFlQRV06IHRleHRGb3JXaWRnZXRMYXlvdXRFdmVudCxcbn07XG5cbi8vIEFkZCBhbGwgdGhlIE1qb2xuaXIgc3R1ZmYgdG8gdGhlIHJlbmRlcmVyXG5mb3IgKGNvbnN0IGV2VHlwZSBvZiBBTExfUlVMRV9UWVBFUykge1xuICAgIHN0YXRlSGFuZGxlcnNbZXZUeXBlXSA9IHRleHRGb3JNam9sbmlyRXZlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0Rm9yRXZlbnQoZXYpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gKGV2LmlzU3RhdGUoKSA/IHN0YXRlSGFuZGxlcnMgOiBoYW5kbGVycylbZXYuZ2V0VHlwZSgpXTtcbiAgICBpZiAoaGFuZGxlcikgcmV0dXJuIGhhbmRsZXIoZXYpO1xuICAgIHJldHVybiAnJztcbn1cbiJdfQ==