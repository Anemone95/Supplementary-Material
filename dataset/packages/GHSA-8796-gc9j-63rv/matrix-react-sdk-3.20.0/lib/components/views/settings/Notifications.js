"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _notifications = require("../../../notifications");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _LabelledToggleSwitch = _interopRequireDefault(require("../elements/LabelledToggleSwitch"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _UIFeature = require("../../../settings/UIFeature");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

// TODO: this "view" component still has far too much application logic in it,
// which should be factored out to other files.
// TODO: this component also does a lot of direct poking into this.state, which
// is VERY NAUGHTY.

/**
 * Rules that Vector used to set in order to override the actions of default rules.
 * These are used to port peoples existing overrides to match the current API.
 * These can be removed and forgotten once everyone has moved to the new client.
 */
const LEGACY_RULES = {
  "im.vector.rule.contains_display_name": ".m.rule.contains_display_name",
  "im.vector.rule.room_one_to_one": ".m.rule.room_one_to_one",
  "im.vector.rule.room_message": ".m.rule.message",
  "im.vector.rule.invite_for_me": ".m.rule.invite_for_me",
  "im.vector.rule.call": ".m.rule.call",
  "im.vector.rule.notices": ".m.rule.suppress_notices"
};

function portLegacyActions(actions) {
  const decoded = _notifications.NotificationUtils.decodeActions(actions);

  if (decoded !== null) {
    return _notifications.NotificationUtils.encodeActions(decoded);
  } else {
    // We don't recognise one of the actions here, so we don't try to
    // canonicalise them.
    return actions;
  }
}

let Notifications = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.Notifications"), _dec(_class = (_temp = _class2 = class Notifications extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      phase: Notifications.phases.LOADING,
      masterPushRule: undefined,
      // The master rule ('.m.rule.master')
      vectorPushRules: [],
      // HS default push rules displayed in Vector UI
      vectorContentRules: {
        // Keyword push rules displayed in Vector UI
        vectorState: _notifications.PushRuleVectorState.ON,
        rules: []
      },
      externalPushRules: [],
      // Push rules (except content rule) that have been defined outside Vector UI
      externalContentRules: [],
      // Keyword push rules that have been defined outside Vector UI
      threepids: [] // used for email notifications

    });
    (0, _defineProperty2.default)(this, "onEnableNotificationsChange", checked => {
      const self = this;
      this.setState({
        phase: Notifications.phases.LOADING
      });

      _MatrixClientPeg.MatrixClientPeg.get().setPushRuleEnabled('global', self.state.masterPushRule.kind, self.state.masterPushRule.rule_id, !checked).then(function () {
        self._refreshFromServer();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableDesktopNotificationsChange", checked => {
      _SettingsStore.default.setValue("notificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked).finally(() => {
        this.forceUpdate();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableDesktopNotificationBodyChange", checked => {
      _SettingsStore.default.setValue("notificationBodyEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked).finally(() => {
        this.forceUpdate();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableAudioNotificationsChange", checked => {
      _SettingsStore.default.setValue("audioNotificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, checked).finally(() => {
        this.forceUpdate();
      });
    });
    (0, _defineProperty2.default)(this, "onEnableEmailNotificationsChange", (address, checked) => {
      let emailPusherPromise;

      if (checked) {
        const data = {};
        data['brand'] = _SdkConfig.default.get().brand;
        emailPusherPromise = _MatrixClientPeg.MatrixClientPeg.get().setPusher({
          kind: 'email',
          app_id: 'm.email',
          pushkey: address,
          app_display_name: 'Email Notifications',
          device_display_name: address,
          lang: navigator.language,
          data: data,
          append: true // We always append for email pushers since we don't want to stop other accounts notifying to the same email address

        });
      } else {
        const emailPusher = this.getEmailPusher(this.state.pushers, address);
        emailPusher.kind = null;
        emailPusherPromise = _MatrixClientPeg.MatrixClientPeg.get().setPusher(emailPusher);
      }

      emailPusherPromise.then(() => {
        this._refreshFromServer();
      }, error => {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Error saving email notification preferences', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Error saving email notification preferences'),
          description: (0, _languageHandler._t)('An error occurred whilst saving your email notification preferences.')
        });
      });
    });
    (0, _defineProperty2.default)(this, "onNotifStateButtonClicked", event => {
      // FIXME: use .bind() rather than className metadata here surely
      const vectorRuleId = event.target.className.split("-")[0];
      const newPushRuleVectorState = event.target.className.split("-")[1];

      if ("_keywords" === vectorRuleId) {
        this._setKeywordsPushRuleVectorState(newPushRuleVectorState);
      } else {
        const rule = this.getRule(vectorRuleId);

        if (rule) {
          this._setPushRuleVectorState(rule, newPushRuleVectorState);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onKeywordsClicked", event => {
      // Compute the keywords list to display
      let keywords = [];

      for (const i in this.state.vectorContentRules.rules) {
        const rule = this.state.vectorContentRules.rules[i];
        keywords.push(rule.pattern);
      }

      if (keywords.length) {
        // As keeping the order of per-word push rules hs side is a bit tricky to code,
        // display the keywords in alphabetical order to the user
        keywords.sort();
        keywords = keywords.join(", ");
      } else {
        keywords = "";
      }

      const TextInputDialog = sdk.getComponent("dialogs.TextInputDialog");

      _Modal.default.createTrackedDialog('Keywords Dialog', '', TextInputDialog, {
        title: (0, _languageHandler._t)('Keywords'),
        description: (0, _languageHandler._t)('Enter keywords separated by a comma:'),
        button: (0, _languageHandler._t)('OK'),
        value: keywords,
        onFinished: (shouldLeave, newValue) => {
          if (shouldLeave && newValue !== keywords) {
            let newKeywords = newValue.split(',');

            for (const i in newKeywords) {
              newKeywords[i] = newKeywords[i].trim();
            } // Remove duplicates and empty


            newKeywords = newKeywords.reduce(function (array, keyword) {
              if (keyword !== "" && array.indexOf(keyword) < 0) {
                array.push(keyword);
              }

              return array;
            }, []);

            this._setKeywords(newKeywords);
          }
        }
      });
    });
    (0, _defineProperty2.default)(this, "_refreshFromServer", () => {
      const self = this;

      const pushRulesPromise = _MatrixClientPeg.MatrixClientPeg.get().getPushRules().then(self._portRulesToNewAPI).then(function (rulesets) {
        /// XXX seriously? wtf is this?
        _MatrixClientPeg.MatrixClientPeg.get().pushRules = rulesets; // Get homeserver default rules and triage them by categories

        const ruleCategories = {
          // The master rule (all notifications disabling)
          '.m.rule.master': 'master',
          // The default push rules displayed by Vector UI
          '.m.rule.contains_display_name': 'vector',
          '.m.rule.contains_user_name': 'vector',
          '.m.rule.roomnotif': 'vector',
          '.m.rule.room_one_to_one': 'vector',
          '.m.rule.encrypted_room_one_to_one': 'vector',
          '.m.rule.message': 'vector',
          '.m.rule.encrypted': 'vector',
          '.m.rule.invite_for_me': 'vector',
          //'.m.rule.member_event': 'vector',
          '.m.rule.call': 'vector',
          '.m.rule.suppress_notices': 'vector',
          '.m.rule.tombstone': 'vector' // Others go to others

        }; // HS default rules

        const defaultRules = {
          master: [],
          vector: {},
          others: []
        };

        for (const kind in rulesets.global) {
          for (let i = 0; i < Object.keys(rulesets.global[kind]).length; ++i) {
            const r = rulesets.global[kind][i];
            const cat = ruleCategories[r.rule_id];
            r.kind = kind;

            if (r.rule_id[0] === '.') {
              if (cat === 'vector') {
                defaultRules.vector[r.rule_id] = r;
              } else if (cat === 'master') {
                defaultRules.master.push(r);
              } else {
                defaultRules['others'].push(r);
              }
            }
          }
        } // Get the master rule if any defined by the hs


        if (defaultRules.master.length > 0) {
          self.state.masterPushRule = defaultRules.master[0];
        } // parse the keyword rules into our state


        const contentRules = _notifications.ContentRules.parseContentRules(rulesets);

        self.state.vectorContentRules = {
          vectorState: contentRules.vectorState,
          rules: contentRules.rules
        };
        self.state.externalContentRules = contentRules.externalRules; // Build the rules displayed in the Vector UI matrix table

        self.state.vectorPushRules = [];
        self.state.externalPushRules = [];
        const vectorRuleIds = ['.m.rule.contains_display_name', '.m.rule.contains_user_name', '.m.rule.roomnotif', '_keywords', '.m.rule.room_one_to_one', '.m.rule.encrypted_room_one_to_one', '.m.rule.message', '.m.rule.encrypted', '.m.rule.invite_for_me', //'im.vector.rule.member_event',
        '.m.rule.call', '.m.rule.suppress_notices', '.m.rule.tombstone'];

        for (const i in vectorRuleIds) {
          const vectorRuleId = vectorRuleIds[i];

          if (vectorRuleId === '_keywords') {
            // keywords needs a special handling
            // For Vector UI, this is a single global push rule but translated in Matrix,
            // it corresponds to all content push rules (stored in self.state.vectorContentRule)
            self.state.vectorPushRules.push({
              "vectorRuleId": "_keywords",
              "description": /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)('Messages containing <span>keywords</span>', {}, {
                'span': sub => /*#__PURE__*/_react.default.createElement("span", {
                  className: "mx_UserNotifSettings_keywords",
                  onClick: self.onKeywordsClicked
                }, sub)
              })),
              "vectorState": self.state.vectorContentRules.vectorState
            });
          } else {
            const ruleDefinition = _notifications.VectorPushRulesDefinitions[vectorRuleId];
            const rule = defaultRules.vector[vectorRuleId];
            const vectorState = ruleDefinition.ruleToVectorState(rule); //console.log("Refreshing vectorPushRules for " + vectorRuleId +", "+ ruleDefinition.description +", " + rule +", " + vectorState);

            self.state.vectorPushRules.push({
              "vectorRuleId": vectorRuleId,
              "description": (0, _languageHandler._t)(ruleDefinition.description),
              // Text from VectorPushRulesDefinitions.js
              "rule": rule,
              "vectorState": vectorState
            }); // if there was a rule which we couldn't parse, add it to the external list

            if (rule && !vectorState) {
              rule.description = ruleDefinition.description;
              self.state.externalPushRules.push(rule);
            }
          }
        } // Build the rules not managed by Vector UI


        const otherRulesDescriptions = {
          '.m.rule.message': (0, _languageHandler._t)('Notify for all other messages/rooms'),
          '.m.rule.fallback': (0, _languageHandler._t)('Notify me for anything else')
        };

        for (const i in defaultRules.others) {
          const rule = defaultRules.others[i];
          const ruleDescription = otherRulesDescriptions[rule.rule_id]; // Show enabled default rules that was modified by the user

          if (ruleDescription && rule.enabled && !rule.default) {
            rule.description = ruleDescription;
            self.state.externalPushRules.push(rule);
          }
        }
      });

      const pushersPromise = _MatrixClientPeg.MatrixClientPeg.get().getPushers().then(function (resp) {
        self.setState({
          pushers: resp.pushers
        });
      });

      Promise.all([pushRulesPromise, pushersPromise]).then(function () {
        self.setState({
          phase: Notifications.phases.DISPLAY
        });
      }, function (error) {
        console.error(error);
        self.setState({
          phase: Notifications.phases.ERROR
        });
      }).finally(() => {
        // actually explicitly update our state  having been deep-manipulating it
        self.setState({
          masterPushRule: self.state.masterPushRule,
          vectorContentRules: self.state.vectorContentRules,
          vectorPushRules: self.state.vectorPushRules,
          externalContentRules: self.state.externalContentRules,
          externalPushRules: self.state.externalPushRules
        });
      });

      _MatrixClientPeg.MatrixClientPeg.get().getThreePids().then(r => this.setState({
        threepids: r.threepids
      }));
    });
    (0, _defineProperty2.default)(this, "_onClearNotifications", () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      cli.getRooms().forEach(r => {
        if (r.getUnreadNotificationCount() > 0) {
          const events = r.getLiveTimeline().getEvents();
          if (events.length) cli.sendReadReceipt(events.pop());
        }
      });
    });
  }

  componentDidMount() {
    this._refreshFromServer();
  }

  /*
   * Returns the email pusher (pusher of type 'email') for a given
   * email address. Email pushers all have the same app ID, so since
   * pushers are unique over (app ID, pushkey), there will be at most
   * one such pusher.
   */
  getEmailPusher(pushers, address) {
    if (pushers === undefined) {
      return undefined;
    }

    for (let i = 0; i < pushers.length; ++i) {
      if (pushers[i].kind === 'email' && pushers[i].pushkey === address) {
        return pushers[i];
      }
    }

    return undefined;
  }

  getRule(vectorRuleId) {
    for (const i in this.state.vectorPushRules) {
      const rule = this.state.vectorPushRules[i];

      if (rule.vectorRuleId === vectorRuleId) {
        return rule;
      }
    }
  }

  _setPushRuleVectorState(rule, newPushRuleVectorState) {
    if (rule && rule.vectorState !== newPushRuleVectorState) {
      this.setState({
        phase: Notifications.phases.LOADING
      });
      const self = this;

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const deferreds = [];
      const ruleDefinition = _notifications.VectorPushRulesDefinitions[rule.vectorRuleId];

      if (rule.rule) {
        const actions = ruleDefinition.vectorStateToActions[newPushRuleVectorState];

        if (!actions) {
          // The new state corresponds to disabling the rule.
          deferreds.push(cli.setPushRuleEnabled('global', rule.rule.kind, rule.rule.rule_id, false));
        } else {
          // The new state corresponds to enabling the rule and setting specific actions
          deferreds.push(this._updatePushRuleActions(rule.rule, actions, true));
        }
      }

      Promise.all(deferreds).then(function () {
        self._refreshFromServer();
      }, function (error) {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        console.error("Failed to change settings: " + error);

        _Modal.default.createTrackedDialog('Failed to change settings', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Failed to change settings'),
          description: error && error.message ? error.message : (0, _languageHandler._t)('Operation failed'),
          onFinished: self._refreshFromServer
        });
      });
    }
  }

  _setKeywordsPushRuleVectorState(newPushRuleVectorState) {
    // Is there really a change?
    if (this.state.vectorContentRules.vectorState === newPushRuleVectorState || this.state.vectorContentRules.rules.length === 0) {
      return;
    }

    const self = this;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    this.setState({
      phase: Notifications.phases.LOADING
    }); // Update all rules in self.state.vectorContentRules

    const deferreds = [];

    for (const i in this.state.vectorContentRules.rules) {
      const rule = this.state.vectorContentRules.rules[i];
      let enabled;
      let actions;

      switch (newPushRuleVectorState) {
        case _notifications.PushRuleVectorState.ON:
          if (rule.actions.length !== 1) {
            actions = _notifications.PushRuleVectorState.actionsFor(_notifications.PushRuleVectorState.ON);
          }

          if (this.state.vectorContentRules.vectorState === _notifications.PushRuleVectorState.OFF) {
            enabled = true;
          }

          break;

        case _notifications.PushRuleVectorState.LOUD:
          if (rule.actions.length !== 3) {
            actions = _notifications.PushRuleVectorState.actionsFor(_notifications.PushRuleVectorState.LOUD);
          }

          if (this.state.vectorContentRules.vectorState === _notifications.PushRuleVectorState.OFF) {
            enabled = true;
          }

          break;

        case _notifications.PushRuleVectorState.OFF:
          enabled = false;
          break;
      }

      if (actions) {
        // Note that the workaround in _updatePushRuleActions will automatically
        // enable the rule
        deferreds.push(this._updatePushRuleActions(rule, actions, enabled));
      } else if (enabled != undefined) {
        deferreds.push(cli.setPushRuleEnabled('global', rule.kind, rule.rule_id, enabled));
      }
    }

    Promise.all(deferreds).then(function (resps) {
      self._refreshFromServer();
    }, function (error) {
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      console.error("Can't update user notification settings: " + error);

      _Modal.default.createTrackedDialog('Can\'t update user notifcation settings', '', ErrorDialog, {
        title: (0, _languageHandler._t)('Can\'t update user notification settings'),
        description: error && error.message ? error.message : (0, _languageHandler._t)('Operation failed'),
        onFinished: self._refreshFromServer
      });
    });
  }

  _setKeywords(newKeywords) {
    this.setState({
      phase: Notifications.phases.LOADING
    });
    const self = this;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const removeDeferreds = []; // Remove per-word push rules of keywords that are no more in the list

    const vectorContentRulesPatterns = [];

    for (const i in self.state.vectorContentRules.rules) {
      const rule = self.state.vectorContentRules.rules[i];
      vectorContentRulesPatterns.push(rule.pattern);

      if (newKeywords.indexOf(rule.pattern) < 0) {
        removeDeferreds.push(cli.deletePushRule('global', rule.kind, rule.rule_id));
      }
    } // If the keyword is part of `externalContentRules`, remove the rule
    // before recreating it in the right Vector path


    for (const i in self.state.externalContentRules) {
      const rule = self.state.externalContentRules[i];

      if (newKeywords.indexOf(rule.pattern) >= 0) {
        removeDeferreds.push(cli.deletePushRule('global', rule.kind, rule.rule_id));
      }
    }

    const onError = function (error) {
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
      console.error("Failed to update keywords: " + error);

      _Modal.default.createTrackedDialog('Failed to update keywords', '', ErrorDialog, {
        title: (0, _languageHandler._t)('Failed to update keywords'),
        description: error && error.message ? error.message : (0, _languageHandler._t)('Operation failed'),
        onFinished: self._refreshFromServer
      });
    }; // Then, add the new ones


    Promise.all(removeDeferreds).then(function (resps) {
      const deferreds = [];
      let pushRuleVectorStateKind = self.state.vectorContentRules.vectorState;

      if (pushRuleVectorStateKind === _notifications.PushRuleVectorState.OFF) {
        // When the current global keywords rule is OFF, we need to look at
        // the flavor of rules in 'vectorContentRules' to apply the same actions
        // when creating the new rule.
        // Thus, this new rule will join the 'vectorContentRules' set.
        if (self.state.vectorContentRules.rules.length) {
          pushRuleVectorStateKind = _notifications.PushRuleVectorState.contentRuleVectorStateKind(self.state.vectorContentRules.rules[0]);
        } else {
          // ON is default
          pushRuleVectorStateKind = _notifications.PushRuleVectorState.ON;
        }
      }

      for (const i in newKeywords) {
        const keyword = newKeywords[i];

        if (vectorContentRulesPatterns.indexOf(keyword) < 0) {
          if (self.state.vectorContentRules.vectorState !== _notifications.PushRuleVectorState.OFF) {
            deferreds.push(cli.addPushRule('global', 'content', keyword, {
              actions: _notifications.PushRuleVectorState.actionsFor(pushRuleVectorStateKind),
              pattern: keyword
            }));
          } else {
            deferreds.push(self._addDisabledPushRule('global', 'content', keyword, {
              actions: _notifications.PushRuleVectorState.actionsFor(pushRuleVectorStateKind),
              pattern: keyword
            }));
          }
        }
      }

      Promise.all(deferreds).then(function (resps) {
        self._refreshFromServer();
      }, onError);
    }, onError);
  } // Create a push rule but disabled


  _addDisabledPushRule(scope, kind, ruleId, body) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    return cli.addPushRule(scope, kind, ruleId, body).then(() => cli.setPushRuleEnabled(scope, kind, ruleId, false));
  } // Check if any legacy im.vector rules need to be ported to the new API
  // for overriding the actions of default rules.


  _portRulesToNewAPI(rulesets) {
    const needsUpdate = [];

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    for (const kind in rulesets.global) {
      const ruleset = rulesets.global[kind];

      for (let i = 0; i < ruleset.length; ++i) {
        const rule = ruleset[i];

        if (rule.rule_id in LEGACY_RULES) {
          console.log("Porting legacy rule", rule);
          needsUpdate.push(function (kind, rule) {
            return cli.setPushRuleActions('global', kind, LEGACY_RULES[rule.rule_id], portLegacyActions(rule.actions)).then(() => cli.deletePushRule('global', kind, rule.rule_id)).catch(e => {
              console.warn(`Error when porting legacy rule: ${e}`);
            });
          }(kind, rule));
        }
      }
    }

    if (needsUpdate.length > 0) {
      // If some of the rules need to be ported then wait for the porting
      // to happen and then fetch the rules again.
      return Promise.all(needsUpdate).then(() => cli.getPushRules());
    } else {
      // Otherwise return the rules that we already have.
      return rulesets;
    }
  }

  _updatePushRuleActions(rule, actions, enabled) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    return cli.setPushRuleActions('global', rule.kind, rule.rule_id, actions).then(function () {
      // Then, if requested, enabled or disabled the rule
      if (undefined != enabled) {
        return cli.setPushRuleEnabled('global', rule.kind, rule.rule_id, enabled);
      }
    });
  }

  renderNotifRulesTableRow(title, className, pushRuleVectorState) {
    return /*#__PURE__*/_react.default.createElement("tr", {
      key: className
    }, /*#__PURE__*/_react.default.createElement("th", null, title), /*#__PURE__*/_react.default.createElement("th", null, /*#__PURE__*/_react.default.createElement("input", {
      className: className + "-" + _notifications.PushRuleVectorState.OFF,
      type: "radio",
      checked: pushRuleVectorState === _notifications.PushRuleVectorState.OFF,
      onChange: this.onNotifStateButtonClicked
    })), /*#__PURE__*/_react.default.createElement("th", null, /*#__PURE__*/_react.default.createElement("input", {
      className: className + "-" + _notifications.PushRuleVectorState.ON,
      type: "radio",
      checked: pushRuleVectorState === _notifications.PushRuleVectorState.ON,
      onChange: this.onNotifStateButtonClicked
    })), /*#__PURE__*/_react.default.createElement("th", null, /*#__PURE__*/_react.default.createElement("input", {
      className: className + "-" + _notifications.PushRuleVectorState.LOUD,
      type: "radio",
      checked: pushRuleVectorState === _notifications.PushRuleVectorState.LOUD,
      onChange: this.onNotifStateButtonClicked
    })));
  }

  renderNotifRulesTableRows() {
    const rows = [];

    for (const i in this.state.vectorPushRules) {
      const rule = this.state.vectorPushRules[i];

      if (rule.rule === undefined && rule.vectorRuleId.startsWith(".m.")) {
        console.warn(`Skipping render of rule ${rule.vectorRuleId} due to no underlying rule`);
        continue;
      } //console.log("rendering: " + rule.description + ", " + rule.vectorRuleId + ", " + rule.vectorState);


      rows.push(this.renderNotifRulesTableRow(rule.description, rule.vectorRuleId, rule.vectorState));
    }

    return rows;
  }

  hasEmailPusher(pushers, address) {
    if (pushers === undefined) {
      return false;
    }

    for (let i = 0; i < pushers.length; ++i) {
      if (pushers[i].kind === 'email' && pushers[i].pushkey === address) {
        return true;
      }
    }

    return false;
  }

  emailNotificationsRow(address, label) {
    return /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: this.hasEmailPusher(this.state.pushers, address),
      onChange: this.onEnableEmailNotificationsChange.bind(this, address),
      label: label,
      key: `emailNotif_${label}`
    });
  }

  render() {
    let spinner;

    if (this.state.phase === Notifications.phases.LOADING) {
      const Loader = sdk.getComponent("elements.Spinner");
      spinner = /*#__PURE__*/_react.default.createElement(Loader, null);
    }

    let masterPushRuleDiv;

    if (this.state.masterPushRule) {
      masterPushRuleDiv = /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
        value: !this.state.masterPushRule.enabled,
        onChange: this.onEnableNotificationsChange,
        label: (0, _languageHandler._t)('Enable notifications for this account')
      });
    }

    let clearNotificationsButton;

    if (_MatrixClientPeg.MatrixClientPeg.get().getRooms().some(r => r.getUnreadNotificationCount() > 0)) {
      clearNotificationsButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._onClearNotifications,
        kind: "danger"
      }, (0, _languageHandler._t)("Clear notifications"));
    } // When enabled, the master rule inhibits all existing rules
    // So do not show all notification settings


    if (this.state.masterPushRule && this.state.masterPushRule.enabled) {
      return /*#__PURE__*/_react.default.createElement("div", null, masterPushRuleDiv, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserNotifSettings_notifTable"
      }, (0, _languageHandler._t)('All notifications are currently disabled for all targets.')), clearNotificationsButton);
    }

    const emailThreepids = this.state.threepids.filter(tp => tp.medium === "email");
    let emailNotificationsRows;

    if (emailThreepids.length > 0) {
      emailNotificationsRows = emailThreepids.map(threePid => this.emailNotificationsRow(threePid.address, `${(0, _languageHandler._t)('Enable email notifications')} (${threePid.address})`));
    } else if (_SettingsStore.default.getValue(_UIFeature.UIFeature.ThirdPartyID)) {
      emailNotificationsRows = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Add an email address to configure email notifications'));
    } // Build external push rules


    const externalRules = [];

    for (const i in this.state.externalPushRules) {
      const rule = this.state.externalPushRules[i];
      externalRules.push( /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)(rule.description)));
    } // Show keywords not displayed by the vector UI as a single external push rule


    let externalKeywords = [];

    for (const i in this.state.externalContentRules) {
      const rule = this.state.externalContentRules[i];
      externalKeywords.push(rule.pattern);
    }

    if (externalKeywords.length) {
      externalKeywords = externalKeywords.join(", ");
      externalRules.push( /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)('Notifications on the following keywords follow rules which can’t be displayed here:'), externalKeywords));
    }

    let devicesSection;

    if (this.state.pushers === undefined) {
      devicesSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, (0, _languageHandler._t)('Unable to fetch notification target list'));
    } else if (this.state.pushers.length === 0) {
      devicesSection = null;
    } else {
      // TODO: It would be great to be able to delete pushers from here too,
      // and this wouldn't be hard to add.
      const rows = [];

      for (let i = 0; i < this.state.pushers.length; ++i) {
        rows.push( /*#__PURE__*/_react.default.createElement("tr", {
          key: i
        }, /*#__PURE__*/_react.default.createElement("td", null, this.state.pushers[i].app_display_name), /*#__PURE__*/_react.default.createElement("td", null, this.state.pushers[i].device_display_name)));
      }

      devicesSection = /*#__PURE__*/_react.default.createElement("table", {
        className: "mx_UserNotifSettings_devicesTable"
      }, /*#__PURE__*/_react.default.createElement("tbody", null, rows));
    }

    if (devicesSection) {
      devicesSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Notification targets')), devicesSection);
    }

    let advancedSettings;

    if (externalRules.length) {
      const brand = _SdkConfig.default.get().brand;

      advancedSettings = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)('Advanced notification settings')), (0, _languageHandler._t)('There are advanced notifications which are not shown here.'), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)('You might have configured them in a client other than %(brand)s. ' + 'You cannot tune them in %(brand)s but they still apply.', {
        brand
      }), /*#__PURE__*/_react.default.createElement("ul", null, externalRules));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, masterPushRuleDiv, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserNotifSettings_notifTable"
    }, spinner, /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: _SettingsStore.default.getValue("notificationsEnabled"),
      onChange: this.onEnableDesktopNotificationsChange,
      label: (0, _languageHandler._t)('Enable desktop notifications for this session')
    }), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: _SettingsStore.default.getValue("notificationBodyEnabled"),
      onChange: this.onEnableDesktopNotificationBodyChange,
      label: (0, _languageHandler._t)('Show message in desktop notification')
    }), /*#__PURE__*/_react.default.createElement(_LabelledToggleSwitch.default, {
      value: _SettingsStore.default.getValue("audioNotificationsEnabled"),
      onChange: this.onEnableAudioNotificationsChange,
      label: (0, _languageHandler._t)('Enable audible notifications for this session')
    }), emailNotificationsRows, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserNotifSettings_pushRulesTableWrapper"
    }, /*#__PURE__*/_react.default.createElement("table", {
      className: "mx_UserNotifSettings_pushRulesTable"
    }, /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", {
      width: "55%"
    }), /*#__PURE__*/_react.default.createElement("th", {
      width: "15%"
    }, (0, _languageHandler._t)('Off')), /*#__PURE__*/_react.default.createElement("th", {
      width: "15%"
    }, (0, _languageHandler._t)('On')), /*#__PURE__*/_react.default.createElement("th", {
      width: "15%"
    }, (0, _languageHandler._t)('Noisy')))), /*#__PURE__*/_react.default.createElement("tbody", null, this.renderNotifRulesTableRows()))), advancedSettings, devicesSection, clearNotificationsButton));
  }

}, (0, _defineProperty2.default)(_class2, "phases", {
  LOADING: "LOADING",
  // The component is loading or sending data to the hs
  DISPLAY: "DISPLAY",
  // The component is ready and display data
  ERROR: "ERROR" // There was an error

}), _temp)) || _class);
exports.default = Notifications;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL05vdGlmaWNhdGlvbnMuanMiXSwibmFtZXMiOlsiTEVHQUNZX1JVTEVTIiwicG9ydExlZ2FjeUFjdGlvbnMiLCJhY3Rpb25zIiwiZGVjb2RlZCIsIk5vdGlmaWNhdGlvblV0aWxzIiwiZGVjb2RlQWN0aW9ucyIsImVuY29kZUFjdGlvbnMiLCJOb3RpZmljYXRpb25zIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwaGFzZSIsInBoYXNlcyIsIkxPQURJTkciLCJtYXN0ZXJQdXNoUnVsZSIsInVuZGVmaW5lZCIsInZlY3RvclB1c2hSdWxlcyIsInZlY3RvckNvbnRlbnRSdWxlcyIsInZlY3RvclN0YXRlIiwiUHVzaFJ1bGVWZWN0b3JTdGF0ZSIsIk9OIiwicnVsZXMiLCJleHRlcm5hbFB1c2hSdWxlcyIsImV4dGVybmFsQ29udGVudFJ1bGVzIiwidGhyZWVwaWRzIiwiY2hlY2tlZCIsInNlbGYiLCJzZXRTdGF0ZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInNldFB1c2hSdWxlRW5hYmxlZCIsInN0YXRlIiwia2luZCIsInJ1bGVfaWQiLCJ0aGVuIiwiX3JlZnJlc2hGcm9tU2VydmVyIiwiU2V0dGluZ3NTdG9yZSIsInNldFZhbHVlIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwiZmluYWxseSIsImZvcmNlVXBkYXRlIiwiYWRkcmVzcyIsImVtYWlsUHVzaGVyUHJvbWlzZSIsImRhdGEiLCJTZGtDb25maWciLCJicmFuZCIsInNldFB1c2hlciIsImFwcF9pZCIsInB1c2hrZXkiLCJhcHBfZGlzcGxheV9uYW1lIiwiZGV2aWNlX2Rpc3BsYXlfbmFtZSIsImxhbmciLCJuYXZpZ2F0b3IiLCJsYW5ndWFnZSIsImFwcGVuZCIsImVtYWlsUHVzaGVyIiwiZ2V0RW1haWxQdXNoZXIiLCJwdXNoZXJzIiwiZXJyb3IiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJldmVudCIsInZlY3RvclJ1bGVJZCIsInRhcmdldCIsImNsYXNzTmFtZSIsInNwbGl0IiwibmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZSIsIl9zZXRLZXl3b3Jkc1B1c2hSdWxlVmVjdG9yU3RhdGUiLCJydWxlIiwiZ2V0UnVsZSIsIl9zZXRQdXNoUnVsZVZlY3RvclN0YXRlIiwia2V5d29yZHMiLCJpIiwicHVzaCIsInBhdHRlcm4iLCJsZW5ndGgiLCJzb3J0Iiwiam9pbiIsIlRleHRJbnB1dERpYWxvZyIsImJ1dHRvbiIsInZhbHVlIiwib25GaW5pc2hlZCIsInNob3VsZExlYXZlIiwibmV3VmFsdWUiLCJuZXdLZXl3b3JkcyIsInRyaW0iLCJyZWR1Y2UiLCJhcnJheSIsImtleXdvcmQiLCJpbmRleE9mIiwiX3NldEtleXdvcmRzIiwicHVzaFJ1bGVzUHJvbWlzZSIsImdldFB1c2hSdWxlcyIsIl9wb3J0UnVsZXNUb05ld0FQSSIsInJ1bGVzZXRzIiwicHVzaFJ1bGVzIiwicnVsZUNhdGVnb3JpZXMiLCJkZWZhdWx0UnVsZXMiLCJtYXN0ZXIiLCJ2ZWN0b3IiLCJvdGhlcnMiLCJnbG9iYWwiLCJPYmplY3QiLCJrZXlzIiwiciIsImNhdCIsImNvbnRlbnRSdWxlcyIsIkNvbnRlbnRSdWxlcyIsInBhcnNlQ29udGVudFJ1bGVzIiwiZXh0ZXJuYWxSdWxlcyIsInZlY3RvclJ1bGVJZHMiLCJzdWIiLCJvbktleXdvcmRzQ2xpY2tlZCIsInJ1bGVEZWZpbml0aW9uIiwiVmVjdG9yUHVzaFJ1bGVzRGVmaW5pdGlvbnMiLCJydWxlVG9WZWN0b3JTdGF0ZSIsIm90aGVyUnVsZXNEZXNjcmlwdGlvbnMiLCJydWxlRGVzY3JpcHRpb24iLCJlbmFibGVkIiwiZGVmYXVsdCIsInB1c2hlcnNQcm9taXNlIiwiZ2V0UHVzaGVycyIsInJlc3AiLCJQcm9taXNlIiwiYWxsIiwiRElTUExBWSIsImNvbnNvbGUiLCJFUlJPUiIsImdldFRocmVlUGlkcyIsImNsaSIsImdldFJvb21zIiwiZm9yRWFjaCIsImdldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50IiwiZXZlbnRzIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZ2V0RXZlbnRzIiwic2VuZFJlYWRSZWNlaXB0IiwicG9wIiwiY29tcG9uZW50RGlkTW91bnQiLCJkZWZlcnJlZHMiLCJ2ZWN0b3JTdGF0ZVRvQWN0aW9ucyIsIl91cGRhdGVQdXNoUnVsZUFjdGlvbnMiLCJtZXNzYWdlIiwiYWN0aW9uc0ZvciIsIk9GRiIsIkxPVUQiLCJyZXNwcyIsInJlbW92ZURlZmVycmVkcyIsInZlY3RvckNvbnRlbnRSdWxlc1BhdHRlcm5zIiwiZGVsZXRlUHVzaFJ1bGUiLCJvbkVycm9yIiwicHVzaFJ1bGVWZWN0b3JTdGF0ZUtpbmQiLCJjb250ZW50UnVsZVZlY3RvclN0YXRlS2luZCIsImFkZFB1c2hSdWxlIiwiX2FkZERpc2FibGVkUHVzaFJ1bGUiLCJzY29wZSIsInJ1bGVJZCIsImJvZHkiLCJuZWVkc1VwZGF0ZSIsInJ1bGVzZXQiLCJsb2ciLCJzZXRQdXNoUnVsZUFjdGlvbnMiLCJjYXRjaCIsImUiLCJ3YXJuIiwicmVuZGVyTm90aWZSdWxlc1RhYmxlUm93IiwicHVzaFJ1bGVWZWN0b3JTdGF0ZSIsIm9uTm90aWZTdGF0ZUJ1dHRvbkNsaWNrZWQiLCJyZW5kZXJOb3RpZlJ1bGVzVGFibGVSb3dzIiwicm93cyIsInN0YXJ0c1dpdGgiLCJoYXNFbWFpbFB1c2hlciIsImVtYWlsTm90aWZpY2F0aW9uc1JvdyIsImxhYmVsIiwib25FbmFibGVFbWFpbE5vdGlmaWNhdGlvbnNDaGFuZ2UiLCJiaW5kIiwicmVuZGVyIiwic3Bpbm5lciIsIkxvYWRlciIsIm1hc3RlclB1c2hSdWxlRGl2Iiwib25FbmFibGVOb3RpZmljYXRpb25zQ2hhbmdlIiwiY2xlYXJOb3RpZmljYXRpb25zQnV0dG9uIiwic29tZSIsIl9vbkNsZWFyTm90aWZpY2F0aW9ucyIsImVtYWlsVGhyZWVwaWRzIiwiZmlsdGVyIiwidHAiLCJtZWRpdW0iLCJlbWFpbE5vdGlmaWNhdGlvbnNSb3dzIiwibWFwIiwidGhyZWVQaWQiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIlRoaXJkUGFydHlJRCIsImV4dGVybmFsS2V5d29yZHMiLCJkZXZpY2VzU2VjdGlvbiIsImFkdmFuY2VkU2V0dGluZ3MiLCJvbkVuYWJsZURlc2t0b3BOb3RpZmljYXRpb25zQ2hhbmdlIiwib25FbmFibGVEZXNrdG9wTm90aWZpY2F0aW9uQm9keUNoYW5nZSIsIm9uRW5hYmxlQXVkaW9Ob3RpZmljYXRpb25zQ2hhbmdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTtBQUVBO0FBQ0E7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLFlBQVksR0FBRztBQUNqQiwwQ0FBd0MsK0JBRHZCO0FBRWpCLG9DQUFrQyx5QkFGakI7QUFHakIsaUNBQStCLGlCQUhkO0FBSWpCLGtDQUFnQyx1QkFKZjtBQUtqQix5QkFBdUIsY0FMTjtBQU1qQiw0QkFBMEI7QUFOVCxDQUFyQjs7QUFTQSxTQUFTQyxpQkFBVCxDQUEyQkMsT0FBM0IsRUFBb0M7QUFDaEMsUUFBTUMsT0FBTyxHQUFHQyxpQ0FBa0JDLGFBQWxCLENBQWdDSCxPQUFoQyxDQUFoQjs7QUFDQSxNQUFJQyxPQUFPLEtBQUssSUFBaEIsRUFBc0I7QUFDbEIsV0FBT0MsaUNBQWtCRSxhQUFsQixDQUFnQ0gsT0FBaEMsQ0FBUDtBQUNILEdBRkQsTUFFTztBQUNIO0FBQ0E7QUFDQSxXQUFPRCxPQUFQO0FBQ0g7QUFDSjs7SUFHb0JLLGEsV0FEcEIsZ0RBQXFCLDhCQUFyQixDLG1DQUFELE1BQ3FCQSxhQURyQixTQUMyQ0MsZUFBTUMsU0FEakQsQ0FDMkQ7QUFBQTtBQUFBO0FBQUEsaURBTy9DO0FBQ0pDLE1BQUFBLEtBQUssRUFBRUgsYUFBYSxDQUFDSSxNQUFkLENB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QUNJO0FBQUksTUFBQSxLQUFLLEVBQUM7QUFBVixNQURKLGVBRUk7QUFBSSxNQUFBLEtBQUssRUFBQztBQUFWLE9BQWtCLHlCQUFHLEtBQUgsQ0FBbEIsQ0FGSixlQUdJO0FBQUksTUFBQSxLQUFLLEVBQUM7QUFBVixPQUFrQix5QkFBRyxJQUFILENBQWxCLENBSEosZUFJSTtBQUFJLE1BQUEsS0FBSyxFQUFDO0FBQVYsT0FBa0IseUJBQUcsT0FBSCxDQUFsQixDQUpKLENBREosQ0FESixlQVNJLDRDQUVNLEtBQUtwQix5QkFBTCxFQUZOLENBVEosQ0FESixDQWxCSixFQW9DTTRCLGdCQXBDTixFQXNDTUQsY0F0Q04sRUF3Q01kLHdCQXhDTixDQUpKLENBREo7QUFrREg7O0FBLzBCc0QsQyxtREFDdkM7QUFDWjlLLEVBQUFBLE9BQU8sRUFBRSxTQURHO0FBQ1E7QUFDcEJzSCxFQUFBQSxPQUFPLEVBQUUsU0FGRztBQUVRO0FBQ3BCRSxFQUFBQSxLQUFLLEVBQUUsT0FISyxDQUdJOztBQUhKLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7XG4gICAgTm90aWZpY2F0aW9uVXRpbHMsXG4gICAgVmVjdG9yUHVzaFJ1bGVzRGVmaW5pdGlvbnMsXG4gICAgUHVzaFJ1bGVWZWN0b3JTdGF0ZSxcbiAgICBDb250ZW50UnVsZXMsXG59IGZyb20gJy4uLy4uLy4uL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgTGFiZWxsZWRUb2dnbGVTd2l0Y2ggZnJvbSBcIi4uL2VsZW1lbnRzL0xhYmVsbGVkVG9nZ2xlU3dpdGNoXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHtTZXR0aW5nTGV2ZWx9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLy8gVE9ETzogdGhpcyBcInZpZXdcIiBjb21wb25lbnQgc3RpbGwgaGFzIGZhciB0b28gbXVjaCBhcHBsaWNhdGlvbiBsb2dpYyBpbiBpdCxcbi8vIHdoaWNoIHNob3VsZCBiZSBmYWN0b3JlZCBvdXQgdG8gb3RoZXIgZmlsZXMuXG5cbi8vIFRPRE86IHRoaXMgY29tcG9uZW50IGFsc28gZG9lcyBhIGxvdCBvZiBkaXJlY3QgcG9raW5nIGludG8gdGhpcy5zdGF0ZSwgd2hpY2hcbi8vIGlzIFZFUlkgTkFVR0hUWS5cblxuXG4vKipcbiAqIFJ1bGVzIHRoYXQgVmVjdG9yIHVzZWQgdG8gc2V0IGluIG9yZGVyIHRvIG92ZXJyaWRlIHRoZSBhY3Rpb25zIG9mIGRlZmF1bHQgcnVsZXMuXG4gKiBUaGVzZSBhcmUgdXNlZCB0byBwb3J0IHBlb3BsZXMgZXhpc3Rpbmcgb3ZlcnJpZGVzIHRvIG1hdGNoIHRoZSBjdXJyZW50IEFQSS5cbiAqIFRoZXNlIGNhbiBiZSByZW1vdmVkIGFuZCBmb3Jnb3R0ZW4gb25jZSBldmVyeW9uZSBoYXMgbW92ZWQgdG8gdGhlIG5ldyBjbGllbnQuXG4gKi9cbmNvbnN0IExFR0FDWV9SVUxFUyA9IHtcbiAgICBcImltLnZlY3Rvci5ydWxlLmNvbnRhaW5zX2Rpc3BsYXlfbmFtZVwiOiBcIi5tLnJ1bGUuY29udGFpbnNfZGlzcGxheV9uYW1lXCIsXG4gICAgXCJpbS52ZWN0b3IucnVsZS5yb29tX29uZV90b19vbmVcIjogXCIubS5ydWxlLnJvb21fb25lX3RvX29uZVwiLFxuICAgIFwiaW0udmVjdG9yLnJ1bGUucm9vbV9tZXNzYWdlXCI6IFwiLm0ucnVsZS5tZXNzYWdlXCIsXG4gICAgXCJpbS52ZWN0b3IucnVsZS5pbnZpdGVfZm9yX21lXCI6IFwiLm0ucnVsZS5pbnZpdGVfZm9yX21lXCIsXG4gICAgXCJpbS52ZWN0b3IucnVsZS5jYWxsXCI6IFwiLm0ucnVsZS5jYWxsXCIsXG4gICAgXCJpbS52ZWN0b3IucnVsZS5ub3RpY2VzXCI6IFwiLm0ucnVsZS5zdXBwcmVzc19ub3RpY2VzXCIsXG59O1xuXG5mdW5jdGlvbiBwb3J0TGVnYWN5QWN0aW9ucyhhY3Rpb25zKSB7XG4gICAgY29uc3QgZGVjb2RlZCA9IE5vdGlmaWNhdGlvblV0aWxzLmRlY29kZUFjdGlvbnMoYWN0aW9ucyk7XG4gICAgaWYgKGRlY29kZWQgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIE5vdGlmaWNhdGlvblV0aWxzLmVuY29kZUFjdGlvbnMoZGVjb2RlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2UgZG9uJ3QgcmVjb2duaXNlIG9uZSBvZiB0aGUgYWN0aW9ucyBoZXJlLCBzbyB3ZSBkb24ndCB0cnkgdG9cbiAgICAgICAgLy8gY2Fub25pY2FsaXNlIHRoZW0uXG4gICAgICAgIHJldHVybiBhY3Rpb25zO1xuICAgIH1cbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MuTm90aWZpY2F0aW9uc1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm90aWZpY2F0aW9ucyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHBoYXNlcyA9IHtcbiAgICAgICAgTE9BRElORzogXCJMT0FESU5HXCIsIC8vIFRoZSBjb21wb25lbnQgaXMgbG9hZGluZyBvciBzZW5kaW5nIGRhdGEgdG8gdGhlIGhzXG4gICAgICAgIERJU1BMQVk6IFwiRElTUExBWVwiLCAvLyBUaGUgY29tcG9uZW50IGlzIHJlYWR5IGFuZCBkaXNwbGF5IGRhdGFcbiAgICAgICAgRVJST1I6IFwiRVJST1JcIiwgLy8gVGhlcmUgd2FzIGFuIGVycm9yXG4gICAgfTtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBwaGFzZTogTm90aWZpY2F0aW9ucy5waGFzZXMuTE9BRElORyxcbiAgICAgICAgbWFzdGVyUHVzaFJ1bGU6IHVuZGVmaW5lZCwgLy8gVGhlIG1hc3RlciBydWxlICgnLm0ucnVsZS5tYXN0ZXInKVxuICAgICAgICB2ZWN0b3JQdXNoUnVsZXM6IFtdLCAvLyBIUyBkZWZhdWx0IHB1c2ggcnVsZXMgZGlzcGxheWVkIGluIFZlY3RvciBVSVxuICAgICAgICB2ZWN0b3JDb250ZW50UnVsZXM6IHsgLy8gS2V5d29yZCBwdXNoIHJ1bGVzIGRpc3BsYXllZCBpbiBWZWN0b3IgVUlcbiAgICAgICAgICAgIHZlY3RvclN0YXRlOiBQdXNoUnVsZVZlY3RvclN0YXRlLk9OLFxuICAgICAgICAgICAgcnVsZXM6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBleHRlcm5hbFB1c2hSdWxlczogW10sIC8vIFB1c2ggcnVsZXMgKGV4Y2VwdCBjb250ZW50IHJ1bGUpIHRoYXQgaGF2ZSBiZWVuIGRlZmluZWQgb3V0c2lkZSBWZWN0b3IgVUlcbiAgICAgICAgZXh0ZXJuYWxDb250ZW50UnVsZXM6IFtdLCAvLyBLZXl3b3JkIHB1c2ggcnVsZXMgdGhhdCBoYXZlIGJlZW4gZGVmaW5lZCBvdXRzaWRlIFZlY3RvciBVSVxuICAgICAgICB0aHJlZXBpZHM6IFtdLCAvLyB1c2VkIGZvciBlbWFpbCBub3RpZmljYXRpb25zXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9yZWZyZXNoRnJvbVNlcnZlcigpO1xuICAgIH1cblxuICAgIG9uRW5hYmxlTm90aWZpY2F0aW9uc0NoYW5nZSA9IChjaGVja2VkKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBOb3RpZmljYXRpb25zLnBoYXNlcy5MT0FESU5HLFxuICAgICAgICB9KTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0UHVzaFJ1bGVFbmFibGVkKFxuICAgICAgICAgICAgJ2dsb2JhbCcsIHNlbGYuc3RhdGUubWFzdGVyUHVzaFJ1bGUua2luZCwgc2VsZi5zdGF0ZS5tYXN0ZXJQdXNoUnVsZS5ydWxlX2lkLCAhY2hlY2tlZCxcbiAgICAgICAgKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fcmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uRW5hYmxlRGVza3RvcE5vdGlmaWNhdGlvbnNDaGFuZ2UgPSAoY2hlY2tlZCkgPT4ge1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFxuICAgICAgICAgICAgXCJub3RpZmljYXRpb25zRW5hYmxlZFwiLCBudWxsLFxuICAgICAgICAgICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICAgICAgICAgIGNoZWNrZWQsXG4gICAgICAgICkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvbkVuYWJsZURlc2t0b3BOb3RpZmljYXRpb25Cb2R5Q2hhbmdlID0gKGNoZWNrZWQpID0+IHtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcbiAgICAgICAgICAgIFwibm90aWZpY2F0aW9uQm9keUVuYWJsZWRcIiwgbnVsbCxcbiAgICAgICAgICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgICAgICAgICBjaGVja2VkLFxuICAgICAgICApLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25FbmFibGVBdWRpb05vdGlmaWNhdGlvbnNDaGFuZ2UgPSAoY2hlY2tlZCkgPT4ge1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFxuICAgICAgICAgICAgXCJhdWRpb05vdGlmaWNhdGlvbnNFbmFibGVkXCIsIG51bGwsXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgICAgICAgICAgY2hlY2tlZCxcbiAgICAgICAgKS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogUmV0dXJucyB0aGUgZW1haWwgcHVzaGVyIChwdXNoZXIgb2YgdHlwZSAnZW1haWwnKSBmb3IgYSBnaXZlblxuICAgICAqIGVtYWlsIGFkZHJlc3MuIEVtYWlsIHB1c2hlcnMgYWxsIGhhdmUgdGhlIHNhbWUgYXBwIElELCBzbyBzaW5jZVxuICAgICAqIHB1c2hlcnMgYXJlIHVuaXF1ZSBvdmVyIChhcHAgSUQsIHB1c2hrZXkpLCB0aGVyZSB3aWxsIGJlIGF0IG1vc3RcbiAgICAgKiBvbmUgc3VjaCBwdXNoZXIuXG4gICAgICovXG4gICAgZ2V0RW1haWxQdXNoZXIocHVzaGVycywgYWRkcmVzcykge1xuICAgICAgICBpZiAocHVzaGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHVzaGVycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHB1c2hlcnNbaV0ua2luZCA9PT0gJ2VtYWlsJyAmJiBwdXNoZXJzW2ldLnB1c2hrZXkgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHVzaGVyc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIG9uRW5hYmxlRW1haWxOb3RpZmljYXRpb25zQ2hhbmdlID0gKGFkZHJlc3MsIGNoZWNrZWQpID0+IHtcbiAgICAgICAgbGV0IGVtYWlsUHVzaGVyUHJvbWlzZTtcbiAgICAgICAgaWYgKGNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7fTtcbiAgICAgICAgICAgIGRhdGFbJ2JyYW5kJ10gPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICBlbWFpbFB1c2hlclByb21pc2UgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0UHVzaGVyKHtcbiAgICAgICAgICAgICAgICBraW5kOiAnZW1haWwnLFxuICAgICAgICAgICAgICAgIGFwcF9pZDogJ20uZW1haWwnLFxuICAgICAgICAgICAgICAgIHB1c2hrZXk6IGFkZHJlc3MsXG4gICAgICAgICAgICAgICAgYXBwX2Rpc3BsYXlfbmFtZTogJ0VtYWlsIE5vdGlmaWNhdGlvbnMnLFxuICAgICAgICAgICAgICAgIGRldmljZV9kaXNwbGF5X25hbWU6IGFkZHJlc3MsXG4gICAgICAgICAgICAgICAgbGFuZzogbmF2aWdhdG9yLmxhbmd1YWdlLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgYXBwZW5kOiB0cnVlLCAvLyBXZSBhbHdheXMgYXBwZW5kIGZvciBlbWFpbCBwdXNoZXJzIHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gc3RvcCBvdGhlciBhY2NvdW50cyBub3RpZnlpbmcgdG8gdGhlIHNhbWUgZW1haWwgYWRkcmVzc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlbWFpbFB1c2hlciA9IHRoaXMuZ2V0RW1haWxQdXNoZXIodGhpcy5zdGF0ZS5wdXNoZXJzLCBhZGRyZXNzKTtcbiAgICAgICAgICAgIGVtYWlsUHVzaGVyLmtpbmQgPSBudWxsO1xuICAgICAgICAgICAgZW1haWxQdXNoZXJQcm9taXNlID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLnNldFB1c2hlcihlbWFpbFB1c2hlcik7XG4gICAgICAgIH1cbiAgICAgICAgZW1haWxQdXNoZXJQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRXJyb3Igc2F2aW5nIGVtYWlsIG5vdGlmaWNhdGlvbiBwcmVmZXJlbmNlcycsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRXJyb3Igc2F2aW5nIGVtYWlsIG5vdGlmaWNhdGlvbiBwcmVmZXJlbmNlcycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbHN0IHNhdmluZyB5b3VyIGVtYWlsIG5vdGlmaWNhdGlvbiBwcmVmZXJlbmNlcy4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb25Ob3RpZlN0YXRlQnV0dG9uQ2xpY2tlZCA9IChldmVudCkgPT4ge1xuICAgICAgICAvLyBGSVhNRTogdXNlIC5iaW5kKCkgcmF0aGVyIHRoYW4gY2xhc3NOYW1lIG1ldGFkYXRhIGhlcmUgc3VyZWx5XG4gICAgICAgIGNvbnN0IHZlY3RvclJ1bGVJZCA9IGV2ZW50LnRhcmdldC5jbGFzc05hbWUuc3BsaXQoXCItXCIpWzBdO1xuICAgICAgICBjb25zdCBuZXdQdXNoUnVsZVZlY3RvclN0YXRlID0gZXZlbnQudGFyZ2V0LmNsYXNzTmFtZS5zcGxpdChcIi1cIilbMV07XG5cbiAgICAgICAgaWYgKFwiX2tleXdvcmRzXCIgPT09IHZlY3RvclJ1bGVJZCkge1xuICAgICAgICAgICAgdGhpcy5fc2V0S2V5d29yZHNQdXNoUnVsZVZlY3RvclN0YXRlKG5ld1B1c2hSdWxlVmVjdG9yU3RhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcnVsZSA9IHRoaXMuZ2V0UnVsZSh2ZWN0b3JSdWxlSWQpO1xuICAgICAgICAgICAgaWYgKHJ1bGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRQdXNoUnVsZVZlY3RvclN0YXRlKHJ1bGUsIG5ld1B1c2hSdWxlVmVjdG9yU3RhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uS2V5d29yZHNDbGlja2VkID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGtleXdvcmRzIGxpc3QgdG8gZGlzcGxheVxuICAgICAgICBsZXQga2V5d29yZHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHRoaXMuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gdGhpcy5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMucnVsZXNbaV07XG4gICAgICAgICAgICBrZXl3b3Jkcy5wdXNoKHJ1bGUucGF0dGVybik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleXdvcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gQXMga2VlcGluZyB0aGUgb3JkZXIgb2YgcGVyLXdvcmQgcHVzaCBydWxlcyBocyBzaWRlIGlzIGEgYml0IHRyaWNreSB0byBjb2RlLFxuICAgICAgICAgICAgLy8gZGlzcGxheSB0aGUga2V5d29yZHMgaW4gYWxwaGFiZXRpY2FsIG9yZGVyIHRvIHRoZSB1c2VyXG4gICAgICAgICAgICBrZXl3b3Jkcy5zb3J0KCk7XG5cbiAgICAgICAgICAgIGtleXdvcmRzID0ga2V5d29yZHMuam9pbihcIiwgXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5d29yZHMgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgVGV4dElucHV0RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuVGV4dElucHV0RGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdLZXl3b3JkcyBEaWFsb2cnLCAnJywgVGV4dElucHV0RGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoJ0tleXdvcmRzJyksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoJ0VudGVyIGtleXdvcmRzIHNlcGFyYXRlZCBieSBhIGNvbW1hOicpLFxuICAgICAgICAgICAgYnV0dG9uOiBfdCgnT0snKSxcbiAgICAgICAgICAgIHZhbHVlOiBrZXl3b3JkcyxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChzaG91bGRMZWF2ZSwgbmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTGVhdmUgJiYgbmV3VmFsdWUgIT09IGtleXdvcmRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdLZXl3b3JkcyA9IG5ld1ZhbHVlLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiBuZXdLZXl3b3Jkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3S2V5d29yZHNbaV0gPSBuZXdLZXl3b3Jkc1tpXS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBhbmQgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgbmV3S2V5d29yZHMgPSBuZXdLZXl3b3Jkcy5yZWR1Y2UoZnVuY3Rpb24oYXJyYXksIGtleXdvcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXl3b3JkICE9PSBcIlwiICYmIGFycmF5LmluZGV4T2Yoa2V5d29yZCkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaChrZXl3b3JkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEtleXdvcmRzKG5ld0tleXdvcmRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZ2V0UnVsZSh2ZWN0b3JSdWxlSWQpIHtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHRoaXMuc3RhdGUudmVjdG9yUHVzaFJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gdGhpcy5zdGF0ZS52ZWN0b3JQdXNoUnVsZXNbaV07XG4gICAgICAgICAgICBpZiAocnVsZS52ZWN0b3JSdWxlSWQgPT09IHZlY3RvclJ1bGVJZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBydWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3NldFB1c2hSdWxlVmVjdG9yU3RhdGUocnVsZSwgbmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZSkge1xuICAgICAgICBpZiAocnVsZSAmJiBydWxlLnZlY3RvclN0YXRlICE9PSBuZXdQdXNoUnVsZVZlY3RvclN0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwaGFzZTogTm90aWZpY2F0aW9ucy5waGFzZXMuTE9BRElORyxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IGRlZmVycmVkcyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgcnVsZURlZmluaXRpb24gPSBWZWN0b3JQdXNoUnVsZXNEZWZpbml0aW9uc1tydWxlLnZlY3RvclJ1bGVJZF07XG5cbiAgICAgICAgICAgIGlmIChydWxlLnJ1bGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3Rpb25zID0gcnVsZURlZmluaXRpb24udmVjdG9yU3RhdGVUb0FjdGlvbnNbbmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZV07XG5cbiAgICAgICAgICAgICAgICBpZiAoIWFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG5ldyBzdGF0ZSBjb3JyZXNwb25kcyB0byBkaXNhYmxpbmcgdGhlIHJ1bGUuXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkcy5wdXNoKGNsaS5zZXRQdXNoUnVsZUVuYWJsZWQoJ2dsb2JhbCcsIHJ1bGUucnVsZS5raW5kLCBydWxlLnJ1bGUucnVsZV9pZCwgZmFsc2UpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgbmV3IHN0YXRlIGNvcnJlc3BvbmRzIHRvIGVuYWJsaW5nIHRoZSBydWxlIGFuZCBzZXR0aW5nIHNwZWNpZmljIGFjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRzLnB1c2godGhpcy5fdXBkYXRlUHVzaFJ1bGVBY3Rpb25zKHJ1bGUucnVsZSwgYWN0aW9ucywgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgUHJvbWlzZS5hbGwoZGVmZXJyZWRzKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlZnJlc2hGcm9tU2VydmVyKCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBjaGFuZ2Ugc2V0dGluZ3M6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byBjaGFuZ2Ugc2V0dGluZ3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdGYWlsZWQgdG8gY2hhbmdlIHNldHRpbmdzJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVycm9yICYmIGVycm9yLm1lc3NhZ2UpID8gZXJyb3IubWVzc2FnZSA6IF90KCdPcGVyYXRpb24gZmFpbGVkJykpLFxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiBzZWxmLl9yZWZyZXNoRnJvbVNlcnZlcixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3NldEtleXdvcmRzUHVzaFJ1bGVWZWN0b3JTdGF0ZShuZXdQdXNoUnVsZVZlY3RvclN0YXRlKSB7XG4gICAgICAgIC8vIElzIHRoZXJlIHJlYWxseSBhIGNoYW5nZT9cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnZlY3RvclN0YXRlID09PSBuZXdQdXNoUnVsZVZlY3RvclN0YXRlXG4gICAgICAgICAgICB8fCB0aGlzLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy5ydWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogTm90aWZpY2F0aW9ucy5waGFzZXMuTE9BRElORyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGFsbCBydWxlcyBpbiBzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlc1xuICAgICAgICBjb25zdCBkZWZlcnJlZHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHRoaXMuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gdGhpcy5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMucnVsZXNbaV07XG5cbiAgICAgICAgICAgIGxldCBlbmFibGVkOyBsZXQgYWN0aW9ucztcbiAgICAgICAgICAgIHN3aXRjaCAobmV3UHVzaFJ1bGVWZWN0b3JTdGF0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PTjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUuYWN0aW9ucy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnMgPSBQdXNoUnVsZVZlY3RvclN0YXRlLmFjdGlvbnNGb3IoUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PTik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMudmVjdG9yU3RhdGUgPT09IFB1c2hSdWxlVmVjdG9yU3RhdGUuT0ZGKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgUHVzaFJ1bGVWZWN0b3JTdGF0ZS5MT1VEOlxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZS5hY3Rpb25zLmxlbmd0aCAhPT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9ucyA9IFB1c2hSdWxlVmVjdG9yU3RhdGUuYWN0aW9uc0ZvcihQdXNoUnVsZVZlY3RvclN0YXRlLkxPVUQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnZlY3RvclN0YXRlID09PSBQdXNoUnVsZVZlY3RvclN0YXRlLk9GRikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFB1c2hSdWxlVmVjdG9yU3RhdGUuT0ZGOlxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWN0aW9ucykge1xuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB0aGUgd29ya2Fyb3VuZCBpbiBfdXBkYXRlUHVzaFJ1bGVBY3Rpb25zIHdpbGwgYXV0b21hdGljYWxseVxuICAgICAgICAgICAgICAgIC8vIGVuYWJsZSB0aGUgcnVsZVxuICAgICAgICAgICAgICAgIGRlZmVycmVkcy5wdXNoKHRoaXMuX3VwZGF0ZVB1c2hSdWxlQWN0aW9ucyhydWxlLCBhY3Rpb25zLCBlbmFibGVkKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVuYWJsZWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWRzLnB1c2goY2xpLnNldFB1c2hSdWxlRW5hYmxlZCgnZ2xvYmFsJywgcnVsZS5raW5kLCBydWxlLnJ1bGVfaWQsIGVuYWJsZWQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIFByb21pc2UuYWxsKGRlZmVycmVkcykudGhlbihmdW5jdGlvbihyZXNwcykge1xuICAgICAgICAgICAgc2VsZi5fcmVmcmVzaEZyb21TZXJ2ZXIoKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgdXBkYXRlIHVzZXIgbm90aWZpY2F0aW9uIHNldHRpbmdzOiBcIiArIGVycm9yKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0NhblxcJ3QgdXBkYXRlIHVzZXIgbm90aWZjYXRpb24gc2V0dGluZ3MnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0NhblxcJ3QgdXBkYXRlIHVzZXIgbm90aWZpY2F0aW9uIHNldHRpbmdzJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgPyBlcnJvci5tZXNzYWdlIDogX3QoJ09wZXJhdGlvbiBmYWlsZWQnKSksXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZDogc2VsZi5fcmVmcmVzaEZyb21TZXJ2ZXIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3NldEtleXdvcmRzKG5ld0tleXdvcmRzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IE5vdGlmaWNhdGlvbnMucGhhc2VzLkxPQURJTkcsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJlbW92ZURlZmVycmVkcyA9IFtdO1xuXG4gICAgICAgIC8vIFJlbW92ZSBwZXItd29yZCBwdXNoIHJ1bGVzIG9mIGtleXdvcmRzIHRoYXQgYXJlIG5vIG1vcmUgaW4gdGhlIGxpc3RcbiAgICAgICAgY29uc3QgdmVjdG9yQ29udGVudFJ1bGVzUGF0dGVybnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHNlbGYuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gc2VsZi5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMucnVsZXNbaV07XG5cbiAgICAgICAgICAgIHZlY3RvckNvbnRlbnRSdWxlc1BhdHRlcm5zLnB1c2gocnVsZS5wYXR0ZXJuKTtcblxuICAgICAgICAgICAgaWYgKG5ld0tleXdvcmRzLmluZGV4T2YocnVsZS5wYXR0ZXJuKSA8IDApIHtcbiAgICAgICAgICAgICAgICByZW1vdmVEZWZlcnJlZHMucHVzaChjbGkuZGVsZXRlUHVzaFJ1bGUoJ2dsb2JhbCcsIHJ1bGUua2luZCwgcnVsZS5ydWxlX2lkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUga2V5d29yZCBpcyBwYXJ0IG9mIGBleHRlcm5hbENvbnRlbnRSdWxlc2AsIHJlbW92ZSB0aGUgcnVsZVxuICAgICAgICAvLyBiZWZvcmUgcmVjcmVhdGluZyBpdCBpbiB0aGUgcmlnaHQgVmVjdG9yIHBhdGhcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHNlbGYuc3RhdGUuZXh0ZXJuYWxDb250ZW50UnVsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBzZWxmLnN0YXRlLmV4dGVybmFsQ29udGVudFJ1bGVzW2ldO1xuXG4gICAgICAgICAgICBpZiAobmV3S2V5d29yZHMuaW5kZXhPZihydWxlLnBhdHRlcm4pID49IDApIHtcbiAgICAgICAgICAgICAgICByZW1vdmVEZWZlcnJlZHMucHVzaChjbGkuZGVsZXRlUHVzaFJ1bGUoJ2dsb2JhbCcsIHJ1bGUua2luZCwgcnVsZS5ydWxlX2lkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvbkVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHVwZGF0ZSBrZXl3b3JkczogXCIgKyBlcnJvcik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gdXBkYXRlIGtleXdvcmRzJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdGYWlsZWQgdG8gdXBkYXRlIGtleXdvcmRzJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgPyBlcnJvci5tZXNzYWdlIDogX3QoJ09wZXJhdGlvbiBmYWlsZWQnKSksXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZDogc2VsZi5fcmVmcmVzaEZyb21TZXJ2ZXIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUaGVuLCBhZGQgdGhlIG5ldyBvbmVzXG4gICAgICAgIFByb21pc2UuYWxsKHJlbW92ZURlZmVycmVkcykudGhlbihmdW5jdGlvbihyZXNwcykge1xuICAgICAgICAgICAgY29uc3QgZGVmZXJyZWRzID0gW107XG5cbiAgICAgICAgICAgIGxldCBwdXNoUnVsZVZlY3RvclN0YXRlS2luZCA9IHNlbGYuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnZlY3RvclN0YXRlO1xuICAgICAgICAgICAgaWYgKHB1c2hSdWxlVmVjdG9yU3RhdGVLaW5kID09PSBQdXNoUnVsZVZlY3RvclN0YXRlLk9GRikge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gdGhlIGN1cnJlbnQgZ2xvYmFsIGtleXdvcmRzIHJ1bGUgaXMgT0ZGLCB3ZSBuZWVkIHRvIGxvb2sgYXRcbiAgICAgICAgICAgICAgICAvLyB0aGUgZmxhdm9yIG9mIHJ1bGVzIGluICd2ZWN0b3JDb250ZW50UnVsZXMnIHRvIGFwcGx5IHRoZSBzYW1lIGFjdGlvbnNcbiAgICAgICAgICAgICAgICAvLyB3aGVuIGNyZWF0aW5nIHRoZSBuZXcgcnVsZS5cbiAgICAgICAgICAgICAgICAvLyBUaHVzLCB0aGlzIG5ldyBydWxlIHdpbGwgam9pbiB0aGUgJ3ZlY3RvckNvbnRlbnRSdWxlcycgc2V0LlxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy5ydWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVzaFJ1bGVWZWN0b3JTdGF0ZUtpbmQgPSBQdXNoUnVsZVZlY3RvclN0YXRlLmNvbnRlbnRSdWxlVmVjdG9yU3RhdGVLaW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGF0ZS52ZWN0b3JDb250ZW50UnVsZXMucnVsZXNbMF0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gT04gaXMgZGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICBwdXNoUnVsZVZlY3RvclN0YXRlS2luZCA9IFB1c2hSdWxlVmVjdG9yU3RhdGUuT047XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGkgaW4gbmV3S2V5d29yZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXl3b3JkID0gbmV3S2V5d29yZHNbaV07XG5cbiAgICAgICAgICAgICAgICBpZiAodmVjdG9yQ29udGVudFJ1bGVzUGF0dGVybnMuaW5kZXhPZihrZXl3b3JkKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLnZlY3RvclN0YXRlICE9PSBQdXNoUnVsZVZlY3RvclN0YXRlLk9GRikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRzLnB1c2goY2xpLmFkZFB1c2hSdWxlKCdnbG9iYWwnLCAnY29udGVudCcsIGtleXdvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBQdXNoUnVsZVZlY3RvclN0YXRlLmFjdGlvbnNGb3IocHVzaFJ1bGVWZWN0b3JTdGF0ZUtpbmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IGtleXdvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZHMucHVzaChzZWxmLl9hZGREaXNhYmxlZFB1c2hSdWxlKCdnbG9iYWwnLCAnY29udGVudCcsIGtleXdvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnM6IFB1c2hSdWxlVmVjdG9yU3RhdGUuYWN0aW9uc0ZvcihwdXNoUnVsZVZlY3RvclN0YXRlS2luZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuOiBrZXl3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBQcm9taXNlLmFsbChkZWZlcnJlZHMpLnRoZW4oZnVuY3Rpb24ocmVzcHMpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9yZWZyZXNoRnJvbVNlcnZlcigpO1xuICAgICAgICAgICAgfSwgb25FcnJvcik7XG4gICAgICAgIH0sIG9uRXJyb3IpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIHB1c2ggcnVsZSBidXQgZGlzYWJsZWRcbiAgICBfYWRkRGlzYWJsZWRQdXNoUnVsZShzY29wZSwga2luZCwgcnVsZUlkLCBib2R5KSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgcmV0dXJuIGNsaS5hZGRQdXNoUnVsZShzY29wZSwga2luZCwgcnVsZUlkLCBib2R5KS50aGVuKCgpID0+XG4gICAgICAgICAgICBjbGkuc2V0UHVzaFJ1bGVFbmFibGVkKHNjb3BlLCBraW5kLCBydWxlSWQsIGZhbHNlKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhbnkgbGVnYWN5IGltLnZlY3RvciBydWxlcyBuZWVkIHRvIGJlIHBvcnRlZCB0byB0aGUgbmV3IEFQSVxuICAgIC8vIGZvciBvdmVycmlkaW5nIHRoZSBhY3Rpb25zIG9mIGRlZmF1bHQgcnVsZXMuXG4gICAgX3BvcnRSdWxlc1RvTmV3QVBJKHJ1bGVzZXRzKSB7XG4gICAgICAgIGNvbnN0IG5lZWRzVXBkYXRlID0gW107XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtpbmQgaW4gcnVsZXNldHMuZ2xvYmFsKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlc2V0ID0gcnVsZXNldHMuZ2xvYmFsW2tpbmRdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcnVsZSA9IHJ1bGVzZXRbaV07XG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUucnVsZV9pZCBpbiBMRUdBQ1lfUlVMRVMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQb3J0aW5nIGxlZ2FjeSBydWxlXCIsIHJ1bGUpO1xuICAgICAgICAgICAgICAgICAgICBuZWVkc1VwZGF0ZS5wdXNoKCBmdW5jdGlvbihraW5kLCBydWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2xpLnNldFB1c2hSdWxlQWN0aW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywga2luZCwgTEVHQUNZX1JVTEVTW3J1bGUucnVsZV9pZF0sIHBvcnRMZWdhY3lBY3Rpb25zKHJ1bGUuYWN0aW9ucyksXG4gICAgICAgICAgICAgICAgICAgICAgICApLnRoZW4oKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGkuZGVsZXRlUHVzaFJ1bGUoJ2dsb2JhbCcsIGtpbmQsIHJ1bGUucnVsZV9pZCksXG4gICAgICAgICAgICAgICAgICAgICAgICApLmNhdGNoKCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgRXJyb3Igd2hlbiBwb3J0aW5nIGxlZ2FjeSBydWxlOiAke2V9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfShraW5kLCBydWxlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5lZWRzVXBkYXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIElmIHNvbWUgb2YgdGhlIHJ1bGVzIG5lZWQgdG8gYmUgcG9ydGVkIHRoZW4gd2FpdCBmb3IgdGhlIHBvcnRpbmdcbiAgICAgICAgICAgIC8vIHRvIGhhcHBlbiBhbmQgdGhlbiBmZXRjaCB0aGUgcnVsZXMgYWdhaW4uXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwobmVlZHNVcGRhdGUpLnRoZW4oKCkgPT5cbiAgICAgICAgICAgICAgICBjbGkuZ2V0UHVzaFJ1bGVzKCksXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIHJldHVybiB0aGUgcnVsZXMgdGhhdCB3ZSBhbHJlYWR5IGhhdmUuXG4gICAgICAgICAgICByZXR1cm4gcnVsZXNldHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcmVmcmVzaEZyb21TZXJ2ZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zdCBwdXNoUnVsZXNQcm9taXNlID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFB1c2hSdWxlcygpLnRoZW4oXG4gICAgICAgICAgICBzZWxmLl9wb3J0UnVsZXNUb05ld0FQSSxcbiAgICAgICAgKS50aGVuKGZ1bmN0aW9uKHJ1bGVzZXRzKSB7XG4gICAgICAgICAgICAvLy8gWFhYIHNlcmlvdXNseT8gd3RmIGlzIHRoaXM/XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucHVzaFJ1bGVzID0gcnVsZXNldHM7XG5cbiAgICAgICAgICAgIC8vIEdldCBob21lc2VydmVyIGRlZmF1bHQgcnVsZXMgYW5kIHRyaWFnZSB0aGVtIGJ5IGNhdGVnb3JpZXNcbiAgICAgICAgICAgIGNvbnN0IHJ1bGVDYXRlZ29yaWVzID0ge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBtYXN0ZXIgcnVsZSAoYWxsIG5vdGlmaWNhdGlvbnMgZGlzYWJsaW5nKVxuICAgICAgICAgICAgICAgICcubS5ydWxlLm1hc3Rlcic6ICdtYXN0ZXInLFxuXG4gICAgICAgICAgICAgICAgLy8gVGhlIGRlZmF1bHQgcHVzaCBydWxlcyBkaXNwbGF5ZWQgYnkgVmVjdG9yIFVJXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuY29udGFpbnNfZGlzcGxheV9uYW1lJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuY29udGFpbnNfdXNlcl9uYW1lJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUucm9vbW5vdGlmJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUucm9vbV9vbmVfdG9fb25lJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuZW5jcnlwdGVkX3Jvb21fb25lX3RvX29uZSc6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLm1lc3NhZ2UnOiAndmVjdG9yJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5lbmNyeXB0ZWQnOiAndmVjdG9yJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5pbnZpdGVfZm9yX21lJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgLy8nLm0ucnVsZS5tZW1iZXJfZXZlbnQnOiAndmVjdG9yJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5jYWxsJzogJ3ZlY3RvcicsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuc3VwcHJlc3Nfbm90aWNlcyc6ICd2ZWN0b3InLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLnRvbWJzdG9uZSc6ICd2ZWN0b3InLFxuXG4gICAgICAgICAgICAgICAgLy8gT3RoZXJzIGdvIHRvIG90aGVyc1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gSFMgZGVmYXVsdCBydWxlc1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFJ1bGVzID0ge21hc3RlcjogW10sIHZlY3Rvcjoge30sIG90aGVyczogW119O1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtpbmQgaW4gcnVsZXNldHMuZ2xvYmFsKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBPYmplY3Qua2V5cyhydWxlc2V0cy5nbG9iYWxba2luZF0pLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBydWxlc2V0cy5nbG9iYWxba2luZF1baV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdCA9IHJ1bGVDYXRlZ29yaWVzW3IucnVsZV9pZF07XG4gICAgICAgICAgICAgICAgICAgIHIua2luZCA9IGtpbmQ7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHIucnVsZV9pZFswXSA9PT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ID09PSAndmVjdG9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRSdWxlcy52ZWN0b3Jbci5ydWxlX2lkXSA9IHI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNhdCA9PT0gJ21hc3RlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UnVsZXMubWFzdGVyLnB1c2gocik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRSdWxlc1snb3RoZXJzJ10ucHVzaChyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gR2V0IHRoZSBtYXN0ZXIgcnVsZSBpZiBhbnkgZGVmaW5lZCBieSB0aGUgaHNcbiAgICAgICAgICAgIGlmIChkZWZhdWx0UnVsZXMubWFzdGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnN0YXRlLm1hc3RlclB1c2hSdWxlID0gZGVmYXVsdFJ1bGVzLm1hc3RlclswXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcGFyc2UgdGhlIGtleXdvcmQgcnVsZXMgaW50byBvdXIgc3RhdGVcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRSdWxlcyA9IENvbnRlbnRSdWxlcy5wYXJzZUNvbnRlbnRSdWxlcyhydWxlc2V0cyk7XG4gICAgICAgICAgICBzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcyA9IHtcbiAgICAgICAgICAgICAgICB2ZWN0b3JTdGF0ZTogY29udGVudFJ1bGVzLnZlY3RvclN0YXRlLFxuICAgICAgICAgICAgICAgIHJ1bGVzOiBjb250ZW50UnVsZXMucnVsZXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VsZi5zdGF0ZS5leHRlcm5hbENvbnRlbnRSdWxlcyA9IGNvbnRlbnRSdWxlcy5leHRlcm5hbFJ1bGVzO1xuXG4gICAgICAgICAgICAvLyBCdWlsZCB0aGUgcnVsZXMgZGlzcGxheWVkIGluIHRoZSBWZWN0b3IgVUkgbWF0cml4IHRhYmxlXG4gICAgICAgICAgICBzZWxmLnN0YXRlLnZlY3RvclB1c2hSdWxlcyA9IFtdO1xuICAgICAgICAgICAgc2VsZi5zdGF0ZS5leHRlcm5hbFB1c2hSdWxlcyA9IFtdO1xuXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3JSdWxlSWRzID0gW1xuICAgICAgICAgICAgICAgICcubS5ydWxlLmNvbnRhaW5zX2Rpc3BsYXlfbmFtZScsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuY29udGFpbnNfdXNlcl9uYW1lJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5yb29tbm90aWYnLFxuICAgICAgICAgICAgICAgICdfa2V5d29yZHMnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLnJvb21fb25lX3RvX29uZScsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuZW5jcnlwdGVkX3Jvb21fb25lX3RvX29uZScsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUubWVzc2FnZScsXG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUuZW5jcnlwdGVkJyxcbiAgICAgICAgICAgICAgICAnLm0ucnVsZS5pbnZpdGVfZm9yX21lJyxcbiAgICAgICAgICAgICAgICAvLydpbS52ZWN0b3IucnVsZS5tZW1iZXJfZXZlbnQnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLmNhbGwnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLnN1cHByZXNzX25vdGljZXMnLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLnRvbWJzdG9uZScsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpIGluIHZlY3RvclJ1bGVJZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ZWN0b3JSdWxlSWQgPSB2ZWN0b3JSdWxlSWRzW2ldO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZlY3RvclJ1bGVJZCA9PT0gJ19rZXl3b3JkcycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8ga2V5d29yZHMgbmVlZHMgYSBzcGVjaWFsIGhhbmRsaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBWZWN0b3IgVUksIHRoaXMgaXMgYSBzaW5nbGUgZ2xvYmFsIHB1c2ggcnVsZSBidXQgdHJhbnNsYXRlZCBpbiBNYXRyaXgsXG4gICAgICAgICAgICAgICAgICAgIC8vIGl0IGNvcnJlc3BvbmRzIHRvIGFsbCBjb250ZW50IHB1c2ggcnVsZXMgKHN0b3JlZCBpbiBzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlKVxuICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXRlLnZlY3RvclB1c2hSdWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidmVjdG9yUnVsZUlkXCI6IFwiX2tleXdvcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NyaXB0aW9uXCI6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnTWVzc2FnZXMgY29udGFpbmluZyA8c3Bhbj5rZXl3b3Jkczwvc3Bhbj4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ICdzcGFuJzogKHN1YikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTm90aWZTZXR0aW5nc19rZXl3b3Jkc1wiIG9uQ2xpY2s9eyBzZWxmLm9uS2V5d29yZHNDbGlja2VkIH0+e3N1Yn08L3NwYW4+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2ZWN0b3JTdGF0ZVwiOiBzZWxmLnN0YXRlLnZlY3RvckNvbnRlbnRSdWxlcy52ZWN0b3JTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcnVsZURlZmluaXRpb24gPSBWZWN0b3JQdXNoUnVsZXNEZWZpbml0aW9uc1t2ZWN0b3JSdWxlSWRdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBydWxlID0gZGVmYXVsdFJ1bGVzLnZlY3Rvclt2ZWN0b3JSdWxlSWRdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZlY3RvclN0YXRlID0gcnVsZURlZmluaXRpb24ucnVsZVRvVmVjdG9yU3RhdGUocnVsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlJlZnJlc2hpbmcgdmVjdG9yUHVzaFJ1bGVzIGZvciBcIiArIHZlY3RvclJ1bGVJZCArXCIsIFwiKyBydWxlRGVmaW5pdGlvbi5kZXNjcmlwdGlvbiArXCIsIFwiICsgcnVsZSArXCIsIFwiICsgdmVjdG9yU3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc3RhdGUudmVjdG9yUHVzaFJ1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2ZWN0b3JSdWxlSWRcIjogdmVjdG9yUnVsZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBfdChydWxlRGVmaW5pdGlvbi5kZXNjcmlwdGlvbiksIC8vIFRleHQgZnJvbSBWZWN0b3JQdXNoUnVsZXNEZWZpbml0aW9ucy5qc1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJydWxlXCI6IHJ1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInZlY3RvclN0YXRlXCI6IHZlY3RvclN0YXRlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSB3YXMgYSBydWxlIHdoaWNoIHdlIGNvdWxkbid0IHBhcnNlLCBhZGQgaXQgdG8gdGhlIGV4dGVybmFsIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUgJiYgIXZlY3RvclN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLmRlc2NyaXB0aW9uID0gcnVsZURlZmluaXRpb24uZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXRlLmV4dGVybmFsUHVzaFJ1bGVzLnB1c2gocnVsZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEJ1aWxkIHRoZSBydWxlcyBub3QgbWFuYWdlZCBieSBWZWN0b3IgVUlcbiAgICAgICAgICAgIGNvbnN0IG90aGVyUnVsZXNEZXNjcmlwdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgJy5tLnJ1bGUubWVzc2FnZSc6IF90KCdOb3RpZnkgZm9yIGFsbCBvdGhlciBtZXNzYWdlcy9yb29tcycpLFxuICAgICAgICAgICAgICAgICcubS5ydWxlLmZhbGxiYWNrJzogX3QoJ05vdGlmeSBtZSBmb3IgYW55dGhpbmcgZWxzZScpLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBpIGluIGRlZmF1bHRSdWxlcy5vdGhlcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBydWxlID0gZGVmYXVsdFJ1bGVzLm90aGVyc1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBydWxlRGVzY3JpcHRpb24gPSBvdGhlclJ1bGVzRGVzY3JpcHRpb25zW3J1bGUucnVsZV9pZF07XG5cbiAgICAgICAgICAgICAgICAvLyBTaG93IGVuYWJsZWQgZGVmYXVsdCBydWxlcyB0aGF0IHdhcyBtb2RpZmllZCBieSB0aGUgdXNlclxuICAgICAgICAgICAgICAgIGlmIChydWxlRGVzY3JpcHRpb24gJiYgcnVsZS5lbmFibGVkICYmICFydWxlLmRlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5kZXNjcmlwdGlvbiA9IHJ1bGVEZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zdGF0ZS5leHRlcm5hbFB1c2hSdWxlcy5wdXNoKHJ1bGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcHVzaGVyc1Byb21pc2UgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHVzaGVycygpLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7cHVzaGVyczogcmVzcC5wdXNoZXJzfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFByb21pc2UuYWxsKFtwdXNoUnVsZXNQcm9taXNlLCBwdXNoZXJzUHJvbWlzZV0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwaGFzZTogTm90aWZpY2F0aW9ucy5waGFzZXMuRElTUExBWSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwaGFzZTogTm90aWZpY2F0aW9ucy5waGFzZXMuRVJST1IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAvLyBhY3R1YWxseSBleHBsaWNpdGx5IHVwZGF0ZSBvdXIgc3RhdGUgIGhhdmluZyBiZWVuIGRlZXAtbWFuaXB1bGF0aW5nIGl0XG4gICAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBtYXN0ZXJQdXNoUnVsZTogc2VsZi5zdGF0ZS5tYXN0ZXJQdXNoUnVsZSxcbiAgICAgICAgICAgICAgICB2ZWN0b3JDb250ZW50UnVsZXM6IHNlbGYuc3RhdGUudmVjdG9yQ29udGVudFJ1bGVzLFxuICAgICAgICAgICAgICAgIHZlY3RvclB1c2hSdWxlczogc2VsZi5zdGF0ZS52ZWN0b3JQdXNoUnVsZXMsXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxDb250ZW50UnVsZXM6IHNlbGYuc3RhdGUuZXh0ZXJuYWxDb250ZW50UnVsZXMsXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxQdXNoUnVsZXM6IHNlbGYuc3RhdGUuZXh0ZXJuYWxQdXNoUnVsZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFRocmVlUGlkcygpLnRoZW4oKHIpID0+IHRoaXMuc2V0U3RhdGUoe3RocmVlcGlkczogci50aHJlZXBpZHN9KSk7XG4gICAgfTtcblxuICAgIF9vbkNsZWFyTm90aWZpY2F0aW9ucyA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIGNsaS5nZXRSb29tcygpLmZvckVhY2gociA9PiB7XG4gICAgICAgICAgICBpZiAoci5nZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCgpID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IHIuZ2V0TGl2ZVRpbWVsaW5lKCkuZ2V0RXZlbnRzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cy5sZW5ndGgpIGNsaS5zZW5kUmVhZFJlY2VpcHQoZXZlbnRzLnBvcCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF91cGRhdGVQdXNoUnVsZUFjdGlvbnMocnVsZSwgYWN0aW9ucywgZW5hYmxlZCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgcmV0dXJuIGNsaS5zZXRQdXNoUnVsZUFjdGlvbnMoXG4gICAgICAgICAgICAnZ2xvYmFsJywgcnVsZS5raW5kLCBydWxlLnJ1bGVfaWQsIGFjdGlvbnMsXG4gICAgICAgICkudGhlbiggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBUaGVuLCBpZiByZXF1ZXN0ZWQsIGVuYWJsZWQgb3IgZGlzYWJsZWQgdGhlIHJ1bGVcbiAgICAgICAgICAgIGlmICh1bmRlZmluZWQgIT0gZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGkuc2V0UHVzaFJ1bGVFbmFibGVkKFxuICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywgcnVsZS5raW5kLCBydWxlLnJ1bGVfaWQsIGVuYWJsZWQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyTm90aWZSdWxlc1RhYmxlUm93KHRpdGxlLCBjbGFzc05hbWUsIHB1c2hSdWxlVmVjdG9yU3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDx0ciBrZXk9eyBjbGFzc05hbWUgfT5cbiAgICAgICAgICAgICAgICA8dGg+XG4gICAgICAgICAgICAgICAgICAgIHsgdGl0bGUgfVxuICAgICAgICAgICAgICAgIDwvdGg+XG5cbiAgICAgICAgICAgICAgICA8dGg+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9IHtjbGFzc05hbWUgKyBcIi1cIiArIFB1c2hSdWxlVmVjdG9yU3RhdGUuT0ZGfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9eyBwdXNoUnVsZVZlY3RvclN0YXRlID09PSBQdXNoUnVsZVZlY3RvclN0YXRlLk9GRiB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17IHRoaXMub25Ob3RpZlN0YXRlQnV0dG9uQ2xpY2tlZCB9IC8+XG4gICAgICAgICAgICAgICAgPC90aD5cblxuICAgICAgICAgICAgICAgIDx0aD5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT0ge2NsYXNzTmFtZSArIFwiLVwiICsgUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PTn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJyYWRpb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXsgcHVzaFJ1bGVWZWN0b3JTdGF0ZSA9PT0gUHVzaFJ1bGVWZWN0b3JTdGF0ZS5PTiB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17IHRoaXMub25Ob3RpZlN0YXRlQnV0dG9uQ2xpY2tlZCB9IC8+XG4gICAgICAgICAgICAgICAgPC90aD5cblxuICAgICAgICAgICAgICAgIDx0aD5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT0ge2NsYXNzTmFtZSArIFwiLVwiICsgUHVzaFJ1bGVWZWN0b3JTdGF0ZS5MT1VEfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9eyBwdXNoUnVsZVZlY3RvclN0YXRlID09PSBQdXNoUnVsZVZlY3RvclN0YXRlLkxPVUQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyB0aGlzLm9uTm90aWZTdGF0ZUJ1dHRvbkNsaWNrZWQgfSAvPlxuICAgICAgICAgICAgICAgIDwvdGg+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlck5vdGlmUnVsZXNUYWJsZVJvd3MoKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHRoaXMuc3RhdGUudmVjdG9yUHVzaFJ1bGVzKSB7XG4gICAgICAgICAgICBjb25zdCBydWxlID0gdGhpcy5zdGF0ZS52ZWN0b3JQdXNoUnVsZXNbaV07XG4gICAgICAgICAgICBpZiAocnVsZS5ydWxlID09PSB1bmRlZmluZWQgJiYgcnVsZS52ZWN0b3JSdWxlSWQuc3RhcnRzV2l0aChcIi5tLlwiKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgU2tpcHBpbmcgcmVuZGVyIG9mIHJ1bGUgJHtydWxlLnZlY3RvclJ1bGVJZH0gZHVlIHRvIG5vIHVuZGVybHlpbmcgcnVsZWApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcInJlbmRlcmluZzogXCIgKyBydWxlLmRlc2NyaXB0aW9uICsgXCIsIFwiICsgcnVsZS52ZWN0b3JSdWxlSWQgKyBcIiwgXCIgKyBydWxlLnZlY3RvclN0YXRlKTtcbiAgICAgICAgICAgIHJvd3MucHVzaCh0aGlzLnJlbmRlck5vdGlmUnVsZXNUYWJsZVJvdyhydWxlLmRlc2NyaXB0aW9uLCBydWxlLnZlY3RvclJ1bGVJZCwgcnVsZS52ZWN0b3JTdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByb3dzO1xuICAgIH1cblxuICAgIGhhc0VtYWlsUHVzaGVyKHB1c2hlcnMsIGFkZHJlc3MpIHtcbiAgICAgICAgaWYgKHB1c2hlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHVzaGVycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHB1c2hlcnNbaV0ua2luZCA9PT0gJ2VtYWlsJyAmJiBwdXNoZXJzW2ldLnB1c2hrZXkgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZW1haWxOb3RpZmljYXRpb25zUm93KGFkZHJlc3MsIGxhYmVsKSB7XG4gICAgICAgIHJldHVybiA8TGFiZWxsZWRUb2dnbGVTd2l0Y2ggdmFsdWU9e3RoaXMuaGFzRW1haWxQdXNoZXIodGhpcy5zdGF0ZS5wdXNoZXJzLCBhZGRyZXNzKX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRW5hYmxlRW1haWxOb3RpZmljYXRpb25zQ2hhbmdlLmJpbmQodGhpcywgYWRkcmVzcyl9XG4gICAgICAgICAgICBsYWJlbD17bGFiZWx9IGtleT17YGVtYWlsTm90aWZfJHtsYWJlbH1gfSAvPjtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBzcGlubmVyO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5waGFzZSA9PT0gTm90aWZpY2F0aW9ucy5waGFzZXMuTE9BRElORykge1xuICAgICAgICAgICAgY29uc3QgTG9hZGVyID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLlNwaW5uZXJcIik7XG4gICAgICAgICAgICBzcGlubmVyID0gPExvYWRlciAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtYXN0ZXJQdXNoUnVsZURpdjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWFzdGVyUHVzaFJ1bGUpIHtcbiAgICAgICAgICAgIG1hc3RlclB1c2hSdWxlRGl2ID0gPExhYmVsbGVkVG9nZ2xlU3dpdGNoIHZhbHVlPXshdGhpcy5zdGF0ZS5tYXN0ZXJQdXNoUnVsZS5lbmFibGVkfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRW5hYmxlTm90aWZpY2F0aW9uc0NoYW5nZX1cbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ0VuYWJsZSBub3RpZmljYXRpb25zIGZvciB0aGlzIGFjY291bnQnKX0gLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2xlYXJOb3RpZmljYXRpb25zQnV0dG9uO1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb21zKCkuc29tZShyID0+IHIuZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQoKSA+IDApKSB7XG4gICAgICAgICAgICBjbGVhck5vdGlmaWNhdGlvbnNCdXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkNsZWFyTm90aWZpY2F0aW9uc30ga2luZD0nZGFuZ2VyJz5cbiAgICAgICAgICAgICAgICB7X3QoXCJDbGVhciBub3RpZmljYXRpb25zXCIpfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gZW5hYmxlZCwgdGhlIG1hc3RlciBydWxlIGluaGliaXRzIGFsbCBleGlzdGluZyBydWxlc1xuICAgICAgICAvLyBTbyBkbyBub3Qgc2hvdyBhbGwgbm90aWZpY2F0aW9uIHNldHRpbmdzXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm1hc3RlclB1c2hSdWxlICYmIHRoaXMuc3RhdGUubWFzdGVyUHVzaFJ1bGUuZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7bWFzdGVyUHVzaFJ1bGVEaXZ9XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTm90aWZTZXR0aW5nc19ub3RpZlRhYmxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdBbGwgbm90aWZpY2F0aW9ucyBhcmUgY3VycmVudGx5IGRpc2FibGVkIGZvciBhbGwgdGFyZ2V0cy4nKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIHtjbGVhck5vdGlmaWNhdGlvbnNCdXR0b259XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW1haWxUaHJlZXBpZHMgPSB0aGlzLnN0YXRlLnRocmVlcGlkcy5maWx0ZXIoKHRwKSA9PiB0cC5tZWRpdW0gPT09IFwiZW1haWxcIik7XG4gICAgICAgIGxldCBlbWFpbE5vdGlmaWNhdGlvbnNSb3dzO1xuICAgICAgICBpZiAoZW1haWxUaHJlZXBpZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZW1haWxOb3RpZmljYXRpb25zUm93cyA9IGVtYWlsVGhyZWVwaWRzLm1hcCgodGhyZWVQaWQpID0+IHRoaXMuZW1haWxOb3RpZmljYXRpb25zUm93KFxuICAgICAgICAgICAgICAgIHRocmVlUGlkLmFkZHJlc3MsIGAke190KCdFbmFibGUgZW1haWwgbm90aWZpY2F0aW9ucycpfSAoJHt0aHJlZVBpZC5hZGRyZXNzfSlgLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuVGhpcmRQYXJ0eUlEKSkge1xuICAgICAgICAgICAgZW1haWxOb3RpZmljYXRpb25zUm93cyA9IDxkaXY+XG4gICAgICAgICAgICAgICAgeyBfdCgnQWRkIGFuIGVtYWlsIGFkZHJlc3MgdG8gY29uZmlndXJlIGVtYWlsIG5vdGlmaWNhdGlvbnMnKSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBleHRlcm5hbCBwdXNoIHJ1bGVzXG4gICAgICAgIGNvbnN0IGV4dGVybmFsUnVsZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHRoaXMuc3RhdGUuZXh0ZXJuYWxQdXNoUnVsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSB0aGlzLnN0YXRlLmV4dGVybmFsUHVzaFJ1bGVzW2ldO1xuICAgICAgICAgICAgZXh0ZXJuYWxSdWxlcy5wdXNoKDxsaT57IF90KHJ1bGUuZGVzY3JpcHRpb24pIH08L2xpPik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaG93IGtleXdvcmRzIG5vdCBkaXNwbGF5ZWQgYnkgdGhlIHZlY3RvciBVSSBhcyBhIHNpbmdsZSBleHRlcm5hbCBwdXNoIHJ1bGVcbiAgICAgICAgbGV0IGV4dGVybmFsS2V5d29yZHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIHRoaXMuc3RhdGUuZXh0ZXJuYWxDb250ZW50UnVsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSB0aGlzLnN0YXRlLmV4dGVybmFsQ29udGVudFJ1bGVzW2ldO1xuICAgICAgICAgICAgZXh0ZXJuYWxLZXl3b3Jkcy5wdXNoKHJ1bGUucGF0dGVybik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dGVybmFsS2V5d29yZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBleHRlcm5hbEtleXdvcmRzID0gZXh0ZXJuYWxLZXl3b3Jkcy5qb2luKFwiLCBcIik7XG4gICAgICAgICAgICBleHRlcm5hbFJ1bGVzLnB1c2goPGxpPlxuICAgICAgICAgICAgICAgIHtfdCgnTm90aWZpY2F0aW9ucyBvbiB0aGUgZm9sbG93aW5nIGtleXdvcmRzIGZvbGxvdyBydWxlcyB3aGljaCBjYW7igJl0IGJlIGRpc3BsYXllZCBoZXJlOicpIH1cbiAgICAgICAgICAgICAgICB7IGV4dGVybmFsS2V5d29yZHMgfVxuICAgICAgICAgICAgPC9saT4pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRldmljZXNTZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wdXNoZXJzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRldmljZXNTZWN0aW9uID0gPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiPnsgX3QoJ1VuYWJsZSB0byBmZXRjaCBub3RpZmljYXRpb24gdGFyZ2V0IGxpc3QnKSB9PC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucHVzaGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGRldmljZXNTZWN0aW9uID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE86IEl0IHdvdWxkIGJlIGdyZWF0IHRvIGJlIGFibGUgdG8gZGVsZXRlIHB1c2hlcnMgZnJvbSBoZXJlIHRvbyxcbiAgICAgICAgICAgIC8vIGFuZCB0aGlzIHdvdWxkbid0IGJlIGhhcmQgdG8gYWRkLlxuICAgICAgICAgICAgY29uc3Qgcm93cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0YXRlLnB1c2hlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goPHRyIGtleT17IGkgfT5cbiAgICAgICAgICAgICAgICAgICAgPHRkPnt0aGlzLnN0YXRlLnB1c2hlcnNbaV0uYXBwX2Rpc3BsYXlfbmFtZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+e3RoaXMuc3RhdGUucHVzaGVyc1tpXS5kZXZpY2VfZGlzcGxheV9uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGV2aWNlc1NlY3Rpb24gPSAoPHRhYmxlIGNsYXNzTmFtZT1cIm14X1VzZXJOb3RpZlNldHRpbmdzX2RldmljZXNUYWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAge3Jvd3N9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGV2aWNlc1NlY3Rpb24pIHtcbiAgICAgICAgICAgIGRldmljZXNTZWN0aW9uID0gKDxkaXY+XG4gICAgICAgICAgICAgICAgPGgzPnsgX3QoJ05vdGlmaWNhdGlvbiB0YXJnZXRzJykgfTwvaDM+XG4gICAgICAgICAgICAgICAgeyBkZXZpY2VzU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFkdmFuY2VkU2V0dGluZ3M7XG4gICAgICAgIGlmIChleHRlcm5hbFJ1bGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICBhZHZhbmNlZFNldHRpbmdzID0gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxoMz57IF90KCdBZHZhbmNlZCBub3RpZmljYXRpb24gc2V0dGluZ3MnKSB9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnVGhlcmUgYXJlIGFkdmFuY2VkIG5vdGlmaWNhdGlvbnMgd2hpY2ggYXJlIG5vdCBzaG93biBoZXJlLicpIH08YnIgLz5cbiAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1lvdSBtaWdodCBoYXZlIGNvbmZpZ3VyZWQgdGhlbSBpbiBhIGNsaWVudCBvdGhlciB0aGFuICUoYnJhbmQpcy4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnWW91IGNhbm5vdCB0dW5lIHRoZW0gaW4gJShicmFuZClzIGJ1dCB0aGV5IHN0aWxsIGFwcGx5LicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGJyYW5kIH0sXG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZXh0ZXJuYWxSdWxlcyB9XG4gICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG5cbiAgICAgICAgICAgICAgICB7bWFzdGVyUHVzaFJ1bGVEaXZ9XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJOb3RpZlNldHRpbmdzX25vdGlmVGFibGVcIj5cblxuICAgICAgICAgICAgICAgICAgICB7IHNwaW5uZXIgfVxuXG4gICAgICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaCB2YWx1ZT17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIm5vdGlmaWNhdGlvbnNFbmFibGVkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmFibGVEZXNrdG9wTm90aWZpY2F0aW9uc0NoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnRW5hYmxlIGRlc2t0b3Agbm90aWZpY2F0aW9ucyBmb3IgdGhpcyBzZXNzaW9uJyl9IC8+XG5cbiAgICAgICAgICAgICAgICAgICAgPExhYmVsbGVkVG9nZ2xlU3dpdGNoIHZhbHVlPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibm90aWZpY2F0aW9uQm9keUVuYWJsZWRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkVuYWJsZURlc2t0b3BOb3RpZmljYXRpb25Cb2R5Q2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdTaG93IG1lc3NhZ2UgaW4gZGVza3RvcCBub3RpZmljYXRpb24nKX0gLz5cblxuICAgICAgICAgICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2ggdmFsdWU9e1NldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdWRpb05vdGlmaWNhdGlvbnNFbmFibGVkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmFibGVBdWRpb05vdGlmaWNhdGlvbnNDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ0VuYWJsZSBhdWRpYmxlIG5vdGlmaWNhdGlvbnMgZm9yIHRoaXMgc2Vzc2lvbicpfSAvPlxuXG4gICAgICAgICAgICAgICAgICAgIHsgZW1haWxOb3RpZmljYXRpb25zUm93cyB9XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTm90aWZTZXR0aW5nc19wdXNoUnVsZXNUYWJsZVdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJteF9Vc2VyTm90aWZTZXR0aW5nc19wdXNoUnVsZXNUYWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHdpZHRoPVwiNTUlXCI+PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCB3aWR0aD1cIjE1JVwiPnsgX3QoJ09mZicpIH08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHdpZHRoPVwiMTUlXCI+eyBfdCgnT24nKSB9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCB3aWR0aD1cIjE1JVwiPnsgX3QoJ05vaXN5JykgfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlck5vdGlmUnVsZXNUYWJsZVJvd3MoKSB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgeyBhZHZhbmNlZFNldHRpbmdzIH1cblxuICAgICAgICAgICAgICAgICAgICB7IGRldmljZXNTZWN0aW9uIH1cblxuICAgICAgICAgICAgICAgICAgICB7IGNsZWFyTm90aWZpY2F0aW9uc0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==