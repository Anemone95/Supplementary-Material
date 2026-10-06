"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _IdentityAuthClient = _interopRequireDefault(require("../../../IdentityAuthClient"));

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

var _AsyncStore = require("../../../stores/AsyncStore");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
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
const MessageCase = Object.freeze({
  NotLoggedIn: "NotLoggedIn",
  Joining: "Joining",
  Loading: "Loading",
  Rejecting: "Rejecting",
  Kicked: "Kicked",
  Banned: "Banned",
  OtherThreePIDError: "OtherThreePIDError",
  InvitedEmailNotFoundInAccount: "InvitedEmailNotFoundInAccount",
  InvitedEmailNoIdentityServer: "InvitedEmailNoIdentityServer",
  InvitedEmailMismatch: "InvitedEmailMismatch",
  Invite: "Invite",
  ViewingRoom: "ViewingRoom",
  RoomNotFound: "RoomNotFound",
  OtherError: "OtherError"
});

class RoomPreviewBar extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      busy: false
    });
    (0, _defineProperty2.default)(this, "_onCommunityUpdate", roomId => {
      if (this.props.room && this.props.room.roomId !== roomId) {
        return;
      }

      this.forceUpdate(); // we have nothing to update
    });
    (0, _defineProperty2.default)(this, "onLoginClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_login',
        screenAfterLogin: this._makeScreenAfterLogin()
      });
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_registration',
        screenAfterLogin: this._makeScreenAfterLogin()
      });
    });
  }

  componentDidMount() {
    this._checkInvitedEmail();

    _CommunityPrototypeStore.CommunityPrototypeStore.instance.on(_AsyncStore.UPDATE_EVENT, this._onCommunityUpdate);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.invitedEmail !== prevProps.invitedEmail || this.props.inviterName !== prevProps.inviterName) {
      this._checkInvitedEmail();
    }
  }

  componentWillUnmount() {
    _CommunityPrototypeStore.CommunityPrototypeStore.instance.off(_AsyncStore.UPDATE_EVENT, this._onCommunityUpdate);
  }

  async _checkInvitedEmail() {
    // If this is an invite and we've been told what email address was
    // invited, fetch the user's account emails and discovery bindings so we
    // can check them against the email that was invited.
    if (this.props.inviterName && this.props.invitedEmail) {
      this.setState({
        busy: true
      });

      try {
        // Gather the account 3PIDs
        const account3pids = await _MatrixClientPeg.MatrixClientPeg.get().getThreePids();
        this.setState({
          accountEmails: account3pids.threepids.filter(b => b.medium === 'email').map(b => b.address)
        }); // If we have an IS connected, use that to lookup the email and
        // check the bound MXID.

        if (!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()) {
          this.setState({
            busy: false
          });
          return;
        }

        const authClient = new _IdentityAuthClient.default();
        const identityAccessToken = await authClient.getAccessToken();
        const result = await _MatrixClientPeg.MatrixClientPeg.get().lookupThreePid('email', this.props.invitedEmail, undefined
        /* callback */
        , identityAccessToken);
        this.setState({
          invitedEmailMxid: result.mxid
        });
      } catch (err) {
        this.setState({
          threePidFetchError: err
        });
      }

      this.setState({
        busy: false
      });
    }
  }

  _getMessageCase() {
    const isGuest = _MatrixClientPeg.MatrixClientPeg.get().isGuest();

    if (isGuest) {
      return MessageCase.NotLoggedIn;
    }

    const myMember = this._getMyMember();

    if (myMember) {
      if (myMember.isKicked()) {
        return MessageCase.Kicked;
      } else if (myMember.membership === "ban") {
        return MessageCase.Banned;
      }
    }

    if (this.props.joining) {
      return MessageCase.Joining;
    } else if (this.props.rejecting) {
      return MessageCase.Rejecting;
    } else if (this.props.loading || this.state.busy) {
      return MessageCase.Loading;
    }

    if (this.props.inviterName) {
      if (this.props.invitedEmail) {
        if (this.state.threePidFetchError) {
          return MessageCase.OtherThreePIDError;
        } else if (this.state.accountEmails && !this.state.accountEmails.includes(this.props.invitedEmail)) {
          return MessageCase.InvitedEmailNotFoundInAccount;
        } else if (!_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()) {
          return MessageCase.InvitedEmailNoIdentityServer;
        } else if (this.state.invitedEmailMxid != _MatrixClientPeg.MatrixClientPeg.get().getUserId()) {
          return MessageCase.InvitedEmailMismatch;
        }
      }

      return MessageCase.Invite;
    } else if (this.props.error) {
      if (this.props.error.errcode == 'M_NOT_FOUND') {
        return MessageCase.RoomNotFound;
      } else {
        return MessageCase.OtherError;
      }
    } else {
      return MessageCase.ViewingRoom;
    }
  }

  _getKickOrBanInfo() {
    const myMember = this._getMyMember();

    if (!myMember) {
      return {};
    }

    const kickerMember = this.props.room.currentState.getMember(myMember.events.member.getSender());
    const memberName = kickerMember ? kickerMember.name : myMember.events.member.getSender();
    const reason = myMember.events.member.getContent().reason;
    return {
      memberName,
      reason
    };
  }

  _joinRule() {
    const room = this.props.room;

    if (room) {
      const joinRules = room.currentState.getStateEvents('m.room.join_rules', '');

      if (joinRules) {
        return joinRules.getContent().join_rule;
      }
    }
  }

  _communityProfile() {
    if (this.props.room) return _CommunityPrototypeStore.CommunityPrototypeStore.instance.getInviteProfile(this.props.room.roomId);
    return {
      displayName: null,
      avatarMxc: null
    };
  }

  _roomName(atStart = false) {
    let name = this.props.room ? this.props.room.name : this.props.roomAlias;

    const profile = this._communityProfile();

    if (profile.displayName) name = profile.displayName;

    if (name) {
      return name;
    } else if (atStart) {
      return (0, _languageHandler._t)("This room");
    } else {
      return (0, _languageHandler._t)("this room");
    }
  }

  _getMyMember() {
    return this.props.room && this.props.room.getMember(_MatrixClientPeg.MatrixClientPeg.get().getUserId());
  }

  _getInviteMember() {
    const {
      room
    } = this.props;

    if (!room) {
      return;
    }

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    const inviteEvent = room.currentState.getMember(myUserId);

    if (!inviteEvent) {
      return;
    }

    const inviterUserId = inviteEvent.events.member.getSender();
    return room.currentState.getMember(inviterUserId);
  }

  _isDMInvite() {
    const myMember = this._getMyMember();

    if (!myMember) {
      return false;
    }

    const memberEvent = myMember.events.member;
    const memberContent = memberEvent.getContent();
    return memberContent.membership === "invite" && memberContent.is_direct;
  }

  _makeScreenAfterLogin() {
    return {
      screen: 'room',
      params: {
        email: this.props.invitedEmail,
        signurl: this.props.signUrl,
        room_name: this.props.oobData ? this.props.oobData.room_name : null,
        room_avatar_url: this.props.oobData ? this.props.oobData.avatarUrl : null,
        inviter_name: this.props.oobData ? this.props.oobData.inviterName : null
      }
    };
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const Spinner = sdk.getComponent('elements.Spinner');
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let showSpinner = false;
    let title;
    let subTitle;
    let primaryActionHandler;
    let primaryActionLabel;
    let secondaryActionHandler;
    let secondaryActionLabel;
    let footer;
    const extraComponents = [];

    const messageCase = this._getMessageCase();

    switch (messageCase) {
      case MessageCase.Joining:
        {
          title = (0, _languageHandler._t)("Joining room …");
          showSpinner = true;
          break;
        }

      case MessageCase.Loading:
        {
          title = (0, _languageHandler._t)("Loading …");
          showSpinner = true;
          break;
        }

      case MessageCase.Rejecting:
        {
          title = (0, _languageHandler._t)("Rejecting invite …");
          showSpinner = true;
          break;
        }

      case MessageCase.NotLoggedIn:
        {
          title = (0, _languageHandler._t)("Join the conversation with an account");
          primaryActionLabel = (0, _languageHandler._t)("Sign Up");
          primaryActionHandler = this.onRegisterClick;
          secondaryActionLabel = (0, _languageHandler._t)("Sign In");
          secondaryActionHandler = this.onLoginClick;

          if (this.props.previewLoading) {
            footer = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(Spinner, {
              w: 20,
              h: 20
            }), (0, _languageHandler._t)("Loading room preview"));
          }

          break;
        }

      case MessageCase.Kicked:
        {
          const {
            memberName,
            reason
          } = this._getKickOrBanInfo();

          title = (0, _languageHandler._t)("You were kicked from %(roomName)s by %(memberName)s", {
            memberName,
            roomName: this._roomName()
          });
          subTitle = reason ? (0, _languageHandler._t)("Reason: %(reason)s", {
            reason
          }) : null;

          if (this._joinRule() === "invite") {
            primaryActionLabel = (0, _languageHandler._t)("Forget this room");
            primaryActionHandler = this.props.onForgetClick;
          } else {
            primaryActionLabel = (0, _languageHandler._t)("Re-join");
            primaryActionHandler = this.props.onJoinClick;
            secondaryActionLabel = (0, _languageHandler._t)("Forget this room");
            secondaryActionHandler = this.props.onForgetClick;
          }

          break;
        }

      case MessageCase.Banned:
        {
          const {
            memberName,
            reason
          } = this._getKickOrBanInfo();

          title = (0, _languageHandler._t)("You were banned from %(roomName)s by %(memberName)s", {
            memberName,
            roomName: this._roomName()
          });
          subTitle = reason ? (0, _languageHandler._t)("Reason: %(reason)s", {
            reason
          }) : null;
          primaryActionLabel = (0, _languageHandler._t)("Forget this room");
          primaryActionHandler = this.props.onForgetClick;
          break;
        }

      case MessageCase.OtherThreePIDError:
        {
          title = (0, _languageHandler._t)("Something went wrong with your invite to %(roomName)s", {
            roomName: this._roomName()
          });

          const joinRule = this._joinRule();

          const errCodeMessage = (0, _languageHandler._t)("An error (%(errcode)s) was returned while trying to validate your " + "invite. You could try to pass this information on to a room admin.", {
            errcode: this.state.threePidFetchError.errcode || (0, _languageHandler._t)("unknown error code")
          });

          switch (joinRule) {
            case "invite":
              subTitle = [(0, _languageHandler._t)("You can only join it with a working invite."), errCodeMessage];
              primaryActionLabel = (0, _languageHandler._t)("Try to join anyway");
              primaryActionHandler = this.props.onJoinClick;
              break;

            case "public":
              subTitle = (0, _languageHandler._t)("You can still join it because this is a public room.");
              primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
              primaryActionHandler = this.props.onJoinClick;
              break;

            default:
              subTitle = errCodeMessage;
              primaryActionLabel = (0, _languageHandler._t)("Try to join anyway");
              primaryActionHandler = this.props.onJoinClick;
              break;
          }

          break;
        }

      case MessageCase.InvitedEmailNotFoundInAccount:
        {
          title = (0, _languageHandler._t)("This invite to %(roomName)s was sent to %(email)s which is not " + "associated with your account", {
            roomName: this._roomName(),
            email: this.props.invitedEmail
          });
          subTitle = (0, _languageHandler._t)("Link this email with your account in Settings to receive invites " + "directly in %(brand)s.", {
            brand
          });
          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.InvitedEmailNoIdentityServer:
        {
          title = (0, _languageHandler._t)("This invite to %(roomName)s was sent to %(email)s", {
            roomName: this._roomName(),
            email: this.props.invitedEmail
          });
          subTitle = (0, _languageHandler._t)("Use an identity server in Settings to receive invites directly in %(brand)s.", {
            brand
          });
          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.InvitedEmailMismatch:
        {
          title = (0, _languageHandler._t)("This invite to %(roomName)s was sent to %(email)s", {
            roomName: this._roomName(),
            email: this.props.invitedEmail
          });
          subTitle = (0, _languageHandler._t)("Share this email in Settings to receive invites directly in %(brand)s.", {
            brand
          });
          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.Invite:
        {
          const RoomAvatar = sdk.getComponent("views.avatars.RoomAvatar");
          const oobData = Object.assign({}, this.props.oobData, {
            avatarUrl: this._communityProfile().avatarMxc
          });

          const avatar = /*#__PURE__*/_react.default.createElement(RoomAvatar, {
            room: this.props.room,
            oobData: oobData
          });

          const inviteMember = this._getInviteMember();

          let inviterElement;

          if (inviteMember) {
            inviterElement = /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement("span", {
              className: "mx_RoomPreviewBar_inviter"
            }, inviteMember.rawDisplayName), " (", inviteMember.userId, ")");
          } else {
            inviterElement = /*#__PURE__*/_react.default.createElement("span", {
              className: "mx_RoomPreviewBar_inviter"
            }, this.props.inviterName);
          }

          const isDM = this._isDMInvite();

          if (isDM) {
            title = (0, _languageHandler._t)("Do you want to chat with %(user)s?", {
              user: inviteMember.name
            });
            subTitle = [avatar, (0, _languageHandler._t)("<userName/> wants to chat", {}, {
              userName: () => inviterElement
            })];
            primaryActionLabel = (0, _languageHandler._t)("Start chatting");
          } else {
            title = (0, _languageHandler._t)("Do you want to join %(roomName)s?", {
              roomName: this._roomName()
            });
            subTitle = [avatar, (0, _languageHandler._t)("<userName/> invited you", {}, {
              userName: () => inviterElement
            })];
            primaryActionLabel = (0, _languageHandler._t)("Accept");
          }

          primaryActionHandler = this.props.onJoinClick;
          secondaryActionLabel = (0, _languageHandler._t)("Reject");
          secondaryActionHandler = this.props.onRejectClick;

          if (this.props.onRejectAndIgnoreClick) {
            extraComponents.push( /*#__PURE__*/_react.default.createElement(AccessibleButton, {
              kind: "secondary",
              onClick: this.props.onRejectAndIgnoreClick,
              key: "ignore"
            }, (0, _languageHandler._t)("Reject & Ignore user")));
          }

          break;
        }

      case MessageCase.ViewingRoom:
        {
          if (this.props.canPreview) {
            title = (0, _languageHandler._t)("You're previewing %(roomName)s. Want to join it?", {
              roomName: this._roomName()
            });
          } else {
            title = (0, _languageHandler._t)("%(roomName)s can't be previewed. Do you want to join it?", {
              roomName: this._roomName(true)
            });
          }

          primaryActionLabel = (0, _languageHandler._t)("Join the discussion");
          primaryActionHandler = this.props.onJoinClick;
          break;
        }

      case MessageCase.RoomNotFound:
        {
          title = (0, _languageHandler._t)("%(roomName)s does not exist.", {
            roomName: this._roomName(true)
          });
          subTitle = (0, _languageHandler._t)("This room doesn't exist. Are you sure you're at the right place?");
          break;
        }

      case MessageCase.OtherError:
        {
          title = (0, _languageHandler._t)("%(roomName)s is not accessible at this time.", {
            roomName: this._roomName(true)
          });
          subTitle = [(0, _languageHandler._t)("Try again later, or ask a room admin to check if you have access."), (0, _languageHandler._t)("%(errcode)s was returned while trying to access the room. " + "If you think you're seeing this message in error, please " + "<issueLink>submit a bug report</issueLink>.", {
            errcode: this.props.error.errcode
          }, {
            issueLink: label => /*#__PURE__*/_react.default.createElement("a", {
              href: "https://github.com/vector-im/element-web/issues/new/choose",
              target: "_blank",
              rel: "noreferrer noopener"
            }, label)
          })];
          break;
        }
    }

    let subTitleElements;

    if (subTitle) {
      if (!Array.isArray(subTitle)) {
        subTitle = [subTitle];
      }

      subTitleElements = subTitle.map((t, i) => /*#__PURE__*/_react.default.createElement("p", {
        key: `subTitle${i}`
      }, t));
    }

    let titleElement;

    if (showSpinner) {
      titleElement = /*#__PURE__*/_react.default.createElement("h3", {
        className: "mx_RoomPreviewBar_spinnerTitle"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null), title);
    } else {
      titleElement = /*#__PURE__*/_react.default.createElement("h3", null, title);
    }

    let primaryButton;

    if (primaryActionHandler) {
      primaryButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "primary",
        onClick: primaryActionHandler
      }, primaryActionLabel);
    }

    let secondaryButton;

    if (secondaryActionHandler) {
      secondaryButton = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "secondary",
        onClick: secondaryActionHandler
      }, secondaryActionLabel);
    }

    const classes = (0, _classnames.default)("mx_RoomPreviewBar", "dark-panel", `mx_RoomPreviewBar_${messageCase}`, {
      "mx_RoomPreviewBar_panel": this.props.canPreview,
      "mx_RoomPreviewBar_dialog": !this.props.canPreview
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_message"
    }, titleElement, subTitleElements), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_actions"
    }, secondaryButton, extraComponents, primaryButton), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_footer"
    }, footer));
  }

}

exports.default = RoomPreviewBar;
(0, _defineProperty2.default)(RoomPreviewBar, "propTypes", {
  onJoinClick: _propTypes.default.func,
  onRejectClick: _propTypes.default.func,
  onRejectAndIgnoreClick: _propTypes.default.func,
  onForgetClick: _propTypes.default.func,
  // if inviterName is specified, the preview bar will shown an invite to the room.
  // You should also specify onRejectClick if specifiying inviterName
  inviterName: _propTypes.default.string,
  // If invited by 3rd party invite, the email address the invite was sent to
  invitedEmail: _propTypes.default.string,
  // For third party invites, information passed about the room out-of-band
  oobData: _propTypes.default.object,
  // For third party invites, a URL for a 3pid invite signing service
  signUrl: _propTypes.default.string,
  // A standard client/server API error object. If supplied, indicates that the
  // caller was unable to fetch details about the room for the given reason.
  error: _propTypes.default.object,
  canPreview: _propTypes.default.bool,
  previewLoading: _propTypes.default.bool,
  room: _propTypes.default.object,
  // When a spinner is present, a spinnerState can be specified to indicate the
  // purpose of the spinner.
  spinner: _propTypes.default.bool,
  spinnerState: _propTypes.default.oneOf(["joining"]),
  loading: _propTypes.default.bool,
  joining: _propTypes.default.bool,
  rejecting: _propTypes.default.bool,
  // The alias that was used to access this room, if appropriate
  // If given, this will be how the room is referred to (eg.
  // in error messages).
  roomAlias: _propTypes.default.string
});
(0, _defineProperty2.default)(RoomPreviewBar, "defaultProps", {
  onJoinClick() {}

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21QcmV2aWV3QmFyLmpzIl0sIm5hbWVzIjpbIk1lc3NhZ2VDYXNlIiwiT2JqZWN0IiwiZnJlZXplIiwiTm90TG9nZ2VkSW4iLCJKb2luaW5nIiwiTG9hZGluZyIsIlJlamVjdGluZyIsIktpY2tlZCIsIkJhbm5lZCIsIk90aGVyVGhyZWVQSURFcnJvciIsIkludml0ZWRFbWFpbE5vdEZvdW5kSW5BY2NvdW50IiwiSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlciIsIkludml0ZWRFbWFpbE1pc21hdGNoIiwiSW52aXRlIiwiVmlld2luZ1Jvb20iLCJSb29tTm90Rm91bmQiLCJPdGhlckVycm9yIiwiUm9vbVByZXZpZXdCYXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImJ1c3kiLCJyb29tSWQiLCJwcm9wcyIsInJvb20iLCJmb3JjZVVwZGF0ZSIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwic2NyZWVuQWZ0ZXJMb2dpbiIsIl9tYWtlU2NyZWVuQWZ0ZXJMb2dpbiIsImNvbXBvbmVudERpZE1vdW50IiwiX2NoZWNrSW52aXRlZEVtYWlsIiwiQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUiLCJpbnN0YW5jZSIsIm9uIiwiVVBEQVRFX0VWRU5UIiwiX29uQ29tbXVuaXR5VXBkYXRlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwiaW52aXRlZEVtYWlsIiwiaW52aXRlck5hbWUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInNldFN0YXRlIiwiYWNjb3VudDNwaWRzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VGhyZWVQaWRzIiwiYWNjb3VudEVtYWlscyIsInRocmVlcGlkcyIsImZpbHRlciIsImIiLCJtZWRpdW0iLCJtYXAiLCJhZGRyZXNzIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiaWRlbnRpdHlBY2Nlc3NUb2tlbiIsImdldEFjY2Vzc1Rva2VuIiwicmVzdWx0IiwibG9va3VwVGhyZWVQaWQiLCJ1bmRlZmluZWQiLCJpbnZpdGVkRW1haWxNeGlkIiwibXhpZCIsImVyciIsInRocmVlUGlkRmV0Y2hFcnJvciIsIl9nZXRNZXNzYWdlQ2FzZSIsImlzR3Vlc3QiLCJteU1lbWJlciIsIl9nZXRNeU1lbWJlciIsImlzS2lja2VkIiwibWVtYmVyc2hpcCIsImpvaW5pbmciLCJyZWplY3RpbmciLCJsb2FkaW5nIiwic3RhdGUiLCJpbmNsdWRlcyIsImdldFVzZXJJZCIsImVycm9yIiwiZXJyY29kZSIsIl9nZXRLaWNrT3JCYW5JbmZvIiwia2lja2VyTWVtYmVyIiwiY3VycmVudFN0YXRlIiwiZ2V0TWVtYmVyIiwiZXZlbnRzIiwibWVtYmVyIiwiZ2V0U2VuZGVyIiwibWVtYmVyTmFtZSIsIm5hbWUiLCJyZWFzb24iLCJnZXRDb250ZW50IiwiX2pvaW5SdWxlIiwiam9pblJ1bGVzIiwiZ2V0U3RhdGVFdmVudHMiLCJqb2luX3J1bGUiLCJfY29tbXVuaXR5UHJvZmlsZSIsImdldEludml0ZVByb2ZpbGUiLCJkaXNwbGF5TmFtZSIsImF2YXRhck14YyIsIl9yb29tTmFtZSIsImF0U3RhcnQiLCJyb29tQWxpYXMiLCJwcm9maWxlIiwiX2dldEludml0ZU1lbWJlciIsIm15VXNlcklkIiwiaW52aXRlRXZlbnQiLCJpbnZpdGVyVXNlcklkIiwiX2lzRE1JbnZpdGUiLCJtZW1iZXJFdmVudCIsIm1lbWJlckNvbnRlbnQiLCJpc19kaXJlY3QiLCJzY3JlZW4iLCJwYXJhbXMiLCJlbWFpbCIsInNpZ251cmwiLCJzaWduVXJsIiwicm9vbV9uYW1lIiwib29iRGF0YSIsInJvb21fYXZhdGFyX3VybCIsImF2YXRhclVybCIsImludml0ZXJfbmFtZSIsInJlbmRlciIsImJyYW5kIiwiU2RrQ29uZmlnIiwiU3Bpbm5lciIsInNkayIsImdldENvbXBvbmVudCIsIkFjY2Vzc2libGVCdXR0b24iLCJzaG93U3Bpbm5lciIsInRpdGxlIiwic3ViVGl0bGUiLCJwcmltYXJ5QWN0aW9uSGFuZGxlciIsInByaW1hcnlBY3Rpb25MYWJlbCIsInNlY29uZGFyeUFjdGlvbkhhbmRsZXIiLCJzZWNvbmRhcnlBY3Rpb25MYWJlbCIsImZvb3RlciIsImV4dHJhQ29tcG9uZW50cyIsIm1lc3NhZ2VDYXNlIiwib25SZWdpc3RlckNsaWNrIiwib25Mb2dpbkNsaWNrIiwicHJldmlld0xvYWRpbmciLCJyb29tTmFtZSIsIm9uRm9yZ2V0Q2xpY2siLCJvbkpvaW5DbGljayIsImpvaW5SdWxlIiwiZXJyQ29kZU1lc3NhZ2UiLCJSb29tQXZhdGFyIiwiYXNzaWduIiwiYXZhdGFyIiwiaW52aXRlTWVtYmVyIiwiaW52aXRlckVsZW1lbnQiLCJyYXdEaXNwbGF5TmFtZSIsInVzZXJJZCIsImlzRE0iLCJ1c2VyIiwidXNlck5hbWUiLCJvblJlamVjdENsaWNrIiwib25SZWplY3RBbmRJZ25vcmVDbGljayIsInB1c2giLCJjYW5QcmV2aWV3IiwiaXNzdWVMaW5rIiwibGFiZWwiLCJzdWJUaXRsZUVsZW1lbnRzIiwiQXJyYXkiLCJpc0FycmF5IiwidCIsImkiLCJ0aXRsZUVsZW1lbnQiLCJwcmltYXJ5QnV0dG9uIiwic2Vjb25kYXJ5QnV0dG9uIiwiY2xhc3NlcyIsIlByb3BUeXBlcyIsImZ1bmMiLCJzdHJpbmciLCJvYmplY3QiLCJib29sIiwic3Bpbm5lciIsInNwaW5uZXJTdGF0ZSIsIm9uZU9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY0EsTUFBTUEsV0FBVyxHQUFHQyxNQUFNLENBQUNDLE1BQVAsQ0FBYztBQUM5QkMsRUFBQUEsV0FB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LFdBQVcsR0FBRyxDQUFFOztBQURFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBJZGVudGl0eUF1dGhDbGllbnQgZnJvbSAnLi4vLi4vLi4vSWRlbnRpdHlBdXRoQ2xpZW50JztcbmltcG9ydCB7Q29tbXVuaXR5UHJvdG90eXBlU3RvcmV9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQ29tbXVuaXR5UHJvdG90eXBlU3RvcmVcIjtcbmltcG9ydCB7VVBEQVRFX0VWRU5UfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcblxuY29uc3QgTWVzc2FnZUNhc2UgPSBPYmplY3QuZnJlZXplKHtcbiAgICBOb3RMb2dnZWRJbjogXCJOb3RMb2dnZWRJblwiLFxuICAgIEpvaW5pbmc6IFwiSm9pbmluZ1wiLFxuICAgIExvYWRpbmc6IFwiTG9hZGluZ1wiLFxuICAgIFJlamVjdGluZzogXCJSZWplY3RpbmdcIixcbiAgICBLaWNrZWQ6IFwiS2lja2VkXCIsXG4gICAgQmFubmVkOiBcIkJhbm5lZFwiLFxuICAgIE90aGVyVGhyZWVQSURFcnJvcjogXCJPdGhlclRocmVlUElERXJyb3JcIixcbiAgICBJbnZpdGVkRW1haWxOb3RGb3VuZEluQWNjb3VudDogXCJJbnZpdGVkRW1haWxOb3RGb3VuZEluQWNjb3VudFwiLFxuICAgIEludml0ZWRFbWFpbE5vSWRlbnRpdHlTZXJ2ZXI6IFwiSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlclwiLFxuICAgIEludml0ZWRFbWFpbE1pc21hdGNoOiBcIkludml0ZWRFbWFpbE1pc21hdGNoXCIsXG4gICAgSW52aXRlOiBcIkludml0ZVwiLFxuICAgIFZpZXdpbmdSb29tOiBcIlZpZXdpbmdSb29tXCIsXG4gICAgUm9vbU5vdEZvdW5kOiBcIlJvb21Ob3RGb3VuZFwiLFxuICAgIE90aGVyRXJyb3I6IFwiT3RoZXJFcnJvclwiLFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21QcmV2aWV3QmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkpvaW5DbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uUmVqZWN0Q2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvblJlamVjdEFuZElnbm9yZUNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25Gb3JnZXRDbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8vIGlmIGludml0ZXJOYW1lIGlzIHNwZWNpZmllZCwgdGhlIHByZXZpZXcgYmFyIHdpbGwgc2hvd24gYW4gaW52aXRlIHRvIHRoZSByb29tLlxuICAgICAgICAvLyBZb3Ugc2hvdWxkIGFsc28gc3BlY2lmeSBvblJlamVjdENsaWNrIGlmIHNwZWNpZml5aW5nIGludml0ZXJOYW1lXG4gICAgICAgIGludml0ZXJOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIElmIGludml0ZWQgYnkgM3JkIHBhcnR5IGludml0ZSwgdGhlIGVtYWlsIGFkZHJlc3MgdGhlIGludml0ZSB3YXMgc2VudCB0b1xuICAgICAgICBpbnZpdGVkRW1haWw6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gRm9yIHRoaXJkIHBhcnR5IGludml0ZXMsIGluZm9ybWF0aW9uIHBhc3NlZCBhYm91dCB0aGUgcm9vbSBvdXQtb2YtYmFuZFxuICAgICAgICBvb2JEYXRhOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgICAgIC8vIEZvciB0aGlyZCBwYXJ0eSBpbnZpdGVzLCBhIFVSTCBmb3IgYSAzcGlkIGludml0ZSBzaWduaW5nIHNlcnZpY2VcbiAgICAgICAgc2lnblVybDogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgICAgICAvLyBBIHN0YW5kYXJkIGNsaWVudC9zZXJ2ZXIgQVBJIGVycm9yIG9iamVjdC4gSWYgc3VwcGxpZWQsIGluZGljYXRlcyB0aGF0IHRoZVxuICAgICAgICAvLyBjYWxsZXIgd2FzIHVuYWJsZSB0byBmZXRjaCBkZXRhaWxzIGFib3V0IHRoZSByb29tIGZvciB0aGUgZ2l2ZW4gcmVhc29uLlxuICAgICAgICBlcnJvcjogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICBjYW5QcmV2aWV3OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgcHJldmlld0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICByb29tOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgICAgIC8vIFdoZW4gYSBzcGlubmVyIGlzIHByZXNlbnQsIGEgc3Bpbm5lclN0YXRlIGNhbiBiZSBzcGVjaWZpZWQgdG8gaW5kaWNhdGUgdGhlXG4gICAgICAgIC8vIHB1cnBvc2Ugb2YgdGhlIHNwaW5uZXIuXG4gICAgICAgIHNwaW5uZXI6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBzcGlubmVyU3RhdGU6IFByb3BUeXBlcy5vbmVPZihbXCJqb2luaW5nXCJdKSxcbiAgICAgICAgbG9hZGluZzogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGpvaW5pbmc6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICByZWplY3Rpbmc6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICAvLyBUaGUgYWxpYXMgdGhhdCB3YXMgdXNlZCB0byBhY2Nlc3MgdGhpcyByb29tLCBpZiBhcHByb3ByaWF0ZVxuICAgICAgICAvLyBJZiBnaXZlbiwgdGhpcyB3aWxsIGJlIGhvdyB0aGUgcm9vbSBpcyByZWZlcnJlZCB0byAoZWcuXG4gICAgICAgIC8vIGluIGVycm9yIG1lc3NhZ2VzKS5cbiAgICAgICAgcm9vbUFsaWFzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvbkpvaW5DbGljaygpIHt9LFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9jaGVja0ludml0ZWRFbWFpbCgpO1xuICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMuX29uQ29tbXVuaXR5VXBkYXRlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW52aXRlZEVtYWlsICE9PSBwcmV2UHJvcHMuaW52aXRlZEVtYWlsIHx8IHRoaXMucHJvcHMuaW52aXRlck5hbWUgIT09IHByZXZQcm9wcy5pbnZpdGVyTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5fY2hlY2tJbnZpdGVkRW1haWwoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX0VWRU5ULCB0aGlzLl9vbkNvbW11bml0eVVwZGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2NoZWNrSW52aXRlZEVtYWlsKCkge1xuICAgICAgICAvLyBJZiB0aGlzIGlzIGFuIGludml0ZSBhbmQgd2UndmUgYmVlbiB0b2xkIHdoYXQgZW1haWwgYWRkcmVzcyB3YXNcbiAgICAgICAgLy8gaW52aXRlZCwgZmV0Y2ggdGhlIHVzZXIncyBhY2NvdW50IGVtYWlscyBhbmQgZGlzY292ZXJ5IGJpbmRpbmdzIHNvIHdlXG4gICAgICAgIC8vIGNhbiBjaGVjayB0aGVtIGFnYWluc3QgdGhlIGVtYWlsIHRoYXQgd2FzIGludml0ZWQuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmludml0ZXJOYW1lICYmIHRoaXMucHJvcHMuaW52aXRlZEVtYWlsKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIEdhdGhlciB0aGUgYWNjb3VudCAzUElEc1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjY291bnQzcGlkcyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUaHJlZVBpZHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYWNjb3VudEVtYWlsczogYWNjb3VudDNwaWRzLnRocmVlcGlkc1xuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihiID0+IGIubWVkaXVtID09PSAnZW1haWwnKS5tYXAoYiA9PiBiLmFkZHJlc3MpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYW4gSVMgY29ubmVjdGVkLCB1c2UgdGhhdCB0byBsb29rdXAgdGhlIGVtYWlsIGFuZFxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoZSBib3VuZCBNWElELlxuICAgICAgICAgICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBhdXRoQ2xpZW50ID0gbmV3IElkZW50aXR5QXV0aENsaWVudCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkZW50aXR5QWNjZXNzVG9rZW4gPSBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmxvb2t1cFRocmVlUGlkKFxuICAgICAgICAgICAgICAgICAgICAnZW1haWwnLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmludml0ZWRFbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkIC8qIGNhbGxiYWNrICovLFxuICAgICAgICAgICAgICAgICAgICBpZGVudGl0eUFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW52aXRlZEVtYWlsTXhpZDogcmVzdWx0Lm14aWR9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3RocmVlUGlkRmV0Y2hFcnJvcjogZXJyfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiBmYWxzZX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uQ29tbXVuaXR5VXBkYXRlID0gKHJvb21JZCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tICYmIHRoaXMucHJvcHMucm9vbS5yb29tSWQgIT09IHJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gd2UgaGF2ZSBub3RoaW5nIHRvIHVwZGF0ZVxuICAgIH07XG5cbiAgICBfZ2V0TWVzc2FnZUNhc2UoKSB7XG4gICAgICAgIGNvbnN0IGlzR3Vlc3QgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNHdWVzdCgpO1xuXG4gICAgICAgIGlmIChpc0d1ZXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuTm90TG9nZ2VkSW47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBteU1lbWJlciA9IHRoaXMuX2dldE15TWVtYmVyKCk7XG5cbiAgICAgICAgaWYgKG15TWVtYmVyKSB7XG4gICAgICAgICAgICBpZiAobXlNZW1iZXIuaXNLaWNrZWQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5LaWNrZWQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG15TWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiYmFuXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuQmFubmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuam9pbmluZykge1xuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkpvaW5pbmc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5yZWplY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5SZWplY3Rpbmc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5sb2FkaW5nIHx8IHRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkxvYWRpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5pbnZpdGVyTmFtZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaW52aXRlZEVtYWlsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudGhyZWVQaWRGZXRjaEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5PdGhlclRocmVlUElERXJyb3I7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5hY2NvdW50RW1haWxzICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnN0YXRlLmFjY291bnRFbWFpbHMuaW5jbHVkZXModGhpcy5wcm9wcy5pbnZpdGVkRW1haWwpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5JbnZpdGVkRW1haWxOb3RGb3VuZEluQWNjb3VudDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlcjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaW52aXRlZEVtYWlsTXhpZCAhPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkludml0ZWRFbWFpbE1pc21hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5JbnZpdGU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5lcnJvcikge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZXJyb3IuZXJyY29kZSA9PSAnTV9OT1RfRk9VTkQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLlJvb21Ob3RGb3VuZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLk90aGVyRXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuVmlld2luZ1Jvb207XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0S2lja09yQmFuSW5mbygpIHtcbiAgICAgICAgY29uc3QgbXlNZW1iZXIgPSB0aGlzLl9nZXRNeU1lbWJlcigpO1xuICAgICAgICBpZiAoIW15TWVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2lja2VyTWVtYmVyID0gdGhpcy5wcm9wcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIoXG4gICAgICAgICAgICBteU1lbWJlci5ldmVudHMubWVtYmVyLmdldFNlbmRlcigpLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBtZW1iZXJOYW1lID0ga2lja2VyTWVtYmVyID9cbiAgICAgICAgICAgIGtpY2tlck1lbWJlci5uYW1lIDogbXlNZW1iZXIuZXZlbnRzLm1lbWJlci5nZXRTZW5kZXIoKTtcbiAgICAgICAgY29uc3QgcmVhc29uID0gbXlNZW1iZXIuZXZlbnRzLm1lbWJlci5nZXRDb250ZW50KCkucmVhc29uO1xuICAgICAgICByZXR1cm4ge21lbWJlck5hbWUsIHJlYXNvbn07XG4gICAgfVxuXG4gICAgX2pvaW5SdWxlKCkge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5wcm9wcy5yb29tO1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgY29uc3Qgam9pblJ1bGVzID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5qb2luX3J1bGVzJywgJycpO1xuICAgICAgICAgICAgaWYgKGpvaW5SdWxlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBqb2luUnVsZXMuZ2V0Q29udGVudCgpLmpvaW5fcnVsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jb21tdW5pdHlQcm9maWxlKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tKSByZXR1cm4gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0SW52aXRlUHJvZmlsZSh0aGlzLnByb3BzLnJvb20ucm9vbUlkKTtcbiAgICAgICAgcmV0dXJuIHtkaXNwbGF5TmFtZTogbnVsbCwgYXZhdGFyTXhjOiBudWxsfTtcbiAgICB9XG5cbiAgICBfcm9vbU5hbWUoYXRTdGFydCA9IGZhbHNlKSB7XG4gICAgICAgIGxldCBuYW1lID0gdGhpcy5wcm9wcy5yb29tID8gdGhpcy5wcm9wcy5yb29tLm5hbWUgOiB0aGlzLnByb3BzLnJvb21BbGlhcztcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuX2NvbW11bml0eVByb2ZpbGUoKTtcbiAgICAgICAgaWYgKHByb2ZpbGUuZGlzcGxheU5hbWUpIG5hbWUgPSBwcm9maWxlLmRpc3BsYXlOYW1lO1xuICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH0gZWxzZSBpZiAoYXRTdGFydCkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiVGhpcyByb29tXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwidGhpcyByb29tXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldE15TWVtYmVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5yb29tICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLnJvb20uZ2V0TWVtYmVyKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfZ2V0SW52aXRlTWVtYmVyKCkge1xuICAgICAgICBjb25zdCB7cm9vbX0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBteVVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgaW52aXRlRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIobXlVc2VySWQpO1xuICAgICAgICBpZiAoIWludml0ZUV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW52aXRlclVzZXJJZCA9IGludml0ZUV2ZW50LmV2ZW50cy5tZW1iZXIuZ2V0U2VuZGVyKCk7XG4gICAgICAgIHJldHVybiByb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIoaW52aXRlclVzZXJJZCk7XG4gICAgfVxuXG4gICAgX2lzRE1JbnZpdGUoKSB7XG4gICAgICAgIGNvbnN0IG15TWVtYmVyID0gdGhpcy5fZ2V0TXlNZW1iZXIoKTtcbiAgICAgICAgaWYgKCFteU1lbWJlcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lbWJlckV2ZW50ID0gbXlNZW1iZXIuZXZlbnRzLm1lbWJlcjtcbiAgICAgICAgY29uc3QgbWVtYmVyQ29udGVudCA9IG1lbWJlckV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgcmV0dXJuIG1lbWJlckNvbnRlbnQubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIiAmJiBtZW1iZXJDb250ZW50LmlzX2RpcmVjdDtcbiAgICB9XG5cbiAgICBfbWFrZVNjcmVlbkFmdGVyTG9naW4oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzY3JlZW46ICdyb29tJyxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLnByb3BzLmludml0ZWRFbWFpbCxcbiAgICAgICAgICAgICAgICBzaWdudXJsOiB0aGlzLnByb3BzLnNpZ25VcmwsXG4gICAgICAgICAgICAgICAgcm9vbV9uYW1lOiB0aGlzLnByb3BzLm9vYkRhdGEgPyB0aGlzLnByb3BzLm9vYkRhdGEucm9vbV9uYW1lIDogbnVsbCxcbiAgICAgICAgICAgICAgICByb29tX2F2YXRhcl91cmw6IHRoaXMucHJvcHMub29iRGF0YSA/IHRoaXMucHJvcHMub29iRGF0YS5hdmF0YXJVcmwgOiBudWxsLFxuICAgICAgICAgICAgICAgIGludml0ZXJfbmFtZTogdGhpcy5wcm9wcy5vb2JEYXRhID8gdGhpcy5wcm9wcy5vb2JEYXRhLmludml0ZXJOYW1lIDogbnVsbCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb25Mb2dpbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzdGFydF9sb2dpbicsIHNjcmVlbkFmdGVyTG9naW46IHRoaXMuX21ha2VTY3JlZW5BZnRlckxvZ2luKCkgfSk7XG4gICAgfTtcblxuICAgIG9uUmVnaXN0ZXJDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnc3RhcnRfcmVnaXN0cmF0aW9uJywgc2NyZWVuQWZ0ZXJMb2dpbjogdGhpcy5fbWFrZVNjcmVlbkFmdGVyTG9naW4oKSB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlNwaW5uZXInKTtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcblxuICAgICAgICBsZXQgc2hvd1NwaW5uZXIgPSBmYWxzZTtcbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBsZXQgc3ViVGl0bGU7XG4gICAgICAgIGxldCBwcmltYXJ5QWN0aW9uSGFuZGxlcjtcbiAgICAgICAgbGV0IHByaW1hcnlBY3Rpb25MYWJlbDtcbiAgICAgICAgbGV0IHNlY29uZGFyeUFjdGlvbkhhbmRsZXI7XG4gICAgICAgIGxldCBzZWNvbmRhcnlBY3Rpb25MYWJlbDtcbiAgICAgICAgbGV0IGZvb3RlcjtcbiAgICAgICAgY29uc3QgZXh0cmFDb21wb25lbnRzID0gW107XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZUNhc2UgPSB0aGlzLl9nZXRNZXNzYWdlQ2FzZSgpO1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2VDYXNlKSB7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkpvaW5pbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiSm9pbmluZyByb29tIOKAplwiKTtcbiAgICAgICAgICAgICAgICBzaG93U3Bpbm5lciA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkxvYWRpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiTG9hZGluZyDigKZcIik7XG4gICAgICAgICAgICAgICAgc2hvd1NwaW5uZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5SZWplY3Rpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiUmVqZWN0aW5nIGludml0ZSDigKZcIik7XG4gICAgICAgICAgICAgICAgc2hvd1NwaW5uZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5Ob3RMb2dnZWRJbjoge1xuICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJKb2luIHRoZSBjb252ZXJzYXRpb24gd2l0aCBhbiBhY2NvdW50XCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiU2lnbiBVcFwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMub25SZWdpc3RlckNsaWNrO1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkxhYmVsID0gX3QoXCJTaWduIEluXCIpO1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLm9uTG9naW5DbGljaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5wcmV2aWV3TG9hZGluZykge1xuICAgICAgICAgICAgICAgICAgICBmb290ZXIgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIHc9ezIwfSBoPXsyMH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJMb2FkaW5nIHJvb20gcHJldmlld1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuS2lja2VkOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qge21lbWJlck5hbWUsIHJlYXNvbn0gPSB0aGlzLl9nZXRLaWNrT3JCYW5JbmZvKCk7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSB3ZXJlIGtpY2tlZCBmcm9tICUocm9vbU5hbWUpcyBieSAlKG1lbWJlck5hbWUpc1wiLFxuICAgICAgICAgICAgICAgICAgICB7bWVtYmVyTmFtZSwgcm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCl9KTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IHJlYXNvbiA/IF90KFwiUmVhc29uOiAlKHJlYXNvbilzXCIsIHtyZWFzb259KSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fam9pblJ1bGUoKSA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIkZvcmdldCB0aGlzIHJvb21cIik7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkZvcmdldENsaWNrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiUmUtam9pblwiKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uSm9pbkNsaWNrO1xuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlBY3Rpb25MYWJlbCA9IF90KFwiRm9yZ2V0IHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Gb3JnZXRDbGljaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkJhbm5lZDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHttZW1iZXJOYW1lLCByZWFzb259ID0gdGhpcy5fZ2V0S2lja09yQmFuSW5mbygpO1xuICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJZb3Ugd2VyZSBiYW5uZWQgZnJvbSAlKHJvb21OYW1lKXMgYnkgJShtZW1iZXJOYW1lKXNcIixcbiAgICAgICAgICAgICAgICAgICAge21lbWJlck5hbWUsIHJvb21OYW1lOiB0aGlzLl9yb29tTmFtZSgpfSk7XG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSByZWFzb24gPyBfdChcIlJlYXNvbjogJShyZWFzb24pc1wiLCB7cmVhc29ufSkgOiBudWxsO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiRm9yZ2V0IHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Gb3JnZXRDbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuT3RoZXJUaHJlZVBJREVycm9yOiB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggeW91ciBpbnZpdGUgdG8gJShyb29tTmFtZSlzXCIsXG4gICAgICAgICAgICAgICAgICAgIHtyb29tTmFtZTogdGhpcy5fcm9vbU5hbWUoKX0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW5SdWxlID0gdGhpcy5fam9pblJ1bGUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJDb2RlTWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFuIGVycm9yICglKGVycmNvZGUpcykgd2FzIHJldHVybmVkIHdoaWxlIHRyeWluZyB0byB2YWxpZGF0ZSB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJpbnZpdGUuIFlvdSBjb3VsZCB0cnkgdG8gcGFzcyB0aGlzIGluZm9ybWF0aW9uIG9uIHRvIGEgcm9vbSBhZG1pbi5cIixcbiAgICAgICAgICAgICAgICAgICAge2VycmNvZGU6IHRoaXMuc3RhdGUudGhyZWVQaWRGZXRjaEVycm9yLmVycmNvZGUgfHwgX3QoXCJ1bmtub3duIGVycm9yIGNvZGVcIil9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChqb2luUnVsZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaW52aXRlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdChcIllvdSBjYW4gb25seSBqb2luIGl0IHdpdGggYSB3b3JraW5nIGludml0ZS5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyQ29kZU1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJUcnkgdG8gam9pbiBhbnl3YXlcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInB1YmxpY1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBfdChcIllvdSBjYW4gc3RpbGwgam9pbiBpdCBiZWNhdXNlIHRoaXMgaXMgYSBwdWJsaWMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIkpvaW4gdGhlIGRpc2N1c3Npb25cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gZXJyQ29kZU1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIlRyeSB0byBqb2luIGFueXdheVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuSW52aXRlZEVtYWlsTm90Rm91bmRJbkFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXMgd2hpY2ggaXMgbm90IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NvY2lhdGVkIHdpdGggeW91ciBhY2NvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21OYW1lOiB0aGlzLl9yb29tTmFtZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMucHJvcHMuaW52aXRlZEVtYWlsLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJMaW5rIHRoaXMgZW1haWwgd2l0aCB5b3VyIGFjY291bnQgaW4gU2V0dGluZ3MgdG8gcmVjZWl2ZSBpbnZpdGVzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJkaXJlY3RseSBpbiAlKGJyYW5kKXMuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiSm9pbiB0aGUgZGlzY3Vzc2lvblwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkludml0ZWRFbWFpbE5vSWRlbnRpdHlTZXJ2ZXI6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXNcIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgaW4gU2V0dGluZ3MgdG8gcmVjZWl2ZSBpbnZpdGVzIGRpcmVjdGx5IGluICUoYnJhbmQpcy5cIixcbiAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJKb2luIHRoZSBkaXNjdXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuSW52aXRlZEVtYWlsTWlzbWF0Y2g6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXNcIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlNoYXJlIHRoaXMgZW1haWwgaW4gU2V0dGluZ3MgdG8gcmVjZWl2ZSBpbnZpdGVzIGRpcmVjdGx5IGluICUoYnJhbmQpcy5cIixcbiAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJKb2luIHRoZSBkaXNjdXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuSW52aXRlOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgUm9vbUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5hdmF0YXJzLlJvb21BdmF0YXJcIik7XG4gICAgICAgICAgICAgICAgY29uc3Qgb29iRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMub29iRGF0YSwge1xuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHRoaXMuX2NvbW11bml0eVByb2ZpbGUoKS5hdmF0YXJNeGMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZhdGFyID0gPFJvb21BdmF0YXIgcm9vbT17dGhpcy5wcm9wcy5yb29tfSBvb2JEYXRhPXtvb2JEYXRhfSAvPjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZU1lbWJlciA9IHRoaXMuX2dldEludml0ZU1lbWJlcigpO1xuICAgICAgICAgICAgICAgIGxldCBpbnZpdGVyRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoaW52aXRlTWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGludml0ZXJFbGVtZW50ID0gPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9pbnZpdGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2ludml0ZU1lbWJlci5yYXdEaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gKHtpbnZpdGVNZW1iZXIudXNlcklkfSlcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyRWxlbWVudCA9ICg8c3BhbiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9pbnZpdGVyXCI+e3RoaXMucHJvcHMuaW52aXRlck5hbWV9PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgaXNETSA9IHRoaXMuX2lzRE1JbnZpdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNETSkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiRG8geW91IHdhbnQgdG8gY2hhdCB3aXRoICUodXNlcilzP1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB1c2VyOiBpbnZpdGVNZW1iZXIubmFtZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfdChcIjx1c2VyTmFtZS8+IHdhbnRzIHRvIGNoYXRcIiwge30sIHt1c2VyTmFtZTogKCkgPT4gaW52aXRlckVsZW1lbnR9KSxcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJTdGFydCBjaGF0dGluZ1wiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiRG8geW91IHdhbnQgdG8gam9pbiAlKHJvb21OYW1lKXM/XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJvb21OYW1lOiB0aGlzLl9yb29tTmFtZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcixcbiAgICAgICAgICAgICAgICAgICAgICAgIF90KFwiPHVzZXJOYW1lLz4gaW52aXRlZCB5b3VcIiwge30sIHt1c2VyTmFtZTogKCkgPT4gaW52aXRlckVsZW1lbnR9KSxcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJBY2NlcHRcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uSm9pbkNsaWNrO1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkxhYmVsID0gX3QoXCJSZWplY3RcIik7XG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25SZWplY3RDbGljaztcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVqZWN0QW5kSWdub3JlQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFDb21wb25lbnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwic2Vjb25kYXJ5XCIgb25DbGljaz17dGhpcy5wcm9wcy5vblJlamVjdEFuZElnbm9yZUNsaWNrfSBrZXk9XCJpZ25vcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiUmVqZWN0ICYgSWdub3JlIHVzZXJcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLlZpZXdpbmdSb29tOiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FuUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiWW91J3JlIHByZXZpZXdpbmcgJShyb29tTmFtZSlzLiBXYW50IHRvIGpvaW4gaXQ/XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7cm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCl9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiJShyb29tTmFtZSlzIGNhbid0IGJlIHByZXZpZXdlZC4gRG8geW91IHdhbnQgdG8gam9pbiBpdD9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtyb29tTmFtZTogdGhpcy5fcm9vbU5hbWUodHJ1ZSl9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJKb2luIHRoZSBkaXNjdXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuUm9vbU5vdEZvdW5kOiB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIiUocm9vbU5hbWUpcyBkb2VzIG5vdCBleGlzdC5cIiwge3Jvb21OYW1lOiB0aGlzLl9yb29tTmFtZSh0cnVlKX0pO1xuICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gX3QoXCJUaGlzIHJvb20gZG9lc24ndCBleGlzdC4gQXJlIHlvdSBzdXJlIHlvdSdyZSBhdCB0aGUgcmlnaHQgcGxhY2U/XCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5PdGhlckVycm9yOiB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIiUocm9vbU5hbWUpcyBpcyBub3QgYWNjZXNzaWJsZSBhdCB0aGlzIHRpbWUuXCIsIHtyb29tTmFtZTogdGhpcy5fcm9vbU5hbWUodHJ1ZSl9KTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJUcnkgYWdhaW4gbGF0ZXIsIG9yIGFzayBhIHJvb20gYWRtaW4gdG8gY2hlY2sgaWYgeW91IGhhdmUgYWNjZXNzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiUoZXJyY29kZSlzIHdhcyByZXR1cm5lZCB3aGlsZSB0cnlpbmcgdG8gYWNjZXNzIHRoZSByb29tLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSB0aGluayB5b3UncmUgc2VlaW5nIHRoaXMgbWVzc2FnZSBpbiBlcnJvciwgcGxlYXNlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPGlzc3VlTGluaz5zdWJtaXQgYSBidWcgcmVwb3J0PC9pc3N1ZUxpbms+LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlcnJjb2RlOiB0aGlzLnByb3BzLmVycm9yLmVycmNvZGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaXNzdWVMaW5rOiBsYWJlbCA9PiA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvbmV3L2Nob29zZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgbGFiZWwgfTwvYT4gfSxcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN1YlRpdGxlRWxlbWVudHM7XG4gICAgICAgIGlmIChzdWJUaXRsZSkge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHN1YlRpdGxlKSkge1xuICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gW3N1YlRpdGxlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YlRpdGxlRWxlbWVudHMgPSBzdWJUaXRsZS5tYXAoKHQsIGkpID0+IDxwIGtleT17YHN1YlRpdGxlJHtpfWB9Pnt0fTwvcD4pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRpdGxlRWxlbWVudDtcbiAgICAgICAgaWYgKHNob3dTcGlubmVyKSB7XG4gICAgICAgICAgICB0aXRsZUVsZW1lbnQgPSA8aDMgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdCYXJfc3Bpbm5lclRpdGxlXCI+PFNwaW5uZXIgLz57IHRpdGxlIH08L2gzPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpdGxlRWxlbWVudCA9IDxoMz57IHRpdGxlIH08L2gzPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcmltYXJ5QnV0dG9uO1xuICAgICAgICBpZiAocHJpbWFyeUFjdGlvbkhhbmRsZXIpIHtcbiAgICAgICAgICAgIHByaW1hcnlCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXtwcmltYXJ5QWN0aW9uSGFuZGxlcn0+XG4gICAgICAgICAgICAgICAgICAgIHsgcHJpbWFyeUFjdGlvbkxhYmVsIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlY29uZGFyeUJ1dHRvbjtcbiAgICAgICAgaWYgKHNlY29uZGFyeUFjdGlvbkhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNlY29uZGFyeUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwic2Vjb25kYXJ5XCIgb25DbGljaz17c2Vjb25kYXJ5QWN0aW9uSGFuZGxlcn0+XG4gICAgICAgICAgICAgICAgICAgIHsgc2Vjb25kYXJ5QWN0aW9uTGFiZWwgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21QcmV2aWV3QmFyXCIsIFwiZGFyay1wYW5lbFwiLCBgbXhfUm9vbVByZXZpZXdCYXJfJHttZXNzYWdlQ2FzZX1gLCB7XG4gICAgICAgICAgICBcIm14X1Jvb21QcmV2aWV3QmFyX3BhbmVsXCI6IHRoaXMucHJvcHMuY2FuUHJldmlldyxcbiAgICAgICAgICAgIFwibXhfUm9vbVByZXZpZXdCYXJfZGlhbG9nXCI6ICF0aGlzLnByb3BzLmNhblByZXZpZXcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9tZXNzYWdlXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGl0bGVFbGVtZW50IH1cbiAgICAgICAgICAgICAgICAgICAgeyBzdWJUaXRsZUVsZW1lbnRzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21QcmV2aWV3QmFyX2FjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBzZWNvbmRhcnlCdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICB7IGV4dHJhQ29tcG9uZW50cyB9XG4gICAgICAgICAgICAgICAgICAgIHsgcHJpbWFyeUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9mb290ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBmb290ZXIgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19