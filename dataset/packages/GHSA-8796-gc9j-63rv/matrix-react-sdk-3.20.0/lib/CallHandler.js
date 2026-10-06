"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PlaceCallType = exports.VIRTUAL_ROOM_EVENT_TYPE = exports.PROTOCOL_SIP_VIRTUAL = exports.PROTOCOL_SIP_NATIVE = exports.PROTOCOL_PSTN_PREFIXED = exports.PROTOCOL_PSTN = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _Modal = _interopRequireDefault(require("./Modal"));

var _languageHandler = require("./languageHandler");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _WidgetEchoStore = _interopRequireDefault(require("./stores/WidgetEchoStore"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _Jitsi = require("./widgets/Jitsi");

var _WidgetType = require("./widgets/WidgetType");

var _SettingLevel = require("./settings/SettingLevel");

var _rfc = require("rfc4648");

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _WidgetStore = _interopRequireDefault(require("./stores/WidgetStore"));

var _WidgetMessagingStore = require("./stores/widgets/WidgetMessagingStore");

var _ElementWidgetActions = require("./stores/widgets/ElementWidgetActions");

var _call = require("matrix-js-sdk/src/webrtc/call");

var _Analytics = _interopRequireDefault(require("./Analytics"));

var _CountlyAnalytics = _interopRequireDefault(require("./CountlyAnalytics"));

var _UIFeature = require("./settings/UIFeature");

var _logger = require("matrix-js-sdk/src/logger");

var _DesktopCapturerSourcePicker = _interopRequireDefault(require("./components/views/elements/DesktopCapturerSourcePicker"));

var _actions = require("./dispatcher/actions");

var _VoipUserMapper = _interopRequireDefault(require("./VoipUserMapper"));

var _ManagedHybrid = require("./widgets/ManagedHybrid");

var _randomstring = require("matrix-js-sdk/src/randomstring");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _createRoom = require("./createRoom");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 New Vector Ltd
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

/*
 * Manages a list of all the currently active calls.
 *
 * This handler dispatches when voip calls are added/updated/removed from this list:
 * {
 *   action: 'call_state'
 *   room_id: <room ID of the call>
 * }
 *
 * To know the state of the call, this handler exposes a getter to
 * obtain the call for a room:
 *   var call = CallHandler.getCall(roomId)
 *   var state = call.call_state; // ringing|ringback|connected|ended|busy|stop_ringback|stop_ringing
 *
 * This handler listens for and handles the following actions:
 * {
 *   action: 'place_call',
 *   type: 'voice|video',
 *   room_id: <room that the place call button was pressed in>
 * }
 *
 * {
 *   action: 'incoming_call'
 *   call: MatrixCall
 * }
 *
 * {
 *   action: 'hangup'
 *   room_id: <room that the hangup button was pressed in>
 * }
 *
 * {
 *   action: 'answer'
 *   room_id: <room that the answer button was pressed in>
 * }
 */
const PROTOCOL_PSTN = 'm.protocol.pstn';
exports.PROTOCOL_PSTN = PROTOCOL_PSTN;
const PROTOCOL_PSTN_PREFIXED = 'im.vector.protocol.pstn';
exports.PROTOCOL_PSTN_PREFIXED = PROTOCOL_PSTN_PREFIXED;
const PROTOCOL_SIP_NATIVE = 'im.vector.protocol.sip_native';
exports.PROTOCOL_SIP_NATIVE = PROTOCOL_SIP_NATIVE;
const PROTOCOL_SIP_VIRTUAL = 'im.vector.protocol.sip_virtual';
exports.PROTOCOL_SIP_VIRTUAL = PROTOCOL_SIP_VIRTUAL;
const CHECK_PROTOCOLS_ATTEMPTS = 3; // Event type for room account data and room creation content used to mark rooms as virtual rooms
// (and store the ID of their native room)

const VIRTUAL_ROOM_EVENT_TYPE = 'im.vector.is_virtual_room';
exports.VIRTUAL_ROOM_EVENT_TYPE = VIRTUAL_ROOM_EVENT_TYPE;
var AudioID;

(function (AudioID) {
  AudioID["Ring"] = "ringAudio";
  AudioID["Ringback"] = "ringbackAudio";
  AudioID["CallEnd"] = "callendAudio";
  AudioID["Busy"] = "busyAudio";
})(AudioID || (AudioID = {}));

// Unlike 'CallType' in js-sdk, this one includes screen sharing
// (because a screen sharing call is only a screen sharing call to the caller,
// to the callee it's just a video call, at least as far as the current impl
// is concerned).
let PlaceCallType;
exports.PlaceCallType = PlaceCallType;

(function (PlaceCallType) {
  PlaceCallType["Voice"] = "voice";
  PlaceCallType["Video"] = "video";
  PlaceCallType["ScreenSharing"] = "screensharing";
})(PlaceCallType || (exports.PlaceCallType = PlaceCallType = {}));

function getRemoteAudioElement()
/*: HTMLAudioElement*/
{
  // this needs to be somewhere at the top of the DOM which
  // always exists to avoid audio interruptions.
  // Might as well just use DOM.
  const remoteAudioElement = document.getElementById("remoteAudio");

  if (!remoteAudioElement) {
    console.error("Failed to find remoteAudio element - cannot play audio!" + "You need to add an <audio/> to the DOM.");
    return null;
  }

  return remoteAudioElement;
}

class CallHandler {
  constructor() {
    (0, _defineProperty2.default)(this, "calls", new Map());
    (0, _defineProperty2.default)(this, "transferees", new Map());
    (0, _defineProperty2.default)(this, "audioPromises", new Map());
    (0, _defineProperty2.default)(this, "dispatcherRef", null);
    (0, _defineProperty2.default)(this, "supportsPstnProtocol", null);
    (0, _defineProperty2.default)(this, "pstnSupportPrefixed", null);
    (0, _defineProperty2.default)(this, "supportsSipNativeVirtual", null);
    (0, _defineProperty2.default)(this, "pstnSupportCheckTimer", void 0);
    (0, _defineProperty2.default)(this, "invitedRoomsAreVirtual", new Map());
    (0, _defineProperty2.default)(this, "invitedRoomCheckInProgress", false);
    (0, _defineProperty2.default)(this, "assertedIdentityNativeUsers", new Map());
    (0, _defineProperty2.default)(this, "onCallIncoming", call => {
      // we dispatch this synchronously to make sure that the event
      // handlers on the call are set up immediately (so that if
      // we get an immediate hangup, we don't get a stuck call)
      _dispatcher.default.dispatch({
        action: 'incoming_call',
        call: call
      }, true);
    });
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      switch (payload.action) {
        case 'place_call':
          {
            // We might be using managed hybrid widgets
            if ((0, _ManagedHybrid.isManagedHybridWidgetEnabled)()) {
              (0, _ManagedHybrid.addManagedHybridWidget)(payload.room_id);
              return;
            } // if the runtime env doesn't do VoIP, whine.


            if (!_MatrixClientPeg.MatrixClientPeg.get().supportsVoip()) {
              _Modal.default.createTrackedDialog('Call Handler', 'VoIP is unsupported', _ErrorDialog.default, {
                title: (0, _languageHandler._t)('VoIP is unsupported'),
                description: (0, _languageHandler._t)('You cannot place VoIP calls in this browser.')
              });

              return;
            } // don't allow > 2 calls to be placed.


            if (this.getAllActiveCalls().length > 1) {
              _Modal.default.createTrackedDialog('Call Handler', 'Existing Call', _ErrorDialog.default, {
                title: (0, _languageHandler._t)('Too Many Calls'),
                description: (0, _languageHandler._t)("You've reached the maximum number of simultaneous calls.")
              });

              return;
            }

            const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(payload.room_id);

            if (!room) {
              console.error(`Room ${payload.room_id} does not exist.`);
              return;
            }

            if (this.getCallForRoom(room.roomId)) {
              _Modal.default.createTrackedDialog('Call Handler', 'Existing Call with user', _ErrorDialog.default, {
                title: (0, _languageHandler._t)('Already in call'),
                description: (0, _languageHandler._t)("You're already in a call with this person.")
              });

              return;
            }

            const members = room.getJoinedMembers();

            if (members.length <= 1) {
              _Modal.default.createTrackedDialog('Call Handler', 'Cannot place call with self', _ErrorDialog.default, {
                description: (0, _languageHandler._t)('You cannot place a call with yourself.')
              });

              return;
            } else if (members.length === 2) {
              console.info(`Place ${payload.type} call in ${payload.room_id}`);
              this.placeCall(payload.room_id, payload.type, payload.local_element, payload.remote_element, payload.transferee);
            } else {
              // > 2
              _dispatcher.default.dispatch({
                action: "place_conference_call",
                room_id: payload.room_id,
                type: payload.type,
                remote_element: payload.remote_element,
                local_element: payload.local_element
              });
            }
          }
          break;

        case 'place_conference_call':
          console.info("Place conference call in " + payload.room_id);

          _Analytics.default.trackEvent('voip', 'placeConferenceCall');

          _CountlyAnalytics.default.instance.trackStartCall(payload.room_id, payload.type === PlaceCallType.Video, true);

          this.startCallApp(payload.room_id, payload.type);
          break;

        case 'end_conference':
          console.info("Terminating conference call in " + payload.room_id);
          this.terminateCallApp(payload.room_id);
          break;

        case 'hangup_conference':
          console.info("Leaving conference call in " + payload.room_id);
          this.hangupCallApp(payload.room_id);
          break;

        case 'incoming_call':
          {
            // if the runtime env doesn't do VoIP, stop here.
            if (!_MatrixClientPeg.MatrixClientPeg.get().supportsVoip()) {
              return;
            }

            const call = payload.call;
            const mappedRoomId = CallHandler.sharedInstance().roomIdForCall(call);

            if (this.getCallForRoom(mappedRoomId)) {
              // ignore multiple incoming calls to the same room
              return;
            }

            _Analytics.default.trackEvent('voip', 'receiveCall', 'type', call.type);

            this.calls.set(mappedRoomId, call);
            this.setCallListeners(call); // get ready to send encrypted events in the room, so if the user does answer
            // the call, we'll be ready to send. NB. This is the protocol-level room ID not
            // the mapped one: that's where we'll send the events.

            const cli = _MatrixClientPeg.MatrixClientPeg.get();

            cli.prepareToEncrypt(cli.getRoom(call.roomId));
          }
          break;

        case 'hangup':
        case 'reject':
          if (!this.calls.get(payload.room_id)) {
            return; // no call to hangup
          }

          if (payload.action === 'reject') {
            this.calls.get(payload.room_id).reject();
          } else {
            this.calls.get(payload.room_id).hangup(_call.CallErrorCode.UserHangup, false);
          } // don't remove the call yet: let the hangup event handler do it (otherwise it will throw
          // the hangup event away)


          break;

        case 'hangup_all':
          for (const call of this.calls.values()) {
            call.hangup(_call.CallErrorCode.UserHangup, false);
          }

          break;

        case 'answer':
          {
            if (!this.calls.has(payload.room_id)) {
              return; // no call to answer
            }

            if (this.getAllActiveCalls().length > 1) {
              _Modal.default.createTrackedDialog('Call Handler', 'Existing Call', _ErrorDialog.default, {
                title: (0, _languageHandler._t)('Too Many Calls'),
                description: (0, _languageHandler._t)("You've reached the maximum number of simultaneous calls.")
              });

              return;
            }

            const call = this.calls.get(payload.room_id);
            call.answer();
            this.setCallAudioElement(call);
            this.setActiveCallRoomId(payload.room_id);

            _CountlyAnalytics.default.instance.trackJoinCall(payload.room_id, call.type === _call.CallType.Video, false);

            _dispatcher.default.dispatch({
              action: "view_room",
              room_id: payload.room_id
            });

            break;
          }
      }
    });
  }

  static sharedInstance() {
    if (!window.mxCallHandler) {
      window.mxCallHandler = new CallHandler();
    }

    return window.mxCallHandler;
  }
  /*
   * Gets the user-facing room associated with a call (call.roomId may be the call "virtual room"
   * if a voip_mxid_translate_pattern is set in the config)
   */


  roomIdForCall(call
  /*: MatrixCall*/
  )
  /*: string*/
  {
    if (!call) return null;

    const voipConfig = _SdkConfig.default.get()['voip'];

    if (voipConfig && voipConfig.obeyAssertedIdentity) {
      const nativeUser = this.assertedIdentityNativeUsers[call.callId];

      if (nativeUser) {
        const room = (0, _createRoom.findDMForUser)(_MatrixClientPeg.MatrixClientPeg.get(), nativeUser);
        if (room) return room.roomId;
      }
    }

    return _VoipUserMapper.default.sharedInstance().nativeRoomForVirtualRoom(call.roomId) || call.roomId;
  }

  start() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction); // add empty handlers for media actions, otherwise the media keys
    // end up causing the audio elements with our ring/ringback etc
    // audio clips in to play.

    if (navigator.mediaSession) {
      navigator.mediaSession.setActionHandler('play', function () {});
      navigator.mediaSession.setActionHandler('pause', function () {});
      navigator.mediaSession.setActionHandler('seekbackward', function () {});
      navigator.mediaSession.setActionHandler('seekforward', function () {});
      navigator.mediaSession.setActionHandler('previoustrack', function () {});
      navigator.mediaSession.setActionHandler('nexttrack', function () {});
    }

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Voip)) {
      _MatrixClientPeg.MatrixClientPeg.get().on('Call.incoming', this.onCallIncoming);
    }

    this.checkProtocols(CHECK_PROTOCOLS_ATTEMPTS);
  }

  stop() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli) {
      cli.removeListener('Call.incoming', this.onCallIncoming);
    }

    if (this.dispatcherRef !== null) {
      _dispatcher.default.unregister(this.dispatcherRef);

      this.dispatcherRef = null;
    }
  }

  async checkProtocols(maxTries) {
    try {
      const protocols = await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyProtocols();

      if (protocols[PROTOCOL_PSTN] !== undefined) {
        this.supportsPstnProtocol = Boolean(protocols[PROTOCOL_PSTN]);
        if (this.supportsPstnProtocol) this.pstnSupportPrefixed = false;
      } else if (protocols[PROTOCOL_PSTN_PREFIXED] !== undefined) {
        this.supportsPstnProtocol = Boolean(protocols[PROTOCOL_PSTN_PREFIXED]);
        if (this.supportsPstnProtocol) this.pstnSupportPrefixed = true;
      } else {
        this.supportsPstnProtocol = null;
      }

      _dispatcher.default.dispatch({
        action: _actions.Action.PstnSupportUpdated
      });

      if (protocols[PROTOCOL_SIP_NATIVE] !== undefined && protocols[PROTOCOL_SIP_VIRTUAL] !== undefined) {
        this.supportsSipNativeVirtual = Boolean(protocols[PROTOCOL_SIP_NATIVE] && protocols[PROTOCOL_SIP_VIRTUAL]);
      }

      _dispatcher.default.dispatch({
        action: _actions.Action.VirtualRoomSupportUpdated
      });
    } catch (e) {
      if (maxTries === 1) {
        console.log("Failed to check for protocol support and no retries remain: assuming no support", e);
      } else {
        console.log("Failed to check for protocol support: will retry", e);
        this.pstnSupportCheckTimer = setTimeout(() => {
          this.checkProtocols(maxTries - 1);
        }, 10000);
      }
    }
  }

  getSupportsPstnProtocol() {
    return this.supportsPstnProtocol;
  }

  getSupportsVirtualRooms() {
    return this.supportsPstnProtocol;
  }

  pstnLookup(phoneNumber
  /*: string*/
  )
  /*: Promise<ThirdpartyLookupResponse[]>*/
  {
    return _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser(this.pstnSupportPrefixed ? PROTOCOL_PSTN_PREFIXED : PROTOCOL_PSTN, {
      'm.id.phone': phoneNumber
    });
  }

  sipVirtualLookup(nativeMxid
  /*: string*/
  )
  /*: Promise<ThirdpartyLookupResponse[]>*/
  {
    return _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser(PROTOCOL_SIP_VIRTUAL, {
      'native_mxid': nativeMxid
    });
  }

  sipNativeLookup(virtualMxid
  /*: string*/
  )
  /*: Promise<ThirdpartyLookupResponse[]>*/
  {
    return _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser(PROTOCOL_SIP_NATIVE, {
      'virtual_mxid': virtualMxid
    });
  }

  getCallForRoom(roomId
  /*: string*/
  )
  /*: MatrixCall*/
  {
    return this.calls.get(roomId) || null;
  }

  getAnyActiveCall() {
    for (const call of this.calls.values()) {
      if (call.state !== _call.CallState.Ended) {
        return call;
      }
    }

    return null;
  }

  getAllActiveCalls() {
    const activeCalls = [];

    for (const call of this.calls.values()) {
      if (call.state !== _call.CallState.Ended && call.state !== _call.CallState.Ringing) {
        activeCalls.push(call);
      }
    }

    return activeCalls;
  }

  getAllActiveCallsNotInRoom(notInThisRoomId) {
    const callsNotInThatRoom = [];

    for (const [roomId, call] of this.calls.entries()) {
      if (roomId !== notInThisRoomId && call.state !== _call.CallState.Ended) {
        callsNotInThatRoom.push(call);
      }
    }

    return callsNotInThatRoom;
  }

  getTransfereeForCallId(callId
  /*: string*/
  )
  /*: MatrixCall*/
  {
    return this.transferees[callId];
  }

  play(audioId
  /*: AudioID*/
  ) {
    // TODO: Attach an invisible element for this instead
    // which listens?
    const audio = document.getElementById(audioId);

    if (audio) {
      const playAudio = async () => {
        try {
          // This still causes the chrome debugger to break on promise rejection if
          // the promise is rejected, even though we're catching the exception.
          await audio.play();
        } catch (e) {
          // This is usually because the user hasn't interacted with the document,
          // or chrome doesn't think so and is denying the request. Not sure what
          // we can really do here...
          // https://github.com/vector-im/element-web/issues/7657
          console.log("Unable to play audio clip", e);
        }
      };

      if (this.audioPromises.has(audioId)) {
        this.audioPromises.set(audioId, this.audioPromises.get(audioId).then(() => {
          audio.load();
          return playAudio();
        }));
      } else {
        this.audioPromises.set(audioId, playAudio());
      }
    }
  }

  pause(audioId
  /*: AudioID*/
  ) {
    // TODO: Attach an invisible element for this instead
    // which listens?
    const audio = document.getElementById(audioId);

    if (audio) {
      if (this.audioPromises.has(audioId)) {
        this.audioPromises.set(audioId, this.audioPromises.get(audioId).then(() => audio.pause()));
      } else {
        // pause doesn't return a promise, so just do it
        audio.pause();
      }
    }
  }

  matchesCallForThisRoom(call
  /*: MatrixCall*/
  ) {
    // We don't allow placing more than one call per room, but that doesn't mean there
    // can't be more than one, eg. in a glare situation. This checks that the given call
    // is the call we consider 'the' call for its room.
    const mappedRoomId = this.roomIdForCall(call);
    const callForThisRoom = this.getCallForRoom(mappedRoomId);
    return callForThisRoom && call.callId === callForThisRoom.callId;
  }

  setCallListeners(call
  /*: MatrixCall*/
  ) {
    let mappedRoomId = CallHandler.sharedInstance().roomIdForCall(call);
    call.on(_call.CallEvent.Error, (err
    /*: CallError*/
    ) => {
      if (!this.matchesCallForThisRoom(call)) return;

      _Analytics.default.trackEvent('voip', 'callError', 'error', err.toString());

      console.error("Call error:", err);

      if (err.code === _call.CallErrorCode.NoUserMedia) {
        this.showMediaCaptureError(call);
        return;
      }

      if (_MatrixClientPeg.MatrixClientPeg.get().getTurnServers().length === 0 && _SettingsStore.default.getValue("fallbackICEServerAllowed") === null) {
        this.showICEFallbackPrompt();
        return;
      }

      _Modal.default.createTrackedDialog('Call Failed', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)('Call Failed'),
        description: err.message
      });
    });
    call.on(_call.CallEvent.Hangup, () => {
      if (!this.matchesCallForThisRoom(call)) return;

      _Analytics.default.trackEvent('voip', 'callHangup');

      this.removeCallForRoom(mappedRoomId);
    });
    call.on(_call.CallEvent.State, (newState
    /*: CallState*/
    , oldState
    /*: CallState*/
    ) => {
      if (!this.matchesCallForThisRoom(call)) return;
      this.setCallState(call, newState);

      switch (oldState) {
        case _call.CallState.Ringing:
          this.pause(AudioID.Ring);
          break;

        case _call.CallState.InviteSent:
          this.pause(AudioID.Ringback);
          break;
      }

      switch (newState) {
        case _call.CallState.Ringing:
          this.play(AudioID.Ring);
          break;

        case _call.CallState.InviteSent:
          this.play(AudioID.Ringback);
          break;

        case _call.CallState.Ended:
          {
            _Analytics.default.trackEvent('voip', 'callEnded', 'hangupReason', call.hangupReason);

            this.removeCallForRoom(mappedRoomId);

            if (oldState === _call.CallState.InviteSent && (call.hangupParty === _call.CallParty.Remote || call.hangupParty === _call.CallParty.Local && call.hangupReason === _call.CallErrorCode.InviteTimeout)) {
              this.play(AudioID.Busy);
              let title;
              let description;

              if (call.hangupReason === _call.CallErrorCode.UserHangup) {
                title = (0, _languageHandler._t)("Call Declined");
                description = (0, _languageHandler._t)("The other party declined the call.");
              } else if (call.hangupReason === _call.CallErrorCode.InviteTimeout) {
                title = (0, _languageHandler._t)("Call Failed"); // XXX: full stop appended as some relic here, but these
                // strings need proper input from design anyway, so let's
                // not change this string until we have a proper one.

                description = (0, _languageHandler._t)('The remote side failed to pick up') + '.';
              } else {
                title = (0, _languageHandler._t)("Call Failed");
                description = (0, _languageHandler._t)("The call could not be established");
              }

              _Modal.default.createTrackedDialog('Call Handler', 'Call Failed', _ErrorDialog.default, {
                title,
                description
              });
            } else if (call.hangupReason === _call.CallErrorCode.AnsweredElsewhere && oldState === _call.CallState.Connecting) {
              _Modal.default.createTrackedDialog('Call Handler', 'Call Failed', _ErrorDialog.default, {
                title: (0, _languageHandler._t)("Answered Elsewhere"),
                description: (0, _languageHandler._t)("The call was answered on another device.")
              });
            } else if (oldState !== _call.CallState.Fledgling && oldState !== _call.CallState.Ringing) {
              // don't play the end-call sound for calls that never got off the ground
              this.play(AudioID.CallEnd);
            }

            this.logCallStats(call, mappedRoomId);
            break;
          }
      }
    });
    call.on(_call.CallEvent.Replaced, (newCall
    /*: MatrixCall*/
    ) => {
      if (!this.matchesCallForThisRoom(call)) return;
      console.log(`Call ID ${call.callId} is being replaced by call ID ${newCall.callId}`);

      if (call.state === _call.CallState.Ringing) {
        this.pause(AudioID.Ring);
      } else if (call.state === _call.CallState.InviteSent) {
        this.pause(AudioID.Ringback);
      }

      this.calls.set(mappedRoomId, newCall);
      this.setCallListeners(newCall);
      this.setCallState(newCall, newCall.state);
    });
    call.on(_call.CallEvent.AssertedIdentityChanged, async () => {
      if (!this.matchesCallForThisRoom(call)) return;
      console.log(`Call ID ${call.callId} got new asserted identity:`, call.getRemoteAssertedIdentity());
      const newAssertedIdentity = call.getRemoteAssertedIdentity().id;
      let newNativeAssertedIdentity = newAssertedIdentity;

      if (newAssertedIdentity) {
        const response = await this.sipNativeLookup(newAssertedIdentity);
        if (response.length) newNativeAssertedIdentity = response[0].userid;
      }

      console.log(`Asserted identity ${newAssertedIdentity} mapped to ${newNativeAssertedIdentity}`);

      if (newNativeAssertedIdentity) {
        this.assertedIdentityNativeUsers[call.callId] = newNativeAssertedIdentity; // If we don't already have a room with this user, make one. This will be slightly odd
        // if they called us because we'll be inviting them, but there's not much we can do about
        // this if we want the actual, native room to exist (which we do). This is why it's
        // important to only obey asserted identity in trusted environments, since anyone you're
        // on a call with can cause you to send a room invite to someone.

        await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), newNativeAssertedIdentity);
        const newMappedRoomId = this.roomIdForCall(call);
        console.log(`Old room ID: ${mappedRoomId}, new room ID: ${newMappedRoomId}`);

        if (newMappedRoomId !== mappedRoomId) {
          this.removeCallForRoom(mappedRoomId);
          mappedRoomId = newMappedRoomId;
          this.calls.set(mappedRoomId, call);

          _dispatcher.default.dispatch({
            action: _actions.Action.CallChangeRoom,
            call
          });
        }
      }
    });
  }

  async logCallStats(call
  /*: MatrixCall*/
  , mappedRoomId
  /*: string*/
  ) {
    const stats = await call.getCurrentCallStats();

    _logger.logger.debug(`Call completed. Call ID: ${call.callId}, virtual room ID: ${call.roomId}, ` + `user-facing room ID: ${mappedRoomId}, direction: ${call.direction}, ` + `our Party ID: ${call.ourPartyId}, hangup party: ${call.hangupParty}, ` + `hangup reason: ${call.hangupReason}`);

    if (!stats) {
      _logger.logger.debug("Call statistics are undefined. The call has " + "probably failed before a peerConn was established");

      return;
    }

    _logger.logger.debug("Local candidates:");

    for (const cand of stats.filter(item => item.type === 'local-candidate')) {
      const address = cand.address || cand.ip; // firefox uses 'address', chrome uses 'ip'

      _logger.logger.debug(`${cand.id} - type: ${cand.candidateType}, address: ${address}, port: ${cand.port}, ` + `protocol: ${cand.protocol}, relay protocol: ${cand.relayProtocol}, network type: ${cand.networkType}`);
    }

    _logger.logger.debug("Remote candidates:");

    for (const cand of stats.filter(item => item.type === 'remote-candidate')) {
      const address = cand.address || cand.ip; // firefox uses 'address', chrome uses 'ip'

      _logger.logger.debug(`${cand.id} - type: ${cand.candidateType}, address: ${address}, port: ${cand.port}, ` + `protocol: ${cand.protocol}`);
    }

    _logger.logger.debug("Candidate pairs:");

    for (const pair of stats.filter(item => item.type === 'candidate-pair')) {
      _logger.logger.debug(`${pair.localCandidateId} / ${pair.remoteCandidateId} - state: ${pair.state}, ` + `nominated: ${pair.nominated}, ` + `requests sent ${pair.requestsSent}, requests received  ${pair.requestsReceived},  ` + `responses received: ${pair.responsesReceived}, responses sent: ${pair.responsesSent}, ` + `bytes received: ${pair.bytesReceived}, bytes sent: ${pair.bytesSent}, `);
    }
  }

  setCallAudioElement(call
  /*: MatrixCall*/
  ) {
    const audioElement = getRemoteAudioElement();
    if (audioElement) call.setRemoteAudioElement(audioElement);
  }

  setCallState(call
  /*: MatrixCall*/
  , status
  /*: CallState*/
  ) {
    const mappedRoomId = CallHandler.sharedInstance().roomIdForCall(call);
    console.log(`Call state in ${mappedRoomId} changed to ${status}`);

    _dispatcher.default.dispatch({
      action: 'call_state',
      room_id: mappedRoomId,
      state: status
    });
  }

  removeCallForRoom(roomId
  /*: string*/
  ) {
    this.calls.delete(roomId);
  }

  showICEFallbackPrompt() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const code = sub => /*#__PURE__*/_react.default.createElement("code", null, sub);

    _Modal.default.createTrackedDialog('No TURN servers', '', _QuestionDialog.default, {
      title: (0, _languageHandler._t)("Call failed due to misconfigured server"),
      description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please ask the administrator of your homeserver " + "(<code>%(homeserverDomain)s</code>) to configure a TURN server in " + "order for calls to work reliably.", {
        homeserverDomain: cli.getDomain()
      }, {
        code
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Alternatively, you can try to use the public server at " + "<code>turn.matrix.org</code>, but this will not be as reliable, and " + "it will share your IP address with that server. You can also manage " + "this in Settings.", null, {
        code
      }))),
      button: (0, _languageHandler._t)('Try using turn.matrix.org'),
      cancelButton: (0, _languageHandler._t)('OK'),
      onFinished: allow => {
        _SettingsStore.default.setValue("fallbackICEServerAllowed", null, _SettingLevel.SettingLevel.DEVICE, allow);

        cli.setFallbackICEServerAllowed(allow);
      }
    }, null, true);
  }

  showMediaCaptureError(call
  /*: MatrixCall*/
  ) {
    let title;
    let description;

    if (call.type === _call.CallType.Voice) {
      title = (0, _languageHandler._t)("Unable to access microphone");
      description = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Call failed because microphone could not be accessed. " + "Check that a microphone is plugged in and set up correctly."));
    } else if (call.type === _call.CallType.Video) {
      title = (0, _languageHandler._t)("Unable to access webcam / microphone");
      description = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Call failed because webcam or microphone could not be accessed. Check that:"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("A microphone and webcam are plugged in and set up correctly")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Permission is granted to use the webcam")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("No other application is using the webcam"))));
    }

    _Modal.default.createTrackedDialog('Media capture failed', '', _ErrorDialog.default, {
      title,
      description
    }, null, true);
  }

  async placeCall(roomId
  /*: string*/
  , type
  /*: PlaceCallType*/
  , localElement
  /*: HTMLVideoElement*/
  , remoteElement
  /*: HTMLVideoElement*/
  , transferee
  /*: MatrixCall*/
  ) {
    _Analytics.default.trackEvent('voip', 'placeCall', 'type', type);

    _CountlyAnalytics.default.instance.trackStartCall(roomId, type === PlaceCallType.Video, false);

    const mappedRoomId = (await _VoipUserMapper.default.sharedInstance().getOrCreateVirtualRoomForRoom(roomId)) || roomId;

    _logger.logger.debug("Mapped real room " + roomId + " to room ID " + mappedRoomId);

    const timeUntilTurnCresExpire = _MatrixClientPeg.MatrixClientPeg.get().getTurnServersExpiry() - Date.now();
    console.log("Current turn creds expire in " + timeUntilTurnCresExpire + " ms");

    const call = _MatrixClientPeg.MatrixClientPeg.get().createCall(mappedRoomId);

    this.calls.set(roomId, call);

    if (transferee) {
      this.transferees[call.callId] = transferee;
    }

    this.setCallListeners(call);
    this.setCallAudioElement(call);
    this.setActiveCallRoomId(roomId);

    if (type === PlaceCallType.Voice) {
      call.placeVoiceCall();
    } else if (type === 'video') {
      call.placeVideoCall(remoteElement, localElement);
    } else if (type === PlaceCallType.ScreenSharing) {
      const screenCapErrorString = _PlatformPeg.default.get().screenCaptureErrorString();

      if (screenCapErrorString) {
        this.removeCallForRoom(roomId);
        console.log("Can't capture screen: " + screenCapErrorString);

        _Modal.default.createTrackedDialog('Call Handler', 'Unable to capture screen', _ErrorDialog.default, {
          title: (0, _languageHandler._t)('Unable to capture screen'),
          description: screenCapErrorString
        });

        return;
      }

      call.placeScreenSharingCall(remoteElement, localElement, async () =>
      /*: Promise<DesktopCapturerSource>*/
      {
        const {
          finished
        } = _Modal.default.createDialog(_DesktopCapturerSourcePicker.default);

        const [source] = await finished;
        return source;
      });
    } else {
      console.error("Unknown conf call type: " + type);
    }
  }

  setActiveCallRoomId(activeCallRoomId
  /*: string*/
  ) {
    _logger.logger.info("Setting call in room " + activeCallRoomId + " active");

    for (const [roomId, call] of this.calls.entries()) {
      if (call.state === _call.CallState.Ended) continue;

      if (roomId === activeCallRoomId) {
        call.setRemoteOnHold(false);
      } else {
        _logger.logger.info("Holding call in room " + roomId + " because another call is being set active");

        call.setRemoteOnHold(true);
      }
    }
  }
  /**
   * @returns true if we are currently in any call where we haven't put the remote party on hold
   */


  hasAnyUnheldCall() {
    for (const call of this.calls.values()) {
      if (call.state === _call.CallState.Ended) continue;
      if (!call.isRemoteOnHold()) return true;
    }

    return false;
  }

  async startCallApp(roomId
  /*: string*/
  , type
  /*: string*/
  ) {
    _dispatcher.default.dispatch({
      action: 'appsDrawer',
      show: true
    }); // prevent double clicking the call button


    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    const currentJitsiWidgets = _WidgetUtils.default.getRoomWidgetsOfType(room, _WidgetType.WidgetType.JITSI);

    const hasJitsi = currentJitsiWidgets.length > 0 || _WidgetEchoStore.default.roomHasPendingWidgetsOfType(roomId, currentJitsiWidgets, _WidgetType.WidgetType.JITSI);

    if (hasJitsi) {
      _Modal.default.createTrackedDialog('Call already in progress', '', _ErrorDialog.default, {
        title: (0, _languageHandler._t)('Call in Progress'),
        description: (0, _languageHandler._t)('A call is currently being placed!')
      });

      return;
    }

    const jitsiDomain = _Jitsi.Jitsi.getInstance().preferredDomain;

    const jitsiAuth = await _Jitsi.Jitsi.getInstance().getJitsiAuth();
    let confId;

    if (jitsiAuth === 'openidtoken-jwt') {
      // Create conference ID from room ID
      // For compatibility with Jitsi, use base32 without padding.
      // More details here:
      // https://github.com/matrix-org/prosody-mod-auth-matrix-user-verification
      confId = _rfc.base32.stringify(Buffer.from(roomId), {
        pad: false
      });
    } else {
      // Create a random conference ID
      const random = (0, _randomstring.randomUppercaseString)(1) + (0, _randomstring.randomLowercaseString)(23);
      confId = 'Jitsi' + random;
    }

    let widgetUrl = _WidgetUtils.default.getLocalJitsiWrapperUrl({
      auth: jitsiAuth
    }); // TODO: Remove URL hacks when the mobile clients eventually support v2 widgets


    const parsedUrl = new URL(widgetUrl);
    parsedUrl.search = ''; // set to empty string to make the URL class use searchParams instead

    parsedUrl.searchParams.set('confId', confId);
    widgetUrl = parsedUrl.toString();
    const widgetData = {
      conferenceId: confId,
      isAudioOnly: type === 'voice',
      domain: jitsiDomain,
      auth: jitsiAuth,
      roomName: room.name
    };
    const widgetId = 'jitsi_' + _MatrixClientPeg.MatrixClientPeg.get().credentials.userId + '_' + Date.now();

    _WidgetUtils.default.setRoomWidget(roomId, widgetId, _WidgetType.WidgetType.JITSI, widgetUrl, 'Jitsi', widgetData).then(() => {
      console.log('Jitsi widget added');
    }).catch(e => {
      if (e.errcode === 'M_FORBIDDEN') {
        _Modal.default.createTrackedDialog('Call Failed', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)('Permission Required'),
          description: (0, _languageHandler._t)("You do not have permission to start a conference call in this room")
        });
      }

      console.error(e);
    });
  }

  terminateCallApp(roomId
  /*: string*/
  ) {
    _Modal.default.createTrackedDialog('Confirm Jitsi Terminate', '', _QuestionDialog.default, {
      hasCancelButton: true,
      title: (0, _languageHandler._t)("End conference"),
      description: (0, _languageHandler._t)("This will end the conference for everyone. Continue?"),
      button: (0, _languageHandler._t)("End conference"),
      onFinished: proceed => {
        if (!proceed) return; // We'll just obliterate them all. There should only ever be one, but might as well
        // be safe.

        const roomInfo = _WidgetStore.default.instance.getRoom(roomId);

        const jitsiWidgets = roomInfo.widgets.filter(w => _WidgetType.WidgetType.JITSI.matches(w.type));
        jitsiWidgets.forEach(w => {
          // setting invalid content removes it
          _WidgetUtils.default.setRoomWidget(roomId, w.id);
        });
      }
    });
  }

  hangupCallApp(roomId
  /*: string*/
  ) {
    const roomInfo = _WidgetStore.default.instance.getRoom(roomId);

    if (!roomInfo) return; // "should never happen" clauses go here

    const jitsiWidgets = roomInfo.widgets.filter(w => _WidgetType.WidgetType.JITSI.matches(w.type));
    jitsiWidgets.forEach(w => {
      const messaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessagingForId(w.id);

      if (!messaging) return; // more "should never happen" words

      messaging.transport.send(_ElementWidgetActions.ElementWidgetActions.HangupCall, {});
    });
  }

}

exports.default = CallHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DYWxsSGFuZGxlci50c3giXSwibmFtZXMiOlsiUFJPVE9DT0xfUFNUTiIsIlBST1RPQ09MX1BTVE5fUFJFRklYRUQiLCJQUk9UT0NPTF9TSVBfTkFUSVZFIiwiUFJPVE9DT0xfU0lQX1ZJUlRVQUwiLCJDSEVDS19QUk9UT0NPTFNfQVRURU1QVFMiLCJWSVJUVUFMX1JPT01fRVZFTlRfVFlQRSIsIkF1ZGlvSUQiLCJQbGFjZUNhbGxUeXBlIiwiZ2V0UmVtb3RlQXVkaW9FbGVtZW50IiwicmVtb3RlQXVkaW9FbGVtZW50IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNvbnNvbGUiLCJlcnJvciIsIkNhbGxIYW5kbGVyIiwiTWFwIiwiY2FsbCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwicGF5bG9hZCIsInJvb21faWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJzdXBwb3J0c1ZvaXAiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJnZXRBbGxBY3RpdmVDYWxscyIsImxlbmd0aCIsInJvb20iLCJnZXRSb29tIiwiZ2V0Q2FsbEZvclJvb20iLCJyb29tSWQiLCJtZW1iZXJzIiwiZ2V0Sm9pbmVkTWVtYmVycyIsImluZm8iLCJ0eXBlIiwicGxhY2VDYWxsIiwibG9jYWxfZWxlbWVudCIsInJlbW90ZV9lbGVtZW50IiwidHJhbnNmZXJlZSIsIkFuYWx5dGljcyIsInRyYWNrRXZlbnQiLCJDb3VudGx5QW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJ0cmFja1N0YXJ0Q2FsbCIsIlZpZGVvIiwic3RhcnRDYWxsQXBwIiwidGVybWluYXRlQ2FsbEFwcCIsImhhbmd1cENhbGxBcHAiLCJtYXBwZWRSb29tSWQiLCJzaGFyZWRJbnN0YW5jZSIsInJvb21JZEZvckNhbGwiLCJjYWxscyIsInNldCIsInNldENhbGxMaXN0ZW5lcnMiLCJjbGkiLCJwcmVwYXJlVG9FbmNyeXB0IiwicmVqZWN0IiwiaGFuZ3VwIiwiQ2FsbEVycm9yQ29kZSIsIlVzZXJIYW5ndXAiLCJ2YWx1ZXMiLCJoYXMiLCJhbnN3ZXIiLCJzZXRDYWxsQXVkaW9FbGVtZW50Iiwic2V0QWN0aXZlQ2FsbFJvb21JZCIsInRyYWNrSm9pbkNhbGwiLCJDYWxsVHlwZSIsIndpbmRvdyIsIm14Q2FsbEhhbmRsZXIiLCJ2b2lwQ29uZmlnIiwiU2RrQ29uZmlnIiwib2JleUFzc2VydGVkSWRlbnRpdHkiLCJuYXRpdmVVc2VyIiwiYXNzZXJ0ZWRJZGVudGl0eU5hdGl2ZVVzZXJzIiwiY2FsbElkIiwiVm9pcFVzZXJNYXBwZXIiLCJuYXRpdmVSb29tRm9yVmlydHVhbFJvb20iLCJzdGFydCIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwibmF2aWdhdG9yIiwibWVkaWFTZXNzaW9uIiwic2V0QWN0aW9uSGFuZGxlciIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIlZvaXAiLCJvbiIsIm9uQ2FsbEluY29taW5nIiwiY2hlY2tQcm90b2NvbHMiLCJzdG9wIiwicmVtb3ZlTGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwibWF4VHJpZXMiLCJwcm90b2NvbHMiLCJnZXRUaGlyZHBhcnR5UHJvdG9jb2xzIiwidW5kZWZpbmVkIiwic3VwcG9ydHNQc3RuUHJvdG9jb2wiLCJCb29sZWFuIiwicHN0blN1cHBvcnRQcmVmaXhlZCIsIkFjdGlvbiIsIlBzdG5TdXBwb3J0VXBkYXRlZCIsInN1cHBvcnRzU2lwTmF0aXZlVmlydHVhbCIsIlZpcnR1YWxSb29tU3VwcG9ydFVwZGF0ZWQiLCJlIiwibG9nIiwicHN0blN1cHBvcnRDaGVja1RpbWVyIiwic2V0VGltZW91dCIsImdldFN1cHBvcnRzUHN0blByb3RvY29sIiwiZ2V0U3VwcG9ydHNWaXJ0dWFsUm9vbXMiLCJwc3RuTG9va3VwIiwicGhvbmVOdW1iZXIiLCJnZXRUaGlyZHBhcnR5VXNlciIsInNpcFZpcnR1YWxMb29rdXAiLCJuYXRpdmVNeGlkIiwic2lwTmF0aXZlTG9va3VwIiwidmlydHVhbE14aWQiLCJnZXRBbnlBY3RpdmVDYWxsIiwic3RhdGUiLCJDYWxsU3RhdGUiLCJFbmRlZCIsImFjdGl2ZUNhbGxzIiwiUmluZ2luZyIsInB1c2giLCJnZXRBbGxBY3RpdmVDYWxsc05vdEluUm9vbSIsIm5vdEluVGhpc1Jvb21JZCIsImNhbGxzTm90SW5UaGF0Um9vbSIsImVudHJpZXMiLCJnZXRUcmFuc2ZlcmVlRm9yQ2FsbElkIiwidHJhbnNmZXJlZXMiLCJwbGF5IiwiYXVkaW9JZCIsImF1ZGlvIiwicGxheUF1ZGlvIiwiYXVkaW9Qcm9taXNlcyIsInRoZW4iLCJsb2FkIiwicGF1c2UiLCJtYXRjaGVzQ2FsbEZvclRoaXNSb29tIiwiY2FsbEZvclRoaXNSb29tIiwiQ2FsbEV2ZW50IiwiRXJyb3IiLCJlcnIiLCJ0b1N0cmluZyIsImNvZGUiLCJOb1VzZXJNZWRpYSIsInNob3dNZWRpYUNhcHR1cmVFcnJvciIsImdldFR1cm5TZXJ2ZXJzIiwic2hvd0lDRUZhbGxiYWNrUHJvbXB0IiwibWVzc2FnZSIsIkhhbmd1cCIsInJlbW92ZUNhbGxGb3JSb29tIiwiU3RhdGUiLCJuZXdTdGF0ZSIsIm9sZFN0YXRlIiwic2V0Q2FsbFN0YXRlIiwiUmluZyIsIkludml0ZVNlbnQiLCJSaW5nYmFjayIsImhhbmd1cFJlYXNvbiIsImhhbmd1cFBhcnR5IiwiQ2FsbFBhcnR5IiwiUmVtb3RlIiwiTG9jYWwiLCJJbnZpdGVUaW1lb3V0IiwiQnVzeSIsIkFuc3dlcmVkRWxzZXdoZXJlIiwiQ29ubmVjdGluZyIsIkZsZWRnbGluZyIsIkNhbGxFbmQiLCJsb2dDYWxsU3RhdHMiLCJSZXBsYWNlZCIsIm5ld0NhbGwiLCJBc3NlcnRlZElkZW50aXR5Q2hhbmdlZCIsImdldFJlbW90ZUFzc2VydGVkSWRlbnRpdHkiLCJuZXdBc3NlcnRlZElkZW50aXR5IiwiaWQiLCJuZXdOYXRpdmVBc3NlcnRlZElkZW50aXR5IiwicmVzcG9uc2UiLCJ1c2VyaWQiLCJuZXdNYXBwZWRSb29tSWQiLCJDYWxsQ2hhbmdlUm9vbSIsInN0YXRzIiwiZ2V0Q3VycmVudENhbGxTdGF0cyIsImxvZ2dlciIsImRlYnVnIiwiZGlyZWN0aW9uIiwib3VyUGFydHlJZCIsImNhbmQiLCJmaWx0ZXIiLCJpdGVtIiwiYWRkcmVzcyIsImlwIiwiY2FuZGlkYXRlVHlwZSIsInBvcnQiLCJwcm90b2NvbCIsInJlbGF5UHJvdG9jb2wiLCJuZXR3b3JrVHlwZSIsInBhaXIiLCJsb2NhbENhbmRpZGF0ZUlkIiwicmVtb3RlQ2FuZGlkYXRlSWQiLCJub21pbmF0ZWQiLCJyZXF1ZXN0c1NlbnQiLCJyZXF1ZXN0c1JlY2VpdmVkIiwicmVzcG9uc2VzUmVjZWl2ZWQiLCJyZXNwb25zZXNTZW50IiwiYnl0ZXNSZWNlaXZlZCIsImJ5dGVzU2VudCIsImF1ZGlvRWxlbWVudCIsInNldFJlbW90ZUF1ZGlvRWxlbWVudCIsInN0YXR1cyIsImRlbGV0ZSIsInN1YiIsIlF1ZXN0aW9uRGlhbG9nIiwiaG9tZXNlcnZlckRvbWFpbiIsImdldERvbWFpbiIsImJ1dHRvbiIsImNhbmNlbEJ1dHRvbiIsIm9uRmluaXNoZWQiLCJhbGxvdyIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwic2V0RmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkIiwiVm9pY2UiLCJsb2NhbEVsZW1lbnQiLCJyZW1vdGVFbGVtZW50IiwiZ2V0T3JDcmVhdGVWaXJ0dWFsUm9vbUZvclJvb20iLCJ0aW1lVW50aWxUdXJuQ3Jlc0V4cGlyZSIsImdldFR1cm5TZXJ2ZXJzRXhwaXJ5IiwiRGF0ZSIsIm5vdyIsImNyZWF0ZUNhbGwiLCJwbGFjZVZvaWNlQ2FsbCIsInBsYWNlVmlkZW9DYWxsIiwiU2NyZWVuU2hhcmluZyIsInNjcmVlbkNhcEVycm9yU3RyaW5nIiwiUGxhdGZvcm1QZWciLCJzY3JlZW5DYXB0dXJlRXJyb3JTdHJpbmciLCJwbGFjZVNjcmVlblNoYXJpbmdDYWxsIiwiZmluaXNoZWQiLCJjcmVhdGVEaWFsb2ciLCJEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIiLCJzb3VyY2UiLCJhY3RpdmVDYWxsUm9vbUlkIiwic2V0UmVtb3RlT25Ib2xkIiwiaGFzQW55VW5oZWxkQ2FsbCIsImlzUmVtb3RlT25Ib2xkIiwic2hvdyIsImN1cnJlbnRKaXRzaVdpZGdldHMiLCJXaWRnZXRVdGlscyIsImdldFJvb21XaWRnZXRzT2ZUeXBlIiwiV2lkZ2V0VHlwZSIsIkpJVFNJIiwiaGFzSml0c2kiLCJXaWRnZXRFY2hvU3RvcmUiLCJyb29tSGFzUGVuZGluZ1dpZGdldHNPZlR5cGUiLCJqaXRzaURvbWFpbiIsIkppdHNpIiwiZ2V0SW5zdGFuY2UiLCJwcmVmZXJyZWREb21haW4iLCJqaXRzaUF1dGgiLCJnZXRKaXRzaUF1dGgiLCJjb25mSWQiLCJiYXNlMzIiLCJzdHJpbmdpZnkiLCJCdWZmZXIiLCJmcm9tIiwicGFkIiwicmFuZG9tIiwid2lkZ2V0VXJsIiwiZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwiLCJhdXRoIiwicGFyc2VkVXJsIiwiVVJMIiwic2VhcmNoIiwic2VhcmNoUGFyYW1zIiwid2lkZ2V0RGF0YSIsImNvbmZlcmVuY2VJZCIsImlzQXVkaW9Pbmx5IiwiZG9tYWluIiwicm9vbU5hbWUiLCJuYW1lIiwid2lkZ2V0SWQiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsInNldFJvb21XaWRnZXQiLCJjYXRjaCIsImVycmNvZGUiLCJoYXNDYW5jZWxCdXR0b24iLCJwcm9jZWVkIiwicm9vbUluZm8iLCJXaWRnZXRTdG9yZSIsImppdHNpV2lkZ2V0cyIsIndpZGdldHMiLCJ3IiwibWF0Y2hlcyIsImZvckVhY2giLCJtZXNzYWdpbmciLCJXaWRnZXRNZXNzYWdpbmdTdG9yZSIsImdldE1lc3NhZ2luZ0ZvcklkIiwidHJhbnNwb3J0Iiwic2VuZCIsIkVsZW1lbnRXaWRnZXRBY3Rpb25zIiwiSGFuZ3VwQ2FsbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUF1REE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7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cUJGLENBQUMsSUFBSTtBQUN0QixZQUFNRyxTQUFTLEdBQUdDLDJDQUFxQmxRLFFBQXJCLENBQThCbVEsaUJBQTlCLENBQWdETCxDQUFDLENBQUN2SCxFQUFsRCxDQUFsQjs7QUFDQSxVQUFJLENBQUMwSCxTQUFMLEVBQWdCLE9BRk0sQ0FFRTs7QUFFeEJBLE1BQUFBLFNBQVMsQ0FBQ0csU0FBVixDQUFvQkMsSUFBcEIsQ0FBeUJDLDJDQUFxQkMsVUFBOUMsRUFBMEQsRUFBMUQ7QUFDSCxLQUxEO0FBTUg7O0FBLzFCNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qXG4gKiBNYW5hZ2VzIGEgbGlzdCBvZiBhbGwgdGhlIGN1cnJlbnRseSBhY3RpdmUgY2FsbHMuXG4gKlxuICogVGhpcyBoYW5kbGVyIGRpc3BhdGNoZXMgd2hlbiB2b2lwIGNhbGxzIGFyZSBhZGRlZC91cGRhdGVkL3JlbW92ZWQgZnJvbSB0aGlzIGxpc3Q6XG4gKiB7XG4gKiAgIGFjdGlvbjogJ2NhbGxfc3RhdGUnXG4gKiAgIHJvb21faWQ6IDxyb29tIElEIG9mIHRoZSBjYWxsPlxuICogfVxuICpcbiAqIFRvIGtub3cgdGhlIHN0YXRlIG9mIHRoZSBjYWxsLCB0aGlzIGhhbmRsZXIgZXhwb3NlcyBhIGdldHRlciB0b1xuICogb2J0YWluIHRoZSBjYWxsIGZvciBhIHJvb206XG4gKiAgIHZhciBjYWxsID0gQ2FsbEhhbmRsZXIuZ2V0Q2FsbChyb29tSWQpXG4gKiAgIHZhciBzdGF0ZSA9IGNhbGwuY2FsbF9zdGF0ZTsgLy8gcmluZ2luZ3xyaW5nYmFja3xjb25uZWN0ZWR8ZW5kZWR8YnVzeXxzdG9wX3JpbmdiYWNrfHN0b3BfcmluZ2luZ1xuICpcbiAqIFRoaXMgaGFuZGxlciBsaXN0ZW5zIGZvciBhbmQgaGFuZGxlcyB0aGUgZm9sbG93aW5nIGFjdGlvbnM6XG4gKiB7XG4gKiAgIGFjdGlvbjogJ3BsYWNlX2NhbGwnLFxuICogICB0eXBlOiAndm9pY2V8dmlkZW8nLFxuICogICByb29tX2lkOiA8cm9vbSB0aGF0IHRoZSBwbGFjZSBjYWxsIGJ1dHRvbiB3YXMgcHJlc3NlZCBpbj5cbiAqIH1cbiAqXG4gKiB7XG4gKiAgIGFjdGlvbjogJ2luY29taW5nX2NhbGwnXG4gKiAgIGNhbGw6IE1hdHJpeENhbGxcbiAqIH1cbiAqXG4gKiB7XG4gKiAgIGFjdGlvbjogJ2hhbmd1cCdcbiAqICAgcm9vbV9pZDogPHJvb20gdGhhdCB0aGUgaGFuZ3VwIGJ1dHRvbiB3YXMgcHJlc3NlZCBpbj5cbiAqIH1cbiAqXG4gKiB7XG4gKiAgIGFjdGlvbjogJ2Fuc3dlcidcbiAqICAgcm9vbV9pZDogPHJvb20gdGhhdCB0aGUgYW5zd2VyIGJ1dHRvbiB3YXMgcHJlc3NlZCBpbj5cbiAqIH1cbiAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4vUGxhdGZvcm1QZWcnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBXaWRnZXRVdGlscyBmcm9tICcuL3V0aWxzL1dpZGdldFV0aWxzJztcbmltcG9ydCBXaWRnZXRFY2hvU3RvcmUgZnJvbSAnLi9zdG9yZXMvV2lkZ2V0RWNob1N0b3JlJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5pbXBvcnQge0ppdHNpfSBmcm9tIFwiLi93aWRnZXRzL0ppdHNpXCI7XG5pbXBvcnQge1dpZGdldFR5cGV9IGZyb20gXCIuL3dpZGdldHMvV2lkZ2V0VHlwZVwiO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7YmFzZTMyfSBmcm9tIFwicmZjNDY0OFwiO1xuXG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgV2lkZ2V0U3RvcmUgZnJvbSBcIi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5pbXBvcnQgeyBXaWRnZXRNZXNzYWdpbmdTdG9yZSB9IGZyb20gXCIuL3N0b3Jlcy93aWRnZXRzL1dpZGdldE1lc3NhZ2luZ1N0b3JlXCI7XG5pbXBvcnQgeyBFbGVtZW50V2lkZ2V0QWN0aW9ucyB9IGZyb20gXCIuL3N0b3Jlcy93aWRnZXRzL0VsZW1lbnRXaWRnZXRBY3Rpb25zXCI7XG5pbXBvcnQgeyBNYXRyaXhDYWxsLCBDYWxsRXJyb3JDb2RlLCBDYWxsU3RhdGUsIENhbGxFdmVudCwgQ2FsbFBhcnR5LCBDYWxsVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbFwiO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuL0FuYWx5dGljcyc7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgeyBDYWxsRXJyb3IgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGxcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlcic7XG5pbXBvcnQgRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyXCJcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4vZGlzcGF0Y2hlci9hY3Rpb25zJztcbmltcG9ydCBWb2lwVXNlck1hcHBlciBmcm9tICcuL1ZvaXBVc2VyTWFwcGVyJztcbmltcG9ydCB7IGFkZE1hbmFnZWRIeWJyaWRXaWRnZXQsIGlzTWFuYWdlZEh5YnJpZFdpZGdldEVuYWJsZWQgfSBmcm9tICcuL3dpZGdldHMvTWFuYWdlZEh5YnJpZCc7XG5pbXBvcnQgeyByYW5kb21VcHBlcmNhc2VTdHJpbmcsIHJhbmRvbUxvd2VyY2FzZVN0cmluZyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9yYW5kb21zdHJpbmdcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi9TZGtDb25maWcnO1xuaW1wb3J0IHsgZW5zdXJlRE1FeGlzdHMsIGZpbmRETUZvclVzZXIgfSBmcm9tICcuL2NyZWF0ZVJvb20nO1xuXG5leHBvcnQgY29uc3QgUFJPVE9DT0xfUFNUTiA9ICdtLnByb3RvY29sLnBzdG4nO1xuZXhwb3J0IGNvbnN0IFBST1RPQ09MX1BTVE5fUFJFRklYRUQgPSAnaW0udmVjdG9yLnByb3RvY29sLnBzdG4nO1xuZXhwb3J0IGNvbnN0IFBST1RPQ09MX1NJUF9OQVRJVkUgPSAnaW0udmVjdG9yLnByb3RvY29sLnNpcF9uYXRpdmUnO1xuZXhwb3J0IGNvbnN0IFBST1RPQ09MX1NJUF9WSVJUVUFMID0gJ2ltLnZlY3Rvci5wcm90b2NvbC5zaXBfdmlydHVhbCc7XG5cbmNvbnN0IENIRUNLX1BST1RPQ09MU19BVFRFTVBUUyA9IDM7XG4vLyBFdmVudCB0eXBlIGZvciByb29tIGFjY291bnQgZGF0YSBhbmQgcm9vbSBjcmVhdGlvbiBjb250ZW50IHVzZWQgdG8gbWFyayByb29tcyBhcyB2aXJ0dWFsIHJvb21zXG4vLyAoYW5kIHN0b3JlIHRoZSBJRCBvZiB0aGVpciBuYXRpdmUgcm9vbSlcbmV4cG9ydCBjb25zdCBWSVJUVUFMX1JPT01fRVZFTlRfVFlQRSA9ICdpbS52ZWN0b3IuaXNfdmlydHVhbF9yb29tJztcblxuZW51bSBBdWRpb0lEIHtcbiAgICBSaW5nID0gJ3JpbmdBdWRpbycsXG4gICAgUmluZ2JhY2sgPSAncmluZ2JhY2tBdWRpbycsXG4gICAgQ2FsbEVuZCA9ICdjYWxsZW5kQXVkaW8nLFxuICAgIEJ1c3kgPSAnYnVzeUF1ZGlvJyxcbn1cblxuaW50ZXJmYWNlIFRoaXJkcGFydHlMb29rdXBSZXNwb25zZUZpZWxkcyB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5cbiAgICAvLyBpbS52ZWN0b3Iuc2lwX25hdGl2ZVxuICAgIHZpcnR1YWxfbXhpZD86IHN0cmluZztcbiAgICBpc192aXJ0dWFsPzogYm9vbGVhbjtcblxuICAgIC8vIGltLnZlY3Rvci5zaXBfdmlydHVhbFxuICAgIG5hdGl2ZV9teGlkPzogc3RyaW5nO1xuICAgIGlzX25hdGl2ZT86IGJvb2xlYW47XG5cbiAgICAvLyBjb21tb25cbiAgICBsb29rdXBfc3VjY2Vzcz86IGJvb2xlYW47XG5cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGNhbWVsY2FzZSAqL1xufVxuXG5pbnRlcmZhY2UgVGhpcmRwYXJ0eUxvb2t1cFJlc3BvbnNlIHtcbiAgICB1c2VyaWQ6IHN0cmluZyxcbiAgICBwcm90b2NvbDogc3RyaW5nLFxuICAgIGZpZWxkczogVGhpcmRwYXJ0eUxvb2t1cFJlc3BvbnNlRmllbGRzLFxufVxuXG4vLyBVbmxpa2UgJ0NhbGxUeXBlJyBpbiBqcy1zZGssIHRoaXMgb25lIGluY2x1ZGVzIHNjcmVlbiBzaGFyaW5nXG4vLyAoYmVjYXVzZSBhIHNjcmVlbiBzaGFyaW5nIGNhbGwgaXMgb25seSBhIHNjcmVlbiBzaGFyaW5nIGNhbGwgdG8gdGhlIGNhbGxlcixcbi8vIHRvIHRoZSBjYWxsZWUgaXQncyBqdXN0IGEgdmlkZW8gY2FsbCwgYXQgbGVhc3QgYXMgZmFyIGFzIHRoZSBjdXJyZW50IGltcGxcbi8vIGlzIGNvbmNlcm5lZCkuXG5leHBvcnQgZW51bSBQbGFjZUNhbGxUeXBlIHtcbiAgICBWb2ljZSA9ICd2b2ljZScsXG4gICAgVmlkZW8gPSAndmlkZW8nLFxuICAgIFNjcmVlblNoYXJpbmcgPSAnc2NyZWVuc2hhcmluZycsXG59XG5cbmZ1bmN0aW9uIGdldFJlbW90ZUF1ZGlvRWxlbWVudCgpOiBIVE1MQXVkaW9FbGVtZW50IHtcbiAgICAvLyB0aGlzIG5lZWRzIHRvIGJlIHNvbWV3aGVyZSBhdCB0aGUgdG9wIG9mIHRoZSBET00gd2hpY2hcbiAgICAvLyBhbHdheXMgZXhpc3RzIHRvIGF2b2lkIGF1ZGlvIGludGVycnVwdGlvbnMuXG4gICAgLy8gTWlnaHQgYXMgd2VsbCBqdXN0IHVzZSBET00uXG4gICAgY29uc3QgcmVtb3RlQXVkaW9FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZW1vdGVBdWRpb1wiKSBhcyBIVE1MQXVkaW9FbGVtZW50O1xuICAgIGlmICghcmVtb3RlQXVkaW9FbGVtZW50KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICBcIkZhaWxlZCB0byBmaW5kIHJlbW90ZUF1ZGlvIGVsZW1lbnQgLSBjYW5ub3QgcGxheSBhdWRpbyFcIiArXG4gICAgICAgICAgICBcIllvdSBuZWVkIHRvIGFkZCBhbiA8YXVkaW8vPiB0byB0aGUgRE9NLlwiLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHJlbW90ZUF1ZGlvRWxlbWVudDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FsbEhhbmRsZXIge1xuICAgIHByaXZhdGUgY2FsbHMgPSBuZXcgTWFwPHN0cmluZywgTWF0cml4Q2FsbD4oKTsgLy8gcm9vbUlkIC0+IGNhbGxcbiAgICAvLyBDYWxscyBzdGFydGVkIGFzIGFuIGF0dGVuZGVkIHRyYW5zZmVyLCBpZS4gd2l0aCB0aGUgaW50ZW50aW9uIG9mIHRyYW5zZmVycmluZyBhbm90aGVyXG4gICAgLy8gY2FsbCB3aXRoIGEgZGlmZmVyZW50IHBhcnR5IHRvIHRoaXMgb25lLlxuICAgIHByaXZhdGUgdHJhbnNmZXJlZXMgPSBuZXcgTWFwPHN0cmluZywgTWF0cml4Q2FsbD4oKTsgLy8gY2FsbElkICh0YXJnZXQpIC0+IGNhbGwgKHRyYW5zZmVyZWUpXG4gICAgcHJpdmF0ZSBhdWRpb1Byb21pc2VzID0gbmV3IE1hcDxBdWRpb0lELCBQcm9taXNlPHZvaWQ+PigpO1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nID0gbnVsbDtcbiAgICBwcml2YXRlIHN1cHBvcnRzUHN0blByb3RvY29sID0gbnVsbDtcbiAgICBwcml2YXRlIHBzdG5TdXBwb3J0UHJlZml4ZWQgPSBudWxsOyAvLyBUcnVlIGlmIHRoZSBzZXJ2ZXIgb25seSBzdXBwb3J0IHRoZSBwcmVmaXhlZCBwc3RuIHByb3RvY29sXG4gICAgcHJpdmF0ZSBzdXBwb3J0c1NpcE5hdGl2ZVZpcnR1YWwgPSBudWxsOyAvLyBpbS52ZWN0b3IucHJvdG9jb2wuc2lwX3ZpcnR1YWwgYW5kIGltLnZlY3Rvci5wcm90b2NvbC5zaXBfbmF0aXZlXG4gICAgcHJpdmF0ZSBwc3RuU3VwcG9ydENoZWNrVGltZXI6IE5vZGVKUy5UaW1lb3V0OyAvLyBudW1iZXIgYWN0dWFsbHkgYmVjYXVzZSB3ZSdyZSBpbiB0aGUgYnJvd3NlclxuICAgIC8vIEZvciByb29tcyB3ZSd2ZSBiZWVuIGludml0ZWQgdG8sIHRydWUgaWYgdGhleSdyZSBmcm9tIHZpcnR1YWwgdXNlciwgZmFsc2UgaWYgd2UndmUgY2hlY2tlZCBhbmQgdGhleSBhcmVuJ3QuXG4gICAgcHJpdmF0ZSBpbnZpdGVkUm9vbXNBcmVWaXJ0dWFsID0gbmV3IE1hcDxzdHJpbmcsIGJvb2xlYW4+KCk7XG4gICAgcHJpdmF0ZSBpbnZpdGVkUm9vbUNoZWNrSW5Qcm9ncmVzcyA9IGZhbHNlO1xuXG4gICAgLy8gTWFwIG9mIHRoZSBhc3NlcnRlZCBpZGVudGl0eSB1c2VycyBhZnRlciB3ZSd2ZSBsb29rZWQgdGhlbSB1cCB1c2luZyB0aGUgQVBJLlxuICAgIC8vIFdlIG5lZWQgdG8gYmUgYmUgYWJsZSB0byBkZXRlcm1pbmUgdGhlIG1hcHBlZCByb29tIHN5bmNocm9ub3VzbHksIHNvIHdlXG4gICAgLy8gZG8gdGhlIGFzeW5jIGxvb2t1cCB3aGVuIHdlIGdldCBuZXcgaW5mb3JtYXRpb24gYW5kIHRoZW4gc3RvcmUgdGhlc2UgbWFwcGluZ3MgaGVyZVxuICAgIHByaXZhdGUgYXNzZXJ0ZWRJZGVudGl0eU5hdGl2ZVVzZXJzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgIHN0YXRpYyBzaGFyZWRJbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cubXhDYWxsSGFuZGxlcikge1xuICAgICAgICAgICAgd2luZG93Lm14Q2FsbEhhbmRsZXIgPSBuZXcgQ2FsbEhhbmRsZXIoKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdpbmRvdy5teENhbGxIYW5kbGVyO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogR2V0cyB0aGUgdXNlci1mYWNpbmcgcm9vbSBhc3NvY2lhdGVkIHdpdGggYSBjYWxsIChjYWxsLnJvb21JZCBtYXkgYmUgdGhlIGNhbGwgXCJ2aXJ0dWFsIHJvb21cIlxuICAgICAqIGlmIGEgdm9pcF9teGlkX3RyYW5zbGF0ZV9wYXR0ZXJuIGlzIHNldCBpbiB0aGUgY29uZmlnKVxuICAgICAqL1xuICAgIHB1YmxpYyByb29tSWRGb3JDYWxsKGNhbGw6IE1hdHJpeENhbGwpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIWNhbGwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHZvaXBDb25maWcgPSBTZGtDb25maWcuZ2V0KClbJ3ZvaXAnXTtcblxuICAgICAgICBpZiAodm9pcENvbmZpZyAmJiB2b2lwQ29uZmlnLm9iZXlBc3NlcnRlZElkZW50aXR5KSB7XG4gICAgICAgICAgICBjb25zdCBuYXRpdmVVc2VyID0gdGhpcy5hc3NlcnRlZElkZW50aXR5TmF0aXZlVXNlcnNbY2FsbC5jYWxsSWRdO1xuICAgICAgICAgICAgaWYgKG5hdGl2ZVVzZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gZmluZERNRm9yVXNlcihNYXRyaXhDbGllbnRQZWcuZ2V0KCksIG5hdGl2ZVVzZXIpO1xuICAgICAgICAgICAgICAgIGlmIChyb29tKSByZXR1cm4gcm9vbS5yb29tSWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBWb2lwVXNlck1hcHBlci5zaGFyZWRJbnN0YW5jZSgpLm5hdGl2ZVJvb21Gb3JWaXJ0dWFsUm9vbShjYWxsLnJvb21JZCkgfHwgY2FsbC5yb29tSWQ7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgLy8gYWRkIGVtcHR5IGhhbmRsZXJzIGZvciBtZWRpYSBhY3Rpb25zLCBvdGhlcndpc2UgdGhlIG1lZGlhIGtleXNcbiAgICAgICAgLy8gZW5kIHVwIGNhdXNpbmcgdGhlIGF1ZGlvIGVsZW1lbnRzIHdpdGggb3VyIHJpbmcvcmluZ2JhY2sgZXRjXG4gICAgICAgIC8vIGF1ZGlvIGNsaXBzIGluIHRvIHBsYXkuXG4gICAgICAgIGlmIChuYXZpZ2F0b3IubWVkaWFTZXNzaW9uKSB7XG4gICAgICAgICAgICBuYXZpZ2F0b3IubWVkaWFTZXNzaW9uLnNldEFjdGlvbkhhbmRsZXIoJ3BsYXknLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcigncGF1c2UnLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcignc2Vla2JhY2t3YXJkJywgZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgICAgICBuYXZpZ2F0b3IubWVkaWFTZXNzaW9uLnNldEFjdGlvbkhhbmRsZXIoJ3NlZWtmb3J3YXJkJywgZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgICAgICBuYXZpZ2F0b3IubWVkaWFTZXNzaW9uLnNldEFjdGlvbkhhbmRsZXIoJ3ByZXZpb3VzdHJhY2snLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcignbmV4dHRyYWNrJywgZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuVm9pcCkpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignQ2FsbC5pbmNvbWluZycsIHRoaXMub25DYWxsSW5jb21pbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGVja1Byb3RvY29scyhDSEVDS19QUk9UT0NPTFNfQVRURU1QVFMpO1xuICAgIH1cblxuICAgIHN0b3AoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaSkge1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKCdDYWxsLmluY29taW5nJywgdGhpcy5vbkNhbGxJbmNvbWluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlclJlZiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNoZWNrUHJvdG9jb2xzKG1heFRyaWVzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcm90b2NvbHMgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhpcmRwYXJ0eVByb3RvY29scygpO1xuXG4gICAgICAgICAgICBpZiAocHJvdG9jb2xzW1BST1RPQ09MX1BTVE5dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sID0gQm9vbGVhbihwcm90b2NvbHNbUFJPVE9DT0xfUFNUTl0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sKSB0aGlzLnBzdG5TdXBwb3J0UHJlZml4ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvdG9jb2xzW1BST1RPQ09MX1BTVE5fUFJFRklYRURdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sID0gQm9vbGVhbihwcm90b2NvbHNbUFJPVE9DT0xfUFNUTl9QUkVGSVhFRF0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sKSB0aGlzLnBzdG5TdXBwb3J0UHJlZml4ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IEFjdGlvbi5Qc3RuU3VwcG9ydFVwZGF0ZWR9KTtcblxuICAgICAgICAgICAgaWYgKHByb3RvY29sc1tQUk9UT0NPTF9TSVBfTkFUSVZFXSAhPT0gdW5kZWZpbmVkICYmIHByb3RvY29sc1tQUk9UT0NPTF9TSVBfVklSVFVBTF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VwcG9ydHNTaXBOYXRpdmVWaXJ0dWFsID0gQm9vbGVhbihcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2xzW1BST1RPQ09MX1NJUF9OQVRJVkVdICYmIHByb3RvY29sc1tQUk9UT0NPTF9TSVBfVklSVFVBTF0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IEFjdGlvbi5WaXJ0dWFsUm9vbVN1cHBvcnRVcGRhdGVkfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChtYXhUcmllcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGNoZWNrIGZvciBwcm90b2NvbCBzdXBwb3J0IGFuZCBubyByZXRyaWVzIHJlbWFpbjogYXNzdW1pbmcgbm8gc3VwcG9ydFwiLCBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsZWQgdG8gY2hlY2sgZm9yIHByb3RvY29sIHN1cHBvcnQ6IHdpbGwgcmV0cnlcIiwgZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wc3RuU3VwcG9ydENoZWNrVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1Byb3RvY29scyhtYXhUcmllcyAtIDEpO1xuICAgICAgICAgICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTdXBwb3J0c1BzdG5Qcm90b2NvbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3VwcG9ydHNQc3RuUHJvdG9jb2w7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFN1cHBvcnRzVmlydHVhbFJvb21zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdXBwb3J0c1BzdG5Qcm90b2NvbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHN0bkxvb2t1cChwaG9uZU51bWJlcjogc3RyaW5nKTogUHJvbWlzZTxUaGlyZHBhcnR5TG9va3VwUmVzcG9uc2VbXT4ge1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFRoaXJkcGFydHlVc2VyKFxuICAgICAgICAgICAgdGhpcy5wc3RuU3VwcG9ydFByZWZpeGVkID8gUFJPVE9DT0xfUFNUTl9QUkVGSVhFRCA6IFBST1RPQ09MX1BTVE4sIHtcbiAgICAgICAgICAgICAgICAnbS5pZC5waG9uZSc6IHBob25lTnVtYmVyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2lwVmlydHVhbExvb2t1cChuYXRpdmVNeGlkOiBzdHJpbmcpOiBQcm9taXNlPFRoaXJkcGFydHlMb29rdXBSZXNwb25zZVtdPiB7XG4gICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhpcmRwYXJ0eVVzZXIoXG4gICAgICAgICAgICBQUk9UT0NPTF9TSVBfVklSVFVBTCwge1xuICAgICAgICAgICAgICAgICduYXRpdmVfbXhpZCc6IG5hdGl2ZU14aWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzaXBOYXRpdmVMb29rdXAodmlydHVhbE14aWQ6IHN0cmluZyk6IFByb21pc2U8VGhpcmRwYXJ0eUxvb2t1cFJlc3BvbnNlW10+IHtcbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUaGlyZHBhcnR5VXNlcihcbiAgICAgICAgICAgIFBST1RPQ09MX1NJUF9OQVRJVkUsIHtcbiAgICAgICAgICAgICAgICAndmlydHVhbF9teGlkJzogdmlydHVhbE14aWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DYWxsSW5jb21pbmcgPSAoY2FsbCkgPT4ge1xuICAgICAgICAvLyB3ZSBkaXNwYXRjaCB0aGlzIHN5bmNocm9ub3VzbHkgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGV2ZW50XG4gICAgICAgIC8vIGhhbmRsZXJzIG9uIHRoZSBjYWxsIGFyZSBzZXQgdXAgaW1tZWRpYXRlbHkgKHNvIHRoYXQgaWZcbiAgICAgICAgLy8gd2UgZ2V0IGFuIGltbWVkaWF0ZSBoYW5ndXAsIHdlIGRvbid0IGdldCBhIHN0dWNrIGNhbGwpXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdpbmNvbWluZ19jYWxsJyxcbiAgICAgICAgICAgIGNhbGw6IGNhbGwsXG4gICAgICAgIH0sIHRydWUpO1xuICAgIH1cblxuICAgIGdldENhbGxGb3JSb29tKHJvb21JZDogc3RyaW5nKTogTWF0cml4Q2FsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxzLmdldChyb29tSWQpIHx8IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0QW55QWN0aXZlQ2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBjYWxsIG9mIHRoaXMuY2FsbHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChjYWxsLnN0YXRlICE9PSBDYWxsU3RhdGUuRW5kZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRBbGxBY3RpdmVDYWxscygpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlQ2FsbHMgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNhbGwgb2YgdGhpcy5jYWxscy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgaWYgKGNhbGwuc3RhdGUgIT09IENhbGxTdGF0ZS5FbmRlZCAmJiBjYWxsLnN0YXRlICE9PSBDYWxsU3RhdGUuUmluZ2luZykge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUNhbGxzLnB1c2goY2FsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNhbGxzO1xuICAgIH1cblxuICAgIGdldEFsbEFjdGl2ZUNhbGxzTm90SW5Sb29tKG5vdEluVGhpc1Jvb21JZCkge1xuICAgICAgICBjb25zdCBjYWxsc05vdEluVGhhdFJvb20gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtyb29tSWQsIGNhbGxdIG9mIHRoaXMuY2FsbHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICBpZiAocm9vbUlkICE9PSBub3RJblRoaXNSb29tSWQgJiYgY2FsbC5zdGF0ZSAhPT0gQ2FsbFN0YXRlLkVuZGVkKSB7XG4gICAgICAgICAgICAgICAgY2FsbHNOb3RJblRoYXRSb29tLnB1c2goY2FsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxzTm90SW5UaGF0Um9vbTtcbiAgICB9XG5cbiAgICBnZXRUcmFuc2ZlcmVlRm9yQ2FsbElkKGNhbGxJZDogc3RyaW5nKTogTWF0cml4Q2FsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zZmVyZWVzW2NhbGxJZF07XG4gICAgfVxuXG4gICAgcGxheShhdWRpb0lkOiBBdWRpb0lEKSB7XG4gICAgICAgIC8vIFRPRE86IEF0dGFjaCBhbiBpbnZpc2libGUgZWxlbWVudCBmb3IgdGhpcyBpbnN0ZWFkXG4gICAgICAgIC8vIHdoaWNoIGxpc3RlbnM/XG4gICAgICAgIGNvbnN0IGF1ZGlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXVkaW9JZCkgYXMgSFRNTE1lZGlhRWxlbWVudDtcbiAgICAgICAgaWYgKGF1ZGlvKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5QXVkaW8gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBzdGlsbCBjYXVzZXMgdGhlIGNocm9tZSBkZWJ1Z2dlciB0byBicmVhayBvbiBwcm9taXNlIHJlamVjdGlvbiBpZlxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCwgZXZlbiB0aG91Z2ggd2UncmUgY2F0Y2hpbmcgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYXVkaW8ucGxheSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB1c3VhbGx5IGJlY2F1c2UgdGhlIHVzZXIgaGFzbid0IGludGVyYWN0ZWQgd2l0aCB0aGUgZG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIC8vIG9yIGNocm9tZSBkb2Vzbid0IHRoaW5rIHNvIGFuZCBpcyBkZW55aW5nIHRoZSByZXF1ZXN0LiBOb3Qgc3VyZSB3aGF0XG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGNhbiByZWFsbHkgZG8gaGVyZS4uLlxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy83NjU3XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5hYmxlIHRvIHBsYXkgYXVkaW8gY2xpcFwiLCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuYXVkaW9Qcm9taXNlcy5oYXMoYXVkaW9JZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUHJvbWlzZXMuc2V0KGF1ZGlvSWQsIHRoaXMuYXVkaW9Qcm9taXNlcy5nZXQoYXVkaW9JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLmxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBsYXlBdWRpbygpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1Byb21pc2VzLnNldChhdWRpb0lkLCBwbGF5QXVkaW8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYXVzZShhdWRpb0lkOiBBdWRpb0lEKSB7XG4gICAgICAgIC8vIFRPRE86IEF0dGFjaCBhbiBpbnZpc2libGUgZWxlbWVudCBmb3IgdGhpcyBpbnN0ZWFkXG4gICAgICAgIC8vIHdoaWNoIGxpc3RlbnM/XG4gICAgICAgIGNvbnN0IGF1ZGlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXVkaW9JZCkgYXMgSFRNTE1lZGlhRWxlbWVudDtcbiAgICAgICAgaWYgKGF1ZGlvKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdWRpb1Byb21pc2VzLmhhcyhhdWRpb0lkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9Qcm9taXNlcy5zZXQoYXVkaW9JZCwgdGhpcy5hdWRpb1Byb21pc2VzLmdldChhdWRpb0lkKS50aGVuKCgpID0+IGF1ZGlvLnBhdXNlKCkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcGF1c2UgZG9lc24ndCByZXR1cm4gYSBwcm9taXNlLCBzbyBqdXN0IGRvIGl0XG4gICAgICAgICAgICAgICAgYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbWF0Y2hlc0NhbGxGb3JUaGlzUm9vbShjYWxsOiBNYXRyaXhDYWxsKSB7XG4gICAgICAgIC8vIFdlIGRvbid0IGFsbG93IHBsYWNpbmcgbW9yZSB0aGFuIG9uZSBjYWxsIHBlciByb29tLCBidXQgdGhhdCBkb2Vzbid0IG1lYW4gdGhlcmVcbiAgICAgICAgLy8gY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSwgZWcuIGluIGEgZ2xhcmUgc2l0dWF0aW9uLiBUaGlzIGNoZWNrcyB0aGF0IHRoZSBnaXZlbiBjYWxsXG4gICAgICAgIC8vIGlzIHRoZSBjYWxsIHdlIGNvbnNpZGVyICd0aGUnIGNhbGwgZm9yIGl0cyByb29tLlxuICAgICAgICBjb25zdCBtYXBwZWRSb29tSWQgPSB0aGlzLnJvb21JZEZvckNhbGwoY2FsbCk7XG5cbiAgICAgICAgY29uc3QgY2FsbEZvclRoaXNSb29tID0gdGhpcy5nZXRDYWxsRm9yUm9vbShtYXBwZWRSb29tSWQpO1xuICAgICAgICByZXR1cm4gY2FsbEZvclRoaXNSb29tICYmIGNhbGwuY2FsbElkID09PSBjYWxsRm9yVGhpc1Jvb20uY2FsbElkO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0Q2FsbExpc3RlbmVycyhjYWxsOiBNYXRyaXhDYWxsKSB7XG4gICAgICAgIGxldCBtYXBwZWRSb29tSWQgPSBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLnJvb21JZEZvckNhbGwoY2FsbCk7XG5cbiAgICAgICAgY2FsbC5vbihDYWxsRXZlbnQuRXJyb3IsIChlcnI6IENhbGxFcnJvcikgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ3ZvaXAnLCAnY2FsbEVycm9yJywgJ2Vycm9yJywgZXJyLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNhbGwgZXJyb3I6XCIsIGVycik7XG5cbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gQ2FsbEVycm9yQ29kZS5Ob1VzZXJNZWRpYSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lZGlhQ2FwdHVyZUVycm9yKGNhbGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUdXJuU2VydmVycygpLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIikgPT09IG51bGxcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0lDRUZhbGxiYWNrUHJvbXB0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnQ2FsbCBGYWlsZWQnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50Lkhhbmd1cCwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ3ZvaXAnLCAnY2FsbEhhbmd1cCcpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNhbGxGb3JSb29tKG1hcHBlZFJvb21JZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjYWxsLm9uKENhbGxFdmVudC5TdGF0ZSwgKG5ld1N0YXRlOiBDYWxsU3RhdGUsIG9sZFN0YXRlOiBDYWxsU3RhdGUpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXRjaGVzQ2FsbEZvclRoaXNSb29tKGNhbGwpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuc2V0Q2FsbFN0YXRlKGNhbGwsIG5ld1N0YXRlKTtcblxuICAgICAgICAgICAgc3dpdGNoIChvbGRTdGF0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgQ2FsbFN0YXRlLlJpbmdpbmc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF1c2UoQXVkaW9JRC5SaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBDYWxsU3RhdGUuSW52aXRlU2VudDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXVzZShBdWRpb0lELlJpbmdiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAobmV3U3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIENhbGxTdGF0ZS5SaW5naW5nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoQXVkaW9JRC5SaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBDYWxsU3RhdGUuSW52aXRlU2VudDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KEF1ZGlvSUQuUmluZ2JhY2spO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIENhbGxTdGF0ZS5FbmRlZDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCd2b2lwJywgJ2NhbGxFbmRlZCcsICdoYW5ndXBSZWFzb24nLCBjYWxsLmhhbmd1cFJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2FsbEZvclJvb20obWFwcGVkUm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZFN0YXRlID09PSBDYWxsU3RhdGUuSW52aXRlU2VudCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsLmhhbmd1cFBhcnR5ID09PSBDYWxsUGFydHkuUmVtb3RlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoY2FsbC5oYW5ndXBQYXJ0eSA9PT0gQ2FsbFBhcnR5LkxvY2FsICYmIGNhbGwuaGFuZ3VwUmVhc29uID09PSBDYWxsRXJyb3JDb2RlLkludml0ZVRpbWVvdXQpXG4gICAgICAgICAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShBdWRpb0lELkJ1c3kpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGwuaGFuZ3VwUmVhc29uID09PSBDYWxsRXJyb3JDb2RlLlVzZXJIYW5ndXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiQ2FsbCBEZWNsaW5lZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiVGhlIG90aGVyIHBhcnR5IGRlY2xpbmVkIHRoZSBjYWxsLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FsbC5oYW5ndXBSZWFzb24gPT09IENhbGxFcnJvckNvZGUuSW52aXRlVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJDYWxsIEZhaWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBYWFg6IGZ1bGwgc3RvcCBhcHBlbmRlZCBhcyBzb21lIHJlbGljIGhlcmUsIGJ1dCB0aGVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZ3MgbmVlZCBwcm9wZXIgaW5wdXQgZnJvbSBkZXNpZ24gYW55d2F5LCBzbyBsZXQnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBjaGFuZ2UgdGhpcyBzdHJpbmcgdW50aWwgd2UgaGF2ZSBhIHByb3BlciBvbmUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdCgnVGhlIHJlbW90ZSBzaWRlIGZhaWxlZCB0byBwaWNrIHVwJykgKyAnLic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJDYWxsIEZhaWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiVGhlIGNhbGwgY291bGQgbm90IGJlIGVzdGFibGlzaGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEhhbmRsZXInLCAnQ2FsbCBGYWlsZWQnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLCBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbC5oYW5ndXBSZWFzb24gPT09IENhbGxFcnJvckNvZGUuQW5zd2VyZWRFbHNld2hlcmUgJiYgb2xkU3RhdGUgPT09IENhbGxTdGF0ZS5Db25uZWN0aW5nXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBIYW5kbGVyJywgJ0NhbGwgRmFpbGVkJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJBbnN3ZXJlZCBFbHNld2hlcmVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVGhlIGNhbGwgd2FzIGFuc3dlcmVkIG9uIGFub3RoZXIgZGV2aWNlLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9sZFN0YXRlICE9PSBDYWxsU3RhdGUuRmxlZGdsaW5nICYmIG9sZFN0YXRlICE9PSBDYWxsU3RhdGUuUmluZ2luZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgcGxheSB0aGUgZW5kLWNhbGwgc291bmQgZm9yIGNhbGxzIHRoYXQgbmV2ZXIgZ290IG9mZiB0aGUgZ3JvdW5kXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoQXVkaW9JRC5DYWxsRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nQ2FsbFN0YXRzKGNhbGwsIG1hcHBlZFJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50LlJlcGxhY2VkLCAobmV3Q2FsbDogTWF0cml4Q2FsbCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYENhbGwgSUQgJHtjYWxsLmNhbGxJZH0gaXMgYmVpbmcgcmVwbGFjZWQgYnkgY2FsbCBJRCAke25ld0NhbGwuY2FsbElkfWApO1xuXG4gICAgICAgICAgICBpZiAoY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLlJpbmdpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlKEF1ZGlvSUQuUmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNhbGwuc3RhdGUgPT09IENhbGxTdGF0ZS5JbnZpdGVTZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXVzZShBdWRpb0lELlJpbmdiYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jYWxscy5zZXQobWFwcGVkUm9vbUlkLCBuZXdDYWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q2FsbExpc3RlbmVycyhuZXdDYWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q2FsbFN0YXRlKG5ld0NhbGwsIG5ld0NhbGwuc3RhdGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FsbC5vbihDYWxsRXZlbnQuQXNzZXJ0ZWRJZGVudGl0eUNoYW5nZWQsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXRjaGVzQ2FsbEZvclRoaXNSb29tKGNhbGwpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDYWxsIElEICR7Y2FsbC5jYWxsSWR9IGdvdCBuZXcgYXNzZXJ0ZWQgaWRlbnRpdHk6YCwgY2FsbC5nZXRSZW1vdGVBc3NlcnRlZElkZW50aXR5KCkpO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdBc3NlcnRlZElkZW50aXR5ID0gY2FsbC5nZXRSZW1vdGVBc3NlcnRlZElkZW50aXR5KCkuaWQ7XG4gICAgICAgICAgICBsZXQgbmV3TmF0aXZlQXNzZXJ0ZWRJZGVudGl0eSA9IG5ld0Fzc2VydGVkSWRlbnRpdHk7XG4gICAgICAgICAgICBpZiAobmV3QXNzZXJ0ZWRJZGVudGl0eSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5zaXBOYXRpdmVMb29rdXAobmV3QXNzZXJ0ZWRJZGVudGl0eSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCkgbmV3TmF0aXZlQXNzZXJ0ZWRJZGVudGl0eSA9IHJlc3BvbnNlWzBdLnVzZXJpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBc3NlcnRlZCBpZGVudGl0eSAke25ld0Fzc2VydGVkSWRlbnRpdHl9IG1hcHBlZCB0byAke25ld05hdGl2ZUFzc2VydGVkSWRlbnRpdHl9YCk7XG5cbiAgICAgICAgICAgIGlmIChuZXdOYXRpdmVBc3NlcnRlZElkZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnRlZElkZW50aXR5TmF0aXZlVXNlcnNbY2FsbC5jYWxsSWRdID0gbmV3TmF0aXZlQXNzZXJ0ZWRJZGVudGl0eTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGFscmVhZHkgaGF2ZSBhIHJvb20gd2l0aCB0aGlzIHVzZXIsIG1ha2Ugb25lLiBUaGlzIHdpbGwgYmUgc2xpZ2h0bHkgb2RkXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhleSBjYWxsZWQgdXMgYmVjYXVzZSB3ZSdsbCBiZSBpbnZpdGluZyB0aGVtLCBidXQgdGhlcmUncyBub3QgbXVjaCB3ZSBjYW4gZG8gYWJvdXRcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlmIHdlIHdhbnQgdGhlIGFjdHVhbCwgbmF0aXZlIHJvb20gdG8gZXhpc3QgKHdoaWNoIHdlIGRvKS4gVGhpcyBpcyB3aHkgaXQnc1xuICAgICAgICAgICAgICAgIC8vIGltcG9ydGFudCB0byBvbmx5IG9iZXkgYXNzZXJ0ZWQgaWRlbnRpdHkgaW4gdHJ1c3RlZCBlbnZpcm9ubWVudHMsIHNpbmNlIGFueW9uZSB5b3UncmVcbiAgICAgICAgICAgICAgICAvLyBvbiBhIGNhbGwgd2l0aCBjYW4gY2F1c2UgeW91IHRvIHNlbmQgYSByb29tIGludml0ZSB0byBzb21lb25lLlxuICAgICAgICAgICAgICAgIGF3YWl0IGVuc3VyZURNRXhpc3RzKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgbmV3TmF0aXZlQXNzZXJ0ZWRJZGVudGl0eSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdNYXBwZWRSb29tSWQgPSB0aGlzLnJvb21JZEZvckNhbGwoY2FsbCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE9sZCByb29tIElEOiAke21hcHBlZFJvb21JZH0sIG5ldyByb29tIElEOiAke25ld01hcHBlZFJvb21JZH1gKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3TWFwcGVkUm9vbUlkICE9PSBtYXBwZWRSb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVDYWxsRm9yUm9vbShtYXBwZWRSb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBtYXBwZWRSb29tSWQgPSBuZXdNYXBwZWRSb29tSWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbHMuc2V0KG1hcHBlZFJvb21JZCwgY2FsbCk7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5DYWxsQ2hhbmdlUm9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2dDYWxsU3RhdHMoY2FsbDogTWF0cml4Q2FsbCwgbWFwcGVkUm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBjYWxsLmdldEN1cnJlbnRDYWxsU3RhdHMoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgYENhbGwgY29tcGxldGVkLiBDYWxsIElEOiAke2NhbGwuY2FsbElkfSwgdmlydHVhbCByb29tIElEOiAke2NhbGwucm9vbUlkfSwgYCArXG4gICAgICAgICAgICBgdXNlci1mYWNpbmcgcm9vbSBJRDogJHttYXBwZWRSb29tSWR9LCBkaXJlY3Rpb246ICR7Y2FsbC5kaXJlY3Rpb259LCBgICtcbiAgICAgICAgICAgIGBvdXIgUGFydHkgSUQ6ICR7Y2FsbC5vdXJQYXJ0eUlkfSwgaGFuZ3VwIHBhcnR5OiAke2NhbGwuaGFuZ3VwUGFydHl9LCBgICtcbiAgICAgICAgICAgIGBoYW5ndXAgcmVhc29uOiAke2NhbGwuaGFuZ3VwUmVhc29ufWAsXG4gICAgICAgICk7XG4gICAgICAgIGlmICghc3RhdHMpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBcIkNhbGwgc3RhdGlzdGljcyBhcmUgdW5kZWZpbmVkLiBUaGUgY2FsbCBoYXMgXCIgK1xuICAgICAgICAgICAgICAgIFwicHJvYmFibHkgZmFpbGVkIGJlZm9yZSBhIHBlZXJDb25uIHdhcyBlc3RhYmxpc2hlZFwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsb2dnZXIuZGVidWcoXCJMb2NhbCBjYW5kaWRhdGVzOlwiKTtcbiAgICAgICAgZm9yIChjb25zdCBjYW5kIG9mIHN0YXRzLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ2xvY2FsLWNhbmRpZGF0ZScpKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gY2FuZC5hZGRyZXNzIHx8IGNhbmQuaXA7IC8vIGZpcmVmb3ggdXNlcyAnYWRkcmVzcycsIGNocm9tZSB1c2VzICdpcCdcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBgJHtjYW5kLmlkfSAtIHR5cGU6ICR7Y2FuZC5jYW5kaWRhdGVUeXBlfSwgYWRkcmVzczogJHthZGRyZXNzfSwgcG9ydDogJHtjYW5kLnBvcnR9LCBgICtcbiAgICAgICAgICAgICAgICBgcHJvdG9jb2w6ICR7Y2FuZC5wcm90b2NvbH0sIHJlbGF5IHByb3RvY29sOiAke2NhbmQucmVsYXlQcm90b2NvbH0sIG5ldHdvcmsgdHlwZTogJHtjYW5kLm5ldHdvcmtUeXBlfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIlJlbW90ZSBjYW5kaWRhdGVzOlwiKTtcbiAgICAgICAgZm9yIChjb25zdCBjYW5kIG9mIHN0YXRzLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ3JlbW90ZS1jYW5kaWRhdGUnKSkge1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IGNhbmQuYWRkcmVzcyB8fCBjYW5kLmlwOyAvLyBmaXJlZm94IHVzZXMgJ2FkZHJlc3MnLCBjaHJvbWUgdXNlcyAnaXAnXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgICAgICAgYCR7Y2FuZC5pZH0gLSB0eXBlOiAke2NhbmQuY2FuZGlkYXRlVHlwZX0sIGFkZHJlc3M6ICR7YWRkcmVzc30sIHBvcnQ6ICR7Y2FuZC5wb3J0fSwgYCArXG4gICAgICAgICAgICAgICAgYHByb3RvY29sOiAke2NhbmQucHJvdG9jb2x9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiQ2FuZGlkYXRlIHBhaXJzOlwiKTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHN0YXRzLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ2NhbmRpZGF0ZS1wYWlyJykpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBgJHtwYWlyLmxvY2FsQ2FuZGlkYXRlSWR9IC8gJHtwYWlyLnJlbW90ZUNhbmRpZGF0ZUlkfSAtIHN0YXRlOiAke3BhaXIuc3RhdGV9LCBgICtcbiAgICAgICAgICAgICAgICBgbm9taW5hdGVkOiAke3BhaXIubm9taW5hdGVkfSwgYCArXG4gICAgICAgICAgICAgICAgYHJlcXVlc3RzIHNlbnQgJHtwYWlyLnJlcXVlc3RzU2VudH0sIHJlcXVlc3RzIHJlY2VpdmVkICAke3BhaXIucmVxdWVzdHNSZWNlaXZlZH0sICBgICtcbiAgICAgICAgICAgICAgICBgcmVzcG9uc2VzIHJlY2VpdmVkOiAke3BhaXIucmVzcG9uc2VzUmVjZWl2ZWR9LCByZXNwb25zZXMgc2VudDogJHtwYWlyLnJlc3BvbnNlc1NlbnR9LCBgICtcbiAgICAgICAgICAgICAgICBgYnl0ZXMgcmVjZWl2ZWQ6ICR7cGFpci5ieXRlc1JlY2VpdmVkfSwgYnl0ZXMgc2VudDogJHtwYWlyLmJ5dGVzU2VudH0sIGAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDYWxsQXVkaW9FbGVtZW50KGNhbGw6IE1hdHJpeENhbGwpIHtcbiAgICAgICAgY29uc3QgYXVkaW9FbGVtZW50ID0gZ2V0UmVtb3RlQXVkaW9FbGVtZW50KCk7XG4gICAgICAgIGlmIChhdWRpb0VsZW1lbnQpIGNhbGwuc2V0UmVtb3RlQXVkaW9FbGVtZW50KGF1ZGlvRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRDYWxsU3RhdGUoY2FsbDogTWF0cml4Q2FsbCwgc3RhdHVzOiBDYWxsU3RhdGUpIHtcbiAgICAgICAgY29uc3QgbWFwcGVkUm9vbUlkID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5yb29tSWRGb3JDYWxsKGNhbGwpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgYENhbGwgc3RhdGUgaW4gJHttYXBwZWRSb29tSWR9IGNoYW5nZWQgdG8gJHtzdGF0dXN9YCxcbiAgICAgICAgKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnY2FsbF9zdGF0ZScsXG4gICAgICAgICAgICByb29tX2lkOiBtYXBwZWRSb29tSWQsXG4gICAgICAgICAgICBzdGF0ZTogc3RhdHVzLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZUNhbGxGb3JSb29tKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY2FsbHMuZGVsZXRlKHJvb21JZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93SUNFRmFsbGJhY2tQcm9tcHQoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgY29kZSA9IHN1YiA9PiA8Y29kZT57c3VifTwvY29kZT47XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ05vIFRVUk4gc2VydmVycycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiQ2FsbCBmYWlsZWQgZHVlIHRvIG1pc2NvbmZpZ3VyZWQgc2VydmVyXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSBhc2sgdGhlIGFkbWluaXN0cmF0b3Igb2YgeW91ciBob21lc2VydmVyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCIoPGNvZGU+JShob21lc2VydmVyRG9tYWluKXM8L2NvZGU+KSB0byBjb25maWd1cmUgYSBUVVJOIHNlcnZlciBpbiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwib3JkZXIgZm9yIGNhbGxzIHRvIHdvcmsgcmVsaWFibHkuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaG9tZXNlcnZlckRvbWFpbjogY2xpLmdldERvbWFpbigpIH0sIHsgY29kZSB9LFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2ZWx5LCB5b3UgY2FuIHRyeSB0byB1c2UgdGhlIHB1YmxpYyBzZXJ2ZXIgYXQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxjb2RlPnR1cm4ubWF0cml4Lm9yZzwvY29kZT4sIGJ1dCB0aGlzIHdpbGwgbm90IGJlIGFzIHJlbGlhYmxlLCBhbmQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIml0IHdpbGwgc2hhcmUgeW91ciBJUCBhZGRyZXNzIHdpdGggdGhhdCBzZXJ2ZXIuIFlvdSBjYW4gYWxzbyBtYW5hZ2UgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInRoaXMgaW4gU2V0dGluZ3MuXCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsIHsgY29kZSB9LFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgYnV0dG9uOiBfdCgnVHJ5IHVzaW5nIHR1cm4ubWF0cml4Lm9yZycpLFxuICAgICAgICAgICAgY2FuY2VsQnV0dG9uOiBfdCgnT0snKSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChhbGxvdykgPT4ge1xuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgYWxsb3cpO1xuICAgICAgICAgICAgICAgIGNsaS5zZXRGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQoYWxsb3cpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93TWVkaWFDYXB0dXJlRXJyb3IoY2FsbDogTWF0cml4Q2FsbCkge1xuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbjtcblxuICAgICAgICBpZiAoY2FsbC50eXBlID09PSBDYWxsVHlwZS5Wb2ljZSkge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlVuYWJsZSB0byBhY2Nlc3MgbWljcm9waG9uZVwiKTtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gPGRpdj5cbiAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQ2FsbCBmYWlsZWQgYmVjYXVzZSBtaWNyb3Bob25lIGNvdWxkIG5vdCBiZSBhY2Nlc3NlZC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIkNoZWNrIHRoYXQgYSBtaWNyb3Bob25lIGlzIHBsdWdnZWQgaW4gYW5kIHNldCB1cCBjb3JyZWN0bHkuXCIsXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmIChjYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiVW5hYmxlIHRvIGFjY2VzcyB3ZWJjYW0gLyBtaWNyb3Bob25lXCIpO1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIHtfdChcIkNhbGwgZmFpbGVkIGJlY2F1c2Ugd2ViY2FtIG9yIG1pY3JvcGhvbmUgY291bGQgbm90IGJlIGFjY2Vzc2VkLiBDaGVjayB0aGF0OlwiKX1cbiAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJBIG1pY3JvcGhvbmUgYW5kIHdlYmNhbSBhcmUgcGx1Z2dlZCBpbiBhbmQgc2V0IHVwIGNvcnJlY3RseVwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiUGVybWlzc2lvbiBpcyBncmFudGVkIHRvIHVzZSB0aGUgd2ViY2FtXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJObyBvdGhlciBhcHBsaWNhdGlvbiBpcyB1c2luZyB0aGUgd2ViY2FtXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ01lZGlhIGNhcHR1cmUgZmFpbGVkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZSwgZGVzY3JpcHRpb24sXG4gICAgICAgIH0sIG51bGwsIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcGxhY2VDYWxsKFxuICAgICAgICByb29tSWQ6IHN0cmluZywgdHlwZTogUGxhY2VDYWxsVHlwZSxcbiAgICAgICAgbG9jYWxFbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50LCByZW1vdGVFbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50LFxuICAgICAgICB0cmFuc2ZlcmVlOiBNYXRyaXhDYWxsLFxuICAgICkge1xuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgndm9pcCcsICdwbGFjZUNhbGwnLCAndHlwZScsIHR5cGUpO1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrU3RhcnRDYWxsKHJvb21JZCwgdHlwZSA9PT0gUGxhY2VDYWxsVHlwZS5WaWRlbywgZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IG1hcHBlZFJvb21JZCA9IChhd2FpdCBWb2lwVXNlck1hcHBlci5zaGFyZWRJbnN0YW5jZSgpLmdldE9yQ3JlYXRlVmlydHVhbFJvb21Gb3JSb29tKHJvb21JZCkpIHx8IHJvb21JZDtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiTWFwcGVkIHJlYWwgcm9vbSBcIiArIHJvb21JZCArIFwiIHRvIHJvb20gSUQgXCIgKyBtYXBwZWRSb29tSWQpO1xuXG4gICAgICAgIGNvbnN0IHRpbWVVbnRpbFR1cm5DcmVzRXhwaXJlID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFR1cm5TZXJ2ZXJzRXhwaXJ5KCkgLSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgdHVybiBjcmVkcyBleHBpcmUgaW4gXCIgKyB0aW1lVW50aWxUdXJuQ3Jlc0V4cGlyZSArIFwiIG1zXCIpO1xuICAgICAgICBjb25zdCBjYWxsID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWF0ZUNhbGwobWFwcGVkUm9vbUlkKTtcblxuICAgICAgICB0aGlzLmNhbGxzLnNldChyb29tSWQsIGNhbGwpO1xuICAgICAgICBpZiAodHJhbnNmZXJlZSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2ZlcmVlc1tjYWxsLmNhbGxJZF0gPSB0cmFuc2ZlcmVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRDYWxsTGlzdGVuZXJzKGNhbGwpO1xuICAgICAgICB0aGlzLnNldENhbGxBdWRpb0VsZW1lbnQoY2FsbCk7XG5cbiAgICAgICAgdGhpcy5zZXRBY3RpdmVDYWxsUm9vbUlkKHJvb21JZCk7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IFBsYWNlQ2FsbFR5cGUuVm9pY2UpIHtcbiAgICAgICAgICAgIGNhbGwucGxhY2VWb2ljZUNhbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgICBjYWxsLnBsYWNlVmlkZW9DYWxsKFxuICAgICAgICAgICAgICAgIHJlbW90ZUVsZW1lbnQsXG4gICAgICAgICAgICAgICAgbG9jYWxFbGVtZW50LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBQbGFjZUNhbGxUeXBlLlNjcmVlblNoYXJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcmVlbkNhcEVycm9yU3RyaW5nID0gUGxhdGZvcm1QZWcuZ2V0KCkuc2NyZWVuQ2FwdHVyZUVycm9yU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAoc2NyZWVuQ2FwRXJyb3JTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNhbGxGb3JSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW4ndCBjYXB0dXJlIHNjcmVlbjogXCIgKyBzY3JlZW5DYXBFcnJvclN0cmluZyk7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBIYW5kbGVyJywgJ1VuYWJsZSB0byBjYXB0dXJlIHNjcmVlbicsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVW5hYmxlIHRvIGNhcHR1cmUgc2NyZWVuJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzY3JlZW5DYXBFcnJvclN0cmluZyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGwucGxhY2VTY3JlZW5TaGFyaW5nQ2FsbChcbiAgICAgICAgICAgICAgICByZW1vdGVFbGVtZW50LFxuICAgICAgICAgICAgICAgIGxvY2FsRWxlbWVudCxcbiAgICAgICAgICAgICAgICBhc3luYyAoKTogUHJvbWlzZTxEZXNrdG9wQ2FwdHVyZXJTb3VyY2U+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbc291cmNlXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVua25vd24gY29uZiBjYWxsIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAncGxhY2VfY2FsbCc6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBtaWdodCBiZSB1c2luZyBtYW5hZ2VkIGh5YnJpZCB3aWRnZXRzXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc01hbmFnZWRIeWJyaWRXaWRnZXRFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZE1hbmFnZWRIeWJyaWRXaWRnZXQocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBydW50aW1lIGVudiBkb2Vzbid0IGRvIFZvSVAsIHdoaW5lLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBIYW5kbGVyJywgJ1ZvSVAgaXMgdW5zdXBwb3J0ZWQnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVm9JUCBpcyB1bnN1cHBvcnRlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnWW91IGNhbm5vdCBwbGFjZSBWb0lQIGNhbGxzIGluIHRoaXMgYnJvd3Nlci4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgPiAyIGNhbGxzIHRvIGJlIHBsYWNlZC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0QWxsQWN0aXZlQ2FsbHMoKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEhhbmRsZXInLCAnRXhpc3RpbmcgQ2FsbCcsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdUb28gTWFueSBDYWxscycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIllvdSd2ZSByZWFjaGVkIHRoZSBtYXhpbXVtIG51bWJlciBvZiBzaW11bHRhbmVvdXMgY2FsbHMuXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBSb29tICR7cGF5bG9hZC5yb29tX2lkfSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldENhbGxGb3JSb29tKHJvb20ucm9vbUlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBIYW5kbGVyJywgJ0V4aXN0aW5nIENhbGwgd2l0aCB1c2VyJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0FscmVhZHkgaW4gY2FsbCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIllvdSdyZSBhbHJlYWR5IGluIGEgY2FsbCB3aXRoIHRoaXMgcGVyc29uLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVtYmVycyA9IHJvb20uZ2V0Sm9pbmVkTWVtYmVycygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVtYmVycy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBIYW5kbGVyJywgJ0Nhbm5vdCBwbGFjZSBjYWxsIHdpdGggc2VsZicsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdZb3UgY2Fubm90IHBsYWNlIGEgY2FsbCB3aXRoIHlvdXJzZWxmLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVycy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgUGxhY2UgJHtwYXlsb2FkLnR5cGV9IGNhbGwgaW4gJHtwYXlsb2FkLnJvb21faWR9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxhY2VDYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQucm9vbV9pZCwgcGF5bG9hZC50eXBlLCBwYXlsb2FkLmxvY2FsX2VsZW1lbnQsIHBheWxvYWQucmVtb3RlX2VsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC50cmFuc2ZlcmVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gPiAyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJwbGFjZV9jb25mZXJlbmNlX2NhbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBwYXlsb2FkLnJvb21faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW90ZV9lbGVtZW50OiBwYXlsb2FkLnJlbW90ZV9lbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsX2VsZW1lbnQ6IHBheWxvYWQubG9jYWxfZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGxhY2VfY29uZmVyZW5jZV9jYWxsJzpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJQbGFjZSBjb25mZXJlbmNlIGNhbGwgaW4gXCIgKyBwYXlsb2FkLnJvb21faWQpO1xuICAgICAgICAgICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCd2b2lwJywgJ3BsYWNlQ29uZmVyZW5jZUNhbGwnKTtcbiAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrU3RhcnRDYWxsKHBheWxvYWQucm9vbV9pZCwgcGF5bG9hZC50eXBlID09PSBQbGFjZUNhbGxUeXBlLlZpZGVvLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0Q2FsbEFwcChwYXlsb2FkLnJvb21faWQsIHBheWxvYWQudHlwZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlbmRfY29uZmVyZW5jZSc6XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiVGVybWluYXRpbmcgY29uZmVyZW5jZSBjYWxsIGluIFwiICsgcGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmF0ZUNhbGxBcHAocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hhbmd1cF9jb25mZXJlbmNlJzpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJMZWF2aW5nIGNvbmZlcmVuY2UgY2FsbCBpbiBcIisgcGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmd1cENhbGxBcHAocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2luY29taW5nX2NhbGwnOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHJ1bnRpbWUgZW52IGRvZXNuJ3QgZG8gVm9JUCwgc3RvcCBoZXJlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbCA9IHBheWxvYWQuY2FsbCBhcyBNYXRyaXhDYWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hcHBlZFJvb21JZCA9IENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkucm9vbUlkRm9yQ2FsbChjYWxsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0Q2FsbEZvclJvb20obWFwcGVkUm9vbUlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlIG11bHRpcGxlIGluY29taW5nIGNhbGxzIHRvIHRoZSBzYW1lIHJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCd2b2lwJywgJ3JlY2VpdmVDYWxsJywgJ3R5cGUnLCBjYWxsLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxzLnNldChtYXBwZWRSb29tSWQsIGNhbGwpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2FsbExpc3RlbmVycyhjYWxsKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgcmVhZHkgdG8gc2VuZCBlbmNyeXB0ZWQgZXZlbnRzIGluIHRoZSByb29tLCBzbyBpZiB0aGUgdXNlciBkb2VzIGFuc3dlclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgY2FsbCwgd2UnbGwgYmUgcmVhZHkgdG8gc2VuZC4gTkIuIFRoaXMgaXMgdGhlIHByb3RvY29sLWxldmVsIHJvb20gSUQgbm90XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBtYXBwZWQgb25lOiB0aGF0J3Mgd2hlcmUgd2UnbGwgc2VuZCB0aGUgZXZlbnRzLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGNsaS5wcmVwYXJlVG9FbmNyeXB0KGNsaS5nZXRSb29tKGNhbGwucm9vbUlkKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGFuZ3VwJzpcbiAgICAgICAgICAgIGNhc2UgJ3JlamVjdCc6XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNhbGxzLmdldChwYXlsb2FkLnJvb21faWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gbm8gY2FsbCB0byBoYW5ndXBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAncmVqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxzLmdldChwYXlsb2FkLnJvb21faWQpLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbHMuZ2V0KHBheWxvYWQucm9vbV9pZCkuaGFuZ3VwKENhbGxFcnJvckNvZGUuVXNlckhhbmd1cCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkb24ndCByZW1vdmUgdGhlIGNhbGwgeWV0OiBsZXQgdGhlIGhhbmd1cCBldmVudCBoYW5kbGVyIGRvIGl0IChvdGhlcndpc2UgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgICAgIC8vIHRoZSBoYW5ndXAgZXZlbnQgYXdheSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hhbmd1cF9hbGwnOlxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2FsbCBvZiB0aGlzLmNhbGxzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGwuaGFuZ3VwKENhbGxFcnJvckNvZGUuVXNlckhhbmd1cCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2FsbHMuaGFzKHBheWxvYWQucm9vbV9pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBubyBjYWxsIHRvIGFuc3dlclxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldEFsbEFjdGl2ZUNhbGxzKCkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEhhbmRsZXInLCAnRXhpc3RpbmcgQ2FsbCcsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1RvbyBNYW55IENhbGxzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJZb3UndmUgcmVhY2hlZCB0aGUgbWF4aW11bSBudW1iZXIgb2Ygc2ltdWx0YW5lb3VzIGNhbGxzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5jYWxscy5nZXQocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBjYWxsLmFuc3dlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2FsbEF1ZGlvRWxlbWVudChjYWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUNhbGxSb29tSWQocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrSm9pbkNhbGwocGF5bG9hZC5yb29tX2lkLCBjYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBwYXlsb2FkLnJvb21faWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRBY3RpdmVDYWxsUm9vbUlkKGFjdGl2ZUNhbGxSb29tSWQ6IHN0cmluZykge1xuICAgICAgICBsb2dnZXIuaW5mbyhcIlNldHRpbmcgY2FsbCBpbiByb29tIFwiICsgYWN0aXZlQ2FsbFJvb21JZCArIFwiIGFjdGl2ZVwiKTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtyb29tSWQsIGNhbGxdIG9mIHRoaXMuY2FsbHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICBpZiAoY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLkVuZGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKHJvb21JZCA9PT0gYWN0aXZlQ2FsbFJvb21JZCkge1xuICAgICAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJIb2xkaW5nIGNhbGwgaW4gcm9vbSBcIiArIHJvb21JZCArIFwiIGJlY2F1c2UgYW5vdGhlciBjYWxsIGlzIGJlaW5nIHNldCBhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY2FsbC5zZXRSZW1vdGVPbkhvbGQodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHdlIGFyZSBjdXJyZW50bHkgaW4gYW55IGNhbGwgd2hlcmUgd2UgaGF2ZW4ndCBwdXQgdGhlIHJlbW90ZSBwYXJ0eSBvbiBob2xkXG4gICAgICovXG4gICAgaGFzQW55VW5oZWxkQ2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBjYWxsIG9mIHRoaXMuY2FsbHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChjYWxsLnN0YXRlID09PSBDYWxsU3RhdGUuRW5kZWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFjYWxsLmlzUmVtb3RlT25Ib2xkKCkpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc3RhcnRDYWxsQXBwKHJvb21JZDogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2FwcHNEcmF3ZXInLFxuICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcHJldmVudCBkb3VibGUgY2xpY2tpbmcgdGhlIGNhbGwgYnV0dG9uXG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBjb25zdCBjdXJyZW50Sml0c2lXaWRnZXRzID0gV2lkZ2V0VXRpbHMuZ2V0Um9vbVdpZGdldHNPZlR5cGUocm9vbSwgV2lkZ2V0VHlwZS5KSVRTSSk7XG4gICAgICAgIGNvbnN0IGhhc0ppdHNpID0gY3VycmVudEppdHNpV2lkZ2V0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICB8fCBXaWRnZXRFY2hvU3RvcmUucm9vbUhhc1BlbmRpbmdXaWRnZXRzT2ZUeXBlKHJvb21JZCwgY3VycmVudEppdHNpV2lkZ2V0cywgV2lkZ2V0VHlwZS5KSVRTSSk7XG4gICAgICAgIGlmIChoYXNKaXRzaSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBhbHJlYWR5IGluIHByb2dyZXNzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdDYWxsIGluIFByb2dyZXNzJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdBIGNhbGwgaXMgY3VycmVudGx5IGJlaW5nIHBsYWNlZCEnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgaml0c2lEb21haW4gPSBKaXRzaS5nZXRJbnN0YW5jZSgpLnByZWZlcnJlZERvbWFpbjtcbiAgICAgICAgY29uc3Qgaml0c2lBdXRoID0gYXdhaXQgSml0c2kuZ2V0SW5zdGFuY2UoKS5nZXRKaXRzaUF1dGgoKTtcbiAgICAgICAgbGV0IGNvbmZJZDtcbiAgICAgICAgaWYgKGppdHNpQXV0aCA9PT0gJ29wZW5pZHRva2VuLWp3dCcpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBjb25mZXJlbmNlIElEIGZyb20gcm9vbSBJRFxuICAgICAgICAgICAgLy8gRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBKaXRzaSwgdXNlIGJhc2UzMiB3aXRob3V0IHBhZGRpbmcuXG4gICAgICAgICAgICAvLyBNb3JlIGRldGFpbHMgaGVyZTpcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3Byb3NvZHktbW9kLWF1dGgtbWF0cml4LXVzZXItdmVyaWZpY2F0aW9uXG4gICAgICAgICAgICBjb25mSWQgPSBiYXNlMzIuc3RyaW5naWZ5KEJ1ZmZlci5mcm9tKHJvb21JZCksIHsgcGFkOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIHJhbmRvbSBjb25mZXJlbmNlIElEXG4gICAgICAgICAgICBjb25zdCByYW5kb20gPSByYW5kb21VcHBlcmNhc2VTdHJpbmcoMSkgKyByYW5kb21Mb3dlcmNhc2VTdHJpbmcoMjMpO1xuICAgICAgICAgICAgY29uZklkID0gJ0ppdHNpJyArIHJhbmRvbTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB3aWRnZXRVcmwgPSBXaWRnZXRVdGlscy5nZXRMb2NhbEppdHNpV3JhcHBlclVybCh7YXV0aDogaml0c2lBdXRofSk7XG5cbiAgICAgICAgLy8gVE9ETzogUmVtb3ZlIFVSTCBoYWNrcyB3aGVuIHRoZSBtb2JpbGUgY2xpZW50cyBldmVudHVhbGx5IHN1cHBvcnQgdjIgd2lkZ2V0c1xuICAgICAgICBjb25zdCBwYXJzZWRVcmwgPSBuZXcgVVJMKHdpZGdldFVybCk7XG4gICAgICAgIHBhcnNlZFVybC5zZWFyY2ggPSAnJzsgLy8gc2V0IHRvIGVtcHR5IHN0cmluZyB0byBtYWtlIHRoZSBVUkwgY2xhc3MgdXNlIHNlYXJjaFBhcmFtcyBpbnN0ZWFkXG4gICAgICAgIHBhcnNlZFVybC5zZWFyY2hQYXJhbXMuc2V0KCdjb25mSWQnLCBjb25mSWQpO1xuICAgICAgICB3aWRnZXRVcmwgPSBwYXJzZWRVcmwudG9TdHJpbmcoKTtcblxuICAgICAgICBjb25zdCB3aWRnZXREYXRhID0ge1xuICAgICAgICAgICAgY29uZmVyZW5jZUlkOiBjb25mSWQsXG4gICAgICAgICAgICBpc0F1ZGlvT25seTogdHlwZSA9PT0gJ3ZvaWNlJyxcbiAgICAgICAgICAgIGRvbWFpbjogaml0c2lEb21haW4sXG4gICAgICAgICAgICBhdXRoOiBqaXRzaUF1dGgsXG4gICAgICAgICAgICByb29tTmFtZTogcm9vbS5uYW1lLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHdpZGdldElkID0gKFxuICAgICAgICAgICAgJ2ppdHNpXycgK1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZCArXG4gICAgICAgICAgICAnXycgK1xuICAgICAgICAgICAgRGF0ZS5ub3coKVxuICAgICAgICApO1xuXG4gICAgICAgIFdpZGdldFV0aWxzLnNldFJvb21XaWRnZXQocm9vbUlkLCB3aWRnZXRJZCwgV2lkZ2V0VHlwZS5KSVRTSSwgd2lkZ2V0VXJsLCAnSml0c2knLCB3aWRnZXREYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdKaXRzaSB3aWRnZXQgYWRkZWQnKTtcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLmVycmNvZGUgPT09ICdNX0ZPUkJJRERFTicpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1Blcm1pc3Npb24gUmVxdWlyZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gc3RhcnQgYSBjb25mZXJlbmNlIGNhbGwgaW4gdGhpcyByb29tXCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0ZXJtaW5hdGVDYWxsQXBwKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NvbmZpcm0gSml0c2kgVGVybWluYXRlJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICBoYXNDYW5jZWxCdXR0b246IHRydWUsXG4gICAgICAgICAgICB0aXRsZTogX3QoXCJFbmQgY29uZmVyZW5jZVwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlRoaXMgd2lsbCBlbmQgdGhlIGNvbmZlcmVuY2UgZm9yIGV2ZXJ5b25lLiBDb250aW51ZT9cIiksXG4gICAgICAgICAgICBidXR0b246IF90KFwiRW5kIGNvbmZlcmVuY2VcIiksXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UnbGwganVzdCBvYmxpdGVyYXRlIHRoZW0gYWxsLiBUaGVyZSBzaG91bGQgb25seSBldmVyIGJlIG9uZSwgYnV0IG1pZ2h0IGFzIHdlbGxcbiAgICAgICAgICAgICAgICAvLyBiZSBzYWZlLlxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JbmZvID0gV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGppdHNpV2lkZ2V0cyA9IHJvb21JbmZvLndpZGdldHMuZmlsdGVyKHcgPT4gV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHcudHlwZSkpO1xuICAgICAgICAgICAgICAgIGppdHNpV2lkZ2V0cy5mb3JFYWNoKHcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIGludmFsaWQgY29udGVudCByZW1vdmVzIGl0XG4gICAgICAgICAgICAgICAgICAgIFdpZGdldFV0aWxzLnNldFJvb21XaWRnZXQocm9vbUlkLCB3LmlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZ3VwQ2FsbEFwcChyb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCByb29tSW5mbyA9IFdpZGdldFN0b3JlLmluc3RhbmNlLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgaWYgKCFyb29tSW5mbykgcmV0dXJuOyAvLyBcInNob3VsZCBuZXZlciBoYXBwZW5cIiBjbGF1c2VzIGdvIGhlcmVcblxuICAgICAgICBjb25zdCBqaXRzaVdpZGdldHMgPSByb29tSW5mby53aWRnZXRzLmZpbHRlcih3ID0+IFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh3LnR5cGUpKTtcbiAgICAgICAgaml0c2lXaWRnZXRzLmZvckVhY2godyA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdpbmcgPSBXaWRnZXRNZXNzYWdpbmdTdG9yZS5pbnN0YW5jZS5nZXRNZXNzYWdpbmdGb3JJZCh3LmlkKTtcbiAgICAgICAgICAgIGlmICghbWVzc2FnaW5nKSByZXR1cm47IC8vIG1vcmUgXCJzaG91bGQgbmV2ZXIgaGFwcGVuXCIgd29yZHNcblxuICAgICAgICAgICAgbWVzc2FnaW5nLnRyYW5zcG9ydC5zZW5kKEVsZW1lbnRXaWRnZXRBY3Rpb25zLkhhbmd1cENhbGwsIHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19