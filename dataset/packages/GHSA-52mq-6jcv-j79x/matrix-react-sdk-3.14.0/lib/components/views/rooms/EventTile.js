"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHandlerTile = getHandlerTile;
exports.haveTileForEvent = haveTileForEvent;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _ReplyThread = _interopRequireDefault(require("../elements/ReplyThread"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _languageHandler = require("../../../languageHandler");

var TextForEvent = _interopRequireWildcard(require("../../../TextForEvent"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _matrixJsSdk = require("matrix-js-sdk");

var _DateUtils = require("../../../DateUtils");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _BanList = require("../../../mjolnir/BanList");

var ObjectUtils = _interopRequireWildcard(require("../../../ObjectUtils"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _E2EIcon = require("./E2EIcon");

var _units = require("../../../utils/units");

var _WidgetType = require("../../../widgets/WidgetType");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _WidgetLayoutStore = require("../../../stores/widgets/WidgetLayoutStore");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
const eventTileTypes = {
  'm.room.message': 'messages.MessageEvent',
  'm.sticker': 'messages.MessageEvent',
  'm.key.verification.cancel': 'messages.MKeyVerificationConclusion',
  'm.key.verification.done': 'messages.MKeyVerificationConclusion',
  'm.room.encryption': 'messages.EncryptionEvent',
  'm.call.invite': 'messages.TextualEvent',
  'm.call.answer': 'messages.TextualEvent',
  'm.call.hangup': 'messages.TextualEvent',
  'm.call.reject': 'messages.TextualEvent'
};
const stateEventTileTypes = {
  'm.room.encryption': 'messages.EncryptionEvent',
  'm.room.canonical_alias': 'messages.TextualEvent',
  'm.room.create': 'messages.RoomCreate',
  'm.room.member': 'messages.TextualEvent',
  'm.room.name': 'messages.TextualEvent',
  'm.room.avatar': 'messages.RoomAvatarEvent',
  'm.room.third_party_invite': 'messages.TextualEvent',
  'm.room.history_visibility': 'messages.TextualEvent',
  'm.room.topic': 'messages.TextualEvent',
  'm.room.power_levels': 'messages.TextualEvent',
  'm.room.pinned_events': 'messages.TextualEvent',
  'm.room.server_acl': 'messages.TextualEvent',
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  'im.vector.modular.widgets': 'messages.TextualEvent',
  [_WidgetLayoutStore.WIDGET_LAYOUT_EVENT_TYPE]: 'messages.TextualEvent',
  'm.room.tombstone': 'messages.TextualEvent',
  'm.room.join_rules': 'messages.TextualEvent',
  'm.room.guest_access': 'messages.TextualEvent',
  'm.room.related_groups': 'messages.TextualEvent'
}; // Add all the Mjolnir stuff to the renderer

for (const evType of _BanList.ALL_RULE_TYPES) {
  stateEventTileTypes[evType] = 'messages.TextualEvent';
}

function getHandlerTile(ev) {
  const type = ev.getType(); // don't show verification requests we're not involved in,
  // not even when showing hidden events

  if (type === "m.room.message") {
    const content = ev.getContent();

    if (content && content.msgtype === "m.key.verification.request") {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const me = client && client.getUserId();

      if (ev.getSender() !== me && content.to !== me) {
        return undefined;
      } else {
        return "messages.MKeyVerificationRequest";
      }
    }
  } // these events are sent by both parties during verification, but we only want to render one
  // tile once the verification concludes, so filter out the one from the other party.


  if (type === "m.key.verification.done") {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const me = client && client.getUserId();

    if (ev.getSender() !== me) {
      return undefined;
    }
  } // sometimes MKeyVerificationConclusion declines to render.  Jankily decline to render and
  // fall back to showing hidden events, if we're viewing hidden events
  // XXX: This is extremely a hack. Possibly these components should have an interface for
  // declining to render?


  if (type === "m.key.verification.cancel" || type === "m.key.verification.done") {
    const MKeyVerificationConclusion = sdk.getComponent("messages.MKeyVerificationConclusion");

    if (!MKeyVerificationConclusion.prototype._shouldRender.call(null, ev, ev.request)) {
      return;
    }
  } // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


  if (type === "im.vector.modular.widgets") {
    let type = ev.getContent()['type'];

    if (!type) {
      // deleted/invalid widget - try the past widget type
      type = ev.getPrevContent()['type'];
    }

    if (_WidgetType.WidgetType.JITSI.matches(type)) {
      return "messages.MJitsiWidgetEvent";
    }
  }

  return ev.isState() ? stateEventTileTypes[type] : eventTileTypes[type];
}

const MAX_READ_AVATARS = 5; // Our component structure for EventTiles on the timeline is:
//
// .-EventTile------------------------------------------------.
// | MemberAvatar (SenderProfile)                   TimeStamp |
// |    .-{Message,Textual}Event---------------. Read Avatars |
// |    |   .-MFooBody-------------------.     |              |
// |    |   |  (only if MessageEvent)    |     |              |
// |    |   '----------------------------'     |              |
// |    '--------------------------------------'              |
// '----------------------------------------------------------'

class EventTile extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "_onDecrypted", () => {
      // we need to re-verify the sending device.
      // (we call onHeightChanged in _verifyEvent to handle the case where decryption
      // has caused a change in size of the event tile)
      this._verifyEvent(this.props.mxEvent);

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onDeviceVerificationChanged", (userId, device) => {
      if (userId === this.props.mxEvent.getSender()) {
        this._verifyEvent(this.props.mxEvent);
      }
    });
    (0, _defineProperty2.default)(this, "onUserVerificationChanged", (userId, _trustStatus) => {
      if (userId === this.props.mxEvent.getSender()) {
        this._verifyEvent(this.props.mxEvent);
      }
    });
    (0, _defineProperty2.default)(this, "toggleAllReadAvatars", () => {
      this.setState({
        allReadAvatars: !this.state.allReadAvatars
      });
    });
    (0, _defineProperty2.default)(this, "onSenderProfileClick", event => {
      const mxEvent = this.props.mxEvent;

      _dispatcher.default.dispatch({
        action: 'insert_mention',
        user_id: mxEvent.getSender()
      });
    });
    (0, _defineProperty2.default)(this, "onRequestKeysClick", () => {
      this.setState({
        // Indicate in the UI that the keys have been requested (this is expected to
        // be reset if the component is mounted in the future).
        previouslyRequestedKeys: true
      }); // Cancel any outgoing key request for this event and resend it. If a response
      // is received for the request with the required keys, the event could be
      // decrypted successfully.

      this.context.cancelAndResendEventRoomKeyRequest(this.props.mxEvent);
    });
    (0, _defineProperty2.default)(this, "onPermalinkClicked", e => {
      // This allows the permalink to be opened in a new tab/window or copied as
      // matrix.to, but also for it to enable routing within Element when clicked.
      e.preventDefault();

      _dispatcher.default.dispatch({
        action: 'view_room',
        event_id: this.props.mxEvent.getId(),
        highlighted: true,
        room_id: this.props.mxEvent.getRoomId()
      });
    });
    (0, _defineProperty2.default)(this, "onActionBarFocusChange", focused => {
      this.setState({
        actionBarFocused: focused
      });
    });
    (0, _defineProperty2.default)(this, "getTile", () => this._tile.current);
    (0, _defineProperty2.default)(this, "getReplyThread", () => this._replyThread.current);
    (0, _defineProperty2.default)(this, "getReactions", () => {
      if (!this.props.showReactions || !this.props.getRelationsForEvent) {
        return null;
      }

      const eventId = this.props.mxEvent.getId();

      if (!eventId) {
        // XXX: Temporary diagnostic logging for https://github.com/vector-im/element-web/issues/11120
        console.error("EventTile attempted to get relations for an event without an ID"); // Use event's special `toJSON` method to log key data.

        console.log(JSON.stringify(this.props.mxEvent, null, 4));
        console.trace("Stacktrace for https://github.com/vector-im/element-web/issues/11120");
      }

      return this.props.getRelationsForEvent(eventId, "m.annotation", "m.reaction");
    });
    (0, _defineProperty2.default)(this, "_onReactionsCreated", (relationType, eventType) => {
      if (relationType !== "m.annotation" || eventType !== "m.reaction") {
        return;
      }

      this.props.mxEvent.removeListener("Event.relationsCreated", this._onReactionsCreated);
      this.setState({
        reactions: this.getReactions()
      });
    });
    this.state = {
      // Whether the action bar is focused.
      actionBarFocused: false,
      // Whether all read receipts are being displayed. If not, only display
      // a truncation of them.
      allReadAvatars: false,
      // Whether the event's sender has been verified.
      verified: null,
      // Whether onRequestKeysClick has been called since mounting.
      previouslyRequestedKeys: false,
      // The Relations model from the JS SDK for reactions to `mxEvent`
      reactions: this.getReactions()
    }; // don't do RR animations until we are mounted

    this._suppressReadReceiptAnimation = true;
    this._tile = /*#__PURE__*/(0, _react.createRef)();
    this._replyThread = /*#__PURE__*/(0, _react.createRef)();
  } // TODO: [REACT-WARNING] Move into constructor
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillMount() {
    this._verifyEvent(this.props.mxEvent);
  }

  componentDidMount() {
    this._suppressReadReceiptAnimation = false;
    const client = this.context;
    client.on("deviceVerificationChanged", this.onDeviceVerificationChanged);
    client.on("userTrustStatusChanged", this.onUserVerificationChanged);
    this.props.mxEvent.on("Event.decrypted", this._onDecrypted);

    if (this.props.showReactions) {
      this.props.mxEvent.on("Event.relationsCreated", this._onReactionsCreated);
    }
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(nextProps) {
    // re-check the sender verification as outgoing events progress through
    // the send process.
    if (nextProps.eventSendStatus !== this.props.eventSendStatus) {
      this._verifyEvent(nextProps.mxEvent);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!ObjectUtils.shallowEqual(this.state, nextState)) {
      return true;
    }

    return !this._propsEqual(this.props, nextProps);
  }

  componentWillUnmount() {
    const client = this.context;
    client.removeListener("deviceVerificationChanged", this.onDeviceVerificationChanged);
    client.removeListener("userTrustStatusChanged", this.onUserVerificationChanged);
    this.props.mxEvent.removeListener("Event.decrypted", this._onDecrypted);

    if (this.props.showReactions) {
      this.props.mxEvent.removeListener("Event.relationsCreated", this._onReactionsCreated);
    }
  }
  /** called when the event is decrypted after we show it.
   */


  async _verifyEvent(mxEvent) {
    if (!mxEvent.isEncrypted()) {
      return;
    }

    const encryptionInfo = this.context.getEventEncryptionInfo(mxEvent);
    const senderId = mxEvent.getSender();
    const userTrust = this.context.checkUserTrust(senderId);

    if (encryptionInfo.mismatchedSender) {
      // something definitely wrong is going on here
      this.setState({
        verified: _E2EIcon.E2E_STATE.WARNING
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    if (!userTrust.isCrossSigningVerified()) {
      // user is not verified, so default to everything is normal
      this.setState({
        verified: _E2EIcon.E2E_STATE.NORMAL
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    const eventSenderTrust = encryptionInfo.sender && this.context.checkDeviceTrust(senderId, encryptionInfo.sender.deviceId);

    if (!eventSenderTrust) {
      this.setState({
        verified: _E2EIcon.E2E_STATE.UNKNOWN
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    if (!eventSenderTrust.isVerified()) {
      this.setState({
        verified: _E2EIcon.E2E_STATE.WARNING
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    if (!encryptionInfo.authenticated) {
      this.setState({
        verified: _E2EIcon.E2E_STATE.UNAUTHENTICATED
      }, this.props.onHeightChanged); // Decryption may have caused a change in size

      return;
    }

    this.setState({
      verified: _E2EIcon.E2E_STATE.VERIFIED
    }, this.props.onHeightChanged); // Decryption may have caused a change in size
  }

  _propsEqual(objA, objB) {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];

      if (!objB.hasOwnProperty(key)) {
        return false;
      } // need to deep-compare readReceipts


      if (key === 'readReceipts') {
        const rA = objA[key];
        const rB = objB[key];

        if (rA === rB) {
          continue;
        }

        if (!rA || !rB) {
          return false;
        }

        if (rA.length !== rB.length) {
          return false;
        }

        for (let j = 0; j < rA.length; j++) {
          if (rA[j].userId !== rB[j].userId) {
            return false;
          } // one has a member set and the other doesn't?


          if (rA[j].roomMember !== rB[j].roomMember) {
            return false;
          }
        }
      } else {
        if (objA[key] !== objB[key]) {
          return false;
        }
      }
    }

    return true;
  }

  shouldHighlight() {
    const actions = this.context.getPushActionsForEvent(this.props.mxEvent.replacingEvent() || this.props.mxEvent);

    if (!actions || !actions.tweaks) {
      return false;
    } // don't show self-highlights from another of our clients


    if (this.props.mxEvent.getSender() === this.context.credentials.userId) {
      return false;
    }

    return actions.tweaks.highlight;
  }

  getReadAvatars() {
    // return early if there are no read receipts
    if (!this.props.readReceipts || this.props.readReceipts.length === 0) {
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_EventTile_readAvatars"
      });
    }

    const ReadReceiptMarker = sdk.getComponent('rooms.ReadReceiptMarker');
    const avatars = [];
    const receiptOffset = 15;
    let left = 0;
    const receipts = this.props.readReceipts || [];

    for (let i = 0; i < receipts.length; ++i) {
      const receipt = receipts[i];
      let hidden = true;

      if (i < MAX_READ_AVATARS || this.state.allReadAvatars) {
        hidden = false;
      } // TODO: we keep the extra read avatars in the dom to make animation simpler
      // we could optimise this to reduce the dom size.
      // If hidden, set offset equal to the offset of the final visible avatar or
      // else set it proportional to index


      left = (hidden ? MAX_READ_AVATARS - 1 : i) * -receiptOffset;
      const userId = receipt.userId;
      let readReceiptInfo;

      if (this.props.readReceiptMap) {
        readReceiptInfo = this.props.readReceiptMap[userId];

        if (!readReceiptInfo) {
          readReceiptInfo = {};
          this.props.readReceiptMap[userId] = readReceiptInfo;
        }
      } // add to the start so the most recent is on the end (ie. ends up rightmost)


      avatars.unshift( /*#__PURE__*/_react.default.createElement(ReadReceiptMarker, {
        key: userId,
        member: receipt.roomMember,
        fallbackUserId: userId,
        leftOffset: left,
        hidden: hidden,
        readReceiptInfo: readReceiptInfo,
        checkUnmounting: this.props.checkUnmounting,
        suppressAnimation: this._suppressReadReceiptAnimation,
        onClick: this.toggleAllReadAvatars,
        timestamp: receipt.ts,
        showTwelveHour: this.props.isTwelveHour
      }));
    }

    let remText;

    if (!this.state.allReadAvatars) {
      const remainder = receipts.length - MAX_READ_AVATARS;

      if (remainder > 0) {
        remText = /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_EventTile_readAvatarRemainder",
          onClick: this.toggleAllReadAvatars,
          style: {
            right: "calc(" + (0, _units.toRem)(-left) + " + " + receiptOffset + "px)"
          }
        }, remainder, "+");
      }
    }

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_readAvatars"
    }, remText, avatars);
  }

  _renderE2EPadlock() {
    const ev = this.props.mxEvent; // event could not be decrypted

    if (ev.getContent().msgtype === 'm.bad.encrypted') {
      return /*#__PURE__*/_react.default.createElement(E2ePadlockUndecryptable, null);
    } // event is encrypted, display padlock corresponding to whether or not it is verified


    if (ev.isEncrypted()) {
      if (this.state.verified === _E2EIcon.E2E_STATE.NORMAL) {
        return; // no icon if we've not even cross-signed the user
      } else if (this.state.verified === _E2EIcon.E2E_STATE.VERIFIED) {
        return; // no icon for verified
      } else if (this.state.verified === _E2EIcon.E2E_STATE.UNAUTHENTICATED) {
        return /*#__PURE__*/_react.default.createElement(E2ePadlockUnauthenticated, null);
      } else if (this.state.verified === _E2EIcon.E2E_STATE.UNKNOWN) {
        return /*#__PURE__*/_react.default.createElement(E2ePadlockUnknown, null);
      } else {
        return /*#__PURE__*/_react.default.createElement(E2ePadlockUnverified, null);
      }
    }

    if (this.context.isRoomEncrypted(ev.getRoomId())) {
      // else if room is encrypted
      // and event is being encrypted or is not_sent (Unknown Devices/Network Error)
      if (ev.status === _matrixJsSdk.EventStatus.ENCRYPTING) {
        return;
      }

      if (ev.status === _matrixJsSdk.EventStatus.NOT_SENT) {
        return;
      }

      if (ev.isState()) {
        return; // we expect this to be unencrypted
      } // if the event is not encrypted, but it's an e2e room, show the open padlock


      return /*#__PURE__*/_react.default.createElement(E2ePadlockUnencrypted, null);
    } // no padlock needed


    return null;
  }

  render() {
    const MessageTimestamp = sdk.getComponent('messages.MessageTimestamp');
    const SenderProfile = sdk.getComponent('messages.SenderProfile');
    const MemberAvatar = sdk.getComponent('avatars.MemberAvatar'); //console.info("EventTile showUrlPreview for %s is %s", this.props.mxEvent.getId(), this.props.showUrlPreview);

    const content = this.props.mxEvent.getContent();
    const msgtype = content.msgtype;
    const eventType = this.props.mxEvent.getType();
    let tileHandler = getHandlerTile(this.props.mxEvent); // Info messages are basically information about commands processed on a room

    const isBubbleMessage = eventType.startsWith("m.key.verification") || eventType === _event.EventType.RoomMessage && msgtype && msgtype.startsWith("m.key.verification") || eventType === _event.EventType.RoomCreate || eventType === _event.EventType.RoomEncryption || tileHandler === "messages.MJitsiWidgetEvent";
    let isInfoMessage = !isBubbleMessage && eventType !== _event.EventType.RoomMessage && eventType !== _event.EventType.Sticker && eventType !== _event.EventType.RoomCreate; // If we're showing hidden events in the timeline, we should use the
    // source tile when there's no regular tile for an event and also for
    // replace relations (which otherwise would display as a confusing
    // duplicate of the thing they are replacing).

    if (_SettingsStore.default.getValue("showHiddenEventsInTimeline") && !haveTileForEvent(this.props.mxEvent)) {
      tileHandler = "messages.ViewSourceEvent"; // Reuse info message avatar and sender profile styling

      isInfoMessage = true;
    } // This shouldn't happen: the caller should check we support this type
    // before trying to instantiate us


    if (!tileHandler) {
      const {
        mxEvent
      } = this.props;
      console.warn(`Event type not supported: type:${mxEvent.getType()} isState:${mxEvent.isState()}`);
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile mx_EventTile_info mx_MNoticeBody"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile_line"
      }, (0, _languageHandler._t)('This event could not be displayed')));
    }

    const EventTileType = sdk.getComponent(tileHandler);
    const isSending = ['sending', 'queued', 'encrypting'].indexOf(this.props.eventSendStatus) !== -1;
    const isRedacted = isMessageEvent(this.props.mxEvent) && this.props.isRedacted;
    const isEncryptionFailure = this.props.mxEvent.isDecryptionFailure();
    const isEditing = !!this.props.editState;
    const classes = (0, _classnames.default)({
      mx_EventTile_bubbleContainer: isBubbleMessage,
      mx_EventTile: true,
      mx_EventTile_isEditing: isEditing,
      mx_EventTile_info: isInfoMessage,
      mx_EventTile_12hr: this.props.isTwelveHour,
      mx_EventTile_encrypting: this.props.eventSendStatus === 'encrypting',
      mx_EventTile_sending: !isEditing && isSending,
      mx_EventTile_notSent: this.props.eventSendStatus === 'not_sent',
      mx_EventTile_highlight: this.props.tileShape === 'notif' ? false : this.shouldHighlight(),
      mx_EventTile_selected: this.props.isSelectedEvent,
      mx_EventTile_continuation: this.props.tileShape ? '' : this.props.continuation,
      mx_EventTile_last: this.props.last,
      mx_EventTile_lastInSection: this.props.lastInSection,
      mx_EventTile_contextual: this.props.contextual,
      mx_EventTile_actionBarFocused: this.state.actionBarFocused,
      mx_EventTile_verified: !isBubbleMessage && this.state.verified === _E2EIcon.E2E_STATE.VERIFIED,
      mx_EventTile_unverified: !isBubbleMessage && this.state.verified === _E2EIcon.E2E_STATE.WARNING,
      mx_EventTile_unknown: !isBubbleMessage && this.state.verified === _E2EIcon.E2E_STATE.UNKNOWN,
      mx_EventTile_bad: isEncryptionFailure,
      mx_EventTile_emote: msgtype === 'm.emote'
    }); // If the tile is in the Sending state, don't speak the message.

    const ariaLive = this.props.eventSendStatus !== null ? 'off' : undefined;
    let permalink = "#";

    if (this.props.permalinkCreator) {
      permalink = this.props.permalinkCreator.forEvent(this.props.mxEvent.getId());
    }

    const readAvatars = this.getReadAvatars();
    let avatar;
    let sender;
    let avatarSize;
    let needsSenderProfile;

    if (this.props.tileShape === "notif") {
      avatarSize = 24;
      needsSenderProfile = true;
    } else if (tileHandler === 'messages.RoomCreate' || isBubbleMessage) {
      avatarSize = 0;
      needsSenderProfile = false;
    } else if (isInfoMessage) {
      // a small avatar, with no sender profile, for
      // joins/parts/etc
      avatarSize = 14;
      needsSenderProfile = false;
    } else if (this.props.useIRCLayout) {
      avatarSize = 14;
      needsSenderProfile = true;
    } else if (this.props.continuation && this.props.tileShape !== "file_grid") {
      // no avatar or sender profile for continuation messages
      avatarSize = 0;
      needsSenderProfile = false;
    } else {
      avatarSize = 30;
      needsSenderProfile = true;
    }

    if (this.props.mxEvent.sender && avatarSize) {
      let member; // set member to receiver (target) if it is a 3PID invite
      // so that the correct avatar is shown as the text is
      // `$target accepted the invitation for $email`

      if (this.props.mxEvent.getContent().third_party_invite) {
        member = this.props.mxEvent.target;
      } else {
        member = this.props.mxEvent.sender;
      }

      avatar = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile_avatar"
      }, /*#__PURE__*/_react.default.createElement(MemberAvatar, {
        member: member,
        width: avatarSize,
        height: avatarSize,
        viewUserOnClick: true
      }));
    }

    if (needsSenderProfile) {
      let text = null;

      if (!this.props.tileShape || this.props.tileShape === 'reply' || this.props.tileShape === 'reply_preview') {
        if (msgtype === 'm.image') text = (0, _languageHandler._td)('%(senderName)s sent an image');else if (msgtype === 'm.video') text = (0, _languageHandler._td)('%(senderName)s sent a video');else if (msgtype === 'm.file') text = (0, _languageHandler._td)('%(senderName)s uploaded a file');
        sender = /*#__PURE__*/_react.default.createElement(SenderProfile, {
          onClick: this.onSenderProfileClick,
          mxEvent: this.props.mxEvent,
          enableFlair: this.props.enableFlair && !text,
          text: text
        });
      } else {
        sender = /*#__PURE__*/_react.default.createElement(SenderProfile, {
          mxEvent: this.props.mxEvent,
          enableFlair: this.props.enableFlair
        });
      }
    }

    const MessageActionBar = sdk.getComponent('messages.MessageActionBar');
    const actionBar = !isEditing ? /*#__PURE__*/_react.default.createElement(MessageActionBar, {
      mxEvent: this.props.mxEvent,
      reactions: this.state.reactions,
      permalinkCreator: this.props.permalinkCreator,
      getTile: this.getTile,
      getReplyThread: this.getReplyThread,
      onFocusChange: this.onActionBarFocusChange
    }) : undefined;
    const timestamp = this.props.mxEvent.getTs() ? /*#__PURE__*/_react.default.createElement(MessageTimestamp, {
      showTwelveHour: this.props.isTwelveHour,
      ts: this.props.mxEvent.getTs()
    }) : null;

    const keyRequestHelpText = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EventTile_keyRequestInfo_tooltip_contents"
    }, /*#__PURE__*/_react.default.createElement("p", null, this.state.previouslyRequestedKeys ? (0, _languageHandler._t)('Your key share request has been sent - please check your other sessions ' + 'for key share requests.') : (0, _languageHandler._t)('Key share requests are sent to your other sessions automatically. If you ' + 'rejected or dismissed the key share request on your other sessions, click ' + 'here to request the keys for this session again.')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('If your other sessions do not have the key for this message you will not ' + 'be able to decrypt them.')));

    const keyRequestInfoContent = this.state.previouslyRequestedKeys ? (0, _languageHandler._t)('Key request sent.') : (0, _languageHandler._t)('<requestLink>Re-request encryption keys</requestLink> from your other sessions.', {}, {
      'requestLink': sub => /*#__PURE__*/_react.default.createElement("a", {
        onClick: this.onRequestKeysClick
      }, sub)
    });
    const TooltipButton = sdk.getComponent('elements.TooltipButton');
    const keyRequestInfo = isEncryptionFailure ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EventTile_keyRequestInfo"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_keyRequestInfo_text"
    }, keyRequestInfoContent), /*#__PURE__*/_react.default.createElement(TooltipButton, {
      helpText: keyRequestHelpText
    })) : null;
    let reactionsRow;

    if (!isRedacted) {
      const ReactionsRow = sdk.getComponent('messages.ReactionsRow');
      reactionsRow = /*#__PURE__*/_react.default.createElement(ReactionsRow, {
        mxEvent: this.props.mxEvent,
        reactions: this.state.reactions
      });
    }

    const linkedTimestamp = /*#__PURE__*/_react.default.createElement("a", {
      href: permalink,
      onClick: this.onPermalinkClicked,
      "aria-label": (0, _DateUtils.formatTime)(new Date(this.props.mxEvent.getTs()), this.props.isTwelveHour)
    }, timestamp);

    const groupTimestamp = !this.props.useIRCLayout ? linkedTimestamp : null;
    const ircTimestamp = this.props.useIRCLayout ? linkedTimestamp : null;

    const groupPadlock = !this.props.useIRCLayout && !isBubbleMessage && this._renderE2EPadlock();

    const ircPadlock = this.props.useIRCLayout && !isBubbleMessage && this._renderE2EPadlock();

    switch (this.props.tileShape) {
      case 'notif':
        {
          const room = this.context.getRoom(this.props.mxEvent.getRoomId());
          return /*#__PURE__*/_react.default.createElement("div", {
            className: classes,
            "aria-live": ariaLive,
            "aria-atomic": "true"
          }, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_roomName"
          }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
            room: room,
            width: 28,
            height: 28
          }), /*#__PURE__*/_react.default.createElement("a", {
            href: permalink,
            onClick: this.onPermalinkClicked
          }, room ? room.name : '')), /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_senderDetails"
          }, avatar, /*#__PURE__*/_react.default.createElement("a", {
            href: permalink,
            onClick: this.onPermalinkClicked
          }, sender, timestamp)), /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_line"
          }, /*#__PURE__*/_react.default.createElement(EventTileType, {
            ref: this._tile,
            mxEvent: this.props.mxEvent,
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            showUrlPreview: this.props.showUrlPreview,
            onHeightChanged: this.props.onHeightChanged
          })));
        }

      case 'file_grid':
        {
          return /*#__PURE__*/_react.default.createElement("div", {
            className: classes,
            "aria-live": ariaLive,
            "aria-atomic": "true"
          }, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_line"
          }, /*#__PURE__*/_react.default.createElement(EventTileType, {
            ref: this._tile,
            mxEvent: this.props.mxEvent,
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            showUrlPreview: this.props.showUrlPreview,
            tileShape: this.props.tileShape,
            onHeightChanged: this.props.onHeightChanged
          })), /*#__PURE__*/_react.default.createElement("a", {
            className: "mx_EventTile_senderDetailsLink",
            href: permalink,
            onClick: this.onPermalinkClicked
          }, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_senderDetails"
          }, sender, timestamp)));
        }

      case 'reply':
      case 'reply_preview':
        {
          let thread;

          if (this.props.tileShape === 'reply_preview') {
            thread = _ReplyThread.default.makeThread(this.props.mxEvent, this.props.onHeightChanged, this.props.permalinkCreator, this._replyThread);
          }

          return /*#__PURE__*/_react.default.createElement("div", {
            className: classes,
            "aria-live": ariaLive,
            "aria-atomic": "true"
          }, ircTimestamp, avatar, sender, ircPadlock, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_reply"
          }, groupTimestamp, groupPadlock, thread, /*#__PURE__*/_react.default.createElement(EventTileType, {
            ref: this._tile,
            mxEvent: this.props.mxEvent,
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            onHeightChanged: this.props.onHeightChanged,
            replacingEventId: this.props.replacingEventId,
            showUrlPreview: false
          })));
        }

      default:
        {
          const thread = _ReplyThread.default.makeThread(this.props.mxEvent, this.props.onHeightChanged, this.props.permalinkCreator, this._replyThread, this.props.useIRCLayout); // tab-index=-1 to allow it to be focusable but do not add tab stop for it, primarily for screen readers


          return /*#__PURE__*/_react.default.createElement("div", {
            className: classes,
            tabIndex: -1,
            "aria-live": ariaLive,
            "aria-atomic": "true"
          }, ircTimestamp, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_msgOption"
          }, readAvatars), sender, ircPadlock, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_line"
          }, groupTimestamp, groupPadlock, thread, /*#__PURE__*/_react.default.createElement(EventTileType, {
            ref: this._tile,
            mxEvent: this.props.mxEvent,
            replacingEventId: this.props.replacingEventId,
            editState: this.props.editState,
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            showUrlPreview: this.props.showUrlPreview,
            onHeightChanged: this.props.onHeightChanged
          }), keyRequestInfo, reactionsRow, actionBar), avatar);
        }
    }
  }

} // XXX this'll eventually be dynamic based on the fields once we have extensible event types


exports.default = EventTile;
(0, _defineProperty2.default)(EventTile, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired,

  /* true if mxEvent is redacted. This is a prop because using mxEvent.isRedacted()
   * might not be enough when deciding shouldComponentUpdate - prevProps.mxEvent
   * references the same this.props.mxEvent.
   */
  isRedacted: _propTypes.default.bool,

  /* true if this is a continuation of the previous event (which has the
   * effect of not showing another avatar/displayname
   */
  continuation: _propTypes.default.bool,

  /* true if this is the last event in the timeline (which has the effect
   * of always showing the timestamp)
   */
  last: _propTypes.default.bool,
  // true if the event is the last event in a section (adds a css class for
  // targeting)
  lastInSection: _propTypes.default.bool,

  /* true if this is search context (which has the effect of greying out
   * the text
   */
  contextual: _propTypes.default.bool,

  /* a list of words to highlight, ordered by longest first */
  highlights: _propTypes.default.array,

  /* link URL for the highlights */
  highlightLink: _propTypes.default.string,

  /* should show URL previews for this event */
  showUrlPreview: _propTypes.default.bool,

  /* is this the focused event */
  isSelectedEvent: _propTypes.default.bool,

  /* callback called when dynamic content in events are loaded */
  onHeightChanged: _propTypes.default.func,

  /* a list of read-receipts we should show. Each object has a 'roomMember' and 'ts'. */
  readReceipts: _propTypes.default.arrayOf(_propTypes.default.object),

  /* opaque readreceipt info for each userId; used by ReadReceiptMarker
   * to manage its animations. Should be an empty object when the room
   * first loads
   */
  readReceiptMap: _propTypes.default.object,

  /* A function which is used to check if the parent panel is being
   * unmounted, to avoid unnecessary work. Should return true if we
   * are being unmounted.
   */
  checkUnmounting: _propTypes.default.func,

  /* the status of this event - ie, mxEvent.status. Denormalised to here so
   * that we can tell when it changes. */
  eventSendStatus: _propTypes.default.string,

  /* the shape of the tile. by default, the layout is intended for the
   * normal room timeline.  alternative values are: "file_list", "file_grid"
   * and "notif".  This could be done by CSS, but it'd be horribly inefficient.
   * It could also be done by subclassing EventTile, but that'd be quite
   * boiilerplatey.  So just make the necessary render decisions conditional
   * for now.
   */
  tileShape: _propTypes.default.string,
  // show twelve hour timestamps
  isTwelveHour: _propTypes.default.bool,
  // helper function to access relations for this event
  getRelationsForEvent: _propTypes.default.func,
  // whether to show reactions for this event
  showReactions: _propTypes.default.bool,
  // whether to use the irc layout
  useIRCLayout: _propTypes.default.bool,
  // whether or not to show flair at all
  enableFlair: _propTypes.default.bool
});
(0, _defineProperty2.default)(EventTile, "defaultProps", {
  // no-op function because onHeightChanged is optional yet some sub-components assume its existence
  onHeightChanged: function () {}
});
(0, _defineProperty2.default)(EventTile, "contextType", _MatrixClientContext.default);
const messageTypes = ['m.room.message', 'm.sticker'];

function isMessageEvent(ev) {
  return messageTypes.includes(ev.getType());
}

function haveTileForEvent(e) {
  // Only messages have a tile (black-rectangle) if redacted
  if (e.isRedacted() && !isMessageEvent(e)) return false; // No tile for replacement events since they update the original tile

  if (e.isRelation("m.replace")) return false;
  const handler = getHandlerTile(e);
  if (handler === undefined) return false;

  if (handler === 'messages.TextualEvent') {
    return TextForEvent.textForEvent(e) !== '';
  } else if (handler === 'messages.RoomCreate') {
    return Boolean(e.getContent()['predecessor']);
  } else {
    return true;
  }
}

function E2ePadlockUndecryptable(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("This message cannot be decrypted"),
    icon: "undecryptable"
  }, props));
}

function E2ePadlockUnverified(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("Encrypted by an unverified session"),
    icon: "unverified"
  }, props));
}

function E2ePadlockUnencrypted(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("Unencrypted"),
    icon: "unencrypted"
  }, props));
}

function E2ePadlockUnknown(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("Encrypted by a deleted session"),
    icon: "unknown"
  }, props));
}

function E2ePadlockUnauthenticated(props) {
  return /*#__PURE__*/_react.default.createElement(E2ePadlock, (0, _extends2.default)({
    title: (0, _languageHandler._t)("The authenticity of this encrypted message can't be guaranteed on this device."),
    icon: "unauthenticated"
  }, props));
}

class E2ePadlock extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "onHoverStart", () => {
      this.setState({
        hover: true
      });
    });
    (0, _defineProperty2.default)(this, "onHoverEnd", () => {
      this.setState({
        hover: false
      });
    });
    this.state = {
      hover: false
    };
  }

  render() {
    let tooltip = null;

    if (this.state.hover) {
      const Tooltip = sdk.getComponent("elements.Tooltip");
      tooltip = /*#__PURE__*/_react.default.createElement(Tooltip, {
        className: "mx_EventTile_e2eIcon_tooltip",
        label: this.props.title,
        dir: "auto"
      });
    }

    const classes = `mx_EventTile_e2eIcon mx_EventTile_e2eIcon_${this.props.icon}`;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      onClick: this.onClick,
      onMouseEnter: this.onHoverStart,
      onMouseLeave: this.onHoverEnd
    }, tooltip);
  }

}

(0, _defineProperty2.default)(E2ePadlock, "propTypes", {
  icon: _propTypes.default.string.isRequired,
  title: _propTypes.default.string.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0V2ZW50VGlsZS5qcyJdLCJuYW1lcyI6WyJldmVudFRpbGVUeXBlcyIsInN0YXRlRXZlbnRUaWxlVHlwZXMiLCJXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUiLCJldlR5cGUiLCJBTExfUlVMRV9UWVBFUyIsImdldEhhbmRsZXJUaWxlIiwiZXYiLCJ0eXBlIiwiZ2V0VHlwZSIsImNvbnRlbnQiLCJnZXRDb250ZW50IiwibXNndHlwZSIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm1lIiwiZ2V0VXNlcklkIiwiZ2V0U2VuZGVyIiwidG8iLCJ1bmRlZmluZWQiLCJNS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvbiIsInNkayIsImdldENvbXBvbmVudCIsInByb3RvdHlwZSIsIl9zaG91bGRSZW5kZXIiLCJjYWxsIiwicmVxdWVzdCIsImdldFByZXZDb250ZW50IiwiV2lkZ2V0VHlwZSIsIkpJVFNJIiwibWF0Y2hlcyIsImlzU3RhdGUiLCJNQVhfUkVBRF9BVkFUQVJTIiwiRXZlbnRUaWxlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsIl92ZXJpZnlFdmVudCIsIm14RXZlbnQiLCJmb3JjZVVwZGF0ZSIsInVzZXJJZCIsImRldmljZSIsIl90cnVzdFN0YXR1cyIsInNldFN0YXRlIiwiYWxsUmVhZEF2YXRhcnMiLCJzdGF0ZSIsImV2ZW50IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJ1c2VyX2lkIiwicHJldmlvdXNseVJlcXVlc3RlZEtleXMiLCJjYW5jZWxBbmRSZXNlbmRFdmVudFJvb21LZXlSZXF1ZXN0IiwiZSIsInByZXZlbnREZWZhdWx0IiwiZXZlbnRfaWQiLCJnZXRJZCIsImhpZ2hsaWdodGVkIiwicm9vbV9pZCIsImdldFJvb21JZCIsImZvY3VzZWQiLCJhY3Rpb25CYXJGb2N1c2VkIiwiX3RpbGUiLCJjdXJyZW50IiwiX3JlcGx5VGhyZWFkIiwic2hvd1JlYWN0aW9ucyIsImdldFJlbGF0aW9uc0ZvckV2ZW50IiwiZXZlbnRJZCIsImNvbnNvbGUiLCJlcnJvciIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmFjZSIsInJlbGF0aW9uVHlwZSIsImV2ZW50VHlwZSIsInJlbW92ZUxpc3RlbmVyIiwiX29uUmVhY3Rpb25zQ3JlYXRlZCIsInJlYWN0aW9ucyIsImdldFJlYWN0aW9ucyIsInZlcmlmaWVkIiwiX3N1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb24iLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIm9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQiLCJfb25EZWNyeXB0ZWQiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsImV2ZW50U2VuZFN0YXR1cyIsInNob3VsZENvbXBvbmVudFVwZGF0ZSIsIm5leHRTdGF0ZSIsIk9iamVjdFV0aWxzIiwic2hhbGxvd0VxdWFsIiwiX3Byb3BzRXF1YWwiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImlzRW5jcnlwdGVkIiwiZW5jcnlwdGlvbkluZm8iLCJnZXRFdmVudEVuY3J5cHRpb25JbmZvIiwic2VuZGVySWQiLCJ1c2VyVHJ1c3QiLCJjaGVja1VzZXJUcnVzdCIsIm1pc21hdGNoZWRTZW5kZXIiLCJFMkVfU1RBVEUiLCJXQVJOSU5HIiwib25IZWlnaHRDaGFuZ2VkIiwiaXNDcm9zc1NpZ25pbmdWZXJpZmllZCIsIk5PUk1BTCIsImV2ZW50U2VuZGVyVHJ1c3QiLCJzZW5kZXIiLCJjaGVja0RldmljZVRydXN0IiwiZGV2aWNlSWQiLCJVTktOT1dOIiwiaXNWZXJpZmllZCIsImF1dGhlbnRpY2F0ZWQiLCJVTkFVVEhFTlRJQ0FURUQiLCJWRVJJRklFRCIsIm9iakEiLCJvYmpCIiwia2V5c0EiLCJPYmplY3QiLCJrZXlzIiwia2V5c0IiLCJsZW5ndGgiLCJpIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJyQSIsInJCIiwiaiIsInJvb21NZW1iZXIiLCJzaG91bGRIaWdobGlnaHQiLCJhY3Rpb25zIiwiZ2V0UHVzaEFjdGlvbnNGb3JFdmVudCIsInJlcGxhY2luZ0V2ZW50IiwidHdlYWtzIiwiY3JlZGVudGlhbHMiLCJoaWdobGlnaHQiLCJnZXRSZWFkQXZhdGFycyIsInJlYWRSZWNlaXB0cyIsIlJlYWRSZWNlaXB0TWFya2VyIiwiYXZhdGFycyIsInJlY2VpcHRPZmZzZXQiLCJsZWZ0IiwicmVjZWlwdHMiLCJyZWNlaXB0IiwiaGlkZGVuIiwicmVhZFJlY2VpcHRJbmZvIiwicmVhZFJlY2VpcHRNYXAiLCJ1bnNoaWZ0IiwiY2hlY2tVbm1vdW50aW5nIiwidG9nZ2xlQWxsUmVhZEF2YXRhcnMiLCJ0cyIsImlzVHdlbHZlSG91ciIsInJlbVRleHQiLCJyZW1haW5kZXIiLCJyaWdodCIsIl9yZW5kZXJFMkVQYWRsb2NrIiwiaXNSb29tRW5jcnlwdGVkIiwic3RhdHVzIiwiRXZlbnRTdGF0dXMiLCJFTkNSWVBUSU5HIiwiTk9UX1NFTlQiLCJyZW5kZXIiLCJNZXNzYWdlVGltZXN0YW1wIiwiU2VuZGVyUHJvZmlsZSIsIk1lbWJlckF2YXRhciIsInRpbGVIYW5kbGVyIiwiaXNCdWJibGVNZXNzYWdlIiwic3RhcnRzV2l0aCIsIkV2ZW50VHlwZSIsIlJvb21NZXNzYWdlIiwiUm9vbUNyZWF0ZSIsIlJvb21FbmNyeXB0aW9uIiwiaXNJbmZvTWVzc2FnZSIsIlN0aWNrZXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJoYXZlVGlsZUZvckV2ZW50Iiwid2FybiIsIkV2ZW50VGlsZVR5cGUiLCJpc1NlbmRpbmciLCJpbmRleE9mIiwiaXNSZWRhY3RlZCIsImlzTWVzc2FnZUV2ZW50IiwiaXNFbmNyeXB0aW9uRmFpbHVyZSIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJpc0VkaXRpbmciLCJlZGl0U3RhdGUiLCJjbGFzc2VzIiwibXhfRXZlbnRUaWxlX2J1YmJsZUNvbnRhaW5lciIsIm14X0V2ZW50VGlsZSIsIm14X0V2ZW50VGlsZV9pc0VkaXRpbmciLCJteF9FdmVudFRpbGVfaW5mbyIsIm14X0V2ZW50VGlsZV8xMmhyIiwibXhfRXZlbnRUaWxlX2VuY3J5cHRpbmciLCJteF9FdmVudFRpbGVfc2VuZGluZyIsIm14X0V2ZW50VGlsZV9ub3RTZW50IiwibXhfRXZlbnRUaWxlX2hpZ2hsaWdodCIsInRpbGVTaGFwZSIsIm14X0V2ZW50VGlsZV9zZWxlY3RlZCIsImlzU2VsZWN0ZWRFdmVudCIsIm14X0V2ZW50VGlsZV9jb250aW51YXRpb24iLCJjb250aW51YXRpb24iLCJteF9FdmVudFRpbGVfbGFzdCIsImxhc3QiLCJteF9FdmVudFRpbGVfbGFzdEluU2VjdGlvbiIsImxhc3RJblNlY3Rpb24iLCJteF9FdmVudFRpbGVfY29udGV4dHVhbCIsImNvbnRleHR1YWwiLCJteF9FdmVudFRpbGVfYWN0aW9uQmFyRm9jdXNlZCIsIm14X0V2ZW50VGlsZV92ZXJpZmllZCIsIm14X0V2ZW50VGlsZV91bnZlcmlmaWVkIiwibXhfRXZlbnRUaWxlX3Vua25vd24iLCJteF9FdmVudFRpbGVfYmFkIiwibXhfRXZlbnRUaWxlX2Vtb3RlIiwiYXJpYUxpdmUiLCJwZXJtYWxpbmsiLCJwZXJtYWxpbmtDcmVhdG9yIiwiZm9yRXZlbnQiLCJyZWFkQXZhdGFycyIsImF2YXRhciIsImF2YXRhclNpemUiLCJuZWVkc1NlbmRlclByb2ZpbGUiLCJ1c2VJUkNMYXlvdXQiLCJtZW1iZXIiLCJ0aGlyZF9wYXJ0eV9pbnZpdGUiLCJ0YXJnZXQiLCJ0ZXh0Iiwib25TZW5kZXJQcm9maWxlQ2xpY2siLCJlbmFibGVGbGFpciIsIk1lc3NhZ2VBY3Rpb25CYXIiLCJhY3Rpb25CYXIiLCJnZXRUaWxlIiwiZ2V0UmVwbHlUaHJlYWQiLCJvbkFjdGlvbkJhckZvY3VzQ2hhbmdlIiwidGltZXN0YW1wIiwiZ2V0VHMiLCJrZXlSZXF1ZXN0SGVscFRleHQiLCJrZXlSZXF1ZXN0SW5mb0NvbnRlbnQiLCJzdWIiLCJvblJlcXVlc3RLZXlzQ2xpY2siLCJUb29sdGlwQnV0dG9uIiwia2V5UmVxdWVzdEluZm8iLCJyZWFjdGlvbnNSb3ciLCJSZWFjdGlvbnNSb3ciLCJsaW5rZWRUaW1lc3RhbXAiLCJvblBlcm1hbGlua0NsaWNrZWQiLCJEYXRlIiwiZ3JvdXBUaW1lc3RhbXAiLCJpcmNUaW1lc3RhbXAiLCJncm91cFBhZGxvY2siLCJpcmNQYWRsb2NrIiwicm9vbSIsImdldFJvb20iLCJuYW1lIiwiaGlnaGxpZ2h0cyIsImhpZ2hsaWdodExpbmsiLCJzaG93VXJsUHJldmlldyIsInRocmVhZCIsIlJlcGx5VGhyZWFkIiwibWFrZVRocmVhZCIsInJlcGxhY2luZ0V2ZW50SWQiLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiYm9vbCIsImFycmF5Iiwic3RyaW5nIiwiZnVuYyIsImFycmF5T2YiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwibWVzc2FnZVR5cGVzIiwiaW5jbHVkZXMiLCJpc1JlbGF0aW9uIiwiaGFuZGxlciIsIlRleHRGb3JFdmVudCIsInRleHRGb3JFdmVudCIsIkJvb2xlYW4iLCJFMmVQYWRsb2NrVW5kZWNyeXB0YWJsZSIsIkUyZVBhZGxvY2tVbnZlcmlmaWVkIiwiRTJlUGFkbG9ja1VuZW5jcnlwdGVkIiwiRTJlUGFkbG9ja1Vua25vd24iLCJFMmVQYWRsb2NrVW5hdXRoZW50aWNhdGVkIiwiRTJlUGFkbG9jayIsImhvdmVyIiwidG9vbHRpcCIsIlRvb2x0aXAiLCJ0aXRsZSIsImljb24iLCJvbkNsaWNrIiwib25Ib3ZlclN0YXJ0Iiwib25Ib3ZlckVuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdkNB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ZFxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVwbHlUaHJlYWQgZnJvbSBcIi4uL2VsZW1lbnRzL1JlcGx5VGhyZWFkXCI7XG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHtFdmVudFR5cGV9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgVGV4dEZvckV2ZW50IGZyb20gXCIuLi8uLi8uLi9UZXh0Rm9yRXZlbnRcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge0V2ZW50U3RhdHVzfSBmcm9tICdtYXRyaXgtanMtc2RrJztcbmltcG9ydCB7Zm9ybWF0VGltZX0gZnJvbSBcIi4uLy4uLy4uL0RhdGVVdGlsc1wiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge0FMTF9SVUxFX1RZUEVTfSBmcm9tIFwiLi4vLi4vLi4vbWpvbG5pci9CYW5MaXN0XCI7XG5pbXBvcnQgKiBhcyBPYmplY3RVdGlscyBmcm9tIFwiLi4vLi4vLi4vT2JqZWN0VXRpbHNcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQge0UyRV9TVEFURX0gZnJvbSBcIi4vRTJFSWNvblwiO1xuaW1wb3J0IHt0b1JlbX0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3VuaXRzXCI7XG5pbXBvcnQge1dpZGdldFR5cGV9IGZyb20gXCIuLi8uLi8uLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCB7V0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TGF5b3V0U3RvcmVcIjtcblxuY29uc3QgZXZlbnRUaWxlVHlwZXMgPSB7XG4gICAgJ20ucm9vbS5tZXNzYWdlJzogJ21lc3NhZ2VzLk1lc3NhZ2VFdmVudCcsXG4gICAgJ20uc3RpY2tlcic6ICdtZXNzYWdlcy5NZXNzYWdlRXZlbnQnLFxuICAgICdtLmtleS52ZXJpZmljYXRpb24uY2FuY2VsJzogJ21lc3NhZ2VzLk1LZXlWZXJpZmljYXRpb25Db25jbHVzaW9uJyxcbiAgICAnbS5rZXkudmVyaWZpY2F0aW9uLmRvbmUnOiAnbWVzc2FnZXMuTUtleVZlcmlmaWNhdGlvbkNvbmNsdXNpb24nLFxuICAgICdtLnJvb20uZW5jcnlwdGlvbic6ICdtZXNzYWdlcy5FbmNyeXB0aW9uRXZlbnQnLFxuICAgICdtLmNhbGwuaW52aXRlJzogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgJ20uY2FsbC5hbnN3ZXInOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5jYWxsLmhhbmd1cCc6ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxuICAgICdtLmNhbGwucmVqZWN0JzogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG59O1xuXG5jb25zdCBzdGF0ZUV2ZW50VGlsZVR5cGVzID0ge1xuICAgICdtLnJvb20uZW5jcnlwdGlvbic6ICdtZXNzYWdlcy5FbmNyeXB0aW9uRXZlbnQnLFxuICAgICdtLnJvb20uY2Fub25pY2FsX2FsaWFzJzogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgJ20ucm9vbS5jcmVhdGUnOiAnbWVzc2FnZXMuUm9vbUNyZWF0ZScsXG4gICAgJ20ucm9vbS5tZW1iZXInOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLm5hbWUnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLmF2YXRhcic6ICdtZXNzYWdlcy5Sb29tQXZhdGFyRXZlbnQnLFxuICAgICdtLnJvb20udGhpcmRfcGFydHlfaW52aXRlJzogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgJ20ucm9vbS5oaXN0b3J5X3Zpc2liaWxpdHknOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLnRvcGljJzogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgJ20ucm9vbS5wb3dlcl9sZXZlbHMnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLnBpbm5lZF9ldmVudHMnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLnNlcnZlcl9hY2wnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICBbV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFXTogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgJ20ucm9vbS50b21ic3RvbmUnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLmpvaW5fcnVsZXMnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLmd1ZXN0X2FjY2Vzcyc6ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxuICAgICdtLnJvb20ucmVsYXRlZF9ncm91cHMnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50Jyxcbn07XG5cbi8vIEFkZCBhbGwgdGhlIE1qb2xuaXIgc3R1ZmYgdG8gdGhlIHJlbmRlcmVyXG5mb3IgKGNvbnN0IGV2VHlwZSBvZiBBTExfUlVMRV9UWVBFUykge1xuICAgIHN0YXRlRXZlbnRUaWxlVHlwZXNbZXZUeXBlXSA9ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFuZGxlclRpbGUoZXYpIHtcbiAgICBjb25zdCB0eXBlID0gZXYuZ2V0VHlwZSgpO1xuXG4gICAgLy8gZG9uJ3Qgc2hvdyB2ZXJpZmljYXRpb24gcmVxdWVzdHMgd2UncmUgbm90IGludm9sdmVkIGluLFxuICAgIC8vIG5vdCBldmVuIHdoZW4gc2hvd2luZyBoaWRkZW4gZXZlbnRzXG4gICAgaWYgKHR5cGUgPT09IFwibS5yb29tLm1lc3NhZ2VcIikge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZXYuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoY29udGVudCAmJiBjb250ZW50Lm1zZ3R5cGUgPT09IFwibS5rZXkudmVyaWZpY2F0aW9uLnJlcXVlc3RcIikge1xuICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3QgbWUgPSBjbGllbnQgJiYgY2xpZW50LmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgaWYgKGV2LmdldFNlbmRlcigpICE9PSBtZSAmJiBjb250ZW50LnRvICE9PSBtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIm1lc3NhZ2VzLk1LZXlWZXJpZmljYXRpb25SZXF1ZXN0XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gdGhlc2UgZXZlbnRzIGFyZSBzZW50IGJ5IGJvdGggcGFydGllcyBkdXJpbmcgdmVyaWZpY2F0aW9uLCBidXQgd2Ugb25seSB3YW50IHRvIHJlbmRlciBvbmVcbiAgICAvLyB0aWxlIG9uY2UgdGhlIHZlcmlmaWNhdGlvbiBjb25jbHVkZXMsIHNvIGZpbHRlciBvdXQgdGhlIG9uZSBmcm9tIHRoZSBvdGhlciBwYXJ0eS5cbiAgICBpZiAodHlwZSA9PT0gXCJtLmtleS52ZXJpZmljYXRpb24uZG9uZVwiKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgbWUgPSBjbGllbnQgJiYgY2xpZW50LmdldFVzZXJJZCgpO1xuICAgICAgICBpZiAoZXYuZ2V0U2VuZGVyKCkgIT09IG1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc29tZXRpbWVzIE1LZXlWZXJpZmljYXRpb25Db25jbHVzaW9uIGRlY2xpbmVzIHRvIHJlbmRlci4gIEphbmtpbHkgZGVjbGluZSB0byByZW5kZXIgYW5kXG4gICAgLy8gZmFsbCBiYWNrIHRvIHNob3dpbmcgaGlkZGVuIGV2ZW50cywgaWYgd2UncmUgdmlld2luZyBoaWRkZW4gZXZlbnRzXG4gICAgLy8gWFhYOiBUaGlzIGlzIGV4dHJlbWVseSBhIGhhY2suIFBvc3NpYmx5IHRoZXNlIGNvbXBvbmVudHMgc2hvdWxkIGhhdmUgYW4gaW50ZXJmYWNlIGZvclxuICAgIC8vIGRlY2xpbmluZyB0byByZW5kZXI/XG4gICAgaWYgKHR5cGUgPT09IFwibS5rZXkudmVyaWZpY2F0aW9uLmNhbmNlbFwiIHx8IHR5cGUgPT09IFwibS5rZXkudmVyaWZpY2F0aW9uLmRvbmVcIikge1xuICAgICAgICBjb25zdCBNS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvbiA9IHNkay5nZXRDb21wb25lbnQoXCJtZXNzYWdlcy5NS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvblwiKTtcbiAgICAgICAgaWYgKCFNS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvbi5wcm90b3R5cGUuX3Nob3VsZFJlbmRlci5jYWxsKG51bGwsIGV2LCBldi5yZXF1ZXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgIGlmICh0eXBlID09PSBcImltLnZlY3Rvci5tb2R1bGFyLndpZGdldHNcIikge1xuICAgICAgICBsZXQgdHlwZSA9IGV2LmdldENvbnRlbnQoKVsndHlwZSddO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZWQvaW52YWxpZCB3aWRnZXQgLSB0cnkgdGhlIHBhc3Qgd2lkZ2V0IHR5cGVcbiAgICAgICAgICAgIHR5cGUgPSBldi5nZXRQcmV2Q29udGVudCgpWyd0eXBlJ107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJtZXNzYWdlcy5NSml0c2lXaWRnZXRFdmVudFwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2LmlzU3RhdGUoKSA/IHN0YXRlRXZlbnRUaWxlVHlwZXNbdHlwZV0gOiBldmVudFRpbGVUeXBlc1t0eXBlXTtcbn1cblxuY29uc3QgTUFYX1JFQURfQVZBVEFSUyA9IDU7XG5cbi8vIE91ciBjb21wb25lbnQgc3RydWN0dXJlIGZvciBFdmVudFRpbGVzIG9uIHRoZSB0aW1lbGluZSBpczpcbi8vXG4vLyAuLUV2ZW50VGlsZS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS5cbi8vIHwgTWVtYmVyQXZhdGFyIChTZW5kZXJQcm9maWxlKSAgICAgICAgICAgICAgICAgICBUaW1lU3RhbXAgfFxuLy8gfCAgICAuLXtNZXNzYWdlLFRleHR1YWx9RXZlbnQtLS0tLS0tLS0tLS0tLS0uIFJlYWQgQXZhdGFycyB8XG4vLyB8ICAgIHwgICAuLU1Gb29Cb2R5LS0tLS0tLS0tLS0tLS0tLS0tLS4gICAgIHwgICAgICAgICAgICAgIHxcbi8vIHwgICAgfCAgIHwgIChvbmx5IGlmIE1lc3NhZ2VFdmVudCkgICAgfCAgICAgfCAgICAgICAgICAgICAgfFxuLy8gfCAgICB8ICAgJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICB8ICAgICAgICAgICAgICB8XG4vLyB8ICAgICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgICAgICAgICAgICAgIHxcbi8vICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudFRpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qIHRoZSBNYXRyaXhFdmVudCB0byBzaG93ICovXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICAvKiB0cnVlIGlmIG14RXZlbnQgaXMgcmVkYWN0ZWQuIFRoaXMgaXMgYSBwcm9wIGJlY2F1c2UgdXNpbmcgbXhFdmVudC5pc1JlZGFjdGVkKClcbiAgICAgICAgICogbWlnaHQgbm90IGJlIGVub3VnaCB3aGVuIGRlY2lkaW5nIHNob3VsZENvbXBvbmVudFVwZGF0ZSAtIHByZXZQcm9wcy5teEV2ZW50XG4gICAgICAgICAqIHJlZmVyZW5jZXMgdGhlIHNhbWUgdGhpcy5wcm9wcy5teEV2ZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgaXNSZWRhY3RlZDogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLyogdHJ1ZSBpZiB0aGlzIGlzIGEgY29udGludWF0aW9uIG9mIHRoZSBwcmV2aW91cyBldmVudCAod2hpY2ggaGFzIHRoZVxuICAgICAgICAgKiBlZmZlY3Qgb2Ygbm90IHNob3dpbmcgYW5vdGhlciBhdmF0YXIvZGlzcGxheW5hbWVcbiAgICAgICAgICovXG4gICAgICAgIGNvbnRpbnVhdGlvbjogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLyogdHJ1ZSBpZiB0aGlzIGlzIHRoZSBsYXN0IGV2ZW50IGluIHRoZSB0aW1lbGluZSAod2hpY2ggaGFzIHRoZSBlZmZlY3RcbiAgICAgICAgICogb2YgYWx3YXlzIHNob3dpbmcgdGhlIHRpbWVzdGFtcClcbiAgICAgICAgICovXG4gICAgICAgIGxhc3Q6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHRydWUgaWYgdGhlIGV2ZW50IGlzIHRoZSBsYXN0IGV2ZW50IGluIGEgc2VjdGlvbiAoYWRkcyBhIGNzcyBjbGFzcyBmb3JcbiAgICAgICAgLy8gdGFyZ2V0aW5nKVxuICAgICAgICBsYXN0SW5TZWN0aW9uOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvKiB0cnVlIGlmIHRoaXMgaXMgc2VhcmNoIGNvbnRleHQgKHdoaWNoIGhhcyB0aGUgZWZmZWN0IG9mIGdyZXlpbmcgb3V0XG4gICAgICAgICAqIHRoZSB0ZXh0XG4gICAgICAgICAqL1xuICAgICAgICBjb250ZXh0dWFsOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvKiBhIGxpc3Qgb2Ygd29yZHMgdG8gaGlnaGxpZ2h0LCBvcmRlcmVkIGJ5IGxvbmdlc3QgZmlyc3QgKi9cbiAgICAgICAgaGlnaGxpZ2h0czogUHJvcFR5cGVzLmFycmF5LFxuXG4gICAgICAgIC8qIGxpbmsgVVJMIGZvciB0aGUgaGlnaGxpZ2h0cyAqL1xuICAgICAgICBoaWdobGlnaHRMaW5rOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8qIHNob3VsZCBzaG93IFVSTCBwcmV2aWV3cyBmb3IgdGhpcyBldmVudCAqL1xuICAgICAgICBzaG93VXJsUHJldmlldzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLyogaXMgdGhpcyB0aGUgZm9jdXNlZCBldmVudCAqL1xuICAgICAgICBpc1NlbGVjdGVkRXZlbnQ6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8qIGNhbGxiYWNrIGNhbGxlZCB3aGVuIGR5bmFtaWMgY29udGVudCBpbiBldmVudHMgYXJlIGxvYWRlZCAqL1xuICAgICAgICBvbkhlaWdodENoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8qIGEgbGlzdCBvZiByZWFkLXJlY2VpcHRzIHdlIHNob3VsZCBzaG93LiBFYWNoIG9iamVjdCBoYXMgYSAncm9vbU1lbWJlcicgYW5kICd0cycuICovXG4gICAgICAgIHJlYWRSZWNlaXB0czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCksXG5cbiAgICAgICAgLyogb3BhcXVlIHJlYWRyZWNlaXB0IGluZm8gZm9yIGVhY2ggdXNlcklkOyB1c2VkIGJ5IFJlYWRSZWNlaXB0TWFya2VyXG4gICAgICAgICAqIHRvIG1hbmFnZSBpdHMgYW5pbWF0aW9ucy4gU2hvdWxkIGJlIGFuIGVtcHR5IG9iamVjdCB3aGVuIHRoZSByb29tXG4gICAgICAgICAqIGZpcnN0IGxvYWRzXG4gICAgICAgICAqL1xuICAgICAgICByZWFkUmVjZWlwdE1hcDogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICAvKiBBIGZ1bmN0aW9uIHdoaWNoIGlzIHVzZWQgdG8gY2hlY2sgaWYgdGhlIHBhcmVudCBwYW5lbCBpcyBiZWluZ1xuICAgICAgICAgKiB1bm1vdW50ZWQsIHRvIGF2b2lkIHVubmVjZXNzYXJ5IHdvcmsuIFNob3VsZCByZXR1cm4gdHJ1ZSBpZiB3ZVxuICAgICAgICAgKiBhcmUgYmVpbmcgdW5tb3VudGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgY2hlY2tVbm1vdW50aW5nOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvKiB0aGUgc3RhdHVzIG9mIHRoaXMgZXZlbnQgLSBpZSwgbXhFdmVudC5zdGF0dXMuIERlbm9ybWFsaXNlZCB0byBoZXJlIHNvXG4gICAgICAgICAqIHRoYXQgd2UgY2FuIHRlbGwgd2hlbiBpdCBjaGFuZ2VzLiAqL1xuICAgICAgICBldmVudFNlbmRTdGF0dXM6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLyogdGhlIHNoYXBlIG9mIHRoZSB0aWxlLiBieSBkZWZhdWx0LCB0aGUgbGF5b3V0IGlzIGludGVuZGVkIGZvciB0aGVcbiAgICAgICAgICogbm9ybWFsIHJvb20gdGltZWxpbmUuICBhbHRlcm5hdGl2ZSB2YWx1ZXMgYXJlOiBcImZpbGVfbGlzdFwiLCBcImZpbGVfZ3JpZFwiXG4gICAgICAgICAqIGFuZCBcIm5vdGlmXCIuICBUaGlzIGNvdWxkIGJlIGRvbmUgYnkgQ1NTLCBidXQgaXQnZCBiZSBob3JyaWJseSBpbmVmZmljaWVudC5cbiAgICAgICAgICogSXQgY291bGQgYWxzbyBiZSBkb25lIGJ5IHN1YmNsYXNzaW5nIEV2ZW50VGlsZSwgYnV0IHRoYXQnZCBiZSBxdWl0ZVxuICAgICAgICAgKiBib2lpbGVycGxhdGV5LiAgU28ganVzdCBtYWtlIHRoZSBuZWNlc3NhcnkgcmVuZGVyIGRlY2lzaW9ucyBjb25kaXRpb25hbFxuICAgICAgICAgKiBmb3Igbm93LlxuICAgICAgICAgKi9cbiAgICAgICAgdGlsZVNoYXBlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIHNob3cgdHdlbHZlIGhvdXIgdGltZXN0YW1wc1xuICAgICAgICBpc1R3ZWx2ZUhvdXI6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIGhlbHBlciBmdW5jdGlvbiB0byBhY2Nlc3MgcmVsYXRpb25zIGZvciB0aGlzIGV2ZW50XG4gICAgICAgIGdldFJlbGF0aW9uc0ZvckV2ZW50OiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvLyB3aGV0aGVyIHRvIHNob3cgcmVhY3Rpb25zIGZvciB0aGlzIGV2ZW50XG4gICAgICAgIHNob3dSZWFjdGlvbnM6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8vIHdoZXRoZXIgdG8gdXNlIHRoZSBpcmMgbGF5b3V0XG4gICAgICAgIHVzZUlSQ0xheW91dDogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLy8gd2hldGhlciBvciBub3QgdG8gc2hvdyBmbGFpciBhdCBhbGxcbiAgICAgICAgZW5hYmxlRmxhaXI6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICAvLyBuby1vcCBmdW5jdGlvbiBiZWNhdXNlIG9uSGVpZ2h0Q2hhbmdlZCBpcyBvcHRpb25hbCB5ZXQgc29tZSBzdWItY29tcG9uZW50cyBhc3N1bWUgaXRzIGV4aXN0ZW5jZVxuICAgICAgICBvbkhlaWdodENoYW5nZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgfTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdGhlIGFjdGlvbiBiYXIgaXMgZm9jdXNlZC5cbiAgICAgICAgICAgIGFjdGlvbkJhckZvY3VzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgLy8gV2hldGhlciBhbGwgcmVhZCByZWNlaXB0cyBhcmUgYmVpbmcgZGlzcGxheWVkLiBJZiBub3QsIG9ubHkgZGlzcGxheVxuICAgICAgICAgICAgLy8gYSB0cnVuY2F0aW9uIG9mIHRoZW0uXG4gICAgICAgICAgICBhbGxSZWFkQXZhdGFyczogZmFsc2UsXG4gICAgICAgICAgICAvLyBXaGV0aGVyIHRoZSBldmVudCdzIHNlbmRlciBoYXMgYmVlbiB2ZXJpZmllZC5cbiAgICAgICAgICAgIHZlcmlmaWVkOiBudWxsLFxuICAgICAgICAgICAgLy8gV2hldGhlciBvblJlcXVlc3RLZXlzQ2xpY2sgaGFzIGJlZW4gY2FsbGVkIHNpbmNlIG1vdW50aW5nLlxuICAgICAgICAgICAgcHJldmlvdXNseVJlcXVlc3RlZEtleXM6IGZhbHNlLFxuICAgICAgICAgICAgLy8gVGhlIFJlbGF0aW9ucyBtb2RlbCBmcm9tIHRoZSBKUyBTREsgZm9yIHJlYWN0aW9ucyB0byBgbXhFdmVudGBcbiAgICAgICAgICAgIHJlYWN0aW9uczogdGhpcy5nZXRSZWFjdGlvbnMoKSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBkb24ndCBkbyBSUiBhbmltYXRpb25zIHVudGlsIHdlIGFyZSBtb3VudGVkXG4gICAgICAgIHRoaXMuX3N1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb24gPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuX3RpbGUgPSBjcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5fcmVwbHlUaHJlYWQgPSBjcmVhdGVSZWYoKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gTW92ZSBpbnRvIGNvbnN0cnVjdG9yXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3ZlcmlmeUV2ZW50KHRoaXMucHJvcHMubXhFdmVudCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3N1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb24gPSBmYWxzZTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjbGllbnQub24oXCJkZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkXCIsIHRoaXMub25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgY2xpZW50Lm9uKFwidXNlclRydXN0U3RhdHVzQ2hhbmdlZFwiLCB0aGlzLm9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQpO1xuICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub24oXCJFdmVudC5kZWNyeXB0ZWRcIiwgdGhpcy5fb25EZWNyeXB0ZWQpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub24oXCJFdmVudC5yZWxhdGlvbnNDcmVhdGVkXCIsIHRoaXMuX29uUmVhY3Rpb25zQ3JlYXRlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgLy8gcmUtY2hlY2sgdGhlIHNlbmRlciB2ZXJpZmljYXRpb24gYXMgb3V0Z29pbmcgZXZlbnRzIHByb2dyZXNzIHRocm91Z2hcbiAgICAgICAgLy8gdGhlIHNlbmQgcHJvY2Vzcy5cbiAgICAgICAgaWYgKG5leHRQcm9wcy5ldmVudFNlbmRTdGF0dXMgIT09IHRoaXMucHJvcHMuZXZlbnRTZW5kU3RhdHVzKSB7XG4gICAgICAgICAgICB0aGlzLl92ZXJpZnlFdmVudChuZXh0UHJvcHMubXhFdmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgaWYgKCFPYmplY3RVdGlscy5zaGFsbG93RXF1YWwodGhpcy5zdGF0ZSwgbmV4dFN0YXRlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gIXRoaXMuX3Byb3BzRXF1YWwodGhpcy5wcm9wcywgbmV4dFByb3BzKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJkZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkXCIsIHRoaXMub25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFwidXNlclRydXN0U3RhdHVzQ2hhbmdlZFwiLCB0aGlzLm9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQpO1xuICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQucmVtb3ZlTGlzdGVuZXIoXCJFdmVudC5kZWNyeXB0ZWRcIiwgdGhpcy5fb25EZWNyeXB0ZWQpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQucmVtb3ZlTGlzdGVuZXIoXCJFdmVudC5yZWxhdGlvbnNDcmVhdGVkXCIsIHRoaXMuX29uUmVhY3Rpb25zQ3JlYXRlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGRlY3J5cHRlZCBhZnRlciB3ZSBzaG93IGl0LlxuICAgICAqL1xuICAgIF9vbkRlY3J5cHRlZCA9ICgpID0+IHtcbiAgICAgICAgLy8gd2UgbmVlZCB0byByZS12ZXJpZnkgdGhlIHNlbmRpbmcgZGV2aWNlLlxuICAgICAgICAvLyAod2UgY2FsbCBvbkhlaWdodENoYW5nZWQgaW4gX3ZlcmlmeUV2ZW50IHRvIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSBkZWNyeXB0aW9uXG4gICAgICAgIC8vIGhhcyBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZSBvZiB0aGUgZXZlbnQgdGlsZSlcbiAgICAgICAgdGhpcy5fdmVyaWZ5RXZlbnQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQgPSAodXNlcklkLCBkZXZpY2UpID0+IHtcbiAgICAgICAgaWYgKHVzZXJJZCA9PT0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFNlbmRlcigpKSB7XG4gICAgICAgICAgICB0aGlzLl92ZXJpZnlFdmVudCh0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQgPSAodXNlcklkLCBfdHJ1c3RTdGF0dXMpID0+IHtcbiAgICAgICAgaWYgKHVzZXJJZCA9PT0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFNlbmRlcigpKSB7XG4gICAgICAgICAgICB0aGlzLl92ZXJpZnlFdmVudCh0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jIF92ZXJpZnlFdmVudChteEV2ZW50KSB7XG4gICAgICAgIGlmICghbXhFdmVudC5pc0VuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbmNyeXB0aW9uSW5mbyA9IHRoaXMuY29udGV4dC5nZXRFdmVudEVuY3J5cHRpb25JbmZvKG14RXZlbnQpO1xuICAgICAgICBjb25zdCBzZW5kZXJJZCA9IG14RXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IHVzZXJUcnVzdCA9IHRoaXMuY29udGV4dC5jaGVja1VzZXJUcnVzdChzZW5kZXJJZCk7XG5cbiAgICAgICAgaWYgKGVuY3J5cHRpb25JbmZvLm1pc21hdGNoZWRTZW5kZXIpIHtcbiAgICAgICAgICAgIC8vIHNvbWV0aGluZyBkZWZpbml0ZWx5IHdyb25nIGlzIGdvaW5nIG9uIGhlcmVcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuV0FSTklORyxcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1c2VyVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAvLyB1c2VyIGlzIG5vdCB2ZXJpZmllZCwgc28gZGVmYXVsdCB0byBldmVyeXRoaW5nIGlzIG5vcm1hbFxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZpZWQ6IEUyRV9TVEFURS5OT1JNQUwsXG4gICAgICAgICAgICB9LCB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCk7IC8vIERlY3J5cHRpb24gbWF5IGhhdmUgY2F1c2VkIGEgY2hhbmdlIGluIHNpemVcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV2ZW50U2VuZGVyVHJ1c3QgPSBlbmNyeXB0aW9uSW5mby5zZW5kZXIgJiYgdGhpcy5jb250ZXh0LmNoZWNrRGV2aWNlVHJ1c3QoXG4gICAgICAgICAgICBzZW5kZXJJZCwgZW5jcnlwdGlvbkluZm8uc2VuZGVyLmRldmljZUlkLFxuICAgICAgICApO1xuICAgICAgICBpZiAoIWV2ZW50U2VuZGVyVHJ1c3QpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuVU5LTk9XTixcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFldmVudFNlbmRlclRydXN0LmlzVmVyaWZpZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZpZWQ6IEUyRV9TVEFURS5XQVJOSU5HLFxuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQpOyAvLyBEZWNyeXB0aW9uIG1heSBoYXZlIGNhdXNlZCBhIGNoYW5nZSBpbiBzaXplXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWVuY3J5cHRpb25JbmZvLmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuVU5BVVRIRU5USUNBVEVELFxuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQpOyAvLyBEZWNyeXB0aW9uIG1heSBoYXZlIGNhdXNlZCBhIGNoYW5nZSBpbiBzaXplXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuVkVSSUZJRUQsXG4gICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgIH1cblxuICAgIF9wcm9wc0VxdWFsKG9iakEsIG9iakIpIHtcbiAgICAgICAgY29uc3Qga2V5c0EgPSBPYmplY3Qua2V5cyhvYmpBKTtcbiAgICAgICAgY29uc3Qga2V5c0IgPSBPYmplY3Qua2V5cyhvYmpCKTtcblxuICAgICAgICBpZiAoa2V5c0EubGVuZ3RoICE9PSBrZXlzQi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5c0EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGtleXNBW2ldO1xuXG4gICAgICAgICAgICBpZiAoIW9iakIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbmVlZCB0byBkZWVwLWNvbXBhcmUgcmVhZFJlY2VpcHRzXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAncmVhZFJlY2VpcHRzJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJBID0gb2JqQVtrZXldO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJCID0gb2JqQltrZXldO1xuICAgICAgICAgICAgICAgIGlmIChyQSA9PT0gckIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFyQSB8fCAhckIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChyQS5sZW5ndGggIT09IHJCLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgckEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJBW2pdLnVzZXJJZCAhPT0gckJbal0udXNlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gb25lIGhhcyBhIG1lbWJlciBzZXQgYW5kIHRoZSBvdGhlciBkb2Vzbid0P1xuICAgICAgICAgICAgICAgICAgICBpZiAockFbal0ucm9vbU1lbWJlciAhPT0gckJbal0ucm9vbU1lbWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqQVtrZXldICE9PSBvYmpCW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBzaG91bGRIaWdobGlnaHQoKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSB0aGlzLmNvbnRleHQuZ2V0UHVzaEFjdGlvbnNGb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQucmVwbGFjaW5nRXZlbnQoKSB8fCB0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgICAgICBpZiAoIWFjdGlvbnMgfHwgIWFjdGlvbnMudHdlYWtzKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgIC8vIGRvbid0IHNob3cgc2VsZi1oaWdobGlnaHRzIGZyb20gYW5vdGhlciBvZiBvdXIgY2xpZW50c1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5teEV2ZW50LmdldFNlbmRlcigpID09PSB0aGlzLmNvbnRleHQuY3JlZGVudGlhbHMudXNlcklkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWN0aW9ucy50d2Vha3MuaGlnaGxpZ2h0O1xuICAgIH1cblxuICAgIHRvZ2dsZUFsbFJlYWRBdmF0YXJzID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFsbFJlYWRBdmF0YXJzOiAhdGhpcy5zdGF0ZS5hbGxSZWFkQXZhdGFycyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGdldFJlYWRBdmF0YXJzKCkge1xuICAgICAgICAvLyByZXR1cm4gZWFybHkgaWYgdGhlcmUgYXJlIG5vIHJlYWQgcmVjZWlwdHNcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJlYWRSZWNlaXB0cyB8fCB0aGlzLnByb3BzLnJlYWRSZWNlaXB0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAoPHNwYW4gY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3JlYWRBdmF0YXJzXCIgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgUmVhZFJlY2VpcHRNYXJrZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5SZWFkUmVjZWlwdE1hcmtlcicpO1xuICAgICAgICBjb25zdCBhdmF0YXJzID0gW107XG4gICAgICAgIGNvbnN0IHJlY2VpcHRPZmZzZXQgPSAxNTtcbiAgICAgICAgbGV0IGxlZnQgPSAwO1xuXG4gICAgICAgIGNvbnN0IHJlY2VpcHRzID0gdGhpcy5wcm9wcy5yZWFkUmVjZWlwdHMgfHwgW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjZWlwdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlY2VpcHQgPSByZWNlaXB0c1tpXTtcblxuICAgICAgICAgICAgbGV0IGhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICBpZiAoKGkgPCBNQVhfUkVBRF9BVkFUQVJTKSB8fCB0aGlzLnN0YXRlLmFsbFJlYWRBdmF0YXJzKSB7XG4gICAgICAgICAgICAgICAgaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUT0RPOiB3ZSBrZWVwIHRoZSBleHRyYSByZWFkIGF2YXRhcnMgaW4gdGhlIGRvbSB0byBtYWtlIGFuaW1hdGlvbiBzaW1wbGVyXG4gICAgICAgICAgICAvLyB3ZSBjb3VsZCBvcHRpbWlzZSB0aGlzIHRvIHJlZHVjZSB0aGUgZG9tIHNpemUuXG5cbiAgICAgICAgICAgIC8vIElmIGhpZGRlbiwgc2V0IG9mZnNldCBlcXVhbCB0byB0aGUgb2Zmc2V0IG9mIHRoZSBmaW5hbCB2aXNpYmxlIGF2YXRhciBvclxuICAgICAgICAgICAgLy8gZWxzZSBzZXQgaXQgcHJvcG9ydGlvbmFsIHRvIGluZGV4XG4gICAgICAgICAgICBsZWZ0ID0gKGhpZGRlbiA/IE1BWF9SRUFEX0FWQVRBUlMgLSAxIDogaSkgKiAtcmVjZWlwdE9mZnNldDtcblxuICAgICAgICAgICAgY29uc3QgdXNlcklkID0gcmVjZWlwdC51c2VySWQ7XG4gICAgICAgICAgICBsZXQgcmVhZFJlY2VpcHRJbmZvO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFkUmVjZWlwdE1hcCkge1xuICAgICAgICAgICAgICAgIHJlYWRSZWNlaXB0SW5mbyA9IHRoaXMucHJvcHMucmVhZFJlY2VpcHRNYXBbdXNlcklkXTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlYWRSZWNlaXB0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICByZWFkUmVjZWlwdEluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZWFkUmVjZWlwdE1hcFt1c2VySWRdID0gcmVhZFJlY2VpcHRJbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWRkIHRvIHRoZSBzdGFydCBzbyB0aGUgbW9zdCByZWNlbnQgaXMgb24gdGhlIGVuZCAoaWUuIGVuZHMgdXAgcmlnaHRtb3N0KVxuICAgICAgICAgICAgYXZhdGFycy51bnNoaWZ0KFxuICAgICAgICAgICAgICAgIDxSZWFkUmVjZWlwdE1hcmtlciBrZXk9e3VzZXJJZH0gbWVtYmVyPXtyZWNlaXB0LnJvb21NZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrVXNlcklkPXt1c2VySWR9XG4gICAgICAgICAgICAgICAgICAgIGxlZnRPZmZzZXQ9e2xlZnR9IGhpZGRlbj17aGlkZGVufVxuICAgICAgICAgICAgICAgICAgICByZWFkUmVjZWlwdEluZm89e3JlYWRSZWNlaXB0SW5mb31cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tVbm1vdW50aW5nPXt0aGlzLnByb3BzLmNoZWNrVW5tb3VudGluZ31cbiAgICAgICAgICAgICAgICAgICAgc3VwcHJlc3NBbmltYXRpb249e3RoaXMuX3N1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb259XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlQWxsUmVhZEF2YXRhcnN9XG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcD17cmVjZWlwdC50c31cbiAgICAgICAgICAgICAgICAgICAgc2hvd1R3ZWx2ZUhvdXI9e3RoaXMucHJvcHMuaXNUd2VsdmVIb3VyfVxuICAgICAgICAgICAgICAgIC8+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcmVtVGV4dDtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmFsbFJlYWRBdmF0YXJzKSB7XG4gICAgICAgICAgICBjb25zdCByZW1haW5kZXIgPSByZWNlaXB0cy5sZW5ndGggLSBNQVhfUkVBRF9BVkFUQVJTO1xuICAgICAgICAgICAgaWYgKHJlbWFpbmRlciA+IDApIHtcbiAgICAgICAgICAgICAgICByZW1UZXh0ID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3JlYWRBdmF0YXJSZW1haW5kZXJcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnRvZ2dsZUFsbFJlYWRBdmF0YXJzfVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyByaWdodDogXCJjYWxjKFwiICsgdG9SZW0oLWxlZnQpICsgXCIgKyBcIiArIHJlY2VpcHRPZmZzZXQgKyBcInB4KVwiIH19PnsgcmVtYWluZGVyIH0rXG4gICAgICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfcmVhZEF2YXRhcnNcIj5cbiAgICAgICAgICAgIHsgcmVtVGV4dCB9XG4gICAgICAgICAgICB7IGF2YXRhcnMgfVxuICAgICAgICA8L3NwYW4+O1xuICAgIH1cblxuICAgIG9uU2VuZGVyUHJvZmlsZUNsaWNrID0gZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBteEV2ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnaW5zZXJ0X21lbnRpb24nLFxuICAgICAgICAgICAgdXNlcl9pZDogbXhFdmVudC5nZXRTZW5kZXIoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uUmVxdWVzdEtleXNDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAvLyBJbmRpY2F0ZSBpbiB0aGUgVUkgdGhhdCB0aGUga2V5cyBoYXZlIGJlZW4gcmVxdWVzdGVkICh0aGlzIGlzIGV4cGVjdGVkIHRvXG4gICAgICAgICAgICAvLyBiZSByZXNldCBpZiB0aGUgY29tcG9uZW50IGlzIG1vdW50ZWQgaW4gdGhlIGZ1dHVyZSkuXG4gICAgICAgICAgICBwcmV2aW91c2x5UmVxdWVzdGVkS2V5czogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2FuY2VsIGFueSBvdXRnb2luZyBrZXkgcmVxdWVzdCBmb3IgdGhpcyBldmVudCBhbmQgcmVzZW5kIGl0LiBJZiBhIHJlc3BvbnNlXG4gICAgICAgIC8vIGlzIHJlY2VpdmVkIGZvciB0aGUgcmVxdWVzdCB3aXRoIHRoZSByZXF1aXJlZCBrZXlzLCB0aGUgZXZlbnQgY291bGQgYmVcbiAgICAgICAgLy8gZGVjcnlwdGVkIHN1Y2Nlc3NmdWxseS5cbiAgICAgICAgdGhpcy5jb250ZXh0LmNhbmNlbEFuZFJlc2VuZEV2ZW50Um9vbUtleVJlcXVlc3QodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICB9O1xuXG4gICAgb25QZXJtYWxpbmtDbGlja2VkID0gZSA9PiB7XG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIHRoZSBwZXJtYWxpbmsgdG8gYmUgb3BlbmVkIGluIGEgbmV3IHRhYi93aW5kb3cgb3IgY29waWVkIGFzXG4gICAgICAgIC8vIG1hdHJpeC50bywgYnV0IGFsc28gZm9yIGl0IHRvIGVuYWJsZSByb3V0aW5nIHdpdGhpbiBFbGVtZW50IHdoZW4gY2xpY2tlZC5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIGV2ZW50X2lkOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSxcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkOiB0cnVlLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX3JlbmRlckUyRVBhZGxvY2soKSB7XG4gICAgICAgIGNvbnN0IGV2ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuXG4gICAgICAgIC8vIGV2ZW50IGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWRcbiAgICAgICAgaWYgKGV2LmdldENvbnRlbnQoKS5tc2d0eXBlID09PSAnbS5iYWQuZW5jcnlwdGVkJykge1xuICAgICAgICAgICAgcmV0dXJuIDxFMmVQYWRsb2NrVW5kZWNyeXB0YWJsZSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGV2ZW50IGlzIGVuY3J5cHRlZCwgZGlzcGxheSBwYWRsb2NrIGNvcnJlc3BvbmRpbmcgdG8gd2hldGhlciBvciBub3QgaXQgaXMgdmVyaWZpZWRcbiAgICAgICAgaWYgKGV2LmlzRW5jcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVfU1RBVEUuTk9STUFMKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBubyBpY29uIGlmIHdlJ3ZlIG5vdCBldmVuIGNyb3NzLXNpZ25lZCB0aGUgdXNlclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVfU1RBVEUuVkVSSUZJRUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIG5vIGljb24gZm9yIHZlcmlmaWVkXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmVyaWZpZWQgPT09IEUyRV9TVEFURS5VTkFVVEhFTlRJQ0FURUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDxFMmVQYWRsb2NrVW5hdXRoZW50aWNhdGVkIC8+KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52ZXJpZmllZCA9PT0gRTJFX1NUQVRFLlVOS05PV04pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDxFMmVQYWRsb2NrVW5rbm93biAvPik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAoPEUyZVBhZGxvY2tVbnZlcmlmaWVkIC8+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQuaXNSb29tRW5jcnlwdGVkKGV2LmdldFJvb21JZCgpKSkge1xuICAgICAgICAgICAgLy8gZWxzZSBpZiByb29tIGlzIGVuY3J5cHRlZFxuICAgICAgICAgICAgLy8gYW5kIGV2ZW50IGlzIGJlaW5nIGVuY3J5cHRlZCBvciBpcyBub3Rfc2VudCAoVW5rbm93biBEZXZpY2VzL05ldHdvcmsgRXJyb3IpXG4gICAgICAgICAgICBpZiAoZXYuc3RhdHVzID09PSBFdmVudFN0YXR1cy5FTkNSWVBUSU5HKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LnN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuTk9UX1NFTlQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYuaXNTdGF0ZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyB3ZSBleHBlY3QgdGhpcyB0byBiZSB1bmVuY3J5cHRlZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBlbmNyeXB0ZWQsIGJ1dCBpdCdzIGFuIGUyZSByb29tLCBzaG93IHRoZSBvcGVuIHBhZGxvY2tcbiAgICAgICAgICAgIHJldHVybiA8RTJlUGFkbG9ja1VuZW5jcnlwdGVkIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm8gcGFkbG9jayBuZWVkZWRcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgb25BY3Rpb25CYXJGb2N1c0NoYW5nZSA9IGZvY3VzZWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFjdGlvbkJhckZvY3VzZWQ6IGZvY3VzZWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBnZXRUaWxlID0gKCkgPT4gdGhpcy5fdGlsZS5jdXJyZW50O1xuXG4gICAgZ2V0UmVwbHlUaHJlYWQgPSAoKSA9PiB0aGlzLl9yZXBseVRocmVhZC5jdXJyZW50O1xuXG4gICAgZ2V0UmVhY3Rpb25zID0gKCkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhdGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zIHx8XG4gICAgICAgICAgICAhdGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudFxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgaWYgKCFldmVudElkKSB7XG4gICAgICAgICAgICAvLyBYWFg6IFRlbXBvcmFyeSBkaWFnbm9zdGljIGxvZ2dpbmcgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzExMTIwXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXZlbnRUaWxlIGF0dGVtcHRlZCB0byBnZXQgcmVsYXRpb25zIGZvciBhbiBldmVudCB3aXRob3V0IGFuIElEXCIpO1xuICAgICAgICAgICAgLy8gVXNlIGV2ZW50J3Mgc3BlY2lhbCBgdG9KU09OYCBtZXRob2QgdG8gbG9nIGtleSBkYXRhLlxuICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5teEV2ZW50LCBudWxsLCA0KSk7XG4gICAgICAgICAgICBjb25zb2xlLnRyYWNlKFwiU3RhY2t0cmFjZSBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTExMjBcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZ2V0UmVsYXRpb25zRm9yRXZlbnQoZXZlbnRJZCwgXCJtLmFubm90YXRpb25cIiwgXCJtLnJlYWN0aW9uXCIpO1xuICAgIH07XG5cbiAgICBfb25SZWFjdGlvbnNDcmVhdGVkID0gKHJlbGF0aW9uVHlwZSwgZXZlbnRUeXBlKSA9PiB7XG4gICAgICAgIGlmIChyZWxhdGlvblR5cGUgIT09IFwibS5hbm5vdGF0aW9uXCIgfHwgZXZlbnRUeXBlICE9PSBcIm0ucmVhY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5yZW1vdmVMaXN0ZW5lcihcIkV2ZW50LnJlbGF0aW9uc0NyZWF0ZWRcIiwgdGhpcy5fb25SZWFjdGlvbnNDcmVhdGVkKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByZWFjdGlvbnM6IHRoaXMuZ2V0UmVhY3Rpb25zKCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IE1lc3NhZ2VUaW1lc3RhbXAgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5NZXNzYWdlVGltZXN0YW1wJyk7XG4gICAgICAgIGNvbnN0IFNlbmRlclByb2ZpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5TZW5kZXJQcm9maWxlJyk7XG4gICAgICAgIGNvbnN0IE1lbWJlckF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ2F2YXRhcnMuTWVtYmVyQXZhdGFyJyk7XG5cbiAgICAgICAgLy9jb25zb2xlLmluZm8oXCJFdmVudFRpbGUgc2hvd1VybFByZXZpZXcgZm9yICVzIGlzICVzXCIsIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCB0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3KTtcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgY29uc3QgbXNndHlwZSA9IGNvbnRlbnQubXNndHlwZTtcbiAgICAgICAgY29uc3QgZXZlbnRUeXBlID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFR5cGUoKTtcblxuICAgICAgICBsZXQgdGlsZUhhbmRsZXIgPSBnZXRIYW5kbGVyVGlsZSh0aGlzLnByb3BzLm14RXZlbnQpO1xuXG4gICAgICAgIC8vIEluZm8gbWVzc2FnZXMgYXJlIGJhc2ljYWxseSBpbmZvcm1hdGlvbiBhYm91dCBjb21tYW5kcyBwcm9jZXNzZWQgb24gYSByb29tXG4gICAgICAgIGNvbnN0IGlzQnViYmxlTWVzc2FnZSA9IGV2ZW50VHlwZS5zdGFydHNXaXRoKFwibS5rZXkudmVyaWZpY2F0aW9uXCIpIHx8XG4gICAgICAgICAgICAoZXZlbnRUeXBlID09PSBFdmVudFR5cGUuUm9vbU1lc3NhZ2UgJiYgbXNndHlwZSAmJiBtc2d0eXBlLnN0YXJ0c1dpdGgoXCJtLmtleS52ZXJpZmljYXRpb25cIikpIHx8XG4gICAgICAgICAgICAoZXZlbnRUeXBlID09PSBFdmVudFR5cGUuUm9vbUNyZWF0ZSkgfHxcbiAgICAgICAgICAgIChldmVudFR5cGUgPT09IEV2ZW50VHlwZS5Sb29tRW5jcnlwdGlvbikgfHxcbiAgICAgICAgICAgICh0aWxlSGFuZGxlciA9PT0gXCJtZXNzYWdlcy5NSml0c2lXaWRnZXRFdmVudFwiKTtcbiAgICAgICAgbGV0IGlzSW5mb01lc3NhZ2UgPSAoXG4gICAgICAgICAgICAhaXNCdWJibGVNZXNzYWdlICYmIGV2ZW50VHlwZSAhPT0gRXZlbnRUeXBlLlJvb21NZXNzYWdlICYmXG4gICAgICAgICAgICBldmVudFR5cGUgIT09IEV2ZW50VHlwZS5TdGlja2VyICYmIGV2ZW50VHlwZSAhPT0gRXZlbnRUeXBlLlJvb21DcmVhdGVcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBJZiB3ZSdyZSBzaG93aW5nIGhpZGRlbiBldmVudHMgaW4gdGhlIHRpbWVsaW5lLCB3ZSBzaG91bGQgdXNlIHRoZVxuICAgICAgICAvLyBzb3VyY2UgdGlsZSB3aGVuIHRoZXJlJ3Mgbm8gcmVndWxhciB0aWxlIGZvciBhbiBldmVudCBhbmQgYWxzbyBmb3JcbiAgICAgICAgLy8gcmVwbGFjZSByZWxhdGlvbnMgKHdoaWNoIG90aGVyd2lzZSB3b3VsZCBkaXNwbGF5IGFzIGEgY29uZnVzaW5nXG4gICAgICAgIC8vIGR1cGxpY2F0ZSBvZiB0aGUgdGhpbmcgdGhleSBhcmUgcmVwbGFjaW5nKS5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZVwiKSAmJiAhaGF2ZVRpbGVGb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQpKSB7XG4gICAgICAgICAgICB0aWxlSGFuZGxlciA9IFwibWVzc2FnZXMuVmlld1NvdXJjZUV2ZW50XCI7XG4gICAgICAgICAgICAvLyBSZXVzZSBpbmZvIG1lc3NhZ2UgYXZhdGFyIGFuZCBzZW5kZXIgcHJvZmlsZSBzdHlsaW5nXG4gICAgICAgICAgICBpc0luZm9NZXNzYWdlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGlzIHNob3VsZG4ndCBoYXBwZW46IHRoZSBjYWxsZXIgc2hvdWxkIGNoZWNrIHdlIHN1cHBvcnQgdGhpcyB0eXBlXG4gICAgICAgIC8vIGJlZm9yZSB0cnlpbmcgdG8gaW5zdGFudGlhdGUgdXNcbiAgICAgICAgaWYgKCF0aWxlSGFuZGxlcikge1xuICAgICAgICAgICAgY29uc3Qge214RXZlbnR9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRXZlbnQgdHlwZSBub3Qgc3VwcG9ydGVkOiB0eXBlOiR7bXhFdmVudC5nZXRUeXBlKCl9IGlzU3RhdGU6JHtteEV2ZW50LmlzU3RhdGUoKX1gKTtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZSBteF9FdmVudFRpbGVfaW5mbyBteF9NTm90aWNlQm9keVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2xpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnVGhpcyBldmVudCBjb3VsZCBub3QgYmUgZGlzcGxheWVkJykgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IEV2ZW50VGlsZVR5cGUgPSBzZGsuZ2V0Q29tcG9uZW50KHRpbGVIYW5kbGVyKTtcblxuICAgICAgICBjb25zdCBpc1NlbmRpbmcgPSAoWydzZW5kaW5nJywgJ3F1ZXVlZCcsICdlbmNyeXB0aW5nJ10uaW5kZXhPZih0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cykgIT09IC0xKTtcbiAgICAgICAgY29uc3QgaXNSZWRhY3RlZCA9IGlzTWVzc2FnZUV2ZW50KHRoaXMucHJvcHMubXhFdmVudCkgJiYgdGhpcy5wcm9wcy5pc1JlZGFjdGVkO1xuICAgICAgICBjb25zdCBpc0VuY3J5cHRpb25GYWlsdXJlID0gdGhpcy5wcm9wcy5teEV2ZW50LmlzRGVjcnlwdGlvbkZhaWx1cmUoKTtcblxuICAgICAgICBjb25zdCBpc0VkaXRpbmcgPSAhIXRoaXMucHJvcHMuZWRpdFN0YXRlO1xuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBteF9FdmVudFRpbGVfYnViYmxlQ29udGFpbmVyOiBpc0J1YmJsZU1lc3NhZ2UsXG4gICAgICAgICAgICBteF9FdmVudFRpbGU6IHRydWUsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfaXNFZGl0aW5nOiBpc0VkaXRpbmcsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfaW5mbzogaXNJbmZvTWVzc2FnZSxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV8xMmhyOiB0aGlzLnByb3BzLmlzVHdlbHZlSG91cixcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9lbmNyeXB0aW5nOiB0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyA9PT0gJ2VuY3J5cHRpbmcnLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX3NlbmRpbmc6ICFpc0VkaXRpbmcgJiYgaXNTZW5kaW5nLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX25vdFNlbnQ6IHRoaXMucHJvcHMuZXZlbnRTZW5kU3RhdHVzID09PSAnbm90X3NlbnQnLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2hpZ2hsaWdodDogdGhpcy5wcm9wcy50aWxlU2hhcGUgPT09ICdub3RpZicgPyBmYWxzZSA6IHRoaXMuc2hvdWxkSGlnaGxpZ2h0KCksXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfc2VsZWN0ZWQ6IHRoaXMucHJvcHMuaXNTZWxlY3RlZEV2ZW50LFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2NvbnRpbnVhdGlvbjogdGhpcy5wcm9wcy50aWxlU2hhcGUgPyAnJyA6IHRoaXMucHJvcHMuY29udGludWF0aW9uLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2xhc3Q6IHRoaXMucHJvcHMubGFzdCxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9sYXN0SW5TZWN0aW9uOiB0aGlzLnByb3BzLmxhc3RJblNlY3Rpb24sXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfY29udGV4dHVhbDogdGhpcy5wcm9wcy5jb250ZXh0dWFsLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2FjdGlvbkJhckZvY3VzZWQ6IHRoaXMuc3RhdGUuYWN0aW9uQmFyRm9jdXNlZCxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV92ZXJpZmllZDogIWlzQnViYmxlTWVzc2FnZSAmJiB0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVfU1RBVEUuVkVSSUZJRUQsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfdW52ZXJpZmllZDogIWlzQnViYmxlTWVzc2FnZSAmJiB0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVfU1RBVEUuV0FSTklORyxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV91bmtub3duOiAhaXNCdWJibGVNZXNzYWdlICYmIHRoaXMuc3RhdGUudmVyaWZpZWQgPT09IEUyRV9TVEFURS5VTktOT1dOLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2JhZDogaXNFbmNyeXB0aW9uRmFpbHVyZSxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9lbW90ZTogbXNndHlwZSA9PT0gJ20uZW1vdGUnLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJZiB0aGUgdGlsZSBpcyBpbiB0aGUgU2VuZGluZyBzdGF0ZSwgZG9uJ3Qgc3BlYWsgdGhlIG1lc3NhZ2UuXG4gICAgICAgIGNvbnN0IGFyaWFMaXZlID0gKHRoaXMucHJvcHMuZXZlbnRTZW5kU3RhdHVzICE9PSBudWxsKSA/ICdvZmYnIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCBwZXJtYWxpbmsgPSBcIiNcIjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcikge1xuICAgICAgICAgICAgcGVybWFsaW5rID0gdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLmZvckV2ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlYWRBdmF0YXJzID0gdGhpcy5nZXRSZWFkQXZhdGFycygpO1xuXG4gICAgICAgIGxldCBhdmF0YXI7XG4gICAgICAgIGxldCBzZW5kZXI7XG4gICAgICAgIGxldCBhdmF0YXJTaXplO1xuICAgICAgICBsZXQgbmVlZHNTZW5kZXJQcm9maWxlO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRpbGVTaGFwZSA9PT0gXCJub3RpZlwiKSB7XG4gICAgICAgICAgICBhdmF0YXJTaXplID0gMjQ7XG4gICAgICAgICAgICBuZWVkc1NlbmRlclByb2ZpbGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRpbGVIYW5kbGVyID09PSAnbWVzc2FnZXMuUm9vbUNyZWF0ZScgfHwgaXNCdWJibGVNZXNzYWdlKSB7XG4gICAgICAgICAgICBhdmF0YXJTaXplID0gMDtcbiAgICAgICAgICAgIG5lZWRzU2VuZGVyUHJvZmlsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSW5mb01lc3NhZ2UpIHtcbiAgICAgICAgICAgIC8vIGEgc21hbGwgYXZhdGFyLCB3aXRoIG5vIHNlbmRlciBwcm9maWxlLCBmb3JcbiAgICAgICAgICAgIC8vIGpvaW5zL3BhcnRzL2V0Y1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDE0O1xuICAgICAgICAgICAgbmVlZHNTZW5kZXJQcm9maWxlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy51c2VJUkNMYXlvdXQpIHtcbiAgICAgICAgICAgIGF2YXRhclNpemUgPSAxNDtcbiAgICAgICAgICAgIG5lZWRzU2VuZGVyUHJvZmlsZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5jb250aW51YXRpb24gJiYgdGhpcy5wcm9wcy50aWxlU2hhcGUgIT09IFwiZmlsZV9ncmlkXCIpIHtcbiAgICAgICAgICAgIC8vIG5vIGF2YXRhciBvciBzZW5kZXIgcHJvZmlsZSBmb3IgY29udGludWF0aW9uIG1lc3NhZ2VzXG4gICAgICAgICAgICBhdmF0YXJTaXplID0gMDtcbiAgICAgICAgICAgIG5lZWRzU2VuZGVyUHJvZmlsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDMwO1xuICAgICAgICAgICAgbmVlZHNTZW5kZXJQcm9maWxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm14RXZlbnQuc2VuZGVyICYmIGF2YXRhclNpemUpIHtcbiAgICAgICAgICAgIGxldCBtZW1iZXI7XG4gICAgICAgICAgICAvLyBzZXQgbWVtYmVyIHRvIHJlY2VpdmVyICh0YXJnZXQpIGlmIGl0IGlzIGEgM1BJRCBpbnZpdGVcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgdGhlIGNvcnJlY3QgYXZhdGFyIGlzIHNob3duIGFzIHRoZSB0ZXh0IGlzXG4gICAgICAgICAgICAvLyBgJHRhcmdldCBhY2NlcHRlZCB0aGUgaW52aXRhdGlvbiBmb3IgJGVtYWlsYFxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkudGhpcmRfcGFydHlfaW52aXRlKSB7XG4gICAgICAgICAgICAgICBtZW1iZXIgPSB0aGlzLnByb3BzLm14RXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZW1iZXIgPSB0aGlzLnByb3BzLm14RXZlbnQuc2VuZGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXZhdGFyID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2F2YXRhclwiPlxuICAgICAgICAgICAgICAgICAgICA8TWVtYmVyQXZhdGFyIG1lbWJlcj17bWVtYmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg9e2F2YXRhclNpemV9IGhlaWdodD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdVc2VyT25DbGljaz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmVlZHNTZW5kZXJQcm9maWxlKSB7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMudGlsZVNoYXBlIHx8IHRoaXMucHJvcHMudGlsZVNoYXBlID09PSAncmVwbHknIHx8IHRoaXMucHJvcHMudGlsZVNoYXBlID09PSAncmVwbHlfcHJldmlldycpIHtcbiAgICAgICAgICAgICAgICBpZiAobXNndHlwZSA9PT0gJ20uaW1hZ2UnKSB0ZXh0ID0gX3RkKCclKHNlbmRlck5hbWUpcyBzZW50IGFuIGltYWdlJyk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobXNndHlwZSA9PT0gJ20udmlkZW8nKSB0ZXh0ID0gX3RkKCclKHNlbmRlck5hbWUpcyBzZW50IGEgdmlkZW8nKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtc2d0eXBlID09PSAnbS5maWxlJykgdGV4dCA9IF90ZCgnJShzZW5kZXJOYW1lKXMgdXBsb2FkZWQgYSBmaWxlJyk7XG4gICAgICAgICAgICAgICAgc2VuZGVyID0gPFNlbmRlclByb2ZpbGUgb25DbGljaz17dGhpcy5vblNlbmRlclByb2ZpbGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlRmxhaXI9e3RoaXMucHJvcHMuZW5hYmxlRmxhaXIgJiYgIXRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dD17dGV4dH0gLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbmRlciA9IDxTZW5kZXJQcm9maWxlIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH0gZW5hYmxlRmxhaXI9e3RoaXMucHJvcHMuZW5hYmxlRmxhaXJ9IC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgTWVzc2FnZUFjdGlvbkJhciA9IHNkay5nZXRDb21wb25lbnQoJ21lc3NhZ2VzLk1lc3NhZ2VBY3Rpb25CYXInKTtcbiAgICAgICAgY29uc3QgYWN0aW9uQmFyID0gIWlzRWRpdGluZyA/IDxNZXNzYWdlQWN0aW9uQmFyXG4gICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICByZWFjdGlvbnM9e3RoaXMuc3RhdGUucmVhY3Rpb25zfVxuICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgZ2V0VGlsZT17dGhpcy5nZXRUaWxlfVxuICAgICAgICAgICAgZ2V0UmVwbHlUaHJlYWQ9e3RoaXMuZ2V0UmVwbHlUaHJlYWR9XG4gICAgICAgICAgICBvbkZvY3VzQ2hhbmdlPXt0aGlzLm9uQWN0aW9uQmFyRm9jdXNDaGFuZ2V9XG4gICAgICAgIC8+IDogdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRUcygpID9cbiAgICAgICAgICAgIDxNZXNzYWdlVGltZXN0YW1wIHNob3dUd2VsdmVIb3VyPXt0aGlzLnByb3BzLmlzVHdlbHZlSG91cn0gdHM9e3RoaXMucHJvcHMubXhFdmVudC5nZXRUcygpfSAvPiA6IG51bGw7XG5cbiAgICAgICAgY29uc3Qga2V5UmVxdWVzdEhlbHBUZXh0ID1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2tleVJlcXVlc3RJbmZvX3Rvb2x0aXBfY29udGVudHNcIj5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLnByZXZpb3VzbHlSZXF1ZXN0ZWRLZXlzID9cbiAgICAgICAgICAgICAgICAgICAgICAgIF90KCAnWW91ciBrZXkgc2hhcmUgcmVxdWVzdCBoYXMgYmVlbiBzZW50IC0gcGxlYXNlIGNoZWNrIHlvdXIgb3RoZXIgc2Vzc2lvbnMgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZvciBrZXkgc2hhcmUgcmVxdWVzdHMuJykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgX3QoICdLZXkgc2hhcmUgcmVxdWVzdHMgYXJlIHNlbnQgdG8geW91ciBvdGhlciBzZXNzaW9ucyBhdXRvbWF0aWNhbGx5LiBJZiB5b3UgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JlamVjdGVkIG9yIGRpc21pc3NlZCB0aGUga2V5IHNoYXJlIHJlcXVlc3Qgb24geW91ciBvdGhlciBzZXNzaW9ucywgY2xpY2sgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2hlcmUgdG8gcmVxdWVzdCB0aGUga2V5cyBmb3IgdGhpcyBzZXNzaW9uIGFnYWluLicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoICdJZiB5b3VyIG90aGVyIHNlc3Npb25zIGRvIG5vdCBoYXZlIHRoZSBrZXkgZm9yIHRoaXMgbWVzc2FnZSB5b3Ugd2lsbCBub3QgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JlIGFibGUgdG8gZGVjcnlwdCB0aGVtLicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIGNvbnN0IGtleVJlcXVlc3RJbmZvQ29udGVudCA9IHRoaXMuc3RhdGUucHJldmlvdXNseVJlcXVlc3RlZEtleXMgP1xuICAgICAgICAgICAgX3QoJ0tleSByZXF1ZXN0IHNlbnQuJykgOlxuICAgICAgICAgICAgX3QoXG4gICAgICAgICAgICAgICAgJzxyZXF1ZXN0TGluaz5SZS1yZXF1ZXN0IGVuY3J5cHRpb24ga2V5czwvcmVxdWVzdExpbms+IGZyb20geW91ciBvdGhlciBzZXNzaW9ucy4nLFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIHsncmVxdWVzdExpbmsnOiAoc3ViKSA9PiA8YSBvbkNsaWNrPXt0aGlzLm9uUmVxdWVzdEtleXNDbGlja30+eyBzdWIgfTwvYT59LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBUb29sdGlwQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuVG9vbHRpcEJ1dHRvbicpO1xuICAgICAgICBjb25zdCBrZXlSZXF1ZXN0SW5mbyA9IGlzRW5jcnlwdGlvbkZhaWx1cmUgP1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfa2V5UmVxdWVzdEluZm9cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfa2V5UmVxdWVzdEluZm9fdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7IGtleVJlcXVlc3RJbmZvQ29udGVudCB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxUb29sdGlwQnV0dG9uIGhlbHBUZXh0PXtrZXlSZXF1ZXN0SGVscFRleHR9IC8+XG4gICAgICAgICAgICA8L2Rpdj4gOiBudWxsO1xuXG4gICAgICAgIGxldCByZWFjdGlvbnNSb3c7XG4gICAgICAgIGlmICghaXNSZWRhY3RlZCkge1xuICAgICAgICAgICAgY29uc3QgUmVhY3Rpb25zUm93ID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuUmVhY3Rpb25zUm93Jyk7XG4gICAgICAgICAgICByZWFjdGlvbnNSb3cgPSA8UmVhY3Rpb25zUm93XG4gICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgIHJlYWN0aW9ucz17dGhpcy5zdGF0ZS5yZWFjdGlvbnN9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxpbmtlZFRpbWVzdGFtcCA9IDxhXG4gICAgICAgICAgICAgICAgaHJlZj17cGVybWFsaW5rfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25QZXJtYWxpbmtDbGlja2VkfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2Zvcm1hdFRpbWUobmV3IERhdGUodGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkpLCB0aGlzLnByb3BzLmlzVHdlbHZlSG91cil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyB0aW1lc3RhbXAgfVxuICAgICAgICAgICAgPC9hPjtcblxuICAgICAgICBjb25zdCBncm91cFRpbWVzdGFtcCA9ICF0aGlzLnByb3BzLnVzZUlSQ0xheW91dCA/IGxpbmtlZFRpbWVzdGFtcCA6IG51bGw7XG4gICAgICAgIGNvbnN0IGlyY1RpbWVzdGFtcCA9IHRoaXMucHJvcHMudXNlSVJDTGF5b3V0ID8gbGlua2VkVGltZXN0YW1wIDogbnVsbDtcbiAgICAgICAgY29uc3QgZ3JvdXBQYWRsb2NrID0gIXRoaXMucHJvcHMudXNlSVJDTGF5b3V0ICYmICFpc0J1YmJsZU1lc3NhZ2UgJiYgdGhpcy5fcmVuZGVyRTJFUGFkbG9jaygpO1xuICAgICAgICBjb25zdCBpcmNQYWRsb2NrID0gdGhpcy5wcm9wcy51c2VJUkNMYXlvdXQgJiYgIWlzQnViYmxlTWVzc2FnZSAmJiB0aGlzLl9yZW5kZXJFMkVQYWRsb2NrKCk7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnByb3BzLnRpbGVTaGFwZSkge1xuICAgICAgICAgICAgY2FzZSAnbm90aWYnOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9IGFyaWEtbGl2ZT17YXJpYUxpdmV9IGFyaWEtYXRvbWljPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfcm9vbU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtyb29tfSB3aWR0aD17Mjh9IGhlaWdodD17Mjh9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17cGVybWFsaW5rfSBvbkNsaWNrPXt0aGlzLm9uUGVybWFsaW5rQ2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcm9vbSA/IHJvb20ubmFtZSA6ICcnIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3NlbmRlckRldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGF2YXRhciB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17cGVybWFsaW5rfSBvbkNsaWNrPXt0aGlzLm9uUGVybWFsaW5rQ2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc2VuZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxFdmVudFRpbGVUeXBlIHJlZj17dGhpcy5fdGlsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cz17dGhpcy5wcm9wcy5oaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbms9e3RoaXMucHJvcHMuaGlnaGxpZ2h0TGlua31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldz17dGhpcy5wcm9wcy5zaG93VXJsUHJldmlld31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e3RoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdmaWxlX2dyaWQnOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9IGFyaWEtbGl2ZT17YXJpYUxpdmV9IGFyaWEtYXRvbWljPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxFdmVudFRpbGVUeXBlIHJlZj17dGhpcy5fdGlsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cz17dGhpcy5wcm9wcy5oaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbms9e3RoaXMucHJvcHMuaGlnaGxpZ2h0TGlua31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldz17dGhpcy5wcm9wcy5zaG93VXJsUHJldmlld31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWxlU2hhcGU9e3RoaXMucHJvcHMudGlsZVNoYXBlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3NlbmRlckRldGFpbHNMaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtwZXJtYWxpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblBlcm1hbGlua0NsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfc2VuZGVyRGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGltZXN0YW1wIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSAncmVwbHknOlxuICAgICAgICAgICAgY2FzZSAncmVwbHlfcHJldmlldyc6IHtcbiAgICAgICAgICAgICAgICBsZXQgdGhyZWFkO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnRpbGVTaGFwZSA9PT0gJ3JlcGx5X3ByZXZpZXcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocmVhZCA9IFJlcGx5VGhyZWFkLm1ha2VUaHJlYWQoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlcGx5VGhyZWFkLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gYXJpYS1saXZlPXthcmlhTGl2ZX0gYXJpYS1hdG9taWM9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlyY1RpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGF2YXRhciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlyY1BhZGxvY2sgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfcmVwbHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGdyb3VwVGltZXN0YW1wIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGdyb3VwUGFkbG9jayB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aHJlYWQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxFdmVudFRpbGVUeXBlIHJlZj17dGhpcy5fdGlsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cz17dGhpcy5wcm9wcy5oaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodExpbms9e3RoaXMucHJvcHMuaGlnaGxpZ2h0TGlua31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e3RoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2luZ0V2ZW50SWQ9e3RoaXMucHJvcHMucmVwbGFjaW5nRXZlbnRJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93VXJsUHJldmlldz17ZmFsc2V9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aHJlYWQgPSBSZXBseVRocmVhZC5tYWtlVGhyZWFkKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlcGx5VGhyZWFkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnVzZUlSQ0xheW91dCxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gdGFiLWluZGV4PS0xIHRvIGFsbG93IGl0IHRvIGJlIGZvY3VzYWJsZSBidXQgZG8gbm90IGFkZCB0YWIgc3RvcCBmb3IgaXQsIHByaW1hcmlseSBmb3Igc2NyZWVuIHJlYWRlcnNcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gdGFiSW5kZXg9ey0xfSBhcmlhLWxpdmU9e2FyaWFMaXZlfSBhcmlhLWF0b21pYz1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaXJjVGltZXN0YW1wIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX21zZ09wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVhZEF2YXRhcnMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGlyY1BhZGxvY2sgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBUaW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBQYWRsb2NrIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRocmVhZCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEV2ZW50VGlsZVR5cGUgcmVmPXt0aGlzLl90aWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNpbmdFdmVudElkPXt0aGlzLnByb3BzLnJlcGxhY2luZ0V2ZW50SWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdFN0YXRlPXt0aGlzLnByb3BzLmVkaXRTdGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRzPXt0aGlzLnByb3BzLmhpZ2hsaWdodHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0TGluaz17dGhpcy5wcm9wcy5oaWdobGlnaHRMaW5rfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXt0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBrZXlSZXF1ZXN0SW5mbyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWFjdGlvbnNSb3cgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYWN0aW9uQmFyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBhdmF0YXIgZ29lcyBhZnRlciB0aGUgZXZlbnQgdGlsZSBhcyBpdCdzIGFic29sdXRlbHkgcG9zaXRpb25lZCB0byBiZSBvdmVyIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV2ZW50IHRpbGUgbGluZSwgc28gbmVlZHMgdG8gYmUgbGF0ZXIgaW4gdGhlIERPTSBzbyBpdCBhcHBlYXJzIG9uIHRvcCAodGhpcyBhdm9pZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgbmVlZCBmb3IgZnVydGhlciB6LWluZGV4aW5nIGNoYW9zKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBYWFggdGhpcydsbCBldmVudHVhbGx5IGJlIGR5bmFtaWMgYmFzZWQgb24gdGhlIGZpZWxkcyBvbmNlIHdlIGhhdmUgZXh0ZW5zaWJsZSBldmVudCB0eXBlc1xuY29uc3QgbWVzc2FnZVR5cGVzID0gWydtLnJvb20ubWVzc2FnZScsICdtLnN0aWNrZXInXTtcbmZ1bmN0aW9uIGlzTWVzc2FnZUV2ZW50KGV2KSB7XG4gICAgcmV0dXJuIChtZXNzYWdlVHlwZXMuaW5jbHVkZXMoZXYuZ2V0VHlwZSgpKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXZlVGlsZUZvckV2ZW50KGUpIHtcbiAgICAvLyBPbmx5IG1lc3NhZ2VzIGhhdmUgYSB0aWxlIChibGFjay1yZWN0YW5nbGUpIGlmIHJlZGFjdGVkXG4gICAgaWYgKGUuaXNSZWRhY3RlZCgpICYmICFpc01lc3NhZ2VFdmVudChlKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gTm8gdGlsZSBmb3IgcmVwbGFjZW1lbnQgZXZlbnRzIHNpbmNlIHRoZXkgdXBkYXRlIHRoZSBvcmlnaW5hbCB0aWxlXG4gICAgaWYgKGUuaXNSZWxhdGlvbihcIm0ucmVwbGFjZVwiKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IGdldEhhbmRsZXJUaWxlKGUpO1xuICAgIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoaGFuZGxlciA9PT0gJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcpIHtcbiAgICAgICAgcmV0dXJuIFRleHRGb3JFdmVudC50ZXh0Rm9yRXZlbnQoZSkgIT09ICcnO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PT0gJ21lc3NhZ2VzLlJvb21DcmVhdGUnKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKGUuZ2V0Q29udGVudCgpWydwcmVkZWNlc3NvciddKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIEUyZVBhZGxvY2tVbmRlY3J5cHRhYmxlKHByb3BzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEUyZVBhZGxvY2sgdGl0bGU9e190KFwiVGhpcyBtZXNzYWdlIGNhbm5vdCBiZSBkZWNyeXB0ZWRcIil9IGljb249XCJ1bmRlY3J5cHRhYmxlXCIgey4uLnByb3BzfSAvPlxuICAgICk7XG59XG5cbmZ1bmN0aW9uIEUyZVBhZGxvY2tVbnZlcmlmaWVkKHByb3BzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEUyZVBhZGxvY2sgdGl0bGU9e190KFwiRW5jcnlwdGVkIGJ5IGFuIHVudmVyaWZpZWQgc2Vzc2lvblwiKX0gaWNvbj1cInVudmVyaWZpZWRcIiB7Li4ucHJvcHN9IC8+XG4gICAgKTtcbn1cblxuZnVuY3Rpb24gRTJlUGFkbG9ja1VuZW5jcnlwdGVkKHByb3BzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEUyZVBhZGxvY2sgdGl0bGU9e190KFwiVW5lbmNyeXB0ZWRcIil9IGljb249XCJ1bmVuY3J5cHRlZFwiIHsuLi5wcm9wc30gLz5cbiAgICApO1xufVxuXG5mdW5jdGlvbiBFMmVQYWRsb2NrVW5rbm93bihwcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxFMmVQYWRsb2NrIHRpdGxlPXtfdChcIkVuY3J5cHRlZCBieSBhIGRlbGV0ZWQgc2Vzc2lvblwiKX0gaWNvbj1cInVua25vd25cIiB7Li4ucHJvcHN9IC8+XG4gICAgKTtcbn1cblxuZnVuY3Rpb24gRTJlUGFkbG9ja1VuYXV0aGVudGljYXRlZChwcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxFMmVQYWRsb2NrIHRpdGxlPXtfdChcIlRoZSBhdXRoZW50aWNpdHkgb2YgdGhpcyBlbmNyeXB0ZWQgbWVzc2FnZSBjYW4ndCBiZSBndWFyYW50ZWVkIG9uIHRoaXMgZGV2aWNlLlwiKX0gaWNvbj1cInVuYXV0aGVudGljYXRlZFwiIHsuLi5wcm9wc30gLz5cbiAgICApO1xufVxuXG5jbGFzcyBFMmVQYWRsb2NrIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBpY29uOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25Ib3ZlclN0YXJ0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtob3ZlcjogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBvbkhvdmVyRW5kID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtob3ZlcjogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdG9vbHRpcCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmhvdmVyKSB7XG4gICAgICAgICAgICBjb25zdCBUb29sdGlwID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlRvb2x0aXBcIik7XG4gICAgICAgICAgICB0b29sdGlwID0gPFRvb2x0aXAgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2UyZUljb25fdG9vbHRpcFwiIGxhYmVsPXt0aGlzLnByb3BzLnRpdGxlfSBkaXI9XCJhdXRvXCIgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gYG14X0V2ZW50VGlsZV9lMmVJY29uIG14X0V2ZW50VGlsZV9lMmVJY29uXyR7dGhpcy5wcm9wcy5pY29ufWA7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGlja31cbiAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9e3RoaXMub25Ib3ZlclN0YXJ0fVxuICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbkhvdmVyRW5kfVxuICAgICAgICAgICAgPnt0b29sdGlwfTwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==