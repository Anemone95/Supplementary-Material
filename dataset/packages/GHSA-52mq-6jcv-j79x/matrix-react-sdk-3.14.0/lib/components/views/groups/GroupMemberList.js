"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _GroupAddressPicker = require("../../../GroupAddressPicker");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _RightPanelStorePhases = require("../../../stores/RightPanelStorePhases");

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _actions = require("../../../dispatcher/actions");

/*
Copyright 2017 Vector Creations Ltd.
Copyright 2017 New Vector Ltd.
Copyright 2019 The Matrix.org Foundation C.I.C.

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
const INITIAL_LOAD_NUM_MEMBERS = 30;

class GroupMemberList extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      members: null,
      membersError: null,
      invitedMembers: null,
      invitedMembersError: null,
      truncateAt: INITIAL_LOAD_NUM_MEMBERS
    });
    (0, _defineProperty2.default)(this, "_createOverflowTile", (overflowCount, totalCount) => {
      // For now we'll pretend this is any entity. It should probably be a separate tile.
      const EntityTile = sdk.getComponent("rooms.EntityTile");
      const BaseAvatar = sdk.getComponent("avatars.BaseAvatar");
      const text = (0, _languageHandler._t)("and %(count)s others...", {
        count: overflowCount
      });
      return /*#__PURE__*/_react.default.createElement(EntityTile, {
        className: "mx_EntityTile_ellipsis",
        avatarJsx: /*#__PURE__*/_react.default.createElement(BaseAvatar, {
          url: require("../../../../res/img/ellipsis.svg"),
          name: "...",
          width: 36,
          height: 36
        }),
        name: text,
        presenceState: "online",
        suppressOnHover: true,
        onClick: this._showFullMemberList
      });
    });
    (0, _defineProperty2.default)(this, "_showFullMemberList", () => {
      this.setState({
        truncateAt: -1
      });
    });
    (0, _defineProperty2.default)(this, "onSearchQueryChanged", ev => {
      this.setState({
        searchQuery: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onInviteToGroupButtonClick", () => {
      (0, _GroupAddressPicker.showGroupInviteDialog)(this.props.groupId).then(() => {
        _dispatcher.default.dispatch({
          action: _actions.Action.SetRightPanelPhase,
          phase: _RightPanelStorePhases.RightPanelPhases.GroupMemberList,
          refireParams: {
            groupId: this.props.groupId
          }
        });
      });
    });
  }

  componentDidMount() {
    this._unmounted = false;

    this._initGroupStore(this.props.groupId);
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _initGroupStore(groupId) {
    _GroupStore.default.registerListener(groupId, () => {
      this._fetchMembers();
    });

    _GroupStore.default.on('error', (err, errorGroupId, stateKey) => {
      if (this._unmounted || groupId !== errorGroupId) return;

      if (stateKey === _GroupStore.default.STATE_KEY.GroupMembers) {
        this.setState({
          membersError: err
        });
      }

      if (stateKey === _GroupStore.default.STATE_KEY.GroupInvitedMembers) {
        this.setState({
          invitedMembersError: err
        });
      }
    });
  }

  _fetchMembers() {
    if (this._unmounted) return;
    this.setState({
      members: _GroupStore.default.getGroupMembers(this.props.groupId),
      invitedMembers: _GroupStore.default.getGroupInvitedMembers(this.props.groupId)
    });
  }

  makeGroupMemberTiles(query, memberList, memberListError) {
    if (memberListError) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "warning"
      }, (0, _languageHandler._t)("Failed to load group members"));
    }

    const GroupMemberTile = sdk.getComponent("groups.GroupMemberTile");
    const TruncatedList = sdk.getComponent("elements.TruncatedList");
    query = (query || "").toLowerCase();

    if (query) {
      memberList = memberList.filter(m => {
        const matchesName = (m.displayname || "").toLowerCase().includes(query);
        const matchesId = m.userId.toLowerCase().includes(query);

        if (!matchesName && !matchesId) {
          return false;
        }

        return true;
      });
    }

    const uniqueMembers = {};
    memberList.forEach(m => {
      if (!uniqueMembers[m.userId]) uniqueMembers[m.userId] = m;
    });
    memberList = Object.keys(uniqueMembers).map(userId => uniqueMembers[userId]); // Descending sort on isPrivileged = true = 1 to isPrivileged = false = 0

    memberList.sort((a, b) => {
      if (a.isPrivileged === b.isPrivileged) {
        const aName = a.displayname || a.userId;
        const bName = b.displayname || b.userId;

        if (aName < bName) {
          return -1;
        } else if (aName > bName) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return a.isPrivileged ? -1 : 1;
      }
    });
    const memberTiles = memberList.map(m => {
      return /*#__PURE__*/_react.default.createElement(GroupMemberTile, {
        key: m.userId,
        groupId: this.props.groupId,
        member: m
      });
    });
    return /*#__PURE__*/_react.default.createElement(TruncatedList, {
      className: "mx_MemberList_wrapper",
      truncateAt: this.state.truncateAt,
      createOverflowElement: this._createOverflowTile
    }, memberTiles);
  }

  render() {
    if (this.state.fetching || this.state.fetchingInvitedMembers) {
      const Spinner = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MemberList"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null));
    }

    const inputBox = /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_GroupMemberList_query mx_textinput",
      id: "mx_GroupMemberList_query",
      type: "text",
      onChange: this.onSearchQueryChanged,
      value: this.state.searchQuery,
      placeholder: (0, _languageHandler._t)('Filter community members'),
      autoComplete: "off"
    });

    const joined = this.state.members ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberList_joined"
    }, this.makeGroupMemberTiles(this.state.searchQuery, this.state.members, this.state.membersError)) : /*#__PURE__*/_react.default.createElement("div", null);
    const invited = this.state.invitedMembers && this.state.invitedMembers.length > 0 ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberList_invited"
    }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Invited")), this.makeGroupMemberTiles(this.state.searchQuery, this.state.invitedMembers, this.state.invitedMembersError)) : /*#__PURE__*/_react.default.createElement("div", null);
    let inviteButton;

    if (_GroupStore.default.isUserPrivileged(this.props.groupId)) {
      inviteButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_MemberList_invite mx_MemberList_inviteCommunity",
        onClick: this.onInviteToGroupButtonClick
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)('Invite to this community')));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberList",
      role: "tabpanel"
    }, inviteButton, /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, null, joined, invited), inputBox);
  }

}

exports.default = GroupMemberList;
(0, _defineProperty2.default)(GroupMemberList, "propTypes", {
  groupId: _propTypes.default.string.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2dyb3Vwcy9Hcm91cE1lbWJlckxpc3QuanMiXSwibmFtZXMiOlsiSU5JVElBTF9MT0FEX05VTV9NRU1CRVJTIiwiR3JvdXBNZW1iZXJMaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJtZW1iZXJzIiwibWVtYmVyc0Vycm9yIiwiaW52aXRlZE1lbWJlcnMiLCJpbnZpdGVkTWVtYmVyc0Vycm9yIiwidHJ1bmNhdGVBdCIsIm92ZXJmbG93Q291bnQiLCJ0b3RhbENvdW50IiwiRW50aXR5VGlsZSIsInNkayIsImdldENvbXBvbmVudCIsIkJhc2VBdmF0YXIiLCJ0ZXh0IiwiY291bnQiLCJyZXF1aXJlIiwiX3Nob3dGdWxsTWVtYmVyTGlzdCIsInNldFN0YXRlIiwiZXYiLCJzZWFyY2hRdWVyeSIsInRhcmdldCIsInZhbHVlIiwicHJvcHMiLCJncm91cElkIiwidGhlbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiU2V0UmlnaHRQYW5lbFBoYXNlIiwicGhhc2UiLCJSaWdodFBhbmVsUGhhc2VzIiwicmVmaXJlUGFyYW1zIiwiY29tcG9uZW50RGlkTW91bnQiLCJfdW5tb3VudGVkIiwiX2luaXRHcm91cFN0b3JlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJHcm91cFN0b3JlIiwicmVnaXN0ZXJMaXN0ZW5lciIsIl9mZXRjaE1lbWJlcnMiLCJvbiIsImVyciIsImVycm9yR3JvdXBJZCIsInN0YXRlS2V5IiwiU1RBVEVfS0VZIiwiR3JvdXBNZW1iZXJzIiwiR3JvdXBJbnZpdGVkTWVtYmVycyIsImdldEdyb3VwTWVtYmVycyIsImdldEdyb3VwSW52aXRlZE1lbWJlcnMiLCJtYWtlR3JvdXBNZW1iZXJUaWxlcyIsInF1ZXJ5IiwibWVtYmVyTGlzdCIsIm1lbWJlckxpc3RFcnJvciIsIkdyb3VwTWVtYmVyVGlsZSIsIlRydW5jYXRlZExpc3QiLCJ0b0xvd2VyQ2FzZSIsImZpbHRlciIsIm0iLCJtYXRjaGVzTmFtZSIsImRpc3BsYXluYW1lIiwiaW5jbHVkZXMiLCJtYXRjaGVzSWQiLCJ1c2VySWQiLCJ1bmlxdWVNZW1iZXJzIiwiZm9yRWFjaCIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJzb3J0IiwiYSIsImIiLCJpc1ByaXZpbGVnZWQiLCJhTmFtZSIsImJOYW1lIiwibWVtYmVyVGlsZXMiLCJzdGF0ZSIsIl9jcmVhdGVPdmVyZmxvd1RpbGUiLCJyZW5kZXIiLCJmZXRjaGluZyIsImZldGNoaW5nSW52aXRlZE1lbWJlcnMiLCJTcGlubmVyIiwiaW5wdXRCb3giLCJvblNlYXJjaFF1ZXJ5Q2hhbmdlZCIsImpvaW5lZCIsImludml0ZWQiLCJsZW5ndGgiLCJpbnZpdGVCdXR0b24iLCJpc1VzZXJQcml2aWxlZ2VkIiwib25JbnZpdGVUb0dyb3VwQnV0dG9uQ2xpY2siLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUEsTUFBTUEsd0JBQXdCLEdBQUcsRUFBakM7O0FBRWUsTUFBTUMsZUFBTixTQUE4QkMsZUFBTUMsU0FBcEMsQ0FBOEM7QUFBQTtBQUFBO0FBQUEsaURBS2pEO0FBQ0pDLE1BQUFBLE9BQU8sRUFBRSxJQURMO0FBRUpDLE1BQUFBLFlBQVksRUFBRSxJQUZWO0FBR0pDLE1BQUFBLGNBQWMsRUFBRSxJQUhaO0FBSUpDLE1BQUFBLG1CQUFtQixFQUFFLElBSmpCO0FBS0pDLE1BQUFBLFVBQVUsRUFBRVI7QUFMUixLQUxpRDtBQUFBLCtEQWlEbkMsQ0FBQ1MsYUFBRCxFQUFnQkMsVUFBaEIsS0FBK0I7QUFDakQ7QUFDQSxZQUFNQyxVQUFVLEdB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QUFtQyxDQUFqRSxnQkFDWjtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0kseUNBQUsseUJBQUcsU0FBSCxDQUFMLENBREosRUFHUSxLQUFLcEMsb0JBQUwsQ0FDSSxLQUFLMEIsS0FBTCxDQUFXeEQsV0FEZixFQUVJLEtBQUt3RCxLQUFMLENBQVd2RSxjQUZmLEVBR0ksS0FBS3VFLEtBQUwsQ0FBV3RFLG1CQUhmLENBSFIsQ0FEWSxnQkFVSCx5Q0FWYjtBQVlBLFFBQUlpRixZQUFKOztBQUNBLFFBQUlqRCxvQkFBV2tELGdCQUFYLENBQTRCLEtBQUtqRSxLQUFMLENBQVdDLE9BQXZDLENBQUosRUFBcUQ7QUFDakQrRCxNQUFBQSxZQUFZLGdCQUNSLDZCQUFDLHlCQUFEO0FBQ0ksUUFBQSxTQUFTLEVBQUMsb0RBRGQ7QUFFSSxRQUFBLE9BQU8sRUFBRSxLQUFLRTtBQUZsQixzQkFJSSwyQ0FBUSx5QkFBRywwQkFBSCxDQUFSLENBSkosQ0FESjtBQVFIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUMsZUFBZjtBQUErQixNQUFBLElBQUksRUFBQztBQUFwQyxPQUNNRixZQUROLGVBRUksNkJBQUMsMEJBQUQsUUFDTUgsTUFETixFQUVNQyxPQUZOLENBRkosRUFNTUgsUUFOTixDQURKO0FBVUg7O0FBcE13RDs7OzhCQUF4Q2xGLGUsZUFDRTtBQUNmd0IsRUFBQUEsT0FBTyxFQUFFa0UsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRFgsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZC5cbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkLlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvR3JvdXBTdG9yZSc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgc2hvd0dyb3VwSW52aXRlRGlhbG9nIH0gZnJvbSAnLi4vLi4vLi4vR3JvdXBBZGRyZXNzUGlja2VyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHtSaWdodFBhbmVsUGhhc2VzfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1JpZ2h0UGFuZWxTdG9yZVBoYXNlc1wiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuXG5jb25zdCBJTklUSUFMX0xPQURfTlVNX01FTUJFUlMgPSAzMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JvdXBNZW1iZXJMaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBncm91cElkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBtZW1iZXJzOiBudWxsLFxuICAgICAgICBtZW1iZXJzRXJyb3I6IG51bGwsXG4gICAgICAgIGludml0ZWRNZW1iZXJzOiBudWxsLFxuICAgICAgICBpbnZpdGVkTWVtYmVyc0Vycm9yOiBudWxsLFxuICAgICAgICB0cnVuY2F0ZUF0OiBJTklUSUFMX0xPQURfTlVNX01FTUJFUlMsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faW5pdEdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBfaW5pdEdyb3VwU3RvcmUoZ3JvdXBJZCkge1xuICAgICAgICBHcm91cFN0b3JlLnJlZ2lzdGVyTGlzdGVuZXIoZ3JvdXBJZCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZmV0Y2hNZW1iZXJzKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBHcm91cFN0b3JlLm9uKCdlcnJvcicsIChlcnIsIGVycm9yR3JvdXBJZCwgc3RhdGVLZXkpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQgfHwgZ3JvdXBJZCAhPT0gZXJyb3JHcm91cElkKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoc3RhdGVLZXkgPT09IEdyb3VwU3RvcmUuU1RBVEVfS0VZLkdyb3VwTWVtYmVycykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBtZW1iZXJzRXJyb3I6IGVycixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGF0ZUtleSA9PT0gR3JvdXBTdG9yZS5TVEFURV9LRVkuR3JvdXBJbnZpdGVkTWVtYmVycykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpbnZpdGVkTWVtYmVyc0Vycm9yOiBlcnIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9mZXRjaE1lbWJlcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBtZW1iZXJzOiBHcm91cFN0b3JlLmdldEdyb3VwTWVtYmVycyh0aGlzLnByb3BzLmdyb3VwSWQpLFxuICAgICAgICAgICAgaW52aXRlZE1lbWJlcnM6IEdyb3VwU3RvcmUuZ2V0R3JvdXBJbnZpdGVkTWVtYmVycyh0aGlzLnByb3BzLmdyb3VwSWQpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY3JlYXRlT3ZlcmZsb3dUaWxlID0gKG92ZXJmbG93Q291bnQsIHRvdGFsQ291bnQpID0+IHtcbiAgICAgICAgLy8gRm9yIG5vdyB3ZSdsbCBwcmV0ZW5kIHRoaXMgaXMgYW55IGVudGl0eS4gSXQgc2hvdWxkIHByb2JhYmx5IGJlIGEgc2VwYXJhdGUgdGlsZS5cbiAgICAgICAgY29uc3QgRW50aXR5VGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJyb29tcy5FbnRpdHlUaWxlXCIpO1xuICAgICAgICBjb25zdCBCYXNlQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcImF2YXRhcnMuQmFzZUF2YXRhclwiKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IF90KFwiYW5kICUoY291bnQpcyBvdGhlcnMuLi5cIiwgeyBjb3VudDogb3ZlcmZsb3dDb3VudCB9KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxFbnRpdHlUaWxlIGNsYXNzTmFtZT1cIm14X0VudGl0eVRpbGVfZWxsaXBzaXNcIiBhdmF0YXJKc3g9e1xuICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyIHVybD17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxsaXBzaXMuc3ZnXCIpfSBuYW1lPVwiLi4uXCIgd2lkdGg9ezM2fSBoZWlnaHQ9ezM2fSAvPlxuICAgICAgICAgICAgfSBuYW1lPXt0ZXh0fSBwcmVzZW5jZVN0YXRlPVwib25saW5lXCIgc3VwcHJlc3NPbkhvdmVyPXt0cnVlfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fc2hvd0Z1bGxNZW1iZXJMaXN0fSAvPlxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfc2hvd0Z1bGxNZW1iZXJMaXN0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRydW5jYXRlQXQ6IC0xLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25TZWFyY2hRdWVyeUNoYW5nZWQgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWFyY2hRdWVyeTogZXYudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICBtYWtlR3JvdXBNZW1iZXJUaWxlcyhxdWVyeSwgbWVtYmVyTGlzdCwgbWVtYmVyTGlzdEVycm9yKSB7XG4gICAgICAgIGlmIChtZW1iZXJMaXN0RXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIndhcm5pbmdcIj57IF90KFwiRmFpbGVkIHRvIGxvYWQgZ3JvdXAgbWVtYmVyc1wiKSB9PC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgR3JvdXBNZW1iZXJUaWxlID0gc2RrLmdldENvbXBvbmVudChcImdyb3Vwcy5Hcm91cE1lbWJlclRpbGVcIik7XG4gICAgICAgIGNvbnN0IFRydW5jYXRlZExpc3QgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVHJ1bmNhdGVkTGlzdFwiKTtcbiAgICAgICAgcXVlcnkgPSAocXVlcnkgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICBtZW1iZXJMaXN0ID0gbWVtYmVyTGlzdC5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzTmFtZSA9IChtLmRpc3BsYXluYW1lIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNJZCA9IG0udXNlcklkLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVzTmFtZSAmJiAhbWF0Y2hlc0lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdW5pcXVlTWVtYmVycyA9IHt9O1xuICAgICAgICBtZW1iZXJMaXN0LmZvckVhY2goKG0pID0+IHtcbiAgICAgICAgICAgIGlmICghdW5pcXVlTWVtYmVyc1ttLnVzZXJJZF0pIHVuaXF1ZU1lbWJlcnNbbS51c2VySWRdID0gbTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1lbWJlckxpc3QgPSBPYmplY3Qua2V5cyh1bmlxdWVNZW1iZXJzKS5tYXAoKHVzZXJJZCkgPT4gdW5pcXVlTWVtYmVyc1t1c2VySWRdKTtcbiAgICAgICAgLy8gRGVzY2VuZGluZyBzb3J0IG9uIGlzUHJpdmlsZWdlZCA9IHRydWUgPSAxIHRvIGlzUHJpdmlsZWdlZCA9IGZhbHNlID0gMFxuICAgICAgICBtZW1iZXJMaXN0LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhLmlzUHJpdmlsZWdlZCA9PT0gYi5pc1ByaXZpbGVnZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhTmFtZSA9IGEuZGlzcGxheW5hbWUgfHwgYS51c2VySWQ7XG4gICAgICAgICAgICAgICAgY29uc3QgYk5hbWUgPSBiLmRpc3BsYXluYW1lIHx8IGIudXNlcklkO1xuICAgICAgICAgICAgICAgIGlmIChhTmFtZSA8IGJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFOYW1lID4gYk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pc1ByaXZpbGVnZWQgPyAtMSA6IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG1lbWJlclRpbGVzID0gbWVtYmVyTGlzdC5tYXAoKG0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPEdyb3VwTWVtYmVyVGlsZSBrZXk9e20udXNlcklkfSBncm91cElkPXt0aGlzLnByb3BzLmdyb3VwSWR9IG1lbWJlcj17bX0gLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8VHJ1bmNhdGVkTGlzdCBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X3dyYXBwZXJcIiB0cnVuY2F0ZUF0PXt0aGlzLnN0YXRlLnRydW5jYXRlQXR9XG4gICAgICAgICAgICBjcmVhdGVPdmVyZmxvd0VsZW1lbnQ9e3RoaXMuX2NyZWF0ZU92ZXJmbG93VGlsZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBtZW1iZXJUaWxlcyB9XG4gICAgICAgIDwvVHJ1bmNhdGVkTGlzdD47XG4gICAgfVxuXG4gICAgb25JbnZpdGVUb0dyb3VwQnV0dG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHNob3dHcm91cEludml0ZURpYWxvZyh0aGlzLnByb3BzLmdyb3VwSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuR3JvdXBNZW1iZXJMaXN0LFxuICAgICAgICAgICAgICAgIHJlZmlyZVBhcmFtczogeyBncm91cElkOiB0aGlzLnByb3BzLmdyb3VwSWQgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5mZXRjaGluZyB8fCB0aGlzLnN0YXRlLmZldGNoaW5nSW52aXRlZE1lbWJlcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0XCI+XG4gICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgIDwvZGl2Pik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnB1dEJveCA9IChcbiAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJteF9Hcm91cE1lbWJlckxpc3RfcXVlcnkgbXhfdGV4dGlucHV0XCIgaWQ9XCJteF9Hcm91cE1lbWJlckxpc3RfcXVlcnlcIiB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uU2VhcmNoUXVlcnlDaGFuZ2VkfSB2YWx1ZT17dGhpcy5zdGF0ZS5zZWFyY2hRdWVyeX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KCdGaWx0ZXIgY29tbXVuaXR5IG1lbWJlcnMnKX0gYXV0b0NvbXBsZXRlPVwib2ZmXCIgLz5cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBqb2luZWQgPSB0aGlzLnN0YXRlLm1lbWJlcnMgPyA8ZGl2IGNsYXNzTmFtZT1cIm14X01lbWJlckxpc3Rfam9pbmVkXCI+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYWtlR3JvdXBNZW1iZXJUaWxlcyhcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5zZWFyY2hRdWVyeSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tZW1iZXJzLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1lbWJlcnNFcnJvcixcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgIDwvZGl2PiA6IDxkaXYgLz47XG5cbiAgICAgICAgY29uc3QgaW52aXRlZCA9ICh0aGlzLnN0YXRlLmludml0ZWRNZW1iZXJzICYmIHRoaXMuc3RhdGUuaW52aXRlZE1lbWJlcnMubGVuZ3RoID4gMCkgP1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X2ludml0ZWRcIj5cbiAgICAgICAgICAgICAgICA8aDI+e190KFwiSW52aXRlZFwiKX08L2gyPlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWtlR3JvdXBNZW1iZXJUaWxlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuc2VhcmNoUXVlcnksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmludml0ZWRNZW1iZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5pbnZpdGVkTWVtYmVyc0Vycm9yLFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9kaXY+IDogPGRpdiAvPjtcblxuICAgICAgICBsZXQgaW52aXRlQnV0dG9uO1xuICAgICAgICBpZiAoR3JvdXBTdG9yZS5pc1VzZXJQcml2aWxlZ2VkKHRoaXMucHJvcHMuZ3JvdXBJZCkpIHtcbiAgICAgICAgICAgIGludml0ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X2ludml0ZSBteF9NZW1iZXJMaXN0X2ludml0ZUNvbW11bml0eVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25JbnZpdGVUb0dyb3VwQnV0dG9uQ2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57IF90KCdJbnZpdGUgdG8gdGhpcyBjb21tdW5pdHknKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0XCIgcm9sZT1cInRhYnBhbmVsXCI+XG4gICAgICAgICAgICAgICAgeyBpbnZpdGVCdXR0b24gfVxuICAgICAgICAgICAgICAgIDxBdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgICAgICAgICAgeyBqb2luZWQgfVxuICAgICAgICAgICAgICAgICAgICB7IGludml0ZWQgfVxuICAgICAgICAgICAgICAgIDwvQXV0b0hpZGVTY3JvbGxiYXI+XG4gICAgICAgICAgICAgICAgeyBpbnB1dEJveCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=