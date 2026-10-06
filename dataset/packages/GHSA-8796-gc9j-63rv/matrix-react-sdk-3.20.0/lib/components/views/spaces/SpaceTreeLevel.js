"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SpaceItem = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _SpaceStore = _interopRequireDefault(require("../../../stores/SpaceStore"));

var _NotificationBadge = _interopRequireDefault(require("../rooms/NotificationBadge"));

var _RovingAccessibleButton = require("../../../accessibility/roving/RovingAccessibleButton");

var _RovingAccessibleTooltipButton = require("../../../accessibility/roving/RovingAccessibleTooltipButton");

var _IconizedContextMenu = _interopRequireWildcard(require("../context_menus/IconizedContextMenu"));

var _languageHandler = require("../../../languageHandler");

var _ContextMenuTooltipButton = require("../../../accessibility/context_menu/ContextMenuTooltipButton");

var _ContextMenu = require("../../structures/ContextMenu");

var _space = require("../../../utils/space");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _RoomViewStore = _interopRequireDefault(require("../../../stores/RoomViewStore"));

var _RightPanelStorePhases = require("../../../stores/RightPanelStorePhases");

var _event = require("matrix-js-sdk/src/@types/event");

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _NotificationColor = require("../../../stores/notifications/NotificationColor");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
class SpaceItem extends _react.default.PureComponent
/*:: <IItemProps, IItemState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onContextMenu", (ev
    /*: React.MouseEvent*/
    ) => {
      if (this.props.space.getMyMembership() !== "join") return;
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        contextMenuPosition: {
          right: ev.clientX,
          top: ev.clientY,
          height: 0
        }
      });
    });
    (0, _defineProperty2.default)(this, "onClick", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _SpaceStore.default.instance.setActiveSpace(this.props.space);
    });
    (0, _defineProperty2.default)(this, "onMenuOpenClick", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        contextMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onMenuClose", () => {
      this.setState({
        contextMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onInviteClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      (0, _space.showSpaceInvite)(this.props.space);
      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onSettingsClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      (0, _space.showSpaceSettings)(this.context, this.props.space);
      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onLeaveClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: "leave_room",
        room_id: this.props.space.roomId
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onNewRoomClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      (0, _space.showCreateNewRoom)(this.context, this.props.space);
      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onAddExistingRoomClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();
      (0, _space.showAddExistingRooms)(this.context, this.props.space);
      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onMembersClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      if (!_RoomViewStore.default.getRoomId()) {
        _dispatcher.default.dispatch({
          action: "view_room",
          room_id: this.props.space.roomId
        }, true);
      }

      _dispatcher.default.dispatch({
        action: _actions.Action.SetRightPanelPhase,
        phase: _RightPanelStorePhases.RightPanelPhases.SpaceMemberList,
        refireParams: {
          space: this.props.space
        }
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onExploreRoomsClick", (ev
    /*: ButtonEvent*/
    ) => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: "view_room",
        room_id: this.props.space.roomId
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    this.state = {
      collapsed: !props.isNested,
      // default to collapsed for root items
      contextMenuPosition: null
    };
  }

  toggleCollapse(evt) {
    if (this.props.onExpand && this.state.collapsed) {
      this.props.onExpand();
    }

    this.setState({
      collapsed: !this.state.collapsed
    }); // don't bubble up so encapsulating button for space
    // doesn't get triggered

    evt.stopPropagation();
  }

  renderContextMenu()
  /*: React.ReactElement*/
  {
    if (this.props.space.getMyMembership() !== "join") return null;
    let contextMenu = null;

    if (this.state.contextMenuPosition) {
      const userId = this.context.getUserId();
      let inviteOption;

      if (this.props.space.canInvite(userId)) {
        inviteOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          className: "mx_SpacePanel_contextMenu_inviteButton",
          iconClassName: "mx_SpacePanel_iconInvite",
          label: (0, _languageHandler._t)("Invite people"),
          onClick: this.onInviteClick
        });
      }

      let settingsOption;
      let leaveSection;

      if ((0, _space.shouldShowSpaceSettings)(this.context, this.props.space)) {
        settingsOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_SpacePanel_iconSettings",
          label: (0, _languageHandler._t)("Settings"),
          onClick: this.onSettingsClick
        });
      } else {
        leaveSection = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
          red: true,
          first: true
        }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_SpacePanel_iconLeave",
          label: (0, _languageHandler._t)("Leave space"),
          onClick: this.onLeaveClick
        }));
      }

      const canAddRooms = this.props.space.currentState.maySendStateEvent(_event.EventType.SpaceChild, userId);
      let newRoomSection;

      if (this.props.space.currentState.maySendStateEvent(_event.EventType.SpaceChild, userId)) {
        newRoomSection = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
          first: true
        }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_SpacePanel_iconPlus",
          label: (0, _languageHandler._t)("Create new room"),
          onClick: this.onNewRoomClick
        }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_SpacePanel_iconHash",
          label: (0, _languageHandler._t)("Add existing room"),
          onClick: this.onAddExistingRoomClick
        }));
      }

      contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.toRightOf)(this.state.contextMenuPosition, 0), {
        onFinished: this.onMenuClose,
        className: "mx_SpacePanel_contextMenu",
        compact: true
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpacePanel_contextMenu_header"
      }, this.props.space.name), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        first: true
      }, inviteOption, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_SpacePanel_iconMembers",
        label: (0, _languageHandler._t)("Members"),
        onClick: this.onMembersClick
      }), settingsOption, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_SpacePanel_iconExplore",
        label: canAddRooms ? (0, _languageHandler._t)("Manage & explore rooms") : (0, _languageHandler._t)("Explore rooms"),
        onClick: this.onExploreRoomsClick
      })), newRoomSection, leaveSection);
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenuTooltipButton.ContextMenuTooltipButton, {
      className: "mx_SpaceButton_menuButton",
      onClick: this.onMenuOpenClick,
      title: (0, _languageHandler._t)("Space options"),
      isExpanded: !!this.state.contextMenuPosition
    }), contextMenu);
  }

  render() {
    const {
      space,
      activeSpaces,
      isNested
    } = this.props;
    const forceCollapsed = this.props.isPanelCollapsed;
    const isNarrow = this.props.isPanelCollapsed;
    const collapsed = this.state.collapsed || forceCollapsed;

    const childSpaces = _SpaceStore.default.instance.getChildSpaces(space.roomId).filter(s => !this.props.parents?.has(s.roomId));

    const isActive = activeSpaces.includes(space);
    const itemClasses = (0, _classnames.default)({
      "mx_SpaceItem": true,
      "mx_SpaceItem_narrow": isNarrow,
      "collapsed": collapsed,
      "hasSubSpaces": childSpaces && childSpaces.length
    });
    const isInvite = space.getMyMembership() === "invite";
    const classes = (0, _classnames.default)("mx_SpaceButton", {
      mx_SpaceButton_active: isActive,
      mx_SpaceButton_hasMenuOpen: !!this.state.contextMenuPosition,
      mx_SpaceButton_narrow: isNarrow,
      mx_SpaceButton_invite: isInvite
    });
    const notificationState = isInvite ? _StaticNotificationState.StaticNotificationState.forSymbol("!", _NotificationColor.NotificationColor.Red) : _SpaceStore.default.instance.getNotificationState(space.roomId);
    let childItems;

    if (childSpaces && !collapsed) {
      childItems = /*#__PURE__*/_react.default.createElement(SpaceTreeLevel, {
        spaces: childSpaces,
        activeSpaces: activeSpaces,
        isNested: true,
        parents: new Set(this.props.parents).add(this.props.space.roomId)
      });
    }

    let notifBadge;

    if (notificationState) {
      notifBadge = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpacePanel_badgeContainer"
      }, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
        forceCount: false,
        notification: notificationState
      }));
    }

    const avatarSize = isNested ? 24 : 32;
    const toggleCollapseButton = childSpaces && childSpaces.length ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_SpaceButton_toggleCollapse",
      onClick: evt => this.toggleCollapse(evt)
    }) : null;
    let button;

    if (isNarrow) {
      button = /*#__PURE__*/_react.default.createElement(_RovingAccessibleTooltipButton.RovingAccessibleTooltipButton, {
        className: classes,
        title: space.name,
        onClick: this.onClick,
        onContextMenu: this.onContextMenu,
        forceHide: !!this.state.contextMenuPosition,
        role: "treeitem"
      }, toggleCollapseButton, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceButton_selectionWrapper"
      }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        width: avatarSize,
        height: avatarSize,
        room: space
      }), notifBadge, this.renderContextMenu()));
    } else {
      button = /*#__PURE__*/_react.default.createElement(_RovingAccessibleButton.RovingAccessibleButton, {
        className: classes,
        onClick: this.onClick,
        onContextMenu: this.onContextMenu,
        role: "treeitem"
      }, toggleCollapseButton, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceButton_selectionWrapper"
      }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        width: avatarSize,
        height: avatarSize,
        room: space
      }), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SpaceButton_name"
      }, space.name), notifBadge, this.renderContextMenu()));
    }

    return /*#__PURE__*/_react.default.createElement("li", {
      className: itemClasses
    }, button, childItems);
  }

}

exports.SpaceItem = SpaceItem;
(0, _defineProperty2.default)(SpaceItem, "contextType", _MatrixClientContext.default);

const SpaceTreeLevel
/*: React.FC<ITreeLevelProps>*/
= ({
  spaces,
  activeSpaces,
  isNested,
  parents
}) => {
  return /*#__PURE__*/_react.default.createElement("ul", {
    className: "mx_SpaceTreeLevel"
  }, spaces.map(s => {
    return /*#__PURE__*/_react.default.createElement(SpaceItem, {
      key: s.roomId,
      activeSpaces: activeSpaces,
      space: s,
      isNested: isNested,
      parents: parents
    });
  }));
};

var _default = SpaceTreeLevel;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NwYWNlcy9TcGFjZVRyZWVMZXZlbC50c3giXSwibmFtZXMiOlsiU3BhY2VJdGVtIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2Iiwic3BhY2UiLCJnZXRNeU1lbWJlcnNoaXAiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNldFN0YXRlIiwiY29udGV4dE1lbnVQb3NpdGlvbiIsInJpZ2h0IiwiY2xpZW50WCIsInRvcCIsImNsaWVudFkiLCJoZWlnaHQiLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJzZXRBY3RpdmVTcGFjZSIsInRhcmdldCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNvbnRleHQiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiYWN0aW9uIiwicm9vbV9pZCIsInJvb21JZCIsIlJvb21WaWV3U3RvcmUiLCJnZXRSb29tSWQiLCJBY3Rpb24iLCJTZXRSaWdodFBhbmVsUGhhc2UiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJTcGFjZU1lbWJlckxpc3QiLCJyZWZpcmVQYXJhbXMiLCJzdGF0ZSIsImNvbGxhcHNlZCIsImlzTmVzdGVkIiwidG9nZ2xlQ29sbGFwc2UiLCJldnQiLCJvbkV4cGFuZCIsInJlbmRlckNvbnRleHRNZW51IiwiY29udGV4dE1lbnUiLCJ1c2VySWQiLCJnZXRVc2VySWQiLCJpbnZpdGVPcHRpb24iLCJjYW5JbnZpdGUiLCJvbkludml0ZUNsaWNrIiwic2V0dGluZ3NPcHRpb24iLCJsZWF2ZVNlY3Rpb24iLCJvblNldHRpbmdzQ2xpY2siLCJvbkxlYXZlQ2xpY2siLCJjYW5BZGRSb29tcyIsImN1cnJlbnRTdGF0ZSIsIm1heVNlbmRTdGF0ZUV2ZW50IiwiRXZlbnRUeXBlIiwiU3BhY2VDaGlsZCIsIm5ld1Jvb21TZWN0aW9uIiwib25OZXdSb29tQ2xpY2siLCJvbkFkZEV4aXN0aW5nUm9vbUNsaWNrIiwib25NZW51Q2xvc2UiLCJuYW1lIiwib25NZW1iZXJzQ2xpY2siLCJvbkV4cGxvcmVSb29tc0NsaWNrIiwib25NZW51T3BlbkNsaWNrIiwicmVuZGVyIiwiYWN0aXZlU3BhY2VzIiwiZm9yY2VDb2xsYXBzZWQiLCJpc1BhbmVsQ29sbGFwc2VkIiwiaXNOYXJyb3ciLCJjaGlsZFNwYWNlcyIsImdldENoaWxkU3BhY2VzIiwiZmlsdGVyIiwicyIsInBhcmVudHMiLCJoYXMiLCJpc0FjdGl2ZSIsImluY2x1ZGVzIiwiaXRlbUNsYXNzZXMiLCJsZW5ndGgiLCJpc0ludml0ZSIsImNsYXNzZXMiLCJteF9TcGFjZUJ1dHRvbl9hY3RpdmUiLCJteF9TcGFjZUJ1dHRvbl9oYXNNZW51T3BlbiIsIm14X1NwYWNlQnV0dG9uX25hcnJvdyIsIm14X1NwYWNlQnV0dG9uX2ludml0ZSIsIm5vdGlmaWNhdGlvblN0YXRlIiwiU3RhdGljTm90aWZpY2F0aW9uU3RhdGUiLCJmb3JTeW1ib2wiLCJOb3RpZmljYXRpb25Db2xvciIsIlJlZCIsImdldE5vdGlmaWNhdGlvblN0YXRlIiwiY2hpbGRJdGVtcyIsIlNldCIsImFkZCIsIm5vdGlmQmFkZ2UiLCJhdmF0YXJTaXplIiwidG9nZ2xlQ29sbGFwc2VCdXR0b24iLCJidXR0b24iLCJvbkNsaWNrIiwib25Db250ZXh0TWVudSIsIk1hdHJpeENsaWVudENvbnRleHQiLCJTcGFjZVRyZWVMZXZlbCIsInNwYWNlcyIsIm1hcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQU9BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQWhEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrRE8s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UUFBQSxLQUFLLEVBQUVELFVBQW5CO0FBQStCLFFBQUEsTUFBTSxFQUFFQSxVQUF2QztBQUFtRCxRQUFBLElBQUksRUFBRTNGO0FBQXpELFFBREosZUFFSTtBQUFNLFFBQUEsU0FBUyxFQUFDO0FBQWhCLFNBQXdDQSxLQUFLLENBQUN3RCxJQUE5QyxDQUZKLEVBR01rQyxVQUhOLEVBSU0sS0FBS3RELGlCQUFMLEVBSk4sQ0FQSixDQURKO0FBZ0JIOztBQUVELHdCQUNJO0FBQUksTUFBQSxTQUFTLEVBQUVxQztBQUFmLE9BQ01vQixNQUROLEVBRU1OLFVBRk4sQ0FESjtBQU1IOztBQWhVc0U7Ozs4QkFBOUQ3RixTLGlCQUNZc0csNEI7O0FBeVV6QixNQUFNQztBQUF5QztBQUFBLEVBQUcsQ0FBQztBQUMvQ0MsRUFBQUEsTUFEK0M7QUFFL0NyQyxFQUFBQSxZQUYrQztBQUcvQzdCLEVBQUFBLFFBSCtDO0FBSS9DcUMsRUFBQUE7QUFKK0MsQ0FBRCxLQUs1QztBQUNGLHNCQUFPO0FBQUksSUFBQSxTQUFTLEVBQUM7QUFBZCxLQUNGNkIsTUFBTSxDQUFDQyxHQUFQLENBQVcvQixDQUFDLElBQUk7QUFDYix3QkFBUSw2QkFBQyxTQUFEO0FBQ0osTUFBQSxHQUFHLEVBQUVBLENBQUMsQ0FBQy9DLE1BREg7QUFFSixNQUFBLFlBQVksRUFBRXdDLFlBRlY7QUFHSixNQUFBLEtBQUssRUFBRU8sQ0FISDtBQUlKLE1BQUEsUUFBUSxFQUFFcEMsUUFKTjtBQUtKLE1BQUEsT0FBTyxFQUFFcUM7QUFMTCxNQUFSO0FBT0gsR0FSQSxDQURFLENBQVA7QUFXSCxDQWpCRDs7ZUFtQmU0QixjIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5cbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvU3BhY2VTdG9yZVwiO1xuaW1wb3J0IE5vdGlmaWNhdGlvbkJhZGdlIGZyb20gXCIuLi9yb29tcy9Ob3RpZmljYXRpb25CYWRnZVwiO1xuaW1wb3J0IHtSb3ZpbmdBY2Nlc3NpYmxlQnV0dG9ufSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9yb3ZpbmcvUm92aW5nQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHtSb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbn0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvcm92aW5nL1JvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgSWNvbml6ZWRDb250ZXh0TWVudSwge1xuICAgIEljb25pemVkQ29udGV4dE1lbnVPcHRpb24sXG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QsXG59IGZyb20gXCIuLi9jb250ZXh0X21lbnVzL0ljb25pemVkQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7Q29udGV4dE1lbnVUb29sdGlwQnV0dG9ufSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9jb250ZXh0X21lbnUvQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQge3RvUmlnaHRPZn0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7XG4gICAgc2hvdWxkU2hvd1NwYWNlU2V0dGluZ3MsXG4gICAgc2hvd0FkZEV4aXN0aW5nUm9vbXMsXG4gICAgc2hvd0NyZWF0ZU5ld1Jvb20sXG4gICAgc2hvd1NwYWNlSW52aXRlLFxuICAgIHNob3dTcGFjZVNldHRpbmdzLFxufSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3BhY2VcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwge0J1dHRvbkV2ZW50fSBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCB7U2V0UmlnaHRQYW5lbFBoYXNlUGF5bG9hZH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvU2V0UmlnaHRQYW5lbFBoYXNlUGF5bG9hZFwiO1xuaW1wb3J0IHtSaWdodFBhbmVsUGhhc2VzfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1JpZ2h0UGFuZWxTdG9yZVBoYXNlc1wiO1xuaW1wb3J0IHtFdmVudFR5cGV9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7U3RhdGljTm90aWZpY2F0aW9uU3RhdGV9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9TdGF0aWNOb3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IHtOb3RpZmljYXRpb25Db2xvcn0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL05vdGlmaWNhdGlvbkNvbG9yXCI7XG5cbmludGVyZmFjZSBJSXRlbVByb3BzIHtcbiAgICBzcGFjZT86IFJvb207XG4gICAgYWN0aXZlU3BhY2VzOiBSb29tW107XG4gICAgaXNOZXN0ZWQ/OiBib29sZWFuO1xuICAgIGlzUGFuZWxDb2xsYXBzZWQ/OiBib29sZWFuO1xuICAgIG9uRXhwYW5kPzogRnVuY3Rpb247XG4gICAgcGFyZW50cz86IFNldDxzdHJpbmc+O1xufVxuXG5pbnRlcmZhY2UgSUl0ZW1TdGF0ZSB7XG4gICAgY29sbGFwc2VkOiBib29sZWFuO1xuICAgIGNvbnRleHRNZW51UG9zaXRpb246IFBpY2s8RE9NUmVjdCwgXCJyaWdodFwiIHwgXCJ0b3BcIiB8IFwiaGVpZ2h0XCI+O1xufVxuXG5leHBvcnQgY2xhc3MgU3BhY2VJdGVtIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJSXRlbVByb3BzLCBJSXRlbVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgY29sbGFwc2VkOiAhcHJvcHMuaXNOZXN0ZWQsIC8vIGRlZmF1bHQgdG8gY29sbGFwc2VkIGZvciByb290IGl0ZW1zXG4gICAgICAgICAgICBjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdG9nZ2xlQ29sbGFwc2UoZXZ0KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRXhwYW5kICYmIHRoaXMuc3RhdGUuY29sbGFwc2VkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRXhwYW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiAhdGhpcy5zdGF0ZS5jb2xsYXBzZWR9KTtcbiAgICAgICAgLy8gZG9uJ3QgYnViYmxlIHVwIHNvIGVuY2Fwc3VsYXRpbmcgYnV0dG9uIGZvciBzcGFjZVxuICAgICAgICAvLyBkb2Vzbid0IGdldCB0cmlnZ2VyZWRcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Db250ZXh0TWVudSA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zcGFjZS5nZXRNeU1lbWJlcnNoaXAoKSAhPT0gXCJqb2luXCIpIHJldHVybjtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29udGV4dE1lbnVQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIHJpZ2h0OiBldi5jbGllbnRYLFxuICAgICAgICAgICAgICAgIHRvcDogZXYuY2xpZW50WSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2Uuc2V0QWN0aXZlU3BhY2UodGhpcy5wcm9wcy5zcGFjZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NZW51T3BlbkNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldi50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTWVudUNsb3NlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25JbnZpdGVDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgc2hvd1NwYWNlSW52aXRlKHRoaXMucHJvcHMuc3BhY2UpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNldHRpbmdzQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHNob3dTcGFjZVNldHRpbmdzKHRoaXMuY29udGV4dCwgdGhpcy5wcm9wcy5zcGFjZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTGVhdmVDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcImxlYXZlX3Jvb21cIixcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMuc3BhY2Uucm9vbUlkLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25OZXdSb29tQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHNob3dDcmVhdGVOZXdSb29tKHRoaXMuY29udGV4dCwgdGhpcy5wcm9wcy5zcGFjZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkRXhpc3RpbmdSb29tQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHNob3dBZGRFeGlzdGluZ1Jvb21zKHRoaXMuY29udGV4dCwgdGhpcy5wcm9wcy5zcGFjZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbnRleHRNZW51UG9zaXRpb246IG51bGx9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTWVtYmVyc0NsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAoIVJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCkpIHtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwidmlld19yb29tXCIsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5zcGFjZS5yb29tSWQsXG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFNldFJpZ2h0UGFuZWxQaGFzZVBheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlNldFJpZ2h0UGFuZWxQaGFzZSxcbiAgICAgICAgICAgIHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLlNwYWNlTWVtYmVyTGlzdCxcbiAgICAgICAgICAgIHJlZmlyZVBhcmFtczogeyBzcGFjZTogdGhpcy5wcm9wcy5zcGFjZSB9LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y29udGV4dE1lbnVQb3NpdGlvbjogbnVsbH0pOyAvLyBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FeHBsb3JlUm9vbXNDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfcm9vbVwiLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy5zcGFjZS5yb29tSWQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJDb250ZXh0TWVudSgpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zcGFjZS5nZXRNeU1lbWJlcnNoaXAoKSAhPT0gXCJqb2luXCIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBjb250ZXh0TWVudSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuY29udGV4dC5nZXRVc2VySWQoKTtcblxuICAgICAgICAgICAgbGV0IGludml0ZU9wdGlvbjtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNwYWNlLmNhbkludml0ZSh1c2VySWQpKSB7XG4gICAgICAgICAgICAgICAgaW52aXRlT3B0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VQYW5lbF9jb250ZXh0TWVudV9pbnZpdGVCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1NwYWNlUGFuZWxfaWNvbkludml0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJJbnZpdGUgcGVvcGxlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkludml0ZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzZXR0aW5nc09wdGlvbjtcbiAgICAgICAgICAgIGxldCBsZWF2ZVNlY3Rpb247XG4gICAgICAgICAgICBpZiAoc2hvdWxkU2hvd1NwYWNlU2V0dGluZ3ModGhpcy5jb250ZXh0LCB0aGlzLnByb3BzLnNwYWNlKSkge1xuICAgICAgICAgICAgICAgIHNldHRpbmdzT3B0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1NwYWNlUGFuZWxfaWNvblNldHRpbmdzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlNldHRpbmdzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblNldHRpbmdzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGVhdmVTZWN0aW9uID0gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IHJlZCBmaXJzdD5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9TcGFjZVBhbmVsX2ljb25MZWF2ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJMZWF2ZSBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25MZWF2ZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjYW5BZGRSb29tcyA9IHRoaXMucHJvcHMuc3BhY2UuY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5TcGFjZUNoaWxkLCB1c2VySWQpO1xuXG4gICAgICAgICAgICBsZXQgbmV3Um9vbVNlY3Rpb247XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zcGFjZS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIHVzZXJJZCkpIHtcbiAgICAgICAgICAgICAgICBuZXdSb29tU2VjdGlvbiA9IDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCBmaXJzdD5cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9TcGFjZVBhbmVsX2ljb25QbHVzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkNyZWF0ZSBuZXcgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25OZXdSb29tQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfU3BhY2VQYW5lbF9pY29uSGFzaFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJBZGQgZXhpc3Rpbmcgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BZGRFeGlzdGluZ1Jvb21DbGlja31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29udGV4dE1lbnUgPSA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgIHsuLi50b1JpZ2h0T2YodGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLCAwKX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uTWVudUNsb3NlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlUGFuZWxfY29udGV4dE1lbnVcIlxuICAgICAgICAgICAgICAgIGNvbXBhY3RcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUGFuZWxfY29udGV4dE1lbnVfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5zcGFjZS5uYW1lIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICAgICAgICAgIHsgaW52aXRlT3B0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9TcGFjZVBhbmVsX2ljb25NZW1iZXJzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk1lbWJlcnNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uTWVtYmVyc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IHNldHRpbmdzT3B0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9TcGFjZVBhbmVsX2ljb25FeHBsb3JlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtjYW5BZGRSb29tcyA/IF90KFwiTWFuYWdlICYgZXhwbG9yZSByb29tc1wiKSA6IF90KFwiRXhwbG9yZSByb29tc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FeHBsb3JlUm9vbXNDbGlja31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PlxuICAgICAgICAgICAgICAgIHsgbmV3Um9vbVNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHsgbGVhdmVTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudT47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VCdXR0b25fbWVudUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25NZW51T3BlbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJTcGFjZSBvcHRpb25zXCIpfVxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXshIXRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHtzcGFjZSwgYWN0aXZlU3BhY2VzLCBpc05lc3RlZH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGNvbnN0IGZvcmNlQ29sbGFwc2VkID0gdGhpcy5wcm9wcy5pc1BhbmVsQ29sbGFwc2VkO1xuICAgICAgICBjb25zdCBpc05hcnJvdyA9IHRoaXMucHJvcHMuaXNQYW5lbENvbGxhcHNlZDtcbiAgICAgICAgY29uc3QgY29sbGFwc2VkID0gdGhpcy5zdGF0ZS5jb2xsYXBzZWQgfHwgZm9yY2VDb2xsYXBzZWQ7XG5cbiAgICAgICAgY29uc3QgY2hpbGRTcGFjZXMgPSBTcGFjZVN0b3JlLmluc3RhbmNlLmdldENoaWxkU3BhY2VzKHNwYWNlLnJvb21JZClcbiAgICAgICAgICAgIC5maWx0ZXIocyA9PiAhdGhpcy5wcm9wcy5wYXJlbnRzPy5oYXMocy5yb29tSWQpKTtcbiAgICAgICAgY29uc3QgaXNBY3RpdmUgPSBhY3RpdmVTcGFjZXMuaW5jbHVkZXMoc3BhY2UpO1xuICAgICAgICBjb25zdCBpdGVtQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgXCJteF9TcGFjZUl0ZW1cIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfU3BhY2VJdGVtX25hcnJvd1wiOiBpc05hcnJvdyxcbiAgICAgICAgICAgIFwiY29sbGFwc2VkXCI6IGNvbGxhcHNlZCxcbiAgICAgICAgICAgIFwiaGFzU3ViU3BhY2VzXCI6IGNoaWxkU3BhY2VzICYmIGNoaWxkU3BhY2VzLmxlbmd0aCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgaXNJbnZpdGUgPSBzcGFjZS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJpbnZpdGVcIjtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9TcGFjZUJ1dHRvblwiLCB7XG4gICAgICAgICAgICBteF9TcGFjZUJ1dHRvbl9hY3RpdmU6IGlzQWN0aXZlLFxuICAgICAgICAgICAgbXhfU3BhY2VCdXR0b25faGFzTWVudU9wZW46ICEhdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uLFxuICAgICAgICAgICAgbXhfU3BhY2VCdXR0b25fbmFycm93OiBpc05hcnJvdyxcbiAgICAgICAgICAgIG14X1NwYWNlQnV0dG9uX2ludml0ZTogaXNJbnZpdGUsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb25TdGF0ZSA9IGlzSW52aXRlXG4gICAgICAgICAgICA/IFN0YXRpY05vdGlmaWNhdGlvblN0YXRlLmZvclN5bWJvbChcIiFcIiwgTm90aWZpY2F0aW9uQ29sb3IuUmVkKVxuICAgICAgICAgICAgOiBTcGFjZVN0b3JlLmluc3RhbmNlLmdldE5vdGlmaWNhdGlvblN0YXRlKHNwYWNlLnJvb21JZCk7XG5cbiAgICAgICAgbGV0IGNoaWxkSXRlbXM7XG4gICAgICAgIGlmIChjaGlsZFNwYWNlcyAmJiAhY29sbGFwc2VkKSB7XG4gICAgICAgICAgICBjaGlsZEl0ZW1zID0gPFNwYWNlVHJlZUxldmVsXG4gICAgICAgICAgICAgICAgc3BhY2VzPXtjaGlsZFNwYWNlc31cbiAgICAgICAgICAgICAgICBhY3RpdmVTcGFjZXM9e2FjdGl2ZVNwYWNlc31cbiAgICAgICAgICAgICAgICBpc05lc3RlZD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBwYXJlbnRzPXtuZXcgU2V0KHRoaXMucHJvcHMucGFyZW50cykuYWRkKHRoaXMucHJvcHMuc3BhY2Uucm9vbUlkKX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5vdGlmQmFkZ2U7XG4gICAgICAgIGlmIChub3RpZmljYXRpb25TdGF0ZSkge1xuICAgICAgICAgICAgbm90aWZCYWRnZSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VQYW5lbF9iYWRnZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxOb3RpZmljYXRpb25CYWRnZSBmb3JjZUNvdW50PXtmYWxzZX0gbm90aWZpY2F0aW9uPXtub3RpZmljYXRpb25TdGF0ZX0gLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF2YXRhclNpemUgPSBpc05lc3RlZCA/IDI0IDogMzI7XG5cbiAgICAgICAgY29uc3QgdG9nZ2xlQ29sbGFwc2VCdXR0b24gPSBjaGlsZFNwYWNlcyAmJiBjaGlsZFNwYWNlcy5sZW5ndGggP1xuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUJ1dHRvbl90b2dnbGVDb2xsYXBzZVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17ZXZ0ID0+IHRoaXMudG9nZ2xlQ29sbGFwc2UoZXZ0KX1cbiAgICAgICAgICAgIC8+IDogbnVsbDtcblxuICAgICAgICBsZXQgYnV0dG9uO1xuICAgICAgICBpZiAoaXNOYXJyb3cpIHtcbiAgICAgICAgICAgIGJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8Um92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17c3BhY2UubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgIGZvcmNlSGlkZT17ISF0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb259XG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJ0cmVlaXRlbVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHRvZ2dsZUNvbGxhcHNlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUJ1dHRvbl9zZWxlY3Rpb25XcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhciB3aWR0aD17YXZhdGFyU2l6ZX0gaGVpZ2h0PXthdmF0YXJTaXplfSByb29tPXtzcGFjZX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbm90aWZCYWRnZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQ29udGV4dE1lbnUoKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxSb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJ0cmVlaXRlbVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHRvZ2dsZUNvbGxhcHNlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUJ1dHRvbl9zZWxlY3Rpb25XcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhciB3aWR0aD17YXZhdGFyU2l6ZX0gaGVpZ2h0PXthdmF0YXJTaXplfSByb29tPXtzcGFjZX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NwYWNlQnV0dG9uX25hbWVcIj57IHNwYWNlLm5hbWUgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbm90aWZCYWRnZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQ29udGV4dE1lbnUoKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17aXRlbUNsYXNzZXN9PlxuICAgICAgICAgICAgICAgIHsgYnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGNoaWxkSXRlbXMgfVxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmludGVyZmFjZSBJVHJlZUxldmVsUHJvcHMge1xuICAgIHNwYWNlczogUm9vbVtdO1xuICAgIGFjdGl2ZVNwYWNlczogUm9vbVtdO1xuICAgIGlzTmVzdGVkPzogYm9vbGVhbjtcbiAgICBwYXJlbnRzOiBTZXQ8c3RyaW5nPjtcbn1cblxuY29uc3QgU3BhY2VUcmVlTGV2ZWw6IFJlYWN0LkZDPElUcmVlTGV2ZWxQcm9wcz4gPSAoe1xuICAgIHNwYWNlcyxcbiAgICBhY3RpdmVTcGFjZXMsXG4gICAgaXNOZXN0ZWQsXG4gICAgcGFyZW50cyxcbn0pID0+IHtcbiAgICByZXR1cm4gPHVsIGNsYXNzTmFtZT1cIm14X1NwYWNlVHJlZUxldmVsXCI+XG4gICAgICAgIHtzcGFjZXMubWFwKHMgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICg8U3BhY2VJdGVtXG4gICAgICAgICAgICAgICAga2V5PXtzLnJvb21JZH1cbiAgICAgICAgICAgICAgICBhY3RpdmVTcGFjZXM9e2FjdGl2ZVNwYWNlc31cbiAgICAgICAgICAgICAgICBzcGFjZT17c31cbiAgICAgICAgICAgICAgICBpc05lc3RlZD17aXNOZXN0ZWR9XG4gICAgICAgICAgICAgICAgcGFyZW50cz17cGFyZW50c31cbiAgICAgICAgICAgIC8+KTtcbiAgICAgICAgfSl9XG4gICAgPC91bD47XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNwYWNlVHJlZUxldmVsO1xuIl19