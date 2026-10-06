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

var _room = require("matrix-js-sdk/src/models/room");

var sdk = _interopRequireWildcard(require("../../index"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _ratelimitedfunc = _interopRequireDefault(require("../../ratelimitedfunc"));

var _GroupAddressPicker = require("../../GroupAddressPicker");

var _GroupStore = _interopRequireDefault(require("../../stores/GroupStore"));

var _RightPanelStorePhases = require("../../stores/RightPanelStorePhases");

var _RightPanelStore = _interopRequireDefault(require("../../stores/RightPanelStore"));

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _actions = require("../../dispatcher/actions");

var _RoomSummaryCard = _interopRequireDefault(require("../views/right_panel/RoomSummaryCard"));

var _WidgetCard = _interopRequireDefault(require("../views/right_panel/WidgetCard"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

let RightPanel = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.RightPanel"), _dec(_class = (_temp = _class2 = class RightPanel extends _react.default.Component {
  static get propTypes() {
    return {
      room: _propTypes.default.instanceOf(_room.Room),
      // if showing panels for a given room, this is set
      groupId: _propTypes.default.string,
      // if showing panels for a given group, this is set
      user: _propTypes.default.object // used if we know the user ahead of opening the panel

    };
  }

  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "onClose", () => {
      // XXX: There are three different ways of 'closing' this panel depending on what state
      // things are in... this knows far more than it should do about the state of the rest
      // of the app and is generally a bit silly.
      if (this.props.user) {
        // If we have a user prop then we're displaying a user from the 'user' page type
        // in LoggedInView, so need to change the page type to close the panel (we switch
        // to the home page which is not obviously the correct thing to do, but I'm not sure
        // anything else is - we could hide the close button altogether?)
        _dispatcher.default.dispatch({
          action: "view_home_page"
        });
      } else if (this.state.phase === _RightPanelStorePhases.RightPanelPhases.EncryptionPanel && this.state.verificationRequest && this.state.verificationRequest.pending) {
        // When the user clicks close on the encryption panel cancel the pending request first if any
        this.state.verificationRequest.cancel();
      } else {
        // the RightPanelStore has no way of knowing which mode room/group it is in, so we handle closing here
        _dispatcher.default.dispatch({
          action: _actions.Action.ToggleRightPanel,
          type: this.props.groupId ? "group" : "room"
        });
      }
    });
    this.state = _objectSpread(_objectSpread({}, _RightPanelStore.default.getSharedInstance().roomPanelPhaseParams), {}, {
      phase: this._getPhaseFromProps(),
      isUserPrivilegedInGroup: null,
      member: this._getUserForPanel()
    });
    this.onAction = this.onAction.bind(this);
    this.onRoomStateMember = this.onRoomStateMember.bind(this);
    this.onGroupStoreUpdated = this.onGroupStoreUpdated.bind(this);
    this.onInviteToGroupButtonClick = this.onInviteToGroupButtonClick.bind(this);
    this.onAddRoomToGroupButtonClick = this.onAddRoomToGroupButtonClick.bind(this);
    this._delayedUpdate = new _ratelimitedfunc.default(() => {
      this.forceUpdate();
    }, 500);
  } // Helper function to split out the logic for _getPhaseFromProps() and the constructor
  // as both are called at the same time in the constructor.


  _getUserForPanel() {
    if (this.state && this.state.member) return this.state.member;

    const lastParams = _RightPanelStore.default.getSharedInstance().roomPanelPhaseParams;

    return this.props.user || lastParams['member'];
  } // gets the current phase from the props and also maybe the store


  _getPhaseFromProps() {
    const rps = _RightPanelStore.default.getSharedInstance();

    const userForPanel = this._getUserForPanel();

    if (this.props.groupId) {
      if (!_RightPanelStorePhases.RIGHT_PANEL_PHASES_NO_ARGS.includes(rps.groupPanelPhase)) {
        _dispatcher.default.dispatch({
          action: _actions.Action.SetRightPanelPhase,
          phase: _RightPanelStorePhases.RightPanelPhases.GroupMemberList
        });

        return _RightPanelStorePhases.RightPanelPhases.GroupMemberList;
      }

      return rps.groupPanelPhase;
    } else if (this.props.room?.isSpaceRoom() && !_RightPanelStorePhases.RIGHT_PANEL_SPACE_PHASES.includes(rps.roomPanelPhase)) {
      return _RightPanelStorePhases.RightPanelPhases.SpaceMemberList;
    } else if (userForPanel) {
      // XXX FIXME AAAAAARGH: What is going on with this class!? It takes some of its state
      // from its props and some from a store, except if the contents of the store changes
      // while it's mounted in which case it replaces all of its state with that of the store,
      // except it uses a dispatch instead of a normal store listener?
      // Unfortunately rewriting this would almost certainly break showing the right panel
      // in some of the many cases, and I don't have time to re-architect it and test all
      // the flows now, so adding yet another special case so if the store thinks there is
      // a verification going on for the member we're displaying, we show that, otherwise
      // we race if a verification is started while the panel isn't displayed because we're
      // not mounted in time to get the dispatch.
      // Until then, let this code serve as a warning from history.
      if (rps.roomPanelPhaseParams.member && userForPanel.userId === rps.roomPanelPhaseParams.member.userId && rps.roomPanelPhaseParams.verificationRequest) {
        return rps.roomPanelPhase;
      }

      return _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo;
    }

    return rps.roomPanelPhase;
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    const cli = this.context;
    cli.on("RoomState.members", this.onRoomStateMember);

    this._initGroupStore(this.props.groupId);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    if (this.context) {
      this.context.removeListener("RoomState.members", this.onRoomStateMember);
    }

    this._unregisterGroupStore(this.props.groupId);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event


  UNSAFE_componentWillReceiveProps(newProps) {
    // eslint-disable-line camelcase
    if (newProps.groupId !== this.props.groupId) {
      this._unregisterGroupStore(this.props.groupId);

      this._initGroupStore(newProps.groupId);
    }
  }

  _initGroupStore(groupId) {
    if (!groupId) return;

    _GroupStore.default.registerListener(groupId, this.onGroupStoreUpdated);
  }

  _unregisterGroupStore() {
    _GroupStore.default.unregisterListener(this.onGroupStoreUpdated);
  }

  onGroupStoreUpdated() {
    this.setState({
      isUserPrivilegedInGroup: _GroupStore.default.isUserPrivileged(this.props.groupId)
    });
  }

  onInviteToGroupButtonClick() {
    (0, _GroupAddressPicker.showGroupInviteDialog)(this.props.groupId).then(() => {
      this.setState({
        phase: _RightPanelStorePhases.RightPanelPhases.GroupMemberList
      });
    });
  }

  onAddRoomToGroupButtonClick() {
    (0, _GroupAddressPicker.showGroupAddRoomDialog)(this.props.groupId).then(() => {
      this.forceUpdate();
    });
  }

  onRoomStateMember(ev, state, member) {
    if (!this.props.room || member.roomId !== this.props.room.roomId) {
      return;
    } // redraw the badge on the membership list


    if (this.state.phase === _RightPanelStorePhases.RightPanelPhases.RoomMemberList && member.roomId === this.props.room.roomId) {
      this._delayedUpdate();
    } else if (this.state.phase === _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo && member.roomId === this.props.room.roomId && member.userId === this.state.member.userId) {
      // refresh the member info (e.g. new power level)
      this._delayedUpdate();
    }
  }

  onAction(payload) {
    if (payload.action === _actions.Action.AfterRightPanelPhaseChange) {
      this.setState({
        phase: payload.phase,
        groupRoomId: payload.groupRoomId,
        groupId: payload.groupId,
        member: payload.member,
        event: payload.event,
        verificationRequest: payload.verificationRequest,
        verificationRequestPromise: payload.verificationRequestPromise,
        widgetId: payload.widgetId,
        space: payload.space
      });
    }
  }

  render() {
    const MemberList = sdk.getComponent('rooms.MemberList');
    const UserInfo = sdk.getComponent('right_panel.UserInfo');
    const ThirdPartyMemberInfo = sdk.getComponent('rooms.ThirdPartyMemberInfo');
    const NotificationPanel = sdk.getComponent('structures.NotificationPanel');
    const FilePanel = sdk.getComponent('structures.FilePanel');
    const GroupMemberList = sdk.getComponent('groups.GroupMemberList');
    const GroupRoomList = sdk.getComponent('groups.GroupRoomList');
    const GroupRoomInfo = sdk.getComponent('groups.GroupRoomInfo');

    let panel = /*#__PURE__*/_react.default.createElement("div", null);

    const roomId = this.props.room ? this.props.room.roomId : undefined;

    switch (this.state.phase) {
      case _RightPanelStorePhases.RightPanelPhases.RoomMemberList:
        if (roomId) {
          panel = /*#__PURE__*/_react.default.createElement(MemberList, {
            roomId: roomId,
            key: roomId,
            onClose: this.onClose
          });
        }

        break;

      case _RightPanelStorePhases.RightPanelPhases.SpaceMemberList:
        panel = /*#__PURE__*/_react.default.createElement(MemberList, {
          roomId: this.state.space ? this.state.space.roomId : roomId,
          key: this.state.space ? this.state.space.roomId : roomId,
          onClose: this.onClose
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.GroupMemberList:
        if (this.props.groupId) {
          panel = /*#__PURE__*/_react.default.createElement(GroupMemberList, {
            groupId: this.props.groupId,
            key: this.props.groupId
          });
        }

        break;

      case _RightPanelStorePhases.RightPanelPhases.GroupRoomList:
        panel = /*#__PURE__*/_react.default.createElement(GroupRoomList, {
          groupId: this.props.groupId,
          key: this.props.groupId
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.RoomMemberInfo:
      case _RightPanelStorePhases.RightPanelPhases.SpaceMemberInfo:
      case _RightPanelStorePhases.RightPanelPhases.EncryptionPanel:
        panel = /*#__PURE__*/_react.default.createElement(UserInfo, {
          user: this.state.member,
          room: this.state.phase === _RightPanelStorePhases.RightPanelPhases.SpaceMemberInfo ? this.state.space : this.props.room,
          key: roomId || this.state.member.userId,
          onClose: this.onClose,
          phase: this.state.phase,
          verificationRequest: this.state.verificationRequest,
          verificationRequestPromise: this.state.verificationRequestPromise
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.Room3pidMemberInfo:
      case _RightPanelStorePhases.RightPanelPhases.Space3pidMemberInfo:
        panel = /*#__PURE__*/_react.default.createElement(ThirdPartyMemberInfo, {
          event: this.state.event,
          key: roomId
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.GroupMemberInfo:
        panel = /*#__PURE__*/_react.default.createElement(UserInfo, {
          user: this.state.member,
          groupId: this.props.groupId,
          key: this.state.member.userId,
          onClose: this.onClose
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.GroupRoomInfo:
        panel = /*#__PURE__*/_react.default.createElement(GroupRoomInfo, {
          groupRoomId: this.state.groupRoomId,
          groupId: this.props.groupId,
          key: this.state.groupRoomId
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.NotificationPanel:
        panel = /*#__PURE__*/_react.default.createElement(NotificationPanel, {
          onClose: this.onClose
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.FilePanel:
        panel = /*#__PURE__*/_react.default.createElement(FilePanel, {
          roomId: roomId,
          resizeNotifier: this.props.resizeNotifier,
          onClose: this.onClose
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.RoomSummary:
        panel = /*#__PURE__*/_react.default.createElement(_RoomSummaryCard.default, {
          room: this.props.room,
          onClose: this.onClose
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.Widget:
        panel = /*#__PURE__*/_react.default.createElement(_WidgetCard.default, {
          room: this.props.room,
          widgetId: this.state.widgetId,
          onClose: this.onClose
        });
        break;
    }

    return /*#__PURE__*/_react.default.createElement("aside", {
      className: "mx_RightPanel dark-panel",
      id: "mx_RightPanel"
    }, panel);
  }

}, (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = RightPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUmlnaHRQYW5lbC5qcyJdLCJuYW1lcyI6WyJSaWdodFBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wVHlwZXMiLCJyb29tIiwiUHJvcFR5cGVzIiwiaW5zdGFuY2VPZiIsIlJvb20iLCJncm91cElkIiwic3RyaW5nIiwidXNlciIsIm9iamVjdCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJzdGF0ZSIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIkVuY3J5cHRpb25QYW5lbCIsInZlcmlmaWNhdGlvblJlcXVlc3QiLCJwZW5kaW5nIiwiY2FuY2VsIiwiQWN0aW9uIiwiVG9nZ2xlUmlnaHRQYW5lbCIsInR5cGUiLCJSaWdodFBhbmVsU3RvcmUiLCJnZXRTaGFyZWRJbnN0YW5jZSIsInJvb21QYW5lbFBoYXNlUGFyYW1zIiwiX2dldFBoYXNlRnJvbVByb3BzIiwiaXNVc2VyUHJpdmlsZWdlZEluR3JvdXAiLCJtZW1iZXIiLCJfZ2V0VXNlckZvclBhbmVsIiwib25BY3Rpb24iLCJiaW5kIiwib25Sb29tU3RhdGVNZW1iZXIiLCJvbkdyb3VwU3RvcmVVcGRhdGVkIiwib25JbnZpdGVUb0dyb3VwQnV0dG9uQ2xpY2siLCJvbkFkZFJvb21Ub0dyb3VwQnV0dG9uQ2xpY2siLCJfZGVsYXllZFVwZGF0ZSIsIlJhdGVMaW1pdGVkRnVuYyIsImZvcmNlVXBkYXRlIiwibGFzdFBhcmFtcyIsInJwcyIsInVzZXJGb3JQYW5lbCIsIlJJR0hUX1BBTkVMX1BIQVNFU19OT19BUkdTIiwiaW5jbHVkZXMiLCJncm91cFBhbmVsUGhhc2UiLCJTZXRSaWdodFBhbmVsUGhhc2UiLCJHcm91cE1lbWJlckxpc3QiLCJpc1NwYWNlUm9vbSIsIlJJR0hUX1BBTkVMX1NQQUNFX1BIQVNFUyIsInJvb21QYW5lbFBoYXNlIiwiU3BhY2VNZW1iZXJMaXN0IiwidXNlcklkIiwiUm9vbU1lbWJlckluZm8iLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsImNsaSIsIm9uIiwiX2luaXRHcm91cFN0b3JlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJfdW5yZWdpc3Rlckdyb3VwU3RvcmUiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5ld1Byb3BzIiwiR3JvdXBTdG9yZSIsInJlZ2lzdGVyTGlzdGVuZXIiLCJ1bnJlZ2lzdGVyTGlzdGVuZXIiLCJzZXRTdGF0ZSIsImlzVXNlclByaXZpbGVnZWQiLCJ0aGVuIiwiZXYiLCJyb29tSWQiLCJSb29tTWVtYmVyTGlzdCIsInBheWxvYWQiLCJBZnRlclJpZ2h0UGFuZWxQaGFzZUNoYW5nZSIsImdyb3VwUm9vbUlkIiwiZXZlbnQiLCJ2ZXJpZmljYXRpb25SZXF1ZXN0UHJvbWlzZSIsIndpZGdldElkIiwic3BhY2UiLCJyZW5kZXIiLCJNZW1iZXJMaXN0Iiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiVXNlckluZm8iLCJUaGlyZFBhcnR5TWVtYmVySW5mbyIsIk5vdGlmaWNhdGlvblBhbmVsIiwiRmlsZVBhbmVsIiwiR3JvdXBSb29tTGlzdCIsIkdyb3VwUm9vbUluZm8iLCJwYW5lbCIsInVuZGVmaW5lZCIsIm9uQ2xvc2UiLCJTcGFjZU1lbWJlckluZm8iLCJSb29tM3BpZE1lbWJlckluZm8iLCJTcGFjZTNwaWRNZW1iZXJJbmZvIiwiR3JvdXBNZW1iZXJJbmZvIiwicmVzaXplTm90aWZpZXIiLCJSb29tU3VtbWFyeSIsIldpZGdldCIsIk1hdHJpeENsaWVudENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0lBR3FCQSxV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QUQ7QUFBWSxVQUFBLElBQUksRUFBRSxLQUFLbkYsS0FBTCxDQUFXVCxJQUE3QjtBQUFtQyxVQUFBLFFBQVEsRUFBRSxLQUFLYyxLQUFMLENBQVdrRSxRQUF4RDtBQUFrRSxVQUFBLE9BQU8sRUFBRSxLQUFLYztBQUFoRixVQUFSO0FBQ0E7QUF4RVI7O0FBMkVBLHdCQUNJO0FBQU8sTUFBQSxTQUFTLEVBQUMsMEJBQWpCO0FBQTRDLE1BQUEsRUFBRSxFQUFDO0FBQS9DLE9BQ01GLEtBRE4sQ0FESjtBQUtIOztBQXJSbUQsQyx3REFTL0JVLDRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IFJhdGVMaW1pdGVkRnVuYyBmcm9tICcuLi8uLi9yYXRlbGltaXRlZGZ1bmMnO1xuaW1wb3J0IHsgc2hvd0dyb3VwSW52aXRlRGlhbG9nLCBzaG93R3JvdXBBZGRSb29tRGlhbG9nIH0gZnJvbSAnLi4vLi4vR3JvdXBBZGRyZXNzUGlja2VyJztcbmltcG9ydCBHcm91cFN0b3JlIGZyb20gJy4uLy4uL3N0b3Jlcy9Hcm91cFN0b3JlJztcbmltcG9ydCB7XG4gICAgUmlnaHRQYW5lbFBoYXNlcyxcbiAgICBSSUdIVF9QQU5FTF9QSEFTRVNfTk9fQVJHUyxcbiAgICBSSUdIVF9QQU5FTF9TUEFDRV9QSEFTRVMsXG59IGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlUGhhc2VzXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBSb29tU3VtbWFyeUNhcmQgZnJvbSBcIi4uL3ZpZXdzL3JpZ2h0X3BhbmVsL1Jvb21TdW1tYXJ5Q2FyZFwiO1xuaW1wb3J0IFdpZGdldENhcmQgZnJvbSBcIi4uL3ZpZXdzL3JpZ2h0X3BhbmVsL1dpZGdldENhcmRcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLlJpZ2h0UGFuZWxcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJpZ2h0UGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBnZXQgcHJvcFR5cGVzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm9vbTogUHJvcFR5cGVzLmluc3RhbmNlT2YoUm9vbSksIC8vIGlmIHNob3dpbmcgcGFuZWxzIGZvciBhIGdpdmVuIHJvb20sIHRoaXMgaXMgc2V0XG4gICAgICAgICAgICBncm91cElkOiBQcm9wVHlwZXMuc3RyaW5nLCAvLyBpZiBzaG93aW5nIHBhbmVscyBmb3IgYSBnaXZlbiBncm91cCwgdGhpcyBpcyBzZXRcbiAgICAgICAgICAgIHVzZXI6IFByb3BUeXBlcy5vYmplY3QsIC8vIHVzZWQgaWYgd2Uga25vdyB0aGUgdXNlciBhaGVhZCBvZiBvcGVuaW5nIHRoZSBwYW5lbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAuLi5SaWdodFBhbmVsU3RvcmUuZ2V0U2hhcmVkSW5zdGFuY2UoKS5yb29tUGFuZWxQaGFzZVBhcmFtcyxcbiAgICAgICAgICAgIHBoYXNlOiB0aGlzLl9nZXRQaGFzZUZyb21Qcm9wcygpLFxuICAgICAgICAgICAgaXNVc2VyUHJpdmlsZWdlZEluR3JvdXA6IG51bGwsXG4gICAgICAgICAgICBtZW1iZXI6IHRoaXMuX2dldFVzZXJGb3JQYW5lbCgpLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uQWN0aW9uID0gdGhpcy5vbkFjdGlvbi5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uUm9vbVN0YXRlTWVtYmVyID0gdGhpcy5vblJvb21TdGF0ZU1lbWJlci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uR3JvdXBTdG9yZVVwZGF0ZWQgPSB0aGlzLm9uR3JvdXBTdG9yZVVwZGF0ZWQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vbkludml0ZVRvR3JvdXBCdXR0b25DbGljayA9IHRoaXMub25JbnZpdGVUb0dyb3VwQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vbkFkZFJvb21Ub0dyb3VwQnV0dG9uQ2xpY2sgPSB0aGlzLm9uQWRkUm9vbVRvR3JvdXBCdXR0b25DbGljay5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX2RlbGF5ZWRVcGRhdGUgPSBuZXcgUmF0ZUxpbWl0ZWRGdW5jKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICB9XG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gc3BsaXQgb3V0IHRoZSBsb2dpYyBmb3IgX2dldFBoYXNlRnJvbVByb3BzKCkgYW5kIHRoZSBjb25zdHJ1Y3RvclxuICAgIC8vIGFzIGJvdGggYXJlIGNhbGxlZCBhdCB0aGUgc2FtZSB0aW1lIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICBfZ2V0VXNlckZvclBhbmVsKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm1lbWJlcikgcmV0dXJuIHRoaXMuc3RhdGUubWVtYmVyO1xuICAgICAgICBjb25zdCBsYXN0UGFyYW1zID0gUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCkucm9vbVBhbmVsUGhhc2VQYXJhbXM7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnVzZXIgfHwgbGFzdFBhcmFtc1snbWVtYmVyJ107XG4gICAgfVxuXG4gICAgLy8gZ2V0cyB0aGUgY3VycmVudCBwaGFzZSBmcm9tIHRoZSBwcm9wcyBhbmQgYWxzbyBtYXliZSB0aGUgc3RvcmVcbiAgICBfZ2V0UGhhc2VGcm9tUHJvcHMoKSB7XG4gICAgICAgIGNvbnN0IHJwcyA9IFJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICBjb25zdCB1c2VyRm9yUGFuZWwgPSB0aGlzLl9nZXRVc2VyRm9yUGFuZWwoKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZ3JvdXBJZCkge1xuICAgICAgICAgICAgaWYgKCFSSUdIVF9QQU5FTF9QSEFTRVNfTk9fQVJHUy5pbmNsdWRlcyhycHMuZ3JvdXBQYW5lbFBoYXNlKSkge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBBY3Rpb24uU2V0UmlnaHRQYW5lbFBoYXNlLCBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5Hcm91cE1lbWJlckxpc3R9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUmlnaHRQYW5lbFBoYXNlcy5Hcm91cE1lbWJlckxpc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnBzLmdyb3VwUGFuZWxQaGFzZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnJvb20/LmlzU3BhY2VSb29tKCkgJiYgIVJJR0hUX1BBTkVMX1NQQUNFX1BIQVNFUy5pbmNsdWRlcyhycHMucm9vbVBhbmVsUGhhc2UpKSB7XG4gICAgICAgICAgICByZXR1cm4gUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckxpc3Q7XG4gICAgICAgIH0gZWxzZSBpZiAodXNlckZvclBhbmVsKSB7XG4gICAgICAgICAgICAvLyBYWFggRklYTUUgQUFBQUFBUkdIOiBXaGF0IGlzIGdvaW5nIG9uIHdpdGggdGhpcyBjbGFzcyE/IEl0IHRha2VzIHNvbWUgb2YgaXRzIHN0YXRlXG4gICAgICAgICAgICAvLyBmcm9tIGl0cyBwcm9wcyBhbmQgc29tZSBmcm9tIGEgc3RvcmUsIGV4Y2VwdCBpZiB0aGUgY29udGVudHMgb2YgdGhlIHN0b3JlIGNoYW5nZXNcbiAgICAgICAgICAgIC8vIHdoaWxlIGl0J3MgbW91bnRlZCBpbiB3aGljaCBjYXNlIGl0IHJlcGxhY2VzIGFsbCBvZiBpdHMgc3RhdGUgd2l0aCB0aGF0IG9mIHRoZSBzdG9yZSxcbiAgICAgICAgICAgIC8vIGV4Y2VwdCBpdCB1c2VzIGEgZGlzcGF0Y2ggaW5zdGVhZCBvZiBhIG5vcm1hbCBzdG9yZSBsaXN0ZW5lcj9cbiAgICAgICAgICAgIC8vIFVuZm9ydHVuYXRlbHkgcmV3cml0aW5nIHRoaXMgd291bGQgYWxtb3N0IGNlcnRhaW5seSBicmVhayBzaG93aW5nIHRoZSByaWdodCBwYW5lbFxuICAgICAgICAgICAgLy8gaW4gc29tZSBvZiB0aGUgbWFueSBjYXNlcywgYW5kIEkgZG9uJ3QgaGF2ZSB0aW1lIHRvIHJlLWFyY2hpdGVjdCBpdCBhbmQgdGVzdCBhbGxcbiAgICAgICAgICAgIC8vIHRoZSBmbG93cyBub3csIHNvIGFkZGluZyB5ZXQgYW5vdGhlciBzcGVjaWFsIGNhc2Ugc28gaWYgdGhlIHN0b3JlIHRoaW5rcyB0aGVyZSBpc1xuICAgICAgICAgICAgLy8gYSB2ZXJpZmljYXRpb24gZ29pbmcgb24gZm9yIHRoZSBtZW1iZXIgd2UncmUgZGlzcGxheWluZywgd2Ugc2hvdyB0aGF0LCBvdGhlcndpc2VcbiAgICAgICAgICAgIC8vIHdlIHJhY2UgaWYgYSB2ZXJpZmljYXRpb24gaXMgc3RhcnRlZCB3aGlsZSB0aGUgcGFuZWwgaXNuJ3QgZGlzcGxheWVkIGJlY2F1c2Ugd2UncmVcbiAgICAgICAgICAgIC8vIG5vdCBtb3VudGVkIGluIHRpbWUgdG8gZ2V0IHRoZSBkaXNwYXRjaC5cbiAgICAgICAgICAgIC8vIFVudGlsIHRoZW4sIGxldCB0aGlzIGNvZGUgc2VydmUgYXMgYSB3YXJuaW5nIGZyb20gaGlzdG9yeS5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBycHMucm9vbVBhbmVsUGhhc2VQYXJhbXMubWVtYmVyICYmXG4gICAgICAgICAgICAgICAgdXNlckZvclBhbmVsLnVzZXJJZCA9PT0gcnBzLnJvb21QYW5lbFBoYXNlUGFyYW1zLm1lbWJlci51c2VySWQgJiZcbiAgICAgICAgICAgICAgICBycHMucm9vbVBhbmVsUGhhc2VQYXJhbXMudmVyaWZpY2F0aW9uUmVxdWVzdFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJwcy5yb29tUGFuZWxQaGFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJJbmZvO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBycHMucm9vbVBhbmVsUGhhc2U7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgY29uc3QgY2xpID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBjbGkub24oXCJSb29tU3RhdGUubWVtYmVyc1wiLCB0aGlzLm9uUm9vbVN0YXRlTWVtYmVyKTtcbiAgICAgICAgdGhpcy5faW5pdEdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dCkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKFwiUm9vbVN0YXRlLm1lbWJlcnNcIiwgdGhpcy5vblJvb21TdGF0ZU1lbWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdW5yZWdpc3Rlckdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGlmIChuZXdQcm9wcy5ncm91cElkICE9PSB0aGlzLnByb3BzLmdyb3VwSWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3VucmVnaXN0ZXJHcm91cFN0b3JlKHRoaXMucHJvcHMuZ3JvdXBJZCk7XG4gICAgICAgICAgICB0aGlzLl9pbml0R3JvdXBTdG9yZShuZXdQcm9wcy5ncm91cElkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9pbml0R3JvdXBTdG9yZShncm91cElkKSB7XG4gICAgICAgIGlmICghZ3JvdXBJZCkgcmV0dXJuO1xuICAgICAgICBHcm91cFN0b3JlLnJlZ2lzdGVyTGlzdGVuZXIoZ3JvdXBJZCwgdGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBfdW5yZWdpc3Rlckdyb3VwU3RvcmUoKSB7XG4gICAgICAgIEdyb3VwU3RvcmUudW5yZWdpc3Rlckxpc3RlbmVyKHRoaXMub25Hcm91cFN0b3JlVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgb25Hcm91cFN0b3JlVXBkYXRlZCgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc1VzZXJQcml2aWxlZ2VkSW5Hcm91cDogR3JvdXBTdG9yZS5pc1VzZXJQcml2aWxlZ2VkKHRoaXMucHJvcHMuZ3JvdXBJZCksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uSW52aXRlVG9Hcm91cEJ1dHRvbkNsaWNrKCkge1xuICAgICAgICBzaG93R3JvdXBJbnZpdGVEaWFsb2codGhpcy5wcm9wcy5ncm91cElkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLkdyb3VwTWVtYmVyTGlzdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkFkZFJvb21Ub0dyb3VwQnV0dG9uQ2xpY2soKSB7XG4gICAgICAgIHNob3dHcm91cEFkZFJvb21EaWFsb2codGhpcy5wcm9wcy5ncm91cElkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Sb29tU3RhdGVNZW1iZXIoZXYsIHN0YXRlLCBtZW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnJvb20gfHwgbWVtYmVyLnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlZHJhdyB0aGUgYmFkZ2Ugb24gdGhlIG1lbWJlcnNoaXAgbGlzdFxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5waGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdCAmJiBtZW1iZXIucm9vbUlkID09PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWxheWVkVXBkYXRlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5waGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVySW5mbyAmJiBtZW1iZXIucm9vbUlkID09PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkICYmXG4gICAgICAgICAgICAgICAgbWVtYmVyLnVzZXJJZCA9PT0gdGhpcy5zdGF0ZS5tZW1iZXIudXNlcklkKSB7XG4gICAgICAgICAgICAvLyByZWZyZXNoIHRoZSBtZW1iZXIgaW5mbyAoZS5nLiBuZXcgcG93ZXIgbGV2ZWwpXG4gICAgICAgICAgICB0aGlzLl9kZWxheWVkVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkFjdGlvbihwYXlsb2FkKSB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLkFmdGVyUmlnaHRQYW5lbFBoYXNlQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwaGFzZTogcGF5bG9hZC5waGFzZSxcbiAgICAgICAgICAgICAgICBncm91cFJvb21JZDogcGF5bG9hZC5ncm91cFJvb21JZCxcbiAgICAgICAgICAgICAgICBncm91cElkOiBwYXlsb2FkLmdyb3VwSWQsXG4gICAgICAgICAgICAgICAgbWVtYmVyOiBwYXlsb2FkLm1lbWJlcixcbiAgICAgICAgICAgICAgICBldmVudDogcGF5bG9hZC5ldmVudCxcbiAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25SZXF1ZXN0OiBwYXlsb2FkLnZlcmlmaWNhdGlvblJlcXVlc3QsXG4gICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uUmVxdWVzdFByb21pc2U6IHBheWxvYWQudmVyaWZpY2F0aW9uUmVxdWVzdFByb21pc2UsXG4gICAgICAgICAgICAgICAgd2lkZ2V0SWQ6IHBheWxvYWQud2lkZ2V0SWQsXG4gICAgICAgICAgICAgICAgc3BhY2U6IHBheWxvYWQuc3BhY2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQ2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIC8vIFhYWDogVGhlcmUgYXJlIHRocmVlIGRpZmZlcmVudCB3YXlzIG9mICdjbG9zaW5nJyB0aGlzIHBhbmVsIGRlcGVuZGluZyBvbiB3aGF0IHN0YXRlXG4gICAgICAgIC8vIHRoaW5ncyBhcmUgaW4uLi4gdGhpcyBrbm93cyBmYXIgbW9yZSB0aGFuIGl0IHNob3VsZCBkbyBhYm91dCB0aGUgc3RhdGUgb2YgdGhlIHJlc3RcbiAgICAgICAgLy8gb2YgdGhlIGFwcCBhbmQgaXMgZ2VuZXJhbGx5IGEgYml0IHNpbGx5LlxuICAgICAgICBpZiAodGhpcy5wcm9wcy51c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgdXNlciBwcm9wIHRoZW4gd2UncmUgZGlzcGxheWluZyBhIHVzZXIgZnJvbSB0aGUgJ3VzZXInIHBhZ2UgdHlwZVxuICAgICAgICAgICAgLy8gaW4gTG9nZ2VkSW5WaWV3LCBzbyBuZWVkIHRvIGNoYW5nZSB0aGUgcGFnZSB0eXBlIHRvIGNsb3NlIHRoZSBwYW5lbCAod2Ugc3dpdGNoXG4gICAgICAgICAgICAvLyB0byB0aGUgaG9tZSBwYWdlIHdoaWNoIGlzIG5vdCBvYnZpb3VzbHkgdGhlIGNvcnJlY3QgdGhpbmcgdG8gZG8sIGJ1dCBJJ20gbm90IHN1cmVcbiAgICAgICAgICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgLSB3ZSBjb3VsZCBoaWRlIHRoZSBjbG9zZSBidXR0b24gYWx0b2dldGhlcj8pXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X2hvbWVfcGFnZVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbCAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS52ZXJpZmljYXRpb25SZXF1ZXN0ICYmIHRoaXMuc3RhdGUudmVyaWZpY2F0aW9uUmVxdWVzdC5wZW5kaW5nXG4gICAgICAgICkge1xuICAgICAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3MgY2xvc2Ugb24gdGhlIGVuY3J5cHRpb24gcGFuZWwgY2FuY2VsIHRoZSBwZW5kaW5nIHJlcXVlc3QgZmlyc3QgaWYgYW55XG4gICAgICAgICAgICB0aGlzLnN0YXRlLnZlcmlmaWNhdGlvblJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgUmlnaHRQYW5lbFN0b3JlIGhhcyBubyB3YXkgb2Yga25vd2luZyB3aGljaCBtb2RlIHJvb20vZ3JvdXAgaXQgaXMgaW4sIHNvIHdlIGhhbmRsZSBjbG9zaW5nIGhlcmVcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVG9nZ2xlUmlnaHRQYW5lbCxcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLnByb3BzLmdyb3VwSWQgPyBcImdyb3VwXCIgOiBcInJvb21cIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgTWVtYmVyTGlzdCA9IHNkay5nZXRDb21wb25lbnQoJ3Jvb21zLk1lbWJlckxpc3QnKTtcbiAgICAgICAgY29uc3QgVXNlckluZm8gPSBzZGsuZ2V0Q29tcG9uZW50KCdyaWdodF9wYW5lbC5Vc2VySW5mbycpO1xuICAgICAgICBjb25zdCBUaGlyZFBhcnR5TWVtYmVySW5mbyA9IHNkay5nZXRDb21wb25lbnQoJ3Jvb21zLlRoaXJkUGFydHlNZW1iZXJJbmZvJyk7XG4gICAgICAgIGNvbnN0IE5vdGlmaWNhdGlvblBhbmVsID0gc2RrLmdldENvbXBvbmVudCgnc3RydWN0dXJlcy5Ob3RpZmljYXRpb25QYW5lbCcpO1xuICAgICAgICBjb25zdCBGaWxlUGFuZWwgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLkZpbGVQYW5lbCcpO1xuXG4gICAgICAgIGNvbnN0IEdyb3VwTWVtYmVyTGlzdCA9IHNkay5nZXRDb21wb25lbnQoJ2dyb3Vwcy5Hcm91cE1lbWJlckxpc3QnKTtcbiAgICAgICAgY29uc3QgR3JvdXBSb29tTGlzdCA9IHNkay5nZXRDb21wb25lbnQoJ2dyb3Vwcy5Hcm91cFJvb21MaXN0Jyk7XG4gICAgICAgIGNvbnN0IEdyb3VwUm9vbUluZm8gPSBzZGsuZ2V0Q29tcG9uZW50KCdncm91cHMuR3JvdXBSb29tSW5mbycpO1xuXG4gICAgICAgIGxldCBwYW5lbCA9IDxkaXYgLz47XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMucm9vbSA/IHRoaXMucHJvcHMucm9vbS5yb29tSWQgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckxpc3Q6XG4gICAgICAgICAgICAgICAgaWYgKHJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICBwYW5lbCA9IDxNZW1iZXJMaXN0IHJvb21JZD17cm9vbUlkfSBrZXk9e3Jvb21JZH0gb25DbG9zZT17dGhpcy5vbkNsb3NlfSAvPjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJMaXN0OlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPE1lbWJlckxpc3RcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkPXt0aGlzLnN0YXRlLnNwYWNlID8gdGhpcy5zdGF0ZS5zcGFjZS5yb29tSWQgOiByb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIGtleT17dGhpcy5zdGF0ZS5zcGFjZSA/IHRoaXMuc3RhdGUuc3BhY2Uucm9vbUlkIDogcm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2V9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Hcm91cE1lbWJlckxpc3Q6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZ3JvdXBJZCkge1xuICAgICAgICAgICAgICAgICAgICBwYW5lbCA9IDxHcm91cE1lbWJlckxpc3QgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfSBrZXk9e3RoaXMucHJvcHMuZ3JvdXBJZH0gLz47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuR3JvdXBSb29tTGlzdDpcbiAgICAgICAgICAgICAgICBwYW5lbCA9IDxHcm91cFJvb21MaXN0IGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH0ga2V5PXt0aGlzLnByb3BzLmdyb3VwSWR9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckluZm86XG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2VNZW1iZXJJbmZvOlxuICAgICAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLkVuY3J5cHRpb25QYW5lbDpcbiAgICAgICAgICAgICAgICBwYW5lbCA9IDxVc2VySW5mb1xuICAgICAgICAgICAgICAgICAgICB1c2VyPXt0aGlzLnN0YXRlLm1lbWJlcn1cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5zdGF0ZS5waGFzZSA9PT0gUmlnaHRQYW5lbFBoYXNlcy5TcGFjZU1lbWJlckluZm8gPyB0aGlzLnN0YXRlLnNwYWNlIDogdGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e3Jvb21JZCB8fCB0aGlzLnN0YXRlLm1lbWJlci51c2VySWR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMub25DbG9zZX1cbiAgICAgICAgICAgICAgICAgICAgcGhhc2U9e3RoaXMuc3RhdGUucGhhc2V9XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvblJlcXVlc3Q9e3RoaXMuc3RhdGUudmVyaWZpY2F0aW9uUmVxdWVzdH1cbiAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uUmVxdWVzdFByb21pc2U9e3RoaXMuc3RhdGUudmVyaWZpY2F0aW9uUmVxdWVzdFByb21pc2V9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Sb29tM3BpZE1lbWJlckluZm86XG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuU3BhY2UzcGlkTWVtYmVySW5mbzpcbiAgICAgICAgICAgICAgICBwYW5lbCA9IDxUaGlyZFBhcnR5TWVtYmVySW5mbyBldmVudD17dGhpcy5zdGF0ZS5ldmVudH0ga2V5PXtyb29tSWR9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuR3JvdXBNZW1iZXJJbmZvOlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPFVzZXJJbmZvXG4gICAgICAgICAgICAgICAgICAgIHVzZXI9e3RoaXMuc3RhdGUubWVtYmVyfVxuICAgICAgICAgICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9XG4gICAgICAgICAgICAgICAgICAgIGtleT17dGhpcy5zdGF0ZS5tZW1iZXIudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2V9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuR3JvdXBSb29tSW5mbzpcbiAgICAgICAgICAgICAgICBwYW5lbCA9IDxHcm91cFJvb21JbmZvXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwUm9vbUlkPXt0aGlzLnN0YXRlLmdyb3VwUm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9XG4gICAgICAgICAgICAgICAgICAgIGtleT17dGhpcy5zdGF0ZS5ncm91cFJvb21JZH0gLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Ob3RpZmljYXRpb25QYW5lbDpcbiAgICAgICAgICAgICAgICBwYW5lbCA9IDxOb3RpZmljYXRpb25QYW5lbCBvbkNsb3NlPXt0aGlzLm9uQ2xvc2V9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuRmlsZVBhbmVsOlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPEZpbGVQYW5lbCByb29tSWQ9e3Jvb21JZH0gcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9IG9uQ2xvc2U9e3RoaXMub25DbG9zZX0gLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Sb29tU3VtbWFyeTpcbiAgICAgICAgICAgICAgICBwYW5lbCA9IDxSb29tU3VtbWFyeUNhcmQgcm9vbT17dGhpcy5wcm9wcy5yb29tfSBvbkNsb3NlPXt0aGlzLm9uQ2xvc2V9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuV2lkZ2V0OlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPFdpZGdldENhcmQgcm9vbT17dGhpcy5wcm9wcy5yb29tfSB3aWRnZXRJZD17dGhpcy5zdGF0ZS53aWRnZXRJZH0gb25DbG9zZT17dGhpcy5vbkNsb3NlfSAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8YXNpZGUgY2xhc3NOYW1lPVwibXhfUmlnaHRQYW5lbCBkYXJrLXBhbmVsXCIgaWQ9XCJteF9SaWdodFBhbmVsXCI+XG4gICAgICAgICAgICAgICAgeyBwYW5lbCB9XG4gICAgICAgICAgICA8L2FzaWRlPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==