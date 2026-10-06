"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../index"));

var _languageHandler = require("../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

/*
Copyright 2017 Vector Creations Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
class MyGroups extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      groups: null,
      error: null
    });
    (0, _defineProperty2.default)(this, "_onCreateGroupClick", () => {
      _dispatcher.default.dispatch({
        action: 'view_create_group'
      });
    });
  }

  componentDidMount() {
    this._fetch();
  }

  _fetch() {
    this.context.getJoinedGroups().then(result => {
      this.setState({
        groups: result.groups,
        error: null
      });
    }, err => {
      if (err.errcode === 'M_GUEST_ACCESS_FORBIDDEN') {
        // Indicate that the guest isn't in any groups (which should be true)
        this.setState({
          groups: [],
          error: null
        });
        return;
      }

      this.setState({
        groups: null,
        error: err
      });
    });
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const Loader = sdk.getComponent("elements.Spinner");
    const SimpleRoomHeader = sdk.getComponent('rooms.SimpleRoomHeader');
    const GroupTile = sdk.getComponent("groups.GroupTile");
    let content;
    let contentHeader;

    if (this.state.groups) {
      const groupNodes = [];
      this.state.groups.forEach(g => {
        groupNodes.push( /*#__PURE__*/_react.default.createElement(GroupTile, {
          key: g,
          groupId: g
        }));
      });
      contentHeader = groupNodes.length > 0 ? /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Your Communities')) : /*#__PURE__*/_react.default.createElement("div", null);
      content = groupNodes.length > 0 ? /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
        className: "mx_MyGroups_scrollable"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MyGroups_microcopy"
      }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Did you know: you can use communities to filter your %(brand)s experience!", {
        brand
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To set up a filter, drag a community avatar over to the filter panel on " + "the far left hand side of the screen. You can click on an avatar in the " + "filter panel at any time to see only the rooms and people associated " + "with that community."))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MyGroups_joinedGroups"
      }, groupNodes)) : /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MyGroups_placeholder"
      }, (0, _languageHandler._t)("You're not currently a member of any communities."));
    } else if (this.state.error) {
      content = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MyGroups_error"
      }, (0, _languageHandler._t)('Error whilst fetching joined communities'));
    } else {
      content = /*#__PURE__*/_react.default.createElement(Loader, null);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MyGroups"
    }, /*#__PURE__*/_react.default.createElement(SimpleRoomHeader, {
      title: (0, _languageHandler._t)("Communities"),
      icon: require("../../../res/img/icons-groups.svg")
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MyGroups_header"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MyGroups_headerCard"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_MyGroups_headerCard_button",
      onClick: this._onCreateGroupClick
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MyGroups_headerCard_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MyGroups_headerCard_header"
    }, (0, _languageHandler._t)('Create a new community')), (0, _languageHandler._t)('Create a community to group together users and rooms! ' + 'Build a custom homepage to mark out your space in the Matrix universe.')))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MyGroups_content"
    }, contentHeader, content));
  }

}

exports.default = MyGroups;
(0, _defineProperty2.default)(MyGroups, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTXlHcm91cHMuanMiXSwibmFtZXMiOlsiTXlHcm91cHMiLCJSZWFjdCIsIkNvbXBvbmVudCIsImdyb3VwcyIsImVycm9yIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJjb21wb25lbnREaWRNb3VudCIsIl9mZXRjaCIsImNvbnRleHQiLCJnZXRKb2luZWRHcm91cHMiLCJ0aGVuIiwicmVzdWx0Iiwic2V0U3RhdGUiLCJlcnIiLCJlcnJjb2RlIiwicmVuZGVyIiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJMb2FkZXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJTaW1wbGVSb29tSGVhZGVyIiwiR3JvdXBUaWxlIiwiY29udGVudCIsImNvbnRlbnRIZWFkZXIiLCJzdGF0ZSIsImdyb3VwTm9kZXMiLCJmb3JFYWNoIiwiZyIsInB1c2giLCJsZW5ndGgiLCJyZXF1aXJlIiwiX29uQ3JlYXRlR3JvdXBDbGljayIsIk1hdHJpeENsaWVudENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXZSxNQUFNQSxRQUFOLFNBQXVCQyxlQUFNQyxTQUE3QixDQUF1QztBQUFBO0FBQUE7QUFBQSxpREFHMUM7QUFDSkMsTUFBQUEsTUFBTSxFQUFFLElBREo7QUFFSkMsTUFBQUEsS0FBSyxFQUFFO0FBRkgsS0FIMEM7QUFBQSwrREFZNUIsTUFBTTtBQUN4QkMsMEJBQUlDLFFBQUosQ0FBYTtBQUFDQyxRQUFBQSxNQUFNLEVBQUU7QUFBVCxPQUFiO0FBQ0gsS0FkaUQ7QUFBQTs7QUFRbERDLEVBQUFBLGlCQUFpQixHQUFHO0FBQ2hCLFNBQUtDLE1BQUw7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STtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxTQUFTLEVBQUMsK0JBQTVCO0FBQTRELE1BQUEsT0FBTyxFQUFFLEtBQUtDO0FBQTFFLE1BREosZUFHSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ00seUJBQUcsd0JBQUgsQ0FETixDQURKLEVBSU0seUJBQ0UsMkRBQ0Esd0VBRkYsQ0FKTixDQUhKLENBREosQ0FGRyxlQWtDSDtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTVIsYUFETixFQUVNRCxPQUZOLENBbENHLENBQVA7QUF1Q0g7O0FBckhpRDs7OzhCQUFqQzFCLFEsaUJBQ0lvQyw0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gXCIuL0F1dG9IaWRlU2Nyb2xsYmFyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15R3JvdXBzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGdyb3VwczogbnVsbCxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9mZXRjaCgpO1xuICAgIH1cblxuICAgIF9vbkNyZWF0ZUdyb3VwQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndmlld19jcmVhdGVfZ3JvdXAnfSk7XG4gICAgfTtcblxuICAgIF9mZXRjaCgpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmdldEpvaW5lZEdyb3VwcygpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3JvdXBzOiByZXN1bHQuZ3JvdXBzLCBlcnJvcjogbnVsbH0pO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT09ICdNX0dVRVNUX0FDQ0VTU19GT1JCSURERU4nKSB7XG4gICAgICAgICAgICAgICAgLy8gSW5kaWNhdGUgdGhhdCB0aGUgZ3Vlc3QgaXNuJ3QgaW4gYW55IGdyb3VwcyAod2hpY2ggc2hvdWxkIGJlIHRydWUpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3JvdXBzOiBbXSwgZXJyb3I6IG51bGx9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtncm91cHM6IG51bGwsIGVycm9yOiBlcnJ9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICAgICAgY29uc3QgTG9hZGVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgIGNvbnN0IFNpbXBsZVJvb21IZWFkZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5TaW1wbGVSb29tSGVhZGVyJyk7XG4gICAgICAgIGNvbnN0IEdyb3VwVGlsZSA9IHNkay5nZXRDb21wb25lbnQoXCJncm91cHMuR3JvdXBUaWxlXCIpO1xuXG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBsZXQgY29udGVudEhlYWRlcjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZ3JvdXBzKSB7XG4gICAgICAgICAgICBjb25zdCBncm91cE5vZGVzID0gW107XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmdyb3Vwcy5mb3JFYWNoKChnKSA9PiB7XG4gICAgICAgICAgICAgICAgZ3JvdXBOb2Rlcy5wdXNoKDxHcm91cFRpbGUga2V5PXtnfSBncm91cElkPXtnfSAvPik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnRlbnRIZWFkZXIgPSBncm91cE5vZGVzLmxlbmd0aCA+IDAgPyA8aDM+eyBfdCgnWW91ciBDb21tdW5pdGllcycpIH08L2gzPiA6IDxkaXYgLz47XG4gICAgICAgICAgICBjb250ZW50ID0gZ3JvdXBOb2Rlcy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPVwibXhfTXlHcm91cHNfc2Nyb2xsYWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX21pY3JvY29weVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJEaWQgeW91IGtub3c6IHlvdSBjYW4gdXNlIGNvbW11bml0aWVzIHRvIGZpbHRlciB5b3VyICUoYnJhbmQpcyBleHBlcmllbmNlIVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRvIHNldCB1cCBhIGZpbHRlciwgZHJhZyBhIGNvbW11bml0eSBhdmF0YXIgb3ZlciB0byB0aGUgZmlsdGVyIHBhbmVsIG9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGUgZmFyIGxlZnQgaGFuZCBzaWRlIG9mIHRoZSBzY3JlZW4uIFlvdSBjYW4gY2xpY2sgb24gYW4gYXZhdGFyIGluIHRoZSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyIHBhbmVsIGF0IGFueSB0aW1lIHRvIHNlZSBvbmx5IHRoZSByb29tcyBhbmQgcGVvcGxlIGFzc29jaWF0ZWQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpdGggdGhhdCBjb21tdW5pdHkuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX2pvaW5lZEdyb3Vwc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBncm91cE5vZGVzIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9BdXRvSGlkZVNjcm9sbGJhcj4gOlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTXlHcm91cHNfcGxhY2Vob2xkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91J3JlIG5vdCBjdXJyZW50bHkgYSBtZW1iZXIgb2YgYW55IGNvbW11bml0aWVzLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTXlHcm91cHNfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7IF90KCdFcnJvciB3aGlsc3QgZmV0Y2hpbmcgam9pbmVkIGNvbW11bml0aWVzJykgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IDxMb2FkZXIgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc1wiPlxuICAgICAgICAgICAgPFNpbXBsZVJvb21IZWFkZXIgdGl0bGU9e190KFwiQ29tbXVuaXRpZXNcIil9IGljb249e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL2ljb25zLWdyb3Vwcy5zdmdcIil9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfTXlHcm91cHNfaGVhZGVyJz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX2hlYWRlckNhcmRcIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPSdteF9NeUdyb3Vwc19oZWFkZXJDYXJkX2J1dHRvbicgb25DbGljaz17dGhpcy5fb25DcmVhdGVHcm91cENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX2hlYWRlckNhcmRfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19oZWFkZXJDYXJkX2hlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0NyZWF0ZSBhIG5ldyBjb21tdW5pdHknKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NyZWF0ZSBhIGNvbW11bml0eSB0byBncm91cCB0b2dldGhlciB1c2VycyBhbmQgcm9vbXMhICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdCdWlsZCBhIGN1c3RvbSBob21lcGFnZSB0byBtYXJrIG91dCB5b3VyIHNwYWNlIGluIHRoZSBNYXRyaXggdW5pdmVyc2UuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7Lyo8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX2pvaW5Cb3ggbXhfTXlHcm91cHNfaGVhZGVyQ2FyZFwiPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9J214X015R3JvdXBzX2hlYWRlckNhcmRfYnV0dG9uJyBvbkNsaWNrPXt0aGlzLl9vbkpvaW5Hcm91cENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxUaW50YWJsZVN2ZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL2ljb25zLWNyZWF0ZS1yb29tLnN2Z1wiKX0gd2lkdGg9XCI1MFwiIGhlaWdodD1cIjUwXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX2hlYWRlckNhcmRfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19oZWFkZXJDYXJkX2hlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0pvaW4gYW4gZXhpc3RpbmcgY29tbXVuaXR5JykgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUbyBqb2luIGFuIGV4aXN0aW5nIGNvbW11bml0eSB5b3VcXCdsbCBoYXZlIHRvICcrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tub3cgaXRzIGNvbW11bml0eSBpZGVudGlmaWVyOyB0aGlzIHdpbGwgbG9vayAnK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzb21ldGhpbmcgbGlrZSA8aT4rZXhhbXBsZTptYXRyaXgub3JnPC9pPi4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJ2knOiAoc3ViKSA9PiA8aT57IHN1YiB9PC9pPiB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4qL31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgeyBjb250ZW50SGVhZGVyIH1cbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXX0=