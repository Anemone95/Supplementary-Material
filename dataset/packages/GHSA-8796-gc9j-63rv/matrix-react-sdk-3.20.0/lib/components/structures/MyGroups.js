"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let MyGroups = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.MyGroups"), _dec(_class = (_temp = _class2 = class MyGroups extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = MyGroups;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTXlHcm91cHMuanMiXSwibmFtZXMiOlsiTXlHcm91cHMiLCJSZWFjdCIsIkNvbXBvbmVudCIsImdyb3VwcyIsImVycm9yIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJjb21wb25lbnREaWRNb3VudCIsIl9mZXRjaCIsImNvbnRleHQiLCJnZXRKb2luZWRHcm91cHMiLCJ0aGVuIiwicmVzdWx0Iiwic2V0U3RhdGUiLCJlcnIiLCJlcnJjb2RlIiwicmVuZGVyIiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJMb2FkZXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJTaW1wbGVSb29tSGVhZGVyIiwiR3JvdXBUaWxlIiwiY29udGVudCIsImNvbnRlbnRIZWFkZXIiLCJzdGF0ZSIsImdyb3VwTm9kZXMiLCJmb3JFYWNoIiwiZyIsInB1c2giLCJsZW5ndGgiLCJyZXF1aXJlIiwiX29uQ3JlYXRlR3JvdXBDbGljayIsIk1hdHJpeENsaWVudENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFHcUJBLFEsV0FEcEIsZ0RBQXFCLHFCQUFyQixDLG1DQUFELE1BQ3FCQSxRQURyQixTQUNzQ0MsZUFBTUMsU0FENUMsQ0FDc0Q7QUFBQTtBQUFBO0FBQUEsaURBRzFDO0FBQ0pDLE1BQUFBLE1BQU0sRUFBRSxJQURKO0FBRUpDLE1BQUFBLEtBQUssRUFBRTtBQUZILEtBSDBDO0FBQUEsK0RBWTVCLE1BQU07QUFDeEJDLDBCQUFJQyxRQUFKLENBQWE7QUFBQ0MsUUFBQUEsTUFBTSxFQUFFO0FBQVQsT0FBYjtBQUNILEtBZGlEO0FBQUE7O0FBUWxEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQixTQUFLQyxNQUFMO0FBQ0g7O0FBTURBLEVBQUFBLE1BQU0sR0FBRztBQUNMLFNBQUtDLE9BQUws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O0FBQWtCLE1BQUEsU0FBUyxFQUFDLCtCQUE1QjtBQUE0RCxNQUFBLE9BQU8sRUFBRSxLQUFLQztBQUExRSxNQURKLGVBR0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNNLHlCQUFHLHdCQUFILENBRE4sQ0FESixFQUlNLHlCQUNFLDJEQUNBLHdFQUZGLENBSk4sQ0FISixDQURKLENBRkcsZUFrQ0g7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ01SLGFBRE4sRUFFTUQsT0FGTixDQWxDRyxDQUFQO0FBdUNIOztBQXJIaUQsQyx3REFDN0JVLDRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSBcIi4vQXV0b0hpZGVTY3JvbGxiYXJcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLk15R3JvdXBzXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNeUdyb3VwcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBncm91cHM6IG51bGwsXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5fZmV0Y2goKTtcbiAgICB9XG5cbiAgICBfb25DcmVhdGVHcm91cENsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3ZpZXdfY3JlYXRlX2dyb3VwJ30pO1xuICAgIH07XG5cbiAgICBfZmV0Y2goKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5nZXRKb2luZWRHcm91cHMoKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2dyb3VwczogcmVzdWx0Lmdyb3VwcywgZXJyb3I6IG51bGx9KTtcbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09PSAnTV9HVUVTVF9BQ0NFU1NfRk9SQklEREVOJykge1xuICAgICAgICAgICAgICAgIC8vIEluZGljYXRlIHRoYXQgdGhlIGd1ZXN0IGlzbid0IGluIGFueSBncm91cHMgKHdoaWNoIHNob3VsZCBiZSB0cnVlKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2dyb3VwczogW10sIGVycm9yOiBudWxsfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Z3JvdXBzOiBudWxsLCBlcnJvcjogZXJyfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICBjb25zdCBTaW1wbGVSb29tSGVhZGVyID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuU2ltcGxlUm9vbUhlYWRlcicpO1xuICAgICAgICBjb25zdCBHcm91cFRpbGUgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZ3JvdXBzLkdyb3VwVGlsZVwiKTtcblxuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgbGV0IGNvbnRlbnRIZWFkZXI7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmdyb3Vwcykge1xuICAgICAgICAgICAgY29uc3QgZ3JvdXBOb2RlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ncm91cHMuZm9yRWFjaCgoZykgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwTm9kZXMucHVzaCg8R3JvdXBUaWxlIGtleT17Z30gZ3JvdXBJZD17Z30gLz4pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb250ZW50SGVhZGVyID0gZ3JvdXBOb2Rlcy5sZW5ndGggPiAwID8gPGgzPnsgX3QoJ1lvdXIgQ29tbXVuaXRpZXMnKSB9PC9oMz4gOiA8ZGl2IC8+O1xuICAgICAgICAgICAgY29udGVudCA9IGdyb3VwTm9kZXMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgPEF1dG9IaWRlU2Nyb2xsYmFyIGNsYXNzTmFtZT1cIm14X015R3JvdXBzX3Njcm9sbGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19taWNyb2NvcHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRGlkIHlvdSBrbm93OiB5b3UgY2FuIHVzZSBjb21tdW5pdGllcyB0byBmaWx0ZXIgeW91ciAlKGJyYW5kKXMgZXhwZXJpZW5jZSFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUbyBzZXQgdXAgYSBmaWx0ZXIsIGRyYWcgYSBjb21tdW5pdHkgYXZhdGFyIG92ZXIgdG8gdGhlIGZpbHRlciBwYW5lbCBvbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIGZhciBsZWZ0IGhhbmQgc2lkZSBvZiB0aGUgc2NyZWVuLiBZb3UgY2FuIGNsaWNrIG9uIGFuIGF2YXRhciBpbiB0aGUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZpbHRlciBwYW5lbCBhdCBhbnkgdGltZSB0byBzZWUgb25seSB0aGUgcm9vbXMgYW5kIHBlb3BsZSBhc3NvY2lhdGVkIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aXRoIHRoYXQgY29tbXVuaXR5LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19qb2luZWRHcm91cHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXBOb2RlcyB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvQXV0b0hpZGVTY3JvbGxiYXI+IDpcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX3BsYWNlaG9sZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIllvdSdyZSBub3QgY3VycmVudGx5IGEgbWVtYmVyIG9mIGFueSBjb21tdW5pdGllcy5cIixcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X015R3JvdXBzX2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgeyBfdCgnRXJyb3Igd2hpbHN0IGZldGNoaW5nIGpvaW5lZCBjb21tdW5pdGllcycpIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8TG9hZGVyIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfTXlHcm91cHNcIj5cbiAgICAgICAgICAgIDxTaW1wbGVSb29tSGVhZGVyIHRpdGxlPXtfdChcIkNvbW11bml0aWVzXCIpfSBpY29uPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9pY29ucy1ncm91cHMuc3ZnXCIpfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X015R3JvdXBzX2hlYWRlcic+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19oZWFkZXJDYXJkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT0nbXhfTXlHcm91cHNfaGVhZGVyQ2FyZF9idXR0b24nIG9uQ2xpY2s9e3RoaXMuX29uQ3JlYXRlR3JvdXBDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19oZWFkZXJDYXJkX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTXlHcm91cHNfaGVhZGVyQ2FyZF9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdDcmVhdGUgYSBuZXcgY29tbXVuaXR5JykgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdDcmVhdGUgYSBjb21tdW5pdHkgdG8gZ3JvdXAgdG9nZXRoZXIgdXNlcnMgYW5kIHJvb21zISAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQnVpbGQgYSBjdXN0b20gaG9tZXBhZ2UgdG8gbWFyayBvdXQgeW91ciBzcGFjZSBpbiB0aGUgTWF0cml4IHVuaXZlcnNlLicsXG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgey8qPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19qb2luQm94IG14X015R3JvdXBzX2hlYWRlckNhcmRcIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPSdteF9NeUdyb3Vwc19oZWFkZXJDYXJkX2J1dHRvbicgb25DbGljaz17dGhpcy5fb25Kb2luR3JvdXBDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VGludGFibGVTdmcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9pY29ucy1jcmVhdGUtcm9vbS5zdmdcIil9IHdpZHRoPVwiNTBcIiBoZWlnaHQ9XCI1MFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NeUdyb3Vwc19oZWFkZXJDYXJkX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTXlHcm91cHNfaGVhZGVyQ2FyZF9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdKb2luIGFuIGV4aXN0aW5nIGNvbW11bml0eScpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVG8gam9pbiBhbiBleGlzdGluZyBjb21tdW5pdHkgeW91XFwnbGwgaGF2ZSB0byAnK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdrbm93IGl0cyBjb21tdW5pdHkgaWRlbnRpZmllcjsgdGhpcyB3aWxsIGxvb2sgJytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc29tZXRoaW5nIGxpa2UgPGk+K2V4YW1wbGU6bWF0cml4Lm9yZzwvaT4uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ICdpJzogKHN1YikgPT4gPGk+eyBzdWIgfTwvaT4gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+Ki99XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTXlHcm91cHNfY29udGVudFwiPlxuICAgICAgICAgICAgICAgIHsgY29udGVudEhlYWRlciB9XG4gICAgICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl19