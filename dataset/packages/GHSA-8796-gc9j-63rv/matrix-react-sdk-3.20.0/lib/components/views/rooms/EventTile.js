"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHandlerTile = getHandlerTile;
exports.haveTileForEvent = haveTileForEvent;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _event2 = require("matrix-js-sdk/src/models/event");

var _ReplyThread = _interopRequireDefault(require("../elements/ReplyThread"));

var _languageHandler = require("../../../languageHandler");

var TextForEvent = _interopRequireWildcard(require("../../../TextForEvent"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Layout = require("../../../settings/Layout");

var _DateUtils = require("../../../DateUtils");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _BanList = require("../../../mjolnir/BanList");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _E2EIcon = require("./E2EIcon");

var _units = require("../../../utils/units");

var _WidgetType = require("../../../widgets/WidgetType");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _WidgetLayoutStore = require("../../../stores/widgets/WidgetLayoutStore");

var _objects = require("../../../utils/objects");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Tooltip = _interopRequireDefault(require("../elements/Tooltip"));

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _NotificationBadge = _interopRequireDefault(require("./NotificationBadge"));

var _dec, _class, _class2, _temp;

const eventTileTypes = {
  [_event.EventType.RoomMessage]: 'messages.MessageEvent',
  [_event.EventType.Sticker]: 'messages.MessageEvent',
  [_event.EventType.KeyVerificationCancel]: 'messages.MKeyVerificationConclusion',
  [_event.EventType.KeyVerificationDone]: 'messages.MKeyVerificationConclusion',
  [_event.EventType.CallInvite]: 'messages.TextualEvent',
  [_event.EventType.CallAnswer]: 'messages.TextualEvent',
  [_event.EventType.CallHangup]: 'messages.TextualEvent',
  [_event.EventType.CallReject]: 'messages.TextualEvent'
};
const stateEventTileTypes = {
  [_event.EventType.RoomEncryption]: 'messages.EncryptionEvent',
  [_event.EventType.RoomCanonicalAlias]: 'messages.TextualEvent',
  [_event.EventType.RoomCreate]: 'messages.RoomCreate',
  [_event.EventType.RoomMember]: 'messages.TextualEvent',
  [_event.EventType.RoomName]: 'messages.TextualEvent',
  [_event.EventType.RoomAvatar]: 'messages.RoomAvatarEvent',
  [_event.EventType.RoomThirdPartyInvite]: 'messages.TextualEvent',
  [_event.EventType.RoomHistoryVisibility]: 'messages.TextualEvent',
  [_event.EventType.RoomTopic]: 'messages.TextualEvent',
  [_event.EventType.RoomPowerLevels]: 'messages.TextualEvent',
  [_event.EventType.RoomPinnedEvents]: 'messages.TextualEvent',
  [_event.EventType.RoomServerAcl]: 'messages.TextualEvent',
  // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
  'im.vector.modular.widgets': 'messages.TextualEvent',
  [_WidgetLayoutStore.WIDGET_LAYOUT_EVENT_TYPE]: 'messages.TextualEvent',
  [_event.EventType.RoomTombstone]: 'messages.TextualEvent',
  [_event.EventType.RoomJoinRules]: 'messages.TextualEvent',
  [_event.EventType.RoomGuestAccess]: 'messages.TextualEvent',
  'm.room.related_groups': 'messages.TextualEvent' // legacy communities flair

};
const stateEventSingular = new Set([_event.EventType.RoomEncryption, _event.EventType.RoomCanonicalAlias, _event.EventType.RoomCreate, _event.EventType.RoomName, _event.EventType.RoomAvatar, _event.EventType.RoomHistoryVisibility, _event.EventType.RoomTopic, _event.EventType.RoomPowerLevels, _event.EventType.RoomPinnedEvents, _event.EventType.RoomServerAcl, _WidgetLayoutStore.WIDGET_LAYOUT_EVENT_TYPE, _event.EventType.RoomTombstone, _event.EventType.RoomJoinRules, _event.EventType.RoomGuestAccess, 'm.room.related_groups']); // Add all the Mjolnir stuff to the renderer

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

  if (ev.isState()) {
    if (stateEventSingular.has(type) && ev.getStateKey() !== "") return undefined;
    return stateEventTileTypes[type];
  }

  return eventTileTypes[type];
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

let EventTile = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.EventTile"), _dec(_class = (_temp = _class2 = class EventTile extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "suppressReadReceiptAnimation", void 0);
    (0, _defineProperty2.default)(this, "isListeningForReceipts", void 0);
    (0, _defineProperty2.default)(this, "tile", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "replyThread", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onRoomReceipt", (ev, room) => {
      // ignore events for other rooms
      const tileRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

      if (room !== tileRoom) return;

      if (!this.shouldShowSentReceipt && !this.shouldShowSendingReceipt && !this.isListeningForReceipts) {
        return;
      } // We force update because we have no state or prop changes to queue up, instead relying on
      // the getters we use here to determine what needs rendering.


      this.forceUpdate(() => {
        // Per elsewhere in this file, we can remove the listener once we will have no further purpose for it.
        if (!this.shouldShowSentReceipt && !this.shouldShowSendingReceipt) {
          this.context.removeListener("Room.receipt", this.onRoomReceipt);
          this.isListeningForReceipts = false;
        }
      });
    });
    (0, _defineProperty2.default)(this, "onDecrypted", () => {
      // we need to re-verify the sending device.
      // (we call onHeightChanged in verifyEvent to handle the case where decryption
      // has caused a change in size of the event tile)
      this.verifyEvent(this.props.mxEvent);
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onDeviceVerificationChanged", (userId, device) => {
      if (userId === this.props.mxEvent.getSender()) {
        this.verifyEvent(this.props.mxEvent);
      }
    });
    (0, _defineProperty2.default)(this, "onUserVerificationChanged", (userId, _trustStatus) => {
      if (userId === this.props.mxEvent.getSender()) {
        this.verifyEvent(this.props.mxEvent);
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
    (0, _defineProperty2.default)(this, "getTile", () => this.tile.current);
    (0, _defineProperty2.default)(this, "getReplyThread", () => this.replyThread.current);
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
    (0, _defineProperty2.default)(this, "onReactionsCreated", (relationType, eventType) => {
      if (relationType !== "m.annotation" || eventType !== "m.reaction") {
        return;
      }

      this.props.mxEvent.removeListener("Event.relationsCreated", this.onReactionsCreated);
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

    this.suppressReadReceiptAnimation = true; // Throughout the component we manage a read receipt listener to see if our tile still
    // qualifies for a "sent" or "sending" state (based on their relevant conditions). We
    // don't want to over-subscribe to the read receipt events being fired, so we use a flag
    // to determine if we've already subscribed and use a combination of other flags to find
    // out if we should even be subscribed at all.

    this.isListeningForReceipts = false;
  }
  /**
   * When true, the tile qualifies for some sort of special read receipt. This could be a 'sending'
   * or 'sent' receipt, for example.
   * @returns {boolean}
   */


  get isEligibleForSpecialReceipt() {
    // First, if there are other read receipts then just short-circuit this.
    if (this.props.readReceipts && this.props.readReceipts.length > 0) return false;
    if (!this.props.mxEvent) return false; // Sanity check (should never happen, but we shouldn't explode if it does)

    const room = this.context.getRoom(this.props.mxEvent.getRoomId());
    if (!room) return false; // Quickly check to see if the event was sent by us. If it wasn't, it won't qualify for
    // special read receipts.

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    if (this.props.mxEvent.getSender() !== myUserId) return false; // Finally, determine if the type is relevant to the user. This notably excludes state
    // events and pretty much anything that can't be sent by the composer as a message. For
    // those we rely on local echo giving the impression of things changing, and expect them
    // to be quick.

    const simpleSendableEvents = [_event.EventType.Sticker, _event.EventType.RoomMessage, _event.EventType.RoomMessageEncrypted];
    if (!simpleSendableEvents.includes(this.props.mxEvent.getType())) return false; // Default case

    return true;
  }

  get shouldShowSentReceipt() {
    // If we're not even eligible, don't show the receipt.
    if (!this.isEligibleForSpecialReceipt) return false; // We only show the 'sent' receipt on the last successful event.

    if (!this.props.lastSuccessful) return false; // Check to make sure the sending state is appropriate. A null/undefined send status means
    // that the message is 'sent', so we're just double checking that it's explicitly not sent.

    if (this.props.eventSendStatus && this.props.eventSendStatus !== 'sent') return false; // If anyone has read the event besides us, we don't want to show a sent receipt.

    const receipts = this.props.readReceipts || [];

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    if (receipts.some(r => r.userId !== myUserId)) return false; // Finally, we should show a receipt.

    return true;
  }

  get shouldShowSendingReceipt() {
    // If we're not even eligible, don't show the receipt.
    if (!this.isEligibleForSpecialReceipt) return false; // Check the event send status to see if we are pending. Null/undefined status means the
    // message was sent, so check for that and 'sent' explicitly.

    if (!this.props.eventSendStatus || this.props.eventSendStatus === 'sent') return false; // Default to showing - there's no other event properties/behaviours we care about at
    // this point.

    return true;
  } // TODO: [REACT-WARNING] Move into constructor
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillMount() {
    this.verifyEvent(this.props.mxEvent);
  }

  componentDidMount() {
    this.suppressReadReceiptAnimation = false;
    const client = this.context;
    client.on("deviceVerificationChanged", this.onDeviceVerificationChanged);
    client.on("userTrustStatusChanged", this.onUserVerificationChanged);
    this.props.mxEvent.on("Event.decrypted", this.onDecrypted);

    if (this.props.showReactions) {
      this.props.mxEvent.on("Event.relationsCreated", this.onReactionsCreated);
    }

    if (this.shouldShowSentReceipt || this.shouldShowSendingReceipt) {
      client.on("Room.receipt", this.onRoomReceipt);
      this.isListeningForReceipts = true;
    }
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(nextProps) {
    // re-check the sender verification as outgoing events progress through
    // the send process.
    if (nextProps.eventSendStatus !== this.props.eventSendStatus) {
      this.verifyEvent(nextProps.mxEvent);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if ((0, _objects.objectHasDiff)(this.state, nextState)) {
      return true;
    }

    return !this.propsEqual(this.props, nextProps);
  }

  componentWillUnmount() {
    const client = this.context;
    client.removeListener("deviceVerificationChanged", this.onDeviceVerificationChanged);
    client.removeListener("userTrustStatusChanged", this.onUserVerificationChanged);
    client.removeListener("Room.receipt", this.onRoomReceipt);
    this.isListeningForReceipts = false;
    this.props.mxEvent.removeListener("Event.decrypted", this.onDecrypted);

    if (this.props.showReactions) {
      this.props.mxEvent.removeListener("Event.relationsCreated", this.onReactionsCreated);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we're not listening for receipts and expect to be, register a listener.
    if (!this.isListeningForReceipts && (this.shouldShowSentReceipt || this.shouldShowSendingReceipt)) {
      this.context.on("Room.receipt", this.onRoomReceipt);
      this.isListeningForReceipts = true;
    }
  }

  async verifyEvent(mxEvent) {
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

  propsEqual(objA, objB) {
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
    if (this.shouldShowSentReceipt || this.shouldShowSendingReceipt) {
      return /*#__PURE__*/_react.default.createElement(SentReceipt, {
        messageState: this.props.mxEvent.getAssociatedStatus()
      });
    } // return early if there are no read receipts


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
        suppressAnimation: this.suppressReadReceiptAnimation,
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

  renderE2EPadlock() {
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
      if (ev.status === _event2.EventStatus.ENCRYPTING) {
        return;
      }

      if (ev.status === _event2.EventStatus.NOT_SENT) {
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
      // Note: we keep the `sending` state class for tests, not for our styles
      mx_EventTile_sending: !isEditing && isSending,
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
    } else if (this.props.layout == _Layout.Layout.IRC) {
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
      if (!this.props.tileShape || this.props.tileShape === 'reply' || this.props.tileShape === 'reply_preview') {
        sender = /*#__PURE__*/_react.default.createElement(SenderProfile, {
          onClick: this.onSenderProfileClick,
          mxEvent: this.props.mxEvent,
          enableFlair: this.props.enableFlair
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
    const keyRequestInfo = isEncryptionFailure && !isRedacted ? /*#__PURE__*/_react.default.createElement("div", {
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

    const useIRCLayout = this.props.layout == _Layout.Layout.IRC;
    const groupTimestamp = !useIRCLayout ? linkedTimestamp : null;
    const ircTimestamp = useIRCLayout ? linkedTimestamp : null;
    const groupPadlock = !useIRCLayout && !isBubbleMessage && this.renderE2EPadlock();
    const ircPadlock = useIRCLayout && !isBubbleMessage && this.renderE2EPadlock();
    let msgOption;

    if (this.props.showReadReceipts) {
      const readAvatars = this.getReadAvatars();
      msgOption = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_EventTile_msgOption"
      }, readAvatars);
    }

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
            ref: this.tile,
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
            ref: this.tile,
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
            thread = _ReplyThread.default.makeThread(this.props.mxEvent, this.props.onHeightChanged, this.props.permalinkCreator, this.replyThread);
          }

          return /*#__PURE__*/_react.default.createElement("div", {
            className: classes,
            "aria-live": ariaLive,
            "aria-atomic": "true"
          }, ircTimestamp, avatar, sender, ircPadlock, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_reply"
          }, groupTimestamp, groupPadlock, thread, /*#__PURE__*/_react.default.createElement(EventTileType, {
            ref: this.tile,
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
          const thread = _ReplyThread.default.makeThread(this.props.mxEvent, this.props.onHeightChanged, this.props.permalinkCreator, this.replyThread, this.props.layout); // tab-index=-1 to allow it to be focusable but do not add tab stop for it, primarily for screen readers


          return /*#__PURE__*/_react.default.createElement("div", {
            className: classes,
            tabIndex: -1,
            "aria-live": ariaLive,
            "aria-atomic": "true"
          }, ircTimestamp, sender, ircPadlock, /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_EventTile_line"
          }, groupTimestamp, groupPadlock, thread, /*#__PURE__*/_react.default.createElement(EventTileType, {
            ref: this.tile,
            mxEvent: this.props.mxEvent,
            replacingEventId: this.props.replacingEventId,
            editState: this.props.editState,
            highlights: this.props.highlights,
            highlightLink: this.props.highlightLink,
            showUrlPreview: this.props.showUrlPreview,
            permalinkCreator: this.props.permalinkCreator,
            onHeightChanged: this.props.onHeightChanged
          }), keyRequestInfo, reactionsRow, actionBar), msgOption, avatar);
        }
    }
  }

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  // no-op function because onHeightChanged is optional yet some sub-components assume its existence
  onHeightChanged: function () {}
}), (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = EventTile;
// XXX this'll eventually be dynamic based on the fields once we have extensible event types
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

class E2ePadlock extends _react.default.Component
/*:: <IE2ePadlockProps, IE2ePadlockState>*/
{
  constructor(props) {
    super(props);
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
      tooltip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
        className: "mx_EventTile_e2eIcon_tooltip",
        label: this.props.title
      });
    }

    const classes = `mx_EventTile_e2eIcon mx_EventTile_e2eIcon_${this.props.icon}`;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      onMouseEnter: this.onHoverStart,
      onMouseLeave: this.onHoverEnd
    }, tooltip);
  }

}

class SentReceipt extends _react.default.PureComponent
/*:: <ISentReceiptProps, ISentReceiptState>*/
{
  constructor(props) {
    super(props);
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
    const isSent = !this.props.messageState || this.props.messageState === 'sent';
    const isFailed = this.props.messageState === 'not_sent';
    const receiptClasses = (0, _classnames.default)({
      'mx_EventTile_receiptSent': isSent,
      'mx_EventTile_receiptSending': !isSent && !isFailed
    });
    let nonCssBadge = null;

    if (isFailed) {
      nonCssBadge = /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
        notification: _StaticNotificationState.StaticNotificationState.RED_EXCLAMATION
      });
    }

    let tooltip = null;

    if (this.state.hover) {
      let label = (0, _languageHandler._t)("Sending your message...");

      if (this.props.messageState === 'encrypting') {
        label = (0, _languageHandler._t)("Encrypting your message...");
      } else if (isSent) {
        label = (0, _languageHandler._t)("Your message was sent");
      } else if (isFailed) {
        label = (0, _languageHandler._t)("Failed to send");
      } // The yOffset is somewhat arbitrary - it just brings the tooltip down to be more associated
      // with the read receipt.


      tooltip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
        className: "mx_EventTile_readAvatars_receiptTooltip",
        label: label,
        yOffset: 20
      });
    }

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_EventTile_readAvatars"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: receiptClasses,
      onMouseEnter: this.onHoverStart,
      onMouseLeave: this.onHoverEnd
    }, nonCssBadge, tooltip));
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0V2ZW50VGlsZS50c3giXSwibmFtZXMiOlsiZXZlbnRUaWxlVHlwZXMiLCJFdmVudFR5cGUiLCJSb29tTWVzc2FnZSIsIlN0aWNrZXIiLCJLZXlWZXJpZmljYXRpb25DYW5jZWwiLCJLZXlWZXJpZmljYXRpb25Eb25lIiwiQ2FsbEludml0ZSIsIkNhbGxBbnN3ZXIiLCJDYWxsSGFuZ3VwIiwiQ2FsbFJlamVjdCIsInN0YXRlRXZlbnRUaWxlVHlwZXMiLCJSb29tRW5jcnlwdGlvbiIsIlJvb21DYW5vbmljYWxBbGlhcyIsIlJvb21DcmVhdGUiLCJSb29tTWVtYmVyIiwiUm9vbU5hbWUiLCJSb29tQXZhdGFyIiwiUm9vbVRoaXJkUGFydHlJbnZpdGUiLCJSb29tSGlzdG9yeVZpc2liaWxpdHkiLCJSb29tVG9waWMiLCJSb29tUG93ZXJMZXZlbHMiLCJSb29tUGlubmVkRXZlbnRzIiwiUm9vbVNlcnZlckFjbCIsIldJREdFVF9MQVlPVVRfRVZFTlRfVFlQRSIsIlJvb21Ub21ic3RvbmUiLCJSb29tSm9pblJ1bGVzIiwiUm9vbUd1ZXN0QWNjZXNzIiwic3RhdGVFdmVudFNpbmd1bGFyIiwiU2V0IiwiZXZUeXBlIiwiQUxMX1JVTEVfVFlQRVMiLCJnZXRIYW5kbGVyVGlsZSIsImV2IiwidHlwZSIsImdldFR5cGUiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsIm1zZ3R5cGUiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJtZSIsImdldFVzZXJJZCIsImdldFNlbmRlciIsInRvIiwidW5kZWZpbmVkIiwiTUtleVZlcmlmaWNhdGlvbkNvbmNsdXNpb24iLCJzZGsiLCJnZXRDb21wb25lbnQiLCJwcm90b3R5cGUiLCJfc2hvdWxkUmVuZGVyIiwiY2FsbCIsInJlcXVlc3QiLCJnZXRQcmV2Q29udGVudCIsIldpZGdldFR5cGUiLCJKSVRTSSIsIm1hdGNoZXMiLCJpc1N0YXRlIiwiaGFzIiwiZ2V0U3RhdGVLZXkiLCJNQVhfUkVBRF9BVkFUQVJTIiwiRXZlbnRUaWxlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImNyZWF0ZVJlZiIsInJvb20iLCJ0aWxlUm9vbSIsImdldFJvb20iLCJteEV2ZW50IiwiZ2V0Um9vbUlkIiwic2hvdWxkU2hvd1NlbnRSZWNlaXB0Iiwic2hvdWxkU2hvd1NlbmRpbmdSZWNlaXB0IiwiaXNMaXN0ZW5pbmdGb3JSZWNlaXB0cyIsImZvcmNlVXBkYXRlIiwicmVtb3ZlTGlzdGVuZXIiLCJvblJvb21SZWNlaXB0IiwidmVyaWZ5RXZlbnQiLCJ1c2VySWQiLCJkZXZpY2UiLCJfdHJ1c3RTdGF0dXMiLCJzZXRTdGF0ZSIsImFsbFJlYWRBdmF0YXJzIiwic3RhdGUiLCJldmVudCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwidXNlcl9pZCIsInByZXZpb3VzbHlSZXF1ZXN0ZWRLZXlzIiwiY2FuY2VsQW5kUmVzZW5kRXZlbnRSb29tS2V5UmVxdWVzdCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImV2ZW50X2lkIiwiZ2V0SWQiLCJoaWdobGlnaHRlZCIsInJvb21faWQiLCJmb2N1c2VkIiwiYWN0aW9uQmFyRm9jdXNlZCIsInRpbGUiLCJjdXJyZW50IiwicmVwbHlUaHJlYWQiLCJzaG93UmVhY3Rpb25zIiwiZ2V0UmVsYXRpb25zRm9yRXZlbnQiLCJldmVudElkIiwiY29uc29sZSIsImVycm9yIiwibG9nIiwiSlNPTiIsInN0cmluZ2lmeSIsInRyYWNlIiwicmVsYXRpb25UeXBlIiwiZXZlbnRUeXBlIiwib25SZWFjdGlvbnNDcmVhdGVkIiwicmVhY3Rpb25zIiwiZ2V0UmVhY3Rpb25zIiwidmVyaWZpZWQiLCJzdXBwcmVzc1JlYWRSZWNlaXB0QW5pbWF0aW9uIiwiaXNFbGlnaWJsZUZvclNwZWNpYWxSZWNlaXB0IiwicmVhZFJlY2VpcHRzIiwibGVuZ3RoIiwibXlVc2VySWQiLCJzaW1wbGVTZW5kYWJsZUV2ZW50cyIsIlJvb21NZXNzYWdlRW5jcnlwdGVkIiwiaW5jbHVkZXMiLCJsYXN0U3VjY2Vzc2Z1bCIsImV2ZW50U2VuZFN0YXR1cyIsInJlY2VpcHRzIiwic29tZSIsInIiLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsIm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIm9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQiLCJvbkRlY3J5cHRlZCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwibmV4dFN0YXRlIiwicHJvcHNFcXVhbCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwic25hcHNob3QiLCJpc0VuY3J5cHRlZCIsImVuY3J5cHRpb25JbmZvIiwiZ2V0RXZlbnRFbmNyeXB0aW9uSW5mbyIsInNlbmRlcklkIiwidXNlclRydXN0IiwiY2hlY2tVc2VyVHJ1c3QiLCJtaXNtYXRjaGVkU2VuZGVyIiwiRTJFX1NUQVRFIiwiV0FSTklORyIsIm9uSGVpZ2h0Q2hhbmdlZCIsImlzQ3Jvc3NTaWduaW5nVmVyaWZpZWQiLCJOT1JNQUwiLCJldmVudFNlbmRlclRydXN0Iiwic2VuZGVyIiwiY2hlY2tEZXZpY2VUcnVzdCIsImRldmljZUlkIiwiVU5LTk9XTiIsImlzVmVyaWZpZWQiLCJhdXRoZW50aWNhdGVkIiwiVU5BVVRIRU5USUNBVEVEIiwiVkVSSUZJRUQiLCJvYmpBIiwib2JqQiIsImtleXNBIiwiT2JqZWN0Iiwia2V5cyIsImtleXNCIiwiaSIsImtleSIsImhhc093blByb3BlcnR5IiwickEiLCJyQiIsImoiLCJyb29tTWVtYmVyIiwic2hvdWxkSGlnaGxpZ2h0IiwiYWN0aW9ucyIsImdldFB1c2hBY3Rpb25zRm9yRXZlbnQiLCJyZXBsYWNpbmdFdmVudCIsInR3ZWFrcyIsImNyZWRlbnRpYWxzIiwiaGlnaGxpZ2h0IiwiZ2V0UmVhZEF2YXRhcnMiLCJnZXRBc3NvY2lhdGVkU3RhdHVzIiwiUmVhZFJlY2VpcHRNYXJrZXIiLCJhdmF0YXJzIiwicmVjZWlwdE9mZnNldCIsImxlZnQiLCJyZWNlaXB0IiwiaGlkZGVuIiwicmVhZFJlY2VpcHRJbmZvIiwicmVhZFJlY2VpcHRNYXAiLCJ1bnNoaWZ0IiwiY2hlY2tVbm1vdW50aW5nIiwidG9nZ2xlQWxsUmVhZEF2YXRhcnMiLCJ0cyIsImlzVHdlbHZlSG91ciIsInJlbVRleHQiLCJyZW1haW5kZXIiLCJyaWdodCIsInJlbmRlckUyRVBhZGxvY2siLCJpc1Jvb21FbmNyeXB0ZWQiLCJzdGF0dXMiLCJFdmVudFN0YXR1cyIsIkVOQ1JZUFRJTkciLCJOT1RfU0VOVCIsInJlbmRlciIsIk1lc3NhZ2VUaW1lc3RhbXAiLCJTZW5kZXJQcm9maWxlIiwiTWVtYmVyQXZhdGFyIiwidGlsZUhhbmRsZXIiLCJpc0J1YmJsZU1lc3NhZ2UiLCJzdGFydHNXaXRoIiwiaXNJbmZvTWVzc2FnZSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImhhdmVUaWxlRm9yRXZlbnQiLCJ3YXJuIiwiRXZlbnRUaWxlVHlwZSIsImlzU2VuZGluZyIsImluZGV4T2YiLCJpc1JlZGFjdGVkIiwiaXNNZXNzYWdlRXZlbnQiLCJpc0VuY3J5cHRpb25GYWlsdXJlIiwiaXNEZWNyeXB0aW9uRmFpbHVyZSIsImlzRWRpdGluZyIsImVkaXRTdGF0ZSIsImNsYXNzZXMiLCJteF9FdmVudFRpbGVfYnViYmxlQ29udGFpbmVyIiwibXhfRXZlbnRUaWxlIiwibXhfRXZlbnRUaWxlX2lzRWRpdGluZyIsIm14X0V2ZW50VGlsZV9pbmZvIiwibXhfRXZlbnRUaWxlXzEyaHIiLCJteF9FdmVudFRpbGVfc2VuZGluZyIsIm14X0V2ZW50VGlsZV9oaWdobGlnaHQiLCJ0aWxlU2hhcGUiLCJteF9FdmVudFRpbGVfc2VsZWN0ZWQiLCJpc1NlbGVjdGVkRXZlbnQiLCJteF9FdmVudFRpbGVfY29udGludWF0aW9uIiwiY29udGludWF0aW9uIiwibXhfRXZlbnRUaWxlX2xhc3QiLCJsYXN0IiwibXhfRXZlbnRUaWxlX2xhc3RJblNlY3Rpb24iLCJsYXN0SW5TZWN0aW9uIiwibXhfRXZlbnRUaWxlX2NvbnRleHR1YWwiLCJjb250ZXh0dWFsIiwibXhfRXZlbnRUaWxlX2FjdGlvbkJhckZvY3VzZWQiLCJteF9FdmVudFRpbGVfdmVyaWZpZWQiLCJteF9FdmVudFRpbGVfdW52ZXJpZmllZCIsIm14X0V2ZW50VGlsZV91bmtub3duIiwibXhfRXZlbnRUaWxlX2JhZCIsIm14X0V2ZW50VGlsZV9lbW90ZSIsImFyaWFMaXZlIiwicGVybWFsaW5rIiwicGVybWFsaW5rQ3JlYXRvciIsImZvckV2ZW50IiwiYXZhdGFyIiwiYXZhdGFyU2l6ZSIsIm5lZWRzU2VuZGVyUHJvZmlsZSIsImxheW91dCIsIkxheW91dCIsIklSQyIsIm1lbWJlciIsInRoaXJkX3BhcnR5X2ludml0ZSIsInRhcmdldCIsIm9uU2VuZGVyUHJvZmlsZUNsaWNrIiwiZW5hYmxlRmxhaXIiLCJNZXNzYWdlQWN0aW9uQmFyIiwiYWN0aW9uQmFyIiwiZ2V0VGlsZSIsImdldFJlcGx5VGhyZWFkIiwib25BY3Rpb25CYXJGb2N1c0NoYW5nZSIsInRpbWVzdGFtcCIsImdldFRzIiwia2V5UmVxdWVzdEhlbHBUZXh0Iiwia2V5UmVxdWVzdEluZm9Db250ZW50Iiwic3ViIiwib25SZXF1ZXN0S2V5c0NsaWNrIiwiVG9vbHRpcEJ1dHRvbiIsImtleVJlcXVlc3RJbmZvIiwicmVhY3Rpb25zUm93IiwiUmVhY3Rpb25zUm93IiwibGlua2VkVGltZXN0YW1wIiwib25QZXJtYWxpbmtDbGlja2VkIiwiRGF0ZSIsInVzZUlSQ0xheW91dCIsImdyb3VwVGltZXN0YW1wIiwiaXJjVGltZXN0YW1wIiwiZ3JvdXBQYWRsb2NrIiwiaXJjUGFkbG9jayIsIm1zZ09wdGlvbiIsInNob3dSZWFkUmVjZWlwdHMiLCJyZWFkQXZhdGFycyIsIm5hbWUiLCJoaWdobGlnaHRzIiwiaGlnaGxpZ2h0TGluayIsInNob3dVcmxQcmV2aWV3IiwidGhyZWFkIiwiUmVwbHlUaHJlYWQiLCJtYWtlVGhyZWFkIiwicmVwbGFjaW5nRXZlbnRJZCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJtZXNzYWdlVHlwZXMiLCJpc1JlbGF0aW9uIiwiaGFuZGxlciIsIlRleHRGb3JFdmVudCIsInRleHRGb3JFdmVudCIsIkJvb2xlYW4iLCJFMmVQYWRsb2NrVW5kZWNyeXB0YWJsZSIsIkUyZVBhZGxvY2tVbnZlcmlmaWVkIiwiRTJlUGFkbG9ja1VuZW5jcnlwdGVkIiwiRTJlUGFkbG9ja1Vua25vd24iLCJFMmVQYWRsb2NrVW5hdXRoZW50aWNhdGVkIiwiRTJlUGFkbG9jayIsImhvdmVyIiwidG9vbHRpcCIsInRpdGxlIiwiaWNvbiIsIm9uSG92ZXJTdGFydCIsIm9uSG92ZXJFbmQiLCJTZW50UmVjZWlwdCIsIlB1cmVDb21wb25lbnQiLCJpc1NlbnQiLCJtZXNzYWdlU3RhdGUiLCJpc0ZhaWxlZCIsInJlY2VpcHRDbGFzc2VzIiwibm9uQ3NzQmFkZ2UiLCJTdGF0aWNOb3RpZmljYXRpb25TdGF0ZSIsIlJFRF9FWENMQU1BVElPTiIsImxhYmVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7OztBQUVBLE1BQU1BLGNBQWMsR0FBRztBQUNuQixHQUFDQyxpQkFBVUMsV0FBWCxHQUF5Qix1QkFETjtBQUVuQixHQUFDRCxpQkFBVUUsT0FBWCxHQUFxQix1QkFGRjtBQUduQixHQUFDRixpQkFBVUcscUJBQVgsR0FBbUMscUNBSGhCO0FBSW5CLEdBQUNILGlCQUFVSSxtQkFBWCxHQUFpQyxxQ0FKZDtBQUtuQixHQUFDSixpQkFBVUssVUFB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QUFLLEdBQUcseUJBQUcsdUJBQUgsQ0FBUjtBQUNILE9BRk0sTUFFQSxJQUFJTCxRQUFKLEVBQWM7QUFDakJLLFFBQUFBLEtBQUssR0FBRyx5QkFBRyxnQkFBSCxDQUFSO0FBQ0gsT0FSaUIsQ0FTbEI7QUFDQTs7O0FBQ0FkLE1BQUFBLE9BQU8sZ0JBQUcsNkJBQUMsZ0JBQUQ7QUFBUyxRQUFBLFNBQVMsRUFBQyx5Q0FBbkI7QUFBNkQsUUFBQSxLQUFLLEVBQUVjLEtBQXBFO0FBQTJFLFFBQUEsT0FBTyxFQUFFO0FBQXBGLFFBQVY7QUFDSDs7QUFFRCx3QkFBTztBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLG9CQUNIO0FBQU0sTUFBQSxTQUFTLEVBQUVKLGNBQWpCO0FBQWlDLE1BQUEsWUFBWSxFQUFFLEtBQUtQLFlBQXBEO0FBQWtFLE1BQUEsWUFBWSxFQUFFLEtBQUtDO0FBQXJGLE9BQ0tPLFdBREwsRUFFS1gsT0FGTCxDQURHLENBQVA7QUFNSDs7QUFyRCtFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBFdmVudFN0YXR1cywgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSZWxhdGlvbnMgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3JlbGF0aW9uc1wiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcblxuaW1wb3J0IFJlcGx5VGhyZWFkIGZyb20gXCIuLi9lbGVtZW50cy9SZXBseVRocmVhZFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgVGV4dEZvckV2ZW50IGZyb20gXCIuLi8uLi8uLi9UZXh0Rm9yRXZlbnRcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge0xheW91dH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL0xheW91dFwiO1xuaW1wb3J0IHtmb3JtYXRUaW1lfSBmcm9tIFwiLi4vLi4vLi4vRGF0ZVV0aWxzXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7QUxMX1JVTEVfVFlQRVN9IGZyb20gXCIuLi8uLi8uLi9tam9sbmlyL0Jhbkxpc3RcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQge0UyRV9TVEFURX0gZnJvbSBcIi4vRTJFSWNvblwiO1xuaW1wb3J0IHt0b1JlbX0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3VuaXRzXCI7XG5pbXBvcnQge1dpZGdldFR5cGV9IGZyb20gXCIuLi8uLi8uLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCB7V0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TGF5b3V0U3RvcmVcIjtcbmltcG9ydCB7b2JqZWN0SGFzRGlmZn0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL29iamVjdHNcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSBcIi4uL2VsZW1lbnRzL1Rvb2x0aXBcIjtcbmltcG9ydCB7IEVkaXRvclN0YXRlVHJhbnNmZXIgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRWRpdG9yU3RhdGVUcmFuc2ZlclwiO1xuaW1wb3J0IHsgUm9vbVBlcm1hbGlua0NyZWF0b3IgfSBmcm9tICcuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3MnO1xuaW1wb3J0IHtTdGF0aWNOb3RpZmljYXRpb25TdGF0ZX0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1N0YXRpY05vdGlmaWNhdGlvblN0YXRlXCI7XG5pbXBvcnQgTm90aWZpY2F0aW9uQmFkZ2UgZnJvbSBcIi4vTm90aWZpY2F0aW9uQmFkZ2VcIjtcblxuY29uc3QgZXZlbnRUaWxlVHlwZXMgPSB7XG4gICAgW0V2ZW50VHlwZS5Sb29tTWVzc2FnZV06ICdtZXNzYWdlcy5NZXNzYWdlRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuU3RpY2tlcl06ICdtZXNzYWdlcy5NZXNzYWdlRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuS2V5VmVyaWZpY2F0aW9uQ2FuY2VsXTogJ21lc3NhZ2VzLk1LZXlWZXJpZmljYXRpb25Db25jbHVzaW9uJyxcbiAgICBbRXZlbnRUeXBlLktleVZlcmlmaWNhdGlvbkRvbmVdOiAnbWVzc2FnZXMuTUtleVZlcmlmaWNhdGlvbkNvbmNsdXNpb24nLFxuICAgIFtFdmVudFR5cGUuQ2FsbEludml0ZV06ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuQ2FsbEFuc3dlcl06ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuQ2FsbEhhbmd1cF06ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuQ2FsbFJlamVjdF06ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxufTtcblxuY29uc3Qgc3RhdGVFdmVudFRpbGVUeXBlcyA9IHtcbiAgICBbRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uXTogJ21lc3NhZ2VzLkVuY3J5cHRpb25FdmVudCcsXG4gICAgW0V2ZW50VHlwZS5Sb29tQ2Fub25pY2FsQWxpYXNdOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICBbRXZlbnRUeXBlLlJvb21DcmVhdGVdOiAnbWVzc2FnZXMuUm9vbUNyZWF0ZScsXG4gICAgW0V2ZW50VHlwZS5Sb29tTWVtYmVyXTogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgW0V2ZW50VHlwZS5Sb29tTmFtZV06ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuUm9vbUF2YXRhcl06ICdtZXNzYWdlcy5Sb29tQXZhdGFyRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuUm9vbVRoaXJkUGFydHlJbnZpdGVdOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICBbRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eV06ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnLFxuICAgIFtFdmVudFR5cGUuUm9vbVRvcGljXTogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgW0V2ZW50VHlwZS5Sb29tUG93ZXJMZXZlbHNdOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICBbRXZlbnRUeXBlLlJvb21QaW5uZWRFdmVudHNdOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICBbRXZlbnRUeXBlLlJvb21TZXJ2ZXJBY2xdOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICBbV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFXTogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgW0V2ZW50VHlwZS5Sb29tVG9tYnN0b25lXTogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgW0V2ZW50VHlwZS5Sb29tSm9pblJ1bGVzXTogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsXG4gICAgW0V2ZW50VHlwZS5Sb29tR3Vlc3RBY2Nlc3NdOiAnbWVzc2FnZXMuVGV4dHVhbEV2ZW50JyxcbiAgICAnbS5yb29tLnJlbGF0ZWRfZ3JvdXBzJzogJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcsIC8vIGxlZ2FjeSBjb21tdW5pdGllcyBmbGFpclxufTtcblxuY29uc3Qgc3RhdGVFdmVudFNpbmd1bGFyID0gbmV3IFNldChbXG4gICAgRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uLFxuICAgIEV2ZW50VHlwZS5Sb29tQ2Fub25pY2FsQWxpYXMsXG4gICAgRXZlbnRUeXBlLlJvb21DcmVhdGUsXG4gICAgRXZlbnRUeXBlLlJvb21OYW1lLFxuICAgIEV2ZW50VHlwZS5Sb29tQXZhdGFyLFxuICAgIEV2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHksXG4gICAgRXZlbnRUeXBlLlJvb21Ub3BpYyxcbiAgICBFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzLFxuICAgIEV2ZW50VHlwZS5Sb29tUGlubmVkRXZlbnRzLFxuICAgIEV2ZW50VHlwZS5Sb29tU2VydmVyQWNsLFxuICAgIFdJREdFVF9MQVlPVVRfRVZFTlRfVFlQRSxcbiAgICBFdmVudFR5cGUuUm9vbVRvbWJzdG9uZSxcbiAgICBFdmVudFR5cGUuUm9vbUpvaW5SdWxlcyxcbiAgICBFdmVudFR5cGUuUm9vbUd1ZXN0QWNjZXNzLFxuICAgICdtLnJvb20ucmVsYXRlZF9ncm91cHMnLFxuXSk7XG5cbi8vIEFkZCBhbGwgdGhlIE1qb2xuaXIgc3R1ZmYgdG8gdGhlIHJlbmRlcmVyXG5mb3IgKGNvbnN0IGV2VHlwZSBvZiBBTExfUlVMRV9UWVBFUykge1xuICAgIHN0YXRlRXZlbnRUaWxlVHlwZXNbZXZUeXBlXSA9ICdtZXNzYWdlcy5UZXh0dWFsRXZlbnQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFuZGxlclRpbGUoZXYpIHtcbiAgICBjb25zdCB0eXBlID0gZXYuZ2V0VHlwZSgpO1xuXG4gICAgLy8gZG9uJ3Qgc2hvdyB2ZXJpZmljYXRpb24gcmVxdWVzdHMgd2UncmUgbm90IGludm9sdmVkIGluLFxuICAgIC8vIG5vdCBldmVuIHdoZW4gc2hvd2luZyBoaWRkZW4gZXZlbnRzXG4gICAgaWYgKHR5cGUgPT09IFwibS5yb29tLm1lc3NhZ2VcIikge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZXYuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoY29udGVudCAmJiBjb250ZW50Lm1zZ3R5cGUgPT09IFwibS5rZXkudmVyaWZpY2F0aW9uLnJlcXVlc3RcIikge1xuICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3QgbWUgPSBjbGllbnQgJiYgY2xpZW50LmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgaWYgKGV2LmdldFNlbmRlcigpICE9PSBtZSAmJiBjb250ZW50LnRvICE9PSBtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIm1lc3NhZ2VzLk1LZXlWZXJpZmljYXRpb25SZXF1ZXN0XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gdGhlc2UgZXZlbnRzIGFyZSBzZW50IGJ5IGJvdGggcGFydGllcyBkdXJpbmcgdmVyaWZpY2F0aW9uLCBidXQgd2Ugb25seSB3YW50IHRvIHJlbmRlciBvbmVcbiAgICAvLyB0aWxlIG9uY2UgdGhlIHZlcmlmaWNhdGlvbiBjb25jbHVkZXMsIHNvIGZpbHRlciBvdXQgdGhlIG9uZSBmcm9tIHRoZSBvdGhlciBwYXJ0eS5cbiAgICBpZiAodHlwZSA9PT0gXCJtLmtleS52ZXJpZmljYXRpb24uZG9uZVwiKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgbWUgPSBjbGllbnQgJiYgY2xpZW50LmdldFVzZXJJZCgpO1xuICAgICAgICBpZiAoZXYuZ2V0U2VuZGVyKCkgIT09IG1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc29tZXRpbWVzIE1LZXlWZXJpZmljYXRpb25Db25jbHVzaW9uIGRlY2xpbmVzIHRvIHJlbmRlci4gIEphbmtpbHkgZGVjbGluZSB0byByZW5kZXIgYW5kXG4gICAgLy8gZmFsbCBiYWNrIHRvIHNob3dpbmcgaGlkZGVuIGV2ZW50cywgaWYgd2UncmUgdmlld2luZyBoaWRkZW4gZXZlbnRzXG4gICAgLy8gWFhYOiBUaGlzIGlzIGV4dHJlbWVseSBhIGhhY2suIFBvc3NpYmx5IHRoZXNlIGNvbXBvbmVudHMgc2hvdWxkIGhhdmUgYW4gaW50ZXJmYWNlIGZvclxuICAgIC8vIGRlY2xpbmluZyB0byByZW5kZXI/XG4gICAgaWYgKHR5cGUgPT09IFwibS5rZXkudmVyaWZpY2F0aW9uLmNhbmNlbFwiIHx8IHR5cGUgPT09IFwibS5rZXkudmVyaWZpY2F0aW9uLmRvbmVcIikge1xuICAgICAgICBjb25zdCBNS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvbiA9IHNkay5nZXRDb21wb25lbnQoXCJtZXNzYWdlcy5NS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvblwiKTtcbiAgICAgICAgaWYgKCFNS2V5VmVyaWZpY2F0aW9uQ29uY2x1c2lvbi5wcm90b3R5cGUuX3Nob3VsZFJlbmRlci5jYWxsKG51bGwsIGV2LCBldi5yZXF1ZXN0KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgIGlmICh0eXBlID09PSBcImltLnZlY3Rvci5tb2R1bGFyLndpZGdldHNcIikge1xuICAgICAgICBsZXQgdHlwZSA9IGV2LmdldENvbnRlbnQoKVsndHlwZSddO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZWQvaW52YWxpZCB3aWRnZXQgLSB0cnkgdGhlIHBhc3Qgd2lkZ2V0IHR5cGVcbiAgICAgICAgICAgIHR5cGUgPSBldi5nZXRQcmV2Q29udGVudCgpWyd0eXBlJ107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJtZXNzYWdlcy5NSml0c2lXaWRnZXRFdmVudFwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV2LmlzU3RhdGUoKSkge1xuICAgICAgICBpZiAoc3RhdGVFdmVudFNpbmd1bGFyLmhhcyh0eXBlKSAmJiBldi5nZXRTdGF0ZUtleSgpICE9PSBcIlwiKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gc3RhdGVFdmVudFRpbGVUeXBlc1t0eXBlXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXZlbnRUaWxlVHlwZXNbdHlwZV07XG59XG5cbmNvbnN0IE1BWF9SRUFEX0FWQVRBUlMgPSA1O1xuXG4vLyBPdXIgY29tcG9uZW50IHN0cnVjdHVyZSBmb3IgRXZlbnRUaWxlcyBvbiB0aGUgdGltZWxpbmUgaXM6XG4vL1xuLy8gLi1FdmVudFRpbGUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uXG4vLyB8IE1lbWJlckF2YXRhciAoU2VuZGVyUHJvZmlsZSkgICAgICAgICAgICAgICAgICAgVGltZVN0YW1wIHxcbi8vIHwgICAgLi17TWVzc2FnZSxUZXh0dWFsfUV2ZW50LS0tLS0tLS0tLS0tLS0tLiBSZWFkIEF2YXRhcnMgfFxuLy8gfCAgICB8ICAgLi1NRm9vQm9keS0tLS0tLS0tLS0tLS0tLS0tLS0uICAgICB8ICAgICAgICAgICAgICB8XG4vLyB8ICAgIHwgICB8ICAob25seSBpZiBNZXNzYWdlRXZlbnQpICAgIHwgICAgIHwgICAgICAgICAgICAgIHxcbi8vIHwgICAgfCAgICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyAgICAgfCAgICAgICAgICAgICAgfFxuLy8gfCAgICAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICAgICAgICAgICB8XG4vLyAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSdcblxuaW50ZXJmYWNlIElSZWFkUmVjZWlwdFByb3BzIHtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICByb29tTWVtYmVyOiBSb29tTWVtYmVyO1xuICAgIHRzOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIHRoZSBNYXRyaXhFdmVudCB0byBzaG93XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG5cbiAgICAvLyB0cnVlIGlmIG14RXZlbnQgaXMgcmVkYWN0ZWQuIFRoaXMgaXMgYSBwcm9wIGJlY2F1c2UgdXNpbmcgbXhFdmVudC5pc1JlZGFjdGVkKClcbiAgICAvLyBtaWdodCBub3QgYmUgZW5vdWdoIHdoZW4gZGVjaWRpbmcgc2hvdWxkQ29tcG9uZW50VXBkYXRlIC0gcHJldlByb3BzLm14RXZlbnRcbiAgICAvLyByZWZlcmVuY2VzIHRoZSBzYW1lIHRoaXMucHJvcHMubXhFdmVudC5cbiAgICBpc1JlZGFjdGVkPzogYm9vbGVhbjtcblxuICAgIC8vIHRydWUgaWYgdGhpcyBpcyBhIGNvbnRpbnVhdGlvbiBvZiB0aGUgcHJldmlvdXMgZXZlbnQgKHdoaWNoIGhhcyB0aGVcbiAgICAvLyBlZmZlY3Qgb2Ygbm90IHNob3dpbmcgYW5vdGhlciBhdmF0YXIvZGlzcGxheW5hbWVcbiAgICBjb250aW51YXRpb24/OiBib29sZWFuO1xuXG4gICAgLy8gdHJ1ZSBpZiB0aGlzIGlzIHRoZSBsYXN0IGV2ZW50IGluIHRoZSB0aW1lbGluZSAod2hpY2ggaGFzIHRoZSBlZmZlY3RcbiAgICAvLyBvZiBhbHdheXMgc2hvd2luZyB0aGUgdGltZXN0YW1wKVxuICAgIGxhc3Q/OiBib29sZWFuO1xuXG4gICAgLy8gdHJ1ZSBpZiB0aGUgZXZlbnQgaXMgdGhlIGxhc3QgZXZlbnQgaW4gYSBzZWN0aW9uIChhZGRzIGEgY3NzIGNsYXNzIGZvclxuICAgIC8vIHRhcmdldGluZylcbiAgICBsYXN0SW5TZWN0aW9uPzogYm9vbGVhbjtcblxuICAgIC8vIFRydWUgaWYgdGhlIGV2ZW50IGlzIHRoZSBsYXN0IHN1Y2Nlc3NmdWwgKHNlbnQpIGV2ZW50LlxuICAgIGxhc3RTdWNjZXNzZnVsPzogYm9vbGVhbjtcblxuICAgIC8vIHRydWUgaWYgdGhpcyBpcyBzZWFyY2ggY29udGV4dCAod2hpY2ggaGFzIHRoZSBlZmZlY3Qgb2YgZ3JleWluZyBvdXRcbiAgICAvLyB0aGUgdGV4dFxuICAgIGNvbnRleHR1YWw/OiBib29sZWFuO1xuXG4gICAgLy8gYSBsaXN0IG9mIHdvcmRzIHRvIGhpZ2hsaWdodCwgb3JkZXJlZCBieSBsb25nZXN0IGZpcnN0XG4gICAgaGlnaGxpZ2h0cz86IHN0cmluZ1tdO1xuXG4gICAgLy8gbGluayBVUkwgZm9yIHRoZSBoaWdobGlnaHRzXG4gICAgaGlnaGxpZ2h0TGluaz86IHN0cmluZztcblxuICAgIC8vIHNob3VsZCBzaG93IFVSTCBwcmV2aWV3cyBmb3IgdGhpcyBldmVudFxuICAgIHNob3dVcmxQcmV2aWV3PzogYm9vbGVhbjtcblxuICAgIC8vIGlzIHRoaXMgdGhlIGZvY3VzZWQgZXZlbnRcbiAgICBpc1NlbGVjdGVkRXZlbnQ/OiBib29sZWFuO1xuXG4gICAgLy8gY2FsbGJhY2sgY2FsbGVkIHdoZW4gZHluYW1pYyBjb250ZW50IGluIGV2ZW50cyBhcmUgbG9hZGVkXG4gICAgb25IZWlnaHRDaGFuZ2VkPzogKCkgPT4gdm9pZDtcblxuICAgIC8vIGEgbGlzdCBvZiByZWFkLXJlY2VpcHRzIHdlIHNob3VsZCBzaG93LiBFYWNoIG9iamVjdCBoYXMgYSAncm9vbU1lbWJlcicgYW5kICd0cycuXG4gICAgcmVhZFJlY2VpcHRzPzogSVJlYWRSZWNlaXB0UHJvcHNbXTtcblxuICAgIC8vIG9wYXF1ZSByZWFkcmVjZWlwdCBpbmZvIGZvciBlYWNoIHVzZXJJZDsgdXNlZCBieSBSZWFkUmVjZWlwdE1hcmtlclxuICAgIC8vIHRvIG1hbmFnZSBpdHMgYW5pbWF0aW9ucy4gU2hvdWxkIGJlIGFuIGVtcHR5IG9iamVjdCB3aGVuIHRoZSByb29tXG4gICAgLy8gZmlyc3QgbG9hZHNcbiAgICByZWFkUmVjZWlwdE1hcD86IGFueTtcblxuICAgIC8vIEEgZnVuY3Rpb24gd2hpY2ggaXMgdXNlZCB0byBjaGVjayBpZiB0aGUgcGFyZW50IHBhbmVsIGlzIGJlaW5nXG4gICAgLy8gdW5tb3VudGVkLCB0byBhdm9pZCB1bm5lY2Vzc2FyeSB3b3JrLiBTaG91bGQgcmV0dXJuIHRydWUgaWYgd2VcbiAgICAvLyBhcmUgYmVpbmcgdW5tb3VudGVkLlxuICAgIGNoZWNrVW5tb3VudGluZz86ICgpID0+IGJvb2xlYW47XG5cbiAgICAvLyB0aGUgc3RhdHVzIG9mIHRoaXMgZXZlbnQgLSBpZSwgbXhFdmVudC5zdGF0dXMuIERlbm9ybWFsaXNlZCB0byBoZXJlIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gdGVsbCB3aGVuIGl0IGNoYW5nZXMuXG4gICAgZXZlbnRTZW5kU3RhdHVzPzogc3RyaW5nO1xuXG4gICAgLy8gdGhlIHNoYXBlIG9mIHRoZSB0aWxlLiBieSBkZWZhdWx0LCB0aGUgbGF5b3V0IGlzIGludGVuZGVkIGZvciB0aGVcbiAgICAvLyBub3JtYWwgcm9vbSB0aW1lbGluZS4gIGFsdGVybmF0aXZlIHZhbHVlcyBhcmU6IFwiZmlsZV9saXN0XCIsIFwiZmlsZV9ncmlkXCJcbiAgICAvLyBhbmQgXCJub3RpZlwiLiAgVGhpcyBjb3VsZCBiZSBkb25lIGJ5IENTUywgYnV0IGl0J2QgYmUgaG9ycmlibHkgaW5lZmZpY2llbnQuXG4gICAgLy8gSXQgY291bGQgYWxzbyBiZSBkb25lIGJ5IHN1YmNsYXNzaW5nIEV2ZW50VGlsZSwgYnV0IHRoYXQnZCBiZSBxdWl0ZVxuICAgIC8vIGJvaWlsZXJwbGF0ZXkuICBTbyBqdXN0IG1ha2UgdGhlIG5lY2Vzc2FyeSByZW5kZXIgZGVjaXNpb25zIGNvbmRpdGlvbmFsXG4gICAgLy8gZm9yIG5vdy5cbiAgICB0aWxlU2hhcGU/OiAnbm90aWYnIHwgJ2ZpbGVfZ3JpZCcgfCAncmVwbHknIHwgJ3JlcGx5X3ByZXZpZXcnO1xuXG4gICAgLy8gc2hvdyB0d2VsdmUgaG91ciB0aW1lc3RhbXBzXG4gICAgaXNUd2VsdmVIb3VyPzogYm9vbGVhbjtcblxuICAgIC8vIGhlbHBlciBmdW5jdGlvbiB0byBhY2Nlc3MgcmVsYXRpb25zIGZvciB0aGlzIGV2ZW50XG4gICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQ/OiAoZXZlbnRJZDogc3RyaW5nLCByZWxhdGlvblR5cGU6IHN0cmluZywgZXZlbnRUeXBlOiBzdHJpbmcpID0+IFJlbGF0aW9ucztcblxuICAgIC8vIHdoZXRoZXIgdG8gc2hvdyByZWFjdGlvbnMgZm9yIHRoaXMgZXZlbnRcbiAgICBzaG93UmVhY3Rpb25zPzogYm9vbGVhbjtcblxuICAgIC8vIHdoaWNoIGxheW91dCB0byB1c2VcbiAgICBsYXlvdXQ6IExheW91dDtcblxuICAgIC8vIHdoZXRoZXIgb3Igbm90IHRvIHNob3cgZmxhaXIgYXQgYWxsXG4gICAgZW5hYmxlRmxhaXI/OiBib29sZWFuO1xuXG4gICAgLy8gd2hldGhlciBvciBub3QgdG8gc2hvdyByZWFkIHJlY2VpcHRzXG4gICAgc2hvd1JlYWRSZWNlaXB0cz86IGJvb2xlYW47XG5cbiAgICAvLyBVc2VkIHdoaWxlIGVkaXRpbmcsIHRvIHBhc3MgdGhlIGV2ZW50LCBhbmQgdG8gcHJlc2VydmUgZWRpdG9yIHN0YXRlXG4gICAgLy8gZnJvbSBvbmUgZWRpdG9yIGluc3RhbmNlIHRvIGFub3RoZXIgd2hlbiByZW1vdW50aW5nIHRoZSBlZGl0b3JcbiAgICAvLyB1cG9uIHJlY2VpdmluZyB0aGUgcmVtb3RlIGVjaG8gZm9yIGFuIHVuc2VudCBldmVudC5cbiAgICBlZGl0U3RhdGU/OiBFZGl0b3JTdGF0ZVRyYW5zZmVyO1xuXG4gICAgLy8gRXZlbnQgSUQgb2YgdGhlIGV2ZW50IHJlcGxhY2luZyB0aGUgY29udGVudCBvZiB0aGlzIGV2ZW50LCBpZiBhbnlcbiAgICByZXBsYWNpbmdFdmVudElkPzogc3RyaW5nO1xuXG4gICAgLy8gSGVscGVyIHRvIGJ1aWxkIHBlcm1hbGlua3MgZm9yIHRoZSByb29tXG4gICAgcGVybWFsaW5rQ3JlYXRvcj86IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICAvLyBXaGV0aGVyIHRoZSBhY3Rpb24gYmFyIGlzIGZvY3VzZWQuXG4gICAgYWN0aW9uQmFyRm9jdXNlZDogYm9vbGVhbjtcbiAgICAvLyBXaGV0aGVyIGFsbCByZWFkIHJlY2VpcHRzIGFyZSBiZWluZyBkaXNwbGF5ZWQuIElmIG5vdCwgb25seSBkaXNwbGF5XG4gICAgLy8gYSB0cnVuY2F0aW9uIG9mIHRoZW0uXG4gICAgYWxsUmVhZEF2YXRhcnM6IGJvb2xlYW47XG4gICAgLy8gV2hldGhlciB0aGUgZXZlbnQncyBzZW5kZXIgaGFzIGJlZW4gdmVyaWZpZWQuXG4gICAgdmVyaWZpZWQ6IHN0cmluZztcbiAgICAvLyBXaGV0aGVyIG9uUmVxdWVzdEtleXNDbGljayBoYXMgYmVlbiBjYWxsZWQgc2luY2UgbW91bnRpbmcuXG4gICAgcHJldmlvdXNseVJlcXVlc3RlZEtleXM6IGJvb2xlYW47XG4gICAgLy8gVGhlIFJlbGF0aW9ucyBtb2RlbCBmcm9tIHRoZSBKUyBTREsgZm9yIHJlYWN0aW9ucyB0byBgbXhFdmVudGBcbiAgICByZWFjdGlvbnM6IFJlbGF0aW9ucztcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Mucm9vbXMuRXZlbnRUaWxlXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudFRpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHN1cHByZXNzUmVhZFJlY2VpcHRBbmltYXRpb246IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBpc0xpc3RlbmluZ0ZvclJlY2VpcHRzOiBib29sZWFuO1xuICAgIHByaXZhdGUgdGlsZSA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgIHByaXZhdGUgcmVwbHlUaHJlYWQgPSBSZWFjdC5jcmVhdGVSZWYoKTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIC8vIG5vLW9wIGZ1bmN0aW9uIGJlY2F1c2Ugb25IZWlnaHRDaGFuZ2VkIGlzIG9wdGlvbmFsIHlldCBzb21lIHN1Yi1jb21wb25lbnRzIGFzc3VtZSBpdHMgZXhpc3RlbmNlXG4gICAgICAgIG9uSGVpZ2h0Q2hhbmdlZDogZnVuY3Rpb24oKSB7fSxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gV2hldGhlciB0aGUgYWN0aW9uIGJhciBpcyBmb2N1c2VkLlxuICAgICAgICAgICAgYWN0aW9uQmFyRm9jdXNlZDogZmFsc2UsXG4gICAgICAgICAgICAvLyBXaGV0aGVyIGFsbCByZWFkIHJlY2VpcHRzIGFyZSBiZWluZyBkaXNwbGF5ZWQuIElmIG5vdCwgb25seSBkaXNwbGF5XG4gICAgICAgICAgICAvLyBhIHRydW5jYXRpb24gb2YgdGhlbS5cbiAgICAgICAgICAgIGFsbFJlYWRBdmF0YXJzOiBmYWxzZSxcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdGhlIGV2ZW50J3Mgc2VuZGVyIGhhcyBiZWVuIHZlcmlmaWVkLlxuICAgICAgICAgICAgdmVyaWZpZWQ6IG51bGwsXG4gICAgICAgICAgICAvLyBXaGV0aGVyIG9uUmVxdWVzdEtleXNDbGljayBoYXMgYmVlbiBjYWxsZWQgc2luY2UgbW91bnRpbmcuXG4gICAgICAgICAgICBwcmV2aW91c2x5UmVxdWVzdGVkS2V5czogZmFsc2UsXG4gICAgICAgICAgICAvLyBUaGUgUmVsYXRpb25zIG1vZGVsIGZyb20gdGhlIEpTIFNESyBmb3IgcmVhY3Rpb25zIHRvIGBteEV2ZW50YFxuICAgICAgICAgICAgcmVhY3Rpb25zOiB0aGlzLmdldFJlYWN0aW9ucygpLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGRvbid0IGRvIFJSIGFuaW1hdGlvbnMgdW50aWwgd2UgYXJlIG1vdW50ZWRcbiAgICAgICAgdGhpcy5zdXBwcmVzc1JlYWRSZWNlaXB0QW5pbWF0aW9uID0gdHJ1ZTtcblxuICAgICAgICAvLyBUaHJvdWdob3V0IHRoZSBjb21wb25lbnQgd2UgbWFuYWdlIGEgcmVhZCByZWNlaXB0IGxpc3RlbmVyIHRvIHNlZSBpZiBvdXIgdGlsZSBzdGlsbFxuICAgICAgICAvLyBxdWFsaWZpZXMgZm9yIGEgXCJzZW50XCIgb3IgXCJzZW5kaW5nXCIgc3RhdGUgKGJhc2VkIG9uIHRoZWlyIHJlbGV2YW50IGNvbmRpdGlvbnMpLiBXZVxuICAgICAgICAvLyBkb24ndCB3YW50IHRvIG92ZXItc3Vic2NyaWJlIHRvIHRoZSByZWFkIHJlY2VpcHQgZXZlbnRzIGJlaW5nIGZpcmVkLCBzbyB3ZSB1c2UgYSBmbGFnXG4gICAgICAgIC8vIHRvIGRldGVybWluZSBpZiB3ZSd2ZSBhbHJlYWR5IHN1YnNjcmliZWQgYW5kIHVzZSBhIGNvbWJpbmF0aW9uIG9mIG90aGVyIGZsYWdzIHRvIGZpbmRcbiAgICAgICAgLy8gb3V0IGlmIHdlIHNob3VsZCBldmVuIGJlIHN1YnNjcmliZWQgYXQgYWxsLlxuICAgICAgICB0aGlzLmlzTGlzdGVuaW5nRm9yUmVjZWlwdHMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIHRydWUsIHRoZSB0aWxlIHF1YWxpZmllcyBmb3Igc29tZSBzb3J0IG9mIHNwZWNpYWwgcmVhZCByZWNlaXB0LiBUaGlzIGNvdWxkIGJlIGEgJ3NlbmRpbmcnXG4gICAgICogb3IgJ3NlbnQnIHJlY2VpcHQsIGZvciBleGFtcGxlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0IGlzRWxpZ2libGVGb3JTcGVjaWFsUmVjZWlwdCgpIHtcbiAgICAgICAgLy8gRmlyc3QsIGlmIHRoZXJlIGFyZSBvdGhlciByZWFkIHJlY2VpcHRzIHRoZW4ganVzdCBzaG9ydC1jaXJjdWl0IHRoaXMuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlYWRSZWNlaXB0cyAmJiB0aGlzLnByb3BzLnJlYWRSZWNlaXB0cy5sZW5ndGggPiAwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5teEV2ZW50KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gU2FuaXR5IGNoZWNrIChzaG91bGQgbmV2ZXIgaGFwcGVuLCBidXQgd2Ugc2hvdWxkbid0IGV4cGxvZGUgaWYgaXQgZG9lcylcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMuY29udGV4dC5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGlmICghcm9vbSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIFF1aWNrbHkgY2hlY2sgdG8gc2VlIGlmIHRoZSBldmVudCB3YXMgc2VudCBieSB1cy4gSWYgaXQgd2Fzbid0LCBpdCB3b24ndCBxdWFsaWZ5IGZvclxuICAgICAgICAvLyBzcGVjaWFsIHJlYWQgcmVjZWlwdHMuXG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5teEV2ZW50LmdldFNlbmRlcigpICE9PSBteVVzZXJJZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIEZpbmFsbHksIGRldGVybWluZSBpZiB0aGUgdHlwZSBpcyByZWxldmFudCB0byB0aGUgdXNlci4gVGhpcyBub3RhYmx5IGV4Y2x1ZGVzIHN0YXRlXG4gICAgICAgIC8vIGV2ZW50cyBhbmQgcHJldHR5IG11Y2ggYW55dGhpbmcgdGhhdCBjYW4ndCBiZSBzZW50IGJ5IHRoZSBjb21wb3NlciBhcyBhIG1lc3NhZ2UuIEZvclxuICAgICAgICAvLyB0aG9zZSB3ZSByZWx5IG9uIGxvY2FsIGVjaG8gZ2l2aW5nIHRoZSBpbXByZXNzaW9uIG9mIHRoaW5ncyBjaGFuZ2luZywgYW5kIGV4cGVjdCB0aGVtXG4gICAgICAgIC8vIHRvIGJlIHF1aWNrLlxuICAgICAgICBjb25zdCBzaW1wbGVTZW5kYWJsZUV2ZW50cyA9IFtcbiAgICAgICAgICAgIEV2ZW50VHlwZS5TdGlja2VyLFxuICAgICAgICAgICAgRXZlbnRUeXBlLlJvb21NZXNzYWdlLFxuICAgICAgICAgICAgRXZlbnRUeXBlLlJvb21NZXNzYWdlRW5jcnlwdGVkLFxuICAgICAgICBdO1xuICAgICAgICBpZiAoIXNpbXBsZVNlbmRhYmxlRXZlbnRzLmluY2x1ZGVzKHRoaXMucHJvcHMubXhFdmVudC5nZXRUeXBlKCkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gRGVmYXVsdCBjYXNlXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IHNob3VsZFNob3dTZW50UmVjZWlwdCgpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGV2ZW4gZWxpZ2libGUsIGRvbid0IHNob3cgdGhlIHJlY2VpcHQuXG4gICAgICAgIGlmICghdGhpcy5pc0VsaWdpYmxlRm9yU3BlY2lhbFJlY2VpcHQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyBXZSBvbmx5IHNob3cgdGhlICdzZW50JyByZWNlaXB0IG9uIHRoZSBsYXN0IHN1Y2Nlc3NmdWwgZXZlbnQuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5sYXN0U3VjY2Vzc2Z1bCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIENoZWNrIHRvIG1ha2Ugc3VyZSB0aGUgc2VuZGluZyBzdGF0ZSBpcyBhcHByb3ByaWF0ZS4gQSBudWxsL3VuZGVmaW5lZCBzZW5kIHN0YXR1cyBtZWFuc1xuICAgICAgICAvLyB0aGF0IHRoZSBtZXNzYWdlIGlzICdzZW50Jywgc28gd2UncmUganVzdCBkb3VibGUgY2hlY2tpbmcgdGhhdCBpdCdzIGV4cGxpY2l0bHkgbm90IHNlbnQuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyAmJiB0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyAhPT0gJ3NlbnQnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gSWYgYW55b25lIGhhcyByZWFkIHRoZSBldmVudCBiZXNpZGVzIHVzLCB3ZSBkb24ndCB3YW50IHRvIHNob3cgYSBzZW50IHJlY2VpcHQuXG4gICAgICAgIGNvbnN0IHJlY2VpcHRzID0gdGhpcy5wcm9wcy5yZWFkUmVjZWlwdHMgfHwgW107XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICBpZiAocmVjZWlwdHMuc29tZShyID0+IHIudXNlcklkICE9PSBteVVzZXJJZCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyBGaW5hbGx5LCB3ZSBzaG91bGQgc2hvdyBhIHJlY2VpcHQuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IHNob3VsZFNob3dTZW5kaW5nUmVjZWlwdCgpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGV2ZW4gZWxpZ2libGUsIGRvbid0IHNob3cgdGhlIHJlY2VpcHQuXG4gICAgICAgIGlmICghdGhpcy5pc0VsaWdpYmxlRm9yU3BlY2lhbFJlY2VpcHQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAvLyBDaGVjayB0aGUgZXZlbnQgc2VuZCBzdGF0dXMgdG8gc2VlIGlmIHdlIGFyZSBwZW5kaW5nLiBOdWxsL3VuZGVmaW5lZCBzdGF0dXMgbWVhbnMgdGhlXG4gICAgICAgIC8vIG1lc3NhZ2Ugd2FzIHNlbnQsIHNvIGNoZWNrIGZvciB0aGF0IGFuZCAnc2VudCcgZXhwbGljaXRseS5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyB8fCB0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyA9PT0gJ3NlbnQnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgLy8gRGVmYXVsdCB0byBzaG93aW5nIC0gdGhlcmUncyBubyBvdGhlciBldmVudCBwcm9wZXJ0aWVzL2JlaGF2aW91cnMgd2UgY2FyZSBhYm91dCBhdFxuICAgICAgICAvLyB0aGlzIHBvaW50LlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gTW92ZSBpbnRvIGNvbnN0cnVjdG9yXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIHRoaXMudmVyaWZ5RXZlbnQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5zdXBwcmVzc1JlYWRSZWNlaXB0QW5pbWF0aW9uID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgY2xpZW50Lm9uKFwiZGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZFwiLCB0aGlzLm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgIGNsaWVudC5vbihcInVzZXJUcnVzdFN0YXR1c0NoYW5nZWRcIiwgdGhpcy5vblVzZXJWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50Lm9uKFwiRXZlbnQuZGVjcnlwdGVkXCIsIHRoaXMub25EZWNyeXB0ZWQpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQub24oXCJFdmVudC5yZWxhdGlvbnNDcmVhdGVkXCIsIHRoaXMub25SZWFjdGlvbnNDcmVhdGVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNob3dTZW50UmVjZWlwdCB8fCB0aGlzLnNob3VsZFNob3dTZW5kaW5nUmVjZWlwdCkge1xuICAgICAgICAgICAgY2xpZW50Lm9uKFwiUm9vbS5yZWNlaXB0XCIsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgICAgICB0aGlzLmlzTGlzdGVuaW5nRm9yUmVjZWlwdHMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIC8vIHJlLWNoZWNrIHRoZSBzZW5kZXIgdmVyaWZpY2F0aW9uIGFzIG91dGdvaW5nIGV2ZW50cyBwcm9ncmVzcyB0aHJvdWdoXG4gICAgICAgIC8vIHRoZSBzZW5kIHByb2Nlc3MuXG4gICAgICAgIGlmIChuZXh0UHJvcHMuZXZlbnRTZW5kU3RhdHVzICE9PSB0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cykge1xuICAgICAgICAgICAgdGhpcy52ZXJpZnlFdmVudChuZXh0UHJvcHMubXhFdmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgaWYgKG9iamVjdEhhc0RpZmYodGhpcy5zdGF0ZSwgbmV4dFN0YXRlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gIXRoaXMucHJvcHNFcXVhbCh0aGlzLnByb3BzLCBuZXh0UHJvcHMpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcImRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWRcIiwgdGhpcy5vbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQpO1xuICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoXCJ1c2VyVHJ1c3RTdGF0dXNDaGFuZ2VkXCIsIHRoaXMub25Vc2VyVmVyaWZpY2F0aW9uQ2hhbmdlZCk7XG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihcIlJvb20ucmVjZWlwdFwiLCB0aGlzLm9uUm9vbVJlY2VpcHQpO1xuICAgICAgICB0aGlzLmlzTGlzdGVuaW5nRm9yUmVjZWlwdHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LnJlbW92ZUxpc3RlbmVyKFwiRXZlbnQuZGVjcnlwdGVkXCIsIHRoaXMub25EZWNyeXB0ZWQpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93UmVhY3Rpb25zKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQucmVtb3ZlTGlzdGVuZXIoXCJFdmVudC5yZWxhdGlvbnNDcmVhdGVkXCIsIHRoaXMub25SZWFjdGlvbnNDcmVhdGVkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSwgc25hcHNob3QpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGxpc3RlbmluZyBmb3IgcmVjZWlwdHMgYW5kIGV4cGVjdCB0byBiZSwgcmVnaXN0ZXIgYSBsaXN0ZW5lci5cbiAgICAgICAgaWYgKCF0aGlzLmlzTGlzdGVuaW5nRm9yUmVjZWlwdHMgJiYgKHRoaXMuc2hvdWxkU2hvd1NlbnRSZWNlaXB0IHx8IHRoaXMuc2hvdWxkU2hvd1NlbmRpbmdSZWNlaXB0KSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0Lm9uKFwiUm9vbS5yZWNlaXB0XCIsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgICAgICB0aGlzLmlzTGlzdGVuaW5nRm9yUmVjZWlwdHMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJvb21SZWNlaXB0ID0gKGV2LCByb29tKSA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGNvbnN0IHRpbGVSb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgaWYgKHJvb20gIT09IHRpbGVSb29tKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFNob3dTZW50UmVjZWlwdCAmJiAhdGhpcy5zaG91bGRTaG93U2VuZGluZ1JlY2VpcHQgJiYgIXRoaXMuaXNMaXN0ZW5pbmdGb3JSZWNlaXB0cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgZm9yY2UgdXBkYXRlIGJlY2F1c2Ugd2UgaGF2ZSBubyBzdGF0ZSBvciBwcm9wIGNoYW5nZXMgdG8gcXVldWUgdXAsIGluc3RlYWQgcmVseWluZyBvblxuICAgICAgICAvLyB0aGUgZ2V0dGVycyB3ZSB1c2UgaGVyZSB0byBkZXRlcm1pbmUgd2hhdCBuZWVkcyByZW5kZXJpbmcuXG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKCkgPT4ge1xuICAgICAgICAgICAgLy8gUGVyIGVsc2V3aGVyZSBpbiB0aGlzIGZpbGUsIHdlIGNhbiByZW1vdmUgdGhlIGxpc3RlbmVyIG9uY2Ugd2Ugd2lsbCBoYXZlIG5vIGZ1cnRoZXIgcHVycG9zZSBmb3IgaXQuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2hvdWxkU2hvd1NlbnRSZWNlaXB0ICYmICF0aGlzLnNob3VsZFNob3dTZW5kaW5nUmVjZWlwdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZW1vdmVMaXN0ZW5lcihcIlJvb20ucmVjZWlwdFwiLCB0aGlzLm9uUm9vbVJlY2VpcHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNMaXN0ZW5pbmdGb3JSZWNlaXB0cyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBkZWNyeXB0ZWQgYWZ0ZXIgd2Ugc2hvdyBpdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIG9uRGVjcnlwdGVkID0gKCkgPT4ge1xuICAgICAgICAvLyB3ZSBuZWVkIHRvIHJlLXZlcmlmeSB0aGUgc2VuZGluZyBkZXZpY2UuXG4gICAgICAgIC8vICh3ZSBjYWxsIG9uSGVpZ2h0Q2hhbmdlZCBpbiB2ZXJpZnlFdmVudCB0byBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgZGVjcnlwdGlvblxuICAgICAgICAvLyBoYXMgY2F1c2VkIGEgY2hhbmdlIGluIHNpemUgb2YgdGhlIGV2ZW50IHRpbGUpXG4gICAgICAgIHRoaXMudmVyaWZ5RXZlbnQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCA9ICh1c2VySWQsIGRldmljZSkgPT4ge1xuICAgICAgICBpZiAodXNlcklkID09PSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0U2VuZGVyKCkpIHtcbiAgICAgICAgICAgIHRoaXMudmVyaWZ5RXZlbnQodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclZlcmlmaWNhdGlvbkNoYW5nZWQgPSAodXNlcklkLCBfdHJ1c3RTdGF0dXMpID0+IHtcbiAgICAgICAgaWYgKHVzZXJJZCA9PT0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFNlbmRlcigpKSB7XG4gICAgICAgICAgICB0aGlzLnZlcmlmeUV2ZW50KHRoaXMucHJvcHMubXhFdmVudCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyB2ZXJpZnlFdmVudChteEV2ZW50KSB7XG4gICAgICAgIGlmICghbXhFdmVudC5pc0VuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbmNyeXB0aW9uSW5mbyA9IHRoaXMuY29udGV4dC5nZXRFdmVudEVuY3J5cHRpb25JbmZvKG14RXZlbnQpO1xuICAgICAgICBjb25zdCBzZW5kZXJJZCA9IG14RXZlbnQuZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IHVzZXJUcnVzdCA9IHRoaXMuY29udGV4dC5jaGVja1VzZXJUcnVzdChzZW5kZXJJZCk7XG5cbiAgICAgICAgaWYgKGVuY3J5cHRpb25JbmZvLm1pc21hdGNoZWRTZW5kZXIpIHtcbiAgICAgICAgICAgIC8vIHNvbWV0aGluZyBkZWZpbml0ZWx5IHdyb25nIGlzIGdvaW5nIG9uIGhlcmVcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuV0FSTklORyxcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1c2VyVHJ1c3QuaXNDcm9zc1NpZ25pbmdWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAvLyB1c2VyIGlzIG5vdCB2ZXJpZmllZCwgc28gZGVmYXVsdCB0byBldmVyeXRoaW5nIGlzIG5vcm1hbFxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZpZWQ6IEUyRV9TVEFURS5OT1JNQUwsXG4gICAgICAgICAgICB9LCB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCk7IC8vIERlY3J5cHRpb24gbWF5IGhhdmUgY2F1c2VkIGEgY2hhbmdlIGluIHNpemVcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV2ZW50U2VuZGVyVHJ1c3QgPSBlbmNyeXB0aW9uSW5mby5zZW5kZXIgJiYgdGhpcy5jb250ZXh0LmNoZWNrRGV2aWNlVHJ1c3QoXG4gICAgICAgICAgICBzZW5kZXJJZCwgZW5jcnlwdGlvbkluZm8uc2VuZGVyLmRldmljZUlkLFxuICAgICAgICApO1xuICAgICAgICBpZiAoIWV2ZW50U2VuZGVyVHJ1c3QpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuVU5LTk9XTixcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFldmVudFNlbmRlclRydXN0LmlzVmVyaWZpZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZpZWQ6IEUyRV9TVEFURS5XQVJOSU5HLFxuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQpOyAvLyBEZWNyeXB0aW9uIG1heSBoYXZlIGNhdXNlZCBhIGNoYW5nZSBpbiBzaXplXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWVuY3J5cHRpb25JbmZvLmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuVU5BVVRIRU5USUNBVEVELFxuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQpOyAvLyBEZWNyeXB0aW9uIG1heSBoYXZlIGNhdXNlZCBhIGNoYW5nZSBpbiBzaXplXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZlcmlmaWVkOiBFMkVfU1RBVEUuVkVSSUZJRUQsXG4gICAgICAgIH0sIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKTsgLy8gRGVjcnlwdGlvbiBtYXkgaGF2ZSBjYXVzZWQgYSBjaGFuZ2UgaW4gc2l6ZVxuICAgIH1cblxuICAgIHByaXZhdGUgcHJvcHNFcXVhbChvYmpBLCBvYmpCKSB7XG4gICAgICAgIGNvbnN0IGtleXNBID0gT2JqZWN0LmtleXMob2JqQSk7XG4gICAgICAgIGNvbnN0IGtleXNCID0gT2JqZWN0LmtleXMob2JqQik7XG5cbiAgICAgICAgaWYgKGtleXNBLmxlbmd0aCAhPT0ga2V5c0IubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXNBLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBrZXlzQVtpXTtcblxuICAgICAgICAgICAgaWYgKCFvYmpCLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZGVlcC1jb21wYXJlIHJlYWRSZWNlaXB0c1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3JlYWRSZWNlaXB0cycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByQSA9IG9iakFba2V5XTtcbiAgICAgICAgICAgICAgICBjb25zdCByQiA9IG9iakJba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAockEgPT09IHJCKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghckEgfHwgIXJCKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAockEubGVuZ3RoICE9PSByQi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJBLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyQVtqXS51c2VySWQgIT09IHJCW2pdLnVzZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIG9uZSBoYXMgYSBtZW1iZXIgc2V0IGFuZCB0aGUgb3RoZXIgZG9lc24ndD9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJBW2pdLnJvb21NZW1iZXIgIT09IHJCW2pdLnJvb21NZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iakFba2V5XSAhPT0gb2JqQltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgc2hvdWxkSGlnaGxpZ2h0KCkge1xuICAgICAgICBjb25zdCBhY3Rpb25zID0gdGhpcy5jb250ZXh0LmdldFB1c2hBY3Rpb25zRm9yRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50LnJlcGxhY2luZ0V2ZW50KCkgfHwgdGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgaWYgKCFhY3Rpb25zIHx8ICFhY3Rpb25zLnR3ZWFrcykgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgICAgICAvLyBkb24ndCBzaG93IHNlbGYtaGlnaGxpZ2h0cyBmcm9tIGFub3RoZXIgb2Ygb3VyIGNsaWVudHNcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5nZXRTZW5kZXIoKSA9PT0gdGhpcy5jb250ZXh0LmNyZWRlbnRpYWxzLnVzZXJJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFjdGlvbnMudHdlYWtzLmhpZ2hsaWdodDtcbiAgICB9XG5cbiAgICB0b2dnbGVBbGxSZWFkQXZhdGFycyA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhbGxSZWFkQXZhdGFyczogIXRoaXMuc3RhdGUuYWxsUmVhZEF2YXRhcnMsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBnZXRSZWFkQXZhdGFycygpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2hvd1NlbnRSZWNlaXB0IHx8IHRoaXMuc2hvdWxkU2hvd1NlbmRpbmdSZWNlaXB0KSB7XG4gICAgICAgICAgICByZXR1cm4gPFNlbnRSZWNlaXB0IG1lc3NhZ2VTdGF0ZT17dGhpcy5wcm9wcy5teEV2ZW50LmdldEFzc29jaWF0ZWRTdGF0dXMoKX0gLz47XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXR1cm4gZWFybHkgaWYgdGhlcmUgYXJlIG5vIHJlYWQgcmVjZWlwdHNcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJlYWRSZWNlaXB0cyB8fCB0aGlzLnByb3BzLnJlYWRSZWNlaXB0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAoPHNwYW4gY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3JlYWRBdmF0YXJzXCIgLz4pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgUmVhZFJlY2VpcHRNYXJrZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5SZWFkUmVjZWlwdE1hcmtlcicpO1xuICAgICAgICBjb25zdCBhdmF0YXJzID0gW107XG4gICAgICAgIGNvbnN0IHJlY2VpcHRPZmZzZXQgPSAxNTtcbiAgICAgICAgbGV0IGxlZnQgPSAwO1xuXG4gICAgICAgIGNvbnN0IHJlY2VpcHRzID0gdGhpcy5wcm9wcy5yZWFkUmVjZWlwdHMgfHwgW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjZWlwdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlY2VpcHQgPSByZWNlaXB0c1tpXTtcblxuICAgICAgICAgICAgbGV0IGhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICBpZiAoKGkgPCBNQVhfUkVBRF9BVkFUQVJTKSB8fCB0aGlzLnN0YXRlLmFsbFJlYWRBdmF0YXJzKSB7XG4gICAgICAgICAgICAgICAgaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUT0RPOiB3ZSBrZWVwIHRoZSBleHRyYSByZWFkIGF2YXRhcnMgaW4gdGhlIGRvbSB0byBtYWtlIGFuaW1hdGlvbiBzaW1wbGVyXG4gICAgICAgICAgICAvLyB3ZSBjb3VsZCBvcHRpbWlzZSB0aGlzIHRvIHJlZHVjZSB0aGUgZG9tIHNpemUuXG5cbiAgICAgICAgICAgIC8vIElmIGhpZGRlbiwgc2V0IG9mZnNldCBlcXVhbCB0byB0aGUgb2Zmc2V0IG9mIHRoZSBmaW5hbCB2aXNpYmxlIGF2YXRhciBvclxuICAgICAgICAgICAgLy8gZWxzZSBzZXQgaXQgcHJvcG9ydGlvbmFsIHRvIGluZGV4XG4gICAgICAgICAgICBsZWZ0ID0gKGhpZGRlbiA/IE1BWF9SRUFEX0FWQVRBUlMgLSAxIDogaSkgKiAtcmVjZWlwdE9mZnNldDtcblxuICAgICAgICAgICAgY29uc3QgdXNlcklkID0gcmVjZWlwdC51c2VySWQ7XG4gICAgICAgICAgICBsZXQgcmVhZFJlY2VpcHRJbmZvO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWFkUmVjZWlwdE1hcCkge1xuICAgICAgICAgICAgICAgIHJlYWRSZWNlaXB0SW5mbyA9IHRoaXMucHJvcHMucmVhZFJlY2VpcHRNYXBbdXNlcklkXTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlYWRSZWNlaXB0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICByZWFkUmVjZWlwdEluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZWFkUmVjZWlwdE1hcFt1c2VySWRdID0gcmVhZFJlY2VpcHRJbmZvO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWRkIHRvIHRoZSBzdGFydCBzbyB0aGUgbW9zdCByZWNlbnQgaXMgb24gdGhlIGVuZCAoaWUuIGVuZHMgdXAgcmlnaHRtb3N0KVxuICAgICAgICAgICAgYXZhdGFycy51bnNoaWZ0KFxuICAgICAgICAgICAgICAgIDxSZWFkUmVjZWlwdE1hcmtlciBrZXk9e3VzZXJJZH0gbWVtYmVyPXtyZWNlaXB0LnJvb21NZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrVXNlcklkPXt1c2VySWR9XG4gICAgICAgICAgICAgICAgICAgIGxlZnRPZmZzZXQ9e2xlZnR9IGhpZGRlbj17aGlkZGVufVxuICAgICAgICAgICAgICAgICAgICByZWFkUmVjZWlwdEluZm89e3JlYWRSZWNlaXB0SW5mb31cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tVbm1vdW50aW5nPXt0aGlzLnByb3BzLmNoZWNrVW5tb3VudGluZ31cbiAgICAgICAgICAgICAgICAgICAgc3VwcHJlc3NBbmltYXRpb249e3RoaXMuc3VwcHJlc3NSZWFkUmVjZWlwdEFuaW1hdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy50b2dnbGVBbGxSZWFkQXZhdGFyc31cbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wPXtyZWNlaXB0LnRzfVxuICAgICAgICAgICAgICAgICAgICBzaG93VHdlbHZlSG91cj17dGhpcy5wcm9wcy5pc1R3ZWx2ZUhvdXJ9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZW1UZXh0O1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYWxsUmVhZEF2YXRhcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IHJlY2VpcHRzLmxlbmd0aCAtIE1BWF9SRUFEX0FWQVRBUlM7XG4gICAgICAgICAgICBpZiAocmVtYWluZGVyID4gMCkge1xuICAgICAgICAgICAgICAgIHJlbVRleHQgPSA8c3BhbiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfcmVhZEF2YXRhclJlbWFpbmRlclwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlQWxsUmVhZEF2YXRhcnN9XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHJpZ2h0OiBcImNhbGMoXCIgKyB0b1JlbSgtbGVmdCkgKyBcIiArIFwiICsgcmVjZWlwdE9mZnNldCArIFwicHgpXCIgfX0+eyByZW1haW5kZXIgfStcbiAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9yZWFkQXZhdGFyc1wiPlxuICAgICAgICAgICAgeyByZW1UZXh0IH1cbiAgICAgICAgICAgIHsgYXZhdGFycyB9XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxuXG4gICAgb25TZW5kZXJQcm9maWxlQ2xpY2sgPSBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IG14RXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdpbnNlcnRfbWVudGlvbicsXG4gICAgICAgICAgICB1c2VyX2lkOiBteEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25SZXF1ZXN0S2V5c0NsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIC8vIEluZGljYXRlIGluIHRoZSBVSSB0aGF0IHRoZSBrZXlzIGhhdmUgYmVlbiByZXF1ZXN0ZWQgKHRoaXMgaXMgZXhwZWN0ZWQgdG9cbiAgICAgICAgICAgIC8vIGJlIHJlc2V0IGlmIHRoZSBjb21wb25lbnQgaXMgbW91bnRlZCBpbiB0aGUgZnV0dXJlKS5cbiAgICAgICAgICAgIHByZXZpb3VzbHlSZXF1ZXN0ZWRLZXlzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYW5jZWwgYW55IG91dGdvaW5nIGtleSByZXF1ZXN0IGZvciB0aGlzIGV2ZW50IGFuZCByZXNlbmQgaXQuIElmIGEgcmVzcG9uc2VcbiAgICAgICAgLy8gaXMgcmVjZWl2ZWQgZm9yIHRoZSByZXF1ZXN0IHdpdGggdGhlIHJlcXVpcmVkIGtleXMsIHRoZSBldmVudCBjb3VsZCBiZVxuICAgICAgICAvLyBkZWNyeXB0ZWQgc3VjY2Vzc2Z1bGx5LlxuICAgICAgICB0aGlzLmNvbnRleHQuY2FuY2VsQW5kUmVzZW5kRXZlbnRSb29tS2V5UmVxdWVzdCh0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgIH07XG5cbiAgICBvblBlcm1hbGlua0NsaWNrZWQgPSBlID0+IHtcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgdGhlIHBlcm1hbGluayB0byBiZSBvcGVuZWQgaW4gYSBuZXcgdGFiL3dpbmRvdyBvciBjb3BpZWQgYXNcbiAgICAgICAgLy8gbWF0cml4LnRvLCBidXQgYWxzbyBmb3IgaXQgdG8gZW5hYmxlIHJvdXRpbmcgd2l0aGluIEVsZW1lbnQgd2hlbiBjbGlja2VkLlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgZXZlbnRfaWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRydWUsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckUyRVBhZGxvY2soKSB7XG4gICAgICAgIGNvbnN0IGV2ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuXG4gICAgICAgIC8vIGV2ZW50IGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWRcbiAgICAgICAgaWYgKGV2LmdldENvbnRlbnQoKS5tc2d0eXBlID09PSAnbS5iYWQuZW5jcnlwdGVkJykge1xuICAgICAgICAgICAgcmV0dXJuIDxFMmVQYWRsb2NrVW5kZWNyeXB0YWJsZSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGV2ZW50IGlzIGVuY3J5cHRlZCwgZGlzcGxheSBwYWRsb2NrIGNvcnJlc3BvbmRpbmcgdG8gd2hldGhlciBvciBub3QgaXQgaXMgdmVyaWZpZWRcbiAgICAgICAgaWYgKGV2LmlzRW5jcnlwdGVkKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVfU1RBVEUuTk9STUFMKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBubyBpY29uIGlmIHdlJ3ZlIG5vdCBldmVuIGNyb3NzLXNpZ25lZCB0aGUgdXNlclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVfU1RBVEUuVkVSSUZJRUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIG5vIGljb24gZm9yIHZlcmlmaWVkXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUudmVyaWZpZWQgPT09IEUyRV9TVEFURS5VTkFVVEhFTlRJQ0FURUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDxFMmVQYWRsb2NrVW5hdXRoZW50aWNhdGVkIC8+KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52ZXJpZmllZCA9PT0gRTJFX1NUQVRFLlVOS05PV04pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDxFMmVQYWRsb2NrVW5rbm93biAvPik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAoPEUyZVBhZGxvY2tVbnZlcmlmaWVkIC8+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQuaXNSb29tRW5jcnlwdGVkKGV2LmdldFJvb21JZCgpKSkge1xuICAgICAgICAgICAgLy8gZWxzZSBpZiByb29tIGlzIGVuY3J5cHRlZFxuICAgICAgICAgICAgLy8gYW5kIGV2ZW50IGlzIGJlaW5nIGVuY3J5cHRlZCBvciBpcyBub3Rfc2VudCAoVW5rbm93biBEZXZpY2VzL05ldHdvcmsgRXJyb3IpXG4gICAgICAgICAgICBpZiAoZXYuc3RhdHVzID09PSBFdmVudFN0YXR1cy5FTkNSWVBUSU5HKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LnN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuTk9UX1NFTlQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYuaXNTdGF0ZSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyB3ZSBleHBlY3QgdGhpcyB0byBiZSB1bmVuY3J5cHRlZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgdGhlIGV2ZW50IGlzIG5vdCBlbmNyeXB0ZWQsIGJ1dCBpdCdzIGFuIGUyZSByb29tLCBzaG93IHRoZSBvcGVuIHBhZGxvY2tcbiAgICAgICAgICAgIHJldHVybiA8RTJlUGFkbG9ja1VuZW5jcnlwdGVkIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm8gcGFkbG9jayBuZWVkZWRcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgb25BY3Rpb25CYXJGb2N1c0NoYW5nZSA9IGZvY3VzZWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGFjdGlvbkJhckZvY3VzZWQ6IGZvY3VzZWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBnZXRUaWxlID0gKCkgPT4gdGhpcy50aWxlLmN1cnJlbnQ7XG5cbiAgICBnZXRSZXBseVRocmVhZCA9ICgpID0+IHRoaXMucmVwbHlUaHJlYWQuY3VycmVudDtcblxuICAgIGdldFJlYWN0aW9ucyA9ICgpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXRoaXMucHJvcHMuc2hvd1JlYWN0aW9ucyB8fFxuICAgICAgICAgICAgIXRoaXMucHJvcHMuZ2V0UmVsYXRpb25zRm9yRXZlbnRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBldmVudElkID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCk7XG4gICAgICAgIGlmICghZXZlbnRJZCkge1xuICAgICAgICAgICAgLy8gWFhYOiBUZW1wb3JhcnkgZGlhZ25vc3RpYyBsb2dnaW5nIGZvciBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMTEyMFxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkV2ZW50VGlsZSBhdHRlbXB0ZWQgdG8gZ2V0IHJlbGF0aW9ucyBmb3IgYW4gZXZlbnQgd2l0aG91dCBhbiBJRFwiKTtcbiAgICAgICAgICAgIC8vIFVzZSBldmVudCdzIHNwZWNpYWwgYHRvSlNPTmAgbWV0aG9kIHRvIGxvZyBrZXkgZGF0YS5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMubXhFdmVudCwgbnVsbCwgNCkpO1xuICAgICAgICAgICAgY29uc29sZS50cmFjZShcIlN0YWNrdHJhY2UgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzExMTIwXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmdldFJlbGF0aW9uc0ZvckV2ZW50KGV2ZW50SWQsIFwibS5hbm5vdGF0aW9uXCIsIFwibS5yZWFjdGlvblwiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlYWN0aW9uc0NyZWF0ZWQgPSAocmVsYXRpb25UeXBlLCBldmVudFR5cGUpID0+IHtcbiAgICAgICAgaWYgKHJlbGF0aW9uVHlwZSAhPT0gXCJtLmFubm90YXRpb25cIiB8fCBldmVudFR5cGUgIT09IFwibS5yZWFjdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LnJlbW92ZUxpc3RlbmVyKFwiRXZlbnQucmVsYXRpb25zQ3JlYXRlZFwiLCB0aGlzLm9uUmVhY3Rpb25zQ3JlYXRlZCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcmVhY3Rpb25zOiB0aGlzLmdldFJlYWN0aW9ucygpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBNZXNzYWdlVGltZXN0YW1wID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuTWVzc2FnZVRpbWVzdGFtcCcpO1xuICAgICAgICBjb25zdCBTZW5kZXJQcm9maWxlID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuU2VuZGVyUHJvZmlsZScpO1xuICAgICAgICBjb25zdCBNZW1iZXJBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdhdmF0YXJzLk1lbWJlckF2YXRhcicpO1xuXG4gICAgICAgIC8vY29uc29sZS5pbmZvKFwiRXZlbnRUaWxlIHNob3dVcmxQcmV2aWV3IGZvciAlcyBpcyAlc1wiLCB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSwgdGhpcy5wcm9wcy5zaG93VXJsUHJldmlldyk7XG5cbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGNvbnN0IG1zZ3R5cGUgPSBjb250ZW50Lm1zZ3R5cGU7XG4gICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRUeXBlKCk7XG5cbiAgICAgICAgbGV0IHRpbGVIYW5kbGVyID0gZ2V0SGFuZGxlclRpbGUodGhpcy5wcm9wcy5teEV2ZW50KTtcblxuICAgICAgICAvLyBJbmZvIG1lc3NhZ2VzIGFyZSBiYXNpY2FsbHkgaW5mb3JtYXRpb24gYWJvdXQgY29tbWFuZHMgcHJvY2Vzc2VkIG9uIGEgcm9vbVxuICAgICAgICBjb25zdCBpc0J1YmJsZU1lc3NhZ2UgPSBldmVudFR5cGUuc3RhcnRzV2l0aChcIm0ua2V5LnZlcmlmaWNhdGlvblwiKSB8fFxuICAgICAgICAgICAgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlJvb21NZXNzYWdlICYmIG1zZ3R5cGUgJiYgbXNndHlwZS5zdGFydHNXaXRoKFwibS5rZXkudmVyaWZpY2F0aW9uXCIpKSB8fFxuICAgICAgICAgICAgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlJvb21DcmVhdGUpIHx8XG4gICAgICAgICAgICAoZXZlbnRUeXBlID09PSBFdmVudFR5cGUuUm9vbUVuY3J5cHRpb24pIHx8XG4gICAgICAgICAgICAodGlsZUhhbmRsZXIgPT09IFwibWVzc2FnZXMuTUppdHNpV2lkZ2V0RXZlbnRcIik7XG4gICAgICAgIGxldCBpc0luZm9NZXNzYWdlID0gKFxuICAgICAgICAgICAgIWlzQnViYmxlTWVzc2FnZSAmJiBldmVudFR5cGUgIT09IEV2ZW50VHlwZS5Sb29tTWVzc2FnZSAmJlxuICAgICAgICAgICAgZXZlbnRUeXBlICE9PSBFdmVudFR5cGUuU3RpY2tlciAmJiBldmVudFR5cGUgIT09IEV2ZW50VHlwZS5Sb29tQ3JlYXRlXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gSWYgd2UncmUgc2hvd2luZyBoaWRkZW4gZXZlbnRzIGluIHRoZSB0aW1lbGluZSwgd2Ugc2hvdWxkIHVzZSB0aGVcbiAgICAgICAgLy8gc291cmNlIHRpbGUgd2hlbiB0aGVyZSdzIG5vIHJlZ3VsYXIgdGlsZSBmb3IgYW4gZXZlbnQgYW5kIGFsc28gZm9yXG4gICAgICAgIC8vIHJlcGxhY2UgcmVsYXRpb25zICh3aGljaCBvdGhlcndpc2Ugd291bGQgZGlzcGxheSBhcyBhIGNvbmZ1c2luZ1xuICAgICAgICAvLyBkdXBsaWNhdGUgb2YgdGhlIHRoaW5nIHRoZXkgYXJlIHJlcGxhY2luZykuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0hpZGRlbkV2ZW50c0luVGltZWxpbmVcIikgJiYgIWhhdmVUaWxlRm9yRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50KSkge1xuICAgICAgICAgICAgdGlsZUhhbmRsZXIgPSBcIm1lc3NhZ2VzLlZpZXdTb3VyY2VFdmVudFwiO1xuICAgICAgICAgICAgLy8gUmV1c2UgaW5mbyBtZXNzYWdlIGF2YXRhciBhbmQgc2VuZGVyIHByb2ZpbGUgc3R5bGluZ1xuICAgICAgICAgICAgaXNJbmZvTWVzc2FnZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGhpcyBzaG91bGRuJ3QgaGFwcGVuOiB0aGUgY2FsbGVyIHNob3VsZCBjaGVjayB3ZSBzdXBwb3J0IHRoaXMgdHlwZVxuICAgICAgICAvLyBiZWZvcmUgdHJ5aW5nIHRvIGluc3RhbnRpYXRlIHVzXG4gICAgICAgIGlmICghdGlsZUhhbmRsZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHtteEV2ZW50fSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEV2ZW50IHR5cGUgbm90IHN1cHBvcnRlZDogdHlwZToke214RXZlbnQuZ2V0VHlwZSgpfSBpc1N0YXRlOiR7bXhFdmVudC5pc1N0YXRlKCl9YCk7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGUgbXhfRXZlbnRUaWxlX2luZm8gbXhfTU5vdGljZUJvZHlcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ1RoaXMgZXZlbnQgY291bGQgbm90IGJlIGRpc3BsYXllZCcpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBFdmVudFRpbGVUeXBlID0gc2RrLmdldENvbXBvbmVudCh0aWxlSGFuZGxlcik7XG5cbiAgICAgICAgY29uc3QgaXNTZW5kaW5nID0gKFsnc2VuZGluZycsICdxdWV1ZWQnLCAnZW5jcnlwdGluZyddLmluZGV4T2YodGhpcy5wcm9wcy5ldmVudFNlbmRTdGF0dXMpICE9PSAtMSk7XG4gICAgICAgIGNvbnN0IGlzUmVkYWN0ZWQgPSBpc01lc3NhZ2VFdmVudCh0aGlzLnByb3BzLm14RXZlbnQpICYmIHRoaXMucHJvcHMuaXNSZWRhY3RlZDtcbiAgICAgICAgY29uc3QgaXNFbmNyeXB0aW9uRmFpbHVyZSA9IHRoaXMucHJvcHMubXhFdmVudC5pc0RlY3J5cHRpb25GYWlsdXJlKCk7XG5cbiAgICAgICAgY29uc3QgaXNFZGl0aW5nID0gISF0aGlzLnByb3BzLmVkaXRTdGF0ZTtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2J1YmJsZUNvbnRhaW5lcjogaXNCdWJibGVNZXNzYWdlLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlOiB0cnVlLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2lzRWRpdGluZzogaXNFZGl0aW5nLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2luZm86IGlzSW5mb01lc3NhZ2UsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfMTJocjogdGhpcy5wcm9wcy5pc1R3ZWx2ZUhvdXIsXG4gICAgICAgICAgICAvLyBOb3RlOiB3ZSBrZWVwIHRoZSBgc2VuZGluZ2Agc3RhdGUgY2xhc3MgZm9yIHRlc3RzLCBub3QgZm9yIG91ciBzdHlsZXNcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9zZW5kaW5nOiAhaXNFZGl0aW5nICYmIGlzU2VuZGluZyxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9oaWdobGlnaHQ6IHRoaXMucHJvcHMudGlsZVNoYXBlID09PSAnbm90aWYnID8gZmFsc2UgOiB0aGlzLnNob3VsZEhpZ2hsaWdodCgpLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX3NlbGVjdGVkOiB0aGlzLnByb3BzLmlzU2VsZWN0ZWRFdmVudCxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9jb250aW51YXRpb246IHRoaXMucHJvcHMudGlsZVNoYXBlID8gJycgOiB0aGlzLnByb3BzLmNvbnRpbnVhdGlvbixcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9sYXN0OiB0aGlzLnByb3BzLmxhc3QsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfbGFzdEluU2VjdGlvbjogdGhpcy5wcm9wcy5sYXN0SW5TZWN0aW9uLFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX2NvbnRleHR1YWw6IHRoaXMucHJvcHMuY29udGV4dHVhbCxcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9hY3Rpb25CYXJGb2N1c2VkOiB0aGlzLnN0YXRlLmFjdGlvbkJhckZvY3VzZWQsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfdmVyaWZpZWQ6ICFpc0J1YmJsZU1lc3NhZ2UgJiYgdGhpcy5zdGF0ZS52ZXJpZmllZCA9PT0gRTJFX1NUQVRFLlZFUklGSUVELFxuICAgICAgICAgICAgbXhfRXZlbnRUaWxlX3VudmVyaWZpZWQ6ICFpc0J1YmJsZU1lc3NhZ2UgJiYgdGhpcy5zdGF0ZS52ZXJpZmllZCA9PT0gRTJFX1NUQVRFLldBUk5JTkcsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfdW5rbm93bjogIWlzQnViYmxlTWVzc2FnZSAmJiB0aGlzLnN0YXRlLnZlcmlmaWVkID09PSBFMkVfU1RBVEUuVU5LTk9XTixcbiAgICAgICAgICAgIG14X0V2ZW50VGlsZV9iYWQ6IGlzRW5jcnlwdGlvbkZhaWx1cmUsXG4gICAgICAgICAgICBteF9FdmVudFRpbGVfZW1vdGU6IG1zZ3R5cGUgPT09ICdtLmVtb3RlJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHRpbGUgaXMgaW4gdGhlIFNlbmRpbmcgc3RhdGUsIGRvbid0IHNwZWFrIHRoZSBtZXNzYWdlLlxuICAgICAgICBjb25zdCBhcmlhTGl2ZSA9ICh0aGlzLnByb3BzLmV2ZW50U2VuZFN0YXR1cyAhPT0gbnVsbCkgPyAnb2ZmJyA6IHVuZGVmaW5lZDtcblxuICAgICAgICBsZXQgcGVybWFsaW5rID0gXCIjXCI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IpIHtcbiAgICAgICAgICAgIHBlcm1hbGluayA9IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvci5mb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXZhdGFyO1xuICAgICAgICBsZXQgc2VuZGVyO1xuICAgICAgICBsZXQgYXZhdGFyU2l6ZTtcbiAgICAgICAgbGV0IG5lZWRzU2VuZGVyUHJvZmlsZTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy50aWxlU2hhcGUgPT09IFwibm90aWZcIikge1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDI0O1xuICAgICAgICAgICAgbmVlZHNTZW5kZXJQcm9maWxlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlSGFuZGxlciA9PT0gJ21lc3NhZ2VzLlJvb21DcmVhdGUnIHx8IGlzQnViYmxlTWVzc2FnZSkge1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDA7XG4gICAgICAgICAgICBuZWVkc1NlbmRlclByb2ZpbGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0luZm9NZXNzYWdlKSB7XG4gICAgICAgICAgICAvLyBhIHNtYWxsIGF2YXRhciwgd2l0aCBubyBzZW5kZXIgcHJvZmlsZSwgZm9yXG4gICAgICAgICAgICAvLyBqb2lucy9wYXJ0cy9ldGNcbiAgICAgICAgICAgIGF2YXRhclNpemUgPSAxNDtcbiAgICAgICAgICAgIG5lZWRzU2VuZGVyUHJvZmlsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMubGF5b3V0ID09IExheW91dC5JUkMpIHtcbiAgICAgICAgICAgIGF2YXRhclNpemUgPSAxNDtcbiAgICAgICAgICAgIG5lZWRzU2VuZGVyUHJvZmlsZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5jb250aW51YXRpb24gJiYgdGhpcy5wcm9wcy50aWxlU2hhcGUgIT09IFwiZmlsZV9ncmlkXCIpIHtcbiAgICAgICAgICAgIC8vIG5vIGF2YXRhciBvciBzZW5kZXIgcHJvZmlsZSBmb3IgY29udGludWF0aW9uIG1lc3NhZ2VzXG4gICAgICAgICAgICBhdmF0YXJTaXplID0gMDtcbiAgICAgICAgICAgIG5lZWRzU2VuZGVyUHJvZmlsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXZhdGFyU2l6ZSA9IDMwO1xuICAgICAgICAgICAgbmVlZHNTZW5kZXJQcm9maWxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm14RXZlbnQuc2VuZGVyICYmIGF2YXRhclNpemUpIHtcbiAgICAgICAgICAgIGxldCBtZW1iZXI7XG4gICAgICAgICAgICAvLyBzZXQgbWVtYmVyIHRvIHJlY2VpdmVyICh0YXJnZXQpIGlmIGl0IGlzIGEgM1BJRCBpbnZpdGVcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgdGhlIGNvcnJlY3QgYXZhdGFyIGlzIHNob3duIGFzIHRoZSB0ZXh0IGlzXG4gICAgICAgICAgICAvLyBgJHRhcmdldCBhY2NlcHRlZCB0aGUgaW52aXRhdGlvbiBmb3IgJGVtYWlsYFxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkudGhpcmRfcGFydHlfaW52aXRlKSB7XG4gICAgICAgICAgICAgICAgbWVtYmVyID0gdGhpcy5wcm9wcy5teEV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVtYmVyID0gdGhpcy5wcm9wcy5teEV2ZW50LnNlbmRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF2YXRhciA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9hdmF0YXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPE1lbWJlckF2YXRhciBtZW1iZXI9e21lbWJlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXthdmF0YXJTaXplfSBoZWlnaHQ9e2F2YXRhclNpemV9XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3VXNlck9uQ2xpY2s9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5lZWRzU2VuZGVyUHJvZmlsZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLnRpbGVTaGFwZSB8fCB0aGlzLnByb3BzLnRpbGVTaGFwZSA9PT0gJ3JlcGx5JyB8fCB0aGlzLnByb3BzLnRpbGVTaGFwZSA9PT0gJ3JlcGx5X3ByZXZpZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VuZGVyID0gPFNlbmRlclByb2ZpbGUgb25DbGljaz17dGhpcy5vblNlbmRlclByb2ZpbGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgICAgICBlbmFibGVGbGFpcj17dGhpcy5wcm9wcy5lbmFibGVGbGFpcn1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VuZGVyID0gPFNlbmRlclByb2ZpbGUgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fSBlbmFibGVGbGFpcj17dGhpcy5wcm9wcy5lbmFibGVGbGFpcn0gLz47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBNZXNzYWdlQWN0aW9uQmFyID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuTWVzc2FnZUFjdGlvbkJhcicpO1xuICAgICAgICBjb25zdCBhY3Rpb25CYXIgPSAhaXNFZGl0aW5nID8gPE1lc3NhZ2VBY3Rpb25CYXJcbiAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgIHJlYWN0aW9ucz17dGhpcy5zdGF0ZS5yZWFjdGlvbnN9XG4gICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICBnZXRUaWxlPXt0aGlzLmdldFRpbGV9XG4gICAgICAgICAgICBnZXRSZXBseVRocmVhZD17dGhpcy5nZXRSZXBseVRocmVhZH1cbiAgICAgICAgICAgIG9uRm9jdXNDaGFuZ2U9e3RoaXMub25BY3Rpb25CYXJGb2N1c0NoYW5nZX1cbiAgICAgICAgLz4gOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkgP1xuICAgICAgICAgICAgPE1lc3NhZ2VUaW1lc3RhbXAgc2hvd1R3ZWx2ZUhvdXI9e3RoaXMucHJvcHMuaXNUd2VsdmVIb3VyfSB0cz17dGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCl9IC8+IDogbnVsbDtcblxuICAgICAgICBjb25zdCBrZXlSZXF1ZXN0SGVscFRleHQgPVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfa2V5UmVxdWVzdEluZm9fdG9vbHRpcF9jb250ZW50c1wiPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUucHJldmlvdXNseVJlcXVlc3RlZEtleXMgP1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoICdZb3VyIGtleSBzaGFyZSByZXF1ZXN0IGhhcyBiZWVuIHNlbnQgLSBwbGVhc2UgY2hlY2sgeW91ciBvdGhlciBzZXNzaW9ucyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZm9yIGtleSBzaGFyZSByZXF1ZXN0cy4nKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBfdCggJ0tleSBzaGFyZSByZXF1ZXN0cyBhcmUgc2VudCB0byB5b3VyIG90aGVyIHNlc3Npb25zIGF1dG9tYXRpY2FsbHkuIElmIHlvdSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVqZWN0ZWQgb3IgZGlzbWlzc2VkIHRoZSBrZXkgc2hhcmUgcmVxdWVzdCBvbiB5b3VyIG90aGVyIHNlc3Npb25zLCBjbGljayAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaGVyZSB0byByZXF1ZXN0IHRoZSBrZXlzIGZvciB0aGlzIHNlc3Npb24gYWdhaW4uJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCggJ0lmIHlvdXIgb3RoZXIgc2Vzc2lvbnMgZG8gbm90IGhhdmUgdGhlIGtleSBmb3IgdGhpcyBtZXNzYWdlIHlvdSB3aWxsIG5vdCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmUgYWJsZSB0byBkZWNyeXB0IHRoZW0uJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgY29uc3Qga2V5UmVxdWVzdEluZm9Db250ZW50ID0gdGhpcy5zdGF0ZS5wcmV2aW91c2x5UmVxdWVzdGVkS2V5cyA/XG4gICAgICAgICAgICBfdCgnS2V5IHJlcXVlc3Qgc2VudC4nKSA6XG4gICAgICAgICAgICBfdChcbiAgICAgICAgICAgICAgICAnPHJlcXVlc3RMaW5rPlJlLXJlcXVlc3QgZW5jcnlwdGlvbiBrZXlzPC9yZXF1ZXN0TGluaz4gZnJvbSB5b3VyIG90aGVyIHNlc3Npb25zLicsXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgeydyZXF1ZXN0TGluayc6IChzdWIpID0+IDxhIG9uQ2xpY2s9e3RoaXMub25SZXF1ZXN0S2V5c0NsaWNrfT57IHN1YiB9PC9hPn0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IFRvb2x0aXBCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5Ub29sdGlwQnV0dG9uJyk7XG4gICAgICAgIGNvbnN0IGtleVJlcXVlc3RJbmZvID0gaXNFbmNyeXB0aW9uRmFpbHVyZSAmJiAhaXNSZWRhY3RlZCA/XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9rZXlSZXF1ZXN0SW5mb1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9rZXlSZXF1ZXN0SW5mb190ZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsga2V5UmVxdWVzdEluZm9Db250ZW50IH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPFRvb2x0aXBCdXR0b24gaGVscFRleHQ9e2tleVJlcXVlc3RIZWxwVGV4dH0gLz5cbiAgICAgICAgICAgIDwvZGl2PiA6IG51bGw7XG5cbiAgICAgICAgbGV0IHJlYWN0aW9uc1JvdztcbiAgICAgICAgaWYgKCFpc1JlZGFjdGVkKSB7XG4gICAgICAgICAgICBjb25zdCBSZWFjdGlvbnNSb3cgPSBzZGsuZ2V0Q29tcG9uZW50KCdtZXNzYWdlcy5SZWFjdGlvbnNSb3cnKTtcbiAgICAgICAgICAgIHJlYWN0aW9uc1JvdyA9IDxSZWFjdGlvbnNSb3dcbiAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgcmVhY3Rpb25zPXt0aGlzLnN0YXRlLnJlYWN0aW9uc31cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGlua2VkVGltZXN0YW1wID0gPGFcbiAgICAgICAgICAgIGhyZWY9e3Blcm1hbGlua31cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25QZXJtYWxpbmtDbGlja2VkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17Zm9ybWF0VGltZShuZXcgRGF0ZSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0VHMoKSksIHRoaXMucHJvcHMuaXNUd2VsdmVIb3VyKX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyB0aW1lc3RhbXAgfVxuICAgICAgICA8L2E+O1xuXG4gICAgICAgIGNvbnN0IHVzZUlSQ0xheW91dCA9IHRoaXMucHJvcHMubGF5b3V0ID09IExheW91dC5JUkM7XG4gICAgICAgIGNvbnN0IGdyb3VwVGltZXN0YW1wID0gIXVzZUlSQ0xheW91dCA/IGxpbmtlZFRpbWVzdGFtcCA6IG51bGw7XG4gICAgICAgIGNvbnN0IGlyY1RpbWVzdGFtcCA9IHVzZUlSQ0xheW91dCA/IGxpbmtlZFRpbWVzdGFtcCA6IG51bGw7XG4gICAgICAgIGNvbnN0IGdyb3VwUGFkbG9jayA9ICF1c2VJUkNMYXlvdXQgJiYgIWlzQnViYmxlTWVzc2FnZSAmJiB0aGlzLnJlbmRlckUyRVBhZGxvY2soKTtcbiAgICAgICAgY29uc3QgaXJjUGFkbG9jayA9IHVzZUlSQ0xheW91dCAmJiAhaXNCdWJibGVNZXNzYWdlICYmIHRoaXMucmVuZGVyRTJFUGFkbG9jaygpO1xuXG4gICAgICAgIGxldCBtc2dPcHRpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dSZWFkUmVjZWlwdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlYWRBdmF0YXJzID0gdGhpcy5nZXRSZWFkQXZhdGFycygpO1xuICAgICAgICAgICAgbXNnT3B0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX21zZ09wdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICB7IHJlYWRBdmF0YXJzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKHRoaXMucHJvcHMudGlsZVNoYXBlKSB7XG4gICAgICAgICAgICBjYXNlICdub3RpZic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5jb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gYXJpYS1saXZlPXthcmlhTGl2ZX0gYXJpYS1hdG9taWM9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9yb29tTmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e3Jvb219IHdpZHRoPXsyOH0gaGVpZ2h0PXsyOH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXtwZXJtYWxpbmt9IG9uQ2xpY2s9e3RoaXMub25QZXJtYWxpbmtDbGlja2VkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByb29tID8gcm9vbS5uYW1lIDogJycgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfc2VuZGVyRGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXtwZXJtYWxpbmt9IG9uQ2xpY2s9e3RoaXMub25QZXJtYWxpbmtDbGlja2VkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzZW5kZXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEV2ZW50VGlsZVR5cGUgcmVmPXt0aGlzLnRpbGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cz17dGhpcy5wcm9wcy5oaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRMaW5rPXt0aGlzLnByb3BzLmhpZ2hsaWdodExpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXt0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e3RoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2ZpbGVfZ3JpZCc6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gYXJpYS1saXZlPXthcmlhTGl2ZX0gYXJpYS1hdG9taWM9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEV2ZW50VGlsZVR5cGUgcmVmPXt0aGlzLnRpbGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cz17dGhpcy5wcm9wcy5oaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRMaW5rPXt0aGlzLnByb3BzLmhpZ2hsaWdodExpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXt0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWxlU2hhcGU9e3RoaXMucHJvcHMudGlsZVNoYXBlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e3RoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX3NlbmRlckRldGFpbHNMaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtwZXJtYWxpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblBlcm1hbGlua0NsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfc2VuZGVyRGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGltZXN0YW1wIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSAncmVwbHknOlxuICAgICAgICAgICAgY2FzZSAncmVwbHlfcHJldmlldyc6IHtcbiAgICAgICAgICAgICAgICBsZXQgdGhyZWFkO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnRpbGVTaGFwZSA9PT0gJ3JlcGx5X3ByZXZpZXcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocmVhZCA9IFJlcGx5VGhyZWFkLm1ha2VUaHJlYWQoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVwbHlUaHJlYWQsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSBhcmlhLWxpdmU9e2FyaWFMaXZlfSBhcmlhLWF0b21pYz1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaXJjVGltZXN0YW1wIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc2VuZGVyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaXJjUGFkbG9jayB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9yZXBseVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBUaW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBQYWRsb2NrIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRocmVhZCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEV2ZW50VGlsZVR5cGUgcmVmPXt0aGlzLnRpbGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cz17dGhpcy5wcm9wcy5oaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRMaW5rPXt0aGlzLnByb3BzLmhpZ2hsaWdodExpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2luZ0V2ZW50SWQ9e3RoaXMucHJvcHMucmVwbGFjaW5nRXZlbnRJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXc9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aHJlYWQgPSBSZXBseVRocmVhZC5tYWtlVGhyZWFkKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVwbHlUaHJlYWQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubGF5b3V0LFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyB0YWItaW5kZXg9LTEgdG8gYWxsb3cgaXQgdG8gYmUgZm9jdXNhYmxlIGJ1dCBkbyBub3QgYWRkIHRhYiBzdG9wIGZvciBpdCwgcHJpbWFyaWx5IGZvciBzY3JlZW4gcmVhZGVyc1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSB0YWJJbmRleD17LTF9IGFyaWEtbGl2ZT17YXJpYUxpdmV9IGFyaWEtYXRvbWljPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBpcmNUaW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzZW5kZXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBpcmNQYWRsb2NrIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2xpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGdyb3VwVGltZXN0YW1wIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGdyb3VwUGFkbG9jayB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aHJlYWQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxFdmVudFRpbGVUeXBlIHJlZj17dGhpcy50aWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXt0aGlzLnByb3BzLm14RXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2luZ0V2ZW50SWQ9e3RoaXMucHJvcHMucmVwbGFjaW5nRXZlbnRJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdFN0YXRlPXt0aGlzLnByb3BzLmVkaXRTdGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0cz17dGhpcy5wcm9wcy5oaWdobGlnaHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRMaW5rPXt0aGlzLnByb3BzLmhpZ2hsaWdodExpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dVcmxQcmV2aWV3PXt0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGtleVJlcXVlc3RJbmZvIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlYWN0aW9uc1JvdyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBhY3Rpb25CYXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bXNnT3B0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBhdmF0YXIgZ29lcyBhZnRlciB0aGUgZXZlbnQgdGlsZSBhcyBpdCdzIGFic29sdXRlbHkgcG9zaXRpb25lZCB0byBiZSBvdmVyIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV2ZW50IHRpbGUgbGluZSwgc28gbmVlZHMgdG8gYmUgbGF0ZXIgaW4gdGhlIERPTSBzbyBpdCBhcHBlYXJzIG9uIHRvcCAodGhpcyBhdm9pZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgbmVlZCBmb3IgZnVydGhlciB6LWluZGV4aW5nIGNoYW9zKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBYWFggdGhpcydsbCBldmVudHVhbGx5IGJlIGR5bmFtaWMgYmFzZWQgb24gdGhlIGZpZWxkcyBvbmNlIHdlIGhhdmUgZXh0ZW5zaWJsZSBldmVudCB0eXBlc1xuY29uc3QgbWVzc2FnZVR5cGVzID0gWydtLnJvb20ubWVzc2FnZScsICdtLnN0aWNrZXInXTtcbmZ1bmN0aW9uIGlzTWVzc2FnZUV2ZW50KGV2KSB7XG4gICAgcmV0dXJuIChtZXNzYWdlVHlwZXMuaW5jbHVkZXMoZXYuZ2V0VHlwZSgpKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXZlVGlsZUZvckV2ZW50KGUpIHtcbiAgICAvLyBPbmx5IG1lc3NhZ2VzIGhhdmUgYSB0aWxlIChibGFjay1yZWN0YW5nbGUpIGlmIHJlZGFjdGVkXG4gICAgaWYgKGUuaXNSZWRhY3RlZCgpICYmICFpc01lc3NhZ2VFdmVudChlKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gTm8gdGlsZSBmb3IgcmVwbGFjZW1lbnQgZXZlbnRzIHNpbmNlIHRoZXkgdXBkYXRlIHRoZSBvcmlnaW5hbCB0aWxlXG4gICAgaWYgKGUuaXNSZWxhdGlvbihcIm0ucmVwbGFjZVwiKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IGdldEhhbmRsZXJUaWxlKGUpO1xuICAgIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoaGFuZGxlciA9PT0gJ21lc3NhZ2VzLlRleHR1YWxFdmVudCcpIHtcbiAgICAgICAgcmV0dXJuIFRleHRGb3JFdmVudC50ZXh0Rm9yRXZlbnQoZSkgIT09ICcnO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PT0gJ21lc3NhZ2VzLlJvb21DcmVhdGUnKSB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKGUuZ2V0Q29udGVudCgpWydwcmVkZWNlc3NvciddKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIEUyZVBhZGxvY2tVbmRlY3J5cHRhYmxlKHByb3BzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEUyZVBhZGxvY2sgdGl0bGU9e190KFwiVGhpcyBtZXNzYWdlIGNhbm5vdCBiZSBkZWNyeXB0ZWRcIil9IGljb249XCJ1bmRlY3J5cHRhYmxlXCIgey4uLnByb3BzfSAvPlxuICAgICk7XG59XG5cbmZ1bmN0aW9uIEUyZVBhZGxvY2tVbnZlcmlmaWVkKHByb3BzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEUyZVBhZGxvY2sgdGl0bGU9e190KFwiRW5jcnlwdGVkIGJ5IGFuIHVudmVyaWZpZWQgc2Vzc2lvblwiKX0gaWNvbj1cInVudmVyaWZpZWRcIiB7Li4ucHJvcHN9IC8+XG4gICAgKTtcbn1cblxuZnVuY3Rpb24gRTJlUGFkbG9ja1VuZW5jcnlwdGVkKHByb3BzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEUyZVBhZGxvY2sgdGl0bGU9e190KFwiVW5lbmNyeXB0ZWRcIil9IGljb249XCJ1bmVuY3J5cHRlZFwiIHsuLi5wcm9wc30gLz5cbiAgICApO1xufVxuXG5mdW5jdGlvbiBFMmVQYWRsb2NrVW5rbm93bihwcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxFMmVQYWRsb2NrIHRpdGxlPXtfdChcIkVuY3J5cHRlZCBieSBhIGRlbGV0ZWQgc2Vzc2lvblwiKX0gaWNvbj1cInVua25vd25cIiB7Li4ucHJvcHN9IC8+XG4gICAgKTtcbn1cblxuZnVuY3Rpb24gRTJlUGFkbG9ja1VuYXV0aGVudGljYXRlZChwcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxFMmVQYWRsb2NrXG4gICAgICAgICAgICB0aXRsZT17X3QoXCJUaGUgYXV0aGVudGljaXR5IG9mIHRoaXMgZW5jcnlwdGVkIG1lc3NhZ2UgY2FuJ3QgYmUgZ3VhcmFudGVlZCBvbiB0aGlzIGRldmljZS5cIil9XG4gICAgICAgICAgICBpY29uPVwidW5hdXRoZW50aWNhdGVkXCJcbiAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgLz5cbiAgICApO1xufVxuXG5pbnRlcmZhY2UgSUUyZVBhZGxvY2tQcm9wcyB7XG4gICAgaWNvbjogc3RyaW5nO1xuICAgIHRpdGxlOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJRTJlUGFkbG9ja1N0YXRlIHtcbiAgICBob3ZlcjogYm9vbGVhbjtcbn1cblxuY2xhc3MgRTJlUGFkbG9jayBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJRTJlUGFkbG9ja1Byb3BzLCBJRTJlUGFkbG9ja1N0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25Ib3ZlclN0YXJ0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtob3ZlcjogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICBvbkhvdmVyRW5kID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtob3ZlcjogZmFsc2V9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdG9vbHRpcCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmhvdmVyKSB7XG4gICAgICAgICAgICB0b29sdGlwID0gPFRvb2x0aXAgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2UyZUljb25fdG9vbHRpcFwiIGxhYmVsPXt0aGlzLnByb3BzLnRpdGxlfSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBgbXhfRXZlbnRUaWxlX2UyZUljb24gbXhfRXZlbnRUaWxlX2UyZUljb25fJHt0aGlzLnByb3BzLmljb259YDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXt0aGlzLm9uSG92ZXJTdGFydH1cbiAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMub25Ib3ZlckVuZH1cbiAgICAgICAgICAgID57dG9vbHRpcH08L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJU2VudFJlY2VpcHRQcm9wcyB7XG4gICAgbWVzc2FnZVN0YXRlOiBzdHJpbmc7IC8vIFRPRE86IFR5cGVzIGZvciBtZXNzYWdlIHNlbmRpbmcgc3RhdGVcbn1cblxuaW50ZXJmYWNlIElTZW50UmVjZWlwdFN0YXRlIHtcbiAgICBob3ZlcjogYm9vbGVhbjtcbn1cblxuY2xhc3MgU2VudFJlY2VpcHQgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElTZW50UmVjZWlwdFByb3BzLCBJU2VudFJlY2VpcHRTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaG92ZXI6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uSG92ZXJTdGFydCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aG92ZXI6IHRydWV9KTtcbiAgICB9O1xuXG4gICAgb25Ib3ZlckVuZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aG92ZXI6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgaXNTZW50ID0gIXRoaXMucHJvcHMubWVzc2FnZVN0YXRlIHx8IHRoaXMucHJvcHMubWVzc2FnZVN0YXRlID09PSAnc2VudCc7XG4gICAgICAgIGNvbnN0IGlzRmFpbGVkID0gdGhpcy5wcm9wcy5tZXNzYWdlU3RhdGUgPT09ICdub3Rfc2VudCc7XG4gICAgICAgIGNvbnN0IHJlY2VpcHRDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnbXhfRXZlbnRUaWxlX3JlY2VpcHRTZW50JzogaXNTZW50LFxuICAgICAgICAgICAgJ214X0V2ZW50VGlsZV9yZWNlaXB0U2VuZGluZyc6ICFpc1NlbnQgJiYgIWlzRmFpbGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbm9uQ3NzQmFkZ2UgPSBudWxsO1xuICAgICAgICBpZiAoaXNGYWlsZWQpIHtcbiAgICAgICAgICAgIG5vbkNzc0JhZGdlID0gPE5vdGlmaWNhdGlvbkJhZGdlXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uPXtTdGF0aWNOb3RpZmljYXRpb25TdGF0ZS5SRURfRVhDTEFNQVRJT059XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0b29sdGlwID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaG92ZXIpIHtcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IF90KFwiU2VuZGluZyB5b3VyIG1lc3NhZ2UuLi5cIik7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5tZXNzYWdlU3RhdGUgPT09ICdlbmNyeXB0aW5nJykge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gX3QoXCJFbmNyeXB0aW5nIHlvdXIgbWVzc2FnZS4uLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNTZW50KSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBfdChcIllvdXIgbWVzc2FnZSB3YXMgc2VudFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNGYWlsZWQpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IF90KFwiRmFpbGVkIHRvIHNlbmRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUaGUgeU9mZnNldCBpcyBzb21ld2hhdCBhcmJpdHJhcnkgLSBpdCBqdXN0IGJyaW5ncyB0aGUgdG9vbHRpcCBkb3duIHRvIGJlIG1vcmUgYXNzb2NpYXRlZFxuICAgICAgICAgICAgLy8gd2l0aCB0aGUgcmVhZCByZWNlaXB0LlxuICAgICAgICAgICAgdG9vbHRpcCA9IDxUb29sdGlwIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9yZWFkQXZhdGFyc19yZWNlaXB0VG9vbHRpcFwiIGxhYmVsPXtsYWJlbH0geU9mZnNldD17MjB9IC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9yZWFkQXZhdGFyc1wiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtyZWNlaXB0Q2xhc3Nlc30gb25Nb3VzZUVudGVyPXt0aGlzLm9uSG92ZXJTdGFydH0gb25Nb3VzZUxlYXZlPXt0aGlzLm9uSG92ZXJFbmR9PlxuICAgICAgICAgICAgICAgIHtub25Dc3NCYWRnZX1cbiAgICAgICAgICAgICAgICB7dG9vbHRpcH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPjtcbiAgICB9XG59XG4iXX0=