"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

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

var _AsyncStore = require("../../../stores/AsyncStore");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _VoiceRecordComposerTile = _interopRequireDefault(require("./VoiceRecordComposerTile"));

var _VoiceRecordingStore = require("../../../stores/VoiceRecordingStore");

var _VoiceRecording = require("../../../voice/VoiceRecording");

var _Tooltip = _interopRequireWildcard(require("../elements/Tooltip"));

var _dec, _class, _temp;

function ComposerAvatar(props
/*: IComposerAvatarProps*/
) {
  const MemberStatusMessageAvatar = sdk.getComponent('avatars.MemberStatusMessageAvatar');
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MessageComposer_avatar"
  }, /*#__PURE__*/_react.default.createElement(MemberStatusMessageAvatar, {
    member: props.me,
    width: 24,
    height: 24
  }));
}

function SendButton(props
/*: ISendButtonProps*/
) {
  return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_MessageComposer_sendMessage",
    onClick: props.onClick,
    title: (0, _languageHandler._t)('Send message')
  });
}

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
      managed: false
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

class UploadButton extends _react.default.Component
/*:: <IUploadButtonProps>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "uploadInput", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action === "upload_file") {
        this.onUploadClick();
      }
    });
    (0, _defineProperty2.default)(this, "onUploadClick", () => {
      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        _dispatcher.default.dispatch({
          action: 'require_registration'
        });

        return;
      }

      this.uploadInput.current.click();
    });
    (0, _defineProperty2.default)(this, "onUploadFileInputChange", (ev
    /*: React.ChangeEvent<HTMLInputElement>*/
    ) => {
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
    });
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
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
      ref: this.uploadInput,
      type: "file",
      style: uploadInputStyle,
      multiple: true,
      onChange: this.onUploadFileInputChange
    }));
  }

}

let MessageComposer = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.MessageComposer"), _dec(_class = (_temp = class MessageComposer extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "messageComposerInput", void 0);
    (0, _defineProperty2.default)(this, "voiceRecordingButton", void 0);
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
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
    (0, _defineProperty2.default)(this, "onRoomStateEvents", (ev, state) => {
      if (ev.getRoomId() !== this.props.room.roomId) return;

      if (ev.getType() === 'm.room.tombstone') {
        this.setState({
          tombstone: this.getRoomTombstone()
        });
      }

      if (ev.getType() === 'm.room.power_levels') {
        this.setState({
          canSendMessages: this.props.room.maySendMessage()
        });
      }
    });
    (0, _defineProperty2.default)(this, "onTombstoneClick", ev => {
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
    });
    (0, _defineProperty2.default)(this, "renderPlaceholderText", () => {
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
    });
    (0, _defineProperty2.default)(this, "sendMessage", async () => {
      if (this.state.haveRecording && this.voiceRecordingButton) {
        // There shouldn't be any text message to send when a voice recording is active, so
        // just send out the voice recording.
        await this.voiceRecordingButton.send();
        return;
      } // XXX: Private function access


      this.messageComposerInput._sendMessage();
    });
    (0, _defineProperty2.default)(this, "onChange", model => {
      this.setState({
        isComposerEmpty: model.isEmpty
      });
    });
    (0, _defineProperty2.default)(this, "onVoiceStoreUpdate", () => {
      const recording = _VoiceRecordingStore.VoiceRecordingStore.instance.activeRecording;
      this.setState({
        haveRecording: !!recording
      });

      if (recording) {
        // We show a little heads up that the recording is about to automatically end soon. The 3s
        // display time is completely arbitrary. Note that we don't need to deregister the listener
        // because the recording instance will clean that up for us.
        recording.on(_VoiceRecording.RecordingState.EndingSoon, ({
          secondsLeft
        }) => {
          this.setState({
            recordingTimeLeftSeconds: secondsLeft
          });
          setTimeout(() => this.setState({
            recordingTimeLeftSeconds: null
          }), 3000);
        });
      }
    });

    _VoiceRecordingStore.VoiceRecordingStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onVoiceStoreUpdate);

    this.state = {
      tombstone: this.getRoomTombstone(),
      canSendMessages: this.props.room.maySendMessage(),
      isComposerEmpty: true,
      haveRecording: false,
      recordingTimeLeftSeconds: null // when set to a number, shows a toast

    };
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _MatrixClientPeg.MatrixClientPeg.get().on("RoomState.events", this.onRoomStateEvents);

    this.waitForOwnMember();
  }

  waitForOwnMember() {
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
      _MatrixClientPeg.MatrixClientPeg.get().removeListener("RoomState.events", this.onRoomStateEvents);
    }

    _VoiceRecordingStore.VoiceRecordingStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onVoiceStoreUpdate);

    _dispatcher.default.unregister(this.dispatcherRef);
  }

  getRoomTombstone() {
    return this.props.room.currentState.getStateEvents('m.room.tombstone', '');
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
      const SendMessageComposer = sdk.getComponent("rooms.SendMessageComposer");
      controls.push( /*#__PURE__*/_react.default.createElement(SendMessageComposer, {
        ref: c => this.messageComposerInput = c,
        key: "controls_input",
        room: this.props.room,
        placeholder: this.renderPlaceholderText(),
        resizeNotifier: this.props.resizeNotifier,
        permalinkCreator: this.props.permalinkCreator,
        replyToEvent: this.props.replyToEvent,
        onChange: this.onChange,
        disabled: this.state.haveRecording
      }));

      if (!this.state.haveRecording) {
        controls.push( /*#__PURE__*/_react.default.createElement(UploadButton, {
          key: "controls_upload",
          roomId: this.props.room.roomId
        }), /*#__PURE__*/_react.default.createElement(EmojiButton, {
          key: "emoji_button",
          addEmoji: this.addEmoji
        }));
      }

      if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets) && _SettingsStore.default.getValue("MessageComposerInput.showStickersButton") && !this.state.haveRecording) {
        controls.push( /*#__PURE__*/_react.default.createElement(_Stickerpicker.default, {
          key: "stickerpicker_controls_button",
          room: this.props.room
        }));
      }

      if (_SettingsStore.default.getValue("feature_voice_messages")) {
        controls.push( /*#__PURE__*/_react.default.createElement(_VoiceRecordComposerTile.default, {
          key: "controls_voice_record",
          ref: c => this.voiceRecordingButton = c,
          room: this.props.room
        }));
      }

      if (!this.state.isComposerEmpty || this.state.haveRecording) {
        controls.push( /*#__PURE__*/_react.default.createElement(SendButton, {
          key: "controls_send",
          onClick: this.sendMessage
        }));
      }
    } else if (this.state.tombstone) {
      const replacementRoomId = this.state.tombstone.getContent()['replacement_room'];
      const continuesLink = replacementRoomId ? /*#__PURE__*/_react.default.createElement("a", {
        href: (0, _Permalinks.makeRoomPermalink)(replacementRoomId),
        className: "mx_MessageComposer_roomReplaced_link",
        onClick: this.onTombstoneClick
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

    let recordingTooltip;
    const secondsLeft = Math.round(this.state.recordingTimeLeftSeconds);

    if (secondsLeft) {
      recordingTooltip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
        label: (0, _languageHandler._t)("%(seconds)ss left", {
          seconds: secondsLeft
        }),
        alignment: _Tooltip.Alignment.Top,
        yOffset: -50
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer mx_GroupLayout"
    }, recordingTooltip, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer_wrapper"
    }, /*#__PURE__*/_react.default.createElement(_ReplyPreview.default, {
      permalinkCreator: this.props.permalinkCreator
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer_row"
    }, controls)));
  }

}, _temp)) || _class);
exports.default = MessageComposer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL01lc3NhZ2VDb21wb3Nlci50c3giXSwibmFtZXMiOlsiQ29tcG9zZXJBdmF0YXIiLCJwcm9wcyIsIk1lbWJlclN0YXR1c01lc3NhZ2VBdmF0YXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJtZSIsIlNlbmRCdXR0b24iLCJvbkNsaWNrIiwiRW1vamlCdXR0b24iLCJhZGRFbW9qaSIsIm1lbnVEaXNwbGF5ZWQiLCJidXR0b24iLCJvcGVuTWVudSIsImNsb3NlTWVudSIsImNvbnRleHRNZW51IiwiYnV0dG9uUmVjdCIsImN1cnJlbnQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJFbW9qaVBpY2tlciIsImNsYXNzTmFtZSIsIlVwbG9hZEJ1dHRvbiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJjcmVhdGVSZWYiLCJwYXlsb2FkIiwiYWN0aW9uIiwib25VcGxvYWRDbGljayIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlzR3Vlc3QiLCJkaXMiLCJkaXNwYXRjaCIsInVwbG9hZElucHV0IiwiY2xpY2siLCJldiIsInRhcmdldCIsImZpbGVzIiwibGVuZ3RoIiwidGZpbGVzIiwiaSIsInB1c2giLCJDb250ZW50TWVzc2FnZXMiLCJzaGFyZWRJbnN0YW5jZSIsInNlbmRDb250ZW50TGlzdFRvUm9vbSIsInJvb21JZCIsInZhbHVlIiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW5kZXIiLCJ1cGxvYWRJbnB1dFN0eWxlIiwiZGlzcGxheSIsIm9uVXBsb2FkRmlsZUlucHV0Q2hhbmdlIiwiTWVzc2FnZUNvbXBvc2VyIiwic2V0VGltZW91dCIsInJlc2l6ZU5vdGlmaWVyIiwibm90aWZ5VGltZWxpbmVIZWlnaHRDaGFuZ2VkIiwic3RhdGUiLCJnZXRSb29tSWQiLCJyb29tIiwiZ2V0VHlwZSIsInNldFN0YXRlIiwidG9tYnN0b25lIiwiZ2V0Um9vbVRvbWJzdG9uZSIsImNhblNlbmRNZXNzYWdlcyIsIm1heVNlbmRNZXNzYWdlIiwicHJldmVudERlZmF1bHQiLCJyZXBsYWNlbWVudFJvb21JZCIsImdldENvbnRlbnQiLCJyZXBsYWNlbWVudFJvb20iLCJnZXRSb29tIiwiY3JlYXRlRXZlbnRJZCIsImNyZWF0ZUV2ZW50IiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJnZXRJZCIsInZpYVNlcnZlcnMiLCJnZXRTZW5kZXIiLCJzcGxpdCIsInNwbGljZSIsImpvaW4iLCJoaWdobGlnaHRlZCIsImV2ZW50X2lkIiwicm9vbV9pZCIsImF1dG9fam9pbiIsIl90eXBlIiwidmlhX3NlcnZlcnMiLCJvcHRzIiwicmVwbHlUb0V2ZW50IiwiZTJlU3RhdHVzIiwiaGF2ZVJlY29yZGluZyIsInZvaWNlUmVjb3JkaW5nQnV0dG9uIiwic2VuZCIsIm1lc3NhZ2VDb21wb3NlcklucHV0IiwiX3NlbmRNZXNzYWdlIiwibW9kZWwiLCJpc0NvbXBvc2VyRW1wdHkiLCJpc0VtcHR5IiwicmVjb3JkaW5nIiwiVm9pY2VSZWNvcmRpbmdTdG9yZSIsImluc3RhbmNlIiwiYWN0aXZlUmVjb3JkaW5nIiwib24iLCJSZWNvcmRpbmdTdGF0ZSIsIkVuZGluZ1Nvb24iLCJzZWNvbmRzTGVmdCIsInJlY29yZGluZ1RpbWVMZWZ0U2Vjb25kcyIsIlVQREFURV9FVkVOVCIsIm9uVm9pY2VTdG9yZVVwZGF0ZSIsImNvbXBvbmVudERpZE1vdW50Iiwib25Sb29tU3RhdGVFdmVudHMiLCJ3YWl0Rm9yT3duTWVtYmVyIiwiZ2V0TWVtYmVyIiwiZ2V0VXNlcklkIiwibG9hZE1lbWJlcnNJZk5lZWRlZCIsInRoZW4iLCJyZW1vdmVMaXN0ZW5lciIsIm9mZiIsImVtb2ppIiwiY29udHJvbHMiLCJTZW5kTWVzc2FnZUNvbXBvc2VyIiwiYyIsInJlbmRlclBsYWNlaG9sZGVyVGV4dCIsInBlcm1hbGlua0NyZWF0b3IiLCJvbkNoYW5nZSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIldpZGdldHMiLCJzZW5kTWVzc2FnZSIsImNvbnRpbnVlc0xpbmsiLCJvblRvbWJzdG9uZUNsaWNrIiwicmVxdWlyZSIsInJlY29yZGluZ1Rvb2x0aXAiLCJNYXRoIiwicm91bmQiLCJzZWNvbmRzIiwiQWxpZ25tZW50IiwiVG9wIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFlQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFJQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQVNBLFNBQVNBLGNBQVQsQ0FBd0JDO0FBQXhCO0FBQUEsRUFBcUQ7QUFDakQsUUFBTUMseUJBQXlCLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixtQ0FBakIsQ0FBbEM7QUFDQSxzQkFBTztBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsa0JBQ0gsNkJBQUMseUJBQUQ7QUFBMkIsSUFBQSxNQUFNLEVBQUVILEtBQUssQ0FBQ0ksRUFBekM7QUFBNkMsSUFBQSxLQUFLLEVBQUUsRUFBcEQ7QUFBd0QsSUFBQSxNQUFNLEVBQUU7QUFBaEUsSUFERyxDQUFQO0FBR0g7O0FBTUQsU0FBU0MsVUFBVCxDQUFvQkw7QUFBcEI7QUFBQSxFQUE2QztBQUN6QyxzQkFDSSw2QkFBQyxnQ0FBRDtBQUNJLElBQUEsU0FBUyxFQUFDLGdDQURkO0FBRUksSUFBQSxPQUFPLEVBQUVBLEtBQUssQ0FBQ00sT0FGbkI7QUFHSSxJQUFBLEtBQUssRUFBRSx5QkFBRyxjQUFIO0FBSFgsSUFESjtBQU9IOztBQUVELE1BQU1DLFdBQVcsR0FBRyxDQUFDO0FBQUNDLEVBQUFBO0FBQUQsQ0FBRCxLQUFnQjtBQUNoQyxRQUFNLENBQUNDLGFBQUQsRUFBZ0JDLE1BQWhCLEVBQXdCQyxRQUF4QixFQUFrQ0MsU0FBbEMsSUFBK0Msa0NB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QixDQUFwQjs7QUFDQSxRQUFJRCxXQUFKLEVBQWlCO0FBQ2I0QixNQUFBQSxnQkFBZ0IsZ0JBQUcsNkJBQUMsZ0JBQUQ7QUFDZixRQUFBLEtBQUssRUFBRSx5QkFBRyxtQkFBSCxFQUF3QjtBQUFDRyxVQUFBQSxPQUFPLEVBQUUvQjtBQUFWLFNBQXhCLENBRFE7QUFFZixRQUFBLFNBQVMsRUFBRWdDLG1CQUFVQyxHQUZOO0FBRVcsUUFBQSxPQUFPLEVBQUUsQ0FBQztBQUZyQixRQUFuQjtBQUlIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLTCxnQkFETCxlQUVJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSw2QkFBQyxxQkFBRDtBQUFjLE1BQUEsZ0JBQWdCLEVBQUUsS0FBS3ZJLEtBQUwsQ0FBVzZIO0FBQTNDLE1BREosZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTUosUUFETixDQUZKLENBRkosQ0FESjtBQVdIOztBQXJRd0UsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7TWF0cml4RXZlbnR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge1Jvb21NZW1iZXJ9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IFN0aWNrZXJwaWNrZXIgZnJvbSAnLi9TdGlja2VycGlja2VyJztcbmltcG9ydCB7IG1ha2VSb29tUGVybWFsaW5rLCBSb29tUGVybWFsaW5rQ3JlYXRvciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rcyc7XG5pbXBvcnQgQ29udGVudE1lc3NhZ2VzIGZyb20gJy4uLy4uLy4uL0NvbnRlbnRNZXNzYWdlcyc7XG5pbXBvcnQgRTJFSWNvbiBmcm9tICcuL0UyRUljb24nO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7YWJvdmVMZWZ0T2YsIENvbnRleHRNZW51LCBDb250ZXh0TWVudVRvb2x0aXBCdXR0b24sIHVzZUNvbnRleHRNZW51fSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IFJlcGx5UHJldmlldyBmcm9tIFwiLi9SZXBseVByZXZpZXdcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge1VQREFURV9FVkVOVH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcbmltcG9ydCBWb2ljZVJlY29yZENvbXBvc2VyVGlsZSBmcm9tIFwiLi9Wb2ljZVJlY29yZENvbXBvc2VyVGlsZVwiO1xuaW1wb3J0IHtWb2ljZVJlY29yZGluZ1N0b3JlfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1ZvaWNlUmVjb3JkaW5nU3RvcmVcIjtcbmltcG9ydCB7UmVjb3JkaW5nU3RhdGV9IGZyb20gXCIuLi8uLi8uLi92b2ljZS9Wb2ljZVJlY29yZGluZ1wiO1xuaW1wb3J0IFRvb2x0aXAsIHtBbGlnbm1lbnR9IGZyb20gXCIuLi9lbGVtZW50cy9Ub29sdGlwXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgeyBFMkVTdGF0dXMgfSBmcm9tICcuLi8uLi8uLi91dGlscy9TaGllbGRVdGlscyc7XG5pbXBvcnQgU2VuZE1lc3NhZ2VDb21wb3NlciBmcm9tIFwiLi9TZW5kTWVzc2FnZUNvbXBvc2VyXCI7XG5cbmludGVyZmFjZSBJQ29tcG9zZXJBdmF0YXJQcm9wcyB7XG4gICAgbWU6IG9iamVjdDtcbn1cblxuZnVuY3Rpb24gQ29tcG9zZXJBdmF0YXIocHJvcHM6IElDb21wb3NlckF2YXRhclByb3BzKSB7XG4gICAgY29uc3QgTWVtYmVyU3RhdHVzTWVzc2FnZUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoJ2F2YXRhcnMuTWVtYmVyU3RhdHVzTWVzc2FnZUF2YXRhcicpO1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9hdmF0YXJcIj5cbiAgICAgICAgPE1lbWJlclN0YXR1c01lc3NhZ2VBdmF0YXIgbWVtYmVyPXtwcm9wcy5tZX0gd2lkdGg9ezI0fSBoZWlnaHQ9ezI0fSAvPlxuICAgIDwvZGl2Pjtcbn1cblxuaW50ZXJmYWNlIElTZW5kQnV0dG9uUHJvcHMge1xuICAgIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59XG5cbmZ1bmN0aW9uIFNlbmRCdXR0b24ocHJvcHM6IElTZW5kQnV0dG9uUHJvcHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9zZW5kTWVzc2FnZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXtwcm9wcy5vbkNsaWNrfVxuICAgICAgICAgICAgdGl0bGU9e190KCdTZW5kIG1lc3NhZ2UnKX1cbiAgICAgICAgLz5cbiAgICApO1xufVxuXG5jb25zdCBFbW9qaUJ1dHRvbiA9ICh7YWRkRW1vaml9KSA9PiB7XG4gICAgY29uc3QgW21lbnVEaXNwbGF5ZWQsIGJ1dHRvbiwgb3Blbk1lbnUsIGNsb3NlTWVudV0gPSB1c2VDb250ZXh0TWVudSgpO1xuXG4gICAgbGV0IGNvbnRleHRNZW51O1xuICAgIGlmIChtZW51RGlzcGxheWVkKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvblJlY3QgPSBidXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgRW1vamlQaWNrZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbW9qaXBpY2tlci5FbW9qaVBpY2tlcicpO1xuICAgICAgICBjb250ZXh0TWVudSA9IDxDb250ZXh0TWVudSB7Li4uYWJvdmVMZWZ0T2YoYnV0dG9uUmVjdCl9IG9uRmluaXNoZWQ9e2Nsb3NlTWVudX0gbWFuYWdlZD17ZmFsc2V9PlxuICAgICAgICAgICAgPEVtb2ppUGlja2VyIG9uQ2hvb3NlPXthZGRFbW9qaX0gc2hvd1F1aWNrUmVhY3Rpb25zPXt0cnVlfSAvPlxuICAgICAgICA8L0NvbnRleHRNZW51PjtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKFxuICAgICAgICBcIm14X01lc3NhZ2VDb21wb3Nlcl9idXR0b25cIixcbiAgICAgICAgXCJteF9NZXNzYWdlQ29tcG9zZXJfZW1vamlcIixcbiAgICAgICAge1xuICAgICAgICAgICAgXCJteF9NZXNzYWdlQ29tcG9zZXJfYnV0dG9uX2hpZ2hsaWdodFwiOiBtZW51RGlzcGxheWVkLFxuICAgICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBUT0RPOiByZXBsYWNlIENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiB3aXRoIGEgdW5pZmllZCByZXByZXNlbnRhdGlvbiBvZlxuICAgIC8vIHRoZSBoZWFkZXIgYnV0dG9ucyBhbmQgdGhlIHJpZ2h0IHBhbmVsIGJ1dHRvbnNcbiAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5NZW51fVxuICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIHRpdGxlPXtfdCgnRW1vamkgcGlja2VyJyl9XG4gICAgICAgICAgICBpbnB1dFJlZj17YnV0dG9ufVxuICAgICAgICA+XG5cbiAgICAgICAgPC9Db250ZXh0TWVudVRvb2x0aXBCdXR0b24+XG5cbiAgICAgICAgeyBjb250ZXh0TWVudSB9XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG5pbnRlcmZhY2UgSVVwbG9hZEJ1dHRvblByb3BzIHtcbiAgICByb29tSWQ6IHN0cmluZztcbn1cblxuY2xhc3MgVXBsb2FkQnV0dG9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElVcGxvYWRCdXR0b25Qcm9wcz4ge1xuICAgIHByaXZhdGUgdXBsb2FkSW5wdXQgPSBSZWFjdC5jcmVhdGVSZWY8SFRNTElucHV0RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gXCJ1cGxvYWRfZmlsZVwiKSB7XG4gICAgICAgICAgICB0aGlzLm9uVXBsb2FkQ2xpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXBsb2FkQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3JlcXVpcmVfcmVnaXN0cmF0aW9uJ30pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBsb2FkSW5wdXQuY3VycmVudC5jbGljaygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25VcGxvYWRGaWxlSW5wdXRDaGFuZ2UgPSAoZXY6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGlmIChldi50YXJnZXQuZmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgLy8gdGFrZSBhIGNvcHkgc28gd2UgY2FuIHNhZmVseSByZXNldCB0aGUgdmFsdWUgb2YgdGhlIGZvcm0gY29udHJvbFxuICAgICAgICAvLyAoTm90ZSBpdCBpcyBhIEZpbGVMaXN0OiB3ZSBjYW4ndCB1c2Ugc2xpY2Ugb3Igc2Vuc2libGUgaXRlcmF0aW9uKS5cbiAgICAgICAgY29uc3QgdGZpbGVzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXYudGFyZ2V0LmZpbGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB0ZmlsZXMucHVzaChldi50YXJnZXQuZmlsZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgdGZpbGVzLCB0aGlzLnByb3BzLnJvb21JZCwgTWF0cml4Q2xpZW50UGVnLmdldCgpLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIG9uQ2hhbmdlIGhhbmRsZXIgZm9yIGEgZmlsZSBmb3JtIGNvbnRyb2wsIGJ1dCB3ZSdyZVxuICAgICAgICAvLyBub3Qga2VlcGluZyBhbnkgc3RhdGUsIHNvIHJlc2V0IHRoZSB2YWx1ZSBvZiB0aGUgZm9ybSBjb250cm9sXG4gICAgICAgIC8vIHRvIGVtcHR5LlxuICAgICAgICAvLyBOQi4gd2UgbmVlZCB0byBzZXQgJ3ZhbHVlJzogdGhlICdmaWxlcycgcHJvcGVydHkgaXMgaW1tdXRhYmxlLlxuICAgICAgICBldi50YXJnZXQudmFsdWUgPSAnJztcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHVwbG9hZElucHV0U3R5bGUgPSB7ZGlzcGxheTogJ25vbmUnfTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9idXR0b24gbXhfTWVzc2FnZUNvbXBvc2VyX3VwbG9hZFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblVwbG9hZENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnVXBsb2FkIGZpbGUnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnVwbG9hZElucHV0fVxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt1cGxvYWRJbnB1dFN0eWxlfVxuICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVwbG9hZEZpbGVJbnB1dENoYW5nZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIHBlcm1hbGlua0NyZWF0b3I6IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIHJlcGx5VG9FdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIGUyZVN0YXR1cz86IEUyRVN0YXR1cztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdG9tYnN0b25lOiBNYXRyaXhFdmVudDtcbiAgICBjYW5TZW5kTWVzc2FnZXM6IGJvb2xlYW47XG4gICAgaXNDb21wb3NlckVtcHR5OiBib29sZWFuO1xuICAgIGhhdmVSZWNvcmRpbmc6IGJvb2xlYW47XG4gICAgcmVjb3JkaW5nVGltZUxlZnRTZWNvbmRzPzogbnVtYmVyO1xuICAgIG1lPzogUm9vbU1lbWJlcjtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Mucm9vbXMuTWVzc2FnZUNvbXBvc2VyXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlQ29tcG9zZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIG1lc3NhZ2VDb21wb3NlcklucHV0OiBTZW5kTWVzc2FnZUNvbXBvc2VyO1xuICAgIHByaXZhdGUgdm9pY2VSZWNvcmRpbmdCdXR0b246IFZvaWNlUmVjb3JkQ29tcG9zZXJUaWxlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICBWb2ljZVJlY29yZGluZ1N0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vblZvaWNlU3RvcmVVcGRhdGUpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB0b21ic3RvbmU6IHRoaXMuZ2V0Um9vbVRvbWJzdG9uZSgpLFxuICAgICAgICAgICAgY2FuU2VuZE1lc3NhZ2VzOiB0aGlzLnByb3BzLnJvb20ubWF5U2VuZE1lc3NhZ2UoKSxcbiAgICAgICAgICAgIGlzQ29tcG9zZXJFbXB0eTogdHJ1ZSxcbiAgICAgICAgICAgIGhhdmVSZWNvcmRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgcmVjb3JkaW5nVGltZUxlZnRTZWNvbmRzOiBudWxsLCAvLyB3aGVuIHNldCB0byBhIG51bWJlciwgc2hvd3MgYSB0b2FzdFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcIlJvb21TdGF0ZS5ldmVudHNcIiwgdGhpcy5vblJvb21TdGF0ZUV2ZW50cyk7XG4gICAgICAgIHRoaXMud2FpdEZvck93bk1lbWJlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdyZXBseV90b19ldmVudCcpIHtcbiAgICAgICAgICAgIC8vIGFkZCBhIHRpbWVvdXQgZm9yIHRoZSByZXBseSBwcmV2aWV3IHRvIGJlIHJlbmRlcmVkLCBzb1xuICAgICAgICAgICAgLy8gdGhhdCB0aGUgU2Nyb2xsUGFuZWwgbGlzdGVuaW5nIHRvIHRoZSByZXNpemVOb3RpZmllciBjYW5cbiAgICAgICAgICAgIC8vIGNvcnJlY3RseSBtZWFzdXJlIGl0J3MgbmV3IGhlaWdodCBhbmQgc2Nyb2xsIGRvd24gdG8ga2VlcFxuICAgICAgICAgICAgLy8gYXQgdGhlIGJvdHRvbSBpZiBpdCBhbHJlYWR5IGlzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLm5vdGlmeVRpbWVsaW5lSGVpZ2h0Q2hhbmdlZCgpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHdhaXRGb3JPd25NZW1iZXIoKSB7XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgdGhlIG1lbWJlciBhbHJlYWR5LCBkbyB0aGF0XG4gICAgICAgIGNvbnN0IG1lID0gdGhpcy5wcm9wcy5yb29tLmdldE1lbWJlcihNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCkpO1xuICAgICAgICBpZiAobWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe21lfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3YWl0IGZvciBtZW1iZXIgbG9hZGluZyB0byBmaW5pc2ggYW5kIHRoZW4gdXBkYXRlIHRoZSBtZW1iZXIgZm9yIHRoZSBhdmF0YXIuXG4gICAgICAgIC8vIFRoZSBtZW1iZXJzIHNob3VsZCBhbHJlYWR5IGJlIGxvYWRpbmcsIGFuZCBsb2FkTWVtYmVyc0lmTmVlZGVkXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHRoZSBwcm9taXNlIGZvciB0aGUgZXhpc3Rpbmcgb3BlcmF0aW9uXG4gICAgICAgIHRoaXMucHJvcHMucm9vbS5sb2FkTWVtYmVyc0lmTmVlZGVkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXMucHJvcHMucm9vbS5nZXRNZW1iZXIoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe21lfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMub25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICB9XG4gICAgICAgIFZvaWNlUmVjb3JkaW5nU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vblZvaWNlU3RvcmVVcGRhdGUpO1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVFdmVudHMgPSAoZXYsIHN0YXRlKSA9PiB7XG4gICAgICAgIGlmIChldi5nZXRSb29tSWQoKSAhPT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09ICdtLnJvb20udG9tYnN0b25lJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dG9tYnN0b25lOiB0aGlzLmdldFJvb21Ub21ic3RvbmUoKX0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09ICdtLnJvb20ucG93ZXJfbGV2ZWxzJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y2FuU2VuZE1lc3NhZ2VzOiB0aGlzLnByb3BzLnJvb20ubWF5U2VuZE1lc3NhZ2UoKX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSb29tVG9tYnN0b25lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLnRvbWJzdG9uZScsICcnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVG9tYnN0b25lQ2xpY2sgPSAoZXYpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCByZXBsYWNlbWVudFJvb21JZCA9IHRoaXMuc3RhdGUudG9tYnN0b25lLmdldENvbnRlbnQoKVsncmVwbGFjZW1lbnRfcm9vbSddO1xuICAgICAgICBjb25zdCByZXBsYWNlbWVudFJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyZXBsYWNlbWVudFJvb21JZCk7XG4gICAgICAgIGxldCBjcmVhdGVFdmVudElkID0gbnVsbDtcbiAgICAgICAgaWYgKHJlcGxhY2VtZW50Um9vbSkge1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlRXZlbnQgPSByZXBsYWNlbWVudFJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20uY3JlYXRlJywgJycpO1xuICAgICAgICAgICAgaWYgKGNyZWF0ZUV2ZW50ICYmIGNyZWF0ZUV2ZW50LmdldElkKCkpIGNyZWF0ZUV2ZW50SWQgPSBjcmVhdGVFdmVudC5nZXRJZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmlhU2VydmVycyA9IFt0aGlzLnN0YXRlLnRvbWJzdG9uZS5nZXRTZW5kZXIoKS5zcGxpdCgnOicpLnNwbGljZSgxKS5qb2luKCc6JyldO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkOiB0cnVlLFxuICAgICAgICAgICAgZXZlbnRfaWQ6IGNyZWF0ZUV2ZW50SWQsXG4gICAgICAgICAgICByb29tX2lkOiByZXBsYWNlbWVudFJvb21JZCxcbiAgICAgICAgICAgIGF1dG9fam9pbjogdHJ1ZSxcbiAgICAgICAgICAgIF90eXBlOiBcInRvbWJzdG9uZVwiLCAvLyBpbnN0cnVtZW50YXRpb25cblxuICAgICAgICAgICAgLy8gVHJ5IHRvIGpvaW4gdmlhIHRoZSBzZXJ2ZXIgdGhhdCBzZW50IHRoZSBldmVudC4gVGhpcyBjb252ZXJ0cyBAc29tZXRoaW5nOmV4YW1wbGUub3JnXG4gICAgICAgICAgICAvLyBpbnRvIGEgc2VydmVyIGRvbWFpbiBieSBzcGxpdHRpbmcgb24gY29sb25zIGFuZCBpZ25vcmluZyB0aGUgZmlyc3QgZW50cnkgKFwiQHNvbWV0aGluZ1wiKS5cbiAgICAgICAgICAgIHZpYV9zZXJ2ZXJzOiB2aWFTZXJ2ZXJzLFxuICAgICAgICAgICAgb3B0czoge1xuICAgICAgICAgICAgICAgIC8vIFRoZXNlIGFyZSBwYXNzZWQgZG93biB0byB0aGUganMtc2RrJ3MgL2pvaW4gY2FsbFxuICAgICAgICAgICAgICAgIHZpYVNlcnZlcnM6IHZpYVNlcnZlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclBsYWNlaG9sZGVyVGV4dCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVwbHlUb0V2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lMmVTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NlbmQgYW4gZW5jcnlwdGVkIHJlcGx54oCmJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnU2VuZCBhIHJlcGx54oCmJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lMmVTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NlbmQgYW4gZW5jcnlwdGVkIG1lc3NhZ2XigKYnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTZW5kIGEgbWVzc2FnZeKApicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRW1vamkoZW1vamkpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJpbnNlcnRfZW1vamlcIixcbiAgICAgICAgICAgIGVtb2ppLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZW5kTWVzc2FnZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGF2ZVJlY29yZGluZyAmJiB0aGlzLnZvaWNlUmVjb3JkaW5nQnV0dG9uKSB7XG4gICAgICAgICAgICAvLyBUaGVyZSBzaG91bGRuJ3QgYmUgYW55IHRleHQgbWVzc2FnZSB0byBzZW5kIHdoZW4gYSB2b2ljZSByZWNvcmRpbmcgaXMgYWN0aXZlLCBzb1xuICAgICAgICAgICAgLy8ganVzdCBzZW5kIG91dCB0aGUgdm9pY2UgcmVjb3JkaW5nLlxuICAgICAgICAgICAgYXdhaXQgdGhpcy52b2ljZVJlY29yZGluZ0J1dHRvbi5zZW5kKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBYWFg6IFByaXZhdGUgZnVuY3Rpb24gYWNjZXNzXG4gICAgICAgIHRoaXMubWVzc2FnZUNvbXBvc2VySW5wdXQuX3NlbmRNZXNzYWdlKCk7XG4gICAgfVxuXG4gICAgb25DaGFuZ2UgPSAobW9kZWwpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc0NvbXBvc2VyRW1wdHk6IG1vZGVsLmlzRW1wdHksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Wb2ljZVN0b3JlVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCByZWNvcmRpbmcgPSBWb2ljZVJlY29yZGluZ1N0b3JlLmluc3RhbmNlLmFjdGl2ZVJlY29yZGluZztcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGF2ZVJlY29yZGluZzogISFyZWNvcmRpbmd9KTtcbiAgICAgICAgaWYgKHJlY29yZGluZykge1xuICAgICAgICAgICAgLy8gV2Ugc2hvdyBhIGxpdHRsZSBoZWFkcyB1cCB0aGF0IHRoZSByZWNvcmRpbmcgaXMgYWJvdXQgdG8gYXV0b21hdGljYWxseSBlbmQgc29vbi4gVGhlIDNzXG4gICAgICAgICAgICAvLyBkaXNwbGF5IHRpbWUgaXMgY29tcGxldGVseSBhcmJpdHJhcnkuIE5vdGUgdGhhdCB3ZSBkb24ndCBuZWVkIHRvIGRlcmVnaXN0ZXIgdGhlIGxpc3RlbmVyXG4gICAgICAgICAgICAvLyBiZWNhdXNlIHRoZSByZWNvcmRpbmcgaW5zdGFuY2Ugd2lsbCBjbGVhbiB0aGF0IHVwIGZvciB1cy5cbiAgICAgICAgICAgIHJlY29yZGluZy5vbihSZWNvcmRpbmdTdGF0ZS5FbmRpbmdTb29uLCAoe3NlY29uZHNMZWZ0fSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3JlY29yZGluZ1RpbWVMZWZ0U2Vjb25kczogc2Vjb25kc0xlZnR9KTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2V0U3RhdGUoe3JlY29yZGluZ1RpbWVMZWZ0U2Vjb25kczogbnVsbH0pLCAzMDAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY29udHJvbHMgPSBbXG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1lID8gPENvbXBvc2VyQXZhdGFyIGtleT1cImNvbnRyb2xzX2F2YXRhclwiIG1lPXt0aGlzLnN0YXRlLm1lfSAvPiA6IG51bGwsXG4gICAgICAgICAgICB0aGlzLnByb3BzLmUyZVN0YXR1cyA/XG4gICAgICAgICAgICAgICAgPEUyRUljb24ga2V5PVwiZTJlSWNvblwiIHN0YXR1cz17dGhpcy5wcm9wcy5lMmVTdGF0dXN9IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9lMmVJY29uXCIgLz4gOlxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnRvbWJzdG9uZSAmJiB0aGlzLnN0YXRlLmNhblNlbmRNZXNzYWdlcykge1xuICAgICAgICAgICAgY29uc3QgU2VuZE1lc3NhZ2VDb21wb3NlciA9IHNkay5nZXRDb21wb25lbnQoXCJyb29tcy5TZW5kTWVzc2FnZUNvbXBvc2VyXCIpO1xuXG4gICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICAgIDxTZW5kTWVzc2FnZUNvbXBvc2VyXG4gICAgICAgICAgICAgICAgICAgIHJlZj17KGMpID0+IHRoaXMubWVzc2FnZUNvbXBvc2VySW5wdXQgPSBjfVxuICAgICAgICAgICAgICAgICAgICBrZXk9XCJjb250cm9sc19pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucmVuZGVyUGxhY2Vob2xkZXJUZXh0KCl9XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5wcm9wcy5yZXBseVRvRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5oYXZlUmVjb3JkaW5nfVxuICAgICAgICAgICAgICAgIC8+LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmhhdmVSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8VXBsb2FkQnV0dG9uIGtleT1cImNvbnRyb2xzX3VwbG9hZFwiIHJvb21JZD17dGhpcy5wcm9wcy5yb29tLnJvb21JZH0gLz4sXG4gICAgICAgICAgICAgICAgICAgIDxFbW9qaUJ1dHRvbiBrZXk9XCJlbW9qaV9idXR0b25cIiBhZGRFbW9qaT17dGhpcy5hZGRFbW9qaX0gLz4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLldpZGdldHMpICYmXG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIk1lc3NhZ2VDb21wb3NlcklucHV0LnNob3dTdGlja2Vyc0J1dHRvblwiKSAmJlxuICAgICAgICAgICAgICAgICF0aGlzLnN0YXRlLmhhdmVSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgICAgICBjb250cm9scy5wdXNoKDxTdGlja2VycGlja2VyIGtleT1cInN0aWNrZXJwaWNrZXJfY29udHJvbHNfYnV0dG9uXCIgcm9vbT17dGhpcy5wcm9wcy5yb29tfSAvPik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV92b2ljZV9tZXNzYWdlc1wiKSkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goPFZvaWNlUmVjb3JkQ29tcG9zZXJUaWxlXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImNvbnRyb2xzX3ZvaWNlX3JlY29yZFwiXG4gICAgICAgICAgICAgICAgICAgIHJlZj17YyA9PiB0aGlzLnZvaWNlUmVjb3JkaW5nQnV0dG9uID0gY31cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfSAvPik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbXBvc2VyRW1wdHkgfHwgdGhpcy5zdGF0ZS5oYXZlUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICAgICAgY29udHJvbHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgPFNlbmRCdXR0b24ga2V5PVwiY29udHJvbHNfc2VuZFwiIG9uQ2xpY2s9e3RoaXMuc2VuZE1lc3NhZ2V9IC8+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS50b21ic3RvbmUpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50Um9vbUlkID0gdGhpcy5zdGF0ZS50b21ic3RvbmUuZ2V0Q29udGVudCgpWydyZXBsYWNlbWVudF9yb29tJ107XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRpbnVlc0xpbmsgPSByZXBsYWNlbWVudFJvb21JZCA/IChcbiAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlUm9vbVBlcm1hbGluayhyZXBsYWNlbWVudFJvb21JZCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9yb29tUmVwbGFjZWRfbGlua1wiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Ub21ic3RvbmVDbGlja31cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlRoZSBjb252ZXJzYXRpb24gY29udGludWVzIGhlcmUuXCIpfVxuICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICkgOiAnJztcblxuICAgICAgICAgICAgY29udHJvbHMucHVzaCg8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9yZXBsYWNlZF93cmFwcGVyXCIga2V5PVwicm9vbV9yZXBsYWNlZFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3JlcGxhY2VkX3ZhbGlnblwiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9yb29tUmVwbGFjZWRfaWNvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3Jvb21fcmVwbGFjZWQuc3ZnXCIpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfcm9vbVJlcGxhY2VkX2hlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiVGhpcyByb29tIGhhcyBiZWVuIHJlcGxhY2VkIGFuZCBpcyBubyBsb25nZXIgYWN0aXZlLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPjxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7IGNvbnRpbnVlc0xpbmsgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9XCJjb250cm9sc19lcnJvclwiIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9ub3Blcm1fZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gcG9zdCB0byB0aGlzIHJvb20nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZWNvcmRpbmdUb29sdGlwO1xuICAgICAgICBjb25zdCBzZWNvbmRzTGVmdCA9IE1hdGgucm91bmQodGhpcy5zdGF0ZS5yZWNvcmRpbmdUaW1lTGVmdFNlY29uZHMpO1xuICAgICAgICBpZiAoc2Vjb25kc0xlZnQpIHtcbiAgICAgICAgICAgIHJlY29yZGluZ1Rvb2x0aXAgPSA8VG9vbHRpcFxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIiUoc2Vjb25kcylzcyBsZWZ0XCIsIHtzZWNvbmRzOiBzZWNvbmRzTGVmdH0pfVxuICAgICAgICAgICAgICAgIGFsaWdubWVudD17QWxpZ25tZW50LlRvcH0geU9mZnNldD17LTUwfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXIgbXhfR3JvdXBMYXlvdXRcIj5cbiAgICAgICAgICAgICAgICB7cmVjb3JkaW5nVG9vbHRpcH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl93cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxSZXBseVByZXZpZXcgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfSAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY29udHJvbHMgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==