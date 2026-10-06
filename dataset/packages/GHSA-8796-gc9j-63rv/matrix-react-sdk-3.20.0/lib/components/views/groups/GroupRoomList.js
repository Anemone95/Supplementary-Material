"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

const INITIAL_LOAD_NUM_ROOMS = 30;
let GroupRoomList = (_dec = (0, _replaceableComponent.replaceableComponent)("views.groups.GroupRoomList"), _dec(_class = (_temp = _class2 = class GroupRoomList extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  groupId: _propTypes.default.string.isRequired
}), _temp)) || _class);
exports.default = GroupRoomList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2dyb3Vwcy9Hcm91cFJvb21MaXN0LmpzIl0sIm5hbWVzIjpbIklOSVRJQUxfTE9BRF9OVU1fUk9PTVMiLCJHcm91cFJvb21MaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJyb29tcyIsInRydW5jYXRlQXQiLCJzZWFyY2hRdWVyeSIsIl91bm1vdW50ZWQiLCJzZXRTdGF0ZSIsIkdyb3VwU3RvcmUiLCJnZXRHcm91cFJvb21zIiwicHJvcHMiLCJncm91cElkIiwib3ZlcmZsb3dDb3VudCIsInRvdGFsQ291bnQiLCJFbnRpdHlUaWxlIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiQmFzZUF2YXRhciIsInRleHQiLCJjb3VudCIsInJlcXVpcmUiLCJfc2hvd0Z1bGxSb29tTGlzdCIsImV2IiwidGFyZ2V0IiwidmFsdWUiLCJ0aGVuIiwiZm9yY2VVcGRhdGUiLCJjb21wb25lbnREaWRNb3VudCIsIl9pbml0R3JvdXBTdG9yZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiX3VucmVnaXN0ZXJHcm91cFN0b3JlIiwidW5yZWdpc3Rlckxpc3RlbmVyIiwib25Hcm91cFN0b3JlVXBkYXRlZCIsInJlZ2lzdGVyTGlzdGVuZXIiLCJvbiIsImVyciIsImVycm9yR3JvdXBJZCIsIm1ha2VHcm91cFJvb21UaWxlcyIsInF1ZXJ5IiwiR3JvdXBSb29tVGlsZSIsInRvTG93ZXJDYXNlIiwicm9vbUxpc3QiLCJzdGF0ZSIsImZpbHRlciIsInJvb20iLCJtYXRjaGVzTmFtZSIsIm5hbWUiLCJpbmNsdWRlcyIsIm1hdGNoZXNBbGlhcyIsImNhbm9uaWNhbEFsaWFzIiwibWFwIiwiZ3JvdXBSb29tIiwiaW5kZXgiLCJyZW5kZXIiLCJpbnZpdGVCdXR0b24iLCJpc1VzZXJQcml2aWxlZ2VkIiwib25BZGRSb29tVG9Hcm91cEJ1dHRvbkNsaWNrIiwiaW5wdXRCb3giLCJvblNlYXJjaFF1ZXJ5Q2hhbmdlZCIsIlRydW5jYXRlZExp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QixrQkFBTCxDQUF3QixLQUFLSyxLQUFMLENBQVdyQyxXQUFuQyxDQUZOLENBREosQ0FGSixFQVFNb0QsUUFSTixDQURKO0FBWUg7O0FBMUlzRCxDLHNEQUNwQztBQUNmOUMsRUFBQUEsT0FBTyxFQUFFa0QsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRFgsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvR3JvdXBTdG9yZSc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgc2hvd0dyb3VwQWRkUm9vbURpYWxvZyB9IGZyb20gJy4uLy4uLy4uL0dyb3VwQWRkcmVzc1BpY2tlcic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBBdXRvSGlkZVNjcm9sbGJhciBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9BdXRvSGlkZVNjcm9sbGJhclwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmNvbnN0IElOSVRJQUxfTE9BRF9OVU1fUk9PTVMgPSAzMDtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZ3JvdXBzLkdyb3VwUm9vbUxpc3RcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwUm9vbUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIHJvb21zOiBudWxsLFxuICAgICAgICB0cnVuY2F0ZUF0OiBJTklUSUFMX0xPQURfTlVNX1JPT01TLFxuICAgICAgICBzZWFyY2hRdWVyeTogXCJcIixcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbml0R3JvdXBTdG9yZSh0aGlzLnByb3BzLmdyb3VwSWQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl91bnJlZ2lzdGVyR3JvdXBTdG9yZSgpO1xuICAgIH1cblxuICAgIF91bnJlZ2lzdGVyR3JvdXBTdG9yZSgpIHtcbiAgICAgICAgR3JvdXBTdG9yZS51bnJlZ2lzdGVyTGlzdGVuZXIodGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBfaW5pdEdyb3VwU3RvcmUoZ3JvdXBJZCkge1xuICAgICAgICBHcm91cFN0b3JlLnJlZ2lzdGVyTGlzdGVuZXIoZ3JvdXBJZCwgdGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICAgICAgLy8gWFhYOiBUaGlzIHNob3VsZCBiZSBtb3JlIGZsdXh5IC0gbGV0J3MgZ2V0IHRoZSBlcnJvciBmcm9tIEdyb3VwU3RvcmUgLmdldEVycm9yIG9yIHNvbWV0aGluZ1xuICAgICAgICAvLyBYWFg6IFRoaXMgaXMgYWxzbyBsZWFrZWQgLSB3ZSBzaG91bGQgcmVtb3ZlIGl0IHdoZW4gdW5tb3VudGluZ1xuICAgICAgICBHcm91cFN0b3JlLm9uKCdlcnJvcicsIChlcnIsIGVycm9yR3JvdXBJZCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycm9yR3JvdXBJZCAhPT0gZ3JvdXBJZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcm9vbXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Hcm91cFN0b3JlVXBkYXRlZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJvb21zOiBHcm91cFN0b3JlLmdldEdyb3VwUm9vbXModGhpcy5wcm9wcy5ncm91cElkKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9jcmVhdGVPdmVyZmxvd1RpbGUgPSAob3ZlcmZsb3dDb3VudCwgdG90YWxDb3VudCkgPT4ge1xuICAgICAgICAvLyBGb3Igbm93IHdlJ2xsIHByZXRlbmQgdGhpcyBpcyBhbnkgZW50aXR5LiBJdCBzaG91bGQgcHJvYmFibHkgYmUgYSBzZXBhcmF0ZSB0aWxlLlxuICAgICAgICBjb25zdCBFbnRpdHlUaWxlID0gc2RrLmdldENvbXBvbmVudChcInJvb21zLkVudGl0eVRpbGVcIik7XG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXZhdGFycy5CYXNlQXZhdGFyXCIpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gX3QoXCJhbmQgJShjb3VudClzIG90aGVycy4uLlwiLCB7IGNvdW50OiBvdmVyZmxvd0NvdW50IH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEVudGl0eVRpbGUgY2xhc3NOYW1lPVwibXhfRW50aXR5VGlsZV9lbGxpcHNpc1wiIGF2YXRhckpzeD17XG4gICAgICAgICAgICAgICAgPEJhc2VBdmF0YXIgdXJsPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGxpcHNpcy5zdmdcIil9IG5hbWU9XCIuLi5cIiB3aWR0aD17MzZ9IGhlaWdodD17MzZ9IC8+XG4gICAgICAgICAgICB9IG5hbWU9e3RleHR9IHByZXNlbmNlU3RhdGU9XCJvbmxpbmVcIiBzdXBwcmVzc09uSG92ZXI9e3RydWV9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9zaG93RnVsbFJvb21MaXN0fSAvPlxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBfc2hvd0Z1bGxSb29tTGlzdCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cnVuY2F0ZUF0OiAtMSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uU2VhcmNoUXVlcnlDaGFuZ2VkID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VhcmNoUXVlcnk6IGV2LnRhcmdldC52YWx1ZSB9KTtcbiAgICB9O1xuXG4gICAgb25BZGRSb29tVG9Hcm91cEJ1dHRvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICBzaG93R3JvdXBBZGRSb29tRGlhbG9nKHRoaXMucHJvcHMuZ3JvdXBJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBtYWtlR3JvdXBSb29tVGlsZXMocXVlcnkpIHtcbiAgICAgICAgY29uc3QgR3JvdXBSb29tVGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJncm91cHMuR3JvdXBSb29tVGlsZVwiKTtcbiAgICAgICAgcXVlcnkgPSAocXVlcnkgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBsZXQgcm9vbUxpc3QgPSB0aGlzLnN0YXRlLnJvb21zO1xuICAgICAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgICAgIHJvb21MaXN0ID0gcm9vbUxpc3QuZmlsdGVyKChyb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlc05hbWUgPSAocm9vbS5uYW1lIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNBbGlhcyA9IChyb29tLmNhbm9uaWNhbEFsaWFzIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzTmFtZSB8fCBtYXRjaGVzQWxpYXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJvb21MaXN0ID0gcm9vbUxpc3QubWFwKChncm91cFJvb20sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxHcm91cFJvb21UaWxlXG4gICAgICAgICAgICAgICAgICAgIGtleT17aW5kZXh9XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ9e3RoaXMucHJvcHMuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBSb29tPXtncm91cFJvb219IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcm9vbUxpc3Q7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW52aXRlQnV0dG9uO1xuICAgICAgICBpZiAoR3JvdXBTdG9yZS5pc1VzZXJQcml2aWxlZ2VkKHRoaXMucHJvcHMuZ3JvdXBJZCkpIHtcbiAgICAgICAgICAgIGludml0ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZW1iZXJMaXN0X2ludml0ZSBteF9NZW1iZXJMaXN0X2FkZFJvb21Ub0NvbW11bml0eVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BZGRSb29tVG9Hcm91cEJ1dHRvbkNsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+eyBfdCgnQWRkIHJvb21zIHRvIHRoaXMgY29tbXVuaXR5JykgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlucHV0Qm94ID0gKFxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR3JvdXBSb29tTGlzdF9xdWVyeSBteF90ZXh0aW5wdXRcIiBpZD1cIm14X0dyb3VwUm9vbUxpc3RfcXVlcnlcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblNlYXJjaFF1ZXJ5Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5zZWFyY2hRdWVyeX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoJ0ZpbHRlciBjb21tdW5pdHkgcm9vbXMnKX1cbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBUcnVuY2F0ZWRMaXN0ID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlRydW5jYXRlZExpc3RcIik7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0dyb3VwUm9vbUxpc3RcIiByb2xlPVwidGFicGFuZWxcIj5cbiAgICAgICAgICAgICAgICB7IGludml0ZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPEF1dG9IaWRlU2Nyb2xsYmFyIGNsYXNzTmFtZT1cIm14X0dyb3VwUm9vbUxpc3Rfam9pbmVkIG14X0dyb3VwUm9vbUxpc3Rfb3V0ZXJXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxUcnVuY2F0ZWRMaXN0IGNsYXNzTmFtZT1cIm14X0dyb3VwUm9vbUxpc3Rfd3JhcHBlclwiIHRydW5jYXRlQXQ9e3RoaXMuc3RhdGUudHJ1bmNhdGVBdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU92ZXJmbG93RWxlbWVudD17dGhpcy5fY3JlYXRlT3ZlcmZsb3dUaWxlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5tYWtlR3JvdXBSb29tVGlsZXModGhpcy5zdGF0ZS5zZWFyY2hRdWVyeSkgfVxuICAgICAgICAgICAgICAgICAgICA8L1RydW5jYXRlZExpc3Q+XG4gICAgICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgICAgICB7IGlucHV0Qm94IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==