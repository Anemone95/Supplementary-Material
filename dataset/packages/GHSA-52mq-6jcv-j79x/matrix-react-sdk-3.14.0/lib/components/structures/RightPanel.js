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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class RightPanel extends _react.default.Component {
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
    } else {
      return rps.roomPanelPhase;
    }
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
        widgetId: payload.widgetId
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
      case _RightPanelStorePhases.RightPanelPhases.EncryptionPanel:
        panel = /*#__PURE__*/_react.default.createElement(UserInfo, {
          user: this.state.member,
          room: this.props.room,
          key: roomId || this.state.member.userId,
          onClose: this.onClose,
          phase: this.state.phase,
          verificationRequest: this.state.verificationRequest,
          verificationRequestPromise: this.state.verificationRequestPromise
        });
        break;

      case _RightPanelStorePhases.RightPanelPhases.Room3pidMemberInfo:
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

}

exports.default = RightPanel;
(0, _defineProperty2.default)(RightPanel, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvUmlnaHRQYW5lbC5qcyJdLCJuYW1lcyI6WyJSaWdodFBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wVHlwZXMiLCJyb29tIiwiUHJvcFR5cGVzIiwiaW5zdGFuY2VPZiIsIlJvb20iLCJncm91cElkIiwic3RyaW5nIiwidXNlciIsIm9iamVjdCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJzdGF0ZSIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIkVuY3J5cHRpb25QYW5lbCIsInZlcmlmaWNhdGlvblJlcXVlc3QiLCJwZW5kaW5nIiwiY2FuY2VsIiwiQWN0aW9uIiwiVG9nZ2xlUmlnaHRQYW5lbCIsInR5cGUiLCJSaWdodFBhbmVsU3RvcmUiLCJnZXRTaGFyZWRJbnN0YW5jZSIsInJvb21QYW5lbFBoYXNlUGFyYW1zIiwiX2dldFBoYXNlRnJvbVByb3BzIiwiaXNVc2VyUHJpdmlsZWdlZEluR3JvdXAiLCJtZW1iZXIiLCJfZ2V0VXNlckZvclBhbmVsIiwib25BY3Rpb24iLCJiaW5kIiwib25Sb29tU3RhdGVNZW1iZXIiLCJvbkdyb3VwU3RvcmVVcGRhdGVkIiwib25JbnZpdGVUb0dyb3VwQnV0dG9uQ2xpY2siLCJvbkFkZFJvb21Ub0dyb3VwQnV0dG9uQ2xpY2siLCJfZGVsYXllZFVwZGF0ZSIsIlJhdGVMaW1pdGVkRnVuYyIsImZvcmNlVXBkYXRlIiwibGFzdFBhcmFtcyIsInJwcyIsInVzZXJGb3JQYW5lbCIsIlJJR0hUX1BBTkVMX1BIQVNFU19OT19BUkdTIiwiaW5jbHVkZXMiLCJncm91cFBhbmVsUGhhc2UiLCJTZXRSaWdodFBhbmVsUGhhc2UiLCJHcm91cE1lbWJlckxpc3QiLCJ1c2VySWQiLCJyb29tUGFuZWxQaGFzZSIsIlJvb21NZW1iZXJJbmZvIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJjbGkiLCJvbiIsIl9pbml0R3JvdXBTdG9yZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsInJlbW92ZUxpc3RlbmVyIiwiX3VucmVnaXN0ZXJHcm91cFN0b3JlIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsIkdyb3VwU3RvcmUiLCJyZWdpc3Rlckxpc3RlbmVyIiwidW5yZWdpc3Rlckxpc3RlbmVyIiwic2V0U3RhdGUiLCJpc1VzZXJQcml2aWxlZ2VkIiwidGhlbiIsImV2Iiwicm9vbUlkIiwiUm9vbU1lbWJlckxpc3QiLCJwYXlsb2FkIiwiQWZ0ZXJSaWdodFBhbmVsUGhhc2VDaGFuZ2UiLCJncm91cFJvb21JZCIsImV2ZW50IiwidmVyaWZpY2F0aW9uUmVxdWVzdFByb21pc2UiLCJ3aWRnZXRJZCIsInJlbmRlciIsIk1lbWJlckxpc3QiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJVc2VySW5mbyIsIlRoaXJkUGFydHlNZW1iZXJJbmZvIiwiTm90aWZpY2F0aW9uUGFuZWwiLCJGaWxlUGFuZWwiLCJHcm91cFJvb21MaXN0IiwiR3JvdXBSb29tSW5mbyIsInBhbmVsIiwidW5kZWZpbmVkIiwib25DbG9zZSIsIlJvb20zcGlkTWVtYmVySW5mbyIsIkdyb3VwTWVtYmVySW5mbyIsInJlc2l6ZU5vdGlmaWVyIiwiUm9vbVN1bW1hcnkiLCJXaWRnZXQiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFZSxNQUFNQSxVQUFOLFNBQXlCQyxlQUFNQyxTQUEvQixDQUF5QztBQUNwRCxhQUFXQyxTQUFYLEdBQXVCO0FBQ25CLFdBQU87QUFDSEMsTUFBQUEsSUFBSSxFQUFFQyxtQkFBVUMsVUFBVixDQUFxQkMsVUFBckIs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LElBQUksRUFBRSxLQUFLL0UsS0FBTCxDQUFXVCxJQUFsQztBQUF3QyxVQUFBLE9BQU8sRUFBRSxLQUFLMEY7QUFBdEQsVUFBUjtBQUNBOztBQUVKLFdBQUsxRSx3Q0FBaUIrRSxNQUF0QjtBQUNJUCxRQUFBQSxLQUFLLGdCQUFHLDZCQUFDLG1CQUFEO0FBQVksVUFBQSxJQUFJLEVBQUUsS0FBSy9FLEtBQUwsQ0FBV1QsSUFBN0I7QUFBbUMsVUFBQSxRQUFRLEVBQUUsS0FBS2MsS0FBTCxDQUFXK0QsUUFBeEQ7QUFBa0UsVUFBQSxPQUFPLEVBQUUsS0FBS2E7QUFBaEYsVUFBUjtBQUNBO0FBL0RSOztBQWtFQSx3QkFDSTtBQUFPLE1BQUEsU0FBUyxFQUFDLDBCQUFqQjtBQUE0QyxNQUFBLEVBQUUsRUFBQztBQUEvQyxPQUNNRixLQUROLENBREo7QUFLSDs7QUExUW1EOzs7OEJBQW5DNUYsVSxpQkFTSW9HLDRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IFJhdGVMaW1pdGVkRnVuYyBmcm9tICcuLi8uLi9yYXRlbGltaXRlZGZ1bmMnO1xuaW1wb3J0IHsgc2hvd0dyb3VwSW52aXRlRGlhbG9nLCBzaG93R3JvdXBBZGRSb29tRGlhbG9nIH0gZnJvbSAnLi4vLi4vR3JvdXBBZGRyZXNzUGlja2VyJztcbmltcG9ydCBHcm91cFN0b3JlIGZyb20gJy4uLy4uL3N0b3Jlcy9Hcm91cFN0b3JlJztcbmltcG9ydCB7UmlnaHRQYW5lbFBoYXNlcywgUklHSFRfUEFORUxfUEhBU0VTX05PX0FSR1N9IGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlUGhhc2VzXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBSb29tU3VtbWFyeUNhcmQgZnJvbSBcIi4uL3ZpZXdzL3JpZ2h0X3BhbmVsL1Jvb21TdW1tYXJ5Q2FyZFwiO1xuaW1wb3J0IFdpZGdldENhcmQgZnJvbSBcIi4uL3ZpZXdzL3JpZ2h0X3BhbmVsL1dpZGdldENhcmRcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmlnaHRQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIGdldCBwcm9wVHlwZXMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByb29tOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSb29tKSwgLy8gaWYgc2hvd2luZyBwYW5lbHMgZm9yIGEgZ2l2ZW4gcm9vbSwgdGhpcyBpcyBzZXRcbiAgICAgICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcsIC8vIGlmIHNob3dpbmcgcGFuZWxzIGZvciBhIGdpdmVuIGdyb3VwLCB0aGlzIGlzIHNldFxuICAgICAgICAgICAgdXNlcjogUHJvcFR5cGVzLm9iamVjdCwgLy8gdXNlZCBpZiB3ZSBrbm93IHRoZSB1c2VyIGFoZWFkIG9mIG9wZW5pbmcgdGhlIHBhbmVsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC4uLlJpZ2h0UGFuZWxTdG9yZS5nZXRTaGFyZWRJbnN0YW5jZSgpLnJvb21QYW5lbFBoYXNlUGFyYW1zLFxuICAgICAgICAgICAgcGhhc2U6IHRoaXMuX2dldFBoYXNlRnJvbVByb3BzKCksXG4gICAgICAgICAgICBpc1VzZXJQcml2aWxlZ2VkSW5Hcm91cDogbnVsbCxcbiAgICAgICAgICAgIG1lbWJlcjogdGhpcy5fZ2V0VXNlckZvclBhbmVsKCksXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25BY3Rpb24gPSB0aGlzLm9uQWN0aW9uLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25Sb29tU3RhdGVNZW1iZXIgPSB0aGlzLm9uUm9vbVN0YXRlTWVtYmVyLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25Hcm91cFN0b3JlVXBkYXRlZCA9IHRoaXMub25Hcm91cFN0b3JlVXBkYXRlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uSW52aXRlVG9Hcm91cEJ1dHRvbkNsaWNrID0gdGhpcy5vbkludml0ZVRvR3JvdXBCdXR0b25DbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uQWRkUm9vbVRvR3JvdXBCdXR0b25DbGljayA9IHRoaXMub25BZGRSb29tVG9Hcm91cEJ1dHRvbkNsaWNrLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5fZGVsYXllZFVwZGF0ZSA9IG5ldyBSYXRlTGltaXRlZEZ1bmMoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9LCA1MDApO1xuICAgIH1cblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBzcGxpdCBvdXQgdGhlIGxvZ2ljIGZvciBfZ2V0UGhhc2VGcm9tUHJvcHMoKSBhbmQgdGhlIGNvbnN0cnVjdG9yXG4gICAgLy8gYXMgYm90aCBhcmUgY2FsbGVkIGF0IHRoZSBzYW1lIHRpbWUgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgIF9nZXRVc2VyRm9yUGFuZWwoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubWVtYmVyKSByZXR1cm4gdGhpcy5zdGF0ZS5tZW1iZXI7XG4gICAgICAgIGNvbnN0IGxhc3RQYXJhbXMgPSBSaWdodFBhbmVsU3RvcmUuZ2V0U2hhcmVkSW5zdGFuY2UoKS5yb29tUGFuZWxQaGFzZVBhcmFtcztcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudXNlciB8fCBsYXN0UGFyYW1zWydtZW1iZXInXTtcbiAgICB9XG5cbiAgICAvLyBnZXRzIHRoZSBjdXJyZW50IHBoYXNlIGZyb20gdGhlIHByb3BzIGFuZCBhbHNvIG1heWJlIHRoZSBzdG9yZVxuICAgIF9nZXRQaGFzZUZyb21Qcm9wcygpIHtcbiAgICAgICAgY29uc3QgcnBzID0gUmlnaHRQYW5lbFN0b3JlLmdldFNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgIGNvbnN0IHVzZXJGb3JQYW5lbCA9IHRoaXMuX2dldFVzZXJGb3JQYW5lbCgpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5ncm91cElkKSB7XG4gICAgICAgICAgICBpZiAoIVJJR0hUX1BBTkVMX1BIQVNFU19OT19BUkdTLmluY2x1ZGVzKHJwcy5ncm91cFBhbmVsUGhhc2UpKSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsIHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLkdyb3VwTWVtYmVyTGlzdH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBSaWdodFBhbmVsUGhhc2VzLkdyb3VwTWVtYmVyTGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBycHMuZ3JvdXBQYW5lbFBoYXNlO1xuICAgICAgICB9IGVsc2UgaWYgKHVzZXJGb3JQYW5lbCkge1xuICAgICAgICAgICAgLy8gWFhYIEZJWE1FIEFBQUFBQVJHSDogV2hhdCBpcyBnb2luZyBvbiB3aXRoIHRoaXMgY2xhc3MhPyBJdCB0YWtlcyBzb21lIG9mIGl0cyBzdGF0ZVxuICAgICAgICAgICAgLy8gZnJvbSBpdHMgcHJvcHMgYW5kIHNvbWUgZnJvbSBhIHN0b3JlLCBleGNlcHQgaWYgdGhlIGNvbnRlbnRzIG9mIHRoZSBzdG9yZSBjaGFuZ2VzXG4gICAgICAgICAgICAvLyB3aGlsZSBpdCdzIG1vdW50ZWQgaW4gd2hpY2ggY2FzZSBpdCByZXBsYWNlcyBhbGwgb2YgaXRzIHN0YXRlIHdpdGggdGhhdCBvZiB0aGUgc3RvcmUsXG4gICAgICAgICAgICAvLyBleGNlcHQgaXQgdXNlcyBhIGRpc3BhdGNoIGluc3RlYWQgb2YgYSBub3JtYWwgc3RvcmUgbGlzdGVuZXI/XG4gICAgICAgICAgICAvLyBVbmZvcnR1bmF0ZWx5IHJld3JpdGluZyB0aGlzIHdvdWxkIGFsbW9zdCBjZXJ0YWlubHkgYnJlYWsgc2hvd2luZyB0aGUgcmlnaHQgcGFuZWxcbiAgICAgICAgICAgIC8vIGluIHNvbWUgb2YgdGhlIG1hbnkgY2FzZXMsIGFuZCBJIGRvbid0IGhhdmUgdGltZSB0byByZS1hcmNoaXRlY3QgaXQgYW5kIHRlc3QgYWxsXG4gICAgICAgICAgICAvLyB0aGUgZmxvd3Mgbm93LCBzbyBhZGRpbmcgeWV0IGFub3RoZXIgc3BlY2lhbCBjYXNlIHNvIGlmIHRoZSBzdG9yZSB0aGlua3MgdGhlcmUgaXNcbiAgICAgICAgICAgIC8vIGEgdmVyaWZpY2F0aW9uIGdvaW5nIG9uIGZvciB0aGUgbWVtYmVyIHdlJ3JlIGRpc3BsYXlpbmcsIHdlIHNob3cgdGhhdCwgb3RoZXJ3aXNlXG4gICAgICAgICAgICAvLyB3ZSByYWNlIGlmIGEgdmVyaWZpY2F0aW9uIGlzIHN0YXJ0ZWQgd2hpbGUgdGhlIHBhbmVsIGlzbid0IGRpc3BsYXllZCBiZWNhdXNlIHdlJ3JlXG4gICAgICAgICAgICAvLyBub3QgbW91bnRlZCBpbiB0aW1lIHRvIGdldCB0aGUgZGlzcGF0Y2guXG4gICAgICAgICAgICAvLyBVbnRpbCB0aGVuLCBsZXQgdGhpcyBjb2RlIHNlcnZlIGFzIGEgd2FybmluZyBmcm9tIGhpc3RvcnkuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcnBzLnJvb21QYW5lbFBoYXNlUGFyYW1zLm1lbWJlciAmJlxuICAgICAgICAgICAgICAgIHVzZXJGb3JQYW5lbC51c2VySWQgPT09IHJwcy5yb29tUGFuZWxQaGFzZVBhcmFtcy5tZW1iZXIudXNlcklkICYmXG4gICAgICAgICAgICAgICAgcnBzLnJvb21QYW5lbFBoYXNlUGFyYW1zLnZlcmlmaWNhdGlvblJlcXVlc3RcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBycHMucm9vbVBhbmVsUGhhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVySW5mbztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBycHMucm9vbVBhbmVsUGhhc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgICAgICBjb25zdCBjbGkgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNsaS5vbihcIlJvb21TdGF0ZS5tZW1iZXJzXCIsIHRoaXMub25Sb29tU3RhdGVNZW1iZXIpO1xuICAgICAgICB0aGlzLl9pbml0R3JvdXBTdG9yZSh0aGlzLnByb3BzLmdyb3VwSWQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJSb29tU3RhdGUubWVtYmVyc1wiLCB0aGlzLm9uUm9vbVN0YXRlTWVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91bnJlZ2lzdGVyR3JvdXBTdG9yZSh0aGlzLnByb3BzLmdyb3VwSWQpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgaWYgKG5ld1Byb3BzLmdyb3VwSWQgIT09IHRoaXMucHJvcHMuZ3JvdXBJZCkge1xuICAgICAgICAgICAgdGhpcy5fdW5yZWdpc3Rlckdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICAgICAgICAgIHRoaXMuX2luaXRHcm91cFN0b3JlKG5ld1Byb3BzLmdyb3VwSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRHcm91cFN0b3JlKGdyb3VwSWQpIHtcbiAgICAgICAgaWYgKCFncm91cElkKSByZXR1cm47XG4gICAgICAgIEdyb3VwU3RvcmUucmVnaXN0ZXJMaXN0ZW5lcihncm91cElkLCB0aGlzLm9uR3JvdXBTdG9yZVVwZGF0ZWQpO1xuICAgIH1cblxuICAgIF91bnJlZ2lzdGVyR3JvdXBTdG9yZSgpIHtcbiAgICAgICAgR3JvdXBTdG9yZS51bnJlZ2lzdGVyTGlzdGVuZXIodGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBvbkdyb3VwU3RvcmVVcGRhdGVkKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzVXNlclByaXZpbGVnZWRJbkdyb3VwOiBHcm91cFN0b3JlLmlzVXNlclByaXZpbGVnZWQodGhpcy5wcm9wcy5ncm91cElkKSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25JbnZpdGVUb0dyb3VwQnV0dG9uQ2xpY2soKSB7XG4gICAgICAgIHNob3dHcm91cEludml0ZURpYWxvZyh0aGlzLnByb3BzLmdyb3VwSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuR3JvdXBNZW1iZXJMaXN0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uQWRkUm9vbVRvR3JvdXBCdXR0b25DbGljaygpIHtcbiAgICAgICAgc2hvd0dyb3VwQWRkUm9vbURpYWxvZyh0aGlzLnByb3BzLmdyb3VwSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblJvb21TdGF0ZU1lbWJlcihldiwgc3RhdGUsIG1lbWJlcikge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMucm9vbSB8fCBtZW1iZXIucm9vbUlkICE9PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkcmF3IHRoZSBiYWRnZSBvbiB0aGUgbWVtYmVyc2hpcCBsaXN0XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJMaXN0ICYmIG1lbWJlci5yb29tSWQgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlbGF5ZWRVcGRhdGUoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnBoYXNlID09PSBSaWdodFBhbmVsUGhhc2VzLlJvb21NZW1iZXJJbmZvICYmIG1lbWJlci5yb29tSWQgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQgJiZcbiAgICAgICAgICAgICAgICBtZW1iZXIudXNlcklkID09PSB0aGlzLnN0YXRlLm1lbWJlci51c2VySWQpIHtcbiAgICAgICAgICAgIC8vIHJlZnJlc2ggdGhlIG1lbWJlciBpbmZvIChlLmcuIG5ldyBwb3dlciBsZXZlbClcbiAgICAgICAgICAgIHRoaXMuX2RlbGF5ZWRVcGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQWN0aW9uKHBheWxvYWQpIHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBBY3Rpb24uQWZ0ZXJSaWdodFBhbmVsUGhhc2VDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBwYXlsb2FkLnBoYXNlLFxuICAgICAgICAgICAgICAgIGdyb3VwUm9vbUlkOiBwYXlsb2FkLmdyb3VwUm9vbUlkLFxuICAgICAgICAgICAgICAgIGdyb3VwSWQ6IHBheWxvYWQuZ3JvdXBJZCxcbiAgICAgICAgICAgICAgICBtZW1iZXI6IHBheWxvYWQubWVtYmVyLFxuICAgICAgICAgICAgICAgIGV2ZW50OiBwYXlsb2FkLmV2ZW50LFxuICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvblJlcXVlc3Q6IHBheWxvYWQudmVyaWZpY2F0aW9uUmVxdWVzdCxcbiAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25SZXF1ZXN0UHJvbWlzZTogcGF5bG9hZC52ZXJpZmljYXRpb25SZXF1ZXN0UHJvbWlzZSxcbiAgICAgICAgICAgICAgICB3aWRnZXRJZDogcGF5bG9hZC53aWRnZXRJZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25DbG9zZSA9ICgpID0+IHtcbiAgICAgICAgLy8gWFhYOiBUaGVyZSBhcmUgdGhyZWUgZGlmZmVyZW50IHdheXMgb2YgJ2Nsb3NpbmcnIHRoaXMgcGFuZWwgZGVwZW5kaW5nIG9uIHdoYXQgc3RhdGVcbiAgICAgICAgLy8gdGhpbmdzIGFyZSBpbi4uLiB0aGlzIGtub3dzIGZhciBtb3JlIHRoYW4gaXQgc2hvdWxkIGRvIGFib3V0IHRoZSBzdGF0ZSBvZiB0aGUgcmVzdFxuICAgICAgICAvLyBvZiB0aGUgYXBwIGFuZCBpcyBnZW5lcmFsbHkgYSBiaXQgc2lsbHkuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgYSB1c2VyIHByb3AgdGhlbiB3ZSdyZSBkaXNwbGF5aW5nIGEgdXNlciBmcm9tIHRoZSAndXNlcicgcGFnZSB0eXBlXG4gICAgICAgICAgICAvLyBpbiBMb2dnZWRJblZpZXcsIHNvIG5lZWQgdG8gY2hhbmdlIHRoZSBwYWdlIHR5cGUgdG8gY2xvc2UgdGhlIHBhbmVsICh3ZSBzd2l0Y2hcbiAgICAgICAgICAgIC8vIHRvIHRoZSBob21lIHBhZ2Ugd2hpY2ggaXMgbm90IG9idmlvdXNseSB0aGUgY29ycmVjdCB0aGluZyB0byBkbywgYnV0IEknbSBub3Qgc3VyZVxuICAgICAgICAgICAgLy8gYW55dGhpbmcgZWxzZSBpcyAtIHdlIGNvdWxkIGhpZGUgdGhlIGNsb3NlIGJ1dHRvbiBhbHRvZ2V0aGVyPylcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfaG9tZV9wYWdlXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucGhhc2UgPT09IFJpZ2h0UGFuZWxQaGFzZXMuRW5jcnlwdGlvblBhbmVsICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnZlcmlmaWNhdGlvblJlcXVlc3QgJiYgdGhpcy5zdGF0ZS52ZXJpZmljYXRpb25SZXF1ZXN0LnBlbmRpbmdcbiAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGNsaWNrcyBjbG9zZSBvbiB0aGUgZW5jcnlwdGlvbiBwYW5lbCBjYW5jZWwgdGhlIHBlbmRpbmcgcmVxdWVzdCBmaXJzdCBpZiBhbnlcbiAgICAgICAgICAgIHRoaXMuc3RhdGUudmVyaWZpY2F0aW9uUmVxdWVzdC5jYW5jZWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoZSBSaWdodFBhbmVsU3RvcmUgaGFzIG5vIHdheSBvZiBrbm93aW5nIHdoaWNoIG1vZGUgcm9vbS9ncm91cCBpdCBpcyBpbiwgc28gd2UgaGFuZGxlIGNsb3NpbmcgaGVyZVxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Ub2dnbGVSaWdodFBhbmVsLFxuICAgICAgICAgICAgICAgIHR5cGU6IHRoaXMucHJvcHMuZ3JvdXBJZCA/IFwiZ3JvdXBcIiA6IFwicm9vbVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBNZW1iZXJMaXN0ID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuTWVtYmVyTGlzdCcpO1xuICAgICAgICBjb25zdCBVc2VySW5mbyA9IHNkay5nZXRDb21wb25lbnQoJ3JpZ2h0X3BhbmVsLlVzZXJJbmZvJyk7XG4gICAgICAgIGNvbnN0IFRoaXJkUGFydHlNZW1iZXJJbmZvID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuVGhpcmRQYXJ0eU1lbWJlckluZm8nKTtcbiAgICAgICAgY29uc3QgTm90aWZpY2F0aW9uUGFuZWwgPSBzZGsuZ2V0Q29tcG9uZW50KCdzdHJ1Y3R1cmVzLk5vdGlmaWNhdGlvblBhbmVsJyk7XG4gICAgICAgIGNvbnN0IEZpbGVQYW5lbCA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuRmlsZVBhbmVsJyk7XG5cbiAgICAgICAgY29uc3QgR3JvdXBNZW1iZXJMaXN0ID0gc2RrLmdldENvbXBvbmVudCgnZ3JvdXBzLkdyb3VwTWVtYmVyTGlzdCcpO1xuICAgICAgICBjb25zdCBHcm91cFJvb21MaXN0ID0gc2RrLmdldENvbXBvbmVudCgnZ3JvdXBzLkdyb3VwUm9vbUxpc3QnKTtcbiAgICAgICAgY29uc3QgR3JvdXBSb29tSW5mbyA9IHNkay5nZXRDb21wb25lbnQoJ2dyb3Vwcy5Hcm91cFJvb21JbmZvJyk7XG5cbiAgICAgICAgbGV0IHBhbmVsID0gPGRpdiAvPjtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5yb29tID8gdGhpcy5wcm9wcy5yb29tLnJvb21JZCA6IHVuZGVmaW5lZDtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUucGhhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdDpcbiAgICAgICAgICAgICAgICBpZiAocm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhbmVsID0gPE1lbWJlckxpc3Qgcm9vbUlkPXtyb29tSWR9IGtleT17cm9vbUlkfSBvbkNsb3NlPXt0aGlzLm9uQ2xvc2V9IC8+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLkdyb3VwTWVtYmVyTGlzdDpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5ncm91cElkKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhbmVsID0gPEdyb3VwTWVtYmVyTGlzdCBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9IGtleT17dGhpcy5wcm9wcy5ncm91cElkfSAvPjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Hcm91cFJvb21MaXN0OlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPEdyb3VwUm9vbUxpc3QgZ3JvdXBJZD17dGhpcy5wcm9wcy5ncm91cElkfSBrZXk9e3RoaXMucHJvcHMuZ3JvdXBJZH0gLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVySW5mbzpcbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWw6XG4gICAgICAgICAgICAgICAgcGFuZWwgPSA8VXNlckluZm9cbiAgICAgICAgICAgICAgICAgICAgdXNlcj17dGhpcy5zdGF0ZS5tZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAga2V5PXtyb29tSWQgfHwgdGhpcy5zdGF0ZS5tZW1iZXIudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2V9XG4gICAgICAgICAgICAgICAgICAgIHBoYXNlPXt0aGlzLnN0YXRlLnBoYXNlfVxuICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25SZXF1ZXN0PXt0aGlzLnN0YXRlLnZlcmlmaWNhdGlvblJlcXVlc3R9XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvblJlcXVlc3RQcm9taXNlPXt0aGlzLnN0YXRlLnZlcmlmaWNhdGlvblJlcXVlc3RQcm9taXNlfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJpZ2h0UGFuZWxQaGFzZXMuUm9vbTNwaWRNZW1iZXJJbmZvOlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPFRoaXJkUGFydHlNZW1iZXJJbmZvIGV2ZW50PXt0aGlzLnN0YXRlLmV2ZW50fSBrZXk9e3Jvb21JZH0gLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Hcm91cE1lbWJlckluZm86XG4gICAgICAgICAgICAgICAgcGFuZWwgPSA8VXNlckluZm9cbiAgICAgICAgICAgICAgICAgICAgdXNlcj17dGhpcy5zdGF0ZS5tZW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICAgICAga2V5PXt0aGlzLnN0YXRlLm1lbWJlci51c2VySWR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9e3RoaXMub25DbG9zZX0gLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5Hcm91cFJvb21JbmZvOlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPEdyb3VwUm9vbUluZm9cbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBSb29tSWQ9e3RoaXMuc3RhdGUuZ3JvdXBSb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICAgICAga2V5PXt0aGlzLnN0YXRlLmdyb3VwUm9vbUlkfSAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLk5vdGlmaWNhdGlvblBhbmVsOlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPE5vdGlmaWNhdGlvblBhbmVsIG9uQ2xvc2U9e3RoaXMub25DbG9zZX0gLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5GaWxlUGFuZWw6XG4gICAgICAgICAgICAgICAgcGFuZWwgPSA8RmlsZVBhbmVsIHJvb21JZD17cm9vbUlkfSByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn0gb25DbG9zZT17dGhpcy5vbkNsb3NlfSAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBSaWdodFBhbmVsUGhhc2VzLlJvb21TdW1tYXJ5OlxuICAgICAgICAgICAgICAgIHBhbmVsID0gPFJvb21TdW1tYXJ5Q2FyZCByb29tPXt0aGlzLnByb3BzLnJvb219IG9uQ2xvc2U9e3RoaXMub25DbG9zZX0gLz47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgUmlnaHRQYW5lbFBoYXNlcy5XaWRnZXQ6XG4gICAgICAgICAgICAgICAgcGFuZWwgPSA8V2lkZ2V0Q2FyZCByb29tPXt0aGlzLnByb3BzLnJvb219IHdpZGdldElkPXt0aGlzLnN0YXRlLndpZGdldElkfSBvbkNsb3NlPXt0aGlzLm9uQ2xvc2V9IC8+O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJteF9SaWdodFBhbmVsIGRhcmstcGFuZWxcIiBpZD1cIm14X1JpZ2h0UGFuZWxcIj5cbiAgICAgICAgICAgICAgICB7IHBhbmVsIH1cbiAgICAgICAgICAgIDwvYXNpZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19