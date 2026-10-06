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

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _createRoom = _interopRequireDefault(require("../../../../../createRoom"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var sdk = _interopRequireWildcard(require("../../../../../"));

var _PlatformPeg = _interopRequireDefault(require("../../../../../PlatformPeg"));

var KeyboardShortcuts = _interopRequireWildcard(require("../../../../../accessibility/KeyboardShortcuts"));

var _UpdateCheckButton = _interopRequireDefault(require("../../UpdateCheckButton"));

/*
Copyright 2019 New Vector Ltd
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
class HelpUserSettingsTab extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onClearCacheAndReload", e => {
      if (!_PlatformPeg.default.get()) return; // Dev note: please keep this log line, it's useful when troubleshooting a MatrixClient suddenly
      // stopping in the middle of the logs.

      console.log("Clear cache & reload clicked");

      _MatrixClientPeg.MatrixClientPeg.get().stopClient();

      _MatrixClientPeg.MatrixClientPeg.get().store.deleteAllData().then(() => {
        _PlatformPeg.default.get().reload();
      });
    });
    (0, _defineProperty2.default)(this, "_onBugReport", e => {
      const BugReportDialog = sdk.getComponent("dialogs.BugReportDialog");

      if (!BugReportDialog) {
        return;
      }

      _Modal.default.createTrackedDialog('Bug Report Dialog', '', BugReportDialog, {});
    });
    (0, _defineProperty2.default)(this, "_onStartBotChat", e => {
      this.props.closeSettingsFn();
      (0, _createRoom.default)({
        dmUserId: _SdkConfig.default.get().welcomeUserId,
        andView: true
      });
    });
    (0, _defineProperty2.default)(this, "_showSpoiler", event => {
      const target = event.target;
      target.innerHTML = target.getAttribute('data-spoiler');
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    });
    this.state = {
      appVersion: null,
      canUpdate: false
    };
  }

  componentDidMount()
  /*: void*/
  {
    _PlatformPeg.default.get().getAppVersion().then(ver => this.setState({
      appVersion: ver
    })).catch(e => {
      console.error("Error getting vector version: ", e);
    });

    _PlatformPeg.default.get().canSelfUpdate().then(v => this.setState({
      canUpdate: v
    })).catch(e => {
      console.error("Error getting self updatability: ", e);
    });
  }

  _renderLegal() {
    const tocLinks = _SdkConfig.default.get().terms_and_conditions_links;

    if (!tocLinks) return null;
    const legalLinks = [];

    for (const tocEntry of _SdkConfig.default.get().terms_and_conditions_links) {
      legalLinks.push( /*#__PURE__*/_react.default.createElement("div", {
        key: tocEntry.url
      }, /*#__PURE__*/_react.default.createElement("a", {
        href: tocEntry.url,
        rel: "noreferrer noopener",
        target: "_blank"
      }, tocEntry.text)));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_HelpUserSettingsTab_versions"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Legal")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, legalLinks));
  }

  _renderCredits() {
    // Note: This is not translated because it is legal text.
    // Also, &nbsp; is ugly but necessary.
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Credits")), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, "The ", /*#__PURE__*/_react.default.createElement("a", {
      href: "themes/element/img/backgrounds/lake.jpg",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "default cover photo"), " is \xA9\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://www.flickr.com/golan",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Jes\xFAs Roncero"), ' ', "used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://creativecommons.org/licenses/by-sa/4.0/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "CC-BY-SA 4.0"), "."), /*#__PURE__*/_react.default.createElement("li", null, "The ", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://github.com/matrix-org/twemoji-colr",
      rel: "noreferrer noopener",
      target: "_blank"
    }, " twemoji-colr"), " font is \xA9\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://mozilla.org",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Mozilla Foundation"), ' ', "used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "http://www.apache.org/licenses/LICENSE-2.0",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Apache 2.0"), "."), /*#__PURE__*/_react.default.createElement("li", null, "The ", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://twemoji.twitter.com/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Twemoji"), " emoji art is \xA9\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://twemoji.twitter.com/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Twitter, Inc and other contributors"), " used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://creativecommons.org/licenses/by/4.0/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "CC-BY 4.0"), ".")));
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    let faqText = (0, _languageHandler._t)('For help with using %(brand)s, click <a>here</a>.', {
      brand
    }, {
      'a': sub => /*#__PURE__*/_react.default.createElement("a", {
        href: "https://element.io/help",
        rel: "noreferrer noopener",
        target: "_blank"
      }, sub)
    });

    if (_SdkConfig.default.get().welcomeUserId && (0, _languageHandler.getCurrentLanguage)().startsWith('en')) {
      faqText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('For help with using %(brand)s, click <a>here</a> or start a chat with our ' + 'bot using the button below.', {
        brand
      }, {
        'a': sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://element.io/help",
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub)
      }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onStartBotChat,
        kind: "primary"
      }, (0, _languageHandler._t)("Chat with %(brand)s Bot", {
        brand
      }))));
    }

    const appVersion = this.state.appVersion || 'unknown';

    let olmVersion = _MatrixClientPeg.MatrixClientPeg.get().olmVersion;

    olmVersion = olmVersion ? `${olmVersion[0]}.${olmVersion[1]}.${olmVersion[2]}` : '<not-enabled>';
    let updateButton = null;

    if (this.state.canUpdate) {
      updateButton = /*#__PURE__*/_react.default.createElement(_UpdateCheckButton.default, null);
    }

    let bugReportingSection;

    if (_SdkConfig.default.get().bug_report_endpoint_url) {
      bugReportingSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_section"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, _languageHandler._t)('Bug reporting')), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("If you've submitted a bug via GitHub, debug logs can help " + "us track down the problem. Debug logs contain application " + "usage data including your username, the IDs or aliases of " + "the rooms or groups you have visited and the usernames of " + "other users. They do not contain messages."), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_HelpUserSettingsTab_debugButton"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onBugReport,
        kind: "primary"
      }, (0, _languageHandler._t)("Submit debug logs"))), (0, _languageHandler._t)("To report a Matrix-related security issue, please read the Matrix.org " + "<a>Security Disclosure Policy</a>.", {}, {
        'a': sub => /*#__PURE__*/_react.default.createElement("a", {
          href: "https://matrix.org/security-disclosure-policy/",
          rel: "noreferrer noopener",
          target: "_blank"
        }, sub)
      })));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_HelpUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Help & About")), bugReportingSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("FAQ")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, faqText), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: KeyboardShortcuts.toggleDialog
    }, (0, _languageHandler._t)("Keyboard Shortcuts"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_HelpUserSettingsTab_versions"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Versions")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)("%(brand)s version:", {
      brand
    }), " ", appVersion, /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("olm version:"), " ", olmVersion, /*#__PURE__*/_react.default.createElement("br", null), updateButton)), this._renderLegal(), this._renderCredits(), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_HelpUserSettingsTab_versions"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)("Homeserver is"), " ", /*#__PURE__*/_react.default.createElement("code", null, _MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl()), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Identity Server is"), " ", /*#__PURE__*/_react.default.createElement("code", null, _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Access Token:") + ' ', /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      element: "span",
      onClick: this._showSpoiler,
      "data-spoiler": _MatrixClientPeg.MatrixClientPeg.get().getAccessToken()
    }, "<", (0, _languageHandler._t)("click to reveal"), ">"), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_HelpUserSettingsTab_debugButton"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._onClearCacheAndReload,
      kind: "danger"
    }, (0, _languageHandler._t)("Clear cache and reload"))))));
  }

}

exports.default = HelpUserSettingsTab;
(0, _defineProperty2.default)(HelpUserSettingsTab, "propTypes", {
  closeSettingsFn: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9IZWxwVXNlclNldHRpbmdzVGFiLmpzIl0sIm5hbWVzIjpbIkhlbHBVc2VyU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiZSIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwiY29uc29sZSIsImxvZyIsIk1hdHJpeENsaWVudFBlZyIsInN0b3BDbGllbnQiLCJzdG9yZSIsImRlbGV0ZUFsbERhdGEiLCJ0aGVuIiwicmVsb2FkIiwiQnVnUmVwb3J0RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwicHJvcHMiLCJjbG9zZVNldHRpbmdzRm4iLCJkbVVzZXJJZCIsIlNka0NvbmZpZyIsIndlbGNvbWVVc2VySWQiLCJhbmRWaWV3IiwiZXZlbnQiLCJ0YXJnZXQiLCJpbm5lckhUTUwiLCJnZXRBdHRyaWJ1dGUiLCJyYW5nZSIsImRvY3VtZW50IiwiY3JlYXRlUmFuZ2UiLCJzZWxlY3ROb2RlQ29udGVudHMiLCJzZWxlY3Rpb24iLCJ3aW5kb3ciLCJnZXRTZWxlY3Rpb24iLCJyZW1vdmVBbGxSYW5nZXMiLCJhZGRSYW5nZSIsInN0YXRlIiwiYXBwVmVyc2lvbiIsImNhblVwZGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiZ2V0QXBwVmVyc2lvbiIsInZlciIsInNldFN0YXRlIiwiY2F0Y2giLCJlcnJvciIsImNhblNlbGZVcGRhdGUiLCJ2IiwiX3JlbmRlckxlZ2FsIiwidG9jTGlua3MiLCJ0ZXJtc19hbmRfY29uZGl0aW9uc19saW5rcyIsImxlZ2FsTGlua3MiLCJ0b2NFbnRyeSIsInB1c2giLCJ1cmwiLCJ0ZXh0IiwiX3JlbmRlckNyZWRpdHMiLCJyZW5kZXIiLCJicmFuZCIsImZhcVRleHQiLCJzdWIiLCJzdGFydHNXaXRoIiwiX29uU3RhcnRCb3RDaGF0Iiwib2xtVmVyc2lvbiIsInVwZGF0ZUJ1dHRvbiIsImJ1Z1JlcG9ydGluZ1NlY3Rpb24iLCJidWdfcmVwb3J0X2VuZHBvaW50X3VybCIsIl9vbkJ1Z1JlcG9ydCIsIktleWJvYXJkU2hvcnRjdXRzIiwidG9nZ2xlRGlhbG9nIiwiZ2V0SG9tZXNlcnZlclVybCIsImdldElkZW50aXR5U2VydmVyVXJsIiwiX3Nob3dTcG9pbGVyIiwiZ2V0QWNjZXNzVG9rZW4iLCJfb25DbGVhckNhY2hlQW5kUmVsb2FkIiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZWUsTUFBTUEsbUJBQU4sU0FBa0NDLGVBQU1DLFNBQXhDLENBQWtEO0FBSzdEQyxFQUFBQSxXQUFXLEdBQUc7QUFDVjtBQURVLGtFQWtCWUMsQ0FBRCxJQUFPO0FBQzVCLFVBQUksQ0FBQ0MscUJBQVlDLEdBQVosRUFBTCxFQUF3QixPQURJLENBRzVCO0FBQ0E7O0FBQ0FDLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLDhCQUFaOztBQUNBQyx1Q0FBZ0JILEdBQWhCLEdBQXNCSSxVQUF0Qjs7QUFDQUQsdUNBQWdCSCxHQUFoQixHQUFzQkssS0FBdEIsQ0FBNEJDLGFBQTVCLEdBQTRDQyxJQUE1QyxDQUFpRCxNQUFNO0FBQ25EUiw2QkFBWUMsR0FBWixHQUFrQlEsTUFBbEI7QUFDSCxPQUZEO0FBR0gsS0E1QmE7QUFBQSx3REE4QkVWLENBQUQsSUFBTztBQUNsQixZQUFNVyxlQUFlLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix5QkFBakIsQ0FBeEI7O0FBQ0EsVUFBSSxDQUFDRixlQUFMLEVBQXNCO0FBQ2xCO0FBQ0g7O0FB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LGVBSUksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxPQUFPLEVBQUMsTUFBMUI7QUFBaUMsTUFBQSxPQUFPLEVBQUUsS0FBS0MsWUFBL0M7QUFDa0Isc0JBQWNqRSxpQ0FBZ0JILEdBQWhCLEdBQXNCcUUsY0FBdEI7QUFEaEMsWUFFVSx5QkFBRyxpQkFBSCxDQUZWLE1BSkosZUFRSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxPQUFPLEVBQUUsS0FBS0Msc0JBQWhDO0FBQXdELE1BQUEsSUFBSSxFQUFDO0FBQTdELE9BQ0sseUJBQUcsd0JBQUgsQ0FETCxDQURKLENBUkosQ0FGSixDQXRCSixDQURKO0FBMENIOztBQTNQNEQ7Ozs4QkFBNUM1RSxtQixlQUNFO0FBQ2ZxQixFQUFBQSxlQUFlLEVBQUV3RCxtQkFBVUMsSUFBVixDQUFlQztBQURqQixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtfdCwgZ2V0Q3VycmVudExhbmd1YWdlfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IGNyZWF0ZVJvb20gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2NyZWF0ZVJvb21cIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgKiBhcyBLZXlib2FyZFNob3J0Y3V0cyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IFVwZGF0ZUNoZWNrQnV0dG9uIGZyb20gXCIuLi8uLi9VcGRhdGVDaGVja0J1dHRvblwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWxwVXNlclNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBjbG9zZVNldHRpbmdzRm46IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBhcHBWZXJzaW9uOiBudWxsLFxuICAgICAgICAgICAgY2FuVXBkYXRlOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0QXBwVmVyc2lvbigpLnRoZW4oKHZlcikgPT4gdGhpcy5zZXRTdGF0ZSh7YXBwVmVyc2lvbjogdmVyfSkpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZ2V0dGluZyB2ZWN0b3IgdmVyc2lvbjogXCIsIGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkuY2FuU2VsZlVwZGF0ZSgpLnRoZW4oKHYpID0+IHRoaXMuc2V0U3RhdGUoe2NhblVwZGF0ZTogdn0pKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGdldHRpbmcgc2VsZiB1cGRhdGFiaWxpdHk6IFwiLCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uQ2xlYXJDYWNoZUFuZFJlbG9hZCA9IChlKSA9PiB7XG4gICAgICAgIGlmICghUGxhdGZvcm1QZWcuZ2V0KCkpIHJldHVybjtcblxuICAgICAgICAvLyBEZXYgbm90ZTogcGxlYXNlIGtlZXAgdGhpcyBsb2cgbGluZSwgaXQncyB1c2VmdWwgd2hlbiB0cm91Ymxlc2hvb3RpbmcgYSBNYXRyaXhDbGllbnQgc3VkZGVubHlcbiAgICAgICAgLy8gc3RvcHBpbmcgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbG9ncy5cbiAgICAgICAgY29uc29sZS5sb2coXCJDbGVhciBjYWNoZSAmIHJlbG9hZCBjbGlja2VkXCIpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcENsaWVudCgpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcmUuZGVsZXRlQWxsRGF0YSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkucmVsb2FkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25CdWdSZXBvcnQgPSAoZSkgPT4ge1xuICAgICAgICBjb25zdCBCdWdSZXBvcnREaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5CdWdSZXBvcnREaWFsb2dcIik7XG4gICAgICAgIGlmICghQnVnUmVwb3J0RGlhbG9nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQnVnIFJlcG9ydCBEaWFsb2cnLCAnJywgQnVnUmVwb3J0RGlhbG9nLCB7fSk7XG4gICAgfTtcblxuICAgIF9vblN0YXJ0Qm90Q2hhdCA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMuY2xvc2VTZXR0aW5nc0ZuKCk7XG4gICAgICAgIGNyZWF0ZVJvb20oe1xuICAgICAgICAgICAgZG1Vc2VySWQ6IFNka0NvbmZpZy5nZXQoKS53ZWxjb21lVXNlcklkLFxuICAgICAgICAgICAgYW5kVmlldzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9zaG93U3BvaWxlciA9IChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNwb2lsZXInKTtcblxuICAgICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyh0YXJnZXQpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH07XG5cbiAgICBfcmVuZGVyTGVnYWwoKSB7XG4gICAgICAgIGNvbnN0IHRvY0xpbmtzID0gU2RrQ29uZmlnLmdldCgpLnRlcm1zX2FuZF9jb25kaXRpb25zX2xpbmtzO1xuICAgICAgICBpZiAoIXRvY0xpbmtzKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBsZWdhbExpbmtzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdG9jRW50cnkgb2YgU2RrQ29uZmlnLmdldCgpLnRlcm1zX2FuZF9jb25kaXRpb25zX2xpbmtzKSB7XG4gICAgICAgICAgICBsZWdhbExpbmtzLnB1c2goPGRpdiBrZXk9e3RvY0VudHJ5LnVybH0+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj17dG9jRW50cnkudXJsfSByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3RvY0VudHJ5LnRleHR9PC9hPlxuICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9IZWxwVXNlclNldHRpbmdzVGFiX3ZlcnNpb25zJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIkxlZ2FsXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7bGVnYWxMaW5rc31cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9yZW5kZXJDcmVkaXRzKCkge1xuICAgICAgICAvLyBOb3RlOiBUaGlzIGlzIG5vdCB0cmFuc2xhdGVkIGJlY2F1c2UgaXQgaXMgbGVnYWwgdGV4dC5cbiAgICAgICAgLy8gQWxzbywgJm5ic3A7IGlzIHVnbHkgYnV0IG5lY2Vzc2FyeS5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIkNyZWRpdHNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgVGhlIDxhIGhyZWY9XCJ0aGVtZXMvZWxlbWVudC9pbWcvYmFja2dyb3VuZHMvbGFrZS5qcGdcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0IGNvdmVyIHBob3RvPC9hPiBpcyDCqSZuYnNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vd3d3LmZsaWNrci5jb20vZ29sYW5cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+SmVzw7pzIFJvbmNlcm88L2E+eycgJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQgdW5kZXIgdGhlIHRlcm1zIG9mJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzQuMC9cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBDQy1CWS1TQSA0LjA8L2E+LlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICBUaGUgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3R3ZW1vamktY29sclwiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiPiB0d2Vtb2ppLWNvbHI8L2E+IGZvbnQgaXMgwqkmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL21vemlsbGEub3JnXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPk1vemlsbGEgRm91bmRhdGlvbjwvYT57JyAnfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlZCB1bmRlciB0aGUgdGVybXMgb2YmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBBcGFjaGUgMi4wPC9hPi5cbiAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgVGhlIDxhIGhyZWY9XCJodHRwczovL3R3ZW1vamkudHdpdHRlci5jb20vXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgVHdlbW9qaTwvYT4gZW1vamkgYXJ0IGlzIMKpJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly90d2Vtb2ppLnR3aXR0ZXIuY29tL1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIiB0YXJnZXQ9XCJfYmxhbmtcIj5Ud2l0dGVyLCBJbmMgYW5kIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnM8L2E+IHVzZWQgdW5kZXIgdGhlIHRlcm1zIG9mJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzQuMC9cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICBDQy1CWSA0LjA8L2E+LlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuXG4gICAgICAgIGxldCBmYXFUZXh0ID0gX3QoXG4gICAgICAgICAgICAnRm9yIGhlbHAgd2l0aCB1c2luZyAlKGJyYW5kKXMsIGNsaWNrIDxhPmhlcmU8L2E+LicsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnJhbmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4gPGFcbiAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZWxlbWVudC5pby9oZWxwXCJcbiAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgIDwvYT4sXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLndlbGNvbWVVc2VySWQgJiYgZ2V0Q3VycmVudExhbmd1YWdlKCkuc3RhcnRzV2l0aCgnZW4nKSkge1xuICAgICAgICAgICAgZmFxVGV4dCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAnRm9yIGhlbHAgd2l0aCB1c2luZyAlKGJyYW5kKXMsIGNsaWNrIDxhPmhlcmU8L2E+IG9yIHN0YXJ0IGEgY2hhdCB3aXRoIG91ciAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdib3QgdXNpbmcgdGhlIGJ1dHRvbiBiZWxvdy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9XCJodHRwczovL2VsZW1lbnQuaW8vaGVscFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbD0nbm9yZWZlcnJlciBub29wZW5lcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PSdfYmxhbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25TdGFydEJvdENoYXR9IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkNoYXQgd2l0aCAlKGJyYW5kKXMgQm90XCIsIHsgYnJhbmQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFwcFZlcnNpb24gPSB0aGlzLnN0YXRlLmFwcFZlcnNpb24gfHwgJ3Vua25vd24nO1xuXG4gICAgICAgIGxldCBvbG1WZXJzaW9uID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLm9sbVZlcnNpb247XG4gICAgICAgIG9sbVZlcnNpb24gPSBvbG1WZXJzaW9uID8gYCR7b2xtVmVyc2lvblswXX0uJHtvbG1WZXJzaW9uWzFdfS4ke29sbVZlcnNpb25bMl19YCA6ICc8bm90LWVuYWJsZWQ+JztcblxuICAgICAgICBsZXQgdXBkYXRlQnV0dG9uID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuVXBkYXRlKSB7XG4gICAgICAgICAgICB1cGRhdGVCdXR0b24gPSA8VXBkYXRlQ2hlY2tCdXR0b24gLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYnVnUmVwb3J0aW5nU2VjdGlvbjtcbiAgICAgICAgaWYgKFNka0NvbmZpZy5nZXQoKS5idWdfcmVwb3J0X2VuZHBvaW50X3VybCkge1xuICAgICAgICAgICAgYnVnUmVwb3J0aW5nU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoJ0J1ZyByZXBvcnRpbmcnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3QoIFwiSWYgeW91J3ZlIHN1Ym1pdHRlZCBhIGJ1ZyB2aWEgR2l0SHViLCBkZWJ1ZyBsb2dzIGNhbiBoZWxwIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1cyB0cmFjayBkb3duIHRoZSBwcm9ibGVtLiBEZWJ1ZyBsb2dzIGNvbnRhaW4gYXBwbGljYXRpb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInVzYWdlIGRhdGEgaW5jbHVkaW5nIHlvdXIgdXNlcm5hbWUsIHRoZSBJRHMgb3IgYWxpYXNlcyBvZiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIHJvb21zIG9yIGdyb3VwcyB5b3UgaGF2ZSB2aXNpdGVkIGFuZCB0aGUgdXNlcm5hbWVzIG9mIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvdGhlciB1c2Vycy4gVGhleSBkbyBub3QgY29udGFpbiBtZXNzYWdlcy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSGVscFVzZXJTZXR0aW5nc1RhYl9kZWJ1Z0J1dHRvbic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fb25CdWdSZXBvcnR9IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJTdWJtaXQgZGVidWcgbG9nc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdCggXCJUbyByZXBvcnQgYSBNYXRyaXgtcmVsYXRlZCBzZWN1cml0eSBpc3N1ZSwgcGxlYXNlIHJlYWQgdGhlIE1hdHJpeC5vcmcgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxhPlNlY3VyaXR5IERpc2Nsb3N1cmUgUG9saWN5PC9hPi5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9tYXRyaXgub3JnL3NlY3VyaXR5LWRpc2Nsb3N1cmUtcG9saWN5L1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPntzdWJ9PC9hPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWIgbXhfSGVscFVzZXJTZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIkhlbHAgJiBBYm91dFwiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICB7IGJ1Z1JlcG9ydGluZ1NlY3Rpb24gfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJGQVFcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAge2ZhcVRleHR9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e0tleWJvYXJkU2hvcnRjdXRzLnRvZ2dsZURpYWxvZ30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiS2V5Ym9hcmQgU2hvcnRjdXRzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X0hlbHBVc2VyU2V0dGluZ3NUYWJfdmVyc2lvbnMnPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIlZlcnNpb25zXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIiUoYnJhbmQpcyB2ZXJzaW9uOlwiLCB7IGJyYW5kIH0pfSB7YXBwVmVyc2lvbn08YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIm9sbSB2ZXJzaW9uOlwiKX0ge29sbVZlcnNpb259PGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dXBkYXRlQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyTGVnYWwoKX1cbiAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyQ3JlZGl0cygpfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X0hlbHBVc2VyU2V0dGluZ3NUYWJfdmVyc2lvbnMnPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdChcIkFkdmFuY2VkXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkhvbWVzZXJ2ZXIgaXNcIil9IDxjb2RlPntNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SG9tZXNlcnZlclVybCgpfTwvY29kZT48YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIklkZW50aXR5IFNlcnZlciBpc1wiKX0gPGNvZGU+e01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpfTwvY29kZT48YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkFjY2VzcyBUb2tlbjpcIikgKyAnICd9XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBlbGVtZW50PVwic3BhblwiIG9uQ2xpY2s9e3RoaXMuX3Nob3dTcG9pbGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1zcG9pbGVyPXtNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0QWNjZXNzVG9rZW4oKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJmx0O3sgX3QoXCJjbGljayB0byByZXZlYWxcIikgfSZndDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9IZWxwVXNlclNldHRpbmdzVGFiX2RlYnVnQnV0dG9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkNsZWFyQ2FjaGVBbmRSZWxvYWR9IGtpbmQ9J2Rhbmdlcic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkNsZWFyIGNhY2hlIGFuZCByZWxvYWRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19