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

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _GroupAddressPicker = require("../../../GroupAddressPicker");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

/*
Copyright 2017 New Vector Ltd.

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
const INITIAL_LOAD_NUM_ROOMS = 30;

class GroupRoomList extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      rooms: null,
      truncateAt: INITIAL_LOAD_NUM_ROOMS,
      searchQuery: ""
    });
    (0, _defineProperty2.default)(this, "onGroupStoreUpdated", () => {
      if (this._unmounted) return;
      this.setState({
        rooms: _GroupStore.default.getGroupRooms(this.props.groupId)
      });
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
        onClick: this._showFullRoomList
      });
    });
    (0, _defineProperty2.default)(this, "_showFullRoomList", () => {
      this.setState({
        truncateAt: -1
      });
    });
    (0, _defineProperty2.default)(this, "onSearchQueryChanged", ev => {
      this.setState({
        searchQuery: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onAddRoomToGroupButtonClick", () => {
      (0, _GroupAddressPicker.showGroupAddRoomDialog)(this.props.groupId).then(() => {
        this.forceUpdate();
      });
    });
  }

  componentDidMount() {
    this._unmounted = false;

    this._initGroupStore(this.props.groupId);
  }

  componentWillUnmount() {
    this._unmounted = true;

    this._unregisterGroupStore();
  }

  _unregisterGroupStore() {
    _GroupStore.default.unregisterListener(this.onGroupStoreUpdated);
  }

  _initGroupStore(groupId) {
    _GroupStore.default.registerListener(groupId, this.onGroupStoreUpdated); // XXX: This should be more fluxy - let's get the error from GroupStore .getError or something
    // XXX: This is also leaked - we should remove it when unmounting


    _GroupStore.default.on('error', (err, errorGroupId) => {
      if (errorGroupId !== groupId) return;
      this.setState({
        rooms: null
      });
    });
  }

  makeGroupRoomTiles(query) {
    const GroupRoomTile = sdk.getComponent("groups.GroupRoomTile");
    query = (query || "").toLowerCase();
    let roomList = this.state.rooms;

    if (query) {
      roomList = roomList.filter(room => {
        const matchesName = (room.name || "").toLowerCase().includes(query);
        const matchesAlias = (room.canonicalAlias || "").toLowerCase().includes(query);
        return matchesName || matchesAlias;
      });
    }

    roomList = roomList.map((groupRoom, index) => {
      return /*#__PURE__*/_react.default.createElement(GroupRoomTile, {
        key: index,
        groupId: this.props.groupId,
        groupRoom: groupRoom
      });
    });
    return roomList;
  }

  render() {
    if (this.state.rooms === null) {
      return null;
    }

    let inviteButton;

    if (_GroupStore.default.isUserPrivileged(this.props.groupId)) {
      inviteButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_MemberList_invite mx_MemberList_addRoomToCommunity",
        onClick: this.onAddRoomToGroupButtonClick
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)('Add rooms to this community')));
    }

    const inputBox = /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_GroupRoomList_query mx_textinput",
      id: "mx_GroupRoomList_query",
      type: "text",
      onChange: this.onSearchQueryChanged,
      value: this.state.searchQuery,
      placeholder: (0, _languageHandler._t)('Filter community rooms'),
      autoComplete: "off"
    });

    const TruncatedList = sdk.getComponent("elements.TruncatedList");
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GroupRoomList",
      role: "tabpanel"
    }, inviteButton, /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
      className: "mx_GroupRoomList_joined mx_GroupRoomList_outerWrapper"
    }, /*#__PURE__*/_react.default.createElement(TruncatedList, {
      className: "mx_GroupRoomList_wrapper",
      truncateAt: this.state.truncateAt,
      createOverflowElement: this._createOverflowTile
    }, this.makeGroupRoomTiles(this.state.searchQuery))), inputBox);
  }

}

exports.default = GroupRoomList;
(0, _defineProperty2.default)(GroupRoomList, "propTypes", {
  groupId: _propTypes.default.string.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2dyb3Vwcy9Hcm91cFJvb21MaXN0LmpzIl0sIm5hbWVzIjpbIklOSVRJQUxfTE9BRF9OVU1fUk9PTVMiLCJHcm91cFJvb21MaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJyb29tcyIsInRydW5jYXRlQXQiLCJzZWFyY2hRdWVyeSIsIl91bm1vdW50ZWQiLCJzZXRTdGF0ZSIsIkdyb3VwU3RvcmUiLCJnZXRHcm91cFJvb21zIiwicHJvcHMiLCJncm91cElkIiwib3ZlcmZsb3dDb3VudCIsInRvdGFsQ291bnQiLCJFbnRpdHlUaWxlIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiQmFzZUF2YXRhciIsInRleHQiLCJjb3VudCIsInJlcXVpcmUiLCJfc2hvd0Z1bGxSb29tTGlzdCIsImV2IiwidGFyZ2V0IiwidmFsdWUiLCJ0aGVuIiwiZm9yY2VVcGRhdGUiLCJjb21wb25lbnREaWRNb3VudCIsIl9pbml0R3JvdXBTdG9yZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiX3VucmVnaXN0ZXJHcm91cFN0b3JlIiwidW5yZWdpc3Rlckxpc3RlbmVyIiwib25Hcm91cFN0b3JlVXBkYXRlZCIsInJlZ2lzdGVyTGlzdGVuZXIiLCJvbiIsImVyciIsImVycm9yR3JvdXBJZCIsIm1ha2VHcm91cFJvb21UaWxlcyIsInF1ZXJ5IiwiR3JvdXBSb29tVGlsZSIsInRvTG93ZXJDYXNlIiwicm9vbUxpc3QiLCJzdGF0ZSIsImZpbHRlciIsInJvb20iLCJtYXRjaGVzTmFtZSIsIm5hbWUiLCJpbmNsdWRlcyIsIm1hdGNoZXNBbGlhcyIsImNhbm9uaWNhbEFsaWFzIiwibWFwIiwiZ3JvdXBSb29tIiwiaW5kZXgiLCJyZW5kZXIiLCJpbnZpdGVCdXR0b24iLCJpc1VzZXJQcml2aWxlZ2VkIiwib25BZGRSb29tVG9Hcm91cEJ1dHRvbkNsaWNrIiwiaW5wdXRCb3giLCJvblNlYXJjaFF1ZXJ5Q2hhbmdlZCIsIlRydW5jYXRlZExp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TUFBQSxxQkFBcUIsRUFBRSxLQUFLd0Q7QUFEcEMsT0FFTSxLQUFLdkIsa0JBQUwsQ0FBd0IsS0FBS0ssS0FBTCxDQUFXckMsV0FBbkMsQ0FGTixDQURKLENBRkosRUFRTW9ELFFBUk4sQ0FESjtBQVlIOztBQXJJc0Q7Ozs4QkFBdEN6RCxhLGVBQ0U7QUFDZlcsRUFBQUEsT0FBTyxFQUFFa0QsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRFgsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvR3JvdXBTdG9yZSc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgc2hvd0dyb3VwQWRkUm9vbURpYWxvZyB9IGZyb20gJy4uLy4uLy4uL0dyb3VwQWRkcmVzc1BpY2tlcic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBBdXRvSGlkZVNjcm9sbGJhciBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9BdXRvSGlkZVNjcm9sbGJhclwiO1xuXG5jb25zdCBJTklUSUFMX0xPQURfTlVNX1JPT01TID0gMzA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwUm9vbUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHJvb21zOiBudWxsLFxuICAgICAgICB0cnVuY2F0ZUF0OiBJTklUSUFMX0xPQURfTlVNX1JPT01TLFxuICAgICAgICBzZWFyY2hRdWVyeTogXCJcIixcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbml0R3JvdXBTdG9yZSh0aGlzLnByb3BzLmdyb3VwSWQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl91bnJlZ2lzdGVyR3JvdXBTdG9yZSgpO1xuICAgIH1cblxuICAgIF91bnJlZ2lzdGVyR3JvdXBTdG9yZSgpIHtcbiAgICAgICAgR3JvdXBTdG9yZS51bnJlZ2lzdGVyTGlzdGVuZXIodGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBfaW5pdEdyb3VwU3RvcmUoZ3JvdXBJZCkge1xuICAgICAgICBHcm91cFN0b3JlLnJlZ2lzdGVyTGlzdGVuZXIoZ3JvdXBJZCwgdGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICAgICAgLy8gWFhYOiBUaGlzIHNob3VsZCBiZSBtb3JlIGZsdXh5IC0gbGV0J3MgZ2V0IHRoZSBlcnJvciBmcm9tIEdyb3VwU3RvcmUgLmdldEVycm9yIG9yIHNvbWV0aGluZ1xuICAgICAgICAvLyBYWFg6IFRoaXMgaXMgYWxzbyBsZWFrZWQgLSB3ZSBzaG91bGQgcmVtb3ZlIGl0IHdoZW4gdW5tb3VudGluZ1xuICAgICAgICBHcm91cFN0b3JlLm9uKCdlcnJvcicsIChlcnIsIGVycm9yR3JvdXBJZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycm9yR3JvdXBJZCAhPT0gZ3JvdXBJZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcm9vbXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Hcm91cFN0b3JlVXBkYXRlZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJvb21zOiBHcm91cFN0b3JlLmdldEdyb3VwUm9vbXModGhpcy5wcm9wcy5ncm91cElkKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9jcmVhdGVPdmVyZmxvd1RpbGUgPSAob3ZlcmZsb3dDb3VudCwgdG90YWxDb3VudCkgPT4ge1xuICAgICAgICAvLyBGb3Igbm93IHdlJ2xsIHByZXRlbmQgdGhpcyBpcyBhbnkgZW50aXR5LiBJdCBzaG91bGQgcHJvYmFibHkgYmUgYSBzZXBhcmF0ZSB0aWxlLlxuICAgICAgICBjb25zdCBFbnRpdHlUaWxlID0gc2RrLmdldENvbXBvbmVudChcInJvb21zLkVudGl0eVRpbGVcIik7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXZhdGFycy5CYXNlQXZhdGFyXCIpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gX3QoXCJhbmQgJShjb3VudClzIG90aGVycy4uLlwiLCB7IGNvdW50OiBvdmVyZmxvd0NvdW50IH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEVudGl0eVRpbGUgY2xhc3NOYW1lPVwibXhfRW50aXR5VGlsZV9lbGxpcHNpc1wiIGF2YXRhckpzeD17XG4gICAgICAgICAgICAgICAgPEJhc2VBdmF0YXIgdXJsPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGxpcHNpcy5zdmdcIil9IG5hbWU9XCIuLi5cIiB3aWR0aD17MzZ9IGhlaWdodD17MzZ9IC8+XG4gICAgICAgICAgICB9IG5hbWU9e3RleHR9IHByZXNlbmNlU3RhdGU9XCJvbmxpbmVcIiBzdXBwcmVzc09uSG92ZXI9e3RydWV9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9zaG93RnVsbFJvb21MaXN0fSAvPlxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfc2hvd0Z1bGxSb29tTGlzdCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cnVuY2F0ZUF0OiAtMSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uU2VhcmNoUXVlcnlDaGFuZ2VkID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VhcmNoUXVlcnk6IGV2LnRhcmdldC52YWx1ZSB9KTtcbiAgICB9O1xuXG4gICAgb25BZGRSb29tVG9Hcm91cEJ1dHRvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICBzaG93R3JvdXBBZGRSb29tRGlhbG9nKHRoaXMucHJvcHMuZ3JvdXBJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBtYWtlR3JvdXBSb29tVGlsZXMocXVlcnkpIHtcbiAgICAgICAgY29uc3QgR3JvdXBSb29tVGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJncm91cHMuR3JvdXBSb29tVGlsZVwiKTtcbiAgICAgICAgcXVlcnkgPSAocXVlcnkgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBsZXQgcm9vbUxpc3QgPSB0aGlzLnN0YXRlLnJvb21zO1xuICAgICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgICAgIHJvb21MaXN0ID0gcm9vbUxpc3QuZmlsdGVyKChyb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlc05hbWUgPSAocm9vbS5uYW1lIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNBbGlhcyA9IChyb29tLmNhbm9uaWNhbEFsaWFzIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzTmFtZSB8fCBtYXRjaGVzQWxpYXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJvb21MaXN0ID0gcm9vbUxpc3QubWFwKChncm91cFJvb20sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxHcm91cFJvb21UaWxlXG4gICAgICAgICAgICAgICAgICAgIGtleT17aW5kZXh9XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBSb29tPXtncm91cFJvb219IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcm9vbUxpc3Q7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW52aXRlQnV0dG9uO1xuICAgICAgICBpZiAoR3JvdXBTdG9yZS5pc1VzZXJQcml2aWxlZ2VkKHRoaXMucHJvcHMuZ3JvdXBJZCkpIHtcbiAgICAgICAgICAgIGludml0ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X2ludml0ZSBteF9NZW1iZXJMaXN0X2FkZFJvb21Ub0NvbW11bml0eVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BZGRSb29tVG9Hcm91cEJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+eyBfdCgnQWRkIHJvb21zIHRvIHRoaXMgY29tbXVuaXR5JykgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucHV0Qm94ID0gKFxuICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm14X0dyb3VwUm9vbUxpc3RfcXVlcnkgbXhfdGV4dGlucHV0XCIgaWQ9XCJteF9Hcm91cFJvb21MaXN0X3F1ZXJ5XCIgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblNlYXJjaFF1ZXJ5Q2hhbmdlZH0gdmFsdWU9e3RoaXMuc3RhdGUuc2VhcmNoUXVlcnl9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdCgnRmlsdGVyIGNvbW11bml0eSByb29tcycpfSBhdXRvQ29tcGxldGU9XCJvZmZcIiAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IFRydW5jYXRlZExpc3QgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVHJ1bmNhdGVkTGlzdFwiKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfR3JvdXBSb29tTGlzdFwiIHJvbGU9XCJ0YWJwYW5lbFwiPlxuICAgICAgICAgICAgICAgIHsgaW52aXRlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPVwibXhfR3JvdXBSb29tTGlzdF9qb2luZWQgbXhfR3JvdXBSb29tTGlzdF9vdXRlcldyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFRydW5jYXRlZExpc3QgY2xhc3NOYW1lPVwibXhfR3JvdXBSb29tTGlzdF93cmFwcGVyXCIgdHJ1bmNhdGVBdD17dGhpcy5zdGF0ZS50cnVuY2F0ZUF0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudD17dGhpcy5fY3JlYXRlT3ZlcmZsb3dUaWxlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5tYWtlR3JvdXBSb29tVGlsZXModGhpcy5zdGF0ZS5zZWFyY2hRdWVyeSkgfVxuICAgICAgICAgICAgICAgICAgICA8L1RydW5jYXRlZExpc3Q+XG4gICAgICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgICAgICB7IGlucHV0Qm94IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==