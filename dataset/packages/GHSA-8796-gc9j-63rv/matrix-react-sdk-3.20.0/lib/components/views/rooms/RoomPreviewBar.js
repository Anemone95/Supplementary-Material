"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _InviteReason = _interopRequireDefault(require("../elements/InviteReason"));

var _dec, _class, _class2, _temp;

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
let RoomPreviewBar = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.RoomPreviewBar"), _dec(_class = (_temp = _class2 = class RoomPreviewBar extends _react.default.Component {
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
    let reasonElement;
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

          const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

          const reason = this.props.room.currentState.getMember(myUserId).events.member.event.content.reason;

          if (reason) {
            reasonElement = /*#__PURE__*/_react.default.createElement(_InviteReason.default, {
              reason: reason
            });
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
    }, titleElement, subTitleElements), reasonElement, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_actions"
    }, secondaryButton, extraComponents, primaryButton), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewBar_footer"
    }, footer));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
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
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  onJoinClick() {}

}), _temp)) || _class);
exports.default = RoomPreviewBar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21QcmV2aWV3QmFyLmpzIl0sIm5hbWVzIjpbIk1lc3NhZ2VDYXNlIiwiT2JqZWN0IiwiZnJlZXplIiwiTm90TG9nZ2VkSW4iLCJKb2luaW5nIiwiTG9hZGluZyIsIlJlamVjdGluZyIsIktpY2tlZCIsIkJhbm5lZCIsIk90aGVyVGhyZWVQSURFcnJvciIsIkludml0ZWRFbWFpbE5vdEZvdW5kSW5BY2NvdW50IiwiSW52aXRlZEVtYWlsTm9JZGVudGl0eVNlcnZlciIsIkludml0ZWRFbWFpbE1pc21hdGNoIiwiSW52aXRlIiwiVmlld2luZ1Jvb20iLCJSb29tTm90Rm91bmQiLCJPdGhlckVycm9yIiwiUm9vbVByZXZpZXdCYXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImJ1c3kiLCJyb29tSWQiLCJwcm9wcyIsInJvb20iLCJmb3JjZVVwZGF0ZSIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwic2NyZWVuQWZ0ZXJMb2dpbiIsIl9tYWtlU2NyZWVuQWZ0ZXJMb2dpbiIsImNvbXBvbmVudERpZE1vdW50IiwiX2NoZWNrSW52aXRlZEVtYWlsIiwiQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUiLCJpbnN0YW5jZSIsIm9uIiwiVVBEQVRFX0VWRU5UIiwiX29uQ29tbXVuaXR5VXBkYXRlIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwiaW52aXRlZEVtYWlsIiwiaW52aXRlck5hbWUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInNldFN0YXRlIiwiYWNjb3VudDNwaWRzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VGhyZWVQaWRzIiwiYWNjb3VudEVtYWlscyIsInRocmVlcGlkcyIsImZpbHRlciIsImIiLCJtZWRpdW0iLCJtYXAiLCJhZGRyZXNzIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJhdXRoQ2xpZW50IiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiaWRlbnRpdHlBY2Nlc3NUb2tlbiIsImdldEFjY2Vzc1Rva2VuIiwicmVzdWx0IiwibG9va3VwVGhyZWVQaWQiLCJ1bmRlZmluZWQiLCJpbnZpdGVkRW1haWxNeGlkIiwibXhpZCIsImVyciIsInRocmVlUGlkRmV0Y2hFcnJvciIsIl9nZXRNZXNzYWdlQ2FzZSIsImlzR3Vlc3QiLCJteU1lbWJlciIsIl9nZXRNeU1lbWJlciIsImlzS2lja2VkIiwibWVtYmVyc2hpcCIsImpvaW5pbmciLCJyZWplY3RpbmciLCJsb2FkaW5nIiwic3RhdGUiLCJpbmNsdWRlcyIsImdldFVzZXJJZCIsImVycm9yIiwiZXJyY29kZSIsIl9nZXRLaWNrT3JCYW5JbmZvIiwia2lja2VyTWVtYmVyIiwiY3VycmVudFN0YXRlIiwiZ2V0TWVtYmVyIiwiZXZlbnRzIiwibWVtYmVyIiwiZ2V0U2VuZGVyIiwibWVtYmVyTmFtZSIsIm5hbWUiLCJyZWFzb24iLCJnZXRDb250ZW50IiwiX2pvaW5SdWxlIiwiam9pblJ1bGVzIiwiZ2V0U3RhdGVFdmVudHMiLCJqb2luX3J1bGUiLCJfY29tbXVuaXR5UHJvZmlsZSIsImdldEludml0ZVByb2ZpbGUiLCJkaXNwbGF5TmFtZSIsImF2YXRhck14YyIsIl9yb29tTmFtZSIsImF0U3RhcnQiLCJyb29tQWxpYXMiLCJwcm9maWxlIiwiX2dldEludml0ZU1lbWJlciIsIm15VXNlcklkIiwiaW52aXRlRXZlbnQiLCJpbnZpdGVyVXNlcklkIiwiX2lzRE1JbnZpdGUiLCJtZW1iZXJFdmVudCIsIm1lbWJlckNvbnRlbnQiLCJpc19kaXJlY3QiLCJzY3JlZW4iLCJwYXJhbXMiLCJlbWFpbCIsInNpZ251cmwiLCJzaWduVXJsIiwicm9vbV9uYW1lIiwib29iRGF0YSIsInJvb21fYXZhdGFyX3VybCIsImF2YXRhclVybCIsImludml0ZXJfbmFtZSIsInJlbmRlciIsImJyYW5kIiwiU2RrQ29uZmlnIiwiU3Bpbm5lciIsInNkayIsImdldENvbXBvbmVudCIsIkFjY2Vzc2libGVCdXR0b24iLCJzaG93U3Bpbm5lciIsInRpdGxlIiwic3ViVGl0bGUiLCJyZWFzb25FbGVtZW50IiwicHJpbWFyeUFjdGlvbkhhbmRsZXIiLCJwcmltYXJ5QWN0aW9uTGFiZWwiLCJzZWNvbmRhcnlBY3Rpb25IYW5kbGVyIiwic2Vjb25kYXJ5QWN0aW9uTGFiZWwiLCJmb290ZXIiLCJleHRyYUNvbXBvbmVudHMiLCJtZXNzYWdlQ2FzZSIsIm9uUmVnaXN0ZXJDbGljayIsIm9uTG9naW5DbGljayIsInByZXZpZXdMb2FkaW5nIiwicm9vbU5hbWUiLCJvbkZvcmdldENsaWNrIiwib25Kb2luQ2xpY2siLCJqb2luUnVsZSIsImVyckNvZGVNZXNzYWdlIiwiUm9vbUF2YXRhciIsImFzc2lnbiIsImF2YXRhciIsImludml0ZU1lbWJlciIsImludml0ZXJFbGVtZW50IiwicmF3RGlzcGxheU5hbWUiLCJ1c2VySWQiLCJpc0RNIiwidXNlciIsInVzZXJOYW1lIiwiZXZlbnQiLCJjb250ZW50Iiwib25SZWplY3RDbGljayIsIm9uUmVqZWN0QW5kSWdub3JlQ2xpY2siLCJwdXNoIiwiY2FuUHJldmlldyIsImlzc3VlTGluayIsImxhYmVsIiwic3ViVGl0bGVFbGVtZW50cyIsIkFycmF5IiwiaXNBcnJheSIsInQiLCJpIiwidGl0bGVFbGVtZW50IiwicHJpbWFyeUJ1dHRvbiIsInNlY29uZGFyeUJ1dHRvbiIsImNsYXNzZXMiLCJQcm9wVHlwZXMiLCJmdW5jIiwic3RyaW5nIiwib2JqZWN0IiwiYm9vbCIsInNwaW5uZXIiLCJzcGlubmVyU3RhdGUiLCJvbmVPZiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLFdBQVcsR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFDOUJDLEVBQUFBLFdBQVcsRUFBRSxhQURpQjtBQUU5QkMsRUFBQUEsT0FBTyxFQUFFLFNB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SixtQkFBVUcsTUF4QkQ7QUEwQmY7QUFDQTtBQUNBRSxFQUFBQSxPQUFPLEVBQUVMLG1CQUFVSSxJQTVCSjtBQTZCZkUsRUFBQUEsWUFBWSxFQUFFTixtQkFBVU8sS0FBVixDQUFnQixDQUFDLFNBQUQsQ0FBaEIsQ0E3QkM7QUE4QmYzRyxFQUFBQSxPQUFPLEVBQUVvRyxtQkFBVUksSUE5Qko7QUErQmYxRyxFQUFBQSxPQUFPLEVBQUVzRyxtQkFBVUksSUEvQko7QUFnQ2Z6RyxFQUFBQSxTQUFTLEVBQUVxRyxtQkFBVUksSUFoQ047QUFpQ2Y7QUFDQTtBQUNBO0FBQ0E3RSxFQUFBQSxTQUFTLEVBQUV5RSxtQkFBVUU7QUFwQ04sQywwREF1Q0c7QUFDbEJoQyxFQUFBQSxXQUFXLEdBQUcsQ0FBRTs7QUFERSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgSWRlbnRpdHlBdXRoQ2xpZW50IGZyb20gJy4uLy4uLy4uL0lkZW50aXR5QXV0aENsaWVudCc7XG5pbXBvcnQge0NvbW11bml0eVByb3RvdHlwZVN0b3JlfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5pbXBvcnQge1VQREFURV9FVkVOVH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgeyByZXBsYWNlYWJsZUNvbXBvbmVudCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IEludml0ZVJlYXNvbiBmcm9tIFwiLi4vZWxlbWVudHMvSW52aXRlUmVhc29uXCI7XG5cbmNvbnN0IE1lc3NhZ2VDYXNlID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgTm90TG9nZ2VkSW46IFwiTm90TG9nZ2VkSW5cIixcbiAgICBKb2luaW5nOiBcIkpvaW5pbmdcIixcbiAgICBMb2FkaW5nOiBcIkxvYWRpbmdcIixcbiAgICBSZWplY3Rpbmc6IFwiUmVqZWN0aW5nXCIsXG4gICAgS2lja2VkOiBcIktpY2tlZFwiLFxuICAgIEJhbm5lZDogXCJCYW5uZWRcIixcbiAgICBPdGhlclRocmVlUElERXJyb3I6IFwiT3RoZXJUaHJlZVBJREVycm9yXCIsXG4gICAgSW52aXRlZEVtYWlsTm90Rm91bmRJbkFjY291bnQ6IFwiSW52aXRlZEVtYWlsTm90Rm91bmRJbkFjY291bnRcIixcbiAgICBJbnZpdGVkRW1haWxOb0lkZW50aXR5U2VydmVyOiBcIkludml0ZWRFbWFpbE5vSWRlbnRpdHlTZXJ2ZXJcIixcbiAgICBJbnZpdGVkRW1haWxNaXNtYXRjaDogXCJJbnZpdGVkRW1haWxNaXNtYXRjaFwiLFxuICAgIEludml0ZTogXCJJbnZpdGVcIixcbiAgICBWaWV3aW5nUm9vbTogXCJWaWV3aW5nUm9vbVwiLFxuICAgIFJvb21Ob3RGb3VuZDogXCJSb29tTm90Rm91bmRcIixcbiAgICBPdGhlckVycm9yOiBcIk90aGVyRXJyb3JcIixcbn0pO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5Sb29tUHJldmlld0JhclwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVByZXZpZXdCYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uSm9pbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25SZWplY3RDbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uUmVqZWN0QW5kSWdub3JlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbkZvcmdldENsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLy8gaWYgaW52aXRlck5hbWUgaXMgc3BlY2lmaWVkLCB0aGUgcHJldmlldyBiYXIgd2lsbCBzaG93biBhbiBpbnZpdGUgdG8gdGhlIHJvb20uXG4gICAgICAgIC8vIFlvdSBzaG91bGQgYWxzbyBzcGVjaWZ5IG9uUmVqZWN0Q2xpY2sgaWYgc3BlY2lmaXlpbmcgaW52aXRlck5hbWVcbiAgICAgICAgaW52aXRlck5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLy8gSWYgaW52aXRlZCBieSAzcmQgcGFydHkgaW52aXRlLCB0aGUgZW1haWwgYWRkcmVzcyB0aGUgaW52aXRlIHdhcyBzZW50IHRvXG4gICAgICAgIGludml0ZWRFbWFpbDogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgICAgICAvLyBGb3IgdGhpcmQgcGFydHkgaW52aXRlcywgaW5mb3JtYXRpb24gcGFzc2VkIGFib3V0IHRoZSByb29tIG91dC1vZi1iYW5kXG4gICAgICAgIG9vYkRhdGE6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAgICAgLy8gRm9yIHRoaXJkIHBhcnR5IGludml0ZXMsIGEgVVJMIGZvciBhIDNwaWQgaW52aXRlIHNpZ25pbmcgc2VydmljZVxuICAgICAgICBzaWduVXJsOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8vIEEgc3RhbmRhcmQgY2xpZW50L3NlcnZlciBBUEkgZXJyb3Igb2JqZWN0LiBJZiBzdXBwbGllZCwgaW5kaWNhdGVzIHRoYXQgdGhlXG4gICAgICAgIC8vIGNhbGxlciB3YXMgdW5hYmxlIHRvIGZldGNoIGRldGFpbHMgYWJvdXQgdGhlIHJvb20gZm9yIHRoZSBnaXZlbiByZWFzb24uXG4gICAgICAgIGVycm9yOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgICAgIGNhblByZXZpZXc6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBwcmV2aWV3TG9hZGluZzogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAgICAgLy8gV2hlbiBhIHNwaW5uZXIgaXMgcHJlc2VudCwgYSBzcGlubmVyU3RhdGUgY2FuIGJlIHNwZWNpZmllZCB0byBpbmRpY2F0ZSB0aGVcbiAgICAgICAgLy8gcHVycG9zZSBvZiB0aGUgc3Bpbm5lci5cbiAgICAgICAgc3Bpbm5lcjogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIHNwaW5uZXJTdGF0ZTogUHJvcFR5cGVzLm9uZU9mKFtcImpvaW5pbmdcIl0pLFxuICAgICAgICBsb2FkaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgam9pbmluZzogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIHJlamVjdGluZzogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIC8vIFRoZSBhbGlhcyB0aGF0IHdhcyB1c2VkIHRvIGFjY2VzcyB0aGlzIHJvb20sIGlmIGFwcHJvcHJpYXRlXG4gICAgICAgIC8vIElmIGdpdmVuLCB0aGlzIHdpbGwgYmUgaG93IHRoZSByb29tIGlzIHJlZmVycmVkIHRvIChlZy5cbiAgICAgICAgLy8gaW4gZXJyb3IgbWVzc2FnZXMpLlxuICAgICAgICByb29tQWxpYXM6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIG9uSm9pbkNsaWNrKCkge30sXG4gICAgfTtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBidXN5OiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX2NoZWNrSW52aXRlZEVtYWlsKCk7XG4gICAgICAgIENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5fb25Db21tdW5pdHlVcGRhdGUpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pbnZpdGVkRW1haWwgIT09IHByZXZQcm9wcy5pbnZpdGVkRW1haWwgfHwgdGhpcy5wcm9wcy5pbnZpdGVyTmFtZSAhPT0gcHJldlByb3BzLmludml0ZXJOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLl9jaGVja0ludml0ZWRFbWFpbCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfRVZFTlQsIHRoaXMuX29uQ29tbXVuaXR5VXBkYXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2hlY2tJbnZpdGVkRW1haWwoKSB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgYW4gaW52aXRlIGFuZCB3ZSd2ZSBiZWVuIHRvbGQgd2hhdCBlbWFpbCBhZGRyZXNzIHdhc1xuICAgICAgICAvLyBpbnZpdGVkLCBmZXRjaCB0aGUgdXNlcidzIGFjY291bnQgZW1haWxzIGFuZCBkaXNjb3ZlcnkgYmluZGluZ3Mgc28gd2VcbiAgICAgICAgLy8gY2FuIGNoZWNrIHRoZW0gYWdhaW5zdCB0aGUgZW1haWwgdGhhdCB3YXMgaW52aXRlZC5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaW52aXRlck5hbWUgJiYgdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gR2F0aGVyIHRoZSBhY2NvdW50IDNQSURzXG4gICAgICAgICAgICAgICAgY29uc3QgYWNjb3VudDNwaWRzID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFRocmVlUGlkcygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50RW1haWxzOiBhY2NvdW50M3BpZHMudGhyZWVwaWRzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGIgPT4gYi5tZWRpdW0gPT09ICdlbWFpbCcpLm1hcChiID0+IGIuYWRkcmVzcyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBJUyBjb25uZWN0ZWQsIHVzZSB0aGF0IHRvIGxvb2t1cCB0aGUgZW1haWwgYW5kXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgdGhlIGJvdW5kIE1YSUQuXG4gICAgICAgICAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiBmYWxzZX0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGF1dGhDbGllbnQgPSBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWRlbnRpdHlBY2Nlc3NUb2tlbiA9IGF3YWl0IGF1dGhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubG9va3VwVGhyZWVQaWQoXG4gICAgICAgICAgICAgICAgICAgICdlbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuaW52aXRlZEVtYWlsLFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQgLyogY2FsbGJhY2sgKi8sXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aXR5QWNjZXNzVG9rZW4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpbnZpdGVkRW1haWxNeGlkOiByZXN1bHQubXhpZH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGhyZWVQaWRGZXRjaEVycm9yOiBlcnJ9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25Db21tdW5pdHlVcGRhdGUgPSAocm9vbUlkKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJvb20gJiYgdGhpcy5wcm9wcy5yb29tLnJvb21JZCAhPT0gcm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyB3ZSBoYXZlIG5vdGhpbmcgdG8gdXBkYXRlXG4gICAgfTtcblxuICAgIF9nZXRNZXNzYWdlQ2FzZSgpIHtcbiAgICAgICAgY29uc3QgaXNHdWVzdCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCk7XG5cbiAgICAgICAgaWYgKGlzR3Vlc3QpIHtcbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5Ob3RMb2dnZWRJbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG15TWVtYmVyID0gdGhpcy5fZ2V0TXlNZW1iZXIoKTtcblxuICAgICAgICBpZiAobXlNZW1iZXIpIHtcbiAgICAgICAgICAgIGlmIChteU1lbWJlci5pc0tpY2tlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLktpY2tlZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobXlNZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJiYW5cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5CYW5uZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5qb2luaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuSm9pbmluZztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnJlamVjdGluZykge1xuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLlJlamVjdGluZztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmxvYWRpbmcgfHwgdGhpcy5zdGF0ZS5idXN5KSB7XG4gICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuTG9hZGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmludml0ZXJOYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5pbnZpdGVkRW1haWwpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS50aHJlZVBpZEZldGNoRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLk90aGVyVGhyZWVQSURFcnJvcjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmFjY291bnRFbWFpbHMgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuc3RhdGUuYWNjb3VudEVtYWlscy5pbmNsdWRlcyh0aGlzLnByb3BzLmludml0ZWRFbWFpbClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkludml0ZWRFbWFpbE5vdEZvdW5kSW5BY2NvdW50O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5JbnZpdGVkRW1haWxOb0lkZW50aXR5U2VydmVyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pbnZpdGVkRW1haWxNeGlkICE9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuSW52aXRlZEVtYWlsTWlzbWF0Y2g7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIE1lc3NhZ2VDYXNlLkludml0ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmVycm9yKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lcnJvci5lcnJjb2RlID09ICdNX05PVF9GT1VORCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuUm9vbU5vdEZvdW5kO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWVzc2FnZUNhc2UuT3RoZXJFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNZXNzYWdlQ2FzZS5WaWV3aW5nUm9vbTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRLaWNrT3JCYW5JbmZvKCkge1xuICAgICAgICBjb25zdCBteU1lbWJlciA9IHRoaXMuX2dldE15TWVtYmVyKCk7XG4gICAgICAgIGlmICghbXlNZW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBraWNrZXJNZW1iZXIgPSB0aGlzLnByb3BzLnJvb20uY3VycmVudFN0YXRlLmdldE1lbWJlcihcbiAgICAgICAgICAgIG15TWVtYmVyLmV2ZW50cy5tZW1iZXIuZ2V0U2VuZGVyKCksXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IG1lbWJlck5hbWUgPSBraWNrZXJNZW1iZXIgP1xuICAgICAgICAgICAga2lja2VyTWVtYmVyLm5hbWUgOiBteU1lbWJlci5ldmVudHMubWVtYmVyLmdldFNlbmRlcigpO1xuICAgICAgICBjb25zdCByZWFzb24gPSBteU1lbWJlci5ldmVudHMubWVtYmVyLmdldENvbnRlbnQoKS5yZWFzb247XG4gICAgICAgIHJldHVybiB7bWVtYmVyTmFtZSwgcmVhc29ufTtcbiAgICB9XG5cbiAgICBfam9pblJ1bGUoKSB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnByb3BzLnJvb207XG4gICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICBjb25zdCBqb2luUnVsZXMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLmpvaW5fcnVsZXMnLCAnJyk7XG4gICAgICAgICAgICBpZiAoam9pblJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpvaW5SdWxlcy5nZXRDb250ZW50KCkuam9pbl9ydWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NvbW11bml0eVByb2ZpbGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJvb20pIHJldHVybiBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRJbnZpdGVQcm9maWxlKHRoaXMucHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICByZXR1cm4ge2Rpc3BsYXlOYW1lOiBudWxsLCBhdmF0YXJNeGM6IG51bGx9O1xuICAgIH1cblxuICAgIF9yb29tTmFtZShhdFN0YXJ0ID0gZmFsc2UpIHtcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnByb3BzLnJvb20gPyB0aGlzLnByb3BzLnJvb20ubmFtZSA6IHRoaXMucHJvcHMucm9vbUFsaWFzO1xuICAgICAgICBjb25zdCBwcm9maWxlID0gdGhpcy5fY29tbXVuaXR5UHJvZmlsZSgpO1xuICAgICAgICBpZiAocHJvZmlsZS5kaXNwbGF5TmFtZSkgbmFtZSA9IHByb2ZpbGUuZGlzcGxheU5hbWU7XG4gICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfSBlbHNlIGlmIChhdFN0YXJ0KSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJUaGlzIHJvb21cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJ0aGlzIHJvb21cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0TXlNZW1iZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0aGlzLnByb3BzLnJvb20gJiZcbiAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbS5nZXRNZW1iZXIoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9nZXRJbnZpdGVNZW1iZXIoKSB7XG4gICAgICAgIGNvbnN0IHtyb29tfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICBjb25zdCBpbnZpdGVFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldE1lbWJlcihteVVzZXJJZCk7XG4gICAgICAgIGlmICghaW52aXRlRXZlbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnZpdGVyVXNlcklkID0gaW52aXRlRXZlbnQuZXZlbnRzLm1lbWJlci5nZXRTZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuIHJvb20uY3VycmVudFN0YXRlLmdldE1lbWJlcihpbnZpdGVyVXNlcklkKTtcbiAgICB9XG5cbiAgICBfaXNETUludml0ZSgpIHtcbiAgICAgICAgY29uc3QgbXlNZW1iZXIgPSB0aGlzLl9nZXRNeU1lbWJlcigpO1xuICAgICAgICBpZiAoIW15TWVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWVtYmVyRXZlbnQgPSBteU1lbWJlci5ldmVudHMubWVtYmVyO1xuICAgICAgICBjb25zdCBtZW1iZXJDb250ZW50ID0gbWVtYmVyRXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICByZXR1cm4gbWVtYmVyQ29udGVudC5tZW1iZXJzaGlwID09PSBcImludml0ZVwiICYmIG1lbWJlckNvbnRlbnQuaXNfZGlyZWN0O1xuICAgIH1cblxuICAgIF9tYWtlU2NyZWVuQWZ0ZXJMb2dpbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNjcmVlbjogJ3Jvb20nLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IHRoaXMucHJvcHMuaW52aXRlZEVtYWlsLFxuICAgICAgICAgICAgICAgIHNpZ251cmw6IHRoaXMucHJvcHMuc2lnblVybCxcbiAgICAgICAgICAgICAgICByb29tX25hbWU6IHRoaXMucHJvcHMub29iRGF0YSA/IHRoaXMucHJvcHMub29iRGF0YS5yb29tX25hbWUgOiBudWxsLFxuICAgICAgICAgICAgICAgIHJvb21fYXZhdGFyX3VybDogdGhpcy5wcm9wcy5vb2JEYXRhID8gdGhpcy5wcm9wcy5vb2JEYXRhLmF2YXRhclVybCA6IG51bGwsXG4gICAgICAgICAgICAgICAgaW52aXRlcl9uYW1lOiB0aGlzLnByb3BzLm9vYkRhdGEgPyB0aGlzLnByb3BzLm9vYkRhdGEuaW52aXRlck5hbWUgOiBudWxsLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkxvZ2luQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ3N0YXJ0X2xvZ2luJywgc2NyZWVuQWZ0ZXJMb2dpbjogdGhpcy5fbWFrZVNjcmVlbkFmdGVyTG9naW4oKSB9KTtcbiAgICB9O1xuXG4gICAgb25SZWdpc3RlckNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdzdGFydF9yZWdpc3RyYXRpb24nLCBzY3JlZW5BZnRlckxvZ2luOiB0aGlzLl9tYWtlU2NyZWVuQWZ0ZXJMb2dpbigpIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3Bpbm5lcicpO1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuXG4gICAgICAgIGxldCBzaG93U3Bpbm5lciA9IGZhbHNlO1xuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCBzdWJUaXRsZTtcbiAgICAgICAgbGV0IHJlYXNvbkVsZW1lbnQ7XG4gICAgICAgIGxldCBwcmltYXJ5QWN0aW9uSGFuZGxlcjtcbiAgICAgICAgbGV0IHByaW1hcnlBY3Rpb25MYWJlbDtcbiAgICAgICAgbGV0IHNlY29uZGFyeUFjdGlvbkhhbmRsZXI7XG4gICAgICAgIGxldCBzZWNvbmRhcnlBY3Rpb25MYWJlbDtcbiAgICAgICAgbGV0IGZvb3RlcjtcbiAgICAgICAgY29uc3QgZXh0cmFDb21wb25lbnRzID0gW107XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZUNhc2UgPSB0aGlzLl9nZXRNZXNzYWdlQ2FzZSgpO1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2VDYXNlKSB7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkpvaW5pbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiSm9pbmluZyByb29tIOKAplwiKTtcbiAgICAgICAgICAgICAgICBzaG93U3Bpbm5lciA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkxvYWRpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiTG9hZGluZyDigKZcIik7XG4gICAgICAgICAgICAgICAgc2hvd1NwaW5uZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5SZWplY3Rpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiUmVqZWN0aW5nIGludml0ZSDigKZcIik7XG4gICAgICAgICAgICAgICAgc2hvd1NwaW5uZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5Ob3RMb2dnZWRJbjoge1xuICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJKb2luIHRoZSBjb252ZXJzYXRpb24gd2l0aCBhbiBhY2NvdW50XCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiU2lnbiBVcFwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMub25SZWdpc3RlckNsaWNrO1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkxhYmVsID0gX3QoXCJTaWduIEluXCIpO1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLm9uTG9naW5DbGljaztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5wcmV2aWV3TG9hZGluZykge1xuICAgICAgICAgICAgICAgICAgICBmb290ZXIgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIHc9ezIwfSBoPXsyMH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJMb2FkaW5nIHJvb20gcHJldmlld1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuS2lja2VkOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qge21lbWJlck5hbWUsIHJlYXNvbn0gPSB0aGlzLl9nZXRLaWNrT3JCYW5JbmZvKCk7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSB3ZXJlIGtpY2tlZCBmcm9tICUocm9vbU5hbWUpcyBieSAlKG1lbWJlck5hbWUpc1wiLFxuICAgICAgICAgICAgICAgICAgICB7bWVtYmVyTmFtZSwgcm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCl9KTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IHJlYXNvbiA/IF90KFwiUmVhc29uOiAlKHJlYXNvbilzXCIsIHtyZWFzb259KSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fam9pblJ1bGUoKSA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIkZvcmdldCB0aGlzIHJvb21cIik7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkZvcmdldENsaWNrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiUmUtam9pblwiKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uSm9pbkNsaWNrO1xuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlBY3Rpb25MYWJlbCA9IF90KFwiRm9yZ2V0IHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Gb3JnZXRDbGljaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkJhbm5lZDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHttZW1iZXJOYW1lLCByZWFzb259ID0gdGhpcy5fZ2V0S2lja09yQmFuSW5mbygpO1xuICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJZb3Ugd2VyZSBiYW5uZWQgZnJvbSAlKHJvb21OYW1lKXMgYnkgJShtZW1iZXJOYW1lKXNcIixcbiAgICAgICAgICAgICAgICAgICAge21lbWJlck5hbWUsIHJvb21OYW1lOiB0aGlzLl9yb29tTmFtZSgpfSk7XG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSByZWFzb24gPyBfdChcIlJlYXNvbjogJShyZWFzb24pc1wiLCB7cmVhc29ufSkgOiBudWxsO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiRm9yZ2V0IHRoaXMgcm9vbVwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Gb3JnZXRDbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuT3RoZXJUaHJlZVBJREVycm9yOiB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggeW91ciBpbnZpdGUgdG8gJShyb29tTmFtZSlzXCIsXG4gICAgICAgICAgICAgICAgICAgIHtyb29tTmFtZTogdGhpcy5fcm9vbU5hbWUoKX0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW5SdWxlID0gdGhpcy5fam9pblJ1bGUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJDb2RlTWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFuIGVycm9yICglKGVycmNvZGUpcykgd2FzIHJldHVybmVkIHdoaWxlIHRyeWluZyB0byB2YWxpZGF0ZSB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJpbnZpdGUuIFlvdSBjb3VsZCB0cnkgdG8gcGFzcyB0aGlzIGluZm9ybWF0aW9uIG9uIHRvIGEgcm9vbSBhZG1pbi5cIixcbiAgICAgICAgICAgICAgICAgICAge2VycmNvZGU6IHRoaXMuc3RhdGUudGhyZWVQaWRGZXRjaEVycm9yLmVycmNvZGUgfHwgX3QoXCJ1bmtub3duIGVycm9yIGNvZGVcIil9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChqb2luUnVsZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaW52aXRlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdChcIllvdSBjYW4gb25seSBqb2luIGl0IHdpdGggYSB3b3JraW5nIGludml0ZS5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyQ29kZU1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJUcnkgdG8gam9pbiBhbnl3YXlcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInB1YmxpY1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBfdChcIllvdSBjYW4gc3RpbGwgam9pbiBpdCBiZWNhdXNlIHRoaXMgaXMgYSBwdWJsaWMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIkpvaW4gdGhlIGRpc2N1c3Npb25cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gZXJyQ29kZU1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uTGFiZWwgPSBfdChcIlRyeSB0byBqb2luIGFueXdheVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuSW52aXRlZEVtYWlsTm90Rm91bmRJbkFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXMgd2hpY2ggaXMgbm90IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJhc3NvY2lhdGVkIHdpdGggeW91ciBhY2NvdW50XCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21OYW1lOiB0aGlzLl9yb29tTmFtZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMucHJvcHMuaW52aXRlZEVtYWlsLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJMaW5rIHRoaXMgZW1haWwgd2l0aCB5b3VyIGFjY291bnQgaW4gU2V0dGluZ3MgdG8gcmVjZWl2ZSBpbnZpdGVzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJkaXJlY3RseSBpbiAlKGJyYW5kKXMuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25MYWJlbCA9IF90KFwiSm9pbiB0aGUgZGlzY3Vzc2lvblwiKTtcbiAgICAgICAgICAgICAgICBwcmltYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25Kb2luQ2xpY2s7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLkludml0ZWRFbWFpbE5vSWRlbnRpdHlTZXJ2ZXI6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXNcIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlVzZSBhbiBpZGVudGl0eSBzZXJ2ZXIgaW4gU2V0dGluZ3MgdG8gcmVjZWl2ZSBpbnZpdGVzIGRpcmVjdGx5IGluICUoYnJhbmQpcy5cIixcbiAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJKb2luIHRoZSBkaXNjdXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuSW52aXRlZEVtYWlsTWlzbWF0Y2g6IHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaW52aXRlIHRvICUocm9vbU5hbWUpcyB3YXMgc2VudCB0byAlKGVtYWlsKXNcIixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5wcm9wcy5pbnZpdGVkRW1haWwsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlNoYXJlIHRoaXMgZW1haWwgaW4gU2V0dGluZ3MgdG8gcmVjZWl2ZSBpbnZpdGVzIGRpcmVjdGx5IGluICUoYnJhbmQpcy5cIixcbiAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJKb2luIHRoZSBkaXNjdXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuSW52aXRlOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgUm9vbUF2YXRhciA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5hdmF0YXJzLlJvb21BdmF0YXJcIik7XG4gICAgICAgICAgICAgICAgY29uc3Qgb29iRGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMub29iRGF0YSwge1xuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHRoaXMuX2NvbW11bml0eVByb2ZpbGUoKS5hdmF0YXJNeGMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZhdGFyID0gPFJvb21BdmF0YXIgcm9vbT17dGhpcy5wcm9wcy5yb29tfSBvb2JEYXRhPXtvb2JEYXRhfSAvPjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGludml0ZU1lbWJlciA9IHRoaXMuX2dldEludml0ZU1lbWJlcigpO1xuICAgICAgICAgICAgICAgIGxldCBpbnZpdGVyRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoaW52aXRlTWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGludml0ZXJFbGVtZW50ID0gPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9pbnZpdGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2ludml0ZU1lbWJlci5yYXdEaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gKHtpbnZpdGVNZW1iZXIudXNlcklkfSlcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnZpdGVyRWxlbWVudCA9ICg8c3BhbiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9pbnZpdGVyXCI+e3RoaXMucHJvcHMuaW52aXRlck5hbWV9PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgaXNETSA9IHRoaXMuX2lzRE1JbnZpdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNETSkge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiRG8geW91IHdhbnQgdG8gY2hhdCB3aXRoICUodXNlcilzP1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB1c2VyOiBpbnZpdGVNZW1iZXIubmFtZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3ViVGl0bGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfdChcIjx1c2VyTmFtZS8+IHdhbnRzIHRvIGNoYXRcIiwge30sIHt1c2VyTmFtZTogKCkgPT4gaW52aXRlckVsZW1lbnR9KSxcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJTdGFydCBjaGF0dGluZ1wiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiRG8geW91IHdhbnQgdG8gam9pbiAlKHJvb21OYW1lKXM/XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJvb21OYW1lOiB0aGlzLl9yb29tTmFtZSgpIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcixcbiAgICAgICAgICAgICAgICAgICAgICAgIF90KFwiPHVzZXJOYW1lLz4gaW52aXRlZCB5b3VcIiwge30sIHt1c2VyTmFtZTogKCkgPT4gaW52aXRlckVsZW1lbnR9KSxcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJBY2NlcHRcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVhc29uID0gdGhpcy5wcm9wcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRNZW1iZXIobXlVc2VySWQpLmV2ZW50cy5tZW1iZXIuZXZlbnQuY29udGVudC5yZWFzb247XG4gICAgICAgICAgICAgICAgaWYgKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICByZWFzb25FbGVtZW50ID0gPEludml0ZVJlYXNvbiByZWFzb249e3JlYXNvbn0gLz47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkhhbmRsZXIgPSB0aGlzLnByb3BzLm9uSm9pbkNsaWNrO1xuICAgICAgICAgICAgICAgIHNlY29uZGFyeUFjdGlvbkxhYmVsID0gX3QoXCJSZWplY3RcIik7XG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5QWN0aW9uSGFuZGxlciA9IHRoaXMucHJvcHMub25SZWplY3RDbGljaztcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVqZWN0QW5kSWdub3JlQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFDb21wb25lbnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwic2Vjb25kYXJ5XCIgb25DbGljaz17dGhpcy5wcm9wcy5vblJlamVjdEFuZElnbm9yZUNsaWNrfSBrZXk9XCJpZ25vcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiUmVqZWN0ICYgSWdub3JlIHVzZXJcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDYXNlLlZpZXdpbmdSb29tOiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FuUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiWW91J3JlIHByZXZpZXdpbmcgJShyb29tTmFtZSlzLiBXYW50IHRvIGpvaW4gaXQ/XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7cm9vbU5hbWU6IHRoaXMuX3Jvb21OYW1lKCl9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiJShyb29tTmFtZSlzIGNhbid0IGJlIHByZXZpZXdlZC4gRG8geW91IHdhbnQgdG8gam9pbiBpdD9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtyb29tTmFtZTogdGhpcy5fcm9vbU5hbWUodHJ1ZSl9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJpbWFyeUFjdGlvbkxhYmVsID0gX3QoXCJKb2luIHRoZSBkaXNjdXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgIHByaW1hcnlBY3Rpb25IYW5kbGVyID0gdGhpcy5wcm9wcy5vbkpvaW5DbGljaztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNhc2UuUm9vbU5vdEZvdW5kOiB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIiUocm9vbU5hbWUpcyBkb2VzIG5vdCBleGlzdC5cIiwge3Jvb21OYW1lOiB0aGlzLl9yb29tTmFtZSh0cnVlKX0pO1xuICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gX3QoXCJUaGlzIHJvb20gZG9lc24ndCBleGlzdC4gQXJlIHlvdSBzdXJlIHlvdSdyZSBhdCB0aGUgcmlnaHQgcGxhY2U/XCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ2FzZS5PdGhlckVycm9yOiB7XG4gICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIiUocm9vbU5hbWUpcyBpcyBub3QgYWNjZXNzaWJsZSBhdCB0aGlzIHRpbWUuXCIsIHtyb29tTmFtZTogdGhpcy5fcm9vbU5hbWUodHJ1ZSl9KTtcbiAgICAgICAgICAgICAgICBzdWJUaXRsZSA9IFtcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJUcnkgYWdhaW4gbGF0ZXIsIG9yIGFzayBhIHJvb20gYWRtaW4gdG8gY2hlY2sgaWYgeW91IGhhdmUgYWNjZXNzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIiUoZXJyY29kZSlzIHdhcyByZXR1cm5lZCB3aGlsZSB0cnlpbmcgdG8gYWNjZXNzIHRoZSByb29tLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSB0aGluayB5b3UncmUgc2VlaW5nIHRoaXMgbWVzc2FnZSBpbiBlcnJvciwgcGxlYXNlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPGlzc3VlTGluaz5zdWJtaXQgYSBidWcgcmVwb3J0PC9pc3N1ZUxpbms+LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlcnJjb2RlOiB0aGlzLnByb3BzLmVycm9yLmVycmNvZGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgaXNzdWVMaW5rOiBsYWJlbCA9PiA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvbmV3L2Nob29zZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgbGFiZWwgfTwvYT4gfSxcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN1YlRpdGxlRWxlbWVudHM7XG4gICAgICAgIGlmIChzdWJUaXRsZSkge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHN1YlRpdGxlKSkge1xuICAgICAgICAgICAgICAgIHN1YlRpdGxlID0gW3N1YlRpdGxlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YlRpdGxlRWxlbWVudHMgPSBzdWJUaXRsZS5tYXAoKHQsIGkpID0+IDxwIGtleT17YHN1YlRpdGxlJHtpfWB9Pnt0fTwvcD4pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRpdGxlRWxlbWVudDtcbiAgICAgICAgaWYgKHNob3dTcGlubmVyKSB7XG4gICAgICAgICAgICB0aXRsZUVsZW1lbnQgPSA8aDMgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdCYXJfc3Bpbm5lclRpdGxlXCI+PFNwaW5uZXIgLz57IHRpdGxlIH08L2gzPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpdGxlRWxlbWVudCA9IDxoMz57IHRpdGxlIH08L2gzPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcmltYXJ5QnV0dG9uO1xuICAgICAgICBpZiAocHJpbWFyeUFjdGlvbkhhbmRsZXIpIHtcbiAgICAgICAgICAgIHByaW1hcnlCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXtwcmltYXJ5QWN0aW9uSGFuZGxlcn0+XG4gICAgICAgICAgICAgICAgICAgIHsgcHJpbWFyeUFjdGlvbkxhYmVsIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlY29uZGFyeUJ1dHRvbjtcbiAgICAgICAgaWYgKHNlY29uZGFyeUFjdGlvbkhhbmRsZXIpIHtcbiAgICAgICAgICAgIHNlY29uZGFyeUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwic2Vjb25kYXJ5XCIgb25DbGljaz17c2Vjb25kYXJ5QWN0aW9uSGFuZGxlcn0+XG4gICAgICAgICAgICAgICAgICAgIHsgc2Vjb25kYXJ5QWN0aW9uTGFiZWwgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21QcmV2aWV3QmFyXCIsIFwiZGFyay1wYW5lbFwiLCBgbXhfUm9vbVByZXZpZXdCYXJfJHttZXNzYWdlQ2FzZX1gLCB7XG4gICAgICAgICAgICBcIm14X1Jvb21QcmV2aWV3QmFyX3BhbmVsXCI6IHRoaXMucHJvcHMuY2FuUHJldmlldyxcbiAgICAgICAgICAgIFwibXhfUm9vbVByZXZpZXdCYXJfZGlhbG9nXCI6ICF0aGlzLnByb3BzLmNhblByZXZpZXcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0Jhcl9tZXNzYWdlXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGl0bGVFbGVtZW50IH1cbiAgICAgICAgICAgICAgICAgICAgeyBzdWJUaXRsZUVsZW1lbnRzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHJlYXNvbkVsZW1lbnQgfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdCYXJfYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IHNlY29uZGFyeUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIHsgZXh0cmFDb21wb25lbnRzIH1cbiAgICAgICAgICAgICAgICAgICAgeyBwcmltYXJ5QnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21QcmV2aWV3QmFyX2Zvb3RlclwiPlxuICAgICAgICAgICAgICAgICAgICB7IGZvb3RlciB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=