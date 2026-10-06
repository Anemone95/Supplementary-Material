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

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

/*
Copyright 2017 New Vector Ltd
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
class GroupRoomInfo extends _react.default.Component {
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
      const httpUrl = this.context.mxcUrlToHttp(avatarUrl, 800, 800);
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

}

exports.default = GroupRoomInfo;
(0, _defineProperty2.default)(GroupRoomInfo, "contextType", _MatrixClientContext.default);
(0, _defineProperty2.default)(GroupRoomInfo, "propTypes", {
  groupId: _propTypes.default.string,
  groupRoomId: _propTypes.default.string
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2dyb3Vwcy9Hcm91cFJvb21JbmZvLmpzIl0sIm5hbWVzIjpbIkdyb3VwUm9vbUluZm8iLCJSZWFjdCIsIkNvbXBvbmVudCIsImlzVXNlclByaXZpbGVnZWRJbkdyb3VwIiwiZ3JvdXBSb29tIiwiZ3JvdXBSb29tUHVibGljaXR5TG9hZGluZyIsImdyb3VwUm9vbVJlbW92ZUxvYWRpbmciLCJzZXRTdGF0ZSIsIkdyb3VwU3RvcmUiLCJpc1VzZXJQcml2aWxlZ2VkIiwicHJvcHMiLCJncm91cElkIiwiX3VwZGF0ZUdyb3VwUm9vbSIsImUiLCJyb29tTmFtZSIsInN0YXRlIiwiZGlzcGxheW5hbWUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIlF1ZXN0aW9uRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsIm9uRmluaXNoZWQiLCJwcm9jZWVkIiwicm9vbUlkIiwiZ3JvdXBSb29tSWQiLCJyZW1vdmVSb29tRnJvbUdyb3VwIiwidGhlbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJFcnJvckRpYWxvZyIsImZpbmFsbHkiLCJpc1B1YmxpYyIsInRhcmdldCIsInZhbHVlIiwidXBkYXRlR3JvdXBSb29tVmlzaWJpbGl0eSIsImNvbXBvbmVudERpZE1vdW50IiwiX2luaXRHcm91cFN0b3JlIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsIl91bnJlZ2lzdGVyR3JvdXBTdG9yZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVnaXN0ZXJMaXN0ZW5lciIsIm9uR3JvdXBTdG9yZVVwZGF0ZWQiLCJ1bnJlZ2lzdGVyTGlzdGVuZXIiLCJnZXRHcm91cFJvb21zIiwiZmluZCIsInIiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwiSW5saW5lU3Bpbm5lciIsIlNwaW5uZXIiLCJhZG1pblRvb2xzIiwiX29uUmVtb3ZlIiwiX2NoYW5nZUdyb3VwUm9vbVB1YmxpY2l0eSIsImF2YXRhclVybCIsImF2YXRhckVsZW1lbnQiLCJodHRwVXJsIiwiY29udGV4dCIsIm14Y1VybFRvSHR0cCIsImdyb3VwUm9vbU5hbWUiLCJfb25DYW5jZWwiLCJyZXF1aXJlIiwiY2Fub25pY2FsQWxpYXMiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiUHJvcFR5cGVzIiwic3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVllLE1BQU1BLGFBQU4sU0FBNEJDLGVBQU1DLFNBQWxDLENBQTRDO0FBQUE7QUFBQTtBQUFBLGlEQVEvQztBQUNKQyxNQUFBQSx1QkFBdUIsRUFBRSxJQURyQjtBQUVKQyxNQUFBQSxTQUFTLEVBQUUsSUFGUDtBQUdKQyxNQUFBQSx5QkFBeUIsRUFBRSxLQUh2QjtBQUlKQyxNQUFBQSxzQkFBc0IsRUFBRTtBQUpwQixLQVIrQztBQUFBLCtEQWdEakMsTUFBTTtBQUN4QixXQUFLQyxRQUFMLENBQWM7QUFDVkosUUFBQUEsdUJBQXVCLEVBQUVLLG9CQUFXQyxnQkFBWCxDQUE0QixLQUFLQyxLQUFMLENBQVdDLE9BQXZDO0FBRGYsT0FBZDs7QUFHQSxXQUFLQyxnQkFBTDtBQUNILEtBckRzRDtBQUFBLHFEQXVEM0NDLENBQUMsSUFBSTtBQUNiLFlBQU1GLE9BQU8sR0FBRyxLQUFLRCxLQUFMLENBQVdDLE9BQTNCO0FBQ0EsWUFBTUcsUUFBUSxHQUFHLEtBQUtDLEtBQUwsQ0FBV1gsU0FBWCxDQUFxQlksV0FBdEM7QUFDQUgsTUFB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QStCLE1BQUEsSUFBSSxFQUFDO0FBQXBDLG9CQUNJLDZCQUFDLDBCQUFELHFCQUNJLDZCQUFDLGdCQUFEO0FBQWtCLE1BQUEsU0FBUyxFQUFDLHNCQUE1QjtBQUFtRCxNQUFBLE9BQU8sRUFBRSxLQUFLdUQ7QUFBakUsb0JBQ0k7QUFBSyxNQUFBLEdBQUcsRUFBRUMsT0FBTyxDQUFDLGdDQUFELENBQWpCO0FBQXFELE1BQUEsS0FBSyxFQUFDLElBQTNEO0FBQWdFLE1BQUEsTUFBTSxFQUFDLElBQXZFO0FBQTRFLE1BQUEsU0FBUyxFQUFDO0FBQXRGLE1BREosQ0FESixFQUlNTixhQUpOLGVBTUkseUNBQU1JLGFBQU4sQ0FOSixlQVFJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTSxLQUFLdkQsS0FBTCxDQUFXWCxTQUFYLENBQXFCcUUsY0FEM0IsQ0FESixDQVJKLEVBY01YLFVBZE4sQ0FESixDQURKO0FBb0JIOztBQTVNc0Q7Ozs4QkFBdEM5RCxhLGlCQUNJMEUsNEI7OEJBREoxRSxhLGVBR0U7QUFDZlcsRUFBQUEsT0FBTyxFQUFFZ0UsbUJBQVVDLE1BREo7QUFFZjlDLEVBQUFBLFdBQVcsRUFBRTZDLG1CQUFVQztBQUZSLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBHcm91cFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9Hcm91cFN0b3JlJztcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQXV0b0hpZGVTY3JvbGxiYXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JvdXBSb29tSW5mbyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGdyb3VwSWQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGdyb3VwUm9vbUlkOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgaXNVc2VyUHJpdmlsZWdlZEluR3JvdXA6IG51bGwsXG4gICAgICAgIGdyb3VwUm9vbTogbnVsbCxcbiAgICAgICAgZ3JvdXBSb29tUHVibGljaXR5TG9hZGluZzogZmFsc2UsXG4gICAgICAgIGdyb3VwUm9vbVJlbW92ZUxvYWRpbmc6IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5faW5pdEdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAobmV3UHJvcHMuZ3JvdXBJZCAhPT0gdGhpcy5wcm9wcy5ncm91cElkKSB7XG4gICAgICAgICAgICB0aGlzLl91bnJlZ2lzdGVyR3JvdXBTdG9yZSh0aGlzLnByb3BzLmdyb3VwSWQpO1xuICAgICAgICAgICAgdGhpcy5faW5pdEdyb3VwU3RvcmUobmV3UHJvcHMuZ3JvdXBJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdW5yZWdpc3Rlckdyb3VwU3RvcmUodGhpcy5wcm9wcy5ncm91cElkKTtcbiAgICB9XG5cbiAgICBfaW5pdEdyb3VwU3RvcmUoZ3JvdXBJZCkge1xuICAgICAgICBHcm91cFN0b3JlLnJlZ2lzdGVyTGlzdGVuZXIoZ3JvdXBJZCwgdGhpcy5vbkdyb3VwU3RvcmVVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBfdW5yZWdpc3Rlckdyb3VwU3RvcmUoZ3JvdXBJZCkge1xuICAgICAgICBHcm91cFN0b3JlLnVucmVnaXN0ZXJMaXN0ZW5lcih0aGlzLm9uR3JvdXBTdG9yZVVwZGF0ZWQpO1xuICAgIH1cblxuICAgIF91cGRhdGVHcm91cFJvb20oKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JvdXBSb29tOiBHcm91cFN0b3JlLmdldEdyb3VwUm9vbXModGhpcy5wcm9wcy5ncm91cElkKS5maW5kKFxuICAgICAgICAgICAgICAgIChyKSA9PiByLnJvb21JZCA9PT0gdGhpcy5wcm9wcy5ncm91cFJvb21JZCxcbiAgICAgICAgICAgICksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uR3JvdXBTdG9yZVVwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNVc2VyUHJpdmlsZWdlZEluR3JvdXA6IEdyb3VwU3RvcmUuaXNVc2VyUHJpdmlsZWdlZCh0aGlzLnByb3BzLmdyb3VwSWQpLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fdXBkYXRlR3JvdXBSb29tKCk7XG4gICAgfTtcblxuICAgIF9vblJlbW92ZSA9IGUgPT4ge1xuICAgICAgICBjb25zdCBncm91cElkID0gdGhpcy5wcm9wcy5ncm91cElkO1xuICAgICAgICBjb25zdCByb29tTmFtZSA9IHRoaXMuc3RhdGUuZ3JvdXBSb29tLmRpc3BsYXluYW1lO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NvbmZpcm0gcmVtb3ZhbCBvZiBncm91cCBmcm9tIHJvb20nLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgJyUocm9vbU5hbWUpcycgZnJvbSAlKGdyb3VwSWQpcz9cIiwge3Jvb21OYW1lLCBncm91cElkfSksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJSZW1vdmluZyBhIHJvb20gZnJvbSB0aGUgY29tbXVuaXR5IHdpbGwgYWxzbyByZW1vdmUgaXQgZnJvbSB0aGUgY29tbXVuaXR5IHBhZ2UuXCIpLFxuICAgICAgICAgICAgYnV0dG9uOiBfdChcIlJlbW92ZVwiKSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChwcm9jZWVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcm9jZWVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3JvdXBSb29tUmVtb3ZlTG9hZGluZzogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwSWQgPSB0aGlzLnByb3BzLmdyb3VwSWQ7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5ncm91cFJvb21JZDtcbiAgICAgICAgICAgICAgICBHcm91cFN0b3JlLnJlbW92ZVJvb21Gcm9tR3JvdXAodGhpcy5wcm9wcy5ncm91cElkLCByb29tSWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfZ3JvdXBfcm9vbV9saXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3Igd2hpbHN0IHJlbW92aW5nICR7cm9vbUlkfSBmcm9tICR7Z3JvdXBJZH1gLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gcmVtb3ZlIHJvb20gZnJvbSBncm91cCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIHJlbW92ZSByb29tIGZyb20gY29tbXVuaXR5XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIHJlbW92ZSAnJShyb29tTmFtZSlzJyBmcm9tICUoZ3JvdXBJZClzXCIsIHtncm91cElkLCByb29tTmFtZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3JvdXBSb29tUmVtb3ZlTG9hZGluZzogZmFsc2V9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25DYW5jZWwgPSBlID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X2dyb3VwX3Jvb21fbGlzdFwiLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX2NoYW5nZUdyb3VwUm9vbVB1YmxpY2l0eSA9IGUgPT4ge1xuICAgICAgICBjb25zdCBpc1B1YmxpYyA9IGUudGFyZ2V0LnZhbHVlID09PSBcInB1YmxpY1wiO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdyb3VwUm9vbVB1YmxpY2l0eUxvYWRpbmc6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBncm91cElkID0gdGhpcy5wcm9wcy5ncm91cElkO1xuICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLmdyb3VwUm9vbUlkO1xuICAgICAgICBjb25zdCByb29tTmFtZSA9IHRoaXMuc3RhdGUuZ3JvdXBSb29tLmRpc3BsYXluYW1lO1xuICAgICAgICBHcm91cFN0b3JlLnVwZGF0ZUdyb3VwUm9vbVZpc2liaWxpdHkodGhpcy5wcm9wcy5ncm91cElkLCByb29tSWQsIGlzUHVibGljKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciB3aGlsc3QgY2hhbmdpbmcgdmlzaWJpbGl0eSBvZiAke3Jvb21JZH0gaW4gJHtncm91cElkfSB0byAke2lzUHVibGljfWAsIGVycik7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHJlbW92ZSByb29tIGZyb20gZ3JvdXAnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJTb21ldGhpbmcgd2VudCB3cm9uZyFcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRoZSB2aXNpYmlsaXR5IG9mICclKHJvb21OYW1lKXMnIGluICUoZ3JvdXBJZClzIGNvdWxkIG5vdCBiZSB1cGRhdGVkLlwiLFxuICAgICAgICAgICAgICAgICAgICB7cm9vbU5hbWUsIGdyb3VwSWR9LFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBncm91cFJvb21QdWJsaWNpdHlMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICBjb25zdCBJbmxpbmVTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuSW5saW5lU3Bpbm5lcicpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ncm91cFJvb21SZW1vdmVMb2FkaW5nIHx8ICF0aGlzLnN0YXRlLmdyb3VwUm9vbSkge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb1wiPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYWRtaW5Ub29scztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNVc2VyUHJpdmlsZWdlZEluR3JvdXApIHtcbiAgICAgICAgICAgIGFkbWluVG9vbHMgPVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb19hZG1pblRvb2xzXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMz57IF90KFwiQWRtaW4gVG9vbHNcIikgfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvX2ZpZWxkXCIgb25DbGljaz17dGhpcy5fb25SZW1vdmV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1JlbW92ZSBmcm9tIGNvbW11bml0eScpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxoMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1Zpc2liaWxpdHkgaW4gUm9vbSBMaXN0JykgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmdyb3VwUm9vbVB1YmxpY2l0eUxvYWRpbmcgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+IDogPGRpdiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cInB1YmxpY1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUuZ3JvdXBSb29tLmlzUHVibGljfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fY2hhbmdlR3JvdXBSb29tUHVibGljaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvX2xhYmVsX3RleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnVmlzaWJsZSB0byBldmVyeW9uZScpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicmFkaW9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cInByaXZhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXshdGhpcy5zdGF0ZS5ncm91cFJvb20uaXNQdWJsaWN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9jaGFuZ2VHcm91cFJvb21QdWJsaWNpdHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lbWJlckluZm9fbGFiZWxfdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdPbmx5IHZpc2libGUgdG8gY29tbXVuaXR5IG1lbWJlcnMnKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSB0aGlzLnN0YXRlLmdyb3VwUm9vbS5hdmF0YXJVcmw7XG4gICAgICAgIGxldCBhdmF0YXJFbGVtZW50O1xuICAgICAgICBpZiAoYXZhdGFyVXJsKSB7XG4gICAgICAgICAgICBjb25zdCBodHRwVXJsID0gdGhpcy5jb250ZXh0Lm14Y1VybFRvSHR0cChhdmF0YXJVcmwsIDgwMCwgODAwKTtcbiAgICAgICAgICAgIGF2YXRhckVsZW1lbnQgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvX2F2YXRhclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtodHRwVXJsfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdyb3VwUm9vbU5hbWUgPSB0aGlzLnN0YXRlLmdyb3VwUm9vbS5kaXNwbGF5bmFtZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb1wiIHJvbGU9XCJ0YWJwYW5lbFwiPlxuICAgICAgICAgICAgICAgIDxBdXRvSGlkZVNjcm9sbGJhcj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb19jYW5jZWxcIiBvbkNsaWNrPXt0aGlzLl9vbkNhbmNlbH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLnN2Z1wiKX0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgY2xhc3NOYW1lPVwibXhfZmlsdGVyRmxpcENvbG9yXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICB7IGF2YXRhckVsZW1lbnQgfVxuXG4gICAgICAgICAgICAgICAgICAgIDxoMj57IGdyb3VwUm9vbU5hbWUgfTwvaDI+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZW1iZXJJbmZvX3Byb2ZpbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVtYmVySW5mb19wcm9maWxlRmllbGRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZ3JvdXBSb29tLmNhbm9uaWNhbEFsaWFzIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICB7IGFkbWluVG9vbHMgfVxuICAgICAgICAgICAgICAgIDwvQXV0b0hpZGVTY3JvbGxiYXI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=