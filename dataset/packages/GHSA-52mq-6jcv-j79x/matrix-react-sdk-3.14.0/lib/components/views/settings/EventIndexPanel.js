"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var sdk = _interopRequireWildcard3(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _FormattingUtils = require("../../../utils/FormattingUtils");

var _EventIndexPeg = _interopRequireDefault(require("../../../indexing/EventIndexPeg"));

var _SettingLevel = require("../../../settings/SettingLevel");

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
class EventIndexPanel extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "updateCurrentRoom", async room => {
      const eventIndex = _EventIndexPeg.default.get();

      let stats;

      try {
        stats = await eventIndex.getStats();
      } catch {
        // This call may fail if sporadically, not a huge issue as we will
        // try later again and probably succeed.
        return;
      }

      this.setState({
        eventIndexSize: stats.size,
        roomCount: stats.roomCount
      });
    });
    (0, _defineProperty2.default)(this, "_onManage", async () => {
      _Modal.default.createTrackedDialogAsync('Message search', 'Message search', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../async-components/views/dialogs/eventindex/ManageEventIndexDialog'))), {
        onFinished: () => {}
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "_onEnable", async () => {
      this.setState({
        enabling: true
      });
      await _EventIndexPeg.default.initEventIndex();
      await _EventIndexPeg.default.get().addInitialCheckpoints();
      await _EventIndexPeg.default.get().startCrawler();
      await _SettingsStore.default.setValue('enableEventIndexing', null, _SettingLevel.SettingLevel.DEVICE, true);
      await this.updateState();
    });
    this.state = {
      enabling: false,
      eventIndexSize: 0,
      roomCount: 0,
      eventIndexingEnabled: _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'enableEventIndexing')
    };
  }

  componentWillUnmount()
  /*: void*/
  {
    const eventIndex = _EventIndexPeg.default.get();

    if (eventIndex !== null) {
      eventIndex.removeListener("changedCheckpoint", this.updateCurrentRoom);
    }
  }

  async componentDidMount()
  /*: void*/
  {
    this.updateState();
  }

  async updateState() {
    const eventIndex = _EventIndexPeg.default.get();

    const eventIndexingEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'enableEventIndexing');

    const enabling = false;
    let eventIndexSize = 0;
    let roomCount = 0;

    if (eventIndex !== null) {
      eventIndex.on("changedCheckpoint", this.updateCurrentRoom);

      try {
        const stats = await eventIndex.getStats();
        eventIndexSize = stats.size;
        roomCount = stats.roomCount;
      } catch {// This call may fail if sporadically, not a huge issue as we
        // will try later again in the updateCurrentRoom call and
        // probably succeed.
      }
    }

    this.setState({
      enabling,
      eventIndexSize,
      roomCount,
      eventIndexingEnabled
    });
  }

  render() {
    let eventIndexingSettings = null;
    const InlineSpinner = sdk.getComponent('elements.InlineSpinner');

    const brand = _SdkConfig.default.get().brand;

    if (_EventIndexPeg.default.get() !== null) {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Securely cache encrypted messages locally for them " + "to appear in search results, using %(size)s to store messages from %(rooms)s rooms.", {
        size: (0, _FormattingUtils.formatBytes)(this.state.eventIndexSize, 0),
        // This drives the singular / plural string
        // selection for "room" / "rooms" only.
        count: this.state.roomCount,
        rooms: (0, _FormattingUtils.formatCountLong)(this.state.roomCount)
      })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this._onManage
      }, (0, _languageHandler._t)("Manage"))));
    } else if (!this.state.eventIndexingEnabled && _EventIndexPeg.default.supportIsInstalled()) {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Securely cache encrypted messages locally for them to " + "appear in search results.")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        disabled: this.state.enabling,
        onClick: this._onEnable
      }, (0, _languageHandler._t)("Enable")), this.state.enabling ? /*#__PURE__*/_react.default.createElement(InlineSpinner, null) : /*#__PURE__*/_react.default.createElement("div", null)));
    } else if (_EventIndexPeg.default.platformHasSupport() && !_EventIndexPeg.default.supportIsInstalled()) {
      const nativeLink = "https://github.com/vector-im/element-web/blob/develop/" + "docs/native-node-modules.md#" + "adding-seshat-for-search-in-e2e-encrypted-rooms";
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("%(brand)s is missing some components required for securely " + "caching encrypted messages locally. If you'd like to " + "experiment with this feature, build a custom %(brand)s Desktop " + "with <nativeLink>search components added</nativeLink>.", {
        brand
      }, {
        'nativeLink': sub => /*#__PURE__*/_react.default.createElement("a", {
          href: nativeLink,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    } else {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("%(brand)s can't securely cache encrypted messages locally " + "while running in a web browser. Use <desktopLink>%(brand)s Desktop</desktopLink> " + "for encrypted messages to appear in search results.", {
        brand
      }, {
        'desktopLink': sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://element.io/get-started",
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    }

    return eventIndexingSettings;
  }

}

exports.default = EventIndexPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0V2ZW50SW5kZXhQYW5lbC5qcyJdLCJuYW1lcyI6WyJFdmVudEluZGV4UGFuZWwiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicm9vbSIsImV2ZW50SW5kZXgiLCJFdmVudEluZGV4UGVnIiwiZ2V0Iiwic3RhdHMiLCJnZXRTdGF0cyIsInNldFN0YXRlIiwiZXZlbnRJbmRleFNpemUiLCJzaXplIiwicm9vbUNvdW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMiLCJvbkZpbmlzaGVkIiwiZW5hYmxpbmciLCJpbml0RXZlbnRJbmRleCIsImFkZEluaXRpYWxDaGVja3BvaW50cyIsInN0YXJ0Q3Jhd2xlciIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsInVwZGF0ZVN0YXRlIiwic3RhdGUiLCJldmVudEluZGV4aW5nRW5hYmxlZCIsImdldFZhbHVlQXQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwidXBkYXRlQ3VycmVudFJvb20iLCJjb21wb25lbnREaWRNb3VudCIsIm9uIiwicmVuZGVyIiwiZXZlbnRJbmRleGluZ1NldHRpbmdzIiwiSW5saW5lU3Bpbm5lciIsInNkayIsImdldENvbXBvbmVudCIsImJyYW5kIiwiU2RrQ29uZmlnIiwiY291bnQiLCJyb29tcyIsIl9vbk1hbmFnZSIsInN1cHBvcnRJc0luc3RhbGxlZCIsIl9vbkVuYWJsZSIsInBsYXRmb3JtSGFzU3VwcG9ydCIsIm5hdGl2ZUxpbmsiLCJzdWIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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RCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7Zm9ybWF0Qnl0ZXMsIGZvcm1hdENvdW50TG9uZ30gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0Zvcm1hdHRpbmdVdGlsc1wiO1xuaW1wb3J0IEV2ZW50SW5kZXhQZWcgZnJvbSBcIi4uLy4uLy4uL2luZGV4aW5nL0V2ZW50SW5kZXhQZWdcIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50SW5kZXhQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGVuYWJsaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGV2ZW50SW5kZXhTaXplOiAwLFxuICAgICAgICAgICAgcm9vbUNvdW50OiAwLFxuICAgICAgICAgICAgZXZlbnRJbmRleGluZ0VuYWJsZWQ6XG4gICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFNldHRpbmdMZXZlbC5ERVZJQ0UsICdlbmFibGVFdmVudEluZGV4aW5nJyksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdXBkYXRlQ3VycmVudFJvb20gPSBhc3luYyAocm9vbSkgPT4ge1xuICAgICAgICBjb25zdCBldmVudEluZGV4ID0gRXZlbnRJbmRleFBlZy5nZXQoKTtcbiAgICAgICAgbGV0IHN0YXRzO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzdGF0cyA9IGF3YWl0IGV2ZW50SW5kZXguZ2V0U3RhdHMoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBUaGlzIGNhbGwgbWF5IGZhaWwgaWYgc3BvcmFkaWNhbGx5LCBub3QgYSBodWdlIGlzc3VlIGFzIHdlIHdpbGxcbiAgICAgICAgICAgIC8vIHRyeSBsYXRlciBhZ2FpbiBhbmQgcHJvYmFibHkgc3VjY2VlZC5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXZlbnRJbmRleFNpemU6IHN0YXRzLnNpemUsXG4gICAgICAgICAgICByb29tQ291bnQ6IHN0YXRzLnJvb21Db3VudCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgICBjb25zdCBldmVudEluZGV4ID0gRXZlbnRJbmRleFBlZy5nZXQoKTtcblxuICAgICAgICBpZiAoZXZlbnRJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZXZlbnRJbmRleC5yZW1vdmVMaXN0ZW5lcihcImNoYW5nZWRDaGVja3BvaW50XCIsIHRoaXMudXBkYXRlQ3VycmVudFJvb20pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICB9XG5cbiAgICBhc3luYyB1cGRhdGVTdGF0ZSgpIHtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGV2ZW50SW5kZXhpbmdFbmFibGVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFNldHRpbmdMZXZlbC5ERVZJQ0UsICdlbmFibGVFdmVudEluZGV4aW5nJyk7XG4gICAgICAgIGNvbnN0IGVuYWJsaW5nID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGV2ZW50SW5kZXhTaXplID0gMDtcbiAgICAgICAgbGV0IHJvb21Db3VudCA9IDA7XG5cbiAgICAgICAgaWYgKGV2ZW50SW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXgub24oXCJjaGFuZ2VkQ2hlY2twb2ludFwiLCB0aGlzLnVwZGF0ZUN1cnJlbnRSb29tKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0cyA9IGF3YWl0IGV2ZW50SW5kZXguZ2V0U3RhdHMoKTtcbiAgICAgICAgICAgICAgICBldmVudEluZGV4U2l6ZSA9IHN0YXRzLnNpemU7XG4gICAgICAgICAgICAgICAgcm9vbUNvdW50ID0gc3RhdHMucm9vbUNvdW50O1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBjYWxsIG1heSBmYWlsIGlmIHNwb3JhZGljYWxseSwgbm90IGEgaHVnZSBpc3N1ZSBhcyB3ZVxuICAgICAgICAgICAgICAgIC8vIHdpbGwgdHJ5IGxhdGVyIGFnYWluIGluIHRoZSB1cGRhdGVDdXJyZW50Um9vbSBjYWxsIGFuZFxuICAgICAgICAgICAgICAgIC8vIHByb2JhYmx5IHN1Y2NlZWQuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVuYWJsaW5nLFxuICAgICAgICAgICAgZXZlbnRJbmRleFNpemUsXG4gICAgICAgICAgICByb29tQ291bnQsXG4gICAgICAgICAgICBldmVudEluZGV4aW5nRW5hYmxlZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uTWFuYWdlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMoJ01lc3NhZ2Ugc2VhcmNoJywgJ01lc3NhZ2Ugc2VhcmNoJyxcbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL2V2ZW50aW5kZXgvTWFuYWdlRXZlbnRJbmRleERpYWxvZycpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6ICgpID0+IHt9LFxuICAgICAgICAgICAgfSwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfb25FbmFibGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZW5hYmxpbmc6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGF3YWl0IEV2ZW50SW5kZXhQZWcuaW5pdEV2ZW50SW5kZXgoKTtcbiAgICAgICAgYXdhaXQgRXZlbnRJbmRleFBlZy5nZXQoKS5hZGRJbml0aWFsQ2hlY2twb2ludHMoKTtcbiAgICAgICAgYXdhaXQgRXZlbnRJbmRleFBlZy5nZXQoKS5zdGFydENyYXdsZXIoKTtcbiAgICAgICAgYXdhaXQgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZSgnZW5hYmxlRXZlbnRJbmRleGluZycsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIHRydWUpO1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gbnVsbDtcbiAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICAgICAgaWYgKEV2ZW50SW5kZXhQZWcuZ2V0KCkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhpbmdTZXR0aW5ncyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiU2VjdXJlbHkgY2FjaGUgZW5jcnlwdGVkIG1lc3NhZ2VzIGxvY2FsbHkgZm9yIHRoZW0gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gYXBwZWFyIGluIHNlYXJjaCByZXN1bHRzLCB1c2luZyAlKHNpemUpcyB0byBzdG9yZSBtZXNzYWdlcyBmcm9tICUocm9vbXMpcyByb29tcy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IGZvcm1hdEJ5dGVzKHRoaXMuc3RhdGUuZXZlbnRJbmRleFNpemUsIDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGRyaXZlcyB0aGUgc2luZ3VsYXIgLyBwbHVyYWwgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlbGVjdGlvbiBmb3IgXCJyb29tXCIgLyBcInJvb21zXCIgb25seS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHRoaXMuc3RhdGUucm9vbUNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tczogZm9ybWF0Q291bnRMb25nKHRoaXMuc3RhdGUucm9vbUNvdW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX29uTWFuYWdlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJNYW5hZ2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5zdGF0ZS5ldmVudEluZGV4aW5nRW5hYmxlZCAmJiBFdmVudEluZGV4UGVnLnN1cHBvcnRJc0luc3RhbGxlZCgpKSB7XG4gICAgICAgICAgICBldmVudEluZGV4aW5nU2V0dGluZ3MgPSAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdCggXCJTZWN1cmVseSBjYWNoZSBlbmNyeXB0ZWQgbWVzc2FnZXMgbG9jYWxseSBmb3IgdGhlbSB0byBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXBwZWFyIGluIHNlYXJjaCByZXN1bHRzLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIGRpc2FibGVkPXt0aGlzLnN0YXRlLmVuYWJsaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uRW5hYmxlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJFbmFibGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5lbmFibGluZyA/IDxJbmxpbmVTcGlubmVyIC8+IDogPGRpdiAvPn1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKEV2ZW50SW5kZXhQZWcucGxhdGZvcm1IYXNTdXBwb3J0KCkgJiYgIUV2ZW50SW5kZXhQZWcuc3VwcG9ydElzSW5zdGFsbGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hdGl2ZUxpbmsgPSAoXG4gICAgICAgICAgICAgICAgXCJodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2Jsb2IvZGV2ZWxvcC9cIiArXG4gICAgICAgICAgICAgICAgXCJkb2NzL25hdGl2ZS1ub2RlLW1vZHVsZXMubWQjXCIgK1xuICAgICAgICAgICAgICAgIFwiYWRkaW5nLXNlc2hhdC1mb3Itc2VhcmNoLWluLWUyZS1lbmNyeXB0ZWQtcm9vbXNcIlxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90KCBcIiUoYnJhbmQpcyBpcyBtaXNzaW5nIHNvbWUgY29tcG9uZW50cyByZXF1aXJlZCBmb3Igc2VjdXJlbHkgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FjaGluZyBlbmNyeXB0ZWQgbWVzc2FnZXMgbG9jYWxseS4gSWYgeW91J2QgbGlrZSB0byBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJleHBlcmltZW50IHdpdGggdGhpcyBmZWF0dXJlLCBidWlsZCBhIGN1c3RvbSAlKGJyYW5kKXMgRGVza3RvcCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aXRoIDxuYXRpdmVMaW5rPnNlYXJjaCBjb21wb25lbnRzIGFkZGVkPC9uYXRpdmVMaW5rPi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbmF0aXZlTGluayc6IChzdWIpID0+IDxhIGhyZWY9e25hdGl2ZUxpbmt9IHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudEluZGV4aW5nU2V0dGluZ3MgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoIFwiJShicmFuZClzIGNhbid0IHNlY3VyZWx5IGNhY2hlIGVuY3J5cHRlZCBtZXNzYWdlcyBsb2NhbGx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndoaWxlIHJ1bm5pbmcgaW4gYSB3ZWIgYnJvd3Nlci4gVXNlIDxkZXNrdG9wTGluaz4lKGJyYW5kKXMgRGVza3RvcDwvZGVza3RvcExpbms+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZvciBlbmNyeXB0ZWQgbWVzc2FnZXMgdG8gYXBwZWFyIGluIHNlYXJjaCByZXN1bHRzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkZXNrdG9wTGluayc6IChzdWIpID0+IDxhIGhyZWY9XCJodHRwczovL2VsZW1lbnQuaW8vZ2V0LXN0YXJ0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPntzdWJ9PC9hPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV2ZW50SW5kZXhpbmdTZXR0aW5ncztcbiAgICB9XG59XG4iXX0=