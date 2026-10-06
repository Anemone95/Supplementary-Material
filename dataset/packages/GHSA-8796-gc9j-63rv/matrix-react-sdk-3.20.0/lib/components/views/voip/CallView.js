"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _CallHandler = _interopRequireDefault(require("../../../CallHandler"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _VideoFeed = _interopRequireWildcard(require("./VideoFeed"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _call = require("matrix-js-sdk/src/webrtc/call");

var _classnames = _interopRequireDefault(require("classnames"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Keyboard = require("../../../Keyboard");

var _ContextMenu = require("../../structures/ContextMenu");

var _CallContextMenu = _interopRequireDefault(require("../context_menus/CallContextMenu"));

var _Avatar = require("../../../Avatar");

var _DialpadContextMenu = _interopRequireDefault(require("../context_menus/DialpadContextMenu"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

function getFullScreenElement() {
  return document.fullscreenElement || // moz omitted because firefox supports this unprefixed now (webkit here for safari)
  document.webkitFullscreenElement || document.msFullscreenElement;
}

function requestFullscreen(element
/*: Element*/
) {
  const method = element.requestFullscreen || // moz omitted since firefox supports unprefixed now
  element.webkitRequestFullScreen || element.msRequestFullscreen;
  if (method) method.call(element);
}

function exitFullscreen() {
  const exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (exitMethod) exitMethod.call(document);
}

const CONTROLS_HIDE_DELAY = 1000; // Height of the header duplicated from CSS because we need to subtract it from our max
// height to get the max height of the video

const CONTEXT_MENU_VPADDING = 8; // How far the context menu sits above the button (px)

let CallView = (_dec = (0, _replaceableComponent.replaceableComponent)("views.voip.CallView"), _dec(_class = (_temp = class CallView extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "contentRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "controlsHideTimer", null);
    (0, _defineProperty2.default)(this, "dialpadButton", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "contextMenuButton", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'video_fullscreen':
          {
            if (!this.contentRef.current) {
              return;
            }

            if (payload.fullscreen) {
              requestFullscreen(this.contentRef.current);
            } else if (getFullScreenElement()) {
              exitFullscreen();
            }

            break;
          }
      }
    });
    (0, _defineProperty2.default)(this, "onCallState", state => {
      this.setState({
        callState: state
      });
    });
    (0, _defineProperty2.default)(this, "onCallLocalHoldUnhold", () => {
      this.setState({
        isLocalOnHold: this.props.call.isLocalOnHold()
      });
    });
    (0, _defineProperty2.default)(this, "onCallRemoteHoldUnhold", () => {
      this.setState({
        isRemoteOnHold: this.props.call.isRemoteOnHold(),
        // update both here because isLocalOnHold changes when we hold the call too
        isLocalOnHold: this.props.call.isLocalOnHold()
      });
    });
    (0, _defineProperty2.default)(this, "onFullscreenClick", () => {
      _dispatcher.default.dispatch({
        action: 'video_fullscreen',
        fullscreen: true
      });
    });
    (0, _defineProperty2.default)(this, "onExpandClick", () => {
      const userFacingRoomId = _CallHandler.default.sharedInstance().roomIdForCall(this.props.call);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: userFacingRoomId
      });
    });
    (0, _defineProperty2.default)(this, "onControlsHideTimer", () => {
      this.controlsHideTimer = null;
      this.setState({
        controlsVisible: false
      });
    });
    (0, _defineProperty2.default)(this, "onMouseMove", () => {
      this.showControls();
    });
    (0, _defineProperty2.default)(this, "onDialpadClick", () => {
      if (!this.state.showDialpad) {
        if (this.controlsHideTimer) {
          clearTimeout(this.controlsHideTimer);
          this.controlsHideTimer = null;
        }

        this.setState({
          showDialpad: true,
          controlsVisible: true
        });
      } else {
        if (this.controlsHideTimer !== null) {
          clearTimeout(this.controlsHideTimer);
        }

        this.controlsHideTimer = window.setTimeout(this.onControlsHideTimer, CONTROLS_HIDE_DELAY);
        this.setState({
          showDialpad: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMicMuteClick", () => {
      const newVal = !this.state.micMuted;
      this.props.call.setMicrophoneMuted(newVal);
      this.setState({
        micMuted: newVal
      });
    });
    (0, _defineProperty2.default)(this, "onVidMuteClick", () => {
      const newVal = !this.state.vidMuted;
      this.props.call.setLocalVideoMuted(newVal);
      this.setState({
        vidMuted: newVal
      });
    });
    (0, _defineProperty2.default)(this, "onMoreClick", () => {
      if (this.controlsHideTimer) {
        clearTimeout(this.controlsHideTimer);
        this.controlsHideTimer = null;
      }

      this.setState({
        showMoreMenu: true,
        controlsVisible: true
      });
    });
    (0, _defineProperty2.default)(this, "closeDialpad", () => {
      this.setState({
        showDialpad: false
      });
      this.controlsHideTimer = window.setTimeout(this.onControlsHideTimer, CONTROLS_HIDE_DELAY);
    });
    (0, _defineProperty2.default)(this, "closeContextMenu", () => {
      this.setState({
        showMoreMenu: false
      });
      this.controlsHideTimer = window.setTimeout(this.onControlsHideTimer, CONTROLS_HIDE_DELAY);
    });
    (0, _defineProperty2.default)(this, "onNativeKeyDown", ev => {
      let handled = false;
      const ctrlCmdOnly = (0, _Keyboard.isOnlyCtrlOrCmdKeyEvent)(ev);

      switch (ev.key) {
        case _Keyboard.Key.D:
          if (ctrlCmdOnly) {
            this.onMicMuteClick(); // show the controls to give feedback

            this.showControls();
            handled = true;
          }

          break;

        case _Keyboard.Key.E:
          if (ctrlCmdOnly) {
            this.onVidMuteClick(); // show the controls to give feedback

            this.showControls();
            handled = true;
          }

          break;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onRoomAvatarClick", () => {
      const userFacingRoomId = _CallHandler.default.sharedInstance().roomIdForCall(this.props.call);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: userFacingRoomId
      });
    });
    (0, _defineProperty2.default)(this, "onSecondaryRoomAvatarClick", () => {
      const userFacingRoomId = _CallHandler.default.sharedInstance().roomIdForCall(this.props.secondaryCall);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: userFacingRoomId
      });
    });
    (0, _defineProperty2.default)(this, "onCallResumeClick", () => {
      const userFacingRoomId = _CallHandler.default.sharedInstance().roomIdForCall(this.props.call);

      _CallHandler.default.sharedInstance().setActiveCallRoomId(userFacingRoomId);
    });
    (0, _defineProperty2.default)(this, "onTransferClick", () => {
      const transfereeCall = _CallHandler.default.sharedInstance().getTransfereeForCallId(this.props.call.callId);

      this.props.call.transferToCall(transfereeCall);
    });
    this.state = {
      isLocalOnHold: this.props.call.isLocalOnHold(),
      isRemoteOnHold: this.props.call.isRemoteOnHold(),
      micMuted: this.props.call.isMicrophoneMuted(),
      vidMuted: this.props.call.isLocalVideoMuted(),
      callState: this.props.call.state,
      controlsVisible: true,
      showMoreMenu: false,
      showDialpad: false
    };
    this.updateCallListeners(null, this.props.call);
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    document.addEventListener('keydown', this.onNativeKeyDown);
  }

  componentWillUnmount() {
    if (getFullScreenElement()) {
      exitFullscreen();
    }

    document.removeEventListener("keydown", this.onNativeKeyDown);
    this.updateCallListeners(this.props.call, null);

    _dispatcher.default.unregister(this.dispatcherRef);
  }

  componentDidUpdate(prevProps) {
    if (this.props.call === prevProps.call) return;
    this.setState({
      isLocalOnHold: this.props.call.isLocalOnHold(),
      isRemoteOnHold: this.props.call.isRemoteOnHold(),
      micMuted: this.props.call.isMicrophoneMuted(),
      vidMuted: this.props.call.isLocalVideoMuted(),
      callState: this.props.call.state
    });
    this.updateCallListeners(null, this.props.call);
  }

  updateCallListeners(oldCall
  /*: MatrixCall*/
  , newCall
  /*: MatrixCall*/
  ) {
    if (oldCall === newCall) return;

    if (oldCall) {
      oldCall.removeListener(_call.CallEvent.State, this.onCallState);
      oldCall.removeListener(_call.CallEvent.LocalHoldUnhold, this.onCallLocalHoldUnhold);
      oldCall.removeListener(_call.CallEvent.RemoteHoldUnhold, this.onCallRemoteHoldUnhold);
    }

    if (newCall) {
      newCall.on(_call.CallEvent.State, this.onCallState);
      newCall.on(_call.CallEvent.LocalHoldUnhold, this.onCallLocalHoldUnhold);
      newCall.on(_call.CallEvent.RemoteHoldUnhold, this.onCallRemoteHoldUnhold);
    }
  }

  showControls() {
    if (this.state.showMoreMenu || this.state.showDialpad) return;

    if (!this.state.controlsVisible) {
      this.setState({
        controlsVisible: true
      });
    }

    if (this.controlsHideTimer !== null) {
      clearTimeout(this.controlsHideTimer);
    }

    this.controlsHideTimer = window.setTimeout(this.onControlsHideTimer, CONTROLS_HIDE_DELAY);
  }

  render() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const callRoomId = _CallHandler.default.sharedInstance().roomIdForCall(this.props.call);

    const secondaryCallRoomId = _CallHandler.default.sharedInstance().roomIdForCall(this.props.secondaryCall);

    const callRoom = client.getRoom(callRoomId);
    const secCallRoom = this.props.secondaryCall ? client.getRoom(secondaryCallRoomId) : null;
    let dialPad;
    let contextMenu;

    if (this.state.showDialpad) {
      dialPad = /*#__PURE__*/_react.default.createElement(_DialpadContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.alwaysAboveRightOf)(this.dialpadButton.current.getBoundingClientRect(), _ContextMenu.ChevronFace.None, CONTEXT_MENU_VPADDING), {
        onFinished: this.closeDialpad,
        call: this.props.call
      }));
    }

    if (this.state.showMoreMenu) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_CallContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.alwaysAboveLeftOf)(this.contextMenuButton.current.getBoundingClientRect(), _ContextMenu.ChevronFace.None, CONTEXT_MENU_VPADDING), {
        onFinished: this.closeContextMenu,
        call: this.props.call
      }));
    }

    const micClasses = (0, _classnames.default)({
      mx_CallView_callControls_button: true,
      mx_CallView_callControls_button_micOn: !this.state.micMuted,
      mx_CallView_callControls_button_micOff: this.state.micMuted
    });
    const vidClasses = (0, _classnames.default)({
      mx_CallView_callControls_button: true,
      mx_CallView_callControls_button_vidOn: !this.state.vidMuted,
      mx_CallView_callControls_button_vidOff: this.state.vidMuted
    }); // Put the other states of the mic/video icons in the document to make sure they're cached
    // (otherwise the icon disappears briefly when toggled)

    const micCacheClasses = (0, _classnames.default)({
      mx_CallView_callControls_button: true,
      mx_CallView_callControls_button_micOn: this.state.micMuted,
      mx_CallView_callControls_button_micOff: !this.state.micMuted,
      mx_CallView_callControls_button_invisible: true
    });
    const vidCacheClasses = (0, _classnames.default)({
      mx_CallView_callControls_button: true,
      mx_CallView_callControls_button_vidOn: this.state.micMuted,
      mx_CallView_callControls_button_vidOff: !this.state.micMuted,
      mx_CallView_callControls_button_invisible: true
    });
    const callControlsClasses = (0, _classnames.default)({
      mx_CallView_callControls: true,
      mx_CallView_callControls_hidden: !this.state.controlsVisible
    });
    const vidMuteButton = this.props.call.type === _call.CallType.Video ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: vidClasses,
      onClick: this.onVidMuteClick
    }) : null; // The dial pad & 'more' button actions are only relevant in a connected call
    // When not connected, we have to put something there to make the flexbox alignment correct

    const dialpadButton = this.state.callState === _call.CallState.Connected ? /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
      className: "mx_CallView_callControls_button mx_CallView_callControls_dialpad",
      inputRef: this.dialpadButton,
      onClick: this.onDialpadClick,
      isExpanded: this.state.showDialpad
    }) : /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CallView_callControls_button mx_CallView_callControls_button_dialpad_hidden"
    });
    const contextMenuButton = this.state.callState === _call.CallState.Connected ? /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
      className: "mx_CallView_callControls_button mx_CallView_callControls_button_more",
      onClick: this.onMoreClick,
      inputRef: this.contextMenuButton,
      isExpanded: this.state.showMoreMenu
    }) : /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CallView_callControls_button mx_CallView_callControls_button_more_hidden"
    }); // in the near future, the dial pad button will go on the left. For now, it's the nothing button
    // because something needs to have margin-right: auto to make the alignment correct.

    const callControls = /*#__PURE__*/_react.default.createElement("div", {
      className: callControlsClasses
    }, dialpadButton, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: micClasses,
      onClick: this.onMicMuteClick
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_CallView_callControls_button mx_CallView_callControls_button_hangup",
      onClick: () => {
        _dispatcher.default.dispatch({
          action: 'hangup',
          room_id: callRoomId
        });
      }
    }), vidMuteButton, /*#__PURE__*/_react.default.createElement("div", {
      className: micCacheClasses
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: vidCacheClasses
    }), contextMenuButton); // The 'content' for the call, ie. the videos for a video call and profile picture
    // for voice calls (fills the bg)


    let contentView
    /*: React.ReactNode*/
    ;

    const transfereeCall = _CallHandler.default.sharedInstance().getTransfereeForCallId(this.props.call.callId);

    const isOnHold = this.state.isLocalOnHold || this.state.isRemoteOnHold;
    let holdTransferContent;

    if (transfereeCall) {
      const transferTargetRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(_CallHandler.default.sharedInstance().roomIdForCall(this.props.call));

      const transferTargetName = transferTargetRoom ? transferTargetRoom.name : (0, _languageHandler._t)("unknown person");

      const transfereeRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(_CallHandler.default.sharedInstance().roomIdForCall(transfereeCall));

      const transfereeName = transfereeRoom ? transfereeRoom.name : (0, _languageHandler._t)("unknown person");
      holdTransferContent = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_holdTransferContent"
      }, (0, _languageHandler._t)("Consulting with %(transferTarget)s. <a>Transfer to %(transferee)s</a>", {
        transferTarget: transferTargetName,
        transferee: transfereeName
      }, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link",
          onClick: this.onTransferClick
        }, sub)
      }));
    } else if (isOnHold) {
      let onHoldText = null;

      if (this.state.isRemoteOnHold) {
        const holdString = _CallHandler.default.sharedInstance().hasAnyUnheldCall() ? (0, _languageHandler._td)("You held the call <a>Switch</a>") : (0, _languageHandler._td)("You held the call <a>Resume</a>");
        onHoldText = (0, _languageHandler._t)(holdString, {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link",
            onClick: this.onCallResumeClick
          }, sub)
        });
      } else if (this.state.isLocalOnHold) {
        onHoldText = (0, _languageHandler._t)("%(peerName)s held the call", {
          peerName: this.props.call.getOpponentMember().name
        });
      }

      holdTransferContent = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_holdTransferContent"
      }, onHoldText);
    }

    if (this.props.call.type === _call.CallType.Video) {
      let localVideoFeed = null;
      let onHoldBackground = null;
      const backgroundStyle
      /*: CSSProperties*/
      = {};
      const containerClasses = (0, _classnames.default)({
        mx_CallView_video: true,
        mx_CallView_video_hold: isOnHold
      });

      if (isOnHold) {
        const backgroundAvatarUrl = (0, _Avatar.avatarUrlForMember)( // is it worth getting the size of the div to pass here?
        this.props.call.getOpponentMember(), 1024, 1024, 'crop');
        backgroundStyle.backgroundImage = 'url(' + backgroundAvatarUrl + ')';
        onHoldBackground = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_CallView_video_holdBackground",
          style: backgroundStyle
        });
      }

      if (!this.state.vidMuted) {
        localVideoFeed = /*#__PURE__*/_react.default.createElement(_VideoFeed.default, {
          type: _VideoFeed.VideoFeedType.Local,
          call: this.props.call
        });
      }

      contentView = /*#__PURE__*/_react.default.createElement("div", {
        className: containerClasses,
        ref: this.contentRef,
        onMouseMove: this.onMouseMove
      }, onHoldBackground, /*#__PURE__*/_react.default.createElement(_VideoFeed.default, {
        type: _VideoFeed.VideoFeedType.Remote,
        call: this.props.call,
        onResize: this.props.onResize
      }), localVideoFeed, holdTransferContent, callControls);
    } else {
      const avatarSize = this.props.pipMode ? 76 : 160;
      const classes = (0, _classnames.default)({
        mx_CallView_voice: true,
        mx_CallView_voice_hold: isOnHold
      });
      contentView = /*#__PURE__*/_react.default.createElement("div", {
        className: classes,
        onMouseMove: this.onMouseMove
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_voice_avatarsContainer"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_voice_avatarContainer",
        style: {
          width: avatarSize,
          height: avatarSize
        }
      }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        room: callRoom,
        height: avatarSize,
        width: avatarSize
      }))), holdTransferContent, callControls);
    }

    const callTypeText = this.props.call.type === _call.CallType.Video ? (0, _languageHandler._t)("Video Call") : (0, _languageHandler._t)("Voice Call");
    let myClassName;
    let fullScreenButton;

    if (this.props.call.type === _call.CallType.Video && !this.props.pipMode) {
      fullScreenButton = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header_button mx_CallView_header_button_fullscreen",
        onClick: this.onFullscreenClick,
        title: (0, _languageHandler._t)("Fill Screen")
      });
    }

    let expandButton;

    if (this.props.pipMode) {
      expandButton = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header_button mx_CallView_header_button_expand",
        onClick: this.onExpandClick,
        title: (0, _languageHandler._t)("Return to call")
      });
    }

    const headerControls = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CallView_header_controls"
    }, fullScreenButton, expandButton);

    let header
    /*: React.ReactNode*/
    ;

    if (!this.props.pipMode) {
      header = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header_phoneIcon"
      }), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CallView_header_callType"
      }, callTypeText), headerControls);
      myClassName = 'mx_CallView_large';
    } else {
      let secondaryCallInfo;

      if (this.props.secondaryCall) {
        secondaryCallInfo = /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_CallView_header_secondaryCallInfo"
        }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          element: "span",
          onClick: this.onSecondaryRoomAvatarClick
        }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
          room: secCallRoom,
          height: 16,
          width: 16
        }), /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_CallView_secondaryCall_roomName"
        }, (0, _languageHandler._t)("%(name)s on hold", {
          name: secCallRoom.name
        }))));
      }

      header = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onRoomAvatarClick
      }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        room: callRoom,
        height: 32,
        width: 32
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header_callInfo"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header_roomName"
      }, callRoom.name), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_header_callTypeSmall"
      }, callTypeText, secondaryCallInfo)), headerControls);
      myClassName = 'mx_CallView_pip';
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CallView " + myClassName
    }, header, contentView, dialPad, contextMenu);
  }

}, _temp)) || _class);
exports.default = CallView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvQ2FsbFZpZXcudHN4Il0sIm5hbWVzIjpbImdldEZ1bGxTY3JlZW5FbGVtZW50IiwiZG9jdW1lbnQiLCJmdWxsc2NyZWVuRWxlbWVudCIsIndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IiwibXNGdWxsc2NyZWVuRWxlbWVudCIsInJlcXVlc3RGdWxsc2NyZWVuIiwiZWxlbWVudCIsIm1ldGhvZCIsIndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIiwibXNSZXF1ZXN0RnVsbHNjcmVlbiIsImNhbGwiLCJleGl0RnVsbHNjcmVlbiIsImV4aXRNZXRob2QiLCJ3ZWJraXRFeGl0RnVsbHNjcmVlbiIsIm1zRXhpdEZ1bGxzY3JlZW4iLCJDT05UUk9MU19ISURFX0RFTEFZIiwiQ09OVEVYVF9NRU5VX1ZQQURESU5HIiwiQ2FsbFZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwYXlsb2FkIiwiYWN0aW9uIiwiY29udGVudFJlZiIsImN1cnJlbnQiLCJmdWxsc2NyZWVuIiwic3RhdGUiLCJzZXRTdGF0ZSIsImNhbGxTdGF0ZSIsImlzTG9jYWxPbkhvbGQiLCJpc1JlbW90ZU9uSG9sZCIsImRpcyIsImRpc3BhdGNoIiwidXNlckZhY2luZ1Jvb21JZCIsIkNhbGxIYW5kbGVyIiwic2hhcmVkSW5zdGFuY2UiLCJyb29tSWRGb3JDYWxsIiwicm9vbV9pZCIsImNvbnRyb2xzSGlkZVRpbWVyIiwiY29udHJvbHNWaXNpYmxlIiwic2hvd0NvbnRyb2xzIiwic2hvd0RpYWxwYWQiLCJjbGVhclRpbWVvdXQiLCJ3aW5kb3ciLCJzZXRUaW1lb3V0Iiwib25Db250cm9sc0hpZGVUaW1lciIsIm5ld1ZhbCIsIm1pY011dGVkIiwic2V0TWljcm9waG9uZU11dGVkIiwidmlkTXV0ZWQiLCJzZXRMb2NhbFZpZGVvTXV0ZWQiLCJzaG93TW9yZU1lbnUiLCJldiIsImhhbmRsZWQiLCJjdHJsQ21kT25seSIsImtleSIsIktleSIsIkQiLCJvbk1pY011dGVDbGljayIsIkUiLCJvblZpZE11dGVDbGljayIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic2Vjb25kYXJ5Q2FsbCIsInNldEFjdGl2ZUNhbGxSb29tSWQiLCJ0cmFuc2ZlcmVlQ2FsbCIsImdldFRyYW5zZmVyZWVGb3JDYWxsSWQiLCJjYWxsSWQiLCJ0cmFuc2ZlclRvQ2FsbCIsImlzTWljcm9waG9uZU11dGVkIiwiaXNMb2NhbFZpZGVvTXV0ZWQiLCJ1cGRhdGVDYWxsTGlzdGVuZXJzIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbk5hdGl2ZUtleURvd24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwib2xkQ2FsbCIsIm5ld0NhbGwiLCJyZW1vdmVMaXN0ZW5lciIsIkNhbGxFdmVudCIsIlN0YXRlIiwib25DYWxsU3RhdGUiLCJMb2NhbEhvbGRVbmhvbGQiLCJvbkNhbGxMb2NhbEhvbGRVbmhvbGQiLCJSZW1vdGVIb2xkVW5ob2xkIiwib25DYWxsUmVtb3RlSG9sZFVuaG9sZCIsIm9uIiwicmVuZGVyIiwiY2xpZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiY2FsbFJvb21JZCIsInNlY29uZGFyeUNhbGxSb29tSWQiLCJjYWxsUm9vbSIsImdldFJvb20iLCJzZWNDYWxsUm9vbSIsImRpYWxQYWQiLCJjb250ZXh0TWVudSIsImRpYWxwYWRCdXR0b24iLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJDaGV2cm9uRmFjZSIsIk5vbmUiLCJjbG9zZURpYWxwYWQiLCJjb250ZXh0TWVudUJ1dHRvbiIsImNsb3NlQ29udGV4dE1lbnUiLCJtaWNDbGFzc2VzIiwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbiIsIm14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fbWljT24iLCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX21pY09mZiIsInZpZENsYXNzZXMiLCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX3ZpZE9uIiwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl92aWRPZmYiLCJtaWNDYWNoZUNsYXNzZXMiLCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX2ludmlzaWJsZSIsInZpZENhY2hlQ2xhc3NlcyIsImNhbGxDb250cm9sc0NsYXNzZXMiLCJteF9DYWxsVmlld19jYWxsQ29udHJvbHMiLCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfaGlkZGVuIiwidmlkTXV0ZUJ1dHRvbiIsInR5cGUiLCJDYWxsVHlwZSIsIlZpZGVvIiwiQ2FsbFN0YXRlIiwiQ29ubmVjdGVkIiwib25EaWFscGFkQ2xpY2siLCJvbk1vcmVDbGljayIsImNhbGxDb250cm9scyIsImNvbnRlbnRWaWV3IiwiaXNPbkhvbGQiLCJob2xkVHJhbnNmZXJDb250ZW50IiwidHJhbnNmZXJUYXJnZXRSb29tIiwidHJhbnNmZXJUYXJnZXROYW1lIiwibmFtZSIsInRyYW5zZmVyZWVSb29tIiwidHJhbnNmZXJlZU5hbWUiLCJ0cmFuc2ZlclRhcmdldCIsInRyYW5zZmVyZWUiLCJhIiwic3ViIiwib25UcmFuc2ZlckNsaWNrIiwib25Ib2xkVGV4dCIsImhvbGRTdHJpbmciLCJoYXNBbnlVbmhlbGRDYWxsIiwib25DYWxsUmVzdW1lQ2xpY2siLCJwZWVyTmFtZSIsImdldE9wcG9uZW50TWVtYmVyIiwibG9jYWxWaWRlb0ZlZWQiLCJvbkhvbGRCYWNrZ3JvdW5kIiwiYmFja2dyb3VuZFN0eWxlIiwiY29udGFpbmVyQ2xhc3NlcyIsIm14X0NhbGxWaWV3X3ZpZGVvIiwibXhfQ2FsbFZpZXdfdmlkZW9faG9sZCIsImJhY2tncm91bmRBdmF0YXJVcmwiLCJiYWNrZ3JvdW5kSW1hZ2UiLCJWaWRlb0ZlZWRUeXBlIiwiTG9jYWwiLCJvbk1vdXNlTW92ZSIsIlJlbW90ZSIsIm9uUmVzaXplIiwiYXZhdGFyU2l6ZSIsInBpcE1vZGUiLCJjbGFzc2VzIiwibXhfQ2FsbFZpZXdfdm9pY2UiLCJteF9DYWxsVmlld192b2ljZV9ob2xkIiwid2lkdGgiLCJoZWlnaHQiLCJjYWxsVHlwZVRleHQiLCJteUNsYXNzTmFtZSIsImZ1bGxTY3JlZW5CdXR0b24iLCJvbkZ1bGxzY3JlZW5DbGljayIsImV4cGFuZEJ1dHRvbiIsIm9uRXhwYW5kQ2xpY2siLCJoZWFkZXJDb250cm9scyIsImhlYWRlciIsInNlY29uZGFyeUNhbGxJbmZvIiwib25TZWNvbmRhcnlSb29tQXZhdGFyQ2xpY2siLCJvblJvb21BdmF0YXJDbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBK0JBLFNBQVNBLG9CQUFULEdBQWdDO0FBQzVCLFNBQ0lDLFFBQVEsQ0FBQ0MsaUJBQVQsSUFDQTtBQUNBRCxFQUFBQSxRQUFRLENBQUNFLHVCQUZULElBR0FGLFFBQVEsQ0FBQ0csbUJBSmI7QUFNSDs7QUFFRCxTQUFTQyxpQkFBVCxDQUEyQkM7QUFBM0I7QUFBQSxFQUE2QztBQUN6QyxRQUFNQyxNQUFNLEdBQ1JELE9BQU8sQ0FBQ0QsaUJBQVIsSUFDQTtBQUNBQyxFQUFBQSxPQUFPLENBQUNFLHVCQUZSLElBR0FGLE9BQU8sQ0FBQ0csbUJBSlo7QUFNQSxNQUFJRixNQUFKLEVBQVlBLE1BQU0sQ0FBQ0csSUFBUCxDQUFZSixPQUFaO0FBQ2Y7O0FBRUQsU0FBU0ssY0FBVCxHQUEwQjtBQUN0QixRQUFNQyxVQUFVLEdBQ1pYLFFBQVEsQ0FBQ1UsY0FBVCxJQUNBVixRQUFRLENBQUNZLG9CQURULElBRUFaLFFBQVEsQ0FBQ2EsZ0JBSGI7QUFLQSxN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LGVBRUk7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQ0trQyxZQURMLEVBRUtRLGlCQUZMLENBRkosQ0FKSyxFQVdKRixjQVhJLENBQVQ7QUFhQUwsTUFBQUEsV0FBVyxHQUFHLGlCQUFkO0FBQ0g7O0FBRUQsd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBRSxpQkFBaUJBO0FBQWpDLE9BQ0ZNLE1BREUsRUFFRjlDLFdBRkUsRUFHRi9CLE9BSEUsRUFJRkMsV0FKRSxDQUFQO0FBTUg7O0FBOWhCaUUsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmLCBDU1NQcm9wZXJ0aWVzIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IENhbGxIYW5kbGVyIGZyb20gJy4uLy4uLy4uL0NhbGxIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgVmlkZW9GZWVkLCB7IFZpZGVvRmVlZFR5cGUgfSBmcm9tIFwiLi9WaWRlb0ZlZWRcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCB7IENhbGxTdGF0ZSwgQ2FsbFR5cGUsIE1hdHJpeENhbGwgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5pbXBvcnQgeyBDYWxsRXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHtpc09ubHlDdHJsT3JDbWRLZXlFdmVudCwgS2V5fSBmcm9tICcuLi8uLi8uLi9LZXlib2FyZCc7XG5pbXBvcnQge2Fsd2F5c0Fib3ZlTGVmdE9mLCBhbHdheXNBYm92ZVJpZ2h0T2YsIENoZXZyb25GYWNlLCBDb250ZXh0TWVudUJ1dHRvbn0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudSc7XG5pbXBvcnQgQ2FsbENvbnRleHRNZW51IGZyb20gJy4uL2NvbnRleHRfbWVudXMvQ2FsbENvbnRleHRNZW51JztcbmltcG9ydCB7IGF2YXRhclVybEZvck1lbWJlciB9IGZyb20gJy4uLy4uLy4uL0F2YXRhcic7XG5pbXBvcnQgRGlhbHBhZENvbnRleHRNZW51IGZyb20gJy4uL2NvbnRleHRfbWVudXMvRGlhbHBhZENvbnRleHRNZW51JztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAgICAgLy8gVGhlIGNhbGwgZm9yIHVzIHRvIGRpc3BsYXlcbiAgICAgICAgY2FsbDogTWF0cml4Q2FsbCxcblxuICAgICAgICAvLyBBbm90aGVyIG9uZ29pbmcgY2FsbCB0byBkaXNwbGF5IGluZm9ybWF0aW9uIGFib3V0XG4gICAgICAgIHNlY29uZGFyeUNhbGw/OiBNYXRyaXhDYWxsLFxuXG4gICAgICAgIC8vIGEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgaW4gdGhlIGNhbGx2aWV3IGNoYW5nZXNcbiAgICAgICAgLy8gaW4gYSB3YXkgdGhhdCBpcyBsaWtlbHkgdG8gY2F1c2UgYSByZXNpemUuXG4gICAgICAgIG9uUmVzaXplPzogYW55O1xuXG4gICAgICAgIC8vIFdoZXRoZXIgdGhpcyBjYWxsIHZpZXcgaXMgZm9yIHBpY3R1cmUtaW4tcGljdHVlIG1vZGVcbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBpdCdzIHRoZSBsYXJnZXIgY2FsbCB2aWV3IHdoZW4gdmlld2luZyB0aGUgcm9vbSB0aGUgY2FsbCBpcyBpbi5cbiAgICAgICAgLy8gVGhpcyBpcyBzb3J0IG9mIGEgcHJveHkgZm9yIGEgbnVtYmVyIG9mIHRoaW5ncyBidXQgd2UgY3VycmVudGx5IGhhdmUgbm9cbiAgICAgICAgLy8gbmVlZCB0byBjb250cm9sIHRob3NlIHRoaW5ncyBzZXBhcmF0ZWx5LCBzbyB0aGlzIGlzIHNpbXBsZXIuXG4gICAgICAgIHBpcE1vZGU/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBpc0xvY2FsT25Ib2xkOiBib29sZWFuLFxuICAgIGlzUmVtb3RlT25Ib2xkOiBib29sZWFuLFxuICAgIG1pY011dGVkOiBib29sZWFuLFxuICAgIHZpZE11dGVkOiBib29sZWFuLFxuICAgIGNhbGxTdGF0ZTogQ2FsbFN0YXRlLFxuICAgIGNvbnRyb2xzVmlzaWJsZTogYm9vbGVhbixcbiAgICBzaG93TW9yZU1lbnU6IGJvb2xlYW4sXG4gICAgc2hvd0RpYWxwYWQ6IGJvb2xlYW4sXG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxTY3JlZW5FbGVtZW50KCkge1xuICAgIHJldHVybiAoXG4gICAgICAgIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8XG4gICAgICAgIC8vIG1veiBvbWl0dGVkIGJlY2F1c2UgZmlyZWZveCBzdXBwb3J0cyB0aGlzIHVucHJlZml4ZWQgbm93ICh3ZWJraXQgaGVyZSBmb3Igc2FmYXJpKVxuICAgICAgICBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCB8fFxuICAgICAgICBkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbGVtZW50XG4gICAgKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEZ1bGxzY3JlZW4oZWxlbWVudDogRWxlbWVudCkge1xuICAgIGNvbnN0IG1ldGhvZCA9IChcbiAgICAgICAgZWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbiB8fFxuICAgICAgICAvLyBtb3ogb21pdHRlZCBzaW5jZSBmaXJlZm94IHN1cHBvcnRzIHVucHJlZml4ZWQgbm93XG4gICAgICAgIGVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4gfHxcbiAgICAgICAgZWxlbWVudC5tc1JlcXVlc3RGdWxsc2NyZWVuXG4gICAgKTtcbiAgICBpZiAobWV0aG9kKSBtZXRob2QuY2FsbChlbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gZXhpdEZ1bGxzY3JlZW4oKSB7XG4gICAgY29uc3QgZXhpdE1ldGhvZCA9IChcbiAgICAgICAgZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4gfHxcbiAgICAgICAgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW4gfHxcbiAgICAgICAgZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlblxuICAgICk7XG4gICAgaWYgKGV4aXRNZXRob2QpIGV4aXRNZXRob2QuY2FsbChkb2N1bWVudCk7XG59XG5cbmNvbnN0IENPTlRST0xTX0hJREVfREVMQVkgPSAxMDAwO1xuLy8gSGVpZ2h0IG9mIHRoZSBoZWFkZXIgZHVwbGljYXRlZCBmcm9tIENTUyBiZWNhdXNlIHdlIG5lZWQgdG8gc3VidHJhY3QgaXQgZnJvbSBvdXIgbWF4XG4vLyBoZWlnaHQgdG8gZ2V0IHRoZSBtYXggaGVpZ2h0IG9mIHRoZSB2aWRlb1xuY29uc3QgQ09OVEVYVF9NRU5VX1ZQQURESU5HID0gODsgLy8gSG93IGZhciB0aGUgY29udGV4dCBtZW51IHNpdHMgYWJvdmUgdGhlIGJ1dHRvbiAocHgpXG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnZvaXAuQ2FsbFZpZXdcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbGxWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBjb250ZW50UmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgY29udHJvbHNIaWRlVGltZXI6IG51bWJlciA9IG51bGw7XG4gICAgcHJpdmF0ZSBkaWFscGFkQnV0dG9uID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgY29udGV4dE1lbnVCdXR0b24gPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNMb2NhbE9uSG9sZDogdGhpcy5wcm9wcy5jYWxsLmlzTG9jYWxPbkhvbGQoKSxcbiAgICAgICAgICAgIGlzUmVtb3RlT25Ib2xkOiB0aGlzLnByb3BzLmNhbGwuaXNSZW1vdGVPbkhvbGQoKSxcbiAgICAgICAgICAgIG1pY011dGVkOiB0aGlzLnByb3BzLmNhbGwuaXNNaWNyb3Bob25lTXV0ZWQoKSxcbiAgICAgICAgICAgIHZpZE11dGVkOiB0aGlzLnByb3BzLmNhbGwuaXNMb2NhbFZpZGVvTXV0ZWQoKSxcbiAgICAgICAgICAgIGNhbGxTdGF0ZTogdGhpcy5wcm9wcy5jYWxsLnN0YXRlLFxuICAgICAgICAgICAgY29udHJvbHNWaXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd01vcmVNZW51OiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dEaWFscGFkOiBmYWxzZSxcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbExpc3RlbmVycyhudWxsLCB0aGlzLnByb3BzLmNhbGwpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbk5hdGl2ZUtleURvd24pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgaWYgKGdldEZ1bGxTY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgICAgICAgIGV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLm9uTmF0aXZlS2V5RG93bik7XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbExpc3RlbmVycyh0aGlzLnByb3BzLmNhbGwsIG51bGwpO1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNhbGwgPT09IHByZXZQcm9wcy5jYWxsKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc0xvY2FsT25Ib2xkOiB0aGlzLnByb3BzLmNhbGwuaXNMb2NhbE9uSG9sZCgpLFxuICAgICAgICAgICAgaXNSZW1vdGVPbkhvbGQ6IHRoaXMucHJvcHMuY2FsbC5pc1JlbW90ZU9uSG9sZCgpLFxuICAgICAgICAgICAgbWljTXV0ZWQ6IHRoaXMucHJvcHMuY2FsbC5pc01pY3JvcGhvbmVNdXRlZCgpLFxuICAgICAgICAgICAgdmlkTXV0ZWQ6IHRoaXMucHJvcHMuY2FsbC5pc0xvY2FsVmlkZW9NdXRlZCgpLFxuICAgICAgICAgICAgY2FsbFN0YXRlOiB0aGlzLnByb3BzLmNhbGwuc3RhdGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlQ2FsbExpc3RlbmVycyhudWxsLCB0aGlzLnByb3BzLmNhbGwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICd2aWRlb19mdWxsc2NyZWVuJzoge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb250ZW50UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5mdWxsc2NyZWVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RGdWxsc2NyZWVuKHRoaXMuY29udGVudFJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGdldEZ1bGxTY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVDYWxsTGlzdGVuZXJzKG9sZENhbGw6IE1hdHJpeENhbGwsIG5ld0NhbGw6IE1hdHJpeENhbGwpIHtcbiAgICAgICAgaWYgKG9sZENhbGwgPT09IG5ld0NhbGwpIHJldHVybjtcblxuICAgICAgICBpZiAob2xkQ2FsbCkge1xuICAgICAgICAgICAgb2xkQ2FsbC5yZW1vdmVMaXN0ZW5lcihDYWxsRXZlbnQuU3RhdGUsIHRoaXMub25DYWxsU3RhdGUpO1xuICAgICAgICAgICAgb2xkQ2FsbC5yZW1vdmVMaXN0ZW5lcihDYWxsRXZlbnQuTG9jYWxIb2xkVW5ob2xkLCB0aGlzLm9uQ2FsbExvY2FsSG9sZFVuaG9sZCk7XG4gICAgICAgICAgICBvbGRDYWxsLnJlbW92ZUxpc3RlbmVyKENhbGxFdmVudC5SZW1vdGVIb2xkVW5ob2xkLCB0aGlzLm9uQ2FsbFJlbW90ZUhvbGRVbmhvbGQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdDYWxsKSB7XG4gICAgICAgICAgICBuZXdDYWxsLm9uKENhbGxFdmVudC5TdGF0ZSwgdGhpcy5vbkNhbGxTdGF0ZSk7XG4gICAgICAgICAgICBuZXdDYWxsLm9uKENhbGxFdmVudC5Mb2NhbEhvbGRVbmhvbGQsIHRoaXMub25DYWxsTG9jYWxIb2xkVW5ob2xkKTtcbiAgICAgICAgICAgIG5ld0NhbGwub24oQ2FsbEV2ZW50LlJlbW90ZUhvbGRVbmhvbGQsIHRoaXMub25DYWxsUmVtb3RlSG9sZFVuaG9sZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2FsbFN0YXRlID0gKHN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY2FsbFN0YXRlOiBzdGF0ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYWxsTG9jYWxIb2xkVW5ob2xkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzTG9jYWxPbkhvbGQ6IHRoaXMucHJvcHMuY2FsbC5pc0xvY2FsT25Ib2xkKCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2FsbFJlbW90ZUhvbGRVbmhvbGQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNSZW1vdGVPbkhvbGQ6IHRoaXMucHJvcHMuY2FsbC5pc1JlbW90ZU9uSG9sZCgpLFxuICAgICAgICAgICAgLy8gdXBkYXRlIGJvdGggaGVyZSBiZWNhdXNlIGlzTG9jYWxPbkhvbGQgY2hhbmdlcyB3aGVuIHdlIGhvbGQgdGhlIGNhbGwgdG9vXG4gICAgICAgICAgICBpc0xvY2FsT25Ib2xkOiB0aGlzLnByb3BzLmNhbGwuaXNMb2NhbE9uSG9sZCgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZ1bGxzY3JlZW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZGVvX2Z1bGxzY3JlZW4nLFxuICAgICAgICAgICAgZnVsbHNjcmVlbjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FeHBhbmRDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdXNlckZhY2luZ1Jvb21JZCA9IENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkucm9vbUlkRm9yQ2FsbCh0aGlzLnByb3BzLmNhbGwpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIHJvb21faWQ6IHVzZXJGYWNpbmdSb29tSWQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udHJvbHNIaWRlVGltZXIgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuY29udHJvbHNIaWRlVGltZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbnRyb2xzVmlzaWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZU1vdmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd0NvbnRyb2xzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93Q29udHJvbHMoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dNb3JlTWVudSB8fCB0aGlzLnN0YXRlLnNob3dEaWFscGFkKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNvbnRyb2xzVmlzaWJsZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY29udHJvbHNWaXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29udHJvbHNIaWRlVGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmNvbnRyb2xzSGlkZVRpbWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRyb2xzSGlkZVRpbWVyID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5vbkNvbnRyb2xzSGlkZVRpbWVyLCBDT05UUk9MU19ISURFX0RFTEFZKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGlhbHBhZENsaWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd0RpYWxwYWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2xzSGlkZVRpbWVyKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY29udHJvbHNIaWRlVGltZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbHNIaWRlVGltZXIgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzaG93RGlhbHBhZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb250cm9sc1Zpc2libGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2xzSGlkZVRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY29udHJvbHNIaWRlVGltZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jb250cm9sc0hpZGVUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMub25Db250cm9sc0hpZGVUaW1lciwgQ09OVFJPTFNfSElERV9ERUxBWSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNob3dEaWFscGFkOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1pY011dGVDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3VmFsID0gIXRoaXMuc3RhdGUubWljTXV0ZWQ7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5jYWxsLnNldE1pY3JvcGhvbmVNdXRlZChuZXdWYWwpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHttaWNNdXRlZDogbmV3VmFsfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblZpZE11dGVDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3VmFsID0gIXRoaXMuc3RhdGUudmlkTXV0ZWQ7XG5cbiAgICAgICAgdGhpcy5wcm9wcy5jYWxsLnNldExvY2FsVmlkZW9NdXRlZChuZXdWYWwpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt2aWRNdXRlZDogbmV3VmFsfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vcmVDbGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29udHJvbHNIaWRlVGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmNvbnRyb2xzSGlkZVRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuY29udHJvbHNIaWRlVGltZXIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG93TW9yZU1lbnU6IHRydWUsXG4gICAgICAgICAgICBjb250cm9sc1Zpc2libGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xvc2VEaWFscGFkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3dEaWFscGFkOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29udHJvbHNIaWRlVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLm9uQ29udHJvbHNIaWRlVGltZXIsIENPTlRST0xTX0hJREVfREVMQVkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xvc2VDb250ZXh0TWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaG93TW9yZU1lbnU6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb250cm9sc0hpZGVUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMub25Db250cm9sc0hpZGVUaW1lciwgQ09OVFJPTFNfSElERV9ERUxBWSk7XG4gICAgfVxuXG4gICAgLy8gd2UgcmVnaXN0ZXIgZ2xvYmFsIHNob3J0Y3V0cyBoZXJlLCB0aGV5ICptdXN0IG5vdCBjb25mbGljdCogd2l0aCBsb2NhbCBzaG9ydGN1dHMgZWxzZXdoZXJlIG9yIGJvdGggd2lsbCBmaXJlXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgYXNzdW1lcyB3ZSBhbHdheXMgaGF2ZSBhIGNhbGx2aWV3IG9uIHNjcmVlbiBhdCBhbnkgZ2l2ZW4gdGltZVxuICAgIC8vIENhbGxIYW5kbGVyIHdvdWxkIHByb2JhYmx5IGJlIGEgYmV0dGVyIHBsYWNlIGZvciB0aGlzXG4gICAgcHJpdmF0ZSBvbk5hdGl2ZUtleURvd24gPSBldiA9PiB7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGN0cmxDbWRPbmx5ID0gaXNPbmx5Q3RybE9yQ21kS2V5RXZlbnQoZXYpO1xuXG4gICAgICAgIHN3aXRjaCAoZXYua2V5KSB7XG4gICAgICAgICAgICBjYXNlIEtleS5EOlxuICAgICAgICAgICAgICAgIGlmIChjdHJsQ21kT25seSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTWljTXV0ZUNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNob3cgdGhlIGNvbnRyb2xzIHRvIGdpdmUgZmVlZGJhY2tcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93Q29udHJvbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEtleS5FOlxuICAgICAgICAgICAgICAgIGlmIChjdHJsQ21kT25seSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uVmlkTXV0ZUNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNob3cgdGhlIGNvbnRyb2xzIHRvIGdpdmUgZmVlZGJhY2tcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93Q29udHJvbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbUF2YXRhckNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB1c2VyRmFjaW5nUm9vbUlkID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5yb29tSWRGb3JDYWxsKHRoaXMucHJvcHMuY2FsbCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdXNlckZhY2luZ1Jvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlY29uZGFyeVJvb21BdmF0YXJDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdXNlckZhY2luZ1Jvb21JZCA9IENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkucm9vbUlkRm9yQ2FsbCh0aGlzLnByb3BzLnNlY29uZGFyeUNhbGwpO1xuXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdXNlckZhY2luZ1Jvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbGxSZXN1bWVDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdXNlckZhY2luZ1Jvb21JZCA9IENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkucm9vbUlkRm9yQ2FsbCh0aGlzLnByb3BzLmNhbGwpO1xuICAgICAgICBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLnNldEFjdGl2ZUNhbGxSb29tSWQodXNlckZhY2luZ1Jvb21JZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblRyYW5zZmVyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyYW5zZmVyZWVDYWxsID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRUcmFuc2ZlcmVlRm9yQ2FsbElkKHRoaXMucHJvcHMuY2FsbC5jYWxsSWQpO1xuICAgICAgICB0aGlzLnByb3BzLmNhbGwudHJhbnNmZXJUb0NhbGwodHJhbnNmZXJlZUNhbGwpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgY2FsbFJvb21JZCA9IENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkucm9vbUlkRm9yQ2FsbCh0aGlzLnByb3BzLmNhbGwpO1xuICAgICAgICBjb25zdCBzZWNvbmRhcnlDYWxsUm9vbUlkID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5yb29tSWRGb3JDYWxsKHRoaXMucHJvcHMuc2Vjb25kYXJ5Q2FsbCk7XG4gICAgICAgIGNvbnN0IGNhbGxSb29tID0gY2xpZW50LmdldFJvb20oY2FsbFJvb21JZCk7XG4gICAgICAgIGNvbnN0IHNlY0NhbGxSb29tID0gdGhpcy5wcm9wcy5zZWNvbmRhcnlDYWxsID8gY2xpZW50LmdldFJvb20oc2Vjb25kYXJ5Q2FsbFJvb21JZCkgOiBudWxsO1xuXG4gICAgICAgIGxldCBkaWFsUGFkO1xuICAgICAgICBsZXQgY29udGV4dE1lbnU7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd0RpYWxwYWQpIHtcbiAgICAgICAgICAgIGRpYWxQYWQgPSA8RGlhbHBhZENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgey4uLmFsd2F5c0Fib3ZlUmlnaHRPZihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaWFscGFkQnV0dG9uLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICAgICAgICAgIENoZXZyb25GYWNlLk5vbmUsXG4gICAgICAgICAgICAgICAgICAgIENPTlRFWFRfTUVOVV9WUEFERElORyxcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuY2xvc2VEaWFscGFkfVxuICAgICAgICAgICAgICAgIGNhbGw9e3RoaXMucHJvcHMuY2FsbH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd01vcmVNZW51KSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IDxDYWxsQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICB7Li4uYWx3YXlzQWJvdmVMZWZ0T2YoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dE1lbnVCdXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgICAgQ2hldnJvbkZhY2UuTm9uZSxcbiAgICAgICAgICAgICAgICAgICAgQ09OVEVYVF9NRU5VX1ZQQURESU5HLFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5jbG9zZUNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgIGNhbGw9e3RoaXMucHJvcHMuY2FsbH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWljQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fbWljT246ICF0aGlzLnN0YXRlLm1pY011dGVkLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9taWNPZmY6IHRoaXMuc3RhdGUubWljTXV0ZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHZpZENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b246IHRydWUsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX3ZpZE9uOiAhdGhpcy5zdGF0ZS52aWRNdXRlZCxcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fdmlkT2ZmOiB0aGlzLnN0YXRlLnZpZE11dGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQdXQgdGhlIG90aGVyIHN0YXRlcyBvZiB0aGUgbWljL3ZpZGVvIGljb25zIGluIHRoZSBkb2N1bWVudCB0byBtYWtlIHN1cmUgdGhleSdyZSBjYWNoZWRcbiAgICAgICAgLy8gKG90aGVyd2lzZSB0aGUgaWNvbiBkaXNhcHBlYXJzIGJyaWVmbHkgd2hlbiB0b2dnbGVkKVxuICAgICAgICBjb25zdCBtaWNDYWNoZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b246IHRydWUsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX21pY09uOiB0aGlzLnN0YXRlLm1pY011dGVkLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9taWNPZmY6ICF0aGlzLnN0YXRlLm1pY011dGVkLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9pbnZpc2libGU6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHZpZENhY2hlQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fdmlkT246IHRoaXMuc3RhdGUubWljTXV0ZWQsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX3ZpZE9mZjogIXRoaXMuc3RhdGUubWljTXV0ZWQsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX2ludmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2FsbENvbnRyb2xzQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzOiB0cnVlLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2hpZGRlbjogIXRoaXMuc3RhdGUuY29udHJvbHNWaXNpYmxlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB2aWRNdXRlQnV0dG9uID0gdGhpcy5wcm9wcy5jYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvID8gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT17dmlkQ2xhc3Nlc31cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25WaWRNdXRlQ2xpY2t9XG4gICAgICAgIC8+IDogbnVsbDtcblxuICAgICAgICAvLyBUaGUgZGlhbCBwYWQgJiAnbW9yZScgYnV0dG9uIGFjdGlvbnMgYXJlIG9ubHkgcmVsZXZhbnQgaW4gYSBjb25uZWN0ZWQgY2FsbFxuICAgICAgICAvLyBXaGVuIG5vdCBjb25uZWN0ZWQsIHdlIGhhdmUgdG8gcHV0IHNvbWV0aGluZyB0aGVyZSB0byBtYWtlIHRoZSBmbGV4Ym94IGFsaWdubWVudCBjb3JyZWN0XG4gICAgICAgIGNvbnN0IGRpYWxwYWRCdXR0b24gPSB0aGlzLnN0YXRlLmNhbGxTdGF0ZSA9PT0gQ2FsbFN0YXRlLkNvbm5lY3RlZCA/IDxDb250ZXh0TWVudUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbiBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfZGlhbHBhZFwiXG4gICAgICAgICAgICBpbnB1dFJlZj17dGhpcy5kaWFscGFkQnV0dG9ufVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkRpYWxwYWRDbGlja31cbiAgICAgICAgICAgIGlzRXhwYW5kZWQ9e3RoaXMuc3RhdGUuc2hvd0RpYWxwYWR9XG4gICAgICAgIC8+IDogPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fZGlhbHBhZF9oaWRkZW5cIiAvPjtcblxuICAgICAgICBjb25zdCBjb250ZXh0TWVudUJ1dHRvbiA9IHRoaXMuc3RhdGUuY2FsbFN0YXRlID09PSBDYWxsU3RhdGUuQ29ubmVjdGVkID8gPENvbnRleHRNZW51QnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fbW9yZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uTW9yZUNsaWNrfVxuICAgICAgICAgICAgaW5wdXRSZWY9e3RoaXMuY29udGV4dE1lbnVCdXR0b259XG4gICAgICAgICAgICBpc0V4cGFuZGVkPXt0aGlzLnN0YXRlLnNob3dNb3JlTWVudX1cbiAgICAgICAgLz4gOiA8ZGl2IGNsYXNzTmFtZT1cIm14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b24gbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9tb3JlX2hpZGRlblwiIC8+O1xuXG4gICAgICAgIC8vIGluIHRoZSBuZWFyIGZ1dHVyZSwgdGhlIGRpYWwgcGFkIGJ1dHRvbiB3aWxsIGdvIG9uIHRoZSBsZWZ0LiBGb3Igbm93LCBpdCdzIHRoZSBub3RoaW5nIGJ1dHRvblxuICAgICAgICAvLyBiZWNhdXNlIHNvbWV0aGluZyBuZWVkcyB0byBoYXZlIG1hcmdpbi1yaWdodDogYXV0byB0byBtYWtlIHRoZSBhbGlnbm1lbnQgY29ycmVjdC5cbiAgICAgICAgY29uc3QgY2FsbENvbnRyb2xzID0gPGRpdiBjbGFzc05hbWU9e2NhbGxDb250cm9sc0NsYXNzZXN9PlxuICAgICAgICAgICAge2RpYWxwYWRCdXR0b259XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWljQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uTWljTXV0ZUNsaWNrfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbiBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX2hhbmd1cFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnaGFuZ3VwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IGNhbGxSb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge3ZpZE11dGVCdXR0b259XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17bWljQ2FjaGVDbGFzc2VzfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3ZpZENhY2hlQ2xhc3Nlc30gLz5cbiAgICAgICAgICAgIHtjb250ZXh0TWVudUJ1dHRvbn1cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIC8vIFRoZSAnY29udGVudCcgZm9yIHRoZSBjYWxsLCBpZS4gdGhlIHZpZGVvcyBmb3IgYSB2aWRlbyBjYWxsIGFuZCBwcm9maWxlIHBpY3R1cmVcbiAgICAgICAgLy8gZm9yIHZvaWNlIGNhbGxzIChmaWxscyB0aGUgYmcpXG4gICAgICAgIGxldCBjb250ZW50VmlldzogUmVhY3QuUmVhY3ROb2RlO1xuXG4gICAgICAgIGNvbnN0IHRyYW5zZmVyZWVDYWxsID0gQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRUcmFuc2ZlcmVlRm9yQ2FsbElkKHRoaXMucHJvcHMuY2FsbC5jYWxsSWQpO1xuICAgICAgICBjb25zdCBpc09uSG9sZCA9IHRoaXMuc3RhdGUuaXNMb2NhbE9uSG9sZCB8fCB0aGlzLnN0YXRlLmlzUmVtb3RlT25Ib2xkO1xuICAgICAgICBsZXQgaG9sZFRyYW5zZmVyQ29udGVudDtcbiAgICAgICAgaWYgKHRyYW5zZmVyZWVDYWxsKSB7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2ZlclRhcmdldFJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShcbiAgICAgICAgICAgICAgICBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLnJvb21JZEZvckNhbGwodGhpcy5wcm9wcy5jYWxsKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2ZlclRhcmdldE5hbWUgPSB0cmFuc2ZlclRhcmdldFJvb20gPyB0cmFuc2ZlclRhcmdldFJvb20ubmFtZSA6IF90KFwidW5rbm93biBwZXJzb25cIik7XG5cbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZmVyZWVSb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oXG4gICAgICAgICAgICAgICAgQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5yb29tSWRGb3JDYWxsKHRyYW5zZmVyZWVDYWxsKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2ZlcmVlTmFtZSA9IHRyYW5zZmVyZWVSb29tID8gdHJhbnNmZXJlZVJvb20ubmFtZSA6IF90KFwidW5rbm93biBwZXJzb25cIik7XG5cbiAgICAgICAgICAgIGhvbGRUcmFuc2ZlckNvbnRlbnQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0NhbGxWaWV3X2hvbGRUcmFuc2ZlckNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29uc3VsdGluZyB3aXRoICUodHJhbnNmZXJUYXJnZXQpcy4gPGE+VHJhbnNmZXIgdG8gJSh0cmFuc2ZlcmVlKXM8L2E+XCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyVGFyZ2V0OiB0cmFuc2ZlclRhcmdldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2ZlcmVlOiB0cmFuc2ZlcmVlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17dGhpcy5vblRyYW5zZmVyQ2xpY2t9PntzdWJ9PC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKGlzT25Ib2xkKSB7XG4gICAgICAgICAgICBsZXQgb25Ib2xkVGV4dCA9IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc1JlbW90ZU9uSG9sZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhvbGRTdHJpbmcgPSBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLmhhc0FueVVuaGVsZENhbGwoKSA/XG4gICAgICAgICAgICAgICAgICAgIF90ZChcIllvdSBoZWxkIHRoZSBjYWxsIDxhPlN3aXRjaDwvYT5cIikgOiBfdGQoXCJZb3UgaGVsZCB0aGUgY2FsbCA8YT5SZXN1bWU8L2E+XCIpO1xuICAgICAgICAgICAgICAgIG9uSG9sZFRleHQgPSBfdChob2xkU3RyaW5nLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9uQ2FsbFJlc3VtZUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzdWJ9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaXNMb2NhbE9uSG9sZCkge1xuICAgICAgICAgICAgICAgIG9uSG9sZFRleHQgPSBfdChcIiUocGVlck5hbWUpcyBoZWxkIHRoZSBjYWxsXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcGVlck5hbWU6IHRoaXMucHJvcHMuY2FsbC5nZXRPcHBvbmVudE1lbWJlcigpLm5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob2xkVHJhbnNmZXJDb250ZW50ID0gPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19ob2xkVHJhbnNmZXJDb250ZW50XCI+XG4gICAgICAgICAgICAgICAge29uSG9sZFRleHR9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5jYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvKSB7XG4gICAgICAgICAgICBsZXQgbG9jYWxWaWRlb0ZlZWQgPSBudWxsO1xuICAgICAgICAgICAgbGV0IG9uSG9sZEJhY2tncm91bmQgPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgYmFja2dyb3VuZFN0eWxlOiBDU1NQcm9wZXJ0aWVzID0ge307XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgbXhfQ2FsbFZpZXdfdmlkZW86IHRydWUsXG4gICAgICAgICAgICAgICAgbXhfQ2FsbFZpZXdfdmlkZW9faG9sZDogaXNPbkhvbGQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpc09uSG9sZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tncm91bmRBdmF0YXJVcmwgPSBhdmF0YXJVcmxGb3JNZW1iZXIoXG4gICAgICAgICAgICAgICAgICAgIC8vIGlzIGl0IHdvcnRoIGdldHRpbmcgdGhlIHNpemUgb2YgdGhlIGRpdiB0byBwYXNzIGhlcmU/XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2FsbC5nZXRPcHBvbmVudE1lbWJlcigpLCAxMDI0LCAxMDI0LCAnY3JvcCcsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgYmFja2dyb3VuZEF2YXRhclVybCArICcpJztcbiAgICAgICAgICAgICAgICBvbkhvbGRCYWNrZ3JvdW5kID0gPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld192aWRlb19ob2xkQmFja2dyb3VuZFwiIHN0eWxlPXtiYWNrZ3JvdW5kU3R5bGV9IC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnZpZE11dGVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWaWRlb0ZlZWQgPSA8VmlkZW9GZWVkIHR5cGU9e1ZpZGVvRmVlZFR5cGUuTG9jYWx9IGNhbGw9e3RoaXMucHJvcHMuY2FsbH0gLz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRlbnRWaWV3ID0gPGRpdiBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzZXN9IHJlZj17dGhpcy5jb250ZW50UmVmfSBvbk1vdXNlTW92ZT17dGhpcy5vbk1vdXNlTW92ZX0+XG4gICAgICAgICAgICAgICAge29uSG9sZEJhY2tncm91bmR9XG4gICAgICAgICAgICAgICAgPFZpZGVvRmVlZCB0eXBlPXtWaWRlb0ZlZWRUeXBlLlJlbW90ZX0gY2FsbD17dGhpcy5wcm9wcy5jYWxsfSBvblJlc2l6ZT17dGhpcy5wcm9wcy5vblJlc2l6ZX0gLz5cbiAgICAgICAgICAgICAgICB7bG9jYWxWaWRlb0ZlZWR9XG4gICAgICAgICAgICAgICAge2hvbGRUcmFuc2ZlckNvbnRlbnR9XG4gICAgICAgICAgICAgICAge2NhbGxDb250cm9sc31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YXRhclNpemUgPSB0aGlzLnByb3BzLnBpcE1vZGUgPyA3NiA6IDE2MDtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICBteF9DYWxsVmlld192b2ljZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBteF9DYWxsVmlld192b2ljZV9ob2xkOiBpc09uSG9sZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb250ZW50VmlldyA9IDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSBvbk1vdXNlTW92ZT17dGhpcy5vbk1vdXNlTW92ZX0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld192b2ljZV9hdmF0YXJzQ29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfdm9pY2VfYXZhdGFyQ29udGFpbmVyXCIgc3R5bGU9e3t3aWR0aDogYXZhdGFyU2l6ZSwgaGVpZ2h0OiBhdmF0YXJTaXplfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e2NhbGxSb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtob2xkVHJhbnNmZXJDb250ZW50fVxuICAgICAgICAgICAgICAgIHtjYWxsQ29udHJvbHN9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjYWxsVHlwZVRleHQgPSB0aGlzLnByb3BzLmNhbGwudHlwZSA9PT0gQ2FsbFR5cGUuVmlkZW8gPyBfdChcIlZpZGVvIENhbGxcIikgOiBfdChcIlZvaWNlIENhbGxcIik7XG4gICAgICAgIGxldCBteUNsYXNzTmFtZTtcblxuICAgICAgICBsZXQgZnVsbFNjcmVlbkJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FsbC50eXBlID09PSBDYWxsVHlwZS5WaWRlbyAmJiAhdGhpcy5wcm9wcy5waXBNb2RlKSB7XG4gICAgICAgICAgICBmdWxsU2NyZWVuQnV0dG9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfYnV0dG9uIG14X0NhbGxWaWV3X2hlYWRlcl9idXR0b25fZnVsbHNjcmVlblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkZ1bGxzY3JlZW5DbGlja30gdGl0bGU9e190KFwiRmlsbCBTY3JlZW5cIil9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBleHBhbmRCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBpcE1vZGUpIHtcbiAgICAgICAgICAgIGV4cGFuZEJ1dHRvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyX2J1dHRvbiBteF9DYWxsVmlld19oZWFkZXJfYnV0dG9uX2V4cGFuZFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkV4cGFuZENsaWNrfSB0aXRsZT17X3QoXCJSZXR1cm4gdG8gY2FsbFwiKX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGVhZGVyQ29udHJvbHMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0NhbGxWaWV3X2hlYWRlcl9jb250cm9sc1wiPlxuICAgICAgICAgICAge2Z1bGxTY3JlZW5CdXR0b259XG4gICAgICAgICAgICB7ZXhwYW5kQnV0dG9ufVxuICAgICAgICA8L2Rpdj47XG5cbiAgICAgICAgbGV0IGhlYWRlcjogUmVhY3QuUmVhY3ROb2RlO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMucGlwTW9kZSkge1xuICAgICAgICAgICAgaGVhZGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NhbGxWaWV3X2hlYWRlcl9waG9uZUljb25cIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfY2FsbFR5cGVcIj57Y2FsbFR5cGVUZXh0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7aGVhZGVyQ29udHJvbHN9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICBteUNsYXNzTmFtZSA9ICdteF9DYWxsVmlld19sYXJnZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgc2Vjb25kYXJ5Q2FsbEluZm87XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWNvbmRhcnlDYWxsKSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5Q2FsbEluZm8gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfc2Vjb25kYXJ5Q2FsbEluZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gZWxlbWVudD0nc3Bhbicgb25DbGljaz17dGhpcy5vblNlY29uZGFyeVJvb21BdmF0YXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtzZWNDYWxsUm9vbX0gaGVpZ2h0PXsxNn0gd2lkdGg9ezE2fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfc2Vjb25kYXJ5Q2FsbF9yb29tTmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIiUobmFtZSlzIG9uIGhvbGRcIiwgeyBuYW1lOiBzZWNDYWxsUm9vbS5uYW1lIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGVhZGVyID0gPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uUm9vbUF2YXRhckNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgPFJvb21BdmF0YXIgcm9vbT17Y2FsbFJvb219IGhlaWdodD17MzJ9IHdpZHRoPXszMn0gLz5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfY2FsbEluZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfcm9vbU5hbWVcIj57Y2FsbFJvb20ubmFtZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfY2FsbFR5cGVTbWFsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2NhbGxUeXBlVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWNvbmRhcnlDYWxsSW5mb31cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge2hlYWRlckNvbnRyb2xzfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgbXlDbGFzc05hbWUgPSAnbXhfQ2FsbFZpZXdfcGlwJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17XCJteF9DYWxsVmlldyBcIiArIG15Q2xhc3NOYW1lfT5cbiAgICAgICAgICAgIHtoZWFkZXJ9XG4gICAgICAgICAgICB7Y29udGVudFZpZXd9XG4gICAgICAgICAgICB7ZGlhbFBhZH1cbiAgICAgICAgICAgIHtjb250ZXh0TWVudX1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==