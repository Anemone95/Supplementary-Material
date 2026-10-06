"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _languageHandler = require("../../../languageHandler");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _ContextMenu = require("../../structures/ContextMenu");

var _createRoom = _interopRequireWildcard(require("../../../createRoom"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _SpaceBasicSettings = _interopRequireDefault(require("./SpaceBasicSettings"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _reactFocusLock = _interopRequireDefault(require("react-focus-lock"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const SpaceCreateMenuType = ({
  title,
  description,
  className,
  onClick
}) => {
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: (0, _classnames.default)("mx_SpaceCreateMenuType", className),
    onClick: onClick
  }, /*#__PURE__*/_react.default.createElement("h3", null, title), /*#__PURE__*/_react.default.createElement("span", null, description));
};

var Visibility;

(function (Visibility) {
  Visibility[Visibility["Public"] = 0] = "Public";
  Visibility[Visibility["Private"] = 1] = "Private";
})(Visibility || (Visibility = {}));

const SpaceCreateMenu = ({
  onFinished
}) => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [visibility, setVisibility] = (0, _react.useState)(null);
  const [name, setName] = (0, _react.useState)("");
  const [avatar, setAvatar] = (0, _react.useState)(null);
  const [topic, setTopic] = (0, _react.useState)("");
  const [busy, setBusy] = (0, _react.useState)(false);

  const onSpaceCreateClick = async () => {
    if (busy) return;
    setBusy(true);
    const initialState
    /*: IStateEvent[]*/
    = [{
      type: _event.EventType.RoomHistoryVisibility,
      content: {
        "history_visibility": visibility === Visibility.Public ? "world_readable" : "invited"
      }
    }];

    if (avatar) {
      const url = await cli.uploadContent(avatar);
      initialState.push({
        type: _event.EventType.RoomAvatar,
        content: {
          url
        }
      });
    }

    if (topic) {
      initialState.push({
        type: _event.EventType.RoomTopic,
        content: {
          topic
        }
      });
    }

    try {
      await (0, _createRoom.default)({
        createOpts: {
          preset: visibility === Visibility.Public ? _createRoom.Preset.PublicChat : _createRoom.Preset.PrivateChat,
          name,
          creation_content: {
            // Based on MSC1840
            [_event.RoomCreateTypeField]: _event.RoomType.Space
          },
          initial_state: initialState,
          power_level_content_override: _objectSpread({
            // Only allow Admins to write to the timeline to prevent hidden sync spam
            events_default: 100
          }, Visibility.Public ? {
            invite: 0
          } : {})
        },
        spinner: false,
        encryption: false,
        andView: true,
        inlineErrors: true
      });
      onFinished();
    } catch (e) {
      console.error(e);
    }
  };

  let body;

  if (visibility === null) {
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Create a space")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Spaces are new ways to group rooms and people. " + "To join an existing space you'll need an invite.")), /*#__PURE__*/_react.default.createElement(SpaceCreateMenuType, {
      title: (0, _languageHandler._t)("Public"),
      description: (0, _languageHandler._t)("Open space for anyone, best for communities"),
      className: "mx_SpaceCreateMenuType_public",
      onClick: () => setVisibility(Visibility.Public)
    }), /*#__PURE__*/_react.default.createElement(SpaceCreateMenuType, {
      title: (0, _languageHandler._t)("Private"),
      description: (0, _languageHandler._t)("Invite only, best for yourself or teams"),
      className: "mx_SpaceCreateMenuType_private",
      onClick: () => setVisibility(Visibility.Private)
    }), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You can change this later")));
  } else {
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_SpaceCreateMenu_back",
      onClick: () => setVisibility(null),
      title: (0, _languageHandler._t)("Go back")
    }), /*#__PURE__*/_react.default.createElement("h2", null, visibility === Visibility.Public ? (0, _languageHandler._t)("Your public space") : (0, _languageHandler._t)("Your private space")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Add some details to help people recognise it."), " ", (0, _languageHandler._t)("You can change these anytime.")), /*#__PURE__*/_react.default.createElement(_SpaceBasicSettings.default, {
      setAvatar: setAvatar,
      name: name,
      setName: setName,
      topic: topic,
      setTopic: setTopic
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: onSpaceCreateClick,
      disabled: !name || busy
    }, busy ? (0, _languageHandler._t)("Creating...") : (0, _languageHandler._t)("Create")));
  }

  return /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, {
    left: 72,
    top: 62,
    chevronOffset: 0,
    chevronFace: _ContextMenu.ChevronFace.None,
    onFinished: onFinished,
    wrapperClassName: "mx_SpaceCreateMenu_wrapper",
    managed: false
  }, /*#__PURE__*/_react.default.createElement(_reactFocusLock.default, {
    returnFocus: true
  }, body));
};

var _default = SpaceCreateMenu;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NwYWNlcy9TcGFjZUNyZWF0ZU1lbnUudHN4Il0sIm5hbWVzIjpbIlNwYWNlQ3JlYXRlTWVudVR5cGUiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiY2xhc3NOYW1lIiwib25DbGljayIsIlZpc2liaWxpdHkiLCJTcGFjZUNyZWF0ZU1lbnUiLCJvbkZpbmlzaGVkIiwiY2xpIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsInZpc2liaWxpdHkiLCJzZXRWaXNpYmlsaXR5IiwibmFtZSIsInNldE5hbWUiLCJhdmF0YXIiLCJzZXRBdmF0YXIiLCJ0b3BpYyIsInNldFRvcGljIiwiYnVzeSIsInNldEJ1c3kiLCJvblNwYWNlQ3JlYXRlQ2xpY2siLCJpbml0aWFsU3RhdGUiLCJ0eXBlIiwiRXZlbnRUeXBlIiwiUm9vbUhpc3RvcnlWaXNpYmlsaXR5IiwiY29udGVudCIsIlB1YmxpYyIsInVybCIsInVwbG9hZENvbnRlbnQiLCJwdXNoIiwiUm9vbUF2YXRhciIsIlJvb21Ub3BpYyIsImNyZWF0ZU9wdHMiLCJwcmVzZXQiLCJQcmVzZXQiLCJQdWJsaWNDaGF0IiwiUHJpdmF0ZUNoYXQiLCJjcmVhdGlvbl9jb250ZW50IiwiUm9vbUNyZWF0ZVR5cGVGaWVsZCIsIlJvb21UeXBlIiwiU3BhY2UiLCJpbml0aWFsX3N0YXRlIiwicG93ZXJfbGV2ZWxfY29udGVudF9vdmVycmlkZSIsImV2ZW50c19kZWZhdWx0IiwiaW52aXRlIiwic3Bpbm5lciIsImVuY3J5cHRpb24iLCJhbmRWaWV3IiwiaW5saW5lRXJyb3JzIiwiZSIsImNvbnNvbGUiLCJlcnJvciIsImJvZHkiLCJQcml2YXRlIiwiQ2hldnJvbkZhY2UiLCJOb25lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxtQkFB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dGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHt1c2VDb250ZXh0LCB1c2VTdGF0ZX0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHtFdmVudFR5cGUsIFJvb21UeXBlLCBSb29tQ3JlYXRlVHlwZUZpZWxkfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5cbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7Q2hldnJvbkZhY2UsIENvbnRleHRNZW51fSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IGNyZWF0ZVJvb20sIHtJU3RhdGVFdmVudCwgUHJlc2V0fSBmcm9tIFwiLi4vLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBTcGFjZUJhc2ljU2V0dGluZ3MgZnJvbSBcIi4vU3BhY2VCYXNpY1NldHRpbmdzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEZvY3VzTG9jayBmcm9tIFwicmVhY3QtZm9jdXMtbG9ja1wiO1xuXG5jb25zdCBTcGFjZUNyZWF0ZU1lbnVUeXBlID0gKHsgdGl0bGUsIGRlc2NyaXB0aW9uLCBjbGFzc05hbWUsIG9uQ2xpY2sgfSkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1NwYWNlQ3JlYXRlTWVudVR5cGVcIiwgY2xhc3NOYW1lKX0gb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAgICA8aDM+eyB0aXRsZSB9PC9oMz5cbiAgICAgICAgICAgIDxzcGFuPnsgZGVzY3JpcHRpb24gfTwvc3Bhbj5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG59O1xuXG5lbnVtIFZpc2liaWxpdHkge1xuICAgIFB1YmxpYyxcbiAgICBQcml2YXRlLFxufVxuXG5jb25zdCBTcGFjZUNyZWF0ZU1lbnUgPSAoeyBvbkZpbmlzaGVkIH0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IFt2aXNpYmlsaXR5LCBzZXRWaXNpYmlsaXR5XSA9IHVzZVN0YXRlPFZpc2liaWxpdHk+KG51bGwpO1xuICAgIGNvbnN0IFtuYW1lLCBzZXROYW1lXSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IFthdmF0YXIsIHNldEF2YXRhcl0gPSB1c2VTdGF0ZTxGaWxlPihudWxsKTtcbiAgICBjb25zdCBbdG9waWMsIHNldFRvcGljXSA9IHVzZVN0YXRlPHN0cmluZz4oXCJcIik7XG4gICAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGU8Ym9vbGVhbj4oZmFsc2UpO1xuXG4gICAgY29uc3Qgb25TcGFjZUNyZWF0ZUNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoYnVzeSkgcmV0dXJuO1xuICAgICAgICBzZXRCdXN5KHRydWUpO1xuICAgICAgICBjb25zdCBpbml0aWFsU3RhdGU6IElTdGF0ZUV2ZW50W10gPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHlwZTogRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIFwiaGlzdG9yeV92aXNpYmlsaXR5XCI6IHZpc2liaWxpdHkgPT09IFZpc2liaWxpdHkuUHVibGljID8gXCJ3b3JsZF9yZWFkYWJsZVwiIDogXCJpbnZpdGVkXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG4gICAgICAgIGlmIChhdmF0YXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGF3YWl0IGNsaS51cGxvYWRDb250ZW50KGF2YXRhcik7XG5cbiAgICAgICAgICAgIGluaXRpYWxTdGF0ZS5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFdmVudFR5cGUuUm9vbUF2YXRhcixcbiAgICAgICAgICAgICAgICBjb250ZW50OiB7IHVybCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvcGljKSB7XG4gICAgICAgICAgICBpbml0aWFsU3RhdGUucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRXZlbnRUeXBlLlJvb21Ub3BpYyxcbiAgICAgICAgICAgICAgICBjb250ZW50OiB7IHRvcGljIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjcmVhdGVSb29tKHtcbiAgICAgICAgICAgICAgICBjcmVhdGVPcHRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHByZXNldDogdmlzaWJpbGl0eSA9PT0gVmlzaWJpbGl0eS5QdWJsaWMgPyBQcmVzZXQuUHVibGljQ2hhdCA6IFByZXNldC5Qcml2YXRlQ2hhdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRpb25fY29udGVudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmFzZWQgb24gTVNDMTg0MFxuICAgICAgICAgICAgICAgICAgICAgICAgW1Jvb21DcmVhdGVUeXBlRmllbGRdOiBSb29tVHlwZS5TcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbF9zdGF0ZTogaW5pdGlhbFN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBwb3dlcl9sZXZlbF9jb250ZW50X292ZXJyaWRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IGFsbG93IEFkbWlucyB0byB3cml0ZSB0byB0aGUgdGltZWxpbmUgdG8gcHJldmVudCBoaWRkZW4gc3luYyBzcGFtXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHNfZGVmYXVsdDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uVmlzaWJpbGl0eS5QdWJsaWMgPyB7IGludml0ZTogMCB9IDoge30sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzcGlubmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbmNyeXB0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhbmRWaWV3OiB0cnVlLFxuICAgICAgICAgICAgICAgIGlubGluZUVycm9yczogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IGJvZHk7XG4gICAgaWYgKHZpc2liaWxpdHkgPT09IG51bGwpIHtcbiAgICAgICAgYm9keSA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxoMj57IF90KFwiQ3JlYXRlIGEgc3BhY2VcIikgfTwvaDI+XG4gICAgICAgICAgICA8cD57IF90KFwiU3BhY2VzIGFyZSBuZXcgd2F5cyB0byBncm91cCByb29tcyBhbmQgcGVvcGxlLiBcIiArXG4gICAgICAgICAgICAgICAgXCJUbyBqb2luIGFuIGV4aXN0aW5nIHNwYWNlIHlvdSdsbCBuZWVkIGFuIGludml0ZS5cIikgfTwvcD5cblxuICAgICAgICAgICAgPFNwYWNlQ3JlYXRlTWVudVR5cGVcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJQdWJsaWNcIil9XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb249e190KFwiT3BlbiBzcGFjZSBmb3IgYW55b25lLCBiZXN0IGZvciBjb21tdW5pdGllc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUNyZWF0ZU1lbnVUeXBlX3B1YmxpY1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VmlzaWJpbGl0eShWaXNpYmlsaXR5LlB1YmxpYyl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFNwYWNlQ3JlYXRlTWVudVR5cGVcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJQcml2YXRlXCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdChcIkludml0ZSBvbmx5LCBiZXN0IGZvciB5b3Vyc2VsZiBvciB0ZWFtc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUNyZWF0ZU1lbnVUeXBlX3ByaXZhdGVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFZpc2liaWxpdHkoVmlzaWJpbGl0eS5Qcml2YXRlKX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxwPnsgX3QoXCJZb3UgY2FuIGNoYW5nZSB0aGlzIGxhdGVyXCIpIH08L3A+XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUNyZWF0ZU1lbnVfYmFja1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VmlzaWJpbGl0eShudWxsKX1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJHbyBiYWNrXCIpfVxuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgPGgyPlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eSA9PT0gVmlzaWJpbGl0eS5QdWJsaWMgPyBfdChcIllvdXIgcHVibGljIHNwYWNlXCIpIDogX3QoXCJZb3VyIHByaXZhdGUgc3BhY2VcIilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2gyPlxuICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBfdChcIkFkZCBzb21lIGRldGFpbHMgdG8gaGVscCBwZW9wbGUgcmVjb2duaXNlIGl0LlwiKVxuICAgICAgICAgICAgICAgIH0ge1xuICAgICAgICAgICAgICAgICAgICBfdChcIllvdSBjYW4gY2hhbmdlIHRoZXNlIGFueXRpbWUuXCIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICA8U3BhY2VCYXNpY1NldHRpbmdzIHNldEF2YXRhcj17c2V0QXZhdGFyfSBuYW1lPXtuYW1lfSBzZXROYW1lPXtzZXROYW1lfSB0b3BpYz17dG9waWN9IHNldFRvcGljPXtzZXRUb3BpY30gLz5cblxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXtvblNwYWNlQ3JlYXRlQ2xpY2t9IGRpc2FibGVkPXshbmFtZSB8fCBidXN5fT5cbiAgICAgICAgICAgICAgICB7IGJ1c3kgPyBfdChcIkNyZWF0aW5nLi4uXCIpIDogX3QoXCJDcmVhdGVcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9XG5cbiAgICByZXR1cm4gPENvbnRleHRNZW51XG4gICAgICAgIGxlZnQ9ezcyfVxuICAgICAgICB0b3A9ezYyfVxuICAgICAgICBjaGV2cm9uT2Zmc2V0PXswfVxuICAgICAgICBjaGV2cm9uRmFjZT17Q2hldnJvbkZhY2UuTm9uZX1cbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAgICAgd3JhcHBlckNsYXNzTmFtZT1cIm14X1NwYWNlQ3JlYXRlTWVudV93cmFwcGVyXCJcbiAgICAgICAgbWFuYWdlZD17ZmFsc2V9XG4gICAgPlxuICAgICAgICA8Rm9jdXNMb2NrIHJldHVybkZvY3VzPXt0cnVlfT5cbiAgICAgICAgICAgIHsgYm9keSB9XG4gICAgICAgIDwvRm9jdXNMb2NrPlxuICAgIDwvQ29udGV4dE1lbnU+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBTcGFjZUNyZWF0ZU1lbnU7XG4iXX0=