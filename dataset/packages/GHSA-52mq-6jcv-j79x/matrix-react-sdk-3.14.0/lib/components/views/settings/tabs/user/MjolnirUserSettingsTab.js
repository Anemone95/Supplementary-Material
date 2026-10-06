"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _Mjolnir = require("../../../../../mjolnir/Mjolnir");

var _ListRule = require("../../../../../mjolnir/ListRule");

var _BanList = require("../../../../../mjolnir/BanList");

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../../index"));

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
class MjolnirUserSettingsTab extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_onPersonalRuleChanged", e => {
      this.setState({
        newPersonalRule: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onNewListChanged", e => {
      this.setState({
        newList: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onAddPersonalRule", async e => {
      e.preventDefault();
      e.stopPropagation();
      let kind = _BanList.RULE_SERVER;

      if (this.state.newPersonalRule.startsWith("@")) {
        kind = _BanList.RULE_USER;
      }

      this.setState({
        busy: true
      });

      try {
        const list = await _Mjolnir.Mjolnir.sharedInstance().getOrCreatePersonalList();
        await list.banEntity(kind, this.state.newPersonalRule, (0, _languageHandler._t)("Ignored/Blocked"));
        this.setState({
          newPersonalRule: ""
        }); // this will also cause the new rule to be rendered
      } catch (e) {
        console.error(e);
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to add Mjolnir rule', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error adding ignored user/server'),
          description: (0, _languageHandler._t)('Something went wrong. Please try again or view your console for hints.')
        });
      } finally {
        this.setState({
          busy: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "_onSubscribeList", async e => {
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        busy: true
      });

      try {
        const room = await _MatrixClientPeg.MatrixClientPeg.get().joinRoom(this.state.newList);
        await _Mjolnir.Mjolnir.sharedInstance().subscribeToList(room.roomId);
        this.setState({
          newList: ""
        }); // this will also cause the new rule to be rendered
      } catch (e) {
        console.error(e);
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to subscribe to Mjolnir list', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error subscribing to list'),
          description: (0, _languageHandler._t)('Please verify the room ID or address and try again.')
        });
      } finally {
        this.setState({
          busy: false
        });
      }
    });
    this.state = {
      busy: false,
      newPersonalRule: "",
      newList: ""
    };
  }

  async _removePersonalRule(rule
  /*: ListRule*/
  ) {
    this.setState({
      busy: true
    });

    try {
      const list = _Mjolnir.Mjolnir.sharedInstance().getPersonalList();

      await list.unbanEntity(rule.kind, rule.entity);
    } catch (e) {
      console.error(e);
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

      _Modal.default.createTrackedDialog('Failed to remove Mjolnir rule', '', ErrorDialog, {
        title: (0, _languageHandler._t)('Error removing ignored user/server'),
        description: (0, _languageHandler._t)('Something went wrong. Please try again or view your console for hints.')
      });
    } finally {
      this.setState({
        busy: false
      });
    }
  }

  async _unsubscribeFromList(list
  /*: BanList*/
  ) {
    this.setState({
      busy: true
    });

    try {
      await _Mjolnir.Mjolnir.sharedInstance().unsubscribeFromList(list.roomId);
      await _MatrixClientPeg.MatrixClientPeg.get().leave(list.roomId);
    } catch (e) {
      console.error(e);
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

      _Modal.default.createTrackedDialog('Failed to unsubscribe from Mjolnir list', '', ErrorDialog, {
        title: (0, _languageHandler._t)('Error unsubscribing from list'),
        description: (0, _languageHandler._t)('Please try again or view your console for hints.')
      });
    } finally {
      this.setState({
        busy: false
      });
    }
  }

  _viewListRules(list
  /*: BanList*/
  ) {
    const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(list.roomId);

    const name = room ? room.name : list.roomId;

    const renderRules = (rules
    /*: ListRule[]*/
    ) => {
      if (rules.length === 0) return /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)("None"));
      const tiles = [];

      for (const rule of rules) {
        tiles.push( /*#__PURE__*/_react.default.createElement("li", {
          key: rule.kind + rule.entity
        }, /*#__PURE__*/_react.default.createElement("code", null, rule.entity)));
      }

      return /*#__PURE__*/_react.default.createElement("ul", null, tiles);
    };

    _Modal.default.createTrackedDialog('View Mjolnir list rules', '', QuestionDialog, {
      title: (0, _languageHandler._t)("Ban list rules - %(roomName)s", {
        roomName: name
      }),
      description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Server rules")), renderRules(list.serverRules), /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("User rules")), renderRules(list.userRules)),
      button: (0, _languageHandler._t)("Close"),
      hasCancelButton: false
    });
  }

  _renderPersonalBanListRules() {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');

    const list = _Mjolnir.Mjolnir.sharedInstance().getPersonalList();

    const rules = list ? [...list.userRules, ...list.serverRules] : [];
    if (!list || rules.length <= 0) return /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)("You have not ignored anyone."));
    const tiles = [];

    for (const rule of rules) {
      tiles.push( /*#__PURE__*/_react.default.createElement("li", {
        key: rule.entity,
        className: "mx_MjolnirUserSettingsTab_listItem"
      }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "danger_sm",
        onClick: () => this._removePersonalRule(rule),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("Remove")), "\xA0", /*#__PURE__*/_react.default.createElement("code", null, rule.entity)));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are currently ignoring:")), /*#__PURE__*/_react.default.createElement("ul", null, tiles));
  }

  _renderSubscribedBanLists() {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');

    const personalList = _Mjolnir.Mjolnir.sharedInstance().getPersonalList();

    const lists = _Mjolnir.Mjolnir.sharedInstance().lists.filter(b => {
      return personalList ? personalList.roomId !== b.roomId : true;
    });

    if (!lists || lists.length <= 0) return /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)("You are not subscribed to any lists"));
    const tiles = [];

    for (const list of lists) {
      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(list.roomId);

      const name = room ? /*#__PURE__*/_react.default.createElement("span", null, room.name, " (", /*#__PURE__*/_react.default.createElement("code", null, list.roomId), ")") : /*#__PURE__*/_react.default.createElement("code", null, "list.roomId");
      tiles.push( /*#__PURE__*/_react.default.createElement("li", {
        key: list.roomId,
        className: "mx_MjolnirUserSettingsTab_listItem"
      }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "danger_sm",
        onClick: () => this._unsubscribeFromList(list),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("Unsubscribe")), "\xA0", /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "primary_sm",
        onClick: () => this._viewListRules(list),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("View rules")), "\xA0", name));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are currently subscribed to:")), /*#__PURE__*/_react.default.createElement("ul", null, tiles));
  }

  render() {
    const Field = sdk.getComponent('elements.Field');
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');

    const brand = _SdkConfig.default.get().brand;

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_MjolnirUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Ignored users")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "warning"
    }, (0, _languageHandler._t)("⚠ These settings are meant for advanced users.")), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Add users and servers you want to ignore here. Use asterisks " + "to have %(brand)s match any characters. For example, <code>@bot:*</code> " + "would ignore all users that have the name 'bot' on any server.", {
      brand
    }, {
      code: s => /*#__PURE__*/_react.default.createElement("code", null, s)
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Ignoring people is done through ban lists which contain rules for " + "who to ban. Subscribing to a ban list means the users/servers blocked by " + "that list will be hidden from you."))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Personal ban list")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, _languageHandler._t)("Your personal ban list holds all the users/servers you personally don't " + "want to see messages from. After ignoring your first user/server, a new room " + "will show up in your room list named 'My Ban List' - stay in this room to keep " + "the ban list in effect.")), /*#__PURE__*/_react.default.createElement("div", null, this._renderPersonalBanListRules()), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onAddPersonalRule,
      autoComplete: "off"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      type: "text",
      label: (0, _languageHandler._t)("Server or user ID to ignore"),
      placeholder: (0, _languageHandler._t)("eg: @bot:* or example.org"),
      value: this.state.newPersonalRule,
      onChange: this._onPersonalRuleChanged
    }), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      type: "submit",
      kind: "primary",
      onClick: this._onAddPersonalRule,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Ignore"))))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Subscribed lists")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "warning"
    }, (0, _languageHandler._t)("Subscribing to a ban list will cause you to join it!")), "\xA0", /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("If this isn't what you want, please use a different tool to ignore users."))), /*#__PURE__*/_react.default.createElement("div", null, this._renderSubscribedBanLists()), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onSubscribeList,
      autoComplete: "off"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      type: "text",
      label: (0, _languageHandler._t)("Room ID or address of ban list"),
      value: this.state.newList,
      onChange: this._onNewListChanged
    }), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      type: "submit",
      kind: "primary",
      onClick: this._onSubscribeList,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Subscribe"))))));
  }

}

exports.default = MjolnirUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9Nam9sbmlyVXNlclNldHRpbmdzVGFiLmpzIl0sIm5hbWVzIjpbIk1qb2xuaXJVc2VyU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiZSIsInNldFN0YXRlIiwibmV3UGVyc29uYWxSdWxlIiwidGFyZ2V0IiwidmFsdWUiLCJuZXdMaXN0IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJraW5kIiwiUlVMRV9TRVJWRVIiLCJzdGF0ZSIsInN0YXJ0c1dpdGgiLCJSVUxFX1VTRVIiLCJidXN5IiwibGlzdCIsIk1qb2xuaXIiLCJzaGFyZWRJbnN0YW5jZSIsImdldE9yQ3JlYXRlUGVyc29uYWxMaXN0IiwiYmFuRW50aXR5IiwiY29uc29sZSIsImVycm9yIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImpvaW5Sb29tIiwic3Vic2NyaWJlVG9MaXN0Iiwicm9vbUlkIiwiX3JlbW92ZVBlcnNvbmFsUnVsZSIsInJ1bGUiLCJnZXRQZXJzb25hbExpc3QiLCJ1bmJhbkVudGl0eSIsImVudGl0eSIsIl91bnN1YnNjcmliZUZyb21MaXN0IiwidW5zdWJzY3JpYmVGcm9tTGlzdCIsImxlYXZlIiwiX3ZpZXdMaXN0UnVsZXMiLCJRdWVzdGlvbkRpYWxvZyIsImdldFJvb20iLCJuYW1lIiwicmVuZGVyUnVsZXMiLCJydWxlcyIsImxlbmd0aCIsInRpbGVzIiwicHVzaCIsInJvb21OYW1lIiwic2VydmVyUnVsZXMiLCJ1c2VyUnVsZXMiLCJidXR0b24iLCJoYXNDYW5jZWxCdXR0b24iLCJfcmVuZGVyUGVyc29uYWxCYW5MaXN0UnVsZXMiLCJBY2Nlc3NpYmxlQnV0dG9uIiwiX3JlbmRlclN1YnNjcmliZWRCYW5MaXN0cyIsInBlcnNvbmFsTGlzdCIsImxpc3RzIiwiZmlsdGVyIiwiYiIsInJlbmRlciIsIkZpZWxkIiwiYnJhbmQiLCJTZGtDb25maWciLCJjb2RlIiwicyIsIl9vbkFkZFBlcnNvbmFsUnVsZSIsIl9vblBlcnNvbmFsUnVsZUNoYW5nZWQiLCJfb25TdWJzY3JpYmVMaXN0IiwiX29uTmV3TGlzdENoYW5nZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVllLE1BQU1BLHNCQUFOLFNBQXFDQyxlQUFNQyxTQUEzQyxDQUFxRDtBQUNoRUMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSxrRUFVWUMsQ0FBRCxJQUFPO0FBQzVCLFdBQUtDLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxlQUFlLEVBQUVGLENBQUMsQ0FBQ0csTUFBRixDQUFTQztBQUEzQixPQUFkO0FBQ0gsS0FaYTtBQUFBLDZEQWNPSixDQUFELElBQU87QUFDdkIsV0FBS0MsUUFBTCxDQUFjO0FBQUNJLFFBQUFBLE9BQU8sRUFBRUwsQ0FBQyxDQUFDRyxNQUFGLENBQVNDO0FBQW5CLE9BQWQ7QUFDSCxLQWhCYTtBQUFBLDhEQWtCTyxNQUFPSixDQUFQLElBQWE7QUFDOUJBLE1BQUFBLENBQUMsQ0FBQ00sY0FBRjtBQUNBTixNQUFBQSxDQUFDLENBQUNPLGVBQUY7QUFFQSxVQUFJQyxJQUFJLEdBQUdDLG9CQUFYOztBQUNBLFVBQUksS0FBS0MsS0FBTCxDQUFXUixlQUFYLENBQTJCUyxVQUEzQixDQUFzQyxHQUF0QyxDQUFKLEVBQWdEO0FBQzVDSCxRQUFBQSxJQUFJLEdBQUdJLGtCQUFQO0FBQ0g7O0FBRUQsV0FBS1gsUUFBTCxDQUFjO0FB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QUFTLEVBQUM7QUFBaEIsT0FBMkIseUJBQUcsc0RBQUgsQ0FBM0IsQ0FESix1QkFHSSwyQ0FBTyx5QkFDSCwyRUFERyxDQUFQLENBSEosQ0FGSixlQVNJLDBDQUNLLEtBQUs2Qyx5QkFBTCxFQURMLENBVEosZUFZSSx1REFDSTtBQUFNLE1BQUEsUUFBUSxFQUFFLEtBQUthLGdCQUFyQjtBQUF1QyxNQUFBLFlBQVksRUFBQztBQUFwRCxvQkFDSSw2QkFBQyxLQUFEO0FBQ0ksTUFBQSxJQUFJLEVBQUMsTUFEVDtBQUVJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGdDQUFILENBRlg7QUFHSSxNQUFBLEtBQUssRUFBRSxLQUFLN0QsS0FBTCxDQUFXTCxPQUh0QjtBQUlJLE1BQUEsUUFBUSxFQUFFLEtBQUttRTtBQUpuQixNQURKLGVBT0ksNkJBQUMsZ0JBQUQ7QUFDSSxNQUFBLElBQUksRUFBQyxRQURUO0FBRUksTUFBQSxJQUFJLEVBQUMsU0FGVDtBQUdJLE1BQUEsT0FBTyxFQUFFLEtBQUtELGdCQUhsQjtBQUlJLE1BQUEsUUFBUSxFQUFFLEtBQUs3RCxLQUFMLENBQVdHO0FBSnpCLE9BTUsseUJBQUcsV0FBSCxDQU5MLENBUEosQ0FESixDQVpKLENBckRKLENBREo7QUF1Rkg7O0FBNVMrRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7TWpvbG5pcn0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL21qb2xuaXIvTWpvbG5pclwiO1xuaW1wb3J0IHtMaXN0UnVsZX0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL21qb2xuaXIvTGlzdFJ1bGVcIjtcbmltcG9ydCB7QmFuTGlzdCwgUlVMRV9TRVJWRVIsIFJVTEVfVVNFUn0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL21qb2xuaXIvQmFuTGlzdFwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWpvbG5pclVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgbmV3UGVyc29uYWxSdWxlOiBcIlwiLFxuICAgICAgICAgICAgbmV3TGlzdDogXCJcIixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfb25QZXJzb25hbFJ1bGVDaGFuZ2VkID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bmV3UGVyc29uYWxSdWxlOiBlLnRhcmdldC52YWx1ZX0pO1xuICAgIH07XG5cbiAgICBfb25OZXdMaXN0Q2hhbmdlZCA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe25ld0xpc3Q6IGUudGFyZ2V0LnZhbHVlfSk7XG4gICAgfTtcblxuICAgIF9vbkFkZFBlcnNvbmFsUnVsZSA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBsZXQga2luZCA9IFJVTEVfU0VSVkVSO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5uZXdQZXJzb25hbFJ1bGUuc3RhcnRzV2l0aChcIkBcIikpIHtcbiAgICAgICAgICAgIGtpbmQgPSBSVUxFX1VTRVI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gYXdhaXQgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLmdldE9yQ3JlYXRlUGVyc29uYWxMaXN0KCk7XG4gICAgICAgICAgICBhd2FpdCBsaXN0LmJhbkVudGl0eShraW5kLCB0aGlzLnN0YXRlLm5ld1BlcnNvbmFsUnVsZSwgX3QoXCJJZ25vcmVkL0Jsb2NrZWRcIikpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bmV3UGVyc29uYWxSdWxlOiBcIlwifSk7IC8vIHRoaXMgd2lsbCBhbHNvIGNhdXNlIHRoZSBuZXcgcnVsZSB0byBiZSByZW5kZXJlZFxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGFkZCBNam9sbmlyIHJ1bGUnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIGFkZGluZyBpZ25vcmVkIHVzZXIvc2VydmVyJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2FpbiBvciB2aWV3IHlvdXIgY29uc29sZSBmb3IgaGludHMuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uU3Vic2NyaWJlTGlzdCA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmpvaW5Sb29tKHRoaXMuc3RhdGUubmV3TGlzdCk7XG4gICAgICAgICAgICBhd2FpdCBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuc3Vic2NyaWJlVG9MaXN0KHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe25ld0xpc3Q6IFwiXCJ9KTsgLy8gdGhpcyB3aWxsIGFsc28gY2F1c2UgdGhlIG5ldyBydWxlIHRvIGJlIHJlbmRlcmVkXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gc3Vic2NyaWJlIHRvIE1qb2xuaXIgbGlzdCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3Igc3Vic2NyaWJpbmcgdG8gbGlzdCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnUGxlYXNlIHZlcmlmeSB0aGUgcm9vbSBJRCBvciBhZGRyZXNzIGFuZCB0cnkgYWdhaW4uJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMgX3JlbW92ZVBlcnNvbmFsUnVsZShydWxlOiBMaXN0UnVsZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLmdldFBlcnNvbmFsTGlzdCgpO1xuICAgICAgICAgICAgYXdhaXQgbGlzdC51bmJhbkVudGl0eShydWxlLmtpbmQsIHJ1bGUuZW50aXR5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcblxuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byByZW1vdmUgTWpvbG5pciBydWxlJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvciByZW1vdmluZyBpZ25vcmVkIHVzZXIvc2VydmVyJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2FpbiBvciB2aWV3IHlvdXIgY29uc29sZSBmb3IgaGludHMuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfdW5zdWJzY3JpYmVGcm9tTGlzdChsaXN0OiBCYW5MaXN0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IE1qb2xuaXIuc2hhcmVkSW5zdGFuY2UoKS51bnN1YnNjcmliZUZyb21MaXN0KGxpc3Qucm9vbUlkKTtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5sZWF2ZShsaXN0LnJvb21JZCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gdW5zdWJzY3JpYmUgZnJvbSBNam9sbmlyIGxpc3QnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIHVuc3Vic2NyaWJpbmcgZnJvbSBsaXN0JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdQbGVhc2UgdHJ5IGFnYWluIG9yIHZpZXcgeW91ciBjb25zb2xlIGZvciBoaW50cy4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF92aWV3TGlzdFJ1bGVzKGxpc3Q6IEJhbkxpc3QpIHtcbiAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcblxuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20obGlzdC5yb29tSWQpO1xuICAgICAgICBjb25zdCBuYW1lID0gcm9vbSA/IHJvb20ubmFtZSA6IGxpc3Qucm9vbUlkO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlclJ1bGVzID0gKHJ1bGVzOiBMaXN0UnVsZVtdKSA9PiB7XG4gICAgICAgICAgICBpZiAocnVsZXMubGVuZ3RoID09PSAwKSByZXR1cm4gPGk+e190KFwiTm9uZVwiKX08L2k+O1xuXG4gICAgICAgICAgICBjb25zdCB0aWxlcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIHJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCg8bGkga2V5PXtydWxlLmtpbmQgKyBydWxlLmVudGl0eX0+PGNvZGU+e3J1bGUuZW50aXR5fTwvY29kZT48L2xpPik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gPHVsPnt0aWxlc308L3VsPjtcbiAgICAgICAgfTtcblxuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdWaWV3IE1qb2xuaXIgbGlzdCBydWxlcycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiQmFuIGxpc3QgcnVsZXMgLSAlKHJvb21OYW1lKXNcIiwge3Jvb21OYW1lOiBuYW1lfSksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxoMz57X3QoXCJTZXJ2ZXIgcnVsZXNcIil9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAge3JlbmRlclJ1bGVzKGxpc3Quc2VydmVyUnVsZXMpfVxuICAgICAgICAgICAgICAgICAgICA8aDM+e190KFwiVXNlciBydWxlc1wiKX08L2gzPlxuICAgICAgICAgICAgICAgICAgICB7cmVuZGVyUnVsZXMobGlzdC51c2VyUnVsZXMpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDbG9zZVwiKSxcbiAgICAgICAgICAgIGhhc0NhbmNlbEJ1dHRvbjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9yZW5kZXJQZXJzb25hbEJhbkxpc3RSdWxlcygpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcblxuICAgICAgICBjb25zdCBsaXN0ID0gTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLmdldFBlcnNvbmFsTGlzdCgpO1xuICAgICAgICBjb25zdCBydWxlcyA9IGxpc3QgPyBbLi4ubGlzdC51c2VyUnVsZXMsIC4uLmxpc3Quc2VydmVyUnVsZXNdIDogW107XG4gICAgICAgIGlmICghbGlzdCB8fCBydWxlcy5sZW5ndGggPD0gMCkgcmV0dXJuIDxpPntfdChcIllvdSBoYXZlIG5vdCBpZ25vcmVkIGFueW9uZS5cIil9PC9pPjtcblxuICAgICAgICBjb25zdCB0aWxlcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgcnVsZXMpIHtcbiAgICAgICAgICAgIHRpbGVzLnB1c2goXG4gICAgICAgICAgICAgICAgPGxpIGtleT17cnVsZS5lbnRpdHl9IGNsYXNzTmFtZT1cIm14X01qb2xuaXJVc2VyU2V0dGluZ3NUYWJfbGlzdEl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5fcmVtb3ZlUGVyc29uYWxSdWxlKHJ1bGUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiUmVtb3ZlXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+Jm5ic3A7XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlPntydWxlLmVudGl0eX08L2NvZGU+XG4gICAgICAgICAgICAgICAgPC9saT4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiWW91IGFyZSBjdXJyZW50bHkgaWdub3Jpbmc6XCIpfTwvcD5cbiAgICAgICAgICAgICAgICA8dWw+e3RpbGVzfTwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBfcmVuZGVyU3Vic2NyaWJlZEJhbkxpc3RzKCkge1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuXG4gICAgICAgIGNvbnN0IHBlcnNvbmFsTGlzdCA9IE1qb2xuaXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRQZXJzb25hbExpc3QoKTtcbiAgICAgICAgY29uc3QgbGlzdHMgPSBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkubGlzdHMuZmlsdGVyKGIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHBlcnNvbmFsTGlzdD8gcGVyc29uYWxMaXN0LnJvb21JZCAhPT0gYi5yb29tSWQgOiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFsaXN0cyB8fCBsaXN0cy5sZW5ndGggPD0gMCkgcmV0dXJuIDxpPntfdChcIllvdSBhcmUgbm90IHN1YnNjcmliZWQgdG8gYW55IGxpc3RzXCIpfTwvaT47XG5cbiAgICAgICAgY29uc3QgdGlsZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBsaXN0IG9mIGxpc3RzKSB7XG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20obGlzdC5yb29tSWQpO1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHJvb20gPyA8c3Bhbj57cm9vbS5uYW1lfSAoPGNvZGU+e2xpc3Qucm9vbUlkfTwvY29kZT4pPC9zcGFuPiA6IDxjb2RlPmxpc3Qucm9vbUlkPC9jb2RlPjtcbiAgICAgICAgICAgIHRpbGVzLnB1c2goXG4gICAgICAgICAgICAgICAgPGxpIGtleT17bGlzdC5yb29tSWR9IGNsYXNzTmFtZT1cIm14X01qb2xuaXJVc2VyU2V0dGluZ3NUYWJfbGlzdEl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5fdW5zdWJzY3JpYmVGcm9tTGlzdChsaXN0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlVuc3Vic2NyaWJlXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+Jm5ic3A7XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLl92aWV3TGlzdFJ1bGVzKGxpc3QpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiVmlldyBydWxlc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICB7bmFtZX1cbiAgICAgICAgICAgICAgICA8L2xpPixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJZb3UgYXJlIGN1cnJlbnRseSBzdWJzY3JpYmVkIHRvOlwiKX08L3A+XG4gICAgICAgICAgICAgICAgPHVsPnt0aWxlc308L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBGaWVsZCA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkZpZWxkJyk7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X01qb2xuaXJVc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJJZ25vcmVkIHVzZXJzXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSd3YXJuaW5nJz57X3QoXCLimqAgVGhlc2Ugc2V0dGluZ3MgYXJlIG1lYW50IGZvciBhZHZhbmNlZCB1c2Vycy5cIil9PC9zcGFuPjxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBZGQgdXNlcnMgYW5kIHNlcnZlcnMgeW91IHdhbnQgdG8gaWdub3JlIGhlcmUuIFVzZSBhc3Rlcmlza3MgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gaGF2ZSAlKGJyYW5kKXMgbWF0Y2ggYW55IGNoYXJhY3RlcnMuIEZvciBleGFtcGxlLCA8Y29kZT5AYm90Oio8L2NvZGU+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndvdWxkIGlnbm9yZSBhbGwgdXNlcnMgdGhhdCBoYXZlIHRoZSBuYW1lICdib3QnIG9uIGFueSBzZXJ2ZXIuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LCB7Y29kZTogKHMpID0+IDxjb2RlPntzfTwvY29kZT59LFxuICAgICAgICAgICAgICAgICAgICAgICAgKX08YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWdub3JpbmcgcGVvcGxlIGlzIGRvbmUgdGhyb3VnaCBiYW4gbGlzdHMgd2hpY2ggY29udGFpbiBydWxlcyBmb3IgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2hvIHRvIGJhbi4gU3Vic2NyaWJpbmcgdG8gYSBiYW4gbGlzdCBtZWFucyB0aGUgdXNlcnMvc2VydmVycyBibG9ja2VkIGJ5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRoYXQgbGlzdCB3aWxsIGJlIGhpZGRlbiBmcm9tIHlvdS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiUGVyc29uYWwgYmFuIGxpc3RcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91ciBwZXJzb25hbCBiYW4gbGlzdCBob2xkcyBhbGwgdGhlIHVzZXJzL3NlcnZlcnMgeW91IHBlcnNvbmFsbHkgZG9uJ3QgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2FudCB0byBzZWUgbWVzc2FnZXMgZnJvbS4gQWZ0ZXIgaWdub3JpbmcgeW91ciBmaXJzdCB1c2VyL3NlcnZlciwgYSBuZXcgcm9vbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWxsIHNob3cgdXAgaW4geW91ciByb29tIGxpc3QgbmFtZWQgJ015IEJhbiBMaXN0JyAtIHN0YXkgaW4gdGhpcyByb29tIHRvIGtlZXAgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIGJhbiBsaXN0IGluIGVmZmVjdC5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlclBlcnNvbmFsQmFuTGlzdFJ1bGVzKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uQWRkUGVyc29uYWxSdWxlfSBhdXRvQ29tcGxldGU9XCJvZmZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTZXJ2ZXIgb3IgdXNlciBJRCB0byBpZ25vcmVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcImVnOiBAYm90Oiogb3IgZXhhbXBsZS5vcmdcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1BlcnNvbmFsUnVsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uUGVyc29uYWxSdWxlQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQWRkUGVyc29uYWxSdWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiSWdub3JlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57X3QoXCJTdWJzY3JpYmVkIGxpc3RzXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nd2FybmluZyc+e190KFwiU3Vic2NyaWJpbmcgdG8gYSBiYW4gbGlzdCB3aWxsIGNhdXNlIHlvdSB0byBqb2luIGl0IVwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklmIHRoaXMgaXNuJ3Qgd2hhdCB5b3Ugd2FudCwgcGxlYXNlIHVzZSBhIGRpZmZlcmVudCB0b29sIHRvIGlnbm9yZSB1c2Vycy5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJTdWJzY3JpYmVkQmFuTGlzdHMoKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5fb25TdWJzY3JpYmVMaXN0fSBhdXRvQ29tcGxldGU9XCJvZmZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSb29tIElEIG9yIGFkZHJlc3Mgb2YgYmFuIGxpc3RcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld0xpc3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbk5ld0xpc3RDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25TdWJzY3JpYmVMaXN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiU3Vic2NyaWJlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=