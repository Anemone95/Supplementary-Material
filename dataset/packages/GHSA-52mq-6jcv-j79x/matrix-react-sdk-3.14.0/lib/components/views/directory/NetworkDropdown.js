"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ALL_ROOMS = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _DirectoryUtils = require("../../../utils/DirectoryUtils");

var _ContextMenu = require("../../structures/ContextMenu");

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _useSettings = require("../../../hooks/useSettings");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

/*
Copyright 2016 OpenMarket Ltd
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
const ALL_ROOMS = Symbol("ALL_ROOMS");
exports.ALL_ROOMS = ALL_ROOMS;
const SETTING_NAME = "room_directory_servers";

const inPlaceOf = elementRect => ({
  right: window.innerWidth - elementRect.right,
  top: elementRect.top,
  chevronOffset: 0,
  chevronFace: "none"
});

const validServer = (0, _Validation.default)({
  rules: [{
    key: "required",
    test: async ({
      value
    }) => !!value,
    invalid: () => (0, _languageHandler._t)("Enter a server name")
  }, {
    key: "available",
    final: true,
    test: async ({
      value
    }) => {
      try {
        const opts = {
          limit: 1,
          server: value
        }; // check if we can successfully load this server's room directory

        await _MatrixClientPeg.MatrixClientPeg.get().publicRooms(opts);
        return true;
      } catch (e) {
        return false;
      }
    },
    valid: () => (0, _languageHandler._t)("Looks good"),
    invalid: () => (0, _languageHandler._t)("Can't find this server or its room list")
  }]
}); // This dropdown sources homeservers from three places:
// + your currently connected homeserver
// + homeservers in config.json["roomDirectory"]
// + homeservers in SettingsStore["room_directory_servers"]
// if a server exists in multiple, only keep the top-most entry.

const NetworkDropdown = ({
  onOptionChange,
  protocols = {},
  selectedServerName,
  selectedInstanceId
}) => {
  const [menuDisplayed, handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();

  const _userDefinedServers = (0, _useSettings.useSettingValue)(SETTING_NAME);

  const [userDefinedServers, _setUserDefinedServers] = (0, _react.useState)(_userDefinedServers);

  const handlerFactory = (server, instanceId) => {
    return () => {
      onOptionChange(server, instanceId);
      closeMenu();
    };
  };

  const setUserDefinedServers = servers => {
    _setUserDefinedServers(servers);

    _SettingsStore.default.setValue(SETTING_NAME, null, "account", servers);
  }; // keep local echo up to date with external changes


  (0, _react.useEffect)(() => {
    _setUserDefinedServers(_userDefinedServers);
  }, [_userDefinedServers]); // we either show the button or the dropdown in its place.

  let content;

  if (menuDisplayed) {
    const config = _SdkConfig.default.get();

    const roomDirectory = config.roomDirectory || {};

    const hsName = _MatrixClientPeg.MatrixClientPeg.getHomeserverName();

    const configServers = new Set(roomDirectory.servers); // configured servers take preference over user-defined ones, if one occurs in both ignore the latter one.

    const removableServers = new Set(userDefinedServers.filter(s => !configServers.has(s) && s !== hsName));
    const servers = [// we always show our connected HS, this takes precedence over it being configured or user-defined
    hsName, ...Array.from(configServers).filter(s => s !== hsName).sort(), ...Array.from(removableServers).sort()]; // For our own HS, we can use the instance_ids given in the third party protocols
    // response to get the server to filter the room list by network for us.
    // We can't get thirdparty protocols for remote server yet though, so for those
    // we can only show the default room list.

    const options = servers.map(server => {
      const serverSelected = server === selectedServerName;
      const entries = [];
      const protocolsList = server === hsName ? Object.values(protocols) : [];

      if (protocolsList.length > 0) {
        // add a fake protocol with the ALL_ROOMS symbol
        protocolsList.push({
          instances: [{
            instance_id: ALL_ROOMS,
            desc: (0, _languageHandler._t)("All rooms")
          }]
        });
      }

      protocolsList.forEach(({
        instances = []
      }) => {
        [...instances].sort((b, a) => {
          return a.desc.localeCompare(b.desc);
        }).forEach(({
          desc,
          instance_id: instanceId
        }) => {
          entries.push( /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItemRadio, {
            key: String(instanceId),
            active: serverSelected && instanceId === selectedInstanceId,
            onClick: handlerFactory(server, instanceId),
            label: desc,
            className: "mx_NetworkDropdown_server_network"
          }, desc));
        });
      });
      let subtitle;

      if (server === hsName) {
        subtitle = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_NetworkDropdown_server_subtitle"
        }, (0, _languageHandler._t)("Your server"));
      }

      let removeButton;

      if (removableServers.has(server)) {
        const onClick = async () => {
          closeMenu();
          const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

          const {
            finished
          } = _Modal.default.createTrackedDialog("Network Dropdown", "Remove server", QuestionDialog, {
            title: (0, _languageHandler._t)("Are you sure?"),
            description: (0, _languageHandler._t)("Are you sure you want to remove <b>%(serverName)s</b>", {
              serverName: server
            }, {
              b: serverName => /*#__PURE__*/_react.default.createElement("b", null, serverName)
            }),
            button: (0, _languageHandler._t)("Remove"),
            fixedWidth: false
          }, "mx_NetworkDropdown_dialog");

          const [ok] = await finished;
          if (!ok) return; // delete from setting

          setUserDefinedServers(servers.filter(s => s !== server)); // the selected server is being removed, reset to our HS

          if (serverSelected === server) {
            onOptionChange(hsName, undefined);
          }
        };

        removeButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
          onClick: onClick,
          label: (0, _languageHandler._t)("Remove server")
        });
      } // ARIA: in actual fact the entire menu is one large radio group but for better screen reader support
      // we use group to notate server wrongly.


      return /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuGroup, {
        label: server,
        className: "mx_NetworkDropdown_server",
        key: server
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_NetworkDropdown_server_title"
      }, server, removeButton), subtitle, /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItemRadio, {
        active: serverSelected && !selectedInstanceId,
        onClick: handlerFactory(server, undefined),
        label: (0, _languageHandler._t)("Matrix"),
        className: "mx_NetworkDropdown_server_network"
      }, (0, _languageHandler._t)("Matrix")), entries);
    });

    const onClick = async () => {
      closeMenu();
      const TextInputDialog = sdk.getComponent("dialogs.TextInputDialog");

      const {
        finished
      } = _Modal.default.createTrackedDialog("Network Dropdown", "Add a new server", TextInputDialog, {
        title: (0, _languageHandler._t)("Add a new server"),
        description: (0, _languageHandler._t)("Enter the name of a new server you want to explore."),
        button: (0, _languageHandler._t)("Add"),
        hasCancel: false,
        placeholder: (0, _languageHandler._t)("Server name"),
        validator: validServer,
        fixedWidth: false
      }, "mx_NetworkDropdown_dialog");

      const [ok, newServer] = await finished;
      if (!ok) return;

      if (!userDefinedServers.includes(newServer)) {
        setUserDefinedServers([...userDefinedServers, newServer]);
      }

      onOptionChange(newServer); // change filter to the new server
    };

    const buttonRect = handle.current.getBoundingClientRect();
    content = /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, (0, _extends2.default)({}, inPlaceOf(buttonRect), {
      onFinished: closeMenu
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_NetworkDropdown_menu"
    }, options, /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
      className: "mx_NetworkDropdown_server_add",
      label: undefined,
      onClick: onClick
    }, (0, _languageHandler._t)("Add a new server..."))));
  } else {
    let currentValue;

    if (selectedInstanceId === ALL_ROOMS) {
      currentValue = (0, _languageHandler._t)("All rooms");
    } else if (selectedInstanceId) {
      const instance = (0, _DirectoryUtils.instanceForInstanceId)(protocols, selectedInstanceId);
      currentValue = (0, _languageHandler._t)("%(networkName)s rooms", {
        networkName: instance.desc
      });
    } else {
      currentValue = (0, _languageHandler._t)("Matrix rooms");
    }

    content = /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
      className: "mx_NetworkDropdown_handle",
      onClick: openMenu,
      isExpanded: menuDisplayed
    }, /*#__PURE__*/_react.default.createElement("span", null, currentValue), " ", /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NetworkDropdown_handle_server"
    }, "(", selectedServerName, ")"));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_NetworkDropdown",
    ref: handle
  }, content);
};

NetworkDropdown.propTypes = {
  onOptionChange: _propTypes.default.func.isRequired,
  protocols: _propTypes.default.object
};
var _default = NetworkDropdown;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpcmVjdG9yeS9OZXR3b3JrRHJvcGRvd24uanMiXSwibmFtZXMiOlsiQUxMX1JPT01TIiwiU3ltYm9sIiwiU0VUVElOR19OQU1FIiwiaW5QbGFjZU9mIiwiZWxlbWVudFJlY3QiLCJyaWdodCIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJ0b3AiLCJjaGV2cm9uT2Zmc2V0IiwiY2hldnJvbkZhY2UiLCJ2YWxpZFNlcnZlciIsInJ1bGVzIiwia2V5IiwidGVzdCIsInZhbHVlIiwiaW52YWxpZCIsImZpbmFsIiwib3B0cyIsImxpbWl0Iiwic2VydmVyIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwicHVibGljUm9vbXMiLCJlIiwidmFsaWQiLCJOZXR3b3JrRHJvcGRvd24iLCJvbk9wdGlvbkNoYW5nZSIsInByb3RvY29scyIsInNlbGVjdGVkU2VydmVyTmFtZSIsInNlbGVjdGVkSW5zdGFuY2VJZCIsIm1lbnVEaXNwbGF5ZWQiLCJoYW5kbGUiLCJvcGVuTWVudSIsImNsb3NlTWVudSIsIl91c2VyRGVmaW5lZFNlcnZlcnMiLCJ1c2VyRGVmaW5lZFNlcnZlcnMiLCJfc2V0VXNlckRlZmluZWRTZXJ2ZXJzIiwiaGFuZGxlckZhY3RvcnkiLCJpbnN0YW5jZUlkIiwic2V0VXNlckRlZmluZWRTZXJ2ZXJzIiwic2VydmVycyIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsImNvbnRlbnQiLCJjb25maWciLCJTZGtDb25maWciLCJyb29tRGlyZWN0b3J5IiwiaHNOYW1lIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJjb25maWdTZXJ2ZXJzIiwiU2V0IiwicmVtb3ZhYmxlU2VydmVycyIsImZpbHRlciIsInMiLCJoYXMiLCJBcnJheSIsImZyb20iLCJzb3J0Iiwib3B0aW9ucyIsIm1hcCIsInNlcnZlclNlbGVjdGVkIiwiZW50cmllcyIsInByb3RvY29sc0xpc3QiLCJPYmplY3QiLCJ2YWx1ZXMiLCJsZW5ndGgiLCJwdXNoIiwiaW5zdGFuY2VzIiwiaW5zdGFuY2VfaWQiLCJkZXNjIiwiZm9yRWFjaCIsImIiLCJhIiwibG9jYWxlQ29tcGFyZSIsIlN0cmluZyIsInN1YnRpdGxlIiwicmVtb3ZlQnV0dG9uIiwib25DbGljayIsIlF1ZXN0aW9uRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwic2VydmVyTmFtZSIsImJ1dHRvbiIsImZpeGVkV2lkdGgiLCJvayIsInVuZGVmaW5lZCIsIlRleHRJbnB1dERpYWxvZyIsImhhc0NhbmNlbCIsInBsYWNlaG9sZGVyIiwidmFsaWRhdG9yIiwibmV3U2VydmVyIiwiaW5jbHVkZXMiLCJidXR0b25SZWN0IiwiY3VycmVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImN1cnJlbnRWYWx1ZSIsImluc3RhbmNlIiwibmV0d29ya05hbWUiLCJwcm9wVHlwZXMiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCIsIm9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFRQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXVCTyxNQUFNQSxTQUFTLEdBQUdDLE1BQU0sQ0FBQyxXQUFELENBQXhCOztBQUVQLE1BQU1DLFlBQVksR0FBRyx3QkFBckI7O0FBRUEsTUFBTUMsU0FBUyxHQUFJQyxXQUFELEtBQWtCO0FBQ2hDQyxFQUFBQSxLQUFLLEVBQUVDLE1BQU0sQ0FBQ0MsVUFBUCxHQUFvQkgsV0FBVyxDQUFDQyxLQURQO0FBRWhDRyxFQUFBQSxHQUFHLEVBQUVKLFdBQVcsQ0FBQ0ksR0FGZTtBQUdoQ0MsRUFBQUEs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QUssSUFBQSxTQUFTLEVBQUMsb0JBQWY7QUFBb0MsSUFBQSxHQUFHLEVBQUVHO0FBQXpDLEtBQ0ZZLE9BREUsQ0FBUDtBQUdILENBdE1EOztBQXdNQWxCLGVBQWUsQ0FBQzhFLFNBQWhCLEdBQTRCO0FBQ3hCN0UsRUFBQUEsY0FBYyxFQUFFOEUsbUJBQVVDLElBQVYsQ0FBZUMsVUFEUDtBQUV4Qi9FLEVBQUFBLFNBQVMsRUFBRTZFLG1CQUFVRztBQUZHLENBQTVCO2VBS2VsRixlIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7dXNlRWZmZWN0LCB1c2VTdGF0ZX0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge2luc3RhbmNlRm9ySW5zdGFuY2VJZH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvRGlyZWN0b3J5VXRpbHMnO1xuaW1wb3J0IHtcbiAgICBDb250ZXh0TWVudSxcbiAgICB1c2VDb250ZXh0TWVudSxcbiAgICBDb250ZXh0TWVudUJ1dHRvbixcbiAgICBNZW51SXRlbVJhZGlvLFxuICAgIE1lbnVJdGVtLFxuICAgIE1lbnVHcm91cCxcbn0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHt1c2VTZXR0aW5nVmFsdWV9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VTZXR0aW5nc1wiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiBmcm9tIFwiLi4vZWxlbWVudHMvVmFsaWRhdGlvblwiO1xuXG5leHBvcnQgY29uc3QgQUxMX1JPT01TID0gU3ltYm9sKFwiQUxMX1JPT01TXCIpO1xuXG5jb25zdCBTRVRUSU5HX05BTUUgPSBcInJvb21fZGlyZWN0b3J5X3NlcnZlcnNcIjtcblxuY29uc3QgaW5QbGFjZU9mID0gKGVsZW1lbnRSZWN0KSA9PiAoe1xuICAgIHJpZ2h0OiB3aW5kb3cuaW5uZXJXaWR0aCAtIGVsZW1lbnRSZWN0LnJpZ2h0LFxuICAgIHRvcDogZWxlbWVudFJlY3QudG9wLFxuICAgIGNoZXZyb25PZmZzZXQ6IDAsXG4gICAgY2hldnJvbkZhY2U6IFwibm9uZVwiLFxufSk7XG5cbmNvbnN0IHZhbGlkU2VydmVyID0gd2l0aFZhbGlkYXRpb24oe1xuICAgIHJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgdGVzdDogYXN5bmMgKHsgdmFsdWUgfSkgPT4gISF2YWx1ZSxcbiAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgYSBzZXJ2ZXIgbmFtZVwiKSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAga2V5OiBcImF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgZmluYWw6IHRydWUsXG4gICAgICAgICAgICB0ZXN0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgd2UgY2FuIHN1Y2Nlc3NmdWxseSBsb2FkIHRoaXMgc2VydmVyJ3Mgcm9vbSBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnB1YmxpY1Jvb21zKG9wdHMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmFsaWQ6ICgpID0+IF90KFwiTG9va3MgZ29vZFwiKSxcbiAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiQ2FuJ3QgZmluZCB0aGlzIHNlcnZlciBvciBpdHMgcm9vbSBsaXN0XCIpLFxuICAgICAgICB9LFxuICAgIF0sXG59KTtcblxuLy8gVGhpcyBkcm9wZG93biBzb3VyY2VzIGhvbWVzZXJ2ZXJzIGZyb20gdGhyZWUgcGxhY2VzOlxuLy8gKyB5b3VyIGN1cnJlbnRseSBjb25uZWN0ZWQgaG9tZXNlcnZlclxuLy8gKyBob21lc2VydmVycyBpbiBjb25maWcuanNvbltcInJvb21EaXJlY3RvcnlcIl1cbi8vICsgaG9tZXNlcnZlcnMgaW4gU2V0dGluZ3NTdG9yZVtcInJvb21fZGlyZWN0b3J5X3NlcnZlcnNcIl1cbi8vIGlmIGEgc2VydmVyIGV4aXN0cyBpbiBtdWx0aXBsZSwgb25seSBrZWVwIHRoZSB0b3AtbW9zdCBlbnRyeS5cblxuY29uc3QgTmV0d29ya0Ryb3Bkb3duID0gKHtvbk9wdGlvbkNoYW5nZSwgcHJvdG9jb2xzID0ge30sIHNlbGVjdGVkU2VydmVyTmFtZSwgc2VsZWN0ZWRJbnN0YW5jZUlkfSkgPT4ge1xuICAgIGNvbnN0IFttZW51RGlzcGxheWVkLCBoYW5kbGUsIG9wZW5NZW51LCBjbG9zZU1lbnVdID0gdXNlQ29udGV4dE1lbnUoKTtcbiAgICBjb25zdCBfdXNlckRlZmluZWRTZXJ2ZXJzID0gdXNlU2V0dGluZ1ZhbHVlKFNFVFRJTkdfTkFNRSk7XG4gICAgY29uc3QgW3VzZXJEZWZpbmVkU2VydmVycywgX3NldFVzZXJEZWZpbmVkU2VydmVyc10gPSB1c2VTdGF0ZShfdXNlckRlZmluZWRTZXJ2ZXJzKTtcblxuICAgIGNvbnN0IGhhbmRsZXJGYWN0b3J5ID0gKHNlcnZlciwgaW5zdGFuY2VJZCkgPT4ge1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgb25PcHRpb25DaGFuZ2Uoc2VydmVyLCBpbnN0YW5jZUlkKTtcbiAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCBzZXRVc2VyRGVmaW5lZFNlcnZlcnMgPSBzZXJ2ZXJzID0+IHtcbiAgICAgICAgX3NldFVzZXJEZWZpbmVkU2VydmVycyhzZXJ2ZXJzKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShTRVRUSU5HX05BTUUsIG51bGwsIFwiYWNjb3VudFwiLCBzZXJ2ZXJzKTtcbiAgICB9O1xuICAgIC8vIGtlZXAgbG9jYWwgZWNobyB1cCB0byBkYXRlIHdpdGggZXh0ZXJuYWwgY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIF9zZXRVc2VyRGVmaW5lZFNlcnZlcnMoX3VzZXJEZWZpbmVkU2VydmVycyk7XG4gICAgfSwgW191c2VyRGVmaW5lZFNlcnZlcnNdKTtcblxuICAgIC8vIHdlIGVpdGhlciBzaG93IHRoZSBidXR0b24gb3IgdGhlIGRyb3Bkb3duIGluIGl0cyBwbGFjZS5cbiAgICBsZXQgY29udGVudDtcbiAgICBpZiAobWVudURpc3BsYXllZCkge1xuICAgICAgICBjb25zdCBjb25maWcgPSBTZGtDb25maWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb21EaXJlY3RvcnkgPSBjb25maWcucm9vbURpcmVjdG9yeSB8fCB7fTtcblxuICAgICAgICBjb25zdCBoc05hbWUgPSBNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKTtcbiAgICAgICAgY29uc3QgY29uZmlnU2VydmVycyA9IG5ldyBTZXQocm9vbURpcmVjdG9yeS5zZXJ2ZXJzKTtcblxuICAgICAgICAvLyBjb25maWd1cmVkIHNlcnZlcnMgdGFrZSBwcmVmZXJlbmNlIG92ZXIgdXNlci1kZWZpbmVkIG9uZXMsIGlmIG9uZSBvY2N1cnMgaW4gYm90aCBpZ25vcmUgdGhlIGxhdHRlciBvbmUuXG4gICAgICAgIGNvbnN0IHJlbW92YWJsZVNlcnZlcnMgPSBuZXcgU2V0KHVzZXJEZWZpbmVkU2VydmVycy5maWx0ZXIocyA9PiAhY29uZmlnU2VydmVycy5oYXMocykgJiYgcyAhPT0gaHNOYW1lKSk7XG4gICAgICAgIGNvbnN0IHNlcnZlcnMgPSBbXG4gICAgICAgICAgICAvLyB3ZSBhbHdheXMgc2hvdyBvdXIgY29ubmVjdGVkIEhTLCB0aGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBpdCBiZWluZyBjb25maWd1cmVkIG9yIHVzZXItZGVmaW5lZFxuICAgICAgICAgICAgaHNOYW1lLFxuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbShjb25maWdTZXJ2ZXJzKS5maWx0ZXIocyA9PiBzICE9PSBoc05hbWUpLnNvcnQoKSxcbiAgICAgICAgICAgIC4uLkFycmF5LmZyb20ocmVtb3ZhYmxlU2VydmVycykuc29ydCgpLFxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIEZvciBvdXIgb3duIEhTLCB3ZSBjYW4gdXNlIHRoZSBpbnN0YW5jZV9pZHMgZ2l2ZW4gaW4gdGhlIHRoaXJkIHBhcnR5IHByb3RvY29sc1xuICAgICAgICAvLyByZXNwb25zZSB0byBnZXQgdGhlIHNlcnZlciB0byBmaWx0ZXIgdGhlIHJvb20gbGlzdCBieSBuZXR3b3JrIGZvciB1cy5cbiAgICAgICAgLy8gV2UgY2FuJ3QgZ2V0IHRoaXJkcGFydHkgcHJvdG9jb2xzIGZvciByZW1vdGUgc2VydmVyIHlldCB0aG91Z2gsIHNvIGZvciB0aG9zZVxuICAgICAgICAvLyB3ZSBjYW4gb25seSBzaG93IHRoZSBkZWZhdWx0IHJvb20gbGlzdC5cbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHNlcnZlcnMubWFwKHNlcnZlciA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXJTZWxlY3RlZCA9IHNlcnZlciA9PT0gc2VsZWN0ZWRTZXJ2ZXJOYW1lO1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgICAgICAgICBjb25zdCBwcm90b2NvbHNMaXN0ID0gc2VydmVyID09PSBoc05hbWUgPyBPYmplY3QudmFsdWVzKHByb3RvY29scykgOiBbXTtcbiAgICAgICAgICAgIGlmIChwcm90b2NvbHNMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgYSBmYWtlIHByb3RvY29sIHdpdGggdGhlIEFMTF9ST09NUyBzeW1ib2xcbiAgICAgICAgICAgICAgICBwcm90b2NvbHNMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZXM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZV9pZDogQUxMX1JPT01TLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzYzogX3QoXCJBbGwgcm9vbXNcIiksXG4gICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm90b2NvbHNMaXN0LmZvckVhY2goKHtpbnN0YW5jZXM9W119KSA9PiB7XG4gICAgICAgICAgICAgICAgWy4uLmluc3RhbmNlc10uc29ydCgoYiwgYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5kZXNjLmxvY2FsZUNvbXBhcmUoYi5kZXNjKTtcbiAgICAgICAgICAgICAgICB9KS5mb3JFYWNoKCh7ZGVzYywgaW5zdGFuY2VfaWQ6IGluc3RhbmNlSWR9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJpZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxNZW51SXRlbVJhZGlvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtTdHJpbmcoaW5zdGFuY2VJZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlPXtzZXJ2ZXJTZWxlY3RlZCAmJiBpbnN0YW5jZUlkID09PSBzZWxlY3RlZEluc3RhbmNlSWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlckZhY3Rvcnkoc2VydmVyLCBpbnN0YW5jZUlkKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17ZGVzY31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9OZXR3b3JrRHJvcGRvd25fc2VydmVyX25ldHdvcmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZGVzYyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L01lbnVJdGVtUmFkaW8+KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgc3VidGl0bGU7XG4gICAgICAgICAgICBpZiAoc2VydmVyID09PSBoc05hbWUpIHtcbiAgICAgICAgICAgICAgICBzdWJ0aXRsZSA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9OZXR3b3JrRHJvcGRvd25fc2VydmVyX3N1YnRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJZb3VyIHNlcnZlclwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHJlbW92ZUJ1dHRvbjtcbiAgICAgICAgICAgIGlmIChyZW1vdmFibGVTZXJ2ZXJzLmhhcyhzZXJ2ZXIpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb25DbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFwiTmV0d29yayBEcm9wZG93blwiLCBcIlJlbW92ZSBzZXJ2ZXJcIiwgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkFyZSB5b3Ugc3VyZT9cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVtb3ZlIDxiPiUoc2VydmVyTmFtZSlzPC9iPlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyTmFtZTogc2VydmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHNlcnZlck5hbWUgPT4gPGI+eyBzZXJ2ZXJOYW1lIH08L2I+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b246IF90KFwiUmVtb3ZlXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0sIFwibXhfTmV0d29ya0Ryb3Bkb3duX2RpYWxvZ1wiKTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBbb2tdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb2spIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAvLyBkZWxldGUgZnJvbSBzZXR0aW5nXG4gICAgICAgICAgICAgICAgICAgIHNldFVzZXJEZWZpbmVkU2VydmVycyhzZXJ2ZXJzLmZpbHRlcihzID0+IHMgIT09IHNlcnZlcikpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzZWxlY3RlZCBzZXJ2ZXIgaXMgYmVpbmcgcmVtb3ZlZCwgcmVzZXQgdG8gb3VyIEhTXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJTZWxlY3RlZCA9PT0gc2VydmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk9wdGlvbkNoYW5nZShoc05hbWUsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlbW92ZUJ1dHRvbiA9IDxNZW51SXRlbSBvbkNsaWNrPXtvbkNsaWNrfSBsYWJlbD17X3QoXCJSZW1vdmUgc2VydmVyXCIpfSAvPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQVJJQTogaW4gYWN0dWFsIGZhY3QgdGhlIGVudGlyZSBtZW51IGlzIG9uZSBsYXJnZSByYWRpbyBncm91cCBidXQgZm9yIGJldHRlciBzY3JlZW4gcmVhZGVyIHN1cHBvcnRcbiAgICAgICAgICAgIC8vIHdlIHVzZSBncm91cCB0byBub3RhdGUgc2VydmVyIHdyb25nbHkuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxNZW51R3JvdXAgbGFiZWw9e3NlcnZlcn0gY2xhc3NOYW1lPVwibXhfTmV0d29ya0Ryb3Bkb3duX3NlcnZlclwiIGtleT17c2VydmVyfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9OZXR3b3JrRHJvcGRvd25fc2VydmVyX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlcnZlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlbW92ZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHN1YnRpdGxlIH1cblxuICAgICAgICAgICAgICAgICAgICA8TWVudUl0ZW1SYWRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlPXtzZXJ2ZXJTZWxlY3RlZCAmJiAhc2VsZWN0ZWRJbnN0YW5jZUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlckZhY3Rvcnkoc2VydmVyLCB1bmRlZmluZWQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTWF0cml4XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTmV0d29ya0Ryb3Bkb3duX3NlcnZlcl9uZXR3b3JrXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiTWF0cml4XCIpfVxuICAgICAgICAgICAgICAgICAgICA8L01lbnVJdGVtUmFkaW8+XG4gICAgICAgICAgICAgICAgICAgIHsgZW50cmllcyB9XG4gICAgICAgICAgICAgICAgPC9NZW51R3JvdXA+XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBvbkNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgICAgICBjb25zdCBUZXh0SW5wdXREaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5UZXh0SW5wdXREaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFwiTmV0d29yayBEcm9wZG93blwiLCBcIkFkZCBhIG5ldyBzZXJ2ZXJcIiwgVGV4dElucHV0RGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQWRkIGEgbmV3IHNlcnZlclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJFbnRlciB0aGUgbmFtZSBvZiBhIG5ldyBzZXJ2ZXIgeW91IHdhbnQgdG8gZXhwbG9yZS5cIiksXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIkFkZFwiKSxcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBfdChcIlNlcnZlciBuYW1lXCIpLFxuICAgICAgICAgICAgICAgIHZhbGlkYXRvcjogdmFsaWRTZXJ2ZXIsXG4gICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogZmFsc2UsXG4gICAgICAgICAgICB9LCBcIm14X05ldHdvcmtEcm9wZG93bl9kaWFsb2dcIik7XG5cbiAgICAgICAgICAgIGNvbnN0IFtvaywgbmV3U2VydmVyXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFvaykgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAoIXVzZXJEZWZpbmVkU2VydmVycy5pbmNsdWRlcyhuZXdTZXJ2ZXIpKSB7XG4gICAgICAgICAgICAgICAgc2V0VXNlckRlZmluZWRTZXJ2ZXJzKFsuLi51c2VyRGVmaW5lZFNlcnZlcnMsIG5ld1NlcnZlcl0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvbk9wdGlvbkNoYW5nZShuZXdTZXJ2ZXIpOyAvLyBjaGFuZ2UgZmlsdGVyIHRvIHRoZSBuZXcgc2VydmVyXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYnV0dG9uUmVjdCA9IGhhbmRsZS5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb250ZW50ID0gPENvbnRleHRNZW51IHsuLi5pblBsYWNlT2YoYnV0dG9uUmVjdCl9IG9uRmluaXNoZWQ9e2Nsb3NlTWVudX0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X05ldHdvcmtEcm9wZG93bl9tZW51XCI+XG4gICAgICAgICAgICAgICAge29wdGlvbnN9XG4gICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X05ldHdvcmtEcm9wZG93bl9zZXJ2ZXJfYWRkXCIgbGFiZWw9e3VuZGVmaW5lZH0gb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIkFkZCBhIG5ldyBzZXJ2ZXIuLi5cIil9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0NvbnRleHRNZW51PjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgY3VycmVudFZhbHVlO1xuICAgICAgICBpZiAoc2VsZWN0ZWRJbnN0YW5jZUlkID09PSBBTExfUk9PTVMpIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IF90KFwiQWxsIHJvb21zXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkSW5zdGFuY2VJZCkge1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBpbnN0YW5jZUZvckluc3RhbmNlSWQocHJvdG9jb2xzLCBzZWxlY3RlZEluc3RhbmNlSWQpO1xuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gX3QoXCIlKG5ldHdvcmtOYW1lKXMgcm9vbXNcIiwge1xuICAgICAgICAgICAgICAgIG5ldHdvcmtOYW1lOiBpbnN0YW5jZS5kZXNjLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBfdChcIk1hdHJpeCByb29tc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRlbnQgPSA8Q29udGV4dE1lbnVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X05ldHdvcmtEcm9wZG93bl9oYW5kbGVcIlxuICAgICAgICAgICAgb25DbGljaz17b3Blbk1lbnV9XG4gICAgICAgICAgICBpc0V4cGFuZGVkPXttZW51RGlzcGxheWVkfVxuICAgICAgICA+XG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICB7Y3VycmVudFZhbHVlfVxuICAgICAgICAgICAgPC9zcGFuPiA8c3BhbiBjbGFzc05hbWU9XCJteF9OZXR3b3JrRHJvcGRvd25faGFuZGxlX3NlcnZlclwiPlxuICAgICAgICAgICAgICAgICh7c2VsZWN0ZWRTZXJ2ZXJOYW1lfSlcbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9Db250ZXh0TWVudUJ1dHRvbj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfTmV0d29ya0Ryb3Bkb3duXCIgcmVmPXtoYW5kbGV9PlxuICAgICAgICB7Y29udGVudH1cbiAgICA8L2Rpdj47XG59O1xuXG5OZXR3b3JrRHJvcGRvd24ucHJvcFR5cGVzID0ge1xuICAgIG9uT3B0aW9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHByb3RvY29sczogUHJvcFR5cGVzLm9iamVjdCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5ldHdvcmtEcm9wZG93bjtcbiJdfQ==