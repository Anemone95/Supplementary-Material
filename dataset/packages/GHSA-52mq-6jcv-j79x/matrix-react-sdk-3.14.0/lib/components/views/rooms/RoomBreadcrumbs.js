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

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class RoomBreadcrumbs extends _react.default.PureComponent
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

}

exports.default = RoomBreadcrumbs;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21CcmVhZGNydW1icy50c3giXSwibmFtZXMiOlsiUm9vbUJyZWFkY3J1bWJzIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImlzTW91bnRlZCIsInNldFN0YXRlIiwiZG9BbmltYXRpb24iLCJza2lwRmlyc3QiLCJzZXRUaW1lb3V0Iiwicm9vbSIsImluZGV4IiwiQW5hbHl0aWNzIiwidHJhY2tFdmVudCIsIlN0cmluZyIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyb29tX2lkIiwicm9vbUlkIiwic3RhdGUiLCJCcmVhZGNydW1ic1N0b3JlIiwiaW5zdGFuY2UiLCJvbiIsIlVQREFURV9FVkVOVCIsIm9uQnJlYWRjcnVtYnNVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInJlbmRlciIsInRpbGVzIiwicm9vbXMiLCJtYXAiLCJyIiwiaSIsInJvb21UYWdzIiwiUm9vbUxpc3RTdG9yZSIsImdldFRhZ3NGb3JSb29tIiwicm9vbVRhZyIsImluY2x1ZGVzIiwiRGVmYXVsdFRhZ0lEIiwiRE0iLCJ2aWV3Um9vbSIsIm5hbWUiLCJsZW5ndGgiLCJzbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQThCZSxNQUFNQSxlQUFOLFNBQThCQyxlQUFNQztBQUFwQztBQUFrRTtBQUc3RUMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZ0I7QUFDdkIsVUFBTUEsS0FBTjtBQUR1QixxREFGUCxJQUVPO0FBQUEsK0RBZ0JHLE1B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c0JBSUksNkJBQUMsZ0JBQUQ7QUFBUyxRQUFBLFNBQVMsRUFBQyxvQkFBbkI7QUFBd0Msc0JBQVkseUJBQUcsd0JBQUg7QUFBcEQsU0FDS3NCLEtBQUssQ0FBQ2UsS0FBTixDQUFZLEtBQUt4QixLQUFMLENBQVdaLFNBQVgsR0FBdUIsQ0FBdkIsR0FBMkIsQ0FBdkMsQ0FETCxDQUpKLENBREo7QUFVSCxLQVpELE1BWU87QUFDSCwwQkFDSTtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQ0sseUJBQUcsMkJBQUgsQ0FETCxDQURKLENBREo7QUFPSDtBQUNKOztBQW5GNEUiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCcmVhZGNydW1ic1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9CcmVhZGNydW1ic1N0b3JlXCI7XG5pbXBvcnQgRGVjb3JhdGVkUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9EZWNvcmF0ZWRSb29tQXZhdGFyXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gXCIuLi8uLi8uLi9BbmFseXRpY3NcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IHsgQ1NTVHJhbnNpdGlvbiB9IGZyb20gXCJyZWFjdC10cmFuc2l0aW9uLWdyb3VwXCI7XG5pbXBvcnQgUm9vbUxpc3RTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9tb2RlbHNcIjtcbmltcG9ydCB7IFJvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvUm92aW5nVGFiSW5kZXhcIjtcbmltcG9ydCBUb29sYmFyIGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L1Rvb2xiYXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIC8vIEJvdGggb2YgdGhlc2UgY29udHJvbCB0aGUgYW5pbWF0aW9uIGZvciB0aGUgYnJlYWRjcnVtYnMuIEZvciBkZXRhaWxzIG9uIHRoZVxuICAgIC8vIGFjdHVhbCBhbmltYXRpb24sIHNlZSB0aGUgQ1NTLlxuICAgIC8vXG4gICAgLy8gZG9BbmltYXRpb24gaXMgdG8gbGllIHRvIHRoZSBDU1NUcmFuc2l0aW9uIGNvbXBvbmVudCAoc2VlIG9uQnJlYWRjcnVtYnNVcGRhdGVcbiAgICAvLyBmb3IgaW5mbykuIHNraXBGaXJzdCBpcyB1c2VkIHRvIHRyeSBhbmQgcmVkdWNlIGplcmt5IGFuaW1hdGlvbiAtIGFsc28gc2VlIHRoZVxuICAgIC8vIGJyZWFkY3J1bWIgdXBkYXRlIGZ1bmN0aW9uIGZvciBpbmZvIG9uIHRoYXQuXG4gICAgZG9BbmltYXRpb246IGJvb2xlYW47XG4gICAgc2tpcEZpcnN0OiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tQnJlYWRjcnVtYnMgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBpc01vdW50ZWQgPSB0cnVlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRvQW5pbWF0aW9uOiB0cnVlLCAvLyB0ZWNobmljYWxseSB3ZSB3YW50IGFuaW1hdGlvbiBvbiBtb3VudCwgYnV0IGl0IHdvbid0IGJlIHBlcmZlY3RcbiAgICAgICAgICAgIHNraXBGaXJzdDogZmFsc2UsIC8vIHJlbmRlciB0aGUgdGhpbmcsIGFzIGJvcmluZyBhcyBpdCBpc1xuICAgICAgICB9O1xuXG4gICAgICAgIEJyZWFkY3J1bWJzU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5pc01vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgQnJlYWRjcnVtYnNTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX0VWRU5ULCB0aGlzLm9uQnJlYWRjcnVtYnNVcGRhdGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CcmVhZGNydW1ic1VwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmlzTW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gdHJpY2sgdGhlIENTU1RyYW5zaXRpb24gY29tcG9uZW50IGludG8gdXBkYXRpbmcsIHdoaWNoIG1lYW5zIHdlIG5lZWQgdG9cbiAgICAgICAgLy8gdGVsbCBpdCB0byBub3QgYW5pbWF0ZSwgdGhlbiB0byBhbmltYXRlIGEgbW9tZW50IGxhdGVyLiBUaGlzIGNhdXNlcyB0d28gdXBkYXRlc1xuICAgICAgICAvLyB3aGljaCBtZWFucyB0d28gcmVuZGVycy4gVGhlIHNraXBGaXJzdCBjaGFuZ2UgaXMgc28gdGhhdCBvdXIgZG9uJ3QtYW5pbWF0ZSBzdGF0ZVxuICAgICAgICAvLyBkb2Vzbid0IHNob3cgdGhlIGJyZWFkY3J1bWIgd2UncmUgYWJvdXQgdG8gcmV2ZWFsIGFzIGl0IGNhdXNlcyBhIHZpc3VhbCBqdW1wL2plcmsuXG4gICAgICAgIC8vIFRoZSBzZWNvbmQgdXBkYXRlLCBvbiB0aGUgbmV4dCBhdmFpbGFibGUgdGljaywgY2F1c2VzIHRoZSBcImVudGVyXCIgYW5pbWF0aW9uIHRvIHN0YXJ0XG4gICAgICAgIC8vIGFnYWluIGFuZCB0aGlzIHRpbWUgd2Ugd2FudCB0byBzaG93IHRoZSBuZXdlc3QgYnJlYWRjcnVtYiBiZWNhdXNlIGl0J2xsIGJlIGhpZGRlblxuICAgICAgICAvLyBvZmYgc2NyZWVuIGZvciB0aGUgYW5pbWF0aW9uLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHtkb0FuaW1hdGlvbjogZmFsc2UsIHNraXBGaXJzdDogdHJ1ZX0pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2V0U3RhdGUoe2RvQW5pbWF0aW9uOiB0cnVlLCBza2lwRmlyc3Q6IGZhbHNlfSksIDApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZpZXdSb29tID0gKHJvb206IFJvb20sIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgQW5hbHl0aWNzLnRyYWNrRXZlbnQoXCJCcmVhZGNydW1ic1wiLCBcImNsaWNrX25vZGVcIiwgU3RyaW5nKGluZGV4KSk7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb246IFwidmlld19yb29tXCIsIHJvb21faWQ6IHJvb20ucm9vbUlkfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgY29uc3QgdGlsZXMgPSBCcmVhZGNydW1ic1N0b3JlLmluc3RhbmNlLnJvb21zLm1hcCgociwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm9vbVRhZ3MgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldFRhZ3NGb3JSb29tKHIpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbVRhZyA9IHJvb21UYWdzLmluY2x1ZGVzKERlZmF1bHRUYWdJRC5ETSkgPyBEZWZhdWx0VGFnSUQuRE0gOiByb29tVGFnc1swXTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFJvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21CcmVhZGNydW1ic19jcnVtYlwiXG4gICAgICAgICAgICAgICAgICAgIGtleT17ci5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMudmlld1Jvb20ociwgaSl9XG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiUm9vbSAlKG5hbWUpc1wiLCB7bmFtZTogci5uYW1lfSl9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtyLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXBDbGFzc05hbWU9XCJteF9Sb29tQnJlYWRjcnVtYnNfVG9vbHRpcFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8RGVjb3JhdGVkUm9vbUF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclNpemU9ezMyfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnPXtyb29tVGFnfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheUJhZGdlPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VDb3VudD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1JvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IFRoZSBDU1NUcmFuc2l0aW9uIHRpbWVvdXQgTVVTVCBtYXRjaCB0aGUgdGltZW91dCBpbiBvdXIgQ1NTIVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8Q1NTVHJhbnNpdGlvblxuICAgICAgICAgICAgICAgICAgICBhcHBlYXI9e3RydWV9IGluPXt0aGlzLnN0YXRlLmRvQW5pbWF0aW9ufSB0aW1lb3V0PXs2NDB9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM9J214X1Jvb21CcmVhZGNydW1icydcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxUb29sYmFyIGNsYXNzTmFtZT0nbXhfUm9vbUJyZWFkY3J1bWJzJyBhcmlhLWxhYmVsPXtfdChcIlJlY2VudGx5IHZpc2l0ZWQgcm9vbXNcIil9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RpbGVzLnNsaWNlKHRoaXMuc3RhdGUuc2tpcEZpcnN0ID8gMSA6IDApfVxuICAgICAgICAgICAgICAgICAgICA8L1Rvb2xiYXI+XG4gICAgICAgICAgICAgICAgPC9DU1NUcmFuc2l0aW9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1Jvb21CcmVhZGNydW1icyc+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbUJyZWFkY3J1bWJzX3BsYWNlaG9sZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJObyByZWNlbnRseSB2aXNpdGVkIHJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=