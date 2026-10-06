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

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class, _class2, _temp;

let GroupRoomInfo = (_dec = (0, _replaceableComponent.replaceableComponent)("views.groups.GroupRoomInfo"), _dec(_class = (_temp = _class2 = class GroupRoomInfo extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      isUserPrivilegedInGroup: null,
      groupRoom: null,
      groupRoomPublicityLoading: false,
      groupRoomRemoveLoading: false
    });
    (0, _defineProperty2.default)(this, "onGroupStoreUpdated", () => {
      this.setState({
        isUserPrivilegedInGroup: _GroupStore.default.isUserPrivileged(this.props.groupId)
      });

      this._updateGroupRoom();
    });
    (0, _defineProperty2.default)(this, "_onRemove", e => {
      const groupId = this.props.groupId;
      const roomName = this.state.groupRoom.displayname;
      e.preventDefault();
      e.stopPropagation();
      const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

      _Modal.default.createTrackedDialog('Confirm removal of group from room', '', QuestionDialog, {
        title: (0, _languageHandler._t)("Are you sure you want to remove '%(roomName)s' from %(groupId)s?", {
          roomName,
          groupId
        }),
        description: (0, _languageHandler._t)("Removing a room from the community will also remove it from the community page."),
        button: (0, _languageHandler._t)("Remove"),
        onFinished: proceed => {
          if (!proceed) return;
          this.setState({
            groupRoomRemoveLoading: true
          });
          const groupId = this.props.groupId;
          const roomId = this.props.groupRoomId;

          _GroupStore.default.removeRoomFromGroup(this.props.groupId, roomId).then(() => {
            _dispatcher.default.dispatch({
              action: "view_group_room_list"
            });
          }).catch(err => {
            console.error(`Error whilst removing ${roomId} from ${groupId}`, err);
            const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

            _Modal.default.createTrackedDialog('Failed to remove room from group', '', ErrorDialog, {
              title: (0, _languageHandler._t)("Failed to remove room from community"),
              description: (0, _languageHandler._t)("Failed to remove '%(roomName)s' from %(groupId)s", {
                groupId,
                roomName
              })
            });
          }).finally(() => {
            this.setState({
              groupRoomRemoveLoading: false
            });
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "_onCancel", e => {
      _dispatcher.default.dispatch({
        action: "view_group_room_list"
      });
    });
    (0, _defineProperty2.default)(this, "_changeGroupRoomPublicity", e => {
      const isPublic = e.target.value === "public";
      this.setState({
        groupRoomPublicityLoading: true
      });
      const groupId = this.props.groupId;
      const roomId = this.props.groupRoomId;
      const roomName = this.state.groupRoom.displayname;

      _GroupStore.default.updateGroupRoomVisibility(this.props.groupId, roomId, isPublic).catch(err => {
        console.error(`Error whilst changing visibility of ${roomId} in ${groupId} to ${isPublic}`, err);
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to remove room from group', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Something went wrong!"),
          description: (0, _languageHandler._t)("The visibility of '%(roomName)s' in %(groupId)s could not be updated.", {
            roomName,
            groupId
          })
        });
      }).finally(() => {
        this.setState({
          groupRoomPublicityLoading: false
        });
      });
    });
  }

  componentDidMount() {
    this._initGroupStore(this.props.groupId);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line camelcase


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.groupId !== this.props.groupId) {
      this._unregisterGroupStore(this.props.groupId);

      this._initGroupStore(newProps.groupId);
    }
  }

  componentWillUnmount() {
    this._unregisterGroupStore(this.props.groupId);
  }

  _initGroupStore(groupId) {
    _GroupStore.default.registerListener(groupId, this.onGroupStoreUpdated);
  }

  _unregisterGroupStore(groupId) {
    _GroupStore.default.unregisterListener(this.onGroupStoreUpdated);
  }

  _updateGroupRoom() {
    this.setState({
      groupRoom: _GroupStore.default.getGroupRooms(this.props.groupId).find(r => r.roomId === this.props.groupRoomId)
    });
  }

  render() {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    const InlineSpinner = sdk.getComponent('elements.InlineSpinner');

    if (this.state.groupRoomRemoveLoading || !this.state.groupRoom) {
      const Spinner = sdk.getComponent("elements.Spinner");
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MemberInfo"
      }, /*#__PURE__*/_react.default.createElement(Spinner, null));
    }

    let adminTools;

    if (this.state.isUserPrivilegedInGroup) {
      adminTools = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MemberInfo_adminTools"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Admin Tools")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MemberInfo_buttons"
      }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        className: "mx_MemberInfo_field",
        onClick: this._onRemove
      }, (0, _languageHandler._t)('Remove from community'))), /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Visibility in Room List'), this.state.groupRoomPublicityLoading ? /*#__PURE__*/_react.default.createElement(InlineSpinner, null) : /*#__PURE__*/_react.default.createElement("div", null)), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
        type: "radio",
        value: "public",
        checked: this.state.groupRoom.isPublic,
        onChange: this._changeGroupRoomPublicity
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MemberInfo_label_text"
      }, (0, _languageHandler._t)('Visible to everyone')))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
        type: "radio",
        value: "private",
        checked: !this.state.groupRoom.isPublic,
        onChange: this._changeGroupRoomPublicity
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MemberInfo_label_text"
      }, (0, _languageHandler._t)('Only visible to community members')))));
    }

    const avatarUrl = this.state.groupRoom.avatarUrl;
    let avatarElement;

    if (avatarUrl) {
      const httpUrl = (0, _Media.mediaFromMxc)(avatarUrl).getSquareThumbnailHttp(800);
      avatarElement = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MemberInfo_avatar"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: httpUrl
      }));
    }

    const groupRoomName = this.state.groupRoom.displayname;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberInfo",
      role: "tabpanel"
    }, /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, null, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      className: "mx_MemberInfo_cancel",
      onClick: this._onCancel
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/cancel.svg"),
      width: "18",
      height: "18",
      className: "mx_filterFlipColor"
    })), avatarElement, /*#__PURE__*/_react.default.createElement("h2", null, groupRoomName), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberInfo_profile"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MemberInfo_profileField"
    }, this.state.groupRoom.canonicalAlias)), adminTools));
  }

}, (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), (0, _defineProperty2.default)(_class2, "propTypes", {
  groupId: _propTypes.default.string,
  groupRoomId: _propTypes.default.string
}), _temp)) || _class);
exports.default = GroupRoomInfo;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2dyb3Vwcy9Hcm91cFJvb21JbmZvLmpzIl0sIm5hbWVzIjpbIkdyb3VwUm9vbUluZm8iLCJSZWFjdCIsIkNvbXBvbmVudCIsImlzVXNlclByaXZpbGVnZWRJbkdyb3VwIiwiZ3JvdXBSb29tIiwiZ3JvdXBSb29tUHVibGljaXR5TG9hZGluZyIsImdyb3VwUm9vbVJlbW92ZUxvYWRpbmciLCJzZXRTdGF0ZSIsIkdyb3VwU3RvcmUiLCJpc1VzZXJQcml2aWxlZ2VkIiwicHJvcHMiLCJncm91cElkIiwiX3VwZGF0ZUdyb3VwUm9vbSIsImUiLCJyb29tTmFtZSIsInN0YXRlIiwiZGlzcGxheW5hbWUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIlF1ZXN0aW9uRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsIm9uRmluaXNoZWQiLCJwcm9jZWVkIiwicm9vbUlkIiwiZ3JvdXBSb29tSWQiLCJyZW1vdmVSb29tRnJvbUdyb3VwIiwidGhlbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJFcnJvckRpYWxvZyIsImZpbmFsbHkiLCJpc1B1YmxpYyIsInRhcmdldCIsInZhbHVlIiwidXBkYXRlR3JvdXBSb29tVmlzaWJpbGl0eSIsImNvbXBvbmVudERpZE1vdW50IiwiX2luaXRHcm91cFN0b3JlIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsIl91bnJlZ2lzdGVyR3JvdXBTdG9yZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVnaXN0ZXJMaXN0ZW5lciIsIm9uR3JvdXBTdG9yZVVwZGF0ZWQiLCJ1bnJlZ2lzdGVyTGlzdGVuZXIiLCJnZXRHcm91cFJvb21zIiwiZmluZCIsInIiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwiSW5saW5lU3Bpbm5lciIsIlNwaW5uZXIiLCJhZG1pblRvb2xzIiwiX29uUmVtb3ZlIiwiX2NoYW5nZUdyb3VwUm9vbVB1YmxpY2l0eSIsImF2YXRhclVybCIsImF2YXRhckVsZW1lbnQiLCJodHRwVXJsIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsImdyb3VwUm9vbU5hbWUiLCJfb25DYW5jZWwiLCJyZXF1aXJlIiwiY2Fub25pY2FsQWxpYXMiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiUHJvcFR5cGVzIiwic3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxhLFdBRHBCLGdEQUFxQiw0QkFBckIsQyxtQ0FBRCxNQUNxQkEsYUFEckIsU0FDMkNDLGVBQU1DLFNBRGpELENBQzJEO0FBQUE7QUFBQTtBQUFBLGlEQVEvQztBQUNKQyxNQUFBQSx1QkFBdUIsRUFBRSxJQURyQjtBQUVKQyxNQUFBQSxTQUFTLEVBQUUsSUFGUDtBQUdKQyxNQUFBQSx5QkFBeUIsRUFBRSxLQUh2QjtBQUlKQyxNQUFBQSxzQkFBc0IsRUFBRTtBQUpwQixLQVIrQztBQUFBLCtEQWdEakMsTUFBTTtBQUN4QixXQUFLQyxRQUFMLENBQWM7QUFDVkosUUFBQUEsdUJBQXVCLEVBQUVLLG9CQUFXQyxnQkFBWCxDQUE0QixLQUFLQyxLQUFMLENBQVdDLE9BQXZDO0FBRGYsT0FBZDs7QUFHQSxXQUFLQyxnQkFBTDtBQUNILEtBckRzRDtBQUFBLHFEQXVEM0NDLENBQUMsSUFBSTtBQUNiLFlBQU1GLE9BQU8sR0FBRyxLQUFLRCxLQUFMLENBQVdDLE9BQTNCO0FBQ0EsWUFBTUcsUUFBUSxHQUFHLEtBQUtDLEtBQUwsQ0FBV1gsU0FBWCxDQUFxQlksV0FBdEM7QUFDQUgsTUFBQUEsQ0FBQyxDQUFDSSxjQUFGO0FBQ0FKLE1BQUFBLENB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QUMsZ0JBQUQ7QUFBa0IsTUFBQSxTQUFTLEVBQUMsc0JBQTVCO0FBQW1ELE1BQUEsT0FBTyxFQUFFLEtBQUtzRDtBQUFqRSxvQkFDSTtBQUFLLE1BQUEsR0FBRyxFQUFFQyxPQUFPLENBQUMsZ0NBQUQsQ0FBakI7QUFBcUQsTUFBQSxLQUFLLEVBQUMsSUFBM0Q7QUFBZ0UsTUFBQSxNQUFNLEVBQUMsSUFBdkU7QUFBNEUsTUFBQSxTQUFTLEVBQUM7QUFBdEYsTUFESixDQURKLEVBSU1MLGFBSk4sZUFNSSx5Q0FBTUcsYUFBTixDQU5KLGVBUUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNNLEtBQUt0RCxLQUFMLENBQVdYLFNBQVgsQ0FBcUJvRSxjQUQzQixDQURKLENBUkosRUFjTVYsVUFkTixDQURKLENBREo7QUFvQkg7O0FBMU1zRCxDLHdEQUNsQ1csNEIsdURBRUY7QUFDZjlELEVBQUFBLE9BQU8sRUFBRStELG1CQUFVQyxNQURKO0FBRWY3QyxFQUFBQSxXQUFXLEVBQUU0QyxtQkFBVUM7QUFGUixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvR3JvdXBTdG9yZSc7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcbmltcG9ydCB7bWVkaWFGcm9tTXhjfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZ3JvdXBzLkdyb3VwUm9vbUluZm9cIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwUm9vbUluZm8gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBncm91cElkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBncm91cFJvb21JZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGlzVXNlclByaXZpbGVnZWRJbkdyb3VwOiBudWxsLFxuICAgICAgICBncm91cFJvb206IG51bGwsXG4gICAgICAgIGdyb3VwUm9vbVB1YmxpY2l0eUxvYWRpbmc6IGZhbHNlLFxuICAgICAgICBncm91cFJvb21SZW1vdmVMb2FkaW5nOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX2luaXRHcm91cFN0b3JlKHRoaXMucHJvcHMuZ3JvdXBJZCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgaWYgKG5ld1Byb3BzLmdyb3VwSWQgIT09IHRoaXMucHJvcHMuZ3JvdXBJZCkge1xuICAgICAgICAgICAgdGhpcy5fdW5yZWdpc3Rlckdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICAgICAgICAgIHRoaXMuX2luaXRHcm91cFN0b3JlKG5ld1Byb3BzLmdyb3VwSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VucmVnaXN0ZXJHcm91cFN0b3JlKHRoaXMucHJvcHMuZ3JvdXBJZCk7XG4gICAgfVxuXG4gICAgX2luaXRHcm91cFN0b3JlKGdyb3VwSWQpIHtcbiAgICAgICAgR3JvdXBTdG9yZS5yZWdpc3Rlckxpc3RlbmVyKGdyb3VwSWQsIHRoaXMub25Hcm91cFN0b3JlVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgX3VucmVnaXN0ZXJHcm91cFN0b3JlKGdyb3VwSWQpIHtcbiAgICAgICAgR3JvdXBTdG9yZS51bnJlZ2lzdGVyTGlzdGVuZXIodGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBfdXBkYXRlR3JvdXBSb29tKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdyb3VwUm9vbTogR3JvdXBTdG9yZS5nZXRHcm91cFJvb21zKHRoaXMucHJvcHMuZ3JvdXBJZCkuZmluZChcbiAgICAgICAgICAgICAgICAocikgPT4gci5yb29tSWQgPT09IHRoaXMucHJvcHMuZ3JvdXBSb29tSWQsXG4gICAgICAgICAgICApLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkdyb3VwU3RvcmVVcGRhdGVkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzVXNlclByaXZpbGVnZWRJbkdyb3VwOiBHcm91cFN0b3JlLmlzVXNlclByaXZpbGVnZWQodGhpcy5wcm9wcy5ncm91cElkKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUdyb3VwUm9vbSgpO1xuICAgIH07XG5cbiAgICBfb25SZW1vdmUgPSBlID0+IHtcbiAgICAgICAgY29uc3QgZ3JvdXBJZCA9IHRoaXMucHJvcHMuZ3JvdXBJZDtcbiAgICAgICAgY29uc3Qgcm9vbU5hbWUgPSB0aGlzLnN0YXRlLmdyb3VwUm9vbS5kaXNwbGF5bmFtZTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDb25maXJtIHJlbW92YWwgb2YgZ3JvdXAgZnJvbSByb29tJywgJycsIFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVtb3ZlICclKHJvb21OYW1lKXMnIGZyb20gJShncm91cElkKXM/XCIsIHtyb29tTmFtZSwgZ3JvdXBJZH0pLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiUmVtb3ZpbmcgYSByb29tIGZyb20gdGhlIGNvbW11bml0eSB3aWxsIGFsc28gcmVtb3ZlIGl0IGZyb20gdGhlIGNvbW11bml0eSBwYWdlLlwiKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJSZW1vdmVcIiksXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2dyb3VwUm9vbVJlbW92ZUxvYWRpbmc6IHRydWV9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cElkID0gdGhpcy5wcm9wcy5ncm91cElkO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMuZ3JvdXBSb29tSWQ7XG4gICAgICAgICAgICAgICAgR3JvdXBTdG9yZS5yZW1vdmVSb29tRnJvbUdyb3VwKHRoaXMucHJvcHMuZ3JvdXBJZCwgcm9vbUlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X2dyb3VwX3Jvb21fbGlzdFwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHdoaWxzdCByZW1vdmluZyAke3Jvb21JZH0gZnJvbSAke2dyb3VwSWR9YCwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHJlbW92ZSByb29tIGZyb20gZ3JvdXAnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byByZW1vdmUgcm9vbSBmcm9tIGNvbW11bml0eVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byByZW1vdmUgJyUocm9vbU5hbWUpcycgZnJvbSAlKGdyb3VwSWQpc1wiLCB7Z3JvdXBJZCwgcm9vbU5hbWV9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2dyb3VwUm9vbVJlbW92ZUxvYWRpbmc6IGZhbHNlfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQ2FuY2VsID0gZSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IFwidmlld19ncm91cF9yb29tX2xpc3RcIixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9jaGFuZ2VHcm91cFJvb21QdWJsaWNpdHkgPSBlID0+IHtcbiAgICAgICAgY29uc3QgaXNQdWJsaWMgPSBlLnRhcmdldC52YWx1ZSA9PT0gXCJwdWJsaWNcIjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncm91cFJvb21QdWJsaWNpdHlMb2FkaW5nOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZ3JvdXBJZCA9IHRoaXMucHJvcHMuZ3JvdXBJZDtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5ncm91cFJvb21JZDtcbiAgICAgICAgY29uc3Qgcm9vbU5hbWUgPSB0aGlzLnN0YXRlLmdyb3VwUm9vbS5kaXNwbGF5bmFtZTtcbiAgICAgICAgR3JvdXBTdG9yZS51cGRhdGVHcm91cFJvb21WaXNpYmlsaXR5KHRoaXMucHJvcHMuZ3JvdXBJZCwgcm9vbUlkLCBpc1B1YmxpYykuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3Igd2hpbHN0IGNoYW5naW5nIHZpc2liaWxpdHkgb2YgJHtyb29tSWR9IGluICR7Z3JvdXBJZH0gdG8gJHtpc1B1YmxpY31gLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byByZW1vdmUgcm9vbSBmcm9tIGdyb3VwJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiU29tZXRoaW5nIHdlbnQgd3JvbmchXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGUgdmlzaWJpbGl0eSBvZiAnJShyb29tTmFtZSlzJyBpbiAlKGdyb3VwSWQpcyBjb3VsZCBub3QgYmUgdXBkYXRlZC5cIixcbiAgICAgICAgICAgICAgICAgICAge3Jvb21OYW1lLCBncm91cElkfSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZ3JvdXBSb29tUHVibGljaXR5TG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZ3JvdXBSb29tUmVtb3ZlTG9hZGluZyB8fCAhdGhpcy5zdGF0ZS5ncm91cFJvb20pIHtcbiAgICAgICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X01lbWJlckluZm9cIj5cbiAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFkbWluVG9vbHM7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzVXNlclByaXZpbGVnZWRJbkdyb3VwKSB7XG4gICAgICAgICAgICBhZG1pblRvb2xzID1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lbWJlckluZm9fYWRtaW5Ub29sc1wiPlxuICAgICAgICAgICAgICAgICAgICA8aDM+eyBfdChcIkFkbWluIFRvb2xzXCIpIH08L2gzPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lbWJlckluZm9fYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb19maWVsZFwiIG9uQ2xpY2s9e3RoaXMuX29uUmVtb3ZlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdSZW1vdmUgZnJvbSBjb21tdW5pdHknKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDM+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdWaXNpYmlsaXR5IGluIFJvb20gTGlzdCcpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5ncm91cFJvb21QdWJsaWNpdHlMb2FkaW5nID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SW5saW5lU3Bpbm5lciAvPiA6IDxkaXYgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCJwdWJsaWNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnN0YXRlLmdyb3VwUm9vbS5pc1B1YmxpY31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2NoYW5nZUdyb3VwUm9vbVB1YmxpY2l0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb19sYWJlbF90ZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1Zpc2libGUgdG8gZXZlcnlvbmUnKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCJwcml2YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17IXRoaXMuc3RhdGUuZ3JvdXBSb29tLmlzUHVibGljfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fY2hhbmdlR3JvdXBSb29tUHVibGljaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvX2xhYmVsX3RleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnT25seSB2aXNpYmxlIHRvIGNvbW11bml0eSBtZW1iZXJzJykgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXZhdGFyVXJsID0gdGhpcy5zdGF0ZS5ncm91cFJvb20uYXZhdGFyVXJsO1xuICAgICAgICBsZXQgYXZhdGFyRWxlbWVudDtcbiAgICAgICAgaWYgKGF2YXRhclVybCkge1xuICAgICAgICAgICAgY29uc3QgaHR0cFVybCA9IG1lZGlhRnJvbU14YyhhdmF0YXJVcmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoODAwKTtcbiAgICAgICAgICAgIGF2YXRhckVsZW1lbnQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X01lbWJlckluZm9fYXZhdGFyXCI+PGltZyBzcmM9e2h0dHBVcmx9IC8+PC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ3JvdXBSb29tTmFtZSA9IHRoaXMuc3RhdGUuZ3JvdXBSb29tLmRpc3BsYXluYW1lO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvXCIgcm9sZT1cInRhYnBhbmVsXCI+XG4gICAgICAgICAgICAgICAgPEF1dG9IaWRlU2Nyb2xsYmFyPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvX2NhbmNlbFwiIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9jYW5jZWwuc3ZnXCIpfSB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiBjbGFzc05hbWU9XCJteF9maWx0ZXJGbGlwQ29sb3JcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHsgYXZhdGFyRWxlbWVudCB9XG5cbiAgICAgICAgICAgICAgICAgICAgPGgyPnsgZ3JvdXBSb29tTmFtZSB9PC9oMj5cblxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lbWJlckluZm9fcHJvZmlsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvX3Byb2ZpbGVGaWVsZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5ncm91cFJvb20uY2Fub25pY2FsQWxpYXMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIHsgYWRtaW5Ub29scyB9XG4gICAgICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==