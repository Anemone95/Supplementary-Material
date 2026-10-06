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

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../.."));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class AdvancedRoomSettingsTab extends _react.default.Component {
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

}

exports.default = AdvancedRoomSettingsTab;
(0, _defineProperty2.default)(AdvancedRoomSettingsTab, "propTypes", {
  roomId: _propTypes.default.string.isRequired,
  closeSettingsFn: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9BZHZhbmNlZFJvb21TZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJBZHZhbmNlZFJvb21TZXR0aW5nc1RhYiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImUiLCJSb29tVXBncmFkZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwicm9vbUlkIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiRGV2dG9vbHNEaWFsb2ciLCJjcmVhdGVEaWFsb2ciLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwicm9vbV9pZCIsInN0YXRlIiwib2xkUm9vbUlkIiwiZXZlbnRfaWQiLCJvbGRFdmVudElkIiwiY2xvc2VTZXR0aW5nc0ZuIiwidXBncmFkZVJlY29tbWVuZGF0aW9uIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCIsImdldFJlY29tbWVuZGVkVmVyc2lvbiIsInRoZW4iLCJ2IiwidG9tYnN0b25lIiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJhZGRpdGlvbmFsU3RhdGVDaGFuZ2VzIiwiY3JlYXRlRXZlbnQiLCJwcmVkZWNlc3NvciIsImdldENvbnRlbnQiLCJzZXRTdGF0ZSIsInVwZ3JhZGVkIiwicmVwbGFjZW1lbnRfcm9vbSIsInJlbmRlciIsImNsaWVudCIsInVuZmVkZXJhdGFibGVTZWN0aW9uIiwicm9vbVVwZ3JhZGVCdXR0b24iLCJuZWVkc1VwZ3JhZGUiLCJzdWIiLCJfdXBncmFkZVJvb20iLCJvbGRSb29tTGluayIsImhhc1ByZXZpb3VzUm9vbSIsIm5hbWUiLCJfb25PbGRSb29tQ2xpY2tlZCIsInJvb21OYW1lIiwiZ2V0VmVyc2lvbiIsIl9v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TUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FBNkMseUJBQUcsbUJBQUgsQ0FBN0MsQ0FESixlQUVJLDZCQUFDLHlCQUFEO0FBQWtCLE1BQUEsT0FBTyxFQUFFLEtBQUtVLGFBQWhDO0FBQStDLE1BQUEsSUFBSSxFQUFDO0FBQXBELE9BQ0sseUJBQUcsZUFBSCxDQURMLENBRkosQ0FuQkosQ0FESjtBQTRCSDs7QUF2SWdFOzs7OEJBQWhEekQsdUIsZUFDRTtBQUNmYSxFQUFBQSxNQUFNLEVBQUU2QyxtQkFBVUMsTUFBVixDQUFpQkMsVUFEVjtBQUVmaEMsRUFBQUEsZUFBZSxFQUFFOEIsbUJBQVVHLElBQVYsQ0FBZUQ7QUFGakIsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vLi4vLi5cIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWR2YW5jZWRSb29tU2V0dGluZ3NUYWIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb21JZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBjbG9zZVNldHRpbmdzRm46IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyBldmVudHVhbGx5IHNldCB0byB0aGUgdmFsdWUgb2Ygcm9vbS5nZXRSZWNvbW1lbmRlZFZlcnNpb24oKVxuICAgICAgICAgICAgdXBncmFkZVJlY29tbWVuZGF0aW9uOiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBNb3ZlIHRoaXMgdG8gY29uc3RydWN0b3JcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICAvLyB3ZSBoYW5kbGUgbGFjayBvZiB0aGlzIG9iamVjdCBncmFjZWZ1bGx5IGxhdGVyLCBzbyBkb24ndCB3b3JyeSBhYm91dCBpdCBmYWlsaW5nIGhlcmUuXG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIHJvb20uZ2V0UmVjb21tZW5kZWRWZXJzaW9uKCkudGhlbigodikgPT4ge1xuICAgICAgICAgICAgY29uc3QgdG9tYnN0b25lID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoXCJtLnJvb20udG9tYnN0b25lXCIsIFwiXCIpO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRpdGlvbmFsU3RhdGVDaGFuZ2VzID0ge307XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLmNyZWF0ZVwiLCBcIlwiKTtcbiAgICAgICAgICAgIGNvbnN0IHByZWRlY2Vzc29yID0gY3JlYXRlRXZlbnQgPyBjcmVhdGVFdmVudC5nZXRDb250ZW50KCkucHJlZGVjZXNzb3IgOiBudWxsO1xuICAgICAgICAgICAgaWYgKHByZWRlY2Vzc29yICYmIHByZWRlY2Vzc29yLnJvb21faWQpIHtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsU3RhdGVDaGFuZ2VzWydvbGRSb29tSWQnXSA9IHByZWRlY2Vzc29yLnJvb21faWQ7XG4gICAgICAgICAgICAgICAgYWRkaXRpb25hbFN0YXRlQ2hhbmdlc1snb2xkRXZlbnRJZCddID0gcHJlZGVjZXNzb3IuZXZlbnRfaWQ7XG4gICAgICAgICAgICAgICAgYWRkaXRpb25hbFN0YXRlQ2hhbmdlc1snaGFzUHJldmlvdXNSb29tJ10gPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwZ3JhZGVkOiB0b21ic3RvbmUgJiYgdG9tYnN0b25lLmdldENvbnRlbnQoKS5yZXBsYWNlbWVudF9yb29tLFxuICAgICAgICAgICAgICAgIHVwZ3JhZGVSZWNvbW1lbmRhdGlvbjogdixcbiAgICAgICAgICAgICAgICAuLi5hZGRpdGlvbmFsU3RhdGVDaGFuZ2VzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF91cGdyYWRlUm9vbSA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IFJvb21VcGdyYWRlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5Sb29tVXBncmFkZURpYWxvZycpO1xuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdVcGdyYWRlIFJvb20gVmVyc2lvbicsICcnLCBSb29tVXBncmFkZURpYWxvZywge3Jvb206IHJvb219KTtcbiAgICB9O1xuXG4gICAgX29wZW5EZXZ0b29scyA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IERldnRvb2xzRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgnZGlhbG9ncy5EZXZ0b29sc0RpYWxvZycpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRGV2dG9vbHNEaWFsb2csIHtyb29tSWQ6IHRoaXMucHJvcHMucm9vbUlkfSk7XG4gICAgfTtcblxuICAgIF9vbk9sZFJvb21DbGlja2VkID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5zdGF0ZS5vbGRSb29tSWQsXG4gICAgICAgICAgICBldmVudF9pZDogdGhpcy5zdGF0ZS5vbGRFdmVudElkLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5jbG9zZVNldHRpbmdzRm4oKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG5cbiAgICAgICAgbGV0IHVuZmVkZXJhdGFibGVTZWN0aW9uO1xuICAgICAgICBjb25zdCBjcmVhdGVFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20uY3JlYXRlJywgJycpO1xuICAgICAgICBpZiAoY3JlYXRlRXZlbnQgJiYgY3JlYXRlRXZlbnQuZ2V0Q29udGVudCgpWydtLmZlZGVyYXRlJ10gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB1bmZlZGVyYXRhYmxlU2VjdGlvbiA9IDxkaXY+e190KCdUaGlzIHJvb20gaXMgbm90IGFjY2Vzc2libGUgYnkgcmVtb3RlIE1hdHJpeCBzZXJ2ZXJzJyl9PC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJvb21VcGdyYWRlQnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS51cGdyYWRlUmVjb21tZW5kYXRpb24gJiYgdGhpcy5zdGF0ZS51cGdyYWRlUmVjb21tZW5kYXRpb24ubmVlZHNVcGdyYWRlICYmICF0aGlzLnN0YXRlLnVwZ3JhZGVkKSB7XG4gICAgICAgICAgICByb29tVXBncmFkZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3dhcm5pbmdUZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxiPldhcm5pbmc8L2I+OiBVcGdyYWRpbmcgYSByb29tIHdpbGwgPGk+bm90IGF1dG9tYXRpY2FsbHkgbWlncmF0ZSByb29tIG1lbWJlcnMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gdGhlIG5ldyB2ZXJzaW9uIG9mIHRoZSByb29tLjwvaT4gV2UnbGwgcG9zdCBhIGxpbmsgdG8gdGhlIG5ldyByb29tIGluIHRoZSBvbGQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmVyc2lvbiBvZiB0aGUgcm9vbSAtIHJvb20gbWVtYmVycyB3aWxsIGhhdmUgdG8gY2xpY2sgdGhpcyBsaW5rIHRvIGpvaW4gdGhlIG5ldyByb29tLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYlwiOiAoc3ViKSA9PiA8Yj57c3VifTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaVwiOiAoc3ViKSA9PiA8aT57c3VifTwvaT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fdXBncmFkZVJvb219IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiVXBncmFkZSB0aGlzIHJvb20gdG8gdGhlIHJlY29tbWVuZGVkIHJvb20gdmVyc2lvblwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvbGRSb29tTGluaztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGFzUHJldmlvdXNSb29tKSB7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IF90KFwidGhpcyByb29tXCIpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tICYmIHJvb20ubmFtZSkgbmFtZSA9IHJvb20ubmFtZTtcbiAgICAgICAgICAgIG9sZFJvb21MaW5rID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGVsZW1lbnQ9J2EnIG9uQ2xpY2s9e3RoaXMuX29uT2xkUm9vbUNsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJWaWV3IG9sZGVyIG1lc3NhZ2VzIGluICUocm9vbU5hbWUpcy5cIiwge3Jvb21OYW1lOiBuYW1lfSl9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiQWR2YW5jZWRcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIlJvb20gaW5mb3JtYXRpb25cIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e190KFwiSW50ZXJuYWwgcm9vbSBJRDpcIil9PC9zcGFuPiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge3VuZmVkZXJhdGFibGVTZWN0aW9ufVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJSb29tIHZlcnNpb25cIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e190KFwiUm9vbSB2ZXJzaW9uOlwiKX08L3NwYW4+Jm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICB7cm9vbS5nZXRWZXJzaW9uKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7b2xkUm9vbUxpbmt9XG4gICAgICAgICAgICAgICAgICAgIHtyb29tVXBncmFkZUJ1dHRvbn1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiRGV2ZWxvcGVyIG9wdGlvbnNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vcGVuRGV2dG9vbHN9IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiT3BlbiBEZXZ0b29sc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19