"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2015, 2016 OpenMarket Ltd
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

const HEADER_HEIGHT = 44;
const BOTTOM_PADDING = 10;
const BOTTOM_MARGIN_TOP_BOTTOM = 10; // top margin plus bottom margin

const CONTEXT_MENU_VPADDING = 8; // How far the context menu sits above the button (px)

class CallView extends _react.default.Component
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
      const userFacingRoomId = _CallHandler.default.roomIdForCall(this.props.call);

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
      const userFacingRoomId = _CallHandler.default.roomIdForCall(this.props.call);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: userFacingRoomId
      });
    });
    (0, _defineProperty2.default)(this, "onSecondaryRoomAvatarClick", () => {
      const userFacingRoomId = _CallHandler.default.roomIdForCall(this.props.secondaryCall);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: userFacingRoomId
      });
    });
    (0, _defineProperty2.default)(this, "onCallResumeClick", () => {
      const userFacingRoomId = _CallHandler.default.roomIdForCall(this.props.call);

      _CallHandler.default.sharedInstance().setActiveCallRoomId(userFacingRoomId);
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

    const callRoomId = _CallHandler.default.roomIdForCall(this.props.call);

    const secondaryCallRoomId = _CallHandler.default.roomIdForCall(this.props.secondaryCall);

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
    const isOnHold = this.state.isLocalOnHold || this.state.isRemoteOnHold;
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

    if (this.props.call.type === _call.CallType.Video) {
      let localVideoFeed = null;
      let onHoldContent = null;
      let onHoldBackground = null;
      const backgroundStyle
      /*: CSSProperties*/
      = {};
      const containerClasses = (0, _classnames.default)({
        mx_CallView_video: true,
        mx_CallView_video_hold: isOnHold
      });

      if (isOnHold) {
        onHoldContent = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_CallView_video_holdContent"
        }, onHoldText);
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
      } // if we're fullscreen, we don't want to set a maxHeight on the video element.


      const maxVideoHeight = getFullScreenElement() ? null : this.props.maxVideoHeight - (HEADER_HEIGHT + BOTTOM_PADDING + BOTTOM_MARGIN_TOP_BOTTOM);
      contentView = /*#__PURE__*/_react.default.createElement("div", {
        className: containerClasses,
        ref: this.contentRef,
        onMouseMove: this.onMouseMove // Put the max height on here too because this div is ended up 4px larger than the content
        // and is causing it to scroll, and I am genuinely baffled as to why.
        ,
        style: {
          maxHeight: maxVideoHeight
        }
      }, onHoldBackground, /*#__PURE__*/_react.default.createElement(_VideoFeed.default, {
        type: _VideoFeed.VideoFeedType.Remote,
        call: this.props.call,
        onResize: this.props.onResize,
        maxHeight: maxVideoHeight
      }), localVideoFeed, onHoldContent, callControls);
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
      }))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CallView_voice_holdText"
      }, onHoldText), callControls);
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

}

exports.default = CallView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvQ2FsbFZpZXcudHN4Il0sIm5hbWVzIjpbImdldEZ1bGxTY3JlZW5FbGVtZW50IiwiZG9jdW1lbnQiLCJmdWxsc2NyZWVuRWxlbWVudCIsIndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IiwibXNGdWxsc2NyZWVuRWxlbWVudCIsInJlcXVlc3RGdWxsc2NyZWVuIiwiZWxlbWVudCIsIm1ldGhvZCIsIndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIiwibXNSZXF1ZXN0RnVsbHNjcmVlbiIsImNhbGwiLCJleGl0RnVsbHNjcmVlbiIsImV4aXRNZXRob2QiLCJ3ZWJraXRFeGl0RnVsbHNjcmVlbiIsIm1zRXhpdEZ1bGxzY3JlZW4iLCJDT05UUk9MU19ISURFX0RFTEFZIiwiSEVBREVSX0hFSUdIVCIsIkJPVFRPTV9QQURESU5HIiwiQk9UVE9NX01BUkdJTl9UT1BfQk9UVE9NIiwiQ09OVEVYVF9NRU5VX1ZQQURESU5HIiwiQ2FsbFZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwYXlsb2FkIiwiYWN0aW9uIiwiY29udGVudFJlZiIsImN1cnJlbnQiLCJmdWxsc2NyZWVuIiwic3RhdGUiLCJzZXRTdGF0ZSIsImNhbGxTdGF0ZSIsImlzTG9jYWxPbkhvbGQiLCJpc1JlbW90ZU9uSG9sZCIsImRpcyIsImRpc3BhdGNoIiwidXNlckZhY2luZ1Jvb21JZCIsIkNhbGxIYW5kbGVyIiwicm9vbUlkRm9yQ2FsbCIsInJvb21faWQiLCJjb250cm9sc0hpZGVUaW1lciIsImNvbnRyb2xzVmlzaWJsZSIsInNob3dDb250cm9scyIsInNob3dEaWFscGFkIiwiY2xlYXJUaW1lb3V0Iiwid2luZG93Iiwic2V0VGltZW91dCIsIm9uQ29udHJvbHNIaWRlVGltZXIiLCJuZXdWYWwiLCJtaWNNdXRlZCIsInNldE1pY3JvcGhvbmVNdXRlZCIsInZpZE11dGVkIiwic2V0TG9jYWxWaWRlb011dGVkIiwic2hvd01vcmVNZW51IiwiZXYiLCJoYW5kbGVkIiwiY3RybENtZE9ubHkiLCJrZXkiLCJLZXkiLCJEIiwib25NaWNNdXRlQ2xpY2siLCJFIiwib25WaWRNdXRlQ2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInNlY29uZGFyeUNhbGwiLCJzaGFyZWRJbnN0YW5jZSIsInNldEFjdGl2ZUNhbGxSb29tSWQiLCJpc01pY3JvcGhvbmVNdXRlZCIsImlzTG9jYWxWaWRlb011dGVkIiwidXBkYXRlQ2FsbExpc3RlbmVycyIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJhZGRFdmVudExpc3RlbmVyIiwib25OYXRpdmVLZXlEb3duIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwidW5yZWdpc3RlciIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsIm9sZENhbGwiLCJuZXdDYWxsIiwicmVtb3ZlTGlzdGVuZXIiLCJDYWxsRXZlbnQiLCJTdGF0ZSIsIm9uQ2FsbFN0YXRlIiwiTG9jYWxIb2xkVW5ob2xkIiwib25DYWxsTG9jYWxIb2xkVW5ob2xkIiwiUmVtb3RlSG9sZFVuaG9sZCIsIm9uQ2FsbFJlbW90ZUhvbGRVbmhvbGQiLCJvbiIsInJlbmRlciIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImNhbGxSb29tSWQiLCJzZWNvbmRhcnlDYWxsUm9vbUlkIiwiY2FsbFJvb20iLCJnZXRSb29tIiwic2VjQ2FsbFJvb20iLCJkaWFsUGFkIiwiY29udGV4dE1lbnUiLCJkaWFscGFkQnV0dG9uIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiQ2hldnJvbkZhY2UiLCJOb25lIiwiY2xvc2VEaWFscGFkIiwiY29udGV4dE1lbnVCdXR0b24iLCJjbG9zZUNvbnRleHRNZW51IiwibWljQ2xhc3NlcyIsIm14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b24iLCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX21pY09uIiwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9taWNPZmYiLCJ2aWRDbGFzc2VzIiwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl92aWRPbiIsIm14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fdmlkT2ZmIiwibWljQ2FjaGVDbGFzc2VzIiwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9pbnZpc2libGUiLCJ2aWRDYWNoZUNsYXNzZXMiLCJjYWxsQ29udHJvbHNDbGFzc2VzIiwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzIiwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2hpZGRlbiIsInZpZE11dGVCdXR0b24iLCJ0eXBlIiwiQ2FsbFR5cGUiLCJWaWRlbyIsIkNhbGxTdGF0ZSIsIkNvbm5lY3RlZCIsIm9uRGlhbHBhZENsaWNrIiwib25Nb3JlQ2xpY2siLCJjYWxsQ29udHJvbHMiLCJjb250ZW50VmlldyIsImlzT25Ib2xkIiwib25Ib2xkVGV4dCIsImhvbGRTdHJpbmciLCJoYXNBbnlVbmhlbGRDYWxsIiwiYSIsInN1YiIsIm9uQ2FsbFJlc3VtZUNsaWNrIiwicGVlck5hbWUiLCJnZXRPcHBvbmVudE1lbWJlciIsIm5hbWUiLCJsb2NhbFZpZGVvRmVlZCIsIm9uSG9sZENvbnRlbnQiLCJvbkhvbGRCYWNrZ3JvdW5kIiwiYmFja2dyb3VuZFN0eWxlIiwiY29udGFpbmVyQ2xhc3NlcyIsIm14X0NhbGxWaWV3X3ZpZGVvIiwibXhfQ2FsbFZpZXdfdmlkZW9faG9sZCIsImJhY2tncm91bmRBdmF0YXJVcmwiLCJiYWNrZ3JvdW5kSW1hZ2UiLCJWaWRlb0ZlZWRUeXBlIiwiTG9jYWwiLCJtYXhWaWRlb0hlaWdodCIsIm9uTW91c2VNb3ZlIiwibWF4SGVpZ2h0IiwiUmVtb3RlIiwib25SZXNpemUiLCJhdmF0YXJTaXplIiwicGlwTW9kZSIsImNsYXNzZXMiLCJteF9DYWxsVmlld192b2ljZSIsIm14X0NhbGxWaWV3X3ZvaWNlX2hvbGQiLCJ3aWR0aCIsImhlaWdodCIsImNhbGxUeXBlVGV4dCIsIm15Q2xhc3NOYW1lIiwiZnVsbFNjcmVlbkJ1dHRvbiIsIm9uRnVsbHNjcmVlbkNsaWNrIiwiZXhwYW5kQnV0dG9uIiwib25FeHBhbmRDbGljayIsImhlYWRlckNvbnRyb2xzIiwiaGVhZGVyIiwic2Vjb25kYXJ5Q2FsbEluZm8iLCJvblNlY29uZGFyeVJvb21BdmF0YXJDbGljayIsIm9uUm9vbUF2YXRhckNsaWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbURBLFNBQVNBLG9CQUFULEdBQWdDO0FBQzVCLFNBQ0lDLFFBQVEsQ0FBQ0MsaUJBQVQsSUFDQTtBQUNBRCxFQUFBQSxRQUFRLENBQUNFLHVCQUZULElBR0FGLFFBQVEsQ0FBQ0csbUJBSmI7QUFNSDs7QUFFRCxTQUFTQyxpQkFBVCxDQUEyQkM7QUFBM0I7QUFBQSxFQUE2QztBQUN6QyxRQUFNQyxNQUFNLEdBQ1JELE9BQU8sQ0FBQ0QsaUJBQVIsSUFDQTtBQUNBQyxFQUFBQSxPQUFPLENBQUNFLHVCQUZSLElBR0FGLE9BQU8sQ0FBQ0csbUJBSlo7QUFNQSxNQUFJRixNQUFKLEVBQVlBLE1BQU0sQ0FBQ0csSUFBUCxDQUFZSixPQUFaO0FBQ2Y7O0FBRUQsU0FBU0ssY0FBVCxHQUEwQjtBQUN0QixRQUFNQyxVQUFVLEdBQ1pYLFFBQVEsQ0FBQ1UsY0FBVCxJQUNBVixRQUFRLENBQUNZLG9CQURULElBRUFaLFFBQVEsQ0FBQ2EsZ0JBSGI7QUFLQSxNQUFJRixVQUFKLEVBQWdCQSxVQUFVLENBQUNGLElBQVgsQ0FB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RUFBQztBQUFmLHNCQUNJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUE4Q0EsUUFBUSxDQUFDNEMsSUFBdkQsQ0FESixlQUVJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixTQUNLd0IsWUFETCxFQUVLUSxpQkFGTCxDQUZKLENBSkssRUFXSkYsY0FYSSxDQUFUO0FBYUFMLE1BQUFBLFdBQVcsR0FBRyxpQkFBZDtBQUNIOztBQUVELHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUUsaUJBQWlCQTtBQUFqQyxPQUNGTSxNQURFLEVBRUZ6QyxXQUZFLEVBR0YvQixPQUhFLEVBSUZDLFdBSkUsQ0FBUDtBQU1IOztBQTFnQmlFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYsIENTU1Byb3BlcnRpZXMgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgQ2FsbEhhbmRsZXIgZnJvbSAnLi4vLi4vLi4vQ2FsbEhhbmRsZXInO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBWaWRlb0ZlZWQsIHsgVmlkZW9GZWVkVHlwZSB9IGZyb20gXCIuL1ZpZGVvRmVlZFwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IHsgQ2FsbFN0YXRlLCBDYWxsVHlwZSwgTWF0cml4Q2FsbCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsJztcbmltcG9ydCB7IENhbGxFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQge2lzT25seUN0cmxPckNtZEtleUV2ZW50LCBLZXl9IGZyb20gJy4uLy4uLy4uL0tleWJvYXJkJztcbmltcG9ydCB7YWx3YXlzQWJvdmVMZWZ0T2YsIGFsd2F5c0Fib3ZlUmlnaHRPZiwgQ2hldnJvbkZhY2UsIENvbnRleHRNZW51QnV0dG9ufSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51JztcbmltcG9ydCBDYWxsQ29udGV4dE1lbnUgZnJvbSAnLi4vY29udGV4dF9tZW51cy9DYWxsQ29udGV4dE1lbnUnO1xuaW1wb3J0IHsgYXZhdGFyVXJsRm9yTWVtYmVyIH0gZnJvbSAnLi4vLi4vLi4vQXZhdGFyJztcbmltcG9ydCBEaWFscGFkQ29udGV4dE1lbnUgZnJvbSAnLi4vY29udGV4dF9tZW51cy9EaWFscGFkQ29udGV4dE1lbnUnO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAgICAgLy8gVGhlIGNhbGwgZm9yIHVzIHRvIGRpc3BsYXlcbiAgICAgICAgY2FsbDogTWF0cml4Q2FsbCxcblxuICAgICAgICAvLyBBbm90aGVyIG9uZ29pbmcgY2FsbCB0byBkaXNwbGF5IGluZm9ybWF0aW9uIGFib3V0XG4gICAgICAgIHNlY29uZGFyeUNhbGw/OiBNYXRyaXhDYWxsLFxuXG4gICAgICAgIC8vIG1heEhlaWdodCBzdHlsZSBhdHRyaWJ1dGUgZm9yIHRoZSB2aWRlbyBwYW5lbFxuICAgICAgICBtYXhWaWRlb0hlaWdodD86IG51bWJlcjtcblxuICAgICAgICAvLyBhIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSBjb250ZW50IGluIHRoZSBjYWxsdmlldyBjaGFuZ2VzXG4gICAgICAgIC8vIGluIGEgd2F5IHRoYXQgaXMgbGlrZWx5IHRvIGNhdXNlIGEgcmVzaXplLlxuICAgICAgICBvblJlc2l6ZT86IGFueTtcblxuICAgICAgICAvLyBXaGV0aGVyIHRoaXMgY2FsbCB2aWV3IGlzIGZvciBwaWN0dXJlLWluLXBpY3R1ZSBtb2RlXG4gICAgICAgIC8vIG90aGVyd2lzZSwgaXQncyB0aGUgbGFyZ2VyIGNhbGwgdmlldyB3aGVuIHZpZXdpbmcgdGhlIHJvb20gdGhlIGNhbGwgaXMgaW4uXG4gICAgICAgIC8vIFRoaXMgaXMgc29ydCBvZiBhIHByb3h5IGZvciBhIG51bWJlciBvZiB0aGluZ3MgYnV0IHdlIGN1cnJlbnRseSBoYXZlIG5vXG4gICAgICAgIC8vIG5lZWQgdG8gY29udHJvbCB0aG9zZSB0aGluZ3Mgc2VwYXJhdGVseSwgc28gdGhpcyBpcyBzaW1wbGVyLlxuICAgICAgICBwaXBNb2RlPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgaXNMb2NhbE9uSG9sZDogYm9vbGVhbixcbiAgICBpc1JlbW90ZU9uSG9sZDogYm9vbGVhbixcbiAgICBtaWNNdXRlZDogYm9vbGVhbixcbiAgICB2aWRNdXRlZDogYm9vbGVhbixcbiAgICBjYWxsU3RhdGU6IENhbGxTdGF0ZSxcbiAgICBjb250cm9sc1Zpc2libGU6IGJvb2xlYW4sXG4gICAgc2hvd01vcmVNZW51OiBib29sZWFuLFxuICAgIHNob3dEaWFscGFkOiBib29sZWFuLFxufVxuXG5mdW5jdGlvbiBnZXRGdWxsU2NyZWVuRWxlbWVudCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fFxuICAgICAgICAvLyBtb3ogb21pdHRlZCBiZWNhdXNlIGZpcmVmb3ggc3VwcG9ydHMgdGhpcyB1bnByZWZpeGVkIG5vdyAod2Via2l0IGhlcmUgZm9yIHNhZmFyaSlcbiAgICAgICAgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgfHxcbiAgICAgICAgZG9jdW1lbnQubXNGdWxsc2NyZWVuRWxlbWVudFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RGdWxsc2NyZWVuKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICBjb25zdCBtZXRob2QgPSAoXG4gICAgICAgIGVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4gfHxcbiAgICAgICAgLy8gbW96IG9taXR0ZWQgc2luY2UgZmlyZWZveCBzdXBwb3J0cyB1bnByZWZpeGVkIG5vd1xuICAgICAgICBlbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIHx8XG4gICAgICAgIGVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlblxuICAgICk7XG4gICAgaWYgKG1ldGhvZCkgbWV0aG9kLmNhbGwoZWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIGV4aXRGdWxsc2NyZWVuKCkge1xuICAgIGNvbnN0IGV4aXRNZXRob2QgPSAoXG4gICAgICAgIGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuIHx8XG4gICAgICAgIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuIHx8XG4gICAgICAgIGRvY3VtZW50Lm1zRXhpdEZ1bGxzY3JlZW5cbiAgICApO1xuICAgIGlmIChleGl0TWV0aG9kKSBleGl0TWV0aG9kLmNhbGwoZG9jdW1lbnQpO1xufVxuXG5jb25zdCBDT05UUk9MU19ISURFX0RFTEFZID0gMTAwMDtcbi8vIEhlaWdodCBvZiB0aGUgaGVhZGVyIGR1cGxpY2F0ZWQgZnJvbSBDU1MgYmVjYXVzZSB3ZSBuZWVkIHRvIHN1YnRyYWN0IGl0IGZyb20gb3VyIG1heFxuLy8gaGVpZ2h0IHRvIGdldCB0aGUgbWF4IGhlaWdodCBvZiB0aGUgdmlkZW9cbmNvbnN0IEhFQURFUl9IRUlHSFQgPSA0NDtcbmNvbnN0IEJPVFRPTV9QQURESU5HID0gMTA7XG5jb25zdCBCT1RUT01fTUFSR0lOX1RPUF9CT1RUT00gPSAxMDsgLy8gdG9wIG1hcmdpbiBwbHVzIGJvdHRvbSBtYXJnaW5cbmNvbnN0IENPTlRFWFRfTUVOVV9WUEFERElORyA9IDg7IC8vIEhvdyBmYXIgdGhlIGNvbnRleHQgbWVudSBzaXRzIGFib3ZlIHRoZSBidXR0b24gKHB4KVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYWxsVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgY29udGVudFJlZiA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGNvbnRyb2xzSGlkZVRpbWVyOiBudW1iZXIgPSBudWxsO1xuICAgIHByaXZhdGUgZGlhbHBhZEJ1dHRvbiA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGNvbnRleHRNZW51QnV0dG9uID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGlzTG9jYWxPbkhvbGQ6IHRoaXMucHJvcHMuY2FsbC5pc0xvY2FsT25Ib2xkKCksXG4gICAgICAgICAgICBpc1JlbW90ZU9uSG9sZDogdGhpcy5wcm9wcy5jYWxsLmlzUmVtb3RlT25Ib2xkKCksXG4gICAgICAgICAgICBtaWNNdXRlZDogdGhpcy5wcm9wcy5jYWxsLmlzTWljcm9waG9uZU11dGVkKCksXG4gICAgICAgICAgICB2aWRNdXRlZDogdGhpcy5wcm9wcy5jYWxsLmlzTG9jYWxWaWRlb011dGVkKCksXG4gICAgICAgICAgICBjYWxsU3RhdGU6IHRoaXMucHJvcHMuY2FsbC5zdGF0ZSxcbiAgICAgICAgICAgIGNvbnRyb2xzVmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dNb3JlTWVudTogZmFsc2UsXG4gICAgICAgICAgICBzaG93RGlhbHBhZDogZmFsc2UsXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxMaXN0ZW5lcnMobnVsbCwgdGhpcy5wcm9wcy5jYWxsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25OYXRpdmVLZXlEb3duKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmIChnZXRGdWxsU2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICAgICAgICBleGl0RnVsbHNjcmVlbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbk5hdGl2ZUtleURvd24pO1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxMaXN0ZW5lcnModGhpcy5wcm9wcy5jYWxsLCBudWxsKTtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcykge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jYWxsID09PSBwcmV2UHJvcHMuY2FsbCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNMb2NhbE9uSG9sZDogdGhpcy5wcm9wcy5jYWxsLmlzTG9jYWxPbkhvbGQoKSxcbiAgICAgICAgICAgIGlzUmVtb3RlT25Ib2xkOiB0aGlzLnByb3BzLmNhbGwuaXNSZW1vdGVPbkhvbGQoKSxcbiAgICAgICAgICAgIG1pY011dGVkOiB0aGlzLnByb3BzLmNhbGwuaXNNaWNyb3Bob25lTXV0ZWQoKSxcbiAgICAgICAgICAgIHZpZE11dGVkOiB0aGlzLnByb3BzLmNhbGwuaXNMb2NhbFZpZGVvTXV0ZWQoKSxcbiAgICAgICAgICAgIGNhbGxTdGF0ZTogdGhpcy5wcm9wcy5jYWxsLnN0YXRlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxMaXN0ZW5lcnMobnVsbCwgdGhpcy5wcm9wcy5jYWxsKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAndmlkZW9fZnVsbHNjcmVlbic6IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29udGVudFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuZnVsbHNjcmVlbikge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0RnVsbHNjcmVlbih0aGlzLmNvbnRlbnRSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnZXRGdWxsU2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlQ2FsbExpc3RlbmVycyhvbGRDYWxsOiBNYXRyaXhDYWxsLCBuZXdDYWxsOiBNYXRyaXhDYWxsKSB7XG4gICAgICAgIGlmIChvbGRDYWxsID09PSBuZXdDYWxsKSByZXR1cm47XG5cbiAgICAgICAgaWYgKG9sZENhbGwpIHtcbiAgICAgICAgICAgIG9sZENhbGwucmVtb3ZlTGlzdGVuZXIoQ2FsbEV2ZW50LlN0YXRlLCB0aGlzLm9uQ2FsbFN0YXRlKTtcbiAgICAgICAgICAgIG9sZENhbGwucmVtb3ZlTGlzdGVuZXIoQ2FsbEV2ZW50LkxvY2FsSG9sZFVuaG9sZCwgdGhpcy5vbkNhbGxMb2NhbEhvbGRVbmhvbGQpO1xuICAgICAgICAgICAgb2xkQ2FsbC5yZW1vdmVMaXN0ZW5lcihDYWxsRXZlbnQuUmVtb3RlSG9sZFVuaG9sZCwgdGhpcy5vbkNhbGxSZW1vdGVIb2xkVW5ob2xkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3Q2FsbCkge1xuICAgICAgICAgICAgbmV3Q2FsbC5vbihDYWxsRXZlbnQuU3RhdGUsIHRoaXMub25DYWxsU3RhdGUpO1xuICAgICAgICAgICAgbmV3Q2FsbC5vbihDYWxsRXZlbnQuTG9jYWxIb2xkVW5ob2xkLCB0aGlzLm9uQ2FsbExvY2FsSG9sZFVuaG9sZCk7XG4gICAgICAgICAgICBuZXdDYWxsLm9uKENhbGxFdmVudC5SZW1vdGVIb2xkVW5ob2xkLCB0aGlzLm9uQ2FsbFJlbW90ZUhvbGRVbmhvbGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbGxTdGF0ZSA9IChzdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNhbGxTdGF0ZTogc3RhdGUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2FsbExvY2FsSG9sZFVuaG9sZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc0xvY2FsT25Ib2xkOiB0aGlzLnByb3BzLmNhbGwuaXNMb2NhbE9uSG9sZCgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbGxSZW1vdGVIb2xkVW5ob2xkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzUmVtb3RlT25Ib2xkOiB0aGlzLnByb3BzLmNhbGwuaXNSZW1vdGVPbkhvbGQoKSxcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBib3RoIGhlcmUgYmVjYXVzZSBpc0xvY2FsT25Ib2xkIGNoYW5nZXMgd2hlbiB3ZSBob2xkIHRoZSBjYWxsIHRvb1xuICAgICAgICAgICAgaXNMb2NhbE9uSG9sZDogdGhpcy5wcm9wcy5jYWxsLmlzTG9jYWxPbkhvbGQoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25GdWxsc2NyZWVuQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWRlb19mdWxsc2NyZWVuJyxcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRXhwYW5kQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVzZXJGYWNpbmdSb29tSWQgPSBDYWxsSGFuZGxlci5yb29tSWRGb3JDYWxsKHRoaXMucHJvcHMuY2FsbCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdXNlckZhY2luZ1Jvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250cm9sc0hpZGVUaW1lciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5jb250cm9sc0hpZGVUaW1lciA9IG51bGw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29udHJvbHNWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zaG93Q29udHJvbHMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3dDb250cm9scygpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd01vcmVNZW51IHx8IHRoaXMuc3RhdGUuc2hvd0RpYWxwYWQpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY29udHJvbHNWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjb250cm9sc1Zpc2libGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb250cm9sc0hpZGVUaW1lciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY29udHJvbHNIaWRlVGltZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udHJvbHNIaWRlVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLm9uQ29udHJvbHNIaWRlVGltZXIsIENPTlRST0xTX0hJREVfREVMQVkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25EaWFscGFkQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93RGlhbHBhZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udHJvbHNIaWRlVGltZXIpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jb250cm9sc0hpZGVUaW1lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sc0hpZGVUaW1lciA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNob3dEaWFscGFkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xzVmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udHJvbHNIaWRlVGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jb250cm9sc0hpZGVUaW1lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xzSGlkZVRpbWVyID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5vbkNvbnRyb2xzSGlkZVRpbWVyLCBDT05UUk9MU19ISURFX0RFTEFZKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2hvd0RpYWxwYWQ6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTWljTXV0ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdWYWwgPSAhdGhpcy5zdGF0ZS5taWNNdXRlZDtcblxuICAgICAgICB0aGlzLnByb3BzLmNhbGwuc2V0TWljcm9waG9uZU11dGVkKG5ld1ZhbCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe21pY011dGVkOiBuZXdWYWx9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVmlkTXV0ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdWYWwgPSAhdGhpcy5zdGF0ZS52aWRNdXRlZDtcblxuICAgICAgICB0aGlzLnByb3BzLmNhbGwuc2V0TG9jYWxWaWRlb011dGVkKG5ld1ZhbCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZpZE11dGVkOiBuZXdWYWx9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW9yZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb250cm9sc0hpZGVUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY29udHJvbHNIaWRlVGltZXIpO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sc0hpZGVUaW1lciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3dNb3JlTWVudTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRyb2xzVmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbG9zZURpYWxwYWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2hvd0RpYWxwYWQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb250cm9sc0hpZGVUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMub25Db250cm9sc0hpZGVUaW1lciwgQ09OVFJPTFNfSElERV9ERUxBWSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbG9zZUNvbnRleHRNZW51ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3dNb3JlTWVudTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRyb2xzSGlkZVRpbWVyID0gd2luZG93LnNldFRpbWVvdXQodGhpcy5vbkNvbnRyb2xzSGlkZVRpbWVyLCBDT05UUk9MU19ISURFX0RFTEFZKTtcbiAgICB9XG5cbiAgICAvLyB3ZSByZWdpc3RlciBnbG9iYWwgc2hvcnRjdXRzIGhlcmUsIHRoZXkgKm11c3Qgbm90IGNvbmZsaWN0KiB3aXRoIGxvY2FsIHNob3J0Y3V0cyBlbHNld2hlcmUgb3IgYm90aCB3aWxsIGZpcmVcbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBhc3N1bWVzIHdlIGFsd2F5cyBoYXZlIGEgY2FsbHZpZXcgb24gc2NyZWVuIGF0IGFueSBnaXZlbiB0aW1lXG4gICAgLy8gQ2FsbEhhbmRsZXIgd291bGQgcHJvYmFibHkgYmUgYSBiZXR0ZXIgcGxhY2UgZm9yIHRoaXNcbiAgICBwcml2YXRlIG9uTmF0aXZlS2V5RG93biA9IGV2ID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgY3RybENtZE9ubHkgPSBpc09ubHlDdHJsT3JDbWRLZXlFdmVudChldik7XG5cbiAgICAgICAgc3dpdGNoIChldi5rZXkpIHtcbiAgICAgICAgICAgIGNhc2UgS2V5LkQ6XG4gICAgICAgICAgICAgICAgaWYgKGN0cmxDbWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25NaWNNdXRlQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2hvdyB0aGUgY29udHJvbHMgdG8gZ2l2ZSBmZWVkYmFja1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250cm9scygpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgS2V5LkU6XG4gICAgICAgICAgICAgICAgaWYgKGN0cmxDbWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25WaWRNdXRlQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2hvdyB0aGUgY29udHJvbHMgdG8gZ2l2ZSBmZWVkYmFja1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dDb250cm9scygpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tQXZhdGFyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVzZXJGYWNpbmdSb29tSWQgPSBDYWxsSGFuZGxlci5yb29tSWRGb3JDYWxsKHRoaXMucHJvcHMuY2FsbCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdXNlckZhY2luZ1Jvb21JZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlY29uZGFyeVJvb21BdmF0YXJDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdXNlckZhY2luZ1Jvb21JZCA9IENhbGxIYW5kbGVyLnJvb21JZEZvckNhbGwodGhpcy5wcm9wcy5zZWNvbmRhcnlDYWxsKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgIHJvb21faWQ6IHVzZXJGYWNpbmdSb29tSWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DYWxsUmVzdW1lQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVzZXJGYWNpbmdSb29tSWQgPSBDYWxsSGFuZGxlci5yb29tSWRGb3JDYWxsKHRoaXMucHJvcHMuY2FsbCk7XG4gICAgICAgIENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkuc2V0QWN0aXZlQ2FsbFJvb21JZCh1c2VyRmFjaW5nUm9vbUlkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGNhbGxSb29tSWQgPSBDYWxsSGFuZGxlci5yb29tSWRGb3JDYWxsKHRoaXMucHJvcHMuY2FsbCk7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUNhbGxSb29tSWQgPSBDYWxsSGFuZGxlci5yb29tSWRGb3JDYWxsKHRoaXMucHJvcHMuc2Vjb25kYXJ5Q2FsbCk7XG4gICAgICAgIGNvbnN0IGNhbGxSb29tID0gY2xpZW50LmdldFJvb20oY2FsbFJvb21JZCk7XG4gICAgICAgIGNvbnN0IHNlY0NhbGxSb29tID0gdGhpcy5wcm9wcy5zZWNvbmRhcnlDYWxsID8gY2xpZW50LmdldFJvb20oc2Vjb25kYXJ5Q2FsbFJvb21JZCkgOiBudWxsO1xuXG4gICAgICAgIGxldCBkaWFsUGFkO1xuICAgICAgICBsZXQgY29udGV4dE1lbnU7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd0RpYWxwYWQpIHtcbiAgICAgICAgICAgIGRpYWxQYWQgPSA8RGlhbHBhZENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgey4uLmFsd2F5c0Fib3ZlUmlnaHRPZihcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaWFscGFkQnV0dG9uLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICAgICAgICAgIENoZXZyb25GYWNlLk5vbmUsXG4gICAgICAgICAgICAgICAgICAgIENPTlRFWFRfTUVOVV9WUEFERElORyxcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuY2xvc2VEaWFscGFkfVxuICAgICAgICAgICAgICAgIGNhbGw9e3RoaXMucHJvcHMuY2FsbH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd01vcmVNZW51KSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IDxDYWxsQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICB7Li4uYWx3YXlzQWJvdmVMZWZ0T2YoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dE1lbnVCdXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgICAgQ2hldnJvbkZhY2UuTm9uZSxcbiAgICAgICAgICAgICAgICAgICAgQ09OVEVYVF9NRU5VX1ZQQURESU5HLFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5jbG9zZUNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgIGNhbGw9e3RoaXMucHJvcHMuY2FsbH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWljQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fbWljT246ICF0aGlzLnN0YXRlLm1pY011dGVkLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9taWNPZmY6IHRoaXMuc3RhdGUubWljTXV0ZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHZpZENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b246IHRydWUsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX3ZpZE9uOiAhdGhpcy5zdGF0ZS52aWRNdXRlZCxcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fdmlkT2ZmOiB0aGlzLnN0YXRlLnZpZE11dGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQdXQgdGhlIG90aGVyIHN0YXRlcyBvZiB0aGUgbWljL3ZpZGVvIGljb25zIGluIHRoZSBkb2N1bWVudCB0byBtYWtlIHN1cmUgdGhleSdyZSBjYWNoZWRcbiAgICAgICAgLy8gKG90aGVyd2lzZSB0aGUgaWNvbiBkaXNhcHBlYXJzIGJyaWVmbHkgd2hlbiB0b2dnbGVkKVxuICAgICAgICBjb25zdCBtaWNDYWNoZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b246IHRydWUsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX21pY09uOiB0aGlzLnN0YXRlLm1pY011dGVkLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9taWNPZmY6ICF0aGlzLnN0YXRlLm1pY011dGVkLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9pbnZpc2libGU6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHZpZENhY2hlQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fdmlkT246IHRoaXMuc3RhdGUubWljTXV0ZWQsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX3ZpZE9mZjogIXRoaXMuc3RhdGUubWljTXV0ZWQsXG4gICAgICAgICAgICBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX2ludmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2FsbENvbnRyb2xzQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzOiB0cnVlLFxuICAgICAgICAgICAgbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2hpZGRlbjogIXRoaXMuc3RhdGUuY29udHJvbHNWaXNpYmxlLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB2aWRNdXRlQnV0dG9uID0gdGhpcy5wcm9wcy5jYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvID8gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT17dmlkQ2xhc3Nlc31cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25WaWRNdXRlQ2xpY2t9XG4gICAgICAgIC8+IDogbnVsbDtcblxuICAgICAgICAvLyBUaGUgZGlhbCBwYWQgJiAnbW9yZScgYnV0dG9uIGFjdGlvbnMgYXJlIG9ubHkgcmVsZXZhbnQgaW4gYSBjb25uZWN0ZWQgY2FsbFxuICAgICAgICAvLyBXaGVuIG5vdCBjb25uZWN0ZWQsIHdlIGhhdmUgdG8gcHV0IHNvbWV0aGluZyB0aGVyZSB0byBtYWtlIHRoZSBmbGV4Ym94IGFsaWdubWVudCBjb3JyZWN0XG4gICAgICAgIGNvbnN0IGRpYWxwYWRCdXR0b24gPSB0aGlzLnN0YXRlLmNhbGxTdGF0ZSA9PT0gQ2FsbFN0YXRlLkNvbm5lY3RlZCA/IDxDb250ZXh0TWVudUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbiBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfZGlhbHBhZFwiXG4gICAgICAgICAgICBpbnB1dFJlZj17dGhpcy5kaWFscGFkQnV0dG9ufVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkRpYWxwYWRDbGlja31cbiAgICAgICAgICAgIGlzRXhwYW5kZWQ9e3RoaXMuc3RhdGUuc2hvd0RpYWxwYWR9XG4gICAgICAgIC8+IDogPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fZGlhbHBhZF9oaWRkZW5cIiAvPjtcblxuICAgICAgICBjb25zdCBjb250ZXh0TWVudUJ1dHRvbiA9IHRoaXMuc3RhdGUuY2FsbFN0YXRlID09PSBDYWxsU3RhdGUuQ29ubmVjdGVkID8gPENvbnRleHRNZW51QnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uIG14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b25fbW9yZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uTW9yZUNsaWNrfVxuICAgICAgICAgICAgaW5wdXRSZWY9e3RoaXMuY29udGV4dE1lbnVCdXR0b259XG4gICAgICAgICAgICBpc0V4cGFuZGVkPXt0aGlzLnN0YXRlLnNob3dNb3JlTWVudX1cbiAgICAgICAgLz4gOiA8ZGl2IGNsYXNzTmFtZT1cIm14X0NhbGxWaWV3X2NhbGxDb250cm9sc19idXR0b24gbXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbl9tb3JlX2hpZGRlblwiIC8+O1xuXG4gICAgICAgIC8vIGluIHRoZSBuZWFyIGZ1dHVyZSwgdGhlIGRpYWwgcGFkIGJ1dHRvbiB3aWxsIGdvIG9uIHRoZSBsZWZ0LiBGb3Igbm93LCBpdCdzIHRoZSBub3RoaW5nIGJ1dHRvblxuICAgICAgICAvLyBiZWNhdXNlIHNvbWV0aGluZyBuZWVkcyB0byBoYXZlIG1hcmdpbi1yaWdodDogYXV0byB0byBtYWtlIHRoZSBhbGlnbm1lbnQgY29ycmVjdC5cbiAgICAgICAgY29uc3QgY2FsbENvbnRyb2xzID0gPGRpdiBjbGFzc05hbWU9e2NhbGxDb250cm9sc0NsYXNzZXN9PlxuICAgICAgICAgICAge2RpYWxwYWRCdXR0b259XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bWljQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uTWljTXV0ZUNsaWNrfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfY2FsbENvbnRyb2xzX2J1dHRvbiBteF9DYWxsVmlld19jYWxsQ29udHJvbHNfYnV0dG9uX2hhbmd1cFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnaGFuZ3VwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IGNhbGxSb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge3ZpZE11dGVCdXR0b259XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17bWljQ2FjaGVDbGFzc2VzfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3ZpZENhY2hlQ2xhc3Nlc30gLz5cbiAgICAgICAgICAgIHtjb250ZXh0TWVudUJ1dHRvbn1cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIC8vIFRoZSAnY29udGVudCcgZm9yIHRoZSBjYWxsLCBpZS4gdGhlIHZpZGVvcyBmb3IgYSB2aWRlbyBjYWxsIGFuZCBwcm9maWxlIHBpY3R1cmVcbiAgICAgICAgLy8gZm9yIHZvaWNlIGNhbGxzIChmaWxscyB0aGUgYmcpXG4gICAgICAgIGxldCBjb250ZW50VmlldzogUmVhY3QuUmVhY3ROb2RlO1xuXG4gICAgICAgIGNvbnN0IGlzT25Ib2xkID0gdGhpcy5zdGF0ZS5pc0xvY2FsT25Ib2xkIHx8IHRoaXMuc3RhdGUuaXNSZW1vdGVPbkhvbGQ7XG4gICAgICAgIGxldCBvbkhvbGRUZXh0ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNSZW1vdGVPbkhvbGQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhvbGRTdHJpbmcgPSBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLmhhc0FueVVuaGVsZENhbGwoKSA/XG4gICAgICAgICAgICAgICAgX3RkKFwiWW91IGhlbGQgdGhlIGNhbGwgPGE+U3dpdGNoPC9hPlwiKSA6IF90ZChcIllvdSBoZWxkIHRoZSBjYWxsIDxhPlJlc3VtZTwvYT5cIik7XG4gICAgICAgICAgICBvbkhvbGRUZXh0ID0gX3QoaG9sZFN0cmluZywge30sIHtcbiAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9uQ2FsbFJlc3VtZUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAge3N1Yn1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pc0xvY2FsT25Ib2xkKSB7XG4gICAgICAgICAgICBvbkhvbGRUZXh0ID0gX3QoXCIlKHBlZXJOYW1lKXMgaGVsZCB0aGUgY2FsbFwiLCB7XG4gICAgICAgICAgICAgICAgcGVlck5hbWU6IHRoaXMucHJvcHMuY2FsbC5nZXRPcHBvbmVudE1lbWJlcigpLm5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNhbGwudHlwZSA9PT0gQ2FsbFR5cGUuVmlkZW8pIHtcbiAgICAgICAgICAgIGxldCBsb2NhbFZpZGVvRmVlZCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgb25Ib2xkQ29udGVudCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgb25Ib2xkQmFja2dyb3VuZCA9IG51bGw7XG4gICAgICAgICAgICBjb25zdCBiYWNrZ3JvdW5kU3R5bGU6IENTU1Byb3BlcnRpZXMgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICBteF9DYWxsVmlld192aWRlbzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBteF9DYWxsVmlld192aWRlb19ob2xkOiBpc09uSG9sZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGlzT25Ib2xkKSB7XG4gICAgICAgICAgICAgICAgb25Ib2xkQ29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfdmlkZW9faG9sZENvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAge29uSG9sZFRleHR9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tncm91bmRBdmF0YXJVcmwgPSBhdmF0YXJVcmxGb3JNZW1iZXIoXG4gICAgICAgICAgICAgICAgICAgIC8vIGlzIGl0IHdvcnRoIGdldHRpbmcgdGhlIHNpemUgb2YgdGhlIGRpdiB0byBwYXNzIGhlcmU/XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2FsbC5nZXRPcHBvbmVudE1lbWJlcigpLCAxMDI0LCAxMDI0LCAnY3JvcCcsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgYmFja2dyb3VuZEF2YXRhclVybCArICcpJztcbiAgICAgICAgICAgICAgICBvbkhvbGRCYWNrZ3JvdW5kID0gPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld192aWRlb19ob2xkQmFja2dyb3VuZFwiIHN0eWxlPXtiYWNrZ3JvdW5kU3R5bGV9IC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnZpZE11dGVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWaWRlb0ZlZWQgPSA8VmlkZW9GZWVkIHR5cGU9e1ZpZGVvRmVlZFR5cGUuTG9jYWx9IGNhbGw9e3RoaXMucHJvcHMuY2FsbH0gLz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHdlJ3JlIGZ1bGxzY3JlZW4sIHdlIGRvbid0IHdhbnQgdG8gc2V0IGEgbWF4SGVpZ2h0IG9uIHRoZSB2aWRlbyBlbGVtZW50LlxuICAgICAgICAgICAgY29uc3QgbWF4VmlkZW9IZWlnaHQgPSBnZXRGdWxsU2NyZWVuRWxlbWVudCgpID8gbnVsbCA6IChcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm1heFZpZGVvSGVpZ2h0IC0gKEhFQURFUl9IRUlHSFQgKyBCT1RUT01fUEFERElORyArIEJPVFRPTV9NQVJHSU5fVE9QX0JPVFRPTSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb250ZW50VmlldyA9IDxkaXYgY2xhc3NOYW1lPXtjb250YWluZXJDbGFzc2VzfVxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5jb250ZW50UmVmfSBvbk1vdXNlTW92ZT17dGhpcy5vbk1vdXNlTW92ZX1cbiAgICAgICAgICAgICAgICAvLyBQdXQgdGhlIG1heCBoZWlnaHQgb24gaGVyZSB0b28gYmVjYXVzZSB0aGlzIGRpdiBpcyBlbmRlZCB1cCA0cHggbGFyZ2VyIHRoYW4gdGhlIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAvLyBhbmQgaXMgY2F1c2luZyBpdCB0byBzY3JvbGwsIGFuZCBJIGFtIGdlbnVpbmVseSBiYWZmbGVkIGFzIHRvIHdoeS5cbiAgICAgICAgICAgICAgICBzdHlsZT17e21heEhlaWdodDogbWF4VmlkZW9IZWlnaHR9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtvbkhvbGRCYWNrZ3JvdW5kfVxuICAgICAgICAgICAgICAgIDxWaWRlb0ZlZWQgdHlwZT17VmlkZW9GZWVkVHlwZS5SZW1vdGV9IGNhbGw9e3RoaXMucHJvcHMuY2FsbH0gb25SZXNpemU9e3RoaXMucHJvcHMub25SZXNpemV9XG4gICAgICAgICAgICAgICAgICAgIG1heEhlaWdodD17bWF4VmlkZW9IZWlnaHR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7bG9jYWxWaWRlb0ZlZWR9XG4gICAgICAgICAgICAgICAge29uSG9sZENvbnRlbnR9XG4gICAgICAgICAgICAgICAge2NhbGxDb250cm9sc31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGF2YXRhclNpemUgPSB0aGlzLnByb3BzLnBpcE1vZGUgPyA3NiA6IDE2MDtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICBteF9DYWxsVmlld192b2ljZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBteF9DYWxsVmlld192b2ljZV9ob2xkOiBpc09uSG9sZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb250ZW50VmlldyA9IDxkaXYgY2xhc3NOYW1lPXtjbGFzc2VzfSBvbk1vdXNlTW92ZT17dGhpcy5vbk1vdXNlTW92ZX0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld192b2ljZV9hdmF0YXJzQ29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfdm9pY2VfYXZhdGFyQ29udGFpbmVyXCIgc3R5bGU9e3t3aWR0aDogYXZhdGFyU2l6ZSwgaGVpZ2h0OiBhdmF0YXJTaXplfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e2NhbGxSb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfdm9pY2VfaG9sZFRleHRcIj57b25Ib2xkVGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICB7Y2FsbENvbnRyb2xzfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FsbFR5cGVUZXh0ID0gdGhpcy5wcm9wcy5jYWxsLnR5cGUgPT09IENhbGxUeXBlLlZpZGVvID8gX3QoXCJWaWRlbyBDYWxsXCIpIDogX3QoXCJWb2ljZSBDYWxsXCIpO1xuICAgICAgICBsZXQgbXlDbGFzc05hbWU7XG5cbiAgICAgICAgbGV0IGZ1bGxTY3JlZW5CdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNhbGwudHlwZSA9PT0gQ2FsbFR5cGUuVmlkZW8gJiYgIXRoaXMucHJvcHMucGlwTW9kZSkge1xuICAgICAgICAgICAgZnVsbFNjcmVlbkJ1dHRvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyX2J1dHRvbiBteF9DYWxsVmlld19oZWFkZXJfYnV0dG9uX2Z1bGxzY3JlZW5cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25GdWxsc2NyZWVuQ2xpY2t9IHRpdGxlPXtfdChcIkZpbGwgU2NyZWVuXCIpfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXhwYW5kQnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5waXBNb2RlKSB7XG4gICAgICAgICAgICBleHBhbmRCdXR0b24gPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0NhbGxWaWV3X2hlYWRlcl9idXR0b24gbXhfQ2FsbFZpZXdfaGVhZGVyX2J1dHRvbl9leHBhbmRcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FeHBhbmRDbGlja30gdGl0bGU9e190KFwiUmV0dXJuIHRvIGNhbGxcIil9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhlYWRlckNvbnRyb2xzID0gPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfY29udHJvbHNcIj5cbiAgICAgICAgICAgIHtmdWxsU2NyZWVuQnV0dG9ufVxuICAgICAgICAgICAge2V4cGFuZEJ1dHRvbn1cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIGxldCBoZWFkZXI6IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnBpcE1vZGUpIHtcbiAgICAgICAgICAgIGhlYWRlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DYWxsVmlld19oZWFkZXJfcGhvbmVJY29uXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyX2NhbGxUeXBlXCI+e2NhbGxUeXBlVGV4dH08L3NwYW4+XG4gICAgICAgICAgICAgICAge2hlYWRlckNvbnRyb2xzfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgbXlDbGFzc05hbWUgPSAnbXhfQ2FsbFZpZXdfbGFyZ2UnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHNlY29uZGFyeUNhbGxJbmZvO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2Vjb25kYXJ5Q2FsbCkge1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUNhbGxJbmZvID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyX3NlY29uZGFyeUNhbGxJbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGVsZW1lbnQ9J3NwYW4nIG9uQ2xpY2s9e3RoaXMub25TZWNvbmRhcnlSb29tQXZhdGFyQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21BdmF0YXIgcm9vbT17c2VjQ2FsbFJvb219IGhlaWdodD17MTZ9IHdpZHRoPXsxNn0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NhbGxWaWV3X3NlY29uZGFyeUNhbGxfcm9vbU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCIlKG5hbWUpcyBvbiBob2xkXCIsIHsgbmFtZTogc2VjQ2FsbFJvb20ubmFtZSB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhlYWRlciA9IDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vblJvb21BdmF0YXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIDxSb29tQXZhdGFyIHJvb209e2NhbGxSb29tfSBoZWlnaHQ9ezMyfSB3aWR0aD17MzJ9IC8+XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyX2NhbGxJbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyX3Jvb21OYW1lXCI+e2NhbGxSb29tLm5hbWV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ2FsbFZpZXdfaGVhZGVyX2NhbGxUeXBlU21hbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjYWxsVHlwZVRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2Vjb25kYXJ5Q2FsbEluZm99XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtoZWFkZXJDb250cm9sc31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIG15Q2xhc3NOYW1lID0gJ214X0NhbGxWaWV3X3BpcCc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e1wibXhfQ2FsbFZpZXcgXCIgKyBteUNsYXNzTmFtZX0+XG4gICAgICAgICAgICB7aGVhZGVyfVxuICAgICAgICAgICAge2NvbnRlbnRWaWV3fVxuICAgICAgICAgICAge2RpYWxQYWR9XG4gICAgICAgICAgICB7Y29udGV4dE1lbnV9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXX0=