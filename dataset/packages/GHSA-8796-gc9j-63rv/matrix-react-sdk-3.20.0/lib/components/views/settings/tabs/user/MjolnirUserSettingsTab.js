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

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _Mjolnir = require("../../../../../mjolnir/Mjolnir");

var _BanList = require("../../../../../mjolnir/BanList");

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../../index"));

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _temp;

let MjolnirUserSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.user.MjolnirUserSettingsTab"), _dec(_class = (_temp = class MjolnirUserSettingsTab extends _react.default.Component
/*:: <{}, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onPersonalRuleChanged", e => {
      this.setState({
        newPersonalRule: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onNewListChanged", e => {
      this.setState({
        newList: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onAddPersonalRule", async e => {
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
    (0, _defineProperty2.default)(this, "onSubscribeList", async e => {
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

  async removePersonalRule(rule
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

  async unsubscribeFromList(list
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

  viewListRules(list
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

  renderPersonalBanListRules() {
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
        onClick: () => this.removePersonalRule(rule),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("Remove")), "\xA0", /*#__PURE__*/_react.default.createElement("code", null, rule.entity)));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are currently ignoring:")), /*#__PURE__*/_react.default.createElement("ul", null, tiles));
  }

  renderSubscribedBanLists() {
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
        onClick: () => this.unsubscribeFromList(list),
        disabled: this.state.busy
      }, (0, _languageHandler._t)("Unsubscribe")), "\xA0", /*#__PURE__*/_react.default.createElement(AccessibleButton, {
        kind: "primary_sm",
        onClick: () => this.viewListRules(list),
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
    }, (0, _languageHandler._t)("Your personal ban list holds all the users/servers you personally don't " + "want to see messages from. After ignoring your first user/server, a new room " + "will show up in your room list named 'My Ban List' - stay in this room to keep " + "the ban list in effect.")), /*#__PURE__*/_react.default.createElement("div", null, this.renderPersonalBanListRules()), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onAddPersonalRule,
      autoComplete: "off"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      type: "text",
      label: (0, _languageHandler._t)("Server or user ID to ignore"),
      placeholder: (0, _languageHandler._t)("eg: @bot:* or example.org"),
      value: this.state.newPersonalRule,
      onChange: this.onPersonalRuleChanged
    }), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      type: "submit",
      kind: "primary",
      onClick: this.onAddPersonalRule,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Ignore"))))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Subscribed lists")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "warning"
    }, (0, _languageHandler._t)("Subscribing to a ban list will cause you to join it!")), "\xA0", /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("If this isn't what you want, please use a different tool to ignore users."))), /*#__PURE__*/_react.default.createElement("div", null, this.renderSubscribedBanLists()), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubscribeList,
      autoComplete: "off"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      type: "text",
      label: (0, _languageHandler._t)("Room ID or address of ban list"),
      value: this.state.newList,
      onChange: this.onNewListChanged
    }), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      type: "submit",
      kind: "primary",
      onClick: this.onSubscribeList,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Subscribe"))))));
  }

}, _temp)) || _class);
exports.default = MjolnirUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9Nam9sbmlyVXNlclNldHRpbmdzVGFiLnRzeCJdLCJuYW1lcyI6WyJNam9sbmlyVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZSIsInNldFN0YXRlIiwibmV3UGVyc29uYWxSdWxlIiwidGFyZ2V0IiwidmFsdWUiLCJuZXdMaXN0IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJraW5kIiwiUlVMRV9TRVJWRVIiLCJzdGF0ZSIsInN0YXJ0c1dpdGgiLCJSVUxFX1VTRVIiLCJidXN5IiwibGlzdCIsIk1qb2xuaXIiLCJzaGFyZWRJbnN0YW5jZSIsImdldE9yQ3JlYXRlUGVyc29uYWxMaXN0IiwiYmFuRW50aXR5IiwiY29uc29sZSIsImVycm9yIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwicm9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImpvaW5Sb29tIiwic3Vic2NyaWJlVG9MaXN0Iiwicm9vbUlkIiwicmVtb3ZlUGVyc29uYWxSdWxlIiwicnVsZSIsImdldFBlcnNvbmFsTGlzdCIsInVuYmFuRW50aXR5IiwiZW50aXR5IiwidW5zdWJzY3JpYmVGcm9tTGlzdCIsImxlYXZlIiwidmlld0xpc3RSdWxlcyIsIlF1ZXN0aW9uRGlhbG9nIiwiZ2V0Um9vbSIsIm5hbWUiLCJyZW5kZXJSdWxlcyIsInJ1bGVzIiwibGVuZ3RoIiwidGlsZXMiLCJwdXNoIiwicm9vbU5hbWUiLCJzZXJ2ZXJSdWxlcyIsInVzZXJSdWxlcyIsImJ1dHRvbiIsImhhc0NhbmNlbEJ1dHRvbiIsInJlbmRlclBlcnNvbmFsQmFuTGlzdFJ1bGVzIiwiQWNjZXNzaWJsZUJ1dHRvbiIsInJlbmRlclN1YnNjcmliZWRCYW5MaXN0cyIsInBlcnNvbmFsTGlzdCIsImxpc3RzIiwiZmlsdGVyIiwiYiIsInJlbmRlciIsIkZpZWxkIiwiYnJhbmQiLCJTZGtDb25maWciLCJjb2RlIiwicyIsIm9uQWRkUGVyc29uYWxSdWxlIiwib25QZXJzb25hbFJ1bGVDaGFuZ2VkIiwib25TdWJzY3JpYmVMaXN0Iiwib25OZXdMaXN0Q2hhbmdlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQVNxQkEsc0IsV0FEcEIsZ0RBQXFCLGlEQUFyQixDLHlCQUFELE1BQ3FCQSxzQkFEckIsU0FDb0RDLGVBQU1DO0FBRDFEO0FBQ2dGO0FBQzVFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSxpRUFVY0MsQ0FBRCxJQUFPO0FBQ25DLFdBQUtDLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxlQUFlLEVBQUVGLENBQUMsQ0FBQ0csTUFBRixDQUFTQztBQUEzQixPQUFkO0FBQ0gsS0Faa0I7QUFBQSw0REFjU0osQ0FBRCxJQUFPO0FBQzlCLFdBQUtDLFFBQUwsQ0FBYztBQUFDSSxRQUFBQSxPQUFPLEVBQUVMLENBQUMsQ0FBQ0csTUFBRixDQUFTQztBQUFuQixPQUFkO0FBQ0gsS0FoQmtCO0FBQUEsNkRBa0JTLE1BQU9KLENBQVAsSUFBYTtBQUNyQ0EsTUFBQUEsQ0FBQyxDQUFDTSxjQUFGO0FBQ0FOLE1BQUFBLENBQUMsQ0FBQ08sZUFBRjtBQUVBLFVBQUlDLElBQUksR0FBR0Msb0JBQVg7O0FBQ0EsVUFBSSxLQUFLQyxLQUFMLENBQVdSLGVBQVgsQ0FBMkJTLFVBQTNCLENBQXNDLEdBQXRDLENBQUosRUFBZ0Q7QUFDNUNILFFBQUFBLElBQUksR0FBR0ksa0JBQVA7QUFDSDs7QUFFRCxXQUFLWCxRQUFMLENBQWM7QUFBQ1ksUUFBQUEsSUFBSSxFQUFFO0FBQVAsT0FBZDs7QUFDQSxV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QUEzQixDQURKLHVCQUdJLDJDQUFPLHlCQUNILDJFQURHLENBQVAsQ0FISixDQUZKLGVBU0ksMENBQ0ssS0FBSzRDLHdCQUFMLEVBREwsQ0FUSixlQVlJLHVEQUNJO0FBQU0sTUFBQSxRQUFRLEVBQUUsS0FBS2EsZUFBckI7QUFBc0MsTUFBQSxZQUFZLEVBQUM7QUFBbkQsb0JBQ0ksNkJBQUMsS0FBRDtBQUNJLE1BQUEsSUFBSSxFQUFDLE1BRFQ7QUFFSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxnQ0FBSCxDQUZYO0FBR0ksTUFBQSxLQUFLLEVBQUUsS0FBSzVELEtBQUwsQ0FBV0wsT0FIdEI7QUFJSSxNQUFBLFFBQVEsRUFBRSxLQUFLa0U7QUFKbkIsTUFESixlQU9JLDZCQUFDLGdCQUFEO0FBQ0ksTUFBQSxJQUFJLEVBQUMsUUFEVDtBQUVJLE1BQUEsSUFBSSxFQUFDLFNBRlQ7QUFHSSxNQUFBLE9BQU8sRUFBRSxLQUFLRCxlQUhsQjtBQUlJLE1BQUEsUUFBUSxFQUFFLEtBQUs1RCxLQUFMLENBQVdHO0FBSnpCLE9BTUsseUJBQUcsV0FBSCxDQU5MLENBUEosQ0FESixDQVpKLENBckRKLENBREo7QUF1Rkg7O0FBNVMyRSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQge01qb2xuaXJ9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9tam9sbmlyL01qb2xuaXJcIjtcbmltcG9ydCB7TGlzdFJ1bGV9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9tam9sbmlyL0xpc3RSdWxlXCI7XG5pbXBvcnQge0Jhbkxpc3QsIFJVTEVfU0VSVkVSLCBSVUxFX1VTRVJ9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9tam9sbmlyL0Jhbkxpc3RcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBuZXdQZXJzb25hbFJ1bGU6IHN0cmluZztcbiAgICBuZXdMaXN0OiBzdHJpbmc7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnNldHRpbmdzLnRhYnMudXNlci5Nam9sbmlyVXNlclNldHRpbmdzVGFiXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNam9sbmlyVXNlclNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHt9LCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgbmV3UGVyc29uYWxSdWxlOiBcIlwiLFxuICAgICAgICAgICAgbmV3TGlzdDogXCJcIixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGVyc29uYWxSdWxlQ2hhbmdlZCA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe25ld1BlcnNvbmFsUnVsZTogZS50YXJnZXQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk5ld0xpc3RDaGFuZ2VkID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bmV3TGlzdDogZS50YXJnZXQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFkZFBlcnNvbmFsUnVsZSA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBsZXQga2luZCA9IFJVTEVfU0VSVkVSO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5uZXdQZXJzb25hbFJ1bGUuc3RhcnRzV2l0aChcIkBcIikpIHtcbiAgICAgICAgICAgIGtpbmQgPSBSVUxFX1VTRVI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gYXdhaXQgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLmdldE9yQ3JlYXRlUGVyc29uYWxMaXN0KCk7XG4gICAgICAgICAgICBhd2FpdCBsaXN0LmJhbkVudGl0eShraW5kLCB0aGlzLnN0YXRlLm5ld1BlcnNvbmFsUnVsZSwgX3QoXCJJZ25vcmVkL0Jsb2NrZWRcIikpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bmV3UGVyc29uYWxSdWxlOiBcIlwifSk7IC8vIHRoaXMgd2lsbCBhbHNvIGNhdXNlIHRoZSBuZXcgcnVsZSB0byBiZSByZW5kZXJlZFxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIGFkZCBNam9sbmlyIHJ1bGUnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIGFkZGluZyBpZ25vcmVkIHVzZXIvc2VydmVyJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZy4gUGxlYXNlIHRyeSBhZ2FpbiBvciB2aWV3IHlvdXIgY29uc29sZSBmb3IgaGludHMuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IGZhbHNlfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN1YnNjcmliZUxpc3QgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5qb2luUm9vbSh0aGlzLnN0YXRlLm5ld0xpc3QpO1xuICAgICAgICAgICAgYXdhaXQgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLnN1YnNjcmliZVRvTGlzdChyb29tLnJvb21JZCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtuZXdMaXN0OiBcIlwifSk7IC8vIHRoaXMgd2lsbCBhbHNvIGNhdXNlIHRoZSBuZXcgcnVsZSB0byBiZSByZW5kZXJlZFxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHN1YnNjcmliZSB0byBNam9sbmlyIGxpc3QnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIHN1YnNjcmliaW5nIHRvIGxpc3QnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ1BsZWFzZSB2ZXJpZnkgdGhlIHJvb20gSUQgb3IgYWRkcmVzcyBhbmQgdHJ5IGFnYWluLicpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiBmYWxzZX0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgcmVtb3ZlUGVyc29uYWxSdWxlKHJ1bGU6IExpc3RSdWxlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuZ2V0UGVyc29uYWxMaXN0KCk7XG4gICAgICAgICAgICBhd2FpdCBsaXN0LnVuYmFuRW50aXR5KHJ1bGUua2luZCwgcnVsZS5lbnRpdHkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRmFpbGVkIHRvIHJlbW92ZSBNam9sbmlyIHJ1bGUnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIHJlbW92aW5nIGlnbm9yZWQgdXNlci9zZXJ2ZXInKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nLiBQbGVhc2UgdHJ5IGFnYWluIG9yIHZpZXcgeW91ciBjb25zb2xlIGZvciBoaW50cy4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdW5zdWJzY3JpYmVGcm9tTGlzdChsaXN0OiBCYW5MaXN0KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IE1qb2xuaXIuc2hhcmVkSW5zdGFuY2UoKS51bnN1YnNjcmliZUZyb21MaXN0KGxpc3Qucm9vbUlkKTtcbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5sZWF2ZShsaXN0LnJvb21JZCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gdW5zdWJzY3JpYmUgZnJvbSBNam9sbmlyIGxpc3QnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yIHVuc3Vic2NyaWJpbmcgZnJvbSBsaXN0JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdQbGVhc2UgdHJ5IGFnYWluIG9yIHZpZXcgeW91ciBjb25zb2xlIGZvciBoaW50cy4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmlld0xpc3RSdWxlcyhsaXN0OiBCYW5MaXN0KSB7XG4gICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKGxpc3Qucm9vbUlkKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHJvb20gPyByb29tLm5hbWUgOiBsaXN0LnJvb21JZDtcblxuICAgICAgICBjb25zdCByZW5kZXJSdWxlcyA9IChydWxlczogTGlzdFJ1bGVbXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDxpPntfdChcIk5vbmVcIil9PC9pPjtcblxuICAgICAgICAgICAgY29uc3QgdGlsZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBydWxlcykge1xuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2goPGxpIGtleT17cnVsZS5raW5kICsgcnVsZS5lbnRpdHl9Pjxjb2RlPntydWxlLmVudGl0eX08L2NvZGU+PC9saT4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDx1bD57dGlsZXN9PC91bD47XG4gICAgICAgIH07XG5cbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVmlldyBNam9sbmlyIGxpc3QgcnVsZXMnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIkJhbiBsaXN0IHJ1bGVzIC0gJShyb29tTmFtZSlzXCIsIHtyb29tTmFtZTogbmFtZX0pLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDM+e190KFwiU2VydmVyIHJ1bGVzXCIpfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIHtyZW5kZXJSdWxlcyhsaXN0LnNlcnZlclJ1bGVzKX1cbiAgICAgICAgICAgICAgICAgICAgPGgzPntfdChcIlVzZXIgcnVsZXNcIil9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAge3JlbmRlclJ1bGVzKGxpc3QudXNlclJ1bGVzKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBidXR0b246IF90KFwiQ2xvc2VcIiksXG4gICAgICAgICAgICBoYXNDYW5jZWxCdXR0b246IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclBlcnNvbmFsQmFuTGlzdFJ1bGVzKCkge1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuXG4gICAgICAgIGNvbnN0IGxpc3QgPSBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuZ2V0UGVyc29uYWxMaXN0KCk7XG4gICAgICAgIGNvbnN0IHJ1bGVzID0gbGlzdCA/IFsuLi5saXN0LnVzZXJSdWxlcywgLi4ubGlzdC5zZXJ2ZXJSdWxlc10gOiBbXTtcbiAgICAgICAgaWYgKCFsaXN0IHx8IHJ1bGVzLmxlbmd0aCA8PSAwKSByZXR1cm4gPGk+e190KFwiWW91IGhhdmUgbm90IGlnbm9yZWQgYW55b25lLlwiKX08L2k+O1xuXG4gICAgICAgIGNvbnN0IHRpbGVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBydWxlcykge1xuICAgICAgICAgICAgdGlsZXMucHVzaChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXtydWxlLmVudGl0eX0gY2xhc3NOYW1lPVwibXhfTWpvbG5pclVzZXJTZXR0aW5nc1RhYl9saXN0SXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImRhbmdlcl9zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnJlbW92ZVBlcnNvbmFsUnVsZShydWxlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlJlbW92ZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICA8Y29kZT57cnVsZS5lbnRpdHl9PC9jb2RlPlxuICAgICAgICAgICAgICAgIDwvbGk+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcIllvdSBhcmUgY3VycmVudGx5IGlnbm9yaW5nOlwiKX08L3A+XG4gICAgICAgICAgICAgICAgPHVsPnt0aWxlc308L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJTdWJzY3JpYmVkQmFuTGlzdHMoKSB7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG5cbiAgICAgICAgY29uc3QgcGVyc29uYWxMaXN0ID0gTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLmdldFBlcnNvbmFsTGlzdCgpO1xuICAgICAgICBjb25zdCBsaXN0cyA9IE1qb2xuaXIuc2hhcmVkSW5zdGFuY2UoKS5saXN0cy5maWx0ZXIoYiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcGVyc29uYWxMaXN0PyBwZXJzb25hbExpc3Qucm9vbUlkICE9PSBiLnJvb21JZCA6IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWxpc3RzIHx8IGxpc3RzLmxlbmd0aCA8PSAwKSByZXR1cm4gPGk+e190KFwiWW91IGFyZSBub3Qgc3Vic2NyaWJlZCB0byBhbnkgbGlzdHNcIil9PC9pPjtcblxuICAgICAgICBjb25zdCB0aWxlcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGxpc3Qgb2YgbGlzdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShsaXN0LnJvb21JZCk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcm9vbSA/IDxzcGFuPntyb29tLm5hbWV9ICg8Y29kZT57bGlzdC5yb29tSWR9PC9jb2RlPik8L3NwYW4+IDogPGNvZGU+bGlzdC5yb29tSWQ8L2NvZGU+O1xuICAgICAgICAgICAgdGlsZXMucHVzaChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXtsaXN0LnJvb21JZH0gY2xhc3NOYW1lPVwibXhfTWpvbG5pclVzZXJTZXR0aW5nc1RhYl9saXN0SXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImRhbmdlcl9zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnVuc3Vic2NyaWJlRnJvbUxpc3QobGlzdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJVbnN1YnNjcmliZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlfc21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy52aWV3TGlzdFJ1bGVzKGxpc3QpfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFwiVmlldyBydWxlc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPiZuYnNwO1xuICAgICAgICAgICAgICAgICAgICB7bmFtZX1cbiAgICAgICAgICAgICAgICA8L2xpPixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJZb3UgYXJlIGN1cnJlbnRseSBzdWJzY3JpYmVkIHRvOlwiKX08L3A+XG4gICAgICAgICAgICAgICAgPHVsPnt0aWxlc308L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBGaWVsZCA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkZpZWxkJyk7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG4gICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X01qb2xuaXJVc2VyU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJJZ25vcmVkIHVzZXJzXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSd3YXJuaW5nJz57X3QoXCLimqAgVGhlc2Ugc2V0dGluZ3MgYXJlIG1lYW50IGZvciBhZHZhbmNlZCB1c2Vycy5cIil9PC9zcGFuPjxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBZGQgdXNlcnMgYW5kIHNlcnZlcnMgeW91IHdhbnQgdG8gaWdub3JlIGhlcmUuIFVzZSBhc3Rlcmlza3MgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG8gaGF2ZSAlKGJyYW5kKXMgbWF0Y2ggYW55IGNoYXJhY3RlcnMuIEZvciBleGFtcGxlLCA8Y29kZT5AYm90Oio8L2NvZGU+IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndvdWxkIGlnbm9yZSBhbGwgdXNlcnMgdGhhdCBoYXZlIHRoZSBuYW1lICdib3QnIG9uIGFueSBzZXJ2ZXIuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LCB7Y29kZTogKHMpID0+IDxjb2RlPntzfTwvY29kZT59LFxuICAgICAgICAgICAgICAgICAgICAgICAgKX08YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWdub3JpbmcgcGVvcGxlIGlzIGRvbmUgdGhyb3VnaCBiYW4gbGlzdHMgd2hpY2ggY29udGFpbiBydWxlcyBmb3IgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2hvIHRvIGJhbi4gU3Vic2NyaWJpbmcgdG8gYSBiYW4gbGlzdCBtZWFucyB0aGUgdXNlcnMvc2VydmVycyBibG9ja2VkIGJ5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRoYXQgbGlzdCB3aWxsIGJlIGhpZGRlbiBmcm9tIHlvdS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+e190KFwiUGVyc29uYWwgYmFuIGxpc3RcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91ciBwZXJzb25hbCBiYW4gbGlzdCBob2xkcyBhbGwgdGhlIHVzZXJzL3NlcnZlcnMgeW91IHBlcnNvbmFsbHkgZG9uJ3QgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2FudCB0byBzZWUgbWVzc2FnZXMgZnJvbS4gQWZ0ZXIgaWdub3JpbmcgeW91ciBmaXJzdCB1c2VyL3NlcnZlciwgYSBuZXcgcm9vbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWxsIHNob3cgdXAgaW4geW91ciByb29tIGxpc3QgbmFtZWQgJ015IEJhbiBMaXN0JyAtIHN0YXkgaW4gdGhpcyByb29tIHRvIGtlZXAgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIGJhbiBsaXN0IGluIGVmZmVjdC5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyUGVyc29uYWxCYW5MaXN0UnVsZXMoKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbkFkZFBlcnNvbmFsUnVsZX0gYXV0b0NvbXBsZXRlPVwib2ZmXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2VydmVyIG9yIHVzZXIgSUQgdG8gaWdub3JlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJlZzogQGJvdDoqIG9yIGV4YW1wbGUub3JnXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5uZXdQZXJzb25hbFJ1bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUGVyc29uYWxSdWxlQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BZGRQZXJzb25hbFJ1bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJJZ25vcmVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPntfdChcIlN1YnNjcmliZWQgbGlzdHNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSd3YXJuaW5nJz57X3QoXCJTdWJzY3JpYmluZyB0byBhIGJhbiBsaXN0IHdpbGwgY2F1c2UgeW91IHRvIGpvaW4gaXQhXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICZuYnNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgdGhpcyBpc24ndCB3aGF0IHlvdSB3YW50LCBwbGVhc2UgdXNlIGEgZGlmZmVyZW50IHRvb2wgdG8gaWdub3JlIHVzZXJzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMucmVuZGVyU3Vic2NyaWJlZEJhbkxpc3RzKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJzY3JpYmVMaXN0fSBhdXRvQ29tcGxldGU9XCJvZmZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSb29tIElEIG9yIGFkZHJlc3Mgb2YgYmFuIGxpc3RcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld0xpc3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTmV3TGlzdENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3Vic2NyaWJlTGlzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlN1YnNjcmliZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19