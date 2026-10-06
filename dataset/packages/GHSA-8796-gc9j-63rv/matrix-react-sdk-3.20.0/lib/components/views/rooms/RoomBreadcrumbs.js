"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _BreadcrumbsStore = require("../../../stores/BreadcrumbsStore");

var _DecoratedRoomAvatar = _interopRequireDefault(require("../avatars/DecoratedRoomAvatar"));

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Analytics = _interopRequireDefault(require("../../../Analytics"));

var _AsyncStore = require("../../../stores/AsyncStore");

var _reactTransitionGroup = require("react-transition-group");

var _RoomListStore = _interopRequireDefault(require("../../../stores/room-list/RoomListStore"));

var _models = require("../../../stores/room-list/models");

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _Toolbar = _interopRequireDefault(require("../../../accessibility/Toolbar"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let RoomBreadcrumbs = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.RoomBreadcrumbs"), _dec(_class = (_temp = class RoomBreadcrumbs extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "isMounted", true);
    (0, _defineProperty2.default)(this, "onBreadcrumbsUpdate", () => {
      if (!this.isMounted) return; // We need to trick the CSSTransition component into updating, which means we need to
      // tell it to not animate, then to animate a moment later. This causes two updates
      // which means two renders. The skipFirst change is so that our don't-animate state
      // doesn't show the breadcrumb we're about to reveal as it causes a visual jump/jerk.
      // The second update, on the next available tick, causes the "enter" animation to start
      // again and this time we want to show the newest breadcrumb because it'll be hidden
      // off screen for the animation.

      this.setState({
        doAnimation: false,
        skipFirst: true
      });
      setTimeout(() => this.setState({
        doAnimation: true,
        skipFirst: false
      }), 0);
    });
    (0, _defineProperty2.default)(this, "viewRoom", (room
    /*: Room*/
    , index
    /*: number*/
    ) => {
      _Analytics.default.trackEvent("Breadcrumbs", "click_node", String(index));

      _dispatcher.default.dispatch({
        action: "view_room",
        room_id: room.roomId
      });
    });
    this.state = {
      doAnimation: true,
      // technically we want animation on mount, but it won't be perfect
      skipFirst: false // render the thing, as boring as it is

    };

    _BreadcrumbsStore.BreadcrumbsStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onBreadcrumbsUpdate);
  }

  componentWillUnmount() {
    this.isMounted = false;

    _BreadcrumbsStore.BreadcrumbsStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onBreadcrumbsUpdate);
  }

  render()
  /*: React.ReactElement*/
  {
    const tiles = _BreadcrumbsStore.BreadcrumbsStore.instance.rooms.map((r, i) => {
      const roomTags = _RoomListStore.default.instance.getTagsForRoom(r);

      const roomTag = roomTags.includes(_models.DefaultTagID.DM) ? _models.DefaultTagID.DM : roomTags[0];
      return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
        className: "mx_RoomBreadcrumbs_crumb",
        key: r.roomId,
        onClick: () => this.viewRoom(r, i),
        "aria-label": (0, _languageHandler._t)("Room %(name)s", {
          name: r.name
        }),
        title: r.name,
        tooltipClassName: "mx_RoomBreadcrumbs_Tooltip"
      }, /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
        room: r,
        avatarSize: 32,
        tag: roomTag,
        displayBadge: true,
        forceCount: true
      }));
    });

    if (tiles.length > 0) {
      // NOTE: The CSSTransition timeout MUST match the timeout in our CSS!
      return /*#__PURE__*/_react.default.createElement(_reactTransitionGroup.CSSTransition, {
        appear: true,
        in: this.state.doAnimation,
        timeout: 640,
        classNames: "mx_RoomBreadcrumbs"
      }, /*#__PURE__*/_react.default.createElement(_Toolbar.default, {
        className: "mx_RoomBreadcrumbs",
        "aria-label": (0, _languageHandler._t)("Recently visited rooms")
      }, tiles.slice(this.state.skipFirst ? 1 : 0)));
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomBreadcrumbs"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomBreadcrumbs_placeholder"
      }, (0, _languageHandler._t)("No recently visited rooms")));
    }
  }

}, _temp)) || _class);
exports.default = RoomBreadcrumbs;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21CcmVhZGNydW1icy50c3giXSwibmFtZXMiOlsiUm9vbUJyZWFkY3J1bWJzIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImlzTW91bnRlZCIsInNldFN0YXRlIiwiZG9BbmltYXRpb24iLCJza2lwRmlyc3QiLCJzZXRUaW1lb3V0Iiwicm9vbSIsImluZGV4IiwiQW5hbHl0aWNzIiwidHJhY2tFdmVudCIsIlN0cmluZyIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyb29tX2lkIiwicm9vbUlkIiwic3RhdGUiLCJCcmVhZGNydW1ic1N0b3JlIiwiaW5zdGFuY2UiLCJvbiIsIlVQREFURV9FVkVOVCIsIm9uQnJlYWRjcnVtYnNVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInJlbmRlciIsInRpbGVzIiwicm9vbXMiLCJtYXAiLCJyIiwiaSIsInJvb21UYWdzIiwiUm9vbUxpc3RTdG9yZSIsImdldFRhZ3NGb3JSb29tIiwicm9vbVRhZyIsImluY2x1ZGVzIiwiRGVmYXVsdFRhZ0lEIiwiRE0iLCJ2aWV3Um9vbSIsIm5hbWUiLCJsZW5ndGgiLCJzbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFpQnFCQSxlLFdBRHBCLGdEQUFxQiw2QkFBckIsQyx5QkFBRCxNQUNxQkEsZUFEckIsU0FDNkNDLGVBQU1DO0FBRG5EO0FBQ2lGO0FBRzdFQyxFQUFBQSxXQUFXLENBQUNDO0FBQUQ7QUFBQSxJQUFnQjtBQUN2QixVQUFNQSxLQUFOO0FBRHVCLHFEQUZQLElBRU87QUFBQSwrREFnQkcsTUFBTTtBQUNoQyxVQUFJLENBQUMsS0FBS0MsU0FBVixFQUFx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QUFDLG9CQUFuQjtBQUF3QyxzQkFBWSx5QkFBRyx3QkFBSDtBQUFwRCxTQUNLc0IsS0FBSyxDQUFDZSxLQUFOLENBQVksS0FBS3hCLEtBQUwsQ0FBV1osU0FBWCxHQUF1QixDQUF2QixHQUEyQixDQUF2QyxDQURMLENBSkosQ0FESjtBQVVILEtBWkQsTUFZTztBQUNILDBCQUNJO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFDSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsU0FDSyx5QkFBRywyQkFBSCxDQURMLENBREosQ0FESjtBQU9IO0FBQ0o7O0FBbkY0RSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQnJlYWRjcnVtYnNTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQnJlYWRjcnVtYnNTdG9yZVwiO1xuaW1wb3J0IERlY29yYXRlZFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvRGVjb3JhdGVkUm9vbUF2YXRhclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQW5hbHl0aWNzXCI7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcbmltcG9ydCB7IENTU1RyYW5zaXRpb24gfSBmcm9tIFwicmVhY3QtdHJhbnNpdGlvbi1ncm91cFwiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvUm9vbUxpc3RTdG9yZVwiO1xuaW1wb3J0IHsgRGVmYXVsdFRhZ0lEIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgeyBSb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4XCI7XG5pbXBvcnQgVG9vbGJhciBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9Ub29sYmFyXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIC8vIEJvdGggb2YgdGhlc2UgY29udHJvbCB0aGUgYW5pbWF0aW9uIGZvciB0aGUgYnJlYWRjcnVtYnMuIEZvciBkZXRhaWxzIG9uIHRoZVxuICAgIC8vIGFjdHVhbCBhbmltYXRpb24sIHNlZSB0aGUgQ1NTLlxuICAgIC8vXG4gICAgLy8gZG9BbmltYXRpb24gaXMgdG8gbGllIHRvIHRoZSBDU1NUcmFuc2l0aW9uIGNvbXBvbmVudCAoc2VlIG9uQnJlYWRjcnVtYnNVcGRhdGVcbiAgICAvLyBmb3IgaW5mbykuIHNraXBGaXJzdCBpcyB1c2VkIHRvIHRyeSBhbmQgcmVkdWNlIGplcmt5IGFuaW1hdGlvbiAtIGFsc28gc2VlIHRoZVxuICAgIC8vIGJyZWFkY3J1bWIgdXBkYXRlIGZ1bmN0aW9uIGZvciBpbmZvIG9uIHRoYXQuXG4gICAgZG9BbmltYXRpb246IGJvb2xlYW47XG4gICAgc2tpcEZpcnN0OiBib29sZWFuO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5Sb29tQnJlYWRjcnVtYnNcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21CcmVhZGNydW1icyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGlzTW91bnRlZCA9IHRydWU7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZG9BbmltYXRpb246IHRydWUsIC8vIHRlY2huaWNhbGx5IHdlIHdhbnQgYW5pbWF0aW9uIG9uIG1vdW50LCBidXQgaXQgd29uJ3QgYmUgcGVyZmVjdFxuICAgICAgICAgICAgc2tpcEZpcnN0OiBmYWxzZSwgLy8gcmVuZGVyIHRoZSB0aGluZywgYXMgYm9yaW5nIGFzIGl0IGlzXG4gICAgICAgIH07XG5cbiAgICAgICAgQnJlYWRjcnVtYnNTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMub25CcmVhZGNydW1ic1VwZGF0ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLmlzTW91bnRlZCA9IGZhbHNlO1xuICAgICAgICBCcmVhZGNydW1ic1N0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfRVZFTlQsIHRoaXMub25CcmVhZGNydW1ic1VwZGF0ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkJyZWFkY3J1bWJzVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNNb3VudGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gV2UgbmVlZCB0byB0cmljayB0aGUgQ1NTVHJhbnNpdGlvbiBjb21wb25lbnQgaW50byB1cGRhdGluZywgd2hpY2ggbWVhbnMgd2UgbmVlZCB0b1xuICAgICAgICAvLyB0ZWxsIGl0IHRvIG5vdCBhbmltYXRlLCB0aGVuIHRvIGFuaW1hdGUgYSBtb21lbnQgbGF0ZXIuIFRoaXMgY2F1c2VzIHR3byB1cGRhdGVzXG4gICAgICAgIC8vIHdoaWNoIG1lYW5zIHR3byByZW5kZXJzLiBUaGUgc2tpcEZpcnN0IGNoYW5nZSBpcyBzbyB0aGF0IG91ciBkb24ndC1hbmltYXRlIHN0YXRlXG4gICAgICAgIC8vIGRvZXNuJ3Qgc2hvdyB0aGUgYnJlYWRjcnVtYiB3ZSdyZSBhYm91dCB0byByZXZlYWwgYXMgaXQgY2F1c2VzIGEgdmlzdWFsIGp1bXAvamVyay5cbiAgICAgICAgLy8gVGhlIHNlY29uZCB1cGRhdGUsIG9uIHRoZSBuZXh0IGF2YWlsYWJsZSB0aWNrLCBjYXVzZXMgdGhlIFwiZW50ZXJcIiBhbmltYXRpb24gdG8gc3RhcnRcbiAgICAgICAgLy8gYWdhaW4gYW5kIHRoaXMgdGltZSB3ZSB3YW50IHRvIHNob3cgdGhlIG5ld2VzdCBicmVhZGNydW1iIGJlY2F1c2UgaXQnbGwgYmUgaGlkZGVuXG4gICAgICAgIC8vIG9mZiBzY3JlZW4gZm9yIHRoZSBhbmltYXRpb24uXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RvQW5pbWF0aW9uOiBmYWxzZSwgc2tpcEZpcnN0OiB0cnVlfSk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zZXRTdGF0ZSh7ZG9BbmltYXRpb246IHRydWUsIHNraXBGaXJzdDogZmFsc2V9KSwgMCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmlld1Jvb20gPSAocm9vbTogUm9vbSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudChcIkJyZWFkY3J1bWJzXCIsIFwiY2xpY2tfbm9kZVwiLCBTdHJpbmcoaW5kZXgpKTtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogXCJ2aWV3X3Jvb21cIiwgcm9vbV9pZDogcm9vbS5yb29tSWR9KTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBjb25zdCB0aWxlcyA9IEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uucm9vbXMubWFwKChyLCBpKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb29tVGFncyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0VGFnc0ZvclJvb20ocik7XG4gICAgICAgICAgICBjb25zdCByb29tVGFnID0gcm9vbVRhZ3MuaW5jbHVkZXMoRGVmYXVsdFRhZ0lELkRNKSA/IERlZmF1bHRUYWdJRC5ETSA6IHJvb21UYWdzWzBdO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8Um92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUJyZWFkY3J1bWJzX2NydW1iXCJcbiAgICAgICAgICAgICAgICAgICAga2V5PXtyLnJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy52aWV3Um9vbShyLCBpKX1cbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJSb29tICUobmFtZSlzXCIsIHtuYW1lOiByLm5hbWV9KX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3IubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1Jvb21CcmVhZGNydW1ic19Ub29sdGlwXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxEZWNvcmF0ZWRSb29tQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tPXtyfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyU2l6ZT17MzJ9XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc9e3Jvb21UYWd9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5QmFkZ2U9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZUNvdW50PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gTk9URTogVGhlIENTU1RyYW5zaXRpb24gdGltZW91dCBNVVNUIG1hdGNoIHRoZSB0aW1lb3V0IGluIG91ciBDU1MhXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxDU1NUcmFuc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIGFwcGVhcj17dHJ1ZX0gaW49e3RoaXMuc3RhdGUuZG9BbmltYXRpb259IHRpbWVvdXQ9ezY0MH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lcz0nbXhfUm9vbUJyZWFkY3J1bWJzJ1xuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFRvb2xiYXIgY2xhc3NOYW1lPSdteF9Sb29tQnJlYWRjcnVtYnMnIGFyaWEtbGFiZWw9e190KFwiUmVjZW50bHkgdmlzaXRlZCByb29tc1wiKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGlsZXMuc2xpY2UodGhpcy5zdGF0ZS5za2lwRmlyc3QgPyAxIDogMCl9XG4gICAgICAgICAgICAgICAgICAgIDwvVG9vbGJhcj5cbiAgICAgICAgICAgICAgICA8L0NTU1RyYW5zaXRpb24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfUm9vbUJyZWFkY3J1bWJzJz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tQnJlYWRjcnVtYnNfcGxhY2Vob2xkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIk5vIHJlY2VudGx5IHZpc2l0ZWQgcm9vbXNcIil9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==