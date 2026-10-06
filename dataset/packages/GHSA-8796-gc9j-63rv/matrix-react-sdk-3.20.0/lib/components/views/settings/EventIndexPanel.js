"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _SeshatResetDialog = _interopRequireDefault(require("../dialogs/SeshatResetDialog"));

var _dec, _class, _temp;

let EventIndexPanel = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.EventIndexPanel"), _dec(_class = (_temp = class EventIndexPanel extends _react.default.Component
/*:: <{}, IState>*/
{
  constructor(props) {
    super(props);
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
    (0, _defineProperty2.default)(this, "onManage", async () => {
      _Modal.default.createTrackedDialogAsync('Message search', 'Message search', // @ts-ignore: TS doesn't seem to like the type of this now that it
      // has also been converted to TS as well, but I can't figure out why...
      Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../async-components/views/dialogs/eventindex/ManageEventIndexDialog'))), {
        onFinished: () => {}
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "onEnable", async () => {
      this.setState({
        enabling: true
      });
      await _EventIndexPeg.default.initEventIndex();
      await _EventIndexPeg.default.get().addInitialCheckpoints();
      await _EventIndexPeg.default.get().startCrawler();
      await _SettingsStore.default.setValue('enableEventIndexing', null, _SettingLevel.SettingLevel.DEVICE, true);
      await this.updateState();
    });
    (0, _defineProperty2.default)(this, "confirmEventStoreReset", () => {
      const {
        close
      } = _Modal.default.createDialog(_SeshatResetDialog.default, {
        onFinished: async success => {
          if (success) {
            await _SettingsStore.default.setValue('enableEventIndexing', null, _SettingLevel.SettingLevel.DEVICE, false);
            await _EventIndexPeg.default.deleteEventIndex();
            await this.onEnable();
            close();
          }
        }
      });
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

  componentDidMount()
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
        onClick: this.onManage
      }, (0, _languageHandler._t)("Manage"))));
    } else if (!this.state.eventIndexingEnabled && _EventIndexPeg.default.supportIsInstalled()) {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Securely cache encrypted messages locally for them to " + "appear in search results.")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        disabled: this.state.enabling,
        onClick: this.onEnable
      }, (0, _languageHandler._t)("Enable")), this.state.enabling ? /*#__PURE__*/_react.default.createElement(InlineSpinner, null) : /*#__PURE__*/_react.default.createElement("div", null)));
    } else if (_EventIndexPeg.default.platformHasSupport() && !_EventIndexPeg.default.supportIsInstalled()) {
      const nativeLink = "https://github.com/vector-im/element-desktop/blob/develop/" + "docs/native-node-modules.md#" + "adding-seshat-for-search-in-e2e-encrypted-rooms";
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("%(brand)s is missing some components required for securely " + "caching encrypted messages locally. If you'd like to " + "experiment with this feature, build a custom %(brand)s Desktop " + "with <nativeLink>search components added</nativeLink>.", {
        brand
      }, {
        nativeLink: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: nativeLink,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    } else if (!_EventIndexPeg.default.platformHasSupport()) {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("%(brand)s can't securely cache encrypted messages locally " + "while running in a web browser. Use <desktopLink>%(brand)s Desktop</desktopLink> " + "for encrypted messages to appear in search results.", {
        brand
      }, {
        desktopLink: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://element.io/get-started",
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    } else {
      eventIndexingSettings = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, /*#__PURE__*/_react.default.createElement("p", null, this.state.enabling ? /*#__PURE__*/_react.default.createElement(InlineSpinner, null) : (0, _languageHandler._t)("Message search initilisation failed")), _EventIndexPeg.default.error && /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("code", null, _EventIndexPeg.default.error.message), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "delete",
        kind: "danger",
        onClick: this.confirmEventStoreReset
      }, (0, _languageHandler._t)("Reset")))));
    }

    return eventIndexingSettings;
  }

}, _temp)) || _class);
exports.default = EventIndexPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0V2ZW50SW5kZXhQYW5lbC50c3giXSwibmFtZXMiOlsiRXZlbnRJbmRleFBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicm9vbSIsImV2ZW50SW5kZXgiLCJFdmVudEluZGV4UGVnIiwiZ2V0Iiwic3RhdHMiLCJnZXRTdGF0cyIsInNldFN0YXRlIiwiZXZlbnRJbmRleFNpemUiLCJzaXplIiwicm9vbUNvdW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nQXN5bmMiLCJvbkZpbmlzaGVkIiwiZW5hYmxpbmciLCJpbml0RXZlbnRJbmRleCIsImFkZEluaXRpYWxDaGVja3BvaW50cyIsInN0YXJ0Q3Jhd2xlciIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsInVwZGF0ZVN0YXRlIiwiY2xvc2UiLCJjcmVhdGVEaWFsb2ciLCJTZXNoYXRSZXNldERpYWxvZyIsInN1Y2Nlc3MiLCJkZWxldGVFdmVudEluZGV4Iiwib25FbmFibGUiLCJzdGF0ZSIsImV2ZW50SW5kZXhpbmdFbmFibGVkIiwiZ2V0VmFsdWVBdCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJ1cGRhdGVDdXJyZW50Um9vbSIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJyZW5kZXIiLCJldmVudEluZGV4aW5nU2V0dGluZ3MiLCJJbmxpbmVTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiYnJhbmQiLCJTZGtDb25maWciLCJjb3VudCIsInJvb21zIiwib25NYW5hZ2UiLCJzdXBwb3J0SXNJbnN0YWxsZWQiLCJwbGF0Zm9ybUhhc1N1cHBvcnQiLCJuYXRpdmVMaW5rIiwic3ViIiwiZGVza3RvcExpbmsiLCJlcnJvciIsIm1lc3NhZ2UiLCJjb25maXJtRXZlbnRTdG9yZVJlc2V0Il0sIm1hcHBp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QUFLQztBQUEzRCxTQUNLLHlCQUFHLE9BQUgsQ0FETCxDQURKLENBTEosQ0FSUixDQURKO0FBdUJIOztBQUVELFdBQU9oQixxQkFBUDtBQUNIOztBQXpOb0UsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMC0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHtmb3JtYXRCeXRlcywgZm9ybWF0Q291bnRMb25nfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRm9ybWF0dGluZ1V0aWxzXCI7XG5pbXBvcnQgRXZlbnRJbmRleFBlZyBmcm9tIFwiLi4vLi4vLi4vaW5kZXhpbmcvRXZlbnRJbmRleFBlZ1wiO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IFNlc2hhdFJlc2V0RGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvU2VzaGF0UmVzZXREaWFsb2cnO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBlbmFibGluZzogYm9vbGVhbjtcbiAgICBldmVudEluZGV4U2l6ZTogbnVtYmVyO1xuICAgIHJvb21Db3VudDogbnVtYmVyO1xuICAgIGV2ZW50SW5kZXhpbmdFbmFibGVkOiBib29sZWFuO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5FdmVudEluZGV4UGFuZWxcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50SW5kZXhQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7fSwgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBlbmFibGluZzogZmFsc2UsXG4gICAgICAgICAgICBldmVudEluZGV4U2l6ZTogMCxcbiAgICAgICAgICAgIHJvb21Db3VudDogMCxcbiAgICAgICAgICAgIGV2ZW50SW5kZXhpbmdFbmFibGVkOlxuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuREVWSUNFLCAnZW5hYmxlRXZlbnRJbmRleGluZycpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHVwZGF0ZUN1cnJlbnRSb29tID0gYXN5bmMgKHJvb20pID0+IHtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG4gICAgICAgIGxldCBzdGF0cztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3RhdHMgPSBhd2FpdCBldmVudEluZGV4LmdldFN0YXRzKCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gVGhpcyBjYWxsIG1heSBmYWlsIGlmIHNwb3JhZGljYWxseSwgbm90IGEgaHVnZSBpc3N1ZSBhcyB3ZSB3aWxsXG4gICAgICAgICAgICAvLyB0cnkgbGF0ZXIgYWdhaW4gYW5kIHByb2JhYmx5IHN1Y2NlZWQuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhTaXplOiBzdGF0cy5zaXplLFxuICAgICAgICAgICAgcm9vbUNvdW50OiBzdGF0cy5yb29tQ291bnQsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZXZlbnRJbmRleCA9IEV2ZW50SW5kZXhQZWcuZ2V0KCk7XG5cbiAgICAgICAgaWYgKGV2ZW50SW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXgucmVtb3ZlTGlzdGVuZXIoXCJjaGFuZ2VkQ2hlY2twb2ludFwiLCB0aGlzLnVwZGF0ZUN1cnJlbnRSb29tKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgdXBkYXRlU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50SW5kZXggPSBFdmVudEluZGV4UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBldmVudEluZGV4aW5nRW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuREVWSUNFLCAnZW5hYmxlRXZlbnRJbmRleGluZycpO1xuICAgICAgICBjb25zdCBlbmFibGluZyA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBldmVudEluZGV4U2l6ZSA9IDA7XG4gICAgICAgIGxldCByb29tQ291bnQgPSAwO1xuXG4gICAgICAgIGlmIChldmVudEluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICBldmVudEluZGV4Lm9uKFwiY2hhbmdlZENoZWNrcG9pbnRcIiwgdGhpcy51cGRhdGVDdXJyZW50Um9vbSk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBldmVudEluZGV4LmdldFN0YXRzKCk7XG4gICAgICAgICAgICAgICAgZXZlbnRJbmRleFNpemUgPSBzdGF0cy5zaXplO1xuICAgICAgICAgICAgICAgIHJvb21Db3VudCA9IHN0YXRzLnJvb21Db3VudDtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgY2FsbCBtYXkgZmFpbCBpZiBzcG9yYWRpY2FsbHksIG5vdCBhIGh1Z2UgaXNzdWUgYXMgd2VcbiAgICAgICAgICAgICAgICAvLyB3aWxsIHRyeSBsYXRlciBhZ2FpbiBpbiB0aGUgdXBkYXRlQ3VycmVudFJvb20gY2FsbCBhbmRcbiAgICAgICAgICAgICAgICAvLyBwcm9iYWJseSBzdWNjZWVkLlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlbmFibGluZyxcbiAgICAgICAgICAgIGV2ZW50SW5kZXhTaXplLFxuICAgICAgICAgICAgcm9vbUNvdW50LFxuICAgICAgICAgICAgZXZlbnRJbmRleGluZ0VuYWJsZWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25NYW5hZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnTWVzc2FnZSBzZWFyY2gnLCAnTWVzc2FnZSBzZWFyY2gnLFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogVFMgZG9lc24ndCBzZWVtIHRvIGxpa2UgdGhlIHR5cGUgb2YgdGhpcyBub3cgdGhhdCBpdFxuICAgICAgICAgICAgLy8gaGFzIGFsc28gYmVlbiBjb252ZXJ0ZWQgdG8gVFMgYXMgd2VsbCwgYnV0IEkgY2FuJ3QgZmlndXJlIG91dCB3aHkuLi5cbiAgICAgICAgICAgIGltcG9ydCgnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL2V2ZW50aW5kZXgvTWFuYWdlRXZlbnRJbmRleERpYWxvZycpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6ICgpID0+IHt9LFxuICAgICAgICAgICAgfSwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRW5hYmxlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVuYWJsaW5nOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBhd2FpdCBFdmVudEluZGV4UGVnLmluaXRFdmVudEluZGV4KCk7XG4gICAgICAgIGF3YWl0IEV2ZW50SW5kZXhQZWcuZ2V0KCkuYWRkSW5pdGlhbENoZWNrcG9pbnRzKCk7XG4gICAgICAgIGF3YWl0IEV2ZW50SW5kZXhQZWcuZ2V0KCkuc3RhcnRDcmF3bGVyKCk7XG4gICAgICAgIGF3YWl0IFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoJ2VuYWJsZUV2ZW50SW5kZXhpbmcnLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCB0cnVlKTtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29uZmlybUV2ZW50U3RvcmVSZXNldCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgeyBjbG9zZSB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKFNlc2hhdFJlc2V0RGlhbG9nLCB7XG4gICAgICAgICAgICBvbkZpbmlzaGVkOiBhc3luYyAoc3VjY2VzcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoJ2VuYWJsZUV2ZW50SW5kZXhpbmcnLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEV2ZW50SW5kZXhQZWcuZGVsZXRlRXZlbnRJbmRleCgpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm9uRW5hYmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gbnVsbDtcbiAgICAgICAgY29uc3QgSW5saW5lU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLklubGluZVNwaW5uZXInKTtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG5cbiAgICAgICAgaWYgKEV2ZW50SW5kZXhQZWcuZ2V0KCkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhpbmdTZXR0aW5ncyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiU2VjdXJlbHkgY2FjaGUgZW5jcnlwdGVkIG1lc3NhZ2VzIGxvY2FsbHkgZm9yIHRoZW0gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0byBhcHBlYXIgaW4gc2VhcmNoIHJlc3VsdHMsIHVzaW5nICUoc2l6ZSlzIHRvIHN0b3JlIG1lc3NhZ2VzIGZyb20gJShyb29tcylzIHJvb21zLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IGZvcm1hdEJ5dGVzKHRoaXMuc3RhdGUuZXZlbnRJbmRleFNpemUsIDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgZHJpdmVzIHRoZSBzaW5ndWxhciAvIHBsdXJhbCBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWxlY3Rpb24gZm9yIFwicm9vbVwiIC8gXCJyb29tc1wiIG9ubHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHRoaXMuc3RhdGUucm9vbUNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21zOiBmb3JtYXRDb3VudExvbmcodGhpcy5zdGF0ZS5yb29tQ291bnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5vbk1hbmFnZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiTWFuYWdlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUuZXZlbnRJbmRleGluZ0VuYWJsZWQgJiYgRXZlbnRJbmRleFBlZy5zdXBwb3J0SXNJbnN0YWxsZWQoKSkge1xuICAgICAgICAgICAgZXZlbnRJbmRleGluZ1NldHRpbmdzID0gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTZWN1cmVseSBjYWNoZSBlbmNyeXB0ZWQgbWVzc2FnZXMgbG9jYWxseSBmb3IgdGhlbSB0byBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImFwcGVhciBpbiBzZWFyY2ggcmVzdWx0cy5cIixcbiAgICAgICAgICAgICAgICAgICAgKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuZW5hYmxpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkVuYWJsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiRW5hYmxlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuZW5hYmxpbmcgPyA8SW5saW5lU3Bpbm5lciAvPiA6IDxkaXYgLz59XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChFdmVudEluZGV4UGVnLnBsYXRmb3JtSGFzU3VwcG9ydCgpICYmICFFdmVudEluZGV4UGVnLnN1cHBvcnRJc0luc3RhbGxlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBuYXRpdmVMaW5rID0gKFxuICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LWRlc2t0b3AvYmxvYi9kZXZlbG9wL1wiICtcbiAgICAgICAgICAgICAgICBcImRvY3MvbmF0aXZlLW5vZGUtbW9kdWxlcy5tZCNcIiArXG4gICAgICAgICAgICAgICAgXCJhZGRpbmctc2VzaGF0LWZvci1zZWFyY2gtaW4tZTJlLWVuY3J5cHRlZC1yb29tc1wiXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBldmVudEluZGV4aW5nU2V0dGluZ3MgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiJShicmFuZClzIGlzIG1pc3Npbmcgc29tZSBjb21wb25lbnRzIHJlcXVpcmVkIGZvciBzZWN1cmVseSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiY2FjaGluZyBlbmNyeXB0ZWQgbWVzc2FnZXMgbG9jYWxseS4gSWYgeW91J2QgbGlrZSB0byBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZXhwZXJpbWVudCB3aXRoIHRoaXMgZmVhdHVyZSwgYnVpbGQgYSBjdXN0b20gJShicmFuZClzIERlc2t0b3AgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIndpdGggPG5hdGl2ZUxpbms+c2VhcmNoIGNvbXBvbmVudHMgYWRkZWQ8L25hdGl2ZUxpbms+LlwiLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuZCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmF0aXZlTGluazogc3ViID0+IDxhIGhyZWY9e25hdGl2ZUxpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICl9PC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCFFdmVudEluZGV4UGVnLnBsYXRmb3JtSGFzU3VwcG9ydCgpKSB7XG4gICAgICAgICAgICBldmVudEluZGV4aW5nU2V0dGluZ3MgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiJShicmFuZClzIGNhbid0IHNlY3VyZWx5IGNhY2hlIGVuY3J5cHRlZCBtZXNzYWdlcyBsb2NhbGx5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ3aGlsZSBydW5uaW5nIGluIGEgd2ViIGJyb3dzZXIuIFVzZSA8ZGVza3RvcExpbms+JShicmFuZClzIERlc2t0b3A8L2Rlc2t0b3BMaW5rPiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZm9yIGVuY3J5cHRlZCBtZXNzYWdlcyB0byBhcHBlYXIgaW4gc2VhcmNoIHJlc3VsdHMuXCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNrdG9wTGluazogc3ViID0+IDxhIGhyZWY9XCJodHRwczovL2VsZW1lbnQuaW8vZ2V0LXN0YXJ0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPntzdWJ9PC9hPixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApfTwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50SW5kZXhpbmdTZXR0aW5ncyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmVuYWJsaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyA8SW5saW5lU3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJNZXNzYWdlIHNlYXJjaCBpbml0aWxpc2F0aW9uIGZhaWxlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgIHtFdmVudEluZGV4UGVnLmVycm9yICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkZXRhaWxzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PntfdChcIkFkdmFuY2VkXCIpfTwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge0V2ZW50SW5kZXhQZWcuZXJyb3IubWVzc2FnZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtleT1cImRlbGV0ZVwiIGtpbmQ9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLmNvbmZpcm1FdmVudFN0b3JlUmVzZXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiUmVzZXRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2RldGFpbHM+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV2ZW50SW5kZXhpbmdTZXR0aW5ncztcbiAgICB9XG59XG4iXX0=