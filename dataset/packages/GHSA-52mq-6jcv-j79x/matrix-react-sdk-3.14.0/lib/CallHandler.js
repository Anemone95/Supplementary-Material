"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PlaceCallType = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _Modal = _interopRequireDefault(require("./Modal"));

var _languageHandler = require("./languageHandler");

var _call = require("matrix-js-sdk/src/webrtc/call");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _WidgetEchoStore = _interopRequireDefault(require("./stores/WidgetEchoStore"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _NamingUtils = require("./utils/NamingUtils");

var _Jitsi = require("./widgets/Jitsi");

var _WidgetType = require("./widgets/WidgetType");

var _SettingLevel = require("./settings/SettingLevel");

var _rfc = require("rfc4648");

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _WidgetStore = _interopRequireDefault(require("./stores/WidgetStore"));

var _WidgetMessagingStore = require("./stores/widgets/WidgetMessagingStore");

var _ElementWidgetActions = require("./stores/widgets/ElementWidgetActions");

var _Analytics = _interopRequireDefault(require("./Analytics"));

var _CountlyAnalytics = _interopRequireDefault(require("./CountlyAnalytics"));

var _UIFeature = require("./settings/UIFeature");

var _logger = require("matrix-js-sdk/src/logger");

var _DesktopCapturerSourcePicker = _interopRequireDefault(require("./components/views/elements/DesktopCapturerSourcePicker"));

var _actions = require("./dispatcher/actions");

var _VoipUserMapper = require("./VoipUserMapper");

var _ManagedHybrid = require("./widgets/ManagedHybrid");

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
const CHECK_PSTN_SUPPORT_ATTEMPTS = 3;
var AudioID; // Unlike 'CallType' in js-sdk, this one includes screen sharing
// (because a screen sharing call is only a screen sharing call to the caller,
// to the callee it's just a video call, at least as far as the current impl
// is concerned).

(function (AudioID) {
  AudioID["Ring"] = "ringAudio";
  AudioID["Ringback"] = "ringbackAudio";
  AudioID["CallEnd"] = "callendAudio";
  AudioID["Busy"] = "busyAudio";
})(AudioID || (AudioID = {}));

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
    (0, _defineProperty2.default)(this, "audioPromises", new Map());
    (0, _defineProperty2.default)(this, "dispatcherRef", null);
    (0, _defineProperty2.default)(this, "supportsPstnProtocol", null);
    (0, _defineProperty2.default)(this, "pstnSupportCheckTimer", void 0);
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

            const members = room.getJoinedMembers();

            if (members.length <= 1) {
              _Modal.default.createTrackedDialog('Call Handler', 'Cannot place call with self', _ErrorDialog.default, {
                description: (0, _languageHandler._t)('You cannot place a call with yourself.')
              });

              return;
            } else if (members.length === 2) {
              console.info(`Place ${payload.type} call in ${payload.room_id}`);
              this.placeCall(payload.room_id, payload.type, payload.local_element, payload.remote_element);
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
            const mappedRoomId = CallHandler.roomIdForCall(call);

            if (this.getCallForRoom(mappedRoomId)) {
              // ignore multiple incoming calls to the same room
              return;
            }

            _Analytics.default.trackEvent('voip', 'receiveCall', 'type', call.type);

            this.calls.set(mappedRoomId, call);
            this.setCallListeners(call);
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

  // number actually because we're in the browser
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


  static roomIdForCall(call
  /*: MatrixCall*/
  ) {
    if (!call) return null;
    return (0, _VoipUserMapper.roomForVirtualRoom)(call.roomId) || call.roomId;
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

    this.checkForPstnSupport(CHECK_PSTN_SUPPORT_ATTEMPTS);
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

  async checkForPstnSupport(maxTries) {
    try {
      const protocols = await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyProtocols();

      if (protocols['im.vector.protocol.pstn'] !== undefined) {
        this.supportsPstnProtocol = protocols['im.vector.protocol.pstn'];
      } else if (protocols['m.protocol.pstn'] !== undefined) {
        this.supportsPstnProtocol = protocols['m.protocol.pstn'];
      } else {
        this.supportsPstnProtocol = null;
      }

      _dispatcher.default.dispatch({
        action: _actions.Action.PstnSupportUpdated
      });
    } catch (e) {
      if (maxTries === 1) {
        console.log("Failed to check for pstn protocol support and no retries remain: assuming no support", e);
      } else {
        console.log("Failed to check for pstn protocol support: will retry", e);
        this.pstnSupportCheckTimer = setTimeout(() => {
          this.checkForPstnSupport(maxTries - 1);
        }, 10000);
      }
    }
  }

  getSupportsPstnProtocol() {
    return this.supportsPstnProtocol;
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
    const mappedRoomId = CallHandler.roomIdForCall(call);
    const callForThisRoom = this.getCallForRoom(mappedRoomId);
    return callForThisRoom && call.callId === callForThisRoom.callId;
  }

  setCallListeners(call
  /*: MatrixCall*/
  ) {
    const mappedRoomId = CallHandler.roomIdForCall(call);
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
    const mappedRoomId = CallHandler.roomIdForCall(call);
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
  ) {
    _Analytics.default.trackEvent('voip', 'placeCall', 'type', type);

    _CountlyAnalytics.default.instance.trackStartCall(roomId, type === PlaceCallType.Video, false);

    const mappedRoomId = (await (0, _VoipUserMapper.getOrCreateVirtualRoomForRoom)(roomId)) || roomId;

    _logger.logger.debug("Mapped real room " + roomId + " to room ID " + mappedRoomId);

    const call = (0, _call.createNewMatrixCall)(_MatrixClientPeg.MatrixClientPeg.get(), mappedRoomId);
    this.calls.set(roomId, call);
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
      // Create a random human readable conference ID
      confId = `JitsiConference${(0, _NamingUtils.generateHumanReadableId)()}`;
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
      auth: jitsiAuth
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9DYWxsSGFuZGxlci50c3giXSwibmFtZXMiOlsiQ0hFQ0tfUFNUTl9TVVBQT1JUX0FUVEVNUFRTIiwiQXVkaW9JRCIsIlBsYWNlQ2FsbFR5cGUiLCJnZXRSZW1vdGVBdWRpb0VsZW1lbnQiLCJyZW1vdGVBdWRpb0VsZW1lbnQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY29uc29sZSIsImVycm9yIiwiQ2FsbEhhbmRsZXIiLCJNYXAiLCJjYWxsIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJwYXlsb2FkIiwicm9vbV9pZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInN1cHBvcnRzVm9pcCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImdldEFsbEFjdGl2ZUNhbGxzIiwibGVuZ3RoIiwicm9vbSIsImdldFJvb20iLCJtZW1iZXJzIiwiZ2V0Sm9pbmVkTWVtYmVycyIsImluZm8iLCJ0eXBlIiwicGxhY2VDYWxsIiwibG9jYWxfZWxlbWVudCIsInJlbW90ZV9lbGVtZW50IiwiQW5hbHl0aWNzIiwidHJhY2tFdmVudCIsIkNvdW50bHlBbmFseXRpY3MiLCJpbnN0YW5jZSIsInRyYWNrU3RhcnRDYWxsIiwiVmlkZW8iLCJzdGFydENhbGxBcHAiLCJ0ZXJtaW5hdGVDYWxsQXBwIiwiaGFuZ3VwQ2FsbEFwcCIsIm1hcHBlZFJvb21JZCIsInJvb21JZEZvckNhbGwiLCJnZXRDYWxsRm9yUm9vbSIsImNhbGxzIiwic2V0Iiwic2V0Q2FsbExpc3RlbmVycyIsInJlamVjdCIsImhhbmd1cCIsIkNhbGxFcnJvckNvZGUiLCJVc2VySGFuZ3VwIiwiaGFzIiwiYW5zd2VyIiwic2V0Q2FsbEF1ZGlvRWxlbWVudCIsInNldEFjdGl2ZUNhbGxSb29tSWQiLCJ0cmFja0pvaW5DYWxsIiwiQ2FsbFR5cGUiLCJzaGFyZWRJbnN0YW5jZSIsIndpbmRvdyIsIm14Q2FsbEhhbmRsZXIiLCJyb29tSWQiLCJzdGFydCIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwibmF2aWdhdG9yIiwibWVkaWFTZXNzaW9uIiwic2V0QWN0aW9uSGFuZGxlciIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIlZvaXAiLCJvbiIsIm9uQ2FsbEluY29taW5nIiwiY2hlY2tGb3JQc3RuU3VwcG9ydCIsInN0b3AiLCJjbGkiLCJyZW1vdmVMaXN0ZW5lciIsInVucmVnaXN0ZXIiLCJtYXhUcmllcyIsInByb3RvY29scyIsImdldFRoaXJkcGFydHlQcm90b2NvbHMiLCJ1bmRlZmluZWQiLCJzdXBwb3J0c1BzdG5Qcm90b2NvbCIsIkFjdGlvbiIsIlBzdG5TdXBwb3J0VXBkYXRlZCIsImUiLCJsb2ciLCJwc3RuU3VwcG9ydENoZWNrVGltZXIiLCJzZXRUaW1lb3V0IiwiZ2V0U3VwcG9ydHNQc3RuUHJvdG9jb2wiLCJnZXRBbnlBY3RpdmVDYWxsIiwidmFsdWVzIiwic3RhdGUiLCJDYWxsU3RhdGUiLCJFbmRlZCIsImFjdGl2ZUNhbGxzIiwiUmluZ2luZyIsInB1c2giLCJnZXRBbGxBY3RpdmVDYWxsc05vdEluUm9vbSIsIm5vdEluVGhpc1Jvb21JZCIsImNhbGxzTm90SW5UaGF0Um9vbSIsImVudHJpZXMiLCJwbGF5IiwiYXVkaW9JZCIsImF1ZGlvIiwicGxheUF1ZGlvIiwiYXVkaW9Qcm9taXNlcyIsInRoZW4iLCJsb2FkIiwicGF1c2UiLCJtYXRjaGVzQ2FsbEZvclRoaXNSb29tIiwiY2FsbEZvclRoaXNSb29tIiwiY2FsbElkIiwiQ2FsbEV2ZW50IiwiRXJyb3IiLCJlcnIiLCJ0b1N0cmluZyIsImNvZGUiLCJOb1VzZXJNZWRpYSIsInNob3dNZWRpYUNhcHR1cmVFcnJvciIsImdldFR1cm5TZXJ2ZXJzIiwic2hvd0lDRUZhbGxiYWNrUHJvbXB0IiwibWVzc2FnZSIsIkhhbmd1cCIsInJlbW92ZUNhbGxGb3JSb29tIiwiU3RhdGUiLCJuZXdTdGF0ZSIsIm9sZFN0YXRlIiwic2V0Q2FsbFN0YXRlIiwiUmluZyIsIkludml0ZVNlbnQiLCJSaW5nYmFjayIsImhhbmd1cFJlYXNvbiIsImhhbmd1cFBhcnR5IiwiQ2FsbFBhcnR5IiwiUmVtb3RlIiwiTG9jYWwiLCJJbnZpdGVUaW1lb3V0IiwiQnVzeSIsIkFuc3dlcmVkRWxzZXdoZXJlIiwiQ29ubmVjdGluZyIsIkZsZWRnbGluZyIsIkNhbGxFbmQiLCJsb2dDYWxsU3RhdHMiLCJSZXBsYWNlZCIsIm5ld0NhbGwiLCJzdGF0cyIsImdldEN1cnJlbnRDYWxsU3RhdHMiLCJsb2dnZXIiLCJkZWJ1ZyIsImRpcmVjdGlvbiIsIm91clBhcnR5SWQiLCJjYW5kIiwiZmlsdGVyIiwiaXRlbSIsImFkZHJlc3MiLCJpcCIsImlkIiwiY2FuZGlkYXRlVHlwZSIsInBvcnQiLCJwcm90b2NvbCIsInJlbGF5UHJvdG9jb2wiLCJuZXR3b3JrVHlwZSIsInBhaXIiLCJsb2NhbENhbmRpZGF0ZUlkIiwicmVtb3RlQ2FuZGlkYXRlSWQiLCJub21pbmF0ZWQiLCJyZXF1ZXN0c1NlbnQiLCJyZXF1ZXN0c1JlY2VpdmVkIiwicmVzcG9uc2VzUmVjZWl2ZWQiLCJyZXNwb25zZXNTZW50IiwiYnl0ZXNSZWNlaXZlZCIsImJ5dGVzU2VudCIsImF1ZGlvRWxlbWVudCIsInNldFJlbW90ZUF1ZGlvRWxlbWVudCIsInN0YXR1cyIsImRlbGV0ZSIsInN1YiIsIlF1ZXN0aW9uRGlhbG9nIiwiaG9tZXNlcnZlckRvbWFpbiIsImdldERvbWFpbiIsImJ1dHRvbiIsImNhbmNlbEJ1dHRvbiIsIm9uRmluaXNoZWQiLCJhbGxvdyIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwic2V0RmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkIiwiVm9pY2UiLCJsb2NhbEVsZW1lbnQiLCJyZW1vdGVFbGVtZW50IiwicGxhY2VWb2ljZUNhbGwiLCJwbGFjZVZpZGVvQ2FsbCIsIlNjcmVlblNoYXJpbmciLCJzY3JlZW5DYXBFcnJvclN0cmluZyIsIlBsYXRmb3JtUGVnIiwic2NyZWVuQ2FwdHVyZUVycm9yU3RyaW5nIiwicGxhY2VTY3JlZW5TaGFyaW5nQ2FsbCIsImZpbmlzaGVkIiwiY3JlYXRlRGlhbG9nIiwiRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyIiwic291cmNlIiwiYWN0aXZlQ2FsbFJvb21JZCIsInNldFJlbW90ZU9uSG9sZCIsImhhc0FueVVuaGVsZENhbGwiLCJpc1JlbW90ZU9uSG9sZCIsInNob3ciLCJjdXJyZW50Sml0c2lXaWRnZXRzIiwiV2lkZ2V0VXRpbHMiLCJnZXRSb29tV2lkZ2V0c09mVHlwZSIsIldpZGdldFR5cGUiLCJKSVRTSSIsImhhc0ppdHNpIiwiV2lkZ2V0RWNob1N0b3JlIiwicm9vbUhhc1BlbmRpbmdXaWRnZXRzT2ZUeXBlIiwiaml0c2lEb21haW4iLCJKaXRzaSIsImdldEluc3RhbmNlIiwicHJlZmVycmVkRG9tYWluIiwiaml0c2lBdXRoIiwiZ2V0Sml0c2lBdXRoIiwiY29uZklkIiwiYmFzZTMyIiwic3RyaW5naWZ5IiwiQnVmZmVyIiwiZnJvbSIsInBhZCIsIndpZGdldFVybCIsImdldExvY2FsSml0c2lXcmFwcGVyVXJsIiwiYXV0aCIsInBhcnNlZFVybCIsIlVSTCIsInNlYXJjaCIsInNlYXJjaFBhcmFtcyIsIndpZGdldERhdGEiLCJjb25mZXJlbmNlSWQiLCJpc0F1ZGlvT25seSIsImRvbWFpbiIsIndpZGdldElkIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJEYXRlIiwibm93Iiwic2V0Um9vbVdpZGdldCIsImNhdGNoIiwiZXJyY29kZSIsImhhc0NhbmNlbEJ1dHRvbiIsInByb2NlZWQiLCJyb29tSW5mbyIsIldpZGdldFN0b3JlIiwiaml0c2lXaWRnZXRzIiwid2lkZ2V0cyIsInciLCJtYXRjaGVzIiwiZm9yRWFjaCIsIm1lc3NhZ2luZyIsIldpZGdldE1lc3NhZ2luZ1N0b3JlIiwiZ2V0TWVzc2FnaW5nRm9ySWQiLCJ0cmFuc3BvcnQiLCJzZW5kIiwiRWxlbWVudFdpZGdldEFjdGlvbnMiLCJIYW5n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LFFBQXJCLENBQThCZ08saUJBQTlCLENBQWdETCxDQUFDLENBQUNoRyxFQUFsRCxDQUFsQjs7QUFDQSxVQUFJLENBQUNtRyxTQUFMLEVBQWdCLE9BRk0sQ0FFRTs7QUFFeEJBLE1BQUFBLFNBQVMsQ0FBQ0csU0FBVixDQUFvQkMsSUFBcEIsQ0FBeUJDLDJDQUFxQkMsVUFBOUMsRUFBMEQsRUFBMUQ7QUFDSCxLQUxEO0FBTUg7O0FBenRCNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qXG4gKiBNYW5hZ2VzIGEgbGlzdCBvZiBhbGwgdGhlIGN1cnJlbnRseSBhY3RpdmUgY2FsbHMuXG4gKlxuICogVGhpcyBoYW5kbGVyIGRpc3BhdGNoZXMgd2hlbiB2b2lwIGNhbGxzIGFyZSBhZGRlZC91cGRhdGVkL3JlbW92ZWQgZnJvbSB0aGlzIGxpc3Q6XG4gKiB7XG4gKiAgIGFjdGlvbjogJ2NhbGxfc3RhdGUnXG4gKiAgIHJvb21faWQ6IDxyb29tIElEIG9mIHRoZSBjYWxsPlxuICogfVxuICpcbiAqIFRvIGtub3cgdGhlIHN0YXRlIG9mIHRoZSBjYWxsLCB0aGlzIGhhbmRsZXIgZXhwb3NlcyBhIGdldHRlciB0b1xuICogb2J0YWluIHRoZSBjYWxsIGZvciBhIHJvb206XG4gKiAgIHZhciBjYWxsID0gQ2FsbEhhbmRsZXIuZ2V0Q2FsbChyb29tSWQpXG4gKiAgIHZhciBzdGF0ZSA9IGNhbGwuY2FsbF9zdGF0ZTsgLy8gcmluZ2luZ3xyaW5nYmFja3xjb25uZWN0ZWR8ZW5kZWR8YnVzeXxzdG9wX3JpbmdiYWNrfHN0b3BfcmluZ2luZ1xuICpcbiAqIFRoaXMgaGFuZGxlciBsaXN0ZW5zIGZvciBhbmQgaGFuZGxlcyB0aGUgZm9sbG93aW5nIGFjdGlvbnM6XG4gKiB7XG4gKiAgIGFjdGlvbjogJ3BsYWNlX2NhbGwnLFxuICogICB0eXBlOiAndm9pY2V8dmlkZW8nLFxuICogICByb29tX2lkOiA8cm9vbSB0aGF0IHRoZSBwbGFjZSBjYWxsIGJ1dHRvbiB3YXMgcHJlc3NlZCBpbj5cbiAqIH1cbiAqXG4gKiB7XG4gKiAgIGFjdGlvbjogJ2luY29taW5nX2NhbGwnXG4gKiAgIGNhbGw6IE1hdHJpeENhbGxcbiAqIH1cbiAqXG4gKiB7XG4gKiAgIGFjdGlvbjogJ2hhbmd1cCdcbiAqICAgcm9vbV9pZDogPHJvb20gdGhhdCB0aGUgaGFuZ3VwIGJ1dHRvbiB3YXMgcHJlc3NlZCBpbj5cbiAqIH1cbiAqXG4gKiB7XG4gKiAgIGFjdGlvbjogJ2Fuc3dlcidcbiAqICAgcm9vbV9pZDogPHJvb20gdGhhdCB0aGUgYW5zd2VyIGJ1dHRvbiB3YXMgcHJlc3NlZCBpbj5cbiAqIH1cbiAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4vUGxhdGZvcm1QZWcnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBjcmVhdGVOZXdNYXRyaXhDYWxsIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGwnO1xuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgV2lkZ2V0VXRpbHMgZnJvbSAnLi91dGlscy9XaWRnZXRVdGlscyc7XG5pbXBvcnQgV2lkZ2V0RWNob1N0b3JlIGZyb20gJy4vc3RvcmVzL1dpZGdldEVjaG9TdG9yZSc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IHtnZW5lcmF0ZUh1bWFuUmVhZGFibGVJZH0gZnJvbSBcIi4vdXRpbHMvTmFtaW5nVXRpbHNcIjtcbmltcG9ydCB7Sml0c2l9IGZyb20gXCIuL3dpZGdldHMvSml0c2lcIjtcbmltcG9ydCB7V2lkZ2V0VHlwZX0gZnJvbSBcIi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQge1NldHRpbmdMZXZlbH0gZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHtiYXNlMzJ9IGZyb20gXCJyZmM0NjQ4XCI7XG5cbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBXaWRnZXRTdG9yZSBmcm9tIFwiLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCB7IFdpZGdldE1lc3NhZ2luZ1N0b3JlIH0gZnJvbSBcIi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TWVzc2FnaW5nU3RvcmVcIjtcbmltcG9ydCB7IEVsZW1lbnRXaWRnZXRBY3Rpb25zIH0gZnJvbSBcIi4vc3RvcmVzL3dpZGdldHMvRWxlbWVudFdpZGdldEFjdGlvbnNcIjtcbmltcG9ydCB7IE1hdHJpeENhbGwsIENhbGxFcnJvckNvZGUsIENhbGxTdGF0ZSwgQ2FsbEV2ZW50LCBDYWxsUGFydHksIENhbGxUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsXCI7XG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gJy4vQW5hbHl0aWNzJztcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi9zZXR0aW5ncy9VSUZlYXR1cmVcIjtcbmltcG9ydCB7IENhbGxFcnJvciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyJztcbmltcG9ydCBEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9EZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXJcIlxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi9kaXNwYXRjaGVyL2FjdGlvbnMnO1xuaW1wb3J0IHsgcm9vbUZvclZpcnR1YWxSb29tLCBnZXRPckNyZWF0ZVZpcnR1YWxSb29tRm9yUm9vbSB9IGZyb20gJy4vVm9pcFVzZXJNYXBwZXInO1xuaW1wb3J0IHsgYWRkTWFuYWdlZEh5YnJpZFdpZGdldCwgaXNNYW5hZ2VkSHlicmlkV2lkZ2V0RW5hYmxlZCB9IGZyb20gJy4vd2lkZ2V0cy9NYW5hZ2VkSHlicmlkJztcblxuY29uc3QgQ0hFQ0tfUFNUTl9TVVBQT1JUX0FUVEVNUFRTID0gMztcblxuZW51bSBBdWRpb0lEIHtcbiAgICBSaW5nID0gJ3JpbmdBdWRpbycsXG4gICAgUmluZ2JhY2sgPSAncmluZ2JhY2tBdWRpbycsXG4gICAgQ2FsbEVuZCA9ICdjYWxsZW5kQXVkaW8nLFxuICAgIEJ1c3kgPSAnYnVzeUF1ZGlvJyxcbn1cblxuLy8gVW5saWtlICdDYWxsVHlwZScgaW4ganMtc2RrLCB0aGlzIG9uZSBpbmNsdWRlcyBzY3JlZW4gc2hhcmluZ1xuLy8gKGJlY2F1c2UgYSBzY3JlZW4gc2hhcmluZyBjYWxsIGlzIG9ubHkgYSBzY3JlZW4gc2hhcmluZyBjYWxsIHRvIHRoZSBjYWxsZXIsXG4vLyB0byB0aGUgY2FsbGVlIGl0J3MganVzdCBhIHZpZGVvIGNhbGwsIGF0IGxlYXN0IGFzIGZhciBhcyB0aGUgY3VycmVudCBpbXBsXG4vLyBpcyBjb25jZXJuZWQpLlxuZXhwb3J0IGVudW0gUGxhY2VDYWxsVHlwZSB7XG4gICAgVm9pY2UgPSAndm9pY2UnLFxuICAgIFZpZGVvID0gJ3ZpZGVvJyxcbiAgICBTY3JlZW5TaGFyaW5nID0gJ3NjcmVlbnNoYXJpbmcnLFxufVxuXG5mdW5jdGlvbiBnZXRSZW1vdGVBdWRpb0VsZW1lbnQoKTogSFRNTEF1ZGlvRWxlbWVudCB7XG4gICAgLy8gdGhpcyBuZWVkcyB0byBiZSBzb21ld2hlcmUgYXQgdGhlIHRvcCBvZiB0aGUgRE9NIHdoaWNoXG4gICAgLy8gYWx3YXlzIGV4aXN0cyB0byBhdm9pZCBhdWRpbyBpbnRlcnJ1cHRpb25zLlxuICAgIC8vIE1pZ2h0IGFzIHdlbGwganVzdCB1c2UgRE9NLlxuICAgIGNvbnN0IHJlbW90ZUF1ZGlvRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVtb3RlQXVkaW9cIikgYXMgSFRNTEF1ZGlvRWxlbWVudDtcbiAgICBpZiAoIXJlbW90ZUF1ZGlvRWxlbWVudCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgXCJGYWlsZWQgdG8gZmluZCByZW1vdGVBdWRpbyBlbGVtZW50IC0gY2Fubm90IHBsYXkgYXVkaW8hXCIgK1xuICAgICAgICAgICAgXCJZb3UgbmVlZCB0byBhZGQgYW4gPGF1ZGlvLz4gdG8gdGhlIERPTS5cIixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiByZW1vdGVBdWRpb0VsZW1lbnQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbGxIYW5kbGVyIHtcbiAgICBwcml2YXRlIGNhbGxzID0gbmV3IE1hcDxzdHJpbmcsIE1hdHJpeENhbGw+KCk7IC8vIHJvb21JZCAtPiBjYWxsXG4gICAgcHJpdmF0ZSBhdWRpb1Byb21pc2VzID0gbmV3IE1hcDxBdWRpb0lELCBQcm9taXNlPHZvaWQ+PigpO1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nID0gbnVsbDtcbiAgICBwcml2YXRlIHN1cHBvcnRzUHN0blByb3RvY29sID0gbnVsbDtcbiAgICBwcml2YXRlIHBzdG5TdXBwb3J0Q2hlY2tUaW1lcjogTm9kZUpTLlRpbWVvdXQ7IC8vIG51bWJlciBhY3R1YWxseSBiZWNhdXNlIHdlJ3JlIGluIHRoZSBicm93c2VyXG5cbiAgICBzdGF0aWMgc2hhcmVkSW5zdGFuY2UoKSB7XG4gICAgICAgIGlmICghd2luZG93Lm14Q2FsbEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5teENhbGxIYW5kbGVyID0gbmV3IENhbGxIYW5kbGVyKClcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3aW5kb3cubXhDYWxsSGFuZGxlcjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEdldHMgdGhlIHVzZXItZmFjaW5nIHJvb20gYXNzb2NpYXRlZCB3aXRoIGEgY2FsbCAoY2FsbC5yb29tSWQgbWF5IGJlIHRoZSBjYWxsIFwidmlydHVhbCByb29tXCJcbiAgICAgKiBpZiBhIHZvaXBfbXhpZF90cmFuc2xhdGVfcGF0dGVybiBpcyBzZXQgaW4gdGhlIGNvbmZpZylcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHJvb21JZEZvckNhbGwoY2FsbDogTWF0cml4Q2FsbCkge1xuICAgICAgICBpZiAoIWNhbGwpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gcm9vbUZvclZpcnR1YWxSb29tKGNhbGwucm9vbUlkKSB8fCBjYWxsLnJvb21JZDtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICAvLyBhZGQgZW1wdHkgaGFuZGxlcnMgZm9yIG1lZGlhIGFjdGlvbnMsIG90aGVyd2lzZSB0aGUgbWVkaWEga2V5c1xuICAgICAgICAvLyBlbmQgdXAgY2F1c2luZyB0aGUgYXVkaW8gZWxlbWVudHMgd2l0aCBvdXIgcmluZy9yaW5nYmFjayBldGNcbiAgICAgICAgLy8gYXVkaW8gY2xpcHMgaW4gdG8gcGxheS5cbiAgICAgICAgaWYgKG5hdmlnYXRvci5tZWRpYVNlc3Npb24pIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcigncGxheScsIGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5zZXRBY3Rpb25IYW5kbGVyKCdwYXVzZScsIGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5zZXRBY3Rpb25IYW5kbGVyKCdzZWVrYmFja3dhcmQnLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcignc2Vla2ZvcndhcmQnLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcigncHJldmlvdXN0cmFjaycsIGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5zZXRBY3Rpb25IYW5kbGVyKCduZXh0dHJhY2snLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5Wb2lwKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKCdDYWxsLmluY29taW5nJywgdGhpcy5vbkNhbGxJbmNvbWluZyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoZWNrRm9yUHN0blN1cHBvcnQoQ0hFQ0tfUFNUTl9TVVBQT1JUX0FUVEVNUFRTKTtcbiAgICB9XG5cbiAgICBzdG9wKCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGkpIHtcbiAgICAgICAgICAgIGNsaS5yZW1vdmVMaXN0ZW5lcignQ2FsbC5pbmNvbWluZycsIHRoaXMub25DYWxsSW5jb21pbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmRpc3BhdGNoZXJSZWYgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjaGVja0ZvclBzdG5TdXBwb3J0KG1heFRyaWVzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcm90b2NvbHMgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhpcmRwYXJ0eVByb3RvY29scygpO1xuICAgICAgICAgICAgaWYgKHByb3RvY29sc1snaW0udmVjdG9yLnByb3RvY29sLnBzdG4nXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXBwb3J0c1BzdG5Qcm90b2NvbCA9IHByb3RvY29sc1snaW0udmVjdG9yLnByb3RvY29sLnBzdG4nXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvdG9jb2xzWydtLnByb3RvY29sLnBzdG4nXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXBwb3J0c1BzdG5Qcm90b2NvbCA9IHByb3RvY29sc1snbS5wcm90b2NvbC5wc3RuJ107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3VwcG9ydHNQc3RuUHJvdG9jb2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IEFjdGlvbi5Qc3RuU3VwcG9ydFVwZGF0ZWR9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKG1heFRyaWVzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsZWQgdG8gY2hlY2sgZm9yIHBzdG4gcHJvdG9jb2wgc3VwcG9ydCBhbmQgbm8gcmV0cmllcyByZW1haW46IGFzc3VtaW5nIG5vIHN1cHBvcnRcIiwgZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGNoZWNrIGZvciBwc3RuIHByb3RvY29sIHN1cHBvcnQ6IHdpbGwgcmV0cnlcIiwgZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wc3RuU3VwcG9ydENoZWNrVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0ZvclBzdG5TdXBwb3J0KG1heFRyaWVzIC0gMSk7XG4gICAgICAgICAgICAgICAgfSwgMTAwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0U3VwcG9ydHNQc3RuUHJvdG9jb2woKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DYWxsSW5jb21pbmcgPSAoY2FsbCkgPT4ge1xuICAgICAgICAvLyB3ZSBkaXNwYXRjaCB0aGlzIHN5bmNocm9ub3VzbHkgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGV2ZW50XG4gICAgICAgIC8vIGhhbmRsZXJzIG9uIHRoZSBjYWxsIGFyZSBzZXQgdXAgaW1tZWRpYXRlbHkgKHNvIHRoYXQgaWZcbiAgICAgICAgLy8gd2UgZ2V0IGFuIGltbWVkaWF0ZSBoYW5ndXAsIHdlIGRvbid0IGdldCBhIHN0dWNrIGNhbGwpXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdpbmNvbWluZ19jYWxsJyxcbiAgICAgICAgICAgIGNhbGw6IGNhbGwsXG4gICAgICAgIH0sIHRydWUpO1xuICAgIH1cblxuICAgIGdldENhbGxGb3JSb29tKHJvb21JZDogc3RyaW5nKTogTWF0cml4Q2FsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxzLmdldChyb29tSWQpIHx8IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0QW55QWN0aXZlQ2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBjYWxsIG9mIHRoaXMuY2FsbHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChjYWxsLnN0YXRlICE9PSBDYWxsU3RhdGUuRW5kZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRBbGxBY3RpdmVDYWxscygpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlQ2FsbHMgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNhbGwgb2YgdGhpcy5jYWxscy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgaWYgKGNhbGwuc3RhdGUgIT09IENhbGxTdGF0ZS5FbmRlZCAmJiBjYWxsLnN0YXRlICE9PSBDYWxsU3RhdGUuUmluZ2luZykge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUNhbGxzLnB1c2goY2FsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNhbGxzO1xuICAgIH1cblxuICAgIGdldEFsbEFjdGl2ZUNhbGxzTm90SW5Sb29tKG5vdEluVGhpc1Jvb21JZCkge1xuICAgICAgICBjb25zdCBjYWxsc05vdEluVGhhdFJvb20gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtyb29tSWQsIGNhbGxdIG9mIHRoaXMuY2FsbHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICBpZiAocm9vbUlkICE9PSBub3RJblRoaXNSb29tSWQgJiYgY2FsbC5zdGF0ZSAhPT0gQ2FsbFN0YXRlLkVuZGVkKSB7XG4gICAgICAgICAgICAgICAgY2FsbHNOb3RJblRoYXRSb29tLnB1c2goY2FsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxzTm90SW5UaGF0Um9vbTtcbiAgICB9XG5cbiAgICBwbGF5KGF1ZGlvSWQ6IEF1ZGlvSUQpIHtcbiAgICAgICAgLy8gVE9ETzogQXR0YWNoIGFuIGludmlzaWJsZSBlbGVtZW50IGZvciB0aGlzIGluc3RlYWRcbiAgICAgICAgLy8gd2hpY2ggbGlzdGVucz9cbiAgICAgICAgY29uc3QgYXVkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhdWRpb0lkKSBhcyBIVE1MTWVkaWFFbGVtZW50O1xuICAgICAgICBpZiAoYXVkaW8pIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXlBdWRpbyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHN0aWxsIGNhdXNlcyB0aGUgY2hyb21lIGRlYnVnZ2VyIHRvIGJyZWFrIG9uIHByb21pc2UgcmVqZWN0aW9uIGlmXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkLCBldmVuIHRob3VnaCB3ZSdyZSBjYXRjaGluZyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhdWRpby5wbGF5KCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHVzdWFsbHkgYmVjYXVzZSB0aGUgdXNlciBoYXNuJ3QgaW50ZXJhY3RlZCB3aXRoIHRoZSBkb2N1bWVudCxcbiAgICAgICAgICAgICAgICAgICAgLy8gb3IgY2hyb21lIGRvZXNuJ3QgdGhpbmsgc28gYW5kIGlzIGRlbnlpbmcgdGhlIHJlcXVlc3QuIE5vdCBzdXJlIHdoYXRcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuIHJlYWxseSBkbyBoZXJlLi4uXG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzc2NTdcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gcGxheSBhdWRpbyBjbGlwXCIsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAodGhpcy5hdWRpb1Byb21pc2VzLmhhcyhhdWRpb0lkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9Qcm9taXNlcy5zZXQoYXVkaW9JZCwgdGhpcy5hdWRpb1Byb21pc2VzLmdldChhdWRpb0lkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXVkaW8ubG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGxheUF1ZGlvKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUHJvbWlzZXMuc2V0KGF1ZGlvSWQsIHBsYXlBdWRpbygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhdXNlKGF1ZGlvSWQ6IEF1ZGlvSUQpIHtcbiAgICAgICAgLy8gVE9ETzogQXR0YWNoIGFuIGludmlzaWJsZSBlbGVtZW50IGZvciB0aGlzIGluc3RlYWRcbiAgICAgICAgLy8gd2hpY2ggbGlzdGVucz9cbiAgICAgICAgY29uc3QgYXVkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhdWRpb0lkKSBhcyBIVE1MTWVkaWFFbGVtZW50O1xuICAgICAgICBpZiAoYXVkaW8pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF1ZGlvUHJvbWlzZXMuaGFzKGF1ZGlvSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1Byb21pc2VzLnNldChhdWRpb0lkLCB0aGlzLmF1ZGlvUHJvbWlzZXMuZ2V0KGF1ZGlvSWQpLnRoZW4oKCkgPT4gYXVkaW8ucGF1c2UoKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBwYXVzZSBkb2Vzbid0IHJldHVybiBhIHByb21pc2UsIHNvIGp1c3QgZG8gaXRcbiAgICAgICAgICAgICAgICBhdWRpby5wYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYXRjaGVzQ2FsbEZvclRoaXNSb29tKGNhbGw6IE1hdHJpeENhbGwpIHtcbiAgICAgICAgLy8gV2UgZG9uJ3QgYWxsb3cgcGxhY2luZyBtb3JlIHRoYW4gb25lIGNhbGwgcGVyIHJvb20sIGJ1dCB0aGF0IGRvZXNuJ3QgbWVhbiB0aGVyZVxuICAgICAgICAvLyBjYW4ndCBiZSBtb3JlIHRoYW4gb25lLCBlZy4gaW4gYSBnbGFyZSBzaXR1YXRpb24uIFRoaXMgY2hlY2tzIHRoYXQgdGhlIGdpdmVuIGNhbGxcbiAgICAgICAgLy8gaXMgdGhlIGNhbGwgd2UgY29uc2lkZXIgJ3RoZScgY2FsbCBmb3IgaXRzIHJvb20uXG4gICAgICAgIGNvbnN0IG1hcHBlZFJvb21JZCA9IENhbGxIYW5kbGVyLnJvb21JZEZvckNhbGwoY2FsbCk7XG5cbiAgICAgICAgY29uc3QgY2FsbEZvclRoaXNSb29tID0gdGhpcy5nZXRDYWxsRm9yUm9vbShtYXBwZWRSb29tSWQpO1xuICAgICAgICByZXR1cm4gY2FsbEZvclRoaXNSb29tICYmIGNhbGwuY2FsbElkID09PSBjYWxsRm9yVGhpc1Jvb20uY2FsbElkO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0Q2FsbExpc3RlbmVycyhjYWxsOiBNYXRyaXhDYWxsKSB7XG4gICAgICAgIGNvbnN0IG1hcHBlZFJvb21JZCA9IENhbGxIYW5kbGVyLnJvb21JZEZvckNhbGwoY2FsbCk7XG5cbiAgICAgICAgY2FsbC5vbihDYWxsRXZlbnQuRXJyb3IsIChlcnI6IENhbGxFcnJvcikgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ3ZvaXAnLCAnY2FsbEVycm9yJywgJ2Vycm9yJywgZXJyLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNhbGwgZXJyb3I6XCIsIGVycik7XG5cbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gQ2FsbEVycm9yQ29kZS5Ob1VzZXJNZWRpYSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lZGlhQ2FwdHVyZUVycm9yKGNhbGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUdXJuU2VydmVycygpLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIikgPT09IG51bGxcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0lDRUZhbGxiYWNrUHJvbXB0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnQ2FsbCBGYWlsZWQnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50Lkhhbmd1cCwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoJ3ZvaXAnLCAnY2FsbEhhbmd1cCcpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNhbGxGb3JSb29tKG1hcHBlZFJvb21JZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjYWxsLm9uKENhbGxFdmVudC5TdGF0ZSwgKG5ld1N0YXRlOiBDYWxsU3RhdGUsIG9sZFN0YXRlOiBDYWxsU3RhdGUpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXRjaGVzQ2FsbEZvclRoaXNSb29tKGNhbGwpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuc2V0Q2FsbFN0YXRlKGNhbGwsIG5ld1N0YXRlKTtcblxuICAgICAgICAgICAgc3dpdGNoIChvbGRTdGF0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgQ2FsbFN0YXRlLlJpbmdpbmc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF1c2UoQXVkaW9JRC5SaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBDYWxsU3RhdGUuSW52aXRlU2VudDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXVzZShBdWRpb0lELlJpbmdiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAobmV3U3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIENhbGxTdGF0ZS5SaW5naW5nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoQXVkaW9JRC5SaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBDYWxsU3RhdGUuSW52aXRlU2VudDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KEF1ZGlvSUQuUmluZ2JhY2spO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIENhbGxTdGF0ZS5FbmRlZDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCd2b2lwJywgJ2NhbGxFbmRlZCcsICdoYW5ndXBSZWFzb24nLCBjYWxsLmhhbmd1cFJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2FsbEZvclJvb20obWFwcGVkUm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZFN0YXRlID09PSBDYWxsU3RhdGUuSW52aXRlU2VudCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsLmhhbmd1cFBhcnR5ID09PSBDYWxsUGFydHkuUmVtb3RlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoY2FsbC5oYW5ndXBQYXJ0eSA9PT0gQ2FsbFBhcnR5LkxvY2FsICYmIGNhbGwuaGFuZ3VwUmVhc29uID09PSBDYWxsRXJyb3JDb2RlLkludml0ZVRpbWVvdXQpXG4gICAgICAgICAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShBdWRpb0lELkJ1c3kpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGwuaGFuZ3VwUmVhc29uID09PSBDYWxsRXJyb3JDb2RlLlVzZXJIYW5ndXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiQ2FsbCBEZWNsaW5lZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiVGhlIG90aGVyIHBhcnR5IGRlY2xpbmVkIHRoZSBjYWxsLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FsbC5oYW5ndXBSZWFzb24gPT09IENhbGxFcnJvckNvZGUuSW52aXRlVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJDYWxsIEZhaWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBYWFg6IGZ1bGwgc3RvcCBhcHBlbmRlZCBhcyBzb21lIHJlbGljIGhlcmUsIGJ1dCB0aGVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN0cmluZ3MgbmVlZCBwcm9wZXIgaW5wdXQgZnJvbSBkZXNpZ24gYW55d2F5LCBzbyBsZXQnc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBjaGFuZ2UgdGhpcyBzdHJpbmcgdW50aWwgd2UgaGF2ZSBhIHByb3BlciBvbmUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdCgnVGhlIHJlbW90ZSBzaWRlIGZhaWxlZCB0byBwaWNrIHVwJykgKyAnLic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJDYWxsIEZhaWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiVGhlIGNhbGwgY291bGQgbm90IGJlIGVzdGFibGlzaGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEhhbmRsZXInLCAnQ2FsbCBGYWlsZWQnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLCBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbC5oYW5ndXBSZWFzb24gPT09IENhbGxFcnJvckNvZGUuQW5zd2VyZWRFbHNld2hlcmUgJiYgb2xkU3RhdGUgPT09IENhbGxTdGF0ZS5Db25uZWN0aW5nXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBIYW5kbGVyJywgJ0NhbGwgRmFpbGVkJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJBbnN3ZXJlZCBFbHNld2hlcmVcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVGhlIGNhbGwgd2FzIGFuc3dlcmVkIG9uIGFub3RoZXIgZGV2aWNlLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9sZFN0YXRlICE9PSBDYWxsU3RhdGUuRmxlZGdsaW5nICYmIG9sZFN0YXRlICE9PSBDYWxsU3RhdGUuUmluZ2luZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgcGxheSB0aGUgZW5kLWNhbGwgc291bmQgZm9yIGNhbGxzIHRoYXQgbmV2ZXIgZ290IG9mZiB0aGUgZ3JvdW5kXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoQXVkaW9JRC5DYWxsRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nQ2FsbFN0YXRzKGNhbGwsIG1hcHBlZFJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50LlJlcGxhY2VkLCAobmV3Q2FsbDogTWF0cml4Q2FsbCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coYENhbGwgSUQgJHtjYWxsLmNhbGxJZH0gaXMgYmVpbmcgcmVwbGFjZWQgYnkgY2FsbCBJRCAke25ld0NhbGwuY2FsbElkfWApO1xuXG4gICAgICAgICAgICBpZiAoY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLlJpbmdpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlKEF1ZGlvSUQuUmluZyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNhbGwuc3RhdGUgPT09IENhbGxTdGF0ZS5JbnZpdGVTZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXVzZShBdWRpb0lELlJpbmdiYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jYWxscy5zZXQobWFwcGVkUm9vbUlkLCBuZXdDYWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q2FsbExpc3RlbmVycyhuZXdDYWxsKTtcbiAgICAgICAgICAgIHRoaXMuc2V0Q2FsbFN0YXRlKG5ld0NhbGwsIG5ld0NhbGwuc3RhdGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGxvZ0NhbGxTdGF0cyhjYWxsOiBNYXRyaXhDYWxsLCBtYXBwZWRSb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBzdGF0cyA9IGF3YWl0IGNhbGwuZ2V0Q3VycmVudENhbGxTdGF0cygpO1xuICAgICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgICBgQ2FsbCBjb21wbGV0ZWQuIENhbGwgSUQ6ICR7Y2FsbC5jYWxsSWR9LCB2aXJ0dWFsIHJvb20gSUQ6ICR7Y2FsbC5yb29tSWR9LCBgICtcbiAgICAgICAgICAgIGB1c2VyLWZhY2luZyByb29tIElEOiAke21hcHBlZFJvb21JZH0sIGRpcmVjdGlvbjogJHtjYWxsLmRpcmVjdGlvbn0sIGAgK1xuICAgICAgICAgICAgYG91ciBQYXJ0eSBJRDogJHtjYWxsLm91clBhcnR5SWR9LCBoYW5ndXAgcGFydHk6ICR7Y2FsbC5oYW5ndXBQYXJ0eX0sIGAgK1xuICAgICAgICAgICAgYGhhbmd1cCByZWFzb246ICR7Y2FsbC5oYW5ndXBSZWFzb259YCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFzdGF0cykge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgICAgIFwiQ2FsbCBzdGF0aXN0aWNzIGFyZSB1bmRlZmluZWQuIFRoZSBjYWxsIGhhcyBcIiArXG4gICAgICAgICAgICAgICAgXCJwcm9iYWJseSBmYWlsZWQgYmVmb3JlIGEgcGVlckNvbm4gd2FzIGVzdGFibGlzaGVkXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIkxvY2FsIGNhbmRpZGF0ZXM6XCIpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhbmQgb2Ygc3RhdHMuZmlsdGVyKGl0ZW0gPT4gaXRlbS50eXBlID09PSAnbG9jYWwtY2FuZGlkYXRlJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBjYW5kLmFkZHJlc3MgfHwgY2FuZC5pcDsgLy8gZmlyZWZveCB1c2VzICdhZGRyZXNzJywgY2hyb21lIHVzZXMgJ2lwJ1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgICAgIGAke2NhbmQuaWR9IC0gdHlwZTogJHtjYW5kLmNhbmRpZGF0ZVR5cGV9LCBhZGRyZXNzOiAke2FkZHJlc3N9LCBwb3J0OiAke2NhbmQucG9ydH0sIGAgK1xuICAgICAgICAgICAgICAgIGBwcm90b2NvbDogJHtjYW5kLnByb3RvY29sfSwgcmVsYXkgcHJvdG9jb2w6ICR7Y2FuZC5yZWxheVByb3RvY29sfSwgbmV0d29yayB0eXBlOiAke2NhbmQubmV0d29ya1R5cGV9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiUmVtb3RlIGNhbmRpZGF0ZXM6XCIpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhbmQgb2Ygc3RhdHMuZmlsdGVyKGl0ZW0gPT4gaXRlbS50eXBlID09PSAncmVtb3RlLWNhbmRpZGF0ZScpKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gY2FuZC5hZGRyZXNzIHx8IGNhbmQuaXA7IC8vIGZpcmVmb3ggdXNlcyAnYWRkcmVzcycsIGNocm9tZSB1c2VzICdpcCdcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBgJHtjYW5kLmlkfSAtIHR5cGU6ICR7Y2FuZC5jYW5kaWRhdGVUeXBlfSwgYWRkcmVzczogJHthZGRyZXNzfSwgcG9ydDogJHtjYW5kLnBvcnR9LCBgICtcbiAgICAgICAgICAgICAgICBgcHJvdG9jb2w6ICR7Y2FuZC5wcm90b2NvbH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBsb2dnZXIuZGVidWcoXCJDYW5kaWRhdGUgcGFpcnM6XCIpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2Ygc3RhdHMuZmlsdGVyKGl0ZW0gPT4gaXRlbS50eXBlID09PSAnY2FuZGlkYXRlLXBhaXInKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgICAgIGAke3BhaXIubG9jYWxDYW5kaWRhdGVJZH0gLyAke3BhaXIucmVtb3RlQ2FuZGlkYXRlSWR9IC0gc3RhdGU6ICR7cGFpci5zdGF0ZX0sIGAgK1xuICAgICAgICAgICAgICAgIGBub21pbmF0ZWQ6ICR7cGFpci5ub21pbmF0ZWR9LCBgICtcbiAgICAgICAgICAgICAgICBgcmVxdWVzdHMgc2VudCAke3BhaXIucmVxdWVzdHNTZW50fSwgcmVxdWVzdHMgcmVjZWl2ZWQgICR7cGFpci5yZXF1ZXN0c1JlY2VpdmVkfSwgIGAgK1xuICAgICAgICAgICAgICAgIGByZXNwb25zZXMgcmVjZWl2ZWQ6ICR7cGFpci5yZXNwb25zZXNSZWNlaXZlZH0sIHJlc3BvbnNlcyBzZW50OiAke3BhaXIucmVzcG9uc2VzU2VudH0sIGAgK1xuICAgICAgICAgICAgICAgIGBieXRlcyByZWNlaXZlZDogJHtwYWlyLmJ5dGVzUmVjZWl2ZWR9LCBieXRlcyBzZW50OiAke3BhaXIuYnl0ZXNTZW50fSwgYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENhbGxBdWRpb0VsZW1lbnQoY2FsbDogTWF0cml4Q2FsbCkge1xuICAgICAgICBjb25zdCBhdWRpb0VsZW1lbnQgPSBnZXRSZW1vdGVBdWRpb0VsZW1lbnQoKTtcbiAgICAgICAgaWYgKGF1ZGlvRWxlbWVudCkgY2FsbC5zZXRSZW1vdGVBdWRpb0VsZW1lbnQoYXVkaW9FbGVtZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENhbGxTdGF0ZShjYWxsOiBNYXRyaXhDYWxsLCBzdGF0dXM6IENhbGxTdGF0ZSkge1xuICAgICAgICBjb25zdCBtYXBwZWRSb29tSWQgPSBDYWxsSGFuZGxlci5yb29tSWRGb3JDYWxsKGNhbGwpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgYENhbGwgc3RhdGUgaW4gJHttYXBwZWRSb29tSWR9IGNoYW5nZWQgdG8gJHtzdGF0dXN9YCxcbiAgICAgICAgKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnY2FsbF9zdGF0ZScsXG4gICAgICAgICAgICByb29tX2lkOiBtYXBwZWRSb29tSWQsXG4gICAgICAgICAgICBzdGF0ZTogc3RhdHVzLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZUNhbGxGb3JSb29tKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY2FsbHMuZGVsZXRlKHJvb21JZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93SUNFRmFsbGJhY2tQcm9tcHQoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgY29kZSA9IHN1YiA9PiA8Y29kZT57c3VifTwvY29kZT47XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ05vIFRVUk4gc2VydmVycycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiQ2FsbCBmYWlsZWQgZHVlIHRvIG1pc2NvbmZpZ3VyZWQgc2VydmVyXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSBhc2sgdGhlIGFkbWluaXN0cmF0b3Igb2YgeW91ciBob21lc2VydmVyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCIoPGNvZGU+JShob21lc2VydmVyRG9tYWluKXM8L2NvZGU+KSB0byBjb25maWd1cmUgYSBUVVJOIHNlcnZlciBpbiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwib3JkZXIgZm9yIGNhbGxzIHRvIHdvcmsgcmVsaWFibHkuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaG9tZXNlcnZlckRvbWFpbjogY2xpLmdldERvbWFpbigpIH0sIHsgY29kZSB9LFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBbHRlcm5hdGl2ZWx5LCB5b3UgY2FuIHRyeSB0byB1c2UgdGhlIHB1YmxpYyBzZXJ2ZXIgYXQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxjb2RlPnR1cm4ubWF0cml4Lm9yZzwvY29kZT4sIGJ1dCB0aGlzIHdpbGwgbm90IGJlIGFzIHJlbGlhYmxlLCBhbmQgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIml0IHdpbGwgc2hhcmUgeW91ciBJUCBhZGRyZXNzIHdpdGggdGhhdCBzZXJ2ZXIuIFlvdSBjYW4gYWxzbyBtYW5hZ2UgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInRoaXMgaW4gU2V0dGluZ3MuXCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsIHsgY29kZSB9LFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgYnV0dG9uOiBfdCgnVHJ5IHVzaW5nIHR1cm4ubWF0cml4Lm9yZycpLFxuICAgICAgICAgICAgY2FuY2VsQnV0dG9uOiBfdCgnT0snKSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChhbGxvdykgPT4ge1xuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgYWxsb3cpO1xuICAgICAgICAgICAgICAgIGNsaS5zZXRGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQoYWxsb3cpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93TWVkaWFDYXB0dXJlRXJyb3IoY2FsbDogTWF0cml4Q2FsbCkge1xuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbjtcblxuICAgICAgICBpZiAoY2FsbC50eXBlID09PSBDYWxsVHlwZS5Wb2ljZSkge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlVuYWJsZSB0byBhY2Nlc3MgbWljcm9waG9uZVwiKTtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gPGRpdj5cbiAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQ2FsbCBmYWlsZWQgYmVjYXVzZSBtaWNyb3Bob25lIGNvdWxkIG5vdCBiZSBhY2Nlc3NlZC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIkNoZWNrIHRoYXQgYSBtaWNyb3Bob25lIGlzIHBsdWdnZWQgaW4gYW5kIHNldCB1cCBjb3JyZWN0bHkuXCIsXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmIChjYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiVW5hYmxlIHRvIGFjY2VzcyB3ZWJjYW0gLyBtaWNyb3Bob25lXCIpO1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIHtfdChcIkNhbGwgZmFpbGVkIGJlY2F1c2Ugd2ViY2FtIG9yIG1pY3JvcGhvbmUgY291bGQgbm90IGJlIGFjY2Vzc2VkLiBDaGVjayB0aGF0OlwiKX1cbiAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJBIG1pY3JvcGhvbmUgYW5kIHdlYmNhbSBhcmUgcGx1Z2dlZCBpbiBhbmQgc2V0IHVwIGNvcnJlY3RseVwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiUGVybWlzc2lvbiBpcyBncmFudGVkIHRvIHVzZSB0aGUgd2ViY2FtXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJObyBvdGhlciBhcHBsaWNhdGlvbiBpcyB1c2luZyB0aGUgd2ViY2FtXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ01lZGlhIGNhcHR1cmUgZmFpbGVkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZSwgZGVzY3JpcHRpb24sXG4gICAgICAgIH0sIG51bGwsIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcGxhY2VDYWxsKFxuICAgICAgICByb29tSWQ6IHN0cmluZywgdHlwZTogUGxhY2VDYWxsVHlwZSxcbiAgICAgICAgbG9jYWxFbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50LCByZW1vdGVFbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50LFxuICAgICkge1xuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgndm9pcCcsICdwbGFjZUNhbGwnLCAndHlwZScsIHR5cGUpO1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrU3RhcnRDYWxsKHJvb21JZCwgdHlwZSA9PT0gUGxhY2VDYWxsVHlwZS5WaWRlbywgZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IG1hcHBlZFJvb21JZCA9IChhd2FpdCBnZXRPckNyZWF0ZVZpcnR1YWxSb29tRm9yUm9vbShyb29tSWQpKSB8fCByb29tSWQ7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIk1hcHBlZCByZWFsIHJvb20gXCIgKyByb29tSWQgKyBcIiB0byByb29tIElEIFwiICsgbWFwcGVkUm9vbUlkKTtcblxuICAgICAgICBjb25zdCBjYWxsID0gY3JlYXRlTmV3TWF0cml4Q2FsbChNYXRyaXhDbGllbnRQZWcuZ2V0KCksIG1hcHBlZFJvb21JZCk7XG5cbiAgICAgICAgdGhpcy5jYWxscy5zZXQocm9vbUlkLCBjYWxsKTtcblxuICAgICAgICB0aGlzLnNldENhbGxMaXN0ZW5lcnMoY2FsbCk7XG4gICAgICAgIHRoaXMuc2V0Q2FsbEF1ZGlvRWxlbWVudChjYWxsKTtcblxuICAgICAgICB0aGlzLnNldEFjdGl2ZUNhbGxSb29tSWQocm9vbUlkKTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gUGxhY2VDYWxsVHlwZS5Wb2ljZSkge1xuICAgICAgICAgICAgY2FsbC5wbGFjZVZvaWNlQ2FsbCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgIGNhbGwucGxhY2VWaWRlb0NhbGwoXG4gICAgICAgICAgICAgICAgcmVtb3RlRWxlbWVudCxcbiAgICAgICAgICAgICAgICBsb2NhbEVsZW1lbnQsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFBsYWNlQ2FsbFR5cGUuU2NyZWVuU2hhcmluZykge1xuICAgICAgICAgICAgY29uc3Qgc2NyZWVuQ2FwRXJyb3JTdHJpbmcgPSBQbGF0Zm9ybVBlZy5nZXQoKS5zY3JlZW5DYXB0dXJlRXJyb3JTdHJpbmcoKTtcbiAgICAgICAgICAgIGlmIChzY3JlZW5DYXBFcnJvclN0cmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2FsbEZvclJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbid0IGNhcHR1cmUgc2NyZWVuOiBcIiArIHNjcmVlbkNhcEVycm9yU3RyaW5nKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEhhbmRsZXInLCAnVW5hYmxlIHRvIGNhcHR1cmUgc2NyZWVuJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdVbmFibGUgdG8gY2FwdHVyZSBzY3JlZW4nKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHNjcmVlbkNhcEVycm9yU3RyaW5nLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FsbC5wbGFjZVNjcmVlblNoYXJpbmdDYWxsKFxuICAgICAgICAgICAgICAgIHJlbW90ZUVsZW1lbnQsXG4gICAgICAgICAgICAgICAgbG9jYWxFbGVtZW50LFxuICAgICAgICAgICAgICAgIGFzeW5jICgpIDogUHJvbWlzZTxEZXNrdG9wQ2FwdHVyZXJTb3VyY2U+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbc291cmNlXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVua25vd24gY29uZiBjYWxsIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAncGxhY2VfY2FsbCc6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBtaWdodCBiZSB1c2luZyBtYW5hZ2VkIGh5YnJpZCB3aWRnZXRzXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc01hbmFnZWRIeWJyaWRXaWRnZXRFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZE1hbmFnZWRIeWJyaWRXaWRnZXQocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBydW50aW1lIGVudiBkb2Vzbid0IGRvIFZvSVAsIHdoaW5lLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBIYW5kbGVyJywgJ1ZvSVAgaXMgdW5zdXBwb3J0ZWQnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVm9JUCBpcyB1bnN1cHBvcnRlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnWW91IGNhbm5vdCBwbGFjZSBWb0lQIGNhbGxzIGluIHRoaXMgYnJvd3Nlci4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgPiAyIGNhbGxzIHRvIGJlIHBsYWNlZC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0QWxsQWN0aXZlQ2FsbHMoKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEhhbmRsZXInLCAnRXhpc3RpbmcgQ2FsbCcsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdUb28gTWFueSBDYWxscycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIllvdSd2ZSByZWFjaGVkIHRoZSBtYXhpbXVtIG51bWJlciBvZiBzaW11bHRhbmVvdXMgY2FsbHMuXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBSb29tICR7cGF5bG9hZC5yb29tX2lkfSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lbWJlcnMgPSByb29tLmdldEpvaW5lZE1lbWJlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lbWJlcnMubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NhbGwgSGFuZGxlcicsICdDYW5ub3QgcGxhY2UgY2FsbCB3aXRoIHNlbGYnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnWW91IGNhbm5vdCBwbGFjZSBhIGNhbGwgd2l0aCB5b3Vyc2VsZi4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lbWJlcnMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFBsYWNlICR7cGF5bG9hZC50eXBlfSBjYWxsIGluICR7cGF5bG9hZC5yb29tX2lkfWApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYWNlQ2FsbChwYXlsb2FkLnJvb21faWQsIHBheWxvYWQudHlwZSwgcGF5bG9hZC5sb2NhbF9lbGVtZW50LCBwYXlsb2FkLnJlbW90ZV9lbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gPiAyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJwbGFjZV9jb25mZXJlbmNlX2NhbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBwYXlsb2FkLnJvb21faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogcGF5bG9hZC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW90ZV9lbGVtZW50OiBwYXlsb2FkLnJlbW90ZV9lbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsX2VsZW1lbnQ6IHBheWxvYWQubG9jYWxfZWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncGxhY2VfY29uZmVyZW5jZV9jYWxsJzpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJQbGFjZSBjb25mZXJlbmNlIGNhbGwgaW4gXCIgKyBwYXlsb2FkLnJvb21faWQpO1xuICAgICAgICAgICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCd2b2lwJywgJ3BsYWNlQ29uZmVyZW5jZUNhbGwnKTtcbiAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrU3RhcnRDYWxsKHBheWxvYWQucm9vbV9pZCwgcGF5bG9hZC50eXBlID09PSBQbGFjZUNhbGxUeXBlLlZpZGVvLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0Q2FsbEFwcChwYXlsb2FkLnJvb21faWQsIHBheWxvYWQudHlwZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlbmRfY29uZmVyZW5jZSc6XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFwiVGVybWluYXRpbmcgY29uZmVyZW5jZSBjYWxsIGluIFwiICsgcGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmF0ZUNhbGxBcHAocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hhbmd1cF9jb25mZXJlbmNlJzpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXCJMZWF2aW5nIGNvbmZlcmVuY2UgY2FsbCBpbiBcIisgcGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmd1cENhbGxBcHAocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2luY29taW5nX2NhbGwnOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIHJ1bnRpbWUgZW52IGRvZXNuJ3QgZG8gVm9JUCwgc3RvcCBoZXJlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5zdXBwb3J0c1ZvaXAoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbCA9IHBheWxvYWQuY2FsbCBhcyBNYXRyaXhDYWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hcHBlZFJvb21JZCA9IENhbGxIYW5kbGVyLnJvb21JZEZvckNhbGwoY2FsbCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldENhbGxGb3JSb29tKG1hcHBlZFJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSBtdWx0aXBsZSBpbmNvbWluZyBjYWxscyB0byB0aGUgc2FtZSByb29tXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgndm9pcCcsICdyZWNlaXZlQ2FsbCcsICd0eXBlJywgY2FsbC50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxscy5zZXQobWFwcGVkUm9vbUlkLCBjYWxsKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENhbGxMaXN0ZW5lcnMoY2FsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaGFuZ3VwJzpcbiAgICAgICAgICAgIGNhc2UgJ3JlamVjdCc6XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNhbGxzLmdldChwYXlsb2FkLnJvb21faWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gbm8gY2FsbCB0byBoYW5ndXBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAncmVqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxzLmdldChwYXlsb2FkLnJvb21faWQpLnJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbHMuZ2V0KHBheWxvYWQucm9vbV9pZCkuaGFuZ3VwKENhbGxFcnJvckNvZGUuVXNlckhhbmd1cCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkb24ndCByZW1vdmUgdGhlIGNhbGwgeWV0OiBsZXQgdGhlIGhhbmd1cCBldmVudCBoYW5kbGVyIGRvIGl0IChvdGhlcndpc2UgaXQgd2lsbCB0aHJvd1xuICAgICAgICAgICAgICAgIC8vIHRoZSBoYW5ndXAgZXZlbnQgYXdheSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2FsbHMuaGFzKHBheWxvYWQucm9vbV9pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBubyBjYWxsIHRvIGFuc3dlclxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldEFsbEFjdGl2ZUNhbGxzKCkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEhhbmRsZXInLCAnRXhpc3RpbmcgQ2FsbCcsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1RvbyBNYW55IENhbGxzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJZb3UndmUgcmVhY2hlZCB0aGUgbWF4aW11bSBudW1iZXIgb2Ygc2ltdWx0YW5lb3VzIGNhbGxzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsID0gdGhpcy5jYWxscy5nZXQocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBjYWxsLmFuc3dlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2FsbEF1ZGlvRWxlbWVudChjYWxsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZUNhbGxSb29tSWQocGF5bG9hZC5yb29tX2lkKTtcbiAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrSm9pbkNhbGwocGF5bG9hZC5yb29tX2lkLCBjYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBwYXlsb2FkLnJvb21faWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRBY3RpdmVDYWxsUm9vbUlkKGFjdGl2ZUNhbGxSb29tSWQ6IHN0cmluZykge1xuICAgICAgICBsb2dnZXIuaW5mbyhcIlNldHRpbmcgY2FsbCBpbiByb29tIFwiICsgYWN0aXZlQ2FsbFJvb21JZCArIFwiIGFjdGl2ZVwiKTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtyb29tSWQsIGNhbGxdIG9mIHRoaXMuY2FsbHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICBpZiAoY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLkVuZGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKHJvb21JZCA9PT0gYWN0aXZlQ2FsbFJvb21JZCkge1xuICAgICAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJIb2xkaW5nIGNhbGwgaW4gcm9vbSBcIiArIHJvb21JZCArIFwiIGJlY2F1c2UgYW5vdGhlciBjYWxsIGlzIGJlaW5nIHNldCBhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY2FsbC5zZXRSZW1vdGVPbkhvbGQodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHdlIGFyZSBjdXJyZW50bHkgaW4gYW55IGNhbGwgd2hlcmUgd2UgaGF2ZW4ndCBwdXQgdGhlIHJlbW90ZSBwYXJ0eSBvbiBob2xkXG4gICAgICovXG4gICAgaGFzQW55VW5oZWxkQ2FsbCgpIHtcbiAgICAgICAgZm9yIChjb25zdCBjYWxsIG9mIHRoaXMuY2FsbHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChjYWxsLnN0YXRlID09PSBDYWxsU3RhdGUuRW5kZWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFjYWxsLmlzUmVtb3RlT25Ib2xkKCkpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc3RhcnRDYWxsQXBwKHJvb21JZDogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2FwcHNEcmF3ZXInLFxuICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcHJldmVudCBkb3VibGUgY2xpY2tpbmcgdGhlIGNhbGwgYnV0dG9uXG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBjb25zdCBjdXJyZW50Sml0c2lXaWRnZXRzID0gV2lkZ2V0VXRpbHMuZ2V0Um9vbVdpZGdldHNPZlR5cGUocm9vbSwgV2lkZ2V0VHlwZS5KSVRTSSk7XG4gICAgICAgIGNvbnN0IGhhc0ppdHNpID0gY3VycmVudEppdHNpV2lkZ2V0cy5sZW5ndGggPiAwXG4gICAgICAgICAgICB8fCBXaWRnZXRFY2hvU3RvcmUucm9vbUhhc1BlbmRpbmdXaWRnZXRzT2ZUeXBlKHJvb21JZCwgY3VycmVudEppdHNpV2lkZ2V0cywgV2lkZ2V0VHlwZS5KSVRTSSk7XG4gICAgICAgIGlmIChoYXNKaXRzaSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ2FsbCBhbHJlYWR5IGluIHByb2dyZXNzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdDYWxsIGluIFByb2dyZXNzJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdBIGNhbGwgaXMgY3VycmVudGx5IGJlaW5nIHBsYWNlZCEnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgaml0c2lEb21haW4gPSBKaXRzaS5nZXRJbnN0YW5jZSgpLnByZWZlcnJlZERvbWFpbjtcbiAgICAgICAgY29uc3Qgaml0c2lBdXRoID0gYXdhaXQgSml0c2kuZ2V0SW5zdGFuY2UoKS5nZXRKaXRzaUF1dGgoKTtcbiAgICAgICAgbGV0IGNvbmZJZDtcbiAgICAgICAgaWYgKGppdHNpQXV0aCA9PT0gJ29wZW5pZHRva2VuLWp3dCcpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBjb25mZXJlbmNlIElEIGZyb20gcm9vbSBJRFxuICAgICAgICAgICAgLy8gRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBKaXRzaSwgdXNlIGJhc2UzMiB3aXRob3V0IHBhZGRpbmcuXG4gICAgICAgICAgICAvLyBNb3JlIGRldGFpbHMgaGVyZTpcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3Byb3NvZHktbW9kLWF1dGgtbWF0cml4LXVzZXItdmVyaWZpY2F0aW9uXG4gICAgICAgICAgICBjb25mSWQgPSBiYXNlMzIuc3RyaW5naWZ5KEJ1ZmZlci5mcm9tKHJvb21JZCksIHsgcGFkOiBmYWxzZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhIHJhbmRvbSBodW1hbiByZWFkYWJsZSBjb25mZXJlbmNlIElEXG4gICAgICAgICAgICBjb25mSWQgPSBgSml0c2lDb25mZXJlbmNlJHtnZW5lcmF0ZUh1bWFuUmVhZGFibGVJZCgpfWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgd2lkZ2V0VXJsID0gV2lkZ2V0VXRpbHMuZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwoe2F1dGg6IGppdHNpQXV0aH0pO1xuXG4gICAgICAgIC8vIFRPRE86IFJlbW92ZSBVUkwgaGFja3Mgd2hlbiB0aGUgbW9iaWxlIGNsaWVudHMgZXZlbnR1YWxseSBzdXBwb3J0IHYyIHdpZGdldHNcbiAgICAgICAgY29uc3QgcGFyc2VkVXJsID0gbmV3IFVSTCh3aWRnZXRVcmwpO1xuICAgICAgICBwYXJzZWRVcmwuc2VhcmNoID0gJyc7IC8vIHNldCB0byBlbXB0eSBzdHJpbmcgdG8gbWFrZSB0aGUgVVJMIGNsYXNzIHVzZSBzZWFyY2hQYXJhbXMgaW5zdGVhZFxuICAgICAgICBwYXJzZWRVcmwuc2VhcmNoUGFyYW1zLnNldCgnY29uZklkJywgY29uZklkKTtcbiAgICAgICAgd2lkZ2V0VXJsID0gcGFyc2VkVXJsLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3Qgd2lkZ2V0RGF0YSA9IHtcbiAgICAgICAgICAgIGNvbmZlcmVuY2VJZDogY29uZklkLFxuICAgICAgICAgICAgaXNBdWRpb09ubHk6IHR5cGUgPT09ICd2b2ljZScsXG4gICAgICAgICAgICBkb21haW46IGppdHNpRG9tYWluLFxuICAgICAgICAgICAgYXV0aDogaml0c2lBdXRoLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHdpZGdldElkID0gKFxuICAgICAgICAgICAgJ2ppdHNpXycgK1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZCArXG4gICAgICAgICAgICAnXycgK1xuICAgICAgICAgICAgRGF0ZS5ub3coKVxuICAgICAgICApO1xuXG4gICAgICAgIFdpZGdldFV0aWxzLnNldFJvb21XaWRnZXQocm9vbUlkLCB3aWRnZXRJZCwgV2lkZ2V0VHlwZS5KSVRTSSwgd2lkZ2V0VXJsLCAnSml0c2knLCB3aWRnZXREYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdKaXRzaSB3aWRnZXQgYWRkZWQnKTtcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLmVycmNvZGUgPT09ICdNX0ZPUkJJRERFTicpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDYWxsIEZhaWxlZCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1Blcm1pc3Npb24gUmVxdWlyZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gc3RhcnQgYSBjb25mZXJlbmNlIGNhbGwgaW4gdGhpcyByb29tXCIpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0ZXJtaW5hdGVDYWxsQXBwKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NvbmZpcm0gSml0c2kgVGVybWluYXRlJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICBoYXNDYW5jZWxCdXR0b246IHRydWUsXG4gICAgICAgICAgICB0aXRsZTogX3QoXCJFbmQgY29uZmVyZW5jZVwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlRoaXMgd2lsbCBlbmQgdGhlIGNvbmZlcmVuY2UgZm9yIGV2ZXJ5b25lLiBDb250aW51ZT9cIiksXG4gICAgICAgICAgICBidXR0b246IF90KFwiRW5kIGNvbmZlcmVuY2VcIiksXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UnbGwganVzdCBvYmxpdGVyYXRlIHRoZW0gYWxsLiBUaGVyZSBzaG91bGQgb25seSBldmVyIGJlIG9uZSwgYnV0IG1pZ2h0IGFzIHdlbGxcbiAgICAgICAgICAgICAgICAvLyBiZSBzYWZlLlxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JbmZvID0gV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGppdHNpV2lkZ2V0cyA9IHJvb21JbmZvLndpZGdldHMuZmlsdGVyKHcgPT4gV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHcudHlwZSkpO1xuICAgICAgICAgICAgICAgIGppdHNpV2lkZ2V0cy5mb3JFYWNoKHcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIGludmFsaWQgY29udGVudCByZW1vdmVzIGl0XG4gICAgICAgICAgICAgICAgICAgIFdpZGdldFV0aWxzLnNldFJvb21XaWRnZXQocm9vbUlkLCB3LmlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZ3VwQ2FsbEFwcChyb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCByb29tSW5mbyA9IFdpZGdldFN0b3JlLmluc3RhbmNlLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgaWYgKCFyb29tSW5mbykgcmV0dXJuOyAvLyBcInNob3VsZCBuZXZlciBoYXBwZW5cIiBjbGF1c2VzIGdvIGhlcmVcblxuICAgICAgICBjb25zdCBqaXRzaVdpZGdldHMgPSByb29tSW5mby53aWRnZXRzLmZpbHRlcih3ID0+IFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh3LnR5cGUpKTtcbiAgICAgICAgaml0c2lXaWRnZXRzLmZvckVhY2godyA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdpbmcgPSBXaWRnZXRNZXNzYWdpbmdTdG9yZS5pbnN0YW5jZS5nZXRNZXNzYWdpbmdGb3JJZCh3LmlkKTtcbiAgICAgICAgICAgIGlmICghbWVzc2FnaW5nKSByZXR1cm47IC8vIG1vcmUgXCJzaG91bGQgbmV2ZXIgaGFwcGVuXCIgd29yZHNcblxuICAgICAgICAgICAgbWVzc2FnaW5nLnRyYW5zcG9ydC5zZW5kKEVsZW1lbnRXaWRnZXRBY3Rpb25zLkhhbmd1cENhbGwsIHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19