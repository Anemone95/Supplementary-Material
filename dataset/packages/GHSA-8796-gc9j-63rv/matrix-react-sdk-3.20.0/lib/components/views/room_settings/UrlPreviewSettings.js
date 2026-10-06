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

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _actions = require("../../../dispatcher/actions");

var _SettingLevel = require("../../../settings/SettingLevel");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let UrlPreviewSettings = (_dec = (0, _replaceableComponent.replaceableComponent)("views.room_settings.UrlPreviewSettings"), _dec(_class = (_temp = _class2 = class UrlPreviewSettings extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onClickUserSettings", e => {
      e.preventDefault();
      e.stopPropagation();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
  }

  render() {
    const SettingsFlag = sdk.getComponent("elements.SettingsFlag");
    const roomId = this.props.room.roomId;

    const isEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId);

    let previewsForAccount = null;
    let previewsForRoom = null;

    if (!isEncrypted) {
      // Only show account setting state and room state setting state in non-e2ee rooms where they apply
      const accountEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ACCOUNT, "urlPreviewsEnabled");

      if (accountEnabled) {
        previewsForAccount = (0, _languageHandler._t)("You have <a>enabled</a> URL previews by default.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement("a", {
            onClick: this._onClickUserSettings,
            href: ""
          }, sub)
        });
      } else {
        previewsForAccount = (0, _languageHandler._t)("You have <a>disabled</a> URL previews by default.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement("a", {
            onClick: this._onClickUserSettings,
            href: ""
          }, sub)
        });
      }

      if (_SettingsStore.default.canSetValue("urlPreviewsEnabled", roomId, "room")) {
        previewsForRoom = /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement(SettingsFlag, {
          name: "urlPreviewsEnabled",
          level: _SettingLevel.SettingLevel.ROOM,
          roomId: roomId,
          isExplicit: true
        }));
      } else {
        let str = (0, _languageHandler._td)("URL previews are enabled by default for participants in this room.");

        if (!_SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ROOM, "urlPreviewsEnabled", roomId,
        /*explicit=*/
        true)) {
          str = (0, _languageHandler._td)("URL previews are disabled by default for participants in this room.");
        }

        previewsForRoom = /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)(str));
      }
    } else {
      previewsForAccount = (0, _languageHandler._t)("In encrypted rooms, like this one, URL previews are disabled by default to ensure that your " + "homeserver (where the previews are generated) cannot gather information about links you see in " + "this room.");
    }

    const previewsForRoomAccount =
    /*#__PURE__*/
    // in an e2ee room we use a special key to enforce per-room opt-in
    _react.default.createElement(SettingsFlag, {
      name: isEncrypted ? 'urlPreviewsEnabled_e2ee' : 'urlPreviewsEnabled',
      level: _SettingLevel.SettingLevel.ROOM_ACCOUNT,
      roomId: roomId
    });

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)('When someone puts a URL in their message, a URL preview can be shown to give more ' + 'information about that link such as the title, description, and an image from the website.')), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, previewsForAccount), previewsForRoom, /*#__PURE__*/_react.default.createElement("label", null, previewsForRoomAccount));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  room: _propTypes.default.object
}), _temp)) || _class);
exports.default = UrlPreviewSettings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21fc2V0dGluZ3MvVXJsUHJldmlld1NldHRpbmdzLmpzIl0sIm5hbWVzIjpbIlVybFByZXZpZXdTZXR0aW5ncyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiZGlzIiwiZmlyZSIsIkFjdGlvbiIsIlZpZXdVc2VyU2V0dGluZ3MiLCJyZW5kZXIiLCJTZXR0aW5nc0ZsYWciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJyb29tSWQiLCJwcm9wcyIsInJvb20iLCJpc0VuY3J5cHRlZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlzUm9vbUVuY3J5cHRlZCIsInByZXZpZXdzRm9yQWNjb3VudCIsInByZXZpZXdzRm9yUm9vbSIsImFjY291bnRFbmFibGVkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlQXQiLCJTZXR0aW5nTGV2ZWwiLCJBQ0NPVU5UIiwic3ViIiwiX29uQ2xpY2tVc2VyU2V0dGluZ3MiLCJjYW5TZXRWYWx1ZSIsIlJPT00iLCJzdHIiLCJwcmV2aWV3c0ZvclJvb21BY2NvdW50IiwiUk9PTV9BQ0NPVU5UIiwiUHJvcFR5cGVzIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxrQixXQURwQixnREFBcUIsd0NBQXJCLEMsbUNBQUQsTUFDcUJBLGtCQURyQixTQUNnREMsZUFBTUMsU0FEdEQsQ0FDZ0U7QUFBQTtBQUFBO0FBQUEsZ0VBS3BDQyxDQUFELElBQU87QUFDMUJBLE1BQUFBLENBQUMsQ0FBQ0MsY0FBRjtBQUNBRCxNQUFBQSxDQUFDLENBQUNFLGVBQUY7O0FBQ0FDLDBCQUFJQyxJQUFKLENBQVNDLGdCQUFPQyxnQkFBaEI7QUFDSCxLQVQyRDtBQUFBOztBQVc1REMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsWUFBWSxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsdUJBQWpCLENBQXJCO0FBQ0EsVUFBTUMsTUFBTSxHQUFHLEtBQUtDLEtBQUwsQ0FBV0MsSUFBWCxDQUFnQkYsTUFBL0I7O0FBQ0EsVUFBTUcsV0FBVyxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxlQUF0QixDQUFzQ04sTUFBdEMsQ0FBcEI7O0FBRUEsUUFBSU8sa0JBQWtCLEdBQUcsSUFBekI7QUFDQSxRQUFJQyxlQUFlLEdBQUcsSUFBdEI7O0FBRUEsUUFBSSxDQUFDTCxXQUFMLEVBQWtCO0FBQ2Q7QUFDQSxZQUFNTSxjQUFjLEdBQUdDLHVCQUFjQyxVQUFkLENBQXlCQywyQkFBYUMsT0FBdEMsRUFBK0Msb0JBQS9DLENBQXZCOztBQUNBLFVBQUlKLGNBQUosRUFBb0I7QUFDaEJGLFFBQUFBLGtCQUFrQixHQUNkLHlCQUFHLGtEQUFILEVBQXVELEVBQXZELEVBQTJEO0FBQ3ZELGVBQU1PLEdBQUQsaUJBQU87QUFBRyxZQUFBLE9BQU8sRUFBRSxLQUFLQyxvQkFBakI7QUFBdUMsWUFBQSxJQUFJLEVBQUM7QUFBNUMsYUFBaURELEdBQWpEO0FBRDJDLFNBQTNELENBREo7QUFLSCxPQU5ELE1BTU87QUFDSFAsUUFBQUEsa0JBQWtCLEdBQ2QseUJBQUcsbURBQUgsRUFBd0QsRUFBeEQsRUFBNEQ7QUFDeEQsZUFBTU8sR0FBRCxpQkFBTztBQUFHLFlBQUEsT0FBTyxFQUFFLEtBQUtDLG9CQUFqQjtBQUF1QyxZQUFBLElBQUksRUFBQztBQUE1QyxhQUFpREQsR0FBakQ7QUFENEMsU0FBNUQsQ0FESjtBQUtIOztBQUVELFVBQUlKLHVCQUFjTSxXQUFkLENBQTBCLG9CQUExQixFQUFnRGhCLE1BQWhELEVBQXdELE1BQXhELENBQUosRUFBcUU7QUFDakVRLFFBQUFBLGVBQWUsZ0JBQ1gseURBQ0ksNkJBQUMsWUFBRDtBQUNJLFVBQUEsSUFBSSxFQUFDLG9CQURUO0FBRUksVUFBQSxLQUFLLEVBQUVJLDJCQUFhSyxJQUZ4QjtBQUdJLFVBQUEsTUFBTSxFQUFFakIsTUFIWjtBQUlJLFVBQUEsVUFBVSxFQUFFO0FBSmhCLFVBREosQ0FESjtBQVVILE9BWEQsTUFXTztBQUNILFlBQUlrQixHQUFHLEdBQUcsMEJBQUksb0VBQUosQ0FBVjs7QUFDQSxZQUFJLENBQUNSLHVCQUFjQyxVQUFkLENBQXlCQywyQkFBYUssSUFBdEMsRUFBNEMsb0JBQTVDLEVBQWtFakIsTUFBbEU7QUFBMEU7QUFBYSxZQUF2RixDQUFMLEVBQW1HO0FBQy9Ga0IsVUFBQUEsR0FBRyxHQUFHLDBCQUFJLHFFQUFKLENBQU47QUFDSDs7QUFDRFYsUUFBQUEsZUFBZSxnQkFBSSw0Q0FBUyx5QkFBR1UsR0FBSCxDQUFULENBQW5CO0FBQ0g7QUFDSixLQW5DRCxNQW1DTztBQUNIWCxNQUFBQSxrQkFBa0IsR0FDZCx5QkFBRyxpR0FDQyxpR0FERCxHQUVDLFlBRkosQ0FESjtBQUtIOztBQUVELFVBQU1ZLHNCQUFzQjtBQUFBO0FBQUs7QUFDN0IsaUNBQUMsWUFBRDtBQUFjLE1BQUEsSUFBSSxFQUFFaEIsV0FBVyxHQUFHLHlCQUFILEdBQStCLG9CQUE5RDtBQUNJLE1BQUEsS0FBSyxFQUFFUywyQkFBYVEsWUFEeEI7QUFFSSxNQUFBLE1BQU0sRUFBRXBCO0FBRlosTUFESjs7QUFNQSx3QkFDSSx1REFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTSx5QkFBRyx1RkFDRCw0RkFERixDQUROLENBREosZUFLSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTU8sa0JBRE4sQ0FMSixFQVFNQyxlQVJOLGVBU0ksNENBQVNXLHNCQUFULENBVEosQ0FESjtBQWFIOztBQWpGMkQsQyxzREFDekM7QUFDZmpCLEVBQUFBLElBQUksRUFBRW1CLG1CQUFVQztBQURELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFRyYXZpcyBSYWxzdG9uXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQge1NldHRpbmdMZXZlbH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnJvb21fc2V0dGluZ3MuVXJsUHJldmlld1NldHRpbmdzXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcmxQcmV2aWV3U2V0dGluZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG4gICAgfTtcblxuICAgIF9vbkNsaWNrVXNlclNldHRpbmdzID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgU2V0dGluZ3NGbGFnID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNldHRpbmdzRmxhZ1wiKTtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5yb29tLnJvb21JZDtcbiAgICAgICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHJvb21JZCk7XG5cbiAgICAgICAgbGV0IHByZXZpZXdzRm9yQWNjb3VudCA9IG51bGw7XG4gICAgICAgIGxldCBwcmV2aWV3c0ZvclJvb20gPSBudWxsO1xuXG4gICAgICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgc2hvdyBhY2NvdW50IHNldHRpbmcgc3RhdGUgYW5kIHJvb20gc3RhdGUgc2V0dGluZyBzdGF0ZSBpbiBub24tZTJlZSByb29tcyB3aGVyZSB0aGV5IGFwcGx5XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50RW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgXCJ1cmxQcmV2aWV3c0VuYWJsZWRcIik7XG4gICAgICAgICAgICBpZiAoYWNjb3VudEVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBwcmV2aWV3c0ZvckFjY291bnQgPSAoXG4gICAgICAgICAgICAgICAgICAgIF90KFwiWW91IGhhdmUgPGE+ZW5hYmxlZDwvYT4gVVJMIHByZXZpZXdzIGJ5IGRlZmF1bHQuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpPT48YSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrVXNlclNldHRpbmdzfSBocmVmPScnPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZXZpZXdzRm9yQWNjb3VudCA9IChcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJZb3UgaGF2ZSA8YT5kaXNhYmxlZDwvYT4gVVJMIHByZXZpZXdzIGJ5IGRlZmF1bHQuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpPT48YSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrVXNlclNldHRpbmdzfSBocmVmPScnPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmNhblNldFZhbHVlKFwidXJsUHJldmlld3NFbmFibGVkXCIsIHJvb21JZCwgXCJyb29tXCIpKSB7XG4gICAgICAgICAgICAgICAgcHJldmlld3NGb3JSb29tID0gKFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInVybFByZXZpZXdzRW5hYmxlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ST09NfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZD17cm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXhwbGljaXQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzdHIgPSBfdGQoXCJVUkwgcHJldmlld3MgYXJlIGVuYWJsZWQgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoU2V0dGluZ0xldmVsLlJPT00sIFwidXJsUHJldmlld3NFbmFibGVkXCIsIHJvb21JZCwgLypleHBsaWNpdD0qL3RydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IF90ZChcIlVSTCBwcmV2aWV3cyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZpZXdzRm9yUm9vbSA9ICg8bGFiZWw+eyBfdChzdHIpIH08L2xhYmVsPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmV2aWV3c0ZvckFjY291bnQgPSAoXG4gICAgICAgICAgICAgICAgX3QoXCJJbiBlbmNyeXB0ZWQgcm9vbXMsIGxpa2UgdGhpcyBvbmUsIFVSTCBwcmV2aWV3cyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdCB0byBlbnN1cmUgdGhhdCB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJob21lc2VydmVyICh3aGVyZSB0aGUgcHJldmlld3MgYXJlIGdlbmVyYXRlZCkgY2Fubm90IGdhdGhlciBpbmZvcm1hdGlvbiBhYm91dCBsaW5rcyB5b3Ugc2VlIGluIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGlzIHJvb20uXCIpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJldmlld3NGb3JSb29tQWNjb3VudCA9ICggLy8gaW4gYW4gZTJlZSByb29tIHdlIHVzZSBhIHNwZWNpYWwga2V5IHRvIGVuZm9yY2UgcGVyLXJvb20gb3B0LWluXG4gICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9e2lzRW5jcnlwdGVkID8gJ3VybFByZXZpZXdzRW5hYmxlZF9lMmVlJyA6ICd1cmxQcmV2aWV3c0VuYWJsZWQnfVxuICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5UfVxuICAgICAgICAgICAgICAgIHJvb21JZD17cm9vbUlkfSAvPlxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ1doZW4gc29tZW9uZSBwdXRzIGEgVVJMIGluIHRoZWlyIG1lc3NhZ2UsIGEgVVJMIHByZXZpZXcgY2FuIGJlIHNob3duIHRvIGdpdmUgbW9yZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbmZvcm1hdGlvbiBhYm91dCB0aGF0IGxpbmsgc3VjaCBhcyB0aGUgdGl0bGUsIGRlc2NyaXB0aW9uLCBhbmQgYW4gaW1hZ2UgZnJvbSB0aGUgd2Vic2l0ZS4nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgeyBwcmV2aWV3c0ZvckFjY291bnQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgcHJldmlld3NGb3JSb29tIH1cbiAgICAgICAgICAgICAgICA8bGFiZWw+eyBwcmV2aWV3c0ZvclJvb21BY2NvdW50IH08L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19