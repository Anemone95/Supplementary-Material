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

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _matrixJsSdk = require("matrix-js-sdk");

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

var _ContextMenu = require("../../structures/ContextMenu");

/*
Copyright 2018 Vector Creations Ltd
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
class GroupInviteTileContextMenu extends _react.default.Component {
  constructor(props) {
    super(props);
    this._onClickReject = this._onClickReject.bind(this);
  }

  componentDidMount() {
    this._unmounted = false;
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _onClickReject() {
    const QuestionDialog = sdk.getComponent('dialogs.QuestionDialog');

    _Modal.default.createTrackedDialog('Reject community invite', '', QuestionDialog, {
      title: (0, _languageHandler._t)('Reject invitation'),
      description: (0, _languageHandler._t)('Are you sure you want to reject the invitation?'),
      onFinished: async shouldLeave => {
        if (!shouldLeave) return; // FIXME: controller shouldn't be loading a view :(

        const Loader = sdk.getComponent("elements.Spinner");

        const modal = _Modal.default.createDialog(Loader, null, 'mx_Dialog_spinner');

        try {
          await _GroupStore.default.leaveGroup(this.props.group.groupId);
        } catch (e) {
          console.error("Error rejecting community invite: ", e);
          const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

          _Modal.default.createTrackedDialog('Error rejecting invite', '', ErrorDialog, {
            title: (0, _languageHandler._t)("Error"),
            description: (0, _languageHandler._t)("Unable to reject invite")
          });
        } finally {
          modal.close();
        }
      }
    }); // Close the context menu


    if (this.props.onFinished) {
      this.props.onFinished();
    }
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
      className: "mx_RoomTileContextMenu_leave",
      onClick: this._onClickReject
    }, /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_RoomTileContextMenu_tag_icon",
      src: require("../../../../res/img/icon_context_delete.svg"),
      width: "15",
      height: "15",
      alt: ""
    }), (0, _languageHandler._t)('Reject')));
  }

}

exports.default = GroupInviteTileContextMenu;
(0, _defineProperty2.default)(GroupInviteTileContextMenu, "propTypes", {
  group: _propTypes.default.instanceOf(_matrixJsSdk.Group).isRequired,

  /* callback called when the menu is dismissed */
  onFinished: _propTypes.default.func
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvR3JvdXBJbnZpdGVUaWxlQ29udGV4dE1lbnUuanMiXSwibmFtZXMiOlsiR3JvdXBJbnZpdGVUaWxlQ29udGV4dE1lbnUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJfb25DbGlja1JlamVjdCIsImJpbmQiLCJjb21wb25lbnREaWRNb3VudCIsIl91bm1vdW50ZWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIlF1ZXN0aW9uRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm9uRmluaXNoZWQiLCJzaG91bGRMZWF2ZSIsIkxvYWRlciIsIm1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiR3JvdXBTdG9yZSIsImxlYXZlR3JvdXAiLCJncm91cCIsImdyb3VwSWQiLCJlIiwiY29uc29sZSIsImVycm9yIiwiRXJyb3JEaWFsb2ciLCJjbG9zZSIsInJlbmRlciIsInJlcXVpcmUiLCJQcm9wVHlwZXMiLCJpbnN0YW5jZU9mIiwiR3JvdXAiLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXZSxNQUFNQSwwQkFBTixTQUF5Q0MsZUFBTUMsU0FBL0MsQ0FBeUQ7QUFPcEVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUVBLFNBQUtDLGNBQUwsR0FBc0IsS0FBS0EsY0FBTCxDQUFvQkMsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBdEI7QUFDSDs7QUFFREMsRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEIsU0FBS0MsVUFBTCxHQUFrQixLQUFsQjtBQUNIOztBQUVEQyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQixTQUFLRCxVQUFMLEdBQWtCLElBQWxCO0FBQ0g7O0FBRURILEVBQUFBLGNBQWMsR0FBRztBQUNiLFVBQU1LLGNBQWMsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHdCQUFqQixDQUF2Qjs7QUFDQUMsbUJBQU1DLG1CQUFOLENBQTBCLHlCQUExQixFQUFxRCxFQUFyRCxFQUF5REosY0FBekQsRUFBeUU7QUFDckVLLE1BQUFBLEtBQUssRUFBRSx5QkFBRyxtQkFBSCxDQUQ4RDtBQUVyRUMsTUFBQUEsV0FBVyxFQUFFLHlCQUFHLGlEQUFILENBRndEO0FBR3JFQyxNQUFBQSxVQUFVLEVBQUUsTUFBT0MsV0FBUCxJQUF1QjtBQUMvQixZQUFJLENBQUNBLFdBQUwsRUFBa0IsT0FEYSxDQUcvQjs7QUFDQSxjQUFNQyxNQUFNLEdBQUdSLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixrQkFBakIsQ0FBZjs7QUFDQSxjQUFNUSxLQUFLLEdBQUdQLGVBQU1RLFlBQU4sQ0FBbUJGLE1BQW5CLEVBQTJCLElBQTNCLEVBQWlDLG1CQUFqQyxDQUFkOztBQUVBLFlBQUk7QUFDQSxnQkFBTUcsb0JBQVdDLFVBQVgsQ0FBc0IsS0FBS25CLEtBQUwsQ0FBV29CLEtBQVgsQ0FBaUJDLE9BQXZDLENBQU47QUFDSCxTQUZELENBRUUsT0FBT0MsQ0FBUCxFQUFVO0FBQ1JDLFVBQUFBLE9BQU8sQ0FBQ0MsS0FBUixDQUFjLG9DQUFkLEVBQW9ERixDQUFwRDtBQUNBLGdCQUFNRyxXQUFXLEdBQUdsQixHQUFHLENBQUNDLFlBQUosQ0FBaUIscUJBQWpCLENBQXBCOztBQUNBQyx5QkFBTUMsbUJBQU4sQ0FBMEIsd0JBQTFCLEVBQW9ELEVBQXBELEVBQXdEZSxXQUF4RCxFQUFxRTtBQUNqRWQsWUFBQUEsS0FBSyxFQUFFLHlCQUFHLE9BQUgsQ0FEMEQ7QUFFakVDLFlBQUFBLFdBQVcsRUFBRSx5QkFBRyx5QkFBSDtBQUZvRCxXQUFyRTtBQUlILFNBVEQsU0FTVTtBQUNOSSxVQUFBQSxLQUFLLENBQUNVLEtBQU47QUFDSDtBQUNKO0FBdEJvRSxLQUF6RSxFQUZhLENBMkJiOzs7QUFDQSxRQUFJLEtBQUsxQixLQUFMLENBQVdhLFVBQWYsRUFBMkI7QUFDdkIsV0FBS2IsS0FBTCxDQUFXYSxVQUFYO0FBQ0g7QUFDSjs7QUFFRGMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsd0JBQU8sdURBQ0gsNkJBQUMscUJBQUQ7QUFBVSxNQUFBLFNBQVMsRUFBQyw4QkFBcEI7QUFBbUQsTUFBQSxPQUFPLEVBQUUsS0FBSzFCO0FBQWpFLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUMsaUNBQWY7QUFBaUQsTUFBQSxHQUFHLEVBQUUyQixPQUFPLENBQUMsNkNBQUQsQ0FBN0Q7QUFBOEcsTUFBQSxLQUFLLEVBQUMsSUFBcEg7QUFBeUgsTUFBQSxNQUFNLEVBQUMsSUFBaEk7QUFBcUksTUFBQSxHQUFHLEVBQUM7QUFBekksTUFESixFQUVNLHlCQUFHLFFBQUgsQ0FGTixDQURHLENBQVA7QUFNSDs7QUE3RG1FOzs7OEJBQW5EaEMsMEIsZUFDRTtBQUNmd0IsRUFBQUEsS0FBSyxFQUFFUyxtQkFBVUMsVUFBVixDQUFxQkMsa0JBQXJCLEVBQTRCQyxVQURwQjs7QUFFZjtBQUNBbkIsRUFBQUEsVUFBVSxFQUFFZ0IsbUJBQVVJO0FBSFAsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHtHcm91cH0gZnJvbSAnbWF0cml4LWpzLXNkayc7XG5pbXBvcnQgR3JvdXBTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0dyb3VwU3RvcmVcIjtcbmltcG9ydCB7TWVudUl0ZW19IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwSW52aXRlVGlsZUNvbnRleHRNZW51IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBncm91cDogUHJvcFR5cGVzLmluc3RhbmNlT2YoR3JvdXApLmlzUmVxdWlyZWQsXG4gICAgICAgIC8qIGNhbGxiYWNrIGNhbGxlZCB3aGVuIHRoZSBtZW51IGlzIGRpc21pc3NlZCAqL1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuX29uQ2xpY2tSZWplY3QgPSB0aGlzLl9vbkNsaWNrUmVqZWN0LmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIF9vbkNsaWNrUmVqZWN0KCkge1xuICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuUXVlc3Rpb25EaWFsb2cnKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnUmVqZWN0IGNvbW11bml0eSBpbnZpdGUnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnUmVqZWN0IGludml0YXRpb24nKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlamVjdCB0aGUgaW52aXRhdGlvbj8nKSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IGFzeW5jIChzaG91bGRMZWF2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc2hvdWxkTGVhdmUpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBjb250cm9sbGVyIHNob3VsZG4ndCBiZSBsb2FkaW5nIGEgdmlldyA6KFxuICAgICAgICAgICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlRGlhbG9nKExvYWRlciwgbnVsbCwgJ214X0RpYWxvZ19zcGlubmVyJyk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBHcm91cFN0b3JlLmxlYXZlR3JvdXAodGhpcy5wcm9wcy5ncm91cC5ncm91cElkKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZWplY3RpbmcgY29tbXVuaXR5IGludml0ZTogXCIsIGUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdFcnJvciByZWplY3RpbmcgaW52aXRlJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlVuYWJsZSB0byByZWplY3QgaW52aXRlXCIpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENsb3NlIHRoZSBjb250ZXh0IG1lbnVcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25GaW5pc2hlZCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlQ29udGV4dE1lbnVfbGVhdmVcIiBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrUmVqZWN0fT5cbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlQ29udGV4dE1lbnVfdGFnX2ljb25cIiBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2ljb25fY29udGV4dF9kZWxldGUuc3ZnXCIpfSB3aWR0aD1cIjE1XCIgaGVpZ2h0PVwiMTVcIiBhbHQ9XCJcIiAvPlxuICAgICAgICAgICAgICAgIHsgX3QoJ1JlamVjdCcpIH1cbiAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXX0=