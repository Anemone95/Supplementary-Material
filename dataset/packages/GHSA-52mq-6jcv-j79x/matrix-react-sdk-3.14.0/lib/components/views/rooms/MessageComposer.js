"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _CallHandler = _interopRequireWildcard(require("../../../CallHandler"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Stickerpicker = _interopRequireDefault(require("./Stickerpicker"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _ContentMessages = _interopRequireDefault(require("../../../ContentMessages"));

var _E2EIcon = _interopRequireDefault(require("./E2EIcon"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ContextMenu = require("../../structures/ContextMenu");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _ReplyPreview = _interopRequireDefault(require("./ReplyPreview"));

var _UIFeature = require("../../../settings/UIFeature");

var _WidgetStore = _interopRequireDefault(require("../../../stores/WidgetStore"));

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _AsyncStore = require("../../../stores/AsyncStore");

var _ActiveWidgetStore = _interopRequireDefault(require("../../../stores/ActiveWidgetStore"));

var _call = require("matrix-js-sdk/src/webrtc/call");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
function ComposerAvatar(props) {
  const MemberStatusMessageAvatar = sdk.getComponent('avatars.MemberStatusMessageAvatar');
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MessageComposer_avatar"
  }, /*#__PURE__*/_react.default.createElement(MemberStatusMessageAvatar, {
    member: props.me,
    width: 24,
    height: 24
  }));
}

ComposerAvatar.propTypes = {
  me: _propTypes.default.object.isRequired
};

function CallButton(props) {
  const onVoiceCallClick = ev => {
    _dispatcher.default.dispatch({
      action: 'place_call',
      type: _CallHandler.PlaceCallType.Voice,
      room_id: props.roomId
    });
  };

  return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_MessageComposer_button mx_MessageComposer_voicecall",
    onClick: onVoiceCallClick,
    title: (0, _languageHandler._t)('Voice call')
  });
}

CallButton.propTypes = {
  roomId: _propTypes.default.string.isRequired
};

function VideoCallButton(props) {
  const onCallClick = ev => {
    _dispatcher.default.dispatch({
      action: 'place_call',
      type: ev.shiftKey ? _CallHandler.PlaceCallType.ScreenSharing : _CallHandler.PlaceCallType.Video,
      room_id: props.roomId
    });
  };

  return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_MessageComposer_button mx_MessageComposer_videocall",
    onClick: onCallClick,
    title: (0, _languageHandler._t)('Video call')
  });
}

VideoCallButton.propTypes = {
  roomId: _propTypes.default.string.isRequired
};

function HangupButton(props) {
  const onHangupClick = () => {
    if (props.isConference) {
      _dispatcher.default.dispatch({
        action: props.canEndConference ? 'end_conference' : 'hangup_conference',
        room_id: props.roomId
      });

      return;
    }

    const call = _CallHandler.default.sharedInstance().getCallForRoom(props.roomId);

    if (!call) {
      return;
    }

    const action = call.state === _call.CallState.Ringing ? 'reject' : 'hangup';

    _dispatcher.default.dispatch({
      action,
      // hangup the call for this room. NB. We use the room in props as the room ID
      // as call.roomId may be the 'virtual room', and the dispatch actions always
      // use the user-facing room (there was a time when we deliberately used
      // call.roomId and *not* props.roomId, but that was for the old
      // style Freeswitch conference calls and those times are gone.)
      room_id: props.roomId
    });
  };

  let tooltip = (0, _languageHandler._t)("Hangup");

  if (props.isConference && props.canEndConference) {
    tooltip = (0, _languageHandler._t)("End conference");
  }

  const canLeaveConference = !props.isConference ? true : props.isInConference;
  return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_MessageComposer_button mx_MessageComposer_hangup",
    onClick: onHangupClick,
    title: tooltip,
    disabled: !canLeaveConference
  });
}

HangupButton.propTypes = {
  roomId: _propTypes.default.string.isRequired,
  isConference: _propTypes.default.bool.isRequired,
  canEndConference: _propTypes.default.bool,
  isInConference: _propTypes.default.bool
};

const EmojiButton = ({
  addEmoji
}) => {
  const [menuDisplayed, button, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  let contextMenu;

  if (menuDisplayed) {
    const buttonRect = button.current.getBoundingClientRect();
    const EmojiPicker = sdk.getComponent('emojipicker.EmojiPicker');
    contextMenu = /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(buttonRect), {
      onFinished: closeMenu,
      catchTab: false
    }), /*#__PURE__*/_react.default.createElement(EmojiPicker, {
      onChoose: addEmoji,
      showQuickReactions: true
    }));
  }

  const className = (0, _classnames.default)("mx_MessageComposer_button", "mx_MessageComposer_emoji", {
    "mx_MessageComposer_button_highlight": menuDisplayed
  }); // TODO: replace ContextMenuTooltipButton with a unified representation of
  // the header buttons and the right panel buttons

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
    className: className,
    onClick: openMenu,
    isExpanded: menuDisplayed,
    title: (0, _languageHandler._t)('Emoji picker'),
    inputRef: button
  }), contextMenu);
};

class UploadButton extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === "upload_file") {
        this.onUploadClick();
      }
    });
    this.onUploadClick = this.onUploadClick.bind(this);
    this.onUploadFileInputChange = this.onUploadFileInputChange.bind(this);
    this._uploadInput = /*#__PURE__*/(0, _react.createRef)();
    this._dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this._dispatcherRef);
  }

  onUploadClick(ev) {
    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
      _dispatcher.default.dispatch({
        action: 'require_registration'
      });

      return;
    }

    this._uploadInput.current.click();
  }

  onUploadFileInputChange(ev) {
    if (ev.target.files.length === 0) return; // take a copy so we can safely reset the value of the form control
    // (Note it is a FileList: we can't use slice or sensible iteration).

    const tfiles = [];

    for (let i = 0; i < ev.target.files.length; ++i) {
      tfiles.push(ev.target.files[i]);
    }

    _ContentMessages.default.sharedInstance().sendContentListToRoom(tfiles, this.props.roomId, _MatrixClientPeg.MatrixClientPeg.get()); // This is the onChange handler for a file form control, but we're
    // not keeping any state, so reset the value of the form control
    // to empty.
    // NB. we need to set 'value': the 'files' property is immutable.


    ev.target.value = '';
  }

  render() {
    const uploadInputStyle = {
      display: 'none'
    };
    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_MessageComposer_button mx_MessageComposer_upload",
      onClick: this.onUploadClick,
      title: (0, _languageHandler._t)('Upload file')
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this._uploadInput,
      type: "file",
      style: uploadInputStyle,
      multiple: true,
      onChange: this.onUploadFileInputChange
    }));
  }

}

(0, _defineProperty2.default)(UploadButton, "propTypes", {
  roomId: _propTypes.default.string.isRequired
});

class MessageComposer extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === 'reply_to_event') {
        // add a timeout for the reply preview to be rendered, so
        // that the ScrollPanel listening to the resizeNotifier can
        // correctly measure it's new height and scroll down to keep
        // at the bottom if it already is
        setTimeout(() => {
          this.props.resizeNotifier.notifyTimelineHeightChanged();
        }, 100);
      }
    });
    (0, _defineProperty2.default)(this, "_onWidgetUpdate", () => {
      this.setState({
        hasConference: _WidgetStore.default.instance.doesRoomHaveConference(this.props.room)
      });
    });
    (0, _defineProperty2.default)(this, "_onActiveWidgetUpdate", () => {
      this.setState({
        joinedConference: _WidgetStore.default.instance.isJoinedToConferenceIn(this.props.room)
      });
    });
    this.onInputStateChanged = this.onInputStateChanged.bind(this);
    this._onRoomStateEvents = this._onRoomStateEvents.bind(this);
    this._onTombstoneClick = this._onTombstoneClick.bind(this);
    this.renderPlaceholderText = this.renderPlaceholderText.bind(this);

    _WidgetStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this._onWidgetUpdate);

    _ActiveWidgetStore.default.on('update', this._onActiveWidgetUpdate);

    this._dispatcherRef = null;
    this.state = {
      tombstone: this._getRoomTombstone(),
      canSendMessages: this.props.room.maySendMessage(),
      showCallButtons: _SettingsStore.default.getValue("showCallButtonsInComposer"),
      hasConference: _WidgetStore.default.instance.doesRoomHaveConference(this.props.room),
      joinedConference: _WidgetStore.default.instance.isJoinedToConferenceIn(this.props.room)
    };
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.events", this._onRoomStateEvents);

    this._waitForOwnMember();
  }

  _waitForOwnMember() {
    // if we have the member already, do that
    const me = this.props.room.getMember(_MatrixClientPeg.MatrixClientPeg.get().getUserId());

    if (me) {
      this.setState({
        me
      });
      return;
    } // Otherwise, wait for member loading to finish and then update the member for the avatar.
    // The members should already be loading, and loadMembersIfNeeded
    // will return the promise for the existing operation


    this.props.room.loadMembersIfNeeded().then(() => {
      const me = this.props.room.getMember(_MatrixClientPeg.MatrixClientPeg.get().getUserId());
      this.setState({
        me
      });
    });
  }

  componentWillUnmount() {
    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener("RoomState.events", this._onRoomStateEvents);
    }

    _WidgetStore.default.instance.removeListener(_AsyncStore.UPDATE_EVENT, this._onWidgetUpdate);

    _ActiveWidgetStore.default.removeListener('update', this._onActiveWidgetUpdate);

    _dispatcher.default.unregister(this.dispatcherRef);
  }

  _onRoomStateEvents(ev, state) {
    if (ev.getRoomId() !== this.props.room.roomId) return;

    if (ev.getType() === 'm.room.tombstone') {
      this.setState({
        tombstone: this._getRoomTombstone()
      });
    }

    if (ev.getType() === 'm.room.power_levels') {
      this.setState({
        canSendMessages: this.props.room.maySendMessage()
      });
    }
  }

  _getRoomTombstone() {
    return this.props.room.currentState.getStateEvents('m.room.tombstone', '');
  }

  onInputStateChanged(inputState) {
    // Merge the new input state with old to support partial updates
    inputState = Object.assign({}, this.state.inputState, inputState);
    this.setState({
      inputState
    });
  }

  _onTombstoneClick(ev) {
    ev.preventDefault();
    const replacementRoomId = this.state.tombstone.getContent()['replacement_room'];

    const replacementRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(replacementRoomId);

    let createEventId = null;

    if (replacementRoom) {
      const createEvent = replacementRoom.currentState.getStateEvents('m.room.create', '');
      if (createEvent && createEvent.getId()) createEventId = createEvent.getId();
    }

    const viaServers = [this.state.tombstone.getSender().split(':').splice(1).join(':')];

    _dispatcher.default.dispatch({
      action: 'view_room',
      highlighted: true,
      event_id: createEventId,
      room_id: replacementRoomId,
      auto_join: true,
      _type: "tombstone",
      // instrumentation
      // Try to join via the server that sent the event. This converts @something:example.org
      // into a server domain by splitting on colons and ignoring the first entry ("@something").
      via_servers: viaServers,
      opts: {
        // These are passed down to the js-sdk's /join call
        viaServers: viaServers
      }
    });
  }

  renderPlaceholderText() {
    if (this.props.replyToEvent) {
      if (this.props.e2eStatus) {
        return (0, _languageHandler._t)('Send an encrypted reply…');
      } else {
        return (0, _languageHandler._t)('Send a reply…');
      }
    } else {
      if (this.props.e2eStatus) {
        return (0, _languageHandler._t)('Send an encrypted message…');
      } else {
        return (0, _languageHandler._t)('Send a message…');
      }
    }
  }

  addEmoji(emoji) {
    _dispatcher.default.dispatch({
      action: "insert_emoji",
      emoji
    });
  }

  render() {
    const controls = [this.state.me ? /*#__PURE__*/_react.default.createElement(ComposerAvatar, {
      key: "controls_avatar",
      me: this.state.me
    }) : null, this.props.e2eStatus ? /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      key: "e2eIcon",
      status: this.props.e2eStatus,
      className: "mx_MessageComposer_e2eIcon"
    }) : null];

    if (!this.state.tombstone && this.state.canSendMessages) {
      // This also currently includes the call buttons. Really we should
      // check separately for whether we can call, but this is slightly
      // complex because of conference calls.
      const SendMessageComposer = sdk.getComponent("rooms.SendMessageComposer");
      const callInProgress = this.props.callState && this.props.callState !== 'ended';
      controls.push( /*#__PURE__*/_react.default.createElement(SendMessageComposer, {
        ref: c => this.messageComposerInput = c,
        key: "controls_input",
        room: this.props.room,
        placeholder: this.renderPlaceholderText(),
        resizeNotifier: this.props.resizeNotifier,
        permalinkCreator: this.props.permalinkCreator,
        replyToEvent: this.props.replyToEvent
      }), /*#__PURE__*/_react.default.createElement(UploadButton, {
        key: "controls_upload",
        roomId: this.props.room.roomId
      }), /*#__PURE__*/_react.default.createElement(EmojiButton, {
        key: "emoji_button",
        addEmoji: this.addEmoji
      }));

      if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets) && _SettingsStore.default.getValue("MessageComposerInput.showStickersButton")) {
        controls.push( /*#__PURE__*/_react.default.createElement(_Stickerpicker.default, {
          key: "stickerpicker_controls_button",
          room: this.props.room
        }));
      }

      if (this.state.showCallButtons) {
        if (this.state.hasConference) {
          const canEndConf = _WidgetUtils.default.canUserModifyWidgets(this.props.room.roomId);

          controls.push( /*#__PURE__*/_react.default.createElement(HangupButton, {
            key: "controls_hangup",
            roomId: this.props.room.roomId,
            isConference: true,
            canEndConference: canEndConf,
            isInConference: this.state.joinedConference
          }));
        } else if (callInProgress) {
          controls.push( /*#__PURE__*/_react.default.createElement(HangupButton, {
            key: "controls_hangup",
            roomId: this.props.room.roomId,
            isConference: false
          }));
        } else {
          controls.push( /*#__PURE__*/_react.default.createElement(CallButton, {
            key: "controls_call",
            roomId: this.props.room.roomId
          }), /*#__PURE__*/_react.default.createElement(VideoCallButton, {
            key: "controls_videocall",
            roomId: this.props.room.roomId
          }));
        }
      }
    } else if (this.state.tombstone) {
      const replacementRoomId = this.state.tombstone.getContent()['replacement_room'];
      const continuesLink = replacementRoomId ? /*#__PURE__*/_react.default.createElement("a", {
        href: (0, _Permalinks.makeRoomPermalink)(replacementRoomId),
        className: "mx_MessageComposer_roomReplaced_link",
        onClick: this._onTombstoneClick
      }, (0, _languageHandler._t)("The conversation continues here.")) : '';
      controls.push( /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MessageComposer_replaced_wrapper",
        key: "room_replaced"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MessageComposer_replaced_valign"
      }, /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_MessageComposer_roomReplaced_icon",
        src: require("../../../../res/img/room_replaced.svg")
      }), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MessageComposer_roomReplaced_header"
      }, (0, _languageHandler._t)("This room has been replaced and is no longer active.")), /*#__PURE__*/_react.default.createElement("br", null), continuesLink)));
    } else {
      controls.push( /*#__PURE__*/_react.default.createElement("div", {
        key: "controls_error",
        className: "mx_MessageComposer_noperm_error"
      }, (0, _languageHandler._t)('You do not have permission to post to this room')));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer mx_GroupLayout"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer_wrapper"
    }, /*#__PURE__*/_react.default.createElement(_ReplyPreview.default, {
      permalinkCreator: this.props.permalinkCreator
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer_row"
    }, controls)));
  }

}

exports.default = MessageComposer;
MessageComposer.propTypes = {
  // js-sdk Room object
  room: _propTypes.default.object.isRequired,
  // string representing the current voip call state
  callState: _propTypes.default.string,
  // string representing the current room app drawer state
  showApps: _propTypes.default.bool
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL01lc3NhZ2VDb21wb3Nlci5qcyJdLCJuYW1lcyI6WyJDb21wb3NlckF2YXRhciIsInByb3BzIiwiTWVtYmVyU3RhdHVzTWVzc2FnZUF2YXRhciIsInNkayIsImdldENvbXBvbmVudCIsIm1lIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsIkNhbGxCdXR0b24iLCJvblZvaWNlQ2FsbENsaWNrIiwiZXYiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInR5cGUiLCJQbGFjZUNhbGxUeXBlIiwiVm9pY2UiLCJyb29tX2lkIiwicm9vbUlkIiwic3RyaW5nIiwiVmlkZW9DYWxsQnV0dG9uIiwib25DYWxsQ2xpY2siLCJzaGlmdEtleSIsIlNjcmVlblNoYXJpbmciLCJWaWRlbyIsIkhhbmd1cEJ1dHRvbiIsIm9uSGFuZ3VwQ2xpY2siLCJpc0NvbmZlcmVuY2UiLCJjYW5FbmRDb25mZXJlbmNlIiwiY2FsbCIsIkNhbGxIYW5kbGVyIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRDYWxsRm9yUm9vbSIsInN0YXRlIiwiQ2FsbFN0YXRlIiwiUmluZ2luZyIsInRvb2x0aXAiLCJjYW5MZWF2ZUNvbmZlcmVuY2UiLCJpc0luQ29uZmVyZW5jZSIsImJvb2wiLCJFbW9qaUJ1dHRvbiIsImFkZEVtb2ppIiwibWVudURpc3BsYXllZCIsImJ1dHRvbiIsIm9wZW5NZW51IiwiY2xvc2VNZW51IiwiY29udGV4dE1lbnUiLCJidXR0b25SZWN0IiwiY3VycmVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIkVtb2ppUGlja2VyIiwiY2xhc3NOYW1lIiwiVXBsb2FkQnV0dG9uIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInBheWxvYWQiLCJvblVwbG9hZENsaWNrIiwiYmluZCIsIm9uVXBsb2FkRmlsZUlucHV0Q2hhbmdlIiwiX3VwbG9hZElucHV0IiwiX2Rpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiaXNHdWVzdCIsImNsaWNrIiwidGFyZ2V0IiwiZmlsZXMiLCJsZW5ndGgiLCJ0ZmlsZXMiLCJpIiwicHVzaCIsIkNvbnRlbnRNZXNzYWdlcyIsInNlbmRDb250ZW50TGlzdFRvUm9vbSIsInZhbHVlIiwicmVuZGVyIiwidXBsb2FkSW5wdXRTdHlsZSIsImRpc3BsYXkiLCJNZXNzYWdlQ29tcG9zZXIiLCJzZXRUaW1lb3V0IiwicmVzaXplTm90aWZpZXIiLCJub3RpZnlUaW1lbGluZUhlaWdodENoYW5nZWQiLCJzZXRTdGF0ZSIsImhhc0NvbmZlcmVuY2UiLCJXaWRnZXRTdG9yZSIsImluc3RhbmNlIiwiZG9lc1Jvb21IYXZlQ29uZmVyZW5jZSIsInJvb20iLCJqb2luZWRDb25mZXJlbmNlIiwiaXNKb2luZWRUb0NvbmZlcmVuY2VJbiIsIm9uSW5wdXRTdGF0ZUNoYW5nZWQiLCJfb25Sb29tU3RhdGVFdmVudHMiLCJfb25Ub21ic3RvbmVDbGljayIsInJlbmRlclBsYWNlaG9sZGVyVGV4dCIsIm9uIiwiVVBEQVRFX0VWRU5UIiwiX29uV2lkZ2V0VXBkYXRlIiwiQWN0aXZlV2lkZ2V0U3RvcmUiLCJfb25BY3RpdmVXaWRnZXRVcGRhdGUiLCJ0b21ic3RvbmUiLCJfZ2V0Um9vbVRvbWJzdG9uZSIsImNhblNlbmRNZXNzYWdlcyIsIm1heVNlbmRNZXNzYWdlIiwic2hvd0NhbGxCdXR0b25zIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyUmVmIiwiX3dhaXRGb3JPd25NZW1iZXIiLCJnZXRNZW1iZXIiLCJnZXRVc2VySWQiLCJsb2FkTWVtYmVyc0lmTmVlZGVkIiwidGhlbiIsInJlbW92ZUxpc3RlbmVyIiwiZ2V0Um9vbUlkIiwiZ2V0VHlwZSIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiaW5wdXRTdGF0ZSIsIk9iamVjdCIsImFzc2lnbiIsInByZXZlbnREZWZhdWx0IiwicmVwbGFjZW1lbnRSb29tSWQiLCJnZXRDb250ZW50IiwicmVwbGFjZW1lbnRSb29tIiwiZ2V0Um9vbSIsImNyZWF0ZUV2ZW50SWQiLCJjcmVhdGVFdmVudCIsImdldElkIiwidmlhU2VydmVycyIsImdldFNlbmRlciIsInNwbGl0Iiwic3BsaWNlIiwiam9pbiIsImhpZ2hsaWdodGVkIiwiZXZlbnRfaWQiLCJhdXRvX2pvaW4iLCJfdHlwZSIsInZpYV9zZXJ2ZXJzIiwib3B0cyIsInJlcGx5VG9FdmVudCIsImUyZVN0YXR1cyIsImVtb2ppIiwiY29udHJvbHMiLCJTZW5kTWVzc2FnZUNvbXBvc2VyIiwiY2FsbEluUHJvZ3Jlc3MiLCJjYWxsU3RhdGUiLCJjIiwibWVzc2FnZUNvbXBvc2VySW5wdXQiLCJwZXJtYWxpbmtDcmVhdG9yIiwiVUlGZWF0dXJlIiwiV2lkZ2V0cyIsImNhbkVuZENvbmYiLCJXaWRnZXRVdGlscyIsImNhblVzZXJNb2RpZnlXaWRnZXRzIiwiY29udGludWVzTGluayIsInJlcXVpcmUiLCJzaG93QXBwcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQXZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBeUJBLFNBQVNBLGNBQVQsQ0FBd0JDLEtBQXhCLEVBQStCO0FBQzNCLFFBQU1DLHlCQUF5QixHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsbUNBQWpCLENBQWxDO0FBQ0Esc0JBQU87QUFBSyxJQUFBLFNBQVMsRUFB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QSxTQUFTLEVBQUMscUNBQWY7QUFBcUQsUUFBQSxHQUFHLEVBQUM7QUFBekQsc0JBQ1Y7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJO0FBQUssUUFBQSxTQUFTLEVBQUMsc0NBQWY7QUFBc0QsUUFBQSxHQUFHLEVBQUVxRixPQUFPLENBQUMsdUNBQUQ7QUFBbEUsUUFESixlQUVJO0FBQU0sUUFBQSxTQUFTLEVBQUM7QUFBaEIsU0FDSyx5QkFBRyxzREFBSCxDQURMLENBRkosZUFJVyx3Q0FKWCxFQUtNRCxhQUxOLENBRFUsQ0FBZDtBQVNILEtBckJNLE1BcUJBO0FBQ0haLE1BQUFBLFFBQVEsQ0FBQ3hFLElBQVQsZUFDSTtBQUFLLFFBQUEsR0FBRyxFQUFDLGdCQUFUO0FBQTBCLFFBQUEsU0FBUyxFQUFDO0FBQXBDLFNBQ00seUJBQUcsaURBQUgsQ0FETixDQURKO0FBS0g7O0FBRUQsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSw2QkFBQyxxQkFBRDtBQUFjLE1BQUEsZ0JBQWdCLEVBQUUsS0FBSzVFLEtBQUwsQ0FBVzBKO0FBQTNDLE1BREosZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTU4sUUFETixDQUZKLENBREosQ0FESjtBQVVIOztBQWxQd0Q7OztBQXFQN0RqRSxlQUFlLENBQUM5RSxTQUFoQixHQUE0QjtBQUN4QjtBQUNBdUYsRUFBQUEsSUFBSSxFQUFFdEYsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRkM7QUFJeEI7QUFDQStJLEVBQUFBLFNBQVMsRUFBRWpKLG1CQUFVYyxNQUxHO0FBT3hCO0FBQ0E4SSxFQUFBQSxRQUFRLEVBQUU1SixtQkFBVWtDO0FBUkksQ0FBNUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBDYWxsSGFuZGxlciBmcm9tICcuLi8uLi8uLi9DYWxsSGFuZGxlcic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgU3RpY2tlcnBpY2tlciBmcm9tICcuL1N0aWNrZXJwaWNrZXInO1xuaW1wb3J0IHsgbWFrZVJvb21QZXJtYWxpbmsgfSBmcm9tICcuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3MnO1xuaW1wb3J0IENvbnRlbnRNZXNzYWdlcyBmcm9tICcuLi8uLi8uLi9Db250ZW50TWVzc2FnZXMnO1xuaW1wb3J0IEUyRUljb24gZnJvbSAnLi9FMkVJY29uJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge2Fib3ZlTGVmdE9mLCBDb250ZXh0TWVudSwgQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uLCB1c2VDb250ZXh0TWVudX0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCBSZXBseVByZXZpZXcgZnJvbSBcIi4vUmVwbHlQcmV2aWV3XCI7XG5pbXBvcnQge1VJRmVhdHVyZX0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IFdpZGdldFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCBXaWRnZXRVdGlscyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvV2lkZ2V0VXRpbHNcIjtcbmltcG9ydCB7VVBEQVRFX0VWRU5UfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcbmltcG9ydCBBY3RpdmVXaWRnZXRTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0FjdGl2ZVdpZGdldFN0b3JlXCI7XG5pbXBvcnQgeyBQbGFjZUNhbGxUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL0NhbGxIYW5kbGVyXCI7XG5pbXBvcnQgeyBDYWxsU3RhdGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5cbmZ1bmN0aW9uIENvbXBvc2VyQXZhdGFyKHByb3BzKSB7XG4gICAgY29uc3QgTWVtYmVyU3RhdHVzTWVzc2FnZUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ2F2YXRhcnMuTWVtYmVyU3RhdHVzTWVzc2FnZUF2YXRhcicpO1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9hdmF0YXJcIj5cbiAgICAgICAgPE1lbWJlclN0YXR1c01lc3NhZ2VBdmF0YXIgbWVtYmVyPXtwcm9wcy5tZX0gd2lkdGg9ezI0fSBoZWlnaHQ9ezI0fSAvPlxuICAgIDwvZGl2Pjtcbn1cblxuQ29tcG9zZXJBdmF0YXIucHJvcFR5cGVzID0ge1xuICAgIG1lOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG59O1xuXG5mdW5jdGlvbiBDYWxsQnV0dG9uKHByb3BzKSB7XG4gICAgY29uc3Qgb25Wb2ljZUNhbGxDbGljayA9IChldikgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAncGxhY2VfY2FsbCcsXG4gICAgICAgICAgICB0eXBlOiBQbGFjZUNhbGxUeXBlLlZvaWNlLFxuICAgICAgICAgICAgcm9vbV9pZDogcHJvcHMucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuICg8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX2J1dHRvbiBteF9NZXNzYWdlQ29tcG9zZXJfdm9pY2VjYWxsXCJcbiAgICAgICAgb25DbGljaz17b25Wb2ljZUNhbGxDbGlja31cbiAgICAgICAgdGl0bGU9e190KCdWb2ljZSBjYWxsJyl9XG4gICAgLz4pO1xufVxuXG5DYWxsQnV0dG9uLnByb3BUeXBlcyA9IHtcbiAgICByb29tSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbn07XG5cbmZ1bmN0aW9uIFZpZGVvQ2FsbEJ1dHRvbihwcm9wcykge1xuICAgIGNvbnN0IG9uQ2FsbENsaWNrID0gKGV2KSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdwbGFjZV9jYWxsJyxcbiAgICAgICAgICAgIHR5cGU6IGV2LnNoaWZ0S2V5ID8gUGxhY2VDYWxsVHlwZS5TY3JlZW5TaGFyaW5nIDogUGxhY2VDYWxsVHlwZS5WaWRlbyxcbiAgICAgICAgICAgIHJvb21faWQ6IHByb3BzLnJvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX2J1dHRvbiBteF9NZXNzYWdlQ29tcG9zZXJfdmlkZW9jYWxsXCJcbiAgICAgICAgb25DbGljaz17b25DYWxsQ2xpY2t9XG4gICAgICAgIHRpdGxlPXtfdCgnVmlkZW8gY2FsbCcpfVxuICAgIC8+O1xufVxuXG5WaWRlb0NhbGxCdXR0b24ucHJvcFR5cGVzID0ge1xuICAgIHJvb21JZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxufTtcblxuZnVuY3Rpb24gSGFuZ3VwQnV0dG9uKHByb3BzKSB7XG4gICAgY29uc3Qgb25IYW5ndXBDbGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHByb3BzLmlzQ29uZmVyZW5jZSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IHByb3BzLmNhbkVuZENvbmZlcmVuY2UgPyAnZW5kX2NvbmZlcmVuY2UnIDogJ2hhbmd1cF9jb25mZXJlbmNlJyxcbiAgICAgICAgICAgICAgICByb29tX2lkOiBwcm9wcy5yb29tSWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbGwgPSBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLmdldENhbGxGb3JSb29tKHByb3BzLnJvb21JZCk7XG4gICAgICAgIGlmICghY2FsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWN0aW9uID0gY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLlJpbmdpbmcgPyAncmVqZWN0JyA6ICdoYW5ndXAnO1xuXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb24sXG4gICAgICAgICAgICAvLyBoYW5ndXAgdGhlIGNhbGwgZm9yIHRoaXMgcm9vbS4gTkIuIFdlIHVzZSB0aGUgcm9vbSBpbiBwcm9wcyBhcyB0aGUgcm9vbSBJRFxuICAgICAgICAgICAgLy8gYXMgY2FsbC5yb29tSWQgbWF5IGJlIHRoZSAndmlydHVhbCByb29tJywgYW5kIHRoZSBkaXNwYXRjaCBhY3Rpb25zIGFsd2F5c1xuICAgICAgICAgICAgLy8gdXNlIHRoZSB1c2VyLWZhY2luZyByb29tICh0aGVyZSB3YXMgYSB0aW1lIHdoZW4gd2UgZGVsaWJlcmF0ZWx5IHVzZWRcbiAgICAgICAgICAgIC8vIGNhbGwucm9vbUlkIGFuZCAqbm90KiBwcm9wcy5yb29tSWQsIGJ1dCB0aGF0IHdhcyBmb3IgdGhlIG9sZFxuICAgICAgICAgICAgLy8gc3R5bGUgRnJlZXN3aXRjaCBjb25mZXJlbmNlIGNhbGxzIGFuZCB0aG9zZSB0aW1lcyBhcmUgZ29uZS4pXG4gICAgICAgICAgICByb29tX2lkOiBwcm9wcy5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgdG9vbHRpcCA9IF90KFwiSGFuZ3VwXCIpO1xuICAgIGlmIChwcm9wcy5pc0NvbmZlcmVuY2UgJiYgcHJvcHMuY2FuRW5kQ29uZmVyZW5jZSkge1xuICAgICAgICB0b29sdGlwID0gX3QoXCJFbmQgY29uZmVyZW5jZVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBjYW5MZWF2ZUNvbmZlcmVuY2UgPSAhcHJvcHMuaXNDb25mZXJlbmNlID8gdHJ1ZSA6IHByb3BzLmlzSW5Db25mZXJlbmNlO1xuICAgIHJldHVybiAoXG4gICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX2J1dHRvbiBteF9NZXNzYWdlQ29tcG9zZXJfaGFuZ3VwXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e29uSGFuZ3VwQ2xpY2t9XG4gICAgICAgICAgICB0aXRsZT17dG9vbHRpcH1cbiAgICAgICAgICAgIGRpc2FibGVkPXshY2FuTGVhdmVDb25mZXJlbmNlfVxuICAgICAgICAvPlxuICAgICk7XG59XG5cbkhhbmd1cEJ1dHRvbi5wcm9wVHlwZXMgPSB7XG4gICAgcm9vbUlkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgaXNDb25mZXJlbmNlOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGNhbkVuZENvbmZlcmVuY2U6IFByb3BUeXBlcy5ib29sLFxuICAgIGlzSW5Db25mZXJlbmNlOiBQcm9wVHlwZXMuYm9vbCxcbn07XG5cbmNvbnN0IEVtb2ppQnV0dG9uID0gKHthZGRFbW9qaX0pID0+IHtcbiAgICBjb25zdCBbbWVudURpc3BsYXllZCwgYnV0dG9uLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51KCk7XG5cbiAgICBsZXQgY29udGV4dE1lbnU7XG4gICAgaWYgKG1lbnVEaXNwbGF5ZWQpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uUmVjdCA9IGJ1dHRvbi5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBFbW9qaVBpY2tlciA9IHNkay5nZXRDb21wb25lbnQoJ2Vtb2ppcGlja2VyLkVtb2ppUGlja2VyJyk7XG4gICAgICAgIGNvbnRleHRNZW51ID0gPENvbnRleHRNZW51IHsuLi5hYm92ZUxlZnRPZihidXR0b25SZWN0KX0gb25GaW5pc2hlZD17Y2xvc2VNZW51fSBjYXRjaFRhYj17ZmFsc2V9PlxuICAgICAgICAgICAgPEVtb2ppUGlja2VyIG9uQ2hvb3NlPXthZGRFbW9qaX0gc2hvd1F1aWNrUmVhY3Rpb25zPXt0cnVlfSAvPlxuICAgICAgICA8L0NvbnRleHRNZW51PjtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKFxuICAgICAgICBcIm14X01lc3NhZ2VDb21wb3Nlcl9idXR0b25cIixcbiAgICAgICAgXCJteF9NZXNzYWdlQ29tcG9zZXJfZW1vamlcIixcbiAgICAgICAge1xuICAgICAgICAgICAgXCJteF9NZXNzYWdlQ29tcG9zZXJfYnV0dG9uX2hpZ2hsaWdodFwiOiBtZW51RGlzcGxheWVkLFxuICAgICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBUT0RPOiByZXBsYWNlIENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiB3aXRoIGEgdW5pZmllZCByZXByZXNlbnRhdGlvbiBvZlxuICAgIC8vIHRoZSBoZWFkZXIgYnV0dG9ucyBhbmQgdGhlIHJpZ2h0IHBhbmVsIGJ1dHRvbnNcbiAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5NZW51fVxuICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIHRpdGxlPXtfdCgnRW1vamkgcGlja2VyJyl9XG4gICAgICAgICAgICBpbnB1dFJlZj17YnV0dG9ufVxuICAgICAgICA+XG5cbiAgICAgICAgPC9Db250ZXh0TWVudVRvb2x0aXBCdXR0b24+XG5cbiAgICAgICAgeyBjb250ZXh0TWVudSB9XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG5jbGFzcyBVcGxvYWRCdXR0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb21JZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vblVwbG9hZENsaWNrID0gdGhpcy5vblVwbG9hZENsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25VcGxvYWRGaWxlSW5wdXRDaGFuZ2UgPSB0aGlzLm9uVXBsb2FkRmlsZUlucHV0Q2hhbmdlLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5fdXBsb2FkSW5wdXQgPSBjcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5fZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5fZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSBwYXlsb2FkID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBcInVwbG9hZF9maWxlXCIpIHtcbiAgICAgICAgICAgIHRoaXMub25VcGxvYWRDbGljaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uVXBsb2FkQ2xpY2soZXYpIHtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXBsb2FkSW5wdXQuY3VycmVudC5jbGljaygpO1xuICAgIH1cblxuICAgIG9uVXBsb2FkRmlsZUlucHV0Q2hhbmdlKGV2KSB7XG4gICAgICAgIGlmIChldi50YXJnZXQuZmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgLy8gdGFrZSBhIGNvcHkgc28gd2UgY2FuIHNhZmVseSByZXNldCB0aGUgdmFsdWUgb2YgdGhlIGZvcm0gY29udHJvbFxuICAgICAgICAvLyAoTm90ZSBpdCBpcyBhIEZpbGVMaXN0OiB3ZSBjYW4ndCB1c2Ugc2xpY2Ugb3Igc2Vuc2libGUgaXRlcmF0aW9uKS5cbiAgICAgICAgY29uc3QgdGZpbGVzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXYudGFyZ2V0LmZpbGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB0ZmlsZXMucHVzaChldi50YXJnZXQuZmlsZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgdGZpbGVzLCB0aGlzLnByb3BzLnJvb21JZCwgTWF0cml4Q2xpZW50UGVnLmdldCgpLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIG9uQ2hhbmdlIGhhbmRsZXIgZm9yIGEgZmlsZSBmb3JtIGNvbnRyb2wsIGJ1dCB3ZSdyZVxuICAgICAgICAvLyBub3Qga2VlcGluZyBhbnkgc3RhdGUsIHNvIHJlc2V0IHRoZSB2YWx1ZSBvZiB0aGUgZm9ybSBjb250cm9sXG4gICAgICAgIC8vIHRvIGVtcHR5LlxuICAgICAgICAvLyBOQi4gd2UgbmVlZCB0byBzZXQgJ3ZhbHVlJzogdGhlICdmaWxlcycgcHJvcGVydHkgaXMgaW1tdXRhYmxlLlxuICAgICAgICBldi50YXJnZXQudmFsdWUgPSAnJztcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHVwbG9hZElucHV0U3R5bGUgPSB7ZGlzcGxheTogJ25vbmUnfTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9idXR0b24gbXhfTWVzc2FnZUNvbXBvc2VyX3VwbG9hZFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblVwbG9hZENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnVXBsb2FkIGZpbGUnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl91cGxvYWRJbnB1dH1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17dXBsb2FkSW5wdXRTdHlsZX1cbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25VcGxvYWRGaWxlSW5wdXRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlQ29tcG9zZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbklucHV0U3RhdGVDaGFuZ2VkID0gdGhpcy5vbklucHV0U3RhdGVDaGFuZ2VkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uUm9vbVN0YXRlRXZlbnRzID0gdGhpcy5fb25Sb29tU3RhdGVFdmVudHMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25Ub21ic3RvbmVDbGljayA9IHRoaXMuX29uVG9tYnN0b25lQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZW5kZXJQbGFjZWhvbGRlclRleHQgPSB0aGlzLnJlbmRlclBsYWNlaG9sZGVyVGV4dC5iaW5kKHRoaXMpO1xuICAgICAgICBXaWRnZXRTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMuX29uV2lkZ2V0VXBkYXRlKTtcbiAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUub24oJ3VwZGF0ZScsIHRoaXMuX29uQWN0aXZlV2lkZ2V0VXBkYXRlKTtcbiAgICAgICAgdGhpcy5fZGlzcGF0Y2hlclJlZiA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHRvbWJzdG9uZTogdGhpcy5fZ2V0Um9vbVRvbWJzdG9uZSgpLFxuICAgICAgICAgICAgY2FuU2VuZE1lc3NhZ2VzOiB0aGlzLnByb3BzLnJvb20ubWF5U2VuZE1lc3NhZ2UoKSxcbiAgICAgICAgICAgIHNob3dDYWxsQnV0dG9uczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dDYWxsQnV0dG9uc0luQ29tcG9zZXJcIiksXG4gICAgICAgICAgICBoYXNDb25mZXJlbmNlOiBXaWRnZXRTdG9yZS5pbnN0YW5jZS5kb2VzUm9vbUhhdmVDb25mZXJlbmNlKHRoaXMucHJvcHMucm9vbSksXG4gICAgICAgICAgICBqb2luZWRDb25mZXJlbmNlOiBXaWRnZXRTdG9yZS5pbnN0YW5jZS5pc0pvaW5lZFRvQ29uZmVyZW5jZUluKHRoaXMucHJvcHMucm9vbSksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdyZXBseV90b19ldmVudCcpIHtcbiAgICAgICAgICAgIC8vIGFkZCBhIHRpbWVvdXQgZm9yIHRoZSByZXBseSBwcmV2aWV3IHRvIGJlIHJlbmRlcmVkLCBzb1xuICAgICAgICAgICAgLy8gdGhhdCB0aGUgU2Nyb2xsUGFuZWwgbGlzdGVuaW5nIHRvIHRoZSByZXNpemVOb3RpZmllciBjYW5cbiAgICAgICAgICAgIC8vIGNvcnJlY3RseSBtZWFzdXJlIGl0J3MgbmV3IGhlaWdodCBhbmQgc2Nyb2xsIGRvd24gdG8ga2VlcFxuICAgICAgICAgICAgLy8gYXQgdGhlIGJvdHRvbSBpZiBpdCBhbHJlYWR5IGlzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLm5vdGlmeVRpbWVsaW5lSGVpZ2h0Q2hhbmdlZCgpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25XaWRnZXRVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2hhc0NvbmZlcmVuY2U6IFdpZGdldFN0b3JlLmluc3RhbmNlLmRvZXNSb29tSGF2ZUNvbmZlcmVuY2UodGhpcy5wcm9wcy5yb29tKX0pO1xuICAgIH07XG5cbiAgICBfb25BY3RpdmVXaWRnZXRVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2pvaW5lZENvbmZlcmVuY2U6IFdpZGdldFN0b3JlLmluc3RhbmNlLmlzSm9pbmVkVG9Db25mZXJlbmNlSW4odGhpcy5wcm9wcy5yb29tKX0pO1xuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMuX29uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgdGhpcy5fd2FpdEZvck93bk1lbWJlcigpO1xuICAgIH1cblxuICAgIF93YWl0Rm9yT3duTWVtYmVyKCkge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIHRoZSBtZW1iZXIgYWxyZWFkeSwgZG8gdGhhdFxuICAgICAgICBjb25zdCBtZSA9IHRoaXMucHJvcHMucm9vbS5nZXRNZW1iZXIoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgaWYgKG1lKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZX0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgd2FpdCBmb3IgbWVtYmVyIGxvYWRpbmcgdG8gZmluaXNoIGFuZCB0aGVuIHVwZGF0ZSB0aGUgbWVtYmVyIGZvciB0aGUgYXZhdGFyLlxuICAgICAgICAvLyBUaGUgbWVtYmVycyBzaG91bGQgYWxyZWFkeSBiZSBsb2FkaW5nLCBhbmQgbG9hZE1lbWJlcnNJZk5lZWRlZFxuICAgICAgICAvLyB3aWxsIHJldHVybiB0aGUgcHJvbWlzZSBmb3IgdGhlIGV4aXN0aW5nIG9wZXJhdGlvblxuICAgICAgICB0aGlzLnByb3BzLnJvb20ubG9hZE1lbWJlcnNJZk5lZWRlZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWUgPSB0aGlzLnByb3BzLnJvb20uZ2V0TWVtYmVyKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLmV2ZW50c1wiLCB0aGlzLl9vblJvb21TdGF0ZUV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgV2lkZ2V0U3RvcmUuaW5zdGFuY2UucmVtb3ZlTGlzdGVuZXIoVVBEQVRFX0VWRU5ULCB0aGlzLl9vbldpZGdldFVwZGF0ZSk7XG4gICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLnJlbW92ZUxpc3RlbmVyKCd1cGRhdGUnLCB0aGlzLl9vbkFjdGl2ZVdpZGdldFVwZGF0ZSk7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgX29uUm9vbVN0YXRlRXZlbnRzKGV2LCBzdGF0ZSkge1xuICAgICAgICBpZiAoZXYuZ2V0Um9vbUlkKCkgIT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQpIHJldHVybjtcblxuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSAnbS5yb29tLnRvbWJzdG9uZScpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3RvbWJzdG9uZTogdGhpcy5fZ2V0Um9vbVRvbWJzdG9uZSgpfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gJ20ucm9vbS5wb3dlcl9sZXZlbHMnKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjYW5TZW5kTWVzc2FnZXM6IHRoaXMucHJvcHMucm9vbS5tYXlTZW5kTWVzc2FnZSgpfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0Um9vbVRvbWJzdG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMucm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS50b21ic3RvbmUnLCAnJyk7XG4gICAgfVxuXG4gICAgb25JbnB1dFN0YXRlQ2hhbmdlZChpbnB1dFN0YXRlKSB7XG4gICAgICAgIC8vIE1lcmdlIHRoZSBuZXcgaW5wdXQgc3RhdGUgd2l0aCBvbGQgdG8gc3VwcG9ydCBwYXJ0aWFsIHVwZGF0ZXNcbiAgICAgICAgaW5wdXRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUuaW5wdXRTdGF0ZSwgaW5wdXRTdGF0ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lucHV0U3RhdGV9KTtcbiAgICB9XG5cbiAgICBfb25Ub21ic3RvbmVDbGljayhldikge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50Um9vbUlkID0gdGhpcy5zdGF0ZS50b21ic3RvbmUuZ2V0Q29udGVudCgpWydyZXBsYWNlbWVudF9yb29tJ107XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50Um9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJlcGxhY2VtZW50Um9vbUlkKTtcbiAgICAgICAgbGV0IGNyZWF0ZUV2ZW50SWQgPSBudWxsO1xuICAgICAgICBpZiAocmVwbGFjZW1lbnRSb29tKSB7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVFdmVudCA9IHJlcGxhY2VtZW50Um9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5jcmVhdGUnLCAnJyk7XG4gICAgICAgICAgICBpZiAoY3JlYXRlRXZlbnQgJiYgY3JlYXRlRXZlbnQuZ2V0SWQoKSkgY3JlYXRlRXZlbnRJZCA9IGNyZWF0ZUV2ZW50LmdldElkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2aWFTZXJ2ZXJzID0gW3RoaXMuc3RhdGUudG9tYnN0b25lLmdldFNlbmRlcigpLnNwbGl0KCc6Jykuc3BsaWNlKDEpLmpvaW4oJzonKV07XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRydWUsXG4gICAgICAgICAgICBldmVudF9pZDogY3JlYXRlRXZlbnRJZCxcbiAgICAgICAgICAgIHJvb21faWQ6IHJlcGxhY2VtZW50Um9vbUlkLFxuICAgICAgICAgICAgYXV0b19qb2luOiB0cnVlLFxuICAgICAgICAgICAgX3R5cGU6IFwidG9tYnN0b25lXCIsIC8vIGluc3RydW1lbnRhdGlvblxuXG4gICAgICAgICAgICAvLyBUcnkgdG8gam9pbiB2aWEgdGhlIHNlcnZlciB0aGF0IHNlbnQgdGhlIGV2ZW50LiBUaGlzIGNvbnZlcnRzIEBzb21ldGhpbmc6ZXhhbXBsZS5vcmdcbiAgICAgICAgICAgIC8vIGludG8gYSBzZXJ2ZXIgZG9tYWluIGJ5IHNwbGl0dGluZyBvbiBjb2xvbnMgYW5kIGlnbm9yaW5nIHRoZSBmaXJzdCBlbnRyeSAoXCJAc29tZXRoaW5nXCIpLlxuICAgICAgICAgICAgdmlhX3NlcnZlcnM6IHZpYVNlcnZlcnMsXG4gICAgICAgICAgICBvcHRzOiB7XG4gICAgICAgICAgICAgICAgLy8gVGhlc2UgYXJlIHBhc3NlZCBkb3duIHRvIHRoZSBqcy1zZGsncyAvam9pbiBjYWxsXG4gICAgICAgICAgICAgICAgdmlhU2VydmVyczogdmlhU2VydmVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlclBsYWNlaG9sZGVyVGV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVwbHlUb0V2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lMmVTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NlbmQgYW4gZW5jcnlwdGVkIHJlcGx54oCmJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnU2VuZCBhIHJlcGx54oCmJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lMmVTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NlbmQgYW4gZW5jcnlwdGVkIG1lc3NhZ2XigKYnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTZW5kIGEgbWVzc2FnZeKApicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRW1vamkoZW1vamkpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJpbnNlcnRfZW1vamlcIixcbiAgICAgICAgICAgIGVtb2ppLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xzID0gW1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tZSA/IDxDb21wb3NlckF2YXRhciBrZXk9XCJjb250cm9sc19hdmF0YXJcIiBtZT17dGhpcy5zdGF0ZS5tZX0gLz4gOiBudWxsLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5lMmVTdGF0dXMgP1xuICAgICAgICAgICAgICAgIDxFMkVJY29uIGtleT1cImUyZUljb25cIiBzdGF0dXM9e3RoaXMucHJvcHMuZTJlU3RhdHVzfSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfZTJlSWNvblwiIC8+IDpcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICBdO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS50b21ic3RvbmUgJiYgdGhpcy5zdGF0ZS5jYW5TZW5kTWVzc2FnZXMpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgYWxzbyBjdXJyZW50bHkgaW5jbHVkZXMgdGhlIGNhbGwgYnV0dG9ucy4gUmVhbGx5IHdlIHNob3VsZFxuICAgICAgICAgICAgLy8gY2hlY2sgc2VwYXJhdGVseSBmb3Igd2hldGhlciB3ZSBjYW4gY2FsbCwgYnV0IHRoaXMgaXMgc2xpZ2h0bHlcbiAgICAgICAgICAgIC8vIGNvbXBsZXggYmVjYXVzZSBvZiBjb25mZXJlbmNlIGNhbGxzLlxuXG4gICAgICAgICAgICBjb25zdCBTZW5kTWVzc2FnZUNvbXBvc2VyID0gc2RrLmdldENvbXBvbmVudChcInJvb21zLlNlbmRNZXNzYWdlQ29tcG9zZXJcIik7XG4gICAgICAgICAgICBjb25zdCBjYWxsSW5Qcm9ncmVzcyA9IHRoaXMucHJvcHMuY2FsbFN0YXRlICYmIHRoaXMucHJvcHMuY2FsbFN0YXRlICE9PSAnZW5kZWQnO1xuXG4gICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICAgIDxTZW5kTWVzc2FnZUNvbXBvc2VyXG4gICAgICAgICAgICAgICAgICAgIHJlZj17KGMpID0+IHRoaXMubWVzc2FnZUNvbXBvc2VySW5wdXQgPSBjfVxuICAgICAgICAgICAgICAgICAgICBrZXk9XCJjb250cm9sc19pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucmVuZGVyUGxhY2Vob2xkZXJUZXh0KCl9XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5wcm9wcy5yZXBseVRvRXZlbnR9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICAgICAgPFVwbG9hZEJ1dHRvbiBrZXk9XCJjb250cm9sc191cGxvYWRcIiByb29tSWQ9e3RoaXMucHJvcHMucm9vbS5yb29tSWR9IC8+LFxuICAgICAgICAgICAgICAgIDxFbW9qaUJ1dHRvbiBrZXk9XCJlbW9qaV9idXR0b25cIiBhZGRFbW9qaT17dGhpcy5hZGRFbW9qaX0gLz4sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuV2lkZ2V0cykgJiZcbiAgICAgICAgICAgICAgICBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuc2hvd1N0aWNrZXJzQnV0dG9uXCIpKSB7XG4gICAgICAgICAgICAgICAgY29udHJvbHMucHVzaCg8U3RpY2tlcnBpY2tlciBrZXk9XCJzdGlja2VycGlja2VyX2NvbnRyb2xzX2J1dHRvblwiIHJvb209e3RoaXMucHJvcHMucm9vbX0gLz4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93Q2FsbEJ1dHRvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5oYXNDb25mZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbkVuZENvbmYgPSBXaWRnZXRVdGlscy5jYW5Vc2VyTW9kaWZ5V2lkZ2V0cyh0aGlzLnByb3BzLnJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxIYW5ndXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJjb250cm9sc19oYW5ndXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZD17dGhpcy5wcm9wcy5yb29tLnJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbmZlcmVuY2U9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuRW5kQ29uZmVyZW5jZT17Y2FuRW5kQ29uZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0luQ29uZmVyZW5jZT17dGhpcy5zdGF0ZS5qb2luZWRDb25mZXJlbmNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYWxsSW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEhhbmd1cEJ1dHRvbiBrZXk9XCJjb250cm9sc19oYW5ndXBcIiByb29tSWQ9e3RoaXMucHJvcHMucm9vbS5yb29tSWR9IGlzQ29uZmVyZW5jZT17ZmFsc2V9IC8+LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICA8Q2FsbEJ1dHRvbiBrZXk9XCJjb250cm9sc19jYWxsXCIgcm9vbUlkPXt0aGlzLnByb3BzLnJvb20ucm9vbUlkfSAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgIDxWaWRlb0NhbGxCdXR0b24ga2V5PVwiY29udHJvbHNfdmlkZW9jYWxsXCIgcm9vbUlkPXt0aGlzLnByb3BzLnJvb20ucm9vbUlkfSAvPixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS50b21ic3RvbmUpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50Um9vbUlkID0gdGhpcy5zdGF0ZS50b21ic3RvbmUuZ2V0Q29udGVudCgpWydyZXBsYWNlbWVudF9yb29tJ107XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRpbnVlc0xpbmsgPSByZXBsYWNlbWVudFJvb21JZCA/IChcbiAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlUm9vbVBlcm1hbGluayhyZXBsYWNlbWVudFJvb21JZCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9yb29tUmVwbGFjZWRfbGlua1wiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uVG9tYnN0b25lQ2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJUaGUgY29udmVyc2F0aW9uIGNvbnRpbnVlcyBoZXJlLlwiKX1cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICApIDogJyc7XG5cbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goPGRpdiBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfcmVwbGFjZWRfd3JhcHBlclwiIGtleT1cInJvb21fcmVwbGFjZWRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9yZXBsYWNlZF92YWxpZ25cIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfcm9vbVJlcGxhY2VkX2ljb25cIiBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3Jvb21fcmVwbGFjZWQuc3ZnXCIpfSAvPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfcm9vbVJlcGxhY2VkX2hlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiVGhpcyByb29tIGhhcyBiZWVuIHJlcGxhY2VkIGFuZCBpcyBubyBsb25nZXIgYWN0aXZlLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPjxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7IGNvbnRpbnVlc0xpbmsgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9XCJjb250cm9sc19lcnJvclwiIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9ub3Blcm1fZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gcG9zdCB0byB0aGlzIHJvb20nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3NlciBteF9Hcm91cExheW91dFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3dyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJlcGx5UHJldmlldyBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3Jvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjb250cm9scyB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5NZXNzYWdlQ29tcG9zZXIucHJvcFR5cGVzID0ge1xuICAgIC8vIGpzLXNkayBSb29tIG9iamVjdFxuICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgIC8vIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgdm9pcCBjYWxsIHN0YXRlXG4gICAgY2FsbFN0YXRlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgLy8gc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCByb29tIGFwcCBkcmF3ZXIgc3RhdGVcbiAgICBzaG93QXBwczogUHJvcFR5cGVzLmJvb2wsXG59O1xuIl19