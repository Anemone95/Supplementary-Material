"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _createRoom = _interopRequireDefault(require("../../../../../createRoom"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var sdk = _interopRequireWildcard(require("../../../../.."));

var _PlatformPeg = _interopRequireDefault(require("../../../../../PlatformPeg"));

var KeyboardShortcuts = _interopRequireWildcard(require("../../../../../accessibility/KeyboardShortcuts"));

var _UpdateCheckButton = _interopRequireDefault(require("../../UpdateCheckButton"));

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _temp;

let HelpUserSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.user.HelpUserSettingsTab"), _dec(_class = (_temp = class HelpUserSettingsTab extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onClearCacheAndReload", e => {
      if (!_PlatformPeg.default.get()) return; // Dev note: please keep this log line, it's useful when troubleshooting a MatrixClient suddenly
      // stopping in the middle of the logs.

      console.log("Clear cache & reload clicked");

      _MatrixClientPeg.MatrixClientPeg.get().stopClient();

      _MatrixClientPeg.MatrixClientPeg.get().store.deleteAllData().then(() => {
        _PlatformPeg.default.get().reload();
      });
    });
    (0, _defineProperty2.default)(this, "onBugReport", e => {
      const BugReportDialog = sdk.getComponent("dialogs.BugReportDialog");

      if (!BugReportDialog) {
        return;
      }

      _Modal.default.createTrackedDialog('Bug Report Dialog', '', BugReportDialog, {});
    });
    (0, _defineProperty2.default)(this, "onStartBotChat", e => {
      this.props.closeSettingsFn();
      (0, _createRoom.default)({
        dmUserId: _SdkConfig.default.get().welcomeUserId,
        andView: true
      });
    });
    (0, _defineProperty2.default)(this, "showSpoiler", event => {
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

  renderLegal() {
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

  renderCredits() {
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
    }, "Jes\xFAs Roncero"), " used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://creativecommons.org/licenses/by-sa/4.0/",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "CC-BY-SA 4.0"), "."), /*#__PURE__*/_react.default.createElement("li", null, "The ", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://github.com/matrix-org/twemoji-colr",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "twemoji-colr"), " font is \xA9\xA0", /*#__PURE__*/_react.default.createElement("a", {
      href: "https://mozilla.org",
      rel: "noreferrer noopener",
      target: "_blank"
    }, "Mozilla Foundation"), " used under the terms of\xA0", /*#__PURE__*/_react.default.createElement("a", {
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
        onClick: this.onStartBotChat,
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
        onClick: this.onBugReport,
        kind: "primary"
      }, (0, _languageHandler._t)("Submit debug logs"))), (0, _languageHandler._t)("To report a Matrix-related security issue, please read the Matrix.org " + "<a>Security Disclosure Policy</a>.", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
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
    }), " ", appVersion, /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("olm version:"), " ", olmVersion, /*#__PURE__*/_react.default.createElement("br", null), updateButton)), this.renderLegal(), this.renderCredits(), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_HelpUserSettingsTab_versions"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)("Homeserver is"), " ", /*#__PURE__*/_react.default.createElement("code", null, _MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl()), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Identity Server is"), " ", /*#__PURE__*/_react.default.createElement("code", null, _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Access Token:") + ' ', /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      element: "span",
      onClick: this.showSpoiler,
      "data-spoiler": _MatrixClientPeg.MatrixClientPeg.get().getAccessToken()
    }, "<", (0, _languageHandler._t)("click to reveal"), ">"), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_HelpUserSettingsTab_debugButton"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onClearCacheAndReload,
      kind: "danger"
    }, (0, _languageHandler._t)("Clear cache and reload"))))));
  }

}, _temp)) || _class);
exports.default = HelpUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9IZWxwVXNlclNldHRpbmdzVGFiLnRzeCJdLCJuYW1lcyI6WyJIZWxwVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZSIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwiY29uc29sZSIsImxvZyIsIk1hdHJpeENsaWVudFBlZyIsInN0b3BDbGllbnQiLCJzdG9yZSIsImRlbGV0ZUFsbERhdGEiLCJ0aGVuIiwicmVsb2FkIiwiQnVnUmVwb3J0RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiY2xvc2VTZXR0aW5nc0ZuIiwiZG1Vc2VySWQiLCJTZGtDb25maWciLCJ3ZWxjb21lVXNlcklkIiwiYW5kVmlldyIsImV2ZW50IiwidGFyZ2V0IiwiaW5uZXJIVE1MIiwiZ2V0QXR0cmlidXRlIiwicmFuZ2UiLCJkb2N1bWVudCIsImNyZWF0ZVJhbmdlIiwic2VsZWN0Tm9kZUNvbnRlbnRzIiwic2VsZWN0aW9uIiwid2luZG93IiwiZ2V0U2VsZWN0aW9uIiwicmVtb3ZlQWxsUmFuZ2VzIiwiYWRkUmFuZ2UiLCJzdGF0ZSIsImFwcFZlcnNpb24iLCJjYW5VcGRhdGUiLCJjb21wb25lbnREaWRNb3VudCIsImdldEFwcFZlcnNpb24iLCJ2ZXIiLCJzZXRTdGF0ZSIsImNhdGNoIiwiZXJyb3IiLCJjYW5TZWxmVXBkYXRlIiwidiIsInJlbmRlckxlZ2FsIiwidG9jTGlua3MiLCJ0ZXJtc19hbmRfY29uZGl0aW9uc19saW5rcyIsImxlZ2FsTGlua3MiLCJ0b2NFbnRyeSIsInB1c2giLCJ1cmwiLCJ0ZXh0IiwicmVuZGVyQ3JlZGl0cyIsInJlbmRlciIsImJyYW5kIiwiZmFxVGV4dCIsInN1YiIsInN0YXJ0c1dpdGgiLCJvblN0YXJ0Qm90Q2hhdCIsIm9sbVZlcnNpb24iLCJ1cGRhdGVCdXR0b24iLCJidWdSZXBvcnRpbmdTZWN0aW9uIiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJvbkJ1Z1JlcG9ydCIsImEiLCJLZXlib2FyZFNob3J0Y3V0cyIsInRvZ2dsZURpYWxvZyIsImdldEhvbWVzZXJ2ZXJVcmwiLCJnZXRJZGVudGl0eVNlcnZlclVybCIsInNob3dTcG9pbGVyIiwiZ2V0QWNjZXNzVG9rZW4iLCJvbkNsZWFyQ2FjaGVBbmRSZWxvYWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFZcUJBLG1CLFdBRHBCLGdEQUFxQiw4Q0FBckIsQyx5QkFBRCxNQUNxQkEsbUJBRHJCLFNBQ2lEQyxlQUFNQztBQUR2RDtBQUNpRjtBQUM3RUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsaUVBa0JjQyxDQUFELElBQU87QUFDbkMsVUFBSSxDQUFDQyxxQkFBWUMsR0FBWixFQUFMLEVBQXdCLE9BRFcsQ0FHbkM7QUFDQTs7QUFDQUMsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksOEJBQVo7O0FBQ0FDLHVDQUFnQkgsR0FBaEIsR0FBc0JJLFVBQXRCOztBQUNBRCx1Q0FBZ0JILEdBQWhCLEdBQXNCSyxLQUF0QixDQUE0QkMsYUFBNUIsR0FBNENDLElBQTVDLENBQWlELE1BQU07QUFDbkRSLDZCQUFZQyxHQUFaLEdBQWtCUSxNQUFsQjtBQUNILE9BRkQ7QUFHSCxLQTVCa0I7QUFBQSx1REE4QklWLENBQUQsSUFBTztBQUN6QixZQUFNVyxlQUFlLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix5QkFBakIsQ0FBeEI7O0FBQ0EsVUFBSSxDQUFDRixlQUFMLEVBQXNCO0FBQ2xCO0FBQ0g7O0FBQ0RHLHFCQUFNQyxtQkFBTixDQUEwQixtQkFBMUIsRUFBK0MsRUFBL0MsRUFBbURKLGVBQW5E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O0FBQ0ksc0JBQWNqRSxpQ0FBZ0JILEdBQWhCLEdBQXNCcUUsY0FBdEI7QUFEbEIsWUFHVSx5QkFBRyxpQkFBSCxDQUhWLE1BSkosZUFTSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxPQUFPLEVBQUUsS0FBS0MscUJBQWhDO0FBQXVELE1BQUEsSUFBSSxFQUFDO0FBQTVELE9BQ0sseUJBQUcsd0JBQUgsQ0FETCxDQURKLENBVEosQ0FGSixDQXRCSixDQURKO0FBMkNIOztBQXZQNEUsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7X3QsIGdldEN1cnJlbnRMYW5ndWFnZX0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBjcmVhdGVSb29tIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uLy4uXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgKiBhcyBLZXlib2FyZFNob3J0Y3V0cyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IFVwZGF0ZUNoZWNrQnV0dG9uIGZyb20gXCIuLi8uLi9VcGRhdGVDaGVja0J1dHRvblwiO1xuaW1wb3J0IHsgcmVwbGFjZWFibGVDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgY2xvc2VTZXR0aW5nc0ZuOiAoKSA9PiB7fTtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgYXBwVmVyc2lvbjogc3RyaW5nO1xuICAgIGNhblVwZGF0ZTogYm9vbGVhbjtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MudGFicy51c2VyLkhlbHBVc2VyU2V0dGluZ3NUYWJcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBVc2VyU2V0dGluZ3NUYWIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGFwcFZlcnNpb246IG51bGwsXG4gICAgICAgICAgICBjYW5VcGRhdGU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRBcHBWZXJzaW9uKCkudGhlbigodmVyKSA9PiB0aGlzLnNldFN0YXRlKHthcHBWZXJzaW9uOiB2ZXJ9KSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBnZXR0aW5nIHZlY3RvciB2ZXJzaW9uOiBcIiwgZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5jYW5TZWxmVXBkYXRlKCkudGhlbigodikgPT4gdGhpcy5zZXRTdGF0ZSh7Y2FuVXBkYXRlOiB2fSkpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZ2V0dGluZyBzZWxmIHVwZGF0YWJpbGl0eTogXCIsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2xlYXJDYWNoZUFuZFJlbG9hZCA9IChlKSA9PiB7XG4gICAgICAgIGlmICghUGxhdGZvcm1QZWcuZ2V0KCkpIHJldHVybjtcblxuICAgICAgICAvLyBEZXYgbm90ZTogcGxlYXNlIGtlZXAgdGhpcyBsb2cgbGluZSwgaXQncyB1c2VmdWwgd2hlbiB0cm91Ymxlc2hvb3RpbmcgYSBNYXRyaXhDbGllbnQgc3VkZGVubHlcbiAgICAgICAgLy8gc3RvcHBpbmcgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbG9ncy5cbiAgICAgICAgY29uc29sZS5sb2coXCJDbGVhciBjYWNoZSAmIHJlbG9hZCBjbGlja2VkXCIpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcENsaWVudCgpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcmUuZGVsZXRlQWxsRGF0YSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkucmVsb2FkKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQnVnUmVwb3J0ID0gKGUpID0+IHtcbiAgICAgICAgY29uc3QgQnVnUmVwb3J0RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQnVnUmVwb3J0RGlhbG9nXCIpO1xuICAgICAgICBpZiAoIUJ1Z1JlcG9ydERpYWxvZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0J1ZyBSZXBvcnQgRGlhbG9nJywgJycsIEJ1Z1JlcG9ydERpYWxvZywge30pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3RhcnRCb3RDaGF0ID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5jbG9zZVNldHRpbmdzRm4oKTtcbiAgICAgICAgY3JlYXRlUm9vbSh7XG4gICAgICAgICAgICBkbVVzZXJJZDogU2RrQ29uZmlnLmdldCgpLndlbGNvbWVVc2VySWQsXG4gICAgICAgICAgICBhbmRWaWV3OiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzaG93U3BvaWxlciA9IChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNwb2lsZXInKTtcblxuICAgICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyh0YXJnZXQpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckxlZ2FsKCkge1xuICAgICAgICBjb25zdCB0b2NMaW5rcyA9IFNka0NvbmZpZy5nZXQoKS50ZXJtc19hbmRfY29uZGl0aW9uc19saW5rcztcbiAgICAgICAgaWYgKCF0b2NMaW5rcykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbGVnYWxMaW5rcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHRvY0VudHJ5IG9mIFNka0NvbmZpZy5nZXQoKS50ZXJtc19hbmRfY29uZGl0aW9uc19saW5rcykge1xuICAgICAgICAgICAgbGVnYWxMaW5rcy5wdXNoKDxkaXYga2V5PXt0b2NFbnRyeS51cmx9PlxuICAgICAgICAgICAgICAgIDxhIGhyZWY9e3RvY0VudHJ5LnVybH0gcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiPnt0b2NFbnRyeS50ZXh0fTwvYT5cbiAgICAgICAgICAgIDwvZGl2Pik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfSGVscFVzZXJTZXR0aW5nc1RhYl92ZXJzaW9ucyc+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJMZWdhbFwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAge2xlZ2FsTGlua3N9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckNyZWRpdHMoKSB7XG4gICAgICAgIC8vIE5vdGU6IFRoaXMgaXMgbm90IHRyYW5zbGF0ZWQgYmVjYXVzZSBpdCBpcyBsZWdhbCB0ZXh0LlxuICAgICAgICAvLyBBbHNvLCAmbmJzcDsgaXMgdWdseSBidXQgbmVjZXNzYXJ5LlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24nPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiQ3JlZGl0c1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICBUaGUgPGEgaHJlZj1cInRoZW1lcy9lbGVtZW50L2ltZy9iYWNrZ3JvdW5kcy9sYWtlLmpwZ1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiPmRlZmF1bHQgY292ZXIgcGhvdG88L2E+IGlzIMKpJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZmxpY2tyLmNvbS9nb2xhblwiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiPkplc8O6cyBSb25jZXJvPC9hPiB1c2VkIHVuZGVyIHRoZSB0ZXJtcyBvZiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS1zYS80LjAvXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCI+Q0MtQlktU0EgNC4wPC9hPi5cbiAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgVGhlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy90d2Vtb2ppLWNvbHJcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIj50d2Vtb2ppLWNvbHI8L2E+IGZvbnQgaXMgwqkmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL21vemlsbGEub3JnXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCI+TW96aWxsYSBGb3VuZGF0aW9uPC9hPiB1c2VkIHVuZGVyIHRoZSB0ZXJtcyBvZiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFwiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiPkFwYWNoZSAyLjA8L2E+LlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICBUaGUgPGEgaHJlZj1cImh0dHBzOi8vdHdlbW9qaS50d2l0dGVyLmNvbS9cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIj5Ud2Vtb2ppPC9hPiBlbW9qaSBhcnQgaXMgwqkmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3R3ZW1vamkudHdpdHRlci5jb20vXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCI+VHdpdHRlciwgSW5jIGFuZCBvdGhlciBjb250cmlidXRvcnM8L2E+IHVzZWQgdW5kZXIgdGhlIHRlcm1zIG9mJm5ic3A7XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzQuMC9cIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIj5DQy1CWSA0LjA8L2E+LlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuXG4gICAgICAgIGxldCBmYXFUZXh0ID0gX3QoXG4gICAgICAgICAgICAnRm9yIGhlbHAgd2l0aCB1c2luZyAlKGJyYW5kKXMsIGNsaWNrIDxhPmhlcmU8L2E+LicsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYnJhbmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4gPGFcbiAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZWxlbWVudC5pby9oZWxwXCJcbiAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgIDwvYT4sXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLndlbGNvbWVVc2VySWQgJiYgZ2V0Q3VycmVudExhbmd1YWdlKCkuc3RhcnRzV2l0aCgnZW4nKSkge1xuICAgICAgICAgICAgZmFxVGV4dCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAnRm9yIGhlbHAgd2l0aCB1c2luZyAlKGJyYW5kKXMsIGNsaWNrIDxhPmhlcmU8L2E+IG9yIHN0YXJ0IGEgY2hhdCB3aXRoIG91ciAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdib3QgdXNpbmcgdGhlIGJ1dHRvbiBiZWxvdy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyYW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9XCJodHRwczovL2VsZW1lbnQuaW8vaGVscFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbD0nbm9yZWZlcnJlciBub29wZW5lcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PSdfYmxhbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3VifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vblN0YXJ0Qm90Q2hhdH0ga2luZD0ncHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ2hhdCB3aXRoICUoYnJhbmQpcyBCb3RcIiwgeyBicmFuZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXBwVmVyc2lvbiA9IHRoaXMuc3RhdGUuYXBwVmVyc2lvbiB8fCAndW5rbm93bic7XG5cbiAgICAgICAgbGV0IG9sbVZlcnNpb24gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub2xtVmVyc2lvbjtcbiAgICAgICAgb2xtVmVyc2lvbiA9IG9sbVZlcnNpb24gPyBgJHtvbG1WZXJzaW9uWzBdfS4ke29sbVZlcnNpb25bMV19LiR7b2xtVmVyc2lvblsyXX1gIDogJzxub3QtZW5hYmxlZD4nO1xuXG4gICAgICAgIGxldCB1cGRhdGVCdXR0b24gPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jYW5VcGRhdGUpIHtcbiAgICAgICAgICAgIHVwZGF0ZUJ1dHRvbiA9IDxVcGRhdGVDaGVja0J1dHRvbiAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBidWdSZXBvcnRpbmdTZWN0aW9uO1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsKSB7XG4gICAgICAgICAgICBidWdSZXBvcnRpbmdTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPntfdCgnQnVnIHJlcG9ydGluZycpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSd2ZSBzdWJtaXR0ZWQgYSBidWcgdmlhIEdpdEh1YiwgZGVidWcgbG9ncyBjYW4gaGVscCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1cyB0cmFjayBkb3duIHRoZSBwcm9ibGVtLiBEZWJ1ZyBsb2dzIGNvbnRhaW4gYXBwbGljYXRpb24gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidXNhZ2UgZGF0YSBpbmNsdWRpbmcgeW91ciB1c2VybmFtZSwgdGhlIElEcyBvciBhbGlhc2VzIG9mIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRoZSByb29tcyBvciBncm91cHMgeW91IGhhdmUgdmlzaXRlZCBhbmQgdGhlIHVzZXJuYW1lcyBvZiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvdGhlciB1c2Vycy4gVGhleSBkbyBub3QgY29udGFpbiBtZXNzYWdlcy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSGVscFVzZXJTZXR0aW5nc1RhYl9kZWJ1Z0J1dHRvbic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkJ1Z1JlcG9ydH0ga2luZD0ncHJpbWFyeSc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlN1Ym1pdCBkZWJ1ZyBsb2dzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVG8gcmVwb3J0IGEgTWF0cml4LXJlbGF0ZWQgc2VjdXJpdHkgaXNzdWUsIHBsZWFzZSByZWFkIHRoZSBNYXRyaXgub3JnIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjxhPlNlY3VyaXR5IERpc2Nsb3N1cmUgUG9saWN5PC9hPi5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPGEgaHJlZj1cImh0dHBzOi8vbWF0cml4Lm9yZy9zZWN1cml0eS1kaXNjbG9zdXJlLXBvbGljeS9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X0hlbHBVc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJIZWxwICYgQWJvdXRcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgeyBidWdSZXBvcnRpbmdTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbic+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiRkFRXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtmYXFUZXh0fVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXtLZXlib2FyZFNob3J0Y3V0cy50b2dnbGVEaWFsb2d9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIktleWJvYXJkIFNob3J0Y3V0c1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9IZWxwVXNlclNldHRpbmdzVGFiX3ZlcnNpb25zJz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nJz57X3QoXCJWZXJzaW9uc1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dCc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCIlKGJyYW5kKXMgdmVyc2lvbjpcIiwgeyBicmFuZCB9KX0ge2FwcFZlcnNpb259PGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJvbG0gdmVyc2lvbjpcIil9IHtvbG1WZXJzaW9ufTxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge3VwZGF0ZUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge3RoaXMucmVuZGVyTGVnYWwoKX1cbiAgICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJDcmVkaXRzKCl9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfSGVscFVzZXJTZXR0aW5nc1RhYl92ZXJzaW9ucyc+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZyc+e190KFwiQWR2YW5jZWRcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiSG9tZXNlcnZlciBpc1wiKX0gPGNvZGU+e01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRIb21lc2VydmVyVXJsKCl9PC9jb2RlPjxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiSWRlbnRpdHkgU2VydmVyIGlzXCIpfSA8Y29kZT57TWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCl9PC9jb2RlPjxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQWNjZXNzIFRva2VuOlwiKSArICcgJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGVsZW1lbnQ9XCJzcGFuXCIgb25DbGljaz17dGhpcy5zaG93U3BvaWxlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXNwb2lsZXI9e01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRBY2Nlc3NUb2tlbigpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICZsdDt7IF90KFwiY2xpY2sgdG8gcmV2ZWFsXCIpIH0mZ3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSGVscFVzZXJTZXR0aW5nc1RhYl9kZWJ1Z0J1dHRvbic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkNsZWFyQ2FjaGVBbmRSZWxvYWR9IGtpbmQ9J2Rhbmdlcic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkNsZWFyIGNhY2hlIGFuZCByZWxvYWRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19