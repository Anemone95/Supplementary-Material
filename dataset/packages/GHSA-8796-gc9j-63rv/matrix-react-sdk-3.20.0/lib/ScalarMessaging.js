"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startListening = startListening;
exports.stopListening = stopListening;
exports.setOpenManagerUrl = setOpenManagerUrl;

var _MatrixClientPeg = require("./MatrixClientPeg");

var _event = require("matrix-js-sdk/src/models/event");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _RoomViewStore = _interopRequireDefault(require("./stores/RoomViewStore"));

var _languageHandler = require("./languageHandler");

var _IntegrationManagers = require("./integrations/IntegrationManagers");

var _WidgetType = require("./widgets/WidgetType");

var _objects = require("./utils/objects");

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd

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
// TODO: Generify the name of this and all components within - it's not just for scalar.

/*
Listens for incoming postMessage requests from the integrations UI URL. The following API is exposed:
{
    action: "invite" | "membership_state" | "bot_options" | "set_bot_options" | etc... ,
    room_id: $ROOM_ID,
    user_id: $USER_ID
    // additional request fields
}

The complete request object is returned to the caller with an additional "response" key like so:
{
    action: "invite" | "membership_state" | "bot_options" | "set_bot_options",
    room_id: $ROOM_ID,
    user_id: $USER_ID,
    // additional request fields
    response: { ... }
}

The "action" determines the format of the request and response. All actions can return an error response.
An error response is a "response" object which consists of a sole "error" key to indicate an error.
They look like:
{
    error: {
        message: "Unable to invite user into room.",
        _error: <Original Error Object>
    }
}
The "message" key should be a human-friendly string.

ACTIONS
=======
All actions can return an error response instead of the response outlined below.

invite
------
Invites a user into a room.

Request:
 - room_id is the room to invite the user into.
 - user_id is the user ID to invite.
 - No additional fields.
Response:
{
    success: true
}
Example:
{
    action: "invite",
    room_id: "!foo:bar",
    user_id: "@invitee:bar",
    response: {
        success: true
    }
}

set_bot_options
---------------
Set the m.room.bot.options state event for a bot user.

Request:
 - room_id is the room to send the state event into.
 - user_id is the user ID of the bot who you're setting options for.
 - "content" is an object consisting of the content you wish to set.
Response:
{
    success: true
}
Example:
{
    action: "set_bot_options",
    room_id: "!foo:bar",
    user_id: "@bot:bar",
    content: {
        default_option: "alpha"
    },
    response: {
        success: true
    }
}

get_membership_count
--------------------
Get the number of joined users in the room.

Request:
 - room_id is the room to get the count in.
Response:
78
Example:
{
    action: "get_membership_count",
    room_id: "!foo:bar",
    response: 78
}

can_send_event
--------------
Check if the client can send the given event into the given room. If the client
is unable to do this, an error response is returned instead of 'response: false'.

Request:
 - room_id is the room to do the check in.
 - event_type is the event type which will be sent.
 - is_state is true if the event to be sent is a state event.
Response:
true
Example:
{
    action: "can_send_event",
    is_state: false,
    event_type: "m.room.message",
    room_id: "!foo:bar",
    response: true
}

set_widget
----------
Set a new widget in the room. Clobbers based on the ID.

Request:
 - `room_id` (String) is the room to set the widget in.
 - `widget_id` (String) is the ID of the widget to add (or replace if it already exists).
   It can be an arbitrary UTF8 string and is purely for distinguishing between widgets.
 - `url` (String) is the URL that clients should load in an iframe to run the widget.
   All widgets must have a valid URL. If the URL is `null` (not `undefined`), the
   widget will be removed from the room.
 - `type` (String) is the type of widget, which is provided as a hint for matrix clients so they
   can configure/lay out the widget in different ways. All widgets must have a type.
 - `name` (String) is an optional human-readable string about the widget.
 - `data` (Object) is some optional data about the widget, and can contain arbitrary key/value pairs.
Response:
{
    success: true
}
Example:
{
    action: "set_widget",
    room_id: "!foo:bar",
    widget_id: "abc123",
    url: "http://widget.url",
    type: "example",
    response: {
        success: true
    }
}

get_widgets
-----------
Get a list of all widgets in the room. The response is an array
of state events.

Request:
 - `room_id` (String) is the room to get the widgets in.
Response:
[
    {
        // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
        type: "im.vector.modular.widgets",
        state_key: "wid1",
        content: {
            type: "grafana",
            url: "https://grafanaurl",
            name: "dashboard",
            data: {key: "val"}
        }
        room_id: “!foo:bar”,
        sender: "@alice:localhost"
    }
]
Example:
{
    action: "get_widgets",
    room_id: "!foo:bar",
    response: [
        {
            // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
            type: "im.vector.modular.widgets",
            state_key: "wid1",
            content: {
                type: "grafana",
                url: "https://grafanaurl",
                name: "dashboard",
                data: {key: "val"}
            }
            room_id: “!foo:bar”,
            sender: "@alice:localhost"
        }
    ]
}


membership_state AND bot_options
--------------------------------
Get the content of the "m.room.member" or "m.room.bot.options" state event respectively.

NB: Whilst this API is basically equivalent to getStateEvent, we specifically do not
    want external entities to be able to query any state event for any room, hence the
    restrictive API outlined here.

Request:
 - room_id is the room which has the state event.
 - user_id is the state_key parameter which in both cases is a user ID (the member or the bot).
 - No additional fields.
Response:
 - The event content. If there is no state event, the "response" key should be null.
Example:
{
    action: "membership_state",
    room_id: "!foo:bar",
    user_id: "@somemember:bar",
    response: {
        membership: "join",
        displayname: "Bob",
        avatar_url: null
    }
}
*/
function sendResponse(event, res) {
  const data = (0, _objects.objectClone)(event.data);
  data.response = res;
  event.source.postMessage(data, event.origin);
}

function sendError(event, msg, nestedError) {
  console.error("Action:" + event.data.action + " failed with message: " + msg);
  const data = (0, _objects.objectClone)(event.data);
  data.response = {
    error: {
      message: msg
    }
  };

  if (nestedError) {
    data.response.error._error = nestedError;
  }

  event.source.postMessage(data, event.origin);
}

function inviteUser(event, roomId, userId) {
  console.log(`Received request to invite ${userId} into room ${roomId}`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (room) {
    // if they are already invited we can resolve immediately.
    const member = room.getMember(userId);

    if (member && member.membership === "invite") {
      sendResponse(event, {
        success: true
      });
      return;
    }
  }

  client.invite(roomId, userId).then(function () {
    sendResponse(event, {
      success: true
    });
  }, function (err) {
    sendError(event, (0, _languageHandler._t)('You need to be able to invite users to do that.'), err);
  });
}

function setWidget(event, roomId) {
  const widgetId = event.data.widget_id;
  let widgetType = event.data.type;
  const widgetUrl = event.data.url;
  const widgetName = event.data.name; // optional

  const widgetData = event.data.data; // optional

  const userWidget = event.data.userWidget; // both adding/removing widgets need these checks

  if (!widgetId || widgetUrl === undefined) {
    sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Missing required widget fields."));
    return;
  }

  if (widgetUrl !== null) {
    // if url is null it is being deleted, don't need to check name/type/etc
    // check types of fields
    if (widgetName !== undefined && typeof widgetName !== 'string') {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Optional field 'name' must be a string."));
      return;
    }

    if (widgetData !== undefined && !(widgetData instanceof Object)) {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Optional field 'data' must be an Object."));
      return;
    }

    if (typeof widgetType !== 'string') {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Field 'type' must be a string."));
      return;
    }

    if (typeof widgetUrl !== 'string') {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Field 'url' must be a string or null."));
      return;
    }
  } // convert the widget type to a known widget type


  widgetType = _WidgetType.WidgetType.fromString(widgetType);

  if (userWidget) {
    _WidgetUtils.default.setUserWidget(widgetId, widgetType, widgetUrl, widgetName, widgetData).then(() => {
      sendResponse(event, {
        success: true
      });

      _dispatcher.default.dispatch({
        action: "user_widget_updated"
      });
    }).catch(e => {
      sendError(event, (0, _languageHandler._t)('Unable to create widget.'), e);
    });
  } else {
    // Room widget
    if (!roomId) {
      sendError(event, (0, _languageHandler._t)('Missing roomId.'), null);
    }

    _WidgetUtils.default.setRoomWidget(roomId, widgetId, widgetType, widgetUrl, widgetName, widgetData).then(() => {
      sendResponse(event, {
        success: true
      });
    }, err => {
      sendError(event, (0, _languageHandler._t)('Failed to send request.'), err);
    });
  }
}

function getWidgets(event, roomId) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  let widgetStateEvents = [];

  if (roomId) {
    const room = client.getRoom(roomId);

    if (!room) {
      sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
      return;
    } // XXX: This gets the raw event object (I think because we can't
    // send the MatrixEvent over postMessage?)


    widgetStateEvents = _WidgetUtils.default.getRoomWidgets(room).map(ev => ev.event);
  } // Add user widgets (not linked to a specific room)


  const userWidgets = _WidgetUtils.default.getUserWidgetsArray();

  widgetStateEvents = widgetStateEvents.concat(userWidgets);
  sendResponse(event, widgetStateEvents);
}

function getRoomEncState(event, roomId) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  const roomIsEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId);

  sendResponse(event, roomIsEncrypted);
}

function setPlumbingState(event, roomId, status) {
  if (typeof status !== 'string') {
    throw new Error('Plumbing state status should be a string');
  }

  console.log(`Received request to set plumbing state to status "${status}" in room ${roomId}`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  client.sendStateEvent(roomId, "m.room.plumbing", {
    status: status
  }).then(() => {
    sendResponse(event, {
      success: true
    });
  }, err => {
    sendError(event, err.message ? err.message : (0, _languageHandler._t)('Failed to send request.'), err);
  });
}

function setBotOptions(event, roomId, userId) {
  console.log(`Received request to set options for bot ${userId} in room ${roomId}`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  client.sendStateEvent(roomId, "m.room.bot.options", event.data.content, "_" + userId).then(() => {
    sendResponse(event, {
      success: true
    });
  }, err => {
    sendError(event, err.message ? err.message : (0, _languageHandler._t)('Failed to send request.'), err);
  });
}

function setBotPower(event, roomId, userId, level) {
  if (!(Number.isInteger(level) && level >= 0)) {
    sendError(event, (0, _languageHandler._t)('Power level must be positive integer.'));
    return;
  }

  console.log(`Received request to set power level to ${level} for bot ${userId} in room ${roomId}.`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  client.getStateEvent(roomId, "m.room.power_levels", "").then(powerLevels => {
    const powerEvent = new _event.MatrixEvent({
      type: "m.room.power_levels",
      content: powerLevels
    });
    client.setPowerLevel(roomId, userId, level, powerEvent).then(() => {
      sendResponse(event, {
        success: true
      });
    }, err => {
      sendError(event, err.message ? err.message : (0, _languageHandler._t)('Failed to send request.'), err);
    });
  });
}

function getMembershipState(event, roomId, userId) {
  console.log(`membership_state of ${userId} in room ${roomId} requested.`);
  returnStateEvent(event, roomId, "m.room.member", userId);
}

function getJoinRules(event, roomId) {
  console.log(`join_rules of ${roomId} requested.`);
  returnStateEvent(event, roomId, "m.room.join_rules", "");
}

function botOptions(event, roomId, userId) {
  console.log(`bot_options of ${userId} in room ${roomId} requested.`);
  returnStateEvent(event, roomId, "m.room.bot.options", "_" + userId);
}

function getMembershipCount(event, roomId) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  const count = room.getJoinedMemberCount();
  sendResponse(event, count);
}

function canSendEvent(event, roomId) {
  const evType = "" + event.data.event_type; // force stringify

  const isState = Boolean(event.data.is_state);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  if (room.getMyMembership() !== "join") {
    sendError(event, (0, _languageHandler._t)('You are not in this room.'));
    return;
  }

  const me = client.credentials.userId;
  let canSend = false;

  if (isState) {
    canSend = room.currentState.maySendStateEvent(evType, me);
  } else {
    canSend = room.currentState.maySendEvent(evType, me);
  }

  if (!canSend) {
    sendError(event, (0, _languageHandler._t)('You do not have permission to do that in this room.'));
    return;
  }

  sendResponse(event, true);
}

function returnStateEvent(event, roomId, eventType, stateKey) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  const stateEvent = room.currentState.getStateEvents(eventType, stateKey);

  if (!stateEvent) {
    sendResponse(event, null);
    return;
  }

  sendResponse(event, stateEvent.getContent());
}

const onMessage = function (event) {
  if (!event.origin) {
    // stupid chrome
    event.origin = event.originalEvent.origin;
  } // Check that the integrations UI URL starts with the origin of the event
  // This means the URL could contain a path (like /develop) and still be used
  // to validate event origins, which do not specify paths.
  // (See https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)


  let configUrl;

  try {
    if (!openManagerUrl) openManagerUrl = _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().uiUrl;
    configUrl = new URL(openManagerUrl);
  } catch (e) {
    // No integrations UI URL, ignore silently.
    return;
  }

  let eventOriginUrl;

  try {
    eventOriginUrl = new URL(event.origin);
  } catch (e) {
    return;
  } // TODO -- Scalar postMessage API should be namespaced with event.data.api field
  // Fix following "if" statement to respond only to specific API messages.


  if (configUrl.origin !== eventOriginUrl.origin || !event.data.action || event.data.api // Ignore messages with specific API set
  ) {
      // don't log this - debugging APIs and browser add-ons like to spam
      // postMessage which floods the log otherwise
      return;
    }

  if (event.data.action === "close_scalar") {
    _dispatcher.default.dispatch({
      action: "close_scalar"
    });

    sendResponse(event, null);
    return;
  }

  const roomId = event.data.room_id;
  const userId = event.data.user_id;

  if (!roomId) {
    // These APIs don't require roomId
    // Get and set user widgets (not associated with a specific room)
    // If roomId is specified, it must be validated, so room-based widgets agreed
    // handled further down.
    if (event.data.action === "get_widgets") {
      getWidgets(event, null);
      return;
    } else if (event.data.action === "set_widget") {
      setWidget(event, null);
      return;
    } else {
      sendError(event, (0, _languageHandler._t)('Missing room_id in request'));
      return;
    }
  }

  if (roomId !== _RoomViewStore.default.getRoomId()) {
    sendError(event, (0, _languageHandler._t)('Room %(roomId)s not visible', {
      roomId: roomId
    }));
    return;
  } // Get and set room-based widgets


  if (event.data.action === "get_widgets") {
    getWidgets(event, roomId);
    return;
  } else if (event.data.action === "set_widget") {
    setWidget(event, roomId);
    return;
  } // These APIs don't require userId


  if (event.data.action === "join_rules_state") {
    getJoinRules(event, roomId);
    return;
  } else if (event.data.action === "set_plumbing_state") {
    setPlumbingState(event, roomId, event.data.status);
    return;
  } else if (event.data.action === "get_membership_count") {
    getMembershipCount(event, roomId);
    return;
  } else if (event.data.action === "get_room_enc_state") {
    getRoomEncState(event, roomId);
    return;
  } else if (event.data.action === "can_send_event") {
    canSendEvent(event, roomId);
    return;
  }

  if (!userId) {
    sendError(event, (0, _languageHandler._t)('Missing user_id in request'));
    return;
  }

  switch (event.data.action) {
    case "membership_state":
      getMembershipState(event, roomId, userId);
      break;

    case "invite":
      inviteUser(event, roomId, userId);
      break;

    case "bot_options":
      botOptions(event, roomId, userId);
      break;

    case "set_bot_options":
      setBotOptions(event, roomId, userId);
      break;

    case "set_bot_power":
      setBotPower(event, roomId, userId, event.data.level);
      break;

    default:
      console.warn("Unhandled postMessage event with action '" + event.data.action + "'");
      break;
  }
};

let listenerCount = 0;
let openManagerUrl = null;

function startListening() {
  if (listenerCount === 0) {
    window.addEventListener("message", onMessage, false);
  }

  listenerCount += 1;
}

function stopListening() {
  listenerCount -= 1;

  if (listenerCount === 0) {
    window.removeEventListener("message", onMessage);
  }

  if (listenerCount < 0) {
    // Make an error so we get a stack trace
    const e = new Error("ScalarMessaging: mismatched startListening / stopListening detected." + " Negative count");
    console.error(e);
  }
}

function setOpenManagerUrl(url) {
  openManagerUrl = url;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TY2FsYXJNZXNzYWdpbmcuanMiXSwibmFtZXMiOlsic2VuZFJlc3BvbnNlIiwiZXZlbnQiLCJyZXMiLCJkYXRhIiwicmVzcG9uc2UiLCJzb3VyY2UiLCJwb3N0TWVzc2FnZSIsIm9yaWdpbiIsInNlbmRFcnJvciIsIm1zZyIsIm5lc3RlZEVycm9yIiwiY29uc29sZSIsImVycm9yIiwiYWN0aW9uIiwibWVzc2FnZSIsIl9lcnJvciIsImludml0ZVVzZXIiLCJyb29tSWQiLCJ1c2VySWQiLCJsb2ciLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyb29tIiwiZ2V0Um9vbSIsIm1lbWJlciIsImdldE1lbWJlciIsIm1lbWJlcnNoaXAiLCJzdWNjZXNzIiwiaW52aXRlIiwidGhlbiIsImVyciIsInNldFdpZGdldCIsIndpZGdldElkIiwid2lkZ2V0X2lkIiwid2lkZ2V0VHlwZSIsInR5cGUiLCJ3aWRnZXRVcmwiLCJ1cmwiLCJ3aWRnZXROYW1lIiwibmFtZSIsIndpZGdldERhdGEiLCJ1c2VyV2lkZ2V0IiwidW5kZWZpbmVkIiwiRXJyb3IiLCJPYmplY3QiLCJXaWRnZXRUeXBlIiwiZnJvbVN0cmluZyIsIldpZGdldFV0aWxzIiwic2V0VXNlcldpZGdldCIsImRpcyIsImRpc3BhdGNoIiwiY2F0Y2giLCJlIiwic2V0Um9vbVdpZGdldCIsImdldFdpZGdldHMiLCJ3aWRnZXRTdGF0ZUV2ZW50cyIsImdldFJvb21XaWRnZXRzIiwibWFwIiwiZXYiLCJ1c2VyV2lkZ2V0cyIsImdldFVzZXJXaWRnZXRzQXJyYXkiLCJjb25jYXQiLCJnZXRSb29tRW5jU3RhdGUiLCJyb29tSXNFbmNyeXB0ZWQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJzZXRQbHVtYmluZ1N0YXRlIiwic3RhdHVzIiwic2VuZFN0YXRlRXZlbnQiLCJzZXRCb3RPcHRpb25zIiwiY29udGVudCIsInNldEJvdFBvd2VyIiwibGV2ZWwiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJnZXRTdGF0ZUV2ZW50IiwicG93ZXJMZXZlbHMiLCJwb3dlckV2ZW50IiwiTWF0cml4RXZlbnQiLCJzZXRQb3dlckxldmVsIiwiZ2V0TWVtYmVyc2hpcFN0YXRlIiwicmV0dXJuU3RhdGVFdmVudCIsImdldEpvaW5SdWxlcyIsImJvdE9wdGlvbnMiLCJnZXRNZW1iZXJzaGlwQ291bnQiLCJjb3VudCIsImdldEpvaW5lZE1lbWJlckNvdW50IiwiY2FuU2VuZEV2ZW50IiwiZXZUeXBlIiwiZXZlbnRfdHlwZSIsImlzU3RhdGUiLCJCb29sZWFuIiwiaXNfc3RhdGUiLCJnZXRNeU1lbWJlcnNoaXAiLCJtZSIsImNyZWRlbnRpYWxzIiwiY2FuU2VuZCIsImN1cnJlbnRTdGF0ZSIsIm1heVNlbmRTdGF0ZUV2ZW50IiwibWF5U2VuZEV2ZW50IiwiZXZlbnRUeXBlIiwic3RhdGVLZXkiLCJzdGF0ZUV2ZW50IiwiZ2V0U3RhdGVFdmVudHMiLCJnZXRDb250ZW50Iiwib25NZXNzYWdlIiwib3JpZ2luYWxFdmVudCIsImNvbmZpZ1VybCIsIm9wZW5NYW5hZ2VyVXJsIiwiSW50ZWdyYXRpb25NYW5hZ2VycyIsInNoYXJlZEluc3RhbmNlIiwiZ2V0UHJpbWFyeU1hbmFnZXIiLCJ1aVVybCIsIlVSTCIsImV2ZW50T3JpZ2luVXJsIiwiYXBpIiwicm9vbV9pZCIsInVzZXJfaWQiLCJSb29tVmlld1N0b3JlIiwiZ2V0Um9vbUlkIiwid2FybiIsImxpc3RlbmVyQ291bnQiLCJzdGFydExpc3RlbmluZyIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJzdG9wTGlzdGVuaW5nIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInNldE9wZW5NYW5hZ2VyVXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQThPQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF0UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFNcEUsQ0FBQyxHQUFHLElBQUlULEtBQUosQ0FDTix5RUFDQSxpQkFGTSxDQUFWO0FBSUFqQyxJQUFBQSxPQUFPLENBQUNDLEtBQVIsQ0FBY3lDLENBQWQ7QUFDSDtBQUNKOztBQUVNLFNBQVMwRSxpQkFBVCxDQUEyQnpGLEdBQTNCLEVBQWdDO0FBQ25Dc0UsRUFBQUEsY0FBYyxHQUFHdEUsR0FBakI7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gVE9ETzogR2VuZXJpZnkgdGhlIG5hbWUgb2YgdGhpcyBhbmQgYWxsIGNvbXBvbmVudHMgd2l0aGluIC0gaXQncyBub3QganVzdCBmb3Igc2NhbGFyLlxuXG4vKlxuTGlzdGVucyBmb3IgaW5jb21pbmcgcG9zdE1lc3NhZ2UgcmVxdWVzdHMgZnJvbSB0aGUgaW50ZWdyYXRpb25zIFVJIFVSTC4gVGhlIGZvbGxvd2luZyBBUEkgaXMgZXhwb3NlZDpcbntcbiAgICBhY3Rpb246IFwiaW52aXRlXCIgfCBcIm1lbWJlcnNoaXBfc3RhdGVcIiB8IFwiYm90X29wdGlvbnNcIiB8IFwic2V0X2JvdF9vcHRpb25zXCIgfCBldGMuLi4gLFxuICAgIHJvb21faWQ6ICRST09NX0lELFxuICAgIHVzZXJfaWQ6ICRVU0VSX0lEXG4gICAgLy8gYWRkaXRpb25hbCByZXF1ZXN0IGZpZWxkc1xufVxuXG5UaGUgY29tcGxldGUgcmVxdWVzdCBvYmplY3QgaXMgcmV0dXJuZWQgdG8gdGhlIGNhbGxlciB3aXRoIGFuIGFkZGl0aW9uYWwgXCJyZXNwb25zZVwiIGtleSBsaWtlIHNvOlxue1xuICAgIGFjdGlvbjogXCJpbnZpdGVcIiB8IFwibWVtYmVyc2hpcF9zdGF0ZVwiIHwgXCJib3Rfb3B0aW9uc1wiIHwgXCJzZXRfYm90X29wdGlvbnNcIixcbiAgICByb29tX2lkOiAkUk9PTV9JRCxcbiAgICB1c2VyX2lkOiAkVVNFUl9JRCxcbiAgICAvLyBhZGRpdGlvbmFsIHJlcXVlc3QgZmllbGRzXG4gICAgcmVzcG9uc2U6IHsgLi4uIH1cbn1cblxuVGhlIFwiYWN0aW9uXCIgZGV0ZXJtaW5lcyB0aGUgZm9ybWF0IG9mIHRoZSByZXF1ZXN0IGFuZCByZXNwb25zZS4gQWxsIGFjdGlvbnMgY2FuIHJldHVybiBhbiBlcnJvciByZXNwb25zZS5cbkFuIGVycm9yIHJlc3BvbnNlIGlzIGEgXCJyZXNwb25zZVwiIG9iamVjdCB3aGljaCBjb25zaXN0cyBvZiBhIHNvbGUgXCJlcnJvclwiIGtleSB0byBpbmRpY2F0ZSBhbiBlcnJvci5cblRoZXkgbG9vayBsaWtlOlxue1xuICAgIGVycm9yOiB7XG4gICAgICAgIG1lc3NhZ2U6IFwiVW5hYmxlIHRvIGludml0ZSB1c2VyIGludG8gcm9vbS5cIixcbiAgICAgICAgX2Vycm9yOiA8T3JpZ2luYWwgRXJyb3IgT2JqZWN0PlxuICAgIH1cbn1cblRoZSBcIm1lc3NhZ2VcIiBrZXkgc2hvdWxkIGJlIGEgaHVtYW4tZnJpZW5kbHkgc3RyaW5nLlxuXG5BQ1RJT05TXG49PT09PT09XG5BbGwgYWN0aW9ucyBjYW4gcmV0dXJuIGFuIGVycm9yIHJlc3BvbnNlIGluc3RlYWQgb2YgdGhlIHJlc3BvbnNlIG91dGxpbmVkIGJlbG93LlxuXG5pbnZpdGVcbi0tLS0tLVxuSW52aXRlcyBhIHVzZXIgaW50byBhIHJvb20uXG5cblJlcXVlc3Q6XG4gLSByb29tX2lkIGlzIHRoZSByb29tIHRvIGludml0ZSB0aGUgdXNlciBpbnRvLlxuIC0gdXNlcl9pZCBpcyB0aGUgdXNlciBJRCB0byBpbnZpdGUuXG4gLSBObyBhZGRpdGlvbmFsIGZpZWxkcy5cblJlc3BvbnNlOlxue1xuICAgIHN1Y2Nlc3M6IHRydWVcbn1cbkV4YW1wbGU6XG57XG4gICAgYWN0aW9uOiBcImludml0ZVwiLFxuICAgIHJvb21faWQ6IFwiIWZvbzpiYXJcIixcbiAgICB1c2VyX2lkOiBcIkBpbnZpdGVlOmJhclwiLFxuICAgIHJlc3BvbnNlOiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWVcbiAgICB9XG59XG5cbnNldF9ib3Rfb3B0aW9uc1xuLS0tLS0tLS0tLS0tLS0tXG5TZXQgdGhlIG0ucm9vbS5ib3Qub3B0aW9ucyBzdGF0ZSBldmVudCBmb3IgYSBib3QgdXNlci5cblxuUmVxdWVzdDpcbiAtIHJvb21faWQgaXMgdGhlIHJvb20gdG8gc2VuZCB0aGUgc3RhdGUgZXZlbnQgaW50by5cbiAtIHVzZXJfaWQgaXMgdGhlIHVzZXIgSUQgb2YgdGhlIGJvdCB3aG8geW91J3JlIHNldHRpbmcgb3B0aW9ucyBmb3IuXG4gLSBcImNvbnRlbnRcIiBpcyBhbiBvYmplY3QgY29uc2lzdGluZyBvZiB0aGUgY29udGVudCB5b3Ugd2lzaCB0byBzZXQuXG5SZXNwb25zZTpcbntcbiAgICBzdWNjZXNzOiB0cnVlXG59XG5FeGFtcGxlOlxue1xuICAgIGFjdGlvbjogXCJzZXRfYm90X29wdGlvbnNcIixcbiAgICByb29tX2lkOiBcIiFmb286YmFyXCIsXG4gICAgdXNlcl9pZDogXCJAYm90OmJhclwiLFxuICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgZGVmYXVsdF9vcHRpb246IFwiYWxwaGFcIlxuICAgIH0sXG4gICAgcmVzcG9uc2U6IHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgIH1cbn1cblxuZ2V0X21lbWJlcnNoaXBfY291bnRcbi0tLS0tLS0tLS0tLS0tLS0tLS0tXG5HZXQgdGhlIG51bWJlciBvZiBqb2luZWQgdXNlcnMgaW4gdGhlIHJvb20uXG5cblJlcXVlc3Q6XG4gLSByb29tX2lkIGlzIHRoZSByb29tIHRvIGdldCB0aGUgY291bnQgaW4uXG5SZXNwb25zZTpcbjc4XG5FeGFtcGxlOlxue1xuICAgIGFjdGlvbjogXCJnZXRfbWVtYmVyc2hpcF9jb3VudFwiLFxuICAgIHJvb21faWQ6IFwiIWZvbzpiYXJcIixcbiAgICByZXNwb25zZTogNzhcbn1cblxuY2FuX3NlbmRfZXZlbnRcbi0tLS0tLS0tLS0tLS0tXG5DaGVjayBpZiB0aGUgY2xpZW50IGNhbiBzZW5kIHRoZSBnaXZlbiBldmVudCBpbnRvIHRoZSBnaXZlbiByb29tLiBJZiB0aGUgY2xpZW50XG5pcyB1bmFibGUgdG8gZG8gdGhpcywgYW4gZXJyb3IgcmVzcG9uc2UgaXMgcmV0dXJuZWQgaW5zdGVhZCBvZiAncmVzcG9uc2U6IGZhbHNlJy5cblxuUmVxdWVzdDpcbiAtIHJvb21faWQgaXMgdGhlIHJvb20gdG8gZG8gdGhlIGNoZWNrIGluLlxuIC0gZXZlbnRfdHlwZSBpcyB0aGUgZXZlbnQgdHlwZSB3aGljaCB3aWxsIGJlIHNlbnQuXG4gLSBpc19zdGF0ZSBpcyB0cnVlIGlmIHRoZSBldmVudCB0byBiZSBzZW50IGlzIGEgc3RhdGUgZXZlbnQuXG5SZXNwb25zZTpcbnRydWVcbkV4YW1wbGU6XG57XG4gICAgYWN0aW9uOiBcImNhbl9zZW5kX2V2ZW50XCIsXG4gICAgaXNfc3RhdGU6IGZhbHNlLFxuICAgIGV2ZW50X3R5cGU6IFwibS5yb29tLm1lc3NhZ2VcIixcbiAgICByb29tX2lkOiBcIiFmb286YmFyXCIsXG4gICAgcmVzcG9uc2U6IHRydWVcbn1cblxuc2V0X3dpZGdldFxuLS0tLS0tLS0tLVxuU2V0IGEgbmV3IHdpZGdldCBpbiB0aGUgcm9vbS4gQ2xvYmJlcnMgYmFzZWQgb24gdGhlIElELlxuXG5SZXF1ZXN0OlxuIC0gYHJvb21faWRgIChTdHJpbmcpIGlzIHRoZSByb29tIHRvIHNldCB0aGUgd2lkZ2V0IGluLlxuIC0gYHdpZGdldF9pZGAgKFN0cmluZykgaXMgdGhlIElEIG9mIHRoZSB3aWRnZXQgdG8gYWRkIChvciByZXBsYWNlIGlmIGl0IGFscmVhZHkgZXhpc3RzKS5cbiAgIEl0IGNhbiBiZSBhbiBhcmJpdHJhcnkgVVRGOCBzdHJpbmcgYW5kIGlzIHB1cmVseSBmb3IgZGlzdGluZ3Vpc2hpbmcgYmV0d2VlbiB3aWRnZXRzLlxuIC0gYHVybGAgKFN0cmluZykgaXMgdGhlIFVSTCB0aGF0IGNsaWVudHMgc2hvdWxkIGxvYWQgaW4gYW4gaWZyYW1lIHRvIHJ1biB0aGUgd2lkZ2V0LlxuICAgQWxsIHdpZGdldHMgbXVzdCBoYXZlIGEgdmFsaWQgVVJMLiBJZiB0aGUgVVJMIGlzIGBudWxsYCAobm90IGB1bmRlZmluZWRgKSwgdGhlXG4gICB3aWRnZXQgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIHJvb20uXG4gLSBgdHlwZWAgKFN0cmluZykgaXMgdGhlIHR5cGUgb2Ygd2lkZ2V0LCB3aGljaCBpcyBwcm92aWRlZCBhcyBhIGhpbnQgZm9yIG1hdHJpeCBjbGllbnRzIHNvIHRoZXlcbiAgIGNhbiBjb25maWd1cmUvbGF5IG91dCB0aGUgd2lkZ2V0IGluIGRpZmZlcmVudCB3YXlzLiBBbGwgd2lkZ2V0cyBtdXN0IGhhdmUgYSB0eXBlLlxuIC0gYG5hbWVgIChTdHJpbmcpIGlzIGFuIG9wdGlvbmFsIGh1bWFuLXJlYWRhYmxlIHN0cmluZyBhYm91dCB0aGUgd2lkZ2V0LlxuIC0gYGRhdGFgIChPYmplY3QpIGlzIHNvbWUgb3B0aW9uYWwgZGF0YSBhYm91dCB0aGUgd2lkZ2V0LCBhbmQgY2FuIGNvbnRhaW4gYXJiaXRyYXJ5IGtleS92YWx1ZSBwYWlycy5cblJlc3BvbnNlOlxue1xuICAgIHN1Y2Nlc3M6IHRydWVcbn1cbkV4YW1wbGU6XG57XG4gICAgYWN0aW9uOiBcInNldF93aWRnZXRcIixcbiAgICByb29tX2lkOiBcIiFmb286YmFyXCIsXG4gICAgd2lkZ2V0X2lkOiBcImFiYzEyM1wiLFxuICAgIHVybDogXCJodHRwOi8vd2lkZ2V0LnVybFwiLFxuICAgIHR5cGU6IFwiZXhhbXBsZVwiLFxuICAgIHJlc3BvbnNlOiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWVcbiAgICB9XG59XG5cbmdldF93aWRnZXRzXG4tLS0tLS0tLS0tLVxuR2V0IGEgbGlzdCBvZiBhbGwgd2lkZ2V0cyBpbiB0aGUgcm9vbS4gVGhlIHJlc3BvbnNlIGlzIGFuIGFycmF5XG5vZiBzdGF0ZSBldmVudHMuXG5cblJlcXVlc3Q6XG4gLSBgcm9vbV9pZGAgKFN0cmluZykgaXMgdGhlIHJvb20gdG8gZ2V0IHRoZSB3aWRnZXRzIGluLlxuUmVzcG9uc2U6XG5bXG4gICAge1xuICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgICAgIHR5cGU6IFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiLFxuICAgICAgICBzdGF0ZV9rZXk6IFwid2lkMVwiLFxuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImdyYWZhbmFcIixcbiAgICAgICAgICAgIHVybDogXCJodHRwczovL2dyYWZhbmF1cmxcIixcbiAgICAgICAgICAgIG5hbWU6IFwiZGFzaGJvYXJkXCIsXG4gICAgICAgICAgICBkYXRhOiB7a2V5OiBcInZhbFwifVxuICAgICAgICB9XG4gICAgICAgIHJvb21faWQ6IOKAnCFmb286YmFy4oCdLFxuICAgICAgICBzZW5kZXI6IFwiQGFsaWNlOmxvY2FsaG9zdFwiXG4gICAgfVxuXVxuRXhhbXBsZTpcbntcbiAgICBhY3Rpb246IFwiZ2V0X3dpZGdldHNcIixcbiAgICByb29tX2lkOiBcIiFmb286YmFyXCIsXG4gICAgcmVzcG9uc2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICAgICAgdHlwZTogXCJpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzXCIsXG4gICAgICAgICAgICBzdGF0ZV9rZXk6IFwid2lkMVwiLFxuICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZ3JhZmFuYVwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL2dyYWZhbmF1cmxcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcImRhc2hib2FyZFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtrZXk6IFwidmFsXCJ9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByb29tX2lkOiDigJwhZm9vOmJhcuKAnSxcbiAgICAgICAgICAgIHNlbmRlcjogXCJAYWxpY2U6bG9jYWxob3N0XCJcbiAgICAgICAgfVxuICAgIF1cbn1cblxuXG5tZW1iZXJzaGlwX3N0YXRlIEFORCBib3Rfb3B0aW9uc1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkdldCB0aGUgY29udGVudCBvZiB0aGUgXCJtLnJvb20ubWVtYmVyXCIgb3IgXCJtLnJvb20uYm90Lm9wdGlvbnNcIiBzdGF0ZSBldmVudCByZXNwZWN0aXZlbHkuXG5cbk5COiBXaGlsc3QgdGhpcyBBUEkgaXMgYmFzaWNhbGx5IGVxdWl2YWxlbnQgdG8gZ2V0U3RhdGVFdmVudCwgd2Ugc3BlY2lmaWNhbGx5IGRvIG5vdFxuICAgIHdhbnQgZXh0ZXJuYWwgZW50aXRpZXMgdG8gYmUgYWJsZSB0byBxdWVyeSBhbnkgc3RhdGUgZXZlbnQgZm9yIGFueSByb29tLCBoZW5jZSB0aGVcbiAgICByZXN0cmljdGl2ZSBBUEkgb3V0bGluZWQgaGVyZS5cblxuUmVxdWVzdDpcbiAtIHJvb21faWQgaXMgdGhlIHJvb20gd2hpY2ggaGFzIHRoZSBzdGF0ZSBldmVudC5cbiAtIHVzZXJfaWQgaXMgdGhlIHN0YXRlX2tleSBwYXJhbWV0ZXIgd2hpY2ggaW4gYm90aCBjYXNlcyBpcyBhIHVzZXIgSUQgKHRoZSBtZW1iZXIgb3IgdGhlIGJvdCkuXG4gLSBObyBhZGRpdGlvbmFsIGZpZWxkcy5cblJlc3BvbnNlOlxuIC0gVGhlIGV2ZW50IGNvbnRlbnQuIElmIHRoZXJlIGlzIG5vIHN0YXRlIGV2ZW50LCB0aGUgXCJyZXNwb25zZVwiIGtleSBzaG91bGQgYmUgbnVsbC5cbkV4YW1wbGU6XG57XG4gICAgYWN0aW9uOiBcIm1lbWJlcnNoaXBfc3RhdGVcIixcbiAgICByb29tX2lkOiBcIiFmb286YmFyXCIsXG4gICAgdXNlcl9pZDogXCJAc29tZW1lbWJlcjpiYXJcIixcbiAgICByZXNwb25zZToge1xuICAgICAgICBtZW1iZXJzaGlwOiBcImpvaW5cIixcbiAgICAgICAgZGlzcGxheW5hbWU6IFwiQm9iXCIsXG4gICAgICAgIGF2YXRhcl91cmw6IG51bGxcbiAgICB9XG59XG4qL1xuXG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgV2lkZ2V0VXRpbHMgZnJvbSAnLi91dGlscy9XaWRnZXRVdGlscyc7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tICcuL3N0b3Jlcy9Sb29tVmlld1N0b3JlJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtJbnRlZ3JhdGlvbk1hbmFnZXJzfSBmcm9tIFwiLi9pbnRlZ3JhdGlvbnMvSW50ZWdyYXRpb25NYW5hZ2Vyc1wiO1xuaW1wb3J0IHtXaWRnZXRUeXBlfSBmcm9tIFwiLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7b2JqZWN0Q2xvbmV9IGZyb20gXCIuL3V0aWxzL29iamVjdHNcIjtcblxuZnVuY3Rpb24gc2VuZFJlc3BvbnNlKGV2ZW50LCByZXMpIHtcbiAgICBjb25zdCBkYXRhID0gb2JqZWN0Q2xvbmUoZXZlbnQuZGF0YSk7XG4gICAgZGF0YS5yZXNwb25zZSA9IHJlcztcbiAgICBldmVudC5zb3VyY2UucG9zdE1lc3NhZ2UoZGF0YSwgZXZlbnQub3JpZ2luKTtcbn1cblxuZnVuY3Rpb24gc2VuZEVycm9yKGV2ZW50LCBtc2csIG5lc3RlZEVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkFjdGlvbjpcIiArIGV2ZW50LmRhdGEuYWN0aW9uICsgXCIgZmFpbGVkIHdpdGggbWVzc2FnZTogXCIgKyBtc2cpO1xuICAgIGNvbnN0IGRhdGEgPSBvYmplY3RDbG9uZShldmVudC5kYXRhKTtcbiAgICBkYXRhLnJlc3BvbnNlID0ge1xuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgICB9LFxuICAgIH07XG4gICAgaWYgKG5lc3RlZEVycm9yKSB7XG4gICAgICAgIGRhdGEucmVzcG9uc2UuZXJyb3IuX2Vycm9yID0gbmVzdGVkRXJyb3I7XG4gICAgfVxuICAgIGV2ZW50LnNvdXJjZS5wb3N0TWVzc2FnZShkYXRhLCBldmVudC5vcmlnaW4pO1xufVxuXG5mdW5jdGlvbiBpbnZpdGVVc2VyKGV2ZW50LCByb29tSWQsIHVzZXJJZCkge1xuICAgIGNvbnNvbGUubG9nKGBSZWNlaXZlZCByZXF1ZXN0IHRvIGludml0ZSAke3VzZXJJZH0gaW50byByb29tICR7cm9vbUlkfWApO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgIGlmIChyb29tKSB7XG4gICAgICAgIC8vIGlmIHRoZXkgYXJlIGFscmVhZHkgaW52aXRlZCB3ZSBjYW4gcmVzb2x2ZSBpbW1lZGlhdGVseS5cbiAgICAgICAgY29uc3QgbWVtYmVyID0gcm9vbS5nZXRNZW1iZXIodXNlcklkKTtcbiAgICAgICAgaWYgKG1lbWJlciAmJiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xpZW50Lmludml0ZShyb29tSWQsIHVzZXJJZCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgc2VuZFJlc3BvbnNlKGV2ZW50LCB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnWW91IG5lZWQgdG8gYmUgYWJsZSB0byBpbnZpdGUgdXNlcnMgdG8gZG8gdGhhdC4nKSwgZXJyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0V2lkZ2V0KGV2ZW50LCByb29tSWQpIHtcbiAgICBjb25zdCB3aWRnZXRJZCA9IGV2ZW50LmRhdGEud2lkZ2V0X2lkO1xuICAgIGxldCB3aWRnZXRUeXBlID0gZXZlbnQuZGF0YS50eXBlO1xuICAgIGNvbnN0IHdpZGdldFVybCA9IGV2ZW50LmRhdGEudXJsO1xuICAgIGNvbnN0IHdpZGdldE5hbWUgPSBldmVudC5kYXRhLm5hbWU7IC8vIG9wdGlvbmFsXG4gICAgY29uc3Qgd2lkZ2V0RGF0YSA9IGV2ZW50LmRhdGEuZGF0YTsgLy8gb3B0aW9uYWxcbiAgICBjb25zdCB1c2VyV2lkZ2V0ID0gZXZlbnQuZGF0YS51c2VyV2lkZ2V0O1xuXG4gICAgLy8gYm90aCBhZGRpbmcvcmVtb3Zpbmcgd2lkZ2V0cyBuZWVkIHRoZXNlIGNoZWNrc1xuICAgIGlmICghd2lkZ2V0SWQgfHwgd2lkZ2V0VXJsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdChcIlVuYWJsZSB0byBjcmVhdGUgd2lkZ2V0LlwiKSwgbmV3IEVycm9yKFwiTWlzc2luZyByZXF1aXJlZCB3aWRnZXQgZmllbGRzLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAod2lkZ2V0VXJsICE9PSBudWxsKSB7IC8vIGlmIHVybCBpcyBudWxsIGl0IGlzIGJlaW5nIGRlbGV0ZWQsIGRvbid0IG5lZWQgdG8gY2hlY2sgbmFtZS90eXBlL2V0Y1xuICAgICAgICAvLyBjaGVjayB0eXBlcyBvZiBmaWVsZHNcbiAgICAgICAgaWYgKHdpZGdldE5hbWUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygd2lkZ2V0TmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoXCJVbmFibGUgdG8gY3JlYXRlIHdpZGdldC5cIiksIG5ldyBFcnJvcihcIk9wdGlvbmFsIGZpZWxkICduYW1lJyBtdXN0IGJlIGEgc3RyaW5nLlwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdpZGdldERhdGEgIT09IHVuZGVmaW5lZCAmJiAhKHdpZGdldERhdGEgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KFwiVW5hYmxlIHRvIGNyZWF0ZSB3aWRnZXQuXCIpLCBuZXcgRXJyb3IoXCJPcHRpb25hbCBmaWVsZCAnZGF0YScgbXVzdCBiZSBhbiBPYmplY3QuXCIpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHdpZGdldFR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KFwiVW5hYmxlIHRvIGNyZWF0ZSB3aWRnZXQuXCIpLCBuZXcgRXJyb3IoXCJGaWVsZCAndHlwZScgbXVzdCBiZSBhIHN0cmluZy5cIikpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygd2lkZ2V0VXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdChcIlVuYWJsZSB0byBjcmVhdGUgd2lkZ2V0LlwiKSwgbmV3IEVycm9yKFwiRmllbGQgJ3VybCcgbXVzdCBiZSBhIHN0cmluZyBvciBudWxsLlwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IHRoZSB3aWRnZXQgdHlwZSB0byBhIGtub3duIHdpZGdldCB0eXBlXG4gICAgd2lkZ2V0VHlwZSA9IFdpZGdldFR5cGUuZnJvbVN0cmluZyh3aWRnZXRUeXBlKTtcblxuICAgIGlmICh1c2VyV2lkZ2V0KSB7XG4gICAgICAgIFdpZGdldFV0aWxzLnNldFVzZXJXaWRnZXQod2lkZ2V0SWQsIHdpZGdldFR5cGUsIHdpZGdldFVybCwgd2lkZ2V0TmFtZSwgd2lkZ2V0RGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJ1c2VyX3dpZGdldF91cGRhdGVkXCIgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdVbmFibGUgdG8gY3JlYXRlIHdpZGdldC4nKSwgZSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7IC8vIFJvb20gd2lkZ2V0XG4gICAgICAgIGlmICghcm9vbUlkKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdNaXNzaW5nIHJvb21JZC4nKSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgV2lkZ2V0VXRpbHMuc2V0Um9vbVdpZGdldChyb29tSWQsIHdpZGdldElkLCB3aWRnZXRUeXBlLCB3aWRnZXRVcmwsIHdpZGdldE5hbWUsIHdpZGdldERhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdGYWlsZWQgdG8gc2VuZCByZXF1ZXN0LicpLCBlcnIpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldFdpZGdldHMoZXZlbnQsIHJvb21JZCkge1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB3aWRnZXRTdGF0ZUV2ZW50cyA9IFtdO1xuXG4gICAgaWYgKHJvb21JZCkge1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdUaGlzIHJvb20gaXMgbm90IHJlY29nbmlzZWQuJykpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFhYWDogVGhpcyBnZXRzIHRoZSByYXcgZXZlbnQgb2JqZWN0IChJIHRoaW5rIGJlY2F1c2Ugd2UgY2FuJ3RcbiAgICAgICAgLy8gc2VuZCB0aGUgTWF0cml4RXZlbnQgb3ZlciBwb3N0TWVzc2FnZT8pXG4gICAgICAgIHdpZGdldFN0YXRlRXZlbnRzID0gV2lkZ2V0VXRpbHMuZ2V0Um9vbVdpZGdldHMocm9vbSkubWFwKChldikgPT4gZXYuZXZlbnQpO1xuICAgIH1cblxuICAgIC8vIEFkZCB1c2VyIHdpZGdldHMgKG5vdCBsaW5rZWQgdG8gYSBzcGVjaWZpYyByb29tKVxuICAgIGNvbnN0IHVzZXJXaWRnZXRzID0gV2lkZ2V0VXRpbHMuZ2V0VXNlcldpZGdldHNBcnJheSgpO1xuICAgIHdpZGdldFN0YXRlRXZlbnRzID0gd2lkZ2V0U3RhdGVFdmVudHMuY29uY2F0KHVzZXJXaWRnZXRzKTtcblxuICAgIHNlbmRSZXNwb25zZShldmVudCwgd2lkZ2V0U3RhdGVFdmVudHMpO1xufVxuXG5mdW5jdGlvbiBnZXRSb29tRW5jU3RhdGUoZXZlbnQsIHJvb21JZCkge1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgIGlmICghcm9vbSkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdUaGlzIHJvb20gaXMgbm90IHJlY29nbmlzZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb21Jc0VuY3J5cHRlZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQocm9vbUlkKTtcblxuICAgIHNlbmRSZXNwb25zZShldmVudCwgcm9vbUlzRW5jcnlwdGVkKTtcbn1cblxuZnVuY3Rpb24gc2V0UGx1bWJpbmdTdGF0ZShldmVudCwgcm9vbUlkLCBzdGF0dXMpIHtcbiAgICBpZiAodHlwZW9mIHN0YXR1cyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbHVtYmluZyBzdGF0ZSBzdGF0dXMgc2hvdWxkIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGBSZWNlaXZlZCByZXF1ZXN0IHRvIHNldCBwbHVtYmluZyBzdGF0ZSB0byBzdGF0dXMgXCIke3N0YXR1c31cIiBpbiByb29tICR7cm9vbUlkfWApO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNsaWVudC5zZW5kU3RhdGVFdmVudChyb29tSWQsIFwibS5yb29tLnBsdW1iaW5nXCIsIHsgc3RhdHVzOiBzdGF0dXMgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbmRSZXNwb25zZShldmVudCwge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSwgKGVycikgPT4ge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIGVyci5tZXNzYWdlID8gZXJyLm1lc3NhZ2UgOiBfdCgnRmFpbGVkIHRvIHNlbmQgcmVxdWVzdC4nKSwgZXJyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0Qm90T3B0aW9ucyhldmVudCwgcm9vbUlkLCB1c2VySWQpIHtcbiAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgcmVxdWVzdCB0byBzZXQgb3B0aW9ucyBmb3IgYm90ICR7dXNlcklkfSBpbiByb29tICR7cm9vbUlkfWApO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNsaWVudC5zZW5kU3RhdGVFdmVudChyb29tSWQsIFwibS5yb29tLmJvdC5vcHRpb25zXCIsIGV2ZW50LmRhdGEuY29udGVudCwgXCJfXCIgKyB1c2VySWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBlcnIubWVzc2FnZSA/IGVyci5tZXNzYWdlIDogX3QoJ0ZhaWxlZCB0byBzZW5kIHJlcXVlc3QuJyksIGVycik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldEJvdFBvd2VyKGV2ZW50LCByb29tSWQsIHVzZXJJZCwgbGV2ZWwpIHtcbiAgICBpZiAoIShOdW1iZXIuaXNJbnRlZ2VyKGxldmVsKSAmJiBsZXZlbCA+PSAwKSkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdQb3dlciBsZXZlbCBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYFJlY2VpdmVkIHJlcXVlc3QgdG8gc2V0IHBvd2VyIGxldmVsIHRvICR7bGV2ZWx9IGZvciBib3QgJHt1c2VySWR9IGluIHJvb20gJHtyb29tSWR9LmApO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2xpZW50LmdldFN0YXRlRXZlbnQocm9vbUlkLCBcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIiwgXCJcIikudGhlbigocG93ZXJMZXZlbHMpID0+IHtcbiAgICAgICAgY29uc3QgcG93ZXJFdmVudCA9IG5ldyBNYXRyaXhFdmVudChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIixcbiAgICAgICAgICAgICAgICBjb250ZW50OiBwb3dlckxldmVscyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgY2xpZW50LnNldFBvd2VyTGV2ZWwocm9vbUlkLCB1c2VySWQsIGxldmVsLCBwb3dlckV2ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShldmVudCwge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBlcnIubWVzc2FnZSA/IGVyci5tZXNzYWdlIDogX3QoJ0ZhaWxlZCB0byBzZW5kIHJlcXVlc3QuJyksIGVycik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRNZW1iZXJzaGlwU3RhdGUoZXZlbnQsIHJvb21JZCwgdXNlcklkKSB7XG4gICAgY29uc29sZS5sb2coYG1lbWJlcnNoaXBfc3RhdGUgb2YgJHt1c2VySWR9IGluIHJvb20gJHtyb29tSWR9IHJlcXVlc3RlZC5gKTtcbiAgICByZXR1cm5TdGF0ZUV2ZW50KGV2ZW50LCByb29tSWQsIFwibS5yb29tLm1lbWJlclwiLCB1c2VySWQpO1xufVxuXG5mdW5jdGlvbiBnZXRKb2luUnVsZXMoZXZlbnQsIHJvb21JZCkge1xuICAgIGNvbnNvbGUubG9nKGBqb2luX3J1bGVzIG9mICR7cm9vbUlkfSByZXF1ZXN0ZWQuYCk7XG4gICAgcmV0dXJuU3RhdGVFdmVudChldmVudCwgcm9vbUlkLCBcIm0ucm9vbS5qb2luX3J1bGVzXCIsIFwiXCIpO1xufVxuXG5mdW5jdGlvbiBib3RPcHRpb25zKGV2ZW50LCByb29tSWQsIHVzZXJJZCkge1xuICAgIGNvbnNvbGUubG9nKGBib3Rfb3B0aW9ucyBvZiAke3VzZXJJZH0gaW4gcm9vbSAke3Jvb21JZH0gcmVxdWVzdGVkLmApO1xuICAgIHJldHVyblN0YXRlRXZlbnQoZXZlbnQsIHJvb21JZCwgXCJtLnJvb20uYm90Lm9wdGlvbnNcIiwgXCJfXCIgKyB1c2VySWQpO1xufVxuXG5mdW5jdGlvbiBnZXRNZW1iZXJzaGlwQ291bnQoZXZlbnQsIHJvb21JZCkge1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgIGlmICghcm9vbSkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdUaGlzIHJvb20gaXMgbm90IHJlY29nbmlzZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvdW50ID0gcm9vbS5nZXRKb2luZWRNZW1iZXJDb3VudCgpO1xuICAgIHNlbmRSZXNwb25zZShldmVudCwgY291bnQpO1xufVxuXG5mdW5jdGlvbiBjYW5TZW5kRXZlbnQoZXZlbnQsIHJvb21JZCkge1xuICAgIGNvbnN0IGV2VHlwZSA9IFwiXCIgKyBldmVudC5kYXRhLmV2ZW50X3R5cGU7IC8vIGZvcmNlIHN0cmluZ2lmeVxuICAgIGNvbnN0IGlzU3RhdGUgPSBCb29sZWFuKGV2ZW50LmRhdGEuaXNfc3RhdGUpO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgIGlmICghcm9vbSkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdUaGlzIHJvb20gaXMgbm90IHJlY29nbmlzZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChyb29tLmdldE15TWVtYmVyc2hpcCgpICE9PSBcImpvaW5cIikge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgYXJlIG5vdCBpbiB0aGlzIHJvb20uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1lID0gY2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZDtcblxuICAgIGxldCBjYW5TZW5kID0gZmFsc2U7XG4gICAgaWYgKGlzU3RhdGUpIHtcbiAgICAgICAgY2FuU2VuZCA9IHJvb20uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KGV2VHlwZSwgbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNhblNlbmQgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kRXZlbnQoZXZUeXBlLCBtZSk7XG4gICAgfVxuXG4gICAgaWYgKCFjYW5TZW5kKSB7XG4gICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ1lvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGRvIHRoYXQgaW4gdGhpcyByb29tLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbmRSZXNwb25zZShldmVudCwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHJldHVyblN0YXRlRXZlbnQoZXZlbnQsIHJvb21JZCwgZXZlbnRUeXBlLCBzdGF0ZUtleSkge1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgIGlmICghcm9vbSkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdUaGlzIHJvb20gaXMgbm90IHJlY29nbmlzZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0YXRlRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhldmVudFR5cGUsIHN0YXRlS2V5KTtcbiAgICBpZiAoIXN0YXRlRXZlbnQpIHtcbiAgICAgICAgc2VuZFJlc3BvbnNlKGV2ZW50LCBudWxsKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHN0YXRlRXZlbnQuZ2V0Q29udGVudCgpKTtcbn1cblxuY29uc3Qgb25NZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50Lm9yaWdpbikgeyAvLyBzdHVwaWQgY2hyb21lXG4gICAgICAgIGV2ZW50Lm9yaWdpbiA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQub3JpZ2luO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoYXQgdGhlIGludGVncmF0aW9ucyBVSSBVUkwgc3RhcnRzIHdpdGggdGhlIG9yaWdpbiBvZiB0aGUgZXZlbnRcbiAgICAvLyBUaGlzIG1lYW5zIHRoZSBVUkwgY291bGQgY29udGFpbiBhIHBhdGggKGxpa2UgL2RldmVsb3ApIGFuZCBzdGlsbCBiZSB1c2VkXG4gICAgLy8gdG8gdmFsaWRhdGUgZXZlbnQgb3JpZ2lucywgd2hpY2ggZG8gbm90IHNwZWNpZnkgcGF0aHMuXG4gICAgLy8gKFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93L3Bvc3RNZXNzYWdlKVxuICAgIGxldCBjb25maWdVcmw7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCFvcGVuTWFuYWdlclVybCkgb3Blbk1hbmFnZXJVcmwgPSBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuZ2V0UHJpbWFyeU1hbmFnZXIoKS51aVVybDtcbiAgICAgICAgY29uZmlnVXJsID0gbmV3IFVSTChvcGVuTWFuYWdlclVybCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBObyBpbnRlZ3JhdGlvbnMgVUkgVVJMLCBpZ25vcmUgc2lsZW50bHkuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGV2ZW50T3JpZ2luVXJsO1xuICAgIHRyeSB7XG4gICAgICAgIGV2ZW50T3JpZ2luVXJsID0gbmV3IFVSTChldmVudC5vcmlnaW4pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPIC0tIFNjYWxhciBwb3N0TWVzc2FnZSBBUEkgc2hvdWxkIGJlIG5hbWVzcGFjZWQgd2l0aCBldmVudC5kYXRhLmFwaSBmaWVsZFxuICAgIC8vIEZpeCBmb2xsb3dpbmcgXCJpZlwiIHN0YXRlbWVudCB0byByZXNwb25kIG9ubHkgdG8gc3BlY2lmaWMgQVBJIG1lc3NhZ2VzLlxuICAgIGlmIChcbiAgICAgICAgY29uZmlnVXJsLm9yaWdpbiAhPT0gZXZlbnRPcmlnaW5Vcmwub3JpZ2luIHx8XG4gICAgICAgICFldmVudC5kYXRhLmFjdGlvbiB8fFxuICAgICAgICBldmVudC5kYXRhLmFwaSAvLyBJZ25vcmUgbWVzc2FnZXMgd2l0aCBzcGVjaWZpYyBBUEkgc2V0XG4gICAgKSB7XG4gICAgICAgIC8vIGRvbid0IGxvZyB0aGlzIC0gZGVidWdnaW5nIEFQSXMgYW5kIGJyb3dzZXIgYWRkLW9ucyBsaWtlIHRvIHNwYW1cbiAgICAgICAgLy8gcG9zdE1lc3NhZ2Ugd2hpY2ggZmxvb2RzIHRoZSBsb2cgb3RoZXJ3aXNlXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IFwiY2xvc2Vfc2NhbGFyXCIpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcImNsb3NlX3NjYWxhclwiIH0pO1xuICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vbUlkID0gZXZlbnQuZGF0YS5yb29tX2lkO1xuICAgIGNvbnN0IHVzZXJJZCA9IGV2ZW50LmRhdGEudXNlcl9pZDtcblxuICAgIGlmICghcm9vbUlkKSB7XG4gICAgICAgIC8vIFRoZXNlIEFQSXMgZG9uJ3QgcmVxdWlyZSByb29tSWRcbiAgICAgICAgLy8gR2V0IGFuZCBzZXQgdXNlciB3aWRnZXRzIChub3QgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgcm9vbSlcbiAgICAgICAgLy8gSWYgcm9vbUlkIGlzIHNwZWNpZmllZCwgaXQgbXVzdCBiZSB2YWxpZGF0ZWQsIHNvIHJvb20tYmFzZWQgd2lkZ2V0cyBhZ3JlZWRcbiAgICAgICAgLy8gaGFuZGxlZCBmdXJ0aGVyIGRvd24uXG4gICAgICAgIGlmIChldmVudC5kYXRhLmFjdGlvbiA9PT0gXCJnZXRfd2lkZ2V0c1wiKSB7XG4gICAgICAgICAgICBnZXRXaWRnZXRzKGV2ZW50LCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5kYXRhLmFjdGlvbiA9PT0gXCJzZXRfd2lkZ2V0XCIpIHtcbiAgICAgICAgICAgIHNldFdpZGdldChldmVudCwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdNaXNzaW5nIHJvb21faWQgaW4gcmVxdWVzdCcpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyb29tSWQgIT09IFJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCkpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnUm9vbSAlKHJvb21JZClzIG5vdCB2aXNpYmxlJywge3Jvb21JZDogcm9vbUlkfSkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gR2V0IGFuZCBzZXQgcm9vbS1iYXNlZCB3aWRnZXRzXG4gICAgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSBcImdldF93aWRnZXRzXCIpIHtcbiAgICAgICAgZ2V0V2lkZ2V0cyhldmVudCwgcm9vbUlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IFwic2V0X3dpZGdldFwiKSB7XG4gICAgICAgIHNldFdpZGdldChldmVudCwgcm9vbUlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZXNlIEFQSXMgZG9uJ3QgcmVxdWlyZSB1c2VySWRcbiAgICBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IFwiam9pbl9ydWxlc19zdGF0ZVwiKSB7XG4gICAgICAgIGdldEpvaW5SdWxlcyhldmVudCwgcm9vbUlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IFwic2V0X3BsdW1iaW5nX3N0YXRlXCIpIHtcbiAgICAgICAgc2V0UGx1bWJpbmdTdGF0ZShldmVudCwgcm9vbUlkLCBldmVudC5kYXRhLnN0YXR1cyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSBcImdldF9tZW1iZXJzaGlwX2NvdW50XCIpIHtcbiAgICAgICAgZ2V0TWVtYmVyc2hpcENvdW50KGV2ZW50LCByb29tSWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChldmVudC5kYXRhLmFjdGlvbiA9PT0gXCJnZXRfcm9vbV9lbmNfc3RhdGVcIikge1xuICAgICAgICBnZXRSb29tRW5jU3RhdGUoZXZlbnQsIHJvb21JZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSBcImNhbl9zZW5kX2V2ZW50XCIpIHtcbiAgICAgICAgY2FuU2VuZEV2ZW50KGV2ZW50LCByb29tSWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF1c2VySWQpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnTWlzc2luZyB1c2VyX2lkIGluIHJlcXVlc3QnKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3dpdGNoIChldmVudC5kYXRhLmFjdGlvbikge1xuICAgICAgICBjYXNlIFwibWVtYmVyc2hpcF9zdGF0ZVwiOlxuICAgICAgICAgICAgZ2V0TWVtYmVyc2hpcFN0YXRlKGV2ZW50LCByb29tSWQsIHVzZXJJZCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImludml0ZVwiOlxuICAgICAgICAgICAgaW52aXRlVXNlcihldmVudCwgcm9vbUlkLCB1c2VySWQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJib3Rfb3B0aW9uc1wiOlxuICAgICAgICAgICAgYm90T3B0aW9ucyhldmVudCwgcm9vbUlkLCB1c2VySWQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzZXRfYm90X29wdGlvbnNcIjpcbiAgICAgICAgICAgIHNldEJvdE9wdGlvbnMoZXZlbnQsIHJvb21JZCwgdXNlcklkKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwic2V0X2JvdF9wb3dlclwiOlxuICAgICAgICAgICAgc2V0Qm90UG93ZXIoZXZlbnQsIHJvb21JZCwgdXNlcklkLCBldmVudC5kYXRhLmxldmVsKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVW5oYW5kbGVkIHBvc3RNZXNzYWdlIGV2ZW50IHdpdGggYWN0aW9uICdcIiArIGV2ZW50LmRhdGEuYWN0aW9uICtcIidcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59O1xuXG5sZXQgbGlzdGVuZXJDb3VudCA9IDA7XG5sZXQgb3Blbk1hbmFnZXJVcmwgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRMaXN0ZW5pbmcoKSB7XG4gICAgaWYgKGxpc3RlbmVyQ291bnQgPT09IDApIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uTWVzc2FnZSwgZmFsc2UpO1xuICAgIH1cbiAgICBsaXN0ZW5lckNvdW50ICs9IDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wTGlzdGVuaW5nKCkge1xuICAgIGxpc3RlbmVyQ291bnQgLT0gMTtcbiAgICBpZiAobGlzdGVuZXJDb3VudCA9PT0gMCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgb25NZXNzYWdlKTtcbiAgICB9XG4gICAgaWYgKGxpc3RlbmVyQ291bnQgPCAwKSB7XG4gICAgICAgIC8vIE1ha2UgYW4gZXJyb3Igc28gd2UgZ2V0IGEgc3RhY2sgdHJhY2VcbiAgICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgIFwiU2NhbGFyTWVzc2FnaW5nOiBtaXNtYXRjaGVkIHN0YXJ0TGlzdGVuaW5nIC8gc3RvcExpc3RlbmluZyBkZXRlY3RlZC5cIiArXG4gICAgICAgICAgICBcIiBOZWdhdGl2ZSBjb3VudFwiLFxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE9wZW5NYW5hZ2VyVXJsKHVybCkge1xuICAgIG9wZW5NYW5hZ2VyVXJsID0gdXJsO1xufVxuIl19