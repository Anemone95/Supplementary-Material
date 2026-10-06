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

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../.."));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

let AdvancedRoomSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.room.AdvancedRoomSettingsTab"), _dec(_class = (_temp = _class2 = class AdvancedRoomSettingsTab extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_upgradeRoom", e => {
      const RoomUpgradeDialog = sdk.getComponent('dialogs.RoomUpgradeDialog');

      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

      _Modal.default.createTrackedDialog('Upgrade Room Version', '', RoomUpgradeDialog, {
        room: room
      });
    });
    (0, _defineProperty2.default)(this, "_openDevtools", e => {
      const DevtoolsDialog = sdk.getComponent('dialogs.DevtoolsDialog');

      _Modal.default.createDialog(DevtoolsDialog, {
        roomId: this.props.roomId
      });
    });
    (0, _defineProperty2.default)(this, "_onOldRoomClicked", e => {
      e.preventDefault();
      e.stopPropagation();

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: this.state.oldRoomId,
        event_id: this.state.oldEventId
      });

      this.props.closeSettingsFn();
    });
    this.state = {
      // This is eventually set to the value of room.getRecommendedVersion()
      upgradeRecommendation: null
    };
  } // TODO: [REACT-WARNING] Move this to constructor


  UNSAFE_componentWillMount() {
    // eslint-disable-line camelcase
    // we handle lack of this object gracefully later, so don't worry about it failing here.
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

    room.getRecommendedVersion().then(v => {
      const tombstone = room.currentState.getStateEvents("m.room.tombstone", "");
      const additionalStateChanges = {};
      const createEvent = room.currentState.getStateEvents("m.room.create", "");
      const predecessor = createEvent ? createEvent.getContent().predecessor : null;

      if (predecessor && predecessor.room_id) {
        additionalStateChanges['oldRoomId'] = predecessor.room_id;
        additionalStateChanges['oldEventId'] = predecessor.event_id;
        additionalStateChanges['hasPreviousRoom'] = true;
      }

      this.setState(_objectSpread({
        upgraded: tombstone && tombstone.getContent().replacement_room,
        upgradeRecommendation: v
      }, additionalStateChanges));
    });
  }

  render() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(this.props.roomId);
    let unfederatableSection;
    const createEvent = room.currentState.getStateEvents('m.room.create', '');

    if (createEvent && createEvent.getContent()['m.federate'] === false) {
      unfederatableSection = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('This room is not accessible by remote Matrix servers'));
    }

    let roomUpgradeButton;

    if (this.state.upgradeRecommendation && this.state.upgradeRecommendation.needsUpgrade && !this.state.upgraded) {
      roomUpgradeButton = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", {
        className: "mx_SettingsTab_warningText"
      }, (0, _languageHandler._t)("<b>Warning</b>: Upgrading a room will <i>not automatically migrate room members " + "to the new version of the room.</i> We'll post a link to the new room in the old " + "version of the room - room members will have to click this link to join the new room.", {}, {
        "b": sub => /*#__PURE__*/_react.default.createElement("b", null, sub),
        "i": sub => /*#__PURE__*/_react.default.createElement("i", null, sub)
      })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._upgradeRoom,
        kind: "primary"
      }, (0, _languageHandler._t)("Upgrade this room to the recommended room version")));
    }

    let oldRoomLink;

    if (this.state.hasPreviousRoom) {
      let name = (0, _languageHandler._t)("this room");

      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

      if (room && room.name) name = room.name;
      oldRoomLink = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        element: "a",
        onClick: this._onOldRoomClicked
      }, (0, _languageHandler._t)("View older messages in %(roomName)s.", {
        roomName: name
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Room information")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Internal room ID:")), "\xA0", this.props.roomId), unfederatableSection), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Room version")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Room version:")), "\xA0", room.getVersion()), oldRoomLink, roomUpgradeButton), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Developer options")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._openDevtools,
      kind: "primary"
    }, (0, _languageHandler._t)("Open Devtools"))));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  roomId: _propTypes.default.string.isRequired,
  closeSettingsFn: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = AdvancedRoomSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9BZHZhbmNlZFJvb21TZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJBZHZhbmNlZFJvb21TZXR0aW5nc1RhYiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImUiLCJSb29tVXBncmFkZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwicm9vbUlkIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiRGV2dG9vbHNEaWFsb2ciLCJjcmVhdGVEaWFsb2ciLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwicm9vbV9pZCIsInN0YXRlIiwib2xkUm9vbUlkIiwiZXZlbnRfaWQiLCJvbGRFdmVudElkIiwiY2xvc2VTZXR0aW5nc0ZuIiwidXBncmFkZVJlY29tbWVuZGF0aW9uIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsImdldFJlY29tbWVuZGVkVmVyc2lvbiIsInRoZW4iLCJ2IiwidG9tYnN0b25lIiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJhZGRpdGlvbmFsU3RhdGVDaGFuZ2VzIiwiY3JlYXRlRXZlbnQiLCJwcmVkZWNlc3NvciIsImdldENvbnRlbnQiLCJzZXRTdGF0ZSIsInVwZ3JhZGVkIiwicmVwbGFjZW1lbnRfcm9vbSIsInJlbmRlciIsImNsaWVudCIsInVuZmVkZXJhdGFibGVTZWN0aW9uIiwicm9vbVVwZ3JhZGVCdXR0b24iLCJuZWVkc1VwZ3JhZGUiLCJzdWIiLCJfdXBncmFkZVJvb20iLCJvbGRSb29tTGluayIsImhhc1ByZXZpb3VzUm9vbSIsIm5hbWUiLCJfb25PbGRSb29tQ2xpY2tlZCIsInJvb21OYW1lIiwiZ2V0VmVyc2lvbiIsIl9vcGVuRGV2dG9vbHMiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7SUFHcUJBLHVCLFdBRHBCLGdEQUFxQixrREFBckIsQyxtQ0FBRCxNQUNxQkEsdUJBRHJCLFNBQ3FEQyxlQUFNQyxTQUQzRCxDQUNxRTtBQU1qRUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsd0RBa0NIQyxDQUFELElBQU87QUFDbEIsWUFBTUMsaUJBQWlCLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwyQkFBakIsQ0FBMUI7O0FBQ0EsWUFBTUMsSUFBSSxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxPQUF0QixDQUE4QixLQUFLUixLQUFMLENBQVdTLE1BQXpDLENBQWI7O0FBQ0FDLHFCQUFNQyxtQkFBTixDQUEwQixzQkFBMUIsRUFBa0QsRUFBbEQsRUFBc0RULGlCQUF0RCxFQUF5RTtBQUFDRyxRQUFBQSxJQUFJLEVBQUVBO0FBQVAsT0FBekU7QUFDSCxLQXRDa0I7QUFBQSx5REF3Q0ZKLENBQUQsSUFBTztBQUNuQixZQUFNVyxjQUFjLEdBQUdULEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix3QkFBakIsQ0FBdkI7O0FBQ0FNLHFCQUFNRyxZQUFOLENBQW1CRCxjQUFuQixFQUFtQztBQUFDSCxRQUFBQSxNQUFNLEVBQUUsS0FBS1QsS0FBTCxDQUFXUztBQUFwQixPQUFuQztBQUNILEtBM0NrQjtBQUFBLDZEQTZDRVIsQ0FBRCxJQUFPO0FBQ3ZCQSxNQUFBQSxDQUFDLENBQUNhLGNBQUY7QUFDQWIsTUFBQUEsQ0FBQyxDQUFDYyxlQUFGOztBQUVBQywwQkFBSUMsUUFBSixDQUFhO0FBQ1RDLFFBQUFBLE1BQU0sRUFBRSxXQURDO0FBRVRDLFFBQUFBLE9BQU8sRUFBRSxLQUFLQyxLQUFMLENBQVdDLFNBRlg7QUFHVEMsUUFBQUEsUUFBUSxFQUFFLEtBQUtGLEtBQUwsQ0FBV0c7QUFIWixPQUFiOztBQUtBLFdBQUt2QixLQUFMLENBQVd3QixlQUFYO0FBQ0gsS0F2RGtCO0FBR2YsU0FBS0osS0FBTCxHQUFhO0FBQ1Q7QUFDQUssTUFBQUEscUJBQXFCLEVBQUU7QUFGZCxLQUFiO0FBSUgsR0FiZ0UsQ0FlakU7OztBQUNBQyxFQUFBQSx5QkFBeUIsR0FBRztBQUFFO0FBQzFCO0FBQ0EsVUFBTXJCLElBQUksR0FBR0MsaUNBQWdCQyxHQUFoQixHQUFzQkMsT0FBdEIsQ0FBOEIsS0FBS1IsS0FBTCxDQUFXUyxNQUF6QyxDQUFiOztBQUNBSixJQUFBQSxJQUFJLENBQUNzQixxQkFBTCxHQUE2QkMsSUFBN0IsQ0FBbUNDLENBQUQsSUFBTztBQUNyQyxZQUFNQyxTQUFTLEdBQUd6QixJQUFJLENBQUMwQixZQUFMLENBQWtCQyxjQUFsQixDQUFpQyxrQkFBakMsRUFBcUQsRUFBckQsQ0FBbEI7QUFFQSxZQUFNQyxzQkFBc0IsR0FBRyxFQUEvQjtBQUNBLFlBQU1DLFdBQVcsR0FBRzdCLElBQUksQ0FBQzBCLFlBQUwsQ0FBa0JDLGNBQWxCLENBQWlDLGVBQWpDLEVBQWtELEVBQWxELENBQXBCO0FBQ0EsWUFBTUcsV0FBVyxHQUFHRCxXQUFXLEdBQUdBLFdBQVcsQ0FBQ0UsVUFBWixHQUF5QkQsV0FBNUIsR0FBMEMsSUFBekU7O0FBQ0EsVUFBSUEsV0FBVyxJQUFJQSxXQUFXLENBQUNoQixPQUEvQixFQUF3QztBQUNwQ2MsUUFBQUEsc0JBQXNCLENBQUMsV0FBRCxDQUF0QixHQUFzQ0UsV0FBVyxDQUFDaEIsT0FBbEQ7QUFDQWMsUUFBQUEsc0JBQXNCLENBQUMsWUFBRCxDQUF0QixHQUF1Q0UsV0FBVyxDQUFDYixRQUFuRDtBQUNBVyxRQUFBQSxzQkFBc0IsQ0FBQyxpQkFBRCxDQUF0QixHQUE0QyxJQUE1QztBQUNIOztBQUdELFdBQUtJLFFBQUw7QUFDSUMsUUFBQUEsUUFBUSxFQUFFUixTQUFTLElBQUlBLFNBQVMsQ0FBQ00sVUFBVixHQUF1QkcsZ0JBRGxEO0FBRUlkLFFBQUFBLHFCQUFxQixFQUFFSTtBQUYzQixTQUdPSSxzQkFIUDtBQUtILEtBbEJEO0FBbUJIOztBQXlCRE8sRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsTUFBTSxHQUFHbkMsaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLFVBQU1GLElBQUksR0FBR29DLE1BQU0sQ0FBQ2pDLE9BQVAsQ0FBZSxLQUFLUixLQUFMLENBQVdTLE1BQTFCLENBQWI7QUFFQSxRQUFJaUMsb0JBQUo7QUFDQSxVQUFNUixXQUFXLEdBQUc3QixJQUFJLENBQUMwQixZQUFMLENBQWtCQyxjQUFsQixDQUFpQyxlQUFqQyxFQUFrRCxFQUFsRCxDQUFwQjs7QUFDQSxRQUFJRSxXQUFXLElBQUlBLFdBQVcsQ0FBQ0UsVUFBWixHQUF5QixZQUF6QixNQUEyQyxLQUE5RCxFQUFxRTtBQUNqRU0sTUFBQUEsb0JBQW9CLGdCQUFHLDBDQUFNLHlCQUFHLHNEQUFILENBQU4sQ0FBdkI7QUFDSDs7QUFFRCxRQUFJQyxpQkFBSjs7QUFDQSxRQUFJLEtBQUt2QixLQUFMLENBQVdLLHFCQUFYLElBQW9DLEtBQUtMLEtBQUwsQ0FBV0sscUJBQVgsQ0FBaUNtQixZQUFyRSxJQUFxRixDQUFDLEtBQUt4QixLQUFMLENBQVdrQixRQUFyRyxFQUErRztBQUMzR0ssTUFBQUEsaUJBQWlCLGdCQUNiLHVEQUNJO0FBQUcsUUFBQSxTQUFTLEVBQUM7QUFBYixTQUNLLHlCQUNHLHFGQUNBLG1GQURBLEdBRUEsdUZBSEgsRUFJRyxFQUpILEVBSU87QUFDQSxhQUFNRSxHQUFELGlCQUFTLHdDQUFJQSxHQUFKLENBRGQ7QUFFQSxhQUFNQSxHQUFELGlCQUFTLHdDQUFJQSxHQUFKO0FBRmQsT0FKUCxDQURMLENBREosZUFZSSw2QkFBQyx5QkFBRDtBQUFrQixRQUFBLE9BQU8sRUFBRSxLQUFLQyxZQUFoQztBQUE4QyxRQUFBLElBQUksRUFBQztBQUFuRCxTQUNLLHlCQUFHLG1EQUFILENBREwsQ0FaSixDQURKO0FBa0JIOztBQUVELFFBQUlDLFdBQUo7O0FBQ0EsUUFBSSxLQUFLM0IsS0FBTCxDQUFXNEIsZUFBZixFQUFnQztBQUM1QixVQUFJQyxJQUFJLEdBQUcseUJBQUcsV0FBSCxDQUFYOztBQUNBLFlBQU01QyxJQUFJLEdBQUdDLGlDQUFnQkMsR0FBaEIsR0FBc0JDLE9BQXRCLENBQThCLEtBQUtSLEtBQUwsQ0FBV1MsTUFBekMsQ0FBYjs7QUFDQSxVQUFJSixJQUFJLElBQUlBLElBQUksQ0FBQzRDLElBQWpCLEVBQXVCQSxJQUFJLEdBQUc1QyxJQUFJLENBQUM0QyxJQUFaO0FBQ3ZCRixNQUFBQSxXQUFXLGdCQUNQLDZCQUFDLHlCQUFEO0FBQWtCLFFBQUEsT0FBTyxFQUFDLEdBQTFCO0FBQThCLFFBQUEsT0FBTyxFQUFFLEtBQUtHO0FBQTVDLFNBQ0sseUJBQUcsc0NBQUgsRUFBMkM7QUFBQ0MsUUFBQUEsUUFBUSxFQUFFRjtBQUFYLE9BQTNDLENBREwsQ0FESjtBQUtIOztBQUVELHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FBeUMseUJBQUcsVUFBSCxDQUF6QyxDQURKLGVBRUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FBNkMseUJBQUcsa0JBQUgsQ0FBN0MsQ0FESixlQUVJLHVEQUNJLDJDQUFPLHlCQUFHLG1CQUFILENBQVAsQ0FESixVQUVLLEtBQUtqRCxLQUFMLENBQVdTLE1BRmhCLENBRkosRUFNS2lDLG9CQU5MLENBRkosZUFVSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUE2Qyx5QkFBRyxjQUFILENBQTdDLENBREosZUFFSSx1REFDSSwyQ0FBTyx5QkFBRyxlQUFILENBQVAsQ0FESixVQUVLckMsSUFBSSxDQUFDK0MsVUFBTCxFQUZMLENBRkosRUFNS0wsV0FOTCxFQU9LSixpQkFQTCxDQVZKLGVBbUJJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE9BQTZDLHlCQUFHLG1CQUFILENBQTdDLENBREosZUFFSSw2QkFBQyx5QkFBRDtBQUFrQixNQUFBLE9BQU8sRUFBRSxLQUFLVSxhQUFoQztBQUErQyxNQUFBLElBQUksRUFBQztBQUFwRCxPQUNLLHlCQUFHLGVBQUgsQ0FETCxDQUZKLENBbkJKLENBREo7QUE0Qkg7O0FBdklnRSxDLHNEQUM5QztBQUNmNUMsRUFBQUEsTUFBTSxFQUFFNkMsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFY7QUFFZmhDLEVBQUFBLGVBQWUsRUFBRThCLG1CQUFVRyxJQUFWLENBQWVEO0FBRmpCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uLy4uXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MudGFicy5yb29tLkFkdmFuY2VkUm9vbVNldHRpbmdzVGFiXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZHZhbmNlZFJvb21TZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgcm9vbUlkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIGNsb3NlU2V0dGluZ3NGbjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGV2ZW50dWFsbHkgc2V0IHRvIHRoZSB2YWx1ZSBvZiByb29tLmdldFJlY29tbWVuZGVkVmVyc2lvbigpXG4gICAgICAgICAgICB1cGdyYWRlUmVjb21tZW5kYXRpb246IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIE1vdmUgdGhpcyB0byBjb25zdHJ1Y3RvclxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIC8vIHdlIGhhbmRsZSBsYWNrIG9mIHRoaXMgb2JqZWN0IGdyYWNlZnVsbHkgbGF0ZXIsIHNvIGRvbid0IHdvcnJ5IGFib3V0IGl0IGZhaWxpbmcgaGVyZS5cbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgcm9vbS5nZXRSZWNvbW1lbmRlZFZlcnNpb24oKS50aGVuKCh2KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0b21ic3RvbmUgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS50b21ic3RvbmVcIiwgXCJcIik7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZGl0aW9uYWxTdGF0ZUNoYW5nZXMgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20uY3JlYXRlXCIsIFwiXCIpO1xuICAgICAgICAgICAgY29uc3QgcHJlZGVjZXNzb3IgPSBjcmVhdGVFdmVudCA/IGNyZWF0ZUV2ZW50LmdldENvbnRlbnQoKS5wcmVkZWNlc3NvciA6IG51bGw7XG4gICAgICAgICAgICBpZiAocHJlZGVjZXNzb3IgJiYgcHJlZGVjZXNzb3Iucm9vbV9pZCkge1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxTdGF0ZUNoYW5nZXNbJ29sZFJvb21JZCddID0gcHJlZGVjZXNzb3Iucm9vbV9pZDtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsU3RhdGVDaGFuZ2VzWydvbGRFdmVudElkJ10gPSBwcmVkZWNlc3Nvci5ldmVudF9pZDtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsU3RhdGVDaGFuZ2VzWydoYXNQcmV2aW91c1Jvb20nXSA9IHRydWU7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdXBncmFkZWQ6IHRvbWJzdG9uZSAmJiB0b21ic3RvbmUuZ2V0Q29udGVudCgpLnJlcGxhY2VtZW50X3Jvb20sXG4gICAgICAgICAgICAgICAgdXBncmFkZVJlY29tbWVuZGF0aW9uOiB2LFxuICAgICAgICAgICAgICAgIC4uLmFkZGl0aW9uYWxTdGF0ZUNoYW5nZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3VwZ3JhZGVSb29tID0gKGUpID0+IHtcbiAgICAgICAgY29uc3QgUm9vbVVwZ3JhZGVEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLlJvb21VcGdyYWRlRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1VwZ3JhZGUgUm9vbSBWZXJzaW9uJywgJycsIFJvb21VcGdyYWRlRGlhbG9nLCB7cm9vbTogcm9vbX0pO1xuICAgIH07XG5cbiAgICBfb3BlbkRldnRvb2xzID0gKGUpID0+IHtcbiAgICAgICAgY29uc3QgRGV2dG9vbHNEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLkRldnRvb2xzRGlhbG9nJyk7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhEZXZ0b29sc0RpYWxvZywge3Jvb21JZDogdGhpcy5wcm9wcy5yb29tSWR9KTtcbiAgICB9O1xuXG4gICAgX29uT2xkUm9vbUNsaWNrZWQgPSAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnN0YXRlLm9sZFJvb21JZCxcbiAgICAgICAgICAgIGV2ZW50X2lkOiB0aGlzLnN0YXRlLm9sZEV2ZW50SWQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLmNsb3NlU2V0dGluZ3NGbigpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcblxuICAgICAgICBsZXQgdW5mZWRlcmF0YWJsZVNlY3Rpb247XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5jcmVhdGUnLCAnJyk7XG4gICAgICAgIGlmIChjcmVhdGVFdmVudCAmJiBjcmVhdGVFdmVudC5nZXRDb250ZW50KClbJ20uZmVkZXJhdGUnXSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHVuZmVkZXJhdGFibGVTZWN0aW9uID0gPGRpdj57X3QoJ1RoaXMgcm9vbSBpcyBub3QgYWNjZXNzaWJsZSBieSByZW1vdGUgTWF0cml4IHNlcnZlcnMnKX08L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcm9vbVVwZ3JhZGVCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnVwZ3JhZGVSZWNvbW1lbmRhdGlvbiAmJiB0aGlzLnN0YXRlLnVwZ3JhZGVSZWNvbW1lbmRhdGlvbi5uZWVkc1VwZ3JhZGUgJiYgIXRoaXMuc3RhdGUudXBncmFkZWQpIHtcbiAgICAgICAgICAgIHJvb21VcGdyYWRlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfd2FybmluZ1RleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPGI+V2FybmluZzwvYj46IFVwZ3JhZGluZyBhIHJvb20gd2lsbCA8aT5ub3QgYXV0b21hdGljYWxseSBtaWdyYXRlIHJvb20gbWVtYmVycyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0byB0aGUgbmV3IHZlcnNpb24gb2YgdGhlIHJvb20uPC9pPiBXZSdsbCBwb3N0IGEgbGluayB0byB0aGUgbmV3IHJvb20gaW4gdGhlIG9sZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2ZXJzaW9uIG9mIHRoZSByb29tIC0gcm9vbSBtZW1iZXJzIHdpbGwgaGF2ZSB0byBjbGljayB0aGlzIGxpbmsgdG8gam9pbiB0aGUgbmV3IHJvb20uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiXCI6IChzdWIpID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpXCI6IChzdWIpID0+IDxpPntzdWJ9PC9pPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl91cGdyYWRlUm9vbX0ga2luZD0ncHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJVcGdyYWRlIHRoaXMgcm9vbSB0byB0aGUgcmVjb21tZW5kZWQgcm9vbSB2ZXJzaW9uXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9sZFJvb21MaW5rO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5oYXNQcmV2aW91c1Jvb20pIHtcbiAgICAgICAgICAgIGxldCBuYW1lID0gX3QoXCJ0aGlzIHJvb21cIik7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICAgICAgaWYgKHJvb20gJiYgcm9vbS5uYW1lKSBuYW1lID0gcm9vbS5uYW1lO1xuICAgICAgICAgICAgb2xkUm9vbUxpbmsgPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gZWxlbWVudD0nYScgb25DbGljaz17dGhpcy5fb25PbGRSb29tQ2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlZpZXcgb2xkZXIgbWVzc2FnZXMgaW4gJShyb29tTmFtZSlzLlwiLCB7cm9vbU5hbWU6IG5hbWV9KX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJBZHZhbmNlZFwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiUm9vbSBpbmZvcm1hdGlvblwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXCJJbnRlcm5hbCByb29tIElEOlwiKX08L3NwYW4+Jm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7dW5mZWRlcmF0YWJsZVNlY3Rpb259XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIlJvb20gdmVyc2lvblwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXCJSb29tIHZlcnNpb246XCIpfTwvc3Bhbj4mbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtyb29tLmdldFZlcnNpb24oKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtvbGRSb29tTGlua31cbiAgICAgICAgICAgICAgICAgICAge3Jvb21VcGdyYWRlQnV0dG9ufVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJEZXZlbG9wZXIgb3B0aW9uc1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29wZW5EZXZ0b29sc30ga2luZD0ncHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJPcGVuIERldnRvb2xzXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=